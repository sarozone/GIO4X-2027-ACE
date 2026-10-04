"use client";

import { useId, useMemo, useRef, useState } from "react";
import { TAU, clamp, lerp, rgba, smooth, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Slider, Stage } from "@/components/labs/kit";
import { combinedSd, correlatedPaths, deepestFall, expectancy, longestLosingRun, longestUnderwater, outcomes, recoveryGain, replay, ruinFan, streakChance } from "./math";

/**
 * THE RISK ROOM — five machines about how an account is lost and how slowly it
 * comes back.
 *
 * Every one is a simulation on invented figures, or plain arithmetic on the
 * visitor's own inputs (./math.ts, which is checked against hand-worked
 * cases). The trades are independent and their odds are fixed, which real
 * trading is not, and each machine says so. Nothing here describes a market,
 * predicts a result or suggests a size to trade. Nothing is sent or stored.
 *
 * Each machine is a canvas, ordinary controls and one sentence in an aria-live
 * paragraph that says in words what the canvas shows.
 */

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const chance = (v: number) => (v > 0 && v < 0.001 ? "less than 0.1%" : v < 1 && v > 0.999 ? "more than 99.9%" : pct(v));
const per100 = (v: number) => (v * 100).toFixed(v < 0.1 ? 1 : 0);
const signed = (v: number, d = 2) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;
/** a new seed, drawn in the browser on a click and never while rendering */
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

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

/* ---------------------------------------------------------------------------
 * 1. RISK OF RUIN — a few hundred seeded runs of trades at the same odds and
 *    the same size, drawn as a fan. A run that falls to the chosen level stops
 *    there and is drawn in red. The share that did is counted, not estimated.
 * ------------------------------------------------------------------------- */

const R_TRADES = 150;
const R_PATHS = 240;
const R_SECONDS = 4;

