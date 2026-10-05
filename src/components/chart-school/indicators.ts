/**
 * CHART SCHOOL: the arithmetic of the indicators on /chart-school.
 *
 * A pure module: no imports, no clock, no storage, no Math.random(). The same
 * numbers in always give the same numbers out, and each function is checked
 * against cases worked by hand.
 *
 * The rule it keeps: an indicator is arithmetic on prices that have already
 * happened. Nothing in here looks ahead, and a value is null until there are
 * enough bars behind it to calculate it honestly.
 *
 * The conventions, where charting programs differ:
 *   EMA         starts from the simple average of the first n values, then
 *               EMA = value × k + previous EMA × (1 − k), with k = 2 ÷ (n + 1).
 *   Wilder      starts from the simple average of the first n values, then
 *               average = (previous average × (n − 1) + value) ÷ n.
 *   RSI         Wilder's smoothing of the gains and of the losses.
 *   Bollinger   the population standard deviation (divide by n, not n − 1).
 *   ATR         Wilder's smoothing of the true range; the first bar has no
 *               previous close, so its true range is its high minus its low.
 *   Stochastic  raw %K over n bars, %K a simple average of it, %D a simple
 *               average of %K. A window with no range at all reads 50.
 *   Donchian    the highest high and the lowest low of the last n bars, the
 *               latest bar included.
 *   Keltner     an EMA of the close, with Wilder's ATR above and below it.
 *   Williams %R the stochastic's raw figure, measured down from the top: 0 to
 *               −100. A window with no range at all reads −50.
 *   CCI         on the typical price, (high + low + close) ÷ 3, with the mean
 *               absolute deviation and Lambert's constant, 0.015. A window
 *               with no deviation at all reads 0.
 *   ADX         Wilder's smoothing throughout, begun at the second bar (the
 *               first has no bar before it to move from).
 *   Parabolic   begins at the second bar, rising if that bar closed at or
 *   SAR         above the first; on a reversal the SAR goes to the extreme of
 *               the trend just ended, the reversing bar included.
 */

export type Bar = { o: number; h: number; l: number; c: number };

/** one value for each bar; null where there are not yet enough bars */
export type Series = (number | null)[];

const whole = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1);

/** index of the first value that is not null, or the length when there is none */
const firstValue = (values: readonly (number | null)[]) => {
  let i = 0;
  while (i < values.length && values[i] == null) i++;
  return i;
};

/** Run `fn` on the part of a series after its leading nulls, and put the nulls back in front. */
function after(values: readonly (number | null)[], fn: (v: number[]) => Series): Series {
  const s = firstValue(values);
  const rest = values.slice(s).map((v) => v ?? 0);
  return [...new Array<null>(s).fill(null), ...fn(rest)];
}

/* ==========================================================================
   Averages
   ========================================================================== */

/** Simple moving average: the sum of the last n values ÷ n. */
export function sma(values: readonly (number | null)[], n: number): Series {
  const len = whole(n);
  return after(values, (v) => {
    const out: Series = [];
    for (let i = 0; i < v.length; i++) {
      if (i < len - 1) {
        out.push(null);
        continue;
      }
      // summed afresh for each bar: slower than a running total, and free of its rounding drift
      let sum = 0;
      for (let k = i - len + 1; k <= i; k++) sum += v[k]!;
      out.push(sum / len);
    }
    return out;
  });
}

/** Exponential moving average: value × k + previous EMA × (1 − k), k = 2 ÷ (n + 1), begun from the simple average of the first n. */
export function ema(values: readonly (number | null)[], n: number): Series {
  const len = whole(n);
  const k = 2 / (len + 1);
  return after(values, (v) => {
    const out: Series = [];
    let sum = 0;
    let prev = 0;
    for (let i = 0; i < v.length; i++) {
      if (i < len) sum += v[i]!;
      if (i < len - 1) out.push(null);
      else if (i === len - 1) {
        prev = sum / len;
        out.push(prev);
      } else {
        prev = v[i]! * k + prev * (1 - k);
        out.push(prev);
      }
    }
    return out;
  });
}

