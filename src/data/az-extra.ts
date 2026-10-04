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
export const AZ_EXTRA: readonly { label: string; href: string; kind: string }[] = SECTION_PAGES.map((p) => ({ label: p.label, href: p.href, kind: p.kind }));
