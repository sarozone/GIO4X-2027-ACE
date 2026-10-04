/**
 * THE RISK ROOM — its arithmetic and its seeded simulation.
 *
 * A pure module with no imports, so it can be run and checked on its own
 * (Node runs it directly). The rule it keeps: everything here is either exact
 * arithmetic on the figures it is given, or a simulation drawn from a seeded
 * generator, so the same seed always gives the same result. It models
 * independent trades of fixed odds on invented figures. Real trading is
 * neither independent nor of fixed odds, and nothing here describes a market.
 *
 * Balances are multiples of the starting balance: 1 is where the account began.
 */

/** A small fixed-seed generator: the same seed always gives the same numbers, each from 0 up to 1. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** One draw from the bell curve (mean 0, swing 1), by the Box-Muller method. */
export function normal(r: () => number): number {
  const u = Math.max(r(), 1e-12);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------------------------------------------------------------------------
 * Recovery: a loss of x leaves 1 − x, and getting back to 1 takes a gain of
 * x ÷ (1 − x) on what is left. Both are fractions (0.5 is 50%).
 * ------------------------------------------------------------------------- */

export function recoveryGain(loss: number): number {
  if (!(loss > 0)) return 0;
  if (loss >= 1) return Infinity;
  return loss / (1 - loss);
}

/* ---------------------------------------------------------------------------
 * Trades of fixed odds.
 * ------------------------------------------------------------------------- */

/** The average result of one trade, in units of the amount risked: win rate × gain − loss rate × 1. */
export function expectancy(winRate: number, payoff: number): number {
  return winRate * payoff - (1 - winRate);
}

/** A seeded run of trades: true is a win. Each is independent of the others. */
export function outcomes(seed: number, trades: number, winRate: number): boolean[] {
  const r = seeded(seed);
  const out: boolean[] = [];
  for (let i = 0; i < trades; i++) out.push(r() < winRate);
  return out;
}

/**
 * A run of trades replayed at one size. Each trade risks the same share of the
 * balance as it then stands: a loss takes that share, a win adds the share
 * times the payoff. The curve starts at 1 and has one point after each trade.
 */
export function replay(run: readonly boolean[], payoff: number, risk: number): number[] {
  const curve = [1];
  let b = 1;
  for (const win of run) {
    b *= win ? 1 + risk * payoff : 1 - risk;
    curve.push(b);
  }
  return curve;
}

/** The deepest fall from an earlier peak, as a share of that peak, and where it began and bottomed. */
export function deepestFall(curve: readonly number[]): { depth: number; peak: number; trough: number } {
  let best = { depth: 0, peak: 0, trough: 0 };
  let peakAt = 0;
  for (let i = 1; i < curve.length; i++) {
    if (curve[i]! >= curve[peakAt]!) {
      peakAt = i;
      continue;
    }
    const depth = 1 - curve[i]! / curve[peakAt]!;
    if (depth > best.depth) best = { depth, peak: peakAt, trough: i };
  }
  return best;
}

/**
 * The longest stretch spent below an earlier peak, counted in trades from the
 * peak to the point that regains it. `open` is true when that stretch had not
 * ended by the last trade: the curve never got back.
 */
export function longestUnderwater(curve: readonly number[]): { trades: number; open: boolean } {
  let best = { trades: 0, open: false };
  let peakAt = 0;
  for (let i = 1; i < curve.length; i++) {
    const back = curve[i]! >= curve[peakAt]!;
    const last = i === curve.length - 1;
    if (back || last) {
      const length = i - peakAt;
      // a stretch of one trade that sets a new peak was never under water
      const under = !back || length > 1;
      if (under && length > best.trades) best = { trades: length, open: !back };
      if (back) peakAt = i;
    }
  }
  return best;
}

/* ---------------------------------------------------------------------------
 * Losing streaks. The chance of at least `run` losses in a row somewhere in
 * `trades` independent trades, computed exactly by dynamic programming.
 *
 * Keep one number for each length of the losing run the sequence currently
 * ends on (0, 1, … run − 1) and one for "the streak has already happened".
 * Each trade moves every number: a win sends it back to a run of 0, a loss
 * moves it one step along, and a loss from run − 1 lands in "happened", which
 * nothing leaves. After the last trade that number is the answer.
 * ------------------------------------------------------------------------- */

export function streakChance(lossRate: number, trades: number, run: number): number {
  if (run <= 0) return 1;
  if (run > trades) return 0;
  const q = Math.min(1, Math.max(0, lossRate));
  let state = new Array<number>(run).fill(0);
  state[0] = 1;
  let happened = 0;
  for (let t = 0; t < trades; t++) {
    const next = new Array<number>(run).fill(0);
    let alive = 0;
    for (let j = 0; j < run; j++) {
      const p = state[j]!;
      alive += p;
      if (j + 1 < run) next[j + 1] = p * q;
      else happened += p * q;
    }
    next[0] = alive * (1 - q);
    state = next;
  }
  return Math.min(1, happened);
}

/** The longest run of losses in a sequence, and where it starts (-1 when there is no loss). */
export function longestLosingRun(run: readonly boolean[]): { length: number; start: number } {
  let best = { length: 0, start: -1 };
  let from = -1;
  for (let i = 0; i < run.length; i++) {
    if (run[i]) {
      from = -1;
      continue;
    }
    if (from < 0) from = i;
    const length = i - from + 1;
    if (length > best.length) best = { length, start: from };
  }
  return best;
}

/* ---------------------------------------------------------------------------
 * Risk of ruin, by simulation. Many seeded runs of trades at the same odds and
 * the same size. A run is "ruined" the first time its balance is at or below
 * 1 − ruin (a fall of that share from where it began), and it stops there.
 * ------------------------------------------------------------------------- */

export type RuinInput = {
  /** share of trades that win, 0 to 1 */
  winRate: number;
  /** the average gain as a multiple of the average loss */
  payoff: number;
  /** share of the balance risked on each trade, 0 to 1 */
  risk: number;
  /** the fall from the start that counts as ruin, 0 to 1 */
  ruin: number;
  trades: number;
  paths: number;
  seed: number;
};

export type RuinFan = {
  /** one curve per run; a ruined run's curve ends at the trade that ruined it */
  curves: number[][];
  /** the trade at which each run was ruined, or -1 */
  ruinedAt: number[];
  ruined: number;
  share: number;
  /** the middle of the balances the runs ended on */
  median: number;
};

export function ruinFan(input: RuinInput): RuinFan {
  const r = seeded(input.seed);
  const floor = 1 - input.ruin;
  const curves: number[][] = [];
  const ruinedAt: number[] = [];
  const ends: number[] = [];
  let ruined = 0;
  for (let p = 0; p < input.paths; p++) {
    const curve = [1];
    let b = 1;
    let at = -1;
    for (let t = 1; t <= input.trades; t++) {
      b *= r() < input.winRate ? 1 + input.risk * input.payoff : 1 - input.risk;
      curve.push(b);
      if (b <= floor) {
        at = t;
        break;
      }
    }
    if (at >= 0) ruined++;
    curves.push(curve);
    ruinedAt.push(at);
    ends.push(b);
  }
  ends.sort((a, b) => a - b);
  const mid = ends.length >> 1;
  const median = ends.length === 0 ? 1 : ends.length % 2 ? ends[mid]! : (ends[mid - 1]! + ends[mid]!) / 2;
  return { curves, ruinedAt, ruined, share: input.paths ? ruined / input.paths : 0, median };
}

/* ---------------------------------------------------------------------------
 * Holdings that move together. Every pair has the same correlation `rho`.
 *
 * The swing (standard deviation) of the combination is the square root of
 *   Σ wᵢ²σᵢ²  +  2 Σ wᵢwⱼρσᵢσⱼ   (the second sum over each pair once).
 * For two holdings: √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂).
 * With no weights given, each holding has an equal share.
 * ------------------------------------------------------------------------- */

export function combinedSd(sds: readonly number[], rho: number, weights?: readonly number[]): number {
  const n = sds.length;
  if (n === 0) return 0;
  const w = weights ?? sds.map(() => 1 / n);
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += w[i]! * w[i]! * sds[i]! * sds[i]!;
    for (let j = i + 1; j < n; j++) v += 2 * w[i]! * w[j]! * rho * sds[i]! * sds[j]!;
  }
  return Math.sqrt(Math.max(0, v));
}

