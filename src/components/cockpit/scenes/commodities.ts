/**
 * COMMODITIES — the carousel of raw materials.
 *
 * The commodities A to Z sorts everything the world digs, grows and rears into
 * seven families, so the instrument is a turntable with seven plinths. On each
 * stands the family's emblem as a small solid: a barrel for energy, a stack of
 * cast bars for the precious metals, a girder for the industrial ones, a sheaf
 * for grains and oilseeds, a sprig with its berries for the softs, a milk
 * churn for livestock and dairy, a cluster of crystals for the rest. A small
 * globe stands on the spindle, and a supply line runs from it to every plinth,
 * with one slow consignment of light on each.
 *
 * Nothing here is a price, a volume or a grade: it is the list of families,
 * drawn as objects. On a commodity's own page the table is turned so that the
 * emblem of its family stands at the front, raised, in champagne.
 *
 * The pointer: the table turns a little with the hand, and the emblem under it
 * rises on its plinth, is lit and named, with its supply line.
 */
import { TAU, clamp, type Frame, type Scene, type V3 } from "../engine";
import { arc, deck, lamp, orb, pool, ring, trace } from "../kit";

const NAMES = ["ENERGY", "PRECIOUS", "INDUSTRIAL", "GRAINS", "SOFTS", "LIVESTOCK", "OTHER"];
/**
 * The family of each commodity page, by its slug. The scene keeps its own short table so that the data
 * file (seventy-four long entries) stays out of this chunk; a slug it does not know shows the whole.
 */
const SLUGS = [
  "brent-crude coal coking-coal diesel-and-gasoil dubai-crude electricity ethanol fuel-oil gasoline heating-oil jet-fuel liquefied-natural-gas naphtha natural-gas propane uranium wti-crude",
  "gold palladium platinum rhodium silver",
  "aluminium cobalt copper iron-ore lead lithium molybdenum nickel rare-earths steel tin zinc",
  "barley canola corn crude-palm-oil kansas-wheat milling-wheat oats olive-oil rapeseed rice soybean-meal soybean-oil soybeans spring-wheat sunflower-oil wheat yellow-maize",
  "arabica-coffee cocoa cotton orange-juice robusta-coffee sugar tea vanilla white-sugar",
  "butter cheese feeder-cattle lean-hogs live-cattle milk whole-milk-powder",
  "carbon-allowances lumber potatoes rubber salmon urea wool",
];

const N = NAMES.length;
/** the turntable: its level, the radius the plinths stand at, and the globe on its spindle */
const PY = -0.3;
const RR = 1.3;
const GLOBE: V3 = [0, 0.45, 0];
const GR = 0.3;

type Ink = { colour: string; level: number; on: number };
type State = { focus: number };

/** a level polygon of `n` corners round a centre */
const gon = (c: V3, r: number, y: number, n: number, rot: number): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU;
    out.push([c[0] + Math.cos(a) * r, c[1] + y, c[2] + Math.sin(a) * r]);
  }
  return out;
};

/** a level rectangle turned about the vertical, its middle moved `oz` along its own short axis */
const rect = (c: V3, hx: number, hz: number, y: number, rot: number, oz = 0): V3[] => {
  const co = Math.cos(rot);
  const si = Math.sin(rot);
  const at = (x: number, z: number): V3 => [c[0] + x * co - z * si, c[1] + y, c[2] + x * si + z * co];
  return [at(-hx, oz - hz), at(hx, oz - hz), at(hx, oz + hz), at(-hx, oz + hz)];
};

/**
 * A solid between two level polygons with the same number of corners (a drum,
 * a tapered bar, a point): its flanks are painted from the farthest to the
 * nearest, each a dark body under a tint that depends on how it faces the
 * lamp, then its top. Solids stacked from the bottom up hide each other.
 */
