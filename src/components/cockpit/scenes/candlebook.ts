/**
 * CANDLEBOOK — the playbook, open on its stand.
 *
 * A book stands open, leaning back a little. Each of its two pages holds two
 * small groups of candles, drawn the way a field guide draws its specimens,
 * each with its name beneath. One group is ringed in champagne: the pattern
 * being read. Every so often a leaf lifts from the right, turns over the spine
 * and lies down on the left, and four other groups are on show.
 *
 * The candles are drawings of shapes: they stand on no scale, beside no
 * symbol, and belong to no market or moment.
 *
 * The pointer is the reader's finger: the group it rests on is the one that is
 * ringed, and its candles and its name are lit.
 */
import { clamp, easeInOut, type Frame, type Scene, type V3 } from "../engine";
import { smooth } from "./_stage";

/** one candle: open, close, high, low, each from 0 to 1 of the group's height */
type Candle = readonly [number, number, number, number];
const BOOK: readonly (readonly [string, readonly Candle[]])[] = [
  ["HAMMER", [[0.92, 0.72, 0.96, 0.68], [0.7, 0.5, 0.74, 0.46], [0.42, 0.5, 0.52, 0.1], [0.52, 0.72, 0.76, 0.5]]],
  ["ENGULFING", [[0.82, 0.68, 0.86, 0.64], [0.66, 0.5, 0.7, 0.46], [0.42, 0.8, 0.84, 0.38]]],
  ["DOJI", [[0.3, 0.52, 0.56, 0.26], [0.52, 0.72, 0.76, 0.5], [0.74, 0.75, 0.94, 0.56], [0.72, 0.54, 0.74, 0.5]]],
  ["MORNING STAR", [[0.88, 0.46, 0.92, 0.42], [0.36, 0.31, 0.42, 0.22], [0.4, 0.8, 0.84, 0.38]]],
  ["HARAMI", [[0.96, 0.84, 1, 0.8], [0.84, 0.3, 0.88, 0.26], [0.48, 0.62, 0.66, 0.44]]],
  ["THREE SOLDIERS", [[0.12, 0.38, 0.42, 0.08], [0.34, 0.62, 0.66, 0.3], [0.58, 0.88, 0.92, 0.54]]],
  ["SHOOTING STAR", [[0.16, 0.36, 0.4, 0.12], [0.38, 0.58, 0.62, 0.36], [0.62, 0.56, 0.96, 0.54], [0.54, 0.36, 0.58, 0.32]]],
  ["PIERCING", [[0.96, 0.82, 0.98, 0.78], [0.8, 0.38, 0.84, 0.34], [0.28, 0.66, 0.7, 0.24]]],
];

/** the book: the width of one page, half its height, how far it leans back, the height of its middle */
const [W, H, TILT, CY] = [1.45, 0.82, 0.3, 0.02];
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);
/** seconds one spread is on show, the turn included, and the share of them the turn takes */
const [LOOP, TURN] = [12, 0.3];
/** the two groups on a page: their height on it, and the size of a group */
const ROWS = [0.4, -0.36];
const [GW, GH] = [0.92, 0.44];

/**
 * A point of a leaf: r out from the spine, v up the page, the leaf turned by
 * `th` about the spine (0 lies on the right, half a turn lies on the left). A
 * lying page swells a little between the spine and its edge, as paper does.
 */
const leaf = (r: number, v: number, th: number): V3 => {
  const reach = r * (1 - 0.25 * Math.sin(th));
  const u = reach * Math.cos(th);
  const lift = reach * Math.sin(th) + 0.07 * Math.sin((Math.PI * r) / W) * Math.abs(Math.cos(th));
  return [u, CY + v * CT + lift * ST, v * ST - lift * CT];
};

const outline = (th: number, grow = 0): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= 8; i++) pts.push(leaf(((W + grow) * i) / 8, H + grow, th));
  for (let i = 8; i >= 0; i--) pts.push(leaf(((W + grow) * i) / 8, -H - grow, th));
  return pts;
};

