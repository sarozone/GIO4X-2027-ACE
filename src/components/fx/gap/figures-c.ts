import { TAU, arrow, clamp, disc, lerp, near, rgba, ring, rr, seg, smooth, stage, vary, type Maker } from "./kit";

/**
 * Gap figures, third set: the wider market (currency pairs, central banks,
 * economic data, regions) and the practical side (accounts, funding, partners,
 * platforms, steps, decisions). One idea each, one caption each, no number
 * anywhere.
 */

/** two coins that keep changing places round a pair of exchange arrows; the pointer turns them by hand */
export const pairs: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "CURRENCY PAIRS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const r = b.u * 0.2;
    const D = Math.min(b.w * 0.28, b.u * 0.62);
    const a = lerp(s.dir * t * 0.5 * s.speed + s.phase, ((mx - b.x) / b.w) * TAU, hover);
    // the exchange arrows between them
    const al = b.u * 0.13;
    ctx.strokeStyle = rgba(pal.ink3, 0.85);
    ctx.lineWidth = 1.4;
    arrow(ctx, b.cx - al, b.cy - 5, b.cx + al, b.cy - 5, 4);
    arrow(ctx, b.cx + al, b.cy + 5, b.cx - al, b.cy + 5, 4);
    const coin = (k: number) => {
      const ang = a + k * Math.PI;
      const x = b.cx + Math.cos(ang) * D;
      const y = b.cy + Math.sin(ang) * D * 0.3;
      const col = k === 0 ? pal.accent : pal.gold;
      const rr2 = r * enter;
      ctx.fillStyle = rgba(col, 0.2);
      disc(ctx, x, y, rr2);
      ctx.strokeStyle = rgba(col, 1);
      ctx.lineWidth = 1.8;
      ring(ctx, x, y, rr2);
      ctx.lineWidth = 1.5;
      if (k === 0) {
        // one coin carries two bars, the other a ring: two different moneys, no real symbol
        seg(ctx, x - rr2 * 0.4, y - rr2 * 0.18, x + rr2 * 0.4, y - rr2 * 0.18);
        seg(ctx, x - rr2 * 0.4, y + rr2 * 0.18, x + rr2 * 0.4, y + rr2 * 0.18);
      } else {
        ring(ctx, x, y, rr2 * 0.45);
      }
    };
    // the nearer coin is drawn last
    if (Math.sin(a) > 0) {
      coin(1);
      coin(0);
    } else {
      coin(0);
      coin(1);
    }
  };
};

