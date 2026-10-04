import Link from "next/link";
import { AllocationDemo } from "@/components/funding/AllocationDemo";
import { MODES, ROUNDING_RULE, formatBp, formatMinor, plan, type Destination, type Plan, type Request } from "@/components/funding/allocation";
import { JsonLd } from "@/components/seo/JsonLd";
import { AskLine, PendingList, RiskNote } from "@/components/trading/Blocks";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { hasTerm } from "@/data/glossary";
import { platforms } from "@/data/platforms";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * Two platforms, one wallet: how a net deposit is divided between a
 * MetaTrader 5 account and a 777 Raptor account.
 *
 * The rule it keeps: the page explains a design and demonstrates its
 * arithmetic. It states no GIO4X fee, minimum, leverage value, currency or
 * processing time, because none of those is published for this journey; each
 * is listed as not yet published. Every figure on the page is an example, and
 * the worked examples are computed by the same engine the test script proves
 * (scripts/test-allocation.mjs), so the words and the arithmetic cannot drift.
 */

const PATH = "/trading/funding/allocation";
const TITLE = "Two platforms, one wallet: how funds are divided";
const DESCRIPTION =
  "How one funding wallet can be divided between a MetaTrader 5 account and a 777 Raptor account: all to one, an equal split, percentages or exact amounts, with the rounding rule, pending funds and separate margin explained. A demonstration with example figures; it opens no account and moves no money.";

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH });

const MT5: Destination = { id: "mt5", label: platforms.mt5.name, minMinor: 0 };
const RAPTOR: Destination = { id: "raptor", label: platforms.raptor.name, minMinor: 0 };
const THIRD: Destination = { id: "third", label: "A third account", minMinor: 0 };

/** The worked examples, in whole cents. The results in the table are the engine's, not typed by hand. */
const worked: { what: string; how: string; netMinor: number; dests: Destination[]; request: Request }[] = [
  { what: "All to one", how: "Everything to one account.", netMinor: 100000, dests: [MT5, RAPTOR], request: { mode: "single", to: "mt5" } },
  { what: "Equal split", how: "1,000.00 ÷ 2.", netMinor: 100000, dests: [MT5, RAPTOR], request: { mode: "equal" } },
  { what: "75% and 25%", how: "1,000.00 × 75% and 1,000.00 × 25%.", netMinor: 100000, dests: [MT5, RAPTOR], request: { mode: "percent", basisPoints: { mt5: 7500, raptor: 2500 } } },
  { what: "Equal split with an odd cent", how: "1,000.01 ÷ 2 is 500.005 each. Rounded down that is 500.00 and 500.00, with one cent over; it goes to the first account.", netMinor: 100001, dests: [MT5, RAPTOR], request: { mode: "equal" } },
  { what: "Exact amounts", how: "600.00 + 250.00 = 850.00, so 150.00 is not allocated.", netMinor: 100000, dests: [MT5, RAPTOR], request: { mode: "exact", amounts: { mt5: 60000, raptor: 25000 } } },
  { what: "Three equal parts", how: "100.00 ÷ 3 is 33.33 each with one cent over; it goes to the first account.", netMinor: 10000, dests: [MT5, RAPTOR, THIRD], request: { mode: "equal" } },
];
const results: Plan[] = worked.map((w) => plan({ grossMinor: w.netMinor, feeMinor: 0 }, w.dests, w.request));

/** A split the engine refuses: 90% and 10% of 1,000.00 where the second account's example minimum is 250.00. */
const refused = plan({ grossMinor: 100000, feeMinor: 0 }, [MT5, { ...RAPTOR, minMinor: 25000 }], { mode: "percent", basisPoints: { mt5: 9000, raptor: 1000 } });
const refusal = refused.issues.find((i) => i.code === "below-minimum");

const things = [
  {
    t: "The wallet",
    d: "Where a deposit arrives and waits. It belongs to the profile, not to a platform. Money in the wallet is not in the market: it backs no position and it is margin for nothing.",
  },
  {
    t: "A trading account",
    d: "A balance on one platform, with its own login, its own leverage setting and its own margin. Positions are opened against that balance and against nothing else. A person can hold an account on one platform or on both.",
  },
  {
    t: "A platform",
    d: `The software an account is traded through: ${platforms.mt5.name} or ${platforms.raptor.name}. A platform sees only the accounts that are on it. It does not see the wallet, and it does not see an account on the other platform.`,
  },
];

