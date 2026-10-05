import { ALERT, AMBER, TAU, arrow, clamp, disc, lerp, mix, rgba, ring, rr, runner, scene, seg, smooth, tag, wander, type Box, type Colour, type FigureFrame, type Part } from "./kit";

/**
 * FULL SCENES, first set: what a trade is made of (spread, margin, stop, costs)
 * and how a market is read (hours, dates, candles, trend, volatility). Each is
 * told in five chapters after the pattern of `leverage.ts`: what it is, how it
 * works, what changes it, what it does to a trade, and what to do about it.
 * Every chapter answers the pointer, composes a still, and draws no number.
 */

type Side = "left" | "center" | "right";

const frac = (x: number) => x - Math.floor(x);
/** where the pointer is across the box (0 at its left edge, 1 at its right) and down it (0 at the top) */
const px = (f: FigureFrame, b: Box) => clamp((f.mx - b.x) / Math.max(1, b.w));
const py = (f: FigureFrame, b: Box) => clamp((f.my - b.y) / Math.max(1, b.h));
/** something that runs from 0 to 1 again and again; in a still it rests at `rest` */
const loop = (f: FigureFrame, phase: number, rest = 0.5) => (f.still ? rest : frac(phase));

/** A chapter. Its drawing is held inside its box, and whatever it changed (dash, alpha, width) is put back. */
function part(label: string, note: string, draw: Part["draw"]): Part {
  return {
    label,
    note,
    draw: (f, b, k, p) => {
      const { ctx } = f;
      ctx.save();
      ctx.beginPath();
      ctx.rect(b.x - 1.5, b.y - 1.5, b.w + 3, b.h + 3);
      ctx.clip();
      try {
        draw(f, b, k, p);
      } finally {
        ctx.restore();
      }
    },
  };
}

/** A tag that cannot leave the box: moved inside it, or left out when there is no `room` for it. */
function name(f: FigureFrame, b: Box, s: string, x: number, y: number, align: Side = "left", c: Colour = f.pal.ink3, alpha = 1, room = b.w): void {
  const w = s.length * 7.2 + 2;
  if (w > room || w > b.w || b.h < 24 || alpha <= 0.02) return;
  const lo = align === "left" ? b.x : align === "center" ? b.x + w / 2 : b.x + w;
  tag(f, s, clamp(x, lo, lo + b.w - w), clamp(y, b.y + 9, b.b - 2), align, c, alpha);
}

/** a line from x0 to x1 whose height is `y(u)`, u running 0 to 1; drawn as far as `upto`, and never outside the box */
function trace(ctx: CanvasRenderingContext2D, b: Box, x0: number, x1: number, n: number, y: (u: number) => number, upto = 1): void {
  const m = Math.round(n * clamp(upto));
  ctx.beginPath();
  for (let i = 0; i <= m; i++) {
    const u = i / n;
    const yy = clamp(y(u), b.y, b.b);
    if (i === 0) ctx.moveTo(lerp(x0, x1, u), yy);
    else ctx.lineTo(lerp(x0, x1, u), yy);
  }
  ctx.stroke();
}

function dash(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, on = 4, off = 4): void {
  ctx.setLineDash([on, off]);
  seg(ctx, x1, y1, x2, y2);
  ctx.setLineDash([]);
}

function cross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const q = Math.max(0, r);
  seg(ctx, x - q, y - q, x + q, y + q);
  seg(ctx, x - q, y + q, x + q, y - q);
}

/** a vertical measure between two heights: arrows at both ends when there is room for them */
function span(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number): void {
  if (Math.abs(y2 - y1) > 12) {
    const m = (y1 + y2) / 2;
    arrow(ctx, x, m, x, y1, 4);
    arrow(ctx, x, m, x, y2, 4);
  } else seg(ctx, x, y1, x, y2);
}

/** a dot somewhere along a curve, fading at both ends of its journey */
function bead(f: FigureFrame, x: number, y: number, u: number, c: Colour, r = 2.2): void {
  f.ctx.fillStyle = rgba(c, Math.sin(clamp(u) * Math.PI));
  disc(f.ctx, x, y, r);
}

/** one candle: a wick from high to low and a body from open to close, solid when it closed higher */
function candle(ctx: CanvasRenderingContext2D, x: number, bw: number, yo: number, yc: number, yh: number, yl: number, c: Colour, solid: boolean, alpha = 1): void {
  const top = Math.min(yo, yc);
  const hh = Math.max(1.5, Math.abs(yo - yc));
  ctx.strokeStyle = rgba(c, 0.95 * alpha);
  seg(ctx, x, Math.min(yh, top), x, top);
  seg(ctx, x, top + hh, x, Math.max(yl, top + hh));
  ctx.fillStyle = rgba(c, (solid ? 0.72 : 0.2) * alpha);
  ctx.fillRect(x - bw / 2, top, bw, hh);
  ctx.strokeRect(x - bw / 2, top, bw, hh);
}

/** SPREAD: two prices at once, the loss a trade opens with, what widens the gap, crossing it to break even, and comparing the whole cost. */
export const spread = scene((v) => ({
  caption: "Spread",
  line: "Every market shows two prices at once, and the gap between them is what it costs to get in and out.",
  parts: [
    part("Two prices at once", "You buy at the higher one, the ask, and sell at the lower, the bid.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const at = px(f, b);
      const mid = (u: number) => b.cy + b.h * 0.1 * Math.sin(u * (3 + v.a * 2) * v.dir + v.phase + T * 0.5);
      // the gap opens where the pointer is
      const half = (u: number) => (2 + b.h * (0.11 + 0.035 * Math.sin(T * 0.7 + v.phase) + 0.1 * k * clamp(1 - Math.abs(u - at) / 0.3))) * p;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) ctx.lineTo(b.x + (i / 40) * b.w, mid(i / 40) - half(i / 40));
      for (let i = 40; i >= 0; i--) ctx.lineTo(b.x + (i / 40) * b.w, mid(i / 40) + half(i / 40));
      ctx.closePath();
      ctx.fillStyle = rgba(pal.accent, 0.09);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      trace(ctx, b, b.x, b.r, 40, (u) => mid(u) - half(u));
      ctx.strokeStyle = rgba(pal.teal, 0.95);
      trace(ctx, b, b.x, b.r, 40, (u) => mid(u) + half(u));
      const q = loop(f, T * 0.11 + v.a);
      bead(f, b.x + q * b.w, mid(q) - half(q), q, pal.accent);
      bead(f, b.r - q * b.w, mid(1 - q) + half(1 - q), q, pal.teal);
      name(f, b, "ask", b.x, mid(0) - half(0) - 5, "left", pal.accent);
      name(f, b, "bid", b.x, mid(0) + half(0) + 11, "left", pal.teal);
      // the measure follows the pointer along the two prices
      const um = lerp(0.5 + 0.24 * Math.sin(T * 0.35 + v.phase), clamp(at, 0.12, 0.9), k);
      const xm = b.x + um * b.w;
      ctx.strokeStyle = rgba(pal.ink, 0.85);
      span(ctx, xm, mid(um) - half(um) + 2, mid(um) + half(um) - 2);
      name(f, b, "spread", xm + (um > 0.5 ? -7 : 7), mid(um) + 3.5, um > 0.5 ? "right" : "left", pal.ink2);
    }),
    part("You start behind", "A new trade is valued at the other price, so it opens at a small loss.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const g = b.h * (0.28 + 0.03 * Math.sin(T * 0.8 + v.phase)) * p;
      const ya = b.cy - g / 2;
      const yb = b.cy + g / 2;
      // the pointer chooses the side: left of the middle buys, right of it sells
      const buy = k > 0.02 ? f.mx < b.cx : v.dir > 0;
      const x1 = b.x + b.w * 0.36;
      const x2 = b.x + b.w * 0.7;
      const y1 = buy ? ya : yb;
      const y2 = buy ? yb : ya;
      ctx.fillStyle = rgba(ALERT, 0.1 + 0.08 * k);
      ctx.fillRect(x1, ya, x2 - x1, g);
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      seg(ctx, b.x, ya, b.r, ya);
      ctx.strokeStyle = rgba(pal.teal, 0.95);
      seg(ctx, b.x, yb, b.r, yb);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      arrow(ctx, x1, y1, x2, y2, 5);
      runner(f, x1, y1, x2, y2, T * 0.3 + v.a, ALERT);
      ctx.fillStyle = rgba(pal.gold, 1);
      disc(ctx, x1, y1, 3.2);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      ring(ctx, x2, y2, 4);
      name(f, b, "ask", b.x, ya - 5, "left", pal.accent);
      name(f, b, "bid", b.x, yb + 11, "left", pal.teal);
      name(f, b, buy ? "buy" : "sell", x1, buy ? ya - 6 : yb + 12, "center", pal.gold, 1, b.w * 0.3);
      name(f, b, "valued", x2, buy ? yb + 12 : ya - 6, "center", pal.ink2, 1, b.w * 0.45);
    }),
    part("What widens it", "Quiet hours and sudden news pull the two prices further apart.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      // the pointer carries the news along the day
      const un = lerp(0.5 + 0.28 * Math.sin(T * 0.3 + v.phase), clamp(px(f, b), 0.1, 0.9), k);
      const yc = b.cy + b.h * 0.05;
      const half = (u: number) => {
        const e = 2 * u - 1;
        const g = (u - un) / 0.09;
        return (1.5 + b.h * (0.035 + 0.1 * e * e + 0.17 * Math.exp(-g * g))) * p;
      };
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) ctx.lineTo(b.x + (i / 48) * b.w, yc - half(i / 48));
      for (let i = 48; i >= 0; i--) ctx.lineTo(b.x + (i / 48) * b.w, yc + half(i / 48));
      ctx.closePath();
      ctx.fillStyle = rgba(pal.accent, 0.09);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(pal.ink3, 0.3);
      for (let i = 0; i < 9; i++) {
        const u = frac(i / 9 + T * 0.02 * v.dir);
        seg(ctx, b.x + u * b.w, yc - half(u), b.x + u * b.w, yc + half(u));
      }
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      trace(ctx, b, b.x, b.r, 48, (u) => yc - half(u));
      ctx.strokeStyle = rgba(pal.teal, 0.95);
      trace(ctx, b, b.x, b.r, 48, (u) => yc + half(u));
      const xn = b.x + un * b.w;
      ctx.strokeStyle = rgba(AMBER, 0.8);
      dash(ctx, xn, b.y + 12, xn, Math.max(b.y + 12, yc - half(un)), 2, 3);
      ctx.fillStyle = rgba(AMBER, 1);
      disc(ctx, xn, yc - half(un), 2.6);
      name(f, b, "news", xn, b.y + 9, "center", AMBER);
      name(f, b, "quiet", b.x, b.b - 2, "left", pal.ink3);
      name(f, b, "quiet", b.r, b.b - 2, "right", pal.ink3, 1, b.w * 0.4);
      name(f, b, "busy", b.cx, b.b - 2, "center", pal.ink3, 1, b.w * 0.22);
    }),
    part("Price must cross it", "The market has to move by the spread before a trade breaks even.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      // the pointer sets the spread: the lower it is, the further the price has to travel
      const g = b.h * lerp(0.2 + 0.04 * Math.sin(T * 0.5 + v.phase), clamp(py(f, b) - 0.38, 0.08, 0.36), k);
      const ye = b.y + b.h * 0.38;
      const Y = (u: number) => ye + g - b.h * (0.42 * u + 0.045 * wander(u * 7 + T * 0.5, v.phase) * smooth(u * 6));
      ctx.fillStyle = rgba(ALERT, 0.1 + 0.06 * k);
      ctx.fillRect(b.x, ye, b.w, g);
      ctx.strokeStyle = rgba(pal.gold, 0.9);
      dash(ctx, b.x, ye, b.r, ye);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      seg(ctx, b.x, ye + g, b.r, ye + g);
      const q = loop(f, T * 0.1 + v.a, 0.62);
      const head = clamp(q / 0.9) * p;
      const fade = clamp((1 - q) * 9);
      ctx.strokeStyle = rgba(pal.ink, 0.9 * fade);
      trace(ctx, b, b.x, b.r - 14, 48, Y, head);
      const hy = clamp(Y(head), b.y, b.b);
      ctx.fillStyle = rgba(hy < ye ? pal.emerald : ALERT, fade);
      disc(ctx, lerp(b.x, b.r - 14, head), hy, 3.2);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      span(ctx, b.r - 6, ye + 2, ye + g - 2);
      name(f, b, "break even", b.x, ye - 5, "left", pal.gold);
      name(f, b, "start", b.x, ye + g + 11, "left", pal.ink3);
      name(f, b, "spread", b.r - 12, ye + g / 2 + 3.5, "right", ALERT, 1, b.w * 0.5);
    }),
    part("Compare the whole cost", "A narrow spread with a commission can cost more than a wider one alone.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const base = b.b - 13;
      const H = Math.max(8, base - b.y - 13);
      const bw = Math.min(46, b.w * 0.22);
      const xa = b.x + b.w * 0.27;
      const xb = b.x + b.w * 0.73;
      // the pointer sets the commission: slide it and the cheaper of the two changes
      const fee = lerp(0.36 + 0.28 * Math.sin(T * 0.4 + v.phase), px(f, b), k);
      const ha = H * 0.62 * p;
      const hs = H * 0.28 * p;
      const hc = H * (0.08 + 0.55 * fee) * p;
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, base, b.r, base);
      ctx.fillStyle = rgba(pal.accent, 0.45);
      rr(ctx, xa - bw / 2, base - ha, bw, ha, 2);
      ctx.fill();
      rr(ctx, xb - bw / 2, base - hs, bw, hs, 2);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      ctx.strokeRect(xa - bw / 2, base - ha, bw, ha);
      ctx.strokeRect(xb - bw / 2, base - hs, bw, hs);
      ctx.fillStyle = rgba(pal.gold, 0.35 + 0.25 * k);
      ctx.fillRect(xb - bw / 2, base - hs - hc, bw, hc);
      ctx.strokeStyle = rgba(pal.gold, 0.95);
      ctx.strokeRect(xb - bw / 2, base - hs - hc, bw, hc);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      dash(ctx, xa + bw / 2, base - ha, b.r, base - ha, 2, 4);
      const second = hs + hc < ha;
      name(f, b, "cheaper", second ? xb : xa, base - (second ? hs + hc : ha) - 6, "center", pal.emerald, p, b.w * 0.5);
      name(f, b, "wide", xa, b.b - 2, "center", pal.ink3, 1, b.w * 0.4);
      name(f, b, "tight + fee", xb, b.b - 2, "center", pal.ink3, 1, b.w * 0.5);
    }),
  ],
}));

