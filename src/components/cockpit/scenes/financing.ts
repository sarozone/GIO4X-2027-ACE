/**
 * FINANCING — a position held through a row of nights.
 *
 * A block lies on the deck: the position. Over it hang five moons, one for
 * each night it stays open. At every night a small coin travels the thread
 * between the block and its moon. For a while the coins leave the block and
 * rise, which is a night that is charged; then the row turns and they come
 * down to it, which is a night that is credited. Overnight financing can be
 * either, and the picture takes no side. One night is marked TRIPLE: its
 * moon is drawn three times over and three coins travel its thread, because
 * on one night of the week the financing is applied for three.
 *
 * No coin has a value and no night a name or a date: the page below does the
 * arithmetic with the visitor's own rates.
 *
 * The pointer: the night under it lights. Its moon lifts and brightens, its
 * thread shows and its place on the block glows.
 */
import { TAU, clamp, lerp, type Scene } from "../engine";
import { deck, pool, slab } from "../kit";

const FLOOR = -0.86;
/** the position: half its length, its top, half its depth */
const [HALF, TOP, BD] = [1.45, -0.56, 0.22];
/** the nights: how many, the first one's place, the step between them, which one is the triple */
const [NIGHTS, FIRST, STEP, TRIPLE] = [5, -1.16, 0.58, 3];
/** the moons: their height and radius */
const [MY, MR] = [0.6, 0.15];
/** where a coin's journey ends, just under its moon */
const UNDER = MY - MR - 0.07;
/** seconds for one coin to travel its thread, and for the row to turn from leaving to arriving */
const [TRIP, TURN] = [4.2, 22];

/** a crescent, as a ring of points round a unit moon: the lit limb, then the terminator back; tilted a little */
const LIMB = 9;
const CRESCENT: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = [];
  const tilt = -0.42;
  const turn = (x: number, y: number): [number, number] => [x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt)];
  for (let i = 0; i <= LIMB; i++) {
    const a = -TAU / 4 + (i / LIMB) * (TAU / 2);
    out.push(turn(Math.cos(a), Math.sin(a)));
  }
  for (let i = LIMB - 1; i >= 1; i--) {
    const a = -TAU / 4 + (i / LIMB) * (TAU / 2);
    out.push(turn(Math.cos(a) * 0.42, Math.sin(a)));
  }
  return out;
})();
/** scratch, reused for every crescent drawn */
const ring: [number, number, number][] = CRESCENT.map(() => [0, 0, 0]);

type State = { phase: number };

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};
const fract = (v: number) => v - Math.floor(v);

const scene: Scene<State> = {
  pose: 6,
  setup(f) {
    return { phase: f.rnd(7) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.15 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.13, 6.3, 1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.6, pal.key, 0.2 * f.boot);

    const crescent = (x: number, y: number, r: number, colour: string, alpha: number) => {
      if (alpha <= 0.003) return;
      for (let i = 0; i < ring.length; i++) {
        ring[i][0] = x + CRESCENT[i][0] * r;
        ring[i][1] = y + CRESCENT[i][1] * r;
      }
      f.fill(ring, colour, alpha);
    };

    // ── a few stars behind the moons: it is night
    const stars = Math.round((m ? 7 : 14) * f.q);
    for (let i = 0; i < stars; i++) {
      const tw = f.still ? 0.7 : 0.55 + 0.45 * Math.sin(t * 0.5 + f.rnd(i + 40) * TAU);
      f.dot([lerp(-1.6, 1.6, f.rnd(i + 10)), lerp(0.15, 1.05, f.rnd(i + 20)), 0.3], 0.008, pal.ink, 0.5 * tw * f.on(0.3, 0.4));
    }

    // ── the position
    const blockOn = f.on(0, 0.35);
    slab(f, [-HALF, FLOOR, -BD], [HALF, TOP, BD], pal.key, 0.13 + 0.04 * f.hover, blockOn);

    // ── the row turns slowly: for a while the coins leave the position, then they arrive at it
    const cycle = f.still ? 0.3 : t / TURN + 0.3;
    const arriving = Math.floor(cycle) % 2 === 1;
    const within = fract(cycle);
    const flow = f.still ? 1 : smooth(within / 0.07) * (1 - smooth((within - 0.93) / 0.07));

    // ── how wide one night is on the screen, for the pointer
    const p0 = f.P(FIRST, 0, 0);
    const p1 = f.P(FIRST + STEP, 0, 0);
    const span = p0 && p1 ? Math.max(6, Math.abs(p1.x - p0.x)) : 60;

    const size = m ? 9 : 10;
    for (let i = 0; i < NIGHTS; i++) {
      const x = FIRST + i * STEP;
      const on = f.on(0.2 + i * 0.1, 0.3);
      if (on <= 0.003) continue;
      const triple = i === TRIPLE;
      const here = f.P(x, 0, 0);
      const lit = here ? clamp(1.25 - Math.abs(f.mx - here.x) / (span * 0.5)) * f.hover : 0;
      const colour = triple ? pal.gold : pal.ink;
      const my = MY + 0.05 * lit;

      // its place on the position
      f.fill([[x - STEP * 0.42, TOP, -BD], [x + STEP * 0.42, TOP, -BD], [x + STEP * 0.42, TOP, BD], [x - STEP * 0.42, TOP, BD]], triple ? pal.gold : pal.key, (triple ? 0.1 : 0.04) * on + 0.26 * lit);
      // the thread between the position and its moon
      f.line([x, TOP, 0], [x, UNDER, 0], colour, (0.16 + 0.4 * lit) * on, 1);

      // the moon: a dark disc, and its lit crescent. The triple night's is drawn three times over
      if (lit > 0.02) f.glow([x, my, 0], MR * 2.4, colour, 0.3 * lit * on);
      if (triple) {
        crescent(x - 0.13, my + 0.07, MR * 0.9, pal.gold, 0.22 * on);
        crescent(x - 0.065, my + 0.035, MR * 0.95, pal.gold, 0.4 * on);
      }
      f.dot([x, my, 0], MR, pal.bg, 0.9 * on);
      f.dot([x, my, 0], MR, colour, (0.1 + 0.08 * lit) * on);
      crescent(x, my, MR, colour, (0.7 + 0.3 * lit) * on);

      // the coins on the thread: one a night, three on the triple night
      const coins = triple ? 3 : 1;
      for (let c = 0; c < coins; c++) {
        const u = fract((f.still ? 6 : t) / TRIP - i * 0.17 - c * 0.11);
        const y = arriving ? lerp(UNDER, TOP + 0.04, smooth(u)) : lerp(TOP + 0.04, UNDER, smooth(u));
        const a = Math.sin(Math.PI * u) * flow * on;
        if (a <= 0.01) continue;
        f.glow([x, y, 0], 0.09, pal.gold, 0.35 * a);
        f.dot([x, y, 0], 0.03, pal.gold, 0.95 * a);
        f.dot([x, y, 0], 0.017, pal.bg, 0.45 * a);
      }
    }

    // ── the names
    const named = f.on(0.85, 0.15);
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("TRIPLE", [FIRST + TRIPLE * STEP, MY + MR + 0.07, 0], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: -12 });
    f.label("POSITION", [0, FLOOR, -BD], { align: "center", size, colour: pal.key, alpha: 0.9 * named, dy: 14 });
    f.label("NIGHTS", [FIRST, MY + MR, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: -12 });
    ctx.restore();
  },
};

export default scene;
