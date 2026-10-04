import Link from "next/link";
import { NotPublished } from "@/components/platforms/FactState";
import { OrderErrors, type CodeRow } from "@/components/platforms/OrderErrors";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { educationalNote, riskWarning } from "@/config/legal";
import { getLesson } from "@/data/academy";
import { getTerm } from "@/data/glossary";
import { mt5Codes, type CodeRef } from "@/data/mt5-codes";
import { mt5Trademark } from "@/data/platforms";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * "Why was this order rejected?": the trade server return codes of
 * MetaTrader 5, each with MetaQuotes' own meaning, what usually causes it and
 * what a person can check, linked to the tool, term or lesson that explains
 * the idea. The rule the page keeps: the codes are the platform's, published
 * by its developer; what a particular broker's server returns depends on that
 * broker's settings; GIO4X's own settings are not yet published and are not
 * guessed here; 777 Raptor is not described. It explains and never instructs.
 */

const PATH = "/platforms/metatrader-5/order-errors";
const TITLE = "Why was this order rejected?";
const DESCRIPTION =
  "MetaTrader 5 trade server return codes explained in plain words: 10004 requote, 10014 invalid volume, 10016 invalid stops, 10019 not enough money, 10030 unsupported filling mode and more. What each means, what usually causes it and what can be checked.";

export const metadata = pageMeta({ title: "MetaTrader 5 order errors: return codes explained", description: DESCRIPTION, path: PATH });

/** A reference becomes a link only if the thing it names exists on this site. */
function resolve(ref: CodeRef): { label: string; href: string } | null {
  switch (ref.kind) {
    case "term": {
      const t = getTerm(ref.slug);
      return t ? { label: t.term, href: `/glossary/${t.slug}` } : null;
    }
    case "tool": {
      const t = getTool(ref.slug);
      return t ? { label: `${t.name} tool`, href: `/tools/${t.slug}` } : null;
    }
    case "lesson": {
      const l = getLesson(ref.slug);
      return l ? { label: `Lesson: ${l.title}`, href: `/academy/${l.slug}` } : null;
    }
    case "page":
      return { label: ref.label, href: ref.href };
  }
}

const rows: CodeRow[] = mt5Codes.map((c) => ({
  code: c.code,
  name: c.name,
  meaning: c.meaning,
  result: c.result === true,
  cause: c.cause,
  check: c.check,
  links: c.see.map(resolve).filter((l): l is { label: string; href: string } => l !== null),
}));

const first = mt5Codes[0].code;
const last = mt5Codes[mt5Codes.length - 1].code;

const scope: { t: string; d: string; pending?: boolean }[] = [
  { t: "The codes are MetaQuotes’ own", d: "Each number, its name and its short meaning are the ones MetaQuotes publishes for MetaTrader 5 in its MQL5 Reference, under “Trade Server Return Codes”. They describe the platform in general, at any broker." },
  { t: "The reason depends on the broker’s settings", d: "The platform supplies the codes; each broker’s server decides when one is returned. The minimum volume, the stops level, the filling policies, the trading sessions and the limits behind a refusal are all set by the broker, symbol by symbol." },
  { t: "GIO4X’s own server settings", d: "They are not yet published, so nothing on this page says what a GIO4X server returns or why. For an order on a GIO4X account, support can read the reason on the server.", pending: true },
  { t: "777 Raptor is not described here", d: "777 Raptor is a different platform with its own messages. They are not documented on this page, and these codes are not to be read across to it." },
];

