/**
 * PRIMER — the folio of paper models.
 *
 * The primers are ten long explainers, so the instrument is one large book
 * lying open on the desk, of the kind whose pages stand up. Each opening
 * raises a small model cut from paper over its gutter: a row of cards stepping
 * up for the futures curve, a bent strip for the yield curve, a basket for a
 * fund, order tickets on a spike, two facing flights of steps for the order
 * book, a pair of gears for algorithms, a head in profile for psychology, a
 * weather vane for what moves a currency, a pointed arch for Islamic finance,
 * a card file for records and tax. The model stands a while, folds flat, a
 * leaf turns over the spine and the next one rises. Ten tabs on the fore-edge
 * mark the ten openings; the one on show is lit.
 *
 * The models are paper shapes: none stands on a scale or beside a symbol, the
 * lines of text are strokes, and nothing on the pages can be read. On a
 * primer's own page the book stays open at that primer, its model raised and
 * in champagne.
 *
 * The pointer is a reader's hand: the model turns toward it and stands taller,
 * the corner of the right-hand page lifts under it, and the tab it rests on
 * lights.
 */
import { TAU, clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, slab, trace } from "../kit";

const SLUGS = [
  "how-commodities-trade",
  "bonds-and-interest-rates",
  "etfs-and-funds",
  "order-types-in-depth",
  "market-microstructure",
  "algorithmic-trading",
  "trading-psychology",
  "what-moves-a-currency",
  "islamic-finance-and-trading",
  "tax-and-record-keeping",
];
/** seconds one opening is on show: its model rises, stands, folds, and the leaf turns */
const CYCLE = 12;
/** the book: a page's width and depth, the desk it lies on, the top of its pages */
const PW = 1.2;
const PD = 1.3;
const BY = -0.5;
const PT = BY + 0.09;
/** where a model stands: over the gutter, a little behind the middle of the page */
const MZ = 0.12;
const LEAF = 8;

type At = (x: number, y: number, z?: number) => V3;
type Kit = { at: At; c: string; ink: string; a: number; t: number };
type State = { focus: number; first: number; widths: number[] };

const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
const mod = (i: number, n: number) => ((i % n) + n) % n;

/** a piece of paper: a dark body, a tint, a cut edge */
function card(f: Frame, pts: readonly V3[], colour: string, a: number, tint = 0.14): void {
  f.fill(pts, f.pal.bg, 0.9 * a);
  f.fill(pts, colour, tint * a);
  f.path(pts, colour, 0.85 * a, 1, true);
}

/** a level loop (or part of one) in a model's own space */
function loop(at: At, r: number, y: number, n: number, from = 0, to = TAU): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push(at(Math.cos(a) * r, y, Math.sin(a) * r * 0.8));
  }
  return out;
}

/** a head in profile, facing right: x, y from the foot of the neck */
const HEAD: [number, number][] = [
  [-0.12, 0], [-0.14, 0.12], [-0.26, 0.3], [-0.3, 0.5], [-0.24, 0.68], [-0.1, 0.8], [0.06, 0.82], [0.2, 0.74], [0.26, 0.6],
  [0.25, 0.52], [0.33, 0.4], [0.25, 0.36], [0.27, 0.3], [0.24, 0.24], [0.26, 0.18], [0.2, 0.12], [0.08, 0.1], [0.06, 0],
];

/** one side of a pointed arch and back down the other: half-width, springing height, how far the centres stand apart */
function pointed(at: At, w: number, h0: number, c: number, z: number): V3[] {
  const R = w + c;
  const end = Math.acos(c / R);
  const out: V3[] = [at(-w, 0, z)];
  for (let i = 0; i <= 8; i++) out.push(at(c - R * Math.cos((end * i) / 8), h0 + R * Math.sin((end * i) / 8), z));
  for (let i = 7; i >= 0; i--) out.push(at(R * Math.cos((end * i) / 8) - c, h0 + R * Math.sin((end * i) / 8), z));
  out.push(at(w, 0, z));
  return out;
}

