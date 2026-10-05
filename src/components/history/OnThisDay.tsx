"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MONTHS, dayAnchor, dayLabel, eventsOn, nearestDay, stepDay, type DayEvent } from "@/data/on-this-day";

/**
 * ON THIS DAY — the two things that read the visitor's own calendar: the leaf
 * at the top of /on-this-day, which can be stepped to other days, and a small
 * card other pages may place.
 *
 * The date comes from this device's clock and is read only after the page has
 * loaded: the server does not know what day it is where the visitor is, so it
 * sends a neutral state and the two can never disagree. Nothing is stored and
 * nothing is sent. The list itself (src/data/on-this-day.ts) is rendered in
 * full by the server further down the page, so it is there without a script.
 */
type Day = { month: number; day: number };

/** Today on this device, or null until the page has loaded in a browser. */
function useToday(): Day | null {
  const [today, setToday] = useState<Day | null>(null);
  useEffect(() => {
    const now = new Date();
    setToday({ month: now.getMonth() + 1, day: now.getDate() });
  }, []);
  return today;
}

function Event({ e, thisYear }: { e: DayEvent; thisYear: number | null }) {
  const ago = thisYear === null ? null : thisYear - e.year;
  return (
    <li className="grid gap-x-21 gap-y-5 border-b border-line py-21 sm:grid-cols-[5.5625rem_minmax(0,1fr)]">
      <p>
        <span className="num block font-display text-2xl font-light leading-none text-ink">{e.year}</span>
        {ago !== null && ago > 0 && (
          <span className="num mt-5 block text-xs text-ink-3">
            {ago} {ago === 1 ? "year" : "years"} ago
          </span>
        )}
      </p>
      <div className="min-w-0">
        <h3 className="h4">{e.title}</h3>
        <p className="mt-5 max-w-measure text-ink-2">{e.text}</p>
        {e.link && (
          <Link href={e.link.href} className="go mt-13 min-h-[2.75rem] md:min-h-[2.125rem]">
            {e.link.label}
          </Link>
        )}
      </div>
    </li>
  );
}

