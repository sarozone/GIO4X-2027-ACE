/**
 * LEDGER — the trading journal, being kept.
 *
 * A book lies open on the desk, seen from above, its two pages ruled. A pen
 * writes it up one row at a time, the left page and then the right: a date, a
 * note, an outcome, and a mark at the end of the row for how the trade went.
 * Behind the book, standing up from the head of the pages, is what the rows
 * add up to: a running total with one point for every row written, that goes
 * down as well as up. When both pages are full the book is cleared and begun
 * again.
 *
 * The rows are dashes, not entries, and the curve has no scale: the journal on
 * the page below is the visitor's own, and stays on their device.
 *
 * The pointer: the row under it lights, and a line ties it to its own point on
 * the running total.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { lamp, pool, trace } from "../kit";

/** the book: a page's width, the near edge, the depth of a page, the height it lies at */
const [PW, Z0, PD, BASE] = [1.4, -1, 2, -0.4];
/** the running total: the height of its foot, how tall it stands, half its width */
const [CB, CH, CW] = [BASE + 0.14, 0.98, 1.2];
const ZB = Z0 + PD;
/** seconds to fill both pages and clear them */
const LOOP = 26;
/** what is written in a row, as shares of its width: three entries, then the mark */
const CELLS: readonly (readonly [number, number])[] = [[0.02, 0.2], [0.27, 0.6], [0.67, 0.85]];
const MARK = 0.95;

const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** a point on a page: `side` -1 left or 1 right, u from the spine outward, v from the near edge to the far one */
const pg = (side: number, u: number, v: number, lift = 0): V3 => [side * u * PW, BASE + 0.11 * Math.sin(Math.PI * Math.sqrt(u)) + lift, Z0 + v * PD];

type State = { per: number; total: number; sum: number[]; up: boolean[]; zero: number };

