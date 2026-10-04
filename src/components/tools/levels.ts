/**
 * TRADER TOOLKIT — the arithmetic of three tools: pivot points, Fibonacci
 * levels and overnight financing (swap).
 *
 * Pure and import-free, so it can be run and checked on its own
 * (`node` loads this file directly). Nothing here is a price, a rate or a
 * condition of GIO4X: every number comes from the visitor. The levels are
 * arithmetic on prices that have already printed. They are conventions that
 * chart users watch, not forecasts.
 */

/* ==========================================================================
   Pivot points
   ========================================================================== */

export type PivotVariant = "classic" | "fibonacci" | "woodie" | "camarilla";

export type PivotLevel = {
  /** "R3" … "P" … "S3" */
  key: string;
  /** resistance, the pivot itself, or support */
  side: "r" | "p" | "s";
  price: number;
  /** the formula as written, in symbols */
  formula: string;
};

export type Pivots = {
  variant: PivotVariant;
  /** the pivot */
  p: number;
  /** high − low of the bar */
  range: number;
  /** from the highest resistance down to the lowest support, the pivot between them */
  levels: PivotLevel[];
};

/** The four ways of working the levels that this tool offers, with the formula of the pivot itself. */
export const PIVOT_VARIANTS: { key: PivotVariant; name: string; pivot: string; note: string }[] = [
  { key: "classic", name: "Classic", pivot: "P = (H + L + C) ÷ 3", note: "The floor traders’ version: the pivot is the plain average of the high, the low and the close, and each further level steps away from it by amounts taken from the same bar." },
  { key: "fibonacci", name: "Fibonacci", pivot: "P = (H + L + C) ÷ 3", note: "The same pivot, with the levels set at 38.2%, 61.8% and 100% of the bar’s range above and below it." },
  { key: "woodie", name: "Woodie", pivot: "P = (H + L + 2C) ÷ 4", note: "The close is counted twice in the pivot. This page uses the previous close; some platforms use the new period’s opening price in its place, which gives different levels." },
  { key: "camarilla", name: "Camarilla", pivot: "P = (H + L + C) ÷ 3", note: "The levels are measured from the close, not from the pivot, at fixed fractions of the bar’s range (1.1 ÷ 12, ÷ 6, ÷ 4 and ÷ 2), so they sit closer together. This version has four levels each side." },
];

/** 38.2%, 61.8% and 100% of the range: the steps of the Fibonacci variant */
const FIB_STEPS = [0.382, 0.618, 1] as const;
/** the divisors of the Camarilla variant: level = close ± range × 1.1 ÷ divisor */
const CAMARILLA_DIV = [12, 6, 4, 2] as const;

/**
 * Pivot levels from one finished bar.
 *
 * Classic:    P = (H + L + C) ÷ 3;  R1 = 2P − L;  S1 = 2P − H;  R2 = P + (H − L);  S2 = P − (H − L);
 *             R3 = H + 2(P − L);  S3 = L − 2(H − P)
 * Fibonacci:  P as classic;  Rn = P + k(H − L);  Sn = P − k(H − L);  k = 0.382, 0.618, 1
 * Woodie:     P = (H + L + 2C) ÷ 4;  the levels then as classic
 * Camarilla:  P as classic;  Rn = C + (H − L) × 1.1 ÷ d;  Sn = C − (H − L) × 1.1 ÷ d;  d = 12, 6, 4, 2
 */
export function pivots(high: number, low: number, close: number, variant: PivotVariant = "classic"): Pivots {
  const range = high - low;
  const p = variant === "woodie" ? (high + low + 2 * close) / 4 : (high + low + close) / 3;
  const r: PivotLevel[] = [];
  const s: PivotLevel[] = [];

  if (variant === "fibonacci") {
    FIB_STEPS.forEach((k, i) => {
      r.push({ key: `R${i + 1}`, side: "r", price: p + k * range, formula: `P + ${k === 1 ? "" : `${k} × `}(H − L)` });
      s.push({ key: `S${i + 1}`, side: "s", price: p - k * range, formula: `P − ${k === 1 ? "" : `${k} × `}(H − L)` });
    });
  } else if (variant === "camarilla") {
    CAMARILLA_DIV.forEach((d, i) => {
      r.push({ key: `R${i + 1}`, side: "r", price: close + (range * 1.1) / d, formula: `C + (H − L) × 1.1 ÷ ${d}` });
      s.push({ key: `S${i + 1}`, side: "s", price: close - (range * 1.1) / d, formula: `C − (H − L) × 1.1 ÷ ${d}` });
    });
  } else {
    r.push({ key: "R1", side: "r", price: 2 * p - low, formula: "2P − L" });
    s.push({ key: "S1", side: "s", price: 2 * p - high, formula: "2P − H" });
    r.push({ key: "R2", side: "r", price: p + range, formula: "P + (H − L)" });
    s.push({ key: "S2", side: "s", price: p - range, formula: "P − (H − L)" });
    r.push({ key: "R3", side: "r", price: high + 2 * (p - low), formula: "H + 2(P − L)" });
    s.push({ key: "S3", side: "s", price: low - 2 * (high - p), formula: "L − 2(H − P)" });
  }

  const pivot: PivotLevel = { key: "P", side: "p", price: p, formula: variant === "woodie" ? "(H + L + 2C) ÷ 4" : "(H + L + C) ÷ 3" };
  return { variant, p, range, levels: [...r.reverse(), pivot, ...s] };
}

