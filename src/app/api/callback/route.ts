/**
 * POST /api/callback
 *
 * A visitor on /contact asks to be telephoned. The request is stored as an
 * enquiry in `leads`, exactly as /api/contact stores one (same table, same
 * columns, same consent evidence), so it appears in GIO4X Control with the
 * other enquiries. What marks it is the first line of the message, written
 * here in a fixed form: "Callback requested: <day part>, <time zone> time"
 * (src/lib/callback.ts). No call time is promised by this endpoint or by the
 * page that posts to it.
 *
 *   request   { name, email, phone, country, dayPart, timeZone, topic,
 *               consent: true, website: "" (honeypot), startedAt, page, utm? }
 *   200       { ok: true, reference }
 *   400       { ok: false, error, fields? }   validation, unknown field, bad JSON,
 *                                             or a country GIO4X does not serve
 *   403 / 413 / 415 / 429 / 503               as /api/contact
 *
 * Same protections as /api/contact (docs/SECURITY.md): the gate, the honeypot,
 * the minimum fill time, the per-address limits, the database's own rules.
 * A copy goes to GIO4X's inbox when outgoing e-mail is set up (notifyInbox);
 * a failure there never fails the request.
 *
 * Nothing about a submission is logged except an error code when storage
 * fails: never the name, the number, the address or the IP.
 */
