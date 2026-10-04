"use client";

import { useEffect, useId, useRef, useState, type MutableRefObject } from "react";
import { TAU, rgba, type FigureDraw } from "@/components/figures/Figure";
import { Note, Stage } from "@/components/labs/kit";
import { STYLE_KEYS, read, styles, typeQuestions, type StyleKey } from "@/data/trader-type";
import { StyleCard, type StyleLinks } from "./StyleCard";

/**
 * THE STYLE DIAL — ten questions about how a person likes to work, and a
 * five-sided dial that fills as they are answered: one spoke for each style of
 * working, from the scalper's seconds to the investor's years.
 *
 * The result names the style the answers lean to most and sets out what that
 * style demands, what it costs and where it goes wrong. It is a description of
 * stated preferences. It is not an assessment of suitability or of ability,
 * and it is not advice; the component says so beside every result.
 *
 * Nothing is stored and nothing is sent: the answers live in this page's
 * memory and are gone when it is closed.
 */

const N = STYLE_KEYS.length;
const angle = (i: number) => -TAU / 4 + (i / N) * TAU;

/** `shown` holds the dial's present shape, so it can ease towards the answers. */
function dialDraw(target: number[], top: number, shown: MutableRefObject<number[]>): FigureDraw {
  return ({ ctx, w, h, t, dt, pal, still }) => {
    if (w < 100 || h < 60) return;
    const cur = shown.current;
    const k = still ? 1 : 1 - Math.exp(-dt * 5);
    for (let i = 0; i < N; i++) cur[i] += (target[i] - cur[i]) * k;

    const cx = w / 2;
    const cy = h / 2 + 4;
    const R = Math.min(w * 0.3, h * 0.36);
    const at = (i: number, r: number): [number, number] => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

    // the web: four rings and five spokes
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const [x, y] = at(i % N, (R * ring) / 4);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(pal.line, ring === 4 ? 1 : 0.6);
      ctx.stroke();
    }
    for (let i = 0; i < N; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(...at(i, R));
      ctx.strokeStyle = rgba(pal.line, 0.8);
      ctx.stroke();
    }

    // a slow hand going round, so the dial is alive while it waits
    if (!still) {
      const a = t * 0.5;
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      g.addColorStop(0, rgba(pal.teal, 0));
      g.addColorStop(1, rgba(pal.teal, 0.45));
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // the answers so far, as a shape
    const reach = (i: number) => R * (0.05 + 0.95 * cur[i]) * (still ? 1 : 1 + 0.015 * Math.sin(t * 1.7 + i * 1.3));
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const [x, y] = at(i, reach(i));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.16);
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.strokeStyle = rgba(pal.accent, 0.95);
    ctx.stroke();

    for (let i = 0; i < N; i++) {
      const [x, y] = at(i, reach(i));
      const lead = i === top;
      if (lead) {
        const pulse = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
        ctx.beginPath();
        ctx.arc(x, y, 7 + pulse * 4, 0, TAU);
        ctx.strokeStyle = rgba(pal.gold, 0.7 - pulse * 0.4);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, lead ? 4 : 2.6, 0, TAU);
      ctx.fillStyle = rgba(lead ? pal.gold : pal.accent, 1);
      ctx.fill();
    }

    // the five names
    ctx.font = `600 10px ${pal.font}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i < N; i++) {
      const c = Math.cos(angle(i));
      const s = Math.sin(angle(i));
      ctx.textAlign = Math.abs(c) < 0.2 ? "center" : c > 0 ? "left" : "right";
      ctx.fillStyle = rgba(i === top ? pal.ink : pal.ink3, 1);
      ctx.fillText(styles[STYLE_KEYS[i]].short, cx + c * (R + 12), cy + s * (R + 12) + (Math.abs(c) < 0.2 ? -3 : 0));
    }
  };
}

const NOT_ADVICE =
  "This is a description of the preferences you gave, in ten answers. It is not an assessment of whether trading is suitable for you or of any ability to trade, and it is not advice. Most people who trade with leverage lose money, whatever their style.";

export function TypeQuiz({ links }: { links: Record<StyleKey, StyleLinks> }) {
  const group = useId();
  const total = typeQuestions.length;
  const [answers, setAnswers] = useState<(StyleKey | null)[]>(() => typeQuestions.map(() => null));
  const [at, setAt] = useState(0);
  const [done, setDone] = useState(false);
  const [rev, setRev] = useState(0);
  const shown = useRef<number[]>(STYLE_KEYS.map(() => 0));
  const head = useRef<HTMLParagraphElement>(null);
  const moved = useRef(false);

  const reading = read(answers);
  const topAt = reading.top ? STYLE_KEYS.indexOf(reading.top) : -1;
  const top = reading.top ? styles[reading.top] : null;
  const second = reading.second ? styles[reading.second] : null;

  // after Next, Back or the result, the reader's place moves with the page
  useEffect(() => {
    if (moved.current) head.current?.focus();
  }, [at, done]);

  function go(to: number) {
    moved.current = true;
    setAt(to);
  }
  function pick(style: StyleKey) {
    setAnswers((now) => now.map((v, i) => (i === at ? style : v)));
    setRev((n) => n + 1);
  }
  function again() {
    moved.current = true;
    setAnswers(typeQuestions.map(() => null));
    setAt(0);
    setDone(false);
    setRev((n) => n + 1);
  }

  const sentence =
    reading.answered === 0 || !top
      ? "Nothing is answered yet, so the dial is empty: five spokes, one for each style of working."
      : done
        ? `Your ${total} answers lean most towards ${top.name.toLowerCase()}: ${answers.filter((a) => a === top.key).length} of the ${total} chose it outright${second ? `, and the next strongest lean is ${second.name.toLowerCase()}` : ""}.`
        : `After ${reading.answered} of ${total} answers the dial leans most towards ${top.name.toLowerCase()}${second ? `, then ${second.name.toLowerCase()}` : ""}.`;

  const q = typeQuestions[at];
  const chosen = answers[at];

  return (
    <div>
      <div className="grid items-start gap-21 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="min-w-0">
          <Stage draw={dialDraw(reading.lean, topAt, shown)} ratio={1.15} rev={rev} />
          <p aria-live="polite" className="mt-13 text-sm text-ink-2">
            {sentence}
          </p>
          <Note>Each answer adds two to the style it names and one to the styles beside it; a spoke’s length is that total over the most it could be. A tie is given to the slower style.</Note>
        </div>

        <div className="min-w-0">
          {done && top ? (
            <div>
              <p ref={head} tabIndex={-1} className="label outline-none">
                The style your answers describe
              </p>
              <p className="mt-8 font-display text-3xl text-ink">{top.name}</p>
              {second && (
                <p className="mt-8 max-w-measure text-sm text-ink-3">
                  The next strongest lean is {second.name.toLowerCase()}. Styles beside each other on the dial share habits, and few people are only one.
                </p>
              )}
              <p className="mt-13 max-w-measure border-l-2 border-accent pl-13 text-sm text-ink-2">{NOT_ADVICE}</p>
              <div className="mt-21 flex flex-wrap gap-13">
                <button type="button" className="btn btn-primary" onClick={again}>
                  Answer again
                </button>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => {
                    setDone(false);
                    go(total - 1);
                  }}
                >
                  Change an answer
                </button>
              </div>
            </div>
          ) : (
            <form
              className="panel p-21 sm:p-34"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!chosen) return;
                if (at < total - 1) go(at + 1);
                else {
                  moved.current = true;
                  setDone(true);
                  setRev((n) => n + 1);
                }
              }}
            >
              <p ref={head} tabIndex={-1} className="label outline-none">
                Question {at + 1} of {total}
              </p>
              <div className="mt-8 flex gap-2" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={reading.answered}>
                {typeQuestions.map((x, i) => (
                  <span key={x.id} className={`h-3 flex-1 rounded-full ${answers[i] ? "bg-accent" : i === at ? "bg-ink-3" : "bg-line-strong"}`} />
                ))}
              </div>
              <fieldset key={q.id} className="mt-21">
                <legend className="font-display text-lg leading-snug text-ink">{q.question}</legend>
                <div className="mt-13 border-t border-line">
                  {q.options.map((o) => (
                    <label key={o.style} className="flex min-h-[2.75rem] cursor-pointer items-start gap-13 border-b border-line py-13 hover:bg-[var(--brand-soft)]">
                      <input type="radio" name={`${group}-${q.id}`} checked={chosen === o.style} onChange={() => pick(o.style)} className="mt-[0.1875rem] h-[1.125rem] w-[1.125rem] shrink-0 accent-[var(--accent)]" />
                      <span className={chosen === o.style ? "font-medium text-ink" : "text-ink-2"}>{o.text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-21 flex flex-wrap items-center gap-13">
                <button type="submit" className="btn btn-primary" disabled={!chosen}>
                  {at < total - 1 ? "Next question" : "See the result"}
                </button>
                {at > 0 && (
                  <button type="button" className="btn btn-quiet" onClick={() => go(at - 1)}>
                    Back
                  </button>
                )}
                {!chosen && <p className="text-sm text-ink-3">Choose the answer nearest to you. There is no right one.</p>}
              </div>
            </form>
          )}
        </div>
      </div>

      {done && top && (
        <div className="mt-34 border-t border-line pt-34">
          <p className="eyebrow">What this style asks of a person</p>
          <div className="mt-13">
            <StyleCard style={top} links={links[top.key]} newTab />
          </div>
          <p className="mt-21 max-w-measure text-xs text-ink-3">Lesson links open in a new tab, so the result stays on this page. Nothing here is stored: reload the page and the answers are gone.</p>
        </div>
      )}
    </div>
  );
}
