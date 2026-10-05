import Link from "next/link";
import { notFound } from "next/navigation";
import { ScamExplainer } from "@/components/scams/ScamExplainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PrintButton } from "@/components/ui/PrintButton";
import { riskWarning } from "@/config/legal";
import { IF_IT_HAPPENED, NO_PROMISE, SCAMS, SCAM_GROUPS, getScam } from "@/data/scams";
import { pageMeta } from "@/lib/meta";
import { articleSchema, faqSchema } from "@/lib/schema";

/**
 * SCAM SCHOOL — one page for one type of fraud: how it works step by step,
 * why it is convincing, the warning signs, what people do once it has
 * happened, three questions, and one animated explainer of the mechanism.
 *
 * Everything comes from src/data/scams.ts. The rule the page keeps: it
 * describes a type and names nobody; it is not legal advice; it promises
 * nothing about getting money back.
 */

/** the day these pages were written; changed when their words are */
const WRITTEN = "2026-10-04";

export function generateStaticParams() {
  return SCAMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const scam = getScam((await params).slug);
  if (!scam) return {};
  return pageMeta({ title: scam.title, description: scam.description, path: `/scam-school/${scam.slug}` });
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

const List = ({ items, tone = "bg-accent" }: { items: readonly string[]; tone?: string }) => (
  <ul className="grid gap-8">
    {items.map((x) => (
      <li key={x} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
        <span aria-hidden className={`mt-[0.7em] h-px w-full ${tone}`} />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const scam = getScam((await params).slug);
  if (!scam) notFound();
  const path = `/scam-school/${scam.slug}`;
  const group = SCAM_GROUPS.find((g) => g.key === scam.group);
  const at = SCAMS.findIndex((s) => s.slug === scam.slug);
  const same = SCAMS.filter((s) => s.group === scam.group && s.slug !== scam.slug);
  const others = [same[at % same.length], SCAMS[(at + 4) % SCAMS.length]].filter((s, i, all) => s && s.slug !== scam.slug && all.findIndex((q) => q.slug === s.slug) === i);

  return (
    <>
      <JsonLd data={articleSchema({ path, headline: scam.title, description: scam.description, datePublished: WRITTEN, author: "GIO4X Academy", section: "Scam school" })} />
      <JsonLd data={faqSchema([...scam.faq])} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Scam school", href: "/scam-school" },
          { name: scam.name, href: path },
        ]}
        eyebrow={`Scam school · ${group ? group.eyebrow.toLowerCase() : "how it works"}`}
        title={scam.title}
        lead={scam.is}
      >
        <PrintButton className="btn btn-primary">Save this page as a PDF</PrintButton>
        <Link href="/scam-school#check" className="btn btn-ghost">
          Check an offer
        </Link>
      </PageHero>

      <article className="section">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-55">
          <div className="no-print min-w-0 lg:order-2">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <p className="eyebrow">The mechanism</p>
              <h2 className="h4 mt-8">{scam.shows}</h2>
              <div className="mt-13">
                <ScamExplainer kind={scam.kind} />
              </div>
              <p className="mt-13 text-sm text-ink-3">
                <span className="label mr-8">Also searched as</span>
                {scam.also.join(" · ")}
              </p>
            </div>
          </div>

          <div className="min-w-0 lg:order-1">
            <section aria-labelledby="ss-steps">
              <h2 id="ss-steps" className="h4">
                How it works, step by step
              </h2>
              <ol className="mt-13 grid max-w-measure gap-13 text-ink-2">
                {scam.steps.map((x, i) => (
                  <li key={x} className="grid grid-cols-[2.125rem_1fr] gap-x-8">
                    <span className="num text-sm text-ink-3" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ol>
            </section>
            <Block id="ss-why" title="Why it is convincing">
              <List items={scam.convincing} />
            </Block>
            <Block id="ss-signs" title="The warning signs">
              <List items={scam.signs} />
              <p className="mt-21 text-sm text-ink-3">
                One sign alone proves nothing, and a fraud may show none of them at first. The{" "}
                <Link href="/scam-school#check" className="link">
                  Check this offer
                </Link>{" "}
                list puts fourteen such questions side by side.
              </p>
            </Block>
            <Block id="ss-after" title="If it has happened">
              <List items={scam.after} />
              <ol className="mt-21 grid gap-13">
                {IF_IT_HAPPENED.map((x, i) => (
                  <li key={x.t} className="grid grid-cols-[2.125rem_1fr] gap-x-8">
                    <span className="num text-sm text-ink-3" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="font-medium text-ink">{x.t}</span> {x.d}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-21">{NO_PROMISE}</p>
              <p className="mt-13 text-sm text-ink-3">
                Regulators publish free warning lists and registers of authorised firms; this site lists several under{" "}
                <Link href="/nice-and-need#safe" className="link">
                  Nice &amp; Need: stay safe
                </Link>
                . To check an address that claims to be this site, use{" "}
                <Link href="/trust/verify" className="link">
                  Verify a GIO4X link
                </Link>
                .
              </p>
            </Block>
            <Block id="ss-faq" title="Questions people ask">
              <dl className="grid gap-21">
                {scam.faq.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-ink">{f.q}</dt>
                    <dd className="mt-5">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Block>
            <p className="mt-34 border-t border-line pt-13 text-sm text-ink-3">
              A description of a type of fraud, for study. It names no real firm, person, website or product and retells no real case. It is general information, not legal advice, and not a judgement on any offer you may have received. What applies in your country is a question for the authorities
              there.
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
        title="More from Scam school"
        items={[
          ...others.map((s) => ({ kind: "How it works", label: s.name, href: `/scam-school/${s.slug}`, note: s.line })),
          { kind: "Checklist", label: "Check this offer", href: "/scam-school#check", note: "Fourteen yes-or-no questions and a gauge." },
          { kind: "Scam school", label: "All the frauds", href: "/scam-school", note: `${SCAMS.length} pages.` },
        ]}
      />
    </>
  );
}