function solid(f: Frame, lo: readonly V3[], hi: readonly V3[], k: Ink, cap = true): void {
  if (k.on <= 0.003) return;
  const n = lo.length;
  let cx = 0;
  let cz = 0;
  for (const p of lo) {
    cx += p[0] / n;
    cz += p[2] / n;
  }
  const sides: { i: number; z: number; lit: number }[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const mx = (lo[i][0] + lo[j][0]) / 2;
    const mz = (lo[i][2] + lo[j][2]) / 2;
    const p = f.P(mx, (lo[i][1] + hi[i][1]) / 2, mz);
    if (!p) return;
    const nx = mx - cx;
    const nz = mz - cz;
    // the lamp stands in front and a little to the left
    sides.push({ i, z: p.z, lit: clamp(0.5 - ((nx * 0.55 + nz * 0.83) / (Math.hypot(nx, nz) || 1)) * 0.5) });
  }
  sides.sort((a, b) => b.z - a.z);
  const a = k.level * k.on;
  for (const s of sides) {
    const j = (s.i + 1) % n;
    const q = [lo[s.i], lo[j], hi[j], hi[s.i]];
    f.fill(q, f.pal.bg, 0.94 * k.on);
    f.fill(q, k.colour, (0.07 + 0.3 * s.lit) * a);
    f.path(q, k.colour, 0.5 * a, 1, true);
  }
  if (!cap) return;
  f.fill(hi, f.pal.bg, 0.94 * k.on);
  f.fill(hi, k.colour, 0.34 * a);
  f.path(hi, k.colour, 0.85 * a, 1, true);
}

/** energy: a barrel, its staves bellied and bound by hoops */
function barrel(f: Frame, c: V3, rot: number, k: Ink, n: number): void {
  const R = [0.15, 0.18, 0.195, 0.18, 0.15];
  const Y = [0, 0.09, 0.21, 0.33, 0.42];
  for (let i = 0; i < 4; i++) solid(f, gon(c, R[i], Y[i], n, rot), gon(c, R[i + 1], Y[i + 1], n, rot), k, i === 3);
  f.path(gon(c, 0.11, 0.42, n, rot), k.colour, 0.4 * k.level * k.on, 1, true);
  f.dot([c[0] + Math.cos(rot) * 0.06, c[1] + 0.42, c[2] + Math.sin(rot) * 0.06], 0.014, k.colour, 0.85 * k.level * k.on);
}

/** precious metals: three cast bars, two below and one across them */
function bars(f: Frame, c: V3, rot: number, k: Ink): void {
  const bar = (oz: number, y: number) => solid(f, rect(c, 0.2, 0.085, y, rot, oz), rect(c, 0.17, 0.058, y + 0.11, rot, oz), k);
  // the lower bar that lies further from the visitor is set down first
  const far = Math.cos(rot) > 0 ? 0.095 : -0.095;
  bar(far, 0);
  bar(-far, 0);
  bar(0, 0.11);
}

/** industrial metals: a length of rolled girder */
function girder(f: Frame, c: V3, rot: number, k: Ink): void {
  solid(f, rect(c, 0.23, 0.11, 0, rot), rect(c, 0.23, 0.11, 0.045, rot), k);
  solid(f, rect(c, 0.23, 0.022, 0.045, rot), rect(c, 0.23, 0.022, 0.3, rot), k, false);
  solid(f, rect(c, 0.23, 0.11, 0.3, rot), rect(c, 0.23, 0.11, 0.345, rot), k);
}

/** grains and oilseeds: a sheaf, bound at the waist */
function sheaf(f: Frame, c: V3, rot: number, k: Ink, n: number): void {
  const a = k.level * k.on;
  const stalks = n + 3;
  for (let i = 0; i < stalks; i++) {
    const t = rot + (i / stalks) * TAU;
    const co = Math.cos(t);
    const si = Math.sin(t);
    const head: V3 = [c[0] + co * 0.17, c[1] + 0.45 + 0.05 * Math.sin(i * 2.4), c[2] + si * 0.17];
    f.path([[c[0] + co * 0.11, c[1], c[2] + si * 0.11], [c[0] + co * 0.03, c[1] + 0.2, c[2] + si * 0.03], head], k.colour, 0.75 * a, 1.1);
    // the ear: a short heavier stroke at the head of each stalk
    f.line(head, [head[0] + co * 0.035, head[1] + 0.07, head[2] + si * 0.035], k.colour, 0.95 * a, f.mobile ? 1.5 : 2.2);
  }
  f.path(gon(c, 0.042, 0.18, 8, rot), k.colour, 0.9 * a, 1.5, true);
  f.path(gon(c, 0.042, 0.215, 8, rot), k.colour, 0.9 * a, 1.5, true);
}

