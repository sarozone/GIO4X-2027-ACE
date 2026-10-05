"use client";

import { useMemo, useRef, useState } from "react";
import { clamp, rgba, smooth, TAU, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { ALERT, Note, Slider, Stage } from "@/components/labs/kit";
import type { LessonSlug } from "@/data/chart-school";
import { adx, atr, bollinger, cci, donchian, ema, keltner, levels, lineThrough, macd, parabolicSar, rsiParts, sma, stochastic, swings, trueRange, williamsR, type Series } from "./indicators";
import { CHART, makeBars, type Bar } from "./series";

/**
 * CHART SCHOOL — the one machine on each indicator's page.
 *
 * An invented price (./series.ts) drawn as candles, with the page's indicator
 * drawn over or under it (./indicators.ts), a slider for each of its settings,
 * a button that draws another chart, and one sentence that reads the
 * indicator's latest value in words. Beside the chart the same value is worked
 * out again in the open, with the chart's own numbers.
 *
 * The rule it keeps: the prices are a seeded random walk and say so on the
 * canvas; the indicator is arithmetic on the bars already drawn; nothing here
 * says what a price will do, and nothing is sent or stored.
 */

const PLAY_SECONDS = 1.6;

type Tone = "accent" | "gold" | "teal" | "emerald" | "ink" | "alert";
type Line = { values: Series; tone: Tone; dash?: boolean; label?: string };

type View = {
  /** lines drawn on the price */
  overlays: Line[];
  /** a shaded band on the price */
  fill?: { upper: Series; lower: Series; tone: Tone };
  /** horizontal zones on the price */
  zones?: { price: number; half: number; tone: Tone; label: string }[];
  /** straight lines from a bar to the right-hand edge */
  rays?: { x1: number; y1: number; slope: number; tone: Tone }[];
  /** marks on swing points; `up` for a high */
  dots?: { i: number; y: number; up: boolean }[];
  /** a mark on each bar, placed exactly at its value */
  points?: { values: Series; tone: Tone }[];
  /** a dashed upright at a bar */
  uprights?: number[];
  /** the panel under the price */
  lower?: { title: string; tag: string; lines: Line[]; bars?: Series; range?: [number, number]; guides?: number[]; zero?: boolean; fromZero?: boolean };
  legend: { tone: Tone; label: string }[];
  sentence: string;
  /** always four */
  readout: [string, string][];
  /** the latest value, worked with the chart's own numbers */
  working: string[];
};

type Vals = Record<string, number>;
type Control = { key: string; label: string; min: number; max: number; step?: number; initial: number; text: (v: number) => string };
type Ctx = { bars: Bar[]; from: number; last: number; closes: number[]; n: number; seed: number; g: (key: string) => number };
type Setup = { seed: number; controls: Control[]; tidy?: (v: Vals, changed: string) => Vals; view: (c: Ctx) => View };

const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);
const f3 = (n: number) => n.toFixed(3);
const signed = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(2)}`;
};
/** one decimal place with its sign, for a reading that runs either side of zero */
const signed1 = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(1)}`;
};
/** the same for a reading that is never above zero */
const below0 = (n: number) => signed1(Math.min(0, n));
const at = (s: Series, i: number) => s[i] ?? 0;
const times = (n: number) => (n === 0 ? "not once" : n === 1 ? "once" : n === 2 ? "twice" : `${n} times`);
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const bars = (v: number) => `${v} bars`;

/** how many times two series changed sides between `from` and `last` */
function crossings(a: Series, b: Series, from: number, last: number): number {
  let n = 0;
  for (let i = from + 1; i <= last; i++) {
    const before = at(a, i - 1) - at(b, i - 1);
    const now = at(a, i) - at(b, i);
    if ((before <= 0 && now > 0) || (before >= 0 && now < 0)) n += 1;
  }
  return n;
}

