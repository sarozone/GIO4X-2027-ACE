/**
 * DEPTH — the order book, as two terraces.
 *
 * Two flights of steps face each other across a gap. On the left the bids,
 * on the right the asks: each step is one level of the book, and each stands
 * higher than the one before it because depth is counted from the gap
 * outward. The gap between the two lowest steps is the spread, marked in
 * champagne on the floor. The steps nearest the gap are the restless ones:
 * they rise and fall, while the far steps hardly move.
 *
 * The steps are an illustration of the shape of a book. They stand on no
 * price scale and carry no volume, and their movement is a fixed, slow sway,
 * the same for every visitor.
 *
 * The pointer measures: the step under it lifts and lights, and the champagne
 * rule that reads a step's depth leaves its place and stands on that step.
 */
import { clamp, type Scene, type V3 } from "../engine";
import { eyeX, pool, slab } from "../kit";

const FLOOR = -0.95;
/** half the gap, the width of a step, the height one step adds, half the depth of a terrace */
const [GAP, SW, RISE, D] = [0.17, 0.24, 0.29, 0.34];
/** the step the rule rests on when the pointer is elsewhere: the fourth bid */
const REST = 3;

type Step = { side: -1 | 1; i: number; x0: number; x1: number; sway: number; pace: number; phase: number };
type State = { steps: Step[]; n: number; x: number; h: number };

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    const n = f.mobile ? 5 : 6;
    const steps: Step[] = [];
    // from the far left to the far right, so that either end can be drawn inward toward the eye
    for (let k = -n; k < n; k++) {
      const side = k < 0 ? -1 : 1;
      const i = k < 0 ? -k - 1 : k;
      const inner = GAP + i * SW;
      const outer = inner + SW - 0.02;
      steps.push({ side, i, x0: side < 0 ? -outer : inner, x1: side < 0 ? -inner : outer, sway: 0.13 * Math.max(0, 1 - i / 3) + 0.012, pace: 0.5 + 0.4 * f.rnd(k + 20), phase: f.rnd(k + 40) * 6.28 });
    }
    return { steps, n, x: -(GAP + (REST + 0.5) * SW), h: (REST + 1) * RISE };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const t = f.t;
    f.aim(0.16 + (f.still ? 0 : Math.sin(t * 0.07) * 0.05), 0.2, 6.3, 1);

    const on = f.on(0, 0.4);
    pool(f, [0, FLOOR, 0], 2.2, pal.key, 0.18 * f.boot);
    f.line([-GAP - s.n * SW - 0.06, FLOOR, -D], [GAP + s.n * SW + 0.06, FLOOR, -D], pal.ink, 0.28 * on, 1);

    // ── the gap: the spread, in champagne on the floor between the two lowest steps
    const gapOn = f.on(0.5, 0.3);
    f.fill([[-GAP, FLOOR, -D], [GAP, FLOOR, -D], [GAP, FLOOR, D], [-GAP, FLOOR, D]], pal.gold, 0.22 * gapOn);
    f.glow([0, FLOOR, 0], 0.5, pal.gold, 0.22 * gapOn * (f.still ? 1 : 0.8 + 0.2 * Math.sin(t * 0.8)));

    // ── the steps: each side is drawn from its far end in toward the eye, so nearer steps hide farther ones
    const eye = eyeX(f);
    let pick = -1;
    let best = 0.12;
    const height = (st: Step) => ((st.i + 1) * RISE + (f.still ? st.sway * 0.4 * st.side : st.sway * Math.sin(t * st.pace + st.phase))) * f.on(0.1 + (st.i / s.n) * 0.5, 0.4);
    const step = (k: number) => {
      const st = s.steps[k];
      const h = height(st);
      if (h <= 0.004) return;
      const touch = f.near([(st.x0 + st.x1) / 2, FLOOR + h * 0.6, -D], f.mobile ? 34 : 46);
      if (touch > best) {
        best = touch;
        pick = k;
      }
      const top = FLOOR + h + 0.05 * touch;
      slab(f, [st.x0, FLOOR, -D], [st.x1, top, D], st.side < 0 ? pal.emerald : pal.crimson, 0.13 + 0.05 * (1 - st.i / s.n) + 0.2 * touch, on);
      // the levels the step is built of, ruled on its face
      for (let j = 1; j <= st.i; j++) {
        const y = FLOOR + (h * j) / (st.i + 1);
        f.line([st.x0, y, -D], [st.x1, y, -D], pal.ink, 0.1 * on, 1);
      }
    };
    let a = 0;
    let b = s.steps.length - 1;
    while (a <= b && (s.steps[a].x0 + s.steps[a].x1) / 2 < eye) step(a++);
    while (b >= a) step(b--);

    f.line([-GAP, FLOOR, -D], [GAP, FLOOR, -D], pal.gold, 0.95 * gapOn, 1.75);
    f.line([-GAP, FLOOR, -D], [-GAP, FLOOR + 0.07, -D], pal.gold, 0.95 * gapOn, 1.5);
    f.line([GAP, FLOOR, -D], [GAP, FLOOR + 0.07, -D], pal.gold, 0.95 * gapOn, 1.5);

    // ── the rule: it reads one step's depth, floor to top; the pointer chooses which
    const target = s.steps[pick >= 0 ? pick : s.n - 1 - Math.min(REST, s.n - 1)];
    const wantX = (target.x0 + target.x1) / 2;
    const wantH = height(target) + (pick >= 0 ? 0.05 * best : 0);
    const ease = f.still ? 1 : 1 - Math.exp(-f.dt * 6);
    s.x += (wantX - s.x) * ease;
    s.h += (wantH - s.h) * ease;
    const ruleOn = f.on(0.7, 0.3);
    const foot: V3 = [s.x, FLOOR, -D - 0.01];
    const head: V3 = [s.x, FLOOR + clamp(s.h, 0.02, 2.2), -D - 0.01];
    f.line(foot, head, pal.gold, 0.16 * ruleOn, 5);
    f.line(foot, head, pal.gold, 0.95 * ruleOn, 1.5);
    for (const p of [foot, head]) f.line([p[0] - 0.05, p[1], p[2]], [p[0] + 0.05, p[1], p[2]], pal.gold, 0.95 * ruleOn, 1.5);

    // ── the lettering: the two sides, the gap, and what the rule reads
    const named = f.on(0.8, 0.2);
    const size = f.mobile ? 9 : 10;
    const mid = GAP + (s.n * SW) / 2;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("BIDS", [-mid, FLOOR, -D], { align: "center", size, colour: pal.emerald, alpha: 0.9 * named, dy: 14 });
    f.label("ASKS", [mid, FLOOR, -D], { align: "center", size, colour: pal.crimson, alpha: 0.9 * named, dy: 14 });
    f.label("SPREAD", [0, FLOOR, -D], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: 14 });
    f.label("DEPTH", head, { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -11 });
    ctx.restore();
  },
};

export default scene;
