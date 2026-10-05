"use client";

import { useSyncExternalStore } from "react";
import { answer, cleanRun, dayNumber, dayText, type Run } from "./pick";

/**
 * THE QUESTION OF THE DAY'S RECORD: one key, `gx:qotd`, in this browser's
 * localStorage. It is listed in LOCAL_KEYS (lib/prefs), shown in the privacy
 * controls and removed by the privacy reset.
 *
 * It holds five small things and nothing else: the last day a question was
 * answered, the run of days in a row, the longest run, and which option was
 * chosen that day and whether it was right (so the page shows the same result
 * if it is opened again that day). It is written only when the visitor
 * answers the day's question. There is no account, no leaderboard and no
 * request: nothing leaves the browser.
 */
export const QOTD_KEY = "gx:qotd";
const EVENT = "gx:qotd";

export type QotdRecord = {
  /** false on the server and during the first render in the browser */
  ready: boolean;
  run: Run | null;
};

const WAITING: QotdRecord = { ready: false, run: null };
let cache: { raw: string | null; value: QotdRecord } | null = null;

function read(): QotdRecord {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(QOTD_KEY);
  } catch {
    raw = null;
  }
  if (cache && cache.raw === raw) return cache.value;
  let run: Run | null = null;
  if (raw) {
    try {
      run = cleanRun(JSON.parse(raw));
    } catch {
      run = null;
    }
  }
  cache = { raw, value: { ready: true, run } };
  return cache.value;
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  // answered in another tab, or cleared from /preferences
  window.addEventListener("storage", fn);
  window.addEventListener("gx:prefs", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
    window.removeEventListener("gx:prefs", fn);
  };
};

/** The record, kept current. Not ready on the server and until the page has loaded. */
export function useQotd(): QotdRecord {
  return useSyncExternalStore(subscribe, read, () => WAITING);
}

/** today as YYYY-MM-DD, in UTC: the question changes at the same moment for everyone */
export const today = (now = Date.now()): string => dayText(dayNumber(now));

/** The day's question answered: called from the form's submit, once. Returns whether the browser kept it. */
export function noteAnswer(pick: number, right: boolean): boolean {
  const next = answer(read().run, today(), pick, right);
  let kept = true;
  try {
    window.localStorage.setItem(QOTD_KEY, JSON.stringify(next));
  } catch {
    kept = false;
  }
  window.dispatchEvent(new Event(EVENT));
  return kept;
}

/** "Start over": the run is forgotten. */
export function clearQotd(): void {
  try {
    window.localStorage.removeItem(QOTD_KEY);
  } catch {
    /* storage unavailable: there was nothing kept to remove */
  }
  window.dispatchEvent(new Event(EVENT));
}
