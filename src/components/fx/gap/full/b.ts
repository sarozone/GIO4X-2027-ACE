import { ALERT, AMBER, arrow, clamp, disc, lerp, mix, rgba, ring, rr, runner, scene, seg, smooth, tag, wander, type Box, type Colour, type FigureFrame } from "./kit";

/**
 * Ten full scenes: risk, compounding, diversification, comparison, security,
 * documents, learning, definitions, questions and orders. Each is told in five
 * chapters, as `leverage.ts` is: every chapter stands on its own, answers the
 * pointer, fits whatever box it is handed and composes a still at any moment.
 * Words only; nothing here is a figure, a price or a promise.
 */

type Ctx = CanvasRenderingContext2D;
type Palette = FigureFrame["pal"];

/** where the pointer is across the box (0 left, 1 right); it rests at `rest` while the pointer is elsewhere */
const px = (f: FigureFrame, b: Box, k: number, rest: number) => lerp(clamp(rest), clamp((f.mx - b.x) / Math.max(1, b.w)), k);
/** the same, down the box (0 top, 1 bottom) */
const py = (f: FigureFrame, b: Box, k: number, rest: number) => lerp(clamp(rest), clamp((f.my - b.y) / Math.max(1, b.h)), k);
/** which of `n` equal parts the pointer is in, across or down the box */
const pickX = (f: FigureFrame, b: Box, n: number) => clamp(Math.floor(((f.mx - b.x) / Math.max(1, b.w)) * n), 0, n - 1);
const pickY = (f: FigureFrame, b: Box, n: number) => clamp(Math.floor(((f.my - b.y) / Math.max(1, b.h)) * n), 0, n - 1);

/** a tag that cannot leave the box: its place is moved inwards by the room its letters need */
function put(f: FigureFrame, b: Box, s: string, x: number, y: number, align: CanvasTextAlign = "left", c: Colour = f.pal.ink3, alpha = 1): void {
  const w = s.length * 6.9;
  const lo = b.x + (align === "center" ? w / 2 : align === "right" ? w : 0);
  const hi = b.r - (align === "center" ? w / 2 : align === "left" ? w : 0);
  tag(f, s, clamp(x, lo, Math.max(lo, hi)), clamp(y, b.y + 8, b.b - 1), align, c, alpha);
}

/** a line from `x0` to `x1` whose height is `y(u)`, drawn as far as `p`; gives back the last height */
function trace(ctx: Ctx, x0: number, x1: number, n: number, p: number, y: (u: number) => number): number {
  let ly = y(0);
  ctx.beginPath();
  ctx.moveTo(x0, ly);
  const m = Math.max(1, Math.round(n * clamp(p)));
  for (let i = 1; i <= m; i++) {
    const u = i / n;
    ly = y(u);
    ctx.lineTo(lerp(x0, x1, u), ly);
  }
  ctx.stroke();
  return ly;
}

/** rows of writing: lines of uneven length, as text looks from a distance */
function rules(ctx: Ctx, x: number, y: number, w: number, rows: number, gap: number, seed: number, p = 1): void {
  for (let i = 0; i < rows; i++) {
    const len = Math.max(0, w) * (0.62 + 0.38 * Math.abs(Math.sin(i * 2.4 + seed))) * p;
    seg(ctx, x, y + i * gap, x + len, y + i * gap);
  }
}

function tick(ctx: Ctx, x: number, y: number, s: number): void {
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x - s * 0.3, y + s * 0.7);
  ctx.lineTo(x + s, y - s * 0.7);
  ctx.stroke();
}

function cross(ctx: Ctx, x: number, y: number, s: number): void {
  seg(ctx, x - s, y - s, x + s, y + s);
  seg(ctx, x - s, y + s, x + s, y - s);
}

/** a dashed line; the dash is put back afterwards */
function dseg(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, on = 3, off = 4): void {
  ctx.save();
  ctx.setLineDash([on, off]);
  seg(ctx, x1, y1, x2, y2);
  ctx.setLineDash([]);
  ctx.restore();
}

/** a dashed outline of a rectangle */
function drect(ctx: Ctx, x: number, y: number, w: number, h: number, r = 2): void {
  ctx.save();
  ctx.setLineDash([3, 4]);
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** a sheet of paper with a folded corner */
function sheet(f: FigureFrame, x: number, y: number, w: number, h: number, c: Colour, a = 0.85): void {
  const { ctx, pal } = f;
  const ww = Math.max(0, w);
  const hh = Math.max(0, h);
  const fold = Math.min(ww, hh) * 0.18;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + ww - fold, y);
  ctx.lineTo(x + ww, y + fold);
  ctx.lineTo(x + ww, y + hh);
  ctx.lineTo(x, y + hh);
  ctx.closePath();
  ctx.fillStyle = rgba(pal.surface, 0.72);
  ctx.fill();
  ctx.strokeStyle = rgba(c, a);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + ww - fold, y);
  ctx.lineTo(x + ww - fold, y + fold);
  ctx.lineTo(x + ww, y + fold);
  ctx.stroke();
}

/** the colour of the i-th holding, book or bar */
function hue(pal: Palette, i: number): Colour {
  const m = ((i % 5) + 5) % 5;
  return m === 0 ? pal.accent : m === 1 ? pal.gold : m === 2 ? pal.teal : m === 3 ? pal.emerald : pal.ink2;
}

/** from safe through a warning to danger, as `s` goes from 0 to 1 */
const heat = (pal: Palette, s: number): Colour => (s < 0.5 ? mix(pal.emerald, AMBER, s * 2) : mix(AMBER, ALERT, s * 2 - 1));

const MEASURES = ["cost", "speed", "safety", "service"] as const;
const SCORE_A = [0.9, 0.3, 0.5] as const;
const SCORE_B = [0.35, 0.85, 0.7] as const;
const CLAUSES = ["costs", "risks", "complaints"] as const;
const LESSONS = ["basics", "terms", "charts", "risk", "practice"] as const;
const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const QUALITIES = ["plain", "complete", "in writing"] as const;
const DRIFT = [1.5, 0.35, -0.6, -1.25] as const;
const UNEVEN = [1.5, 1.08, 0.86, 0.56] as const;
const ADDRESS = [0.2, 0.34, 0.16, 0.2] as const;
const LINKED: readonly (readonly [number, number])[] = [
  [0.5, 0.5],
  [0.14, 0.2],
  [0.86, 0.24],
  [0.16, 0.8],
  [0.84, 0.78],
];
const LINKS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [3, 4],
];

/**
 * RISK, in five chapters: what could be lost, how the size of a position sets
 * it, how a fast market widens it, how losses in a row deepen it, and deciding
 * it before the trade is opened.
 */
export const risk = scene((v) => ({
  caption: "Risk",
  line: "Risk is how much a trade could lose, and most of it is chosen before the position is opened.",
  parts: [
    {
      label: "What could be lost",
      note: "Between your entry and your stop lies the amount at risk.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const entry = b.y + b.h * 0.3;
        // the pointer sets how far away the stop is
        const stop = clamp(lerp(b.y, b.b, py(f, b, k, 0.76 + 0.08 * v.a)), entry + b.h * 0.16, b.b - 3);
        ctx.fillStyle = rgba(ALERT, 0.1 + 0.1 * k);
        ctx.fillRect(b.x, entry, b.w, (stop - entry) * p);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, entry, b.r, entry);
        ctx.strokeStyle = rgba(ALERT, 0.9);
        dseg(ctx, b.x, stop, b.x + b.w * p, stop, 4, 4);
        runner(f, b.x, stop, b.r, stop, t * 0.18 * v.speed + v.a, ALERT);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        const ly = trace(ctx, b.x, b.r - 12, 40, p, (u) => clamp(entry + u * (stop - entry) * 0.4 - wander(t * 0.6 * v.speed - (1 - u) * 5, v.phase) * b.h * 0.2 * Math.min(1, u * 4), b.y + 2, stop));
        // the move so far, measured from the entry
        ctx.strokeStyle = rgba(ly > entry ? ALERT : pal.emerald, 0.95);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, b.r - 5, entry, b.r - 5, ly);
        ctx.lineWidth = 1.4;
        put(f, b, "entry", b.x + 2, entry - 5, "left");
        put(f, b, "stop", b.r - 12, stop - 4, "right", ALERT);
        if (stop - entry > 26) put(f, b, "at risk", b.x + b.w * 0.36, (entry + stop) / 2 + 3, "center", ALERT, 0.9);
      },
    },
    {
      label: "Size sets the stake",
      note: "The same move costs more on a larger position than a small one.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer sizes the position: further right, larger
        const s = px(f, b, k, 0.5 + 0.3 * Math.sin(t * 0.5 * v.speed + v.phase));
        const g = b.b - 12;
        const room = Math.max(6, g - b.y - 10);
        const max = Math.min(room, b.w * 0.3);
        const side = lerp(0.3, 1, s) * max * p;
        const bx = b.x + b.w * 0.26;
        const lx = b.x + b.w * 0.76;
        const bw = clamp(b.w * 0.1, 8, 34);
        const loss = lerp(0.3, 1, s) * room * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        ctx.strokeStyle = rgba(pal.ink3, 0.45);
        for (let i = 0; i < 3; i++) {
          const m = (0.3 + 0.35 * i) * max;
          drect(ctx, bx - m / 2, g - m, m, m);
        }
        ctx.fillStyle = rgba(pal.accent, 0.5 + 0.35 * k);
        rr(ctx, bx - side / 2, g - side, side, side, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        ctx.fillStyle = rgba(ALERT, 0.3 + 0.3 * k);
        ctx.fillRect(lx - bw / 2, g - loss, bw, loss);
        ctx.strokeStyle = rgba(ALERT, 0.95);
        ctx.strokeRect(lx - bw / 2, g - loss, bw, loss);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        dseg(ctx, bx + side / 2, g - side, lx - bw / 2, g - loss, 2, 4);
        runner(f, bx + side / 2, g - side, lx - bw / 2, g - loss, t * 0.3 * v.speed + v.b, ALERT);
        put(f, b, "size", bx, b.b - 1, "center", pal.accent);
        put(f, b, "loss", lx, b.b - 1, "center", ALERT);
        if (b.w > 190) put(f, b, "same move", b.cx, b.y + 8, "center");
      },
    },
    {
      label: "Fast markets widen it",
      note: "When prices swing further, the same position can lose more.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer stirs the market: further right, wilder
        const wd = px(f, b, k, 0.5 + 0.35 * Math.sin(t * 0.4 * v.speed + v.phase));
        const cy = b.cy + 4;
        const reach = Math.max(4, b.h / 2 - 8);
        const h0 = reach * 0.14;
        const h1 = lerp(h0, lerp(0.3, 1, wd) * reach, p);
        ctx.beginPath();
        ctx.moveTo(b.x, cy - h0);
        ctx.lineTo(b.r - 8, cy - h1);
        ctx.lineTo(b.r - 8, cy + h1);
        ctx.lineTo(b.x, cy + h0);
        ctx.closePath();
        ctx.fillStyle = rgba(AMBER, 0.1 + 0.1 * k);
        ctx.fill();
        ctx.strokeStyle = rgba(AMBER, 0.7);
        seg(ctx, b.x, cy - h0, b.r - 8, cy - h1);
        seg(ctx, b.x, cy + h0, b.r - 8, cy + h1);
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, b.x, cy, b.r - 8, cy);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, b.x, b.r - 8, 48, p, (u) => cy - wander(t * 0.8 * v.speed - (1 - u) * 6, v.phase) * lerp(h0, h1, u) * 0.85);
        // how far it could now travel
        ctx.strokeStyle = rgba(ALERT, 0.95);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, b.r - 3, cy - h1, b.r - 3, cy + h1);
        ctx.lineWidth = 1.4;
        put(f, b, "calm", b.x + 2, cy - h0 - 6, "left");
        put(f, b, "fast", b.r - 12, cy - h1 - 4, "right", AMBER);
      },
    },
    {
      label: "Losses in a row",
      note: "Each loss leaves less to trade with, and a longer climb back.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 6;
        // the pointer sets how much each trade risks: further right, deeper steps
        const d = lerp(0.07, 0.26, px(f, b, k, 0.45 + 0.25 * Math.sin(t * 0.4 * v.speed + v.phase)));
        const g = b.b - 3;
        const H = Math.max(8, b.h - 16);
        const y0 = g - H;
        const cw = (b.w * 0.72) / n;
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        dseg(ctx, b.x, y0, b.r, y0);
        let hgt = H;
        let lastTop = y0;
        let lastX = b.x;
        for (let i = 0; i < n; i++) {
          if (i > n * p) break;
          const x = b.x + i * cw;
          const ww = Math.max(1, cw - 3);
          ctx.fillStyle = rgba(ALERT, 0.14);
          ctx.fillRect(x + 1, y0, ww, H - hgt);
          ctx.fillStyle = rgba(pal.accent, 0.3 + 0.25 * k);
          ctx.fillRect(x + 1, g - hgt, ww, hgt);
          ctx.strokeStyle = rgba(pal.accent, 0.95);
          ctx.strokeRect(x + 1, g - hgt, ww, hgt);
          lastTop = g - hgt;
          lastX = x + 1 + ww;
          hgt *= 1 - d;
        }
        // what it would take to be back where it began
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        ctx.save();
        ctx.setLineDash([3, 4]);
        arrow(ctx, lastX + 3, lastTop, b.r - 5, y0 + 4);
        ctx.setLineDash([]);
        ctx.restore();
        runner(f, lastX + 3, lastTop, b.r - 5, y0 + 4, t * 0.25 * v.speed + v.c, pal.gold);
        put(f, b, "start", b.x + 2, y0 - 4, "left");
        put(f, b, "climb back", b.r - 2, b.b - 2, "right", pal.gold);
      },
    },
    {
      label: "Decide before you trade",
      note: "Choose a stop and a size you can afford to be wrong about.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer moves the control: less on the left, more on the right
        const s = px(f, b, k, 0.3 + 0.12 * Math.sin(t * 0.5 * v.speed + v.phase));
        const col = heat(pal, s);
        const ty = b.b - 15;
        const x0 = b.x + 6;
        const x1 = b.r - 6;
        const top = b.y + 12;
        const bh = Math.max(5, ty - 9 - top);
        const rw = (x1 - x0) * lerp(0.06, 0.7, s) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        rr(ctx, x0, top, x1 - x0, bh, 3);
        ctx.stroke();
        ctx.fillStyle = rgba(col, 0.3 + 0.3 * k);
        rr(ctx, x1 - rw, top, rw, bh, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(col, 1);
        ctx.lineWidth = 2.4;
        seg(ctx, x1 - rw, top - 2, x1 - rw, top + bh + 2);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, x0, ty, x1, ty);
        const kx = lerp(x0, x1, s);
        ctx.strokeStyle = rgba(col, 1);
        ctx.lineWidth = 2.4;
        seg(ctx, x0, ty, kx, ty);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.surface, 1);
        disc(ctx, kx, ty, 4.5 + k);
        ring(ctx, kx, ty, 4.5 + k);
        put(f, b, "account", x0, top - 4, "left");
        put(f, b, "at risk", x1, top - 4, "right", col);
        put(f, b, "less", x0, b.b - 1, "left", pal.emerald);
        put(f, b, "more", x1, b.b - 1, "right", ALERT);
      },
    },
  ],
}));

