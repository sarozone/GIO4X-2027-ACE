/**
 * DECOY — how the scheme is built.
 *
 * A pyramid of ten blocks stands on the floor, and from outside it looks
 * solid. It is a shell: the blocks in its middle are outlines with nothing in
 * them. Coins come in along the floor from both sides, pass behind the wall
 * at the base, are seen crossing the empty middle, climb, and go out of sight
 * again behind the blocks at the top. Nothing comes back down. Beside the
 * pyramid a hook hangs on its line, and on the hook the bright thing that
 * brings the coins in.
 *
 * It is a diagram of a mechanism. It shows no scheme, no return and no sum.
 *
 * The pointer: the block under it turns to glass, and what is behind it (or
 * that nothing is) can be seen. On the lure, the lure burns brighter.
 */
import { TAU, clamp, type Frame, type Scene, type V3 } from "../engine";
import { box, eyeX, lamp, pool, slab, trace } from "../kit";

const FLOOR = -0.95;
/** a block: width, height, half its depth, the joint between two */
const [BW, BH, BD, JOINT] = [0.5, 0.34, 0.2, 0.03];
const TIERS = 4;
/** the pyramid's middle, and the height its top block ends at */
const CX = -0.32;
const APEX = FLOOR + TIERS * (BH + 0.02) - 0.02;
/** the height the coins travel at along the floor, and how far above the top they are last seen */
const RUN = FLOOR + BH / 2;
const OVER = 0.14;
/** the hook: where its line is made fast, how long the line is, the radius of the bend */
const [HX, HY, LINE, BEND] = [1.25, 1.25, 0.98, 0.11];

type Block = { x0: number; x1: number; y0: number; y1: number; tier: number; hollow: boolean; mid: V3 };
const BLOCKS: Block[][] = Array.from({ length: TIERS }, (_, tier) => {
  const n = TIERS - tier;
  const left = CX - (n * BW + (n - 1) * JOINT) / 2;
  return Array.from({ length: n }, (_, j) => {
    const x0 = left + j * (BW + JOINT);
    const y0 = FLOOR + tier * (BH + 0.02);
    return { x0, x1: x0 + BW, y0, y1: y0 + BH, tier, hollow: j > 0 && j < n - 1, mid: [x0 + BW / 2, y0 + BH / 2, -BD] as V3 };
  });
});

/** a coin's place after travelling `d` from where it came in on `side` (-1 left, 1 right) */
function coinAt(side: number, d: number): V3 {
  const flat = Math.abs(side * 1.75 - CX);
  return d < flat ? [side * 1.75 - side * d, RUN, 0] : [CX, RUN + (d - flat), 0];
}

function coin(f: Frame, p: V3, a: number): void {
  f.dot(p, 0.034, f.pal.gold, 0.9 * a);
  f.dot([p[0] - 0.008, p[1] + 0.008, p[2]], 0.014, f.pal.ink, 0.7 * a);
}

