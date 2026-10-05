/**
 * LOTS — one size, taken apart three times.
 *
 * A single block lies on the deck: a standard lot. It comes apart into ten
 * plates, and each plate is a mini lot. One of the ten is lifted out of the
 * row, and it comes apart into ten leaves: each leaf is a micro lot. One leaf
 * is drawn aside and falls into grains, the units a lot is counted in. Then
 * the grains close into the leaf, the leaves into the plate, the plate goes
 * back into its place and the ten are one block again. Nothing is added and
 * nothing is lost on the way: it is the same size, named four ways.
 *
 * In front lies a rule as long as the block, divided into ten, and its first
 * tenth into ten again. A champagne bracket on it spans one piece of whatever
 * is being shown, and the piece itself wears a champagne edge: the whole, one
 * plate, one leaf, a grain.
 *
 * The plates and the leaves are ten each because that is what the names mean.
 * The grains are not counted, and the rule carries tick marks only. No size
 * here is a recommendation.
 *
 * The pointer: across the frame it chooses how far the block is taken apart,
 * from whole at the left to units at the right.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { box, deck, eyeX, lamp, pool, slab, trace } from "../kit";

/** the block: its foot, its height, half its depth, the width of one plate */
const [BASE, H, ZD, PW] = [-0.85, 0.5, 0.25, 0.2];
/** half its length when it is whole */
const HALF = PW * 5;
/** how far the plates stand apart, which one is lifted out, and how high */
const [GAP, PICK, LIFT] = [0.045, 3, 0.72];
/** a leaf: its thickness, and how far the leaves stand apart */
const [LH, LG] = [H / 10, 0.022];
/** how far the top leaf is drawn aside, and how far it rises as it goes */
const [SLIDE, RISE] = [0.85, 0.1];
/** the rule in front: how far in front of the block it lies */
const ZG = 0.8;
/** seconds for the block to be taken apart and put together again */
const LOOP = 32;
const NAMES = ["STANDARD", "MINI", "MICRO", "UNITS"] as const;

type State = { d: number; phase: number };

const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};
const fract = (v: number) => v - Math.floor(v);
/** a level that rests at each whole step and moves between them */
const stepped = (v: number) => Math.floor(v) + smooth((v - Math.floor(v)) * 2 - 0.5);

