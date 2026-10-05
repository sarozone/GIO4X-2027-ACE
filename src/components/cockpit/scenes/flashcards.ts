/**
 * FLASHCARDS — a term, its meaning, and when it comes round again.
 *
 * Five open boxes stand in a row, and each holds a few cards. A card comes up
 * out of one of them and stands in front of the visitor: one heavy stroke, the
 * term. It turns over, and its other side carries the lines of the meaning and
 * a mark: a tick if it was known, an open ring if it was not. A known card
 * goes on to the next box along, where it will be asked for later; one that
 * was not known falls back to the first box, to be asked for soon. Under each
 * box lies a rule, longer from box to box: the wait before its cards return.
 *
 * Strokes are not words. Which cards are known is a fixed pattern that means
 * nothing, and the boxes hold a drawing of a deck, not anybody's progress.
 *
 * The pointer turns the card over, to whichever side is not showing, and the
 * box under it lights and offers up its cards.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { arc, deck, lamp, pool, trace } from "../kit";

/** seconds for one card: drawn, read, turned, put away */
const CYCLE = 12;
const N = 5;
const FLOOR = -1.05;
/** a box: its width, its height, its depth */
const [BW, BH, BD] = [0.46, 0.24, 0.34];
/** where the card stands to be read, and its size there */
const CARD: V3 = [0, 0.42, -0.12];
const [CW, CH] = [1.36, 0.86];
/** the size of a card in its box, as a share of that */
const SMALL = 0.27;
/** which box each card is drawn from, and whether it is known */
const DEAL: readonly (readonly [number, boolean])[] = [[0, true], [1, true], [2, false], [0, true], [3, true], [1, false], [2, true], [4, true]];
/** cards standing in each box */
const HELD = [5, 4, 3, 3, 2];

const boxX = (i: number) => -1.4 + i * 0.7;
/** the mouth of a box, where a card leaves it and enters it */
const slot = (i: number): V3 => [boxX(i), FLOOR + BH + 0.1, 0];
const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

type State = { widths: number[] };