/** MARGIN: the money set aside, free against used, losses eating the free part, the margin call, and positions closed out. */
export const margin = scene((v) => ({
  caption: "Margin",
  line: "Margin is the part of your money set aside to hold a position open; when losses eat the rest, the position is closed.",
  parts: [
    part("Money set aside", "Part of the account is held against the trade; a limit sits below it.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const cw = Math.min(b.w * 0.4, b.h * 0.9);
      const x0 = b.cx - cw / 2;
      const top = b.y + 2;
      const bot = b.b - 2;
      const H = bot - top;
      const lim = 0.2;
      const used = 0.32 * p;
      // the pointer lifts and lowers what is left in the account
      const level = lerp(0.66 + 0.24 * Math.sin(T * 0.5 + v.phase), clamp(1 - py(f, b), 0.08, 0.96), k) * p;
      const low = level < lim + 0.02;
      const c = low ? ALERT : pal.teal;
      const ys = bot - level * H;
      ctx.beginPath();
      ctx.moveTo(x0, bot);
      for (let i = 0; i <= 12; i++) ctx.lineTo(x0 + (i / 12) * cw, Math.min(bot, ys + Math.sin(i * 0.9 + T * 1.4) * 1.5));
      ctx.lineTo(x0 + cw, bot);
      ctx.closePath();
      ctx.fillStyle = rgba(c, 0.26);
      ctx.fill();
      ctx.strokeStyle = rgba(c, 0.95);
      seg(ctx, x0, ys, x0 + cw, ys);
      ctx.fillStyle = rgba(pal.accent, 0.4);
      ctx.fillRect(x0 + 3, bot - used * H, Math.max(0, cw - 6), Math.max(0, used * H - 2));
      if (!low)
        for (let i = 0; i < 3; i++) {
          const u = frac(T * 0.13 + i * 0.37 + v.a);
          ctx.strokeStyle = rgba(c, 0.6 * Math.sin(u * Math.PI));
          ring(ctx, x0 + cw * (0.25 + 0.25 * i), lerp(bot - 4, ys + 3, u), 1.6);
        }
      // the vessel, open at the top
      ctx.strokeStyle = rgba(pal.ink2, 0.9);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0, top);
      ctx.lineTo(x0, bot);
      ctx.lineTo(x0 + cw, bot);
      ctx.lineTo(x0 + cw, top);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      const yl = bot - lim * H;
      ctx.strokeStyle = rgba(ALERT, low ? 1 : 0.75);
      dash(ctx, Math.max(b.x, x0 - 10), yl, Math.min(b.r, x0 + cw + 10), yl, 5, 4);
      const room = b.r - (x0 + cw + 8);
      if (level > used + 0.1) name(f, b, "free", x0 + cw + 8, (ys + bot - used * H) / 2 + 3.5, "left", c, 1, room);
      name(f, b, "margin", x0 + cw + 8, bot - used * H * 0.82 + 3.5, "left", pal.accent, 1, room);
      name(f, b, "limit", x0 - 12, yl + 3.5, "right", ALERT, 1, x0 - 12 - b.x);
    }),
    part("Free and used", "Each open position takes its share; what remains is free margin.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const bh = clamp(b.h * 0.24, 12, 44);
      const y = b.cy - bh / 2;
      const unit = b.w * 0.2;
      // the pointer opens positions: the further right, the more of them, and the less is left free
      const m = lerp(2 + 1.4 * Math.sin(T * 0.4 + v.phase), px(f, b) * 4, k) * p;
      const xu = b.x + unit * m;
      ctx.fillStyle = rgba(pal.teal, 0.16);
      rr(ctx, b.x, y, b.w, bh, 4);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        const fr = clamp(m - i);
        if (fr <= 0) break;
        ctx.fillStyle = rgba(pal.accent, 0.5);
        ctx.fillRect(b.x + i * unit + 2, y + 2, Math.max(0, unit * fr - 3), bh - 4);
        ctx.strokeStyle = rgba(pal.accent, 0.9);
        rr(ctx, b.x + unit * (i + 0.5) - 4, y + bh + 5, 8, 8, 2);
        if (fr > 0.5) ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = rgba(pal.ink2, 0.9);
      rr(ctx, b.x, y, b.w, bh, 4);
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.accent, 0.85);
      seg(ctx, b.x, y - 6, xu, y - 6);
      seg(ctx, xu, y - 9, xu, y - 3);
      ctx.strokeStyle = rgba(pal.teal, 0.85);
      seg(ctx, Math.min(b.r, xu + 4), y - 6, b.r, y - 6);
      runner(f, b.r, y - 6, xu, y - 6, T * 0.25 + v.a, pal.teal);
      name(f, b, "used", b.x, y - 10, "left", pal.accent, 1, xu - b.x);
      name(f, b, "free", b.r, y - 10, "right", pal.teal, 1, b.r - xu - 6);
      name(f, b, "positions", b.r, y + bh + 13, "right", pal.ink3, 1, b.w * 0.5);
    }),
    part("Losses eat the free part", "A losing trade is paid for out of the free margin, as it happens.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const xl = b.x + b.w * 0.56;
      // the pointer moves the price: lower, and the loss comes out of what was free
      const m = lerp(wander(T * 0.6, v.phase) * 0.8, 1 - 2 * py(f, b), k) * p;
      const yOf = (q: number) => b.cy - q * b.h * 0.3;
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      dash(ctx, b.x, b.cy, xl, b.cy, 2, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, xl, 36, (u) => yOf(lerp(wander(T * 0.6 - (1 - u) * 2.4, v.phase) * 0.8 * p, m, k * u * u)));
      const ye = yOf(m);
      const col = m >= 0 ? pal.emerald : ALERT;
      ctx.strokeStyle = rgba(col, 0.95);
      ctx.lineWidth = 2.4;
      seg(ctx, xl, b.cy, xl, ye);
      ctx.lineWidth = 1.4;
      ctx.fillStyle = rgba(col, 1);
      disc(ctx, xl, ye, 3);
      const bw = Math.min(44, b.w * 0.2);
      const xb = b.r - bw - 2;
      const bot = b.b - 13;
      const top = b.y + 3;
      const H = Math.max(6, bot - top);
      const used = H * 0.3;
      const free = H * clamp(0.36 + 0.32 * m, 0.02, 0.68);
      const fc = free < H * 0.12 ? ALERT : pal.teal;
      ctx.fillStyle = rgba(pal.accent, 0.45);
      ctx.fillRect(xb, bot - used, bw, used);
      ctx.fillStyle = rgba(fc, 0.3);
      ctx.fillRect(xb, bot - used - free, bw, free);
      ctx.strokeStyle = rgba(fc, 0.95);
      seg(ctx, xb, bot - used - free, xb + bw, bot - used - free);
      ctx.strokeStyle = rgba(pal.ink2, 0.9);
      ctx.strokeRect(xb, top, bw, H);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      dash(ctx, xl + 4, ye, xb, bot - used - free, 2, 4);
      name(f, b, "entry", b.x, b.cy - 5, "left", pal.ink3);
      name(f, b, "price", b.x, b.b - 2, "left", pal.ink3, 1, b.w * 0.4);
      name(f, b, "equity", xb + bw / 2, b.b - 2, "center", pal.ink3, 1, b.w * 0.5);
    }),
    part("The margin call", "When equity falls near the limit, the account is warned first.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const th = clamp(b.h * 0.14, 6, 18);
      const y = b.cy + b.h * 0.06;
      // the pointer is the margin level: slide it left, towards the limit
      const u = lerp(0.56 + 0.36 * Math.sin(T * 0.45 + v.phase), px(f, b), k);
      const zone = u < 0.2 ? 0 : u < 0.44 ? 1 : 2;
      const cols = [ALERT, AMBER, pal.emerald] as const;
      const edges = [0, 0.2, 0.44, 1] as const;
      const words = ["stop out", "margin call", "safe"] as const;
      for (let i = 0; i < 3; i++) {
        const a = edges[i] ?? 0;
        const z = edges[i + 1] ?? 1;
        ctx.fillStyle = rgba(cols[i] ?? pal.ink3, i === zone ? 0.6 : 0.22);
        ctx.fillRect(b.x + a * b.w, y, Math.max(0, (z - a) * b.w * p - 2), th);
      }
      const cur = cols[zone] ?? pal.ink3;
      const xn = b.x + u * b.w;
      ctx.strokeStyle = rgba(pal.ink, 0.95);
      ctx.lineWidth = 2;
      seg(ctx, xn, y - 4, xn, y + th + 3);
      ctx.lineWidth = 1.4;
      ctx.fillStyle = rgba(pal.ink, 0.95);
      ctx.beginPath();
      ctx.moveTo(xn, y - 3);
      ctx.lineTo(xn - 5, y - 11);
      ctx.lineTo(xn + 5, y - 11);
      ctx.closePath();
      ctx.fill();
      // the call: a slow ring over the marker while the level is in the amber
      if (zone === 1) {
        const q = loop(f, T * 0.35, 0.4);
        ctx.strokeStyle = rgba(AMBER, 0.85 * (1 - q));
        ring(ctx, xn, y - 11, 4 + Math.min(8, b.h * 0.12) * q);
      }
      ctx.strokeStyle = rgba(pal.ink3, 0.8);
      arrow(ctx, b.x + 14, b.y + 5, b.x + 2, b.y + 5, 4);
      name(f, b, "losses", b.x + 19, b.y + 9, "left", pal.ink3, 1, b.w - 20);
      name(f, b, words[zone] ?? "", xn, y + th + 14, "center", cur);
    }),
    part("Closed out", "At the limit positions are closed for you, at whatever price is there.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const base = b.b - 14;
      const H = Math.max(8, base - b.y - 4);
      const sizes = [0.95, 0.74, 0.56, 0.4] as const;
      // the pointer is how far the account has fallen: positions are closed from the left, the largest loss first
      const lost = lerp(1.6 + 1.2 * Math.sin(T * 0.35 + v.phase), px(f, b) * 4, k);
      const cw = b.w / 4;
      const bw = Math.min(cw * 0.62, 54);
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, base, b.r, base);
      for (let i = 0; i < 4; i++) {
        const x = b.x + cw * (i + 0.5);
        const hh = H * (sizes[i] ?? 0.5) * p;
        const c = clamp(lost - i);
        ctx.fillStyle = rgba(pal.accent, 0.5 * (1 - c));
        rr(ctx, x - bw / 2, base - hh, bw, hh, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(mix(pal.accent, ALERT, c), 0.95);
        if (c > 0.5) ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (c > 0) {
          ctx.strokeStyle = rgba(ALERT, c);
          cross(ctx, x, base - hh / 2, Math.min(bw, hh) * 0.22 * c);
        }
      }
      const xf = b.x + clamp(lost / 4) * b.w;
      ctx.strokeStyle = rgba(ALERT, 0.7);
      dash(ctx, xf, b.y, xf, base, 2, 4);
      name(f, b, "closed", b.x, b.b - 2, "left", ALERT, clamp(lost), xf - b.x + 20);
      name(f, b, "kept", b.r, b.b - 2, "right", pal.accent, clamp(4 - lost), b.r - xf + 20);
    }),
  ],
}));

