"use client";

import { useSyncExternalStore } from "react";
import { LIMITS, bodyOk, idOk, inOrder, revive, sameBody, type Body } from "./record";
import type { Trade } from "./stats";

/**
 * THE JOURNAL'S STORE: one key, `gx:journal`, in this browser's localStorage.
 *
 * It holds `{ v: 1, trades: [...] }`: the trades the visitor has written on
 * /journal and nothing else. It is written only when the visitor adds, edits,
 * imports or deletes a trade, and it is removed altogether when the journal
 * is empty. Nothing leaves the browser: there is no request in this file or
 * in anything that uses it.
 *
 * Every read and write is in a try/catch, because storage can be switched
 * off or full. Whatever is read back goes through revive() (./record), which
 * discards anything that is not exactly the expected shape. On the server,
 * and until the page has loaded, the journal is "not ready": the page shows a
 * neutral state and never a journal that is not the visitor's.
 */
export const JOURNAL_KEY = "gx:journal";
const EVENT = "gx:journal";

export type Journal = {
  /** false on the server and during the first render in the browser */
  ready: boolean;
  trades: Trade[];
  /** rises whenever the trades change, so a drawing of them is made again */
  rev: number;
};

const WAITING: Journal = { ready: false, trades: [], rev: 0 };
let cache: { raw: string | null; value: Journal } | null = null;
let revs = 0;

function read(): Journal {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(JOURNAL_KEY);
  } catch {
    raw = null;
  }
  if (cache && cache.raw === raw) return cache.value;
  let trades: Trade[] = [];
  if (raw) {
    try {
      trades = revive(JSON.parse(raw));
    } catch {
      trades = [];
    }
  }
  cache = { raw, value: { ready: true, trades, rev: ++revs } };
  return cache.value;
}

/** True if the browser kept it. On false nothing has changed. */
function write(trades: Trade[]): boolean {
  try {
    if (!trades.length) window.localStorage.removeItem(JOURNAL_KEY);
    else {
      const raw = JSON.stringify({ v: 1, trades });
      window.localStorage.setItem(JOURNAL_KEY, raw);
      // a browser that accepts the call and keeps nothing has not saved it
      if (window.localStorage.getItem(JOURNAL_KEY) !== raw) return false;
    }
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  // the same journal open in another tab
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
  };
};

/** The journal, kept current. Not ready on the server and until the page has loaded. */
export function useJournal(): Journal {
  return useSyncExternalStore(subscribe, read, () => WAITING);
}

export type Saved = { ok: true } | { ok: false; why: "full" | "unsaved" | "invalid" | "gone" };

const UNSAVED: Saved = { ok: false, why: "unsaved" };

/** `id` is made by the caller, inside an event handler (it uses the clock and Math.random). */
export function addTrade(id: string, body: Body): Saved {
  if (!idOk(id) || !bodyOk(body)) return { ok: false, why: "invalid" };
  const { trades } = read();
  if (trades.length >= LIMITS.trades) return { ok: false, why: "full" };
  if (trades.some((t) => t.id === id)) return { ok: false, why: "invalid" };
  return write(inOrder([...trades, { id, ...body }])) ? { ok: true } : UNSAVED;
}

export function changeTrade(id: string, body: Body): Saved {
  if (!bodyOk(body)) return { ok: false, why: "invalid" };
  const { trades } = read();
  if (!trades.some((t) => t.id === id)) return { ok: false, why: "gone" };
  return write(inOrder(trades.map((t) => (t.id === id ? { id, ...body } : t)))) ? { ok: true } : UNSAVED;
}

export function removeTrade(id: string): Saved {
  const { trades } = read();
  return write(trades.filter((t) => t.id !== id)) ? { ok: true } : UNSAVED;
}

export function clearJournal(): Saved {
  return write([]) ? { ok: true } : UNSAVED;
}

export type Added = { ok: true; added: number; already: number } | { ok: false; why: "full" | "unsaved" | "invalid"; room: number };

/**
 * Trades read from a CSV file, added to those already here. A trade that is
 * identical to one in the journal is left out, so the same backup imported
 * twice adds nothing the second time. `stem` is made by the caller, inside an
 * event handler; each new trade's id is the stem and its place in the file.
 */
export function addMany(stem: string, bodies: Body[]): Added {
  const { trades } = read();
  const room = LIMITS.trades - trades.length;
  if (!bodies.every(bodyOk)) return { ok: false, why: "invalid", room };
  const fresh: Trade[] = [];
  // each trade already here can account for one identical row and no more
  const unmatched = [...trades];
  bodies.forEach((b, i) => {
    const at = unmatched.findIndex((t) => sameBody(t, b));
    if (at >= 0) unmatched.splice(at, 1);
    else fresh.push({ id: `${stem}${i.toString(36).padStart(2, "0")}`, ...b });
  });
  const already = bodies.length - fresh.length;
  if (!fresh.length) return { ok: true, added: 0, already };
  if (fresh.length > room) return { ok: false, why: "full", room };
  if (!fresh.every((t) => idOk(t.id)) || fresh.some((t) => trades.some((x) => x.id === t.id))) return { ok: false, why: "invalid", room };
  return write(inOrder([...trades, ...fresh])) ? { ok: true, added: fresh.length, already } : { ok: false, why: "unsaved", room };
}
