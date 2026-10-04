/**
 * Trading hours and market holidays.
 *
 * The rules this page keeps: the hours of each asset class are the lines
 * published in data/instruments, unchanged; every session and exchange hour is
 * worked out from lib/sessions (regular weekday hours only); and no holiday is
 * given a date unless the date is fixed and beyond doubt. There is no calendar
 * for any coming year here, because its dates would be guesses, and GIO4X's
 * own holiday schedule is shown as not yet published.
 */
import Link from "next/link";
import { clock, DAY_NAMES, fxWeek, SEASONS } from "@/components/guides/hours";
import { JsonLd } from "@/components/seo/JsonLd";
import { PendingList, RiskNote } from "@/components/trading/Blocks";
import { SessionTable } from "@/components/trading/hours/SessionTable";
import { WeekStrip } from "@/components/trading/hours/WeekStrip";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { CLOSURES_GENERAL, DST_GENERAL, GUIDES } from "@/data/guides";
import { assetClasses, instrumentHref, instrumentsByClass } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";
import { centres, fxSessions } from "@/lib/sessions";

const PATH = "/trading/hours";
const TITLE = "Trading hours and market holidays";
const DESCRIPTION =
  "Trading hours for each asset class as GIO4X publishes them, the four forex sessions and the main exchanges in UTC and in your own time zone, the trading week drawn as a strip, and how public holidays, early closes and daylight saving change the timetable.";

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH });

/** The FX week in UTC on one fixed day in each half of the year, read from lib/sessions. */
const weeks = SEASONS.map((s) => {
  const w = fxWeek("UTC", s.at);
  return { inWords: s.inWords, opens: `${DAY_NAMES[w.opens.day]} at ${clock(w.opens.minutes)} UTC`, closes: `${DAY_NAMES[w.closes.day]} at ${clock(w.closes.minutes)} UTC` };
});
/** The same week on New York's own clock: the hour is the close of the New York window in lib/sessions. */
const nyWeek = fxWeek("America/New_York", SEASONS[0].at);
const nyWords = `from ${clock(nyWeek.opens.minutes)} on ${DAY_NAMES[nyWeek.opens.day]} to ${clock(nyWeek.closes.minutes)} on ${DAY_NAMES[nyWeek.closes.day]} in New York`;
const weekWords = weeks.map((w) => `in ${w.inWords} it opens on ${w.opens} and closes on ${w.closes}`).join("; ");

const pending = [
  { label: "GIO4X holiday trading schedule", why: "Which instruments close, open late or close early on which days." },
  { label: "Trading hours for each instrument", why: "Hours are published as one line for each asset class, not as a timetable by instrument." },
  { label: "The time of the daily break", why: "Metals and energy are published with a daily break; its clock time and length are not." },
];

const kinds = [
  {
    t: "Public holidays",
    d: "An exchange closes on its own country’s public holidays. A market that trades around the clock, such as foreign exchange, carries on with one centre away and fewer participants, so prices can be thinner and spreads wider than on an ordinary day.",
  },
  {
    t: "Early closes",
    d: "On the eve of some holidays an exchange ends its session early. Instruments that follow that exchange stop when it does. The exchange announces these shortened days in its own calendar.",
  },
  {
    t: "Holidays that move",
    d: "Many holidays are set by a lunar calendar or fall on “the first Monday” or “the last Monday” of a month, so their dates differ every year. This page gives no dates for them: the exchange’s own calendar is the only reliable list.",
  },
  {
    t: "Daylight-saving changes",
    d: "Not a closure, but the timetable shifts. A session kept in its own city’s local time starts an hour earlier or later on every clock that did not change with it.",
  },
];

const faq = [
  {
    q: "When does the forex market open and close for the week?",
    a: `On the regular timetable this site uses, the FX week runs ${nyWords}. In UTC that moves with New York’s clocks: ${weekWords}. Between those hours quotes are continuous, with activity rising and falling as the Sydney, Tokyo, London and New York sessions come and go.`,
  },
  {
    q: "Do trading hours change on public holidays?",
    a: "Yes. An exchange closes on its own country’s public holidays and sometimes closes early the day before, and instruments that follow it stop with it. On 1 January and 25 December most exchanges are shut and little or nothing trades. GIO4X’s own holiday schedule is not yet published; when a change to hours is announced it will appear on the What’s new page under platforms and instruments, and on the status page.",
  },
  {
    q: "Why do session times move by an hour twice a year?",
    a: "Each session is kept in the local time of its own city. When that city moves its clocks for summer or winter, its session starts an hour earlier or later in UTC and on every clock that did not move with it. Cities change on different dates, and some do not change at all, so for a few weeks each spring and autumn the gaps and overlaps between sessions are different from the rest of the year.",
  },
];

