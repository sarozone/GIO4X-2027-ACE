"use client";

import { useId, useState } from "react";

/**
 * "Show me two side by side": pick any two items of a comparison and read
 * them against each other, row by row. A row on which the two give different
 * answers is marked, in words as well as by its rule and tint; a row on which
 * they agree is left plain. It only rearranges the words of the table above
 * it: nothing is ranked, and nothing is stored.
 */
type Item = { key: string; name: string; values: readonly string[] };

export function Pick({ rows, items }: { rows: readonly string[]; items: readonly Item[] }) {
  const uid = useId();
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const left = items[a] ?? items[0];
  const right = items[b] ?? items[1];
  if (!left || !right) return null;
  const same = a === b;
  const differs = rows.map((_, i) => left.values[i] !== right.values[i]);
  const count = differs.filter(Boolean).length;

  const chooser = (id: string, text: string, value: number, set: (n: number) => void) => (
    <div className="field">
      <label htmlFor={id}>{text}</label>
      <select id={id} className="select min-h-[2.75rem]" value={value} onChange={(e) => set(Number(e.target.value))}>
        {items.map((it, i) => (
          <option key={it.key} value={i}>
            {it.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="grid gap-13 sm:grid-cols-2">
        {chooser(`${uid}-a`, "First", a, setA)}
        {chooser(`${uid}-b`, "Second", b, setB)}
      </div>
      <p className="mt-13 text-ink-2" aria-live="polite">
        {same
          ? `Both boxes show ${left.name.toLowerCase()}. Choose a different one in either box to compare.`
          : `${left.name} and ${right.name} differ on ${count} of ${rows.length} rows${count < rows.length ? ` and give the same answer on ${rows.length - count}` : ""}.`}
      </p>
      <dl className="mt-21 grid gap-8">
        {rows.map((row, i) => {
          const d = differs[i] && !same;
          return (
            <div key={row} className={`rounded border p-13 ${d ? "border-accent bg-surface" : "border-line"}`}>
              <dt className="flex flex-wrap items-center justify-between gap-8">
                <span className="label">{row}</span>
                {!same && <span className={`chip ${d ? "text-ink" : "text-ink-3"}`}>{d ? "Differs" : "The same"}</span>}
              </dt>
              <dd className="mt-8 grid gap-13 sm:grid-cols-2">
                {(same ? [left] : [left, right]).map((it, k) => (
                  <p key={k} className="min-w-0">
                    <span className="block text-xs text-ink-3">{it.name}</span>
                    <span className={`mt-3 block ${d ? "text-ink" : "text-ink-2"}`}>{it.values[i]}</span>
                  </p>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
