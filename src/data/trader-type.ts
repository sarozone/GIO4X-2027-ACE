/**
 * "What kind of trader are you?": ten questions about how a person likes to
 * work, and the five styles of working the answers are read against.
 *
 * The rule this file keeps: a style is a description of preferences (how long
 * a position is held, how much attention it takes, what it costs). It is not
 * an assessment of suitability or ability, it recommends nothing, and no style
 * is presented as better or as profitable. Each one says what it demands, what
 * it costs and where it goes wrong. No figure here is a statistic: holding
 * periods are the ordinary meanings of the words, given as ranges.
 *
 * The module has no imports, so its scoring can be run on its own.
 */

/** the styles, from the shortest holding period to the longest */
export const STYLE_KEYS = ["scalper", "day", "swing", "position", "investor"] as const;
export type StyleKey = (typeof STYLE_KEYS)[number];

export type Style = {
  key: StyleKey;
  name: string;
  /** the few capitals drawn on the dial */
  short: string;
  /** how long a position is typically open */
  holds: string;
  /** attention it asks for */
  screen: string;
  /** the cost that weighs most */
  cost: string;
  summary: string;
  demands: string[];
  costs: string[];
  wrong: string[];
  /** Academy lesson slugs; the page links only those that exist */
  lessons: string[];
  /** a glossary slug; linked only if the glossary has it */
  term?: string;
};

export const styles: Record<StyleKey, Style> = {
  scalper: {
    key: "scalper",
    name: "Scalper",
    short: "SCALPER",
    holds: "Seconds to minutes",
    screen: "Unbroken, for the whole session",
    cost: "The spread and commission, paid many times a day",
    summary: "Many very short trades, each aiming at a small move and closed within seconds or minutes. Nothing is left open when the session ends.",
    demands: [
      "Unbroken attention for as long as the session lasts. Looking away is not part of the method.",
      "Decisions made in seconds, by a routine fixed in advance rather than thought out each time.",
      "Fast, reliable execution, and the discipline to stop when the routine stops being followed.",
    ],
    costs: [
      "The spread and any commission are paid on every trade. Against a target of a few pips they take a large share of each result, so costs matter more here than in any other style.",
      "Slippage: in a fast market the price filled is not always the price clicked, and a small target leaves little room for it.",
      "Fatigue. Hours of concentration are a cost, even though no statement shows it.",
    ],
    wrong: [
      "One loss left to run undoes many small gains. The arithmetic of small targets is unforgiving of a single large mistake.",
      "Overtrading: taking trades because the screen is open, not because the routine calls for one.",
      "Raising the size to make small moves ‘worth it’, which raises the loss on the trade that goes wrong by the same amount.",
    ],
    lessons: ["understanding-currency-pairs", "what-is-leverage-and-margin", "managing-trading-psychology"],
    term: "scalping",
  },
  day: {
    key: "day",
    name: "Day trader",
    short: "DAY",
    holds: "Minutes to hours, closed the same day",
    screen: "Several hours, in the active part of the day",
    cost: "The spread on each trade, and the hours",
    summary: "A few trades a day, each opened and closed within the same session. The day ends with nothing open, so nothing is carried overnight.",
    demands: [
      "Several hours at a screen during the busy part of a session, on most working days.",
      "A plan made before the session opens: which levels matter, what would be traded and what would not.",
      "The willingness to finish a day having done nothing, when nothing fitted the plan.",
    ],
    costs: [
      "The spread and any commission on every trade. With a few trades a day they add up over a month.",
      "No overnight financing, because nothing is held overnight. The price of that is time: this is close to a second job.",
      "Scheduled news can move a price a long way inside one session, and a stop may be filled worse than its level.",
    ],
    wrong: [
      "Forcing trades on a quiet day because the hours have been set aside for it.",
      "Trading again at once after a loss, to win it back before the close.",
      "Holding a losing position overnight ‘just this once’, which turns a day trade into something that was never planned.",
    ],
    lessons: ["support-and-resistance-levels", "trading-the-news", "risk-reward-ratio-explained", "managing-trading-psychology"],
    term: "day-trading",
  },
  swing: {
    key: "swing",
    name: "Swing trader",
    short: "SWING",
    holds: "A few days to a few weeks",
    screen: "A look once or twice a day",
    cost: "Overnight financing, and gaps past a stop",
    summary: "A handful of trades a month, each held for days or a few weeks to follow one move. The work is done away from the live price, usually on daily charts.",
    demands: [
      "Patience to leave a position alone for days, through moves against it that are within the plan.",
      "A stop far enough away for the timeframe, and so a smaller position for the same risk.",
      "A short, regular routine, morning or evening, rather than hours of watching.",
    ],
    costs: [
      "Overnight financing (the swap) is charged or paid for each night a leveraged position is held, and it adds up over weeks.",
      "Gaps: a market can open after a weekend or after news at a price beyond a stop, and the stop is then filled at the worse price.",
      "Fewer trades, so each result matters more and a run of losses takes longer to see clearly.",
    ],
    wrong: [
      "A stop set as tightly as a day trader’s on a trade meant to last a week. It is hit by ordinary movement.",
      "Watching the position hour by hour and closing it on noise the plan had allowed for.",
      "Carrying several positions that are really the same bet, so that one move hurts all of them together.",
    ],
    lessons: ["candlestick-patterns-masterclass", "moving-averages-strategy", "position-sizing-strategies", "risk-reward-ratio-explained"],
    term: "swing-trading",
  },
  position: {
    key: "position",
    name: "Position trader",
    short: "POSITION",
    holds: "Weeks to months",
    screen: "A review once or twice a week",
    cost: "Financing over months, and long drawdowns",
    summary: "Very few trades, each held for weeks or months on a view about an economy, a policy or a long trend. Day-to-day movement is treated as noise.",
    demands: [
      "A reasoned view of the larger picture, and a clear statement of what would show it to be wrong.",
      "A wide stop and therefore a small position: large swings against the trade are expected along the way.",
      "A great deal of patience. For long stretches the right action is none.",
    ],
    costs: [
      "With leveraged products, financing is charged for every night. Over months it can become a large part of the result.",
      "Margin is tied up for the whole period and must survive the swings in between.",
      "Being wrong is expensive in time as well as money: it can take months to find out.",
    ],
    wrong: [
      "A short-term trade that went wrong, renamed a ‘long-term position’ to avoid taking the loss.",
      "Leverage too high for the size of the swings, so that a margin call closes the trade before the view is tested.",
      "Holding on after the facts behind the view have changed.",
    ],
    lessons: ["central-bank-policies-explained", "moving-averages-strategy", "position-sizing-strategies", "what-is-leverage-and-margin"],
    term: "position-trading",
  },
  investor: {
    key: "investor",
    name: "Investor, not trader",
    short: "INVESTOR",
    holds: "Years",
    screen: "A few times a year",
    cost: "Fund and dealing charges, and years of waiting",
    summary: "Buying assets to own for years, usually without leverage, with little interest in timing. This describes someone who does not want to trade at all, and that is a complete answer.",
    demands: [
      "A horizon measured in years, and money that will not be needed in the meantime.",
      "The ability to watch a holding fall a long way and stay down for a long time without acting on it.",
      "Very little screen time, and the discipline not to turn checking into trading.",
    ],
    costs: [
      "Dealing, fund and custody charges, which are small each year and compound over many.",
      "The value of an investment can fall as well as rise, and may be below what was paid for years, or at the end.",
      "Leveraged products charge financing for each night held, which over years is a heavy cost: they are built for shorter holding periods.",
    ],
    wrong: [
      "Selling during a fall and buying back after the recovery.",
      "Too much in one company, one sector or one country.",
      "Drifting into frequent trading because prices are easy to check.",
    ],
    lessons: ["introduction-to-forex-trading", "what-is-leverage-and-margin", "managing-trading-psychology"],
  },
};