export function RiskOfRuin() {
  const [win, setWin] = useState(45);
  const [payoff10, setPayoff10] = useState(13);
  const [risk2, setRisk2] = useState(10);
  const [ruin, setRuin] = useState(50);
  const [seed, setSeed] = useState(2027);
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const payoff = payoff10 / 10;
  const risk = risk2 / 200;
  const fan = useMemo(() => ruinFan({ winRate: win / 100, payoff, risk, ruin: ruin / 100, trades: R_TRADES, paths: R_PATHS, seed }), [win, payoff, risk, ruin, seed]);
  /** the top of the picture: nine runs in ten stay beneath it, so one lucky run does not flatten the rest */
  const ceiling = useMemo(() => {
    const tops = fan.curves.map((c) => Math.max(...c)).sort((a, b) => a - b);
    return Math.max(1.25, tops[Math.floor(tops.length * 0.9)] ?? 1.25);
  }, [fan]);
  const edge = expectancy(win / 100, payoff);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : clamp((t - playFrom.current) / R_SECONDS);
        const upto = Math.max(1, Math.round(p * R_TRADES));
        const padX = 10;
        const top = 24;
        const bottom = h - 12;
        const floor = 1 - ruin / 100;
        const lnLo = Math.log(floor);
        const lnHi = Math.log(ceiling);
        const pad = (lnHi - lnLo) * 0.07;
        const x = (i: number) => lerp(padX, w - padX, i / R_TRADES);
        const y = (v: number) => lerp(bottom, top, (Math.log(v) - (lnLo - pad)) / (lnHi - lnLo + pad * 2));

        label(ctx, pal);
        ctx.fillText(`${R_PATHS} SIMULATED RUNS · INVENTED ODDS`, padX, 11);

        ctx.save();
        ctx.beginPath();
        ctx.rect(padX, top - 4, w - padX * 2, bottom - top + 8);
        ctx.clip();
        ctx.lineJoin = "round";
        ctx.lineWidth = 1;
        for (const wantRuined of [false, true]) {
          ctx.beginPath();
          fan.curves.forEach((c, k) => {
            if (fan.ruinedAt[k]! >= 0 !== wantRuined) return;
            const end = Math.min(upto, c.length - 1);
            ctx.moveTo(x(0), y(c[0]!));
            for (let i = 1; i <= end; i++) ctx.lineTo(x(i), y(c[i]!));
          });
          ctx.strokeStyle = wantRuined ? rgba(ALERT, 0.5) : rgba(pal.teal, 0.28);
          ctx.stroke();
        }
        // where each ruined run stopped
        ctx.fillStyle = rgba(ALERT, 1);
        fan.ruinedAt.forEach((at) => {
          if (at < 0 || at > upto) return;
          ctx.beginPath();
          ctx.arc(x(at), y(floor), 1.8, 0, TAU);
          ctx.fill();
        });
        ctx.restore();

        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.beginPath();
        ctx.moveTo(padX, y(1));
        ctx.lineTo(w - padX, y(1));
        ctx.stroke();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = rgba(ALERT, 1);
        ctx.beginPath();
        ctx.moveTo(padX, y(floor));
        ctx.lineTo(w - padX, y(floor));
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, pal);
        ctx.textAlign = "right";
        ctx.fillText("START", w - padX, y(1) - 8);
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(`RUIN: ${ruin}% DOWN`, w - padX, y(floor) - 8);
      },
    [fan, ceiling, ruin],
  );

  const sentence =
    fan.ruined === 0
      ? `None of the ${R_PATHS} simulated runs of ${R_TRADES} trades fell ${ruin}% below where it began. That is a count of these runs, not a promise: another set, or a longer one, can differ.`
      : `Of ${R_PATHS} simulated runs of ${R_TRADES} trades, ${fan.ruined} (${pct(fan.share)}) fell ${ruin}% below where they began and stopped there, drawn in red. The other ${R_PATHS - fan.ruined} did not, within these trades.`;

  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={run * 1e9 + win * 1e6 + payoff10 * 1e4 + risk2 * 100 + ruin} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {sentence}
      </p>
      <Facts
        items={[
          ["Runs that hit ruin", `${fan.ruined} of ${R_PATHS}`],
          ["Share", pct(fan.share)],
          ["Average trade", `${signed(edge)} × risk`],
          ["Middle ending, per 100", per100(fan.median)],
        ]}
      />
      <div className="grid gap-x-21 sm:grid-cols-2">
        <Slider label="Win rate" value={win} min={20} max={80} onChange={setWin} text={`${win}%`} />
        <Slider label="Average gain ÷ average loss" value={payoff10} min={5} max={40} onChange={setPayoff10} text={`${payoff.toFixed(1)} to 1`} />
        <Slider label="Risked per trade" value={risk2} min={1} max={40} onChange={setRisk2} text={`${(risk * 100).toFixed(1)}% of the account`} />
        <Slider label="The fall that counts as ruin" value={ruin} min={10} max={90} step={5} onChange={setRuin} text={`${ruin}% below the start`} />
      </div>
      <div className="mt-13 flex flex-wrap gap-13">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            playFrom.current = -1;
            setSeed(newSeed());
            setRun((n) => n + 1);
          }}
        >
          Run again
        </button>
      </div>
      <Note>
        Average trade = win rate × gain − loss rate × 1, in units of the amount risked: here {(win / 100).toFixed(2)} × {payoff.toFixed(1)} − {(1 - win / 100).toFixed(2)} = {signed(edge)}. Each trade risks the same share of the account as it then stands. The picture’s scale is proportional, and the luckiest runs go off the top.
      </Note>
      <Note>A simulation on invented odds. Every trade is independent and the odds never change; real trades are neither, and nobody knows their own win rate this exactly.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. THE SIZING LADDER — one invented run of wins and losses, replayed at five
 *    sizes. The gain equals the loss and half the trades win, so the run has
 *    no edge either way: what differs between the curves is only the size.
 * ------------------------------------------------------------------------- */

const L_SIZES = [0.005, 0.01, 0.02, 0.05, 0.1] as const;
const L_TRADES = 150;
const L_SECONDS = 6;
const L_NAMES = L_SIZES.map((s) => `${s * 100}%`);
const ladderColours = (pal: Palette): Colour[] => [pal.ink3, pal.teal, pal.accent, AMBER, ALERT];

