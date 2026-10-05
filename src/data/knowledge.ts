/**
 * Reference knowledge: currencies, central banks and economic events.
 *
 * These are institutional facts (names, mandates, what a release measures),
 * not data. Policy rates, meeting dates and release values are deliberately
 * absent: GIO4X has no licensed feed for them yet, and each page links to the
 * primary source instead of printing a number that would go stale.
 */

export type Currency = {
  code: string;
  name: string;
  /** what people call it */
  nicknames: string[];
  area: string;
  bank: string; // central bank slug
  symbol: string;
  note: string;
};

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", nicknames: ["dollar", "greenback", "buck"], area: "United States", bank: "fed", symbol: "$", note: "The world’s primary reserve currency and one side of most foreign-exchange transactions." },
  { code: "EUR", name: "Euro", nicknames: ["euro", "single currency"], area: "Euro area", bank: "ecb", symbol: "€", note: "The shared currency of the euro area member states." },
  { code: "GBP", name: "British Pound", nicknames: ["sterling", "pound", "cable"], area: "United Kingdom", bank: "boe", symbol: "£", note: "Pound sterling, the oldest currency still in use among the majors." },
  { code: "JPY", name: "Japanese Yen", nicknames: ["yen"], area: "Japan", bank: "boj", symbol: "¥", note: "Quoted to two or three decimal places rather than four or five; one pip in a yen pair is 0.01." },
  { code: "CHF", name: "Swiss Franc", nicknames: ["swissy", "franc"], area: "Switzerland", bank: "snb", symbol: "Fr", note: "Often regarded as a defensive currency." },
  { code: "AUD", name: "Australian Dollar", nicknames: ["aussie"], area: "Australia", bank: "rba", symbol: "A$", note: "Commonly associated with commodity demand and with growth in Asia." },
  { code: "CAD", name: "Canadian Dollar", nicknames: ["loonie"], area: "Canada", bank: "boc", symbol: "C$", note: "Linked to energy prices through Canada’s role as an oil exporter." },
  { code: "NZD", name: "New Zealand Dollar", nicknames: ["kiwi"], area: "New Zealand", bank: "rbnz", symbol: "NZ$", note: "A smaller, commodity-linked currency." },
];

export type CentralBank = {
  slug: string;
  name: string;
  short: string;
  currency: string;
  area: string;
  city: string;
  /** the body that sets policy */
  committee: string;
  /** the name of the headline policy instrument */
  instrument: string;
  mandate: string;
  /** primary source for decisions and the current rate */
  url: string;
  /** IANA zone of the announcement */
  tz: string;
  lat: number;
  lon: number;
  /** how it works, where the profile rows alone would mislead: how often it meets in general terms, what it publishes */
  note?: string;
};

