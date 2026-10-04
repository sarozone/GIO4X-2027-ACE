import { ALERT, TAU, arrow, clamp, disc, lerp, near, rgba, ring, rr, seg, smooth, stage, vary, word, type Maker } from "./kit";

/**
 * Gap figures, first set: what a trade is made of (spread, leverage, margin,
 * stop, costs) and how a market is read (hours, dates, candles, trend,
 * volatility). One idea each, one caption each, no number anywhere.
 */

/** two prices running side by side; the arrow measures the gap, which opens under the pointer */
export const spread: Maker = (seed) => {
  const s = vary(seed);
  const waves = 3 + s.a * 2.5;
  return (f) => {
    const b = stage(f, "SPREAD");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const mid = (x: number) => b.cy + b.h * 0.12 * Math.sin(((x - b.x) / b.w) * waves * s.dir + s.phase + t * 0.5);
    const half = (x: number) => 2 + b.h * (0.1 + 0.05 * Math.sin(t * 0.7 * s.speed + s.phase) + 0.07 * hover * clamp(1 - Math.abs(x - mx) / (b.w * 0.3))) * enter;
    ctx.beginPath();
    for (let x = b.x; x <= b.r; x += 4) ctx.lineTo(x, mid(x) - half(x));
    for (let x = b.r; x >= b.x; x -= 4) ctx.lineTo(x, mid(x) + half(x));
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.09);
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.strokeStyle = rgba(side < 0 ? pal.accent : pal.teal, 0.9);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = b.x; x <= b.r; x += 4) ctx.lineTo(x, mid(x) + side * half(x));
      ctx.stroke();
    }
    word(f, "ASK", b.x, mid(b.x) - half(b.x) - 6, "left", pal.accent);
    word(f, "BID", b.x, Math.min(b.b, mid(b.x) + half(b.x) + 13), "left", pal.teal);
    const idle = b.cx + b.w * 0.26 * Math.sin(t * 0.35 + s.phase);
    const xm = lerp(idle, clamp(mx, b.x + 30, b.r - 8), hover);
    const top = mid(xm) - half(xm) + 3;
    const bot = mid(xm) + half(xm) - 3;
    ctx.strokeStyle = rgba(pal.ink, 0.85);
    ctx.lineWidth = 1.2;
    if (bot - top > 8) {
      arrow(ctx, xm, (top + bot) / 2, xm, top, 4);
      arrow(ctx, xm, (top + bot) / 2, xm, bot, 4);
    } else seg(ctx, xm, top, xm, bot);
  };
};

/** a beam on a fulcrum: a small block on the long arm holds up a large one; lean on the long arm and it lifts */
export const leverage: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "LEVERAGE");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const d = s.dir;
    const px = b.cx + d * b.w * 0.2;
    const py = b.y + b.h * 0.66;
    const L1 = Math.min(b.w * 0.6, b.h * 1.05);
    const L2 = L1 * (0.32 + s.a * 0.08);
    const big = b.u * (0.28 + 0.07 * s.b) * enter;
    const small = b.u * 0.13 * enter;
    const push = hover * clamp(((px - mx) * d) / L1, -0.4, 1);
    const th = (0.08 * Math.sin(t * 0.8 * s.speed + s.phase) + 0.15 * push) * enter;
    // the ground and the fulcrum
    ctx.strokeStyle = rgba(pal.ink3, 0.7);
    seg(ctx, b.x, b.b - 1, b.r, b.b - 1);
    ctx.fillStyle = rgba(pal.ink2, 0.85);
    ctx.beginPath();
    ctx.moveTo(px, py + 2);
    ctx.lineTo(px - b.u * 0.1, b.b - 1);
    ctx.lineTo(px + b.u * 0.1, b.b - 1);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-d * th);
    ctx.strokeStyle = rgba(pal.ink, 0.9);
    ctx.lineWidth = 3;
    seg(ctx, -d * L1, 0, d * L2, 0);
    ctx.lineWidth = 1.4;
    const sx = -d * (L1 - small / 2 - 2);
    ctx.fillStyle = rgba(pal.accent, 0.9);
    ctx.fillRect(sx - small / 2, -2.5 - small, small, small);
    const bx = d * (L2 - big / 2);
    ctx.fillStyle = rgba(pal.gold, 0.22);
    ctx.fillRect(bx - big / 2, -2.5 - big, big, big);
    ctx.strokeStyle = rgba(pal.gold, 0.95);
    ctx.strokeRect(bx - big / 2, -2.5 - big, big, big);
    ctx.restore();
  };
};

