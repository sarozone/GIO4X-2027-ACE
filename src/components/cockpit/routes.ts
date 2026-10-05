import type { SceneId } from "@/components/cockpit/scenes";
import { parseLocalePath, type LocalePage } from "@/i18n/config";

/**
 * Which instrument a page opens with.
 *
 * The rule is the owner's: every page in the menus has its own scene, related
 * to that page, and no animation is repeated. Only pages generated from data
 * (an instrument, a glossary term, a lesson, an article) share their family's
 * scene, and they pass their own subject as `tag` (the instrument, the term),
 * so the scene picks that subject out and no two pages look
 * the same. The first matching prefix wins, so the list runs from the most
 * specific path to the least.
 */
export type SceneChoice = { scene: SceneId; tag: string };

const ROUTES: [prefix: string, scene: SceneId, ownTag?: string][] = [
  // pages that used to share their family's instrument: each has its own
  ["/about/what-we-are", "charter"],
  ["/about/why-gio4x", "compass"],
  ["/about/world", "atlas"],
  ["/careers", "atelier"],
  ["/design", "golden"],
  ["/media", "press"],
  ["/preferences", "switchboard"],
  ["/desk", "workbench"],
  ["/whats-new", "ribbon"],
  ["/trust/ai", "lattice"],
  ["/trust/client-funds", "strongroom"],
  ["/trust/data-methodology", "provenance"],
  ["/trust/editorial-standards", "proof"],
  ["/trust/security", "bastion"],
  ["/trust/transparency", "prism"],
  ["/trust/verify", "seal"],
  ["/legal/aml", "sieve"],
  ["/legal/cookies", "drawers"],
  ["/legal/privacy", "veil"],
  ["/legal/risk", "barometer"],
  ["/legal/terms", "accord"],
  ["/explore", "signpost"],
  ["/faq", "lantern"],
  ["/academy/books", "library"],
  ["/academy/first-trade", "firsttrade"],
  ["/academy/practice", "dojo"],
  ["/academy/leverage-story", "lever"],
  ["/academy/cheat-sheets", "blueprint"],
  ["/glossary/map", "starmap"],
  ["/verse", "quill"],
  ["/fun", "jest"],
  ["/playbook", "candlebook"],
  ["/nice-and-need", "shelf"],
  ["/labs/connect-the-dots", "threads"],
  ["/labs/workshop", "forge"],
  ["/labs/engine-room", "gears"],
  ["/labs/forces", "field"],
  ["/labs/scale", "zoom"],
  ["/labs/cinema", "projector"],
  ["/labs/mind", "mind"],
  ["/labs/market-universe", "galaxy"],
  ["/labs/market-day", "daynight"],
  ["/labs/session-globe", "terminator"],
  ["/labs/order-book-3d", "depth"],
  ["/labs/trade-anatomy", "anatomy"],
  ["/labs/simulator", "practice"],
  ["/labs/rule-bench", "rulebench"],
  ["/labs/risk-room", "riskroom"],
  ["/investing", "portfolio"],
  ["/money", "savings"],
  ["/chart-school/patterns", "shapes"],
  ["/chart-school", "oscillator"],
  ["/strategies", "gambit"],
  ["/side-by-side", "scales"],
  ["/history", "chronicle"],
  ["/scam-school", "decoy"],
  ["/journal", "ledger"],
  ["/guides", "meridian"],
  // the market primers have no scene of their own: they open with the Academy's
  ["/primers", "course"],
  ["/downloads", "sheets"],
  ["/a-z", "alphabet"],
  ["/academy/exams", "exam"],
  ["/academy/trader-type", "persona"],
  ["/open-account", "threshold"],
  ["/partners/money-managers", "helm"],
  ["/markets/forex", "forex"],
  ["/markets/metals", "metals"],
  ["/markets/indices", "indices"],
  ["/markets/energy", "energy"],
  ["/markets/equities", "equities"],
  ["/markets/crypto", "crypto"],
  ["/markets/clock", "clock"],
  ["/markets/currency-strength", "strength"],
  ["/markets/central-banks", "banks"],
  ["/markets/events", "events"],
  // the commodities A to Z has no scene of its own: it opens with the Markets instrument, and an energy or
  // precious-metal entry asks for its family's scene itself (see markets/commodities/[slug]/page.tsx)
  ["/markets/commodities", "markets"],
  // the currency and economy profiles have no scene of their own either: both open with the Markets instrument
  ["/markets/currencies", "markets"],
  ["/markets/economies", "markets"],
  ["/markets", "markets"],
  ["/trading/accounts", "accounts"],
  ["/trading/conditions", "conditions"],
  ["/trading/funding", "funding"],
  ["/trading/copy-trading", "copy"],
  ["/trading/pamm", "pamm"],
  ["/trading/demo", "rehearsal"],
  ["/trading/swap-free", "nightless"],
  ["/trading/specifications", "spectable"],
  ["/trading/hours", "weekstrip"],
  ["/trading", "trading"],
  ["/partners", "network"],
  ["/platforms/raptor", "raptor"],
  ["/platforms/metatrader-5", "mt5"],
  ["/platforms/compare", "compare"],
  ["/platforms", "platforms"],
  // every tool opens with a picture of the thing it works out. No tool page reaches the last of these lines today:
  // it stays so that a tool added without a scene of its own still opens with the family's slide rule
  ["/tools/spread-visualizer", "spread"],
  ["/tools/leverage-visualizer", "leverage"],
  ["/tools/drawdown", "drawdown"],
  ["/tools/order-anatomy", "order"],
  ["/tools/position-size", "sizing"],
  ["/tools/pip-value", "pip"],
  ["/tools/margin", "margin"],
  ["/tools/profit-loss", "outcome"],
  ["/tools/risk-reward", "ratio"],
  ["/tools/compound-growth", "compound"],
  ["/tools/currency-converter", "convert"],
  ["/tools/cost-lab", "costs"],
  ["/tools/pivot-points", "pivots"],
  ["/tools/fibonacci-levels", "fibonacci"],
  ["/tools/swap", "financing"],
  ["/tools", "instrument"],
  ["/intelligence/blog", "daily"],
  ["/intelligence", "signal"],
  ["/morning-room", "horizon"],
  ["/labs", "constellation"],
  ["/academy", "course"],
  ["/glossary", "lexicon"],
  ["/faq", "lexicon"],
  ["/search", "lexicon"],
  ["/contact", "beacon"],
  ["/support", "helpdesk"],
  ["/status", "annunciator"],
  ["/trust", "vault"],
  ["/legal", "document"],
  // entry points are themselves the subject of their scene
  ["/sign-in", "gateway", "sign-in"],
  ["/open-account", "gateway", "open-account"],
];

