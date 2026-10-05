import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { getLesson } from "@/data/academy";
import { journey } from "@/data/journey";
import { getPrimer } from "@/data/primers";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * START HERE — one beginner's roadmap across the whole site: who the site is
 * for, then six stages in order, each a short run of pages that already
 * exist. It is an order to read and practise in. It is not a course with a
 * result at the end, and nothing on it says what to trade or how much.
 *
 * The page adds no content of its own beyond the order and a sentence on why
 * each stage comes where it does. The eight steps of "A path through it" on
 * My desk (src/data/journey.ts) are placed in the stages they belong to, read
 * from that file, so the two cannot drift apart. Nothing is stored for this
 * page and nothing here is ticked: the ticks are on My desk, which reads what
 * the browser already holds. A lesson, tool or primer named below is linked
 * only if it exists in its data file.
 */
const DESCRIPTION =
  "Start here: a beginner’s roadmap across GIO4X in six stages. Understand what is traded, how a trade works and what it costs, risk before reward, practise without money, choose an account and platform knowingly, and keep learning. Each stage links the lessons, tools and labs that serve it. An order to read in, not advice.";

export const metadata = pageMeta({ title: "Start here: a beginner’s roadmap in six stages", description: DESCRIPTION, path: "/start-here" });

type Row = { kind: string; label: string; href: string; note: string };

const lesson = (slug: string, note: string): Row | null => {
  const l = getLesson(slug);
  return l ? { kind: `Lesson · ${l.level}`, label: l.title, href: `/academy/${l.slug}`, note } : null;
};
const tool = (slug: string): Row | null => {
  const t = getTool(slug);
  return t ? { kind: t.kind, label: t.name, href: `/tools/${t.slug}`, note: t.line } : null;
};
const primer = (slug: string): Row | null => {
  const p = getPrimer(slug);
  return p ? { kind: "Primer", label: p.name, href: `/primers/${p.slug}`, note: p.card } : null;
};
/** the steps of "A path through it" that belong to a stage, as rows, with the second page each step names */
const path = (...ids: string[]): Row[] =>
  journey
    .filter((s) => ids.includes(s.id))
    .flatMap((s) => [{ kind: "On the desk’s path", label: s.label, href: s.href, note: s.line }, ...(s.also ? [{ kind: "On the desk’s path", label: s.also.label, href: s.also.href, note: `Also serves: ${s.title.toLowerCase()}.` }] : [])]);

/** one page once in a stage: the first row that names an address wins */
const rows = (list: (Row | null)[]): Row[] => {
  const seen = new Set<string>();
  return list.filter((r): r is Row => r !== null && !seen.has(r.href) && !!seen.add(r.href));
};

type Stage = { id: string; title: string; why: string; after: string; rows: Row[] };

