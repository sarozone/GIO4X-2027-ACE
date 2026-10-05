/**
 * TRADER TOOLKIT — the arithmetic of five tools: risk of ruin, expectancy,
 * break-even after costs, the lot size converter and correlation.
 *
 * Pure and import-free, so it can be run and checked on its own
 * (`node scripts/test-tools-method.mjs` loads this file directly). Nothing here
 * is a price, a rate, a fee or a condition of GIO4X: every number comes from
 * the visitor. Rates and shares are fractions here (0.5 is 50%); the
 * components turn what was typed into fractions before they call in.
 */

/* ==========================================================================
   Risk of ruin
   ========================================================================== */

export type Ruin = {
  /** ln(1 + payoff × risk): what one win adds to the logarithm of the balance */
  winLog: number;
  /** ln(1 − risk): what one loss takes from it (a negative number) */
  lossLog: number;
  /** the average change in the logarithm of the balance per trade */
  drift: number;
  /** the variance of that change per trade */
  variance: number;
  /** ln(1 − level): how far the logarithm of the balance must fall to reach the level (a negative number) */
  barrier: number;
  /** 2 × drift ÷ variance; null when the drift is not positive or the variance is zero */
  exponent: number | null;
  /** the approximate probability of ever reaching the level, 0 to 1 */
  probability: number;
  /** true when the drift is zero or negative: the level is reached sooner or later, whatever its size */
  certain: boolean;
  /** how many losses in a row, from the start, take the balance to the level */
  lossesToLevel: number;
  /** the chance of exactly that run at the very start: (1 − win rate) to that power. Exact, and only one of the ways there */
  runProbability: number;
};

/**
 * The fixed-fraction approximation of the risk of ruin.
 *
 * Each trade risks the same fraction f of the balance as it then stands. A
 * loss multiplies the balance by (1 − f); a win by (1 + b·f), where b is the
 * payoff ratio. The logarithm of the balance therefore takes a step of
 * ln(1 + b·f) with probability p and of ln(1 − f) with probability 1 − p:
 *
 *   drift     μ  = p · ln(1 + b·f) + (1 − p) · ln(1 − f)
 *   variance  σ² = p · (1 − p) · (ln(1 + b·f) − ln(1 − f))²
 *
 * Treating that walk as a continuous one with the same drift and variance,
 * the probability that it ever falls by ln(1 − D), which is the balance
 * falling to (1 − D) of where it began, is
 *
 *   P = exp(2μ · ln(1 − D) ÷ σ²) = (1 − D)^(2μ ÷ σ²)      when μ > 0
 *   P = 1                                                 when μ ≤ 0
 *
 * An approximation: it assumes independent trades, a win rate and a payoff
 * that never change, every win and every loss of exactly the stated size, no
 * limit on the number of trades, and it ignores that the balance moves in
 * steps and so passes the level instead of landing on it.
 */
export function riskOfRuin(winRate: number, payoff: number, risk: number, level: number): Ruin {
  const winLog = Math.log(1 + payoff * risk);
  const lossLog = Math.log(1 - risk);
  const drift = winRate * winLog + (1 - winRate) * lossLog;
  const variance = winRate * (1 - winRate) * (winLog - lossLog) ** 2;
  const barrier = Math.log(1 - level);
  // a run of losses from the start: the smallest n with (1 − f)ⁿ ≤ 1 − D
  const lossesToLevel = Math.max(1, Math.ceil(barrier / lossLog - 1e-12));
  const runProbability = (1 - winRate) ** lossesToLevel;
  if (!(drift > 0)) return { winLog, lossLog, drift, variance, barrier, exponent: null, probability: 1, certain: true, lossesToLevel, runProbability };
  // every trade a win: nothing ever falls
  if (!(variance > 0)) return { winLog, lossLog, drift, variance, barrier, exponent: null, probability: 0, certain: false, lossesToLevel, runProbability };
  const exponent = (2 * drift) / variance;
  return { winLog, lossLog, drift, variance, barrier, exponent, probability: Math.min(1, Math.exp(exponent * barrier)), certain: false, lossesToLevel, runProbability };
}

