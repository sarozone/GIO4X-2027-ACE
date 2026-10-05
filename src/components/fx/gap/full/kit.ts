import { ALERT, AMBER, TAU, arrow, clamp, disc, lerp, mix, rgba, ring, rr, seg, smooth, vary, type Box, type Colour, type FigureDraw, type FigureFrame, type Maker, type Vary } from "../kit";

/**
 * THE FULL GAP SCENE — one animated explanation that fills the whole of an
 * empty space, whatever its shape.
 *
 * Where the small gap figures were one idea with one word under it, a full
 * scene tells its subject in chapters: a heading and one plain sentence at the
 * top, then up to five chapters, each a moving drawing with a short label,
 * joined by a spine that a pulse travels along. In a narrow space the chapters
 * run down the page; in a wide one they stand in a grid. The taller or
 * wider the space, the more chapters are shown, so the scene always reaches
 * every edge of the space it was given and never leaves a hole in it.
 *
 * A scene is written as a `Story`: its words and its chapters. Each chapter
 * draws inside the box it is handed and knows two things about the reader:
 * `k`, how much the pointer is on this chapter (0 to 1), and the pointer's
 * own position in the frame. Everything else (the layout, the heading, the
 * spine, the drifting field behind, the arrival of each chapter in turn) is
 * done here, once, for all of them.
 *
 * The rules of the small figures still hold: an illustration, never data. No
 * price, no percentage, no figure that could be read as a fact; words only.
 * Palette colours only, so both themes and every accent are followed; no
 * background is painted; under reduced motion one composed still is drawn.
 */

export { ALERT, AMBER, TAU, arrow, clamp, disc, lerp, mix, rgba, ring, rr, seg, smooth, vary };
export type { Box, Colour, FigureDraw, FigureFrame, Maker, Vary };

export type Part = {
  /** two to five words, drawn in small capitals beside the chapter's node */
  label: string;
  /** one short sentence under the label, shown when there is room for it */
  note?: string;
  /**
   * Draws the chapter inside `b`. `k` is 0 to 1: how much the pointer is on this chapter.
   * `p` is 0 to 1: how far the chapter has arrived (use it to assemble the drawing).
   */
  draw: (f: FigureFrame, b: Box, k: number, p: number) => void;
};

export type Story = {
  /** the subject, in small capitals at the top */
  caption: string;
  /** one plain sentence under it: what the scene shows */
  line: string;
  /** the chapters in the order they are told; the first must stand on its own, since a small space shows only it */
  parts: readonly Part[];
};

const PAD = 16;
/** the least room a chapter needs along the direction the story runs */
const MIN_TALL = 196;
const MIN_WIDE = 232;
/** a chapter's drawing is never taller than this, so a very tall space spreads its chapters instead of stretching them */
const MAX_DRAW = 330;

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h, r: x + w, b: y + h, cx: x + w / 2, cy: y + h / 2, u: Math.min(w, h) });

function setFont(f: FigureFrame, size: number, weight = 500, spacing = 0): void {
  f.ctx.font = `${weight} ${size}px ${f.pal.font}`;
  (f.ctx as unknown as { letterSpacing?: string }).letterSpacing = `${spacing}px`;
  f.ctx.textBaseline = "alphabetic";
}

/** the words of a sentence broken into lines no wider than `max`, at the current font; at most `most` lines */
export function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, most = 3): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    const next = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(next).width > max) {
      out.push(line);
      line = w;
      if (out.length === most) break;
    } else line = next;
  }
  if (line && out.length < most) out.push(line);
  return out;
}

/** A small-caps word or two inside a chapter's drawing: a name for a part of it, never a number. */
export function tag(f: FigureFrame, s: string, x: number, y: number, align: CanvasTextAlign = "left", c: Colour = f.pal.ink3, alpha = 1): void {
  setFont(f, 9.5, 600, 0.5);
  f.ctx.textAlign = align;
  f.ctx.fillStyle = rgba(c, alpha);
  f.ctx.fillText(s.toUpperCase(), x, y);
}