const ideas: { id: string; t: string; d: string; links: { label: string; href: string }[] }[] = [
  {
    id: "idea-margin",
    t: "Margin",
    d: "Opening a leveraged position sets aside part of the account as margin. An order is refused for lack of money when the free margin, which is equity less the margin already in use, is smaller than the margin the new order needs. The sum is lots × contract size × price ÷ leverage.",
    links: [
      { label: "Margin tool", href: "/tools/margin" },
      { label: "Free Margin", href: "/glossary/free-margin" },
      { label: "Lesson: Leverage and margin", href: "/academy/what-is-leverage-and-margin" },
    ],
  },
  {
    id: "idea-volume",
    t: "Lot size and the volume step",
    d: "Every symbol has a smallest size, a largest size and a step between permitted sizes. A size has to be at least the minimum, at most the maximum, and a whole number of steps. A sizing sum often gives a figure in between, which then has to be rounded down to a size the symbol accepts.",
    links: [
      { label: "Position Size tool", href: "/tools/position-size" },
      { label: "Lot", href: "/glossary/lot" },
      { label: "Contract Size", href: "/glossary/contract-size" },
    ],
  },
  {
    id: "idea-stops",
    t: "The stops level",
    d: "A stop loss, a take profit or a pending order cannot be placed closer to the current price than a minimum distance the server sets for the symbol, called the stops level. Each also has a correct side: a stop loss on a buy sits below the price and on a sell above it. A second distance, the freeze level, decides when an order is too close to the market to be changed.",
    links: [
      { label: "Order Anatomy tool", href: "/tools/order-anatomy" },
      { label: "Stop Loss", href: "/glossary/stop-loss" },
      { label: "Trade Anatomy", href: "/labs/trade-anatomy" },
    ],
  },
  {
    id: "idea-hours",
    t: "Market hours",
    d: "A symbol trades only in its sessions. Outside them the server has no price to deal on and an order is refused. The sessions in a symbol’s specification are given in the server’s time, which may not be the time on your own clock.",
    links: [
      { label: "World Market Clock", href: "/markets/clock" },
      { label: "Market hours by region", href: "/guides" },
      { label: "Gap", href: "/glossary/gap" },
    ],
  },
];

const faq = [
  {
    q: "Where does MetaTrader 5 show the return code?",
    a: "When an order is refused, the terminal records it in the Journal tab of the Toolbox, usually in words rather than as a number. A program written in MQL5 receives the number itself, in the result of its trade request. The numbers on this page are those return codes, and the words beside each are the ones to look for in the Journal.",
  },
  {
    q: "What does error 10019, “not enough money”, mean?",
    a: "It means the free margin on the account was less than the margin the order needed. Free margin is equity less the margin already tied up by open positions. The margin an order needs depends on its size, the price and the account’s leverage: lots × contract size × price ÷ leverage.",
  },
  {
    q: "Why does an order fail with 10030, “invalid order filling type”?",
    a: "MetaTrader 5 has three filling policies: fill or kill, immediate or cancel, and return. Each symbol at each broker allows only some of them. An order that asks for a policy the symbol does not allow is refused with 10030. It is met most often with programs written for another broker’s symbols.",
  },
  {
    q: "Do these codes say why a GIO4X order was refused?",
    a: "They say what the platform’s code means in general. Why a particular server returned it depends on that broker’s settings for the symbol and the account, and GIO4X has not yet published its server settings. For an order on a GIO4X account, the support desk can read the reason on the server.",
  },
];

