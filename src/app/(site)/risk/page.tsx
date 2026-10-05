import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { getLesson } from "@/data/academy";
import { getArticle } from "@/data/articles";
import { getTerm } from "@/data/glossary";
import { getPrimer } from "@/data/primers";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * RISK MANAGEMENT — one place for what the site already has on risk, with a
 * short spine that says how the pieces fit: what one trade may lose, what one
 * day may lose, how far a run of losses takes an account down, and the chance
 * that it never comes back.
 *
 * The rules this page keeps: it adds no tool and no figure of its own beyond
 * arithmetic on one invented account, labelled as an illustration; it names
 * no percentage as the right one; and every tool, lesson, term, primer and
 * article is read from its own data file and linked only if it exists. The
 * legal Risk Disclosure is a different document and is linked, not restated.
 */
const DESCRIPTION =
  "Risk management in one place: risk per trade and position size, stop loss and risk/reward, a limit for the day, drawdown mathematics, risk of ruin and expectancy, margin and leverage, with the calculators, the Risk Room, the journal, the trading plan builder, the lessons and the glossary terms that go with each. Arithmetic, not advice.";

export const metadata = pageMeta({ title: "Risk management: per trade, per day, drawdown and ruin", description: DESCRIPTION, path: "/risk" });

/* ---- the one invented account the spine follows ---------------------------- */
const BALANCE = 10_000;
const RISK = 0.01;
const STOP_PIPS = 25;
const PIP_VALUE = 10;
const DAY_LOSSES = 3;
const RUN = 10;
const FRACTIONS = [0.01, 0.02, 0.05, 0.1] as const;

const money = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
/** what is left of an account after `n` losses in a row of the same share of the balance */
const left = (fraction: number, n: number) => Math.pow(1 - fraction, n);
/** the gain needed to return to the start from a share `kept` of it */
const needed = (kept: number) => 1 / kept - 1;

const perTrade = BALANCE * RISK;
const lots = perTrade / (STOP_PIPS * PIP_VALUE);

type Step = { n: string; id: string; title: string; question: string; body: string; sum: string[]; links: { label: string; href: string }[] };

const SPINE: Step[] = [
  {
    n: "01",
    id: "trade",
    title: "Per trade",
    question: "What may this one trade lose?",
    body: "The first limit is set before the trade is opened: a sum the account can lose on it, and the price at which the idea is wrong. The size of the position follows from those two, and is not chosen first.",
    sum: [`${money(BALANCE)} × ${pct(RISK, 0)} = ${money(perTrade)} at risk`, `${money(perTrade)} ÷ (${STOP_PIPS} pips × ${PIP_VALUE} a pip) = ${lots.toFixed(2)} lots`],
    links: [
      { label: "Position Size", href: "/tools/position-size" },
      { label: "Risk / Reward", href: "/tools/risk-reward" },
      { label: "Pip Value", href: "/tools/pip-value" },
    ],
  },
  {
    n: "02",
    id: "day",
    title: "Per day",
    question: "What may this one day lose?",
    body: "Trades come in runs, and judgement is at its worst after a few losses. A limit for the day, written beforehand, ends the session before a bad morning becomes a bad month. It can be a sum, a number of losing trades, or a time.",
    sum: [`${DAY_LOSSES} losses × ${money(perTrade)} = ${money(perTrade * DAY_LOSSES)}`, `${money(perTrade * DAY_LOSSES)} ÷ ${money(BALANCE)} = ${pct((perTrade * DAY_LOSSES) / BALANCE, 0)} of the account`],
    links: [
      { label: "Trading plan builder", href: "/trading-plan" },
      { label: "Trading psychology", href: "/primers/trading-psychology" },
      { label: "The Mind Room", href: "/labs/mind" },
    ],
  },
  {
    n: "03",
    id: "drawdown",
    title: "Drawdown",
    question: "How far down can a run take the account?",
    body: "A drawdown is the fall from a high point of the account to the low that follows. Losses compound downwards, and the gain needed to recover is larger than the loss was, increasingly so as the loss deepens.",
    sum: [`${RUN} losses of ${pct(RISK, 0)} leave ${pct(left(RISK, RUN))}`, `to return: a gain of ${pct(needed(left(RISK, RUN)))}`],
    links: [
      { label: "Drawdown", href: "/tools/drawdown" },
      { label: "The Risk Room", href: "/labs/risk-room" },
      { label: "Trading journal", href: "/journal" },
    ],
  },
  {
    n: "04",
    id: "ruin",
    title: "Ruin",
    question: "What is the chance it never comes back?",
    body: "Ruin is a drawdown deep enough that the account, or the person, stops. Its likelihood depends on three things together: how often the method wins, how large a win is beside a loss, and the share risked each time. The first three steps are what keep the fourth small.",
    sum: ["expectancy = win rate × average win − loss rate × average loss", "the share risked decides how many losses the account can take"],
    links: [
      { label: "Risk of Ruin", href: "/tools/risk-of-ruin" },
      { label: "Expectancy", href: "/tools/expectancy" },
      { label: "Trading myths", href: "/primers/trading-myths" },
    ],
  },
];