/** The lowest correlation that n holdings can all share with one another: −1 ÷ (n − 1). */
export const lowestSharedCorrelation = (n: number): number => (n < 2 ? -1 : -1 / (n - 1));

/**
 * Seeded paths for holdings whose steps share one correlation. Independent
 * bell-curve draws are mixed through the Cholesky factor of the correlation
 * matrix, then each is scaled by its holding's swing and added up. The
 * combined path is the equal-share average of the parts.
 */
export function correlatedPaths(seed: number, sds: readonly number[], rho: number, steps: number): { parts: number[][]; combined: number[] } {
  const n = sds.length;
  const r = seeded(seed);
  // Cholesky factor L of the n × n matrix with 1 on the diagonal and rho elsewhere
  const L: number[][] = [];
  for (let i = 0; i < n; i++) {
    L.push(new Array<number>(n).fill(0));
    for (let j = 0; j <= i; j++) {
      let s = i === j ? 1 : rho;
      for (let k = 0; k < j; k++) s -= L[i]![k]! * L[j]![k]!;
      L[i]![j] = i === j ? Math.sqrt(Math.max(0, s)) : L[j]![j]! > 1e-12 ? s / L[j]![j]! : 0;
    }
  }
  const parts: number[][] = sds.map(() => [0]);
  const combined = [0];
  const z = new Array<number>(n).fill(0);
  for (let t = 1; t <= steps; t++) {
    for (let i = 0; i < n; i++) z[i] = normal(r);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let x = 0;
      for (let k = 0; k <= i; k++) x += L[i]![k]! * z[k]!;
      const v = parts[i]![t - 1]! + x * sds[i]!;
      parts[i]!.push(v);
      sum += v;
    }
    combined.push(n ? sum / n : 0);
  }
  return { parts, combined };
}

