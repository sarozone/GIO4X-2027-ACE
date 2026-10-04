import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PendingList, RiskNote } from "@/components/trading/Blocks";
import { DemoVsLive } from "@/components/trading/demo/DemoVsLive";
import { ProvisionalList } from "@/components/trading/demo/Provisional";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { destinationAddress, portals } from "@/config/destinations";
import { educationalNote, riskWarning } from "@/config/legal";
import { hasTerm } from "@/data/glossary";
import { PROVISIONAL_NOTE } from "@/data/trading";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * DEMO ACCOUNT — what one is, what it is for, and how far it is from a live
 * account.
 *
 * The rule this page keeps: GIO4X's demo terms are not yet fixed, so the two
 * that are stated (how long it lasts, what it is funded with) are stated as
 * provisional, each with the site's provisional sentence beside it, and the
 * rest are listed as not yet published. A demo is opened in the client portal
 * through the registry's account-opening destination and nowhere else: when
 * that is not configured the page says so and links to nothing. The Practice
 * desk is a simulation on a web page and is never called a demo account.
 */

const PATH = "/trading/demo";
const TITLE = "Demo account: what it is and how it differs from live trading";
const DESCRIPTION =
  "What a demo account is and what it is for, how its fills, liquidity, costs and pressure differ from a live account, what to practise on one and in what order, and GIO4X’s provisional demo terms.";

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH });

/** Provisional (docs/WAITING-FOR-ABE.md, D9 and section H): common practice among brokers, and what the earlier GIO4X site stated. */
const DEMO_DAYS = 30;
const DEMO_FUNDS = "100,000";

const terms = [
  { term: "How long it lasts", detail: `A demo account is valid for ${DEMO_DAYS} days from the day it is opened.` },
  { term: "What it is funded with", detail: `A demo account is opened with ${DEMO_FUNDS} in virtual funds. They are not money: they cannot be withdrawn, and nothing gained or lost with them is real.` },
];

const pending = ["The platforms a demo account is offered on", "The currency the virtual funds are counted in", "Whether a demo can be renewed, reset or topped up", "Whether demo conditions match those of each live account"];

const differs = [
  {
    t: "Fills.",
    d: "A demo order is usually filled whole, at once, at the price on the screen. A live order is filled at the price available when it reaches the market, which may have moved in the moment between the click and the fill. The difference is slippage, and it can go either way.",
  },
  {
    t: "Liquidity.",
    d: "Nobody has to be found to take the other side of a demo order, so its size makes no difference. In a live market only so much is on offer at each price. A large order, or an ordinary one in a quiet hour or around a news release, can be filled in parts at several prices.",
  },
  {
    t: "Emotions.",
    d: "Virtual funds cannot be lost, so a loss on a demo is not felt. The decision to hold, cut or add is a different decision when the money is your own, and a steady hand on a demo says little about a steady hand afterwards.",
  },
  {
    t: "Costs.",
    d: "A demo may show a spread that holds still where a live one widens, and it may not apply swap or commission as a live account does. A balance far larger than the sum a person would deposit also hides what costs and position sizes mean on a real one.",
  },
];

const compare: { row: string; demo: string; desk: string }[] = [
  { row: "What it is", demo: "An account on a trading platform, funded with virtual money.", desk: "A simulation that runs on a page of this website." },
  { row: "The prices", demo: "Usually the platform’s own quotes, for the instruments it lists.", desk: "An invented price, generated in your browser. No real instrument." },
  { row: "Getting one", demo: "Opened in the client portal, with a registration.", desk: "Nothing to open: no account and no registration." },
  { row: "What it teaches", demo: "The platform itself: its order ticket, its charts and its order types.", desk: "The mechanics of a trade, with every calculation shown." },
  { row: "What it is not", demo: "A live account. Fills, costs and pressure differ.", desk: "A demo account, a platform or a market." },
];

