/**
 * CHOOSING A GAP FIGURE — which small picture belongs beside a piece of text.
 *
 * Every figure names one idea and lists the plain words that announce it
 * (British and American spellings, and everyday synonyms). Given a section's
 * heading and the start of its text, the figures are ranked by how many of
 * their words appear, a word in the heading counting for far more than one in
 * the text. The rule it keeps: no picture twice on one page. A figure already
 * used is passed over; when nothing fits, one of three neutral figures is
 * taken; when those are used too, nothing is: an empty space is better than a
 * repeated picture, or one whose caption has nothing to do with the words
 * beside it.
 *
 * This module is pure and imports nothing, so it can be run on its own.
 */

export type Topic = {
  id: string;
  /** the one small-caps word drawn under the figure */
  caption: string;
  /** what the picture is */
  idea: string;
  keywords: readonly string[];
  /** fits beside any text: used when nothing else matches */
  neutral?: boolean;
};

export const TOPICS = [
  {
    id: "spread",
    caption: "SPREAD",
    idea: "the gap between a bid line and an ask line",
    keywords: ["spread", "bid", "bid and ask", "bid price", "ask price", "offer price", "two prices", "quote", "quoted", "markup", "mark up", "pip", "tight", "wide", "widen", "widens"],
  },
  {
    id: "leverage",
    caption: "LEVERAGE",
    idea: "a lever lifting a large block with a small one",
    keywords: ["leverage", "leveraged", "gearing", "geared", "lever", "multiplier", "multiply", "multiplies", "exposure", "notional", "borrowed", "amplify", "amplifies", "magnify", "magnifies"],
  },
  {
    id: "margin",
    caption: "MARGIN",
    idea: "a fund of margin with a line that must not be crossed",
    keywords: ["margin", "margin call", "margin level", "free margin", "used margin", "stop out", "collateral", "maintenance", "equity", "liquidation", "liquidated", "close out", "closed out"],
  },
  {
    id: "stop",
    caption: "STOP LOSS",
    idea: "a stop level under a price",
    keywords: ["stop", "stop loss", "trailing stop", "guaranteed stop", "take profit", "exit", "protective", "cut the loss", "cut losses", "drawdown", "limit the loss", "way out"],
  },
  {
    id: "costs",
    caption: "COSTS",
    idea: "coins leaving a stack with each trade",
    keywords: ["cost", "fee", "charge", "charged", "commission", "swap", "rollover", "financing", "overnight", "expense", "tariff", "tax", "taxes", "cheap", "expensive", "pay", "paid", "pricing", "price list"],
  },
  {
    id: "clock",
    caption: "TRADING HOURS",
    idea: "a clock face with session arcs",
    keywords: ["hour", "time", "timing", "session", "clock", "trading hours", "market hours", "opening hours", "24 hours", "round the clock", "time zone", "timezone", "weekend", "morning", "evening", "night", "overlap", "when markets open"],
  },
  {
    id: "calendar",
    caption: "DATES",
    idea: "a calendar page with a marked day",
    keywords: ["calendar", "date", "day", "event", "schedule", "scheduled", "deadline", "expiry", "expiration", "expire", "upcoming", "week", "month", "year", "holiday", "history", "timeline", "anniversary", "episode"],
  },
  {
    id: "candles",
    caption: "CANDLESTICKS",
    idea: "a row of candles, the last one still forming",
    keywords: ["candle", "candlestick", "wick", "shadow", "doji", "hammer", "engulfing", "ohlc", "open high low close", "chart", "chart pattern", "pattern", "price action", "timeframe", "time frame"],
  },
  {
    id: "trend",
    caption: "TREND",
    idea: "a price line with two averages",
    keywords: ["trend", "trending", "moving average", "average", "momentum", "uptrend", "downtrend", "direction", "crossover", "indicator", "technical analysis", "trendline", "trend line", "slope", "chart school"],
  },
  {
    id: "volatility",
    caption: "VOLATILITY",
    idea: "a band that widens and narrows",
    keywords: ["volatility", "volatile", "band", "bollinger", "range", "swing", "choppy", "calm", "turbulence", "turbulent", "variance", "deviation", "uncertainty", "fluctuation", "fluctuate", "shock", "crash", "panic", "gap", "slippage"],
  },
  {
    id: "risk",
    caption: "RISK",
    idea: "a dial from low to high",
    keywords: ["risk", "risky", "danger", "dangerous", "caution", "warning", "loss", "losses", "lose", "losing", "appetite", "tolerance", "hazard", "downside", "position size", "position sizing", "risk room", "ruin"],
  },
  {
    id: "compounding",
    caption: "COMPOUNDING",
    idea: "a staircase whose steps grow",
    keywords: ["compound", "compounding", "interest", "growth", "grow", "grows", "snowball", "reinvest", "reinvested", "saving", "savings", "long term", "accumulate", "pension", "retirement", "invest", "investing", "investment"],
  },
  {
    id: "portfolio",
    caption: "DIVERSIFICATION",
    idea: "a pie whose slices change",
    keywords: ["portfolio", "diversify", "diversification", "diversified", "diversifying", "allocation", "asset allocation", "basket", "mix", "weighting", "rebalance", "rebalancing", "asset class", "asset classes", "holdings", "index fund", "mutual fund", "etf", "eggs"],
  },
  {
    id: "scales",
    caption: "COMPARISON",
    idea: "two scale pans",
    keywords: ["compare", "compared", "comparing", "comparison", "versus", "vs", "difference", "differ", "side by side", "against", "pros and cons", "advantage", "disadvantage", "trade off", "weigh", "alternative", "better", "worse", "fair", "fairness"],
  },
  {
    id: "shield",
    caption: "SECURITY",
    idea: "a shield that turns things away",
    keywords: ["security", "secure", "safety", "safe", "protect", "protection", "protected", "fraud", "scam", "phishing", "fake", "clone", "impersonation", "password", "two factor", "verification", "verify", "safeguard", "safeguarding", "segregated", "privacy", "encryption", "trust", "regulated", "regulation", "regulator", "licence", "license"],
  },
  {
    id: "document",
    caption: "DOCUMENTS",
    idea: "a ruled sheet being signed",
    keywords: ["document", "legal", "terms and conditions", "terms of business", "agreement", "contract", "policy", "policies", "disclosure", "sign", "signed", "signature", "paperwork", "form", "record", "journal", "diary", "log", "notes", "written", "statement", "kyc", "proof", "clause", "small print", "fine print"],
  },
  {
    id: "book",
    caption: "LEARNING",
    idea: "an open book whose pages turn",
    neutral: true,
    keywords: ["learn", "learning", "lesson", "course", "academy", "education", "educational", "study", "read", "reading", "guide", "beginner", "tutorial", "school", "teach", "basics", "introduction", "chapter", "book", "playbook", "curriculum"],
  },
  {
    id: "magnifier",
    caption: "DEFINITIONS",
    idea: "a magnifier over lines of text",
    neutral: true,
    keywords: ["definition", "define", "defined", "glossary", "term", "meaning", "means", "jargon", "vocabulary", "word", "dictionary", "look up", "search", "find", "explained", "what is", "what it means", "detail", "closer look", "inspect", "research"],
  },
  {
    id: "question",
    caption: "QUESTIONS",
    idea: "a question mark that resolves into a tick",
    keywords: ["question", "answer", "answered", "faq", "ask", "asked", "asking", "help", "support", "why", "wonder", "doubt", "quiz", "test yourself", "problem", "solve", "solved", "contact", "query", "queries", "myth", "misunderstanding"],
  },
  {
    id: "ticket",
    caption: "ORDERS",
    idea: "a ticket with buy and sell",
    keywords: ["order", "market order", "limit order", "stop order", "pending order", "buy", "sell", "buying", "selling", "execution", "execute", "executed", "filled", "ticket", "deal", "dealing", "trade", "place a trade", "entry", "requote"],
  },
  {
    id: "pairs",
    caption: "CURRENCY PAIRS",
    idea: "two currencies changing places",
    keywords: ["currency", "currencies", "pair", "currency pair", "forex", "fx", "foreign exchange", "exchange rate", "base currency", "quote currency", "dollar", "euro", "pound", "sterling", "yen", "franc", "major", "minor", "exotic", "convert", "conversion"],
  },
  {
    id: "bank",
    caption: "CENTRAL BANKS",
    idea: "a building with columns",
    keywords: ["central bank", "bank", "interest rate", "rate decision", "monetary policy", "federal reserve", "fed", "ecb", "bank of england", "policy rate", "inflation target", "rate", "governor", "treasury", "government", "institution", "reserve", "money supply", "quantitative easing"],
  },
  {
    id: "data",
    caption: "ECONOMIC DATA",
    idea: "a bar chart being released",
    keywords: ["data", "economic", "economy", "release", "released", "figures", "statistic", "gdp", "inflation", "cpi", "employment", "unemployment", "jobs", "payrolls", "news", "announcement", "consensus", "forecast", "surprise", "economic calendar"],
  },
  {
    id: "globe",
    caption: "MARKETS",
    idea: "a globe with a marked meridian",
    keywords: ["global", "world", "worldwide", "region", "regional", "country", "countries", "international", "world markets", "global markets", "exchange", "asia", "europe", "africa", "america", "americas", "middle east", "local", "abroad", "cross border", "emerging", "nation"],
  },
  {
    id: "accounts",
    caption: "ACCOUNTS",
    idea: "a ladder of account tiers",
    keywords: ["account", "account type", "tier", "level", "demo", "live account", "standard", "professional", "retail", "open an account", "opening an account", "sign up", "register", "registration", "profile", "onboarding", "upgrade", "client", "eligibility"],
  },
  {
    id: "wallet",
    caption: "FUNDING",
    idea: "a wallet with an arrow in and an arrow out",
    keywords: ["funding", "deposit", "withdraw", "withdrawal", "payment", "pay in", "pay out", "transfer", "bank transfer", "card", "wallet", "money in", "money out", "balance", "top up", "fund your account", "cash", "payout", "refund"],
  },
  {
    id: "partners",
    caption: "PARTNERS",
    idea: "two linked figures, one following the other",
    keywords: ["partner", "partnership", "affiliate", "introducing broker", "ib", "referral", "refer", "copy", "copy trading", "copying", "copier", "follow", "follower", "social trading", "signal", "mirror", "community", "team", "together", "people", "mentor", "pamm", "mam"],
  },
  {
    id: "gears",
    caption: "PLATFORMS",
    idea: "a gear train",
    keywords: ["platform", "software", "app", "application", "terminal", "metatrader", "mt4", "mt5", "tool", "calculator", "api", "automation", "automated", "algorithm", "algorithmic", "robot", "expert advisor", "install", "download", "setup", "settings", "mechanism", "machine", "engine", "how it works", "system", "rule bench", "simulator", "backtest"],
  },
  {
    id: "process",
    caption: "STEPS",
    idea: "a flow of steps with arrows",
    neutral: true,
    keywords: ["process", "step", "step by step", "how to", "workflow", "procedure", "sequence", "stage", "checklist", "routine", "plan", "method", "getting started", "in practice", "walkthrough", "what happens next"],
  },
  {
    id: "fork",
    caption: "DECISIONS",
    idea: "a path that forks",
    keywords: ["decision", "decide", "deciding", "choice", "choose", "choosing", "option", "either", "fork", "scenario", "whether", "strategy", "strategies", "path", "outcome", "dilemma", "judgement", "judgment", "bias", "psychology", "mind", "discipline"],
  },
] as const satisfies readonly Topic[];