/** The leaf on /on-this-day: one day of the year, its entries, and the ways to another day. */
export function OnThisDayLeaf() {
  const today = useToday();
  const [chosen, setChosen] = useState<Day | null>(null);
  const [thisYear, setThisYear] = useState<number | null>(null);
  useEffect(() => setThisYear(new Date().getFullYear()), []);

  const at = chosen ?? today;
  if (!at) {
    // what the server sends, and what stands until the device's date has been read
    return (
      <div className="panel-quiet p-21 sm:p-34">
        <p className="label">On this day</p>
        <p className="h3 mt-8">The day is read from your device.</p>
        <p className="mt-8 max-w-measure text-sm text-ink-2">Once this page has loaded, the entries for today’s date on your own calendar appear here. The whole list, month by month, is below and needs no script.</p>
      </div>
    );
  }

  const events = eventsOn(at.month, at.day);
  const isToday = today !== null && at.month === today.month && at.day === today.day;
  const before = nearestDay(at.month, at.day, -1);
  const after = nearestDay(at.month, at.day, 1);
  const go = (d: Day) => setChosen(d);

  return (
    <div className="grid gap-x-55 gap-y-21 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.618fr)]">
      <div>
        {/* the leaf of a desk calendar: the day, large, and the month under it */}
        <div className="panel inline-grid min-w-[10.5rem] justify-items-center px-34 py-21 text-center">
          <p className="label">{isToday ? "Today" : "Another day"}</p>
          <p className="num mt-5 font-display text-6xl font-light leading-none text-ink">{at.day}</p>
          <p className="mt-8 font-display text-lg text-ink-2">{MONTHS[at.month - 1]}</p>
        </div>
        <p className="mt-13 max-w-[32ch] text-sm text-ink-3" aria-live="polite">
          {events.length === 0 ? `No entry for ${dayLabel(at.month, at.day)}.` : `${events.length} ${events.length === 1 ? "entry" : "entries"} for ${dayLabel(at.month, at.day)}.`}
          {isToday ? " Read from your device’s calendar." : ""}
        </p>
        <div className="mt-13 flex flex-wrap gap-8">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(stepDay(at.month, at.day, -1))}>
            <span aria-hidden>←</span> Day before
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(stepDay(at.month, at.day, 1))}>
            Day after <span aria-hidden>→</span>
          </button>
          {!isToday && today && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setChosen(null)}>
              Back to today
            </button>
          )}
        </div>
        <p className="mt-13 flex flex-wrap gap-x-21 gap-y-3 text-sm">
          <button type="button" className="link inline-flex min-h-[2.75rem] items-center md:min-h-[2.125rem]" onClick={() => go(before)}>
            Previous entry: {dayLabel(before.month, before.day)}
          </button>
          <button type="button" className="link inline-flex min-h-[2.75rem] items-center md:min-h-[2.125rem]" onClick={() => go(after)}>
            Next entry: {dayLabel(after.month, after.day)}
          </button>
        </p>
      </div>

      <div className="min-w-0">
        {events.length > 0 ? (
          <ol className="border-t border-line-strong">
            {events.map((e) => (
              <Event key={`${e.year}-${e.title}`} e={e} thisYear={thisYear} />
            ))}
          </ol>
        ) : (
          <div className="panel-quiet p-21">
            <p className="h4">Nothing is listed for {dayLabel(at.month, at.day)}.</p>
            <p className="mt-8 max-w-measure text-sm text-ink-2">
              An event is in the list only when its exact date is certain, so some days have none. The nearest entries are on {dayLabel(before.month, before.day)} and {dayLabel(after.month, after.day)}.
            </p>
          </div>
        )}
        <p className="mt-13 text-sm text-ink-3">
          <a href={`#m-${String(at.month).padStart(2, "0")}`} className="link">
            All of {MONTHS[at.month - 1]} in the list below
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * The small card for other pages: today's entry, or the next one when today
 * has none, with a link to the full page. Until the device's date has been
 * read it is a plain invitation, which is also what the server sends.
 */
export function OnThisDayCard({ className = "" }: { className?: string }) {
  const today = useToday();
  const events = today ? eventsOn(today.month, today.day) : [];
  const next = today && events.length === 0 ? nearestDay(today.month, today.day, 1) : null;
  const shown = today ? (events.length > 0 ? events[0] : next ? eventsOn(next.month, next.day)[0] : undefined) : undefined;
  const more = events.length > 1 ? events.length - 1 : 0;

  return (
    <aside aria-label="On this day in markets" className={`panel flex flex-col p-21 ${className}`}>
      <p className="label">
        On this day in markets
        {today && <span className="num"> · {dayLabel(today.month, today.day)}</span>}
      </p>
      {!today || !shown ? (
        <>
          <p className="h4 mt-8">A dated event from market history, for today’s date on your calendar.</p>
          <p className="mt-5 text-sm text-ink-2">Read from your device’s clock once the page has loaded. Nothing is stored or sent.</p>
        </>
      ) : (
        <>
          {next && (
            <p className="mt-8 text-sm text-ink-3">
              Nothing is listed for today. The next entry is {dayLabel(next.month, next.day)}.
            </p>
          )}
          <p className="mt-8 flex flex-wrap items-baseline gap-x-13">
            <span className="num font-display text-xl font-light text-ink">{shown.year}</span>
            <span className="h4">{shown.title}</span>
          </p>
          <p className="mt-5 text-sm text-ink-2">{shown.text}</p>
          {more > 0 && (
            <p className="mt-5 text-xs text-ink-3">
              And {more} more on this date.
            </p>
          )}
        </>
      )}
      <Link href={today && shown ? `/on-this-day#${dayAnchor(shown.month, shown.day)}` : "/on-this-day"} className="go mt-13 min-h-[2.75rem] md:min-h-[2.125rem]">
        On this day in markets
      </Link>
    </aside>
  );
}
