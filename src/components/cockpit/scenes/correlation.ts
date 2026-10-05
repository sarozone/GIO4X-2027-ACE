/**
 * CORRELATION — two series, and the shape their pairs make.
 *
 * A pane of glass carries two traces, A and B, one over the other. Under it,
 * on a small turntable, is their scatter: one point for every pair, A along
 * one axis and B up the other, with a little depth so that it can be seen in
 * the round. The cloud is made of the very pairs on the pane. When B follows A
 * the points draw in to a line that climbs; as the two come apart the line
 * thickens to a ball; and when B does the opposite of A it draws in again to a
 * line that falls. The champagne line through the cloud is the relationship
 * itself, and it fades as there is less of one.
 *
 * A reading travels along the pane from pair to pair, and its point in the
 * cloud lights, on a thread, so that it is plain where each point comes from.
 * On the rail in front a lamp shows where the relationship stands.
 *
 * The two series are drawn from the page's own noise: they are no market and
 * no instrument, the axes carry tick marks only, and nothing here is the
 * coefficient of anything. The page below works that out from what the
 * visitor pastes.
 *
 * The pointer: across the frame it leans the relationship, from together at
 * the left, through unrelated, to opposite at the right. The point under it
 * becomes the one that is read.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, panel, pool, ring, trace } from "../kit";

const FLOOR = -1.05;
/** the pane: its centre, width and height */
const PANE: V3 = [0, 0.76, 0.25];
const [PW, PH] = [3, 0.56];
/** where the traces run on the pane: the margin at each end, the middle of A and of B, the height of one deviation */
const [EDGE, VA, VB, AMP] = [0.06, 0.68, 0.32, 0.085];
/** the cloud: its centre, the size of one deviation, and how many deviations out anything is drawn */
const CLOUD: V3 = [0, -0.24, 0];
const [S, MAX] = [0.21, 2.6];
/** how far its axes reach */
const AXIS = S * MAX;
/** the rail in front: its height, its depth, half its length */
const [RY, RZ, RAIL] = [FLOOR + 0.05, -0.4, 1.05];
/** the closest the relationship comes to perfect, and seconds the reading spends on one pair */
const [FULL, DWELL] = [0.985, 1.1];

type State = {
  n: number;
  /** A, the part of B that owes nothing to A, and the depth of each pair: all in deviations */
  a: Float32Array;
  e: Float32Array;
  w: Float32Array;
  /** where the relationship stands, -1 to 1, and which pair is being read */
  r: number;
  read: number;
  phase: number;
};

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};
const cut = (v: number) => clamp(v, -MAX, MAX);

