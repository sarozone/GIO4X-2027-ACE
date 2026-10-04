"use client";

import { useId, useMemo, useRef, useState } from "react";
import { clamp, lerp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Note, Slider, Stage } from "@/components/labs/kit";
import { BENCH, DEFAULT_RULE, ENTRIES, LIMITS, MARKETS, inWords, makeBars, marketOf, others, runTest, sma, tidy, type Direction, type EntryKey, type MarketKey, type Rule, type Trade } from "./strategy";

/**
 * THE RULE BENCH — build a trading rule from parts and try it on invented prices.
 *
 * A visitor chooses one of six invented markets (one for each kind of
 * instrument the site describes), a rule for getting in, a stop, a target and
 * how much to risk. The bench runs it over one invented market and draws what
 * happened, then runs the same rule over forty other market numbers and shows
 * all forty results side by side.
 *
 * That second picture is the point. These prices are a seeded random walk:
 * nothing can be known about where they go next, so no rule has an edge on
 * them, and a rule that looks good on one market is simply one that was lucky
 * there. The bench teaches how a test works and how easily one result
 * misleads. It cannot say anything about a real market, and it says so.
 *
 * Everything is computed in the browser (./strategy.ts); nothing is sent or
 * stored.
 */

const PLAY_SECONDS = 5;

const fmt = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const REASON: Record<Trade["reason"], string> = { stop: "stop", target: "target", signal: "opposite signal", end: "end of the test" };

