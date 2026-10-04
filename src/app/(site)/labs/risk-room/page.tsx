import Link from "next/link";
import { MachinePage } from "@/components/labs/MachinePage";
import { Correlation, LosingStreaks, Recovery, RiskOfRuin, SizingLadder } from "@/components/labs/risk/Machines";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote } from "@/components/ui/Page";
import { educationalNote } from "@/config/legal";
import { pageMeta } from "@/lib/meta";
import { faqSchema } from "@/lib/schema";

/**
 * The Risk Room: five machines about how an account is lost and how slowly it
 * comes back. The rule the page keeps: every figure is a simulation on
 * invented odds or arithmetic on the visitor's own inputs, the model
 * (independent trades of fixed odds) is stated, and so is the fact that real
 * trading is not like that. It explains; it never says what size to trade.
 */

const DESCRIPTION =
  "Five machines about risk: a risk of ruin simulator, one run of trades replayed at five position sizes, the exact chance of a losing streak, how correlation changes the swing of a portfolio, and the gain needed to recover a loss. Simulations on invented figures; nothing is stored.";

export const metadata = pageMeta({ title: "The Risk Room: risk of ruin, losing streaks and drawdown recovery", description: DESCRIPTION, path: "/labs/risk-room" });

/** What the machines assume, in the order a visitor meets it (components/labs/risk/math.ts). */
const model = [
  { t: "Every trade is independent.", d: "The result of one trade tells the next one nothing. In the simulations a win or a loss is one draw from a seeded generator, so the same run number always gives the same run." },
  { t: "The odds never change.", d: "The win rate and the size of a gain against a loss are whatever the sliders say, for every trade. A gain is always the same multiple of the amount risked, and a loss is always exactly the amount risked." },
  { t: "The risk is a share of the account as it stands.", d: "Each trade risks the same percentage of the current balance, so the amount shrinks after a loss and grows after a gain. Ruin is counted the first time a run is the chosen percentage below where it began, and the run stops there." },
  { t: "The streak figure is exact; the fan is a count.", d: "The chance of a losing streak is computed in full by dynamic programming, with the method stated beside it. The risk of ruin is the share of 240 simulated runs that hit the level: another 240 would give a slightly different share." },
  { t: "The holdings are bell-curve steps.", d: "Each invented holding moves by a random step with a fixed swing, and every pair shares one correlation. The combined swing is the standard formula for the standard deviation of a weighted sum." },
];

const differs = [
  { t: "Real trades are not independent.", d: "Losses tend to arrive together, because the conditions that cause one often cause the next, and because people trade differently after a loss. Streaks in practice can be longer than the independent figure suggests." },
  { t: "Nobody knows their odds.", d: "A win rate measured over past trades is an estimate with a wide margin, and it shifts as markets change. The sliders ask for numbers that in practice cannot be known this exactly." },
  { t: "A loss is not always the amount risked.", d: "A price can pass through a stop in a gap or a fast market, so a real loss can be larger than planned. Costs such as spread, commission and financing are not modelled here at all." },
  { t: "Correlations move.", d: "The correlation between two holdings is not a fixed property. Holdings that moved apart in calm periods have often fallen together under stress, which is when the relief was wanted." },
];

const faq = [
  {
    q: "What is risk of ruin?",
    a: "It is the chance that a run of trades takes an account down to a level from which the trader cannot or will not carry on. In a simple model it depends on three things: how often trades win, how large a gain is against a loss, and how much of the account is risked on each trade. The machine on this page counts how many simulated runs reach the level you choose.",
  },
  {
    q: "Why does a 50% loss need a 100% gain to recover?",
    a: "Because the gain is earned on what is left, not on what there was. After a 50% loss, 100 has become 50, and 50 must double to be 100 again. In general a loss of x needs a gain of x ÷ (1 − x): 10% needs about 11.1%, 20% needs 25%, 50% needs 100% and 90% needs 900%.",
  },
  {
    q: "How likely is a long losing streak?",
    a: "More likely than most people expect, and more likely the more trades are taken. For independent trades the chance can be worked out exactly. Three fair coin flips give three tails one time in eight, yet across a hundred trades with a 45% win rate, six losses in a row somewhere is more likely than not. The machine works out the figure for the numbers you choose.",
  },
  {
    q: "Can this page tell me my own risk of ruin?",
    a: "No. It models independent trades with fixed odds and losses that are never larger than planned. Real trading has none of those properties, and a person’s true win rate is not known. The page shows how the arithmetic behaves, which is worth understanding, but its figures are not a measurement of any real account or method.",
  },
];

