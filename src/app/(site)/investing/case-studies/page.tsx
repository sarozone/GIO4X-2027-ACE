import Link from "next/link";
import { Standing } from "@/components/case-studies/Standing";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { CASE_STUDIES, DISCLOSURE } from "@/data/case-studies";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * CASE STUDIES — the index of the five studies (data/case-studies.ts).
 *
 * Before the studies the page says what public disclosure does and does not
 * show, because "copying" a well-known investor from filings is the first
 * thing a reader is likely to think of, and it is not what it sounds like.
 * That section describes holdings reports in general; it states no country's
 * detailed rules.
 *
 * The rules the page keeps: the four standing statements appear near the top;
 * the studies summarise published ideas in paraphrase; nothing is advice and
 * nothing says a method will work.
 */
const PATH = "/investing/case-studies";
const DESCRIPTION =
  "Five case studies of how professional investors think, from their own published work: Buffett and Munger, John Bogle, Ray Dalio, George Soros, and how institutional execution and risk teams operate. Sources named, failures included, and what public holdings filings do and do not show. Explanations, not advice.";

export const metadata = pageMeta({ title: "Professional investor case studies: methods, sources and limits", description: DESCRIPTION, path: PATH });

const parts = [
  { t: "The ideas, with their sources", d: "Each idea is paraphrased and tied to the book, letter or paper it comes from, named by title, author, publisher and year. There are no quotations and no links." },
  { t: "A documented example", d: "One episode from the public record, told with its dates. A figure appears only where it is well known and comes from the named source." },
  { t: "A failure the record admits", d: "Every study includes what went wrong, in most cases in the person’s own account. A method described only by its successes has not been described." },
  { t: "A paper exercise", d: "What part of the thinking can be practised with a hypothetical portfolio, linked to a tool that already exists on this site." },
  { t: "What does not scale down", d: "The financing, access, staff, tax position and time horizon behind the original, none of which a private account has." },
  { t: "One idea to handle", d: "An interactive sketch of the idea itself on invented figures: a margin, a cost, four environments, a loop, a sliced order. Never a record of anyone’s results." },
];

