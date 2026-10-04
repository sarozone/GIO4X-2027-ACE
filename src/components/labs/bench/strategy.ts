/**
 * RULE BENCH: the engine of the rule tester on /labs/rule-bench.
 *
 * A pure module: no imports, no clock, no storage, no Math.random(). The same
 * market, market number and rule always give the same result, and the
 * arithmetic is proved in node (scripts/test-bench.mjs).
 *
 * Nothing in here is a real price, a real instrument or a GIO4X trading
 * condition. There is one invented example for each kind of instrument the
 * site describes, so that a rule can be seen on a quiet market and a wild one;
 * their names, sizes, spreads and movements are made up and listed in MARKETS.
 *
 * What a rule is: one way of saying "go long" or "go short" at the close of a
 * bar (ENTRIES), a stop a number of average ranges away, an optional target a
 * multiple of the stop away, and a share of the balance to put at risk.
 *
 * How a test decides, in order, on every bar:
 *   1. a position opened earlier is checked against the bar: a bar that opens
 *      beyond the stop or the target fills at the open (a gap); otherwise the
 *      stop is checked before the target, so a bar that touches both counts as
 *      a loss;
 *   2. the rule is read at the close;
 *   3. an opposite signal closes the position at the next bar's open, and a
 *      signal with no position opens one there, a spread worse than the open.
 * Margin is not modelled, and every order is filled in full: see the page.
 */

/* ==========================================================================
   The invented markets
   ========================================================================== */

export type MarketKey = "pair" | "metal" | "index" | "energy" | "share" | "coin";

export type Market = {
  key: MarketKey;
  /** never a real symbol */
  name: string;
  /** the kind of instrument it stands for on the site */
  kind: string;
  /** every market of this kind opens here */
  start: number;
  /** the smallest price step */
  point: number;
  /** decimals a price is written with */
  digits: number;
  /** units in one lot */
  contract: number;
  /** fixed, in points, at all times: a real spread widens and narrows */
  spreadPts: number;
  /** size of a calm and of a fast step, in points (a bar is STEPS of them) */
  calmSd: number;
  fastSd: number;
  /** chance per step of a fast stretch beginning, and of a gap */
  fastChance: number;
  gapChance: number;
  /** a gap, in points: at least gapMin, at most gapMin + gapSpan */
  gapMin: number;
  gapSpan: number;
};

export const MARKETS: readonly Market[] = [
  { key: "pair", name: "Example pair", kind: "Currency pair", start: 1.2, point: 0.00001, digits: 5, contract: 100000, spreadPts: 15, calmSd: 14, fastSd: 44, fastChance: 0.004, gapChance: 0.0008, gapMin: 120, gapSpan: 280 },
  { key: "metal", name: "Example metal", kind: "Metal", start: 2000, point: 0.01, digits: 2, contract: 100, spreadPts: 30, calmSd: 36, fastSd: 110, fastChance: 0.005, gapChance: 0.001, gapMin: 300, gapSpan: 700 },
  { key: "index", name: "Example index", kind: "Index", start: 5000, point: 0.1, digits: 1, contract: 1, spreadPts: 10, calmSd: 9, fastSd: 30, fastChance: 0.005, gapChance: 0.0025, gapMin: 120, gapSpan: 380 },
  { key: "energy", name: "Example energy", kind: "Energy", start: 80, point: 0.01, digits: 2, contract: 1000, spreadPts: 4, calmSd: 4, fastSd: 14, fastChance: 0.007, gapChance: 0.002, gapMin: 40, gapSpan: 140 },
  { key: "share", name: "Example share", kind: "Share", start: 150, point: 0.01, digits: 2, contract: 100, spreadPts: 6, calmSd: 5, fastSd: 16, fastChance: 0.004, gapChance: 0.004, gapMin: 60, gapSpan: 340 },
  { key: "coin", name: "Example coin", kind: "Crypto", start: 30000, point: 1, digits: 0, contract: 1, spreadPts: 30, calmSd: 26, fastSd: 90, fastChance: 0.01, gapChance: 0.001, gapMin: 300, gapSpan: 900 },
] as const;

export const marketOf = (key: MarketKey): Market => MARKETS.find((m) => m.key === key) ?? MARKETS[0]!;

export const BENCH = {
  /** the invented unit the example account is counted in: not a currency */
  unit: "SIM",
  balance: 10000,
  /** bars in one test, and steps of the walk inside one bar */
  bars: 480,
  steps: 12,
  /** bars the average range is taken over */
  atr: 14,
  lotStep: 0.01,
  maxLots: 100,
  /** the first market every visitor sees */
  defaultSeed: 2027,
  /** how many other market numbers a rule is tried on */
  others: 40,
} as const;

