/**
 * STRATEGY LIBRARY: the picture on each strategy page.
 *
 * A pure module: no imports, no clock, no storage, no Math.random(). Each
 * approach has one invented price path, built from a few hand-placed turning
 * points and a little fixed-seed noise, and the trades its rule would have
 * taken on that path. Where the rule can be computed (two averages, a new
 * high, the RSI, a band, a look-back, a grid, a doubling stake) it is computed
 * here, so the marks sit where the rule puts them and not where a flattering
 * drawing would. Each path includes the kind of stretch the approach fails on.
 *
 * Nothing here is a real price. The scale is 0 to 100 and means nothing.
 */

export type PictureKind = "trend" | "breakout" | "rsi" | "range" | "momentum" | "swing" | "scalp" | "position" | "carry" | "news" | "grid" | "martingale";

export type Mark = {
  /** the points it opened and closed on */
  a: number;
  b: number;
  side: 1 | -1;
  /** ahead after the cost of the spread */
  won: boolean;
  /** still open, and behind, where the picture ends */
  open?: boolean;
  /** the stake, as a multiple of the first one (martingale) */
  size?: number;
};

export type Picture = {
  kind: PictureKind;
  pts: number[];
  trades: Mark[];
  lines: { label: string; tone: "accent" | "gold"; v: (number | null)[] }[];
  levels: { at: number; label?: string }[];
  events: { i: number; label: string }[];
  /** what the path does, as the middle of a sentence */
  shape: string;
};

const N = 140;

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** straight runs between turning points [x from 0 to 1, y], with a small wandering error on top */
function path(turns: readonly (readonly [number, number])[], noise: number, seed: number): number[] {
  const u = seeded(seed);
  const out: number[] = [];
  let e = 0;
  let k = 0;
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    while (k < turns.length - 2 && x > turns[k + 1]![0]) k++;
    const [x0, y0] = turns[k]!;
    const [x1, y1] = turns[k + 1]!;
    const q = x1 > x0 ? Math.min(1, Math.max(0, (x - x0) / (x1 - x0))) : 0;
    e = e * 0.6 + (u() - 0.5) * noise;
    out.push(y0 + (y1 - y0) * q + e);
  }
  return out;
}

const at = (x: number) => Math.round(x * (N - 1));

function sma(p: readonly number[], n: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < p.length; i++) {
    sum += p[i]!;
    if (i >= n) sum -= p[i - n]!;
    out.push(i >= n - 1 ? sum / n : null);
  }
  return out;
}

