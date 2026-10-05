"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { BOXES, boxCounts, dueSlugs, INTERVALS, NEW_PER_ROUND, newSlugs, nextDueDay, ROUND, round as buildRound } from "./leitner";
import { clearCards, noteGrade, today, useCards } from "./store";

/**
 * GLOSSARY FLASHCARDS (/glossary/flashcards): every glossary term as a card,
 * the term on the front and its definition (with the formula and the example,
 * where the entry has them) on the back.
 *
 * The schedule is five Leitner boxes (./leitner): "Knew it" moves a card up a
 * box, "Did not" sends it back to box one, and a card comes round again after
 * 1, 2, 4, 8 or 16 days. Which box each card is in is kept in this browser
 * only (./store); nothing is sent and no score is kept.
 *
 * Keys, while a round is open: Space turns the card; once it is turned, the
 * right arrow (or 2) is "Knew it" and the left arrow (or 1) is "Did not".
 * Every key has a button that does the same.
 *
 * Until storage has been read the page shows the same neutral shell to
 * everyone, so there is nothing personal in the HTML and nothing to mismatch
 * on hydration.
 */
export type FlashTerm = { slug: string; term: string; topic: string; definition: string; formula?: string; example?: string };

type Round = { queue: string[]; at: number; knew: string[]; missed: string[] };

const ALL = "all";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const every = (days: number) => (days === 1 ? "the next day" : `after ${days} days`);

