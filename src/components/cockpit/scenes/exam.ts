/**
 * EXAM — a paper being sat, and what it earns.
 *
 * An answer sheet lies in front: a column of questions, each with four option
 * circles under the letters A to D. One row at a time a circle is filled in.
 * Across the top runs the progress of the paper, one segment for each
 * question. Behind the sheet a certificate rises as the paper goes on, and
 * when the last row is done its seal is pressed in. Then the sheet is cleared
 * and another paper begins, with other answers.
 *
 * The pointer is the pencil: the row under it is picked out and the circle
 * nearest it opens to be filled; over the certificate, the certificate lifts.
 *
 * Which circle is filled means nothing: no answer here is marked right or
 * wrong, and the bar counts questions, not a score.
 */
import { TAU, clamp, rgba, type Scene } from "../engine";
import { rounded, smooth, stage } from "./_stage";

/** seconds for one paper */
const LOOP = 15;
const ROWS = 6;
const OPTS = ["A", "B", "C", "D"];

const scene: Scene = {
  // the paper finished, the seal on the certificate
  pose: 12.9,
  draw(f) {
    const { ctx, pal } = f;
    const R = stage(f);
    const W = Math.min(R.w, R.h * 1.618);
    const H = W / 1.618;
    const ox = R.x + (R.w - W) / 2;
    const oy = R.y + (R.h - H) / 2;
    const turn = f.t / LOOP;
    const loop = Math.floor(turn);
    const u = turn - loop;
    /** rows answered so far, the seal, and the clearing of the paper at the end */
    const done = clamp(u / 0.7) * ROWS;
    const pass = smooth((u - 0.72) / 0.1);
    const fade = 1 - smooth((u - 0.94) / 0.06);
    const inside = (x: number, y: number, w: number, h: number) => (f.mx >= x && f.mx <= x + w && f.my >= y && f.my <= y + h ? f.hover : 0);

    // ── the certificate, behind: it rises with the paper
    const cw = W * 0.46;
    const ch = cw * 0.7;
    const cx = ox + W * 0.42;
    const rise = smooth(done / ROWS) * fade;
    const certOn = f.on(0.4, 0.4);
    const cy0 = oy + H * (0.28 + 0.12 * (1 - rise));
    const cy = cy0 - inside(cx, cy0, cw, ch) * H * 0.025;
    const ca = certOn * (0.4 + 0.6 * rise);
    if (ca > 0.003) {
      ctx.save();
      ctx.globalAlpha = ca;
      rounded(ctx, cx, cy, cw, ch, 3);
      ctx.fillStyle = rgba(pal.bg, 0.96);
      ctx.fill();
      ctx.fillStyle = rgba(pal.gold, 0.06);
      ctx.fill();
      ctx.strokeStyle = rgba(pal.gold, 0.85);
      ctx.lineWidth = 1.25;
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.gold, 0.3);
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 5, cy + 5, cw - 10, ch - 10);
      // its lettering sits in the part the sheet leaves clear
      const mx = cx + cw * 0.58;
      ctx.font = `600 ${Math.max(7, Math.round(H * 0.03))}px ${pal.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(pal.gold, 0.95);
      ctx.fillText("CERTIFICATE", mx, cy + ch * 0.2);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mx - cw * 0.27, cy + ch * 0.36);
      ctx.lineTo(mx + cw * 0.27, cy + ch * 0.36);
      ctx.strokeStyle = rgba(pal.ink, 0.55);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx - cw * 0.19, cy + ch * 0.48);
      ctx.lineTo(mx + cw * 0.19, cy + ch * 0.48);
      ctx.moveTo(cx + cw * 0.3, cy + ch * 0.8);
      ctx.lineTo(cx + cw * 0.56, cy + ch * 0.8);
      ctx.strokeStyle = rgba(pal.ink2, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
      // the seal: an empty ring until the paper is done, then pressed in with its two ribbons
      const qx = cx + cw * 0.8;
      const qy = cy + ch * 0.7;
      const sr = ch * 0.15;
      ctx.beginPath();
      ctx.arc(qx, qy, sr, 0, TAU);
      ctx.strokeStyle = rgba(pal.gold, 0.3);
      ctx.stroke();
      const seal = pass * fade;
      if (seal > 0.003) {
        const r = sr * (1.45 - 0.45 * seal);
        ctx.globalAlpha = ca * seal;
        ctx.beginPath();
        ctx.moveTo(qx - r * 0.5, qy + r * 0.6);
        ctx.lineTo(qx - r * 0.75, qy + r * 1.9);
        ctx.lineTo(qx - r * 0.3, qy + r * 1.6);
        ctx.lineTo(qx, qy + r * 0.9);
        ctx.lineTo(qx + r * 0.3, qy + r * 1.6);
        ctx.lineTo(qx + r * 0.75, qy + r * 1.9);
        ctx.lineTo(qx + r * 0.5, qy + r * 0.6);
        ctx.closePath();
        ctx.fillStyle = rgba(pal.gold, 0.5);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < 32; i++) {
          const a = (i * TAU) / 32;
          const k = i % 2 ? r * 0.88 : r;
          if (i) ctx.lineTo(qx + Math.cos(a) * k, qy + Math.sin(a) * k);
          else ctx.moveTo(qx + k, qy);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(pal.bg, 0.95);
        ctx.fill();
        ctx.fillStyle = rgba(pal.gold, 0.42);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(qx, qy, r * 0.58, 0, TAU);
        ctx.strokeStyle = rgba(pal.ink, 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // ── the progress of the paper, across the top: one segment for each question
    const barOn = f.on(0, 0.35);
    const bx = ox + W * 0.12;
    const bw = W * 0.76;
    const by = oy + H * 0.09;
    const bh = Math.max(4, H * 0.022);
    const gap = 4;
    const sw = (bw - gap * (ROWS - 1)) / ROWS;
    for (let i = 0; i < ROWS; i++) {
      const x = bx + i * (sw + gap);
      const q = clamp(done - i) * fade;
      ctx.fillStyle = rgba(pal.ink, 0.1 * barOn);
      ctx.fillRect(x, by, sw, bh);
      if (q > 0) {
        ctx.fillStyle = rgba(pal.key, 0.85 * barOn * (1 - pass));
        ctx.fillRect(x, by, sw * q, bh);
        ctx.fillStyle = rgba(pal.gold, 0.9 * barOn * pass * fade);
        ctx.fillRect(x, by, sw * q, bh);
      }
    }

    // ── the answer sheet, in front
    const sheetOn = f.on(0.15, 0.4);
    if (sheetOn <= 0.003) return;
    const sx = ox + W * 0.12;
    const sy = oy + H * 0.2;
    const shw = W * 0.38;
    const shh = H * 0.72;
    ctx.save();
    ctx.globalAlpha = sheetOn;
    ctx.fillStyle = rgba(pal.bg, 0.5);
    ctx.fillRect(sx + 5, sy + 6, shw, shh);
    rounded(ctx, sx, sy, shw, shh, 3);
    ctx.fillStyle = rgba(pal.bg, 0.97);
    ctx.fill();
    ctx.fillStyle = rgba(pal.ink, 0.05);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.ink2, 0.7);
    ctx.lineWidth = 1;
    ctx.stroke();

    const colX = (j: number) => sx + shw * (0.36 + j * 0.165);
    const rowY = (i: number) => sy + shh * (0.24 + i * 0.125);
    const r = Math.min(shw * 0.052, shh * 0.042);
    const rowH = shh * 0.125;
    ctx.font = `600 ${Math.max(7, Math.round(H * 0.032))}px ${pal.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(pal.ink2, 0.85);
    for (let j = 0; j < 4; j++) ctx.fillText(OPTS[j], colX(j), sy + shh * 0.1);
    ctx.beginPath();
    ctx.moveTo(sx + shw * 0.08, sy + shh * 0.16);
    ctx.lineTo(sx + shw * 0.92, sy + shh * 0.16);
    ctx.strokeStyle = rgba(pal.ink, 0.25);
    ctx.stroke();

    let px = 0;
    let py = 0;
    let pen = 0;
    for (let i = 0; i < ROWS; i++) {
      const y = rowY(i);
      const q = clamp(done - i);
      // the row under the pencil
      const here = inside(sx, y - rowH / 2, shw, rowH);
      if (here > 0) {
        ctx.fillStyle = rgba(pal.key, 0.1 * here);
        ctx.fillRect(sx + 1, y - rowH / 2, shw - 2, rowH);
      }
      // the question: a short ruled stub at the left
      ctx.beginPath();
      ctx.moveTo(sx + shw * 0.08, y);
      ctx.lineTo(sx + shw * 0.22, y);
      ctx.strokeStyle = rgba(pal.ink, 0.3 + 0.4 * q * fade);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      const pick = Math.min(3, Math.floor(f.rnd(i * 3 + loop * 17) * 4));
      for (let j = 0; j < 4; j++) {
        const x = colX(j);
        const k = f.hover * smooth(1 - Math.hypot(f.mx - x, f.my - y) / (r * 5));
        ctx.beginPath();
        ctx.arc(x, y, r * (1 + 0.3 * k), 0, TAU);
        ctx.strokeStyle = rgba(pal.ink2, 0.6);
        ctx.stroke();
        if (k > 0.01) {
          ctx.strokeStyle = rgba(pal.key, 0.9 * k);
          ctx.stroke();
        }
        if (j !== pick || q <= 0) continue;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, r * 0.78 * smooth(q)), 0, TAU);
        ctx.fillStyle = rgba(pal.key, 0.95 * fade);
        ctx.fill();
        if (q < 1) {
          px = x;
          py = y;
          pen = 1;
        }
      }
    }
    // the pencil: a point of light on the circle being filled
    if (pen && !f.still) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.2);
      g.addColorStop(0, rgba(pal.key, 0.6));
      g.addColorStop(1, rgba(pal.key, 0));
      ctx.fillStyle = g;
      ctx.fillRect(px - r * 3.2, py - r * 3.2, r * 6.4, r * 6.4);
    }
    ctx.restore();
  },
};

export default scene;
