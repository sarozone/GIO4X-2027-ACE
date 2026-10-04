import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeTimeline } from "@/components/history/EpisodeTimeline";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { educationalNote, riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { HISTORY, getEpisode } from "@/data/history";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * MARKET HISTORY — one episode. The words are all in the HTML: what led up
 * to it, the dated events in order, what changed, what it helps to
 * understand, what is disputed and where the account comes from. The stepped
 * timeline at the top repeats the events; its curve is an illustrative shape
 * and is labelled so.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return HISTORY.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEpisode((await params).slug);
  if (!e) return {};
  return pageMeta({ title: e.title, description: e.description, path: `/history/${e.slug}`, type: "article", publishedTime: WRITTEN });
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
  const e = getEpisode((await params).slug);
  if (!e) notFound();
  const path = `/history/${e.slug}`;
  const terms = e.terms.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);
  const at = HISTORY.findIndex((x) => x.slug === e.slug);
  const later = HISTORY[(at + 1) % HISTORY.length];
  const earlier = HISTORY[(at + HISTORY.length - 1) % HISTORY.length];

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: e.title, description: e.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Market history" })} />
      <JsonLd data={faqSchema([...e.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Market history", href: "/history" },
          { name: e.name, href: path },
        ]}
        eyebrow={`Market history · ${e.span} · ${e.place}`}
        title={e.title}
        lead={e.is}
      >
        <PrintButton className="btn btn-primary">Save this page as a PDF</PrintButton>
      </PageHero>

      <section className="section" aria-labelledby="mh-steps">
        <div className="wrap">
          <p className="eyebrow">Step by step</p>
          <h2 id="mh-steps" className="h2 mt-13 max-w-[22ch]">
            The events, one at a time.
          </h2>
          <p className="lead mt-13 max-w-[44rem]">Press Next, or Play, to move along the line. The curve above it is an illustrative shape, not market data.</p>
          <div className="mt-34 min-w-0">
            <EpisodeTimeline events={e.events} start={e.start} shape={e.shape} />
          </div>
        </div>
      </section>

      <article className="section hairline bg-paper">
        <div className="wrap">
          <div className="min-w-0 max-w-[48rem]">
            <section aria-labelledby="mh-before">
              <h2 id="mh-before" className="h4">
                What led up to it
              </h2>
              <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
                {e.before.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            <Block id="mh-order" title="What happened, in order">
              <ol className="grid gap-13">
                {e.events.map((m) => (
                  <li key={m.when} className="grid gap-3 sm:grid-cols-[9.5rem_1fr] sm:gap-x-13">
                    <span className="num font-medium text-ink">{m.when}</span>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ol>
            </Block>

            <Block id="mh-after" title="What changed afterwards">
              <List items={e.after} />
            </Block>

            <Block id="mh-take" title="What it helps a trader to understand">
              <List items={e.takeaways} />
              <p className="mt-13 text-sm text-ink-3">These are observations about how markets and rules work, drawn from one episode. They are not advice, and they do not say that anything like it will or will not happen again.</p>
            </Block>

            <Block id="mh-caution" title="What is uncertain or disputed">
              <p>{e.caution}</p>
            </Block>

            <Block id="mh-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {e.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            {terms.length > 0 && (
              <Block id="mh-terms" title="The words on this page">
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

            <Block id="mh-sources" title="Where this account comes from">
              <p>{e.sources}</p>
              <p className="mt-13 text-sm text-ink-3">A number is given on this page only where it is famous and certain. Nothing here is a quotation.</p>
            </Block>

            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">A history for study. {educationalNote} What happened in one episode says nothing certain about what any market will do next.</p>
          </div>
        </div>
      </article>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        title="More market history"
        items={[
          { kind: later.span, label: later.name, href: `/history/${later.slug}`, note: later.line },
          { kind: earlier.span, label: earlier.name, href: `/history/${earlier.slug}`, note: earlier.line },
          { kind: "Market history", label: "All eleven episodes", href: "/history", note: "One line across four centuries." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The terms used on these pages." },
        ]}
      />
    </>
  );
}