/**
 * COMPOUNDING, in five chapters: growth earned on growth, what leaving it in
 * does, why it needs time, how losses compound as well, and that none of it is
 * guaranteed.
 */
export const compounding = scene((v) => ({
  caption: "Compounding",
  line: "Compounding is growth earned on earlier growth, so results build on themselves over time, for losses as much as for gains.",
  parts: [
    {
      label: "Growth on growth",
      note: "Each period's result is added to the base for the next.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 6;
        const g = b.b - 12;
        const H = Math.max(8, g - b.y - 4);
        const cw = b.w / n;
        const ratio = 1.24 + 0.02 * Math.sin(t * 0.7 * v.speed + v.phase);
        const first = H / Math.pow(ratio, n - 1);
        // the pointer picks a period: its total becomes the next one's base
        const j = clamp(Math.floor(px(f, b, k, 0.5 + 0.45 * Math.sin(t * 0.3 * v.speed + v.phase)) * n), 0, n - 1);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        let prev = 0;
        for (let i = 0; i < n; i++) {
          if (i > n * p) break;
          const hgt = first * Math.pow(ratio, i);
          const x = b.x + i * cw + 2;
          const ww = Math.max(1, cw - 5);
          const on = i === j ? 1 : 0;
          const base = i === 0 ? hgt : prev;
          ctx.fillStyle = rgba(pal.accent, 0.28 + 0.3 * on);
          ctx.fillRect(x, g - base, ww, base);
          ctx.fillStyle = rgba(pal.gold, 0.45 + 0.45 * on);
          ctx.fillRect(x, g - hgt, ww, hgt - base);
          ctx.strokeStyle = rgba(on ? pal.ink : pal.accent, 0.9);
          ctx.strokeRect(x, g - hgt, ww, hgt);
          if (i < n - 1) {
            ctx.strokeStyle = rgba(pal.ink3, 0.35 + 0.5 * on);
            dseg(ctx, x + ww, g - hgt, x + cw, g - hgt, 2, 3);
            if (on) runner(f, x, g - hgt, x + cw + ww, g - hgt, t * 0.4 * v.speed + v.a, pal.gold);
          }
          prev = hgt;
        }
        put(f, b, "added", b.x + 2, b.y + 8, "left", pal.gold);
        put(f, b, "base", b.x + 2, b.b - 1, "left", pal.accent);
        if (b.w > 170) put(f, b, "next base", b.r - 2, b.b - 1, "right");
      },
    },
    {
      label: "Left in, it builds",
      note: "Results left in join the base; results taken out do not.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 4;
        const y0 = b.b - 13;
        const H = Math.max(8, y0 - b.y - 4);
        const A = 1.6;
        const top = Math.exp(A) - 1;
        const cu = (u: number) => y0 - ((Math.exp(A * u) - 1) / top) * H;
        const st = (u: number) => y0 - ((A * u) / top) * H;
        // the pointer chooses the moment at which the two are compared
        const up = px(f, b, k, 0.72 + 0.2 * Math.sin(t * 0.4 * v.speed + v.phase)) * p;
        const xp = lerp(x0, x1, up);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        for (let i = 1; i <= 16; i++) {
          const u = (up * i) / 16;
          ctx.lineTo(lerp(x0, x1, u), cu(u));
        }
        ctx.lineTo(xp, st(up));
        ctx.closePath();
        ctx.fillStyle = rgba(pal.gold, 0.14 + 0.14 * k);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, x0, y0, x1, y0);
        ctx.strokeStyle = rgba(pal.ink2, 0.85);
        seg(ctx, x0, y0, lerp(x0, x1, p), st(p));
        ctx.strokeStyle = rgba(pal.accent, 1);
        trace(ctx, x0, x1, 32, p, cu);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, xp, st(up), xp, cu(up));
        ctx.lineWidth = 1.4;
        // what is taken out leaves the picture
        runner(f, xp, st(up), xp, y0, t * 0.3 * v.speed + v.b, pal.ink3);
        put(f, b, "left in", x1 - b.w * 0.14, b.y + 9, "right", pal.accent);
        put(f, b, "taken out", x1, st(1) + 12, "right", pal.ink2);
      },
    },
    {
      label: "Time does the work",
      note: "The curve is slow at first and steepens only with many periods.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 6;
        const y0 = b.b - 13;
        const H = Math.max(8, y0 - b.y - 4);
        const A = 2.1;
        const top = Math.exp(A) - 1;
        const cu = (u: number) => y0 - ((Math.exp(A * u) - 1) / top) * H;
        // the pointer travels along the years
        const up = px(f, b, k, 0.5 + 0.42 * Math.sin(t * 0.3 * v.speed + v.phase)) * p;
        const xp = lerp(x0, x1, up);
        const yp = cu(up);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        arrow(ctx, x0, y0, x1 + 4, y0, 4);
        for (let i = 1; i < 8; i++) seg(ctx, lerp(x0, x1, i / 8), y0, lerp(x0, x1, i / 8), y0 + 3);
        const cw = clamp(b.w * 0.04, 4, 14);
        ctx.fillStyle = rgba(pal.accent, 0.25 + 0.3 * k);
        ctx.fillRect(xp - cw / 2, yp, cw, y0 - yp);
        ctx.strokeStyle = rgba(pal.accent, 1);
        trace(ctx, x0, x1, 36, p, cu);
        // how steep it is at this moment
        const sx = x1 - x0;
        const sy = -((A * Math.exp(A * up)) / top) * H;
        const len = Math.max(1, Math.hypot(sx, sy));
        const L = clamp(b.u * 0.22, 10, 46);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2 + k;
        seg(ctx, clamp(xp - (sx / len) * L, b.x, b.r), clamp(yp - (sy / len) * L, b.y + 1, b.b), clamp(xp + (sx / len) * L, b.x, b.r), clamp(yp + (sy / len) * L, b.y + 1, b.b));
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, xp, yp, 3);
        put(f, b, "early", x0, b.b - 1, "left");
        put(f, b, "later", x1, b.b - 1, "right");
        if (b.w > 170) put(f, b, "slow at first", b.x + 2, b.y + 8, "left");
      },
    },
    {
      label: "Losses compound too",
      note: "A run of losses shrinks the base that has to grow back.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // up and down chooses which of the two is followed
        const e = py(f, b, k, 0.5 + 0.3 * Math.sin(t * 0.4 * v.speed + v.phase));
        const s0 = clamp(b.u * 0.14, 5, 20);
        const x0 = b.x + s0 + 3;
        const x1 = b.r - s0 * 1.7 - 5;
        const half = Math.max(4, b.h / 2 - 12);
        const up = (u: number) => b.cy - (half * (Math.pow(1.5, u * 4) - 1)) / (Math.pow(1.5, 4) - 1);
        const down = (u: number) => b.cy + (half * (1 - Math.pow(0.62, u * 4))) / (1 - Math.pow(0.62, 4));
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        dseg(ctx, b.x, b.cy, b.r, b.cy);
        ctx.fillStyle = rgba(pal.accent, 0.6);
        rr(ctx, b.x + 1, b.cy - s0 / 2, s0, s0, 2);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.emerald, 0.95);
        ctx.lineWidth = lerp(2.8, 1.2, e);
        trace(ctx, x0, x1, 28, p, up);
        ctx.strokeStyle = rgba(ALERT, 0.95);
        ctx.lineWidth = lerp(1.2, 2.8, e);
        trace(ctx, x0, x1, 28, p, down);
        ctx.lineWidth = 1.4;
        for (let i = 1; i <= 4; i++) {
          if (i > 4 * p) break;
          ctx.fillStyle = rgba(pal.emerald, 0.9);
          disc(ctx, lerp(x0, x1, i / 4), up(i / 4), 1.8);
          ctx.fillStyle = rgba(ALERT, 0.9);
          disc(ctx, lerp(x0, x1, i / 4), down(i / 4), 1.8);
        }
        // what the base has become at the end of each road
        const big = s0 * 1.7;
        const small = s0 * 0.5;
        ctx.fillStyle = rgba(pal.emerald, 0.2 + 0.35 * (1 - e));
        rr(ctx, x1 + 4, clamp(up(1) - big / 2, b.y + 9, b.b - big), big, big, 2);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.emerald, 0.95);
        ctx.stroke();
        ctx.fillStyle = rgba(ALERT, 0.25 + 0.5 * e);
        rr(ctx, x1 + 4, clamp(down(1) - small / 2, b.y, b.b - 10 - small), small, small, 1.5);
        ctx.fill();
        ctx.strokeStyle = rgba(ALERT, 0.95);
        ctx.stroke();
        put(f, b, "gains build", b.cx, b.y + 8, "center", pal.emerald);
        put(f, b, "losses build", b.cx, b.b - 1, "center", ALERT);
      },
    },
    {
      label: "Never guaranteed",
      note: "The smooth curve is an idea; real results wander, and can fall.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 8;
        const ys = b.y + b.h * 0.64;
        const rise = Math.max(4, ys - b.y - 12);
        const top = Math.exp(1.5) - 1;
        const ideal = (u: number) => ((Math.exp(1.5 * u) - 1) / top) * rise;
        const path = (j: number, u: number) => clamp(ys - ideal(u) * (j === 0 ? 1.05 : j === 1 ? 0.45 : -0.25) + wander(t * 0.5 * v.speed - (1 - u) * 4 + j * 2.1, v.phase + j * 1.7) * b.h * 0.09 * u, b.y + 2, b.b - 2);
        // the pointer follows whichever outcome it is nearest to
        let sel = 1;
        if (k > 0.02) {
          let best = Infinity;
          for (let j = 0; j < 3; j++) {
            const d = Math.abs(path(j, 1) - f.my);
            if (d < best) {
              best = d;
              sel = j;
            }
          }
        }
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, x0, ys, x1, ys);
        ctx.strokeStyle = rgba(pal.gold, 0.85);
        ctx.save();
        ctx.setLineDash([4, 4]);
        trace(ctx, x0, x1, 28, p, (u) => ys - ideal(u));
        ctx.setLineDash([]);
        ctx.restore();
        for (let j = 0; j < 3; j++) {
          const on = j === sel;
          const end = path(j, 1);
          const col = on ? (end < ys ? pal.emerald : ALERT) : pal.ink3;
          ctx.strokeStyle = rgba(col, on ? 0.95 : 0.6);
          ctx.lineWidth = on ? 2 + k * 0.8 : 1.2;
          trace(ctx, x0, x1, 36, p, (u) => path(j, u));
          ctx.fillStyle = rgba(col, on ? 1 : 0.6);
          ctx.fillRect(lerp(x0, x1, p) - 2.5, path(j, p) - 2.5, 5, 5);
        }
        ctx.lineWidth = 1.4;
        put(f, b, "the idea", b.x + 2, b.y + 8, "left", pal.gold);
        put(f, b, "what may happen", b.r - 2, b.b - 1, "right");
      },
    },
  ],
}));

/**
 * DIVERSIFICATION, in five chapters, told with columns, bars and lines (never
 * a pie): several holdings, how they move apart, one falling while the rest
 * hold, the mix drifting, and the rebalance that restores it.
 */