const SETUPS: Record<LessonSlug, Setup> = {
  "moving-averages": {
    seed: 2027,
    controls: [
      { key: "sma", label: "Simple average", min: 2, max: 100, initial: 20, text: bars },
      { key: "ema", label: "Exponential average", min: 2, max: 100, initial: 20, text: bars },
    ],
    view: ({ from, last, closes, n, seed, g }) => {
      const ns = g("sma");
      const ne = g("ema");
      const s = sma(closes, ns);
      const e = ema(closes, ne);
      const c = closes[last]!;
      const sv = at(s, last);
      const ev = at(e, last);
      const where = c > sv && c > ev ? "above both" : c < sv && c < ev ? "below both" : "between the two";
      let sum = 0;
      for (let i = last - ns + 1; i <= last; i++) sum += closes[i]!;
      const k = 2 / (ne + 1);
      return {
        overlays: [
          { values: s, tone: "gold" },
          { values: e, tone: "accent" },
        ],
        legend: [
          { tone: "gold", label: `Simple, ${ns} bars` },
          { tone: "accent", label: `Exponential, ${ne} bars` },
        ],
        sentence: `On chart ${seed} the last close is ${f2(c)}. The ${ns}-bar simple average is ${f2(sv)} and the ${ne}-bar exponential average is ${f2(ev)}: the close is ${where}. In the ${n} bars shown, the close crossed the simple average ${times(crossings(closes, s, from, last))}.`,
        readout: [
          ["Last close", f2(c)],
          [`SMA ${ns}`, f2(sv)],
          [`EMA ${ne}`, f2(ev)],
          ["Close − SMA", signed(c - sv)],
        ],
        working: [
          `SMA = sum of the last ${ns} closes ÷ ${ns} = ${f2(sum)} ÷ ${ns} = ${f2(sv)}`,
          `k = 2 ÷ (${ne} + 1) = ${f3(k)}`,
          `EMA = close × k + previous EMA × (1 − k) = ${f2(c)} × ${f3(k)} + ${f2(at(e, last - 1))} × ${f3(1 - k)} = ${f2(ev)}`,
        ],
      };
    },
  },

  rsi: {
    seed: 314,
    controls: [
      { key: "len", label: "Length", min: 2, max: 30, initial: 14, text: bars },
      { key: "hi", label: "Upper and lower lines", min: 60, max: 90, step: 5, initial: 70, text: (v) => `${v} and ${100 - v}` },
    ],
    view: ({ from, last, closes, n, seed, g }) => {
      const len = g("len");
      const hi = g("hi");
      const lo = 100 - hi;
      const parts = rsiParts(closes, len);
      const v = at(parts.rsi, last);
      const gain = at(parts.gain, last);
      const loss = at(parts.loss, last);
      let above = 0;
      let below = 0;
      for (let i = from; i <= last; i++) {
        if (at(parts.rsi, i) > hi) above += 1;
        else if (at(parts.rsi, i) < lo) below += 1;
      }
      const where = v > hi ? `above the ${hi} line, the area called overbought` : v < lo ? `below the ${lo} line, the area called oversold` : `between the ${lo} and ${hi} lines`;
      return {
        overlays: [],
        lower: { title: `RSI ${len}`, tag: f1(v), lines: [{ values: parts.rsi, tone: "accent" }], range: [0, 100], guides: [lo, 50, hi] },
        legend: [{ tone: "accent", label: `RSI, ${len} bars` }],
        sentence: `The ${len}-bar RSI on chart ${seed} is ${f1(v)}: ${where}. Over the bars it remembers, the average rise was ${f3(gain)} and the average fall ${f3(loss)}. In the ${n} bars shown it was above ${hi} on ${count(above, "bar")} and below ${lo} on ${count(below, "bar")}.`,
        readout: [
          ["RSI", f1(v)],
          ["Average gain", f3(gain)],
          ["Average loss", f3(loss)],
          [`Bars beyond ${hi} / ${lo}`, `${above} / ${below}`],
        ],
        working:
          loss === 0
            ? [`Average gain ${f3(gain)}, average loss 0`, "Nothing was lost in the stretch it remembers, so RSI = 100"]
            : [`Average gain ${f3(gain)}; average loss ${f3(loss)}`, `RS = ${f3(gain)} ÷ ${f3(loss)} = ${f3(gain / loss)}`, `RSI = 100 − 100 ÷ (1 + ${f3(gain / loss)}) = ${f1(v)}`],
      };
    },
  },

  macd: {
    seed: 1618,
    controls: [
      { key: "fast", label: "Fast average", min: 2, max: 30, initial: 12, text: bars },
      { key: "slow", label: "Slow average", min: 5, max: 60, initial: 26, text: bars },
      { key: "signal", label: "Signal", min: 2, max: 20, initial: 9, text: bars },
    ],
    // the fast average is always the shorter one: the slider that was not moved gives way
    tidy: (v, changed) => {
      const fast = v.fast ?? 12;
      const slow = v.slow ?? 26;
      if (fast < slow) return v;
      return changed === "slow" ? { ...v, fast: slow - 1 } : { ...v, slow: fast + 1 };
    },
    view: ({ from, last, closes, n, seed, g }) => {
      const nf = g("fast");
      const nsl = g("slow");
      const ng = g("signal");
      const m = macd(closes, nf, nsl, ng);
      const line = at(m.line, last);
      const sig = at(m.signal, last);
      const hist = at(m.hist, last);
      const growing = Math.abs(hist) > Math.abs(at(m.hist, last - 1));
      return {
        overlays: [
          { values: m.fast, tone: "accent", dash: true },
          { values: m.slow, tone: "gold", dash: true },
        ],
        lower: { title: `MACD ${nf}, ${nsl}, ${ng}`, tag: signed(line), lines: [{ values: m.line, tone: "accent" }, { values: m.signal, tone: "gold" }], bars: m.hist, zero: true },
        legend: [
          { tone: "accent", label: `MACD line (and the ${nf}-bar EMA, dashed)` },
          { tone: "gold", label: `Signal (and the ${nsl}-bar EMA, dashed)` },
          { tone: "emerald", label: "Histogram" },
        ],
        sentence: `MACD (${nf}, ${nsl}, ${ng}) on chart ${seed}: the line is ${signed(line)}, the signal ${signed(sig)} and the histogram ${signed(hist)}. The ${nf}-bar average is ${line >= 0 ? "above" : "below"} the ${nsl}-bar average, the line is ${hist >= 0 ? "above" : "below"} its signal, and the gap between them is ${growing ? "widening" : "narrowing"}. In the ${n} bars shown the line crossed its signal ${times(crossings(m.line, m.signal, from, last))}.`,
        readout: [
          ["MACD line", signed(line)],
          ["Signal", signed(sig)],
          ["Histogram", signed(hist)],
          ["Fast − slow EMA", `${f2(at(m.fast, last))} − ${f2(at(m.slow, last))}`],
        ],
        working: [
          `MACD line = ${nf}-bar EMA − ${nsl}-bar EMA = ${f2(at(m.fast, last))} − ${f2(at(m.slow, last))} = ${signed(line)}`,
          `Signal = ${ng}-bar EMA of the MACD line = ${signed(sig)}`,
          `Histogram = line − signal = ${signed(line)} − (${signed(sig)}) = ${signed(hist)}`,
        ],
      };
    },
  },

  "bollinger-bands": {
    seed: 144,
    controls: [
      { key: "len", label: "Length", min: 5, max: 60, initial: 20, text: bars },
      { key: "k", label: "Width", min: 1, max: 3, step: 0.25, initial: 2, text: (v) => `${v} standard deviations` },
    ],
    view: ({ from, last, closes, n, seed, g }) => {
      const len = g("len");
      const k = g("k");
      const b = bollinger(closes, len, k);
      const c = closes[last]!;
      const mid = at(b.mid, last);
      const sd = at(b.sd, last);
      const up = at(b.upper, last);
      const lo = at(b.lower, last);
      let inside = 0;
      for (let i = from; i <= last; i++) if (closes[i]! <= at(b.upper, i) && closes[i]! >= at(b.lower, i)) inside += 1;
      const pb = up === lo ? 0.5 : (c - lo) / (up - lo);
      const where = c > up ? "above the upper band" : c < lo ? "below the lower band" : `${Math.round(pb * 100)}% of the way from the lower band to the upper`;
      return {
        overlays: [
          { values: b.mid, tone: "gold" },
          { values: b.upper, tone: "accent" },
          { values: b.lower, tone: "accent" },
        ],
        fill: { upper: b.upper, lower: b.lower, tone: "accent" },
        legend: [
          { tone: "gold", label: `Middle: ${len}-bar average` },
          { tone: "accent", label: `Bands: ${k} standard deviations` },
        ],
        sentence: `Bollinger Bands (${len}, ${k}) on chart ${seed}: the middle band is ${f2(mid)}, the upper ${f2(up)} and the lower ${f2(lo)}, so the bands are ${f2(up - lo)} apart. The last close, ${f2(c)}, is ${where}. Of the ${n} closes shown, ${inside} were inside the bands (${Math.round((inside / n) * 100)}%).`,
        readout: [
          ["Upper band", f2(up)],
          ["Middle band", f2(mid)],
          ["Lower band", f2(lo)],
          ["Closes inside", `${inside} of ${n}`],
        ],
        working: [
          `Middle = average of the last ${len} closes = ${f2(mid)}`,
          `Standard deviation of those ${len} closes = ${f3(sd)}`,
          `Upper = ${f2(mid)} + ${k} × ${f3(sd)} = ${f2(up)}`,
          `Lower = ${f2(mid)} − ${k} × ${f3(sd)} = ${f2(lo)}`,
          `%B = (${f2(c)} − ${f2(lo)}) ÷ (${f2(up)} − ${f2(lo)}) = ${f2(pb)}`,
        ],
      };
    },
  },

  atr: {
    seed: 89,
    controls: [
      { key: "len", label: "Length", min: 2, max: 50, initial: 14, text: bars },
      { key: "m", label: "Multiple drawn on the chart", min: 0.5, max: 4, step: 0.5, initial: 2, text: (v) => `${v} × ATR` },
    ],
    view: ({ bars: all, last, closes, seed, g }) => {
      const len = g("len");
      const m = g("m");
      const a = atr(all, len);
      const v = at(a, last);
      const tr = trueRange(all)[last] ?? 0;
      const b = all[last]!;
      const prev = all[last - 1]!.c;
      const c = closes[last]!;
      const upper: Series = a.map((x, i) => (x == null ? null : closes[i]! + m * x));
      const lower: Series = a.map((x, i) => (x == null ? null : closes[i]! - m * x));
      return {
        overlays: [],
        fill: { upper, lower, tone: "teal" },
        lower: { title: `ATR ${len}`, tag: f2(v), lines: [{ values: a, tone: "accent" }], fromZero: true },
        legend: [
          { tone: "accent", label: `ATR, ${len} bars` },
          { tone: "teal", label: `Each close ± ${m} × ATR` },
        ],
        sentence: `The ${len}-bar ATR on chart ${seed} is ${f2(v)}: lately a bar has covered about ${f2(v)} from one extreme to the other, gaps included. That is ${f2((v / c) * 100)}% of the last close, ${f2(c)}, and ${m} ATRs is a distance of ${f2(m * v)}. The figure says how much the price has been moving and nothing about which way.`,
        readout: [
          ["ATR", f2(v)],
          ["As % of the close", `${f2((v / c) * 100)}%`],
          ["Last true range", f2(tr)],
          [`${m} × ATR`, f2(m * v)],
        ],
        working: [
          `High − low = ${f2(b.h)} − ${f2(b.l)} = ${f2(b.h - b.l)}`,
          `|High − previous close| = |${f2(b.h)} − ${f2(prev)}| = ${f2(Math.abs(b.h - prev))}`,
          `|Low − previous close| = |${f2(b.l)} − ${f2(prev)}| = ${f2(Math.abs(b.l - prev))}`,
          `True range = the largest of the three = ${f2(tr)}`,
          `ATR = (previous ATR × ${len - 1} + true range) ÷ ${len} = (${f3(at(a, last - 1))} × ${len - 1} + ${f2(tr)}) ÷ ${len} = ${f2(v)}`,
        ],
      };
    },
  },

  stochastic: {
    seed: 7,
    controls: [
      { key: "len", label: "Length of the range", min: 5, max: 30, initial: 14, text: bars },
      { key: "smooth", label: "%K smoothing", min: 1, max: 5, initial: 3, text: (v) => (v === 1 ? "none (fast)" : bars(v)) },
      { key: "d", label: "%D", min: 2, max: 9, initial: 3, text: bars },
    ],
    view: ({ bars: all, last, closes, seed, g }) => {
      const len = g("len");
      const sm = g("smooth");
      const nd = g("d");
      const s = stochastic(all, len, sm, nd);
      const c = closes[last]!;
      const hh = at(s.high, last);
      const ll = at(s.low, last);
      const raw = at(s.raw, last);
      const k = at(s.k, last);
      const d = at(s.d, last);
      const where = k > 80 ? "above the 80 line, the area called overbought" : k < 20 ? "below the 20 line, the area called oversold" : "between the 20 and 80 lines";
      return {
        overlays: [
          { values: s.high, tone: "ink", dash: true },
          { values: s.low, tone: "ink", dash: true },
        ],
        lower: { title: `STOCHASTIC ${len}, ${sm}, ${nd}`, tag: f1(k), lines: [{ values: s.k, tone: "accent" }, { values: s.d, tone: "gold" }], range: [0, 100], guides: [20, 50, 80] },
        legend: [
          { tone: "accent", label: "%K" },
          { tone: "gold", label: "%D" },
          { tone: "ink", label: `Highest high and lowest low of ${len} bars (dashed)` },
        ],
        sentence: `Stochastic (${len}, ${sm}, ${nd}) on chart ${seed}: the last close, ${f2(c)}, is ${Math.round(raw)}% of the way from the lowest low (${f2(ll)}) to the highest high (${f2(hh)}) of the last ${len} bars. ${sm > 1 ? `Averaged over ${sm} bars, %K is ${f1(k)}` : `%K is ${f1(k)}`} and %D is ${f1(d)}: ${where}, with %K ${k >= d ? "above" : "below"} %D.`,
        readout: [
          ["%K", f1(k)],
          ["%D", f1(d)],
          ["Highest high", f2(hh)],
          ["Lowest low", f2(ll)],
        ],
        working: [
          `Highest high of the last ${len} bars = ${f2(hh)}; lowest low = ${f2(ll)}`,
          hh === ll ? "The range is zero, so the raw figure is shown as 50" : `Raw %K = 100 × (${f2(c)} − ${f2(ll)}) ÷ (${f2(hh)} − ${f2(ll)}) = ${f1(raw)}`,
          sm > 1 ? `%K = average of the last ${sm} raw figures = ${f1(k)}` : `%K = the raw figure = ${f1(k)}`,
          `%D = average of the last ${nd} values of %K = ${f1(d)}`,
        ],
      };
    },
  },

  "support-and-resistance": {
    seed: 233,
    controls: [
      { key: "span", label: "Swing size", min: 2, max: 10, initial: 4, text: (v) => `${v} bars each side` },
      { key: "w", label: "Zone width", min: 0.25, max: 2, step: 0.25, initial: 0.75, text: (v) => `${v} × ATR` },
      { key: "m", label: "Turns a level needs", min: 2, max: 4, initial: 2, text: (v) => `at least ${v}` },
    ],
    view: ({ bars: all, from, last, closes, seed, g }) => {
      const span = g("span");
      const w = g("w");
      const need = g("m");
      const win = all.slice(from);
      const sw = swings(win, span);
      const range = at(atr(all, 14), last);
      const width = w * range;
      const lv = levels([...sw.highs.map((i) => win[i]!.h), ...sw.lows.map((i) => win[i]!.l)], width, need);
      const c = closes[last]!;
      const below = lv.filter((l) => l.price < c);
      const above = lv.filter((l) => l.price >= c);
      const sup = below[below.length - 1];
      const res = above[0];
      const said =
        lv.length === 0
          ? "No group of turns qualifies. Loosen a setting, or draw another chart."
          : `${sup ? `The nearest below the last close (${f2(c)}) is ${f2(sup.price)}, where the price turned ${times(sup.touches)}: support.` : `None is below the last close (${f2(c)}).`} ${res ? `The nearest above is ${f2(res.price)}, where it turned ${times(res.touches)}: resistance.` : "None is above it."}`;
      return {
        overlays: [],
        zones: lv.map((l) => ({ price: l.price, half: width / 2, tone: l.price < c ? ("teal" as const) : ("gold" as const), label: `${l.price < c ? "S" : "R"} ${f2(l.price)} · ${l.touches}` })),
        dots: [...sw.highs.map((i) => ({ i: from + i, y: win[i]!.h, up: true })), ...sw.lows.map((i) => ({ i: from + i, y: win[i]!.l, up: false }))],
        legend: [
          { tone: "teal", label: "Support: a level below the last close" },
          { tone: "gold", label: "Resistance: a level above it" },
          { tone: "ink", label: "A swing high or low" },
        ],
        sentence: `With swings of ${span} bars, zones ${f2(width)} wide and at least ${need} turns, chart ${seed} has ${count(lv.length, "level")} from ${count(sw.highs.length, "swing high")} and ${count(sw.lows.length, "swing low")}. ${said}`,
        readout: [
          ["Levels", String(lv.length)],
          ["Swing highs / lows", `${sw.highs.length} / ${sw.lows.length}`],
          ["Nearest support", sup ? f2(sup.price) : "none"],
          ["Nearest resistance", res ? f2(res.price) : "none"],
        ],
        working: [
          `14-bar ATR at the last bar = ${f2(range)}`,
          `Zone width = ${w} × ${f2(range)} = ${f2(width)}`,
          `Turns found: ${sw.highs.length} highs and ${sw.lows.length} lows`,
          `Groups of at least ${need} turns within ${f2(width)}: ${lv.length}`,
          ...lv.map((l) => `${f2(l.price)} = the average of ${count(l.touches, "turn")} between ${f2(l.low)} and ${f2(l.high)}`).slice(0, 4),
        ],
      };
    },
  },

  "trend-lines": {
    seed: 1597,
    controls: [
      { key: "span", label: "Swing size", min: 2, max: 12, initial: 4, text: (v) => `${v} bars each side` },
      { key: "look", label: "Look back", min: 30, max: 90, step: 5, initial: 60, text: (v) => `the last ${v} bars` },
    ],
    view: ({ bars: all, from, closes, last, seed, n, g }) => {
      const span = g("span");
      const look = Math.min(n, g("look"));
      const win = all.slice(from);
      const start = n - look;
      const sw = swings(win, span);
      const c = closes[last]!;
      const one = (which: "low" | "high") => {
        const idx = (which === "low" ? sw.lows : sw.highs).filter((i) => i >= start);
        if (idx.length < 2) return { ray: null, text: `There are fewer than two swing ${which}s in the last ${look} bars at this swing size, so no line can be drawn through ${which}s.`, work: [`Swing ${which}s in the look-back: ${idx.length}`], value: null as number | null, slope: null as number | null };
        const a = idx[idx.length - 2]!;
        const b = idx[idx.length - 1]!;
        const ya = which === "low" ? win[a]!.l : win[a]!.h;
        const yb = which === "low" ? win[b]!.l : win[b]!.h;
        const ln = lineThrough(a, ya, b, yb);
        const value = ln.at(n - 1);
        const diff = c - value;
        let beyond = 0;
        for (let i = b + 1; i < n; i++) if (which === "low" ? win[i]!.c < ln.at(i) : win[i]!.c > ln.at(i)) beyond += 1;
        const flat = Math.abs(ln.slope) < 0.005;
        const moves = flat ? "is flat" : `${ln.slope > 0 ? "rises" : "falls"} by ${f2(Math.abs(ln.slope))} a bar`;
        return {
          ray: { x1: from + a, y1: ya, slope: ln.slope, tone: which === "low" ? ("teal" as const) : ("gold" as const) },
          text: `The line through the last two swing ${which}s (bars ${a + 1} and ${b + 1} of ${n}) ${moves} and stands at ${f2(value)} at the last bar: the last close, ${f2(c)}, is ${f2(Math.abs(diff))} ${diff >= 0 ? "above" : "below"} it${beyond ? `, and ${count(beyond, "bar")} since its second point ${beyond === 1 ? "has" : "have"} closed ${which === "low" ? "below" : "above"} it` : ""}.`,
          work: [`Swing ${which}s: bar ${a + 1} at ${f2(ya)} and bar ${b + 1} at ${f2(yb)}`, `Slope = (${f2(yb)} − ${f2(ya)}) ÷ (${b + 1} − ${a + 1}) = ${signed(ln.slope)} a bar`, `Line at bar ${n} = ${f2(ya)} + (${signed(ln.slope)}) × (${n} − ${a + 1}) = ${f2(value)}`],
          value,
          slope: ln.slope,
        };
      };
      const lo = one("low");
      const hi = one("high");
      return {
        overlays: [],
        rays: [lo.ray, hi.ray].filter((r): r is NonNullable<typeof r> => r !== null),
        dots: [...sw.highs.filter((i) => i >= start).map((i) => ({ i: from + i, y: win[i]!.h, up: true })), ...sw.lows.filter((i) => i >= start).map((i) => ({ i: from + i, y: win[i]!.l, up: false }))],
        uprights: start > 0 ? [from + start] : [],
        legend: [
          { tone: "teal", label: "Through the last two swing lows" },
          { tone: "gold", label: "Through the last two swing highs" },
          { tone: "ink", label: "A swing high or low" },
        ],
        sentence: `Chart ${seed}, with swings of ${span} bars each side. ${lo.text} ${hi.text}`,
        readout: [
          ["Lows line, last bar", lo.value === null ? "none" : f2(lo.value)],
          ["Lows line, slope", lo.slope === null ? "none" : signed(lo.slope)],
          ["Highs line, last bar", hi.value === null ? "none" : f2(hi.value)],
          ["Highs line, slope", hi.slope === null ? "none" : signed(hi.slope)],
        ],
        working: [...lo.work, ...hi.work],
      };
    },
  },

  adx: {
    seed: 610,
    controls: [
      { key: "len", label: "Length", min: 5, max: 30, initial: 14, text: bars },
      { key: "lvl", label: "Line drawn", min: 15, max: 30, step: 5, initial: 25, text: (v) => `at ${v}` },
    ],
    view: ({ bars: all, from, last, n, seed, g }) => {
      const len = g("len");
      const lvl = g("lvl");
      const d = adx(all, len);
      const v = at(d.adx, last);
      const plus = at(d.plusDI, last);
      const minus = at(d.minusDI, last);
      const dx = at(d.dx, last);
      const range = at(d.tr, last);
      let above = 0;
      let top = 0;
      for (let i = from; i <= last; i++) {
        if (at(d.adx, i) > lvl) above += 1;
        top = Math.max(top, at(d.adx, i), at(d.plusDI, i), at(d.minusDI, i));
      }
      return {
        overlays: [],
        lower: {
          title: `ADX ${len}`,
          tag: f1(v),
          lines: [
            { values: d.adx, tone: "accent" },
            { values: d.plusDI, tone: "emerald" },
            { values: d.minusDI, tone: "alert" },
          ],
          // the three lines seldom leave the lower half of the scale, so the panel shows only as much of it as they use
          range: [0, Math.min(100, Math.max(50, Math.ceil(top / 10) * 10))],
          guides: [lvl],
        },
        legend: [
          { tone: "accent", label: `ADX, ${len} bars` },
          { tone: "emerald", label: "+DI" },
          { tone: "alert", label: "−DI" },
        ],
        sentence: `ADX (${len}) on chart ${seed} is ${f1(v)}: ${v > lvl ? `above the ${lvl} line, which by convention is read as a market that has been moving in one direction` : `at or below the ${lvl} line, which by convention is read as a market without much direction`}. +DI is ${f1(plus)} and −DI is ${f1(minus)}: over the bars it remembers, the ${plus >= minus ? "upward" : "downward"} movement has been the larger. ADX would be the same if the two were exchanged. In the ${n} bars shown it was above ${lvl} on ${count(above, "bar")}.`,
        readout: [
          ["ADX", f1(v)],
          ["+DI", f1(plus)],
          ["−DI", f1(minus)],
          ["DX", f1(dx)],
        ],
        working: [
          `+DI = 100 × smoothed +DM ÷ smoothed true range = 100 × ${f3(at(d.plusDM, last))} ÷ ${f3(range)} = ${f1(plus)}`,
          `−DI = 100 × smoothed −DM ÷ smoothed true range = 100 × ${f3(at(d.minusDM, last))} ÷ ${f3(range)} = ${f1(minus)}`,
          plus + minus === 0 ? "Neither moved, so DX is shown as 0" : `DX = 100 × |${f1(plus)} − ${f1(minus)}| ÷ (${f1(plus)} + ${f1(minus)}) = ${f1(dx)}`,
          `ADX = (previous ADX × ${len - 1} + DX) ÷ ${len} = (${f2(at(d.adx, last - 1))} × ${len - 1} + ${f1(dx)}) ÷ ${len} = ${f1(v)}`,
        ],
      };
    },
  },

  cci: {
    seed: 987,
    controls: [
      { key: "len", label: "Length", min: 5, max: 50, initial: 20, text: bars },
      { key: "lvl", label: "Upper and lower lines", min: 100, max: 200, step: 50, initial: 100, text: (v) => `+${v} and −${v}` },
    ],
    view: ({ bars: all, from, last, n, seed, g }) => {
      const len = g("len");
      const lvl = g("lvl");
      const d = cci(all, len);
      const v = at(d.cci, last);
      const tp = d.tp[last] ?? 0;
      const mean = at(d.mean, last);
      const dev = at(d.dev, last);
      const b = all[last]!;
      let inside = 0;
      let reach = 0;
      for (let i = from; i <= last; i++) {
        const x = at(d.cci, i);
        if (x <= lvl && x >= -lvl) inside += 1;
        reach = Math.max(reach, Math.abs(x));
      }
      // CCI has no limits: the panel reaches as far as the line does, and always far enough to show the two lines
      const edge = Math.max(lvl * 1.2, reach * 1.08);
      const where = v > lvl ? `above the +${lvl} line` : v < -lvl ? `below the −${lvl} line` : `between the −${lvl} and +${lvl} lines`;
      return {
        overlays: [{ values: d.mean, tone: "gold" }],
        lower: { title: `CCI ${len}`, tag: signed1(v), lines: [{ values: d.cci, tone: "accent" }], range: [-edge, edge], guides: [lvl, -lvl], zero: true },
        legend: [
          { tone: "accent", label: `CCI, ${len} bars` },
          { tone: "gold", label: `Average typical price, ${len} bars` },
        ],
        sentence: `The ${len}-bar CCI on chart ${seed} is ${signed1(v)}: ${where}. The last bar’s typical price, ${f2(tp)}, is ${f2(Math.abs(tp - mean))} ${tp >= mean ? "above" : "below"} its ${len}-bar average, ${f2(mean)}, and the typical prices of those bars have stood ${f2(dev)} from that average, on average. Of the ${n} bars shown, ${inside} were between −${lvl} and +${lvl} (${Math.round((inside / n) * 100)}%).`,
        readout: [
          ["CCI", signed1(v)],
          ["Typical price", f2(tp)],
          ["Its average", f2(mean)],
          ["Mean deviation", f3(dev)],
        ],
        working: [
          `Typical price = (high + low + close) ÷ 3 = (${f2(b.h)} + ${f2(b.l)} + ${f2(b.c)}) ÷ 3 = ${f2(tp)}`,
          `Average of the last ${len} typical prices = ${f2(mean)}`,
          `Mean deviation: the average distance of those ${len} from ${f2(mean)} = ${f3(dev)}`,
          dev === 0 ? "There is no deviation at all, so CCI is shown as 0" : `CCI = (${f2(tp)} − ${f2(mean)}) ÷ (0.015 × ${f3(dev)}) = ${signed1(v)}`,
        ],
      };
    },
  },

  "williams-r": {
    seed: 4181,
    controls: [
      { key: "len", label: "Length of the range", min: 5, max: 30, initial: 14, text: bars },
      { key: "lvl", label: "Upper and lower lines", min: 10, max: 30, step: 5, initial: 20, text: (v) => `−${v} and −${100 - v}` },
    ],
    view: ({ bars: all, from, last, closes, n, seed, g }) => {
      const len = g("len");
      const lvl = g("lvl");
      const w = williamsR(all, len);
      const c = closes[last]!;
      const hh = at(w.high, last);
      const ll = at(w.low, last);
      const v = w.r[last] ?? -50;
      let high = 0;
      let low = 0;
      for (let i = from; i <= last; i++) {
        const x = w.r[i] ?? -50;
        if (x > -lvl) high += 1;
        else if (x < lvl - 100) low += 1;
      }
      const where = v > -lvl ? `above the −${lvl} line, the area called overbought` : v < lvl - 100 ? `below the −${100 - lvl} line, the area called oversold` : `between the −${100 - lvl} and −${lvl} lines`;
      return {
        overlays: [
          { values: w.high, tone: "ink", dash: true },
          { values: w.low, tone: "ink", dash: true },
        ],
        lower: { title: `WILLIAMS %R ${len}`, tag: below0(v), lines: [{ values: w.r, tone: "accent" }], range: [-100, 0], guides: [lvl - 100, -lvl] },
        legend: [
          { tone: "accent", label: `%R, ${len} bars` },
          { tone: "ink", label: `Highest high and lowest low of ${len} bars (dashed)` },
        ],
        sentence: `Williams %R (${len}) on chart ${seed}: the last close, ${f2(c)}, is ${Math.round(-v)}% of the way down from the highest high (${f2(hh)}) to the lowest low (${f2(ll)}) of the last ${len} bars, so %R is ${below0(v)}: ${where}. In the ${n} bars shown it was above −${lvl} on ${count(high, "bar")} and below −${100 - lvl} on ${count(low, "bar")}.`,
        readout: [
          ["%R", below0(v)],
          ["Highest high", f2(hh)],
          ["Lowest low", f2(ll)],
          [`Bars beyond −${lvl} / −${100 - lvl}`, `${high} / ${low}`],
        ],
        working: [
          `Highest high of the last ${len} bars = ${f2(hh)}; lowest low = ${f2(ll)}`,
          hh === ll ? "The range is zero, so %R is shown as −50" : `%R = −100 × (${f2(hh)} − ${f2(c)}) ÷ (${f2(hh)} − ${f2(ll)}) = ${below0(v)}`,
          `The stochastic’s raw %K for the same bar = %R + 100 = ${f1(v + 100)}`,
        ],
      };
    },
  },

  "parabolic-sar": {
    seed: 2584,
    controls: [
      { key: "step", label: "Step", min: 0.01, max: 0.05, step: 0.01, initial: 0.02, text: (v) => v.toFixed(2) },
      { key: "max", label: "Maximum", min: 0.1, max: 0.4, step: 0.05, initial: 0.2, text: (v) => v.toFixed(2) },
    ],
    view: ({ bars: all, from, last, closes, n, seed, g }) => {
      const step = g("step");
      const max = g("max");
      const p = parabolicSar(all, step, max);
      const up = p.rising[last] === true;
      const wasUp = p.rising[last - 1] === true;
      const v = at(p.sar, last);
      const c = closes[last]!;
      const b = all[last]!;
      const prev = at(p.sar, last - 1);
      const ep = at(p.ep, last - 1);
      const af = at(p.af, last - 1);
      const raw = prev + af * (ep - prev);
      const flipped = up !== wasUp;
      let flips = 0;
      for (let i = from + 1; i <= last; i++) if (p.rising[i] !== p.rising[i - 1]) flips += 1;
      let run = 1;
      for (let i = last; i > 1 && p.rising[i - 1] === p.rising[i]; i--) run += 1;
      const outcome = flipped
        ? `The bar’s ${wasUp ? "low" : "high"}, ${f2(wasUp ? b.l : b.h)}, crossed it: the SAR goes to the extreme of the run just ended, ${f2(v)}, and the factor back to ${step.toFixed(2)}`
        : Math.abs(raw - v) > 1e-9
          ? `Held at ${f2(v)}: it may not pass the ${up ? "lows" : "highs"} of the two bars before`
          : `The bar’s ${up ? "low" : "high"}, ${f2(up ? b.l : b.h)}, did not reach it, so it stands at ${f2(v)}`;
      return {
        overlays: [],
        points: [
          { values: p.sar.map((x, i) => (p.rising[i] === true ? x : null)), tone: "teal" },
          { values: p.sar.map((x, i) => (p.rising[i] === false ? x : null)), tone: "gold" },
        ],
        legend: [
          { tone: "teal", label: "SAR under the bars: a rising run" },
          { tone: "gold", label: "SAR over the bars: a falling run" },
        ],
        sentence: `Parabolic SAR (${step.toFixed(2)}, ${max.toFixed(2)}) on chart ${seed}: the SAR is ${f2(v)}, which is ${f2(Math.abs(c - v))} ${up ? "below" : "above"} the last close, ${f2(c)}, and it has been on that side for ${count(run, "bar")}. The extreme point of this run is ${f2(at(p.ep, last))} and the acceleration factor stands at ${at(p.af, last).toFixed(2)}. In the ${n} bars shown the SAR changed sides ${times(flips)}.`,
        readout: [
          ["SAR", f2(v)],
          ["Side", up ? "Under: rising" : "Over: falling"],
          ["Extreme point", f2(at(p.ep, last))],
          ["Acceleration factor", at(p.af, last).toFixed(2)],
        ],
        working: [
          `Before this bar: SAR ${f2(prev)}, extreme point ${f2(ep)}, acceleration factor ${af.toFixed(2)}`,
          `SAR = ${f2(prev)} + ${af.toFixed(2)} × (${f2(ep)} − ${f2(prev)}) = ${f2(raw)}`,
          outcome,
          `After this bar: extreme point ${f2(at(p.ep, last))}, acceleration factor ${at(p.af, last).toFixed(2)}`,
        ],
      };
    },
  },

  "donchian-channels": {
    seed: 55,
    controls: [{ key: "len", label: "Length", min: 5, max: 60, initial: 20, text: bars }],
    view: ({ bars: all, from, last, closes, n, seed, g }) => {
      const len = g("len");
      const d = donchian(all, len);
      const c = closes[last]!;
      const b = all[last]!;
      const up = at(d.upper, last);
      const lo = at(d.lower, last);
      const mid = at(d.mid, last);
      let highs = 0;
      let lows = 0;
      for (let i = from; i <= last; i++) {
        if (all[i]!.h === d.upper[i]) highs += 1;
        if (all[i]!.l === d.lower[i]) lows += 1;
      }
      const share = up === lo ? 50 : Math.round(((c - lo) / (up - lo)) * 100);
      return {
        overlays: [
          { values: d.mid, tone: "gold" },
          { values: d.upper, tone: "accent" },
          { values: d.lower, tone: "accent" },
        ],
        fill: { upper: d.upper, lower: d.lower, tone: "accent" },
        legend: [
          { tone: "accent", label: `Highest high and lowest low of ${len} bars` },
          { tone: "gold", label: "Middle: halfway between them" },
        ],
        sentence: `Donchian channel (${len}) on chart ${seed}: the highest high of the last ${len} bars is ${f2(up)} and the lowest low is ${f2(lo)}, so the channel is ${f2(up - lo)} wide and its middle is ${f2(mid)}. The last close, ${f2(c)}, is ${share}% of the way from the lower line to the upper. Of the ${n} bars shown, ${highs} set the upper line with their own high and ${lows} set the lower line with their own low.`,
        readout: [
          ["Upper line", f2(up)],
          ["Middle", f2(mid)],
          ["Lower line", f2(lo)],
          ["Width", f2(up - lo)],
        ],
        working: [
          `Upper = the highest high of the last ${len} bars = ${f2(up)}`,
          `Lower = the lowest low of the last ${len} bars = ${f2(lo)}`,
          `Middle = (${f2(up)} + ${f2(lo)}) ÷ 2 = ${f2(mid)}`,
          `Width = ${f2(up)} − ${f2(lo)} = ${f2(up - lo)}`,
          b.h === up ? `The last bar’s high, ${f2(b.h)}, is the upper line` : b.l === lo ? `The last bar’s low, ${f2(b.l)}, is the lower line` : `The last bar, ${f2(b.l)} to ${f2(b.h)}, set neither line`,
        ],
      };
    },
  },

  "keltner-channels": {
    seed: 377,
    controls: [
      { key: "len", label: "Average (EMA)", min: 5, max: 60, initial: 20, text: bars },
      { key: "atr", label: "ATR length", min: 5, max: 30, initial: 10, text: bars },
      { key: "m", label: "Width", min: 1, max: 3, step: 0.25, initial: 2, text: (v) => `${v} × ATR` },
    ],
    view: ({ bars: all, from, last, closes, n, seed, g }) => {
      const len = g("len");
      const na = g("atr");
      const m = g("m");
      const k = keltner(all, len, na, m);
      const c = closes[last]!;
      const mid = at(k.mid, last);
      const range = at(k.atr, last);
      const up = at(k.upper, last);
      const lo = at(k.lower, last);
      let inside = 0;
      for (let i = from; i <= last; i++) if (closes[i]! <= at(k.upper, i) && closes[i]! >= at(k.lower, i)) inside += 1;
      const where = c > up ? "above the upper line" : c < lo ? "below the lower line" : `${up === lo ? 50 : Math.round(((c - lo) / (up - lo)) * 100)}% of the way from the lower line to the upper`;
      return {
        overlays: [
          { values: k.mid, tone: "gold" },
          { values: k.upper, tone: "accent" },
          { values: k.lower, tone: "accent" },
        ],
        fill: { upper: k.upper, lower: k.lower, tone: "accent" },
        legend: [
          { tone: "gold", label: `Middle: ${len}-bar EMA` },
          { tone: "accent", label: `Lines: ${m} × the ${na}-bar ATR` },
        ],
        sentence: `Keltner channel (${len}, ${na}, ${m}) on chart ${seed}: the middle line is ${f2(mid)} and the ${na}-bar ATR is ${f2(range)}, so the upper line is ${f2(up)} and the lower ${f2(lo)}, ${f2(up - lo)} apart. The last close, ${f2(c)}, is ${where}. Of the ${n} closes shown, ${inside} were inside the channel (${Math.round((inside / n) * 100)}%).`,
        readout: [
          ["Upper line", f2(up)],
          ["Middle line", f2(mid)],
          ["Lower line", f2(lo)],
          ["Closes inside", `${inside} of ${n}`],
        ],
        working: [
          `Middle = ${len}-bar EMA of the close = ${f2(mid)}`,
          `ATR over ${na} bars = ${f3(range)}`,
          `Upper = ${f2(mid)} + ${m} × ${f3(range)} = ${f2(up)}`,
          `Lower = ${f2(mid)} − ${m} × ${f3(range)} = ${f2(lo)}`,
        ],
      };
    },
  },
};

