/**
 * Questions offered to a visitor who has not asked GIO4X AI anything yet: in
 * the Lens's "Ask" view (the first three for the section the page is in) and
 * in the question box on the homepage and the Help page (all four).
 *
 * Every one is a question the published pages answer: a definition from the
 * glossary, how a tool or a platform works, when a market is open, where a
 * document is. None asks for advice, a forecast, or a GIO4X fact that is not
 * published yet (fees, regulation, processing times: docs/WAITING-FOR-ABE.md).
 * Keep it that way when adding one: a suggestion the assistant has to decline
 * is worse than no suggestion.
 *
 * Imports nothing, so the Lens and the boxes can both read it.
 */

export type AskSection = "markets" | "trading" | "platforms" | "academy" | "general";

/** Which part of the site an address belongs to, for this purpose only. First match wins. */
const SECTION_OF: [AskSection, string[]][] = [
  ["markets", ["/markets"]],
  ["trading", ["/trading", "/tools"]],
  ["platforms", ["/platforms"]],
  ["academy", ["/academy", "/glossary", "/faq"]],
];

const SUGGESTED: Record<AskSection, [string, string, string, string]> = {
  markets: ["When is the forex market open?", "What is a pip?", "What is a spread?", "What is a currency pair?"],
  trading: ["How does a margin call work?", "What does the Position Size tool work out?", "What is a stop out?", "Where is the Risk Disclosure?"],
  platforms: ["What is MetaTrader 5?", "What is 777 Raptor?", "What is the difference between a market order and a limit order?", "What is slippage?"],
  academy: ["What is leverage?", "What is a swap?", "What is a lot?", "How does a margin call work?"],
  general: ["How does a margin call work?", "What has GIO4X not yet published?", "Where is the Privacy Policy?", "What is a pip?"],
};

export function askSection(pathname: string | null | undefined): AskSection {
  const path = pathname ?? "/";
  return SECTION_OF.find(([, prefixes]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`)))?.[0] ?? "general";
}

/** The first `count` suggestions (four at most) for the page at `pathname`. */
export function askSuggestions(pathname: string | null | undefined, count = 3): string[] {
  return SUGGESTED[askSection(pathname)].slice(0, count);
}
