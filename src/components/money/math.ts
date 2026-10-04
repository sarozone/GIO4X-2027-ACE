/**
 * THE MONEY CALCULATORS' ARITHMETIC.
 *
 * A pure module: no imports, no rounding for show, no state. Every function
 * states the formula it computes, so a visitor (or a reviewer) can check a
 * result by hand. The rule it keeps: a rate is only ever a number the caller
 * supplies. Nothing in here knows, guesses or forecasts a return, an inflation
 * rate or a tax rate.
 *
 * Conventions, used throughout:
 *   - a rate "per period" is a decimal (0.01 is 1%);
 *   - an annual percentage becomes a monthly rate by dividing by twelve
 *     (i = r ÷ 12 ÷ 100), which is how loans are commonly quoted;
 *   - a result is returned unrounded. Real lenders and providers round to the
 *     smallest unit of the currency, so a real statement differs by pennies.
 */

/** Monthly rate from an annual percentage: i = r ÷ 12 ÷ 100. */
export const monthlyRate = (annualPct: number): number => annualPct / 1200;

/** A single sum left to compound: FV = PV × (1 + i)^n. */
export const compound = (pv: number, i: number, n: number): number => pv * Math.pow(1 + i, n);

/**
 * A fixed payment every period, compounded.
 *   paid at the end of each period:    FV = P × ((1 + i)^n − 1) ÷ i
 *   paid at the start of each period:  FV = P × ((1 + i)^n − 1) ÷ i × (1 + i)
 *   when i = 0:                        FV = P × n
 */
export function seriesFutureValue(payment: number, i: number, n: number, atStart = false): number {
  if (n <= 0) return 0;
  if (Math.abs(i) < 1e-12) return payment * n;
  const fv = (payment * (Math.pow(1 + i, n) - 1)) / i;
  return atStart ? fv * (1 + i) : fv;
}

/**
 * The fixed payment that reaches a target, given a sum already held.
 *   P = (T − L × (1 + i)^n) × i ÷ ((1 + i)^n − 1)      [÷ (1 + i) when paid at the start]
 *   when i = 0:  P = (T − L) ÷ n
 * A result of zero or less means the sum already held reaches the target alone.
 */
export function paymentForTarget(target: number, held: number, i: number, n: number, atStart = false): number {
  if (n <= 0) return target - held;
  const gap = target - compound(held, i, n);
  if (Math.abs(i) < 1e-12) return gap / n;
  const p = (gap * i) / (Math.pow(1 + i, n) - 1);
  return atStart ? p / (1 + i) : p;
}

/** One year-end reading of a savings path. */
export type YearPoint = { year: number; paid: number; value: number };

/**
 * A starting sum and a monthly payment, read at the end of each year:
 *   value = L × (1 + i)^m + seriesFutureValue(P, i, m),  paid = L + P × m,  m = 12 × year.
 */
export function savingsPath(start: number, payment: number, annualPct: number, years: number, atStart = false): YearPoint[] {
  const i = monthlyRate(annualPct);
  const out: YearPoint[] = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    out.push({ year: y, paid: start + payment * m, value: compound(start, i, m) + seriesFutureValue(payment, i, m, atStart) });
  }
  return out;
}

/**
 * The level payment that clears a loan (an EMI: equated monthly instalment).
 *   M = L × i × (1 + i)^n ÷ ((1 + i)^n − 1)
 *   when i = 0:  M = L ÷ n
 */
export function loanPayment(principal: number, i: number, n: number): number {
  if (n <= 0) return principal;
  if (Math.abs(i) < 1e-12) return principal / n;
  const g = Math.pow(1 + i, n);
  return (principal * i * g) / (g - 1);
}

export type LoanRow = { month: number; payment: number; interest: number; principal: number; balance: number };

/**
 * A loan, payment by payment. For each month:
 *   interest  = balance × i
 *   principal = M − interest
 *   balance   = balance − principal
 * The last balance is zero by construction (a remainder smaller than a millionth is dropped).
 */
export function amortisation(principal: number, i: number, n: number): LoanRow[] {
  const m = loanPayment(principal, i, n);
  const rows: LoanRow[] = [];
  let balance = principal;
  for (let k = 1; k <= n; k++) {
    const interest = balance * i;
    const part = m - interest;
    balance -= part;
    if (k === n || Math.abs(balance) < 1e-6) balance = 0;
    rows.push({ month: k, payment: m, interest, principal: part, balance });
  }
  return rows;
}

/** What something costs after t years of rising prices: cost = A × (1 + π)^t. */
export const inflate = (amount: number, inflationPct: number, years: number): number => amount * Math.pow(1 + inflationPct / 100, years);

/** What an unchanged sum of money buys after t years, in today's money: A ÷ (1 + π)^t. */
export const buyingPower = (amount: number, inflationPct: number, years: number): number => amount / Math.pow(1 + inflationPct / 100, years);