const pendingFacts = [
  { label: "Permitted leverage", why: "The demonstration uses 1:50, 1:100, 1:200 and 1:500, the steps most brokers offer up to GIO4X’s published ceiling. These are provisional until confirmed for each platform." },
  { label: "Minimum funding amount", why: "The demonstration starts from the lowest published minimum deposit. Whether each platform account has its own minimum is not yet confirmed." },
  { label: "Account types and currencies per platform", why: "Which account types can be opened on which platform, and in which currencies." },
  { label: "Fees and conversion", why: "Any charge for a deposit or a transfer, and how and at what cost one currency becomes another." },
  { label: "Processing times", why: "How long a deposit stays pending, and how long a transfer between the wallet and an account takes." },
];

const faq = [
  {
    q: "Can one deposit fund both a MetaTrader 5 account and a 777 Raptor account?",
    a: "That is the design this page describes: one profile, one funding wallet, and a trading account on either platform or on both. A deposit arrives in the wallet and the net amount can then be divided: all to one account, equally, by percentage or by exact amounts, with anything not allocated staying in the wallet. The page demonstrates the arithmetic with example figures only. Accounts are opened and funded in the client portal, and the conditions that apply there have not yet been published.",
  },
  {
    q: "Does money on one platform protect an account on the other from a margin call?",
    a: "No. Each trading account has its own balance and its own margin. Spare funds on a MetaTrader 5 account do nothing for a 777 Raptor account, and the other way round, and money still in the wallet protects neither. A combined total is only a sum: it is not shared collateral.",
  },
  {
    q: "What happens to an odd cent when a split does not divide exactly?",
    a: "Nothing is lost and nothing is invented. Each share is rounded down to a whole cent, and the cents left over are given one at a time to the destination with the largest remainder; where remainders are equal, the first destination listed takes the cent. So 1,000.01 split equally is 500.01 and 500.00, and the allocations plus whatever stays in the wallet always equal the net amount exactly.",
  },
];

