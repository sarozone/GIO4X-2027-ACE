/**
 * MERIDIAN — one trading day, read on eight clocks.
 *
 * Eight clock faces lie in a ring, seen from above, one for each region the
 * page keeps time for. They are three hours apart, so no two hands agree: it
 * is the same moment and a different hour on every face. A single line turns
 * about the middle, the noon line, and the working day goes round the ring
 * with it: a face is lit while its own hour is inside it. Within the ring lie
 * four arcs, the four trading sessions, each fixed over its part of the ring,
 * and the light passes along them in turn, two at once where they overlap.
 *
 * It is a model of how the day goes round, not a clock: no face is named, no
 * hour is the visitor's, and nothing here says what is open now. The page
 * below works that out from the real timetable.
 *
 * The pointer: the noon line follows it round the ring, so the day is turned
 * by hand; and the face under it rises.
 */
import { TAU, clamp, type Frame, type Scene, type V3 } from "../engine";
import { lamp, pool, ring, ringPoint, trace } from "../kit";

const N = 8;
/** the ring of faces, a face, the hub */
const [RR, FR, HUB] = [1.28, 0.26, 0.24];
/** seconds for the day to go once round */
const DAY = 240;
/** the faces stand between the compass points, so the ring is no wider than it is deep */
const OFF = 1 / 16;
/** the four sessions, as arcs: from and to in turns round the ring, and the radius each lies at */
const ARCS: readonly (readonly [number, number, number])[] = [
  [0.7, 1.0, 0.46],
  [0.58, 0.88, 0.59],
  [0.25, 0.55, 0.72],
  [0.08, 0.38, 0.85],
];
const O: V3 = [0, 0, 0];

const FACES = Array.from({ length: N }, (_, i) => {
  const a = (i / N + OFF) * TAU;
  return { i, x: Math.cos(a) * RR, z: Math.sin(a) * RR };
}).sort((p, q) => q.z - p.z);

const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** the hour, 0 to 24, at a place `turn` of the way round the ring when the day stands at `day` (0 to 1) */
const hourAt = (day: number, turn: number) => (((day * 24 + (turn - OFF) * 24) % 24) + 24) % 24;
/** how far inside the working day an hour is: 1 through the middle of it, 0 outside */
const working = (hr: number) => smooth((5.2 - Math.abs(((hr - 12.5 + 36) % 24) - 12)) / 1.4);

/** a filled disc lying in the ring's plane */
function disc(f: Frame, c: V3, r: number, colour: string, alpha: number): void {
  const p = f.P(c[0], c[1], c[2]);
  const px = f.P(c[0] + r, c[1], c[2]);
  const pz = f.P(c[0], c[1], c[2] + r);
  if (!p || !px || !pz || alpha <= 0.003) return;
  const { ctx } = f;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, Math.max(0.5, Math.hypot(px.x - p.x, px.y - p.y)), Math.max(0.5, Math.hypot(pz.x - p.x, pz.y - p.y)), 0, 0, TAU);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.globalAlpha = 1;
}

