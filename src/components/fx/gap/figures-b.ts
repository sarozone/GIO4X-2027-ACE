import { ALERT, AMBER, TAU, clamp, disc, lerp, mix, near, rgba, ring, rr, seg, smooth, stage, vary, word, type Maker } from "./kit";

/**
 * Gap figures, second set: weighing things up (risk, compounding,
 * diversification, comparison, security) and reading and asking (documents,
 * learning, definitions, questions, orders). One idea each, one caption each,
 * no number anywhere.
 */

/** a dial from low to high; the needle wanders, and follows the pointer across */
export const risk: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "RISK");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const cx = b.cx;
    const cy = b.y + b.h * 0.8;
    const R = Math.min(b.w * 0.44, b.h * 0.7);
    const N = 30;
    ctx.lineWidth = 6;
    ctx.lineCap = "butt";
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1);
      const col = k < 0.5 ? mix(pal.emerald, AMBER, k * 2) : mix(AMBER, ALERT, k * 2 - 1);
      ctx.strokeStyle = rgba(col, 0.9);
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI + (i / N) * Math.PI, Math.PI + ((i + 0.72) / N) * Math.PI);
      ctx.stroke();
    }
    ctx.lineCap = "round";
    const idle = 0.5 + 0.36 * Math.sin(t * 0.6 * s.speed + s.phase) + 0.05 * Math.sin(t * 2.3 + s.phase);
    const frac = clamp(lerp(idle, (mx - (cx - R)) / (2 * R), hover), 0.03, 0.97) * enter;
    const a = Math.PI + frac * Math.PI;
    ctx.strokeStyle = rgba(pal.ink, 0.95);
    ctx.lineWidth = 2.2;
    seg(ctx, cx, cy, cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8);
    ctx.fillStyle = rgba(pal.ink, 1);
    disc(ctx, cx, cy, 4);
    word(f, "LOW", cx - R - 3, cy + 14, "left", pal.ink3);
    word(f, "HIGH", cx + R + 3, cy + 14, "right", pal.ink3);
  };
};

/** a staircase in which every step adds more than the last; the steps rise in turn, or all at once under the pointer */
export const compounding: Maker = (seed) => {
  const s = vary(seed);
  const n = 6 + Math.floor(s.a * 3);
  const g = 1.2 + 0.1 * s.b;
  return (f) => {
    const b = stage(f, "COMPOUNDING");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const step = b.w / n;
    const bw = step * 0.64;
    const top = Math.pow(g, n - 1);
    const prog = lerp(still ? n : (t * 1.1 * s.speed) % (n + 2.5), n, hover) * enter;
    ctx.strokeStyle = rgba(pal.ink3, 0.7);
    seg(ctx, b.x, b.b - 1, b.r, b.b - 1);
    const tops: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const k = smooth(clamp(prog - i));
      const x = b.x + step * i + (step - bw) / 2;
      const hNow = (Math.pow(g, i) / top) * (b.h * 0.9) * k;
      const hPrev = i === 0 ? hNow : Math.min(hNow, (Math.pow(g, i - 1) / top) * (b.h * 0.9));
      const here = hover * clamp(1 - Math.abs(x + bw / 2 - mx) / step);
      ctx.fillStyle = rgba(pal.ink3, 0.3 + here * 0.2);
      ctx.fillRect(x, b.b - 1 - hPrev, bw, hPrev);
      // what this step adds on top of the one before
      ctx.fillStyle = rgba(pal.accent, 0.75 + here * 0.25);
      ctx.fillRect(x, b.b - 1 - hNow, bw, hNow - hPrev);
      if (k > 0.02) tops.push([x + bw / 2, b.b - 1 - hNow]);
    }
    ctx.strokeStyle = rgba(pal.gold, 0.9);
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (const [x, y] of tops) ctx.lineTo(x, y - 4);
    ctx.stroke();
    ctx.setLineDash([]);
  };
};

