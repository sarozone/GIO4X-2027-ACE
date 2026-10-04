import { PunchLine } from "@/components/ui/PunchLine";
import Link from "next/link";
import { FigureNote } from "@/components/figures/Figure";
import { CurrencyOrbits } from "@/components/figures/stage/CurrencyOrbits";
import { HeroCompanion } from "@/components/figures/stage/HeroCompanion";
import { ReturnLoop } from "@/components/figures/trading/ReturnLoop";
import { AskLine, NumberedRows, PendingList, RiskNote } from "@/components/trading/Blocks";
import { NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { riskWarning } from "@/config/legal";
import { PORTAL_READ_ON, portalMethods, portalWalletCurrencies, portalWithdrawalRules } from "@/data/funding-methods";
import { fundingConfirmed, fundingCurrencies, fundingExplainers, fundingFlow, fundingPending } from "@/data/trading";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  title: "Funding and withdrawals",
  description: "How deposits and withdrawals work at GIO4X: the accepted currencies, the same-name rule, verification before withdrawal, and which details are confirmed in your client area.",
  path: "/trading/funding",
});

export default function FundingPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: "Funding and withdrawals", href: "/trading/funding" },
        ]}
        eyebrow="Funding and withdrawals"
        title="How money moves in and out."
        lead="This page publishes only what GIO4X has stated consistently, and what its client portal can be seen to do. Fees, limits and timings that were published in more than one version are not repeated here; they are confirmed in your client area before you commit to a payment."
        aside={
          <div className="border-t border-line-strong pt-21">
            <p className="label">Accepted currencies</p>
            <ul className="mt-13 grid grid-cols-4 border-l border-t border-line" aria-label="Accepted currencies">
              {fundingCurrencies.map((c) => (
                <li key={c} className="num border-b border-r border-line py-13 text-center text-sm font-semibold tracking-[0.06em] text-ink">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-ink-3">As listed on both previous GIO4X websites. Whether a given method supports a given currency is confirmed in your client area.</p>
          </div>
        }
        companion={
          <HeroCompanion figure={<CurrencyOrbits />} label="On the way in">
            Eleven currencies are accepted, but every payment still travels through a bank or payment provider, which may apply its own transfer or conversion charges.{" "}
            <Link href="#path" className="link">
              The path of a payment
            </Link>{" "}
            sets out the six steps.
          </HeroCompanion>
        }
      />

      {/* confirmed vs pending */}
      <section className="section" aria-labelledby="confirmed">
        <div className="wrap grid gap-55 lg:grid-cols-phi lg:gap-89">
          <div>
            <p className="eyebrow">Published</p>
            <h2 id="confirmed" className="h2 mt-13">
              What is settled.
            </h2>
            <dl className="mt-34 border-t border-line-strong">
              {fundingConfirmed.map((f) => (
                <div key={f.title} className="border-b border-line py-21">
                  <dt className="h4 flex items-baseline gap-8">
                    <span aria-hidden className="text-pos">
                      ✓
                    </span>
                    {f.title}
                  </dt>
                  <dd className="mt-5 max-w-measure pl-21 text-ink-2">{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="eyebrow">Not yet published</p>
            <h2 className="h3 mt-13">What is confirmed in your client area.</h2>
            <p className="mt-13 text-sm text-ink-2">
              GIO4X’s two previous websites gave different answers on each of these. Rather than choose one, this site publishes none until the owner confirms it. For payment methods there is one thing it can show in the meantime:{" "}
              <Link href="#portal" className="link">
                what the client portal supports
              </Link>
              , read from the portal itself. Which of those methods are open to you is still confirmed in your client area.
            </p>
            <PendingList items={fundingPending} className="mt-21" />
            <AskLine className="mt-13" />
          </div>
        </div>
      </section>

      {/* what the portal software implements: every row comes from src/data/funding-methods.ts */}
      <section className="section hairline" aria-labelledby="portal">
        <div className="wrap">
          <SectionHead
            eyebrow={`From the portal, ${PORTAL_READ_ON}`}
            title={<span id="portal">What the client portal supports.</span>}
            lead={`A description of what the GIO4X client portal software implements as of ${PORTAL_READ_ON}, taken from the portal itself.`}
          />
          <div className="mt-21 grid gap-8 text-ink-2">
            <p>
              It is not a statement of fees, limits or processing times, which are not yet published. It is not a promise that every method is open to every client or in every country. It says what the software does, and where a screen exists with nothing connected behind it, it says that too.
            </p>
            <p>
              As of this date the portal is not connected to a payment provider. A deposit or a withdrawal made there is a request: the portal records it, a member of staff reviews it, and the wallet balance changes only when it is approved. The payment itself travels outside the portal, through your bank or the network you used.
            </p>
          </div>

          <div className="mt-34 overflow-x-auto">
            <table className="table-gx min-w-[46rem]">
              <caption className="sr-only">Methods in the GIO4X client portal as of {PORTAL_READ_ON}</caption>
              <thead>
                <tr>
                  <th scope="col">Method</th>
                  <th scope="col">For</th>
                  <th scope="col">How the portal processes it</th>
                  <th scope="col">Currencies</th>
                </tr>
              </thead>
              <tbody>
                {portalMethods.map((m) => (
                  <tr key={m.method}>
                    <th scope="row" className="align-top text-left font-semibold text-ink">
                      {m.method}
                    </th>
                    <td className="align-top">{m.direction}</td>
                    <td className={`align-top ${m.notConnected ? "text-ink-3" : "text-ink-2"}`}>{m.processing}</td>
                    <td className="align-top">{m.currencies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-34 grid gap-34 lg:grid-cols-2 lg:gap-55">
            <div>
              <h3 className="h4">What a withdrawal request requires</h3>
              <ul className="mt-13 border-t border-line">
                {portalWithdrawalRules.map((r) => (
                  <li key={r} className="border-b border-line py-13 text-sm text-ink-2">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="h4">Wallet currencies, fees and limits</h3>
              <p className="mt-13 text-sm text-ink-2">The portal’s wallet can be held in these units. USC is the US cent, used by cent accounts. A new client’s wallet is opened in US dollars.</p>
              <ul className="mt-13 flex flex-wrap gap-5" aria-label="Currencies a portal wallet can be held in">
                {portalWalletCurrencies.map((c) => (
                  <li key={c} className="chip num">
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-2">
                This is not the same list as the accepted currencies at the top of this page, which comes from the previous GIO4X websites. Until GIO4X confirms one list, treat the currency offered to you in your client area as the answer.
              </p>
              <p className="mt-13 text-sm text-ink-2">
                Fees, minimum and maximum amounts are set by GIO4X in the portal, the fee charges in tables its staff maintain, and not in this website. No figure is given here. Check what the portal shows you, or{" "}
                <Link href="/contact" className="link">
                  ask
                </Link>
                , before you confirm a payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* the path of a payment */}
      <section className="section hairline bg-paper" aria-labelledby="path">
        <div className="wrap">
          <SectionHead eyebrow="In general" title={<span id="path">The path of a payment.</span>} lead="Six steps, three parties. It is the same with any broker, and it explains most of what people find slow about moving money." />
          <ol className="mt-34 grid border-l border-t border-line sm:grid-cols-2 lg:mt-55 lg:grid-cols-3">
            {fundingFlow.map((s, i) => (
              <li key={s.step} className="flex flex-col gap-21 border-b border-r border-line bg-bg p-21 lg:p-34" data-reveal style={{ ["--i" as string]: i }}>
                <div className="flex items-baseline justify-between gap-13">
                  <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
                  <span className="label">{s.who}</span>
                </div>
                <div>
                  <h3 className="h4">{s.step}</h3>
                  <p className="mt-5 text-sm text-ink-2">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-13 text-xs text-ink-3">A general description of how funding works, not a statement of GIO4X’s processing times.</p>
        </div>
      </section>

      {/* why */}
      <section className="section hairline" aria-labelledby="why">
        <div className="wrap phi phi-r items-start">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.125rem)]" data-reveal>
            <p className="eyebrow">The reasons</p>
            <h2 id="why" className="h2 mt-13">
              Why it works this way.
            </h2>
            <p className="lead mt-21">The rules around funding can feel like obstacles. Each one exists for a reason, and most of them are there to protect the account holder.</p>
            <Link href="/trust/client-funds" className="go mt-21 min-h-[2.75rem] md:min-h-0">
              Client fund security
            </Link>
            <FigureNote figure={<ReturnLoop ratio={3} />} className="!mt-21">
              Most of this comes down to two ideas: the money stays in one name, and it leaves by the way it arrived.{" "}
              <Link href="#path" className="link">
                The path of a payment
              </Link>
              , above, shows the steps where each applies.
            </FigureNote>
          </div>
          <NumberedRows items={fundingExplainers} as="ul" />
        </div>
      </section>

      <RiskNote text={riskWarning} />

      <PunchLine k="funding" />

      <NextSteps
        items={[
          { kind: "Trading", label: "Account types", href: "/trading/accounts", note: "Minimum deposits and what you need to open one." },
          { kind: "Trust", label: "Client fund security", href: "/trust/client-funds", note: "What is published about how funds are held." },
          { kind: "Trust", label: "Verify a GIO4X link", href: "/trust/verify", note: "Check a payment page before you use it." },
          { kind: "Help", label: "Contact", href: "/contact", note: "Ask before you send money, not after." },
        ]}
      />
    </>
  );
}