/** a vessel of margin with a line near the bottom; the level falls towards it, and follows the pointer up and down */
export const margin: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "MARGIN");
    if (!b) return;
    const { ctx, t, pal, hover, my, enter } = f;
    const cw = Math.min(b.w * 0.42, b.h * 0.95);
    const x0 = b.cx - cw / 2 + s.dir * b.w * 0.1;
    const top = b.y + 2;
    const bot = b.b - 2;
    const H = bot - top;
    const lim = 0.22 + 0.1 * s.a;
    const idle = 0.56 + 0.32 * Math.sin(t * 0.5 * s.speed + s.phase);
    const level = lerp(idle, clamp(1 - (my - top) / H, 0.08, 0.96), hover) * enter;
    const low = level < lim + 0.03;
    const c = low ? ALERT : pal.teal;
    const ys = bot - level * H;
    ctx.beginPath();
    ctx.moveTo(x0, bot);
    for (let x = x0; x <= x0 + cw; x += 4) ctx.lineTo(x, Math.min(bot, ys + Math.sin(x * 0.09 + t * 2) * 1.6));
    ctx.lineTo(x0 + cw, bot);
    ctx.closePath();
    ctx.fillStyle = rgba(c, 0.3);
    ctx.fill();
    ctx.strokeStyle = rgba(c, 0.95);
    seg(ctx, x0, ys, x0 + cw, ys);
    // the vessel, open at the top
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, bot);
    ctx.lineTo(x0 + cw, bot);
    ctx.lineTo(x0 + cw, top);
    ctx.stroke();
    // the line that must not be crossed
    const yl = bot - lim * H;
    ctx.strokeStyle = rgba(ALERT, low ? 1 : 0.75);
    ctx.setLineDash([5, 4]);
    seg(ctx, x0 - 10, yl, x0 + cw + 10, yl);
    ctx.setLineDash([]);
    // a pointer on the open side showing where the level stands
    const ax = x0 + (s.dir > 0 ? -1 : 1) * 16 + (s.dir > 0 ? 0 : cw);
    ctx.strokeStyle = rgba(pal.ink, 0.8);
    arrow(ctx, ax + (s.dir > 0 ? -12 : 12), ys, ax + (s.dir > 0 ? 10 : -10), ys, 4);
  };
};

/** a price wanders above a dashed level and is taken out when it reaches it; the pointer moves the level */
export const stop: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "STOP LOSS");
    if (!b) return;
    const { ctx, t, pal, hover, my, still, enter } = f;
    const lvl = lerp(0.8, clamp((my - b.y) / b.h, 0.68, 0.88), hover);
    const ys = b.y + b.h * lvl;
    const X = (p: number) => (s.dir > 0 ? b.x + p * b.w : b.r - p * b.w);
    const Y = (p: number) => {
      const free = 0.38 + 0.15 * Math.sin(p * 6.5 + s.phase) + 0.08 * Math.sin(p * 15 + s.phase * 1.7) - 0.1 * p;
      return b.y + b.h * lerp(free, lvl, smooth((p - 0.7) / 0.3));
    };
    ctx.strokeStyle = rgba(ALERT, 0.9);
    ctx.setLineDash([5, 4]);
    seg(ctx, b.x, ys, b.r, ys);
    ctx.setLineDash([]);
    word(f, "STOP", s.dir > 0 ? b.x : b.r, Math.min(b.b, ys + 12), s.dir > 0 ? "left" : "right", ALERT);
    const prog = still ? 1 : clamp(((t * 0.16 * s.speed + s.a) % 1.3) * enter);
    ctx.strokeStyle = rgba(pal.ink, 0.9);
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    const n = 48;
    for (let i = 0; i <= n; i++) {
      const p = (i / n) * prog;
      ctx.lineTo(X(p), Y(p));
    }
    ctx.stroke();
    const hx = X(prog);
    const hy = Y(prog);
    if (prog >= 1) {
      ctx.strokeStyle = rgba(ALERT, 1);
      ctx.lineWidth = 1.8;
      seg(ctx, hx - 4, hy - 4, hx + 4, hy + 4);
      seg(ctx, hx - 4, hy + 4, hx + 4, hy - 4);
    } else {
      ctx.fillStyle = rgba(pal.accent, 1);
      disc(ctx, hx, hy, 3.2);
    }
  };
};

