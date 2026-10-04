/**
 * THE STRATEGY LIBRARY — well-known trading approaches, one page each.
 *
 * A page says what the idea is, the rule as people usually state it, what the
 * approach needs from a market, what it costs in spread, when it fails and the
 * mistakes people make with it. It does not say that the approach works, and
 * it does not say what to do: each entry is a description of something people
 * do, not a recommendation, and nothing here has been shown to be profitable.
 * Grid trading and martingale are written as what they are: ways of sizing
 * that hide a large loss behind many small gains.
 *
 * `picture` names the invented price path drawn on the page
 * (components/strategies/picture.ts). `bench` is a preset for the rule tester
 * on /labs/rule-bench, given only where the bench can express the rule;
 * otherwise `noBench` says plainly why it cannot.
 */
import type { Direction, EntryKey, MarketKey } from "@/components/labs/bench/strategy";
import type { PictureKind } from "@/components/strategies/picture";

export type Hold = "short" | "medium" | "long" | "none";

export type BenchPreset = {
  entry: EntryKey;
  fast: number;
  slow: number;
  dir: Direction;
  fade: boolean;
  /** stop, in average ranges */
  stop: number;
  /** target, as a multiple of the stop; 0 is none */
  target: number;
  /** percent of the balance at risk on a trade */
  risk: number;
  market: MarketKey;
  /** the preset in words */
  says: string;
};

export type Strategy = {
  slug: string;
  name: string;
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  also: readonly string[];
  hold: Hold;
  /** how long a trade is usually held, in a few words */
  held: string;
  /** written as a warning, not as an approach */
  caution?: boolean;
  picture: PictureKind;
  idea: string;
  rule: string;
  needs: readonly string[];
  cost: string;
  fails: readonly string[];
  mistakes: readonly string[];
  terms: readonly string[];
  faq: readonly { q: string; a: string }[];
  bench?: BenchPreset;
  noBench?: string;
};

export const HOLDS: readonly { key: Hold; id: string; eyebrow: string; title: string; lead: string }[] = [
  { key: "short", id: "minutes", eyebrow: "Held for minutes to hours", title: "Fast, frequent and expensive.", lead: "Many trades for small moves. The spread is paid on every one, so cost decides more here than anywhere else." },
  { key: "medium", id: "days", eyebrow: "Held for days to weeks", title: "One move at a time.", lead: "Approaches that try to take a single swing, a single break or a single return to the middle. The holding time depends on the chart they are read from." },
  { key: "long", id: "months", eyebrow: "Held for weeks to months", title: "Few trades, long waits.", lead: "Approaches that trade rarely and sit through large moves against them. The spread matters less; overnight financing and patience matter more." },
  { key: "none", id: "cautions", eyebrow: "Held until they break", title: "Two that fail badly.", lead: "Grid trading and martingale are not ways of choosing a trade. They are ways of adding to a losing one. They are explained here because people meet them, not because they are sound." },
];

const NOT_PROVEN = "Nothing on this page shows that it is. The page describes what people do and why. Published research on trading rules is mixed, results that looked good in one period have often faded in the next, and costs remove much of what remains. The loss figures that regulators require firms to publish show that most retail accounts trading CFDs lose money.";

