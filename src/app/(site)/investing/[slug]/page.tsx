import Link from "next/link";
import { notFound } from "next/navigation";
import { Explainer } from "@/components/investing/Explainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { educationalNote, riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { INVESTING, getInstrument } from "@/data/investing";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One instrument, explained: what it is, one working example of its
 * mechanism, how it works, what it costs, the risks, where people go wrong
 * and three questions. The words are rendered on the server from
 * data/investing.ts; only the example is a client component. A page explains
 * and never recommends, and every number in its example is invented.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return INVESTING.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const it = getInstrument((await params).slug);
  if (!it) return {};
  return pageMeta({ title: it.title, description: it.description, path: `/investing/${it.slug}` });
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
  const it = getInstrument((await params).slug);
  if (!it) notFound();
  const path = `/investing/${it.slug}`;
  const terms = it.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = INVESTING.findIndex((i) => i.slug === it.slug);
  const others = [INVESTING[(at + 1) % INVESTING.length], INVESTING[(at + 2) % INVESTING.length]];
  const contents = [
    { id: "inv-try", label: "Try it" },
    { id: "inv-how", label: "How it works" },
    { id: "inv-costs", label: "What it costs" },
    { id: "inv-risks", label: "The risks" },
    { id: "inv-traps", label: "Where people go wrong" },
    { id: "inv-faq", label: "Questions" },
  ];

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: it.title, description: it.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Investing", type: "Article" })} />
      <JsonLd data={faqSchema([...it.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Investing", href: "/investing" },
          { name: it.name, href: path },
        ]}
        eyebrow={`Investing · ${String(at + 1).padStart(2, "0")} of ${String(INVESTING.length).padStart(2, "0")}`}
        title={it.title}
        lead={it.is}
      >
        <Link href="#inv-try" className="btn btn-primary">
          Try the example
        </Link>
        <PrintButton className="btn btn-ghost">Save this page as a PDF</PrintButton>
      </PageHero>

      <section id="inv-try" data-machine className="section scroll-mt-[var(--header-h)]" aria-labelledby="inv-try-h">
        <div className="wrap">
          <div className="max-w-measure">
            <p className="eyebrow">{it.machine.eyebrow}</p>
            <h2 id="inv-try-h" className="h2 mt-13">
              {it.machine.title}
            </h2>
            <p className="lead mt-13">{it.machine.lead}</p>
          </div>
          <div className="mt-34 min-w-0">
            <Explainer slug={it.slug} />
          </div>
        </div>
      </section>

      <article className="section hairline bg-paper">
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
                {it.also.join(" · ")}
              </p>
            </div>
          </nav>

          <div className="min-w-0">
            <Block id="inv-how" title="How it works">
              <div className="grid gap-13">
                {it.how.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Block>
            <Block id="inv-costs" title="What it costs">
              <List items={it.costs} />
            </Block>
            <Block id="inv-risks" title="The risks">
              <List items={it.risks} />
            </Block>
            <Block id="inv-traps" title="Where people go wrong">
              <List items={it.traps} />
            </Block>
            <Block id="inv-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {it.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>
            {terms.length > 0 && (
              <Block id="inv-terms" title="The words on this page">
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
              A general explanation for study, with invented examples. Costs, taxes and rules differ by country, market and product, and the documents of the thing itself are what count. {educationalNote}
            </p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">The value of any investment can fall as well as rise, and an investor can get back less than was put in.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More on investing"
        items={[
          ...others.map((o) => ({ kind: "Investing", label: o.name, href: `/investing/${o.slug}`, note: o.card })),
          { kind: "Investing", label: "All seven instruments", href: "/investing", note: "And how investing differs from trading." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The words, one at a time." },
        ]}
      />
    </>
  );
}