export const portfolio = scene((v) => ({
  caption: "Diversification",
  line: "Diversification spreads money across holdings that do not move together, so that one fall does not decide the whole result.",
  parts: [
    {
      label: "Several holdings",
      note: "Money divided among different things, each with its own weight.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 5;
        const barY = b.b - 7;
        const g = barY - 6;
        const H = Math.max(6, g - b.y - 14);
        const cw = b.w / n;
        const wt = (i: number) => 1 + 0.4 * Math.sin(t * 0.45 * v.speed + i * 1.9 + v.phase);
        let sum = 0;
        for (let i = 0; i < n; i++) sum += wt(i);
        // the pointer picks a holding and shows its share of the whole
        const j = k > 0.02 ? pickX(f, b, n) : -1;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        let sx = b.x;
        for (let i = 0; i < n; i++) {
          const share = wt(i) / Math.max(0.01, sum);
          const hgt = clamp(share * n * 0.62) * H * p;
          const x = b.x + i * cw;
          const on = i === j ? k : 0;
          const c = hue(pal, i);
          ctx.fillStyle = rgba(c, 0.3 + 0.45 * on);
          rr(ctx, x + cw * 0.16, g - hgt - on * 3, cw * 0.68, hgt, 2);
          ctx.fill();
          ctx.strokeStyle = rgba(c, 0.95);
          ctx.stroke();
          const sw = share * b.w;
          ctx.fillStyle = rgba(c, 0.5 + 0.45 * on);
          ctx.fillRect(sx + 1, barY, Math.max(0, sw - 2), 5);
          if (on > 0) {
            ctx.strokeStyle = rgba(c, on);
            seg(ctx, x + cw / 2, g, sx + sw / 2, barY);
          }
          sx += sw;
        }
        put(f, b, "holdings", b.x + 2, b.y + 8, "left");
        if (b.w > 150) put(f, b, "weights", b.r - 2, b.y + 8, "right");
      },
    },
    {
      label: "They move apart",
      note: "Different holdings rise and fall at different times.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 4;
        const amp = Math.max(3, b.h * 0.19);
        const line = (j: number, u: number) => b.y + b.h * (0.31 + 0.2 * j) - wander(t * 0.6 * v.speed - (1 - u) * 5 + j * 2.3, v.phase + j * 2.1) * amp;
        // the pointer is a moment in time: at it, some are rising while others fall
        const up = px(f, b, k, 0.62 + 0.2 * Math.sin(t * 0.35 * v.speed + v.phase)) * p;
        const xp = lerp(x0, x1, up);
        const side = xp > b.cx ? -1 : 1;
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        dseg(ctx, xp, b.y + 11, xp, b.b - 1);
        for (let j = 0; j < 3; j++) {
          const c = hue(pal, j);
          ctx.strokeStyle = rgba(c, 0.95);
          trace(ctx, x0, x1, 44, p, (u) => line(j, u));
          const y = line(j, up);
          const rising = line(j, Math.min(1, up + 0.03)) < line(j, Math.max(0, up - 0.03));
          ctx.fillStyle = rgba(c, 1);
          ctx.fillRect(xp - 3, y - 3, 6, 6);
          ctx.strokeStyle = rgba(rising ? pal.emerald : ALERT, 0.7 + 0.3 * k);
          arrow(ctx, xp + side * 9, y + (rising ? 5 : -5), xp + side * 9, y - (rising ? 5 : -5), 3.5);
        }
        put(f, b, "not in step", b.x + 2, b.y + 8, "left");
      },
    },
    {
      label: "One falls, others hold",
      note: "A fall in one holding is cushioned by the rest.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 5;
        const span = b.w * 0.66;
        const cw = span / n;
        const g = b.b - 12;
        const H = Math.max(6, g - b.y - 12);
        // the pointer chooses which holding takes the fall
        const j = k > 0.02 ? clamp(Math.floor((f.mx - b.x) / Math.max(1, cw)), 0, n - 1) : Math.floor(v.a * n) % n;
        const fall = (0.5 + 0.12 * Math.sin(t * 0.6 * v.speed + v.phase)) * p;
        let total = 0;
        let total0 = 0;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        for (let i = 0; i < n; i++) {
          const base = H * (0.5 + 0.3 * Math.abs(Math.sin(i * 2.2 + v.b * 6)));
          const hit = i === j;
          const hgt = hit ? base * (1 - fall) : base * (1 + 0.03 * Math.sin(t * 0.8 * v.speed + i));
          const x = b.x + i * cw + cw * 0.14;
          const ww = cw * 0.72;
          const c = hit ? ALERT : hue(pal, i);
          if (hit) {
            ctx.strokeStyle = rgba(pal.ink3, 0.7);
            drect(ctx, x, g - base, ww, base);
            ctx.strokeStyle = rgba(ALERT, 0.9);
            arrow(ctx, x + ww / 2, g - base + 3, x + ww / 2, g - hgt - 3, 4);
            put(f, b, "falls", x + ww / 2, g - base - 4, "center", ALERT);
          }
          ctx.fillStyle = rgba(c, 0.3 + (hit ? 0.3 * k : 0));
          ctx.fillRect(x, g - hgt, ww, hgt);
          ctx.strokeStyle = rgba(c, 0.95);
          ctx.strokeRect(x, g - hgt, ww, hgt);
          total += hgt;
          total0 += base;
        }
        // the whole, which moves far less than the one that fell
        const tx = b.x + b.w * 0.76;
        const tw = b.w * 0.2;
        const th0 = H * 0.86;
        const th = (th0 * total) / Math.max(1, total0);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        drect(ctx, tx, g - th0, tw, th0);
        ctx.fillStyle = rgba(pal.accent, 0.35 + 0.2 * k);
        ctx.fillRect(tx, g - th, tw, th);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.strokeRect(tx, g - th, tw, th);
        put(f, b, "holdings", b.x + span / 2, b.b - 1, "center");
        put(f, b, "the whole", tx + tw / 2, b.b - 1, "center", pal.accent);
      },
    },
    {
      label: "The mix drifts",
      note: "What rises most becomes a larger share than you chose.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = DRIFT.length;
        // the pointer is time passing: further right, further from the mix chosen
        const dr = px(f, b, k, 0.55 + 0.35 * Math.sin(t * 0.4 * v.speed + v.phase)) * p;
        const bh = clamp(b.h * 0.2, 6, 30);
        const yA = b.y + 12;
        const yB = b.b - 12 - bh;
        const x0 = b.x + 1;
        const W = b.w - 2;
        let xa = x0;
        let xb = x0;
        for (let i = 0; i < n; i++) {
          const wa = W / n;
          const wb = (W * (1 + 0.55 * dr * (DRIFT[i] ?? 0))) / n;
          const c = hue(pal, i);
          ctx.fillStyle = rgba(c, 0.28);
          ctx.fillRect(xa, yA, Math.max(0, wa - 2), bh);
          ctx.strokeStyle = rgba(c, 0.9);
          ctx.strokeRect(xa, yA, Math.max(0, wa - 2), bh);
          ctx.fillStyle = rgba(c, 0.3 + (i === 0 ? 0.4 * dr : 0));
          ctx.fillRect(xb, yB, Math.max(0, wb - 2), bh);
          ctx.strokeRect(xb, yB, Math.max(0, wb - 2), bh);
          if (i < n - 1) {
            ctx.strokeStyle = rgba(pal.ink3, 0.55);
            dseg(ctx, xa + wa - 1, yA + bh, xb + wb - 1, yB, 2, 3);
          }
          xa += wa;
          xb += wb;
        }
        runner(f, x0 + W / n - 1, yA + bh, x0 + (W * (1 + 0.55 * dr * 1.5)) / n - 1, yB, t * 0.3 * v.speed + v.a, pal.accent);
        put(f, b, "chosen", x0, yA - 4, "left");
        put(f, b, "now", x0, yB + bh + 10, "left", pal.accent);
        put(f, b, "drifted", b.r - 1, yB + bh + 10, "right", AMBER, dr);
      },
    },
    {
      label: "Rebalance",
      note: "Trim the largest, top up the smallest; risk is reduced, never removed.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = UNEVEN.length;
        // the pointer carries the rebalance through, from left to right
        const r = px(f, b, k, 0.5 + 0.45 * Math.sin(t * 0.45 * v.speed + v.phase)) * p;
        const g = b.b - 12;
        const H = Math.max(6, g - b.y - 10);
        const T = H * 0.62;
        const ty = g - T;
        const cw = b.w / n;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        for (let i = 0; i < n; i++) {
          const m = lerp(UNEVEN[i] ?? 1, 1, r);
          const hgt = T * m;
          const x = b.x + i * cw + cw * 0.16;
          const ww = cw * 0.68;
          const c = hue(pal, i);
          ctx.fillStyle = rgba(c, 0.3);
          ctx.fillRect(x, g - hgt, ww, hgt);
          ctx.strokeStyle = rgba(c, 0.95);
          ctx.strokeRect(x, g - hgt, ww, hgt);
          if (m > 1) {
            ctx.fillStyle = rgba(pal.gold, 0.5 + 0.3 * k);
            ctx.fillRect(x, g - hgt, ww, hgt - T);
          } else if (m < 1) {
            ctx.strokeStyle = rgba(pal.emerald, 0.9);
            drect(ctx, x, ty, ww, T - hgt, 1);
          }
        }
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        dseg(ctx, b.x, ty, b.r, ty, 5, 4);
        // what is trimmed from the largest goes to the smallest
        const ax = b.x + cw * 0.5;
        const ay = g - T * lerp(UNEVEN[0] ?? 1, 1, r) - 3;
        const zx = b.x + cw * (n - 0.5);
        const zy = g - T * lerp(UNEVEN[n - 1] ?? 1, 1, r) - 3;
        ctx.strokeStyle = rgba(pal.ink3, 0.5 * (1 - r) + 0.15);
        dseg(ctx, ax, ay, zx, zy, 2, 4);
        runner(f, ax, ay, zx, zy, t * 0.35 * v.speed + v.b, pal.gold, 2.6);
        put(f, b, "trim", ax, b.b - 1, "center", pal.gold);
        put(f, b, "top up", zx, b.b - 1, "center", pal.emerald);
        put(f, b, "target", b.cx, ty - 4, "center", pal.gold);
      },
    },
  ],
}));

/**
 * COMPARISON, in five chapters: two options set side by side, judged on the
 * same measures, weighed by what matters to the reader, looked at past the
 * headline, and then chosen.
 */
export const scales = scene((v) => ({
  caption: "Comparison",
  line: "Comparing means setting two options side by side and judging both on the same things.",
  parts: [
    {
      label: "Two options",
      note: "Set them side by side before choosing either.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const L = Math.min(b.w * 0.33, b.h * 0.7);
        const pv = b.y + b.h * 0.2 + 4;
        // the pointer presses down the side it is on
        const th = (0.07 * Math.sin(t * 0.7 * v.speed + v.phase) + 0.19 * k * clamp((f.mx - b.cx) / Math.max(1, b.w * 0.4), -1, 1)) * p;
        const sl = b.h * 0.2;
        const pw = L * 0.62;
        const ch = b.h * 0.16;
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, b.cx, pv, b.cx, b.b - 3);
        seg(ctx, b.cx - 12, b.b - 3, b.cx + 12, b.b - 3);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2.4;
        seg(ctx, b.cx - Math.cos(th) * L, pv - Math.sin(th) * L, b.cx + Math.cos(th) * L, pv + Math.sin(th) * L);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.ink, 0.9);
        disc(ctx, b.cx, pv, 3);
        for (let i = 0; i < 2; i++) {
          const side = i ? 1 : -1;
          const col = i ? pal.gold : pal.accent;
          const ex = b.cx + side * Math.cos(th) * L;
          const ey = pv + side * Math.sin(th) * L;
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          seg(ctx, ex, ey, ex - pw / 2, ey + sl);
          seg(ctx, ex, ey, ex + pw / 2, ey + sl);
          ctx.strokeStyle = rgba(pal.ink2, 0.95);
          ctx.lineWidth = 2;
          seg(ctx, ex - pw / 2, ey + sl, ex + pw / 2, ey + sl);
          ctx.lineWidth = 1.4;
          ctx.fillStyle = rgba(col, 0.35 + 0.3 * k);
          rr(ctx, ex - pw * 0.3, ey + sl - ch - 1, pw * 0.6, ch, 2);
          ctx.fill();
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.stroke();
          put(f, b, i ? "that" : "this", ex, ey + sl + 11, "center", col);
        }
      },
    },
    {
      label: "The same measures",
      note: "Judge both on the same things: cost, speed, safety, service.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = clamp(Math.floor(b.h / 15), 2, MEASURES.length);
        const rh = b.h / n;
        const reach = Math.max(0, b.w / 2 - 44);
        // the pointer picks a measure and shows which option does better on it
        const j = k > 0.02 ? pickY(f, b, n) : -1;
        for (let i = 0; i < n; i++) {
          const y = b.y + rh * (i + 0.5);
          const on = i === j ? k : 0;
          const la = reach * (0.3 + 0.65 * Math.abs(Math.sin(i * 1.9 + v.a * 6))) * p * (1 + 0.04 * Math.sin(t * 0.9 * v.speed + i));
          const lb = reach * (0.3 + 0.65 * Math.abs(Math.sin(i * 2.7 + v.b * 6 + 1))) * p * (1 + 0.04 * Math.sin(t * 0.8 * v.speed + i * 2));
          const bh = clamp(rh * 0.36, 3, 10) + on * 2;
          ctx.fillStyle = rgba(pal.accent, 0.35 + 0.45 * on);
          ctx.fillRect(b.cx - 30 - la, y - bh / 2, la, bh);
          ctx.fillStyle = rgba(pal.gold, 0.35 + 0.45 * on);
          ctx.fillRect(b.cx + 30, y - bh / 2, lb, bh);
          if (on > 0) {
            ctx.strokeStyle = rgba(pal.emerald, on);
            ctx.lineWidth = 2;
            tick(ctx, la > lb ? b.cx - 30 - la - 7 : b.cx + 30 + lb + 7, y, 3.5);
            ctx.lineWidth = 1.4;
          }
          put(f, b, MEASURES[i] ?? "", b.cx, y + 3.5, "center", on > 0 ? pal.ink : pal.ink3);
        }
      },
    },
    {
      label: "What matters to you",
      note: "Give more weight to the measures you care about most.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 3;
        const rh = b.h / n;
        const x0 = b.x + 5;
        const x1 = b.x + b.w * 0.56;
        // the pointer slides the weight of the measure it is on
        const row = pickY(f, b, n);
        let sa = 0;
        let sb = 0;
        let sw = 0;
        for (let i = 0; i < n; i++) {
          const rest = 0.5 + 0.3 * Math.sin(t * 0.4 * v.speed + i * 2.1 + v.phase);
          const on = i === row ? k : 0;
          const wgt = lerp(rest, clamp((f.mx - x0) / Math.max(1, x1 - x0)), on);
          const y = b.y + rh * (i + 0.66);
          const kx = lerp(x0, x1, wgt);
          ctx.strokeStyle = rgba(pal.ink3, 0.6);
          seg(ctx, x0, y, x1, y);
          ctx.strokeStyle = rgba(pal.teal, 0.95);
          ctx.lineWidth = 2.4;
          seg(ctx, x0, y, lerp(x0, kx, p), y);
          ctx.lineWidth = 1.4;
          ctx.fillStyle = rgba(pal.surface, 1);
          disc(ctx, kx, y, 3.5 + on);
          ring(ctx, kx, y, 3.5 + on);
          if (rh >= 19) put(f, b, MEASURES[i] ?? "", x0, y - 7, "left", on > 0 ? pal.ink : pal.ink3);
          sa += wgt * (SCORE_A[i] ?? 0);
          sb += wgt * (SCORE_B[i] ?? 0);
          sw += wgt;
        }
        // the verdict moves as the weights do
        const g = b.b - 12;
        const H = Math.max(4, g - b.y - 4);
        const norm = Math.max(0.01, sw);
        const cw = clamp(b.w * 0.1, 6, 30);
        const xa = b.x + b.w * 0.72;
        const xb = b.x + b.w * 0.9;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x + b.w * 0.63, g, b.r, g);
        ctx.fillStyle = rgba(pal.accent, 0.5);
        ctx.fillRect(xa - cw / 2, g, cw, (-H * sa * p) / norm);
        ctx.fillStyle = rgba(pal.gold, 0.5);
        ctx.fillRect(xb - cw / 2, g, cw, (-H * sb * p) / norm);
        put(f, b, "this", xa, b.b - 1, "center", pal.accent);
        put(f, b, "that", xb, b.b - 1, "center", pal.gold);
      },
    },
    {
      label: "Look past the headline",
      note: "The cheapest headline can hide costs found elsewhere.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer looks further: more of what the headline left out appears
        const r = px(f, b, k, 0.45 + 0.3 * Math.sin(t * 0.45 * v.speed + v.phase));
        const g = b.b - 12;
        const H = Math.max(6, g - b.y - 12);
        const cw = clamp(b.w * 0.2, 14, 70);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, g, b.r, g);
        for (let i = 0; i < 2; i++) {
          const col = i ? pal.gold : pal.accent;
          const x = b.x + b.w * (i ? 0.72 : 0.28) - cw / 2;
          const hh = H * (i ? 0.5 : 0.24) * p;
          const rest = H * (i ? 0.12 : 0.62) * r * p;
          ctx.fillStyle = rgba(col, 0.5);
          ctx.fillRect(x, g - hh, cw, hh);
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.strokeRect(x, g - hh, cw, hh);
          ctx.fillStyle = rgba(AMBER, 0.2 + 0.15 * k);
          ctx.fillRect(x, g - hh - rest, cw, rest);
          ctx.strokeStyle = rgba(AMBER, 0.9);
          drect(ctx, x, g - hh - rest, cw, rest, 1);
          ctx.strokeStyle = rgba(pal.ink, 0.9);
          ctx.lineWidth = 2;
          seg(ctx, x - 4, g - hh - rest, x + cw + 4, g - hh - rest);
          ctx.lineWidth = 1.4;
          put(f, b, i ? "that" : "this", x + cw / 2, b.b - 1, "center", col);
        }
        put(f, b, "the rest", b.cx, b.y + 8, "center", AMBER, 0.4 + 0.6 * r);
        if (b.w > 170) put(f, b, "headline", b.cx, g - 4, "center");
      },
    },
    {
      label: "Then decide",
      note: "Neither is best for everyone; choose the one that fits you.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer chooses: the side it is on is taken
        const s = px(f, b, k, 0.5 + 0.32 * v.dir * (0.7 + 0.3 * Math.sin(t * 0.5 * v.speed + v.phase)));
        const c = smooth((s - 0.5) * 3 + 0.5);
        const cw = b.w * 0.36;
        const ch = Math.max(8, b.h - 30);
        const y = b.y + 16;
        const rows = clamp(Math.floor((ch - 8) / 8), 1, 7);
        const gap = (ch - 10) / rows;
        for (let i = 0; i < 2; i++) {
          const on = i ? c : 1 - c;
          const col = i ? pal.gold : pal.accent;
          const x = b.x + b.w * (i ? 0.74 : 0.26) - cw / 2;
          const yy = y - on * 4 * p;
          ctx.fillStyle = rgba(col, 0.08 + 0.2 * on);
          rr(ctx, x, yy, cw, ch, 4);
          ctx.fill();
          ctx.strokeStyle = rgba(mix(pal.ink3, col, on), 0.5 + 0.5 * on);
          ctx.lineWidth = 1.4 + on;
          ctx.stroke();
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(pal.ink3, 0.35 + 0.45 * on);
          rules(ctx, x + 6, yy + 8, cw - 12, rows, gap, i * 3 + v.a * 6, p);
          if (on > 0.5) {
            ctx.strokeStyle = rgba(pal.emerald, (on - 0.5) * 2);
            ctx.lineWidth = 2;
            tick(ctx, x + cw / 2, yy - 6, 4);
            ctx.lineWidth = 1.4;
          }
        }
        put(f, b, "fits you", b.x + b.w * lerp(0.26, 0.74, c), b.b - 1, "center", pal.emerald);
      },
    },
  ],
}));

