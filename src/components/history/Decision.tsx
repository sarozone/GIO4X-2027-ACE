"use client";

import { useMemo, useRef, useState } from "react";
import { TAU, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import type { Juncture, Moment } from "@/data/history";

/**
 * "What was knowable then?" One episode taken a moment at a time. At each
 * moment the visitor sees only what had been made public by then, is asked a
 * hypothetical question with three plain choices, and then sees what came
 * next and an even-handed note on each of the three.
 *
 * The rule this file keeps: nothing is scored. No choice is marked right, no
 * points are counted and nothing is stored. The curve is the episode's own
 * illustrative shape, drawn only as far as the moment reached; it is not
 * market data and is labelled so on the canvas and beneath it. The sentence
 * under the canvas carries the meaning; the canvas is decoration.
 */
export function Decision({ events, start, shape, seat, junctures }: { events: readonly Moment[]; start: number; shape: string; seat: string; junctures: readonly Juncture[] }) {
  const n = events.length;
  const count = junctures.length;
  /** which moment the visitor is at; `count` is the closing note */
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  /** how far the curve has been drawn, in events: -1 is the left edge */
  const drawn = useRef(-1);

  const done = at >= count;
  const j = done ? null : junctures[at];
  const after = j ? (j.next ?? { when: events[Math.min(n - 1, j.at + 1)].when, text: events[Math.min(n - 1, j.at + 1)].text, to: Math.min(n - 1, j.at + 1) }) : null;
  /** the last event the curve is allowed to show */
  const reached = !j || !after ? n - 1 : picked === null ? j.at : after.to;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, dt, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (still) drawn.current = reached;
        else {
          drawn.current += (reached - drawn.current) * (1 - Math.exp(-dt * 4));
          if (Math.abs(reached - drawn.current) < 0.003) drawn.current = reached;
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

        // the curve, only as far as the moment reached
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

        // what has not been shown yet: an empty stretch, marked as such
        const gap = w - pad - head[0];
        if (gap > 8) {
          ctx.setLineDash([2, 5]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = rgba(pal.ink3, 0.6);
          ctx.beginPath();
          ctx.moveTo(head[0] + 8, head[1]);
          ctx.lineTo(w - pad, head[1]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

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

        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        ctx.beginPath();
        ctx.moveTo(head[0], head[1]);
        ctx.lineTo(head[0], lineY);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < n; i++) {
          const x = xAt(i);
          ctx.beginPath();
          ctx.arc(x, lineY, i === reached ? 5 : 3.5, 0, TAU);
          if (i <= reached) {
            ctx.fillStyle = rgba(i === reached ? pal.accent : pal.ink3, 1);
            ctx.fill();
          } else {
            ctx.fillStyle = rgba(pal.surface, 1);
            ctx.fill();
            ctx.strokeStyle = rgba(pal.ink3, 0.8);
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
        if (gap > 96 && reached < n - 1) {
          ctx.textAlign = "center";
          ctx.fillText("NOT SHOWN YET", head[0] + 8 + (gap - 8) / 2, Math.max(top + 8, head[1] - 12));
        }
        const label = events[reached].when.toUpperCase();
        const half = ctx.measureText(label).width / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(label, Math.min(w - pad - half, Math.max(pad + half, xAt(reached))), lineY + 18);
      },
    [events, n, start, reached],
  );

  const choose = (i: number) => setPicked(i);
  const onward = () => {
    setAt((a) => a + 1);
    setPicked(null);
  };
  const again = () => {
    setAt(0);
    setPicked(null);
  };

  const says =
    !j || !after
      ? "The exercise is finished. The curve now runs to the end of the episode. No choice was scored."
      : picked === null
        ? `Moment ${at + 1} of ${count}: ${events[j.at].when}. The curve is drawn as far as this moment and nothing after it is shown.`
        : `You chose “${j.choices[picked].label}”. The curve now runs on to ${after.when}.`;

  return (
    <div>
      <Stage draw={draw} ratio={2.1} rev={reached} />
      <p className="mt-13 text-ink-2" aria-live="polite">
        {says}
      </p>
      <Note>Illustrative shape, not market data. The curve sketches {shape}: the same hand-made line as at the top of this page, on a scale of 0 to 100 with no axis values, here drawn only as far as the moment reached.</Note>

      {j && after ? (
        <div className="panel mt-21 p-21">
          <p className="label">
            Moment <span className="num">{at + 1}</span> of <span className="num">{count}</span> · <span className="num">{events[j.at].when}</span>
          </p>
          <h3 className="h4 mt-13">What had been made public by then</h3>
          <p className="mt-8">{j.known}</p>
          <p className="mt-13 font-medium text-ink">
            {seat} {j.ask}
          </p>
          <div className="no-print mt-13 flex flex-wrap gap-8" role="group" aria-label="Three choices">
            {j.choices.map((c, i) => (
              <button key={c.label} type="button" className={`btn min-h-[2.75rem] ${picked === i ? "btn-primary" : "btn-ghost"}`} aria-pressed={picked === i} onClick={() => choose(i)}>
                {c.label}
              </button>
            ))}
          </div>

          {picked !== null && (
            <div className="mt-21 border-t border-line pt-21">
              <h3 className="h4">What came next</h3>
              <p className="mt-8">
                <span className="num font-medium text-ink">{after.when}.</span> {after.text}
              </p>
              <h3 className="h4 mt-21">What each choice would have meant</h3>
              <dl className="mt-13 grid gap-13">
                {j.choices.map((c, i) => (
                  <div key={c.label} className={`border-l-2 pl-13 ${picked === i ? "border-accent" : "border-line"}`}>
                    <dt className="font-medium text-ink">
                      {c.label}
                      {picked === i && <span className="ml-8 text-sm font-normal text-ink-3">the one you chose</span>}
                    </dt>
                    <dd className="mt-5">{c.note}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-13 text-sm text-ink-3">None of the three is marked right. Each was a reasonable reading of what was public at that moment.</p>
              <div className="no-print mt-13">
                <button type="button" className="btn btn-primary min-h-[2.75rem]" onClick={onward}>
                  {at + 1 < count ? "The next moment" : "The closing note"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="panel mt-21 p-21">
          <p className="label">The closing note</p>
          <p className="mt-13">A decision is judged by what was knowable when it was made, not by what happened afterwards. At every moment above, each of the three choices was open to a careful person, and the same choice could have turned out otherwise: the notes say how.</p>
          <p className="mt-13">Nothing was scored and nothing was kept. Knowing how an episode ended makes its course look plainer than it was to anyone living through it.</p>
        </div>
      )}

      <div className="no-print mt-13 flex flex-wrap items-center gap-8">
        <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={again} disabled={at === 0 && picked === null}>
          Start again
        </button>
        <span className="num ml-auto text-sm text-ink-3">{done ? "Finished" : `Moment ${at + 1} of ${count}`}</span>
      </div>
    </div>
  );
}
