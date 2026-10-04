import Link from "next/link";
import { FileForm } from "@/components/labs/bench/FileForm";
import { RuleBench } from "@/components/labs/bench/RuleBench";
import { BENCH, MARKETS } from "@/components/labs/bench/strategy";
import { MachinePage } from "@/components/labs/MachinePage";
import { DataNote } from "@/components/ui/Page";
import { educationalNote } from "@/config/legal";
import { pageMeta } from "@/lib/meta";

const DESCRIPTION =
  "Build a trading rule from parts (an entry, a stop, a target, a risk per trade), test it on invented prices for six example markets, then see the same rule on forty other markets. A simulation that shows how a backtest works and how one good result misleads. You can also send us the source of your own EA or indicator.";

export const metadata = pageMeta({ title: "Rule bench: build a rule and test it on invented prices", description: DESCRIPTION, path: "/labs/rule-bench" });

/** How a test decides things, in the order it decides them (components/labs/bench/strategy.ts). */
const rules = [
  { t: "The prices are a seeded random walk.", d: `${BENCH.bars} bars, each made of ${BENCH.steps} small steps, with faster stretches now and then and a rare gap between two bars. The same market number always produces the same bars. There is one invented market for each kind of instrument: ${MARKETS.map((m) => m.kind.toLowerCase()).join(", ")}.` },
  { t: "The rule is read at the close of a bar.", d: "It can see only the bars that have already closed. A signal is acted on at the open of the next bar, never at the price that produced it." },
  { t: "The spread is paid on the way in.", d: "A long opens one spread above the next open and a short one spread below it, so every trade starts slightly negative. The spread is fixed; a real one widens and narrows." },
  { t: "The size comes from the stop.", d: "Lots = (balance × risk %) ÷ (stop distance × contract size), rounded down to 0.01. The stop distance is a number of average ranges: the average, over 14 bars, of how far a bar travelled." },
  { t: "The stop is checked before the target.", d: "If one bar touches both, the test counts the loss. If a bar opens beyond the stop after a gap, the trade closes at that open, which is worse than the stop: a stop is an instruction, not a promise of a price." },
  { t: "An opposite signal closes the trade.", d: "It closes at the next open, and a trade the other way opens there if the rule allows that side. Whatever is still open at the last bar is closed at its close." },
];

const differs = [
  { t: "These prices cannot be predicted.", d: "A random walk has no memory. No rule has an edge on it, so every gain on this page is luck and the only reliable effect is the cost. A real market is not a pure random walk, but a test on real prices can be fooled by luck in exactly the same way." },
  { t: "One test is one draw.", d: "A rule tuned until it looks good on one stretch of prices has been fitted to that stretch. The forty other markets show what the same rule does when it meets prices it was not tuned on." },
  { t: "Nothing here is filled like a real order.", d: "Every order is filled in full at the price the test names. Margin is not modelled, the spread never widens, there is no swap and no commission. Real costs are larger and less regular." },
  { t: "It is not a strategy tester.", d: "MetaTrader runs MQL programs and TradingView runs Pine Script; a web page cannot run either. This bench runs only the rules that can be built from its own parts." },
];

export default function Page() {
  return (
    <MachinePage
      path="/labs/rule-bench"
      title="Rule bench"
      description={DESCRIPTION}
      lead="Build a trading rule from parts and test it on invented prices. Then watch the same rule meet forty other markets, and see how much of a good result was the market it happened to meet."
      eyebrow="GIO4X Labs · Simulation"
      punch="arithmetic"
      machines={[
        { id: "bench", wide: true, eyebrow: "The bench", title: "A rule, a market, a result.", lead: "Choose a market, say when to get in, set the stop, the target and the risk. Every change runs the test again.", go: { href: "/labs/simulator", label: "Trade by hand on the practice desk" }, body: <RuleBench /> },
        { id: "send", eyebrow: "Your own EA or indicator", title: "Send us the source.", lead: "Written an Expert Advisor, an indicator or a script? Send the source and a member of staff will read it. It is not run here and it is not published.", go: { href: "/platforms", label: "The platforms" }, body: <FileForm /> },
      ]}
      after={
        <>
          <section className="section-quiet hairline bg-paper" aria-labelledby="bench-rules">
            <div className="wrap phi phi-r items-start">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
                <p className="eyebrow">The test’s rules</p>
                <h2 id="bench-rules" className="h3 mt-13">
                  How a test decides.
                </h2>
                <p className="mt-21 max-w-narrow text-ink-2">
                  Ordinary software and a seeded random number generator: no language model, no data feed, nothing sent anywhere and nothing stored. The sizing formula is the{" "}
                  <Link href="/tools/position-size" className="link">
                    Position Size
                  </Link>{" "}
                  tool’s.
                </p>
                <div className="mt-21 grid gap-8">
                  <DataNote status="simulation">Invented prices, invented instruments and an example account. {educationalNote}</DataNote>
                </div>
              </div>
              <ol className="border-t border-line">
                {rules.map((r, i) => (
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

          <section className="section-quiet hairline" aria-labelledby="bench-differs">
            <div className="wrap phi items-start">
              <div>
                <p className="eyebrow">What it is not</p>
                <h2 id="bench-differs" className="h3 mt-13">
                  A result here is not evidence.
                </h2>
                <p className="mt-21 max-w-narrow text-ink-2">The bench teaches how a test is put together and how easily one result misleads. It does not find rules that work, and nothing it shows says what any market will do.</p>
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
        </>
      }
      next={[
        { kind: "Labs", label: "Practice desk", href: "/labs/simulator", note: "Place, manage and close example trades by hand." },
        { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Tell coin flips from a real tilt. It is harder than it sounds." },
        { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "The sizing formula the bench uses, with your own figures." },
        { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
      ]}
    />
  );
}
