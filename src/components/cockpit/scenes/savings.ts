/**
 * SAVINGS — the same amount put by, period after period, and what time adds.
 *
 * Coins are stacked on a shelf in a row of columns, one column for each period
 * that has gone by. The lower coins of a column are what was put in, and they
 * rise by the same step every time. The champagne coins on top of them are
 * what the money earned on the way, and those rise faster the longer it runs:
 * the line drawn over the tops bends upward. Above the short columns hangs the
 * calendar ring, twelve marks to its round, with a hand that moves on one mark
 * as each column is finished.
 *
 * The pointer: moving it across the frame moves time. The columns are built as
 * far as the pointer and no further, the ring's hand goes with it, and the
 * column under the pointer is lit.
 *
 * The coins are counters, not money: no amount, no rate and no date is shown.
 */
import { TAU, clamp, lerp, rgba, type Frame, type Scene, type V3 } from "../engine";
import { lamp, pool, ring, ringPoint, slab, trace } from "../kit";
import { smooth } from "./_stage";

/** columns, and where the first stands and how far apart they are */
const COLS = 9;
const [X0, DX] = [-1.36, 0.34];
/** the shelf's top, a coin's radius and its thickness */
const [SHELF, CR, TH] = [-0.95, 0.125, 0.08];
/** what is put in, and what it has earned, by column i (in coins, before rounding) */
const paid = (i: number) => 0.68 * (i + 1);
const earned = (i: number) => 0.125 * i * i;
/** the calendar ring */
const RC: V3 = [-0.92, 0.5, 0.12];
const RR = 0.4;
/** seconds for one telling, and the share of it spent building */
const [LOOP, BUILD] = [30, 0.7];

type State = { mo: number; phase: number };

