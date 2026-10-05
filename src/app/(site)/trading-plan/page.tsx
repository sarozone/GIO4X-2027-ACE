import Link from "next/link";
import { PlanBuilder } from "@/components/plan/PlanBuilder";
import { LIMITS, PLAN_KEYS, PLAN_SECTIONS } from "@/components/plan/record";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * THE TRADING PLAN BUILDER (/trading-plan): questions to answer in your own
 * words, and the answers set out as a plan to print.
 *
 * It sits beside the Trading journal (/journal) and is built the same way:
 * words first (where the plan is kept is said before the form), then one
 * client component (components/plan/PlanBuilder.tsx), then what the page is
 * and is not.
 *
 * The rules it keeps: the plan is stored under one localStorage key and is
 * sent nowhere; the page asks questions and records answers, with no default,
 * no example answer and no suggested figure in any field; nothing here is
 * advice. On paper only the written plan prints.
 */

const PATH = "/trading-plan";
const TITLE = "Trading plan builder";
const DESCRIPTION =
  "Write a trading plan in your own words: markets and times, risk per trade, a daily stop, entry and exit rules, routine and review. The page asks the questions, keeps your answers in your browser only, and sets them out to print or save as a PDF. Nothing is sent anywhere, and nothing is advice.";

export const metadata = pageMeta({ title: "Trading plan builder: write your own plan, kept in your browser", description: DESCRIPTION, path: PATH });

/** The sections that hold the plan itself (the first holds only its name and date). */
const SECTIONS = PLAN_SECTIONS.filter((s) => s.key !== "about");

const kept = [
  { t: "It stays in this browser.", d: "The answers are written to this browser’s own storage, on this device, under one entry, as you type. A different browser, a different device or a private window will not have them." },
  { t: "It is sent nowhere.", d: "No answer on this page is sent to GIO4X or to anyone else. There is no account behind it and no copy on a server, so nobody at GIO4X can read your plan and nobody can restore it for you." },
  { t: "The file is the backup.", d: "Export makes a JSON file on your device that this page can read back, here or in another browser. Import reads such a file inside your browser; it is not uploaded." },
  { t: "Clearing deletes it.", d: "“Clear the plan” removes every answer. So does clearing this site’s data, and so does the reset on the preferences page." },
];

const limits = [
  { t: "It asks; it does not answer.", d: "Every field starts empty. There is no suggested risk, no example rule and no default, because a plan copied from a page is not a plan. What goes in each answer is for the person writing it to decide." },
  { t: "It does not check the answers.", d: "The page does not read what you write, compare it with anything or say whether a rule is sound. An answer is stored and printed exactly as typed." },
  { t: "A plan is not a result.", d: "Writing rules down makes it possible to see later whether they were followed. It does not make a method profitable, and most of what a plan governs is the size of a loss, not the size of a gain." },
  { t: "It is not advice.", d: "Nothing on this page says what to trade, when, or how much. The arithmetic behind a figure you might write here is on the tools, which show their working and suggest nothing either." },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: TITLE, href: PATH },
        ]}
        eyebrow="Private · kept in your browser"
        title={TITLE}
        lead={`${PLAN_KEYS.length} questions in ${PLAN_SECTIONS.length} parts, answered in your own words, and set out beneath them as a plan you can print. The page asks and records. It does not suggest an answer, and it does not read yours.`}
      >
        <a href="#plan" className="btn btn-primary print:hidden">
          Start writing
        </a>
        <Link href="/journal" className="btn btn-ghost print:hidden">
          Trading journal
        </Link>
      </PageHero>

      <section className="section-quiet print:hidden" aria-labelledby="plan-kept">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Before you write anything</p>
            <h2 id="plan-kept" className="h3 mt-13">
              Where the plan is kept.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">Read this first. It is the whole of what happens to what you type here.</p>
            <div className="mt-21 grid gap-8">
              <DataNote status="reference">Your own answers, kept in this browser. {educationalNote}</DataNote>
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

      <section id="plan" className="section hairline scroll-mt-[var(--header-h)] bg-paper print:py-0" aria-labelledby="plan-h">
        <div className="wrap">
          <div className="max-w-measure print:hidden">
            <p className="eyebrow">The plan</p>
            <h2 id="plan-h" className="h2 mt-13">
              Your rules, in your words.
            </h2>
            <p className="lead mt-13">
              {SECTIONS.map((s) => s.title.toLowerCase()).join(", ")}. Answer what you can and leave the rest: an unanswered question prints as unanswered. An answer can run to {LIMITS.text.toLocaleString("en-GB")} characters.
            </p>
          </div>
          <div className="mt-34 min-w-0 print:mt-0">
            <PlanBuilder />
          </div>
        </div>
      </section>

      <section className="section-quiet hairline print:hidden" aria-labelledby="plan-limits">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">What it is, and is not</p>
            <h2 id="plan-limits" className="h3 mt-13">
              A form, not a method.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">
              People write a plan so that a decision made calmly is there to read when things are not calm. This page only holds the paper. For the arithmetic behind a figure, the{" "}
              <Link href="/tools/position-size" className="link">
                Position Size
              </Link>{" "}
              and{" "}
              <Link href="/tools/risk-of-ruin" className="link">
                Risk of Ruin
              </Link>{" "}
              tools show their working; to see afterwards whether the plan was followed, the{" "}
              <Link href="/journal" className="link">
                Trading journal
              </Link>{" "}
              asks that of every trade.
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

      <section className="section-quiet hairline print:hidden" aria-label="Risk warning">
        <div className="wrap">
          <p className="text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>

      <div className="print:hidden">
        <NextSteps
          items={[
            { kind: "Journal", label: "Trading journal", href: "/journal", note: "Write each trade down, and whether it followed the plan." },
            { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "The size of a trade from the stop and the amount at risk." },
            { kind: "Tool", label: "Risk of Ruin", href: "/tools/risk-of-ruin", note: "What a share risked per trade does to the chance of a deep loss, approximately." },
            { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
          ]}
        />
      </div>
    </>
  );
}
