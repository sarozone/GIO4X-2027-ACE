/**
 * Proves the arithmetic of Chart school (src/components/chart-school/indicators.ts).
 *
 *   node scripts/test-chart-school.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the module has no
 * imports of its own). Four kinds of check:
 *   1. the worked example printed on each indicator's page
 *      (src/data/chart-school.ts), with the working written beside each
 *      expectation, so a page and the arithmetic cannot disagree unnoticed;
 *   2. further cases worked by hand for the edges a page does not show;
 *   3. the invented series itself (src/components/chart-school/series.ts):
 *      that every price is exactly what it was before a volume was added
 *      beside it, and that the volume is what its page says it is;
 *   4. properties that must hold on any chart (a scale's limits, a channel
 *      that contains its bars), over several invented charts.
 */
import { createHash } from "node:crypto";
import * as I from "../src/components/chart-school/indicators.ts";
import { CHART, VOLUME, makeBars, makeVolumes } from "../src/components/chart-school/series.ts";

let passed = 0;
const failures = [];
function ok(name, cond, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
function eq(name, got, want, tol = 1e-9) {
  ok(name, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
}
const isNull = (name, got) => ok(name, got === null, `got ${got}, expected null`);
/** bars written high / low / close, as the pages write them; the open is not used by any sum */
const hlc = (rows) => rows.map(([h, l, c]) => ({ o: c, h, l, c }));

/* ---- 1. the worked examples on the pages ----------------------------------- */

{
  // moving averages: closes 10, 12, 11, 13, 16; length 3
  const c = [10, 12, 11, 13, 16];
  const s = I.sma(c, 3);
  isNull("SMA: no value before 3 bars", s[1]);
  eq("SMA bar 3: (10 + 12 + 11) ÷ 3", s[2], 11);
  eq("SMA bar 4: (12 + 11 + 13) ÷ 3", s[3], 12);
  eq("SMA bar 5: (11 + 13 + 16) ÷ 3", s[4], 40 / 3);
  const e = I.ema(c, 3);
  eq("EMA bar 3: starts from the simple average", e[2], 11);
  eq("EMA bar 4: 13 × 0.5 + 11 × 0.5", e[3], 12);
  eq("EMA bar 5: 16 × 0.5 + 12 × 0.5", e[4], 14);
}

{
  // RSI: closes 10, 11, 10, 12, 13, 12; length 3; changes +1, −1, +2, +1, −1
  const p = I.rsiParts([10, 11, 10, 12, 13, 12], 3);
  isNull("RSI: no value before 3 changes", p.rsi[2]);
  eq("RSI: first average gain (1 + 0 + 2) ÷ 3", p.gain[3], 1);
  eq("RSI: first average loss (0 + 1 + 0) ÷ 3", p.loss[3], 1 / 3);
  eq("RSI: RS 3, so 100 − 100 ÷ 4", p.rsi[3], 75);
  // gain (1 × 2 + 1) ÷ 3 = 1; loss (1/3 × 2) ÷ 3 = 2/9; RS 4.5; 100 − 100 ÷ 5.5
  eq("RSI: second value", p.rsi[4], 100 - 100 / 5.5);
  // gain 2/3; loss (2/9 × 2 + 1) ÷ 3 = 13/27; RS = 18/13; 100 − 100 ÷ (31/13)
  eq("RSI: third value", p.rsi[5], 100 - 1300 / 31);
  eq("RSI: third value as the page prints it", Math.round(p.rsi[5] * 10) / 10, 58.1);
  // nothing lost at all: 100; nothing moved at all: 50
  eq("RSI: only rises reads 100", I.rsi([1, 2, 3, 4, 5], 3)[4], 100);
  eq("RSI: no movement reads 50", I.rsi([5, 5, 5, 5, 5], 3)[4], 50);
}

{
  // MACD: closes 10, 12, 11, 13, 16, 14; fast 2, slow 3, signal 2
  const m = I.macd([10, 12, 11, 13, 16, 14], 2, 3, 2);
  // fast (k = 2/3): 11, then 11, 37/3, 133/9, 385/27
  eq("MACD: fast EMA bar 2", m.fast[1], 11);
  eq("MACD: fast EMA bar 4", m.fast[3], 37 / 3);
  eq("MACD: fast EMA bar 6", m.fast[5], 385 / 27);
  // slow (k = 0.5): 11, 12, 14, 14
  eq("MACD: slow EMA bar 3", m.slow[2], 11);
  eq("MACD: slow EMA bar 5", m.slow[4], 14);
  eq("MACD: slow EMA bar 6", m.slow[5], 14);
  eq("MACD: line bar 3", m.line[2], 0);
  eq("MACD: line bar 4", m.line[3], 1 / 3);
  eq("MACD: line bar 5", m.line[4], 7 / 9);
  eq("MACD: line bar 6", m.line[5], 7 / 27);
  // signal starts at bar 4 from (0 + 1/3) ÷ 2 = 1/6; then 7/9 × 2/3 + 1/6 × 1/3 = 31/54; then 7/27 × 2/3 + 31/54 × 1/3 = 59/162
  eq("MACD: signal bar 4", m.signal[3], 1 / 6);
  eq("MACD: signal bar 5", m.signal[4], 31 / 54);
  eq("MACD: signal bar 6", m.signal[5], 59 / 162);
  eq("MACD: histogram bar 4, 0.167", Math.round(m.hist[3] * 1000) / 1000, 0.167);
  eq("MACD: histogram bar 5, 0.204", Math.round(m.hist[4] * 1000) / 1000, 0.204);
  eq("MACD: histogram bar 6, −0.105", Math.round(m.hist[5] * 1000) / 1000, -0.105);
}

{
  // Bollinger: closes 2, 4, 4, 4, 5, 5, 7, 9; length 8, width 2: mean 5, variance 32 ÷ 8 = 4, deviation 2
  const b = I.bollinger([2, 4, 4, 4, 5, 5, 7, 9], 8, 2);
  eq("Bollinger: middle", b.mid[7], 5);
  eq("Bollinger: standard deviation (population)", b.sd[7], 2);
  eq("Bollinger: upper", b.upper[7], 9);
  eq("Bollinger: lower", b.lower[7], 1);
  isNull("Bollinger: no value before 8 bars", b.mid[6]);
}

// the five bars of the ATR page, used again by the Keltner page
const ATR_BARS = hlc([
  [10, 8, 9],
  [11, 9, 10],
  [13, 10, 12],
  [12, 11, 11],
  [15, 14, 14],
]);

{
  const tr = I.trueRange(ATR_BARS);
  ok("ATR: true ranges 2, 2, 3, 1, 4", tr.join() === "2,2,3,1,4", tr.join());
  const a = I.atr(ATR_BARS, 3);
  eq("ATR: first value (2 + 2 + 3) ÷ 3", a[2], 7 / 3);
  // (7/3 × 2 + 1) ÷ 3 = 17/9
  eq("ATR: bar 4", a[3], 17 / 9);
  // (17/9 × 2 + 4) ÷ 3 = 70/27
  eq("ATR: bar 5", a[4], 70 / 27);
  eq("ATR: bar 5 as the page prints it", Math.round(a[4] * 100) / 100, 2.59);
}

// the four bars of the stochastic page, used again by the Williams %R and Donchian pages
const RANGE_BARS = hlc([
  [10, 8, 9],
  [12, 9, 11],
  [11, 9, 10],
  [13, 10, 12],
]);

{
  const s = I.stochastic(RANGE_BARS, 3, 1, 2);
  eq("Stochastic: bar 3 highest high", s.high[2], 12);
  eq("Stochastic: bar 3 lowest low", s.low[2], 8);
  eq("Stochastic: bar 3 %K = 100 × 2 ÷ 4", s.k[2], 50);
  eq("Stochastic: bar 4 %K = 100 × 3 ÷ 4", s.k[3], 75);
  eq("Stochastic: bar 4 %D = (50 + 75) ÷ 2", s.d[3], 62.5);
  // a window with no range at all reads 50
  eq("Stochastic: no range reads 50", I.stochastic(hlc([[5, 5, 5], [5, 5, 5]]), 2, 1, 1).k[1], 50);
}

{
  // support and resistance: six turns, zone width 0.50, at least 2 turns
  const lv = I.levels([100.0, 100.4, 105.0, 100.2, 110.0, 105.3], 0.5, 2);
  eq("Levels: two levels", lv.length, 2);
  eq("Levels: first = (100.00 + 100.20 + 100.40) ÷ 3", lv[0].price, 100.2, 1e-9);
  eq("Levels: first has 3 turns", lv[0].touches, 3);
  eq("Levels: second = (105.00 + 105.30) ÷ 2", lv[1].price, 105.15, 1e-9);
  eq("Levels: second has 2 turns", lv[1].touches, 2);
  // widened to 5.50, the first five turns merge (105.30 is within 5.50 of 100.00) and 110.00 stays alone
  const wide = I.levels([100.0, 100.4, 105.0, 100.2, 110.0, 105.3], 5.5, 2);
  eq("Levels: one level at width 5.50", wide.length, 1);
  eq("Levels: with five turns", wide[0].touches, 5);
}

{
  // trend lines: swing lows at bar 10 (100.00) and bar 30 (104.00)
  const ln = I.lineThrough(10, 100, 30, 104);
  eq("Line: slope 4 ÷ 20", ln.slope, 0.2);
  eq("Line: at bar 40", ln.at(40), 106);
  eq("Line: at bar 41", ln.at(41), 106.2);
}

{
  // Donchian: the four range bars, length 3
  const d = I.donchian(RANGE_BARS, 3);
  isNull("Donchian: no value before 3 bars", d.upper[1]);
  eq("Donchian: bar 3 upper, the highest of 10, 12, 11", d.upper[2], 12);
  eq("Donchian: bar 3 lower, the lowest of 8, 9, 9", d.lower[2], 8);
  eq("Donchian: bar 3 middle (12 + 8) ÷ 2", d.mid[2], 10);
  eq("Donchian: bar 4 upper, the highest of 12, 11, 13", d.upper[3], 13);
  eq("Donchian: bar 4 lower, the lowest of 9, 9, 10", d.lower[3], 9);
  eq("Donchian: bar 4 middle (13 + 9) ÷ 2", d.mid[3], 11);
}

{
  // Williams %R: the same four bars, length 3
  const w = I.williamsR(RANGE_BARS, 3);
  isNull("Williams %R: no value before 3 bars", w.r[1]);
  eq("Williams %R: bar 3 = −100 × (12 − 10) ÷ (12 − 8)", w.r[2], -50);
  eq("Williams %R: bar 4 = −100 × (13 − 12) ÷ (13 − 9)", w.r[3], -25);
  // it is the stochastic's raw figure less 100
  const s = I.stochastic(RANGE_BARS, 3, 1, 1);
  eq("Williams %R: bar 4 is raw %K − 100", w.r[3], s.raw[3] - 100);
  eq("Williams %R: a close on the highest high reads 0", I.williamsR(hlc([[10, 8, 9], [12, 9, 12]]), 2).r[1], 0);
  eq("Williams %R: a close on the lowest low reads −100", I.williamsR(hlc([[10, 8, 9], [9, 7, 7]]), 2).r[1], -100);
  eq("Williams %R: no range reads −50", I.williamsR(hlc([[5, 5, 5], [5, 5, 5]]), 2).r[1], -50);
}

{
  // Keltner: the five ATR bars; EMA 3, ATR 3, multiple 2. Closes 9, 10, 12, 11, 14
  const k = I.keltner(ATR_BARS, 3, 3, 2);
  isNull("Keltner: no value before 3 bars", k.mid[1]);
  // EMA (k = 0.5): (9 + 10 + 12) ÷ 3 = 31/3; then 11 × 0.5 + 31/3 × 0.5 = 32/3; then 14 × 0.5 + 32/3 × 0.5 = 37/3
  eq("Keltner: middle bar 3", k.mid[2], 31 / 3);
  eq("Keltner: middle bar 4", k.mid[3], 32 / 3);
  eq("Keltner: middle bar 5", k.mid[4], 37 / 3);
  eq("Keltner: ATR bar 5 is the ATR page's", k.atr[4], 70 / 27);
  // 37/3 + 2 × 70/27 = 473/27 = 17.519; 37/3 − 140/27 = 193/27 = 7.148
  eq("Keltner: upper bar 5", k.upper[4], 473 / 27);
  eq("Keltner: lower bar 5", k.lower[4], 193 / 27);
  eq("Keltner: upper as the page prints it", Math.round(k.upper[4] * 100) / 100, 17.52);
  eq("Keltner: lower as the page prints it", Math.round(k.lower[4] * 100) / 100, 7.15);
  eq("Keltner: the bands are the same distance either side", k.upper[4] - k.mid[4], k.mid[4] - k.lower[4]);
}

{
  // CCI: four bars with typical prices 10, 12, 14, 13; length 3
  const bars = hlc([
    [11, 9, 10],
    [13, 10, 13],
    [16, 12, 14],
    [15, 11, 13],
  ]);
  const c = I.cci(bars, 3);
  ok("CCI: typical prices 10, 12, 14, 13", c.tp.join() === "10,12,14,13", c.tp.join());
  isNull("CCI: no value before 3 bars", c.cci[1]);
  eq("CCI: bar 3 mean (10 + 12 + 14) ÷ 3", c.mean[2], 12);
  // distances 2, 0, 2: mean deviation 4/3
  eq("CCI: bar 3 mean deviation", c.dev[2], 4 / 3);
  // (14 − 12) ÷ (0.015 × 4/3) = 2 ÷ 0.02 = 100
  eq("CCI: bar 3", c.cci[2], 100, 1e-9);
  // bar 4: mean of 12, 14, 13 = 13; distances 1, 1, 0: deviation 2/3; (13 − 13) ÷ … = 0
  eq("CCI: bar 4 mean", c.mean[3], 13);
  eq("CCI: bar 4 mean deviation", c.dev[3], 2 / 3);
  eq("CCI: bar 4", c.cci[3], 0);
  // typical prices 14, 12, 10: the mirror, −100
  eq("CCI: the mirror reads −100", I.cci(hlc([[16, 12, 14], [13, 10, 13], [11, 9, 10]]), 3).cci[2], -100, 1e-9);
  eq("CCI: no deviation reads 0", I.cci(hlc([[5, 5, 5], [5, 5, 5]]), 2).cci[1], 0);
}

{
  // ADX: five bars, length 2
  const bars = hlc([
    [10, 8, 9],
    [12, 9, 11],
    [13, 11, 12],
    [12, 9, 10],
    [11, 8, 9],
  ]);
  const a = I.adx(bars, 2);
  // bar 2: up 2, down −1: +DM 2. bar 3: up 1, down −2: +DM 1. bar 4: up −1, down 2: −DM 2. bar 5: up −1, down 1: −DM 1
  // true ranges from bar 2: 3, 2, 3, 3
  isNull("ADX: no DI before 2 moves", a.plusDI[1]);
  eq("ADX: bar 3 smoothed +DM (2 + 1) ÷ 2", a.plusDM[2], 1.5);
  eq("ADX: bar 3 smoothed −DM", a.minusDM[2], 0);
  eq("ADX: bar 3 smoothed true range (3 + 2) ÷ 2", a.tr[2], 2.5);
  eq("ADX: bar 3 +DI = 100 × 1.5 ÷ 2.5", a.plusDI[2], 60);
  eq("ADX: bar 3 −DI", a.minusDI[2], 0);
  eq("ADX: bar 3 DX = 100 × 60 ÷ 60", a.dx[2], 100);
  isNull("ADX: no ADX before 2 values of DX", a.adx[2]);
  // bar 4: +DM (1.5 + 0) ÷ 2 = 0.75; −DM (0 + 2) ÷ 2 = 1; TR (2.5 + 3) ÷ 2 = 2.75
  eq("ADX: bar 4 +DI = 100 × 0.75 ÷ 2.75", a.plusDI[3], 300 / 11);
  eq("ADX: bar 4 −DI = 100 × 1 ÷ 2.75", a.minusDI[3], 400 / 11);
  // 100 × (400/11 − 300/11) ÷ (700/11) = 100 ÷ 7
  eq("ADX: bar 4 DX", a.dx[3], 100 / 7);
  eq("ADX: bar 4 ADX = (100 + 100/7) ÷ 2", a.adx[3], 400 / 7);
  // bar 5: +DM 0.375; −DM (1 + 1) ÷ 2 = 1; TR (2.75 + 3) ÷ 2 = 2.875
  eq("ADX: bar 5 +DI = 100 × 0.375 ÷ 2.875", a.plusDI[4], 300 / 23);
  eq("ADX: bar 5 −DI = 100 × 1 ÷ 2.875", a.minusDI[4], 800 / 23);
  // 100 × 0.625 ÷ 1.375 = 500/11
  eq("ADX: bar 5 DX", a.dx[4], 500 / 11);
  // (400/7 × 1 + 500/11) ÷ 2 = 3950/77
  eq("ADX: bar 5 ADX", a.adx[4], 3950 / 77);
  eq("ADX: bar 4 as the page prints it", Math.round(a.adx[3] * 100) / 100, 57.14);
  eq("ADX: bar 5 as the page prints it", Math.round(a.adx[4] * 100) / 100, 51.3);
  // an inside bar and an outside bar: the larger of the two moves counts and the other is 0; equal moves give neither
  const odd = I.adx(hlc([[10, 8, 9], [9.5, 8.5, 9], [11, 7, 9], [12, 6, 9]]), 1);
  eq("ADX: an inside bar has no +DM", odd.plusDM[1], 0);
  eq("ADX: an inside bar has no −DM", odd.minusDM[1], 0);
  eq("ADX: equal moves up and down give no +DM", odd.plusDM[3], 0);
  eq("ADX: equal moves up and down give no −DM", odd.minusDM[3], 0);
}

{
  // Parabolic SAR: six bars, step 0.1, maximum 0.3
  const bars = hlc([
    [10, 9, 9.5],
    [11, 10, 10.5],
    [12, 11, 11.5],
    [13, 11.5, 12.5],
    [13.5, 12, 13],
    [12.5, 11, 11.5],
  ]);
  const p = I.parabolicSar(bars, 0.1, 0.3);
  isNull("SAR: no value at the first bar", p.sar[0]);
  // bar 2 closed above bar 1: rising; SAR = the low so far, 9; EP = the high so far, 11; AF 0.1
  ok("SAR: bar 2 rising", p.rising[1] === true);
  eq("SAR: bar 2", p.sar[1], 9);
  eq("SAR: bar 2 EP", p.ep[1], 11);
  eq("SAR: bar 2 AF", p.af[1], 0.1);
  // bar 3: 9 + 0.1 × (11 − 9) = 9.2, held at the low of bar 1, 9. New high 12: EP 12, AF 0.2
  eq("SAR: bar 3, held at the low two bars before", p.sar[2], 9);
  eq("SAR: bar 3 EP", p.ep[2], 12);
  eq("SAR: bar 3 AF", p.af[2], 0.2);
  // bar 4: 9 + 0.2 × (12 − 9) = 9.6. New high 13: EP 13, AF 0.3
  eq("SAR: bar 4", p.sar[3], 9.6);
  eq("SAR: bar 4 EP", p.ep[3], 13);
  eq("SAR: bar 4 AF", p.af[3], 0.3);
  // bar 5: 9.6 + 0.3 × (13 − 9.6) = 10.62. New high 13.5; AF is already at its maximum
  eq("SAR: bar 5", p.sar[4], 10.62);
  eq("SAR: bar 5 EP", p.ep[4], 13.5);
  eq("SAR: bar 5 AF stays at the maximum", p.af[4], 0.3);
  // bar 6: 10.62 + 0.3 × (13.5 − 10.62) = 11.484; the low, 11, is below it: reversal. SAR = the old EP, 13.5; EP = 11; AF 0.1
  ok("SAR: bar 6 falling", p.rising[5] === false);
  eq("SAR: bar 6 jumps to the old extreme point", p.sar[5], 13.5);
  eq("SAR: bar 6 EP is the bar's low", p.ep[5], 11);
  eq("SAR: bar 6 AF starts again", p.af[5], 0.1);

  // the mirror: every price reflected about 20 gives the mirror SAR
  const flip = bars.map((b) => ({ o: 20 - b.o, h: 20 - b.l, l: 20 - b.h, c: 20 - b.c }));
  const q = I.parabolicSar(flip, 0.1, 0.3);
  for (let i = 1; i < bars.length; i++) {
    eq(`SAR: mirror, bar ${i + 1}`, q.sar[i], 20 - p.sar[i]);
    ok(`SAR: mirror direction, bar ${i + 1}`, q.rising[i] === !p.rising[i]);
  }
}

{
  // Ichimoku: five bars; conversion 2, base 3, span B 4, displaced by 3. The first four are the range bars
  const bars = hlc([
    [10, 8, 9],
    [12, 9, 11],
    [11, 9, 10],
    [13, 10, 12],
    [14, 11, 13],
  ]);
  const k = I.ichimoku(bars, 2, 3, 4, 3);
  eq("Ichimoku: the displacement is the one asked for", k.shift, 3);
  // conversion, the midpoint of 2 bars: (12 + 8) ÷ 2, (12 + 9) ÷ 2, (13 + 9) ÷ 2, (14 + 10) ÷ 2
  isNull("Ichimoku: no conversion line before 2 bars", k.conversion[0]);
  eq("Ichimoku: conversion bar 2", k.conversion[1], 10);
  eq("Ichimoku: conversion bar 3", k.conversion[2], 10.5);
  eq("Ichimoku: conversion bar 4", k.conversion[3], 11);
  eq("Ichimoku: conversion bar 5", k.conversion[4], 12);
  // base, the midpoint of 3 bars: (12 + 8) ÷ 2, (13 + 9) ÷ 2, (14 + 9) ÷ 2
  isNull("Ichimoku: no base line before 3 bars", k.base[1]);
  eq("Ichimoku: base bar 3", k.base[2], 10);
  eq("Ichimoku: base bar 4", k.base[3], 11);
  eq("Ichimoku: base bar 5", k.base[4], 11.5);
  // span A = (conversion + base) ÷ 2 at bars 3, 4, 5: 10.25, 11, 11.75; drawn at bars 6, 7, 8
  eq("Ichimoku: the spans reach 3 bars past the last", k.a.length, 8);
  eq("Ichimoku: and so does span B", k.b.length, 8);
  isNull("Ichimoku: no span A at bar 5, where nothing was worked out 3 bars before", k.a[4]);
  eq("Ichimoku: span A at bar 6 = (10.5 + 10) ÷ 2", k.a[5], 10.25);
  eq("Ichimoku: span A at bar 7 = (11 + 11) ÷ 2", k.a[6], 11);
  eq("Ichimoku: span A at bar 8 = (12 + 11.5) ÷ 2", k.a[7], 11.75);
  // span B, the midpoint of 4 bars, at bars 4 and 5: (13 + 8) ÷ 2, (14 + 9) ÷ 2; drawn at bars 7 and 8
  isNull("Ichimoku: no span B at bar 6", k.b[5]);
  eq("Ichimoku: span B at bar 7 = (13 + 8) ÷ 2", k.b[6], 10.5);
  eq("Ichimoku: span B at bar 8 = (14 + 9) ÷ 2", k.b[7], 11.5);
  ok("Ichimoku: span A is on top at bars 7 and 8", k.a[6] > k.b[6] && k.a[7] > k.b[7]);
  // the lagging span is the close, 3 bars back
  eq("Ichimoku: the close of bar 4 is drawn at bar 1", k.lag[0], 12);
  eq("Ichimoku: the close of bar 5 is drawn at bar 2", k.lag[1], 13);
  isNull("Ichimoku: no lagging span for the last 3 bars", k.lag[2]);
  eq("Ichimoku: the lagging span is as long as the bars", k.lag.length, 5);
  // left to itself the displacement is the length of the base line
  eq("Ichimoku: the displacement defaults to the base length", I.ichimoku(bars, 2, 3, 4).shift, 3);
  // the cloud ahead is made from the bars already there: a sixth bar, whatever it is, changes none of it
  const more = I.ichimoku([...bars, { o: 2, h: 30, l: 1, c: 2 }], 2, 3, 4, 3);
  ok("Ichimoku: a new bar leaves the cloud already drawn as it was", [5, 6, 7].every((i) => more.a[i] === k.a[i]) && [6, 7].every((i) => more.b[i] === k.b[i]));
  // the mirror: every price reflected about 20 turns the cloud over, span B on top
  const flip = bars.map((b) => ({ o: 20 - b.o, h: 20 - b.l, l: 20 - b.h, c: 20 - b.c }));
  const m = I.ichimoku(flip, 2, 3, 4, 3);
  eq("Ichimoku: mirror, span A at bar 7", m.a[6], 20 - 11);
  eq("Ichimoku: mirror, span B at bar 7", m.b[6], 20 - 10.5);
  ok("Ichimoku: mirror, span B is on top", m.b[6] > m.a[6] && m.b[7] > m.a[7]);
}

{
  // on-balance volume: closes 10, 11, 11, 10, 12; volumes 100, 150, 120, 200, 180
  const o = I.obv([10, 11, 11, 10, 12], [100, 150, 120, 200, 180]);
  eq("OBV: bar 1 starts at 0", o[0], 0);
  eq("OBV: bar 2, a higher close: 0 + 150", o[1], 150);
  eq("OBV: bar 3, the same close: unchanged", o[2], 150);
  eq("OBV: bar 4, a lower close: 150 − 200", o[3], -50);
  eq("OBV: bar 5, a higher close: −50 + 180", o[4], 130);
  // only the direction of the close counts, not its size
  eq("OBV: a rise of 0.01 adds as much as a rise of 10", I.obv([10, 10.01], [0, 300])[1], I.obv([10, 20], [0, 300])[1]);
  // the mirror of the closes gives the mirror of the total
  const flip = I.obv([20, 19, 19, 20, 18], [100, 150, 120, 200, 180]);
  ok("OBV: mirror", flip.every((v, i) => v === -o[i] || (v === 0 && o[i] === 0)), flip.join());
}

{
  // VWAP: five bars with typical prices 10, 12, 14, 13, 15 and volumes 100, 100, 300, 200, 600; a session is 3 bars
  const bars = hlc([
    [11, 9, 10],
    [13, 10, 13],
    [16, 12, 14],
    [15, 11, 13],
    [17, 13, 15],
  ]);
  const v = I.vwap(bars, [100, 100, 300, 200, 600], 3);
  ok("VWAP: typical prices 10, 12, 14, 13, 15", v.tp.join() === "10,12,14,13,15", v.tp.join());
  eq("VWAP: bar 1 = 1,000 ÷ 100", v.vwap[0], 10);
  eq("VWAP: bar 2 sum of price × volume 1,000 + 1,200", v.pv[1], 2200);
  eq("VWAP: bar 2 = 2,200 ÷ 200", v.vwap[1], 11);
  eq("VWAP: bar 3 sum of price × volume 2,200 + 4,200", v.pv[2], 6400);
  eq("VWAP: bar 3 sum of volume", v.vol[2], 500);
  eq("VWAP: bar 3 = 6,400 ÷ 500", v.vwap[2], 12.8);
  // a new session: both sums start again
  eq("VWAP: bar 4 sum of price × volume starts again at 2,600", v.pv[3], 2600);
  eq("VWAP: bar 4 sum of volume starts again", v.vol[3], 200);
  eq("VWAP: bar 4 = 2,600 ÷ 200, the bar's typical price", v.vwap[3], 13);
  eq("VWAP: bar 5 = 11,600 ÷ 800", v.vwap[4], 14.5);
  // with the same volume on every bar it is the plain average of the session's typical prices
  const even = I.vwap(bars, [7, 7, 7, 7, 7], 3);
  eq("VWAP: equal volumes, bar 3 = (10 + 12 + 14) ÷ 3", even.vwap[2], 12);
  eq("VWAP: equal volumes, bar 5 = (13 + 15) ÷ 2", even.vwap[4], 14);
  // one session over all five bars: (1,000 + 1,200 + 4,200 + 2,600 + 9,000) ÷ 1,300 = 18,000 ÷ 1,300
  eq("VWAP: one session of 5 bars never starts again", I.vwap(bars, [100, 100, 300, 200, 600], 5).vwap[4], 18000 / 1300);
  eq("VWAP: no volume at all reads the typical price", I.vwap(bars, [0, 0, 0, 0, 0], 3).vwap[1], 12);
}

/* ---- 2. the invented series ------------------------------------------------ */

// SHA-256 of JSON.stringify(makeBars(seed)), taken before the volume existed: the seed of every page's chart, the
// seeds of the properties below and two others. If one price of one bar changed, its digest would not match.
const BEFORE_VOLUME = {
  1: "94d14ea082f6436e44a7f8073f9cc36226d8772734a1be1ac84fd8970762d7ac",
  7: "2fdfa0b38d634fdffe3237b496e25fe31ecf2ea794a3d906733e6a356dff6aa4",
  55: "f817b12ce396a8e3bc5ef64d634051ccc49fb51027edf9bc93a19fc9fbe7ecc7",
  89: "ef61aaa98c0bbc09347aeb09b66af5b32c736081f99f8774ffd9f78341576880",
  144: "b8ca581de6bf114b7c3f961793074544222bfb17ca79c8a17bd7639bb158b2a9",
  233: "0d7f22b86caee43a3623200619ba0b455bb93fa5f6f859fcae098f7a0216a53a",
  314: "1d261e3ed4799ca2507635156de8058a4441c090cbb049045152acb4c9b77a41",
  377: "dca4c3965a4ed9a7a3d09006b93cda5c9f13a635fbd86ac9d88f30f52032d726",
  610: "608402267a4abf5dc014f0e3598eb4b1629c7013b44069ad4bf943b47838e8ea",
  987: "f8f9daeab2858de629c5b7c461aff14c63b7452c7dc0545ccd1e26193b6c6402",
  1597: "46deae68261f59d690654a0b38af2815a4e3aadd3142dbf16d6eb4e6a30e4a7d",
  1618: "334785b2afb22ef877b4bc90fd1f86ea7e54d4b3987b5a1558d07d949944dc0d",
  2027: "88ce03ea4fc58d352b1a67cfa8d13c008e6a9b77accb9a264b112f28f5088709",
  2584: "1e205e10b4902e77654ce3f555a37febbe1955b6d6cf5aabc2cd7b940b4bbb36",
  4181: "216ec9706a2f7754afd4b295778d0aeee63769e89c2765a4c57a44b05225a33a",
  31337: "ac7beb08ee6ca70315f21c99b1a70cf9fff4a7698ddf1ee37a6ef9682e2758af",
  99999: "b5a3b7832899d1b0062f5943c8a816472aff105aa0ba8d419c5975bf1644d011",
};
const digest = (bars) => createHash("sha256").update(JSON.stringify(bars)).digest("hex");

for (const [seed, want] of Object.entries(BEFORE_VOLUME)) {
  const s = Number(seed);
  ok(`chart ${s}: every price is what it was before there was a volume`, digest(makeBars(s)) === want);
  // and making the volume first, or in between, does not disturb them
  makeVolumes(s);
  const bars = makeBars(s);
  makeVolumes(s, bars);
  ok(`chart ${s}: making the volume changes no price`, digest(bars) === want && digest(makeBars(s)) === want);
  ok(`chart ${s}: a bar has four prices and nothing else`, bars.every((b) => Object.keys(b).join() === "o,h,l,c"));
}

for (const seed of [7, 89, 144, 1963, 1988, 2027, 31337, 92652]) {
  const bars = makeBars(seed);
  const vols = makeVolumes(seed, bars);
  eq(`chart ${seed}: one volume to a bar`, vols.length, bars.length);
  ok(`chart ${seed}: every volume is a whole number above zero`, vols.every((v) => Number.isInteger(v) && v >= 1));
  ok(`chart ${seed}: the same chart number gives the same volumes`, vols.join() === makeVolumes(seed).join());
  ok(`chart ${seed}: another chart number gives other volumes`, vols.join() !== makeVolumes(seed + 1, bars).join());
  // larger on larger bars: the half of the bars that covered more ground has the larger volume between them
  const size = bars.map((b, i) => Math.max(b.h, i ? bars[i - 1].c : b.o) - Math.min(b.l, i ? bars[i - 1].c : b.o));
  const order = bars.map((_, i) => i).sort((a, b) => size[a] - size[b]);
  const sum = (idx) => idx.reduce((t, i) => t + vols[i], 0);
  const half = order.length / 2;
  ok(`chart ${seed}: the larger bars have more volume than the smaller`, sum(order.slice(half)) > sum(order.slice(0, half)));
  // and never outside what its size allows: (400 + 1,000 × size) × 0.6 to 1.4, to the nearest whole number
  ok(`chart ${seed}: each volume is within the spread its bar's size allows`, vols.every((v, i) => v >= Math.round((VOLUME.base + VOLUME.perPoint * size[i]) * 0.6) - 1 && v <= Math.round((VOLUME.base + VOLUME.perPoint * size[i]) * 1.4) + 1));
  eq(`chart ${seed}: a shorter chart is the start of the longer one`, makeVolumes(seed, bars.slice(0, 50)).join() === vols.slice(0, 50).join() ? 1 : 0, 1);

  const closes = bars.map((b) => b.c);
  const last = bars.length - 1;
  const o = I.obv(closes, vols);
  const v = I.vwap(bars, vols, 20);
  const k = I.ichimoku(bars, 9, 26, 52);
  const d9 = I.donchian(bars, 9);
  const d26 = I.donchian(bars, 26);
  const d52 = I.donchian(bars, 52);
  let fine = { obv: true, vwapIn: true, vwapStart: true, vwapSums: true, lines: true, spans: true, lag: true };
  let high = -Infinity;
  let low = Infinity;
  for (let i = 0; i <= last; i++) {
    const step = i === 0 ? 0 : Math.sign(closes[i] - closes[i - 1]) * vols[i];
    if (o[i] - (i === 0 ? 0 : o[i - 1]) !== step) fine.obv = false;
    if (i % 20 === 0) {
      high = -Infinity;
      low = Infinity;
      // price × volume ÷ volume: the price again, to within the last binary place
      if (Math.abs(v.vwap[i] - v.tp[i]) > 1e-9) fine.vwapStart = false;
    }
    high = Math.max(high, bars[i].h);
    low = Math.min(low, bars[i].l);
    // an average of typical prices cannot leave the range its session has covered so far
    if (!(v.vwap[i] <= high + 1e-9 && v.vwap[i] >= low - 1e-9)) fine.vwapIn = false;
    if (Math.abs(v.vwap[i] * v.vol[i] - v.pv[i]) > 1e-6) fine.vwapSums = false;
    if (k.conversion[i] != null && k.conversion[i] !== d9.mid[i]) fine.lines = false;
    if (k.base[i] != null && k.base[i] !== d26.mid[i]) fine.lines = false;
    // what is drawn at bar i + 26 was worked out at bar i, from bars up to i and no later
    const a = k.conversion[i] == null || k.base[i] == null ? null : (k.conversion[i] + k.base[i]) / 2;
    if (k.a[i + 26] !== a || k.b[i + 26] !== d52.mid[i]) fine.spans = false;
    if (k.lag[i] !== (i + 26 <= last ? closes[i + 26] : null)) fine.lag = false;
  }
  ok(`chart ${seed}: OBV moves by the bar's volume, up, down or not at all`, fine.obv);
  ok(`chart ${seed}: VWAP stays inside the range its session has covered`, fine.vwapIn);
  ok(`chart ${seed}: VWAP is the typical price at the first bar of each session`, fine.vwapStart);
  ok(`chart ${seed}: VWAP × the sum of volume is the sum of price × volume`, fine.vwapSums);
  ok(`chart ${seed}: the conversion and base lines are midpoints of 9 and 26 bars`, fine.lines);
  ok(`chart ${seed}: each span is drawn 26 bars after the bar it was worked out at`, fine.spans);
  ok(`chart ${seed}: the lagging span is the close, 26 bars back`, fine.lag);
  eq(`chart ${seed}: the cloud reaches 26 bars past the last bar`, k.a.length, bars.length + 26);
  ok(`chart ${seed}: the cloud is whole from the first bar drawn to its far end`, k.a.slice(CHART.bars - CHART.shown).every((x) => x != null) && k.b.slice(CHART.bars - CHART.shown).every((x) => x != null));
  // the cloud ahead of the last bar does not change when a bar is added after it
  const longer = I.ichimoku([...bars, { o: 1, h: 999, l: 1, c: 1 }], 9, 26, 52);
  ok(`chart ${seed}: a new bar changes nothing of the cloud already drawn`, k.a.every((x, i) => x === longer.a[i]) && k.b.every((x, i) => x === longer.b[i]));
}

/* ---- 3. properties on invented charts -------------------------------------- */

for (const seed of [7, 89, 144, 2027, 31337]) {
  const bars = makeBars(seed);
  const last = bars.length - 1;
  const d = I.donchian(bars, 20);
  const w = I.williamsR(bars, 14);
  const k = I.keltner(bars, 20, 10, 2);
  const a = I.adx(bars, 14);
  const c = I.cci(bars, 20);
  const p = I.parabolicSar(bars, 0.02, 0.2);
  const st = I.stochastic(bars, 14, 1, 1);
  let fine = { donchian: true, williams: true, twin: true, keltner: true, adx: true, cci: true, sarSide: true, sarAf: true, sarFlip: true };
  for (let i = 0; i <= last; i++) {
    const b = bars[i];
    if (d.upper[i] != null && !(b.h <= d.upper[i] && b.l >= d.lower[i] && d.mid[i] === (d.upper[i] + d.lower[i]) / 2)) fine.donchian = false;
    if (w.r[i] != null && !(w.r[i] <= 0 && w.r[i] >= -100)) fine.williams = false;
    if (w.r[i] != null && Math.abs(w.r[i] - (st.raw[i] - 100)) > 1e-9) fine.twin = false;
    if (k.upper[i] != null && !(k.upper[i] >= k.mid[i] && k.lower[i] <= k.mid[i])) fine.keltner = false;
    for (const s of [a.plusDI, a.minusDI, a.dx, a.adx]) if (s[i] != null && !(s[i] >= 0 && s[i] <= 100 + 1e-9)) fine.adx = false;
    // a typical price above its own average gives a positive CCI, and the reverse
    if (c.cci[i] != null && c.dev[i] > 0 && Math.sign(c.cci[i]) !== Math.sign(c.tp[i] - c.mean[i])) fine.cci = false;
    if (i >= 2) {
      const flipped = p.rising[i] !== p.rising[i - 1];
      // on the bar it is drawn for, a SAR that did not reverse is on the far side of the whole bar
      if (!flipped && !(p.rising[i] ? p.sar[i] <= b.l : p.sar[i] >= b.h)) fine.sarSide = false;
      // after a reversal it stands at or beyond the bar's other extreme
      if (flipped && !(p.rising[i] ? p.sar[i] <= b.l : p.sar[i] >= b.h)) fine.sarFlip = false;
      if (!(p.af[i] >= 0.02 - 1e-12 && p.af[i] <= 0.2 + 1e-12)) fine.sarAf = false;
    }
  }
  ok(`chart ${seed}: every bar is inside its Donchian channel`, fine.donchian);
  ok(`chart ${seed}: Williams %R stays between −100 and 0`, fine.williams);
  ok(`chart ${seed}: Williams %R is the raw stochastic less 100`, fine.twin);
  ok(`chart ${seed}: the Keltner bands are either side of the middle`, fine.keltner);
  ok(`chart ${seed}: +DI, −DI, DX and ADX stay between 0 and 100`, fine.adx);
  ok(`chart ${seed}: CCI has the sign of typical price less its average`, fine.cci);
  ok(`chart ${seed}: the SAR is outside the bar it is drawn for`, fine.sarSide);
  ok(`chart ${seed}: a reversed SAR is beyond the reversing bar`, fine.sarFlip);
  ok(`chart ${seed}: the acceleration factor stays between the step and the maximum`, fine.sarAf);
  isNull(`chart ${seed}: ADX has no value before bar 2n − 1`, a.adx[26]);
  ok(`chart ${seed}: ADX has a value at bar 2n − 1`, a.adx[27] != null);
  ok(`chart ${seed}: the same chart number gives the same bars`, JSON.stringify(makeBars(seed)) === JSON.stringify(bars));
}

/* ---- report ---------------------------------------------------------------- */

if (failures.length) {
  console.error(`${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`chart school: ${passed} checks passed`);
