/**
 * TRAILHEAD — six terraces, and the path that climbs them.
 *
 * A hillside is cut into six terraces, each a step higher and further back
 * than the last. A signboard stands at the foot, pointing in. From it one path
 * runs along the first terrace, climbs the bank at its end, and comes back
 * along the second: six runs, to and fro, to a beacon on the top. On each
 * terrace the path passes a waymarker. A light walks it from the signboard to
 * the beacon; the stretch behind it stays lit, each terrace it has reached
 * takes the key light, and the waymarker it is passing rises in champagne and
 * is named for its stage.
 *
 * The terraces are all one height and the runs are as long as the hill is
 * wide: nothing here says how long a stage takes, and there is no summit to
 * be reached by a date. The beacon is only where the path ends.
 *
 * The pointer sends the traveller to the stage nearest it.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, slab, trace } from "../kit";

const NAMES = ["MARKETS", "A TRADE", "RISK", "PRACTICE", "ACCOUNT", "RECORD"];
const N = NAMES.length;
/** seconds the light takes from the signboard to the beacon */
const TRAVEL = 54;
/** the ground, the height of one terrace, how far back each is set, and where the hill ends behind */
const [BASE, RISE, TREAD, BACK] = [-1.06, 0.26, 0.36, 1.4];
/** the top of terrace i, its front edge and its half-width */
const top = (i: number) => BASE + (i + 1) * RISE;
const edge = (i: number) => -0.9 + i * TREAD;
const half = (i: number) => 1.55 - i * 0.13;
/** how far back from its edge the path runs on each terrace, and how far behind the path a waymarker stands */
const [IN, SET] = [0.15, 0.13];
/** where the signboard stands */
const SIGN: V3 = [-1.34, BASE, -1.18];
/** how far along its run each waymarker stands */
const WHERE = [0.5, 0.4, 0.6, 0.44, 0.56, 0.5];

type Mark = { s: number; p: V3 };
type State = { verts: V3[]; cum: number[]; marks: Mark[]; enter: number[]; ptr: number };

