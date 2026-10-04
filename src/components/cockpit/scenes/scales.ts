/**
 * SCALES — two things, set side by side.
 *
 * Two panes of glass stand next to each other, opened a little like the leaves
 * of a book: A and B. Each carries the same five rows, and in every row a bar;
 * the bars grow outward from the inner edges, so a pair is read at a glance,
 * longer on this side or on that. A rule joins each pair across the gap, with a
 * rider that sits toward the longer bar. Above the panes hangs a balance: its
 * beam takes one pair at a time and leans, gently, to the side that has more.
 *
 * The bars are lengths and nothing else: no scale, no unit, no figure. Longer
 * is not better. What the rows are is the page's business.
 *
 * The pointer: the row under it is the pair on the balance.
 */
import { clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { lamp, panel, ring, trace, type Panel } from "../kit";

const N = 5;
/** the two columns of lengths, as shares of a row */
const LEFT = [0.8, 0.45, 0.62, 0.9, 0.36];
const RIGHT = [0.5, 0.76, 0.3, 0.6, 0.72];
/** seconds the balance gives to one pair */
const HOLD = 3.4;
/** a pane: width, height, how far its centre stands from the middle, the height of its centre, its turn */
const [PW, PH, PX, PY, TURN] = [1.3, 1.62, 0.84, -0.42, 0.22];
/** the balance: height of the pivot, half the beam, how far back it stands, the drop to a pan */
const [BY, HL, BZ, DROP] = [0.98, 0.9, 0.14, 0.25];
const FLOOR = PY - PH / 2;
/** a row on a pane: its height (v), half its thickness, and the inner and outer ends of the longest bar (u) */
const rowV = (i: number) => 0.74 - i * 0.145;
const [THICK, INNER, SPAN] = [0.036, 0.08, 0.78];

const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};

type State = { tilt: number; lead: number; phase: number; jit: number[] };

/** a pan hanging from one end of the beam: two cords and a shallow dish */
function pan(f: Frame, end: V3, colour: string, a: number): void {
  const y = end[1] - DROP;
  const dish: V3[] = [];
  for (let i = -4; i <= 4; i++) dish.push([end[0] + (i / 4) * 0.2, y - 0.05 * (1 - (i * i) / 16), end[2]]);
  f.fill(dish, colour, 0.14 * a);
  f.path(dish, colour, 0.8 * a, 1.2, true);
  f.line(end, dish[0], f.pal.ink, 0.36 * a, 1);
  f.line(end, dish[8], f.pal.ink, 0.36 * a, 1);
  f.dot(end, 0.016, colour, 0.9 * a);
}