/** take the mean out of a series and scale it to one deviation */
function standard(v: Float32Array): void {
  let mean = 0;
  for (let i = 0; i < v.length; i++) mean += v[i];
  mean /= Math.max(1, v.length);
  let sq = 0;
  for (let i = 0; i < v.length; i++) {
    v[i] -= mean;
    sq += v[i] * v[i];
  }
  const dev = Math.sqrt(sq / Math.max(1, v.length));
  if (dev > 1e-6) for (let i = 0; i < v.length; i++) v[i] /= dev;
}

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    const n = f.mobile ? 28 : 44;
    const a = new Float32Array(n);
    const e = new Float32Array(n);
    const w = new Float32Array(n);
    // two wandering series that know nothing of each other
    let [va, ve] = [0, 0];
    for (let i = 0; i < n; i++) {
      va = va * 0.72 + f.rnd(i * 3 + 1) - 0.5;
      ve = ve * 0.72 + f.rnd(i * 3 + 2) - 0.5;
      a[i] = va;
      e[i] = ve;
      w[i] = f.rnd(i * 3 + 3) - 0.5;
    }
    standard(a);
    standard(e);
    // whatever the second happens to share with the first is taken out of it, so that mixing the two
    // back together in a chosen proportion gives a cloud of exactly that lean
    let dot = 0;
    for (let i = 0; i < n; i++) dot += a[i] * e[i];
    for (let i = 0; i < n; i++) e[i] -= (dot / n) * a[i];
    standard(e);
    standard(w);
    return { n, a, e, w, r: 0.82, read: n * 0.62, phase: f.rnd(4) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    const n = s.n;
    f.aim(0.12 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.03), -0.1, 6.4, 1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.2, pal.key, 0.2 * f.boot);

    // ── the relationship: it swings slowly from together to opposite and back; under the pointer it is set by hand
    const auto = 0.97 * Math.sin(t * 0.11 + 1);
    const held = lerp(1.15, -1.15, clamp((f.mx - f.box.x) / f.box.w));
    const want = clamp(lerp(auto, held, smooth(f.hover)), -FULL, FULL);
    s.r = f.still ? 0.82 : s.r + (want - s.r) * (1 - Math.exp(-f.dt * 3.5));
    const r = s.r;
    // what is left to chance: nothing when the two move as one, everything when they are unrelated
    const loose = Math.sqrt(Math.max(0, 1 - r * r));
    const b = (i: number) => r * s.a[i] + loose * s.e[i];

    // ── the turntable: the cloud is shown a little from each side, never from behind
    const turn = (f.still ? 0.35 : 0.5 * Math.sin(t * 0.12 + s.phase)) + f.px * 0.2;
    const [ct, st] = [Math.cos(turn), Math.sin(turn)];
    /** a pair, in deviations, to its place in the cloud */
    const place = (x: number, y: number, z: number): V3 => {
      const [lx, lz] = [cut(x) * S, cut(z) * S * loose];
      return [CLOUD[0] + lx * ct + lz * st, CLOUD[1] + cut(y) * S, CLOUD[2] - lx * st + lz * ct];
    };
    const cloudOn = f.on(0.3, 0.4);
    ring(f, [0, FLOOR, 0], 0.82, { colour: pal.ink, alpha: 0.22 * cloudOn, ticks: m ? 24 : 48, major: 6, tickLen: 0.035, rot: turn });
    f.line([0, FLOOR, 0], [0, CLOUD[1] - AXIS, 0], pal.ink, 0.18 * cloudOn, 1);
    // its two axes, in tick marks only
    const [ax0, ax1] = [place(-AXIS / S, 0, 0), place(AXIS / S, 0, 0)];
    const [ay0, ay1]: V3[] = [[CLOUD[0], CLOUD[1] - AXIS, CLOUD[2]], [CLOUD[0], CLOUD[1] + AXIS, CLOUD[2]]];
    f.line(ax0, ax1, pal.ink, 0.3 * cloudOn, 1);
    f.line(ay0, ay1, pal.ink, 0.3 * cloudOn, 1);
    for (let k = -3; k <= 3; k++) {
      if (!k) continue;
      const d = (k * AXIS) / 3 / S;
      const px = place(d, 0, 0);
      f.line(px, [px[0], px[1] - 0.03, px[2]], pal.ink, 0.3 * cloudOn, 1);
      f.line([CLOUD[0], CLOUD[1] + d * S, CLOUD[2]], [CLOUD[0] + 0.03 * ct, CLOUD[1] + d * S, CLOUD[2] - 0.03 * st], pal.ink, 0.3 * cloudOn, 1);
    }

    // ── the cloud: one point for each pair. The one the pointer is on is found on the way
    let hot = -1;
    let hottest = 0.05;
    for (let i = 0; i < n; i++) {
      const p = place(s.a[i], b(i), s.w[i]);
      const touch = f.near(p, m ? 30 : 46);
      if (touch > hottest) {
        hottest = touch;
        hot = i;
      }
      // the points at the back of the cloud are fainter
      const depth = clamp(0.5 - (p[2] - CLOUD[2]) / (S * 3));
      const on = f.on(0.3 + (0.4 * i) / n, 0.3);
      f.dot(p, 0.015 + 0.01 * touch, touch > 0.3 ? pal.ink : pal.key, (0.45 + 0.45 * depth + 0.3 * touch) * on);
    }
    // the relationship itself: the line the cloud draws in to
    const lean = smooth(Math.abs(r) * 1.5) * cloudOn;
    trace(f, [place(-2.3, -2.3 * r, 0), place(2.3, 2.3 * r, 0)], pal.gold, 0.85 * lean, 1.5);

    // ── the pane and its two traces
    const second = pal.key === pal.teal ? pal.blue : pal.teal;
    const pane = panel(f, PANE, PW, PH, { tilt: -0.05, on: f.on(0, 0.4), colour: pal.key });
    const u = (i: number) => EDGE + ((1 - 2 * EDGE) * i) / (n - 1);
    const drawn = f.on(0.2, 0.5);
    const upto = Math.max(2, Math.round(n * drawn));
    const ptsA: V3[] = [];
    const ptsB: V3[] = [];
    for (let i = 0; i < upto; i++) {
      ptsA.push(pane.at(u(i), VA + cut(s.a[i]) * AMP, 0.01));
      ptsB.push(pane.at(u(i), VB + cut(b(i)) * AMP, 0.01));
    }
    trace(f, ptsA, pal.key, 0.85 * pane.on, 1.3);
    trace(f, ptsB, second, 0.85 * pane.on, 1.3);

    // ── the reading: it goes from pair to pair along the pane, or stands on the pair under the pointer
    const tour = (t / DWELL) % (n - 1);
    const aim = hot >= 0 ? hot : f.still ? n * 0.62 : tour;
    s.read = f.still ? aim : s.read + (aim - s.read) * (1 - Math.exp(-f.dt * 6));
    const pos = clamp(s.read, 0, n - 1.001);
    const i0 = Math.floor(pos);
    const k = pos - i0;
    const ra = lerp(s.a[i0], s.a[i0 + 1], k);
    const rb = lerp(b(i0), b(i0 + 1), k);
    // it dims while it travels back from the last pair to the first
    const read = clamp(1.5 - Math.abs(aim - s.read) / 3) * f.on(0.6, 0.3);
    const ur = EDGE + ((1 - 2 * EDGE) * pos) / (n - 1);
    const point = place(ra, rb, lerp(s.w[i0], s.w[i0 + 1], k));
    f.line(pane.at(ur, 0.06, 0.01), pane.at(ur, 0.94, 0.01), pal.gold, 0.4 * read, 1);
    f.line(pane.at(ur, 0, 0), point, pal.gold, 0.3 * read, 1);
    lamp(f, pane.at(ur, VA + cut(ra) * AMP, 0.012), pal.key, read, 0.012);
    lamp(f, pane.at(ur, VB + cut(rb) * AMP, 0.012), second, read, 0.012);
    lamp(f, point, pal.gold, read, 0.019);

    // ── the rail: where the relationship stands, from together to opposite
    const railOn = f.on(0.75, 0.25);
    f.line([-RAIL, RY, RZ], [RAIL, RY, RZ], pal.ink, 0.32 * railOn, 1);
    for (let i = -5; i <= 5; i++) {
      const x = (i * RAIL) / 5;
      f.line([x, RY, RZ], [x, RY + (i % 5 ? 0.03 : 0.06), RZ], pal.ink, (i % 5 ? 0.3 : 0.55) * railOn, 1);
    }
    lamp(f, [(-r / FULL) * RAIL, RY, RZ], pal.gold, railOn, 0.02);

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 8 : 10;
    const dy = m ? 10 : 13;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    f.label("A", pane.at(0.025, VA), { align: "center", size, colour: pal.key, alpha: 0.95 * named });
    f.label("B", pane.at(0.025, VB), { align: "center", size, colour: second, alpha: 0.95 * named });
    f.label("A", ax1, { size, colour: pal.key, alpha: 0.85 * named, dx: 7 });
    f.label("B", ay1, { size, colour: second, alpha: 0.85 * named, dx: 7, dy: 2 });
    // each end of the rail, and its middle, reads more strongly as the lamp comes to it
    f.label("TOGETHER", [-RAIL, RY, RZ], { size, colour: pal.ink2, alpha: (0.55 + 0.45 * clamp(r)) * named, dy });
    f.label("OPPOSITE", [RAIL, RY, RZ], { align: "right", size, colour: pal.ink2, alpha: (0.55 + 0.45 * clamp(-r)) * named, dy });
    if (!m) f.label("UNRELATED", [0, RY, RZ], { align: "center", size, colour: pal.ink2, alpha: (0.55 + 0.45 * clamp(1 - Math.abs(r) * 2)) * named, dy });
    ctx.restore();
  },
};

export default scene;
