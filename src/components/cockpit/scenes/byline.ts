/**
 * BYLINE — one desk, one hand, and the pages that leave it.
 *
 * A writing desk under its lamp. A sheet lies on it and a pen works down it:
 * a few lines, and then, at the foot, the nib traces a signature, a flourish
 * in champagne with a stroke drawn back under it. Signed, the page lifts off
 * the desk and settles on the pile at the right, which is kept fanned so that
 * the corner of every page shows; each has the same hand at its foot. A clean
 * sheet takes its place and the pen goes back to the top.
 *
 * At the front of the desk stands a nameplate. On a writer's own page it
 * carries that writer's name, as the address gives it.
 *
 * The lines are strokes and the flourish is nobody's signature. The pile is a
 * drawing: it does not count what anyone has written.
 *
 * The pointer goes through the pile: its pages fan wider, the nameplate warms
 * under the hand, and the ink on the desk brightens.
 */
import { TAU, clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, slab } from "../kit";

const FLOOR = -0.8;
/** the desk top: its half-width, its near edge and its far one, and how thick it is */
const [DX, DZ0, DZ1, THICK] = [1.55, -0.7, 0.8, 0.09];
/** a sheet, and where one is written and where the pile lies */
const [SW, SH] = [0.8, 1];
const WRITE: V3 = [-0.55, 0.006, 0.05];
const PILE: V3 = [0.85, 0.006, 0.08];
/** the nameplate: its ends, its foot and its head (it leans back) */
const [N0, N1, NZ0, NZ1, NH] = [0.32, 1.38, -0.68, -0.61, 0.2];
/** seconds for one page: written, signed, put on the pile */
const CYCLE = 20;

type At = (u: number, v: number) => V3;
type State = { pen: [number, number]; widths: number[]; name: string };

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** a sheet lying flat: its own measure (across, and up the page from its foot) to the world */
const lying = (c: V3, yaw: number): At => {
  const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)];
  return (u, v) => [c[0] + (u - 0.5) * SW * cy - (v - 0.5) * SH * sy, c[1], c[2] + (u - 0.5) * SW * sy + (v - 0.5) * SH * cy];
};

/** the flourish, in a sheet's measure: the name itself, then the stroke drawn back under it */
function flourish(g: number): [number, number] {
  if (g <= 1) return [0.4 + 0.46 * g + 0.035 * Math.sin(g * TAU * 3.2), 0.2 + 0.065 * Math.sin(g * TAU * 3.2 + 1.2) * (1 - 0.5 * g) + 0.025 * Math.sin(g * TAU * 1.1)];
  const h = clamp((g - 1) / 0.3);
  return [lerp(0.9, 0.42, h), 0.125 - 0.035 * Math.sin(Math.PI * h) + 0.07 * (1 - h) ** 3];
}

function paper(f: Frame, at: At, a: number): void {
  const q: V3[] = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
  f.fill(q, f.pal.bg, 0.94 * a);
  f.fill(q, f.pal.ink, 0.06 * a);
  f.path(q, f.pal.ink, 0.36 * a, 1, true);
}

/** the writer's name as the address gives it, made into words and kept short */
function written(tag: string): string {
  let s = tag;
  try {
    s = decodeURIComponent(tag);
  } catch {
    // an address that cannot be decoded is shown as it came
  }
  return s.replace(/[-_+]+/g, " ").trim().toUpperCase().slice(0, 22);
}

