/**
 * CARTOGRAPH — the whole site, drawn as one tree.
 *
 * The sitemap lists every page under its section. So the instrument is that
 * list as it grows: a root at the left, a short trunk, and six limbs that part
 * from it and reach out to six section nodes, some nearer the viewer and some
 * further off. From each node a spray of twigs runs on to its pages, and each
 * page is a dot with a short stroke beside it, as a line in a list. Under the
 * tree its shadow lies on the deck, so the depth can be read.
 *
 * One champagne marker is "you are here". It stands on a page, then travels
 * the tree as a visitor does: back down its twig and its limb to the fork, out
 * along another limb, up a twig to another page. The way it has just come
 * stays lit behind it for a while.
 *
 * The pointer: the limb nearest to it lights with all its pages and its name
 * comes forward, and the marker's next journey is to that section.
 *
 * The six names are the site's sections. The pages are strokes: nothing here
 * counts them, and the marker is not the page the visitor is on.
 */
import { clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, trace } from "../kit";

const FLOOR = -1.22;
const NAMES = ["MARKETS", "TRADING", "PLATFORMS", "INTELLIGENCE", "ACADEMY", "COMPANY"] as const;
const LIMBS = NAMES.length;
/** the root, the fork the limbs part at, and where the nodes and the pages stand */
const ROOT: V3 = [-1.62, 0, 0];
const FORK: V3 = [-1.12, 0, 0];
const [NODE_X, PAGE_X] = [0, 1.14];
/** pages on each limb, at most */
const PAGES = [4, 5, 3, 5, 4, 3];
/** seconds for one journey and the stay at the end of it */
const VISIT = 9;
/** points a curve is drawn with, at full detail */
const SEG = 14;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** a point of the branch from `a` to `b`: it leaves level, turns and arrives level, as a tree diagram's does */
const on = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], ease(t)), lerp(a[2], b[2], ease(t))];

/** the branch from `a` to `b`, as far as `part` of the way */
function branch(a: V3, b: V3, n: number, part = 1): V3[] {
  const out: V3[] = [];
  const last = Math.max(1, Math.round(n * clamp(part)));
  for (let i = 0; i <= last; i++) out.push(on(a, b, (i / last) * clamp(part)));
  return out;
}

type Limb = { node: V3; pages: V3[]; stroke: number[] };
type State = { limbs: Limb[]; lit: number[]; from: [number, number]; to: [number, number]; t0: number; n: number };

/** the way from one page to another: down to the fork (or only to the node, on the same limb) and out again */
function route(s: State, n: number): V3[] {
  const a = s.limbs[s.from[0]];
  const b = s.limbs[s.to[0]];
  const pa = a.pages[s.from[1] % a.pages.length];
  const pb = b.pages[s.to[1] % b.pages.length];
  const out = branch(a.node, pa, n).reverse();
  if (a !== b) out.push(...branch(FORK, a.node, n).reverse().slice(1), ...branch(FORK, b.node, n).slice(1));
  out.push(...branch(b.node, pb, n).slice(1));
  return out;
}

/** the point `e` (0 to 1) of the way along a run of points */
function along(pts: readonly V3[], e: number): V3 {
  const x = clamp(e) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(x));
  if (i < 0) return pts[0];
  const k = x - i;
  return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k), lerp(pts[i][2], pts[i + 1][2], k)];
}

