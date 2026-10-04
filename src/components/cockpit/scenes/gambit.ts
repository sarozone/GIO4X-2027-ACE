/**
 * GAMBIT — the strategy library, laid out as a board.
 *
 * Twelve tiles of glass stand in a grid, four by three, one for each approach
 * the library describes, in the library's own order. Each carries a small
 * drawing of the idea and nothing else: the tight in-and-out of a scalp, the
 * spike of a release, a swing, a break through a level, a return to the mean,
 * a range, a curve that steepens, a trend along its average, one long hold,
 * two rates and the gap between them, the rungs of a grid, a stair whose every
 * step is twice the last. One light goes round the board from tile to tile and
 * rests on each in turn: the approaches are set out to be read, and none of
 * them is picked.
 *
 * The drawings are glyphs. No tile carries a price, a result or a symbol.
 *
 * The pointer: the tile under it comes forward out of the board and its
 * drawing lights.
 */
import { clamp, easeInOut, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { trace } from "../kit";

type P2 = readonly [number, number];
type Line = readonly P2[];
type Motif = { main: readonly Line[]; aux: readonly Line[] };

const [COLS, ROWS] = [4, 3];
/** a tile: its width, its height, the space between two */
const [TW, TH, GAP] = [0.78, 0.6, 0.09];
const X0 = -(COLS * TW + (COLS - 1) * GAP) / 2;
const Y1 = (ROWS * TH + (ROWS - 1) * GAP) / 2;
/** the light's round: every step is to a neighbouring tile, and the last leads back to the first */
const ROUTE = [0, 1, 2, 3, 7, 11, 10, 6, 5, 9, 8, 4];
/** seconds the light gives to one tile, the move to the next included */
const HOLD = 2.8;

const TILES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const x = X0 + (i % COLS) * (TW + GAP);
  const y = Y1 - (Math.floor(i / COLS) + 1) * TH - Math.floor(i / COLS) * GAP;
  return { x, y, cx: x + TW / 2, cy: y + TH / 2, turn: ROUTE.indexOf(i), no: String(i + 1).padStart(2, "0") };
});
const ROUND: V3[] = ROUTE.map((i) => [TILES[i].cx, TILES[i].cy, 0.02]);

const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
const sample = (n: number, u0: number, u1: number, fn: (k: number) => number): P2[] =>
  Array.from({ length: n }, (_, i) => [lerp(u0, u1, i / (n - 1)), fn(i / (n - 1))] as const);
const zig = (n: number, u0: number, u1: number, mid: number, amp: number): P2[] =>
  Array.from({ length: n }, (_, i) => [lerp(u0, u1, i / (n - 1)), mid + (i % 2 ? amp : -amp)] as const);
/** an arrow head for a line that ends at `b`, coming from `a` */
const head = (a: P2, b: P2): P2[] => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [dx, dy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  return [
    [b[0] - dx * 0.11 - dy * 0.06, b[1] - dy * 0.11 + dx * 0.06],
    b,
    [b[0] - dx * 0.11 + dy * 0.06, b[1] - dy * 0.11 - dx * 0.06],
  ];
};
const level = (v: number, u0 = 0.1, u1 = 0.9): P2[] => [[u0, v], [u1, v]];

const steep = sample(9, 0.1, 0.86, (k) => 0.16 + 0.7 * Math.pow(k, 2.6));
const trend: P2[] = [[0.1, 0.3], [0.24, 0.24], [0.38, 0.5], [0.5, 0.4], [0.64, 0.68], [0.76, 0.58], [0.88, 0.84]];

/** the twelve approaches, in the order of the library; u runs left to right, v upward, both 0 to 1 */
const MOTIFS: readonly Motif[] = [
  // scalping: many small moves in and out
  { main: [zig(11, 0.12, 0.88, 0.5, 0.09)], aux: [level(0.5)] },
  // news: quiet, the release, the spike
  { main: [[[0.1, 0.42], [0.42, 0.42], [0.5, 0.86], [0.57, 0.3], [0.65, 0.56], [0.9, 0.52]]], aux: [[[0.42, 0.14], [0.42, 0.9]]] },
  // swing: one turn caught, then the next
  { main: [sample(13, 0.1, 0.9, (k) => 0.5 + 0.3 * Math.sin(k * Math.PI * 2.5))], aux: [] },
  // breakout: under a level, then through it
  { main: [[[0.1, 0.36], [0.24, 0.52], [0.36, 0.34], [0.5, 0.54], [0.6, 0.42], [0.72, 0.78], [0.9, 0.86]]], aux: [level(0.6)] },
  // mean reversion: stretched away from the middle, drawn back to it
  { main: [[[0.1, 0.5], [0.25, 0.84], [0.42, 0.5], [0.58, 0.16], [0.75, 0.5], [0.9, 0.66]]], aux: [level(0.5), level(0.84, 0.16, 0.34), level(0.16, 0.49, 0.67)] },
  // range: a floor, a ceiling, and the path between them
  { main: [[[0.16, 0.3], [0.3, 0.7], [0.44, 0.3], [0.58, 0.7], [0.72, 0.3], [0.84, 0.52]]], aux: [[[0.12, 0.24], [0.88, 0.24], [0.88, 0.76], [0.12, 0.76], [0.12, 0.24]]] },
  // momentum: a move that steepens
  { main: [steep, head(steep[7], steep[8])], aux: [] },
  // trend following: the path along its own average
  { main: [trend, head(trend[5], trend[6])], aux: [[[0.1, 0.22], [0.9, 0.74]]] },
  // position trading: one long hold, end to end
  { main: [[[0.12, 0.26], [0.88, 0.76]], [[0.12, 0.14], [0.12, 0.38]], [[0.88, 0.64], [0.88, 0.88]]], aux: [sample(9, 0.12, 0.88, (k) => 0.26 + 0.5 * k + 0.07 * Math.sin(k * Math.PI * 4))] },
  // carry: two rates, and the difference between them
  { main: [level(0.7), level(0.3), [[0.5, 0.3], [0.5, 0.7]]], aux: [[[0.44, 0.38], [0.5, 0.3], [0.56, 0.38]], [[0.44, 0.62], [0.5, 0.7], [0.56, 0.62]]] },
  // grid: rungs set at equal distances, and the path through them
  { main: [[[0.14, 0.72], [0.32, 0.4], [0.5, 0.58], [0.68, 0.28], [0.86, 0.46]]], aux: [0.2, 0.35, 0.5, 0.65, 0.8].map((v) => level(v, 0.14, 0.86)) },
  // martingale: every step twice the one before
  { main: [[[0.1, 0.14], [0.3, 0.14], [0.3, 0.19], [0.5, 0.19], [0.5, 0.29], [0.7, 0.29], [0.7, 0.49], [0.9, 0.49], [0.9, 0.89]]], aux: [level(0.14)] },
];

