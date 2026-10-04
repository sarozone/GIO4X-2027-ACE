import { clamp, lerp, rgba, type Colour, type FigureFrame, type Palette } from "@/components/figures/Figure";
import { ALERT } from "@/components/labs/kit";

/**
 * THE ONE CHART THE MONEY CALCULATORS DRAW.
 *
 * A row of columns, each in up to two stacked parts (money paid in and its
 * growth; principal and interest; what is kept and what tax took), with an
 * optional line across them, a horizontal mark (a target) and vertical marks
 * (the year of retirement, the year a sum has doubled).
 *
 * The rule it keeps: it draws only numbers worked out from the visitor's own
 * inputs, and it is decoration. The sentence beside the canvas says the same
 * thing in words, and a table beneath lists every figure.
 *
 * The columns ease towards their new heights when an input changes; in a still
 * frame (reduced motion) they are simply drawn at their final heights.
 */

export type Tone = "accent" | "gold" | "teal" | "emerald" | "ink" | "ink3" | "alert";

/** the same colours for the legend, which is ordinary HTML beneath the canvas */
export const TONE_CSS: Record<Tone, string> = {
  accent: "var(--accent)",
  gold: "var(--prestige)",
  teal: "var(--teal)",
  emerald: "var(--emerald)",
  ink: "var(--ink)",
  ink3: "var(--ink-3)",
  alert: `rgb(${ALERT[0]},${ALERT[1]},${ALERT[2]})`,
};

const toneOf = (pal: Palette, t: Tone): Colour => (t === "alert" ? ALERT : pal[t]);

export type ChartSpec = {
  /** a short small-caps label, top left */
  title: string;
  /** a is the lower part and b the part stacked on it; a negative b is a shortfall below a */
  cols: { a: number; b: number; alt?: boolean }[];
  toneA: Tone;
  toneB: Tone;
  /** the lower part's colour in columns marked alt */
  toneAlt?: Tone;
  line?: number[];
  lineTone?: Tone;
  /** the line has its own scale (a loan's balance against its monthly payments) */
  lineOwnScale?: boolean;
  mark?: { value: number; label: string };
  /** in column units: 0 is the left edge of the first column, 0.5 its middle */
  vmarks?: { at: number; label: string }[];
  /** what the left and right ends of the row are */
  ends: readonly [string, string];
  /** the reading for one column, shown top right: the last column, or the one under the pointer */
  read: (i: number) => string;
};

/** the heights on screen, which follow the spec a little behind it */
export type ChartMemo = { a: number[]; b: number[]; line: number[]; top: number; lineTop: number };
export const newMemo = (): ChartMemo => ({ a: [], b: [], line: [], top: 0, lineTop: 0 });

/** a number that changes whenever the drawing would, for the still frame */
export function chartRev(spec: ChartSpec): number {
  let s = spec.cols.length * 7 + (spec.mark?.value ?? 0);
  spec.cols.forEach((c, i) => {
    s += (c.a + c.b * 2 + (c.alt ? 3 : 0)) * (i + 1);
  });
  spec.line?.forEach((v, i) => {
    s += v * (i + 2) * 3;
  });
  spec.vmarks?.forEach((v) => {
    s += v.at * 11;
  });
  return Number.isFinite(s) ? s : 0;
}