const STAGES: Stage[] = [
  {
    id: "what",
    title: "Understand what is traded",
    why: "Before any order, the nouns: what a currency pair, an index or a barrel of oil is as an instrument, when each trades and what tends to move it. Most early mistakes are mistakes about what the thing on the screen is.",
    after: "What a pair, a pip and a lot are, which markets are open when, and what kind of contract a CFD is.",
    rows: rows([
      { kind: "Markets", label: "Market Command", href: "/markets", note: "Six asset classes: what trades, when it trades and what moves it." },
      lesson("introduction-to-forex-trading", "The vocabulary of the currency market."),
      lesson("understanding-currency-pairs", "Base and quote, majors, minors and exotics."),
      { kind: "Markets", label: "World Market Clock", href: "/markets/clock", note: "Which financial centres are open at this moment." },
      { kind: "Comparison", label: "Instrument types", href: "/side-by-side/instrument-types", note: "Spot, futures, CFDs and others, side by side." },
      { kind: "Look it up", label: "Glossary", href: "/glossary", note: "Every term, plainly defined, one at a time." },
    ]),
  },
  {
    id: "how",
    title: "See how a trade works, and what it costs",
    why: "An order has parts: a direction, a size, an entry, and usually a stop and a target. Every trade also starts behind by its cost. Leverage and margin belong here, because they decide how much of the account one trade answers for.",
    after: "What each part of an order does, what a trade costs from opening to closing, and what a position ties up as margin.",
    rows: rows([
      { kind: "Course", label: "Your first trade", href: "/academy/first-trade", note: "A ten-minute course on invented prices." },
      { kind: "Labs", label: "Trade Anatomy", href: "/labs/trade-anatomy", note: "One order, followed from the click to the balance." },
      tool("order-anatomy"),
      tool("cost-lab"),
      tool("spread-visualizer"),
      ...path("leverage", "margin"),
      { kind: "Comparison", label: "Order types", href: "/side-by-side/order-types", note: "Market, limit and stop orders, side by side." },
    ]),
  },
  {
    id: "risk",
    title: "Put risk before reward",
    why: "The size of a position is not chosen first. It follows from what the account can lose on one trade and where the trade is wrong. This stage comes before practice on purpose: practising without it trains the wrong habit.",
    after: "How a size is worked out from a risk and a stop, why a loss needs a larger gain to recover, and what the legal risk warning says.",
    rows: rows([
      { kind: "Hub", label: "Risk management", href: "/risk", note: "Per trade, per day, drawdown and ruin, in order, with every tool that serves them." },
      ...path("size", "risk"),
      lesson("position-sizing-strategies", "From a risk per trade to a size."),
      lesson("risk-reward-ratio-explained", "A stop, a target and the win rate that breaks even."),
      tool("drawdown"),
      { kind: "Legal", label: "Risk Disclosure", href: "/legal/risk", note: "The document that states the risks of trading on margin." },
    ]),
  },
  {
    id: "practise",
    title: "Practise without money",
    why: "Reading about an order and placing one are different skills. Everything in this stage runs on invented prices or virtual funds, so a mistake costs nothing and can be repeated until it is understood.",
    after: "How to build an order with a stop and a target, how to find what is wrong with a ticket, and how easily one good test result misleads.",
    rows: rows([
      ...path("practise", "rule"),
      { kind: "Trading", label: "Demo account", href: "/trading/demo", note: "Practise with virtual money." },
      lesson("testing-a-set-of-rules", "How a rule is tested, and what a test cannot show."),
      { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Four games about the person in front of the screen." },
    ]),
  },
  {
    id: "choose",
    title: "Choose an account and a platform knowingly",
    why: "Only now does the choice of a firm, an account and a platform come up, because only now are the questions clear. The checklist here is neutral: it can be held against any broker, and against GIO4X exactly as against the others.",
    after: "How to check any firm on a regulator’s register, what a trade costs on each kind of account, and what GIO4X has and has not published.",
    rows: rows([
      primer("how-to-choose-a-broker"),
      primer("regulation-explained"),
      { kind: "Trust", label: "What we disclose", href: "/trust/transparency", note: "What GIO4X publishes and what it has not, item by item." },
      { kind: "Trading", label: "Choose an Account", href: "/trading/accounts/choose", note: "Four questions about how you would trade." },
      { kind: "Trading", label: "Trading Conditions", href: "/trading/conditions", note: "Spreads, leverage and margin rules, as published." },
      { kind: "Platforms", label: "Compare platforms", href: "/platforms/compare", note: "777 Raptor and MetaTrader 5, side by side." },
      { kind: "Academy", label: "Scam school", href: "/scam-school", note: "How the commonest frauds work, and a checklist." },
    ]),
  },
  {
    id: "learn",
    title: "Keep learning, and keep a record",
    why: "There is no last stage. What changes is the source: less from pages and more from a written record of one’s own decisions, read back honestly. The rest of the Academy is here for whenever a question comes up.",
    after: "Nothing is finished here. A journal with trades in it, read over some weeks, is where the next questions come from.",
    rows: rows([
      ...path("record", "review"),
      { kind: "Plan", label: "Trading plan builder", href: "/trading-plan", note: "Your rules in your own words, to print." },
      { kind: "Academy", label: "Academy", href: "/academy", note: "Every lesson, level by level." },
      primer("trading-myths"),
      primer("trading-psychology"),
      { kind: "Academy", label: "Chart school", href: "/chart-school", note: "Indicators, each with the sum behind it." },
      { kind: "Academy", label: "Question of the day", href: "/academy/question-of-the-day", note: "One a day, and a run of days." },
    ]),
  },
];

const READERS: { title: string; text: string; go: { label: string; href: string } }[] = [
  {
    title: "New to markets",
    text: "You have not placed a trade, or have placed a few without being sure what happened. Take the stages in order. Each assumes the one before it.",
    go: { label: "Stage one", href: "#what" },
  },
  {
    title: "Trading already",
    text: "You know the words and want the parts you passed over. Stage three is a sensible place to begin, and a journal after it.",
    go: { label: "Risk before reward", href: "#risk" },
  },
  {
    title: "Looking at GIO4X",
    text: "You are deciding whether to open an account, here or anywhere. Stage five is the checklist, and it says plainly what this site has not published.",
    go: { label: "Choosing knowingly", href: "#choose" },
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/start-here", name: "Start here", description: DESCRIPTION, type: "CollectionPage" })} />
      <PageHero
        crumbs={[
          { name: "Academy", href: "/academy" },
          { name: "Start here", href: "/start-here" },
        ]}
        eyebrow="Academy · a beginner’s roadmap"
        title="Start here"
        lead={`One route across the site in ${STAGES.length} stages, from what is traded to keeping a record. Every stage is a short run of pages that already exist: lessons, tools and labs, in the order they are best met. It is an order to read and practise in, not advice and not a promise of any result.`}
      >
        <Link href="#what" className="btn btn-primary">
          Begin at stage one
        </Link>
        <Link href="#who" className="btn btn-ghost">
          Who this is for
        </Link>
      </PageHero>

      {/* who the site is for: three readers, each sent to the stage that suits them */}
      <section id="who" className="section scroll-mt-[var(--header-h)]" aria-labelledby="who-h">
        <div className="wrap">
          <p className="eyebrow">Who this site is for</p>
          <h2 id="who-h" className="h2 mt-13 max-w-[22ch]">
            Three readers, one route.
          </h2>
          <ul className="mt-34 grid border-l border-t border-line md:grid-cols-3">
            {READERS.map((r) => (
              <li key={r.title} className="flex flex-col border-b border-r border-line p-21">
                <h3 className="h4">{r.title}</h3>
                <p className="mt-8 text-sm text-ink-2">{r.text}</p>
                <a href={r.go.href} className="go mt-auto min-h-[2.75rem] pt-13 md:min-h-[2.125rem]">
                  {r.go.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-21 max-w-measure text-sm text-ink-3">
            It is not for someone looking for signals, a system that wins or a figure for what trading earns. This site publishes none of those. What it has is explanation, arithmetic and places to practise, and a plain account of what trading on margin can cost.
          </p>
        </div>
      </section>

      {/* the route: a rail of stage numbers down the left, each stage's pages beside it */}
      <section className="section hairline bg-paper" aria-labelledby="route-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-34 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-55">
          <nav aria-label="Stages" className="no-print min-w-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
              <p className="eyebrow">The route</p>
              <h2 id="route-h" className="h3 mt-13">
                {STAGES.length} stages, in order.
              </h2>
              <ol className="mt-13 flex flex-wrap gap-x-21 lg:grid lg:gap-0">
                {STAGES.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="link-quiet flex min-h-[2.75rem] items-center gap-8 text-sm">
                      <span className="num text-xs text-ink-3" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <ol className="min-w-0">
            {STAGES.map((s, i) => (
              <li key={s.id} id={s.id} className="grid scroll-mt-[var(--header-h)] grid-cols-[2.125rem_minmax(0,1fr)] gap-x-13 sm:grid-cols-[3.4375rem_minmax(0,1fr)] sm:gap-x-21">
                {/* the rail: the stage's number, and a line down to the next one */}
                <div className="flex flex-col items-center" aria-hidden>
                  <span className="num inline-grid h-34 w-34 shrink-0 place-items-center rounded-full border border-line-strong bg-bg font-display text-md text-ink sm:h-[3.4375rem] sm:w-[3.4375rem] sm:text-xl">{i + 1}</span>
                  {i < STAGES.length - 1 && <span className="w-px flex-1 bg-line-strong" />}
                </div>
                <div className={`min-w-0 ${i < STAGES.length - 1 ? "pb-55" : ""}`}>
                  <p className="label pt-5 sm:pt-13">
                    Stage <span className="num">{i + 1}</span> of <span className="num">{STAGES.length}</span>
                  </p>
                  <h3 className="h2 mt-5 max-w-[24ch]">{s.title}</h3>
                  <p className="mt-13 max-w-measure text-ink-2">{s.why}</p>

                  <ul className="mt-21 grid border-l border-t border-line sm:grid-cols-2">
                    {s.rows.map((r) => (
                      <li key={r.href} className="border-b border-r border-line bg-bg">
                        <Link href={r.href} className="group flex h-full flex-col p-13 transition-colors duration-fast hover:bg-surface sm:p-21">
                          <span className="label">{r.kind}</span>
                          <span className="mt-5 block font-medium text-ink transition-colors duration-fast group-hover:text-accent">{r.label}</span>
                          <span className="mt-3 block text-sm text-ink-3">{r.note}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-13 max-w-measure border-l-2 border-accent pl-13 text-sm text-ink-2">
                    <span className="label mr-8">{i < STAGES.length - 1 ? "Before moving on" : "And then"}</span>
                    {i < STAGES.length - 1 ? `You should be able to say, in your own words: ${s.after.charAt(0).toLowerCase()}${s.after.slice(1)}` : s.after}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="how-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-x-55 gap-y-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
          <div>
            <h2 id="how-h" className="h3">
              How to use the route
            </h2>
            <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
              <p>Take it in order the first time. The stages are short on purpose: a stage is finished when you can say what it was about without looking, not when every page in it has been opened.</p>
              <p>
                Nothing is recorded for this page. The rows marked “On the desk’s path” are the eight steps of the path on My desk, where the browser’s own records, such as a completed lesson or a trade written in the journal, show a step as done. That page stores nothing new either.
              </p>
              <p>
                The route describes and does not recommend. It does not say that anyone should trade, and finishing it says nothing about results. {educationalNote}
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <div className="panel p-21">
              <p className="label">The same steps, with ticks</p>
              <p className="h4 mt-8">A path through it, on My desk</p>
              <p className="mt-5 text-sm text-ink-2">
                {journey.length} of the pages above as one optional exercise. A step is ticked only from what your browser already holds, and nothing is sent anywhere.
              </p>
              <Link href="/desk" className="go mt-13 min-h-[2.75rem] md:min-h-[2.125rem]">
                My desk
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">{riskWarning}</p>
        </div>
      </section>
      <NextSteps
        items={[
          { kind: "Academy", label: "Your first trade", href: "/academy/first-trade", note: "A ten-minute course on invented prices." },
          { kind: "Risk", label: "Risk management", href: "/risk", note: "Stage three in full." },
          { kind: "Primer", label: "How to choose a broker", href: "/primers/how-to-choose-a-broker", note: "Stage five in full: eight questions for any firm." },
          { kind: "Directory", label: "Explore GIO4X", href: "/explore", note: "Everything on the site, on one page." },
        ]}
      />
    </>
  );
}