const scene: Scene<State> = {
  pose: 9,
  setup(f: Frame) {
    const limbs: Limb[] = [];
    for (let k = 0; k < LIMBS; k++) {
      const y = 0.85 - k * 0.34;
      // the limbs take turns: one comes toward the viewer, the next goes back
      const z = (k % 2 ? 0.42 : -0.42) * (0.7 + 0.3 * f.rnd(k + 10));
      const node: V3 = [NODE_X + (f.rnd(k + 20) - 0.5) * 0.3, y, z];
      const count = f.mobile ? Math.min(3, PAGES[k]) : PAGES[k];
      const pages: V3[] = [];
      const stroke: number[] = [];
      for (let j = 0; j < count; j++) {
        pages.push([PAGE_X + f.rnd(k * 9 + j + 30) * 0.2, y + (j - (count - 1) / 2) * 0.092, z + (f.rnd(k * 9 + j + 90) - 0.5) * 0.5]);
        stroke.push(0.1 + 0.2 * f.rnd(k * 9 + j + 150));
      }
      limbs.push({ node, pages, stroke });
    }
    return { limbs, lit: Array.from({ length: LIMBS }, () => 0), from: [1, 1], to: [3, 2], t0: 0, n: 0 };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    // a single composed frame (reduced motion, or the engine measuring the drawing): the marker stands at the end of its way
    const composed = f.still || f.dt === 0;
    f.aim(0.24 + (f.still ? 0 : Math.sin(f.t * 0.06) * 0.05), -0.12, 6.3, m ? 0.9 : 0.94);
    const seg = Math.max(6, Math.round(SEG * f.q));
    const tones = [pal.blue, pal.teal, pal.emerald, pal.indigo, pal.teal, pal.blue];

    // ── which limb the pointer is nearest: measured to its node, its middle and the middle of its pages
    let hot = -1;
    if (f.hover > 0.2) {
      let best = Infinity;
      for (let k = 0; k < LIMBS; k++) {
        const l = s.limbs[k];
        const end = l.pages[(l.pages.length - 1) >> 1];
        for (const q of [l.node, on(FORK, l.node, 0.6), end]) {
          const p = f.P(...q);
          const d = p ? Math.hypot(p.x - f.mx, p.y - f.my) : Infinity;
          if (d < best) {
            best = d;
            hot = k;
          }
        }
      }
    }
    const rate = clamp(f.dt * 6);
    for (let k = 0; k < LIMBS; k++) s.lit[k] = composed ? 0 : s.lit[k] + ((k === hot ? f.hover : 0) - s.lit[k]) * rate;

    // ── the marker's journeys: one after another, and to the pointer's limb when there is one
    if (!composed) {
      if (f.t < s.t0) s.t0 = f.t;
      const spent = (f.t - s.t0) / VISIT;
      const wanted = hot >= 0 && hot !== s.to[0];
      // a new journey begins when this stay is over, or at once when the pointer asks for another section
      if ((spent >= 1 && !(hot >= 0 && hot === s.to[0])) || (wanted && spent > 0.6)) {
        s.n++;
        s.from = [s.to[0], s.to[1]];
        const next = wanted ? hot : (s.from[0] + 2 + (s.n % 3)) % LIMBS;
        s.to = [next, Math.floor(f.rnd(s.n * 3 + 200) * s.limbs[next].pages.length)];
        s.t0 = f.t;
      }
    }
    const spent = composed ? 0.85 : clamp((f.t - s.t0) / VISIT);
    const way = route(s, seg);
    const gone = ease(spent / 0.6);
    const here = along(way, gone);
    const rest = clamp((spent - 0.6) / 0.1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [-0.1, FLOOR, 0], 2.5, pal.key, 0.18 * f.boot);

    // ── three rules on the deck: where the fork, the sections and the pages stand
    for (const [x, order] of [[FORK[0], 0.1], [NODE_X, 0.35], [PAGE_X + 0.1, 0.6]] as const) f.line([x, FLOOR, -0.7], [x, FLOOR, 0.7], pal.ink, 0.22 * f.on(order, 0.3), 1);

    // ── the root and the trunk
    const rootOn = f.on(0, 0.3);
    pool(f, [ROOT[0], FLOOR, 0], 0.6, pal.key, 0.2 * rootOn);
    f.line([ROOT[0], FLOOR, 0], ROOT, pal.ink, 0.25 * rootOn, 1);
    ring(f, [ROOT[0], FLOOR, 0], 0.16, { axis: "y", colour: pal.ink, alpha: 0.3 * rootOn, seg: 24 });
    ring(f, ROOT, 0.1, { axis: "z", colour: pal.key, alpha: 0.7 * rootOn, seg: 24 });
    lamp(f, ROOT, pal.key, rootOn, 0.022);
    trace(f, [ROOT, FORK], pal.key, 0.8 * rootOn, 1.6);
    f.dot(FORK, 0.02, pal.ink, 0.9 * rootOn);

    // ── the six limbs, their nodes and their pages
    for (let k = 0; k < LIMBS; k++) {
      const l = s.limbs[k];
      const grown = f.on(0.12 + k * 0.08, 0.36);
      if (grown <= 0.003) continue;
      const lit = s.lit[k];
      // the limb the marker is bound for is a little awake
      const bound = k === s.to[0] ? 0.35 : 0;
      const level = Math.max(lit, bound);
      const colour = lit > 0.3 ? pal.key : tones[k];
      const [nx, ny, nz] = l.node;
      // its shadow on the deck
      f.path(branch([FORK[0], FLOOR, 0], [nx, FLOOR, nz], seg, grown), pal.ink, 0.12 + 0.12 * lit, 1);
      f.line(l.node, [nx, FLOOR, nz], pal.ink, (0.08 + 0.14 * lit) * grown, 1);
      f.dot([nx, FLOOR, nz], 0.014, colour, (0.3 + 0.4 * lit) * grown);

      const limb = branch(FORK, l.node, seg, grown);
      if (lit > 0.05) trace(f, limb, colour, 0.9 * lit, 1.8, f.t / 5 + k * 0.17);
      f.path(limb, colour, 0.5 + 0.3 * level, 1.3);

      const leafed = f.on(0.4 + k * 0.08, 0.36);
      for (let j = 0; j < l.pages.length; j++) {
        const page = l.pages[j];
        f.path(branch(l.node, page, Math.max(4, seg >> 1), leafed), colour, (0.3 + 0.5 * level) * leafed, 1);
        if (leafed < 0.98) continue;
        const touch = f.near(page, 36);
        f.dot(page, 0.014 + 0.008 * touch, lit > 0.3 ? pal.ink : colour, 0.6 + 0.4 * Math.max(level, touch));
        // the page itself: a stroke, as its line in the list
        f.line([page[0] + 0.05, page[1], page[2]], [page[0] + 0.05 + l.stroke[j], page[1], page[2]], pal.ink2, 0.3 + 0.5 * Math.max(lit, touch), 1.2);
      }
      if (lit > 0.05) f.glow(l.node, 0.3, pal.key, 0.35 * lit * grown);
      lamp(f, l.node, colour, (0.55 + 0.45 * level) * grown, 0.018);
      if (!m) f.label(NAMES[k], l.node, { align: "center", dy: -11 - 2 * lit, size: 9, colour: lit > 0.3 ? pal.ink : pal.ink2, alpha: (0.5 + 0.5 * lit) * leafed });
    }

    // ── "you are here": the way it has come, lit behind it, and the marker itself
    const markOn = f.on(0.85, 0.15);
    if (markOn > 0.003) {
      const cut = gone * (way.length - 1);
      const trail: V3[] = way.slice(0, Math.floor(cut) + 1);
      trail.push(here);
      // the trail cools once the marker has arrived
      const warm = composed ? 0.6 : 1 - clamp((spent - 0.6) / 0.4) * 0.75;
      trace(f, trail, pal.gold, 0.7 * warm * markOn, 1.5);
      f.dot(way[0], 0.012, pal.gold, 0.6 * warm * markOn);

      const breathe = f.still ? 1 : 0.85 + 0.15 * Math.sin(f.t * 1.1);
      f.line(here, [here[0], FLOOR, here[2]], pal.gold, 0.2 * markOn, 1);
      pool(f, [here[0], FLOOR, here[2]], 0.34, pal.gold, 0.3 * markOn);
      lamp(f, here, pal.gold, markOn * breathe, 0.024);
      // standing on a page, it is ringed and pinned
      ring(f, here, 0.075 + 0.02 * rest, { axis: "z", colour: pal.gold, alpha: 0.85 * rest * markOn, seg: 24 });
      const pin: V3 = [here[0], here[1] + 0.2, here[2]];
      f.line([here[0], here[1] + 0.08, here[2]], pin, pal.gold, 0.8 * rest * markOn, 1.25);
      f.path([[pin[0], pin[1] - 0.035, pin[2]], [pin[0] + 0.03, pin[1], pin[2]], [pin[0], pin[1] + 0.035, pin[2]], [pin[0] - 0.03, pin[1], pin[2]]], pal.gold, 0.9 * rest * markOn, 1.25, true);
    }
  },
};

export default scene;