const faq = [
  {
    q: "What is risk management in trading?",
    a: "The set of limits a trader fixes before trading: how much one trade may lose, where it is closed if wrong, how much one day may lose, and how large a fall in the account is tolerable. Position size, stop loss, a daily limit and attention to drawdown are its ordinary tools. It limits losses; it does not make a method profitable.",
  },
  {
    q: "How do risk per trade, drawdown and risk of ruin fit together?",
    a: "Risk per trade is the share of the account one losing trade removes. A run of losing trades compounds into a drawdown, whose depth depends on that share and the length of the run. Risk of ruin is the chance that a drawdown ever reaches a level from which the account does not recover, and it depends on the win rate, the size of a win beside a loss, and the share risked.",
  },
  {
    q: "Does this page say how much I should risk?",
    a: "No. The 1% used in the illustration is a round figure chosen to make the arithmetic easy to follow. What a person can afford to lose depends on their circumstances, and this site gives no advice on it.",
  },
];

/** A tool row from the registry, or nothing if the slug no longer exists. */
function tool(slug: string) {
  const t = getTool(slug);
  return t ? { label: t.name, href: `/tools/${t.slug}`, note: t.line } : null;
}

type Row = { label: string; href: string; note: string };
const present = (rows: (Row | null)[]): Row[] => rows.filter((r): r is Row => r !== null);