/** a stack of coins; each trade (a tick along the top) sends one coin off the stack, towards the pointer if it is there */
export const costs: Maker = (seed) => {
  const s = vary(seed);
  const N = 6;
  return (f) => {
    const b = stage(f, "COSTS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const d = s.dir;
    const sx = b.cx - d * b.w * 0.2;
    const rx = Math.min(b.w * 0.16, b.h * 0.28);
    const ry = rx * 0.3;
    const th = b.h * 0.085;
    const base = b.b - ry - 2;
    const c = still ? 2.45 : t * 0.45 * s.speed + s.a * N;
    const k = Math.floor(c) % (N - 1);
    const e = c - Math.floor(c);
    const sitting = Math.max(1, Math.round((N - 1 - k) * enter));
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
      if (lid) ctx.ellipse(x, y - th, rx, ry, 0, 0, TAU);
      else ctx.ellipse(x, y - th, rx, ry, 0, 0, Math.PI);
      if (lid) ctx.fill();
      ctx.stroke();
    };
    for (let i = 0; i < sitting; i++) coin(sx, base - i * th, 0.95, i === sitting - 1);
    // the coin that is leaving
    const y0 = base - sitting * th;
    const tx = lerp(sx + d * b.w * 0.4, clamp(mx, b.x + rx, b.r - rx), hover);
    const fx = lerp(sx, tx, smooth(e));
    const fy = lerp(y0, Math.min(y0 + b.h * 0.2, base), e * e) - Math.sin(e * Math.PI) * b.h * 0.1;
    coin(fx, fy, (1 - e * 0.85) * enter, true);
    // the trades
    const x1 = d > 0 ? b.cx : b.x + 4;
    for (let i = 0; i < N - 1; i++) {
      const x = x1 + (i * (b.w * 0.5 - 8)) / (N - 2);
      const lit = i <= k;
      ctx.strokeStyle = rgba(lit ? pal.accent : pal.ink3, lit ? 0.95 : 0.5);
      ctx.lineWidth = lit ? 2 : 1.2;
      seg(ctx, x, b.y + 3, x, b.y + 11);
    }
  };
};

/** a clock face ringed by three session arcs that overlap; the hand lights the session it is in and turns to the pointer */
export const clock: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "TRADING HOURS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, my, enter } = f;
    const R = b.u * 0.36;
    const cx = b.cx;
    const cy = b.cy;
    const idle = s.dir * t * 0.5 * s.speed + s.phase;
    let diff = Math.atan2(my - cy, mx - cx) - idle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    const ah = idle + diff * hover;
    const arcs = [pal.teal, pal.gold, pal.accent];
    const len = TAU * (0.36 + 0.05 * s.a);
    arcs.forEach((c, i) => {
      const a0 = s.phase * 0.5 + (i * TAU) / 3;
      const rel = (((ah - a0) % TAU) + TAU) % TAU;
      const inside = rel < len;
      ctx.strokeStyle = rgba(c, inside ? 1 : 0.5);
      ctx.lineWidth = inside ? 4 : 3;
      ctx.beginPath();
      ctx.arc(cx, cy, R * (i % 2 ? 1.27 : 1.13), a0, a0 + len * enter);
      ctx.stroke();
    });
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
    const as = ah / 12 + s.phase;
    seg(ctx, cx, cy, cx + Math.cos(as) * R * 0.46, cy + Math.sin(as) * R * 0.46);
    ctx.fillStyle = rgba(pal.ink, 1);
    disc(ctx, cx, cy, 2.6);
  };
};

