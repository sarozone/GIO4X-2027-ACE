"use client";

import { useId, useMemo, useRef, useState } from "react";
import { clamp, lerp, rgba, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Slider, Stage } from "@/components/labs/kit";
import { borrowed, combinedSd, deepestFall, exchangeRate, holdingReturns, inHomeUnit, runPortfolio, shareOut, type PortfolioRun, type RebalanceRule, type StressStretch } from "./math";

/**
 * THE RISK ROOM — its sixth machine: building a portfolio.
 *
 * Three invented holdings at weights the visitor sets, money paid in or taken
 * out each month, rebalancing that costs something, an invented exchange rate,
 * a stress stretch and, kept apart, the same exposure with borrowed money.
 *
 * The rule it keeps: every path is invented and seeded (./math.ts, checked
 * against hand-worked cases), every assumption is listed under the machine,
 * and the three columns of the comparison are run on the same paths so that
 * only the choice differs. It explains what each choice does to one invented
 * run. It does not say what to hold, how to weight it or whether to borrow.
 * Nothing is sent or stored.
 */

const P_STEPS = 120;
const P_START = 10_000;
const P_SECONDS = 7;
/** the correlation every pair of holdings shares outside the stress stretch */
const P_RHO = 0.2;
/** the stress stretch: months 19 to 42, every correlation 0.9 and every swing doubled. An assumption of the model. */
const P_STRESS: StressStretch = { from: 18, to: 42, rho: 0.9, widen: 2 };
/** the swing of the invented exchange rate, a month */
const P_FX_SD = 0.025;
/** which holding is priced in another currency */
const P_ABROAD = 2;

/** average return and swing are fractions of the holding's value for one month */
const P_HOLDINGS = [
  { name: "Steady", mean: 0.003, sd: 0.015 },
  { name: "Lively", mean: 0.006, sd: 0.05 },
  { name: "Abroad", mean: 0.004, sd: 0.035 },
] as const;
const P_MEANS = P_HOLDINGS.map((x) => x.mean);
const P_SDS = P_HOLDINGS.map((x) => x.sd);

