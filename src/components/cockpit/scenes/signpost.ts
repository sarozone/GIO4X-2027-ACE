/**
 * SIGNPOST — every way on from here.
 *
 * A signpost stands on the deck where the paths divide. Six fingerboards leave
 * its post at six heights and point six ways, and under each a path sets out
 * from the foot of the post, curves away across the deck and ends at a small
 * lit marker. The ways are shown one after another: a board warms to
 * champagne, a light runs out along its path, and the marker at the end comes
 * on.
 *
 * The pointer chooses instead: a board or a marker under it lights at once,
 * with its path.
 *
 * The boards are ruled, not lettered: the directory below names the places.
 */
import { clamp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, slab, trace } from "../kit";
import { smooth } from "./_stage";

const [FLOOR, TOP] = [-0.95, 0.92];
/** a fingerboard: its length, half its height */
const [BL, BH] = [0.8, 0.085];
/** seconds a way stays lit */
const HOLD = 2.8;
/** each way: the side it leaves by, how far it turns toward (−) or away from (+) the visitor, the board's height, the length of the path */
const WAYS: readonly (readonly [number, number, number, number])[] = [
  [1, 0.42, 0.7, 1.4],
  [-1, -0.4, 0.48, 1.45],
  [1, -0.3, 0.26, 1.5],
  [-1, 0.25, 0.04, 1.3],
  [1, 0.08, -0.18, 0.95],
  [-1, 0.8, -0.4, 1.05],
];
const N = WAYS.length;

type Way = { dx: number; dz: number; y: number; node: V3; path: V3[] };
type State = { ways: Way[] };

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    const seg = f.mobile ? 10 : 16;
    const ways = WAYS.map(([side, a, y, dist], i) => {
      const dx = side * Math.cos(a);
      const dz = Math.sin(a);
      const node: V3 = [dx * dist, FLOOR, dz * dist];
      // the path bends a little on its way out, each its own way
      const bend = (i % 2 ? 1 : -1) * (0.16 + 0.12 * f.rnd(i + 3)) * dist;
      const [mx, mz] = [dx * dist * 0.5 - dz * bend, dz * dist * 0.5 + dx * bend];
      const path: V3[] = [];
      for (let j = 0; j <= seg; j++) {
        const t = j / seg;
        const k = 1 - t;
        path.push([2 * k * t * mx + t * t * node[0], FLOOR, 2 * k * t * mz + t * t * node[2]]);
      }
      return { dx, dz, y, node, path };
    });
    return { ways };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    f.aim(0.1 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.04), -0.2, 6.2, m ? 1 : 1.08);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.2, pal.key, 0.22 * f.boot);
    const postOn = f.on(0, 0.35);
    ring(f, [0, FLOOR, 0], 0.42, { colour: pal.ink, alpha: 0.26 * postOn, ticks: 24, tickLen: 0.04, major: 4 });
    ring(f, [0, FLOOR, 0], 0.15, { colour: pal.ink, alpha: 0.4 * postOn, seg: 30 });

    // how lit each way is: its turn, or the pointer
    const ph = f.t / HOLD;
    const lvl: number[] = [];
    const run: number[] = [];
    for (let i = 0; i < N; i++) {
      const w = s.ways[i];
      const d = ((((ph - i) % N) + N + N / 2) % N) - N / 2 - 0.5;
      const turn = smooth(1 - Math.abs(d) / 0.75);
      const hand = Math.max(f.near(w.node, 70), f.near([w.dx * BL * 0.55, w.y, w.dz * BL * 0.55], 60));
      lvl.push(Math.max(turn, hand));
      run.push(turn > 0.02 ? clamp(d + 0.5, 0, 0.999) : -1);
    }

    // ── the paths across the deck, and the marker at the end of each
    for (let i = 0; i < N; i++) {
      const w = s.ways[i];
      const on = f.on(0.3 + 0.5 * (i / N), 0.3);
      if (on <= 0.003) continue;
      const shown = Math.max(2, Math.round(w.path.length * on));
      const pts = shown >= w.path.length ? w.path : w.path.slice(0, shown);
      f.path(pts, pal.key, 0.32 * on, 1);
      trace(f, pts, pal.gold, 0.85 * lvl[i] * on, 1.3, f.still ? -1 : run[i]);
      const [x, , z] = w.node;
      ring(f, w.node, 0.09, { colour: pal.key, alpha: (0.45 + 0.4 * lvl[i]) * on, seg: 24 });
      f.line(w.node, [x, FLOOR + 0.13, z], pal.ink, 0.5 * on, 1);
      lamp(f, [x, FLOOR + 0.13, z], pal.key, 0.35 * on, 0.014);
      lamp(f, [x, FLOOR + 0.13, z], pal.gold, lvl[i] * on, 0.02);
      if (lvl[i] > 0.02) pool(f, w.node, 0.4, pal.gold, 0.3 * lvl[i] * on);
    }

    /** one fingerboard: a pointed board, two engraved rules, a lamp at its tip */
    const board = (i: number) => {
      const w = s.ways[i];
      const on = f.on(0.2 + 0.5 * (i / N), 0.3);
      if (on <= 0.003) return;
      const k = lvl[i];
      const P = (d: number, y: number): V3 => [w.dx * d * on, w.y + y, w.dz * d * on];
      const shape = [P(0.04, -BH), P(BL - 0.12, -BH), P(BL, 0), P(BL - 0.12, BH), P(0.04, BH)];
      f.fill(shape, pal.bg, 0.93 * on);
      f.fill(shape, pal.ink, 0.06 * on);
      f.fill(shape, pal.gold, 0.2 * k * on);
      f.path(shape, pal.ink, 0.55 * (1 - k) * on, 1, true);
      f.path(shape, pal.gold, 0.95 * k * on, 1.3, true);
      f.line(P(0.14, 0.022), P(BL - 0.26, 0.022), pal.ink, (0.4 + 0.4 * k) * on, 1.5);
      if (!m) f.line(P(0.14, -0.03), P(BL - 0.4, -0.03), pal.ink, 0.25 * on, 1);
      lamp(f, P(BL - 0.1, 0), pal.gold, k * on, 0.012);
    };

    // boards that point away stand behind the post, the others in front of it
    for (let i = 0; i < N; i++) if (s.ways[i].dz > 0) board(i);
    const top = FLOOR + (TOP - FLOOR) * postOn;
    slab(f, [-0.035, FLOOR, -0.035], [0.035, top, 0.035], pal.ink, 0.12, postOn);
    lamp(f, [0, top + 0.03, 0], pal.key, 0.7 * postOn, 0.016);
    for (let i = 0; i < N; i++) if (s.ways[i].dz <= 0) board(i);
  },
};

export default scene;