/** value, in the account's unit, of one point of movement on one lot */
export const pointValue = (m: Market): number => m.point * m.contract;

/* ==========================================================================
   The invented price: a seeded walk with faster stretches and a rare gap
   ========================================================================== */

/** mulberry32: one 32-bit state in, a number in [0, 1) and the next state out */
function rand(a: number): [number, number] {
  const s = (a + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** o, h, l, c in price; gap: the bar opened away from the last close */
export type Bar = { o: number; h: number; l: number; c: number; gap: boolean };

/** The bars of one market number. Prices are whole points inside, so the walk never drifts by rounding. */
export function makeBars(m: Market, seed: number, count: number = BENCH.bars): Bar[] {
  // each kind of market walks its own path for the same market number
  let rng = (seed * 2654435761 + MARKETS.indexOf(m) * 97) >>> 0;
  const u = () => {
    const [v, s] = rand(rng);
    rng = s;
    return v;
  };
  const floor = Math.round((m.start / m.point) * 0.2);
  let pts = Math.round(m.start / m.point);
  let fastLeft = 0;
  const out: Bar[] = [];
  for (let b = 0; b < count; b++) {
    let o = pts;
    let h = pts;
    let l = pts;
    let gap = false;
    for (let s = 0; s < BENCH.steps; s++) {
      if (fastLeft > 0) fastLeft -= 1;
      else if (u() < m.fastChance) fastLeft = 30 + Math.floor(u() * 90);
      let move: number;
      // a gap is a jump between two bars: nothing traded in between
      if (s === 0 && b > 0 && u() < m.gapChance * BENCH.steps) {
        const size = m.gapMin + Math.floor(u() * m.gapSpan);
        move = u() < 0.5 ? -size : size;
        gap = true;
      } else {
        // the sum of four uniforms is close enough to a bell curve for a practice market (sd 0.5774 before scaling)
        const n = u() + u() + u() + u() - 2;
        move = Math.round((n / 0.5774) * (fastLeft > 0 ? m.fastSd : m.calmSd));
      }
      pts += move;
      // an invented price has no reason to reach zero: it is turned back at a floor far below where it starts
      if (pts < floor) pts = floor + (floor - pts);
      if (s === 0) {
        o = pts;
        h = pts;
        l = pts;
      } else {
        if (pts > h) h = pts;
        if (pts < l) l = pts;
      }
    }
    out.push({ o: o * m.point, h: h * m.point, l: l * m.point, c: pts * m.point, gap });
  }
  return out;
}

/* ==========================================================================
   What a rule can look at
   ========================================================================== */

/** Simple moving average of the closes; null until there are `n` of them. */
export function sma(closes: readonly number[], n: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i]!;
    if (i >= n) sum -= closes[i - n]!;
    out.push(i >= n - 1 ? sum / n : null);
  }
  return out;
}

/** Relative strength index, Wilder's smoothing; null until there are `n` changes. */
export function rsi(closes: readonly number[], n: number): (number | null)[] {
  const out: (number | null)[] = [null];
  let up = 0;
  let down = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    const g = d > 0 ? d : 0;
    const s = d < 0 ? -d : 0;
    if (i <= n) {
      up += g / n;
      down += s / n;
    } else {
      up = (up * (n - 1) + g) / n;
      down = (down * (n - 1) + s) / n;
    }
    out.push(i < n ? null : down === 0 ? 100 : 100 - 100 / (1 + up / down));
  }
  return out;
}

/** Average true range over `n` bars (a plain average); null until there are `n` true ranges. */
export function atr(bars: readonly Bar[], n: number): (number | null)[] {
  const out: (number | null)[] = [];
  const tr: number[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    const prev = i > 0 ? bars[i - 1]!.c : b.o;
    const r = Math.max(b.h - b.l, Math.abs(b.h - prev), Math.abs(b.l - prev));
    tr.push(r);
    sum += r;
    if (i >= n) sum -= tr[i - n]!;
    out.push(i >= n - 1 ? sum / n : null);
  }
  return out;
}

/* ==========================================================================
   The rule
   ========================================================================== */

export type EntryKey = "cross" | "breakout" | "rsi";
export type Direction = "both" | "long" | "short";

