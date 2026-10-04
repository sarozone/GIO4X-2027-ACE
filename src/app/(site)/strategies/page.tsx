import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { StrategyThumb } from "@/components/strategies/StrategyThumb";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { HOLDS, NOT_ADVICE, STRATEGIES } from "@/data/strategies";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The strategy library's index: every approach as a card, grouped by how long
 * a trade is held. The pages describe; none of them recommends, and this page
 * says so before the first card.
 */
const DESCRIPTION =
  "Trading strategies explained, one page each: trend following with moving averages, breakout trading, RSI mean reversion, range trading, momentum, swing trading, scalping, position trading, the carry trade and news trading, with grid trading and martingale explained as cautions. What each needs, what it costs and when it fails. Descriptions, not recommendations.";

export const metadata = pageMeta({ title: "Trading strategies explained: what each needs, costs and gets wrong", description: DESCRIPTION, path: "/strategies" });

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/strategies", name: "Strategy library", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Strategy library", href: "/strategies" },
        ]}
        eyebrow="Academy · approaches people use"
        title="Strategy library"
        lead={`${STRATEGIES.length} well-known approaches, one page each: the idea, the rule as it is usually stated, what it needs from a market, what it costs and when it fails. None of them is recommended, and none has been shown here to be profitable.`}
      />

      <section className="section-quiet" aria-labelledby="lib-read">
        <div className="wrap">
          <div className="panel max-w-[52rem] p-21">
            <h2 id="lib-read" className="label">
              Before you read any of them
            </h2>
            <p className="mt-8 text-ink-2">
              Each page is a description of an approach people use. It is not a recommendation. No approach works in every market: each one here does well in one kind of market and badly in another, and nobody knows in advance which kind is coming. Nothing in this library has been shown to be profitable, and every chart in it is invented.
            </p>
          </div>
        </div>
      </section>

      {HOLDS.map((g, gi) => (
        <section key={g.id} id={g.id} className={`section scroll-mt-[var(--header-h)] hairline ${gi % 2 ? "bg-paper" : ""}`} aria-labelledby={`${g.id}-h`}>
          <div className="wrap">
            <p className="gx-numeral" aria-hidden>
              {String(gi + 1).padStart(2, "0")}
            </p>
            <p className="eyebrow mt-8">{g.eyebrow}</p>
            <h2 id={`${g.id}-h`} className="h2 mt-13 max-w-[24ch]">
              {g.title}
            </h2>
            <p className="lead mt-13 max-w-[44rem]">{g.lead}</p>
            <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
              {STRATEGIES.filter((s) => s.hold === g.key).map((s) => (
                <li key={s.slug}>
                  <Link href={`/strategies/${s.slug}`} className="gx-play-card group">
                    <StrategyThumb kind={s.picture} />
                    <span className="mt-13 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{s.name}</span>
                    <span className="mt-5 block text-sm text-ink-2">{s.idea.split(/(?<=\.)\s/)[0]}</span>
                    <span className="mt-13 flex flex-wrap gap-5">
                      <span className="chip">{s.held}</span>
                      {s.caution && <span className="chip">A caution</span>}
                      {s.bench && <span className="chip">In the rule bench</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">{NOT_ADVICE} The small pictures on the cards are those invented paths, with a dot where a trade opens.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="trend" />
      <NextSteps
        items={[
          { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule and see what it does on invented prices." },
          { kind: "Academy", label: "The Playbook", href: "/playbook", note: "Candlestick patterns and common situations." },
          { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "How large a trade is for a given stop and risk." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
        ]}
      />
    </>
  );
}
