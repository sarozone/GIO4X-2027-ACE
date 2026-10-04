"use client";

import { useMemo, useState } from "react";
import { TAU, clamp, lerp, rgba, type Colour, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Note, Slider, Stage } from "@/components/labs/kit";

/**
 * NIGHTS HELD — one position kept open across several nights, on an ordinary
 * account and on a swap-free one.
 *
 * On the ordinary account a small swap is applied at each night's rollover,
 * a charge or a credit, and on one night of the week three nights' worth is
 * applied at once so that the weekend is accounted for. On the swap-free
 * account no swap is applied on any night.
 *
 * The rule this keeps: the amounts are example units, not a rate, a fee or a
 * GIO4X condition, and the drawing shows no other charge on the swap-free
 * account because none has been set. The sentence carries the meaning.
 */

const MAX = 10;
const DAYS = ["M", "T", "W", "T", "F"];
/** the night of the trading week (0 = Monday) on which three nights are applied in this example */
const TRIPLE = 2;

/** Swap applied over `nights` trading nights from a Monday, in example units of one night's swap. Pure arithmetic. */
export function swapUnits(nights: number): { units: number; triples: number } {
  let triples = 0;
  for (let i = 0; i < nights; i++) if (i % 5 === TRIPLE) triples++;
  return { units: nights + 2 * triples, triples };
}

function moon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colour: Colour, alpha: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, true);
  ctx.ellipse(x, y, r * 0.42, r, 0, Math.PI / 2, (3 * Math.PI) / 2, false);
  ctx.closePath();
  ctx.fillStyle = rgba(colour, alpha);
  ctx.fill();
}

export function NightsHeld() {
  const [nights, setNights] = useState(5);
  const [credit, setCredit] = useState(false);
  const { units, triples } = useMemo(() => swapUnits(nights), [nights]);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        // the nights pass one after another, then the picture rests
        const passed = still ? nights : clamp((t % 8) / 3.6) * nights;
        const pad = 10;
        const slot = (w - pad * 2) / MAX;
        const r = Math.max(3.5, Math.min(7, slot * 0.2));
        const half = h / 2;
        const tone: Colour = credit ? pal.emerald : ALERT;
        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";

        const row = (y0: number, title: string, swapFree: boolean) => {
          const moonY = y0 + 30;
          const base = y0 + 46;
          const unit = Math.max(4, (half - 46 - 20) / 3);
          ctx.textAlign = "left";
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(title, pad, y0 + 11);
          // the account's own level: it is the bars that leave it
          ctx.strokeStyle = rgba(pal.line, 1.8);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pad, base);
          ctx.lineTo(w - pad, base);
          ctx.stroke();
          for (let i = 0; i < MAX; i++) {
            const x = pad + slot * (i + 0.5);
            const held = i < nights;
            const lit = clamp(passed - i);
            moon(ctx, x, moonY, r, held ? pal.gold : pal.ink3, held ? lerp(0.35, 1, lit) : 0.3);
            ctx.textAlign = "center";
            ctx.fillStyle = rgba(pal.ink3, held ? 1 : 0.55);
            ctx.fillText(DAYS[i % 5] ?? "", x, y0 + half - 9);
            if (!held) continue;
            if (swapFree) {
              // nothing is applied: an open mark on the level
              ctx.strokeStyle = rgba(pal.ink2, lerp(0.3, 0.9, lit));
              ctx.beginPath();
              ctx.arc(x, base, 2.5, 0, TAU);
              ctx.stroke();
              continue;
            }
            const size = (i % 5 === TRIPLE ? 3 : 1) * unit * lit;
            const bw = Math.max(4, slot * 0.36);
            ctx.fillStyle = rgba(tone, 0.9);
            ctx.fillRect(x - bw / 2, base, bw, size);
          }
          // the weekend, between Friday night and Monday night
          const wx = pad + slot * 5;
          ctx.strokeStyle = rgba(pal.line, 1.4);
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(wx, y0 + 22);
          ctx.lineTo(wx, y0 + half - 4);
          ctx.stroke();
          ctx.setLineDash([]);
        };

        row(0, credit ? "ORDINARY ACCOUNT: A CREDIT EACH NIGHT" : "ORDINARY ACCOUNT: A CHARGE EACH NIGHT", false);
        row(half, "SWAP-FREE ACCOUNT: NO SWAP", true);
      },
    [nights, credit],
  );

  const kind = credit ? "credit" : "charge";
  return (
    <div>
      <Stage draw={draw} ratio={1.7} rev={nights * 2 + (credit ? 1 : 0)} />
      <Slider label="Nights held" value={nights} min={1} max={MAX} onChange={setNights} text={`${nights} ${nights === 1 ? "night" : "nights"}, from a Monday`} />
      <div className="mt-13 flex flex-wrap items-center gap-8" role="group" aria-label="Whether the example swap is a charge or a credit">
        <button type="button" className={`btn btn-sm ${credit ? "btn-ghost" : "btn-primary"} min-h-[2.75rem]`} aria-pressed={!credit} onClick={() => setCredit(false)}>
          Swap is a charge
        </button>
        <button type="button" className={`btn btn-sm ${credit ? "btn-primary" : "btn-ghost"} min-h-[2.75rem]`} aria-pressed={credit} onClick={() => setCredit(true)}>
          Swap is a credit
        </button>
      </div>
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {`Held for ${nights} ${nights === 1 ? "night" : "nights"} from a Monday, the ordinary account applies a ${kind} at each rollover`}
        {triples > 0 ? `, and three nights’ worth on ${triples === 1 ? "the Wednesday" : "each Wednesday"}` : ""}
        {`: ${units} example ${units === 1 ? "unit" : "units"} of ${kind} in all. The swap-free account applies no swap on any of those nights, so it neither pays that charge nor receives that credit.`}
      </p>
      <Note>
        Swap applied = nights held + 2 for each night on which three nights are applied. Here: {nights} + 2 × {triples} = {units} units.
      </Note>
      <Note>
        An example in invented units, where one unit is one night’s swap: not a rate, and not a GIO4X condition. Three nights are applied on one night of the week so that the weekend is accounted for; for currency pairs that night is commonly Wednesday, which this example uses, and it differs by instrument and by broker. Any other charge a swap-free account may carry is not drawn, because none has been set.
      </Note>
    </div>
  );
}
