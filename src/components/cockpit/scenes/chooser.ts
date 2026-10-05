/**
 * CHOOSER — a balance with three sides.
 *
 * The page asks a few questions and sets three account types against the
 * answers. So the instrument is a three-cornered plate of glass, balanced on
 * one point. A rail runs from its hub to each corner, and on every rail ride
 * the same few weights, one for each thing a visitor may care about. As the
 * weights slide out along a rail the plate leans that way; the needle standing
 * on its hub leans with it, toward one of three marks on the ring above. Under
 * each corner waits a pane on a plinth: CLASSIC, PREMIUM, ECN. The one the
 * plate leans to takes a champagne edge, and a line of light drops to it.
 *
 * Left alone, the weights are tried each way in turn. The pointer is the
 * visitor's own answer: the weights run out toward the pane it is nearest,
 * and the plate follows.
 *
 * The weights are beads and the rails carry no scale. Nothing here says which
 * account suits anyone: the questions on the page do that, for one visitor.
 */
import { TAU, clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, panel, pool, ring, slab } from "../kit";

const FLOOR = -1.15;
const NAMES = ["CLASSIC", "PREMIUM", "ECN"] as const;
/** where the three corners point: back left, front, back right */
const DIRS = [150, 270, 30].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)] as const);
/** the plate: its height at rest and the reach of its corners; and how far out the plinths stand */
const [PLATE_Y, PLATE_R, POST_R] = [-0.3, 0.9, 1.2];
/** the plinths and the panes on them */
const [POST_H, PANE_W, PANE_H] = [0.3, 0.44, 0.34];
/** how tall the needle is, and the height of the ring it reads against */
const NEEDLE = 0.72;
/** seconds the plate leans one way before the weights are tried the next way */
const TURN = 7;
/** weights on a rail, at most */
const PER = 5;
/** scratch, reused every frame: where each weight sits on its rail, and each rail's mean */
const seat = new Float32Array(3 * PER);
const mean = new Float32Array(3);
const reach = new Float32Array(3);

type State = { w: number[]; phase: number };

