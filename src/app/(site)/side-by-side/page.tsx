import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { COMPARISONS } from "@/data/comparisons";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The index of the comparisons: one card for each, naming what is compared.
 * Everything is read from data/comparisons.ts, so a new entry appears here
 * without this file changing. General descriptions only: what GIO4X itself
 * offers is on the accounts and conditions pages.
 */
const DESCRIPTION =
  "Side-by-side comparisons for traders: order types, instrument types, trading styles, chart types, the ways a trade is paid for and the kinds of market analysis. Each page has a table, a paragraph on every item, any two compared row by row and an animated drawing. Explanations, not advice.";

export const metadata = pageMeta({ title: "Side by side: trading comparisons", description: DESCRIPTION, path: "/side-by-side" });

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/side-by-side", name: "Side by side: trading comparisons", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Side by side", href: "/side-by-side" },
        ]}
        eyebrow="Academy · comparisons"
        title="Side by side"
        lead={`${COMPARISONS.length} comparisons. Each sets things of one kind next to one another and asks the same questions of all of them. None says which to choose.`}
      />
      <section className="section" aria-labelledby="cmp-all">
        <div className="wrap">
          <h2 id="cmp-all" className="h2 max-w-[24ch]">
            The same questions, asked of each.
          </h2>
          <p className="lead mt-13 max-w-[44rem]">
            Every page has a table, a paragraph on each item, a way to set any two against each other, and a drawing of how they differ in practice. They describe the general thing, as it works in most markets, and say where practice varies.
          </p>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
            {COMPARISONS.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/side-by-side/${c.slug}`} className="panel group flex h-full flex-col p-21 transition-colors duration-fast hover:border-accent">
                  <span className="gx-numeral" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-8 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{c.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{c.lead.split(/(?<=\.)\s/)[0]}</span>
                  <span className="mt-13 flex flex-wrap gap-5">
                    {c.items.map((it) => (
                      <span key={it.key} className="chip">
                        {it.name}
                      </span>
                    ))}
                  </span>
                  <span className="go mt-auto pt-21" aria-hidden>
                    Compare
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-34 max-w-measure text-sm text-ink-3">
            These pages do not describe GIO4X’s own accounts or conditions. Those are set out on{" "}
            <Link href="/trading/accounts" className="link">
              Account types
            </Link>{" "}
            and{" "}
            <Link href="/trading/conditions" className="link">
              Trading conditions
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="glossary" />
      <NextSteps
        items={[
          { kind: "Academy", label: "The Playbook", href: "/playbook", note: "Candlestick patterns and situations, one page each." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
          { kind: "Tools", label: "Trader toolkit", href: "/tools", note: "Calculators that show their formula." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
        ]}
      />
    </>
  );
}