/** a building with a pediment and columns; a light walks along the columns, and the one under the pointer is lit */
export const bank: Maker = (seed) => {
  const s = vary(seed);
  const n = 4 + Math.floor(s.a * 2);
  return (f) => {
    const b = stage(f, "CENTRAL BANKS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const bw = Math.min(b.w * 0.74, b.h * 1.5);
    const x0 = b.cx - bw / 2;
    const roofY = b.y + b.h * 0.3;
    const floor = b.b - 9;
    ctx.strokeStyle = rgba(pal.ink2, 0.95);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, roofY);
    ctx.lineTo(b.cx, b.y + 2);
    ctx.lineTo(x0 + bw, roofY);
    ctx.closePath();
    ctx.fillStyle = rgba(pal.gold, 0.12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = rgba(pal.gold, 0.9);
    disc(ctx, b.cx, b.y + 2 + (roofY - b.y - 2) * 0.62, Math.min(4, b.h * 0.035));
    ctx.strokeRect(x0 + bw * 0.02, roofY + 3, bw * 0.96, 5);
    ctx.strokeRect(x0, floor, bw, 4);
    ctx.strokeRect(x0 - bw * 0.04, floor + 4, bw * 1.08, 4);
    const lit = still ? Math.floor(s.b * n) : Math.floor(t * 1.5 * s.speed) % (n + 2);
    const cw = bw / (n * 2.3);
    const span = bw * 0.9 - cw;
    for (let i = 0; i < n; i++) {
      const x = x0 + bw * 0.05 + cw / 2 + (span * i) / (n - 1);
      const here = Math.max(hover * clamp(1 - Math.abs(x - mx) / (cw * 1.6)), hover < 0.5 && i === lit ? 0.8 : 0);
      const top = lerp(floor, roofY + 8, smooth(clamp(enter * 1.6 - i * 0.12)));
      ctx.fillStyle = rgba(here > 0.3 ? pal.accent : pal.ink3, 0.18 + here * 0.3);
      ctx.fillRect(x - cw / 2, top, cw, floor - top);
      ctx.strokeStyle = rgba(here > 0.3 ? pal.accent : pal.ink2, 0.9);
      ctx.lineWidth = 1.3;
      ctx.strokeRect(x - cw / 2, top, cw, floor - top);
      seg(ctx, x, top + 4, x, floor - 3);
    }
  };
};

/** a bar chart published one bar at a time, each beside a mark of what was expected; the pointer brings them all out */
export const data: Maker = (seed) => {
  const s = vary(seed);
  const n = 7;
  const vals = Array.from({ length: n }, () => {
    const v = s.rnd() * 1.5 - 0.5;
    return { v: Math.abs(v) < 0.15 ? 0.3 : v, exp: s.rnd() * 0.5 - 0.25 };
  });
  return (f) => {
    const b = stage(f, "ECONOMIC DATA");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const zero = b.y + b.h * 0.64;
    const up = b.h * 0.56;
    const dn = b.h * 0.62;
    const step = b.w / n;
    const bw = step * 0.5;
    const prog = lerp(still ? n - 1.01 : (t * 0.9 * s.speed + s.a * n) % (n + 2), n, hover) * enter;
    ctx.strokeStyle = rgba(pal.ink3, 0.7);
    seg(ctx, b.x, zero, b.r, zero);
    vals.forEach((d, i) => {
      const k = smooth(clamp(prog - i));
      const x = b.x + step * (i + 0.5);
      const X = s.dir > 0 ? x : b.x + b.r - x;
      const hgt = (d.v > 0 ? d.v * up : d.v * dn) * k;
      const newest = i === Math.min(n - 1, Math.floor(prog)) && hover < 0.5;
      const here = hover * clamp(1 - Math.abs(X - mx) / step);
      const col = newest || here > 0.3 ? pal.accent : pal.ink3;
      ctx.fillStyle = rgba(col, newest || here > 0.3 ? 0.85 : 0.45);
      ctx.fillRect(X - bw / 2, zero - hgt, bw, hgt);
      // what was expected
      const ey = zero - (d.v > 0 ? up : dn) * clamp(d.v + d.exp, -0.5, 1);
      ctx.strokeStyle = rgba(pal.gold, 0.9);
      ctx.lineWidth = 1.6;
      seg(ctx, X - bw * 0.7, ey, X + bw * 0.7, ey);
      if (newest && k < 1) {
        ctx.strokeStyle = rgba(pal.accent, 1 - k);
        ctx.lineWidth = 1.2;
        ring(ctx, X, zero - hgt, 2 + k * Math.min(9, b.h * 0.05));
      }
    });
  };
};

/** a globe turning under its meridians, one of them marked, with a few market places on it; the pointer spins it */
export const globe: Maker = (seed) => {
  const s = vary(seed);
  const places = Array.from({ length: 5 }, () => ({ lon: s.rnd() * TAU, lat: (s.rnd() - 0.5) * 1.5 }));
  return (f) => {
    const b = stage(f, "MARKETS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const R = b.u * 0.45 * (0.6 + 0.4 * enter);
    const cx = b.cx;
    const cy = b.cy;
    const rot = s.dir * t * 0.3 * s.speed + s.phase + hover * ((mx - cx) / Math.max(1, R)) * 1.2;
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 1.5;
    ring(ctx, cx, cy, R);
    ctx.strokeStyle = rgba(pal.ink3, 0.55);
    ctx.lineWidth = 1;
    for (const k of [-0.5, 0, 0.5]) {
      const y = cy + k * R;
      const hw = Math.sqrt(Math.max(0, R * R - (k * R) * (k * R)));
      ctx.beginPath();
      ctx.ellipse(cx, y, hw, hw * 0.12, 0, 0, Math.PI);
      ctx.stroke();
    }
    const m = 4;
    for (let i = 0; i < m; i++) {
      const lam = rot + (i * Math.PI) / m;
      const sn = Math.sin(lam);
      const marked = i === 0;
      ctx.strokeStyle = rgba(marked ? pal.accent : pal.ink3, marked ? 1 : 0.55);
      ctx.lineWidth = marked ? 2 : 1;
      ctx.beginPath();
      // the marked meridian shows only its near half
      if (marked) ctx.ellipse(cx, cy, Math.abs(sn) * R, R, 0, sn > 0 ? -Math.PI / 2 : Math.PI / 2, sn > 0 ? Math.PI / 2 : Math.PI * 1.5);
      else ctx.ellipse(cx, cy, Math.abs(sn) * R, R, 0, 0, TAU);
      ctx.stroke();
    }
    for (const p of places) {
      const front = Math.cos(p.lon + rot);
      if (front <= 0.05) continue;
      const x = cx + R * Math.cos(p.lat) * Math.sin(p.lon + rot);
      const y = cy - R * Math.sin(p.lat);
      ctx.fillStyle = rgba(pal.gold, 0.4 + 0.6 * front);
      disc(ctx, x, y, 2 + front * 1.4 + near(f, x, y, 26) * 2);
    }
  };
};

/** a ladder, each rung a tier with its own mark beside it; a ring climbs it and goes to the rung the pointer is level with */
export const accounts: Maker = (seed) => {
  const s = vary(seed);
  const k = 4;
  return (f) => {
    const b = stage(f, "ACCOUNTS");
    if (!b) return;
    const { ctx, t, pal, hover, my, enter } = f;
    const lw = Math.min(b.w * 0.3, b.h * 0.55);
    const d = s.dir;
    const lx = b.cx + d * b.w * 0.16;
    const top = b.y + 2;
    const bot = b.b - 2;
    const railX = (side: number, y: number) => lx + side * (lw / 2) * lerp(0.78, 1, (y - top) / (bot - top));
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) seg(ctx, railX(side, bot), bot, railX(side, lerp(bot, top, enter)), lerp(bot, top, enter));
    const ry = (i: number) => lerp(bot - b.h * 0.12, top + b.h * 0.12, i / (k - 1));
    const tri = Math.abs(((t * 0.35 * s.speed + s.a * 2) % 2) - 1) * (k - 1);
    const byHand = clamp(((bot - b.h * 0.12 - my) / (b.h * 0.76)) * (k - 1), 0, k - 1);
    const at = lerp(tri, Math.round(byHand), hover);
    for (let i = 0; i < k; i++) {
      const y = ry(i);
      const on = clamp(1 - Math.abs(at - i));
      ctx.strokeStyle = rgba(on > 0.4 ? pal.accent : pal.ink2, 0.7 + on * 0.3);
      ctx.lineWidth = 2 + on * 1.5;
      seg(ctx, railX(-1, y), y, railX(1, y), y);
      // the tier's mark: a bar that is longer the higher the rung, on the open side
      const x0 = lx - d * (lw / 2 + 12);
      const len = b.w * (0.1 + 0.055 * i) * enter;
      ctx.strokeStyle = rgba(on > 0.4 ? pal.accent : pal.ink3, 0.55 + on * 0.45);
      ctx.lineWidth = 2;
      seg(ctx, x0, y, x0 - d * len, y);
    }
    const y = lerp(ry(0), ry(k - 1), at / (k - 1));
    ctx.strokeStyle = rgba(pal.gold, 1);
    ctx.lineWidth = 2;
    ring(ctx, lx, y, Math.min(7, b.h * 0.06));
  };
};

/** a wallet with money coming in on one side and going out on the other; the side the pointer is on is the one that flows */
export const wallet: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "FUNDING");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const ww = Math.min(b.w * 0.46, b.h * 0.95);
    const wh = ww * (0.62 + s.a * 0.08);
    const x0 = b.cx - ww / 2;
    const y0 = b.cy - wh / 2 + b.h * 0.04;
    ctx.strokeStyle = rgba(pal.ink2, 0.95);
    ctx.lineWidth = 1.6;
    // the flap behind, then the body
    ctx.beginPath();
    ctx.moveTo(x0 + ww * 0.08, y0);
    ctx.lineTo(x0 + ww * 0.14, y0 - wh * 0.14);
    ctx.lineTo(x0 + ww * 0.82, y0 - wh * 0.14);
    ctx.lineTo(x0 + ww * 0.88, y0);
    ctx.stroke();
    rr(ctx, x0, y0, ww, wh, 6);
    ctx.fillStyle = rgba(pal.gold, 0.1);
    ctx.fill();
    ctx.stroke();
    rr(ctx, x0 + ww * 0.68, y0 + wh * 0.36, ww * 0.32, wh * 0.28, 4);
    ctx.stroke();
    ctx.fillStyle = rgba(pal.gold, 0.95);
    disc(ctx, x0 + ww * 0.8, y0 + wh * 0.5, Math.min(3, wh * 0.06));
    const idle = 0.5 + 0.5 * Math.sin(t * 0.9 * s.speed + s.phase);
    const inK = lerp(idle, mx < b.cx ? 1 : 0, hover);
    const flow = (x1: number, x2: number, y: number, k: number, col: typeof pal.ink) => {
      const len = (x2 - x1) * enter;
      if (Math.abs(len) < 8) return;
      ctx.strokeStyle = rgba(col, 0.35 + 0.65 * k);
      ctx.lineWidth = 1.4 + k;
      arrow(ctx, x1, y, x1 + len, y, 5);
      // a coin riding the arrow that is flowing
      const p = (t * 0.7 * s.speed) % 1;
      ctx.fillStyle = rgba(col, k * (1 - p * 0.5));
      disc(ctx, x1 + len * p, y - 7, 2.6 * k);
    };
    const inL = s.dir > 0;
    const yIn = y0 + wh * 0.3;
    const yOut = y0 + wh * 0.72;
    // in on one side, out on the other: which side is which depends on the seed
    if (inL) {
      flow(b.x + 2, x0 - 7, yIn, inK, pal.emerald);
      flow(x0 + ww + 7, b.r - 2, yOut, 1 - inK, pal.accent);
    } else {
      flow(b.x + 2, x0 - 7, yIn, inK, pal.accent);
      flow(x0 + ww + 7, b.r - 2, yOut, 1 - inK, pal.emerald);
    }
  };
};

