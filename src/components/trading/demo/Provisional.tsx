import { PROVISIONAL_NOTE } from "@/data/trading";

/**
 * Terms GIO4X has not fixed, stated in line with common practice among brokers
 * and marked as such. The rule this keeps: every provisional term carries the
 * site's one provisional sentence beside it, word for word, so none can be read
 * as settled (docs/WAITING-FOR-ABE.md, section H).
 */
export function ProvisionalList({ items, className = "" }: { items: { term: string; detail: string }[]; className?: string }) {
  return (
    <dl className={`border-t border-line-strong ${className}`}>
      {items.map((it) => (
        <div key={it.term} className="grid gap-x-34 gap-y-5 border-b border-line py-21 md:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
          <dt>
            <span className="h4 block">{it.term}</span>
            <span className="chip mt-8">Provisional</span>
          </dt>
          <dd>
            <span className="block text-ink">{it.detail}</span>
            <span className="mt-5 block text-xs text-ink-3">{PROVISIONAL_NOTE}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
