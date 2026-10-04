"use client";

import { useState } from "react";
import { accounts } from "@/data/accounts";
import { fmt, lotsText, money, parse } from "./calc";
import { swapCost } from "./levels";
import { useCalc } from "./store";
import { accountCurrency, AccountCurrencyField, DASH, Headline, Inputs, Live, NumField, Outcome, Rows, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Swap: the overnight financing on a position, for a long and for a short,
 * over a number of nights. The arithmetic is `swapCost` in ./levels.ts, which
 * restates the Cost Lab's own expression (CostLab.tsx line 57) with the nights
 * counted as they are charged.
 *
 * The rule it keeps: GIO4X's swap rates are not yet published, so no rate is
 * prefilled, suggested or implied. Both rates are the visitor's own figures
 * from their own platform. What the account types publish about swap is read
 * from src/data/accounts.ts and repeated in its own words, nothing added.
 * The position size and account currency are the toolkit's shared figures
 * (`gx:calc`); the rates, the nights and the triple nights are not stored.
 */

/** What each account type publishes on its "Overnight swap" row (src/data/accounts.ts). */
const PUBLISHED = accounts.map((a) => ({ key: a.key, name: a.name, swap: a.swap }));

/** One side's result as words: a charge, a credit or nothing. */
const kind = (total: number) => (total > 0 ? "a charge" : total < 0 ? "a credit" : "nothing either way");

export function SwapCalculator({ meta }: ToolProps) {
  const [calc, set] = useCalc();
  const acct = accountCurrency(calc);
  // nothing prefilled: the rates come from the visitor's own platform
  const [longRaw, setLong] = useState("");
  const [shortRaw, setShort] = useState("");
  const [nightsRaw, setNights] = useState("1");
  const [tripleRaw, setTriple] = useState("0");

  const lots = parse(calc.lots, { label: "Lots", gt: 0, max: 100000 });
  const long = parse(longRaw, { label: "Swap, long", min: -100000, max: 100000 });
  const short = parse(shortRaw, { label: "Swap, short", min: -100000, max: 100000 });
  const nights = parse(nightsRaw, { label: "Nights", min: 0, max: 3650, integer: true });
  const triple = parse(tripleRaw, { label: "Triple-swap nights", min: 0, max: 3650, integer: true });
  const tripleError = triple.error ?? (nights.ok && triple.ok && triple.n > nights.n ? "There cannot be more triple-swap nights than nights held." : undefined);
  const base = lots.ok && nights.ok && triple.ok && !tripleError;

  const longR = base && long.ok ? swapCost(long.n, lots.n, nights.n, triple.n) : null;
  const shortR = base && short.ok ? swapCost(short.n, lots.n, nights.n, triple.n) : null;
  const charged = base ? nights.n + 2 * triple.n : null;

  const side = (name: string, rate: number, total: number): Step => ({
    what: `${name} (rate per lot per night × lots × nights charged)`,
    calc: `${fmt(rate, 0, 4)} × ${fmt(lots.n, 0, 4)} × ${fmt(charged ?? 0)} = ${money(total, acct)}: ${kind(total)}`,
  });
  const steps: Step[] | null =
    charged !== null && (longR || shortR)
      ? [
          { what: "Nights charged (each triple-swap night counts as three, so it adds two)", calc: `${fmt(nights.n)} + 2 × ${fmt(triple.n)} = ${fmt(charged)}` },
          ...(longR ? [side("Long position", long.n, longR.total)] : []),
          ...(shortR ? [side("Short position", short.n, shortR.total)] : []),
        ]
      : null;

  const value = (r: { total: number } | null) => (r ? money(Math.abs(r.total), acct) : DASH);
  const sub = (r: { total: number } | null, raw: string, name: string) =>
    r ? `${kind(r.total)} on ${lotsText(lots.n)} over ${fmt(nights.n)} ${nights.n === 1 ? "night" : "nights"}` : raw === "" ? `Type your platform’s swap for a ${name} position.` : "Complete the inputs above.";
  const tone = (r: { total: number } | null) => (r && r.total > 0 ? "neg" : r && r.total < 0 ? "pos" : undefined);
  const perNight = (ok: boolean, rate: number) => (ok && lots.ok ? `${money(rate * lots.n, acct)} (${kind(rate * lots.n)})` : DASH);

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "GIO4X’s swap rates are not yet published on this site, so nothing is prefilled. Both rates are figures you take from your own platform, for the instrument you mean.",
        "Here a positive number is a charge and a negative number a credit, as in the Cost Lab. Many platforms list swap the other way round, with a charge shown as a negative number: if yours does, reverse the sign as you type it.",
        "The rate is an amount of money per lot, per night, in the account currency. A platform that quotes swap in points needs that turned into money first: points × the value of one point on one lot.",
        "Swap rates change. The calculation applies one rate to every night, so over a long period it is an approximation of what would be applied.",
        "Which night carries the triple charge depends on the instrument and the broker, so this page asks how many such nights fall inside the period and does not name a day.",
      ]}
    >
      <Inputs legend="One position, held overnight">
        <NumField id="swap-lots" label="Position size" unit="lots" value={calc.lots} onChange={(v) => set({ lots: v })} error={lots.error} step={0.01} min={0} />
        <AccountCurrencyField calc={calc} set={set} />
        <NumField
          id="swap-long"
          label="Swap per lot, per night: long"
          unit={acct}
          value={longRaw}
          onChange={setLong}
          error={longRaw !== "" ? long.error : undefined}
          step={0.1}
          placeholder="From your platform"
          hint="Positive = a charge. Negative = a credit."
        />
        <NumField
          id="swap-short"
          label="Swap per lot, per night: short"
          unit={acct}
          value={shortRaw}
          onChange={setShort}
          error={shortRaw !== "" ? short.error : undefined}
          step={0.1}
          placeholder="From your platform"
          hint="Positive = a charge. Negative = a credit."
        />
        <NumField id="swap-nights" label="Nights held" value={nightsRaw} onChange={setNights} error={nights.error} step={1} min={0} max={3650} hint="Zero for a position closed the same day." />
        <NumField id="swap-triple" label="Triple-swap nights in the period" value={tripleRaw} onChange={setTriple} error={tripleError} step={1} min={0} max={3650} hint="0 if none falls inside it. Usually one in each full week." />
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline label="Long position" value={value(longR)} tone={tone(longR)} sub={sub(longR, longRaw, "long")} />
          <Headline label="Short position" value={value(shortR)} tone={tone(shortR)} sub={sub(shortR, shortRaw, "short")} />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: "Nights held", value: nights.ok ? fmt(nights.n) : DASH },
              { label: "Nights charged, counting each triple night as three", value: charged !== null ? fmt(charged) : DASH },
              { label: "Long, for one ordinary night", value: perNight(long.ok, long.n) },
              { label: "Short, for one ordinary night", value: perNight(short.ok, short.n) },
              { label: "Long, for one triple-swap night", value: perNight(long.ok, long.n * 3) },
              { label: "Short, for one triple-swap night", value: perNight(short.ok, short.n * 3) },
            ]}
          />
        </Live>

        <h3 className="h4 mt-34">What GIO4X publishes about swap</h3>
        <p className="mt-5 text-sm text-ink-3">The “Overnight swap” line of each account type, as published. The swap rates themselves are not yet published, which is why this page asks for yours.</p>
        <Rows className="mt-13" rows={PUBLISHED.map((a) => ({ label: `${a.name} account`, value: a.swap }))} />

        <SimulationNote>The rates are the ones you typed: this is not a quote of GIO4X’s swap, and a credit is not a return to rely on.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
