import { STANDING } from "@/data/case-studies";

/**
 * The four statements every case-study page carries, in full and near the
 * top: no endorsement or connection, no access to anyone's portfolio, a
 * method is not its results, and a leveraged CFD is not an investment held.
 * A server component: the words are in the HTML.
 */
export function Standing({ subject = "people", id = "cs-standing" }: { subject?: "people" | "practice"; id?: string }) {
  return (
    <section className="section-quiet hairline bg-paper" aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <p id={`${id}-h`} className="eyebrow">
          Read this first
        </p>
        <dl className="mt-21 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STANDING.map((s) => (
            <div key={s.t} className="bg-surface p-21">
              <dt className="font-medium text-ink">{s.t}</dt>
              <dd className="mt-8 text-sm text-ink-2">{s[subject]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