const toneOf = (pal: Palette, tone: Tone): Colour => (tone === "alert" ? ALERT : tone === "ink" ? pal.ink2 : pal[tone]);
/** the same tones for the legend under the canvas, from the page's own tokens */
const SWATCH: Record<Tone, string> = { accent: "var(--accent)", gold: "var(--prestige)", teal: "var(--teal)", emerald: "var(--emerald)", ink: "var(--ink-2)", alert: "rgb(214, 96, 88)" };

const initial = (setup: Setup): Vals => Object.fromEntries(setup.controls.map((c) => [c.key, c.initial]));

export function IndicatorMachine({ kind }: { kind: LessonSlug }) {
  const setup = SETUPS[kind];
  const [seed, setSeed] = useState(setup.seed);
  const [vals, setVals] = useState<Vals>(() => initial(setup));
  /** rises on every change, so the one still frame under reduced motion is drawn again */
  const [rev, setRev] = useState(0);
  /** the moment the chart began to draw itself; −1 asks for it to begin again */
  const playFrom = useRef(-1);

  const all = useMemo(() => makeBars(seed), [seed]);
  const from = all.length - CHART.shown;
  const view = useMemo(() => {
    const last = all.length - 1;
    return setup.view({ bars: all, from, last, closes: all.map((b) => b.c), n: CHART.shown, seed, g: (key) => vals[key] ?? 0 });
  }, [setup, all, from, seed, vals]);

  const change = (key: string, value: number) => {
    setVals((v) => {
      const next = { ...v, [key]: value };
      return setup.tidy ? setup.tidy(next, key) : next;
    });
    setRev((n) => n + 1);
  };
  const replay = () => {
    playFrom.current = -1;
    setRev((n) => n + 1);
  };

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, hover, mx }) => {
        if (w < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : smooth(clamp((t - playFrom.current) / PLAY_SECONDS));
        const n = all.length - from;
        const last = all.length - 1;
        const shown = Math.max(2, Math.ceil(p * n));
        const end = from + shown;
        /** how present the things that belong to the whole chart are: they arrive as the last bars do */
        const whole = still ? 1 : clamp((p - 0.7) / 0.3);
        const padX = 10;
        const top = 24;
        const lower = view.lower;
        const split = lower ? Math.round(h * 0.6) : h - 8;
        const bottom = split - 8;
        // a line that is carried past the last bar needs somewhere to go
        const slots = n + (view.rays ? 8 : 0);
        const step = (w - padX * 2) / slots;
        const x = (i: number) => padX + (i - from + 0.5) * step;

        let lo = Infinity;
        let hi = -Infinity;
        for (let i = from; i <= last; i++) {
          const b = all[i]!;
          if (b.l < lo) lo = b.l;
          if (b.h > hi) hi = b.h;
        }
        const reach = hi - lo || 1;
        let lo2 = lo;
        let hi2 = hi;
        const widen = (s: Series) => {
          for (let i = from; i <= last; i++) {
            const v = s[i];
            if (v == null) continue;
            if (v < lo2) lo2 = v;
            if (v > hi2) hi2 = v;
          }
        };
        for (const o of view.overlays) widen(o.values);
        for (const pt of view.points ?? []) widen(pt.values);
        if (view.fill) {
          widen(view.fill.upper);
          widen(view.fill.lower);
        }
        // the candles keep most of the height whatever is drawn around them
        lo2 = Math.max(lo2, lo - reach * 0.3);
        hi2 = Math.min(hi2, hi + reach * 0.3);
        const y = (v: number) => bottom - ((v - lo2) / (hi2 - lo2 || 1)) * (bottom - top);

        const stroke = (values: Series, map: (v: number) => number) => {
          ctx.beginPath();
          let started = false;
          for (let i = from; i < end; i++) {
            const v = values[i];
            if (v == null) {
              started = false;
              continue;
            }
            if (!started) ctx.moveTo(x(i), map(v));
            else ctx.lineTo(x(i), map(v));
            started = true;
          }
          ctx.stroke();
        };

        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText(`INVENTED PRICES · CHART ${seed}`, padX, 11);

        // which bar the pointer is over, if it is over one
        const over = hover > 0.05 ? Math.round(clamp((mx - padX) / step - 0.5, 0, shown - 1)) + from : -1;
        ctx.textAlign = "right";
        ctx.fillStyle = rgba(pal.ink, 1);
        if (over >= 0 && w >= 380) ctx.fillText(`BAR ${over - from + 1} · CLOSE ${f2(all[over]!.c)}`, w - padX, 11);
        else if (w >= 300) ctx.fillText(`LAST CLOSE ${f2(all[last]!.c)}`, w - padX, 11);
        ctx.textAlign = "left";

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, top - 6, w, bottom - top + 12);
        ctx.clip();

        for (const u of view.uprights ?? []) {
          ctx.strokeStyle = rgba(pal.ink3, 0.7 * whole);
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(x(u) - step / 2, top);
          ctx.lineTo(x(u) - step / 2, bottom);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        for (const z of view.zones ?? []) {
          const colour = toneOf(pal, z.tone);
          const y0 = y(z.price + z.half);
          const y1 = y(z.price - z.half);
          ctx.fillStyle = rgba(colour, 0.16 * whole);
          ctx.fillRect(padX, y0, w - padX * 2, Math.max(2, y1 - y0));
          ctx.strokeStyle = rgba(colour, 0.9 * whole);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padX, y(z.price));
          ctx.lineTo(w - padX, y(z.price));
          ctx.stroke();
        }

        if (view.fill) {
          const { upper, lower: under, tone } = view.fill;
          ctx.fillStyle = rgba(toneOf(pal, tone), 0.11);
          ctx.beginPath();
          let first = -1;
          let lastOne = -1;
          for (let i = from; i < end; i++) {
            const v = upper[i];
            if (v == null || under[i] == null) continue;
            if (first < 0) {
              first = i;
              ctx.moveTo(x(i), y(v));
            } else ctx.lineTo(x(i), y(v));
            lastOne = i;
          }
          for (let i = lastOne; i >= first && first >= 0; i--) ctx.lineTo(x(i), y(under[i] ?? 0));
          ctx.closePath();
          ctx.fill();
        }

        // the candles: a wick from high to low, a body from open to close; a falling bar is the darker one
        const bodyW = Math.max(1, Math.min(9, step * 0.62));
        for (let i = from; i < end; i++) {
          const b = all[i]!;
          const up = b.c >= b.o;
          ctx.strokeStyle = rgba(pal.ink3, 0.85);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x(i), y(b.h));
          ctx.lineTo(x(i), y(b.l));
          ctx.stroke();
          const a = y(Math.max(b.o, b.c));
          const z = y(Math.min(b.o, b.c));
          ctx.fillStyle = up ? rgba(pal.ink3, 0.75) : rgba(pal.ink, 0.92);
          ctx.fillRect(x(i) - bodyW / 2, a, bodyW, Math.max(1, z - a));
        }

        for (const o of view.overlays) {
          ctx.strokeStyle = rgba(toneOf(pal, o.tone), o.dash ? 0.75 : 1);
          ctx.lineWidth = o.dash ? 1 : 1.6;
          if (o.dash) ctx.setLineDash([3, 3]);
          stroke(o.values, y);
          ctx.setLineDash([]);
        }

        // one mark to a bar, exactly at its value: nothing joins them, because nothing lies between them
        for (const pt of view.points ?? []) {
          const size = Math.max(1.2, Math.min(2.2, step * 0.3));
          ctx.fillStyle = rgba(toneOf(pal, pt.tone), 1);
          for (let i = from; i < end; i++) {
            const v = pt.values[i];
            if (v == null) continue;
            ctx.beginPath();
            ctx.arc(x(i), y(v), size, 0, TAU);
            ctx.fill();
          }
        }

        for (const r of view.rays ?? []) {
          const colour = toneOf(pal, r.tone);
          const xl = x(last);
          const xe = x(from + slots - 1);
          const at2 = (i: number) => r.y1 + r.slope * (i - r.x1);
          ctx.strokeStyle = rgba(colour, whole);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x(r.x1), y(r.y1));
          ctx.lineTo(xl, y(at2(last)));
          ctx.stroke();
          // past the last bar there are no prices: the line is only carried on
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = rgba(colour, 0.75 * whole);
          ctx.beginPath();
          ctx.moveTo(xl, y(at2(last)));
          ctx.lineTo(xe, y(at2(from + slots - 1)));
          ctx.stroke();
          ctx.setLineDash([]);
        }

        for (const d of view.dots ?? []) {
          if (d.i >= end) continue;
          const dy = y(d.y) + (d.up ? -7 : 7);
          ctx.fillStyle = rgba(pal.ink2, 0.95);
          ctx.beginPath();
          ctx.arc(x(d.i), dy, 2.2, 0, TAU);
          ctx.fill();
        }

        // the last close, marked; it breathes while the page is in motion
        if (p >= 1) {
          const cx = x(last);
          const cy = y(all[last]!.c);
          if (!still) {
            const beat = 0.5 + 0.5 * Math.sin(t * 2.4);
            ctx.strokeStyle = rgba(pal.accent, 0.5 * (1 - beat));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, 4 + beat * 6, 0, TAU);
            ctx.stroke();
          }
          ctx.fillStyle = rgba(pal.accent, 1);
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, TAU);
          ctx.fill();
        }
        ctx.restore();

        // the names of the zones, outside the clip so that none is cut in half
        for (const z of view.zones ?? []) {
          ctx.fillStyle = rgba(pal.ink, whole);
          ctx.fillText(z.label, padX + 3, clamp(y(z.price) - 7, top, bottom));
        }

        let yl: ((v: number) => number) | null = null;
        if (lower) {
          const lt = split + 24;
          const lb = h - 8;
          let a = Infinity;
          let b = -Infinity;
          if (lower.range) [a, b] = lower.range;
          else {
            for (const s of [...lower.lines.map((l) => l.values), ...(lower.bars ? [lower.bars] : [])]) {
              for (let i = from; i <= last; i++) {
                const v = s[i];
                if (v == null) continue;
                if (v < a) a = v;
                if (v > b) b = v;
              }
            }
            if (!Number.isFinite(a)) [a, b] = [0, 1];
            if (lower.zero) {
              const m = Math.max(Math.abs(a), Math.abs(b)) || 1;
              a = -m;
              b = m;
            }
            if (lower.fromZero) {
              a = 0;
              b = b * 1.12 || 1;
            }
          }
          const map = (v: number) => lb - ((v - a) / (b - a || 1)) * (lb - lt);
          yl = map;

          ctx.strokeStyle = rgba(pal.line, 1);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padX, split);
          ctx.lineTo(w - padX, split);
          ctx.stroke();
          ctx.fillStyle = rgba(pal.ink3, 1);
          ctx.fillText(lower.title.toUpperCase(), padX, split + 12);
          ctx.textAlign = "right";
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.fillText(over >= 0 ? (lower.lines[0]?.values[over] == null ? "" : f2(lower.lines[0].values[over] ?? 0)) : lower.tag, w - padX, split + 12);
          ctx.textAlign = "left";

          for (const gv of lower.guides ?? []) {
            ctx.strokeStyle = rgba(pal.ink3, gv === 50 ? 0.35 : 0.75);
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(padX, map(gv));
            ctx.lineTo(w - padX, map(gv));
            ctx.stroke();
            ctx.setLineDash([]);
            if (gv !== 50) {
              ctx.fillStyle = rgba(pal.ink3, 1);
              ctx.fillText(String(gv), padX + 2, map(gv) + (gv > 50 ? 8 : -7));
            }
          }
          if (lower.zero) {
            ctx.strokeStyle = rgba(pal.ink3, 0.7);
            ctx.beginPath();
            ctx.moveTo(padX, map(0));
            ctx.lineTo(w - padX, map(0));
            ctx.stroke();
          }
          if (lower.bars) {
            const bw = Math.max(1, step * 0.62);
            for (let i = from; i < end; i++) {
              const v = lower.bars[i];
              if (v == null) continue;
              const y0 = map(Math.max(v, 0));
              const y1 = map(Math.min(v, 0));
              ctx.fillStyle = rgba(v >= 0 ? pal.emerald : ALERT, 0.6);
              ctx.fillRect(x(i) - bw / 2, y0, bw, Math.max(1, y1 - y0));
            }
          }
          for (const l of lower.lines) {
            ctx.strokeStyle = rgba(toneOf(pal, l.tone), 1);
            ctx.lineWidth = 1.6;
            stroke(l.values, map);
          }
        }

        // under the pointer: one upright through both panels, and a dot where it meets each line
        if (over >= 0) {
          ctx.strokeStyle = rgba(pal.ink2, 0.5 * hover);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x(over), top);
          ctx.lineTo(x(over), h - 8);
          ctx.stroke();
          const dot = (l: Line, map: (v: number) => number) => {
            const v = l.values[over];
            if (v == null) return;
            ctx.fillStyle = rgba(toneOf(pal, l.tone), hover);
            ctx.beginPath();
            ctx.arc(x(over), map(v), 3, 0, TAU);
            ctx.fill();
          };
          for (const o of view.overlays) if (y(o.values[over] ?? lo2) >= top - 6 && y(o.values[over] ?? lo2) <= bottom + 6) dot(o, y);
          if (lower && yl) for (const l of lower.lines) dot(l, yl);
        }
      },
    [all, from, view, seed],
  );

  return (
    <div>
      <div className="grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Stage draw={draw} ratio={1.5} rev={rev} />
          <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-3 text-xs text-ink-3" aria-hidden>
            {view.legend.map((l) => (
              <li key={l.label} className="flex items-center gap-5">
                <span className="inline-block h-[2px] w-13" style={{ background: SWATCH[l.tone] }} />
                {l.label}
              </li>
            ))}
          </ul>
          <p className="mt-13 min-h-[6rem] text-ink-2" aria-live="polite">
            {view.sentence}
          </p>
          <dl className="mt-13 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
            {view.readout.map(([k, v], i) => (
              <div key={`${k}-${i}`} className="bg-surface p-13">
                <dt className="label">{k}</dt>
                <dd className="num mt-3 text-lg text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <Note>
            An invented chart: {CHART.shown} bars of a seeded random walk that starts at {CHART.start}, with {CHART.bars - CHART.shown} earlier bars, not drawn, so that every line is fully formed where the chart begins. Not a real instrument, not market data and not a forecast.
          </Note>
        </div>

        <div className="panel grid gap-13 p-21">
          <div>
            <p className="eyebrow">Settings</p>
            {setup.controls.map((c) => (
              <Slider key={c.key} label={c.label} value={vals[c.key] ?? c.initial} min={c.min} max={c.max} step={c.step ?? 1} onChange={(v) => change(c.key, v)} text={c.text(vals[c.key] ?? c.initial)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-8 border-t border-line pt-13">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // a new chart number, drawn on a click and never while rendering
                setSeed(1 + Math.floor(Math.random() * 99999));
                replay();
              }}
            >
              Another chart
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setVals(initial(setup));
                setSeed(setup.seed);
                replay();
              }}
            >
              Reset
            </button>
          </div>
          <div className="border-t border-line pt-13">
            <p className="eyebrow">The last bar, worked</p>
            <ol className="mt-8 grid gap-5 text-sm text-ink-2">
              {view.working.map((line, i) => (
                <li key={i} className="num break-words">
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