export type Rule = {
  entry: EntryKey;
  /** cross: the fast and slow averages. breakout: `slow` is the look-back. rsi: `fast` is its length. */
  fast: number;
  slow: number;
  direction: Direction;
  /** do the opposite of what the rule says */
  fade: boolean;
  /** stop distance in average ranges */
  stopAtr: number;
  /** target distance as a multiple of the stop; 0 for no target */
  targetR: number;
  /** share of the balance put at risk on a trade, in percent */
  riskPct: number;
};

export const ENTRIES: readonly { key: EntryKey; name: string; says: string }[] = [
  { key: "cross", name: "Two averages cross", says: "Long when the fast average closes above the slow one; short when it closes below." },
  { key: "breakout", name: "A new high or low", says: "Long when a bar closes above the highest high of the bars before it; short when it closes below their lowest low." },
  { key: "rsi", name: "RSI turns back", says: "Long when the RSI closes back above 30; short when it closes back below 70." },
] as const;

export const DEFAULT_RULE: Rule = { entry: "cross", fast: 10, slow: 30, direction: "both", fade: false, stopAtr: 2, targetR: 0, riskPct: 1 };

export const LIMITS = {
  fast: { min: 3, max: 30 },
  slow: { min: 10, max: 100 },
  stopAtr: { min: 0.5, max: 5, step: 0.5 },
  targetR: { min: 0, max: 4, step: 0.5 },
  riskPct: { min: 0.25, max: 5, step: 0.25 },
} as const;

const clampTo = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

/** A rule with every part inside its limits, and the fast average shorter than the slow one. */
export function tidy(r: Rule): Rule {
  const slow = Math.round(clampTo(r.slow, LIMITS.slow.min, LIMITS.slow.max));
  let fast = Math.round(clampTo(r.fast, LIMITS.fast.min, LIMITS.fast.max));
  if (r.entry === "cross" && fast >= slow) fast = Math.max(LIMITS.fast.min, slow - 1);
  return {
    entry: ENTRIES.some((e) => e.key === r.entry) ? r.entry : "cross",
    fast,
    slow,
    direction: r.direction === "long" || r.direction === "short" ? r.direction : "both",
    fade: r.fade === true,
    stopAtr: clampTo(r.stopAtr, LIMITS.stopAtr.min, LIMITS.stopAtr.max),
    targetR: clampTo(r.targetR, LIMITS.targetR.min, LIMITS.targetR.max),
    riskPct: clampTo(r.riskPct, LIMITS.riskPct.min, LIMITS.riskPct.max),
  };
}

/** The rule in one plain sentence, for the page and for anyone who cannot see the chart. */
export function inWords(rule: Rule): string {
  const r = tidy(rule);
  const what =
    r.entry === "cross"
      ? `the ${r.fast}-bar average closes above the ${r.slow}-bar average (short when it closes below)`
      : r.entry === "breakout"
        ? `a bar closes above the highest high of the ${r.slow} bars before it (short below their lowest low)`
        : `the ${r.fast}-bar RSI closes back above 30 (short when it closes back below 70)`;
  const side = r.direction === "both" ? "" : r.direction === "long" ? " Long trades only." : " Short trades only.";
  const fade = r.fade ? " Then do the opposite of what it says." : "";
  const target = r.targetR > 0 ? `, with a target ${r.targetR} times as far away` : ", with no target";
  return `Go long when ${what}.${side}${fade} The stop is ${r.stopAtr} average ranges from the entry${target}. Each trade risks ${r.riskPct}% of the balance. An opposite signal closes the trade.`;
}

/** +1 for long, −1 for short, 0 for nothing, at the close of each bar. */
export function signals(bars: readonly Bar[], rule: Rule): number[] {
  const r = tidy(rule);
  const closes = bars.map((b) => b.c);
  const out = new Array<number>(bars.length).fill(0);
  if (r.entry === "cross") {
    const f = sma(closes, r.fast);
    const s = sma(closes, r.slow);
    for (let i = 1; i < bars.length; i++) {
      const a0 = f[i - 1];
      const b0 = s[i - 1];
      const a1 = f[i];
      const b1 = s[i];
      if (a0 == null || b0 == null || a1 == null || b1 == null) continue;
      if (a0 <= b0 && a1 > b1) out[i] = 1;
      else if (a0 >= b0 && a1 < b1) out[i] = -1;
    }
  } else if (r.entry === "breakout") {
    for (let i = r.slow; i < bars.length; i++) {
      let hi = -Infinity;
      let lo = Infinity;
      for (let k = i - r.slow; k < i; k++) {
        if (bars[k]!.h > hi) hi = bars[k]!.h;
        if (bars[k]!.l < lo) lo = bars[k]!.l;
      }
      if (bars[i]!.c > hi) out[i] = 1;
      else if (bars[i]!.c < lo) out[i] = -1;
    }
  } else {
    const x = rsi(closes, r.fast);
    for (let i = 1; i < bars.length; i++) {
      const a = x[i - 1];
      const b = x[i];
      if (a == null || b == null) continue;
      if (a <= 30 && b > 30) out[i] = 1;
      else if (a >= 70 && b < 70) out[i] = -1;
    }
  }
  if (r.fade) for (let i = 0; i < out.length; i++) out[i] = -out[i]! || 0;
  if (r.direction !== "both") for (let i = 0; i < out.length; i++) if ((r.direction === "long" && out[i] === -1) || (r.direction === "short" && out[i] === 1)) out[i] = 0;
  return out;
}