/** softs: a sprig of three leaves with its berries */
function sprig(f: Frame, c: V3, rot: number, k: Ink): void {
  const a = k.level * k.on;
  const leaves = [0, 1, 2].map((i) => rot + (i * TAU) / 3 + 0.4);
  // the leaf that leans away from the visitor first
  leaves.sort((p, q) => Math.sin(q) - Math.sin(p));
  for (const d of leaves) {
    const co = Math.cos(d);
    const si = Math.sin(d);
    /** a point of the blade: `t` from the stalk to the tip, `s` from one margin (-1) to the other (1) */
    const at = (t: number, s: number): V3 => {
      const w = 0.12 * Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.8) * s;
      const l = 0.08 + t * 0.44;
      // the blade bows outward toward its tip
      const bow = t * t * 0.1;
      return [c[0] + co * (l * 0.52 + bow) - si * w, c[1] + l * 0.85 - bow * 0.6, c[2] + si * (l * 0.52 + bow) + co * w];
    };
    const edge: V3[] = [];
    for (let i = 0; i <= 8; i++) edge.push(at(i / 8, 1));
    for (let i = 7; i >= 1; i--) edge.push(at(i / 8, -1));
    f.fill(edge, f.pal.bg, 0.9 * k.on);
    f.fill(edge, k.colour, 0.2 * a);
    f.path(edge, k.colour, 0.8 * a, 1, true);
    f.path([c, at(0, 0), at(0.5, 0), at(1, 0)], k.colour, 0.7 * a, 1);
  }
  f.dot([c[0] + Math.cos(rot) * 0.1, c[1] + 0.045, c[2] + Math.sin(rot) * 0.1], 0.04, k.colour, 0.8 * a);
  f.dot([c[0] + Math.cos(rot + 2.2) * 0.09, c[1] + 0.04, c[2] + Math.sin(rot + 2.2) * 0.09], 0.034, k.colour, 0.6 * a);
}

/** livestock and dairy: a milk churn */
function churn(f: Frame, c: V3, rot: number, k: Ink, n: number): void {
  const a = k.level * k.on;
  const handle = (side: number) => {
    const co = Math.cos(rot) * side;
    const si = Math.sin(rot) * side;
    f.path([[c[0] + co * 0.14, c[1] + 0.27, c[2] + si * 0.14], [c[0] + co * 0.215, c[1] + 0.33, c[2] + si * 0.215], [c[0] + co * 0.1, c[1] + 0.39, c[2] + si * 0.1]], k.colour, 0.8 * a, 1.5);
  };
  // the handle on the far shoulder is behind the body
  const far = Math.sin(rot) > 0 ? 1 : -1;
  handle(far);
  solid(f, gon(c, 0.15, 0, n, rot), gon(c, 0.15, 0.26, n, rot), k, false);
  solid(f, gon(c, 0.15, 0.26, n, rot), gon(c, 0.09, 0.36, n, rot), k, false);
  solid(f, gon(c, 0.09, 0.36, n, rot), gon(c, 0.09, 0.42, n, rot), k, false);
  solid(f, gon(c, 0.115, 0.42, n, rot), gon(c, 0.115, 0.46, n, rot), k);
  handle(-far);
}