/** STOP LOSS: a level chosen in advance, the order waiting, how far away to put it, a stop that trails, and the gap that jumps it. */
export const stop = scene((v) => ({
  caption: "Stop loss",
  line: "A stop loss is an order left in the market to close a trade once the price reaches a level you chose in advance.",
  parts: [
    part("A level chosen in advance", "You decide the most you will lose before the trade is opened.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      // the pointer moves the level up and down
      const lvl = lerp(0.78, clamp(py(f, b), 0.62, 0.9), k);
      const ys = b.y + b.h * lvl;
      const ye = b.y + b.h * 0.36;
      const X = (u: number) => (v.dir > 0 ? b.x + u * b.w : b.r - u * b.w);
      const Y = (u: number) => {
        const free = 0.36 + (0.13 * Math.sin(u * 6.5 + v.phase) + 0.06 * Math.sin(u * 15 + v.phase * 1.7)) * smooth(u * 5) - 0.08 * u;
        return b.y + b.h * lerp(free, lvl, smooth((u - 0.7) / 0.3));
      };
      ctx.fillStyle = rgba(ALERT, 0.07 + 0.05 * k);
      ctx.fillRect(b.x, ye, b.w, ys - ye);
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      dash(ctx, b.x, ye, b.r, ye, 2, 4);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      dash(ctx, b.x, ys, b.r, ys, 5, 4);
      const q = loop(f, T * 0.11 + v.a, 0.9);
      const prog = clamp(q / 0.8) * p;
      const fade = clamp((1 - q) * 8);
      ctx.strokeStyle = rgba(pal.ink, 0.9 * fade);
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let i = 0; i <= 44; i++) ctx.lineTo(X((i / 44) * prog), Y((i / 44) * prog));
      ctx.stroke();
      if (prog >= 1) {
        ctx.strokeStyle = rgba(ALERT, fade);
        cross(ctx, X(1), Y(1), 4);
      } else {
        ctx.fillStyle = rgba(pal.accent, fade);
        disc(ctx, X(prog), Y(prog), 3.2);
      }
      ctx.lineWidth = 1.4;
      const sx = v.dir > 0 ? b.x : b.r;
      const al: Side = v.dir > 0 ? "left" : "right";
      name(f, b, "entry", sx, ye - 5, al, pal.ink3);
      name(f, b, "stop", sx, ys + 11, al, ALERT);
      if (ys - ye > 30) name(f, b, "risk", v.dir > 0 ? b.r : b.x, ye + 12, v.dir > 0 ? "right" : "left", ALERT, 0.8, b.w * 0.4);
    }),
    part("It waits in the market", "The order rests at its level and acts only if the price arrives.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const xe = b.r - 30;
      // the pointer moves the order: raise it into the price and it is triggered
      const ys = b.y + b.h * lerp(0.78, clamp(py(f, b), 0.25, 0.9), k);
      const Y = (u: number) => b.y + b.h * (0.34 + 0.16 * wander(T * 0.6 - (1 - u) * 3, v.phase));
      const yp = Y(1);
      const hit = yp >= ys;
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, xe, 40, Y, p);
      ctx.fillStyle = rgba(hit ? ALERT : pal.accent, 1);
      disc(ctx, xe, yp, 3.2);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      dash(ctx, b.x, ys, b.r - 26, ys, 5, 4);
      runner(f, b.x, ys, b.r - 26, ys, T * 0.12 + v.a, ALERT, 1.8);
      // the order ticket resting on its line
      const ty = clamp(ys - 7, b.y, b.b - 14);
      ctx.fillStyle = rgba(pal.surface, 0.9);
      rr(ctx, b.r - 24, ty, 22, 14, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(ALERT, 0.95);
      ctx.stroke();
      ctx.strokeStyle = rgba(ALERT, 0.6);
      seg(ctx, b.r - 19, ty + 5, b.r - 7, ty + 5);
      seg(ctx, b.r - 19, ty + 9, b.r - 11, ty + 9);
      if (hit) {
        ctx.strokeStyle = rgba(ALERT, 1);
        ring(ctx, xe, ys, 6);
      } else {
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        span(ctx, xe, yp + 6, ys - 3);
      }
      name(f, b, "price", b.x, b.y + 9, "left", pal.ink3);
      name(f, b, hit ? "triggered" : "waiting", b.x, ys + 11 > b.b - 2 ? ys - 5 : ys + 11, "left", ALERT);
    }),
    part("How far away", "Too close and ordinary noise takes it out; too far and the loss is large.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const ye = b.y + b.h * 0.28;
      const nb = b.h * 0.14;
      const xr = b.r - 16;
      // the pointer sets the distance: inside the noise, or far below it
      const d = b.h * lerp(0.3 + 0.06 * Math.sin(T * 0.4 + v.phase), clamp(py(f, b) - 0.28, 0.05, 0.64), k) * p;
      const ys = ye + d;
      const close = d < nb * 1.05;
      const far = d > b.h * 0.46;
      const c = close ? AMBER : far ? ALERT : pal.emerald;
      ctx.fillStyle = rgba(pal.ink3, 0.08);
      ctx.fillRect(b.x, ye - nb, xr - b.x, nb * 2);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      seg(ctx, b.x, ye, xr, ye);
      dash(ctx, b.x, ye + nb, xr, ye + nb, 2, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, xr, 44, (u) => ye + nb * 0.85 * wander(T * 0.9 - (1 - u) * 4, v.phase));
      ctx.strokeStyle = rgba(c, 0.95);
      dash(ctx, b.x, ys, xr, ys, 5, 4);
      ctx.fillStyle = rgba(ALERT, 0.3);
      ctx.fillRect(xr + 4, ye, 9, d);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      ctx.strokeRect(xr + 4, ye, 9, d);
      name(f, b, "noise", b.x, ye - nb - 3, "left", pal.ink3);
      name(f, b, "loss", b.r, ye - 5, "right", ALERT, 1, b.w * 0.4);
      name(f, b, close ? "too close" : far ? "costly" : "room to move", b.x, ys + 11 > b.b - 2 ? ys - 5 : ys + 11, "left", c);
    }),
    part("A trailing stop follows", "It climbs behind a rising price and never moves back down.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const pr = (u: number) => 0.68 - 0.46 * u - 0.08 * Math.sin(u * 13 + v.phase);
      const gap = 0.15;
      const N = 48;
      // the pointer runs time forwards and back: the stop climbs with the price and stays where it got to
      const q = loop(f, T * 0.08 + v.a, 0.72);
      const head = lerp(q, px(f, b), k) * p;
      ctx.globalAlpha = p * lerp(clamp((1 - q) * 7), 1, k);
      const m = Math.round(N * head);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, b.r, N, (u) => b.y + b.h * pr(u), head);
      ctx.strokeStyle = rgba(ALERT, 0.95);
      ctx.beginPath();
      let best = 1;
      for (let i = 0; i <= m; i++) {
        best = Math.min(best, pr(i / N));
        const y = b.y + b.h * Math.min(0.96, best + gap);
        if (i === 0) ctx.moveTo(b.x, y);
        else ctx.lineTo(b.x + (i / N) * b.w, y);
      }
      ctx.stroke();
      const hx = b.x + (m / N) * b.w;
      const hy = b.y + b.h * pr(m / N);
      const sy = b.y + b.h * Math.min(0.96, best + gap);
      ctx.strokeStyle = rgba(pal.ink3, 0.8);
      span(ctx, hx, hy + 5, sy - 4);
      ctx.fillStyle = rgba(pal.accent, 1);
      disc(ctx, hx, hy, 3.2);
      ctx.fillStyle = rgba(ALERT, 1);
      disc(ctx, hx, sy, 2.4);
      name(f, b, "price", hx, hy - 7, "center", pal.ink2);
      name(f, b, "trail", b.x, b.y + b.h * Math.min(0.96, pr(0) + gap) + 11, "left", ALERT);
    }),
    part("A gap can jump it", "A stop is not a guarantee: after a gap it fills at the next price.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const lvl = 0.52;
      const ys = b.y + b.h * lvl;
      const xg = b.x + b.w * 0.46;
      const xn = b.x + b.w * 0.58;
      // the pointer sets how far the market jumps past the level
      const jump = b.h * lerp(0.16 + 0.05 * Math.sin(T * 0.4 + v.phase), clamp(py(f, b) - lvl, 0.05, 0.32), k) * p;
      const y1 = (u: number) => b.y + b.h * (0.28 + 0.07 * wander(T * 0.5 - (1 - u) * 3, v.phase) + 0.1 * u * u);
      const y2 = ys + jump;
      const yEnd = y1(1);
      ctx.fillStyle = rgba(ALERT, 0.12 + 0.06 * k);
      ctx.fillRect(xn, ys, b.r - xn, jump);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      dash(ctx, b.x, ys, b.r, ys, 5, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, xg, 30, y1);
      trace(ctx, b, xn, b.r - 12, 20, (u) => y2 + b.h * 0.035 * wander(T * 0.5 + u * 3, v.phase + 2) * u);
      ctx.strokeStyle = rgba(AMBER, 0.9);
      dash(ctx, xg, yEnd, xn, y2, 2, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      ring(ctx, xg, yEnd, 3);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      ring(ctx, xn, ys, 4);
      span(ctx, b.r - 6, ys + 2, y2 - 2);
      ctx.fillStyle = rgba(ALERT, 1);
      disc(ctx, xn, y2, 3.2);
      name(f, b, "gap", (xg + xn) / 2, b.y + 9, "center", AMBER);
      name(f, b, "stop", b.x, ys + 11, "left", ALERT);
      name(f, b, "filled here", b.r - 12, y2 + 12, "right", ALERT, 1, b.w * 0.55);
    }),
  ],
}));

