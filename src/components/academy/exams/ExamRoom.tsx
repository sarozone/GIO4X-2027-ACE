"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { TAU, clamp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Note, Stage } from "@/components/labs/kit";
import { PrintButton } from "@/components/ui/PrintButton";
import type { ExamLevel, ExamQuestion } from "./build";

/**
 * THE EXAM ROOM — one paper for each Academy level.
 *
 * A paper is drawn from the level's lessons' own questions, in an order
 * shuffled on the click that starts it. One question at a time: choose, check,
 * read the reason and the lesson it came from, go on. At the end the score,
 * the questions missed with their lessons, and "Try again".
 *
 * A pass offers a certificate to print. It says on its face what it is: a
 * record that these questions were answered on this website on this date. It
 * is not a qualification, a licence or evidence of an ability to trade.
 *
 * Nothing is stored and nothing is sent. The answers, the score and the name
 * typed on the certificate live in this page's memory and are gone when it is
 * closed. On paper, only the certificate prints.
 */

type Sitting = {
  level: ExamLevel;
  paper: ExamQuestion[];
  /** the option chosen for each question checked so far */
  given: number[];
};

/** the paper's order: chosen in the browser, on a click, never while rendering */
function shuffled<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The finished paper as a ring: one segment for each question, in the order asked. */
function ringDraw(marks: boolean[], pass: number, passed: boolean): FigureDraw {
  return ({ ctx, w, h, t, pal, still }) => {
    if (w < 100 || h < 60) return;
    const n = marks.length;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.36;
    const gap = 0.035;
    const shown = still ? 1 : smooth(clamp(t / 1.8));
    const start = -TAU / 4;

    ctx.lineCap = "butt";
    for (let i = 0; i < n; i++) {
      const a0 = start + (i / n) * TAU + gap;
      const a1 = start + ((i + 1) / n) * TAU - gap;
      const lit = clamp(shown * n - i);
      // the track
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.lineWidth = 3;
      ctx.strokeStyle = rgba(pal.line, 1);
      ctx.stroke();
      if (lit <= 0) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * lit);
      ctx.lineWidth = marks[i] ? 11 : 5;
      ctx.strokeStyle = rgba(marks[i] ? pal.emerald : ALERT, marks[i] ? 0.95 : 0.85);
      ctx.stroke();
    }

    // the inner ring: the score as one arc, with the pass mark as a tick
    const right = marks.filter(Boolean).length;
    const ri = r * 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, ri, 0, TAU);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(pal.line, 1);
    ctx.stroke();
    const breathe = still || !passed ? 1 : 0.82 + 0.18 * Math.sin(t * 1.6);
    ctx.beginPath();
    ctx.arc(cx, cy, ri, start, start + (right / n) * TAU * shown);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(passed ? pal.accent : pal.ink3, breathe);
    ctx.stroke();

    const ap = start + (pass / n) * TAU;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ap) * (ri - 9), cy + Math.sin(ap) * (ri - 9));
    ctx.lineTo(cx + Math.cos(ap) * (ri + 9), cy + Math.sin(ap) * (ri + 9));
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(pal.gold, 1);
    ctx.stroke();

    ctx.font = `600 10px ${pal.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(pal.ink3, 1);
    ctx.fillText("PASS MARK", cx, cy + 9);
    ctx.fillStyle = rgba(pal.gold, 1);
    ctx.fillRect(cx - 9, cy - 8, 18, 2);
  };
}

export function ExamRoom({ levels }: { levels: ExamLevel[] }) {
  const radio = useId();
  const [sitting, setSitting] = useState<Sitting | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [finished, setFinished] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [runs, setRuns] = useState(0);
  const top = useRef<HTMLParagraphElement>(null);

  // a new question, or the result, is where the reader's place moves to
  const active = sitting !== null;
  const at = sitting ? sitting.given.length - (checked ? 1 : 0) : -1;
  useEffect(() => {
    if (active) top.current?.focus();
  }, [at, finished, active, runs]);

  function start(level: ExamLevel) {
    setSitting({ level, paper: shuffled(level.pool).slice(0, level.asked), given: [] });
    setChoice(null);
    setChecked(false);
    setEmpty(false);
    setFinished(null);
    setRuns((n) => n + 1);
  }

  function leave() {
    setSitting(null);
    setFinished(null);
    setChecked(false);
    setChoice(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!sitting) return;
    if (!checked) {
      if (choice === null) {
        setEmpty(true);
        return;
      }
      setSitting({ ...sitting, given: [...sitting.given, choice] });
      setChecked(true);
      return;
    }
    // on to the next question, or to the result
    setChecked(false);
    setChoice(null);
    if (sitting.given.length >= sitting.paper.length) {
      setFinished(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
    }
  }

  const marks = useMemo(() => (sitting ? sitting.given.map((g, i) => g === sitting.paper[i].answer) : []), [sitting]);
  const right = marks.filter(Boolean).length;

  /* ---- choosing a paper ------------------------------------------------- */
  if (!sitting) {
    return (
      <div>
        <ul className="border-t border-line">
          {levels.map((l) => (
            <li key={l.level} className="grid gap-13 border-b border-line py-21 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="h4">{l.level}</p>
                <p className="mt-5 max-w-measure text-sm text-ink-2">{l.line}</p>
                <p className="num mt-8 text-xs text-ink-3">
                  {l.asked} questions from {l.lessons.length} lessons · pass at {l.pass} of {l.asked}
                  {l.asked < 12 ? ` · this level has ${l.pool.length} questions, so the paper is shorter than twelve` : ""}
                </p>
              </div>
              <button type="button" className="btn btn-primary justify-self-start" onClick={() => start(l)}>
                Start the {l.level} exam
              </button>
            </li>
          ))}
        </ul>
        <Note>The order of the questions is shuffled each time a paper is started. No answer, score or name is stored or sent.</Note>
      </div>
    );
  }

  const { level, paper } = sitting;

  /* ---- the result ------------------------------------------------------- */
  if (finished) {
    const passed = right >= level.pass;
    const missed = paper.flatMap((q, i) => (marks[i] ? [] : [{ q, given: sitting.given[i] }]));
    const printed = name.trim();
    return (
      <div>
        <div className="print:hidden">
          <p ref={top} tabIndex={-1} className="label outline-none">
            {level.level} exam · result
          </p>
          <div className="mt-13 grid items-center gap-21 sm:grid-cols-[minmax(0,15rem)_1fr]">
            <Stage draw={ringDraw(marks, level.pass, passed)} ratio={1.2} rev={runs} />
            <div>
              <p className="font-display text-3xl text-ink">
                <span className="num">{right}</span> of <span className="num">{paper.length}</span>
              </p>
              <p role="status" aria-live="polite" className="mt-8 max-w-measure text-ink-2">
                {right} of the {paper.length} questions answered correctly; the pass mark is {level.pass}.{" "}
                {passed ? "That is a pass, and a certificate can be printed below." : `That is ${level.pass - right} short of a pass. The lessons to read again are listed below.`}
              </p>
              <div className="mt-21 flex flex-wrap gap-13">
                <button type="button" className={passed ? "btn btn-ghost" : "btn btn-primary"} onClick={() => start(level)}>
                  Try again
                </button>
                <button type="button" className="btn btn-quiet" onClick={leave}>
                  Choose another level
                </button>
              </div>
            </div>
          </div>
          <Note>The ring has one segment for each question, in the order asked: thick for a right answer, thin for a miss. The gold tick is the pass mark.</Note>

          <h3 className="h4 mt-34">{missed.length ? "Questions missed, and where they are taught" : "Nothing was missed."}</h3>
          {missed.length > 0 && (
            <ol className="mt-13 border-t border-line">
              {missed.map(({ q, given }) => (
                <li key={q.id} className="border-b border-line py-13">
                  <p className="font-medium text-ink">{q.question}</p>
                  <p className="mt-5 text-sm text-ink-3">You answered “{q.options[given]}”.</p>
                  <p className="mt-5 text-sm text-ink-2">
                    The answer is “{q.options[q.answer]}”. {q.because}
                  </p>
                  <Link href={`/academy/${q.slug}`} className="go mt-8 min-h-[2.75rem]" target="_blank" rel="noopener">
                    Lesson: {q.lesson} (new tab)
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        {passed && (
          <>
            <div className="mt-34 grid max-w-narrow gap-5 print:hidden">
              <label htmlFor={`${radio}-name`} className="label">
                Name to print on the certificate <span className="normal-case tracking-normal text-ink-3">(optional; not stored, not sent)</span>
              </label>
              <input id={`${radio}-name`} className="input" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Your name" autoComplete="off" />
            </div>
            <article className="gx-cert mt-21 print:mt-0 print:break-inside-avoid" aria-label={`Certificate: ${level.level} exam`}>
              <p className="label">GIO4X Academy · Level exam</p>
              <h3 className="mt-13 font-display text-3xl text-ink">{level.level}</h3>
              <p className="mt-13 text-ink-2">
                {right} of {paper.length} questions from the lessons of this level were answered correctly on this website on {finished}
                {printed ? ", by" : "."}
              </p>
              {printed && <p className="mt-8 break-words font-display text-2xl text-ink">{printed}</p>}
              <svg className="gx-cert-seal" viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="52" pathLength="1" />
                <circle cx="60" cy="60" r="42" pathLength="1" />
                <path d="M38 62 L54 78 L84 44" pathLength="1" />
              </svg>
              <p className="mt-13 text-sm text-ink-3">
                Lessons examined: {level.lessons.map((l) => l.title).join("; ")}.
              </p>
              <p className="mt-21 border-t border-line pt-13 text-xs text-ink-3">
                A record that these questions were answered on this website on this date, and nothing more. It is not a qualification, not a licence and not evidence of an ability to trade. The name was typed by the
                person who printed it, and neither the name nor the result is checked, stored or verified by GIO4X.
              </p>
            </article>
            <div className="mt-21 print:hidden">
              <PrintButton>Print the certificate, or save it as a PDF</PrintButton>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ---- one question ----------------------------------------------------- */
  const q = paper[at];
  const given = checked ? sitting.given[at] : null;
  const wasRight = given !== null && given === q.answer;
  const last = at === paper.length - 1;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-8">
        <p ref={top} tabIndex={-1} className="label outline-none">
          {level.level} exam · question {at + 1} of {paper.length}
        </p>
        <p className="num text-xs text-ink-3">
          {right} right so far · pass at {level.pass}
        </p>
      </div>
      <div className="mt-8 flex gap-2" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={paper.length} aria-valuenow={sitting.given.length} aria-valuetext={`${sitting.given.length} of ${paper.length} answered, ${right} right`}>
        {paper.map((p, i) => {
          const done = i < marks.length;
          const tone = done ? (marks[i] ? "bg-pos" : "bg-neg") : i === at ? "bg-accent motion-safe:animate-pulse" : "bg-line-strong";
          return <span key={p.id} className={`h-5 flex-1 rounded-full transition-colors duration-fast ${tone} ${done && !marks[i] ? "opacity-70" : ""}`} />;
        })}
      </div>

      <form key={q.id} onSubmit={submit} className="panel mt-21 p-21 sm:p-34" noValidate>
        <fieldset>
          <legend className="font-display text-lg leading-snug text-ink">{q.question}</legend>
          <div className="mt-13 border-t border-line">
            {q.options.map((option, i) => {
              const isAnswer = checked && i === q.answer;
              const isMiss = checked && !wasRight && i === given;
              return (
                <label key={i} className={`flex min-h-[2.75rem] items-start gap-13 border-b border-line py-13 ${checked ? "cursor-default" : "cursor-pointer hover:bg-[var(--brand-soft)]"}`}>
                  <input
                    type="radio"
                    name={radio}
                    value={i}
                    checked={(checked ? given : choice) === i}
                    disabled={checked}
                    onChange={() => {
                      setChoice(i);
                      setEmpty(false);
                    }}
                    className="mt-[0.1875rem] h-[1.125rem] w-[1.125rem] shrink-0 accent-[var(--accent)]"
                  />
                  <span className={isAnswer ? "font-medium text-ink" : "text-ink-2"}>
                    {option}
                    {isAnswer && <span className="ml-8 whitespace-nowrap text-sm font-semibold text-pos">✓ the answer</span>}
                    {isMiss && <span className="ml-8 whitespace-nowrap text-sm font-semibold text-ink-3">✕ your answer</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div role="status" aria-live="polite" className={checked || empty ? "mt-13" : ""}>
          {empty && !checked && <p className="text-sm text-ink-2">Choose one of the answers first.</p>}
          {checked && (
            <p className="max-w-measure text-ink-2">
              <strong className="font-semibold text-ink">{wasRight ? "Correct." : "Not quite."}</strong> {wasRight ? "" : `The answer is “${q.options[q.answer]}”. `}
              {q.because}
            </p>
          )}
        </div>
        {checked && (
          <p className="mt-8 text-sm text-ink-3">
            From the lesson{" "}
            <Link href={`/academy/${q.slug}`} className="link" target="_blank" rel="noopener">
              {q.lesson}
            </Link>{" "}
            (opens in a new tab, so the paper stays as it is).
          </p>
        )}

        <div className="mt-21 flex flex-wrap items-center gap-13">
          <button type="submit" className="btn btn-primary">
            {checked ? (last ? "See the result" : "Next question") : "Check"}
          </button>
          <button type="button" className="btn btn-quiet" onClick={leave}>
            Leave the exam
          </button>
        </div>
      </form>
    </div>
  );
}
