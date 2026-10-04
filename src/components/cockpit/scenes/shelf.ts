/**
 * SHELF — what is worth having from elsewhere.
 *
 * A shelf carries five open boxes side by side, one for each kind of resource
 * the page collects: a book for the courses, a table of rows for the data, a
 * calendar grid, a chart, and a shield for the scam warnings. Out of the top
 * of each box a link of light climbs and leans outward, away from the shelf,
 * to a small marker with an arrow that points off the page: these things live
 * on other sites. The boxes are lit in turn, and a point of light travels out
 * along each link.
 *
 * The pointer opens a box: the one under it lights in champagne, what it holds
 * rises, and its link brightens.
 *
 * The chart is a line with no scale and no name; the table has no entries.
 */
import { type Frame, type Scene, type V3 } from "../engine";
import { box, eyeX, lamp, pool, ring, slab, trace } from "../kit";
import { smooth } from "./_stage";

const NAMES = ["COURSES", "DATA", "CALENDARS", "CHARTS", "WARNINGS"];
const N = NAMES.length;
/** a box: its width, the gap to the next, its height, half its depth; and the shelf's top */
const [BW, GAP, BH, BD, Y0] = [0.56, 0.08, 0.56, 0.2, -0.8];
const PITCH = BW + GAP;
/** how high each link climbs */
const RISE = [0.62, 0.84, 0.98, 0.84, 0.62];
/** seconds a box stays lit */
const HOLD = 3.2;

type At = (u: number, v: number) => V3;

/** what each box holds, drawn in the box's own square (u across, v up, 0..1) */
function motif(f: Frame, i: number, at: At, colour: string, a: number): void {
  const { pal } = f;
  const L = (u0: number, v0: number, u1: number, v1: number, alpha = 1, width = 1.25, c = colour) => f.line(at(u0, v0), at(u1, v1), c, alpha * a, width);
  const rect = (u0: number, v0: number, u1: number, v1: number): V3[] => [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  if (i === 0) {
    // an open book
    f.path([at(0.5, 0.3), at(0.2, 0.36), at(0.2, 0.74), at(0.5, 0.68)], colour, a, 1.25, true);
    f.path([at(0.5, 0.3), at(0.8, 0.36), at(0.8, 0.74), at(0.5, 0.68)], colour, a, 1.25, true);
    for (const v of [0.6, 0.5, 0.4]) {
      L(0.27, v, 0.44, v - 0.03, 0.6, 1, pal.ink);
      L(0.56, v - 0.03, 0.73, v, 0.6, 1, pal.ink);
    }
  } else if (i === 1) {
    // a table of rows
    f.fill(rect(0.2, 0.63, 0.8, 0.74), colour, 0.35 * a);
    f.path(rect(0.2, 0.28, 0.8, 0.74), colour, a, 1.25, true);
    for (const v of [0.63, 0.51, 0.4]) L(0.2, v, 0.8, v, 0.7, 1);
    L(0.42, 0.28, 0.42, 0.74, 0.7, 1);
  } else if (i === 2) {
    // a calendar: its two rings, its heading, its days, one of them marked
    f.fill(rect(0.22, 0.62, 0.78, 0.72), colour, 0.35 * a);
    f.path(rect(0.22, 0.26, 0.78, 0.72), colour, a, 1.25, true);
    L(0.34, 0.68, 0.34, 0.78, 1, 1.5);
    L(0.66, 0.68, 0.66, 0.78, 1, 1.5);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const mark = r === 1 && c === 2;
        f.dot(at(0.32 + c * 0.12, 0.53 - r * 0.095), mark ? 0.02 : 0.011, mark ? pal.gold : pal.ink, (mark ? 1 : 0.6) * a);
      }
    }
  } else if (i === 3) {
    // a chart: two axes and a line
    f.path([at(0.22, 0.74), at(0.22, 0.28), at(0.8, 0.28)], pal.ink, 0.6 * a, 1);
    f.path([at(0.26, 0.36), at(0.36, 0.48), at(0.46, 0.42), at(0.56, 0.58), at(0.66, 0.52), at(0.76, 0.68)], colour, a, 1.5);
  } else {
    // a shield, with a mark of warning on it
    const s = [at(0.5, 0.76), at(0.74, 0.68), at(0.74, 0.5), at(0.66, 0.36), at(0.5, 0.26), at(0.34, 0.36), at(0.26, 0.5), at(0.26, 0.68)];
    f.fill(s, colour, 0.16 * a);
    f.path(s, colour, a, 1.25, true);
    L(0.5, 0.64, 0.5, 0.46, 1, 2, pal.ink);
    f.dot(at(0.5, 0.38), 0.014, pal.ink, a);
  }
}