/** Wilder's smoothing: (previous average × (n − 1) + value) ÷ n, begun from the simple average of the first n. */
export function wilder(values: readonly (number | null)[], n: number): Series {
  const len = whole(n);
  return after(values, (v) => {
    const out: Series = [];
    let sum = 0;
    let prev = 0;
    for (let i = 0; i < v.length; i++) {
      if (i < len) sum += v[i]!;
      if (i < len - 1) out.push(null);
      else if (i === len - 1) {
        prev = sum / len;
        out.push(prev);
      } else {
        prev = (prev * (len - 1) + v[i]!) / len;
        out.push(prev);
      }
    }
    return out;
  });
}

/* ==========================================================================
   RSI
   ========================================================================== */

/**
 * Relative strength index, with the two averages it is made from.
 * RSI = 100 − 100 ÷ (1 + average gain ÷ average loss); 100 when nothing was lost.
 * The first value is at bar n (counting from 0): it needs n changes.
 */
export function rsiParts(closes: readonly number[], n: number): { gain: Series; loss: Series; rsi: Series } {
  const gains: (number | null)[] = [null];
  const losses: (number | null)[] = [null];
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    gains.push(d > 0 ? d : 0);
    losses.push(d < 0 ? -d : 0);
  }
  const gain = wilder(gains, n);
  const loss = wilder(losses, n);
  const rsi: Series = gain.map((g, i) => {
    const l = loss[i];
    if (g == null || l == null) return null;
    if (l === 0) return g === 0 ? 50 : 100;
    return 100 - 100 / (1 + g / l);
  });
  return { gain, loss, rsi };
}

export const rsi = (closes: readonly number[], n: number): Series => rsiParts(closes, n).rsi;

/* ==========================================================================
   MACD
   ========================================================================== */

/** MACD line = fast EMA − slow EMA; signal = EMA of that line; histogram = line − signal. */
export function macd(closes: readonly number[], fast: number, slow: number, signal: number): { fast: Series; slow: Series; line: Series; signal: Series; hist: Series } {
  const f = ema(closes, fast);
  const s = ema(closes, slow);
  const line: Series = f.map((a, i) => {
    const b = s[i];
    return a == null || b == null ? null : a - b;
  });
  const sig = ema(line, signal);
  const hist: Series = line.map((a, i) => {
    const b = sig[i];
    return a == null || b == null ? null : a - b;
  });
  return { fast: f, slow: s, line, signal: sig, hist };
}

/* ==========================================================================
   Bollinger bands
   ========================================================================== */

/** Population standard deviation of the last n values: the root of the mean squared distance from their own average. */
export function stdev(values: readonly number[], n: number): Series {
  const len = whole(n);
  const out: Series = [];
  for (let i = 0; i < values.length; i++) {
    if (i < len - 1) {
      out.push(null);
      continue;
    }
    let sum = 0;
    for (let k = i - len + 1; k <= i; k++) sum += values[k]!;
    const mean = sum / len;
    let sq = 0;
    for (let k = i - len + 1; k <= i; k++) sq += (values[k]! - mean) ** 2;
    out.push(Math.sqrt(sq / len));
  }
  return out;
}

/** Middle = n-bar simple average; upper and lower = middle ± k standard deviations. */
export function bollinger(closes: readonly number[], n: number, k: number): { mid: Series; sd: Series; upper: Series; lower: Series } {
  const mid = sma(closes, n);
  const sd = stdev(closes, n);
  const upper: Series = mid.map((m, i) => (m == null || sd[i] == null ? null : m + k * sd[i]!));
  const lower: Series = mid.map((m, i) => (m == null || sd[i] == null ? null : m - k * sd[i]!));
  return { mid, sd, upper, lower };
}

/* ==========================================================================
   Average true range
   ========================================================================== */

