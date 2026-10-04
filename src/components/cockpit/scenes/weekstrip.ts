/**
 * WEEKSTRIP — the trading week, laid out end to end.
 *
 * Seven blocks stand in a row on the deck. Five are the trading days, Monday
 * to Friday: tall blocks of lit glass, each cut through near its end by a
 * narrow notch, the day's break. The last two are the weekend, one low dark
 * slab where nothing stands. A rail runs above the whole week with a mark at
 * each day's edge, and a champagne marker travels along it from Monday to
 * Sunday, dropping a line to the block beneath, which brightens as it passes
 * and dims over the weekend. An arc spans the five days that trade.
 *
 * The pointer: the block under it lights and rises a little from the deck.
 *
 * The marker is a traveller, not a clock: it does not show the present time,
 * and no block carries an hour.
 */
import { clamp, easeInOut, lerp, type Scene, type V3 } from "../engine";
import { arc, deck, eyeX, lamp, pool, slab, trace } from "../kit";

const FLOOR = -0.62;
/** the row: where it starts, the pitch from one day to the next, a block's width */
const [X0, PITCH, BW] = [-1.72, 0.5, 0.44];
/** a day block: its height and half its depth; the weekend's height */
const [DH, D, WH] = [0.42, 0.26, 0.09];
/** the notch: where in the block it is cut, and how wide the cut is */
const [CUT, GAP] = [0.33, 0.035];
/** the rail the marker rides on */
const RAIL = FLOOR + DH + 0.5;
const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
/** seconds for the marker to cross the week */
const LOOP = 42;

const left = (i: number) => X0 + i * PITCH;
const END = left(6) + BW;

type Piece = { x0: number; x1: number; y0: number; y1: number; colour: string; tint: number; on: number };

const scene: Scene = {
  // the marker stands over Wednesday
  pose: LOOP * 0.36,
  draw(f) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.16 + (f.still ? 0 : Math.sin(t * 0.08) * 0.035), -0.2, 6.3, m ? 0.94 : 1.05);

    deck(f, { y: FLOOR, alpha: 0.1 });
    pool(f, [0, FLOOR, 0], 2.4, pal.key, 0.2 * f.boot);

    // ── the marker: across the week, then it fades and begins again
    const u = (t / LOOP) % 1;
    const mx = lerp(X0, END, u);
    const fade = easeInOut(clamp(u / 0.05)) * easeInOut(clamp((1 - u) / 0.05));
    const under = clamp(Math.floor((mx - X0) / PITCH), 0, 6);
    const weekend = under >= 5;

    // ── the blocks, each day in two parts with the notch between them
    const pieces: Piece[] = [];
    const tops: number[] = [];
    for (let i = 0; i < 5; i++) {
      const x0 = left(i);
      const xc = x0 + BW / 2;
      const near = f.near([xc, FLOOR + DH, 0], 85);
      const pass = fade * clamp(1 - Math.abs(mx - xc) / 0.3);
      const rise = 0.05 * near;
      const on = f.on(0.08 + i * 0.1, 0.3);
      const tint = 0.13 + 0.24 * near + 0.16 * pass;
      const colour = near > 0.5 ? pal.ink : pal.key;
      tops.push(FLOOR + DH + rise);
      pieces.push({ x0, x1: x0 + CUT, y0: FLOOR + rise, y1: FLOOR + DH + rise, colour, tint, on });
      pieces.push({ x0: x0 + CUT + GAP, x1: x0 + BW, y0: FLOOR + rise, y1: FLOOR + DH + rise, colour, tint, on });
    }
    // ── the weekend: one low slab across both days
    const wkNear = Math.max(f.near([left(5) + BW / 2, FLOOR + WH, 0], 85), f.near([left(6) + BW / 2, FLOOR + WH, 0], 85));
    pieces.push({ x0: left(5), x1: END, y0: FLOOR, y1: FLOOR + WH, colour: pal.ink3, tint: 0.05 + 0.12 * wkNear, on: f.on(0.6, 0.3) });
    tops.push(FLOOR + WH, FLOOR + WH);

    // from the farthest from the camera to the nearest, so each hides what is behind it
    const eye = eyeX(f);
    pieces.sort((a, b) => Math.abs((b.x0 + b.x1) / 2 - eye) - Math.abs((a.x0 + a.x1) / 2 - eye));
    for (const p of pieces) slab(f, [p.x0, p.y0, -D], [p.x1, p.y1, D], p.colour, p.tint, p.on);

    // ── the rail above the week: brighter over the days that trade, a mark at each day's edge
    const railOn = f.on(0.5, 0.3);
    const friday = left(4) + BW;
    f.line([X0, RAIL, 0], [friday, RAIL, 0], pal.ink, 0.42 * railOn, 1.25);
    f.line([friday, RAIL, 0], [END, RAIL, 0], pal.ink, 0.16 * railOn, 1);
    for (let i = 0; i <= 7; i++) {
      const x = i === 7 ? END : left(i);
      f.line([x, RAIL, 0], [x, RAIL - 0.055, 0], pal.ink, (i <= 5 ? 0.5 : 0.22) * railOn, 1);
    }
    // a small mark on the rail above each notch
    for (let i = 0; i < 5; i++) {
      const nx = left(i) + CUT + GAP / 2;
      f.line([nx, RAIL, 0], [nx, RAIL - 0.028, 0], pal.ink, 0.34 * railOn, 1);
    }

    // ── the span of the five days
    const spanOn = f.on(0.7, 0.3);
    trace(f, arc([X0, RAIL, 0], [friday, RAIL, 0], 0.5, Math.round((m ? 16 : 28) * f.q)), pal.key, 0.5 * spanOn, 1.2, f.still ? -1 : t / 16);

    // ── the marker itself
    const level = fade * (weekend ? 0.45 : 1) * railOn;
    if (level > 0.01) {
      const foot: V3 = [mx, tops[under], 0];
      f.line([mx, RAIL, 0], foot, pal.gold, 0.8 * level, 1.5);
      f.glow(foot, 0.2, pal.gold, 0.3 * level);
      f.dot(foot, 0.014, pal.gold, 0.9 * level);
      lamp(f, [mx, RAIL, 0], pal.gold, level, 0.02);
    }

    // ── the names
    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    for (let i = 0; i < 5; i++) {
      const xc = left(i) + BW / 2;
      const lit = !weekend && under === i ? fade : 0;
      f.label(DAYS[i], [xc, FLOOR, -D], { align: "center", size, colour: lit > 0.5 ? pal.gold : pal.ink2, alpha: (0.7 + 0.25 * lit) * named, dy: 14 });
    }
    f.label("WEEKEND", [(left(5) + END) / 2, FLOOR, -D], { align: "center", size, colour: pal.ink3, alpha: 0.9 * named, dy: 14 });
    if (!m) {
      f.label("BREAK", [left(3) + CUT + GAP / 2, FLOOR + DH, -D], { align: "center", size: 9, colour: pal.ink2, alpha: 0.8 * named, dy: -11 });
      f.label("THE TRADING WEEK", [(X0 + friday) / 2, RAIL + 0.5, 0], { align: "center", size, colour: pal.key, alpha: 0.9 * named, dy: -12 });
    }
    ctx.restore();
  },
};

export default scene;
