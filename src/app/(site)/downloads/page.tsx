import Link from "next/link";
import { PrintAll } from "@/components/downloads/PrintSheet";
import { Blank, Blanks, Sheet, Ticks } from "@/components/downloads/parts";
import { SEASONS, clock, exchangeRows, fxRows, spanCell } from "@/components/guides/hours";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps, PageHero } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { riskWarning } from "@/config/legal";
import { getTerm } from "@/data/glossary";
import { centres, fxSessions } from "@/lib/sessions";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";

/**
 * The downloads shelf: one-page sheets to print, or to save as a PDF from the
 * browser's own print dialogue. No file is generated or hosted.
 *
 * The rule it keeps: a sheet is a blank form or a reminder. The limits, the
 * plan and the answers are the visitor's own, and no sheet suggests a number.
 * The session card is worked out from lib/sessions and the pocket glossary is
 * read from data/glossary, so neither can drift from the rest of the site.
 */

const DESCRIPTION =
  "Free printable trading templates, one page each: a trading plan template, a pre-trade checklist, a post-trade review, a weekly review, a risk rules card, a forex session-times card in UTC, a scam checklist and a pocket glossary. Print them or save them as PDFs. Blank forms, not advice.";

export const metadata = pageMeta({ title: "Downloads: printable trading plan, checklists and review sheets", description: DESCRIPTION, path: "/downloads" });

const PLAN_SHORT = ["Date written", "Account currency", "The most I risk on one trade", "The most positions open at once", "I stop for the day after losing", "I stop for the week after losing"];
const PLAN_LONG = [
  "The markets I trade, and the ones I leave alone",
  "The hours I trade, in my local time",
  "What must be true before I place an order",
  "Where the trade is wrong, and how I leave it",
  "Where I take a profit, or the rule I follow",
  "What I record after every trade, and when I next review this plan",
];

const PRE_FIELDS = ["Date", "Instrument", "Long or short", "Size", "Entry", "Stop", "Target", "Amount at risk"];
const PRE_TICKS = [
  "It matches a setup that is written in my plan.",
  "I know the price at which the idea is wrong, and the stop is there.",
  "The size makes that stop cost no more than my limit for one trade.",
  "I have counted the spread, the commission and any overnight financing.",
  "I have looked at the calendar for releases due while the trade is open.",
  "With my other open positions, the total at risk is inside my limits.",
  "No other open position is this same trade under another name.",
  "I know what happens to my stop if the price gaps past it.",
  "I am not trying to win back an earlier loss.",
  "I could explain this trade to someone else in two sentences.",
];

const POST_FIELDS = ["Date", "Instrument", "Long or short", "Size", "Entry", "Exit", "Result, in money", "Result, as a multiple of the risk"];
const POST_RULES = ["The entry", "The stop", "The size", "The exit"];
const POST_LONG = ["What I saw before the trade, and what happened", "What I did well, whatever the result", "What I would do differently", "How I felt before, during and after"];

const WEEK_FIELDS = ["Week beginning", "Account at the start", "Account at the end", "Deposits or withdrawals"];
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "The week"];
const WEEK_COLS = ["Trades", "Wins", "Losses", "Result", "Inside my rules?"];
const WEEK_LONG = ["The best decision of the week (not the best result)", "A rule I broke, if any, and what led to it", "What I noticed about the market", "One thing to change next week"];

const RISK_SHORT = [
  "The most I risk on one trade",
  "The most at risk across all open trades",
  "I stop for the day after losing",
  "I stop for the week after losing",
  "The most positions open at once",
  "The largest size I take",
  "The most leverage I use",
  "Money I could lose in full without harm",
];
const RISK_LONG = ["I do not trade when", "My rule about moving a stop", "My rule about adding to a position", "After reaching a limit, I do not trade again until"];

const SCAM_TICKS = [
  "I know the firm’s full legal name, and where it is registered.",
  "I found it on the regulator’s public register myself, by my own search and not through a link they sent.",
  "The website, e-mail address and payment details I was given match those on the register.",
  "Nobody has promised or hinted at a return, or told me there is no risk.",
  "Nobody is hurrying me: no deadline, no “last places”, no bonus that expires today.",
  "I made the first contact. It did not begin with a message, a call, an advert or a new friend online.",
  "The money goes to an account in the firm’s own name, not to a person, another company, a gift card or a wallet address.",
  "Nobody has asked me to install remote-access software, share my screen or tell them a password or a code.",
  "I have read how a withdrawal works and what it costs, in the firm’s own documents.",
  "Nobody has asked me to pay a fee or a “tax” before a withdrawal is released.",
  "I have talked this over with someone I trust who has nothing to gain from it.",
  "I can afford to lose every penny of what I am about to send.",
];

const POCKET = ["pip", "spread", "lot", "leverage", "margin", "free-margin", "margin-call", "stop-out", "equity", "drawdown", "bid-price", "ask-rate", "currency-pair", "cfd", "stop-loss", "take-profit", "slippage", "swap", "liquidity", "volatility"];

