/**
 * INSTRUMENT DEPTH, SHARES: what is particular to each of the six companies,
 * beyond the short profile every instrument page shares.
 *
 * General education about the company as an issuer: what the business does
 * and where its revenue comes from in broad terms, what it files and when,
 * its share classes, and the stock splits that have happened. There are no
 * figures for revenue, margins, valuation or share price here, no opinion on
 * any company, no forecast and no advice, and nothing about GIO4X's own
 * contract. What a share and a dividend are is explained once on the
 * investing pages (src/data/investing.ts); this file does not repeat it.
 */
import type { DepthSet } from "./types";

export const EQUITIES_DEPTH: DepthSet = {
  aapl: {
    character:
      "Apple designs its own hardware, software and chips and sells them together, with one product line, the iPhone, providing the largest part of its revenue. It has others make its products, mainly in Asia. Its financial year ends in late September, so its calendar is a quarter out of step with most American companies.",
    drivers: [
      {
        t: "The iPhone cycle",
        d: "New models are customarily introduced in the autumn, and sales in the months that follow fall into the company’s first fiscal quarter, which includes the holiday season. How each generation sells against the one before is the comparison analysts make first. Because that quarter is much the largest of the year, its result carries more weight than the other three.",
      },
      {
        t: "Services",
        d: "The company reports services as a separate category: its app store, subscriptions, cloud storage, payments, advertising and licensing. These revenues depend on the number of devices in use more than on the number sold in a quarter. The split between products and services is given in every quarterly report.",
      },
      {
        t: "Manufacturing and supply",
        d: "Assembly is carried out by contract manufacturers, concentrated in a small number of countries. Factory shutdowns, component shortages, tariffs and export controls can limit how many devices are available to sell, which the company’s annual report lists among its risk factors. The effect appears as supply falling short of demand in a quarter.",
      },
      {
        t: "Sales by region and currency",
        d: "The company reports by geographic segment, and a large part of its sales is made outside the United States. A stronger dollar reduces the dollar value of those sales. Demand in Greater China is reported as its own segment and is followed closely.",
      },
      {
        t: "Capital returned to shareholders",
        d: "The company pays a quarterly dividend and buys back its own shares on a large scale, with the board’s authorisation customarily updated once a year. Buybacks reduce the number of shares, which raises earnings per share for a given profit.",
      },
      {
        t: "Regulation of app distribution",
        d: "The terms on which software is distributed and paid for on the company’s devices have been the subject of public litigation and regulatory proceedings in several jurisdictions. Developments in them bear on services revenue and move the share when they are announced.",
      },
    ],
    mechanics: [
      {
        t: "A fiscal year that ends in September",
        d: "The financial year runs for 52 or 53 weeks and ends on the last Saturday of September. The first fiscal quarter is therefore the one ending in December. Figures labelled by fiscal quarter have to be translated before they are compared with companies on a calendar year.",
      },
      {
        t: "What is filed, and when",
        d: "The annual report is filed with the Securities and Exchange Commission on Form 10-K and the three other quarters on Form 10-Q. Results are first announced in a press release, furnished on Form 8-K, and discussed on a conference call the same afternoon after the market has closed. The filings, not the press release, contain the full accounts and risk factors.",
      },
      {
        t: "One class of share",
        d: "There is a single class of common stock, listed on Nasdaq, with one vote per share. The company is a member of the Dow Jones Industrial Average, the S&P 500 and the Nasdaq-100, so it is held by every fund that tracks them.",
      },
      {
        t: "Five stock splits",
        d: "The shares have been split five times: two-for-one in 1987, 2000 and 2005, seven-for-one in 2014 and four-for-one in 2020. Historical prices on a chart are restated for these, so an old price shown today is not the price that was quoted at the time.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A shareholder owns a fraction of the company, may vote at its annual meeting, and receives the dividend when one is paid. The most that can be lost is the amount paid. What ownership means is set out on the investing pages.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD holder owns nothing in the company and has no vote. The holder has a claim on the CFD provider for the change in the share price, and depends on the provider to pay it.",
      },
      {
        t: "The dividend",
        d: "The company pays its dividend to shareholders. A CFD holder receives no dividend; providers generally make a cash adjustment on the ex-dividend date, credited to long positions and charged to short ones, to offset the fall in the share price. Whether, how much and after what deductions is a matter of the provider’s terms.",
      },
      {
        t: "The cost of holding",
        d: "A share bought outright costs nothing to keep beyond any custody charge. A CFD is a leveraged position and usually carries a financing charge for each night it is held, so time is a cost.",
      },
    ],
    lifecycle: [
      {
        t: "Earnings days",
        d: "Results are released after the close, roughly a month after each fiscal quarter ends. The first reaction takes place in after-hours trading, where volume is thin and prices move further, and the regular session next morning can open far from the previous close. A product based on regular-hours prices shows this as a gap.",
      },
      {
        t: "The dividend timetable",
        d: "Each dividend has a declaration date, a record date and a payment date, announced with the results. Since settlement in the United States moved to one business day in 2024, the ex-dividend date is ordinarily the record date itself. The share normally opens lower by about the dividend that morning.",
      },
      {
        t: "A stock split",
        d: "A split multiplies the number of shares and divides the price, leaving each holding worth the same. Open orders and derivative contracts are adjusted by the same ratio. Because the Dow is price-weighted, a split by this company also lowers its weight in that index.",
      },
      {
        t: "Trading halts",
        d: "United States exchanges pause a share for a few minutes if its price moves outside a band within a short time, and Nasdaq can halt a share when important news is pending. During a halt there is no market price, and products derived from the share cannot be priced normally.",
      },
    ],
    watch: [
      "The quarterly results release and conference call",
      "The first fiscal quarter’s results, which cover the holiday season",
      "The annual developers’ conference",
      "The autumn product event",
      "The annual meeting of shareholders",
      "The yearly update to the dividend and the share repurchase authorisation",
    ],
    sources: [
      "Apple Inc.: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Apple Inc.: Quarterly Reports on Form 10-Q and results releases furnished on Form 8-K",
      "Apple Inc.: proxy statement for the annual meeting of shareholders (Schedule 14A)",
      "Apple Inc.: investor relations pages on dividend and stock split history",
    ],
  },

  amzn: {
    character:
      "Amazon is several businesses under one share: an online shop, a marketplace for other sellers, a delivery network, an advertising business and a cloud-computing provider. The cloud business is reported as a segment of its own and has a different economic profile from retail, so the two are read separately. The company has a long record of spending heavily ahead of revenue.",
    drivers: [
      {
        t: "The cloud segment",
        d: "Amazon Web Services rents computing, storage and software to other organisations. Its growth and its operating profit are disclosed each quarter, and both are compared with those of the other large cloud providers. A change in the pace of this one segment can outweigh everything else in the report.",
      },
      {
        t: "Consumer spending",
        d: "Sales through the company’s own shop and by third-party sellers follow household spending in North America and abroad. The fourth calendar quarter, with the holiday season, is the largest. Membership programmes and sales events shift some spending between quarters.",
      },
      {
        t: "Capital expenditure",
        d: "The company builds warehouses, transport capacity and data centres on a very large scale. Spending rises before the revenue it is meant to support, which lowers free cash flow in the meantime. The market reacts to the amount spent and to what management says it is for.",
      },
      {
        t: "Advertising and seller services",
        d: "Fees charged to third-party sellers and advertising shown to shoppers are reported as separate lines of revenue. They depend on the volume of activity on the marketplace more than on the company’s own stock of goods.",
      },
      {
        t: "Guidance",
        d: "With each set of results the company gives a range for the next quarter’s sales and operating income. The share has often moved more on that range than on the quarter just reported.",
      },
      {
        t: "Competition proceedings",
        d: "The company’s treatment of sellers on its marketplace has been the subject of public proceedings by competition authorities in the United States and Europe. Announcements in them are market news for the share.",
      },
    ],
    mechanics: [
      {
        t: "Three reporting segments",
        d: "Results are reported as North America, International and Amazon Web Services. Revenue is also broken down by type: online stores, physical stores, third-party seller services, advertising, subscriptions and the cloud. The segment note in the filing is where the profit of each part is shown.",
      },
      {
        t: "A calendar financial year",
        d: "The financial year ends on 31 December. The annual report on Form 10-K is filed early in the new year and Form 10-Q after each of the other three quarters, with results announced after the market closes.",
      },
      {
        t: "Four stock splits",
        d: "The shares were split two-for-one in 1998, three-for-one and two-for-one in 1999, and twenty-for-one in 2022. More than two decades passed between the third and the fourth, during which the price of one share became very high.",
      },
      {
        t: "Dividends",
        d: "For its first decades as a listed company Amazon paid no cash dividend and returned capital, when it did, through occasional share repurchases. Whether a dividend is now paid is stated in the latest annual report. There is one class of common stock, listed on Nasdaq.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A shareholder owns part of the company and may vote on directors and on shareholder proposals, of which this company’s annual meeting usually has many. The shareholder’s return has come from the change in price.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD gives no ownership and no vote, only a claim on the provider for the change in price. The position can be opened to gain from a fall as easily as from a rise, which a shareholder cannot do without borrowing shares.",
      },
      {
        t: "Corporate actions",
        d: "When the company split its shares, shareholders received the new shares automatically. A CFD provider makes the corresponding adjustment to open positions under its own terms, changing the quantity and the reference price so that the value is unchanged.",
      },
      {
        t: "The cost of holding",
        d: "A shareholder can hold for years at no running cost. A CFD usually bears a financing charge each night, so a long holding period that would cost a shareholder nothing has a price.",
      },
    ],
    lifecycle: [
      {
        t: "Earnings",
        d: "Results come out after the close about a month after each quarter ends, followed by a conference call. The reaction is concentrated in after-hours trading and at the next morning’s open.",
      },
      {
        t: "A split after a long interval",
        d: "The 2022 split shows what a split does and does not do: twenty times as many shares, each at a twentieth of the price, and no change in the value of the company. Charts and price histories were restated. Derivative contracts on the share were adjusted by the same ratio.",
      },
      {
        t: "Joining a price-weighted index",
        d: "The company was added to the Dow Jones Industrial Average in 2024. Before the 2022 split its share price would have dominated that index, which is a reminder that in a price-weighted index a split can decide whether a company can be included at all.",
      },
      {
        t: "Halts",
        d: "A single-share pause applies if the price moves beyond a set band within minutes, and all shares stop if the market-wide circuit breakers are triggered. No price exists for the share while it is halted.",
      },
    ],
    watch: [
      "The quarterly results release and the guidance range given with it",
      "The fourth-quarter results, which cover the holiday season",
      "The company’s annual sales event for members",
      "The annual meeting of shareholders and the votes on shareholder proposals",
      "The annual customer conference of the cloud business",
    ],
    sources: [
      "Amazon.com, Inc.: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Amazon.com, Inc.: Quarterly Reports on Form 10-Q and results releases furnished on Form 8-K",
      "Amazon.com, Inc.: annual letter to shareholders",
      "Amazon.com, Inc.: proxy statement for the annual meeting of shareholders",
    ],
  },

  googl: {
    character:
      "Alphabet is the holding company for Google, and most of its revenue is advertising shown beside search results, on video and across other websites. It has more than one class of share, and the class traded under this symbol is the one that carries a vote. Control rests with the holders of a third class that is not listed at all.",
    drivers: [
      {
        t: "Advertising demand",
        d: "Advertisers spend more when the economy is growing and cut quickly when it is not, and search advertising follows commercial activity closely. The company reports search, video and network advertising separately. The fourth calendar quarter is usually the strongest.",
      },
      {
        t: "The cost of acquiring traffic",
        d: "The company pays partners, including makers of devices and browsers, for directing searches to it. These traffic acquisition costs are disclosed each quarter and are deducted before the profitability of advertising can be judged. Changes in those arrangements affect the cost base directly.",
      },
      {
        t: "The cloud segment",
        d: "Google Cloud sells computing infrastructure and workplace software to organisations and is reported as its own segment, with its own operating result. It is compared each quarter with the other large cloud providers.",
      },
      {
        t: "Spending on computing capacity",
        d: "Data centres, chips and networks are the company’s largest investment. The amount of capital expenditure and management’s explanation of it are a regular focus of results days, since the spending comes before the revenue it supports.",
      },
      {
        t: "Competition and legal proceedings",
        d: "The company’s position in search and in advertising technology has been the subject of public litigation brought by competition authorities in the United States and of decisions by the European Commission. Rulings, remedies and appeals in those proceedings are market events for the share.",
      },
      {
        t: "Changes in how people search",
        d: "New ways of finding information, including conversational software, bear on how many searches are made and how advertising is shown with them. The company’s filings list this among the competitive risks to its main business.",
      },
    ],
    mechanics: [
      {
        t: "Three classes of share",
        d: "Class A shares, traded as GOOGL, carry one vote each. Class C shares, traded as GOOG, carry none. Class B shares carry ten votes each, are held mainly by the founders and other insiders, are not listed, and convert to Class A when sold. The economic rights of the three classes are the same.",
      },
      {
        t: "Two symbols, two prices",
        d: "Because both listed classes are claims on the same company, their prices stay close, but they are not identical and the small gap between them moves. The symbol on this page is the voting Class A share. Both classes are members of the S&P 500 and the Nasdaq-100.",
      },
      {
        t: "Segments",
        d: "Results are reported as Google Services, Google Cloud and Other Bets, the last being a group of earlier-stage businesses. Alphabet was created as the parent company in 2015; filings and histories before that are in the name of Google.",
      },
      {
        t: "Filings and calendar",
        d: "The financial year ends on 31 December. The annual report is filed on Form 10-K and the other quarters on Form 10-Q, with results released after the market closes and a conference call the same day.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A holder of Class A shares owns part of the company and has one vote per share, although the Class B holders’ ten votes per share mean that public shareholders together cannot outvote them. A holder of Class C owns the same economic interest with no vote.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD carries no vote and no ownership whichever class it refers to. The distinction between the classes survives only as the small difference in the prices they track.",
      },
      {
        t: "The dividend",
        d: "The company declared its first cash dividend in 2024, having paid none before. A shareholder receives it; a CFD holder does not, and is instead subject to the provider’s dividend adjustment on the ex-dividend date.",
      },
      {
        t: "The cost of holding",
        d: "Shares held outright have no financing cost. A CFD position usually pays financing for each night it is open, and is leveraged, so a fall in the price is a larger fraction of the money put up.",
      },
    ],
    lifecycle: [
      {
        t: "The 2014 creation of Class C",
        d: "In 2014 the company distributed one new non-voting Class C share for each share held. In effect this was a two-for-one split that created a second listed line, and it is why there are two symbols. Price histories for both are restated for it.",
      },
      {
        t: "The 2022 split",
        d: "In July 2022 all three classes were split twenty-for-one. Each holding became twenty times as many shares at a twentieth of the price.",
      },
      {
        t: "Earnings",
        d: "Results are released after the close about a month after the quarter ends. Both listed classes react together in after-hours trading, and the next regular session can open at a distance from the previous close.",
      },
      {
        t: "Court dates",
        d: "Because several proceedings are in progress at any time, hearings, rulings and filing deadlines form a second calendar alongside the earnings calendar. These dates are set by courts and regulators and are public, though the timing of a ruling usually is not.",
      },
    ],
    watch: [
      "The quarterly results release and conference call",
      "The disclosure of traffic acquisition costs and capital expenditure with each quarter",
      "The annual developers’ conference",
      "The annual meeting of stockholders",
      "Scheduled hearings and rulings in the competition proceedings",
      "Dividend declarations with the quarterly results",
    ],
    sources: [
      "Alphabet Inc.: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Alphabet Inc.: Quarterly Reports on Form 10-Q and results releases furnished on Form 8-K",
      "Alphabet Inc.: Amended and Restated Certificate of Incorporation (the rights of each class of stock)",
      "Alphabet Inc.: proxy statement for the annual meeting of stockholders",
    ],
  },

  nflx: {
    character:
      "Netflix does one thing: it sells subscriptions to a streaming service, in nearly every country, and more recently advertising on a cheaper tier of it. Almost all of its revenue comes from membership fees, which makes it the simplest business of the six to describe. The complication is in its costs, since it pays for programmes years before they are watched.",
    drivers: [
      {
        t: "Members and what they pay",
        d: "Revenue is the number of paying memberships multiplied by the average each pays. For many years the quarterly count of members was the figure the share reacted to. The company stopped reporting that count each quarter from 2025 and directs attention to revenue and operating margin instead.",
      },
      {
        t: "Price changes and plans",
        d: "The company raises prices country by country and has added a lower-priced plan with advertising and charges for sharing an account outside a household. Each change trades some members for more revenue per member, and the net effect shows in the quarters that follow.",
      },
      {
        t: "The programme slate",
        d: "Sign-ups cluster around popular releases, so the timing of major series, films and live events moves revenue between quarters. A strong or thin slate is a normal part of management’s explanation of a quarter.",
      },
      {
        t: "Exchange rates",
        d: "Most members are outside the United States and pay in their own currencies, while the accounts are in dollars. A stronger dollar lowers reported revenue. The company reports growth with and without the effect of currency for that reason.",
      },
      {
        t: "Competition for viewing time",
        d: "Other streaming services, broadcast television, video-sharing sites and games compete for the same hours. The company’s filings describe its market as the whole of entertainment, not only paid streaming.",
      },
    ],
    mechanics: [
      {
        t: "Spending on content, and how it is accounted for",
        d: "Programmes are paid for when they are made or licensed, and the cost is then charged to profit over the period they are expected to be watched. Cash paid and expense reported can therefore differ widely in a given year. This is why free cash flow is quoted alongside profit.",
      },
      {
        t: "Revenue by region",
        d: "The company reports revenue for four regions: the United States and Canada; Europe, the Middle East and Africa; Latin America; and Asia-Pacific. It is managed and reported as a single operating segment.",
      },
      {
        t: "A letter instead of a call",
        d: "Results are published in a letter to shareholders after the market closes, followed by a recorded interview with management in place of a conventional conference call. The annual report is filed on Form 10-K and the other quarters on Form 10-Q; the financial year is the calendar year.",
      },
      {
        t: "Stock splits and dividends",
        d: "The shares were split two-for-one in 2004, seven-for-one in 2015 and ten-for-one in 2025. The company has not been a dividend payer, and its annual reports have said so; it has returned capital through share repurchases. There is one class of common stock, listed on Nasdaq.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A shareholder owns part of the company and may vote at the annual meeting. With no dividend, the shareholder’s return has come entirely from the change in price.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD holder owns nothing and has no vote, and is owed the change in price by the provider. Where no dividend is paid there is no dividend adjustment either, so the difference from owning comes down to leverage, financing and the counterparty.",
      },
      {
        t: "The cost of holding",
        d: "The financing charge on a CFD accrues every night. For a share that pays no dividend, that charge is the whole of the running difference between holding the share and holding the CFD.",
      },
    ],
    lifecycle: [
      {
        t: "Earnings",
        d: "The company is usually among the first large technology companies to report each quarter, within about three weeks of the quarter’s end. Its share has a history of very large moves on results, in both directions, taking place after hours.",
      },
      {
        t: "A change in what is reported",
        d: "When a company stops publishing a figure the market had relied on, as here with quarterly member counts, the basis of comparison changes. Older commentary built around that figure no longer has a current equivalent.",
      },
      {
        t: "Splits",
        d: "Each split multiplied the share count and divided the price, with histories restated. A split has no effect on the company’s weight in the S&P 500 or the Nasdaq-100, both of which are weighted by market value.",
      },
      {
        t: "Halts and acquisitions",
        d: "Nasdaq can halt a share when significant news is pending, and announcements of mergers or acquisitions are a common cause. While a halt lasts there is no market price.",
      },
    ],
    watch: [
      "The quarterly letter to shareholders and earnings interview",
      "The revenue and operating margin forecast given with each quarter",
      "The release dates of the largest series, films and live events",
      "Announced changes in subscription prices and plans",
      "The annual meeting of stockholders",
    ],
    sources: [
      "Netflix, Inc.: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Netflix, Inc.: quarterly letter to shareholders",
      "Netflix, Inc.: Quarterly Reports on Form 10-Q",
      "Netflix, Inc.: proxy statement for the annual meeting of stockholders",
    ],
  },

  msft: {
    character:
      "Microsoft sells software and computing to organisations more than to individuals: an operating system, office software, a cloud platform, business applications and a professional network, with a games and devices business alongside. Much of the revenue is subscriptions and multi-year contracts, which makes it steadier than revenue from one-off sales. Its financial year ends on 30 June.",
    drivers: [
      {
        t: "Cloud growth",
        d: "The company’s cloud platform, Azure, is the figure most closely followed on results days. Its growth rate is disclosed each quarter and compared with the other large providers and with the company’s own forecast.",
      },
      {
        t: "Spending by businesses on software",
        d: "Sales of office software, business applications and server products depend on the number of employees its customers have and on their technology budgets. Because most of it is sold by subscription, a change in demand appears gradually in revenue and sooner in the measures of contracts signed.",
      },
      {
        t: "Investment in data centres",
        d: "Capital expenditure on computing capacity is very large and has been rising. Management’s account of how much is being spent, and how quickly capacity is being taken up, is a regular subject of results days.",
      },
      {
        t: "Personal computers and games",
        d: "Licences for the operating system follow the number of personal computers sold. The games business, enlarged by a major acquisition completed in 2023, follows console cycles and release schedules. Both are more cyclical than the business software.",
      },
      {
        t: "Exchange rates",
        d: "A large part of revenue is earned outside the United States. The company reports growth in constant currency beside the reported figure, because a stronger dollar lowers the latter.",
      },
    ],
    mechanics: [
      {
        t: "Three segments",
        d: "Results are reported as Productivity and Business Processes, Intelligent Cloud, and More Personal Computing. The company has moved products between segments from time to time and restated earlier periods when it did so, which matters when comparing figures across years.",
      },
      {
        t: "A fiscal year that ends in June",
        d: "The first fiscal quarter ends in September and the fourth in June. The annual report on Form 10-K is filed in the summer, and Form 10-Q after each of the other three quarters. Results are released after the market closes.",
      },
      {
        t: "Forecasts on the call",
        d: "The company gives its outlook for the next quarter, segment by segment, during the conference call and not in the press release. The share’s reaction to results has often changed direction during the call for that reason.",
      },
      {
        t: "Stock splits and dividends",
        d: "The shares were split nine times between the company’s flotation in 1986 and 2003, and not since. It has paid a regular dividend since 2003 and paid a large special dividend in 2004. There is one class of common stock, listed on Nasdaq.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A shareholder owns part of the company, votes at the annual meeting and receives four dividends a year. The dividend has been a real part of a holder’s return over time.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD confers no ownership and no vote. Its holder has a contract with a provider for the change in price, and bears the risk that the provider cannot pay.",
      },
      {
        t: "The dividend",
        d: "On each ex-dividend date the share opens lower by about the dividend. A shareholder is compensated by the dividend itself. A CFD holder is compensated, if the provider’s terms say so, by an adjustment, and a short position is charged the same amount.",
      },
      {
        t: "The cost of holding",
        d: "Over a year, a shareholder collects dividends and pays nothing to hold. A long CFD position pays financing each night, and the dividend adjustments it receives are set against that cost.",
      },
    ],
    lifecycle: [
      {
        t: "Earnings",
        d: "Results are announced after the close a few weeks after each fiscal quarter ends. Because the outlook is given during the call, the after-hours price can move twice: once on the figures and again on the forecast.",
      },
      {
        t: "The dividend cycle",
        d: "The board declares each quarterly dividend with a record date and a payment date, and has customarily announced the year’s increase in September. The ex-dividend dates are known weeks ahead.",
      },
      {
        t: "The annual meeting",
        d: "The annual meeting of shareholders is held late in the calendar year, some months after the fiscal year ends. Directors are elected and shareholder proposals voted on, as set out in the proxy statement.",
      },
      {
        t: "Index membership",
        d: "The company has been in the Dow Jones Industrial Average since 1999, when it was among the first companies listed on Nasdaq to be included. It is also among the largest members of the S&P 500 and the Nasdaq-100, so its results move all three indices.",
      },
    ],
    watch: [
      "The quarterly results release and the outlook given on the conference call",
      "The growth rate reported for the cloud platform",
      "The September dividend announcement",
      "The annual meeting of shareholders late in the calendar year",
      "The company’s annual conferences for developers and for business customers",
    ],
    sources: [
      "Microsoft Corporation: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Microsoft Corporation: Quarterly Reports on Form 10-Q and results releases furnished on Form 8-K",
      "Microsoft Corporation: proxy statement for the annual shareholders meeting",
      "Microsoft Corporation: investor relations pages on dividend and stock split history",
    ],
  },

  tsla: {
    character:
      "Tesla makes electric vehicles in its own factories and sells them through its own outlets, with a second business in batteries for storing electricity. It publishes how many vehicles it built and delivered a few days after each quarter ends, weeks before its accounts, so the market has two dates a quarter to react to. Its share has been among the most actively traded and most volatile of the large American companies.",
    drivers: [
      {
        t: "Deliveries",
        d: "The quarterly count of vehicles produced and delivered is the first hard figure for each quarter. It is compared with the same quarter a year earlier and with analysts’ estimates, and the share moves on the difference. Deliveries are not revenue: the price at which the vehicles were sold appears only in the accounts.",
      },
      {
        t: "Vehicle prices and margins",
        d: "The company has changed its prices often, in both directions, to manage demand. A price cut raises volume and lowers the profit on each vehicle, and the automotive gross margin reported in the accounts shows the net result.",
      },
      {
        t: "Incentives and credits",
        d: "Government incentives for buyers of electric vehicles affect demand, and they are introduced, changed and withdrawn by legislation in each country. The company also earns revenue by selling regulatory credits to other carmakers, a line that depends on the rules that create the credits.",
      },
      {
        t: "Energy storage",
        d: "Batteries for homes and for electricity grids are reported as a separate segment, with deployments published alongside the vehicle figures. Its growth has differed from that of the vehicle business in a number of periods.",
      },
      {
        t: "Announcements about future products",
        d: "Statements about new models, self-driving software and robotics have moved the share substantially, often more than reported results. The timing of such announcements is less regular than an earnings calendar, and the company’s filings caution that timelines for new products may not be met.",
      },
      {
        t: "The chief executive",
        d: "The company’s annual report names its dependence on its chief executive as a risk factor. His public statements, his other business interests, his sales of shares and the terms of his pay, which have been the subject of public litigation, have each been market events for the share.",
      },
    ],
    mechanics: [
      {
        t: "Two reports each quarter",
        d: "A production, deliveries and deployments release is published within a few days of the quarter’s end. The full results follow some weeks later, after the market closes, with a presentation and a conference call. The annual report is on Form 10-K and the other quarters on Form 10-Q; the financial year is the calendar year.",
      },
      {
        t: "Two segments",
        d: "The accounts are divided into automotive, and energy generation and storage. Automotive includes vehicle sales, leasing, regulatory credits and services.",
      },
      {
        t: "Stock splits and dividends",
        d: "The shares were split five-for-one in 2020 and three-for-one in 2022. The company has not paid a cash dividend on its common stock, and its annual reports have stated that it does not expect to. There is one class of common stock, listed on Nasdaq since the flotation in 2010.",
      },
      {
        t: "Options activity",
        d: "Options on the share are traded in very large volume. Dealers who have sold options hedge by buying or selling the share as its price moves, which can add to the size of moves, particularly near option expiry. How options work is explained on the investing pages.",
      },
    ],
    versus: [
      {
        t: "Owning the share",
        d: "A shareholder owns part of the company and may vote. Votes at this company have at times been closely contested and widely reported, including on executive pay and on where the company is incorporated.",
      },
      {
        t: "A CFD on the share",
        d: "A CFD holder has no vote and no ownership, only a claim on the provider for the change in price. With no dividend paid, no dividend adjustment arises.",
      },
      {
        t: "Leverage on a volatile share",
        d: "The share has often moved by a large percentage in a day and gapped between one close and the next open. On a leveraged position such a move is multiplied relative to the money put up, and a gap can pass through a stop-loss level without trading at it.",
      },
      {
        t: "The cost of holding",
        d: "A shareholder pays nothing to hold. A CFD position usually pays financing each night, and the provider may raise the margin it requires around earnings or during turbulent periods.",
      },
    ],
    lifecycle: [
      {
        t: "The deliveries release",
        d: "The release arrives early in January, April, July and October, sometimes while the market is closed. The first trading after it is where the reaction appears.",
      },
      {
        t: "Earnings",
        d: "Results are published after the close, some weeks after the deliveries release. Since unit volumes are already known, attention goes to margins, cash flow and what is said on the call.",
      },
      {
        t: "Joining an index",
        d: "The company was added to the S&P 500 in December 2020, at a size that made it one of the largest additions the index had seen. Tracking funds had to buy on the day of inclusion, and the episode is a standard example of how an index change creates trading.",
      },
      {
        t: "Splits",
        d: "Both splits were paid as stock dividends, giving holders additional shares for each one held. Prices, share counts and derivative contracts were adjusted by the split ratio, and the value of each holding was unchanged.",
      },
      {
        t: "Halts",
        d: "Volatile shares trigger the single-share price bands more often than steady ones. A pause lasts a few minutes at first and can be extended, and no trading takes place during it.",
      },
    ],
    watch: [
      "The quarterly production, deliveries and deployments release",
      "The quarterly results release and conference call",
      "The annual meeting of shareholders",
      "Monthly and weekly options expiry",
      "Scheduled changes to government incentives for electric vehicles",
      "Company events announcing new products",
    ],
    sources: [
      "Tesla, Inc.: Annual Report on Form 10-K, filed with the U.S. Securities and Exchange Commission (EDGAR)",
      "Tesla, Inc.: quarterly production, deliveries and deployments release",
      "Tesla, Inc.: Quarterly Reports on Form 10-Q and quarterly shareholder update",
      "Tesla, Inc.: proxy statement for the annual meeting of shareholders",
    ],
  },
};