/** a set of polylines drawn on a tile's face, as one stroke */
function strokes(f: Frame, lines: readonly Line[], x: number, y: number, z: number, colour: string, alpha: number, width: number): void {
  if (alpha <= 0.003 || !lines.length) return;
  const { ctx } = f;
  ctx.beginPath();
  for (const ln of lines) {
    let pen = false;
    for (const [u, v] of ln) {
      const p = f.P(x + u * TW, y + (0.1 + v * 0.72) * TH, z);
      if (!p) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
      pen = true;
    }
  }
  ctx.strokeStyle = rgba(colour, alpha);
  ctx.lineWidth = width;
  ctx.stroke();
}

type State = { lead: number; phase: number };

const scene: Scene<State> = {
  pose: 9,
  setup(f) {
    return { lead: Math.floor(f.rnd(0) * 12), phase: f.rnd(1) * 6 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(0.2 + (f.still ? 0 : Math.sin(f.t * 0.07 + s.phase) * 0.04), -0.06, 6.4, 0.96);

    // ── where the light is: it rests on a tile, then crosses to the next
    const ph = f.t / HOLD + s.lead;
    const step = Math.floor(ph);
    const mv = f.still ? 0 : easeInOut((ph - step - 0.6) / 0.4);
    const stop = (back: number) => TILES[ROUTE[(((step - back) % 12) + 12) % 12]];
    const [a, b] = [stop(0), stop(-1)];
    const lx = lerp(a.cx, b.cx, mv);
    const ly = lerp(a.cy, b.cy, mv);
    const arrive = f.on(1, 0.3);

    // the round itself, seen in the gaps between the tiles
    f.path(ROUND, pal.key, 0.24 * f.boot, 1, true);

    // ── the tiles
    for (let i = 0; i < TILES.length; i++) {
      const tl = TILES[i];
      const on = f.on(tl.turn / 11, 0.4);
      if (on <= 0.003) continue;
      const lit = smooth(1 - Math.hypot(tl.cx - lx, tl.cy - ly) / 0.7) * arrive;
      const n = f.near([tl.cx, tl.cy, 0], f.u * 0.5);
      const hi = Math.max(lit, n);
      const accent = lit >= n ? pal.gold : pal.key;
      // powering on, a tile comes up from behind the board; under the pointer it comes forward out of it
      const z = (1 - on) * 0.25 - 0.17 * n - 0.05 * lit;
      const quad: V3[] = [[tl.x, tl.y, z], [tl.x + TW, tl.y, z], [tl.x + TW, tl.y + TH, z], [tl.x, tl.y + TH, z]];
      f.fill(quad, pal.bg, 0.74 * on);
      f.fill(quad, pal.ink, 0.035 * on);
      if (hi > 0.01) f.fill(quad, accent, 0.1 * hi * on);
      f.path(quad, pal.ink, 0.17 * on, 1, true);
      f.line(quad[3], quad[2], pal.key, (0.42 + 0.3 * n) * (1 - lit) * on, 1.25);
      f.line(quad[3], quad[2], pal.gold, 0.95 * lit * on, 1.5);

      const mo = MOTIFS[i];
      strokes(f, mo.aux, tl.x, tl.y, z, pal.ink, (0.2 + 0.2 * hi) * on, 1);
      strokes(f, mo.main, tl.x, tl.y, z, pal.ink, 0.62 * (1 - hi) * on, 1.3);
      strokes(f, mo.main, tl.x, tl.y, z, accent, hi * on, 1.7);
      if (!m) f.label(tl.no, [tl.x + 0.05, tl.y + TH - 0.075, z], { size: 9, colour: hi > 0.3 ? accent : pal.ink3, alpha: (0.55 + 0.4 * hi) * on });
    }

    // ── the light, and the way it has just come
    if (arrive > 0.003) {
      const at = (tl: { cx: number; cy: number }): V3 => [tl.cx, tl.cy, -0.07];
      trace(f, [at(stop(2)), at(stop(1))], pal.gold, 0.22 * (1 - mv) * arrive, 1.1);
      trace(f, [at(stop(1)), at(a)], pal.gold, 0.5 * (1 - mv * 0.5) * arrive, 1.2);
      const p: V3 = [lx, ly, -0.07];
      if (mv > 0.001) trace(f, [at(a), p], pal.gold, 0.8 * arrive, 1.4);
      f.glow(p, 0.3, pal.gold, 0.34 * arrive);
      f.dot(p, 0.03, pal.gold, 0.9 * arrive);
      f.dot(p, 0.013, pal.ink, 0.95 * arrive);
    }
  },
};

export default scene;
