/**
 * Proves the arithmetic of five Trader Toolkit calculators
 * (src/components/tools/method.ts: risk of ruin, expectancy, break-even, lot
 * size converter, correlation), the choice of the Academy's question of the
 * day and its run of days (src/components/academy/qotd/pick.ts), and the
 * trading plan's file (src/components/plan/record.ts).
 *
 *   node scripts/test-tools-method.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the modules have
 * no imports of their own). Three kinds of check:
 *   1. hand-computed cases, with the working written beside each expectation;
 *   2. properties that must hold over a grid of inputs (a probability stays
 *      between 0 and 1, a conversion goes there and back, a correlation does
 *      not change when a series is rescaled);
 *   3. the registry: the formula sentences published in src/data/tools.ts, so
 *      a change to the site's stated formula fails here, and that every tool
 *      has its text, its group and its couplet.
 */
import * as M from "../src/components/tools/method.ts";
import * as Q from "../src/components/academy/qotd/pick.ts";
import * as P from "../src/components/plan/record.ts";
import { tools } from "../src/data/tools.ts";
import { toolRhymes } from "../src/data/tool-rhymes.ts";
import { countWord, toolContent, toolGroups } from "../src/components/tools/content.ts";

let passed = 0;
const failures = [];
function ok(name, cond, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
function eq(name, got, want, tol = 1e-9) {
  ok(name, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
}

/* ---- 1. risk of ruin --------------------------------------------------------- */

{
  // win rate 60%, payoff 1, risk 10% a trade, level: half the account
  //   a win multiplies by 1.1: ln 1.1 = 0.0953102;   a loss by 0.9: ln 0.9 = −0.1053605
  //   drift    = 0.6 × 0.0953102 + 0.4 × (−0.1053605) = 0.0571861 − 0.0421442 = 0.0150419
  //   variance = 0.6 × 0.4 × (0.0953102 + 0.1053605)² = 0.24 × 0.2006707² = 0.24 × 0.0402687 = 0.0096645
  //   exponent = 2 × 0.0150419 ÷ 0.0096645 = 3.11282
  //   P        = 0.5^3.11282 = e^(3.11282 × −0.693147) = e^(−2.15764) = 0.11560
  const r = M.riskOfRuin(0.6, 1, 0.1, 0.5);
  eq("ruin: ln of a win", r.winLog, 0.0953102, 1e-7);
  eq("ruin: ln of a loss", r.lossLog, -0.1053605, 1e-7);
  eq("ruin: drift", r.drift, 0.0150419, 1e-7);
  eq("ruin: variance", r.variance, 0.0096645, 1e-7);
  eq("ruin: exponent", r.exponent, 3.11282, 1e-4);
  eq("ruin: probability", r.probability, 0.1156, 1e-4);
  ok("ruin: not certain when the drift is positive", r.certain === false);
  // 0.9⁶ = 0.531441 is still above 0.5; 0.9⁷ = 0.4782969 is not: seven losses in a row
  eq("ruin: losses in a row to half the account at 10%", r.lossesToLevel, 7);
  // 0.4⁷ = 0.0016384
  eq("ruin: chance of that run", r.runProbability, 0.0016384, 1e-12);

  // win rate 40%, payoff 1: drift = 0.4 × 0.0953102 − 0.6 × 0.1053605 = −0.0250922, so the level is reached sooner or later
  const lose = M.riskOfRuin(0.4, 1, 0.1, 0.5);
  ok("ruin: a negative drift is certain", lose.certain === true && lose.probability === 1 && lose.exponent === null);
  eq("ruin: negative drift", lose.drift, -0.0250922, 1e-7);

  // a coin toss at payoff 1: drift = 0.5 × (ln 1.1 + ln 0.9) = 0.5 × ln 0.99 < 0. Fixed-fraction sizing loses on an even bet
  ok("ruin: an even bet at payoff 1 has a negative drift", M.riskOfRuin(0.5, 1, 0.1, 0.5).certain === true);

  // risking half the balance, one loss halves it: (1 − 0.5)¹ = 0.5
  eq("ruin: one loss at 50% reaches half", M.riskOfRuin(0.6, 2, 0.5, 0.5).lossesToLevel, 1);
  // 1% a trade to lose 20%: 0.99ⁿ ≤ 0.8 → n ≥ ln 0.8 ÷ ln 0.99 = 0.223144 ÷ 0.010050 = 22.2 → 23
  eq("ruin: losses in a row to 20% at 1%", M.riskOfRuin(0.5, 2, 0.01, 0.2).lossesToLevel, 23);

  // properties over a grid: a probability, rising with the risk and falling as the level deepens
  let inRange = true;
  let risesWithRisk = true;
  let fallsWithDepth = true;
  for (const p of [0.35, 0.45, 0.5, 0.6, 0.75]) {
    for (const b of [0.5, 1, 1.5, 2, 3]) {
      let before = -1;
      for (const f of [0.0025, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2]) {
        const now = M.riskOfRuin(p, b, f, 0.5).probability;
        if (!(now >= 0 && now <= 1)) inRange = false;
        if (now < before - 1e-12) risesWithRisk = false;
        before = now;
      }
      let shallow = 2;
      for (const d of [0.1, 0.25, 0.5, 0.75, 0.9]) {
        const now = M.riskOfRuin(p, b, 0.02, d).probability;
        if (now > shallow + 1e-12) fallsWithDepth = false;
        shallow = now;
      }
    }
  }
  ok("ruin: always between 0 and 1", inRange);
  ok("ruin: never falls as the risk per trade rises", risesWithRisk);
  ok("ruin: never rises as the loss asked about deepens", fallsWithDepth);
}

/* ---- 2. expectancy ----------------------------------------------------------- */

{
  // win rate 40%, average win 300, average loss 150, cost 10
  //   gross = 0.4 × 300 − 0.6 × 150 = 120 − 90 = 30;   net = 30 − 10 = 20
  //   per unit risked = 20 ÷ 150 = 0.13333;   payoff = 300 ÷ 150 = 2
  //   break-even win rate = (150 + 10) ÷ (300 + 150) = 160 ÷ 450 = 0.35556;   before costs = 150 ÷ 450 = 0.33333
  const e = M.expectancy(0.4, 300, 150, 10);
  eq("expectancy: gross", e.gross, 30);
  eq("expectancy: net", e.net, 20);
  eq("expectancy: per unit risked", e.perRisk, 20 / 150);
  eq("expectancy: payoff ratio", e.payoff, 2);
  eq("expectancy: break-even win rate after costs", e.breakEvenWinRate, 160 / 450);
  eq("expectancy: break-even win rate before costs", e.breakEvenGross, 1 / 3);
  // the same as the Risk / Reward tool's sentence: 1 ÷ (1 + ratio)
  eq("expectancy: break-even before costs is 1 ÷ (1 + payoff)", e.breakEvenGross, 1 / (1 + e.payoff));
  // at the break-even win rate the net expectancy is nothing: 0.35556 × 300 − 0.64444 × 150 − 10 = 106.667 − 96.667 − 10 = 0
  eq("expectancy: zero at its own break-even", M.expectancy(e.breakEvenWinRate, 300, 150, 10).net, 0);
  // win rate 50%, win 100, loss 100, no cost: nothing either way
  eq("expectancy: an even bet", M.expectancy(0.5, 100, 100).net, 0);
  // win rate 30%, win 100, loss 100: 30 − 70 = −40
  eq("expectancy: a losing set", M.expectancy(0.3, 100, 100).net, -40);
  // a cost larger than the average win: (100 + 250) ÷ (200 + 100) = 1.1667, above 1, so no win rate is enough
  ok("expectancy: a cost no win rate covers", M.expectancy(0.9, 200, 100, 250).breakEvenWinRate > 1);
}

/* ---- 3. break-even ----------------------------------------------------------- */

{
  // 2 lots, pip worth 10 a lot, spread 1.2 pips, commission 3.50 a lot each side (two sides), swap 0.80 a lot a night for 3 nights
  //   spread     = 1.2 × 10 × 2 = 24
  //   commission = 3.50 × 2 × 2 = 14
  //   swap       = 0.80 × 2 × 3 = 4.80
  //   total      = 42.80;   one pip on the position = 10 × 2 = 20;   move = 42.80 ÷ 20 = 2.14 pips = 0.000214
  const b = M.breakEven({ spread: 1.2, commission: 3.5, sides: 2, swap: 0.8, nights: 3, lots: 2, pipValue: 10, pipSize: 0.0001 });
  eq("break-even: spread cost", b.spreadCost, 24);
  eq("break-even: commission", b.commissionCost, 14);
  eq("break-even: swap", b.swapCost, 4.8);
  eq("break-even: total", b.total, 42.8);
  eq("break-even: move in pips", b.pips, 2.14);
  eq("break-even: commission as a distance", b.commissionPips, 0.7);
  eq("break-even: swap as a distance", b.swapPips, 0.24);
  eq("break-even: move as a price", b.price, 0.000214, 1e-12);
  // the closed form: spread + (commission × sides + swap × nights) ÷ pip value = 1.2 + (7 + 2.4) ÷ 10 = 2.14
  eq("break-even: the closed form", 1.2 + (3.5 * 2 + 0.8 * 3) / 10, b.pips);
  // the lots cancel: the same costs on 0.01 lots and on 50 lots are the same distance
  for (const lots of [0.01, 0.5, 1, 50]) eq(`break-even: distance does not depend on the size (${lots} lots)`, M.breakEven({ spread: 1.2, commission: 3.5, sides: 2, swap: 0.8, nights: 3, lots, pipValue: 10, pipSize: 0.0001 }).pips, 2.14);
  // spread alone: the move is the spread
  eq("break-even: spread alone", M.breakEven({ spread: 2.5, commission: 0, sides: 2, swap: 0, nights: 0, lots: 1, pipValue: 10, pipSize: 0.0001 }).pips, 2.5);
  // a swap credit larger than the other costs: 1 × 10 + 0 + (−6 × 1 × 2) = −2: nothing left to cover
  ok("break-even: a credit can cover the costs", M.breakEven({ spread: 1, commission: 0, sides: 1, swap: -6, nights: 2, lots: 1, pipValue: 10, pipSize: 0.0001 }).pips < 0);
  // the Cost Lab's own expression (CostLab.tsx): total ÷ (pip value × lots), with total = spread cost + commission + swap
  {
    const [spread, comm, sides, swap, nights, lots, pipAcct] = [0.7, 3.5, 2, -0.4, 5, 0.35, 9.13];
    const total = spread * pipAcct * lots + comm * lots * sides + swap * lots * nights;
    eq("break-even: agrees with the Cost Lab's last line", M.breakEven({ spread, commission: comm, sides, swap, nights, lots, pipValue: pipAcct, pipSize: 0.0001 }).pips, total / (pipAcct * lots));
  }
}

/* ---- 4. lot size converter --------------------------------------------------- */

{
  // 0.35 standard lots of a 100,000 contract: 35,000 units; 3.5 mini lots; 35 micro lots
  const a = M.lotConvert(0.35, "standard", 100000);
  eq("lots: units", a.units, 35000);
  eq("lots: mini", a.mini, 3.5);
  eq("lots: micro", a.micro, 35);
  // 3 mini lots: 0.3 standard, 30,000 units
  const b = M.lotConvert(3, "mini", 100000);
  ok("lots: 3 mini lots are exactly 0.3 standard", b.standard === 0.3);
  eq("lots: 3 mini lots in units", b.units, 30000);
  // 7 micro lots: 0.07 standard, 7,000 units
  const c = M.lotConvert(7, "micro", 100000);
  ok("lots: 7 micro lots are exactly 0.07 standard", c.standard === 0.07);
  eq("lots: 7 micro lots in units", c.units, 7000);
  // 25,000 units: 0.25 standard, 2.5 mini, 25 micro
  const d = M.lotConvert(25000, "units", 100000);
  eq("lots: units to standard", d.standard, 0.25);
  eq("lots: units to mini", d.mini, 2.5);
  eq("lots: units to micro", d.micro, 25);
  // a contract of 100 (ounces of gold, say): 0.5 lots are 50 units
  eq("lots: another contract size", M.lotConvert(0.5, "standard", 100).units, 50);
  // 0.01 lots of 100,000 are 1,000 units, exactly
  ok("lots: 0.01 lots are exactly 1,000 units", M.lotConvert(0.01, "standard", 100000).units === 1000);
  // notional: 35,000 units at 1.1050 = 38,675
  eq("lots: notional value", M.notionalValue(35000, 1.105), 38675, 1e-6);
  // there and back, over a grid
  let round = true;
  for (const contract of [1, 100, 5000, 100000])
    for (const lots of [0.01, 0.07, 0.3, 1, 2.55, 40]) {
      const there = M.lotConvert(lots, "standard", contract);
      const back = M.lotConvert(there.units, "units", contract);
      if (Math.abs(back.standard - lots) > 1e-9 || Math.abs(M.lotConvert(there.mini, "mini", contract).units - there.units) > 1e-6 || Math.abs(M.lotConvert(there.micro, "micro", contract).units - there.units) > 1e-6) round = false;
    }
  ok("lots: every unit converts there and back", round);
}

/* ---- 5. correlation ---------------------------------------------------------- */

{
  // A = 1 2 3 4 5 6, B = 2 1 4 3 6 5: both means 3.5
  //   a − ā:  −2.5 −1.5 −0.5  0.5  1.5  2.5
  //   b − b̄:  −1.5 −2.5  0.5 −0.5  2.5  1.5
  //   products: 3.75 + 3.75 − 0.25 − 0.25 + 3.75 + 3.75 = 14.5
  //   squares of A: 6.25 + 2.25 + 0.25 + 0.25 + 2.25 + 6.25 = 17.5;   of B: the same six numbers = 17.5
  //   r = 14.5 ÷ √(17.5 × 17.5) = 14.5 ÷ 17.5 = 0.828571
  const p = M.pearson([1, 2, 3, 4, 5, 6], [2, 1, 4, 3, 6, 5]);
  eq("pearson: n", p.n, 6);
  eq("pearson: mean of A", p.meanX, 3.5);
  eq("pearson: mean of B", p.meanY, 3.5);
  eq("pearson: sum of products", p.sxy, 14.5);
  eq("pearson: sum of squares, A", p.sxx, 17.5);
  eq("pearson: sum of squares, B", p.syy, 17.5);
  eq("pearson: r", p.r, 14.5 / 17.5);
  eq("pearson: first row of the working", p.rows[0].dxdy, 3.75);
  ok("pearson: one row of working for each pair", p.rows.length === 6);

  // a straight rising line is +1, a falling one −1: B = 3A + 2, and B = 10 − 2A
  eq("pearson: a rising line", M.pearson([1, 2, 3, 4], [5, 8, 11, 14]).r, 1);
  eq("pearson: a falling line", M.pearson([1, 2, 3, 4], [8, 6, 4, 2]).r, -1);
  // A = 1 2 3 4, B = 1 −1 −1 1: means 2.5 and 0; products −1.5 + 0.5 − 0.5 + 1.5 = 0
  eq("pearson: no straight-line relationship", M.pearson([1, 2, 3, 4], [1, -1, -1, 1]).r, 0);
  // a series that never changes has no spread to divide by
  ok("pearson: a flat series has no coefficient", M.pearson([1, 2, 3], [4, 4, 4]).r === null);
  // unchanged when a series is moved or rescaled, and symmetric
  const a = [1.2, 0.7, 3.4, 2.2, 5.9, 4.1, 4.4];
  const b = [10, 14, 9, 17, 21, 12, 19];
  const base = M.pearson(a, b).r;
  eq("pearson: unchanged by scale and shift", M.pearson(a.map((v) => v * 250 - 3), b.map((v) => v / 8 + 100)).r, base);
  eq("pearson: reversed by a negative scale", M.pearson(a.map((v) => -v), b).r, -base);
  eq("pearson: symmetric", M.pearson(b, a).r, base);

  // changes: 5 values give 4 changes
  ok("changes: from one value to the next", JSON.stringify(M.changes([1, 3, 6, 4, 4])) === JSON.stringify([2, 3, -2, 0]));
  ok("changes: fewer than two values give none", M.changes([7]).length === 0);

  // parsing what is pasted
  const s = M.parseSeries("1.5, 2;3\n4\t-5  .5 −6");
  ok("series: spaces, commas, semicolons, tabs and new lines all separate", JSON.stringify(s.values) === JSON.stringify([1.5, 2, 3, 4, -5, 0.5, -6]) && s.bad.length === 0);
  const bad = M.parseSeries("1 two 3 4e2 1.2.3");
  ok("series: what is not a plain number is named, not guessed", JSON.stringify(bad.values) === JSON.stringify([1, 3]) && JSON.stringify(bad.bad) === JSON.stringify(["two", "4e2", "1.2.3"]));
  // a comma separates here, so 1,5 is two values: the page says so beside the field
  ok("series: a comma is a separator, not a decimal mark", JSON.stringify(M.parseSeries("1,5").values) === JSON.stringify([1, 5]));
  ok("series: nothing typed gives nothing", M.parseSeries("  \n ").values.length === 0);
}

/* ---- 6. the registry --------------------------------------------------------- */

{
  const formula = (slug) => tools.find((t) => t.slug === slug)?.formula;
  ok("tools.ts: risk of ruin", formula("risk-of-ruin") === "P ≈ (1 − D)^(2μ ÷ σ²);   μ = p·ln(1 + b·f) + (1 − p)·ln(1 − f);   σ² = p·(1 − p)·(ln(1 + b·f) − ln(1 − f))².   p = win rate, b = payoff ratio, f = share risked per trade, D = share of the account lost. P = 1 when μ ≤ 0.");
  ok("tools.ts: expectancy", formula("expectancy") === "E = p × average win − (1 − p) × average loss − cost;   per unit risked = E ÷ average loss;   break-even win rate = (average loss + cost) ÷ (average win + average loss)");
  ok("tools.ts: break-even", formula("break-even") === "move in pips = spread + (commission per lot × sides + swap per lot per night × nights) ÷ pip value per lot");
  ok("tools.ts: lot size converter", formula("lot-size-converter") === "units = standard lots × contract size;   1 standard lot = 10 mini lots = 100 micro lots;   notional value = units × price");
  ok("tools.ts: correlation", formula("correlation") === "r = Σ (a − ā)(b − b̄) ÷ √( Σ (a − ā)² × Σ (b − b̄)² )");
  // the published sentence of risk of ruin, worked literally, is what the function returns
  {
    const [p, b, f, D] = [0.55, 1.8, 0.03, 0.4];
    const mu = p * Math.log(1 + b * f) + (1 - p) * Math.log(1 - f);
    const s2 = p * (1 - p) * (Math.log(1 + b * f) - Math.log(1 - f)) ** 2;
    eq("risk of ruin: the function is the published formula", M.riskOfRuin(p, b, f, D).probability, (1 - D) ** ((2 * mu) / s2), 1e-12);
  }

  const slugs = tools.map((t) => t.slug);
  ok("registry: no slug twice", new Set(slugs).size === slugs.length);
  ok("registry: every tool has its plain-language text", slugs.every((s) => toolContent[s] && toolContent[s].paragraphs.length > 0), slugs.filter((s) => !toolContent[s]).join(", "));
  ok("registry: every tool has a couplet", slugs.every((s) => Array.isArray(toolRhymes[s]) && toolRhymes[s].length === 2), slugs.filter((s) => !toolRhymes[s]).join(", "));
  const grouped = toolGroups.flatMap((g) => g.slugs);
  ok("registry: every tool is in exactly one group of the hub", slugs.every((s) => grouped.filter((x) => x === s).length === 1), slugs.filter((s) => grouped.filter((x) => x === s).length !== 1).join(", "));
  ok("registry: a group lists only tools that exist", grouped.every((s) => slugs.includes(s)));
  ok("registry: every “next” tool exists", tools.every((t) => t.next.every((n) => slugs.includes(n) && n !== t.slug)));
  // the hub writes the count in words from the registry; the navigation and two other pages write it by hand
  ok("registry: the count of tools has a word", countWord(tools.length) !== String(tools.length), `${tools.length} tools`);
  eq("registry: twenty tools", tools.length, 20);
}

/* ---- 7. question of the day -------------------------------------------------- */

{
  // 5 October 2026 is 20,731 days after 1 January 1970: 56 years × 365 = 20,440, + 14 leap days (1972 … 2024) = 20,454, + 277 days to 5 October
  const day = Q.dayNumber(Date.UTC(2026, 9, 5, 13, 30));
  eq("qotd: the day number of 5 October 2026", day, 20731);
  ok("qotd: a day number as text", Q.dayText(day) === "2026-10-05");
  ok("qotd: the day is the UTC day, to its last millisecond", Q.dayNumber(Date.UTC(2026, 9, 5, 23, 59, 59, 999)) === day && Q.dayNumber(Date.UTC(2026, 9, 6)) === day + 1);

  // a pool of 10: 0.618 × 10 = 6.18 → 6, which shares a factor of 2 with 10 → 7 (three places from 10, so it stands)
  eq("qotd: stride of 10", Q.stride(10), 7);
  // a pool of 105: 0.618 × 105 = 64.89 → 65 (shares 5) → 66 (shares 3) → 67
  eq("qotd: stride of 105", Q.stride(105), 67);
  // day 1 of 105 is question 67; day 2 is 134 − 105 = 29; day 105 is back to 0
  eq("qotd: day 1 of 105", Q.questionIndex(1, 105), 67);
  eq("qotd: day 2 of 105", Q.questionIndex(2, 105), 29);
  eq("qotd: day 105 of 105", Q.questionIndex(105, 105), 0);
  // 20,731 mod 105 = 20,731 − 197 × 105 = 46;   46 × 67 = 3,082;   3,082 mod 105 = 3,082 − 29 × 105 = 37
  eq("qotd: 5 October 2026 in a pool of 105", Q.questionIndex(20731, 105), 37);
  ok("qotd: the same day gives the same question", Q.questionIndex(day, 105) === Q.questionIndex(day, 105));
  eq("qotd: an empty pool does not throw", Q.questionIndex(day, 0), 0);
  eq("qotd: a pool of one", Q.questionIndex(day, 1), 0);

  // every pool size: each question once in a cycle, and (pools of 7 or more) tomorrow's at least three places away, which is another lesson
  let permutes = true;
  let moves = true;
  for (let n = 1; n <= 400; n++) {
    const seen = new Set();
    for (let d = 20000; d < 20000 + n; d++) {
      const i = Q.questionIndex(d, n);
      if (!Number.isInteger(i) || i < 0 || i >= n) permutes = false;
      seen.add(i);
      if (n >= 7) {
        const gap = Math.abs(Q.questionIndex(d + 1, n) - i);
        if (Math.min(gap, n - gap) < 3) moves = false;
      }
    }
    if (seen.size !== n) permutes = false;
  }
  ok("qotd: every question comes round once before any repeats, for every pool up to 400", permutes);
  ok("qotd: tomorrow's question is at least three places away", moves);

  // the run of days
  const one = Q.answer(null, "2026-10-05", 2, true);
  ok("run: the first answer starts a run of one", one.streak === 1 && one.best === 1 && one.pick === 2 && one.right === true);
  ok("run: answering twice on one day changes nothing", Q.answer(one, "2026-10-05", 0, false) === one);
  const two = Q.answer(one, "2026-10-06", 1, false);
  ok("run: the next day adds one, right or wrong", two.streak === 2 && two.best === 2 && two.right === false);
  const gap = Q.answer(two, "2026-10-08", 0, true);
  ok("run: a missed day starts again, and the longest is kept", gap.streak === 1 && gap.best === 2);
  // across a month end and a leap day: 28 February 2028 → 29 February → 1 March
  const leap = Q.answer(Q.answer(Q.answer(null, "2028-02-28", 0, true), "2028-02-29", 0, true), "2028-03-01", 0, true);
  eq("run: across a leap day", leap.streak, 3);
  eq("run: standing on the day itself", Q.standing(two, "2026-10-06"), 2);
  eq("run: still standing the day after", Q.standing(two, "2026-10-07"), 2);
  eq("run: lapsed after a whole day missed", Q.standing(two, "2026-10-08"), 0);
  eq("run: none without a record", Q.standing(null, "2026-10-08"), 0);
  ok("run: answered today", Q.answeredOn(two, "2026-10-06") && !Q.answeredOn(two, "2026-10-07") && !Q.answeredOn(null, "2026-10-06"));

  // what storage holds is checked, not trusted
  ok("run: a good record is read back", JSON.stringify(Q.cleanRun(JSON.parse(JSON.stringify(two)))) === JSON.stringify(two));
  ok("run: not an object", Q.cleanRun("x") === null && Q.cleanRun(null) === null && Q.cleanRun([]) === null);
  ok("run: not a day", Q.cleanRun({ ...two, last: "yesterday" }) === null && Q.cleanRun({ ...two, last: "2026-13-45" }) === null);
  ok("run: not whole numbers", Q.cleanRun({ ...two, streak: 2.5 }) === null && Q.cleanRun({ ...two, right: "yes" }) === null);
  ok("run: an edited record is kept within bounds", Q.cleanRun({ ...two, streak: 1e9, best: 3 }).streak === 9999 && Q.cleanRun({ ...two, streak: 1e9, best: 3 }).best === 9999 && Q.cleanRun({ ...two, pick: 99 }).pick === 7);
}

/* ---- 8. the trading plan's file ---------------------------------------------- */

{
  ok("plan: no field has a default", P.PLAN_KEYS.every((k) => P.EMPTY_PLAN[k] === "") && P.isEmpty(P.EMPTY_PLAN));
  ok("plan: no key twice", new Set(P.PLAN_KEYS).size === P.PLAN_KEYS.length);
  ok("plan: every question ends as a question", P.PLAN_SECTIONS.every((s) => s.fields.every((f) => f.label.endsWith("?"))));
  // the sections the owner asked for: markets and times, risk (per trade and a daily stop), entry, exit, routine, review
  for (const k of ["markets", "times", "riskPerTrade", "dailyStop", "entry", "exitLoss", "exitProfit", "before", "after", "review"]) ok(`plan: has the question “${k}”`, P.PLAN_KEYS.includes(k));

  const plan = { ...P.EMPTY_PLAN, title: "My plan", markets: "EUR/USD\nGold", riskPerTrade: "Half of one per cent" };
  eq("plan: answers counted", P.answered(plan), 3);
  ok("plan: not empty once written in", !P.isEmpty(plan));

  // there and back through the file
  const text = P.toFile(plan, "2026-10-05");
  const back = P.fromFile(text);
  ok("plan: a file reads back as it was written", back.ok && JSON.stringify(back.plan) === JSON.stringify(plan) && back.answers === 3);
  const parsed = JSON.parse(text);
  ok("plan: the file says what it is", parsed.app === "gio4x-trading-plan" && parsed.v === 1 && parsed.exported === "2026-10-05");
  ok("plan: the file holds only the answered questions", JSON.stringify(Object.keys(parsed.plan).sort()) === JSON.stringify(["markets", "riskPerTrade", "title"]));
  ok("plan: an empty plan exports and reads back empty", P.fromFile(P.toFile(P.EMPTY_PLAN, "2026-10-05")).ok && P.isEmpty(P.fromFile(P.toFile(P.EMPTY_PLAN, "2026-10-05")).plan));

  // refused whole, with a reason
  const refused = (name, t) => {
    const r = P.fromFile(t);
    ok(`plan: refused: ${name}`, r.ok === false && typeof r.reason === "string" && r.reason.length > 0);
  };
  refused("not JSON", "markets: EUR/USD");
  refused("not an object", "[1,2,3]");
  refused("another site's file", JSON.stringify({ v: 1, plan: {} }));
  refused("a desk file", JSON.stringify({ app: "gio4x-desk", v: 1, plan: {} }));
  refused("another version", JSON.stringify({ app: P.FILE_APP, v: 2, plan: {} }));
  refused("no plan", JSON.stringify({ app: P.FILE_APP, v: 1 }));
  refused("an answer with no question", JSON.stringify({ app: P.FILE_APP, v: 1, plan: { advice: "buy" } }));
  refused("an answer that is not text", JSON.stringify({ app: P.FILE_APP, v: 1, plan: { markets: 5 } }));
  refused("an answer too long", JSON.stringify({ app: P.FILE_APP, v: 1, plan: { markets: "x".repeat(P.LIMITS.text + 1) } }));
  refused("a one-line answer too long", JSON.stringify({ app: P.FILE_APP, v: 1, plan: { title: "x".repeat(P.LIMITS.line + 1) } }));
  refused("a file too large", " ".repeat(P.LIMITS.file + 1));
  ok("plan: an answer at its limit is accepted", P.fromFile(JSON.stringify({ app: P.FILE_APP, v: 1, plan: { markets: "x".repeat(P.LIMITS.text) } })).ok);

  // what is typed
  ok("plan: line breaks survive in a long answer", P.tidy("markets", "a\r\nb\rc") === "a\nb\nc");
  ok("plan: a one-line answer stays on one line", P.tidy("title", "a\nb\tc") === "a b c");
  ok("plan: control characters are taken out", P.tidy("markets", "a\u0000b\u0007c\u007f") === "abc");
  ok("plan: an answer is cut at its limit", P.tidy("title", "x".repeat(500)).length === P.LIMITS.line && P.tidy("markets", "x".repeat(5000)).length === P.LIMITS.text);
  eq("plan: the limit of a line", P.limitOf("title"), P.LIMITS.line);
  eq("plan: the limit of an answer", P.limitOf("entry"), P.LIMITS.text);

  // what storage holds is checked, not trusted
  ok("plan: stored and revived", JSON.stringify(P.revive(JSON.parse(JSON.stringify(P.toStored(plan))))) === JSON.stringify(plan));
  ok("plan: nothing stored is the empty plan", P.isEmpty(P.revive(null)) && P.isEmpty(P.revive("x")) && P.isEmpty(P.revive({ v: 2, plan: { markets: "a" } })) && P.isEmpty(P.revive({ v: 1, plan: [] })));
  const mixed = P.revive({ v: 1, plan: { markets: "kept", title: 7, entry: "x".repeat(P.LIMITS.text + 1), other: "ignored" } });
  ok("plan: a stored answer that is not an answer is left out, the rest kept", mixed.markets === "kept" && mixed.title === "" && mixed.entry === "" && !("other" in mixed));
}

/* ---- result ------------------------------------------------------------------ */

if (failures.length) {
  console.error(`${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`${passed} checks passed`);