const scene: Scene = {
  pose: 10,
  draw(f) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    const phase = f.rnd(0) * 6;
    f.aim(0.2 + (f.still ? 0 : Math.sin(t * 0.08 + phase) * 0.035), -0.14, 6.4, 0.98);

    pool(f, [CX, FLOOR, 0], 1.7, pal.key, 0.2 * f.boot);
    f.line([-1.75, FLOOR, 0], [1.75, FLOOR, 0], pal.ink, 0.16 * f.boot, 1);

    // ── every block as an outline first: this is all the middle ones are
    const built = (b: Block) => f.on(0.1 + b.tier * 0.18, 0.3);
    for (const row of BLOCKS) {
      for (const b of row) {
        const on = built(b);
        if (on <= 0.003) continue;
        box(f, [b.x0, b.y0, -BD], [b.x1, b.y1, BD], b.hollow ? pal.crimson : pal.ink, (b.hollow ? 0.4 : 0.2) * on);
      }
    }

    // ── the coins: in along the floor from both sides, then up the middle
    const flow = f.on(0.7, 0.3);
    const count = Math.max(3, Math.round((m ? 4 : 6) * f.q));
    for (const side of [-1, 1]) {
      const total = Math.abs(side * 1.75 - CX) + (APEX + OVER - RUN);
      for (let i = 0; i < count; i++) {
        const u = (t * 0.07 + (i + (side > 0 ? 0.5 : 0)) / count + f.rnd(3 + i) * 0.05) % 1;
        coin(f, coinAt(side, u * total), clamp(u / 0.08) * clamp((1 - u) / 0.05) * flow);
      }
    }

    // ── the shell: the blocks on the outside, each tier from the far end to the near one
    const eye = eyeX(f);
    for (const row of BLOCKS) {
      const n = row.length;
      for (let k = 0; k < n; k++) {
        const b = row[eye >= CX ? k : n - 1 - k];
        if (b.hollow) continue;
        const top = b.tier === TIERS - 1;
        // under the pointer a block turns to glass
        const open = f.near(b.mid, f.u * 0.36);
        slab(f, [b.x0, b.y0, -BD], [b.x1, b.y1, BD], top ? pal.gold : pal.key, top ? 0.2 : 0.13, built(b) * (1 - 0.9 * open));
      }
    }
    // where it all goes: one light on the top block
    const crown: V3 = [CX, APEX + OVER, 0];
    lamp(f, crown, pal.gold, flow * (f.still ? 0.85 : 0.75 + 0.25 * Math.sin(t * 0.9)), 0.02);

    // ── the hook on its line, and the lure
    const hook = f.on(0.5, 0.35);
    if (hook > 0.003) {
      const sw = f.still ? 0 : Math.sin(t * 0.45 + phase) * 0.045;
      const end: V3 = [HX + Math.sin(sw) * LINE * hook, HY - Math.cos(sw) * LINE * hook, 0];
      f.line([HX, HY, 0], end, pal.ink, 0.5 * hook, 1);
      const bend: V3[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = -(i / 12) * TAU * 0.64;
        bend.push([end[0] - BEND + Math.cos(a) * BEND, end[1] + Math.sin(a) * BEND, 0]);
      }
      f.path(bend, pal.ink, 0.16 * hook, 4.5);
      f.path(bend, pal.ink, 0.85 * hook, 1.6);
      // the lure hangs in the bend of the hook
      const lure: V3 = [end[0] - BEND, end[1] - BEND - 0.13, 0];
      const burn = clamp((f.still ? 0.85 : 0.78 + 0.22 * Math.sin(t * 1.1)) + 0.5 * f.near(lure, f.u * 0.5));
      f.line([lure[0], end[1] - BEND, 0], lure, pal.ink, 0.5 * hook, 1);
      f.glow(lure, 0.5, pal.gold, 0.4 * burn * hook);
      f.dot(lure, 0.1, pal.gold, 0.22 * hook);
      const rim: V3[] = [];
      for (let i = 0; i <= 20; i++) rim.push([lure[0] + Math.cos((i / 20) * TAU) * 0.1, lure[1] + Math.sin((i / 20) * TAU) * 0.1, 0]);
      trace(f, rim, pal.gold, 0.95 * burn * hook, 1.5);
      f.dot(lure, 0.036, pal.gold, burn * hook);
      f.dot(lure, 0.015, pal.ink, 0.95 * burn * hook);
      // what it draws along the floor beneath it
      f.line([lure[0], lure[1] - 0.14, 0], [lure[0], RUN + 0.08, 0], pal.gold, 0.2 * hook, 1);

      ctx.save();
      ctx.letterSpacing = "1.5px";
      f.label("LURE", lure, { dx: f.u * 0.13 + 6, size: m ? 9 : 10, colour: pal.gold, alpha: 0.95 * f.on(0.9, 0.1) });
      ctx.restore();
    }

    const named = f.on(0.9, 0.1);
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("NEW MONEY", [CX + 1.5, FLOOR, 0], { align: "center", dy: 13, size: m ? 9 : 10, colour: pal.ink2, alpha: 0.85 * named });
    f.label("TOP", [CX - BW / 2, APEX - BH / 2, -BD], { align: "right", dx: -9, size: m ? 9 : 10, colour: pal.gold, alpha: 0.9 * named });
    // in the upper part of an empty block, clear of the coins that cross it
    if (!m) f.label("EMPTY", [CX - (BW + JOINT) / 2, RUN + 0.1, -BD], { align: "center", size: 9, colour: pal.crimson, alpha: 0.8 * named });
    ctx.restore();
  },
};

export default scene;
