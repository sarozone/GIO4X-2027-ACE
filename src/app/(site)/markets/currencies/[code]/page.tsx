import Link from "next/link";
import { notFound } from "next/navigation";
import { bankHref, eventHref, resolveTerms } from "@/components/markets/graph";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero, SpecList } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { CURRENCY_KIND_NOTES, CURRENCY_PROFILES, PAIRED_CURRENCIES, currencyBank, currencyLine, currencyOtherInstruments, currencyPairs, currencyProfileHref, getCurrencyProfile, releaseEvent, type CurrencyKind, type CurrencyProfile } from "@/data/currency-profiles";
import { economyHref, economyOfCurrency } from "@/data/economies";
import { instrumentHref } from "@/data/instruments";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * CURRENCY PROFILES — one currency. Who issues it, how it is commonly
 * described, what typically moves it, the scheduled releases to know, its main
 * session, the GIO4X pairs that contain it and a short history. The pairs are
 * computed from src/data/instruments.ts and none of their conditions is
 * repeated; a currency in no pair says so. The address is the ISO code in lower
 * case. Unknown codes return a real 404 (`dynamicParams = false` is not used:
 * see docs/ARCHITECTURE.md).
 */
const INDEX = "/markets/currencies";

export function generateStaticParams() {
  return CURRENCY_PROFILES.map((c) => ({ code: c.code.toLowerCase() }));
}

type Params = { params: Promise<{ code: string }> };

const describe = (c: CurrencyProfile, paired: boolean) =>
  `${c.name} (${c.code}). Issuer: ${c.issuer}. ${currencyLine(c)} ${paired ? "In GIO4X currency pairs." : "General education: not in any GIO4X instrument."}`;

export async function generateMetadata({ params }: Params) {
  const c = getCurrencyProfile((await params).code);
  if (!c) return {};
  return pageMeta({ title: `${c.name} (${c.code}): who issues it and what moves it`, description: describe(c, currencyPairs(c).length > 0), path: currencyProfileHref(c) });
}

/** Glossary terms worth reading beside a description. Resolved against the glossary, so one that is not published simply drops out. */
const KIND_TERMS: Record<CurrencyKind, string[]> = {
  "Reserve currency": ["reserve-currency", "central-bank"],
  "Safe haven": ["safe-haven", "risk-appetite"],
  "Commodity-linked": ["commodity-currencies"],
  "Funding currency": ["carry-trade", "interest-rate-differential"],
  "Risk-sensitive": ["risk-appetite", "volatility"],
  "Emerging market": ["liquidity", "volatility"],
  "Managed or pegged": ["currency-peg", "intervention"],
};
const COMMON_TERMS = ["monetary-policy", "interest-rate-differential", "inflation", "currency-pair", "pip"];

