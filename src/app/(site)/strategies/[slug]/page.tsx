import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { StrategyFigure } from "@/components/strategies/StrategyFigure";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { HOLDS, NOT_ADVICE, STRATEGIES, benchHref, getStrategy } from "@/data/strategies";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One page of the strategy library: an approach described, not recommended.
 * The words are all in the HTML; the only client part is the invented chart.
 * Every page carries the same statement near its top and again at its foot.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return STRATEGIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = getStrategy((await params).slug);
  if (!s) return {};
  return pageMeta({ title: s.title, description: s.description, path: `/strategies/${s.slug}` });
}

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

const List = ({ items }: { items: readonly string[] }) => (
  <ul className="grid gap-8">
    {items.map((x) => (
      <li key={x} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
        <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const s = getStrategy((await params).slug);
  if (!s) notFound();
  const path = `/strategies/${s.slug}`;
  const group = HOLDS.find((h) => h.key === s.hold);
  const terms = s.terms.map((t) => getTerm(t)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = STRATEGIES.findIndex((x) => x.slug === s.slug);
  const others = [1, 4, 7].map((k) => STRATEGIES[(at + k) % STRATEGIES.length]!);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: s.title, description: s.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Trading approaches", type: "TechArticle" })} />
      <JsonLd data={faqSchema([...s.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Strategy library", href: "/strategies" },
          { name: s.name, href: path },
        ]}
        eyebrow={s.caution ? "Strategy library · a caution" : "Strategy library · an approach, described"}
        title={s.title}
        lead={s.caution ? "Explained so that it can be recognised. It is not recommended, and this page says why." : "What the approach is, what it needs, what it costs and where it goes wrong. A description, not a recommendation."}
      >
        <PrintButton className="btn btn-ghost">Save this page as a PDF</PrintButton>
      </PageHero>

      <article className="section">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-55">
          <div className="min-w-0 lg:order-2">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <StrategyFigure kind={s.picture} />
              <p className="no-print mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {s.also.join(" · ")}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:order-1">
            <div className="panel p-21">
              <p className="label">{s.caution ? "A warning, not an approach to copy" : "A description, not a recommendation"}</p>
              <p className="mt-8 max-w-measure text-ink-2">{NOT_ADVICE}</p>
            </div>

            <section aria-labelledby="st-idea" className="mt-34">
              <h2 id="st-idea" className="h4">
                The idea
              </h2>
              <p className="mt-13 max-w-measure text-ink-2">{s.idea}</p>
              <p className="mt-13 text-sm text-ink-3">
                <span className="label mr-8">Usually held</span>
                {s.held}
                {group && (
                  <>
                    {" · "}
                    <Link href={`/strategies#${group.id}`} className="link">
                      others held about as long
                    </Link>
                  </>
                )}
              </p>
            </section>
            <Block id="st-rule" title="The rule, as people usually state it">
              <p>{s.rule}</p>
            </Block>
            <Block id="st-needs" title={s.caution ? "What it would need to survive" : "What it needs from a market"}>
              <List items={s.needs} />
            </Block>
            <Block id="st-cost" title="What it costs">
              <p>{s.cost}</p>
            </Block>
            <Block id="st-fails" title="When it fails">
              <List items={s.fails} />
            </Block>
            <Block id="st-mistakes" title="The mistakes people make with it">
              <List items={s.mistakes} />
            </Block>

            <Block id="st-bench" title="In the rule bench">
              {s.bench ? (
                <>
                  <p>{s.bench.says}</p>
                  <p className="mt-13">The bench uses invented random prices, on which no rule has an edge, so it shows how the rule behaves and what it costs, not whether it works.</p>
                  <p className="no-print mt-21">
                    <Link href={benchHref(s.bench)} className="btn btn-primary">
                      Try it on invented prices
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <p>{s.noBench}</p>
                  <p className="no-print mt-13">
                    <Link href="/labs/rule-bench" className="go">
                      What the rule bench can test
                    </Link>
                  </p>
                </>
              )}
            </Block>

            <Block id="st-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {s.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>
            {terms.length > 0 && (
              <Block id="st-terms" title="The words on this page">
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
            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">An explanation for study. It is not advice, a recommendation or a forecast. {NOT_ADVICE}</p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More from the strategy library"
        items={[...others.map((o) => ({ kind: o.caution ? "Caution" : "Approach", label: o.name, href: `/strategies/${o.slug}`, note: o.held })), { kind: "Library", label: "All approaches", href: "/strategies", note: `${STRATEGIES.length} pages, grouped by holding time.` }]}
      />
    </>
  );
}
