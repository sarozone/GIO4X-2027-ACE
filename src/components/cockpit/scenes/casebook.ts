/**
 * CASEBOOK — five dossiers on a desk, opened one at a time.
 *
 * The page sets out five studies of how professional investors go about
 * their work. So five folders lie side by side on a desk, each with an emblem
 * pressed into its cover. One at a time a cover is lifted on its hinge, and
 * the idea kept inside is let out: it rises over the open folder on a card of
 * glass, drawn large and at work. A ladder, climbed a rung at a time. A
 * barbell, with weight at both ends and none between. An allocation set out
 * as rings round a core. A horizon, with the short view and the long one
 * bracketed over it. A balance that is never quite still. Then the cover
 * comes down and the next is lifted.
 *
 * The pointer opens the folder it is over, and keeps it open.
 *
 * The five drawings are emblems of five ways of working. None of them is a
 * chart, none has a scale and nothing in them is a result.
 */
import { TAU, clamp, hash, lerp, type Frame, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, slab } from "../kit";

const FLOOR = -1.3;
/** the desk top, and half its width */
const [DESK, DW] = [-0.75, 1.7];
/** a folder: its width, its length, the space from one to the next */
const [FW, FL, GAP] = [0.54, 0.72, 0.68];
/** its front edge and the hinge at its back */
const [ZF, ZB] = [-0.78, -0.06];
/** where a released card hangs: its height, how far back, its half-size */
const [CY, CZ, CK] = [0.5, 0.3, 0.4];
/** seconds a folder stays open when nobody chooses */
const TURN = 6;
const COUNT = 5;

const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** a drawing's own plane: u and v from -1 to 1 */
type Plane = (u: number, v: number) => V3;
/** one emblem: `t` is its clock (below zero for the still one pressed into a cover), `w` its stroke weight */
type Emblem = (f: Frame, at: Plane, colour: string, a: number, t: number, w: number) => void;

/** part of a circle in a drawing's plane, in turns */
function round(f: Frame, at: Plane, cu: number, cv: number, r: number, from = 0, to = 1): V3[] {
  const n = Math.max(8, Math.round(36 * f.q * Math.abs(to - from)));
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (from + ((to - from) * i) / n) * TAU;
    out.push(at(cu + Math.cos(a) * r, cv + Math.sin(a) * r));
  }
  return out;
}

/** a ladder: two rails and five rungs, and a light that climbs it */
const ladder: Emblem = (f, at, colour, a, t, w) => {
  const { pal } = f;
  f.line(at(-0.4, -0.9), at(-0.4, 0.9), colour, 0.85 * a, w * 1.2);
  f.line(at(0.4, -0.9), at(0.4, 0.9), colour, 0.85 * a, w * 1.2);
  const climb = t < 0 ? 3 : (t * 0.3) % 5;
  for (let k = 0; k < 5; k++) {
    const v = -0.68 + k * 0.34;
    const d = Math.abs(k - climb);
    const lit = clamp(1 - Math.min(d, 5 - d));
    f.line(at(-0.4, v), at(0.4, v), colour, (0.5 + 0.3 * lit) * a, w);
    f.line(at(-0.4, v), at(0.4, v), pal.gold, lit * a, w * 1.4);
    if (t >= 0 && lit > 0.05) f.glow(at(0, v), 0.12, pal.gold, 0.4 * lit * a);
  }
};

/** a barbell: weight at both ends, a bare bar between */
const barbell: Emblem = (f, at, colour, a, t, w) => {
  const { pal } = f;
  const sway = t < 0 ? 0 : Math.sin(t * 0.5) * 0.03;
  const ends: [number, number][] = [[-0.52, 0.34 + sway], [0.56, 0.25 - sway]];
  f.line(at(ends[0][0] + ends[0][1], 0), at(ends[1][0] - ends[1][1], 0), colour, 0.9 * a, w * 1.6);
  f.line(at(0, -0.07), at(0, 0.07), pal.ink, 0.35 * a, 1);
  ends.forEach(([u, r], i) => {
    f.fill(round(f, at, u, 0, r), i ? pal.gold : colour, 0.1 * a);
    f.path(round(f, at, u, 0, r), i ? pal.gold : colour, 0.9 * a, w);
    f.path(round(f, at, u, 0, r * 0.55), i ? pal.gold : colour, 0.45 * a, 1);
    f.dot(at(u, 0), 0.012 * w, pal.ink, 0.8 * a);
  });
};

