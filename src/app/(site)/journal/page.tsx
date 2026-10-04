import Link from "next/link";
import { Journal } from "@/components/journal/Journal";
import { LIMITS } from "@/components/journal/record";
import { MIN_GROUP, MIN_TRADES } from "@/components/journal/stats";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * THE TRADING JOURNAL (/journal): a private journal kept in the visitor's own
 * browser.
 *
 * The page is words first: where the journal is kept is said before the form,
 * and what a journal can and cannot show is said after it. The journal itself
 * is one client component (components/journal/Journal.tsx).
 *
 * The rules it keeps: the journal is stored under one localStorage key and is
 * sent nowhere; every figure is arithmetic on the visitor's own entries, with
 * its definition beside it; nothing here is advice, and a record of past
 * trades says nothing about future ones. On paper only the journal prints.
 */

const PATH = "/journal";
const TITLE = "Trading journal";
const DESCRIPTION =
  "A free, private trading journal that stays in your browser. Write down each trade, your plan and your mood; see your win rate, expectancy, profit factor and an equity curve; export to CSV or print to PDF. Nothing is sent anywhere.";

export const metadata = pageMeta({ title: "Trading journal: a private trade log kept in your browser", description: DESCRIPTION, path: PATH });

const kept = [
  { t: "It stays in this browser.", d: "The journal is written to this browser’s own storage, on this device, under one entry. A different browser, a different device or a private window will not have it." },
  { t: "It is sent nowhere.", d: "No trade, note or figure on this page is sent to GIO4X or to anyone else. There is no account behind it and no copy on a server, so nobody can restore it for you." },
  { t: "Clearing site data deletes it.", d: "If you clear this site’s data, or your browser clears it for you, the journal goes with it. So does “Delete everything” at the foot of the journal." },
  { t: "The CSV export is the backup.", d: "Export makes a file on your device that this page can read back. It is the only copy outside this browser, and it is yours to keep safe." },
];

const limits = [
  { t: "It records what you typed.", d: "The result of a trade is the figure you enter from your own statement. The page does not check it against the prices, and it cannot: it does not know a contract size, a commission or a swap." },
  { t: "The figures describe the past.", d: "A share that gained, an expectancy, a profit factor: each is arithmetic on trades that are over. None of them is a property of the next trade, and past results say nothing about future ones." },
  { t: "Small numbers mislead.", d: `Figures for the whole journal appear from ${MIN_TRADES} trades and for a group from ${MIN_GROUP}, and even then a handful of trades can look like a pattern by chance. A difference between two moods or two weekdays is a question to look into, not a finding.` },
  { t: "It is not advice.", d: "The page does not say what to trade, when, or how much, and it does not judge a trade. What the entries mean is for the person who wrote them to work out." },
];

const faq = [
  {
    q: "Where is my trading journal stored?",
    a: "In this browser’s own storage on this device, and nowhere else. Nothing is sent to GIO4X or to any server, so the journal is not available in another browser or on another device unless you export it as a CSV file and import that file there.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "The journal is deleted with the rest of this site’s data, and nobody can restore it, because no copy exists outside your browser. The CSV export is the backup: keep an exported file somewhere safe and import it again if the journal is lost.",
  },
  {
    q: "What is expectancy in a trading journal?",
    a: "Expectancy per trade is the sum of every result divided by the number of trades: what one of the recorded trades came to on average. It describes the trades already written down. It does not say what the next trade will do.",
  },
  {
    q: "What is a profit factor?",
    a: "The sum of the gaining trades divided by the sum of the losing trades. Above 1, the gains so far were larger than the losses; below 1, the losses were larger. It is a summary of past trades and says nothing certain about future ones.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        quiet
        crumbs={[{ name: TITLE, href: PATH }]}
        eyebrow="Private · kept in your browser"
        title={TITLE}
        lead="Write each trade down: what the plan was, what happened, and how you felt. The page keeps the list in this browser, works out the figures from it and draws the running total. A journal records what happened. It does not say what will."
      />

      <section className="section-quiet print:hidden" aria-labelledby="journal-kept">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Before you write anything</p>
            <h2 id="journal-kept" className="h3 mt-13">
              Where the journal is kept.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">Read this first. It is the whole of what happens to what you type here.</p>
            <div className="mt-21 grid gap-8">
              <DataNote status="reference">Your own entries, kept in this browser. {educationalNote}</DataNote>
            </div>
          </div>
          <ol className="border-t border-line">
            {kept.map((r, i) => (
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

      <section id="journal" className="section hairline scroll-mt-[var(--header-h)] bg-paper print:py-0" aria-labelledby="journal-h">
        <div className="wrap">
          <div className="max-w-measure print:hidden">
            <p className="eyebrow">The journal</p>
            <h2 id="journal-h" className="h2 mt-13">
              A trade, written down.
            </h2>
            <p className="lead mt-13">
              One entry for each trade that is over. The journal holds up to {LIMITS.trades}. Every figure below is worked out from your entries, and each has its definition beside it.
            </p>
          </div>
          <div className="mt-34 min-w-0 print:mt-0">
            <Journal />
          </div>
        </div>
      </section>

      <section className="section-quiet hairline print:hidden" aria-labelledby="journal-limits">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">What it is, and is not</p>
            <h2 id="journal-limits" className="h3 mt-13">
              A record, not a forecast.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">
              People keep a journal to see what they did, set beside what they had meant to do. That is all this one shows. The arithmetic behind a trade’s size is on the{" "}
              <Link href="/tools/position-size" className="link">
                Position Size
              </Link>{" "}
              tool, and the{" "}
              <Link href="/labs/rule-bench" className="link">
                Rule bench
              </Link>{" "}
              shows how easily one good run misleads.
            </p>
          </div>
          <ul className="border-t border-line">
            {limits.map((r) => (
              <li key={r.t} className="border-b border-line py-21">
                <h3 className="h4">{r.t}</h3>
                <p className="mt-8 max-w-measure text-ink-2">{r.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper print:hidden" aria-labelledby="journal-faq">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Questions people ask</p>
            <h2 id="journal-faq" className="h3 mt-13">
              About the journal.
            </h2>
          </div>
          <dl className="grid gap-21 border-t border-line pt-21">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-5 max-w-measure text-ink-2">{f.a}</dd>
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

      <div className="print:hidden">
        <PunchLine k="plan" />
        <NextSteps
          items={[
            { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "The size of a trade from the stop and the amount at risk." },
            { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Test a rule on invented prices, and see how one result misleads." },
            { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Tell coin flips from a real tilt. It is harder than it sounds." },
            { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
          ]}
        />
      </div>
    </>
  );
}
