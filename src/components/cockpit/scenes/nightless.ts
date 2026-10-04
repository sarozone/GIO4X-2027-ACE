/**
 * NIGHTLESS — the swap-free account: nights pass and nothing is taken or added.
 *
 * A position stands on the deck as one block in champagne. Over it runs an arc
 * of nights, a crescent moon for each, and a point of light travels the arc
 * from the first night to the last. Under every moon hangs a short open mark:
 * the place where a nightly charge or credit would fall, with nothing in it.
 * A level rule runs out from the top of the block on both sides and never
 * moves, and beside the block stands a coin with a stroke through it.
 *
 * Nothing here is a rate, an amount or a number of nights that means anything:
 * the moons are simply nights, and the lettering names the parts.
 *
 * The pointer: the night under it lights, its moon grows and its empty mark
 * brightens.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { arc, deck, lamp, pool, ring, slab } from "../kit";

const FLOOR = -0.95;
/** the block: half its width, its height, half its depth */
const [BW, BH, BD] = [0.42, 0.46, 0.24];
/** the arc of nights: where it starts and ends, its foot and how high it lifts */
const [AX, AY, LIFT] = [1.5, 0.18, 0.72];
/** a moon's radius, and how far below it the empty mark hangs */
const [MR, DROP] = [0.085, 0.2];
/** the coin: its centre and its radius */
const COIN: V3 = [1.14, FLOOR + 0.3, 0];
const CR = 0.23;
/** seconds for the light to travel the arc */
const LOOP = 18;

type State = { at: number[]; moons: V3[]; path: V3[]; phase: number };

const onArc = (u: number): V3 => [lerp(-AX, AX, u), AY + Math.sin(Math.PI * u) * LIFT, 0];

/** a crescent: the lit left edge of a disc, drawn flat to the viewer */
function crescent(f: Frame, p: V3, r: number, colour: string, alpha: number): void {
  const q = f.P(p[0], p[1], p[2]);
  if (!q || alpha <= 0.003) return;
  const R = Math.max(2, r * q.s * f.u);
  const { ctx } = f;
  ctx.beginPath();
  ctx.arc(q.x, q.y, R, -Math.PI / 2, Math.PI / 2, true);
  ctx.ellipse(q.x, q.y, R * 0.42, R, 0, Math.PI / 2, (3 * Math.PI) / 2, false);
  ctx.closePath();
  ctx.fillStyle = rgba(colour, alpha);
  ctx.fill();
}

const scene: Scene<State> = {
  pose: 9,
  setup(f) {
    const n = f.mobile ? 5 : 7;
    const at = Array.from({ length: n }, (_, i) => (i + 0.5) / n);
    return { at, moons: at.map(onArc), path: arc([-AX, AY, 0], [AX, AY, 0], LIFT, f.mobile ? 20 : 32), phase: f.rnd(2) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.12 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.03), -0.14, 6.3, 1.04);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 1.5, pal.gold, 0.2 * f.boot);

    // ── the position: one block, the same size on every night
    const blockOn = f.on(0, 0.35);
    slab(f, [-BW, FLOOR, -BD], [BW, FLOOR + BH, BD], pal.gold, 0.18 + 0.05 * f.hover, blockOn);
    // its level, ruled out to both sides: the rule does not move
    const top = FLOOR + BH;
    for (const side of [-1, 1]) {
      f.line([side * (BW + 0.05), top, -BD], [side * (BW + 0.34), top, -BD], pal.ink, 0.4 * blockOn, 1);
      f.line([side * (BW + 0.34), top - 0.04, -BD], [side * (BW + 0.34), top + 0.04, -BD], pal.ink, 0.5 * blockOn, 1);
    }

    // ── the arc of nights, and the light that travels it
    const arcOn = f.on(0.3, 0.35);
    f.path(s.path, pal.ink, 0.2 * arcOn, 1);
    const u = f.still ? 0.62 : (t / LOOP) % 1;
    const travel = clamp(u / 0.06) * clamp((1 - u) / 0.06) * f.on(0.8, 0.2);

    s.moons.forEach((p, i) => {
      const on = f.on(0.3 + 0.4 * (i / s.moons.length), 0.3);
      if (on <= 0.003) return;
      const d = u - (s.at[i] ?? 0);
      // a night answers the light as it passes, and keeps a little of it afterwards
      const passing = Math.exp(-(d * d) / (d > 0 ? 0.012 : 0.004)) * travel;
      const near = f.near(p, 70);
      const lit = Math.max(passing, near);
      if (lit > 0.02) f.glow(p, MR * 3.2, pal.gold, 0.32 * lit * on);
      crescent(f, p, MR * (1 + 0.3 * near), near > passing ? pal.gold : pal.ink, lerp(0.55, 1, lit) * on);
      // where a charge or a credit would fall: a short thread, and an open mark with nothing in it
      const foot: V3 = [p[0], p[1] - DROP, 0];
      ctx.save();
      ctx.setLineDash([2, 4]);
      f.line([p[0], p[1] - MR * 1.5, 0], foot, pal.ink, lerp(0.2, 0.5, lit) * on, 1);
      ctx.restore();
      const q = f.P(foot[0], foot[1] - 0.035, 0);
      if (q) {
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(2, 0.03 * q.s * f.u), 0, TAU);
        ctx.strokeStyle = rgba(near > 0.02 ? pal.gold : pal.ink, lerp(0.35, 0.95, lit) * on);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    if (travel > 0.003) lamp(f, onArc(u), pal.key, travel, 0.016);

    // ── the coin, struck through: no swap is paid and none is received
    const coinOn = f.on(0.6, 0.3);
    const over = f.near(COIN, 80);
    ring(f, COIN, CR, { axis: "z", colour: pal.ink, alpha: (0.5 + 0.3 * over) * coinOn, width: 1.3 });
    ring(f, COIN, CR * 0.72, { axis: "z", colour: pal.ink, alpha: 0.25 * coinOn });
    const k = CR * 0.98;
    f.line([COIN[0] - k, COIN[1] - k, 0], [COIN[0] + k, COIN[1] + k, 0], pal.crimson, (0.85 + 0.15 * over) * coinOn, 2);

    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    f.label("POSITION", [0, FLOOR, -BD], { align: "center", size, colour: pal.gold, alpha: 0.95 * named, dy: 15 });
    f.label("NO SWAP", [COIN[0], FLOOR, 0], { align: "center", size, colour: pal.ink, alpha: 0.85 * named, dy: 15 });
    if (!m) f.label("NIGHTS", onArc(0.5), { align: "center", size, colour: pal.ink2, alpha: 0.8 * named, dy: -22 });
  },
};

export default scene;
