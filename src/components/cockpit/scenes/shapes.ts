/**
 * SHAPES — one line, and the patterns read into it.
 *
 * A single price line on a sheet of chart paper. It holds one of the classic
 * shapes for a while, then its turning points move, slowly, and it becomes the
 * next: a head and shoulders, a double top, a triangle, a flag. Over the line,
 * in champagne, is the outline a chartist would rule onto it: the neckline and
 * the line across the shoulders, the ceiling and the neckline of the double
 * top, the two lines of the triangle closing on each other, the two parallel
 * lines of the flag. The outline moves with the line from one shape to the
 * next, and the turning points that rest on it are marked. The shape's name
 * stands under the sheet.
 *
 * The pointer: the outline is ruled further and heavier, the turning point
 * nearest the pointer is ringed, and a mark rides the line under it.
 *
 * It is a drawing of four textbook figures. The sheet has no scale, no symbol
 * and no figure on it, and no shape here is a forecast.
 */
import { TAU, clamp, easeInOut, lerp, rgba, type Scene } from "../engine";
import { smooth, stage } from "./_stage";

/** a ruled line of the outline: from (x, y) to (x, y), and how strongly it is drawn */
type Rule = readonly [number, number, number, number, number];
type Shape = { name: string; pts: readonly (readonly [number, number])[]; a: Rule; b: Rule };

/** every shape has the same eleven turning points, so one can become another */
const SHAPES: readonly Shape[] = [
  {
    name: "HEAD AND SHOULDERS",
    pts: [[0, 0.12], [0.14, 0.52], [0.24, 0.34], [0.4, 0.88], [0.56, 0.36], [0.68, 0.54], [0.78, 0.374], [0.84, 0.3], [0.89, 0.36], [0.95, 0.14], [1, 0.08]],
    a: [0.1, 0.331, 0.94, 0.384, 1],
    b: [0.08, 0.518, 0.76, 0.543, 0.5],
  },
  {
    name: "DOUBLE TOP",
    pts: [[0, 0.1], [0.12, 0.4], [0.26, 0.84], [0.36, 0.62], [0.44, 0.5], [0.54, 0.66], [0.64, 0.84], [0.74, 0.6], [0.8, 0.5], [0.9, 0.26], [1, 0.14]],
    a: [0.36, 0.5, 0.94, 0.5, 1],
    b: [0.18, 0.84, 0.74, 0.84, 1],
  },
  {
    name: "TRIANGLE",
    pts: [[0, 0.3], [0.1, 0.883], [0.22, 0.161], [0.34, 0.77], [0.45, 0.267], [0.55, 0.672], [0.64, 0.354], [0.72, 0.592], [0.79, 0.423], [0.88, 0.72], [1, 0.92]],
    a: [0.17, 0.138, 0.9, 0.474, 1],
    b: [0.05, 0.9065, 0.9, 0.507, 1],
  },
  {
    name: "FLAG",
    pts: [[0, 0.08], [0.1, 0.2], [0.3, 0.78], [0.38, 0.62], [0.46, 0.72], [0.54, 0.56], [0.62, 0.66], [0.7, 0.5], [0.78, 0.6], [0.88, 0.8], [1, 0.95]],
    a: [0.34, 0.635, 0.84, 0.4475, 1],
    b: [0.26, 0.795, 0.84, 0.5775, 1],
  },
];
const TURNS = 11;
/** two small steps between each pair of turning points, so the line is not ruled */
const SUB = 3;
const COUNT = (TURNS - 1) * SUB + 1;
/** seconds a shape is held, and seconds it takes to become the next */
const [HOLD, MORPH] = [7, 4];

type State = { jit: Float32Array; vx: Float32Array; vy: Float32Array; sx: Float32Array; sy: Float32Array; lead: number };

/** how far the point (x, y) is from the ruled line, in the sheet's own units */
function off(r: readonly number[], x: number, y: number): number {
  const dx = r[2] - r[0];
  const dy = r[3] - r[1];
  const k = clamp(((x - r[0]) * dx + (y - r[1]) * dy) / (dx * dx + dy * dy || 1), -0.08, 1.08);
  return Math.hypot(x - (r[0] + dx * k), y - (r[1] + dy * k));
}

