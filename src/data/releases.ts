/**
 * What has been added to the site lately, newest first, for the "recently
 * added" ribbon (components/play/Guided.tsx). An id is a date and a letter and
 * sorts as text: the ribbon is put away until an entry with a later id exists.
 * A new entry goes at the top.
 */
export const RELEASES: readonly { id: string; title: string; href: string }[] = [
  { id: "2026-10-05a", title: "Commodities A to Z: from aluminium to zinc", href: "/markets/commodities" },
  { id: "2026-10-04m", title: "Pivot points, Fibonacci levels and swap calculators", href: "/tools" },
  { id: "2026-10-04l", title: "Trading hours and market holidays", href: "/trading/hours" },
  { id: "2026-10-04k", title: "Contract specifications in one table", href: "/trading/specifications" },
  { id: "2026-10-04j", title: "Demo and swap-free accounts explained", href: "/trading/demo" },
  { id: "2026-10-04i", title: "Investor case studies, with sources", href: "/investing/case-studies" },
  { id: "2026-10-04h", title: "Every instrument, in depth", href: "/markets" },
  { id: "2026-10-04g", title: "Why was this MT5 order rejected?", href: "/platforms/metatrader-5/order-errors" },
  { id: "2026-10-04f", title: "Investing, money calculators, chart school and more", href: "/a-z" },
  { id: "2026-10-04e", title: "Trading journal: a private log in your browser", href: "/journal" },
  { id: "2026-10-04d", title: "Send us your EA or indicator", href: "/labs/rule-bench#send" },
  { id: "2026-10-04c", title: "Rule bench: build a rule and test it", href: "/labs/rule-bench" },
  { id: "2026-10-04b", title: "Nice & Need: the best free resources", href: "/nice-and-need" },
  { id: "2026-10-04a", title: "The Playbook: patterns and situations", href: "/playbook" },
  { id: "2026-10-03f", title: "Fun@Finance: jokes, comics and riddles", href: "/fun" },
  { id: "2026-10-03e", title: "Your first trade: a ten-minute course", href: "/academy/first-trade" },
  { id: "2026-10-03d", title: "The glossary as a star map", href: "/glossary/map" },
  { id: "2026-10-03c", title: "Send us a riddle", href: "/verse#readers" },
  { id: "2026-10-03b", title: "The Screening Room", href: "/labs/cinema" },
  { id: "2026-10-03a", title: "The practice room", href: "/academy/practice" },
];
