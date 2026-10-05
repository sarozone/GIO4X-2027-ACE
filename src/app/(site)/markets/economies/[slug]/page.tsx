import Link from "next/link";
import { notFound } from "next/navigation";
import { bankHref, eventHref, resolveTerms } from "@/components/markets/graph";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero, SpecList } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { currencyPairs, currencyProfileHref, releaseEvent } from "@/data/currency-profiles";
import { ECONOMIES, economyBank, economyCurrency, economyHref, economyIndices, economyLine, getEconomy, type Economy } from "@/data/economies";
import { instrumentHref } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * ECONOMY PROFILES — one economy. What it is known for, its central bank and
 * mandate in plain words, the releases that matter and who publishes them, its
 * main stock index and its currency. Qualitative throughout: no GDP figure, no
 * ranking, no rate, no percentage, no date of any data. An index is linked only
 * when GIO4X lists an instrument on it (src/data/instruments.ts). Unknown slugs
 * return a real 404 (`dynamicParams = false` is not used: see
 * docs/ARCHITECTURE.md).
 */
const INDEX = "/markets/economies";

export function generateStaticParams() {
  return ECONOMIES.map((e) => ({ slug: e.slug }));
}

type Params = { params: Promise<{ slug: string }> };

const describe = (e: Economy) => `${e.name}: what the economy is known for, the ${e.bank} and its mandate, the releases that matter and who publishes them. ${economyLine(e)}`;

export async function generateMetadata({ params }: Params) {
  const e = getEconomy((await params).slug);
  if (!e) return {};
  return pageMeta({ title: `${e.name}: the economy, its central bank and its releases`, description: describe(e), path: economyHref(e) });
}

/** Glossary terms worth reading beside an economy. Resolved against the glossary, so one that is not published simply drops out. */
const TERMS = ["gdp", "inflation", "monetary-policy", "central-bank", "recession", "index"];

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-34 border-t border-line pt-21">
      <h2 id={id} className="h4">
        {title}
      </h2>
      <div className="mt-13 max-w-measure text-ink-2">{children}</div>
    </section>
  );
}