const scene: Scene<State> = {
  // the composed still: the plate leaning to the front pane
  pose: TURN,
  setup(f) {
    return { w: [0.125, 1, 0.125], phase: f.rnd(5) * 6 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    // a single composed frame (reduced motion, or the engine measuring the drawing): nothing is eased
    const composed = f.still || f.dt === 0;
    f.aim(0.1 + (f.still ? 0 : Math.sin(f.t * 0.06 + s.phase) * 0.04), -0.3, 6.3, m ? 0.84 : 0.88);

    const per = m ? 3 : PER;
    const tones = [pal.teal, pal.blue, pal.emerald, pal.indigo, pal.ink2];
    const paneAt = (i: number): V3 => [DIRS[i][0] * POST_R, FLOOR + POST_H + PANE_H / 2, DIRS[i][1] * POST_R];

    // ── how much each side is wanted: each in turn when left alone, the pane nearest the pointer otherwise
    let top = 0;
    for (let i = 0; i < 3; i++) {
      const p = f.hover > 0 ? f.P(...paneAt(i)) : null;
      reach[i] = p ? clamp(1 - Math.hypot(p.x - f.mx, p.y - f.my) / (f.box.w * 0.62)) : 0;
      if (reach[i] > top) top = reach[i];
    }
    const rate = clamp(f.dt * 2.5);
    for (let i = 0; i < 3; i++) {
      const idle = Math.pow(0.5 + 0.5 * Math.cos(TAU * (f.t / (TURN * 3) - i / 3)), 1.5);
      const want = top > 0 ? lerp(idle, Math.pow(reach[i] / top, 3), f.hover) : idle;
      s.w[i] = composed ? idle : s.w[i] + (want - s.w[i]) * rate;
    }

    // ── the weights take their seats, and the plate leans to the side that carries most
    let all = 0;
    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let j = 0; j < per; j++) {
        // no two weights answer alike, and each drifts a little on its rail
        const drift = composed ? 0 : Math.sin(f.t * 0.23 + j * 1.7 + i * 2.3) * 0.07;
        const at = lerp(0.2, 0.92, clamp(s.w[i] * (0.72 + 0.28 * f.rnd(i * 7 + j)) + drift));
        seat[i * PER + j] = at;
        sum += at;
      }
      mean[i] = sum / per;
      all += mean[i] / 3;
    }
    let tx = 0;
    let tz = 0;
    for (let i = 0; i < 3; i++) {
      tx += DIRS[i][0] * (mean[i] - all) * 0.4;
      tz += DIRS[i][1] * (mean[i] - all) * 0.4;
    }
    /** a point of the plate: along rail `i`, `r` from the hub, `lift` above the glass */
    const on = (i: number, r: number, lift = 0): V3 => {
      const x = DIRS[i][0] * r;
      const z = DIRS[i][1] * r;
      return [x, PLATE_Y - (tx * x + tz * z) + lift, z];
    };
    const lit = (i: number) => clamp((s.w[i] - 0.45) * 2.2);
    const own = f.tag ? NAMES.findIndex((n) => f.tag.toLowerCase().includes(n.toLowerCase())) : -1;

    deck(f, { y: FLOOR, alpha: 0.11 });
    pool(f, [0, FLOOR, 0], 2.2, pal.key, 0.2 * f.boot);
    ring(f, [0, FLOOR, 0], 1.5, { axis: "y", colour: pal.ink, alpha: 0.16 * f.boot, ticks: m ? 24 : 48, major: 4, tickLen: 0.06 });

    /** a plinth, the pane standing on it and its name */
    const post = (i: number) => {
      const up = f.on(0.1 + i * 0.12, 0.4);
      if (up <= 0.003) return;
      const l = Math.max(lit(i), i === own ? 1 : 0);
      const c = paneAt(i);
      const [x, , z] = c;
      pool(f, [x, FLOOR, z], 0.6, pal.gold, 0.3 * l * up);
      slab(f, [x - 0.2, FLOOR, z - 0.2], [x + 0.2, FLOOR + POST_H, z + 0.2], pal.ink, 0.1 + 0.08 * l, up);
      // the pane faces the hub
      const pa = panel(f, c, PANE_W, PANE_H, { yaw: Math.atan2(-DIRS[i][0], -DIRS[i][1]), colour: pal.key, alpha: 0.35 + 0.3 * l, glass: 0.035 + 0.06 * l, on: up });
      f.line(pa.at(0, 1), pa.at(1, 1), pal.gold, l * up, 1.75);
      for (let r = 0; r < 3; r++) {
        const v = 0.7 - r * 0.2;
        f.line(pa.at(0.14, v), pa.at(0.14 + 0.72 * (0.55 + 0.45 * f.rnd(i * 5 + r + 40)), v), l > 0.5 ? pal.ink : pal.ink2, (0.4 + 0.5 * l) * up, 1.2);
      }
      lamp(f, pa.at(0.5, 1, -0.01), pal.gold, l * up, 0.014);
      const front = i === 1;
      f.label(NAMES[i], front ? pa.at(1, 0.5) : pa.at(0.5, 1), {
        align: front ? "left" : "center",
        dx: front ? 10 : 0,
        dy: front ? 0 : -12,
        size: m ? 8 : 10,
        colour: l > 0.5 ? pal.gold : pal.ink2,
        alpha: (0.6 + 0.4 * l) * up,
      });
    };
    post(0);
    post(2);

    // ── the point the plate is balanced on
    const stand = f.on(0, 0.35);
    slab(f, [-0.05, FLOOR, -0.05], [0.05, PLATE_Y - 0.1, 0.05], pal.ink, 0.1, stand);
    ring(f, [0, PLATE_Y - 0.07, 0], 0.16, { axis: "y", colour: pal.key, alpha: 0.45 * stand, seg: 30 });

    // ── the plate: smoked glass, a lit rim, an inner outline, a rail to every corner
    const plateOn = f.on(0.25, 0.4);
    const hub = on(0, 0);
    const tri: V3[] = [on(0, PLATE_R), on(1, PLATE_R), on(2, PLATE_R)];
    f.fill(tri, pal.bg, 0.6 * plateOn);
    f.fill(tri, pal.ink, 0.045 * plateOn);
    f.path(tri, pal.ink, 0.42 * plateOn, 1, true);
    f.path(tri, pal.key, 0.3 * plateOn, 2.5, true);
    f.path([on(0, PLATE_R * 0.5), on(1, PLATE_R * 0.5), on(2, PLATE_R * 0.5)], pal.ink, 0.13 * plateOn, 1, true);
    for (let i = 0; i < 3; i++) {
      const l = lit(i);
      f.line(hub, tri[i], l > 0.5 ? pal.gold : pal.ink, (0.3 + 0.4 * l) * plateOn, 1);
      f.dot(tri[i], 0.016, l > 0.5 ? pal.gold : pal.ink, (0.5 + 0.5 * l) * plateOn);
    }

    // ── the weights on their rails: the same few on each, one colour for each thing asked
    const beadsOn = f.on(0.45, 0.4);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < per; j++) {
        const at = seat[i * PER + j];
        const p = on(i, at * PLATE_R, 0.035);
        const out = clamp((at - 0.55) * 3);
        if (out > 0.05) f.glow(p, 0.09, tones[j], 0.45 * out * beadsOn);
        f.dot(p, 0.03 + 0.012 * f.near(p, 44), tones[j], (0.6 + 0.4 * out) * beadsOn);
        f.dot(p, 0.011, pal.ink, 0.7 * out * beadsOn);
      }
    }

    // ── what the lean chooses: light drops from the low corner to the pane that waits under it
    for (let i = 0; i < 3; i++) {
      const l = lit(i) * plateOn;
      if (l <= 0.01) continue;
      const to = paneAt(i);
      f.line(tri[i], [to[0], to[1] + PANE_H / 2, to[2]], pal.gold, 0.7 * l, 1);
      f.glow(tri[i], 0.16, pal.gold, 0.5 * l);
    }

    // ── the needle stands square on the plate, so it leans as the plate does; the ring above is fixed
    const dialOn = f.on(0.6, 0.4);
    const dial: V3 = [0, PLATE_Y + NEEDLE, 0];
    const nx = tx * 1.9;
    const nz = tz * 1.9;
    const len = Math.hypot(nx, 1, nz);
    const tip: V3 = [hub[0] + (nx / len) * NEEDLE, hub[1] + NEEDLE / len, hub[2] + (nz / len) * NEEDLE];
    f.line(hub, dial, pal.ink, 0.18 * dialOn, 1);
    ring(f, dial, 0.26, { axis: "y", colour: pal.ink, alpha: 0.3 * dialOn, ticks: 24, major: 8, tickLen: 0.035, seg: 40 });
    for (let i = 0; i < 3; i++) {
      const l = lit(i);
      const mark: V3 = [dial[0] + DIRS[i][0] * 0.26, dial[1], dial[2] + DIRS[i][1] * 0.26];
      if (l > 0.5) lamp(f, mark, pal.gold, l * dialOn, 0.013);
      else f.dot(mark, 0.013, pal.ink, 0.6 * dialOn);
    }
    f.line(hub, tip, pal.gold, 0.9 * dialOn, 1.5);
    lamp(f, tip, pal.gold, 0.8 * dialOn, 0.012);
    f.dot(hub, 0.022, pal.ink, 0.8 * plateOn);

    // the pane in front stands nearer than the plate, so it is drawn last
    post(1);
  },
};

export default scene;
