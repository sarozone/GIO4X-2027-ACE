import type { LessonSlug } from "@/data/chart-school";
import { adx, atr, bollinger, cci, donchian, ichimoku, keltner, levels, lineThrough, macd, obv, parabolicSar, rsi, sma, stochastic, swings, vwap, williamsR, type Series } from "./indicators";
import { makeBars, makeVolumes } from "./series";

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

/** `slots` is how many bars' width the drawing is divided into: more than are shown when something is drawn ahead of the last one */
const path = (values: readonly (number | null)[], from: number, y: (v: number) => number, slots: number = SHOWN) => {
  let d = "";
  let pen = false;
  for (let i = from; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${(((i - from) / (slots - 1)) * W).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
};

/** The space between two lines as closed shapes: one path where `a` is the higher and one where `b` is, parted exactly where they cross. */
const between = (a: Series, b: Series, from: number, y: (v: number) => number, slots: number) => {
  const x = (i: number) => ((i - from) / (slots - 1)) * W;
  const out = { a: "", b: "" };
  let run: [number, number, number][] = [];
  let aOver = true;
  let pa = 0;
  let pb = 0;
  const close = () => {
    if (run.length > 1) {
      const d = `${run.map(([px, ya], k) => `${k ? "L" : "M"}${px.toFixed(1)} ${ya.toFixed(1)}`).join("")}${[...run].reverse().map(([px, , yb]) => `L${px.toFixed(1)} ${yb.toFixed(1)}`).join("")}Z`;
      if (aOver) out.a += d;
      else out.b += d;
    }
    run = [];
  };
  for (let i = from; i < a.length; i++) {
    const va = a[i];
    const vb = b[i];
    if (va == null || vb == null) {
      close();
      continue;
    }
    if (run.length && va >= vb !== aOver) {
      const f = (pa - pb) / (pa - pb - (va - vb));
      const q: [number, number, number] = [x(i - 1) + f * (x(i) - x(i - 1)), y(pa + f * (va - pa)), y(pa + f * (va - pa))];
      run.push(q);
      close();
      run.push(q);
    }
    aOver = va >= vb;
    run.push([x(i), y(va), y(vb)]);
    pa = va;
    pb = vb;
  }
  close();
  return out;
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
  const under = kind === "rsi" || kind === "macd" || kind === "atr" || kind === "stochastic" || kind === "adx" || kind === "cci" || kind === "williams-r" || kind === "obv";
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
  if (kind === "adx") {
    const a = adx(bars, 14);
    below = [a.adx, a.plusDI];
  }
  if (kind === "cci") below = [cci(bars, 20).cci];
  if (kind === "williams-r") {
    below = [williamsR(bars, 14).r];
    fixed = [-100, 0];
  }
  if (kind === "donchian-channels") {
    const d = donchian(bars, 20);
    on.push(d.upper, d.lower);
  }
  if (kind === "keltner-channels") {
    const k = keltner(bars, 20, 10, 2);
    on.push(k.upper, k.lower);
  }
  if (kind === "parabolic-sar") {
    // one path for each side of the price, so that no line is drawn across a reversal
    const p = parabolicSar(bars, 0.02, 0.2);
    on.push(
      p.sar.map((v, i) => (p.rising[i] === true ? v : null)),
      p.sar.map((v, i) => (p.rising[i] === false ? v : null)),
    );
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

  // the three that came later: one drawn partly ahead of the last bar, two made with the invented volume
  let slots = SHOWN;
  let spans: { a: Series; b: Series } | null = null;
  if (kind === "ichimoku") {
    const k = ichimoku(bars, 9, 26, 52);
    spans = { a: k.a, b: k.b };
    slots = SHOWN + k.shift;
  }
  if (kind === "obv") below = [obv(closes, makeVolumes(SEED, bars))];
  if (kind === "vwap") {
    // one path for each session in turn, so that no line is drawn across a reset
    const v = vwap(bars, makeVolumes(SEED, bars), 20).vwap;
    on.push(
      v.map((x, i) => (Math.floor(i / 20) % 2 === 0 ? x : null)),
      v.map((x, i) => (Math.floor(i / 20) % 2 === 1 ? x : null)),
    );
  }

  const y = scale([closes, ...on, ...(spans ? [spans.a, spans.b] : [])], from, 6, priceBottom);
  const yu = scale(below, from, 62, H - 6, fixed);
  const px = (i: number) => ((i / (SHOWN - 1)) * W).toFixed(1);
  const cloud = spans ? between(spans.a, spans.b, from, y, slots) : null;
  /** where the prices stop, when something is drawn past them */
  const edge = (((SHOWN - 0.5) / (slots - 1)) * W).toFixed(1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[13.75rem]" fill="none" strokeLinejoin="round" strokeLinecap="round" aria-hidden focusable="false">
      {spans && cloud && (
        <>
          <path d={cloud.a} fill="var(--teal)" fillOpacity="0.22" />
          <path d={cloud.b} fill="var(--prestige)" fillOpacity="0.22" />
          <line x1={edge} x2={edge} y1="6" y2={priceBottom} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="2 3" />
          <path d={path(spans.a, from, y, slots)} stroke="var(--teal)" strokeWidth="1" />
          <path d={path(spans.b, from, y, slots)} stroke="var(--prestige)" strokeWidth="1" />
        </>
      )}
      <path d={path(closes, from, y, slots)} stroke="var(--ink-3)" strokeWidth="1.25" />
      {on.map((s, i) => (
        <path key={i} d={path(s, from, y, slots)} stroke="var(--accent)" strokeWidth="1.5" />
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
