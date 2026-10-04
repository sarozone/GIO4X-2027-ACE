"use client";

import { useMemo, useState } from "react";
import type { ChartSpec } from "./chart";
import { amortisation, buyingPower, compound, doublingRatePct, doublingYears, drawdownPot, inflate, monthlyRate, paymentForTarget, retirementPlan, rule72, savingsPath, seriesFutureValue, taxedAtEnd, taxedEveryYear } from "./math";
import { Frame, NumField, PickField, SymbolField, cash, dec, fmt, pc, plural } from "./parts";

/**
 * THE SEVEN MONEY CALCULATORS.
 *
 * Each is arithmetic on the visitor's own figures (./math.ts), shown four
 * ways: a chart, one sentence that says what the chart shows, the formula with
 * the visitor's figures put into it, and a table of every row.
 *
 * The rule they keep: a growth, inflation or tax rate is whatever the visitor
 * enters. The figure a box opens with is an example to be replaced, not a
 * suggestion and not a forecast. No currency is assumed and no country's tax
 * rules are used. Nothing is sent or stored.
 */

type Props = { formula: readonly string[] };

const RATE_HINT = "Your assumption. Not a forecast.";

function RegularInvesting({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [start, setStart] = useState(0);
  const [pay, setPay] = useState(100);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(5);
  const [when, setWhen] = useState<"end" | "start">("end");
  const c = useMemo(() => cash(sym), [sym]);

  const atStart = when === "start";
  const path = useMemo(() => savingsPath(start, pay, rate, years, atStart), [start, pay, rate, years, atStart]);
  const last = path[path.length - 1]!;
  const growth = last.value - last.paid;
  const i = monthlyRate(rate);
  const n = years * 12;
  const series = seriesFutureValue(pay, i, n, atStart);

  const spec = useMemo<ChartSpec>(
    () => ({
      title: "VALUE AT THE END OF EACH YEAR",
      cols: path.map((p) => ({ a: p.paid, b: p.value - p.paid })),
      toneA: "gold",
      toneB: "accent",
      ends: ["YEAR 1", `YEAR ${path.length}`],
      read: (k) => `YEAR ${path[k]!.year} · ${c(path[k]!.value, 0)}`,
    }),
    [path, c],
  );

  const sentence = `${start > 0 ? `Starting with ${c(start)} and paying` : "Paying"} in ${c(pay)} a month for ${plural(years, "year")} at an assumed ${pc(rate)} a year comes to ${c(last.value)}: ${c(last.paid)} paid in ${
    growth >= 0 ? `and ${c(growth)} of growth` : `less a fall of ${c(-growth)}`
  }.`;

  const working = [
    `i = ${pc(rate)} ÷ 12 = ${dec(i)} a month; n = ${years} × 12 = ${n} payments`,
    i === 0 ? `FV = ${c(pay)} × ${n} = ${c(series)}` : `FV = ${c(pay)} × ((1 + ${dec(i)})^${n} − 1) ÷ ${dec(i)}${atStart ? ` × (1 + ${dec(i)})` : ""} = ${c(series)}`,
    ...(start > 0 ? [`Starting sum: ${c(start)} × (1 + ${dec(i)})^${n} = ${c(compound(start, i, n))}`, `Together: ${c(last.value)}`] : []),
  ];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "gold", label: "Paid in" },
        { tone: "accent", label: "Growth" },
        { tone: "alert", label: "Shortfall, if the rate is negative" },
      ]}
      results={[
        ["Value at the end", c(last.value)],
        ["Paid in", c(last.paid)],
        [growth >= 0 ? "Growth" : "Fall", c(Math.abs(growth))],
        ["Payments", String(n)],
      ]}
      table={{
        summary: "Every year, in figures",
        heads: ["Year", "Paid in so far", "Growth so far", "Value"],
        rows: path.map((p) => [String(p.year), c(p.paid), c(p.value - p.paid), c(p.value)]),
      }}
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="Paid in each month" value={pay} onChange={setPay} min={0} max={1e9} sliderMax={2000} sliderStep={10} />
          <NumField label="For how long" value={years} onChange={setYears} min={1} max={60} unit="years" whole />
          <NumField label="Assumed growth a year" value={rate} onChange={setRate} min={-20} max={30} step={0.1} sliderMin={-10} sliderMax={20} unit="%" hint={RATE_HINT} />
          <NumField label="Sum already held" value={start} onChange={setStart} min={0} max={1e12} sliderMax={100000} sliderStep={500} />
          <PickField
            label="Each payment is made"
            value={when}
            onChange={setWhen}
            options={[
              { value: "end", label: "At the end of the month" },
              { value: "start", label: "At the start of the month" },
            ]}
          />
        </>
      }
    />
  );
}