export default function HoursPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Trading hours", href: PATH },
        ]}
        eyebrow="Trading"
        title="Trading hours and market holidays."
        lead="When each market trades, as published; the week drawn on your own clock; and what a holiday, an early close or a change of clocks does to the timetable."
      />

      {/* (a) hours by asset class, as published */}
      <section className="section" aria-labelledby="by-class">
        <div className="wrap">
          <SectionHead
            eyebrow="By asset class"
            title={<span id="by-class">The hours GIO4X has published.</span>}
            lead="One line for each asset class, exactly as published, with the instruments it covers. A timetable for each instrument is not yet published."
          />
          <dl className="mt-34 border-t border-line-strong lg:mt-55">
            {assetClasses.map((a) => {
              const list = instrumentsByClass(a.key);
              return (
                <div key={a.key} className="grid gap-x-34 gap-y-8 border-b border-line py-21 md:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)]">
                  <dt>
                    <Link href={`/markets/${a.key}`} className="h3 transition-colors duration-fast hover:text-accent">
                      {a.name}
                    </Link>
                    <span className="num mt-3 block text-xs text-ink-3">
                      {list.length} {list.length === 1 ? "instrument" : "instruments"}
                    </span>
                  </dt>
                  <dd className="text-ink">{a.hours}</dd>
                  <dd className="md:col-start-2 lg:col-start-auto">
                    <ul className="flex flex-wrap gap-x-13 gap-y-3">
                      {list.map((i) => (
                        <li key={i.slug}>
                          <Link href={instrumentHref(i)} className="num link-quiet inline-flex min-h-[2.75rem] items-center text-sm md:min-h-0">
                            {i.symbol}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              );
            })}
          </dl>
          <DataNote status="indicative" source="GIO4X published trading conditions" className="mt-13">
            Hours are described, not promised: they follow the underlying markets and change on holidays.
          </DataNote>
          <p className="mt-13 text-sm text-ink-2">
            The same lines appear beside each instrument’s lot size, spread and leverage in the{" "}
            <Link href="/trading/specifications" className="link">
              contract specifications
            </Link>
            . Once you hold an account, the session times shown for each symbol in the trading platform are authoritative.
          </p>
        </div>
      </section>

      {/* (b) the week, drawn */}
      <section className="section hairline bg-paper" aria-labelledby="week">
        <div className="wrap phi phi-r items-start">
          <div data-reveal>
            <p className="eyebrow">The week</p>
            <h2 id="week" className="h2 mt-13">
              Five days, a turn in each, and a close.
            </h2>
            <p className="lead mt-21">Foreign exchange has no opening bell. Its week is one long stretch that begins when New York’s Sunday evening is Monday morning in the Pacific, and ends when New York goes home on Friday.</p>
            <p className="mt-21 text-sm text-ink-2">
              On the regular timetable, {weekWords}. The notch in each day marks the close of the New York window, where the FX day conventionally turns. It is a mark for the turn of the day, not a published break time.
            </p>
            <Link href="/markets/clock" className="go mt-21 min-h-[2.75rem] md:min-h-0">
              The same day, hour by hour, on the World Market Clock
            </Link>
          </div>
          <div className="min-w-0">
            <WeekStrip />
          </div>
        </div>
      </section>

      {/* the sessions and the exchanges, in UTC */}
      <section className="section hairline" aria-labelledby="sessions">
        <div className="wrap">
          <SectionHead
            eyebrow="Sessions and exchanges"
            title={<span id="sessions">The timetable in UTC, and in your time.</span>}
            lead={`The ${fxSessions.length} conventional FX session windows and the regular hours of ${centres.length} exchanges. UTC is given for the middle of January and the middle of July, because the answer differs between the two halves of the year.`}
          />
          <h3 className="label mt-34 lg:mt-55">The four FX sessions</h3>
          <div className="mt-8">
            <SessionTable kind="fx" />
          </div>
          <p className="mt-13 text-sm text-ink-2">
            The session windows are a convention for when each centre is at its desks, not a rule: quotes continue between them. Where two windows are open together the market is typically at its most active, which says nothing about direction.
          </p>
          <h3 className="label mt-34">The exchanges, regular hours</h3>
          <div className="mt-8">
            <SessionTable kind="exchange" />
          </div>
          <p className="mt-13 text-sm text-ink-2">
            These are the exchanges’ own regular sessions, which index and share instruments follow in the way each asset class line above describes. They are not the hours GIO4X offers on any particular instrument.
          </p>
        </div>
      </section>

      {/* (c) holidays */}
      <section className="section hairline bg-paper" aria-labelledby="holidays">
        <div className="wrap">
          <SectionHead
            eyebrow="Market holidays"
            title={<span id="holidays">What changes the timetable.</span>}
            lead="Everything above is an ordinary week. Public holidays, early closes and changes of the clocks all move it, and none of them is modelled by the tables or the strip on this page."
          />
          <div className="phi mt-34 items-start lg:mt-55">
            <div>
              <dl className="border-t border-line-strong">
                {kinds.map((k) => (
                  <div key={k.t} className="grid gap-x-34 gap-y-5 border-b border-line py-21 md:grid-cols-[11rem_minmax(0,1fr)]">
                    <dt className="h4">{k.t}</dt>
                    <dd className="text-ink-2">{k.d}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-21 grid gap-13 text-sm text-ink-2">
                {CLOSURES_GENERAL.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {DST_GENERAL.slice(0, 2).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div>
              <h3 className="label">Fixed dates this page is sure of</h3>
              <ul className="mt-8 border-t border-line-strong">
                {["1 January", "25 December"].map((d) => (
                  <li key={d} className="flex items-baseline justify-between gap-21 border-b border-line py-13">
                    <span className="num text-[0.9375rem] font-medium text-ink">{d}</span>
                    <span className="text-right text-sm text-ink-3">Most exchanges closed</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs text-ink-3">
                No other date is listed, and there is no calendar for the coming year: the dates of most holidays differ from year to year and from exchange to exchange, and a list written here would be a guess. Each exchange publishes its own.
              </p>

              <h3 className="label mt-34">Not yet published</h3>
              <PendingList items={pending} className="mt-8" />
              <p className="mt-13 text-sm text-ink-2">
                When GIO4X announces a change to trading hours, the notice will appear on{" "}
                <Link href="/whats-new" className="link">
                  What’s new
                </Link>{" "}
                under platforms and instruments, and on the{" "}
                <Link href="/status" className="link">
                  status page
                </Link>
                .
              </p>

              <h3 className="label mt-34">Holidays by region</h3>
              <ul className="mt-8 border-t border-line">
                {GUIDES.map((g) => (
                  <li key={g.slug} className="border-b border-line">
                    <Link href={`/guides/${g.slug}`} className="go min-h-[2.75rem] py-8">
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/guides" className="link mt-13 inline-flex min-h-[2.75rem] items-center text-sm">
                All region guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* questions */}
      <section className="section hairline" aria-labelledby="faq">
        <div className="wrap">
          <SectionHead eyebrow="Questions" title={<span id="faq">Questions people ask.</span>} backdrop={false} />
          <dl className="mt-34 border-t border-line-strong">
            {faq.map((f) => (
              <div key={f.q} className="grid gap-x-34 gap-y-5 border-b border-line py-21 md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
                <dt className="h4">{f.q}</dt>
                <dd className="text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <RiskNote text={riskWarning} />

      <PunchLine k="plan" />

      <NextSteps
        items={[
          { kind: "Trading", label: "Contract specifications", href: "/trading/specifications", note: "Every instrument’s published terms in one table." },
          { kind: "Markets", label: "World Market Clock", href: "/markets/clock", note: "Which centres are in regular hours now." },
          { kind: "Guides", label: "Region guides", href: "/guides", note: "The sessions on your region’s clock, and its holidays." },
          { kind: "Updates", label: "What’s new", href: "/whats-new", note: "Where a change to hours would be recorded." },
        ]}
      />
    </>
  );
}
