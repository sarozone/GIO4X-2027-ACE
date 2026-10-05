import { ALERT, clamp, lerp, rgba, rr, scene, seg, tag, wander } from "./kit";

/**
 * LEVERAGE, told in five chapters: a small deposit, the larger position it
 * controls, a small move in price, the large move that makes in the account,
 * and the same thing in the other direction. The reference scene for the
 * others: every chapter stands on its own, answers the pointer, and composes
 * a still at any moment.
 */
export const leverage = scene((v) => ({
  caption: "Leverage",
  line: "A small deposit controls a much larger position, so a small move in price becomes a large move in the account, in both directions.",
  parts: [
    {
      label: "A small deposit",
      note: "The margin: the part of the position that is your own money.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const s = b.u * (0.26 + 0.02 * Math.sin(t * 1.4 + v.phase)) * p;
        const y = b.b - 8;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, y, b.r, y);
        ctx.fillStyle = rgba(pal.accent, 0.55 + 0.4 * k);
        rr(ctx, b.cx - s / 2, y - s, s, s, 3);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();
        // the outline of what it will control, waiting
        const big = Math.min(b.h - 14, b.w * 0.7);
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = rgba(pal.gold, 0.35 + 0.5 * k);
        rr(ctx, b.cx - big / 2, y - big, big, big, 4);
        ctx.stroke();
        ctx.setLineDash([]);
        tag(f, "margin", b.cx, y - s - 7, "center", pal.accent);
      },
    },
    {
      label: "A larger position",
      note: "The broker lends the rest. The lever is the ratio between the two.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const d = v.dir;
        const ground = b.b - 6;
        const px = b.cx + d * b.w * 0.18;
        const py = ground - b.h * 0.3;
        const L1 = Math.min(b.w * 0.56, b.h * 1.3);
        const L2 = L1 * 0.36;
        const big = Math.min(b.h * 0.44, b.w * 0.26) * p;
        const small = big * 0.42;
        // the pointer leans on the long arm: the further out, the more it lifts
        const push = k * clamp(((px - f.mx) * d) / L1, -0.3, 1);
        const th = (0.07 * Math.sin(t * 0.8 * v.speed + v.phase) + 0.2 * push) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, ground, b.r, ground);
        ctx.fillStyle = rgba(pal.ink2, 0.85);
        ctx.beginPath();
        ctx.moveTo(px, py + 2);
        ctx.lineTo(px - 12, ground);
        ctx.lineTo(px + 12, ground);
        ctx.closePath();
        ctx.fill();
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-d * th);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 3;
        seg(ctx, -d * L1, 0, d * L2, 0);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.accent, 0.9);
        ctx.fillRect(-d * (L1 - small / 2 - 2) - small / 2, -2.5 - small, small, small);
        const bx = d * (L2 - big / 2);
        ctx.fillStyle = rgba(pal.gold, 0.2 + 0.15 * k);
        ctx.fillRect(bx - big / 2, -2.5 - big, big, big);
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.strokeRect(bx - big / 2, -2.5 - big, big, big);
        ctx.restore();
        tag(f, "position", px + d * (L2 - big / 2), b.y + 9, "center", pal.gold);
      },
    },
    {
      label: "A small move in price",
      note: "The market moves a little, as it does all day.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const N = 46;
        const amp = b.h * 0.2;
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, b.x, b.cy, b.r, b.cy);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        let ly = b.cy;
        for (let i = 0; i <= N * p; i++) {
          const x = b.x + (i / N) * (b.w - 26);
          ly = b.cy - wander(t * 0.7 * v.speed - (N - i) * 0.13, v.phase) * amp;
          if (i === 0) ctx.moveTo(x, ly);
          else ctx.lineTo(x, ly);
        }
        ctx.stroke();
        // the move, measured from where the position was opened
        const x = b.r - 14;
        ctx.strokeStyle = rgba(ly < b.cy ? pal.emerald : ALERT, 0.95);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, x, b.cy, x, ly);
        ctx.lineWidth = 1.4;
        tag(f, "entry", b.x, b.cy - 6, "left", pal.ink3);
      },
    },
    {
      label: "A large move in the account",
      note: "The gain or loss is counted on the whole position, not on the deposit.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const m = wander(t * 0.7 * v.speed, v.phase) * p;
        // the pointer sets the lever: further right, more of it
        const lev = lerp(2.2, 3.8, k ? clamp((f.mx - b.x) / b.w) : 0.5);
        const unit = b.h * 0.115;
        const col = m >= 0 ? pal.emerald : ALERT;
        const bars: [number, number, string][] = [
          [b.x + b.w * 0.28, m * unit, "price"],
          [b.x + b.w * 0.7, clamp(m * unit * lev, -b.h * 0.42, b.h * 0.42), "account"],
        ];
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, b.cy, b.r, b.cy);
        const bw = Math.min(46, b.w * 0.2);
        for (const [x, hgt, name] of bars) {
          ctx.fillStyle = rgba(col, 0.3 + 0.3 * k);
          ctx.fillRect(x - bw / 2, b.cy, bw, -hgt);
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.strokeRect(x - bw / 2, b.cy, bw, -hgt);
          tag(f, name, x, b.b - 2, "center", pal.ink3);
        }
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        seg(ctx, (bars[0]?.[0] ?? 0) + bw / 2, b.cy - (bars[0]?.[1] ?? 0), (bars[1]?.[0] ?? 0) - bw / 2, b.cy - (bars[1]?.[1] ?? 0));
        ctx.setLineDash([]);
      },
    },
    {
      label: "In both directions",
      note: "The lever that multiplies a gain multiplies a loss by exactly as much.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const th = (0.22 * Math.sin(t * 0.6 * v.speed + v.phase) + k * clamp((f.mx - b.cx) / b.w, -0.5, 0.5) * 0.5) * p;
        const L = Math.min(b.w * 0.4, b.h * 0.9);
        const py = b.cy + b.h * 0.12;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.cx, py, b.cx, b.b - 4);
        seg(ctx, b.cx - 16, b.b - 4, b.cx + 16, b.b - 4);
        const ends: [number, readonly [number, number, number, number], string][] = [
          [-1, pal.emerald, "gain"],
          [1, ALERT, "loss"],
        ];
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2.4;
        seg(ctx, b.cx - Math.cos(th) * L, py + Math.sin(th) * L, b.cx + Math.cos(th) * L, py - Math.sin(th) * L);
        ctx.lineWidth = 1.4;
        for (const [side, col, name] of ends) {
          const x = b.cx + side * Math.cos(th) * L;
          const y = py - side * Math.sin(th) * L;
          const r = b.u * 0.12;
          ctx.fillStyle = rgba(col, 0.3 + 0.35 * clamp(side * th * 4 + 0.4));
          rr(ctx, x - r, y - r * 2 - 2, r * 2, r * 2, 3);
          ctx.fill();
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.stroke();
          tag(f, name, x, y - r * 2 - 8, "center", col);
        }
      },
    },
  ],
}));