const scene: Scene<State> = {
  pose: 17,
  setup(f) {
    const per = f.mobile ? 6 : 9;
    const total = per * 2;
    // how each trade went, and what they come to: more up than down, and never a straight line
    const up: boolean[] = [];
    const raw: number[] = [];
    let acc = 0;
    let [lo, hi] = [0, 0];
    for (let i = 0; i < total; i++) {
      up[i] = f.rnd(i) > 0.38;
      acc += up[i] ? 0.5 + f.rnd(i + 30) : -(0.35 + 0.75 * f.rnd(i + 60));
      raw[i] = acc;
      lo = Math.min(lo, acc);
      hi = Math.max(hi, acc);
    }
    const span = Math.max(1e-6, hi - lo);
    return { per, total, up, sum: raw.map((v) => (v - lo) / span), zero: -lo / span };
  },
  draw(f, s) {
    const { pal } = f;
    const { per, total } = s;
    f.aim(0.12 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.035), -0.72, 6.3, 0.9);

    // ── how far the writing has got: `done` rows, the last of them part written
    const cyc = (f.t / LOOP) % 1;
    const done = clamp(cyc / 0.9) * total;
    const ink = f.still ? 1 : 1 - smooth((cyc - 0.94) / 0.06);
    const now = Math.min(total - 1, Math.floor(done));

    /** a point on row r, `q` of the way across it from left to right */
    const row = (r: number, q: number, lift = 0.004): V3 => {
      const v = 0.88 - ((r % per) * 0.76) / (per - 1);
      return r < per ? pg(-1, 0.92 - q * 0.82, v, lift) : pg(1, 0.1 + q * 0.82, v, lift);
    };
    const run = (r: number, q0: number, q1: number): V3[] => [row(r, q0), row(r, (q0 + q1) / 2), row(r, q1)];
    const node = (r: number): V3 => [lerp(-CW, CW, (r + 1) / total), CB + s.sum[r] * CH, ZB];

    // ── the book: a cover, then the two pages, each a sheet that rises from the spine and falls to its edge
    const book = f.on(0, 0.4);
    pool(f, [0, BASE - 0.06, 0], 2.1, pal.key, 0.2 * f.boot);
    const cover: V3[] = [[-PW - 0.07, BASE - 0.06, Z0 - 0.07], [PW + 0.07, BASE - 0.06, Z0 - 0.07], [PW + 0.07, BASE - 0.06, ZB + 0.07], [-PW - 0.07, BASE - 0.06, ZB + 0.07]];
    f.fill(cover, pal.bg, 0.9 * book);
    f.fill(cover, pal.gold, 0.08 * book);
    f.path(cover, pal.gold, 0.55 * book, 1.2, true);
    for (const side of [-1, 1]) {
      const sheet: V3[] = [];
      for (let i = 0; i <= 8; i++) sheet.push(pg(side, i / 8, 0));
      for (let i = 8; i >= 0; i--) sheet.push(pg(side, i / 8, 1));
      f.fill(sheet, pal.bg, 0.92 * book);
      f.fill(sheet, pal.ink, 0.06 * book);
      f.path(sheet, pal.ink, 0.3 * book, 1, true);
      // the thickness of the leaves under it, at the outer edge
      f.line(pg(side, 1, 0, -0.03), pg(side, 1, 1, -0.03), pal.ink, 0.2 * book, 1);
    }
    f.line(pg(1, 0, 0), pg(1, 0, 1), pal.ink, 0.45 * book, 1.2);

    // ── the rows: the ruling, and on it what has been written so far
    let best = -1;
    let bestK = 0.04;
    for (let r = 0; r < total; r++) {
      const on = f.on(0.25 + 0.4 * ((r % per) / per), 0.3);
      if (on <= 0.003) continue;
      f.path(run(r, 0, 1), pal.ink, 0.13 * on, 1);
      const w = clamp(done - r);
      if (w <= 0) continue;
      const k = f.near(row(r, 0.5), f.u * 0.2);
      if (k > bestK) {
        best = r;
        bestK = k;
      }
      for (const [q0, q1] of CELLS) {
        if (w <= q0) break;
        const pts = run(r, q0, Math.min(q1, w));
        f.path(pts, pal.ink, (0.66 + 0.3 * k) * (1 - k) * ink * on, 1.7);
        if (k > 0.01) f.path(pts, pal.gold, k * ink * on, 2);
      }
      if (w > MARK) f.dot(row(r, MARK), 0.02, s.up[r] ? pal.emerald : pal.crimson, 0.95 * ink * on);
    }

    // ── the running total, standing up from the head of the pages: a point for each row written
    const chart = f.on(0.6, 0.3) * ink;
    f.line([-CW, CB, ZB], [CW, CB, ZB], pal.ink, 0.26 * f.on(0.6, 0.3), 1);
    f.line([-CW, CB, ZB], [-CW, CB + CH, ZB], pal.ink, 0.2 * f.on(0.6, 0.3), 1);
    const curve: V3[] = [[-CW, CB + s.zero * CH, ZB]];
    const part = done - now;
    for (let r = 0; r <= now; r++) {
      if (r < now) {
        curve.push(node(r));
        continue;
      }
      // the row being written: its point is reached as its last entry is made
      const from = curve[curve.length - 1];
      const to = node(r);
      const k = clamp(part);
      curve.push([lerp(from[0], to[0], k), lerp(from[1], to[1], k), ZB]);
    }
    if (curve.length > 1) {
      trace(f, curve, pal.gold, 0.92 * chart, 1.6);
      for (let i = 1; i < curve.length - 1; i++) f.dot(curve[i], 0.013, pal.gold, 0.9 * chart);
      const tip = curve[curve.length - 1];
      f.line(tip, [tip[0], CB, ZB], pal.gold, 0.22 * chart, 1);
      lamp(f, tip, pal.gold, chart, 0.016);
    }
    // the row under the pointer, tied to its own point
    if (best >= 0 && best < now) {
      const p = node(best);
      f.line(row(best, best < per ? 1 : 0), p, pal.gold, 0.5 * bestK * ink, 1);
      f.line(p, [p[0], CB, ZB], pal.gold, 0.5 * bestK * ink, 1);
      lamp(f, p, pal.gold, bestK * ink, 0.02);
    }

    // ── the pen: its nib on the row being written
    const pen = f.on(0.8, 0.2) * ink;
    if (pen > 0.003) {
      const nib = row(now, clamp(part), 0.01);
      const lean = (h: number): V3 => [nib[0] + 0.2 * h, nib[1] + 0.6 * h, nib[2] - 0.1 * h];
      f.glow(nib, 0.2, pal.gold, 0.4 * pen);
      f.line(lean(0.24), lean(1), pal.ink, 0.2 * pen, 6);
      f.line(lean(0.24), lean(1), pal.ink, 0.75 * pen, 2.2);
      f.line(nib, lean(0.24), pal.gold, 0.95 * pen, 2.2);
      f.dot(nib, 0.012, pal.ink, 0.95 * pen);
    }
  },
};

export default scene;
