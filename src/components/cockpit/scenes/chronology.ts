/**
 * CHRONOLOGY — the road trade has come down.
 *
 * The History of Trading is told in fifteen parts, so the instrument is a road
 * with fifteen milestones. It begins far off, where the light is, and winds
 * down the frame to where the visitor stands. Beside it, on each stone, is a
 * small emblem of its age: a flint, a string of shell beads, a coin, a ledger,
 * a banker's bench, a ship, an exchange arcade, a tulip, a bubble, a wall, a
 * dollar, a round table, a gold bar, a telephone, a rack of servers. A light
 * travels the road from the oldest to the newest; what it has passed stays
 * lit, and the milestone it is passing rises from its stone, in champagne,
 * and is named.
 *
 * The emblems are drawings and the road has no scale: the stones are evenly
 * spaced whatever the centuries between them, and nothing carries a date, a
 * numeral or a figure.
 *
 * The pointer: the traveller goes to the place on the road nearest the hand,
 * so the hand walks it up and down the whole history, and the milestone there
 * rises.
 */
import { TAU, clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, slab, trace } from "../kit";

const NAMES = ["FLINT", "BEADS", "COIN", "LEDGER", "BANK", "SHIP", "EXCHANGE", "TULIP", "BUBBLE", "WALL", "DOLLAR", "ROUND TABLE", "GOLD", "TELEPHONE", "ALGORITHMS"];
const N = NAMES.length;
/** seconds the light takes from the first milestone to the last */
const TRAVEL = 75;
/** the road: the floor it lies on, how far it swings, where it begins and ends in depth, its half-width */
const FY = -0.35;
const AMP = 1.2;
const ZFAR = 1.55;
const ZNEAR = -1.05;
const HW = 0.1;

type P3 = (u: number, v: number, w?: number) => V3;
/** what an emblem is drawn with: its own space (u across, v up, w away; one unit is its height), its colour, its light, the time */
type Kit = { p: P3; c: string; a: number; t: number };
type Stone = { s: number; x: number; z: number; k: number };
type State = { stones: Stone[]; ptr: number };

const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** the middle of the road at `s`: 0 where it begins, far off, 1 where it ends */
const road = (s: number): [number, number] => [AMP * Math.sin(TAU * 1.25 * s), lerp(ZFAR, ZNEAR, s)];
/** the unit vector across the road at `s`, always to the same hand */
const across = (s: number): [number, number] => {
  const a = road(s - 0.004);
  const b = road(s + 0.004);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
};

/** a cut-out: a dark body, a tint, an edge */
function card(f: Frame, pts: readonly V3[], colour: string, a: number, tint = 0.14): void {
  f.fill(pts, f.pal.bg, 0.9 * a);
  f.fill(pts, colour, tint * a);
  f.path(pts, colour, 0.85 * a, 1, true);
}

/** a circle (or an arc of one) facing the visitor, in an emblem's own space */
function round(p: P3, cu: number, cv: number, r: number, n: number, w = 0, from = 0, to = TAU): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push(p(cu + Math.cos(a) * r, cv + Math.sin(a) * r, w));
  }
  return out;
}