export const centralBanks: CentralBank[] = [
  { slug: "fed", name: "Federal Reserve", short: "Fed", currency: "USD", area: "United States", city: "Washington, D.C.", committee: "Federal Open Market Committee (FOMC)", instrument: "Target range for the federal funds rate", mandate: "Maximum employment and stable prices.", url: "https://www.federalreserve.gov/monetarypolicy.htm", tz: "America/New_York", lat: 38.89, lon: -77.05 },
  { slug: "ecb", name: "European Central Bank", short: "ECB", currency: "EUR", area: "Euro area", city: "Frankfurt", committee: "Governing Council", instrument: "Deposit facility rate", mandate: "Price stability across the euro area.", url: "https://www.ecb.europa.eu/mopo/html/index.en.html", tz: "Europe/Berlin", lat: 50.11, lon: 8.7 },
  { slug: "boe", name: "Bank of England", short: "BoE", currency: "GBP", area: "United Kingdom", city: "London", committee: "Monetary Policy Committee (MPC)", instrument: "Bank Rate", mandate: "Monetary and financial stability, with an inflation target set by the government.", url: "https://www.bankofengland.co.uk/monetary-policy", tz: "Europe/London", lat: 51.51, lon: -0.09 },
  { slug: "boj", name: "Bank of Japan", short: "BoJ", currency: "JPY", area: "Japan", city: "Tokyo", committee: "Policy Board", instrument: "Short-term policy interest rate", mandate: "Price stability and the stability of the financial system.", url: "https://www.boj.or.jp/en/mopo/index.htm", tz: "Asia/Tokyo", lat: 35.69, lon: 139.77 },
  { slug: "snb", name: "Swiss National Bank", short: "SNB", currency: "CHF", area: "Switzerland", city: "Zurich and Bern", committee: "Governing Board", instrument: "SNB policy rate", mandate: "Price stability, taking due account of economic developments.", url: "https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy", tz: "Europe/Zurich", lat: 47.37, lon: 8.54 },
  { slug: "rba", name: "Reserve Bank of Australia", short: "RBA", currency: "AUD", area: "Australia", city: "Sydney", committee: "Monetary Policy Board", instrument: "Cash rate target", mandate: "Price stability and full employment.", url: "https://www.rba.gov.au/monetary-policy/", tz: "Australia/Sydney", lat: -33.87, lon: 151.21 },
  { slug: "boc", name: "Bank of Canada", short: "BoC", currency: "CAD", area: "Canada", city: "Ottawa", committee: "Governing Council", instrument: "Target for the overnight rate", mandate: "Low, stable and predictable inflation.", url: "https://www.bankofcanada.ca/core-functions/monetary-policy/", tz: "America/Toronto", lat: 45.42, lon: -75.7 },
  { slug: "rbnz", name: "Reserve Bank of New Zealand", short: "RBNZ", currency: "NZD", area: "New Zealand", city: "Wellington", committee: "Monetary Policy Committee", instrument: "Official Cash Rate (OCR)", mandate: "Price stability over the medium term.", url: "https://www.rbnz.govt.nz/monetary-policy", tz: "Pacific/Auckland", lat: -41.29, lon: 174.78 },
  { slug: "rbi", name: "Reserve Bank of India", short: "RBI", currency: "INR", area: "India", city: "Mumbai", committee: "Monetary Policy Committee (MPC)", instrument: "Policy repo rate", mandate: "Price stability while keeping in mind the objective of growth.", url: "https://www.rbi.org.in/", tz: "Asia/Kolkata", lat: 18.93, lon: 72.84 },
  // Seven more, added 5 October 2026. None of their currencies is in a GIO4X instrument; each page says so.
  {
    slug: "riksbank", name: "Sveriges Riksbank", short: "Riksbank", currency: "SEK", area: "Sweden", city: "Stockholm", committee: "Executive Board", instrument: "Policy rate", mandate: "Low and stable inflation and, without setting that aside, sustainable growth and high employment.", url: "https://www.riksbank.se/en-gb/monetary-policy/", tz: "Europe/Stockholm", lat: 59.33, lon: 18.06,
    note: "The Executive Board holds several scheduled monetary policy meetings a year and announces each decision the following morning. It publishes a Monetary Policy Report or a shorter update with the decision, its own forecast for the policy rate, and minutes in which each member’s view is given by name.",
  },
  {
    slug: "norges-bank", name: "Norges Bank", short: "Norges Bank", currency: "NOK", area: "Norway", city: "Oslo", committee: "Monetary Policy and Financial Stability Committee", instrument: "Policy rate (the sight deposit rate)", mandate: "Low and stable inflation, while contributing to high and stable output and employment and to counteracting the build-up of financial imbalances.", url: "https://www.norges-bank.no/en/topics/Monetary-policy/", tz: "Europe/Oslo", lat: 59.91, lon: 10.74,
    note: "The committee holds several scheduled meetings a year. At some of them it publishes a Monetary Policy Report that includes the bank’s own forecast for the policy rate. Separately from monetary policy, Norges Bank manages the Government Pension Fund Global, Norway’s sovereign wealth fund, on behalf of the Ministry of Finance.",
  },
  {
    slug: "mas", name: "Monetary Authority of Singapore", short: "MAS", currency: "SGD", area: "Singapore", city: "Singapore", committee: "Monetary and Investment Policy Meeting", instrument: "Singapore dollar exchange rate policy band", mandate: "Price stability as a sound basis for sustainable economic growth.", url: "https://www.mas.gov.sg/monetary-policy", tz: "Asia/Singapore", lat: 1.28, lon: 103.85,
    note: "The Authority has no policy interest rate. It steers the Singapore dollar against a trade-weighted basket of currencies, inside a band whose slope, width and centre it can change; the basket and the band are not published. Interest rates in Singapore are therefore largely an outcome of rates abroad and of the expected path of the exchange rate. Decisions are announced in a Monetary Policy Statement on a published schedule, a few times a year, and explained in its Macroeconomic Review. The Authority is also Singapore’s financial regulator.",
  },
  {
    slug: "hkma", name: "Hong Kong Monetary Authority", short: "HKMA", currency: "HKD", area: "Hong Kong", city: "Hong Kong", committee: "Chief Executive, within a currency board framework set by the Financial Secretary", instrument: "Linked exchange rate to the US dollar", mandate: "Currency stability: a stable external value for the Hong Kong dollar under the Linked Exchange Rate System.", url: "https://www.hkma.gov.hk/eng/key-functions/money/linked-exchange-rate-system/", tz: "Asia/Hong_Kong", lat: 22.28, lon: 114.16,
    note: "Hong Kong runs a currency board. The monetary base is fully backed by US dollar reserves, and the Authority undertakes to buy and sell Hong Kong dollars at the two edges of a narrow band against the US dollar. It does not set interest rates by decision: its Base Rate follows a formula tied to the United States policy rate, and market rates move with flows of money in and out of the Hong Kong dollar. There are no scheduled policy meetings. Banknotes are issued by three commercial banks against US dollars lodged with the Authority, and a Currency Board Sub-Committee publishes a record of its discussions.",
  },
  {
    slug: "sarb", name: "South African Reserve Bank", short: "SARB", currency: "ZAR", area: "South Africa", city: "Pretoria", committee: "Monetary Policy Committee (MPC)", instrument: "Repurchase rate (repo rate)", mandate: "Price stability in the interest of balanced and sustainable economic growth.", url: "https://www.resbank.co.za/en/home/what-we-do/monetary-policy", tz: "Africa/Johannesburg", lat: -25.75, lon: 28.19,
    note: "The committee meets on a published schedule, roughly every two months. The Governor reads its statement at a press conference, with the committee’s forecasts and the split of the vote, and the bank publishes a Monetary Policy Review twice a year. Its independence and its mandate are written into South Africa’s constitution; the inflation target it works to is set with the government.",
  },
  {
    slug: "banxico", name: "Banco de México", short: "Banxico", currency: "MXN", area: "Mexico", city: "Mexico City", committee: "Governing Board (Junta de Gobierno)", instrument: "Target for the overnight interbank interest rate", mandate: "Stability of the purchasing power of the peso.", url: "https://www.banxico.org.mx/indexen.html", tz: "America/Mexico_City", lat: 19.43, lon: -99.14,
    note: "The Governing Board, a governor and four deputy governors, announces its decisions on a calendar published in advance, several times a year. Minutes follow each decision, and a Quarterly Report sets out the bank’s forecasts. The bank has been autonomous under Mexico’s constitution since the 1990s.",
  },
  {
    slug: "pboc", name: "People’s Bank of China", short: "PBoC", currency: "CNY", area: "China", city: "Beijing", committee: "Governor and management, under the leadership of the State Council; its Monetary Policy Committee is advisory", instrument: "Seven-day reverse repo rate, with the Loan Prime Rate as the benchmark for lending", mandate: "Stability of the value of the currency, and through it economic growth.", url: "http://www.pbc.gov.cn/en/3688006/index.html", tz: "Asia/Shanghai", lat: 39.91, lon: 116.37,
    note: "The bank is not independent of the government: major decisions are taken under the State Council, and its Monetary Policy Committee, which meets quarterly, advises. It uses several instruments together, among them the rates on its lending to banks, the share of deposits banks must hold in reserve, and the reference rate it publishes each trading day for the yuan, around which the mainland market may trade within a band. The Loan Prime Rate is published monthly. There is no calendar of rate decisions comparable to those of the banks above; the bank publishes a quarterly China Monetary Policy Report.",
  },
];

export type EconEvent = {
  slug: string;
  name: string;
  short: string;
  kind: "Inflation" | "Employment" | "Growth" | "Monetary policy" | "Survey" | "Consumption" | "Trade" | "Housing" | "Energy";
  /** what it is */
  what: string;
  /** how it is measured */
  how: string;
  /** why markets watch it */
  why: string;
  /** assets commonly sensitive to it: "commonly monitored", never "will move" */
  watchedBy: string[];
  /** who publishes it, with primary links */
  publishers: { area: string; body: string; url: string }[];
  cadence: string;
  related: string[];
  /** how it is commonly misread */
  misread?: string;
  /** how the name reads inside a sentence, where lower-casing it would spoil a proper name ("the Tankan survey") */
  phrase?: string;
};

