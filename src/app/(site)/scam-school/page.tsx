import Link from "next/link";
import { OfferCheck, type OfferQuestion } from "@/components/scams/OfferCheck";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { CHECKS, IF_IT_HAPPENED, NO_PROMISE, SCAMS, SCAM_GROUPS, getScam } from "@/data/scams";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * SCAM SCHOOL — the index: the "Check this offer" list, the twelve pages on
 * how common investment frauds work, and what people do once one has happened.
 *
 * The rule it keeps: it describes types of fraud and names no real firm,
 * person, website or product. The checklist is a prompt, not a verdict, and
 * stores and sends nothing. Nothing here is legal advice, and nothing
 * promises that lost money can be recovered.
 */
const DESCRIPTION =
  "Scam school: how investment scams work, one page each. Ponzi and pyramid schemes, pump and dump, clone firms, fake brokers, signal sellers, romance investment fraud, recovery rooms, phishing, advance-fee fraud and deepfake endorsements, each with an animated explainer. Plus a checklist of warning signs to run an offer through.";

export const metadata = pageMeta({ title: "Scam school: how investment scams work, and how to spot one", description: DESCRIPTION, path: "/scam-school" });

const FAQ = [
  {
    q: "How can I check whether an investment offer is a scam?",
    a: "No single test settles it. The checks that catch most frauds are these: find the firm on the financial regulator’s register in your country and use the contact details given there, not the ones you were sent; treat a guaranteed return, pressure to decide, an unusual way of paying and any fee to withdraw as warning signs; and talk it over with someone who has nothing to gain from your decision.",
  },
  {
    q: "What are the most common warning signs of investment fraud?",
    a: "A return that is guaranteed or far above what banks pay; contact you did not ask for; pressure to act today; payment in crypto-assets, gift cards or to a private account; a request for remote access, a password or a one-time code; being told to keep it from your bank or family; and a charge that must be paid before you can withdraw your own money.",
  },
  {
    q: "What should I do if I think I have been scammed?",
    a: "In general terms: stop paying, keep every record, tell your bank or payment provider at once using a number you find yourself, and report it to the police or fraud-reporting service and the financial regulator in your country. Be ready for a second approach from people offering to recover the money for a fee.",
  },
  { q: "Can money lost to an investment scam be recovered?", a: NO_PROMISE },
];

const QUESTIONS: OfferQuestion[] = CHECKS.map((c) => {
  const scam = c.see ? getScam(c.see) : undefined;
  return { id: c.id, q: c.q, short: c.short, weight: c.weight, ...(scam ? { href: `/scam-school/${scam.slug}`, label: scam.name } : {}) };
});

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/scam-school", name: "Scam school", description: DESCRIPTION, type: "CollectionPage" })} />
      <JsonLd data={faqSchema(FAQ)} />
      <PageHero
        crumbs={[{ name: "Scam school", href: "/scam-school" }]}
        quiet
        eyebrow="How frauds work"
        title="Scam school"
        lead={`${SCAMS.length} short pages on how the common investment frauds work: the steps, why each is convincing, the signs, and a moving picture of the mechanism. And one list of questions to put to any offer.`}
      >
        <Link href="#check" className="btn btn-primary">
          Check an offer
        </Link>
        <Link href="#frauds" className="btn btn-ghost">
          The {SCAMS.length} frauds
        </Link>
      </PageHero>

      <section id="check" className="section scroll-mt-[var(--header-h)]" aria-labelledby="check-h">
        <div className="wrap">
          <p className="eyebrow">Check this offer</p>
          <h2 id="check-h" className="h2 mt-13 max-w-[22ch]">
            {CHECKS.length} questions to put to any offer.
          </h2>
          <p className="lead mt-13 max-w-measure">Each “yes” is a warning sign. The gauge fills as you tick, and a sentence says how many are present and which matter most. It does not decide anything for you.</p>
          <div className="mt-34">
            <OfferCheck questions={QUESTIONS} />
          </div>
        </div>
      </section>

      <div id="frauds" className="scroll-mt-[var(--header-h)]">
        {SCAM_GROUPS.map((g, gi) => (
          <section key={g.id} id={g.id} className={`section hairline scroll-mt-[var(--header-h)] ${gi % 2 ? "" : "bg-paper"}`} aria-labelledby={`${g.id}-h`}>
            <div className="wrap">
              <p className="eyebrow">{g.eyebrow}</p>
              <h2 id={`${g.id}-h`} className="h2 mt-13 max-w-[24ch]">
                {g.title}
              </h2>
              <p className="lead mt-13 max-w-measure">{g.lead}</p>
              <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
                {SCAMS.filter((s) => s.group === g.key).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/scam-school/${s.slug}`} className="panel group flex h-full flex-col justify-between gap-21 p-21">
                      <span>
                        <span className="block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{s.name}</span>
                        <span className="mt-8 block text-sm text-ink-2">{s.line}</span>
                      </span>
                      <span className="go" aria-hidden>
                        How it works
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section id="if-it-happened" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="happened-h">
        <div className="wrap phi items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="eyebrow">If it has happened</p>
            <h2 id="happened-h" className="h2 mt-13 max-w-[20ch]">
              What people do next, in general terms.
            </h2>
            <p className="lead mt-13 max-w-[30rem]">The same steps apply to nearly every fraud on these pages. They are general information, not legal advice: the rules, and who to report to, depend on the country you are in.</p>
            <p className="mt-21 max-w-[30rem] text-sm text-ink-2">{NO_PROMISE}</p>
            <p className="mt-21 max-w-[30rem] text-sm text-ink-2">
              Regulators publish free warning lists and registers of authorised firms. This site lists several under{" "}
              <Link href="/nice-and-need#safe" className="link">
                Nice &amp; Need: stay safe
              </Link>
              . To check an address that claims to be this site, use{" "}
              <Link href="/trust/verify" className="link">
                Verify a GIO4X link
              </Link>
              .
            </p>
          </div>
          <ol className="min-w-0 border-t border-line">
            {IF_IT_HAPPENED.map((x, i) => (
              <li key={x.t} className="grid grid-cols-[2.125rem_1fr] gap-x-13 border-b border-line py-13">
                <span className="num text-sm text-ink-3" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-medium text-ink">{x.t}</span>
                  <span className="mt-3 block text-sm text-ink-2">{x.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="faq-h">
        <div className="wrap">
          <p className="eyebrow">Questions people ask</p>
          <h2 id="faq-h" className="h2 mt-13 max-w-[22ch]">
            Short answers.
          </h2>
          <dl className="mt-34 grid max-w-measure gap-21 text-ink-2">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-5">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-34 max-w-measure border-t border-line pt-13 text-sm text-ink-3">
            These pages describe types of fraud for study. They name no real firm, person, website or product, and retell no real case. They are not legal advice and not a judgement on any offer you may have received.
          </p>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="trust" />
      <NextSteps
        items={[
          { kind: "Nice & Need", label: "Regulators’ warning lists", href: "/nice-and-need#safe", note: "Free registers and alerts, from the regulators themselves." },
          { kind: "Trust", label: "Verify a GIO4X link", href: "/trust/verify", note: "Check that an address is really this site." },
          { kind: "Labs", label: "The mind room", href: "/labs/mind", note: "Four games about how people fool themselves." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "What genuine trading can cost." },
        ]}
      />
    </>
  );
}
