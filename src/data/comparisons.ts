/**
 * SIDE BY SIDE: six comparisons, one page each at /side-by-side/[slug].
 *
 * A comparison is a list of things of one kind (order types, chart types and
 * so on) and a list of questions asked of each. `rows` are the questions;
 * every item answers them in the same order in `values`. Where two items give
 * the same answer the words are the same, letter for letter, so the selector
 * on the page can mark the rows on which two items differ.
 *
 * The rule these pages keep: they describe the general thing, as it works in
 * most markets, and say where practice varies. Nothing here states what GIO4X
 * offers, charges or allows (the accounts and conditions pages do that), no
 * figure is a real price or rate, and nothing says which item is better.
 *
 * To add a page, add an entry and a drawing for its slug in
 * components/compare/drawings.ts; the index and the links between pages follow.
 */
export type CompareItem = {
  key: string;
  name: string;
  /** one answer for each of the comparison's rows, in order */
  values: readonly string[];
  /** the paragraph about this item */
  about: string;
  /** what the drawing shows when this item is chosen: one sentence, read aloud */
  shows: string;
};

export type Comparison = {
  slug: string;
  /** short name, for lists and breadcrumbs */
  name: string;
  /** the page's heading: the phrase people search for */
  title: string;
  description: string;
  lead: string;
  /** what the items are called, in the plural: "order types" */
  things: string;
  rows: readonly string[];
  items: readonly CompareItem[];
  /** how to read this table */
  read: string;
  /** the drawing: its heading, and the line beneath it that says it is invented */
  drawing: { title: string; note: string };
  faq: readonly { q: string; a: string }[];
  /** glossary slugs; only those that exist are linked */
  terms: readonly string[];
  /** where this site says what GIO4X itself does, if the reader wants that next */
  own?: { label: string; href: string };
};

