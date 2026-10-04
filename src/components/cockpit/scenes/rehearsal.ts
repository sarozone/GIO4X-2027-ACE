/**
 * REHEARSAL — the demo account: the same desk, twice.
 *
 * Two identical trading desks stand side by side, each a table with one screen
 * on it. The left one is solid: smoked glass and machined edges. The right one
 * is the same desk drawn as a ghost, a dashed outline in champagne with nothing
 * inside it: the demo, where everything is in its place and nothing is at
 * stake. One order crosses both screens in step, the same instruction given
 * twice, and a fine line joins the two so that it reads as one order.
 *
 * Nothing here is a price or a result: the screens carry a few ticket rules
 * and the order's own track, and the only lettering names the two desks.
 *
 * The pointer: the desk under it lights, its edges brighten and its pool of
 * light on the deck grows.
 */
import { clamp, lerp, type Frame, type Scene, type V3 } from "../engine";
import { box, deck, eyeX, lamp, panel, pool, slab, trace } from "../kit";

const FLOOR = -0.95;
/** the tabletop: its underside and its top, half its width and half its depth */
const [UNDER, TOP, HW, HD] = [-0.37, -0.29, 0.72, 0.34];
/** the two desks stand this far either side of the middle */
const CX = 0.96;
/** the screen: width, height, how far back on the table it stands, and its foot above the table */
const [SW, SH, SZ, FOOT] = [1.02, 0.66, 0.14, 0.05];
/** seconds for the order to cross a screen and rest */
const LOOP = 8;
/** where on the screen the order's track runs (v), and its two ends (u) */
const [TRACK, U0, U1] = [0.36, 0.1, 0.9];

type State = { phase: number };

function desk(f: Frame, cx: number, ghost: boolean, order: number): void {
  const { pal, ctx } = f;
  const on = f.on(ghost ? 0.45 : 0.1, 0.4);
  if (on <= 0.003) return;
  const colour = ghost ? pal.gold : pal.key;
  const lit = f.near([cx, -0.1, 0], Math.max(90, f.u * 1.05));
  const [x0, x1] = [cx - HW, cx + HW];
  const yc = TOP + FOOT + SH / 2;
  // the pane rises the last little way as it powers on, as every pane in the kit does
  const rise = (1 - on) * -0.18;
  const at = (u: number, v: number): V3 => [cx + (u - 0.5) * SW, yc + (v - 0.5) * SH + rise, SZ - 0.004];
  const head = lerp(U0, U1, order);

  pool(f, [cx, FLOOR, 0], 1.05, colour, (0.13 + 0.26 * lit) * on);

  const legs: [number, number][] = [
    [x0 + 0.07, HD - 0.07],
    [x1 - 0.07, HD - 0.07],
    [x0 + 0.07, -HD + 0.07],
    [x1 - 0.07, -HD + 0.07],
  ];

  if (ghost) {
    // the outline of a desk: dashed, hollow, every edge where the solid one has it
    ctx.save();
    ctx.setLineDash([4, 4]);
    for (const [lx, lz] of legs) f.line([lx, FLOOR, lz], [lx, UNDER, lz], colour, (0.3 + 0.3 * lit) * on, 1);
    box(f, [x0, UNDER, -HD], [x1, TOP, HD], colour, (0.42 + 0.4 * lit) * on);
    f.line([cx, TOP, SZ], [cx, TOP + FOOT, SZ], colour, 0.5 * on, 1);
    f.path([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], colour, (0.55 + 0.4 * lit) * on, 1.1, true);
    f.line(at(0.04, 0.88), at(0.96, 0.88), colour, 0.28 * on, 1);
    ctx.restore();
    f.fill([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], colour, (0.03 + 0.05 * lit) * on);
  } else {
    for (const [lx, lz] of legs) {
      f.line([lx, FLOOR, lz], [lx, UNDER, lz], pal.ink, 0.1 * on, 3.5);
      f.line([lx, FLOOR, lz], [lx, UNDER, lz], pal.ink, (0.34 + 0.3 * lit) * on, 1);
    }
    slab(f, [x0, UNDER, -HD], [x1, TOP, HD], colour, 0.14 + 0.12 * lit, on);
    f.line([cx, TOP, SZ], [cx, TOP + FOOT, SZ], pal.ink, 0.4 * on, 2);
    panel(f, [cx, yc, SZ], SW, SH, { colour, alpha: 0.55 + 0.4 * lit, glass: 0.04 + 0.04 * lit, on, header: true });
  }

  // the ticket: a few rules where its fields would be, never a figure
  const ink = ghost ? colour : pal.ink;
  f.line(at(0.1, 0.72), at(0.46, 0.72), ink, 0.3 * on, 1);
  f.line(at(0.1, 0.6), at(0.34, 0.6), ink, 0.22 * on, 1);
  f.line(at(0.62, 0.72), at(0.9, 0.72), ink, 0.18 * on, 1);

  // the order: its track, how far it has come, and where it is filled
  f.line(at(U0, TRACK), at(U1, TRACK), ink, 0.16 * on, 1);
  f.line(at(U1, TRACK - 0.07), at(U1, TRACK + 0.07), ink, 0.5 * on, 1);
  if (head > U0 + 0.002) trace(f, [at(U0, TRACK), at(head, TRACK)], colour, (0.75 + 0.2 * lit) * on, 1.4);
  lamp(f, at(head, TRACK), colour, on, 0.016);

  f.label(ghost ? "DEMO" : "REAL", [cx, FLOOR, -HD], { align: "center", size: f.mobile ? 9 : 10, colour: ghost ? pal.gold : pal.ink, alpha: (0.8 + 0.2 * lit) * f.on(0.85, 0.15), dy: 15 });
}

const scene: Scene<State> = {
  pose: 5,
  setup(f) {
    return { phase: f.rnd(3) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const t = f.t;
    f.aim(0.15 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.2, 6.3, 1.04);

    deck(f, { y: FLOOR, alpha: 0.1 });

    // the order sets out, crosses, and rests at the far end before it is sent again
    const order = clamp(((t % LOOP) / LOOP) * 1.3) * f.on(0.6, 0.3);

    // the desk farther from the camera first, so the nearer one stands in front of it
    const eye = eyeX(f);
    const far = eye >= 0 ? -1 : 1;
    desk(f, far * CX, far > 0, order);
    desk(f, -far * CX, far < 0, order);

    // one order, two desks: a fine line from the solid screen to its ghost, at the order's own height
    const joined = f.on(0.7, 0.3);
    const y = TOP + FOOT + SH * TRACK;
    ctx.save();
    ctx.setLineDash([2, 5]);
    f.line([-CX + SW / 2, y, SZ], [CX - SW / 2, y, SZ], pal.ink, 0.4 * joined, 1);
    ctx.restore();
  },
};

export default scene;
