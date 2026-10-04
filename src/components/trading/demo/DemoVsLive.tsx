"use client";

import { useMemo, useState } from "react";
import { lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { AMBER, Note, Slider, Stage } from "@/components/labs/kit";

/**
 * THE SAME ORDER, TWICE — one order sent on a demo account and on a live one.
 *
 * The demo fills all of it at once at the price asked, because nobody has to
 * be found to take the other side. The live example has only so much on offer
 * at each price: the order takes what is there and moves on to the next, worse
 * price for the rest. The slider sets how thin that market is.
 *
 * The rule this keeps: every figure is invented and says so. It is arithmetic
 * on an example book, not market data and not a statement about how GIO4X
 * executes orders. The canvas is decoration; the sentence carries the meaning.
 */

/** the example order, in lots */
const ORDER = 10;
/** the most price levels the example can need (at the thinnest setting) */
const ROWS = 7;

type Part = { lots: number; slip: number };

/** How the example order fills in a market this thin (0 deep to 100 thin). Pure arithmetic. */
export function liveFill(thin: number): { depth: number; step: number; parts: Part[]; avg: number; worst: number } {
  const k = Math.min(1, Math.max(0, thin / 100));
  // lots on offer at each price level, and the distance between levels in pips
  const depth = Math.round(lerp(10, 1.5, k) * 10) / 10;
  const step = Math.round(lerp(0.2, 1.4, k) * 10) / 10;
  const parts: Part[] = [];
  let left = ORDER;
  for (let i = 0; i < ROWS && left > 1e-9; i++) {
    const lots = Math.min(left, depth);
    parts.push({ lots, slip: Math.round(i * step * 10) / 10 });
    left = Math.round((left - lots) * 10) / 10;
  }
  const avg = parts.reduce((s, p) => s + p.lots * p.slip, 0) / ORDER;
  return { depth, step, parts, avg, worst: parts[parts.length - 1]?.slip ?? 0 };
}

const one = (v: number) => v.toFixed(1);
const lotsText = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function DemoVsLive() {
  const [thin, setThin] = useState(55);
  const fill = useMemo(() => liveFill(thin), [thin]);
  const n = fill.parts.length;

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        // the order arrives, fills, and rests; then it is sent again
        const sent = still ? ORDER : smooth((t % 7) / 3) * ORDER;
        const gap = 13;
        const colW = (w - gap) / 2;
        const top = 30;
        const rowH = (h - top - 20) / ROWS;
        const barH = Math.max(5, Math.min(13, rowH * 0.5));
        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";

        const column = (x: number, title: string, parts: Part[], depth: number) => {
          const pad = 8;
          const barW = colW - pad * 2;
          ctx.textAlign = "left";
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(title, x + pad, 12);
          let before = 0;
          for (let i = 0; i < ROWS; i++) {
            const y = top + i * rowH + (rowH - barH) / 2;
            const p = parts[i];
            // what is on offer at this level: an outline
            const offer = Math.min(1, depth / ORDER) * barW;
            ctx.strokeStyle = rgba(pal.line, i === 0 ? 2.2 : 1.4);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + pad + 0.5, y + 0.5, offer - 1, barH - 1);
            if (p) {
              const done = Math.min(p.lots, Math.max(0, sent - before));
              if (done > 0) {
                ctx.fillStyle = rgba(i === 0 ? pal.accent : AMBER, 0.9);
                ctx.fillRect(x + pad, y, (done / ORDER) * barW, barH);
              }
              before += p.lots;
            }
          }
          // the price asked: a rule above the first level
          ctx.strokeStyle = rgba(pal.gold, 0.9);
          ctx.beginPath();
          ctx.moveTo(x + pad, top - 4);
          ctx.lineTo(x + colW - pad, top - 4);
          ctx.stroke();
          ctx.fillStyle = rgba(pal.ink3, 1);
          ctx.fillText("WORSE PRICES BELOW", x + pad, h - 8);
        };

        column(0, "DEMO", [{ lots: ORDER, slip: 0 }], ORDER);
        column(colW + gap, "LIVE, AN EXAMPLE", fill.parts, fill.depth);
        // the divider between the two desks
        ctx.strokeStyle = rgba(pal.line, 1.6);
        ctx.beginPath();
        ctx.moveTo(colW + gap / 2, 6);
        ctx.lineTo(colW + gap / 2, h - 6);
        ctx.stroke();
      },
    [fill],
  );

  const thinText = thin < 20 ? "deep" : thin < 50 ? "ordinary" : thin < 80 ? "thin" : "very thin";
  const first = fill.parts[0]?.lots ?? ORDER;

  return (
    <div>
      <Stage draw={draw} ratio={1.9} rev={thin} />
      <Slider label="How thin the market is" value={thin} min={0} max={100} step={5} onChange={setThin} text={`${thinText} (${lotsText(fill.depth)} lots on offer at each price)`} />
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {`On the demo, all ${ORDER} lots fill at once at the price asked. `}
        {n === 1
          ? "On the live example the market is deep enough to do the same: there is as much on offer at that price as the order needs."
          : `On the live example the order fills in ${n} parts at ${n} prices: ${lotsText(first)} lots at the price asked and the rest at up to ${one(fill.worst)} pips worse, which is ${one(fill.avg)} pips worse on average.`}
      </p>
      <dl className="mt-13 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line text-sm sm:grid-cols-4">
        {[
          { k: "Demo: parts", v: "1" },
          { k: "Demo: slippage", v: "0.0 pips" },
          { k: "Live example: parts", v: String(n) },
          { k: "Live example: average slippage", v: `${one(fill.avg)} pips` },
        ].map((c) => (
          <div key={c.k} className="bg-paper p-13">
            <dt className="text-xs text-ink-3">{c.k}</dt>
            <dd className="num mt-3 font-medium text-ink">{c.v}</dd>
          </div>
        ))}
      </dl>
      <Note>Average slippage = the sum of (lots filled at a price × its distance in pips from the price asked) ÷ lots ordered.</Note>
      <Note>
        Invented figures: an order of {ORDER} lots, and an example market whose depth and spacing the slider sets. It is not market data and not a description of how any broker, GIO4X included, fills an order. The gold rule is the price asked; each outline is what is on offer at a price.
      </Note>
    </div>
  );
}