const scene: Scene<State> = {
  pose: 8.5,
  setup(f) {
    return { tilt: 0, lead: Math.floor(f.rnd(0) * N), phase: f.rnd(1) * 6, jit: Array.from({ length: N * 2 }, (_, i) => (f.rnd(3 + i) - 0.5) * 0.08) };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.05, -0.05, 6.4, 1);

    // ── the stand of the balance, behind the gap between the panes
    const stand = f.on(0.1, 0.5);
    ring(f, [0, FLOOR, BZ], 0.17, { colour: pal.ink, alpha: 0.3 * stand, seg: 30 });
    const top = lerp(FLOOR, BY, stand);
    f.line([0, FLOOR, BZ], [0, top, BZ], pal.ink, 0.1 * stand, 3.5);
    f.line([0, FLOOR, BZ], [0, top, BZ], pal.ink, 0.36 * stand, 1);

    // ── the two panes
    const A = panel(f, [-PX, PY, 0], PW, PH, { yaw: -TURN, colour: pal.key, on: f.on(0, 0.45), header: true });
    const B = panel(f, [PX, PY, 0], PW, PH, { yaw: TURN, colour: pal.key, on: f.on(0.15, 0.45), header: true });

    // ── which pair is on the balance: each in turn, or the one under the pointer
    const lens = (i: number): [number, number] => {
      const breathe = f.still ? 0 : 0.035 * Math.sin(t * 0.4 + i * 1.7 + s.phase);
      return [clamp(LEFT[i] + s.jit[i] + breathe, 0.15, 1), clamp(RIGHT[i] + s.jit[N + i] - breathe, 0.15, 1)];
    };
    const mid = (i: number): V3 => [0, PY + (rowV(i) - 0.5) * PH, BZ];
    const cur = (((t / HOLD + s.lead) % N) + N) % N;
    const held: number[] = [];
    let grip = 0;
    for (let i = 0; i < N; i++) {
      const p = f.P(...mid(i));
      held[i] = p && f.hover > 0 ? smooth(1.25 - Math.abs(p.y - f.my) / (f.u * 0.17)) * f.hover : 0;
      grip = Math.max(grip, held[i]);
    }
    let sum = 0;
    let lean = 0;
    const w: number[] = [];
    for (let i = 0; i < N; i++) {
      const d = ((((cur - i - 0.5) % N) + N * 1.5) % N) - N / 2;
      w[i] = Math.max(smooth(1.3 - Math.abs(d) * 1.6) * (1 - grip), held[i]);
      const [l, r] = lens(i);
      sum += w[i];
      lean += w[i] * (l - r);
    }
    const want = clamp((lean / (sum + 1e-6)) * Math.min(1, sum) * 0.34, -0.15, 0.15);
    s.tilt = f.still ? want : s.tilt + (want - s.tilt) * (1 - Math.exp(-f.dt * 2));

    // ── the rows: a bar on each pane, growing outward from the inner edge, and the rule that joins the pair
    const bar = (pn: Panel, u0: number, u1: number, v: number, colour: string, alpha: number) => {
      f.fill([pn.at(u0, v - THICK, 0.01), pn.at(u1, v - THICK, 0.01), pn.at(u1, v + THICK, 0.01), pn.at(u0, v + THICK, 0.01)], colour, alpha);
    };
    for (let i = 0; i < N; i++) {
      const on = f.on(0.3 + i * 0.1, 0.3);
      if (on <= 0.003) continue;
      const v = rowV(i);
      const [l, r] = lens(i);
      const k = w[i];
      const [la, ra] = [1 - INNER - l * SPAN * on, INNER + r * SPAN * on];
      // the track the bar runs in, then the bar, then the lit end that is read
      f.line(A.at(1 - INNER, v, 0.01), A.at(1 - INNER - SPAN, v, 0.01), pal.ink, 0.1 * on * A.on, 1);
      f.line(B.at(INNER, v, 0.01), B.at(INNER + SPAN, v, 0.01), pal.ink, 0.1 * on * B.on, 1);
      bar(A, la, 1 - INNER, v, pal.teal, (0.34 + 0.2 * k) * on * A.on);
      bar(B, INNER, ra, v, pal.indigo, (0.34 + 0.2 * k) * on * B.on);
      if (k > 0.01) {
        bar(A, la, 1 - INNER, v, pal.gold, 0.3 * k * on * A.on);
        bar(B, INNER, ra, v, pal.gold, 0.3 * k * on * B.on);
      }
      f.line(A.at(la, v - THICK, 0.01), A.at(la, v + THICK, 0.01), k > 0.5 ? pal.gold : pal.teal, 0.95 * on * A.on, 1.6);
      f.line(B.at(ra, v - THICK, 0.01), B.at(ra, v + THICK, 0.01), k > 0.5 ? pal.gold : pal.indigo, 0.95 * on * B.on, 1.6);

      const [ja, jb] = [A.at(1 - INNER, v, 0.01), B.at(INNER, v, 0.01)];
      const join = on * Math.min(A.on, B.on);
      f.line(ja, jb, pal.ink, 0.3 * join, 1);
      if (k > 0.01) trace(f, [ja, jb], pal.gold, 0.8 * k * join, 1.2);
      // the rider: it sits toward the longer bar
      const at = clamp(0.5 + (r - l) * 0.7, 0.12, 0.88);
      const rider: V3 = [lerp(ja[0], jb[0], at), lerp(ja[1], jb[1], at), lerp(ja[2], jb[2], at)];
      f.dot(rider, 0.02, k > 0.5 ? pal.gold : pal.ink, (0.55 + 0.45 * k) * join);
      f.dot(ja, 0.011, pal.ink, 0.6 * join);
      f.dot(jb, 0.011, pal.ink, 0.6 * join);
    }

    // ── the balance: the beam leans to the side that has more
    const bal = f.on(0.85, 0.15);
    if (bal > 0.003) {
      const ang = s.tilt + (f.still ? 0 : Math.sin(t * 0.5 + s.phase) * 0.012);
      const [c, sn] = [Math.cos(ang) * HL, Math.sin(ang) * HL];
      const L: V3 = [-c, BY - sn, BZ];
      const R: V3 = [c, BY + sn, BZ];
      f.path([[-0.07, BY - 0.12, BZ], [0, BY, BZ], [0.07, BY - 0.12, BZ]], pal.ink, 0.5 * bal, 1, true);
      trace(f, [L, R], pal.gold, 0.9 * bal, 1.7);
      f.line(L, R, pal.ink, 0.3 * bal, 0.75);
      pan(f, L, pal.teal, bal);
      pan(f, R, pal.indigo, bal);
      lamp(f, [0, BY, BZ], pal.gold, bal, 0.017);
    }

    const named = f.on(0.7, 0.3);
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("A", A.at(0.07, 0.94, 0.01), { size: m ? 10 : 11, colour: pal.teal, alpha: 0.95 * named * A.on });
    f.label("B", B.at(0.93, 0.94, 0.01), { size: m ? 10 : 11, colour: pal.indigo, alpha: 0.95 * named * B.on, align: "right" });
    ctx.restore();
  },
};

export default scene;
