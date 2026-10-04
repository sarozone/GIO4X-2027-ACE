/**
 * ANATOMY — one order, taken apart.
 *
 * An exploded view, as an engineer draws an assembly. At the bottom lies the
 * ticket, the order itself, in champagne. Above it four sheets of glass lift
 * apart on the same four construction lines, each a part of that one order
 * and each carrying its own small diagram: the margin set aside inside the
 * whole, the spread as two lines and the gap between them, the size as a row
 * of equal lots, the result as a marker that can come to rest on either side
 * of the entry. A leader line carries each sheet's name out to the right. The
 * stack opens and closes slowly, and an attention moves up it sheet by sheet.
 *
 * The diagrams are shapes only: no amount, no rate, no price, and the result
 * marker follows a fixed, drawn sway, not an outcome.
 *
 * The pointer takes a sheet out: the one under it lifts clear of the others,
 * brightens, and its name is lit; the whole stack opens a little further.
 */
import { clamp, lerp, type Frame, type Palette, type Scene, type V3 } from "../engine";
import { lamp, slab } from "../kit";

type Tone = keyof Pick<Palette, "blue" | "teal" | "indigo" | "emerald">;
const PARTS: readonly (readonly [string, Tone])[] = [
  ["MARGIN", "blue"],
  ["SPREAD", "teal"],
  ["SIZE", "indigo"],
  ["RESULT", "emerald"],
];

/** the stack: where it stands, half its width and depth, the ticket's top, the most one sheet lifts off the next */
const [CX, HW, HD, YB, GAP] = [-0.5, 0.78, 0.5, -0.85, 0.42];
/** how far a leader runs out to its name */
const REACH = 0.42;
/** seconds the attention rests on one sheet */
const HOLD = 3.4;