const scene: Scene = {
  pose: 8,
  draw(f) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(0.12 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.035), -0.12, 6.4, m ? 1 : 1.08);

    const cols = [pal.blue, pal.teal, pal.emerald, pal.indigo, pal.crimson];
    const half = ((N - 1) * PITCH + BW) / 2 + 0.06;
    const shelfOn = f.on(0, 0.35);
    pool(f, [0, Y0 - 0.08, 0], 2.2, pal.key, 0.16 * f.boot);
    slab(f, [-half, Y0 - 0.08, -BD - 0.06], [half, Y0, BD + 0.06], pal.ink, 0.1, shelfOn);

    // from the box farthest from the eye to the nearest
    const eye = eyeX(f);
    const order = [0, 1, 2, 3, 4].sort((p, q) => Math.abs((q - 2) * PITCH - eye) - Math.abs((p - 2) * PITCH - eye));
    const ph = f.t / HOLD;
    const seg = m ? 10 : 16;
    const lettered = f.u * PITCH > 78;

    for (const i of order) {
      const on = f.on(0.2 + 0.12 * i, 0.3);
      if (on <= 0.003) continue;
      const x = (i - 2) * PITCH;
      const d = ((((ph - i) % N) + N + N / 2) % N) - N / 2 - 0.5;
      const turn = smooth(1 - Math.abs(d) / 0.8);
      const hand = f.near([x, Y0 + BH / 2, 0], 80);
      const k = Math.max(turn, hand);
      const colour = cols[i];
      const [x0, x1] = [x - BW / 2, x + BW / 2];
      const top = Y0 + BH * on;

      // the box: a back, a wire body, a lit rim round its open front
      const back: V3[] = [[x0, Y0, BD], [x1, Y0, BD], [x1, top, BD], [x0, top, BD]];
      f.fill(back, pal.bg, 0.6 * on);
      f.fill(back, colour, (0.07 + 0.1 * k) * on);
      box(f, [x0, Y0, -BD], [x1, top, BD], pal.ink, 0.34 * on, 0.025 * on);
      const rim: V3[] = [[x0, Y0, -BD], [x1, Y0, -BD], [x1, top, -BD], [x0, top, -BD]];
      f.path(rim, colour, (0.5 + 0.2 * k) * on, 1, true);
      f.path(rim, pal.gold, 0.9 * k * on, 1.4, true);

      // what it holds: it rises a little when the box is opened
      const lift = 0.05 * hand;
      const at: At = (u, v) => [x0 + u * BW, Y0 + lift + v * BH * on, 0];
      motif(f, i, at, colour, (0.62 + 0.38 * k) * on);

      // the link: up out of the box and outward, to a marker that points off the page
      const linkOn = f.on(0.55 + 0.08 * i, 0.3);
      if (linkOn > 0.003) {
        const [nx, ny] = [x * 1.16, RISE[i]];
        const pts: V3[] = [];
        for (let j = 0; j <= seg; j++) {
          const t = (j / seg) * linkOn;
          pts.push([x + (nx - x) * smooth(t), top + (ny - top) * t, 0]);
        }
        trace(f, pts, colour, (0.4 + 0.5 * k) * linkOn, 1.2, f.still ? -1 : f.t * 0.16 + i * 0.37);
        const end = pts[seg];
        ring(f, end, 0.06, { axis: "z", colour, alpha: 0.8 * linkOn, seg: 20 });
        lamp(f, end, k > 0.5 ? pal.gold : colour, (0.4 + 0.6 * k) * linkOn, 0.014);
        // the arrow out
        const a0: V3 = [end[0] + 0.05, end[1] + 0.05, 0];
        const a1: V3 = [end[0] + 0.14, end[1] + 0.14, 0];
        f.line(a0, a1, pal.ink, 0.7 * linkOn, 1.25);
        f.path([[a1[0] - 0.06, a1[1], 0], a1, [a1[0], a1[1] - 0.06, 0]], pal.ink, 0.7 * linkOn, 1.25);
      }

      if (lettered) {
        f.label(NAMES[i], [x, Y0 - 0.08, -BD - 0.06], { align: "center", size: m ? 8 : 9, dy: 13, colour: k > 0.5 ? pal.gold : pal.ink2, alpha: (0.7 + 0.25 * k) * f.on(0.85, 0.15) });
      }
    }
  },
};

export default scene;
