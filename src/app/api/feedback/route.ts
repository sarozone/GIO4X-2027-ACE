/**
 * /api/feedback: "Was this page helpful?"
 *
 * POST
 *   request   { path, helpful, comment?, website: "" (honeypot) }
 *   200       { ok: true }
 *   400 / 403 / 413 / 415 / 429 / 503   { ok: false, error, fields? }
 *
 * One answer about one page: the page's path, yes or no, and an optional
 * comment of up to 500 characters. That, and the time, is all that is stored
 * (supabase/migrations/0032_page_feedback.sql). Nothing about the visitor is
 * stored or logged: no IP address, no user agent, no identifier. The address
 * is used in memory for the rate limit, as on every public endpoint, and goes
 * no further.
 *
 * Same protections as /api/contact (docs/SECURITY.md): the gate (JSON only,
 * same origin, attempts per address, a small body), the honeypot, and a
 * per-address limit on what is stored. There is no minimum fill time: the
 * form is one button.
 *
 * The path must be one of the site's published pages (the visit counter's
 * own list, src/lib/server/pulse.ts) in a section that carries the question
 * (src/lib/feedback.ts); the query string and fragment are dropped first.
 *
 * GET
 *   200       { ok: true | false }   whether answers can be stored at all
 *
 * The control on the website asks this once before it shows itself, so that
 * it stays out of sight while the table does not exist yet. It reveals
 * nothing but that.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { FEEDBACK_COMMENT_MAX, feedbackSection } from "@/lib/feedback";
import { PULSE_OTHER } from "@/lib/pulse";
import { GENERIC_RATE_LIMITED } from "@/lib/server/constants";
import { fail, json } from "@/lib/server/http";
import { classifyStorageError, honeypotFilled, openGate } from "@/lib/server/public-form";
import { countablePath } from "@/lib/server/pulse";
import { rateLimit, type RateRule } from "@/lib/server/rate-limit";
import { cleanText } from "@/lib/server/validate";
import { createPublicSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAVAILABLE = "Your answer could not be recorded just now.";
const FIELDS = new Set(["path", "helpful", "comment", "website"]);
/** The body is a path, a boolean and at most 500 characters. */
const MAX_FEEDBACK_BYTES = 4 * 1024;
/** Per address, in memory: a reader may answer on several pages in one sitting. */
const STORED: RateRule = { limit: 20, windowMs: 10 * 60 * 1000 };

/* ---- is the table there? --------------------------------------------------- */

// Remembered per server instance: "yes" for an hour, "no" for a minute, so a
// migration applied later is noticed without a deploy.
let known: { ok: boolean; until: number } | null = null;

/**
 * The anonymous role may not read the table, so a read is refused with
 * "permission denied" (42501) when the table exists and with "not found" when
 * it does not. That difference is the whole test; no row is read or written.
 */
async function storable(): Promise<boolean> {
  const now = Date.now();
  if (known && known.until > now) return known.ok;
  let ok = false;
  try {
    const supabase = createPublicSupabase();
    if (supabase) {
      // the table is newer than the generated client, so it is addressed by name
      const { error } = await (supabase as unknown as SupabaseClient).from("page_feedback").select("id").limit(1);
      ok = !error || error.code === "42501";
    }
  } catch {
    ok = false;
  }
  known = { ok, until: now + (ok ? 60 * 60 * 1000 : 60 * 1000) };
  return ok;
}

export async function GET() {
  return json({ ok: await storable() });
}

export async function POST(request: Request) {
  const gate = await openGate(request, "feedback", MAX_FEEDBACK_BYTES);
  if (!gate.ok) return gate.response;
  if (honeypotFilled(gate.body)) return json({ ok: true });

  const raw = gate.body;
  const fields: Record<string, string> = {};
  for (const k of Object.keys(raw)) if (!FIELDS.has(k)) fields[k.replace(/[^A-Za-z0-9_.-]/g, "?").slice(0, 40) || "?"] = "Unexpected field.";

  // one of the site's own published pages, in a section that asks the question
  const counted = countablePath(raw.path);
  const path = counted && counted !== PULSE_OTHER && feedbackSection(counted) ? counted : null;
  if (!path) fields.path = "The page reference is not valid.";

  if (typeof raw.helpful !== "boolean") fields.helpful = "Please choose yes or no.";

  let comment = "";
  if (raw.comment !== undefined && raw.comment !== null) {
    if (typeof raw.comment !== "string") fields.comment = "The comment must be text.";
    else {
      // markup is never kept: the two characters that could open a tag are removed
      comment = cleanText(raw.comment).replace(/[<>]/g, "");
      if (comment.length > FEEDBACK_COMMENT_MAX) fields.comment = `The comment must be ${FEEDBACK_COMMENT_MAX} characters or fewer.`;
    }
  }
  if (raw.website !== undefined && typeof raw.website !== "string") fields.website = "Unexpected value.";
  if (Object.keys(fields).length || !path || typeof raw.helpful !== "boolean") return fail(400, "That answer could not be accepted.", fields);

  const allowed = rateLimit("feedback:stored", gate.ip, STORED);
  if (!allowed.ok) return fail(429, GENERIC_RATE_LIMITED, undefined, { "Retry-After": String(allowed.retryAfterSeconds) });

  const supabase = createPublicSupabase();
  if (!supabase) return fail(503, UNAVAILABLE);

  let error: { code?: string | null } | null = null;
  let status = 0;
  try {
    // no row is asked back (the anonymous role cannot read the table)
    const result = await (supabase as unknown as SupabaseClient).from("page_feedback").insert({ path, helpful: raw.helpful, comment });
    error = result.error;
    status = result.status;
  } catch {
    error = { code: "FETCH" };
  }
  if (!error) return json({ ok: true });

  const kind = classifyStorageError(error, status);
  if (kind === "throttled") return fail(429, GENERIC_RATE_LIMITED);
  if (kind === "rejected") return fail(400, "That answer could not be accepted.");
  // code only: no path, no comment, nothing about the sender
  console.error(`[api/feedback] storage failure code=${String(error.code ?? "unknown").slice(0, 20)} status=${status}`);
  known = null; // the table may have gone, or not arrived: ask again before the control is shown
  return fail(503, UNAVAILABLE);
}