/** a calendar page: the days pass one at a time, one day is ringed, and the day under the pointer is picked out */
export const calendar: Maker = (seed) => {
  const s = vary(seed);
  const cols = 5;
  const rows = 4;
  const marked = Math.floor(s.a * cols * rows) % (cols * rows);
  return (f) => {
    const b = stage(f, "DATES");
    if (!b) return;
    const { ctx, t, pal, hover, mx, my, still, enter } = f;
    const pw = Math.min(b.w * 0.62, b.h * 1.15);
    const ph = b.h - 8;
    const x0 = b.cx - pw / 2 + s.dir * b.w * 0.08;
    const y0 = b.y + 6;
    const head = ph * 0.2;
    rr(ctx, x0, y0, pw, ph, 4);
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.stroke();
    rr(ctx, x0, y0, pw, head, 4);
    ctx.fillStyle = rgba(pal.accent, 0.22);
    ctx.fill();
    seg(ctx, x0, y0 + head, x0 + pw, y0 + head);
    ctx.strokeStyle = rgba(pal.ink, 0.9);
    ctx.lineWidth = 2;
    seg(ctx, x0 + pw * 0.25, y0 - 4, x0 + pw * 0.25, y0 + 4);
    seg(ctx, x0 + pw * 0.75, y0 - 4, x0 + pw * 0.75, y0 + 4);
    ctx.lineWidth = 1.4;
    const gw = pw / cols;
    const gh = (ph - head) / rows;
    const cell = Math.min(gw, gh);
    const today = still ? Math.max(0, marked - 2) : Math.floor(t * 1.2 * s.speed) % (cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      const x = x0 + gw * ((i % cols) + 0.5);
      const y = y0 + head + gh * (Math.floor(i / cols) + 0.5);
      const here = near(f, x, y, cell * 0.9);
      ctx.fillStyle = rgba(i <= today ? pal.ink2 : pal.ink3, (i <= today ? 0.9 : 0.5) * enter);
      disc(ctx, x, y, 1.7 + here * 1.5);
      if (i === today || (here > 0.5 && hover > 0.5 && Math.abs(mx - x) < gw / 2 && Math.abs(my - y) < gh / 2)) {
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        ctx.strokeRect(x - cell * 0.32, y - cell * 0.32, cell * 0.64, cell * 0.64);
      }
      if (i === marked) {
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 1.8;
        ring(ctx, x, y, cell * (0.3 + 0.05 * Math.sin(t * 2.2)) * enter);
        ctx.lineWidth = 1.4;
      }
    }
  };
};