const SHEETS = [
  { id: "trading-plan", name: "trading plan template", title: "Trading plan" },
  { id: "pre-trade", name: "pre-trade checklist", title: "Pre-trade checklist" },
  { id: "post-trade", name: "post-trade review", title: "Post-trade review" },
  { id: "weekly-review", name: "weekly review", title: "Weekly review" },
  { id: "risk-rules", name: "risk rules card", title: "Risk rules card" },
  { id: "session-times", name: "session-times card", title: "Session times in UTC" },
  { id: "before-you-send-money", name: "scam checklist", title: "Before you send money to anyone" },
  { id: "pocket-glossary", name: "pocket glossary", title: "Pocket glossary" },
] as const;
const TOTAL = SHEETS.length;
const sheet = (id: (typeof SHEETS)[number]["id"]) => {
  const at = SHEETS.findIndex((s) => s.id === id);
  return { id, n: at + 1, total: TOTAL, name: SHEETS[at].name };
};

export default function Page() {
  const seasons = SEASONS.map((s) => ({ ...s, fx: fxRows("UTC", s.at), ex: exchangeRows("UTC", s.at) }));
  const terms = POCKET.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <>
      {/* each sheet is laid out to fill one A4 page; the browser's dialogue can still choose another size */}
      <style>{"@page { size: A4; margin: 14mm; }"}</style>
      <JsonLd data={webPageSchema({ path: "/downloads", name: "Downloads", description: DESCRIPTION, type: "CollectionPage" })} />
      <div className="no-print">
        <PageHero
          quiet
          crumbs={[
            { name: "Trading", href: "/trading" },
            { name: "Downloads", href: "/downloads" },
          ]}
          eyebrow="Downloads · to print"
          title="Eight sheets to print."
          lead="One A4 page each. Every sheet has its own Print button, which prints that sheet alone; choose “Save as PDF” in the print dialogue to keep it as a file. They are blank forms and reminders, to be filled in by hand with your own answers."
        >
          <PrintAll />
          <Link href="/academy/cheat-sheets" className="btn btn-ghost">
            The Academy’s cheat sheets
          </Link>
        </PageHero>

        <nav className="wrap pt-34" aria-label="The sheets on this page">
          <ul className="flex flex-wrap gap-8">
            {SHEETS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="btn btn-ghost btn-sm">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-13 max-w-measure text-sm text-ink-3">
            Nothing is downloaded from this site and nothing you write is sent anywhere: the page is printed by your own browser. Three more sheets (pip values, nine checks before a trade, how to read a candle) are on the{" "}
            <Link href="/academy/cheat-sheets" className="link">
              cheat sheets
            </Link>{" "}
            page.
          </p>
        </nav>
      </div>

      <div className="wrap section gx-sheets">
        <Sheet
          {...sheet("trading-plan")}
          title="My trading plan"
          intro="A plan is a set of decisions made in advance, while nothing is at stake. Every line here is yours to fill in. Nothing on the sheet suggests an answer."
          foot="A blank template. It is not advice, and a written plan does not make a trade win."
        >
          <Blanks labels={PLAN_SHORT} />
          <div className="mt-21 grid gap-13">
            {PLAN_LONG.map((l) => (
              <Blank key={l} label={l} lines={2} />
            ))}
          </div>
        </Sheet>

        <Sheet {...sheet("pre-trade")} title="Before the order" intro="One sheet for one trade. Fill in the top, write the reason, then tick only what is true. A box left empty is information." foot="A reminder of your own rules. Ticking every box does not make a trade win.">
          <Blanks labels={PRE_FIELDS} cols={4} />
          <div className="mt-13">
            <Blank label="The reason for this trade, in one sentence" lines={2} />
          </div>
          <Ticks items={PRE_TICKS} />
        </Sheet>

        <Sheet
          {...sheet("post-trade")}
          title="After the trade"
          intro="Written once the trade is closed. It separates the decision from the result: a sound decision can lose and a careless one can win."
          foot="A blank form for your own record. Past trades say nothing certain about future ones."
        >
          <Blanks labels={POST_FIELDS} cols={4} />
          <div className="mt-21 overflow-x-auto">
            <table className="table-gx min-w-[20rem]">
              <thead>
                <tr>
                  <th scope="col">Did I follow my plan for</th>
                  <th scope="col">Yes</th>
                  <th scope="col">No</th>
                  <th scope="col">If not, why</th>
                </tr>
              </thead>
              <tbody>
                {POST_RULES.map((r) => (
                  <tr key={r}>
                    <th scope="row">{r}</th>
                    <td>
                      <span aria-hidden className="inline-block h-[1.125rem] w-[1.125rem] border border-line-strong align-middle" />
                    </td>
                    <td>
                      <span aria-hidden className="inline-block h-[1.125rem] w-[1.125rem] border border-line-strong align-middle" />
                    </td>
                    <td className="w-[55%]" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-21 grid gap-13">
            {POST_LONG.map((l) => (
              <Blank key={l} label={l} lines={2} />
            ))}
          </div>
        </Sheet>

        <Sheet {...sheet("weekly-review")} title="The week, looked back on" intro="Filled in at the end of the week, away from the screen. Count first, then write." foot="A blank form for your own record. One week is too few trades to judge a method by.">
          <Blanks labels={WEEK_FIELDS} cols={4} />
          <div className="mt-21 overflow-x-auto">
            <table className="table-gx min-w-[28rem]">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  {WEEK_COLS.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_DAYS.map((d) => (
                  <tr key={d}>
                    <th scope="row">{d}</th>
                    {WEEK_COLS.map((c) => (
                      <td key={c} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-21 grid gap-13">
            {WEEK_LONG.map((l) => (
              <Blank key={l} label={l} lines={2} />
            ))}
          </div>
        </Sheet>

        <Sheet
          {...sheet("risk-rules")}
          title="My risk rules"
          intro="Your own limits, written down before they are needed, and kept where you can see them. The numbers are yours to choose."
          foot="The card suggests no limit. A limit you set does not prevent a larger loss when a market gaps or moves fast."
        >
          <Blanks labels={RISK_SHORT} />
          <div className="mt-21 grid gap-13">
            {RISK_LONG.map((l) => (
              <Blank key={l} label={l} lines={2} />
            ))}
          </div>
          <Blanks labels={["Signed", "Date"]} />
        </Sheet>

        <Sheet
          {...sheet("session-times")}
          title="Session times, in UTC"
          intro="The four conventional FX windows and the regular hours of nine exchanges, in Coordinated Universal Time. There are two columns because the hours move when a city changes its clocks. The last column is for your own time zone."
          foot="Worked out from the timetable this site’s clocks use, for 15 January and 15 July 2027. Regular weekday hours: public holidays, early closes and the weeks around the clock changes are not shown. “+1” means the next UTC day."
        >
          <div className="mt-21 overflow-x-auto">
            <table className="table-gx min-w-[38rem]">
              <thead>
                <tr>
                  <th scope="col">Open</th>
                  <th scope="col">On its own clock</th>
                  {seasons.map((s) => (
                    <th key={s.key} scope="col">
                      UTC, {s.inWords}
                    </th>
                  ))}
                  <th scope="col">My time</th>
                </tr>
              </thead>
              <tbody>
                {fxSessions.map((f, i) => (
                  <tr key={f.key}>
                    <th scope="row">{f.name} session</th>
                    <td className="num">
                      {clock(f.open)}–{clock(f.close)}
                    </td>
                    {seasons.map((s) => (
                      <td key={s.key} className="num">
                        {spanCell(s.fx[i].span)}
                      </td>
                    ))}
                    <td />
                  </tr>
                ))}
                {centres.map((c, i) => (
                  <tr key={c.key}>
                    <th scope="row">
                      {c.city} <span className="text-ink-3">{c.venue}</span>
                    </th>
                    <td className="num">
                      {clock(c.open)}–{clock(c.close)}
                      {c.lunch && (
                        <span className="block text-xs text-ink-3">
                          break {clock(c.lunch[0])}–{clock(c.lunch[1])}
                        </span>
                      )}
                    </td>
                    {seasons.map((s) => (
                      <td key={s.key} className="num">
                        {spanCell(s.ex[i].span)}
                      </td>
                    ))}
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sheet>

        <Sheet
          {...sheet("before-you-send-money")}
          title="Before you send money to anyone"
          intro="For any firm, person or app that asks for money to trade or invest, this one included. Tick only what is true. Each empty box is a reason to stop and find out more before anything is sent."
          foot="A list of common warning signs, not a test. A full set of ticks does not prove that a firm is genuine. If something feels wrong, stop, and speak to your bank and to your national financial regulator or fraud-reporting service."
        >
          <Ticks items={SCAM_TICKS} />
        </Sheet>

        <Sheet {...sheet("pocket-glossary")} title="Twenty words to know" intro="The first line of each definition in this site’s glossary, with its formula where there is one. Fold it in four." foot="Definitions, shortened. The full entries, with examples, are in the glossary on this site.">
          <dl className="mt-21 grid grid-cols-1 gap-x-34 gap-y-13 sm:grid-cols-2 print:grid-cols-3 print:gap-x-21 print:gap-y-8">
            {terms.map((t) => (
              <div key={t.slug} className="break-inside-avoid border-t border-line pt-8">
                <dt className="font-medium text-ink">{t.term}</dt>
                <dd className="mt-3 text-sm text-ink-2 print:text-xs">
                  {t.definition.split(/(?<=\.)\s/)[0]}
                  {t.formula && <span className="num mt-3 block text-xs text-ink-3">{t.formula}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </Sheet>

        <p className="no-print text-sm text-ink-3">{riskWarning}</p>
      </div>

      <div className="no-print">
        <PunchLine k="plan" />
        <NextSteps
          items={[
            { kind: "Academy", label: "Cheat sheets", href: "/academy/cheat-sheets", note: "Three more pages to print." },
            { kind: "Tool", label: "Position size", href: "/tools/position-size", note: "The size that fits a stop and a risk amount." },
            { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule and test it on invented prices." },
            { kind: "Glossary", label: "The glossary", href: "/glossary", note: "Every term, in full." },
          ]}
        />
      </div>
    </>
  );
}
