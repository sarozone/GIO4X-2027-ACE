"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./term-card.css";

/**
 * The card itself: fetched, with the definitions, the first time a glossary
 * link is pointed at, focused or tapped (see ./TermCards, which decides when
 * it opens and closes).
 *
 * The definitions come from one static file, /glossary-cards.json
 * (slug → [term, definition]), requested once per visit and kept in memory.
 * Nothing about the visitor is sent with it and nothing is stored.
 */
export const TERM_CARD_ID = "gx-term-card";

type Cards = Record<string, [string, string]>;
let cards: Promise<Cards | null> | null = null;

function load(): Promise<Cards | null> {
  if (!cards) {
    cards = fetch("/glossary-cards.json")
      .then((r) => (r.ok ? (r.json() as Promise<Cards>) : null))
      .catch(() => null);
    // a failed request is tried again the next time a card opens
    void cards.then((c) => {
      if (!c) cards = null;
    });
  }
  return cards;
}

const GAP = 8;

export function TermCard({
  slug,
  anchor,
  touch,
  onClose,
  onEnter,
  onLeave,
}: {
  slug: string;
  /** the link the card belongs to: the card is placed above or below it, never over it */
  anchor: HTMLElement;
  /** opened by a tap: the card then carries its own "Close" */
  touch: boolean;
  onClose: () => void;
  /** the pointer is on the card, or has left it: a card under the pointer stays open */
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [all, setAll] = useState<Cards | null | undefined>(undefined);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    void load().then((c) => {
      if (live) setAll(c);
    });
    return () => {
      live = false;
    };
  }, []);

  const entry = all ? all[slug] : undefined;

  // measured once it has its words: below the link if there is room in the window, otherwise above
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const below = r.bottom + GAP + h <= vh || r.top - GAP - h < 0;
      const left = Math.max(GAP, Math.min(r.left, vw - w - GAP));
      setAt({ top: (below ? r.bottom + GAP : r.top - GAP - h) + window.scrollY, left: left + window.scrollX });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchor, slug, entry, all]);

  // the file is there and this address is not one of its terms: no card
  if (all && !entry) return null;

  return createPortal(
    <div
      ref={box}
      id={TERM_CARD_ID}
      role={touch ? "group" : "tooltip"}
      aria-label={touch && entry ? `Glossary: ${entry[0]}` : undefined}
      className="gx-term-card no-print"
      data-term-card
      data-touch={touch}
      data-placed={at !== null}
      style={at ? { top: at.top, left: at.left } : { top: 0, left: 0 }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {entry ? (
        <>
          <p className="gx-term-card-name">{entry[0]}</p>
          <p className="gx-term-card-text">{entry[1]}</p>
        </>
      ) : (
        <p className="gx-term-card-text">{all === null ? "The definition could not be loaded." : "Loading the definition…"}</p>
      )}
      <p className="gx-term-card-foot">
        {/* with a keyboard the link the card belongs to is already the way to the entry: this one is for the pointer and the finger */}
        <Link href={`/glossary/${slug}`} className="link" tabIndex={touch ? undefined : -1} onClick={onClose}>
          Read the entry
        </Link>
        {touch && (
          <button type="button" className="btn btn-quiet btn-sm" onClick={onClose}>
            Close
          </button>
        )}
      </p>
    </div>,
    document.body,
  );
}
