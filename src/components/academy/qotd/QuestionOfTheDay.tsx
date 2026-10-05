"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { answeredOn, dayNumber, questionIndex, standing } from "./pick";
import { clearQotd, noteAnswer, today, useQotd } from "./store";

/**
 * The day's question: one of the Academy's own lesson questions, chosen from
 * the date, asked once. After an answer the page says which option is right
 * and why, in the words the lesson's question already carries, and adds the
 * day to a run of days that is kept in this browser only (./store).
 *
 * The question is chosen from the date, counted in UTC, on the visitor's
 * device: so the server sends the whole pool and the choice is made after the
 * page loads. Until then a line says so; without JavaScript that line stays
 * and the link to the lessons beside it still works. The form is the
 * glossary's "Check yourself" form in shape (a fieldset of radio buttons, a
 * button, the verdict in words, announced politely), with one try.
 */

export type DayQuestion = {
  /** lesson slug and the question's place in that lesson */
  id: string;
  slug: string;
  lesson: string;
  level: string;
  question: string;
  options: string[];
  answer: number;
  because: string;
};

/** "3 days in a row, best 7": the run, in words. */
export function RunLine({ streak, best, className = "" }: { streak: number; best: number; className?: string }) {
  return (
    <p className={`text-sm text-ink-3 ${className}`}>
      {streak > 0 ? (
        <>
          <span className="num font-semibold text-ink">{streak}</span> {streak === 1 ? "day" : "days"} in a row{best > streak ? `, longest ${best}` : ""}. Kept in this browser only.
        </>
      ) : best > 0 ? (
        `No run at the moment; the longest was ${best} ${best === 1 ? "day" : "days"}. Answer on consecutive days to build one.`
      ) : (
        "Answer on consecutive days to build a run. A day counts when you answer, right or wrong. It is kept in this browser only."
      )}
    </p>
  );
}

export function QuestionOfTheDay({ pool }: { pool: DayQuestion[] }) {
  const name = useId();
  const { ready, run } = useQotd();
  const [at, setAt] = useState<number | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [empty, setEmpty] = useState(false);
  const [unkept, setUnkept] = useState(false);
  // answered on this page during this visit: shown even if the browser would not store it
  const [local, setLocal] = useState<number | null>(null);
  useEffect(() => setAt(questionIndex(dayNumber(Date.now()), pool.length)), [pool.length]);

  if (pool.length === 0) return <p className="text-ink-3">No question is published yet.</p>;
  if (at === null || !ready) return <p className="gx-wait text-ink-3">Today’s question appears once the page has loaded.</p>;

  const q = pool[at];
  const day = today();
  const stored = answeredOn(run, day) && run ? run.pick : null;
  const picked = local ?? stored;
  const done = picked !== null;
  const right = done && picked === q.answer;
  const streak = standing(run, day);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (done) return;
    if (choice === null) {
      setEmpty(true);
      return;
    }
    setLocal(choice);
    setUnkept(!noteAnswer(choice, choice === q.answer));
  }

  function startOver() {
    setLocal(null);
    setChoice(null);
    setUnkept(false);
    clearQotd();
  }

  return (
    <div>
      <p className="label">
        {q.level} · from the lesson “{q.lesson}”
      </p>
      <form onSubmit={submit} className="panel mt-13 max-w-measure p-21 sm:p-34" noValidate>
        <fieldset>
          <legend className="font-display text-lg leading-snug text-ink">{q.question}</legend>
          <div className="mt-13 border-t border-line">
            {q.options.map((option, i) => {
              const isAnswer = done && i === q.answer;
              const isMiss = done && !right && i === picked;
              return (
                <label key={i} className={`flex min-h-[2.75rem] items-start gap-13 border-b border-line py-13 ${done ? "cursor-default" : "cursor-pointer hover:bg-[var(--brand-soft)]"}`}>
                  <input
                    type="radio"
                    name={name}
                    value={i}
                    checked={(done ? picked : choice) === i}
                    disabled={done}
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

        {!done && (
          <div className="mt-21 flex flex-wrap items-center gap-13">
            <button type="submit" className="btn btn-primary">
              Check
            </button>
            <p className="text-sm text-ink-3">One try. The answer and the reason follow.</p>
          </div>
        )}

        <div role="status" aria-live="polite" className={done || empty ? "mt-13" : ""}>
          {empty && !done && <p className="text-sm text-ink-2">Choose one of the answers first.</p>}
          {done && (
            <>
              <p className="text-ink-2">
                <strong className="font-semibold text-ink">{right ? "Correct." : "Not quite."}</strong> {!right && `The answer is “${q.options[q.answer]}”. `}
                {q.because}
              </p>
              <p className="mt-8 text-sm text-ink-3">
                The question comes from{" "}
                <Link href={`/academy/${q.slug}`} className="link">
                  {q.lesson}
                </Link>
                . A new one arrives at midnight, UTC.
              </p>
            </>
          )}
        </div>
      </form>

      <RunLine streak={streak} best={run?.best ?? 0} className="mt-13 max-w-measure" />
      {unkept && (
        <p role="alert" className="mt-5 max-w-measure border-l-2 border-[var(--warn)] pl-13 text-sm text-ink">
          This browser would not store the answer (its storage is switched off or full), so today is not added to a run.
        </p>
      )}
      {run && (
        <p className="mt-5 text-sm text-ink-3">
          <button type="button" className="link inline-flex min-h-[2.75rem] items-center" onClick={startOver}>
            Start over
          </button>{" "}
          forgets the run and today’s answer.
        </p>
      )}
    </div>
  );
}
