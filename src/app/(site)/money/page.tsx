import Link from "next/link";
import { MoneyGlyph } from "@/components/money/Glyph";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { MONEY, MONEY_ASSUMPTION } from "@/data/money";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * /money — the index of the personal finance calculators.
 *
 * The rule the section keeps: each calculator is arithmetic on the visitor's
 * own figures with its formula shown. No rate is supplied as fact, no currency
 * is assumed, nothing is stored.
 */

const DESCRIPTION =
  "Personal finance calculators that show their working: regular investing (SIP), retirement, loan EMI with an amortisation table, inflation, a savings goal planner, tax drag and the rule of 72. Every rate is your own assumption, no currency is assumed, and nothing is stored.";

export const metadata = pageMeta({ title: "Money calculators: investing, retirement, loans, inflation", description: DESCRIPTION, path: "/money" });

const points = [
  { t: "The rate is yours.", d: "A calculator needs a rate of growth, of inflation or of tax, and nobody knows the first two in advance. Each box opens with an example figure so that the page has something to draw. It is there to be replaced." },
  { t: "The formula is on the page.", d: "Each result is shown with its formula and with your own figures put into it, line by line, so that it can be checked by hand or in a spreadsheet." },
  { t: "No currency is assumed.", d: "The arithmetic is the same in every currency. A symbol can be chosen for the figures, or left off." },
  { t: "Nothing is kept.", d: "The sums are done in your browser. Nothing you type is sent anywhere or stored, and it is gone when the page is closed." },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/money", name: "Money calculators", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[{ name: "Money", href: "/money" }]}
        eyebrow="Money · personal finance calculators"
        title="Money calculators"
        lead={`${MONEY.length} calculators for everyday money questions. Each works on your own figures, shows its formula and its working, and draws the result. None of them says what to do.`}
      />

      <section className="section" aria-labelledby="money-list">
        <div className="wrap">
          <p className="eyebrow">The calculators</p>
          <h2 id="money-list" className="h2 mt-13 max-w-[24ch]">
            Seven sums, each with its working shown.
          </h2>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {MONEY.map((m) => (
              <li key={m.slug}>
                <Link href={`/money/${m.slug}`} className="gx-play-card group">
                  <MoneyGlyph slug={m.slug} />
                  <span className="mt-13 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{m.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{m.card}</span>
                  <span className="num mt-13 block break-words text-xs text-ink-3">{m.formula[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="money-how">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">How to read them</p>
            <h2 id="money-how" className="h3 mt-13">
              An assumed rate is not a forecast.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">{MONEY_ASSUMPTION}</p>
            <p className="mt-13 max-w-narrow text-sm text-ink-3">{educationalNote}</p>
          </div>
          <ul className="border-t border-line">
            {points.map((p) => (
              <li key={p.t} className="border-b border-line py-21">
                <h3 className="h4">{p.t}</h3>
                <p className="mt-8 max-w-measure text-ink-2">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="arithmetic" />
      <NextSteps
        items={[
          { kind: "Tools", label: "Trading calculators", href: "/tools", note: "The trading sums, on your own figures." },
          { kind: "Academy", label: "The Academy", href: "/academy", note: "Lessons, from the first idea onwards." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "The words, one at a time." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
        ]}
      />
    </>
  );
}