function Retirement({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [age, setAge] = useState(30);
  const [retire, setRetire] = useState(65);
  const [span, setSpan] = useState(25);
  const [spend, setSpend] = useState(2000);
  const [saved, setSaved] = useState(0);
  const [g1, setG1] = useState(5);
  const [g2, setG2] = useState(3);
  const [infl, setInfl] = useState(3);
  const c = useMemo(() => cash(sym), [sym]);

  // retirement cannot come before next year
  const at = Math.max(retire, age + 1);
  const yearsTo = at - age;
  const plan = useMemo(() => retirementPlan({ yearsToRetire: yearsTo, yearsRetired: span, spendToday: spend, saved, growthBeforePct: g1, growthAfterPct: g2, inflationPct: infl }), [yearsTo, span, spend, saved, g1, g2, infl]);
  const n = yearsTo * 12;
  const m = span * 12;
  const i1 = monthlyRate(g1);
  const i2 = monthlyRate(g2);
  const pi = monthlyRate(infl);
  const q = (1 + pi) / (1 + i2);
  const needs = plan.monthly > 0.005;

  const spec = useMemo<ChartSpec>(
    () => ({
      title: "THE SUM AT THE END OF EACH YEAR",
      cols: plan.path.map((p) => ({ a: Math.max(0, p.value), b: 0, alt: p.retired })),
      toneA: "accent",
      toneB: "accent",
      toneAlt: "gold",
      vmarks: [{ at: yearsTo, label: `RETIRE AT ${at}` }],
      ends: [`AGE ${age + 1}`, `AGE ${at + span}`],
      read: (k) => `AGE ${age + plan.path[k]!.year} · ${c(Math.max(0, plan.path[k]!.value), 0)}`,
    }),
    [plan, yearsTo, at, age, span, c],
  );

  const sentence = `To spend ${c(spend)} a month in today’s money from age ${at} to ${at + span}, with prices assumed to rise ${pc(infl)} a year, the sum needed at ${at} is ${c(plan.pot)}. ${
    needs
      ? `Reaching it takes ${c(plan.monthly)} a month for ${plural(yearsTo, "year")} at an assumed ${pc(g1)} a year${saved > 0 ? `, on top of the ${c(saved)} already saved` : ""}.`
      : `On these assumptions the ${c(saved)} already saved grows to ${c(plan.savedGrown)} by then, which covers it with nothing added.`
  }`;

  const working = [
    `Monthly rates: growth before ${dec(i1)}, growth after ${dec(i2)}, prices ${dec(pi)}; ${n} months to retirement, ${m} months in it`,
    `Spending at ${at}: ${c(spend)} × (1 + ${dec(pi)})^${n} = ${c(plan.spendAtRetirement)} a month`,
    Math.abs(1 - q) < 1e-12 ? `q = 1, so the sum needed = ${c(plan.spendAtRetirement)} × ${m} = ${c(plan.pot)}` : `q = (1 + ${dec(pi)}) ÷ (1 + ${dec(i2)}) = ${q.toFixed(6)}; sum needed = ${c(plan.spendAtRetirement)} × (1 − q^${m}) ÷ (1 − q) = ${c(drawdownPot(plan.spendAtRetirement, i2, pi, m))}`,
    i1 === 0
      ? `Saving = (${c(plan.pot)} − ${c(saved)}) ÷ ${n} = ${c(plan.monthly)} a month`
      : `Saving = (${c(plan.pot)} − ${c(saved)} × (1 + ${dec(i1)})^${n}) × ${dec(i1)} ÷ ((1 + ${dec(i1)})^${n} − 1) = ${c(plan.monthly)} a month${needs ? "" : " (zero or less: nothing needs adding)"}`,
  ];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "accent", label: "Building up" },
        { tone: "gold", label: "Being spent" },
      ]}
      results={[
        ["Saving needed a month", c(Math.max(0, plan.monthly))],
        [`Sum needed at ${at}`, c(plan.pot)],
        ["First month’s spending then", c(plan.spendAtRetirement)],
        ["Already saved, by then", c(plan.savedGrown)],
      ]}
      table={{
        summary: "Every year, in figures",
        heads: ["Age", "Sum at the end of the year", "Stage"],
        rows: plan.path.map((p) => [String(age + p.year), c(Math.max(0, p.value)), p.retired ? "Spending" : "Saving"]),
        minWidth: "min-w-[24rem]",
      }}
      note="The saving is the same amount every month and is added at the end of the month. In retirement each month’s spending is taken at the start of the month and rises with the prices you assumed. Tax, charges and any pension paid by a state or an employer are left out."
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="Age now" value={age} onChange={setAge} min={16} max={85} unit="years" whole />
          <NumField label="Age at retirement" value={at} onChange={setRetire} min={17} max={95} unit="years" whole />
          <NumField label="Years in retirement" value={span} onChange={setSpan} min={1} max={50} unit="years" whole />
          <NumField label="Monthly spending wanted, in today’s money" value={spend} onChange={setSpend} min={0} max={1e9} sliderMax={10000} sliderStep={50} />
          <NumField label="Already saved" value={saved} onChange={setSaved} min={0} max={1e12} sliderMax={500000} sliderStep={1000} />
          <NumField label="Assumed growth a year before retirement" value={g1} onChange={setG1} min={-10} max={30} step={0.1} sliderMax={15} unit="%" hint={RATE_HINT} />
          <NumField label="Assumed growth a year in retirement" value={g2} onChange={setG2} min={-10} max={30} step={0.1} sliderMax={15} unit="%" hint={RATE_HINT} />
          <NumField label="Assumed rise in prices a year" value={infl} onChange={setInfl} min={0} max={30} step={0.1} sliderMax={15} unit="%" hint={RATE_HINT} />
        </>
      }
    />
  );
}

