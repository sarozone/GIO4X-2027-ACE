"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_PLAN, isEmpty, revive, tidy, toStored, type Plan, type PlanKey } from "./record";

/**
 * THE PLAN'S STORE: one key, `gx:plan`, in this browser's localStorage.
 *
 * It holds `{ v: 1, plan: { … } }`: the answers the visitor has typed on
 * /trading-plan and nothing else. It is written as the visitor types, imports
 * a file or clears the plan, and it is removed altogether when every answer
 * is empty. Nothing leaves the browser: there is no request in this file or
 * in anything that uses it. The key is listed in LOCAL_KEYS (lib/prefs),
 * shown in the privacy controls and removed by the privacy reset.
 *
 * Every read and write is in a try/catch, because storage can be switched
 * off or full. Whatever is read back goes through revive() (./record), which
 * leaves out anything that is not an answer within its limit. On the server,
 * and until the page has loaded, the plan is "not ready": the page shows empty
 * fields that cannot be typed in, and never a plan that is not the visitor's.
 */
export const PLAN_KEY = "gx:plan";
const EVENT = "gx:plan";

export type StoredPlan = {
  /** false on the server and during the first render in the browser */
  ready: boolean;
  plan: Plan;
};

const WAITING: StoredPlan = { ready: false, plan: EMPTY_PLAN };
let cache: { raw: string | null; value: StoredPlan } | null = null;
/** what is on the page when the browser would not keep it: still applied for this visit */
let unsaved: Plan | null = null;

function read(): StoredPlan {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PLAN_KEY);
  } catch {
    raw = null;
  }
  if (cache && cache.raw === raw && unsaved === null) return cache.value;
  if (unsaved !== null) {
    if (!cache || cache.value.plan !== unsaved) cache = { raw, value: { ready: true, plan: unsaved } };
    return cache.value;
  }
  let plan: Plan = EMPTY_PLAN;
  if (raw) {
    try {
      plan = revive(JSON.parse(raw));
    } catch {
      plan = EMPTY_PLAN;
    }
  }
  cache = { raw, value: { ready: true, plan } };
  return cache.value;
}

/** True if the browser kept it. On false the plan is still on the page, for this visit only. */
function write(plan: Plan): boolean {
  let kept = true;
  try {
    if (isEmpty(plan)) window.localStorage.removeItem(PLAN_KEY);
    else {
      const raw = JSON.stringify(toStored(plan));
      window.localStorage.setItem(PLAN_KEY, raw);
      // a browser that accepts the call and keeps nothing has not saved it
      if (window.localStorage.getItem(PLAN_KEY) !== raw) kept = false;
    }
  } catch {
    kept = false;
  }
  unsaved = kept ? null : plan;
  window.dispatchEvent(new Event(EVENT));
  return kept;
}

const subscribe = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  // the same plan open in another tab, or cleared from /preferences
  window.addEventListener("storage", fn);
  window.addEventListener("gx:prefs", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
    window.removeEventListener("gx:prefs", fn);
  };
};

/** The plan, kept current. Not ready on the server and until the page has loaded. */
export function usePlan(): StoredPlan {
  return useSyncExternalStore(subscribe, read, () => WAITING);
}

/** One answer, as typed. Returns whether the browser kept it. */
export function setAnswer(key: PlanKey, value: string): boolean {
  return write({ ...read().plan, [key]: tidy(key, value) });
}

/** A whole plan, read from a file and already checked (./record fromFile). */
export function replacePlan(plan: Plan): boolean {
  return write({ ...plan });
}

export function clearPlan(): boolean {
  return write({ ...EMPTY_PLAN });
}
