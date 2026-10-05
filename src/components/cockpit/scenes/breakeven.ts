/**
 * BREAKEVEN — a trade starts under its costs, and has to come up through them.
 *
 * A tank of three strata stands on the deck, one on top of another: the
 * spread, the commission and the swap. Their upper face is the waterline, in
 * champagne: the level at which the trade has paid for itself. A price line
 * starts at the very bottom, where a trade begins, and climbs. While it is
 * inside the strata it is seen through their glass, dimmed; a small mark is
 * left where it passes from one stratum into the next, and where it breaks the
 * waterline a lamp lights and rings spread on the surface. From there on it is
 * above its costs.
 *
 * A gauge stands beside the tank, from the foot to the waterline: the move the
 * page works out. Thicker strata mean a longer gauge, and a line that climbs at
 * the same pace surfaces later.
 *
 * The strata have no amounts and their thicknesses are not GIO4X's charges; the
 * line is a drawing of a climb, not a market. The page below does the
 * arithmetic with the visitor's own figures.
 *
 * The pointer: the stratum it is held on thickens, the waterline rises with it
 * and the place where the line surfaces moves away.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, ring, trace } from "../kit";

const FLOOR = -1;
/** the tank: its two ends, its foot, half its depth */
const [X0, X1, BASE, ZD] = [-1.4, 1.4, -0.8, 0.26];
/** the strata, from the lowest: how thick each is at rest, and its name */
const THICK = [0.26, 0.2, 0.24] as const;
const NAMES = ["SPREAD", "COMMISSION", "SWAP"] as const;
/** how much thicker a stratum grows under the pointer, as a share of itself */
const SWELL = 0.9;
/** the price line: how far it climbs over the tank's length, how far above the foot it starts, its segments */
const [RISE, START, N] = [1.3, 0.035, 56];
/** seconds for one climb: the line draws itself, stands, and is cleared */
const LOOP = 18;
/** where the gauge stands */
const GX = X0 - 0.2;
/** scratch, reused every frame: the four levels and where the line crosses the upper three */
const level = new Float32Array(4);
const cross = new Float32Array(3);

type State = {
  /** the climb, 0 at the first point and 1 at the last, with the unevenness of a price */
  g: Float32Array;
  /** how much each stratum is swollen, 0 to 1 */
  swell: Float32Array;
  phase: number;
};

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};
const fract = (v: number) => v - Math.floor(v);

