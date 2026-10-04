import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PendingList, RiskNote } from "@/components/trading/Blocks";
import { ProvisionalList } from "@/components/trading/demo/Provisional";
import { NightsHeld } from "@/components/trading/swapfree/NightsHeld";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { educationalNote, riskWarning } from "@/config/legal";
import { accounts } from "@/data/accounts";
import { hasTerm } from "@/data/glossary";
import { PROVISIONAL_NOTE } from "@/data/trading";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

/**
 * SWAP-FREE ACCOUNTS — what swap is, what an account without it changes and
 * what it leaves exactly as it was.
 *
 * The rules this page keeps. GIO4X's published position on swap is read from
 * data/accounts.ts for each account and shown as it stands there, word for
 * word. The terms on which a swap-free option is offered are not yet fixed:
 * they are stated in line with common practice, each with the site's
 * provisional sentence beside it. No fee, no number of nights and no list of
 * instruments is stated, because none is set. And the page gives no religious
 * ruling and cites no authority: it describes how the account works.
 */

const PATH = "/trading/swap-free";
const TITLE = "Swap-free (Islamic) accounts: how they work";
const DESCRIPTION =
  "What overnight swap is, why some clients cannot pay or receive interest, what a swap-free account changes and what it does not, and GIO4X’s published position and provisional terms.";

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH });

/** Provisional (docs/WAITING-FOR-ABE.md, D4 and section H): in line with common practice among brokers. */
const terms = [
  { term: "How it is obtained", detail: "A swap-free option is available on request and is subject to approval." },
  { term: "Whom it is for", detail: "It is intended for clients who cannot pay or receive interest for reasons of religious belief." },
  { term: "When it can end", detail: "It may be withdrawn where it is used to exploit the absence of swap." },
];

const notSet = [
  { label: "Any administrative charge applied in place of swap", why: "None has been set, so none is stated." },
  { label: "Any limit on the number of nights a position may be held without swap", why: "None has been set." },
  { label: "The instruments a swap-free option covers", why: "No list has been published." },
  { label: "How a request is made and what it must contain", why: "Not yet published." },
];

const changes = [
  { t: "No swap at rollover.", d: "A position held past the end of the trading day is not charged swap and is not credited with it. Both go: an account that pays no interest receives none either." },
  { t: "The three-night adjustment goes with it.", d: "The night on which an ordinary account applies three nights’ swap at once is, on a swap-free account, a night like any other." },
];

const stays = [
  { t: "The spread.", d: "It is paid on every trade, as on any account." },
  { t: "Any commission.", d: "Where an account charges a commission per lot, a swap-free option does not remove it." },
  { t: "Other charges may take the place of swap.", d: "Brokers commonly apply an administrative charge to positions held on a swap-free account, often after a number of nights. It is a fee, not interest, and it is a cost all the same. What a broker applies is in its own terms." },
  { t: "Margin, leverage and risk.", d: "A swap-free account is not interest-free leverage for holding a position without limit. The position is still leveraged, still needs margin, and can still be closed by a stop out." },
];

const faq = [
  {
    q: "What is a swap-free account?",
    a: "A swap-free account is a trading account on which no overnight swap is charged or credited when a position is held past the end of the trading day. It is often called an Islamic account, because it is intended for clients who cannot pay or receive interest. The spread and any commission still apply, and a broker may apply other administrative charges in place of swap.",
  },
  {
    q: "Does a swap-free account make holding a position overnight free?",
    a: "No. It removes swap only. The spread is still paid, any commission is still charged, and brokers commonly apply an administrative charge to positions held on a swap-free account. The position is still leveraged and still carries the risk of loss for as long as it is open.",
  },
  {
    q: "Does GIO4X offer a swap-free account?",
    a: `GIO4X’s published account conditions show overnight swap as ${accounts.map((a) => `“${a.swap}” on ${a.name}`).join(", ")}. A swap-free option is available on request and subject to approval, is intended for clients who cannot pay or receive interest for reasons of religious belief, and may be withdrawn where it is used to exploit the absence of swap. ${PROVISIONAL_NOTE}`,
  },
];

