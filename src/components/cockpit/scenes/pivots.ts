/**
 * PIVOTS — seven lines from one finished bar.
 *
 * A single bar stands at the left: its height is the range between a high and
 * a low, and a tick on its side is the close. From it seven level lines fan
 * out and run across the frame. The central one, in champagne, is the pivot:
 * the average of the bar's three marks. Three lie above it and three below,
 * and each stands exactly where the classic pivot formulas put it for the bar
 * that is drawn, so when the close drifts a little on the bar, all seven
 * lines move with it. A point of light travels along the pivot.
 *
 * The lines carry their names only (R for the levels above, S for those
 * below, P for the pivot) and the bar its three letters. There is no price
 * and no scale: the page below does the arithmetic with the visitor's own bar.
 *
 * The pointer: the line nearest to it lights, its sheet of glass brightens
 * and its name rises.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, pool, slab, trace } from "../kit";

const FLOOR = -1.2;
/** the bar: where it stands, its high and low, and the middle of its close's slow drift */
const [BAR_X, HIGH, LOW, CLOSE] = [-1.5, 0.3, -0.3, 0.12];
/** half the bar's width */
const BW = 0.05;
/** the lines: where the fan leaves the bar, where it has opened out, where the lines end */
const [FAN, OPEN, END] = [-1.26, -0.56, 1.42];
/** how far each level's sheet of glass reaches in front of and behind its line */
const DEPTH = 0.2;
/** the names, from the highest line to the lowest */
const NAMES = ["R3", "R2", "R1", "P", "S1", "S2", "S3"] as const;
/** scratch, reused every frame: the seven levels and where each falls on the screen */
const level = new Float32Array(7);
const screen = new Float32Array(7);

type State = { phase: number };

const scene: Scene<State> = {
  pose: 9,
  setup(f) {
    return { phase: f.rnd(3) * 6 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.16 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.1, 6.3, 1);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.6, pal.key, 0.2 * f.boot);

    // ── the bar's close drifts a little; the high and the low are fixed
    const c = CLOSE + (f.still ? 0 : Math.sin(t * 0.21 + s.phase) * 0.06);
    // ── the classic levels of this very bar: the lines stand where the formulas put them
    const p = (HIGH + LOW + c) / 3;
    level[0] = HIGH + 2 * (p - LOW);
    level[1] = p + (HIGH - LOW);
    level[2] = 2 * p - LOW;
    level[3] = p;
    level[4] = 2 * p - HIGH;
    level[5] = p - (HIGH - LOW);
    level[6] = LOW - 2 * (HIGH - p);

    // ── which line the pointer is nearest, measured on the screen
    let best = Infinity;
    for (let i = 0; i < 7; i++) {
      const at = f.P(0.4, level[i], 0);
      screen[i] = at ? Math.abs(at.y - f.my) : Infinity;
      if (screen[i] < best) best = screen[i];
    }
    // the gap between two neighbouring lines, in pixels: a line a whole gap further off than the nearest is dark
    const gap = Math.max(8, 0.3 * f.u);

    // ── the bar: a block as tall as its range, with a tick at the close
    const barOn = f.on(0, 0.3);
    slab(f, [BAR_X - BW, LOW, -BW], [BAR_X + BW, HIGH, BW], pal.ink, 0.12, barOn);
    f.line([BAR_X + BW, c, 0], [FAN, c, 0], pal.ink, 0.85 * barOn, 1.5);
    lamp(f, [FAN, c, 0], pal.gold, barOn, 0.013);
    // the spine the fan opens from
    f.line([FAN, lerp(p, level[6], 0.28), 0], [FAN, lerp(p, level[0], 0.28), 0], pal.ink, 0.45 * f.on(0.2, 0.3), 1);

    // ── the seven lines, the lower ones first so that the upper sheets lie over them
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    for (let i = 6; i >= 0; i--) {
      const rank = Math.abs(i - 3);
      const on = f.on(0.25 + rank * 0.14, 0.3);
      if (on <= 0.003) continue;
      const pivot = i === 3;
      const lit = best === Infinity ? 0 : clamp(1 - (screen[i] - best) / gap) * f.hover;
      const y = level[i];
      const colour = pivot ? pal.gold : i < 3 ? pal.key : pal.teal;
      const end = lerp(OPEN, END, on);

      // a shallow sheet of glass at the level, so the lines have depth
      if (!m || pivot) {
        const sheet: V3[] = [[OPEN, y, -DEPTH], [end, y, -DEPTH], [end, y, DEPTH], [OPEN, y, DEPTH]];
        f.fill(sheet, colour, (pivot ? 0.07 : 0.035) * on + 0.09 * lit);
        f.line([OPEN, y, DEPTH], [end, y, DEPTH], colour, (0.16 + 0.2 * lit) * on, 1);
      }
      // the fan: from close to the bar, opening out to the level
      const from: V3 = [FAN, lerp(p, y, 0.28), 0];
      f.line(from, [OPEN, y, 0], colour, (pivot ? 0.8 : 0.4 + 0.3 * lit) * on, 1);
      // the line itself
      if (pivot) trace(f, [[OPEN, y, 0], [end, y, 0]], pal.gold, (0.9 + 0.1 * lit) * on, 1.6 + 0.6 * lit, f.still ? -1 : t / 7);
      else trace(f, [[OPEN, y, 0], [end, y, 0]], colour, (0.5 + 0.45 * lit) * on, 1.1 + 0.7 * lit);
      if (lit > 0.02) f.glow([end, y, 0], 0.16, colour, 0.5 * lit * on);

      // its name, at the end of the line: it rises when the line is lit
      const named = f.on(0.6 + rank * 0.1, 0.25);
      f.label(NAMES[i], [END, y, 0], { size, colour: pivot ? pal.gold : lit > 0.3 ? pal.ink : pal.ink2, alpha: (pivot ? 0.95 : 0.7 + 0.3 * lit) * named, dx: 9, dy: -7 * lit });
    }

    // ── the bar's three marks
    const named = f.on(0.8, 0.2);
    f.label("H", [BAR_X, HIGH, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: -12 });
    f.label("L", [BAR_X, LOW, 0], { align: "center", size, colour: pal.ink2, alpha: 0.85 * named, dy: 13 });
    f.label("C", [BAR_X - BW, c, 0], { align: "right", size, colour: pal.gold, alpha: 0.95 * named, dx: -7 });
    ctx.restore();
  },
};

export default scene;