/** an allocation as rings round a core: arcs that turn slowly, each ring its own way */
const rings: Emblem = (f, at, colour, a, t, w) => {
  const { pal } = f;
  const turn = t < 0 ? 0.1 : t * 0.012;
  f.path(round(f, at, 0, 0, 0.88), pal.ink, 0.2 * a, 1);
  f.path(round(f, at, 0, 0, 0.6), pal.ink, 0.2 * a, 1);
  f.path(round(f, at, 0, 0, 0.3), pal.ink, 0.25 * a, 1);
  for (let k = 0; k < 3; k++) f.path(round(f, at, 0, 0, 0.88, turn + k / 3 + 0.02, turn + k / 3 + 0.2 + 0.05 * k), k === 1 ? pal.teal : colour, 0.9 * a, w * 1.5);
  for (let k = 0; k < 2; k++) f.path(round(f, at, 0, 0, 0.6, -turn * 1.6 + k / 2, -turn * 1.6 + k / 2 + 0.3), k ? pal.indigo : colour, 0.8 * a, w * 1.5);
  f.fill(round(f, at, 0, 0, 0.3), pal.gold, 0.14 * a);
  f.path(round(f, at, 0, 0, 0.3, turn * 2, turn * 2 + 0.7), pal.gold, 0.95 * a, w * 1.5);
  f.dot(at(0, 0), 0.016 * w, pal.gold, a);
};

/** a horizon: one long line, the short view and the long one bracketed over it, a traveller on the way */
const horizon: Emblem = (f, at, colour, a, t, w) => {
  const { pal } = f;
  const y = -0.3;
  f.line(at(-0.92, y), at(0.92, y), colour, 0.9 * a, w * 1.3);
  f.path([at(0.8, y + 0.09), at(0.92, y), at(0.8, y - 0.09)], colour, 0.9 * a, w);
  for (let k = 0; k <= 6; k++) f.line(at(-0.9 + k * 0.28, y), at(-0.9 + k * 0.28, y - (k % 3 ? 0.07 : 0.13)), pal.ink, 0.4 * a, 1);
  // the short view, and over it the long one
  f.path([at(-0.9, y + 0.12), at(-0.9, y + 0.26), at(-0.5, y + 0.26), at(-0.5, y + 0.12)], pal.ink, 0.45 * a, 1);
  f.path([at(-0.9, y + 0.4), at(-0.9, y + 0.62), at(0.78, y + 0.62), at(0.78, y + 0.4)], pal.gold, 0.9 * a, w);
  const go = t < 0 ? 0.62 : (t * 0.05) % 1;
  const p = at(-0.9 + 1.68 * go, y);
  if (t >= 0) f.glow(p, 0.1, pal.gold, 0.5 * Math.sin(Math.PI * go) * a);
  f.dot(p, 0.014 * w, pal.gold, (t < 0 ? 1 : Math.sin(Math.PI * go)) * a);
};