function Term({ slug, children }: { slug: string; children: string }) {
  return hasTerm(slug) ? (
    <Link href={`/glossary/${slug}`} className="link">
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

export default function SwapFreePage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Swap-free accounts", href: PATH },
        ]}
        eyebrow="Swap-free accounts"
        title="Swap-free accounts: held overnight, with no swap."
        lead="A swap-free account, often called an Islamic account, is one on which no overnight swap is charged or credited. This page explains what swap is, what removing it changes, and what stays exactly as it was."
      >
        <a href="#nights" className="btn btn-primary">
          See the nights pass
        </a>
        <a href="#gio4x" className="btn btn-ghost">
          GIO4X’s position
        </a>
      </PageHero>

      <section className="section" aria-labelledby="swap-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">First, swap</p>
            <h2 id="swap-h" className="h2 mt-13">
              What is applied overnight, and why.
            </h2>
            <p className="mt-21 flex flex-wrap gap-x-34 gap-y-3">
              <Link href="/tools/swap" className="go min-h-[2.75rem]">
                Swap calculator
              </Link>
              <Link href="/tools/cost-lab" className="go min-h-[2.75rem]">
                Cost Lab
              </Link>
            </p>
          </div>
          <div className="grid gap-13 text-ink-2">
            <p className="lead">
              <Term slug="swap">Swap</Term> is the financing adjustment applied to a leveraged position that is still open at the end of the trading day.
            </p>
            <p>
              A leveraged position is, in effect, held with borrowed money. In a currency pair one currency is bought and the other sold, and each carries its own interest rate. When the position is carried into the next day, at the <Term slug="rollover">rollover</Term>, the difference between the two rates is applied to the account, together with the broker’s own adjustment. It can be a charge or a credit, depending on the instrument and on whether the position is a buy or a sell.
            </p>
            <p>On one night of the week an ordinary account applies three nights’ swap at once, so that the weekend, when the market is closed but the position is still held, is accounted for. For currency pairs that night is commonly Wednesday; it differs by instrument and by broker.</p>
            <p>Swap is small on any one night. It is the cost, or the income, that grows with time, which is why it matters most to positions held for days or weeks.</p>
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="why-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">Why it exists</p>
            <h2 id="why-h" className="h2 mt-13">
              Some clients cannot pay or receive interest.
            </h2>
          </div>
          <div className="grid gap-13 text-ink-2">
            <p className="lead">Swap is worked out from interest rates. For some people, paying interest or receiving it is not permitted by their religious belief, whichever way it runs and however small it is.</p>
            <p>The best-known case is Islamic finance, in which interest is prohibited, and that is why an account without swap is so often called an Islamic account. A person in that position cannot hold an ordinary account overnight without the account doing something they may not do. A swap-free account removes that one thing.</p>
            <p>
              This page describes how such an account works. It gives no religious ruling and does not say that any account, GIO4X’s included, meets any particular requirement. Whether an account meets a person’s own requirements is for them and their own adviser to decide.
            </p>
          </div>
        </div>
      </section>

      <section id="nights" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="nights-h" data-machine>
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.3125rem)]">
            <p className="eyebrow">An explainer</p>
            <h2 id="nights-h" className="h2 mt-13">
              One position, several nights.
            </h2>
            <p className="lead mt-13">The same position is held on an ordinary account and on a swap-free one. Add nights and watch what is applied on each.</p>
            <DataNote status="simulation" className="mt-21">
              Example units, not a rate. {educationalNote}
            </DataNote>
          </div>
          <div className="min-w-0">
            <NightsHeld />
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="changes-h">
        <div className="wrap">
          <SectionHead eyebrow="What it changes" title={<span id="changes-h">One thing goes. The rest stays.</span>} lead="A swap-free account differs from an ordinary one at the rollover and nowhere else." />
          <div className="mt-34 grid gap-34 lg:grid-cols-2 lg:gap-55">
            <div>
              <h3 className="label border-b border-line-strong pb-13">What changes</h3>
              <ul>
                {changes.map((r) => (
                  <li key={r.t} className="border-b border-line py-21">
                    <h4 className="h4">{r.t}</h4>
                    <p className="mt-8 text-ink-2">{r.d}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="label border-b border-line-strong pb-13">What does not</h3>
              <ul>
                {stays.map((r) => (
                  <li key={r.t} className="border-b border-line py-21">
                    <h4 className="h4">{r.t}</h4>
                    <p className="mt-8 text-ink-2">{r.d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="gio4x" className="section hairline scroll-mt-[var(--header-h)]" aria-labelledby="gio-h">
        <div className="wrap phi phi-r items-start">
          <div>
            <p className="eyebrow">GIO4X</p>
            <h2 id="gio-h" className="h2 mt-13">
              What is published, and what is set for now.
            </h2>
            <p className="mt-21 text-ink-2">
              The table records overnight swap as GIO4X has published it for each account, as it stands on the{" "}
              <Link href="/trading/accounts" className="link">
                account types
              </Link>{" "}
              page. The terms beneath it are how a swap-free option is offered for now: they follow common practice among brokers and are marked provisional.
            </p>
          </div>
          <div className="grid gap-34">
            <div>
              <h3 className="label">Overnight swap, as published</h3>
              <div className="mt-13 overflow-x-auto">
                <table className="table-gx min-w-[18rem]">
                  <caption className="sr-only">Overnight swap on each GIO4X account, as published</caption>
                  <thead>
                    <tr>
                      <th scope="col">Account</th>
                      <th scope="col">Overnight swap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => (
                      <tr key={a.key}>
                        <th scope="row" className="!text-[0.9375rem] !font-medium !normal-case !tracking-normal">
                          {a.name}
                        </th>
                        <td className="num text-[0.9375rem] font-medium">{a.swap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DataNote status="indicative" source="GIO4X published account conditions" className="mt-13" />
            </div>
            <div>
              <h3 className="label">Provisional terms</h3>
              <ProvisionalList items={terms} className="mt-13" />
            </div>
            <div>
              <h3 className="label">Not set</h3>
              <PendingList items={notSet} className="mt-13" />
              <p className="mt-13 text-sm text-ink-2">
                Nothing on this page is a fee, a number of nights or a list of instruments, because none of those has been set. To ask about a swap-free option, use the{" "}
                <Link href="/contact" className="link">
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section hairline bg-paper" aria-labelledby="faq-h">
        <div className="wrap">
          <p className="eyebrow">Questions people ask</p>
          <h2 id="faq-h" className="h2 mt-13">
            About swap-free accounts
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

      <PunchLine k="conditions" />

      <NextSteps
        items={[
          { kind: "Tools", label: "Swap calculator", href: "/tools/swap", note: "What holding a position overnight adds up to." },
          { kind: "Tools", label: "Cost Lab", href: "/tools/cost-lab", note: "Spread, commission and swap on one trade." },
          { kind: "Trading", label: "Account types", href: "/trading/accounts", note: "Classic, Premium and ECN compared." },
          { kind: "Trading", label: "Trading conditions", href: "/trading/conditions", note: "What GIO4X publishes, instrument by instrument." },
        ]}
      />
    </>
  );
}
