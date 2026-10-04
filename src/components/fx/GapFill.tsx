"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Figure, TAU, clamp, lerp, rgba, type FigureDraw } from "@/components/figures/Figure";

/**
 * GAP FILL — a moving figure in the empty half of a two-column section.
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
 * The figures are decoration and say nothing: no price, no number, no label
 * that could be read as data. They are hidden from assistive technology, they
 * answer the pointer (the Figure host supplies it), and under reduced motion
 * or low visual effects each is one still frame. Which of the six a section
 * gets is decided by its position on the page, so a page keeps the same ones.
 */

const MIN_GAP = 230;
const MAX_H = 440;
const HOST = "gx-gapfill";
/** a column that already carries a picture, a form or a table is left alone */
const HAS_OWN = "canvas, img, video, picture, form, table, .gx-stage, .gx-figure, svg[width], svg[viewBox]";

/* ---- the six figures ------------------------------------------------------- */

/** a field of short strokes that lean away from the pointer */
const field: FigureDraw = ({ ctx, w, h, t, hover, mx, my, pal, enter }) => {
  const step = 26;
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const dx = x - mx;
      const dy = y - my;
      const d = Math.hypot(dx, dy) || 1;
      const push = hover * clamp(1 - d / 190);
      const a = Math.sin(x * 0.012 + t * 0.5) + Math.cos(y * 0.015 - t * 0.4) + Math.atan2(dy, dx) * push * 1.2;
      const len = (7 + push * 9) * enter;
      ctx.strokeStyle = rgba(push > 0.05 ? pal.accent : pal.ink3, 0.35 + push * 0.6);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  }
};

/** a row of candle shapes that breathe; the pointer sends a wave along them */
const candles: FigureDraw = ({ ctx, w, h, t, hover, mx, pal, enter }) => {
  const n = Math.max(10, Math.floor(w / 22));
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const x = i * bw + bw / 2;
    const near = hover * clamp(1 - Math.abs(x - mx) / 150);
    const mid = h * 0.5 + Math.sin(i * 0.55 + t * 0.6) * h * 0.14 + Math.sin(i * 0.17 - t * 0.25) * h * 0.1 - near * h * 0.12;
    const body = (h * 0.08 + Math.abs(Math.sin(i * 1.3 + t * 0.8)) * h * 0.1) * enter;
    const wick = body + h * 0.07 * (1 + near);
    const up = Math.sin(i * 1.3 + t * 0.8) > 0;
    const c = near > 0.1 ? pal.accent : up ? pal.emerald : pal.ink3;
    ctx.strokeStyle = rgba(c, 0.8);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, mid - wick);
    ctx.lineTo(x, mid + wick);
    ctx.stroke();
    ctx.fillStyle = rgba(c, up ? 0.75 : 0.3);
    ctx.fillRect(x - bw * 0.3, mid - body, bw * 0.6, body * 2);
  }
};