/** COSTS: each trade costs, the three kinds of cost, nights adding up, small costs over many trades, and counting the cost against the target. */
export const costs = scene((v) => ({
  caption: "Costs",
  line: "Every trade has a price of its own: the spread, sometimes a commission, and a charge for holding it overnight.",
  parts: [
    part("Each trade costs", "Something leaves the account every time a trade is made.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const d = v.dir;
      const N = 6;
      const rx = Math.min(b.w * 0.13, b.h * 0.2);
      const ry = rx * 0.32;
      const th = b.h * 0.07;
      const sx = b.cx - d * b.w * 0.24;
      const base = b.b - ry - 2;
      const c = f.still ? 2.45 : T * 0.4 + v.a * N;
      const kk = Math.floor(c) % (N - 1);
      const e = c - Math.floor(c);
      const sitting = Math.max(1, Math.round((N - 1 - kk) * p));
      const coin = (x: number, y: number, alpha: number, lid: boolean) => {
        ctx.strokeStyle = rgba(pal.gold, alpha);
        ctx.fillStyle = rgba(pal.gold, 0.16 * alpha);
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI);
        ctx.lineTo(x - rx, y - th);
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + rx, y - th);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y - th, rx, ry, 0, 0, lid ? TAU : Math.PI);
        if (lid) ctx.fill();
        ctx.stroke();
      };
      for (let i = 0; i < sitting; i++) coin(sx, base - i * th, 0.95, i === sitting - 1);
      // the coin that leaves flies towards the pointer
      const y0 = base - sitting * th;
      const tx = lerp(clamp(sx + d * b.w * 0.44, b.x + rx, b.r - rx), clamp(f.mx, b.x + rx, b.r - rx), k);
      const fx = lerp(sx, tx, smooth(e));
      const fy = Math.max(b.y + th + ry + 11, lerp(y0, Math.min(y0 + b.h * 0.22, base), e * e) - Math.sin(e * Math.PI) * b.h * 0.1);
      coin(fx, fy, 1 - e * 0.85, true);
      name(f, b, "cost", fx, fy - th - ry - 4, "center", ALERT, 1 - e);
      // the trades, counted off along the top
      const x1 = d > 0 ? b.cx + 4 : b.x + 4;
      for (let i = 0; i < N - 1; i++) {
        const lit = i <= kk;
        ctx.strokeStyle = rgba(lit ? pal.accent : pal.ink3, lit ? 0.95 : 0.5);
        ctx.lineWidth = lit ? 2 : 1.2;
        seg(ctx, x1 + (i * (b.w * 0.5 - 10)) / (N - 2), b.y + 2, x1 + (i * (b.w * 0.5 - 10)) / (N - 2), b.y + 10);
      }
      ctx.lineWidth = 1.4;
      name(f, b, "trades", d > 0 ? b.r : b.x, b.y + 22, d > 0 ? "right" : "left", pal.ink3, 1, b.w * 0.5);
      name(f, b, "balance", sx - d * (rx + 6), base, d > 0 ? "right" : "left", pal.gold, 1, (d > 0 ? sx - b.x : b.r - sx) - rx - 6);
    }),
    part("Three kinds of cost", "The spread on every trade, a commission on some, a swap overnight.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const cw = b.w / 3;
      // the pointer picks one of the three
      const sel = k > 0.02 ? Math.min(2, Math.floor(px(f, b) * 3)) : Math.floor(loop(f, T * 0.07 + v.a, 0.5) * 3) % 3;
      const yc = b.cy - 5;
      const s0 = Math.max(4, Math.min(cw * 0.3, b.h * 0.26));
      const words = ["spread", "commission", "overnight"] as const;
      const cols = [pal.accent, pal.gold, pal.teal] as const;
      for (let i = 0; i < 3; i++) {
        const on = i === sel;
        const x = b.x + cw * (i + 0.5);
        const s = s0 * (on ? 1.12 : 0.92) * p;
        const c = cols[i] ?? pal.ink;
        ctx.strokeStyle = rgba(c, on ? 1 : 0.55);
        ctx.fillStyle = rgba(c, on ? 0.3 : 0.12);
        ctx.lineWidth = on ? 1.8 : 1.3;
        if (i === 0) {
          const g = s * (0.45 + 0.15 * Math.sin(T * 0.9 + v.phase));
          ctx.fillRect(x - s, yc - g, s * 2, g * 2);
          seg(ctx, x - s, yc - g, x + s, yc - g);
          seg(ctx, x - s, yc + g, x + s, yc + g);
          span(ctx, x, yc - g + 2, yc + g - 2);
        } else if (i === 1) {
          rr(ctx, x - s, yc - s * 0.7, s * 2, s * 1.4, 3);
          ctx.fill();
          ctx.stroke();
          seg(ctx, x - s * 0.6, yc - s * 0.2, x + s * 0.2, yc - s * 0.2);
          seg(ctx, x - s * 0.6, yc + s * 0.2, x + s * 0.5, yc + s * 0.2);
          const q = loop(f, T * 0.3 + v.b);
          bead(f, x + s * 0.7, yc - s * 0.7 - q * s * 0.4, q, c);
        } else {
          const r = s * 0.8;
          const mx0 = x - r * 0.3;
          ctx.beginPath();
          ctx.arc(mx0, yc, r, Math.PI / 3, (5 * Math.PI) / 3);
          ctx.arc(mx0 + r, yc, r, (4 * Math.PI) / 3, (2 * Math.PI) / 3, true);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = rgba(c, on ? 0.9 : 0.5);
          disc(ctx, x + Math.cos(T * 0.5) * s * 1.1, yc + Math.sin(T * 0.5) * s * 1.1, 1.8);
        }
        if (cw >= 78) name(f, b, words[i] ?? "", x, b.b - 2, "center", on ? c : pal.ink3, 1, cw);
        else if (on) name(f, b, words[i] ?? "", x, b.b - 2, "center", c);
      }
    }),
    part("Overnight adds up", "A position held open is charged again each night it is kept.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const N = 6;
      const y = b.y + b.h * 0.26;
      const base = b.b - 13;
      const cw = b.w / N;
      const unit = Math.max(1, (base - y - 10) / N);
      // the pointer is how many nights the position is held
      const q = loop(f, T * 0.06 + v.a, 0.58);
      const held = lerp(q, px(f, b), k) * N * p;
      ctx.globalAlpha = p * lerp(clamp((1 - q) * 7), 1, k);
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, y, b.r, y);
      seg(ctx, b.x, base, b.r, base);
      const xh = b.x + clamp(held / N) * b.w;
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      ctx.lineWidth = 3;
      seg(ctx, b.x, y, xh, y);
      ctx.lineWidth = 1.4;
      for (let i = 0; i < N; i++) {
        const x = b.x + cw * (i + 0.5);
        const c = clamp(held - i);
        ctx.fillStyle = rgba(pal.gold, c);
        disc(ctx, x, y, 3);
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        ring(ctx, x, y, 3);
        const hh = unit * (i + 1) * c;
        ctx.fillStyle = rgba(ALERT, 0.28);
        ctx.fillRect(x - cw * 0.3, base - hh, cw * 0.6, hh);
        ctx.strokeStyle = rgba(ALERT, 0.9 * c);
        ctx.strokeRect(x - cw * 0.3, base - hh, cw * 0.6, hh);
      }
      ctx.fillStyle = rgba(pal.accent, 1);
      disc(ctx, xh, y, 3.6);
      name(f, b, "nights held", b.x, y - 7, "left", pal.gold);
      name(f, b, "swap so far", b.r, b.b - 2, "right", ALERT);
    }),
    part("Small costs, many trades", "A cost too small to notice once becomes a wide gap over many trades.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const y0 = b.y + b.h * 0.6;
      const gross = (u: number) => y0 - b.h * (0.45 * u - 0.03 * Math.sin(u * 9 + v.phase + T * 0.4) * u);
      const net = (u: number) => gross(u) + b.h * 0.42 * u * p;
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) ctx.lineTo(b.x + (i / 30) * b.w, gross(i / 30));
      for (let i = 30; i >= 0; i--) ctx.lineTo(b.x + (i / 30) * b.w, net(i / 30));
      ctx.closePath();
      ctx.fillStyle = rgba(ALERT, 0.1);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.emerald, 0.95);
      trace(ctx, b, b.x, b.r, 30, gross, p);
      ctx.strokeStyle = rgba(ALERT, 0.95);
      trace(ctx, b, b.x, b.r, 30, net, p);
      // the pointer counts the trades: the further along, the wider the gap
      const um = lerp(0.7 + 0.2 * Math.sin(T * 0.35 + v.phase), clamp(px(f, b), 0.1, 1), k);
      const xm = b.x + um * b.w;
      span(ctx, xm, gross(um) + 2, net(um) - 2);
      ctx.fillStyle = rgba(pal.emerald, 1);
      disc(ctx, xm, gross(um), 2.8);
      ctx.fillStyle = rgba(ALERT, 1);
      disc(ctx, xm, net(um), 2.8);
      if (b.h > 84)
        for (let i = 0; i < 12; i++) {
          const lit = (i + 0.5) / 12 <= um;
          ctx.strokeStyle = rgba(lit ? pal.accent : pal.ink3, lit ? 0.9 : 0.45);
          seg(ctx, b.x + ((i + 0.5) / 12) * b.w, b.b - 2, b.x + ((i + 0.5) / 12) * b.w, b.b - (lit ? 9 : 6));
        }
      name(f, b, "before costs", b.r, gross(1) - 6, "right", pal.emerald);
      name(f, b, "after costs", b.r, net(1) + 12 > b.b - 12 ? net(1) - 6 : net(1) + 12, "right", ALERT);
      name(f, b, "cost", xm - 7, (gross(um) + net(um)) / 2 + 3.5, "right", ALERT, 1, xm - 7 - b.x);
    }),
    part("Count it before you trade", "The nearer the target, the larger the share that the cost takes of it.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const bh = clamp(b.h * 0.22, 10, 40);
      const y = b.cy - bh / 2;
      const c = b.w * 0.17;
      // the pointer sets how far the trade aims: bring the target closer and less is left after the cost
      const L = b.w * lerp(0.66 + 0.3 * Math.sin(T * 0.4 + v.phase), clamp(px(f, b), 0.24, 1), k) * p;
      const rest = Math.max(0, L - c);
      const thin = rest < c * 1.2;
      const rc = thin ? AMBER : pal.emerald;
      const xt = b.x + L;
      ctx.fillStyle = rgba(ALERT, 0.35);
      rr(ctx, b.x, y, Math.min(c, L), bh, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(ALERT, 0.95);
      ctx.stroke();
      ctx.fillStyle = rgba(rc, 0.3);
      rr(ctx, b.x + c, y, rest, bh, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(rc, 0.95);
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      seg(ctx, xt, y - 10, xt, Math.min(b.b, y + bh + 6));
      ctx.fillStyle = rgba(pal.gold, 0.95);
      ctx.beginPath();
      ctx.moveTo(xt, y - 10);
      ctx.lineTo(xt - 9, y - 6);
      ctx.lineTo(xt, y - 2);
      ctx.closePath();
      ctx.fill();
      runner(f, b.x, y + bh / 2, xt, y + bh / 2, T * 0.2 + v.a, pal.ink);
      name(f, b, "cost", b.x + 2, y - 6, "left", ALERT);
      name(f, b, thin ? "little left" : "what is left", b.x + c + rest / 2, y - 6, "center", rc, 1, rest - 26);
      name(f, b, "entry", b.x, y + bh + 14, "left", pal.ink3, 1, L - 56);
      name(f, b, "target", xt, y + bh + 14, "right", pal.gold);
    }),
  ],
}));

const CITIES = ["Sydney", "Tokyo", "London", "New York"] as const;

