/**
 * PERSONA — a way of working, drawn as a shape.
 *
 * A radar chart with five axes, one for each style the quiz describes, from
 * the shortest holding period round to the longest. A champagne shape is
 * stretched over them: it leans toward one style, rests there, then breathes
 * out into the next, and the outline of the profile it is turning into waits
 * faintly beside it. At the centre a small dial carries a needle that points
 * wherever the shape leans.
 *
 * The pointer pulls: the axis it is near reaches out toward it, and the needle
 * swings round to follow the cursor.
 *
 * The rings are graduations with no scale. No style is larger, better or
 * scored; the shape only shows that profiles differ.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { lamp, ring } from "../kit";
import { smooth } from "./_stage";

const STYLES = ["SCALPER", "DAY", "SWING", "POSITION", "INVESTOR"];
const N = STYLES.length;
/** the length of an axis, and the radius of the dial */
const [RAD, DIAL] = [1, 0.17];
/** seconds on one profile, the last two fifths of them spent turning into the next */
const HOLD = 6;
/** axis i points this way: the first straight up, the others clockwise */
const DIR: readonly (readonly [number, number])[] = STYLES.map((_, i) => {
  const a = Math.PI / 2 - (i * TAU) / N;
  return [Math.cos(a), Math.sin(a)] as const;
});
/** how far profile k reaches along axis i */
const reach = (k: number, i: number) => {
  const d = Math.abs(i - k);
  return d === 0 ? 1 : d === 1 ? 0.58 : d === 2 ? 0.36 : 0.24;
};

const scene: Scene = {
  // resting on the middle profile
  pose: 13.8,
  draw(f) {
    const { pal } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(f.still ? 0 : Math.sin(t * 0.08) * 0.05, 0, 6.2, m ? 1 : 1.12);

    const ph = t / HOLD;
    const k0 = Math.floor(ph) % N;
    const k1 = (k0 + 1) % N;
    const turn = smooth((ph - Math.floor(ph) - 0.6) / 0.4);
    const at = (i: number, v: number): V3 => [DIR[i][0] * RAD * v, DIR[i][1] * RAD * v, 0];

    // ── the web: graduated rings, and the five axes
    const webOn = f.on(0, 0.4);
    for (let g = 1; g <= 4; g++) {
      const pts: V3[] = [];
      for (let i = 0; i < N; i++) pts.push(at(i, g / 4));
      f.path(pts, pal.ink, (g === 4 ? 0.36 : 0.14) * webOn, 1, true);
    }

    // ── the shape: where it is now, and what the pointer does to it
    const shapeOn = f.on(0.4, 0.4);
    const val: number[] = [];
    const next: V3[] = [];
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < N; i++) {
      const jit = (f.rnd(i * 3 + 1) - 0.5) * 0.08;
      const breath = f.still ? 0 : Math.sin(t * 0.7 + i * 1.7) * 0.025;
      const pull = f.near(at(i, 1), 130);
      const v = clamp(lerp(reach(k0, i), reach(k1, i), turn) + jit + breath + 0.3 * pull, 0.12, 1.06) * shapeOn;
      val.push(v);
      next.push(at(i, clamp(reach(k1, i) + jit, 0.12, 1.06) * shapeOn));
      sx += DIR[i][0] * v * v * v;
      sy += DIR[i][1] * v * v * v;
      // the axis, lit as far as the shape reaches along it
      f.line([0, 0, 0], at(i, 1), pal.ink, 0.2 * webOn, 1);
      f.line([0, 0, 0], at(i, v), pal.gold, (0.25 + 0.5 * pull) * shapeOn, 1);
    }
    // the profile it is turning into
    f.path(next, pal.key, 0.3 * shapeOn, 1, true);
    const shape = val.map((v, i) => at(i, v));
    f.fill(shape, pal.gold, 0.15 * shapeOn);
    f.path(shape, pal.gold, 0.12 * shapeOn, 5, true);
    f.path(shape, pal.gold, 0.95 * shapeOn, 1.6, true);
    for (let i = 0; i < N; i++) {
      const lead = clamp((val[i] - 0.7) / 0.3);
      if (lead > 0.05) lamp(f, shape[i], pal.gold, lead * shapeOn, 0.016);
      else f.dot(shape[i], 0.014, pal.gold, 0.9 * shapeOn);
    }

    // ── the names of the axes
    const named = f.on(0.8, 0.2);
    for (let i = 0; i < N; i++) {
      const [dx, dy] = DIR[i];
      const lead = clamp((val[i] - 0.7) / 0.3);
      f.label(STYLES[i], at(i, 1), {
        align: dx > 0.3 ? "left" : dx < -0.3 ? "right" : "center",
        dx: dx * 9,
        dy: -dy * 13,
        size: m ? 8 : 10,
        colour: lead > 0.5 ? pal.gold : pal.ink2,
        alpha: (0.6 + 0.35 * lead) * named,
      });
    }

    // ── the dial at the centre: its needle points where the shape leans, or at the cursor
    const dialOn = f.on(0.6, 0.3);
    f.dot([0, 0, 0], DIAL, pal.bg, 0.92 * dialOn);
    ring(f, [0, 0, 0], DIAL, { axis: "z", colour: pal.ink, alpha: 0.6 * dialOn, ticks: 20, tickLen: 0.025, major: 4, seg: 40 });
    const len = Math.hypot(sx, sy) || 1;
    let nx = sx / len;
    let ny = sy / len;
    const c = f.P(0, 0, 0);
    if (c && f.hover > 0) {
      const d = Math.hypot(f.mx - c.x, f.my - c.y) || 1;
      nx = lerp(nx, (f.mx - c.x) / d, f.hover);
      ny = lerp(ny, -(f.my - c.y) / d, f.hover);
      const l = Math.hypot(nx, ny) || 1;
      nx /= l;
      ny /= l;
    }
    f.line([-nx * DIAL * 0.3, -ny * DIAL * 0.3, 0], [nx * DIAL * 0.82, ny * DIAL * 0.82, 0], pal.gold, 0.95 * dialOn, 1.75);
    f.dot([0, 0, 0], 0.022, pal.ink, 0.9 * dialOn);
  },
};

export default scene;