type State = { day: number };

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    return { day: 0.27 + f.rnd(0) * 0.04 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.cam.parallax = 0.5;
    f.aim(f.still ? 0 : Math.sin(f.t * 0.06) * 0.03, -0.8, 6.4, 1);

    // ── the day: it goes round by itself, and under the pointer the noon line is brought to where the pointer is
    if (!f.still) {
      s.day += f.dt / DAY;
      const c = f.P(0, 0, 0);
      const ex = f.P(1, 0, 0);
      const ez = f.P(0, 0, 1);
      if (f.hover > 0 && c && ex && ez) {
        const [ax, ay, bx, by] = [ex.x - c.x, ex.y - c.y, ez.x - c.x, ez.y - c.y];
        const det = ax * by - ay * bx;
        const [qx, qy] = [f.mx - c.x, f.my - c.y];
        if (Math.abs(det) > 1e-6) {
          const [u, v] = [(qx * by - qy * bx) / det, (ax * qy - ay * qx) / det];
          if (Math.hypot(u, v) > 0.2) {
            const want = 12.5 / 24 + OFF - Math.atan2(v, u) / TAU;
            const gap = ((((want - s.day) % 1) + 1.5) % 1) - 0.5;
            s.day += gap * (1 - Math.exp(-f.dt * 3)) * f.hover;
          }
        }
      }
      s.day = ((s.day % 1) + 1) % 1;
    }
    const day = s.day;
    /** where noon is, in turns round the ring */
    const noon = 12.5 / 24 + OFF - day;

    // ── the table: the ring the faces lie on, the hub, the noon line
    const table = f.on(0, 0.4);
    pool(f, O, 1.9, pal.key, 0.18 * f.boot);
    ring(f, O, RR, { colour: pal.ink, alpha: 0.14 * table });
    ring(f, O, HUB, { colour: pal.ink, alpha: 0.4 * table, ticks: m ? 12 : 24, tickLen: 0.04, major: 3, seg: 40 });

    // ── the four sessions: each arc lies where it lies, and is lit along the part the working day has reached
    ARCS.forEach(([from, to, r], k) => {
      const on = f.on(0.2 + k * 0.1, 0.3);
      if (on <= 0.003) return;
      const colour = [pal.teal, pal.indigo, pal.blue, pal.emerald][k];
      ring(f, O, r, { colour, alpha: 0.24 * on, from, to, seg: 60 });
      f.dot(ringPoint(O, r, from), 0.014, colour, 0.6 * on);
      f.dot(ringPoint(O, r, to), 0.014, colour, 0.6 * on);
      const seg = Math.max(8, Math.round((m ? 12 : 20) * f.q));
      for (let j = 0; j < seg; j++) {
        const [t0, t1] = [from + ((to - from) * j) / seg, from + ((to - from) * (j + 1)) / seg];
        const lit = working(hourAt(day, (t0 + t1) / 2));
        if (lit <= 0.02) continue;
        const [a, b] = [ringPoint(O, r, t0), ringPoint(O, r, t1)];
        f.line(a, b, colour, 0.16 * lit * on, 6);
        f.line(a, b, colour, 0.95 * lit * on, 2);
      }
    });

    const hand = f.on(0.5, 0.3);
    trace(f, [O, ringPoint(O, RR - FR - 0.05, noon)], pal.gold, 0.6 * hand, 1.2);
    lamp(f, O, pal.gold, hand, 0.018);

    // ── the eight faces, the farthest first: each shows its own hour
    for (const face of FACES) {
      const on = f.on(0.35 + 0.5 * (face.i / N), 0.3);
      if (on <= 0.003) continue;
      const hr = hourAt(day, face.i / N + OFF);
      const lit = working(hr);
      const n = f.near([face.x, 0, face.z], f.u * 0.34);
      const hi = Math.max(lit, n);
      const y = 0.16 * n + 0.03 * lit - (1 - on) * 0.15;
      const c: V3 = [face.x, y, face.z];
      if (n > 0.01) f.line([face.x, 0, face.z], c, pal.ink, 0.3 * n, 1);
      disc(f, c, FR, pal.bg, 0.8 * on);
      disc(f, c, FR, lit >= n ? pal.key : pal.gold, (0.04 + 0.12 * hi) * on);
      ring(f, c, FR, { colour: pal.ink, alpha: (0.34 + 0.2 * hi) * on, ticks: 12, tickLen: 0.04, major: 3, seg: m ? 24 : 32 });
      if (lit > 0.01) ring(f, c, FR, { colour: pal.key, alpha: 0.8 * lit * on, seg: m ? 24 : 32, width: 1.4 });
      if (n > 0.01) ring(f, c, FR + 0.035, { colour: pal.gold, alpha: 0.8 * n * on, seg: m ? 24 : 32 });
      // the hour hand: twelve is away from the viewer, and it turns as a clock's does
      const h = ((hr % 12) / 12) * TAU;
      const tip: V3 = [c[0] + Math.sin(h) * FR * 0.64, y, c[2] + Math.cos(h) * FR * 0.64];
      f.line(c, tip, pal.gold, (0.6 + 0.4 * hi) * on, 1.8);
      f.line(c, [c[0], y, c[2] + FR * 0.82], pal.ink, 0.22 * on, 1);
      f.dot(c, 0.016, pal.ink, 0.9 * on);
      if (lit > 0.3) f.glow(c, FR * 1.5, pal.key, 0.16 * lit * on);
    }
  },
};

export default scene;
