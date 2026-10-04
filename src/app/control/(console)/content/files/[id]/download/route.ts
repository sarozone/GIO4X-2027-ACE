/**
 * GET /control/content/files/<id>/download  →  the file, as plain text
 *
 * A trader's file as it was sent, for a member of staff to read in a text
 * editor. For holders of content.read, checked here and again by the database
 * (policy trader_files_staff_select in 0030_trader_files.sql): the row is read
 * AS THE SIGNED-IN USER. There is no privileged client.
 *
 * It is always served as text/plain, as an attachment, with nosniff, whatever
 * the file contains: a browser never treats it as a page. The response is
 * never cached.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { fail } from "@/lib/server/http";
import { can, getAccess } from "@/lib/server/staff";
import { isUuid } from "@/lib/server/validate";
import { FILE_NAME } from "@/lib/trader-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAccess();
  if (access.state === "unconfigured" || access.state === "unavailable") return fail(503, "The file is not available just now.", undefined, PRIVATE);
  if (access.state === "anonymous") return fail(401, "Sign in to continue.", undefined, PRIVATE);
  if (access.state !== "staff" || !can(access, "content.read")) return fail(403, "Your role does not include traders’ files.", undefined, PRIVATE);
  const { id } = await params;
  if (!isUuid(id)) return fail(404, "There is no such file.", undefined, PRIVATE);

  const db = access.supabase as unknown as SupabaseClient;
  const { data, error } = await db.from("trader_files").select("file_name, code").eq("id", id).maybeSingle();
  if (error) return fail(503, "The file could not be read just now.", undefined, PRIVATE);
  if (!data) return fail(404, "There is no such file.", undefined, PRIVATE);
  const row = data as { file_name: string; code: string };
  // the name was checked when it was stored; anything else is replaced, so the header cannot be broken
  const name = FILE_NAME.test(row.file_name) ? row.file_name : "file.txt";

  return new Response(row.code, {
    status: 200,
    headers: { ...PRIVATE, "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "X-Content-Type-Options": "nosniff" },
  });
}
