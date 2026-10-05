import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { educationalNote, riskWarning } from "@/config/legal";
import { getLesson } from "@/data/academy";
import { getTerm } from "@/data/glossary";
import { PRIMERS, getPrimer } from "@/data/primers";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One primer: the subject in sections of prose, one worked example in round
 * numbers, what the page does not tell the reader, where GIO4X stands, three
 * questions and the pages that go with it. Everything is rendered on the
 * server from data/primers.ts and nothing on the page moves. A primer
 * explains and never recommends; every figure in its example is invented and
 * is labelled so. A glossary term, tool or lesson named in the data is linked
 * only if it exists.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-05";

export function generateStaticParams() {
  return PRIMERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPrimer((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.description, path: `/primers/${p.slug}`, type: "article", publishedTime: WRITTEN });
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-34 scroll-mt-[var(--header-h)] border-t border-line pt-21 first:mt-0 first:border-t-0 first:pt-0">
      <h2 id={id} className="h3">
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
  const p = getPrimer((await params).slug);
  if (!p) notFound();
  const path = `/primers/${p.slug}`;
  const terms = p.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const tools = p.tools.map((s) => getTool(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const lessons = p.lessons.map((s) => getLesson(s)).filter((l): l is NonNullable<typeof l> => !!l);
  const at = PRIMERS.findIndex((x) => x.slug === p.slug);
  const others = [PRIMERS[(at + 1) % PRIMERS.length], PRIMERS[(at + 2) % PRIMERS.length]];
  const contents = [
    ...p.sections.map((s) => ({ id: `pr-${s.id}`, label: s.title })),
    { id: "pr-example", label: "A worked example" },
    { id: "pr-limits", label: "What this page does not tell you" },
    { id: "pr-here", label: "At GIO4X" },
    { id: "pr-faq", label: "Questions" },
    { id: "pr-more", label: "Related pages" },
  ];

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: p.title, description: p.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Market primers", type: "Article" })} />
      <JsonLd data={faqSchema([...p.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Market primers", href: "/primers" },
          { name: p.name, href: path },
        ]}
        eyebrow={`Market primers · ${String(at + 1).padStart(2, "0")} of ${String(PRIMERS.length).padStart(2, "0")}`}
        title={p.title}
        lead={p.is}
      >
        <Link href="#pr-example" className="btn btn-primary">
          The worked example
        </Link>
        <PrintButton className="btn btn-ghost">Save this page as a PDF</PrintButton>
      </PageHero>

      <article className="section">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-55">
          <nav aria-label="On this page" className="no-print min-w-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <p className="eyebrow">On this page</p>
              <ul className="mt-13 flex flex-wrap gap-x-21 lg:grid lg:gap-0">
                {contents.map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.id}`} className="link-quiet flex min-h-[2.75rem] items-center text-sm">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {p.also.join(" · ")}
              </p>
            </div>
          </nav>

          <div className="min-w-0">
            {p.sections.map((s) => (
              <Block key={s.id} id={`pr-${s.id}`} title={s.title}>
                <div className="grid gap-13">
                  {s.paragraphs.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                  {s.points && <List items={s.points} />}
                </div>
              </Block>
            ))}

            <Block id="pr-example" title={`A worked example: ${p.example.title.charAt(0).toLowerCase()}${p.example.title.slice(1)}`}>
              <div className="panel p-21">
                <p className="label">Illustration · invented round figures, not market prices and not GIO4X fees</p>
                <p className="mt-8">{p.example.setup}</p>
                <ol className="mt-13 grid gap-8">
                  {p.example.steps.map((x, i) => (
                    <li key={x} className="grid grid-cols-[1.3125rem_1fr] gap-x-8">
                      <span aria-hidden className="num text-sm text-ink-3">
                        {i + 1}
                      </span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="mt-13">{p.example.reading}</p>
            </Block>

            <Block id="pr-limits" title="What this page does not tell you">
              <List items={p.limits} />
            </Block>

            <Block id="pr-here" title="At GIO4X">
              <p>{p.here}</p>
            </Block>

            <Block id="pr-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {p.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            <Block id="pr-more" title="Related pages on this site">
              <ul className="grid gap-13">
                {p.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-accent">
                      {l.label}
                    </Link>
                    <span className="label ml-8">{l.kind}</span>
                    <span className="mt-3 block text-sm">{l.note}</span>
                  </li>
                ))}
              </ul>
              {lessons.length > 0 && (
                <div className="mt-21">
                  <h3 className="label">Academy lessons on this subject</h3>
                  <ul className="mt-8 grid gap-8">
                    {lessons.map((l) => (
                      <li key={l.slug}>
                        <Link href={`/academy/${l.slug}`} className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:text-accent">
                          {l.title}
                        </Link>
                        <span className="label ml-8">{l.level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tools.length > 0 && (
                <div className="mt-21">
                  <h3 className="label">Tools that work the idea</h3>
                  <ul className="mt-8 flex flex-wrap gap-8">
                    {tools.map((t) => (
                      <li key={t.slug}>
                        <Link href={`/tools/${t.slug}`} className="btn btn-ghost btn-sm">
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Block>

            {terms.length > 0 && (
              <Block id="pr-terms" title="The words on this page">
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

            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">
              A general explanation for study, with an invented example. Rules, costs and terms differ by country, market, provider and product, and the documents of the thing itself are what count. {educationalNote}
            </p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More primers"
        items={[
          ...others.map((o) => ({ kind: "Primer", label: o.name, href: `/primers/${o.slug}`, note: o.card })),
          { kind: "Market primers", label: `All ${PRIMERS.length} primers`, href: "/primers", note: "How markets work, one subject to a page." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The words, one at a time." },
        ]}
      />
    </>
  );
}
