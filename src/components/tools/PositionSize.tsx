"use client";

import Link from "next/link";
import { useState } from "react";
import { fmt, fmtRate, money, parse, pct, type Parsed } from "./calc";
import { useCalc } from "./store";
import { accountCurrency, AccountCurrencyField, DASH, Figure, Headline, Inputs, InstrumentFields, Live, NumField, Outcome, RangeField, resolveSpec, Rows, Seg, SimulationNote, ToolLayout, useConversion, type Step, type ToolProps } from "./ui";
import { ShareBar } from "./viz";

/** Smallest trade size GIO4X publishes for every account type (src/data/accounts.ts: "0.01 lots"). */
const LOT_STEP = 0.01;

/**
 * The optional costs section. Every figure in it is typed by the visitor from
 * their own account's conditions: nothing is prefilled, nothing is stored, and
 * a field left blank counts as zero and is said to.
 */
const OWN = "From your own account’s conditions.";
const blankOrParse = (raw: string, b: Parameters<typeof parse>[1]): Parsed => (raw.trim() === "" ? { ok: true, n: 0 } : parse(raw, b));

export function PositionSize({ meta, rates }: ToolProps) {
  const [calc, set] = useCalc();
  const inst = resolveSpec(calc);
  const acct = accountCurrency(calc);
  const conv = useConversion(rates, inst.quote, acct);

  const balance = parse(calc.balance, { label: "Balance", gt: 0, max: 1e12 });
  const risk = parse(calc.riskPct, { label: "Risk", gt: 0, max: 100 });
  const stop = parse(calc.stopPips, { label: "Stop distance", gt: 0, max: 1e6 });
  const unit = inst.unit;

  let r: { amount: number; pipQuote: number; pipAcct: number; perLot: number; lots: number; units: number; stepped: number; steppedRisk: number } | null = null;
  if (balance.ok && risk.ok && stop.ok && inst.ok && conv.rate !== null) {
    const amount = (balance.n * risk.n) / 100;
    const pipQuote = inst.pip.n * inst.contract.n;
    const pipAcct = pipQuote * conv.rate;
    const perLot = stop.n * pipAcct;
    const lots = amount / perLot;
    const stepped = Math.floor(lots / LOT_STEP + 1e-9) * LOT_STEP;
    r = { amount, pipQuote, pipAcct, perLot, lots, units: lots * inst.contract.n, stepped, steppedRisk: stepped * perLot };
  }

  /* ---- optional: the same trade with the visitor's own costs ---------------- */
  const [spreadRaw, setSpreadRaw] = useState("");
  const [commRaw, setCommRaw] = useState("");
  const [sides, setSides] = useState<"1" | "2">("1");
  const [nightsRaw, setNightsRaw] = useState("");
  const [swapRaw, setSwapRaw] = useState("");

  // the same bounds as the Cost Lab's fields
  const spread = blankOrParse(spreadRaw, { label: "Spread", min: 0, max: 10000 });
  const comm = blankOrParse(commRaw, { label: "Commission", min: 0, max: 10000 });
  const nights = blankOrParse(nightsRaw, { label: "Nights", min: 0, max: 3650, integer: true });
  const swap = blankOrParse(swapRaw, { label: "Swap", min: -100000, max: 100000 });
  const nSides = sides === "2" ? 2 : 1;
  const anyCost = [spreadRaw, commRaw, nightsRaw, swapRaw].some((v) => v.trim() !== "");
  const blanks = [
    [spreadRaw, "spread"],
    [commRaw, "commission"],
    [nightsRaw, "nights held"],
    [swapRaw, "swap"],
  ].flatMap(([raw, name]) => (raw.trim() === "" ? [name] : []));

  let c: { spreadCost: number; commission: number; swapCost: number; total: number; share: number; lossWith: number; perLotCost: number; perLotAll: number; adjusted: number | null; adjStepped: number | null } | null = null;
  if (r && anyCost && spread.ok && comm.ok && nights.ok && swap.ok) {
    const pipAcct = r.pipAcct;
    /** The Cost Lab's expressions at any size. The commission is typed here in the account currency, so the Cost Lab's US-dollar conversion is not needed. */
    const costAt = (size: number) => {
      // CostLab.tsx line 53: spreadCost = spread.n * pipAcct * lots.n
      const spreadCost = spread.n * pipAcct * size;
      // CostLab.tsx line 54: commUsd = comm.n * lots.n * nSides
      const commission = comm.n * size * nSides;
      // CostLab.tsx line 56: swapCost = swap.n * lots.n * nights.n
      const swapCost = swap.n * size * nights.n;
      // CostLab.tsx line 57: total = spreadCost + commission + swapCost
      return { spreadCost, commission, swapCost, total: spreadCost + commission + swapCost };
    };
    const at = costAt(r.lots);
    const perLotCost = costAt(1).total;
    const perLotAll = r.perLot + perLotCost;
    // loss at the stop (lots × perLot = the amount at risk) plus the costs; solved for the size at which that sum is the amount at risk
    const adjusted = perLotAll > 0 ? r.amount / perLotAll : null;
    c = {
      ...at,
      share: (at.total / r.amount) * 100,
      lossWith: r.amount + at.total,
      perLotCost,
      perLotAll,
      adjusted,
      adjStepped: adjusted === null ? null : Math.floor(adjusted / LOT_STEP + 1e-9) * LOT_STEP,
    };
  }

  const costSteps: Step[] | null =
    r && c
      ? [
          { what: `Spread cost (spread × ${unit} value × lots)`, calc: `${fmt(spread.n, 0, 2)} × ${fmt(r.pipAcct, 2, 4)} × ${fmt(r.lots, 2, 4)} = ${money(c.spreadCost, acct)}` },
          { what: `Commission (per lot × lots × ${nSides === 2 ? "two sides" : "charged once"})`, calc: `${fmt(comm.n, 2, 2)} × ${fmt(r.lots, 2, 4)} × ${nSides} = ${money(c.commission, acct)}` },
          { what: "Swap (per lot per night × lots × nights)", calc: `${fmt(swap.n, 0, 4)} × ${fmt(r.lots, 2, 4)} × ${fmt(nights.n)} = ${money(c.swapCost, acct)}` },
          { what: "Cost of the trade at this size", calc: `${fmt(c.spreadCost, 2, 2)} + ${fmt(c.commission, 2, 2)} + ${fmt(c.swapCost, 2, 2)} = ${money(c.total, acct)}` },
          { what: "Cost as a share of the amount at risk", calc: `${fmt(c.total, 2, 2)} ÷ ${fmt(r.amount, 2, 2)} = ${pct(c.share)}` },
          { what: "Loss if the stop is reached, costs included", calc: `${fmt(r.amount, 2, 2)} + ${fmt(c.total, 2, 2)} = ${money(c.lossWith, acct)}` },
          { what: "Loss and costs on one lot", calc: `${fmt(r.perLot, 2, 2)} + ${fmt(c.perLotCost, 2, 2)} = ${money(c.perLotAll, acct)}` },
          {
            what: `Size at which loss and costs together are ${money(r.amount, acct)}`,
            calc: c.adjusted !== null ? `${fmt(r.amount, 2, 2)} ÷ ${fmt(c.perLotAll, 2, 2)} = ${fmt(c.adjusted, 2, 4)} lots` : "No such size: the credit entered outweighs the loss on one lot.",
          },
        ]
      : null;

  /** What the Cost Lab can be handed: the size, through the shared store. The instrument and account currency are already shared. */
  const handOver = () => {
    if (!r) return;
    const size = Number(r.lots.toFixed(4));
    if (size > 0 && size <= 100000) set({ lots: String(size) });
  };

  const steps: Step[] | null = r && conv.rate !== null
    ? [
        { what: "Amount at risk", calc: `${fmt(balance.n, 2, 2)} × ${pct(risk.n)} = ${money(r.amount, acct)}` },
        { what: `Value of one ${unit} on one lot`, calc: `${fmt(inst.pip.n, 0, 6)} × ${fmt(inst.contract.n)} = ${money(r.pipQuote, inst.quote)}` },
        ...(conv.kind !== "same" ? [{ what: `Converted to ${acct} (${conv.label})`, calc: `${fmt(r.pipQuote, 2, 2)} × ${fmtRate(conv.rate)} = ${money(r.pipAcct, acct)}` }] : []),
        { what: "Loss on one lot if the stop is reached", calc: `${fmt(stop.n)} ${unit}s × ${fmt(r.pipAcct, 2, 4)} = ${money(r.perLot, acct)}` },
        { what: "Position size", calc: `${fmt(r.amount, 2, 2)} ÷ ${fmt(r.perLot, 2, 2)} = ${fmt(r.lots, 2, 4)} lots` },
        { what: "In units of the underlying", calc: `${fmt(r.lots, 2, 4)} × ${fmt(inst.contract.n)} = ${fmt(r.units, 0, 2)}` },
      ]
    : null;

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        "The stop is filled exactly at its level. In a fast or gapping market a stop can be filled beyond it, and the loss is then larger than the amount shown.",
        "Spread, commission and overnight financing are left out. The Cost Lab adds them up.",
        "“Include trading costs”, beneath the result, adds your own figures for them to this trade. It treats the stop distance as measured before the spread; if you measured it from the price you would actually be filled at, the spread is already inside the distance and belongs at zero there.",
        `Position sizes are shown exactly and rounded down to ${fmt(LOT_STEP, 2, 2)} lots, the smallest published trade size.`,
        "The starting figures are placeholders that make the arithmetic visible, not suggested values.",
      ]}
    >
      <Inputs>
        <NumField id="balance" label="Account balance" unit={acct} value={calc.balance} onChange={(v) => set({ balance: v })} error={balance.error} step={100} min={0} />
        <AccountCurrencyField calc={calc} set={set} />
        <RangeField id="risk" label="Risk on this trade" unit="%" value={calc.riskPct} onChange={(v) => set({ riskPct: v })} error={risk.error} min={0.1} max={100} sliderMax={10} step={0.1} hint="Share of the balance lost if the stop is reached." />
        <NumField id="stop" label={`Stop distance (${unit}s)`} unit={`${unit}s`} value={calc.stopPips} onChange={(v) => set({ stopPips: v })} error={stop.error} step={1} min={0} hint="From entry to stop loss." />
        <InstrumentFields calc={calc} set={set} inst={inst} />
        {conv.field}
      </Inputs>

      <Outcome>
        <Live className="grid gap-21 sm:grid-cols-2">
          <Headline label="Position size" value={r ? fmt(r.lots, 2, 2) : DASH} unit="lots" sub={r ? `${fmt(r.units, 0, 0)} units of ${inst.symbol}` : "Complete the inputs above."} />
          <Headline label="Amount at risk" value={r ? money(r.amount, acct) : DASH} tone="neg" sub={r ? `${pct(risk.n)} of the balance` : undefined} />
        </Live>
        <Figure
          caption={
            r
              ? `The dark segment is the part of the balance lost if the stop is reached: ${money(r.amount, acct)} of ${money(balance.n, acct)}. ${money(balance.n - r.amount, acct)} would remain.`
              : "The bar shows the amount at risk as a share of the balance."
          }
        >
          <ShareBar share={r ? risk.n / 100 : 0} tone="neg" startLabel="0" endLabel={balance.ok ? `Balance ${money(balance.n, acct)}` : "Balance"} />
        </Figure>
        <Live>
          <Rows
            className="mt-21"
            rows={[
              { label: `Value of one ${unit} at this size`, value: r ? money(r.pipAcct * r.lots, acct) : DASH },
              { label: `Rounded down to ${fmt(LOT_STEP, 2, 2)}-lot steps`, value: r ? `${fmt(r.stepped, 2, 2)} lots` : DASH },
              { label: "Amount at risk at the rounded size", value: r ? money(r.steppedRisk, acct) : DASH, tone: "neg" },
            ]}
          />
        </Live>

        <details className="mt-21 border-y border-line">
          <summary className="flex min-h-[2.75rem] cursor-pointer items-center text-sm font-semibold text-ink">Include trading costs</summary>
          <div className="pb-21">
            <p className="max-w-measure text-sm text-ink-2">
              Optional. Type the figures from your own account’s conditions: nothing here is prefilled, nothing is taken from GIO4X’s conditions and nothing is stored. A field left blank counts as zero.
            </p>
            <fieldset className="mt-13 min-w-0">
              <legend className="label">Your costs</legend>
              <div className="mt-13 grid gap-x-21 gap-y-13 sm:grid-cols-2">
                <NumField id="cost-spread" label={`Spread (${unit}s)`} unit={`${unit}s`} value={spreadRaw} onChange={setSpreadRaw} error={spread.error} step={0.1} min={0} hint={OWN} />
                <NumField id="cost-commission" label="Commission per lot" unit={acct} value={commRaw} onChange={setCommRaw} error={comm.error} step={0.5} min={0} hint={`${OWN} In ${acct}.`} />
                <Seg
                  label="Commission charged"
                  value={sides}
                  onChange={setSides}
                  options={[
                    { value: "1", label: "Once" },
                    { value: "2", label: "Each side (×2)" },
                  ]}
                />
                <NumField id="cost-nights" label="Nights held" value={nightsRaw} onChange={setNightsRaw} error={nights.error} step={1} min={0} max={3650} hint="Your own plan for the trade. Zero if it closes the same day." />
                <NumField id="cost-swap" label="Swap per lot, per night" unit={acct} value={swapRaw} onChange={setSwapRaw} error={swap.error} step={0.1} hint={`${OWN} Negative = a credit.`} />
              </div>
            </fieldset>

            <Live>
              <Rows
                className="mt-13"
                rows={[
                  { label: r ? `Cost of the trade at ${fmt(r.lots, 2, 2)} lots` : "Cost of the trade at the size above", value: c ? money(c.total, acct) : DASH },
                  { label: "Cost as a share of the amount at risk", value: c ? pct(c.share) : DASH },
                  { label: "Loss if the stop is reached, costs included", value: c ? money(c.lossWith, acct) : DASH, tone: "neg" },
                  {
                    label: r ? `Size that keeps loss and costs together at ${pct(risk.n)}` : "Size that keeps loss and costs together at the chosen risk",
                    value: c ? (c.adjusted !== null ? `${fmt(c.adjusted, 2, 2)} lots` : "none") : DASH,
                  },
                  { label: `That size, rounded down to ${fmt(LOT_STEP, 2, 2)}-lot steps`, value: c && c.adjStepped !== null ? `${fmt(c.adjStepped, 2, 2)} lots` : DASH },
                ]}
              />
              <p className="mt-8 min-h-[1.25rem] text-xs text-ink-3">
                {c
                  ? blanks.length > 0
                    ? `Left blank and counted as zero: ${blanks.join(", ")}.`
                    : "Every cost field holds a figure you entered."
                  : r
                    ? "Enter at least one cost above. The figures then appear here."
                    : "Complete the inputs at the top first."}
              </p>
            </Live>

            <h3 className="label mt-21">The working, with your costs</h3>
            {costSteps ? (
              <ol className="mt-8 border-t border-line">
                {costSteps.map((s, i) => (
                  <li key={s.what} className="grid grid-cols-[1.3125rem_minmax(0,1fr)] gap-x-8 border-b border-line py-13">
                    <span className="num pt-2 text-xs font-semibold text-prestige-ink">{i + 1}</span>
                    <span>
                      <span className="block text-xs text-ink-3">{s.what}</span>
                      <span className="num mt-2 block break-words text-[0.9375rem] text-ink">{s.calc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-8 border-y border-line py-13 text-sm text-ink-3">The working appears here once the tool has a result and at least one cost is entered.</p>
            )}

            <p className="mt-13 text-sm">
              <Link href="/tools/cost-lab" onClick={handOver} className="link inline-flex min-h-[2.75rem] items-center">
                Open these figures in the Cost Lab
              </Link>
            </p>
            <p className="text-xs text-ink-3">
              The position size, the instrument and the account currency carry over. The spread, commission, nights and swap are not shared between tools, so they are typed again there; the Cost Lab takes commission in US dollars.
              {!inst.fx && " The Cost Lab covers currency pairs only, so it opens on a currency pair rather than this instrument."}
            </p>
          </div>
        </details>

        <SimulationNote>It does not say what size to trade.</SimulationNote>
        {conv.note && <div className="mt-8">{conv.note}</div>}
      </Outcome>
    </ToolLayout>
  );
}