/** a dot that travels along a straight line and fades at both ends: something passing from one place to another */
export function runner(f: FigureFrame, x1: number, y1: number, x2: number, y2: number, phase: number, c: Colour, r = 2.2): void {
  const u = (((f.still ? 0.5 : phase) % 1) + 1) % 1;
  f.ctx.fillStyle = rgba(c, Math.sin(u * Math.PI));
  disc(f.ctx, lerp(x1, x2, u), lerp(y1, y2, u), r);
}

/** a wandering value between -1 and 1 that never repeats quickly: the stand-in for a price */
export function wander(t: number, phase = 0): number {
  return (Math.sin(t * 0.9 + phase) + 0.55 * Math.sin(t * 2.3 + phase * 1.7) + 0.3 * Math.sin(t * 4.1 + phase * 0.6)) / 1.85;
}

/** the faint drifting currents behind the whole scene: they lean towards the pointer */
function field(f: FigureFrame, v: Vary, tall: boolean): void {
  const { ctx, w, h, t, pal } = f;
  const long = tall ? h : w;
  const across = tall ? w : h;
  const n = 4;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const base = ((i + 0.5) / n) * across;
    const pull = f.hover * ((tall ? f.mx : f.my) - base) * 0.12;
    ctx.strokeStyle = rgba(i % 2 ? pal.accent : pal.ink3, 0.16 + 0.08 * f.hover);
    ctx.beginPath();
    for (let s = 0; s <= long; s += 14) {
      const a = base + pull + Math.sin(s * 0.011 + t * 0.22 * v.speed + i * 1.9 + v.phase) * across * 0.055 + Math.sin(s * 0.027 - t * 0.13 + i) * across * 0.02;
      if (tall) (s === 0 ? ctx.moveTo(a, s) : ctx.lineTo(a, s));
      else (s === 0 ? ctx.moveTo(s, a) : ctx.lineTo(s, a));
    }
    ctx.stroke();
  }
}

/**
 * Draws a story to the whole frame. `v` is what the scene's seed decided, so two
 * pages that tell the same story draw its field and its pulses differently.
 */
