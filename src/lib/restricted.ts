/**
 * Recognising a restricted jurisdiction in what a visitor typed as their
 * country. The list itself is `restrictedJurisdictions` in
 * src/data/accounts.ts (the one the footer, the account pages and the legal
 * page read); this adds the everyday names of two countries on it, so "UK" or
 * "USA" is recognised as well.
 *
 * Used by the account-interest form (in the browser) and by the callback
 * request (in the browser and again on the server). A typed country is a
 * statement by the visitor, not a verification of residence.
 */
import { restrictedJurisdictions } from "@/data/accounts";

export const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  gb: "united kingdom",
  "great britain": "united kingdom",
  britain: "united kingdom",
  england: "united kingdom",
  scotland: "united kingdom",
  wales: "united kingdom",
  "northern ireland": "united kingdom",
  us: "united states",
  usa: "united states",
  america: "united states",
  "united states of america": "united states",
};

/** The listed name of the restricted jurisdiction that was typed, or undefined. */
export function restrictedMatch(country: string, restricted: readonly string[] = restrictedJurisdictions): string | undefined {
  const typed = country.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  const c = COUNTRY_ALIASES[typed] ?? typed;
  return c ? restricted.find((r) => r.toLowerCase() === c) : undefined;
}