export type TopicId = (typeof TOPICS)[number]["id"];

/** lower case, letters and digits only, one space between words, a space at each end */
function plain(s: string): string {
  return ` ${s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

const HEADING_WEIGHT = 5;

type Compiled = { id: TopicId; tests: { re: RegExp; extra: number }[] };

const COMPILED: Compiled[] = TOPICS.map((t) => ({
  id: t.id,
  tests: t.keywords.map((k) => {
    const key = plain(k).trim();
    // whole words only, with a plain plural allowed; a phrase is worth a little more than a single word
    return { re: new RegExp(`(?<![a-z0-9])${key}(?:s|es)?(?![a-z0-9])`), extra: key.split(" ").length - 1 };
  }),
}));

export type Ranked = { id: TopicId; score: number };

/**
 * The figures that suit a piece of text, best first. Only figures with at least one of their words
 * in the text are returned; equal scores keep the order of the table above.
 */
export function rankTopics(heading: string, body = ""): Ranked[] {
  const h = plain(heading);
  const b = plain(body);
  const out: Ranked[] = [];
  for (const c of COMPILED) {
    let score = 0;
    for (const t of c.tests) {
      if (t.re.test(h)) score += HEADING_WEIGHT + t.extra;
      if (t.re.test(b)) score += 1 + t.extra;
    }
    if (score > 0) out.push({ id: c.id, score });
  }
  // Array.prototype.sort is stable, so ties stay in table order
  return out.sort((x, y) => y.score - x.score);
}

/** a 32-bit hash of a string (FNV-1a): the same text always gives the same seed */
export function hashText(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const NEUTRAL: readonly TopicId[] = TOPICS.filter((t): t is Extract<(typeof TOPICS)[number], { neutral: true }> => "neutral" in t && t.neutral === true).map((t) => t.id);

/**
 * The figure for one gap: the best match not yet used on this page; failing that an unused neutral
 * one (which of them is decided by the seed); failing that none.
 */
export function pickTopic(heading: string, body: string, used: ReadonlySet<string>, seed: number): TopicId | null {
  for (const r of rankTopics(heading, body)) if (!used.has(r.id)) return r.id;
  const free = NEUTRAL.filter((id) => !used.has(id));
  if (!free.length) return null;
  return free[(seed >>> 0) % free.length] ?? null;
}