export default function AllocationPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        quiet
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Funding and withdrawals", href: "/trading/funding" },
          { name: "Dividing funds", href: PATH },
        ]}
        eyebrow="Funding · Demonstration"
        title={TITLE}
        lead="One profile and one wallet can stand behind a trading account on MetaTrader 5, on 777 Raptor, or on both. This page explains how a deposit is divided between them, and lets you try the arithmetic with example figures. It opens no account and moves no money."
      >
        <Link href="#demo" className="btn btn-primary">
          Try the demonstration
        </Link>
        <Link href="/trading/funding" className="btn btn-ghost">
          What is published about funding
        </Link>
      </PageHero>

      {/* wallet, account, platform */}
      <section className="section" aria-labelledby="three-things">
        <div className="wrap">
          <SectionHead eyebrow="Three different things" title={<span id="three-things">A wallet, a trading account and a platform.</span>} lead="They are easy to run together, and most confusion about funding comes from doing so." />
          <ol className="mt-34 grid border-l border-t border-line md:grid-cols-3 lg:mt-55">
            {things.map((x, i) => (
              <li key={x.t} className="border-b border-r border-line bg-bg p-21 lg:p-34">
                <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h4 mt-13">{x.t}</h3>
                <p className="mt-5 text-sm text-ink-2">{x.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-21 max-w-measure text-sm text-ink-2">
            Moving money from the wallet to a trading account is an allocation. It is a transfer between two places that belong to the same person, not a payment to anybody else. What each platform documents is set out in the{" "}
            <Link href="/platforms/compare" className="link">
              platform comparison
            </Link>
            .
          </p>
        </div>
      </section>

      {/* the demonstration */}
      <section id="demo" data-machine className="section hairline scroll-mt-[var(--header-h)] bg-paper" aria-labelledby="demo-h">
        <div className="wrap">
          <div className="max-w-measure">
            <p className="eyebrow">The demonstration</p>
            <h2 id="demo-h" className="h2 mt-13">
              From a profile to funded accounts.
            </h2>
            <p className="lead mt-13">Choose the accounts, type an example deposit, divide it, review it and confirm it. Then make a transfer fail, and see what an honest report of that looks like.</p>
          </div>
          <div className="mt-34 min-w-0 max-w-[60rem]">
            <AllocationDemo />
          </div>
          <div className="mt-21">
            <DataNote status="simulation">Example figures typed by you, worked out in your browser. Nothing is sent and nothing is stored. {educationalNote}</DataNote>
          </div>
        </div>
      </section>

      {/* the four modes */}
      <section className="section hairline" aria-labelledby="modes">
        <div className="wrap">
          <SectionHead eyebrow="Four ways to divide" title={<span id="modes">The modes, with the arithmetic.</span>} lead="Every split is taken on the net amount: the deposit, less any fee, after any conversion. The examples use a net amount with no fee so that the division is easy to check." />
          <dl className="mt-34 grid gap-x-55 border-t border-line-strong md:grid-cols-2">
            {MODES.map((m) => (
              <div key={m.key} className="border-b border-line py-21">
                <dt className="h4">{m.name}</dt>
                <dd className="mt-5 max-w-measure text-sm text-ink-2">
                  {m.line}
                  {m.key === "percent" && " More than 100% in total is refused."}
                  {m.key === "exact" && " More than the net amount in total is refused."}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="h4 mt-34">Worked examples</h3>
          <div className="mt-13 overflow-x-auto">
            <table className="table-gx min-w-[44rem]">
              <caption className="sr-only">Worked examples of dividing a net amount, with example figures</caption>
              <thead>
                <tr>
                  <th scope="col">Example</th>
                  <th scope="col" className="num-right">
                    Net amount
                  </th>
                  <th scope="col">To each account</th>
                  <th scope="col" className="num-right">
                    Stays in the wallet
                  </th>
                  <th scope="col">The working</th>
                </tr>
              </thead>
              <tbody>
                {worked.map((w, i) => {
                  const r = results[i]!;
                  return (
                    <tr key={w.what}>
                      <th scope="row" className="!normal-case !tracking-normal !text-ink">
                        {w.what}
                      </th>
                      <td className="num num-right">{formatMinor(r.net.netMinor)}</td>
                      <td className="num">
                        {r.lines.map((l) => formatMinor(l.amountMinor)).join(" · ")}
                        <span className="block text-xs text-ink-3">{r.lines.map((l) => formatBp(l.shareBp)).join(" · ")}</span>
                      </td>
                      <td className="num num-right">{formatMinor(r.walletMinor)}</td>
                      <td className="text-sm text-ink-2">
                        {w.how}
                        {r.rounding && <span className="block text-xs text-ink-3">Odd cent reported: to {r.rounding.to.map((t) => t.label).join(", ")}.</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-13 max-w-measure text-xs text-ink-3">
            Example figures in an unnamed currency, in the order {platforms.mt5.name}, {platforms.raptor.name} and, in the last row, a third account added only to show a three-way division. The percentages under each amount are worked back from the amounts, to two decimal places, which is why three equal parts read 33.34% and 33.33%.
          </p>

          {refusal && (
            <div className="mt-34 max-w-measure border-l border-line-strong pl-13">
              <h3 className="h4">A split that is refused</h3>
              <p className="mt-5 text-sm text-ink-2">
                Suppose the second account will not accept less than 250.00 (an example minimum, not a GIO4X condition), and 1,000.00 is divided 90% and 10%. The second account would receive {formatMinor(refused.lines[1]!.amountMinor)}, which is {formatMinor(refusal.shortfallMinor ?? 0)} short. The split is not adjusted to make it fit. It is refused with the reason and the shortfall, and with what can be done instead: {refusal.options.join(" ")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* rounding, pending, withdrawals */}
      <section className="section hairline bg-paper" aria-labelledby="rules">
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.125rem)]">
            <p className="eyebrow">The rules behind it</p>
            <h2 id="rules" className="h2 mt-13">
              Cents, pending funds and getting money back out.
            </h2>
            <p className="lead mt-21">Three places where a funding journey can quietly go wrong, and what this design does at each.</p>
          </div>
          <ul className="border-t border-line-strong">
            <li className="flat border-b border-line py-21">
              <h3 className="h4">How rounding is handled</h3>
              <p className="mt-5 max-w-measure text-sm text-ink-2">
                Every amount is held as a whole number of cents, so there is never a fraction to lose. {ROUNDING_RULE} The cent is reported wherever it lands, and the allocations plus what stays in the wallet always equal the net amount exactly. A conversion is rounded down to a whole cent once, before any split, and says so.
              </p>
            </li>
            <li className="flat border-b border-line py-21">
              <h3 className="h4">What happens to pending funds</h3>
              <p className="mt-5 max-w-measure text-sm text-ink-2">
                A deposit that has been sent but has not arrived is pending. It can be seen, and a split can be worked out against it, but none of it can be allocated: a plan made on pending funds is refused, and the only option given is to wait. Money cannot be on a platform before it is in the wallet. How long a deposit stays pending is one of the things not yet published; the general route a payment takes is described under{" "}
                <Link href="/trading/funding#path" className="link">
                  the path of a payment
                </Link>
                .
              </p>
            </li>
            <li className="flat border-b border-line py-21">
              <h3 className="h4">When one transfer fails</h3>
              <p className="mt-5 max-w-measure text-sm text-ink-2">
                Each account is funded by its own transfer, and each can succeed or fail on its own. A transfer that fails moves nothing: its money is still in the wallet, the other transfer is reported as done, and the wallet and the accounts still add up to the net amount. A plan carries a key, so pressing confirm twice does not fund an account twice; a retry sends only what failed.
              </p>
            </li>
            <li className="flat border-b border-line py-21">
              <h3 className="h4">Withdrawals, in general terms</h3>
              <p className="mt-5 max-w-measure text-sm text-ink-2">
                Stated as the design intention, not as a published GIO4X procedure. Money leaves by the way it came: from a trading account back to the wallet, and from the wallet out. Funds committed as margin to open positions are not available to move or to withdraw; only what is free is. A position is never closed automatically to meet a withdrawal request: a request for more than is free is refused with the reason, and whether to close anything remains the account holder’s decision. (A{" "}
                {hasTerm("stop-out") ? (
                  <Link href="/glossary/stop-out" className="link">
                    stop out
                  </Link>
                ) : (
                  "stop out"
                )}{" "}
                is a different thing: it follows from an account’s margin level, not from a withdrawal request.) What GIO4X has published about withdrawals is on the{" "}
                <Link href="/trading/funding" className="link">
                  funding and withdrawals
                </Link>{" "}
                page.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* not yet published */}
      <section className="section hairline" aria-labelledby="unpublished">
        <div className="wrap grid gap-55 lg:grid-cols-phi lg:gap-89">
          <div>
            <p className="eyebrow">Not yet published</p>
            <h2 id="unpublished" className="h2 mt-13">
              What the real journey depends on.
            </h2>
            <p className="lead mt-21 max-w-measure">The demonstration uses provisional values, set in line with common practice among brokers, where GIO4X’s own have not been confirmed for this journey. Each is marked provisional and may change.</p>
            <p className="mt-21 max-w-measure text-sm text-ink-2">
              The client portal is a separate application. Its account opening, its payments and its link to each platform’s balances are not described here, and this page does not connect to any of them. The full list of what this site does and does not publish is under{" "}
              <Link href="/trust/transparency" className="link">
                What we disclose
              </Link>
              .
            </p>
          </div>
          <div>
            <PendingList items={pendingFacts} />
            <AskLine className="mt-13" />
          </div>
        </div>
      </section>

      {/* questions */}
      <section className="section-quiet hairline bg-paper" aria-labelledby="alloc-faq">
        <div className="wrap phi items-start">
          <div>
            <p className="eyebrow">Questions people ask</p>
            <h2 id="alloc-faq" className="h3 mt-13">
              About one wallet and two platforms.
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

      <RiskNote text={riskWarning} />

      <PunchLine k="funding" />

      <NextSteps
        items={[
          { kind: "Platforms", label: "Compare platforms", href: "/platforms/compare", note: "MetaTrader 5 and 777 Raptor, side by side." },
          { kind: "Trading", label: "Funding and withdrawals", href: "/trading/funding", note: "What is published about money in and out." },
          { kind: "Tool", label: "Margin calculator", href: "/tools/margin", note: "What leverage does to the margin a position needs." },
          { kind: "Legal", label: "Risk disclosure", href: "/legal/risk", note: "Read this before trading with leverage." },
        ]}
      />
    </>
  );
}
