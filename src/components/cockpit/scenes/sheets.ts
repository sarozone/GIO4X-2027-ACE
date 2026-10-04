/**
 * SHEETS — the downloads, as they come out of the tray.
 *
 * A paper tray stands on the deck with a download mark cut in its front. Three
 * printable sheets slide up out of its slot one after another and open into a
 * fan: the plan, the checklist, the review page. Each is a real form in
 * outline, a title, a rule, and rows of a tick box beside a ruled line. On one
 * of them a pen works down the boxes and ticks them; when it has finished the
 * three are taken away and the tray feeds the next set, with the pen on the
 * next sheet.
 *
 * The pointer picks a sheet up: the one under it comes forward out of the fan,
 * rises a little and its rulings brighten.
 *
 * The sheets carry rulings, never figures.
 */
import { clamp, type Scene, type V3 } from "../engine";
import { deck, pool, slab } from "../kit";
import { smooth } from "./_stage";

/** seconds for one set of sheets: fed, ticked, taken away */
const LOOP = 14;
/** one sheet, portrait */
const [W, H] = [0.95, 1.3];
/** the fan: the point the sheets turn about, how far from it they stand, the angle between two */
const [PIVOT, REACH, FAN] = [-2.8, 2.6, 0.3];
/** the tray: its foot, its top, half its depth, half its length */
const [FLOOR, TRAY, TD, TX] = [-1.2, -0.9, 0.3, 1.3];
const NAMES = ["PLAN", "CHECK", "REVIEW"];
const ROWS = [4, 5, 4];
/** the middle sheet lies on top of the other two */
const ORDER = [0, 2, 1];

const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const scene: Scene = {
  pose: 9,
  draw(f) {
    const { pal } = f;
    const m = f.mobile;
    const turn = f.t / LOOP;
    const loop = Math.floor(turn);
    const u = turn - loop;
    /** the sheet the pen is on */
    const active = (loop + 1) % 3;
    const leave = smooth((u - 0.92) / 0.08);
    f.aim(0.1 + (f.still ? 0 : Math.sin(f.t * 0.07) * 0.03), -0.14, 6.3, m ? 1.08 : 1.2);

    deck(f, { y: FLOOR, alpha: 0.09 });
    pool(f, [0, FLOOR, 0], 2.3, pal.key, 0.2 * f.boot);

    let pen: V3 | null = null;
    for (const i of ORDER) {
      // fed one after another, and again at power-on
      const k = smooth((u - 0.02 - i * 0.07) / 0.12) * f.on(0.15 + i * 0.2, 0.4);
      const alpha = smooth(k * 1.6) * (1 - leave);
      if (alpha <= 0.003) continue;
      const a = (i - 1) * FAN;
      const [ca, sa] = [Math.cos(a), Math.sin(a)];
      const n = f.near([sa * REACH, PIVOT + ca * REACH, 0], 120);
      const reach = REACH - (1 - k) * 0.55 + n * 0.07 + leave * 0.5;
      const [cx, cy] = [sa * reach, PIVOT + ca * reach];
      const z = (i === 1 ? -0.02 : 0.02) - n * 0.12;
      /** sheet-local to world: p across, q up, both 0..1 from the bottom-left corner */
      const at = (p: number, q: number): V3 => {
        const lx = (p - 0.5) * W;
        const ly = (q - 0.5) * H;
        return [cx + lx * ca + ly * sa, cy - lx * sa + ly * ca, z];
      };
      const isOn = i === active;
      const edge = isOn ? pal.gold : pal.ink;
      const quad = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
      f.fill(quad, pal.bg, 0.94 * alpha);
      f.fill(quad, pal.ink, (0.05 + 0.05 * n) * alpha);
      f.path(quad, edge, (isOn ? 0.8 : 0.4 + 0.4 * n) * alpha, 1, true);

      // the title and the rule under it
      f.label(NAMES[i], at(0.1, 0.9), { size: m ? 8 : 9, colour: isOn ? pal.gold : pal.ink2, alpha: 0.9 * alpha });
      f.line(at(0.1, 0.83), at(0.9, 0.83), edge, 0.5 * alpha, 1);

      // the rows: a tick box, a ruled line, a finer line under it
      const rows = ROWS[i];
      const done = isOn ? clamp((u - 0.3) / 0.5) * rows : 0;
      const [bu, bs] = [0.1, 0.1];
      const bh = (bs * W) / H / 2;
      for (let r = 0; r < rows; r++) {
        const v = 0.72 - (r * 0.44) / (rows - 1);
        const q = clamp(done - r);
        const len = 0.34 + 0.26 * f.rnd(i * 7 + r);
        f.path([at(bu, v - bh), at(bu + bs, v - bh), at(bu + bs, v + bh), at(bu, v + bh)], edge, (0.55 + 0.3 * n) * alpha, 1, true);
        f.line(at(0.28, v), at(0.28 + len, v), pal.ink, (0.34 + 0.3 * q + 0.25 * n) * alpha, 1.25);
        if (!m) f.line(at(0.28, v - 0.04), at(0.28 + len * 0.6, v - 0.04), pal.ink, (0.16 + 0.15 * n) * alpha, 1);
        if (q <= 0) continue;
        // the tick, as a hand makes it: a short stroke down, a long one up and out of the box
        const t0 = at(bu + 0.02, v);
        const t1 = at(bu + 0.045, v - bh * 0.7);
        const t2 = at(bu + 0.115, v + bh * 1.4);
        const e1 = mix(t0, t1, clamp(q / 0.4));
        f.line(t0, e1, pal.gold, 0.95 * alpha, 2);
        let end = e1;
        if (q > 0.4) {
          end = mix(t1, t2, clamp((q - 0.4) / 0.6));
          f.line(t1, end, pal.gold, 0.95 * alpha, 2);
        }
        if (q < 1) pen = end;
      }
      // where it is signed
      f.line(at(0.5, 0.1), at(0.9, 0.1), pal.ink, 0.3 * alpha, 1);
    }

    // the pen: a point of light where the tick is being made
    if (pen && !f.still) {
      f.glow(pen, 0.13, pal.gold, 0.7 * (1 - leave));
      f.dot(pen, 0.012, pal.ink, 0.95 * (1 - leave));
    }

    // the tray, in front of the feet of the sheets, and the light of its slot
    const trayOn = f.on(0, 0.4);
    slab(f, [-TX, FLOOR, -TD], [TX, TRAY, TD], pal.ink, 0.08, trayOn);
    f.line([-TX + 0.12, TRAY, 0], [TX - 0.12, TRAY, 0], pal.key, 0.55 * trayOn, 1.5);
    // the download mark on its front: an arrow coming down onto a line
    const zf = -TD;
    f.line([0, -0.97, zf], [0, -1.09, zf], pal.gold, 0.85 * trayOn, 1.5);
    f.path([[-0.05, -1.04, zf], [0, -1.09, zf], [0.05, -1.04, zf]], pal.gold, 0.85 * trayOn, 1.5);
    f.line([-0.09, -1.135, zf], [0.09, -1.135, zf], pal.gold, 0.85 * trayOn, 1.5);
  },
};

export default scene;