const scene: Scene = {
  pose: 5,
  draw(f: Frame) {
    const { pal } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(f.still ? -0.05 : -0.05 + Math.sin(t * 0.07) * 0.05, 0.1, 6.2, 1);

    const spread = Math.floor(t / LOOP);
    const u = t / LOOP - spread;
    const k = f.still ? 0 : easeInOut((u - (1 - TURN)) / TURN);
    const th = k * Math.PI;
    const turning = k > 0.001 && k < 0.999;
    const on = f.on(0, 0.4);

    // ── the binding: the cover behind the pages, and the stand's ledge under it
    for (const side of [0, Math.PI]) {
      const cover = outline(side, 0.07);
      f.fill(cover, pal.bg, 0.9 * on);
      f.path(cover, pal.ink, 0.3 * on, 1, true);
    }
    f.line(leaf(W + 0.16, -H - 0.13, Math.PI), leaf(W + 0.16, -H - 0.13, 0), pal.key, 0.55 * on, 1.5);

    /** one group of candles at row `row` of a leaf lying at `at`; `show` fades it, `ring` rings it */
    const group = (id: number, row: number, at: number, show: number, auto: number) => {
      const [name, candles] = BOOK[((id % BOOK.length) + BOOK.length) % BOOK.length];
      const r0 = (W - GW) / 2 + 0.03;
      const v0 = ROWS[row] - GH / 2;
      const centre = leaf(W / 2 + 0.03, ROWS[row] - 0.04, at);
      const touch = f.near(centre, m ? 60 : 84);
      const ringed = Math.max(touch, auto * (1 - f.hover));
      const lit = (0.62 + 0.38 * ringed) * show;
      const pitch = GW / (candles.length + 1);
      const half = Math.min(0.06, pitch * 0.3);
      // on the back of a leaf the page reads from the spine outward the other way
      const flip = Math.cos(at) < 0;
      candles.forEach(([open, close, high, low], i) => {
        const grow = f.on(0.3 + ((id % 4) * 4 + i) * 0.03, 0.3);
        if (grow <= 0.003) return;
        const slot = flip ? candles.length - i : i + 1;
        const r = r0 + slot * pitch;
        const rise = close >= open;
        const colour = rise ? pal.emerald : pal.crimson;
        const y = (q: number) => v0 + GH * (low + (q - low) * grow);
        f.line(leaf(r, y(low), at), leaf(r, y(high), at), colour, 0.9 * lit, 1.1);
        const b0 = y(Math.min(open, close));
        const b1 = Math.max(y(Math.max(open, close)), b0 + 0.012);
        const body: V3[] = [leaf(r - half, b0, at), leaf(r + half, b0, at), leaf(r + half, b1, at), leaf(r - half, b1, at)];
        f.fill(body, pal.bg, 0.9 * show);
        f.fill(body, colour, (rise ? 0.34 : 0.7) * lit);
        f.path(body, colour, 0.95 * lit, 1, true);
      });
      // the ground the group stands on, and its name
      f.line(leaf(r0 + 0.04, v0 - 0.035, at), leaf(r0 + GW - 0.04, v0 - 0.035, at), pal.ink, 0.2 * show, 1);
      const flat = Math.abs(Math.cos(at));
      f.label(name, leaf(W / 2 + 0.03, v0 - 0.035, at), { align: "center", size: m ? 8 : 9.5, colour: ringed > 0.3 ? pal.gold : pal.ink2, alpha: (0.6 + 0.4 * ringed) * show * flat * f.on(0.7, 0.3), dy: 10 });
      if (ringed > 0.01) {
        const pts: V3[] = [];
        const n = Math.round(30 * f.q);
        const draw = Math.round(n * clamp(ringed * 1.6));
        for (let i = 0; i <= draw; i++) {
          const a = (i / n) * Math.PI * 2 - 2.2;
          pts.push(leaf(W / 2 + 0.03 + Math.cos(a) * (GW / 2 + 0.07), ROWS[row] - 0.05 + Math.sin(a) * (GH / 2 + 0.13), at));
        }
        f.path(pts, pal.gold, 0.16 * ringed * show, 5);
        f.path(pts, pal.gold, 0.95 * ringed * show, 1.5);
      }
    };

    /** a page: its paper, its edge, a ruled margin, and its two groups */
    const page = (at: number, first: number, show: number, auto: readonly [number, number]) => {
      const paper = outline(at);
      f.fill(paper, pal.bg, 0.96 * show);
      f.fill(paper, pal.ink, 0.05 * show);
      f.path(paper, pal.ink, 0.36 * show, 1, true);
      f.line(leaf(0.1, H - 0.1, at), leaf(W - 0.1, H - 0.1, at), pal.ink, 0.14 * show, 1);
      f.line(leaf(0.1, -H + 0.07, at), leaf(W - 0.1, -H + 0.07, at), pal.ink, 0.14 * show, 1);
      group(first, 0, at, show, auto[0]);
      group(first + 1, 1, at, show, auto[1]);
    };

    // ── which group is ringed while the reader is elsewhere: it fades as the leaf lifts and returns on the new spread
    const slot = (spread * 3 + 1) % 4;
    const ring = f.still ? 1 : smooth(u * 8) * (1 - smooth((u - (1 - TURN) + 0.06) / 0.06));
    const mark = (a: number, b: number): [number, number] => [slot === a ? ring : 0, slot === b ? ring : 0];

    // the left page keeps the old spread until the leaf covers it; the right page under the leaf is already the next
    const base = spread * 4;
    page(Math.PI, base, on, mark(0, 1));
    page(0, base + 2 + (turning ? 4 : 0), on, turning ? [0, 0] : mark(2, 3));
    // the thickness of the book: the edges of the leaves beneath, at each side
    for (let i = 1; i <= 3; i++) {
      for (const side of [0, Math.PI]) f.line(leaf(W + i * 0.018, H, side), leaf(W + i * 0.018, -H, side), pal.ink, 0.2 * on, 1);
    }

    // ── the turning leaf: the old right page on its face, the next left page on its back
    if (turning) {
      if (th < Math.PI / 2) page(th, base + 2, on, [0, 0]);
      else page(th, base + 4, on, [0, 0]);
      f.line(leaf(W, H, th), leaf(W, -H, th), pal.key, 0.7 * on, 1.5);
    }

    // ── the spine, lit
    f.line(leaf(0, H + 0.05, 0), leaf(0, -H - 0.05, 0), pal.key, 0.6 * on, 1.5);
  },
};

export default scene;