export type TypeOption = { text: string; style: StyleKey };
export type TypeQuestion = { id: string; question: string; options: TypeOption[] };

/**
 * Ten questions. Every question has one option for each style, written in a
 * different order each time so that position on the page gives nothing away.
 */
export const typeQuestions: TypeQuestion[] = [
  {
    id: "screen",
    question: "How long can you watch a screen with your full attention?",
    options: [
      { text: "An hour or two a day, if I know what I am waiting for", style: "day" },
      { text: "Hardly at all. I would rather not look for months", style: "investor" },
      { text: "Hours without a break, and I like it", style: "scalper" },
      { text: "A quarter of an hour, morning or evening", style: "swing" },
      { text: "A proper look once a week is enough for me", style: "position" },
    ],
  },
  {
    id: "overnight",
    question: "How do you feel about a position left open overnight?",
    options: [
      { text: "Fine, if a stop is in place. I would check it in the morning", style: "swing" },
      { text: "I would not sleep. I want everything closed within minutes", style: "scalper" },
      { text: "Nights do not matter. I think in years", style: "investor" },
      { text: "I would rather finish each day with nothing open", style: "day" },
      { text: "It can stay open for weeks. I would not think about any one night", style: "position" },
    ],
  },
  {
    id: "loss",
    question: "A trade has just closed at a loss. What do you do next?",
    options: [
      { text: "Stop for the day and go through it once the session is over", style: "day" },
      { text: "Nothing. One loss among a few a year does not change the view", style: "position" },
      { text: "Take the next one. It is one of dozens today", style: "scalper" },
      { text: "I would rather arrange things so that I am not taking frequent losses at all", style: "investor" },
      { text: "Write it up at the weekend with the others", style: "swing" },
    ],
  },
  {
    id: "time",
    question: "How much time can you give to this on a normal weekday?",
    options: [
      { text: "None on most days", style: "investor" },
      { text: "Twenty minutes, before or after work", style: "swing" },
      { text: "Most of the working day", style: "scalper" },
      { text: "Very little in the week; an hour or two at the weekend", style: "position" },
      { text: "Two or three fixed hours", style: "day" },
    ],
  },
  {
    id: "pace",
    question: "How quickly do you like to make a decision?",
    options: [
      { text: "Over an evening, with the day’s chart in front of me", style: "swing" },
      { text: "Within the hour, after watching for a while", style: "day" },
      { text: "Slowly and rarely. A few decisions a year would suit me", style: "investor" },
      { text: "At once. Thinking it over means the moment has gone", style: "scalper" },
      { text: "Over days, after reading around the subject", style: "position" },
    ],
  },
  {
    id: "wait",
    question: "How long can you comfortably wait to find out whether you were right?",
    options: [
      { text: "Months", style: "position" },
      { text: "A minute or two", style: "scalper" },
      { text: "A week or two", style: "swing" },
      { text: "Years", style: "investor" },
      { text: "Until the end of the day", style: "day" },
    ],
  },
  {
    id: "look",
    question: "Which would you rather study?",
    options: [
      { text: "The shape of today’s session on a short chart", style: "day" },
      { text: "Interest rates, policy and the long trend", style: "position" },
      { text: "What a business or an economy may be worth in ten years", style: "investor" },
      { text: "The price ticking, the spread and the order book", style: "scalper" },
      { text: "Daily candles, levels and the swing in progress", style: "swing" },
    ],
  },
  {
    id: "count",
    question: "How many decisions suit you?",
    options: [
      { text: "A few a month", style: "swing" },
      { text: "Dozens a day", style: "scalper" },
      { text: "A few a year", style: "position" },
      { text: "A few a day", style: "day" },
      { text: "As few as possible", style: "investor" },
    ],
  },
  {
    id: "against",
    question: "A price moves hard against you for an hour, then comes back. Which is closest to you?",
    options: [
      { text: "I would not have known it happened", style: "investor" },
      { text: "I would have been out within the first minutes", style: "scalper" },
      { text: "I would have seen it later on the daily chart and left it alone", style: "swing" },
      { text: "An hour does not register on the charts I look at", style: "position" },
      { text: "I would have watched all of it and probably closed before the end of the day", style: "day" },
    ],
  },
  {
    id: "draw",
    question: "Which of these sounds most like a good piece of work?",
    options: [
      { text: "A view about a large theme, held for a season", style: "position" },
      { text: "A day finished, with nothing left open", style: "day" },
      { text: "Owning something sound and getting on with life", style: "investor" },
      { text: "One move followed for several days, start to finish", style: "swing" },
      { text: "A session of quick, clean decisions", style: "scalper" },
    ],
  },
];