export default function Page() {
  return (
    <MachinePage
      path="/labs/risk-room"
      title="The Risk Room"
      description={DESCRIPTION}
      lead="Five machines about how an account is lost and how slowly it comes back. Each is a simulation on invented figures, or arithmetic you can check, and each says what it leaves out."
      eyebrow="GIO4X Labs · Simulation"
      punch="small"
      machines={[
        { id: "ruin", eyebrow: "Risk of ruin", title: "A few hundred futures at the same odds.", lead: "Set a win rate, the size of a gain against a loss, the share risked on each trade and the fall that counts as ruin. The fan shows where 240 simulated runs went, and how many hit the level.", go: { href: "/tools/position-size", label: "Tool: Position Size" }, body: <RiskOfRuin /> },
        { id: "ladder", eyebrow: "The sizing ladder", title: "The same trades at five sizes.", lead: "One invented run of wins and losses, replayed at 0.5%, 1%, 2%, 5% and 10% risk per trade. The larger sizes fall further and take longer to get back.", go: { href: "/tools/drawdown", label: "Tool: Drawdown" }, body: <SizingLadder /> },
        { id: "streaks", eyebrow: "Losing streaks", title: "A long run of losses is ordinary.", lead: "For a win rate and a number of trades, the exact chance of at least so many losses in a row, and one simulated run with its longest streak marked.", go: { href: "/labs/mind", label: "The Mind Room" }, body: <LosingStreaks /> },
        { id: "correlation", eyebrow: "Correlation of a portfolio", title: "Several holdings, or one in disguise?", lead: "Two to four invented holdings in equal shares. Move the slider to set how closely they move together, and compare the combined swing with the average of the parts.", go: { href: "/labs/engine-room", label: "The Engine Room" }, body: <Correlation /> },
        { id: "recovery", eyebrow: "Recovery arithmetic", title: "The way back is longer than the way down.", lead: "A loss of x needs a gain of x ÷ (1 − x) to undo it. The bar falls and must climb back; the curve shows how fast the climb grows.", go: { href: "/tools/compound-growth", label: "Tool: Compound Growth" }, body: <Recovery /> },
      ]}
      after={
        <>
          <JsonLd data={faqSchema(faq)} />

          <section className="section-quiet hairline bg-paper" aria-labelledby="risk-model">
            <div className="wrap phi phi-r items-start">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
                <p className="eyebrow">The model</p>
                <h2 id="risk-model" className="h3 mt-13">
                  What the machines assume.
                </h2>
                <p className="mt-21 max-w-narrow text-ink-2">
                  Ordinary arithmetic and a seeded random number generator, run in your browser: no data feed, nothing sent anywhere and nothing stored. The sizing sum that turns a risk per trade into a position is in the{" "}
                  <Link href="/tools/position-size" className="link">
                    Position Size
                  </Link>{" "}
                  tool.
                </p>
                <div className="mt-21 grid gap-8">
                  <DataNote status="simulation">Invented odds, invented holdings and example accounts. {educationalNote}</DataNote>
                </div>
              </div>
              <ol className="border-t border-line">
                {model.map((r, i) => (
                  <li key={r.t} className="grid grid-cols-[3.4375rem_1fr] gap-x-13 border-b border-line py-21">
                    <span className="num pt-3 text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="h4">{r.t}</h3>
                      <p className="mt-8 max-w-measure text-ink-2">{r.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="section-quiet hairline" aria-labelledby="risk-differs">
            <div className="wrap phi items-start">
              <div>
                <p className="eyebrow">What it is not</p>
                <h2 id="risk-differs" className="h3 mt-13">
                  Real trading is not a row of fixed bets.
                </h2>
                <p className="mt-21 max-w-narrow text-ink-2">The model is simple on purpose, so the arithmetic can be seen. Each simplification makes the picture tidier than the thing it describes, and none of the figures here measures a real account or method.</p>
              </div>
              <ul className="border-t border-line">
                {differs.map((r) => (
                  <li key={r.t} className="border-b border-line py-21">
                    <h3 className="h4">{r.t}</h3>
                    <p className="mt-8 max-w-measure text-ink-2">{r.d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="section-quiet hairline bg-paper" aria-labelledby="risk-faq">
            <div className="wrap phi items-start">
              <div>
                <p className="eyebrow">Questions people ask</p>
                <h2 id="risk-faq" className="h3 mt-13">
                  Ruin, streaks and the way back.
                </h2>
              </div>
              <dl className="border-t border-line">
                {faq.map((f) => (
                  <div key={f.q} className="border-b border-line py-21">
                    <dt className="h4">{f.q}</dt>
                    <dd className="mt-8 max-w-measure text-ink-2">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </>
      }
      next={[
        { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "From a risk per trade and a stop to a size, with your own figures." },
        { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule and test it on invented prices." },
        { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Tell coin flips from a real tilt. It is harder than it sounds." },
        { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
      ]}
    />
  );
}