/** a pie whose slices slowly trade size; the slice under the pointer steps out */
export const portfolio: Maker = (seed) => {
  const s = vary(seed);
  const k = 4 + Math.floor(s.a * 2);
  return (f) => {
    const b = stage(f, "DIVERSIFICATION");
    if (!b) return;
    const { ctx, t, pal, hover, mx, my, enter } = f;
    const R = b.u * 0.42;
    const cols = [pal.accent, pal.teal, pal.gold, pal.emerald, pal.ink3];
    const ws: number[] = [];
    let sum = 0;
    for (let i = 0; i < k; i++) {
      const w = 1 + 0.6 * Math.sin(t * 0.4 * s.speed + i * 2.1 + s.phase);
      ws.push(w);
      sum += w;
    }
    const start = s.phase + s.dir * t * 0.05;
    const pa = (((Math.atan2(my - b.cy, mx - b.cx) - start) % TAU) + TAU) % TAU;
    const inside = Math.hypot(mx - b.cx, my - b.cy) < R * 1.25 ? hover : 0;
    let a = 0;
    for (let i = 0; i < k; i++) {
      const span = ((ws[i] ?? 1) / sum) * TAU * enter;
      const out = pa >= a && pa < a + span ? inside : 0;
      const m = start + a + span / 2;
      const ox = b.cx + Math.cos(m) * R * 0.1 * out;
      const oy = b.cy + Math.sin(m) * R * 0.1 * out;
      const pad = Math.min(0.03, span / 4);
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(m) * 3, oy + Math.sin(m) * 3);
      ctx.arc(ox, oy, R, start + a + pad, start + a + span - pad);
      ctx.closePath();
      const col = cols[i % cols.length] ?? pal.accent;
      ctx.fillStyle = rgba(col, 0.3 + out * 0.35);
      ctx.fill();
      ctx.strokeStyle = rgba(col, 0.95);
      ctx.stroke();
      a += span;
    }
  };
};

/** a balance with a different weight in each pan; it rocks, and the pan under the pointer sinks */
export const scales: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "COMPARISON");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const cx = b.cx;
    const py = b.y + b.h * 0.14;
    const L = Math.min(b.w * 0.32, b.h * 0.6);
    const pr = L * 0.4;
    const sl = b.h * 0.32;
    const a = (0.16 * Math.sin(t * 0.7 * s.speed + s.phase) + hover * 0.2 * clamp((mx - cx) / L, -1, 1)) * enter;
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 2;
    seg(ctx, cx, py, cx, b.b - 2);
    seg(ctx, cx - L * 0.4, b.b - 2, cx + L * 0.4, b.b - 2);
    ctx.strokeStyle = rgba(pal.ink, 0.95);
    seg(ctx, cx - Math.cos(a) * L, py - Math.sin(a) * L, cx + Math.cos(a) * L, py + Math.sin(a) * L);
    ctx.fillStyle = rgba(pal.ink, 1);
    disc(ctx, cx, py, 3);
    ctx.lineWidth = 1.3;
    for (const side of [-1, 1]) {
      const ex = cx + side * Math.cos(a) * L;
      const ey = py + side * Math.sin(a) * L;
      const yp = ey + sl;
      ctx.strokeStyle = rgba(pal.ink3, 0.9);
      seg(ctx, ex, ey, ex - pr, yp);
      seg(ctx, ex, ey, ex + pr, yp);
      const col = side * s.dir < 0 ? pal.accent : pal.gold;
      ctx.strokeStyle = rgba(pal.ink2, 0.95);
      ctx.beginPath();
      ctx.moveTo(ex - pr, yp);
      ctx.lineTo(ex + pr, yp);
      ctx.ellipse(ex, yp, pr, pr * 0.4, 0, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = rgba(col, 0.8);
      const ws = pr * 0.34 * enter;
      if (side * s.dir < 0) disc(ctx, ex, yp - ws - 1, ws);
      else ctx.fillRect(ex - ws, yp - ws * 2 - 1, ws * 2, ws * 2);
    }
  };
};