const scene: Scene<State> = {
  // the composed still: taken apart all the way, every level in view
  pose: 16,
  setup(f) {
    return { d: 3, phase: f.rnd(8) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.38 + (f.still ? 0 : Math.sin(t * 0.06 + s.phase) * 0.04), -0.22, 6.3, 1);

    deck(f, { y: BASE, alpha: 0.11 });
    pool(f, [0, BASE, 0], 2.5, pal.key, 0.22 * f.boot);

    // ── how far it is taken apart: 0 whole, 1 plates, 2 leaves, 3 grains. It goes there and back; under the pointer it is chosen
    const there = 1 - Math.abs(2 * fract(t / LOOP + 0.5) - 1);
    const auto = stepped(clamp(there * 3.6 - 0.3, 0, 3));
    const held = stepped(clamp(((f.mx - f.box.x) / f.box.w) * 3.4 - 0.2, 0, 3));
    const want = lerp(auto, held, smooth(f.hover));
    s.d = f.still ? 3 : s.d + (want - s.d) * (1 - Math.exp(-f.dt * 2.4));
    const d = s.d;
    // each step in two halves: the piece comes away first, then it opens
    const apart = smooth(d);
    const lifted = smooth((d - 1) * 2);
    const leaved = smooth((d - 1) * 2 - 1);
    const aside = smooth((d - 2) * 2);
    const grained = smooth((d - 2) * 2 - 1);

    const second = pal.key === pal.teal ? pal.blue : pal.teal;
    const gap = GAP * apart;
    /** the near left foot of plate i in the row */
    const plateX = (i: number) => (i - 5) * PW + (i - 4.5) * gap;
    const on = f.on(0, 0.4);
    /** a champagne edge on the piece that is one of what is being shown */
    const edge = (x0: number, y0: number, x1: number, y1: number, alpha: number) => {
      if (alpha <= 0.01) return;
      f.fill([[x0, y0, -ZD], [x1, y0, -ZD], [x1, y1, -ZD], [x0, y1, -ZD]], pal.gold, 0.12 * alpha);
      box(f, [x0, y0, -ZD], [x1, y1, ZD], pal.gold, 0.8 * alpha);
    };

    // ── the row: one block while it is whole, ten plates once it has come apart
    if (apart <= 0.01) {
      slab(f, [-HALF, BASE, -ZD], [HALF, BASE + H, ZD], pal.key, 0.13 + 0.04 * f.hover, on);
    } else {
      // from the plate farthest from the camera to the nearest
      const eye = eyeX(f);
      const order = Array.from({ length: 10 }, (_, i) => i).sort((p, q) => Math.abs(plateX(q) - eye) - Math.abs(plateX(p) - eye));
      for (const i of order) {
        const x = plateX(i);
        if (i === PICK && lifted > 0.01) {
          // the place it was taken from
          box(f, [x, BASE, -ZD], [x + PW, BASE + H, ZD], pal.gold, 0.22 * lifted * on);
          continue;
        }
        slab(f, [x, BASE, -ZD], [x + PW, BASE + H, ZD], pal.key, 0.13 + 0.04 * f.hover, on * f.on(0.1 + i * 0.05, 0.3));
      }
    }
    edge(-HALF, BASE, HALF, BASE + H, (1 - smooth(d * 4)) * on);

    // ── the plate that is lifted out, and the ten leaves it opens into
    const px = plateX(PICK);
    const py = BASE + LIFT * lifted;
    const leafY = (j: number) => py + j * (LH + LG * leaved);
    if (lifted > 0.01) {
      for (const x of [px, px + PW]) f.line([x, BASE + H, -ZD], [x, py, -ZD], pal.ink, 0.2 * lifted * on, 1);
      if (leaved <= 0.01) slab(f, [px, py, -ZD], [px + PW, py + H, ZD], pal.key, 0.16, on);
      else {
        // from the lowest leaf up; the top one is drawn aside, and its place is left open
        for (let j = 0; j < 9; j++) slab(f, [px, leafY(j), -ZD], [px + PW, leafY(j) + LH, ZD], second, 0.16, on);
        if (aside > 0.01) box(f, [px, leafY(9), -ZD], [px + PW, leafY(9) + LH, ZD], pal.gold, 0.22 * aside * on);
      }
    }
    edge(px, py, px + PW, py + H + 9 * LG * leaved, smooth(d * 4) * (1 - leaved) * on);

    // ── the leaf that is drawn aside, and the grains it falls into
    if (leaved > 0.01) {
      const lx = px + SLIDE * aside;
      const ly = leafY(9) + RISE * aside;
      if (aside > 0.01) f.line([px + PW, leafY(9) + LH / 2, -ZD], [lx, ly + LH / 2, -ZD], pal.gold, 0.25 * aside * on, 1);
      slab(f, [lx, ly, -ZD], [lx + PW, ly + LH, ZD], second, 0.18, (1 - grained) * on);
      edge(lx, ly, lx + PW, ly + LH, leaved * (1 - grained) * on);
      if (grained > 0.01) {
        const [nx, nz] = m || f.q < 0.75 ? [3, 7] : [4, 10];
        // they loosen as they come apart: a leaf's worth of units, not a count of them
        const loose = 1 + 0.45 * grained;
        for (let i = 0; i < nx; i++) {
          for (let k = 0; k < nz; k++) {
            const n = i * nz + k;
            const gx = lx + PW / 2 + ((i + 0.5) / nx - 0.5) * PW * loose;
            const gz = ((k + 0.5) / nz - 0.5) * 2 * ZD * loose;
            const gy = ly + LH / 2 + (f.rnd(n + 20) - 0.5) * 0.07 * grained + (f.still ? 0 : 0.008 * Math.sin(t * 0.7 + n));
            f.dot([gx, gy, gz], 0.011, pal.gold, (0.55 + 0.4 * f.rnd(n + 60)) * grained * on);
          }
        }
        f.glow([lx + PW / 2, ly + LH / 2, 0], 0.3, pal.gold, 0.16 * grained * on);
      }
    }

    // ── the rule in front: as long as the block, in tenths, and its first tenth in tenths again
    const rule = f.on(0.6, 0.3);
    const at = (x: number, lift = 0): V3 => [x, BASE + lift, -ZG];
    f.line(at(-HALF), at(HALF), pal.ink, 0.4 * rule, 1);
    for (let i = 0; i <= 10; i++) {
      const x = -HALF + i * PW;
      f.line(at(x), at(x, i % 10 ? 0.04 : 0.065), pal.ink, (i % 10 ? 0.2 + 0.35 * apart : 0.6) * rule, 1);
    }
    for (let i = 1; i < 10; i++) f.line(at(-HALF + (i * PW) / 10), at(-HALF + (i * PW) / 10, 0.024), pal.ink, 0.5 * leaved * rule, 1);
    // the bracket: one piece of what is being shown. A tenth of the last, at every step
    const span = Math.max(0.004, 2 * HALF * Math.pow(10, -d));
    const [b0, b1] = [-HALF, -HALF + span];
    trace(f, [at(b0, 0.1), at(b1, 0.1)], pal.gold, 0.95 * rule, 1.6);
    for (const x of [b0, b1]) f.line(at(x, 0.065), at(x, 0.1), pal.gold, 0.9 * rule, 1.4);
    lamp(f, at(b0, 0.1), pal.gold, rule * smooth(d - 2), 0.015);

    // ── the names: the one for what is being shown
    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    for (let i = 0; i < NAMES.length; i++) {
      f.label(NAMES[i], at(-HALF), { size, colour: pal.gold, alpha: 0.95 * named * clamp(1 - Math.abs(d - i) * 1.7), dy: 14 });
    }
    ctx.restore();
  },
};

export default scene;
