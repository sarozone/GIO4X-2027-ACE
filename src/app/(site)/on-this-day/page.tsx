import Link from "next/link";
import { OnThisDayLeaf } from "@/components/history/OnThisDay";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote } from "@/config/legal";
import { MONTHS, ON_THIS_DAY, dayAnchor, dayLabel, eventsIn, type DayEvent } from "@/data/on-this-day";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * ON THIS DAY IN MARKETS — a leaf for today's date on the visitor's own
 * calendar, which can be stepped to other days, then the whole list month by
 * month. The leaf is the only part that needs a script; the list is rendered
 * here on the server, so every entry can be read, linked to and printed
 * without one. The rule the list keeps is written at the top of
 * src/data/on-this-day.ts: exact, certain dates only.
 */
const DESCRIPTION =
  "On this day in markets: dated events from market history for today’s date, with the whole list month by month. Black Monday, the Bretton Woods agreement, the end of the dollar’s link to gold, the launch of the euro, Lehman Brothers, Black Wednesday, the flash crash and more. Exact dates only; no forecasts.";

export const metadata = pageMeta({ title: "On this day in markets: dated events from market history", description: DESCRIPTION, path: "/on-this-day" });

const anchor = "scroll-mt-[calc(var(--header-h)+4.25rem)]";
const monthId = (m: number) => `m-${String(m).padStart(2, "0")}`;

/** One month's entries gathered by day, in order. */
function byDay(month: number): { day: number; events: DayEvent[] }[] {
  const out: { day: number; events: DayEvent[] }[] = [];
  for (const e of eventsIn(month)) {
    const last = out[out.length - 1];
    if (last && last.day === e.day) last.events.push(e);
    else out.push({ day: e.day, events: [e] });
  }
  return out;
}

export default function Page() {
  const years = ON_THIS_DAY.map((e) => e.year);
  const first = Math.min(...years);
  const last = Math.max(...years);
  const days = new Set(ON_THIS_DAY.map((e) => dayAnchor(e.month, e.day))).size;

  return (
    <>
      <JsonLd data={webPageSchema({ path: "/on-this-day", name: "On this day in markets", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "On this day in markets", href: "/on-this-day" },
        ]}
        eyebrow="Markets · market history"
        title="On this day in markets"
        lead={`${ON_THIS_DAY.length} dated events from ${first} to ${last}, on ${days} days of the year. The page opens at today’s date on your own calendar. An event is listed only when its exact date is certain, so some days have none.`}
      >
        <Link href="#months" className="btn btn-primary">
          The whole list
        </Link>
        <Link href="/history" className="btn btn-ghost">
          Market history
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="leaf-h">
        <div className="wrap">
          <p className="eyebrow">The day</p>
          <h2 id="leaf-h" className="h2 mt-13 max-w-[22ch]">
            What happened on this date.
          </h2>
          <div className="mt-34 min-w-0">
            <OnThisDayLeaf />
          </div>
        </div>
      </section>

      {/* month index: a scrolling rail that stays under the header */}
      <nav id="months" aria-label="Months" className={`no-print glass sticky top-[var(--header-h)] z-1 border-y border-line ${anchor}`}>
        <div className="wrap">
          <ul className="scroll-x -mx-8 flex gap-5 py-8">
            {MONTHS.map((name, i) => (
              <li key={name} className="shrink-0">
                <a href={`#${monthId(i + 1)}`} className="btn btn-quiet btn-sm h-[2.75rem] md:h-[2.125rem]">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section className="section-quiet bg-paper" aria-labelledby="list-h">
        <div className="wrap">
          <h2 id="list-h" className="sr-only">
            The whole list, month by month
          </h2>
          {MONTHS.map((name, i) => {
            const month = i + 1;
            const list = byDay(month);
            const count = list.reduce((n, d) => n + d.events.length, 0);
            return (
              <section key={name} id={monthId(month)} aria-labelledby={`${monthId(month)}-h`} className={`${i === 0 ? "" : "pt-34"} ${anchor}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-21 gap-y-5 border-b border-line-strong pb-13">
                  <h3 id={`${monthId(month)}-h`} className="h3 flex items-baseline gap-13">
                    <span className="num text-xs font-semibold tracking-[0.1em] text-ink-3" aria-hidden>
                      {String(month).padStart(2, "0")}
                    </span>
                    {name}
                  </h3>
                  <span className="num text-xs text-ink-3">
                    {count} {count === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <ol>
                  {list.map((d) => (
                    <li key={d.day} id={dayAnchor(month, d.day)} className={`grid gap-x-34 gap-y-5 border-b border-line py-13 lg:grid-cols-[minmax(0,1fr)_minmax(0,4.236fr)] ${anchor}`}>
                      <p className="font-display text-lg text-ink">
                        <span className="num">{d.day}</span> {name}
                      </p>
                      <ul className="grid min-w-0 gap-13">
                        {d.events.map((e) => (
                          <li key={`${e.year}-${e.title}`} className="grid gap-x-21 gap-y-2 sm:grid-cols-[3.4375rem_minmax(0,1fr)]">
                            <span className="num text-sm font-semibold text-ink-3">{e.year}</span>
                            <span className="min-w-0">
                              <span className="block font-medium text-ink">
                                <span className="sr-only">{dayLabel(month, d.day)}: </span>
                                {e.title}
                              </span>
                              <span className="mt-2 block max-w-measure text-sm text-ink-2">{e.text}</span>
                              {e.link && (
                                <Link href={e.link.href} className="link mt-3 inline-flex min-h-[2.75rem] items-center text-sm md:min-h-0">
                                  {e.link.label}
                                </Link>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </section>

      <section className="section hairline" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="h4">
            How this list is kept
          </h2>
          <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
            <p>An event is here only when its exact date is certain. Where the day is disputed, or only the month is known, the event is left out: a shorter list of true entries was preferred to a longer one with doubtful ones. That is why some well-known episodes appear by one date only, and why some days of the year are empty.</p>
            <p>A number appears only where it is the famous fact of the event, such as the size of a one-day fall in a published index or a rate a central bank announced. There are no other prices, and no web addresses, because they change.</p>
            <p>
              The leaf at the top reads the date from your device once the page has loaded. Nothing about it is stored or sent, and the list below it is the same for every visitor. These entries describe what happened. None of them says that anything will happen again, and nothing here is a reason to trade or not to trade.{" "}
              {educationalNote}
            </p>
          </div>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Markets", label: "Market history", href: "/history", note: "Eleven episodes, one page each, from 1637 to 2020." },
          { kind: "Markets", label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets rates, and how." },
          { kind: "Academy", label: "Market primers", href: "/primers", note: "How markets work, one subject to a page." },
          { kind: "Intelligence", label: "Morning Room", href: "/morning-room", note: "Today in sessions and schedule." },
        ]}
      />
    </>
  );
}
