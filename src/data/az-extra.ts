import { COMMODITIES, commodityHref } from "@/data/commodities";
import { CURRENCY_PROFILES, currencyProfileHref } from "@/data/currency-profiles";
import { ECONOMIES, economyHref } from "@/data/economies";
import { SECTION_PAGES } from "@/data/sections";

/**
 * Pages for the A to Z index (/a-z) that are not found in the modules it reads.
 *
 * The index gathers its entries from the glossary, the tools, the Academy
 * lessons, the Playbook, the comparisons and the navigation. The pages
 * generated from the newer data modules (investing, money, chart school,
 * strategies, history, scam school, region guides) are listed once in
 * src/data/sections.ts and come in from there. An address already in the
 * index is ignored, so nothing appears twice.
 */
export const AZ_EXTRA: readonly { label: string; href: string; kind: string }[] = [
  ...SECTION_PAGES.map((p) => ({ label: p.label, href: p.href, kind: p.kind })),
  // the commodities A to Z (/markets/commodities): one entry for each commodity
  ...COMMODITIES.map((c) => ({ label: c.name, href: commodityHref(c), kind: "Commodity" })),
  // the currency and economy profiles (/markets/currencies, /markets/economies): one entry for each
  ...CURRENCY_PROFILES.map((c) => ({ label: `${c.name} (${c.code})`, href: currencyProfileHref(c), kind: "Currency" })),
  ...ECONOMIES.map((e) => ({ label: `${e.name} (economy)`, href: economyHref(e), kind: "Economy" })),
];