export function drawChart(f: FigureFrame, spec: ChartSpec, memo: ChartMemo) {
  const { ctx, w, h, t, dt, pal, still, hover, mx } = f;
  if (w < 100 || h < 60) return;
  const n = spec.cols.length;
  if (!n) return;

  // where everything is heading
  let top = 0;
  for (const c of spec.cols) top = Math.max(top, c.a, c.a + c.b);
  let lineTop = 0;
  if (spec.line) for (const v of spec.line) lineTop = Math.max(lineTop, v);
  if (spec.line && !spec.lineOwnScale) top = Math.max(top, lineTop);
  if (spec.mark) top = Math.max(top, spec.mark.value);
  top = top > 0 ? top * 1.08 : 1;
  lineTop = lineTop > 0 ? lineTop * 1.08 : 1;

  // ease towards it; a still frame, and the scale on its first frame, go straight there
  const k = still ? 1 : 1 - Math.exp(-dt * 9);
  memo.top = still || memo.top === 0 ? top : memo.top + (top - memo.top) * k;
  memo.lineTop = still || memo.lineTop === 0 ? lineTop : memo.lineTop + (lineTop - memo.lineTop) * k;
  memo.a.length = n;
  memo.b.length = n;
  memo.line.length = spec.line ? n : 0;
  for (let i = 0; i < n; i++) {
    const c = spec.cols[i]!;
    const a = memo.a[i] ?? 0;
    const b = memo.b[i] ?? 0;
    memo.a[i] = a + (c.a - a) * k;
    memo.b[i] = b + (c.b - b) * k;
    if (spec.line) {
      const l = memo.line[i] ?? 0;
      memo.line[i] = l + ((spec.line[i] ?? 0) - l) * k;
    }
  }

  const padX = 10;
  const bw = (w - padX * 2) / n;
  const gap = bw > 6 ? Math.min(3, bw * 0.18) : 0;
  const focus = hover > 0.5 ? clamp(Math.floor((mx - padX) / bw), 0, n - 1) : n - 1;
  const reading = spec.read(focus);

  ctx.font = `600 10px ${pal.font}`;
  ctx.textBaseline = "middle";
  const twoRows = ctx.measureText(spec.title).width + ctx.measureText(reading).width + 24 > w - padX * 2;
  const marks = spec.vmarks?.length ?? 0;
  const labelsTop = twoRows ? 36 : 24;
  const plotTop = labelsTop + (marks ? marks * 12 + 4 : 2);
  const bottom = h - 22;
  const y = (v: number) => lerp(bottom, plotTop, clamp(v / memo.top));

  // faint rules at a quarter, a half and three quarters
  ctx.strokeStyle = rgba(pal.line, 1);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const q of [0.25, 0.5, 0.75]) {
    const gy = Math.round(lerp(bottom, plotTop, q)) + 0.5;
    ctx.moveTo(padX, gy);
    ctx.lineTo(w - padX, gy);
  }
  ctx.stroke();

  // a slow light crossing the row from left to right, so the chart is read in order
  const scan = still ? -99 : ((t * 0.11) % 1.35) * n;
  const reach = n * 0.07 + 1;
  const colA = toneOf(pal, spec.toneA);
  const colB = toneOf(pal, spec.toneB);
  const colAlt = toneOf(pal, spec.toneAlt ?? spec.toneA);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, memo.a[i]!);
    const b = memo.b[i]!;
    const value = Math.max(0, a + b);
    const x = padX + i * bw + gap / 2;
    const cw = Math.max(1, bw - gap);
    const lit = Math.max(0, 1 - Math.abs(i + 0.5 - scan) / reach) * 0.22 + (hover > 0.5 && i === focus ? 0.22 : 0);
    const base = Math.min(a, value);
    ctx.fillStyle = rgba(spec.cols[i]!.alt ? colAlt : colA, 0.62 + lit);
    ctx.fillRect(x, y(base), cw, bottom - y(base));
    if (b > 0) {
      ctx.fillStyle = rgba(colB, 0.74 + lit);
      ctx.fillRect(x, y(value), cw, y(a) - y(value));
    } else if (b < 0) {
      // a shortfall: the part of what was paid in that is no longer there
      ctx.fillStyle = rgba(ALERT, 0.26 + lit);
      ctx.fillRect(x, y(a), cw, y(value) - y(a));
    }
  }

  // the floor
  ctx.strokeStyle = rgba(pal.ink3, 0.9);
  ctx.beginPath();
  ctx.moveTo(padX, bottom + 0.5);
  ctx.lineTo(w - padX, bottom + 0.5);
  ctx.stroke();

  if (spec.line) {
    const yl = (v: number) => (spec.lineOwnScale ? lerp(bottom, plotTop, clamp(v / memo.lineTop)) : y(v));
    ctx.strokeStyle = rgba(toneOf(pal, spec.lineTone ?? "ink"), 0.95);
    ctx.lineWidth = 1.7;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = padX + (i + 0.5) * bw;
      const py = yl(Math.max(0, memo.line[i]!));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // a bead that travels the line with the light
    if (!still && scan >= 0 && scan < n) {
      const i = Math.min(n - 1, Math.floor(scan));
      ctx.fillStyle = rgba(toneOf(pal, spec.lineTone ?? "ink"), 1);
      ctx.beginPath();
      ctx.arc(padX + (i + 0.5) * bw, yl(Math.max(0, memo.line[i]!)), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (spec.mark) {
    const my = Math.round(y(spec.mark.value)) + 0.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = rgba(pal.ink, 0.85);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, my);
    ctx.lineTo(w - padX, my);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(pal.ink, 1);
    ctx.textAlign = "left";
    ctx.fillText(spec.mark.label, padX + 2, my + (my - plotTop < 14 ? 9 : -8));
  }

  spec.vmarks?.forEach((v, j) => {
    const vx = Math.round(padX + clamp(v.at / n) * (w - padX * 2)) + 0.5;
    const ly = labelsTop + 8 + j * 12;
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = rgba(pal.ink2, 0.9);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vx, ly + 6);
    ctx.lineTo(vx, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(pal.ink, 1);
    const right = vx > w * 0.6;
    ctx.textAlign = right ? "right" : "left";
    ctx.fillText(v.label, vx + (right ? -4 : 4), ly);
  });

  // the words: what it is, the reading, and the two ends of the row
  ctx.textAlign = "left";
  ctx.fillStyle = rgba(pal.ink3, 1);
  ctx.fillText(spec.title, padX, 10);
  ctx.fillText(spec.ends[0], padX, h - 9);
  ctx.textAlign = "right";
  ctx.fillText(spec.ends[1], w - padX, h - 9);
  ctx.fillStyle = rgba(pal.ink, 1);
  if (twoRows) {
    ctx.textAlign = "left";
    ctx.fillText(reading, padX, 23);
  } else {
    ctx.fillText(reading, w - padX, 10);
  }
  ctx.textAlign = "left";
}
