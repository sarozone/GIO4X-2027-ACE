"use client";

import { useId, useState, useSyncExternalStore } from "react";

/**
 * The filter of the currency and economy profiles, and the only part of those
 * index pages that runs in the browser. It follows the commodities filter
 * (CommodityFilter.tsx) with the wording passed in, and an entry may belong to
 * several categories (`data-cat="Reserve currency|Safe haven"`). The list
 * itself is server-rendered: every entry is in the HTML. Typing here, or
 * choosing a category, hides the entries (`[data-az]`) that do not match and
 * the groups (`[data-az-group]`) left with none. With JavaScript off the
 * controls are not drawn and everything is simply shown. Nothing typed is
 * stored or sent anywhere.
 */
const never = () => () => {};

/** the word that stands for "in a GIO4X instrument" among the categories */
const LISTED = "listed";

export function ProfileFilter({
  target,
  total,
  categories,
  noun,
  plural,
  label,
  placeholder,
  listedLabel,
  groupLabel,
}: {
  target: string;
  total: number;
  categories: readonly string[];
  /** "currency", "economy" */
  noun: string;
  plural: string;
  /** the label of the search box */
  label: string;
  placeholder: string;
  /** the chip that shows only the entries marked `data-listed="yes"` */
  listedLabel: string;
  /** what the chips choose between, for assistive technology */
  groupLabel: string;
}) {
  const id = useId();
  // false in the server's HTML, true once the page is running: controls that cannot work are not shown
  const live = useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [shown, setShown] = useState(total);

  const apply = (value: string, category: string | null) => {
    setQ(value);
    setCat(category);
    const root = document.getElementById(target);
    if (!root) return;
    const words = value.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    root.querySelectorAll<HTMLElement>("[data-az-group]").forEach((group) => {
      let any = false;
      group.querySelectorAll<HTMLElement>("[data-az]").forEach((entry) => {
        const text = entry.dataset.az ?? "";
        const inCategory = category === null || (category === LISTED ? entry.dataset.listed === "yes" : (entry.dataset.cat ?? "").split("|").includes(category));
        const hit = inCategory && words.every((word) => text.includes(word));
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

  if (!live) return <div className="min-h-[9rem]" />;
  const filtered = q.trim() !== "" || cat !== null;
  const chip = "chip !h-[2.125rem] cursor-pointer aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg";
  return (
    <div>
      <div className="field max-w-[34rem]">
        <label htmlFor={id}>{label}</label>
        <div className="flex gap-8">
          <input id={id} type="search" className="input min-h-[2.75rem] min-w-0 flex-1" value={q} onChange={(e) => apply(e.target.value, cat)} placeholder={placeholder} autoComplete="off" spellCheck={false} />
          {filtered && (
            <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={() => apply("", null)}>
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="mt-13 flex flex-wrap items-center gap-5" role="group" aria-label={groupLabel}>
        <button type="button" className={chip} aria-pressed={cat === null} onClick={() => apply(q, null)}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className={chip} aria-pressed={cat === c} onClick={() => apply(q, cat === c ? null : c)}>
            {c}
          </button>
        ))}
        <button type="button" className={chip} aria-pressed={cat === LISTED} onClick={() => apply(q, cat === LISTED ? null : LISTED)}>
          {listedLabel}
        </button>
      </div>
      <p className="field-hint mt-8" aria-live="polite">
        {filtered ? (shown === 0 ? `No ${noun} matches. Try a shorter word, or another choice.` : `${shown} of ${total} ${plural} shown.`) : `${total} ${plural}.`}
      </p>
    </div>
  );
}