/* ==========================================================================
   Expectancy
   ========================================================================== */

export type Expectancy = {
  /** win rate × average win − loss rate × average loss, before costs */
  gross: number;
  /** the same, less the cost of one trade */
  net: number;
  /** net ÷ average loss: the expectancy for each unit of money risked, taking the average loss as the risk */
  perRisk: number;
  /** average win ÷ average loss */
  payoff: number;
  /** the win rate at which the net expectancy is zero; above 1 when no win rate is enough */
  breakEvenWinRate: number;
  /** the same before costs: 1 ÷ (1 + payoff), as on the Risk / Reward tool */
  breakEvenGross: number;
};

/**
 * Expectancy per trade.
 *
 *   E = p·W − (1 − p)·L − c
 *
 * p is the win rate, W the average win, L the average loss (as a positive
 * amount) and c the cost of one trade where W and L are counted before costs.
 * Setting E to zero and solving for p gives the break-even win rate:
 *
 *   p* = (L + c) ÷ (W + L)
 */
export function expectancy(winRate: number, avgWin: number, avgLoss: number, cost = 0): Expectancy {
  const gross = winRate * avgWin - (1 - winRate) * avgLoss;
  const net = gross - cost;
  return {
    gross,
    net,
    perRisk: net / avgLoss,
    payoff: avgWin / avgLoss,
    breakEvenWinRate: (avgLoss + cost) / (avgWin + avgLoss),
    breakEvenGross: avgLoss / (avgWin + avgLoss),
  };
}

/* ==========================================================================
   Break-even after costs
   ========================================================================== */

export type BreakEvenInput = {
  /** the spread, in pips (or points) */
  spread: number;
  /** commission for one lot, charged once for each side counted */
  commission: number;
  /** 1 when commission is charged once, 2 when on opening and again on closing */
  sides: number;
  /** swap for one lot for one night: positive is a charge, negative a credit */
  swap: number;
  nights: number;
  lots: number;
  /** what one pip is worth on one lot, in the currency the commission and swap are in */
  pipValue: number;
  /** the size of one pip as a price (0.0001 for most currency pairs) */
  pipSize: number;
};

export type BreakEven = {
  spreadCost: number;
  commissionCost: number;
  swapCost: number;
  total: number;
  /** each cost as a distance: the spread itself, and the commission and swap divided by the value of a pip */
  commissionPips: number;
  swapPips: number;
  /** the whole distance the price must travel in the position's favour before the trade has earned anything */
  pips: number;
  /** the same distance as a difference in price */
  price: number;
};

/**
 * How far the price must move to cover the costs of one position.
 *
 *   cost  = spread × pip value × lots + commission × lots × sides + swap × lots × nights
 *   move  = cost ÷ (pip value × lots)
 *         = spread + (commission × sides + swap × nights) ÷ pip value
 *
 * The same expression as the last line of the Cost Lab's working. The lots
 * cancel: the distance does not depend on the size, only the money does.
 */
export function breakEven(i: BreakEvenInput): BreakEven {
  const spreadCost = i.spread * i.pipValue * i.lots;
  const commissionCost = i.commission * i.lots * i.sides;
  const swapCost = i.swap * i.lots * i.nights;
  const total = spreadCost + commissionCost + swapCost;
  const perPip = i.pipValue * i.lots;
  const pips = total / perPip;
  return { spreadCost, commissionCost, swapCost, total, commissionPips: commissionCost / perPip, swapPips: swapCost / perPip, pips, price: pips * i.pipSize };
}

/* ==========================================================================
   Lot size converter
   ========================================================================== */

export type LotUnit = "standard" | "mini" | "micro" | "units";