export function SizingLadder() {
  // the first run shown has as many wins as losses, so the sizes differ by nothing but size
  const [seed, setSeed] = useState(2073);
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const data = useMemo(() => {
    const trades = outcomes(seed, L_TRADES, 0.5);
    const wins = trades.filter(Boolean).length;
    const rows = L_SIZES.map((size, i) => {
      const curve = replay(trades, 1, size);
      const fall = deepestFall(curve);
      return { size, name: L_NAMES[i]!, curve, fall, under: longestUnderwater(curve), end: curve[curve.length - 1]! };
    });
    let lo = 1;
    let hi = 1;
    for (const r of rows) for (const v of r.curve) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    return { wins, rows, lo, hi };
  }, [seed]);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : clamp((t - playFrom.current) / L_SECONDS);
        const upto = Math.max(1, Math.round(p * L_TRADES));
        const padX = 10;
        const top = 42;
        const bottom = h - 12;
        const lnLo = Math.log(data.lo);
        const lnHi = Math.log(data.hi);
        const pad = (lnHi - lnLo || 1) * 0.06;
        const x = (i: number) => lerp(padX, w - padX, i / L_TRADES);
        const y = (v: number) => lerp(bottom, top, (Math.log(v) - (lnLo - pad)) / (lnHi - lnLo + pad * 2 || 1));
        const colours = ladderColours(pal);

        label(ctx, pal);
        ctx.fillText(`ONE INVENTED RUN OF ${L_TRADES} TRADES · FIVE SIZES`, padX, 11);
        // the key: a short line in each curve's colour and its size
        let kx = padX;
        data.rows.forEach((r, i) => {
          ctx.strokeStyle = rgba(colours[i]!, 1);
          ctx.lineWidth = 1 + i * 0.35;
          ctx.beginPath();
          ctx.moveTo(kx, 27);
          ctx.lineTo(kx + 14, 27);
          ctx.stroke();
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(r.name, kx + 18, 27);
          kx += 26 + ctx.measureText(r.name).width;
        });

        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.beginPath();
        ctx.moveTo(padX, y(1));
        ctx.lineTo(w - padX, y(1));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineJoin = "round";
        data.rows.forEach((r, i) => {
          ctx.strokeStyle = rgba(colours[i]!, 0.95);
          ctx.lineWidth = 1 + i * 0.35;
          ctx.beginPath();
          for (let k = 0; k <= upto; k++) {
            if (k === 0) ctx.moveTo(x(k), y(r.curve[k]!));
            else ctx.lineTo(x(k), y(r.curve[k]!));
          }
          ctx.stroke();
          // the bottom of its deepest fall, once the curve has reached it
          if (r.fall.depth > 0 && r.fall.trough <= upto) {
            ctx.fillStyle = rgba(colours[i]!, 1);
            ctx.beginPath();
            ctx.arc(x(r.fall.trough), y(r.curve[r.fall.trough]!), 3, 0, TAU);
            ctx.fill();
          }
        });
      },
    [data],
  );

  const first = data.rows[0]!;
  const last = data.rows[data.rows.length - 1]!;
  const sentence = `One invented run of ${L_TRADES} trades (${data.wins} wins, ${L_TRADES - data.wins} losses, each gain the size of each loss) replayed at five sizes. At ${first.name} risk the deepest fall was ${pct(first.fall.depth)}; at ${last.name} it was ${pct(last.fall.depth)}, and the account spent ${last.under.trades} trades below an earlier peak${last.under.open ? " without getting back by the end" : ""}.`;

  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={run} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {sentence}
      </p>
      <div className="mt-13 overflow-x-auto">
        <table className="table-gx min-w-[34rem]">
          <caption className="sr-only">Each size on the same run of trades</caption>
          <thead>
            <tr>
              <th scope="col">Risk per trade</th>
              <th scope="col" className="num-right">
                Deepest fall
              </th>
              <th scope="col" className="num-right">
                Gain needed to undo it
              </th>
              <th scope="col" className="num-right">
                Longest time below a peak
              </th>
              <th scope="col" className="num-right">
                Ended on, per 100
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="num">
                  {r.name}
                </th>
                <td className="num-right">{pct(r.fall.depth)}</td>
                <td className="num-right">{pct(recoveryGain(r.fall.depth))}</td>
                <td className="num-right">
                  {r.under.trades} trades{r.under.open ? ", not back" : ""}
                </td>
                <td className="num-right">{per100(r.end)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-13 flex flex-wrap gap-13">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            playFrom.current = -1;
            setSeed(newSeed());
            setRun((n) => n + 1);
          }}
        >
          Another run
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            playFrom.current = -1;
            setRun((n) => n + 1);
          }}
        >
          Replay
        </button>
      </div>
      <Note>The dot on each curve is the bottom of its deepest fall. The wins and losses are the same for all five; only the share of the account risked on each trade differs. The scale is proportional: equal distances are equal percentages.</Note>
      <Note>A run with more wins than losses ends higher at the larger sizes, and one with more losses ends lower. With equal numbers of each, every size ends below where it began and the larger sizes end lowest, because each loss takes a larger gain to undo.</Note>
      <Note>A simulation on invented trades with fixed, even odds. It shows what size does to a given run. It does not say what size to use.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 3. LOSING STREAKS — the exact chance of at least N losses in a row in a
 *    number of trades (dynamic programming, in ./math.ts), and one simulated
 *    run with its longest losing streak marked.
 * ------------------------------------------------------------------------- */

