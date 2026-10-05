import Link from "next/link";
import { Head } from "@/components/markets/Head";
import { ProfileFilter } from "@/components/markets/ProfileFilter";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { currencyPairs, currencyProfileHref } from "@/data/currency-profiles";
import { ECONOMIES, ECONOMY_REGIONS, economyCurrency, economyHref, economyIndices, economyLine, type Economy } from "@/data/economies";
import { instrumentHref } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * ECONOMY PROFILES — the index. One entry for each economy, grouped by region,
 * with a search box and a choice of region.
 *
 * The rule it keeps: general education, and qualitative. No GDP figure, no
 * ranking, no rate, no percentage and no date of any data. An economy whose
 * currency is in a GIO4X pair is marked; China and India are context, and their
 * currencies are in no GIO4X instrument. This folder is static, so it is served
 * ahead of the dynamic asset-class route beside it (markets/[class]).
 */
const PATH = "/markets/economies";

/** an economy whose currency is one side of at least one pair GIO4X lists */
const paired = (e: Economy) => currencyPairs({ code: e.currency }).length > 0;
const PAIRED = ECONOMIES.filter(paired);

const DESCRIPTION = `Profiles of ${ECONOMIES.length} economies: what each is known for, its central bank and mandate in plain words, the releases that matter and who publishes them, and its main stock index. ${PAIRED.length} stand behind the currencies of GIO4X pairs; the others are context.`;

export const metadata = pageMeta({ title: "Economy profiles: the economies behind the currencies", description: DESCRIPTION, path: PATH });

/** what the search box matches: the name, the region, the currency, the central bank, the index and the publishers of its releases */
const haystack = (e: Economy) => [e.name, e.region, e.currency, e.bank, e.indexName, ...e.releases.map((r) => r.by)].join(" ").toLowerCase();

export default function Page() {
  const inRegion = (region: string) => ECONOMIES.filter((e) => e.region === region);

  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: "Economy profiles", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Economy profiles", href: PATH },
        ]}
        eyebrow="Markets · reference"
        title="Economy profiles"
        lead={`${ECONOMIES.length} economies, one page each: what the economy is known for, its central bank and what that bank is asked to do, the releases that matter and who publishes them. ${PAIRED.length} of them stand behind the currencies of the pairs GIO4X lists; the others are context.`}
      >
        <a href="#economies" className="btn btn-primary">
          Browse the economies
        </a>
        <Link href="/markets/currencies" className="btn btn-ghost">
          Currency profiles
        </Link>
      </PageHero>

      <section className="section scroll-mt-[var(--header-h)]" id="economies" aria-labelledby="list-title">
        <div className="wrap">
          <Head eyebrow="The list" id="list-title" title={<>Every profile, by region.</>} lead="Search by name, currency, central bank or statistical office, or show one region. Open an entry for the full page." backdrop={false} />
          <div className="mt-34">
            <ProfileFilter
              target="economy-list"
              total={ECONOMIES.length}
              categories={ECONOMY_REGIONS}
              noun="economy"
              plural="economies"
              label="Search the economies"
              placeholder="A name, a currency or an office: Japan, CAD, Eurostat"
              listedLabel="Currency in GIO4X pairs"
              groupLabel="Show one region"
            />
          </div>
        </div>

        <div id="economy-list" className="wrap">
          {ECONOMY_REGIONS.map((region) => {
            const id = region.toLowerCase();
            return (
              <section key={region} id={id} data-az-group aria-labelledby={`ec-${id}`} className="scroll-mt-[var(--header-h)] pt-34">
                <h3 id={`ec-${id}`} className="h4 border-b border-line pb-8">
                  {region}
                </h3>
                <ul className="grid gap-x-34 sm:grid-cols-2 lg:grid-cols-3">
                  {inRegion(region).map((e) => {
                    const currency = economyCurrency(e);
                    const indices = economyIndices(e);
                    return (
                      <li key={e.slug} data-az={haystack(e)} data-cat={e.region} data-listed={paired(e) ? "yes" : "no"} className="min-w-0 border-b border-line py-13">
                        <Link href={economyHref(e)} className="group flex min-h-[2.75rem] items-baseline justify-between gap-13">
                          <span className="min-w-0 font-medium text-ink transition-colors duration-fast group-hover:text-accent">{e.name}</span>
                          <span className="num label shrink-0">{e.currency}</span>
                        </Link>
                        <p className="text-sm text-ink-2">{economyLine(e)}</p>
                        <p className="mt-5 text-xs text-ink-3">{e.bank}</p>
                        <p className="mt-8 flex flex-wrap items-center gap-x-13 gap-y-3 text-xs text-ink-3">
                          {currency && (
                            <Link href={currencyProfileHref(currency)} className="link-quiet font-medium hover:text-accent">
                              {currency.name}
                            </Link>
                          )}
                          {indices.map((i) => (
                            <Link key={i.slug} href={instrumentHref(i)} className="link-quiet num font-medium hover:text-accent" title={`${i.name}: the GIO4X instrument page`}>
                              {i.symbol}
                            </Link>
                          ))}
                        </p>
                        {!paired(e) && <p className="mt-5 text-xs text-ink-3">Context: its currency is not in any GIO4X instrument.</p>}
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
              These are descriptions, not data. No page gives a GDP figure, a ranking, an interest rate, a percentage or the date of a release: those change, and GIO4X has no licensed source for them connected to this website. What is given is durable and widely known: what the economy makes and sells, what its central bank is asked to do, and which office or agency publishes each release.
            </p>
            <p>
              A stock index is linked only where GIO4X lists an instrument on it. Where an economy’s best-known index is named without a link, it is named for orientation and is not a GIO4X instrument. Figures and dates are read at the publisher’s own website.
            </p>
            <p>{educationalNote} Nothing here is a forecast or a reason to trade.</p>
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
          { kind: "Markets", label: "Currency profiles", href: "/markets/currencies", note: "The currencies these economies issue." },
          { kind: "Markets", label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets rates, and how." },
          { kind: "Markets", label: "Economic Events", href: "/markets/events", note: "What the releases measure and who publishes them." },
          { kind: "Markets", label: "Indices", href: "/markets/indices", note: "The stock indices GIO4X lists." },
        ]}
      />
    </>
  );
}
