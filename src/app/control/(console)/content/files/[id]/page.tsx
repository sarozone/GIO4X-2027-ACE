import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ControlHead, Facts, NoAccess, Notice } from "@/components/control/bits";
import { controlMeta, fmtDateTime } from "@/components/control/format";
import { can, requireStaff } from "@/lib/server/staff";
import { isUuid } from "@/lib/server/validate";
import { kindName, platformName } from "@/lib/trader-file";

export const dynamic = "force-dynamic";
export const metadata = controlMeta("A trader’s file", "/control/content/files");

type Row = { id: string; title: string; kind: string; platform: string; note: string; file_name: string; code: string; byline: string; status: string; created_at: string; decided_at: string | null };

const STATUS: Record<string, string> = { received: "Waiting to be read", read: "Read", archived: "Put away" };

/** One file a visitor sent: what they said about it, and its text. The text is shown as text and nothing else. */
export default async function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireStaff();
  if (!ctx) return null;
  if (!can(ctx, "content.read")) return <NoAccess title="A trader’s file" />;
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const db = ctx.supabase as unknown as SupabaseClient;
  const { data, error } = await db.from("trader_files").select("id, title, kind, platform, note, file_name, code, byline, status, created_at, decided_at").eq("id", id).maybeSingle();
  if (error) {
    return (
      <div className="grid gap-21">
        <ControlHead title="A trader’s file" />
        <Notice title="The file could not be read." tone="error" />
      </div>
    );
  }
  if (!data) notFound();
  const f = data as Row;
  const lines = f.code.split("\n").length;

  return (
    <div className="grid gap-21">
      <ControlHead
        title={f.title}
        lead="Sent from the Rule bench page. Kept to be read: never run, never shown on the website."
        actions={
          <>
            <Link href="/control/content/files" className="btn btn-ghost btn-sm">
              All files
            </Link>
            <a href={`/control/content/files/${f.id}/download`} className="btn btn-primary btn-sm">
              Download
            </a>
          </>
        }
      />
      <Notice title="Read it; do not run it">Do not compile this or attach it to a chart on a computer that holds a real account. A program can place orders, call other programs and reach the internet.</Notice>

      <section className="gxc-card" aria-label="About the file">
        <div className="gxc-card-body">
          <Facts
            rows={[
              { label: "Kind", value: kindName(f.kind) },
              { label: "Written for", value: platformName(f.platform) },
              { label: "File", value: `${f.file_name} · ${lines.toLocaleString("en-GB")} lines · ${f.code.length.toLocaleString("en-GB")} characters` },
              { label: "Sent", value: `${fmtDateTime(f.created_at)}${f.byline ? ` by ${f.byline}` : ""}` },
              { label: "Status", value: `${STATUS[f.status] ?? f.status}${f.decided_at ? ` since ${fmtDateTime(f.decided_at)}` : ""}` },
              { label: "What it does", value: f.note ? <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{f.note}</span> : "Not said" },
              { label: "Rights", value: "The sender ticked: “I wrote this file or have the right to share it, and I agree that GIO4X staff may read and keep it.”" },
            ]}
          />
        </div>
      </section>

      <section className="gxc-card" aria-labelledby="f-code">
        <div className="gxc-card-head">
          <h2 id="f-code" className="gxc-card-title">
            The text
          </h2>
        </div>
        <div className="gxc-card-body">
          <pre className="max-h-[70vh] overflow-auto rounded border border-line bg-paper p-13 text-xs leading-relaxed text-ink" tabIndex={0}>
            <code>{f.code}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