export function story(f: FigureFrame, s: Story, v: Vary): void {
  const { ctx, w, h, pal, t } = f;
  if (w < 150 || h < 150) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // the heading: the subject, a rule, and one sentence
  setFont(f, 13, 500);
  const lines = wrap(ctx, s.line, w - PAD * 2, h < 260 ? 2 : 4);
  const headH = 30 + lines.length * 18 + 20;
  const availTall = h - headH - PAD;
  // the chapters stand in a grid: one column in a narrow space, more as the space widens, and as many rows as fit
  const maxCols = clamp(Math.floor((w - PAD * 2) / MIN_WIDE), 1, s.parts.length);
  const maxRows = Math.max(1, Math.floor(availTall / MIN_TALL));
  const n = Math.min(s.parts.length, maxCols * maxRows);
  const rows = Math.min(maxRows, n);
  const cols = Math.ceil(n / rows);
  const tall = cols === 1;
  field(f, v, h >= w);

  setFont(f, 11, 700, 1.1);
  ctx.textAlign = "left";
  ctx.fillStyle = rgba(pal.gold, 0.95 * f.enter);
  ctx.fillText(s.caption.toUpperCase(), PAD, PAD + 9);
  ctx.strokeStyle = rgba(pal.line, 1);
  ctx.lineWidth = 1;
  seg(ctx, PAD, PAD + 18, PAD + (w - PAD * 2) * f.enter, PAD + 18);
  setFont(f, 13, 500);
  ctx.fillStyle = rgba(pal.ink2, f.enter);
  lines.forEach((l, i) => ctx.fillText(l, PAD, PAD + 37 + i * 18));

  const top = headH;
  const cellW = (w - PAD * 2) / cols;
  const cellH = availTall / rows;
  /** the corner of the `i`th chapter's cell, in reading order */
  const cell = (i: number): [number, number] => [PAD + cellW * (i % cols), top + cellH * Math.floor(i / cols)];
  /** where the spine passes: the node at the head of each chapter */
  const node = (i: number): [number, number] => {
    const [x, y] = cell(i);
    return [x + 5, y + 13];
  };

  // the spine and its pulse
  if (n > 1) {
    ctx.strokeStyle = rgba(pal.line, 1);
    ctx.lineWidth = 1.2;
    const reach = f.enter * (n - 1);
    for (let i = 0; i < n - 1 && i < reach; i++) {
      const [x0, y0] = node(i);
      const [x1, y1] = node(i + 1);
      const u = clamp(reach - i);
      seg(ctx, x0, y0, lerp(x0, x1, u), lerp(y0, y1, u));
    }
    if (!f.still) {
      // the pulse goes from chapter to chapter in turn
      const along = (((t * 0.13 * v.speed + v.a) % 1) + 1) % 1 * (n - 1);
      const i = Math.min(n - 2, Math.floor(along));
      const [x0, y0] = node(i);
      const [x1, y1] = node(i + 1);
      runner(f, x0, y0, x1, y1, along - i, pal.accent, 2.6);
    }
  }

  for (let i = 0; i < n; i++) {
    const part = s.parts[i];
    if (!part) break;
    const [x, y] = cell(i);
    const inside = f.mx >= x && f.mx < x + cellW && f.my >= y && f.my < y + cellH;
    const k = inside ? f.hover : 0;
    const p = smooth(clamp(f.enter * (1 + n * 0.35) - i * 0.35));
    const [nx, ny] = node(i);

    ctx.lineWidth = 1.4;
    ctx.fillStyle = rgba(mix(pal.surface, pal.accent, 0.25 + 0.75 * k), p);
    disc(ctx, nx, ny, 4.5 + k * 1.5);
    ctx.strokeStyle = rgba(k > 0.02 ? pal.accent : pal.ink3, p);
    ring(ctx, nx, ny, 4.5 + k * 1.5);

    const tx = nx + 14;
    const textW = cellW - 24 - (tall ? 0 : 10);
    setFont(f, 10.5, 700, 0.7);
    ctx.textAlign = "left";
    ctx.fillStyle = rgba(mix(pal.ink2, pal.ink, k), p);
    ctx.fillText(part.label.toUpperCase(), tx, ny + 4);
    let used = 26;
    if (part.note && cellH > 150) {
      setFont(f, 11.5, 400);
      const noteLines = wrap(ctx, part.note, textW, 2);
      ctx.fillStyle = rgba(pal.ink3, p);
      noteLines.forEach((l, j) => ctx.fillText(l, tx, ny + 21 + j * 15));
      used += noteLines.length * 15 + 4;
    }

    // the plate the chapter is drawn on: a hairline frame with a breath of the surface colour, and corner marks that light under the pointer
    const px = tall ? tx : x + 6;
    const pw = tall ? cellW - (tx - PAD) - 2 : cellW - 18;
    const room = cellH - used - 14;
    const ph = Math.min(room, MAX_DRAW, pw * 1.15);
    if (ph < 74 || pw < 110) continue;
    const py = y + used + (rows > 1 ? Math.min(room - ph, 6) : (room - ph) / 2);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = rgba(pal.surface, 0.42 + 0.2 * k);
    rr(ctx, px, py, pw, ph, 6);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, k), 0.32 + 0.4 * k);
    ctx.stroke();
    ctx.strokeStyle = rgba(pal.gold, 0.5 + 0.5 * k);
    ctx.lineWidth = 1.4;
    const c = 9;
    for (const [cx, cy, sx, sy] of [
      [px, py, 1, 1],
      [px + pw, py, -1, 1],
      [px, py + ph, 1, -1],
      [px + pw, py + ph, -1, -1],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * c, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + sy * c);
      ctx.stroke();
    }
    // nothing a chapter draws can leave its plate
    rr(ctx, px, py, pw, ph, 6);
    ctx.clip();
    try {
      part.draw(f, box(px + 12, py + 12, pw - 24, ph - 24), k, p);
    } finally {
      ctx.restore();
    }
  }
}

/** A full scene from a story: what a topic exports. The story may be built from the seed. */
export function scene(make: (v: Vary) => Story): Maker {
  return (seed) => {
    const v = vary(seed);
    const s = make(v);
    return (f) => story(f, s, v);
  };
}