const scene: Scene<State> = {
  // the composed still: the card turned over and marked, before it is put away
  pose: CYCLE * 0.68,
  setup(f) {
    return { widths: Array.from({ length: 12 }, (_, i) => 0.55 + 0.45 * f.rnd(i + 20)) };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(-0.1 + (f.still ? 0 : Math.sin(f.t * 0.08) * 0.03), -0.2, 6.4, m ? 0.9 : 0.95);

    const turn = f.t / CYCLE;
    const n = Math.floor(turn);
    const u = turn - n;
    const [from, known] = DEAL[n % DEAL.length];
    const to = known ? Math.min(N - 1, from + 1) : 0;
    const rise = ease(u / 0.16);
    const flip = ease((u - 0.4) / 0.14);
    const judged = clamp((u - 0.58) / 0.08);
    const leave = f.still ? 0 : ease((u - 0.76) / 0.24);
    // stroke weights follow the size of the frame
    const k = clamp(f.u / 110, 0.6, 1.3);
    const tones = [pal.ink2, pal.indigo, pal.blue, pal.teal, pal.emerald];

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.2 * f.boot);

    // ── the ways a card can go: on to the next box, or back to the first
    const waysOn = f.on(0.5, 0.4);
    const seg = Math.max(8, Math.round(14 * f.q));
    for (let i = 0; i < N - 1; i++) f.path(arc(slot(i), slot(i + 1), 0.14, seg), pal.ink, 0.13 * waysOn, 1);
    const decided = judged * (1 - leave) * waysOn;
    if (from !== to) trace(f, arc(slot(from), slot(to), known ? 0.14 : 0.3, seg), known ? pal.key : pal.crimson, 0.8 * decided, 1.25, f.t / 2.4);

    // ── the boxes, their cards and the wait under each
    const cap = m ? 3 : 5;
    for (let i = 0; i < N; i++) {
      const x = boxX(i);
      const on = f.on(0.1 + i * 0.1, 0.4);
      if (on <= 0) continue;
      const tone = tones[i];
      const touch = f.near([x, FLOOR + BH / 2, 0], 80);
      // the box a card is on its way to warms before the card arrives
      const warm = Math.max(touch, i === to ? judged * 0.7 : 0);
      const [x0, x1, top] = [x - BW / 2, x + BW / 2, FLOOR + BH];
      const rim: V3[] = [[x0, top, -BD / 2], [x1, top, -BD / 2], [x1, top, BD / 2], [x0, top, BD / 2]];
      f.fill(rim, pal.bg, 0.7 * on);
      f.path(rim, tone, 0.35 * on, 1, true);

      const held = Math.min(cap, HELD[i]);
      for (let j = 0; j < held; j++) {
        const z = lerp(BD / 2 - 0.05, -BD / 2 + 0.07, held > 1 ? j / (held - 1) : 0.5);
        const y = top + 0.04 + 0.03 * f.rnd(i * 9 + j) + 0.08 * touch;
        const q: V3[] = [[x - 0.17, FLOOR + 0.02, z], [x + 0.17, FLOOR + 0.02, z], [x + 0.17, y, z], [x - 0.17, y, z]];
        f.fill(q, pal.bg, 0.92 * on);
        f.fill(q, pal.ink, 0.05 * on);
        f.path(q, pal.ink, 0.26 * on, 1, true);
        f.line(q[3], q[2], tone, 0.65 * on, 1);
      }

      const front: V3[] = [[x0, FLOOR, -BD / 2], [x1, FLOOR, -BD / 2], [x1, top, -BD / 2], [x0, top, -BD / 2]];
      f.fill(front, pal.bg, 0.94 * on);
      f.fill(front, tone, 0.1 * on);
      f.fill(front, pal.gold, 0.12 * warm * on);
      f.path(front, tone, 0.5 * on * (1 - warm), 1, true);
      f.path(front, pal.gold, 0.9 * on * warm, 1.25, true);
      // a label holder on its face, ruled
      f.line([x - 0.09, FLOOR + BH * 0.55, -BD / 2], [x + 0.09, FLOOR + BH * 0.55, -BD / 2], warm > 0.4 ? pal.gold : tone, 0.7 * on, Math.max(1, 2 * k));

      // the wait before its cards come round again: longer from box to box
      const wait = 0.035 + 0.04 * i;
      const zf = -BD / 2 - 0.14;
      f.line([x - wait, FLOOR, zf], [x + wait, FLOOR, zf], tone, 0.75 * on, 1.5);
      for (const e of [-wait, wait]) f.line([x + e, FLOOR, zf - 0.03], [x + e, FLOOR, zf + 0.03], tone, 0.75 * on, 1);
      if (i === to && leave > 0.6) lamp(f, slot(i), known ? pal.key : pal.crimson, (leave - 0.6) * 2.5 * (1 - leave) * 4 * on, 0.016);
    }
    const named = f.on(0.85, 0.15);
    f.label("SOON", [boxX(0), FLOOR, -BD / 2 - 0.14], { align: "center", dy: 12, size: m ? 8 : 10, colour: pal.ink2, alpha: 0.8 * named });
    f.label("LATER", [boxX(N - 1), FLOOR, -BD / 2 - 0.14], { align: "center", dy: 12, size: m ? 8 : 10, colour: pal.ink2, alpha: 0.8 * named });

    // ── the card: up out of its box, read, turned over, and away to the box it has earned
    const [a, b] = [slot(from), slot(to)];
    const way = leave > 0 ? leave : 1 - rise;
    const end = leave > 0 ? b : a;
    const c: V3 = [lerp(CARD[0], end[0], way), lerp(CARD[1], end[1], way) + Math.sin(Math.PI * way) * 0.16, lerp(CARD[2], end[2], way)];
    const size = lerp(1, SMALL, way);
    // the pointer turns it to the side that is not showing
    const theta = Math.PI * (flip + ease(f.hover));
    const [ct, st] = [Math.cos(theta), Math.sin(theta)];
    const front = ct >= 0;
    const at = (cu: number, v: number): V3 => {
      const lx = (cu - 0.5) * CW * size;
      return [c[0] + lx * ct, c[1] + (v - 0.5) * CH * size, c[2] + lx * st];
    };
    /** a place on the side that faces the visitor, read from its own left */
    const face = (cu: number, v: number): V3 => at(front ? cu : 1 - cu, v);
    // (it leaves its box, and enters the next, without appearing or going at once)
    const cardOn = f.on(0.3, 0.4) * clamp(u / 0.04) * lerp(1, 0.15, leave * leave);
    // what is written fades as the card comes edge-on
    const ink = cardOn * clamp(Math.abs(ct) * 3 - 0.3);
    const sk = k * size;
    const quad: V3[] = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
    f.fill(quad, pal.bg, 0.95 * cardOn);
    f.fill(quad, pal.ink, 0.05 * cardOn);
    f.path(quad, pal.ink, 0.36 * cardOn, 1, true);
    f.line(at(0, 1), at(1, 1), front ? pal.gold : pal.key, 0.8 * cardOn, 1.25);
    const bar = (u0: number, v: number, len: number, colour: string, alpha: number, width: number) => f.line(face(u0, v), face(u0 + len, v), colour, alpha * ink, Math.max(0.6, width * sk));
    if (front) {
      // the term: one stroke, in champagne
      const len = 0.3 + 0.32 * s.widths[n % s.widths.length];
      bar(0.08, 0.86, 0.12, pal.ink2, 0.7, 1.6);
      bar(0.5 - len / 2, 0.52, len, pal.gold, 0.95, 4.5);
      bar(0.32, 0.36, 0.36, pal.ink, 0.25, 1);
    } else {
      // the meaning, a line at a time, and the mark
      bar(0.08, 0.84, 0.26, pal.gold, 0.85, 2.4);
      bar(0.08, 0.75, 0.84, pal.ink, 0.2, 1);
      const rows = m ? 3 : 4;
      for (let r = 0; r < rows; r++) bar(0.08, 0.62 - r * (0.42 / rows), 0.8 * (r === rows - 1 ? 0.5 : s.widths[(n * 3 + r) % s.widths.length]), pal.ink2, 0.75, 1.5);
      const mark = judged * ink;
      const [mu, mv, mr] = [0.86, 0.85, 0.055];
      const round = (turnAt: number): V3 => face(mu + (Math.cos(turnAt * TAU) * mr) / CW, mv + (Math.sin(turnAt * TAU) * mr) / CH);
      if (known) {
        f.path([round(0.47), face(mu - 0.012, mv - 0.045), round(0.13)], pal.key, mark, Math.max(1, 2.2 * sk));
      } else {
        const open: V3[] = [];
        for (let i = 0; i <= 12; i++) open.push(round(0.2 + (i / 12) * 0.78));
        f.path(open, pal.crimson, mark, Math.max(1, 1.8 * sk));
      }
    }
    if (way < 0.05 && cardOn > 0) f.glow([c[0], c[1], c[2]], 1.1, pal.key, 0.07 * cardOn);
  },
};

export default scene;
