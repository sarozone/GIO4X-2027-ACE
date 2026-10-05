"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";

/**
 * THE RETURN CODES, WITH A FILTER BOX.
 *
 * Every code is in the HTML as the server sends it, each as a native
 * disclosure: closed, it is one line with the number and MetaQuotes' short
 * meaning; opened, it gives the name, the cause, the check and the links.
 * The box only hides the rows that do not match what is typed (a number, part
 * of one, or any words) and opens the ones that do, and one sentence says how
 * many are showing. A link to a code (`#code-10019`, or just `#10019`) opens
 * that code. On paper every code shown is printed open. Nothing typed here is
 * stored or sent anywhere. The words themselves come from src/data/mt5-codes.ts.
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

const wordsOf = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

/** Every word typed must be found somewhere in the row. */
function matches(row: CodeRow, words: string[]): boolean {
  if (words.length === 0) return true;
  const hay = `${row.code} ${row.name} ${row.name.replace(/_/g, " ")} ${row.meaning} ${row.cause} ${row.check} ${row.links.map((l) => l.label).join(" ")}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

export function OrderErrors({ rows }: { rows: CodeRow[] }) {
  const [q, setQ] = useState("");
  /** the codes that are open */
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  const [printing, setPrinting] = useState(false);
  /** what was open before a search began, put back when the box is emptied */
  const before = useRef<ReadonlySet<number> | null>(null);
  const inputId = useId();
  const words = wordsOf(q);
  const shown = rows.filter((r) => matches(r, words));
  const visible = new Set(shown.map((r) => r.code));
  const openShown = shown.filter((r) => open.has(r.code)).length;

  /** Typing opens what matches; emptying the box puts the list back as it was. */
  const search = (value: string) => {
    const next = value.slice(0, 60);
    const w = wordsOf(next);
    if (w.length > 0) {
      if (before.current === null) before.current = open;
      setOpen(new Set(rows.filter((r) => matches(r, w)).map((r) => r.code)));
    } else if (before.current !== null) {
      setOpen(before.current);
      before.current = null;
    }
    setQ(next);
  };

  // the list keeps the one record of what is open, so the browser's own toggling is taken over here
  const toggle = (e: MouseEvent, code: number) => {
    e.preventDefault();
    setOpen((s) => {
      const next = new Set(s);
      if (!next.delete(code)) next.add(code);
      return next;
    });
  };

  // a link to one code: any search is cleared so the code cannot be hidden, it is opened and brought into view
  useEffect(() => {
    const fromHash = () => {
      const m = /^#(?:code-)?(\d{1,6})$/.exec(window.location.hash);
      const code = m ? Number(m[1]) : NaN;
      if (!rows.some((r) => r.code === code)) return;
      before.current = null;
      setQ("");
      setOpen((s) => (s.has(code) ? s : new Set(s).add(code)));
      requestAnimationFrame(() => document.getElementById(`code-${code}`)?.scrollIntoView({ block: "start" }));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [rows]);

  // paper has nothing to press: every code shown is printed open, and the list is as it was afterwards.
  // flushSync, because the browser lays the sheet out as soon as this handler returns.
  useEffect(() => {
    const on = () => flushSync(() => setPrinting(true));
    const off = () => setPrinting(false);
    window.addEventListener("beforeprint", on);
    window.addEventListener("afterprint", off);
    return () => {
      window.removeEventListener("beforeprint", on);
      window.removeEventListener("afterprint", off);
    };
  }, []);

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
            onChange={(e) => search(e.target.value)}
          />
        </div>
        {q !== "" && (
          <button type="button" className="btn btn-ghost" onClick={() => search("")}>
            Show all
          </button>
        )}
      </div>
      <div className="mt-13 flex flex-wrap items-center justify-between gap-x-21 gap-y-8">
        <p className="text-sm text-ink-2" aria-live="polite">
          {words.length === 0
            ? `All ${rows.length} codes are listed, in number order. Press a code to open it.`
            : shown.length === 0
              ? `No code matches “${q.trim()}”. A code that is not listed here is one this page does not describe.`
              : `${shown.length} of ${rows.length} codes match “${q.trim()}”, and ${shown.length === 1 ? "it is" : "they are"} opened below.`}
        </p>
        <div className="no-print flex flex-wrap gap-8">
          <button type="button" className="btn btn-ghost btn-sm" disabled={shown.length === 0 || openShown === shown.length} onClick={() => setOpen((s) => new Set([...s, ...shown.map((r) => r.code)]))}>
            Expand all
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={openShown === 0} onClick={() => setOpen(new Set())}>
            Collapse all
          </button>
        </div>
      </div>

      <ol className="mt-21 border-t border-line-strong">
        {rows.map((r) => (
          <li key={r.code} id={`code-${r.code}`} hidden={!visible.has(r.code)} className="scroll-mt-[calc(var(--header-h)+1.3125rem)] border-b border-line">
            <details open={printing || open.has(r.code)} className="group">
              <summary
                onClick={(e) => toggle(e, r.code)}
                className="group/s grid min-h-[3.4375rem] list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-21 py-8 transition-colors duration-fast hover:bg-brand-soft md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] md:gap-x-34"
              >
                <span className="num font-display text-2xl font-light leading-none text-ink max-md:col-span-2">{r.code}</span>
                <h3 className="h4 transition-colors duration-fast group-hover/s:text-accent">{r.meaning}</h3>
                {/* the arrow: down when closed, up when open; decoration, since the summary already says which */}
                <svg aria-hidden width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mr-5 text-ink-3 transition-transform duration-fast group-open:rotate-180 print:hidden">
                  <path d="M2 4.5l4.5 4.5L11 4.5" />
                </svg>
              </summary>
              <div className="grid gap-x-34 gap-y-8 pb-21 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
                <div className="min-w-0">
                  <p className="font-mono text-[0.6875rem] text-ink-3 [overflow-wrap:anywhere]">{r.name}</p>
                  {r.result && <p className="chip mt-8">A result, not a refusal</p>}
                </div>
                <div className="min-w-0">
                  <dl className="grid gap-8">
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
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
