"use client";

import { useState } from "react";
import { clamp, rgba, smooth, TAU, type FigureDraw } from "@/components/figures/Figure";
import { Stage } from "@/components/labs/kit";
import { fmt, parse } from "./calc";
import { fibLevels, revOf, typedDecimals, type FibDirection, type FibLevel } from "./levels";
import { DASH, Figure, Headline, Inputs, NumField, Outcome, Seg, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Fibonacci levels: the retracement and extension prices of one swing, from
 * its high, its low and the direction it ran. The arithmetic is in
 * ./levels.ts (pure, checked by hand); this file is the inputs, the working
 * and the drawing.
 *
 * The rule it keeps: the levels are fractions of a move that has already
 * happened. Whether they have predictive value is a separate question, and
 * the page answers it in the words the site's corrected articles use: the
 * evidence for it is weak and disputed. Nothing is stored; the starting
 * figures are an example, labelled as one.
 */

/** The sentence used in the corrected articles (scripts/editorial-fixes.json), kept word for word. */
const EVIDENCE =
  "Whether the levels have predictive value is a separate question: the evidence for it is weak and disputed, and part of what is seen near a level may simply be that many traders are watching the same lines. The levels are reference points, not forecasts.";

function LevelTable({ caption, head, levels, px }: { caption: string; head: string; levels: (Omit<FibLevel, "price"> & { price: number | null })[]; px: (n: number) => string }) {
  return (
    <div className="scroll-x mt-13">
      <table className="table-gx min-w-[18rem]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{head}</th>
            <th scope="col" className="!pr-0 !text-right">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr key={l.label}>
              <th scope="row" className="!border-line !text-sm !font-normal !normal-case !tracking-normal !text-ink">
                <span className={`num block ${l.ratio === 0.618 || l.ratio === 1.618 ? "font-semibold text-prestige-ink" : ""}`}>{l.label}</span>
                <span className="mt-2 block text-xs text-ink-3">{l.origin}</span>
              </th>
              <td className="num !pr-0 text-right align-top text-[0.9375rem] font-medium">{l.price !== null ? px(l.price) : DASH}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FibonacciLevels({ meta }: ToolProps) {
  // an example swing, so that the working is visible on arrival; it is no market's price
  const [highRaw, setHigh] = useState("1.1000");
  const [lowRaw, setLow] = useState("1.0000");
  const [direction, setDirection] = useState<FibDirection>("up");

  const high = parse(highRaw, { label: "Swing high", gt: 0, max: 1e9 });
  const low = parse(lowRaw, { label: "Swing low", gt: 0, max: 1e9 });
  const lowError = low.error ?? (high.ok && low.ok && !(low.n < high.n) ? "The swing low must be below the swing high." : undefined);
  const ready = high.ok && low.ok && !lowError;

  const dp = clamp(Math.max(typedDecimals(highRaw), typedDecimals(lowRaw)), 0, 7);
  const px = (n: number) => fmt(n, dp, dp + 1);
  const r = ready ? fibLevels(high.n, low.n, direction) : null;
  const up = direction === "up";
  const blank = fibLevels(2, 1, direction);

  const steps: Step[] | null = r
    ? [
        { what: "Size of the move (high − low)", calc: `${px(high.n)} − ${px(low.n)} = ${px(r.range)}` },
        ...r.retracements.map((l) => ({
          what: `${l.label} retracement: ${up ? "back down from the high" : "back up from the low"}`,
          calc: up ? `${px(high.n)} − ${px(r.range)} × ${l.ratio} = ${px(l.price)}` : `${px(low.n)} + ${px(r.range)} × ${l.ratio} = ${px(l.price)}`,
        })),
        ...r.extensions.map((l) => ({
          what: `${l.label} extension: ${up ? "up from the low, past the high" : "down from the high, past the low"}`,
          calc: up ? `${px(low.n)} + ${px(r.range)} × ${l.ratio} = ${px(l.price)}` : `${px(high.n)} − ${px(r.range)} × ${l.ratio} = ${px(l.price)}`,
        })),
      ]
    : null;

  const golden = r?.retracements.find((l) => l.ratio === 0.618);
  const half = r?.retracements.find((l) => l.ratio === 0.5);
  const sentence =
    r && golden && half
      ? `The move ran ${up ? "up" : "down"} from ${px(up ? low.n : high.n)} to ${px(up ? high.n : low.n)}. Its retracement levels lie between ${px(r.retracements[0].price)} (23.6%) and ${px(r.retracements[r.retracements.length - 1].price)} (78.6%), with 50% at ${px(half.price)} and 61.8% at ${px(golden.price)}; its extension levels lie ${up ? "above the high" : "below the low"}, from ${px(r.extensions[0].price)} to ${px(r.extensions[r.extensions.length - 1].price)}.`
      : "Enter the high and the low of one swing, and the direction it ran, to see its levels drawn.";

  // a new function each render: the Figure host always calls the latest, and `rev` redraws the still frame
  const [H, L] = [high.n, low.n];
  const draw: FigureDraw = (f) => {
    const { ctx, w, h, t, pal } = f;
    if (w < 100 || h < 60) return;
    if (!r) return;
    const prices = [...r.retracements, ...r.extensions].map((l) => l.price);
    const hi = Math.max(H, ...prices);
    const lo = Math.min(L, ...prices);
    if (!(hi > lo)) return;
    const small = w < 360;
    const top = 16;
    const bottom = 16;
    const y = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bottom);
    const xa = Math.max(14, w * 0.05);
    const xb = xa + (w - xa) * 0.34;
    const x1 = w - (small ? 44 : 52);
    const [ya, yb] = up ? [y(L), y(H)] : [y(H), y(L)];
    ctx.lineCap = "round";
    ctx.font = `600 ${small ? 9 : 10}px ${pal.font}`;
    ctx.textBaseline = "middle";

    const all = [
      ...r.retracements.map((l) => ({ ...l, ext: false })),
      ...r.extensions.map((l) => ({ ...l, ext: true })),
    ];
    let nearest = -1;
    if (f.hover > 0.02) {
      let best = Infinity;
      all.forEach((l, i) => {
        const d = Math.abs(f.my - y(l.price));
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
    }

    // the two ends of the swing, as plain rules: 0% and 100% of the move
    const ends = smooth(f.enter * 2);
    ctx.strokeStyle = rgba(pal.ink3, 0.55 * ends);
    ctx.lineWidth = 1;
    for (const v of [H, L]) {
      ctx.beginPath();
      ctx.moveTo(xa, y(v));
      ctx.lineTo(x1, y(v));
      ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = rgba(pal.ink3, ends);
    ctx.fillText(up ? "HIGH" : "LOW", x1 + 7, yb);
    ctx.fillText(up ? "LOW" : "HIGH", x1 + 7, ya);

    // the levels across the swing: retracements as full lines, extensions dashed, beyond the end of the move
    all.forEach((l, i) => {
      const grow = smooth(clamp(f.enter * 1.9 - 0.25 - i * 0.07));
      if (grow <= 0) return;
      const lit = i === nearest ? f.hover : 0;
      const yy = y(l.price);
      const gold = l.ratio === 0.618 || l.ratio === 1.618;
      const colour = gold ? pal.gold : !l.fibonacci ? pal.ink2 : l.ext ? pal.teal : pal.accent;
      ctx.setLineDash(l.ext ? [5, 4] : !l.fibonacci ? [2, 3] : []);
      ctx.strokeStyle = rgba(colour, (gold ? 0.95 : 0.6) + 0.35 * lit);
      ctx.lineWidth = (gold ? 1.7 : 1.1) + lit;
      ctx.beginPath();
      ctx.moveTo(xa, yy);
      ctx.lineTo(xa + (x1 - xa) * grow, yy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.fillStyle = rgba(gold ? pal.gold : pal.ink2, grow * (0.75 + 0.25 * lit));
      ctx.fillText(l.label, x1 + 7, yy);
      // the lit line says its price: the same figure as in the table below
      if (lit > 0.05) {
        ctx.textAlign = "right";
        ctx.fillStyle = rgba(pal.ink, lit);
        ctx.fillText(px(l.price), x1 - 4, yy - 9);
      }
    });

    // the swing itself, drawn from its start to its end
    const run = smooth(f.enter * 1.6);
    ctx.strokeStyle = rgba(pal.ink, 0.95);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(xa, ya);
    ctx.lineTo(xa + (xb - xa) * run, ya + (yb - ya) * run);
    ctx.stroke();
    for (const [x, yy] of [[xa, ya], [xa + (xb - xa) * run, ya + (yb - ya) * run]]) {
      ctx.fillStyle = rgba(pal.ink, 1);
      ctx.beginPath();
      ctx.arc(x, yy, 3, 0, TAU);
      ctx.fill();
    }

    // a point of light runs the move again, slowly
    if (!f.still) {
      const u = (t * 0.12) % 1;
      const fade = Math.sin(Math.PI * u) * smooth(f.enter * 1.5 - 0.4);
      const lx = xa + (xb - xa) * u;
      const ly = ya + (yb - ya) * u;
      ctx.fillStyle = rgba(pal.gold, 0.22 * fade);
      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(pal.gold, fade);
      ctx.beginPath();
      ctx.arc(lx, ly, 2.2, 0, TAU);
      ctx.fill();
    }
  };

  return (
    <ToolLayout
      meta={meta}
      steps={steps}
      assumptions={[
        EVIDENCE,
        "The levels depend entirely on which high and which low you choose. Two people looking at the same chart often pick different swings and so draw different lines.",
        "A retracement is measured back from the end of the move. An extension here is measured from the start of the move and lies beyond its end; the three-point extension tool on a trading platform projects from a later point instead and gives different prices.",
        "50% is not a Fibonacci ratio. It is included because chart users draw it by convention.",
        "The starting figures are an example, not a market’s price. Replace them with the swing you are looking at.",
      ]}
    >
      <Inputs legend="One swing">
        <NumField id="fib-high" label="Swing high" value={highRaw} onChange={setHigh} error={high.error} hint="The highest price of the move." />
        <NumField id="fib-low" label="Swing low" value={lowRaw} onChange={setLow} error={lowError} hint="The lowest price of the move." />
        <Seg
          label="Direction of the move"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "up", label: "Up: low to high" },
            { value: "down", label: "Down: high to low" },
          ]}
          className="sm:col-span-2"
        />
      </Inputs>

      <Outcome>
        <div className="grid gap-21 sm:grid-cols-2">
          <Headline label="Size of the move" value={r ? px(r.range) : DASH} sub={r ? `${px(high.n)} − ${px(low.n)}` : "Complete the inputs above."} />
          <Headline label="61.8% retracement" value={golden ? px(golden.price) : DASH} sub={r ? (up ? "measured down from the high" : "measured up from the low") : undefined} />
        </div>

        <Figure caption="A drawing of your own figures: the swing at the left and each level as a line across it, to scale. Retracements are full lines inside the move; extensions are dashed, beyond its end. Point at a line to read its price.">
          <Stage draw={draw} ratio={1.25} rev={revOf(`${direction}|${highRaw}|${lowRaw}`)} />
        </Figure>
        <p aria-live="polite" className="mt-8 text-sm text-ink-2">
          {sentence}
        </p>

        <h3 className="h4 mt-34">Retracement levels</h3>
        <p className="mt-5 text-sm text-ink-3">Fractions of the move, measured back from where it ended. Under each ratio is where the number comes from.</p>
        <LevelTable caption="Retracement levels of the swing: each ratio, where it comes from, and its price" head="Ratio" levels={r ? r.retracements : blank.retracements.map((l) => ({ ...l, price: null }))} px={px} />

        <h3 className="h4 mt-34">Extension levels</h3>
        <p className="mt-5 text-sm text-ink-3">Multiples of the move, measured from where it began, so each lies beyond where it ended.</p>
        <LevelTable caption="Extension levels of the swing: each ratio, where it comes from, and its price" head="Ratio" levels={r ? r.extensions : blank.extensions.map((l) => ({ ...l, price: null }))} px={px} />

        <SimulationNote>{EVIDENCE}</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