/** two figures joined by a line: what the first one draws, the second repeats a moment later; the pointer carries the message across */
export const partners: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "PARTNERS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const u = b.u;
    const xa = b.cx - s.dir * b.w * 0.27;
    const xb = b.cx + s.dir * b.w * 0.27;
    const yh = b.cy - u * 0.22;
    const person = (x: number, col: typeof pal.ink) => {
      ctx.strokeStyle = rgba(col, 0.95);
      ctx.fillStyle = rgba(col, 0.16);
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(x, yh, u * 0.09 * enter, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, yh + u * 0.3, u * 0.17 * enter, Math.PI, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    person(xa, pal.accent);
    person(xb, pal.teal);
    // the link, and what travels along it
    const P = (p: number): [number, number] => [lerp(xa, xb, p), yh - u * 0.02 - Math.sin(p * Math.PI) * u * 0.2];
    ctx.strokeStyle = rgba(pal.ink3, 0.8);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const [x, y] = P(0.14 + (i / 20) * 0.72);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    const auto = still ? 0.55 : (t * 0.4 * s.speed + s.a) % 1;
    const p = clamp(lerp(auto, (mx - xa) / (xb - xa), hover), 0, 1);
    const [dx, dy] = P(0.14 + p * 0.72);
    ctx.fillStyle = rgba(pal.gold, 1);
    disc(ctx, dx, dy, 3.2);
    // the same small line under each: the second is always a little behind
    const zig = (x: number, upTo: number, col: typeof pal.ink) => {
      const zw = u * 0.3;
      ctx.strokeStyle = rgba(col, 0.95);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const q = (i / 24) * clamp(upTo);
        ctx.lineTo(x - zw / 2 + q * zw, b.cy + u * 0.3 - u * 0.07 * Math.sin(q * 9 + s.phase) * (0.4 + q));
      }
      ctx.stroke();
    };
    const lead = still ? 1 : clamp(((t * 0.4 * s.speed + s.a) % 2) / 1.2);
    zig(xa, lead * enter, pal.accent);
    zig(xb, (lead - 0.3) * 1.2 * enter, pal.teal);
  };
};

