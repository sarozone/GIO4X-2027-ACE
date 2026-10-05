/**
 * MARKET PRIMERS — long-form explanations of how markets work, one page each.
 *
 * A primer is prose in sections: what the thing is, how it works, one small
 * worked example, what the page does not tell the reader, and where GIO4X
 * stands. The rules this file keeps:
 *
 * - general, durable, well-established facts only. No advice, no forecast, no
 *   "best", no promise of a return, and no statistic presented as data;
 * - every number in an `example` is an invented round figure, labelled as an
 *   illustration where it is shown. None is a market price or a GIO4X fee;
 * - nothing is claimed about GIO4X's own execution model, liquidity
 *   providers, fees, servers or products. `here` says plainly what GIO4X
 *   lists (src/data/instruments.ts) and what it does not, and where a thing
 *   has not been published (docs/WAITING-FOR-ABE.md, D11) it says so.
 *
 * `terms` are glossary slugs, `tools` are tool slugs and `lessons` are Academy
 * lesson slugs: the page links only to those that really exist. `links` are
 * other pages of this site, each checked against the route tree when written.
 */
import { TRADER_PRIMERS } from "./primers-trader";

export type PrimerSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  /** a short list that follows the paragraphs, where a list reads better than prose */
  points?: readonly string[];
};

export type Primer = {
  slug: string;
  /** the short name, for cards and breadcrumbs */
  name: string;
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  /** one line for the index card */
  card: string;
  also: readonly string[];
  /** the opening: what the page is about, in two or three sentences */
  is: string;
  sections: readonly PrimerSection[];
  /** one worked example in words; every figure in it is invented */
  example: { title: string; setup: string; steps: readonly string[]; reading: string };
  /** what this page does not tell you */
  limits: readonly string[];
  /** where GIO4X stands: what it lists, what it does not, what is not yet published */
  here: string;
  terms: readonly string[];
  tools: readonly string[];
  lessons: readonly string[];
  links: readonly { kind: string; label: string; href: string; note: string }[];
  faq: readonly { q: string; a: string }[];
};