/** TRADING HOURS: round the clock, four centres in turn, the busy overlaps, the cost of quiet hours, and the weekend gap. */
export const clock = scene((v) => ({
  caption: "Trading hours",
  line: "The currency market runs around the clock through the working week, passing from one financial centre to the next.",
  parts: [
    part("Around the clock", "As one centre closes for the day another has already opened.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const R = Math.min(b.h * 0.34, b.w * 0.28) * (0.6 + 0.4 * p);
      const side = b.w - R * 2.64 - 8 >= 62;
      const cx = side ? b.r - R * 1.32 - 3 : b.cx;
      const cy = b.cy;
      const idle = v.dir * T * 0.4 + v.phase;
      // the hand turns to the pointer
      let diff = Math.atan2(f.my - cy, f.mx - cx) - idle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const ah = idle + diff * k;
      const cols = [pal.teal, pal.gold, pal.accent, pal.emerald] as const;
      const len = TAU * 0.34;
      let best = 0;
      let bestD = 9;
      for (let i = 0; i < 4; i++) {
        const a0 = -Math.PI / 2 + (i * TAU) / 4;
        const off = Math.abs(Math.atan2(Math.sin(ah - a0 - len / 2), Math.cos(ah - a0 - len / 2)));
        const inside = off < len / 2;
        if (off < bestD) {
          bestD = off;
          best = i;
        }
        ctx.strokeStyle = rgba(cols[i] ?? pal.ink3, inside ? 1 : 0.45);
        ctx.lineWidth = inside ? 4 : 3;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (i % 2 ? 1.28 : 1.13), a0, a0 + len * p);
        ctx.stroke();
      }
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = rgba(pal.ink2, 0.9);
      ring(ctx, cx, cy, R);
      ctx.strokeStyle = rgba(pal.ink3, 0.8);
      for (let i = 0; i < 12; i++) {
        const a = (i * TAU) / 12;
        const r0 = R * (i % 3 === 0 ? 0.8 : 0.88);
        seg(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95);
      }
      ctx.strokeStyle = rgba(pal.ink, 0.95);
      ctx.lineWidth = 2;
      seg(ctx, cx, cy, cx + Math.cos(ah) * R * 0.74, cy + Math.sin(ah) * R * 0.74);
      seg(ctx, cx, cy, cx + Math.cos(ah / 12 + v.phase) * R * 0.46, cy + Math.sin(ah / 12 + v.phase) * R * 0.46);
      ctx.lineWidth = 1.4;
      ctx.fillStyle = rgba(pal.ink, 1);
      disc(ctx, cx, cy, 2.6);
      const room = side ? cx - R * 1.32 - b.x - 4 : b.w * 0.5 - R * 0.9;
      if (side) name(f, b, "session", b.x, cy - 8, "left", pal.ink3, 1, room);
      name(f, b, CITIES[best] ?? "", b.x, side ? cy + 7 : b.y + 9, "left", cols[best] ?? pal.ink, 1, room);
    }),
    part("Four centres in turn", "Each works its own day, and each day overlaps the next.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const rh = b.h / 4;
      const lw = b.w >= 190 ? 62 : 0;
      const x0 = b.x + lw;
      const W = b.w - lw;
      const starts = [0, 0.12, 0.38, 0.6] as const;
      const cols = [pal.teal, pal.gold, pal.accent, pal.emerald] as const;
      // the pointer is the time of day: slide it to see who is at work
      const now = lerp(loop(f, T * 0.05 + v.a, 0.44), clamp((f.mx - x0) / Math.max(1, W)), k);
      const bh = clamp(rh * 0.36, 4, 14);
      for (let i = 0; i < 4; i++) {
        const s = starts[i] ?? 0;
        const on = now >= s && now <= s + 0.38;
        const c = cols[i] ?? pal.ink3;
        const by = lw ? b.y + rh * (i + 0.5) - bh / 2 : b.y + rh * (i + 1) - bh - 2;
        ctx.fillStyle = rgba(c, on ? 0.7 : 0.22);
        rr(ctx, x0 + W * s, by, W * 0.38 * p, bh, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(c, on ? 1 : 0.5);
        ctx.stroke();
        if (on) runner(f, x0 + W * s, by + bh / 2, x0 + W * (s + 0.38), by + bh / 2, T * 0.2 + i * 0.3, pal.ink, 1.6);
        if (lw) name(f, b, CITIES[i] ?? "", b.x, by + bh / 2 + 3.5, "left", on ? c : pal.ink3);
        else if (rh >= 22) name(f, b, CITIES[i] ?? "", x0 + W * s, by - 4, "left", on ? c : pal.ink3);
      }
      const xn = x0 + now * W;
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      seg(ctx, xn, b.y, xn, b.b);
      ctx.fillStyle = rgba(pal.ink, 1);
      disc(ctx, xn, b.y + 3, 3);
    }),
    part("Overlaps are busiest", "When two centres are open together the most trading is done.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const bh = clamp(b.h * 0.09, 4, 12);
      const yb1 = b.y + b.h * 0.66;
      const yb2 = b.y + b.h * 0.86;
      const X = (u: number) => b.x + u * b.w;
      const act = (u: number) => {
        const g = (u - 0.54) / 0.11;
        return 0.16 + 0.2 * smooth((u - 0.06) / 0.1) * (1 - smooth((u - 0.9) / 0.08)) + 0.58 * Math.exp(-g * g);
      };
      const top = b.y + 11;
      const Hc = Math.max(4, b.h * 0.5 - 11);
      const Y = (u: number) => top + (1 - act(u) * p) * Hc + 0.8 * Math.sin(u * 40 - T * 1.4);
      ctx.fillStyle = rgba(pal.gold, 0.1 + 0.06 * k);
      ctx.fillRect(X(0.42), top, b.w * 0.24, yb2 + bh - top);
      ctx.fillStyle = rgba(pal.accent, 0.5);
      rr(ctx, X(0.08), yb1, b.w * 0.58 * p, bh, 3);
      ctx.fill();
      ctx.fillStyle = rgba(pal.emerald, 0.5);
      rr(ctx, X(0.42), yb2, b.w * 0.54 * p, bh, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, b.r, 48, Y);
      // the pointer reads how busy any hour is
      const um = lerp(0.54 + 0.3 * Math.sin(T * 0.3 + v.phase), px(f, b), k);
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      dash(ctx, X(um), Y(um), X(um), b.b, 2, 4);
      ctx.fillStyle = rgba(pal.gold, 1);
      disc(ctx, X(um), Y(um), 3.2 + 2 * act(um) * k);
      name(f, b, "overlap", X(0.54), b.y + 9, "center", pal.gold);
      name(f, b, "activity", b.x, b.y + 9, "left", pal.ink3, 1, X(0.54) - 30 - b.x);
      if (b.h >= 96) {
        name(f, b, "London", X(0.08), yb1 - 4, "left", pal.accent);
        name(f, b, "New York", X(0.96), yb2 - 4, "right", pal.emerald);
      }
    }),
    part("Quiet hours cost more", "With fewer people trading, the gap between the two prices widens.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const act = (u: number) => 0.5 + 0.5 * Math.sin(u * TAU * 1.5 + v.phase + v.dir * T * 0.15);
      const ya = (u: number) => b.y + b.h * (0.1 + 0.28 * (1 - act(u) * p));
      const yc = b.y + b.h * 0.72;
      const half = (u: number) => (1.5 + b.h * 0.19 * Math.pow(1 - act(u), 1.5)) * p;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) ctx.lineTo(b.x + (i / 40) * b.w, yc - half(i / 40));
      for (let i = 40; i >= 0; i--) ctx.lineTo(b.x + (i / 40) * b.w, yc + half(i / 40));
      ctx.closePath();
      ctx.fillStyle = rgba(pal.accent, 0.09);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      trace(ctx, b, b.x, b.r, 40, (u) => yc - half(u));
      ctx.strokeStyle = rgba(pal.teal, 0.95);
      trace(ctx, b, b.x, b.r, 40, (u) => yc + half(u));
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, b.r, 40, ya);
      // the pointer reads one hour: how busy it is, and how wide the gap is then
      const um = lerp(0.5 + 0.3 * Math.sin(T * 0.25 + v.phase * 1.3), px(f, b), k);
      const xm = b.x + um * b.w;
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      dash(ctx, xm, ya(um), xm, yc - half(um), 2, 4);
      ctx.fillStyle = rgba(pal.gold, 1);
      disc(ctx, xm, ya(um), 3);
      ctx.strokeStyle = rgba(pal.ink, 0.85);
      span(ctx, xm, yc - half(um) + 2, yc + half(um) - 2);
      name(f, b, "activity", b.x, b.y + 9, "left", pal.ink3);
      name(f, b, "spread", b.x, b.b - 2, "left", pal.accent);
      name(f, b, act(um) > 0.5 ? "busy" : "quiet", xm + (um > 0.5 ? -7 : 7), (ya(um) + yc - half(um)) / 2 + 3.5, um > 0.5 ? "right" : "left", pal.gold);
    }),
    part("Closed at the weekend", "The world keeps moving while the market is shut, so it can reopen elsewhere.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const cellY = b.b - 24;
      const cw = b.w / 7;
      const top = b.y + 4;
      const Hh = Math.max(6, cellY - 6 - top);
      const mid = top + Hh / 2;
      for (let i = 0; i < 7; i++) {
        const shut = i === 3 || i === 4;
        rr(ctx, b.x + cw * i + 2, cellY, cw - 4, 8, 2);
        if (shut) {
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = rgba(pal.accent, 0.4 * p);
          ctx.fill();
          ctx.strokeStyle = rgba(pal.accent, 0.9);
          ctx.stroke();
        }
      }
      const x1 = b.x + cw * 3;
      const x2 = b.x + cw * 5;
      const Y1 = (u: number) => mid + Hh * 0.22 * wander(T * 0.4 - (1 - u) * 2.5, v.phase);
      const yc = Y1(1);
      // the pointer sets where the market reopens: above or below where it closed
      const jump = Hh * lerp(0.3 * Math.sin(T * 0.3 + v.phase * 2), clamp((py(f, b) - 0.5) * 1.2, -0.45, 0.45), k) * p;
      const yo = clamp(yc + jump, top, top + Hh);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, x1, 26, Y1);
      trace(ctx, b, x2, b.r, 16, (u) => clamp(yo + Hh * 0.12 * wander(T * 0.4 + u * 2, v.phase + 1.3) * u, top, top + Hh));
      ctx.strokeStyle = rgba(AMBER, 0.9);
      dash(ctx, x1, yc, x2, yo, 2, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      ring(ctx, x1, yc, 3);
      ctx.fillStyle = rgba(AMBER, 1);
      disc(ctx, x2, yo, 3.2);
      name(f, b, "gap", (x1 + x2) / 2, Math.min(yc, yo) - 6, "center", AMBER);
      name(f, b, "weekend", (x1 + x2) / 2, b.b - 2, "center", pal.ink3);
      name(f, b, "week", b.x, b.b - 2, "left", pal.ink3, 1, cw * 3 - 34);
    }),
  ],
}));

/** DATES: marked days, events known in advance, before and after a release, dates that end a contract, and planning around them. */
export const calendar = scene((v) => ({
  caption: "Dates",
  line: "Markets run to a timetable: some days are known in advance to matter more than the rest.",
  parts: [
    part("Marked days", "Most days pass quietly; a few are ringed long before they come.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const cols = 5;
      const rows = 4;
      const n = cols * rows;
      const marked = Math.floor(v.a * n) % n;
      const pw = Math.min(b.w * 0.6, b.h * 1.15);
      const ph = b.h - 8;
      const spare = b.w - pw;
      const x0 = b.x + (spare >= 130 ? spare * 0.2 : spare / 2);
      const y0 = b.y + 6;
      const head = ph * 0.2;
      rr(ctx, x0, y0, pw, head, 4);
      ctx.fillStyle = rgba(pal.accent, 0.2);
      ctx.fill();
      rr(ctx, x0, y0, pw, ph, 4);
      ctx.strokeStyle = rgba(pal.ink2, 0.9);
      ctx.stroke();
      seg(ctx, x0, y0 + head, x0 + pw * p, y0 + head);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      ctx.lineWidth = 2;
      seg(ctx, x0 + pw * 0.25, y0 - 4, x0 + pw * 0.25, y0 + 4);
      seg(ctx, x0 + pw * 0.75, y0 - 4, x0 + pw * 0.75, y0 + 4);
      ctx.lineWidth = 1.4;
      const gw = pw / cols;
      const gh = (ph - head) / rows;
      const cell = Math.min(gw, gh);
      const today = f.still ? Math.max(0, marked - 2) : Math.floor(T * 0.8) % n;
      let tx = x0;
      let ty = y0;
      let ex = x0;
      let ey = y0;
      for (let i = 0; i < n; i++) {
        const x = x0 + gw * ((i % cols) + 0.5);
        const y = y0 + head + gh * (Math.floor(i / cols) + 0.5);
        // the day under the pointer is picked out
        const over = k > 0.5 && Math.abs(f.mx - x) < gw / 2 && Math.abs(f.my - y) < gh / 2;
        ctx.fillStyle = rgba(i <= today ? pal.ink2 : pal.ink3, i <= today ? 0.9 : 0.5);
        disc(ctx, x, y, Math.min(over ? 3.2 : 1.7, cell * 0.3));
        if (i === today || over) {
          ctx.strokeStyle = rgba(over ? pal.gold : pal.ink3, 0.85);
          ctx.strokeRect(x - cell * 0.32, y - cell * 0.32, cell * 0.64, cell * 0.64);
        }
        if (i === today) {
          tx = x;
          ty = y;
        }
        if (i === marked) {
          ex = x;
          ey = y;
          ctx.strokeStyle = rgba(pal.accent, 1);
          ctx.lineWidth = 1.8;
          ring(ctx, x, y, cell * (0.3 + 0.04 * Math.sin(T * 1.4)) * p);
          ctx.lineWidth = 1.4;
        }
      }
      if (spare >= 130) {
        const lx = x0 + pw + 14;
        const tyy = Math.abs(ty - ey) < 12 ? ey + (ty >= ey ? 12 : -12) : ty;
        ctx.strokeStyle = rgba(pal.accent, 0.5);
        seg(ctx, ex + cell * 0.38, ey, lx - 4, ey);
        ctx.strokeStyle = rgba(pal.ink3, 0.5);
        seg(ctx, tx + cell * 0.38, ty, lx - 4, tyy);
        name(f, b, "event", lx, ey + 3.5, "left", pal.accent);
        name(f, b, "today", lx, tyy + 3.5, "left", pal.ink2);
      }
    }),
    part("Known in advance", "Releases and decisions are scheduled, and some weigh more than others.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const y = b.b - 15;
      const Hm = Math.max(6, y - b.y - 14);
      const us = [0.12, 0.3, 0.47, 0.68, 0.87] as const;
      const imp = [0.45, 0.9, 0.55, 1, 0.5] as const;
      const shift = Math.floor(v.b * 5);
      // the pointer is the present: everything to its right is still to come
      const now = lerp(loop(f, T * 0.05 + v.a, 0.38), px(f, b), k);
      const xn = b.x + now * b.w;
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, y, b.r, y);
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      ctx.lineWidth = 2.4;
      seg(ctx, b.x, y, xn, y);
      ctx.lineWidth = 1.4;
      let next = -1;
      for (let i = 0; i < 5; i++) if (next < 0 && (us[i] ?? 0) > now) next = i;
      for (let i = 0; i < 5; i++) {
        const u = us[i] ?? 0;
        const w = imp[(i + shift) % 5] ?? 0.5;
        const x = b.x + u * b.w;
        const hh = Hm * w * p;
        const past = u <= now;
        const c = i === next ? pal.accent : w > 0.8 ? AMBER : pal.ink3;
        ctx.strokeStyle = rgba(c, past ? 0.3 : 0.95);
        seg(ctx, x, y, x, y - hh);
        ctx.fillStyle = rgba(c, past ? 0.3 : 0.9);
        disc(ctx, x, y - hh, w > 0.8 ? 4 : 3);
        if (i === next) {
          ring(ctx, x, y - hh, 6.5 + 1.2 * Math.sin(T * 1.2));
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(xn, y - 3);
          ctx.quadraticCurveTo((xn + x) / 2, Math.max(b.y + 2, y - hh - 8), x, y - hh);
          ctx.stroke();
          ctx.setLineDash([]);
          name(f, b, "next", x, y - hh - 10, "center", pal.accent);
        }
      }
      ctx.fillStyle = rgba(pal.ink, 0.95);
      ctx.beginPath();
      ctx.moveTo(xn, y + 2);
      ctx.lineTo(xn - 4, y + 8);
      ctx.lineTo(xn + 4, y + 8);
      ctx.closePath();
      ctx.fill();
      name(f, b, "now", xn + (now > 0.5 ? -8 : 8), b.b - 2, now > 0.5 ? "right" : "left", pal.ink2);
    }),
    part("Before, during, after", "Quiet as it approaches, a jump as it lands, then a new level.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      // the pointer moves the moment of the release
      const ue = lerp(0.48 + 0.1 * Math.sin(T * 0.25 + v.phase), clamp(px(f, b), 0.22, 0.78), k);
      const xe = b.x + ue * b.w;
      // the jump goes one way and then the other in turn: the date is known, the direction is not
      const J = b.h * 0.2 * Math.sin(T * 0.35 + v.phase * 2);
      const cyy = b.y + b.h * 0.42;
      const Y = (u: number) => {
        if (u < ue) return cyy + b.h * 0.035 * wander(u * 14 + T * 0.6, v.phase) * (1 - 0.6 * clamp((u - ue + 0.25) / 0.25));
        const s = smooth((u - ue) / 0.03);
        return cyy - J * s + b.h * 0.13 * Math.exp(-(u - ue) * 7) * Math.sin((u - ue) * 42 - T * 1.6) * s;
      };
      ctx.strokeStyle = rgba(AMBER, 0.85);
      dash(ctx, xe, b.y + 2, xe, b.b - 13, 4, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, b.r, 90, Y, p);
      if (b.h >= 96)
        for (let i = 0; i < 18; i++) {
          const u = (i + 0.5) / 18;
          const g = (u - ue - 0.03) / 0.07;
          const hh = 2 + Math.min(14, b.h * 0.1) * Math.exp(-g * g);
          ctx.strokeStyle = rgba(hh > 5 ? AMBER : pal.ink3, 0.7);
          seg(ctx, b.x + u * b.w, b.b - 14, b.x + u * b.w, b.b - 14 - hh);
        }
      name(f, b, "release", xe, b.b - 2, "center", AMBER);
      name(f, b, "before", b.x, b.b - 2, "left", pal.ink3, 1, xe - 30 - b.x);
      name(f, b, "after", b.r, b.b - 2, "right", pal.ink3, 1, b.r - xe - 30);
    }),
    part("Dates that end things", "Some contracts stop on a set day and must be closed or moved on.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const ue = 0.6;
      const xe = b.x + b.w * ue;
      const bh = clamp(b.h * 0.14, 6, 18);
      const y1 = b.y + 14;
      const base = b.b - 4;
      const ct = y1 + bh + 8;
      const Hc = Math.max(4, base - ct);
      // the pointer is the date: slide it past the expiry and the position moves to the next contract
      const q = loop(f, T * 0.05 + v.a, 0.4);
      const now = lerp(q, px(f, b), k);
      ctx.globalAlpha = p * lerp(clamp((1 - q) * 7), 1, k);
      const xn = b.x + now * b.w;
      const live = now < ue;
      ctx.fillStyle = rgba(pal.accent, live ? 0.2 : 0.08);
      rr(ctx, b.x, y1, xe - b.x - 3, bh, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, live ? 0.9 : 0.35);
      ctx.stroke();
      ctx.fillStyle = rgba(pal.teal, live ? 0.08 : 0.2);
      rr(ctx, xe + 3, y1, b.r - xe - 3, bh, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.teal, live ? 0.4 : 0.9);
      ctx.stroke();
      ctx.fillStyle = rgba(live ? pal.accent : pal.teal, 0.45);
      if (live) ctx.fillRect(b.x, y1, Math.max(0, Math.min(xn, xe - 3) - b.x), bh);
      else ctx.fillRect(xe + 3, y1, Math.max(0, xn - xe - 3), bh);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      seg(ctx, xe, y1 - 3, xe, base);
      // what is left of the contract's time, running out towards the day
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      seg(ctx, b.x, base, xe, base);
      ctx.strokeStyle = rgba(pal.gold, live ? 0.95 : 0.35);
      trace(ctx, b, b.x, xe, 30, (u) => base - Hc * Math.sqrt(1 - u) * p);
      if (live) {
        const yl = base - Hc * Math.sqrt(1 - now / ue) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        dash(ctx, xn, y1 + bh, xn, yl, 2, 4);
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, xn, yl, 3);
      } else {
        ctx.strokeStyle = rgba(pal.teal, 0.9);
        arrow(ctx, xe - 12, y1 + bh + 9, xe + 14, y1 + bh + 9, 4);
        name(f, b, "moved on", xe + 8, y1 + bh + 24, "left", pal.teal, 1, b.r - xe - 8);
      }
      ctx.fillStyle = rgba(pal.ink, 1);
      disc(ctx, xn, y1 + bh / 2, 3);
      name(f, b, "expiry", xe, b.y + 9, "center", ALERT);
      name(f, b, "contract", b.x, b.y + 9, "left", pal.accent, 1, xe - 28 - b.x);
      name(f, b, "next", b.r, b.y + 9, "right", pal.teal, 1, b.r - xe - 28);
      if (live) name(f, b, "time left", xe - 6, ct + 9, "right", pal.gold, 1, (xe - b.x) * 0.55);
    }),
    part("Plan around them", "Knowing the date tells you when to be careful, never which way.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const base = b.b - 14;
      const Hm = Math.max(6, base - b.y - b.h * 0.3);
      const cw = b.w / 5;
      // the pointer is the day of the event: the position kept through it is the smallest
      const ec = lerp(2 + 1.6 * Math.sin(T * 0.3 + v.phase), px(f, b) * 5 - 0.5, k);
      const near = (i: number) => {
        const g = (i - ec) / 0.8;
        return Math.exp(-g * g);
      };
      ctx.strokeStyle = rgba(pal.ink, 0.85);
      trace(ctx, b, b.x, b.r, 80, (u) => b.y + b.h * 0.15 + b.h * (0.015 + 0.11 * near(u * 5 - 0.5)) * Math.sin(u * 52 + T * 1.2));
      const bw = Math.min(cw * 0.56, 50);
      for (let i = 0; i < 5; i++) {
        const x = b.x + cw * (i + 0.5);
        const s = 1 - 0.68 * near(i);
        ctx.fillStyle = rgba(pal.accent, 0.25 + 0.3 * s);
        rr(ctx, x - bw / 2, base - Hm * s * p, bw, Hm * s * p, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, base, b.r, base);
      const xe = b.x + clamp((ec + 0.5) / 5) * b.w;
      ctx.strokeStyle = rgba(AMBER, 0.9);
      dash(ctx, xe, b.y + b.h * 0.28, xe, base, 2, 4);
      ring(ctx, xe, base, 4);
      const far: Side = ec < 2 ? "right" : "left";
      name(f, b, "event", xe, b.b - 2, "center", AMBER);
      name(f, b, "size", ec < 2 ? b.r : b.x, b.b - 2, far, pal.accent, 1, b.w * 0.3);
      if (b.h >= 96) name(f, b, "swings", ec < 2 ? b.r : b.x, b.y + 9, far, pal.ink3, 1, b.w * 0.3);
    }),
  ],
}));

