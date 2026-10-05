"use client";

import { useEffect, type RefObject } from "react";
import { chromeHeight, travelTo } from "@/lib/scroll";

/**
 * What the site tour (Tour.tsx) and the single-page tours (PageTour.tsx) have
 * in common: where the panel sits, the size of its buttons, and the soft ring
 * drawn round the one element a stop points at.
 */

/** Bottom-left, clear of the right-hand column that the scroll arrows and the help button use on a phone. */
export const PLACE =
  "no-print fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-8 right-[4.25rem] z-[37] sm:bottom-[max(1.3125rem,env(safe-area-inset-bottom))] sm:left-[max(1.3125rem,env(safe-area-inset-left))] sm:right-auto";

/** 44px touch targets on a phone, the compact size from `sm` up. */
export const SMALL = "btn-sm h-[2.75rem] sm:h-[2.125rem]";

/** The class and style of the ring element both tours render (hidden until a target is found). */
export const RING_CLASS = "no-print pointer-events-none fixed z-[36] rounded-md border-2 border-accent";
export const RING_STYLE = { display: "none", boxShadow: "0 0 0 5px color-mix(in srgb, var(--accent) 21%, transparent)" } as const;

export function isStill(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
}

/** Raised by a single-page tour as it starts, so that a site tour in progress steps aside: two panels never share the corner. */
export const TOUR_END_EVENT = "gx:tour-end";

/** the space left between the site header and the element a stop points at */
const BELOW_HEADER = 21;

/**
 * Where a stop puts the page, and the one element it points at: brought into
 * view, then ringed. `shown` names the stop on screen (null while there is
 * none, or while its page is still on its way); `selector` is a CSS selector,
 * or undefined for a stop that points at nothing.
 *
 * Every stop has one position, and takes it each time it is shown, by the
 * same route whether it is reached first, with Next or with Back: the top of
 * its element a fixed distance under the site header, or the top of the page
 * for a stop without an element. Nothing else is measured (not the card, which
 * can be minimised, and not the header as it happens to be drawn, which is
 * taller at the top of a page), so the answer cannot depend on where the
 * visitor came from. The journey is watched to its end (lib/scroll.ts).
 *
 * The ring follows the element through scrolling and resizing and is hidden
 * whenever the element cannot be found or has no size.
 */
export function useTourRing(ringRef: RefObject<HTMLDivElement | null>, selector: string | undefined, shown: string | null): void {
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const hide = () => {
      ring.style.display = "none";
    };
    hide();
    if (shown === null) return;

    let el: HTMLElement | null = null;
    let dead = false;
    let raf = 0;
    let timer = 0;
    let tries = 0;
    let stopTravel = () => {};

    if (!selector) {
      // a stop that points at nothing is about the page as a whole: it begins at the top
      timer = window.setTimeout(() => {
        stopTravel = travelTo(() => 0);
      }, 420);
      return () => {
        window.clearTimeout(timer);
        stopTravel();
      };
    }

    const place = () => {
      raf = 0;
      if (dead || !el || !el.isConnected) return hide();
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return hide();
      // a full-width element keeps its ring inside the window
      const pad = 5;
      const left = Math.max(3, r.left - pad);
      const right = Math.min(document.documentElement.clientWidth - 3, r.right + pad);
      ring.style.display = "block";
      ring.style.left = `${left}px`;
      ring.style.top = `${r.top - pad}px`;
      ring.style.width = `${Math.max(0, right - left)}px`;
      ring.style.height = `${r.height + pad * 2}px`;
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };

    // Where the element is laid out on the page, not where it is drawn: a section that is still
    // arriving (data-reveal) is drawn a little off its place, and that must not move the stop.
    const pageTop = (node: HTMLElement) => {
      let top = 0;
      for (let n: HTMLElement | null = node; n; n = n.offsetParent instanceof HTMLElement ? n.offsetParent : null) top += n.offsetTop;
      return top;
    };
    const bring = (node: HTMLElement) => {
      stopTravel = travelTo(() => pageTop(node) - chromeHeight() - BELOW_HEADER);
    };

    const find = () => {
      if (dead) return;
      try {
        el = document.querySelector<HTMLElement>(selector);
      } catch {
        el = null; // not a selector the browser accepts: the stop simply shows its panel
        return;
      }
      if (!el) {
        // the page may still be arriving
        if (++tries < 12) timer = window.setTimeout(find, 250);
        return;
      }
      bring(el);
      place();
    };
    // after the new page has taken its own scroll position
    timer = window.setTimeout(find, 420);

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null;
    ro?.observe(document.body);
    return () => {
      dead = true;
      window.clearTimeout(timer);
      stopTravel();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      ro?.disconnect();
      hide();
    };
  }, [ringRef, selector, shown]);
}