/** two gears in mesh; they turn each other, and the pointer turns them by hand */
export const gears: Maker = (seed) => {
  const s = vary(seed);
  const n1 = s.a < 0.5 ? 12 : 10;
  const n2 = s.b < 0.5 ? 8 : 6;
  return (f) => {
    const b = stage(f, "PLATFORMS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const u = b.u;
    const mod = (u * 0.42) / (n1 + n2);
    const r1 = mod * n1;
    const r2 = mod * n2;
    const td = mod * 1.9;
    const d = s.dir;
    const c1x = b.cx - d * u * 0.19;
    const c1y = b.cy + u * 0.09;
    const phi = d > 0 ? -0.62 : Math.PI + 0.62;
    const c2x = c1x + Math.cos(phi) * (r1 + r2);
    const c2y = c1y + Math.sin(phi) * (r1 + r2);
    const a1 = d * t * 0.5 * s.speed + s.phase + hover * ((mx - b.cx) / b.w) * 3;
    const a2 = phi + Math.PI + Math.PI / n2 - (a1 - phi) * (n1 / n2);
    const gear = (cx: number, cy: number, r: number, n: number, a: number, col: typeof pal.ink) => {
      const st = TAU / n;
      const r0 = (r - td / 2) * enter;
      const r1b = (r + td / 2) * enter;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const c = a + i * st;
        const pts: [number, number][] = [
          [c - st * 0.27, r0],
          [c - st * 0.15, r1b],
          [c + st * 0.15, r1b],
          [c + st * 0.27, r0],
        ];
        for (const [ang, rad] of pts) ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(col, 0.14);
      ctx.fill();
      ctx.strokeStyle = rgba(col, 0.95);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ring(ctx, cx, cy, r * 0.32 * enter);
      seg(ctx, cx, cy, cx + Math.cos(a) * r * 0.32 * enter, cy + Math.sin(a) * r * 0.32 * enter);
    };
    gear(c1x, c1y, r1, n1, a1, pal.ink2);
    gear(c2x, c2y, r2, n2, a2, pal.accent);
  };
};

/** a few boxes joined by arrows; the work passes from one to the next, and the pointer chooses the step */
export const steps: Maker = (seed) => {
  const s = vary(seed);
  const k = s.a < 0.5 ? 3 : 4;
  const zig = 0.08 + s.b * 0.1;
  return (f) => {
    const b = stage(f, "STEPS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const cell = b.w / k;
    const bw = cell * 0.6;
    const bh = Math.min(b.h * 0.34, bw * 0.85);
    const X = (i: number) => b.x + cell * (i + 0.5);
    const Y = (i: number) => b.cy + (i % 2 ? 1 : -1) * s.dir * b.h * zig;
    const c = still ? k - 1.5 : (t * 0.55 * s.speed + s.c * k) % (k + 1);
    const byHand = clamp(Math.floor((mx - b.x) / cell), 0, k - 1);
    const at = hover > 0.5 ? byHand : Math.min(k, Math.floor(c));
    const frac = hover > 0.5 ? 0 : c - Math.floor(c);
    for (let i = 0; i < k; i++) {
      const x = X(i);
      const y = Y(i);
      const done = i < at;
      const on = i === at;
      const grow = smooth(clamp(enter * (k + 1) - i));
      rr(ctx, x - (bw / 2) * grow, y - (bh / 2) * grow, bw * grow, bh * grow, 5);
      ctx.fillStyle = rgba(on ? pal.accent : pal.ink3, on ? 0.22 : 0.06);
      ctx.fill();
      ctx.strokeStyle = rgba(on ? pal.accent : pal.ink2, on ? 1 : 0.8);
      ctx.lineWidth = on ? 2 : 1.4;
      ctx.stroke();
      if (done) {
        ctx.strokeStyle = rgba(pal.emerald, grow);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - bh * 0.18, y);
        ctx.lineTo(x - bh * 0.04, y + bh * 0.14);
        ctx.lineTo(x + bh * 0.2, y - bh * 0.14);
        ctx.stroke();
      } else {
        ctx.strokeStyle = rgba(on ? pal.accent : pal.ink3, 0.8 * grow);
        ctx.lineWidth = 2;
        seg(ctx, x - bw * 0.22, y, x + bw * 0.22, y);
      }
      if (i < k - 1) {
        const x1 = x + bw / 2 + 3;
        const x2 = X(i + 1) - bw / 2 - 4;
        const y2 = Y(i + 1);
        ctx.strokeStyle = rgba(done ? pal.emerald : pal.ink3, 0.85 * grow);
        ctx.lineWidth = 1.3;
        arrow(ctx, x1, y, x2, y2, 4);
        if (on && frac > 0.5) {
          const p = (frac - 0.5) * 2;
          ctx.fillStyle = rgba(pal.accent, 1);
          disc(ctx, lerp(x1, x2, p), lerp(y, y2, p), 2.6);
        }
      }
    }
  };
};

/** a path that divides in two; a traveller takes one branch, then the other, or the one the pointer is nearer */
export const fork: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "DECISIONS");
    if (!b) return;
    const { ctx, t, pal, hover, my, still, enter } = f;
    const X = (p: number) => (s.dir > 0 ? b.x + p * b.w : b.r - p * b.w);
    const jx = 0.36 + s.a * 0.1;
    const rise = b.h * (0.28 + s.b * 0.08);
    const end = 0.94;
    const c = still ? 0.82 : t * 0.3 * s.speed + s.c;
    const idle = Math.floor(c) % 2;
    const choice = hover > 0.5 ? (my < b.cy ? 0 : 1) : idle;
    const q = (still ? 0.82 : c - Math.floor(c)) * enter;
    // a point on a branch: side -1 is the upper one
    const B = (side: number, p: number): [number, number] => {
      const k = 1 - p;
      const x = k * k * k * jx + 3 * k * k * p * (jx + 0.22) + 3 * k * p * p * (end - 0.22) + p * p * p * end;
      const y = 3 * k * p * p * side * rise + p * p * p * side * rise;
      return [X(x), b.cy + y];
    };
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 2;
    seg(ctx, X(0.02), b.cy, X(jx), b.cy);
    [-1, 1].forEach((side, i) => {
      const chosen = i === choice;
      ctx.strokeStyle = rgba(chosen ? pal.accent : pal.ink3, chosen ? 1 : 0.7);
      ctx.lineWidth = chosen ? 2.2 : 1.4;
      ctx.setLineDash(chosen ? [] : [4, 4]);
      ctx.beginPath();
      for (let j = 0; j <= 24; j++) {
        const [x, y] = B(side, (j / 24) * enter);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      const [ex, ey] = B(side, 1);
      ring(ctx, ex, ey, 4 * enter);
    });
    // the place where the choice is made
    const jX = X(jx);
    ctx.fillStyle = rgba(pal.gold, 0.95);
    ctx.beginPath();
    ctx.moveTo(jX, b.cy - 6);
    ctx.lineTo(jX + 6, b.cy);
    ctx.lineTo(jX, b.cy + 6);
    ctx.lineTo(jX - 6, b.cy);
    ctx.closePath();
    ctx.fill();
    // the traveller
    const stem = 0.4;
    let tx = X(lerp(0.02, jx, clamp(q / stem)));
    let ty = b.cy;
    if (q > stem) [tx, ty] = B(choice === 0 ? -1 : 1, (q - stem) / (1 - stem));
    ctx.fillStyle = rgba(pal.ink, 1);
    disc(ctx, tx, ty, 3.4 + near(f, tx, ty, 40) * 1.5);
  };
};