/** a shield with a tick on it; darts arrive from both sides and stop short; under the pointer a guard ring closes round it */
export const shield: Maker = (seed) => {
  const s = vary(seed);
  const darts = Array.from({ length: 5 }, (_, i) => ({ side: i % 2 ? 1 : -1, off: s.rnd() * 0.6 - 0.3, lag: s.rnd() }));
  return (f) => {
    const b = stage(f, "SECURITY");
    if (!b) return;
    const { ctx, t, pal, hover, still, enter } = f;
    const cx = b.cx;
    const sw = b.u * 0.5;
    const sh = b.u * 0.64;
    const top = b.cy - sh / 2;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.quadraticCurveTo(cx + sw * 0.3, top + sh * 0.14, cx + sw / 2, top + sh * 0.14);
    ctx.lineTo(cx + sw / 2, top + sh * 0.5);
    ctx.quadraticCurveTo(cx + sw * 0.42, top + sh * 0.85, cx, top + sh);
    ctx.quadraticCurveTo(cx - sw * 0.42, top + sh * 0.85, cx - sw / 2, top + sh * 0.5);
    ctx.lineTo(cx - sw / 2, top + sh * 0.14);
    ctx.quadraticCurveTo(cx - sw * 0.3, top + sh * 0.14, cx, top);
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.1 + hover * 0.12);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.accent, 0.95);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // the tick
    const p0: [number, number] = [cx - sw * 0.2, b.cy];
    const p1: [number, number] = [cx - sw * 0.04, b.cy + sh * 0.14];
    const p2: [number, number] = [cx + sw * 0.22, b.cy - sh * 0.14];
    const k1 = clamp(enter * 2);
    const k2 = clamp(enter * 2 - 1);
    ctx.strokeStyle = rgba(pal.emerald, 1);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(lerp(p0[0], p1[0], k1), lerp(p0[1], p1[1], k1));
    if (k2 > 0) ctx.lineTo(lerp(p1[0], p2[0], k2), lerp(p1[1], p2[1], k2));
    ctx.stroke();
    // what is turned away
    ctx.lineWidth = 1.5;
    for (const d of darts) {
      const p = still ? 0.35 + d.lag * 0.5 : (t * 0.45 * s.speed + d.lag) % 1;
      const y = b.cy + d.off * b.h * 0.7;
      const x0 = cx + d.side * (b.w * 0.5 - 2);
      const x1 = cx + d.side * (sw * 0.5 + 12 + hover * 8);
      const x = lerp(x0, x1, smooth(p / 0.8));
      const fade = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;
      ctx.strokeStyle = rgba(ALERT, 0.85 * fade);
      seg(ctx, x, y, x + d.side * Math.min(9, Math.abs(x0 - x)), y);
      if (p >= 0.8) {
        ctx.strokeStyle = rgba(pal.ink3, fade);
        ring(ctx, x1, y, 2 + (p - 0.8) * 22);
      }
    }
    if (hover > 0.02) {
      ctx.strokeStyle = rgba(pal.accent, 0.7 * hover);
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(cx, b.cy, b.u * 0.44, t * 0.6, t * 0.6 + TAU * hover);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };
};