import { CALLBACK_PHONE_RE, CALLBACK_PREFIX, CALLBACK_TOPICS, callbackWhen, isCallbackDayPart, TIME_ZONE_RE, type CallbackDayPart, type CallbackTopic } from "@/lib/callback";
import { restrictedMatch } from "@/lib/restricted";
import { GENERIC_RATE_LIMITED, GENERIC_UNAVAILABLE, PRIVACY_VERSION, UTM_KEYS } from "@/lib/server/constants";
import { fail, json, newId, newReference } from "@/lib/server/http";
import { notifyInbox } from "@/lib/server/mailer";
import { classifyStorageError, honeypotFilled, openGate, submissionAllowed, tooFast } from "@/lib/server/public-form";
import { countForm } from "@/lib/server/pulse";
import { cleanLine, NAME_MAX, normaliseEmail, normalisePath } from "@/lib/server/validate";
import { createPublicSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAVAILABLE = GENERIC_UNAVAILABLE.replace("record your message", "record your request");
const FIELDS = new Set(["name", "email", "phone", "country", "dayPart", "timeZone", "topic", "consent", "website", "startedAt", "page", "utm"]);

/** A name the runtime knows as a time zone, not merely something shaped like one. */
function isTimeZone(value: string): boolean {
  if (value.length > 64 || !TIME_ZONE_RE.test(value)) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** As /api/contact: only the five utm_* keys, short strings; anything else inside `utm` is dropped. */
function readUtm(raw: unknown): Record<string, string> | null {
  const out: Record<string, string> = {};
  if (raw === undefined || raw === null) return out;
  if (typeof raw !== "object" || Array.isArray(raw) || Object.keys(raw).length > 20) return null;
  for (const key of UTM_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (v === undefined || v === null) continue;
    if (typeof v !== "string") return null;
    const value = cleanLine(v).slice(0, 120);
    if (value) out[key] = value;
  }
  return out;
}

export async function POST(request: Request) {
  const gate = await openGate(request, "callback");
  if (!gate.ok) return gate.response;

  // as /api/contact: an automated submission is answered like a person's, and nothing is stored
  if (honeypotFilled(gate.body)) return json({ ok: true, reference: newReference() });

  const raw = gate.body;
  const fields: Record<string, string> = {};
  for (const k of Object.keys(raw)) if (!FIELDS.has(k)) fields[k.replace(/[^A-Za-z0-9_.-]/g, "?").slice(0, 40) || "?"] = "Unexpected field.";

  const name = typeof raw.name === "string" ? cleanLine(raw.name) : "";
  if (!name) fields.name = "Please enter your name.";
  else if (name.length > NAME_MAX) fields.name = `Your name must be ${NAME_MAX} characters or fewer.`;

  const email = normaliseEmail(raw.email);
  if (!email) fields.email = "Please enter a valid email address.";

  const phone = typeof raw.phone === "string" ? cleanLine(raw.phone) : "";
  if (!CALLBACK_PHONE_RE.test(phone) || phone.replace(/[^0-9]/g, "").length < 7) fields.phone = "Please enter your number with its country code, for example +91 98765 43210.";

  const country = typeof raw.country === "string" ? cleanLine(raw.country) : "";
  const refused = country ? restrictedMatch(country) : undefined;
  if (country.length < 2 || country.length > 80) fields.country = "Please enter your country of residence.";
  else if (refused) fields.country = `GIO4X services are not available to residents of ${refused}, so we cannot arrange a call there.`;

  let dayPart: CallbackDayPart = "any";
  if (isCallbackDayPart(raw.dayPart)) dayPart = raw.dayPart;
  else fields.dayPart = "Please choose a part of the day.";

  const timeZone = typeof raw.timeZone === "string" ? cleanLine(raw.timeZone) : "";
  if (!isTimeZone(timeZone)) fields.timeZone = "Please enter a time zone such as Europe/London or Asia/Kolkata.";

  let topic: CallbackTopic = "General";
  if (typeof raw.topic === "string" && (CALLBACK_TOPICS as readonly string[]).includes(raw.topic)) topic = raw.topic as CallbackTopic;
  else fields.topic = "Please choose what the call is about.";

  if (raw.consent !== true) fields.consent = "Please confirm that GIO4X may telephone you on this number.";
  if (raw.website !== undefined && typeof raw.website !== "string") fields.website = "Unexpected value.";

  const startedAt = typeof raw.startedAt === "number" && Number.isFinite(raw.startedAt) && raw.startedAt > 0 ? raw.startedAt : 0;
  if (!startedAt) fields.startedAt = "The form could not be verified. Please reload the page and try again.";

  const page = normalisePath(raw.page);
  if (!page) fields.page = "The page reference is not valid.";

  const utm = readUtm(raw.utm);
  if (!utm) fields.utm = "Campaign parameters are not valid.";

  if (Object.keys(fields).length || !email || !page || !utm) return fail(400, "Please check the highlighted fields.", fields);

  if (tooFast(startedAt)) return json({ ok: true, reference: newReference() });

  const allowed = submissionAllowed("callback", gate.ip);
  if (!allowed.ok) return allowed.response;

  const supabase = createPublicSupabase();
  if (!supabase) return fail(503, UNAVAILABLE);

  const now = new Date().toISOString();
  const when = callbackWhen(dayPart, timeZone);
  // The first line is the marker GIO4X Control reads (readCallback); the rest restates the request for whoever makes the call.
  const message = [`${CALLBACK_PREFIX}${when}`, `Telephone: ${phone}`, `Country of residence: ${country}`, "Sent from the callback form on the contact page. No time for the call was promised."].join("\n");

  // as /api/contact: the id and reference are made here (the anonymous role cannot read the row back), and a reference collision is retried once
  for (let attempt = 0; attempt < 2; attempt++) {
    const reference = newReference();
    let error: { code?: string | null } | null = null;
    let status = 0;
    try {
      const result = await supabase.from("leads").insert({
        id: newId(),
        reference,
        name,
        email,
        phone,
        country,
        topic,
        message,
        account_interest: null,
        page,
        utm,
        privacy_accepted_at: now,
        privacy_version: PRIVACY_VERSION,
        marketing_consent: false,
        marketing_consent_at: null,
      });
      error = result.error;
      status = result.status;
    } catch {
      error = { code: "FETCH" };
    }

    if (!error) {
      // +1 on the day's total for the contact page's forms (a count, nothing about the sender); it cannot fail the request
      await countForm(request, "contact");
      // a copy to GIO4X's inbox, when outgoing e-mail is set up; the stored row is the record either way
      await notifyInbox(
        `Callback request ${reference}: ${topic}`,
        [
          `Reference: ${reference}`,
          `${CALLBACK_PREFIX}${when}`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Country: ${country}`,
          `Topic: ${topic}`,
          `Page: ${page}`,
          "",
          "The visitor asked to be telephoned and was promised no time for the call. Replying to this e-mail writes to them. The request is also in GIO4X Control, under Leads.",
        ].join("\n"),
        email,
      );
      return json({ ok: true, reference });
    }

    const kind = classifyStorageError(error, status);
    if (kind === "duplicate" && attempt === 0) continue;
    if (kind === "throttled") return fail(429, GENERIC_RATE_LIMITED);
    if (kind === "rejected") return fail(400, "Your request could not be accepted as written. Please check it and try again.");

    // code only: no name, no number, nothing personal
    console.error(`[api/callback] storage failure code=${String(error.code ?? "unknown").slice(0, 20)} status=${status}`);
    return fail(503, UNAVAILABLE);
  }

  return fail(503, UNAVAILABLE);
}