/** True range: the greatest of high − low, |high − previous close| and |low − previous close|. */
export function trueRange(bars: readonly Bar[]): number[] {
  return bars.map((b, i) => {
    if (i === 0) return b.h - b.l;
    const prev = bars[i - 1]!.c;
    return Math.max(b.h - b.l, Math.abs(b.h - prev), Math.abs(b.l - prev));
  });
}

/** Average true range: Wilder's smoothing of the true range. */
export const atr = (bars: readonly Bar[], n: number): Series => wilder(trueRange(bars), n);

/* ==========================================================================
   Stochastic oscillator
   ========================================================================== */

/**
 * raw = 100 × (close − lowest low) ÷ (highest high − lowest low) over n bars;
 * %K = simple average of raw over `smooth` bars (1 leaves it as it is);
 * %D = simple average of %K over `d` bars.
 */
export function stochastic(bars: readonly Bar[], n: number, smooth: number, d: number): { high: Series; low: Series; raw: Series; k: Series; d: Series } {
  const len = whole(n);
  const high: Series = [];
  const low: Series = [];
  const raw: Series = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < len - 1) {
      high.push(null);
      low.push(null);
      raw.push(null);
      continue;
    }
    let hh = -Infinity;
    let ll = Infinity;
    for (let k = i - len + 1; k <= i; k++) {
      if (bars[k]!.h > hh) hh = bars[k]!.h;
      if (bars[k]!.l < ll) ll = bars[k]!.l;
    }
    high.push(hh);
    low.push(ll);
    raw.push(hh === ll ? 50 : (100 * (bars[i]!.c - ll)) / (hh - ll));
  }
  const k = sma(raw, smooth);
  return { high, low, raw, k, d: sma(k, d) };
}

/* ==========================================================================
   Channels: Donchian and Keltner
   ========================================================================== */

/** Donchian channel: upper = the highest high of the last n bars, lower = the lowest low, middle = halfway between. */
export function donchian(bars: readonly Bar[], n: number): { upper: Series; lower: Series; mid: Series } {
  const len = whole(n);
  const upper: Series = [];
  const lower: Series = [];
  const mid: Series = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < len - 1) {
      upper.push(null);
      lower.push(null);
      mid.push(null);
      continue;
    }
    let hh = -Infinity;
    let ll = Infinity;
    for (let k = i - len + 1; k <= i; k++) {
      if (bars[k]!.h > hh) hh = bars[k]!.h;
      if (bars[k]!.l < ll) ll = bars[k]!.l;
    }
    upper.push(hh);
    lower.push(ll);
    mid.push((hh + ll) / 2);
  }
  return { upper, lower, mid };
}

/** Keltner channel: middle = n-bar EMA of the close; upper and lower = middle ± k × the ATR of `atrN` bars. */
export function keltner(bars: readonly Bar[], n: number, atrN: number, k: number): { mid: Series; atr: Series; upper: Series; lower: Series } {
  const closes = bars.map((b) => b.c);
  const mid = ema(closes, n);
  const a = atr(bars, atrN);
  const upper: Series = mid.map((m, i) => (m == null || a[i] == null ? null : m + k * a[i]!));
  const lower: Series = mid.map((m, i) => (m == null || a[i] == null ? null : m - k * a[i]!));
  return { mid, atr: a, upper, lower };
}

/* ==========================================================================
   Williams %R
   ========================================================================== */

/** %R = −100 × (highest high − close) ÷ (highest high − lowest low) over n bars: 0 at the top of the range, −100 at the bottom. */
export function williamsR(bars: readonly Bar[], n: number): { high: Series; low: Series; r: Series } {
  const d = donchian(bars, n);
  const r: Series = d.upper.map((hh, i) => {
    const ll = d.lower[i];
    if (hh == null || ll == null) return null;
    // the ratio first: a close on the lowest low then reads −100 exactly
    return hh === ll ? -50 : -100 * ((hh - bars[i]!.c) / (hh - ll));
  });
  return { high: d.upper, low: d.lower, r };
}