const scene: Scene = {
  pose: 8,
  draw(f: Frame) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.5 + (f.still ? 0 : Math.sin(t * 0.06) * 0.05), 0.4, 6.4, 1);

    const on = f.on(0, 0.6);
    const open = clamp(on * (0.62 + 0.38 * (0.5 + 0.5 * Math.sin(t * 0.3))) + 0.1 * f.hover);
    const gap = GAP * open;
    /** a point of a sheet: a across it, b into it (each -1 to 1), at height y */
    const at = (a: number, b: number, y: number): V3 => [CX + a * HW, y, b * HD];

    // ── the ticket: the order itself, with its ruled lines
    slab(f, [CX - HW, YB - 0.08, -HD], [CX + HW, YB, HD], pal.gold, 0.2, on);
    for (let i = 0; i < 3; i++) {
      const b = -0.5 + i * 0.4;
      f.line(at(-0.78, b, YB), at(i === 0 ? 0.1 : 0.62 - i * 0.14, b, YB), i === 0 ? pal.gold : pal.ink, (i === 0 ? 0.8 : 0.3) * on, i === 0 ? 1.5 : 1);
    }

    // ── the construction lines the sheets rise on
    const top = YB + PARTS.length * gap;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) f.line(at(a, b, YB), at(a, b, top), pal.ink, 0.17 * on, 1);

    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    const named = f.on(0.7, 0.3);
    const name = (text: string, y: number, colour: string, lit: number) => {
      const from = at(1, 0, y);
      const to: V3 = [CX + HW + REACH, y, 0];
      f.line(from, to, colour, (0.3 + 0.5 * lit) * named, 1);
      f.dot(from, 0.014, colour, 0.9 * named);
      f.label(text, to, { size, colour, alpha: (0.72 + 0.28 * lit) * named, dx: 7 });
    };
    name("ORDER", YB - 0.04, pal.gold, 1);

    // ── the four sheets, from the lowest up, so that each lies over the one beneath
    const turn = Math.floor(t / HOLD) % PARTS.length;
    const pulse = Math.sin(Math.PI * (t / HOLD - Math.floor(t / HOLD)));
    PARTS.forEach(([text, tone], i) => {
      const colour = pal[tone];
      const rest = YB + (i + 1) * gap;
      const touch = f.near(at(0, 0, rest), m ? 46 : 62);
      const auto = i === turn ? (f.still ? 1 : pulse) * (1 - f.hover) : 0;
      const lit = Math.max(touch, auto);
      const y = rest + touch * 0.07;
      const show = on * f.on(0.15 + i * 0.12, 0.3);
      if (show <= 0.003) return;
      const sheet: V3[] = [at(-1, -1, y), at(1, -1, y), at(1, 1, y), at(-1, 1, y)];
      f.fill(sheet, pal.bg, 0.6 * show);
      f.fill(sheet, colour, (0.1 + 0.14 * lit) * show);
      f.path(sheet, colour, (0.5 + 0.4 * lit) * show, 1, true);
      f.line(sheet[0], sheet[1], colour, (0.75 + 0.25 * lit) * show, 1.75);
      const ink = (0.6 + 0.4 * lit) * show;

      if (i === 0) {
        // margin: the small part set aside, inside the outline of the whole position
        f.path([at(-0.8, -0.62, y), at(0.8, -0.62, y), at(0.8, 0.62, y), at(-0.8, 0.62, y)], pal.ink, 0.3 * ink, 1, true);
        const part: V3[] = [at(-0.8, -0.62, y), at(-0.3, -0.62, y), at(-0.3, 0.62, y), at(-0.8, 0.62, y)];
        f.fill(part, colour, 0.5 * ink);
        f.path(part, colour, 0.95 * ink, 1.25, true);
      } else if (i === 1) {
        // spread: two lines that are never one, and the measure across the gap
        const half = 0.2 + (f.still ? 0.05 : 0.07 * Math.sin(t * 0.5));
        f.line(at(-0.8, -half, y), at(0.8, -half, y), colour, 0.95 * ink, 1.5);
        f.line(at(-0.8, half, y), at(0.8, half, y), colour, 0.95 * ink, 1.5);
        f.fill([at(-0.8, -half, y), at(0.8, -half, y), at(0.8, half, y), at(-0.8, half, y)], colour, 0.16 * ink);
        f.line(at(0.3, -half, y), at(0.3, half, y), pal.ink, 0.8 * ink, 1);
        f.line(at(0.24, -half, y), at(0.36, -half, y), pal.ink, 0.8 * ink, 1);
        f.line(at(0.24, half, y), at(0.36, half, y), pal.ink, 0.8 * ink, 1);
      } else if (i === 2) {
        // size: a row of equal lots, some of them taken
        for (let k = 0; k < 5; k++) {
          const a = -0.72 + k * 0.36;
          const lot: V3[] = [at(a - 0.13, -0.34, y), at(a + 0.13, -0.34, y), at(a + 0.13, 0.34, y), at(a - 0.13, 0.34, y)];
          if (k < 3) f.fill(lot, colour, 0.5 * ink);
          f.path(lot, colour, (k < 3 ? 0.95 : 0.45) * ink, 1, true);
        }
      } else {
        // result: a marker that can come to rest on either side of the entry
        const sway = f.still ? 0.5 : Math.sin(t * 0.37 + 0.6) * 0.62;
        const side = sway >= 0 ? pal.emerald : pal.crimson;
        f.line(at(-0.8, 0, y), at(0.8, 0, y), pal.ink, 0.45 * ink, 1);
        f.line(at(0, -0.4, y), at(0, 0.4, y), pal.ink, 0.8 * ink, 1.25);
        f.line(at(0, 0, y), at(sway, 0, y), side, 0.95 * ink, 2.5);
        lamp(f, at(sway, 0, y), side, ink, 0.02);
        for (const a of [-0.6, -0.3, 0.3, 0.6]) f.line(at(a, -0.14, y), at(a, 0.14, y), pal.ink, 0.35 * ink, 1);
      }
      name(text, y, lit > 0.3 ? pal.gold : colour, lerp(0.2, 1, lit));
    });
    ctx.restore();
  },
};

export default scene;
