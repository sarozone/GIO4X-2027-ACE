import Link from "next/link";
import { notFound } from "next/navigation";
import type { SceneId } from "@/components/cockpit/scenes";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero, SpecList } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { COMMODITIES, COMMODITY_TERMS, TRADED_COMMODITIES, TRADED_TERMS, TRADED_TOOLS, commodityHref, commodityInstrument, commodityLine, getCommodity, type Commodity, type CommodityCategory } from "@/data/commodities";
import { getTerm } from "@/data/glossary";
import { getAssetClass, instrumentHref } from "@/data/instruments";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * COMMODITIES, A TO Z — one commodity. What it is, how it is quoted, where its
 * reference contract is listed, what commonly moves it and where it comes
 * from; then, plainly, whether GIO4X lists it. For the seven that are
 * instruments the page links to the instrument page and repeats none of its
 * conditions. Unknown slugs return a real 404 (`dynamicParams = false` is not
 * used: see docs/ARCHITECTURE.md).
 */
const INDEX = "/markets/commodities";

export function generateStaticParams() {
  return COMMODITIES.map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

const describe = (c: Commodity, traded: boolean) =>
  `${c.name} as a commodity. ${commodityLine(c)} Usual quotation: ${c.quoted}. ${traded ? "Listed as a GIO4X instrument." : "General education: not a GIO4X instrument."}`;

export async function generateMetadata({ params }: Params) {
  const c = getCommodity((await params).slug);
  if (!c) return {};
  return pageMeta({ title: `${c.name}: what it is, how it is quoted and what moves it`, description: describe(c, !!commodityInstrument(c)), path: commodityHref(c) });
}

/** the two families with a hero scene of their own keep it; the others open with the Markets instrument */
const SCENE: Partial<Record<CommodityCategory, SceneId>> = { Energy: "energy", "Precious metals": "metals" };

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
  const c = getCommodity((await params).slug);
  if (!c) notFound();
  const path = commodityHref(c);
  const inst = commodityInstrument(c);
  const cls = inst ? getAssetClass(inst.class) : undefined;

  const termSlugs = [...new Set([...(inst ? TRADED_TERMS : []), ...COMMODITY_TERMS[c.category]])];
  const terms = termSlugs.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const tools = (inst ? TRADED_TOOLS : []).map((s) => getTool(s)).filter((t): t is NonNullable<typeof t> => !!t);

  const at = COMMODITIES.findIndex((x) => x.slug === c.slug);
  const next = COMMODITIES[(at + 1) % COMMODITIES.length];
  const prev = COMMODITIES[(at + COMMODITIES.length - 1) % COMMODITIES.length];
  const family = COMMODITIES.filter((x) => x.category === c.category && x.slug !== c.slug);

  return (
    <>
      <JsonLd data={webPageSchema({ path, name: `${c.name} (commodity)`, description: describe(c, !!inst) })} />
      <PageHero
        quiet
        scene={SCENE[c.category]}
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Commodities A to Z", href: INDEX },
          { name: c.name, href: path },
        ]}
        eyebrow={`Commodity · ${c.category}${inst ? " · Traded at GIO4X" : ""}`}
        title={c.name}
        lead={commodityLine(c)}
      >
        {inst ? (
          <Link href={instrumentHref(inst)} className="btn btn-primary">
            <span className="num">{inst.symbol}</span>&nbsp;instrument page
          </Link>
        ) : (
          <Link href={`${INDEX}#traded`} className="btn btn-ghost">
            What GIO4X does list
          </Link>
        )}
        <Link href={`${INDEX}#${c.letter.toLowerCase()}`} className="btn btn-ghost">
          Back to the A to Z
        </Link>
      </PageHero>

      <article className="section">
        <div className="wrap phi items-start">
          <div className="min-w-0 max-w-[48rem]">
            <section aria-labelledby="co-is">
              <h2 id="co-is" className="h4">
                What it is
              </h2>
              <p className="mt-13 max-w-measure text-ink-2">{c.is}</p>
            </section>

            <Block id="co-quoted" title="How it is usually quoted">
              <p>{c.quoted}.</p>
              <p className="mt-13 text-sm text-ink-3">This is the customary unit of the reference market. Other markets for the same commodity may use another unit or currency, and an exchange can change a contract’s terms: its own rulebook is the authority.</p>
            </Block>

            <Block id="co-trades" title="Where the reference contract trades">
              <p>{c.trades}.</p>
              <p className="mt-13 text-sm text-ink-3">Named for orientation only. Naming an exchange or a market here does not mean that GIO4X gives access to it.</p>
            </Block>

            <Block id="co-drivers" title="What commonly moves it">
              <ul className="grid gap-8">
                {c.drivers.map((d) => (
                  <li key={d} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                    <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">These are the things people who follow this market usually watch. They explain how the market works; they do not say what the price will do next.</p>
            </Block>

            <Block id="co-regions" title="Where it comes from">
              <p>{c.regions}</p>
              <p className="mt-13 text-sm text-ink-3">The order of producers changes from year to year, so no quantities or shares are given here.</p>
            </Block>

            <Block id="co-gio4x" title="At GIO4X">
              {inst ? (
                <>
                  <p>
                    {c.name} is one of the {TRADED_COMMODITIES.length} commodities GIO4X lists as instruments. It appears as <span className="num font-medium text-ink">{inst.symbol}</span> ({inst.name}){cls ? `, in the ${cls.name} class` : ""}. {inst.about}
                  </p>
                  <p className="mt-13">The contract and its published conditions are set out on the instrument page, where they are labelled as indicative. They are not repeated here.</p>
                  <p className="mt-21 flex flex-wrap gap-13">
                    <Link href={instrumentHref(inst)} className="btn btn-primary btn-sm">
                      {inst.symbol} instrument page
                    </Link>
                    {cls && (
                      <Link href={`/markets/${cls.key}`} className="btn btn-ghost btn-sm">
                        {cls.name} at GIO4X
                      </Link>
                    )}
                    <Link href="/trading/specifications" className="btn btn-ghost btn-sm">
                      Contract specifications
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {c.name} is not offered as a GIO4X instrument. This page is general education about a market that exists elsewhere, and nothing on it means that GIO4X quotes, trades or gives access to it.
                  </p>
                  <p className="mt-13">
                    The commodities GIO4X does list are{" "}
                    {TRADED_COMMODITIES.map((t, i) => (
                      <span key={t.slug}>
                        {i > 0 && (i === TRADED_COMMODITIES.length - 1 ? " and " : ", ")}
                        <Link href={commodityHref(t)} className="link">
                          {t.name.toLowerCase().replace("wti", "WTI").replace("brent", "Brent")}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                </>
              )}
            </Block>

            {terms.length > 0 && (
              <Block id="co-terms" title="Words worth knowing">
                <ul className="flex flex-wrap gap-8">
                  {terms.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/glossary/${t.slug}`} className="btn btn-ghost btn-sm">
                        {t.term}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {tools.length > 0 && inst && (
              <Block id="co-tools" title="Tools for the GIO4X instrument">
                <ul className="flex flex-wrap gap-8">
                  {tools.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="btn btn-ghost btn-sm">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-13 text-sm text-ink-3">The calculators work on the figures you enter. They apply to {inst.symbol} as GIO4X lists it, not to the exchange contracts named above.</p>
              </Block>
            )}

            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">A reference page. {educationalNote} It gives no price and no forecast.</p>
          </div>

          <aside className="min-w-0" aria-label={`${c.name} at a glance`}>
            <p className="eyebrow">At a glance</p>
            <SpecList
              className="mt-13 border-t border-line-strong"
              rows={[
                { label: "Category", value: c.category },
                { label: "Filed under", value: c.letter },
                { label: "GIO4X instrument", value: inst ? inst.symbol : "No", note: inst ? undefined : "General education" },
              ]}
            />
            <dl className="mt-21 grid gap-13 text-sm">
              <div>
                <dt className="label">Usual quotation</dt>
                <dd className="mt-3 text-ink-2">{c.quoted}</dd>
              </div>
              <div>
                <dt className="label">Reference market</dt>
                <dd className="mt-3 text-ink-2">{c.trades}</dd>
              </div>
              {c.aliases && c.aliases.length > 0 && (
                <div>
                  <dt className="label">Also searched as</dt>
                  <dd className="mt-3 text-ink-2">{c.aliases.join(", ")}</dd>
                </div>
              )}
            </dl>
            {family.length > 0 && (
              <div className="mt-34">
                <p className="label">More in {c.category.toLowerCase()}</p>
                <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-3">
                  {family.map((x) => (
                    <li key={x.slug}>
                      <Link href={commodityHref(x)} className="link-quiet inline-flex min-h-[2.75rem] items-center text-sm hover:text-accent">
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
        title="More commodities"
        items={[
          { kind: "Previous", label: prev.name, href: commodityHref(prev), note: commodityLine(prev) },
          { kind: "Next", label: next.name, href: commodityHref(next), note: commodityLine(next) },
          { kind: "Markets", label: "Commodities A to Z", href: INDEX, note: `All ${COMMODITIES.length}, by letter and by category.` },
          inst ? { kind: "Instrument", label: inst.symbol, href: instrumentHref(inst), note: "The GIO4X instrument and its published conditions." } : { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The terms used on these pages." },
        ]}
      />
    </>
  );
}