const RULES = [
  { key: "never", label: "Never", words: "never rebalanced" },
  { key: "yearly", label: "Yearly", words: "rebalanced every 12 months" },
  { key: "quarterly", label: "Quarterly", words: "rebalanced every 3 months" },
  { key: "band", label: "Past a band", words: "rebalanced when a weight drifts past the band" },
] as const;
type RuleKey = (typeof RULES)[number]["key"];

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
/** a whole number of units with a comma at each thousand (written out, so server and browser agree) */
const units = (v: number) => `${v < 0 ? "−" : ""}${String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
/** a new seed, drawn in the browser on a click and never while rendering */
const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const holdingColours = (pal: Palette): Colour[] => [pal.teal, pal.gold, pal.accent];

const label = (ctx: CanvasRenderingContext2D, pal: Palette) => {
  ctx.font = `600 10px ${pal.font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = rgba(pal.ink3, 1);
};

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-13 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line">
      {items.map(([k, v]) => (
        <div key={k} className="bg-surface p-13">
          <dt className="label">{k}</dt>
          <dd className="num mt-3 text-lg text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** what has been paid in, net, by each month (the run itself keeps only the total) */
function paidInCurve(run: PortfolioRun, flow: number): number[] {
  return run.values.map((_, t) => (run.emptyAt >= 0 && t >= run.emptyAt ? run.paidIn : P_START + flow * t));
}

export function PortfolioBuilder() {
  const uid = useId();
  const [weights, setWeights] = useState<number[]>([40, 40, 20]);
  const [flow, setFlow] = useState(50);
  const [rule, setRule] = useState<RuleKey>("yearly");
  const [band, setBand] = useState(5);
  /** the cost of a rebalancing trade in twentieths of a percent, so the slider's steps are whole numbers */
  const [cost20, setCost20] = useState(10);
  const [fx, setFx] = useState(true);
  const [stress, setStress] = useState(true);
  const [lever, setLever] = useState(false);
  /** the leverage multiple in halves */
  const [multiple2, setMultiple2] = useState(6);
  /** the financing cost in half percents a year */
  const [fin2, setFin2] = useState(8);
  // the first paths shown are ones where the stress stretch is a fall the portfolio survives; "New paths" draws others, kind or unkind
  const [seed, setSeed] = useState(2099);
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const cost = cost20 / 2000;
  const multiple = multiple2 / 2;
  const financing = fin2 / 200;

  const data = useMemo(() => {
    const local = holdingReturns(seed, P_MEANS, P_SDS, P_RHO, P_STEPS, stress ? P_STRESS : undefined);
    const rate = exchangeRate((seed + 1) >>> 0, P_FX_SD, P_STEPS);
    const home = local.map((r, i) => (i === P_ABROAD ? inHomeUnit(r, rate) : r));
    const how: RebalanceRule = rule === "never" ? { kind: "never" } : rule === "yearly" ? { kind: "every", steps: 12 } : rule === "quarterly" ? { kind: "every", steps: 3 } : { kind: "band", band: band / 100 };
    const plan = { start: P_START, weights, flow, rule: how, cost };
    const returns = fx ? home : local;
    const current = runPortfolio(returns, plan);
    const never = runPortfolio(returns, { ...plan, rule: { kind: "never" } });
    const equal = runPortfolio(returns, { ...plan, weights: weights.map(() => 1) });
    // the same settings with the exchange rate treated the other way
    const other = runPortfolio(fx ? local : home, plan);
    return { current, never, equal, other, rate, paid: paidInCurve(current, flow) };
  }, [seed, stress, fx, rule, band, weights, flow, cost]);

  const lev = useMemo(() => borrowed(data.current.unit, multiple, financing / 12), [data, multiple, financing]);
  const fall = useMemo(() => deepestFall(data.current.unit).depth, [data]);
  const levFall = useMemo(() => deepestFall(lev.curve).depth, [lev]);

  const w = weights.map((v) => v / 100);
  const calmSwing = combinedSd(P_SDS, P_RHO, w);
  const stressSwing = combinedSd(P_SDS.map((s) => s * P_STRESS.widen), P_STRESS.rho, w);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w: cw, h, t, pal, still }) => {
        if (cw < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : clamp((t - playFrom.current) / P_SECONDS);
        const upto = Math.max(1, Math.round(p * P_STEPS));
        const padX = 10;
        const top = 58;
        const foot = h - 16;
        const mid = top + (foot - top) * 0.58;
        const bandTop = mid + 24;
        const x = (i: number) => lerp(padX, cw - padX, i / P_STEPS);
        const colours = holdingColours(pal);
        const cur = data.current;

        label(ctx, pal);
        ctx.fillText(lever ? "THE STARTING AMOUNT ALONE · PER 100" : `INVENTED HOLDINGS · ${P_STEPS} MONTHS`, padX, 11);

        // the key, wrapping to a second line on a narrow canvas
        let kx = padX;
        let ky = 27;
        const key = (name: string, colour: string, width: number, dash: number[]) => {
          const need = 18 + ctx.measureText(name).width;
          if (kx > padX && kx + need > cw - padX) {
            kx = padX;
            ky += 14;
          }
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.setLineDash(dash);
          ctx.beginPath();
          ctx.moveTo(kx, ky);
          ctx.lineTo(kx + 14, ky);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(name, kx + 18, ky);
          kx += need + 12;
        };
        if (lever) {
          key("OWN MONEY ONLY", rgba(pal.ink, 1), 2.2, []);
          key(`BORROWED, ${multiple} TIMES`, rgba(ALERT, 1), 2.2, [6, 3]);
        } else {
          key("THESE SETTINGS", rgba(pal.ink, 1), 2.2, []);
          key("NEVER REBALANCED", rgba(pal.ink3, 1), 1.2, [5, 3]);
          key("PAID IN", rgba(pal.ink3, 1), 1, [1, 3]);
        }

        // the stress stretch, over both pictures
        if (stress) {
          const sx = x(P_STRESS.from);
          const sw = x(P_STRESS.to) - sx;
          ctx.fillStyle = rgba(AMBER, 0.13);
          ctx.fillRect(sx, top - 4, sw, foot - top + 4);
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = rgba(AMBER, 0.9);
          ctx.beginPath();
          ctx.moveTo(sx + 0.5, top - 4);
          ctx.lineTo(sx + 0.5, foot);
          ctx.moveTo(sx + sw - 0.5, top - 4);
          ctx.lineTo(sx + sw - 0.5, foot);
          ctx.stroke();
          ctx.setLineDash([]);
          label(ctx, pal);
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.textAlign = "center";
          ctx.fillText(sw > 96 ? "STRESS · ASSUMED" : "STRESS", sx + sw / 2, top + 4);
        }

        // the upper picture: values
        const series: { s: readonly number[]; colour: string; width: number; dash: number[] }[] = lever
          ? [
              { s: cur.unit.map((v) => v * 100), colour: rgba(pal.ink, 1), width: 2.2, dash: [] },
              { s: lev.curve.map((v) => v * 100), colour: rgba(ALERT, 1), width: 2.2, dash: [6, 3] },
            ]
          : [
              { s: data.paid, colour: rgba(pal.ink3, 1), width: 1, dash: [1, 3] },
              { s: data.never.values, colour: rgba(pal.ink3, 1), width: 1.2, dash: [5, 3] },
              { s: cur.values, colour: rgba(pal.ink, 1), width: 2.2, dash: [] },
            ];
        let lo = lever ? 0 : Infinity;
        let hi = -Infinity;
        for (const { s } of series) for (const v of s) {
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        const pad = (hi - lo || 1) * 0.07;
        const y = (v: number) => lerp(mid, top + 12, (v - (lo - (lever ? 0 : pad))) / (hi - lo + pad * (lever ? 1 : 2) || 1));
        if (lever) {
          // where it began, and nothing
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = rgba(pal.ink3, 0.9);
          ctx.beginPath();
          ctx.moveTo(padX, y(100));
          ctx.lineTo(cw - padX, y(100));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = rgba(pal.line, 1);
          ctx.beginPath();
          ctx.moveTo(padX, y(0) + 0.5);
          ctx.lineTo(cw - padX, y(0) + 0.5);
          ctx.stroke();
        }
        ctx.lineJoin = "round";
        for (const { s, colour, width, dash } of series) {
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.setLineDash(dash);
          ctx.beginPath();
          for (let i = 0; i <= upto; i++) {
            if (i === 0) ctx.moveTo(x(i), y(s[i]!));
            else ctx.lineTo(x(i), y(s[i]!));
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
        if (lever && lev.wipedAt >= 0 && upto >= lev.wipedAt) {
          // a cross where the borrowed version reached nothing, and the words, so it is not told by colour alone
          const wx = x(lev.wipedAt);
          const wy = y(0);
          ctx.strokeStyle = rgba(ALERT, 1);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(wx - 5, wy - 5);
          ctx.lineTo(wx + 5, wy + 5);
          ctx.moveTo(wx + 5, wy - 5);
          ctx.lineTo(wx - 5, wy + 5);
          ctx.stroke();
          label(ctx, pal);
          ctx.fillStyle = rgba(pal.ink, 1);
          const right = wx < cw * 0.6;
          ctx.textAlign = right ? "left" : "right";
          ctx.fillText("WIPED OUT", wx + (right ? 10 : -10), wy - 10);
        }

        // the row between the pictures: a mark at each rebalancing
        label(ctx, pal);
        ctx.fillText(cur.rebalancedAt.length ? "SHARE OF THE WHOLE · MARKS: REBALANCED" : "SHARE OF THE WHOLE", padX, mid + 11);
        ctx.fillStyle = rgba(pal.ink, 0.9);
        for (const at of cur.rebalancedAt) {
          if (at > upto) break;
          const rx = x(at);
          ctx.beginPath();
          ctx.moveTo(rx - 3, bandTop - 7);
          ctx.lineTo(rx + 3, bandTop - 7);
          ctx.lineTo(rx, bandTop - 1.5);
          ctx.closePath();
          ctx.fill();
        }

        // the lower picture: the weights as a stacked band, the first holding at the bottom
        const last = cur.emptyAt >= 0 ? Math.min(upto, cur.emptyAt - 1) : upto;
        const by = (share: number) => lerp(foot, bandTop, share);
        const n = P_HOLDINGS.length;
        const below = new Array<number>(last + 1).fill(0);
        for (let k = 0; k < n; k++) {
          ctx.beginPath();
          for (let i = 0; i <= last; i++) {
            const v = below[i]! + cur.weights[i]![k]!;
            if (i === 0) ctx.moveTo(x(i), by(v));
            else ctx.lineTo(x(i), by(v));
          }
          for (let i = last; i >= 0; i--) ctx.lineTo(x(i), by(below[i]!));
          ctx.closePath();
          ctx.fillStyle = rgba(colours[k]!, 0.72);
          ctx.fill();
          const share = cur.weights[0]![k]!;
          if (share * (foot - bandTop) >= 12) {
            ctx.font = `600 10px ${pal.font}`;
            ctx.textAlign = "left";
            ctx.fillStyle = rgba(pal.surface, 1);
            ctx.fillRect(padX + 3, by(below[0]! + share / 2) - 7, ctx.measureText(P_HOLDINGS[k]!.name.toUpperCase()).width + 8, 14);
            ctx.fillStyle = rgba(pal.ink, 1);
            ctx.fillText(P_HOLDINGS[k]!.name.toUpperCase(), padX + 7, by(below[0]! + share / 2));
          }
          for (let i = 0; i <= last; i++) below[i] = below[i]! + cur.weights[i]![k]!;
        }
        // a thin rule through the band at each rebalancing
        ctx.strokeStyle = rgba(pal.ink, 0.45);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const at of cur.rebalancedAt) {
          if (at > last) break;
          ctx.moveTo(Math.round(x(at)) + 0.5, bandTop);
          ctx.lineTo(Math.round(x(at)) + 0.5, foot);
        }
        ctx.stroke();
        label(ctx, pal);
        ctx.fillText("START", padX, h - 6);
        ctx.textAlign = "right";
        ctx.fillText(`MONTH ${P_STEPS}`, cw - padX, h - 6);
      },
    [data, lev, lever, multiple, stress],
  );

  const cur = data.current;
  const end = cur.values[P_STEPS]!;
  const times = cur.rebalancedAt.length;
  const mix = P_HOLDINGS.map((hd, i) => `${weights[i]}% ${hd.name}`).join(", ");
  const flowWords = flow > 0 ? `${units(flow)} paid in each month` : flow < 0 ? `${units(-flow)} taken out each month` : "nothing paid in or taken out";
  const ruleWords = RULES.find((r) => r.key === rule)!.words;
  const sentence = lever
    ? lev.wipedAt >= 0
      ? `On these invented paths, 100 of the holder’s own money in this mix fell at most ${pct(fall)} and ended on ${(cur.unit[P_STEPS]! * 100).toFixed(0)}; the same exposure at ${multiple} times with borrowed money, financed at ${(financing * 100).toFixed(1)}% a year, was wiped out in month ${lev.wipedAt} and stays at nothing from there.`
      : `On these invented paths, 100 of the holder’s own money in this mix fell at most ${pct(fall)} and ended on ${(cur.unit[P_STEPS]! * 100).toFixed(0)}; the same exposure at ${multiple} times with borrowed money, financed at ${(financing * 100).toFixed(1)}% a year, fell at most ${pct(levFall)} and ended on ${(lev.curve[P_STEPS]! * 100).toFixed(0)}. It was not wiped out on these paths; on others it can be.`
    : cur.emptyAt >= 0
      ? `Over ${P_STEPS} invented months, ${units(P_START)} units held as ${mix}, with ${flowWords}, was emptied by the withdrawals in month ${cur.emptyAt}.`
      : `Over ${P_STEPS} invented months, ${units(P_START)} units held as ${mix}, with ${flowWords} and ${ruleWords}, ended on ${units(end)} against ${units(cur.paidIn)} paid in; it was rebalanced ${times} ${times === 1 ? "time" : "times"} at a cost of ${units(cur.cost)}, and its deepest fall was ${pct(fall)}.`;

  // one number that changes whenever anything the still frame shows changes
  let rev = run;
  for (const v of [...weights, flow + 500, RULES.findIndex((r) => r.key === rule), band, cost20, fx ? 1 : 0, stress ? 1 : 0, lever ? 1 : 0, multiple2, fin2]) rev = (rev * 31 + v + 7) % 2_000_000_011;

  const replay = () => {
    playFrom.current = -1;
    setRun((v) => v + 1);
  };

  const columns: { name: string; run: PortfolioRun }[] = [
    { name: "These settings", run: cur },
    { name: "Never rebalanced", run: data.never },
    { name: "Equal weights", run: data.equal },
  ];
  const rows: { name: string; of: (r: PortfolioRun) => string }[] = [
    { name: "End value", of: (r) => units(r.values[P_STEPS]!) },
    { name: "Deepest fall", of: (r) => pct(deepestFall(r.unit).depth) },
    { name: "Total contributed", of: (r) => units(r.paidIn) },
    { name: "Total cost paid", of: (r) => units(r.cost) },
    { name: "Times rebalanced", of: (r) => String(r.rebalancedAt.length) },
  ];

  return (
    <div>
      <Stage draw={draw} ratio={1.2} rev={rev} />
      <p className="mt-13 min-h-[6rem] text-ink-2" aria-live="polite">
        {sentence}
      </p>

      <div className="mt-13 overflow-x-auto">
        <table className="table-gx min-w-[30rem]">
          <caption className="sr-only">The same invented paths under these settings, never rebalanced, and at equal weights</caption>
          <thead>
            <tr>
              <td />
              {columns.map((c) => (
                <th key={c.name} scope="col" className="num-right">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                {columns.map((c) => (
                  <td key={c.name} className="num-right">
                    {r.of(c.run)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="mt-8 grid gap-5 text-xs text-ink-3">
        <div>
          <dt className="inline font-semibold text-ink-2">End value: </dt>
          <dd className="inline">what the whole portfolio is worth after month {P_STEPS}, in invented units, after every cost and every payment in or out.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink-2">Deepest fall: </dt>
          <dd className="inline">the largest drop from an earlier peak in the value of one unit held throughout. Money paid in or taken out is left out of it, so a payment does not count as a rise or a fall.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink-2">Total contributed: </dt>
          <dd className="inline">the starting {units(P_START)}, plus everything paid in, less everything taken out.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink-2">Total cost paid: </dt>
          <dd className="inline">every rebalancing cost added up. Each is the cost rate × the value bought plus the value sold.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink-2">The columns: </dt>
          <dd className="inline">“Never rebalanced” keeps these weights at the start and then lets them drift. “Equal weights” gives each holding a third and keeps this rebalancing rule and cost. All three use the same paths.</dd>
        </div>
      </dl>

      <Facts
        items={[
          [fx ? "End, exchange rate counted" : "End, exchange rate left out", units(end)],
          [fx ? "End, exchange rate left out" : "End, exchange rate counted", units(data.other.values[P_STEPS]!)],
          ["Swing of this mix, calm", `${pct(calmSwing, 2)} a month`],
          ["In the stress stretch", stress ? `${pct(stressSwing, 2)} a month` : "switched off"],
        ]}
      />

      <p className="label mt-21">Weights (they always total 100%)</p>
      <div className="grid gap-x-21 sm:grid-cols-3">
        {P_HOLDINGS.map((hd, i) => (
          <Slider key={hd.name} label={hd.name} value={weights[i]!} min={0} max={100} onChange={(v) => setWeights((old) => shareOut(old, i, v))} text={`${weights[i]}%`} />
        ))}
      </div>
      <Note>Drag one weight and the other two share what is left, in the proportions they already had (equally, if both were at nothing).</Note>

      <div className="grid gap-x-21 sm:grid-cols-2">
        <Slider label="Each month" value={flow} min={-200} max={200} step={10} onChange={setFlow} text={flow > 0 ? `${flow} paid in` : flow < 0 ? `${-flow} taken out` : "nothing in or out"} />
        <Slider label="Cost of a rebalancing trade" value={cost20} min={0} max={40} onChange={setCost20} text={`${(cost * 100).toFixed(2)}% of its value`} />
      </div>

      <div className="mt-13">
        <p className="label" id={`${uid}-rule`}>
          Rebalance
        </p>
        <div className="mt-5 flex flex-wrap gap-5" role="group" aria-labelledby={`${uid}-rule`}>
          {RULES.map((r) => (
            <button key={r.key} type="button" className={`btn btn-ghost btn-sm min-h-[2.75rem] ${rule === r.key ? "border-accent text-ink" : ""}`} aria-pressed={rule === r.key} onClick={() => setRule(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {rule === "band" && <Slider label="The band" value={band} min={2} max={20} onChange={setBand} text={`${band} points either side of a target weight`} />}

      <div className="mt-13 grid gap-5">
        <label className="check min-h-[2.75rem] content-center">
          <input type="checkbox" checked={fx} onChange={(e) => setFx(e.target.checked)} />
          <span>Count the exchange rate: Abroad is priced in another currency, and its value in the home unit moves with an invented rate as well.</span>
        </label>
        <label className="check min-h-[2.75rem] content-center">
          <input type="checkbox" checked={stress} onChange={(e) => setStress(e.target.checked)} />
          <span>
            Stress stretch (an assumption built into the model): from month {P_STRESS.from + 1} to month {P_STRESS.to} every correlation is {P_STRESS.rho} instead of {P_RHO} and every swing is doubled.
          </span>
        </label>
      </div>

      <div className="mt-13 flex flex-wrap gap-13">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            playFrom.current = -1;
            setSeed(newSeed());
            setRun((v) => v + 1);
          }}
        >
          New paths
        </button>
        <button type="button" className="btn btn-ghost" onClick={replay}>
          Replay
        </button>
      </div>

      <div className="mt-21 border-t border-line pt-13">
        <h3 className="h4">The same exposure with borrowed money</h3>
        <p className="mt-8 text-sm text-ink-2">
          A separate comparison. Investing with only your own money and holding a leveraged exposure are different things, even on the same paths: a fall that the first survives can leave the second with nothing.
        </p>
        <label className="check mt-13 min-h-[2.75rem] content-center">
          <input
            type="checkbox"
            checked={lever}
            onChange={(e) => {
              setLever(e.target.checked);
              replay();
            }}
          />
          <span>Show the same exposure with borrowed money. The upper picture then follows the starting amount alone, per 100, with nothing paid in or taken out.</span>
        </label>
        {lever && (
          <>
            <div className="grid gap-x-21 sm:grid-cols-2">
              <Slider label="Leverage multiple" value={multiple2} min={3} max={10} onChange={setMultiple2} text={`${multiple} times: ${((multiple - 1) * 100).toFixed(0)} borrowed for each 100 of your own`} />
              <Slider label="Financing cost on what is borrowed" value={fin2} min={0} max={24} onChange={setFin2} text={`${(financing * 100).toFixed(1)}% a year`} />
            </div>
            <Facts
              items={[
                ["Own money only: ended, per 100", (cur.unit[P_STEPS]! * 100).toFixed(0)],
                [`Borrowed, ${multiple} times: ended, per 100`, lev.wipedAt >= 0 ? "0" : (lev.curve[P_STEPS]! * 100).toFixed(0)],
                ["Own money only: deepest fall", pct(fall)],
                [`Borrowed, ${multiple} times`, lev.wipedAt >= 0 ? `wiped out, month ${lev.wipedAt}` : `deepest fall ${pct(levFall)}`],
              ]}
            />
            <Note>
              The sum: 100 of your own and {((multiple - 1) * 100).toFixed(0)} borrowed buy {(multiple * 100).toFixed(0)} of the portfolio at the start. Each month that exposure moves with the portfolio and the loan grows by a twelfth of the yearly financing cost. Yours = exposure − loan. Before financing, a 10% fall in one month is a {(multiple * 10).toFixed(0)}% fall in your own money.
            </Note>
            <Note>
              The first month in which exposure − loan is nothing or less, the borrowed version is stopped at zero and stays there, even if the portfolio later recovers. In practice a lender would usually close such a position earlier, and may ask for more money first; that is not modelled here, and no firm’s terms are described.
            </Note>
          </>
        )}
      </div>

      <div className="mt-21 border-t border-line pt-13">
        <h3 className="label">What this machine assumes</h3>
        <ul className="mt-8 grid list-disc gap-5 pl-21 text-xs text-ink-3">
          <li>
            Three invented holdings and {P_STEPS} monthly steps. Each month a holding returns its average plus a bell-curve step: {P_HOLDINGS.map((hd) => `${hd.name} ${pct(hd.mean)} on average with a swing of ${pct(hd.sd)}`).join("; ")}. These figures are made up and describe no real asset.
          </li>
          <li>
            Every pair of holdings shares a correlation of {P_RHO}, fixed, outside the stress stretch. Inside it the correlation is {P_STRESS.rho} and each swing is doubled. The stretch widens the swings in both directions: on some paths it is a sharp rise, not a fall.
          </li>
          <li>The exchange rate starts at 1 and takes its own bell-curve step with a swing of {pct(P_FX_SD)} a month, independent of the holdings and unchanged by the stress stretch. With it counted, Abroad’s monthly return is (1 + its own return) × (rate now ÷ rate before) − 1.</li>
          <li>The portfolio starts with {units(P_START)} units bought at the target weights at no cost. Each month the holdings move first; then money paid in is split at the target weights, or money taken out is taken from each holding in proportion to its value; then the rebalancing rule is checked.</li>
          <li>Rebalancing puts every holding back to its target weight. Its cost is the rate you set × the value bought plus the value sold, taken from the whole. Paying in and taking out cost nothing here. Taxes, spreads and any other cost are left out.</li>
          <li>“Swing of this mix” is √(Σ wᵢ²σᵢ² + 2 Σ wᵢwⱼρσᵢσⱼ) on the holdings’ own swings at the target weights, before the exchange rate.</li>
          <li>No holding can fall by more than 99% in a month, and no value goes below zero. If withdrawals empty the portfolio, the run ends there.</li>
        </ul>
      </div>
      <Note>A simulation on invented paths. It shows what each choice did on one run; another run can favour a different column. It is not a forecast and does not say what to hold or how often to rebalance.</Note>
    </div>
  );
}