/** How many of each make one standard lot: a mini lot is a tenth of it and a micro lot a hundredth, whatever the contract. */
export const LOTS_PER_STANDARD = { standard: 1, mini: 10, micro: 100 } as const;

export type Lots = { standard: number; mini: number; micro: number; units: number };

/**
 * One size, said four ways. `contract` is the number of units of the
 * underlying in one standard lot (100,000 for a currency pair by convention;
 * other instruments differ, which is why it is an input).
 *
 *   units = standard lots × contract size;   mini lots = standard × 10;   micro lots = standard × 100
 */
export function lotConvert(amount: number, unit: LotUnit, contract: number): Lots {
  if (unit === "units") {
    const standard = amount / contract;
    return { standard, mini: standard * 10, micro: standard * 100, units: amount };
  }
  // divided, not multiplied by 0.1 or 0.01, so 3 mini lots are 0.3 lots and not 0.30000000000000004
  const standard = amount / LOTS_PER_STANDARD[unit];
  return { standard, mini: standard * 10, micro: standard * 100, units: (amount * contract) / LOTS_PER_STANDARD[unit] };
}

/** The full value of the position at a price, in the currency the price is quoted in. */
export const notionalValue = (units: number, price: number): number => units * price;

/* ==========================================================================
   Correlation
   ========================================================================== */

/** The most values one series may hold: enough for several years of daily figures. */
export const SERIES_MAX = 1000;
/** Pearson's coefficient needs at least three pairs to say anything at all. */
export const SERIES_MIN = 3;

export type Series = { values: number[]; bad: string[] };

/**
 * A pasted column or a typed row of numbers. Values are separated by spaces,
 * new lines, tabs, semicolons or commas, so a comma cannot also be a decimal
 * mark here: decimals take a point. Anything that is not a plain number is
 * returned in `bad`, as typed, so the page can name it.
 */
export function parseSeries(text: string): Series {
  const values: number[] = [];
  const bad: string[] = [];
  for (const raw of text.split(/[\s;,]+/)) {
    if (raw === "") continue;
    const token = raw.replace("−", "-");
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(token) && Number.isFinite(Number(token))) values.push(Number(token));
    else bad.push(raw);
  }
  return { values, bad };
}

/** The change from each value to the next: n values give n − 1 changes. */
export const changes = (v: readonly number[]): number[] => v.slice(1).map((x, i) => x - v[i]);

export type PearsonRow = { x: number; y: number; dx: number; dy: number; dxdy: number; dx2: number; dy2: number };

export type Pearson = {
  n: number;
  meanX: number;
  meanY: number;
  /** Σ (x − x̄)(y − ȳ) */
  sxy: number;
  /** Σ (x − x̄)² */
  sxx: number;
  /** Σ (y − ȳ)² */
  syy: number;
  /** −1 to +1; null when either series never changes, because the division is by zero */
  r: number | null;
  /** one line of working for each pair */
  rows: PearsonRow[];
};

/**
 * Pearson's correlation coefficient of two series of equal length.
 *
 *   r = Σ (x − x̄)(y − ȳ) ÷ √( Σ (x − x̄)² × Σ (y − ȳ)² )
 *
 * Only the first `min(x.length, y.length)` pairs are used; the component
 * refuses unequal lengths before it calls in.
 */
export function pearson(x: readonly number[], y: readonly number[]): Pearson {
  const n = Math.min(x.length, y.length);
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = n ? sumX / n : 0;
  const meanY = n ? sumY / n : 0;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  const rows: PearsonRow[] = [];
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    rows.push({ x: x[i], y: y[i], dx, dy, dxdy: dx * dy, dx2: dx * dx, dy2: dy * dy });
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const flat = !(sxx > 1e-300) || !(syy > 1e-300);
  return { n, meanX, meanY, sxy, sxx, syy, r: flat ? null : Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy))), rows };
}