/**
 * SECURITY, in five chapters: an account behind a lock, a strong password, a
 * second step from your own device, checking that a link is genuine, and never
 * handing a code to anyone who asks.
 */
export const shield = scene((v) => ({
  caption: "Security",
  line: "Security is a set of habits that keep an account yours: a strong password, a second step at sign-in, and care about where you type them.",
  parts: [
    {
      label: "A locked account",
      note: "Your account sits behind a lock that only you should open.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const sw = Math.min(b.w * 0.3, b.h * 0.66);
        const sh = Math.min(b.h - 6, sw * 1.25);
        const reach = Math.max(0, b.w / 2 - sw / 2 - 14);
        // the shield moves to meet the pointer
        const cx = b.cx + k * clamp((f.mx - b.cx) / Math.max(1, b.w / 2), -1, 1) * reach * 0.7;
        const y0 = b.cy - sh / 2;
        ctx.beginPath();
        ctx.moveTo(cx - sw / 2, y0);
        ctx.lineTo(cx + sw / 2, y0);
        ctx.lineTo(cx + sw / 2, y0 + sh * 0.55);
        ctx.quadraticCurveTo(cx + sw / 2, y0 + sh * 0.86, cx, y0 + sh);
        ctx.quadraticCurveTo(cx - sw / 2, y0 + sh * 0.86, cx - sw / 2, y0 + sh * 0.55);
        ctx.closePath();
        ctx.fillStyle = rgba(pal.accent, 0.1 + 0.14 * k);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, p);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.beginPath();
        ctx.arc(cx, y0 + sh * 0.42, Math.max(0, sw * 0.1), Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.gold, 0.85);
        rr(ctx, cx - sw * 0.16, y0 + sh * 0.42, sw * 0.32, sh * 0.24, 2);
        ctx.fill();
        // attempts from both sides, each turned away at the edge
        for (let s = 0; s < 2; s++) {
          const side = s ? 1 : -1;
          const xs = s ? b.r - 1 : b.x + 1;
          const xe = cx + side * (sw / 2 + 7);
          for (let i = 0; i < 3; i++) {
            const y = y0 + sh * (0.15 + 0.2 * i);
            ctx.strokeStyle = rgba(ALERT, 0.3);
            dseg(ctx, xs, y, xe, y, 2, 5);
            runner(f, xs, y, xe, y, t * 0.25 * v.speed + i * 0.31 + s * 0.5 + v.a, ALERT);
            ctx.strokeStyle = rgba(ALERT, 0.8);
            cross(ctx, xe, y, 2.5);
          }
        }
        if (b.w > 150) put(f, b, "turned away", b.x + 1, b.y + 8, "left", ALERT);
        put(f, b, "yours", b.r - 1, b.b - 1, "right", pal.accent);
      },
    },
    {
      label: "A strong password",
      note: "Long and unique: never one you already use on another site.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 10;
        // the pointer types: further right, a longer and stronger password
        const s = px(f, b, k, 0.6 + 0.3 * Math.sin(t * 0.4 * v.speed + v.phase));
        const m = Math.round(lerp(3, n, s) * p);
        const x0 = b.x + 2;
        const W = b.w - 4;
        const cw = W / n;
        const cell = Math.max(3, Math.min(cw - 3, b.h * 0.34));
        const cy = b.y + b.h * 0.42;
        const barY = b.b - 17;
        const col = s < 0.5 ? mix(ALERT, AMBER, s * 2) : mix(AMBER, pal.emerald, s * 2 - 1);
        for (let i = 0; i < n; i++) {
          const x = x0 + i * cw + (cw - cell) / 2;
          const on = i < m;
          ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, on ? 0.9 : 0.4);
          rr(ctx, x, cy - cell / 2, cell, cell, 2);
          ctx.stroke();
          if (on) {
            ctx.fillStyle = rgba(pal.ink, 0.85);
            disc(ctx, x + cell / 2, cy, cell * 0.2);
          }
        }
        ctx.strokeStyle = rgba(pal.accent, 0.9);
        seg(ctx, x0 + Math.min(m, n) * cw, cy - cell / 2, x0 + Math.min(m, n) * cw, cy + cell / 2);
        ctx.strokeStyle = rgba(pal.line, 1);
        rr(ctx, x0, barY, W, 5, 2.5);
        ctx.stroke();
        ctx.fillStyle = rgba(col, 0.9);
        rr(ctx, x0, barY, W * s * p, 5, 2.5);
        ctx.fill();
        put(f, b, "password", x0, b.y + 8, "left");
        put(f, b, "weak", x0, b.b - 1, "left", ALERT);
        put(f, b, "strong", b.r - 2, b.b - 1, "right", pal.emerald);
      },
    },
    {
      label: "A second step",
      note: "A code from your own device confirms it is really you.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const y = b.y + b.h * 0.6;
        const x0 = b.x + 8;
        const x1 = b.x + b.w * 0.36;
        const x2 = b.x + b.w * 0.66;
        const aw = clamp(b.u * 0.2, 8, 30);
        const xr = b.r - 4 - aw;
        const gh = clamp(b.h * 0.34, 10, 60);
        // bringing the pointer to the second gate is your device answering: it opens
        const o2 = lerp(0.5 + 0.45 * Math.sin(t * 0.6 * v.speed + v.phase), clamp(1.15 - Math.abs(f.mx - x2) / Math.max(1, b.w * 0.25)), k) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        seg(ctx, x0, y, xr, y);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ring(ctx, x0, y, 4);
        seg(ctx, x0 + 4, y, x0 + 13, y);
        seg(ctx, x0 + 10, y, x0 + 10, y + 3);
        ctx.lineWidth = 3;
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        seg(ctx, x1, y - gh / 2, x1, y - gh * 0.4);
        seg(ctx, x1, y + gh * 0.4, x1, y + gh / 2);
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        seg(ctx, x2, y - gh / 2, x2, y - gh * 0.4 * o2);
        seg(ctx, x2, y + gh * 0.4 * o2, x2, y + gh / 2);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.emerald, 0.15 + 0.5 * o2);
        rr(ctx, xr, y - aw / 2, aw, aw, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.emerald, 0.95);
        ctx.stroke();
        runner(f, x0 + 13, y, lerp(x2 - 5, xr, smooth(o2)), y, t * 0.3 * v.speed + v.a, pal.accent, 2.6);
        // the device, held above its gate
        const pw = clamp(b.w * 0.12, 22, 44);
        const ph = Math.min(pw * 1.5, y - gh / 2 - b.y - 16);
        if (ph > 12) {
          ctx.strokeStyle = rgba(pal.teal, 0.9);
          rr(ctx, x2 - pw / 2, b.y + 12, pw, ph, 3);
          ctx.stroke();
          const cc = (pw - 8) / 4;
          ctx.fillStyle = rgba(pal.teal, 0.3 + 0.5 * o2);
          for (let i = 0; i < 4; i++) ctx.fillRect(x2 - pw / 2 + 4 + i * cc + 1, b.y + 12 + ph * 0.4, Math.max(0, cc - 2), Math.max(2, ph * 0.2));
          ctx.strokeStyle = rgba(pal.teal, 0.6);
          dseg(ctx, x2, b.y + 12 + ph, x2, y - gh / 2, 2, 3);
        }
        put(f, b, "password", x1, y + gh / 2 + 11, "center", pal.accent);
        put(f, b, "device", x2, b.y + 8, "center", pal.teal);
        put(f, b, "in", xr + aw / 2, y - aw / 2 - 5, "center", pal.emerald, 0.3 + 0.7 * o2);
      },
    },
    {
      label: "Check the link",
      note: "Read the address carefully before typing anything into a page.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const rh = b.h / 2;
        const bh = clamp(rh - 14, 8, 30);
        const x0 = b.x + 1;
        const W = b.w - 20;
        // the pointer reads along the address, letter by letter
        const u = px(f, b, k, 0.5 + 0.4 * Math.sin(t * 0.4 * v.speed + v.phase));
        const near = clamp(1 - Math.abs(u - 0.4) * 4);
        for (let row = 0; row < 2; row++) {
          const ok = row === 0;
          const col = ok ? pal.emerald : ALERT;
          const y = b.y + rh * row + 11;
          const my = y + bh / 2;
          ctx.strokeStyle = rgba(mix(pal.ink3, col, 0.5), 0.9);
          rr(ctx, x0, y, W * p, bh, bh / 2);
          ctx.stroke();
          const ls = bh * 0.34;
          ctx.strokeStyle = rgba(col, 0.9);
          ctx.beginPath();
          ctx.arc(x0 + 6 + ls / 2, my - ls * 0.1, Math.max(0, ls * 0.34), Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = rgba(col, 0.9);
          ctx.fillRect(x0 + 6, my - ls * 0.1, ls, ls * 0.7);
          const bx = x0 + 11 + ls;
          const avail = Math.max(0, W - (bx - x0) - 7);
          let xx = bx;
          for (let i = 0; i < ADDRESS.length; i++) {
            const bw = avail * (ADDRESS[i] ?? 0.2);
            const odd = !ok && i === 1;
            ctx.lineWidth = clamp(bh * 0.2, 2, 4);
            ctx.strokeStyle = rgba(odd ? mix(pal.ink2, ALERT, 0.4 + 0.6 * near) : pal.ink2, 0.85);
            if (odd) {
              // one part of the lookalike is not quite the same
              seg(ctx, xx, my, xx + bw * 0.4, my);
              seg(ctx, xx + bw * 0.52, my - 1.5, xx + bw * 0.6, my + 1.5);
              seg(ctx, xx + bw * 0.72, my, xx + bw - 3, my);
              ctx.lineWidth = 1.4;
              ctx.strokeStyle = rgba(AMBER, 0.4 + 0.6 * near);
              seg(ctx, xx, y + bh - 2.5, xx + bw - 3, y + bh - 2.5);
            } else seg(ctx, xx, my, xx + Math.max(0, bw - 3), my);
            xx += bw + avail * 0.03;
          }
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(pal.accent, 0.9);
          seg(ctx, lerp(bx, bx + avail, u), y + 2, lerp(bx, bx + avail, u), y + bh - 2);
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.lineWidth = 2;
          if (ok) tick(ctx, b.r - 8, my, 4);
          else cross(ctx, b.r - 8, my, 3.5);
          ctx.lineWidth = 1.4;
          put(f, b, ok ? "genuine" : "lookalike", x0 + 2, y - 3, "left", col);
        }
      },
    },
    {
      label: "Never share a code",
      note: "Nobody genuine will ever ask for your password or your code.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const y = b.cy - 2;
        const bw = clamp(b.w * 0.24, 24, 120);
        const bh = clamp(b.h * 0.4, 14, 76);
        const ax = b.x + 2;
        const wall = b.cx;
        const home = b.r - bw - 2;
        // drag the code towards whoever asks: it stops at the line and goes no further
        const cx = lerp(home, Math.min(home, wall + 6), k * clamp(1 - (f.mx - b.x) / Math.max(1, b.w)));
        ctx.strokeStyle = rgba(ALERT, 0.85);
        rr(ctx, ax, y - bh / 2, bw, bh, 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + 8, y + bh / 2);
        ctx.lineTo(ax + 4, y + bh / 2 + 5);
        ctx.lineTo(ax + 14, y + bh / 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(ALERT, 0.4);
        dseg(ctx, ax + bw + 2, y, wall - 3, y, 2, 4);
        runner(f, ax + bw + 2, y, wall - 3, y, t * 0.3 * v.speed + v.a, ALERT);
        ctx.strokeStyle = rgba(pal.ink, 0.9 * p);
        ctx.lineWidth = 2.6;
        seg(ctx, wall, b.y + 11, wall, b.b - 12);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.accent, 0.12 + 0.12 * k);
        rr(ctx, cx, y - bh / 2, bw, bh, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        const cc = (bw - 10) / 4;
        ctx.fillStyle = rgba(pal.accent, 0.65);
        for (let i = 0; i < 4; i++) {
          rr(ctx, cx + 5 + i * cc + 1, y - 3, cc - 2, 6, 1);
          ctx.fill();
        }
        put(f, b, "code?", ax + bw / 2, y + 3.5, "center", ALERT);
        put(f, b, "asks", ax + bw / 2, b.b - 1, "center", ALERT);
        put(f, b, "never", wall, b.y + 8, "center", pal.ink);
        put(f, b, "yours", cx + bw / 2, b.b - 1, "center", pal.accent);
      },
    },
  ],
}));