const faq = [
  {
    q: "Can I copy a famous investor’s portfolio from public filings?",
    a: "Not in the sense the phrase suggests. Holdings reports are published weeks after the date they describe, cover only certain kinds of holding, and usually leave out short positions, many derivatives and assets outside the reporting rules. They give neither the price paid nor the reason for the holding. A copier buys later, at a different price, without knowing whether the position still exists.",
  },
  {
    q: "Are these case studies endorsed by the investors named?",
    a: "No. GIO4X has no connection with any person or firm named, and none of them has seen or approved these pages. The studies are written from books, shareholder letters, papers and official reports that anyone can read, and nobody at GIO4X has access to anyone’s portfolio.",
  },
  {
    q: "Will studying a professional investor’s method produce the same results?",
    a: "No. A method is a way of reasoning; a result came from particular decisions in particular years, made with financing, access, staff, tax treatment and a time horizon that a private account does not have. Each study lists what does not scale down, and each includes a failure, because the same method also produced losses.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: "Professional investor case studies", description: DESCRIPTION, type: "CollectionPage" })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Investing", href: "/investing" },
          { name: "Case studies", href: PATH },
        ]}
        eyebrow="Investing · case studies"
        title="How professionals think, from what they published."
        lead={`${CASE_STUDIES.length} studies of ideas that are on the public record: what was said, where it was published, an example with its dates, a failure, and what a private account cannot reproduce. They explain a way of reasoning. They do not say what to buy.`}
      >
        <Link href="#disclosure" className="btn btn-primary">
          What filings show
        </Link>
        <Link href="#studies" className="btn btn-ghost">
          The five studies
        </Link>
      </PageHero>

      <Standing />

      <section id="disclosure" className="section scroll-mt-[var(--header-h)]" aria-labelledby="disclosure-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            01
          </p>
          <p className="eyebrow mt-8">Before the studies</p>
          <h2 id="disclosure-h" className="h2 mt-13 max-w-[24ch]">
            What public disclosure shows, and what it does not.
          </h2>
          <p className="lead mt-13 max-w-measure">In several countries large investment managers must publish periodic reports of some of their holdings. These reports are the basis of every list of “what the famous investors own”. It is worth knowing what kind of document they are before reading anything into one.</p>

          <div className="mt-34 grid gap-21 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-34">
            <div className="min-w-0">
              <h3 className="h4">What a holdings report shows</h3>
              <dl className="mt-13 border-t border-line">
                {DISCLOSURE.shows.map((x) => (
                  <div key={x.t} className="border-b border-line py-13">
                    <dt className="font-medium text-ink">{x.t}</dt>
                    <dd className="mt-5 text-sm text-ink-2">{x.d}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="min-w-0">
              <h3 className="h4">What it does not show</h3>
              <dl className="mt-13 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
                {DISCLOSURE.hides.map((x) => (
                  <div key={x.t} className="bg-surface p-13 last:sm:col-span-2">
                    <dt className="font-medium text-ink">{x.t}</dt>
                    <dd className="mt-5 text-sm text-ink-2">{x.d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="panel mt-34 p-21">
            <h3 className="h4">So “copying” is not what it sounds like</h3>
            <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
              <p>Someone who buys what a filing lists is buying weeks or months after the original holder, at a different price, a part of a position whose other parts are not visible, for a reason that was never given. If the original holder has since sold, the copier finds out a further period later, from the next report.</p>
              <p>The copier also holds it under different conditions: without the same financing, without the same tax position, and without the ability to wait that the original holder may have. The same holding in two different accounts is not the same investment.</p>
              <p className="text-sm text-ink-3">This describes holdings reports in general. The detailed rules, including who must report, what and how soon, differ from country to country and change over time; the regulator of each market publishes them.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="studies" className="section hairline scroll-mt-[var(--header-h)] bg-paper" aria-labelledby="studies-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            02
          </p>
          <p className="eyebrow mt-8">The studies</p>
          <h2 id="studies-h" className="h2 mt-13 max-w-[22ch]">
            Five ways of thinking, one page each.
          </h2>
          <p className="lead mt-13 max-w-measure">Four are about people whose ideas are in print under their own names. The fifth is about the process inside large institutions, and names no firm.</p>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {CASE_STUDIES.map((c, i) => (
              <li key={c.slug}>
                <Link href={`${PATH}/${c.slug}`} className="gx-play-card group flex h-full flex-col">
                  <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-13 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{c.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{c.card}</span>
                  <span className="mt-13 block text-xs text-ink-3">To handle: {c.machine.title.replace(/\.$/, "").toLowerCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="parts-h">
        <div className="wrap phi items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="gx-numeral" aria-hidden>
              03
            </p>
            <p className="eyebrow mt-8">How a study is built</p>
            <h2 id="parts-h" className="h2 mt-13">
              The same six parts every time.
            </h2>
            <p className="lead mt-13 max-w-[30rem]">The aim is to be checkable. A reader should be able to find the source, read it and disagree with the summary.</p>
            <PunchLine k="trust" className="mt-34" />
          </div>
          <div className="min-w-0">
            <dl className="border-t border-line">
              {parts.map((p) => (
                <div key={p.t} className="border-b border-line py-21">
                  <dt className="h4">{p.t}</dt>
                  <dd className="mt-8 max-w-measure text-ink-2">{p.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="cs-faq-h">
        <div className="wrap">
          <h2 id="cs-faq-h" className="h3">
            Questions people ask
          </h2>
          <dl className="mt-21 grid max-w-measure gap-21 text-ink-2">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-5">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-34 max-w-measure border-t border-line pt-13 text-sm text-ink-3">
            Summaries for study, in this site’s own words, of ideas that are on the public record. They are not endorsed by, or connected with, anyone named, and nobody at GIO4X has access to their portfolios. Studying a method does not reproduce its results, and a leveraged CFD is not ownership of an investment and does not behave like one. {educationalNote}
          </p>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">The value of any investment can fall as well as rise, and an investor can get back less than was put in. Past results, of anyone, say nothing certain about future ones.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        items={[
          { kind: "Investing", label: "Investing, explained", href: "/investing", note: "Stocks, bonds, funds, options and futures, one page each." },
          { kind: "History", label: "Market history", href: "/history", note: "The episodes these studies refer to, with their timelines." },
          { kind: "Labs", label: "The Risk Room", href: "/labs/risk-room", note: "How an account is lost and how slowly it comes back." },
          { kind: "Journal", label: "The journal", href: "/journal", note: "A private record of plans and what happened." },
        ]}
      />
    </>
  );
}