/**
 * How the answers are read. The style an option names gets 2; the styles next
 * to it in the order above get 1, because neighbouring styles share habits.
 * Each style's total is divided by the most it could have had, giving 0 to 1.
 */
export const OWN = 2;
export const NEIGHBOUR = 1;

export type Reading = {
  /** 0 to 1 for each style, in STYLE_KEYS order */
  lean: number[];
  /** the style leaned to most, or null before anything is answered */
  top: StyleKey | null;
  /** the next one, if it has any weight at all */
  second: StyleKey | null;
  answered: number;
};

/** `answers[i]` is the style of the option chosen for question i, or null if not yet answered. */
export function read(answers: readonly (StyleKey | null)[]): Reading {
  const raw = STYLE_KEYS.map(() => 0);
  let answered = 0;
  for (const a of answers) {
    if (!a) continue;
    answered++;
    const at = STYLE_KEYS.indexOf(a);
    raw[at] += OWN;
    if (at > 0) raw[at - 1] += NEIGHBOUR;
    if (at < STYLE_KEYS.length - 1) raw[at + 1] += NEIGHBOUR;
  }
  const most = OWN * typeQuestions.length;
  const lean = raw.map((v) => Math.min(1, v / most));
  if (answered === 0) return { lean, top: null, second: null, answered };
  // on a tie the slower style is named: the more cautious reading of the two
  const order = STYLE_KEYS.map((k, i) => ({ k, v: raw[i], i })).sort((a, b) => b.v - a.v || b.i - a.i);
  return { lean, top: order[0].k, second: order[1].v > 0 ? order[1].k : null, answered };
}
