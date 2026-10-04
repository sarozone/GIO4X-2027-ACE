/**
 * Proves the arithmetic of the Rule bench engine (src/components/labs/bench/strategy.ts).
 *
 *   node scripts/test-bench.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the engine has no
 * imports of its own). Hand-built bars with the working written beside each
 * expectation, then properties that must hold on every market and seed.
 */
import * as B from "../src/components/labs/bench/strategy.ts";

let passed = 0;
const failures = [];
function ok(name, cond, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
function eq(name, got, want, tol = 1e-9) {
  ok(name, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
}

const pair = B.marketOf("pair");

/* ---- 1. indicators --------------------------------------------------------- */
{
  const s = B.sma([1, 2, 3, 4, 5], 3);
  ok("sma: null until n closes", s[0] === null && s[1] === null);
  eq("sma: (1+2+3)/3", s[2], 2);
  eq("sma: (3+4+5)/3", s[4], 4);

  const up = B.rsi([1, 2, 3, 4, 5, 6], 3);
  eq("rsi: only gains is 100", up[5], 100);
  const down = B.rsi([6, 5, 4, 3, 2, 1], 3);
  eq("rsi: only losses is 0", down[5], 0);
  // changes +1, −1, +1: average gain 2/3, average loss 1/3, RS 2, RSI 100 − 100/3
  eq("rsi: two up, one down over three", B.rsi([10, 11, 10, 11], 3)[3], 100 - 100 / 3, 1e-9);

  const bars = [
    { o: 10, h: 12, l: 9, c: 11, gap: false }, // range 3
    { o: 11, h: 11.5, l: 10.5, c: 11, gap: false }, // range 1
    { o: 14, h: 15, l: 14, c: 15, gap: true }, // high − previous close = 4
  ];
  const a = B.atr(bars, 3);
  eq("atr: (3 + 1 + 4) / 3", a[2], 8 / 3);
}

/* ---- 2. sizing and profit -------------------------------------------------- */
{
  // 10,000 × 1% = 100 at risk; a stop 0.0020 away on 100,000 units loses 200 per lot; 100 ÷ 200 = 0.5 lots
  eq("lots: 1% over 20 pips", B.lotsFor(pair, 10000, 1, 0.002), 0.5);
  // 100 ÷ (0.0033 × 100,000) = 0.30303…, rounded down to 0.30
  eq("lots: rounded down to the step", B.lotsFor(pair, 10000, 1, 0.0033), 0.3);
  eq("lots: nothing for no stop", B.lotsFor(pair, 10000, 1, 0), 0);
  // (1.2050 − 1.2000) × 100,000 × 0.5 = 250
  eq("pl: a long that rose 50 pips", B.profitLoss(pair, 1, 1.2, 1.205, 0.5), 250, 1e-6);
  eq("pl: a short that rose 50 pips", B.profitLoss(pair, -1, 1.2, 1.205, 0.5), -250, 1e-6);
}

/* ---- 3. a test on hand-built bars ------------------------------------------ */
{
  // flat at 1.2000 with a range of 0.0010 for 40 bars, so every average is 1.2000 and the ATR is 0.0010;
  // then one close above everything, then a fall through the stop
  const flat = (c = 1.2) => ({ o: c, h: c + 0.0005, l: c - 0.0005, c, gap: false });
  const bars = [];
  for (let i = 0; i < 40; i++) bars.push(flat());
  bars.push({ o: 1.2, h: 1.202, l: 1.1995, c: 1.202, gap: false }); // bar 40: breaks out
  bars.push({ o: 1.202, h: 1.2025, l: 1.2015, c: 1.202, gap: false }); // bar 41: the entry bar
  bars.push({ o: 1.202, h: 1.202, l: 1.19, c: 1.19, gap: false }); // bar 42: through the stop
  for (let i = 0; i < 5; i++) bars.push({ o: 1.19, h: 1.1905, l: 1.1895, c: 1.19, gap: false });

  const rule = { ...B.DEFAULT_RULE, entry: "breakout", slow: 20, direction: "long", stopAtr: 2, targetR: 0, riskPct: 1 };
  const sig = B.signals(bars, rule);
  eq("signal: long at the breakout bar", sig[40], 1);
  ok("signal: nothing before it", sig.slice(0, 40).every((s) => s === 0));

  const t = B.runTest(pair, bars, rule);
  eq("test: one trade", t.trades.length, 1);
  const tr = t.trades[0];
  // the ATR at bar 40: thirteen ranges of 0.0010 and one of 0.0025 → (13 × 0.0010 + 0.0025) / 14
  const range = (13 * 0.001 + 0.0025) / 14;
  const spread = pair.spreadPts * pair.point;
  eq("test: entered at the next open plus the spread", tr.entry, 1.202 + spread, 1e-9);
  eq("test: on bar 41", tr.inBar, 41);
  eq("test: stop two ranges below", tr.stop, 1.202 + spread - 2 * range, 1e-9);
  eq("test: closed at the stop", tr.exit, tr.stop, 1e-12);
  ok("test: by the stop, on bar 42", tr.reason === "stop" && tr.outBar === 42 && tr.gapped === false);
  const lots = B.lotsFor(pair, 10000, 1, 2 * range);
  eq("test: sized from the stop", tr.lots, lots);
  eq("test: the loss is the stop distance on that size", tr.pl, Math.round(-2 * range * 100000 * lots * 100) / 100, 0.011);
  ok("test: the loss is close to 1% of the balance, and no more", tr.pl < 0 && tr.pl >= -100.01);
  eq("test: the balance carries it", t.stats.endBalance, 10000 + tr.pl, 1e-9);
  eq("test: equity ends at the balance", t.equity[t.equity.length - 1], t.stats.endBalance, 1e-9);
  eq("test: one loss", t.stats.losses, 1);

  // the same bars, but the bar after the entry opens far below the stop: the fill is the open, not the stop
  const gapped = bars.slice();
  gapped[42] = { o: 1.19, h: 1.19, l: 1.189, c: 1.19, gap: true };
  const g = B.runTest(pair, gapped, rule).trades[0];
  ok("gap: filled at the open, beyond the stop", g.exit === 1.19 && g.gapped === true && g.exit < g.stop);
  ok("gap: the loss is larger than the risk asked for", g.pl < -100);

  // a target one stop away, reached on the entry bar's successor
  const up = bars.slice(0, 42);
  up.push({ o: 1.202, h: 1.21, l: 1.2019, c: 1.21, gap: false });
  for (let i = 0; i < 4; i++) up.push({ o: 1.21, h: 1.2105, l: 1.2095, c: 1.21, gap: false });
  const w = B.runTest(pair, up, { ...rule, targetR: 1 });
  const wt = w.trades[0];
  ok("target: closed at the target", wt.reason === "target" && Math.abs(wt.exit - wt.target) < 1e-12);
  eq("target: one stop away", wt.target - wt.entry, wt.entry - wt.stop, 1e-9);
  ok("target: a gain close to 1%", wt.pl > 0 && wt.pl <= 100.01);

  // both touched in one bar counts as the stop
  const both = bars.slice(0, 42);
  both.push({ o: 1.202, h: 1.215, l: 1.19, c: 1.2, gap: false });
  both.push(flat());
  ok("both in one bar: the stop is taken first", B.runTest(pair, both, { ...rule, targetR: 1 }).trades[0].reason === "stop");

  // fade turns the long into a short; long-only then leaves nothing
  eq("fade: the breakout becomes a short", B.signals(bars, { ...rule, direction: "both", fade: true })[40], -1);
  eq("fade + long only: nothing at the breakout bar", B.signals(bars, { ...rule, fade: true })[40], 0);
}

/* ---- 4. properties on every market ----------------------------------------- */
for (const m of B.MARKETS) {
  const a = B.makeBars(m, 7);
  const b = B.makeBars(m, 7);
  ok(`${m.key}: the same number gives the same bars`, JSON.stringify(a) === JSON.stringify(b));
  ok(`${m.key}: another number gives other bars`, JSON.stringify(a) !== JSON.stringify(B.makeBars(m, 8)));
  eq(`${m.key}: the count asked for`, a.length, B.BENCH.bars);
  ok(`${m.key}: every bar is well formed`, a.every((x) => x.h >= Math.max(x.o, x.c) - 1e-9 && x.l <= Math.min(x.o, x.c) + 1e-9 && x.l > 0));

  for (const entry of ["cross", "breakout", "rsi"]) {
    for (const seed of [1, 2027, 99991]) {
      const rule = { ...B.DEFAULT_RULE, entry, fast: entry === "rsi" ? 14 : 10, targetR: seed % 2 ? 2 : 0 };
      const bars = B.makeBars(m, seed);
      const t = B.runTest(m, bars, rule);
      const id = `${m.key}/${entry}/${seed}`;
      eq(`${id}: one equity point per bar`, t.equity.length, bars.length);
      const sum = Math.round(t.trades.reduce((s, x) => s + x.pl, 0) * 100) / 100;
      eq(`${id}: the net is the sum of the trades`, t.stats.net, sum, 0.011);
      eq(`${id}: equity ends at the balance`, t.equity[t.equity.length - 1], t.stats.endBalance, 1e-9);
      ok(`${id}: wins and losses count the trades`, t.stats.wins + t.stats.losses <= t.stats.trades);
      ok(`${id}: no trade overlaps the next`, t.trades.every((x, i) => i === 0 || x.inBar >= t.trades[i - 1].outBar));
      ok(`${id}: a stop is on the losing side`, t.trades.every((x) => (x.side === 1 ? x.stop < x.entry : x.stop > x.entry)));
      ok(`${id}: a stopped trade without a gap loses no more than the risk`, t.trades.every((x) => x.reason !== "stop" || x.gapped || x.pl <= 0));
      ok(`${id}: drawdown is a share`, t.stats.maxDrawdown >= 0 && t.stats.maxDrawdown <= 1);
      ok(`${id}: sizes are on the step`, t.trades.every((x) => Math.abs(x.lots * 100 - Math.round(x.lots * 100)) < 1e-6 && x.lots >= 0.01));
    }
  }
  const sp = B.others(m, 2027, B.DEFAULT_RULE);
  eq(`${m.key}: forty other markets`, sp.nets.length, B.BENCH.others);
  eq(`${m.key}: gained + lost + flat`, sp.gained + sp.lost + sp.flat, B.BENCH.others);
  ok(`${m.key}: sorted`, sp.nets.every((n, i) => i === 0 || n >= sp.nets[i - 1]));
}

/* ---- 5. the rule's limits and its sentence --------------------------------- */
{
  const t = B.tidy({ entry: "cross", fast: 80, slow: 20, direction: "sideways", fade: 1, stopAtr: 99, targetR: -3, riskPct: 0 });
  ok("tidy: fast below slow", t.fast < t.slow);
  ok("tidy: inside the limits", t.stopAtr === 5 && t.targetR === 0 && t.riskPct === 0.25 && t.direction === "both" && t.fade === false);
  const words = B.inWords(B.DEFAULT_RULE);
  ok("words: names the averages, the stop and the risk", words.includes("10-bar") && words.includes("30-bar") && words.includes("2 average ranges") && words.includes("1%"));
}

/* ---- 6. the lesson the page states: on an invented walk no rule has an edge - */
{
  // over many markets the average result of a rule is about minus its costs: nowhere near a steady gain
  let net = 0;
  let cost = 0;
  let n = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const t = B.runTest(pair, B.makeBars(pair, seed), B.DEFAULT_RULE);
    net += t.stats.net;
    cost += t.stats.spread;
    n += 1;
  }
  ok("no edge: the average result is not a gain", net / n < 60, `mean net ${(net / n).toFixed(2)}, mean cost ${(cost / n).toFixed(2)}`);
  ok("no edge: costs are paid on every market", cost / n > 0);
}

if (failures.length) {
  console.error(`${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`rule bench: ${passed} checks passed`);
