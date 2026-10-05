/**
 * SEARCHLIGHT — a question, and a beam that goes along the shelves with it.
 *
 * Two shelves of sheets stand one above the other: the posts. Under them is
 * the line a search is typed on, and it is typed, a bar for a word, with a
 * caret after the last. Then a lamp overhead swings its beam along the shelves
 * from one end to the other. Every sheet the beam crosses lifts a little off
 * its shelf while it is looked at. Most settle back as they were; the ones
 * that answer stay lit, in champagne, with a point of light over each. When
 * the beam has reached the far end they stand for a while, and the line is
 * cleared for the next question.
 *
 * A reading lens rests at the end of the search line, as the mark of a search
 * does.
 *
 * Which sheets answer changes from one question to the next and is drawn from
 * the page's own noise: nothing here is a result, and nothing can be read.
 *
 * The pointer picks the lens up. It follows the hand, and the sheets under it
 * come up larger, with their lines clear.
 */
import { TAU, clamp, lerp, rgba, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring } from "../kit";

const FLOOR = -1.2;
/** the two shelves: the height of each and how far back it stands; the upper first */
const SHELF: readonly (readonly [number, number])[] = [[0.42, 0.3], [-0.2, 0]];
/** a sheet: its width, its height, and how far it is turned on the shelf */
const [SW, SH, TURNED] = [0.2, 0.44, 0.5];
const [CT, ST] = [Math.cos(TURNED), Math.sin(TURNED)];
/** the lamp overhead, and how far to either side its beam is carried */
const LAMP: V3 = [0, 1.2, -0.15];
const REACH = 1.75;
/** the search line: its ends, its middle height, half its height, how far forward it lies */
const [Q0, Q1, QY, QH, QZ] = [-0.98, 0.72, -0.9, 0.1, -0.3];
/** where the lens rests */
const REST: V3 = [0.98, QY, QZ];
/** seconds for one search: typed, swept, read, cleared */
const CYCLE = 18;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

type State = { widths: number[] };