/* ==========================================================================
   The test
   ========================================================================== */

export type Reason = "stop" | "target" | "signal" | "end";

export type Trade = {
  side: 1 | -1;
  /** the bars it opened and closed on */
  inBar: number;
  outBar: number;
  entry: number;
  exit: number;
  stop: number;
  target: number | null;
  lots: number;
  /** in the account's unit, after the spread */
  pl: number;
  /** what the spread cost on this trade */
  spread: number;
  reason: Reason;
  /** the exit was at a bar's open, beyond the level asked for */
  gapped: boolean;
};

export type Stats = {
  trades: number;
  wins: number;
  losses: number;
  /** share of trades that gained, 0 to 1; null with no trades */
  winRate: number | null;
  net: number;
  grossWin: number;
  grossLoss: number;
  /** gross gain ÷ gross loss; null when nothing was lost */
  profitFactor: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  /** the deepest fall of equity from a peak, 0 to 1 */
  maxDrawdown: number;
  worstRun: number;
  spread: number;
  /** signals that could not be traded: the size came out below the smallest lot */
  skipped: number;
  endBalance: number;
};

export type Test = { trades: Trade[]; equity: number[]; stats: Stats };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** lots = (balance × risk %) ÷ (stop distance × value of one lot per unit of price), rounded down to the lot step */
export function lotsFor(m: Market, balance: number, riskPct: number, stopDistance: number): number {
  if (!(stopDistance > 0) || !(balance > 0)) return 0;
  const raw = ((balance * riskPct) / 100) / (stopDistance * m.contract);
  const stepped = Math.floor(raw / BENCH.lotStep + 1e-9) * BENCH.lotStep;
  return Math.min(BENCH.maxLots, r2(stepped));
}

/** P/L = (exit − entry) × contract size × lots, sign reversed for a short */
export function profitLoss(m: Market, side: 1 | -1, entry: number, exit: number, lots: number): number {
  return (exit - entry) * m.contract * lots * side;
}