/** a ruled sheet with a signature being written on its last line; the pointer finishes it and picks out the line it is on */
export const paper: Maker = (seed) => {
  const s = vary(seed);
  const lens = Array.from({ length: 5 }, () => 0.55 + s.rnd() * 0.45);
  return (f) => {
    const b = stage(f, "DOCUMENTS");
    if (!b) return;
    const { ctx, t, pal, hover, my, still, enter } = f;
    const sw = Math.min(b.w * 0.5, b.h * 0.82);
    const sh = b.h - 4;
    const x0 = b.cx - sw / 2 + s.dir * b.w * 0.1;
    const y0 = b.y + 2;
    const fold = sw * 0.18;
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + sw - fold, y0);
    ctx.lineTo(x0 + sw, y0 + fold);
    ctx.lineTo(x0 + sw, y0 + sh);
    ctx.lineTo(x0, y0 + sh);
    ctx.closePath();
    ctx.moveTo(x0 + sw - fold, y0);
    ctx.lineTo(x0 + sw - fold, y0 + fold);
    ctx.lineTo(x0 + sw, y0 + fold);
    ctx.stroke();
    const inner = sw * 0.72;
    const lx = x0 + sw * 0.14;
    lens.forEach((len, i) => {
      const y = y0 + sh * (0.2 + i * 0.105);
      const here = hover * clamp(1 - Math.abs(my - y) / (sh * 0.07));
      ctx.strokeStyle = rgba(here > 0.3 ? pal.accent : pal.ink3, 0.6 + here * 0.4);
      ctx.lineWidth = 1.4 + here;
      seg(ctx, lx, y, lx + inner * Math.min(len, i === 0 ? 0.7 : 1) * enter, y);
    });
    // the line to sign on, and the signature
    const base = y0 + sh * 0.86;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(pal.ink3, 0.8);
    ctx.setLineDash([2, 3]);
    seg(ctx, lx, base, lx + inner, base);
    ctx.setLineDash([]);
    const prog = still ? 1 : Math.max(hover, clamp((t * 0.3 * s.speed + s.a) % 1.6)) * enter;
    const amp = Math.min(sh * 0.07, 9);
    const P = (q: number): [number, number] => [lx + inner * (0.05 + 0.85 * q) + Math.sin(q * 21 + s.phase) * inner * 0.04, base - 3 - amp * (0.5 + 0.5 * Math.sin(q * TAU * 3.5 + s.phase)) * (1 - q * 0.45)];
    ctx.strokeStyle = rgba(pal.accent, 0.95);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const [x, y] = P((i / 40) * prog);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (prog < 1) {
      const [x, y] = P(prog);
      ctx.fillStyle = rgba(pal.ink, 1);
      disc(ctx, x, y, 2.4);
    }
  };
};

/** an open book; a page turns over by itself, or follows the pointer from one side to the other */
export const book: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "LEARNING");
    if (!b) return;
    const { ctx, t, pal, hover, mx, still, enter } = f;
    const cx = b.cx;
    const base = b.y + b.h * 0.84;
    const pw = Math.min(b.w * 0.42, b.h * 0.8);
    const ph = b.h * 0.6;
    const lift = ph * 0.1;
    const page = (side: number, col: typeof pal.ink, alpha: number) => {
      const ox = cx + side * pw;
      ctx.beginPath();
      ctx.moveTo(cx, base);
      ctx.quadraticCurveTo(cx + side * pw * 0.5, base - lift * 1.6, ox, base - lift);
      ctx.lineTo(ox, base - lift - ph);
      ctx.quadraticCurveTo(cx + side * pw * 0.5, base - lift * 1.6 - ph, cx, base - ph);
      ctx.closePath();
      ctx.fillStyle = rgba(col, 0.06);
      ctx.fill();
      ctx.strokeStyle = rgba(col, alpha);
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      for (let i = 0; i < 4; i++) {
        const y = base - ph * (0.24 + i * 0.18);
        const far = i === 3 ? 0.6 : 0.82;
        seg(ctx, cx + side * pw * 0.16, y - lift * 0.45, cx + side * pw * (0.16 + (far - 0.16) * enter), y - lift * (0.45 + far * 0.6));
      }
    };
    ctx.lineWidth = 1.4;
    page(-1, pal.ink2, 0.9);
    page(1, pal.ink2, 0.9);
    // the page that is turning
    const q = still ? 0.42 : (t * 0.25 * s.speed + s.a) % 1;
    const idle = smooth(clamp(q * 1.5)) * Math.PI;
    const byHand = clamp((cx + pw - mx) / (2 * pw)) * Math.PI;
    let a = lerp(idle, byHand, hover);
    if (s.dir < 0) a = Math.PI - a;
    const tx = cx + Math.cos(a) * pw;
    const ty = base - lift - Math.sin(a) * ph * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx, base);
    ctx.quadraticCurveTo(cx + Math.cos(a) * pw * 0.5, base - lift * 1.6 - Math.sin(a) * ph * 0.1, tx, ty);
    ctx.lineTo(tx, ty - ph);
    ctx.quadraticCurveTo(cx + Math.cos(a) * pw * 0.5, base - lift * 1.6 - Math.sin(a) * ph * 0.1 - ph, cx, base - ph);
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.14);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.accent, 0.95);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = rgba(pal.ink, 0.9);
    ctx.lineWidth = 2;
    seg(ctx, cx, base, cx, base - ph);
  };
};

