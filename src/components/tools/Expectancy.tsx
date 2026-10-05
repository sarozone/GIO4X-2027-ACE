"use client";

import { useState } from "react";
import { fmt, money, parse, pct, signedMoney } from "./calc";
import { expectancy } from "./method";
import { useCalc } from "./store";
import { accountCurrency, AccountCurrencyField, DASH, Headline, Inputs, Live, NumField, Outcome, RangeField, Rows, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Expectancy: what one trade of a method comes to on average, from its win
 * rate, its average win, its average loss and the cost of a trade. The
 * arithmetic is `expectancy` in ./method.ts.
 *
 * The rules it keeps: the four figures are the visitor's own and start as
 * labelled placeholders; no cost of GIO4X's is stated or prefilled (the cost
 * field starts at zero and takes what the visitor works out, for example on
 * the Cost Lab); a positive expectancy is described as arithmetic on the
 * figures typed, never as an edge or a return. Only the account currency is
 * the toolkit's shared figure (`gx:calc`).
 */
export function Expectancy({ meta }: ToolProps) {
  const [calc, set] = useCalc();
  const acct = accountCurrency(calc);
  // placeholders that make the working visible: not a description of any method
  const [winRaw, setWin] = useState("45");
  const [avgWinRaw, setAvgWin] = useState("200");
  const [avgLossRaw, setAvgLoss] = useState("100");
  const [costRaw, setCost] = useState("0");

  const win = parse(winRaw, { label: "Win rate", min: 0, max: 100 });
  const avgWin = parse(avgWinRaw, { label: "Average win", gt: 0, max: 1e12 });
  const avgLoss = parse(avgLossRaw, { label: "Average loss", gt: 0, max: 1e12 });
  const cost = parse(costRaw, { label: "Cost per trade", min: 0, max: 1e12 });
  const ready = win.ok && avgWin.ok && avgLoss.ok && cost.ok;

  const p = win.n / 100;
  const r = ready ? expectancy(p, avgWin.n, avgLoss.n, cost.n) : null;
  const reachable = r !== null && r.breakEvenWinRate <= 1;

  const steps: Step[] | null = r
    ? [
        { what: "What the wins contribute (win rate × average win)", calc: `${fmt(p, 0, 4)} × ${fmt(avgWin.n, 2, 2)} = ${money(p * avgWin.n, acct)}` },
        { what: "What the losses take (loss rate × average loss)", calc: `${fmt(1 - p, 0, 4)} × ${fmt(avgLoss.n, 2, 2)} = ${money((1 - p) * avgLoss.n, acct)}` },
        { what: "Expectancy per trade, less the cost of a trade", calc: `${fmt(p * avgWin.n, 2, 2)} − ${fmt((1 - p) * avgLoss.n, 2, 2)} − ${fmt(cost.n, 2, 2)} = ${signedMoney(r.net, acct)}` },
        { what: "Per unit risked (expectancy ÷ average loss)", calc: `${fmt(r.net, 2, 2)} ÷ ${fmt(avgLoss.n, 2, 2)} = ${fmt(r.perRisk, 2, 4)}` },
        { what: "Payoff ratio (average win ÷ average loss)", calc: `${fmt(avgWin.n, 2, 2)} ÷ ${fmt(avgLoss.n, 2, 2)} = ${fmt(r.payoff, 2, 4)}` },
        { what: "Break-even win rate: (average loss + cost) ÷ (average win + average loss)", calc: `(${fmt(avgLoss.n, 2, 2)} + ${fmt(cost.n, 2, 2)}) ÷ (${fmt(avgWin.n, 2, 2)} + ${fmt(avgLoss.n, 2, 2)}) = ${pct(r.breakEvenWinRate * 100)}` },
      ]
    : null;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "The four figures are yours: a win rate and two averages taken from trades that are over, for example from a journal. They describe those trades. They are not a property of the next one.",
        "The average loss is taken as the amount risked, so “per unit risked” is the expectancy divided by the average loss. If your losses are usually smaller or larger than the risk you planned, the two differ.",
        "Cost per trade is for averages counted before costs: the spread, commission and swap of one trade, which the Cost Lab adds up. If your averages already come from statements after costs, leave it at zero or the cost is counted twice. No GIO4X cost is prefilled.",
        "An average hides the spread of results. Two methods with the same expectancy can have very different runs of losses on the way.",
        "The starting figures are placeholders that make the working visible. They do not describe any method.",
      ]}
    >
      <Inputs legend="A set of finished trades, as four figures">
        <RangeField id="exp-win" label="Win rate" unit="%" value={winRaw} onChange={setWin} error={win.error} min={0} max={100} step={1} hint="The share of trades that gained. A placeholder until you type yours." />
        <AccountCurrencyField calc={calc} set={set} />
        <NumField id="exp-avg-win" label="Average win" unit={acct} value={avgWinRaw} onChange={setAvgWin} error={avgWin.error} step={10} min={0} hint="The mean of the gaining trades. A placeholder." />
        <NumField id="exp-avg-loss" label="Average loss" unit={acct} value={avgLossRaw} onChange={setAvgLoss} error={avgLoss.error} step={10} min={0} hint="The mean of the losing trades, as a positive amount. A placeholder." />
        <NumField id="exp-cost" label="Cost per trade (optional)" unit={acct} value={costRaw} onChange={setCost} error={cost.error} step={1} min={0} hint="Zero if your averages are already after costs." className="sm:col-span-2" />
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline
            label="Expectancy per trade"
            value={r ? signedMoney(r.net, acct) : DASH}
            tone={r ? (r.net > 0 ? "pos" : r.net < 0 ? "neg" : undefined) : undefined}
            sub={r ? (cost.n > 0 ? `after ${money(cost.n, acct)} of cost; ${signedMoney(r.gross, acct)} before it` : "the average of the trades these figures describe") : "Complete the inputs above."}
          />
          <Headline label="Per unit risked" value={r ? `${r.perRisk > 0 ? "+" : ""}${fmt(r.perRisk, 2, 4)}` : DASH} sub={r ? `for each 1 ${acct} of average loss` : undefined} tone={r ? (r.perRisk > 0 ? "pos" : r.perRisk < 0 ? "neg" : undefined) : undefined} />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: "Payoff ratio (average win ÷ average loss)", value: r ? fmt(r.payoff, 2, 4) : DASH },
              { label: "Break-even win rate before costs", value: r ? pct(r.breakEvenGross * 100) : DASH },
              { label: "Break-even win rate after costs", value: r ? (reachable ? pct(r.breakEvenWinRate * 100) : "none: the cost is larger than the average win") : DASH },
              { label: "Your win rate, against the break-even after costs", value: r && reachable ? `${pct(win.n)} against ${pct(r.breakEvenWinRate * 100)}` : DASH, tone: r && reachable ? (p > r.breakEvenWinRate ? "pos" : p < r.breakEvenWinRate ? "neg" : undefined) : undefined },
            ]}
          />
        </Live>

        <div aria-hidden className="mt-21">
          <div className="relative h-[21px] bg-sunken">
            {r && reachable && <span className="absolute inset-y-0 left-0 block bg-ink-3 transition-[width] duration-fast" style={{ width: `${r.breakEvenWinRate * 100}%`, opacity: 0.4 }} />}
            {win.ok && <span className="absolute -inset-y-5 block w-px bg-ink" style={{ left: `${Math.min(100, Math.max(0, win.n))}%` }} />}
          </div>
          <div className="num mt-5 flex justify-between text-xs text-ink-3">
            <span>0%</span>
            <span>win rate</span>
            <span>100%</span>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-3">The shaded part is the range of win rates at which these averages lose money after costs; the line is the win rate you typed.</p>

        <SimulationNote>An average of trades that are over, on the figures you typed. It is not an edge to rely on and says nothing certain about the next trade.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