/** CANDLESTICKS: four prices in one shape, body and wicks, a rise or a fall, a row of them, and why a pattern is only a hint. */
export const candles = scene((v) => {
  const n = 9;
  const lv: number[] = [0.5];
  const wk: (readonly [number, number])[] = [];
  for (let i = 0; i < n; i++) {
    lv.push(clamp((lv[i] ?? 0.5) + (v.rnd() - 0.5 + v.dir * 0.06) * 0.4, 0.18, 0.82));
    wk.push([0.04 + v.rnd() * 0.08, 0.04 + v.rnd() * 0.08]);
  }
  return {
    caption: "Candlesticks",
    line: "A candlestick packs four prices from one stretch of time into a single shape: where it opened, how high and low it went, and where it closed.",
    parts: [
      part("Four prices in one shape", "Open, high, low and close: one candle for one stretch of time.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const wide = b.w >= 230;
        const bw = clamp(b.w * 0.09, 10, 32);
        const cx = wide ? b.x + Math.max(52, b.w * 0.2) : b.cx;
        const Y = (q: number) => b.b - 4 - q * (b.h - 8);
        const o = 0.38;
        const hi = 0.92;
        const lo = 0.08;
        // the pointer moves the close: above the open the candle is a rise, below it a fall
        const c = lerp(o, lerp(0.7 + 0.08 * Math.sin(T * 0.8 + v.phase), clamp(1 - py(f, b), 0.14, 0.86), k), p);
        const up = c >= o;
        const col = up ? pal.emerald : ALERT;
        candle(ctx, cx, bw, Y(o), Y(c), Y(lerp(o, hi, p)), Y(lerp(o, lo, p)), col, up);
        const left = cx - bw / 2 - 8 - b.x;
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        seg(ctx, cx - bw / 2 - 5, Y(o), cx - bw / 2 - 1, Y(o));
        seg(ctx, cx + bw / 2 + 1, Y(c), cx + bw / 2 + 5, Y(c));
        name(f, b, "open", cx - bw / 2 - 8, Y(o) + 3.5, "right", pal.ink2, 1, left);
        name(f, b, "close", cx + bw / 2 + 8, Y(c) + 3.5, "left", col, 1, b.r - cx - bw / 2 - 8);
        name(f, b, "high", cx - 6, Y(hi) + 8, "right", pal.ink3, 1, cx - 6 - b.x);
        name(f, b, "low", cx - 6, Y(lo) - 1, "right", pal.ink3, 1, cx - 6 - b.x);
        if (!wide) return;
        // beside it, the journey the price made in that time
        const xa = cx + bw / 2 + 60;
        const xb = b.r - 4;
        const g = (u: number, m: number) => Math.exp(-((u - m) / 0.13) * ((u - m) / 0.13));
        const path = (u: number) => Y(lerp(o, c, smooth(u)) + (hi - Math.max(o, c)) * g(u, v.dir > 0 ? 0.3 : 0.7) - (Math.min(o, c) - lo) * g(u, v.dir > 0 ? 0.7 : 0.3));
        ctx.strokeStyle = rgba(pal.line, 1);
        dash(ctx, cx + bw / 2 + 4, Y(hi), xb, Y(hi), 2, 5);
        dash(ctx, cx + bw / 2 + 4, Y(lo), xb, Y(lo), 2, 5);
        const q = loop(f, T * 0.1 + v.a, 0.8);
        const head = clamp(q / 0.75) * p;
        const fade = clamp((1 - q) * 7);
        ctx.strokeStyle = rgba(pal.ink, 0.9 * fade);
        trace(ctx, b, xa, xb, 50, path, head);
        ctx.fillStyle = rgba(col, fade);
        disc(ctx, lerp(xa, xb, head), path(head), 3);
        name(f, b, "price path", v.dir > 0 ? xa : xb, b.b - 2, v.dir > 0 ? "left" : "right", pal.ink3, 1, (xb - xa) * 0.5);
      }),
      part("Body and wicks", "The body runs from open to close; the wicks show how far price strayed.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const cw = b.w / 3;
        const bw = clamp(cw * 0.26, 8, 30);
        const Y = (q: number) => b.b - 15 - q * (b.h - 19);
        const shapes = [
          [0.2, 0.8, 0.86, 0.14, "strong"],
          [0.5, 0.56, 0.9, 0.1, "undecided"],
          [0.7, 0.78, 0.82, 0.12, "rejected"],
        ] as const;
        // the pointer takes the nearest candle and moves its close: the body is the distance from open to close
        const sel = k > 0.02 ? Math.min(2, Math.floor(px(f, b) * 3)) : -1;
        for (let i = 0; i < 3; i++) {
          const sh = shapes[i];
          if (!sh) continue;
          const [o, c0, hi, lo, word] = sh;
          const on = i === sel;
          const x = b.x + cw * (i + 0.5);
          let c = c0 + 0.025 * Math.sin(T * 0.9 + i * 2 + v.phase);
          if (on) c = lerp(c, clamp((b.b - 15 - f.my) / Math.max(1, b.h - 19), lo + 0.04, hi - 0.04), k);
          c = lerp(o, c, p);
          const up = c >= o;
          const col = on ? pal.accent : up ? pal.emerald : ALERT;
          candle(ctx, x, bw, Y(o), Y(c), Y(lerp(o, hi, p)), Y(lerp(o, lo, p)), col, up, on || sel < 0 ? 1 : 0.6);
          if (cw >= 70) name(f, b, word, x, b.b - 2, "center", on ? pal.accent : pal.ink3, 1, cw);
          else if (on || (sel < 0 && i === 1)) name(f, b, word, x, b.b - 2, "center", on ? pal.accent : pal.ink3);
          if (i === 0) {
            ctx.strokeStyle = rgba(pal.ink3, 0.7);
            seg(ctx, x - bw / 2 - 5, Y(o), x - bw / 2 - 5, Y(c));
            name(f, b, "body", x - bw / 2 - 9, (Y(o) + Y(c)) / 2 + 3.5, "right", pal.ink3, 1, cw / 2 - bw / 2 - 9);
          }
          if (i === 1) name(f, b, "wick", x + 7, Y(hi) + 10, "left", pal.ink3, 1, cw / 2 - 8);
        }
      }),
      part("Up or down", "Closed above its open, the candle rose; closed below, it fell.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const Y = (q: number) => b.b - 15 - q * (b.h - 19);
        const bw = clamp(b.w * 0.1, 10, 34);
        const roomy = b.w >= 240;
        // the pointer chooses a candle: its close runs further from its open
        const pick = k > 0.02 ? (f.mx < b.cx ? 0 : 1) : -1;
        for (let i = 0; i < 2; i++) {
          const up = i === 0;
          const on = pick === i;
          const x = b.x + b.w * (up ? 0.27 : 0.73) - (roomy ? 16 : 5);
          const o = up ? 0.28 : 0.72;
          const c = lerp(o, o + (up ? 1 : -1) * (0.4 + 0.03 * Math.sin(T * 0.9 + i) + (on ? 0.1 * k : 0)), p);
          const col = up ? pal.emerald : ALERT;
          candle(ctx, x, bw, Y(o), Y(c), Y(Math.max(o, c) + 0.1 * p), Y(Math.min(o, c) - 0.1 * p), col, up, pick < 0 || on ? 1 : 0.55);
          const xa = x + bw / 2 + 9;
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.lineWidth = on ? 2 : 1.4;
          arrow(ctx, xa, Y(o), xa, Y(c), 5);
          ctx.lineWidth = 1.4;
          runner(f, xa, Y(o), xa, Y(c), T * 0.3 + i * 0.5 + v.a, col, 2);
          if (roomy) {
            name(f, b, "open", xa + 7, Y(o) + 3.5, "left", pal.ink3);
            name(f, b, "close", xa + 7, Y(c) + 3.5, "left", col);
          }
          name(f, b, up ? "rise" : "fall", x, b.b - 2, "center", col, 1, b.w * 0.45);
        }
      }),
      part("A row tells a story", "Side by side they show who had the upper hand, and when it changed.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const step = b.w / n;
        const bw = Math.min(step * 0.55, 22);
        const Y = (q: number) => b.b - 3 - q * (b.h - 17);
        // the pointer picks a candle and rules off its range
        const picked = k > 0.02;
        const sel = picked ? Math.min(n - 1, Math.floor(px(f, b) * n)) : n - 1;
        let yh = b.y;
        let yl = b.b;
        for (let i = 0; i < n; i++) {
          const x = b.x + step * (i + 0.5);
          const grow = smooth(clamp(p * (n + 1) - i));
          const o = lv[i] ?? 0.5;
          let c = lv[i + 1] ?? 0.5;
          if (i === n - 1) c = clamp(c + 0.08 * Math.sin(T * 1.1 + v.phase), 0.14, 0.86);
          c = lerp(o, c, grow);
          const up = c >= o;
          const hi = Math.max(o, c) + (wk[i]?.[0] ?? 0.05) * grow;
          const lo = Math.min(o, c) - (wk[i]?.[1] ?? 0.05) * grow;
          const on = picked && i === sel;
          candle(ctx, x, bw, Y(o), Y(c), Y(hi), Y(lo), on ? pal.accent : up ? pal.emerald : ALERT, up, i === n - 1 && !on ? 0.75 : 1);
          if (i === sel) {
            yh = Y(hi);
            yl = Y(lo);
          }
        }
        if (picked) {
          ctx.strokeStyle = rgba(pal.gold, 0.75 * k);
          dash(ctx, b.x, yh, b.r, yh, 2, 4);
          dash(ctx, b.x, yl, b.r, yl, 2, 4);
          const left = sel >= n / 2;
          name(f, b, "high", left ? b.x : b.r, yh - 4, left ? "left" : "right", pal.gold, k);
          name(f, b, "low", left ? b.x : b.r, yl + 11, left ? "left" : "right", pal.gold, k);
        } else name(f, b, "forming", b.r, b.y + 9, "right", pal.ink3);
      }),
      part("A hint, never a promise", "A pattern says what often followed before, not what will follow now.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const st = (b.w * 0.56) / 5;
        const bw = Math.min(st * 0.55, 22);
        const Y = (q: number) => b.y + 3 + q * (b.h - 18);
        const body = [
          [0.12, 0.26],
          [0.26, 0.4],
          [0.4, 0.53],
          [0.53, 0.62],
        ] as const;
        for (let i = 0; i < 4; i++) {
          const pair = body[i];
          if (!pair) continue;
          const grow = smooth(clamp(p * 6 - i));
          const c = lerp(pair[0], pair[1], grow);
          candle(ctx, b.x + st * (i + 0.5), bw, Y(pair[0]), Y(c), Y(pair[0] - 0.04 * grow), Y(c + 0.05 * grow), ALERT, false);
        }
        const xh = b.x + st * 4.5;
        const low = 0.86 + 0.03 * Math.sin(T * 0.9 + v.phase);
        candle(ctx, xh, bw, Y(0.6), Y(0.56), Y(0.54), Y(lerp(0.6, low, p)), pal.emerald, true);
        ctx.strokeStyle = rgba(pal.gold, 0.8);
        ctx.setLineDash([3, 4]);
        rr(ctx, xh - bw / 2 - 5, Y(0.5), bw + 10, Y(low + 0.04) - Y(0.5), 5);
        ctx.stroke();
        // the pointer leans towards one outcome; the other never goes away
        const wu = lerp(0.5, clamp(1 - py(f, b)), k);
        const x0 = xh + bw / 2 + 7;
        const y0 = Y(0.56);
        const xe = b.r - 4;
        const q = loop(f, T * 0.14 + v.a);
        const ends = [
          [0.1, pal.emerald, wu],
          [0.9, ALERT, 1 - wu],
        ] as const;
        for (const [qe, col, w] of ends) {
          const ye = Y(qe);
          ctx.strokeStyle = rgba(col, 0.35 + 0.6 * w);
          ctx.lineWidth = 1.2 + w;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo((x0 + xe) / 2, y0, lerp(x0, xe, p), lerp(y0, ye, p));
          ctx.stroke();
          bead(f, lerp(x0, xe, q), y0 + q * q * (ye - y0), q, col, 2.4);
        }
        ctx.setLineDash([]);
        ctx.lineWidth = 1.4;
        name(f, b, "pattern", xh, b.b - 2, "center", pal.gold);
        name(f, b, "either way", xe, y0 + 3.5, "right", pal.ink2, 1, (xe - x0) * 0.8);
      }),
    ],
  };
});