export default function OrderErrorsPage() {
  return (
    <>
      <JsonLd data={[webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION }), faqSchema(faq)]} />

      <PageHero
        quiet
        crumbs={[
          { name: "Platforms", href: "/platforms" },
          { name: "MetaTrader 5", href: "/platforms/metatrader-5" },
          { name: "Order errors", href: PATH },
        ]}
        eyebrow="MetaTrader 5 · Trade server return codes"
        title={TITLE}
        lead={`When MetaTrader 5 refuses an order it answers with a number. Here are ${rows.length} of those numbers, from ${first} to ${last}: what MetaQuotes says each means, what usually lies behind it, and what can be looked at.`}
      >
        <a href="#codes" className="btn btn-primary">
          Find a code
        </a>
        <a href="#ideas" className="btn btn-ghost">
          The four ideas behind most
        </a>
      </PageHero>

      {/* whose words these are */}
      <section className="section-quiet" aria-labelledby="scope">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Before reading a code</p>
            <h2 id="scope" className="h3 mt-13">
              What this page can and cannot say.
            </h2>
            <p className="mt-21 max-w-narrow text-ink-2">A code names the kind of refusal. It does not name the setting that caused it. That part belongs to whichever broker’s server answered.</p>
          </div>
          <ul className="border-t border-line-strong">
            {scope.map((s) => (
              <li key={s.t} className="border-b border-line py-21">
                <h3 className="h4 flex flex-wrap items-baseline justify-between gap-x-21 gap-y-5">
                  {s.t}
                  {s.pending && <NotPublished />}
                </h3>
                <p className="mt-8 max-w-measure text-sm text-ink-2">{s.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* the list */}
      <section id="codes" className="section hairline scroll-mt-[var(--header-h)] bg-paper" aria-labelledby="codes-h">
        <div className="wrap">
          <SectionHead
            eyebrow="The codes"
            title={<span id="codes-h">Type a number, or a word.</span>}
            lead="Each entry gives the code, the name MetaQuotes gives it, MetaQuotes’ own short meaning, what usually causes it and what can be checked. Only codes whose meaning is certain are listed; a code that is missing is one this page does not describe."
          />
          <div className="mt-34">
            <OrderErrors rows={rows} />
          </div>
          <DataNote status="reference" source="MetaQuotes, MQL5 Reference, “Trade Server Return Codes”" className="mt-21">
            Numbers, names and meanings are MetaQuotes’ published ones for the platform. The causes and checks are general explanation, not a statement about any broker’s server. {educationalNote}
          </DataNote>
        </div>
      </section>

      {/* the ideas */}
      <section id="ideas" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="ideas-h">
        <div className="wrap">
          <SectionHead eyebrow="Behind the numbers" title={<span id="ideas-h">Four ideas explain most refusals.</span>} lead="Each is explained more fully elsewhere on this site. These are the short versions, with the way to the long ones." />
          <ol className="mt-34 grid gap-x-55 gap-y-34 md:grid-cols-2 lg:mt-55">
            {ideas.map((x, i) => (
              <li key={x.id} id={x.id} className="scroll-mt-[calc(var(--header-h)+1.3125rem)] border-t border-line-strong pt-21">
                <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h4 mt-5">{x.t}</h3>
                <p className="mt-8 max-w-measure text-sm text-ink-2">{x.d}</p>
                <ul className="mt-8 flex flex-wrap gap-x-13 gap-y-2 text-sm">
                  {x.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link inline-flex min-h-[2.75rem] items-center md:min-h-[2.125rem]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-34 max-w-measure text-sm text-ink-2">
            The minimum volume, volume step, stops level, freeze level, filling policies and sessions of a symbol are shown in MetaTrader 5 in the symbol’s specification, opened by right-clicking the symbol in Market Watch. They are the values of the server the terminal is connected to. The{" "}
            <Link href="/labs/simulator" className="link">
              Practice desk
            </Link>{" "}
            lets an order be put together on invented prices, with nothing at stake.
          </p>
        </div>
      </section>

      {/* questions */}
      <section className="section-quiet hairline bg-paper" aria-labelledby="codes-faq">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">Questions people ask</p>
            <h2 id="codes-faq" className="h3 mt-13">
              About the codes.
            </h2>
          </div>
          <dl className="border-t border-line">
            {faq.map((f) => (
              <div key={f.q} className="border-b border-line py-21">
                <dt className="h4">{f.q}</dt>
                <dd className="mt-8 max-w-measure text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* trademark + risk */}
      <section className="section-quiet hairline" aria-label="Notices">
        <div className="wrap grid gap-34 md:grid-cols-2 md:gap-55">
          <div>
            <h2 className="label">Trademark notice</h2>
            <p className="mt-13 max-w-measure text-sm text-ink-2">{mt5Trademark}</p>
          </div>
          <div>
            <h2 className="label">Risk warning</h2>
            <p className="mt-13 text-sm text-ink-2">{riskWarning}</p>
            <Link href="/legal/risk" className="go mt-13 min-h-[2.75rem] md:min-h-0">
              Risk disclosure
            </Link>
          </div>
        </div>
      </section>

      <NextSteps
        items={[
          { kind: "Platforms", label: "MetaTrader 5", href: "/platforms/metatrader-5", note: "What the platform is, and what GIO4X has still to publish." },
          { kind: "Tools", label: "Margin", href: "/tools/margin", note: "What a position ties up, at any leverage." },
          { kind: "Tools", label: "Order Anatomy", href: "/tools/order-anatomy", note: "Market, limit and stop orders, visualised." },
          { kind: "Help", label: "Contact support", href: "/contact", note: "For an order on your own account." },
        ]}
      />
    </>
  );
}
