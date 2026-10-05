/**
 * ECONOMIES — the map table.
 *
 * Ten economies have a profile here, so the instrument is a map table with ten
 * islands in low relief. Each island carries the same three things, because
 * each profile tells the same three things: a skyline of plain blocks (the
 * economy), a small portico in front of it (the central bank) and a mast with
 * a beacon (what it publishes, and when). Between the islands goods move on
 * low arcs and capital on high ones, slowly.
 *
 * The table is not a chart of the world and the islands are not to scale: the
 * skylines are invented, differently on every page, and say nothing about the
 * size, the wealth or the standing of anybody. There is no flag and no figure.
 * On an economy's own page its island is raised from the table and lit in
 * champagne, with its routes.
 *
 * The pointer: the island under it rises a little, its beacon brightens, its
 * routes light and it is named.
 */
import { TAU, clamp, type Frame, type Scene, type V3 } from "../engine";
import { arc, deck, eyeX, lamp, pool, ring, slab, trace } from "../kit";

const SLUGS = ["united-states", "euro-area", "united-kingdom", "japan", "switzerland", "australia", "canada", "new-zealand", "china", "india"];
const NAMES = ["UNITED STATES", "EURO AREA", "UNITED KINGDOM", "JAPAN", "SWITZERLAND", "AUSTRALIA", "CANADA", "NEW ZEALAND", "CHINA", "INDIA"];
/** where each island lies on the table (x, z): three staggered rows, loosely west to east, not a map */
const PLACES: [number, number][] = [
  [-1.17, 0],
  [-0.39, 0],
  [0, 0.8],
  [0.78, 0.8],
  [-0.78, -0.8],
  [0, -0.8],
  [-0.78, 0.8],
  [0.78, -0.8],
  [0.39, 0],
  [1.17, 0],
];
/** the routes: two islands and what moves between them (0 goods, on a low arc; 1 capital, on a high one). The first eight reach every island. */
const ROUTES: [number, number, number][] = [
  [0, 6, 0],
  [1, 2, 1],
  [3, 8, 0],
  [5, 7, 0],
  [9, 8, 0],
  [1, 4, 1],
  [0, 1, 1],
  [1, 8, 0],
  [0, 8, 0],
  [3, 2, 1],
  [5, 8, 0],
  [9, 1, 1],
  [0, 4, 1],
];
/** the table: half-extents, the level of its top, its thickness; and how high an island's ground stands above it */
const TX = 1.6;
const TZ = 1.25;
const T0 = -0.2;
const TH = 0.08;
const GROUND = 0.04;

type Block = { x: number; z: number; w: number; d: number; h: number; rank: number };
type Isle = { rim: [number, number][]; blocks: Block[] };
type State = { focus: number; isles: Isle[]; order: number[] };

/** an island's ground: a low plateau with an irregular shore, its flanks painted from the farthest to the nearest, then its top */
function plateau(f: Frame, x: number, z: number, rim: readonly [number, number][], top: number, colour: string, level: number, on: number): void {
  const n = rim.length;
  const lo: V3[] = rim.map(([u, v]) => [x + u * 1.06, T0, z + v * 1.06]);
  const hi: V3[] = rim.map(([u, v]) => [x + u, top, z + v]);
  const sides: { i: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const p = f.P((lo[i][0] + lo[j][0]) / 2, T0, (lo[i][2] + lo[j][2]) / 2);
    if (!p) return;
    sides.push({ i, z: p.z });
  }
  sides.sort((a, b) => b.z - a.z);
  for (const s of sides) {
    const j = (s.i + 1) % n;
    const q = [lo[s.i], lo[j], hi[j], hi[s.i]];
    f.fill(q, f.pal.bg, 0.94 * on);
    f.fill(q, colour, 0.1 * level * on);
    f.path(q, colour, 0.3 * level * on, 1, true);
  }
  f.fill(hi, f.pal.bg, 0.94 * on);
  f.fill(hi, colour, 0.13 * level * on);
  f.path(hi, colour, 0.7 * level * on, 1, true);
}

