"use client";

import Link from "next/link";
import { countDue, NEW_PER_ROUND, nextDueDay } from "./leitner";
import { today, useCards } from "./store";

/**
 * The glossary flashcards as a small card, for the glossary page and My desk:
 * what they are, how many cards are due today in this browser, and the way to
 * the page that shows them (/glossary/flashcards).
 *
 * The card does not carry the terms, so neither page grows by the glossary.
 * The due count is read from storage after the page has mounted: the server
 * and the first paint show the same neutral line to everyone, so nothing
 * personal is in the HTML and there is nothing to mismatch on hydration.
 */
export function FlashcardsCard({ className = "" }: { className?: string }) {
  const { ready, deck } = useCards();
  const day = ready ? today() : 0;
  const seen = ready ? Object.keys(deck).length : 0;
  const due = ready ? countDue(deck, day) : 0;
  const next = ready ? nextDueDay(deck, day) : null;
  const wait = next === null ? 0 : next - day;

  return (
    <aside className={`panel-quiet grid justify-items-start gap-8 p-21 ${className}`} aria-labelledby="cards-card-h" data-cards-card>
      <p className="label">Spaced repetition</p>
      <h3 id="cards-card-h" className="h4">
        Glossary flashcards
      </h3>
      <p className="max-w-measure text-sm text-ink-2">Every glossary term as a card: the term on the front, its definition on the back. A card you knew comes back later; one you did not comes back tomorrow. No account and no score.</p>
      <p className="min-h-[1.25rem] text-sm text-ink-3" aria-live="polite">
        {!ready ? (
          "Which cards are due is kept in this browser only."
        ) : due > 0 ? (
          <>
            <span className="num font-semibold text-ink">{due}</span> {due === 1 ? "card is" : "cards are"} due today, of {seen} you have looked at.
          </>
        ) : seen > 0 ? (
          `Nothing is due today. The next ${wait === 1 ? "is due tomorrow" : `is due in ${wait} days`}; new cards are there whenever you want them.`
        ) : (
          `Not started yet: the first round is ${NEW_PER_ROUND} cards, and what you grade is kept in this browser only.`
        )}
      </p>
      <Link href="/glossary/flashcards" className="go mt-5 min-h-[2.75rem]">
        {due > 0 ? `Review ${due === 1 ? "the card" : `the ${due} cards`} due today` : seen > 0 ? "Open the flashcards" : "Start the flashcards"}
      </Link>
    </aside>
  );
}
