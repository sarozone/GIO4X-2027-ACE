/**
 * FIBONACCI — one swing, the bands across it, and the spiral the ratios come from.
 *
 * At the left a swing is drawn as a rising line from A to B, with the pull
 * back that follows it. Horizontal bands lie across the swing, cut where the
 * Fibonacci ratios divide its height; the cut at the golden section is in
 * champagne. The pull back wanders slowly between two of the cuts and settles
 * on neither: the bands are places to look, not places the line must turn.
 *
 * Beside it the same ratios are drawn as geometry. Five squares, each as
 * wide as the two before it together, are laid down one after another, and a
 * quarter-arc is struck through each: the spiral unfolds, stands a while and
 * begins again.
 *
 * The cuts are positions, not figures: nothing here is a price or a
 * percentage, and the letters only name the two ends of the swing.
 *
 * The pointer: each band lights as the pointer crosses it, and the spiral
 * brightens when the pointer is on it.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, trace } from "../kit";

const FLOOR = -1.2;
/** the bands: their left and right edges, and the top and bottom of the swing */
const [X0, X1, TOP, BOT] = [-1.75, 0.45, 0.8, -0.8];
/** where the swing begins (A), where it ends (B), and where the pull back is read */
const [AX, BX, CX] = [-1.6, -0.6, 0.3];
/** the cuts across the swing, measured down from its top as a share of its height */
const CUTS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;
const GOLDEN = 4;
const cutY = (i: number) => TOP - CUTS[i] * (TOP - BOT);

/** the spiral: its middle, and the side of its smallest square */
const [SX, SY, UNIT] = [1.2, 0, 0.19];
/**
 * Five squares with sides 1, 1, 2, 3, 5, each laid against the others in
 * turn (right, above, left, below), and the quarter-arc through each: the
 * square's corner, its side, the arc's centre and the angle it starts at.
 * In the spiral's own units; the whole figure spans −3..2 by −5..3.
 */
const SQUARES: readonly (readonly [number, number, number, number, number, number])[] = [
  [0, 0, 1, 1, 1, 0.5],
  [1, 0, 1, 1, 1, -0.25],
  [0, 1, 2, 0, 1, 0],
  [-3, 0, 3, 0, 0, 0.25],
  [-3, -5, 5, 2, 0, 0.5],
];
const STEPS = 14;
const place = (x: number, y: number): V3 => [SX + (x + 0.5) * UNIT, SY + (y + 1) * UNIT, 0];
/** each square's outline, and each arc as points, worked out once */
const OUTLINES: V3[][] = SQUARES.map(([x, y, s]) => [place(x, y), place(x + s, y), place(x + s, y + s), place(x, y + s)]);
const ARCS: V3[][] = SQUARES.map(([, , s, cx, cy, turn]) =>
  Array.from({ length: STEPS + 1 }, (_, i) => {
    const a = (turn + (i / STEPS) * 0.25) * TAU;
    return place(cx + Math.cos(a) * s, cy + Math.sin(a) * s);
  }),
);
/** the spiral's cycle, in seconds: it unfolds, stands, fades and begins again */
const [LOOP, UNFOLD, HOLD] = [26, 15, 22];

type State = { phase: number };

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};