const EMBLEMS: ((f: Frame, k: Kit) => void)[] = [
  // a worked flint
  (f, { p, c, a }) => {
    card(f, [p(0, 1), p(0.28, 0.55), p(0.32, 0.2), p(0.12, 0), p(-0.15, 0.02), p(-0.3, 0.25), p(-0.22, 0.62)], c, a);
    f.path([p(0, 1), p(0.02, 0.5), p(0.12, 0)], c, 0.5 * a, 1);
    f.line(p(0.02, 0.5), p(0.32, 0.2), c, 0.4 * a, 1);
    f.line(p(0.02, 0.5), p(-0.3, 0.25), c, 0.4 * a, 1);
    f.line(p(0.02, 0.5), p(-0.22, 0.62), c, 0.4 * a, 1);
  },
  // shell beads on their string
  (f, { p, c, a }) => {
    const string: V3[] = [];
    for (let i = 0; i <= 8; i++) string.push(p(-0.45 + i * 0.1125, 0.9 - 0.62 * (1 - ((i - 4) / 4) ** 2)));
    f.path(string, c, 0.6 * a, 1);
    for (let i = 1; i < 8; i++) {
      f.path(round(p, -0.45 + i * 0.1125, 0.9 - 0.62 * (1 - ((i - 4) / 4) ** 2), 0.055, 8), c, 0.9 * a, 1);
      f.fill(round(p, -0.45 + i * 0.1125, 0.9 - 0.62 * (1 - ((i - 4) / 4) ** 2), 0.055, 8), c, 0.3 * a);
    }
  },
  // a struck coin
  (f, { p, c, a }) => {
    card(f, round(p, 0, 0.5, 0.42, 20, 0.12), c, a * 0.7);
    card(f, round(p, 0, 0.5, 0.42, 20), c, a, 0.18);
    f.path(round(p, 0, 0.5, 0.32, 16), c, 0.45 * a, 1);
    f.path([p(-0.08, 0.42), p(0.08, 0.42), p(0.08, 0.58), p(-0.08, 0.58)], c, 0.7 * a, 1, true);
  },
  // a ledger, open
  (f, { p, c, a }) => {
    for (const side of [-1, 1]) {
      const q = (x: number, v: number): V3 => p(side * 0.5 * x, lerp(0.1, 0.8, v) + 0.15 * x);
      card(f, [q(0, 0), q(1, 0), q(1, 1), q(0, 1)], c, a);
      for (let r = 0; r < 4; r++) f.line(q(0.14, 0.82 - r * 0.2), q(0.86, 0.82 - r * 0.2), c, 0.5 * a, 1);
    }
    f.line(p(0, 0.1), p(0, 0.8), c, 0.9 * a, 1.5);
  },
  // the banker's bench, with what was counted on it
  (f, { p, c, a }) => {
    for (const w of [0.16, -0.16]) {
      f.line(p(-0.42, 0, w), p(-0.42, 0.42, w), c, 0.7 * a, 1.5);
      f.line(p(0.42, 0, w), p(0.42, 0.42, w), c, 0.7 * a, 1.5);
    }
    card(f, [p(-0.5, 0.5, -0.2), p(0.5, 0.5, -0.2), p(0.5, 0.5, 0.2), p(-0.5, 0.5, 0.2)], c, a, 0.24);
    card(f, [p(-0.5, 0.42, -0.2), p(0.5, 0.42, -0.2), p(0.5, 0.5, -0.2), p(-0.5, 0.5, -0.2)], c, a);
    for (const [u, h] of [[-0.22, 0.16], [-0.04, 0.1], [0.18, 0.2]]) {
      card(f, [p(u - 0.07, 0.5), p(u + 0.07, 0.5), p(u + 0.07, 0.5 + h), p(u - 0.07, 0.5 + h)], c, a, 0.3);
      f.line(p(u - 0.07, 0.5 + h / 2), p(u + 0.07, 0.5 + h / 2), c, 0.5 * a, 1);
    }
  },
  // a merchant ship under sail
  (f, { p, c, a, t }) => {
    const roll = Math.sin(t * 0.5) * 0.02;
    f.line(p(0, 0.34), p(roll * 3, 1), c, 0.9 * a, 1.5);
    card(f, [p(0.03, 0.95 + roll), p(0.42, 0.48), p(0.03, 0.42)], c, a, 0.2);
    card(f, [p(-0.04, 0.88 - roll), p(-0.36, 0.48), p(-0.04, 0.44)], c, a, 0.12);
    card(f, [p(-0.5, 0.36), p(0.56, 0.4), p(0.34, 0.1), p(-0.32, 0.1)], c, a, 0.22);
    f.path([p(-0.56, 0.06), p(-0.36, 0), p(-0.16, 0.06), p(0.04, 0), p(0.24, 0.06), p(0.44, 0), p(0.58, 0.05)], c, 0.5 * a, 1);
  },
  // an exchange: an arcade under a pediment
  (f, { p, c, a }) => {
    card(f, [p(-0.5, 0), p(0.5, 0), p(0.5, 0.08), p(-0.5, 0.08)], c, a);
    for (let k = 0; k < 4; k++) f.line(p(-0.42 + k * 0.28, 0.08), p(-0.42 + k * 0.28, 0.52), c, 0.9 * a, 1.5);
    for (let k = 0; k < 3; k++) f.path(round(p, -0.28 + k * 0.28, 0.52, 0.14, 8, 0, 0, Math.PI), c, 0.7 * a, 1);
    card(f, [p(-0.5, 0.68), p(0.5, 0.68), p(0.5, 0.78), p(-0.5, 0.78)], c, a);
    card(f, [p(-0.5, 0.78), p(0, 1), p(0.5, 0.78)], c, a, 0.2);
  },
  // a tulip
  (f, { p, c, a }) => {
    f.path([p(0, 0), p(0.02, 0.3), p(0, 0.5)], c, 0.9 * a, 1.5);
    card(f, [p(0.02, 0.1), p(0.2, 0.26), p(0.3, 0.5), p(0.1, 0.34)], c, a, 0.1);
    card(f, [p(0, 0.16), p(-0.18, 0.28), p(-0.26, 0.46), p(-0.08, 0.34)], c, a, 0.1);
    card(f, [p(-0.2, 0.56), p(-0.26, 0.86), p(-0.1, 0.76), p(0, 1), p(0.1, 0.76), p(0.26, 0.86), p(0.2, 0.56), p(0, 0.48)], c, a, 0.24);
  },
  // a bubble
  (f, { p, c, a, t }) => {
    const bob = Math.sin(t * 0.45) * 0.025;
    f.fill(round(p, 0, 0.58 + bob, 0.4, 24), c, 0.09 * a);
    f.path(round(p, 0, 0.58 + bob, 0.4, 24), c, 0.9 * a, 1);
    f.path(round(p, 0, 0.58 + bob, 0.3, 8, 0, 2.0, 2.9), f.pal.ink, 0.7 * a, 1.5);
    f.path(round(p, 0.36, 0.12 - bob, 0.1, 12), c, 0.6 * a, 1);
    f.path(round(p, -0.32, 0.08 + bob * 0.5, 0.06, 10), c, 0.45 * a, 1);
  },
  // a wall
  (f, { p, c, a }) => {
    card(f, [p(-0.5, 0.7, 0), p(0.5, 0.7, 0), p(0.5, 0.7, 0.16), p(-0.5, 0.7, 0.16)], c, a, 0.26);
    card(f, [p(-0.5, 0), p(0.5, 0), p(0.5, 0.7), p(-0.5, 0.7)], c, a);
    for (let r = 0; r < 4; r++) {
      if (r) f.line(p(-0.5, r * 0.175), p(0.5, r * 0.175), c, 0.5 * a, 1);
      for (let j = 0; j < 4; j++) {
        const u = -0.5 + (j + (r % 2 ? 0.5 : 1)) * 0.25;
        if (u < 0.49) f.line(p(u, r * 0.175), p(u, (r + 1) * 0.175), c, 0.4 * a, 1);
      }
    }
  },
  // a dollar: the sign on a disc, and no numeral
  (f, { p, c, a }) => {
    card(f, round(p, 0, 0.5, 0.44, 20, 0.1), c, a * 0.7);
    card(f, round(p, 0, 0.5, 0.44, 20), c, a, 0.18);
    f.path(round(p, 0, 0.5, 0.35, 16), c, 0.4 * a, 1);
    f.path([p(0.14, 0.66), p(0.05, 0.73), p(-0.08, 0.71), p(-0.14, 0.62), p(-0.06, 0.53), p(0.06, 0.47), p(0.14, 0.38), p(0.08, 0.29), p(-0.05, 0.27), p(-0.14, 0.34)], c, 0.95 * a, 1.5);
    f.line(p(0, 0.2), p(0, 0.8), c, 0.8 * a, 1);
  },
  // a round table, and the seats at it
  (f, { p, c, a }) => {
    const seat = (i: number) => f.dot(p(Math.cos(i * 1.047 + 0.3) * 0.5, 0.28, Math.sin(i * 1.047 + 0.3) * 0.36), 0.02, c, 0.75 * a);
    for (let i = 0; i < 6; i++) if (Math.sin(i * 1.047 + 0.3) > 0) seat(i);
    f.line(p(0, 0, 0), p(0, 0.5, 0), c, 0.8 * a, 2);
    const top: V3[] = [];
    const base: V3[] = [];
    for (let i = 0; i < 20; i++) {
      top.push(p(Math.cos((i / 20) * TAU) * 0.44, 0.5, Math.sin((i / 20) * TAU) * 0.3));
      base.push(p(Math.cos((i / 20) * TAU) * 0.16, 0, Math.sin((i / 20) * TAU) * 0.11));
    }
    f.path(base, c, 0.6 * a, 1, true);
    card(f, top, c, a, 0.24);
    for (let i = 0; i < 6; i++) if (Math.sin(i * 1.047 + 0.3) <= 0) seat(i);
  },
  // a bar of gold
  (f, { p, c, a }) => {
    card(f, [p(-0.33, 0.38, -0.13), p(0.33, 0.38, -0.13), p(0.33, 0.38, 0.13), p(-0.33, 0.38, 0.13)], c, a, 0.32);
    card(f, [p(-0.45, 0, -0.2), p(0.45, 0, -0.2), p(0.33, 0.38, -0.13), p(-0.33, 0.38, -0.13)], c, a, 0.18);
    f.path([p(-0.14, 0.12, -0.18), p(0.14, 0.12, -0.18), p(0.12, 0.26, -0.15), p(-0.12, 0.26, -0.15)], c, 0.5 * a, 1, true);
  },
  // a telephone
  (f, { p, c, a }) => {
    card(f, [p(-0.4, 0), p(0.4, 0), p(0.27, 0.42), p(-0.27, 0.42)], c, a);
    f.path(round(p, 0, 0.2, 0.13, 14), c, 0.85 * a, 1);
    f.path(round(p, 0, 0.2, 0.05, 8), c, 0.6 * a, 1);
    f.line(p(-0.2, 0.42), p(-0.2, 0.54), c, 0.8 * a, 1.5);
    f.line(p(0.2, 0.42), p(0.2, 0.54), c, 0.8 * a, 1.5);
    f.path([p(-0.46, 0.5), p(-0.46, 0.62), p(-0.3, 0.7), p(0.3, 0.7), p(0.46, 0.62), p(0.46, 0.5)], c, 0.95 * a, f.mobile ? 2 : 3);
  },
  // a rack of servers
  (f, { p, c, a, t }) => {
    card(f, [p(-0.3, 1, 0), p(0.3, 1, 0), p(0.3, 1, 0.3), p(-0.3, 1, 0.3)], c, a, 0.3);
    card(f, [p(-0.3, 0), p(0.3, 0), p(0.3, 1), p(-0.3, 1)], c, a);
    for (let k = 0; k < 6; k++) {
      const v = 0.08 + k * 0.158;
      if (k) f.line(p(-0.3, v - 0.04), p(0.3, v - 0.04), c, 0.45 * a, 1);
      f.line(p(-0.22, v + 0.035), p(0.04, v + 0.035), c, 0.35 * a, 1);
      f.dot(p(0.2, v + 0.035), 0.009, c, a * (0.55 + 0.45 * Math.sin(t * 0.7 + k * 1.3)));
    }
  },
];

