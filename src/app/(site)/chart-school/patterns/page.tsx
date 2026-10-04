import Link from "next/link";
import { PatternThumb } from "@/components/chart-patterns/PatternThumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { CHART_PATTERNS, PATTERN_GROUPS } from "@/data/chart-patterns";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The chart pattern library: the index. Every shape, grouped by how textbooks
 * class it, each with a small still drawing. The drawings are invented, a
 * pattern is a description and not a forecast, and the page says both.
 */
const PATH = "/chart-school/patterns";
const DESCRIPTION =
  "Chart patterns explained, one page each: head and shoulders, double top and double bottom, triangles, flags, pennants, wedges, cup and handle, the rectangle and the rounding bottom. What each shape is, how to recognise it, what it is taken to mean and where people go wrong. Explanations, not advice.";

export const metadata = pageMeta({ title: "Chart patterns: the classic shapes, explained one by one", description: DESCRIPTION, path: PATH });

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: "Chart patterns", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Chart School", href: "/chart-school" },
          { name: "Chart patterns", href: PATH },
        ]}
        eyebrow="Chart School · the pattern library"
        title="Chart patterns"
        lead={`${CHART_PATTERNS.length} classic shapes, one page each. Every page draws the shape, then its outline, and says what it is, how it is recognised, what it is taken to mean and where people go wrong. None of them says what to do.`}
      />

      <section className="section-quiet hairline" aria-labelledby="cp-before">
        <div className="wrap">
          <p id="cp-before" className="eyebrow">
            Before the shapes
          </p>
          <ul className="mt-21 grid gap-21 md:grid-cols-3">
            <li>
              <p className="h4">A description, not a forecast</p>
              <p className="mt-8 text-sm text-ink-2">A pattern is a name for what a price did. It records where a move stopped, paused or narrowed. It does not say what the price will do next.</p>
            </li>
            <li>
              <p className="h4">Textbook shapes are rare</p>
              <p className="mt-8 text-sm text-ink-2">Real charts are ambiguous. The same candles can be drawn as two different shapes, and the neat examples in books were picked out afterwards.</p>
            </li>
            <li>
              <p className="h4">Every picture is invented</p>
              <p className="mt-8 text-sm text-ink-2">The lines on these pages were drawn by hand to show a shape as clearly as possible. None of them is a market, a price or a record of anything.</p>
            </li>
          </ul>
        </div>
      </section>

      {PATTERN_GROUPS.map((g, gi) => {
        const items = CHART_PATTERNS.filter((p) => p.group === g.group);
        return (
          <section key={g.id} id={g.id} className={`section scroll-mt-[var(--header-h)] ${gi % 2 ? "hairline bg-paper" : "hairline"}`} aria-labelledby={`${g.id}-h`}>
            <div className="wrap">
              <p className="gx-numeral" aria-hidden>
                {String(gi + 1).padStart(2, "0")}
              </p>
              <p className="eyebrow mt-8">{g.eyebrow}</p>
              <h2 id={`${g.id}-h`} className="h2 mt-13 max-w-[24ch]">
                {g.title}
              </h2>
              <p className="lead mt-13 max-w-measure">{g.lead}</p>
              <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`${PATH}/${p.slug}`} className="gx-play-card group">
                      <PatternThumb pattern={p} />
                      <span className="mt-13 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{p.name}</span>
                      <span className="mt-5 block text-sm text-ink-2">{p.is.split(/(?<=\.)\s/)[0]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-2">The groups follow the usual textbook classes. A class is a habit of naming, not a rule the market keeps: shapes classed as continuations turn, and shapes classed as reversals fail.</p>
          <p className="mt-13 text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="scale" />
      <NextSteps
        items={[
          { kind: "Chart School", label: "Chart School", href: "/chart-school", note: "How a chart is built and read." },
          { kind: "Academy", label: "The Playbook", href: "/playbook", note: "Candlestick patterns and common situations." },
          { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "How readily chance draws a convincing shape." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
        ]}
      />
    </>
  );
}