const scene: Scene<State> = {
  // the composed still: the page written, the flourish almost done
  pose: CYCLE * 0.55,
  setup(f) {
    return { pen: [0.1, 0.9], widths: Array.from({ length: 10 }, (_, i) => 0.6 + 0.4 * f.rnd(i + 70)), name: written(f.tag) };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    const composed = f.still || f.dt === 0;
    f.aim(-0.16 + (f.still ? 0 : Math.sin(t * 0.07) * 0.03), -0.42, 6.6, m ? 0.9 : 0.95);
    const k = clamp(f.u / 110, 0.6, 1.3);

    const turn = t / CYCLE;
    const n = Math.floor(turn);
    const u = turn - n;
    /** lines written so far, how much of the flourish is traced, and how far the page is on its way to the pile */
    const lines = clamp(u / 0.3) * 4.6;
    const signed = clamp((u - 0.32) / 0.26) * 1.3;
    const gone = f.still ? 0 : ease((u - 0.64) / 0.24);
    const seg = Math.max(20, Math.round(46 * f.q));

    deck(f, { y: FLOOR, alpha: 0.09 });
    pool(f, [0, FLOOR, 0], 2.5, pal.key, 0.16 * f.boot);

    // ── the desk
    const deskOn = f.on(0, 0.45);
    for (const [x, z] of [[-DX + 0.1, DZ1 - 0.1], [DX - 0.1, DZ1 - 0.1], [-DX + 0.1, DZ0 + 0.1], [DX - 0.1, DZ0 + 0.1]]) f.line([x, -THICK, z], [x, FLOOR, z], pal.ink, 0.3 * deskOn, 2);
    slab(f, [-DX, -THICK, DZ0], [DX, 0, DZ1], pal.ink, 0.09, deskOn);
    f.line([-DX, 0, DZ0], [DX, 0, DZ0], pal.key, 0.5 * deskOn, 1.25);

    // an inkwell, and the foot of the lamp
    const thingsOn = f.on(0.25, 0.4);
    const well: V3 = [-1.28, 0, -0.3];
    ring(f, well, 0.085, { colour: pal.ink, alpha: 0.5 * thingsOn, seg: 20 });
    ring(f, [well[0], 0.1, well[2]], 0.085, { colour: pal.ink, alpha: 0.6 * thingsOn, seg: 20 });
    for (const e of [-0.085, 0.085]) f.line([well[0] + e, 0, well[2]], [well[0] + e, 0.1, well[2]], pal.ink, 0.5 * thingsOn, 1);
    f.dot([well[0], 0.1, well[2]], 0.045, pal.gold, 0.5 * thingsOn);
    const base: V3 = [-1.28, 0, 0.55];
    ring(f, base, 0.12, { colour: pal.ink, alpha: 0.55 * thingsOn, seg: 24 });
    pool(f, [WRITE[0] - 0.05, 0.004, WRITE[2] + 0.1], 0.85, pal.key, 0.22 * thingsOn);

    // ── what is written on a page: its lines, and the flourish at its foot
    let tipU = -1;
    let tipV = 0;
    const near = f.near([WRITE[0], 0, WRITE[2]], 150);
    const page = (at: At, a: number, done: number, sig: number, live: boolean) => {
      const ink = a * (live ? 0.85 + 0.15 * near : 1);
      const stroke = (u0: number, v: number, len: number, order: number, colour: string, alpha: number, width: number) => {
        const d = clamp(done - order);
        if (d <= 0) return;
        f.line(at(u0, v), at(u0 + len * d, v), colour, alpha * ink, Math.max(0.6, width * k));
        if (live && d < 1) {
          tipU = u0 + len * d;
          tipV = v;
        }
      };
      stroke(0.1, 0.9, 0.36, 0, pal.ink, 0.9, 2.6);
      stroke(0.1, 0.83, 0.8, 0.4, pal.ink, 0.22, 1);
      for (let r = 0; r < 4; r++) stroke(0.1, 0.72 - r * 0.1, 0.8 * (r === 3 ? 0.45 : s.widths[(n + r) % s.widths.length]), 0.6 + r, pal.ink2, 0.75, 1.4);
      // the rule to sign on
      f.line(at(0.38, 0.1), at(0.92, 0.1), pal.ink, 0.3 * ink, 1);
      if (sig > 0) {
        const pts: V3[] = [];
        const upto = Math.round(seg * (sig / 1.3));
        for (let i = 0; i <= upto; i++) {
          const g = (i / seg) * 1.3;
          pts.push(at(...flourish(g)));
        }
        const [hu, hv] = flourish(sig);
        pts.push(at(hu, hv));
        f.path(pts, pal.gold, 0.16 * ink, 4.5 * k);
        f.path(pts, pal.gold, 0.95 * ink, Math.max(0.9, 1.7 * k));
        if (live && sig < 1.3) {
          tipU = hu;
          tipV = hv;
        }
      }
    };

    // ── the pile: fanned, the newest on top; each page moves one place down as another arrives
    const kept = m ? 4 : 6;
    const pileOn = f.on(0.4, 0.4);
    const fan = 0.16 + 0.1 * f.hover;
    const place = (j: number): [V3, number, number] => [[PILE[0], PILE[1] + (kept - j) * 0.012, PILE[2]], -0.3 + j * fan, clamp(kept - j) * lerp(1, 0.55, clamp(j / kept))];
    for (let j = kept - 1; j >= 0; j--) {
      const [c, yaw, a] = place(j + gone);
      const at = lying(c, yaw);
      paper(f, at, a * pileOn);
      if (m && j > 1) continue;
      const ink = a * pileOn;
      f.line(at(0.1, 0.9), at(0.46, 0.9), pal.ink, 0.8 * ink, Math.max(0.6, 2.2 * k));
      // (the lines it was written with, when it was the page on the desk)
      for (let r = 0; r < 4; r++) f.line(at(0.1, 0.72 - r * 0.1), at(0.1 + 0.8 * (r === 3 ? 0.45 : s.widths[(n - 1 - j + r + 100) % s.widths.length]), 0.72 - r * 0.1), pal.ink2, 0.6 * ink, 1);
      const hand: V3[] = [];
      for (let i = 0; i <= 18; i++) hand.push(at(...flourish((i / 18) * 1.3)));
      f.path(hand, pal.gold, 0.8 * ink, Math.max(0.7, 1.2 * k));
    }

    // ── the page being written; signed, it lifts off the desk and comes down on the pile
    const sheetOn = f.on(0.3, 0.4);
    if (gone > 0) {
      // a clean one is already in its place
      paper(f, lying(WRITE, 0), ease((u - 0.8) / 0.2) * sheetOn);
      const [c, yaw] = place(0);
      const fly: V3 = [lerp(WRITE[0], c[0], gone), lerp(WRITE[1], c[1], gone) + Math.sin(Math.PI * gone) * 0.34, lerp(WRITE[2], c[2], gone)];
      const at = lying(fly, yaw * gone);
      paper(f, at, sheetOn);
      page(at, sheetOn, 9, 1.3, false);
    } else {
      const at = lying(WRITE, 0);
      paper(f, at, sheetOn);
      page(at, sheetOn, lines, signed, true);
    }

    // ── the pen: where the writing is, or lifted and waiting at the head of the next page
    const writing = gone <= 0 && tipU >= 0;
    // (between two strokes it stays where it is; it goes back only when the page has gone)
    const want: [number, number] = writing ? [tipU, tipV] : gone > 0 ? [0.1, 0.9] : [s.pen[0], s.pen[1]];
    const glide = composed ? 1 : clamp(f.dt * 10);
    s.pen[0] += (want[0] - s.pen[0]) * glide;
    s.pen[1] += (want[1] - s.pen[1]) * glide;
    const down = lying(WRITE, 0)(s.pen[0], s.pen[1]);
    const tip: V3 = [down[0], down[1] + 0.004 + 0.09 * Math.sin(Math.PI * gone), down[2]];
    const cap: V3 = [tip[0] + 0.16, tip[1] + 0.42, tip[2] + 0.1];
    const along = (g: number): V3 => [lerp(tip[0], cap[0], g), lerp(tip[1], cap[1], g), lerp(tip[2], cap[2], g)];
    if (writing) f.glow(tip, 0.15, pal.gold, 0.6 * sheetOn);
    f.line(along(0.2), cap, pal.ink2, 0.85 * sheetOn, Math.max(2, 3.2 * k));
    f.line(along(0.2), along(0.27), pal.key, 0.9 * sheetOn, Math.max(2, 3.2 * k));
    f.line(tip, along(0.2), pal.gold, 0.95 * sheetOn, Math.max(1.5, 2.4 * k));
    f.dot(tip, 0.01, pal.ink, 0.95 * sheetOn);

    // ── the lamp over the page
    const head: V3 = [-0.92, 0.7, 0.3];
    f.path([base, [-1.36, 0.5, 0.6], head], pal.ink, 0.55 * thingsOn, 2);
    f.dot([-1.36, 0.5, 0.6], 0.02, pal.ink, 0.7 * thingsOn);
    const shade: V3[] = [[head[0] - 0.05, head[1] + 0.03, head[2] + 0.03], [head[0] + 0.24, head[1] - 0.06, head[2] - 0.14], [head[0] - 0.03, head[1] - 0.2, head[2] - 0.2]];
    f.fill(shade, pal.bg, 0.9 * thingsOn);
    f.fill(shade, pal.key, 0.2 * thingsOn);
    f.path(shade, pal.key, 0.75 * thingsOn, 1.25, true);
    lamp(f, [head[0] + 0.08, head[1] - 0.13, head[2] - 0.14], pal.key, 0.8 * thingsOn, 0.018);

    // ── the nameplate at the front of the desk
    const plateOn = f.on(0.6, 0.4);
    const warm = f.near([(N0 + N1) / 2, NH / 2, NZ0], 110);
    const plate: V3[] = [[N0, 0, NZ0], [N1, 0, NZ0], [N1, NH, NZ1], [N0, NH, NZ1]];
    f.fill(plate, pal.bg, 0.95 * plateOn);
    f.fill(plate, pal.gold, (0.1 + 0.14 * warm) * plateOn);
    f.path(plate, pal.gold, (0.7 + 0.3 * warm) * plateOn, 1.25, true);
    const mid: V3 = [(N0 + N1) / 2, NH / 2, (NZ0 + NZ1) / 2];
    const [left, right] = [f.P(N0, NH / 2, NZ0), f.P(N1, NH / 2, NZ0)];
    if (s.name && left && right) {
      // the name is set to the width of the plate
      const room = Math.abs(right.x - left.x) * 0.84;
      const size = clamp(room / (s.name.length * 0.74), 6, m ? 10 : 12);
      ctx.save();
      ctx.letterSpacing = "1px";
      f.label(s.name, mid, { align: "center", size, colour: pal.gold, alpha: plateOn * f.on(0.8, 0.2), weight: 700 });
      ctx.restore();
    } else {
      f.line([N0 + 0.2, NH / 2, (NZ0 + NZ1) / 2], [N1 - 0.2, NH / 2, (NZ0 + NZ1) / 2], pal.gold, 0.85 * plateOn, Math.max(1.5, 3 * k));
    }
  },
};

export default scene;
