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
          { label: "Forex", href: "/markets/forex" },
          { label: "Metals", href: "/markets/metals" },
          { label: "Indices", href: "/markets/indices" },
          { label: "Energy", href: "/markets/energy" },
          { label: "Equities", href: "/markets/equities" },
          { label: "Crypto", href: "/markets/crypto" },
        ],
      },
      {
        title: "Market Command",
        items: [
          { label: "Overview", href: "/markets", note: "Sessions, reference rates, structure" },
          { label: "World Market Clock", href: "/markets/clock", note: "Who is open right now" },
          { label: "Currency Strength", href: "/markets/currency-strength", note: "ECB reference data" },
          { label: "Market hours by region", href: "/guides", note: "The trading day on your own clock" },
        ],
      },
      {
        title: "What moves them",
        items: [
          { label: "Central Bank Watch", href: "/markets/central-banks" },
          { label: "Economic Events", href: "/markets/events", note: "What the releases mean" },
          { label: "Market history", href: "/history", note: "Eleven crashes and bubbles, 1637 to 2020" },
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
          { label: "Trading Conditions", href: "/trading/conditions" },
          { label: "Funding & Withdrawals", href: "/trading/funding" },
        ],
      },
      {
        title: "Ways to participate",
        items: [
          { label: "Copy Trading", href: "/trading/copy-trading" },
          { label: "PAMM", href: "/trading/pamm" },
          { label: "Introducing Brokers", href: "/partners" },
          { label: "Money Managers", href: "/partners/money-managers" },
        ],
      },
      {
        title: "Trader Toolkit",
        items: [
          { label: "All tools", href: "/tools" },
          { label: "Position Size", href: "/tools/position-size" },
          { label: "Pip Value", href: "/tools/pip-value" },
          { label: "Margin", href: "/tools/margin" },
          { label: "Cost Lab", href: "/tools/cost-lab" },
        ],
      },
      {
        title: "Plan and review",
        items: [
          { label: "Trading journal", href: "/journal", note: "A private log kept in your browser" },
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
          { label: "Getting started", href: "/platforms/metatrader-5#getting-started" },
        ],
      },
      {
        title: "Choose and build",
        items: [
          { label: "Compare platforms", href: "/platforms/compare" },
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
          { label: "Latest", href: "/intelligence", note: "Analysis and explainers" },
          { label: "Daily blog", href: "/intelligence/blog", note: "Short notes from the desks" },
          { label: "Morning Room", href: "/morning-room", note: "Today in sessions and schedule" },
        ],
      },
      {
        title: "Labs: see",
        items: [
          { label: "GIO4X Labs", href: "/labs" },
          { label: "Market Universe", href: "/labs/market-universe", note: "Walk the knowledge graph" },
          { label: "Connect the Dots", href: "/labs/connect-the-dots" },
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
          { label: "The Risk Room", href: "/labs/risk-room", note: "Ruin, streaks, sizing, recovery" },
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
          { label: "Academy", href: "/academy" },
          { label: "Your first trade", href: "/academy/first-trade" },
          { label: "Leverage, in six steps", href: "/academy/leverage-story" },
          { label: "Practice room", href: "/academy/practice" },
          { label: "Level exams", href: "/academy/exams", note: "A short exam for each level" },
          { label: "What kind of trader are you?", href: "/academy/trader-type" },
        ],
      },
      {
        title: "Go deeper",
        items: [
          { label: "Investing", href: "/investing", note: "Stocks, bonds, ETFs, funds, options" },
          { label: "Money calculators", href: "/money", note: "Saving, retirement, loans, inflation" },
          { label: "Chart school", href: "/chart-school", note: "Eight indicators, with the sums" },
          { label: "Chart patterns", href: "/chart-school/patterns", note: "Shapes that draw themselves" },
          { label: "The Playbook", href: "/playbook", note: "Candles and situations" },
          { label: "Scam school", href: "/scam-school", note: "How frauds work, and a checklist" },
        ],
      },
      {
        title: "Look it up",
        items: [
          { label: "Glossary", href: "/glossary" },
          { label: "Glossary star map", href: "/glossary/map" },
          { label: "A to Z index", href: "/a-z", note: "Everything, alphabetically" },
          { label: "Cheat sheets", href: "/academy/cheat-sheets" },
          { label: "Reading list", href: "/academy/books" },
          { label: "Nice & Need", href: "/nice-and-need", note: "Free resources elsewhere" },
        ],
      },
      {
        title: "See it, play it",
        items: [
          { label: "Spread, visualised", href: "/tools/spread-visualizer" },
          { label: "Leverage, visualised", href: "/tools/leverage-visualizer" },
          { label: "Drawdown mathematics", href: "/tools/drawdown" },
          { label: "Order anatomy", href: "/tools/order-anatomy" },
          { label: "The Verse Room", href: "/verse" },
          { label: "Fun@Finance", href: "/fun" },
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
          { label: "About", href: "/about" },
          { label: "Why GIO4X", href: "/about/why-gio4x" },
          { label: "What we are", href: "/about/what-we-are" },
          { label: "GIO4X on the map", href: "/about/world", note: "Offices, sessions, central banks" },
          { label: "Careers", href: "/careers" },
          { label: "Media Centre", href: "/media" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Trust",
        items: [
          { label: "Trust Centre", href: "/trust" },
          { label: "Client fund security", href: "/trust/client-funds" },
          { label: "Online security", href: "/trust/security" },
          { label: "Verify a GIO4X link", href: "/trust/verify", note: "Official software and links" },
          { label: "Legal & documents", href: "/legal" },
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
    ],
  },
];
