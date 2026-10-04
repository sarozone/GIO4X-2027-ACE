"use client";

import { useMemo, useRef } from "react";
import { TAU, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import type { Moment } from "@/data/history";
import { StepControls, useStepper } from "./Stepper";

/**
 * One episode, stepped through: a line of its dated events along the bottom,
 * and above it a curve of the rise and the fall that is drawn as far as the
 * event the visitor has reached.
 *
 * The curve is a hand-made shape on a scale of 0 to 100, one height for each
 * event, with no axis and no values. It is labelled on the canvas and beneath
 * it as an illustrative shape, not market data. The sentence under the canvas
 * carries the meaning; the canvas is decoration.
 */
export function EpisodeTimeline({ events, start, shape }: { events: readonly Moment[]; start: number; shape: string }) {
  const n = events.length;
  const { step, playing, prev, next, toggle } = useStepper(n, 5200);
  /** how far the curve has been drawn, in events: -1 is the left edge, 0 the first event */
  const drawn = useRef(-1);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, dt, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (still) drawn.current = step;
        else {
          drawn.current += (step - drawn.current) * (1 - Math.exp(-dt * 4));
          if (Math.abs(step - drawn.current) < 0.003) drawn.current = step;
        }
        const p = drawn.current;

        const pad = 16;
        const lineY = h - 30;
        const top = 30;
        const base = lineY - 24;
        const cell = (w - pad * 2) / n;
        const xAt = (u: number) => (u < 0 ? lerp(pad, pad + cell * 0.5, u + 1) : pad + cell * (u + 0.5));
        const levelAt = (u: number) => {
          if (u <= -1) return start;
          if (u < 0) return lerp(start, events[0].level, smooth(u + 1));
          if (u >= n - 1) return events[n - 1].level;
          const i = Math.floor(u);
          return lerp(events[i].level, events[i + 1].level, smooth(u - i));
        };
        const yAt = (level: number) => lerp(base, top, level / 100);

        // the floor the shape stands on: a line, with no scale
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.line, 1);
        ctx.beginPath();
        ctx.moveTo(pad, base + 0.5);
        ctx.lineTo(w - pad, base + 0.5);
        ctx.stroke();

        // the curve, as far as it has been drawn
        const pts: [number, number][] = [];
        for (let u = -1; u < p; u += 1 / 24) pts.push([xAt(u), yAt(levelAt(u))]);
        pts.push([xAt(p), yAt(levelAt(p))]);
        const head = pts[pts.length - 1];
        const fill = ctx.createLinearGradient(0, top, 0, base);
        fill.addColorStop(0, rgba(pal.accent, 0.22));
        fill.addColorStop(1, rgba(pal.accent, 0));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], base);
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(head[0], base);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.stroke();

        // the line of events
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.line, 1);
        ctx.beginPath();
        ctx.moveTo(pad, lineY + 0.5);
        ctx.lineTo(w - pad, lineY + 0.5);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.ink3, 1);
        ctx.beginPath();
        ctx.moveTo(pad, lineY + 0.5);
        ctx.lineTo(head[0], lineY + 0.5);
        ctx.stroke();

        // from the curve's head down to the line
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        ctx.beginPath();
        ctx.moveTo(head[0], head[1]);
        ctx.lineTo(head[0], lineY);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < n; i++) {
          const x = xAt(i);
          const on = i === step;
          ctx.beginPath();
          ctx.arc(x, lineY, on ? 5 : 3.5, 0, TAU);
          if (i <= step) {
            ctx.fillStyle = rgba(on ? pal.accent : pal.ink3, 1);
            ctx.fill();
          } else {
            ctx.fillStyle = rgba(pal.surface, 1);
            ctx.fill();
            ctx.strokeStyle = rgba(pal.ink3, 0.8);
            ctx.stroke();
          }
          if (on) {
            const beat = still ? 0.5 : (Math.sin(t * 3) + 1) / 2;
            ctx.beginPath();
            ctx.arc(x, lineY, 8 + beat * 3, 0, TAU);
            ctx.strokeStyle = rgba(pal.accent, 0.55 - beat * 0.3);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(head[0], head[1], 4, 0, TAU);
        ctx.fillStyle = rgba(pal.gold, 1);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = rgba(pal.surface, 1);
        ctx.stroke();

        // the few words the canvas carries
        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.textAlign = "left";
        ctx.fillText("ILLUSTRATIVE SHAPE, NOT MARKET DATA", pad, 14);
        const label = events[step].when.toUpperCase();
        const half = ctx.measureText(label).width / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(label, Math.min(w - pad - half, Math.max(pad + half, xAt(step))), lineY + 18);
      },
    [events, n, start, step],
  );

  const now = events[step];
  return (
    <div>
      <Stage draw={draw} ratio={2.1} rev={step} />
      <p className="mt-13 min-h-[7.5rem] text-ink-2 sm:min-h-[5.5rem]" aria-live="polite">
        <span className="num font-medium text-ink">{now.when}.</span> {now.text}
      </p>
      <StepControls step={step} count={n} playing={playing} prev={prev} next={next} toggle={toggle} noun="Event" />
      <Note>Illustrative shape, not market data. The curve sketches {shape}: a hand-made line on a scale of 0 to 100, with no axis values, drawn to show the order of the rise and the fall. The dots are evenly spaced; the gaps between the dates are not.</Note>
    </div>
  );
}