function LoanEmi({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(8);
  const [months, setMonths] = useState(60);
  const c = useMemo(() => cash(sym), [sym]);

  const i = monthlyRate(rate);
  const rows = useMemo(() => amortisation(amount, i, months), [amount, i, months]);
  const pay = rows[0]!.payment;
  const total = pay * months;
  const interest = total - amount;
  const byYear = months > 60;

  const spec = useMemo<ChartSpec>(() => {
    if (!byYear) {
      return {
        title: "EACH PAYMENT, AND WHAT IS STILL OWED",
        cols: rows.map((r) => ({ a: r.principal, b: r.interest })),
        toneA: "accent",
        toneB: "gold",
        line: rows.map((r) => r.balance),
        lineTone: "ink",
        lineOwnScale: true,
        ends: ["MONTH 1", `MONTH ${rows.length}`],
        read: (k) => `MONTH ${rows[k]!.month} · OWED ${c(rows[k]!.balance, 0)}`,
      };
    }
    const years: { a: number; b: number; balance: number }[] = [];
    rows.forEach((r, k) => {
      const y = Math.floor(k / 12);
      const cell = (years[y] ??= { a: 0, b: 0, balance: 0 });
      cell.a += r.principal;
      cell.b += r.interest;
      cell.balance = r.balance;
    });
    return {
      title: "EACH YEAR’S PAYMENTS, AND WHAT IS STILL OWED",
      cols: years.map((y) => ({ a: y.a, b: y.b })),
      toneA: "accent",
      toneB: "gold",
      line: years.map((y) => y.balance),
      lineTone: "ink",
      lineOwnScale: true,
      ends: ["YEAR 1", `YEAR ${years.length}`],
      read: (k) => `YEAR ${k + 1} · OWED ${c(years[k]!.balance, 0)}`,
    };
  }, [rows, byYear, c]);

  const sentence = `Borrowing ${c(amount)} at ${pc(rate)} a year over ${plural(months, "month")} costs ${c(pay)} a month. In all ${c(total)} is repaid, of which ${c(interest)} is interest. The first payment is ${c(rows[0]!.interest)} of interest and ${c(rows[0]!.principal)} off the loan${
    months > 1 && rate > 0 ? "; the interest part shrinks with every payment" : ""
  }.`;

  const working = [
    `i = ${pc(rate)} ÷ 12 = ${dec(i)} a month; n = ${plural(months, "payment")}`,
    i === 0 ? `M = ${c(amount)} ÷ ${months} = ${c(pay)}` : `M = ${c(amount)} × ${dec(i)} × (1 + ${dec(i)})^${months} ÷ ((1 + ${dec(i)})^${months} − 1) = ${c(pay)}`,
    `Total repaid = ${c(pay)} × ${months} = ${c(total)}; interest = ${c(total)} − ${c(amount)} = ${c(interest)}`,
  ];

  const yrs = Math.floor(months / 12);
  const rem = months % 12;

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "accent", label: "Off the loan (principal)" },
        { tone: "gold", label: "Interest" },
        { tone: "ink", label: "Still owed (its own scale)", line: true },
      ]}
      results={[
        ["Monthly payment", c(pay)],
        ["Total repaid", c(total)],
        ["Total interest", c(interest)],
        ["Interest ÷ loan", amount > 0 ? `${fmt((interest / amount) * 100, 1)}%` : "n/a"],
      ]}
      table={{
        summary: `The amortisation table: all ${plural(months, "payment")}`,
        heads: ["Month", "Payment", "Interest", "Off the loan", "Still owed"],
        rows: rows.map((r) => [String(r.month), c(r.payment), c(r.interest), c(r.principal), c(r.balance)]),
        minWidth: "min-w-[34rem]",
      }}
      note="Worked without rounding. A lender rounds each payment to the smallest unit of the currency and adjusts the last one, and may add fees or insurance, so a real schedule differs slightly."
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="Amount borrowed" value={amount} onChange={setAmount} min={0} max={1e12} sliderMax={500000} sliderStep={1000} />
          <NumField label="Interest rate a year" value={rate} onChange={setRate} min={0} max={100} step={0.05} sliderMax={30} sliderStep={0.1} unit="%" hint="The rate on your own loan offer or agreement." />
          <NumField label="Term" value={months} onChange={setMonths} min={1} max={480} sliderMax={360} unit="months" whole hint={yrs ? `${plural(months, "month")} is ${plural(yrs, "year")}${rem ? ` and ${plural(rem, "month")}` : ""}.` : undefined} />
        </>
      }
    />
  );
}

