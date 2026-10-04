import { TAU, lerp, rgba, type Colour, type Palette } from "@/components/figures/Figure";

/**
 * SCAM SCHOOL — the few strokes every explainer is drawn with: a small-caps
 * label, a dot, a line, a ringed node and a stream of dots from one point to
 * another. Colours are always handed in from the palette, so both themes read.
 */

type Ctx = CanvasRenderingContext2D;
export type Pt = readonly [number, number];

export const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");

/** a small-caps label; used sparingly, the sentence under the canvas carries the meaning */
export function cap(ctx: Ctx, pal: Palette, text: string, x: number, y: number, colour: Colour = pal.ink3, align: CanvasTextAlign = "left", size = 10) {
  ctx.font = `600 ${size}px ${pal.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(colour, 1);
  ctx.fillText(text.toUpperCase(), x, y);
}

export function dot(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, r), 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function line(ctx: Ctx, a: Pt, b: Pt, stroke: string, width = 1, dash: number[] = []) {
  ctx.setLineDash(dash);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** a ring with its name beneath (or above) */
export function node(ctx: Ctx, pal: Palette, at: Pt, r: number, colour: Colour, label: string, above = false, size = 10) {
  ctx.beginPath();
  ctx.arc(at[0], at[1], r, 0, TAU);
  ctx.fillStyle = rgba(colour, 0.12);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = rgba(colour, 1);
  ctx.stroke();
  cap(ctx, pal, label, at[0], at[1] + (above ? -r - 10 : r + 11), pal.ink2, "center", size);
}

/** dots travelling from a to b; in a still frame they stand evenly along the way */
export function flow(ctx: Ctx, a: Pt, b: Pt, t: number, colour: Colour, count = 4, speed = 0.35, r = 2.6) {
  line(ctx, a, b, rgba(colour, 0.3), 1);
  for (let i = 0; i < count; i++) {
    const q = (t * speed + i / count) % 1;
    dot(ctx, lerp(a[0], b[0], q), lerp(a[1], b[1], q), r, rgba(colour, 0.35 + 0.65 * Math.sin(q * Math.PI)));
  }
}

/** a point pulled in from each end of a segment, so a line stops short of the rings it joins */
export function between(a: Pt, b: Pt, ra: number, rb: number): [Pt, Pt] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.hypot(dx, dy) || 1;
  return [
    [a[0] + (dx / d) * ra, a[1] + (dy / d) * ra],
    [b[0] - (dx / d) * rb, b[1] - (dy / d) * rb],
  ];
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}
