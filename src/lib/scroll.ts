/**
 * Scrolling the page from script: the scroll arrows and the tours.
 *
 * A smooth scroll is only a request. The browser drops it, or stops somewhere
 * else, when the page changes height under it (a line that opens above, a list
 * that arrives late, a picture that loads) or when another scroll begins. So a
 * journey started here is watched: once the scrolling has gone quiet the
 * position is compared with where it was meant to end, and the rest of the way
 * is taken in one step. A visitor who takes over on the way (wheel, touch, a
 * key, the scrollbar) is left where they chose to be.
 *
 * Browser only: call these from an event handler or an effect.
 */

/** no scroll event for this long: the smooth scroll has finished, or has been dropped */
const QUIET_MS = 180;
/** what the visitor does to take the scrolling over */
const TAKEOVER = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/** the window has one scroll position, so there is one journey at a time */
let current: (() => void) | null = null;

/** Motion is reduced: by the system, or by the switch at /preferences. */
function still(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
}

/**
 * The height, in pixels, of what is fixed at the top of the window once the
 * page has moved: the site header. It is the page's own `scroll-padding-top`
 * (globals.css), so script and in-page links stop at the same line.
 */
export function chromeHeight(): number {
  const px = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  return Number.isFinite(px) && px > 0 ? px : 55;
}

/**
 * Scrolls the window to `target()` and makes sure it arrives. `target` is a
 * function because the answer can change on the way (the page grows; the
 * element aimed at moves): it is read when the journey starts and again when
 * it ends. Smooth unless motion is reduced. `over` is called once, when the
 * journey is over however it ended. Returns a function that stops watching;
 * starting another journey does the same.
 */
export function travelTo(target: () => number, over?: () => void): () => void {
  current?.();
  const root = document.documentElement;
  const end = () => Math.max(0, Math.min(Math.round(target()), root.scrollHeight - window.innerHeight));
  if (still()) {
    // "instant", not "auto": "auto" hands the choice back to the stylesheet, which asks for a smooth scroll
    window.scrollTo({ top: end(), behavior: "instant" });
    over?.();
    return () => {};
  }

  let timer = 0;
  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("scroll", quiet);
    window.removeEventListener("scrollend", arrive);
    for (const type of TAKEOVER) window.removeEventListener(type, stop);
    if (current === stop) current = null;
    over?.();
  };
  const arrive = () => {
    if (done) return;
    if (Math.abs(window.scrollY - end()) > 1) window.scrollTo({ top: end(), behavior: "instant" });
    stop();
  };
  const quiet = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(arrive, QUIET_MS);
  };
  window.addEventListener("scroll", quiet, { passive: true });
  window.addEventListener("scrollend", arrive);
  for (const type of TAKEOVER) window.addEventListener(type, stop, { passive: true });
  current = stop;
  window.scrollTo({ top: end(), behavior: "smooth" });
  quiet();
  return stop;
}
