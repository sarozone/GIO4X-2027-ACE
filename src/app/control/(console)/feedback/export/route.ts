/**
 * POST /control/feedback/export  →  CSV of the answers to "Was this page helpful?"
 *
 * One row per answer, newest first: when (UTC), the page's path, its section,
 * the answer and the comment. Nothing about a reader is in the file, because
 * nothing about a reader is stored (0032_page_feedback.sql). At most 1,000
 * rows; the form fields `section` and `verdict` narrow it as the screen does.
 *
 * `feedback.read`, checked here on the server and again by the database:
 *   · the rows are read as the signed-in user through row-level security;
 *   · record_page_feedback_export() refuses anyone else and writes the audit
 *     entry. It is called BEFORE the file is sent: if the download cannot be
 *     recorded, it does not happen.
 *
 * POST with a same-origin check, so another site cannot make a member of
 * staff's browser trigger (and log) a download. The response is never cached.
 * Cells are protected against spreadsheet formula injection
 * (src/lib/server/csv.ts): a comment is text a stranger typed.
 */
import { FEEDBACK_SECTIONS, feedbackSection, isFeedbackSection } from "@/lib/feedback";
import { toCsv } from "@/lib/server/csv";
import { fail, isSameOrigin } from "@/lib/server/http";
import { can, getAccess } from "@/lib/server/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PostgREST returns at most 1,000 rows to one request on this project
const MAX_ROWS = 1000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "Not allowed.");

  const access = await getAccess();
  if (access.state === "unconfigured" || access.state === "unavailable") return fail(503, "The export is not available just now.");
  if (access.state === "anonymous") return fail(401, "Sign in to continue.");
  if (access.state !== "staff" || !can(access, "feedback.read")) return fail(403, "Your role does not include Page feedback.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "That request was not valid.");
  }
  // both filters are checked against allow-lists; anything else means "no filter"
  const sectionField = form.get("section");
  const section = isFeedbackSection(sectionField) ? sectionField : "";
  const verdictField = form.get("verdict");
  const verdict = verdictField === "yes" || verdictField === "no" ? verdictField : "";

  let query = access.supabase.from("page_feedback").select("created_at, path, helpful, comment");
  if (section) query = query.like("path", `/${section}%`);
  if (verdict) query = query.eq("helpful", verdict === "yes");
  const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_ROWS);
  if (error || !data) return fail(503, "The export is not available just now.");

  // no audit entry, no file
  const { error: auditError } = await access.supabase.rpc("record_page_feedback_export", { p_rows: data.length });
  if (auditError) return fail(503, "The download could not be recorded, so it was not produced.");

  const csv = toCsv(
    ["received_utc", "path", "section", "helpful", "comment"],
    data.map((row) => {
      const key = feedbackSection(row.path);
      return [row.created_at, row.path, key ? FEEDBACK_SECTIONS[key] : "Other", row.helpful ? "yes" : "no", row.comment];
    }),
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gio4x-page-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