function Inflation({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(20);
  const c = useMemo(() => cash(sym), [sym]);

  const cost = inflate(amount, rate, years);
  const buys = buyingPower(amount, rate, years);
  const change = amount > 0 ? (buys / amount - 1) * 100 : 0;
  const r = rate / 100;

  const points = useMemo(() => Array.from({ length: years + 1 }, (_, y) => ({ year: y, cost: inflate(amount, rate, y), buys: buyingPower(amount, rate, y) })), [amount, rate, years]);

  const spec = useMemo<ChartSpec>(
    () => ({
      title: "WHAT THE SAME SUM BUYS, YEAR BY YEAR",
      cols: points.map((p) => ({ a: p.buys, b: 0 })),
      toneA: "accent",
      toneB: "accent",
      line: points.map((p) => p.cost),
      lineTone: "gold",
      ends: ["TODAY", `YEAR ${years}`],
      read: (k) => `YEAR ${points[k]!.year} · BUYS ${c(points[k]!.buys, 0)}`,
    }),
    [points, years, c],
  );

  const sentence =
    rate === 0
      ? `With prices assumed not to change, what costs ${c(amount)} today still costs ${c(amount)} in ${plural(years, "year")}, and the sum buys exactly what it buys now.`
      : `With prices assumed to ${rate > 0 ? "rise" : "fall"} ${pc(Math.abs(rate))} a year, what costs ${c(amount)} today costs ${c(cost)} in ${plural(years, "year")}. ${c(amount)} kept unchanged would then buy what ${c(buys)} buys today: ${fmt(Math.abs(change), 1)}% ${
          change < 0 ? "less" : "more"
        }.`;

  const working = [`Cost then = ${c(amount)} × (1 + ${r.toFixed(4)})^${years} = ${c(cost)}`, `Buying power = ${c(amount)} ÷ (1 + ${r.toFixed(4)})^${years} = ${c(buys)}`, `Change = ${c(buys)} ÷ ${c(amount)} − 1 = ${fmt(change, 1)}%`];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "accent", label: "What the sum buys, in today’s money" },
        { tone: "gold", label: "Cost of the same things", line: true },
      ]}
      results={[
        ["Cost then", c(cost)],
        ["The sum buys", c(buys)],
        [change <= 0 ? "Buying power lost" : "Buying power gained", `${fmt(Math.abs(change), 1)}%`],
        ["Years for prices to double", rate > 0 ? fmt(doublingYears(rate), 1) : "n/a"],
      ]}
      table={{
        summary: "Every year, in figures",
        heads: ["Year", "Cost of the same things", "What the sum buys"],
        rows: points.map((p) => [String(p.year), c(p.cost), c(p.buys)]),
        minWidth: "min-w-[26rem]",
      }}
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="A sum of money today" value={amount} onChange={setAmount} min={0} max={1e12} sliderMax={100000} sliderStep={100} />
          <NumField label="Assumed rise in prices a year" value={rate} onChange={setRate} min={-10} max={100} step={0.1} sliderMin={0} sliderMax={15} unit="%" hint={RATE_HINT} />
          <NumField label="Years ahead" value={years} onChange={setYears} min={1} max={60} unit="years" whole />
        </>
      }
    />
  );
}