function Shelf({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="min-w-0">
      <h3 className="label">{title}</h3>
      <ul className="mt-8 border-t border-line-strong">
        {rows.map((r) => (
          <li key={r.href} className="border-b border-line">
            <Link href={r.href} className="group block py-13">
              <span className="font-medium text-ink transition-colors duration-fast group-hover:text-accent">{r.label}</span>
              <span className="block text-sm text-ink-3">{r.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  const calculators = present(["position-size", "risk-reward", "pip-value", "drawdown", "risk-of-ruin", "expectancy", "break-even"].map(tool));
  const marginTools = present(["margin", "leverage-visualizer"].map(tool));
  const lessons = ["what-is-leverage-and-margin", "position-sizing-strategies", "risk-reward-ratio-explained", "managing-trading-psychology", "testing-a-set-of-rules"].map((s) => getLesson(s)).filter((l): l is NonNullable<typeof l> => !!l);
  const articles = ["5-risk-management-rules-forex", "position-sizing-secret-weapon"].map((s) => getArticle(s)).filter((a): a is NonNullable<typeof a> => !!a);
  const primers = ["trading-psychology", "trading-myths", "order-types-in-depth"].map((s) => getPrimer(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const terms = ["risk-management", "money-management", "stop-loss", "trailing-stop", "take-profit", "risk-reward-ratio", "drawdown", "leverage", "margin", "free-margin", "margin-call", "stop-out", "negative-balance", "slippage", "gap", "volatility", "correlation", "hedging", "martingale-strategy"]
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const reading: Row[] = [
    ...lessons.map((l) => ({ label: l.title, href: `/academy/${l.slug}`, note: `Academy lesson · ${l.level}` })),
    ...primers.map((p) => ({ label: p.name, href: `/primers/${p.slug}`, note: `Primer · ${p.card}` })),
    ...articles.map((a) => ({ label: a.title, href: `/intelligence/${a.slug}`, note: "Intelligence" })),
  ];

  return (
    <>
      <JsonLd data={webPageSchema({ path: "/risk", name: "Risk management", description: DESCRIPTION, type: "CollectionPage" })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Risk management", href: "/risk" },
        ]}
        eyebrow="Trading · risk before reward"
        title="Risk management"
        lead="Everything this site has on risk, in the order the questions arise: what one trade may lose, what one day may lose, how far a run of losses takes an account down, and the chance that it does not come back. Arithmetic you can check, and no advice on what your own limits should be."
      >
        <Link href="#spine" className="btn btn-primary">
          The four questions
        </Link>
        <Link href="/legal/risk" className="btn btn-ghost">
          Risk Disclosure
        </Link>
      </PageHero>

      {/* the spine: four questions in order, one invented account carried through them */}
      <section id="spine" className="section scroll-mt-[var(--header-h)]" aria-labelledby="spine-h">
        <div className="wrap">
          <p className="eyebrow">The spine</p>
          <h2 id="spine-h" className="h2 mt-13 max-w-[22ch]">
            Four questions, each inside the next.
          </h2>
          <p className="lead mt-13 max-w-measure">
            A trade sits inside a day, a day inside a run of days, and a run inside the life of the account. A limit set at one level is what keeps the next from being reached.
          </p>

          <ol className="mt-34 grid gap-px overflow-hidden rounded border border-line bg-line lg:grid-cols-4">
            {SPINE.map((s, i) => (
              <li key={s.id} id={s.id} className="relative flex scroll-mt-[var(--header-h)] flex-col bg-bg p-21">
                <p className="flex items-baseline justify-between gap-13">
                  <span className="num text-xs font-semibold tracking-[0.1em] text-ink-3">{s.n}</span>
                  {/* the arrow to the next question; the order is also the order of the list */}
                  {i < SPINE.length - 1 && (
                    <span aria-hidden className="text-ink-3">
                      <span className="hidden lg:inline">→</span>
                      <span className="lg:hidden">↓</span>
                    </span>
                  )}
                </p>
                <h3 className="mt-8 font-display text-xl text-ink">{s.title}</h3>
                <p className="mt-3 text-sm font-medium text-accent">{s.question}</p>
                <p className="mt-13 text-sm text-ink-2">{s.body}</p>
                <div className="mt-13 border-t border-line pt-13">
                  <p className="label">{i < 3 ? "The sum" : "What it turns on"}</p>
                  {s.sum.map((x) => (
                    <p key={x} className="num mt-5 text-sm text-ink">
                      {x}
                    </p>
                  ))}
                </div>
                <ul className="mt-auto flex flex-wrap gap-x-13 pt-13">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link inline-flex min-h-[2.75rem] items-center text-sm md:min-h-[2.125rem]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-13 max-w-measure text-xs text-ink-3">
            Illustration on one invented account of {money(BALANCE)} with a stop {STOP_PIPS} pips away on an instrument where one pip on one lot is worth {PIP_VALUE}. The {pct(RISK, 0)} is a round figure for the arithmetic, not a recommendation, and none of these numbers is a market price or a GIO4X condition.
          </p>
        </div>
      </section>

      {/* the same run of losses at four sizes: what is left, and what it takes to come back */}
      <section className="section hairline bg-paper" aria-labelledby="run-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-x-55 gap-y-21 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
          <div>
            <p className="eyebrow">Why size comes first</p>
            <h2 id="run-h" className="h2 mt-13 max-w-[18ch]">
              Ten losses in a row, at four sizes.
            </h2>
            <p className="mt-13 max-w-narrow text-ink-2">
              A run of ten losses is rare in a short series of trades and far from impossible in a long one. The run is the same in every row; only the share risked on each trade changes. What is left falls faster than the share rises, and the way back grows faster still.
            </p>
            <p className="mt-13 max-w-narrow text-sm text-ink-3">
              The sum is one line: what is left after n losses of a share r is (1 − r) multiplied by itself n times, and the gain needed to return is 1 ÷ that, less 1. The{" "}
              <Link href="/tools/drawdown" className="link">
                Drawdown
              </Link>{" "}
              tool and the{" "}
              <Link href="/labs/risk-room" className="link">
                Risk Room
              </Link>{" "}
              run it on figures of your own.
            </p>
          </div>
          <div className="min-w-0">
            <table className="w-full">
              <caption className="sr-only">An account after ten losing trades in a row at four shares risked per trade: the share of the account left, and the gain needed to return to the start</caption>
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="label py-8 pr-13 text-left">
                    Risked each trade
                  </th>
                  <th scope="col" className="label py-8 pr-13 text-left">
                    Left after {RUN} losses
                  </th>
                  <th scope="col" className="label py-8 text-right">
                    Gain to return
                  </th>
                </tr>
              </thead>
              <tbody>
                {FRACTIONS.map((f) => {
                  const kept = left(f, RUN);
                  return (
                    <tr key={f} className="border-b border-line align-middle">
                      <th scope="row" className="num py-13 pr-13 text-left font-display text-xl font-light text-ink">
                        {pct(f, 0)}
                      </th>
                      <td className="py-13 pr-13">
                        <span className="flex items-center gap-13">
                          {/* the bar repeats the figure beside it and carries nothing else */}
                          <span aria-hidden className="block h-[13px] min-w-0 flex-1 overflow-hidden rounded-xs border border-line-strong">
                            <span className="block h-full bg-ink" style={{ width: `${kept * 100}%` }} />
                          </span>
                          <span className="num w-[3.4375rem] shrink-0 text-right text-sm text-ink">{pct(kept)}</span>
                        </span>
                      </td>
                      <td className="num py-13 text-right text-sm font-medium text-ink">{pct(needed(kept))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-13 flex flex-wrap items-center gap-x-13 gap-y-3 text-xs text-ink-3">
              <span className="chip">Worked example</span>
              <span>Arithmetic only. It assumes every loss is exactly the planned share, which a gap or slippage can exceed.</span>
            </p>
          </div>
        </div>
      </section>

      {/* margin and leverage: the limit the provider applies, whatever the trader's own limits are */}
      <section className="section hairline" aria-labelledby="margin-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-x-55 gap-y-21 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow">The other limit</p>
            <h2 id="margin-h" className="h2 mt-13 max-w-[20ch]">
              Margin and leverage.
            </h2>
            <div className="mt-13 grid max-w-measure gap-13 text-ink-2">
              <p>
                The four questions above are limits a trader sets. Margin is a limit the provider applies. A leveraged position ties up part of the account as margin; when losses reduce what remains to a stated share of that margin, the provider warns, and at a lower share it closes positions without asking. Those two points are the margin call and the stop out.
              </p>
              <p>
                Leverage does not change which way a price moves. It changes how much of the account a given move is worth, and so how near the stop out stands. A position sized from the first question, with a stop, will usually be closed by the trader’s own rule long before the provider’s; a position sized from the leverage available will not.
              </p>
              <p>
                The levels that apply to an account are a provider’s published terms, not a matter of arithmetic. GIO4X’s are on the{" "}
                <Link href="/trading/conditions" className="link">
                  Trading Conditions
                </Link>{" "}
                page as indicative figures, and the{" "}
                <Link href="/legal/risk" className="link">
                  Risk Disclosure
                </Link>{" "}
                is the document that states the risks of trading on margin.
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <Shelf
              title="Work it through"
              rows={[
                ...marginTools,
                { label: "Leverage, in six steps", href: "/academy/leverage-story", note: "One stake, the position it answers for and what a 1% move does to each." },
                { label: "The Engine Room", href: "/labs/engine-room", note: "A margin call, swap and slippage as machines to operate." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* the kit: everything else the site has on risk, by kind */}
      <section className="section hairline bg-paper" aria-labelledby="kit-h">
        <div className="wrap">
          <p className="eyebrow">The kit</p>
          <h2 id="kit-h" className="h2 mt-13 max-w-[22ch]">
            What the site has, by kind.
          </h2>
          <div className="mt-34 grid gap-x-34 gap-y-34 md:grid-cols-2 lg:grid-cols-3">
            <Shelf title="Calculators" rows={calculators} />
            <Shelf
              title="Rooms and records"
              rows={[
                { label: "The Risk Room", href: "/labs/risk-room", note: "Ruin, losing streaks, the same trades at five sizes, recovery." },
                { label: "The Mind Room", href: "/labs/mind", note: "Four games about the person in front of the screen." },
                { label: "Practice desk", href: "/labs/simulator", note: "A simulation on invented prices, with nothing at stake." },
                { label: "Trading journal", href: "/journal", note: "A private log kept in your browser, with its own statistics." },
                { label: "Trading plan builder", href: "/trading-plan", note: "Your limits in your own words, to print." },
                { label: "Downloads", href: "/downloads", note: "A printable plan and checklists." },
                { label: "Cheat sheets", href: "/academy/cheat-sheets", note: "One-page summaries to print." },
              ]}
            />
            <Shelf title="Reading" rows={reading} />
          </div>

          {terms.length > 0 && (
            <div className="mt-34">
              <h3 className="label">The words, in the glossary</h3>
              <ul className="mt-13 flex flex-wrap gap-8">
                {terms.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/glossary/${t.slug}`} className="btn btn-ghost btn-sm">
                      {t.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="section hairline" aria-labelledby="limits-h">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-x-55 gap-y-34 lg:grid-cols-2">
          <div>
            <h2 id="limits-h" className="h3">
              What this page does not do
            </h2>
            <ul className="mt-13 grid max-w-measure gap-8 text-ink-2">
              {[
                "Say what share of an account you should risk, where a stop belongs or how much leverage to use. Those depend on your circumstances and are yours to set.",
                "Make a method profitable. Limits decide how long an account lasts and how fair a test the method gets; they give it no edge.",
                "Remove the risk of trading on margin. A stop can be filled at a worse price than the one set when a market gaps, and a loss can then be larger than planned.",
                "Replace the legal Risk Disclosure, which is a separate document.",
              ].map((x) => (
                <li key={x} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                  <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <Link href="/legal/risk" className="go mt-21">
              Read the Risk Disclosure
            </Link>
          </div>
          <div>
            <h2 className="h3">Questions people ask</h2>
            <dl className="mt-13 grid max-w-measure gap-21 text-ink-2">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium text-ink">{f.q}</dt>
                  <dd className="mt-5">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section-quiet hairline" aria-label="Risk warning">
        <div className="wrap">
          <p className="max-w-measure text-sm text-ink-3">
            {riskWarning} {educationalNote}
          </p>
        </div>
      </section>
      <NextSteps
        items={[
          { kind: "Tool", label: "Position Size", href: "/tools/position-size", note: "From the risk you accept to the size you trade." },
          { kind: "Labs", label: "The Risk Room", href: "/labs/risk-room", note: "Ruin, streaks and sizing, to try." },
          { kind: "Plan", label: "Trading plan builder", href: "/trading-plan", note: "Your rules in your own words, to print." },
          { kind: "Start", label: "Start here", href: "/start-here", note: "The beginner’s roadmap, of which this is stage three." },
        ]}
      />
    </>
  );
}