export function Flashcards({ terms, topics }: { terms: FlashTerm[]; topics: string[] }) {
  const { ready, deck } = useCards();
  const topicId = useId();
  const [topic, setTopic] = useState(ALL);
  const [round, setRound] = useState<Round | null>(null);
  const [turned, setTurned] = useState(false);
  const [kept, setKept] = useState(true);
  const [asking, setAsking] = useState(false);
  const turnButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const bySlug = useMemo(() => new Map(terms.map((t) => [t.slug, t])), [terms]);
  const allSlugs = useMemo(() => terms.map((t) => t.slug), [terms]);
  const slugs = useMemo(() => (topic === ALL ? allSlugs : terms.filter((t) => t.topic === topic).map((t) => t.slug)), [allSlugs, terms, topic]);

  const day = ready ? today() : 0;
  const due = ready ? dueSlugs(deck, slugs, day) : [];
  const fresh = ready ? newSlugs(deck, slugs) : [];
  const boxes = ready ? boxCounts(deck, slugs) : [];
  const upcoming = ready ? buildRound(deck, slugs, day) : [];
  const next = ready ? nextDueDay(deck, day) : null;

  const open = round !== null && round.at < round.queue.length;
  const card = open ? bySlug.get(round.queue[round.at]) : undefined;

  const start = () => {
    if (upcoming.length === 0) return;
    setRound({ queue: upcoming, at: 0, knew: [], missed: [] });
    setTurned(false);
    setAsking(false);
    // the card replaces the button that was pressed: the keyboard goes with it
    window.requestAnimationFrame(() => turnButton.current?.focus());
  };

  // the round as the last render saw it: a key press grades the card that is on the page, once
  const current = useRef<Round | null>(null);
  current.current = round;

  const grade = useCallback(
    (knew: boolean) => {
      const now = current.current;
      if (!now || now.at >= now.queue.length) return;
      const slug = now.queue[now.at];
      const after: Round = { ...now, at: now.at + 1, knew: knew ? [...now.knew, slug] : now.knew, missed: knew ? now.missed : [...now.missed, slug] };
      // a second press before the page has redrawn finds the next card, not this one again
      current.current = after;
      setKept(noteGrade(slug, knew, allSlugs));
      setRound(after);
      setTurned(false);
      // the next card's "Turn" button, or the summary's heading when that was the last
      const last = after.at >= after.queue.length;
      window.requestAnimationFrame(() => (last ? heading.current : turnButton.current)?.focus());
    },
    [allSlugs],
  );

  // the keys of a round: Space turns, the arrows (or 1 and 2) grade a turned card
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // a key held down does not run through the cards
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target instanceof HTMLElement ? e.target : null;
      const tag = el?.tagName ?? "";
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key === " " || e.code === "Space") {
        // on a button or a link, Space already presses it
        if (tag === "BUTTON" || tag === "A" || tag === "SUMMARY") return;
        e.preventDefault();
        setTurned((t) => !t);
      } else if (turned && (e.key === "ArrowRight" || e.key === "2")) {
        e.preventDefault();
        grade(true);
      } else if (turned && (e.key === "ArrowLeft" || e.key === "1")) {
        e.preventDefault();
        grade(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, turned, grade]);

  if (!ready) {
    return (
      <div className="panel grid gap-13 p-21 sm:p-34" aria-hidden>
        <div className="skeleton h-[13px] w-[38.2%]" />
        <div className="skeleton h-[8px] w-full" />
        <div className="skeleton h-[8px] w-[61.8%]" />
      </div>
    );
  }

  const notKept = !kept && (
    <p role="alert" className="mt-13 max-w-measure border-l-2 border-[var(--warn)] pl-13 text-sm text-ink">
      This browser would not store the last card, so the schedule is kept for this visit only.
    </p>
  );

  /* ---- a round is open: one card -------------------------------------------------- */
  if (round && open && card) {
    const n = round.queue.length;
    const box = deck[card.slug]?.[0] ?? 0;
    return (
      <div data-flashcards>
        <div className="flex flex-wrap items-baseline justify-between gap-x-21 gap-y-5">
          <p className="label">
            Card <span className="num">{round.at + 1}</span> of <span className="num">{n}</span>
          </p>
          <p className="text-xs text-ink-3">{box === 0 ? "A new card" : `From box ${box}`}</p>
        </div>
        {/* drawn progress; the line above says the same in words */}
        <span aria-hidden className="mt-8 block h-[3px] rounded-full bg-line">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(round.at / n) * 100}%` }} />
        </span>

        <div
          className="panel mt-13 grid min-h-[17rem] content-center gap-13 p-21 sm:p-34"
          aria-live="polite"
          aria-atomic="true"
          // a click or a tap anywhere on the card turns it; the button below does the same for the keyboard
          onClick={(e) => {
            if (!(e.target instanceof Element) || !e.target.closest("a")) setTurned((t) => !t);
          }}
        >
          {!turned ? (
            <>
              <p className="label">{card.topic}</p>
              <p className="font-display text-3xl font-light leading-tight text-ink [overflow-wrap:anywhere] sm:text-4xl">{card.term}</p>
              <p className="text-sm text-ink-3">Say what it means, then turn the card.</p>
            </>
          ) : (
            <>
              <p className="label">
                {card.term} <span className="font-normal">· {card.topic}</span>
              </p>
              <p className="max-w-measure text-[1.0625rem] leading-relaxed text-ink">{card.definition}</p>
              {card.formula && (
                <p className="max-w-measure text-sm text-ink-2">
                  <span className="label mr-8">Formula</span>
                  <span className="num">{card.formula}</span>
                </p>
              )}
              {card.example && (
                <p className="max-w-measure text-sm text-ink-2">
                  <span className="label mr-8">Example</span>
                  {card.example}
                </p>
              )}
              <p>
                <Link href={`/glossary/${card.slug}`} className="link text-sm">
                  Read the entry
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="mt-13 flex flex-wrap items-center gap-13">
          <button ref={turnButton} type="button" className={turned ? "btn btn-quiet" : "btn btn-primary"} aria-pressed={turned} onClick={() => setTurned((t) => !t)}>
            {turned ? "Turn back" : "Turn the card"}
          </button>
          {turned && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => grade(false)}>
                <span aria-hidden>←</span> Did not know
              </button>
              <button type="button" className="btn btn-primary" onClick={() => grade(true)}>
                Knew it <span aria-hidden>→</span>
              </button>
            </>
          )}
        </div>
        <p className="mt-13 max-w-measure text-xs text-ink-3">
          {turned
            ? `“Knew it” moves the card to ${box >= BOXES ? `box ${BOXES} again` : `box ${Math.max(2, box + 1)}`}; “Did not know” puts it in box 1, due tomorrow. Keys: right arrow or 2, left arrow or 1.`
            : "Keys: Space turns the card; then the right arrow is “Knew it” and the left arrow is “Did not know”."}
        </p>
        {notKept}
        <button type="button" className="btn btn-quiet btn-sm -ml-13 mt-13" onClick={() => setRound({ ...round, queue: round.queue.slice(0, round.at) })}>
          End this round
        </button>
      </div>
    );
  }

  /* ---- a round has ended: the summary ------------------------------------------------- */
  if (round) {
    const seen = round.knew.length + round.missed.length;
    return (
      <div data-flashcards>
        <h3 ref={heading} tabIndex={-1} className="h3 focus:outline-none">
          {seen === 0 ? "Round ended." : "Round finished."}
        </h3>
        <p role="status" className="mt-13 max-w-measure text-ink-2">
          {seen === 0 ? (
            "No card was graded, so nothing changed."
          ) : (
            <>
              You looked at <span className="num font-medium text-ink">{plural(seen, "card", "cards")}</span>: <span className="num font-medium text-ink">{round.knew.length}</span> you knew, which moved up a box, and{" "}
              <span className="num font-medium text-ink">{round.missed.length}</span> you did not, which {round.missed.length === 1 ? "is" : "are"} in box 1 and due tomorrow.
            </>
          )}
        </p>
        {round.missed.length > 0 && (
          <div className="mt-21">
            <h4 className="label">To read again</h4>
            <ul className="mt-8 flex flex-wrap gap-8">
              {round.missed.map((s) => (
                <li key={s}>
                  <Link href={`/glossary/${s}`} className="chip h-auto min-h-[2.125rem] whitespace-normal py-3 normal-case tracking-normal transition-colors duration-fast hover:border-line-strong hover:text-ink">
                    {bySlug.get(s)?.term ?? s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-21 max-w-measure text-sm text-ink-3">
          {upcoming.length > 0
            ? `${plural(upcoming.length, "more card is", "more cards are")} ready now${topic === ALL ? "" : ` in ${topic}`}.`
            : next !== null
              ? `Nothing more is ready today. The next card is due ${next - day === 1 ? "tomorrow" : `in ${next - day} days`}.`
              : "Nothing more is ready today."}{" "}
          A round is a way to remember words; it is not a score and it says nothing about trading ability.
        </p>
        {notKept}
        <div className="mt-21 flex flex-wrap items-center gap-13">
          {upcoming.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={start}>
              Another round: {plural(upcoming.length, "card", "cards")}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setRound(null)}>
            Back to the boxes
          </button>
        </div>
      </div>
    );
  }

  /* ---- no round: the topic, today's count and the boxes ---------------------------------- */
  const seenAll = Object.keys(deck).length;
  return (
    <div data-flashcards>
      <div className="field max-w-[21rem]">
        <label htmlFor={topicId}>Topic</label>
        <select id={topicId} className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value={ALL}>All topics ({terms.length} cards)</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t} ({terms.filter((x) => x.topic === t).length})
            </option>
          ))}
        </select>
      </div>

      <dl className="mt-21 grid grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line" aria-live="polite">
        {[
          { k: "Due today", v: due.length },
          { k: "New", v: fresh.length },
          { k: "Looked at", v: slugs.length - fresh.length },
        ].map((x) => (
          <div key={x.k} className="bg-bg p-13 sm:p-21">
            <dt className="label">{x.k}</dt>
            <dd className="num mt-5 font-display text-2xl font-light text-ink">{x.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-21 flex flex-wrap items-center gap-13">
        <button type="button" className="btn btn-primary" onClick={start} disabled={upcoming.length === 0}>
          {upcoming.length === 0 ? "Nothing is due" : `Start a round: ${plural(upcoming.length, "card", "cards")}`}
        </button>
        <Link href="/glossary" className="link text-sm">
          The glossary
        </Link>
      </div>
      <p className="mt-13 max-w-measure text-sm text-ink-3">
        {upcoming.length === 0
          ? next !== null
            ? `Every card ${topic === ALL ? "" : "in this topic "}has been looked at and none is due today. The next is due ${next - day === 1 ? "tomorrow" : `in ${next - day} days`}.`
            : "There are no cards in this topic."
          : `A round is at most ${ROUND} cards: the ones due today first, the longest overdue at the front, then up to ${NEW_PER_ROUND} new ones.`}
      </p>

      <h3 className="label mt-34">The five boxes{topic === ALL ? "" : `: ${topic}`}</h3>
      <ol className="mt-8 border-t border-line-strong">
        {INTERVALS.map((days, i) => (
          <li key={days} className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-x-13 border-b border-line py-8 text-sm">
            <span className="font-medium text-ink">Box {i + 1}</span>
            <span className="text-ink-3">comes back {every(days)}</span>
            <span className="num text-ink-2">{plural(boxes[i + 1] ?? 0, "card", "cards")}</span>
          </li>
        ))}
      </ol>
      {notKept}

      {seenAll > 0 && (
        <div className="mt-21">
          {asking ? (
            <div className="panel max-w-measure p-21" role="group" aria-label="Confirm starting over">
              <p className="h4">Forget every card’s box?</p>
              <p className="mt-8 text-sm text-ink-2">
                {plural(seenAll, "card goes", "cards go")} back to new, in every topic. This cannot be undone.
              </p>
              <div className="mt-13 flex flex-wrap gap-13">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    clearCards();
                    setKept(true);
                    setAsking(false);
                  }}
                >
                  Forget and start over
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setAsking(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-quiet btn-sm -ml-13" onClick={() => setAsking(true)}>
              Start over
            </button>
          )}
        </div>
      )}
    </div>
  );
}
