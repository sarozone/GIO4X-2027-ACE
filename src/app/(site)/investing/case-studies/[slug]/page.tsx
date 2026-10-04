import Link from "next/link";
import { notFound } from "next/navigation";
import { Explainer } from "@/components/case-studies/Explainer";
import { Standing } from "@/components/case-studies/Standing";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { educationalNote, riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { CASE_STUDIES, getCaseStudy } from "@/data/case-studies";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * One case study: the published ideas of a professional investor, or the
 * common practice of institutions, with the sources named, one documented
 * example, one failure the record admits, a paper exercise that links to a
 * tool on this site, and what does not scale down to a private account.
 *
 * The rules it keeps: every idea is a paraphrase and is said to be; there are
 * no quotations; the four standing statements (no endorsement, no access to
 * anyone's portfolio, a method is not its results, a leveraged CFD is not an
 * investment held) appear near the top of every page; the example to handle
 * shows an idea on invented figures, never a performance. The words are
 * rendered on the server from data/case-studies.ts.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";
const BASE = "/investing/case-studies";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const cs = getCaseStudy((await params).slug);
  if (!cs) return {};
  return pageMeta({ title: cs.title, description: cs.description, path: `${BASE}/${cs.slug}` });
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

const Paras = ({ items }: { items: readonly string[] }) => (
  <div className="grid gap-13">
    {items.map((p) => (
      <p key={p}>{p}</p>
    ))}
  </div>
);

const Pairs = ({ items }: { items: readonly { t: string; d: string }[] }) => (
  <dl className="grid gap-21">
    {items.map((x) => (
      <div key={x.t}>
        <dt className="font-medium text-ink">{x.t}</dt>
        <dd className="mt-5">{x.d}</dd>
      </div>
    ))}
  </dl>
);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const cs = getCaseStudy((await params).slug);
  if (!cs) notFound();
  const path = `${BASE}/${cs.slug}`;
  const terms = cs.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = CASE_STUDIES.findIndex((c) => c.slug === cs.slug);
  const others = [CASE_STUDIES[(at + 1) % CASE_STUDIES.length], CASE_STUDIES[(at + 2) % CASE_STUDIES.length]].filter((c): c is NonNullable<typeof c> => !!c);
  const people = cs.subject === "people";
  const contents = [
    { id: "cs-try", label: "Try the idea" },
    { id: "cs-ideas", label: "The ideas" },
    { id: "cs-sources", label: "The sources" },
    { id: "cs-example", label: "A documented example" },
    { id: "cs-failure", label: "Where it went wrong" },
    { id: "cs-exercise", label: "To study on paper" },
    { id: "cs-scale", label: "What does not scale down" },
    { id: "cs-faq", label: "Questions" },
  ];

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: cs.title, description: cs.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Investing case studies", type: "Article" })} />
      <JsonLd data={faqSchema([...cs.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Investing", href: "/investing" },
          { name: "Case studies", href: BASE },
          { name: cs.name, href: path },
        ]}
        eyebrow={`Case study · ${String(at + 1).padStart(2, "0")} of ${String(CASE_STUDIES.length).padStart(2, "0")}`}
        title={cs.title}
        lead={cs.is}
      >
        <Link href="#cs-try" className="btn btn-primary">
          Try the idea
        </Link>
        <PrintButton className="btn btn-ghost">Save this page as a PDF</PrintButton>
      </PageHero>

      <Standing subject={cs.subject} />

      <section id="cs-try" data-machine className="section scroll-mt-[var(--header-h)]" aria-labelledby="cs-try-h">
        <div className="wrap">
          <div className="max-w-[44rem]">
            <p className="eyebrow">{cs.machine.eyebrow}</p>
            <h2 id="cs-try-h" className="h2 mt-13">
              {cs.machine.title}
            </h2>
            <p className="lead mt-13">{cs.machine.lead}</p>
            <p className="mt-13 text-sm text-ink-3">{people ? "This shows an idea on invented figures. It is not a record of what anyone named on this page did or earned." : "This shows an idea on invented figures. It is not a record of what any institution did, paid or earned."}</p>
          </div>
          <div className="mt-34 min-w-0">
            <Explainer slug={cs.slug} />
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
              <p className="mt-13 text-sm text-ink-3">{cs.who}</p>
              <p className="mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {cs.also.join(" · ")}
              </p>
            </div>
          </nav>

          <div className="min-w-0">
            <Block id="cs-ideas" title={people ? "The ideas, as published" : "The practice, as published"}>
              <p className="mb-21 text-sm text-ink-3">Everything in this section is a paraphrase in this site’s own words. Nothing is quoted. The works it comes from are listed in the next section.</p>
              <Pairs items={cs.ideas} />
            </Block>

            <Block id="cs-sources" title="The sources">
              <p className="mb-21 text-sm text-ink-3">Named by title, author, publisher and year so that they can be found and checked. No links are given.</p>
              <ul className="grid gap-21">
                {cs.sources.map((s) => (
                  <li key={s.title}>
                    <cite className="font-medium not-italic text-ink">{s.title}</cite>
                    <span className="mt-3 block">
                      {s.by}. {s.where}
                    </span>
                    <span className="mt-3 block text-sm text-ink-3">Used here for: {s.gives}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <Block id="cs-example" title={cs.example.title}>
              <Paras items={cs.example.paras} />
              {cs.example.link && (
                <p className="mt-21">
                  <Link href={cs.example.link.href} className="link">
                    {cs.example.link.label}
                  </Link>
                </p>
              )}
            </Block>

            <Block id="cs-failure" title={cs.failure.title}>
              <Paras items={cs.failure.paras} />
              {cs.failure.link && (
                <p className="mt-21">
                  <Link href={cs.failure.link.href} className="link">
                    {cs.failure.link.label}
                  </Link>
                </p>
              )}
            </Block>

            <Block id="cs-exercise" title={cs.exercise.title}>
              <p>{cs.exercise.intro}</p>
              <ol className="mt-21 grid gap-13">
                {cs.exercise.steps.map((s, i) => (
                  <li key={s} className="grid grid-cols-[1.625rem_1fr] gap-x-8">
                    <span className="num text-sm font-semibold text-prestige-ink" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <ul className="no-print mt-21 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
                {cs.exercise.tools.map((t) => (
                  <li key={t.href} className="bg-surface">
                    <Link href={t.href} className="group flex h-full min-h-[2.75rem] flex-col gap-5 p-13 transition-colors duration-fast hover:bg-paper">
                      <span className="font-medium text-ink group-hover:text-accent">{t.label}</span>
                      <span className="text-sm text-ink-3">{t.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-21 text-sm text-ink-3">{cs.exercise.caution}</p>
            </Block>

            <Block id="cs-scale" title="What does not scale down to a private account">
              <Pairs items={cs.notScale} />
            </Block>

            <Block id="cs-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {cs.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            {terms.length > 0 && (
              <Block id="cs-terms" title="The words on this page">
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
              {people
                ? "A summary for study of ideas that are on the public record, in this site’s own words. It is not endorsed by, or connected with, anyone named. Nobody at GIO4X has access to their portfolios. Studying a method does not reproduce its results, and a leveraged CFD is not ownership of an investment and does not behave like one."
                : "A summary for study of practice described in published papers and official reports, in this site’s own words. It is not endorsed by, or connected with, any institution described. Nobody at GIO4X has access to their portfolios. Studying a method does not reproduce its results, and a leveraged CFD is not ownership of an investment and does not behave like one."}{" "}
              {educationalNote}
            </p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">The value of any investment can fall as well as rise, and an investor can get back less than was put in. Past results, of anyone, say nothing certain about future ones.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More case studies"
        items={[
          ...others.map((o) => ({ kind: "Case study", label: o.name, href: `${BASE}/${o.slug}`, note: o.card })),
          { kind: "Case studies", label: "All five, and what filings show", href: BASE, note: "Including what public disclosure does not show." },
          { kind: "Investing", label: "Investing, explained", href: "/investing", note: "What a long-term investor actually holds." },
        ]}
      />
    </>
  );
}
