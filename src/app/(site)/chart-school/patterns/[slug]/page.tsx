import Link from "next/link";
import { notFound } from "next/navigation";
import { PatternFigure } from "@/components/chart-patterns/PatternFigure";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { riskWarning } from "@/config/legal";
import { CHART_PATTERNS, PATTERN_GROUPS, getPattern } from "@/data/chart-patterns";
import { getTerm } from "@/data/glossary";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One chart pattern: what it is, how to recognise it, what it is taken to
 * mean, how textbooks measure it, what traders check, where people go wrong.
 * It explains and never instructs: no entry, no stop, no target. Every page
 * says that a pattern is a description and not a forecast, that textbook
 * shapes are rare, and that its picture is invented.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";
const INDEX = "/chart-school/patterns";

export function generateStaticParams() {
  return CHART_PATTERNS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const pattern = getPattern((await params).slug);
  if (!pattern) return {};
  return pageMeta({ title: pattern.title, description: pattern.description, path: `${INDEX}/${pattern.slug}` });
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

const CLASS: Record<(typeof CHART_PATTERNS)[number]["group"], string> = { reversal: "reversal shape", continuation: "continuation shape", either: "either way" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const pattern = getPattern((await params).slug);
  if (!pattern) notFound();
  const path = `${INDEX}/${pattern.slug}`;
  const article = /^[aeiou]/i.test(pattern.name) ? "an" : "a";
  const lower = pattern.name.toLowerCase();
  const terms = pattern.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const group = PATTERN_GROUPS.find((g) => g.group === pattern.group);
  const at = CHART_PATTERNS.findIndex((p) => p.slug === pattern.slug);
  const same = CHART_PATTERNS.filter((p) => p.group === pattern.group && p.slug !== pattern.slug);
  const others = [CHART_PATTERNS[(at + 1) % CHART_PATTERNS.length], same[at % same.length], CHART_PATTERNS[(at + 5) % CHART_PATTERNS.length]].filter((p, i, all) => p && p.slug !== pattern.slug && all.findIndex((q) => q.slug === p.slug) === i);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: pattern.title, description: pattern.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Chart patterns", type: "TechArticle" })} />
      <JsonLd data={faqSchema([...pattern.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Chart School", href: "/chart-school" },
          { name: "Chart patterns", href: INDEX },
          { name: pattern.name, href: path },
        ]}
        eyebrow={`Chart patterns · ${CLASS[pattern.group]}`}
        title={pattern.title}
        lead={pattern.is}
      >
        <PrintButton className="btn btn-primary">Save this page as a PDF</PrintButton>
      </PageHero>

      <article className="section">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-55">
          <div className="min-w-0 lg:order-2">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <PatternFigure pattern={{ name: pattern.name, path: pattern.path, lines: pattern.lines, tags: pattern.tags, shape: pattern.shape, outlined: pattern.outlined }} />
              <p className="no-print mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {pattern.also.join(" · ")}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:order-1">
            <section aria-labelledby="cp-see">
              <h2 id="cp-see" className="h4">
                How to recognise {article} {lower}
              </h2>
              <div className="mt-13 max-w-measure text-ink-2">
                <List items={pattern.see} />
              </div>
            </section>
            <Block id="cp-said" title="What it is taken to mean">
              <p>{pattern.said}</p>
              <p className="mt-13">
                That is a reading, and no more. A pattern is a description of what a price did, not a forecast of what it will do. {group ? <>Textbooks file this one under “{group.eyebrow.toLowerCase()}”, which is a habit of naming and not a rule the market keeps.</> : null}
              </p>
            </Block>
            <Block id="cp-measure" title="How it is conventionally measured">
              <p>{pattern.measure}</p>
            </Block>
            <Block id="cp-check" title="What traders check">
              <List items={pattern.check} />
            </Block>
            <Block id="cp-traps" title="Where people go wrong">
              <List items={pattern.traps} />
            </Block>
            <Block id="cp-real" title="On a real chart">
              <p>
                Textbook shapes are rare. A real chart is ambiguous: the peaks are uneven, the lines can be drawn two or three ways, and the same candles are {article} {lower} to one reader and something else to another. Most shapes are also recognised only once they are finished, which is after the move they are said to announce has begun.
              </p>
              <p className="mt-13">The picture on this page is invented. It was drawn by hand to show the shape as plainly as possible, with every awkward detail left out. It is not market data and it records nothing that happened.</p>
            </Block>
            <Block id="cp-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {pattern.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>
            {terms.length > 0 && (
              <Block id="cp-terms" title="The words on this page">
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
            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">An explanation for study. It is not advice, a recommendation or a forecast, and a pattern described here says nothing certain about what a price will do next.</p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More chart patterns"
        items={[...others.slice(0, 3).map((p) => ({ kind: "Pattern", label: p.name, href: `${INDEX}/${p.slug}`, note: p.also[0] })), { kind: "Chart School", label: "All chart patterns", href: INDEX, note: `${CHART_PATTERNS.length} pages.` }]}
      />
    </>
  );
}