/** everything else: a cluster of crystals */
function crystals(f: Frame, c: V3, rot: number, k: Ink): void {
  const one = (d: number, r: number, h: number) => {
    const p: V3 = [c[0] + Math.cos(d) * (r > 0.1 ? 0 : 0.14), c[1], c[2] + Math.sin(d) * (r > 0.1 ? 0 : 0.14)];
    const waist = gon(p, r, h * 0.66, 6, rot);
    solid(f, gon(p, r, 0, 6, rot), waist, k, false);
    solid(f, waist, gon(p, 0.004, h, 6, rot), k, false);
  };
  // the two small ones stand either side of the tall one: far, tall, near
  const d = Math.sin(rot + 0.7) > 0 ? rot + 0.7 : rot + 0.7 + Math.PI;
  one(d, 0.07, 0.26);
  one(0, 0.115, 0.5);
  one(d + Math.PI, 0.06, 0.2);
}

const scene: Scene<State> = {
  pose: 10,
  setup(f) {
    const tag = f.tag.toLowerCase();
    return { focus: tag ? SLUGS.findIndex((s) => ` ${s} `.includes(` ${tag} `)) : -1 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const focus = s.focus;
    const first = focus < 0 ? 0 : focus;
    f.aim(Math.sin(f.t * 0.06) * 0.04, -0.36, 6.4, 0.98);

    // the table turns once in a couple of minutes; on a commodity's page it only sways, its family kept at the front
    const turn = focus < 0 ? (f.still ? 0 : f.t * 0.05) : f.still ? 0 : Math.sin(f.t * 0.13) * 0.14;
    const rot = -Math.PI / 2 - (first * TAU) / N + turn + f.px * 0.3 * f.hover;
    const sides = Math.max(6, Math.round((m ? 8 : 10) * f.q));
    const tones = [pal.crimson, pal.ink, pal.blue, pal.emerald, pal.teal, pal.indigo, pal.key];

    deck(f, { y: PY - 0.06, half: 3.75, alpha: 0.09, drift: 0 });
    pool(f, [0, PY, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the turntable: a smoked plate, a graduated rim that turns with it, a lit arc that turns against it
    const tableOn = f.on(0, 0.4);
    const O: V3 = [0, PY, 0];
    const plate = gon(O, RR + 0.3, 0, Math.round(48 * f.q), rot);
    f.fill(plate, pal.bg, 0.5 * tableOn);
    f.fill(plate, pal.ink, 0.03 * tableOn);
    ring(f, O, RR + 0.3, { colour: pal.ink, alpha: 0.3 * tableOn, ticks: N * (m ? 6 : 12), major: m ? 6 : 12, tickLen: 0.05, rot });
    ring(f, O, RR - 0.32, { colour: pal.ink, alpha: 0.14 * tableOn });
    ring(f, O, RR + 0.37, { colour: pal.key, alpha: 0.45 * tableOn, from: 0.56, to: 0.84, width: 1.5, rot: -rot * 0.5 });
    ring(f, O, 0.34, { colour: pal.ink, alpha: 0.22 * tableOn, ticks: 24, tickLen: 0.03, rot: -rot });

    // ── what stands on it, from the farthest to the nearest: seven plinths and, in their midst, the globe
    type Item = { i: number; z: number };
    const items: Item[] = [];
    for (let i = -1; i < N; i++) {
      const a = rot + (i * TAU) / N;
      const p = i < 0 ? f.P(0, GLOBE[1], 0) : f.P(Math.cos(a) * RR, PY, Math.sin(a) * RR);
      if (p) items.push({ i, z: p.z });
    }
    items.sort((a, b) => b.z - a.z);

    const names: { text: string; p: V3; colour: string; alpha: number }[] = [];
    for (const it of items) {
      if (it.i < 0) {
        // the globe everything is drawn from, on its spindle
        const on = f.on(0.1, 0.5);
        const spin = (f.still ? 0.5 : f.t * 0.06) + f.px * 0.3;
        f.line([0, PY, 0], [0, GLOBE[1] - GR, 0], pal.ink, 0.3 * on, 1.5);
        orb(f, GLOBE, GR, pal.key, on);
        const seg = Math.round(22 * f.q);
        for (let k = 0; k < 3; k++) {
          const a = spin + (k * Math.PI) / 3;
          const pts: V3[] = [];
          for (let j = 0; j <= seg; j++) {
            const b = (j / seg) * TAU;
            pts.push([Math.cos(b) * Math.cos(a) * GR, GLOBE[1] + Math.sin(b) * GR, Math.cos(b) * Math.sin(a) * GR]);
          }
          f.path(pts, pal.ink, 0.14 * on, 1);
        }
        ring(f, GLOBE, GR, { colour: pal.ink, alpha: 0.22 * on, seg: 36 });
        ring(f, GLOBE, GR * 1.3, { colour: pal.key, alpha: 0.4 * on, ticks: 24, major: 6, tickLen: 0.03, rot: -spin * 0.5, seg: 48 });
        continue;
      }
      const i = it.i;
      const a = rot + (i * TAU) / N;
      const co = Math.cos(a);
      const si = Math.sin(a);
      const mine = i === focus;
      const on = f.on(0.25 + (((i - first + N) % N) / N) * 0.55, 0.3);
      if (on <= 0) continue;
      // the family at the front is the one being shown; the page's own stands a little proud of the ring
      const front = clamp(0.5 - si * 0.5);
      const r = RR + (mine ? 0.1 : 0);
      const touch = f.near([co * r, PY + 0.25, si * r], f.u * 0.5);
      const breathe = f.still ? 1 : 0.85 + 0.15 * Math.sin(f.t * 0.7);
      const rise = 0.05 + 0.11 * Math.max(touch, mine ? breathe : 0);
      const level = clamp((focus < 0 ? 0.55 + 0.4 * front : mine ? 1 : 0.4) + 0.5 * touch);
      const colour = mine ? pal.gold : tones[i];
      const c: V3 = [co * r, PY, si * r];

      // its supply line from the globe, one slow consignment of light on it
      const from: V3 = [co * GR * 0.92, GLOBE[1] - GR * 0.35, si * GR * 0.92];
      const to: V3 = [co * (r - 0.25), PY + rise, si * (r - 0.25)];
      const route = arc(from, to, 0.2, Math.max(8, Math.round(18 * f.q)));
      trace(f, route, colour, clamp((mine ? 0.85 : focus < 0 ? 0.42 : 0.24) + 0.5 * touch) * on, mine ? 1.5 : 1, f.t / (9 + (i % 3) * 2) + f.rnd(i + 20));

      pool(f, c, 0.5, colour, (mine ? 0.3 : 0.08 + 0.22 * touch) * on);
      solid(f, gon(c, 0.27, 0, sides, a), gon(c, 0.25, rise, sides, a), { colour: mine ? pal.gold : pal.ink, level: 0.75 * level, on });
      if (mine) ring(f, [c[0], PY + rise, c[2]], 0.21, { colour: pal.gold, alpha: 0.5 * on, seg: 36 });

      // the emblem is set down on its plinth as the instrument powers on
      const base: V3 = [c[0], PY + rise + (1 - on) * 0.12, c[2]];
      const ink: Ink = { colour, level, on };
      if (i === 0) barrel(f, base, a, ink, sides);
      else if (i === 1) bars(f, base, a + 0.5, ink);
      else if (i === 2) girder(f, base, a + 0.9, ink);
      else if (i === 3) sheaf(f, base, a, ink, sides);
      else if (i === 4) sprig(f, base, a, ink);
      else if (i === 5) churn(f, base, a + 0.6, ink, sides);
      else crystals(f, base, a, ink);
      if (mine) lamp(f, [c[0], PY + rise + 0.72, c[2]], pal.gold, on * breathe, 0.018);

      // named when it faces the visitor: on a phone, only the page's own
      const shown = Math.max(mine ? 1 : 0, touch, focus < 0 && !m ? Math.pow(front, 3) * 0.8 : 0);
      names.push({ text: NAMES[i], p: [co * (r + 0.36), PY, si * (r + 0.36)], colour: mine ? pal.gold : pal.ink, alpha: shown * on });
    }
    for (const n of names) f.label(n.text, n.p, { align: "center", dy: m ? 8 : 12, size: m ? 8 : 10, colour: n.colour, alpha: n.alpha });
  },
};

export default scene;