/* ==========================================================================
   Commodity channel index
   ========================================================================== */

/**
 * Typical price = (high + low + close) ÷ 3; mean = its n-bar simple average;
 * deviation = the average distance of those n typical prices from that mean;
 * CCI = (typical price − mean) ÷ (0.015 × deviation).
 */
export function cci(bars: readonly Bar[], n: number): { tp: number[]; mean: Series; dev: Series; cci: Series } {
  const len = whole(n);
  const tp = bars.map((b) => (b.h + b.l + b.c) / 3);
  const mean = sma(tp, len);
  const dev: Series = mean.map((m, i) => {
    if (m == null) return null;
    let sum = 0;
    for (let k = i - len + 1; k <= i; k++) sum += Math.abs(tp[k]! - m);
    return sum / len;
  });
  const out: Series = mean.map((m, i) => {
    const d = dev[i];
    if (m == null || d == null) return null;
    return d === 0 ? 0 : (tp[i]! - m) / (0.015 * d);
  });
  return { tp, mean, dev, cci: out };
}

/* ==========================================================================
   Directional movement and ADX
   ========================================================================== */

/**
 * +DM = this high − the previous high, when that is positive and larger than
 * the previous low − this low; −DM is the mirror; otherwise each is 0.
 * +DI = 100 × smoothed +DM ÷ smoothed true range, and the same for −DI.
 * DX = 100 × |+DI − −DI| ÷ (+DI + −DI); ADX = Wilder's smoothing of DX.
 * The first DI is at bar n (counting from 0) and the first ADX at bar 2n − 1.
 */
export function adx(bars: readonly Bar[], n: number): { plusDM: Series; minusDM: Series; tr: Series; plusDI: Series; minusDI: Series; dx: Series; adx: Series } {
  const ranges = trueRange(bars);
  const up: (number | null)[] = [];
  const down: (number | null)[] = [];
  const tr: (number | null)[] = [];
  for (let i = 0; i < bars.length; i++) {
    // the first bar has no bar before it to move from
    if (i === 0) {
      up.push(null);
      down.push(null);
      tr.push(null);
      continue;
    }
    const u = bars[i]!.h - bars[i - 1]!.h;
    const d = bars[i - 1]!.l - bars[i]!.l;
    up.push(u > d && u > 0 ? u : 0);
    down.push(d > u && d > 0 ? d : 0);
    tr.push(ranges[i]!);
  }
  const plusDM = wilder(up, n);
  const minusDM = wilder(down, n);
  const range = wilder(tr, n);
  const di = (dm: Series): Series =>
    dm.map((v, i) => {
      const r = range[i];
      if (v == null || r == null) return null;
      return r === 0 ? 0 : (100 * v) / r;
    });
  const plusDI = di(plusDM);
  const minusDI = di(minusDM);
  const dx: Series = plusDI.map((p, i) => {
    const m = minusDI[i];
    if (p == null || m == null) return null;
    return p + m === 0 ? 0 : (100 * Math.abs(p - m)) / (p + m);
  });
  return { plusDM, minusDM, tr: range, plusDI, minusDI, dx, adx: wilder(dx, n) };
}

/* ==========================================================================
   Parabolic SAR
   ========================================================================== */

/**
 * Parabolic stop and reverse. While rising: SAR = previous SAR + AF ×
 * (EP − previous SAR), never above the lows of the two bars before; EP is the
 * highest high of the trend, and AF grows by `step` at each new EP, up to
 * `max`. A bar whose low is below the SAR reverses it: the SAR goes to the
 * extreme of the trend just ended, EP to that bar's low and AF back to `step`.
 * Falling is the mirror. `ep` and `af` are as they stand after each bar, which
 * is what the next bar's SAR is worked out from.
 */
