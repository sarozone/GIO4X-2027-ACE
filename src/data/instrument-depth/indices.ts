/**
 * INSTRUMENT DEPTH, INDICES: what is particular to each of the six equity
 * indices, beyond the short profile every instrument page shares.
 *
 * General education about the index itself: how it is built, who maintains
 * it, what its construction does to its behaviour, and how the index differs
 * from a fund, a future or a CFD on it. Nothing here is a level, a yield, a
 * weight, a forecast or advice, and nothing describes GIO4X's own contract.
 * What a fund, a future and an option are is explained once, on the investing
 * pages (src/data/investing.ts); this file refers to them and does not repeat
 * them.
 */
import type { DepthSet } from "./types";

export const INDICES_DEPTH: DepthSet = {
  us30: {
    character:
      "The Dow Jones Industrial Average is thirty large United States companies added up by share price, not by size. It is the oldest of the American benchmarks still in daily use and the narrowest. A company counts for more in it because one of its shares costs more, which is an accident of how many shares it has issued.",
    drivers: [
      {
        t: "The highest-priced shares",
        d: "Each constituent’s share price is added to the total, and the total is divided by a single number, the divisor. A move of one dollar in any constituent therefore moves the index by the same number of points, whatever the size of the company. The handful of constituents with the highest share prices account for much of each day’s change.",
      },
      {
        t: "Earnings of a short list of companies",
        d: "With thirty members, one company’s results can move the whole index on the day it reports. The link is strongest when the reporting company has a high share price and weakest when it has a low one. An index of five hundred companies dilutes the same news far more.",
      },
      {
        t: "United States interest rates and bond yields",
        d: "Higher yields raise the rate at which future profits are discounted and raise borrowing costs for companies, and both usually weigh on share prices. The link is not mechanical: shares have risen alongside yields when the yields rose because growth was strong.",
      },
      {
        t: "The economic cycle",
        d: "The members are established companies in banking, health care, industry, consumer goods and technology. The index therefore tends to follow expectations for the American economy as a whole more than the fortunes of any one sector. Transport and utility companies are left out by design, since they have averages of their own.",
      },
      {
        t: "The rest of the United States market",
        d: "The index usually moves in the same direction as the broader benchmarks on any given day, because the same news reaches all of them. It can part company with them for long periods when the largest companies by market value, which it holds at modest weights or not at all, lead or lag.",
      },
    ],
    mechanics: [
      {
        t: "Price-weighted",
        d: "The index is the sum of thirty share prices divided by the divisor. A company’s weight is its share price as a fraction of that sum. Market value plays no part in the calculation.",
      },
      {
        t: "The divisor",
        d: "When a constituent splits its shares, pays a large special dividend or is replaced, the sum of prices would jump although nothing of value has changed. The divisor is adjusted so that the index is the same immediately before and after the event. After many such adjustments the divisor is far below thirty, which is why the index is a much larger number than any share price in it.",
      },
      {
        t: "What a stock split does",
        d: "A split lowers a company’s share price and so lowers its weight in the index, although the company is worth exactly what it was. In an index weighted by market value a split changes nothing. This is the effect newcomers most often miss.",
      },
      {
        t: "Who maintains it",
        d: "The index is published by S&P Dow Jones Indices, and its members are chosen by a committee. There are no numerical rules for entry: the methodology describes a preference for companies with an excellent reputation, sustained growth and wide interest among investors, and for a balance of sectors.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a calculation, published while the New York markets are open. Nobody can buy it. Everything traded “on the Dow” is a product built to follow that calculation.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund holds the thirty shares in price-weighted proportions, which in practice means the same number of shares of each. The holder owns units of the fund, receives the dividends the shares pay, and pays the fund’s annual charge. How a fund keeps its price near the value of its holdings is explained on the investing pages.",
      },
      {
        t: "A futures contract on it",
        d: "Futures on the index trade on a Chicago exchange for most of the day and night, expire each quarter and are settled in cash. Their price differs from the index by the cost of financing less the dividends expected before expiry. A position kept beyond expiry has to be moved to the next contract.",
      },
      {
        t: "A CFD on it",
        d: "A CFD is an agreement with a provider to exchange the change in a price, usually derived from the futures or from the index. The holder owns no shares and no fund units, has no vote, and is exposed to the provider as counterparty. Dividends reach the holder, if at all, as an adjustment under the provider’s terms, and holding overnight usually carries a financing charge or an expiry.",
      },
    ],
    lifecycle: [
      {
        t: "Changes of constituent",
        d: "There is no timetable. The committee replaces a member when it judges it necessary, typically after a merger, a break-up or a long decline in a company’s standing, and announces the change some days ahead. Because of price-weighting, a change is sometimes prompted by a split in another constituent that has altered the balance of the index.",
      },
      {
        t: "Dividends",
        d: "The headline index is a price index: it does not include dividends. On the day a constituent’s shares begin trading without the right to a dividend, its price ordinarily opens lower by about the dividend, and the index falls by that amount divided by the divisor. A separate total-return version is published in which dividends are reinvested.",
      },
      {
        t: "Futures expiry and rollover",
        d: "The quarterly futures stop trading on the third Friday of March, June, September and December and settle against a special calculation of that morning’s opening prices. In the days before, most open positions move to the next contract, and the price difference between the two contracts is the cost of carry, not a gain or loss.",
      },
      {
        t: "Market-wide halts",
        d: "United States exchanges pause all share trading when the S&P 500 falls by set percentages within a day, at three thresholds. During a halt the index stops updating because its constituents are not trading. Futures have their own price limits outside regular hours.",
      },
    ],
    watch: [
      "The quarterly earnings reports of the highest-priced constituents",
      "The Federal Open Market Committee’s scheduled rate decisions",
      "The monthly United States employment report and consumer price index",
      "Quarterly futures expiry on the third Friday of March, June, September and December",
      "Announcements from S&P Dow Jones Indices of a change of constituent or a constituent’s stock split",
    ],
    sources: [
      "S&P Dow Jones Indices: Dow Jones Averages Methodology",
      "S&P Dow Jones Indices: Index Mathematics Methodology (the divisor and price-weighting)",
      "CME Group: contract specifications for E-mini Dow futures",
      "New York Stock Exchange and Nasdaq: rules on market-wide circuit breakers",
    ],
  },

  us500: {
    character:
      "The S&P 500 is the benchmark most professional investors in United States shares are measured against. It holds about five hundred large companies weighted by the market value of the shares available to the public, so the biggest companies move it most. A very large amount of money is invested in funds that copy it, which makes joining or leaving the index an event in itself.",
    drivers: [
      {
        t: "The largest companies",
        d: "Weight follows market value, so a small number of very large companies make up a large part of the index. When those companies rise or fall together, the index moves with them even if most of the other members go the other way. The degree of concentration changes over time and is published by the index provider.",
      },
      {
        t: "Corporate earnings",
        d: "Over long periods share prices have followed company profits. Four times a year most members report within a few weeks of one another, and the index reacts both to the results and to what managements say about the period ahead. A good result can be followed by a fall when more had been expected.",
      },
      {
        t: "Interest rates and bond yields",
        d: "A higher yield on government bonds lowers the present value of profits expected far in the future and offers investors an alternative to shares. The link has reversed at times: when yields rose on evidence of a strong economy, shares rose too.",
      },
      {
        t: "Money that follows the index",
        d: "Funds that track the index must buy what is added and sell what is removed, in proportion to its weight. This produces heavy trading at the close on the days changes take effect. It also means that money flowing into tracking funds is spread across the members by size, not by any judgement of each company.",
      },
      {
        t: "The United States dollar and the world economy",
        d: "Many members earn a large part of their revenue outside the United States. A stronger dollar reduces the dollar value of those foreign earnings, and a weaker one increases it. The effect is slow and is often outweighed by other news.",
      },
    ],
    mechanics: [
      {
        t: "Weighted by float-adjusted market value",
        d: "Each company’s weight is its share price multiplied by the number of shares available to the public, as a fraction of the total for all members. Shares held by founders, governments or other companies for control are left out. A stock split changes nothing, because the price falls as the share count rises.",
      },
      {
        t: "Not exactly five hundred lines",
        d: "The index holds about five hundred companies, but a company with more than one listed class of share may have each class included. The number of share lines is therefore a little above five hundred.",
      },
      {
        t: "A committee, with published criteria",
        d: "S&P Dow Jones Indices maintains the index through a committee. The methodology sets conditions for a candidate, including that it is a United States company, is above a size threshold, has enough of its shares in public hands, trades actively and has reported positive earnings. Meeting the conditions makes a company eligible; it does not oblige the committee to add it.",
      },
      {
        t: "Sectors",
        d: "Members are classified into eleven sectors under the Global Industry Classification Standard. The sector weights are an outcome of market values, not a target, so the index can lean heavily towards whichever sector the market currently values most.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a number calculated from its members’ prices during New York trading hours. It cannot be bought or sold, pays nothing and costs nothing.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund owns the shares in index proportions. The holder owns units of the fund, receives the dividends, less the fund’s charge, and has no financing cost and no expiry. Funds, their charges and tracking difference are explained on the investing pages.",
      },
      {
        t: "A futures contract on it",
        d: "The futures on this index are among the most heavily traded contracts in the world and trade for most of the day and night, which is why a price for “the S&P” exists when the New York exchanges are shut. Each contract expires quarterly and settles in cash. Its price already allows for financing and for the dividends expected before expiry.",
      },
      {
        t: "A CFD on it",
        d: "A CFD pays or charges the change in a price set by the provider, usually taken from the futures or the index. There is no ownership of shares, no vote and no fund unit, and the holder depends on the provider to pay. Dividend adjustments, financing and any expiry are the provider’s terms, not features of the index.",
      },
    ],
    lifecycle: [
      {
        t: "Additions and deletions",
        d: "Changes of membership are made when needed, most often because a member has been taken over or no longer fits, and are announced in advance. Tracking funds trade at the close before the change takes effect. A well-known example is a large electric-vehicle maker added in December 2020, whose size made the addition unusually large.",
      },
      {
        t: "Quarterly rebalancing",
        d: "Share counts and float factors are updated each quarter, taking effect after the close on the third Friday of March, June, September and December. The same Fridays are futures and options expiry days, so trading volume at the close is typically far above normal.",
      },
      {
        t: "Dividends",
        d: "The headline index is a price index. When a member’s shares begin trading without the right to a dividend, the index is lower by that company’s dividend multiplied by its weight. Because members pay on different days, the effect is spread through the year in small amounts; total-return versions that reinvest dividends are published separately.",
      },
      {
        t: "Futures expiry and rollover",
        d: "The quarterly futures settle against a special opening quotation, built from the opening price of each member on the morning of the third Friday. Most positions are moved to the next contract in the week before. The gap between the two contracts reflects financing and expected dividends, and closes as expiry approaches.",
      },
    ],
    watch: [
      "The quarterly earnings season, and within it the reports of the largest members",
      "The Federal Open Market Committee’s scheduled rate decisions and the minutes that follow",
      "The monthly United States consumer price index and employment report",
      "The quarterly rebalance and futures expiry on the third Friday of March, June, September and December",
      "Announcements from S&P Dow Jones Indices of additions and deletions",
      "Monthly options expiry on the third Friday",
    ],
    sources: [
      "S&P Dow Jones Indices: S&P U.S. Indices Methodology",
      "S&P Dow Jones Indices: Float Adjustment Methodology",
      "S&P Dow Jones Indices and MSCI: Global Industry Classification Standard (GICS) methodology",
      "CME Group: contract specifications for E-mini S&P 500 futures",
    ],
  },

  us100: {
    character:
      "The Nasdaq-100 is defined by where a company is listed and by what it is not: the hundred largest companies on the Nasdaq exchange, with financial companies left out. In practice that makes it an index of large technology, communications and consumer companies. It is more concentrated than the S&P 500 and has special rules to limit that concentration.",
    drivers: [
      {
        t: "A few very large technology companies",
        d: "The largest members carry a large share of the index. Their results, product announcements and spending plans can move the whole index in a way no single company moves a broader benchmark. The index and the S&P 500 share their largest members, so the two usually move together, with this one moving further.",
      },
      {
        t: "Long-term interest rates",
        d: "Many members are valued on profits expected well into the future. A rise in long-term yields reduces the present value of distant profits more than of near ones, so the index has often been more sensitive to yields than indices rich in banks and energy companies. The link has broken when profit growth was strong enough to outweigh it.",
      },
      {
        t: "The semiconductor and computing cycle",
        d: "Chip designers, equipment makers and the companies that buy their products are all in the index. Orders, inventories and capital spending in that chain move in cycles, and news from one company is read across to the others.",
      },
      {
        t: "What is absent",
        d: "There are no banks or insurers, and little energy or basic industry. News that helps those sectors, such as higher oil prices or wider lending margins, does little for this index and can coincide with it lagging.",
      },
      {
        t: "Regulation and litigation affecting large technology companies",
        d: "Several large members have been the subject of public competition and privacy proceedings in the United States and Europe. Developments in such proceedings can move the shares concerned, and through their weight the index.",
      },
    ],
    mechanics: [
      {
        t: "Modified market-value weighting",
        d: "Members are weighted by market value, then adjusted if the largest become too dominant. The methodology sets limits on the weight of a single company and on the combined weight of the largest, and redistributes the excess to smaller members. The index is therefore close to, but not exactly, a pure market-value index.",
      },
      {
        t: "Eligibility",
        d: "A company must be listed on Nasdaq and must not be classified as financial; it need not be American. The index is maintained by Nasdaq under published rules, with less committee discretion than the S&P 500 and no test of profitability.",
      },
      {
        t: "More than a hundred securities",
        d: "A company with two listed share classes can have both in the index. The index therefore holds a hundred companies and slightly more than a hundred securities.",
      },
      {
        t: "Not the Nasdaq Composite",
        d: "The Nasdaq Composite covers nearly every share listed on the exchange, several thousand of them. News reports of “the Nasdaq” usually mean the Composite. Futures, funds and CFDs are almost always based on the Nasdaq-100.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a calculation published by Nasdaq during exchange hours. It holds nothing and cannot be held.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund owns the member shares at index weights and passes on their dividends, which for this index are small because many members pay little or nothing. The holder pays the fund’s annual charge and has no expiry to manage.",
      },
      {
        t: "A futures contract on it",
        d: "Quarterly, cash-settled futures on the index trade in Chicago almost round the clock. Because expected dividends are small, the futures price sits above the index by close to the full cost of financing. Outside New York hours the futures are the only continuous price for the index.",
      },
      {
        t: "A CFD on it",
        d: "A CFD tracks a price the provider derives from the futures or the index and settles the difference in cash. No share is owned, no vote is held, and the result depends on the provider’s terms for financing, adjustments and expiry as well as on the index.",
      },
    ],
    lifecycle: [
      {
        t: "Annual reconstitution",
        d: "Membership is reviewed once a year. The changes are announced in December and take effect after the close on the third Friday of that month. Companies that have grown into the top hundred eligible listings replace those that have fallen out.",
      },
      {
        t: "Quarterly and special rebalances",
        d: "Weights are checked against the concentration limits each quarter. The rules also allow a special rebalance outside the timetable, and one was carried out in July 2023 to reduce the combined weight of the largest members. Such a rebalance changes weights, not membership.",
      },
      {
        t: "Replacements between reviews",
        d: "A member that is taken over, moves its listing to another exchange or otherwise becomes ineligible is replaced when that happens. A company that transfers its listing to or from Nasdaq can enter or leave the index for that reason alone.",
      },
      {
        t: "Dividends and futures expiry",
        d: "The headline index is a price index and falls slightly when a member’s shares go ex-dividend. The futures expire on the third Friday of March, June, September and December against a special opening quotation, and positions kept longer are rolled to the next contract beforehand.",
      },
    ],
    watch: [
      "The quarterly earnings reports of the largest technology members",
      "The annual reconstitution announcement in December",
      "Quarterly rebalances and futures expiry on the third Friday of March, June, September and December",
      "The Federal Open Market Committee’s scheduled rate decisions",
      "The monthly United States consumer price index",
    ],
    sources: [
      "Nasdaq: Nasdaq-100 Index Methodology",
      "Nasdaq: announcements of the annual reconstitution and of special rebalances",
      "CME Group: contract specifications for E-mini Nasdaq-100 futures",
      "Nasdaq: Nasdaq Composite Index Methodology (for the difference between the two)",
    ],
  },

  uk100: {
    character:
      "The FTSE 100 holds the hundred largest companies listed in London, but it is not a measure of the British economy. Most of its members’ revenue is earned abroad, in dollars and other currencies, and its largest sectors are oil, mining, banking, pharmaceuticals and consumer goods. It has little technology and a long record of paying out a large part of its profits as dividends.",
    drivers: [
      {
        t: "Sterling",
        d: "Because members earn much of their revenue in foreign currencies, a fall in the pound raises the sterling value of those earnings and has often coincided with a rise in the index; a rise in the pound has often done the reverse. The clearest example followed the referendum of June 2016, when the pound fell sharply and the index recovered within days. The link fails when the pound and shares are both sold on a loss of confidence in British assets.",
      },
      {
        t: "Oil and metal prices",
        d: "Large oil producers and mining companies are among the heaviest members. Their profits rise and fall with the prices of crude oil, copper, iron ore and other commodities, so the index can gain on a day when higher commodity prices weigh on other markets.",
      },
      {
        t: "Interest rates",
        d: "Banks and insurers form a large part of the index, and their lending margins generally widen when interest rates are higher. Higher rates therefore affect this index differently from one dominated by technology. Decisions of the Bank of England matter most to the banks and to the domestic members.",
      },
      {
        t: "Global, more than domestic, growth",
        d: "The more domestic British companies are mostly found in the FTSE 250, the index of the next 250 by size. The FTSE 100 responds more to the outlook for world trade, China’s demand for materials and conditions in the United States than to British economic releases.",
      },
      {
        t: "Dividends",
        d: "Many members pay regular and comparatively large dividends. That attracts investors who want income, and it also means the price index understates what a holder of the shares has received over time.",
      },
    ],
    mechanics: [
      {
        t: "Weighted by free-float market value",
        d: "Each member’s weight follows the market value of its shares in public hands. The index is maintained by FTSE Russell, part of the London Stock Exchange Group, under published ground rules, with far less discretion than a committee-selected index.",
      },
      {
        t: "The ranking rule",
        d: "Membership is decided by rank in market value. At each review a company outside the index is brought in if it has risen to 90th place or above, and a member is removed if it has fallen to 111th or below. The band between the two prevents companies near the boundary from moving in and out at every review.",
      },
      {
        t: "A price index quoted in sterling",
        d: "The headline index excludes dividends and is calculated from prices on the London Stock Exchange in pounds. Several members report their accounts and declare their dividends in dollars, which is one route by which the exchange rate reaches the index.",
      },
      {
        t: "The closing auction",
        d: "London’s day ends with an auction, and the official closing level comes from it. A large part of the day’s share volume trades in that auction, particularly on review and expiry days.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a calculation published during London trading hours. It cannot be owned; it is the yardstick that products are built to follow.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund owns the hundred shares and receives their dividends, which it either pays out or reinvests according to its type. For an index that pays as much in dividends as this one, the difference between the fund’s return and the change in the price index is considerable over time.",
      },
      {
        t: "A futures contract on it",
        d: "Quarterly futures on the index trade on a London derivatives exchange and settle in cash. Their price is usually below what financing alone would suggest, because the dividends expected before expiry are subtracted. They trade for longer hours than the shares, so they lead the index at the open.",
      },
      {
        t: "A CFD on it",
        d: "A CFD exchanges the change in a provider’s price for the index. The holder owns no shares and receives no dividend: where the product is based on the cash index, providers generally make a dividend adjustment, credited to long positions and charged to short ones. Financing, and the provider as counterparty, are part of the product.",
      },
    ],
    lifecycle: [
      {
        t: "Quarterly reviews",
        d: "The index is reviewed in March, June, September and December using market values on a set date, and changes take effect after the close on the third Friday of the month. Promotions and relegations are known in advance, and tracking funds trade in the closing auction that day.",
      },
      {
        t: "Ex-dividend days",
        d: "British shares customarily begin trading without the dividend on a Thursday. When several large members do so on the same Thursday, the price index opens lower by a visible number of points with no news behind it. A chart of the index shows a fall; a holder of the shares has received the cash.",
      },
      {
        t: "Futures expiry",
        d: "The futures expire on the third Friday of March, June, September and December and settle against a price taken from a special intraday auction in the member shares that morning. Positions are rolled to the next quarter in the days before.",
      },
      {
        t: "Takeovers and changes of listing",
        d: "A member that is acquired, or that moves its main listing to another country, leaves the index and is replaced by the highest-ranking eligible company outside it. Over time such departures have altered the sector mix of the index.",
      },
    ],
    watch: [
      "The Bank of England Monetary Policy Committee’s scheduled decisions",
      "The quarterly FTSE Russell index review in March, June, September and December",
      "Ex-dividend Thursdays for the largest members",
      "Results from the large oil, mining and banking members",
      "The monthly United Kingdom inflation release from the Office for National Statistics",
      "Quarterly futures expiry on the third Friday",
    ],
    sources: [
      "FTSE Russell: Ground Rules for the FTSE UK Index Series",
      "FTSE Russell: quarterly review announcements for the FTSE UK Index Series",
      "ICE Futures Europe: contract specification for FTSE 100 Index futures",
      "London Stock Exchange: dividend procedure timetable",
    ],
  },

  de40: {
    character:
      "The DAX is forty large German companies, and the number usually quoted is a total-return index: it assumes every dividend is reinvested. That sets it apart from the other indices here, whose headline figures leave dividends out. Its members are exporters of cars, machinery, chemicals and software, with large insurers alongside, so it follows world trade as much as Germany.",
    drivers: [
      {
        t: "World trade and industrial demand",
        d: "Many members sell most of what they make outside Germany, to the rest of Europe, the United States and China. Surveys of manufacturing, export orders and news on tariffs reach the index through expected sales. Domestic German consumption matters less than the size of the economy would suggest.",
      },
      {
        t: "The euro",
        d: "A weaker euro makes German exports cheaper abroad and raises the euro value of foreign earnings, which has often supported the index; a stronger euro has often done the opposite. The link is loose and can be reversed when the euro is falling because investors are leaving the region.",
      },
      {
        t: "European Central Bank policy",
        d: "The bank’s interest-rate decisions set borrowing costs for the companies and the discount rate applied to their profits. The index also holds large insurers and a few banks, whose earnings tend to benefit from higher rates, so the effect is not all one way.",
      },
      {
        t: "Energy costs",
        d: "German industry, chemicals above all, uses a great deal of gas and electricity. A sharp rise in European energy prices, as in 2022, raises costs for those members directly and weighed on the index at the time.",
      },
      {
        t: "A small number of heavy members",
        d: "With forty companies, the largest few carry a large part of the index, and a methodology cap limits how much any one may hold. Results from the biggest software, industrial and insurance members can decide the day.",
      },
    ],
    mechanics: [
      {
        t: "A performance index",
        d: "The headline DAX is what its provider calls a performance index: dividends are treated as reinvested in the index, so it does not fall when a member’s shares go ex-dividend. A price-index version is also published, and over time it rises by less. Comparing the headline DAX with the headline level of a price index flatters the DAX by the dividends.",
      },
      {
        t: "Forty members since 2021",
        d: "The index held thirty companies from its launch in 1988 until September 2021, when it was enlarged to forty. Older histories and commentary refer to the “DAX 30”. The enlargement brought in companies that had previously been in the mid-cap index.",
      },
      {
        t: "Weighting and maintenance",
        d: "Members are weighted by free-float market value, subject to the cap, and the index is calculated from prices on Xetra, the electronic market of the Frankfurt Stock Exchange. It is administered by STOXX, the index provider in the Deutsche Börse group, under a published rulebook.",
      },
      {
        t: "Entry conditions tightened",
        d: "After a member company became insolvent in 2020 while still in the index, the rules were changed. Candidates must now meet conditions on profitability and on publishing audited accounts and quarterly statements on time, and a member that fails the reporting conditions can be removed.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a calculation from Xetra prices during Frankfurt trading hours. Indications published outside those hours are derived from futures or from other trading venues and are not the index.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund owns the forty shares. Because the index assumes dividends are reinvested in full, a fund’s return is compared with it after the tax withheld on dividends and the fund’s charge, and usually falls a little short.",
      },
      {
        t: "A futures contract on it",
        d: "Quarterly futures on the DAX trade on a Frankfurt derivatives exchange and settle in cash. Because the index already includes dividends, nothing is subtracted for them, and the futures price stands above the index by roughly the cost of financing until expiry. On a price index the same calculation gives a smaller gap, or a negative one.",
      },
      {
        t: "A CFD on it",
        d: "A CFD exchanges the change in a provider’s price for the index, with no ownership of shares. Since the underlying index does not drop on ex-dividend days, a CFD on it ordinarily needs no dividend adjustment, unlike a CFD on a price index. Financing or expiry, and exposure to the provider, remain.",
      },
    ],
    lifecycle: [
      {
        t: "Index reviews",
        d: "Membership is reviewed on a quarterly cycle, with changes taking effect after the third Friday of March, June, September and December. Selection is by rank in free-float market value among companies that meet the entry conditions, and the rules provide for fast entry and fast exit when a company’s rank has moved far enough.",
      },
      {
        t: "The dividend season",
        d: "German companies typically pay one dividend a year, shortly after the annual general meeting, and most meetings fall in the spring. In those weeks the price-index version falls behind the headline index quickly, and the two then run in parallel for the rest of the year.",
      },
      {
        t: "Futures expiry",
        d: "The futures expire on the third Friday of March, June, September and December, settling against a price from an intraday auction on Xetra that day. Positions are rolled beforehand, and the difference between the expiring and the next contract is almost entirely financing.",
      },
      {
        t: "Removal outside a review",
        d: "A member that becomes insolvent, is taken over or breaches the reporting conditions can be removed without waiting for the next review. The replacement is the highest-ranking eligible company outside the index.",
      },
    ],
    watch: [
      "The European Central Bank Governing Council’s scheduled monetary policy decisions",
      "The monthly ifo Business Climate Index and the ZEW Indicator of Economic Sentiment",
      "Manufacturing purchasing managers’ surveys for Germany and the euro area",
      "The spring season of annual general meetings and dividend payments",
      "Index reviews and futures expiry on the third Friday of March, June, September and December",
      "Results from the largest members",
    ],
    sources: [
      "STOXX: Guide to the DAX Equity Indices",
      "STOXX: DAX index review announcements",
      "Eurex: contract specifications for DAX futures",
      "Deutsche Börse: Xetra trading calendar and auction schedule",
    ],
  },

  jp225: {
    character:
      "The Nikkei 225 is Japan’s best-known index and, like the Dow, it is weighted by share price. It is calculated by a newspaper publisher, not by the exchange, and it holds 225 companies chosen to balance sectors. Its futures trade in Osaka, Singapore and Chicago, so a price for it exists through most of the world’s day.",
    drivers: [
      {
        t: "The yen",
        d: "Many members are exporters whose foreign earnings are worth more in yen when the yen is weak. A falling yen has therefore often accompanied a rising index, and a rising yen a falling one. The link has failed when the yen rose because investors worldwide were selling risky assets, since Japanese shares were sold at the same time for that reason.",
      },
      {
        t: "The highest-priced members",
        d: "Price-weighting gives a few companies with high adjusted share prices a large part of the index. Their moves can carry the index in a direction most Japanese shares did not take that day. The market-value-weighted TOPIX, published by the exchange group, is the usual cross-check.",
      },
      {
        t: "Bank of Japan policy",
        d: "The central bank’s decisions on interest rates and on its holdings of government bonds affect the yen, the banks and the discount rate together. For many years the bank also bought exchange-traded funds holding Japanese shares, which made it a large indirect shareholder.",
      },
      {
        t: "Overnight moves in the United States",
        d: "Tokyo opens after New York has closed, and the index’s first move of the day usually reflects what American shares and the Nikkei futures did overnight. Semiconductor-related members in particular follow their American counterparts.",
      },
      {
        t: "Corporate governance and shareholder returns",
        d: "The Tokyo exchange has pressed listed companies to use capital more efficiently, and many have responded by raising dividends, buying back shares and unwinding holdings in one another. Announcements of this kind move the companies concerned and are followed closely by foreign investors.",
      },
    ],
    mechanics: [
      {
        t: "Price-weighted, with adjustment factors",
        d: "The index is the sum of the members’ adjusted share prices divided by a divisor. Each price is first multiplied by a price adjustment factor set by the index provider, which brings share prices of very different sizes onto a comparable scale. Market value is not used.",
      },
      {
        t: "Who calculates it",
        d: "The index is calculated and owned by Nikkei Inc., the publisher of Japan’s main financial newspaper. Members are drawn from the Prime Market of the Tokyo Stock Exchange and are chosen for trading liquidity and for balance across six sector groups.",
      },
      {
        t: "A long history, and a long wait",
        d: "The index has been calculated since 1950. It reached a peak at the end of 1989 and did not exceed that peak until 2024, more than three decades later. The episode is the standard reminder that a national share index can stay below an old high for a working lifetime.",
      },
      {
        t: "A lunch break",
        d: "The Tokyo Stock Exchange closes for a midday break, so the cash index pauses in the middle of its day while the futures continue. The index is a price index and is quoted in yen.",
      },
    ],
    versus: [
      {
        t: "The index itself",
        d: "The index is a calculation published during Tokyo trading hours. Prices seen for “the Nikkei” overnight are futures prices.",
      },
      {
        t: "A fund that tracks it",
        d: "A tracking fund owns the 225 shares in price-weighted proportions and receives their dividends. For an investor outside Japan the return also depends on the yen, unless the fund hedges the currency, and the index’s gain in yen can be partly or wholly offset by a fall in the yen.",
      },
      {
        t: "A futures contract on it",
        d: "Futures on the index are listed in Osaka, Singapore and Chicago, in yen and, in Chicago, also in dollars. A dollar-denominated contract pays the change in index points in dollars, so it carries no direct yen exposure. The contracts are quarterly and cash-settled.",
      },
      {
        t: "A CFD on it",
        d: "A CFD exchanges the change in a provider’s price, usually derived from the futures, and involves no ownership of shares. The currency in which each index point is paid is set by the provider’s contract and decides whether the holder is also exposed to the yen. Financing, adjustments and expiry are the provider’s terms.",
      },
    ],
    lifecycle: [
      {
        t: "Periodic reviews",
        d: "Membership is reviewed periodically, with a limited number of companies replaced each time to keep liquidity high and the sectors balanced. A member that is delisted, merged or moved off the Prime Market is replaced outside the timetable. A cap on the weight of any single member was added to the rules in the 2020s.",
      },
      {
        t: "Stock splits",
        d: "When a member splits its shares, its price adjustment factor is normally changed so that its weight in the index stays the same. This differs from the Dow, where a split reduces the company’s weight. Several high-priced Japanese companies have split their shares after the exchange encouraged smaller minimum investment amounts.",
      },
      {
        t: "Ex-dividend dates",
        d: "Most Japanese companies end their financial year in March and pay dividends by reference to holdings at the end of March and the end of September. The price index therefore loses a noticeable number of points on the ex-dividend days near the end of those two months, with smaller effects at other times.",
      },
      {
        t: "Futures expiry",
        d: "The Osaka futures settle against a special quotation calculated from the opening prices of the members on the second Friday of the contract month, a different day from the third-Friday convention in the United States and Europe. The quarterly settlements in March, June, September and December are the largest.",
      },
    ],
    watch: [
      "The Bank of Japan’s scheduled Monetary Policy Meetings and its Outlook Report",
      "The Bank of Japan’s quarterly Tankan survey of business conditions",
      "Japan’s monthly national consumer price index",
      "The special quotation on the second Friday of each contract month",
      "Nikkei Inc.’s periodic review announcements",
      "Ex-dividend days at the end of March and of September",
    ],
    sources: [
      "Nikkei Inc.: Nikkei Stock Average Index Guidebook",
      "Nikkei Inc.: announcements of periodic reviews and constituent changes",
      "Japan Exchange Group (Osaka Exchange): contract specifications for Nikkei 225 futures",
      "Japan Exchange Group: TOPIX index methodology (for the comparison)",
      "CME Group: contract specifications for Nikkei 225 futures",
    ],
  },
};
