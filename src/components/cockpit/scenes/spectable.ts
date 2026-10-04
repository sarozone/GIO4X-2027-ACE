/**
 * SPECTABLE — the contract specifications, as a sheet being measured.
 *
 * A pane of glass stands on two feet and carries a ruled table: a header, a
 * column for each term of a contract and a row for each instrument. The cells
 * hold short engraved strokes, never a figure. The columns light one after
 * another, as a reader's eye crosses the sheet, and a champagne caliper is
 * closed on a single row: its two jaws rest on the rules above and below it,
 * and every so often it slides to another row and measures that one instead.
 * The row is the page's subject, so the row is what the champagne marks.
 *
 * The pointer: the row under it lifts off the glass towards the reader and
 * lights, as a line of a table does when a finger is put on it.
 *
 * The column names are the names of the terms. Nothing here states a spread,
 * a leverage, a lot or an hour.
 */
import { clamp, easeInOut, lerp, type Scene, type V3 } from "../engine";
import { deck, lamp, panel, pool } from "../kit";

const FLOOR = -1.12;
/** the pane: its centre, width and height */
const C: V3 = [-0.1, 0.03, 0];
const [PW, PH] = [2.9, 1.86];
/** the column rules, across the pane (0 to 1) */
const COLS = [0.05, 0.27, 0.43, 0.6, 0.78, 0.95];
const HEADS = ["SYMBOL", "LOT", "SPREAD", "LEVERAGE", "HOURS"];
/** the body of the table, from its top rule to its foot */
const [TOP, FOOT] = [0.8, 0.07];
/** the rows the caliper measures, in turn, and how long it rests on each */
const TOUR = [2, 4, 1, 5, 3, 0];
const HOLD = 9;
/** seconds a column stays lit */
const COLT = 3.4;