/* ==========================================================================
   Fibonacci levels
   ========================================================================== */

export type FibRatio = {
  ratio: number;
  /** "61.8%" */
  label: string;
  /** where the number comes from, in one plain sentence */
  origin: string;
  /** false for the one level that is not a Fibonacci ratio at all */
  fibonacci: boolean;
};

/**
 * In the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 …) each
 * number divided by the next settles towards 0.618, and each divided by the
 * one before it towards 1.618. The other ratios are powers and roots of those.
 */
export const RETRACEMENTS: FibRatio[] = [
  { ratio: 0.236, label: "23.6%", origin: "A Fibonacci number divided by the one three places after it (21 ÷ 89): 0.618 cubed.", fibonacci: true },
  { ratio: 0.382, label: "38.2%", origin: "A Fibonacci number divided by the one two places after it (21 ÷ 55): 0.618 squared.", fibonacci: true },
  { ratio: 0.5, label: "50%", origin: "Not a Fibonacci ratio. Half the move, drawn by convention.", fibonacci: false },
  { ratio: 0.618, label: "61.8%", origin: "A Fibonacci number divided by the next (34 ÷ 55): the ratio that neighbouring numbers settle towards.", fibonacci: true },
  { ratio: 0.786, label: "78.6%", origin: "The square root of 0.618.", fibonacci: true },
];

export const EXTENSIONS: FibRatio[] = [
  { ratio: 1.272, label: "127.2%", origin: "The square root of 1.618.", fibonacci: true },
  { ratio: 1.618, label: "161.8%", origin: "A Fibonacci number divided by the one before it (55 ÷ 34): the golden ratio.", fibonacci: true },
  { ratio: 2.618, label: "261.8%", origin: "1.618 squared: a Fibonacci number divided by the one two places before it (55 ÷ 21).", fibonacci: true },
];

export type FibDirection = "up" | "down";
export type FibLevel = FibRatio & { price: number };
export type FibLevels = { direction: FibDirection; range: number; retracements: FibLevel[]; extensions: FibLevel[] };

/** A retracement is measured back from the end of the move: down from the high after a rise, up from the low after a fall. */
export const fibRetracement = (high: number, low: number, ratio: number, direction: FibDirection): number => (direction === "up" ? high - (high - low) * ratio : low + (high - low) * ratio);

/** An extension is measured from the start of the move and lies beyond its end: above the high after a rise, below the low after a fall. */
export const fibExtension = (high: number, low: number, ratio: number, direction: FibDirection): number => (direction === "up" ? low + (high - low) * ratio : high - (high - low) * ratio);

export function fibLevels(high: number, low: number, direction: FibDirection): FibLevels {
  return {
    direction,
    range: high - low,
    retracements: RETRACEMENTS.map((r) => ({ ...r, price: fibRetracement(high, low, r.ratio, direction) })),
    extensions: EXTENSIONS.map((r) => ({ ...r, price: fibExtension(high, low, r.ratio, direction) })),
  };
}

/* ==========================================================================
   Overnight financing (swap)
   ========================================================================== */

export type SwapResult = {
  /** nights + 2 for each triple-swap night: a triple night is charged as three */
  chargedNights: number;
  /** positive is a charge, negative a credit: the Cost Lab's convention */
  total: number;
};

/**
 * The Cost Lab's swap expression, restated. CostLab.tsx line 57 reads
 *
 *   const swapCost = swap.n * lots.n * nights.n;
 *
 * This is the same product, with the nights counted as they are charged: a
 * triple-swap night counts as three, so each one adds two to the count. With
 * no triple night in the period the two expressions are identical.
 */
export function swapCost(perLotPerNight: number, lots: number, nights: number, tripleNights = 0): SwapResult {
  const chargedNights = nights + 2 * tripleNights;
  return { chargedNights, total: perLotPerNight * lots * chargedNights };
}

/* ==========================================================================
   Two small helpers for the components that show the levels
   ========================================================================== */

/** Decimal places in a number as it was typed ("1.1050" → 4), so results are shown to the precision of the inputs. */
export function typedDecimals(raw: string): number {
  const m = /[.,](\d*)$/.exec(raw.trim());
  return m ? Math.min(8, m[1].length) : 0;
}

/** A number that changes whenever the text does: the `rev` a drawing is redrawn on. */
export function revOf(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 1000003;
  return h;
}
