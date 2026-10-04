import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { getLesson } from "@/data/academy";
import { getTerm } from "@/data/glossary";
import { STYLE_KEYS, styles, typeQuestions, type StyleKey } from "@/data/trader-type";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";
import { StyleCard, type StyleLinks } from "./StyleCard";
import { TypeQuiz } from "./TypeQuiz";

/**
 * WHAT KIND OF TRADER ARE YOU? — ten questions about how a person likes to
 * work, read against five styles of working (data/trader-type.ts).
 *
 * The rule this page keeps: the result describes preferences. It is not an
 * assessment of suitability or ability and it is not advice, and the page says
 * that most people who trade with leverage lose money. Every style is set out
 * with what it demands, what it costs and where it goes wrong, and all five
 * are in the HTML whether or not the quiz is taken. Nothing is stored.
 */
const PATH = "/academy/trader-type";
const TITLE = "What kind of trader are you?";
const DESCRIPTION =
  "Ten questions about how you like to work: screen time, open positions overnight, how you take a loss, how long you can wait. The result describes a style, from scalper to investor, with what it demands, what it costs and where it goes wrong. A description of preferences, not advice. Nothing is stored.";

export const metadata = pageMeta({ title: "What kind of trader are you? Trading styles quiz | Academy", description: DESCRIPTION, path: PATH });

// only lessons and terms that exist are linked
const links = Object.fromEntries(
  STYLE_KEYS.map((k) => {
    const s = styles[k];
    const term = s.term ? getTerm(s.term) : undefined;
    const found: StyleLinks = {
      lessons: s.lessons.flatMap((slug) => {
        const l = getLesson(slug);
        return l ? [{ slug: l.slug, title: l.title }] : [];
      }),
      ...(term ? { term: { slug: term.slug, term: term.term } } : {}),
    };
    return [k, found];
  }),
) as Record<StyleKey, StyleLinks>;

const faq = [
  {
    q: "What are the main styles of trading?",
    a: "They are usually told apart by how long a position is held. A scalper holds for seconds or minutes, a day trader closes everything within the day, a swing trader holds for days or a few weeks, and a position trader for weeks or months. An investor buys to own for years and is not really trading at all.",
  },
  {
    q: "Does the result tell me which style I should use?",
    a: "No. It describes the preferences given in ten answers and names the style they lean towards. It is not an assessment of whether trading is suitable for you, it does not measure ability, and it is not advice.",
  },
  {
    q: "Is one trading style more profitable than the others?",
    a: "No style is presented here as profitable. Each has its own costs and its own usual mistakes: frequent trading pays the spread many times, and holding for longer pays overnight financing and is exposed to gaps. Most people who trade with leverage lose money, whatever their style.",
  },
  {
    q: "Are my answers saved?",
    a: "No. The answers are held only in the open page, to draw the dial and name the result. Nothing is stored in the browser and nothing is sent anywhere. Reload the page and they are gone.",
  },
];

export default function TraderTypePage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Trader type", href: PATH },
        ]}
        eyebrow="Academy"
        title={TITLE}
        lead={`${typeQuestions.length} questions about how you like to work, not about what you know. The answers fill a dial with five spokes, and the result describes the style of working they lean towards.`}
      >
        <a href="#quiz" className="btn btn-primary">
          Start the questions
        </a>
      </PageHero>

      <section className="section-quiet" aria-label="What this is">
        <div className="wrap">
          <p className="max-w-measure border-l-2 border-accent pl-13 text-sm text-ink-2">
            This is a description of preferences. It is not an assessment of suitability or of ability, and it is not advice. Most people who trade with leverage lose money, whatever their style, and one honest result of these questions
            is “investor, not trader”. {educationalNote}
          </p>
        </div>
      </section>

      <section id="quiz" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="quiz-h">
        <div className="wrap">
          <div className="max-w-[44rem]">
            <p className="eyebrow">The style dial</p>
            <h2 id="quiz-h" className="h2 mt-13">
              Ten answers, five spokes.
            </h2>
            <p className="lead mt-13">Choose the answer nearest to you. There is no right one, and you can go back. The dial moves with each answer.</p>
          </div>
          <div className="mt-34">
            <TypeQuiz links={links} />
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="styles-h">
        <div className="wrap">
          <div className="max-w-[44rem]">
            <p className="eyebrow">The five styles</p>
            <h2 id="styles-h" className="h2 mt-13">
              Told apart by how long a position is held.
            </h2>
            <p className="lead mt-13">
              The names are ordinary ones and the boundaries between them are loose. What changes from one to the next is the time a position stays open, and with it the attention needed and the cost that weighs most.
            </p>
          </div>

          <div className="mt-21 overflow-x-auto">
            <table className="table-gx min-w-[44rem]">
              <caption className="sr-only">The five styles of working compared: holding time, attention and main cost</caption>
              <thead>
                <tr>
                  <th scope="col">Style</th>
                  <th scope="col">A position is held for</th>
                  <th scope="col">Attention it asks for</th>
                  <th scope="col">The cost that weighs most</th>
                </tr>
              </thead>
              <tbody>
                {STYLE_KEYS.map((k) => (
                  <tr key={k}>
                    <th scope="row" className="font-medium text-ink">
                      <a href={`#style-${k}`} className="link">
                        {styles[k].name}
                      </a>
                    </th>
                    <td>{styles[k].holds}</td>
                    <td>{styles[k].screen}</td>
                    <td>{styles[k].cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-xs text-ink-3">Holding times are the usual meanings of the words, given as ranges. They are not rules, and no figure here is a statistic.</p>

          <div className="mt-34 grid gap-34">
            {STYLE_KEYS.map((k) => (
              <article key={k} id={`style-${k}`} className="scroll-mt-[var(--header-h)] border-t border-line pt-21">
                <StyleCard style={styles[k]} links={links[k]} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="limits-h">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">What the quiz cannot tell you</p>
            <h2 id="limits-h" className="h2 mt-13 max-w-[20ch]">
              A preference is not an ability.
            </h2>
          </div>
          <div className="max-w-measure text-ink-2">
            <p>
              The questions ask what you would like and how you think you would react. People are often wrong about the second. Saying you would stop for the day after a loss is easy; doing it with money gone is a different matter.
            </p>
            <p className="mt-13">
              A style also has to fit a life: the hours free, the money that can be lost without harm, the other calls on attention. The quiz knows none of that. It cannot say whether trading suits you, and it does not try.
            </p>
            <p className="mt-13">
              Whatever the style, leverage enlarges losses as much as gains, and most people who trade with leverage lose money. A style changes how the costs arrive. It does not remove them.
            </p>
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="faq-h">
        <div className="wrap">
          <p className="eyebrow">Questions people ask</p>
          <h2 id="faq-h" className="h2 mt-13">
            About trading styles
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

      <PunchLine k="plan" />

      <NextSteps
        items={[
          { kind: "Academy", label: "All lessons", href: "/academy", note: "The course, by level and by learning path." },
          { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Four games about the person in front of the screen." },
          { kind: "Tools", label: "Position size", href: "/tools/position-size", note: "The size that makes a stop cost what you chose." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
        ]}
      />
    </>
  );
}