/** lines of words with a magnifier passing over them: what is under the glass is drawn large; the glass follows the pointer */
export const magnifier: Maker = (seed) => {
  const s = vary(seed);
  const rows = Array.from({ length: 5 }, () => {
    const words: number[] = [];
    let used = 0;
    while (used < 0.86) {
      const w = 0.1 + s.rnd() * 0.2;
      words.push(w);
      used += w + 0.05;
    }
    return words;
  });
  return (f) => {
    const b = stage(f, "DEFINITIONS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, my, enter } = f;
    const r = b.u * 0.24;
    const lcx = clamp(lerp(b.cx + b.w * 0.26 * Math.sin(t * 0.4 * s.speed + s.phase), mx, hover), b.x + r * 1.7, b.r - r * 1.7);
    const lcy = clamp(lerp(b.cy + b.h * 0.16 * Math.sin(t * 0.55 * s.speed + s.phase * 2), my, hover), b.y + r + 2, b.b - r * 1.7);
    const bars = (lw: number, alpha: number, lit: boolean) => {
      ctx.lineWidth = lw;
      rows.forEach((words, i) => {
        const y = b.y + b.h * (0.14 + i * 0.18);
        let x = b.x + 2;
        words.forEach((wd, j) => {
          const len = wd * (b.w - 4) * enter;
          if (x + len > b.r - 2) return;
          ctx.strokeStyle = rgba(lit && (i + j) % 4 === 1 ? pal.accent : pal.ink3, alpha);
          seg(ctx, x, y, x + len, y);
          x += (wd + 0.05) * (b.w - 4);
        });
      });
    };
    // the page outside the glass
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, f.w, f.h);
    ctx.arc(lcx, lcy, r, 0, TAU, true);
    ctx.clip();
    bars(2.2, 0.6, false);
    ctx.restore();
    // the same page, larger, inside it
    ctx.save();
    ctx.beginPath();
    ctx.arc(lcx, lcy, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = rgba(pal.accent, 0.07);
    ctx.fillRect(lcx - r, lcy - r, r * 2, r * 2);
    ctx.translate(lcx, lcy);
    ctx.scale(1.7, 1.7);
    ctx.translate(-lcx, -lcy);
    bars(2.6, 0.95, true);
    ctx.restore();
    ctx.strokeStyle = rgba(pal.ink, 0.95);
    ctx.lineWidth = 2;
    ring(ctx, lcx, lcy, r);
    const hx = s.dir * 0.7071;
    ctx.lineWidth = 3.4;
    seg(ctx, lcx + hx * r, lcy + 0.7071 * r, lcx + hx * r * 1.62, lcy + 0.7071 * r * 1.62);
  };
};

/** a speech bubble holding a question mark that resolves into a tick; the pointer answers it at once */
export const question: Maker = (seed) => {
  const s = vary(seed);
  return (f) => {
    const b = stage(f, "QUESTIONS");
    if (!b) return;
    const { ctx, t, pal, hover, still, enter } = f;
    const u = b.u;
    const cx = b.cx;
    const cy = b.cy - u * 0.06;
    const bw = Math.min(b.w * 0.6, u * 0.95);
    const bh = u * 0.72;
    const q = still ? 0.8 : (t * 0.2 * s.speed + s.a) % 1;
    const auto = smooth((q - 0.35) / 0.2) * (1 - smooth((q - 0.93) / 0.07));
    const done = Math.max(auto, hover) * enter;
    rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, u * 0.12);
    ctx.fillStyle = rgba(done > 0.5 ? pal.emerald : pal.accent, 0.08);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.stroke();
    // the tail of the bubble
    const tx = cx + s.dir * bw * 0.22;
    ctx.beginPath();
    ctx.moveTo(tx - s.dir * u * 0.07, cy + bh / 2);
    ctx.lineTo(tx + s.dir * u * 0.05, cy + bh / 2 + u * 0.13);
    ctx.lineTo(tx + s.dir * u * 0.08, cy + bh / 2);
    ctx.stroke();
    const g = u * 0.42;
    if (done < 0.98) {
      ctx.strokeStyle = rgba(pal.accent, 1 - done);
      ctx.fillStyle = rgba(pal.accent, 1 - done);
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx, cy - g * 0.2, g * 0.24, Math.PI, Math.PI * 2.5);
      ctx.lineTo(cx, cy + g * 0.22);
      ctx.stroke();
      disc(ctx, cx, cy + g * 0.42, 2.2);
    }
    if (done > 0.02) {
      const p0: [number, number] = [cx - g * 0.32, cy + g * 0.02];
      const p1: [number, number] = [cx - g * 0.08, cy + g * 0.28];
      const p2: [number, number] = [cx + g * 0.36, cy - g * 0.28];
      const k1 = clamp(done * 2.5);
      const k2 = clamp(done * 2.5 - 1);
      ctx.strokeStyle = rgba(pal.emerald, done);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(lerp(p0[0], p1[0], k1), lerp(p0[1], p1[1], k1));
      if (k2 > 0) ctx.lineTo(lerp(p1[0], p2[0], k2), lerp(p1[1], p2[1], k2));
      ctx.stroke();
    }
  };
};