const MODELS: ((f: Frame, k: Kit) => void)[] = [
  // how commodities trade: the futures curve, as a row of cards each a little taller than the last
  (f, { at, c, a }) => {
    const tops: V3[] = [];
    for (let i = 0; i < 6; i++) {
      const x = -0.5 + i * 0.2;
      const z = 0.15 - i * 0.06;
      const h = 0.22 + 0.5 * (1 - Math.exp(-i * 0.55));
      card(f, [at(x - 0.07, 0, z), at(x + 0.07, 0, z), at(x + 0.07, h, z), at(x - 0.07, h, z)], c, a);
      f.line(at(x - 0.07, 0.05, z), at(x + 0.07, 0.05, z), c, 0.35 * a, 1);
      tops.push(at(x, h, z));
    }
    trace(f, tops, c, 0.9 * a, 1.5);
    for (const p of tops) f.dot(p, 0.014, f.pal.ink, 0.9 * a);
  },
  // bonds and interest rates: the yield curve, one strip of paper bent between two posts
  (f, { at, c, ink, a, t }) => {
    const flex = 0.5 + 0.5 * Math.sin(t * 0.35);
    const h = (u: number) => 0.14 + ((0.48 + 0.14 * flex) * (1 - Math.exp(-3.2 * u))) / (1 - Math.exp(-3.2));
    const near: V3[] = [];
    const far: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      near.push(at(-0.55 + 1.1 * u, h(u), -0.11));
      far.unshift(at(-0.55 + 1.1 * u, h(u), 0.11));
    }
    for (const u of [0, 0.5, 1]) f.line(at(-0.55 + 1.1 * u, 0, 0.11), at(-0.55 + 1.1 * u, h(u), 0.11), ink, 0.45 * a, 1);
    card(f, [...near, ...far], c, a, 0.2);
    for (const u of [0, 0.5, 1]) f.line(at(-0.55 + 1.1 * u, 0, -0.11), at(-0.55 + 1.1 * u, h(u), -0.11), ink, 0.6 * a, 1);
    trace(f, near, c, 0.9 * a, 1.5);
  },
  // funds: a basket, and what it holds
  (f, { at, c, ink, a }) => {
    f.path(loop(at, 0.36, 0.42, 14, 0, Math.PI), c, 0.5 * a, 1);
    f.fill([...loop(at, 0.24, 0.04, 12, Math.PI, TAU), ...loop(at, 0.36, 0.42, 12, TAU, Math.PI)], f.pal.bg, 0.7 * a);
    f.fill([...loop(at, 0.24, 0.04, 12, Math.PI, TAU), ...loop(at, 0.36, 0.42, 12, TAU, Math.PI)], c, 0.1 * a);
    f.dot(at(-0.15, 0.48, 0.02), 0.075, ink, 0.5 * a);
    f.dot(at(0.03, 0.53, 0.06), 0.085, c, 0.55 * a);
    f.dot(at(0.18, 0.47, -0.02), 0.07, ink, 0.4 * a);
    for (let i = 0; i < 12; i++) {
      const g = (i / 12) * TAU;
      f.line(at(Math.cos(g) * 0.24, 0.04, Math.sin(g) * 0.192), at(Math.cos(g) * 0.36, 0.42, Math.sin(g) * 0.288), c, (Math.sin(g) < 0 ? 0.7 : 0.2) * a, 1);
    }
    f.path(loop(at, 0.24, 0.04, 14), c, 0.6 * a, 1);
    f.path(loop(at, 0.3, 0.23, 14, Math.PI, TAU), c, 0.6 * a, 1);
    f.path(loop(at, 0.36, 0.42, 14, Math.PI, TAU), c, 0.95 * a, 1.5);
    const handle: V3[] = [];
    for (let i = 0; i <= 14; i++) handle.push(at(Math.cos((Math.PI * i) / 14) * 0.36, 0.42 + Math.sin((Math.PI * i) / 14) * 0.4, 0));
    f.path(handle, c, 0.85 * a, 1.5);
  },
  // order types: tickets on a spike, each laid a little askew on the last
  (f, { at, c, ink, a, t }) => {
    f.path(loop(at, 0.2, 0.01, 14), ink, 0.5 * a, 1);
    f.line(at(0, 0, 0), at(0, 0.78, 0), ink, 0.6 * a, 1.5);
    let y = 0;
    for (let i = 0; i < 5; i++) {
      y = 0.1 + i * 0.085 + (i === 4 ? 0.04 * (0.5 + 0.5 * Math.sin(t * 0.6)) : 0);
      const co = Math.cos(i * 0.55 + 0.2);
      const si = Math.sin(i * 0.55 + 0.2);
      const p = (x: number, z: number): V3 => at(x * co - z * si, y, x * si + z * co);
      card(f, [p(-0.25, -0.15), p(0.25, -0.15), p(0.25, 0.15), p(-0.25, 0.15)], i === 4 ? c : ink, a * (i === 4 ? 1 : 0.8), i === 4 ? 0.2 : 0.1);
      f.line(p(-0.18, -0.07), p(0.1, -0.07), i === 4 ? c : ink, 0.6 * a, 1);
      f.line(p(-0.18, -0.01), p(0.02, -0.01), i === 4 ? c : ink, 0.4 * a, 1);
    }
    f.line(at(0, y, 0), at(0, 0.78, 0), ink, 0.8 * a, 1.5);
    f.dot(at(0, 0.78, 0), 0.014, c, a);
  },
  // market microstructure: the two sides of the book, as two flights of steps with a gap between them
  (f, { at, c, ink, a, t }) => {
    for (const side of [-1, 1]) {
      const col = side < 0 ? c : ink;
      for (let i = 3; i >= 0; i--) {
        const x0 = side * (0.07 + i * 0.12);
        const x1 = side * (0.07 + (i + 1) * 0.12);
        const h = 0.14 + i * 0.15;
        card(f, [at(x0, h, -0.13), at(x1, h, -0.13), at(x1, h, 0.13), at(x0, h, 0.13)], col, a, 0.28);
        card(f, [at(x0, 0, -0.13), at(x1, 0, -0.13), at(x1, h, -0.13), at(x0, h, -0.13)], col, a, 0.12);
      }
    }
    lamp(f, at(0, 0.2 + 0.05 * Math.sin(t * 0.6), -0.13), c, a, 0.016);
  },
  // algorithmic trading: two gears in mesh
  (f, { at, c, ink, a, t }) => {
    const gear = (cx: number, cy: number, r: number, teeth: number, rot: number, col: string) => {
      const rim: V3[] = [];
      for (let i = 0; i < teeth * 4; i++) {
        const g = rot + (i / (teeth * 4)) * TAU;
        const rr = i % 4 < 2 ? r + 0.035 : r - 0.03;
        rim.push(at(cx + Math.cos(g) * rr, cy + Math.sin(g) * rr, 0));
      }
      f.line(at(cx, 0, 0.03), at(cx, cy, 0.03), ink, 0.45 * a, 1.5);
      card(f, rim, col, a, 0.16);
      const hub: V3[] = [];
      for (let i = 0; i <= 12; i++) hub.push(at(cx + Math.cos((i / 12) * TAU) * r * 0.3, cy + Math.sin((i / 12) * TAU) * r * 0.3, 0));
      f.path(hub, col, 0.8 * a, 1);
      for (let i = 0; i < 4; i++) {
        const g = rot + (i / 4) * TAU;
        f.line(at(cx + Math.cos(g) * r * 0.3, cy + Math.sin(g) * r * 0.3, 0), at(cx + Math.cos(g) * (r - 0.06), cy + Math.sin(g) * (r - 0.06), 0), col, 0.5 * a, 1);
      }
      f.dot(at(cx, cy, 0), 0.016, col, a);
    };
    gear(-0.14, 0.44, 0.28, 12, t * 0.2, c);
    gear(0.31, 0.3, 0.165, 7, -t * 0.2 * (12 / 7) + 0.25, ink);
  },
  // trading psychology: a head in profile, and a thought turning in it
  (f, { at, c, ink, a, t }) => {
    card(f, HEAD.map(([x, y]) => at(x, y * 0.98, 0)), c, a, 0.13);
    const coil: V3[] = [];
    for (let i = 0; i <= 36; i++) {
      const g = i * 0.36 + t * 0.3;
      const r = 0.012 + (0.15 * i) / 36;
      coil.push(at(-0.03 + Math.cos(g) * r, 0.55 + Math.sin(g) * r, -0.01));
    }
    f.path(coil, ink, 0.7 * a, 1);
    lamp(f, at(-0.03, 0.55, -0.01), c, a, 0.014);
  },
  // what moves a currency: a weather vane
  (f, { at, c, ink, a, t }) => {
    f.path(loop(at, 0.16, 0.01, 12), ink, 0.5 * a, 1);
    for (let i = 0; i < 3; i++) f.line(at(Math.cos(i * 2.1) * 0.16, 0, Math.sin(i * 2.1) * 0.13), at(0, 0.14, 0), ink, 0.5 * a, 1);
    f.line(at(0, 0, 0), at(0, 0.74, 0), ink, 0.8 * a, 1.5);
    f.line(at(-0.2, 0.42, 0), at(0.2, 0.42, 0), ink, 0.6 * a, 1);
    f.line(at(0, 0.42, -0.2), at(0, 0.42, 0.2), ink, 0.6 * a, 1);
    for (const [x, z] of [[-0.2, 0], [0.2, 0], [0, -0.2], [0, 0.2]]) f.dot(at(x, 0.42, z), 0.016, ink, 0.8 * a);
    const g = 0.5 + Math.sin(t * 0.31) * 0.9 + Math.sin(t * 0.13) * 0.5;
    const co = Math.cos(g);
    const si = Math.sin(g);
    const p = (r: number, dy: number): V3 => at(co * r, 0.64 + dy, si * r);
    card(f, [p(-0.32, 0.08), p(-0.16, 0.03), p(-0.16, -0.03), p(-0.32, -0.08)], c, a, 0.2);
    f.line(p(-0.32, 0), p(0.24, 0), c, 0.95 * a, 1.5);
    card(f, [p(0.36, 0), p(0.22, 0.055), p(0.22, -0.055)], c, a, 0.3);
    lamp(f, at(0, 0.74, 0), c, a, 0.014);
  },
  // Islamic finance: a pointed arch, another behind it, and an eight-pointed star in the opening
  (f, { at, c, ink, a, t }) => {
    f.path(pointed(at, 0.3, 0.3, 0.1, 0.2), ink, 0.4 * a, 1);
    f.path(pointed(at, 0.2, 0.25, 0.066, 0.2), ink, 0.3 * a, 1);
    card(f, pointed(at, 0.36, 0.36, 0.12, 0), c, a, 0.15);
    const door = pointed(at, 0.24, 0.3, 0.08, 0);
    f.fill(door, f.pal.bg, 0.85 * a);
    f.path(door, c, 0.7 * a, 1);
    for (let k = 0; k < 2; k++) {
      const sq: V3[] = [];
      for (let i = 0; i < 4; i++) {
        const g = t * 0.05 + (k * Math.PI) / 4 + (i * TAU) / 4;
        sq.push(at(Math.cos(g) * 0.115, 0.32 + Math.sin(g) * 0.115, -0.01));
      }
      f.path(sq, ink, 0.8 * a, 1, true);
    }
    lamp(f, at(0, 0.32, -0.01), c, a * 0.8, 0.012);
  },
  // tax and record keeping: a card file, one record drawn up out of it
  (f, { at, c, ink, a, t }) => {
    card(f, [at(-0.36, 0, 0.16), at(0.36, 0, 0.16), at(0.36, 0.2, 0.16), at(-0.36, 0.2, 0.16)], ink, a, 0.08);
    for (let i = 0; i < 6; i++) {
      const z = 0.12 - i * 0.048;
      const own = i === 3;
      const h = 0.34 + (own ? 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.5)) : 0);
      const tx = -0.3 + i * 0.1;
      const col = own ? c : ink;
      card(f, [at(-0.31, 0.03, z), at(0.31, 0.03, z), at(0.31, h, z), at(tx + 0.12, h, z), at(tx + 0.12, h + 0.045, z), at(tx, h + 0.045, z), at(tx, h, z), at(-0.31, h, z)], col, a, own ? 0.2 : 0.09);
      if (own) {
        f.line(at(-0.24, h - 0.05, z), at(0.12, h - 0.05, z), c, 0.7 * a, 1);
        f.line(at(-0.24, h - 0.1, z), at(0.2, h - 0.1, z), c, 0.5 * a, 1);
      }
    }
    f.line(at(-0.36, 0.2, 0.16), at(-0.36, 0.2, -0.16), ink, 0.6 * a, 1);
    f.line(at(0.36, 0.2, 0.16), at(0.36, 0.2, -0.16), ink, 0.6 * a, 1);
    card(f, [at(-0.36, 0, -0.16), at(0.36, 0, -0.16), at(0.36, 0.2, -0.16), at(-0.36, 0.2, -0.16)], ink, a, 0.12);
    f.path([at(-0.1, 0.07, -0.16), at(0.1, 0.07, -0.16), at(0.1, 0.14, -0.16), at(-0.1, 0.14, -0.16)], ink, 0.6 * a, 1, true);
  },
];