/**
 * DOCUMENTS, in five chapters: the terms written down, reading all of them,
 * the clauses that deserve the closest look, agreeing knowingly, and keeping a
 * copy for when the terms change.
 */
export const paper = scene((v) => ({
  caption: "Documents",
  line: "Documents set out what you and the firm agree to, so read them before you accept and keep a copy.",
  parts: [
    {
      label: "The terms, written down",
      note: "Written terms are what both you and the firm rely on.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const sh = Math.max(10, b.h - 4);
        const sw = Math.min(b.w * 0.44, sh * 0.82);
        const x = b.cx - sw / 2;
        const y = b.y + 2;
        sheet(f, x + 5, y + 3, sw, sh - 3, pal.ink3, 0.6);
        sheet(f, x, y, sw, sh - 4, pal.ink2);
        const rows = clamp(Math.floor((sh - 28) / 7), 1, 12);
        const gap = Math.max(2, (sh - 28) / rows);
        // the pointer reads down the page, a line at a time
        const r = clamp(Math.floor(py(f, b, k, 0.45 + 0.35 * Math.sin(t * 0.35 * v.speed + v.phase)) * rows), 0, rows - 1);
        ctx.fillStyle = rgba(pal.accent, 0.16 + 0.2 * k);
        ctx.fillRect(x + 3, y + 18 + r * gap - gap * 0.4, Math.max(0, sw - 6), gap * 0.8);
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.lineWidth = 2.4;
        seg(ctx, x + 6, y + 9, x + 6 + Math.max(0, sw - 12) * 0.5 * p, y + 9);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        rules(ctx, x + 6, y + 18, sw - 12, rows, gap, v.a * 6, p);
        // both sides rest on the same page
        for (let i = 0; i < 2; i++) {
          const col = i ? pal.gold : pal.accent;
          const tx = i ? b.r - 1 : b.x + 1;
          const ex = i ? x + sw + 8 : x - 3;
          ctx.strokeStyle = rgba(col, 0.5);
          seg(ctx, tx, b.cy, ex, b.cy);
          runner(f, tx, b.cy, ex, b.cy, t * 0.25 * v.speed + i * 0.5 + v.b, col);
          put(f, b, i ? "the firm" : "you", tx, b.cy - 6, i ? "right" : "left", col);
        }
      },
    },
    {
      label: "Read every part",
      note: "Reading it through is the only way to know what it says.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const sh = Math.max(10, b.h - 4);
        const sw = b.w * 0.58;
        const x = b.x + 2;
        const y = b.y + 2;
        sheet(f, x, y, sw, sh, pal.ink2);
        const rows = clamp(Math.floor((sh - 14) / 7), 2, 16);
        const gap = (sh - 14) / rows;
        // the pointer is the reader's place on the page
        const r = py(f, b, k, 0.5 + 0.38 * Math.sin(t * 0.35 * v.speed + v.phase)) * p;
        for (let i = 0; i < rows; i++) {
          const yy = y + 10 + i * gap;
          const done = (i + 0.5) / rows <= r;
          ctx.strokeStyle = rgba(done ? pal.accent : pal.ink3, done ? 0.9 : 0.45);
          seg(ctx, x + 7, yy, x + 7 + Math.max(0, sw - 16) * (0.6 + 0.4 * Math.abs(Math.sin(i * 2.4 + v.a * 6))), yy);
        }
        const rx = x + sw + clamp(b.w * 0.05, 6, 20);
        const yr = y + 4 + (sh - 8) * r;
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, rx, y + 4, rx, y + sh - 4);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 3;
        seg(ctx, rx, y + 4, rx, yr);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.moveTo(rx + 3, yr);
        ctx.lineTo(rx + 9, yr - 4);
        ctx.lineTo(rx + 9, yr + 4);
        ctx.closePath();
        ctx.fill();
        if (r > 0.18) put(f, b, "read", rx + 12, lerp(y + 4, yr, 0.5) + 3, "left", pal.accent);
        if (r < 0.82) put(f, b, "unread", rx + 12, lerp(yr, y + sh - 4, 0.5) + 3, "left");
      },
    },
    {
      label: "The clauses that matter",
      note: "Costs, risks and how to complain deserve the closest look.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const sh = Math.max(10, b.h - 4);
        const sw = b.w * 0.5;
        const x = b.x + 2;
        const y = b.y + 2;
        sheet(f, x, y, sw, sh, pal.ink2);
        // the pointer picks the nearest clause; left alone, each takes its turn
        const sel = k > 0.02 ? pickY(f, b, 3) : Math.floor(t * 0.22 * v.speed + v.a * 3) % 3;
        const g2 = clamp(sh * 0.05, 2.5, 7);
        for (let i = 0; i < 3; i++) {
          const cy = y + sh * (0.22 + 0.29 * i);
          const on = i === sel;
          const col = on ? AMBER : pal.ink3;
          ctx.strokeStyle = rgba(col, on ? 1 : 0.5);
          ctx.lineWidth = on ? 2 : 1.4;
          seg(ctx, x + 7, cy - g2, x + 7 + Math.max(0, sw - 17) * p, cy - g2);
          seg(ctx, x + 7, cy + g2, x + 7 + Math.max(0, sw - 17) * 0.7 * p, cy + g2);
          ctx.lineWidth = 1.4;
          seg(ctx, x + sw + 4, cy - g2 - 2, x + sw + 4, cy + g2 + 2);
          seg(ctx, x + sw + 4, cy, x + sw + 10, cy);
          if (on) runner(f, x + 7, cy - g2, x + sw - 10, cy - g2, t * 0.35 * v.speed + v.b, AMBER);
          put(f, b, CLAUSES[i] ?? "", x + sw + 13, cy + 3.5, "left", on ? AMBER : pal.ink3);
        }
      },
    },
    {
      label: "Agree, knowingly",
      note: "Ticking the box means you accept what is written there.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer draws the signature out, from left to right
        const s = px(f, b, k, 0.78 + 0.18 * Math.sin(t * 0.5 * v.speed + v.phase)) * p;
        const done = smooth((s - 0.55) * 4);
        const bs = clamp(b.h * 0.2, 9, 22);
        const bx = b.x + 3;
        const by = b.y + 12;
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        rr(ctx, bx, by, bs, bs, 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.emerald, done);
        ctx.lineWidth = 2;
        tick(ctx, bx + bs / 2, by + bs / 2, bs * 0.3);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        seg(ctx, bx + bs + 7, by + bs * 0.3, lerp(bx + bs + 7, b.r - 6, p), by + bs * 0.3);
        seg(ctx, bx + bs + 7, by + bs * 0.75, lerp(bx + bs + 7, b.r - 6, 0.6 * p), by + bs * 0.75);
        const sy = b.b - 14;
        const x0 = b.x + 3;
        const x1 = b.r - 4;
        const amp = clamp((sy - by - bs - 6) * 0.45, 2, 18);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, x0, sy, x1, sy);
        const N = 48;
        let ex = x0 + 4;
        let ey = sy - 2;
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        for (let i = 1; i <= N * s; i++) {
          const u = i / N;
          ex = lerp(x0 + 4, x1 - 12, u);
          ey = sy - 2 - amp * Math.abs(Math.sin(u * 9 + v.a * 6)) * (0.4 + 0.6 * Math.sin(u * Math.PI));
          ctx.lineTo(ex, ey);
        }
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2.2;
        seg(ctx, ex, ey, ex + 6, Math.max(b.y + 1, ey - 9));
        ctx.lineWidth = 1.4;
        put(f, b, "accept", bx, b.y + 8, "left");
        put(f, b, "sign here", x0, b.b - 1, "left");
        put(f, b, "signed", x1, b.b - 1, "right", pal.emerald, done);
      },
    },
    {
      label: "Keep a copy",
      note: "Save what you agreed to, and look again when the terms change.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the copy travels with the pointer, from the page to the folder
        const s = px(f, b, k, 0.5 + 0.42 * Math.sin(t * 0.45 * v.speed + v.phase));
        const sh = Math.max(10, b.h - 26);
        const sw = Math.min(b.w * 0.26, sh * 0.8);
        const y = b.y + 13;
        const x0 = b.x + 2;
        const fw = sw * 1.3;
        const fx = b.r - fw - 2;
        const rows = clamp(Math.floor((sh - 14) / 7), 1, 9);
        const gap = (sh - 12) / rows;
        sheet(f, x0, y, sw, sh, pal.ink2);
        ctx.strokeStyle = rgba(pal.ink3, 0.55);
        rules(ctx, x0 + 5, y + 8, sw - 10, rows, gap, v.a * 6, p);
        // the line that has changed since you last read it
        ctx.strokeStyle = rgba(AMBER, 1);
        ctx.lineWidth = 2.2;
        seg(ctx, x0 + 5, y + 8 + gap * Math.floor(rows / 2), x0 + Math.max(5, sw - 7), y + 8 + gap * Math.floor(rows / 2));
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        rr(ctx, fx, y - 3, fw * 0.4, 7, 2);
        ctx.stroke();
        rr(ctx, fx, y + 3, fw, sh - 3, 3);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        dseg(ctx, x0 + sw + 3, y + sh + 2, fx - 3, y + sh + 2, 2, 4);
        runner(f, x0 + sw + 3, y + sh + 2, fx - 3, y + sh + 2, t * 0.25 * v.speed + v.b, pal.accent);
        const cx = lerp(x0 + sw * 0.3, fx + (fw - sw) / 2, s);
        const cy = y + 2 - Math.sin(s * Math.PI) * 6;
        sheet(f, cx, cy, sw, sh - 6, pal.accent);
        ctx.strokeStyle = rgba(pal.accent, 0.6);
        rules(ctx, cx + 5, cy + 8, sw - 10, Math.max(1, rows - 1), gap, v.a * 6, p);
        ctx.fillStyle = rgba(pal.surface, 0.8);
        rr(ctx, fx, y + sh * 0.45, fw, sh * 0.55, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.stroke();
        put(f, b, "updated", x0, b.y + 8, "left", AMBER);
        put(f, b, "copy", cx + sw / 2, b.b - 1, "center", pal.accent, clamp(1.6 - s * 2));
        put(f, b, "kept", fx + fw / 2, b.b - 1, "center", pal.gold);
      },
    },
  ],
}));

/**
 * LEARNING, in five chapters: an open book, lessons that rest on each other,
 * practice with pretend money, a journal of mistakes, and the shelf that is
 * never finished.
 */
