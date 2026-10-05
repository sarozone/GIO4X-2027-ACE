import Link from "next/link";
import { Head } from "@/components/markets/Head";
import { ProfileFilter } from "@/components/markets/ProfileFilter";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { CURRENCY_KINDS, CURRENCY_KIND_NOTES, CURRENCY_PROFILES, PAIRED_CURRENCIES, UNPAIRED_CURRENCIES, currencyLine, currencyPairs, currencyProfileHref, type CurrencyProfile } from "@/data/currency-profiles";
import { instrumentHref } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * CURRENCY PROFILES — the index. One entry for each currency, in two groups:
 * those in the pairs GIO4X lists, and widely followed currencies that are in
 * none of its instruments. A search box and a choice of description.
 *
 * The rule it keeps: general education. Which pairs contain a currency is
 * computed from src/data/instruments.ts; a currency in none is marked as such.
 * No exchange rates, no interest rates, no forecasts. This folder is static, so
 * it is served ahead of the dynamic asset-class route beside it
 * (markets/[class]).
 */
const PATH = "/markets/currencies";

const DESCRIPTION = `Profiles of ${CURRENCY_PROFILES.length} currencies: who issues each one, how it is commonly described, what typically moves it, the scheduled releases to know and its main session. ${PAIRED_CURRENCIES.length} are in GIO4X currency pairs; the others are general education.`;

export const metadata = pageMeta({ title: "Currency profiles: the dollar, euro, pound, yen and more", description: DESCRIPTION, path: PATH });

/** what the search box matches: the code, the name, what people call it, where it is used, who issues it and how it is described */
const haystack = (c: CurrencyProfile) => [c.code, c.name, ...c.nicknames, c.area, c.issuer, ...c.kinds, c.session].join(" ").toLowerCase();

const GROUPS: { id: string; title: string; note: string; list: readonly CurrencyProfile[] }[] = [
  { id: "paired", title: "In GIO4X currency pairs", note: "Each of these is one side of at least one pair GIO4X lists.", list: PAIRED_CURRENCIES },
  { id: "others", title: "Widely followed, not in any GIO4X instrument", note: "General education about currencies that trade elsewhere. GIO4X lists no pair that contains them.", list: UNPAIRED_CURRENCIES },
];

export default function Page() {
  const count = (kind: string) => CURRENCY_PROFILES.filter((c) => (c.kinds as readonly string[]).includes(kind)).length;

  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: "Currency profiles", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Currency profiles", href: PATH },
        ]}
        eyebrow="Markets · reference"
        title="Currency profiles"
        lead={`${CURRENCY_PROFILES.length} currencies, one page each: who issues it, how people describe it, what typically moves it, the releases read for it and when it is busiest. ${PAIRED_CURRENCIES.length} of them are in the pairs GIO4X lists and are marked; the others are here to be understood, not traded here.`}
      >
        <a href="#currencies" className="btn btn-primary">
          Browse the currencies
        </a>
        <Link href="/markets/forex" className="btn btn-ghost">
          Forex at GIO4X
        </Link>
      </PageHero>

      <section className="section scroll-mt-[var(--header-h)]" id="currencies" aria-labelledby="list-title">
        <div className="wrap">
          <Head eyebrow="The list" id="list-title" title={<>Every profile, in two groups.</>} lead="Search by code, name, nickname or issuer, or show one description. Open an entry for the full page." backdrop={false} />
          <div className="mt-34">
            <ProfileFilter
              target="currency-list"
              total={CURRENCY_PROFILES.length}
              categories={CURRENCY_KINDS}
              noun="currency"
              plural="currencies"
              label="Search the currencies"
              placeholder="A code, a name or an issuer: yen, kiwi, Riksbank"
              listedLabel="In GIO4X pairs"
              groupLabel="Show one description"
            />
          </div>
          <p className="mt-13 flex flex-wrap items-center gap-5 text-xs text-ink-3">
            <span className="mr-5">Commonly described as:</span>
            {CURRENCY_KINDS.map((kind) => (
              <span key={kind} className="chip" title={CURRENCY_KIND_NOTES[kind]}>
                {kind} <span className="num">{count(kind)}</span>
              </span>
            ))}
          </p>
        </div>

        <div id="currency-list" className="wrap">
          {GROUPS.map((g) => (
            <section key={g.id} id={g.id} data-az-group aria-labelledby={`cu-${g.id}`} className="scroll-mt-[var(--header-h)] pt-34">
              <h3 id={`cu-${g.id}`} className="h4 border-b border-line pb-8">
                {g.title}
              </h3>
              <p className="mt-8 text-sm text-ink-3">{g.note}</p>
              <ul className="grid gap-x-34 sm:grid-cols-2 lg:grid-cols-3">
                {g.list.map((c) => {
                  const pairs = currencyPairs(c);
                  return (
                    <li key={c.code} data-az={haystack(c)} data-cat={c.kinds.join("|")} data-listed={pairs.length ? "yes" : "no"} className="min-w-0 border-b border-line py-13">
                      <Link href={currencyProfileHref(c)} className="group flex min-h-[2.75rem] items-baseline justify-between gap-13">
                        <span className="min-w-0 font-medium text-ink transition-colors duration-fast group-hover:text-accent">{c.name}</span>
                        <span className="num label shrink-0">{c.code}</span>
                      </Link>
                      <p className="text-sm text-ink-2">{currencyLine(c)}</p>
                      <p className="mt-5 text-xs text-ink-3">
                        {c.issuer} · {c.kinds.join(", ")}
                      </p>
                      {pairs.length ? (
                        <p className="mt-8 flex flex-wrap items-center gap-x-13 gap-y-3 text-xs text-ink-3">
                          <span>GIO4X pairs:</span>
                          {pairs.map((i) => (
                            <Link key={i.slug} href={instrumentHref(i)} className="link-quiet num font-medium hover:text-accent" title={`${i.name}: the GIO4X instrument page`}>
                              {i.symbol}
                            </Link>
                          ))}
                        </p>
                      ) : (
                        <p className="mt-8 text-xs text-ink-3">Not in any GIO4X instrument.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="h4">
            How these pages are written
          </h2>
          <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
            <p>
              This is a reference, not a rate sheet. No page gives an exchange rate, an interest rate, a statistic or a forecast: those change daily and GIO4X has no licensed source for them connected to this website. What is given is durable and widely known: who issues the currency, the releases that are read for it and who publishes them, and a short history.
            </p>
            <p>
              “Reserve currency”, “safe haven” and “commodity-linked” are descriptions people use, drawn from how a currency has commonly behaved. They are not promises: a currency called a safe haven can fall on a day of stress. “What typically moves it” explains; it does not predict, and it is not a reason to trade.
            </p>
            <p>
              Only the {PAIRED_CURRENCIES.length} currencies marked as being in GIO4X pairs can be traded here, and only in the pairs named. Every other profile says plainly that the currency is in no GIO4X instrument. {educationalNote}
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
          { kind: "Markets", label: "Economy profiles", href: "/markets/economies", note: "The economies behind these currencies." },
          { kind: "Markets", label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets rates, and how." },
          { kind: "Markets", label: "Economic Events", href: "/markets/events", note: "What the releases measure and who publishes them." },
          { kind: "Markets", label: "Forex", href: "/markets/forex", note: "The currency pairs GIO4X lists." },
        ]}
      />
    </>
  );
}
