/**
 * Proves the arithmetic of Chart school (src/components/chart-school/indicators.ts).
 *
 *   node scripts/test-chart-school.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the module has no
 * imports of its own). Three kinds of check:
 *   1. the worked example printed on each indicator's page
 *      (src/data/chart-school.ts), with the working written beside each
 *      expectation, so a page and the arithmetic cannot disagree unnoticed;
 *   2. further cases worked by hand for the edges a page does not show;
 *   3. properties that must hold on any chart (a scale's limits, a channel
 *      that contains its bars), over several invented charts.
 */
import * as I from "../src/components/chart-school/indicators.ts";
import { makeBars } from "../src/components/chart-school/series.ts";

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

/* ---- 2. properties on invented charts -------------------------------------- */

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
