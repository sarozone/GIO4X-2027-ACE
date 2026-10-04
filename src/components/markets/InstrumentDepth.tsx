import Link from "next/link";
import type { Depth, DepthPoint } from "@/data/instrument-depth/types";

/**
 * What is particular to one instrument: the sections of an instrument page
 * that come from src/data/instrument-depth. General education about the
 * underlying market. It carries no price and no GIO4X trading condition, and
 * the block says so; conditions are on the page's own "Trading conditions"
 * section and on /trading/conditions.
 */

const Points = ({ items }: { items: readonly DepthPoint[] }) => (
  <dl className="border-t border-line">
    {items.map((p) => (
      <div key={p.t} className="grid gap-x-21 gap-y-5 border-b border-line py-21 md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
        <dt className="h4">{p.t}</dt>
        <dd className="max-w-measure text-ink-2">{p.d}</dd>
      </div>
    ))}
  </dl>
);

function Block({ id, eyebrow, title, children, tinted }: { id: string; eyebrow: string; title: string; children: React.ReactNode; tinted?: boolean }) {
  return (
    <section className={`section hairline scroll-mt-[var(--header-h)] ${tinted ? "bg-paper" : ""}`} aria-labelledby={id}>
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="h2 mt-13 max-w-[24ch]">
          {title}
        </h2>
        <div className="mt-34">{children}</div>
      </div>
    </section>
  );
}

export function InstrumentDepth({ depth, name, costHref }: { depth: Depth; name: string; costHref: string }) {
  return (
    <>
      <Block id="depth-character" eyebrow="In depth" title={`What is particular to ${name}.`}>
        <p className="lead max-w-measure">{depth.character}</p>
        <p className="mt-13 max-w-measure text-sm text-ink-3">
          General education about the underlying market. It states no current price or rate, makes no forecast and is not advice. What GIO4X offers on this instrument is in the trading conditions on this page, not here.
        </p>
        <div className="mt-34">
          <h3 className="h3">What moves it</h3>
          <div className="mt-13">
            <Points items={depth.drivers} />
          </div>
        </div>
      </Block>

      <Block id="depth-mechanics" eyebrow="Mechanics" title="How it is quoted and built." tinted>
        <Points items={depth.mechanics} />
      </Block>

      {depth.versus && depth.versus.length > 0 && (
        <Block id="depth-versus" eyebrow="Not the same thing" title="The market itself, and a contract on its price.">
          <Points items={depth.versus} />
        </Block>
      )}

      {depth.lifecycle && depth.lifecycle.length > 0 && (
        <Block id="depth-lifecycle" eyebrow="Over time" title="Events in the life of the contract." tinted={!depth.versus?.length}>
          <Points items={depth.lifecycle} />
          <p className="mt-21 max-w-measure text-sm text-ink-3">
            These describe how such events work in general. How GIO4X treats them on its own contract (adjustments, rollover dates, suspensions) is a trading condition and is{" "}
            <Link href="/trust/transparency" className="link">
              not yet published
            </Link>
            .
          </p>
        </Block>
      )}

      <Block id="depth-watch" eyebrow="Timetable and sources" title="What is scheduled, and where the facts come from." tinted={!!depth.versus?.length === !!depth.lifecycle?.length}>
        <div className="grid gap-34 lg:grid-cols-2">
          <div>
            <h3 className="h4">Worth knowing the timetable of</h3>
            <ul className="mt-13 grid gap-8 text-ink-2">
              {depth.watch.map((w) => (
                <li key={w} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                  <span aria-hidden className="mt-[0.7em] h-px w-full bg-accent" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <p className="mt-13 text-sm text-ink-3">
              Named, never dated: dates move. The{" "}
              <Link href="/markets/events" className="link">
                Economic Events
              </Link>{" "}
              page explains the main releases.
            </p>
          </div>
          <div>
            <h3 className="h4">Primary sources</h3>
            <ul className="mt-13 grid gap-8 text-ink-2">
              {depth.sources.map((s) => (
                <li key={s} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                  <span aria-hidden className="mt-[0.7em] h-px w-full bg-prestige-ink" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-13 text-sm text-ink-3">Named by publisher and series, so each can be found from the publisher itself. GIO4X has no connection with them.</p>
          </div>
        </div>

        <div className="mt-34 border-t border-line pt-21">
          <h3 className="h4">What would a trade in it cost?</h3>
          <p className="mt-8 max-w-measure text-ink-2">
            The cost of a trade is the spread, any commission, and financing for each night it is held. The Cost Lab works the three out for a day trade, an overnight position and a longer hold, from figures you enter. A complete total needs the
            commission basis and the swap rates, which are not yet published; the Lab shows which input is missing instead of a total that only looks complete.
          </p>
          <Link href={costHref} className="go mt-13">
            Work it out in the Cost Lab
          </Link>
        </div>
      </Block>
    </>
  );
}