const scene: Scene<State> = {
  // the composed still: the whole climb drawn, the line above the waterline
  pose: 13,
  setup(f) {
    const phase = f.rnd(5) * 6;
    const g = new Float32Array(N + 1);
    for (let k = 0; k <= N; k++) {
      const u = k / N;
      // pinned at both ends, so the line always starts at the foot and always ends above the costs
      g[k] = u + Math.sin(Math.PI * u) * (0.05 * Math.sin(u * 15 + phase) + 0.022 * Math.sin(u * 37 + phase * 2));
    }
    return { g, swell: new Float32Array(3), phase };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.17 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.15, 6.3, 1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the levels: each stratum breathes a little, and the one under the pointer is thicker
    level[0] = BASE;
    for (let i = 0; i < 3; i++) {
      const breath = f.still ? 0 : 0.07 * Math.sin(t * 0.23 + i * 2.1 + s.phase);
      level[i + 1] = level[i] + THICK[i] * (1 + breath + SWELL * s.swell[i]);
    }
    // which stratum the pointer is held on: above the waterline counts as the top one, below the foot as the lowest
    let hot = -1;
    if (f.hover > 0) {
      hot = 0;
      for (let i = 1; i < 3; i++) {
        const p = f.P(0, level[i], -ZD);
        if (p && f.my < p.y) hot = i;
      }
    }
    const rate = 1 - Math.exp(-f.dt * 3);
    for (let i = 0; i < 3; i++) s.swell[i] = f.still ? 0 : s.swell[i] + ((i === hot ? f.hover : 0) - s.swell[i]) * rate;
    const surface = level[3];

    // ── the price line, and where it passes out of each stratum
    const at = (k: number): V3 => {
      const c = clamp(k, 0, N);
      const i = Math.min(N - 1, Math.floor(c));
      return [lerp(X0, X1 - 0.04, c / N), BASE + START + RISE * lerp(s.g[i], s.g[i + 1], c - i), 0];
    };
    for (let i = 0; i < 3; i++) {
      const want = (level[i + 1] - BASE - START) / RISE;
      cross[i] = N;
      for (let k = 1; k <= N; k++) {
        if (s.g[k] < want) continue;
        const step = s.g[k] - s.g[k - 1];
        cross[i] = step > 1e-6 ? k - 1 + clamp((want - s.g[k - 1]) / step) : k;
        break;
      }
    }
    /** the points of the line between two places on it */
    const span = (from: number, to: number): V3[] => {
      const pts: V3[] = [at(from)];
      for (let k = Math.floor(from) + 1; k < to; k++) pts.push(at(k));
      if (to > from) pts.push(at(to));
      return pts;
    };
    // how far the line has been drawn, and how much of it is shown: it is cleared before the next climb begins
    const turn = fract(t / LOOP);
    const head = f.still ? N : N * clamp(turn / 0.6);
    const shown = (f.still ? 1 : smooth(turn / 0.03) * (1 - smooth((turn - 0.93) / 0.07))) * f.on(0.5, 0.3);
    const out = clamp(head - cross[2]);

    const second = pal.key === pal.teal ? pal.blue : pal.teal;
    const tones = [second, pal.indigo, pal.crimson];

    // ── the far side of each stratum, and what is suspended in it
    const motes = Math.round((m ? 3 : 6) * f.q);
    for (let i = 0; i < 3; i++) {
      const on = f.on(0.1 + i * 0.14, 0.3);
      if (on <= 0.003) continue;
      const y0 = level[i];
      const y1 = lerp(y0, level[i + 1], on);
      const back: V3[] = [[X0, y0, ZD], [X1, y0, ZD], [X1, y1, ZD], [X0, y1, ZD]];
      f.fill(back, tones[i], 0.05 * on);
      f.path(back, pal.ink, 0.1 * on, 1, true);
      for (let j = 0; j < motes; j++) {
        const n = i * 20 + j * 3;
        const x = lerp(X0 + 0.06, X1 - 0.06, fract(f.rnd(n + 30) + (f.still ? 0 : t * (0.003 + 0.004 * f.rnd(n + 31)))));
        f.dot([x, lerp(y0, y1, 0.14 + 0.72 * f.rnd(n + 32)), (f.rnd(n + 33) - 0.5) * ZD * 1.5], 0.007, tones[i], 0.4 * on);
      }
    }

    // ── the part of the line that is still under its costs, seen through the glass
    const under = Math.min(head, cross[2]);
    if (under > 0) trace(f, span(0, under), pal.key, 0.75 * shown, 1.3);

    // ── the near side of each stratum, and its end
    for (let i = 0; i < 3; i++) {
      const on = f.on(0.1 + i * 0.14, 0.3);
      if (on <= 0.003) continue;
      const y0 = level[i];
      const y1 = lerp(y0, level[i + 1], on);
      const lit = s.swell[i];
      const front: V3[] = [[X0, y0, -ZD], [X1, y0, -ZD], [X1, y1, -ZD], [X0, y1, -ZD]];
      const end: V3[] = [[X1, y0, -ZD], [X1, y0, ZD], [X1, y1, ZD], [X1, y1, -ZD]];
      f.fill(end, pal.bg, 0.3 * on);
      f.fill(end, tones[i], 0.07 * on);
      f.path(end, tones[i], 0.25 * on, 1, true);
      f.fill(front, pal.bg, 0.28 * on);
      f.fill(front, tones[i], (0.1 + 0.14 * lit) * on);
      f.path(front, tones[i], (0.4 + 0.45 * lit) * on, 1, true);
    }

    // ── the waterline: the upper face of the costs
    const top = f.on(0.55, 0.3);
    const face: V3[] = [[X0, surface, -ZD], [X1, surface, -ZD], [X1, surface, ZD], [X0, surface, ZD]];
    f.fill(face, pal.gold, 0.09 * top);
    f.path(face, pal.gold, 0.35 * top, 1, true);
    trace(f, [[X0, surface, -ZD], [X1, surface, -ZD]], pal.gold, 0.9 * top, 1.5, f.still ? -1 : t / 8);
    // rings where the line has come through it
    if (out > 0) {
      const c = at(cross[2]);
      for (let r = 0; r < 2; r++) {
        const life = f.still ? 0.3 + r * 0.4 : fract(t / 5 + r * 0.5);
        ring(f, [c[0], surface, 0], 0.04 + 0.19 * life, { colour: pal.gold, alpha: 0.55 * Math.sin(Math.PI * life) * out * shown, seg: 28 });
      }
    }

    // ── the part of the line that is above its costs
    if (head > cross[2]) trace(f, span(cross[2], head), pal.key, 0.95 * shown, 1.7);
    lamp(f, at(0), pal.ink, 0.6 * shown, 0.012);
    for (let i = 0; i < 2; i++) f.dot(at(cross[i]), 0.014, pal.ink, 0.8 * shown * clamp(head - cross[i]));
    lamp(f, at(cross[2]), pal.gold, out * shown, 0.02);
    if (!f.still && head < N) {
      f.glow(at(head), 0.13, pal.key, 0.7 * shown);
      f.dot(at(head), 0.012, pal.ink, 0.95 * shown);
    }

    // ── the gauge: from the foot to the waterline, the move that is needed
    const rule = f.on(0.7, 0.3);
    for (let y = BASE; y <= BASE + 1.105; y += 0.1) f.line([GX - 0.035, y, -ZD], [GX, y, -ZD], pal.ink, 0.3 * rule, 1);
    f.line([GX, BASE, -ZD], [GX, BASE + 1.1, -ZD], pal.ink, 0.16 * rule, 1);
    f.line([GX, BASE, -ZD], [GX, surface, -ZD], pal.gold, 0.9 * rule, 1.6);
    for (const y of [BASE, surface]) f.line([GX - 0.06, y, -ZD], [GX + 0.06, y, -ZD], pal.gold, 0.9 * rule, 1.4);
    f.line([GX + 0.06, surface, -ZD], [X0, surface, -ZD], pal.gold, 0.3 * rule, 1);

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 8 : 10;
    ctx.save();
    ctx.letterSpacing = m ? "1px" : "1.5px";
    for (let i = 0; i < 3; i++) {
      const lit = s.swell[i];
      f.label(NAMES[i], [X1 - 0.07, (level[i] + level[i + 1]) / 2, -ZD], { align: "right", size, colour: lit > 0.3 ? pal.ink : tones[i], alpha: (0.85 + 0.15 * lit) * named });
    }
    f.label("ENTRY", [X0, BASE, -ZD], { size, colour: pal.ink2, alpha: 0.85 * named, dy: 12 });
    f.label("MOVE", [GX, surface, -ZD], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -12 });
    f.label("BREAK-EVEN", [at(cross[2])[0], surface, 0], { align: "right", size, colour: pal.gold, alpha: 0.95 * named * out * shown, dx: -9, dy: -11 });
    ctx.restore();
  },
};

export default scene;
