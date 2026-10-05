import Link from "next/link";
import { notFound } from "next/navigation";
import { Mechanism } from "@/components/compare/Mechanism";
import { Pick } from "@/components/compare/Pick";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { riskWarning } from "@/config/legal";
import { COMPARISONS, getComparison } from "@/data/comparisons";
import { getTerm } from "@/data/glossary";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One comparison: the table (a card for each item on a phone), how to read
 * it, a paragraph on each item, any two side by side, a drawing of the
 * mechanism and the questions people ask. All of the words come from
 * data/comparisons.ts and are in the HTML; only the selector and the drawing
 * are client components. The page describes the general thing and never says
 * what GIO4X offers or which item to choose.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComparison((await params).slug);
  if (!c) return {};
  return pageMeta({ title: c.title, description: c.description, path: `/side-by-side/${c.slug}` });
}

function Block({ id, title, children, wide }: { id: string; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section aria-labelledby={id} className="mt-34 border-t border-line pt-21">
      <h2 id={id} className="h4">
        {title}
      </h2>
      <div className={`mt-13 text-ink-2 ${wide ? "" : "max-w-measure"}`}>{children}</div>
    </section>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComparison((await params).slug);
  if (!c) notFound();
  const path = `/side-by-side/${c.slug}`;
  const terms = c.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = COMPARISONS.findIndex((x) => x.slug === c.slug);
  const others = [1, 2].map((k) => COMPARISONS[(at + k) % COMPARISONS.length]).filter((x): x is NonNullable<typeof x> => !!x && x.slug !== c.slug);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: c.title, description: c.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Side by side", type: "TechArticle" })} />
      <JsonLd data={faqSchema([...c.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Side by side", href: "/side-by-side" },
          { name: c.name, href: path },
        ]}
        eyebrow="Side by side · a comparison"
        title={c.title}
        lead={c.lead}
      >
        <PrintButton className="btn btn-primary">Save this page as a PDF</PrintButton>
      </PageHero>

      <article className="section">
        <div className="wrap">
          <section aria-labelledby="cmp-table">
            <h2 id="cmp-table" className="h4">
              The {c.things}, side by side
            </h2>

            {/* from 640px: the table, which may be slid sideways */}
            <div className="mt-13 hidden overflow-x-auto sm:block">
              <table className="table-gx w-full text-sm" style={{ minWidth: `${9 + c.items.length * 11}rem` }}>
                <caption className="sr-only">
                  {c.name}: {c.items.map((i) => i.name).join(", ")}, compared on {c.rows.length} questions.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Question</span>
                    </th>
                    {c.items.map((i) => (
                      <th key={i.key} scope="col" className="!whitespace-normal align-bottom !text-ink">
                        {i.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((row, r) => (
                    <tr key={row}>
                      <th scope="row" className="w-[9rem] !whitespace-normal !border-line align-top">
                        {row}
                      </th>
                      {c.items.map((i) => (
                        <td key={i.key} className="!py-13 align-top text-ink-2">
                          {i.values[r]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* below 640px: one card for each item, the same words */}
            <ul className="mt-13 grid gap-13 sm:hidden">
              {c.items.map((i) => (
                <li key={i.key} className="panel p-13">
                  <h3 className="font-display text-xl text-ink">{i.name}</h3>
                  <dl className="mt-8">
                    {c.rows.map((row, r) => (
                      <div key={row} className="border-t border-line py-8">
                        <dt className="label">{row}</dt>
                        <dd className="mt-3 text-sm text-ink-2">{i.values[r]}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          <Block id="cmp-read" title="How to read this table">
            <p>{c.read}</p>
          </Block>

          <Block id="cmp-each" title="Each one, in a paragraph" wide>
            <div className="grid gap-21 lg:grid-cols-2 lg:gap-x-55">
              {c.items.map((i) => (
                <div key={i.key} id={i.key} className="max-w-measure scroll-mt-[var(--header-h)]">
                  <h3 className="font-medium text-ink">{i.name}</h3>
                  <p className="mt-5">{i.about}</p>
                </div>
              ))}
            </div>
          </Block>

          <section aria-labelledby="cmp-pick" className="no-print mt-34 border-t border-line pt-21">
            <div className="phi phi-r items-start">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
                <h2 id="cmp-pick" className="h4">
                  Show me two side by side
                </h2>
                <p className="mt-13 max-w-[30rem] text-ink-2">Choose any two. The rows on which they give different answers are marked; the rest are the same for both.</p>
              </div>
              <div className="min-w-0">
                <Pick rows={c.rows} items={c.items.map(({ key, name, values }) => ({ key, name, values }))} />
              </div>
            </div>
          </section>

          <section aria-labelledby="cmp-draw" className="mt-34 border-t border-line pt-21">
            <div className="phi phi-r items-start">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
                <h2 id="cmp-draw" className="h4">
                  {c.drawing.title}
                </h2>
                <p className="mt-13 max-w-[30rem] text-ink-2">A drawing of the mechanism. Choose one of the {c.things} beneath it and the sentence says what the drawing shows.</p>
              </div>
              <div className="min-w-0">
                <Mechanism slug={c.slug} note={c.drawing.note} items={c.items.map(({ key, name, shows }) => ({ key, name, shows }))} />
              </div>
            </div>
          </section>

          <Block id="cmp-faq" title="Questions people ask">
            <dl className="grid gap-21">
              {c.faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium text-ink">{f.q}</dt>
                  <dd className="mt-5">{f.a}</dd>
                </div>
              ))}
            </dl>
          </Block>

          {terms.length > 0 && (
            <Block id="cmp-terms" title="The words on this page">
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

          <p className="mt-34 max-w-measure border-t border-line pt-13 text-sm text-ink-3">
            A general explanation for study. It is not advice or a recommendation, it does not say which of these to use, and it does not describe the terms of any account.
            {c.own && (
              <>
                {" "}
                What GIO4X itself offers is set out on{" "}
                <Link href={c.own.href} className="link">
                  {c.own.label}
                </Link>
                , not here.
              </>
            )}
          </p>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More side by side"
        items={[
          ...others.map((x) => ({ kind: "Comparison", label: x.name, href: `/side-by-side/${x.slug}`, note: x.items.map((i) => i.name).join(", ") + "." })),
          { kind: "Side by side", label: "All comparisons", href: "/side-by-side", note: `${COMPARISONS.length} pages.` },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
        ]}
      />
    </>
  );
}