export const COMPARISONS: readonly Comparison[] = [
  {
    slug: "order-types",
    name: "Order types",
    title: "Order types compared: market, limit, stop, stop-limit, trailing stop",
    description:
      "Market, limit, stop, stop-limit and trailing stop orders side by side: when each acts, whether the price or the fill is certain, and what each does when a price gaps. A plain comparison with an animated example on invented prices.",
    lead: "Five instructions a trader can give. Each trades one certainty for another: a certain fill at an uncertain price, or a certain price with no promise of a fill.",
    things: "order types",
    rows: ["What it says", "When it acts", "Is the price certain?", "Is a fill certain?", "If the price gaps past it", "Commonly used for"],
    items: [
      {
        key: "market",
        name: "Market order",
        values: ["Buy or sell now, at the best price available", "At once", "No", "Yes, in a working market", "Fills at the next price available", "Getting in or out without waiting"],
        about:
          "A market order asks for a trade now and accepts whatever price is there. It is the surest way to get a fill and the least sure about the price: in a quiet market the two are close, and in a fast or thin one the fill can be some way from the price last seen. That difference is called slippage.",
        shows: "The market order sells at once, at the price on the screen when it is sent, before the path has gone anywhere.",
      },
      {
        key: "limit",
        name: "Limit order",
        values: ["Buy at this price or lower; sell at this price or higher", "When the price reaches the limit", "Yes: the limit or better", "No", "Fills at the limit or better, by the venue’s rules", "Entering at a chosen price, or taking a profit"],
        about:
          "A limit order names the worst price it will accept. A limit to buy sits below the current price and a limit to sell above it. It never fills at a worse price than the one named, and the cost of that promise is that it may never fill at all: the price can turn just short of it, or touch it without enough on the other side to complete the order.",
        shows: "The limit order to sell rests above the starting price and fills at its own price when the path climbs up to it.",
      },
      {
        key: "stop",
        name: "Stop order",
        values: ["If the price reaches this level, trade at the market", "When the price reaches the stop", "No", "Yes, once triggered", "Fills at the next price available, which may be far from the stop", "Limiting a loss, or entering on a break of a level"],
        about:
          "A stop order waits until the price reaches its level and then becomes a market order. A stop to sell sits below the current price and a stop to buy above it. The level is a trigger, not a price: in an orderly market the fill is close to it, and after a gap the fill is wherever trading resumes. A stop used to close a losing position is called a stop-loss.",
        shows: "The stop order to sell is jumped by the gap: no price traded at its level, so it fills at the first price after the gap, well below the stop.",
      },
      {
        key: "stop-limit",
        name: "Stop-limit order",
        values: ["If the price reaches this level, place a limit order", "When the price reaches the stop", "Yes: the limit or better", "No", "May not fill at all", "A stop with a cap on how poor the price may be"],
        about:
          "A stop-limit order has two prices. Reaching the first, the stop, places a limit order at the second. It protects against a very poor fill, and for that reason it can fail at the moment it is needed: if the price jumps beyond the limit, the order rests unfilled while the position stays open and the price moves on.",
        shows: "The stop-limit order is triggered by the gap, but the price is already beyond its limit: it rests unfilled, and the path never comes back to it.",
      },
      {
        key: "trailing",
        name: "Trailing stop",
        values: ["Keep a stop a set distance behind the best price reached", "When the price falls back by the set distance", "No", "Yes, once triggered", "Fills at the next price available, which may be far from the stop", "A stop that follows a position as it gains"],
        about:
          "A trailing stop is a stop order whose level moves. For a position that gains as the price rises, the stop follows the price up at a fixed distance and stays where it is when the price falls. It is triggered when the price comes back by that distance from its best point. Once triggered it behaves like any stop: a market order, with no promise about the price. On many platforms a trailing stop is run by the trader’s own software and works only while that software is running.",
        shows: "The trailing stop climbs behind the path to its peak, then holds still; the fall from the peak reaches it and it sells there, on this path before the gap.",
      },
    ],
    read: "Read down a column to see one order type whole, or across a row to see how the five differ on one question. The two rows in the middle are the heart of it: no order type answers yes to both. Names and details vary between platforms and venues, for example whether a stop is triggered by the bid or the ask price, so the rules of the place where an order is sent are the ones that count.",
    drawing: { title: "One invented path, five sell orders", note: "An invented price path with a gap in it, drawn to show where each kind of order would fill. Not market data, and real fills depend on the venue." },
    faq: [
      { q: "What is the difference between a stop order and a limit order?", a: "A limit order names the worst price it will accept and may never fill. A stop order names a trigger: when the price reaches it the order becomes a market order, which fills at whatever price is available. A limit is certain about price and uncertain about a fill; a stop is the reverse." },
      { q: "Does a stop-loss guarantee the price I get out at?", a: "No. An ordinary stop-loss becomes a market order when its level is reached, and it fills at the next price available. If the price gaps past the level, for instance over a weekend or on news, the fill can be well beyond it. Some providers sell a guaranteed stop for a fee; that is a separate product with its own terms." },
      { q: "Why would a stop-limit order not fill?", a: "Because its second price is a limit. If the price jumps past both the stop and the limit, the limit order that is placed cannot be filled at its price or better, so it waits. If the price does not return, it never fills and the position remains open." },
    ],
    terms: ["market-order", "limit-order", "stop-order", "stop-loss", "trailing-stop", "pending-order", "slippage", "gap", "fill"],
    own: { label: "Trading conditions", href: "/trading/conditions" },
  },
  {
    slug: "instrument-types",
    name: "Instrument types",
    title: "Instrument types compared: spot currency, CFD, future, option, ETF, share",
    description:
      "Spot currency, CFDs, futures, options, ETFs and shares side by side: what you hold, whether you own the underlying asset, where it trades, whether it expires, how leverage enters and what holding it costs. A plain comparison, not advice.",
    lead: "Six ways to have a stake in a price. They differ in what is owned, where the trade happens, whether it ends on a date and how far a loss can run.",
    things: "instruments",
    rows: ["What you hold", "Do you own the underlying asset?", "Where it trades", "Does it expire?", "Leverage", "The most a buyer can lose", "Cost of holding it"],
    items: [
      {
        key: "spot",
        name: "Spot currency",
        values: [
          "One currency, bought with another",
          "Yes, once settled; a margin account usually rolls the position on instead",
          "Over the counter, between banks and dealers",
          "No, though each trade has a settlement date",
          "Through margin",
          "With margin, possibly more than the deposit, unless rules or the provider cap it",
          "Rollover interest each night, on margin",
        ],
        about:
          "A spot trade exchanges one currency for another at today’s price, for settlement shortly afterwards: two business days later for most pairs. There is no central exchange; banks and dealers quote prices to one another and to their clients. A person trading currencies on margin through a broker rarely takes delivery: the position is rolled forward each night, and the interest difference between the two currencies is charged or paid as it is.",
        shows: "Spot currency on an example margin of 10%: the result line is steep, and a fall of one tenth in the price takes all of the money put down.",
      },
      {
        key: "cfd",
        name: "CFD",
        values: [
          "A contract with a provider on a change in price",
          "No",
          "Over the counter, with the provider",
          "Usually not",
          "Through margin",
          "With margin, possibly more than the deposit, unless rules or the provider cap it",
          "Overnight financing",
        ],
        about:
          "A contract for difference is an agreement with a provider to exchange the change in a price between the time the contract is opened and the time it is closed. Nothing is delivered and nothing is owned: there is no share, barrel or bar behind the holder’s name. The provider is the other side of the contract, so its standing matters. CFDs are traded on margin and are not permitted for retail clients in every country.",
        shows: "A CFD on an example margin of 10%: the same steep line as any margined position, with the whole deposit gone after a fall of one tenth.",
      },
      {
        key: "future",
        name: "Future",
        values: [
          "A standard contract to buy or sell on a set date",
          "No, unless held to delivery",
          "On an exchange",
          "Yes, on a fixed date",
          "Through margin",
          "With margin, possibly more than the deposit, unless rules or the provider cap it",
          "No daily charge; the cost of carrying is in the price",
        ],
        about:
          "A future is a standard contract, traded on an exchange, to buy or sell a set amount of something on a set date at a price agreed today. Both sides post margin with a clearing house, which stands between them, and gains and losses are settled every day. Most futures are closed before the date arrives; some settle in cash and some by delivery. A future’s price differs from the spot price by the cost of carrying the asset to that date.",
        shows: "A future on an example margin of 10%: gains and losses are settled daily along the same steep line, and the contract ends on its date.",
      },
      {
        key: "option",
        name: "Option",
        values: [
          "A right, not a duty, to buy or sell at a set price",
          "No, unless exercised",
          "On an exchange, or over the counter",
          "Yes, on a fixed date",
          "Built in: a small premium stands for a larger amount",
          "The premium paid",
          "No charge; its time value wears away",
        ],
        about:
          "An option gives its buyer the right to buy (a call) or to sell (a put) at a set price up to or on a set date. The buyer pays a premium for that right and can lose no more than the premium. The seller of an option is in a different position: the seller receives the premium and takes on the obligation, and a seller’s loss can be many times the premium. An option’s value depends on time and on expected volatility as well as on the price, so it can lose value while the price stands still.",
        shows: "A bought call option: the loss stops at the premium paid however far the price falls, and the price must rise by more than the premium before there is a gain.",
      },
      {
        key: "etf",
        name: "ETF",
        values: ["A share in a fund that holds a basket of assets", "No: the fund owns the assets, you own part of the fund", "On an exchange", "No", "None, unless bought with borrowed money", "The amount paid", "The fund’s annual charge"],
        about:
          "An exchange-traded fund is a fund whose shares are bought and sold on a stock exchange like any share. The fund holds, or otherwise tracks, a basket: an index of shares, a set of bonds, a commodity. Its price follows the value of the basket closely but not exactly, and the fund takes an annual charge from its assets. Some funds are built to multiply or reverse a daily move; those behave differently over more than a day and are a separate subject.",
        shows: "An ETF bought outright: the result moves one for one with the fund’s price, and the money put down is lost only if the price falls to nothing.",
      },
      {
        key: "share",
        name: "Share",
        values: ["A part of a company", "Yes", "On an exchange", "No", "None, unless bought with borrowed money", "The amount paid", "None, beyond any account fee"],
        about:
          "A share is a part of the ownership of a company. Its holder may receive dividends and, for most shares, may vote. Shares of listed companies trade on stock exchanges during set hours. A share bought outright has no expiry and no financing charge, and the most its buyer can lose is what was paid for it, which happens if the company fails.",
        shows: "A share bought outright: the gentle line, one for one with the price, with the whole sum at risk only if the price falls to nothing.",
      },
    ],
    read: "Each column is one instrument. The rows that separate them most sharply are ownership, expiry and the most a buyer can lose. The words describe each instrument as it generally works; the terms of a particular contract, exchange or provider decide the detail, and rules for retail clients differ from country to country.",
    drawing: { title: "Result, as a share of the money put down", note: "An illustration. The 10% margin and the 4% premium are examples chosen to draw the lines; they are not anyone’s terms. Costs are left out." },
    faq: [
      { q: "What is the difference between a CFD and a share?", a: "A share is a part of a company that its holder owns. A CFD on that share is a contract with a provider that pays or charges the change in the share’s price; the holder owns nothing and has no vote. A CFD is traded on margin and usually carries a nightly financing charge; a share bought outright has neither." },
      { q: "What is the difference between a future and an option?", a: "A future binds both sides to trade on the set date at the agreed price, unless the position is closed first. An option gives its buyer the right to trade but no duty to: the buyer can let it lapse and lose only the premium. The seller of an option does take on a duty." },
      { q: "Is spot forex the same as a currency CFD?", a: "They are close in practice and different in form. A spot trade is an exchange of two currencies for settlement; a currency CFD is a contract on the change in the exchange rate with nothing exchanged. For a person trading on margin both are usually rolled each night and neither ends in delivery. Which one an account offers is stated in its terms." },
    ],
    terms: ["spot-market", "cfd", "forward-contract", "leverage", "margin", "rollover", "dividend", "index", "notional-value", "negative-balance"],
    own: { label: "Markets", href: "/markets" },
  },
  {
    slug: "trading-styles",
    name: "Trading styles",
    title: "Trading styles compared: scalping, day trading, swing trading, position trading",
    description:
      "Scalping, day trading, swing trading and position trading side by side: how long a trade lasts, how often trades are made, which charts are watched, whether positions are held overnight and which cost weighs most. A description, not a recommendation.",
    lead: "Four names for how long a trade is held. The length of the hold decides most other things: the charts watched, the costs that matter and the hours it asks for.",
    things: "trading styles",
    rows: ["A trade usually lasts", "How often", "Held overnight?", "Charts usually watched", "Size of move looked for", "Cost that weighs most", "Time at the screen"],
    items: [
      {
        key: "scalping",
        name: "Scalping",
        values: ["Seconds to minutes", "Very many trades in a day", "No", "Ticks and one-minute charts", "A few pips", "Spread and commission", "Constant, while trading"],
        about:
          "Scalping is trading for very small moves, many times over. A position is open for seconds or a few minutes. Because each trade aims at so little, the spread and any commission are a large part of every result, and the speed and quality of execution matter more than in any other style. It asks for unbroken attention. Some providers restrict it, so their terms are worth reading first.",
        shows: "A scalp is the thinnest mark on the path: on three invented months it would be narrower than a hair, so it is drawn wider than it is.",
      },
      {
        key: "day",
        name: "Day trading",
        values: ["Minutes to hours", "A few trades in a day", "No", "Five-minute to hourly charts", "Part of one day’s range", "Spread and commission", "Most of a session"],
        about:
          "Day trading opens and closes positions within one day, so nothing is held when the market shuts or the trading day rolls over. That avoids overnight financing and the gaps that can open between one session and the next. It is still frequent trading: costs are paid often, and the hours are those of the session being traded.",
        shows: "A day trade covers one day of the path: a narrow band, opened and closed before the day ends.",
      },
      {
        key: "swing",
        name: "Swing trading",
        values: ["Days to a few weeks", "A few trades in a month", "Yes", "Four-hour and daily charts", "One swing within a larger move", "Overnight financing", "A check or two a day"],
        about:
          "Swing trading holds a position for days or a few weeks, looking for one leg of a larger move. Trades are fewer, so the spread counts for less, and positions are held overnight and over weekends, so financing charges and gaps count for more. It can be followed without watching every hour, which is why it is often described as the style that fits around other work.",
        shows: "A swing trade covers a week or two of the path: a band wide enough to hold several nights, and the gaps that come with them.",
      },
      {
        key: "position",
        name: "Position trading",
        values: ["Weeks to months, sometimes years", "A few trades in a year", "Yes", "Daily and weekly charts", "A whole trend", "Overnight financing", "A check or two a week"],
        about:
          "Position trading holds for weeks, months or longer, on a view of a long trend, often formed from economics as much as from a chart. A handful of trades a year means the spread hardly matters. What matters is the cost of holding: financing charged every night for months, and the wide swings a long hold must sit through, which on margin require room in the account.",
        shows: "A position trade covers most of the path: it is held through every night and every swing along the way.",
      },
    ],
    read: "Read left to right and the holding time grows from seconds to months. As it grows, the cost that weighs most changes from what is paid on each trade to what is paid each night. The borders between the styles are loose, and nothing in the table says one is better: they are descriptions of how people trade, not a ladder to climb.",
    drawing: { title: "One invented path, four lengths of hold", note: "Three months of invented prices. The bands show how much of the path one trade of each style would span. Not market data." },
    faq: [
      { q: "What is the difference between day trading and swing trading?", a: "A day trader closes every position before the trading day ends and holds nothing overnight. A swing trader holds for days or weeks. The day trader pays the spread more often and avoids overnight financing and gaps; the swing trader pays the spread less often and accepts both." },
      { q: "Which trading style is best for beginners?", a: "No style is best in general, and none makes trading safe. They differ in the time they ask for, the costs they meet and the pace of decisions. Faster styles leave less time to think and pay costs more often; slower styles need patience and room for wider swings. Trading with leverage carries a high risk of loss, whatever the style." },
      { q: "Is scalping allowed everywhere?", a: "Not always. Some providers set a minimum time for which a position must be held, or other limits on very frequent trading. The provider’s own terms say what is allowed." },
    ],
    terms: ["scalping", "day-trading", "swing-trading", "position-trading", "overnight-position", "swap", "spread", "trend"],
  },
  {
    slug: "chart-types",
    name: "Chart types",
    title: "Chart types compared: line, bar, candlestick and Heikin-Ashi",
    description:
      "Line, bar (OHLC), candlestick and Heikin-Ashi charts side by side: what each is drawn from, what it shows and hides, and how Heikin-Ashi candles are calculated. The same invented prices are drawn all four ways.",
    lead: "Four drawings of the same prices. Each keeps some of the information and gives up the rest, and one of them, Heikin-Ashi, does not show real prices at all.",
    things: "chart types",
    rows: ["Drawn from", "Shows each period’s high and low?", "Shows the true open and close?", "Direction is shown by", "Gaps between periods visible?", "Is the latest value a real price?", "Often used for"],
    items: [
      {
        key: "line",
        name: "Line chart",
        values: ["Closing prices only", "No", "The close only", "The slope of the line", "No", "Yes", "The broad direction, at a glance"],
        about:
          "A line chart joins one price from each period, almost always the close, with a line. It is the simplest picture of where a price has been. Everything that happened inside a period is left out: how high and low the price went, and where the period began.",
        shows: "The line chart joins the closing prices and nothing else: the path is clear, and each period’s range is missing.",
      },
      {
        key: "bar",
        name: "Bar chart",
        values: ["Open, high, low and close", "Yes", "Yes", "The side each tick is on", "Yes", "Yes", "The range of each period"],
        about:
          "A bar chart, also called an OHLC chart, draws each period as a vertical line from its low to its high, with a small tick to the left at the open and a small tick to the right at the close. It holds the same four prices as a candlestick and draws them more sparely.",
        shows: "The bar chart draws each period from low to high, with a tick on the left for the open and on the right for the close.",
      },
      {
        key: "candle",
        name: "Candlestick chart",
        values: ["Open, high, low and close", "Yes", "Yes", "The colour of the body", "Yes", "Yes", "Reading the shape of single periods"],
        about:
          "A candlestick shows the same four prices as a bar. The span between open and close is drawn as a thick body, coloured or filled one way when the close is above the open and another way when it is below; thin wicks run to the high and the low. The method comes from Japan and is the usual default on trading platforms. The body makes each period’s direction and strength easy to see, which is why named patterns are described in candles.",
        shows: "The candlestick chart gives each period a body from open to close and wicks to the high and low; filled bodies closed lower.",
      },
      {
        key: "heikin-ashi",
        name: "Heikin-Ashi chart",
        values: ["Averages of open, high, low and close", "Yes", "No: both are averages", "The colour of the body", "No", "No", "Seeing a trend with less noise"],
        about:
          "Heikin-Ashi means “average bar” in Japanese. Each candle is calculated: its close is the average of the period’s open, high, low and close, and its open is the midpoint of the previous Heikin-Ashi candle’s open and close. The result is smoother, with longer runs of one colour, and it lags. The prices on a Heikin-Ashi chart are not prices at which anything traded, so the last candle does not show where the market is, and gaps disappear because every open is set from the candle before.",
        shows: "The Heikin-Ashi chart averages the same prices: the colours run in longer streaks, and the levels shown are not prices that traded.",
      },
    ],
    read: "The first three columns are three drawings of real prices, each showing more than the one before. The fourth is a calculation made from them. The rows to notice are the ones where Heikin-Ashi answers differently from the candlestick it resembles: its open, its close and its latest value are averages.",
    drawing: { title: "The same invented prices, drawn four ways", note: "Twenty-two invented periods, the same in all four panels. The Heikin-Ashi panel is calculated from them by the formula on this page. Not market data." },
    faq: [
      { q: "What is the difference between a candlestick chart and a bar chart?", a: "None in the information: both draw the open, high, low and close of each period. A candlestick draws the span from open to close as a thick, coloured body; a bar chart marks the open and close with small ticks on a single line. The candlestick makes direction easier to see at a glance." },
      { q: "How are Heikin-Ashi candles calculated?", a: "The Heikin-Ashi close is the average of the period’s open, high, low and close. The Heikin-Ashi open is the average of the previous Heikin-Ashi candle’s open and close. The high is the highest of the period’s high and the two calculated values, and the low is the lowest of the period’s low and the two calculated values." },
      { q: "Can I read exact prices from a Heikin-Ashi chart?", a: "No. Its open and close are averages, so they are not prices at which the market traded, and the last candle does not show the current price. Levels for orders are read from an ordinary chart or from the quote." },
    ],
    terms: ["candlestick", "japanese-candlestick", "wick", "tick", "gap", "trend", "price-action", "technical-analysis"],
  },
  {
    slug: "ways-to-pay-for-trading",
    name: "Ways to pay for trading",
    title: "Trading costs compared: spread, commission and swap",
    description:
      "Three ways a trade is paid for, side by side: a spread with the charge inside it, a raw spread with a separate commission, and swap on positions held overnight. When each is paid, how it is shown and what it depends on. A general explanation, with no rates.",
    lead: "Three charges, and they are not three choices. The first two are alternative ways of paying to get in and out of a trade. The third is paid, or sometimes received, by any position that is still open at the end of the day.",
    things: "ways of paying",
    rows: ["What it is", "When it is paid", "How it is shown", "Depends on the size of the trade?", "Depends on how long it is held?", "Can it be a credit?", "What makes it change"],
    items: [
      {
        key: "spread-only",
        name: "Spread only",
        values: [
          "The gap between the buying and the selling price, with the provider’s charge inside it",
          "On every trade",
          "In the quote, with no separate line",
          "Yes",
          "No",
          "No",
          "The market: the spread widens when trading is thin or fast",
        ],
        about:
          "Every quote has two prices: a higher one to buy at and a lower one to sell at. The gap is the spread. On a spread-only account the provider’s charge is added to that gap and there is no other fee for the trade. A position starts at a small loss equal to the spread, because it was bought at one price and could be sold only at the other. Nothing appears as a line on the statement, which makes this the simplest pricing to read and the easiest to overlook.",
        shows: "Spread only: the two prices stand well apart, and the whole cost is met at once, as the trade crosses from one to the other.",
      },
      {
        key: "raw-commission",
        name: "Raw spread plus commission",
        values: [
          "A narrower gap between the two prices, and a separate fee for each trade",
          "On every trade",
          "Partly in the quote, partly as a line on the statement",
          "Yes",
          "No",
          "No",
          "The market moves the spread; the commission is usually a set amount for each lot",
        ],
        about:
          "Here the spread is passed on at, or close to, the level the provider itself is quoted, and the charge is made separately as a commission, usually a set amount for each lot traded and often taken once on opening and once on closing. The two parts must be added together to compare with a spread-only price. The commission does not widen when the market does, so the cost is steadier, and it appears as its own line.",
        shows: "Raw spread plus commission: the two prices stand close together, and a separate fee is added when the trade opens and again when it closes.",
      },
      {
        key: "swap",
        name: "Swap",
        values: [
          "Interest charged or paid on a position kept open overnight",
          "Each night a position stays open",
          "A line on the statement each night",
          "Yes",
          "Yes",
          "Yes, sometimes",
          "Interest rates, and the provider’s own margin on them",
        ],
        about:
          "A leveraged position is, in effect, a loan, and a loan carries interest. For a currency pair the swap comes from the difference between the two currencies’ interest rates, adjusted by the provider: holding the higher-rate currency may earn a small credit, and holding the lower-rate one costs. For other instruments it is a financing charge. It is applied once a day at the rollover time, and on one day of the week it is commonly applied three times over, to account for the weekend. A trade closed the same day pays none. Some accounts replace swap with a different charge.",
        shows: "Swap: none is charged while the first day lasts; an amount is added at each of the three nights the trade stays open, on top of the cost of getting in and out.",
      },
    ],
    read: "Compare the first two columns with each other: they are two ways of charging for the same thing, and only the total of spread and commission can be compared between them. The third column is in addition to either. The row on holding time is the one that divides them: the first two are paid once for each trade however long it lasts, and the third grows with every night.",
    drawing: { title: "One invented trade, held for three nights", note: "An invented trade. The heights are chosen to show when each cost arrives, not how large it is: no rate or amount here is real." },
    faq: [
      { q: "Which is cheaper: spread only, or raw spread plus commission?", a: "It depends on the numbers, and they have to be added up. The cost of a raw-spread trade is the spread plus the commission for opening and closing; the cost of a spread-only trade is the spread alone. Whichever total is smaller for the size and instrument traded is cheaper for that trade. Neither is cheaper as a rule." },
      { q: "What is swap in trading?", a: "Swap, also called rollover or overnight financing, is interest charged or paid on a position left open past the end of the trading day. For currencies it reflects the difference between the two interest rates, adjusted by the provider. It is applied every night the position stays open, so it grows with the length of the hold." },
      { q: "Is the spread a fee?", a: "It is a cost, though it is not shown as a fee. A position is opened at one of the two prices and can be closed only at the other, so it begins at a loss equal to the spread. On a spread-only account the provider’s charge is part of that gap." },
    ],
    terms: ["spread", "variable-spread", "swap", "rollover", "bid-price", "ask-rate", "lot", "pip", "overnight-position", "interest-rate-differential", "carry-trade"],
    own: { label: "Account types", href: "/trading/accounts" },
  },
  {
    slug: "analysis-types",
    name: "Types of analysis",
    title: "Technical, fundamental and sentiment analysis compared",
    description:
      "Technical, fundamental and sentiment analysis side by side: the question each asks, what it looks at, the tools it uses, the time it suits and where it fails. A plain comparison; none of the three predicts a price.",
    lead: "Three ways of studying a market. One reads the price itself, one reads the things the price is supposed to reflect, and one reads the people who are trading it.",
    things: "kinds of analysis",
    rows: ["The question it asks", "What it looks at", "Typical tools", "Time it usually suits", "Where it fails", "Can it say what happens next?"],
    items: [
      {
        key: "technical",
        name: "Technical analysis",
        values: ["What has the price done?", "The history of price, and of volume where there is any", "Charts, trend lines, levels, indicators", "Any, from minutes to years", "Patterns in past prices need not repeat", "No"],
        about:
          "Technical analysis studies the record of the price itself: its direction, the levels at which it has turned before, how far and how fast it moves. Its tools are the chart, lines drawn on it, and indicators calculated from past prices, such as moving averages. It works the same way on any market and any time frame. Its limit is that it describes what has happened: a pattern that preceded a rise before may precede nothing next time.",
        shows: "Technical analysis looks at the price alone: here, an average of the path’s own recent values and a level at which it has turned before.",
      },
      {
        key: "fundamental",
        name: "Fundamental analysis",
        values: ["What is it worth, and why?", "Economic data, interest rates, company accounts", "The economic calendar, official reports, valuation models", "Weeks to years", "It can be right about value and wrong about timing for a long while", "No"],
        about:
          "Fundamental analysis studies what stands behind a price. For a currency that means interest rates, inflation, growth and the decisions of the central bank; for a share, the company’s earnings and debts; for a commodity, supply and demand. It tries to judge whether a price is high or low against those. It says little about timing: a price can stay far from any estimate of value for a long time, and scheduled news is often already in the price before it is published.",
        shows: "Fundamental analysis looks behind the price: here, an estimate of value that changes only when new data is published, while the path wanders around it.",
      },
      {
        key: "sentiment",
        name: "Sentiment analysis",
        values: ["What is the crowd thinking and holding?", "Positioning reports, surveys, option prices", "Positioning data, volatility measures, surveys", "Often days to weeks", "It is hard to measure, and a crowd can stay one-sided for a long while", "No"],
        about:
          "Sentiment analysis studies the participants: how many are positioned for a rise and how many for a fall, and how confident or fearful they appear. Its sources include published positioning figures, such as the weekly Commitments of Traders report from the US Commodity Futures Trading Commission for futures markets, surveys, and the prices of options. It is often read as a warning that a view has become crowded. The measures are partial and late, and a crowded view can go on being right.",
        shows: "Sentiment analysis looks at the people: here, an invented gauge of how much of the crowd is positioned for a rise, beneath the same path.",
      },
    ],
    read: "Each column is a different question put to the same market, and they are often used together. The last row is the same in all three on purpose. Each method organises what is known; none of them removes the uncertainty about what a price does next.",
    drawing: { title: "One invented path, three things to look at", note: "An invented path, an invented estimate of value and an invented gauge. They show what each method looks at, not what any market is doing." },
    faq: [
      { q: "What is the difference between technical and fundamental analysis?", a: "Technical analysis studies the price’s own history, on a chart, and asks what the price has done. Fundamental analysis studies what lies behind the price, such as interest rates, economic data or company earnings, and asks what the thing is worth. The first is about behaviour and timing; the second is about value and cause." },
      { q: "Which type of analysis is most accurate?", a: "None of them forecasts reliably, and there is no agreed ranking. Each can describe the past well and each has failed in well-known ways. Many traders use more than one, as different views of the same uncertain thing." },
      { q: "What is market sentiment?", a: "The prevailing mood and positioning of the people trading a market: whether most expect a rise or a fall, and how strongly. It is estimated from positioning reports, surveys and option prices, none of which measures it exactly." },
    ],
    terms: ["technical-analysis", "fundamental-analysis", "sentiment", "indicator", "moving-average", "support", "resistance", "central-bank", "volatility", "trend"],
  },
];

export const getComparison = (slug: string) => COMPARISONS.find((c) => c.slug === slug);