export const book = scene((v) => ({
  caption: "Learning",
  line: "Learning comes first: understand how something works before you put money on it.",
  parts: [
    {
      label: "Start with the basics",
      note: "One idea at a time, in order, from the first page.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const hw = Math.min(b.w * 0.42, b.h * 1.2);
        const y0 = b.y + 9;
        const y1 = b.b - 13;
        const cx = b.cx;
        const rows = clamp(Math.floor((y1 - y0 - 12) / 7), 1, 12);
        const gap = Math.max(2, (y1 - y0 - 12) / rows);
        for (let i = 0; i < 2; i++) {
          const side = i ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(cx, y0 + 3);
          ctx.quadraticCurveTo(cx + side * hw * 0.5, y0 - 3, cx + side * hw, y0 + 1);
          ctx.lineTo(cx + side * hw, y1 - 2);
          ctx.quadraticCurveTo(cx + side * hw * 0.5, y1 - 5, cx, y1 + 1);
          ctx.closePath();
          ctx.fillStyle = rgba(pal.surface, 0.5);
          ctx.fill();
          ctx.strokeStyle = rgba(pal.ink2, 0.9);
          ctx.stroke();
          ctx.strokeStyle = rgba(pal.ink3, 0.55);
          rules(ctx, i ? cx + 8 : cx - hw + 6, y0 + 9, hw - 14, rows, gap, i * 2 + v.a * 6, p);
        }
        // the pointer turns the page: to the left it is read, to the right it is still to come
        const ang = Math.PI * (1 - px(f, b, k, 0.5 + 0.4 * Math.sin(t * 0.45 * v.speed + v.phase)));
        const tipx = cx + hw * Math.cos(ang) * p;
        const lift = Math.sin(ang) * Math.min(7, hw * 0.2);
        ctx.beginPath();
        ctx.moveTo(cx, y0 + 3);
        ctx.quadraticCurveTo(cx + (tipx - cx) * 0.5, y0 - 3 - lift, tipx, y0 + 1 - lift);
        ctx.lineTo(tipx, y1 - 2 - lift);
        ctx.quadraticCurveTo(cx + (tipx - cx) * 0.5, y1 - 5 - lift, cx, y1 + 1);
        ctx.closePath();
        ctx.fillStyle = rgba(pal.surface, 0.88);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.accent, 0.5);
        for (let i = 0; i < rows; i++) seg(ctx, cx + (tipx - cx) * 0.15, y0 + 9 + i * gap - lift * 0.5, cx + (tipx - cx) * 0.85, y0 + 9 + i * gap - lift * 0.8);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2;
        seg(ctx, cx, y0 + 3, cx, y1 + 1);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2.4;
        seg(ctx, cx + 3, y1 + 1, cx + 3, y1 + 8);
        ctx.lineWidth = 1.4;
        put(f, b, "read", cx - hw, b.b - 1, "left", pal.accent);
        put(f, b, "to come", cx + hw, b.b - 1, "right");
      },
    },
    {
      label: "One step at a time",
      note: "Each lesson rests on the one that came before it.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = LESSONS.length;
        const g = b.b - 3;
        const H = Math.max(8, b.h - 30);
        const cw = b.w / n;
        const sh = H / n;
        // the pointer climbs: the step it stands on, and everything beneath, is learnt
        const j = clamp(Math.floor(px(f, b, k, 0.5 + 0.42 * Math.sin(t * 0.3 * v.speed + v.phase)) * n), 0, n - 1);
        for (let i = 0; i < n; i++) {
          if (i > n * p) break;
          const hgt = sh * (i + 1);
          const x = b.x + i * cw;
          const done = i <= j;
          ctx.fillStyle = rgba(pal.accent, done ? 0.24 + 0.14 * k : 0.05);
          ctx.fillRect(x + 1, g - hgt, Math.max(1, cw - 2), hgt);
          ctx.strokeStyle = rgba(done ? pal.accent : pal.ink3, done ? 0.95 : 0.5);
          ctx.strokeRect(x + 1, g - hgt, Math.max(1, cw - 2), hgt);
        }
        const mx = b.x + (j + 0.5) * cw;
        const my = g - sh * (j + 1) - 6 - 1.5 * Math.sin(t * 1.2 * v.speed + v.phase);
        ctx.fillStyle = rgba(pal.gold, 1);
        ctx.beginPath();
        ctx.moveTo(mx, my - 4);
        ctx.lineTo(mx + 4, my);
        ctx.lineTo(mx, my + 4);
        ctx.lineTo(mx - 4, my);
        ctx.closePath();
        ctx.fill();
        if (j < n - 1) {
          ctx.strokeStyle = rgba(pal.ink3, 0.6);
          arrow(ctx, mx + 7, my, mx + cw - 7, my - sh, 3.5);
        }
        put(f, b, LESSONS[j] ?? "", mx, my - 8, "center", pal.gold);
      },
    },
    {
      label: "Practise without risk",
      note: "A demo account lets you try with pretend money first.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 1;
        const y0 = b.y + 12;
        const W = b.w - 2;
        const Hh = Math.max(8, b.h - 14);
        ctx.strokeStyle = rgba(pal.gold, 0.6);
        ctx.save();
        ctx.setLineDash([5, 4]);
        rr(ctx, x0, y0, W, Hh, 5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        const xa = x0 + 5;
        const xb = x0 + W - 5;
        const yf = (u: number) => y0 + Hh / 2 - wander(u * 6 + t * 0.15 * v.speed, v.phase) * Hh * 0.32;
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, xa, xb, 44, p, yf);
        const xe = lerp(xa, xb, 0.3);
        const ye = yf(0.3);
        // the pointer closes the pretend trade wherever it is: a gain or a loss, and nothing spent
        const up = clamp(px(f, b, k, 0.72 + 0.15 * Math.sin(t * 0.4 * v.speed + v.phase)), 0.05, 1) * p;
        const xp = lerp(xa, xb, up);
        const yp = yf(up);
        const col = yp < ye ? pal.emerald : ALERT;
        ctx.strokeStyle = rgba(pal.ink3, 0.3);
        seg(ctx, xp, y0 + 2, xp, y0 + Hh - 2);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        dseg(ctx, xe, ye, xp, ye, 2, 3);
        ctx.strokeStyle = rgba(col, 0.95);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, xp, ye, xp, yp);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.moveTo(xe, ye - 5);
        ctx.lineTo(xe + 4.5, ye + 3);
        ctx.lineTo(xe - 4.5, ye + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = rgba(col, 1);
        ctx.fillRect(xp - 3, yp - 3, 6, 6);
        put(f, b, "demo", x0 + 2, b.y + 8, "left", pal.gold);
        if (b.w > 190) put(f, b, "pretend money", b.r - 1, b.b - 5, "right");
        put(f, b, yp < ye ? "gain" : "loss", xp + (xp > b.cx ? -7 : 7), clamp(Math.min(ye, yp) - 5, y0 + 10, b.b - 3), xp > b.cx ? "right" : "left", col);
      },
    },
    {
      label: "Review your mistakes",
      note: "Notes on what went wrong teach more than the wins do.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = clamp(Math.floor(b.h / 15), 3, 6);
        const rh = b.h / n;
        const x0 = b.x + 3;
        const xr = b.r - clamp(b.w * 0.3, 44, 96);
        const first = v.dir > 0 ? 0 : 1;
        // the pointer opens an entry of the journal: what it has to teach is written beside it
        const sel = k > 0.02 ? pickY(f, b, n) : 1 - first;
        for (let i = 0; i < n; i++) {
          const y = b.y + rh * (i + 0.5);
          const ok = i % 2 === first;
          const on = i === sel;
          const len = Math.max(0, xr - x0 - 16) * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7 + v.b * 6))) * p;
          ctx.lineWidth = 2;
          ctx.strokeStyle = rgba(ok ? pal.emerald : ALERT, 0.95);
          if (ok) tick(ctx, x0 + 5, y, 3.5);
          else cross(ctx, x0 + 5, y, 3);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(pal.ink3, on ? 0.9 : 0.45);
          seg(ctx, x0 + 16, y - (on ? 2 : 0), x0 + 16 + len, y - (on ? 2 : 0));
          if (on) {
            const col = ok ? pal.emerald : AMBER;
            ctx.strokeStyle = rgba(col, 0.95);
            seg(ctx, x0 + 16, y + 3, x0 + 16 + len * 0.6, y + 3);
            seg(ctx, xr + 4, y - 5, xr + 4, y + 5);
            runner(f, x0 + 16, y + 3, xr + 4, y + 3, t * 0.35 * v.speed + v.a, col);
            put(f, b, ok ? "repeat" : "learn", b.r - 1, y + 3.5, "right", col);
          }
        }
      },
    },
    {
      label: "Keep learning",
      note: "Markets change, and no course removes the risk of loss.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 6;
        const g = b.b - 13;
        const H = Math.max(8, g - b.y - 4);
        const cw = (b.w * 0.62) / n;
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        ctx.lineWidth = 2.4;
        seg(ctx, b.x, g + 1, b.r, g + 1);
        ctx.lineWidth = 1.4;
        for (let i = 0; i < n; i++) {
          const hgt = H * (0.55 + 0.4 * Math.abs(Math.sin(i * 1.9 + v.a * 6))) * p;
          const ww = cw * (0.62 + 0.25 * Math.abs(Math.sin(i * 3.1 + v.b * 6)));
          const x = b.x + 2 + i * cw;
          const c = hue(pal, i);
          ctx.fillStyle = rgba(c, 0.28);
          ctx.fillRect(x, g - hgt, ww, hgt);
          ctx.strokeStyle = rgba(c, 0.95);
          ctx.strokeRect(x, g - hgt, ww, hgt);
          seg(ctx, x + 2, g - hgt * 0.75, x + Math.max(2, ww - 2), g - hgt * 0.75);
        }
        // the pointer carries the next book to its place on the shelf
        const slot = b.x + 2 + n * cw;
        const far = Math.max(slot, b.r - cw - 2);
        const away = px(f, b, k, 0.5 + 0.45 * Math.sin(t * 0.4 * v.speed + v.phase));
        const nx = lerp(slot, far, away);
        const nh = H * 0.8;
        const nw = cw * 0.8;
        const lift = away * Math.min(8, H * 0.15);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        drect(ctx, slot, g - nh, nw, nh, 1);
        ctx.fillStyle = rgba(pal.accent, 0.35 + 0.25 * k);
        ctx.fillRect(nx, g - nh - lift, nw, nh);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 2;
        ctx.strokeRect(nx, g - nh - lift, nw, nh);
        ctx.lineWidth = 1.4;
        put(f, b, "learnt", b.x + 1, b.b - 1, "left");
        put(f, b, "next", nx + nw / 2, b.b - 1, "center", pal.accent);
      },
    },
  ],
}));

/**
 * DEFINITIONS, in five chapters: a word you do not know, looking it up, the
 * plain words it becomes, an example of it in use, and the other terms it
 * leads to.
 */
export const magnifier = scene((v) => ({
  caption: "Definitions",
  line: "A definition turns an unfamiliar word into plain language, so look a term up the moment it stops you.",
  parts: [
    {
      label: "An unfamiliar term",
      note: "A word in the text that you do not yet know.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const rows = clamp(Math.floor((b.h - 4) / 11), 3, 10);
        const gap = (b.h - 4) / rows;
        const tr = clamp(Math.floor(rows * (0.35 + 0.3 * v.a)), 0, rows - 1);
        const x0 = b.x + 2;
        const W = b.w - 4;
        const tw = clamp(W * 0.2, 14, 70);
        const tx = x0 + (W - tw) * (0.3 + 0.3 * v.b);
        const ty = b.y + 2 + gap * (tr + 0.5);
        const r = clamp(b.u * 0.2, 9, 30);
        // the lens goes where the pointer goes; left alone, it rests on the term
        const lx = clamp(lerp(tx + tw / 2 + Math.sin(t * 0.5 * v.speed + v.phase) * tw * 0.25, f.mx, k), b.x + r + 1, b.r - r * 1.7);
        const ly = clamp(lerp(ty, f.my, k), b.y + r + 1, b.b - r * 1.7);
        const text = (a: number) => {
          ctx.strokeStyle = rgba(pal.ink3, a);
          for (let i = 0; i < rows; i++) {
            const y = b.y + 2 + gap * (i + 0.5);
            seg(ctx, x0, y, x0 + W * (0.7 + 0.3 * Math.abs(Math.sin(i * 2.4 + v.c * 6))) * p, y);
          }
          ctx.strokeStyle = rgba(AMBER, 1);
          ctx.lineWidth = 3;
          seg(ctx, tx, ty, tx + tw, ty);
          ctx.lineWidth = 1.4;
        };
        text(0.5);
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = rgba(pal.surface, 0.9);
        ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
        ctx.translate(lx, ly);
        ctx.scale(1.6, 1.6);
        ctx.translate(-lx, -ly);
        text(0.95);
        ctx.restore();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 2;
        ring(ctx, lx, ly, r);
        ctx.strokeStyle = rgba(pal.ink2, 0.95);
        ctx.lineWidth = 3;
        seg(ctx, lx + r * 0.71, ly + r * 0.71, lx + r * 1.5, ly + r * 1.5);
        ctx.lineWidth = 1.4;
        put(f, b, "term", tx + tw + 6, ty + 3.5, "left", AMBER);
      },
    },
    {
      label: "Look it up",
      note: "The glossary lists every term in alphabetical order.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = clamp(Math.floor(b.h / 13), 3, LETTERS.length);
        const rh = b.h / n;
        // the pointer runs down the list; left alone, the search moves through it
        const sel = k > 0.02 ? pickY(f, b, n) : Math.floor(t * 0.25 * v.speed + v.a * 8) % n;
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, b.x + 15, b.y, b.x + 15, b.b);
        for (let i = 0; i < n; i++) {
          const y = b.y + rh * (i + 0.5);
          const on = i === sel;
          if (on) {
            ctx.fillStyle = rgba(pal.accent, 0.12 + 0.1 * k);
            rr(ctx, b.x + 18, y - rh * 0.42, b.w - 19, rh * 0.84, 3);
            ctx.fill();
            ctx.strokeStyle = rgba(pal.accent, 0.7);
            ctx.stroke();
          }
          const tw = clamp(b.w * (0.12 + 0.08 * Math.abs(Math.sin(i * 2.1 + v.b * 6))), 8, 80);
          const dx = b.x + 23 + tw + 8;
          const dw = Math.max(0, b.r - 7 - dx) * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.3 + v.c * 6))) * p;
          ctx.strokeStyle = rgba(on ? pal.ink : pal.ink2, on ? 0.95 : 0.7);
          ctx.lineWidth = 2.4;
          seg(ctx, b.x + 23, y, b.x + 23 + tw, y);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(pal.ink3, on ? 0.9 : 0.45);
          seg(ctx, dx, y, dx + dw, y);
          if (on) runner(f, dx, y, dx + dw, y, t * 0.4 * v.speed + v.a, pal.accent);
          put(f, b, LETTERS[i] ?? "", b.x + 7, y + 3.5, "center", on ? pal.accent : pal.ink3);
        }
      },
    },
    {
      label: "Plain words",
      note: "A good definition uses words you already know.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer draws the line across: what is behind it has been put plainly
        const s = px(f, b, k, 0.5 + 0.38 * Math.sin(t * 0.4 * v.speed + v.phase)) * p;
        const rows = clamp(Math.floor((b.h - 14) / 12), 2, 7);
        const gap = (b.h - 14) / rows;
        const x0 = b.x + 2;
        const x1 = b.r - 2;
        const dx = lerp(x0, x1, s);
        const step = Math.max(5, b.w / 56);
        const amp = clamp(gap * 0.32, 1.5, 6);
        for (let i = 0; i < rows; i++) {
          const y = b.y + 14 + gap * (i + 0.5);
          const end = lerp(x0, x1, 0.7 + 0.3 * Math.abs(Math.sin(i * 2.4 + v.a * 6)));
          ctx.strokeStyle = rgba(pal.accent, 0.9);
          if (Math.min(dx, end) > x0) seg(ctx, x0, y, Math.min(dx, end), y);
          if (end > dx) {
            ctx.strokeStyle = rgba(pal.ink3, 0.65);
            ctx.beginPath();
            ctx.moveTo(dx, y);
            let q = 0;
            for (let x = dx + step; x <= end; x += step) {
              q++;
              ctx.lineTo(x, y + (q % 2 ? -1 : 1) * amp * (0.5 + 0.5 * Math.abs(Math.sin(q * 1.7 + i))));
            }
            ctx.stroke();
          }
        }
        ctx.strokeStyle = rgba(pal.gold, 1);
        seg(ctx, dx, b.y + 11, dx, b.b - 1);
        ctx.fillStyle = rgba(pal.gold, 1);
        rr(ctx, dx - 3, b.cy, 6, 14, 3);
        ctx.fill();
        put(f, b, "plain", x0, b.y + 8, "left", pal.accent);
        put(f, b, "jargon", x1, b.y + 8, "right");
      },
    },
    {
      label: "See it in use",
      note: "An example shows what the word means in practice.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 4;
        const mid = (u: number) => b.cy + 4 - wander(u * 5 + t * 0.15 * v.speed, v.phase) * b.h * 0.16;
        const half = (u: number) => b.h * (0.07 + 0.06 * (0.5 + 0.5 * Math.sin(u * 7 + v.a * 6)));
        // the pointer moves along the example: the term is pointed out wherever it stands
        const up = px(f, b, k, 0.55 + 0.3 * Math.sin(t * 0.4 * v.speed + v.phase)) * p;
        const xp = lerp(x0, x1, up);
        const ya = mid(up) - half(up);
        const yb = mid(up) + half(up);
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        trace(ctx, x0, x1, 40, p, (u) => mid(u) - half(u));
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        trace(ctx, x0, x1, 40, p, (u) => mid(u) + half(u));
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        dseg(ctx, xp, b.y + 11, xp, ya - 3, 2, 3);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, xp, ya, xp, yb);
        ctx.lineWidth = 1.4;
        seg(ctx, xp - 4, ya, xp + 4, ya);
        seg(ctx, xp - 4, yb, xp + 4, yb);
        put(f, b, "the term", xp, b.y + 8, "center", pal.gold);
        put(f, b, "example", x0, b.b - 1, "left");
      },
    },
    {
      label: "Linked terms",
      note: "One term leads to others; follow them as you go.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const nw = clamp(b.w * 0.2, 18, 76);
        const nh = clamp(b.h * 0.17, 7, 20);
        const nx = (i: number) => clamp(b.x + nw / 2 + (b.w - nw) * (LINKED[i]?.[0] ?? 0.5) + Math.sin(t * 0.5 * v.speed + i * 1.9 + v.phase) * 2, b.x + nw / 2, b.r - nw / 2);
        const ny = (i: number) => clamp(b.y + nh / 2 + (b.h - nh) * (LINKED[i]?.[1] ?? 0.5) + Math.cos(t * 0.4 * v.speed + i * 2.3 + v.phase) * 2, b.y + nh / 2 + 1, b.b - nh / 2 - 1);
        // the pointer follows a link: the nearest term and the ones it leads to light up
        let sel = 0;
        if (k > 0.02) {
          let best = Infinity;
          for (let i = 0; i < LINKED.length; i++) {
            const d = Math.hypot(nx(i) - f.mx, ny(i) - f.my);
            if (d < best) {
              best = d;
              sel = i;
            }
          }
        }
        for (let i = 0; i < LINKS.length; i++) {
          const a = LINKS[i]?.[0] ?? 0;
          const z = LINKS[i]?.[1] ?? 0;
          const on = a === sel || z === sel;
          ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, on ? 0.9 : 0.4);
          seg(ctx, nx(a), ny(a), lerp(nx(a), nx(z), p), lerp(ny(a), ny(z), p));
          if (on) runner(f, nx(a === sel ? a : z), ny(a === sel ? a : z), nx(a === sel ? z : a), ny(a === sel ? z : a), t * 0.3 * v.speed + i * 0.17 + v.a, pal.accent);
        }
        for (let i = 0; i < LINKED.length; i++) {
          const on = i === sel;
          ctx.fillStyle = rgba(mix(pal.surface, pal.accent, on ? 0.2 : 0), 0.92);
          rr(ctx, nx(i) - nw / 2, ny(i) - nh / 2, nw, nh, 3);
          ctx.fill();
          ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, on ? 1 : 0.7);
          ctx.stroke();
          ctx.strokeStyle = rgba(on ? pal.ink : pal.ink2, 0.8);
          seg(ctx, nx(i) - nw * 0.3, ny(i), nx(i) + nw * 0.3, ny(i));
        }
        put(f, b, "term", nx(sel), ny(sel) - nh / 2 - 4, "center", pal.accent);
      },
    },
  ],
}));

