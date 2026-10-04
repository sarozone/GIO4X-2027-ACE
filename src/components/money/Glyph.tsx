import type { MoneySlug } from "@/data/money";

/**
 * A small drawn sign for each money calculator, for its card on /money.
 *
 * Plain SVG, rendered on the server, in the page's own ink and accent so both
 * themes and every mood read. Each is the shape of its calculator's chart and
 * nothing more: no figures, no axis values, nothing that could be read as data.
 */

const bars = (heights: readonly number[], split?: readonly number[]) =>
  heights.map((h, i) => {
    const x = 6 + i * 8;
    const s = split?.[i] ?? 0;
    return (
      <g key={i}>
        <rect x={x} y={36 - h} width={5} height={h - s} fill="var(--accent)" opacity={0.85} />
        {s > 0 && <rect x={x} y={36 - s} width={5} height={s} fill="var(--prestige)" opacity={0.85} />}
      </g>
    );
  });

const SHAPES: Record<MoneySlug, React.ReactNode> = {
  // money paid in, with growth stacked on it, rising faster each year
  "regular-investing": bars([5, 8, 12, 16, 21, 27, 33], [4, 7, 10, 12, 15, 17, 20]),
  // a sum that builds, then is spent
  retirement: (
    <>
      <path d="M6 36 C 20 34, 28 20, 36 8 C 44 16, 52 28, 58 36 Z" fill="var(--accent)" opacity={0.28} />
      <path d="M6 36 C 20 34, 28 20, 36 8 C 44 16, 52 28, 58 36" fill="none" stroke="var(--accent)" strokeWidth={1.8} />
      <path d="M36 4 V36" stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" />
    </>
  ),
  // level payments, and a balance that falls to nothing
  "loan-emi": (
    <>
      {bars([18, 18, 18, 18, 18, 18, 18], [12, 10, 8, 6, 5, 3, 1])}
      <path d="M8 6 C 26 10, 44 20, 59 35" fill="none" stroke="currentColor" strokeWidth={1.6} />
    </>
  ),
  // the same sum buying less each year
  inflation: (
    <>
      {bars([30, 26, 22, 19, 16, 14, 12])}
      <path d="M8 22 C 26 20, 44 14, 59 5" fill="none" stroke="var(--prestige)" strokeWidth={1.6} />
    </>
  ),
  // a path up to a line
  "goal-planner": (
    <>
      <path d="M4 9 H60" stroke="currentColor" strokeWidth={1.2} strokeDasharray="3 3" />
      {bars([4, 8, 12, 16, 20, 24, 27], [4, 7, 10, 13, 16, 19, 21])}
    </>
  ),
  // two curves from one point: the untaxed above the taxed
  "tax-drag": (
    <>
      <path d="M6 32 C 26 30, 44 20, 58 5 L58 17 C 44 26, 26 31, 6 32 Z" fill="rgb(214,96,88)" opacity={0.3} />
      <path d="M6 32 C 26 30, 44 20, 58 5" fill="none" stroke="currentColor" strokeWidth={1.4} />
      <path d="M6 32 C 26 31, 44 26, 58 17" fill="none" stroke="var(--accent)" strokeWidth={1.8} />
    </>
  ),
  // one, two, four
  "rule-of-72": (
    <>
      <path d="M4 20 H60" stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" />
      <path d="M6 28 C 24 27, 42 22, 58 4" fill="none" stroke="var(--accent)" strokeWidth={1.8} />
      <circle cx={6} cy={28} r={2.2} fill="var(--accent)" />
      <circle cx={39.5} cy={20} r={2.6} fill="var(--prestige)" />
    </>
  ),
};

export function MoneyGlyph({ slug, className = "" }: { slug: MoneySlug; className?: string }) {
  return (
    <svg viewBox="0 0 64 40" aria-hidden focusable="false" className={`block h-auto w-[5.5rem] text-ink-3 ${className}`}>
      <path d="M4 36.5 H60" stroke="currentColor" strokeWidth={1} opacity={0.6} />
      {SHAPES[slug]}
    </svg>
  );
}