const scene: Scene<State> = {
  pose: 18,
  setup(f) {
    return { phase: f.rnd(5) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.12 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.03), -0.08, 6.3, 1.06);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the bands across the swing: each lights as the pointer crosses it
    const edge = f.P(X1, 0, 0);
    const inX = edge ? clamp(1 - (f.mx - edge.x) / 40) : 0;
    for (let i = 0; i < CUTS.length - 1; i++) {
      const on = f.on(0.1 + i * 0.07, 0.3);
      if (on <= 0.003) continue;
      const [y0, y1] = [cutY(i), cutY(i + 1)];
      const a = f.P(-0.65, y0, 0);
      const b = f.P(-0.65, y1, 0);
      let lit = 0;
      if (a && b && f.hover > 0) {
        const half = Math.abs(b.y - a.y) / 2;
        lit = clamp(1 - (Math.abs(f.my - (a.y + b.y) / 2) - half) / 10) * inX * f.hover;
      }
      f.fill([[X0, y0, 0], [X1, y0, 0], [X1, y1, 0], [X0, y1, 0]], i % 2 ? pal.key : pal.teal, (i % 2 ? 0.07 : 0.035) * on + 0.16 * lit);
      if (lit > 0.02) {
        f.line([X0, y0, 0], [X1, y0, 0], pal.ink, 0.55 * lit * on, 1.4);
        f.line([X0, y1, 0], [X1, y1, 0], pal.ink, 0.55 * lit * on, 1.4);
      }
    }
    // ── the cuts themselves: the two ends of the swing, the golden cut in champagne, the rest fine
    for (let i = 0; i < CUTS.length; i++) {
      const on = f.on(0.1 + i * 0.07, 0.3);
      const y = cutY(i);
      const reach = lerp(X0, X1, on);
      if (i === GOLDEN) trace(f, [[X0, y, 0], [reach, y, 0]], pal.gold, 0.9 * on, 1.5, f.still ? -1 : t / 8);
      else f.line([X0, y, 0], [reach, y, 0], pal.ink, (i === 0 || i === CUTS.length - 1 ? 0.5 : 0.26) * on, 1);
    }

    // ── the swing: up from A to B, then the pull back, which wanders between two cuts
    const drawn = f.on(0.45, 0.35);
    const back = 0.5 + (f.still ? 0.05 : Math.sin(t * 0.23 + s.phase) * 0.11);
    const A: V3 = [AX, BOT, 0];
    const B: V3 = [lerp(AX, BX, drawn), lerp(BOT, TOP, drawn), 0];
    trace(f, [A, B], pal.ink, 0.95 * drawn, 2, f.still ? -1 : t / 6);
    const pulled = f.on(0.7, 0.3);
    if (pulled > 0.003) {
      const C: V3 = [lerp(BX, CX, pulled), TOP - back * (TOP - BOT) * pulled, 0];
      f.line([BX, TOP, 0], C, pal.ink2, 0.75 * pulled, 1.4);
      lamp(f, C, pal.key, pulled, 0.013);
    }
    lamp(f, A, pal.ink, drawn, 0.014);
    lamp(f, B, pal.gold, drawn, 0.016);

    // ── the spiral: square after square, and a quarter-arc through each
    const u = f.still ? HOLD - 1 : t % LOOP;
    const grown = clamp(u / UNFOLD) * SQUARES.length;
    const fade = (f.still ? 1 : (1 - smooth((u - HOLD) / (LOOP - HOLD))) * smooth(u / 0.8 + 0.25)) * f.on(0.55, 0.35);
    const over = f.near([SX, SY, 0], f.u * 0.95);
    let tip: V3 | null = null;
    for (let k = 0; k < SQUARES.length; k++) {
      const part = clamp(grown - k);
      if (part <= 0 || fade <= 0.003) break;
      f.fill(OUTLINES[k], pal.gold, (0.03 + 0.05 * over) * smooth(part * 2) * fade);
      f.path(OUTLINES[k], pal.ink, (m ? 0.22 : 0.3) * smooth(part * 2) * fade, 1, true);
      const arc = ARCS[k];
      const x = part * STEPS;
      const whole = Math.floor(x);
      const pts = whole >= STEPS ? arc : arc.slice(0, whole + 1);
      if (pts.length > 1) trace(f, pts, pal.gold, (0.85 + 0.15 * over) * fade, 1.6 + 0.5 * over);
      tip = arc[Math.min(STEPS, whole)];
      if (whole < STEPS) {
        const from = arc[whole];
        const to = arc[whole + 1];
        const r = x - whole;
        tip = [lerp(from[0], to[0], r), lerp(from[1], to[1], r), 0];
        f.line(from, tip, pal.gold, 0.85 * fade, 1.6);
      }
    }
    if (tip && !f.still && grown < SQUARES.length) lamp(f, tip, pal.gold, fade, 0.014);

    // ── the two ends of the swing, named
    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("A", A, { align: "center", size, colour: pal.ink2, alpha: 0.9 * named, dy: 14 });
    f.label("B", [BX, TOP, 0], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -13 });
    ctx.restore();
  },
};

export default scene;
