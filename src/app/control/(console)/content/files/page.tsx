import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { decideFile } from "@/app/control/actions-files";
import { ControlHead, Empty, NoAccess, Notice } from "@/components/control/bits";
import { controlMeta, firstParam, fmtDate } from "@/components/control/format";
import { can, requireStaff } from "@/lib/server/staff";
import { kindName, platformName } from "@/lib/trader-file";

export const dynamic = "force-dynamic";
export const metadata = controlMeta("Traders’ files", "/control/content/files");

type Status = "received" | "read" | "archived";
type Row = { id: string; title: string; kind: string; platform: string; note: string; file_name: string; byline: string; status: Status; created_at: string };

const NOTICES: Record<string, string> = { read: "Marked as read.", archived: "Put away.", received: "Put back to waiting." };
const ERRORS: Record<string, string> = { invalid: "That request was not valid.", forbidden: "Changing a file’s status needs the right to publish content.", save: "It could not be saved. Nothing was changed." };

/**
 * Traders' files, for the people who read them. A visitor sends the source of
 * an Expert Advisor, an indicator or a script from the Rule bench page. The
 * list leaves the text out; a file's own page shows it and offers it as a
 * download.
 */
export default async function FilesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const ctx = await requireStaff();
  if (!ctx) return null;
  if (!can(ctx, "content.read")) return <NoAccess title="Traders’ files" />;
  const params = await searchParams;
  const notice = NOTICES[firstParam(params.notice)];
  const problem = ERRORS[firstParam(params.error)];
  const mayDecide = can(ctx, "content.publish");

  const db = ctx.supabase as unknown as SupabaseClient;
  const { data, error } = await db.from("trader_files").select("id, title, kind, platform, note, file_name, byline, status, created_at").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as Row[];
  const groups: [Status, string][] = [
    ["received", "Waiting to be read"],
    ["read", "Read"],
    ["archived", "Put away"],
  ];

  return (
    <div className="grid gap-21">
      <ControlHead
        title="Traders’ files"
        lead="Visitors send the source of an Expert Advisor, an indicator or a script from the Rule bench page. A file is kept to be read. It is never run and never shown on the website."
        actions={
          <Link href="/control/content" className="btn btn-ghost btn-sm">
            Content
          </Link>
        }
      />
      {notice && <Notice title={notice} tone="ok" />}
      {problem && <Notice title={problem} tone="error" />}
      {error && <Notice title="The files could not be read." tone="error" />}

      <Notice title="Treat every file as a stranger’s program">
        Read it here or in a text editor. Do not compile it or attach it to a chart on a computer that holds a real account: a program can place orders, call other programs and reach the internet. Nobody was asked for an address, so there is nobody to reply to.
      </Notice>

      {groups.map(([status, title]) => {
        const list = rows.filter((r) => r.status === status);
        return (
          <section key={status} aria-labelledby={`f-${status}`} className="gxc-card">
            <div className="gxc-card-head">
              <h2 id={`f-${status}`} className="gxc-card-title">
                {title} · {list.length}
              </h2>
            </div>
            <div className="gxc-card-body">
              {list.length === 0 ? (
                <Empty title={status === "received" ? "Nothing is waiting." : "None."} />
              ) : (
                <ul className="grid gap-13">
                  {list.map((r) => (
                    <li key={r.id} className="grid gap-8 border-b border-line pb-13 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                      <div className="min-w-0">
                        <p className="font-medium text-ink [overflow-wrap:anywhere]">
                          <Link href={`/control/content/files/${r.id}`} className="link">
                            {r.title}
                          </Link>
                        </p>
                        {r.note && <p className="mt-3 line-clamp-2 text-sm text-ink-2 [overflow-wrap:anywhere]">{r.note}</p>}
                        <p className="mt-5 text-xs text-ink-3 [overflow-wrap:anywhere]">
                          {kindName(r.kind)} · {platformName(r.platform)} · {r.file_name}
                          {r.byline ? ` · sent by ${r.byline}` : ""} · {fmtDate(r.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-8">
                        <Link href={`/control/content/files/${r.id}`} className="btn btn-ghost btn-sm">
                          Open
                        </Link>
                        {mayDecide &&
                          (status === "received" ? (["read", "archived"] as const) : status === "read" ? (["archived", "received"] as const) : (["read", "received"] as const)).map((to) => (
                            <form key={to} action={decideFile}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="status" value={to} />
                              <button type="submit" className={`btn btn-sm ${to === "read" ? "btn-primary" : "btn-ghost"}`}>
                                {to === "read" ? "Mark as read" : to === "archived" ? "Put away" : "Back to waiting"}
                              </button>
                            </form>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
