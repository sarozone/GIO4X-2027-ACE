/**
 * PLANNER — a trading plan, written down and printed.
 *
 * A drafting board leans back on its trestle with one sheet taped to it, and
 * the sheet is a form in four parts. A stylus fills them in order while the
 * board's straightedge follows it down the page. First the rules, a line at a
 * time, each ticked as it is settled. Then the risk bracket: where a trade is
 * entered, where it is given up, and the measure between the two. Then the
 * daily stop, a bar with one mark on it that the day does not go past. Then
 * the routine, a clock face with the parts of the day that are kept. Last, a
 * line to sign on. Each part earns its mark as it is finished, and when the
 * sheet is whole a second copy comes out of the printer beside the board.
 *
 * The pointer reads the plan: the part under it is framed and lit.
 *
 * The form holds strokes and marks. No rule can be read, the bracket and the
 * bar have no scale and the clock has no hours: the plan on the page below is
 * the visitor's own.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { arc, deck, lamp, pool, slab, trace } from "../kit";

const FLOOR = -1.2;
/** the board: its centre, its width and height, and how far it leans back */
const BOARD: V3 = [-0.32, 0, 0.1];
const [BW, BH, LEAN] = [1.96, 1.72, 0.5];
const [CL, SL] = [Math.cos(LEAN), Math.sin(LEAN)];
/** the sheet on it, in the board's own measure: left, bottom, width, height */
const [SU, SV, SW, SH] = [0.07, 0.06, 0.86, 0.89];
/** a length up the sheet, as the share of its width that looks the same: a circle drawn with it is round */
const SQUARE = (SH * BH) / (SW * BW);
/** the four parts of the form: left, bottom, right, top */
const PARTS: readonly (readonly [number, number, number, number])[] = [
  [0.05, 0.45, 0.49, 0.84],
  [0.55, 0.45, 0.95, 0.84],
  [0.05, 0.1, 0.49, 0.39],
  [0.55, 0.1, 0.95, 0.39],
];
/** when each part is begun and finished, in steps of the writing */
const BEGUN = [0.7, 2.6, 3.8, 4.8];
const DONE = [2.6, 3.8, 4.8, 6.1];
const STEPS = 7;
/** the printer: its near left corner, its far right one, the slot, the length of a page */
const [PX0, PX1, PZ0, PZ1, SLOT, PAGE] = [0.98, 1.7, 0.15, 0.62, FLOOR + 0.12, 0.72];
/** seconds for one plan: written, printed, cleared */
const CYCLE = 22;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** board-local to world: u, v in 0..1 from the bottom-left corner, `lift` off its face */
const board = (u: number, v: number, lift = 0): V3 => {
  const ly = (v - 0.5) * BH;
  return [BOARD[0] + (u - 0.5) * BW, BOARD[1] + ly * CL + lift * SL, BOARD[2] + ly * SL - lift * CL];
};
/** the same for the sheet taped to it */
const sheet = (u: number, v: number, lift = 0.012): V3 => board(SU + SW * u, SV + SH * v, lift);

/** is the pointer on this quad, as the camera sees it? */
function under(f: Frame, q: readonly V3[]): boolean {
  let side = 0;
  for (let i = 0; i < q.length; i++) {
    const a = f.P(...q[i]);
    const b = f.P(...q[(i + 1) % q.length]);
    if (!a || !b) return false;
    const c = (b.x - a.x) * (f.my - a.y) - (b.y - a.y) * (f.mx - a.x);
    if (c === 0) continue;
    if (side && c > 0 !== side > 0) return false;
    side = c > 0 ? 1 : -1;
  }
  return side !== 0;
}

type State = { lit: number[]; edge: number; pen: [number, number]; widths: number[] };