function GoalPlanner({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [target, setTarget] = useState(50000);
  const [years, setYears] = useState(10);
  const [held, setHeld] = useState(0);
  const [rate, setRate] = useState(5);
  const [infl, setInfl] = useState(0);
  const c = useMemo(() => cash(sym), [sym]);

  const goal = inflate(target, infl, years);
  const n = years * 12;
  const i = monthlyRate(rate);
  const need = paymentForTarget(goal, held, i, n);
  const pay = Math.max(0, need);
  const needs = need > 0.005;
  const heldGrown = compound(held, i, n);
  const paid = held + pay * n;
  const growth = (needs ? goal : heldGrown) - paid;
  const flat = Math.max(0, (goal - held) / n);

  const path = useMemo(() => savingsPath(held, pay, rate, years), [held, pay, rate, years]);

  const spec = useMemo<ChartSpec>(
    () => ({
      title: "THE WAY TO THE TARGET, YEAR BY YEAR",
      cols: path.map((p) => ({ a: p.paid, b: p.value - p.paid })),
      toneA: "gold",
      toneB: "accent",
      mark: { value: goal, label: `TARGET ${c(goal, 0)}` },
      ends: ["YEAR 1", `YEAR ${path.length}`],
      read: (k) => `YEAR ${path[k]!.year} · ${c(path[k]!.value, 0)}`,
    }),
    [path, goal, c],
  );

  const lead = infl > 0 ? `With prices assumed to rise ${pc(infl)} a year, a target of ${c(target)} in today’s money becomes ${c(goal)}. ` : "";
  const sentence = needs
    ? `${lead}Reaching ${c(goal)} in ${plural(years, "year")} takes ${c(need)} a month at an assumed ${pc(rate)} a year: ${c(paid)} paid in ${growth >= 0 ? `and ${c(growth)} of growth` : `less a fall of ${c(-growth)}`}. With no growth at all it would take ${c(flat)} a month.`
    : `${lead}On these assumptions the ${c(held)} already held grows to ${c(heldGrown)} in ${plural(years, "year")}, which reaches the target of ${c(goal)} with nothing added.`;

  const working = [
    ...(infl > 0 ? [`Target then = ${c(target)} × (1 + ${(infl / 100).toFixed(4)})^${years} = ${c(goal)}`] : []),
    `i = ${pc(rate)} ÷ 12 = ${dec(i)} a month; n = ${years} × 12 = ${n} payments`,
    i === 0 ? `P = (${c(goal)} − ${c(held)}) ÷ ${n} = ${c(need)} a month` : `P = (${c(goal)} − ${c(held)} × (1 + ${dec(i)})^${n}) × ${dec(i)} ÷ ((1 + ${dec(i)})^${n} − 1) = ${c(need)} a month${needs ? "" : " (zero or less: nothing needs adding)"}`,
  ];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "gold", label: "Paid in" },
        { tone: "accent", label: "Growth" },
        { tone: "ink", label: "The target", line: true },
      ]}
      results={[
        ["Needed each month", c(pay)],
        ["Target", c(goal)],
        ["Paid in, in all", c(paid)],
        [growth >= 0 ? "Growth" : "Fall", c(Math.abs(growth))],
      ]}
      table={{
        summary: "Every year, in figures",
        heads: ["Year", "Paid in so far", "Growth so far", "Value"],
        rows: path.map((p) => [String(p.year), c(p.paid), c(p.value - p.paid), c(p.value)]),
      }}
      note="The payment is the same every month and is made at the end of the month. Tax and charges are left out."
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="Target, in today’s money" value={target} onChange={setTarget} min={0} max={1e12} sliderMax={500000} sliderStep={1000} />
          <NumField label="Years to reach it" value={years} onChange={setYears} min={1} max={60} unit="years" whole />
          <NumField label="Sum already held" value={held} onChange={setHeld} min={0} max={1e12} sliderMax={250000} sliderStep={500} />
          <NumField label="Assumed growth a year" value={rate} onChange={setRate} min={-20} max={30} step={0.1} sliderMin={-10} sliderMax={20} unit="%" hint={RATE_HINT} />
          <NumField label="Assumed rise in prices a year" value={infl} onChange={setInfl} min={0} max={30} step={0.1} sliderMax={15} unit="%" hint="Raises the target. Leave at 0 to keep the target as typed." />
        </>
      }
    />
  );
}

