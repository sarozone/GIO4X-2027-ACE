"use client";

import { useId, useState, useSyncExternalStore } from "react";

/**
 * The filter box of the A to Z index, and the only part of that page that
 * runs in the browser. The list itself is server-rendered: every link is in
 * the HTML. Typing here hides the entries (`[data-az]`) that do not contain
 * the words typed, and the letters (`[data-az-group]`) left with none. With
 * JavaScript off the box is not drawn and everything is simply shown.
 * Nothing typed is stored or sent anywhere.
 */
const never = () => () => {};

export function AzFilter({ target, total }: { target: string; total: number }) {
  const id = useId();
  // false in the server's HTML, true once the page is running: a box that cannot work is not shown
  const live = useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(total);

  const apply = (value: string) => {
    setQ(value);
    const root = document.getElementById(target);
    if (!root) return;
    const words = value.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    root.querySelectorAll<HTMLElement>("[data-az-group]").forEach((group) => {
      let any = false;
      group.querySelectorAll<HTMLElement>("[data-az]").forEach((entry) => {
        const text = entry.dataset.az ?? "";
        const hit = words.every((word) => text.includes(word));
        entry.hidden = !hit;
        if (hit) {
          any = true;
          n += 1;
        }
      });
      group.hidden = !any;
    });
    setShown(n);
  };

  if (!live) return <div className="min-h-[5.5rem]" />;
  return (
    <div className="field max-w-[34rem]">
      <label htmlFor={id}>Filter the list</label>
      <div className="flex gap-8">
        <input id={id} type="search" className="input min-h-[2.75rem] min-w-0 flex-1" value={q} onChange={(e) => apply(e.target.value)} placeholder="A word, or a kind: term, tool, lesson" autoComplete="off" spellCheck={false} />
        {q && (
          <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={() => apply("")}>
            Clear
          </button>
        )}
      </div>
      <p className="field-hint" aria-live="polite">
        {q.trim() ? (shown === 0 ? "Nothing in the index matches. Try a shorter word." : `${shown} of ${total} entries shown.`) : `${total} entries, in alphabetical order.`}
      </p>
    </div>
  );
}
