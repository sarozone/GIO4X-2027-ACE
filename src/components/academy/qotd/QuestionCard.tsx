"use client";

import Link from "next/link";
import { answeredOn, standing } from "./pick";
import { today, useQotd } from "./store";

/**
 * The question of the day as a small card, for the Academy page and My desk:
 * what it is, the run of days this browser holds, and the way to the page
 * that asks it (/academy/question-of-the-day).
 *
 * The card does not carry the questions, so neither page grows by the pool.
 * What it says about the run is read from storage after the page has
 * mounted: the server and the first paint show the same neutral line to
 * everyone, so nothing personal is in the HTML and there is nothing to
 * mismatch on hydration.
 */
export function QuestionCard({ className = "" }: { className?: string }) {
  const { ready, run } = useQotd();
  const day = ready ? today() : "";
  const done = ready && answeredOn(run, day);
  const streak = ready ? standing(run, day) : 0;

  return (
    <aside className={`panel-quiet grid justify-items-start gap-8 p-21 ${className}`} aria-labelledby="qotd-card-h" data-qotd-card>
      <p className="label">A new one each day</p>
      <h3 id="qotd-card-h" className="h4">
        Question of the day
      </h3>
      <p className="max-w-measure text-sm text-ink-2">One question from the Academy’s lessons, the same for everyone, with the answer and the reason once you have chosen. No account and no leaderboard.</p>
      <p className="min-h-[1.25rem] text-sm text-ink-3" aria-live="polite">
        {!ready ? (
          "Your run of days is kept in this browser only."
        ) : streak > 0 ? (
          <>
            <span className="num font-semibold text-ink">{streak}</span> {streak === 1 ? "day" : "days"} in a row{run && run.best > streak ? `, longest ${run.best}` : ""}. {done ? "Today’s is answered." : "Today’s is still to answer."}
          </>
        ) : run ? (
          `No run at the moment; the longest was ${run.best} ${run.best === 1 ? "day" : "days"}.`
        ) : (
          "No run yet: it starts with today’s question, and is kept in this browser only."
        )}
      </p>
      <Link href="/academy/question-of-the-day" className="go mt-5 min-h-[2.75rem]">
        {done ? "See today’s answer" : "Answer today’s question"}
      </Link>
    </aside>
  );
}
