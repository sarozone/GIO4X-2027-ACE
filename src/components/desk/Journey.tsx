"use client";

import Link from "next/link";
import { useLearned, LESSON_PREFIX, type Learned } from "@/components/glossary/learn";
import { useJournal } from "@/components/journal/store";
import { usePlay, type Play } from "@/components/play/store";
import { journey, type JourneySign, type JourneyStep } from "@/data/journey";
import { useRecent, useSaved, type PageRef, type Recent } from "./store";

/**
 * A PATH THROUGH IT — the eight steps of src/data/journey.ts on My desk.
 *
 * It reads and never writes. A step is ticked only from what this browser
 * already holds for another purpose (gx:learn, gx:play, gx:saved, gx:recent,
 * gx:journal); there is no key for the path itself. Until storage has been
 * read, and whenever it holds nothing that bears on the path, the steps are a
 * plain ordered list of links: that is also what the server sends, so nothing
 * personal is in the HTML.
 */
type Held = { learned: Learned; play: Play; saved: PageRef[]; recent: Recent | null; trades: number };

function shows(sign: JourneySign, held: Held): boolean {
  switch (sign.by) {
    case "lesson":
      return held.learned[`${LESSON_PREFIX}${sign.slug}`] === true;
    case "term":
      return held.learned[sign.slug] === true;
    case "stamp":
      return held.play.s?.includes(sign.id) ?? false;
    case "saved":
      return held.saved.some((p) => p.h === sign.href);
    case "recent":
      return held.recent?.p.some((p) => p.h === sign.href) ?? false;
    case "journal":
      return held.trades >= sign.trades;
  }
}

/** Whether a sign could show anything at present: a stamp needs the passport started, a recent page needs that list switched on. */
function canShow(sign: JourneySign, held: Held): boolean {
  if (sign.by === "stamp") return held.play.s !== undefined;
  if (sign.by === "recent") return held.recent !== null;
  return true;
}

/**
 * The step "Continue where I stopped" opens: the first one not shown as done.
 * A step this browser cannot record at present (none of its signs could show
 * anything) is passed over once a later step is ticked, or the path could
 * never move beyond it.
 */
function nextStep(done: boolean[], recordable: boolean[]): JourneyStep | null {
  for (let i = 0; i < journey.length; i++) {
    if (done[i]) continue;
    if (!recordable[i] && done.slice(i + 1).some(Boolean)) continue;
    return journey[i];
  }
  return null;
}

export function Journey() {
  const learned = useLearned();
  const play = usePlay();
  const saved = useSaved();
  const recent = useRecent();
  const journal = useJournal();

  const ready = learned !== null && saved !== undefined && recent !== undefined && journal.ready;
  const held: Held | null = ready ? { learned, play, saved, recent, trades: journal.trades.length } : null;
  const done = journey.map((s) => (held ? s.signs.some((sign) => shows(sign, held)) : false));
  const count = done.filter(Boolean).length;
  const recordable = journey.map((s) => (held ? s.signs.some((sign) => canShow(sign, held)) : s.signs.length > 0));
  const tickable = recordable.filter(Boolean).length;
  const next = nextStep(done, recordable);
  const started = count > 0;

  return (
    <div>
      {started && next && (
        <div className="mb-21 flex flex-wrap items-center gap-x-21 gap-y-8">
          <Link href={next.href} className="btn btn-primary">
            Continue where I stopped
          </Link>
          <p className="text-sm text-ink-2">
            Next: step <span className="num">{journey.indexOf(next) + 1}</span>, {next.title.toLowerCase()}.
          </p>
        </div>
      )}

      <p className="max-w-measure text-sm text-ink-2" aria-live="polite">
        {!ready
          ? `Eight steps, in order. Each opens a page that already exists.`
          : started
            ? `${count} of the ${tickable} steps this browser can record at present ${count === 1 ? "is" : "are"} shown as done, from what it already holds.`
            : `Nothing this browser holds shows a step as done yet, so the path is a plain list. Take it in order, or start anywhere.`}
      </p>

      <ol className="mt-13 border-t border-line-strong">
        {journey.map((s, i) => {
          const isDone = done[i];
          const isNext = started && next?.id === s.id;
          return (
            <li key={s.id} className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-x-13 border-b border-line py-13" aria-current={isNext ? "step" : undefined}>
              <span className="pt-2">
                {isDone ? (
                  <span className="inline-grid h-21 w-21 place-items-center rounded-full border border-accent text-xs font-semibold text-accent">
                    <span aria-hidden>✓</span>
                    <span className="sr-only">Shown as done:</span>
                  </span>
                ) : (
                  <span className={`num inline-grid h-21 w-21 place-items-center rounded-full border text-xs font-semibold ${isNext ? "border-ink text-ink" : "border-line-strong text-ink-3"}`}>{i + 1}</span>
                )}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {isDone && <span className="sr-only">Step {i + 1}: </span>}
                  {s.title}
                  {isNext && <span className="chip ml-8 align-middle">Next</span>}
                </p>
                <p className="mt-2 max-w-measure text-sm text-ink-2">{s.line}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-21 gap-y-2">
                  <Link href={s.href} className="go min-h-[2.75rem] md:min-h-[2.125rem]">
                    {s.label}
                  </Link>
                  {s.also && (
                    <Link href={s.also.href} className="link inline-flex min-h-[2.75rem] items-center text-sm md:min-h-[2.125rem]">
                      {s.also.label}
                    </Link>
                  )}
                </p>
                <p className="mt-2 max-w-measure text-xs text-ink-3">{s.shownBy}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-13 max-w-measure text-xs text-ink-3">
        The path is optional and stores nothing of its own. A tick means only that this browser holds a record of the kind named under the step; it is not a measure of understanding, and no tick means no such record, not that the step was missed. Some steps leave no record at all: they stay as plain links. “Continue where I
        stopped” opens the first step not shown as done, passing over a step this browser cannot record at present once a later one is ticked. Stamps count only if the passport below has been started, and recent pages only while that list is switched on.
      </p>
    </div>
  );
}