const S_MAX = 15;
const S_SECONDS = 3;

export function LosingStreaks() {
  const [win, setWin] = useState(45);
  const [trades, setTrades] = useState(100);
  const [n, setN] = useState(6);
  const [seed, setSeed] = useState(2027);
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const q = 1 - win / 100;
  const chances = useMemo(() => Array.from({ length: S_MAX }, (_, i) => streakChance(q, trades, i + 1)), [q, trades]);
  const sample = useMemo(() => outcomes(seed, trades, win / 100), [seed, trades, win]);
  const longest = useMemo(() => longestLosingRun(sample), [sample]);
  const p = chances[n - 1]!;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still, enter }) => {
        if (w < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const shown = still ? trades : Math.round(clamp((t - playFrom.current) / S_SECONDS) * trades);
        const padX = 10;
        const barTop = 24;
        const barBottom = Math.round(h * 0.4);
        const bw = (w - padX * 2) / S_MAX;

        label(ctx, pal);
        ctx.fillText("AT LEAST N LOSSES IN A ROW · EXACT CHANCE", padX, 11);
        chances.forEach((c, i) => {
          const len = Math.max(1, c * (barBottom - barTop) * enter);
          const on = i + 1 === n;
          ctx.fillStyle = on ? rgba(pal.accent, 1) : rgba(pal.ink3, 0.4);
          ctx.fillRect(padX + i * bw + 1.5, barBottom - len, Math.max(1, bw - 3), len);
          if (bw >= 15 || on) {
            ctx.fillStyle = rgba(on ? pal.ink : pal.ink3, 1);
            ctx.textAlign = "center";
            ctx.fillText(String(i + 1), padX + i * bw + bw / 2, barBottom + 9);
          }
        });
        ctx.strokeStyle = rgba(pal.line, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, barBottom + 0.5);
        ctx.lineTo(w - padX, barBottom + 0.5);
        ctx.stroke();

        // one simulated run, a square for each trade: a small one for a win, a full one for a loss
        const stripTop = barBottom + 38;
        label(ctx, pal);
        ctx.fillText(`ONE SIMULATED RUN · LONGEST LOSING STREAK: ${longest.length}`, padX, stripTop - 12);
        const W = w - padX * 2;
        const H = h - 10 - stripTop;
        if (H < 12) return;
        const cols = Math.max(1, Math.ceil(Math.sqrt((trades * W) / H)));
        const rows = Math.ceil(trades / cols);
        const size = Math.min(W / cols, H / rows);
        for (let i = 0; i < Math.min(shown, trades); i++) {
          const cx = padX + (i % cols) * size;
          const cy = stripTop + Math.floor(i / cols) * size;
          const inRun = longest.length > 0 && i >= longest.start && i < longest.start + longest.length;
          if (sample[i]) {
            const inset = size * 0.32;
            ctx.fillStyle = rgba(pal.teal, 0.75);
            ctx.fillRect(cx + inset, cy + inset, size - inset * 2, size - inset * 2);
          } else {
            const gap = Math.min(1, size * 0.1);
            ctx.fillStyle = inRun ? rgba(ALERT, 1) : rgba(pal.ink3, 0.55);
            ctx.fillRect(cx + gap, cy + gap, size - gap * 2, size - gap * 2);
          }
        }
        // a rule under the longest streak, so it is not told by colour alone
        if (longest.length > 0 && shown >= longest.start + longest.length) {
          ctx.strokeStyle = rgba(pal.ink, 1);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = longest.start; i < longest.start + longest.length; i++) {
            const cx = padX + (i % cols) * size;
            const cy = stripTop + Math.floor(i / cols) * size + size - 0.5;
            ctx.moveTo(cx + 1, cy);
            ctx.lineTo(cx + size - 1, cy);
          }
          ctx.stroke();
        }
      },
    [chances, sample, longest, trades, n],
  );

  const sentence = `With a win rate of ${win}%, the chance of at least ${n} losses in a row somewhere in ${trades} trades is ${chance(p)}. In the simulated run below the bars, the longest losing streak was ${longest.length}.`;

  return (
    <div>
      <Stage draw={draw} ratio={1.35} rev={run * 1e7 + win * 1e5 + trades * 100 + n} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {sentence}
      </p>
      <Facts
        items={[
          [`At least ${n} in a row`, chance(p)],
          ["Longest in this run", String(longest.length)],
        ]}
      />
      <div className="grid gap-x-21 sm:grid-cols-2">
        <Slider label="Win rate" value={win} min={20} max={80} onChange={setWin} text={`${win}%`} />
        <Slider label="Number of trades" value={trades} min={10} max={200} step={10} onChange={setTrades} text={String(trades)} />
        <Slider label="Losses in a row" value={n} min={2} max={S_MAX} onChange={setN} text={`at least ${n}`} />
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
          Another run
        </button>
      </div>
      <Note>
        The method: keep the chance of each possible length of the losing run a sequence currently ends on (0 up to {n - 1}), and one more for “the streak has happened”. Each trade, a win sends every length back to 0 and a loss moves it one along; a loss from {n - 1} lands in “happened”, which nothing leaves. After {trades} trades that number is the answer. It is exact, not an estimate.
      </Note>
      <Note>It assumes each trade is independent with the same odds. Real losses tend to cluster more than this, because the conditions that cause one often cause the next.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 4. CORRELATION — two to four invented holdings, held in equal shares. The
 *    slider sets how closely each pair moves together. The combined swing is
 *    arithmetic; the paths are one seeded draw that has that correlation.
 * ------------------------------------------------------------------------- */

const C_HOLDINGS = [
  { name: "A", sd: 10 },
  { name: "B", sd: 14 },
  { name: "C", sd: 8 },
  { name: "D", sd: 12 },
] as const;
const C_STEPS = 160;
const C_SECONDS = 4;
const holdingColours = (pal: Palette): Colour[] => [pal.teal, pal.gold, pal.accent, AMBER];
const minus = (v: number, d = 2) => `${v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;

export function Correlation() {
  const uid = useId();
  const [count, setCount] = useState(2);
  /** the correlation in twentieths, so the slider's steps are whole numbers */
  const [rho20, setRho20] = useState(6);
  const [seed, setSeed] = useState(2027);
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const rho = rho20 / 20;
  const sds = useMemo(() => C_HOLDINGS.slice(0, count).map((x) => x.sd), [count]);
  const paths = useMemo(() => correlatedPaths(seed, sds, rho, C_STEPS), [seed, sds, rho]);
  const combined = combinedSd(sds, rho);
  const average = sds.reduce((a, b) => a + b, 0) / sds.length;
  const pair = combinedSd([C_HOLDINGS[0].sd, C_HOLDINGS[1].sd], rho);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : clamp((t - playFrom.current) / C_SECONDS);
        const upto = Math.max(1, Math.round(p * C_STEPS));
        const padX = 10;
        const top = 42;
        const bottom = h - 12;
        let lo = 0;
        let hi = 0;
        for (const s of paths.parts) for (const v of s) {
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        const pad = (hi - lo || 1) * 0.06;
        const x = (i: number) => lerp(padX, w - padX, i / C_STEPS);
        const y = (v: number) => lerp(bottom, top, (v - (lo - pad)) / (hi - lo + pad * 2 || 1));
        const colours = holdingColours(pal);

        label(ctx, pal);
        ctx.fillText("INVENTED HOLDINGS · EQUAL SHARES", padX, 11);
        let kx = padX;
        const key = (name: string, colour: Colour, width: number) => {
          ctx.strokeStyle = rgba(colour, 1);
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(kx, 27);
          ctx.lineTo(kx + 14, 27);
          ctx.stroke();
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(name, kx + 18, 27);
          kx += 28 + ctx.measureText(name).width;
        };
        paths.parts.forEach((_, i) => key(C_HOLDINGS[i]!.name, colours[i]!, 1.2));
        key("COMBINED", pal.ink, 2.4);

        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.beginPath();
        ctx.moveTo(padX, y(0));
        ctx.lineTo(w - padX, y(0));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineJoin = "round";
        const line = (s: number[], colour: string, width: number) => {
          ctx.strokeStyle = colour;
          ctx.lineWidth = width;
          ctx.beginPath();
          for (let i = 0; i <= upto; i++) {
            if (i === 0) ctx.moveTo(x(i), y(s[i]!));
            else ctx.lineTo(x(i), y(s[i]!));
          }
          ctx.stroke();
        };
        paths.parts.forEach((s, i) => line(s, rgba(colours[i]!, 0.9), 1.2));
        line(paths.combined, rgba(pal.ink, 1), 2.4);
      },
    [paths],
  );

  const sentence =
    Math.abs(combined - average) < 0.005
      ? `${count} invented holdings in equal shares with a correlation of ${minus(rho)}: the combined swing is ${combined.toFixed(1)} points a step, the same as the average of the parts. Holdings that move as one give no relief.`
      : `${count} invented holdings in equal shares with a correlation of ${minus(rho)}: the combined swing is ${combined.toFixed(1)} points a step against ${average.toFixed(1)} for the average of the parts, ${pct(combined / average, 0)} of it. The less they move together, the more their swings cancel.`;

  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={run * 1e6 + count * 1e3 + (rho20 + 10)} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {sentence}
      </p>
      <Facts
        items={[
          ["Combined swing", combined.toFixed(1)],
          ["Average of the parts", average.toFixed(1)],
          ["Combined ÷ average", pct(combined / average, 0)],
          ["Correlation", minus(rho)],
        ]}
      />
      <div className="mt-13">
        <p className="label" id={`${uid}-n`}>
          Holdings (each one invented)
        </p>
        <div className="mt-5 flex flex-wrap gap-5" role="group" aria-labelledby={`${uid}-n`}>
          {[2, 3, 4].map((k) => (
            <button key={k} type="button" className={`btn btn-ghost btn-sm min-h-[2.75rem] min-w-[2.75rem] ${count === k ? "border-accent text-ink" : ""}`} aria-pressed={count === k} onClick={() => setCount(k)}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <Slider label="How closely they move together" value={rho20} min={-6} max={20} onChange={setRho20} text={`correlation ${minus(rho)}`} />
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
      </div>
      <p className="mt-13 text-sm text-ink-2">
        For two holdings: <span className="num text-ink">σ = √(w₁²σ₁² + w₂²σ₂² + 2·w₁·w₂·ρ·σ₁·σ₂)</span>. With A and B alone, half each:{" "}
        <span className="num text-ink">
          √(0.25 × {C_HOLDINGS[0].sd}² + 0.25 × {C_HOLDINGS[1].sd}² + 2 × 0.25 × {minus(rho)} × {C_HOLDINGS[0].sd} × {C_HOLDINGS[1].sd}) = {pair.toFixed(1)}
        </span>
        .
      </p>
      <Note>
        Swings (standard deviations) of one step, in invented points: {C_HOLDINGS.slice(0, count).map((x) => `${x.name} ${x.sd}`).join(", ")}. σ is a swing, w a share of the whole and ρ the correlation. With more than two holdings the same sum runs over every pair. The slider stops at −0.30 because four holdings cannot all move against one another by more than −0.33.
      </Note>
      <Note>The combined swing is arithmetic; the paths are one simulated draw with that correlation. Real correlations are not fixed: holdings that moved apart in calm periods have often fallen together under stress.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 5. RECOVERY ARITHMETIC — a loss of x leaves 1 − x, so getting back takes a
 *    gain of x ÷ (1 − x) on what is left. The bar falls and must climb back;
 *    the curve beside it shows the gain needed for every loss on the slider.
 * ------------------------------------------------------------------------- */

const V_CYCLE = 6;

export function Recovery() {
  const [loss, setLoss] = useState(50);
  const x = loss / 100;
  const gain = recoveryGain(x);
  const gainText = `${(gain * 100).toFixed(gain < 1 ? 1 : 0)}%`;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const padX = 10;
        const top = 30;
        const base = h - 24;
        const full = base - top;
        const barX = padX + 6;
        const barW = Math.min(64, w * 0.15);

        // the bar: it falls, waits, and climbs back
        const u = (t % V_CYCLE) / V_CYCLE;
        const level = still ? 1 - x : u < 0.3 ? lerp(1, 1 - x, smooth(u / 0.3)) : u < 0.42 ? 1 - x : u < 0.85 ? lerp(1 - x, 1, smooth((u - 0.42) / 0.43)) : 1;
        const climbing = !still && u >= 0.42;
        const yOf = (v: number) => base - v * full;

        label(ctx, pal);
        ctx.fillText(`LOSS ${loss}% · GAIN NEEDED ${gainText}`, padX, 11);

        // what was lost and is not yet back
        ctx.fillStyle = rgba(ALERT, 0.2);
        ctx.fillRect(barX, yOf(1), barW, yOf(level) - yOf(1));
        // what is left after the loss
        ctx.fillStyle = rgba(pal.ink2, 0.85);
        const held = climbing ? Math.min(level, 1 - x) : level;
        ctx.fillRect(barX, yOf(held), barW, held * full);
        // what has been regained
        if (level > 1 - x && climbing) {
          ctx.fillStyle = rgba(pal.emerald, 0.9);
          ctx.fillRect(barX, yOf(level), barW, (level - (1 - x)) * full);
        }
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = rgba(pal.ink3, 1);
        ctx.lineWidth = 1;
        ctx.strokeRect(barX + 0.5, yOf(1) + 0.5, barW - 1, full - 1);
        ctx.setLineDash([]);
        label(ctx, pal);
        ctx.textAlign = "center";
        ctx.fillText("100", barX + barW / 2, yOf(1) - 8);
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(still ? `${100 - loss} LEFT` : climbing ? (level >= 1 ? `+${gainText}` : "CLIMBING") : `−${loss}%`, barX + barW / 2, base + 12);

        // the curve: the gain needed for every loss from 5% to 90%
        const cx0 = barX + barW + 34;
        const cx1 = w - padX - 4;
        if (cx1 - cx0 < 60) return;
        const px = (l: number) => lerp(cx0, cx1, (l - 0.05) / 0.85);
        const py = (g: number) => lerp(base, top, g / 9);
        ctx.strokeStyle = rgba(pal.line, 1);
        ctx.beginPath();
        ctx.moveTo(cx0, base + 0.5);
        ctx.lineTo(cx1, base + 0.5);
        ctx.stroke();
        // the line a gain equal to the loss would follow
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.beginPath();
        ctx.moveTo(px(0.05), py(0.05));
        ctx.lineTo(px(0.9), py(0.9));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 1.7;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let l = 5; l <= 90; l++) {
          if (l === 5) ctx.moveTo(px(l / 100), py(recoveryGain(l / 100)));
          else ctx.lineTo(px(l / 100), py(recoveryGain(l / 100)));
        }
        ctx.stroke();
        // the chosen loss
        const mx = px(x);
        const my = py(gain);
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.moveTo(mx, base);
        ctx.lineTo(mx, my);
        ctx.lineTo(cx0, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(pal.accent, 1);
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, TAU);
        ctx.fill();
        label(ctx, pal);
        ctx.fillText("LOSS 5%", cx0, base + 12);
        ctx.textAlign = "right";
        ctx.fillText("90%", cx1, base + 12);
        ctx.fillText("GAIN NEEDED 900%", cx1, top - 8);
      },
    [x, loss, gain, gainText],
  );

  return (
    <div>
      <Stage draw={draw} ratio={1.7} rev={loss} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        A loss of {loss}% leaves {100 - loss} of every 100. To be back at 100, what is left must gain {gainText}: {loss} ÷ (100 − {loss}) = {gain.toFixed(gain < 1 ? 3 : 2)}.
      </p>
      <Facts
        items={[
          ["Loss", `${loss}%`],
          ["Gain needed", gainText],
        ]}
      />
      <Slider label="The loss" value={loss} min={5} max={90} onChange={setLoss} text={`${loss}%`} />
      <Note>Gain needed = loss ÷ (1 − loss), with the loss as a fraction. The dotted line is where a gain equal to the loss would sit; the solid curve leaves it further behind the deeper the loss.</Note>
      <Note>Arithmetic, not a forecast. It says how far there is to climb, not whether or how soon a climb comes.</Note>
    </div>
  );
}
