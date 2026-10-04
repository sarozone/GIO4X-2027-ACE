"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { lerp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, AMBER, Stage } from "@/components/labs/kit";
import { cap, dot, line } from "./draw";

/**
 * CHECK THIS OFFER — a list of yes/no questions and a drawn gauge.
 *
 * Each "yes" is a warning sign. As boxes are ticked the gauge fills and one
 * sentence says how many signs are present and which matter most. The rule it
 * keeps: it is a prompt for thought, never a verdict. It cannot say that an
 * offer is a fraud or that it is not, and it says so, including when nothing
 * is ticked. The answers live in this component's state and nowhere else:
 * nothing is stored and nothing is sent.
 *
 * The questions are handed in by the page (from src/data/scams.ts), so the
 * words are in one place and the data file stays out of the browser bundle.
 */
export type OfferQuestion = { id: string; q: string; short: string; weight: 2 | 3; href?: string; label?: string };

export function OfferCheck({ questions }: { questions: readonly OfferQuestion[] }) {
  const uid = useId();
  const [on, setOn] = useState<readonly string[]>([]);
  const eased = useRef(0);
  const max = useMemo(() => questions.reduce((s, c) => s + c.weight, 0), [questions]);
  const ticked = questions.filter((c) => on.includes(c.id));
  const score = ticked.reduce((s, c) => s + c.weight, 0);
  const heavy = ticked.filter((c) => c.weight === 3);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, dt, pal, still }) => {
        if (w < 100 || h < 60) return;
        const cx = w / 2;
        const cy = h - 26;
        const r = Math.min(w * 0.44, h - 44);
        const thick = Math.max(10, r * 0.16);
        // one segment for each question, as wide as its weight
        let from = Math.PI;
        const gap = 0.022;
        questions.forEach((c) => {
          const span = (Math.PI * c.weight) / max;
          const isOn = on.includes(c.id);
          ctx.beginPath();
          ctx.arc(cx, cy, r, from + gap / 2, from + span - gap / 2);
          ctx.lineWidth = thick;
          ctx.strokeStyle = isOn ? rgba(c.weight === 3 ? ALERT : AMBER, 1) : rgba(pal.ink3, 0.2);
          ctx.stroke();
          from += span;
        });
        // the needle: the share of the weight that is ticked, eased towards
        const target = score / max;
        eased.current = still ? target : lerp(eased.current, target, 1 - Math.exp(-dt * 6));
        const a = Math.PI + Math.PI * eased.current;
        const tip: [number, number] = [cx + Math.cos(a) * (r - thick), cy + Math.sin(a) * (r - thick)];
        line(ctx, [cx, cy], tip, rgba(pal.ink, 1), 2);
        dot(ctx, cx, cy, 5, rgba(pal.ink, 1));
        dot(ctx, tip[0], tip[1], 3, rgba(pal.ink, 1));
        ctx.font = `600 ${Math.round(Math.max(18, r * 0.24))}px ${pal.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(pal.ink, 1);
        ctx.fillText(`${ticked.length} of ${questions.length}`, cx, cy - r * 0.42);
        cap(ctx, pal, "Warning signs ticked", cx, h - 9, pal.ink3, "center");
      },
    // the gauge is drawn from the ticked set; `ticked` and `score` are derived from `on`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [on, questions, max],
  );

  const top = (heavy.length ? heavy : ticked).slice(0, 3);
  const more = (heavy.length ? heavy.length : ticked.length) - top.length;
  const names = top.map((c) => c.short).join("; ") + (more > 0 ? `; and ${more} more` : "");
  const sentence =
    ticked.length === 0
      ? "No boxes are ticked. That does not make an offer safe: a fraud can pass every question here, and this list knows only what you have been told so far."
      : heavy.length
        ? `${ticked.length} of ${questions.length} warning signs are present. ${heavy.length === 1 ? "The one that matters" : "The ones that matter"} most: ${names}. Regulators’ published warnings treat ${heavy.length === 1 ? "this" : "each of these"} as a serious sign on its own.`
        : `${ticked.length} of ${questions.length} warning signs ${ticked.length === 1 ? "is" : "are"} present: ${names}. None is decisive alone. Together they describe how many frauds begin.`;
  const reading = ticked.filter((c) => c.href && c.label);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-55" data-machine>
      <fieldset className="min-w-0">
        <legend className="label">Tick each question whose answer is yes</legend>
        <ul className="mt-13 grid gap-px overflow-hidden rounded border border-line bg-line">
          {questions.map((c) => {
            const id = `${uid}-${c.id}`;
            return (
              <li key={c.id} className="bg-paper">
                <label htmlFor={id} className="check min-h-[2.75rem] cursor-pointer items-center p-13 !text-[0.9375rem]">
                  <input id={id} type="checkbox" checked={on.includes(c.id)} onChange={(e) => setOn((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
                  <span className="text-ink-2">{c.q}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="min-w-0">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
          <Stage draw={draw} ratio={1.7} rev={on.length * 100 + score} />
          <p className="mt-13 min-h-[6rem] text-ink-2" aria-live="polite">
            {sentence}
          </p>
          {reading.length > 0 && (
            <p className="mt-8 text-sm text-ink-3">
              <span className="label mr-8">How these work</span>
              {reading.map((c, i) => (
                <span key={c.id}>
                  {i > 0 ? " · " : ""}
                  <Link href={c.href as string} className="link">
                    {c.label}
                  </Link>
                </span>
              ))}
            </p>
          )}
          <div className="mt-13 flex flex-wrap items-center gap-13">
            <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem]" disabled={on.length === 0} onClick={() => setOn([])}>
              Clear the list
            </button>
          </div>
          <p className="mt-13 border-t border-line pt-13 text-sm text-ink-3">
            This is a checklist, not a verdict. It cannot tell you that an offer is a fraud, and it cannot tell you that one is safe: no ticks means only that none of the signs listed here has shown itself yet. What you tick stays in this page while it is open. Nothing is stored, and nothing is sent to GIO4X or to
            anyone else.
          </p>
        </div>
      </div>
    </div>
  );
}
