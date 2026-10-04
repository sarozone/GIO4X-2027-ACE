import { TAU, clamp, lerp, rgba, smooth, type Colour, type FigureDraw, type FigureFrame } from "@/components/figures/Figure";
import { ALERT, AMBER } from "@/components/labs/kit";

/**
 * The few parts every gap figure is made of: the frame it draws in, its one
 * caption, a seed turned into proportions, and the handful of strokes they share.
 *
 * The rule it keeps: a gap figure is one idea with one small-caps word under
 * it. Nothing here draws a number, and nothing paints a background: the figure
 * stands on the bare page, so every mark is a palette colour that reads on
 * both themes.
 */

export { TAU, clamp, lerp, rgba, smooth, ALERT, AMBER };
export type { Colour, FigureDraw, FigureFrame };

/** a figure, made once for a seed: two seeds give two differently drawn pictures of the same idea */
export type Maker = (seed: number) => FigureDraw;

/** the part of the canvas a figure may draw in: everything above the caption, inside a small margin */
export type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** right and bottom edges */
  r: number;
  b: number;
  cx: number;
  cy: number;
  /** the shorter side */
  u: number;
};

const PAD = 14;
const CAPTION = 28;

/** A small-caps word on the canvas. */
export function word(f: FigureFrame, s: string, x: number, y: number, align: CanvasTextAlign = "left", c: Colour = f.pal.ink3, alpha = 1): void {
  const { ctx } = f;
  ctx.font = `600 10px ${f.pal.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  (ctx as unknown as { letterSpacing?: string }).letterSpacing = "0.6px";
  ctx.fillStyle = rgba(c, alpha);
  ctx.fillText(s, x, y);
}

/** Writes the caption in the bottom left corner and hands back the box above it; null on a canvas too small to draw on. */
export function stage(f: FigureFrame, caption: string): Box | null {
  const { ctx, w, h } = f;
  if (w < 100 || h < 60) return null;
  word(f, caption, PAD, h - 11, "left", f.pal.ink3, 0.95);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.4;
  const bw = w - PAD * 2;
  const bh = h - 12 - CAPTION;
  return { x: PAD, y: 12, w: bw, h: bh, r: PAD + bw, b: 12 + bh, cx: PAD + bw / 2, cy: 12 + bh / 2, u: Math.min(bw, bh) };
}

/** What a seed decides: four free proportions, a direction, a phase and a pace. */
export type Vary = { a: number; b: number; c: number; d: number; dir: 1 | -1; phase: number; speed: number; rnd: () => number };

export function vary(seed: number): Vary {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const dir: 1 | -1 = rnd() < 0.5 ? 1 : -1;
  const phase = rnd() * TAU;
  const speed = 0.8 + rnd() * 0.45;
  return { dir, phase, speed, a: rnd(), b: rnd(), c: rnd(), d: rnd(), rnd };
}

export function seg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** a filled disc; a radius below zero is drawn as nothing */
export function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
  ctx.fill();
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
  ctx.stroke();
}

/** the path of a rectangle with rounded corners (the caller fills or strokes it) */
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const ww = Math.max(0, w);
  const hh = Math.max(0, h);
  const k = Math.max(0, Math.min(r, ww / 2, hh / 2));
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.lineTo(x + ww - k, y);
  ctx.quadraticCurveTo(x + ww, y, x + ww, y + k);
  ctx.lineTo(x + ww, y + hh - k);
  ctx.quadraticCurveTo(x + ww, y + hh, x + ww - k, y + hh);
  ctx.lineTo(x + k, y + hh);
  ctx.quadraticCurveTo(x, y + hh, x, y + hh - k);
  ctx.lineTo(x, y + k);
  ctx.quadraticCurveTo(x, y, x + k, y);
  ctx.closePath();
}

/** a line with an arrow head at its far end */
export function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, head = 5): void {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.moveTo(x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head);
  ctx.stroke();
}

/** 0 to 1: how close the pointer is to a point, and only while it is over the figure */
export function near(f: FigureFrame, x: number, y: number, reach: number): number {
  return f.hover * clamp(1 - Math.hypot(x - f.mx, y - f.my) / Math.max(1, reach));
}

/** a colour between two palette colours */
export function mix(a: Colour, b: Colour, k: number): Colour {
  const t = clamp(k);
  return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t)), lerp(a[3], b[3], t)];
}