/** "Euro" and "Pound sterling" are capitalised as titles only; the names that begin with a country keep their capital */
const inSentence = (name: string) => name.replace(/^(Euro|Pound)/, (m) => m.toLowerCase());

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
  const c = getCurrencyProfile((await params).code);
  if (!c) notFound();
  const path = currencyProfileHref(c);
  const pairs = currencyPairs(c);
  const others = currencyOtherInstruments(c);
  const bank = currencyBank(c);
  const economy = economyOfCurrency(c.code);
  const terms = resolveTerms([...c.kinds.flatMap((k) => KIND_TERMS[k]), ...COMMON_TERMS]).slice(0, 7);

  const at = CURRENCY_PROFILES.findIndex((x) => x.code === c.code);
  const next = CURRENCY_PROFILES[(at + 1) % CURRENCY_PROFILES.length];
  const prev = CURRENCY_PROFILES[(at + CURRENCY_PROFILES.length - 1) % CURRENCY_PROFILES.length];
  const group = CURRENCY_PROFILES.filter((x) => x.code !== c.code && (currencyPairs(x).length > 0) === (pairs.length > 0));

  return (
    <>
      <JsonLd data={webPageSchema({ path, name: `${c.name} (${c.code})`, description: describe(c, pairs.length > 0) })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Currency profiles", href: INDEX },
          { name: c.code, href: path },
        ]}
        eyebrow={`Currency · ${c.code} · ${pairs.length ? "In GIO4X pairs" : "Not in any GIO4X instrument"}`}
        title={c.name}
        lead={currencyLine(c)}
      >
        {pairs.length ? (
          <a href="#cu-gio4x" className="btn btn-primary">
            The GIO4X pairs that contain it
          </a>
        ) : (
          <Link href={`${INDEX}#paired`} className="btn btn-ghost">
            The currencies GIO4X does list
          </Link>
        )}
        <Link href={INDEX} className="btn btn-ghost">
          All currency profiles
        </Link>
      </PageHero>

      <article className="section">
        <div className="wrap phi items-start">
          <div className="min-w-0 max-w-[48rem]">
            <section aria-labelledby="cu-is">
              <h2 id="cu-is" className="h4">
                What it is
              </h2>
              <p className="mt-13 max-w-measure text-ink-2">{c.is}</p>
            </section>

            <Block id="cu-issuer" title="Who issues it">
              <p>{c.issuerNote}</p>
              {bank ? (
                <p className="mt-13">
                  <Link href={bankHref(bank.slug)} className="go">
                    {bank.name} on Central Bank Watch
                  </Link>
                </p>
              ) : (
                <p className="mt-13 text-sm text-ink-3">Central Bank Watch on this site has no page for this institution. Its own website is the authority on its decisions.</p>
              )}
            </Block>

            <Block id="cu-kinds" title="How it is commonly described">
              <dl className="grid gap-8">
                {c.kinds.map((k) => (
                  <div key={k} className="grid gap-x-21 gap-y-2 sm:grid-cols-[11rem_1fr]">
                    <dt className="font-medium text-ink">{k}</dt>
                    <dd>{CURRENCY_KIND_NOTES[k]}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-13">{c.kindsNote}</p>
              <p className="mt-13 text-sm text-ink-3">These are descriptions people use, drawn from how the currency has commonly behaved. They are not promises about how it will behave.</p>
            </Block>

            <Block id="cu-drivers" title="What typically moves it">
              <ul className="grid gap-8">
                {c.drivers.map((d) => (
                  <li key={d} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                    <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">These are the things people who follow this currency usually watch. They explain how the market works; they do not say what the exchange rate will do next.</p>
            </Block>

            <Block id="cu-releases" title="The scheduled releases to know">
              <ul className="border-t border-line">
                {c.releases.map((r) => {
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

            <Block id="cu-session" title="Its main session">
              <p>
                <span className="font-medium text-ink">{c.session}.</span> {c.sessionNote}
              </p>
              <p className="mt-13 flex flex-wrap gap-13">
                <Link href="/markets/clock" className="btn btn-ghost btn-sm">
                  World Market Clock
                </Link>
                <Link href="/trading/hours" className="btn btn-ghost btn-sm">
                  Trading hours
                </Link>
              </p>
            </Block>

            <Block id="cu-gio4x" title="At GIO4X">
              {pairs.length ? (
                <>
                  <p>
                    GIO4X lists {pairs.length === 1 ? "one currency pair" : `${pairs.length} currency pairs`} that {pairs.length === 1 ? "contains" : "contain"} the {inSentence(c.name)}. Each pair’s contract and published conditions are on its instrument page, where they are labelled as indicative. They are not repeated here.
                  </p>
                  <ul className="mt-13 border-t border-line">
                    {pairs.map((i) => (
                      <li key={i.slug} className="border-b border-line">
                        <Link href={instrumentHref(i)} className="group grid min-h-[2.75rem] grid-cols-[6rem_1fr_auto] items-baseline gap-x-13 py-13">
                          <span className="num font-medium text-ink transition-colors duration-fast group-hover:text-accent">{i.symbol}</span>
                          <span className="text-sm text-ink-3">{i.name}</span>
                          <span className="go self-center" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    The {inSentence(c.name)} is not in any GIO4X instrument. This page is general education about a currency that trades elsewhere, and nothing on it means that GIO4X quotes, trades or gives access to it.
                  </p>
                  <p className="mt-13">
                    The currencies in the pairs GIO4X does list are{" "}
                    {PAIRED_CURRENCIES.map((t, i) => (
                      <span key={t.code}>
                        {i > 0 && (i === PAIRED_CURRENCIES.length - 1 ? " and " : ", ")}
                        <Link href={currencyProfileHref(t)} className="link">
                          {t.code}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                </>
              )}
              {others.length > 0 && (
                <div className="mt-21">
                  <p className="text-sm text-ink-3">Other GIO4X instruments whose pages name {c.code}:</p>
                  <ul className="mt-5 flex flex-wrap gap-x-13 gap-y-3">
                    {others.map((i) => (
                      <li key={`${i.class}-${i.slug}`}>
                        <Link href={instrumentHref(i)} className="link-quiet num inline-flex min-h-[2.75rem] items-center text-sm font-medium hover:text-accent md:min-h-[1.625rem]" title={i.name}>
                          {i.symbol}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Block>

            <Block id="cu-history" title="A short history">
              <p>{c.history}</p>
            </Block>

            {terms.length > 0 && (
              <Block id="cu-terms" title="Words worth knowing">
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

            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">A reference page. {educationalNote} It gives no exchange rate, no interest rate and no forecast.</p>
          </div>

          <aside className="min-w-0" aria-label={`${c.name} at a glance`}>
            <p className="eyebrow">At a glance</p>
            <SpecList
              className="mt-13 border-t border-line-strong"
              rows={[
                { label: "ISO code", value: c.code },
                { label: "Symbol", value: c.symbol },
                { label: "Main session", value: c.session.replace(/ \(.*\)$/, "") },
                { label: "GIO4X pairs", value: pairs.length ? String(pairs.length) : "None", note: pairs.length ? undefined : "General education" },
              ]}
            />
            <dl className="mt-21 grid gap-13 text-sm">
              <div>
                <dt className="label">Issued by</dt>
                <dd className="mt-3 text-ink-2">
                  {bank ? (
                    <Link href={bankHref(bank.slug)} className="link">
                      {c.issuer}
                    </Link>
                  ) : (
                    c.issuer
                  )}
                </dd>
              </div>
              <div>
                <dt className="label">Used in</dt>
                <dd className="mt-3 text-ink-2">{c.area}</dd>
              </div>
              <div>
                <dt className="label">Also called</dt>
                <dd className="mt-3 text-ink-2">{c.nicknames.join(", ")}</dd>
              </div>
              {economy && (
                <div>
                  <dt className="label">The economy behind it</dt>
                  <dd className="mt-3 text-ink-2">
                    <Link href={economyHref(economy)} className="link">
                      {economy.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            {group.length > 0 && (
              <div className="mt-34">
                <p className="label">{pairs.length ? "Others in GIO4X pairs" : "Others not in any GIO4X instrument"}</p>
                <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-3">
                  {group.map((x) => (
                    <li key={x.code}>
                      <Link href={currencyProfileHref(x)} className="link-quiet inline-flex min-h-[2.75rem] items-center text-sm hover:text-accent" title={x.name}>
                        {x.code}
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
        title="More currencies"
        items={[
          { kind: "Previous", label: prev.name, href: currencyProfileHref(prev), note: `${prev.code} · ${prev.issuer}` },
          { kind: "Next", label: next.name, href: currencyProfileHref(next), note: `${next.code} · ${next.issuer}` },
          { kind: "Markets", label: "Currency profiles", href: INDEX, note: `All ${CURRENCY_PROFILES.length}, in two groups.` },
          economy ? { kind: "Economy", label: economy.name, href: economyHref(economy), note: "The economy behind this currency." } : { kind: "Markets", label: "Economic Events", href: "/markets/events", note: "What the releases measure and who publishes them." },
        ]}
      />
    </>
  );
}
