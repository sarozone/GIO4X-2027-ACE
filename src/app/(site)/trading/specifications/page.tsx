/**
 * Contract specifications: every instrument in one table.
 *
 * The rule this page keeps: every figure is read from data/instruments and
 * data/accounts and shown as published ("from", "up to", indicative). Nothing
 * is typed here, nothing is taken from another broker, and each field a
 * specification table usually carries that GIO4X has not published is listed
 * by name as "Not yet published" instead of being filled in.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AskLine, PendingList, RiskNote } from "@/components/trading/Blocks";
import { SpecTable } from "@/components/trading/specs/SpecTable";
import { specClasses, specRows } from "@/components/trading/specs/rows";
import { DataNote, NextSteps, PageHero, SectionHead } from "@/components/ui/Page";
import { PunchLine } from "@/components/ui/PunchLine";
import { indicativeNote, riskWarning } from "@/config/legal";
import { accounts } from "@/data/accounts";
import { hasTerm } from "@/data/glossary";
import { assetClasses, instruments } from "@/data/instruments";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { faqSchema, webPageSchema } from "@/lib/schema";

const PATH = "/trading/specifications";
const TITLE = "Contract specifications";
const DESCRIPTION = `Contract specifications for all ${instruments.length} GIO4X instruments in one table: contract, minimum lot, spread from, maximum leverage and trading hours as published. Filter, sort, search and download as CSV. Indicative figures; fields not yet published are listed.`;

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: PATH });

/** A glossary link where the term exists; plain words where it does not. */
function Term({ slug, children }: { slug: string; children: ReactNode }) {
  return hasTerm(slug) ? (
    <Link href={`/glossary/${slug}`} className="link">
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

const units = [...new Set(assetClasses.map((a) => a.spreadUnit))];

/** Fields other specification tables carry and GIO4X has not published. */
const pending = [
  { label: "Tick size and tick value", why: "The smallest step a price can move, and what that step is worth for one lot." },
  { label: "Volume step and maximum volume", why: "The increments a trade size can be set in, and the largest single order." },
  { label: "Swap long and swap short", why: "The overnight financing charged or paid on each instrument, for a bought and for a sold position." },
  { label: "Three-day swap day", why: "The weekday on which financing for the weekend is applied." },
  { label: "Commission by instrument", why: "One commission line is published for each account as a whole (shown below). A schedule by instrument or asset class, on ECN or on any other account, is not." },
  { label: "Margin tiers", why: "Whether the margin requirement rises with the size of a position, and at what sizes." },
  { label: "Stop and freeze levels", why: "How close to the current price an order may be placed or changed." },
  { label: "Expiry and rollover dates", why: "For contracts built on futures: when one contract month gives way to the next." },
  { label: "Trading hours for each instrument", why: "Hours are published as one line for each asset class. A timetable by instrument, with the daily break, is not." },
];

const faq = [
  {
    q: "What is a contract specification?",
    a: "It is the set of terms that define one instrument: what one lot represents, the smallest size that can be traded, the unit the spread is quoted in, the most leverage available and the hours it trades. With those terms and a price, the value of a position, the margin it ties up and the worth of a price move can be worked out by arithmetic.",
  },
  {
    q: "Are the spreads in this table the spreads I will pay?",
    a: "No. Each is a minimum, published as “from”, and is indicative. The spread at any moment varies with market conditions and with the account held, and is usually wider when a market is thin or moving fast. Leverage is published as “up to”: a ceiling, which may be lower where you live.",
  },
  {
    q: "Why are swap rates, tick values and rollover dates missing?",
    a: "GIO4X has not yet published them, so this page lists them by name as not yet published instead of filling the gap with an estimate. Once you hold an account, the specification shown for each symbol in the trading platform is the authoritative version of every term, including those absent here.",
  },
];

export default function SpecificationsPage() {
  const rows = specRows();
  const classes = specClasses();
  const tools = ["pip-value", "margin", "cost-lab"].map((s) => getTool(s)).filter((t) => t !== undefined);

  const reading: { name: string; body: ReactNode }[] = [
    {
      name: "Symbol and name",
      body: "The symbol is how the instrument is written on this site; each one opens that instrument’s own page. The CSV file also carries its code.",
    },
    {
      name: "Contract",
      body: (
        <>
          What one <Term slug="lot">lot</Term> represents, or how the price is quoted. A position’s notional value is its <Term slug="contract-size">contract size</Term> multiplied by the number of lots and the price. An instrument described as a{" "}
          <Term slug="cfd">CFD</Term> follows a price without the holder owning the thing itself.
        </>
      ),
    },
    {
      name: "Minimum lot",
      body: "The smallest trade size, in lots. It differs by asset class, so the same number means a different amount of exposure from one row to the next.",
    },
    {
      name: "Spread from",
      body: (
        <>
          The minimum <Term slug="spread">spread</Term>, in the unit shown beside it ({units.join(", ")}). The units differ by asset class, so sorting this column puts numbers in order, not costs: a <Term slug="pip">pip</Term> on a currency pair
          and a point on an index are not the same amount of money.
        </>
      ),
    },
    {
      name: "Leverage up to",
      body: (
        <>
          The ceiling on <Term slug="leverage">leverage</Term>. Its other face is <Term slug="margin">margin</Term>: at 1:100, a position ties up one hundredth of its notional value. Higher leverage does not change what a price move is worth;
          it changes how little has to be set aside to hold the position.
        </>
      ),
    },
    {
      name: "Trading hours",
      body: (
        <>
          The line published for the instrument’s asset class, repeated on each of its rows. See{" "}
          <Link href="/trading/hours" className="link">
            trading hours and market holidays
          </Link>{" "}
          for the week as a whole.
        </>
      ),
    },
  ];

  return (
    <>
      <JsonLd data={webPageSchema({ path: PATH, name: TITLE, description: DESCRIPTION })} />
      <JsonLd data={faqSchema(faq)} />
      <PageHero
        crumbs={[
          { name: "Trading", href: "/trading" },
          { name: TITLE, href: PATH },
        ]}
        eyebrow="Trading"
        title="Contract specifications."
        lead={`All ${instruments.length} instruments in one table: what one lot is, the smallest trade, the minimum spread, the leverage ceiling and the hours, each exactly as GIO4X has published it.`}
      />

      <section className="section" aria-label="Specification table">
        <div className="wrap">
          <SpecTable rows={rows} classes={classes} />
          <DataNote status="indicative" source="GIO4X published trading conditions" className="mt-21">
            {indicativeNote}
          </DataNote>
          <div className="mt-13 grid gap-8 text-sm text-ink-2">
            <p>
              Every figure here is indicative. “Spread from” is a minimum and “leverage up to” is a ceiling; neither is a quote, and neither is tied to an account type in this table (see{" "}
              <Link href="/trading/accounts" className="link">
                account types
              </Link>
              ). Leverage may be lower in your jurisdiction.
            </p>
            <p>
              These are the indicative conditions GIO4X published on its previous website, carried over unchanged. No revision date is published with them, so none is shown. Once you hold an account, the specification shown for each symbol
              in the trading platform is authoritative, and where it differs from this page it is the platform that is right.
            </p>
            <p className="text-xs text-ink-3">The CSV file is made in your browser from the rows on screen, in the order shown. Nothing is sent anywhere and nothing is stored.</p>
          </div>
        </div>
      </section>

      {/* how to read it */}
      <section className="section hairline bg-paper" aria-labelledby="reading">
        <div className="wrap phi phi-r items-start">
          <div data-reveal>
            <p className="eyebrow">How to read this table</p>
            <h2 id="reading" className="h2 mt-13">
              The columns, and what each one fixes.
            </h2>
            <p className="lead mt-21">A specification is the fixed part of a trade. The price moves; these terms say what a move is worth and what the position ties up.</p>
            {tools.length > 0 && (
              <>
                <h3 className="label mt-34">Work it through</h3>
                <ul className="mt-8 border-t border-line">
                  {tools.map((t) => (
                    <li key={t.slug} className="border-b border-line">
                      <Link href={`/tools/${t.slug}`} className="go min-h-[2.75rem] py-8">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <dl className="border-t border-line-strong" data-reveal>
            {reading.map((r) => (
              <div key={r.name} className="grid gap-x-34 gap-y-5 border-b border-line py-21 md:grid-cols-[11rem_minmax(0,1fr)]">
                <dt className="h4">{r.name}</dt>
                <dd className="text-ink-2">{r.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* what is not published */}
      <section className="section hairline" aria-labelledby="pending">
        <div className="wrap">
          <SectionHead
            eyebrow="Not yet published"
            title={<span id="pending">What this table does not carry.</span>}
            lead="Specification tables elsewhere usually include the fields below. GIO4X has not published them, so they are named here and left empty. No figure has been borrowed from another firm to fill them."
          />
          <div className="phi mt-34 items-start lg:mt-55">
            <PendingList items={pending} />
            <div>
              <h3 className="label">Commission, as published by account</h3>
              <dl className="mt-8 border-t border-line-strong">
                {accounts.map((a) => (
                  <div key={a.key} className="flex items-baseline justify-between gap-21 border-b border-line py-13">
                    <dt className="text-sm text-ink-3">{a.name}</dt>
                    <dd className="num text-right text-[0.9375rem] font-medium text-ink">{a.commission}</dd>
                  </div>
                ))}
              </dl>
              <DataNote status="indicative" source="GIO4X published account conditions" className="mt-13" />
              <p className="mt-21 text-sm text-ink-2">
                Margin call and stop out levels are published and are explained on{" "}
                <Link href="/trading/conditions" className="link">
                  trading conditions
                </Link>
                . What else is and is not yet published across the site is kept on the{" "}
                <Link href="/trust/transparency" className="link">
                  transparency page
                </Link>
                .
              </p>
              <AskLine className="mt-13">For a term that is not published, ask before you trade:</AskLine>
            </div>
          </div>
        </div>
      </section>

      {/* questions */}
      <section className="section hairline bg-paper" aria-labelledby="faq">
        <div className="wrap">
          <SectionHead eyebrow="Questions" title={<span id="faq">Questions people ask.</span>} backdrop={false} />
          <dl className="mt-34 border-t border-line-strong">
            {faq.map((f) => (
              <div key={f.q} className="grid gap-x-34 gap-y-5 border-b border-line py-21 md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
                <dt className="h4">{f.q}</dt>
                <dd className="text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <RiskNote text={riskWarning} />

      <PunchLine k="arithmetic" />

      <NextSteps
        items={[
          { kind: "Trading", label: "Trading hours", href: "/trading/hours", note: "The week, the sessions and what holidays change." },
          { kind: "Trading", label: "Trading conditions", href: "/trading/conditions", note: "Margin call, stop out and the four words of cost." },
          { kind: "Tools", label: "Margin calculator", href: "/tools/margin", note: "What a position ties up." },
          { kind: "Tools", label: "Cost Lab", href: "/tools/cost-lab", note: "Spread, commission and swap, added up." },
        ]}
      />
    </>
  );
}