const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const scene: Scene<State> = {
  // the composed still: the light at the third waymarker
  pose: TRAVEL * 0.52,
  setup() {
    // the path, corner by corner, with how far along it each corner is
    const verts: V3[] = [];
    const cum: number[] = [];
    let total = 0;
    const push = (p: V3) => {
      const q = verts[verts.length - 1];
      if (q) total += Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      verts.push(p);
      cum.push(total);
    };
    const marks: Mark[] = [];
    const enter: number[] = [];
    let x = -0.72 * half(0);
    push([SIGN[0] + 0.16, BASE + 0.004, SIGN[2]]);
    push([x, BASE + 0.004, edge(0) - 0.004]);
    for (let i = 0; i < N; i++) {
      const y = top(i) + 0.004;
      // up the bank, along the terrace past its waymarker, and back to the foot of the next bank
      push([x, y, edge(i) - 0.004]);
      enter.push(total);
      push([x, y, edge(i) + IN]);
      const end = i === N - 1 ? 0.1 : (i % 2 ? -1 : 1) * 0.72 * half(i);
      const mid = lerp(x, end, WHERE[i]);
      push([mid, y, edge(i) + IN]);
      marks.push({ s: total, p: [mid, top(i), edge(i) + IN + SET] });
      push([end, y, edge(i) + IN]);
      x = end;
      push([x, y, i === N - 1 ? edge(i) + 0.3 : edge(i + 1) - 0.004]);
    }
    const all = total || 1;
    return { verts, cum: cum.map((c) => c / all), marks: marks.map((k) => ({ s: k.s / all, p: k.p })), enter: enter.map((e) => e / all), ptr: 0.52 };
  },
  draw(f, st) {
    const { pal } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.22 + (f.still ? 0 : Math.sin(t * 0.06) * 0.035), -0.42, 6.8, m ? 0.78 : 0.8);
    const { verts, cum, marks } = st;
    const last = verts.length - 1;

    deck(f, { y: BASE, half: 4.5, alpha: 0.08, drift: 0 });
    pool(f, [0, BASE, -0.6], 2.6, pal.key, 0.16 * f.boot);

    // ── where the light is: on its own way up, or at the stage the hand has sent it to
    const auto = (t / TRAVEL) % 1;
    if (f.hover > 0.02) {
      let best = 1e9;
      let at = st.ptr;
      for (const k of marks) {
        const p = f.P(k.p[0], k.p[1] + 0.2, k.p[2]);
        if (!p) continue;
        const d = (p.x - f.mx) ** 2 + (p.y - f.my) ** 2;
        if (d < best) {
          best = d;
          at = k.s;
        }
      }
      st.ptr += (at - st.ptr) * clamp(f.dt * 5);
    } else st.ptr = auto;
    const hand = smooth(f.hover);
    const pos = clamp(lerp(auto, st.ptr, hand), 0, 0.9999);
    // (on its own it sets out from the signboard and arrives at the beacon unseen)
    const seen = lerp(clamp(pos / 0.03) * clamp((1 - pos) / 0.03), 1, hand) * f.on(0.6, 0.4);
    let here = 0;
    while (here < last - 1 && cum[here + 1] <= pos) here++;
    const span = cum[here + 1] - cum[here];
    const fr = span > 1e-6 ? clamp((pos - cum[here]) / span) : 0;
    const foot: V3 = [lerp(verts[here][0], verts[here + 1][0], fr), lerp(verts[here][1], verts[here + 1][1], fr), lerp(verts[here][2], verts[here + 1][2], fr)];
    const light: V3 = [foot[0], foot[1] + 0.07, foot[2] - 0.01];

    // ── the hillside: six terraces, from the lowest and nearest to the highest; one it has reached takes the key light
    for (let i = 0; i < N; i++) {
      const on = f.on(i * 0.1, 0.4);
      if (on <= 0) continue;
      const [h, y, z] = [half(i), top(i), edge(i)];
      slab(f, [-h, y - RISE, z], [h, y, BACK], pal.ink, 0.1, on);
      const reached = clamp((pos - st.enter[i]) / 0.02) * seen;
      const tread = i === N - 1 ? BACK : edge(i + 1);
      f.fill([[-h, y, z], [h, y, z], [h, y, tread], [-h, y, tread]], pal.key, 0.07 * reached * on);
      f.line([-h, y, z], [h, y, z], pal.key, 0.7 * reached * on, 1.25);
      // the bank is ruled, as cut earth is drawn
      if (!m) for (let r = 1; r < 3; r++) f.line([-h, y - (RISE * r) / 3, z], [h, y - (RISE * r) / 3, z], pal.ink, 0.1 * on, 1);
    }

    // ── the path: faint all the way, lit as far as the light has come
    const pathOn = f.on(0.4, 0.5);
    f.path(verts, pal.ink, 0.42 * pathOn, 1.25);
    for (let i = 0; i < N; i++) {
      // rungs where it climbs a bank
      const a = verts[1 + i * 5];
      for (let r = 1; r <= 3; r++) f.line([a[0] - 0.035, lerp(a[1], a[1] + RISE, r / 4), a[2]], [a[0] + 0.035, lerp(a[1], a[1] + RISE, r / 4), a[2]], pal.ink, 0.4 * pathOn, 1);
    }
    if (seen > 0.003) trace(f, [...verts.slice(0, here + 1), foot], pal.key, 0.65 * seen, 1.4);

    // ── the beacon where it ends: a mast, a lamp, and two slow rings
    const beaconOn = f.on(0.7, 0.3);
    const end = verts[last];
    const arrived = smooth((pos - 0.86) / 0.12) * seen;
    const head: V3 = [end[0], end[1] + 0.36, end[2]];
    f.line(end, head, pal.ink, 0.6 * beaconOn, 1.5);
    f.line([end[0] - 0.07, end[1], end[2]], [end[0] + 0.07, end[1], end[2]], pal.ink, 0.6 * beaconOn, 1.5);
    for (let r = 0; r < 2; r++) {
      const grow = f.still ? 0.35 + r * 0.4 : (t / 9 + r / 2) % 1;
      ring(f, head, 0.06 + 0.26 * grow, { colour: pal.gold, alpha: (0.3 + 0.4 * arrived) * Math.sin(Math.PI * grow) * beaconOn, seg: 28 });
    }
    lamp(f, head, pal.gold, (0.55 + 0.45 * arrived) * beaconOn, 0.024);

    // ── the waymarkers, the highest first: a post and a plate, and the one the light is passing rises and is named
    let name = -1;
    let nameAt: V3 = [0, 0, 0];
    let nameLift = 0;
    for (let i = N - 1; i >= 0; i--) {
      const k = marks[i];
      const on = f.on(0.3 + i * 0.08, 0.3);
      if (on <= 0) continue;
      const lift = smooth(1 - Math.abs(pos - k.s) * 11) * seen;
      const passed = clamp((pos - k.s) / 0.01 + 1) * seen;
      const y = k.p[1] + 0.19 + 0.09 * lift;
      const c: V3 = [k.p[0], y, k.p[2]];
      const r = 0.055 * (1 + 0.5 * lift);
      f.line(k.p, c, pal.ink, 0.5 * on, 1.5);
      f.line([k.p[0] - 0.04, k.p[1], k.p[2]], [k.p[0] + 0.04, k.p[1], k.p[2]], pal.ink, 0.5 * on, 1.5);
      const plate: V3[] = [[c[0], y - r, c[2]], [c[0] + r, y, c[2]], [c[0], y + r, c[2]], [c[0] - r, y, c[2]]];
      f.fill(plate, pal.bg, 0.92 * on);
      // it changes from plain to lit to champagne: three drawings, cross-faded
      f.path(plate, pal.ink, 0.5 * on * (1 - passed), 1, true);
      f.fill(plate, pal.key, 0.22 * on * passed * (1 - lift));
      f.path(plate, pal.key, 0.9 * on * passed * (1 - lift), 1.25, true);
      f.fill(plate, pal.gold, 0.3 * on * lift);
      f.path(plate, pal.gold, on * lift, 1.5, true);
      if (lift > 0.02) f.glow(c, 0.3, pal.gold, 0.3 * lift * on);
      if (lift > nameLift) {
        nameLift = lift;
        name = i;
        nameAt = [c[0], y + r, c[2]];
      }
    }

    // ── the traveller
    if (seen > 0.003) {
      pool(f, foot, 0.42, pal.gold, 0.3 * seen);
      f.line(foot, light, pal.gold, 0.6 * seen, 1);
      lamp(f, light, pal.gold, seen * (f.still ? 1 : 0.88 + 0.12 * Math.sin(t * 1.1)), 0.026);
    }

    // ── the signboard at the foot: a post and a board that points the way in
    const signOn = f.on(0.5, 0.4);
    const [sx, sz] = [SIGN[0], SIGN[2]];
    f.line(SIGN, [sx, BASE + 0.5, sz], pal.ink, 0.7 * signOn, 2);
    f.line([sx - 0.07, BASE, sz], [sx + 0.07, BASE, sz], pal.ink, 0.6 * signOn, 1.5);
    const board: V3[] = [[sx - 0.04, BASE + 0.3, sz - 0.01], [sx + 0.36, BASE + 0.3, sz - 0.01], [sx + 0.46, BASE + 0.4, sz - 0.01], [sx + 0.36, BASE + 0.5, sz - 0.01], [sx - 0.04, BASE + 0.5, sz - 0.01]];
    f.fill(board, pal.bg, 0.94 * signOn);
    f.fill(board, pal.gold, 0.12 * signOn);
    f.path(board, pal.gold, 0.85 * signOn, 1.25, true);
    f.line([sx + 0.02, BASE + 0.43, sz - 0.012], [sx + 0.3, BASE + 0.43, sz - 0.012], pal.gold, 0.9 * signOn, 2);
    f.line([sx + 0.02, BASE + 0.36, sz - 0.012], [sx + 0.2, BASE + 0.36, sz - 0.012], pal.ink2, 0.7 * signOn, 1.25);

    if (name >= 0) f.label(NAMES[name], nameAt, { align: "center", dy: m ? -8 : -11, size: m ? 8 : 10, colour: pal.gold, alpha: nameLift });
  },
};

export default scene;
