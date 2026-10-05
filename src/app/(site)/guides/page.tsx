import Link from "next/link";
import { DayDial } from "@/components/guides/DayDial";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { GUIDES } from "@/data/guides";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The region guides, listed. Each guide lays the trading day on the clocks of
 * one part of the world. This page holds no hour of its own: the dial reads
 * lib/sessions and the visitor's clock, and shows an empty face until it has.
 */

const DESCRIPTION =
  "Forex market hours by region: when the Sydney, Tokyo, London and New York sessions and the main exchanges are open in your local time, which hours overlap, how daylight saving moves them and the kinds of day markets close. Eight guides, from Asia-Pacific to Latin America.";

export const metadata = pageMeta({ title: "Forex market hours by region: eight local-time guides", description: DESCRIPTION, path: "/guides" });

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/guides", name: "Region guides", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Markets", href: "/markets" },
          { name: "Guides", href: "/guides" },
        ]}
        eyebrow="Guides · by region"
        title="The trading day, where you are."
        lead={`${GUIDES.length} guides, one for each part of the world. Each shows when the four FX sessions and the main exchanges are open on local clocks, which hours overlap, why the times move twice a year and what kinds of day markets close.`}
      />

      <section className="section" aria-labelledby="regions-h">
        <div className="wrap">
          <p className="eyebrow">Choose a region</p>
          <h2 id="regions-h" className="h2 mt-13 max-w-[24ch]">
            Eight clocks to read the market by.
          </h2>
          <ul className="mt-34 grid gap-13 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="panel group flex h-full min-h-[11rem] flex-col justify-between gap-21 p-21 transition-colors duration-fast hover:border-accent">
                  <span>
                    <span className="label">{g.zones.map((z) => z.city).join(" · ")}</span>
                    <span className="mt-8 block font-display text-xl text-ink transition-colors duration-fast group-hover:text-accent">{g.name}</span>
                    <span className="mt-5 block text-sm text-ink-2">{g.lead.split(/(?<=\.)\s/)[0]}</span>
                  </span>
                  <span className="go" aria-hidden>
                    Open
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="dial" className="section hairline bg-paper scroll-mt-[var(--header-h)]" aria-labelledby="dial-h">
        <div className="wrap">
          <p className="eyebrow">Today</p>
          <h2 id="dial-h" className="h2 mt-13 max-w-[24ch]">
            The day on a dial.
          </h2>
          <p className="lead mt-13 max-w-measure">One turn is one day. The rings are the four FX windows, the thin arcs are the exchanges, and the hand is the present moment, read from your device. Set it to UTC or to your own clock.</p>
          <div className="mt-34">
            <DayDial zones={[{ tz: "UTC", city: "UTC" }]} />
          </div>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="how-h">
        <div className="wrap">
          <p className="eyebrow">What a guide holds</p>
          <h2 id="how-h" className="h2 mt-13 max-w-[24ch]">
            A timetable, and its small print.
          </h2>
          <div className="mt-21 grid max-w-measure gap-13 text-ink-2">
            <p>The “sessions” of the foreign-exchange market are conventions: the business days of Sydney, Tokyo, London and New York, laid end to end. Between them they cover almost the whole of a weekday. The stock exchanges are different: each is a venue with published hours.</p>
            <p>Every time on these pages is worked out from the same timetable as this site’s clocks, for one or two named reference cities in the region and, on the dial, for your own time zone. The tables show two days, one in January and one in July, because the hours move when the clocks change.</p>
            <p>Each guide ends with a list of questions about tax to take to a qualified adviser or your tax authority. The guides give no tax or legal advice and state no rule for any country.</p>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <PunchLine k="markets" />
      <NextSteps
        items={[
          { kind: "Markets", label: "Market clock", href: "/markets/clock", note: "The nine centres, right now." },
          { kind: "To print", label: "Downloads", href: "/downloads", note: "A session-times card, and seven other sheets." },
          { kind: "Academy", label: "All lessons", href: "/academy", note: "The course, by level and by learning path." },
          { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term on these pages." },
        ]}
      />
    </>
  );
}
