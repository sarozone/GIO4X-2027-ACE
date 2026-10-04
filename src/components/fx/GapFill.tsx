"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Figure, clamp } from "@/components/figures/Figure";
import { GAP_FIGURES, hashText, pickTopic, type TopicId } from "@/components/fx/gap";

/**
 * GAP FILL — a small picture in the empty half of a two-column section.
 *
 * Many sections set a short piece of text beside a long list (the `phi` and
 * `phi-r` grids). On a wide screen the short column is then mostly empty. This
 * looks at the page once it has been laid out and, wherever a column ends well
 * above its neighbour and holds no picture of its own, stands a figure in the
 * space. It does the same for text set in a narrow measure with the rest of
 * the row empty: it measures how far the words, pictures, rules and panels of
 * a run of blocks actually reach, and stands a figure to their right when a
 * third of the width or more is unused. It never makes a section taller and
 * never covers anything: a figure is only as tall and as wide as the space
 * that was already there. Below the desktop layout the columns stack and
 * there is no gap, so nothing is added.
 *
 * The figure is chosen by what the section is about: its heading and the start
 * of its text are matched against the words each figure answers to
 * (`fx/gap/choose.ts`), and the best match not yet used on this page is drawn.
 * No picture appears twice on a page: when nothing fits, one of three neutral
 * figures is taken, and when those are used the space is left empty. Each
 * figure is one idea with one small-caps word under it, modest in size, and
 * stands on the bare page with no card behind it. The seed comes from the
 * page's path and the section's heading, so a page keeps its pictures and two
 * pages that share a figure draw it differently.
 *
 * The figures say nothing the text does not: no price, no number, nothing
 * that could be read as data. They are hidden from assistive technology, they
 * answer the pointer (the Figure host supplies it), and under reduced motion
 * or low visual effects each is one still frame.
 */

const MIN_GAP = 230;
/** the tallest a figure in a short column may be, and the widest (22rem) */
const MAX_H = 240;
const COL_MAX_W = 352;
const HOST = "gx-gapfill";
/** a column that already carries a picture, a form or a table is left alone */
const HAS_OWN = "canvas, img, video, picture, form, table, .gx-stage, .gx-figure, svg[width], svg[viewBox]";

/* ---- what the section is about --------------------------------------------- */

type Chosen = { figure: TopicId; seed: number };
/** the figure for the `i`th gap found in an element, or null when the page has none left to give */
type Pick = (el: HTMLElement, i: number) => Chosen | null;

const HEADINGS = "h1, h2, h3, h4";

/** the first `max` characters of the words in an element, skipping scripts, styles and the figures themselves */
function wordsOf(el: Element, max: number): string {
  let out = "";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node && out.length < max; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest(`script, style, noscript, .${HOST}`)) continue;
    const text = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
    if (text) out += `${text} `;
  }
  return out.slice(0, max);
}

/**
 * The heading and opening text a gap belongs to: the element's own heading if it has one, else the
 * first heading of the nearest section or article around it.
 */
function topicText(el: HTMLElement): { heading: string; body: string } {
  const scope = el.closest<HTMLElement>("section, article") ?? el;
  const own = el.querySelector(HEADINGS);
  const head = own ?? scope.querySelector(HEADINGS);
  const heading = (head?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
  const body = own ? wordsOf(el, 420) : `${wordsOf(el, 300)} ${wordsOf(scope, 200)}`;
  return { heading, body };
}

/* ---- finding the gaps ------------------------------------------------------ */

type Slot = { host: HTMLElement; figure: TopicId; seed: number; ratio: number };

/** the room there must be beside a run of narrow blocks, and the space kept between the words and the figure */
const SIDE_MIN_W = 260;
const SIDE_GAP = 55;
const SIDE_MAX_W = 300;
const SIDE_MAX_H = 220;
/** one figure for about this much height of text, and never more than this many in a run */
const SIDE_EVERY = 620;
const SIDE_MOST = 2;
const REPLACED = new Set(["IMG", "CANVAS", "VIDEO", "SVG", "IFRAME", "INPUT", "SELECT", "TEXTAREA", "BUTTON", "TABLE", "HR", "PICTURE"]);

/**
 * How far to the right the visible things in a block reach: its lines of text, its pictures and
 * controls, and any box with a background, a border or a shadow. Stops early once past `limit`.
 */
function inkRight(el: HTMLElement, limit: number): number {
  let right = el.getBoundingClientRect().left;
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node: Node | null = el;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue && node.nodeValue.trim()) {
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width > 0 && r.right > right) right = r.right;
      }
    } else {
      const e = node as HTMLElement;
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.right > right) {
        const cs = getComputedStyle(e);
        const bg = cs.backgroundColor;
        const boxed =
          REPLACED.has(e.tagName.toUpperCase()) ||
          (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") ||
          cs.backgroundImage !== "none" ||
          cs.boxShadow !== "none" ||
          parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) > 0;
        if (boxed) right = r.right;
      }
    }
    if (right > limit) return right;
    node = walker.nextNode();
  }
  return right;
}

