import Link from "next/link";
import { notFound } from "next/navigation";
import { DayDial } from "@/components/guides/DayDial";
import { DAY_NAMES, SEASONS, clock, exchangeRows, fxRows, fxWeek, overlaps, spanCell, spanText } from "@/components/guides/hours";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { CLOSURES_GENERAL, DST_GENERAL, GUIDES, TAX_QUESTIONS, getGuide, type Guide, type GuideZone } from "@/data/guides";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * A region guide: the trading day as it reads on that region's clocks.
 *
 * The words come from data/guides; every hour on the page is worked out from
 * lib/sessions. The tables in the HTML are computed for two fixed days (the
 * middle of January and the middle of July), so nothing server-rendered is
 * presented as "now"; the dial is the part that reads the visitor's clock.
 * The tax section is a list of questions and states no rule for any country.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return pageMeta({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}` });
}

/** one reference clock, in both halves of the year */
function tablesFor(zone: GuideZone) {
  const seasons = SEASONS.map((s) => {
    const fx = fxRows(zone.tz, s.at);
    return { ...s, fx, ex: exchangeRows(zone.tz, s.at), both: overlaps(fx), week: fxWeek(zone.tz, s.at) };
  });
  // every pair of windows that is open together in either half of the year, in the order of the day
  const pairs: { key: string; names: string[] }[] = [];
  for (const s of seasons) for (const o of s.both) if (!pairs.some((p) => p.key === o.key)) pairs.push({ key: o.key, names: o.names });
  return { zone, seasons, pairs };
}

/** the two questions whose answers are computed, and the one written by hand */
function faqFor(guide: Guide, t: ReturnType<typeof tablesFor>) {
  const city = t.zone.city;
  const hours = t.seasons.map((s) => `In ${s.inWords}: ${s.fx.map((r) => `${r.name} ${spanText(r.span)}`).join("; ")}.`).join(" ");
  const both = t.seasons
    .map((s) => {
      const o = s.both.find((x) => x.key === "london+new-york");
      return o ? `from ${spanText(o.span)} in ${s.inWords}` : `not at all in ${s.inWords}`;
    })
    .join(" and ");
  return [
    {
      q: `What time do the forex sessions open and close in ${city} time?`,
      a: `On a ${city} clock, by the conventional windows this site uses: ${hours} The windows are a convention, each the business day of its own city, and not an official timetable. Public holidays are not taken into account.`,
    },
    {
      q: `When do the London and New York sessions overlap in ${city} time?`,
      a: `On a ${city} clock the London and New York windows are both open ${both}. For a few weeks around the clock changes in March and in late October the hours differ by one hour, because Britain and the United States do not change on the same day.`,
    },
    guide.faq,
  ];
}

function Part({ id, eyebrow, title, quiet, children }: { id: string; eyebrow: string; title: string; quiet?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`section hairline scroll-mt-[var(--header-h)] ${quiet ? "bg-paper" : ""}`}>
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-h`} className="h2 mt-13 max-w-[24ch]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

const Prose = ({ items }: { items: readonly string[] }) => (
  <div className="mt-21 grid max-w-measure gap-13 text-ink-2">
    {items.map((p) => (
      <p key={p}>{p}</p>
    ))}
  </div>
);