function TaxDrag({ formula }: Props) {
  const [sym, setSym] = useState("");
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(5);
  const [tax, setTax] = useState(25);
  const [years, setYears] = useState(20);
  const c = useMemo(() => cash(sym), [sym]);

  const points = useMemo(
    () =>
      Array.from({ length: years + 1 }, (_, y) => ({
        year: y,
        none: inflate(amount, rate, y),
        yearly: taxedEveryYear(amount, rate, tax, y),
        end: taxedAtEnd(amount, rate, tax, y),
      })),
    [amount, rate, tax, years],
  );
  const last = points[points.length - 1]!;
  const drag = last.none - last.yearly;
  const r = rate / 100;
  const t = tax / 100;
  const net = rate > 0 ? rate * (1 - t) : rate;

  const spec = useMemo<ChartSpec>(
    () => ({
      title: "THE SAME SUM, TAXED AND UNTAXED",
      cols: points.map((p) => ({ a: p.yearly, b: Math.max(0, p.none - p.yearly) })),
      toneA: "accent",
      toneB: "alert",
      line: points.map((p) => p.end),
      lineTone: "gold",
      ends: ["TODAY", `YEAR ${years}`],
      read: (k) => `YEAR ${points[k]!.year} · KEPT ${c(points[k]!.yearly, 0)}`,
    }),
    [points, years, c],
  );

  const sentence =
    rate <= 0 || tax === 0
      ? `${c(amount)} at an assumed ${pc(rate)} a year for ${plural(years, "year")} becomes ${c(last.none)}. ${rate <= 0 ? "With no growth there is nothing to tax" : "At a tax rate of 0% nothing is taken"}, so all three figures are the same.`
      : `${c(amount)} growing at an assumed ${pc(rate)} a year for ${plural(years, "year")} becomes ${c(last.none)} with no tax. Taxed at ${pc(tax)} on each year’s growth it becomes ${c(last.yearly)}, which is ${c(drag)} less. Taxed once at the end, on the whole gain, it becomes ${c(last.end)}.`;

  const working = [
    `No tax: ${c(amount)} × (1 + ${r.toFixed(4)})^${years} = ${c(last.none)}`,
    rate > 0 ? `Taxed every year: rate kept = ${pc(rate)} × (1 − ${t.toFixed(4)}) = ${pc(net, 4)}; ${c(amount)} × (1 + ${(net / 100).toFixed(6)})^${years} = ${c(last.yearly)}` : `Taxed every year: no growth, so no tax; ${c(last.yearly)}`,
    `Taxed at the end: ${c(last.none)} − ${t.toFixed(4)} × ${c(Math.max(0, last.none - amount))} = ${c(last.end)}`,
    `Cost of the yearly tax: ${c(last.none)} − ${c(last.yearly)} = ${c(drag)}`,
  ];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[
        { tone: "accent", label: "Kept, taxed every year" },
        { tone: "alert", label: "Gone: the tax, and the growth it would have earned" },
        { tone: "gold", label: "Taxed once, at the end", line: true },
      ]}
      results={[
        ["No tax", c(last.none)],
        ["Taxed every year", c(last.yearly)],
        ["Taxed at the end", c(last.end)],
        ["Yearly rate after tax", pc(net, 3)],
      ]}
      table={{
        summary: "Every year, in figures",
        heads: ["Year", "No tax", "Taxed every year", "Taxed at the end"],
        rows: points.map((p) => [String(p.year), c(p.none), c(p.yearly), c(p.end)]),
      }}
      note="One rate, applied to all growth, with no allowance and no relief for a loss. Real tax rules differ from country to country and from one kind of account to another, and are more involved than this. The calculator shows the effect of timing, not anyone’s tax bill."
      controls={
        <>
          <SymbolField value={sym} onChange={setSym} />
          <NumField label="Sum at the start" value={amount} onChange={setAmount} min={0} max={1e12} sliderMax={250000} sliderStep={500} />
          <NumField label="Assumed growth a year" value={rate} onChange={setRate} min={-20} max={30} step={0.1} sliderMin={-10} sliderMax={20} unit="%" hint={RATE_HINT} />
          <NumField label="Your tax rate on growth" value={tax} onChange={setTax} min={0} max={100} step={0.5} sliderMax={60} unit="%" hint="Your own rate. This page does not know any country’s." />
          <NumField label="Years" value={years} onChange={setYears} min={1} max={60} unit="years" whole />
        </>
      }
    />
  );
}

