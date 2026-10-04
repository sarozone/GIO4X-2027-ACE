"use client";

import { useMemo, useState } from "react";
import { drawingFor } from "@/components/compare/drawings";
import { Note, Stage } from "@/components/labs/kit";

/**
 * The drawing of a comparison page, with its control: a button for each item,
 * and one sentence that says in words what the canvas shows for the item
 * chosen. The canvas is decoration; the sentence carries the meaning. Every
 * path is invented and the note beneath says so. Nothing is stored.
 */
export function Mechanism({ slug, items, note }: { slug: string; items: readonly { key: string; name: string; shows: string }[]; note: string }) {
  const [at, setAt] = useState(0);
  const draw = useMemo(() => drawingFor(slug, at), [slug, at]);
  const item = items[at] ?? items[0];
  if (!draw || !item) return null;
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={at} />
      <div className="mt-13 flex flex-wrap gap-8" role="group" aria-label="Which one the drawing shows">
        {items.map((it, i) => (
          <button key={it.key} type="button" aria-pressed={i === at} onClick={() => setAt(i)} className={`btn btn-sm min-h-[2.75rem] ${i === at ? "btn-primary" : "btn-ghost"}`}>
            {it.name}
          </button>
        ))}
      </div>
      <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
        {item.shows}
      </p>
      <Note>{note}</Note>
    </div>
  );
}
