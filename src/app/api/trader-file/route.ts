/**
 * POST /api/trader-file
 *
 *   request   { title, kind, platform, note?, name, code, by?, rights: true, website: "" (honeypot), startedAt }
 *   200       { ok: true }
 *   400 / 403 / 413 / 415 / 429 / 503   { ok: false, error, fields? }
 *
 * A trader's file: the source of an Expert Advisor, an indicator or a script,
 * sent from the Rule bench page. It is stored as text for staff to read in
 * GIO4X Control and for nothing else: it is never run, never compiled and
 * never shown on the website (supabase/migrations/0030_trader_files.sql makes
 * the public unable to read any file, their own included). No e-mail address
 * is asked for and none is kept. Same protections as /api/contact (see
 * docs/SECURITY.md): the gate, the honeypot, the minimum time, the rate limit.
 * The gate reads a larger body here than anywhere else, because the body
 * carries the file's text.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { GENERIC_RATE_LIMITED, GENERIC_UNAVAILABLE } from "@/lib/server/constants";
import { fail, json } from "@/lib/server/http";
import { classifyStorageError, honeypotFilled, openGate, submissionAllowed, tooFast } from "@/lib/server/public-form";
import { cleanLine, cleanText } from "@/lib/server/validate";
import { createPublicSupabase } from "@/lib/supabase/server";
import { BYLINE_MAX, CODE_FORBIDDEN, CODE_MAX, CODE_MIN, FILE_BODY_BYTES, FILE_KINDS, FILE_NAME, FILE_PLATFORMS, NOTE_MAX, TITLE_MAX, TITLE_MIN } from "@/lib/trader-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAVAILABLE = GENERIC_UNAVAILABLE.replace("record your message", "record your file");
const FIELDS = new Set(["title", "kind", "platform", "note", "name", "code", "by", "rights", "website", "startedAt"]);
const LINK = /(https?:|www\.|<|>)/i;

export async function POST(request: Request) {
  const gate = await openGate(request, "trader-file", FILE_BODY_BYTES);
  if (!gate.ok) return gate.response;
  if (honeypotFilled(gate.body)) return json({ ok: true });

  const raw = gate.body;
  const fields: Record<string, string> = {};
  for (const k of Object.keys(raw)) if (!FIELDS.has(k)) fields[k] = "Unexpected field.";

  const title = typeof raw.title === "string" ? cleanLine(raw.title) : "";
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) fields.title = `The name must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
  else if (LINK.test(title)) fields.title = "The name cannot contain a web address.";

  const kind = typeof raw.kind === "string" && FILE_KINDS.some((k) => k.key === raw.kind) ? raw.kind : "";
  if (!kind) fields.kind = "Choose what kind of file it is.";
  const platform = typeof raw.platform === "string" && FILE_PLATFORMS.some((p) => p.key === raw.platform) ? raw.platform : "";
  if (!platform) fields.platform = "Choose the platform it was written for.";

  const note = typeof raw.note === "string" ? cleanText(raw.note) : "";
  if (note.length > NOTE_MAX) fields.note = `The note can be up to ${NOTE_MAX} characters.`;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!FILE_NAME.test(name)) fields.name = "Choose a source file: .mq4, .mq5, .mqh, .pine or .txt, with a plain name.";

  // the text is kept as it was written, apart from its line endings
  const code = typeof raw.code === "string" ? raw.code.replace(/\r\n?/g, "\n") : "";
  if (code.length < CODE_MIN) fields.code = "The file is empty, or too short to be a program.";
  else if (code.length > CODE_MAX) fields.code = "The file is too large.";
  else if (CODE_FORBIDDEN.test(code)) fields.code = "The file is not plain text. A compiled file (.ex4, .ex5) cannot be read: send the source.";

  const by = typeof raw.by === "string" ? cleanLine(raw.by) : "";
  if (by.length > BYLINE_MAX || LINK.test(by) || by.includes("@")) fields.by = `Initials or a first name only, up to ${BYLINE_MAX} characters.`;

  if (raw.rights !== true) fields.rights = "Please confirm that the file is yours to share.";

  const startedAt = typeof raw.startedAt === "number" && Number.isFinite(raw.startedAt) && raw.startedAt > 0 ? raw.startedAt : 0;
  if (!startedAt) fields.startedAt = "The form could not be verified. Please reload the page and try again.";
  if (Object.keys(fields).length) return fail(400, "Please check the highlighted fields.", fields);

  if (tooFast(startedAt)) return json({ ok: true });
  const allowed = submissionAllowed("trader-file", gate.ip);
  if (!allowed.ok) return allowed.response;

  const supabase = createPublicSupabase();
  if (!supabase) return fail(503, UNAVAILABLE);

  let error: { code?: string | null } | null = null;
  let status = 0;
  try {
    // the table is newer than the generated types, so it is addressed by name
    const result = await (supabase as unknown as SupabaseClient).from("trader_files").insert({ title, kind, platform, note, file_name: name, code, byline: by, rights: true });
    error = result.error;
    status = result.status;
  } catch {
    error = { code: "FETCH" };
  }
  if (!error) return json({ ok: true });

  const failure = classifyStorageError(error, status);
  if (failure === "throttled") return fail(429, GENERIC_RATE_LIMITED);
  if (failure === "rejected") return fail(400, "That file could not be accepted. Please check it and try again.");
  console.error(`[api/trader-file] storage failure code=${String(error.code ?? "unknown").slice(0, 20)} status=${status}`);
  return fail(503, UNAVAILABLE);
}