export function runTest(m: Market, bars: readonly Bar[], rule: Rule): Test {
  const r = tidy(rule);
  const sig = signals(bars, r);
  const range = atr(bars, BENCH.atr);
  const spread = m.spreadPts * m.point;
  const trades: Trade[] = [];
  const equity: number[] = [];
  let balance: number = BENCH.balance;
  let skipped = 0;
  let open: { side: 1 | -1; inBar: number; entry: number; stop: number; target: number | null; lots: number } | null = null;
  /** what the close of the last bar asked for at this bar's open */
  let pending: { close: boolean; enter: 0 | 1 | -1; range: number } = { close: false, enter: 0, range: 0 };

  const close = (i: number, exit: number, reason: Reason, gapped: boolean) => {
    if (!open) return;
    // the spread was paid on the way in: the entry price already carries it
    const pl = r2(profitLoss(m, open.side, open.entry, exit, open.lots));
    balance = r2(balance + pl);
    trades.push({ side: open.side, inBar: open.inBar, outBar: i, entry: open.entry, exit, stop: open.stop, target: open.target, lots: open.lots, pl, spread: r2(spread * m.contract * open.lots), reason, gapped });
    open = null;
  };

  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;

    // 3 (from the bar before): act at this bar's open
    if (pending.close && open) close(i, b.o, "signal", false);
    if (pending.enter !== 0 && !open) {
      const side = pending.enter;
      const distance = pending.range * r.stopAtr;
      const lots = lotsFor(m, balance, r.riskPct, distance);
      if (lots >= BENCH.lotStep) {
        // a buy opens a spread above the open and a sell a spread below it: the cost is paid at once
        const entry = b.o + side * spread;
        open = { side, inBar: i, entry, stop: entry - side * distance, target: r.targetR > 0 ? entry + side * distance * r.targetR : null, lots };
      } else skipped += 1;
    }
    pending = { close: false, enter: 0, range: 0 };

    // 1: the stop and the target, against this bar
    if (open) {
      const o: { side: 1 | -1; inBar: number; stop: number; target: number | null } = open;
      const fresh = o.inBar === i;
      const beyondStop = o.side === 1 ? b.o <= o.stop : b.o >= o.stop;
      const beyondTarget = o.target !== null && (o.side === 1 ? b.o >= o.target : b.o <= o.target);
      if (!fresh && beyondStop) close(i, b.o, "stop", true);
      else if (!fresh && beyondTarget) close(i, b.o, "target", true);
      else if (o.side === 1 ? b.l <= o.stop : b.h >= o.stop) close(i, o.stop, "stop", false);
      else if (o.target !== null && (o.side === 1 ? b.h >= o.target : b.l <= o.target)) close(i, o.target, "target", false);
    }

    // 2: the rule, at the close
    const s = sig[i]!;
    const a = range[i];
    if (s !== 0 && a != null && a > 0 && i < bars.length - 1) {
      const held: { side: 1 | -1 } | null = open;
      if (held && held.side !== s) pending = { close: true, enter: s as 1 | -1, range: a };
      else if (!held) pending = { close: false, enter: s as 1 | -1, range: a };
    }

    if (i === bars.length - 1 && open) close(i, b.c, "end", false);
    const live: { side: 1 | -1; entry: number; lots: number } | null = open;
    equity.push(live ? r2(balance + profitLoss(m, live.side, live.entry, b.c, live.lots)) : balance);
  }

  let wins = 0;
  let losses = 0;
  let grossWin = 0;
  let grossLoss = 0;
  let run = 0;
  let worstRun = 0;
  let cost = 0;
  for (const t of trades) {
    cost += t.spread;
    if (t.pl > 0) {
      wins += 1;
      grossWin += t.pl;
      run = 0;
    } else if (t.pl < 0) {
      losses += 1;
      grossLoss -= t.pl;
      run += 1;
      if (run > worstRun) worstRun = run;
    }
  }
  let peak: number = BENCH.balance;
  let maxDrawdown = 0;
  for (const e of equity) {
    if (e > peak) peak = e;
    const dd = peak > 0 ? (peak - e) / peak : 0;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }
  return {
    trades,
    equity,
    stats: {
      trades: trades.length,
      wins,
      losses,
      winRate: trades.length ? wins / trades.length : null,
      net: r2(balance - BENCH.balance),
      grossWin: r2(grossWin),
      grossLoss: r2(grossLoss),
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
      avgWin: wins ? r2(grossWin / wins) : null,
      avgLoss: losses ? r2(grossLoss / losses) : null,
      maxDrawdown,
      worstRun,
      spread: r2(cost),
      skipped,
      endBalance: balance,
    },
  };
}

/* ==========================================================================
   The same rule on other market numbers
   ========================================================================== */

export type Spread = {
  /** net result on each of the other markets, lowest first */
  nets: number[];
  gained: number;
  lost: number;
  flat: number;
  median: number;
  mean: number;
  /** the share of the spread that the costs alone explain: total spread paid ÷ markets */
  meanCost: number;
};

/** The rule on BENCH.others market numbers that follow `seed`. None of them is the market on screen. */
export function others(m: Market, seed: number, rule: Rule, count: number = BENCH.others): Spread {
  const nets: number[] = [];
  let cost = 0;
  for (let k = 1; k <= count; k++) {
    const t = runTest(m, makeBars(m, seed + k * 7919), rule);
    nets.push(t.stats.net);
    cost += t.stats.spread;
  }
  nets.sort((a, b) => a - b);
  const mid = nets.length >> 1;
  const median = nets.length === 0 ? 0 : nets.length % 2 ? nets[mid]! : (nets[mid - 1]! + nets[mid]!) / 2;
  return {
    nets,
    gained: nets.filter((n) => n > 0).length,
    lost: nets.filter((n) => n < 0).length,
    flat: nets.filter((n) => n === 0).length,
    median: r2(median),
    mean: r2(nets.reduce((a, b) => a + b, 0) / (nets.length || 1)),
    meanCost: r2(cost / (nets.length || 1)),
  };
}