/** a balance: a beam on its post, two pans, and it is never quite still */
const balance: Emblem = (f, at, colour, a, t, w) => {
  const { pal } = f;
  const lean = t < 0 ? 0.06 : Math.sin(t * 0.4) * 0.1;
  f.path([at(-0.14, -0.85), at(0.14, -0.85), at(0, -0.6)], colour, 0.8 * a, w, true);
  f.line(at(0, -0.6), at(0, 0.5), colour, 0.8 * a, w);
  const ends = [-1, 1].map((sx) => [sx * 0.76 * Math.cos(lean), 0.5 + sx * 0.76 * Math.sin(lean)] as const);
  f.line(at(ends[0][0], ends[0][1]), at(ends[1][0], ends[1][1]), colour, 0.95 * a, w * 1.5);
  ends.forEach(([u, v], i) => {
    const pan = v - 0.52;
    f.line(at(u, v), at(u - 0.22, pan), pal.ink, 0.4 * a, 1);
    f.line(at(u, v), at(u + 0.22, pan), pal.ink, 0.4 * a, 1);
    f.line(at(u - 0.26, pan), at(u + 0.26, pan), colour, 0.9 * a, w * 1.3);
    // what each pan carries: one block, or two rounds
    if (i) {
      f.path(round(f, at, u - 0.09, pan + 0.09, 0.08), pal.teal, 0.85 * a, w);
      f.path(round(f, at, u + 0.1, pan + 0.09, 0.08), pal.teal, 0.85 * a, w);
    } else f.path([at(u - 0.11, pan + 0.02), at(u + 0.11, pan + 0.02), at(u + 0.11, pan + 0.22), at(u - 0.11, pan + 0.22)], pal.indigo, 0.85 * a, w, true);
  });
  f.dot(at(0, 0.5), 0.018 * w, pal.gold, a);
};

const EMBLEMS: Emblem[] = [ladder, barbell, rings, horizon, balance];

type State = { open: number[] };

