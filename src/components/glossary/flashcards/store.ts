"use client";

import { useSyncExternalStore } from "react";
import { clean, dayNumber, grade, prune, toStored, type Deck } from "./leitner";

/**
 * THE FLASHCARDS' RECORD: one key, `gx:cards`, in this browser's localStorage.
 * It is listed in LOCAL_KEYS (lib/prefs), shown in the privacy controls and
 * removed by the privacy reset.
 *
 * It holds `{ v: 1, c: { "<glossary slug>": [box, day] } }`: for each card the
 * visitor has graded, the Leitner box it sits in (1 to 5) and the day it is
 * next due, and nothing else. It is written only when a card is graded and is
 * removed by "Start over". There is no account and no request: nothing leaves
 * the browser.
 *
 * Every read and write is in a try/catch, because storage can be switched off
 * or full. Whatever is read back goes through clean() (./leitner), which
 * leaves out anything that is not a card.
 */
export const CARDS_KEY = "gx:cards";
const EVENT = "gx:cards";

export type CardsRecord = {
  /** false on the server and during the first render in the browser */
  ready: boolean;
  deck: Deck;
};

const EMPTY: Deck = Object.freeze({});
const WAITING: CardsRecord = { ready: false, deck: EMPTY };
let cache: { raw: string | null; value: CardsRecord } | null = null;
/** what is on the page when the browser would not keep it: still applied for this visit */
let unsaved: Deck | null = null;

function read(): CardsRecord {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CARDS_KEY);
  } catch {
    raw = null;
  }
  if (unsaved !== null) {
    if (!cache || cache.value.deck !== unsaved) cache = { raw, value: { ready: true, deck: unsaved } };
    return cache.value;
  }
  if (cache && cache.raw === raw) return cache.value;
  let deck: Deck = EMPTY;
  if (raw) {
    try {
      deck = clean(JSON.parse(raw));
    } catch {
      deck = EMPTY;
    }
  }
  cache = { raw, value: { ready: true, deck } };
  return cache.value;
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  // graded in another tab, or cleared from /preferences
  window.addEventListener("storage", fn);
  window.addEventListener("gx:prefs", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
    window.removeEventListener("gx:prefs", fn);
  };
};

/** The record, kept current. Not ready on the server and until the page has loaded. */
export function useCards(): CardsRecord {
  return useSyncExternalStore(subscribe, read, () => WAITING);
}

/** today as a day number, in the visitor's own time zone: a card falls due at their midnight */
export const today = (now = new Date()): number => dayNumber(now.getTime(), -now.getTimezoneOffset());

/**
 * One card graded: called once for each press of "Knew it" or "Did not".
 * `slugs` is the glossary as it is now, so a card of a term that has gone is
 * dropped at the same time. Returns whether the browser kept it.
 */
export function noteGrade(slug: string, knew: boolean, slugs: readonly string[]): boolean {
  const next = grade(prune(read().deck, slugs), slug, knew, today());
  let kept = true;
  try {
    const raw = JSON.stringify(toStored(next));
    window.localStorage.setItem(CARDS_KEY, raw);
    // a browser that accepts the call and keeps nothing has not saved it
    if (window.localStorage.getItem(CARDS_KEY) !== raw) kept = false;
  } catch {
    kept = false;
  }
  unsaved = kept ? null : next;
  window.dispatchEvent(new Event(EVENT));
  return kept;
}

/** "Start over": every card is new again. */
export function clearCards(): void {
  unsaved = null;
  try {
    window.localStorage.removeItem(CARDS_KEY);
  } catch {
    /* storage unavailable: there was nothing kept to remove */
  }
  window.dispatchEvent(new Event(EVENT));
}