/** an order ticket: a few fields and two buttons, BUY and SELL, taking turns; the one under the pointer is pressed */
export const ticket: Maker = (seed) => {
  const s = vary(seed);
  const fields = [0.35 + s.a * 0.3, 0.3 + s.b * 0.35, 0.3 + s.c * 0.3];
  return (f) => {
    const b = stage(f, "ORDERS");
    if (!b) return;
    const { ctx, t, pal, hover, mx, enter } = f;
    const tw = Math.min(b.w * 0.72, b.h * 1.3);
    const th = b.h - 4;
    const x0 = b.cx - tw / 2;
    const y0 = b.y + 2;
    rr(ctx, x0, y0, tw, th, 5);
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.stroke();
    const split = y0 + th * 0.56;
    ctx.strokeStyle = rgba(pal.ink3, 0.7);
    ctx.setLineDash([3, 4]);
    seg(ctx, x0 + 4, split, x0 + tw - 4, split);
    ctx.setLineDash([]);
    fields.forEach((len, i) => {
      const y = y0 + th * (0.13 + i * 0.15);
      ctx.strokeStyle = rgba(pal.ink3, 0.6);
      ctx.lineWidth = 2;
      seg(ctx, x0 + tw * 0.1, y, x0 + tw * 0.28, y);
      ctx.strokeStyle = rgba(pal.ink2, 0.75);
      seg(ctx, x0 + tw * 0.4, y, x0 + tw * (0.4 + len * 0.5 * enter), y);
    });
    const gap = tw * 0.07;
    const bw = (tw - gap * 3) / 2;
    const bh = Math.max(16, th * 0.26);
    const by = split + (y0 + th - split - bh) / 2;
    const idle = Math.sin(t * 0.8 * s.speed + s.phase) > 0 ? 0 : 1;
    const active = hover > 0.5 ? (mx < b.cx ? 0 : 1) : idle;
    ctx.lineWidth = 1.4;
    ["BUY", "SELL"].forEach((label, i) => {
      const x = x0 + gap + i * (bw + gap);
      const col = i === 0 ? pal.emerald : ALERT;
      const on = active === i;
      const press = on ? 1 + near(f, x + bw / 2, by + bh / 2, bw) * 0.6 : 0;
      rr(ctx, x, by, bw, bh, 4);
      ctx.fillStyle = rgba(col, on ? 0.2 + press * 0.08 : 0.04);
      ctx.fill();
      ctx.strokeStyle = rgba(col, on ? 1 : 0.5);
      ctx.stroke();
      word(f, label, x + bw / 2, by + bh / 2 + 3.5, "center", on ? col : pal.ink3);
    });
  };
};