export default async function Page({ params }: Params) {
  const e = getEconomy((await params).slug);
  if (!e) notFound();
  const path = economyHref(e);
  const bank = economyBank(e);
  const currency = economyCurrency(e);
  const pairs = currencyPairs({ code: e.currency });
  const indices = economyIndices(e);
  const terms = resolveTerms(TERMS);

  const at = ECONOMIES.findIndex((x) => x.slug === e.slug);
  const next = ECONOMIES[(at + 1) % ECONOMIES.length];
  const prev = ECONOMIES[(at + ECONOMIES.length - 1) % ECONOMIES.length];
  const neighbours = ECONOMIES.filter((x) => x.region === e.region && x.slug !== e.slug);

  return (
    <>
      <JsonLd data={webPageSchema({ path, name: `${e.name} (economy)`, description: describe(e) })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Economy profiles", href: INDEX },
          { name: e.name, href: path },
        ]}
        eyebrow={`Economy · ${e.region} · ${e.currency}${pairs.length ? "" : " · Context"}`}
        title={e.name}
        lead={economyLine(e)}
      >
        {currency && (
          <Link href={currencyProfileHref(currency)} className="btn btn-primary">
            {currency.name}&nbsp;<span className="num">({currency.code})</span>
          </Link>
        )}
        <Link href={`${INDEX}#${e.region.toLowerCase()}`} className="btn btn-ghost">
          All economy profiles
        </Link>
      </PageHero>

      <article className="section">
        <div className="wrap phi items-start">
          <div className="min-w-0 max-w-[48rem]">
            <section aria-labelledby="ec-is">
              <h2 id="ec-is" className="h4">
                What it is
              </h2>
              <p className="mt-13 max-w-measure text-ink-2">{e.is}</p>
            </section>

            <Block id="ec-known" title="What the economy is known for">
              <ul className="grid gap-8">
                {e.known.map((k) => (
                  <li key={k} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                    <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">A description of structure, in words. No size, share or ranking is given: those are figures, and they are read at the statistical offices named below.</p>
            </Block>

            <Block id="ec-bank" title="Its central bank and mandate">
              <p>{e.mandate}</p>
              {bank ? (
                <p className="mt-13">
                  <Link href={bankHref(bank.slug)} className="go">
                    {bank.name} on Central Bank Watch
                  </Link>
                </p>
              ) : (
                <p className="mt-13 text-sm text-ink-3">Central Bank Watch on this site has no page for this institution. Its own website is the authority on its decisions.</p>
              )}
              <p className="mt-13 text-sm text-ink-3">The policy rate, the last decision and the next meeting are not shown on this site: they are read at the bank’s own publication.</p>
            </Block>

            <Block id="ec-releases" title="The releases that matter, and who publishes them">
              <ul className="border-t border-line">
                {e.releases.map((r) => {
                  const ev = releaseEvent(r);
                  return (
                    <li key={r.name} className="grid gap-x-21 gap-y-2 border-b border-line py-13 sm:grid-cols-[1fr_auto] sm:items-baseline">
                      <span>
                        <span className="block font-medium text-ink">{r.name}</span>
                        <span className="mt-2 block text-sm text-ink-3">Published by {r.by}</span>
                      </span>
                      {ev && (
                        <Link href={eventHref(ev.slug)} className="link text-sm" title={`${ev.name}: what it measures and how it is read`}>
                          Explainer: {ev.short}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-13 text-sm text-ink-3">
                No dates or figures are shown here: each publisher’s own calendar is the authority. The explainers are in{" "}
                <Link href="/markets/events" className="link">
                  Economic Events
                </Link>
                ; a release without a link has no explainer on this site yet.
              </p>
            </Block>

            <Block id="ec-index" title="Its main stock index">
              <p>
                <span className="font-medium text-ink">{e.indexName}.</span> {e.indexNote}
              </p>
              {indices.length > 0 ? (
                <>
                  <ul className="mt-13 border-t border-line">
                    {indices.map((i) => (
                      <li key={i.slug} className="border-b border-line">
                        <Link href={instrumentHref(i)} className="group grid min-h-[2.75rem] grid-cols-[6rem_1fr_auto] items-baseline gap-x-13 py-13">
                          <span className="num font-medium text-ink transition-colors duration-fast group-hover:text-accent">{i.symbol}</span>
                          <span className="text-sm text-ink-3">{i.name}</span>
                          <span className="go self-center" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-13 text-sm text-ink-3">GIO4X lists {indices.length === 1 ? "this index" : "these indices"} as {indices.length === 1 ? "an index CFD" : "index CFDs"}. The contract and its published conditions are on the instrument page, labelled as indicative.</p>
                </>
              ) : (
                <p className="mt-13 text-sm text-ink-3">
                  GIO4X lists no instrument on a stock index of {e.phrase}. The index is named for orientation only. The indices GIO4X does list are on the{" "}
                  <Link href="/markets/indices" className="link">
                    Indices page
                  </Link>
                  .
                </p>
              )}
            </Block>

            <Block id="ec-currency" title="Its currency">
              {currency ? (
                <>
                  <p>
                    The currency of {e.phrase} is the {currency.name.replace(/^(Euro|Pound)\b/, (m) => m.toLowerCase())} ({currency.code}), issued by the {e.bank.replace(/^the /i, "")}.{" "}
                    {pairs.length ? `GIO4X lists ${pairs.length === 1 ? "one currency pair" : `${pairs.length} currency pairs`} that ${pairs.length === 1 ? "contains" : "contain"} it; they are set out on the currency’s profile.` : "It is not in any GIO4X instrument: this page and the currency’s profile are general education."}
                  </p>
                  <p className="mt-13">
                    <Link href={currencyProfileHref(currency)} className="go">
                      {currency.name} profile
                    </Link>
                  </p>
                </>
              ) : (
                <p>{e.currency}</p>
              )}
            </Block>

            {terms.length > 0 && (
              <Block id="ec-terms" title="Words worth knowing">
                <ul className="flex flex-wrap gap-8">
                  {terms.map((t) => (
                    <li key={t.id}>
                      <Link href={t.href} className="btn btn-ghost btn-sm">
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">A reference page. {educationalNote} It gives no figure, no ranking and no forecast.</p>
          </div>

          <aside className="min-w-0" aria-label={`${e.name} at a glance`}>
            <p className="eyebrow">At a glance</p>
            <SpecList
              className="mt-13 border-t border-line-strong"
              rows={[
                { label: "Region", value: e.region },
                { label: "Currency", value: e.currency },
                { label: "GIO4X currency pairs", value: pairs.length ? String(pairs.length) : "None", note: pairs.length ? undefined : "Context only" },
                { label: "GIO4X index", value: indices.length ? indices.map((i) => i.symbol).join(", ") : "None" },
              ]}
            />
            <dl className="mt-21 grid gap-13 text-sm">
              <div>
                <dt className="label">Central bank</dt>
                <dd className="mt-3 text-ink-2">
                  {bank ? (
                    <Link href={bankHref(bank.slug)} className="link">
                      {e.bank}
                    </Link>
                  ) : (
                    e.bank
                  )}
                </dd>
              </div>
              <div>
                <dt className="label">Best-known index</dt>
                <dd className="mt-3 text-ink-2">{e.indexName}</dd>
              </div>
            </dl>
            {neighbours.length > 0 && (
              <div className="mt-34">
                <p className="label">More in {e.region}</p>
                <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-3">
                  {neighbours.map((x) => (
                    <li key={x.slug}>
                      <Link href={economyHref(x)} className="link-quiet inline-flex min-h-[2.75rem] items-center text-sm hover:text-accent">
                        {x.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More economies"
        items={[
          { kind: "Previous", label: prev.name, href: economyHref(prev), note: `${prev.currency} · ${prev.bank}` },
          { kind: "Next", label: next.name, href: economyHref(next), note: `${next.currency} · ${next.bank}` },
          { kind: "Markets", label: "Economy profiles", href: INDEX, note: `All ${ECONOMIES.length}, by region.` },
          currency ? { kind: "Currency", label: currency.name, href: currencyProfileHref(currency), note: "The currency this economy issues." } : { kind: "Markets", label: "Currency profiles", href: "/markets/currencies", note: "The currencies, one page each." },
        ]}
      />
    </>
  );
}
