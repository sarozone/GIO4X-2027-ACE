/**
 * INVESTING — the instruments a long-term investor meets, one page each.
 *
 * A page says what the thing is, how it works, what it costs, what can go
 * wrong with it and where people usually go wrong. It does not say what to
 * buy, and it promises nothing. Every number on these pages is an invented
 * example in plain units: there is no real company, fund, yield or return
 * here. A historical fact is given only where it is well established, and
 * without a figure where the figure is not needed.
 *
 * `machine` is the words beside the page's one interactive explainer
 * (components/investing). `terms` are glossary slugs; a page links only to
 * those the glossary really has.
 */
export type Instrument = {
  slug: "stocks" | "bonds" | "etfs" | "mutual-funds" | "index-investing" | "options" | "futures";
  /** the short name, for cards and breadcrumbs */
  name: string;
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  /** one line for the index card */
  card: string;
  also: readonly string[];
  /** the opening: what it is, in two or three sentences */
  is: string;
  how: readonly string[];
  costs: readonly string[];
  risks: readonly string[];
  traps: readonly string[];
  machine: { eyebrow: string; title: string; lead: string };
  terms: readonly string[];
  faq: readonly { q: string; a: string }[];
};

export const INVESTING: readonly Instrument[] = [
  {
    slug: "stocks",
    name: "Stocks",
    title: "Stocks and shares: what they are and how they work",
    description: "Stocks explained for a beginner: what a share is, how a shareholder takes part in a company’s profit, what a dividend is, what owning shares costs, the risks and the common mistakes. With an interactive example.",
    card: "A company cut into equal parts. Own a part, and a part of what it earns is yours.",
    also: ["what is a share", "equities explained", "how dividends work", "stocks for beginners"],
    is: "A share is one equal part of a company. Whoever holds shares owns that fraction of the business: a fraction of what it earns, and a fraction of what would be left if it were sold and its debts paid. “Stocks”, “shares” and “equities” are three words for the same thing.",
    how: [
      "A company divides its ownership into a fixed number of shares. Someone who holds 50 of 1,000 shares owns one twentieth of the company. That fraction is what matters, not the number of shares: 50 shares of 1,000 is a larger stake than 500 of a million.",
      "When the company makes a profit, the profit belongs to the shareholders, but it does not arrive automatically. The directors decide how much to pay out and how much to keep in the business. The part paid out is the dividend, and it is the same amount for every share. The part kept may make the company more valuable, or may not.",
      "Shares of a listed company change hands on a stock exchange. The price is whatever buyers and sellers agree on at that moment, and it reflects what they expect the company to earn in future as much as what it earns now. A shareholder’s return comes from two places: dividends received, and the difference between the price paid and the price later sold at.",
      "Shareholders usually have a vote at the company’s meetings in proportion to their shares, and their loss is limited to what they paid: if the company fails, its creditors cannot pursue the shareholders for more.",
    ],
    costs: [
      "A dealing charge or commission each time shares are bought or sold.",
      "The spread: the gap between the price to buy and the price to sell at the same moment.",
      "A platform or custody charge for holding the shares, in many accounts.",
      "Taxes, which differ by country: some charge a tax on purchases, most tax dividends or gains in some way.",
      "A currency conversion charge when the shares are priced in another currency.",
    ],
    risks: [
      "The price can fall a long way and stay there. Nothing obliges it to return to what was paid.",
      "A single company can fail. Shareholders are paid last, after lenders and other creditors, and often receive nothing.",
      "A dividend is a decision, not a debt. It can be reduced or stopped at any time.",
      "A few shares in a few companies is a concentrated holding: one piece of bad news can remove a large part of it.",
      "Shares priced in another currency rise and fall with that currency as well.",
    ],
    traps: [
      "Calling a share “cheap” because its price is a small number. The price of one share says nothing without the number of shares in issue.",
      "Reading a high dividend as a safe one. A dividend that is large compared with the share price is often large because the price has fallen, and may be about to be cut.",
      "Treating a familiar company as a sound investment. Knowing a firm’s products is not knowing its accounts.",
      "Judging a holding by the price paid. The market does not know or care what anyone paid.",
      "Checking the price many times a day and acting on each move. Costs are certain; the benefit of frequent dealing is not.",
    ],
    machine: { eyebrow: "The mechanism", title: "A company, cut into a thousand parts.", lead: "An invented company with 1,000 shares. Choose how many you hold and what it earned this year, and see what fraction is yours and what a dividend would bring." },
    terms: ["dividend", "equity", "share", "stock", "index", "liquidity", "spread", "volatility", "market-capitalisation"],
    faq: [
      { q: "What is the difference between a stock and a share?", a: "In everyday use, none. “Shares” usually means the units of one company, and “stocks” is the broader word for shares in general. “Equities” means the same again." },
      { q: "Is a dividend guaranteed?", a: "No. The directors of a company decide each time whether to pay a dividend and how much. A company may pay none, and a company that has paid one for years may reduce or stop it." },
      { q: "Can a shareholder lose more than they paid for the shares?", a: "Not when the shares are bought outright with the holder’s own money: the most that can be lost is the amount paid. Buying with borrowed money, or through a leveraged product, is a different matter and can lose more." },
    ],
  },
  {
    slug: "bonds",
    name: "Bonds",
    title: "Bonds: how they work, and why prices fall when interest rates rise",
    description: "Bonds explained for a beginner: coupon, maturity and face value, why a bond’s price moves opposite to interest rates and why a longer bond moves more, what bonds cost, the risks and the common mistakes. With the present-value arithmetic shown.",
    card: "A loan that can be sold on. Its price moves the opposite way to interest rates.",
    also: ["how do bonds work", "bond prices and interest rates", "what is a coupon", "bond yield explained"],
    is: "A bond is a loan cut into pieces that can be bought and sold. The borrower, a government or a company, promises to pay a fixed amount of interest at set dates and to repay the loan on a stated day. Whoever holds the bond on those dates receives the payments.",
    how: [
      "Three numbers describe a plain bond. The face value is the amount repaid at the end. The coupon is the interest paid each year, stated as a percentage of the face value. The maturity is the date on which the face value is repaid.",
      "Once issued, a bond trades at whatever price buyers and sellers agree. Its payments are fixed, so its price is the only thing that can change, and it changes with the interest rate available elsewhere. If new bonds pay 6% and an old one pays 4%, nobody will pay full price for the old one: its price falls until its fixed payments give a buyer about the same return as a new bond. If rates fall instead, the old bond’s price rises.",
      "The arithmetic is called present value. A payment due in some years is worth less today than the same amount paid now, because money held now could earn interest in the meantime. Each payment is divided by (1 + rate) once for every year until it arrives, and the bond’s price is the sum. A higher rate makes every divisor larger and the price smaller.",
      "The further away the payments, the more times they are divided, so a long bond’s price moves more than a short bond’s for the same change in rates. The return a buyer gets from a bond bought at today’s price and held until it is repaid is called its yield to maturity.",
    ],
    costs: [
      "The spread between buying and selling prices, which for many bonds is wider than for shares and is often the whole of the dealing cost.",
      "Accrued interest: a buyer pays the seller the interest that has built up since the last coupon date.",
      "Fund charges, when bonds are held through a fund rather than directly.",
      "Tax on the interest received, which differs by country and by type of bond.",
    ],
    risks: [
      "Interest-rate risk: when market rates rise the price falls, and a long bond falls furthest.",
      "Credit risk: the borrower may pay late or not at all. A higher yield is usually the market’s price for a higher chance of this.",
      "Inflation risk: fixed payments buy less if prices in the shops rise faster than expected.",
      "Liquidity risk: some bonds trade rarely, and can be sold quickly only at a poor price.",
      "Currency risk, for a bond that pays in another currency.",
    ],
    traps: [
      "Believing a bond cannot lose money. Sold before maturity, it fetches the market price, which may be well below what was paid.",
      "Confusing the coupon with the yield. The coupon is fixed when the bond is issued; the yield depends on the price paid for it.",
      "Reaching for the highest yield without asking why it is high.",
      "Assuming a bond fund behaves like one bond. A fund has no maturity date on which the money comes back; it keeps buying new bonds, and its price moves with rates indefinitely.",
      "Forgetting inflation: a fixed payment for twenty years is a fixed number, not fixed buying power.",
    ],
    machine: { eyebrow: "The mechanism", title: "Rates up, price down.", lead: "An invented bond with a face value of 100, first sold when the market rate equalled its coupon. Move the market rate and watch every future payment shrink or grow in today’s money." },
    terms: ["bond", "yield", "real-yields", "interest-rate", "inflation", "monetary-policy", "coupon", "maturity", "safe-haven"],
    faq: [
      { q: "Why do bond prices fall when interest rates rise?", a: "A bond’s payments are fixed. When new bonds offer a higher rate, an older bond with lower payments is worth less to a buyer, so its price falls until its return matches what is available elsewhere. The reverse happens when rates fall." },
      { q: "What is the difference between a bond’s coupon and its yield?", a: "The coupon is the fixed interest the bond pays each year, as a percentage of its face value. The yield is the return to someone who buys at today’s price. If the price is below face value the yield is higher than the coupon; if it is above, the yield is lower." },
      { q: "If a bond is held to maturity, does the price in between matter?", a: "If the borrower pays everything on time, the holder receives the coupons and the face value whatever the price did in between. The price matters if the bond has to be sold early, and the holder has still given up the higher rate that became available elsewhere." },
    ],
  },
  {
    slug: "etfs",
    name: "ETFs",
    title: "ETFs: what an exchange-traded fund is and how it works",
    description: "ETFs explained for a beginner: how an exchange-traded fund is built from a basket of holdings, how units are created and redeemed so the price stays near the basket’s value, what an ETF costs, the risks and the common mistakes.",
    card: "A basket of holdings in one unit, bought and sold on an exchange like a share.",
    also: ["what is an ETF", "how do ETFs work", "ETF creation and redemption", "ETF vs mutual fund"],
    is: "An exchange-traded fund is a fund whose units are bought and sold on a stock exchange during the day, like a share. Each unit is a small slice of a basket of holdings: shares, bonds or other assets. Most ETFs are built to follow an index.",
    how: [
      "The fund owns a basket, and the units together own the fund. If the basket is worth 100 million and there are one million units, each unit stands for 100 of holdings. That figure is the net asset value per unit.",
      "On the exchange, a unit’s price is set by buyers and sellers, so it could drift away from the value of the basket behind it. What keeps it close is a mechanism called creation and redemption, which only large dealers approved by the fund, known as authorised participants, can use.",
      "If units trade above the basket’s value, a dealer can buy the basket’s holdings in the market, hand them to the fund and receive newly created units, then sell those units on the exchange. The extra supply pushes the unit price down towards the basket’s value. If units trade below it, the dealer does the opposite: buys units cheaply, hands them back to the fund for the holdings, and sells the holdings. Units are cancelled and the price is pushed up.",
      "The dealer does this for the small difference, not as a service, so the gap closes only as far as the dealer’s own costs allow. Ordinary investors never create or redeem: they buy and sell existing units on the exchange.",
    ],
    costs: [
      "The fund’s ongoing charge, taken from the fund’s assets each year and stated as a percentage.",
      "The spread between the buying and selling price of a unit on the exchange.",
      "A dealing charge or commission on each purchase and sale, and often a platform charge for holding.",
      "Tracking difference: the amount by which the fund’s return falls short of, or occasionally exceeds, its index after all costs inside the fund.",
      "A currency conversion charge when the units are priced in another currency.",
    ],
    risks: [
      "An ETF falls when its holdings fall. The wrapper removes none of the risk of what is inside it.",
      "The unit price can move away from the basket’s value when the holdings are hard to trade or markets are under strain, and the mechanism that closes the gap can slow or pause.",
      "Some ETFs do not hold the basket itself but use a contract with a bank to deliver the index’s return. That adds the risk that the bank fails to pay.",
      "Leveraged and inverse products aim at a multiple of one day’s move. Over longer periods their result can differ greatly from that multiple.",
      "A narrow fund, one sector or one theme, is a concentrated holding in a diversified-looking wrapper.",
    ],
    traps: [
      "Assuming every ETF is a broad, low-cost index fund. The label covers narrow, complex and leveraged products too.",
      "Looking only at the ongoing charge and ignoring the spread and dealing costs, which matter more the more often one trades.",
      "Trading in and out because it is possible. Being able to deal every second is a feature of the wrapper, not a reason to use it.",
      "Not reading what the fund actually holds, or which index it follows and how that index is built.",
      "Holding several funds that own the same large companies and counting them as spread out.",
    ],
    machine: { eyebrow: "The mechanism", title: "How the price is held near the basket.", lead: "An invented fund whose basket is worth 100 per unit. Push the unit price above or below that, then let a dealer’s block of units through and watch the gap close." },
    terms: ["etf", "index", "spread", "liquidity", "liquidity-provider", "arbitrage", "net-asset-value", "dividend"],
    faq: [
      { q: "What is the difference between an ETF and a mutual fund?", a: "Both pool money into a basket of holdings. A mutual fund is bought from and sold back to the fund itself, once a day, at a price worked out after the market closes. An ETF’s units are bought and sold between investors on an exchange throughout the day, at the market price of that moment." },
      { q: "Why does an ETF’s price stay close to the value of its holdings?", a: "Because large approved dealers can exchange the basket of holdings for new units, or units for the basket. Whenever the unit price moves far enough from the basket’s value, doing so earns them the difference, and their dealing pushes the price back. The gap can still widen in stressed markets." },
      { q: "Does an ETF pay dividends?", a: "The holdings may pay dividends or interest to the fund. A distributing fund passes these on to unit holders at set dates; an accumulating fund keeps them and buys more holdings, so the value of each unit rises instead." },
    ],
  },
  {
    slug: "mutual-funds",
    name: "Mutual funds",
    title: "Mutual funds: how pooled funds work and how they are priced",
    description: "Mutual funds explained for a beginner: how money is pooled, what net asset value is, why a fund is priced once a day and what that means for an order, what a fund costs, the risks and the common mistakes.",
    card: "Many people’s money in one pool, run by a manager and priced once a day.",
    also: ["what is a mutual fund", "net asset value explained", "NAV per unit", "unit trusts and OEICs"],
    is: "A mutual fund pools the money of many investors and invests it as one portfolio, under a manager and a written set of rules. Each investor holds units in the pool. The same idea goes by different names in different countries: mutual fund, unit trust, open-ended investment company.",
    how: [
      "Money paid in buys units; the manager invests it. Each unit is an equal share of everything the fund holds. The fund is “open-ended”: when money comes in, new units are made, and when an investor leaves, their units are cancelled and they are paid from the pool.",
      "A unit’s price is the net asset value: everything the fund owns, less anything it owes, divided by the number of units. It is worked out once each dealing day, after the markets the fund invests in have closed, using closing prices.",
      "An order placed during the day is not dealt at once. It waits, with everyone else’s, until that day’s price is struck, and all of them deal at that one price. An investor therefore does not know the exact price when placing the order. An order that arrives after the day’s cut-off time gets the next day’s price.",
      "Some funds try to match an index; others, called actively managed, pay a manager to choose holdings in the hope of beating one. The fund’s documents state what it may hold, what it charges and how often it deals.",
    ],
    costs: [
      "The ongoing charge, taken from the fund each year as a percentage of its assets. It is deducted inside the fund, so it never appears as a bill.",
      "An entry or exit charge, in some funds, taken from money going in or coming out.",
      "A performance fee, in some funds, taken when the fund beats a stated target.",
      "The fund’s own dealing costs when the manager buys and sells holdings, which reduce its return and are reported separately from the ongoing charge.",
      "A platform or adviser charge, where the fund is held through one.",
    ],
    risks: [
      "The fund’s price falls when its holdings fall. Pooling spreads the risk across many holdings; it does not remove it.",
      "A manager’s choices can do worse than the market the fund is measured against, for years.",
      "A fund that holds things that are slow to sell, such as property, may suspend dealing when many investors want to leave at once, and the money is then out of reach until it reopens.",
      "The price at which an order deals is not known when the order is placed.",
      "Currency risk, when the holdings are priced in other currencies.",
    ],
    traps: [
      "Choosing a fund on its recent results. A good past period says little about the next one.",
      "Treating a 1% or 2% yearly charge as small. Taken every year from the whole amount, it compounds like growth in reverse.",
      "Reading the fund’s name instead of its holdings and rules.",
      "Owning many funds that hold much the same things.",
      "Expecting to get out instantly at a known price. A fund deals once a day, and can stop dealing.",
    ],
    machine: { eyebrow: "The mechanism", title: "One day, one price.", lead: "An invented fund through one dealing day. Orders arrive at different hours and wait. At the close the holdings are valued, one price is struck, and every order deals at it." },
    terms: ["net-asset-value", "mutual-fund", "index", "dividend", "liquidity", "diversification"],
    faq: [
      { q: "What does net asset value mean?", a: "It is the value of everything a fund owns, less anything it owes. Divided by the number of units in issue, it gives the price of one unit. It is calculated once each dealing day." },
      { q: "Why can’t a mutual fund be bought at the price shown right now?", a: "The price shown is the last one struck, usually yesterday’s. A new order deals at the next price to be calculated, after the markets close, so that nobody can deal at a price that is already out of date. This is called forward pricing." },
      { q: "Is a mutual fund safer than buying shares directly?", a: "It is usually more spread out, so the failure of one company does less damage. It still rises and falls with the markets it holds, and its charges are taken whatever the result." },
    ],
  },
  {
    slug: "index-investing",
    name: "Index investing",
    title: "Index investing: how index funds work and what fees do over time",
    description: "Index investing explained for a beginner: what an index is, how a fund holds every company by its weight, why costs are low, and how a yearly fee compounds over decades. With a calculator that uses your own growth assumption.",
    card: "Hold the whole list, each company by its weight, and keep the yearly fee small.",
    also: ["what is an index fund", "passive investing", "index tracker funds", "how fund fees compound"],
    is: "An index is a list of securities chosen by a published rule, with a weight for each. Index investing means holding a fund that owns everything on the list in those proportions, so that it does what the list does, less costs. Nobody chooses which companies will do well.",
    how: [
      "Most share indices weight companies by their size on the market: a company worth five times another has five times the weight. An index fund simply holds each in that proportion. When prices move, the weights move with them, so the fund has little buying and selling to do.",
      "Because there is no research into which companies to prefer and little dealing, an index fund is cheap to run and its yearly charge is usually low. Its result is the index’s result, minus that charge and the small costs of following the index. It cannot beat its index, and it should not fall far behind it.",
      "The charge matters more than it looks. It is taken every year from the whole amount, so the money it removes also loses all the growth it would have had. Over decades a difference of one percentage point a year becomes a large share of the final sum. The arithmetic on this page shows it for any assumption the visitor chooses.",
      "The first index fund open to the public was launched in the United States in 1976. Index funds are sold both as mutual funds and as exchange-traded funds; the idea is the same in either wrapper.",
    ],
    costs: [
      "The fund’s ongoing charge, taken each year as a percentage of the amount held.",
      "Tracking difference: the small amount by which the fund’s result differs from the index after dealing costs and taxes inside the fund.",
      "A platform charge for holding the fund, and a dealing charge in some accounts.",
      "The spread, when the fund is an ETF bought on an exchange.",
    ],
    risks: [
      "An index fund falls as far as its index. In a broad market fall it has nowhere to hide and no manager to step aside.",
      "A size-weighted index puts the most money into the largest companies, so a handful can make up a large part of the fund.",
      "“Index” does not mean broad. An index of one sector or one small market is a narrow bet with an index’s name.",
      "Currency risk, when the index’s companies are priced in other currencies.",
      "Long periods of poor returns happen. Decades are made of years, and some of them are bad.",
    ],
    traps: [
      "Taking an assumed growth rate for a promise. Any figure typed into a calculator is a guess about the future.",
      "Believing an index fund is low risk because it is low cost. Cost and risk are separate things.",
      "Selling after a fall and buying back after a rise, which turns a market’s return into something worse.",
      "Not checking which index a fund follows. Two funds with similar names can hold very different lists.",
      "Ignoring a small difference in fees because it is small in any one year.",
    ],
    machine: { eyebrow: "The arithmetic", title: "The whole list, and the cost of holding it.", lead: "An invented index of eight companies, held by weight. Then a starting amount of 10,000 grown at a rate you assume, once with no fee and once with a yearly fee." },
    terms: ["index", "dividend", "compounding", "compound-interest", "diversification", "inflation", "volatility"],
    faq: [
      { q: "What is an index fund?", a: "A fund that holds the securities of a published index in the index’s own proportions, so that its return follows the index. It does not try to pick the better companies or to avoid the worse ones." },
      { q: "How much difference does a fund’s yearly fee make?", a: "More than its size suggests, because it is taken every year from the whole amount and compounds. Each year the fund keeps (1 − fee) of what it would otherwise have had, so after many years the shortfall is that factor multiplied by itself once per year. The calculator on this page works it out for any growth rate you assume." },
      { q: "Can an index fund lose money?", a: "Yes. It holds what the index holds, and when those prices fall the fund falls with them. Following an index removes the risk of a manager choosing badly; it does not remove the risk of the market itself." },
    ],
  },
  {
    slug: "options",
    name: "Options",
    title: "Options: calls, puts and the payoff diagram explained",
    description: "Options explained for a beginner: what a call and a put are, strike, premium and expiry, how to read a payoff diagram, the break-even, the maximum loss for a buyer and a seller, what options cost and the common mistakes. With an interactive payoff diagram.",
    card: "A right, bought for a premium, to buy or sell at a fixed price before a date.",
    also: ["call and put options", "option payoff diagram", "strike price and premium", "option break-even"],
    is: "An option is a contract that gives its buyer the right, but not the obligation, to buy or to sell something at a fixed price on or before a fixed date. The buyer pays the seller a premium for that right. A call is the right to buy; a put is the right to sell.",
    how: [
      "Four things define an option: what it is on (the underlying), the fixed price (the strike), the last day it can be used (the expiry) and whether it is a call or a put. The premium is the option’s own price, agreed in the market.",
      "At expiry the arithmetic is simple. A call is worth the underlying’s price minus the strike if that is positive, and nothing otherwise. A put is worth the strike minus the price if that is positive, and nothing otherwise. The buyer’s result is that amount less the premium paid; the seller’s result is the exact opposite.",
      "So a buyer can lose the premium and no more, and that happens whenever the option expires worth nothing. The seller keeps the premium in that case, but takes the other side of everything else: a call sold without owning the underlying has no limit to its loss, because a price has no ceiling, and a put sold can lose almost the whole strike.",
      "Before expiry an option’s price also contains time value: a payment for what might still happen. It shrinks as expiry approaches, even if the underlying does not move. A listed option usually covers a fixed quantity of the underlying, often 100 shares, so every figure per share is multiplied by that quantity.",
    ],
    costs: [
      "The premium, for a buyer: paid at the start and not returned.",
      "The spread between the buying and selling price of the option, which can be wide for options that trade little.",
      "A commission or contract fee on each trade, and sometimes a fee on exercise.",
      "Margin, for a seller: money that must be kept on deposit against the possible loss, and added to if the position moves against them.",
    ],
    risks: [
      "A buyer loses the whole premium if the option expires worth nothing, which is a common outcome.",
      "A seller’s loss can be many times the premium received and, for an uncovered call, has no upper limit.",
      "Time works against the buyer: the option loses value as expiry approaches.",
      "An option is a leveraged position. A small move in the underlying is a large percentage change in the option.",
      "An option’s price depends on expected volatility as well as on the underlying, so it can fall even when the underlying moves the “right” way.",
    ],
    traps: [
      "Being right about the direction and wrong about the date. An option that would have paid a week after expiry pays nothing.",
      "Forgetting the premium when working out the break-even. The underlying must pass the strike by the premium before a buyer is ahead.",
      "Selling options for the premium as if it were income. Small regular receipts can be followed by one very large loss.",
      "Forgetting the contract quantity, and so holding a position many times the intended size.",
      "Buying options far from the current price because they are cheap. They are cheap because they rarely pay.",
    ],
    machine: { eyebrow: "The diagram", title: "The payoff at expiry.", lead: "Choose a call or a put, bought or sold. Set the strike and the premium, then move the price at expiry along the line. Plain numbers, per one unit of the underlying, before any dealing costs." },
    terms: ["option", "options", "premium", "strike-price", "hedging", "hedge", "volatility", "leverage", "margin", "derivative"],
    faq: [
      { q: "What is the difference between a call and a put?", a: "A call gives its buyer the right to buy the underlying at the strike price; it gains value as the underlying rises. A put gives its buyer the right to sell at the strike price; it gains value as the underlying falls." },
      { q: "What is the most an option buyer can lose?", a: "The premium paid, plus dealing costs. If the option expires worth nothing, the whole premium is lost. The buyer is never obliged to use the option." },
      { q: "Why is selling options riskier than buying them?", a: "The seller receives the premium and in return takes on the obligation. The most the seller can gain is the premium; the possible loss is far larger, and for a call sold without owning the underlying it has no limit." },
    ],
  },
  {
    slug: "futures",
    name: "Futures",
    title: "Futures: expiry, rolling and why contract prices differ",
    description: "Futures explained for a beginner: what a futures contract is, margin and daily settlement, why contracts expire, what rolling from one contract to the next means, contango and backwardation, the cost or gain of a roll, the risks and the common mistakes.",
    card: "An agreed price for a set date. Each contract expires, and is rolled into the next.",
    also: ["how do futures work", "rolling a futures contract", "contango and backwardation", "futures expiry"],
    is: "A futures contract is an agreement to buy or sell a fixed quantity of something at a price agreed today, on a set date in the future. It is standardised and traded on an exchange. Unlike an option, it binds both sides: neither can walk away.",
    how: [
      "Nobody pays the full value at the start. Each side puts down a deposit called margin, a fraction of the contract’s value. Every day the exchange settles the day’s gain or loss in cash between the two sides, and a side whose deposit has run low must add to it at once.",
      "Every contract has an expiry date. On that date it is settled: by delivering the goods, for some contracts, or by a final cash payment for others. As expiry approaches, the contract’s price and the price for immediate delivery (the spot price) come together, since they are about to be the same thing.",
      "Someone who wants to keep a position beyond expiry must roll: close the contract that is about to expire and open the next one. The two contracts rarely have the same price. The later one includes the cost of carrying the thing until then (interest, storage, insurance), less anything it earns in the meantime, and reflects how scarce it is today. When later contracts are priced higher the market is said to be in contango; when lower, in backwardation.",
      "That gap is the cost or gain of rolling. If the spot price ends up unchanged, a later contract bought above it drifts down to meet it and the buyer loses the gap; one bought below it drifts up and the buyer gains the gap. For a seller it is the reverse. A position held for a long time through many rolls can therefore do noticeably better or worse than the spot price it was meant to follow.",
    ],
    costs: [
      "A commission and exchange fee on each contract, paid again at every roll.",
      "The spread between buying and selling prices, crossed twice at each roll.",
      "The roll itself, when later contracts are priced above the spot price and the position is a bought one.",
      "The interest given up, or paid, on the money held as margin.",
    ],
    risks: [
      "Leverage: the deposit is a fraction of the contract’s value, so a small price move is a large gain or loss against the deposit.",
      "A loss can exceed the money deposited, and more must be paid in at short notice or the position is closed.",
      "A contract held into expiry may require delivery of the goods, or acceptance of them.",
      "Roll cost can wear away a long-held position even when the spot price goes nowhere.",
      "Prices can move by the exchange’s daily limit, or gap, leaving no chance to close at the price intended.",
    ],
    traps: [
      "Expecting a rolled futures position to follow the spot price. Over many rolls the two can part by a wide margin.",
      "Holding a contract too close to expiry without being able to make or take delivery. In April 2020 a United States crude oil contract settled at a price below zero on the day before it expired, as holders who could not take delivery paid to be released.",
      "Looking at the deposit and not at the full value of the contract, and so taking a position far larger than intended.",
      "Reading a higher price for a later contract as a forecast that the price will rise. Much of the gap is the cost of carrying the goods.",
      "Forgetting the dates. A futures position has a calendar, and it does not wait.",
    ],
    machine: { eyebrow: "The mechanism", title: "A calendar of contracts, and the roll.", lead: "Six invented monthly contracts. The first is about to expire at 100. Set how much higher or lower the next one is priced and see what rolling a bought position costs or gains if the spot price does not move." },
    terms: ["futures", "future", "contango", "backwardation", "rollover", "margin", "leverage", "contract-size", "notional-value", "hedging", "expiry"],
    faq: [
      { q: "What does rolling a futures contract mean?", a: "Closing a contract that is about to expire and opening the same position in a later one, so that the position continues. The two contracts usually have different prices, and that difference is the cost or gain of the roll." },
      { q: "What are contango and backwardation?", a: "Contango is when contracts for later dates are priced higher than nearer ones; backwardation is when they are priced lower. The gap mostly reflects the cost of holding the thing until the later date, less anything it earns, and how scarce it is now." },
      { q: "Can a futures position lose more than the margin deposited?", a: "Yes. The margin is a deposit, not a limit. Gains and losses are settled on the full value of the contract every day, and if losses exceed the deposit the holder owes the difference." },
    ],
  },
];

const bySlug = new Map<string, Instrument>(INVESTING.map((i) => [i.slug, i]));
export const getInstrument = (slug: string) => bySlug.get(slug);