const Dashes = ({ items }: { items: readonly string[] }) => (
  <ul className="mt-21 grid max-w-measure gap-8 text-ink-2">
    {items.map((x) => (
      <li key={x} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
        <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const tables = guide.zones.map(tablesFor);
  const faq = faqFor(guide, tables[0]);
  const cities = guide.zones.map((z) => z.city).join(", ");
  const at = GUIDES.findIndex((g) => g.slug === guide.slug);
  const next = [GUIDES[(at + 1) % GUIDES.length], GUIDES[(at + GUIDES.length - 1) % GUIDES.length]];
  const terms = ["liquidity", "spread", "volatility", "gap", "rollover"].map((s) => getTerm(s)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: guide.title, description: guide.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Region guides", type: "Article" })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        quiet
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Guides", href: "/guides" },
          { name: guide.name, href: path },
        ]}
        eyebrow={`Region guide · ${guide.name}`}
        title={guide.title}
        lead={guide.lead}
      >
        <Link href="#hours" className="btn btn-primary">
          The hours in {guide.zones[0].city} time
        </Link>
        <Link href="#tax" className="btn btn-ghost">
          Questions to ask about tax
        </Link>
      </PageHero>

      <section id="dial" aria-labelledby="dial-h" className="section scroll-mt-[var(--header-h)]">
        <div className="wrap">
          <p className="eyebrow">Today</p>
          <h2 id="dial-h" className="h2 mt-13 max-w-[24ch]">
            The day on a dial.
          </h2>
          <p className="lead mt-13 max-w-measure">One turn is one day on the clock you choose: {cities}, or your own. The rings are the four FX windows, the thin arcs are the exchanges, and the hand is the present moment, read from your device.</p>
          <div className="mt-34">
            <DayDial zones={guide.zones.map((z) => ({ tz: z.tz, city: z.city }))} region={guide.name} />
          </div>
        </div>
      </section>

      <Part id="hours" quiet eyebrow="In local time" title="The four sessions and the main exchanges.">
        <Prose items={guide.day} />
        <div className={`mt-34 grid grid-cols-[minmax(0,1fr)] gap-34 ${tables.length > 1 ? "xl:grid-cols-2" : "max-w-measure"}`}>
          {tables.map((t) => (
            <div key={t.zone.tz} className="min-w-0">
              <h3 className="h4">On a {t.zone.city} clock</h3>
              <p className="mt-5 text-sm text-ink-3">{t.zone.covers}.</p>
              <div className="mt-8 overflow-x-auto">
                <table className="table-gx min-w-[25rem]">
                  <thead>
                    <tr>
                      <th scope="col">Open</th>
                      {t.seasons.map((s) => (
                        <th key={s.key} scope="col">
                          {s.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.seasons[0].fx.map((r, i) => (
                      <tr key={r.key}>
                        <th scope="row">{r.name} session</th>
                        {t.seasons.map((s) => (
                          <td key={s.key} className="num">
                            {spanCell(s.fx[i].span)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {t.seasons[0].ex.map((r, i) => (
                      <tr key={r.key}>
                        <th scope="row">
                          {r.name} <span className="text-ink-3">{r.venue}</span>
                        </th>
                        {t.seasons.map((s) => {
                          const row = s.ex[i];
                          return (
                            <td key={s.key} className="num">
                              {spanCell(row.span)}
                              {row.lunch && <span className="block text-xs text-ink-3">break {spanCell(row.lunch)}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <DataNote status="schedule" source="the timetable this site’s clocks use" className="mt-21">
          Worked out for 15 January and 15 July 2027, with the time-zone rules known when the page was built. Regular weekday hours; public holidays and early closes are not shown. “+1” means the window ends on the next day of that clock.
        </DataNote>
        <p className="mt-13 max-w-measure text-sm text-ink-3">
          The four sessions are conventions: each is roughly the business day of its own city. Foreign exchange has no opening bell. The exchanges are real venues with published hours, and the row for each shows its regular session only.
        </p>
      </Part>

      <Part id="overlap" eyebrow="Two at once" title="The hours when two sessions overlap.">
        <Prose
          items={[
            "When two windows are open together, the dealers of two financial centres are at their desks at once. More participants usually means more trading, though not on every day and not in every instrument, and it says nothing about which way a price will move.",
          ]}
        />
        <div className={`mt-34 grid grid-cols-[minmax(0,1fr)] gap-34 ${tables.length > 1 ? "xl:grid-cols-2" : "max-w-measure"}`}>
          {tables.map((t) => {
            const same = t.seasons.every((s) => s.week.opens.day === t.seasons[0].week.opens.day && s.week.opens.minutes === t.seasons[0].week.opens.minutes);
            const week = (s: (typeof t.seasons)[number]) => `opens on ${DAY_NAMES[s.week.opens.day]} at ${clock(s.week.opens.minutes)} and closes on ${DAY_NAMES[s.week.closes.day]} at ${clock(s.week.closes.minutes)}`;
            return (
              <div key={t.zone.tz} className="min-w-0">
                <h3 className="h4">On a {t.zone.city} clock</h3>
                <div className="mt-8 overflow-x-auto">
                  <table className="table-gx min-w-[25rem]">
                    <thead>
                      <tr>
                        <th scope="col">Open together</th>
                        {t.seasons.map((s) => (
                          <th key={s.key} scope="col">
                            {s.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.pairs.map((p) => (
                        <tr key={p.key}>
                          <th scope="row">{p.names.join(" × ")}</th>
                          {t.seasons.map((s) => {
                            const o = s.both.find((x) => x.key === p.key);
                            return (
                              <td key={s.key} className="num">
                                {o ? spanCell(o.span) : "none"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-13 text-sm text-ink-2">
                  The FX week, as this site counts it, {same ? `${week(t.seasons[0])} on a ${t.zone.city} clock all year.` : `${t.seasons.map((s) => `${week(s)} in ${s.inWords}`).join(", and ")}, on a ${t.zone.city} clock.`}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-21 max-w-measure text-sm text-ink-3">Counted from the same windows as the tables above, for the same two days. Individual brokers set their own opening and closing times for the week.</p>
      </Part>

      <Part id="clocks" quiet eyebrow="Daylight-saving time" title="Why the hours shift twice a year.">
        <Prose items={[...guide.dst, ...DST_GENERAL]} />
        <p className="mt-13 max-w-measure text-sm text-ink-3">Governments change these rules from time to time. The dial reads the rules held by your own device; a national time service is the authority.</p>
      </Part>

      <Part id="closed" eyebrow="Holidays" title="The kinds of day markets close.">
        <Dashes items={guide.closures} />
        <Prose items={CLOSURES_GENERAL} />
      </Part>

      <Part id="tax" quiet eyebrow="Not advice" title="Questions to ask about tax.">
        <Prose
          items={[
            "This site gives no tax or legal advice, and this page states no rule, rate or threshold for any country. How trading is taxed differs from country to country and from person to person. What follows is a list of questions to take to a qualified adviser or to your tax authority, which is where the answers are.",
          ]}
        />
        <ol className="mt-21 max-w-measure border-t border-line-strong">
          {TAX_QUESTIONS.map((q, i) => (
            <li key={q} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-13 border-b border-line py-13">
              <span className="num text-xs font-semibold text-prestige-ink">{i + 1}</span>
              <span className="text-ink-2">{q}</span>
            </li>
          ))}
        </ol>
        <p className="mt-13 max-w-measure text-sm text-ink-3">The same list appears on every region guide, because the questions are the same everywhere. Only the answers differ.</p>
      </Part>

      <Part id="faq" eyebrow="Questions people ask" title={`Forex hours in ${guide.name}: three questions.`}>
        <dl className="mt-21 grid max-w-measure gap-21 text-ink-2">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-ink">{f.q}</dt>
              <dd className="mt-5">{f.a}</dd>
            </div>
          ))}
        </dl>
        {terms.length > 0 && (
          <ul className="mt-34 flex flex-wrap items-center gap-8" aria-label="Glossary terms used on this page">
            {terms.map((t) => (
              <li key={t.slug}>
                <Link href={`/glossary/${t.slug}`} className="btn btn-ghost btn-sm">
                  {t.term}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-21 text-sm text-ink-3">
          <span className="label mr-8">Also searched as</span>
          {guide.also.join(" · ")}
        </p>
        <p className="mt-21 max-w-measure border-t border-line pt-13 text-sm text-ink-3">An explanation of a timetable. It is not advice, and the hour of the day says nothing certain about what a price will do.</p>
      </Part>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="markets" />
      <NextSteps
        title="More guides, and the clocks"
        items={[
          ...next.filter((g, i, all) => g.slug !== guide.slug && all.findIndex((x) => x.slug === g.slug) === i).map((g) => ({ kind: "Region guide", label: g.name, href: `/guides/${g.slug}`, note: g.zones.map((z) => z.city).join(" and ") + " time." })),
          { kind: "Guides", label: "All region guides", href: "/guides", note: `${GUIDES.length} regions.` },
          { kind: "Markets", label: "Market clock", href: "/markets/clock", note: "The nine centres, right now." },
        ]}
      />
    </>
  );
}