const scene: Scene = {
  pose: 13,
  draw(f) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(-0.2 + (f.still ? 0 : Math.sin(t * 0.07) * 0.04), -0.07, 6.3, m ? 0.92 : 1.02);

    deck(f, { y: FLOOR, alpha: 0.09 });
    pool(f, [C[0], FLOOR, 0], 2.2, pal.key, 0.2 * f.boot);

    const on = f.on(0, 0.4);
    const g = panel(f, C, PW, PH, { tilt: 0.1, colour: pal.key, alpha: 0.55, on });
    // the two feet it stands on
    for (const u of [0.14, 0.86]) {
      const foot = g.at(u, 0);
      f.line(foot, [foot[0], FLOOR, foot[2]], pal.ink, 0.3 * on, 1.5);
      f.dot([foot[0], FLOOR, foot[2]], 0.016, pal.ink, 0.5 * on);
    }

    const rows = m ? 5 : 7;
    const rh = (TOP - FOOT) / rows;

    // ── which row is being measured: the caliper rests, then slides to the next
    const step = Math.floor(t / HOLD);
    const cur = TOUR[step % TOUR.length] % rows;
    const prev = TOUR[(step + TOUR.length - 1) % TOUR.length] % rows;
    const pos = lerp(prev, cur, f.still ? 1 : easeInOut(clamp((t - step * HOLD) / 1.6)));

    // ── which column is lit: each in turn, rising and falling
    const cstep = Math.floor(t / COLT);
    const col = cstep % (COLS.length - 1);
    const lit = f.still ? 1 : Math.sqrt(Math.max(0, Math.sin(Math.PI * (t / COLT - cstep))));

    // ── which row is under the pointer, as a position down the table (0 at its top)
    let over = -1;
    if (f.hover > 0.01) {
      const a = f.P(...g.at(0.5, TOP));
      const b = f.P(...g.at(0.5, FOOT));
      const l = f.P(...g.at(0, 0.5));
      const r = f.P(...g.at(1, 0.5));
      if (a && b && l && r && Math.abs(b.y - a.y) > 1 && f.mx > l.x - 14 && f.mx < r.x + 14) over = ((f.my - a.y) / (b.y - a.y)) * rows;
    }

    // ── the lit column, and the rules
    f.fill([g.at(COLS[col], FOOT), g.at(COLS[col + 1], FOOT), g.at(COLS[col + 1], 0.94), g.at(COLS[col], 0.94)], pal.key, 0.075 * lit * on);
    for (let c = 1; c < COLS.length - 1; c++) f.line(g.at(COLS[c], FOOT), g.at(COLS[c], 0.94), pal.ink, 0.1 * on, 1);
    f.line(g.at(0.03, TOP), g.at(0.97, TOP), pal.ink, 0.36 * on, 1.25);

    // ── the header: the names of the terms (short strokes on a phone, where lettering would not be read)
    const named = f.on(0.75, 0.25);
    ctx.save();
    ctx.letterSpacing = "1px";
    for (let c = 0; c < HEADS.length; c++) {
      const here = c === col ? lit : 0;
      if (m) f.line(g.at(COLS[c] + 0.014, 0.87), g.at(COLS[c] + 0.014 + (COLS[c + 1] - COLS[c]) * 0.5, 0.87), c === col ? pal.key : pal.ink, (0.4 + 0.5 * here) * named, 2);
      else f.label(HEADS[c], g.at(COLS[c] + 0.014, 0.87), { size: 9, colour: c === col ? pal.key : pal.ink2, alpha: (0.62 + 0.36 * here) * named });
    }
    ctx.restore();

    // ── the rows: a rule beneath each, a stroke in each cell
    for (let i = 0; i < rows; i++) {
      const v1 = TOP - i * rh;
      const v0 = v1 - rh;
      const vm = (v0 + v1) / 2;
      const hv = over < 0 ? 0 : f.hover * clamp(1 - Math.abs(over - (i + 0.5)) / 0.9);
      const gold = clamp(1 - Math.abs(pos - i));
      const rowOn = f.on(0.2 + (0.5 * i) / rows, 0.3);
      const lift = 0.12 * hv;
      const A = (u: number, v: number): V3 => g.at(u, v, lift);
      const quad: V3[] = [A(0.03, v0), A(0.97, v0), A(0.97, v1), A(0.03, v1)];
      if (hv > 0.02) {
        // the lifted row is a strip of glass of its own
        f.fill(quad, pal.bg, 0.72 * hv);
        f.fill(quad, pal.key, 0.12 * hv);
        f.path(quad, pal.key, 0.7 * hv, 1, true);
      }
      if (gold > 0.02) f.fill(quad, pal.gold, 0.13 * gold * rowOn);
      f.line(A(0.03, v0), A(0.97, v0), pal.ink, 0.15 * rowOn, 1);
      for (let c = 0; c < COLS.length - 1; c++) {
        const u0 = COLS[c] + 0.014;
        const len = (COLS[c + 1] - COLS[c] - 0.034) * (0.38 + 0.6 * f.rnd(i * 7 + c));
        const here = c === col ? lit : 0;
        const colour = gold > 0.5 ? pal.gold : here > 0.3 ? pal.key : pal.ink;
        f.line(A(u0, vm), A(u0 + len, vm), colour, clamp(0.3 + 0.42 * here + 0.4 * gold + 0.3 * hv) * rowOn, c === 0 ? 2.25 : 1.5);
      }
    }

    // ── the caliper: a beam down the pane's right edge, a jaw on the rule above the row and one on the rule below
    const cal = f.on(0.6, 0.3);
    const B = (u: number, v: number): V3 => g.at(u, v, 0.04);
    const j1 = TOP - pos * rh;
    const j0 = j1 - rh;
    const [b0, b1] = [j0 - 0.07, j1 + 0.11];
    const [e0, e1] = [1.035, 1.062];
    f.fill([B(e0, b0), B(e1, b0), B(e1, b1), B(e0, b1)], pal.gold, 0.16 * cal);
    f.path([B(e0, b0), B(e1, b0), B(e1, b1), B(e0, b1)], pal.gold, 0.85 * cal, 1.25, true);
    // its graduations: marks, never numbers
    const marks = Math.round((m ? 10 : 18) * f.q);
    for (let k = 1; k < marks; k++) {
      const v = lerp(b0, b1, k / marks);
      f.line(B(e0, v), B(e0 + (k % 3 ? 0.009 : 0.016), v), pal.gold, 0.6 * cal, 1);
    }
    for (const v of [j0, j1]) {
      // the dimension line across the row, and the jaw that rests on it
      f.line(B(0.03, v), B(0.955, v), pal.gold, 0.4 * cal, 1);
      f.line(B(0.955, v), B(e1, v), pal.gold, 0.95 * cal, 2.25);
      lamp(f, B(0.955, v), pal.gold, cal, 0.011);
    }
    // the slide on the lower jaw
    f.fill([B(e0 - 0.008, j0 - 0.022), B(e1 + 0.008, j0 - 0.022), B(e1 + 0.008, j0 + 0.022), B(e0 - 0.008, j0 + 0.022)], pal.gold, 0.5 * cal);

    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("ONE ROW", B((e0 + e1) / 2, b1), { align: "center", size: m ? 9 : 10, colour: pal.gold, alpha: 0.95 * named, dy: -11 });
    ctx.restore();
  },
};

export default scene;