export const econEvents: EconEvent[] = [
  {
    slug: "cpi",
    name: "Consumer Price Index",
    short: "CPI",
    kind: "Inflation",
    what: "A measure of the average change over time in the prices paid by consumers for a fixed basket of goods and services. The year-over-year change in the index is the most quoted measure of inflation.",
    how: "Statistical agencies price a representative basket each month and weight each category by its share of household spending. “Core” measures exclude the most volatile categories, usually food and energy.",
    why: "Central banks set policy against an inflation objective, so an inflation reading that differs from what was expected can change the outlook for interest rates, and through it the pricing of currencies, bonds, equities and gold.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "i:xau-usd", "i:us500"],
    publishers: [
      { area: "United States", body: "Bureau of Labor Statistics", url: "https://www.bls.gov/cpi/" },
      { area: "Euro area", body: "Eurostat (HICP)", url: "https://ec.europa.eu/eurostat/web/hicp" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/inflationandpriceindices" },
    ],
    cadence: "Monthly",
    related: ["c:inflation", "c:real-yields", "ev:interest-rate-decision"],
  },
  {
    slug: "non-farm-payrolls",
    name: "Non-Farm Payrolls",
    short: "NFP",
    kind: "Employment",
    what: "The headline figure of the US Employment Situation report: the monthly change in the number of people employed outside farming, private households and non-profit organisations.",
    how: "Compiled by the Bureau of Labor Statistics from a survey of employers. The same report carries the unemployment rate and average hourly earnings, which come from a separate household survey and the payroll survey respectively.",
    why: "Employment is half of the Federal Reserve’s mandate. The report is one of the most closely watched scheduled releases, and trading conditions around it can change quickly: spreads may widen and prices may gap.",
    watchedBy: ["ccy:USD", "i:eur-usd", "i:usd-jpy", "i:xau-usd", "i:us30"],
    publishers: [{ area: "United States", body: "Bureau of Labor Statistics", url: "https://www.bls.gov/ces/" }],
    cadence: "Monthly, usually the first Friday",
    related: ["cb:fed", "c:volatility", "c:slippage"],
  },
  {
    slug: "interest-rate-decision",
    name: "Interest Rate Decision",
    short: "Rates",
    kind: "Monetary policy",
    what: "The scheduled announcement at which a central bank’s policy committee sets its policy interest rate and explains its assessment of the economy.",
    how: "The committee votes on the level of the policy rate. The decision is published with a statement, and in many cases with projections and a press conference.",
    why: "The policy rate anchors short-term borrowing costs in a currency. Markets respond not only to the decision itself but to how it compares with what was already priced in, and to guidance about what may follow.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "ccy:JPY", "i:xau-usd", "i:us100"],
    publishers: [
      { area: "United States", body: "Federal Reserve", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { area: "Euro area", body: "European Central Bank", url: "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html" },
      { area: "United Kingdom", body: "Bank of England", url: "https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates" },
    ],
    cadence: "Typically six to eight scheduled meetings a year, depending on the bank",
    related: ["c:monetary-policy", "c:carry-trade", "c:real-yields"],
  },
  {
    slug: "gdp",
    name: "Gross Domestic Product",
    short: "GDP",
    kind: "Growth",
    what: "The total value of goods and services produced in an economy over a period. Growth is usually reported as the quarter-on-quarter or year-on-year change in real (inflation-adjusted) GDP.",
    how: "National statistical agencies publish preliminary estimates soon after each quarter and revise them as more complete data arrives.",
    why: "GDP is the broadest measure of economic activity. Because it is published with a delay, markets often treat it as confirmation of trends already visible in more timely data.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "i:us500", "i:brent"],
    publishers: [
      { area: "United States", body: "Bureau of Economic Analysis", url: "https://www.bea.gov/data/gdp/gross-domestic-product" },
      { area: "Euro area", body: "Eurostat", url: "https://ec.europa.eu/eurostat/web/national-accounts" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/grossdomesticproductgdp" },
    ],
    cadence: "Quarterly, with revisions",
    related: ["c:recession", "ev:pmi"],
  },
  {
    slug: "pmi",
    name: "Purchasing Managers’ Index",
    short: "PMI",
    kind: "Survey",
    what: "A monthly survey of purchasing managers about new orders, output, employment, supplier deliveries and inventories, condensed into a diffusion index.",
    how: "Responses are aggregated so that a reading above 50 indicates that more firms reported expansion than contraction, and a reading below 50 the opposite.",
    why: "PMIs arrive early in the month and cover the month just ended, which makes them one of the timeliest indicators of the direction of activity.",
    watchedBy: ["ccy:EUR", "ccy:GBP", "ccy:USD", "i:de40", "i:us500"],
    publishers: [
      { area: "United States", body: "Institute for Supply Management", url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/" },
      { area: "Global", body: "S&P Global", url: "https://www.pmi.spglobal.com/" },
    ],
    cadence: "Monthly",
    related: ["ev:gdp", "c:recession"],
  },
  {
    slug: "unemployment-rate",
    name: "Unemployment Rate",
    short: "Jobless rate",
    kind: "Employment",
    what: "The share of the labour force that is without work, available for work and actively looking for it.",
    how: "Measured by household surveys conducted by national statistical agencies, using definitions aligned with the International Labour Organization.",
    why: "It indicates slack in the labour market, which bears on wage growth, consumer spending and central bank policy.",
    watchedBy: ["ccy:USD", "ccy:AUD", "ccy:CAD", "ccy:GBP"],
    publishers: [
      { area: "United States", body: "Bureau of Labor Statistics", url: "https://www.bls.gov/cps/" },
      { area: "Euro area", body: "Eurostat", url: "https://ec.europa.eu/eurostat/web/lfs" },
    ],
    cadence: "Monthly",
    related: ["ev:non-farm-payrolls", "c:monetary-policy"],
  },
  {
    slug: "retail-sales",
    name: "Retail Sales",
    short: "Retail sales",
    kind: "Consumption",
    what: "The total receipts of retail stores over a month, used as a timely gauge of consumer spending.",
    how: "Statistical agencies survey retailers and report the month-on-month and year-on-year change, often with a “core” version excluding the most volatile categories.",
    why: "Household consumption is the largest component of GDP in most developed economies.",
    watchedBy: ["ccy:USD", "ccy:GBP", "ccy:AUD", "i:us500"],
    publishers: [
      { area: "United States", body: "US Census Bureau", url: "https://www.census.gov/retail/index.html" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/businessindustryandtrade/retailindustry" },
    ],
    cadence: "Monthly",
    related: ["ev:gdp", "c:inflation"],
  },

  // The indicators library, added 5 October 2026: the same shape, with how each is commonly misread.
  {
    slug: "ppi",
    name: "Producer Price Index",
    short: "PPI",
    kind: "Inflation",
    what: "A measure of the average change over time in the prices that domestic producers receive for what they sell. Where the consumer price index is taken at the shop, this one is taken at the factory gate, the farm and the service provider’s invoice.",
    how: "Statistical agencies collect selling prices from a sample of producers each month and weight them by the value of what each industry sells. The United States index is organised by who buys the output: final demand, and the intermediate stages that feed it. Core versions leave out food and energy.",
    why: "Producers’ prices are one of the costs that can later reach consumers, so the release is read for pressure further up the supply chain. Several of its components are also used to estimate the inflation measure the Federal Reserve follows, which gives it a second audience.",
    misread: "It is not next month’s consumer price index. The two cover different things: producer prices include goods sold to other businesses, to government and for export, and leave out imports and sales taxes. A rise in producers’ prices may be absorbed in margins and never reach the shelf, and the two indices can move apart for long periods.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "i:xau-usd", "i:us500"],
    publishers: [
      { area: "United States", body: "Bureau of Labor Statistics", url: "https://www.bls.gov/ppi/" },
      { area: "Euro area", body: "Eurostat", url: "https://ec.europa.eu/eurostat/web/short-term-business-statistics" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/inflationandpriceindices" },
    ],
    cadence: "Monthly",
    related: ["ev:cpi", "ev:pce-price-index", "c:inflation"],
  },
  {
    slug: "pce-price-index",
    name: "Personal Consumption Expenditures Price Index",
    short: "PCE",
    kind: "Inflation",
    what: "A measure of the prices of the goods and services consumed by households in the United States, or bought on their behalf. The core version, which leaves out food and energy, is the one most quoted.",
    how: "The Bureau of Economic Analysis publishes it within its monthly report on personal income and outlays. Most of the prices come from the consumer and producer price indices; what differs is the scope and the weights. It counts spending made for households by employers and government, such as health care, and its weights shift as people change what they buy.",
    why: "The Federal Reserve states its inflation objective in terms of this index, not the consumer price index. A reading is therefore set directly against the central bank’s own goal.",
    misread: "It is rarely a surprise in the way the consumer price index can be. It is published later in the month, after the two releases that supply most of its prices, so much of it can be estimated beforehand. It also need not match the consumer price index: health care weighs more in it and housing less, and the two have differed persistently.",
    watchedBy: ["ccy:USD", "i:eur-usd", "i:xau-usd", "i:us500", "i:us100"],
    publishers: [{ area: "United States", body: "Bureau of Economic Analysis", url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index" }],
    cadence: "Monthly, within the personal income and outlays report",
    related: ["cb:fed", "ev:cpi", "ev:ppi", "c:inflation", "c:real-yields"],
  },
  {
    slug: "ism-manufacturing",
    name: "ISM Manufacturing PMI",
    short: "ISM manufacturing",
    phrase: "the ISM Manufacturing PMI",
    kind: "Survey",
    what: "The headline of the Institute for Supply Management’s monthly survey of purchasing and supply executives at United States manufacturers. It is the oldest of the purchasing managers’ surveys.",
    how: "Executives are asked whether each of several things was higher, lower or the same as the month before. Each answer set becomes a diffusion index, and the headline is the equal-weighted average of five of them: new orders, production, employment, supplier deliveries and inventories. A reading above 50 means more respondents reported an increase than a decrease.",
    why: "It is published at the very start of the month, before any official figure for the month just ended. Beyond the headline, the new orders index is read as the forward-looking part, the prices index for cost pressure and the employment index ahead of the official jobs report.",
    misread: "A diffusion index measures how widespread a change is, not how large. A reading just above 50 says slightly more firms reported an increase than a decrease; it does not say output grew by a small amount. The 50 line is about manufacturing alone, which is a modest share of the United States economy, and the survey published under a similar name by S&P Global asks a different panel and can point the other way.",
    watchedBy: ["ccy:USD", "i:us30", "i:us500", "i:eur-usd", "i:xau-usd"],
    publishers: [{ area: "United States", body: "Institute for Supply Management", url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/" }],
    cadence: "Monthly, on the first business day",
    related: ["ev:pmi", "ev:ism-services", "ev:flash-pmi", "c:recession"],
  },
  {
    slug: "ism-services",
    name: "ISM Services PMI",
    short: "ISM services",
    phrase: "the ISM Services PMI",
    kind: "Survey",
    what: "The headline of the Institute for Supply Management’s monthly survey of purchasing and supply executives outside manufacturing: retail, health care, finance, transport, construction and the rest. Services make up most of the United States economy.",
    how: "The method is that of the manufacturing survey. The headline is the equal-weighted average of four diffusion indices: business activity, new orders, employment and supplier deliveries. A reading above 50 means more respondents reported an increase than a decrease.",
    why: "It covers the larger part of the economy and follows the manufacturing survey by a few days. Its prices index is read for inflation in services, which tends to change more slowly than the price of goods, and its employment index ahead of the official jobs report.",
    misread: "The supplier deliveries index is inverted: slower deliveries raise it, because in ordinary times they are a sign of strong demand. When deliveries slow because supply is disrupted, the headline rises for a reason that is not good news. Older commentary calls the survey “non-manufacturing”, which was its name before it was changed.",
    watchedBy: ["ccy:USD", "i:us500", "i:us100", "i:eur-usd", "i:usd-jpy"],
    publishers: [{ area: "United States", body: "Institute for Supply Management", url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/" }],
    cadence: "Monthly, on the third business day",
    related: ["ev:pmi", "ev:ism-manufacturing", "c:inflation"],
  },
  {
    slug: "consumer-confidence",
    name: "Consumer Confidence Surveys",
    short: "Consumer confidence",
    kind: "Survey",
    what: "Regular surveys that ask households how they judge their own finances, the job market and the economy, now and in the months ahead, and turn the answers into an index.",
    how: "A sample of households answers a fixed set of questions. The share giving unfavourable answers is set against the share giving favourable ones, and the result is expressed as an index against a base period or as a balance. Most surveys publish a present-conditions part and an expectations part, and some also ask what inflation people expect.",
    why: "Household spending is the largest part of most economies, and the surveys arrive before spending figures do. The expectations part and the inflation expectations are followed by central banks, which watch whether people still expect inflation to stay low.",
    misread: "What people say and what they then spend can differ for long periods. Samples are small, preliminary readings are revised, and answers have been shown to follow the price of petrol, the stock market and the respondent’s politics. The best-known United States surveys are separate pieces of work and regularly disagree with each other.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "i:us500", "i:us30"],
    publishers: [
      { area: "United States", body: "The Conference Board", url: "https://www.conference-board.org/topics/consumer-confidence" },
      { area: "United States", body: "University of Michigan, Surveys of Consumers", url: "https://www.sca.isr.umich.edu/" },
      { area: "Euro area", body: "European Commission", url: "https://economy-finance.ec.europa.eu/economic-forecast-and-surveys/business-and-consumer-surveys_en" },
    ],
    cadence: "Monthly; some surveys publish a preliminary reading first",
    related: ["ev:retail-sales", "c:sentiment", "c:inflation", "c:recession"],
  },
  {
    slug: "industrial-production",
    name: "Industrial Production Index",
    short: "Industrial production",
    kind: "Growth",
    what: "A measure of the volume of output from factories, mines and utilities, expressed as an index against a base period. It counts physical output, not the money received for it.",
    how: "The compiler gathers output figures industry by industry, in physical units where they exist and estimated from hours worked or materials used where they do not, and weights each industry by its share of value added. The United States release also reports capacity utilisation: output as a share of what plants could sustainably produce.",
    why: "Industry is the part of the economy that swings most over a business cycle, so the index is used to date turning points. Capacity utilisation is read for how much room there is before production runs into limits.",
    misread: "In an economy made mostly of services it describes a minority of activity. Utilities’ output moves with the weather, so a cold or mild month can shift the total without anything changing in industry; the manufacturing line is the cleaner reading. Monthly figures, the euro area’s especially, are volatile and often revised.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:JPY", "i:de40", "i:brent"],
    publishers: [
      { area: "United States", body: "Federal Reserve", url: "https://www.federalreserve.gov/releases/g17/" },
      { area: "Euro area", body: "Eurostat", url: "https://ec.europa.eu/eurostat/web/short-term-business-statistics" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/economicoutputandproductivity/output" },
    ],
    cadence: "Monthly",
    related: ["ev:gdp", "ev:pmi", "c:recession"],
  },
  {
    slug: "trade-balance",
    name: "Trade Balance",
    short: "Trade balance",
    kind: "Trade",
    what: "The value of what an economy exports minus the value of what it imports over a period. A surplus means exports were larger; a deficit means imports were.",
    how: "Trade in goods is compiled mainly from customs declarations, and trade in services from surveys of businesses. Some releases cover goods only and some cover both, which is the first thing to check when two figures differ.",
    why: "Exports are sold for the exporter’s currency and imports are paid for in someone else’s, so trade is one of the lasting sources of demand for a currency. For economies that sell commodities, the balance follows the prices of what they export.",
    misread: "A deficit is not a loss and a surplus is not a profit. A deficit can narrow because a weak economy is importing less, which is no sign of health. The figures are in money, not volume, so a change in the price of oil moves the balance although the same number of barrels crossed the border. Trade is also only one part of the flows through a currency, and usually the smaller part.",
    watchedBy: ["ccy:USD", "ccy:JPY", "ccy:AUD", "ccy:CAD", "ccy:EUR"],
    publishers: [
      { area: "United States", body: "US Census Bureau", url: "https://www.census.gov/foreign-trade/index.html" },
      { area: "Euro area", body: "Eurostat", url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods" },
      { area: "Japan", body: "Ministry of Finance", url: "https://www.customs.go.jp/toukei/info/index_e.htm" },
    ],
    cadence: "Monthly",
    related: ["ev:current-account", "ev:gdp", "c:balance-of-payments", "c:commodity-currencies"],
  },
  {
    slug: "current-account",
    name: "Current Account",
    short: "Current account",
    kind: "Trade",
    what: "The broadest record of an economy’s dealings with the rest of the world in a period: trade in goods and services, plus income earned on investments and work abroad less the same paid to foreigners, plus transfers such as remittances and aid.",
    how: "It is one of the accounts of the balance of payments, compiled by the statistical agency or the central bank from customs data, surveys of companies and banks, and estimates. By construction it is mirrored by the financial account: an economy with a current account deficit is, in the same period, borrowing from abroad or selling assets to foreigners.",
    why: "It shows whether an economy as a whole is spending more than it earns, and so whether it depends on money arriving from abroad. That dependence is watched most closely when investors are cautious, and for emerging-market currencies.",
    misread: "A deficit is not a debt falling due, and it can persist for decades while foreigners are willing to finance it. Nor is a surplus a sign of strength in every case: it can reflect weak spending at home. The account is slow-moving and heavily revised, so a single release seldom carries new information; it is a description of structure, not an event.",
    watchedBy: ["ccy:USD", "ccy:JPY", "ccy:EUR", "ccy:GBP", "ccy:AUD", "ccy:NZD"],
    publishers: [
      { area: "United States", body: "Bureau of Economic Analysis", url: "https://www.bea.gov/data/intl-trade-investment/international-transactions" },
      { area: "Euro area", body: "European Central Bank", url: "https://www.ecb.europa.eu/stats/balance_of_payments_and_external/balance_of_payments/html/index.en.html" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/nationalaccounts/balanceofpayments" },
    ],
    cadence: "Quarterly in most economies; monthly in some",
    related: ["ev:trade-balance", "c:balance-of-payments", "c:safe-haven"],
  },
  {
    slug: "housing-starts",
    name: "Housing Starts and Building Permits",
    short: "Housing starts",
    kind: "Housing",
    what: "Two counts from one United States report on new homes: building permits, the number of homes that local authorities authorised in the month, and housing starts, the number on which construction began.",
    how: "The Census Bureau, with the Department of Housing and Urban Development, surveys permit-issuing offices and a sample of building sites. A start is counted when excavation for the foundation begins. Both are published as seasonally adjusted annual rates, and split between single-family houses and buildings with several homes.",
    why: "Housing is the part of the economy most sensitive to interest rates, because nearly every purchase is financed with a loan. Permits come before starts and are read as the more forward-looking of the two.",
    misread: "The month-to-month change is often smaller than the survey’s own margin of error, which the Census Bureau prints beside each figure; a headline change may not be distinguishable from none. Apartment buildings arrive in lumps and swing the total, so the single-family line is steadier. Weather moves starts in winter. An annual rate is the month’s pace multiplied up, not a count of homes built in a year.",
    watchedBy: ["ccy:USD", "i:us500", "i:us30"],
    publishers: [{ area: "United States", body: "US Census Bureau", url: "https://www.census.gov/construction/nrc/index.html" }],
    cadence: "Monthly",
    related: ["cb:fed", "ev:interest-rate-decision", "c:monetary-policy", "c:recession"],
  },
  {
    slug: "durable-goods-orders",
    name: "Durable Goods Orders",
    short: "Durable goods",
    kind: "Growth",
    what: "The value of new orders placed with United States manufacturers for goods meant to last three years or more: machinery, vehicles, aircraft, computers, appliances.",
    how: "The Census Bureau surveys manufacturers each month about their shipments, inventories and new orders, and publishes an advance report for durable goods ahead of the full report on factory orders. The figures are in dollars and are not adjusted for price changes.",
    why: "An order placed now is production later, so orders are read as a leading indication of factory output. One line, orders for capital goods excluding defence and aircraft, is followed as a guide to what businesses are investing in equipment.",
    misread: "The headline is dominated by aircraft. A single large order for airliners can swing the total by more than everything else combined, and be reversed the next month, which is why the figure excluding transport is the one usually discussed. Because the values are not adjusted for prices, orders can rise when only prices have. The advance figures are revised in the full report.",
    watchedBy: ["ccy:USD", "i:us30", "i:us500"],
    publishers: [{ area: "United States", body: "US Census Bureau", url: "https://www.census.gov/manufacturing/m3/index.html" }],
    cadence: "Monthly",
    related: ["ev:industrial-production", "ev:ism-manufacturing", "ev:gdp"],
  },
  {
    slug: "jobless-claims",
    name: "Initial Jobless Claims",
    short: "Jobless claims",
    kind: "Employment",
    what: "The number of people in the United States who filed a new claim for unemployment insurance in the past week. The same report gives continuing claims: the number still receiving benefits, reported a week further behind.",
    how: "The Department of Labor adds up the claims recorded by each state’s unemployment insurance office. It is a count from administrative records, not a survey, and it is adjusted for the season. A four-week average is published beside the weekly figure.",
    why: "It is the most frequent official reading of the United States labour market, and one of the few that is weekly. A sustained rise in new claims has historically accompanied the start of a downturn, and continuing claims show how quickly those who lose a job find another.",
    misread: "One week proves very little. Public holidays, storms, school calendars and annual factory shutdowns all move the count, and the seasonal adjustment struggles around them, which is the reason the four-week average exists. Claims also count only those who are eligible and apply: many people who lose work never file.",
    watchedBy: ["ccy:USD", "i:eur-usd", "i:usd-jpy", "i:xau-usd"],
    publishers: [{ area: "United States", body: "US Department of Labor", url: "https://oui.doleta.gov/unemploy/claims.asp" }],
    cadence: "Weekly, usually on Thursday",
    related: ["ev:non-farm-payrolls", "ev:unemployment-rate", "c:recession"],
  },
  {
    slug: "adp-employment",
    name: "ADP National Employment Report",
    short: "ADP",
    kind: "Employment",
    what: "A monthly estimate of the change in private-sector employment in the United States, produced by the payroll company ADP from its own records. It is a private measure, not an official statistic.",
    how: "ADP processes pay for a large share of American private employers. Its research arm counts the employees on those payrolls, anonymised, and weights the result to represent private employment as a whole. The report also gives a measure of pay for people who stayed in their jobs and for those who changed.",
    why: "It is usually published two days before the official employment report and is drawn from actual payroll records, where the official figure comes from a survey. It is read as a second opinion on hiring, and its pay figures for their own sake.",
    misread: "It is not a preview of the official payroll figure. The two measure private employment by different methods, on different samples, and have differed widely in individual months, in both directions. ADP has said that its report is meant to stand as an independent measure and not as a forecast of the government’s. It also leaves out government jobs, which the official total includes.",
    watchedBy: ["ccy:USD", "i:eur-usd", "i:usd-jpy", "i:xau-usd"],
    publishers: [{ area: "United States", body: "ADP Research", url: "https://adpemploymentreport.com/" }],
    cadence: "Monthly, usually two days before the official employment report",
    related: ["ev:non-farm-payrolls", "ev:jobless-claims", "ev:average-earnings"],
  },
  {
    slug: "average-earnings",
    name: "Average Earnings",
    short: "Wage growth",
    kind: "Employment",
    what: "Measures of how much employees are paid on average, and how fast that is changing. In the United States the usual reference is average hourly earnings; in the United Kingdom, average weekly earnings.",
    how: "Most are an average in the plain sense: the total paid, from a survey of employers’ payrolls, divided by the hours worked or the number of employees. The United Kingdom publishes pay with and without bonuses, averaged over three months. The United States also publishes a quarterly Employment Cost Index, which holds the mix of jobs fixed.",
    why: "Pay is the largest cost for most businesses and the main income of most households, so it bears on both inflation and spending. Central banks watch it for signs that price rises are feeding into wages and back again.",
    misread: "An average can rise without anyone receiving a rise. If lower-paid workers lose their jobs, those remaining are better paid on average, and the figure goes up while the labour market weakens; when they are hired back it falls. That is the difference between an average and an index that fixes the mix of jobs. The figures are also in money terms: pay that rises more slowly than prices buys less.",
    watchedBy: ["ccy:USD", "ccy:GBP", "i:gbp-usd", "i:eur-usd", "i:xau-usd"],
    publishers: [
      { area: "United States", body: "Bureau of Labor Statistics", url: "https://www.bls.gov/ces/" },
      { area: "United Kingdom", body: "Office for National Statistics", url: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours" },
    ],
    cadence: "Monthly",
    related: ["ev:non-farm-payrolls", "ev:unemployment-rate", "ev:cpi", "c:inflation"],
  },
  {
    slug: "central-bank-minutes",
    name: "Central Bank Minutes",
    short: "Minutes",
    kind: "Monetary policy",
    what: "The written record of a central bank’s policy meeting, published after the decision. It sets out what the committee discussed, the arguments on each side and, at most banks, how the members voted.",
    how: "Staff draft the record and the committee approves it before it is published. Practice differs: the Federal Reserve and the Reserve Bank of Australia publish some weeks after the meeting, the Bank of England with the decision itself, the European Central Bank an “account” about a month later, and the Bank of Japan a short summary of opinions first and full minutes after its next meeting.",
    why: "A decision gives the outcome; the minutes give the reasoning and the range of views behind it. They are read for how close the vote was, which risks the committee weighed, and what its members said would have to change before policy does.",
    misread: "Minutes are old by the time they appear. They record what was said at a meeting weeks earlier, and data published since may have overtaken it. They are also an edited document, not a transcript: the wording is chosen with care, and counting words such as “some”, “several” and “most” are used deliberately. A view recorded in the minutes is one member’s, or a few members’, not a commitment by the bank.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "ccy:JPY", "ccy:AUD", "i:xau-usd"],
    publishers: [
      { area: "United States", body: "Federal Reserve", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { area: "Euro area", body: "European Central Bank", url: "https://www.ecb.europa.eu/press/accounts/html/index.en.html" },
      { area: "United Kingdom", body: "Bank of England", url: "https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/monetary-policy-summary-and-minutes" },
      { area: "Japan", body: "Bank of Japan", url: "https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm" },
      { area: "Australia", body: "Reserve Bank of Australia", url: "https://www.rba.gov.au/monetary-policy/rba-board-minutes/" },
    ],
    cadence: "After each policy meeting; the delay differs by bank",
    related: ["ev:interest-rate-decision", "ev:press-conference", "c:monetary-policy", "c:hawkish", "c:dovish"],
  },
  {
    slug: "press-conference",
    name: "Central Bank Press Conferences",
    short: "Press conference",
    kind: "Monetary policy",
    what: "The session after a policy decision at which the head of a central bank reads a statement and answers journalists’ questions. It is the main occasion for forward guidance: what the bank chooses to say about the likely course of its policy.",
    how: "The statement is prepared and agreed; the answers are not. Guidance takes three broad forms: tied to time (“for an extended period”), tied to conditions (until inflation or employment reaches a stated point), or left open (“meeting by meeting”, “dependent on the data”). Some banks also publish their members’ or their own projections for the policy rate.",
    why: "Markets price not only the rate set today but the path expected from here, and the press conference is where that expectation is most directly addressed. Readers compare the new statement with the last one word for word, and listen to the answers for emphasis.",
    misread: "Guidance is a conditional statement, not a promise. It describes what the bank expects to do if the economy develops as it expects, and banks have departed from their guidance when it did not. The first move in a market during a press conference is also frequently reversed before the session ends, as later answers qualify earlier ones. A projection of future rates is a set of individual forecasts, not a plan.",
    watchedBy: ["ccy:USD", "ccy:EUR", "ccy:GBP", "ccy:JPY", "i:xau-usd", "i:us100"],
    publishers: [
      { area: "United States", body: "Federal Reserve", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { area: "Euro area", body: "European Central Bank", url: "https://www.ecb.europa.eu/press/press_conference/html/index.en.html" },
      { area: "United Kingdom", body: "Bank of England", url: "https://www.bankofengland.co.uk/monetary-policy-report/monetary-policy-report" },
    ],
    cadence: "After each scheduled decision at some banks; only with a quarterly report at others",
    related: ["ev:interest-rate-decision", "ev:central-bank-minutes", "c:monetary-policy", "c:hawkish", "c:dovish", "c:volatility"],
  },
  {
    slug: "flash-pmi",
    name: "Flash Purchasing Managers’ Indices",
    short: "Flash PMI",
    kind: "Survey",
    what: "Early estimates of the monthly purchasing managers’ indices, published about a week before the month ends and based on the replies received so far.",
    how: "S&P Global compiles them from most, but not all, of the month’s survey responses, for the larger economies it covers: among them the euro area, Germany, France, the United Kingdom, the United States, Japan and Australia. The final indices follow at the start of the next month. As with any such index, a reading above 50 means more firms reported an increase than a decrease.",
    why: "They are the first broad evidence of how a month went, published while it is still going on, and they come out across Asia, Europe and the United States on the same day, which makes them easy to compare.",
    misread: "A flash is an estimate, and the final figure can differ. The S&P Global survey for the United States is not the ISM survey: the panels and the questions differ, and the two have disagreed about direction. The surveys record how many firms saw a change, not how big it was, and the names of sponsoring banks in their titles change from time to time without the survey changing.",
    watchedBy: ["ccy:EUR", "ccy:GBP", "ccy:USD", "ccy:JPY", "ccy:AUD", "i:de40", "i:uk100"],
    publishers: [{ area: "Global", body: "S&P Global", url: "https://www.pmi.spglobal.com/" }],
    cadence: "Monthly, about a week before the end of the month",
    related: ["ev:pmi", "ev:ism-manufacturing", "ev:gdp", "c:recession"],
  },
  {
    slug: "tankan",
    name: "Tankan Survey",
    short: "Tankan",
    phrase: "the Tankan survey",
    kind: "Survey",
    what: "The Bank of Japan’s quarterly survey of business conditions, formally the Short-Term Economic Survey of Enterprises in Japan. It asks a very large sample of companies how business is and how they expect it to be.",
    how: "Companies of every size answer whether conditions are favourable, not so favourable or unfavourable. The diffusion index is the share answering favourable minus the share answering unfavourable, so zero is the neutral line. Results are given by size of company and by manufacturing and non-manufacturing; the figure most quoted is for large manufacturers. The survey also collects plans for investment, the exchange rate companies have assumed in their budgets, and their outlook for prices.",
    why: "It is conducted by the central bank itself, has a very high response rate and feeds directly into the Bank of Japan’s assessment of the economy. Companies’ investment plans and their expectations for prices are read alongside the bank’s own outlook.",
    misread: "Zero is neutral here, not 50, so its readings cannot be set beside a purchasing managers’ index. Investment plans follow a known pattern through Japan’s financial year, typically starting cautious and being revised as the year goes on, so a plan is compared with the same survey a year earlier, not with the previous quarter. The exchange rate companies report is the one they budgeted on, not a forecast.",
    watchedBy: ["ccy:JPY", "i:usd-jpy", "i:eur-jpy", "i:gbp-jpy", "i:jp225"],
    publishers: [{ area: "Japan", body: "Bank of Japan", url: "https://www.boj.or.jp/en/statistics/tk/index.htm" }],
    cadence: "Quarterly",
    related: ["cb:boj", "ev:pmi", "ev:interest-rate-decision", "c:sentiment"],
  },
  {
    slug: "zew-ifo",
    name: "ZEW and ifo Surveys",
    short: "ZEW / ifo",
    phrase: "the ZEW and ifo surveys",
    kind: "Survey",
    what: "Germany’s two best-known monthly sentiment surveys. The ZEW Indicator of Economic Sentiment asks financial analysts and investors what they expect; the ifo Business Climate Index asks companies how business is and how they expect it to be.",
    how: "ZEW, a research institute in Mannheim, asks financial market experts whether they expect the economy to improve or worsen over the next six months; the indicator is the share of optimists minus the share of pessimists, with zero as neutral. The ifo Institute in Munich asks several thousand firms in manufacturing, services, trade and construction to assess their current situation and their expectations for six months ahead; the business climate is an average of the two, published as an index against a base year.",
    why: "Germany is the largest economy in the euro area and a large exporter, so its surveys are read for the region as well as the country. They arrive in the second half of each month, ZEW first, before most official figures for that month.",
    misread: "The two are not versions of one thing. ZEW polls people who watch markets, so its expectations often echo what share prices and the news did in the previous weeks; ifo polls the firms themselves. Their scales also differ: one is a balance around zero, the other an index around a base level, so the numbers cannot be compared. Both describe Germany, not the euro area.",
    watchedBy: ["ccy:EUR", "i:eur-usd", "i:eur-gbp", "i:eur-jpy", "i:de40"],
    publishers: [
      { area: "Germany", body: "ZEW – Leibniz Centre for European Economic Research", url: "https://www.zew.de/en/press/economic-sentiment" },
      { area: "Germany", body: "ifo Institute", url: "https://www.ifo.de/en/survey/ifo-business-climate-index-germany" },
    ],
    cadence: "Monthly, each on its own day",
    related: ["cb:ecb", "ev:pmi", "ev:flash-pmi", "c:sentiment"],
  },
  {
    slug: "caixin-pmi",
    name: "China Purchasing Managers’ Indices",
    short: "Caixin PMI",
    phrase: "the Chinese purchasing managers’ indices",
    kind: "Survey",
    what: "Two monthly sets of purchasing managers’ indices for China: the official one, from the National Bureau of Statistics, and a private one compiled by S&P Global, known for many years as the Caixin PMI after the media group that sponsored it.",
    how: "Both ask purchasing managers whether orders, output, employment, delivery times and stocks rose or fell, and both read above 50 when more firms report an increase than a decrease. The official survey has the larger panel, weighted towards large and state-owned companies. The private survey has a smaller panel with more small, private and export-oriented firms. Each publishes a manufacturing index and a services or non-manufacturing index.",
    why: "China is the largest buyer of many raw materials and a principal market for its neighbours, so its surveys are read well beyond the yuan: for the Australian and New Zealand dollars, for metals and oil, and for exporters elsewhere in Asia and in Europe.",
    misread: "When the two disagree it is usually because they ask different firms, not because one of them is wrong. Readings for the first months of the year are distorted by the Lunar New Year holiday, whose date moves. And the private survey’s title follows its sponsor: it carried another bank’s name before Caixin’s, and the name has changed again since, so the same series appears in commentary under several names.",
    watchedBy: ["ccy:AUD", "ccy:NZD", "i:aud-usd", "i:nzd-usd", "i:brent", "i:xag-usd"],
    publishers: [
      { area: "China", body: "National Bureau of Statistics of China", url: "https://www.stats.gov.cn/english/" },
      { area: "Global", body: "S&P Global", url: "https://www.pmi.spglobal.com/" },
    ],
    cadence: "Monthly",
    related: ["cb:pboc", "ev:pmi", "ev:flash-pmi", "c:commodity-currencies"],
  },
  {
    slug: "eia-crude-inventories",
    name: "EIA Crude Oil Inventories",
    short: "EIA",
    kind: "Energy",
    what: "The weekly change in the amount of crude oil held in commercial storage in the United States, from the Energy Information Administration’s Weekly Petroleum Status Report.",
    how: "The Administration, the statistical agency of the Department of Energy, surveys refineries, storage terminals and pipeline companies every week; replying is compulsory. The report gives stocks of crude oil, petrol and distillate fuels, refinery activity, imports, exports and an estimate of production, with a separate figure for the storage hub at Cushing, Oklahoma, where the benchmark United States futures contract is delivered. Commercial stocks leave out the government’s strategic reserve.",
    why: "Stocks rise when more oil is supplied than used and fall when less is, so the weekly change is the most frequent official evidence of that balance in the largest oil-consuming country. An industry group, the American Petroleum Institute, circulates its own estimate the evening before.",
    misread: "A rise or fall means little without the season: stocks build and draw in a regular annual pattern, and a change is judged against what is usual for the week. One week’s figure is also swung by the timing of a few tankers arriving or leaving. The weekly numbers are estimates and are revised in the Administration’s monthly data. Natural gas has a separate weekly storage report, on a different day.",
    watchedBy: ["i:wti", "i:brent", "i:natural-gas", "ccy:CAD", "i:usd-cad"],
    publishers: [{ area: "United States", body: "US Energy Information Administration", url: "https://www.eia.gov/petroleum/supply/weekly/" }],
    cadence: "Weekly, usually on Wednesday",
    related: ["ac:energy", "ev:trade-balance", "c:volatility"],
  },
];

export const getCurrency = (code: string) => currencies.find((c) => c.code === code);
export const getBank = (slug: string) => centralBanks.find((b) => b.slug === slug);
export const getEvent = (slug: string) => econEvents.find((e) => e.slug === slug);
