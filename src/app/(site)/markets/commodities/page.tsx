import Link from "next/link";
import { CommodityFilter } from "@/components/markets/CommodityFilter";
import { Head } from "@/components/markets/Head";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { COMMODITIES, COMMODITY_CATEGORIES, TRADED_COMMODITIES, commodityHref, commodityInstrument, commodityLine, type Commodity } from "@/data/commodities";
import { instrumentHref } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * COMMODITIES, A TO Z — the index. A reference of the world's traded raw
 * materials, grouped by letter, with a search box and a choice of category.
 *
 * The rule it keeps: general education, except for the commodities GIO4X
 * lists as instruments, which are marked "Traded at GIO4X" and linked to their
 * instrument pages. Everything else is marked as not offered. No prices, no
 * tonnages, no forecasts. This folder is static, so it is served ahead of the
 * dynamic asset-class route beside it (markets/[class]).
 */
const PATH = "/markets/commodities";

const DESCRIPTION = `An A to Z of ${COMMODITIES.length} traded commodities, from aluminium to zinc: what each one is, the unit it is quoted in, where its reference contract is listed and what commonly moves it. ${TRADED_COMMODITIES.length} are GIO4X instruments; the others are general education.`;

export const metadata = pageMeta({ title: "Commodities A to Z: energy, metals, grains, softs and livestock", description: DESCRIPTION, path: PATH });

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** what the search box matches: the name, other names, the category, the unit and the exchanges */
const haystack = (c: Commodity) => [c.name, ...(c.aliases ?? []), c.category, c.quoted, c.trades].join(" ").toLowerCase();

