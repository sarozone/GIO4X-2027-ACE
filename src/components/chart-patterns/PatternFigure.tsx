"use client";

import { useMemo, useRef, useState } from "react";
import { clamp, rgba, smooth, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import type { ChartPattern, Outline, Pt } from "@/data/chart-patterns";

/**
 * The picture on a chart pattern page. The entry's invented price line draws
 * itself from left to right; then the outline (neckline, trend lines, the
 * flagpole, the conventional measure) draws in; then the labels appear. It
 * plays once and holds. “Play again” starts it over and “Show the outline”
 * leaves only the price, which is how a chart arrives in real life: without
 * the lines. Under reduced motion the whole picture is drawn at once.
 *
 * The line is invented to show a shape. It is not a market, and the sentence
 * beneath the canvas says in words what the canvas shows.
 */

const PRICE = 3.4; // seconds the price takes to draw
const LINE = 0.8; // seconds one outline line takes
const GAP = 0.4; // between the starts of two lines
const TAG = 0.45;

type Props = { pattern: Pick<ChartPattern, "name" | "path" | "lines" | "tags" | "shape" | "outlined"> };

const tone = (kind: Outline["kind"], pal: Palette): Colour => (kind === "pole" || kind === "measure" ? pal.gold : pal.accent);

/** stroke the first `q` (0 to 1) of a run of points, by length */
function strokePart(ctx: CanvasRenderingContext2D, pts: readonly Pt[], q: number) {
  if (q <= 0 || pts.length < 2) return;
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let left = total * clamp(q);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const d = Math.hypot(bx - ax, by - ay);
    const k = d <= left ? 1 : left / d;
    ctx.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k);
    left -= d;
  }
  ctx.stroke();
}

export function PatternFigure({ pattern }: Props) {
  const [outline, setOutline] = useState(true);
  const [run, setRun] = useState(0);
  /** the figure's clock when this playing began; null until the first frame of it */
  const began = useRef<number | null>(null);
  /** the outline was switched on part-way: it draws in from that moment, not from the start */
  const late = useRef<number | null>(null);
  const switched = useRef(false);

  const draw = useMemo<FigureDraw>(() => {
    const { path, lines, tags } = pattern;
    const n = path.length;
    const ys = [...path, ...lines.flatMap((l) => l.pts.map((p) => p[1]))];
    const lo = Math.min(...ys) - 9;
    const hi = Math.max(...ys) + 9;
    return ({ ctx, w, h, t, pal, still }) => {
      if (w < 100 || h < 60) return;
      if (began.current === null) began.current = t;
      const u = still ? 1e6 : t - began.current;
      if (switched.current) {
        switched.current = false;
        late.current = u;
      }
      const small = w < 340;
      const x0 = 10;
      const x1 = w - 10;
      const top = 14;
      const bot = h - 12;
      const X = (x: number) => x0 + (x / 100) * (x1 - x0);
      const Y = (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top);
      const px = (p: Pt): Pt => [X(p[0]), Y(p[1])];

      // a quiet grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(pal.ink3, 0.16);
      for (let i = 0; i <= 4; i++) {
        const y = top + ((bot - top) * i) / 4;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }
      ctx.font = `600 ${small ? 9 : 10}px ${pal.font}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = rgba(pal.ink3, 0.9);
      ctx.fillText("INVENTED", x0 + 2, top + 3);

      // the price, as far as it has got
      const q = clamp(u / PRICE);
      const reach = q * (n - 1);
      const whole = Math.floor(reach);
      const line: Pt[] = [];
      for (let i = 0; i <= whole && i < n; i++) line.push([X((i * 100) / (n - 1)), Y(path[i])]);
      if (whole < n - 1) {
        const f = reach - whole;
        line.push([X(((whole + f) * 100) / (n - 1)), Y(path[whole] + (path[whole + 1] - path[whole]) * f)]);
      }
      const tip = line[line.length - 1];
      if (line.length > 1) {
        ctx.beginPath();
        ctx.moveTo(line[0][0], bot);
        line.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(tip[0], bot);
        ctx.closePath();
        ctx.fillStyle = rgba(pal.accent, 0.06);
        ctx.fill();
        ctx.beginPath();
        line.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = rgba(pal.ink, 0.92);
        ctx.stroke();
      }
      if (q < 1) {
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 3.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.fill();
      }
      if (!outline) return;

      // the outline, one line after another
      const from = Math.max(PRICE + 0.25, late.current ?? 0);
      lines.forEach((l, i) => {
        const k = smooth((u - from - i * GAP) / LINE);
        if (k <= 0) return;
        const c = tone(l.kind, pal);
        ctx.strokeStyle = rgba(c, l.kind === "curve" ? 0.75 : 0.95);
        ctx.lineWidth = l.kind === "pole" ? 3 : 1.7;
        ctx.setLineDash(l.kind === "measure" ? [4, 4] : l.kind === "curve" ? [2, 5] : []);
        strokePart(ctx, l.pts.map(px), k);
        ctx.setLineDash([]);
      });

      // the labels
      const after = from + Math.max(0, lines.length - 1) * GAP + LINE;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      tags.forEach((g, i) => {
        const a = smooth((u - after - i * 0.18) / TAG);
        if (a <= 0) return;
        const text = g.text.toUpperCase();
        const tw = ctx.measureText(text).width;
        const cx = clamp(X(g.at[0]), x0 + tw / 2 + 5, x1 - tw / 2 - 5);
        const off = (small ? 11 : 13) + (1 - a) * 5;
        const cy = clamp(Y(g.at[1]) + (g.side === "above" ? -off : off), top + 8, bot - 8);
        ctx.fillStyle = rgba(pal.surface, 0.86 * a);
        ctx.fillRect(cx - tw / 2 - 4, cy - 8, tw + 8, 16);
        ctx.fillStyle = rgba(pal.ink, a);
        ctx.fillText(text, cx, cy);
      });
    };
  }, [pattern, outline]);

  const again = () => {
    began.current = null;
    late.current = null;
    switched.current = false;
    setRun((r) => r + 1);
  };
  const toggle = (on: boolean) => {
    switched.current = on;
    if (!on) late.current = null;
    setOutline(on);
  };

  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={run * 2 + (outline ? 1 : 0)} />
      <div className="no-print mt-13 flex flex-wrap items-center gap-x-21 gap-y-8">
        <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem]" onClick={again}>
          Play again
        </button>
        <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-8 text-sm text-ink-2">
          <input type="checkbox" checked={outline} onChange={(e) => toggle(e.target.checked)} className="h-[1.125rem] w-[1.125rem] accent-[var(--accent)]" />
          Show the outline
        </label>
      </div>
      <p aria-live="polite" className="mt-8 max-w-measure text-sm text-ink-2">
        An invented price line: {pattern.shape}
        {outline ? `, outlined by ${pattern.outlined}.` : ", shown without its outline."}
      </p>
      <Note>An invented chart, drawn to show the shape of {/^[aeiou]/i.test(pattern.name) ? "an" : "a"} {pattern.name.toLowerCase()}. Not market data.</Note>
    </div>
  );
}
