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
          { label: "Overview", href: "/markets", note: "Sessions, reference rates, structure" },
          { label: "World Market Clock", href: "/markets/clock", note: "Who is open right now" },
          { label: "Currency Strength", href: "/markets/currency-strength", note: "ECB reference data" },
          { label: "Market hours by region", href: "/guides", note: "The trading day on your own clock" },
        ],
      },
      {
        title: "What moves them",
        items: [
          { label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets rates, and how" },
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
          { label: "Trading Conditions", href: "/trading/conditions", note: "Spreads, leverage, margin rules" },
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
          { label: "All tools", href: "/tools", note: "Twelve calculators and visualisers" },
          { label: "Position Size", href: "/tools/position-size", note: "Size from risk and stop" },
          { label: "Pip Value", href: "/tools/pip-value", note: "What one pip is worth" },
          { label: "Margin", href: "/tools/margin", note: "What a position sets aside" },
          { label: "Cost Lab", href: "/tools/cost-lab", note: "Spread, commission, swap together" },
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
          { label: "Latest", href: "/intelligence", note: "Analysis and explainers" },
          { label: "Daily blog", href: "/intelligence/blog", note: "Short notes from the desks" },
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
          { label: "What kind of trader are you?", href: "/academy/trader-type", note: "Ten questions on how you work" },
        ],
      },
      {
        title: "Go deeper",
        items: [
          { label: "Investing", href: "/investing", note: "Stocks, bonds, ETFs, funds, options" },
          { label: "Investor case studies", href: "/investing/case-studies", note: "How professionals decide, with sources" },
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
    ],
  },
];