/** Pages whose own scene must not pass to the pages beneath them (each tool has a scene of its own). */
// the Trader Toolkit opens with the slide rule; the workbench is My desk's
const EXACT: Record<string, SceneId> = { "/tools": "instrument" };

/**
 * The translated pages (/de, /ar/guide: docs/I18N.md) have no scene of their own. Each borrows a framed
 * one that fits: the chart of the whole site for a language's home page (the homepage's own flight deck is
 * composed for the homepage's stage and stays there), and for the other three the scene of the English
 * page they stand beside (/explore, /legal/risk, /contact).
 */
const TRANSLATED: Record<LocalePage, SceneId> = { "": "atlas", guide: "signpost", "risk-warning": "barometer", contact: "beacon" };

/** Everything else (About, Careers, Media, Design, What's new, Preferences, not found) carries the rosette. */
const FALLBACK: SceneId = "rosette";

export function sceneFor(pathname: string): SceneChoice {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { scene: "flightdeck", tag: "" };
  const translated = parseLocalePath(path);
  if (translated) return { scene: TRANSLATED[translated.page], tag: translated.lang };
  const exact = Object.prototype.hasOwnProperty.call(EXACT, path) ? EXACT[path] : undefined;
  if (exact) return { scene: exact, tag: "" };
  for (const [prefix, scene, ownTag] of ROUTES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      // the page's own subject is the last segment below the family's root
      const rest = path.slice(prefix.length).split("/").filter(Boolean);
      return { scene, tag: rest.length ? rest[rest.length - 1] : (ownTag ?? "") };
    }
  }
  const parts = path.split("/").filter(Boolean);
  return { scene: FALLBACK, tag: parts[parts.length - 1] ?? "" };
}
