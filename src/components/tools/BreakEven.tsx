"use client";

import { useState } from "react";
import { accounts } from "@/data/accounts";
import { decimalsOf, fmt, fmtRate, lotsText, money, parse, signedMoney } from "./calc";
import { breakEven } from "./method";
import { useCalc } from "./store";
import { accountCurrency, AccountCurrencyField, DASH, Headline, Inputs, InstrumentFields, Live, NumField, Outcome, resolveSpec, Rows, Seg, SimulationNote, ToolLayout, useConversion, type Step, type ToolProps } from "./ui";

/**
 * Break-even after costs: how far the price must move in a position's favour
 * before spread, commission and swap are covered. The arithmetic is
 * `breakEven` in ./method.ts, which is the last line of the Cost Lab's
 * working made into a tool of its own.
 *
 * The rule it keeps: no GIO4X cost is prefilled. The spread starts at a
 * labelled placeholder and commission and swap at zero; all three are the
 * visitor's own figures from their own platform. What the account types
 * publish is read from src/data/accounts.ts and repeated beside the fields in
 * its own words, nothing added. Instrument, lots and account currency are the
 * toolkit's shared figures (`gx:calc`); the costs are not stored.
 */

/** What each account type publishes on its spread, commission and swap rows (src/data/accounts.ts). */
const PUBLISHED = accounts.map((a) => ({ key: a.key, name: a.name, spread: a.spreadFrom, commission: a.commission, swap: a.swap }));
const PUBLISHED_SPREADS = PUBLISHED.map((a) => `${a.name} from ${a.spread}`).join(", ");
const PUBLISHED_COMMISSIONS = PUBLISHED.map((a) => `${a.name}: ${a.commission.toLowerCase()}`).join("; ");

type Sides = "1" | "2";