const scene: Scene<State> = {
  // the composed still: the beam half way along, the answers behind it lit
  pose: CYCLE * 0.56,
  setup(f) {
    return { widths: Array.from({ length: 16 }, (_, i) => 0.45 + 0.55 * f.rnd(i + 12)) };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.1 + (f.still ? 0 : Math.sin(t * 0.07) * 0.03), -0.1, 6.4, m ? 0.9 : 0.95);
    const k = clamp(f.u / 110, 0.6, 1.3);

    const turn = t / CYCLE;
    const n = Math.floor(turn);
    const u = turn - n;
    const typed = clamp(u / 0.16);
    const sweep = clamp((u - 0.2) / 0.6);
    const beam = ease((u - 0.17) / 0.05) * (1 - ease((u - 0.8) / 0.06));
    // the last moments: the answers go out and the line is cleared
    const kept = f.still ? 1 : 1 - ease((u - 0.94) / 0.06);
    const bx = lerp(-REACH, REACH, sweep);

    deck(f, { y: FLOOR, alpha: 0.09 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.18 * f.boot);

    // ── the lamp and its beam
    const lampOn = f.on(0.1, 0.4);
    f.line(LAMP, [LAMP[0], LAMP[1] + 0.16, LAMP[2]], pal.ink, 0.4 * lampOn, 1.5);
    ring(f, LAMP, 0.09, { colour: pal.ink, alpha: 0.5 * lampOn, seg: 20 });
    const foot = SHELF[1][0] - 0.03;
    for (const [wide, a] of [[0.3, 0.05], [0.13, 0.07]] as const) f.fill([LAMP, [bx - wide, foot, 0.15], [bx + wide, foot, 0.15]], pal.key, a * beam * lampOn);
    f.line(LAMP, [bx, foot, 0.15], pal.key, 0.25 * beam * lampOn, 1);
    lamp(f, LAMP, pal.key, (0.35 + 0.65 * beam) * lampOn, 0.022);

    // ── the shelves and the sheets on them
    const per = m ? 7 : Math.max(8, Math.round(11 * f.q));
    SHELF.forEach(([y0, z], row) => {
      const on = f.on(0.15 + row * 0.15, 0.45);
      if (on <= 0) return;
      const plank: V3[] = [[-1.66, y0, z - 0.1], [1.66, y0, z - 0.1], [1.66, y0, z + 0.1], [-1.66, y0, z + 0.1]];
      f.fill(plank, pal.bg, 0.6 * on);
      f.fill(plank, pal.ink, 0.04 * on);
      f.line(plank[3], plank[2], pal.ink, 0.2 * on, 1);
      for (let i = 0; i < per; i++) {
        const x = lerp(-1.46, 1.46, (i + 0.5) / per) + (row ? 0.05 : -0.05);
        const answers = f.rnd(i * 13 + row * 101 + (n % 6) * 7) < 0.3;
        // the beam is on it; it has been crossed and it answers; the lens is over it
        const looked = Math.exp(-(((bx - x) / 0.3) ** 2)) * beam;
        const lit = answers ? clamp((bx - x) / 0.2 + 0.5) * clamp(sweep * 40) * kept : 0;
        const lens = f.near([x, y0 + SH / 2, z], 62);
        const grow = 1 + 0.24 * lens;
        const lift = 0.06 * looked + 0.04 * lit + 0.04 * lens;
        const [w, h] = [SW * grow, SH * grow];
        const at = (cu: number, v: number): V3 => [x + (cu - 0.5) * w * CT, y0 + lift + v * h, z - 0.03 * lens + (cu - 0.5) * w * ST];
        const quad: V3[] = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
        const read = Math.max(looked, lit, lens);
        f.fill(quad, pal.bg, 0.94 * on);
        f.fill(quad, pal.ink, 0.05 * on);
        f.fill(quad, pal.key, 0.1 * Math.max(looked, lens) * on);
        f.fill(quad, pal.gold, 0.14 * lit * on);
        f.path(quad, pal.ink, 0.3 * on * (1 - lit), 1, true);
        f.path(quad, pal.key, 0.6 * Math.max(looked, lens) * on * (1 - lit), 1, true);
        f.path(quad, pal.gold, 0.9 * lit * on, 1.25, true);
        // its lines: a title and a few of text, clearer while it is read
        const ink = (0.35 + 0.6 * read) * on;
        f.line(at(0.14, 0.82), at(0.14 + 0.6 * s.widths[(i + row * 5) % s.widths.length], 0.82), pal.ink, ink * (1 - lit), Math.max(0.7, 1.8 * k));
        f.line(at(0.14, 0.82), at(0.14 + 0.6 * s.widths[(i + row * 5) % s.widths.length], 0.82), pal.gold, ink * lit, Math.max(0.7, 1.8 * k));
        if (!m || read > 0.2) for (let r = 0; r < 3; r++) f.line(at(0.14, 0.62 - r * 0.15), at(0.14 + 0.72 * s.widths[(i * 3 + r + row) % s.widths.length], 0.62 - r * 0.15), pal.ink2, ink * 0.8, 1);
        if (lit > 0.02) lamp(f, at(0.5, 1.14), pal.gold, lit * on, 0.012);
      }
      f.line(plank[0], plank[1], pal.key, 0.45 * on, 1.25);
    });

    // ── the line the search is typed on: a bar for a word, and a caret
    const lineOn = f.on(0.5, 0.4);
    const field: V3[] = [[Q0, QY - QH, QZ], [Q1, QY - QH, QZ], [Q1, QY + QH, QZ], [Q0, QY + QH, QZ]];
    f.fill(field, pal.bg, 0.9 * lineOn);
    f.fill(field, pal.ink, 0.04 * lineOn);
    f.path(field, pal.ink, 0.4 * lineOn, 1, true);
    f.line(field[0], field[1], pal.gold, 0.7 * lineOn, 1.25);
    const words = 4 + (n % 3);
    let x = Q0 + 0.1;
    for (let j = 0; j < words; j++) {
      const len = 0.1 + 0.14 * s.widths[(n * 3 + j) % s.widths.length];
      const d = clamp(typed * words - j) * kept;
      if (d > 0) f.line([x, QY, QZ], [x + len * d, QY, QZ], pal.gold, 0.95 * lineOn, Math.max(1.5, 4 * k));
      x += len * clamp(typed * words - j) + (typed * words > j ? 0.05 : 0);
    }
    f.line([x, QY - QH * 0.55, QZ], [x, QY + QH * 0.55, QZ], pal.ink, (0.55 + (f.still ? 0 : 0.25 * Math.sin(t * 1.6))) * kept * lineOn, 1.25);

    // ── the lens: at rest at the end of the line, and in the hand while the pointer is here
    const rest = f.P(...REST);
    if (rest && lineOn > 0.01) {
      const held = f.hover * f.hover * (3 - 2 * f.hover);
      const lx = lerp(rest.x, f.mx, held);
      const ly = lerp(rest.y, f.my, held);
      const r = Math.max(5, f.u * lerp(0.1, 0.24, held));
      const glass = ctx.createRadialGradient(lx - r * 0.3, ly - r * 0.35, 0, lx, ly, r);
      glass.addColorStop(0, rgba(pal.key, 0.16 * lineOn));
      glass.addColorStop(1, rgba(pal.key, 0.03 * lineOn));
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.arc(lx, ly, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.ink, 0.85 * lineOn);
      ctx.lineWidth = Math.max(1.25, 2 * k);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx, ly, r * 0.72, Math.PI * 1.05, Math.PI * 1.45);
      ctx.strokeStyle = rgba(pal.ink, 0.4 * lineOn);
      ctx.lineWidth = 1;
      ctx.stroke();
      // its handle
      ctx.beginPath();
      ctx.moveTo(lx + r * 0.71, ly + r * 0.71);
      ctx.lineTo(lx + r * 1.35, ly + r * 1.35);
      ctx.strokeStyle = rgba(pal.gold, 0.9 * lineOn);
      ctx.lineWidth = Math.max(2, 3.5 * k);
      ctx.stroke();
    }
  },
};

export default scene;
