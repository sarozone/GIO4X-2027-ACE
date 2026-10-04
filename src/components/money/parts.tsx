"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { FigureDraw } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import { TONE_CSS, chartRev, drawChart, newMemo, type ChartSpec, type Tone } from "./chart";

/**
 * The parts every money calculator is made of: a number field with its slider,
 * the symbol picker, and the frame that lays a calculator out (chart, sentence,
 * results, controls, formula and working, table).
 *
 * The rule they keep: nothing is assumed for the visitor. No currency symbol
 * unless one is chosen, no rate that is not typed or slid by them, and nothing
 * leaves the page or is stored.
 */

export const fmt = (n: number, dp = 2) => (Math.abs(n) < 0.5 / Math.pow(10, dp) ? 0 : n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** a formatter for amounts, with the visitor's symbol in front (or none) */
export const cash =
  (sym: string) =>
  (n: number, dp = 2) =>
    `${n < -0.5 / Math.pow(10, dp) ? "−" : ""}${sym}${/[A-Za-z.]$/.test(sym) ? " " : ""}${fmt(Math.abs(n), dp)}`;

/** a percentage without needless zeros: 5, 4.5, 0.25 */
export const pc = (n: number, dp = 2) => `${Number(n.toFixed(dp))}%`;

/** a rate per period as a decimal, for a working line */
export const dec = (n: number) => (n === 0 ? "0" : n.toFixed(6));

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const SYMBOLS = ["$", "£", "€", "¥", "₹", "₩", "₺", "₦", "₱", "R", "kr", "CHF", "zł"] as const;

/** Which symbol to print before an amount. None by default: the arithmetic is the same in every currency. */
export function SymbolField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>Currency symbol</label>
      <select id={id} className="select min-h-[2.75rem]" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None: plain numbers</option>
        {SYMBOLS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * A number that can be typed or slid. The box accepts anything between min and
 * max; the slider covers the everyday part of that range. While a figure is
 * being typed the box keeps the visitor's own characters, and the calculator
 * uses the nearest allowed value.
 */
export function NumField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  sliderMin = min,
  sliderMax = max,
  sliderStep = step,
  unit,
  hint,
  whole,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  /** printed after the box: "%", "years" */
  unit?: string;
  hint?: string;
  /** whole numbers only */
  whole?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const tidy = (v: number) => {
    const c = Math.min(max, Math.max(min, v));
    return whole ? Math.round(c) : c;
  };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="flex items-center gap-8">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="input num min-h-[2.75rem] w-full min-w-0"
          min={min}
          max={max}
          step={step}
          value={draft ?? String(value)}
          aria-describedby={hint ? `${id}-h` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = Number(e.target.value);
            if (e.target.value.trim() !== "" && Number.isFinite(v)) onChange(tidy(v));
          }}
          onBlur={() => setDraft(null)}
        />
        {unit && <span className="shrink-0 text-sm text-ink-3">{unit}</span>}
      </div>
      <input
        type="range"
        aria-label={`${label}, slider`}
        className="h-[2.75rem] w-full accent-[var(--accent)]"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={Math.min(sliderMax, Math.max(sliderMin, value))}
        aria-valuetext={`${value}${unit ? ` ${unit}` : ""}`}
        onChange={(e) => {
          setDraft(null);
          onChange(tidy(Number(e.target.value)));
        }}
      />
      {hint && (
        <p id={`${id}-h`} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

/** A choice between a few named options. */
export function PickField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: readonly { value: T; label: string }[] }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select min-h-[2.75rem]" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export type TableSpec = { summary: string; heads: readonly string[]; rows: readonly (readonly string[])[]; minWidth?: string };

/** The words said on every calculator: whose number the rate is, and what it is not. */
export const ASSUMED = "Every rate here is a figure you chose. It is an assumption, not a forecast: real returns vary from year to year and can be negative.";

export function Frame({
  spec,
  ratio = 1.6,
  sentence,
  results,
  legend,
  controls,
  formula,
  working,
  table,
  note,
}: {
  spec: ChartSpec;
  ratio?: number;
  /** what the chart shows, in words */
  sentence: string;
  results: readonly (readonly [string, string])[];
  legend: readonly { tone: Tone; label: string; line?: boolean }[];
  controls: ReactNode;
  /** the formula, as the page states it */
  formula: readonly string[];
  /** the same formula with the visitor's figures in it */
  working: readonly string[];
  table?: TableSpec;
  note?: string;
}) {
  const memo = useRef(newMemo());
  const draw = useMemo<FigureDraw>(() => (f) => drawChart(f, spec, memo.current), [spec]);
  const rev = useMemo(() => chartRev(spec), [spec]);

  return (
    <div>
      <div className="grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Stage draw={draw} ratio={ratio} rev={rev} />
          <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-5 text-xs text-ink-3">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-5">
                <span aria-hidden className={l.line ? "h-[2px] w-[0.8125rem]" : "h-[0.5rem] w-[0.5rem] rounded-[1px]"} style={{ background: TONE_CSS[l.tone] }} />
                {l.label}
              </li>
            ))}
            <li>Worked out from your figures. An illustration, not market data.</li>
          </ul>
          <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
            {sentence}
          </p>
          <dl className="mt-13 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
            {results.map(([k, v]) => (
              <div key={k} className="min-w-0 bg-surface p-13">
                <dt className="label">{k}</dt>
                <dd className="num mt-3 break-words text-lg text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel grid gap-13 p-21">
          {controls}
          <p className="border-t border-line pt-13 text-xs text-ink-3">{ASSUMED} Nothing you type is sent or stored.</p>
        </div>
      </div>

      <div className="mt-34 grid gap-21 border-t border-line pt-21 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="eyebrow">The formula</p>
          <div className="num mt-8 grid gap-5 text-ink">
            {formula.map((x) => (
              <p key={x} className="break-words">
                {x}
              </p>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="eyebrow">The working, with your figures</p>
          <div className="num mt-8 grid gap-5 text-ink-2">
            {working.map((x) => (
              <p key={x} className="break-words">
                {x}
              </p>
            ))}
          </div>
        </div>
      </div>
      {note && <Note>{note}</Note>}

      {table && (
        <details className="mt-21">
          <summary className="link cursor-pointer py-13 text-sm">{table.summary}</summary>
          <div className="mt-13 overflow-x-auto">
            <table className={`table-gx w-full text-sm ${table.minWidth ?? "min-w-[30rem]"}`}>
              <thead>
                <tr>
                  {table.heads.map((hd, i) => (
                    <th key={hd} scope="col" className={i ? "num !text-right" : undefined}>
                      {hd}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((c, i) => (
                      <td key={i} className={i ? "num num-right" : undefined}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