/** Figures beside runs of narrow blocks: text in a measure with the rest of the row empty. */
function sideSlots(outer: HTMLElement, pick: Pick): Slot[] {
  const out: Slot[] = [];
  {
    if (outer.closest(".cx-hero, .gx-ribbon, [data-no-gapfill]") || outer.querySelector(`.phi, .phi-r, .${HOST}`) || outer.matches(".phi, .phi-r")) return out;
    // a wrap that only holds one full-width box: look inside the box
    let wrap = outer;
    for (let depth = 0; depth < 3; depth++) {
      const kids = [...wrap.children].filter((c): c is HTMLElement => c instanceof HTMLElement);
      if (kids.length !== 1 || kids[0]!.getBoundingClientRect().width < wrap.getBoundingClientRect().width * 0.9) break;
      const only = kids[0]!;
      if (["UL", "OL", "TABLE", "FORM", "DL", "P"].includes(only.tagName)) break;
      wrap = only;
    }
    const box = wrap.getBoundingClientRect();
    const cs = getComputedStyle(wrap);
    if (cs.display !== "block" && cs.display !== "flow-root") return out;
    const left = box.left + parseFloat(cs.paddingLeft);
    const rightEdge = box.right - parseFloat(cs.paddingRight);
    const width = rightEdge - left;
    if (width < 900) return out;
    const limit = rightEdge - SIDE_MIN_W - SIDE_GAP;
    const kids = [...wrap.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.getBoundingClientRect().height > 0);

    // the longest run of blocks, top to bottom, none of which reaches into the right-hand part
    let run: { top: number; bottom: number; ink: number } | null = null;
    let best: { top: number; bottom: number; ink: number } | null = null;
    const close = () => {
      if (run && (!best || run.bottom - run.top > best.bottom - best.top)) best = run;
      run = null;
    };
    for (const k of kids) {
      const r = k.getBoundingClientRect();
      const ink = inkRight(k, limit);
      if (ink > limit) {
        close();
        continue;
      }
      if (!run) run = { top: r.top, bottom: r.bottom, ink };
      else run = { top: run.top, bottom: r.bottom, ink: Math.max(run.ink, ink) };
    }
    close();
    const found = best as { top: number; bottom: number; ink: number } | null;
    if (!found || found.bottom - found.top < MIN_GAP) return out;

    const w = Math.min(SIDE_MAX_W, rightEdge - found.ink - SIDE_GAP);
    if (w < SIDE_MIN_W) return out;
    const runH = found.bottom - found.top;
    const count = Math.max(1, Math.min(SIDE_MOST, Math.round(runH / SIDE_EVERY)));
    const each = runH / count;
    const h = Math.min(each - 34, SIDE_MAX_H, w / 1.05);
    if (h < 170) return out;
    if (getComputedStyle(wrap).position === "static") {
      wrap.style.position = "relative";
      wrap.dataset.gapfillRel = "1";
    }
    for (let i = 0; i < count; i++) {
      const chosen = pick(outer, i);
      if (!chosen) break;
      const host = document.createElement("div");
      host.className = `${HOST} no-print`;
      host.setAttribute("aria-hidden", "true");
      host.style.position = "absolute";
      host.style.right = `${parseFloat(cs.paddingRight)}px`;
      host.style.top = `${found.top - box.top + each * i + (each - h) / 2}px`;
      host.style.width = `${w}px`;
      wrap.appendChild(host);
      out.push({ host, ...chosen, ratio: clamp(w / h, 1.05, 2.4) });
    }
  }
  return out;
}