export const PRIMERS: readonly Primer[] = [
  {
    slug: "how-commodities-trade",
    name: "How commodities trade",
    title: "How commodities trade: futures, spot, CFDs and the roll",
    description:
      "How a raw material is traded: the spot market, futures contracts and CFDs, what contango and backwardation are, why a contract is rolled over, how seasons shape prices, and physical delivery against cash settlement. With a worked example.",
    card: "One raw material, three kinds of price: for delivery now, for delivery later, and a contract that only follows.",
    also: ["contango and backwardation explained", "what is rollover in commodities", "futures vs spot price", "commodity CFD explained"],
    is: "A raw material is bought and sold in more than one form at the same time: for delivery now, for delivery in a named month ahead, and as a contract that only follows the price. The prices are related but not equal, and the differences between them explain most of what puzzles a newcomer to a commodity chart.",
    sections: [
      {
        id: "three-ways",
        title: "Three ways to trade one raw material",
        paragraphs: [
          "The spot market, also called the cash or physical market, is where the material itself changes hands for delivery now. Its users are mostly producers, merchants, refiners and manufacturers. A spot price is always for a stated grade at a stated place, because a barrel at a pipeline hub and a barrel on a ship are not the same thing to a buyer who needs it somewhere.",
          "A futures contract is a standardised agreement, traded on an exchange, to buy or sell a fixed quantity of a stated grade for delivery in a named month. Both sides post margin with the exchange’s clearing house, and gains and losses are settled between them every day. Because every contract for a given month is identical, it can be sold on to anyone, and most are closed before delivery ever comes up.",
          "A contract for difference is an agreement with a provider to exchange the change in a price between the moment a position is opened and the moment it is closed. Nothing is owned and nothing is delivered. The price of a commodity CFD is taken from an underlying market, which is commonly a futures contract and sometimes a spot quotation, and the other party is the provider, not an exchange.",
        ],
      },
      {
        id: "curve",
        title: "The futures curve: contango and backwardation",
        paragraphs: [
          "Each delivery month has a price of its own. Set side by side, from the nearest month to the furthest, those prices form the futures curve.",
          "When later months cost more than nearer ones, the market is said to be in contango. It is the shape commonly seen when supply is ample: the gap reflects, in part, what it costs to store, insure and finance the material until the later date, which is called the cost of carry.",
          "When nearer months cost more than later ones, the market is in backwardation. It is commonly seen when the material is scarce today: buyers who need it now pay more than those who can wait.",
          "The curve is not a forecast. A price for delivery in six months is the price at which that delivery can be agreed today, and it changes as often as any other price.",
        ],
      },
      {
        id: "rollover",
        title: "Rollover: why a contract has to be replaced",
        paragraphs: [
          "A futures contract expires. Anyone who wants to stay in the market beyond that date must close the expiring month and open a later one. That exchange is the roll.",
          "The two months have different prices, so a chart that joins one contract to the next shows a step on the day of the roll. The step is not a move in the market: it is the gap between two different contracts.",
          "A CFD built on futures meets the same date. The provider changes the underlying contract on a stated day, and the usual practice is a cash adjustment to open positions equal to the difference between the two prices, so that the change of contract neither gives nor takes by itself. Dealing costs still apply.",
          "Over many rolls the shape of the curve tells. In contango a holder who is long keeps leaving a cheaper contract for a dearer one, and if the dearer one then drifts down towards the spot price as its own expiry nears, that drift is a loss. In backwardation the effect runs the other way. This is why the result of holding a futures-based product for a long time can differ from the change in the headline price of the commodity.",
          "A note on the word: in foreign exchange, rollover means carrying a position overnight and the financing that goes with it. That is a different thing from the change of contract described here.",
        ],
      },
      {
        id: "seasons",
        title: "Seasons",
        paragraphs: [
          "Many commodities are produced or used to a calendar. A crop is planted, grows and is harvested once a year in each hemisphere; the supply arrives within a few weeks and is stored for the rest of the year. Its price is usually most sensitive to weather while the crop is in the ground, when the size of the harvest is still unknown.",
          "Energy has seasons of demand. Natural gas and heating fuels are drawn on in cold months and stockpiled in mild ones; motor fuel is used most in the months when people travel.",
          "Because these patterns are known to everyone, they are already in the curve: it is one of the reasons delivery in one month is priced differently from delivery in another. What moves a price is the season that turns out differently from the one expected, such as a mild winter or a failed harvest. A known season is not, by itself, a reason for a price to rise or fall.",
        ],
      },
      {
        id: "delivery",
        title: "Physical delivery and cash settlement",
        paragraphs: [
          "Some futures contracts are settled by delivery: the seller hands over the material, or a document of title to it in an approved warehouse, and the buyer pays. Others are settled in cash against a published reference price, and no material moves.",
          "Either way, the price of a contract is drawn towards the spot price as its expiry approaches. If it were not, a merchant could buy in the cheaper market and deliver into the dearer one.",
          "Most people who trade futures do not want the material. They close or roll their positions before the delivery period, and firms that serve individuals generally require it. The last days of a deliverable contract belong to those who can make or take delivery, and prices then can behave strangely. On 20 April 2020 the expiring United States crude oil contract settled below zero: with storage at the delivery point scarce, holders who could not take delivery paid others to take the contracts from them.",
        ],
      },
    ],
    example: {
      title: "One roll, in round numbers",
      setup: "A position is long one unit of a CFD that follows the nearest futures month. The nearest month stands at 80 and the next month at 82: a contango of 2.",
      steps: [
        "On the roll date the provider moves the CFD to the next month. The quoted price steps from 80 to 82.",
        "Left alone, the position would show a gain of 2 that no market produced. The provider therefore debits 2 as an adjustment. The position is worth exactly what it was before the roll.",
        "Suppose the spot price then stays at 80 until the new contract expires, and nothing else changes. The new contract is drawn down from 82 towards 80 as its expiry approaches.",
        "The position has lost 2, although the spot price of the commodity ended where it began.",
      ],
      reading: "The loss did not come from the adjustment, which was neutral. It came from holding a contract that was priced above spot and converged on it. The example leaves out the spread and overnight financing, which would be added to it.",
    },
    limits: [
      "The terms of any particular contract: its size, its grade, its delivery months and its last trading day. Those are in the exchange’s rulebook or the provider’s specification, and they change.",
      "Any price, stock level or production figure, or which way a curve will move. Nothing here is a forecast or a reason to trade.",
      "The dates on which a provider changes contract, or how it works out the adjustment. Those are the provider’s own published terms.",
      "How commodity trading is taxed or regulated where you live.",
    ],
    here: "GIO4X lists seven commodities as instruments: four precious metals quoted as spot pairs and three energy contracts traded as CFDs on margin. It does not offer exchange-traded futures, physical delivery or any of the other commodities in the A to Z. The energy page says that contracts may be subject to rollover; the published terms of each instrument are in the contract specifications, and where a rollover date or the method of adjustment is not shown there, it has not been published and can be asked for in writing.",
    terms: ["cfd", "spot-market", "forward-contract", "rollover", "swap", "contract-size", "hedging", "margin", "liquidity", "gap"],
    tools: ["swap", "cost-lab", "margin"],
    lessons: [],
    links: [
      { kind: "Markets", label: "Commodities A to Z", href: "/markets/commodities", note: "Each raw material, one page: what it is, its unit and what moves it." },
      { kind: "Investing", label: "Futures", href: "/investing/futures", note: "The contract itself, with an interactive example." },
      { kind: "Markets", label: "Energy", href: "/markets/energy", note: "Brent, WTI and natural gas at GIO4X." },
      { kind: "Markets", label: "Metals", href: "/markets/metals", note: "Gold, silver, platinum and palladium at GIO4X." },
      { kind: "Trading", label: "Contract specifications", href: "/trading/specifications", note: "Every instrument’s published terms in one table." },
      { kind: "Comparison", label: "Instrument types", href: "/side-by-side/instrument-types", note: "Spot, futures, CFDs and others, side by side." },
      { kind: "History", label: "The pandemic crash of 2020", href: "/history/pandemic-crash-2020", note: "The weeks in which the oil contract settled below zero." },
    ],
    faq: [
      { q: "Is contango bad for someone who is long?", a: "It is a cost of holding, not a verdict. In contango each roll moves a long position into a dearer contract, and if that contract falls towards the spot price as it nears expiry, the holder loses that difference. Whether the position gains or loses overall still depends on what the price of the commodity itself does." },
      { q: "Why does my chart show a jump on the day of the roll?", a: "Because the chart has moved from one contract to another, and the two have different prices. Where a provider adjusts open positions for the difference, the jump on the chart is matched by a debit or credit and the value of the position does not change." },
      { q: "Can a CFD holder be made to take delivery of oil?", a: "No. A CFD is settled in money and nothing is delivered. Delivery is a feature of some exchange-traded futures contracts, and concerns only those who hold them into the delivery period." },
    ],
  },
  {
    slug: "bonds-and-interest-rates",
    name: "Bonds and interest rates",
    title: "Bonds and interest rates: price, yield and the curve",
    description:
      "How bonds and interest rates fit together: what a bond is, why its price and its yield move in opposite directions, duration and credit in plain words, how to read a yield curve, and why currencies follow yields. With a worked example.",
    card: "Why a bond’s price falls when rates rise, what the curve shows, and why currencies watch both.",
    also: ["why bond prices fall when rates rise", "yield curve explained", "what is duration", "bond yields and currencies"],
    is: "A bond is a loan that can be sold on. Its price and its yield move in opposite directions, and the yields on government bonds are the reference from which other interest rates, and a good part of the movement in currencies, take their bearings.",
    sections: [
      {
        id: "what",
        title: "What a bond is",
        paragraphs: [
          "A borrower, usually a government or a company, raises money by issuing bonds. Each bond has a face value, a rate of interest called the coupon, and a date of repayment called its maturity. Whoever holds the bond receives the coupons and, at maturity, the face value.",
          "Once issued, a bond is traded between investors at whatever price they agree. The borrower’s promise does not change; the price of the promise does.",
        ],
      },
      {
        id: "price-yield",
        title: "Why price and yield move in opposite directions",
        paragraphs: [
          "The coupon is fixed in money. The yield is the return a buyer earns at the price actually paid. Pay less for the same payments and the return is higher; pay more and it is lower. That is the whole of the relationship, and it is arithmetic, not a tendency.",
          "It follows that when interest rates in general rise, existing bonds fall in price. Nobody will pay full price for an old bond when a new one, just as safe, pays more. The old bond’s price falls until its yield is in line with the new ones. When rates fall, the reverse happens and existing bonds gain.",
          "A holder who keeps a bond to maturity, and whose borrower pays, still receives exactly what was promised. The change in price in between matters to anyone who sells before then, or whose holdings are valued every day.",
        ],
      },
      {
        id: "duration",
        title: "Duration, in plain words",
        paragraphs: [
          "How far a price moves for a given change in yield depends mostly on how long the money is tied up. If rates rise by one point, the holder of a one-year bond is paid too little for one year; the holder of a twenty-year bond is paid too little for twenty. The second bond’s price must fall much further to make up for it.",
          "Duration is the measure of that sensitivity. As a rule of thumb, it is the percentage by which a bond’s price changes for a change of one percentage point in its yield: a duration of 7 means a fall of about 7 per cent in price if the yield rises by one point, and a similar rise if it falls. The approximation is good for small changes and less so for large ones.",
        ],
      },
      {
        id: "credit",
        title: "Credit, in plain words",
        paragraphs: [
          "Credit risk is the risk that the borrower does not pay in full or on time. A government borrowing in a currency it issues itself is treated as the reference for that currency. Every other borrower pays more, and the extra is called the credit spread.",
          "Rating agencies grade borrowers, and the grades fall into two broad groups, investment grade and high yield. A rating is an opinion, not a guarantee, and ratings have been wrong. Spreads usually widen when investors are anxious and narrow when they are confident, so the bonds of a weak borrower can fall in price even when government yields have not moved.",
        ],
      },
      {
        id: "curve",
        title: "The yield curve",
        paragraphs: [
          "Take one government’s bonds, set their yields out by maturity from a few months to thirty years, and the line through them is the yield curve.",
          "The short end is tied closely to the central bank’s policy rate and to what is expected of it over the coming months. The long end reflects what investors expect of rates and inflation over many years, plus something extra for the uncertainty of lending for so long.",
          "The curve usually slopes upwards, because lenders ask more for a longer wait. It flattens, or inverts so that short yields stand above long ones, when investors expect the policy rate to be lower in future than it is now. An inverted curve has come before a number of recessions, notably in the United States, which is why it is watched. It has also given false alarms, and it says nothing about timing.",
        ],
      },
      {
        id: "currencies",
        title: "Why currencies follow yields",
        paragraphs: [
          "Money can move between currencies. If the safe bonds of one currency pay more than those of another, holding the first is better rewarded, other things being equal, and money tends to move towards it. The gap between the two is the interest-rate differential, and it is one of the things a currency pair follows most closely.",
          "What moves an exchange rate is a change in that gap against what was expected. A rate rise that everyone foresaw is already in the price; a decision or a sentence from a central bank that changes the expected path is what moves yields, and the currency with them. Yields at shorter maturities, such as two years, are widely watched for this reason, because they sum up where the policy rate is expected to go.",
          "The link is not mechanical. A yield can rise because investors expect stronger growth and higher policy rates, and the currency commonly rises with it. A yield can also rise because investors fear inflation or doubt the borrower, and then the currency can fall while the yield climbs. In times of stress, money moves towards the currencies and bonds regarded as safe havens whatever they yield. What is left after expected inflation, the real yield, is often the more telling figure, and it is the one commonly set beside the price of gold, which pays no interest.",
        ],
      },
    ],
    example: {
      title: "One bond, two prices",
      setup: "A bond with a face value of 100 pays a coupon of 4 a year. It was bought at 100, so its running yield is 4 per cent.",
      steps: [
        "Interest rates rise, and new bonds of the same kind are issued paying 5 a year on 100.",
        "Nobody will now pay 100 for an income of 4. The price of the old bond falls.",
        "At a price of 80, an income of 4 is a running yield of 5 per cent (4 divided by 80), the same as a new bond.",
        "The holder who sells now has lost 20. The holder who waits until maturity is still paid 4 a year and 100 at the end.",
      ],
      reading: "This uses the running yield, which counts only the income. The yield investors actually compare, the yield to maturity, also counts the rise from the price paid back to 100 at repayment. For that reason the real fall in price would be smaller than 20, and smaller still the sooner the bond matures: that is duration at work.",
    },
    limits: [
      "The yield or price of any bond today, or the level of any central bank’s rate. This website has no licensed source for market data on bonds.",
      "Where interest rates or exchange rates are going. An explanation of why two things have tended to move together is not a forecast that they will.",
      "Whether bonds, or any particular bond or bond fund, suit your circumstances.",
      "The details that matter in practice: how yield to maturity is worked out, inflation-linked bonds, callable bonds, and how interest and gains are taxed.",
    ],
    here: "GIO4X lists no bonds, no bond CFDs and no interest-rate futures. This page is here because bond yields move things GIO4X does list: currency pairs, gold and the stock indices. Rates on any bond or currency are to be read from the body that publishes them, such as the central banks on the Central Bank Watch pages.",
    terms: ["yield", "real-yields", "interest-rate-differential", "carry-trade", "central-bank", "monetary-policy", "inflation", "hawkish", "dovish", "safe-haven", "quantitative-easing", "recession"],
    tools: [],
    lessons: ["central-bank-policies-explained"],
    links: [
      { kind: "Markets", label: "Central Bank Watch", href: "/markets/central-banks", note: "Who sets each policy rate, and how." },
      { kind: "Investing", label: "Bonds", href: "/investing/bonds", note: "The instrument itself, with an interactive example." },
      { kind: "Economic event", label: "Interest rate decision", href: "/markets/events/interest-rate-decision", note: "What the announcement is and why it matters." },
      { kind: "Economic event", label: "Consumer price index", href: "/markets/events/cpi", note: "The inflation release that yields react to." },
      { kind: "Strategy", label: "The carry trade", href: "/strategies/carry-trade", note: "An approach built on the differential, with its risks." },
      { kind: "Calculator", label: "Inflation", href: "/money/inflation", note: "What rising prices do to a sum of money." },
    ],
    faq: [
      { q: "If I hold a bond to maturity, does a fall in its price matter?", a: "If the borrower pays, you receive every coupon and the face value as promised, whatever the price did in between. The fall matters if you need to sell early, and it is real in another sense: your money is earning less than a new bond would pay." },
      { q: "Why would a currency fall when its bond yields rise?", a: "Because of the reason for the rise. If yields climb as investors come to doubt the borrower or to fear inflation, they are being paid more to hold something they trust less, and money may leave the currency all the same." },
      { q: "Is an inverted yield curve a prediction of recession?", a: "It shows that investors expect lower policy rates in future than today. That has come before a number of recessions, and it has also appeared without one following. It gives no date and is not a signal to act on." },
    ],
  },
  {
    slug: "etfs-and-funds",
    name: "ETFs and funds",
    title: "ETFs and funds explained: active, passive, costs and tracking",
    description:
      "Funds explained: what a fund is, how a mutual fund and an ETF differ, active and passive management, what a fund costs, tracking difference and tracking error, and how holding a fund differs from a CFD on an index. With a worked example.",
    card: "What a fund is, what it costs to hold, and why a CFD on an index is a different thing.",
    also: ["what is an ETF", "active vs passive funds", "tracking difference explained", "ETF vs index CFD"],
    is: "A fund pools the money of many people and invests it as one portfolio. Funds differ in who decides what is held, in what is charged, and in how the units are bought and sold. A CFD on an index is not a fund at all, and the difference matters.",
    sections: [
      {
        id: "what",
        title: "What a fund is",
        paragraphs: [
          "Investors pay money into a pool and receive units in it. A manager invests the pool under written rules, and a separate institution, a custodian or depositary, holds the assets, so that they are not the manager’s own property. The value of everything the fund holds, less what it owes, divided by the number of units, is the net asset value of one unit.",
          "A mutual fund, which goes by other names in other countries, deals with its investors directly. Units are created and cancelled as money comes in and goes out, usually once a day, at net asset value.",
          "An exchange-traded fund is listed on a stock exchange, and investors buy and sell its units from one another throughout the day at a market price. That price is kept close to net asset value by large firms that are allowed to exchange blocks of units with the fund for the underlying holdings, and that profit from closing any gap. In calm markets the gap is small. In disorderly ones it can widen.",
          "A third kind, the closed-end fund or investment trust, has a fixed number of shares, and its price can stand well above or below the value of what it holds.",
        ],
      },
      {
        id: "active-passive",
        title: "Active and passive",
        paragraphs: [
          "A passive fund follows an index by rule: it holds what the index holds, in the same proportions, and changes only when the index does. An active fund has a manager who chooses what to hold, with the aim of doing better than a benchmark.",
          "Choosing costs money, in research, salaries and dealing, so active funds generally charge more.",
          "One piece of arithmetic is worth knowing. Before costs, all the investors in a market, taken together, earn the market’s return, because together they are the market. After costs, the average actively managed pound must therefore earn less than the average passively managed one. This does not say that no manager does better. It says that doing better cannot be the typical result.",
          "Passive does not mean safe. An index fund falls when its index falls, by the same amount. And the choice of index, which decides what is held and in what weight, is itself a decision.",
        ],
      },
      {
        id: "costs",
        title: "What a fund costs",
        paragraphs: [
          "The main charge is taken out of the fund’s assets a little each day. It never appears on a bill, and it is quoted as a percentage per year under names such as ongoing charges figure or total expense ratio.",
          "On top of it come the costs of dealing inside the fund; for an ETF, the commission and the spread between buying and selling price when the investor trades; on some mutual funds, a charge on the way in or out; whatever the platform or adviser charges; and tax.",
          "A percentage that looks small is taken every year from the whole pot, not from the gains, and what it takes would otherwise have gone on growing.",
        ],
      },
      {
        id: "tracking",
        title: "Tracking difference and tracking error",
        paragraphs: [
          "No index fund matches its index exactly. Tracking difference is the fund’s return less the index’s return over a period. It is usually slightly negative, by about the amount of the charges.",
          "Other things move it either way: cash held uninvested, tax withheld on dividends, the cost of dealing when the index changes, holding a representative sample of an index in place of every security in it, and income from lending securities, which can offset part of the costs.",
          "Tracking error is a different measure: how much the gap varies from one day to the next. A fund can have a small tracking error and still lag its index steadily.",
          "Most index funds hold the securities themselves. Some, called synthetic, obtain the index return through a swap with a bank, which adds a dependence on that bank. A fund may pay its income out or reinvest it, and the two kinds of unit are priced differently for that reason.",
        ],
      },
      {
        id: "fund-or-cfd",
        title: "How a fund differs from a CFD on an index",
        paragraphs: ["Both follow an index, and there the likeness ends. A CFD is a contract with a provider to exchange the change in a price. It is not a holding."],
        points: [
          "Ownership. A unit in a fund is a share of real assets held by a custodian. A CFD holder owns no part of the index or its companies, only a claim on the provider.",
          "Leverage. A fund is normally paid for in full, and the most that can be lost is what was paid. A CFD is opened on margin, so a small move in the index is a large move against the money deposited, and a position can be closed by the provider when margin runs short.",
          "The cost of time. A fund’s charge is a small percentage a year. A CFD carries a spread and, commonly, a financing charge for every night it is held, worked out on the full value of the position. It is built for short periods, and its costs mount with time.",
          "Dividends. A fund collects the dividends and pays them out or reinvests them. A CFD holder receives no dividend; where the underlying index falls as shares go ex-dividend, providers commonly make a cash adjustment, credited to long positions and debited from short ones.",
          "Direction. A CFD can be sold short as readily as it is bought. An ordinary fund is a way to hold, not to bet on a fall.",
          "Who stands behind it. A fund’s assets are held apart from its manager. A CFD is only as good as the provider, and the protection given to clients differs from one jurisdiction to another.",
        ],
      },
    ],
    example: {
      title: "A charge of one point, over time",
      setup: "Two index funds hold exactly the same securities. One charges 0.2 per cent a year and the other 1.2 per cent. An investor puts 10,000 into each.",
      steps: [
        "In the first year the cheaper fund takes about 20 and the dearer about 120. The difference, 100, looks small against 10,000.",
        "The charge is taken every year, on whatever the pot has become, and the money taken no longer grows.",
        "After twenty years the dearer fund’s pot is smaller than the cheaper fund’s by about a sixth to a fifth, whether the market rose or fell over that time.",
      ],
      reading: "The size of the final gap depends very little on what the market did, because both funds held the same things; it comes from twenty years of losing one extra point a year. The figures leave out dealing costs, platform fees and tax, which would be added to both.",
    },
    limits: [
      "Which fund, index or manager to choose, or whether funds suit you at all. Nothing here is a recommendation.",
      "The charges, holdings or record of any real fund. Those are in the fund’s own documents, which are what count.",
      "How funds are taxed, which differs by country and by type of fund and can outweigh a difference in charges.",
      "The terms of any CFD: its spread, its financing and how dividends are adjusted are the provider’s own published terms.",
    ],
    here: "GIO4X lists no ETFs, mutual funds or other funds. It lists six stock indices and six large United States shares, all traded as CFDs on margin, which are the instruments the last section compares a fund with. Their published conditions are on the instrument pages, labelled as indicative; swap rates are not yet published. Copy trading and PAMM are described on their own pages, and nothing on this page describes them.",
    terms: ["index", "dividend", "cfd", "asset-allocation", "leverage", "margin", "swap", "spread", "notional-value", "liquidity"],
    tools: ["compound-growth", "cost-lab", "swap"],
    lessons: [],
    links: [
      { kind: "Investing", label: "ETFs", href: "/investing/etfs", note: "The instrument itself, with an interactive example." },
      { kind: "Investing", label: "Mutual funds", href: "/investing/mutual-funds", note: "The pooled fund that deals once a day." },
      { kind: "Investing", label: "Index investing", href: "/investing/index-investing", note: "Holding the whole list, and what that does and does not do." },
      { kind: "Markets", label: "Indices", href: "/markets/indices", note: "The six stock indices GIO4X lists as CFDs." },
      { kind: "Comparison", label: "Instrument types", href: "/side-by-side/instrument-types", note: "Shares, funds, CFDs and others, side by side." },
      { kind: "Case study", label: "John Bogle", href: "/investing/case-studies/bogle", note: "The case for the index fund, with sources." },
    ],
    faq: [
      { q: "Is an ETF safer than a share?", a: "It spreads money across many holdings, so one company’s failure matters less. It does not protect against a fall in the whole market it follows, and an ETF that follows a narrow or leveraged index can be riskier than a single large share." },
      { q: "Can an ETF trade at a price different from the value of what it holds?", a: "Yes, by a little in normal conditions and by more when markets are disorderly or when the underlying market is closed. The mechanism that closes the gap depends on firms being willing and able to trade both the units and the holdings." },
      { q: "Is a CFD on an index a cheap way to hold the index for years?", a: "It is not designed for that. Financing is commonly charged for every night on the full value of the position, the position is leveraged, and it can be closed by the provider if margin runs short. Over long periods those features weigh heavily." },
    ],
  },
  {
    slug: "order-types-in-depth",
    name: "Order types, in depth",
    title: "Order types in depth: fills, slippage, gaps and time in force",
    description:
      "Order types in depth: market, limit, stop, stop-limit and trailing stop orders, one-cancels-the-other, partial fills and fill policies, slippage, gaps and time in force. What each order makes certain and what it leaves open, with a worked example.",
    card: "Every order type, then what happens at the moment of execution: partial fills, slippage and gaps.",
    also: ["stop-limit order explained", "what is an OCO order", "what is slippage", "time in force GTC IOC FOK"],
    is: "An order is an instruction with conditions. Each type makes one thing certain, the price or the fill, and gives up certainty about the other. This page takes the types one at a time and then looks at what happens at the moment of execution.",
    sections: [
      {
        id: "market-limit",
        title: "Market and limit orders",
        paragraphs: [
          "A market order says: deal now, at the best price available. The fill is as certain as anything in a working market; the price is not. If the quantity is larger than what is offered at the best price, the order is filled at successively worse prices until it is complete.",
          "A limit order says: deal at this price or better, and otherwise not at all. A buy limit is placed below the current price and a sell limit above it. The price is certain; the fill is not. The market may never reach the limit, or may touch it for a moment with too little on offer to fill the order.",
        ],
      },
      {
        id: "stop",
        title: "Stop and stop-limit orders",
        paragraphs: [
          "A stop order sleeps until the market reaches its level, and then becomes a market order. A buy stop is placed above the current price and a sell stop below it. A stop-loss is a stop order attached to an open position. Because it turns into a market order, it is filled at the next price available, which may be worse than the level chosen.",
          "A stop-limit order becomes a limit order when it is triggered. The price is then protected, but the fill is not: in a fast fall a sell stop-limit can be triggered and left behind unfilled, with the position still open and the loss still growing.",
          "It matters which price does the triggering. On many retail platforms a sell order is triggered by the bid and a buy order by the ask. A stop that protects a short position is a buy order, so it can be set off when the spread widens, although a chart drawn from bid prices never shows the level being touched.",
        ],
      },
      {
        id: "trailing-oco",
        title: "Trailing stops and one-cancels-the-other",
        paragraphs: [
          "A trailing stop is a stop whose level follows the price at a fixed distance when the price moves in the position’s favour, and stays where it is when the price moves back. It never loosens.",
          "Where the trailing is done is a practical point. On some platforms the server does it. On others the trader’s own terminal does it, by sending a changed stop each time the price advances, and it ceases when that terminal is closed or loses its connection. MetaTrader 5 works in the second way.",
          "One-cancels-the-other, or OCO, links two orders so that when one is filled the other is cancelled. A stop-loss and a take-profit attached to the same position behave like this. As a free-standing pair, for example a buy stop above a range and a sell stop below it, OCO is offered on some platforms and not on others.",
        ],
      },
      {
        id: "partial",
        title: "Partial fills and fill policies",
        paragraphs: ["An order may meet less quantity at its price than it asks for. What happens to the remainder is set by the fill policy, which goes by standard names. Which of them applies, and whether a trader may choose, depends on the instrument and on how the broker has set it up."],
        points: [
          "Fill or kill: the whole quantity at once, or nothing.",
          "Immediate or cancel: fill what is available now and cancel the rest.",
          "Return: fill what is available and leave the rest working as an order.",
        ],
      },
      {
        id: "slippage-gaps",
        title: "Slippage and gaps",
        paragraphs: [
          "Slippage is the difference between the price expected when an order was sent and the price at which it was filled. It arises because prices move in the time an order takes to arrive, and because the quantity available at each price is limited. It can go either way. It is greatest when markets are fast or thin: at a scheduled release, at the open of a session, around the daily rollover.",
          "A gap is a jump from one price to another with no dealing in between, most often over a weekend or at a piece of news. A stop order whose level lies inside the gap is triggered at the first price beyond it and filled there, not at its own level. A limit order whose level lies inside a gap is usually filled at the better price on the far side.",
          "Some firms offer a guaranteed stop, which is filled at its level whatever happens, in return for a charge. Whether one is offered is a matter of each firm’s terms.",
          "Whether an order is filled, requoted or rejected when the price has moved away while it was on its way is likewise a matter of each firm’s terms.",
        ],
      },
      {
        id: "time-in-force",
        title: "Time in force",
        paragraphs: ["Time in force says how long an order remains alive if it is not filled."],
        points: [
          "Good till cancelled: it stays until it is filled or withdrawn.",
          "Day: it lapses at the end of the trading day.",
          "Good till date: it lapses at a stated date and time.",
          "Immediate or cancel, and fill or kill, are also instructions about time: the order lives for an instant.",
          "A pending order left working over a weekend or through a release is exposed to whatever gap occurs. An order forgotten is still an order.",
        ],
      },
    ],
    example: {
      title: "A stop, a gap and a stop-limit",
      setup: "A position is long from 100, with a sell stop at 95. The planned loss is 5 for each unit held. The market closes on Friday at 97.",
      steps: [
        "Over the weekend there is news. On Monday the first price is 91.",
        "The stop’s level, 95, lies inside the gap. The stop is triggered at the first price and filled at about 91.",
        "The loss is 9 for each unit, not 5. No price between 97 and 91 ever existed to sell at.",
        "Had the order been a stop-limit with a limit of 94, it would have been triggered and not filled, because the market was already below 94. The position would still be open at 91, with nothing now protecting it.",
      ],
      reading: "A stop sets the price at which an order is sent, not the price at which the position is closed. The number of units is the one thing in the example that was fully in the trader’s hands. The example leaves out the spread.",
    },
    limits: [
      "Which order types, fill policies and expiry settings are available on a particular platform, instrument or account. That is read from the platform itself and the broker’s terms.",
      "How any broker fills stops in a gap, whether it requotes, and whether it offers a guaranteed stop. Those are in its order execution policy.",
      "Where to place a stop or a target. This page explains what the instructions do, not how to choose their levels.",
      "How an order behaves on an exchange with auctions, price limits or halts, each of which has rules of its own.",
    ],
    here: "GIO4X’s order execution policy is not yet published, so this page says nothing about how GIO4X fills, requotes or rejects an order, which fill policies apply to its instruments, or whether any stop is guaranteed. Those points can be asked for in writing. What a rejection code in MetaTrader 5 means is explained on the order errors page, and the Order anatomy tool shows the parts of a single order.",
    terms: ["order", "market-order", "limit-order", "stop-order", "stop-loss", "take-profit", "trailing-stop", "pending-order", "slippage", "gap", "fill", "requote", "spread", "liquidity"],
    tools: ["order-anatomy", "position-size", "risk-reward"],
    lessons: [],
    links: [
      { kind: "Tool", label: "Order anatomy", href: "/tools/order-anatomy", note: "The parts of one order, drawn." },
      { kind: "Platforms", label: "MT5 order errors explained", href: "/platforms/metatrader-5/order-errors", note: "Why an order was rejected, code by code." },
      { kind: "Comparison", label: "Order types, side by side", href: "/side-by-side/order-types", note: "Five order types in one table, with an animated example." },
      { kind: "Playbook", label: "When the price gaps", href: "/playbook/what-to-do-when-price-gaps", note: "The situation, and what to check." },
      { kind: "Playbook", label: "Slippage on an order", href: "/playbook/slippage-on-an-order", note: "Why the fill differed from the price on screen." },
      { kind: "Playbook", label: "A stop hit by a wick", href: "/playbook/stop-loss-hit-by-a-wick", note: "Bid, ask and the price that triggers." },
      { kind: "Primer", label: "Market microstructure", href: "/primers/market-microstructure", note: "Who fills an order, and why spreads widen." },
      { kind: "Labs", label: "Trade Anatomy", href: "/labs/trade-anatomy", note: "One order followed from the click to the balance." },
    ],
    faq: [
      { q: "Does a stop-loss guarantee my maximum loss?", a: "No. An ordinary stop-loss guarantees that an order is sent when its level is reached. It is filled at the next price available, which in a fast market or after a gap can be some way beyond the level." },
      { q: "Why was my stop triggered when the chart never reached it?", a: "Often because the chart is drawn from one side of the quote and the order is triggered by the other. A stop on a short position is a buy order and is commonly triggered by the ask, which rises when the spread widens even if the bid does not move." },
      { q: "Is slippage always against the trader?", a: "No. Prices can move in the order’s favour between sending and filling, and a limit order by its nature can only be filled at its price or better. Whether favourable moves are passed on is one of the things an execution policy states." },
    ],
  },
  {
    slug: "market-microstructure",
    name: "Market microstructure",
    title: "Market microstructure: who is on the other side of a trade",
    description:
      "Market microstructure in plain words: exchanges and over-the-counter markets, the order book, market makers and liquidity providers, dealing-desk and agency (ECN, STP) broker models described neutrally, last look, and why spreads widen.",
    card: "Who takes the other side, how the two sides meet, and why there are two prices and not one.",
    also: ["who is on the other side of my trade", "ECN vs STP vs market maker", "what is last look", "why do spreads widen"],
    is: "Every trade has two sides. Microstructure is the study of who the other side is, how the two are brought together and what that costs. It explains why there are two prices and not one, and why the gap between them does not stay the same.",
    sections: [
      {
        id: "venues",
        title: "Two kinds of market",
        paragraphs: [
          "On an exchange, all orders for an instrument meet in one place under one rulebook. Shares and futures are mostly traded this way. Everyone sees the same prices, and the exchange publishes what was dealt and how much.",
          "In an over-the-counter market there is no central place. Dealers quote prices to their customers and to one another, by screen and by electronic link. Spot foreign exchange, most bonds and CFDs are traded like this. It follows that there is no single official price for a currency pair and no complete record of volume: the price is the quote of whoever is being dealt with.",
        ],
      },
      {
        id: "book",
        title: "The order book",
        paragraphs: [
          "An order book is the list of limit orders waiting to be filled. Orders to buy, the bids, are ranked from the highest price down; orders to sell, the asks or offers, from the lowest price up. Within a price, the earliest order comes first.",
          "The highest bid and the lowest ask are the top of the book, and the difference between them is the spread. The quantities waiting at each price are the depth.",
          "A limit order joins the book and waits, and is said to provide liquidity. A market order is matched at once against orders already waiting, and is said to take it. A market order larger than the quantity at the top works down through the levels, so the price paid depends on the size of the order as well as on the quote.",
        ],
      },
      {
        id: "makers",
        title: "Market makers and liquidity providers",
        paragraphs: [
          "A market maker quotes a price at which it will buy and a higher one at which it will sell, continuously, and deals with whoever comes. It earns the spread, and in return carries stock that may fall in value before it can be passed on.",
          "In foreign exchange the large liquidity providers are banks and specialist trading firms. They quote to one another, to trading platforms and to brokers.",
          "The spread pays for three things: the cost of handling the trade, the risk of holding the position, and the risk that the person on the other side knows something the market maker does not. When any of the three rises, the spread widens.",
        ],
      },
      {
        id: "brokers",
        title: "How a broker can handle a client’s order",
        paragraphs: [
          "There are two broad models, and neither is good or bad in itself.",
          "In the dealing-desk model, also called market making or dealing as principal, the broker is the other side of the client’s trade. It sets its own quotes, taken from the wider market, and may set one client’s position against another’s, keep the remaining risk or hedge it elsewhere. Such a broker can offer small sizes, steady quotes and immediate fills. Where it keeps the risk, a client’s loss is the broker’s gain and the reverse: a conflict of interest that rules and disclosure are meant to manage, and do not remove.",
          "In the agency model the broker passes the order on and earns a commission or a mark-up on the spread, so its income depends on how much is traded and not on whether the client wins or loses. Several labels are used. Straight-through processing, STP, means the order is sent on to one or more liquidity providers without a dealer intervening. An electronic communication network, ECN, is a system in which the quotes and orders of many participants meet. Non-dealing desk is the general term. A client of such a broker typically sees spreads that vary, and may meet slippage and partial fills, because the prices are those of the providers at that moment.",
          "The labels are used loosely. Many firms combine the models, passing some orders on and keeping others. And a broker working as an agent in the economic sense is often still, in law, the client’s counterparty to the CFD, with a matching trade of its own elsewhere. The dependable source is not the label but the firm’s order execution policy and its regulatory disclosures, which say how orders are handled and where conflicts lie.",
        ],
      },
      {
        id: "last-look",
        title: "Last look",
        paragraphs: [
          "In over-the-counter foreign exchange, a liquidity provider that receives a request to deal at a price it has quoted may keep a brief moment in which to accept or refuse it. This is last look.",
          "Its stated purpose is to protect the provider against requests that arrive after the price has moved. It is criticised because a provider could refuse the trades that have turned against it and accept the others. The FX Global Code, the set of principles of good practice agreed by central banks and market participants, says how last look should be used and disclosed.",
          "For the person trading, last look shows itself as an order rejected, requoted or filled at a different price. Quotes that carry no last look are called firm.",
        ],
      },
      {
        id: "spreads",
        title: "Why spreads widen",
        paragraphs: ["A spread widens when fewer firms are quoting or when quoting has become riskier. The usual occasions are well known."],
        points: [
          "Scheduled releases and central bank decisions. In the moments around them, providers quote wider or withdraw, because the next price is unusually uncertain.",
          "The daily rollover, around the close of business in New York, when the value date changes and few are dealing.",
          "The open after a weekend, public holidays and the quiet hours between sessions.",
          "Stress: when prices are moving quickly, holding a position for even a moment costs more.",
          "Less-traded instruments, which have fewer providers at any hour, and instruments quoted while their underlying market is closed.",
          "A wider spread can itself set off a stop, because buy orders and sell orders are triggered by different sides of the quote.",
        ],
      },
    ],
    example: {
      title: "One market order meets the book",
      setup: "The sell side of an order book holds 10 units offered at 100.2, 10 units at 100.3 and 30 units at 100.5. The screen shows the best ask: 100.2.",
      steps: [
        "A market order arrives to buy 25 units.",
        "It takes the 10 units at 100.2, then the 10 units at 100.3, then 5 of the units at 100.5.",
        "The average price paid is 100.3, which is 0.1 above the price on the screen.",
        "The best ask is now 100.5. The order has moved the market, and the next buyer starts from there.",
      ],
      reading: "The quoted price is good for the quantity quoted and no more. In a deep market the same order would have been filled at the top of the book; in a thin one, further from it. The same arithmetic lies behind slippage on any large or badly timed order.",
    },
    limits: [
      "Which model any particular broker uses, who its liquidity providers are, or how it treats orders. That is to be read in its own execution policy and disclosures, not inferred from a label.",
      "That one model gives better results than another. Costs, fills and conflicts differ from firm to firm within each model.",
      "The spread on any instrument at any moment, or how wide it will be at the next release.",
      "The rules of a particular exchange, or the regulations on client orders in your country.",
    ],
    here: "GIO4X has not yet published its order execution policy, which the Transparency page lists as not yet published, and it has not named its liquidity providers. This page describes the models in general and says nothing about which of them GIO4X uses. One GIO4X account is named ECN: what is published about it is on the Account Types page, and this page adds nothing to that. Anything not yet published can be asked for in writing.",
    terms: ["liquidity-provider", "market-maker", "ecn", "non-dealing-desk", "interbank-market", "bid-price", "ask-rate", "spread", "variable-spread", "liquidity", "requote", "slippage", "fill", "broker", "volume"],
    tools: ["spread-visualizer", "cost-lab"],
    lessons: [],
    links: [
      { kind: "Labs", label: "Order book in 3D", href: "/labs/order-book-3d", note: "Bids, asks, spread and depth, to handle." },
      { kind: "Trust", label: "Transparency", href: "/trust/transparency", note: "What GIO4X has published, and what it has not yet." },
      { kind: "Primer", label: "Order types, in depth", href: "/primers/order-types-in-depth", note: "What each instruction does when it meets the market." },
      { kind: "Playbook", label: "The spread suddenly widens", href: "/playbook/spread-suddenly-widens", note: "The situation, and what to check." },
      { kind: "Comparison", label: "Ways to pay for trading", href: "/side-by-side/ways-to-pay-for-trading", note: "Spread, commission and financing, side by side." },
      { kind: "Intelligence", label: "ECN and standard accounts", href: "/intelligence/ecn-vs-standard-forex-accounts", note: "Two ways of paying for a trade." },
      { kind: "Trading", label: "Account Types", href: "/trading/accounts", note: "The three GIO4X accounts, as published." },
    ],
    faq: [
      { q: "Is the broker always on the other side of my trade?", a: "In an over-the-counter product such as a CFD, the broker is usually the legal counterparty. What differs is what it does next: keep the risk, or pass it on through a matching trade with a liquidity provider. A firm’s order execution policy says which." },
      { q: "Is an ECN broker better than a market maker?", a: "Neither label settles it. The models pay the broker in different ways and give the client different kinds of pricing. What a client actually receives depends on the firm’s costs, its conduct and how it is supervised, which the label does not tell you." },
      { q: "Why is the spread wider late in the evening, New York time?", a: "Around the New York close the trading day rolls over to the next value date. Banks are adjusting their books and few are quoting, so for a short while there is less competition to offer a tight price." },
    ],
  },
  {
    slug: "algorithmic-trading",
    name: "Algorithmic trading",
    title: "Algorithmic trading primer: Expert Advisors, backtests and overfitting",
    description:
      "An algorithmic trading primer: what an algorithm and an Expert Advisor are, how a backtest works and where it misleads, what overfitting is and how it shows itself, and latency and a VPS in plain words. With a worked example.",
    card: "A program follows the rules exactly. Whether the rules are any good is a separate question.",
    also: ["what is an Expert Advisor", "backtesting pitfalls", "overfitting in trading", "do I need a VPS for trading"],
    is: "Algorithmic trading means handing a written set of rules to a program that places the orders. The program does exactly what the rules say, at any hour, without tiring or hesitating. It does not know whether the rules are any good.",
    sections: [
      {
        id: "what",
        title: "What an algorithm is, and is not",
        paragraphs: [
          "A trading rule has a condition and an action: when this is true, do that. A complete set also says how much to trade and when to get out. Written precisely enough for a computer to follow, it is an algorithm.",
          "Automation removes hesitation, inconsistency and fatigue. It does not remove risk, and it adds some of its own: a program repeats a mistake as faithfully as it repeats anything else.",
          "The term covers a wide range. Large institutions use algorithms mainly to carry out big orders in small pieces. What an individual meets is usually a rule-based strategy running on a retail platform.",
        ],
      },
      {
        id: "ea",
        title: "What an Expert Advisor is",
        paragraphs: [
          "Expert Advisor, or EA, is MetaTrader’s name for a program that is attached to a chart and allowed to trade. It is written in the platform’s own language, MQL5 in the case of MetaTrader 5. It can read prices and indicators, and send, change and close orders.",
          "An EA runs inside the trading terminal. It works only while that terminal is running, connected to the server and permitted to trade automatically. Its code is called each time a new price arrives.",
          "Two neighbours are often confused with it. An indicator calculates and draws but does not trade. A script runs once and stops.",
          "An EA bought from a stranger comes with the seller’s own test results, and they are advertising. Nobody can tell from a results table how the rules were arrived at, and that, as the next two sections explain, is the thing that matters.",
        ],
      },
      {
        id: "backtest",
        title: "Backtesting and its pitfalls",
        paragraphs: ["A backtest runs the rules over past prices to see what they would have done. It is useful for finding errors in the rules, for seeing how they behave, and for meeting their worst stretches before those cost anything. It misleads in well-known ways."],
        points: [
          "The data. History may be incomplete, or built from bars with the movement inside each bar guessed. A rule that depends on what happened within a bar is then being tested on invention.",
          "Costs left out. Spread, commission, overnight financing and slippage are all real. A rule that makes many small trades can pass from profit to loss on the spread alone.",
          "Looking ahead. The test uses something that was not known at the time, such as a bar’s closing price to decide a trade made at its open.",
          "Fills that could not have happened: an exact price in the middle of a gap, or any size at the quoted price.",
          "Survivors only. A test run on instruments that exist today leaves out those that failed and were delisted.",
          "Too few trades. Thirty trades are an anecdote, however good they look.",
          "One kind of market. Rules tuned to a long quiet trend have never met anything else.",
        ],
      },
      {
        id: "overfitting",
        title: "Overfitting",
        paragraphs: [
          "Optimisation tries many values for a rule’s settings and keeps those that did best. The danger is built in. Past prices are made of some pattern and a great deal of noise, and with enough attempts some combination will fit the noise by chance. It will look excellent on the past and mean nothing for the future. That is overfitting.",
          "It shows itself in a few ways: a result that collapses when a setting is changed slightly; many settings and few trades; a line of results too smooth to believe.",
          "The defences are habits and not proofs. Keep part of the history back, unseen, and test the chosen settings on it once: an out-of-sample test. Repeat that over successive stretches, choosing on one and testing on the next: walk-forward testing. Prefer few settings, and a broad region where results are acceptable to a single sharp peak. Then run the rules on a demonstration account, on prices that did not exist when they were written.",
          "A rule that survives all of this has not been shown to work in future. It has only failed to be shown not to.",
        ],
      },
      {
        id: "latency",
        title: "Latency and a VPS, in plain words",
        paragraphs: [
          "Latency is the time between the program deciding to trade and the order being executed. It is made up of the computer, the path across the network and the handling at the far end.",
          "How much it matters depends on how long the opportunity lasts. To a rule that acts on four-hour bars, a tenth of a second is nothing. To a rule that tries to take a few points many times a day, it can be the whole result, and in that race an individual competes with firms whose machines sit beside the exchange’s own.",
          "A virtual private server, or VPS, is a rented computer in a data centre that is always on and has a steady connection. The terminal runs there, so the EA keeps working when the computer at home is switched off or the line fails. A VPS deals with uptime and shortens the network path. It does nothing for the quality of the rules, it costs a monthly rent, and it needs looking after, since updates and restarts happen there too.",
        ],
      },
      {
        id: "operation",
        title: "What goes wrong in operation",
        paragraphs: [
          "Real running has faults that a backtest lacks. Connections drop. Terminals restart, and a program must then work out what positions it has. An order is rejected or requoted, and the code must have an answer. A broker changes a spread, a minimum stop distance or a symbol’s name.",
          "A program left unattended is still the responsibility of whoever started it. Methods that enlarge a position as it loses, such as martingale and grid systems, are easy to automate and can show a long smooth record before a single run of losses takes the account. An automated strategy needs watching, a limit on what it may lose, and a way to switch it off.",
        ],
      },
    ],
    example: {
      title: "The best of four hundred",
      setup: "A rule has two settings. A tester tries 400 combinations of them over five years of prices, starting each run with an account of 100.",
      steps: [
        "The best combination turns 100 into 180. It is the one that would be shown in an advertisement.",
        "The combinations either side of it, one step away in each setting, end between 96 and 104.",
        "A sixth year of prices was kept back and never used in the choosing. On it, the best combination turns 100 into 93.",
      ],
      reading: "A real effect would not vanish when a setting is nudged, and would not reverse on data it had not seen. The 180 was the luckiest of 400 attempts: a coincidence found by searching, not a rule. Had the sixth year been used in the search as well, there would have been nothing left to reveal it.",
    },
    limits: [
      "Whether any rule, strategy or Expert Advisor makes money. No page can, and a backtest cannot either.",
      "How to program. The language and the platform’s tester are documented by MetaQuotes, the maker of MetaTrader.",
      "Any broker’s execution speed, server location or conditions for automated trading. Those are the broker’s to publish.",
      "Whether a VPS is worth its rent for you. That depends on the rule and on how reliable your own computer and connection are.",
    ],
    here: "MetaTrader 5 is one of the two platforms at GIO4X, and its page says what is published about it. GIO4X publishes no execution-speed figure and no server location, and this website lists no VPS service, so nothing on this page describes any of them. The Rule bench on this site tests a rule on invented prices: it shows how a backtest behaves and how one good result misleads, and it is not a test of anything on a real market.",
    terms: ["expert-advisor", "vps", "metatrader", "indicator", "slippage", "spread", "drawdown", "martingale-strategy", "scalping", "moving-average", "tick", "requote"],
    tools: ["drawdown", "cost-lab"],
    lessons: ["expert-advisors-and-how-they-run", "backtesting-optimisation-and-overfitting", "testing-a-set-of-rules"],
    links: [
      { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Build a rule and test it on invented prices." },
      { kind: "Platforms", label: "MetaTrader 5", href: "/platforms/metatrader-5", note: "The platform Expert Advisors run on." },
      { kind: "Platforms", label: "MT5 order errors explained", href: "/platforms/metatrader-5/order-errors", note: "The codes a program has to handle." },
      { kind: "Strategy", label: "Strategy library", href: "/strategies", note: "Twelve approaches described, martingale and grid among them." },
      { kind: "Labs", label: "The Risk Room", href: "/labs/risk-room", note: "Ruin, streaks and sizing, to try." },
      { kind: "Scam school", label: "Signal sellers and guaranteed returns", href: "/scam-school/signal-seller-guaranteed-returns", note: "How a results table is used to sell." },
    ],
    faq: [
      { q: "Does an Expert Advisor trade better than a person?", a: "It trades more consistently, which is a different thing. It applies the same rules every time without fear or boredom. If the rules lose money, it loses money consistently." },
      { q: "If a backtest covers ten years, can I trust it?", a: "Length helps, but it does not answer the main question, which is how the rules and their settings were chosen. Ten years searched for the best of thousands of combinations says less than two years tested once on rules fixed in advance." },
      { q: "Do I need a VPS to run an Expert Advisor?", a: "Not to run one. An EA works on any computer whose terminal is open and connected. A VPS is for keeping it running without interruption when that cannot be relied on at home." },
    ],
  },
  // the mind, what moves a currency, Islamic finance and records for tax: written in ./primers-trader.ts
  ...TRADER_PRIMERS,
];

export const getPrimer = (slug: string) => PRIMERS.find((p) => p.slug === slug);