const scene: Scene<State> = {
  // the composed still: a model standing, half way through its time
  pose: CYCLE * 0.5,
  setup(f) {
    return {
      focus: SLUGS.indexOf(f.tag.toLowerCase()),
      // the index page opens at a different primer on each visit of a different page seed
      first: Math.floor(f.rnd(5) * SLUGS.length),
      widths: Array.from({ length: 24 }, (_, i) => 0.6 + 0.4 * f.rnd(i + 90)),
    };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const tagged = s.focus >= 0;
    f.aim(-0.05 + Math.sin(f.t * 0.08) * 0.04, -0.55, 6.6, 1.12);

    const turn = f.t / CYCLE;
    const n = Math.floor(turn);
    const u = turn - n;
    const which = tagged ? s.focus : mod(n + s.first, SLUGS.length);
    // an opening's time: the model rises, stands, folds flat; then the leaf goes over
    const raise = (tagged || f.still ? 1 : smooth(u / 0.13) * (1 - smooth((u - 0.74) / 0.1))) * f.on(0.5, 0.5);
    const over = tagged || f.still ? 0 : smooth((u - 0.84) / 0.16);
    const tones = [pal.teal, pal.blue, pal.emerald, pal.indigo];
    const colour = tagged ? pal.gold : tones[which % tones.length];

    deck(f, { y: BY, half: 3.75, alpha: 0.09, drift: 0 });
    pool(f, [0, BY, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the book: its boards, the two blocks of leaves, the gutter
    const bookOn = f.on(0, 0.4);
    const hz = PD / 2;
    slab(f, [-PW - 0.05, BY, -hz - 0.05], [PW + 0.05, BY + 0.02, hz + 0.05], pal.ink, 0.12, bookOn);
    slab(f, [-PW, BY + 0.02, -hz], [0, PT, hz], pal.ink, 0.08, bookOn);
    slab(f, [0, BY + 0.02, -hz], [PW, PT, hz], pal.ink, 0.08, bookOn);
    for (let i = 1; i < 3; i++) f.line([-PW, BY + 0.02 + i * 0.023, -hz], [PW, BY + 0.02 + i * 0.023, -hz], pal.ink, 0.22 * bookOn, 1);
    f.line([0, PT, -hz], [0, PT, hz], pal.ink, 0.45 * bookOn, 1.5);
    f.line([-0.035, PT, -hz], [-0.035, PT, hz], pal.ink, 0.1 * bookOn, 1);
    f.line([0.035, PT, -hz], [0.035, PT, hz], pal.ink, 0.1 * bookOn, 1);
    f.line([-PW, PT, -hz], [PW, PT, -hz], pal.key, 0.5 * bookOn, 1.25);

    // ── the pages: a heading and its rule at the head, lines of text at the foot; the model has the middle
    const textOn = f.on(0.3, 0.4);
    const rows = m ? 3 : 5;
    /** a point of a page: `side` -1 left, 1 right; `x` from the gutter out, `v` from the foot to the head, both 0..1 */
    const on = (side: number, x: number, v: number): V3 => [side * x * PW, PT + 0.003, -hz + v * PD];
    for (const side of [-1, 1]) {
      const own = tagged && side < 0;
      f.line(on(side, 0.3, 0.9), on(side, 0.9, 0.9), own ? pal.gold : pal.ink, (own ? 0.9 : 0.7) * textOn, m ? 1.5 : 2.5);
      f.line(on(side, 0.3, 0.84), on(side, 0.9, 0.84), pal.ink, 0.2 * textOn, 1);
      // (the leaf that is going over uncovers the next opening's right-hand page, and lands as its left-hand one)
      const page = side > 0 && over > 0 ? which + 1 : which;
      for (let r = 0; r < rows; r++) {
        const w = 0.8 * (r === rows - 1 ? 0.45 : s.widths[mod(page * 7 + r + (side > 0 ? 11 : 0), s.widths.length)]);
        // lines are set from the left: from the outer margin on the left-hand page, from the gutter on the right
        const x0 = side < 0 ? 0.9 : 0.1;
        f.line(on(side, x0, 0.3 - r * 0.055), on(side, x0 + side * w, 0.3 - r * 0.055), pal.ink2, 0.55 * textOn, 1.2);
      }
    }
    // where the model is glued down
    f.path([[-0.6, PT + 0.003, MZ - 0.24], [0.6, PT + 0.003, MZ - 0.24], [0.6, PT + 0.003, MZ + 0.24], [-0.6, PT + 0.003, MZ + 0.24]], colour, 0.22 * textOn, 1, true);

    // ── the tabs on the fore-edge, one for each primer; the opening on show is lit
    for (let i = 0; i < SLUGS.length; i++) {
      const z = lerp(hz - 0.1, -hz + 0.1, i / (SLUGS.length - 1));
      const is = i === which;
      const touch = f.near([PW + 0.04, PT, z], f.u * 0.22);
      const out = 0.06 + 0.03 * Math.max(is ? 1 : 0, touch);
      const q: V3[] = [[PW, PT, z - 0.045], [PW + out, PT, z - 0.035], [PW + out, PT, z + 0.035], [PW, PT, z + 0.045]];
      f.fill(q, pal.bg, 0.9 * bookOn);
      f.fill(q, is ? colour : pal.ink, (is ? 0.5 : 0.08 + 0.3 * touch) * bookOn);
      f.path(q, is ? colour : pal.ink, clamp((is ? 0.95 : 0.35) + 0.5 * touch) * bookOn, 1, true);
    }

    // ── the leaf: it turns over the spine between openings, and its corner lifts under the hand
    const hand = f.near([PW * 0.85, PT, -hz * 0.75], f.u);
    const idle = tagged && !f.still ? 0.22 + 0.1 * Math.sin(f.t * 0.4) : tagged ? 0.24 : 0;
    const peel = (idle + 1.1 * hand) * (1 - over);
    if (over > 0.001 || peel > 0.01) {
      const theta = over * Math.PI;
      /** the leaf's edge at one end of the book: it bends as it goes over, and curls up toward its fore-edge */
      const edge = (lift: number, z: number): V3[] => {
        const out: V3[] = [[0, PT + 0.004, z]];
        let x = 0;
        let y = PT + 0.004;
        for (let k = 1; k <= LEAF; k++) {
          const r = k / LEAF;
          const a = theta - 0.5 * Math.sin(theta) * (r - 0.3) + lift * r * r * r;
          x += (PW / LEAF) * Math.cos(a);
          y += (PW / LEAF) * Math.sin(a);
          out.push([x, y, z]);
        }
        return out;
      };
      const front = edge(peel, -hz);
      const back = edge(peel * 0.3, hz);
      // while it only lifts, the half by the spine is still the page
      const from = over > 0.001 ? 0 : LEAF / 2;
      const leaf: V3[] = [];
      for (let k = from; k <= LEAF; k++) leaf.push(front[k]);
      for (let k = LEAF; k >= from; k--) leaf.push(back[k]);
      f.fill(leaf, pal.bg, 0.93 * bookOn);
      f.fill(leaf, pal.ink, 0.07 * bookOn);
      f.path(leaf, pal.ink, 0.5 * bookOn, 1, true);
      f.line(front[LEAF], back[LEAF], pal.key, 0.6 * bookOn, 1.25);
      for (let r = 0; r < 3; r++) {
        const v = 0.12 + r * 0.07;
        const row: V3[] = [];
        for (let k = Math.max(1, from); k < LEAF; k++) row.push([lerp(front[k][0], back[k][0], v), lerp(front[k][1], back[k][1], v) + 0.003, lerp(-hz, hz, v)]);
        f.path(row, pal.ink2, 0.4 * bookOn, 1);
      }
    }

    // ── the model, standing over the gutter
    if (raise > 0.01) {
      const touch = f.near([0, PT + 0.4, MZ], f.u * 1.1);
      const yaw = (f.still ? 0 : Math.sin(f.t * 0.17) * 0.08) + f.px * 0.4 * f.hover;
      const co = Math.cos(yaw);
      const si = Math.sin(yaw);
      // it unfolds from flat on the page, and stands a little taller under the hand
      const tall = raise * (1 + 0.1 * touch);
      const at: At = (x, y, z = 0) => [x * co + z * si, PT + 0.004 + y * tall, MZ - x * si + z * co];
      pool(f, [0, PT, MZ], 0.8, colour, (0.2 + 0.2 * touch) * raise);
      MODELS[which](f, { at, c: colour, ink: pal.ink, a: clamp(raise * 1.4) * clamp(0.85 + 0.3 * touch), t: f.still ? 4 : f.t });
    }

    // ── dust in the reading light
    const motes = Math.round((m ? 8 : 20) * f.q);
    for (let i = 0; i < motes; i++) {
      const life = (f.rnd(i * 3 + 61) + (f.still ? 0 : f.t * (0.006 + 0.008 * f.rnd(i * 3 + 63)))) % 1;
      const x = (f.rnd(i * 3 + 60) - 0.5) * 2.6;
      const z = (f.rnd(i * 3 + 62) - 0.5) * 1.4;
      f.dot([x, PT + 0.1 + life * 0.9, z], 0.008, i % 3 ? pal.ink : pal.key, Math.sin(Math.PI * life) * 0.3 * f.boot);
    }
  },
};

export default scene;
