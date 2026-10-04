import { notFound } from "next/navigation";
import { Calculator } from "@/components/money/Calculators";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { educationalNote, riskWarning } from "@/config/legal";
import { MONEY, MONEY_ASSUMPTION, getMoney } from "@/data/money";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * /money/[slug] — one money calculator and the words that explain it.
 *
 * The page is a server component: the explanation, the formula, what the sum
 * leaves out and the questions are all in the HTML. Only the calculator is a
 * client component. The rule it keeps: the page explains a sum and states that
 * every rate is the visitor's assumption, not a forecast. It never says what
 * to do with money.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return MONEY.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const calc = getMoney((await params).slug);
  if (!calc) return {};
  return pageMeta({ title: calc.title, description: calc.description, path: `/money/${calc.slug}` });
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
  const calc = getMoney((await params).slug);
  if (!calc) notFound();
  const path = `/money/${calc.slug}`;
  const related = calc.related.map((s) => getMoney(s)).filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: calc.title, description: calc.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Personal finance calculators", type: "TechArticle" })} />
      <JsonLd data={faqSchema([...calc.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Money", href: "/money" },
          { name: calc.name, href: path },
        ]}
        eyebrow="Money · calculator"
        title={calc.title}
        lead={calc.lead}
      >
        <PrintButton className="btn btn-primary">Print, or save as a PDF</PrintButton>
      </PageHero>

      <section className="section" aria-label={`${calc.name} calculator`}>
        <div className="wrap">
          <Calculator slug={calc.slug} formula={calc.formula} />
        </div>
      </section>

      <article className="section hairline bg-paper">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-55">
          <div className="min-w-0">
            <Block id="mc-what" title="What it works out">
              <div className="grid gap-13">
                {calc.explain.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Block>
            <Block id="mc-out" title="What the sum leaves out">
              <List items={calc.limits} />
            </Block>
            <Block id="mc-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {calc.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          </div>

          <aside className="min-w-0" aria-label="The formula and its assumptions">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <div className="panel p-21">
                <h2 className="eyebrow">The formula</h2>
                <div className="num mt-13 grid gap-5 text-ink">
                  {calc.formula.map((x) => (
                    <p key={x} className="break-words">
                      {x}
                    </p>
                  ))}
                </div>
                <ul className="mt-13 grid gap-5 border-t border-line pt-13 text-sm text-ink-2">
                  {calc.symbols.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-21 border-l-2 border-accent pl-13">
                <h2 className="label">An assumption is not a forecast</h2>
                <p className="mt-5 text-sm text-ink-2">{MONEY_ASSUMPTION}</p>
              </div>
              <p className="mt-21 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {calc.also.join(" · ")}
              </p>
            </div>
          </aside>
        </div>
        <div className="wrap">
          <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">
            Arithmetic on figures you supply, for study. {educationalNote} It takes no account of your circumstances, and nothing typed into the calculator is sent or stored.
          </p>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More calculators"
        items={[
          ...related.map((m) => ({ kind: "Calculator", label: m.name, href: `/money/${m.slug}`, note: m.card })),
          { kind: "Money", label: "All money calculators", href: "/money", note: `${MONEY.length} calculators, each with its working shown.` },
          { kind: "Tools", label: "Trading calculators", href: "/tools", note: "The trading sums, on your own figures." },
        ]}
      />
    </>
  );
}
