"use client";

/**
 * The card both tours show while a tour is under way (Tour.tsx, PageTour.tsx).
 *
 * It is kept small, because the page it describes is the point: a narrow
 * card, a title and a few lines in small type, and a body that scrolls inside
 * the card if it is ever longer than the room allowed. And it can be put
 * away: "Minimise" folds it into one bar with the step's title, Back, Next and
 * End, and "Expand" opens it again. The choice is kept for as long as the tour
 * is open (this component stays mounted from the first step to the last), and
 * a new tour starts with the card open.
 *
 * A labelled, non-modal dialog, as before: the page stays usable, focus is
 * never trapped, and each step is announced politely, whichever form the card
 * is in. The buttons keep their places from step to step, so the keyboard
 * stays on Next while the tour is walked through with it.
 */
import { useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { PLACE, SMALL } from "@/components/tour/shared";

/** a square button for a mark without a word: 44px on a phone, compact from `sm` up */
const MARK = `btn btn-quiet ${SMALL} w-[2.75rem] shrink-0 !px-0 sm:w-[2.125rem]`;

export type TourCardProps = {
  panelRef: RefObject<HTMLElement | null>;
  /** from useId(): the card's ids are built on it */
  uid: string;
  /** "Tour", "Toolkit tour" */
  name: string;
  /** what a step is called when it is counted aloud: "Stop", "Step" */
  word: string;
  /** the step on screen, from 0, and how many there are */
  at: number;
  total: number;
  /** a few quiet words after the count ("opening") */
  note?: string;
  title: string;
  /** a sentence or two: it is set as one paragraph */
  body: ReactNode;
  /** the step before and the step after, by title; neither on the first and last */
  back?: { title: string; go: () => void };
  next?: { title: string; go: () => void };
  /** on the last step, in place of Next */
  onFinish?: () => void;
  /** one action in place of Back and Next ("Return to the tour"); `short` is its word on the minimised bar */
  action?: { label: string; short: string; go: () => void };
  onEnd: () => void;
  style?: CSSProperties;
};

export function TourCard({ panelRef, uid, name, word, at, total, note, title, body, back, next, onFinish, action, onEnd, style }: TourCardProps) {
  /** folded into one bar */
  const [small, setSmall] = useState(false);
  const titleId = `${uid}-title`;
  const bodyId = `${uid}-body`;

  // Back and Next, or the one action. The same in both forms of the card; Next and Finish share a place, so focus stays on it.
  const steps = action ? (
    <button type="button" className={`btn btn-primary ${SMALL}`} onClick={action.go} aria-label={small ? action.label : undefined}>
      {small ? action.short : action.label}
    </button>
  ) : (
    <>
      {back && (
        <button type="button" className={`btn btn-quiet ${SMALL}`} onClick={back.go} aria-label={`Back: ${back.title}`}>
          Back
        </button>
      )}
      {next ? (
        <button type="button" className={`btn btn-primary ${SMALL}`} onClick={next.go} aria-label={`Next: ${next.title}`}>
          Next
        </button>
      ) : onFinish ? (
        <button type="button" className={`btn btn-primary ${SMALL}`} onClick={onFinish}>
          Finish
        </button>
      ) : null}
    </>
  );

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-tour-panel=""
      data-tour-small={small ? "" : undefined}
      className={`panel ${PLACE} flex max-h-[min(18rem,calc(100dvh-var(--header-h)-1rem))] flex-col shadow-3 focus:outline-none sm:w-[21rem]`}
      style={style}
    >
      <div className={`flex items-center gap-x-5 py-3 pl-13 pr-5 ${small ? "flex-wrap" : ""}`}>
        {small ? (
          // the bar: the count, and the step's title on one line
          <p key="bar" id={titleId} aria-live="polite" aria-atomic="true" className="min-w-[7rem] flex-1 truncate text-sm font-semibold text-ink" title={title}>
            <span aria-hidden className="num mr-8 text-xs font-medium text-ink-3">
              {at + 1}/{total}
            </span>
            <span className="sr-only">
              {word} {at + 1} of {total}:{" "}
            </span>
            {title}
          </p>
        ) : (
          <p key="count" className="label min-w-0 flex-1 truncate">
            {name} · <span className="num">{at + 1}</span> of <span className="num">{total}</span>
            {note && <span className="text-ink-3"> · {note}</span>}
          </p>
        )}
        <span className="ml-auto flex shrink-0 items-center">
          {small && <span className="mr-3 flex items-center gap-3">{steps}</span>}
          <button
            type="button"
            className={MARK}
            onClick={() => setSmall(!small)}
            aria-expanded={!small}
            aria-controls={small ? undefined : bodyId}
            aria-label={small ? "Expand the tour card" : "Minimise the tour card"}
            title={small ? "Expand" : "Minimise"}
          >
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={small ? "rotate-180" : undefined}>
              <path d="M3 5l4 4 4-4" />
            </svg>
          </button>
          {/* in words while there is room for them; a cross on the bar */}
          <button type="button" className={small ? MARK : `btn btn-quiet ${SMALL}`} onClick={onEnd} aria-label={small ? "End tour" : undefined} title={small ? "End tour" : undefined}>
            {small ? (
              <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            ) : (
              "End tour"
            )}
          </button>
        </span>
      </div>

      {!small && (
        <>
          {/* a long body scrolls here, inside the card */}
          <div id={bodyId} aria-live="polite" aria-atomic="true" className="min-h-0 overflow-y-auto border-t border-line px-13 py-8">
            <p id={titleId} className="font-display text-base font-medium leading-snug text-ink">
              <span className="sr-only">
                {word} {at + 1} of {total}:{" "}
              </span>
              {title}
            </p>
            <p className="mt-3 text-[0.8125rem] leading-snug text-ink-2">{body}</p>
          </div>

          <div className="flex items-center justify-between gap-8 border-t border-line py-5 pl-13 pr-8">
            {/* drawn progress; the count above says the same in words */}
            <span aria-hidden className="flex min-w-0 items-center gap-3">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`h-[3px] rounded-full ${i === at ? "w-13 bg-accent" : i < at ? "w-5 bg-ink-3" : "w-5 bg-line-strong"}`} />
              ))}
            </span>
            <span className="flex shrink-0 items-center gap-5">{steps}</span>
          </div>
        </>
      )}
    </section>
  );
}