const scene: Scene<State> = {
  // the composed still: the plan whole, its copy out
  pose: CYCLE * 0.92,
  setup(f) {
    return { lit: [0, 0, 0, 0], edge: 0.04, pen: [0.05, 0.935], widths: Array.from({ length: 8 }, (_, i) => 0.6 + 0.4 * f.rnd(i + 60)) };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const composed = f.still || f.dt === 0;
    f.aim(0.2 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.035), -0.2, 6.4, m ? 0.9 : 0.95);

    const turn = (f.t / CYCLE) % 1;
    const p = clamp(turn / 0.68) * STEPS;
    const printed = ease((turn - 0.7) / 0.2);
    // the last moments: the sheet is cleared for the next plan
    const fade = f.still ? 1 : 1 - ease((turn - 0.95) / 0.05);
    // stroke weights follow the size of the frame
    const k = clamp(f.u / 110, 0.6, 1.3);
    const tones = [pal.teal, pal.crimson, pal.key, pal.indigo];

    // ── which part the pointer is on; its light eases in and out
    const quads = PARTS.map(([u0, v0, u1, v1]): V3[] => [sheet(u0, v0), sheet(u1, v0), sheet(u1, v1), sheet(u0, v1)]);
    const rate = clamp(f.dt * 7);
    for (let i = 0; i < 4; i++) {
      const want = f.hover > 0 && under(f, quads[i]) ? f.hover : 0;
      s.lit[i] = composed ? 0 : s.lit[i] + (want - s.lit[i]) * rate;
    }

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0.1, FLOOR, 0], 2.4, pal.key, 0.2 * f.boot);

    // ── the trestle: a leg behind and a leg in front on each side, tied at the floor
    const boardOn = f.on(0, 0.4);
    for (const u of [0.1, 0.9]) {
      const foot = board(u, 0.02, -0.03);
      const back = board(u, 0.8, -0.03);
      f.line(back, [back[0], FLOOR, 1.0], pal.ink, 0.26 * boardOn, 1.5);
      f.line(foot, [foot[0], FLOOR, foot[2]], pal.ink, 0.26 * boardOn, 1.5);
      f.line([foot[0], FLOOR, foot[2]], [back[0], FLOOR, 1.0], pal.ink, 0.16 * boardOn, 1);
    }

    // ── the board: smoked glass, a lit top edge, a ledge along the bottom
    const face: V3[] = [board(0, 0), board(1, 0), board(1, 1), board(0, 1)];
    f.fill(face, pal.bg, 0.93 * boardOn);
    f.fill(face, pal.ink, 0.03 * boardOn);
    f.path(face, pal.ink, 0.22 * boardOn, 1, true);
    f.line(board(0, 1), board(1, 1), pal.key, 0.6 * boardOn, 1.25);
    f.path([board(0, 0), board(0, 0, 0.07), board(1, 0, 0.07), board(1, 0)], pal.key, 0.45 * boardOn, 1.25);

    // ── the sheet, taped at its corners
    const sheetOn = f.on(0.2, 0.4);
    const paper: V3[] = [sheet(0, 0), sheet(1, 0), sheet(1, 1), sheet(0, 1)];
    f.fill(paper, pal.ink, 0.055 * sheetOn);
    f.path(paper, pal.ink, 0.34 * sheetOn, 1, true);
    for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]] as const) {
      const du = u ? -0.035 : 0.035;
      const dv = v ? -0.04 : 0.04;
      f.line(sheet(u + du, v - dv * 0.4), sheet(u - du * 0.4, v + dv), pal.ink2, 0.5 * sheetOn, 3 * k);
    }

    const ink = sheetOn * fade;
    // where the stylus is at this moment, found while the sheet is drawn
    let penU = -1;
    let penV = 0;
    /** one stroke, drawn from its first end to its second in its turn */
    const stroke = (u0: number, v0: number, u1: number, v1: number, order: number, colour: string, alpha: number, width: number, span = 0.4) => {
      const d = clamp((p - order) / span);
      if (d <= 0 || alpha <= 0) return;
      const u = lerp(u0, u1, d);
      const v = lerp(v0, v1, d);
      f.line(sheet(u0, v0), sheet(u, v), colour, clamp(alpha) * ink, Math.max(0.6, width * k));
      if (d < 1) {
        penU = u;
        penV = v;
      }
    };
    /** a small tick, as a hand makes it */
    const tick = (u: number, v: number, size: number, colour: string, alpha: number) => {
      if (alpha <= 0.003) return;
      f.path([sheet(u - size, v), sheet(u - size * 0.3, v - size * 0.8 * SQUARE), sheet(u + size, v + size * SQUARE)], colour, alpha * ink, Math.max(0.8, 1.6 * k));
    };

    // the title and its rule
    stroke(0.05, 0.935, 0.44, 0.935, 0, f.tag ? pal.gold : pal.ink, 0.92, 3);
    stroke(0.05, 0.885, 0.95, 0.885, 0.3, pal.ink, 0.25, 1);

    // ── the four parts: each a ruled box with a heading, framed in light under the pointer
    for (let i = 0; i < 4; i++) {
      const [u0, v0, u1, v1] = PARTS[i];
      const l = s.lit[i];
      const shown = clamp((p - BEGUN[i] + 0.4) / 0.4);
      f.fill(quads[i], pal.key, 0.08 * l * ink);
      f.path(quads[i], l > 0.02 ? pal.key : pal.ink, (0.12 * shown + 0.6 * l) * ink, 1, true);
      stroke(u0 + 0.02, v1 - 0.04, u0 + 0.14, v1 - 0.04, BEGUN[i] - 0.1, l > 0.4 ? pal.gold : tones[i], 0.85, 2.2, 0.2);
      // its mark, once it is finished: a ring and a tick in champagne
      const done = clamp((p - DONE[i]) / 0.25);
      if (done > 0) {
        const c = sheet(u1 - 0.04, v1 - 0.045);
        f.glow(c, 0.09, pal.gold, 0.35 * done * ink);
        tick(u1 - 0.04, v1 - 0.045, 0.014, pal.gold, done);
      }
    }
    /** how much brighter a part's strokes are under the pointer */
    const lift = (i: number) => 0.72 + 0.28 * s.lit[i];

    // the rules: a box and a line each, ticked as it is settled
    const rows = m ? 3 : 4;
    for (let r = 0; r < rows; r++) {
      const v = 0.72 - r * 0.075;
      const order = 0.8 + r * (1.6 / rows);
      const boxed = clamp((p - order + 0.1) / 0.15);
      f.path([sheet(0.075, v - 0.02), sheet(0.105, v - 0.02), sheet(0.105, v + 0.02), sheet(0.075, v + 0.02)], pal.ink2, 0.7 * boxed * ink, 1, true);
      stroke(0.135, v, 0.135 + 0.32 * s.widths[r], v, order, pal.ink, lift(0), 1.5, 0.28);
      tick(0.09, v, 0.012, pal.key, clamp((p - order - 0.28) / 0.1));
    }

    // the risk bracket: a spine, where the trade is entered, where it is given up, and the measure between
    stroke(0.63, 0.5, 0.63, 0.78, 2.6, pal.ink2, lift(1), 1.2, 0.3);
    stroke(0.63, 0.78, 0.84, 0.78, 2.9, pal.ink2, 0.6 * lift(1), 1.1, 0.2);
    stroke(0.63, 0.63, 0.88, 0.63, 3.05, pal.ink, lift(1), 1.8, 0.2);
    stroke(0.63, 0.5, 0.84, 0.5, 3.2, pal.crimson, lift(1), 1.8, 0.2);
    const span = clamp((p - 3.4) / 0.3);
    f.fill([sheet(0.67, 0.5), sheet(0.82, 0.5), sheet(0.82, 0.63), sheet(0.67, 0.63)], pal.crimson, (0.14 + 0.1 * s.lit[1]) * span * ink);
    f.path([sheet(0.87, 0.5), sheet(0.9, 0.5), sheet(0.9, 0.63), sheet(0.87, 0.63)], pal.gold, 0.9 * span * ink, Math.max(0.8, 1.4 * k));

    // the daily stop: a bar that fills as the day goes, and the one mark it does not go past
    const barOn = clamp((p - 3.8) / 0.25);
    f.path([sheet(0.08, 0.2), sheet(0.46, 0.2), sheet(0.46, 0.27), sheet(0.08, 0.27)], pal.ink2, 0.75 * lift(2) * barOn * ink, 1, true);
    const filled = ease((p - 4) / 0.5) * (f.still ? 0.6 : 0.52 + 0.08 * Math.sin(f.t * 0.5));
    f.fill([sheet(0.08, 0.2), sheet(0.08 + 0.38 * filled, 0.2), sheet(0.08 + 0.38 * filled, 0.27), sheet(0.08, 0.27)], pal.key, (0.3 + 0.2 * s.lit[2]) * barOn * ink);
    for (let i = 1; i < 5; i++) f.line(sheet(0.08 + 0.076 * i, 0.2), sheet(0.08 + 0.076 * i, 0.18), pal.ink2, 0.5 * barOn * ink, 1);
    stroke(0.384, 0.15, 0.384, 0.31, 4.45, pal.gold, 1, 2, 0.2);
    const stop = clamp((p - 4.65) / 0.15);
    f.fill([sheet(0.384, 0.315), sheet(0.371, 0.345), sheet(0.397, 0.345)], pal.gold, 0.9 * stop * ink);

    // the routine: a clock face with no hours, the parts of the day that are kept, and three things to do
    const cu = 0.67;
    const cv = 0.245;
    const rv = 0.105;
    const onFace = (turnAt: number, r: number): V3 => {
      const a = Math.PI / 2 - turnAt * TAU;
      return sheet(cu + Math.cos(a) * r * rv * SQUARE, cv + Math.sin(a) * r * rv);
    };
    const faceOn = clamp((p - 4.8) / 0.5);
    if (faceOn > 0) {
      const seg = Math.max(16, Math.round(40 * f.q));
      const rim: V3[] = [];
      for (let i = 0; i <= Math.round(seg * faceOn); i++) rim.push(onFace(i / seg, 1));
      f.path(rim, pal.ink, 0.85 * lift(3) * ink, Math.max(0.7, 1.3 * k));
      if (faceOn < 1) {
        penU = cu + Math.sin(faceOn * TAU) * rv * SQUARE;
        penV = cv + Math.cos(faceOn * TAU) * rv;
      }
      for (let i = 0; i < 12; i++) if (i / 12 <= faceOn) f.line(onFace(i / 12, 1), onFace(i / 12, i % 3 ? 0.9 : 0.8), pal.ink2, 0.7 * ink, 1);
      for (const [from, to, order, colour] of [[0.06, 0.3, 5.3, pal.teal], [0.46, 0.63, 5.5, pal.indigo]] as const) {
        const d = clamp((p - order) / 0.25);
        if (d <= 0) continue;
        const kept: V3[] = [];
        for (let i = 0; i <= 10; i++) kept.push(onFace(lerp(from, lerp(from, to, d), i / 10), 0.62));
        f.path(kept, colour, 0.9 * lift(3) * ink, Math.max(1, 2.6 * k));
      }
      // the hand goes round once in a couple of minutes
      const hand = clamp((p - 5.6) / 0.3);
      f.line(sheet(cu, cv), onFace(f.still ? 0.14 : (f.t / 126) % 1, 0.78), pal.gold, hand * ink, Math.max(0.8, 1.5 * k));
      f.dot(sheet(cu, cv), 0.012, pal.gold, hand * ink);
    }
    for (let r = 0; r < 3; r++) {
      const v = 0.31 - r * 0.065;
      f.dot(sheet(0.795, v), 0.009, tones[3], clamp((p - 5.4 - r * 0.2) / 0.1) * ink);
      stroke(0.815, v, 0.815 + 0.115 * s.widths[r + 4], v, 5.45 + r * 0.2, pal.ink2, lift(3), 1.3, 0.15);
    }

    // the date, and the line to sign on
    stroke(0.05, 0.045, 0.3, 0.045, 6.1, pal.ink2, 0.6, 1, 0.3);
    stroke(0.58, 0.045, 0.95, 0.045, 6.2, pal.ink, 0.7, 1, 0.3);
    const signed = clamp((p - 6.5) / 0.4);
    if (signed > 0) {
      const hand: V3[] = [];
      const n = 14;
      for (let i = 0; i <= Math.round(n * signed); i++) hand.push(sheet(0.62 + (0.24 * i) / n, 0.068 + 0.016 * Math.sin(i * 1.3) * (1 - i / (n * 1.4))));
      f.path(hand, pal.gold, 0.9 * ink, Math.max(0.8, 1.4 * k));
      if (signed < 1) {
        penU = 0.62 + 0.24 * signed;
        penV = 0.068;
      }
    }

    // ── the straightedge keeps level with the stylus, and rests at the foot of the board when the sheet is whole
    const writing = turn < 0.68 && !composed;
    // (between two strokes the stylus travels; it does not jump)
    if (penU >= 0) {
      const glide = clamp(f.dt * 12);
      s.pen[0] += (penU - s.pen[0]) * glide;
      s.pen[1] += (penV - s.pen[1]) * glide;
    }
    const level = writing ? SV + SH * s.pen[1] - 0.012 : 0.04;
    s.edge = composed ? level : s.edge + (level - s.edge) * clamp(f.dt * 4);
    f.line(board(-0.03, s.edge, 0.03), board(1.03, s.edge, 0.03), pal.key, 0.5 * boardOn, 2);
    f.line(board(-0.03, s.edge - 0.014, 0.03), board(1.03, s.edge - 0.014, 0.03), pal.ink, 0.2 * boardOn, 1);
    f.dot(board(-0.03, s.edge - 0.007, 0.03), 0.02, pal.ink2, 0.8 * boardOn);
    f.dot(board(1.03, s.edge - 0.007, 0.03), 0.02, pal.ink2, 0.8 * boardOn);

    // ── the stylus: a point of light on the sheet and the barrel held over it
    if (writing) {
      const at = sheet(s.pen[0], s.pen[1], 0.016);
      const end: V3 = [at[0] + 0.08, at[1] + 0.2, at[2] - 0.17];
      f.glow(at, 0.16, pal.key, 0.75 * ink);
      f.line(at, end, pal.ink2, 0.8 * ink, 2.5 * k);
      f.line(at, [lerp(at[0], end[0], 0.18), lerp(at[1], end[1], 0.18), lerp(at[2], end[2], 0.18)], pal.gold, 0.9 * ink, 2.5 * k);
      f.dot(at, 0.011, pal.ink, 0.95 * ink);
    }

    // ── the printer beside the board, and the copy that comes out of it
    const printerOn = f.on(0.45, 0.4);
    const busy = printed * (1 - printed) * 4;
    const px = (PX0 + PX1) / 2;
    trace(f, arc(board(1, 0.14), [px, FLOOR + 0.2, PZ1 - 0.1], 0.22, Math.max(8, Math.round(16 * f.q))), pal.key, (0.3 + 0.4 * busy) * printerOn, 1, busy > 0.05 && !composed ? f.t / 1.6 : -1);
    pool(f, [px, FLOOR, PZ0 - 0.2], 0.8, pal.gold, 0.22 * printed * fade * printerOn);
    slab(f, [PX0, FLOOR, PZ0], [PX1, FLOOR + 0.2, PZ1], pal.ink, 0.1, printerOn);
    f.line([PX0 + 0.07, SLOT, PZ0], [PX1 - 0.07, SLOT, PZ0], pal.gold, (0.5 + 0.5 * busy) * printerOn, 1.5);
    lamp(f, [PX1 - 0.1, FLOOR + 0.2, PZ0 + 0.08], pal.key, (0.4 + 0.6 * busy) * printerOn, 0.013);
    const out = printed * fade * printerOn;
    if (printed > 0.01 && out > 0.01) {
      /** a point of the copy: `u` across it, `g` down the page from the edge that came out first */
      const copy = (u: number, g: number): V3 => {
        const d = Math.max(0, printed - g) * PAGE;
        return [PX0 + 0.09 + (PX1 - PX0 - 0.18) * u, SLOT - 0.1 * ease(d / 0.3), PZ0 - d];
      };
      const edge: V3[] = [];
      for (let i = 0; i <= 4; i++) edge.push(copy(0, (printed * i) / 4));
      for (let i = 4; i >= 0; i--) edge.push(copy(1, (printed * i) / 4));
      f.fill(edge, pal.bg, 0.9 * out);
      f.fill(edge, pal.ink, 0.08 * out);
      f.path(edge, pal.ink, 0.4 * out, 1, true);
      /** a stroke of the copy, there once that much of the page is out */
      const row = (u0: number, u1: number, g: number, colour: string, alpha: number, width: number) => f.line(copy(u0, g), copy(u1, g), colour, alpha * clamp((printed - g) / 0.05) * out, width);
      row(0.1, 0.5, 0.09, pal.ink, 0.9, 2);
      row(0.1, 0.9, 0.15, pal.ink, 0.25, 1);
      for (let r = 0; r < 3; r++) row(0.1, 0.1 + 0.34 * s.widths[r], 0.27 + r * 0.08, pal.ink2, 0.75, 1.2);
      row(0.6, 0.86, 0.27, pal.ink2, 0.7, 1.1);
      row(0.6, 0.86, 0.43, pal.crimson, 0.8, 1.3);
      f.line(copy(0.6, 0.27), copy(0.6, 0.43), pal.ink2, 0.7 * clamp((printed - 0.43) / 0.05) * out, 1.1);
      row(0.1, 0.44, 0.64, pal.key, 0.8, 2.4);
      f.line(copy(0.36, 0.6), copy(0.36, 0.68), pal.gold, clamp((printed - 0.68) / 0.05) * out, 1.5);
      const dial: V3[] = [];
      for (let i = 0; i <= 14; i++) dial.push(copy(0.73 + Math.cos((i / 14) * TAU) * 0.12, 0.67 + Math.sin((i / 14) * TAU) * 0.085));
      f.path(dial, pal.ink2, 0.75 * clamp((printed - 0.76) / 0.05) * out, 1.1);
      row(0.55, 0.9, 0.9, pal.ink, 0.6, 1);
    }

    // ── the key light crossing the board: one soft band, slowly, from corner to corner
    const [c0, c1, c2, c3] = face.map((q) => f.P(...q));
    if (c0 && c1 && c2 && c3) {
      const band = clamp(0.5 + (f.still ? -0.1 : Math.sin(f.t * 0.19) * 0.3) + f.px * 0.1, 0.2, 0.8);
      const g = ctx.createLinearGradient(c3.x, c3.y, c1.x, c1.y);
      g.addColorStop(band - 0.2, rgba(pal.key, 0));
      g.addColorStop(band, rgba(pal.key, 0.07 * boardOn));
      g.addColorStop(band + 0.14, rgba(pal.key, 0));
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y);
      for (const q of [c1, c2, c3]) ctx.lineTo(q.x, q.y);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }
  },
};

export default scene;