/** TREND: the direction under the noise, higher highs and higher lows, averages that smooth, the late crossing, and the end of a trend. */
export const trend = scene((v) => {
  const from = v.dir > 0 ? 0.74 : 0.26;
  const to = v.dir > 0 ? 0.26 : 0.74;
  const kf = 12 + v.a * 5;
  /** the direction itself, and the price that zigzags about it; both as a share of the box's height */
  const L = (u: number) => lerp(from, to, u);
  const price = (u: number, T: number) => L(u) + 0.1 * Math.sin(u * kf + v.phase - T * 0.7) + 0.035 * Math.sin(u * 31 + v.phase * 2);
  return {
    caption: "Trend",
    line: "A trend is the general direction of a price once you look past its small zigzags.",
    parts: [
      part("Direction under the noise", "Price never moves straight, yet it leans one way more than the other.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const Y = (q: number) => b.y + q * b.h;
        const x2 = b.x + (b.w - 3) * p;
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        dash(ctx, b.x, Y(from), x2, Y(L(p)), 6, 4);
        arrow(ctx, lerp(b.x, x2, 0.96), Y(L(p * 0.96)), x2, Y(L(p)), 6);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, b, b.x, b.r, 70, (u) => Y(price(u, T)), p);
        // the pointer reads one moment: how far the price stands from its direction
        const um = lerp(0.5 + 0.3 * Math.sin(T * 0.3 + v.phase), px(f, b), k) * p;
        const xm = b.x + um * b.w;
        const yp = Y(price(um, T));
        const yt = Y(L(um));
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.ink3, 0.35);
        seg(ctx, xm, b.y, xm, b.b);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        seg(ctx, xm, yp, xm, yt);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.ink, 1);
        disc(ctx, xm, yp, 3);
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, xm, yt, 3);
        name(f, b, "noise", xm + (um > 0.5 ? -7 : 7), (yp + yt) / 2 + 3.5, um > 0.5 ? "right" : "left", pal.teal);
        name(f, b, "trend", b.x, Y(from) + (v.dir > 0 ? 13 : -7), "left", pal.gold);
      }),
      part("Higher highs, higher lows", "In a rising trend each peak and each dip stands above the last.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const pts = [0.88, 0.6, 0.72, 0.4, 0.52, 0.2, 0.34] as const;
        const PX = (i: number) => b.x + 6 + (i / 6) * (b.w - 12);
        const PY = (i: number) => b.y + b.h * ((pts[i] ?? 0.5) + 0.02 * Math.sin(i * 2.1 + v.phase) + 0.012 * Math.sin(T * 0.8 + i));
        ctx.strokeStyle = rgba(pal.teal, 0.7);
        dash(ctx, PX(0), PY(0), lerp(PX(0), PX(6), p), lerp(PY(0), PY(6), p), 3, 4);
        ctx.strokeStyle = rgba(pal.gold, 0.7);
        dash(ctx, PX(1), PY(1), lerp(PX(1), PX(5), p), lerp(PY(1), PY(5), p), 3, 4);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(PX(0), PY(0));
        for (let i = 1; i <= 6; i++) {
          const fr = clamp(p * 6 - (i - 1));
          if (fr <= 0) break;
          ctx.lineTo(lerp(PX(i - 1), PX(i), fr), lerp(PY(i - 1), PY(i), fr));
        }
        ctx.stroke();
        ctx.lineWidth = 1.4;
        // the pointer steps from one turning point to the next
        const sel = k > 0.02 ? Math.round(px(f, b) * 6) : -1;
        for (let i = 0; i <= 6; i++) {
          const high = i % 2 === 1;
          const on = i === sel;
          const c = high ? pal.gold : pal.teal;
          ctx.fillStyle = rgba(c, on ? 0.9 : 0.25);
          disc(ctx, PX(i), PY(i), on ? 5.5 : 3.5);
          ctx.strokeStyle = rgba(c, 0.95);
          ring(ctx, PX(i), PY(i), on ? 5.5 : 3.5);
          if (on || (sel < 0 && (i === 3 || i === 4))) name(f, b, i < 2 ? (high ? "high" : "low") : high ? "higher high" : "higher low", PX(i), PY(i) + (high ? -9 : 16), "center", c);
        }
      }),
      part("Averages smooth it", "An average of recent prices irons out the zigzag, at the cost of delay.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const tall = b.h >= 84;
        const Hc = tall ? b.h - 24 : b.h;
        const Y = (q: number) => b.y + q * Hc;
        // the pointer sets how many prices are averaged: more of them, a smoother and later line
        const s = lerp(0.5 + 0.35 * Math.sin(T * 0.3 + v.phase), px(f, b), k);
        const avg = (u: number) => L(u) + 0.1 * (1 - 0.85 * s) * Math.sin(u * kf + v.phase - T * 0.7 - s * 1.5);
        ctx.strokeStyle = rgba(pal.ink, 0.45);
        trace(ctx, b, b.x, b.r, 70, (u) => Y(price(u, T)), p);
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        ctx.lineWidth = 2.2;
        trace(ctx, b, b.x, b.r, 50, (u) => Y(avg(u)), p);
        ctx.lineWidth = 1.4;
        runner(f, b.x, Y(avg(0)), b.r, Y(avg(1)), T * 0.12 + v.a, pal.teal);
        name(f, b, "average", b.x, v.dir > 0 ? b.y + 9 : b.y + Hc - 2, "left", pal.teal);
        if (!tall) return;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x + 4, b.b - 6, b.r - 4, b.b - 6);
        ctx.fillStyle = rgba(pal.teal, 1);
        disc(ctx, b.x + 4 + s * (b.w - 8), b.b - 6, 4.5);
        name(f, b, "short", b.x, b.b - 13, "left", pal.ink3, 1, b.w * 0.4);
        name(f, b, "long", b.r, b.b - 13, "right", pal.ink3, 1, b.w * 0.4);
      }),
      part("When the lines cross", "A fast average crossing a slow one marks a turn, after it has begun.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const d = v.dir;
        const X = (u: number) => b.x + u * b.w;
        const Y = (q: number) => b.y + q * b.h;
        // the pointer moves the crossing along
        const uc = lerp(0.52 + 0.12 * Math.sin(T * 0.3 + v.phase), clamp(px(f, b), 0.25, 0.8), k);
        const S = (u: number) => Math.sin(clamp((u - uc) * 2.4, -1.45, 1.45));
        const drift = (u: number) => 0.02 * Math.sin(u * 9 + T * 0.5);
        const fast = (u: number) => 0.5 - d * 0.25 * S(u) + drift(u);
        const slow = (u: number) => 0.5 - d * 0.1 * (u - uc) + drift(u);
        const pr = (u: number) => 0.5 - d * 0.25 * S(u + 0.12) + drift(u) + 0.05 * Math.sin(u * 26 + v.phase - T * 0.8);
        ctx.strokeStyle = rgba(pal.ink, 0.45);
        trace(ctx, b, b.x, b.r, 70, (u) => Y(pr(u)), p);
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        trace(ctx, b, b.x, b.r, 40, (u) => Y(slow(u)), p);
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        trace(ctx, b, b.x, b.r, 40, (u) => Y(fast(u)), p);
        const yc = Y(0.5 + drift(uc));
        const ut = Math.max(0.03, uc - 0.3);
        const yt = Y(pr(ut));
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        dash(ctx, X(ut) + 5, yt, X(uc) - 7, yc, 2, 4);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ring(ctx, X(ut), yt, 3.5);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ring(ctx, X(uc), yc, 6 + Math.sin(T * 1.2));
        name(f, b, "turn", X(ut), yt + (d > 0 ? 15 : -8), "center", pal.ink2);
        name(f, b, "cross", X(uc), yc + (d > 0 ? 19 : -11), "center", pal.accent);
        name(f, b, "fast", b.r, Y(fast(1)) + (d > 0 ? -6 : 13), "right", pal.teal);
        name(f, b, "slow", b.r, Y(slow(1)) + (d > 0 ? 13 : -6), "right", pal.gold);
      }),
      part("Trends end", "No trend lasts, and none says in advance when it will give way.", (f, b, k, p) => {
        const { ctx, pal } = f;
        const T = f.t * v.speed;
        const X = (u: number) => b.x + u * b.w;
        const Y = (q: number) => b.y + q * b.h;
        // the pointer chooses where the trend gives way
        const ub = lerp(0.6 + 0.1 * Math.sin(T * 0.25 + v.phase), clamp(px(f, b), 0.3, 0.85), k);
        const line = (u: number) => 0.8 - 0.6 * u;
        const A = (u: number) => line(u) + 0.05 * Math.sin(u * 26 + v.phase - T * 0.6);
        const B = (u: number) => line(ub) + 0.06 * Math.sin((u - ub) * 24 - T * 0.6) + 0.3 * (u - ub);
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        seg(ctx, X(0), Y(0.8), X(ub * p), Y(line(ub * p)));
        ctx.strokeStyle = rgba(pal.gold, 0.4);
        dash(ctx, X(ub), Y(line(ub)), X(1), Y(0.2), 3, 5);
        runner(f, X(0), Y(0.8), X(ub), Y(line(ub)), T * 0.15 + v.a, pal.gold);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        trace(ctx, b, b.x, b.r, 80, (u) => Y(lerp(A(u), B(u), smooth((u - ub) / 0.08 + 0.5))), p);
        ctx.strokeStyle = rgba(AMBER, 0.95);
        ring(ctx, X(ub), Y(line(ub)), 6);
        name(f, b, "break", X(ub), Y(line(ub)) - 11, "center", AMBER);
        name(f, b, "trend", b.x, Y(0.8) + 13, "left", pal.gold);
        name(f, b, "unknown", b.r, Y(0.2) - 6, "right", pal.ink3, 1, b.r - X(ub) - 34);
      }),
    ],
  };
});