/** one coin: a short drum seen from a little above. `k` is how flat its round face looks from here. */
function coin(f: Frame, x: number, y: number, r: number, k: number, colour: string, tint: number, alpha: number): void {
  const a = f.P(x, y, 0);
  const b = f.P(x, y + TH, 0);
  if (!a || !b || alpha <= 0.003) return;
  const { ctx, pal } = f;
  const rx = Math.max(1, r * b.s * f.u);
  const ry = rx * k;
  // the edge of the coin
  ctx.beginPath();
  ctx.moveTo(b.x - rx, b.y);
  ctx.lineTo(a.x - rx, a.y);
  ctx.ellipse(a.x, a.y, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(b.x + rx, b.y);
  ctx.closePath();
  ctx.fillStyle = rgba(pal.bg, 0.95 * alpha);
  ctx.fill();
  ctx.fillStyle = rgba(colour, tint * alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(colour, 0.5 * alpha);
  ctx.lineWidth = 1;
  ctx.stroke();
  // its face
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = rgba(pal.bg, 0.95 * alpha);
  ctx.fill();
  ctx.fillStyle = rgba(colour, tint * 1.7 * alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(colour, 0.72 * alpha);
  ctx.stroke();
}

const scene: Scene<State> = {
  pose: 25,
  setup(f) {
    return { mo: 0, phase: f.rnd(3) * 6.28 };
  },
  draw(f, s) {
    const { pal, ctx } = f;
    const m = f.mobile;
    const t = f.t;
    f.aim(0.16 + (f.still ? 0 : Math.sin(t * 0.07 + s.phase) * 0.035), -0.22, 6.4, 1);
    // how flat a level circle looks from the camera's height
    const flat = Math.max(0.08, Math.abs(Math.sin(f.cam.pitch)));

    // ── time: it runs by itself, column after column, holds, and begins again; under the pointer it is set by hand
    const ph = f.still ? 0.85 : (t % LOOP) / LOOP;
    const ink = f.still ? 1 : 1 - smooth((ph - 0.94) / 0.06);
    const auto = clamp(ph / BUILD) * COLS;
    const held = clamp(((f.mx - f.box.x) / Math.max(1, f.box.w) - 0.1) / 0.8) * COLS;
    const want = lerp(auto, held, f.hover);
    // (a frame that is only measured, with no time passing, must not leave its mark on the running one)
    if (!f.still && f.dt > 0) s.mo += (want - s.mo) * (1 - Math.exp(-f.dt * 5));
    const mo = f.still || f.dt === 0 ? want : s.mo;

    // ── the shelf, with a seat marked for every column to come
    const shelf = f.on(0, 0.35);
    pool(f, [0, SHELF - 0.07, 0], 1.9, pal.key, 0.2 * f.boot);
    slab(f, [-1.6, SHELF - 0.07, -0.24], [1.6, SHELF, 0.24], pal.ink, 0.07, shelf);
    for (let i = 0; i < COLS; i++) {
      const p = f.P(X0 + i * DX, SHELF, 0);
      if (!p) continue;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, CR * p.s * f.u, CR * p.s * f.u * flat, 0, 0, TAU);
      ctx.strokeStyle = rgba(pal.ink, 0.22 * shelf);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── the calendar ring: twelve marks, the part of the round gone by, and the hand
    const cal = f.on(0.2, 0.4);
    const frac = clamp(mo / 12);
    ring(f, RC, RR, { axis: "z", colour: pal.ink, alpha: 0.34 * cal, ticks: 12, tickLen: 0.07, major: 3, rot: Math.PI / 2, seg: 64 });
    ring(f, RC, RR * 0.62, { axis: "z", colour: pal.ink, alpha: 0.12 * cal, seg: 40 });
    if (frac > 0.002) {
      ring(f, RC, RR, { axis: "z", colour: pal.gold, alpha: 0.18 * cal * ink, width: 6, from: 0.25 - frac, to: 0.25, seg: 64 });
      ring(f, RC, RR, { axis: "z", colour: pal.gold, alpha: 0.95 * cal * ink, width: 1.75, from: 0.25 - frac, to: 0.25, seg: 64 });
    }
    for (let i = 0; i < 12; i++) {
      const gone = clamp(mo - i);
      f.dot(ringPoint(RC, RR * 0.8, 0.25 - (i + 0.5) / 12, "z"), 0.016, gone > 0.5 ? pal.gold : pal.ink, (0.3 + 0.6 * gone * ink) * cal);
    }
    const hand = ringPoint(RC, RR * 0.94, 0.25 - frac, "z");
    f.line(RC, hand, pal.gold, 0.85 * cal, 1.5);
    lamp(f, hand, pal.gold, 0.9 * cal, 0.014);
    f.dot(RC, 0.028, pal.ink, 0.7 * cal);

    // ── the columns: what was put in, and on top of it what that earned
    const stacks = f.on(0.4, 0.4) * ink;
    for (let i = 0; i < COLS; i++) {
      const grown = clamp(mo - i);
      if (grown <= 0.003) continue;
      const x = X0 + i * DX;
      const base = Math.round(paid(i));
      const total = base + Math.round(earned(i));
      const near = f.near([x, SHELF + total * TH * 0.5, 0], m ? 40 : 70);
      for (let c = 0; c < total; c++) {
        // a column is built from the bottom: each coin comes down onto the one before
        const a = clamp(grown * total - c);
        if (a <= 0.003) break;
        const extra = c >= base;
        coin(f, x, SHELF + c * TH + (1 - a) * 0.14, CR, flat, extra ? pal.gold : pal.key, (extra ? 0.3 : 0.17) + 0.14 * near, a * stacks);
      }
      if (near > 0.01) f.glow([x, SHELF + total * TH, 0], 0.3, pal.gold, 0.35 * near * stacks);
    }

    // ── the line over the tops: it bends upward
    const upto = Math.min(mo - 0.5, COLS - 0.72);
    if (upto > -0.3) {
      const pts: V3[] = [];
      const steps = Math.max(2, Math.ceil((upto + 0.3) * (m || f.q < 0.75 ? 2 : 4)));
      for (let n = 0; n <= steps; n++) {
        const i = lerp(-0.3, upto, n / steps);
        pts.push([X0 + i * DX, SHELF + TH * (paid(i) + earned(Math.max(0, i))) + 0.13, 0]);
      }
      const line = f.on(0.6, 0.3) * ink;
      trace(f, pts, pal.gold, 0.9 * line, 1.5, f.still ? -1 : t / 7);
      lamp(f, pts[steps], pal.gold, 0.9 * line, 0.014);
    }

    const named = f.on(0.85, 0.15);
    const size = m ? 9 : 10;
    ctx.save();
    ctx.letterSpacing = "1.5px";
    f.label("TIME", [RC[0], RC[1] - RR, RC[2]], { align: "center", size, colour: pal.ink2, alpha: 0.75 * named, dy: 14 });
    f.label("PAID IN", [1.58, SHELF - 0.07, -0.24], { align: "right", size, colour: pal.key, alpha: 0.95 * named, dy: 14 });
    if (mo > COLS - 2) {
      const e = COLS - 0.72;
      f.label("EARNED", [X0 + e * DX + 0.03, SHELF + TH * (paid(e) + earned(e)) + 0.13, 0], { align: "right", size, colour: pal.gold, alpha: 0.95 * named * ink * clamp(mo - (COLS - 2)), dy: -15 });
    }
    ctx.restore();
  },
};

export default scene;