const order: { t: string; d: string; links: { href: string; label: string }[] }[] = [
  {
    t: "The platform, before any strategy.",
    d: "Where the order ticket is, what each field means, how an order is changed and how a position is closed. A mistake with a button is cheapest when nothing is at stake.",
    links: [
      { href: "/tools/order-anatomy", label: "Order anatomy" },
      { href: "/academy/first-trade", label: "Your first trade" },
    ],
  },
  {
    t: "Size.",
    d: "Working out how large a position is from the distance to the stop and the amount put at risk, instead of typing a round number of lots.",
    links: [
      { href: "/tools/position-size", label: "Position size calculator" },
      { href: "/academy/position-sizing-strategies", label: "Lesson: position sizing" },
    ],
  },
  {
    t: "Margin and leverage.",
    d: "How much of the balance a position sets aside, and how quickly the margin level falls when the price moves against it.",
    links: [
      { href: "/tools/margin", label: "Margin calculator" },
      { href: "/academy/what-is-leverage-and-margin", label: "Lesson: leverage and margin" },
    ],
  },
  {
    t: "Stops and targets.",
    d: "Placing a stop loss and a take profit with every order, and reading the trade as a ratio of what is risked to what is sought.",
    links: [
      { href: "/tools/risk-reward", label: "Risk / reward" },
      { href: "/academy/risk-reward-ratio-explained", label: "Lesson: the risk-reward ratio" },
    ],
  },
  {
    t: "What a trade costs.",
    d: "The spread paid on entry, any commission, and the swap on a position held overnight, counted before the trade and checked after it.",
    links: [{ href: "/tools/cost-lab", label: "Cost Lab" }],
  },
  {
    t: "A record.",
    d: "Writing down why each trade was taken and what happened. A demo with no record teaches the buttons and little else.",
    links: [{ href: "/journal", label: "Journal" }],
  },
  {
    t: "Yourself, as far as a demo allows.",
    d: "Following the plan when a trade goes wrong is the one thing a demo cannot fully rehearse. It is still worth noticing where the plan was dropped.",
    links: [{ href: "/academy/managing-trading-psychology", label: "Lesson: trading psychology" }],
  },
];

const faq = [
  {
    q: "What is a demo trading account?",
    a: "A demo account is a practice account on a trading platform. It is funded with virtual money, so orders can be placed, managed and closed without any real money being gained or lost. It is for learning how a platform and the mechanics of a trade work.",
  },
  {
    q: "Is a demo account the same as live trading?",
    a: "No. A demo order is usually filled whole at the price shown, while a live order can slip or fill in parts when the market is thin. A demo may not reflect live costs, and decisions made with virtual funds are not the decisions made with your own money. A result on a demo says nothing about a result on a live account.",
  },
  {
    q: "How long does a GIO4X demo account last, and what is it funded with?",
    a: `A GIO4X demo account is valid for ${DEMO_DAYS} days and is opened with ${DEMO_FUNDS} in virtual funds. ${PROVISIONAL_NOTE}`,
  },
];

