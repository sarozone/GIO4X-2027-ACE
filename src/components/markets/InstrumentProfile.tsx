import { CONSENSUS_PLAIN, CUSTODY_AND_CFD, PRICE_OR_TOTAL_RETURN, WEIGHTING_EXAMPLE, type InstrumentProfile as Profile } from "@/data/instrument-depth/profiles";
import type { DepthPoint } from "@/data/instrument-depth/types";

/**
 * The profile of an index or a crypto-asset: the card of facts that stands
 * before the "In depth" sections on its instrument page, from
 * src/data/instrument-depth/profiles.ts. It states; the sections after it
 * explain. No price, no market value, no GIO4X trading condition.
 */

const Rows = ({ items }: { items: readonly DepthPoint[] }) => (
  <dl className="border-t border-line-strong">
    {items.map((p) => (
      <div key={p.t} className="grid gap-x-21 gap-y-3 border-b border-line py-13 sm:grid-cols-[12rem_1fr]">
        <dt className="text-sm text-ink-3">{p.t}</dt>
        <dd className="max-w-measure text-ink">{p.d}</dd>
      </div>
    ))}
  </dl>
);

/** Two invented companies, weighted by share price and by market value. The index's own method is told first. */
function Weighting({ method }: { method: "price" | "value" }) {
  const own = method === "price" ? WEIGHTING_EXAMPLE.price : WEIGHTING_EXAMPLE.value;
  const other = method === "price" ? WEIGHTING_EXAMPLE.value : WEIGHTING_EXAMPLE.price;
  return (
    <div className="mt-34">
      <h3 className="h3">Weighting, with two companies.</h3>
      <p className="mt-8 max-w-measure text-sm text-ink-3">Invented companies and invented figures, to show the arithmetic. They are no company’s price and no index’s weights.</p>
      <div className="scroll-x mt-13">
        <table className="table-gx min-w-[36rem]">
          <caption className="sr-only">Two invented companies and the weight of each in an index, by share price and by market value</caption>
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col">Share price</th>
              <th scope="col">Shares</th>
              <th scope="col">Market value</th>
              <th scope="col">Weight by price</th>
              <th scope="col" className="!pr-0">
                Weight by value
              </th>
            </tr>
          </thead>
          <tbody>
            {WEIGHTING_EXAMPLE.companies.map((c) => (
              <tr key={c.name}>
                <th scope="row" className="!border-line !text-[0.9375rem] !font-medium !normal-case !tracking-normal !text-ink">
                  {c.name}
                </th>
                <td className="num text-sm">{c.price}</td>
                <td className="num text-sm">{c.shares}</td>
                <td className="num text-sm">{c.value}</td>
                <td className={`text-sm ${method === "price" ? "font-medium text-ink" : "text-ink-2"}`}>{c.byPrice}</td>
                <td className={`!pr-0 text-sm ${method === "value" ? "font-medium text-ink" : "text-ink-2"}`}>{c.byValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-21 grid gap-21 lg:grid-cols-2 lg:gap-34">
        <div>
          <h4 className="label">This index: by {method === "price" ? "share price" : "market value"}</h4>
          <p className="mt-8 text-ink-2">{own}</p>
        </div>
        <div>
          <h4 className="label">For contrast: by {method === "price" ? "market value" : "share price"}</h4>
          <p className="mt-8 text-ink-2">{other}</p>
        </div>
      </div>
      <p className="mt-21 max-w-measure text-ink-2">{WEIGHTING_EXAMPLE.moral}</p>
      <p className="mt-13 max-w-measure text-sm text-ink-3">{PRICE_OR_TOTAL_RETURN}</p>
    </div>
  );
}

export function InstrumentProfile({ profile, name, tinted }: { profile: Profile; name: string; tinted?: boolean }) {
  const crypto = profile.kind === "crypto";
  return (
    <section className={`section hairline scroll-mt-[var(--header-h)] ${tinted ? "bg-paper" : ""}`} id="profile" aria-labelledby="profile-title">
      <div className="wrap">
        <p className="eyebrow">Profile</p>
        <h2 id="profile-title" className="h2 mt-13 max-w-[24ch]">
          {crypto ? `${name}: the network behind the price.` : `${name}: what the index is.`}
        </h2>
        <p className="mt-13 max-w-measure text-sm text-ink-3">
          The facts in brief; the sections that follow give the reasoning. General education about the {crypto ? "network" : "index"} itself. It states no price, market value or ranking, makes no forecast and is not advice.
        </p>

        <div className="mt-34">
          <Rows
            items={
              crypto
                ? [
                    ...profile.rows,
                    { t: "Custody", d: CUSTODY_AND_CFD.custody },
                    { t: "What a CFD on it gives", d: CUSTODY_AND_CFD.cfdGives },
                    { t: "What a CFD does not give", d: `${CUSTODY_AND_CFD.cfdLacks} ${profile.cfdLacks}` },
                  ]
                : profile.rows
            }
          />
        </div>

        {profile.kind === "index" && <Weighting method={profile.method} />}

        {profile.kind === "crypto" && (
          <div className="mt-34 grid gap-34 lg:grid-cols-2 lg:gap-55">
            <div>
              <h3 className="h4">Confirmation, in plain words</h3>
              <p className="mt-13 text-ink-2">{CONSENSUS_PLAIN.work}</p>
              <p className="mt-13 text-ink-2">{CONSENSUS_PLAIN.stake}</p>
            </div>
            <div>
              <h3 className="h4">The risks particular to it</h3>
              <ul className="mt-13 grid gap-8 text-ink-2">
                {profile.risks.map((r) => (
                  <li key={r} className="grid grid-cols-[0.8125rem_1fr] gap-x-8">
                    <span aria-hidden className="mt-[0.7em] h-px w-full bg-warn" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-13 text-sm text-ink-3">These come on top of the risks of any leveraged product, which are set out in the risk warning on this page.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
