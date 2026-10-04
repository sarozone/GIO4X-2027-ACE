"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { can, getAccess, SIGN_IN_PATH } from "@/lib/server/staff";
import { isUuid } from "@/lib/server/validate";

/**
 * Traders' files: mark one read, put it away, or put it back. Only the status
 * changes: the table refuses any change to what a visitor sent and records who
 * decided and when. For someone who may publish content (content.publish).
 */
const BACK = "/control/content/files";

export async function decideFile(formData: FormData): Promise<void> {
  const access = await getAccess();
  if (access.state === "anonymous") redirect(SIGN_IN_PATH);
  if (access.state !== "staff") redirect("/control");
  const id = formData.get("id");
  const to = formData.get("status");
  if (!isUuid(id) || (to !== "read" && to !== "archived" && to !== "received")) redirect(`${BACK}?error=invalid`);
  if (!can(access, "content.publish")) redirect(`${BACK}?error=forbidden`);

  const db = access.supabase as unknown as SupabaseClient;
  const { data, error } = await db.from("trader_files").update({ status: to }).eq("id", id).select("id");
  if (error) redirect(`${BACK}?error=save`);
  if (!data || data.length !== 1) redirect(`${BACK}?error=forbidden`);
  redirect(`${BACK}?notice=${to}`);
}