/** Growth after inflation (the Fisher relation), as a percentage: ((1 + r) ÷ (1 + π) − 1) × 100. */
export const realRatePct = (nominalPct: number, inflationPct: number): number => ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;

/**
 * The sum that pays a rising amount at the start of each period until it is used up.
 *   pot = W × (1 − q^m) ÷ (1 − q),  q = (1 + π) ÷ (1 + g)
 *   when q = 1:  pot = W × m
 * W is the first withdrawal, π the rise in each withdrawal per period, g the growth per period, m the number of withdrawals.
 */
export function drawdownPot(first: number, g: number, pi: number, m: number): number {
  if (m <= 0) return 0;
  const q = (1 + pi) / (1 + g);
  if (Math.abs(1 - q) < 1e-12) return first * m;
  return (first * (1 - Math.pow(q, m))) / (1 - q);
}

export type RetirementInput = {
  yearsToRetire: number;
  yearsRetired: number;
  /** monthly spending wanted in retirement, in today's money */
  spendToday: number;
  /** already saved */
  saved: number;
  growthBeforePct: number;
  growthAfterPct: number;
  inflationPct: number;
};

export type RetirementPlan = {
  /** the first month's spending at retirement, after prices have risen: S × (1 + π/12)^n */
  spendAtRetirement: number;
  /** the sum needed on the day of retirement: drawdownPot(spendAtRetirement, g/12, π/12, months retired) */
  pot: number;
  /** what the sum already saved becomes by retirement: L × (1 + i)^n */
  savedGrown: number;
  /** the level monthly saving that closes the gap: paymentForTarget(pot, saved, i, n); zero or less means none is needed */
  monthly: number;
  /** the pot at the end of each year, building up and then being spent */
  path: { year: number; value: number; retired: boolean }[];
};

/**
 * A retirement sum, worked backwards from spending.
 *   1. spending on the first day of retirement = S × (1 + π/12)^n
 *   2. pot needed that day = drawdownPot(that spending, g₂/12, π/12, 12 × years retired)
 *   3. monthly saving until then = paymentForTarget(pot, saved, g₁/12, n)
 * The path then walks the months: saving is added at the end of each month
 * before retirement; after it, each month's spending is taken at the start
 * and what is left grows.
 */
export function retirementPlan(x: RetirementInput): RetirementPlan {
  const n = Math.round(x.yearsToRetire * 12);
  const m = Math.round(x.yearsRetired * 12);
  const i1 = monthlyRate(x.growthBeforePct);
  const i2 = monthlyRate(x.growthAfterPct);
  const pi = monthlyRate(x.inflationPct);
  const spendAtRetirement = compound(x.spendToday, pi, n);
  const pot = drawdownPot(spendAtRetirement, i2, pi, m);
  const monthly = paymentForTarget(pot, x.saved, i1, n);
  const pay = Math.max(0, monthly);
  const path: RetirementPlan["path"] = [];
  let value = x.saved;
  for (let k = 1; k <= n; k++) {
    value = value * (1 + i1) + pay;
    if (k % 12 === 0) path.push({ year: k / 12, value, retired: false });
  }
  let spend = spendAtRetirement;
  for (let k = 1; k <= m; k++) {
    value = (value - spend) * (1 + i2);
    spend *= 1 + pi;
    if (Math.abs(value) < 1e-6) value = 0;
    if (k % 12 === 0) path.push({ year: (n + k) / 12, value, retired: true });
  }
  return { spendAtRetirement, pot, savedGrown: compound(x.saved, i1, n), monthly, path };
}

/**
 * A sum whose growth is taxed every year.
 *   when r > 0:  value = A × (1 + r × (1 − τ))^t
 *   when r ≤ 0:  value = A × (1 + r)^t          (there is no growth to tax, and no refund is assumed)
 */
export function taxedEveryYear(amount: number, growthPct: number, taxPct: number, years: number): number {
  const r = growthPct / 100;
  const net = r > 0 ? r * (1 - taxPct / 100) : r;
  return amount * Math.pow(1 + net, years);
}

/**
 * A sum left to grow untaxed and taxed once, on the whole gain, at the end.
 *   FV = A × (1 + r)^t,  value = FV − τ × max(0, FV − A)
 */
export function taxedAtEnd(amount: number, growthPct: number, taxPct: number, years: number): number {
  const fv = amount * Math.pow(1 + growthPct / 100, years);
  return fv - (taxPct / 100) * Math.max(0, fv - amount);
}

/** The rule of 72: years to double ≈ 72 ÷ r, with r as a percentage. */
export const rule72 = (ratePct: number): number => 72 / ratePct;

/** The exact time to double at yearly compounding: t = ln 2 ÷ ln(1 + r). */
export const doublingYears = (ratePct: number): number => Math.LN2 / Math.log(1 + ratePct / 100);

/** The exact yearly rate that doubles a sum in t years, as a percentage: (2^(1/t) − 1) × 100. */
export const doublingRatePct = (years: number): number => (Math.pow(2, 1 / years) - 1) * 100;
