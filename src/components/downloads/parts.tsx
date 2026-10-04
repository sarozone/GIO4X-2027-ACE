import type { ReactNode } from "react";
import { PrintSheet } from "./PrintSheet";

/**
 * The parts a printable sheet is made of: the sheet itself (the same card the
 * Academy's cheat sheets use, `.gx-sheet`, which becomes a bare A4 page on
 * paper), a blank to write on, and a box to tick. A sheet is a form or a
 * reminder. It never carries a figure of its own, and its foot says what it is.
 */

export function Sheet({ id, n, total, name, title, intro, foot, children }: { id: string; n: number; total: number; name: string; title: string; intro: string; foot: string; children: ReactNode }) {
  return (
    <article id={id} data-sheet className="gx-sheet scroll-mt-[calc(var(--header-h)+1.3125rem)]" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-center justify-between gap-13">
        <p className="label">
          GIO4X · to print · sheet {n} of {total}
        </p>
        <PrintSheet sheet={id} name={name} />
      </div>
      <h2 id={`${id}-h`} className="h3 mt-8">
        {title}
      </h2>
      <p className="mt-8 max-w-measure text-sm text-ink-2">{intro}</p>
      {children}
      <p className="gx-sheet-foot">{foot}</p>
    </article>
  );
}

/** A label with ruled lines beneath it, to be filled in by hand. */
export function Blank({ label, lines = 1 }: { label: string; lines?: number }) {
  return (
    <div className="break-inside-avoid">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div aria-hidden>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="block h-[1.75rem] border-b border-line-strong" />
        ))}
      </div>
    </div>
  );
}

/** A row of blanks: one column on a phone, more on a wider screen and on paper. */
export function Blanks({ labels, cols = 2 }: { labels: readonly string[]; cols?: 2 | 4 }) {
  return (
    <div className={`mt-21 grid gap-x-21 gap-y-13 ${cols === 4 ? "grid-cols-2 sm:grid-cols-4 print:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 print:grid-cols-2"}`}>
      {labels.map((l) => (
        <Blank key={l} label={l} />
      ))}
    </div>
  );
}

/** A list of lines, each with an empty box to tick in pen. */
export function Ticks({ items }: { items: readonly string[] }) {
  return (
    <ol className="mt-21 border-t border-line-strong">
      {items.map((x, i) => (
        <li key={x} className="grid break-inside-avoid grid-cols-[1.5rem_minmax(0,1fr)_1.125rem] items-start gap-x-13 border-b border-line py-8 print:py-5 print:text-sm">
          <span className="num pt-[0.2em] text-xs font-semibold text-prestige-ink">{i + 1}</span>
          <span className="text-ink-2">{x}</span>
          <span aria-hidden className="mt-[0.2em] h-[1.125rem] w-[1.125rem] border border-line-strong" />
        </li>
      ))}
    </ol>
  );
}
