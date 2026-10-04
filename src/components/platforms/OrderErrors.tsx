"use client";

import Link from "next/link";
import { useId, useState } from "react";

/**
 * THE RETURN CODES, WITH A FILTER BOX.
 *
 * Every code is in the HTML as the server sends it: the box only hides the
 * rows that do not match what is typed (a number, part of one, or any words),
 * and one sentence says how many are showing. Nothing typed here is stored or
 * sent anywhere. The words themselves come from src/data/mt5-codes.ts.
 */
export type CodeRow = {
  code: number;
  name: string;
  meaning: string;
  result: boolean;
  cause: string;
  check: string;
  links: { label: string; href: string }[];
};

/** Every word typed must be found somewhere in the row. */
function matches(row: CodeRow, words: string[]): boolean {
  if (words.length === 0) return true;
  const hay = `${row.code} ${row.name} ${row.name.replace(/_/g, " ")} ${row.meaning} ${row.cause} ${row.check} ${row.links.map((l) => l.label).join(" ")}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

export function OrderErrors({ rows }: { rows: CodeRow[] }) {
  const [q, setQ] = useState("");
  const inputId = useId();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = rows.filter((r) => matches(r, words));
  const visible = new Set(shown.map((r) => r.code));

  return (
    <div>
      <div className="flex flex-wrap items-end gap-13">
        <div className="field min-w-0 flex-1 basis-[16rem]">
          <label htmlFor={inputId}>Find a code</label>
          <input
            id={inputId}
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            className="input"
            placeholder="A number or a word: 10019, stops, volume"
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 60))}
          />
        </div>
        {q !== "" && (
          <button type="button" className="btn btn-ghost" onClick={() => setQ("")}>
            Show all
          </button>
        )}
      </div>
      <p className="mt-13 text-sm text-ink-2" aria-live="polite">
        {words.length === 0
          ? `All ${rows.length} codes are listed, in number order.`
          : shown.length === 0
            ? `No code matches “${q.trim()}”. A code that is not listed here is one this page does not describe.`
            : `${shown.length} of ${rows.length} codes match “${q.trim()}”.`}
      </p>

      <ol className="mt-21 border-t border-line-strong">
        {rows.map((r) => (
          <li key={r.code} id={`code-${r.code}`} hidden={!visible.has(r.code)} className="scroll-mt-[calc(var(--header-h)+1.3125rem)] border-b border-line py-21">
            <div className="grid gap-x-34 gap-y-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
              <div className="min-w-0">
                <p className="num font-display text-2xl font-light leading-none text-ink">{r.code}</p>
                <p className="mt-5 font-mono text-[0.6875rem] text-ink-3 [overflow-wrap:anywhere]">{r.name}</p>
                {r.result && <p className="chip mt-8">A result, not a refusal</p>}
              </div>
              <div className="min-w-0">
                <h3 className="h4">{r.meaning}</h3>
                <dl className="mt-8 grid gap-8">
                  <div>
                    <dt className="label">What usually causes it</dt>
                    <dd className="mt-3 max-w-measure text-sm text-ink-2">{r.cause}</dd>
                  </div>
                  <div>
                    <dt className="label">What can be checked</dt>
                    <dd className="mt-3 max-w-measure text-sm text-ink-2">{r.check}</dd>
                  </div>
                </dl>
                {r.links.length > 0 && (
                  <ul className="mt-8 flex flex-wrap items-center gap-x-13 gap-y-2 text-sm" aria-label={`Where the ideas behind ${r.code} are explained`}>
                    {r.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="link inline-flex min-h-[2.75rem] items-center md:min-h-[2.125rem]">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
