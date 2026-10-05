/**
 * Information architecture. The header mega-menu, footer, HTML site directory,
 * command bar and XML sitemap all read from this one structure, so a page
 * cannot be orphaned by forgetting to add it somewhere.
 */
export type NavItem = { label: string; href: string; note?: string };
export type NavGroup = { title: string; items: NavItem[] };
export type NavSection = {
  key: string;
  label: string;
  href: string;
  /** one line shown at the left of the mega-menu */
  blurb: string;
  groups: NavGroup[];
};

/**
 * The primary navigation. Every page appears here ONCE: a page listed in two
 * groups shows twice in the menu, in the footer and in the site directory. The
 * groups are kept to a similar length (three to eight rows) so the columns of
 * the mega-menu and the blocks of the footer stand level.
 *
 * A section's own page (its `href`) is not repeated as a row: the menu, the
 * drawer, the footer and the site directory each link it from the section's
 * name, so a row for it would be the same link twice.
 */
export const nav: NavSection[] = [
  {
    key: "markets",
    label: "Markets",
    href: "/markets",
    blurb: "Six asset classes, one account. Explore what trades, when it trades and what moves it.",
    groups: [
      {
        title: "Asset classes",
        items: [
          { label: "Forex", href: "/markets/forex", note: "Ten currency pairs" },
          { label: "Metals", href: "/markets/metals", note: "Gold, silver, platinum, palladium" },
          { label: "Indices", href: "/markets/indices", note: "Six stock indices" },
          { label: "Energy", href: "/markets/energy", note: "Brent, WTI, natural gas" },
          { label: "Equities", href: "/markets/equities", note: "Six large US shares" },
          { label: "Crypto", href: "/markets/crypto", note: "Five crypto-assets" },
        ],
      },
      {
        title: "Market Command",
        items: [
          { label: "World Market Clock", href: "/markets/clock", note: "Who is open right now" },
          { label: "Currency Strength", href: "/markets/currency-strength", note: "ECB reference data" },
          { label: "Currency profiles", href: "/markets/currencies", note: "Who issues each, and what moves it" },
          { label: "Market hours by region", href: "/guides", note: "The trading day on your own clock" },
        ],
      },
      {
        title: "What moves them",
        items: [
          { label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets rates, and how" },
          { label: "Economic Events", href: "/markets/events", note: "What the releases mean" },
          { label: "Economy profiles", href: "/markets/economies", note: "The economies behind the currencies" },
          { label: "Market history", href: "/history", note: "Eleven crashes and bubbles, 1637 to 2020" },
          { label: "Commodities A to Z", href: "/markets/commodities", note: "From aluminium to zinc, explained" },
        ],
      },
    ],
  },
  {
    key: "trading",
    label: "Trading",
    href: "/trading",
    blurb: "Accounts, conditions and costs, stated plainly.",
    groups: [
      {
        title: "Accounts",
        items: [
          { label: "Account Types", href: "/trading/accounts", note: "Classic, Premium, ECN" },
          { label: "Choose an Account", href: "/trading/accounts/choose", note: "Four questions" },
          { label: "Demo account", href: "/trading/demo", note: "Practise with virtual money" },
          { label: "Swap-free accounts", href: "/trading/swap-free", note: "No overnight financing" },
          { label: "Trading Conditions", href: "/trading/conditions", note: "Spreads, leverage, margin rules" },
          { label: "Contract specifications", href: "/trading/specifications", note: "Every instrument in one table" },
          { label: "Trading hours", href: "/trading/hours", note: "Sessions, the week, holidays" },
          { label: "Funding & Withdrawals", href: "/trading/funding", note: "Paying in and taking out" },
          { label: "Dividing funds", href: "/trading/funding/allocation", note: "One wallet, two platforms: a demonstration" },
        ],
      },
      {
        title: "Ways to participate",
        items: [
          { label: "Copy Trading", href: "/trading/copy-trading", note: "Following another trader" },
          { label: "PAMM", href: "/trading/pamm", note: "A managed pool of accounts" },
          { label: "Introducing Brokers", href: "/partners", note: "Refer clients to GIO4X" },
          { label: "Money Managers", href: "/partners/money-managers", note: "For people who manage funds" },
        ],
      },
      {
        title: "Trader Toolkit",
        items: [
          { label: "All tools", href: "/tools", note: "Twenty calculators and visualisers" },
          { label: "Position Size", href: "/tools/position-size", note: "Size from risk and stop" },
          { label: "Pip Value", href: "/tools/pip-value", note: "What one pip is worth" },
          { label: "Margin", href: "/tools/margin", note: "What a position sets aside" },
          { label: "Cost Lab", href: "/tools/cost-lab", note: "Spread, commission, swap together" },
          { label: "Swap", href: "/tools/swap", note: "The overnight charge or credit" },
          { label: "Pivot Points", href: "/tools/pivot-points", note: "Seven levels from one bar" },
          { label: "Fibonacci Levels", href: "/tools/fibonacci-levels", note: "Retracements and extensions" },
        ],
      },
      {
        title: "Plan and review",
        items: [
          { label: "Trading journal", href: "/journal", note: "A private log kept in your browser" },
          { label: "Trading plan builder", href: "/trading-plan", note: "Your rules in your words, to print" },
          { label: "Strategy library", href: "/strategies", note: "Twelve approaches, described" },
          { label: "Side by side", href: "/side-by-side", note: "Order types, instruments, costs" },
          { label: "Downloads", href: "/downloads", note: "Printable plan and checklists" },
        ],
      },
    ],
  },
  {
    key: "platforms",
    label: "Platforms",
    href: "/platforms",
    blurb: "Two ways to enter the market. One GIO4X.",
    groups: [
      {
        title: "777 Raptor",
        items: [
          { label: "Explore Raptor", href: "/platforms/raptor", note: "Built for the market" },
        ],
      },
      {
        title: "MetaTrader 5",
        items: [
          { label: "Explore MT5", href: "/platforms/metatrader-5", note: "Global markets, familiar workflow" },
          { label: "Getting started", href: "/platforms/metatrader-5#getting-started", note: "First steps on MT5" },
          { label: "Order errors explained", href: "/platforms/metatrader-5/order-errors", note: "Why an order was rejected" },
        ],
      },
      {
        title: "Choose and build",
        items: [
          { label: "Compare platforms", href: "/platforms/compare", note: "Raptor and MT5, side by side" },
          { label: "Send your EA or indicator", href: "/labs/rule-bench#send", note: "Upload the source for our staff to read" },
        ],
      },
    ],
  },
  {
    key: "intelligence",
    label: "Intelligence",
    href: "/intelligence",
    blurb: "A publication, not a blog: analysis, explainers and tools for people who take markets seriously.",
    groups: [
      {
        title: "Read",
        items: [
          { label: "Daily blog", href: "/intelligence/blog", note: "One market. One story. Every day." },
          { label: "Morning Room", href: "/morning-room", note: "Today in sessions and schedule" },
        ],
      },
      {
        title: "Labs: see",
        items: [
          { label: "GIO4X Labs", href: "/labs", note: "Experiments you can handle" },
          { label: "Market Universe", href: "/labs/market-universe", note: "Walk the knowledge graph" },
          { label: "Connect the Dots", href: "/labs/connect-the-dots", note: "How a few things link" },
          { label: "One day of markets", href: "/labs/market-day", note: "24 hours as a two-minute film" },
          { label: "Session globe", href: "/labs/session-globe", note: "The four FX sessions, from the clock" },
          { label: "Order book in 3D", href: "/labs/order-book-3d", note: "Bids, asks, spread and depth" },
        ],
      },
      {
        title: "Labs: machines",
        items: [
          { label: "The Workshop", href: "/labs/workshop", note: "Candle forge, tightrope, pip reels" },
          { label: "The Engine Room", href: "/labs/engine-room", note: "Margin call, swap, slippage" },
          { label: "Forces", href: "/labs/forces", note: "Tug of war, lever room, shockwave" },
          { label: "The Long Scroll", href: "/labs/scale", note: "One tick to one decade" },
          { label: "The Screening Room", href: "/labs/cinema", note: "Six set pieces" },
          { label: "The Mind Room", href: "/labs/mind", note: "Four games about the person" },
        ],
      },
      {
        title: "Labs: practise",
        items: [
          { label: "Practice desk", href: "/labs/simulator", note: "A simulation on invented prices" },
          { label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule and test it" },
          { label: "Trade Anatomy", href: "/labs/trade-anatomy", note: "One order, click to balance" },
          { label: "The Risk Room", href: "/labs/risk-room", note: "Ruin, streaks, sizing, a portfolio" },
        ],
      },
    ],
  },
  {
    key: "academy",
    label: "Academy",
    href: "/academy",
    blurb: "Mechanics and concepts, taught responsibly. No promises of trading success.",
    groups: [
      {
        title: "Start here",
        items: [
          { label: "Academy", href: "/academy", note: "Lessons, level by level" },
          { label: "Your first trade", href: "/academy/first-trade", note: "A ten-minute course" },
          { label: "Leverage, in six steps", href: "/academy/leverage-story", note: "A story told as you scroll" },
          { label: "Practice room", href: "/academy/practice", note: "Build an order, fix a ticket" },
          { label: "Level exams", href: "/academy/exams", note: "A short exam for each level" },
          { label: "Question of the day", href: "/academy/question-of-the-day", note: "One a day, and a run of days" },
          { label: "What kind of trader are you?", href: "/academy/trader-type", note: "Ten questions on how you work" },
        ],
      },
      {
        title: "Go deeper",
        items: [
          { label: "Investing", href: "/investing", note: "Stocks, bonds, ETFs, funds, options" },
          { label: "Investor case studies", href: "/investing/case-studies", note: "How professionals decide, with sources" },
          { label: "Money calculators", href: "/money", note: "Saving, retirement, loans, inflation" },
          { label: "Market primers", href: "/primers", note: "Bonds, funds, orders, microstructure" },
          { label: "Chart school", href: "/chart-school", note: "Indicators, with the sums" },
          { label: "Chart patterns", href: "/chart-school/patterns", note: "Shapes that draw themselves" },
          { label: "The Playbook", href: "/playbook", note: "Candles and situations" },
          { label: "Scam school", href: "/scam-school", note: "How frauds work, and a checklist" },
        ],
      },
      {
        title: "Look it up",
        items: [
          { label: "Glossary", href: "/glossary", note: "153 terms, plainly defined" },
          { label: "Glossary star map", href: "/glossary/map", note: "The glossary as a night sky" },
          { label: "A to Z index", href: "/a-z", note: "Everything, alphabetically" },
          { label: "Cheat sheets", href: "/academy/cheat-sheets", note: "One-page summaries to print" },
          { label: "Reading list", href: "/academy/books", note: "Books worth the time" },
          { label: "Nice & Need", href: "/nice-and-need", note: "Free resources elsewhere" },
        ],
      },
      {
        title: "See it, play it",
        items: [
          { label: "Spread, visualised", href: "/tools/spread-visualizer", note: "The gap you pay to cross" },
          { label: "Leverage, visualised", href: "/tools/leverage-visualizer", note: "Small stake, large exposure" },
          { label: "Drawdown mathematics", href: "/tools/drawdown", note: "Why a loss needs a bigger gain" },
          { label: "Order anatomy", href: "/tools/order-anatomy", note: "The parts of one order" },
          { label: "The Verse Room", href: "/verse", note: "Riddles, rhymes and a sonnet" },
          { label: "Fun@Finance", href: "/fun", note: "Jokes, comics and bingo" },
        ],
      },
    ],
  },
  {
    key: "company",
    label: "Company",
    href: "/about",
    blurb: "Who we are, how we work and how to verify it.",
    groups: [
      {
        title: "GIO4X",
        items: [
          { label: "About", href: "/about", note: "Who GIO4X is" },
          { label: "Why GIO4X", href: "/about/why-gio4x", note: "What we do differently" },
          { label: "What we are", href: "/about/what-we-are", note: "And what we are not" },
          { label: "GIO4X on the map", href: "/about/world", note: "Offices, sessions, central banks" },
          { label: "Careers", href: "/careers", note: "Working with us" },
          { label: "Media Centre", href: "/media", note: "Logos, facts and press contact" },
          { label: "Contact", href: "/contact", note: "Write to us" },
        ],
      },
      {
        title: "Trust",
        items: [
          { label: "Trust Centre", href: "/trust", note: "How to check what we say" },
          { label: "Client fund security", href: "/trust/client-funds", note: "How client money is held" },
          { label: "Online security", href: "/trust/security", note: "Protecting your account" },
          { label: "Verify a GIO4X link", href: "/trust/verify", note: "Official software and links" },
          { label: "Legal & documents", href: "/legal", note: "Terms, risk, privacy" },
        ],
      },
    ],
  },
];

/** Pages that exist but do not belong in the primary navigation. */
export const secondaryNav: NavGroup[] = [
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", href: "/faq" },
      { label: "Support requests", href: "/support" },
      { label: "System status", href: "/status" },
      { label: "My desk", href: "/desk" },
      { label: "Display & privacy preferences", href: "/preferences" },
      { label: "Take the tour", href: "/#tour" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Risk Disclosure", href: "/legal/risk" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "AML Policy", href: "/legal/aml" },
      { label: "Cookie Notice", href: "/legal/cookies" },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Transparency", href: "/trust/transparency" },
      { label: "Data methodology", href: "/trust/data-methodology" },
      { label: "AI at GIO4X", href: "/trust/ai" },
      { label: "Editorial standards", href: "/trust/editorial-standards" },
      { label: "Designing GIO4X", href: "/design" },
      { label: "What’s new", href: "/whats-new" },
      { label: "Explore GIO4X", href: "/explore" },
      { label: "Sitemap", href: "/explore/sitemap" },
    ],
  },
];

/* ---- where a page stands -------------------------------------------------- */

/**
 * A page's place in the primary navigation: the section that lists it and, when
 * one of that section's rows is the page (or the listed page above it), that
 * row's href exactly as written above. `exact` is false for a page below a
 * listed page, which inherits its parent's place.
 */
export type NavPlace = { section: NavSection; href: string | null; exact: boolean };

/**
 * The one rule for "which section is this page in", read from the list above
 * and from nothing else, so the header and the breadcrumbs cannot disagree
 * with the menus. A page is in the section that LISTS it, whatever its URL
 * begins with. Where a path is listed more than once, the listing whose hash
 * is the current hash wins; otherwise the first that lists the bare path.
 * A path listed nowhere takes the place of the nearest listed page above it;
 * with none (the home page, a translated page, a utility page) it is null.
 */
export function navPlace(pathname: string | null | undefined, hash = ""): NavPlace | null {
  const path = (pathname ?? "").split(/[?#]/)[0].replace(/\/+$/, "");
  if (!path.startsWith("/")) return null;
  for (let at = path; at; at = at.slice(0, at.lastIndexOf("/"))) {
    // every listing of this path, in the order of the menus; within a section its rows come before its own page
    const listed: { section: NavSection; href: string | null }[] = [];
    for (const section of nav) {
      for (const g of section.groups) for (const i of g.items) if (i.href.split("#")[0] === at) listed.push({ section, href: i.href });
      if (section.href === at) listed.push({ section, href: null });
    }
    if (!listed.length) continue;
    const exact = at === path;
    const byHash = exact && hash.length > 1 ? listed.find((l) => l.href === at + hash) : undefined;
    const bare = listed.find((l) => !l.href?.includes("#"));
    const hit = byHash ?? bare;
    // listed only as a place on the page, and this is not that place: the section is known, no row is the page
    return hit ? { section: hit.section, href: hit.href, exact } : { section: listed[0].section, href: null, exact };
  }
  return null;
}

/** The key of the one section to mark as current for a page, or null. */
export function activeSection(pathname: string | null | undefined, hash = ""): string | null {
  return navPlace(pathname, hash)?.section.key ?? null;
}

/** The first breadcrumb of a page: the section that lists it (or lists the page above it), or null. */
export function sectionCrumb(pathname: string): { name: string; href: string } | null {
  const section = navPlace(pathname)?.section;
  return section ? { name: section.label, href: section.href } : null;
}