export const STRATEGIES: readonly Strategy[] = [
  {
    slug: "scalping",
    name: "Scalping",
    title: "Scalping: what it is, what it costs and why it is hard",
    description: "Scalping explained: very short trades for very small moves. The usual rule, what it needs from a market, why the spread decides most of the outcome, when it fails and the common mistakes. A description, not a recommendation.",
    also: ["scalping strategy", "forex scalping", "one-minute scalping", "scalp trading"],
    hold: "short",
    held: "Seconds to minutes",
    picture: "scalp",
    idea: "Scalping is taking a very small move, many times. A trade is opened and closed within seconds or minutes, for a gain a few times the size of the spread. The thought behind it is that small moves are more frequent than large ones, and that a short holding time means less exposure to anything unexpected.",
    rule: "There is no single rule. A common statement is: on a one-minute or five-minute chart, trade in the direction of the last few bars, take a fixed small gain, and close at a fixed small loss if the price goes the other way. Some versions use a short moving average or the edges of the last few minutes’ range to choose the direction.",
    needs: ["A narrow spread compared with the move being sought. This is the whole of it.", "A busy market: many buyers and sellers, so orders fill at the price asked for.", "Fast, dependable execution. A delay of a moment changes the result of a trade that lasts a minute."],
    cost: "Scalping trades more often than any other approach on these pages, so it pays the spread more often than any other. The arithmetic is simple. If a trade aims for 5 points and the spread is 1 point, a fifth of every target is paid before the trade begins; at a spread of 2 points it is two fifths. A hundred trades pay a hundred spreads. Commission, where there is one, is added on top, and slippage of a point matters as much as the spread does.",
    fails: ["When the spread widens: around news, at the daily rollover and in quiet hours. The target does not widen with it.", "When the market is thin and orders fill worse than asked.", "When one loss is allowed to run. A single loss ten times the usual gain undoes ten good trades."],
    mistakes: ["Counting gains before the spread. A method that looks ahead on mid prices can be behind once the cost is taken.", "Making the stop much wider than the target, so that a high share of small wins hides a few large losses.", "Trading more after a loss to win it back quickly.", "Ignoring fatigue. Hundreds of decisions in a session are hundreds of chances to make an error."],
    terms: ["scalping", "spread", "slippage", "liquidity", "pip", "day-trading"],
    faq: [
      { q: "Is scalping profitable?", a: NOT_PROVEN },
      { q: "Why does the spread matter so much in scalping?", a: "Because the move being sought is small. The spread is the same size whether a trade aims for 5 points or 500. On the small trade it is a large share of the target; on the large one it is a small share." },
      { q: "Is scalping allowed everywhere?", a: "That depends on the terms of the firm and the account. Some set a minimum holding time or treat certain very fast trading as abusive. The terms that apply are in the firm’s own documents; this page describes the general approach only." },
    ],
    noBench: "The rule bench cannot express scalping. Its bars have no ticks inside them, its spread never widens and every order fills at once, so the things that decide a scalper’s result are exactly the things it leaves out.",
  },
  {
    slug: "news-trading",
    name: "News trading",
    title: "News trading: how traders approach economic releases",
    description: "News trading explained: trading around scheduled economic releases and central bank decisions. The usual rules, what it needs, what it costs when spreads widen, when it fails and the common mistakes. A description, not a recommendation.",
    also: ["trading the news", "economic calendar trading", "non-farm payrolls trading", "straddle the news"],
    hold: "short",
    held: "Minutes to hours",
    picture: "news",
    idea: "News trading is trading around a scheduled announcement: an inflation figure, an employment report, a central bank’s rate decision. Prices often move quickly when the figure differs from what was expected, and the approach tries to be in that move. What matters is the surprise, the gap between the number and the forecast, not whether the number is good or bad in itself.",
    rule: "Two versions are common. The first waits for the release and trades in the direction of the first sharp move, with a stop beyond the bar that made it. The second places two pending orders before the release, one above the price and one below, so that whichever way the price jumps an order is filled; the other is then cancelled. A third, slower version waits for the first reaction to settle and trades only if the price holds its new level.",
    needs: ["A release that is scheduled, widely watched and able to surprise.", "A real difference between the figure and the forecast. A number in line with expectations often moves nothing.", "A market that stays liquid enough through the release for orders to fill near the price asked."],
    cost: "Few trades, but each is made at the most expensive moment there is. In the seconds around a major release many firms’ spreads widen to several times their usual size, and an order may fill some distance from the price requested: that difference is slippage, and it can be larger than the planned stop. The cost of a news trade is therefore not known in advance. It is whatever the market offered at that instant.",
    fails: ["When the first move reverses. A jump one way followed at once by a larger move the other way is common, and it stops out the first trade.", "When both pending orders are filled in turn, each at a loss.", "When a stop fills far beyond its level because the price did not trade in between.", "When the release is revised, or the accompanying statement matters more than the headline figure."],
    mistakes: ["Treating a stop as a guaranteed price. Through a release it is an instruction to close at the next price available.", "Judging the figure and not the surprise.", "Using a larger size because the move is expected to be large.", "Forgetting open positions held for other reasons, which pass through the same release."],
    terms: ["slippage", "spread", "volatility", "gap", "central-bank", "stop-loss"],
    faq: [
      { q: "Is news trading profitable?", a: NOT_PROVEN },
      { q: "Why do spreads widen around news?", a: "Those who quote prices do not know where the price will be a second later, so they quote a wider gap between buying and selling prices, or quote less size, until the uncertainty passes." },
      { q: "Can a stop-loss fail during a news release?", a: "It does not fail, but it does not promise a price. A stop becomes an order to close at the best price available once its level is reached. If the price jumps past the level, the order fills at the next price there is, which can be much worse." },
    ],
    noBench: "The rule bench cannot express news trading. It has no calendar and no releases, and its spread is fixed: the widening and the slippage that define a news trade are not modelled.",
  },
  {
    slug: "swing-trading",
    name: "Swing trading",
    title: "Swing trading: what it is and how it is usually done",
    description: "Swing trading explained: holding a trade for days to take one swing within a larger move. The usual rule, what it needs from a market, what it costs, when it fails and the common mistakes. A description, not a recommendation.",
    also: ["swing trading strategy", "swing trade", "buying pullbacks", "trading pullbacks"],
    hold: "medium",
    held: "Days to a few weeks",
    picture: "swing",
    idea: "A price rarely moves in a straight line. It advances, gives some back and advances again. Swing trading tries to take one of those legs: to enter after a pullback within a larger move and leave before the next one. It sits between day trading and position trading, with trades held for days and decisions made from daily or four-hour charts.",
    rule: "As usually stated: find a market making higher highs and higher lows, wait for it to pull back towards a recent low, a moving average or a level that held before, and buy when it turns up again. The stop goes below the low of the pullback and the target near the previous high or a little beyond it. The mirror image is used in a falling market.",
    needs: ["A market that is trending in steps, with pullbacks that end.", "Swings large enough that the distance to the target is clearly greater than the spread and the stop.", "Time. Each trade takes days, and most days nothing is done."],
    cost: "A handful of trades a month, so the spread is a small part of each one. The cost that grows is overnight financing: a leveraged position held for days is charged or credited swap each night, and some instruments charge three days’ worth on one day of the week. A position held over a weekend can also open on Monday at a different price from Friday’s close.",
    fails: ["When the pullback is not a pullback but the start of a reversal. Each one looks the same at the moment of entry.", "In a sideways market with no steps to trade.", "When a gap over a night or a weekend carries the price past the stop."],
    mistakes: ["Deciding the trend after the fact. A series of higher lows is clear in hindsight and uncertain as it forms.", "Moving the stop further away as the price approaches it.", "Taking the gain early and leaving the loss to run, so that the average loss outgrows the average gain.", "Forgetting the swap on a position held for weeks."],
    terms: ["swing-trading", "pullback", "trend", "support", "resistance", "swap", "stop-loss", "gap"],
    faq: [
      { q: "Is swing trading profitable?", a: NOT_PROVEN },
      { q: "What is the difference between swing trading and day trading?", a: "Holding time. A day trader closes everything before the session ends and pays no overnight financing. A swing trader holds for days, pays or receives swap, and accepts the risk of a gap between one session and the next." },
      { q: "What time frame do swing traders use?", a: "Most often daily and four-hour charts, sometimes with a weekly chart to judge the larger direction. The choice sets how far away the stop is and how long a trade lasts." },
    ],
    noBench: "The rule bench cannot express swing trading as described. It has no way of saying “a pullback within a trend that has turned up again”: its entries are an average crossing, a new high or low, and the RSI. The RSI page is the nearest thing it can test.",
  },
  {
    slug: "breakout-trading",
    name: "Breakout trading",
    title: "Breakout trading: the rule, the cost and the false breakout",
    description: "Breakout trading explained: entering when a price closes beyond its recent high or low. The usual rule, what it needs from a market, what it costs, why most breakouts fail and the common mistakes. A description, not a recommendation.",
    also: ["breakout strategy", "channel breakout", "range breakout", "false breakout", "trading new highs"],
    hold: "medium",
    held: "Days to weeks",
    picture: "breakout",
    idea: "A breakout is a price leaving the range it has held for some time. The approach buys a new high or sells a new low, on the reasoning that a price which has gone further than at any point in the recent past may be starting a larger move. It is a way of joining a trend at its first sign, and it accepts being wrong often in exchange for being present when a large move begins.",
    rule: "As usually stated: go long when a bar closes above the highest high of the last 20 bars, and short when it closes below their lowest low. The stop is a set distance away, often a multiple of the average range, and the trade is closed when the price makes a shorter-term extreme the other way, such as a 10-bar low. The numbers vary; the shape of the rule does not.",
    needs: ["Markets that, some of the time, leave a range and keep going.", "A stop wide enough to survive the return to the edge of the range that often follows a break.", "Enough capital and patience to take many small losses between the few large gains."],
    cost: "Moderate. With a 20-bar look-back a market gives a signal every few weeks on a daily chart, more often on shorter charts. Two things add to the spread. A breakout is bought at a high, the moment when others are buying too, so slippage on entry is common. And because most breaks fail, the spread is paid many times on trades that return little or nothing.",
    fails: ["In a sideways market: the price pokes above the range, triggers the entry and falls back inside. This is the false breakout, and it is the usual case, not the exception.", "When a level is watched by many: the price is pushed just beyond it, orders are filled, and it reverses.", "After a gap: the break happens between two bars and the entry is far from the level."],
    mistakes: ["Shortening the look-back until the past looks good. A rule tuned to one stretch of prices has been fitted to it.", "Entering before the bar has closed. A break during a bar is often gone by its end.", "Placing the stop just inside the range, where the ordinary return to the edge reaches it.", "Giving up after a run of losses, shortly before the one trade the approach depends on."],
    terms: ["breakout", "support", "resistance", "trend", "slippage", "stop-loss", "volatility", "atr"],
    faq: [
      { q: "Does breakout trading work?", a: NOT_PROVEN },
      { q: "What is a false breakout?", a: "A move beyond a level that does not continue: the price closes outside the range, or only trades there briefly, and then returns inside. It is the most common outcome of a break, which is why the approach has a low share of winning trades." },
      { q: "What look-back period is used for a breakout?", a: "Twenty bars is the figure most often quoted, with fifty-five and a hundred also common. A longer look-back gives fewer signals and fewer false ones, and enters later. No setting is correct; each is a different trade-off." },
    ],
    bench: { entry: "breakout", fast: 10, slow: 20, dir: "both", fade: false, stop: 2, target: 0, risk: 1, market: "index", says: "Long on a close above the highest high of the last 20 bars, short below their lowest low, a stop 2 average ranges away, no target, 1% at risk, on the example index." },
  },
  {
    slug: "rsi-mean-reversion",
    name: "Mean reversion with RSI",
    title: "RSI mean reversion: overbought, oversold and what goes wrong",
    description: "Mean reversion with the RSI explained: buying when the relative strength index turns up from below 30 and selling when it turns down from above 70. The usual rule, what it needs, what it costs, when it fails and the common mistakes. A description, not a recommendation.",
    also: ["RSI strategy", "overbought oversold strategy", "RSI 30 70", "mean reversion trading", "buy the dip"],
    hold: "medium",
    held: "Hours to days",
    picture: "rsi",
    idea: "Mean reversion is the belief that a price which has moved far and fast in one direction is more likely to come part of the way back than to continue. The relative strength index, or RSI, is a common way of measuring “far and fast”: it compares the size of recent rises with the size of recent falls and gives a number from 0 to 100. A low reading is called oversold and a high one overbought.",
    rule: "As usually stated: with a 14-bar RSI, buy when it closes back above 30 after being below it, and sell when it closes back below 70 after being above it. The trade is closed when the RSI returns to the middle, at a fixed target, or at a stop a set distance away. Some versions act the moment the level is reached; the “closes back” version waits for the turn.",
    needs: ["A market that is moving sideways, where moves away from the middle tend to be undone.", "Swings wide enough to cover the spread and leave something over.", "A stop. Without one, the approach has no answer to the day the price does not come back."],
    cost: "Fairly frequent: on a 14-bar setting a sideways market gives a signal every few dozen bars, and a shorter setting gives many more. Targets are modest, because the trade aims only for a return to the middle, so the spread is a larger share of each gain than it is for a trend follower. The typical pattern is many small gains and an occasional loss several times their size.",
    fails: ["In a strong trend. The RSI can stay below 30 for a long time while the price keeps falling, and each turn back above it is a new signal to buy a falling market.", "When the stop is wide and the target near: one loss removes several gains.", "After a change of conditions, such as a rate decision, when the old middle is no longer the middle."],
    mistakes: ["Reading “oversold” as “about to rise”. It means only that recent falls were larger than recent rises.", "Adding to a losing position because the reading has become more extreme.", "Removing the stop because the price “always comes back”.", "Using a very short RSI to get more signals, each with a smaller move and the same spread."],
    terms: ["rsi", "overbought", "oversold", "support", "resistance", "stop-loss", "trend"],
    faq: [
      { q: "Does RSI mean reversion work?", a: NOT_PROVEN },
      { q: "What do 30 and 70 mean on the RSI?", a: "They are conventional lines, not properties of a market. Below 30 the recent falls have been much larger than the recent rises; above 70 the reverse. Some traders use 20 and 80, which gives fewer signals." },
      { q: "Can the RSI stay oversold for a long time?", a: "Yes. In a steady decline the reading can remain low for as long as the decline lasts. An extreme reading describes what has happened; it does not set a limit on what happens next." },
    ],
    bench: { entry: "rsi", fast: 14, slow: 30, dir: "both", fade: false, stop: 2, target: 1.5, risk: 1, market: "pair", says: "Long when the 14-bar RSI closes back above 30, short when it closes back below 70, a stop 2 average ranges away, a target 1.5 times as far, 1% at risk, on the example pair." },
  },
  {
    slug: "range-trading",
    name: "Range trading",
    title: "Range trading: buying support, selling resistance and the break",
    description: "Range trading explained: buying near the bottom of a sideways range and selling near the top. The usual rule, what it needs from a market, what it costs, how it ends and the common mistakes. A description, not a recommendation.",
    also: ["range trading strategy", "trading support and resistance", "sideways market strategy", "fading breakouts"],
    hold: "medium",
    held: "Hours to days",
    picture: "range",
    idea: "For long stretches a market goes nowhere: it rises to roughly the same level, falls to roughly the same level and repeats. Range trading treats those two levels as the edges of a box. It buys near the bottom, sells near the top, and assumes the box will hold a little longer. It is the opposite bet to breakout trading, made at the same levels.",
    rule: "As usually stated: mark a level the price has turned down from at least twice (resistance) and one it has turned up from at least twice (support). Sell near resistance with a stop a little above it; buy near support with a stop a little below it. The target is the middle of the range or its far side. When the price closes beyond either level, the range is over and the idea is dropped.",
    needs: ["A sideways market with edges that have held more than once.", "A range tall enough that the distance from edge to middle is several times the spread and clearly larger than the stop.", "A clear rule for when the range has ended."],
    cost: "Moderate. A trade is made each time the price reaches an edge, which may be several times a week on an hourly chart or a few times a month on a daily one. The gain on each is capped by the height of the range, so the spread takes a fixed bite from a fixed prize: the narrower the range, the larger the share. Stops just outside the edges are also where breakout orders gather, so slippage on a stop is common.",
    fails: ["When the range ends. Every range does, and the last trade taken inside it is a loss.", "When the price overshoots the edge, reaches the stop and then returns inside.", "When the range narrows until the distance to the target is little more than the spread."],
    mistakes: ["Drawing the levels after the turns and assuming they were visible before.", "Widening the stop after a break, in the belief that the price will return.", "Trading the middle of the range, where neither edge is near.", "Treating a level as an exact price. It is a zone, and the price turns short of it or beyond it."],
    terms: ["support", "resistance", "range", "breakout", "stop-loss", "take-profit", "spread", "trend"],
    faq: [
      { q: "Does range trading work?", a: NOT_PROVEN },
      { q: "How do traders know a market is ranging?", a: "They do not know; they judge it from what has already happened: a flat moving average, turns at similar highs and lows, no new extreme for some time. All of those describe the past. Whether the range continues is the bet." },
      { q: "What is the difference between range trading and breakout trading?", a: "They take opposite sides at the same level. The range trader sells at the top of the range, expecting a return. The breakout trader buys a close above it, expecting a continuation. Each loses on the cases where the other gains." },
    ],
    bench: { entry: "breakout", fast: 10, slow: 20, dir: "both", fade: true, stop: 1.5, target: 1, risk: 1, market: "pair", says: "The breakout rule done backwards, as an illustration of fading the edge of a range: short on a close above the highest high of the last 20 bars, long below their lowest low, a stop 1.5 average ranges away, a target the same distance, 1% at risk, on the example pair." },
  },
  {
    slug: "momentum-trading",
    name: "Momentum trading",
    title: "Momentum trading: buying strength and selling weakness",
    description: "Momentum trading explained: buying what has risen most and selling what has fallen most over a recent period. The usual rule, what it needs, what it costs, when it reverses and the common mistakes. A description, not a recommendation.",
    also: ["momentum strategy", "rate of change strategy", "relative strength trading", "buy high sell higher"],
    hold: "medium",
    held: "Days to months",
    picture: "momentum",
    idea: "Momentum is the observation that what has risen recently has, in many studies of many markets, tended to go on rising for a while, and what has fallen has tended to go on falling. Momentum trading acts on that: it buys strength and sells weakness. It differs from trend following mostly in how it measures, comparing the price now with the price a set time ago, and often comparing several markets with each other.",
    rule: "As usually stated: measure each market’s change over a look-back period, for example the last three, six or twelve months. Hold the ones that have risen most, or any that have risen by more than a threshold; sell short, or simply avoid, the ones that have fallen most. Review at a fixed interval and replace whatever no longer qualifies. On a single market the short form is: long while the price is above where it was N bars ago, out or short when it is below.",
    needs: ["Moves that persist for longer than the look-back period takes to notice them.", "Several markets to compare, if the relative form is used.", "Acceptance of sharp reversals, which are part of the record of this approach."],
    cost: "It depends on the review interval. A monthly review of a few markets trades little. A short look-back on an intraday chart trades constantly and pays the spread each time. Momentum also buys after a rise, when a market is busiest and often most volatile, so stops need to be further away and the position smaller for the same risk.",
    fails: ["At turning points. The approach is fully invested in what has been rising at the moment it stops rising, and published studies of momentum describe sudden, steep losses of this kind.", "In a market that jerks up and down without direction: each move is large enough to enter and reverses before it pays.", "When many traders hold the same strong markets and leave together."],
    mistakes: ["Confusing a large rise with a reason to expect more of it. The measure says what happened.", "Choosing the look-back that gave the best past result.", "Buying the single strongest market with a large position.", "Having no rule for getting out other than hoping the move resumes."],
    terms: ["momentum", "trend", "volatility", "drawdown", "stop-loss", "moving-average", "correlation"],
    faq: [
      { q: "Does momentum trading work?", a: NOT_PROVEN },
      { q: "What is the difference between momentum and trend following?", a: "They overlap. Trend following usually reads one market against its own averages or its own highs and lows. Momentum usually measures the change over a fixed period and often ranks markets against one another. Both buy what has been rising." },
      { q: "What is a momentum crash?", a: "A sharp loss for momentum positions when markets reverse: what had fallen most rebounds fastest and what had risen most falls. Academic studies of momentum in shares describe such episodes after steep market declines." },
    ],
    noBench: "The rule bench cannot express momentum as described. It has no “change over the last N bars” entry and tests one market at a time, so it cannot rank markets. The breakout page is its nearest relative.",
  },
  {
    slug: "moving-average-trend-following",
    name: "Trend following with moving averages",
    title: "Moving average trend following: the crossover rule explained",
    description: "Trend following with moving averages explained: going long when a fast average crosses above a slow one and short when it crosses below. The usual rule, what it needs, what it costs, the whipsaw and the common mistakes. A description, not a recommendation.",
    also: ["moving average crossover", "golden cross", "death cross", "trend following strategy", "50 and 200 day moving average"],
    hold: "long",
    held: "Weeks to months",
    picture: "trend",
    idea: "Trend following makes no forecast. It waits until a price has already been rising for some time, joins it, and stays until the rise has clearly ended. A moving average is the usual tool: the average of the last so many closes, redrawn each bar. A fast average follows the price closely and a slow one lags; when the fast one is above the slow one, recent prices are higher than older ones, and that is taken as an up-trend.",
    rule: "As usually stated: go long when the fast moving average crosses above the slow one, and close, or go short, when it crosses back below. Common pairs are 10 and 30, 20 and 50, and 50 and 200 bars; a 50-bar average crossing above a 200-bar one on a daily chart is called a golden cross, and the reverse a death cross. There is no target. The exit is the opposite crossing or a stop.",
    needs: ["Long, sustained moves: a few trends large enough to pay for many small losses.", "Markets that do, from time to time, move a long way in one direction.", "The patience to lose small amounts repeatedly while waiting."],
    cost: "Few trades. A slow pair of averages may cross a handful of times a year on a daily chart, so the spread is a small part of the total; on a five-minute chart the same rule crosses many times a day and the spread becomes the main cost. The larger cost is built into the method: an average lags, so the entry comes after the move has begun and the exit after it has turned, and the part given up at each end is the price of waiting for confirmation. Positions held for months also pay or receive swap every night.",
    fails: ["In a sideways market. The averages cross back and forth, and each crossing is a small loss: buy high, sell low, repeat. This is the whipsaw.", "When a trend ends abruptly. The averages turn late, and much of the gain is returned before the exit.", "Over long periods with no large move, when the small losses simply add up."],
    mistakes: ["Trying different pairs of averages until one fits the past. It has been fitted to that past and to nothing else.", "Skipping signals after a run of losses. The approach depends on a few trades, and no one knows in advance which they are.", "Taking the gain early. A trend follower who closes the large trade early is left with only the small losses.", "Treating a crossing as a prediction. It reports that the last few closes averaged higher than the older ones."],
    terms: ["moving-average", "trend", "golden-cross", "whipsaw", "drawdown", "stop-loss", "swap"],
    faq: [
      { q: "Does moving average crossover trading work?", a: NOT_PROVEN },
      { q: "What are the golden cross and the death cross?", a: "Names for two crossings on a daily chart. A golden cross is the 50-day average moving above the 200-day average; a death cross is the 50-day moving below it. They describe what the last 50 and 200 closes averaged. They are widely reported and are not forecasts." },
      { q: "Which moving averages are best for trend following?", a: "None is best. Shorter averages react sooner and give more false signals; longer ones give fewer signals and react later. A pair chosen because it performed best on past prices has been fitted to those prices." },
    ],
    bench: { entry: "cross", fast: 10, slow: 30, dir: "both", fade: false, stop: 2, target: 0, risk: 1, market: "pair", says: "Long when the 10-bar average closes above the 30-bar average, short when it closes below, a stop 2 average ranges away, no target, 1% at risk, on the example pair." },
  },
  {
    slug: "position-trading",
    name: "Position trading",
    title: "Position trading: holding for weeks, months or longer",
    description: "Position trading explained: taking a view on a large move and holding through the swings along the way. The usual rule, what it needs, what it costs in overnight financing, when it fails and the common mistakes. A description, not a recommendation.",
    also: ["position trading strategy", "long-term trading", "buy and hold trading", "long term forex trading"],
    hold: "long",
    held: "Weeks to months, sometimes years",
    picture: "position",
    idea: "Position trading is the slowest of the active approaches. A trader forms a view about a large move, often from economic reasoning such as the direction of interest rates, growth or supply, takes a position and holds it through the pullbacks along the way. The aim is the bulk of one large move, not its swings. It is defined by its holding time, not by any one signal.",
    rule: "There is no standard rule. A typical statement is: decide the direction from the weekly or monthly picture and from the economic case; enter on a daily chart when the price agrees, for example above a long moving average; place the stop far enough away to survive ordinary pullbacks; and review weekly, not daily. The position is closed when the reason for it no longer holds or the stop is reached.",
    needs: ["A large move that does in fact happen. One view is held for a long time, so one wrong view costs a long time.", "A small position, because the stop is far away and the risk must still be a small part of the account.", "The ability to sit through a fall that takes back a large part of an open gain."],
    cost: "Very few trades, so the spread hardly matters. Overnight financing matters a great deal. A leveraged position is charged or credited swap every night it is held, and over months the total can exceed the spread many times over; on a position held against the interest-rate difference it is a steady charge. Leverage also means a deep pullback can call for more margin long before the view is proved right or wrong.",
    fails: ["When the view is wrong. There are few trades, so there is little to offset a large mistake.", "When the view is right but the pullback on the way is deeper than the account can bear.", "When financing charges over a long hold consume the gain.", "When the reason for the trade changes and the position is kept out of habit."],
    mistakes: ["Calling a losing short-term trade a “position trade” in order not to close it.", "Using leverage suited to a trade of hours on a trade of months.", "Leaving the swap out of the plan.", "Watching a monthly idea on a five-minute chart and acting on the noise."],
    terms: ["position-trading", "swap", "leverage", "margin-call", "drawdown", "trend", "fundamental-analysis", "stop-loss"],
    faq: [
      { q: "Is position trading profitable?", a: NOT_PROVEN },
      { q: "How is position trading different from investing?", a: "The line is not sharp. An investor usually owns the asset outright and may hold it indefinitely. A position trader usually has a defined view, an exit, and often a leveraged product such as a CFD, which carries financing costs and can be closed out by a margin call." },
      { q: "Why does swap matter for long-held trades?", a: "It is charged or credited every night. A small daily amount held for two hundred nights is two hundred times that amount, and on a leveraged position it is worked out on the full value of the position, not on the margin." },
    ],
    noBench: "The rule bench cannot express position trading. Its test is 480 bars long with no financing cost and no economic view to hold, and the choice that defines the approach, the reason for the trade, is not something a rule made of averages can state.",
  },
  {
    slug: "carry-trade",
    name: "Carry trade",
    title: "Carry trade: earning the interest difference, and the risk in it",
    description: "The carry trade explained: holding a higher-interest currency against a lower-interest one to collect the difference. How it is stated, what it needs, what it costs, how it unwinds and the common mistakes. A description, not a recommendation.",
    also: ["carry trade strategy", "currency carry trade", "yen carry trade", "positive swap trading", "interest rate differential"],
    hold: "long",
    held: "Months",
    picture: "carry",
    idea: "Each currency has an interest rate. Someone who holds a currency with a high rate, paid for by borrowing one with a low rate, receives the difference for as long as the position is open: that difference is the carry. On a leveraged account it arrives as the nightly swap. The trade earns a little every day provided the exchange rate does not move against it by more than the interest collected.",
    rule: "As usually stated: buy a currency whose central bank rate is high against one whose rate is low, hold the position, and collect the swap each night. Some versions hold a basket of several high-rate currencies against several low-rate ones to spread the risk. The position is kept while the rate difference remains and markets are calm.",
    needs: ["A real, positive interest difference after the firm’s own swap rates are applied. The swap a retail account receives is smaller than the difference between the official rates, and can be negative in both directions.", "A stable or favourable exchange rate.", "Calm markets. The trade is, in effect, a bet that nothing dramatic happens."],
    cost: "Almost no trading: one entry and one exit, so one spread. The costs lie elsewhere. The swap actually credited is the interest difference less the firm’s charge. Leverage multiplies the carry and multiplies the exchange-rate risk by the same amount. And the trade ties up margin for months. Economic theory says the high-rate currency should, on average, fall by enough to cancel the interest; the record shows long periods when it did not, ended by short periods when it fell by far more.",
    fails: ["In a panic. When markets turn fearful, carry positions are closed together: the high-rate currency falls and the low-rate one rises, fast. In the autumn of 2008, during the financial crisis, the Japanese yen, widely borrowed for these trades, rose sharply against higher-rate currencies as they were unwound.", "When the rate difference narrows or reverses, because a central bank changes its rate.", "When a move of a few days removes the interest of several years. The gains are small and regular; the loss is large and sudden."],
    mistakes: ["Looking at the swap and not at the exchange rate, which moves more in a day than the swap pays in a month.", "Using high leverage to make a small yield look large.", "Assuming a long calm period shows the trade is safe. A long calm is what the trade looks like before it unwinds.", "Not checking the actual swap rates, which differ from firm to firm and change."],
    terms: ["carry-trade", "swap", "interest-rate-differential", "central-bank", "leverage", "safe-haven", "volatility", "rollover"],
    faq: [
      { q: "Is the carry trade profitable?", a: NOT_PROVEN },
      { q: "Why do carry trades unwind so quickly?", a: "Because many holders have the same position for the same reason. When the exchange rate starts to fall, the loss on a leveraged position soon exceeds the interest earned, holders close, and their selling moves the rate further. The description often used is that the trade goes up by the stairs and down by the lift." },
      { q: "Is the swap I receive the same as the interest rate difference?", a: "No. The swap on a retail account is set by the firm from the difference in rates, less its own charge, and it can be negative on both sides of a pair. The figure that applies is the one shown for the instrument on the account, and it changes." },
    ],
    noBench: "The rule bench cannot express a carry trade. It has no interest rates and no swap, and on its invented prices a position held for the interest would earn nothing at all.",
  },
  {
    slug: "grid-trading",
    name: "Grid trading",
    title: "Grid trading: how it works and why it fails badly",
    description: "Grid trading explained as a caution: orders placed at fixed intervals above and below the price, each closed for a small gain. Why the results look smooth, what builds up underneath, and how one trend ends the account. A warning, not a recommendation.",
    also: ["grid trading strategy", "grid bot", "forex grid system", "grid EA", "no stop loss strategy"],
    hold: "none",
    held: "Until the price comes back, or does not",
    caution: true,
    picture: "grid",
    idea: "A grid is a ladder of orders at fixed intervals. In its common form a buy is placed at each step down, and each is closed for a small gain when the price climbs back one step. There is no view about direction and usually no stop. In a market that moves up and down across the steps the grid collects one small gain after another, and its record looks like a steady upward line. This page describes it as a caution, because of what that line leaves out.",
    rule: "As usually stated: choose a spacing, for example every 20 points. Place a buy at each level below the price (and, in the two-sided form, a sell at each level above). Give every order a target one step away and no stop. When an order closes at its target, place it again. The closed trades are all gains. The losses are the positions still open, which the record of closed trades does not show.",
    needs: ["A price that stays inside the ladder and keeps crossing its steps.", "Enough margin to hold every open position through the largest move the market ever makes. No account has this.", "No sustained trend, ever. This is the condition that fails."],
    cost: "A great many trades: one at every step, each paying the spread for a gain of one step, so a narrow spacing hands a large share of each gain to the spread. Positions left open for weeks pay swap every night. But the real cost is not in the trades that close. It is the open loss on the ones that do not, which grows with every step the price moves away, on a position that has also grown with every step.",
    fails: ["In a trend. Each step against the grid opens another position and deepens the loss on all the earlier ones. Five steps down, there are five buys open and the first is five steps under water: the open loss grows roughly with the square of the distance.", "When margin runs out. The positions are then closed by the firm’s stop-out at the worst point, all at once.", "After a gap, when several levels are passed with no chance to act.", "Sooner or later, on any market. A price that never trends does not exist."],
    mistakes: ["Judging it by closed trades. Every closed trade is a gain by construction; the result that matters is balance less the open loss, which is the equity.", "Trusting a smooth history. A grid looks its best on the day before it fails.", "Narrowing the spacing or raising the size to earn more, which brings the end nearer.", "Believing an automated version has solved this. Software places the orders faster; it does not change the arithmetic."],
    terms: ["drawdown", "margin-call", "stop-out", "equity", "free-margin", "leverage", "stop-loss", "swap"],
    faq: [
      { q: "Is grid trading profitable?", a: "It produces many small closed gains while the price stays in a range, and a large loss when it leaves. Because the loss can exceed all the gains before it, a record of steady gains says little. Nothing on this page shows the approach to be profitable, and its structure is one of small frequent gains against a rare loss large enough to empty an account." },
      { q: "Why do grid systems show such smooth results?", a: "Because losing positions are not closed. They stay open, and a chart of closed trades or of balance leaves them out. A chart of equity, which counts open losses, shows the real shape: a rising line with deep and deepening dips." },
      { q: "Does a stop-loss make a grid safe?", a: "A stop on the whole grid limits the loss to a chosen amount, which is an improvement, and it also turns the smooth record into what it always was: many small gains and an occasional loss that takes most of them back. It does not give the method an edge." },
    ],
    noBench: "The rule bench cannot express a grid. It holds one position at a time and gives every trade a stop, and a grid is defined by holding many positions with none.",
  },
  {
    slug: "martingale",
    name: "Martingale",
    title: "Martingale: doubling after a loss, and why it ends in ruin",
    description: "The martingale explained as a caution: doubling the stake after every loss so that one win recovers them all. The arithmetic, why it seems to work, and why a run of losses ends the account. A warning, not a recommendation.",
    also: ["martingale strategy", "martingale trading", "doubling down strategy", "martingale EA", "averaging down"],
    hold: "none",
    held: "Until a win, or until the money runs out",
    caution: true,
    picture: "martingale",
    idea: "The martingale is a betting system, far older than electronic markets, and it is a way of sizing, not a way of choosing a trade. After every loss the stake is doubled. When a win finally comes it covers all the losses before it and leaves a gain equal to the first stake. With unlimited money and no limit on size it could not lose. Nobody has unlimited money, and that is the whole of the problem. This page describes it as a caution.",
    rule: "As usually stated: stake 1 unit. After a loss, stake 2, then 4, then 8, doubling each time. After a win, return to 1. The arithmetic: after n losses in a row the total lost is 2ⁿ − 1 units, and the next stake is 2ⁿ. After 5 losses, 31 units are gone and the next stake is 32. After 10 losses, 1,023 units are gone and the next stake is 1,024, all to recover and gain 1 unit.",
    needs: ["Unlimited capital, or a run of losses that never reaches the limit of the capital there is.", "No limit on position size and no margin requirement.", "Neither condition is ever met."],
    cost: "Every trade pays the spread, and the spread is paid on the doubled size: the eighth trade in a losing run pays 128 times the spread of the first. Margin required grows in the same way. The system does nothing to the odds of any single trade. It rearranges the results: the many small gains are real, and they are paid for by one loss that is certain to arrive if the system is used for long enough.",
    fails: ["On a long run of losses. With an even chance on each trade, ten losses in a row has a probability of 1 in 1,024 for any given ten trades. Over thousands of trades that is not a remote event; it is an expected one.", "When the next doubled stake is larger than the account, the margin or the maximum order size allows. The sequence stops there, at its largest loss.", "In a trend, when the doubling is applied to adding to a losing position: the position is at its largest when the market is furthest against it."],
    mistakes: ["Taking a long record of small gains as evidence. That record is exactly what a martingale produces before it fails.", "Believing a loss is “due” to be followed by a win. Past outcomes do not change the next one.", "Softening the multiplier, to 1.5 times for example. This delays the end and does not prevent it.", "Not recognising it under other names: averaging down with growing size, “recovery” modes and many automated systems are the same idea."],
    terms: ["martingale-strategy", "drawdown", "leverage", "margin-call", "stop-out", "equity", "lot", "stop-loss"],
    faq: [
      { q: "Does the martingale strategy work?", a: "No. It does not change the expected result of the trades it is applied to; it only changes how the results are distributed, turning them into many small gains and one loss large enough to take all of them and the starting capital. The arithmetic of doubling guarantees that the required stake outgrows any finite account." },
      { q: "Why does a martingale look so good for so long?", a: "Because a run of losses long enough to break it is uncommon in any short period, and until it happens every sequence ends with a small gain. The risk is not visible in the record. It is in the size of the stake the next loss would require." },
      { q: "What is the gambler’s fallacy?", a: "The belief that after several losses a win has become more likely. Where outcomes are independent, as with a fair coin, the chance on the next one is unchanged by what came before. The martingale is often defended with this belief." },
    ],
    noBench: "The rule bench cannot express a martingale, by design. It sizes every trade from a fixed share of the balance at risk, which is the opposite rule: the stake shrinks after a loss instead of doubling.",
  },
];

export const getStrategy = (slug: string) => STRATEGIES.find((s) => s.slug === slug);

/** The link that opens the rule bench with this preset already set (see RuleBench.tsx). */
export const benchHref = (b: BenchPreset) =>
  `/labs/rule-bench?entry=${b.entry}&fast=${b.fast}&slow=${b.slow}&dir=${b.dir}&fade=${b.fade ? 1 : 0}&stop=${b.stop}&target=${b.target}&risk=${b.risk}&market=${b.market}#bench`;

/** The sentence every page and the index carry. */
export const NOT_ADVICE =
  "This is a description of an approach people use. It is not a recommendation. No approach works in every market, nothing here has been shown to be profitable, and the chart is invented.";