const scene: Scene<State> = {
  // the composed still: the light half way down the road, at the tulip
  pose: TRAVEL * 0.5,
  setup() {
    const stones: Stone[] = [];
    for (let i = 0; i < N; i++) {
      const s = (i + 0.5) / N;
      const [x, z] = road(s);
      // each stone stands on the far side of the road, so the light passes in front of it
      const n = across(s);
      const far = n[1] < 0 ? -1 : 1;
      // (the far ones are made a little larger, so that all fifteen read at about one size)
      stones.push({ s, x: x + n[0] * far * 0.19, z: z + n[1] * far * 0.19, k: lerp(0.34, 0.26, s) });
    }
    return { stones, ptr: 0.5 };
  },
  draw(f, st) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(Math.sin(f.t * 0.06) * 0.04, -0.5, 6.6, 1);

    deck(f, { y: FY, half: 3.75, alpha: 0.08, drift: 0 });
    pool(f, [0, FY, 0], 2.6, pal.key, 0.16 * f.boot);

    // ── the road, sampled from its far end to its near one
    const roadOn = f.on(0, 0.5);
    const n = Math.max(40, Math.round((m ? 64 : 96) * f.q));
    const mid: V3[] = [];
    const left: V3[] = [];
    const right: V3[] = [];
    for (let k = 0; k <= n; k++) {
      const s = k / n;
      const [x, z] = road(s);
      const [nx, nz] = across(s);
      mid.push([x, FY + 0.004, z]);
      left.push([x - nx * HW, FY + 0.002, z - nz * HW]);
      right.push([x + nx * HW, FY + 0.002, z + nz * HW]);
    }

    // ── where the light is: on its own way down the road, or where the hand has put it
    const auto = (f.t / TRAVEL) % 1;
    if (f.hover > 0.02) {
      let best = 1e9;
      let at = st.ptr;
      for (let k = 0; k <= n; k += 2) {
        const p = f.P(mid[k][0], mid[k][1], mid[k][2]);
        if (!p) continue;
        const d = (p.x - f.mx) ** 2 + (p.y - f.my) ** 2;
        if (d < best) {
          best = d;
          at = k / n;
        }
      }
      st.ptr += (at - st.ptr) * clamp(f.dt * 6);
    } else st.ptr = auto;
    const hand = smooth(f.hover);
    const pos = lerp(auto, st.ptr, hand);
    // (on its own it sets out from the far end and arrives at the near one unseen)
    const seen = lerp(clamp(pos / 0.03) * clamp((1 - pos) / 0.03), 1, hand) * f.on(0.5, 0.4);
    const here = Math.min(n - 1, Math.floor(pos * n));
    const frac = pos * n - here;
    const light: V3 = [lerp(mid[here][0], mid[here + 1][0], frac), FY + 0.05, lerp(mid[here][2], mid[here + 1][2], frac)];
    const foot: V3 = [light[0], FY + 0.004, light[2]];

    // the far end, where it all begins: a low light on the horizon
    f.glow([mid[0][0], FY + 0.08, mid[0][2] + 0.2], 0.7, pal.key, 0.3 * roadOn);
    f.line([-3, FY, ZFAR + 0.75], [3, FY, ZFAR + 0.75], pal.ink, 0.1 * roadOn, 1);

    const bed = [...left, ...right.slice().reverse()];
    f.fill(bed, pal.bg, 0.6 * roadOn);
    f.fill(bed, pal.ink, 0.045 * roadOn);
    // its verges and its middle line are fainter the further off they are
    const runs = 4;
    for (let r = 0; r < runs; r++) {
      const a = Math.floor((r * n) / runs);
      const b = Math.floor(((r + 1) * n) / runs) + 1;
      const fade = lerp(0.22, 0.5, (r + 0.5) / runs) * roadOn;
      f.path(left.slice(a, b), pal.ink, fade, 1);
      f.path(right.slice(a, b), pal.ink, fade, 1);
    }
    for (let k = 0; k < n; k += 2) f.line(mid[k], mid[k + 1], pal.ink, lerp(0.14, 0.4, k / n) * roadOn, 1);
    // the stretch already travelled is lit
    if (here > 0) trace(f, [...mid.slice(0, here + 1), foot], pal.key, 0.5 * seen, 1.25);
    ring(f, [mid[n][0], FY, mid[n][2]], 0.16, { colour: pal.key, alpha: 0.4 * roadOn, ticks: 12, tickLen: 0.03, seg: 28 });

    const traveller = () => {
      if (seen <= 0.003) return;
      pool(f, [light[0], FY, light[2]], 0.5, pal.gold, 0.3 * seen);
      // a short wake behind it on the road
      const from = Math.max(0, here - Math.round(n * 0.05));
      if (here > from) f.path([...mid.slice(from, here + 1), foot], pal.gold, 0.7 * seen, 2);
      f.line([light[0], FY, light[2]], light, pal.gold, 0.6 * seen, 1);
      lamp(f, light, pal.gold, seen * (f.still ? 1 : 0.88 + 0.12 * Math.sin(f.t * 1.1)), 0.026);
    };

    // ── the milestones, from the oldest and farthest to the newest and nearest; the light takes its place among them
    let passed = false;
    let name = -1;
    let nameAt: V3 = [0, 0, 0];
    let nameLift = 0;
    for (let i = 0; i < N; i++) {
      const s = st.stones[i];
      if (!passed && s.s > pos) {
        traveller();
        passed = true;
      }
      const on = f.on(0.15 + (i / N) * 0.7, 0.3);
      if (on <= 0) continue;
      // the one the light is passing rises; half way between two, both are half up
      const lift = smooth(1 - Math.abs(pos - s.s) * N) * seen;
      const reached = s.s <= pos + 0.5 / N;
      const colour = reached ? pal.key : pal.ink;
      const level = (reached ? 0.85 : 0.5) * lerp(0.75, 1, s.s);

      // the stone, and the stem the emblem stands on
      slab(f, [s.x - 0.035, FY, s.z - 0.025], [s.x + 0.035, FY + 0.07, s.z + 0.025], lift > 0.5 ? pal.gold : colour, 0.2, on);
      const y = FY + 0.11 + 0.14 * lift;
      f.line([s.x, FY + 0.07, s.z], [s.x, y, s.z], lift > 0.5 ? pal.gold : colour, 0.5 * on, 1);
      if (lift > 0.02) f.glow([s.x, y + s.k * 0.5, s.z], s.k * 1.5, pal.gold, 0.22 * lift * on);

      const k = s.k * (1 + 0.3 * lift) * (0.6 + 0.4 * on);
      const p: P3 = (u, v, w = 0) => [s.x + u * k, y + v * k, s.z + w * k];
      const t = f.still ? 3 : f.t;
      // it changes from its own light to champagne as it rises: two drawings, cross-faded
      if (lift < 0.98) EMBLEMS[i](f, { p, c: colour, a: level * on * (1 - lift), t });
      if (lift > 0.02) EMBLEMS[i](f, { p, c: pal.gold, a: on * lift, t });
      if (lift > nameLift) {
        nameLift = lift;
        name = i;
        nameAt = p(0, 1.05);
      }
    }
    if (!passed) traveller();

    if (name >= 0) f.label(NAMES[name], nameAt, { align: "center", dy: m ? -8 : -11, size: m ? 8 : 10, colour: pal.gold, alpha: nameLift });
  },
};

export default scene;