const scene: Scene<State> = {
  pose: 3,
  setup(f) {
    const jit = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) jit[i] = i % SUB ? (f.rnd(20 + i) - 0.5) * 0.034 : 0;
    return {
      jit,
      vx: new Float32Array(TURNS),
      vy: new Float32Array(TURNS),
      sx: new Float32Array(COUNT),
      sy: new Float32Array(COUNT),
      lead: Math.floor(f.rnd(6) * SHAPES.length),
    };
  },
  draw(f, s) {
    const { ctx, pal } = f;
    const m = f.mobile;
    const R = stage(f);

    // ── which shape, and how far it has gone toward the next
    const beat = f.t / (HOLD + MORPH);
    const idx = (Math.floor(beat) + s.lead) % SHAPES.length;
    const k = f.still ? 0 : easeInOut(((beat - Math.floor(beat)) * (HOLD + MORPH) - HOLD) / MORPH);
    const from = SHAPES[idx];
    const to = SHAPES[(idx + 1) % SHAPES.length];
    const ra = [0, 0, 0, 0, 0];
    const rb = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      ra[i] = lerp(from.a[i], to.a[i], k);
      rb[i] = lerp(from.b[i], to.b[i], k);
    }
    for (let i = 0; i < TURNS; i++) {
      s.vx[i] = lerp(from.pts[i][0], to.pts[i][0], k);
      s.vy[i] = lerp(from.pts[i][1], to.pts[i][1], k);
    }

    // ── the sheet: the chart sits in the upper part of the frame, the name under it
    const cw = R.w * 0.78;
    const ch = R.h * 0.6;
    const cx0 = R.x + (R.w - cw) / 2;
    const cy0 = R.y + R.h * 0.13;
    // three layers, moved a little against each other by the pointer: paper, line, outline
    const [px, py] = [f.px * R.w * 0.006, f.py * R.h * 0.006];
    const X = (x: number) => cx0 + x * cw;
    const Y = (y: number) => cy0 + (1 - y) * ch;

    const paper = f.on(0, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const cols = m ? 8 : 16;
    for (let i = 0; i <= cols; i++) {
      const x = X(i / cols) - px;
      ctx.moveTo(x, cy0 - py);
      ctx.lineTo(x, cy0 + ch - py);
    }
    const rows = m ? 4 : 8;
    for (let i = 0; i <= rows; i++) {
      const y = Y(i / rows) - py;
      ctx.moveTo(cx0 - px, y);
      ctx.lineTo(cx0 + cw - px, y);
    }
    ctx.strokeStyle = rgba(pal.ink, 0.07 * paper);
    ctx.stroke();
    // the sheet's two axes, with ticks and no figures
    ctx.beginPath();
    ctx.moveTo(cx0 - px, cy0 - py);
    ctx.lineTo(cx0 - px, cy0 + ch - py);
    ctx.lineTo(cx0 + cw - px, cy0 + ch - py);
    ctx.strokeStyle = rgba(pal.ink, 0.34 * paper);
    ctx.stroke();

    // ── the line: the turning points, and two small steps between each pair
    for (let i = 0; i < COUNT; i++) {
      const a = Math.floor(i / SUB);
      const b = Math.min(TURNS - 1, a + 1);
      const u = (i - a * SUB) / SUB;
      s.sx[i] = X(lerp(s.vx[a], s.vx[b], u));
      s.sy[i] = Y(lerp(s.vy[a], s.vy[b], u) + s.jit[i]);
    }
    // powering on, the line is drawn from the left
    const drawn = f.on(0.1, 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx0 - 8, R.y, (cw + 16) * drawn, R.h);
    ctx.clip();
    const run = () => {
      ctx.beginPath();
      ctx.moveTo(s.sx[0], s.sy[0]);
      for (let i = 1; i < COUNT; i++) ctx.lineTo(s.sx[i], s.sy[i]);
    };
    run();
    ctx.lineTo(s.sx[COUNT - 1], cy0 + ch);
    ctx.lineTo(s.sx[0], cy0 + ch);
    ctx.closePath();
    const body = ctx.createLinearGradient(0, cy0, 0, cy0 + ch);
    body.addColorStop(0, rgba(pal.key, 0.16));
    body.addColorStop(1, rgba(pal.key, 0));
    ctx.fillStyle = body;
    ctx.fill();
    run();
    ctx.strokeStyle = rgba(pal.key, 0.2);
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = rgba(pal.ink, 0.95);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // ── the outline, in champagne: ruled a little past its ends, further under the pointer
    const ruled = f.on(0.6, 0.4) * (1 - 0.45 * Math.sin(Math.PI * k));
    const reach = 0.02 + 0.06 * f.hover;
    for (const r of [ra, rb]) {
      const a = r[4] * ruled;
      if (a <= 0.01) continue;
      const dx = r[2] - r[0];
      const dy = r[3] - r[1];
      const [x0, y0, x1, y1] = [X(r[0] - dx * reach) + px, Y(r[1] - dy * reach) + py, X(r[2] + dx * reach) + px, Y(r[3] + dy * reach) + py];
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = rgba(pal.gold, 0.16 * a);
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = rgba(pal.gold, (0.8 + 0.2 * f.hover) * a);
      ctx.lineWidth = 1.4 + 0.8 * f.hover;
      ctx.stroke();
      for (const [ex, ey] of [[x0, y0], [x1, y1]]) {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, TAU);
        ctx.fillStyle = rgba(pal.gold, 0.9 * a);
        ctx.fill();
      }
    }

    // ── the turning points: the ones that rest on the outline are champagne; the one nearest the pointer is ringed
    let nearest = -1;
    if (f.hover > 0.05) {
      let best = (m ? 50 : 80) ** 2;
      for (let i = 1; i < TURNS - 1; i++) {
        const d = (s.sx[i * SUB] - f.mx) ** 2 + (s.sy[i * SUB] - f.my) ** 2;
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
    }
    const marks = f.on(0.7, 0.3);
    for (let i = 1; i < TURNS - 1; i++) {
      const x = s.sx[i * SUB];
      const y = s.sy[i * SUB];
      const on = Math.max(ra[4] * (1 - smooth(off(ra, s.vx[i], s.vy[i]) / 0.03)), rb[4] * (1 - smooth(off(rb, s.vx[i], s.vy[i]) / 0.03)));
      ctx.beginPath();
      ctx.arc(x, y, 2 + 1.4 * on, 0, TAU);
      ctx.fillStyle = rgba(pal.bg, 0.9 * marks);
      ctx.fill();
      ctx.strokeStyle = rgba(on > 0.5 ? pal.gold : pal.ink, (0.55 + 0.4 * on) * marks);
      ctx.lineWidth = 1.25;
      ctx.stroke();
      if (i === nearest) {
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, TAU);
        ctx.strokeStyle = rgba(pal.gold, 0.9 * f.hover);
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
    }

    // ── under the pointer, a mark rides the line; left alone, a light travels along it
    const ride = f.hover > 0.05 ? clamp((f.mx - cx0) / Math.max(1, cw)) : f.still ? -1 : (f.t % HOLD) / HOLD;
    if (ride >= 0 && drawn > 0.99) {
      const want = X(ride);
      let i = 0;
      while (i < COUNT - 2 && s.sx[i + 1] < want) i++;
      const u = clamp((want - s.sx[i]) / Math.max(0.001, s.sx[i + 1] - s.sx[i]));
      const y = lerp(s.sy[i], s.sy[i + 1], u);
      const glow = ctx.createRadialGradient(want, y, 0, want, y, 12);
      const tone = f.hover > 0.05 ? pal.gold : pal.key;
      glow.addColorStop(0, rgba(tone, 0.7));
      glow.addColorStop(1, rgba(tone, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(want - 12, y - 12, 24, 24);
      ctx.beginPath();
      ctx.arc(want, y, 2, 0, TAU);
      ctx.fillStyle = rgba(pal.ink, 0.95);
      ctx.fill();
    }

    // ── the shape's name, and which of the four it is
    const named = f.on(0.85, 0.15);
    const ny = cy0 + ch + (R.y + R.h - cy0 - ch) * 0.44;
    ctx.save();
    ctx.font = `600 ${m ? 9 : 11}px ${pal.font}`;
    ctx.letterSpacing = m ? "1.5px" : "2.5px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const mid = cx0 + cw / 2;
    ctx.fillStyle = rgba(pal.gold, 0.95 * named * (1 - smooth(k / 0.4)));
    ctx.fillText(from.name, mid, ny);
    if (k > 0.6) {
      ctx.fillStyle = rgba(pal.gold, 0.95 * named * smooth((k - 0.6) / 0.4));
      ctx.fillText(to.name, mid, ny);
    }
    ctx.restore();
    const [dash, gap] = [m ? 10 : 14, 6];
    const left = mid - (SHAPES.length * dash + (SHAPES.length - 1) * gap) / 2;
    for (let i = 0; i < SHAPES.length; i++) {
      const cur = i === idx ? 1 - k : i === (idx + 1) % SHAPES.length ? k : 0;
      ctx.fillStyle = rgba(cur > 0.5 ? pal.gold : pal.ink, (0.22 + 0.7 * Math.abs(cur * 2 - 1) * (cur > 0.5 ? 1 : 0)) * named);
      ctx.fillRect(left + i * (dash + gap), ny + (m ? 10 : 13), dash, 2);
    }
  },
};

export default scene;