export function BreakEven({ meta, rates }: ToolProps) {
  const [calc, set] = useCalc();
  const inst = resolveSpec(calc);
  const acct = accountCurrency(calc);
  const conv = useConversion(rates, inst.quote, acct, "quote");
  // a placeholder that makes the working visible: not a spread of GIO4X's or of anyone's
  const [spreadRaw, setSpread] = useState("1");
  const [commRaw, setComm] = useState("0");
  const [sides, setSides] = useState<Sides>("2");
  const [swapRaw, setSwap] = useState("0");
  const [nightsRaw, setNights] = useState("0");

  const lots = parse(calc.lots, { label: "Lots", gt: 0, max: 100000 });
  const spread = parse(spreadRaw, { label: "Spread", min: 0, max: 100000 });
  const comm = parse(commRaw, { label: "Commission", min: 0, max: 100000 });
  const swap = parse(swapRaw, { label: "Swap", min: -100000, max: 100000 });
  const nights = parse(nightsRaw, { label: "Nights", min: 0, max: 3650, integer: true });
  const nSides = sides === "2" ? 2 : 1;
  const unit = inst.unit === "pip" ? "pips" : "points";

  const ready = lots.ok && spread.ok && comm.ok && swap.ok && nights.ok && inst.ok && conv.rate !== null;
  const pipQuote = inst.pip.n * inst.contract.n;
  const pipAcct = conv.rate !== null ? pipQuote * conv.rate : NaN;
  const r = ready ? breakEven({ spread: spread.n, commission: comm.n, sides: nSides, swap: swap.n, nights: nights.n, lots: lots.n, pipValue: pipAcct, pipSize: inst.pip.n }) : null;
  const dp = decimalsOf(inst.pip.n);
  const covered = r !== null && r.pips <= 0;

  const steps: Step[] | null =
    r && conv.rate !== null
      ? [
          { what: `Value of one ${inst.unit} on one lot of ${inst.symbol}`, calc: `${fmt(inst.pip.n, 0, 6)} × ${fmt(inst.contract.n)} = ${money(pipQuote, inst.quote)}${conv.kind !== "same" ? ` × ${fmtRate(conv.rate)} = ${money(pipAcct, acct)}` : ""}` },
          { what: `Spread cost (spread × ${inst.unit} value × lots)`, calc: `${fmt(spread.n, 0, 2)} × ${fmt(pipAcct, 2, 4)} × ${fmt(lots.n, 0, 4)} = ${money(r.spreadCost, acct)}` },
          { what: `Commission (per lot × lots × ${nSides === 2 ? "two sides" : "charged once"})`, calc: `${fmt(comm.n, 2, 2)} × ${fmt(lots.n, 0, 4)} × ${nSides} = ${money(r.commissionCost, acct)}` },
          { what: "Swap (per lot per night × lots × nights)", calc: `${fmt(swap.n, 0, 4)} × ${fmt(lots.n, 0, 4)} × ${fmt(nights.n)} = ${money(r.swapCost, acct)}` },
          { what: "Cost to cover", calc: `${fmt(r.spreadCost, 2, 2)} + ${fmt(r.commissionCost, 2, 2)} + ${fmt(r.swapCost, 2, 2)} = ${money(r.total, acct)}` },
          { what: `The move that covers it (cost ÷ (${inst.unit} value × lots))`, calc: `${fmt(r.total, 2, 2)} ÷ (${fmt(pipAcct, 2, 4)} × ${fmt(lots.n, 0, 4)}) = ${fmt(r.pips, 0, 2)} ${unit}` },
          { what: "The same move as a difference in price", calc: `${fmt(r.pips, 0, 2)} × ${fmt(inst.pip.n, 0, 6)} = ${fmt(r.price, dp, dp + 2)}` },
        ]
      : null;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "No GIO4X cost is prefilled. The spread starts at a placeholder of 1 so that the working is visible, and commission and swap start at zero: type the figures your own platform shows for the instrument you mean.",
        "The published “spread from” figures are minimums, not typical spreads. Real spreads are wider and change by instrument and by the minute, so a break-even built from a minimum is nearer than the real one.",
        "Commission and swap are amounts of money per lot in the account currency. Here a positive swap is a charge and a negative swap a credit, as in the Cost Lab and the Swap tool.",
        "The distance does not depend on the size of the position: the lots cancel. Only the amount of money to cover grows with the size.",
        "The move is measured from the moment the position is opened. A buy opens at the ask and is valued at the bid, so the spread is the first part of the distance; for a sell it is the same in mirror image.",
        "Slippage is left out: an order filled at a worse price than requested starts further from break-even than this.",
      ]}
    >
      <Inputs legend="One position and its costs">
        <InstrumentFields calc={calc} set={set} inst={inst} />
        <NumField id="be-lots" label="Position size" unit="lots" value={calc.lots} onChange={(v) => set({ lots: v })} error={lots.error} step={0.01} min={0} />
        <AccountCurrencyField calc={calc} set={set} />
        <NumField id="be-spread" label="Spread" unit={unit} value={spreadRaw} onChange={setSpread} error={spread.error} step={0.1} min={0} hint={`A placeholder: type the spread you see. Published minimums: ${PUBLISHED_SPREADS}.`} className="sm:col-span-2" />
        <NumField id="be-commission" label="Commission per lot" unit={acct} value={commRaw} onChange={setComm} error={comm.error} step={0.5} min={0} hint={`Zero until you type yours. Published: ${PUBLISHED_COMMISSIONS}.`} className="sm:col-span-2" />
        <Seg
          label="Commission charged"
          value={sides}
          onChange={setSides}
          options={[
            { value: "1", label: "Once" },
            { value: "2", label: "Each side (×2)" },
          ]}
        />
        <NumField id="be-nights" label="Nights held" value={nightsRaw} onChange={setNights} error={nights.error} step={1} min={0} max={3650} hint="Zero for a trade closed the same day." />
        <NumField id="be-swap" label="Swap per lot, per night" unit={acct} value={swapRaw} onChange={setSwap} error={swap.error} step={0.1} hint="Not published here: take it from your platform. Negative = a credit." className="sm:col-span-2" />
        {conv.field}
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline
            label="The price must move"
            value={r ? fmt(Math.max(0, r.pips), 0, 2) : DASH}
            unit={unit}
            sub={r ? (covered ? "the swap credit you typed is at least as large as the other costs" : `in the position’s favour, before the trade has earned anything: ${fmt(r.price, dp, dp + 2)} in price`) : "Complete the inputs above."}
          />
          <Headline label="Cost to cover" value={r ? money(r.total, acct) : DASH} sub={r ? `on ${lotsText(lots.n)} of ${inst.symbol}, held ${fmt(nights.n)} ${nights.n === 1 ? "night" : "nights"}` : undefined} />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: `Spread, as a distance`, value: r ? `${fmt(spread.n, 0, 2)} ${unit} (${money(r.spreadCost, acct)})` : DASH },
              { label: "Commission, as a distance", value: r ? `${fmt(r.commissionPips, 0, 2)} ${unit} (${money(r.commissionCost, acct)})` : DASH },
              { label: "Swap, as a distance", value: r ? `${fmt(r.swapPips, 0, 2)} ${unit} (${r.swapCost < 0 ? `${signedMoney(r.swapCost, acct)}, a credit` : money(r.swapCost, acct)})` : DASH },
              { label: `Value of one ${inst.unit} on this position`, value: r ? money(pipAcct * lots.n, acct) : DASH },
            ]}
          />
        </Live>

        <h3 className="h4 mt-34">What GIO4X publishes about these costs</h3>
        <p className="mt-5 text-sm text-ink-3">The spread, commission and overnight swap lines of each account type, as published. A “spread from” figure is a minimum, and the swap rates themselves are not yet published, which is why this page asks for yours.</p>
        <Rows className="mt-13" rows={PUBLISHED.map((a) => ({ label: `${a.name} account`, value: `Spread from ${a.spread} · commission: ${a.commission.toLowerCase()} · swap: ${a.swap.toLowerCase()}` }))} />

        <SimulationNote>The costs are the ones you typed: this is not a quote of GIO4X’s spread, commission or swap.</SimulationNote>
        {conv.note && <div className="mt-8">{conv.note}</div>}
      </Outcome>
    </ToolLayout>
  );
}
