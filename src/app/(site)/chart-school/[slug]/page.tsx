import Link from "next/link";
import { notFound } from "next/navigation";
import { IndicatorMachine } from "@/components/chart-school/IndicatorMachine";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero, SpecList } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { LESSONS, PLAIN_TRUTH, getLesson } from "@/data/chart-school";
import { getTerm } from "@/data/glossary";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * Chart school: one indicator to a page, from src/data/chart-school.ts.
 *
 * The words are rendered on the server; the only client part is the machine.
 * Each page explains and never instructs, and says in plain words that an
 * indicator is arithmetic on past prices and that its chart is invented.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) return {};
  return pageMeta({ title: lesson.title, description: lesson.description, path: `/chart-school/${lesson.slug}` });
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-34 border-t border-line pt-21 first:mt-0 first:border-t-0 first:pt-0">
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
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  const path = `/chart-school/${lesson.slug}`;
  const terms = lesson.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const others = [1, 2].map((k) => LESSONS[(at + k) % LESSONS.length]!);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: lesson.title, description: lesson.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Technical indicators", type: "TechArticle" })} />
      <JsonLd data={faqSchema([...lesson.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Chart school", href: "/chart-school" },
          { name: lesson.name, href: path },
        ]}
        eyebrow={`Chart school · ${lesson.family.toLowerCase()}`}
        title={lesson.title}
        lead={lesson.is}
      >
        <Link href="#machine" className="btn btn-primary">
          Move the sliders
        </Link>
        <PrintButton className="btn btn-ghost">Save this page as a PDF</PrintButton>
      </PageHero>

      <section id="machine" className="section scroll-mt-[var(--header-h)]" aria-labelledby="machine-h">
        <div className="wrap">
          <p className="eyebrow">The machine</p>
          <h2 id="machine-h" className="h3 mt-13 max-w-[24ch]">
            {lesson.machine.title}
          </h2>
          <p className="lead mt-13 max-w-[44rem]">{lesson.machine.lead}</p>
          <p className="no-print mt-8 hidden text-xs text-ink-3 lg:block">On a keyboard: with the pointer over the machine, the left and right arrows move its first slider and Enter presses “Another chart”.</p>
          <div className="mt-34" data-machine>
            <IndicatorMachine kind={lesson.slug} />
          </div>
          <DataNote status="simulation" className="mt-21">
            {PLAIN_TRUTH} {educationalNote}
          </DataNote>
        </div>
      </section>

      <article className="section hairline bg-paper">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:gap-55">
          <div className="min-w-0 lg:order-2">
            <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]" aria-labelledby="cs-glance">
              <p id="cs-glance" className="eyebrow">
                At a glance
              </p>
              <SpecList className="mt-8 border-t border-line" rows={lesson.facts.map((f) => ({ label: f.label, value: f.value }))} />
              <p className="no-print mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {lesson.also.join(" · ")}
              </p>
            </aside>
          </div>

          <div className="min-w-0 lg:order-1">
            <Block id="cs-measures" title="What it measures">
              <div className="grid gap-13">
                {lesson.measures.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Block>

            <Block id="cs-formula" title="How it is calculated, step by step">
              <ol className="border-t border-line">
                {lesson.steps.map((s, i) => (
                  <li key={s.t} className="grid grid-cols-[2.125rem_1fr] gap-x-8 border-b border-line py-13">
                    <span className="num pt-3 text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-medium text-ink">{s.t}</p>
                      <p className="mt-3">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-13 text-sm text-ink-3">{lesson.stepsNote}</p>
            </Block>

            <Block id="cs-worked" title="A worked example, by hand">
              <p>{lesson.worked.intro}</p>
              <ol className="panel mt-13 grid gap-8 p-21 text-[0.9375rem]">
                {lesson.worked.lines.map((line) => (
                  <li key={line} className="num break-words text-ink">
                    {line}
                  </li>
                ))}
              </ol>
              <p className="mt-13">{lesson.worked.result}</p>
              <p className="mt-8 text-sm text-ink-3">The numbers in this example were chosen to be easy to add up. They are not prices of anything.</p>
            </Block>

            <Block id="cs-read" title="How people read it">
              <List items={lesson.read} />
            </Block>
            <Block id="cs-cannot" title="What it cannot tell you">
              <List items={lesson.cannot} />
            </Block>
            <Block id="cs-mistakes" title="Common mistakes">
              <List items={lesson.mistakes} />
            </Block>
            <Block id="cs-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {lesson.faq.map((f) => (
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
              {PLAIN_TRUTH} This page is an explanation for study. It is not advice, a recommendation or a forecast, and nothing an indicator shows says anything certain about what a price will do next.
            </p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="arithmetic" />
      <NextSteps
        title="More from Chart school"
        items={[
          ...others.map((l) => ({ kind: l.family, label: l.name, href: `/chart-school/${l.slug}`, note: l.card })),
          { kind: "Chart school", label: "All the indicators", href: "/chart-school", note: `${LESSONS.length} pages, and the chart patterns.` },
          { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule from parts and test it on invented prices." },
        ]}
      />
    </>
  );
}
