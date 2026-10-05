import Link from "next/link";
import { examLevels } from "@/components/academy/exams/build";
import { QuestionOfTheDay, type DayQuestion } from "@/components/academy/qotd/QuestionOfTheDay";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote } from "@/config/legal";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * QUESTION OF THE DAY (/academy/question-of-the-day): one of the Academy's
 * own lesson questions each calendar day.
 *
 * Nothing is written here and nothing is copied: the pool is the level exams'
 * pool (components/academy/exams/build.ts), which is every lesson's own three
 * questions with their answers and reasons, so a question that changes in a
 * lesson changes here. The day's question is chosen from the date alone
 * (components/academy/qotd/pick.ts), in the visitor's browser.
 *
 * The rules it keeps: a run of days is kept in this browser only, under one
 * key; there is no account, no leaderboard and nothing sent; a run is called
 * a run of days, never a score, a rank or evidence of anything.
 */
const PATH = "/academy/question-of-the-day";
const TITLE = "Question of the day";
const DESCRIPTION =
  "One question a day from the GIO4X Academy’s own lessons, the same for everyone, with the answer and the reason once you have chosen. A run of days is kept in your browser only: no account, no leaderboard, nothing sent.";

export const metadata = pageMeta({ title: "Question of the day | Academy", description: DESCRIPTION, path: PATH });

/** Every question the lessons ask, in level and lesson order: the exams' own pool. */
const pool: DayQuestion[] = examLevels().flatMap((l) => l.pool.map((q) => ({ ...q, level: l.level })));
const lessonCount = new Set(pool.map((q) => q.slug)).size;

const rules = [
  { t: "One question, chosen by the date.", d: `There are ${pool.length} questions, three from each of ${lessonCount} lessons. The date picks one, in the same way for every visitor, and the day is counted in UTC, so the question changes at midnight UTC wherever you are. Every question comes round once before any is repeated.` },
  { t: "One try, then the reason.", d: "Choose an answer and press Check. The page marks the right one and gives the reason, in the words the lesson’s own question carries, with a link to the lesson it came from." },
  { t: "A run of days, in this browser only.", d: "A day counts when you answer, right or wrong. Answer on the next day and the run grows by one; miss a whole day and it starts again. The run, its longest length and today’s answer are kept under one entry in this browser’s storage, and “Start over” removes them." },
  { t: "No account, no leaderboard.", d: "Nothing about your answers is sent to GIO4X or to anyone else, so there is nobody to compare with and nothing to compete for. A run shows that a question was opened on consecutive days. It is not a score, and it is not evidence of an ability to trade." },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: TITLE, href: PATH },
        ]}
        eyebrow="Academy"
        title={TITLE}
        lead="One question from the Academy’s lessons each day, the same for everyone. Choose an answer, read the reason, and come back tomorrow for the next."
      >
        <a href="#today" className="btn btn-primary">
          Today’s question
        </a>
        <Link href="/academy" className="btn btn-ghost">
          The Academy
        </Link>
      </PageHero>

      <section id="today" className="section scroll-mt-[var(--header-h)]" aria-labelledby="today-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Today</p>
            <h2 id="today-h" className="h2 mt-13">
              Today’s question.
            </h2>
            <p className="mt-13 max-w-narrow text-ink-2">
              It asks what a lesson says, not what to do. If the subject is new, the{" "}
              <Link href="/academy#curriculum" className="link">
                curriculum
              </Link>{" "}
              lists the lessons in order.
            </p>
            <div className="mt-21 grid gap-8">
              <DataNote status="reference">A question from the Academy’s own lessons. {educationalNote}</DataNote>
            </div>
          </div>
          <div className="min-w-0">
            <QuestionOfTheDay pool={pool} />
          </div>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="qotd-rules">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="qotd-rules" className="h3 mt-13">
              A habit, not a contest.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">
              For a whole level at one sitting there are the{" "}
              <Link href="/academy/exams" className="link">
                level exams
              </Link>
              , which draw on the same questions. What this browser holds, and the button that clears it, is on the{" "}
              <Link href="/preferences" className="link">
                preferences
              </Link>{" "}
              page.
            </p>
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

      <NextSteps
        items={[
          { kind: "Academy", label: "The curriculum", href: "/academy#curriculum", note: "Every lesson, level by level." },
          { kind: "Academy", label: "Level exams", href: "/academy/exams", note: "A short exam for each level, from the same questions." },
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Each term with a question to check yourself." },
          { kind: "This browser", label: "My desk", href: "/desk", note: "Your run, your saved pages and your progress on one page." },
        ]}
      />
    </>
  );
}