const scene: Scene<State> = {
  pose: 11,
  setup(f) {
    const isles = PLACES.map((_, i) => {
      const at = i * 40;
      const rim: [number, number][] = [];
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU + f.rnd(at + k) * 0.3;
        const r = 0.25 + 0.07 * f.rnd(at + k + 10);
        rim.push([Math.cos(a) * r * 1.08, Math.sin(a) * r]);
      }
      // the skyline stands on the far two thirds of the island; the portico has the front
      const blocks: Block[] = [];
      for (let k = 0; k < 7; k++) {
        blocks.push({
          x: (f.rnd(at + k + 20) - 0.5) * 0.34,
          z: -0.02 + f.rnd(at + k + 27) * 0.2,
          w: 0.05 + 0.035 * f.rnd(at + k + 34),
          d: 0.05 + 0.03 * f.rnd(at + k + 21),
          h: 0.08 + 0.26 * Math.pow(f.rnd(at + k + 28), 1.5),
          rank: k,
        });
      }
      blocks.sort((a, b) => b.z - a.z);
      return { rim, blocks };
    });
    return { focus: SLUGS.indexOf(f.tag.toLowerCase()), isles, order: PLACES.map((_, i) => i) };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const focus = s.focus;
    f.aim(Math.sin(f.t * 0.06) * 0.05, -0.5, 6.6, 0.92);

    deck(f, { y: T0 - TH, half: 3.75, alpha: 0.09, drift: 0 });
    pool(f, [0, T0 - TH, 0], 2.8, pal.key, 0.2 * f.boot);

    // ── the table: a slab of smoked glass, a graticule engraved in its top, its near edge lit
    const tableOn = f.on(0, 0.4);
    slab(f, [-TX, T0 - TH, -TZ], [TX, T0, TZ], pal.ink, 0.05, tableOn);
    for (let i = -3; i <= 3; i++) f.line([(i * TX) / 4, T0, -TZ], [(i * TX) / 4, T0, TZ], pal.ink, 0.08 * tableOn, 1);
    for (let i = -2; i <= 2; i++) f.line([-TX, T0, (i * TZ) / 3], [TX, T0, (i * TZ) / 3], pal.ink, 0.08 * tableOn, 1);
    f.line([-TX, T0, -TZ], [TX, T0, -TZ], pal.key, 0.6 * tableOn, 1.5);

    // ── how each island stands: the page's own is raised, the one under the hand a little
    const touch: number[] = [];
    const rise: number[] = [];
    const top: V3[] = [];
    for (let i = 0; i < PLACES.length; i++) {
      const [x, z] = PLACES[i];
      const t = f.near([x, T0 + 0.15, z], f.u * 0.45);
      const on = f.on(0.15 + (i / PLACES.length) * 0.5, 0.35);
      touch.push(t);
      rise.push(((i === focus ? 0.2 : 0) + 0.09 * t) * on);
      top.push([x, T0 + GROUND + rise[i], z]);
    }

    // ── the islands, from the far row to the near one, and in each row from the far side of the eye
    const ex = eyeX(f);
    s.order.sort((a, b) => PLACES[b][1] - PLACES[a][1] || Math.abs(PLACES[b][0] - ex) - Math.abs(PLACES[a][0] - ex));
    const count = Math.max(3, Math.round((m ? 4 : 6) * f.q));
    const names: number[] = [];
    for (const i of s.order) {
      const [x, z] = PLACES[i];
      const on = f.on(0.15 + (i / PLACES.length) * 0.5, 0.35);
      if (on <= 0) continue;
      const mine = i === focus;
      const t = touch[i];
      const level = clamp((focus < 0 ? 0.8 : mine ? 1 : 0.42) + 0.4 * t);
      const colour = mine ? pal.gold : pal.ink;
      const y = top[i][1];

      // its waters: two soundings round the shore
      ring(f, [x, T0, z], 0.37, { colour, alpha: 0.16 * level * on, seg: 40 });
      ring(f, [x, T0, z], 0.44, { colour: pal.ink, alpha: 0.08 * on, seg: 40 });
      if (mine || t > 0.01) pool(f, [x, T0, z], 0.62, mine ? pal.gold : pal.key, (mine ? 0.3 : 0.22 * t) * on);
      plateau(f, x, z, s.isles[i].rim, y, colour, level, on);

      // the skyline: plain blocks, each with two lit storeys
      for (const b of s.isles[i].blocks) {
        if (b.rank >= count) continue;
        const h = b.h * on;
        const x0 = x + b.x - b.w / 2;
        const z0 = z + b.z - b.d / 2;
        slab(f, [x0, y, z0], [x0 + b.w, y + h, z0 + b.d], colour, 0.16 * level, on);
        const lights = mine ? pal.gold : pal.key;
        f.line([x0 + b.w * 0.2, y + h * 0.42, z0], [x0 + b.w * 0.8, y + h * 0.42, z0], lights, 0.5 * level * on, 1);
        if (b.h > 0.16) f.line([x0 + b.w * 0.2, y + h * 0.74, z0], [x0 + b.w * 0.8, y + h * 0.74, z0], lights, 0.4 * level * on, 1);
      }

      // the central bank: a stylobate, four columns, an entablature and a pediment
      const pz = z - 0.165;
      const a = level * on;
      slab(f, [x - 0.095, y, pz - 0.01], [x + 0.095, y + 0.016, pz + 0.08], colour, 0.2 * level, on);
      f.fill([[x - 0.085, y + 0.016, pz], [x + 0.085, y + 0.016, pz], [x + 0.085, y + 0.09, pz], [x - 0.085, y + 0.09, pz]], pal.bg, 0.8 * on);
      for (let k = 0; k < 4; k++) {
        const cx = x - 0.07 + k * 0.0467;
        f.line([cx, y + 0.016, pz], [cx, y + 0.09, pz], colour, 0.85 * a, m ? 1 : 1.5);
      }
      const eave: V3[] = [[x - 0.092, y + 0.09, pz], [x, y + 0.14, pz], [x + 0.092, y + 0.09, pz]];
      f.fill(eave, pal.bg, 0.9 * on);
      f.fill(eave, colour, 0.22 * a);
      f.path(eave, colour, 0.9 * a, 1, true);
      f.line([x, y + 0.14, pz], [x, y + 0.14, pz + 0.08], colour, 0.5 * a, 1);
      f.line([x + 0.092, y + 0.09, pz], [x + 0.092, y + 0.09, pz + 0.08], colour, 0.4 * a, 1);

      // the beacon: a mast at the back of the island, its lamp, and one slow ring of light leaving it
      const mast: V3 = [x - 0.17, y + 0.46 * on, z + 0.12];
      f.line([mast[0], y, mast[2]], mast, colour, 0.55 * a, 1);
      const beat = f.still ? 0.35 + 0.3 * f.rnd(i + 300) : (f.t / 7 + f.rnd(i + 300)) % 1;
      ring(f, mast, 0.05 + 0.26 * beat, { colour: mine ? pal.gold : pal.key, alpha: 0.4 * Math.sin(Math.PI * beat) * (0.5 + 0.5 * level) * on, seg: 28 });
      lamp(f, mast, mine ? pal.gold : pal.key, clamp(0.45 * level + 0.3 + 0.5 * t) * on * (f.still ? 1 : 0.86 + 0.14 * Math.sin(f.t * 0.8 + i * 1.9)), mine ? 0.02 : 0.015);
      if (mine || t > 0.03) names.push(i);
    }

    // ── what moves between them, in the air over the table
    const routesOn = f.on(0.7, 0.3);
    const routes = m ? 8 : Math.max(8, Math.round(ROUTES.length * f.q));
    const seg = Math.max(8, Math.round(22 * f.q));
    for (let r = 0; r < routes; r++) {
      const [ia, ib, kind] = ROUTES[r];
      const own = ia === focus || ib === focus;
      const t = Math.max(touch[ia], touch[ib]);
      const from: V3 = [top[ia][0], top[ia][1] + 0.03, top[ia][2] + 0.03];
      const to: V3 = [top[ib][0], top[ib][1] + 0.03, top[ib][2] + 0.03];
      const colour = own ? pal.gold : kind ? pal.indigo : pal.teal;
      const level = clamp((focus < 0 ? 0.5 : own ? 0.9 : 0.22) + 0.5 * t) * routesOn;
      const pts = arc(from, to, kind ? 0.5 : 0.24, seg);
      // goods go one way and come back the other; capital is quicker
      const phase = f.t / (kind ? 10 + (r % 3) : 17 + (r % 4)) + f.rnd(r + 200);
      trace(f, r % 2 ? pts.reverse() : pts, colour, 0.75 * level, kind ? 1 : 1.25, phase);
      if (!kind && !f.still) {
        // a second consignment follows the first, half the way behind
        const k = ((phase + 0.5) % 1) * seg;
        const j = Math.min(seg - 1, Math.floor(k));
        const u = k - j;
        f.dot([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u, pts[j][2] + (pts[j + 1][2] - pts[j][2]) * u], 0.014, colour, 0.9 * level);
      }
    }

    for (const i of names) {
      const mine = i === focus;
      f.label(NAMES[i], [PLACES[i][0], T0, PLACES[i][1] - 0.42], { align: "center", dy: m ? 4 : 8, size: m ? 8 : 10, colour: mine ? pal.gold : pal.ink, alpha: Math.max(mine ? 1 : 0, touch[i]) * f.on(0.6, 0.4) });
    }
  },
};

export default scene;
