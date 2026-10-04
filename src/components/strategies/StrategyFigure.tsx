"use client";

import { useMemo, useRef, useState } from "react";
import { clamp, lerp, rgba, type Colour, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Stage } from "@/components/labs/kit";
import { inWords, pictureOf, type PictureKind } from "./picture";

/**
 * The picture on a strategy page: an invented price path that draws itself,
 * with the approach's entries and exits marked as the line reaches them.
 * "Play again" draws it once more; under reduced motion it is shown complete.
 *
 * The canvas is decoration. The one sentence beneath it says what it shows.
 * The path is invented and proves nothing about the approach.
 */
const SECONDS = 9;

export function StrategyFigure({ kind }: { kind: PictureKind }) {
  const pic = pictureOf(kind);
  const [run, setRun] = useState(0);
  const from = useRef(-1);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (from.current < 0) from.current = t;
        const p = still ? 1 : clamp((t - from.current) / SECONDS);
        const n = pic.pts.length;
        const head = p * (n - 1); // how far along the path the drawing has got
        const small = w < 340;
        const light = pal.ink[0] < 128;
        const green: Colour = light ? [8, 118, 60, 1] : pal.emerald;
        const padX = 10;
        const top = 24;
        const bottom = h - (pic.lines.length ? 26 : 12);
        const x = (i: number) => lerp(padX, w - padX, i / (n - 1));

        let lo = Infinity;
        let hi = -Infinity;
        const see = (v: number | null) => {
          if (v == null) return;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        };
        pic.pts.forEach(see);
        pic.levels.forEach((l) => see(l.at));
        pic.lines.forEach((l) => l.v.forEach(see));
        const y = (v: number) => lerp(bottom, top, (v - lo) / (hi - lo || 1));
        /** the price where the drawing has got to, between two points */
        const price = (i: number) => {
          const a = Math.floor(i);
          const b = Math.min(n - 1, a + 1);
          return lerp(pic.pts[a]!, pic.pts[b]!, i - a);
        };

        ctx.font = `600 ${small ? 9 : 10}px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText("INVENTED PRICES · NOT A MARKET", padX, 10);

        // the named levels, there from the start
        ctx.lineWidth = 1;
        for (const l of pic.levels) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = rgba(pal.ink3, l.label ? 0.8 : 0.4);
          ctx.beginPath();
          ctx.moveTo(padX, y(l.at));
          ctx.lineTo(w - padX, y(l.at));
          ctx.stroke();
          ctx.setLineDash([]);
          if (l.label && !small) {
            ctx.fillStyle = rgba(pal.ink3, 1);
            ctx.textAlign = "right";
            ctx.fillText(l.label.toUpperCase(), w - padX, y(l.at) - 8);
            ctx.textAlign = "left";
          }
        }

        // what the rule looks at: averages, a channel, the interest added up
        pic.lines.forEach((l, k) => {
          const colour = l.tone === "accent" ? pal.accent : pal.gold;
          ctx.strokeStyle = rgba(colour, 0.95);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          let started = false;
          for (let i = 0; i <= Math.floor(head); i++) {
            const v = l.v[i];
            if (v == null) continue;
            if (started) ctx.lineTo(x(i), y(v));
            else ctx.moveTo(x(i), y(v));
            started = true;
          }
          ctx.stroke();
          // its name, underneath
          const lx = padX + k * ((w - padX * 2) / 2);
          ctx.fillStyle = rgba(colour, 1);
          ctx.fillRect(lx, h - 11, 13, 2);
          ctx.fillStyle = rgba(pal.ink3, 1);
          ctx.fillText(l.label.toUpperCase(), lx + 18, h - 10);
        });

        // a moment on the path with a name: a release, an unwind, the end of the doubling
        for (const e of pic.events) {
          if (e.i > head) continue;
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = rgba(AMBER, 0.9);
          ctx.beginPath();
          ctx.moveTo(x(e.i), top);
          ctx.lineTo(x(e.i), bottom);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = rgba(AMBER, 1);
          const right = e.i > n * 0.6;
          ctx.textAlign = right ? "right" : "left";
          ctx.fillText(e.label.toUpperCase(), x(e.i) + (right ? -5 : 5), top + 6);
          ctx.textAlign = "left";
        }

        // the price
        ctx.strokeStyle = rgba(pal.ink, 0.92);
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x(0), y(pic.pts[0]!));
        for (let i = 1; i <= Math.floor(head); i++) ctx.lineTo(x(i), y(pic.pts[i]!));
        ctx.lineTo(x(head), y(price(head)));
        ctx.stroke();

        // each trade: a triangle where it opened, a line to where it closed, a dot there
        for (const tr of pic.trades) {
          if (tr.a > head) continue;
          const closed = tr.b <= head;
          const end = closed ? tr.b : head;
          const colour = !closed ? pal.ink2 : tr.open ? AMBER : tr.won ? green : ALERT;
          const ax = x(tr.a);
          const ay = y(pic.pts[tr.a]!);
          ctx.strokeStyle = rgba(colour, 0.9);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(x(end), y(price(end)));
          ctx.stroke();
          ctx.setLineDash([]);
          const d = tr.side === 1 ? -1 : 1;
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.beginPath();
          ctx.moveTo(ax, ay + d * 7);
          ctx.lineTo(ax - 4, ay - d);
          ctx.lineTo(ax + 4, ay - d);
          ctx.closePath();
          ctx.fill();
          if (tr.size && tr.size > 1) {
            ctx.fillStyle = rgba(pal.ink2, 1);
            ctx.textAlign = "center";
            ctx.fillText(`×${tr.size}`, ax, ay - d * 14);
            ctx.textAlign = "left";
          }
          if (closed) {
            const r = 2.6 + (tr.size ? Math.log2(tr.size) * 0.8 : 0);
            ctx.beginPath();
            ctx.arc(x(tr.b), y(pic.pts[tr.b]!), r, 0, Math.PI * 2);
            if (tr.open) {
              ctx.lineWidth = 1.5;
              ctx.strokeStyle = rgba(AMBER, 1);
              ctx.stroke();
            } else {
              ctx.fillStyle = rgba(colour, 1);
              ctx.fill();
            }
          }
        }
      },
    [pic],
  );

  const hasOpen = pic.trades.some((t) => t.open);
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={run} />
      <p className="mt-13 text-sm text-ink-2" aria-live="polite">
        {inWords(pic)}
      </p>
      <div className="no-print mt-13">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            from.current = -1;
            setRun((r) => r + 1);
          }}
        >
          Play again
        </button>
      </div>
      <Note>
        A triangle marks where a trade opens and points the way it was taken. A green dot is a trade closed ahead, a red dot one closed behind{hasOpen ? ", and an amber ring one still open at a loss" : ""}. The path was invented to show how the approach behaves, including where it goes wrong. It is not market data and it proves nothing.
      </Note>
    </div>
  );
}
