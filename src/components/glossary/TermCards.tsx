"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GLOSSARY CARDS — wherever a page already links a word to its glossary entry,
 * pointing at the link, or reaching it with the keyboard, shows a small card
 * with the term's definition and "Read the entry". On a touch screen the
 * first tap opens the card, which has its own "Close"; the entry is then one
 * tap away, on the card or on the link again.
 *
 * Mounted once, in the site shell. It adds no link and reads no text: only an
 * `<a>` whose address is /glossary/<term> gains a card, and not inside the
 * header, the footer, a navigation block or a dialogue, nor on the glossary's
 * own pages, My desk and the search page, where such a link is a way through
 * a list and not a word in a sentence. A block can also opt out with
 * `data-termcard="off"`.
 *
 * This file is all that every page carries: a few listeners. The card and the
 * definitions (./TermCard, /glossary-cards.json) are fetched on first use.
 *
 * Accessibility: while a card is open its link is described by it
 * (aria-describedby); Escape closes it; it can be pointed at without closing
 * (so its text can be read and selected) and closes when the pointer leaves
 * both; it is never placed over its link; the link keeps working as a link.
 */
const TermCard = dynamic(() => import("./TermCard").then((m) => m.TermCard), { ssr: false });

/** the card's id, as ./TermCard sets it: stated here so this file does not import that one */
const CARD_ID = "gx-term-card";
const TERM_PATH = /^\/glossary\/([a-z0-9][a-z0-9-]{0,79})\/?$/;
/** pages of the glossary that are not terms */
const NOT_TERMS = new Set(["map", "flashcards"]);
const OFF_PAGES = /^\/(glossary|desk|search)(\/|$)/;
const OFF_INSIDE = 'header[data-site-header], footer[data-site-footer], nav, [role="dialog"], [data-command], [data-termcard="off"], [data-term-card]';
/** a pause before a card opens under the pointer, and before it closes once the pointer has left */
const OPEN_MS = 260;
const CLOSE_MS = 220;

type Open = { slug: string; anchor: HTMLAnchorElement; touch: boolean };

function termLink(target: EventTarget | null): { slug: string; anchor: HTMLAnchorElement } | null {
  if (!(target instanceof Element) || OFF_PAGES.test(window.location.pathname)) return null;
  const anchor = target.closest("a");
  if (!anchor || anchor.origin !== window.location.origin || anchor.target === "_blank" || anchor.closest(OFF_INSIDE)) return null;
  const m = TERM_PATH.exec(anchor.pathname);
  return m && !NOT_TERMS.has(m[1]) ? { slug: m[1], anchor } : null;
}

export function TermCards() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Open | null>(null);
  const state = useRef<Open | null>(null);
  const timer = useRef<number | undefined>(undefined);
  /** when a finger last touched the page: the focus and the click that follow a tap are told apart from a keyboard's */
  const touched = useRef(0);

  const show = useCallback((next: Open | null) => {
    window.clearTimeout(timer.current);
    state.current = next;
    setOpen(next);
  }, []);
  const later = useCallback(
    (next: Open | null, ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => show(next), ms);
    },
    [show],
  );
  const close = useCallback(() => show(null), [show]);
  const stay = useCallback(() => window.clearTimeout(timer.current), []);
  const leave = useCallback(() => {
    // a card opened by a tap stays until it is closed
    if (!state.current?.touch) later(null, CLOSE_MS);
  }, [later]);

  // another page: no card
  useEffect(() => close, [pathname, close]);

  useEffect(() => {
    const recent = () => Date.now() - touched.current < 900;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") touched.current = Date.now();
      const now = state.current;
      if (!now || !(e.target instanceof Node)) return;
      // a press anywhere else puts the card away; on the link or on the card it does not
      if (now.anchor.contains(e.target) || document.getElementById(CARD_ID)?.contains(e.target)) return;
      show(null);
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch" || recent()) return;
      const link = termLink(e.target);
      const now = state.current;
      if (!link) return;
      if (now && now.anchor === link.anchor) window.clearTimeout(timer.current);
      else later({ ...link, touch: false }, now ? 0 : OPEN_MS);
    };

    const onOut = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const link = termLink(e.target);
      if (!link || (e.relatedTarget instanceof Node && link.anchor.contains(e.relatedTarget))) return;
      const now = state.current;
      // left before the card opened: it does not open; left an open one: it closes unless the pointer reaches the card
      if (!now) window.clearTimeout(timer.current);
      else if (now.anchor === link.anchor && !now.touch) later(null, CLOSE_MS);
    };

    const onFocusIn = (e: FocusEvent) => {
      if (recent()) return;
      const link = termLink(e.target);
      // only focus that came from the keyboard: a click also focuses a link, and the pointer has its own way in
      if (link && link.anchor.matches(":focus-visible")) show({ ...link, touch: false });
    };

    const onFocusOut = (e: FocusEvent) => {
      const now = state.current;
      if (now && !now.touch && e.target instanceof Node && now.anchor.contains(e.target)) later(null, 0);
    };

    const onClick = (e: MouseEvent) => {
      const byTouch = (e as PointerEvent).pointerType === "touch" || ((e as PointerEvent).pointerType === undefined && recent());
      if (!byTouch || e.defaultPrevented) return;
      const link = termLink(e.target);
      if (!link) return;
      const now = state.current;
      // the second tap on the same link follows it
      if (now && now.touch && now.anchor === link.anchor) return;
      e.preventDefault();
      show({ ...link, touch: true });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.current) show(null);
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    // before the link's own handler, so the first tap opens the card and does not leave the page
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer.current);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [later, show]);

  // while the card is open its link is described by it, and the link's own title steps aside so the browser does not show a second tooltip
  useEffect(() => {
    if (!open) return;
    const a = open.anchor;
    const before = a.getAttribute("aria-describedby");
    const title = a.getAttribute("title");
    a.setAttribute("aria-describedby", before ? `${before} ${CARD_ID}` : CARD_ID);
    if (title !== null) a.removeAttribute("title");
    return () => {
      if (before === null) a.removeAttribute("aria-describedby");
      else a.setAttribute("aria-describedby", before);
      if (title !== null) a.setAttribute("title", title);
    };
  }, [open]);

  if (!open) return null;
  return <TermCard key={`${open.slug}:${open.touch}`} slug={open.slug} anchor={open.anchor} touch={open.touch} onClose={close} onEnter={stay} onLeave={leave} />;
}