export function RuleBench() {
  const uid = useId();
  const [market, setMarket] = useState<MarketKey>("pair");
  const [seed, setSeed] = useState<number>(BENCH.defaultSeed);
  const [rule, setRule] = useState<Rule>(DEFAULT_RULE);
  /** rises on every change, so the chart is drawn again from the left */
  const [run, setRun] = useState(0);
  const playFrom = useRef(-1);

  const change = (patch: Partial<Rule>) => {
    setRule((r) => tidy({ ...r, ...patch }));
    again();
  };
  const again = () => {
    playFrom.current = -1;
    setRun((n) => n + 1);
  };

  const m = marketOf(market);
  const bars = useMemo(() => makeBars(m, seed), [m, seed]);
  const test = useMemo(() => runTest(m, bars, rule), [m, bars, rule]);
  const spread = useMemo(() => others(m, seed, rule), [m, seed, rule]);
  const lines = useMemo(() => {
    if (rule.entry !== "cross") return null;
    const closes = bars.map((b) => b.c);
    return { fast: sma(closes, rule.fast), slow: sma(closes, rule.slow) };
  }, [bars, rule.entry, rule.fast, rule.slow]);

  const s = test.stats;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 120 || h < 90) return;
        if (playFrom.current < 0) playFrom.current = t;
        const p = still ? 1 : clamp((t - playFrom.current) / PLAY_SECONDS);
        const n = bars.length;
        const shown = Math.max(2, Math.round(p * n));
        const padX = 10;
        const top = 22;
        const split = Math.round(h * 0.64);
        const eqTop = split + 22;
        const eqBottom = h - 10;
        const x = (i: number) => lerp(padX, w - padX, i / (n - 1));

        let lo = Infinity;
        let hi = -Infinity;
        for (const b of bars) {
          if (b.l < lo) lo = b.l;
          if (b.h > hi) hi = b.h;
        }
        const y = (v: number) => lerp(split - 8, top, (v - lo) / (hi - lo || 1));

        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText(`${m.name.toUpperCase()} · INVENTED PRICES · MARKET ${seed}`, padX, 10);
        ctx.fillText("EXAMPLE ACCOUNT", padX, split + 10);

        // the high-to-low range of each bar, then the closes
        ctx.strokeStyle = rgba(pal.ink3, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < shown; i++) {
          const b = bars[i]!;
          ctx.moveTo(x(i), y(b.h));
          ctx.lineTo(x(i), y(b.l));
        }
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 1.3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < shown; i++) {
          if (i === 0) ctx.moveTo(x(i), y(bars[i]!.c));
          else ctx.lineTo(x(i), y(bars[i]!.c));
        }
        ctx.stroke();

        if (lines) {
          for (const [series, colour] of [
            [lines.fast, pal.accent],
            [lines.slow, pal.gold],
          ] as const) {
            ctx.strokeStyle = rgba(colour, 0.95);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i < shown; i++) {
              const v = series[i];
              if (v == null) continue;
              if (!started) ctx.moveTo(x(i), y(v));
              else ctx.lineTo(x(i), y(v));
              started = true;
            }
            ctx.stroke();
          }
        }

        // each trade: a line from where it opened to where it closed, green for a gain and red for a loss
        for (const tr of test.trades) {
          if (tr.inBar >= shown) break;
          const end = Math.min(tr.outBar, shown - 1);
          const closed = tr.outBar < shown;
          const colour = !closed ? pal.ink2 : tr.pl >= 0 ? pal.emerald : ALERT;
          ctx.strokeStyle = rgba(colour, 0.9);
          ctx.lineWidth = 1.6;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x(tr.inBar), y(tr.entry));
          ctx.lineTo(x(end), y(closed ? tr.exit : bars[end]!.c));
          ctx.stroke();
          ctx.setLineDash([]);
          // a triangle that points the way the trade went
          const ax = x(tr.inBar);
          const ay = y(tr.entry);
          const d = tr.side === 1 ? -1 : 1;
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.beginPath();
          ctx.moveTo(ax, ay + d * 7);
          ctx.lineTo(ax - 4, ay - d * 1);
          ctx.lineTo(ax + 4, ay - d * 1);
          ctx.closePath();
          ctx.fill();
          if (closed) {
            ctx.fillStyle = rgba(colour, 1);
            ctx.beginPath();
            ctx.arc(x(tr.outBar), y(tr.exit), 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // the account underneath, against the line it began on
        let elo: number = BENCH.balance;
        let ehi: number = BENCH.balance;
        for (const e of test.equity) {
          if (e < elo) elo = e;
          if (e > ehi) ehi = e;
        }
        const pad = (ehi - elo || 1) * 0.08;
        const ey = (v: number) => lerp(eqBottom, eqTop, (v - (elo - pad)) / (ehi - elo + pad * 2 || 1));
        ctx.strokeStyle = rgba(pal.line, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, split);
        ctx.lineTo(w - padX, split);
        ctx.stroke();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        ctx.beginPath();
        ctx.moveTo(padX, ey(BENCH.balance));
        ctx.lineTo(w - padX, ey(BENCH.balance));
        ctx.stroke();
        ctx.setLineDash([]);
        const last = test.equity[shown - 1] ?? BENCH.balance;
        ctx.strokeStyle = rgba(last >= BENCH.balance ? pal.emerald : ALERT, 1);
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        for (let i = 0; i < shown; i++) {
          if (i === 0) ctx.moveTo(x(i), ey(test.equity[i]!));
          else ctx.lineTo(x(i), ey(test.equity[i]!));
        }
        ctx.stroke();
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.textAlign = "right";
        ctx.fillText(`${fmt(last)} ${BENCH.unit}`, w - padX, split + 10);
        ctx.textAlign = "left";
      },
    [bars, test, lines, m, seed],
  );

  const drawOthers = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, pal, enter }) => {
        if (w < 120 || h < 70) return;
        const nets = spread.nets;
        const reach = Math.max(1, ...nets.map((v) => Math.abs(v)), Math.abs(s.net));
        const padX = 10;
        const top = 22;
        const bottom = h - 10;
        const zero = (top + bottom) / 2;
        const half = (bottom - top) / 2;
        const bw = (w - padX * 2) / nets.length;
        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText(`THE SAME RULE ON ${nets.length} OTHER MARKETS · LOWEST TO HIGHEST`, padX, 10);
        nets.forEach((v, i) => {
          const len = (Math.abs(v) / reach) * half * enter;
          ctx.fillStyle = rgba(v >= 0 ? pal.emerald : ALERT, 0.9);
          ctx.fillRect(padX + i * bw + 1, v >= 0 ? zero - len : zero, Math.max(1, bw - 2), Math.max(1, len));
        });
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, zero);
        ctx.lineTo(w - padX, zero);
        ctx.stroke();
        // where the market on screen came out
        const my = zero - (s.net / reach) * half;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        ctx.moveTo(padX, my);
        ctx.lineTo(w - padX, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.textAlign = "right";
        ctx.fillText(`MARKET ${seed}`, w - padX, my + (s.net >= 0 ? -8 : 9));
        ctx.textAlign = "left";
      },
    [spread, s.net, seed],
  );

  const sentence =
    s.trades === 0
      ? `On market ${seed} the rule never traded: ${s.skipped ? "every signal came out smaller than the smallest size" : "it gave no signal in these bars"}. Change a part, or try another market.`
      : `On market ${seed} the rule made ${s.trades} trade${s.trades === 1 ? "" : "s"}: ${s.wins} gained and ${s.losses} lost. The example account went from ${fmt(BENCH.balance)} to ${fmt(s.endBalance)} ${BENCH.unit} (${signed(s.net)}), of which the spread took ${fmt(s.spread)}. At its worst it was ${pct(s.maxDrawdown)} below its peak.`;

  const verdict = `Now the same rule, unchanged, on ${spread.nets.length} other markets of the same kind: it gained on ${spread.gained} and lost on ${spread.lost}. The middle result was ${signed(spread.median)} ${BENCH.unit}, and the spread cost ${fmt(spread.meanCost)} on average. These prices are a random walk, so no rule can know where they go: what separates the gains from the losses here is luck, and the costs are the only certain part.`;

  const isRsi = rule.entry === "rsi";
  const isCross = rule.entry === "cross";

  return (
    <div>
      <div className="grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Stage draw={draw} ratio={1.5} rev={run} />
          <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
            {sentence}
          </p>
          <dl className="mt-13 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
            {[
              ["Trades", String(s.trades)],
              ["Gained", s.winRate === null ? "n/a" : pct(s.winRate)],
              ["Result", `${signed(s.net)}`],
              ["Deepest fall", pct(s.maxDrawdown)],
              ["Average gain", s.avgWin === null ? "n/a" : fmt(s.avgWin)],
              ["Average loss", s.avgLoss === null ? "n/a" : fmt(s.avgLoss)],
              ["Gains ÷ losses", s.profitFactor === null ? "n/a" : s.profitFactor.toFixed(2)],
              ["Losses in a row", String(s.worstRun)],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-13">
                <dt className="label">{k}</dt>
                <dd className="num mt-3 text-lg text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <Note>
            Figures are in {BENCH.unit}, an invented unit, on an example account of {fmt(BENCH.balance)}. {m.name}: {BENCH.bars} invented bars, a fixed spread of {m.spreadPts} points. Not a real instrument and not GIO4X’s trading conditions.
          </Note>
        </div>

        <div className="panel grid gap-13 p-21">
          <div>
            <p className="label" id={`${uid}-m`}>
              Market (each one invented)
            </p>
            <div className="mt-5 flex flex-wrap gap-5" role="group" aria-labelledby={`${uid}-m`}>
              {MARKETS.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  className={`btn btn-ghost btn-sm !normal-case ${market === x.key ? "border-accent text-ink" : ""}`}
                  aria-pressed={market === x.key}
                  onClick={() => {
                    setMarket(x.key);
                    again();
                  }}
                >
                  {x.kind}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor={`${uid}-e`}>Get in when</label>
            <select id={`${uid}-e`} className="select" value={rule.entry} onChange={(e) => change({ entry: e.target.value as EntryKey, fast: e.target.value === "rsi" ? 14 : 10 })}>
              {ENTRIES.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.name}
                </option>
              ))}
            </select>
            <p className="field-hint">{ENTRIES.find((e) => e.key === rule.entry)?.says}</p>
          </div>

          {(isCross || isRsi) && <Slider label={isRsi ? "RSI length" : "Fast average"} value={rule.fast} min={LIMITS.fast.min} max={LIMITS.fast.max} onChange={(v) => change({ fast: v })} text={`${rule.fast} bars`} />}
          {!isRsi && <Slider label={isCross ? "Slow average" : "Look back"} value={rule.slow} min={LIMITS.slow.min} max={LIMITS.slow.max} onChange={(v) => change({ slow: v })} text={`${rule.slow} bars`} />}
          <Slider label="Stop" value={rule.stopAtr} min={LIMITS.stopAtr.min} max={LIMITS.stopAtr.max} step={LIMITS.stopAtr.step} onChange={(v) => change({ stopAtr: v })} text={`${rule.stopAtr} average ranges away`} />
          <Slider label="Target" value={rule.targetR} min={LIMITS.targetR.min} max={LIMITS.targetR.max} step={LIMITS.targetR.step} onChange={(v) => change({ targetR: v })} text={rule.targetR === 0 ? "none" : `${rule.targetR} × the stop`} />
          <Slider label="Risk on each trade" value={rule.riskPct} min={LIMITS.riskPct.min} max={LIMITS.riskPct.max} step={LIMITS.riskPct.step} onChange={(v) => change({ riskPct: v })} text={`${rule.riskPct}% of the balance`} />

          <div className="field">
            <label htmlFor={`${uid}-d`}>Which way</label>
            <select id={`${uid}-d`} className="select" value={rule.direction} onChange={(e) => change({ direction: e.target.value as Direction })}>
              <option value="both">Long and short</option>
              <option value="long">Long only</option>
              <option value="short">Short only</option>
            </select>
          </div>
          <label className="check min-h-[2.75rem] items-center">
            <input type="checkbox" checked={rule.fade} onChange={(e) => change({ fade: e.target.checked })} />
            <span>Do the opposite of the rule</span>
          </label>

          <div className="flex flex-wrap gap-8 border-t border-line pt-13">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // a new market number, drawn on a click and never while rendering
                setSeed(1 + Math.floor(Math.random() * 99999));
                again();
              }}
            >
              Another market
            </button>
            <button type="button" className="btn btn-ghost" onClick={again}>
              Play again
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setRule(DEFAULT_RULE);
                setSeed(BENCH.defaultSeed);
                setMarket("pair");
                again();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-34 border-t border-line pt-21">
        <p className="eyebrow">The rule, in words</p>
        <p className="mt-8 max-w-measure font-display text-lg text-ink">{inWords(rule)}</p>
      </div>

      <div className="mt-34 grid items-start gap-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Stage draw={drawOthers} ratio={2.4} rev={run} />
        </div>
        <div>
          <p className="eyebrow">One result is not a finding</p>
          <p className="mt-8 text-ink-2" aria-live="polite">
            {verdict}
          </p>
        </div>
      </div>

      {s.trades > 0 && (
        <details className="mt-21">
          <summary className="link cursor-pointer text-sm">Every trade on market {seed}</summary>
          <div className="mt-13 overflow-x-auto">
            <table className="table-gx w-full min-w-[34rem] text-sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Side</th>
                  <th scope="col" className="num">
                    Lots
                  </th>
                  <th scope="col" className="num">
                    In
                  </th>
                  <th scope="col" className="num">
                    Out
                  </th>
                  <th scope="col">Closed by</th>
                  <th scope="col" className="num">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {test.trades.map((tr, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{tr.side === 1 ? "Long" : "Short"}</td>
                    <td className="num-right">{tr.lots.toFixed(2)}</td>
                    <td className="num-right">{tr.entry.toFixed(m.digits)}</td>
                    <td className="num-right">{tr.exit.toFixed(m.digits)}</td>
                    <td>
                      {REASON[tr.reason]}
                      {tr.gapped ? " (after a gap)" : ""}
                    </td>
                    <td className="num-right">{signed(tr.pl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
