import { glossary } from "@/data/glossary";

export const dynamic = "force-static";

/**
 * The glossary as the pop-up cards need it: slug → [term, definition] and
 * nothing else, generated at build time and cached at the edge. It is fetched
 * once, the first time a visitor points at (or focuses, or taps) a glossary
 * link, so no page carries the definitions in its own bundle
 * (components/glossary/TermCards.tsx).
 */
export function GET() {
  const cards: Record<string, [string, string]> = {};
  for (const t of glossary) cards[t.slug] = [t.term, t.definition];
  return Response.json(cards, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
