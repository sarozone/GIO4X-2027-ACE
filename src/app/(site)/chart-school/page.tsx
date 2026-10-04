import Link from "next/link";
import { IndicatorThumb } from "@/components/chart-school/Thumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { LESSONS } from "@/data/chart-school";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * Chart school: the index of the indicator pages, with the way on to the
 * chart patterns and to the Playbook's candlestick patterns.
 *
 * The rule it keeps: it says what each page explains and promises nothing
 * else. An indicator is arithmetic on past prices; every drawing here is of
 * an invented chart.
 */

const DESCRIPTION =
  "Chart school: technical indicators explained one page each, with the arithmetic shown. Moving averages, RSI, MACD, Bollinger Bands, ATR, the stochastic oscillator, support and resistance, and trend lines: what each measures, how it is calculated step by step, how people read it and what it cannot tell you. Every chart is invented.";

export const metadata = pageMeta({ title: "Chart school: technical indicators explained, with the arithmetic", description: DESCRIPTION, path: "/chart-school" });

const common = [
  { t: "It is arithmetic on past prices.", d: "Every indicator on these pages is a sum done on bars that have already closed: an average, a ratio, a highest and a lowest. There is nothing in it that was not already in the prices." },
  { t: "It describes. It does not predict.", d: "An indicator can say that recent closes were mostly rises, or that the price is far from its average. It cannot say what the next bar will do, and a reading that was followed by a rise last time may be followed by a fall next time." },
  { t: "It is late, by construction.", d: "An average needs bars to average, so it turns after the price has turned. The smoother the line, the later it is. Shortening it makes it quicker and noisier; nothing makes it early." },
  { t: "Its settings are choices.", d: "14, 20, 12-26-9: these are conventions, kept because they were published that way. Settings tuned until the past looks perfect have learned the past, and only that." },
  { t: "Several indicators are often one fact, counted twice.", d: "RSI, MACD and the stochastic oscillator are all made from the same closes. When they agree, that is usually not three pieces of evidence." },
];

const faq = [
  { q: "What is a technical indicator?", a: "A calculation applied to a market’s past prices (and sometimes its volume) and drawn on or under the chart. A moving average, RSI and Bollinger Bands are examples. An indicator rearranges information that is already in the prices; it changes only after the price has changed." },
  { q: "Do technical indicators predict prices?", a: "No. An indicator is arithmetic on prices that have already happened. It can describe a trend, the pace of a move or how widely prices have been swinging. It cannot say what the next price will be, and every reading has cases where the outcome usually associated with it did not follow." },
  { q: "Which indicator is the best?", a: "None is. Each one measures something different about the same past prices: an average level, the balance of rises and falls, the size of the bars. Which is useful depends on the question being asked, and many of them largely repeat one another because they are built from the same closes." },
  { q: "Are the charts on these pages real?", a: "No. Every chart in Chart school is invented: a seeded random walk generated in your browser, labelled as such, so that the arithmetic can be shown without implying anything about a real market. The same chart number always draws the same chart." },
];

const elsewhere = [
  {
    href: "/chart-school/patterns",
    eyebrow: "Chart school · shapes",
    title: "Chart patterns: head and shoulders, triangles, flags, double tops",
    note: "The shapes a price draws over many bars, what each is taken to mean, and how often the reading fails.",
    go: "Open the chart patterns",
  },
  {
    href: "/playbook",
    eyebrow: "The Playbook · candles",
    title: "Candlestick patterns: doji, hammer, engulfing and the rest",
    note: "The shapes of one, two or three candles, one page each, with the situations every trader meets.",
    go: "Open the Playbook",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/chart-school", name: "Chart school", description: DESCRIPTION, type: "CollectionPage" })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Chart school", href: "/chart-school" },
        ]}
        eyebrow="Academy · reading a chart"
        title="Chart school"
        lead={`${LESSONS.length} indicators, one page each. What it measures, exactly how it is calculated, how people read it and what it cannot tell you, with a chart of invented prices whose settings you can move. None of the pages says what to do.`}
      >
        <Link href="#indicators" className="btn btn-primary">
          The indicators
        </Link>
        <Link href="/chart-school/patterns" className="btn btn-ghost">
          Chart patterns
        </Link>
      </PageHero>

      <section id="indicators" className="section scroll-mt-[var(--header-h)]" aria-labelledby="indicators-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            01
          </p>
          <p className="eyebrow mt-8">The indicators</p>
          <h2 id="indicators-h" className="h2 mt-13 max-w-[24ch]">
            Eight sums, shown in full.
          </h2>
          <p className="lead mt-13 max-w-measure">Each page gives the formula step by step, works a small example by hand and then lets you change the settings on an invented chart to see the line respond.</p>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
            {LESSONS.map((l) => (
              <li key={l.slug}>
                <Link href={`/chart-school/${l.slug}`} className="gx-play-card group">
                  <IndicatorThumb kind={l.slug} />
                  <span className="label mt-13 block">{l.family}</span>
                  <span className="mt-5 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{l.name}</span>
                  <span className="mt-5 block text-sm text-ink-2">{l.card}</span>
                </Link>
              </li>
            ))}
          </ul>
          <DataNote status="simulation" className="mt-21">
            The small drawings are of one invented chart, not of any market. {educationalNote}
          </DataNote>
        </div>
      </section>

      <section id="patterns" className="section hairline bg-paper scroll-mt-[var(--header-h)]" aria-labelledby="patterns-h">
        <div className="wrap">
          <p className="gx-numeral" aria-hidden>
            02
          </p>
          <p className="eyebrow mt-8">Shapes, not sums</p>
          <h2 id="patterns-h" className="h2 mt-13 max-w-[24ch]">
            Patterns are read by eye.
          </h2>
          <p className="lead mt-13 max-w-measure">An indicator is calculated. A pattern is recognised: a shape that a price has drawn, with a name. Two places on this site explain them.</p>
          <ul className="mt-34 grid gap-13 md:grid-cols-2">
            {elsewhere.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="gx-play-card group flex flex-col justify-between gap-34 !p-34 max-sm:!p-21">
                  <span>
                    <span className="eyebrow block">{e.eyebrow}</span>
                    <span className="h3 mt-13 block max-w-[22ch] transition-colors duration-fast group-hover:text-accent">{e.title}</span>
                    <span className="mt-13 block max-w-[34rem] text-ink-2">{e.note}</span>
                  </span>
                  <span className="go" aria-hidden>
                    {e.go}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="common-h">
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="eyebrow">Before any of them</p>
            <h2 id="common-h" className="h3 mt-13">
              What every indicator has in common.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">
              The pages differ in their arithmetic and agree on these five points. They are the reason no page in this school says “buy” or “sell”. To see how easily a rule built on an indicator is flattered by one lucky stretch of prices, try the{" "}
              <Link href="/labs/rule-bench" className="link">
                Rule bench
              </Link>
              .
            </p>
          </div>
          <ol className="border-t border-line">
            {common.map((r, i) => (
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

      <section className="section-quiet hairline bg-paper" aria-labelledby="school-faq">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">Questions people ask</p>
            <h2 id="school-faq" className="h3 mt-13">
              About indicators in general.
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

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="arithmetic" />
      <NextSteps
        items={[
          { kind: "Chart school", label: "Chart patterns", href: "/chart-school/patterns", note: "Head and shoulders, triangles, flags, double tops." },
          { kind: "Playbook", label: "Candlestick patterns", href: "/playbook", note: "One page for each shape, and for each situation." },
          { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule from parts and test it on invented prices." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
        ]}
      />
    </>
  );
}
