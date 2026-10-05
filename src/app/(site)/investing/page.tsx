import Link from "next/link";
import { Glyph } from "@/components/investing/Glyph";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { INVESTING } from "@/data/investing";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * INVESTING — the index of the instrument pages (data/investing.ts).
 *
 * The rest of the site is about trading. These pages explain what a long-term
 * investor holds: what each thing is, how it works, what it costs and where
 * people go wrong. They explain and never recommend, and every number on
 * them is an invented example.
 */
const DESCRIPTION =
  "Investing explained for beginners: stocks, bonds, ETFs, mutual funds, index investing, options and futures. One page each on what it is, how it works, what it costs and the risks, with an interactive example. How investing differs from trading. Explanations, not advice.";

export const metadata = pageMeta({ title: "Investing explained: stocks, bonds, ETFs, funds, options and futures", description: DESCRIPTION, path: "/investing" });

const differs = [
  { what: "The time in view", investing: "Years or decades. The holding is meant to be left alone.", trading: "Minutes to weeks. The position is meant to be closed." },
  { what: "Where the result comes from", investing: "What the holdings earn and pay over time: profits, dividends, interest. Prices follow, unevenly.", trading: "The change in a price over a short period, in either direction." },
  { what: "What it costs", investing: "Mostly a yearly charge on the amount held. Dealing is rare, so its cost is small beside it.", trading: "A spread or commission on every trade, and financing on positions kept open. The cost rises with every trade made." },
  { what: "Borrowed exposure", investing: "Usually none: the money at work is the holder’s own, and the most that can be lost is what was put in.", trading: "Often used. It multiplies gains and losses alike, and a loss can arrive faster than it can be acted on." },
  { what: "What it asks of the person", investing: "Patience, and the nerve to do nothing during a fall.", trading: "Constant attention, a method and the discipline to keep to it." },
];

const glance = [
  { name: "Stocks", has: "A part of a company", priced: "On an exchange, through the day", ends: "No" },
  { name: "Bonds", has: "A loan to a government or a company", priced: "Between dealers, through the day", ends: "Yes: maturity" },
  { name: "ETFs", has: "Units of a fund that holds a basket", priced: "On an exchange, through the day", ends: "No" },
  { name: "Mutual funds", has: "Units of a pooled fund", priced: "By the fund, once a day", ends: "No" },
  { name: "Index funds", has: "Units of a fund that holds a whole index", priced: "As an ETF or as a mutual fund", ends: "No" },
  { name: "Options", has: "A right to buy or sell at a set price", priced: "On an exchange, through the day", ends: "Yes: expiry" },
  { name: "Futures", has: "An obligation to buy or sell at a set price", priced: "On an exchange, through the day", ends: "Yes: expiry" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/investing", name: "Investing explained", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Investing", href: "/investing" },
        ]}
        eyebrow="Investing · explained"
        title="What an investor actually holds."
        lead={`${INVESTING.length} pages, one for each thing a long-term investor meets. Each says what it is, how it works, what it costs and where people go wrong, and each has one working example to move with your own hands. None of them says what to buy.`}
      >
        <Link href="#instruments" className="btn btn-primary">
          See the seven
        </Link>
        <Link href="#differs" className="btn btn-ghost">
          Investing or trading?
        </Link>
      </PageHero>

      <section id="instruments" className="section scroll-mt-[var(--header-h)]" aria-labelledby="instruments-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            01
          </p>
          <p className="eyebrow mt-8">The instruments</p>
          <h2 id="instruments-h" className="h2 mt-13 max-w-[22ch]">
            Seven things, one page each.
          </h2>
          <p className="lead mt-13 max-w-measure">The first five are what most long-term savings are made of. The last two are contracts built on top of other things; an investor meets them sooner or later, and they behave very differently.</p>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {INVESTING.map((it, i) => (
              <li key={it.slug}>
                <Link href={`/investing/${it.slug}`} className="gx-play-card group flex flex-col">
                  <span className="flex items-start justify-between gap-13">
                    <Glyph slug={it.slug} />
                    <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="mt-21 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{it.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{it.card}</span>
                  <span className="mt-13 block text-xs text-ink-3">Try it: {it.machine.title.replace(/\.$/, "").toLowerCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="differs" className="section hairline scroll-mt-[var(--header-h)] bg-paper" aria-labelledby="differs-h">
        <div className="wrap phi items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="gx-numeral" aria-hidden>
              02
            </p>
            <p className="eyebrow mt-8">Two different things</p>
            <h2 id="differs-h" className="h2 mt-13">
              Investing and trading are not the same activity.
            </h2>
            <p className="lead mt-13 max-w-[30rem]">They use the same markets and some of the same words, and that is where the likeness ends. Most of this website is about trading. These pages are about the other one.</p>
            <p className="mt-21 max-w-narrow text-ink-2">Neither is safe. A long time in view makes a loss less likely to be permanent; it does not make it impossible, and money that will be needed soon is exposed to whatever the market does before then.</p>
          </div>
          <div className="min-w-0">
            <dl className="border-t border-line">
              {differs.map((d) => (
                <div key={d.what} className="border-b border-line py-21">
                  <dt className="h4">{d.what}</dt>
                  <dd className="mt-13 grid gap-13 sm:grid-cols-2 sm:gap-21">
                    <p className="text-ink-2">
                      <span className="label mb-5 block text-prestige-ink">Investing</span>
                      {d.investing}
                    </p>
                    <p className="text-ink-2">
                      <span className="label mb-5 block">Trading</span>
                      {d.trading}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="glance-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            03
          </p>
          <p className="eyebrow mt-8">Side by side</p>
          <h2 id="glance-h" className="h2 mt-13 max-w-[22ch]">
            What the holder has, in one line each.
          </h2>
          <div className="mt-34 overflow-x-auto">
            <table className="table-gx w-full min-w-[40rem] text-sm">
              <thead>
                <tr>
                  <th scope="col">Instrument</th>
                  <th scope="col">What the holder has</th>
                  <th scope="col">How it is usually priced</th>
                  <th scope="col">Has an end date</th>
                </tr>
              </thead>
              <tbody>
                {glance.map((g) => (
                  <tr key={g.name}>
                    <th scope="row" className="text-ink">
                      {g.name}
                    </th>
                    <td>{g.has}</td>
                    <td>{g.priced}</td>
                    <td>{g.ends}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataNote status="reference" className="mt-21">
            General descriptions of how these instruments usually work. Details differ by country, market and product. {educationalNote}
          </DataNote>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">The value of any investment can fall as well as rise, and an investor can get back less than was put in. Futures, and options that have been sold, can lose more than the amount first put down.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="arithmetic" />
      <NextSteps
        items={[
          { kind: "Investing", label: "Start with stocks", href: "/investing/stocks", note: "A company cut into a thousand parts." },
          { kind: "Academy", label: "The Academy", href: "/academy", note: "Lessons on markets, from the beginning." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The words, one at a time." },
          { kind: "Free", label: "Nice & Need", href: "/nice-and-need", note: "Free public sources worth knowing." },
        ]}
      />
    </>
  );
}
