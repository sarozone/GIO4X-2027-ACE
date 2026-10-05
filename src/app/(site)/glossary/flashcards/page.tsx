import Link from "next/link";
import { Flashcards, type FlashTerm } from "@/components/glossary/flashcards/Flashcards";
import { INTERVALS, NEW_PER_ROUND, ROUND } from "@/components/glossary/flashcards/leitner";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote } from "@/config/legal";
import { glossary, glossaryTopics } from "@/data/glossary";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * GLOSSARY FLASHCARDS (/glossary/flashcards): the glossary's own terms as
 * cards, with a simple spaced-repetition schedule.
 *
 * Nothing is written here and nothing is copied: a card is a glossary entry
 * (src/data/glossary.ts), its term on the front and its definition, formula
 * and example on the back, so an entry that changes in the glossary changes
 * here. The schedule is five Leitner boxes
 * (components/glossary/flashcards/leitner.ts), worked out in the visitor's
 * browser.
 *
 * The rules it keeps: which box a card is in is kept in this browser only,
 * under one key; there is no account and nothing is sent; a round is a way to
 * remember words, never a score, a rank or evidence of anything.
 */
const PATH = "/glossary/flashcards";
const TITLE = "Glossary flashcards";
const DESCRIPTION = `The ${glossary.length} terms of the GIO4X Financial Glossary as flashcards: the term on the front, the definition on the back, and a simple spaced-repetition schedule kept in your browser only. No account, no score, nothing sent.`;

export const metadata = pageMeta({ title: "Glossary flashcards | Glossary", description: DESCRIPTION, path: PATH });

const terms: FlashTerm[] = glossary.map((t) => ({ slug: t.slug, term: t.term, topic: t.topic, definition: t.definition, ...(t.formula ? { formula: t.formula } : {}), ...(t.example ? { example: t.example } : {}) }));

const rules = [
  { t: "A card is a glossary entry.", d: `There are ${glossary.length} cards, one for each term. The front is the term; the back is the glossary’s own definition, with the formula and the worked example where the entry has them, and a link to the entry.` },
  { t: "Five boxes decide when a card returns.", d: `“Knew it” moves a card up one box; “Did not know” sends it back to box one. A card comes back ${INTERVALS.map((d) => (d === 1 ? "1 day" : `${d} days`)).join(", ").replace(/, ([^,]*)$/, " or $1")} after it was graded, by box, so the words you know are shown less and less often.` },
  { t: "A round is short.", d: `At most ${ROUND} cards: the ones due today first, the longest overdue at the front, then up to ${NEW_PER_ROUND} cards you have not seen. Choose one topic or all of them. Space turns a card and the arrow keys grade it; every key has a button.` },
  { t: "In this browser only.", d: "Which box each card is in, and the day it is next due, are kept under one entry in this browser’s storage. Nothing is sent to GIO4X or to anyone else, and “Start over” removes it. Knowing a definition is not a score and it is not evidence of an ability to trade." },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <PageHero
        quiet
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Glossary", href: "/glossary" },
          { name: "Flashcards", href: PATH },
        ]}
        eyebrow="Glossary"
        title={TITLE}
        lead={`The glossary’s ${glossary.length} terms as cards: say what the term means, turn the card, and say whether you knew it. A card you knew comes back later; one you did not comes back tomorrow.`}
      >
        <a href="#cards" className="btn btn-primary">
          Today’s cards
        </a>
        <Link href="/glossary" className="btn btn-ghost">
          The glossary
        </Link>
      </PageHero>

      <section id="cards" className="section scroll-mt-[var(--header-h)]" aria-labelledby="cards-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Today</p>
            <h2 id="cards-h" className="h2 mt-13">
              Today’s cards.
            </h2>
            <p className="mt-13 max-w-narrow text-ink-2">
              A card asks what a word means, not what to do. For the idea behind a word, each entry in the{" "}
              <Link href="/glossary" className="link">
                glossary
              </Link>{" "}
              opens as a short lesson.
            </p>
            <div className="mt-21 grid gap-8">
              <DataNote status="reference">Definitions from the GIO4X Financial Glossary. {educationalNote}</DataNote>
            </div>
          </div>
          <div className="min-w-0">
            <Flashcards terms={terms} topics={glossaryTopics} />
          </div>
        </div>
      </section>

      <section className="section-quiet hairline bg-paper" aria-labelledby="cards-rules">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="cards-rules" className="h3 mt-13">
              A little, often.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">
              What this browser holds, and the button that clears it, is on the{" "}
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
          { kind: "Reference", label: "Glossary", href: "/glossary", note: "Every term, with a question to check yourself." },
          { kind: "Academy", label: "Question of the day", href: "/academy/question-of-the-day", note: "One question a day from the lessons." },
          { kind: "Academy", label: "The curriculum", href: "/academy#curriculum", note: "The same ideas, taught in order." },
          { kind: "This browser", label: "My desk", href: "/desk", note: "The cards due today, beside your other progress." },
        ]}
      />
    </>
  );
}
