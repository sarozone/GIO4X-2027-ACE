"use client";

import { useState } from "react";
import { accounts } from "@/data/accounts";
import { CUSTOM_ID, fmt, money, parse, SPECS } from "./calc";
import { lotConvert, LOTS_PER_STANDARD, notionalValue, type LotUnit } from "./method";
import { useCalc } from "./store";
import { CurrencyOptions, DASH, Headline, Inputs, Live, NumField, Outcome, resolveSpec, Rows, SelectField, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Lot size converter: one size said as standard lots, mini lots, micro lots
 * and units, and its notional value at a price the visitor types. The
 * arithmetic is `lotConvert` and `notionalValue` in ./method.ts.
 *
 * The rules it keeps: a contract size is never typed here. For a listed
 * instrument it is the one parsed from the published contract description
 * (SPECS in ./calc.ts, from src/data/instruments.ts); for anything else the
 * visitor types their platform's own. No price is supplied or fetched: the
 * notional value appears only when the visitor types a price. The published
 * minimum trade size is read from src/data/accounts.ts. The instrument and
 * the custom contract are the toolkit's shared figures (`gx:calc`).
 */

const UNITS: { value: LotUnit; label: string }[] = [
  { value: "standard", label: "Standard lots" },
  { value: "mini", label: "Mini lots" },
  { value: "micro", label: "Micro lots" },
  { value: "units", label: "Units" },
];
const isUnit = (v: string): v is LotUnit => UNITS.some((u) => u.value === v);
const GROUPS = ["Currency pairs", "Metals", "Share CFDs"] as const;

/** The minimum trade size each account type publishes, when they all publish the same one (src/data/accounts.ts). */
const MIN_TRADES = [...new Set(accounts.map((a) => a.minTrade))];
const MIN_TRADE = MIN_TRADES.length === 1 ? { text: MIN_TRADES[0], lots: parseFloat(MIN_TRADES[0]) } : null;

export function LotConverter({ meta }: ToolProps) {
  const [calc, set] = useCalc();
  const inst = resolveSpec(calc);
  const [amountRaw, setAmount] = useState("1");
  const [unit, setUnit] = useState<LotUnit>("standard");
  // nothing prefilled: a price comes from the visitor's own platform
  const [priceRaw, setPrice] = useState("");

  const amount = parse(amountRaw, { label: "Size", gt: 0, max: 1e12 });
  const price = parse(priceRaw, { label: "Price", gt: 0, max: 1e9 });
  const contract = inst.contract;
  const ready = amount.ok && contract.ok;
  const r = ready ? lotConvert(amount.n, unit, contract.n) : null;
  const notional = r && price.ok ? notionalValue(r.units, price.n) : null;
  const what = inst.fx && inst.base ? inst.base : "units";
  const unitLabel = UNITS.find((u) => u.value === unit)?.label.toLowerCase() ?? "";

  const steps: Step[] | null = r
    ? [
        ...(unit === "units"
          ? [{ what: "Standard lots (units ÷ contract size)", calc: `${fmt(amount.n, 0, 4)} ÷ ${fmt(contract.n, 0, 4)} = ${fmt(r.standard, 0, 6)}` }]
          : [
              ...(unit !== "standard" ? [{ what: `Standard lots (${unitLabel} ÷ ${LOTS_PER_STANDARD[unit]})`, calc: `${fmt(amount.n, 0, 4)} ÷ ${LOTS_PER_STANDARD[unit]} = ${fmt(r.standard, 0, 6)}` }] : []),
              { what: "Units (standard lots × contract size)", calc: `${fmt(r.standard, 0, 6)} × ${fmt(contract.n, 0, 4)} = ${fmt(r.units, 0, 4)}` },
            ]),
        { what: "Mini lots (standard lots × 10)", calc: `${fmt(r.standard, 0, 6)} × 10 = ${fmt(r.mini, 0, 5)}` },
        { what: "Micro lots (standard lots × 100)", calc: `${fmt(r.standard, 0, 6)} × 100 = ${fmt(r.micro, 0, 4)}` },
        ...(notional !== null ? [{ what: "Notional value (units × price)", calc: `${fmt(r.units, 0, 4)} × ${fmt(price.n, 0, 6)} = ${money(notional, inst.quote)}` }] : []),
      ]
    : null;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "A mini lot is a tenth of a standard lot and a micro lot a hundredth. Those two ratios are the convention everywhere; what a standard lot holds is not.",
        "The contract size of a listed instrument is the one in its published contract description. For anything else, type the contract size your own platform’s specification gives: a lot of a metal, an index or a share is not 100,000 of anything.",
        "The notional value is the full value of the position at the price you type, in the currency the price is quoted in. It is not the margin, which is a fraction of it, and it is not the amount at risk.",
        "No price is supplied or fetched by this page. Without a price the conversion still works; only the notional value waits.",
        "Platforms round sizes to their own step, often 0.01 lots, and may refuse a size between steps.",
      ]}
    >
      <Inputs legend="One size, and the contract it is counted in">
        <SelectField id="lot-instrument" label="Instrument" value={inst.id} onChange={(v) => set({ instrument: v })} hint={inst.custom ? "Take the contract size from your platform’s specification." : inst.contractLabel} className="sm:col-span-2">
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {SPECS.filter((s) => s.group === g).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.symbol}
                  {s.fx ? "" : ` · ${s.name}`}
                </option>
              ))}
            </optgroup>
          ))}
          <optgroup label="Not listed">
            <option value={CUSTOM_ID}>Another instrument (enter the contract)</option>
          </optgroup>
        </SelectField>
        {inst.custom && (
          <>
            <NumField id="lot-contract" label="Contract size (units per standard lot)" value={calc.customContract} onChange={(v) => set({ customContract: v })} error={contract.error} hint="Units of the underlying in one standard lot." />
            <SelectField id="lot-quote" label="Quoted in" value={inst.quote} onChange={(v) => set({ customQuote: v })} hint="The currency the price is quoted in.">
              <CurrencyOptions />
            </SelectField>
          </>
        )}
        <NumField id="lot-amount" label="Size" value={amountRaw} onChange={setAmount} error={amount.error} step={unit === "units" ? 1000 : unit === "standard" ? 0.01 : 1} min={0} hint="A placeholder: type the size you mean." />
        <SelectField id="lot-unit" label="Counted in" value={unit} onChange={(v) => isUnit(v) && setUnit(v)} hint="The unit of the size you typed.">
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </SelectField>
        <NumField
          id="lot-price"
          label="Price (optional)"
          unit={inst.quote}
          value={priceRaw}
          onChange={setPrice}
          error={priceRaw !== "" ? price.error : undefined}
          placeholder="From your platform"
          hint="Only for the notional value. Nothing is prefilled."
          className="sm:col-span-2"
        />
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline label="Standard lots" value={r ? fmt(r.standard, 0, 6) : DASH} sub={r ? `of ${inst.custom ? "your instrument" : inst.symbol}` : "Complete the inputs above."} />
          <Headline label="Units" value={r ? fmt(r.units, 0, 4) : DASH} unit={r ? what : undefined} sub={r ? `at ${fmt(contract.n, 0, 4)} to the standard lot` : undefined} />
        </Live>

        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: "Mini lots (a tenth of a standard lot each)", value: r ? fmt(r.mini, 0, 5) : DASH },
              { label: "Micro lots (a hundredth of a standard lot each)", value: r ? fmt(r.micro, 0, 4) : DASH },
              { label: "Notional value at the price you typed", value: notional !== null ? money(notional, inst.quote) : r ? "type a price above" : DASH },
            ]}
          />
        </Live>

        <div className="scroll-x mt-21">
          <table className="table-gx">
            <caption className="label pb-8 text-left">The three lot sizes for this contract</caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">In standard lots</th>
                <th scope="col" className="!pr-0 !text-right">
                  Units
                </th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {(["standard", "mini", "micro"] as const).map((u) => (
                <tr key={u}>
                  <th scope="row" className="!border-line !text-sm !font-normal !normal-case !tracking-normal !text-ink">
                    1 {u} lot
                  </th>
                  <td className="num">{fmt(1 / LOTS_PER_STANDARD[u], 0, 2)}</td>
                  <td className="num !pr-0 text-right font-medium">{contract.ok ? `${fmt(lotConvert(1, u, contract.n).units, 0, 4)} ${what}` : DASH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {MIN_TRADE && (
          <p className="mt-8 text-xs text-ink-3">
            GIO4X publishes a minimum trade size of {MIN_TRADE.text} on each account type{contract.ok && Number.isFinite(MIN_TRADE.lots) ? `: ${fmt(lotConvert(MIN_TRADE.lots, "standard", contract.n).units, 0, 4)} ${what} of this contract.` : "."}
          </p>
        )}

        <SimulationNote>A conversion between units of size. The notional value uses the price you typed: it is not a quote.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
