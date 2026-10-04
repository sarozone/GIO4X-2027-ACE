import Link from "next/link";
import { CenturyLine } from "@/components/history/CenturyLine";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { HISTORY } from "@/data/history";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * MARKET HISTORY — the index: one line across four centuries with the eleven
 * episodes as stops, then the same eleven as a list. The rule it keeps: only
 * dates and established facts; no price series, and nothing that reads as a
 * lesson in what to do.
 */
const DESCRIPTION =
  "Market history in eleven episodes, from tulip mania in the 1630s to the pandemic crash of 2020: the South Sea Bubble, 1929, Black Monday, Black Wednesday, the Asian crisis, the dot-com bubble, 2008, the flash crash and the Swiss franc move. What happened, in order, and what changed.";

export const metadata = pageMeta({ title: "Market history: eleven crashes and bubbles, from 1637 to 2020", description: DESCRIPTION, path: "/history" });

export default function Page() {
  const stops = HISTORY.map(({ slug, name, year, span, place, line }) => ({ slug, name, year, span, place, line }));
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/history", name: "Market history", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Market history", href: "/history" },
        ]}
        eyebrow="Academy · market history"
        title="Market history"
        lead={`${HISTORY.length} episodes across four centuries. Each page sets out what led up to it, what happened in order, what changed afterwards and what it helps to understand. Dates and established facts only; where the record is disputed, the page says so.`}
      />

      <section className="section" aria-labelledby="line-h">
        <div className="wrap">
          <p className="eyebrow">The line</p>
          <h2 id="line-h" className="h2 mt-13 max-w-[22ch]">
            Four centuries, eleven stops.
          </h2>
          <p className="lead mt-13 max-w-measure">Step along the line, or press Play. Each stop names an episode and links to its page.</p>
          <div className="mt-34 min-w-0">
            <CenturyLine stops={stops} />
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="list-h">
        <div className="wrap">
          <p className="eyebrow">The episodes</p>
          <h2 id="list-h" className="h2 mt-13 max-w-[22ch]">
            In order of date.
          </h2>
          <ol className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {HISTORY.map((e) => (
              <li key={e.slug} className="min-w-0">
                <Link href={`/history/${e.slug}`} className="panel group flex h-full flex-col p-21">
                  <span className="label">
                    <span className="num">{e.span}</span> · {e.place}
                  </span>
                  <span className="mt-8 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{e.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{e.line}</span>
                  <span className="go mt-13" aria-hidden>
                    Read
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="h4">
            How these pages are written
          </h2>
          <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
            <p>A number appears only where it is famous and certain, such as the size of a one-day fall in a published index or a rate announced by a central bank. Where historians disagree, or the record is thin, the page says so and gives no figure.</p>
            <p>The curve on each page is an illustrative shape, not market data: a hand-made line on a scale of 0 to 100 with no axis values, there to show the order of a rise and a fall. Each page names the documents its account rests on, by title, issuer and date, and has a short exercise in what was knowable at the time.</p>
            <p>These pages describe what happened. They do not say that anything will happen again, and nothing in them is a reason to trade or not to trade. {educationalNote}</p>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="trend" />
      <NextSteps
        items={[
          { kind: "Academy", label: "The Academy", href: "/academy", note: "Lessons, from the first to the last." },
          { kind: "Academy", label: "The Playbook", href: "/playbook", note: "Patterns and situations, one page each." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
          { kind: "Labs", label: "The simulator", href: "/labs/simulator", note: "Generated prices, nothing at stake." },
        ]}
      />
    </>
  );
}