/** The step-to-step changes of a path. */
export function changes(path: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < path.length; i++) out.push(path[i]! - path[i - 1]!);
  return out;
}

/** The swing (standard deviation) of a list of numbers. */
export function sd(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1));
}

/** How closely two lists move together, from −1 to 1. */
export function correlation(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i]!;
    mb += b[i]!;
  }
  ma /= n;
  mb /= n;
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (a[i]! - ma) * (b[i]! - mb);
    saa += (a[i]! - ma) ** 2;
    sbb += (b[i]! - mb) ** 2;
  }
  return saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
}

/* ---------------------------------------------------------------------------
 * Building a portfolio. Invented holdings whose returns come from the seeded
 * paths above, held at chosen weights, with money paid in or taken out,
 * rebalancing that costs something, an exchange rate and borrowed money.
 *
 * A return is a fraction of the holding's value for one period (0.02 is +2%).
 * Money is in invented units. Nothing here can go below zero.
 * ------------------------------------------------------------------------- */

/**
 * Whole-number shares that always add up to `total`. One share is set to
 * `value`; the others divide what is left in the proportions they already
 * had (equally, if they were all nothing). Rounding goes to the largest
 * remainders, so the sum is exact.
 */
export function shareOut(shares: readonly number[], index: number, value: number, total = 100): number[] {
  const n = shares.length;
  if (n === 0) return [];
  if (n === 1) return [total];
  const v = Math.min(total, Math.max(0, Math.round(value)));
  const rest = total - v;
  let others = 0;
  for (let i = 0; i < n; i++) if (i !== index) others += Math.max(0, shares[i]!);
  const out = new Array<number>(n).fill(0);
  const parts: { i: number; frac: number }[] = [];
  let given = 0;
  for (let i = 0; i < n; i++) {
    if (i === index) continue;
    const raw = others > 0 ? (Math.max(0, shares[i]!) / others) * rest : rest / (n - 1);
    const whole = Math.floor(raw + 1e-9);
    out[i] = whole;
    given += whole;
    parts.push({ i, frac: raw - whole });
  }
  parts.sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; given < rest; k++, given++) out[parts[k % parts.length]!.i]! += 1;
  out[index] = v;
  return out;
}

