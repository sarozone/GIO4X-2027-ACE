import type { LessonSlug } from "@/data/chart-school";
import { atr, bollinger, levels, lineThrough, macd, rsi, sma, stochastic, swings, type Series } from "./indicators";
import { makeBars } from "./series";

/**
 * CHART SCHOOL — the small drawing on each card of the index.
 *
 * A server-rendered SVG: sixty closes of one invented chart, with the card's
 * indicator drawn on or under them by the same arithmetic the pages use. It is
 * decoration (aria-hidden); the card's words say what the page is. Not market
 * data.
 */

const W = 220;
const H = 96;
const SHOWN = 60;
const SEED = 2027;

const path = (values: readonly (number | null)[], from: number, y: (v: number) => number) => {
  let d = "";
  let pen = false;
  for (let i = from; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${(((i - from) / (SHOWN - 1)) * W).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
};

const scale = (sets: readonly (readonly (number | null)[])[], from: number, top: number, bottom: number, fixed?: [number, number]) => {
  let lo = Infinity;
  let hi = -Infinity;
  if (fixed) [lo, hi] = fixed;
  else
    for (const s of sets)
      for (let i = from; i < s.length; i++) {
        const v = s[i];
        if (v == null) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
  return (v: number) => bottom - ((v - lo) / (hi - lo || 1)) * (bottom - top);
};

export function IndicatorThumb({ kind }: { kind: LessonSlug }) {
  const bars = makeBars(SEED);
  const closes = bars.map((b) => b.c);
  const from = bars.length - SHOWN;
  const under = kind === "rsi" || kind === "macd" || kind === "atr" || kind === "stochastic";
  const priceBottom = under ? 52 : H - 6;

  const on: Series[] = [];
  let below: Series[] = [];
  let fixed: [number, number] | undefined;
  const flat: number[] = [];
  let ray: { x1: number; y1: number; x2: number; y2: number } | null = null;

  if (kind === "moving-averages") on.push(sma(closes, 20));
  if (kind === "bollinger-bands") {
    const b = bollinger(closes, 20, 2);
    on.push(b.upper, b.lower);
  }
  if (kind === "rsi") {
    below = [rsi(closes, 14)];
    fixed = [0, 100];
  }
  if (kind === "macd") {
    const m = macd(closes, 12, 26, 9);
    below = [m.line, m.signal];
  }
  if (kind === "atr") below = [atr(bars, 14)];
  if (kind === "stochastic") {
    const s = stochastic(bars, 14, 3, 3);
    below = [s.k, s.d];
    fixed = [0, 100];
  }
  const win = bars.slice(from);
  if (kind === "support-and-resistance") {
    const sw = swings(win, 3);
    const width = (atr(bars, 14)[bars.length - 1] ?? 1) * 1;
    for (const l of levels([...sw.highs.map((i) => win[i]!.h), ...sw.lows.map((i) => win[i]!.l)], width, 2).slice(0, 3)) flat.push(l.price);
  }
  if (kind === "trend-lines") {
    const lows = swings(win, 3).lows;
    if (lows.length >= 2) {
      const a = lows[lows.length - 2]!;
      const b = lows[lows.length - 1]!;
      const ln = lineThrough(a, win[a]!.l, b, win[b]!.l);
      ray = { x1: a, y1: win[a]!.l, x2: SHOWN - 1, y2: ln.at(SHOWN - 1) };
    }
  }

  const y = scale([closes, ...on], from, 6, priceBottom);
  const yu = scale(below, from, 62, H - 6, fixed);
  const px = (i: number) => ((i / (SHOWN - 1)) * W).toFixed(1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[13.75rem]" fill="none" strokeLinejoin="round" strokeLinecap="round" aria-hidden focusable="false">
      <path d={path(closes, from, y)} stroke="var(--ink-3)" strokeWidth="1.25" />
      {on.map((s, i) => (
        <path key={i} d={path(s, from, y)} stroke="var(--accent)" strokeWidth="1.5" />
      ))}
      {flat.map((p) => (
        <line key={p} x1="0" x2={W} y1={y(p).toFixed(1)} y2={y(p).toFixed(1)} stroke="var(--accent)" strokeWidth="1.5" />
      ))}
      {ray && <line x1={px(ray.x1)} y1={y(ray.y1).toFixed(1)} x2={px(ray.x2)} y2={y(ray.y2).toFixed(1)} stroke="var(--accent)" strokeWidth="1.5" />}
      {under && <line x1="0" x2={W} y1="57" y2="57" stroke="var(--line)" strokeWidth="1" />}
      {below.map((s, i) => (
        <path key={i} d={path(s, from, yu)} stroke={i === 0 ? "var(--accent)" : "var(--prestige)"} strokeWidth="1.5" />
      ))}
    </svg>
  );
}