function rsi(p: readonly number[], n: number): (number | null)[] {
  const out: (number | null)[] = [null];
  let up = 0;
  let down = 0;
  for (let i = 1; i < p.length; i++) {
    const d = p[i]! - p[i - 1]!;
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

const mark = (p: readonly number[], a: number, b: number, side: 1 | -1, spread = 0, extra: Partial<Mark> = {}): Mark => ({ a, b, side, won: (p[b]! - p[a]!) * side - spread > 0, ...extra });

/** hand-placed trades, by how far along the path they open and close */
const placed = (p: readonly number[], list: readonly (readonly [number, number, 1 | -1])[], spread = 0): Mark[] => list.map(([a, b, side]) => mark(p, at(a), at(b), side, spread));

function build(kind: PictureKind): Picture {
  const none = { lines: [], levels: [], events: [] };
  switch (kind) {
    case "trend": {
      const pts = path([[0, 46], [0.1, 54], [0.2, 40], [0.3, 53], [0.4, 41], [0.5, 50], [0.8, 86], [0.86, 80], [1, 66]], 2.4, 11);
      const f = sma(pts, 6);
      const s = sma(pts, 18);
      const trades: Mark[] = [];
      let open: { a: number; side: 1 | -1 } | null = null;
      for (let i = 1; i < N; i++) {
        const a0 = f[i - 1];
        const b0 = s[i - 1];
        const a1 = f[i];
        const b1 = s[i];
        if (a0 == null || b0 == null || a1 == null || b1 == null) continue;
        const sig = a0 <= b0 && a1 > b1 ? 1 : a0 >= b0 && a1 < b1 ? -1 : 0;
        if (!sig) continue;
        if (open) trades.push(mark(pts, open.a, i, open.side));
        open = { a: i, side: sig };
      }
      if (open && open.a < N - 1) trades.push(mark(pts, open.a, N - 1, open.side));
      return { kind, pts, trades, ...none, lines: [{ label: "Fast average", tone: "accent", v: f }, { label: "Slow average", tone: "gold", v: s }], shape: "the price chops sideways, runs up in one long trend and then turns, with a fast and a slow average drawn through it and a trade at each crossing" };
    }
    case "breakout": {
      const pts = path([[0, 50], [0.08, 53], [0.16, 47], [0.22, 52], [0.3, 59], [0.36, 48], [0.44, 41], [0.5, 50], [0.6, 52], [0.66, 48], [0.92, 88], [1, 82]], 1.8, 23);
      const look = 20;
      const hi: (number | null)[] = [];
      const lo: (number | null)[] = [];
      const trades: Mark[] = [];
      let open: { a: number; side: 1 | -1 } | null = null;
      for (let i = 0; i < N; i++) {
        if (i < look) {
          hi.push(null);
          lo.push(null);
          continue;
        }
        const win = pts.slice(i - look, i);
        const h = Math.max(...win);
        const l = Math.min(...win);
        hi.push(h);
        lo.push(l);
        if (open) {
          // out when the price gives back to the far side of the last eight points
          const near = pts.slice(i - 8, i);
          const gone = open.side === 1 ? pts[i]! < Math.min(...near) : pts[i]! > Math.max(...near);
          if (gone) {
            trades.push(mark(pts, open.a, i, open.side));
            open = null;
          }
        } else if (pts[i]! > h) open = { a: i, side: 1 };
        else if (pts[i]! < l) open = { a: i, side: -1 };
      }
      if (open && open.a < N - 1) trades.push(mark(pts, open.a, N - 1, open.side));
      return { kind, pts, trades, ...none, lines: [{ label: "20-point high", tone: "accent", v: hi }, { label: "20-point low", tone: "gold", v: lo }], shape: "the price sits in a narrow band, pokes out and falls straight back, and later leaves the band for good, with a trade at each new high or low" };
    }
    case "rsi": {
      const pts = path([[0, 50], [0.07, 62], [0.2, 38], [0.33, 63], [0.46, 39], [0.58, 60], [0.7, 44], [0.76, 47], [0.84, 30], [0.87, 35], [0.94, 17], [0.96, 22], [1, 10]], 1.6, 37);
      const r = rsi(pts, 10);
      const trades: Mark[] = [];
      let open: { a: number; side: 1 | -1 } | null = null;
      for (let i = 1; i < N; i++) {
        const a = r[i - 1];
        const b = r[i];
        if (a == null || b == null) continue;
        if (open) {
          const back = open.side === 1 ? b >= 55 : b <= 45;
          const stopped = (pts[i]! - pts[open.a]!) * open.side < -7;
          if (back || stopped) {
            trades.push(mark(pts, open.a, i, open.side));
            open = null;
          }
          continue;
        }
        if (a <= 30 && b > 30) open = { a: i, side: 1 };
        else if (a >= 70 && b < 70) open = { a: i, side: -1 };
      }
      if (open && open.a < N - 1) trades.push(mark(pts, open.a, N - 1, open.side));
      return { kind, pts, trades, ...none, shape: "the price swings back and forth and then falls steadily, with a trade each time the RSI turns back from an extreme, including the buys made on the way down" };
    }
    case "range": {
      const pts = path([[0, 50], [0.08, 69], [0.2, 31], [0.32, 70], [0.44, 30], [0.56, 69], [0.66, 52], [0.76, 71], [1, 94]], 1.6, 41);
      const trades: Mark[] = [];
      let open: { a: number; side: 1 | -1 } | null = null;
      for (let i = 1; i < N; i++) {
        const p = pts[i]!;
        if (open) {
          const target = open.side === 1 ? p >= 50 : p <= 50;
          const stopped = open.side === 1 ? p <= 23 : p >= 77;
          if (target || stopped) {
            trades.push(mark(pts, open.a, i, open.side));
            open = null;
          }
          continue;
        }
        if (p >= 67 && pts[i - 1]! < 67) open = { a: i, side: -1 };
        else if (p <= 33 && pts[i - 1]! > 33) open = { a: i, side: 1 };
      }
      if (open && open.a < N - 1) trades.push(mark(pts, open.a, N - 1, open.side));
      return { kind, pts, trades, ...none, levels: [{ at: 70, label: "Top of the range" }, { at: 30, label: "Bottom of the range" }], shape: "the price turns several times between two levels and then goes through the upper one and keeps going, with a sale near the top and a purchase near the bottom each time" };
    }
    case "momentum": {
      const pts = path([[0, 40], [0.12, 42], [0.4, 78], [0.5, 77], [0.6, 62], [0.7, 77], [0.8, 61], [0.9, 74], [1, 64]], 2, 53);
      const look = 14;
      const trades: Mark[] = [];
      let open: { a: number; side: 1 | -1 } | null = null;
      for (let i = look; i < N; i++) {
        const ch = pts[i]! - pts[i - look]!;
        if (open) {
          if (ch * open.side < 0) {
            trades.push(mark(pts, open.a, i, open.side));
            open = null;
          }
          continue;
        }
        // nothing new is opened in the last few points: there would be no room to draw it
        if (i > N - 9) continue;
        if (ch > 9) open = { a: i, side: 1 };
        else if (ch < -9) open = { a: i, side: -1 };
      }
      if (open && open.a < N - 1) trades.push(mark(pts, open.a, N - 1, open.side));
      return { kind, pts, trades, ...none, shape: "the price rises strongly, stalls and then jerks down and up without going anywhere, with a trade whenever it has moved far over the last fourteen points" };
    }
    case "swing": {
      const pts = path([[0, 30], [0.12, 46], [0.2, 38], [0.36, 61], [0.45, 51], [0.6, 75], [0.7, 65], [0.78, 70], [0.9, 49], [1, 45]], 1.6, 61);
      return { kind, pts, trades: placed(pts, [[0.22, 0.35, 1], [0.47, 0.59, 1], [0.72, 0.84, 1]]), ...none, shape: "the price climbs in steps with a pullback after each one, and the last pullback does not stop, with a purchase after each pullback" };
    }
    case "scalp": {
      const pts = path([[0, 50], [0.1, 53], [0.2, 49], [0.3, 54], [0.4, 50], [0.5, 55], [0.6, 51], [0.7, 47], [0.8, 52], [0.9, 48], [1, 51]], 2.2, 71);
      const list: [number, number, 1 | -1][] = [];
      for (let k = 0; k < 12; k++) list.push([0.03 + k * 0.08, 0.03 + k * 0.08 + 0.045, k % 2 ? -1 : 1]);
      // the spread is one unit here: on moves this small it decides most of the trades
      return { kind, pts, trades: placed(pts, list, 1), ...none, shape: "the price wobbles in a narrow band while a dozen very short trades are opened and closed, each counted after a spread that is large beside the move it is trying to catch" };
    }
    case "position": {
      const pts = path([[0, 30], [0.1, 38], [0.2, 24], [0.3, 34], [0.5, 60], [0.62, 44], [0.86, 84], [1, 72]], 2, 83);
      return { kind, pts, trades: placed(pts, [[0.06, 0.19, 1], [0.3, 0.97, 1]]), ...none, shape: "the price rises over a long stretch with two deep falls on the way, with one early purchase closed at a loss and a second held through a fall that took back much of what it had gained" };
    }
    case "carry": {
      const pts = path([[0, 56], [0.3, 59], [0.5, 57], [0.72, 61], [0.82, 30], [0.9, 34], [1, 31]], 1.4, 97);
      const interest = pts.map((_, i) => (i >= at(0.05) && i <= at(0.86) ? 10 + ((i - at(0.05)) / (N - 1)) * 14 : i > at(0.86) ? 10 + ((at(0.86) - at(0.05)) / (N - 1)) * 14 : null));
      return { kind, pts, trades: placed(pts, [[0.05, 0.86, 1]]), ...none, lines: [{ label: "Interest collected", tone: "gold", v: interest }], events: [{ i: at(0.72), label: "Unwind" }], shape: "the exchange rate drifts quietly for a long time while interest adds up a little each day, then falls in a few days by far more than the interest collected, with one long trade held throughout" };
    }
    case "news": {
      const pts = path([[0, 50], [0.44, 51], [0.47, 66], [0.5, 60], [0.55, 40], [0.6, 46], [1, 62]], 1.2, 101);
      return { kind, pts, trades: placed(pts, [[0.47, 0.53, 1], [0.55, 0.61, -1], [0.66, 0.96, 1]]), ...none, events: [{ i: at(0.445), label: "Release" }], shape: "the price is quiet until a scheduled release, jumps up, reverses below where it started within moments and then drifts higher, with a purchase on the jump and a sale on the reversal that are both closed at a loss" };
    }
    case "grid": {
      const pts = path([[0, 66], [0.06, 73], [0.16, 46], [0.26, 73], [0.36, 45], [0.46, 72], [0.54, 62], [1, 8]], 1.5, 113);
      const levels = [60, 50, 40, 30, 20];
      const held = new Map<number, number>();
      const trades: Mark[] = [];
      for (let i = 1; i < N; i++) {
        const p = pts[i]!;
        for (const [lv, a] of held) {
          if (p >= lv + 10) {
            trades.push(mark(pts, a, i, 1));
            held.delete(lv);
          }
        }
        for (const lv of levels) if (pts[i - 1]! > lv && p <= lv && !held.has(lv)) held.set(lv, i);
      }
      for (const a of held.values()) trades.push(mark(pts, a, N - 1, 1, 0, { open: true }));
      trades.sort((x, y) => x.a - y.a);
      return { kind, pts, trades, ...none, levels: levels.map((l) => ({ at: l })), shape: "the price moves up and down across evenly spaced levels and then falls through all of them, with a purchase at each level on the way down that is closed one level higher when the price comes back, and left open when it does not" };
    }
    case "martingale": {
      const pts = path([[0, 60], [0.07, 67], [0.15, 55], [0.22, 66], [0.3, 53], [0.37, 64], [0.44, 58], [1, 6]], 1.2, 127);
      const step = 6;
      const trades: Mark[] = [];
      const events: Picture["events"] = [];
      let a = 2;
      let size = 1;
      for (let i = 3; i < N; i++) {
        const d = pts[i]! - pts[a]!;
        if (Math.abs(d) < step) continue;
        trades.push(mark(pts, a, i, 1, 0, { size }));
        if (d < 0 && size >= 32) {
          events.push({ i, label: "Nothing left to double" });
          break;
        }
        size = d > 0 ? 1 : size * 2;
        a = i;
      }
      return { kind, pts, trades, ...none, events, shape: "the price swings for a while and then falls without a pause, with a purchase whose stake is doubled after every loss and returned to one after a win, until the stake can no longer be doubled" };
    }
  }
}

const cache = new Map<PictureKind, Picture>();

/** The picture for one approach: the same every time. */
export function pictureOf(kind: PictureKind): Picture {
  let p = cache.get(kind);
  if (!p) {
    p = build(kind);
    cache.set(kind, p);
  }
  return p;
}

const count = (n: number, one: string, many: string) => `${n === 1 ? "one" : n} ${n === 1 ? one : many}`;

/** The one sentence that says in words what the canvas shows. */
export function inWords(p: Picture): string {
  const n = p.trades.length;
  const open = p.trades.filter((t) => t.open).length;
  const won = p.trades.filter((t) => t.won && !t.open).length;
  const lost = n - won - open;
  const tally = `${count(n, "trade is", "trades are")} marked, ${won === 0 ? "none" : won === 1 ? "one" : won} closed ahead and ${lost === 0 ? "none" : lost === 1 ? "one" : lost} closed behind${open ? `, and ${count(open, "is", "are")} still open at a loss where the picture ends` : ""}`;
  return `On an invented price path, ${p.shape}: ${tally}.`;
}