/** A stretch of periods (after `from`, up to and including `to`) in which every pair's correlation is `rho` and every swing is multiplied by `widen`. */
export type StressStretch = { from: number; to: number; rho: number; widen: number };

/**
 * Seeded returns for several holdings, one list per holding and one return
 * per period: the holding's average return plus a bell-curve step with its
 * swing, every pair sharing the correlation `rho` (the steps of
 * `correlatedPaths`). Inside a stress stretch the steps are taken from a
 * second set drawn with the same seed, so the same luck, but with the
 * stretch's higher correlation and wider swings. Outside it nothing changes.
 * No return is allowed below −99%, so a holding cannot go negative.
 */
export function holdingReturns(seed: number, means: readonly number[], sds: readonly number[], rho: number, steps: number, stress?: StressStretch): number[][] {
  const calm = correlatedPaths(seed, sds, rho, steps).parts.map(changes);
  const hot = stress ? correlatedPaths(seed, sds.map((s) => s * stress.widen), stress.rho, steps).parts.map(changes) : null;
  return calm.map((steady, i) =>
    steady.map((shock, k) => {
      const t = k + 1;
      const inside = hot !== null && stress !== undefined && t > stress.from && t <= stress.to;
      return Math.max(-0.99, (means[i] ?? 0) + (inside ? hot[i]![k]! : shock));
    }),
  );
}

/** A seeded, invented exchange rate: it starts at 1 and each period is multiplied by 1 plus a bell-curve step of swing `sd`. It never falls below a hundredth of where it stood. */
export function exchangeRate(seed: number, sd: number, steps: number): number[] {
  const moves = changes(correlatedPaths(seed, [sd], 0, steps).parts[0] ?? [0]);
  const rate = [1];
  for (const m of moves) rate.push(rate[rate.length - 1]! * Math.max(0.01, 1 + m));
  return rate;
}

/** A holding's returns counted in the home unit: (1 + its own return) × (the rate now ÷ the rate before) − 1. */
export function inHomeUnit(returns: readonly number[], rate: readonly number[]): number[] {
  return returns.map((r, k) => (1 + r) * ((rate[k + 1] ?? 1) / (rate[k] || 1)) - 1);
}

/** When the holdings are put back to their target weights: never, every so many periods, or whenever any weight is more than `band` (a fraction of the whole) from its target. */
export type RebalanceRule = { kind: "never" } | { kind: "every"; steps: number } | { kind: "band"; band: number };

export type PortfolioPlan = {
  /** the amount put in at the start, bought at the target weights at no cost */
  start: number;
  /** target weights; they are scaled to add up to 1 (equal shares if they are all nothing) */
  weights: readonly number[];
  /** paid in each period (positive) or taken out (negative) */
  flow: number;
  rule: RebalanceRule;
  /** the cost of a rebalancing trade, as a fraction of the value bought or sold */
  cost: number;
};

export type PortfolioRun = {
  /** the whole portfolio's value: one figure at the start and one after each period */
  values: number[];
  /** each holding's share of the whole at the same moments */
  weights: number[][];
  /** the value of one unit held throughout: the same returns and costs, with money paid in or taken out left out */
  unit: number[];
  /** the periods in which a rebalancing trade was made */
  rebalancedAt: number[];
  /** the starting amount, plus everything paid in, less everything taken out */
  paidIn: number;
  /** every rebalancing cost added up */
  cost: number;
  /** the period in which withdrawals emptied the portfolio, or -1 */
  emptyAt: number;
};

/**
 * One portfolio followed through the returns it is given. In each period, in
 * this order:
 *   1. every holding grows or shrinks by its own return;
 *   2. money paid in is split at the target weights, or money taken out is
 *      taken from every holding in proportion to what it is then worth (a
 *      withdrawal larger than the whole takes what there is, and the run ends);
 *   3. if the rule says so, the holdings are put back to the target weights.
 *      The trades are the differences between what each holding is worth and
 *      what its target says; the cost is `cost` × the total of those
 *      differences (bought and sold both count) and comes off the whole.
 */