/** a short row of candles in their places; the last is still forming, and the one nearest the pointer is picked out */
export const candles: Maker = (seed) => {
  const s = vary(seed);
  const n = 7;
  const lv: number[] = [0.5];
  for (let i = 0; i < n; i++) lv.push(clamp((lv[i] ?? 0.5) + (s.rnd() - 0.5 + s.dir * 0.06) * 0.42, 0.18, 0.82));
  const wk = Array.from({ length: n }, () => [0.04 + s.rnd() * 0.08, 0.04 + s.rnd() * 0.08] as const);
  return (f) => {
    const b = stage(f, "CANDLESTICKS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const step = b.w / n;
    const bw = Math.min(step * 0.52, 20);
    for (let i = 0; i < n; i++) {
      const x = b.x + step * (i + 0.5);
      const grow = smooth(clamp(enter * (n + 1) - i));
      const o = lv[i] ?? 0.5;
      let c = lv[i + 1] ?? 0.5;
      if (i === n - 1) c = clamp(c + 0.1 * Math.sin(t * 1.3 * s.speed + s.phase), 0.14, 0.86);
      c = lerp(o, c, grow);
      const up = c >= o;
      const hi = Math.max(o, c) + (wk[i]?.[0] ?? 0.05) * grow;
      const lo = Math.min(o, c) - (wk[i]?.[1] ?? 0.05) * grow;
      const Y = (v: number) => b.b - v * b.h;
      const here = hover * clamp(1 - Math.abs(x - mx) / step);
      const col = here > 0.3 ? pal.accent : up ? pal.emerald : pal.ink2;
      ctx.strokeStyle = rgba(col, 0.6 + 0.4 * Math.max(here, 1 - hover * 0.5));
      ctx.lineWidth = 1.3;
      seg(ctx, x, Y(hi), x, Y(lo));
      const top = Y(Math.max(o, c));
      const hh = Math.max(1.5, Math.abs(Y(o) - Y(c)));
      ctx.fillStyle = rgba(col, up ? 0.8 : 0.25);
      ctx.fillRect(x - bw / 2, top, bw, hh);
      ctx.strokeRect(x - bw / 2, top, bw, hh);
    }
  };
};

/** a price line with a fast and a slow average beneath it; the pointer reads the three lines at one moment */
export const trend: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "TREND");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const from = s.dir > 0 ? 0.72 : 0.28;
    const to = s.dir > 0 ? 0.28 : 0.72;
    const L = (p: number) => lerp(from, to, p);
    const k = 12 + s.a * 5;
    const price = (p: number) => L(p) + 0.09 * Math.sin(p * k + s.phase - t * 0.9) + 0.04 * Math.sin(p * 31 + s.phase * 2);
    const fast = (p: number) => L(p) + 0.04 * Math.sin(p * k + s.phase - t * 0.9 - 0.9);
    const slow = (p: number) => L(p) + 0.02 * Math.sin(p * 5 + s.phase);
    const lines: [(p: number) => number, typeof pal.ink, number, number][] = [
      [slow, pal.gold, 1.6, 0.9],
      [fast, pal.teal, 1.6, 0.9],
      [price, pal.ink, 1.3, 0.85],
    ];
    for (const [fn, col, lw, al] of lines) {
      ctx.strokeStyle = rgba(col, al);
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const p = (i / 60) * enter;
        ctx.lineTo(b.x + p * b.w, b.y + fn(p) * b.h);
      }
      ctx.stroke();
    }
    if (hover > 0.02) {
      const p = clamp((mx - b.x) / b.w, 0, enter);
      const x = b.x + p * b.w;
      ctx.strokeStyle = rgba(pal.ink3, 0.6 * hover);
      ctx.lineWidth = 1;
      seg(ctx, x, b.y, x, b.b);
      for (const [fn, col] of lines) {
        ctx.fillStyle = rgba(col, hover);
        disc(ctx, x, b.y + fn(p) * b.h, 3);
      }
    }
  };
};

/** a band around a price that swells and tightens as it travels; it opens wider under the pointer */
export const volatility: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "VOLATILITY");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const k = 4 + s.a * 3;
    const mid = (p: number) => b.cy + b.h * 0.05 * Math.sin(p * 3 + s.phase);
    const wid = (p: number, x: number) => {
      const sw = 0.5 + 0.5 * Math.sin(p * k - s.dir * t * 0.6 * s.speed + s.phase);
      return 2 + b.h * (0.05 + 0.24 * sw * sw + 0.1 * hover * clamp(1 - Math.abs(x - mx) / (b.w * 0.28))) * enter;
    };
    const N = 64;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) ctx.lineTo(b.x + (i / N) * b.w, mid(i / N) - wid(i / N, b.x + (i / N) * b.w));
    for (let i = N; i >= 0; i--) ctx.lineTo(b.x + (i / N) * b.w, mid(i / N) + wid(i / N, b.x + (i / N) * b.w));
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.1);
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.strokeStyle = rgba(pal.accent, 0.9);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) ctx.lineTo(b.x + (i / N) * b.w, mid(i / N) + side * wid(i / N, b.x + (i / N) * b.w));
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(pal.ink, 0.85);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const M = 90;
    for (let i = 0; i <= M; i++) {
      const p = i / M;
      const x = b.x + p * b.w;
      ctx.lineTo(x, mid(p) + wid(p, x) * 0.82 * Math.sin(p * 43 + s.phase) * Math.sin(p * 11 + t * 0.8 + s.phase));
    }
    ctx.stroke();
  };
};
