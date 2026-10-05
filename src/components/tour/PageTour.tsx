"use client";

/**
 * A single-page tour: the first-visit walk round one page (the Trader Toolkit,
 * the sign-in gateway). The site tour in Tour.tsx moves between pages; this
 * one stays where it is and points at parts of the page in turn.
 *
 * It behaves as the site tour does. The offer is a small card at the
 * bottom-left, shown once, a moment after the page has been read; "Not now"
 * and "Show me" both record that it was offered, so it does not return. The
 * tour itself is a labelled, non-modal dialog: the page stays usable, focus is
 * never trapped, "End tour" and Escape always end it, and each step is
 * announced politely. A link to the page with `#guide` (on /preferences)
 * starts it again, however often.
 *
 * What it stores: one true/false field in the display preferences (`gx:prefs`)
 * per tour. Nothing is sent anywhere. The steps are handed in by the page, so
 * they are written beside the content they describe.
 */
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useFooterLift } from "@/components/shell/ChatWidget";
import { PLACE, RING_CLASS, RING_STYLE, SMALL, TOUR_END_EVENT, useTourRing } from "@/components/tour/shared";
import { TourCard } from "@/components/tour/TourCard";
import { PAGE_TOUR_FLAG, PAGE_TOUR_HASH, PAGE_TOURS, TOUR_KEY, type PageTourId, type PageTourStop } from "@/components/tour/stops";
import { usePrefs } from "@/hooks/usePrefs";
import { readPrefs, type Prefs } from "@/lib/prefs";

/** long enough for the page to be read for a moment */
const OFFER_AFTER_MS = 3500;

/** the page-tour fields are extra true/false fields of gx:prefs, beside `tourDone` */
type TourPrefs = Prefs & Partial<Record<"tourTools" | "tourGateway", boolean>>;

/** a site tour (Tour.tsx) is in progress in this tab */
function siteTourRunning(): boolean {
  try {
    return window.sessionStorage.getItem(TOUR_KEY) !== null;
  } catch {
    return false;
  }
}

export function PageTour({ id, stops }: { id: PageTourId; stops: PageTourStop[] }) {
  const pathname = usePathname();
  const [prefs, update, ready] = usePrefs();
  const uid = useId();
  const lift = useFooterLift();
  const meta = PAGE_TOURS[id];
  const flag = PAGE_TOUR_FLAG[id];
  // never read through an object that might be missing (see the note in Tour.tsx); missing counts as "already offered"
  const offered = prefs ? (prefs as TourPrefs)[flag] === true : true;

  const [step, setStep] = useState<number | null>(null);
  const [offer, setOffer] = useState(false);
  const [said, setSaid] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const focusPanel = useRef(false);

  const remember = useCallback(() => {
    if ((readPrefs() as TourPrefs)[flag] === true) return;
    const patch: Partial<TourPrefs> = { [flag]: true };
    update(patch);
  }, [flag, update]);

  const start = useCallback(() => {
    if (stops.length === 0) return;
    // a site tour in progress steps aside: two panels never share the corner
    window.dispatchEvent(new Event(TOUR_END_EVENT));
    setOffer(false);
    setSaid("");
    focusPanel.current = true;
    setStep(0);
    remember();
  }, [remember, stops.length]);
  const startRef = useRef(start);
  startRef.current = start;

  const end = useCallback((finished: boolean) => {
    setStep(null);
    setSaid(finished ? "The tour is finished." : "The tour has ended.");
  }, []);

  /* ---- the way back in: this page's address with #guide, arrived at or clicked ---- */
  useEffect(() => {
    const check = () => {
      if (window.location.hash !== PAGE_TOUR_HASH) return;
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* the fragment stays; the tour still starts */
      }
      startRef.current();
    };
    check();
    // a client-side navigation settles its address a moment after the page mounts
    const later = window.setTimeout(check, 400);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (a instanceof HTMLAnchorElement && a.origin === window.location.origin && a.pathname === window.location.pathname && a.hash === PAGE_TOUR_HASH && (!a.target || a.target === "_self")) {
        e.preventDefault();
        startRef.current();
      }
    };
    window.addEventListener("hashchange", check);
    document.addEventListener("click", onClick, true);
    return () => {
      window.clearTimeout(later);
      window.removeEventListener("hashchange", check);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  /* ---- the offer: once, on this page only, never over a tour ---- */
  useEffect(() => {
    if (!ready || offered || step !== null || pathname !== meta.path) {
      setOffer(false);
      return;
    }
    const timer = window.setTimeout(() => {
      if (!siteTourRunning()) setOffer(true);
    }, OFFER_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [ready, offered, step, pathname, meta.path]);

  /* ---- Escape ends the tour, unless it belongs to something else that is open ---- */
  const active = step !== null;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const el = document.activeElement;
      if (el && el !== document.body && !panelRef.current?.contains(el)) {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return;
        const page = document.getElementById("main");
        const footer = document.querySelector("footer[data-site-footer]");
        if (!page?.contains(el) && !footer?.contains(el)) return;
      }
      end(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, end]);

  /* ---- a tour that has just started hands the keyboard its panel ---- */
  useEffect(() => {
    if (step !== null && focusPanel.current) {
      focusPanel.current = false;
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [step]);

  const current = step !== null ? (stops[step] ?? null) : null;
  // every showing of a step, first, by Next or by Back, takes the step's own position
  useTourRing(ringRef, current?.target, current && step !== null ? String(step) : null);

  const total = stops.length;
  const last = step === total - 1;
  const decline = () => {
    setOffer(false);
    remember();
  };

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {said}
      </p>

      <div ref={ringRef} aria-hidden className={RING_CLASS} style={RING_STYLE} />

      {offer && step === null && (
        <aside aria-label={meta.name} className={`panel ${PLACE} p-13 shadow-3 sm:w-[21rem]`} style={{ marginBottom: lift || undefined, animation: "gx-rise 260ms var(--ease-out)" }}>
          <p className="text-sm font-semibold text-ink">{meta.name}</p>
          <p className="mt-3 text-sm leading-snug text-ink-2">{meta.offer}</p>
          <div className="mt-13 flex flex-wrap items-center gap-8">
            <button type="button" className={`btn btn-primary ${SMALL}`} onClick={start}>
              Show me
            </button>
            <button type="button" className={`btn btn-quiet ${SMALL}`} onClick={decline}>
              Not now
            </button>
          </div>
        </aside>
      )}

      {current && step !== null && (
        <TourCard
          panelRef={panelRef}
          uid={uid}
          name={meta.name}
          word="Step"
          at={step}
          total={total}
          title={current.title}
          body={current.body}
          back={step > 0 ? { title: stops[step - 1].title, go: () => setStep(step - 1) } : undefined}
          next={last ? undefined : { title: stops[step + 1].title, go: () => setStep(step + 1) }}
          onFinish={last ? () => end(true) : undefined}
          onEnd={() => end(false)}
          style={{ marginBottom: lift || undefined, animation: "gx-rise 260ms var(--ease-out)" }}
        />
      )}
    </>
  );
}
