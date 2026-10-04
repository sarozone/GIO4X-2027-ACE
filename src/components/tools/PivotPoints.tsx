"use client";

import { useState } from "react";
import { clamp, rgba, smooth, TAU, type FigureDraw } from "@/components/figures/Figure";
import { Stage } from "@/components/labs/kit";
import { fmt, parse } from "./calc";
import { PIVOT_VARIANTS, pivots, revOf, typedDecimals, type PivotVariant } from "./levels";
import { DASH, Figure, Headline, Inputs, NumField, Outcome, SelectField, SimulationNote, ToolLayout, type Step, type ToolProps } from "./ui";

/**
 * Pivot points: the levels worked from one finished bar's high, low and close,
 * in four conventions. The arithmetic is in ./levels.ts (pure, checked by
 * hand); this file is the inputs, the working and the drawing.
 *
 * The rule it keeps: the levels are arithmetic on one past bar. They are a
 * convention many traders watch, never a forecast, and the page says so
 * beside the result. Nothing is stored and nothing is a live price: the
 * starting figures are an example, labelled as one.
 */

/** Put the visitor's numbers into a formula written in symbols: "2P − L" → "2 × 1.1000 − 1.0950". */
function substitute(formula: string, values: Record<"H" | "L" | "C" | "P", string>): string {
  return formula
    .replace(/(\d)\(/g, "$1 × (")
    .replace(/(\d)([HLCP])/g, "$1 × $2")
    .replace(/[HLCP]/g, (m) => values[m as "H" | "L" | "C" | "P"]);
}

export function PivotPoints({ meta }: ToolProps) {
  // an example bar, so that the working is visible on arrival; it is no market's price
  const [highRaw, setHigh] = useState("1.1050");
  const [lowRaw, setLow] = useState("1.0950");
  const [closeRaw, setClose] = useState("1.1000");
  const [variant, setVariant] = useState<PivotVariant>("classic");

  const high = parse(highRaw, { label: "High", gt: 0, max: 1e9 });
  const low = parse(lowRaw, { label: "Low", gt: 0, max: 1e9 });
  const close = parse(closeRaw, { label: "Close", gt: 0, max: 1e9 });
  const lowError = low.error ?? (high.ok && low.ok && !(low.n < high.n) ? "The low must be below the high." : undefined);
  const closeError = close.error ?? (high.ok && low.ok && close.ok && low.n < high.n && (close.n < low.n || close.n > high.n) ? "The close of a bar lies between its low and its high." : undefined);
  const ready = high.ok && low.ok && close.ok && !lowError && !closeError;

  const dp = clamp(Math.max(typedDecimals(highRaw), typedDecimals(lowRaw), typedDecimals(closeRaw)), 0, 7);
  const px = (n: number) => fmt(n, dp, dp + 1);
  const r = ready ? pivots(high.n, low.n, close.n, variant) : null;
  const chosen = PIVOT_VARIANTS.find((v) => v.key === variant) ?? PIVOT_VARIANTS[0];

  const values = r ? { H: px(high.n), L: px(low.n), C: px(close.n), P: px(r.p) } : null;
  const steps: Step[] | null =
    r && values
      ? // the pivot first, then each pair outwards from it, as the formulas are usually read
        [...r.levels.filter((l) => l.side === "p"), ...r.levels.filter((l) => l.side !== "p").sort((a, b) => Number(a.key.slice(1)) - Number(b.key.slice(1)) || (a.side === "r" ? -1 : 1))].map((l) => ({
          what: `${l.key} = ${l.formula}`,
          calc: `${substitute(l.formula, values)} = ${px(l.price)}`,
        }))
      : null;

  const resistances = r ? r.levels.filter((l) => l.side === "r") : [];
  const supports = r ? r.levels.filter((l) => l.side === "s") : [];
  const list = (xs: { price: number }[]) => xs.map((l) => px(l.price)).join(", ");
  const sentence = r
    ? `With the ${chosen.name} formulas the pivot is ${px(r.p)}. Resistance levels, from the highest: ${list(resistances)}. Support levels, from the nearest: ${list(supports)}. The bar at the left is the one you entered.`
    : "Enter the high, the low and the close of one finished bar to see its pivot levels drawn.";

  // a new function each render: the Figure host always calls the latest, and `rev` redraws the still frame
  const levels = r ? r.levels : [];
  const [H, L, C] = [high.n, low.n, close.n];
  const draw: FigureDraw = (f) => {
    const { ctx, w, h, t, pal } = f;
    if (w < 100 || h < 60) return;
    if (levels.length === 0) return;
    const hi = Math.max(H, levels[0].price);
    const lo = Math.min(L, levels[levels.length - 1].price);
    if (!(hi > lo)) return;
    const top = 16;
    const bottom = 16;
    const y = (v: number) => top + ((hi - v) / (hi - lo)) * (h - top - bottom);
    const barX = Math.max(22, w * 0.08);
    const x0 = barX + 26;
    const x1 = w - 34;
    const small = w < 360;
    ctx.lineCap = "round";

    // which line the pointer is nearest
    let nearest = -1;
    if (f.hover > 0.02) {
      let best = Infinity;
      levels.forEach((l, i) => {
        const d = Math.abs(f.my - y(l.price));
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
    }

    // the previous bar: its range, and a tick at the close
    const barOn = smooth(f.enter * 2);
    ctx.strokeStyle = rgba(pal.ink, 0.9 * barOn);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, y(H));
    ctx.lineTo(barX, y(H) + (y(L) - y(H)) * barOn);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(barX, y(C));
    ctx.lineTo(barX + 9, y(C));
    ctx.stroke();
    ctx.font = `600 ${small ? 9 : 10}px ${pal.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = rgba(pal.ink3, barOn);
    ctx.fillText("H", barX, y(H) - 9);
    ctx.fillText("L", barX, y(L) + 10);
    ctx.textAlign = "left";
    ctx.fillText("C", barX + 12, y(C));

    // the levels, drawn across from the bar: the pivot first, the others after it
    const mid = levels.findIndex((l) => l.side === "p");
    levels.forEach((l, i) => {
      const rank = Math.abs(i - mid);
      const grow = smooth(clamp(f.enter * 1.9 - rank * 0.16));
      if (grow <= 0) return;
      const lit = i === nearest ? f.hover : 0;
      const yy = y(l.price);
      const colour = l.side === "p" ? pal.gold : l.side === "r" ? pal.accent : pal.teal;
      ctx.strokeStyle = rgba(colour, (l.side === "p" ? 0.95 : 0.6) + 0.35 * lit);
      ctx.lineWidth = (l.side === "p" ? 1.8 : 1.1) + lit;
      ctx.beginPath();
      ctx.moveTo(x0, yy);
      ctx.lineTo(x0 + (x1 - x0) * grow, yy);
      ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillStyle = rgba(l.side === "p" ? pal.gold : pal.ink2, grow * (0.75 + 0.25 * lit));
      ctx.fillText(l.key, x1 + 7, yy);
      // the lit line says its price: the same figure as in the table below
      if (lit > 0.05) {
        ctx.textAlign = "right";
        ctx.fillStyle = rgba(pal.ink, lit);
        ctx.fillText(px(l.price), x1 - 4, yy - 9);
      }
    });

    // a point of light travels along the pivot: where the eye is meant to start
    if (!f.still && mid >= 0) {
      const u = (t * 0.11) % 1;
      const lx = x0 + (x1 - x0) * u;
      const ly = y(levels[mid].price);
      const fade = Math.sin(Math.PI * u) * smooth(f.enter * 1.5 - 0.4);
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
        "Pivot levels are arithmetic on one past bar. They are a convention many traders watch, not a forecast: nothing in the calculation knows what the price will do next.",
        "The bar is yours to choose. Daily pivots use the previous day’s high, low and close; a platform’s day begins and ends on its server’s clock, so two platforms can give different levels for the same market.",
        "The formula panel above shows the classic set. The other three are written out, with your numbers in them, when you choose them.",
        "The starting figures are an example, not a market’s price. Replace them with the bar you are looking at.",
      ]}
    >
      <Inputs legend="One finished bar">
        <NumField id="pp-high" label="High (H)" value={highRaw} onChange={setHigh} error={high.error} hint="The highest price of the previous period." />
        <NumField id="pp-low" label="Low (L)" value={lowRaw} onChange={setLow} error={lowError} hint="The lowest price of the previous period." />
        <NumField id="pp-close" label="Close (C)" value={closeRaw} onChange={setClose} error={closeError} hint="The last price of the previous period." />
        <SelectField id="pp-variant" label="Formulas" value={variant} onChange={(v) => setVariant(PIVOT_VARIANTS.find((x) => x.key === v)?.key ?? "classic")} hint={chosen.pivot}>
          {PIVOT_VARIANTS.map((v) => (
            <option key={v.key} value={v.key}>
              {v.name}
            </option>
          ))}
        </SelectField>
      </Inputs>

      <Outcome>
        <div className="grid gap-21 sm:grid-cols-2">
          <Headline label={`Pivot (${chosen.name})`} value={r ? px(r.p) : DASH} sub={r ? chosen.pivot : "Complete the inputs above."} />
          <Headline label="Range of the bar (H − L)" value={r ? px(r.range) : DASH} sub={r ? `${px(high.n)} − ${px(low.n)}` : undefined} />
        </div>

        <Figure caption="A drawing of your own figures: the bar you entered at the left, and each level as a line across. Point at a line to read its price. It shows where the levels fall, not where the price will go.">
          <Stage draw={draw} ratio={1.5} rev={revOf(`${variant}|${highRaw}|${lowRaw}|${closeRaw}`)} />
        </Figure>
        <p aria-live="polite" className="mt-8 text-sm text-ink-2">
          {sentence}
        </p>

        <h3 className="h4 mt-34">The {chosen.name} levels, with their formulas</h3>
        <p className="mt-5 text-sm text-ink-3">{chosen.note}</p>
        <div className="scroll-x mt-13">
          <table className="table-gx min-w-[18rem]">
            <caption className="sr-only">Pivot levels from the highest resistance to the lowest support, each with its formula and its price</caption>
            <thead>
              <tr>
                <th scope="col">Level</th>
                <th scope="col">Formula</th>
                <th scope="col" className="!pr-0 !text-right">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {(r ? r.levels : pivots(3, 1, 2, variant).levels).map((l) => (
                <tr key={l.key}>
                  <th scope="row" className={`num !border-line !text-sm !normal-case !tracking-normal ${l.side === "p" ? "!font-semibold !text-prestige-ink" : "!font-normal !text-ink"}`}>
                    {l.key}
                  </th>
                  <td className="num text-ink-2">{l.formula}</td>
                  <td className={`num !pr-0 text-right text-[0.9375rem] ${l.side === "p" ? "font-semibold" : "font-medium"}`}>{r ? px(l.price) : DASH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-xs text-ink-3">R is a resistance level, above the pivot; S is a support level, below it; P is the pivot. H, L and C are the high, low and close you entered.</p>

        <SimulationNote>Pivot levels are arithmetic on one past bar: a convention many traders watch, not a forecast.</SimulationNote>
      </Outcome>
    </ToolLayout>
  );
}
