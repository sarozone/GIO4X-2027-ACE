"use client";

import type { ReactNode } from "react";
import { rgba, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";

/**
 * The parts every investing explainer shares: the bench it sits in (canvas,
 * the one sentence, the controls, the figures and their arithmetic), number
 * formatting, and the small-caps label a drawing may carry.
 *
 * The rule: the sentence says everything the canvas shows, and every figure
 * is arithmetic on an invented example, with its formula beside it.
 */

export const num = (v: number, d = 0) => v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
export const signed = (v: number, d = 0) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), d)}`;

/** a number that changes whenever any of a machine's controls does, for the still frame */
export const revOf = (...parts: (number | string | boolean)[]) => {
  let h = 0;
  for (const ch of parts.join("|")) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return h;
};

/** a small-caps label on a canvas */
export function cap(ctx: CanvasRenderingContext2D, pal: Palette, text: string, x: number, y: number, o: { align?: CanvasTextAlign; colour?: Colour; alpha?: number } = {}) {
  ctx.font = `600 10px ${pal.font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = o.align ?? "left";
  ctx.fillStyle = rgba(o.colour ?? pal.ink3, o.alpha ?? 1);
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

export function Bench({
  draw,
  ratio = 1.5,
  rev,
  sentence,
  rows,
  formula,
  note,
  children,
  after,
}: {
  draw: FigureDraw;
  ratio?: number;
  rev: number;
  /** what the canvas shows, in words */
  sentence: string;
  rows: readonly (readonly [string, string])[];
  /** the arithmetic behind the figures, a line each */
  formula: readonly string[];
  note: ReactNode;
  /** the controls */
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <div>
      <div className="grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Stage draw={draw} ratio={ratio} rev={rev} />
          <p className="mt-13 min-h-[6rem] text-ink-2" aria-live="polite">
            {sentence}
          </p>
        </div>
        <div className="panel min-w-0 p-21 [&>div:first-child]:mt-0">{children}</div>
      </div>
      <dl className="mt-21 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
        {rows.map(([k, v]) => (
          <div key={k} className="bg-surface p-13">
            <dt className="label">{k}</dt>
            <dd className="num mt-3 break-words text-lg text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-21">
        <p className="label">The arithmetic</p>
        <ul className="num mt-8 grid gap-5 text-sm text-ink-2">
          {formula.map((f) => (
            <li key={f} className="break-words">
              {f}
            </li>
          ))}
        </ul>
      </div>
      {after}
      <Note>{note}</Note>
    </div>
  );
}

/** a row of two or more choices; the chosen one is pressed */
export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div className="mt-13 grid gap-5">
      <p className="label">{label}</p>
      <div className="seg" role="group" aria-label={label}>
        {options.map(([k, name]) => (
          <button key={k} type="button" className="!h-[2.75rem] flex-1 justify-center" aria-pressed={value === k} onClick={() => onChange(k)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