/**
 * QUESTIONS, in five chapters: something unclear, the list of questions asked
 * before, asking a person, what a clear answer looks like, and what to do when
 * the answer is not enough.
 */
export const question = scene((v) => ({
  caption: "Questions",
  line: "A question is the quickest way to an answer: look through the common ones first, then ask a person.",
  parts: [
    {
      label: "A question arises",
      note: "Something in the text is unclear, and that is normal.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const r = Math.max(3, Math.min((b.h - 8) / 3.7, b.w * 0.1));
        const qx = b.x + Math.max(r + 6, b.w * 0.2);
        const cy = b.y + 4 + r;
        const foot = cy + r * 2.45;
        const lw = clamp(r * 0.3, 2, 6);
        // the mark leans towards the pointer
        const lean = k * clamp((f.mx - qx) / Math.max(1, b.w), -0.5, 0.5) * 0.5 + 0.04 * Math.sin(t * 0.8 * v.speed + v.phase);
        ctx.save();
        ctx.translate(qx, foot);
        ctx.rotate(lean);
        ctx.translate(-qx, -foot);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(qx, cy, r, Math.PI, Math.PI * lerp(1, 2.5, p));
        ctx.stroke();
        if (p > 0.9) seg(ctx, qx, cy + r, qx, cy + r * 1.7);
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, qx, foot, lw * 0.6);
        ctx.restore();
        ctx.lineWidth = 1.4;
        // the page beside it, with the piece that does not make sense
        const tx0 = qx + r + clamp(b.w * 0.08, 8, 40);
        const W = Math.max(0, b.r - 2 - tx0);
        const rows = clamp(Math.floor((b.h - 4) / 11), 3, 9);
        const gap = (b.h - 4) / rows;
        const hr = k > 0.02 ? pickY(f, b, rows) : Math.floor(rows / 2);
        for (let i = 0; i < rows; i++) {
          const y = b.y + 2 + gap * (i + 0.5);
          ctx.strokeStyle = rgba(pal.ink3, 0.55);
          if (i === hr) {
            seg(ctx, tx0, y, tx0 + W * 0.25 * p, y);
            seg(ctx, tx0 + W * 0.7, y, tx0 + W * lerp(0.7, 0.9, p), y);
            ctx.strokeStyle = rgba(AMBER, 0.95);
            drect(ctx, tx0 + W * 0.3, y - gap * 0.36, W * 0.35, gap * 0.72);
            ctx.strokeStyle = rgba(AMBER, 0.45);
            dseg(ctx, qx + r + 4, cy, tx0 + W * 0.3, y, 2, 4);
            runner(f, tx0 + W * 0.3, y, qx + r + 4, cy, t * 0.3 * v.speed + v.a, AMBER);
            put(f, b, "unclear", tx0 + W * 0.72, y + (i === 0 ? gap * 0.36 + 10 : -gap * 0.36 - 3), "left", AMBER);
          } else seg(ctx, tx0, y, tx0 + W * (0.6 + 0.4 * Math.abs(Math.sin(i * 2.4 + v.b * 6))) * p, y);
        }
      },
    },
    {
      label: "Common questions",
      note: "Most have been asked before, and are answered in the list.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const n = clamp(Math.floor(b.h / 17), 2, 5);
        // the pointer opens the question it is on
        const open = k > 0.02 ? pickY(f, b, n) : Math.floor(v.b * n) % n;
        const unit = b.h / (n + 1.3);
        let y = b.y;
        for (let i = 0; i < n; i++) {
          const on = i === open;
          const hh = unit * (on ? 2.3 : 1) - 3;
          const qy = y + unit * 0.5 - 1.5;
          rr(ctx, b.x + 1, y, b.w - 2, hh, 4);
          if (on) {
            ctx.fillStyle = rgba(pal.accent, 0.08 + 0.08 * k);
            ctx.fill();
          }
          ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, on ? 0.95 : 0.5);
          ctx.stroke();
          ctx.strokeStyle = rgba(pal.ink2, 0.9);
          seg(ctx, b.x + 9, qy, b.x + 9 + Math.max(0, b.w - 44) * (0.5 + 0.4 * Math.abs(Math.sin(i * 2.2 + v.a * 6))) * p, qy);
          ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, 0.9);
          ctx.beginPath();
          if (on) {
            ctx.moveTo(b.r - 16, qy - 1.5);
            ctx.lineTo(b.r - 12, qy + 2);
            ctx.lineTo(b.r - 8, qy - 1.5);
          } else {
            ctx.moveTo(b.r - 13.5, qy - 3.5);
            ctx.lineTo(b.r - 10, qy);
            ctx.lineTo(b.r - 13.5, qy + 3.5);
          }
          ctx.stroke();
          if (on) {
            ctx.strokeStyle = rgba(pal.accent, 0.75);
            rules(ctx, b.x + 9, qy + unit * 0.55, b.w - 34, 2, unit * 0.45, i + v.c * 6, p);
            if (unit >= 15 && b.w > 190) put(f, b, "answer", b.r - 8, qy + unit + 3.5, "right", pal.accent);
          }
          y += unit * (on ? 2.3 : 1);
        }
      },
    },
    {
      label: "Ask a person",
      note: "If the list does not cover it, send your question in.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const bw = clamp(b.w * 0.24, 24, 160);
        const bh = Math.max(14, Math.min(b.h * 0.5, bw * 0.8));
        const yT = b.cy - bh / 2 - 6;
        const xl = b.x + 1;
        const xr = b.r - 1 - bw;
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        rr(ctx, xl, yT, bw, bh, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xl + 8, yT + bh);
        ctx.lineTo(xl + 4, yT + bh + 5);
        ctx.lineTo(xl + 14, yT + bh);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        rr(ctx, xr, yT, bw, bh, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xr + bw - 8, yT + bh);
        ctx.lineTo(xr + bw - 4, yT + bh + 5);
        ctx.lineTo(xr + bw - 14, yT + bh);
        ctx.stroke();
        // someone is writing back
        ctx.fillStyle = rgba(pal.teal, 0.9);
        for (let i = 0; i < 3; i++) disc(ctx, xr + bw / 2 + (i - 1) * bw * 0.2, yT + bh / 2, clamp(bh * 0.09, 1.5, 4.5) * (0.75 + 0.25 * Math.sin(t * 1.4 * v.speed - i * 0.8 + v.phase)));
        const yOut = yT + bh * 0.32;
        const yBack = yT + bh * 0.72;
        const xa = xl + bw + 5;
        const xb = xr - 5;
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        arrow(ctx, xa, yOut, lerp(xa, xb, p), yOut, 4);
        arrow(ctx, xb, yBack, lerp(xb, xa, p), yBack, 4);
        runner(f, xb, yBack, xa, yBack, t * 0.25 * v.speed + v.b, pal.teal);
        // the pointer carries the question across
        const s = px(f, b, k, 0.5 + 0.42 * Math.sin(t * 0.6 * v.speed + v.phase));
        const ew = clamp(b.w * 0.06, 8, 20);
        const eh = ew * 0.66;
        const ex = lerp(xa + ew / 2, Math.max(xa + ew / 2, xb - ew / 2), s);
        ctx.fillStyle = rgba(pal.surface, 0.95);
        rr(ctx, ex - ew / 2, yOut - eh / 2, ew, eh, 1.5);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex - ew / 2, yOut - eh / 2);
        ctx.lineTo(ex, yOut + eh * 0.1);
        ctx.lineTo(ex + ew / 2, yOut - eh / 2);
        ctx.stroke();
        put(f, b, "?", xl + bw / 2, yT + bh / 2 + 3.5, "center", pal.accent);
        put(f, b, "you", xl + bw / 2, yT + bh + 17, "center", pal.accent);
        put(f, b, "support", xr + bw / 2, yT + bh + 17, "center", pal.teal);
      },
    },
    {
      label: "A clear answer",
      note: "A good answer is plain, complete and given in writing.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // the pointer writes the answer out: further right, more of it is there
        const r0 = px(f, b, k, 0.78 + 0.2 * Math.sin(t * 0.45 * v.speed + v.phase)) * p;
        const qr = clamp(b.u * 0.1, 4, 14);
        const qx = b.x + clamp(b.w * 0.1, qr + 2, 50);
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(qx, b.cy - qr, qr, Math.PI, Math.PI * 2.5);
        ctx.stroke();
        seg(ctx, qx, b.cy, qx, b.cy + qr * 0.6);
        ctx.fillStyle = rgba(pal.ink3, 0.9);
        disc(ctx, qx, b.cy + qr * 1.4, 1.8);
        ctx.lineWidth = 1.4;
        const cx0 = b.x + b.w * 0.3;
        const cw = b.r - 2 - cx0;
        const ch = Math.max(10, b.h - 6);
        const cy0 = b.y + 3;
        arrow(ctx, qx + qr + 5, b.cy, cx0 - 5, b.cy, 4);
        runner(f, qx + qr + 5, b.cy, cx0 - 5, b.cy, t * 0.35 * v.speed + v.a, pal.emerald);
        ctx.fillStyle = rgba(pal.emerald, 0.05 + 0.06 * k);
        rr(ctx, cx0, cy0, cw, ch, 5);
        ctx.fill();
        ctx.strokeStyle = rgba(mix(pal.ink3, pal.emerald, r0), 0.95);
        ctx.stroke();
        const rh = ch / 3;
        for (let i = 0; i < 3; i++) {
          const a = clamp(r0 * 3.2 - i);
          const y = cy0 + rh * (i + 0.5);
          const name = QUALITIES[i] ?? "";
          ctx.strokeStyle = rgba(pal.emerald, a);
          ctx.lineWidth = 2;
          tick(ctx, cx0 + 10, y, 3.5);
          ctx.lineWidth = 1.4;
          const wide = cw > 130;
          if (wide) put(f, b, name, cx0 + 20, y + 3.5, "left", pal.ink2, a);
          const lx = cx0 + 20 + (wide ? name.length * 6.9 + 8 : 0);
          ctx.strokeStyle = rgba(pal.ink3, 0.6 * a);
          if (cx0 + cw - 8 > lx) seg(ctx, lx, y, lerp(lx, cx0 + cw - 8, a), y);
        }
      },
    },
    {
      label: "If it is not enough",
      note: "Ask again, and if need be take it further as a complaint.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 3;
        const cw = b.w / n;
        // the pointer chooses the step; left alone, each is taken in turn
        const sel = k > 0.02 ? pickX(f, b, n) : Math.floor(t * 0.22 * v.speed + v.a * 3) % n;
        const base = b.b - 14;
        const rise = Math.max(0, (b.h - 36) / 2);
        for (let i = 0; i < n; i++) {
          if (i > n * p) break;
          const x = b.x + cw * (i + 0.5);
          const y = base - rise * i;
          const on = i === sel;
          const col = i === 2 ? AMBER : pal.accent;
          ctx.strokeStyle = rgba(on ? col : pal.ink3, on ? 1 : 0.6);
          ctx.lineWidth = 2.4;
          seg(ctx, x - cw * 0.36, y, x + cw * 0.36, y);
          ctx.lineWidth = 1.4;
          if (i < n - 1) {
            ctx.strokeStyle = rgba(pal.ink3, 0.5);
            arrow(ctx, x + cw * 0.39, y - 1, x + cw * 0.61, y - rise - 1, 3.5);
            if (on) runner(f, x + cw * 0.39, y - 1, x + cw * 0.61, y - rise - 1, t * 0.4 * v.speed + v.b, col);
          }
          if (on) {
            ctx.fillStyle = rgba(col, 1);
            rr(ctx, x - 4, y - 11 - 1.5 * Math.sin(t * 1.2 * v.speed + v.phase), 8, 8, 2);
            ctx.fill();
          }
          put(f, b, i === 0 ? "ask" : i === 1 ? (b.w < 220 ? "again" : "ask again") : "complain", x, y + 11, "center", on ? col : pal.ink3);
        }
      },
    },
  ],
}));

