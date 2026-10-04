"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { TAU, lerp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import { StepControls, useStepper } from "./Stepper";

/**
 * Four centuries on one line, with the eleven episodes as stops.
 *
 * The upper line is to scale, from 1600 to today, which crowds the last eight
 * stops into its right-hand end; the lower line is those last forty years
 * enlarged. Only the years are drawn: no price, no level, nothing that could
 * be read as market data. The sentence under the canvas says where the
 * visitor is, and links to that episode's page.
 */
export type Stop = { slug: string; name: string; year: number; span: string; place: string; line: string };

const FROM = 1600;
const TO = 2030;
const NEAR_FROM = 1984;
const NEAR_TO = 2022;

export function CenturyLine({ stops }: { stops: readonly Stop[] }) {
  const n = stops.length;
  const { step, playing, prev, next, toggle } = useStepper(n, 3600);
  /** the year the travelling mark has reached */
  const at = useRef(FROM);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, dt, pal, still }) => {
        if (w < 100 || h < 60) return;
        const target = stops[step].year;
        if (still) at.current = target;
        else {
          at.current += (target - at.current) * (1 - Math.exp(-dt * 3.5));
          if (Math.abs(target - at.current) < 0.05) at.current = target;
        }
        const year = at.current;

        const pad = 18;
        const ya = Math.round(h * 0.34);
        const yb = Math.round(h * 0.74);
        const xa = (y: number) => lerp(pad, w - pad, (y - FROM) / (TO - FROM));
        const xb = (y: number) => lerp(pad, w - pad, (y - NEAR_FROM) / (NEAR_TO - NEAR_FROM));
        const beat = still ? 0.5 : (Math.sin(t * 3) + 1) / 2;

        const rule = (x0: number, y0: number, x1: number, y1: number, colour: string, width = 1) => {
          ctx.lineWidth = width;
          ctx.strokeStyle = colour;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        };

        // the two lines, and how the lower one opens out of the upper
        rule(pad, ya + 0.5, w - pad, ya + 0.5, rgba(pal.line, 1));
        rule(pad, yb + 0.5, w - pad, yb + 0.5, rgba(pal.line, 1));
        rule(xa(NEAR_FROM), ya + 5, pad, yb - 5, rgba(pal.line, 0.9));
        rule(xa(NEAR_TO), ya + 5, w - pad, yb - 5, rgba(pal.line, 0.9));
        rule(xa(NEAR_FROM), ya + 0.5, xa(NEAR_TO), ya + 0.5, rgba(pal.ink3, 1), 3);

        // how far the mark has travelled
        rule(pad, ya + 0.5, xa(year), ya + 0.5, rgba(pal.accent, 0.9), 1.5);
        if (year > NEAR_FROM) rule(pad, yb + 0.5, xb(Math.min(year, NEAR_TO)), yb + 0.5, rgba(pal.accent, 0.9), 1.5);

        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(pal.ink3, 1);
        for (const y of [1600, 1700, 1800, 1900]) {
          rule(xa(y) + 0.5, ya - 4, xa(y) + 0.5, ya + 4, rgba(pal.ink3, 0.8));
          ctx.textAlign = y === 1600 ? "left" : "center";
          ctx.fillText(String(y), xa(y), ya + 17);
        }
        ctx.textAlign = "center";
        for (const y of [1990, 2000, 2010, 2020]) {
          rule(xb(y) + 0.5, yb - 4, xb(y) + 0.5, yb + 4, rgba(pal.ink3, 0.8));
          ctx.fillText(String(y), xb(y), yb + 17);
        }
        ctx.textAlign = "left";
        ctx.fillText("FOUR CENTURIES, TO SCALE", pad, 13);
        if (h > 150) ctx.fillText("THE LAST FORTY YEARS, ENLARGED", pad, h - 11);

        const dot = (x: number, y: number, r: number, state: "past" | "on" | "ahead") => {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fillStyle = rgba(state === "on" ? pal.accent : state === "past" ? pal.ink3 : pal.surface, 1);
          ctx.fill();
          if (state === "ahead") {
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(pal.ink3, 0.8);
            ctx.stroke();
          }
          if (state === "on") {
            ctx.beginPath();
            ctx.arc(x, y, r + 4 + beat * 3, 0, TAU);
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(pal.accent, 0.55 - beat * 0.3);
            ctx.stroke();
          }
        };
        stops.forEach((s, i) => {
          const state = i === step ? "on" : i < step ? "past" : "ahead";
          const near = s.year >= NEAR_FROM;
          dot(xa(s.year), ya, near ? (state === "on" ? 3.5 : 2.5) : state === "on" ? 5 : 4, state);
          if (near) dot(xb(s.year), yb, state === "on" ? 5 : 4, state);
        });

        // the travelling mark
        ctx.beginPath();
        ctx.arc(xa(year), ya, 2.5, 0, TAU);
        ctx.fillStyle = rgba(pal.gold, 1);
        ctx.fill();

        // the stop's name, over its larger dot
        const s = stops[step];
        const near = s.year >= NEAR_FROM;
        const label = `${s.year} · ${s.name.toUpperCase()}`;
        const half = ctx.measureText(label).width / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(label, Math.min(w - pad - half, Math.max(pad + half, near ? xb(s.year) : xa(s.year))), (near ? yb : ya) - 17);
      },
    [stops, step],
  );

  const s = stops[step];
  return (
    <div>
      <Stage draw={draw} ratio={2.6} rev={step} />
      <p className="mt-13 min-h-[6rem] text-ink-2 sm:min-h-[3.5rem]" aria-live="polite">
        <span className="num font-medium text-ink">
          {s.span}, {s.place}.
        </span>{" "}
        {s.name}. {s.line}
      </p>
      <p className="mt-5">
        <Link href={`/history/${s.slug}`} className="go">
          Read the page: {s.name}
        </Link>
      </p>
      <StepControls step={step} count={n} playing={playing} prev={prev} next={next} toggle={toggle} noun="Stop" />
      <Note>The upper line is drawn to scale; the lower line is its last forty years, enlarged. Only dates are shown. The eleven episodes are a chosen list, so the crowding at the recent end says more about what is remembered and recorded than about how often markets fall.</Note>
    </div>
  );
}
