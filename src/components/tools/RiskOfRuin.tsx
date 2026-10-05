"use client";

import { useState } from "react";
import { fmt, parse, pct } from "./calc";
import { riskOfRuin, type Ruin } from "./method";
import { useCalc } from "./store";
import { DASH, Headline, Inputs, Live, NumField, Outcome, RangeField, Rows, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Risk of ruin: the approximate chance that a method with a given win rate
 * and payoff, risking a fixed share of the balance on each trade, ever loses
 * a chosen share of the account. The arithmetic is `riskOfRuin` in
 * ./method.ts, where the approximation is written out.
 *
 * The rules it keeps: the figure is called an approximation wherever it is
 * shown, with what it assumes; the starting figures are placeholders and say
 * so; no risk size is called safe, sensible or optimal. The risk share is the
 * toolkit's shared figure (`gx:calc`); the rest is not stored.
 */

/** The same method at other risk sizes, in per cent of the balance. */
const TABLE = [0.5, 1, 2, 3, 5, 10];

/** A probability as words would give it: never "0%" for something that can happen, never "100%" for something that need not. */
function chance(p: number): string {
  if (p > 0 && p < 0.0001) return "less than 0.01%";
  if (p < 1 && p > 0.9999) return "more than 99.99%";
  return pct(p * 100, 2);
}

export function RiskOfRuin({ meta }: ToolProps) {
  const [calc, set] = useCalc();
  // placeholders that make the working visible: not a description of any method
  const [winRaw, setWin] = useState("50");
  const [payoffRaw, setPayoff] = useState("1.5");
  const [levelRaw, setLevel] = useState("50");

  const win = parse(winRaw, { label: "Win rate", gt: 0, max: 99.9 });
  const payoff = parse(payoffRaw, { label: "Payoff ratio", gt: 0, max: 100 });
  const risk = parse(calc.riskPct, { label: "Risk per trade", gt: 0, max: 50 });
  const level = parse(levelRaw, { label: "Share of the account", gt: 0, max: 99 });
  const ready = win.ok && payoff.ok && risk.ok && level.ok;

  const p = win.n / 100;
  const f = risk.n / 100;
  const d = level.n / 100;
  const r: Ruin | null = ready ? riskOfRuin(p, payoff.n, f, d) : null;

  const steps: Step[] | null = r
    ? [
        { what: "A win multiplies the balance by 1 + payoff × risk", calc: `1 + ${fmt(payoff.n, 0, 4)} × ${fmt(f, 0, 4)} = ${fmt(1 + payoff.n * f, 0, 6)};   ln = ${fmt(r.winLog, 0, 6)}` },
        { what: "A loss multiplies it by 1 − risk", calc: `1 − ${fmt(f, 0, 4)} = ${fmt(1 - f, 0, 6)};   ln = ${fmt(r.lossLog, 0, 6)}` },
        { what: "Drift: the average of the two logarithms, weighted by how often each happens", calc: `${fmt(p, 0, 4)} × ${fmt(r.winLog, 0, 6)} + ${fmt(1 - p, 0, 4)} × ${fmt(r.lossLog, 0, 6)} = ${fmt(r.drift, 0, 6)}` },
        { what: "Variance: win rate × loss rate × (the distance between the two logarithms)²", calc: `${fmt(p, 0, 4)} × ${fmt(1 - p, 0, 4)} × (${fmt(r.winLog - r.lossLog, 0, 6)})² = ${fmt(r.variance, 0, 8)}` },
        ...(r.exponent !== null
          ? [
              { what: "Exponent: 2 × drift ÷ variance", calc: `2 × ${fmt(r.drift, 0, 6)} ÷ ${fmt(r.variance, 0, 8)} = ${fmt(r.exponent, 0, 4)}` },
              { what: "Probability: (1 − share lost) to that power", calc: `(1 − ${fmt(d, 0, 4)})^${fmt(r.exponent, 0, 4)} = ${fmt(1 - d, 0, 4)}^${fmt(r.exponent, 0, 4)} = ${chance(r.probability)}` },
            ]
          : [{ what: "The drift is zero or negative", calc: "With no upward drift the balance reaches any lower level sooner or later: the approximation gives 100%." }]),
        { what: "Losses in a row, from the start, that reach the level", calc: `the smallest n with ${fmt(1 - f, 0, 4)}ⁿ ≤ ${fmt(1 - d, 0, 4)}:  n = ${fmt(r.lossesToLevel)};   chance of that run = ${fmt(1 - p, 0, 4)}^${fmt(r.lossesToLevel)} = ${chance(r.runProbability)}` },
      ]
    : null;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "This is an approximation, not a measurement. It treats the balance as moving smoothly when it really moves in steps, so the true figure for the same inputs differs a little, and more so when the risk per trade is large.",
        "Every trade risks the same share of the balance as it then stands (fixed-fraction sizing). Every loss is exactly that share and every win exactly the payoff ratio times it. Real results vary in size, and a stop can be filled beyond its level.",
        "The win rate and the payoff ratio never change, and each trade is independent of the one before. Real trades come in runs, and a method’s past win rate is not a property of its future.",
        "There is no limit on the number of trades: the figure is the chance of ever reaching the level, however long it takes. The loss is measured from the starting balance, not from a later peak.",
        "Costs are left out unless they are already inside the win rate and the payoff ratio you type.",
        "The starting figures are placeholders that make the working visible. They do not describe any method, and no setting here is recommended.",
      ]}
    >
      <Inputs legend="A method, described by three numbers">
        <RangeField id="ruin-win" label="Win rate" unit="%" value={winRaw} onChange={setWin} error={win.error} min={1} max={99} step={1} hint="The share of trades that gain. A placeholder until you type yours." />
        <NumField id="ruin-payoff" label="Payoff ratio" value={payoffRaw} onChange={setPayoff} error={payoff.error} step={0.1} min={0.1} max={100} hint="Average win ÷ average loss. A placeholder until you type yours." />
        <NumField id="ruin-risk" label="Risk per trade" unit="%" value={calc.riskPct} onChange={(v) => set({ riskPct: v })} error={risk.error} step={0.25} min={0.25} max={50} hint="The share of the balance lost when a trade loses. Shared with the other tools." />
        <RangeField id="ruin-level" label="Share of the account lost" unit="%" value={levelRaw} onChange={setLevel} error={level.error} min={1} max={99} step={1} hint="The loss you are asking about: 50 for half the account." />
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline
            label={level.ok ? `Chance of ever losing ${pct(level.n)} of the account` : "Chance of ever reaching the loss"}
            value={r ? chance(r.probability) : DASH}
            tone={r && r.certain ? "neg" : undefined}
            sub={r ? (r.certain ? "an approximation: this method has no upward drift, so the level is reached sooner or later" : "an approximation, under the assumptions listed beside this") : "Complete the inputs above."}
          />
          <Headline
            label="Losses in a row that get there"
            value={r ? fmt(r.lossesToLevel) : DASH}
            sub={r ? `from the start, at ${pct(risk.n)} a trade; the chance of that exact run is ${chance(r.runProbability)}` : undefined}
          />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: "Balance after one win", value: r ? `× ${fmt(1 + payoff.n * f, 0, 4)}` : DASH },
              { label: "Balance after one loss", value: r ? `× ${fmt(1 - f, 0, 4)}` : DASH },
              { label: "Average change in the logarithm of the balance, per trade", value: r ? fmt(r.drift, 0, 6) : DASH, tone: r ? (r.drift > 0 ? "pos" : "neg") : undefined },
              { label: "Break-even win rate for this payoff ratio, at very small risk", value: payoff.ok ? pct(100 / (1 + payoff.n)) : DASH },
            ]}
          />
        </Live>

        <div className="scroll-x mt-21">
          <table className="table-gx">
            <caption className="label pb-8 text-left">The same win rate, payoff ratio and loss at other risk sizes</caption>
            <thead>
              <tr>
                <th scope="col">Risk per trade</th>
                <th scope="col">Losses in a row</th>
                <th scope="col" className="!pr-0 !text-right">
                  Chance, approximately
                </th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {TABLE.map((t) => {
                const row = win.ok && payoff.ok && level.ok ? riskOfRuin(p, payoff.n, t / 100, d) : null;
                return (
                  <tr key={t}>
                    <th scope="row" className="num !border-line !text-sm !font-normal !normal-case !tracking-normal !text-ink">
                      {pct(t)}
                    </th>
                    <td className="num">{row ? fmt(row.lossesToLevel) : DASH}</td>
                    <td className="num !pr-0 text-right font-medium">{row ? chance(row.probability) : DASH}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-xs text-ink-3">The table is the same formula at six risk sizes. It ranks nothing: a smaller chance of a large loss is not a statement about any real method, whose win rate and payoff are not constants.</p>

        <SimulationNote>An approximation of a model, not a forecast of an account: real trades are not independent and their results are not of fixed size.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