const scene: Scene<State> = {
  // the composed still: the middle dossier open, its rings out
  pose: TURN * 2.6,
  setup() {
    return { open: [0, 0, 1, 0, 0] };
  },
  draw(f, s) {
    const { pal } = f;
    const m = f.mobile;
    const composed = f.still || f.dt === 0;
    f.aim(0.1 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.035), -0.42, 6.4, m ? 0.9 : 0.96);

    const tones = [pal.teal, pal.blue, pal.emerald, pal.indigo, pal.key];
    const mid = (ZF + ZB) / 2;
    const xOf = (i: number) => (i - (COUNT - 1) / 2) * GAP;
    const own = f.tag ? hash(f.tag) % COUNT : -1;

    // ── which folder is open: the one under the pointer, or each in turn
    let hot = Math.floor(f.t / TURN) % COUNT;
    if (f.hover > 0.3) {
      let best = f.u * GAP * 0.62;
      for (let i = 0; i < COUNT; i++) {
        const p = f.P(xOf(i), DESK, mid);
        const d = p ? Math.abs(p.x - f.mx) : Infinity;
        if (d < best) {
          best = d;
          hot = i;
        }
      }
    }
    const rate = clamp(f.dt * 3);
    for (let i = 0; i < COUNT; i++) s.open[i] = composed ? (i === hot ? 1 : 0) : s.open[i] + ((i === hot ? 1 : 0) - s.open[i]) * rate;

    deck(f, { y: FLOOR, alpha: 0.09 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.16 * f.boot);

    // ── the desk: a top with a lit front edge, on four legs
    const deskOn = f.on(0, 0.4);
    for (const sx of [-1, 1]) for (const z of [ZF - 0.12, 0.2]) f.line([sx * (DW - 0.1), DESK - 0.07, z], [sx * (DW - 0.1), FLOOR, z], pal.ink, 0.22 * deskOn, 1.5);
    slab(f, [-DW, DESK - 0.07, ZF - 0.2], [DW, DESK, 0.28], pal.ink, 0.07, deskOn);
    f.line([-DW, DESK, ZF - 0.2], [DW, DESK, ZF - 0.2], pal.key, 0.5 * deskOn, 1.25);

    // ── the five folders
    for (let i = 0; i < COUNT; i++) {
      const on = f.on(0.15 + i * 0.1, 0.4);
      if (on <= 0.003) continue;
      const o = ease(s.open[i]);
      const x = xOf(i);
      const tone = tones[i];
      const mark = i === own || o > 0.5 ? pal.gold : tone;
      const top = DESK + 0.03;
      pool(f, [x, DESK + 0.002, mid], 0.5, pal.gold, 0.3 * o * on);
      slab(f, [x - FW / 2, DESK, ZF], [x + FW / 2, top, ZB], tone, 0.1, on);
      // its index tab, on the front edge
      const tab: V3[] = [[x + 0.05, top, ZF - 0.055], [x + 0.21, top, ZF - 0.055], [x + 0.21, top, ZF], [x + 0.05, top, ZF]];
      f.fill(tab, pal.bg, 0.9 * on);
      f.fill(tab, mark, 0.3 * on);
      f.path(tab, mark, 0.8 * on, 1, true);
      // the paper inside, seen once the cover is up
      if (o > 0.02) {
        const paper: V3[] = [[x - FW * 0.42, top + 0.004, ZF + 0.06], [x + FW * 0.42, top + 0.004, ZF + 0.06], [x + FW * 0.42, top + 0.004, ZB - 0.05], [x - FW * 0.42, top + 0.004, ZB - 0.05]];
        f.fill(paper, pal.ink, 0.07 * o * on);
        f.path(paper, pal.ink, 0.3 * o * on, 1, true);
        const rows = m ? 3 : 5;
        for (let r = 0; r < rows; r++) {
          const z = lerp(ZB - 0.14, ZF + 0.14, r / (rows - 1));
          f.line([x - FW * 0.32, top + 0.006, z], [x - FW * 0.32 + FW * 0.64 * (0.5 + 0.5 * f.rnd(i * 6 + r + 30)), top + 0.006, z], r ? pal.ink2 : pal.gold, (r ? 0.6 : 0.9) * o * on, r ? 1.1 : 1.6);
        }
      }
      // the cover, turning on the hinge at its back
      const th = o * 1.9;
      const cover = (ux: number, d: number): V3 => [x + (ux * FW) / 2, top + 0.006 + Math.sin(th) * d, ZB - Math.cos(th) * d];
      const quad: V3[] = [cover(-1, 0), cover(1, 0), cover(1, FL), cover(-1, FL)];
      f.fill(quad, pal.bg, 0.9 * on);
      f.fill(quad, tone, (0.09 + 0.05 * o) * on);
      f.path(quad, pal.ink, 0.3 * on, 1, true);
      f.line(cover(-1, FL), cover(1, FL), mark, (0.55 + 0.4 * o) * on, 1.25);
      // the emblem pressed into it: seen while the folder is shut
      EMBLEMS[i](f, (u, v) => cover(u * 0.6, FL * (0.5 - v * 0.3)), tone, 0.7 * (1 - o) * on, -1, 1);
    }

    // ── what the open folder lets out: its idea on a card of glass, risen over it and at work
    for (let i = 0; i < COUNT; i++) {
      const o = ease(s.open[i]) * f.on(0.5, 0.4);
      if (o <= 0.02) continue;
      const x = xOf(i);
      // the outer folders' cards lean in a little, so they stay in the frame
      const c: V3 = [x * 0.84, lerp(-0.15, CY, o), CZ];
      const k = CK * lerp(0.45, 1, o);
      const at: Plane = (u, v) => [c[0] + u * k, c[1] + v * k, c[2]];
      const card: V3[] = [at(-1.16, -1.16), at(1.16, -1.16), at(1.16, 1.16), at(-1.16, 1.16)];
      const from: V3 = [x, DESK + 0.04, mid];
      const to = at(0, -1.16);
      f.line(from, to, pal.gold, 0.4 * o, 1);
      if (!composed) {
        // motes rising up the thread
        for (let n = 0; n < 3; n++) {
          const up = (f.t * 0.16 + n / 3) % 1;
          f.dot([lerp(from[0], to[0], up), lerp(from[1], to[1], up), lerp(from[2], to[2], up)], 0.011, pal.gold, Math.sin(Math.PI * up) * 0.8 * o);
        }
      }
      f.fill(card, pal.bg, 0.72 * o);
      f.fill(card, pal.ink, 0.035 * o);
      f.path(card, pal.ink, 0.2 * o, 1, true);
      f.line(card[3], card[2], pal.gold, 0.85 * o, 1.4);
      lamp(f, to, pal.gold, 0.7 * o, 0.012);
      EMBLEMS[i](f, at, tones[i], o, f.still ? -1 : f.t, m ? 1.2 : 1.6);
    }
  },
};

export default scene;