/**
 * ORDERS, in five chapters: the ticket, its side and size, its stop and limit,
 * the journey to the market, and the fill, which may not be at the price asked.
 */
export const ticket = scene((v) => ({
  caption: "Orders",
  line: "An order ticket tells the broker what to trade, in which direction, how much, and where to stop.",
  parts: [
    {
      label: "The ticket",
      note: "One form holds every choice you make about the trade.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const tw = Math.min(b.w - 2, clamp(b.w * 0.62, 70, 320));
        const th = Math.max(10, b.h - 4);
        const x = b.cx - tw / 2;
        const y = b.y + 2;
        // the pointer chooses the side: sell on the left, buy on the right
        const buy = smooth((px(f, b, k, 0.5 + 0.4 * v.dir * Math.sin(t * 0.4 * v.speed + v.phase)) - 0.5) * 3 + 0.5);
        ctx.fillStyle = rgba(pal.surface, 0.6);
        rr(ctx, x, y, tw, th, 6);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        dseg(ctx, x + tw * 0.16, y + 3, x + tw * 0.16, y + th - 3, 2, 4);
        for (let i = 0; i < 3; i++) seg(ctx, x + tw * 0.04, y + th * (0.3 + 0.2 * i), x + tw * 0.12, y + th * (0.3 + 0.2 * i));
        const cx0 = x + tw * 0.16 + 6;
        const cw = Math.max(0, tw * 0.84 - 12);
        const bh = clamp(th * 0.26, 11, 30);
        const by = y + 5;
        const half = Math.max(0, cw / 2 - 3);
        ctx.fillStyle = rgba(ALERT, 0.08 + 0.4 * (1 - buy));
        rr(ctx, cx0, by, half, bh, 4);
        ctx.fill();
        ctx.strokeStyle = rgba(ALERT, 0.95);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.emerald, 0.08 + 0.4 * buy);
        rr(ctx, cx0 + cw / 2 + 3, by, half, bh, 4);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.emerald, 0.95);
        ctx.stroke();
        const send = th >= 70;
        const ry = by + bh + 7;
        const rH = Math.max(0, y + th - (send ? 16 : 4) - ry);
        const rows = clamp(Math.floor(rH / 9), 0, 5);
        const gap = rH / Math.max(1, rows);
        for (let i = 0; i < rows; i++) {
          if (i > rows * p) break;
          const yy = ry + gap * (i + 0.5);
          const vh = Math.min(gap * 0.7, 10);
          ctx.strokeStyle = rgba(pal.ink3, 0.7);
          seg(ctx, cx0, yy, cx0 + cw * 0.3, yy);
          rr(ctx, cx0 + cw * 0.5, yy - vh / 2, cw * 0.5, vh, 2);
          ctx.stroke();
        }
        if (send) {
          ctx.fillStyle = rgba(mix(ALERT, pal.emerald, buy), 0.55);
          rr(ctx, cx0, y + th - 13, cw, 8, 4);
          ctx.fill();
        }
        // beside the ticket, the direction the choice points in
        if (x - b.x > 24) {
          const L = Math.min(b.h * 0.25, 30);
          ctx.strokeStyle = rgba(ALERT, 0.25 + 0.7 * (1 - buy));
          arrow(ctx, b.x + (x - b.x) / 2, b.cy - L, b.x + (x - b.x) / 2, b.cy + L);
          ctx.strokeStyle = rgba(pal.emerald, 0.25 + 0.7 * buy);
          arrow(ctx, b.r - (x - b.x) / 2, b.cy + L, b.r - (x - b.x) / 2, b.cy - L);
        }
        put(f, b, "sell", cx0 + half / 2, by + bh / 2 + 3.5, "center", ALERT);
        put(f, b, "buy", cx0 + cw / 2 + 3 + half / 2, by + bh / 2 + 3.5, "center", pal.emerald);
      },
    },
    {
      label: "Side and size",
      note: "Buy or sell, and how large the position is to be.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        // up and down chooses the side: buy above, sell below
        const d = clamp((0.5 - py(f, b, k, 0.5 - 0.32 * v.dir)) * 4, -1, 1) * p;
        const col = d >= 0 ? pal.emerald : ALERT;
        const ax = b.x + b.w * 0.18;
        const L = Math.max(6, b.h / 2 - 14);
        ctx.strokeStyle = rgba(col, 0.95);
        ctx.lineWidth = clamp(b.u * 0.05, 2.4, 6);
        arrow(ctx, ax, b.cy + d * L, ax, b.cy - d * L, clamp(b.u * 0.1, 5, 14));
        ctx.lineWidth = 1.4;
        const x0 = b.x + b.w * 0.42;
        const x1 = b.r - 2;
        const n = 6;
        const cw = (x1 - x0) / n;
        const g = b.b - 13;
        const H = Math.max(6, g - b.y - 12);
        // left and right sets the size
        const sz = lerp(0.55 + 0.25 * Math.sin(t * 0.4 * v.speed + v.phase), clamp((f.mx - x0) / Math.max(1, x1 - x0)), k);
        const m = clamp(Math.ceil(sz * n), 1, n);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, x0, g, x1, g);
        for (let i = 0; i < n; i++) {
          const hgt = ((H * (i + 1)) / n) * p;
          const on = i < m;
          ctx.fillStyle = rgba(col, on ? 0.45 + 0.2 * k : 0.06);
          ctx.fillRect(x0 + i * cw + 1.5, g - hgt, Math.max(1, cw - 3), hgt);
          ctx.strokeStyle = rgba(on ? col : pal.ink3, on ? 0.95 : 0.4);
          ctx.strokeRect(x0 + i * cw + 1.5, g - hgt, Math.max(1, cw - 3), hgt);
        }
        put(f, b, "side", ax, b.y + 8, "center");
        put(f, b, d >= 0 ? "buy" : "sell", ax, b.b - 1, "center", col);
        put(f, b, "size", x0, b.y + 8, "left");
        put(f, b, "small", x0, b.b - 1, "left");
        put(f, b, "large", x1, b.b - 1, "right");
      },
    },
    {
      label: "Stop and limit",
      note: "A stop caps the loss; a limit takes the profit.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const entry = b.cy;
        const my = clamp(f.my, b.y, b.b);
        // above the entry the pointer moves the limit; below it, the stop
        const wl = k * clamp((entry - my) / 8);
        const ws = k * clamp((my - entry) / 8);
        const lim = lerp(b.y + b.h * (0.2 + 0.03 * Math.sin(t * 0.5 * v.speed + v.phase)), clamp(my, b.y + 4, entry - 8), wl);
        const stp = lerp(b.y + b.h * (0.82 + 0.03 * Math.sin(t * 0.4 * v.speed + v.phase + 1)), clamp(my, entry + 8, b.b - 3), ws);
        ctx.fillStyle = rgba(pal.emerald, (0.07 + 0.08 * wl) * p);
        ctx.fillRect(b.x, lim, b.w, entry - lim);
        ctx.fillStyle = rgba(ALERT, (0.07 + 0.08 * ws) * p);
        ctx.fillRect(b.x, entry, b.w, stp - entry);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, b.x, entry, b.r, entry);
        ctx.strokeStyle = rgba(pal.emerald, 0.95);
        dseg(ctx, b.x, lim, b.x + b.w * p, lim, 4, 4);
        ctx.strokeStyle = rgba(ALERT, 0.95);
        dseg(ctx, b.x, stp, b.x + b.w * p, stp, 4, 4);
        runner(f, b.x, lim, b.r, lim, t * 0.18 * v.speed + v.a, pal.emerald);
        runner(f, b.r, stp, b.x, stp, t * 0.18 * v.speed + v.b, ALERT);
        ctx.fillStyle = rgba(pal.emerald, 1);
        rr(ctx, b.r - 9, lim - 3, 8, 6, 2);
        ctx.fill();
        ctx.fillStyle = rgba(ALERT, 1);
        rr(ctx, b.r - 9, stp - 3, 8, 6, 2);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, b.x, b.r - 18, 44, p, (u) => clamp(entry - wander(t * 0.6 * v.speed - (1 - u) * 5, v.phase) * b.h * 0.2 * Math.min(1, u * 3), lim, stp));
        put(f, b, "entry", b.x + 2, entry - 4, "left");
        put(f, b, "limit", b.r - 13, lim + 11, "right", pal.emerald);
        put(f, b, "stop", b.r - 13, stp - 5, "right", ALERT);
      },
    },
    {
      label: "Sent to market",
      note: "The order travels to be matched at the price available.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const tw = clamp(b.w * 0.16, 16, 70);
        const th = clamp(b.h * 0.5, 16, 96);
        const tx = b.x + 2;
        const tcy = b.cy - 5;
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        rr(ctx, tx, tcy - th / 2, tw, th, 3);
        ctx.stroke();
        ctx.fillStyle = rgba(pal.emerald, 0.5);
        ctx.fillRect(tx + 3, tcy - th / 2 + 3, Math.max(0, tw - 6), Math.max(2, th * 0.2));
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        rules(ctx, tx + 3, tcy, tw - 6, 2, Math.max(3, th * 0.18), v.a * 6, p);
        // the market: offers above the middle, bids below
        const bx0 = b.r - clamp(b.w * 0.26, 26, 160);
        const bx1 = b.r - 2;
        const half = clamp(Math.floor((b.h - 18) / 14), 1, 5);
        const rg = (b.h - 16) / (half * 2);
        const midY = b.y + 2 + half * rg;
        const bar = clamp(rg * 0.5, 2, 8);
        for (let i = 0; i < half; i++) {
          const la = (bx1 - bx0) * (0.3 + 0.6 * Math.abs(Math.sin(i * 1.9 + v.a * 6 + t * 0.3 * v.speed))) * p;
          const lb = (bx1 - bx0) * (0.3 + 0.6 * Math.abs(Math.sin(i * 2.6 + v.b * 6 - t * 0.25 * v.speed))) * p;
          ctx.fillStyle = rgba(ALERT, 0.5 - i * 0.06);
          ctx.fillRect(bx1 - la, midY - rg * (i + 0.5) - bar / 2, la, bar);
          ctx.fillStyle = rgba(pal.emerald, 0.5 - i * 0.06);
          ctx.fillRect(bx1 - lb, midY + rg * (i + 0.5) - bar / 2, lb, bar);
        }
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, bx0 - 4, midY, bx1, midY);
        const xa = tx + tw + 4;
        const xb = bx0 - 9;
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        dseg(ctx, xa, tcy, xb, midY, 2, 4);
        // the pointer carries the order along the wire
        const s = lerp(f.still ? 0.55 : (((t * 0.2 * v.speed + v.a) % 1) + 1) % 1, clamp((f.mx - xa) / Math.max(1, xb - xa)), k);
        const ox = lerp(xa, Math.max(xa, xb), s);
        const oy = lerp(tcy, midY, s);
        ctx.fillStyle = rgba(pal.accent, 1);
        rr(ctx, ox - 4.5, oy - 3, 9, 6, 1.5);
        ctx.fill();
        const met = smooth((s - 0.8) * 5);
        ctx.strokeStyle = rgba(pal.accent, met);
        ctx.strokeRect(bx0 - 2, midY - rg, bx1 - bx0 + 2, rg);
        put(f, b, "ticket", tx, b.b - 1, "left");
        put(f, b, "sent", ox, oy - 8, "center", pal.accent);
        put(f, b, "market", bx1, b.b - 1, "right");
      },
    },
    {
      label: "Filled, or not quite",
      note: "It fills at the price available, which can differ from the one asked.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const x0 = b.x + 2;
        const x1 = b.r - 4;
        // the pointer speeds the market up: the faster it moves, the further the fill can land
        const s = px(f, b, k, 0.4 + 0.25 * Math.sin(t * 0.4 * v.speed + v.phase));
        const amp = lerp(0.06, 0.34, s) * b.h;
        const yf = (u: number) => b.cy - 2 - wander(u * 7 + t * 0.12 * v.speed, v.phase) * amp;
        const xa = lerp(x0, x1, 0.42);
        const xf = lerp(x0, x1, 0.62);
        const ya = yf(0.42);
        const yv = yf(0.62);
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        dseg(ctx, x0, ya, lerp(x0, x1, p), ya, 4, 4);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, x0, x1, 48, p, yf);
        ctx.strokeStyle = rgba(AMBER, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, xf, ya, xf, yv);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.gold, 1);
        ctx.fillRect(xa - 3, ya - 3, 6, 6);
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.fillRect(xf - 3, yv - 3, 6, 6);
        // the moment between asking and being filled
        const by = b.b - 12;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, xa, by, xf, by);
        seg(ctx, xa, by - 3, xa, by + 3);
        seg(ctx, xf, by - 3, xf, by + 3);
        runner(f, xa, by, xf, by, t * 0.5 * v.speed + v.a, pal.accent);
        put(f, b, "asked", xa - 6, ya - 6, "right", pal.gold);
        put(f, b, "filled", xf + 7, clamp(yv + (yv > ya ? 12 : -6), b.y + 8, by - 5), "left", pal.accent);
        put(f, b, "a moment", (xa + xf) / 2, b.b - 1, "center");
      },
    },
  ],
}));
