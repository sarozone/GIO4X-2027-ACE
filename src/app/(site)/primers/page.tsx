import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { PRIMERS } from "@/data/primers";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * MARKET PRIMERS — the index: every primer as a card, then how the pages are
 * written. The rule they keep: general, well-established facts in plain
 * words, one invented example each, and a plain statement of what GIO4X does
 * and does not list. Nothing here recommends anything.
 */
const DESCRIPTION =
  "Market primers: plain explanations of how markets work, one subject to a page. How commodities trade, bonds and interest rates, ETFs and funds, order types in depth, market microstructure, algorithmic trading, trading psychology, what moves a currency, Islamic finance, record keeping for tax, regulation, choosing a broker and trading myths. Each with a worked example and a note of what it does not cover.";

export const metadata = pageMeta({ title: "Market primers: how markets work, one subject to a page", description: DESCRIPTION, path: "/primers" });

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/primers", name: "Market primers", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Market primers", href: "/primers" },
        ]}
        eyebrow="Academy · how markets work"
        title="Market primers"
        lead={`${PRIMERS.length} longer explanations, one subject to a page: what the thing is, how it works, one worked example in round numbers and what the page does not tell you. They describe; none of them recommends anything.`}
      />

      <section className="section" aria-labelledby="pr-list">
        <div className="wrap">
          <p className="eyebrow">The primers</p>
          <h2 id="pr-list" className="h2 mt-13 max-w-[22ch]">
            One subject to a page.
          </h2>
          <ol className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {PRIMERS.map((p, i) => (
              <li key={p.slug} className="min-w-0">
                <Link href={`/primers/${p.slug}`} className="panel group flex h-full flex-col p-21">
                  <span className="label">
                    Primer <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="mt-8 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{p.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{p.card}</span>
                  <span className="mt-13 block text-xs text-ink-3">{p.sections.map((s) => s.title).join(" · ")}</span>
                  <span className="go mt-13" aria-hidden>
                    Read
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="pr-how">
        <div className="wrap">
          <h2 id="pr-how" className="h4">
            How these pages are written
          </h2>
          <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
            <p>Each primer keeps to what is general, durable and well established. There are no prices, no forecasts and no statistics, and nothing is called the best. Where a matter is disputed, or differs from one firm or country to another, the page says so.</p>
            <p>Every primer has one worked example. Its figures are invented round numbers chosen to make the arithmetic easy to follow. They are not market prices and they are not GIO4X’s fees.</p>
            <p>
              Several of these pages describe things GIO4X does not offer, such as bonds, funds and exchange-traded futures, because they explain the markets it does list. Each page has a section headed “At GIO4X” that says plainly what is listed, what is not, and what has not yet been published. {educationalNote}
            </p>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        items={[
          { kind: "Academy", label: "The Academy", href: "/academy", note: "Lessons, level by level." },
          { kind: "Academy", label: "Investing", href: "/investing", note: "Stocks, bonds, ETFs, funds, options and futures." },
          { kind: "Academy", label: "Side by side", href: "/side-by-side", note: "Order types, instruments and costs compared." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
        ]}
      />
    </>
  );
}
