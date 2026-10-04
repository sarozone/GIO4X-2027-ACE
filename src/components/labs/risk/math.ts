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