export default function DemoAccountPage() {
  const dest = portals.openAccount;

  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Demo account", href: PATH },
        ]}
        eyebrow="Demo account"
        title="The demo account: a rehearsal, with nothing at stake."
        lead="A demo account is a practice account on a trading platform, funded with virtual money. It teaches the platform and the mechanics of a trade. It does not show what trading with your own money is like, and this page says where the two part."
      >
        <a href="#open" className="btn btn-primary">
          Where a demo is opened
        </a>
        <a href="#fills" className="btn btn-ghost">
          The same order, twice
        </a>
      </PageHero>

      <section className="section" aria-labelledby="what-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">What it is</p>
            <h2 id="what-h" className="h2 mt-13">
              The real platform, with pretend money.
            </h2>
          </div>
          <div className="grid gap-13 text-ink-2">
            <p className="lead">A demo account behaves like a trading account in every way but one: the balance is virtual. Orders are placed on the same ticket, positions appear in the same window, and margin, profit and loss are worked out by the same arithmetic.</p>
            <p>
              That makes it the place to learn what cannot be learned by reading: where things are on the platform, what an order type does when the price reaches it, how a{" "}
              {hasTerm("stop-loss") ? (
                <Link href="/glossary/stop-loss" className="link">
                  stop loss
                </Link>
              ) : (
                "stop loss"
              )}{" "}
              is moved, and how{" "}
              {hasTerm("margin") ? (
                <Link href="/glossary/margin" className="link">
                  margin
                </Link>
              ) : (
                "margin"
              )}{" "}
              is set aside and released. It is also where a set of rules can be followed for a few weeks to see whether it can be followed at all.
            </p>
            <p>What it is not for is finding out whether trading will go well. A demo result is produced without the two things that decide most live results: a market that has to be dealt with, and money that can be lost.</p>
          </div>
        </div>
      </section>

      <section id="fills" className="section hairline bg-paper scroll-mt-[var(--header-h)]" aria-labelledby="fills-h" data-machine>
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="eyebrow">An explainer</p>
            <h2 id="fills-h" className="h2 mt-13">
              The same order, twice.
            </h2>
            <p className="lead mt-13">One order is sent on a demo and on a live account. Make the market thinner and watch what the live fill does while the demo does not change.</p>
            <DataNote status="simulation" className="mt-21">
              Invented figures on an example market. {educationalNote}
            </DataNote>
          </div>
          <div className="min-w-0">
            <DemoVsLive />
          </div>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="differs-h">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">Demo and live</p>
            <h2 id="differs-h" className="h2 mt-13">
              Four things a demo leaves out.
            </h2>
            <p className="mt-21 text-ink-2">
              None of this is a fault in a demo: it is what a practice account is. The same four differences apply, more strongly, to a simulation, and the Practice desk sets them out for itself under{" "}
              <Link href="/labs/simulator#sim-differs" className="link">
                Real markets behave differently
              </Link>
              .
            </p>
            <p className="mt-13 text-ink-2">
              {hasTerm("slippage") ? (
                <>
                  The glossary has the terms:{" "}
                  <Link href="/glossary/slippage" className="link">
                    slippage
                  </Link>
                  {hasTerm("liquidity") ? (
                    <>
                      {" "}
                      and{" "}
                      <Link href="/glossary/liquidity" className="link">
                        liquidity
                      </Link>
                    </>
                  ) : null}
                  .
                </>
              ) : (
                "The glossary has the terms used here."
              )}
            </p>
          </div>
          <ul className="border-t border-line">
            {differs.map((r) => (
              <li key={r.t} className="border-b border-line py-21">
                <h3 className="h4">{r.t}</h3>
                <p className="mt-8 text-ink-2">{r.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="desk-h">
        <div className="wrap">
          <SectionHead
            eyebrow="Not the same thing"
            title={<span id="desk-h">A demo account and the Practice desk.</span>}
            lead="This website has a Practice desk. It is a simulation on a web page, on an invented price, and it is not a demo account. Each is useful for something different."
            action={
              <Link href="/labs/simulator" className="go min-h-[2.75rem]">
                Open the Practice desk
              </Link>
            }
          />
          <div className="mt-34 overflow-x-auto">
            <table className="table-gx min-w-[40rem]">
              <caption className="sr-only">A demo account compared with the Practice desk on this website</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[22%]">
                    <span className="sr-only">Point of comparison</span>
                  </th>
                  <th scope="col">Demo account</th>
                  <th scope="col">Practice desk</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((c) => (
                  <tr key={c.row}>
                    <th scope="row" className="!align-top !py-13 !text-[0.8125rem] !font-normal !normal-case !tracking-normal">
                      {c.row}
                    </th>
                    <td className="!h-auto !py-13 !align-top text-sm text-ink-2">{c.demo}</td>
                    <td className="!h-auto !py-13 !align-top text-sm text-ink-2">{c.desk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section hairline" aria-labelledby="order-h">
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="eyebrow">What to practise</p>
            <h2 id="order-h" className="h2 mt-13">
              In this order.
            </h2>
            <p className="lead mt-13">The order runs from what a demo teaches well to what it teaches least. Each step links to the lesson or the tool that explains it.</p>
          </div>
          <ol className="border-t border-line-strong">
            {order.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[2.75rem_1fr] gap-x-13 border-b border-line py-21 sm:grid-cols-[3.4375rem_1fr]">
                <span className="num pt-3 text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="h4">{s.t}</h3>
                  <p className="mt-5 text-ink-2">{s.d}</p>
                  <p className="mt-8 flex flex-wrap gap-x-21 gap-y-3">
                    {s.links.map((l) => (
                      <Link key={l.href} href={l.href} className="go min-h-[2.75rem] sm:min-h-0">
                        {l.label}
                      </Link>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="terms-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">GIO4X demo terms</p>
            <h2 id="terms-h" className="h2 mt-13">
              What is set, for now.
            </h2>
            <p className="mt-21 text-ink-2">GIO4X has not yet fixed its demo terms. The two below follow common practice among brokers and are marked provisional; the rest have not been published.</p>
          </div>
          <div className="grid gap-34">
            <ProvisionalList items={terms} />
            <div>
              <h3 className="label">Not yet published</h3>
              <PendingList items={pending} className="mt-13" />
            </div>
          </div>
        </div>
      </section>

      <section id="open" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="open-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Opening one</p>
            <h2 id="open-h" className="h2 mt-13">
              Where a demo is opened.
            </h2>
            <p className="mt-21 text-ink-2">A demo account is opened in the GIO4X client portal, after registering there. It is not opened on this website. GIO4X will never ask for your password or a one-time security code by email or message.</p>
          </div>
          <div className="panel p-21 sm:p-34">
            {dest.status === "CONFIGURED" ? (
              <>
                <h3 className="h3">Continue to the client portal</h3>
                <p className="mt-8 text-ink-2">Registration is completed in the portal, at the address below. A demo account is opened from there.</p>
                <p className="mt-21 flex flex-wrap items-center gap-x-13 gap-y-5 border-y border-line py-13">
                  <span className="num font-medium text-ink">{destinationAddress(dest.url)}</span>
                  <span className="inline-flex items-center gap-5 text-xs font-medium text-pos">
                    <span aria-hidden>{"✓"}</span> Verified GIO4X destination
                  </span>
                </p>
                <a href={dest.url} rel="noopener noreferrer" className="btn btn-primary mt-21">
                  Go to the client portal
                </a>
              </>
            ) : (
              <>
                <p className="state state-pre">Portal not connected yet</p>
                <h3 className="h3 mt-13">The client portal is not connected to this website yet.</h3>
                <p className="mt-8 text-ink-2">A demo account cannot be opened from this page until it is. No address is shown here in the meantime, and none should be trusted from elsewhere without checking it.</p>
                <p className="mt-21 flex flex-wrap gap-x-34 gap-y-3">
                  <Link href="/open-account" className="go min-h-[2.75rem]">
                    Register your interest
                  </Link>
                  <Link href="/trust/verify" className="go min-h-[2.75rem]">
                    Verify a link
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="faq-h">
        <div className="wrap">
          <p className="eyebrow">Questions people ask</p>
          <h2 id="faq-h" className="h2 mt-13">
            About demo accounts
          </h2>
          <dl className="mt-21 grid gap-21">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-5 text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <RiskNote text={riskWarning} />

      <PunchLine k="labs" />

      <NextSteps
        items={[
          { kind: "Labs", label: "Practice desk", href: "/labs/simulator", note: "A simulation on an invented price. Not a demo account." },
          { kind: "Academy", label: "Your first trade", href: "/academy/first-trade", note: "The Academy’s walk through a first trade." },
          { kind: "Trading", label: "Account types", href: "/trading/accounts", note: "Classic, Premium and ECN compared." },
          { kind: "Tools", label: "Position size", href: "/tools/position-size", note: "The first thing worth practising." },
        ]}
      />
    </>
  );
}