/** VOLATILITY: how wide the swings are, calm against storm, how it clusters, what it does to a fixed stop, and sizing a position to it. */
export const volatility = scene((v) => ({
  caption: "Volatility",
  line: "Volatility is how far and how fast a price swings, whichever way it happens to be going.",
  parts: [
    part("How wide the swings", "The same market is calm at one time and wild at another.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const at = px(f, b);
      const mid = (u: number) => b.cy + b.h * 0.05 * Math.sin(u * 3 + v.phase);
      // the band opens wider under the pointer
      const wid = (u: number) => {
        const sw = 0.5 + 0.5 * Math.sin(u * (4 + v.a * 3) - v.dir * T * 0.5 + v.phase);
        return (2 + b.h * (0.05 + 0.2 * sw * sw + 0.1 * k * clamp(1 - Math.abs(u - at) / 0.28))) * p;
      };
      const N = 56;
      let un = 0.5;
      let uw = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        ctx.lineTo(b.x + u * b.w, mid(u) - wid(u));
        if (u > 0.1 && u < 0.9) {
          if (wid(u) < wid(un)) un = u;
          if (wid(u) > wid(uw)) uw = u;
        }
      }
      for (let i = N; i >= 0; i--) ctx.lineTo(b.x + (i / N) * b.w, mid(i / N) + wid(i / N));
      ctx.closePath();
      ctx.fillStyle = rgba(pal.accent, 0.1);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.9);
      trace(ctx, b, b.x, b.r, N, (u) => mid(u) - wid(u));
      trace(ctx, b, b.x, b.r, N, (u) => mid(u) + wid(u));
      ctx.strokeStyle = rgba(pal.ink, 0.85);
      ctx.lineWidth = 1.2;
      trace(ctx, b, b.x, b.r, 96, (u) => mid(u) + wid(u) * 0.82 * Math.sin(u * 43 + v.phase) * Math.sin(u * 11 + T * 0.8 + v.phase));
      ctx.lineWidth = 1.4;
      name(f, b, "calm", b.x + un * b.w, mid(un) - wid(un) - 5, "center", pal.teal);
      if (Math.abs(uw - un) * b.w > 60) name(f, b, "volatile", b.x + uw * b.w, mid(uw) - wid(uw) - 5, "center", AMBER);
    }),
    part("Calm and storm", "Around the same level, the swings can be small or very large.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const X = (u: number) => b.x + u * b.w;
      // the pointer moves the moment the calm ends
      const ud = lerp(0.5 + 0.18 * Math.sin(T * 0.25 + v.phase), clamp(px(f, b), 0.15, 0.85), k);
      const amp = (u: number) => b.h * lerp(0.045, 0.3, smooth((u - ud) / 0.14 + 0.5)) * p;
      ctx.strokeStyle = rgba(pal.line, 1);
      seg(ctx, b.x, b.cy, b.r, b.cy);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      ctx.setLineDash([2, 4]);
      trace(ctx, b, b.x, b.r, 40, (u) => b.cy - amp(u));
      trace(ctx, b, b.x, b.r, 40, (u) => b.cy + amp(u));
      ctx.setLineDash([]);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x + 10, b.r - 10, 110, (u) => b.cy + amp(u) * Math.sin(u * 58 + v.phase - T) * (0.62 + 0.38 * Math.sin(u * 17 + v.phase)));
      ctx.strokeStyle = rgba(AMBER, 0.8);
      dash(ctx, X(ud), b.y + 12, X(ud), b.b - 2, 4, 4);
      ctx.strokeStyle = rgba(pal.teal, 0.95);
      span(ctx, b.x + 4, b.cy - amp(0), b.cy + amp(0));
      ctx.strokeStyle = rgba(AMBER, 0.95);
      span(ctx, b.r - 4, b.cy - amp(1), b.cy + amp(1));
      name(f, b, "calm", b.x, b.y + 9, "left", pal.teal, 1, X(ud) - b.x - 8);
      name(f, b, "volatile", b.r, b.y + 9, "right", AMBER, 1, b.r - X(ud) - 8);
      if (b.h >= 100) name(f, b, "same level", b.cx, b.b - 2, "center", pal.ink3, 1, b.w * 0.5);
    }),
    part("It comes in clusters", "Wild days tend to follow wild days, and quiet days quiet ones.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const N = clamp(Math.floor(b.w / 13), 8, 28);
      const base = b.b - 13;
      const Hm = Math.max(6, base - b.y - 13);
      const cw = b.w / N;
      const env = (u: number) => {
        const s = 0.5 + 0.5 * Math.sin(u * TAU * 1.4 + v.phase - v.dir * T * 0.22);
        return s * s;
      };
      // the pointer picks a day and names the spell it belongs to
      const picked = k > 0.02;
      const sel = picked ? Math.min(N - 1, Math.floor(px(f, b) * N)) : Math.floor(N * 0.5);
      for (let i = 0; i < N; i++) {
        const e = env((i + 0.5) / N);
        const hh = Hm * (0.1 + 0.85 * e * (0.62 + 0.38 * Math.sin(i * 12.9898 + v.phase * 3))) * p;
        const on = picked && i === sel;
        ctx.fillStyle = rgba(on ? pal.gold : e > 0.4 ? pal.accent : pal.ink3, on ? 0.9 : 0.3 + 0.4 * e);
        ctx.fillRect(b.x + cw * i + 1, base - hh, Math.max(1, cw - 2), hh);
      }
      ctx.strokeStyle = rgba(pal.teal, 0.7);
      trace(ctx, b, b.x, b.r, 40, (u) => base - Hm * (0.1 + 0.85 * env(u)) * p - 3);
      ctx.strokeStyle = rgba(pal.ink3, 0.7);
      seg(ctx, b.x, base, b.r, base);
      arrow(ctx, b.r - Math.min(40, b.w * 0.3), b.b - 5, b.r - 1, b.b - 5, 4);
      const us = (sel + 0.5) / N;
      const busy = env(us) > 0.4;
      name(f, b, busy ? "wild spell" : "quiet spell", b.x + us * b.w, b.y + 9, "center", busy ? pal.accent : pal.ink3);
      name(f, b, "day after day", b.x, b.b - 2, "left", pal.ink3, 1, b.w - 48);
    }),
    part("Same stop, different odds", "A stop that holds in a calm market is soon reached in a wild one.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      // the pointer sets how wild the market is: the higher it is, the wider the swings
      const vol = lerp(0.5 + 0.45 * Math.sin(T * 0.3 + v.phase), clamp(1 - py(f, b)), k);
      const amp = b.h * lerp(0.06, 0.33, vol) * p;
      const ye = b.y + b.h * 0.4;
      const ys = b.y + b.h * 0.62;
      const N = 80;
      const Y = (u: number) => ye + amp * Math.sin(u * 14 + v.phase - T * 0.5) * (0.55 + 0.45 * Math.sin(u * 5.3 + v.phase * 2)) * smooth(u * 6);
      let hit = -1;
      for (let i = 0; i <= N; i++)
        if (Y(i / N) >= ys) {
          hit = i;
          break;
        }
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      dash(ctx, b.x, ye, b.r, ye, 2, 4);
      ctx.strokeStyle = rgba(ALERT, 0.9);
      dash(ctx, b.x, ys, b.r, ys, 5, 4);
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, b.x, b.r, N, Y, hit < 0 ? 1 : hit / N);
      if (hit >= 0) {
        // what the price went on to do, once the trade was already closed
        ctx.strokeStyle = rgba(pal.ink3, 0.35);
        ctx.beginPath();
        for (let i = hit; i <= N; i++) ctx.lineTo(b.x + (i / N) * b.w, clamp(Y(i / N), b.y, b.b));
        ctx.stroke();
        ctx.strokeStyle = rgba(ALERT, 1);
        ctx.lineWidth = 1.8;
        cross(ctx, b.x + (hit / N) * b.w, ys, 4);
        ctx.lineWidth = 1.4;
      }
      name(f, b, "entry", b.x, ye - 5, "left", pal.ink3);
      name(f, b, "stop", b.x, ys + 11, "left", ALERT);
      name(f, b, hit >= 0 ? "stopped out" : "holds", b.r, ys + 11, "right", hit >= 0 ? ALERT : pal.emerald, 1, b.w - 40);
    }),
    part("Size to the swings", "Wider swings call for a smaller position to risk the same amount.", (f, b, k, p) => {
      const { ctx, pal } = f;
      const T = f.t * v.speed;
      const base = b.b - 14;
      const top = b.y + 4;
      const H = Math.max(8, base - top);
      const cyz = (top + base) / 2;
      // the pointer sets the swings: the wider they are, the smaller the position that risks the same
      const vol = lerp(0.5 + 0.4 * Math.sin(T * 0.35 + v.phase), px(f, b), k);
      const sw = lerp(0.2, 0.9, vol);
      const x1 = b.x + b.w * 0.17;
      const x2 = b.x + b.w * 0.5;
      const x3 = b.x + b.w * 0.83;
      const cw = Math.min(b.w * 0.2, 70);
      const a = (H * sw * p) / 2;
      ctx.strokeStyle = rgba(pal.ink, 0.9);
      trace(ctx, b, x1 - cw / 2, x1 + cw / 2 - 8, 24, (u) => cyz + a * Math.sin(u * TAU * 1.5 + T * 0.9));
      ctx.strokeStyle = rgba(AMBER, 0.95);
      span(ctx, x1 + cw / 2, cyz - a, cyz + a);
      const hs = H * 0.9 * (0.2 / sw) * p;
      ctx.fillStyle = rgba(pal.accent, 0.4 + 0.2 * k);
      rr(ctx, x2 - cw / 2 + 4, base - hs, cw - 8, hs, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.95);
      ctx.stroke();
      const hr = H * 0.5 * p;
      ctx.fillStyle = rgba(pal.emerald, 0.35);
      rr(ctx, x3 - cw / 2 + 4, base - hr, cw - 8, hr, 3);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.emerald, 0.95);
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      dash(ctx, x3 - cw / 2 - 2, base - hr, b.r, base - hr, 2, 4);
      seg(ctx, x2 - cw / 2, base, b.r, base);
      // "times" and "equals", as marks
      const r = clamp(b.w * 0.022, 2.5, 5);
      ctx.strokeStyle = rgba(pal.ink3, 0.9);
      cross(ctx, b.x + b.w * 0.335, cyz, r);
      seg(ctx, b.x + b.w * 0.665 - r, cyz - 2.5, b.x + b.w * 0.665 + r, cyz - 2.5);
      seg(ctx, b.x + b.w * 0.665 - r, cyz + 2.5, b.x + b.w * 0.665 + r, cyz + 2.5);
      name(f, b, "swing", x1, b.b - 2, "center", AMBER, 1, b.w / 3 + 8);
      name(f, b, "size", x2, b.b - 2, "center", pal.accent, 1, b.w / 3 + 8);
      name(f, b, "risk", x3, b.b - 2, "center", pal.emerald, 1, b.w / 3 + 8);
    }),
  ],
}));