/** A figure in the short column of one two-column grid, when there is room for one. */
function gridSlot(grid: HTMLElement, pick: Pick): Slot[] {
  const cols = [...grid.children].filter((c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains(HOST));
  if (cols.length !== 2) return [];
  const [a, b] = cols as [HTMLElement, HTMLElement];
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  // side by side only: stacked columns have no gap to fill
  if (Math.abs(ra.top - rb.top) > 8 || ra.width < 220 || rb.width < 220) return [];
  const short = contentHeight(a) <= contentHeight(b) ? a : b;
  const tall = short === a ? b : a;
  const gap = contentHeight(tall) - contentHeight(short);
  if (gap < MIN_GAP || short.querySelector(HAS_OWN)) return [];
  const width = short.getBoundingClientRect().width;
  // a column that travels with the page (sticky) must still fit in the window with its figure
  const sticky = getComputedStyle(short).position === "sticky";
  const room = sticky ? window.innerHeight - 120 - contentHeight(short) : gap - 34;
  const height = Math.min(gap - 34, MAX_H, width / 1.25, room);
  if (height < 170) return [];
  const chosen = pick(grid, 0);
  if (!chosen) return [];
  const host = document.createElement("div");
  host.className = `${HOST} no-print`;
  host.setAttribute("aria-hidden", "true");
  host.style.marginTop = "2.125rem";
  host.style.maxWidth = "22rem";
  short.appendChild(host);
  return [{ host, ...chosen, ratio: clamp(Math.min(width, COL_MAX_W) / height, 1.1, 2.4) }];
}

/** the height a column's own content takes, whatever the grid stretched it to */
function contentHeight(el: HTMLElement): number {
  let bottom = 0;
  const top = el.getBoundingClientRect().top;
  for (const c of el.children) {
    if (c.classList.contains(HOST)) continue;
    const r = c.getBoundingClientRect();
    if (r.height > 0) bottom = Math.max(bottom, r.bottom - top);
  }
  return bottom || el.getBoundingClientRect().height;
}

export function GapFill() {
  const pathname = usePathname();
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    let timer = 0;
    let made: Slot[] = [];
    let io: IntersectionObserver | null = null;
    const clear = () => {
      io?.disconnect();
      io = null;
      for (const s of made) s.host.remove();
      made = [];
      // a block that was made a positioning context for a figure is put back as it was
      document.querySelectorAll<HTMLElement>("[data-gapfill-rel]").forEach((el) => {
        el.style.position = "";
        delete el.dataset.gapfillRel;
      });
    };
    const run = () => {
      clear();
      setSlots([]);
      if (window.innerWidth < 1024 || !("IntersectionObserver" in window)) return;
      // Sections far from the screen are not laid out yet (content-visibility), so nothing can be
      // measured in them. Each candidate is measured once, when it first comes near the screen.
      // No picture twice on a page: what has been drawn here so far. It starts again with each
      // measuring, which is every change of path (and of width, when every figure is taken away first).
      const used = new Set<string>();
      const pick: Pick = (el, i) => {
        const { heading, body } = topicText(el);
        const seed = hashText(`${pathname}|${heading || body.slice(0, 48)}|${i}`);
        const figure = pickTopic(heading, body, used, seed);
        if (!figure) return null;
        used.add(figure);
        return { figure, seed };
      };
      io = new IntersectionObserver(
        (entries) => {
          const added: Slot[] = [];
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io?.unobserve(el);
            try {
              added.push(...(el.matches(".phi, .phi-r") ? gridSlot(el, pick) : sideSlots(el, pick)));
            } catch {
              /* a section that cannot be measured simply gets no figure */
            }
          }
          if (added.length) {
            made = [...made, ...added];
            setSlots(made);
          }
        },
        { rootMargin: "300px 0px" },
      );
      document.querySelectorAll<HTMLElement>("#main .phi, #main .phi-r, #main section .wrap, #main article .wrap").forEach((el) => {
        io?.observe(el);
      });
    };
    const later = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, ms);
    };
    // after the page has been laid out and its fonts have settled
    later(600);
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      later(300);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      setSlots([]);
      clear();
    };
  }, [pathname]);

  return <>{slots.map((s, i) => (s.host.isConnected ? createPortal(<GapFigure figure={s.figure} seed={s.seed} ratio={s.ratio} />, s.host, `${pathname}-${i}`) : null))}</>;
}

/** one gap figure: its drawing is made once for its seed */
function GapFigure({ figure, seed, ratio }: { figure: TopicId; seed: number; ratio: number }) {
  const draw = useMemo(() => GAP_FIGURES[figure](seed), [figure, seed]);
  return <Figure draw={draw} ratio={ratio} />;
}
