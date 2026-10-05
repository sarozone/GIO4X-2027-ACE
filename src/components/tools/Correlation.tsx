"use client";

import { useState } from "react";
import { fmt } from "./calc";
import { changes, parseSeries, pearson, SERIES_MAX, SERIES_MIN, type Pearson } from "./method";
import { DASH, Figure, Headline, Inputs, Live, Outcome, Rows, Seg, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Correlation: Pearson's coefficient of two series the visitor pastes or
 * types, with the working. The arithmetic is `parseSeries`, `changes` and
 * `pearson` in ./method.ts.
 *
 * The rules it keeps: no market data is fetched or supplied. The two starting
 * series are invented numbers, labelled as such, and exist only so that the
 * working is visible. The coefficient is described as a measure of the
 * numbers typed, never as a forecast and never as a reason to trade. Nothing
 * typed here is stored or sent.
 */

/** How many lines of working the table shows; the sums always use every pair. */
const TABLE_ROWS = 60;

type Mode = "values" | "changes";

/** A word for the size of the coefficient, by a common convention that the page names as a convention. */
function strength(r: number): string {
  const a = Math.abs(r);
  if (a < 0.1) return "close to none";
  const size = a < 0.3 ? "weak" : a < 0.7 ? "moderate" : "strong";
  return `${size}, ${r > 0 ? "positive" : "negative"}`;
}

function AreaField({ id, label, value, onChange, error, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; hint: string }) {
  return (
    <div className="field content-start sm:col-span-2">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className="textarea num" rows={4} spellCheck={false} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={`${id}-note`} />
      <p id={`${id}-note`} className={`min-h-[1.25rem] ${error ? "field-error" : "field-hint"}`}>
        {error ?? hint}
      </p>
    </div>
  );
}

/** What is wrong with one series as typed, or nothing. */
function seriesError(name: string, raw: string, bad: string[], count: number): string | undefined {
  if (raw.trim() === "") return `${name} is needed.`;
  if (bad.length) return `${name}: “${bad[0].slice(0, 16)}” is not a plain number${bad.length > 1 ? ` (and ${bad.length - 1} more)` : ""}. Decimals take a point; a comma separates two values.`;
  if (count > SERIES_MAX) return `${name} holds ${fmt(count)} values; the most this page takes is ${fmt(SERIES_MAX)}.`;
  return undefined;
}

export function Correlation({ meta }: ToolProps) {
  // invented numbers that make the working visible: not prices, and not data about any market
  const [aRaw, setA] = useState("1 2 3 4 5 6");
  const [bRaw, setB] = useState("2 1 4 3 6 5");
  const [mode, setMode] = useState<Mode>("values");

  const a = parseSeries(aRaw);
  const b = parseSeries(bRaw);
  const aError = seriesError("Series A", aRaw, a.bad, a.values.length);
  const bError = seriesError("Series B", bRaw, b.bad, b.values.length);
  const need = mode === "changes" ? SERIES_MIN + 1 : SERIES_MIN;
  const pairError =
    aError || bError
      ? undefined
      : a.values.length !== b.values.length
        ? `The two series must be the same length: A holds ${fmt(a.values.length)} values and B holds ${fmt(b.values.length)}.`
        : a.values.length < need
          ? `At least ${need} values are needed in each series${mode === "changes" ? " to give three changes" : ""}.`
          : undefined;

  const ready = !aError && !bError && !pairError;
  const x = ready ? (mode === "changes" ? changes(a.values) : a.values) : [];
  const y = ready ? (mode === "changes" ? changes(b.values) : b.values) : [];
  const p: Pearson | null = ready ? pearson(x, y) : null;
  const r = p?.r ?? null;
  const flat = p !== null && r === null;
  const noun = mode === "changes" ? "changes" : "values";

  const steps: Step[] | null =
    p && r !== null
      ? [
          ...(mode === "changes" ? [{ what: "Each series turned into the change from one value to the next", calc: `${fmt(a.values.length)} values give ${fmt(p.n)} changes in each series` }] : []),
          { what: "Mean of A (sum ÷ count)", calc: `${fmt(p.meanX * p.n, 0, 6)} ÷ ${fmt(p.n)} = ${fmt(p.meanX, 0, 6)}` },
          { what: "Mean of B (sum ÷ count)", calc: `${fmt(p.meanY * p.n, 0, 6)} ÷ ${fmt(p.n)} = ${fmt(p.meanY, 0, 6)}` },
          { what: "Sum of the products of the two distances from the mean", calc: `Σ (a − ā)(b − b̄) = ${fmt(p.sxy, 0, 6)}` },
          { what: "Sum of the squared distances of A from its mean", calc: `Σ (a − ā)² = ${fmt(p.sxx, 0, 6)}` },
          { what: "Sum of the squared distances of B from its mean", calc: `Σ (b − b̄)² = ${fmt(p.syy, 0, 6)}` },
          { what: "Coefficient: the first sum ÷ the square root of the other two multiplied", calc: `${fmt(p.sxy, 0, 6)} ÷ √(${fmt(p.sxx, 0, 6)} × ${fmt(p.syy, 0, 6)}) = ${fmt(p.sxy, 0, 6)} ÷ ${fmt(Math.sqrt(p.sxx * p.syy), 0, 6)} = ${fmt(r, 2, 4)}` },
          { what: "Squared: the share of one series’ variation that a straight line on the other accounts for", calc: `${fmt(r, 2, 4)}² = ${fmt(r * r, 2, 4)}` },
        ]
      : null;

  // the scatter: each pair as a point, scaled to the box
  const xs = p ? p.rows.map((row) => row.x) : [];
  const ys = p ? p.rows.map((row) => row.y) : [];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const px = (v: number) => 6 + ((v - x0) / (x1 - x0 || 1)) * 88;
  const py = (v: number) => 94 - ((v - y0) / (y1 - y0 || 1)) * 88;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "The numbers are the ones you typed or pasted. This page fetches no market data and supplies none: the two starting series are invented, and are there only so that the working can be seen.",
        "The two series are paired in order: the first value of A with the first of B, and so on. If they are not for the same dates in the same order, the coefficient means nothing.",
        "Pearson’s coefficient measures how closely the pairs follow a straight line. Two series can be tightly related in another shape and still give a figure near zero.",
        "Two prices that both drift upwards over time correlate strongly whether or not they have anything to do with each other. That is why “the change from one value to the next” is offered: it is the usual way to compare how two markets move from day to day.",
        "A correlation describes the period typed and nothing else. It changes over time, often sharply in a crisis, and it does not say that one series moves the other.",
        "Words such as weak, moderate and strong are a common convention for the size of the figure (under 0.3, under 0.7, and above), not a rule.",
      ]}
    >
      <Inputs legend="Two series of the same length">
        <AreaField id="corr-a" label="Series A" value={aRaw} onChange={setA} error={aError} hint={`${fmt(a.values.length)} values. Invented numbers until you paste yours: separate them with spaces, new lines, commas or semicolons.`} />
        <AreaField id="corr-b" label="Series B" value={bRaw} onChange={setB} error={bError ?? pairError} hint={`${fmt(b.values.length)} values, paired in order with series A. Decimals take a point.`} />
        <Seg
          label="Compare"
          value={mode}
          onChange={setMode}
          options={[
            { value: "values", label: "The values as typed" },
            { value: "changes", label: "Each change to the next" },
          ]}
          className="sm:col-span-2 [&_p]:hidden"
        />
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline
            label="Correlation coefficient (r)"
            value={r !== null ? `${r > 0 ? "+" : ""}${fmt(r, 2, 4)}` : DASH}
            sub={r !== null ? `${strength(r)}, by the usual convention` : flat ? `One of the series never changes across these ${noun}, so there is nothing to divide by and no coefficient.` : "Complete the two series above."}
          />
          <Headline label="Pairs compared" value={p ? fmt(p.n) : DASH} sub={p ? (mode === "changes" ? `changes, from ${fmt(a.values.length)} values in each series` : "values in each series") : undefined} />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: `Mean of A’s ${noun}`, value: p ? fmt(p.meanX, 0, 6) : DASH },
              { label: `Mean of B’s ${noun}`, value: p ? fmt(p.meanY, 0, 6) : DASH },
              { label: "r squared", value: r !== null ? fmt(r * r, 2, 4) : DASH },
              { label: "Direction", value: r !== null ? (Math.abs(r) < 0.1 ? "no clear direction" : r > 0 ? "they tended to move the same way" : "they tended to move opposite ways") : DASH },
            ]}
          />
        </Live>

        {p && r !== null && (
          <Figure caption={`Each point is one pair: A’s ${noun === "changes" ? "change" : "value"} across, B’s up. The closer the points lie to one straight line, the nearer the coefficient is to +1 or −1. Here it is ${fmt(r, 2, 4)}.`}>
            <div aria-hidden className="relative aspect-[1.618/1] min-h-[13rem] w-full border-b border-l border-line-strong">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                {p.rows.map((row, i) => (
                  <line key={i} x1={px(row.x)} x2={px(row.x)} y1={py(row.y)} y2={py(row.y)} stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.72" />
                ))}
              </svg>
            </div>
            <div aria-hidden className="mt-5 flex justify-between text-xs text-ink-3">
              <span className="num">A: {fmt(x0, 0, 4)}</span>
              <span className="label">Series A across, series B up</span>
              <span className="num">{fmt(x1, 0, 4)}</span>
            </div>
          </Figure>
        )}

        {p && (
          <div className="scroll-x mt-21">
            <table className="table-gx min-w-[34rem]">
              <caption className="label pb-8 text-left">
                The working, pair by pair{p.n > TABLE_ROWS ? ` (the first ${TABLE_ROWS} of ${fmt(p.n)}; the sums use them all)` : ""}
              </caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" className="!text-right">
                    a
                  </th>
                  <th scope="col" className="!text-right">
                    b
                  </th>
                  <th scope="col" className="!text-right">
                    a − ā
                  </th>
                  <th scope="col" className="!text-right">
                    b − b̄
                  </th>
                  <th scope="col" className="!text-right">
                    product
                  </th>
                  <th scope="col" className="!text-right">
                    (a − ā)²
                  </th>
                  <th scope="col" className="!pr-0 !text-right">
                    (b − b̄)²
                  </th>
                </tr>
              </thead>
              <tbody>
                {p.rows.slice(0, TABLE_ROWS).map((row, i) => (
                  <tr key={i}>
                    <th scope="row" className="num !border-line !text-xs !font-normal !text-ink-3">
                      {i + 1}
                    </th>
                    <td className="num text-right">{fmt(row.x, 0, 4)}</td>
                    <td className="num text-right">{fmt(row.y, 0, 4)}</td>
                    <td className="num text-right">{fmt(row.dx, 0, 4)}</td>
                    <td className="num text-right">{fmt(row.dy, 0, 4)}</td>
                    <td className="num text-right">{fmt(row.dxdy, 0, 4)}</td>
                    <td className="num text-right">{fmt(row.dx2, 0, 4)}</td>
                    <td className="num !pr-0 text-right">{fmt(row.dy2, 0, 4)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={5} className="!border-line !text-left !text-sm !font-medium !normal-case !tracking-normal !text-ink">
                    Sums, over all {fmt(p.n)} pairs
                  </th>
                  <td className="num text-right font-medium">{fmt(p.sxy, 0, 4)}</td>
                  <td className="num text-right font-medium">{fmt(p.sxx, 0, 4)}</td>
                  <td className="num !pr-0 text-right font-medium">{fmt(p.syy, 0, 4)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <SimulationNote>A measure of the numbers you typed, for the period they cover. It is not a forecast, and a correlation is not a cause.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