export default function Page() {
  const byLetter = new Map<string, Commodity[]>();
  for (const c of COMMODITIES) byLetter.set(c.letter, [...(byLetter.get(c.letter) ?? []), c]);
  const groups = LETTERS.filter((k) => byLetter.has(k));
  const count = (cat: string) => COMMODITIES.filter((c) => c.category === cat).length;

  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: "Commodities A to Z", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Commodities A to Z", href: PATH },
        ]}
        eyebrow="Markets · reference"
        title="Commodities, A to Z"
        lead={`${COMMODITIES.length} raw materials that the world buys and sells, from aluminium to zinc. Each page says what the commodity is, how it is quoted, where its reference contract is listed and what commonly moves it. ${TRADED_COMMODITIES.length} of them are GIO4X instruments and are marked; the others are here to be understood, not traded here.`}
      >
        <a href="#commodities" className="btn btn-primary">
          Browse the list
        </a>
        <a href="#traded" className="btn btn-ghost">
          Traded at GIO4X
        </a>
      </PageHero>

      {/* the seven that are instruments */}
      <section className="section-quiet scroll-mt-[var(--header-h)]" id="traded" aria-labelledby="traded-title">
        <div className="wrap">
          <Head
            eyebrow="Traded at GIO4X"
            id="traded-title"
            title={<>The commodities you can trade here.</>}
            lead={`GIO4X lists ${TRADED_COMMODITIES.length} commodities as instruments: four precious metals and three energy contracts. Their published conditions are on the instrument pages, labelled as indicative.`}
            action={
              <Link href="/trading/specifications" className="go py-13 md:py-0">
                Contract specifications
              </Link>
            }
          />
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
            {TRADED_COMMODITIES.map((c) => {
              const inst = commodityInstrument(c);
              if (!inst) return null;
              return (
                <li key={c.slug} className="panel flex min-w-0 flex-col p-21">
                  <span className="label">{c.category}</span>
                  <Link href={commodityHref(c)} className="mt-8 block font-display text-xl text-ink transition-colors duration-fast hover:text-accent">
                    {c.name}
                  </Link>
                  <span className="mt-5 block text-sm text-ink-2">{c.quoted}</span>
                  <Link href={instrumentHref(inst)} className="go mt-13">
                    <span className="num">{inst.symbol}</span>&nbsp;instrument page
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* the whole list */}
      <section className="section hairline scroll-mt-[var(--header-h)]" id="commodities" aria-labelledby="list-title">
        <div className="wrap">
          <Head eyebrow="The list" id="list-title" title={<>Every commodity, by letter.</>} lead="Search by name, unit or exchange, or show one category. Open an entry for the full page." backdrop={false} />
          <div className="mt-34">
            <CommodityFilter target="commodity-list" total={COMMODITIES.length} categories={COMMODITY_CATEGORIES} />
          </div>
          <p className="mt-13 flex flex-wrap items-center gap-5 text-xs text-ink-3">
            <span className="mr-5">In each category:</span>
            {COMMODITY_CATEGORIES.map((cat) => (
              <span key={cat} className="chip">
                {cat} <span className="num">{count(cat)}</span>
              </span>
            ))}
          </p>
        </div>

        {/* the letter bar stays in reach while the list scrolls; on a phone it slides sideways inside itself */}
        <nav aria-label="Jump to a letter" className="no-print sticky top-[var(--header-h)] z-10 mt-21 border-y border-line bg-paper">
          <div className="wrap">
            <ul className="-mx-5 flex overflow-x-auto">
              {LETTERS.map((k) => (
                <li key={k} className="shrink-0 grow basis-[2.75rem]">
                  {byLetter.has(k) ? (
                    <a href={`#${k.toLowerCase()}`} className="num flex h-[2.75rem] min-w-[2.75rem] items-center justify-center text-sm font-semibold text-ink transition-colors duration-fast hover:text-accent">
                      {k}
                    </a>
                  ) : (
                    <span aria-hidden className="num flex h-[2.75rem] min-w-[2.75rem] items-center justify-center text-sm text-ink-3 opacity-50">
                      {k}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div id="commodity-list" className="wrap">
          {groups.map((k) => {
            const id = k.toLowerCase();
            return (
              <section key={k} id={id} data-az-group aria-labelledby={`co-${id}`} className="scroll-mt-[calc(var(--header-h)+3.5rem)] pt-34">
                <h3 id={`co-${id}`} className="gx-numeral border-b border-line pb-8">
                  {k}
                </h3>
                <ul className="grid gap-x-34 sm:grid-cols-2 lg:grid-cols-3">
                  {(byLetter.get(k) ?? []).map((c) => {
                    const inst = commodityInstrument(c);
                    return (
                      <li key={c.slug} data-az={haystack(c)} data-cat={c.category} data-traded={inst ? "yes" : "no"} className="min-w-0 border-b border-line py-13">
                        <Link href={commodityHref(c)} className="group flex min-h-[2.75rem] items-baseline justify-between gap-13">
                          <span className="min-w-0 font-medium text-ink transition-colors duration-fast group-hover:text-accent">{c.name}</span>
                          <span className="label shrink-0">{c.category}</span>
                        </Link>
                        <p className="text-sm text-ink-2">{commodityLine(c)}</p>
                        <p className="mt-5 text-xs text-ink-3">{c.quoted}</p>
                        {inst ? (
                          <Link href={instrumentHref(inst)} className="chip mt-8 border-accent text-accent transition-colors duration-fast hover:text-ink" title={`${inst.name}: the GIO4X instrument page`}>
                            Traded at GIO4X · <span className="num">{inst.symbol}</span>
                          </Link>
                        ) : (
                          <p className="mt-8 text-xs text-ink-3">Not a GIO4X instrument.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="h4">
            How these pages are written
          </h2>
          <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
            <p>
              This is a reference, not a price list. No page gives a price, a production figure, a market share or a forecast: those change daily or yearly and GIO4X has no licensed source for them connected to this website. What is given is durable and widely known: what the commodity is, the unit it is quoted in, the exchanges where its reference contract is listed and the producing regions.
            </p>
            <p>
              “What commonly moves it” describes the things people who follow that market usually watch. It explains; it does not predict, and it is not a reason to trade. Contract units and exchange listings do change, so for a current specification read the exchange’s own rulebook.
            </p>
            <p>
              Only the {TRADED_COMMODITIES.length} commodities marked “Traded at GIO4X” are GIO4X instruments. Every other entry says plainly that it is not offered. {educationalNote}
            </p>
            <p>
              How a raw material is traded at all (the spot market, futures and CFDs, contango and backwardation, rollover, seasons and delivery) is set out on one page:{" "}
              <Link href="/primers/how-commodities-trade" className="underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-accent">
                How commodities trade
              </Link>
              .
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
          { kind: "Markets", label: "Metals", href: "/markets/metals", note: "Gold, silver, platinum and palladium at GIO4X." },
          { kind: "Markets", label: "Energy", href: "/markets/energy", note: "Brent, WTI and natural gas at GIO4X." },
          { kind: "Trading", label: "Contract specifications", href: "/trading/specifications", note: "Every instrument’s published terms in one table." },
          { kind: "Learn", label: "Glossary", href: "/glossary", note: "The terms used on these pages, defined." },
        ]}
      />
    </>
  );
}