const RULE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36] as const;

function RuleOf72({ formula }: Props) {
  const [rate, setRate] = useState(6);
  const [span, setSpan] = useState(10);

  const exact = doublingYears(rate);
  const rule = rule72(rate);
  const diff = rule - exact;
  const ruleRate = 72 / span;
  const exactRate = doublingRatePct(span);
  const horizon = Math.min(150, Math.max(6, Math.ceil(Math.max(exact, rule) * 2.2)));

  const spec = useMemo<ChartSpec>(
    () => ({
      title: `ONE UNIT AT ${pc(rate)} A YEAR`,
      cols: Array.from({ length: horizon + 1 }, (_, y) => ({ a: Math.pow(1 + rate / 100, y), b: 0 })),
      toneA: "accent",
      toneB: "accent",
      mark: { value: 2, label: "DOUBLED" },
      vmarks: [
        { at: doublingYears(rate) + 0.5, label: `EXACT: ${fmt(doublingYears(rate))} YEARS` },
        { at: rule72(rate) + 0.5, label: `RULE OF 72: ${fmt(rule72(rate))} YEARS` },
      ],
      ends: ["TODAY", `YEAR ${horizon}`],
      read: (k) => `YEAR ${k} · × ${fmt(Math.pow(1 + rate / 100, k))}`,
    }),
    [rate, horizon],
  );

  const sentence = `At an assumed ${pc(rate)} a year the rule of 72 says a sum doubles in ${fmt(rule)} years. The exact figure is ${fmt(exact)} years, so the rule is ${
    Math.abs(diff) < 0.005 ? "right to two decimal places" : `${fmt(Math.abs(diff))} years too ${diff > 0 ? "long" : "short"}`
  }. To double in ${plural(span, "year")} the rule says ${fmt(ruleRate)}% a year; the exact rate is ${fmt(exactRate)}%.`;

  const r = rate / 100;
  const working = [
    `Rule: 72 ÷ ${Number(rate.toFixed(2))} = ${fmt(rule)} years`,
    `Exact: ln 2 ÷ ln(1 + ${r.toFixed(4)}) = ${Math.LN2.toFixed(6)} ÷ ${Math.log(1 + r).toFixed(6)} = ${fmt(exact)} years`,
    `Rule, the other way: 72 ÷ ${span} = ${fmt(ruleRate)}% a year`,
    `Exact, the other way: 2^(1 ÷ ${span}) − 1 = ${fmt(exactRate)}% a year`,
  ];

  return (
    <Frame
      spec={spec}
      sentence={sentence}
      formula={formula}
      working={working}
      legend={[{ tone: "accent", label: "One unit, compounding once a year" }]}
      results={[
        ["Rule of 72", `${fmt(rule)} years`],
        ["Exact", `${fmt(exact)} years`],
        [`Rate to double in ${span}, by the rule`, `${fmt(ruleRate)}%`],
        ["The same, exactly", `${fmt(exactRate)}%`],
      ]}
      table={{
        summary: "The rule against the exact figure, at a range of rates",
        heads: ["Rate a year", "Rule of 72 (years)", "Exact (years)", "Rule minus exact"],
        rows: RULE_ROWS.map((p) => [`${p}%`, fmt(rule72(p)), fmt(doublingYears(p)), `${rule72(p) - doublingYears(p) > 0.005 ? "+" : ""}${fmt(rule72(p) - doublingYears(p))}`]),
      }}
      note="The same arithmetic describes anything that compounds: a debt left unpaid doubles on the same timetable, and so do prices under inflation."
      controls={
        <>
          <NumField label="Assumed rate a year" value={rate} onChange={setRate} min={0.5} max={50} step={0.1} sliderMax={25} unit="%" hint={RATE_HINT} />
          <NumField label="Or: years in which to double" value={span} onChange={setSpan} min={1} max={100} sliderMax={50} unit="years" whole />
        </>
      }
    />
  );
}

const CALCULATORS = {
  "regular-investing": RegularInvesting,
  retirement: Retirement,
  "loan-emi": LoanEmi,
  inflation: Inflation,
  "goal-planner": GoalPlanner,
  "tax-drag": TaxDrag,
  "rule-of-72": RuleOf72,
} as const;

export type CalculatorSlug = keyof typeof CALCULATORS;

/** The calculator for a page, by its slug. The formula lines come from the page's data, so the page and the calculator state the same thing. */
export function Calculator({ slug, formula }: { slug: CalculatorSlug; formula: readonly string[] }) {
  const C = CALCULATORS[slug];
  return <C formula={formula} />;
}