export function parabolicSar(bars: readonly Bar[], step: number, max: number): { sar: Series; rising: (boolean | null)[]; ep: Series; af: Series } {
  const n = bars.length;
  const sar: Series = new Array<null>(n).fill(null);
  const rising: (boolean | null)[] = new Array<null>(n).fill(null);
  const ep: Series = new Array<null>(n).fill(null);
  const af: Series = new Array<null>(n).fill(null);
  if (n < 2) return { sar, rising, ep, af };
  let up = bars[1]!.c >= bars[0]!.c;
  let s = up ? Math.min(bars[0]!.l, bars[1]!.l) : Math.max(bars[0]!.h, bars[1]!.h);
  let e = up ? Math.max(bars[0]!.h, bars[1]!.h) : Math.min(bars[0]!.l, bars[1]!.l);
  let a = step;
  for (let i = 1; i < n; i++) {
    if (i > 1) {
      const b = bars[i]!;
      let next = s + a * (e - s);
      if (up) {
        next = Math.min(next, bars[i - 1]!.l, bars[i - 2]!.l);
        if (b.l < next) {
          up = false;
          next = Math.max(e, b.h);
          e = b.l;
          a = step;
        } else if (b.h > e) {
          e = b.h;
          a = Math.min(a + step, max);
        }
      } else {
        next = Math.max(next, bars[i - 1]!.h, bars[i - 2]!.h);
        if (b.h > next) {
          up = true;
          next = Math.min(e, b.l);
          e = b.h;
          a = step;
        } else if (b.l < e) {
          e = b.l;
          a = Math.min(a + step, max);
        }
      }
      s = next;
    }
    sar[i] = s;
    rising[i] = up;
    ep[i] = e;
    af[i] = a;
  }
  return { sar, rising, ep, af };
}

/* ==========================================================================
   Swings, levels and lines
   ========================================================================== */

/**
 * Swing points. A swing high is a bar whose high is the highest of the `span`
 * bars on each side of it; a swing low is the mirror. A bar needs `span` bars
 * after it before it can be called a swing, so the newest ones are always late.
 * Where two bars in a window share the extreme, the earlier one is the swing.
 */
export function swings(bars: readonly Bar[], span: number): { highs: number[]; lows: number[] } {
  const s = whole(span);
  const highs: number[] = [];
  const lows: number[] = [];
  for (let i = s; i < bars.length - s; i++) {
    const b = bars[i]!;
    let high = true;
    let low = true;
    for (let k = i - s; k <= i + s && (high || low); k++) {
      if (k === i) continue;
      const o = bars[k]!;
      if (k < i ? o.h >= b.h : o.h > b.h) high = false;
      if (k < i ? o.l <= b.l : o.l < b.l) low = false;
    }
    if (high) highs.push(i);
    if (low) lows.push(i);
  }
  return { highs, lows };
}

export type Level = { price: number; touches: number; low: number; high: number };

/**
 * Group prices that lie close together. Sorted from the lowest, a price joins
 * the group below it while it is within `width` of that group's lowest member;
 * otherwise it starts a new group. A group with at least `minTouches` members
 * is a level, placed at the average of its prices.
 */
export function levels(prices: readonly number[], width: number, minTouches: number): Level[] {
  const sorted = [...prices].sort((a, b) => a - b);
  const out: Level[] = [];
  let group: number[] = [];
  const close = () => {
    if (group.length >= Math.max(1, minTouches)) out.push({ price: group.reduce((a, b) => a + b, 0) / group.length, touches: group.length, low: group[0]!, high: group[group.length - 1]! });
    group = [];
  };
  for (const p of sorted) {
    if (group.length && p - group[0]! > width) close();
    group.push(p);
  }
  close();
  return out;
}

/** The straight line through two points: slope = (y2 − y1) ÷ (x2 − x1); value at x = y1 + slope × (x − x1). */
export function lineThrough(x1: number, y1: number, x2: number, y2: number): { slope: number; at: (x: number) => number } {
  const slope = x2 === x1 ? 0 : (y2 - y1) / (x2 - x1);
  return { slope, at: (x: number) => y1 + slope * (x - x1) };
}
