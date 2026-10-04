import Link from "next/link";
import { ExamRoom } from "@/components/academy/exams/ExamRoom";
import { EXAM_LENGTH, examLevels } from "@/components/academy/exams/build";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * LEVEL EXAMS — one paper for each Academy level, made of the questions the
 * level's own lessons already ask (components/academy/exams/build.ts).
 *
 * The rule this page keeps: a pass is a record of questions answered here,
 * and is never called anything more. Nothing is stored or sent. On paper the
 * page is the certificate alone, so everything else is hidden from print.
 */
const PATH = "/academy/exams";
const TITLE = "Level exams";
const DESCRIPTION =
  "A short exam for each level of the GIO4X Academy, drawn from the lessons’ own questions and shuffled each time. One question at a time, with the reason and the lesson after each answer. A pass can be printed as a record of questions answered, which is not a qualification. Nothing is stored.";

export const metadata = pageMeta({ title: "Level exams: test each Academy level | Academy", description: DESCRIPTION, path: PATH });

const levels = examLevels();
const short = levels.filter((l) => l.asked < EXAM_LENGTH);

const faq = [
  {
    q: "Is the certificate a trading qualification?",
    a: "No. It is a record that a number of questions about the Academy’s lessons were answered correctly on this website on a given date. It is not a qualification, not a licence, and not evidence of an ability to trade. Nobody checks who sat the paper, and the result is not verified.",
  },
  {
    q: "Where do the exam questions come from?",
    a: "From the lessons themselves. Every Academy lesson ends with three questions written from its own text, and a level’s exam is drawn from the questions of that level’s lessons. The order is shuffled each time a paper is started.",
  },
  {
    q: "Is my score or my name saved anywhere?",
    a: "No. The answers, the score and any name typed for the certificate are held only in the open page and are gone when it is closed or reloaded. Nothing is stored in the browser and nothing is sent anywhere.",
  },
  {
    q: "Does passing an exam mean I am ready to trade?",
    a: "No. An exam shows that the words and mechanics of the lessons were understood on the day. It says nothing about how anyone behaves with money at risk. Most people who trade with leverage lose money, and knowing the vocabulary does not prevent it.",
  },
];

export default function ExamsPage() {
  return (
    <>
      <div className="print:hidden">
        <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
        <JsonLd data={faqSchema(faq)} />
        <PageHero
          quiet
          crumbs={[
            { name: "Academy", href: "/academy" },
            { name: TITLE, href: PATH },
          ]}
          eyebrow="Academy"
          title={TITLE}
          lead="One paper for each level, made of the questions its lessons already ask. One question at a time, the reason after each answer, and the lesson it came from beside it."
        >
          <a href="#exam" className="btn btn-primary">
            Choose a level
          </a>
        </PageHero>
      </div>

      <section id="exam" className="section scroll-mt-[var(--header-h)] print:p-0" aria-labelledby="exam-h">
        <div className="wrap">
          <div className="max-w-measure print:hidden">
            <p className="eyebrow">The exam room</p>
            <h2 id="exam-h" className="h2 mt-13">
              {levels.length === 1 ? "One level, one paper." : `${levels.length} levels, ${levels.length} papers.`}
            </h2>
            <p className="lead mt-13">
              A paper asks up to {EXAM_LENGTH} questions and is passed at ten of twelve. Check each answer to see the reason, then go on. At the end you are shown what was missed and which lesson teaches it.
            </p>
          </div>
          <div className="mt-34 max-w-measure print:mt-0">
            <ExamRoom levels={levels} />
          </div>
        </div>
      </section>

      <div className="print:hidden">
        <section className="section hairline bg-paper" aria-labelledby="papers-h">
          <div className="wrap">
            <p className="eyebrow">What each paper covers</p>
            <h2 id="papers-h" className="h2 mt-13 max-w-[22ch]">
              The lessons behind the questions.
            </h2>
            <div className="mt-21 overflow-x-auto">
              <table className="table-gx min-w-[38rem]">
                <caption className="sr-only">Each level exam: its lessons, the number of questions asked and the pass mark</caption>
                <thead>
                  <tr>
                    <th scope="col">Level</th>
                    <th scope="col">Lessons examined</th>
                    <th scope="col" className="num-right">
                      Questions
                    </th>
                    <th scope="col" className="num-right">
                      Pass mark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((l) => (
                    <tr key={l.level}>
                      <th scope="row" className="align-top font-medium text-ink">
                        {l.level}
                      </th>
                      <td>
                        <ul className="grid gap-5">
                          {l.lessons.map((x) => (
                            <li key={x.slug}>
                              <Link href={`/academy/${x.slug}`} className="link">
                                {x.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="num-right num align-top">{l.asked}</td>
                      <td className="num-right num align-top">
                        {l.pass} of {l.asked}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {short.length > 0 && (
              <p className="mt-13 max-w-measure text-sm text-ink-2">
                {short.map((l) => `${l.level} has ${l.pool.length} questions`).join(" and ")}, three for each lesson, so {short.length === 1 ? "that paper asks" : "those papers ask"} all of them rather than twelve. The pass mark keeps
                the same proportion, ten in twelve, rounded up.
              </p>
            )}
            <p className="mt-13 max-w-measure text-sm text-ink-3">
              A question asks what a lesson says, not what to do. Reading the lessons first is the intended order; the exam is a way to find what did not stay. {educationalNote}
            </p>
          </div>
        </section>

        <section className="section hairline" aria-labelledby="cert-h">
          <div className="wrap phi items-start">
            <div>
              <p className="eyebrow">The certificate</p>
              <h2 id="cert-h" className="h2 mt-13 max-w-[20ch]">
                What a pass is, and what it is not.
              </h2>
            </div>
            <div className="max-w-measure text-ink-2">
              <p>
                A pass offers a certificate to print. It states the level, the score, the date and, if you type one, a name. It is a record that these questions were answered on this website on that date.
              </p>
              <p className="mt-13">
                It is not a qualification, not a licence and not evidence of an ability to trade. Nobody checks who answered, whether the lessons were open in another tab, or how many attempts it took. Knowing how a stop order works is
                not the same as leaving one alone when a price is falling.
              </p>
              <p className="mt-13">
                The name is typed by you, is kept only in the open page, and is never stored or sent. Close the page and it is gone, with the score. The{" "}
                <Link href="/academy/practice#certificate" className="link">
                  practice room
                </Link>{" "}
                has a different certificate, for lessons completed on one device.
              </p>
            </div>
          </div>
        </section>

        <section className="section hairline bg-paper" aria-labelledby="faq-h">
          <div className="wrap">
            <p className="eyebrow">Questions people ask</p>
            <h2 id="faq-h" className="h2 mt-13">
              About the exams
            </h2>
            <dl className="mt-21 grid max-w-measure gap-21">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium text-ink">{f.q}</dt>
                  <dd className="mt-5 text-ink-2">{f.a}</dd>
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

        <PunchLine k="academy" />

        <NextSteps
          items={[
            { kind: "Academy", label: "All lessons", href: "/academy", note: "The course, by level and by learning path." },
            { kind: "Academy", label: "Practice room", href: "/academy/practice", note: "Build an order, fix a ticket, race the glossary." },
            { kind: "Reference", label: "The glossary", href: "/glossary", note: "Every term the lessons use, defined." },
            { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
          ]}
        />
      </div>
    </>
  );
}