/** rings with travellers on them; the pointer tips the whole system */
const orbits: FigureDraw = ({ ctx, w, h, t, hover, mx, my, pal, enter }) => {
  const cx = w / 2 + (mx - w / 2) * 0.08 * hover;
  const cy = h / 2 + (my - h / 2) * 0.08 * hover;
  const R = Math.min(w, h) * 0.44;
  const tilt = 0.42 + ((my - h / 2) / h) * 0.3 * hover;
  for (let k = 1; k <= 5; k++) {
    const r = (R * k) / 5;
    ctx.strokeStyle = rgba(k % 2 ? pal.ink3 : pal.gold, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * enter, r * tilt * enter, 0, 0, TAU);
    ctx.stroke();
    const a = t * (0.5 / k) * (k % 2 ? 1 : -1) + k * 1.7;
    const px = cx + Math.cos(a) * r * enter;
    const py = cy + Math.sin(a) * r * tilt * enter;
    ctx.fillStyle = rgba(k % 2 ? pal.accent : pal.teal, 0.95);
    ctx.beginPath();
    ctx.arc(px, py, 3 + hover * 1.5, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = rgba(pal.ink, 0.9);
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, TAU);
  ctx.fill();
};

/** a sheet of points; a ripple spreads from the pointer */
const lattice: FigureDraw = ({ ctx, w, h, t, hover, mx, my, pal, enter }) => {
  const step = 22;
  for (let y = step; y < h; y += step) {
    for (let x = step; x < w; x += step) {
      const d = Math.hypot(x - mx, y - my);
      const ripple = Math.sin(d * 0.06 - t * 3) * clamp(1 - d / 240) * hover;
      const idle = Math.sin(x * 0.03 + y * 0.02 + t * 0.7) * 0.35;
      const lift = (ripple + idle) * 5 * enter;
      const r = 1.2 + Math.abs(ripple) * 2.2;
      ctx.fillStyle = rgba(Math.abs(ripple) > 0.15 ? pal.accent : pal.ink3, 0.45 + Math.abs(ripple) * 0.5);
      ctx.beginPath();
      ctx.arc(x, y - lift, r, 0, TAU);
      ctx.fill();
    }
  }
};

/** layered lines that swell under the pointer */
const waves: FigureDraw = ({ ctx, w, h, t, hover, mx, my, pal, enter }) => {
  const layers = 7;
  for (let k = 0; k < layers; k++) {
    const base = lerp(h * 0.18, h * 0.86, k / (layers - 1));
    ctx.strokeStyle = rgba(k === 3 ? pal.accent : k % 2 ? pal.ink3 : pal.teal, 0.35 + (k === 3 ? 0.5 : 0.15));
    ctx.lineWidth = k === 3 ? 1.8 : 1.1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const near = hover * clamp(1 - Math.abs(x - mx) / 170) * clamp(1 - Math.abs(base - my) / 150);
      const y = base + (Math.sin(x * 0.018 + t * (0.5 + k * 0.08) + k) * 11 + Math.sin(x * 0.006 - t * 0.3 + k * 2) * 9) * enter - near * 26;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

/** drifting points joined when they come close; the pointer joins them too */
const constellation: FigureDraw = ({ ctx, w, h, t, hover, mx, my, pal, enter }) => {
  const n = Math.round(clamp((w * h) / 9000, 14, 34));
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = (0.5 + 0.44 * Math.sin(i * 12.9898 + t * (0.07 + (i % 5) * 0.012))) * w;
    const y = (0.5 + 0.42 * Math.cos(i * 78.233 + t * (0.06 + (i % 7) * 0.01))) * h;
    pts.push([x, y]);
  }
  const reach = 92;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]);
      if (d > reach) continue;
      ctx.strokeStyle = rgba(pal.ink3, (1 - d / reach) * 0.5 * enter);
      ctx.beginPath();
      ctx.moveTo(pts[i]![0], pts[i]![1]);
      ctx.lineTo(pts[j]![0], pts[j]![1]);
      ctx.stroke();
    }
    const dm = Math.hypot(pts[i]![0] - mx, pts[i]![1] - my);
    if (hover > 0.02 && dm < 150) {
      ctx.strokeStyle = rgba(pal.accent, (1 - dm / 150) * 0.85 * hover);
      ctx.beginPath();
      ctx.moveTo(pts[i]![0], pts[i]![1]);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(i % 6 === 0 ? pal.gold : pal.ink2, 0.9);
    ctx.beginPath();
    ctx.arc(pts[i]![0], pts[i]![1], i % 6 === 0 ? 2.6 : 1.8, 0, TAU);
    ctx.fill();
  }
};

const DRAWS: readonly FigureDraw[] = [waves, constellation, candles, orbits, lattice, field];

/* ---- finding the gaps ------------------------------------------------------ */

type Slot = { host: HTMLElement; kind: number; ratio: number };

/** the room there must be beside a run of narrow blocks, and the space kept between the words and the figure */
const SIDE_MIN_W = 260;
const SIDE_GAP = 55;
const SIDE_MAX_W = 480;
/** one figure for about this much height of text, and never more than this many in a run */
const SIDE_EVERY = 620;
const SIDE_MOST = 3;
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
function sideSlots(outer: HTMLElement, start: number): Slot[] {
  const out: Slot[] = [];
  let n = start;
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
    const h = Math.min(each - 34, MAX_H, w / 1.05);
    if (h < 170) return out;
    if (getComputedStyle(wrap).position === "static") {
      wrap.style.position = "relative";
      wrap.dataset.gapfillRel = "1";
    }
    for (let i = 0; i < count; i++) {
      const host = document.createElement("div");
      host.className = `${HOST} flat gx-stage no-print`;
      host.setAttribute("aria-hidden", "true");
      host.style.position = "absolute";
      host.style.right = `${parseFloat(cs.paddingRight)}px`;
      host.style.top = `${found.top - box.top + each * i + (each - h) / 2}px`;
      host.style.width = `${w}px`;
      wrap.appendChild(host);
      n += 1;
      out.push({ host, kind: n % DRAWS.length, ratio: clamp(w / h, 1.05, 2.4) });
    }
  }
  return out;
}

/** A figure in the short column of one two-column grid, when there is room for one. */
function gridSlot(grid: HTMLElement, n: number): Slot[] {
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
  const host = document.createElement("div");
  host.className = `${HOST} flat gx-stage no-print`;
  host.setAttribute("aria-hidden", "true");
  host.style.marginTop = "2.125rem";
  host.style.maxWidth = "34rem";
  short.appendChild(host);
  return [{ host, kind: n % DRAWS.length, ratio: clamp(Math.min(width, 544) / height, 1.1, 2.4) }];
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
      const order = new Map<Element, number>();
      io = new IntersectionObserver(
        (entries) => {
          const added: Slot[] = [];
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io?.unobserve(el);
            const n = order.get(el) ?? 0;
            try {
              added.push(...(el.matches(".phi, .phi-r") ? gridSlot(el, n) : sideSlots(el, n)));
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
      let n = 0;
      document.querySelectorAll<HTMLElement>("#main .phi, #main .phi-r, #main section .wrap, #main article .wrap").forEach((el) => {
        order.set(el, n++);
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

  return <>{slots.map((s, i) => (s.host.isConnected ? createPortal(<Figure draw={DRAWS[s.kind] ?? waves} ratio={s.ratio} />, s.host, `${pathname}-${i}`) : null))}</>;
}