export function runPortfolio(returns: readonly (readonly number[])[], plan: PortfolioPlan): PortfolioRun {
  const n = returns.length;
  const steps = n ? Math.min(...returns.map((r) => r.length)) : 0;
  const given = plan.weights.slice(0, n).map((w) => Math.max(0, w));
  while (given.length < n) given.push(0);
  const sum = given.reduce((a, b) => a + b, 0);
  const target = given.map((w) => (sum > 0 ? w / sum : 1 / n));
  const rate = Math.max(0, plan.cost);
  const start = Math.max(0, plan.start);

  const held = target.map((w) => w * start);
  let total = start;
  const values = [total];
  const weights = [target.slice()];
  const unit = [1];
  const rebalancedAt: number[] = [];
  let paidIn = start;
  let cost = 0;
  let emptyAt = -1;

  for (let t = 1; t <= steps; t++) {
    if (emptyAt >= 0 || !(total > 0)) {
      // nothing is left: the run has ended
      values.push(0);
      weights.push(target.slice());
      unit.push(unit[unit.length - 1]!);
      continue;
    }
    const before = total;
    total = 0;
    for (let i = 0; i < n; i++) {
      held[i] = Math.max(0, held[i]! * (1 + Math.max(-1, returns[i]![t - 1]!)));
      total += held[i]!;
    }

    let flow = 0;
    if (plan.flow > 0) {
      flow = plan.flow;
      for (let i = 0; i < n; i++) held[i] = held[i]! + target[i]! * flow;
      total += flow;
    } else if (plan.flow < 0 && total > 0) {
      const take = Math.min(-plan.flow, total);
      const keep = (total - take) / total;
      for (let i = 0; i < n; i++) held[i] = held[i]! * keep;
      flow = -take;
      total = take >= total ? 0 : total - take;
    }
    paidIn += flow;

    if (total > 0) {
      let due = false;
      if (plan.rule.kind === "every") due = plan.rule.steps > 0 && t % plan.rule.steps === 0;
      else if (plan.rule.kind === "band") {
        for (let i = 0; i < n; i++) if (Math.abs(held[i]! / total - target[i]!) > plan.rule.band) due = true;
      }
      if (due) {
        let traded = 0;
        for (let i = 0; i < n; i++) traded += Math.abs(target[i]! * total - held[i]!);
        if (traded > total * 1e-9) {
          const fee = Math.min(total, rate * traded);
          total -= fee;
          cost += fee;
          for (let i = 0; i < n; i++) held[i] = target[i]! * total;
          rebalancedAt.push(t);
        }
      }
    }

    if (!(total > 0)) {
      total = 0;
      for (let i = 0; i < n; i++) held[i] = 0;
      emptyAt = t;
    }
    values.push(total);
    weights.push(total > 0 ? held.map((v) => v / total) : target.slice());
    unit.push(Math.max(0, (unit[unit.length - 1]! * (total - flow)) / before));
  }
  return { values, weights, unit, rebalancedAt, paidIn, cost, emptyAt };
}

/**
 * The same exposure with borrowed money. One unit of the holder's own money
 * and `multiple` − 1 borrowed buy `multiple` units of a path at the start,
 * and the loan is left alone. Each period the exposure moves with the path
 * and the loan grows by `financing` (a fraction per period). What belongs to
 * the holder is exposure − loan. The first time that is nothing or less, the
 * holder is wiped out: the curve is 0 from there on and `wipedAt` says when.
 */
export function borrowed(path: readonly number[], multiple: number, financing: number): { curve: number[]; wipedAt: number } {
  const m = Math.max(1, multiple);
  const f = Math.max(0, financing);
  const first = path[0] ?? 1;
  let loan = m - 1;
  const curve = [1];
  let wipedAt = -1;
  for (let t = 1; t < path.length; t++) {
    if (wipedAt >= 0) {
      curve.push(0);
      continue;
    }
    loan *= 1 + f;
    const own = first > 0 ? (m * path[t]!) / first - loan : 0;
    if (own <= 0) {
      wipedAt = t;
      curve.push(0);
    } else curve.push(own);
  }
  return { curve, wipedAt };
}
