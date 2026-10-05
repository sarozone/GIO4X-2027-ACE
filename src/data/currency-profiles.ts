/**
 * Currency profiles: one page for each currency a reader is likely to meet.
 *
 * GENERAL EDUCATION. The first eight are the currencies of the pairs GIO4X
 * lists (see src/data/instruments.ts); which pairs contain a currency is
 * computed from that file here and written nowhere by hand, so the two cannot
 * disagree. The other eight are widely followed currencies that are NOT in any
 * GIO4X instrument, and their pages say so.
 *
 * The rule this file keeps: no exchange rates, no interest rates, no
 * statistics, no rankings, no forecasts. Only durable, widely known facts: who
 * issues the currency, how it is commonly described (descriptions people use,
 * not promises about how it will behave), what typically moves it (explanatory,
 * never predictive), which scheduled releases are read for it and who publishes
 * them, and a short history. The issuer links to its Central Bank Watch page
 * when src/data/knowledge.ts has one, and a release links to its Economic
 * Events explainer when one exists; neither link is written by hand.
 */
import { instruments, type Instrument } from "@/data/instruments";
import { centralBanks, getEvent, type CentralBank, type EconEvent } from "@/data/knowledge";

export const CURRENCY_KINDS = ["Reserve currency", "Safe haven", "Commodity-linked", "Funding currency", "Risk-sensitive", "Emerging market", "Managed or pegged"] as const;
export type CurrencyKind = (typeof CURRENCY_KINDS)[number];

/** What each description means when people use it. A description, never a promise. */
export const CURRENCY_KIND_NOTES: Record<CurrencyKind, string> = {
  "Reserve currency": "Held in quantity by central banks and governments as part of their foreign reserves.",
  "Safe haven": "Commonly bought when investors are cautious. The label describes past behaviour; it does not say what happens next time.",
  "Commodity-linked": "Issued by an economy whose exports are led by raw materials, so it is often read beside their prices.",
  "Funding currency": "Often borrowed, when its interest rates are low, to hold assets that pay more elsewhere.",
  "Risk-sensitive": "Commonly rises when investors are confident and falls when they are cautious.",
  "Emerging market": "Issued by a developing economy; usually a thinner market, with wider spreads and larger swings.",
  "Managed or pegged": "Its exchange rate is steered or fixed by the authorities and does not float freely.",
};

/** A scheduled release read for a currency or an economy. `event` is the slug of the site's explainer, where there is one. */
export type Release = { name: string; by: string; event?: string };

export type CurrencyProfile = {
  /** ISO 4217 code */
  code: string;
  name: string;
  symbol: string;
  /** what people call it */
  nicknames: string[];
  /** where it is used */
  area: string;
  /** what it is, in two or three plain sentences */
  is: string;
  /** the central bank or authority that issues it */
  issuer: string;
  /** one or two sentences about the issuer and how the currency is run */
  issuerNote: string;
  /** how it is commonly described */
  kinds: CurrencyKind[];
  /** why people describe it so */
  kindsNote: string;
  /** what typically moves it: explanatory, never predictive */
  drivers: string[];
  /** the scheduled releases to know, with who publishes each */
  releases: Release[];
  /** the trading session in which its home business day falls */
  session: string;
  sessionNote: string;
  /** durable, well-known facts only: no exchange rates */
  history: string;
};

export const CURRENCY_PROFILES: readonly CurrencyProfile[] = [
  // ── the currencies of the GIO4X pairs ────────────────────────────────────
  {
    code: "USD",
    name: "US dollar",
    symbol: "$",
    nicknames: ["dollar", "greenback", "buck"],
    area: "United States",
    is: "The currency of the United States and the one most used between countries. Most commodities are priced in it, a large part of world trade is invoiced in it, and it is one side of most foreign-exchange transactions.",
    issuer: "Federal Reserve",
    issuerNote: "The Federal Reserve System is the central bank of the United States. Its notes are the paper dollar, and its Federal Open Market Committee sets monetary policy.",
    kinds: ["Reserve currency", "Safe haven"],
    kindsNote: "The dollar is the main currency in which central banks hold their reserves, and the market for US government debt is deep enough for large holders to move in and out of. In periods of stress, demand for dollars has often risen for the same reason.",
    drivers: [
      "Federal Reserve policy, and what the market expects the Fed to do next",
      "US releases on employment and inflation, the two halves of the Fed’s mandate",
      "Yields on US Treasury securities compared with yields elsewhere",
      "Risk appetite: caution in world markets has often meant demand for dollars",
      "Its use in pricing commodities and settling trade, which creates demand unrelated to the US economy itself",
    ],
    releases: [
      { name: "Employment Situation report (Non-Farm Payrolls)", by: "Bureau of Labor Statistics", event: "non-farm-payrolls" },
      { name: "Consumer Price Index", by: "Bureau of Labor Statistics", event: "cpi" },
      { name: "Federal Open Market Committee decision", by: "Federal Reserve", event: "interest-rate-decision" },
      { name: "Gross Domestic Product", by: "Bureau of Economic Analysis", event: "gdp" },
      { name: "Retail sales", by: "US Census Bureau", event: "retail-sales" },
      { name: "ISM Report On Business (manufacturing and services PMI)", by: "Institute for Supply Management", event: "pmi" },
    ],
    session: "New York",
    sessionNote: "The dollar trades around the clock because it is in most pairs. Its own data and the Fed’s announcements arrive in the New York morning and afternoon, and the hours when London and New York are both open are usually the busiest of the day.",
    history: "The dollar was established as the unit of the United States by the Coinage Act of 1792. The Federal Reserve was created in 1913. Under the Bretton Woods agreement of 1944 other currencies were fixed to the dollar and the dollar to gold; the United States ended that link to gold in 1971, and the major currencies have floated against one another since 1973.",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    nicknames: ["euro", "single currency"],
    area: "Euro area",
    is: "The shared currency of the European Union member states that have adopted it, together called the euro area. One central bank sets one monetary policy for all of them, while each government keeps its own budget.",
    issuer: "European Central Bank",
    issuerNote: "The European Central Bank in Frankfurt and the national central banks of the euro area countries form the Eurosystem, which issues the euro. Policy is set by the ECB’s Governing Council.",
    kinds: ["Reserve currency"],
    kindsNote: "The euro is widely held in official reserves and widely used to invoice trade and issue debt, particularly in and around Europe.",
    drivers: [
      "European Central Bank policy, and how it compares with policy in the United States",
      "Inflation and growth across the euro area, with most attention on its larger economies",
      "The gap between the bond yields of different member governments, read as a measure of strain inside the union",
      "The cost of imported energy, on which much of the area depends",
      "Risk appetite and the general direction of the US dollar",
    ],
    releases: [
      { name: "Governing Council monetary policy decision", by: "European Central Bank", event: "interest-rate-decision" },
      { name: "Harmonised Index of Consumer Prices, including the flash estimate", by: "Eurostat", event: "cpi" },
      { name: "Gross Domestic Product", by: "Eurostat", event: "gdp" },
      { name: "Unemployment", by: "Eurostat", event: "unemployment-rate" },
      { name: "Purchasing managers’ surveys for the euro area and its members", by: "S&P Global", event: "pmi" },
      { name: "Ifo Business Climate Index for Germany", by: "ifo Institute", event: "zew-ifo" },
    ],
    session: "London",
    sessionNote: "The euro is busiest in European hours, from the Frankfurt and London mornings through the overlap with New York. Euro-area data are published in the European morning.",
    history: "The euro was introduced on 1 January 1999 as an accounting currency for eleven member states, whose national currencies were fixed to it. Notes and coins followed on 1 January 2002 and replaced, among others, the Deutsche Mark, the French franc and the Italian lira. More countries have adopted it since.",
  },
  {
    code: "GBP",
    name: "Pound sterling",
    symbol: "£",
    nicknames: ["sterling", "pound", "quid", "cable (the pair with the US dollar)"],
    area: "United Kingdom",
    is: "The currency of the United Kingdom, and the oldest currency still in use among the majors. London is one of the main centres of the foreign-exchange market, which keeps sterling prominent in it.",
    issuer: "Bank of England",
    issuerNote: "The Bank of England issues sterling notes in England and Wales and sets monetary policy for the whole United Kingdom through its Monetary Policy Committee. Certain banks in Scotland and Northern Ireland issue notes of their own under rules the Bank oversees.",
    kinds: ["Reserve currency"],
    kindsNote: "Sterling is one of the currencies held in official reserves and one of the five in the International Monetary Fund’s Special Drawing Right.",
    drivers: [
      "Bank of England policy, and how it compares with policy in the United States and the euro area",
      "UK inflation, wages and growth",
      "Government borrowing and the market for UK government bonds (gilts)",
      "The country’s reliance on money from abroad to fund what it imports",
      "Trade arrangements with the European Union, its largest trading partner",
    ],
    releases: [
      { name: "Monetary Policy Committee decision", by: "Bank of England", event: "interest-rate-decision" },
      { name: "Consumer price inflation", by: "Office for National Statistics", event: "cpi" },
      { name: "Labour market overview (employment, unemployment and pay)", by: "Office for National Statistics", event: "unemployment-rate" },
      { name: "Gross Domestic Product, monthly and quarterly", by: "Office for National Statistics", event: "gdp" },
      { name: "Retail sales", by: "Office for National Statistics", event: "retail-sales" },
      { name: "UK purchasing managers’ surveys", by: "S&P Global", event: "pmi" },
    ],
    session: "London",
    sessionNote: "Sterling is busiest in London hours and in the overlap with New York. UK data are usually published early in the London morning.",
    history: "Sterling has been in use for many centuries. Britain left the gold standard in 1931. The pound was decimalised in 1971, when one hundred new pence replaced shillings and old pence. In September 1992 sterling left the European Exchange Rate Mechanism, on the day remembered as Black Wednesday, and it has floated since. The Bank of England was given the power to set interest rates independently in 1997.",
  },
  {
    code: "JPY",
    name: "Japanese yen",
    symbol: "¥",
    nicknames: ["yen"],
    area: "Japan",
    is: "The currency of Japan. Yen pairs are quoted to two or three decimal places where most pairs use four or five, so one pip in a yen pair is 0.01.",
    issuer: "Bank of Japan",
    issuerNote: "The Bank of Japan issues the yen and sets monetary policy through its Policy Board. Decisions to buy or sell yen in the currency market are taken by the Ministry of Finance, and the Bank carries them out.",
    kinds: ["Reserve currency", "Safe haven", "Funding currency"],
    kindsNote: "Japanese interest rates were very low for decades, so the yen was often borrowed to hold assets that paid more elsewhere: the carry trade. When investors become cautious such positions tend to be closed, which means buying yen back, and that is one reason the yen is described as a safe haven. Japan also holds large assets abroad.",
    drivers: [
      "The gap between Japanese interest rates and those abroad, above all US rates",
      "Bank of Japan policy, and any change in its stance",
      "Risk appetite, through the opening and closing of carry trades",
      "The cost of imported energy and raw materials, nearly all of which Japan buys from abroad",
      "Statements by the Ministry of Finance about the currency, and intervention when it happens",
    ],
    releases: [
      { name: "Policy Board decision and the Outlook Report", by: "Bank of Japan", event: "interest-rate-decision" },
      { name: "Tankan survey of business conditions", by: "Bank of Japan", event: "tankan" },
      { name: "Consumer Price Index, national and for Tokyo", by: "Statistics Bureau of Japan", event: "cpi" },
      { name: "Gross Domestic Product", by: "Cabinet Office", event: "gdp" },
      { name: "Trade statistics", by: "Ministry of Finance", event: "trade-balance" },
    ],
    session: "Tokyo",
    sessionNote: "Japanese data and Bank of Japan decisions arrive in Tokyo hours. The yen is also heavily traded in London and New York, because its pair with the dollar responds to US interest rates.",
    history: "The yen was introduced in 1871, in the Meiji era, to replace a patchwork of older coinages. The Bank of Japan was founded in 1882. After the Second World War the yen was fixed to the US dollar; it has floated since 1973. In the Plaza Accord of 1985 the large economies agreed to act together to weaken the dollar, and the yen rose sharply in the years that followed.",
  },
  {
    code: "CHF",
    name: "Swiss franc",
    symbol: "Fr",
    nicknames: ["swissy", "franc"],
    area: "Switzerland and Liechtenstein",
    is: "The currency of Switzerland, also used in Liechtenstein. It belongs to a small, open and prosperous economy that sits in the middle of the euro area without being part of it.",
    issuer: "Swiss National Bank",
    issuerNote: "The Swiss National Bank issues the franc and sets monetary policy through its Governing Board. It has said many times that it is prepared to be active in the foreign-exchange market when it judges that necessary.",
    kinds: ["Safe haven", "Funding currency"],
    kindsNote: "Switzerland has a long record of low inflation, political stability and neutrality, and the franc has commonly been bought in periods of stress. Because Swiss interest rates have usually been low, it has also been used as a currency to borrow in.",
    drivers: [
      "Risk appetite: caution in world markets has often meant demand for francs",
      "Swiss National Bank policy, including its readiness to buy or sell foreign currency",
      "Conditions in the euro area, Switzerland’s main trading partner",
      "The gap between Swiss interest rates and those abroad",
    ],
    releases: [
      { name: "Monetary policy assessment", by: "Swiss National Bank", event: "interest-rate-decision" },
      { name: "Consumer Price Index", by: "Federal Statistical Office", event: "cpi" },
      { name: "Gross Domestic Product", by: "State Secretariat for Economic Affairs (SECO)", event: "gdp" },
      { name: "KOF Economic Barometer", by: "KOF Swiss Economic Institute, ETH Zurich" },
    ],
    session: "London",
    sessionNote: "The franc is busiest in European hours. Swiss data and the National Bank’s announcements arrive in the Zurich morning.",
    history: "The franc became the single currency of Switzerland in 1850, after the federal constitution of 1848, replacing the coinages of the cantons. The Swiss National Bank began operating in 1907. In September 2011 it set a minimum exchange rate for the franc against the euro, and it ended that policy without warning in January 2015, a day of very large moves in franc pairs.",
  },
  {
    code: "AUD",
    name: "Australian dollar",
    symbol: "A$",
    nicknames: ["aussie"],
    area: "Australia",
    is: "The currency of Australia, a large exporter of iron ore, coal, natural gas and farm produce. It is traded far more widely than the size of the economy alone would suggest.",
    issuer: "Reserve Bank of Australia",
    issuerNote: "The Reserve Bank of Australia issues the Australian dollar and sets the cash rate target.",
    kinds: ["Commodity-linked", "Risk-sensitive"],
    kindsNote: "Raw materials lead Australia’s exports, and much of what it sells goes to China and the rest of Asia. The currency is therefore often read beside commodity prices and beside the general mood of world markets.",
    drivers: [
      "Prices of Australia’s main exports, iron ore, coal and natural gas among them",
      "Demand from China and the rest of Asia",
      "Reserve Bank of Australia policy, and the gap between Australian and US interest rates",
      "Risk appetite in world markets",
    ],
    releases: [
      { name: "Monetary policy decision and the Statement on Monetary Policy", by: "Reserve Bank of Australia", event: "interest-rate-decision" },
      { name: "Labour Force (employment and unemployment)", by: "Australian Bureau of Statistics", event: "unemployment-rate" },
      { name: "Consumer Price Index", by: "Australian Bureau of Statistics", event: "cpi" },
      { name: "National Accounts (Gross Domestic Product)", by: "Australian Bureau of Statistics", event: "gdp" },
      { name: "Chinese activity data, read for Australian exports", by: "National Bureau of Statistics of China" },
    ],
    session: "Sydney",
    sessionNote: "Australian data arrive in the Sydney morning, early in the Asia-Pacific day, with Chinese releases a little later. The currency keeps trading through London and New York.",
    history: "The Australian dollar replaced the Australian pound on 14 February 1966, when the country moved to decimal currency. It was floated in December 1983. In 1988 Australia issued the first banknote printed on polymer and not on paper, and all of its notes have been polymer since the 1990s.",
  },
  {
    code: "CAD",
    name: "Canadian dollar",
    symbol: "C$",
    nicknames: ["loonie"],
    area: "Canada",
    is: "The currency of Canada, a large producer of oil, natural gas, minerals, timber and grain whose trade is bound closely to the United States.",
    issuer: "Bank of Canada",
    issuerNote: "The Bank of Canada issues the Canadian dollar and sets the target for the overnight rate. Its inflation target is agreed with the federal government and renewed periodically.",
    kinds: ["Commodity-linked"],
    kindsNote: "Energy is prominent among Canada’s exports, so the currency is often read beside the price of crude oil. Most Canadian exports go to the United States, which ties it to the American economy as well.",
    drivers: [
      "The price of crude oil and other raw materials Canada exports",
      "The strength of the US economy, which buys most of what Canada sells abroad",
      "Bank of Canada policy, and the gap between Canadian and US interest rates",
      "Risk appetite in world markets",
    ],
    releases: [
      { name: "Interest rate announcement and the Monetary Policy Report", by: "Bank of Canada", event: "interest-rate-decision" },
      { name: "Labour Force Survey", by: "Statistics Canada", event: "unemployment-rate" },
      { name: "Consumer Price Index", by: "Statistics Canada", event: "cpi" },
      { name: "Gross Domestic Product, monthly and quarterly", by: "Statistics Canada", event: "gdp" },
      { name: "Retail trade", by: "Statistics Canada", event: "retail-sales" },
    ],
    session: "New York",
    sessionNote: "Canada shares the North American business day. Canadian data arrive in the New York morning, at times in the same minute as US releases, which can make that moment a busy one for the pair with the US dollar.",
    history: "The dollar replaced the pound as the unit of account of the Province of Canada in 1858, before Confederation. The Bank of Canada began operating in 1935. The currency floated from 1950 to 1962, earlier than most, and has floated without a break since 1970. The one-dollar coin introduced in 1987 carries a loon, a water bird, which gave the currency its nickname.",
  },
  {
    code: "NZD",
    name: "New Zealand dollar",
    symbol: "NZ$",
    nicknames: ["kiwi"],
    area: "New Zealand",
    is: "The currency of New Zealand, a small, open economy that exports dairy products, meat, fruit, timber and wine. It is a smaller market than the other major currencies.",
    issuer: "Reserve Bank of New Zealand",
    issuerNote: "The Reserve Bank of New Zealand issues the New Zealand dollar and sets the Official Cash Rate through its Monetary Policy Committee.",
    kinds: ["Commodity-linked", "Risk-sensitive"],
    kindsNote: "Farm produce leads New Zealand’s exports, so the currency is often read beside the prices of dairy products in particular. As a smaller market it tends to respond more than the larger currencies to the mood of world markets.",
    drivers: [
      "Prices of dairy products and other farm exports",
      "Reserve Bank of New Zealand policy, and the gap between New Zealand and US interest rates",
      "Demand from China and Australia, two of its main trading partners",
      "Risk appetite in world markets",
    ],
    releases: [
      { name: "Official Cash Rate decision and the Monetary Policy Statement", by: "Reserve Bank of New Zealand", event: "interest-rate-decision" },
      { name: "Consumers Price Index", by: "Stats NZ", event: "cpi" },
      { name: "Labour market statistics", by: "Stats NZ", event: "unemployment-rate" },
      { name: "Gross Domestic Product", by: "Stats NZ", event: "gdp" },
      { name: "Global Dairy Trade auction results", by: "Global Dairy Trade" },
    ],
    session: "Sydney",
    sessionNote: "Wellington is the first financial centre to open each day, and the trading week begins there on Monday morning. New Zealand data arrive before Sydney and Tokyo are fully open, when the market can be thin.",
    history: "The New Zealand dollar replaced the New Zealand pound on 10 July 1967, when the country moved to decimal currency. It was floated in March 1985. The Reserve Bank of New Zealand Act of 1989 made price stability the bank’s task, and New Zealand became the first country to adopt a formal inflation target, an approach many central banks have followed since.",
  },

  // ── widely followed, and not in any GIO4X instrument ─────────────────────
  {
    code: "CNY",
    name: "Chinese yuan (renminbi)",
    symbol: "¥",
    nicknames: ["yuan", "renminbi", "RMB", "CNH (the yuan traded outside mainland China)"],
    area: "China",
    is: "The currency of the People’s Republic of China. Renminbi, “the people’s currency”, is the name of the currency and yuan is its unit. It trades in two markets: on the mainland, under rules set by the authorities, and offshore, chiefly in Hong Kong.",
    issuer: "People’s Bank of China",
    issuerNote: "The People’s Bank of China issues the renminbi. It works under the direction of the State Council and is not independent of the government in the way most of the central banks on this site are.",
    kinds: ["Managed or pegged", "Reserve currency", "Emerging market"],
    kindsNote: "The yuan does not float freely: each trading day the central bank publishes a reference rate, and the mainland market may trade only within a band around it. Movement of money in and out of the country is controlled. It is nonetheless held in official reserves, and it is one of the five currencies in the International Monetary Fund’s Special Drawing Right.",
    drivers: [
      "The central bank’s daily reference rate and the band around it",
      "Chinese growth, trade and property-market conditions",
      "The gap between Chinese and US interest rates",
      "Controls on the movement of capital, and changes to them",
      "The general direction of the US dollar",
    ],
    releases: [
      { name: "Loan Prime Rate announcements", by: "People’s Bank of China", event: "interest-rate-decision" },
      { name: "Gross Domestic Product", by: "National Bureau of Statistics of China", event: "gdp" },
      { name: "Industrial production, retail sales and fixed-asset investment", by: "National Bureau of Statistics of China" },
      { name: "Official purchasing managers’ indices", by: "National Bureau of Statistics of China", event: "pmi" },
      { name: "Trade balance", by: "General Administration of Customs", event: "trade-balance" },
      { name: "Consumer and producer prices", by: "National Bureau of Statistics of China", event: "cpi" },
    ],
    session: "Asia (Shanghai and Hong Kong hours)",
    sessionNote: "The mainland market keeps Shanghai hours and the reference rate is published each morning before it opens. The offshore yuan trades around the clock.",
    history: "The renminbi was first issued in December 1948, when the People’s Bank of China was founded. China unified its exchange rates in 1994 and then held the yuan effectively fixed to the US dollar until July 2005, when it moved to a managed float with reference to a basket of currencies. An offshore market grew up in Hong Kong from 2010, and the yuan joined the Special Drawing Right in 2016.",
  },
  {
    code: "HKD",
    name: "Hong Kong dollar",
    symbol: "HK$",
    nicknames: ["HK dollar"],
    area: "Hong Kong",
    is: "The currency of Hong Kong, one of the world’s main financial centres. It is tied to the US dollar by a currency board, so it moves only within a narrow band against the dollar and follows it against everything else.",
    issuer: "Hong Kong Monetary Authority",
    issuerNote: "The Hong Kong Monetary Authority runs the Linked Exchange Rate System. Most banknotes are issued under its authority by three commercial banks, which must lodge US dollars with it for every note they issue; the government issues the coins and the ten-dollar note.",
    kinds: ["Managed or pegged"],
    kindsNote: "Under a currency board the monetary base is fully backed by US dollar reserves and the authority undertakes to buy or sell at the edges of the band. Hong Kong therefore has no independent interest-rate policy: its rates follow those of the United States.",
    drivers: [
      "The link itself, which confines the currency to its band against the US dollar",
      "The gap between Hong Kong and US money-market interest rates, which decides where in the band it sits",
      "Money flowing into and out of Hong Kong’s stock market",
      "The Monetary Authority’s operations at the edges of the band",
    ],
    releases: [
      { name: "Federal Open Market Committee decision, which Hong Kong’s base rate follows", by: "Federal Reserve", event: "interest-rate-decision" },
      { name: "Gross Domestic Product", by: "Census and Statistics Department", event: "gdp" },
      { name: "Consumer Price Index", by: "Census and Statistics Department", event: "cpi" },
      { name: "Retail sales", by: "Census and Statistics Department", event: "retail-sales" },
    ],
    session: "Asia (Hong Kong hours)",
    sessionNote: "Hong Kong is one of the principal centres of the Asian trading day, between the Tokyo morning and the London open.",
    history: "The Hong Kong dollar has circulated since the nineteenth century. It was tied to sterling for much of the twentieth, floated from 1974, and has been linked to the US dollar under the Linked Exchange Rate System since October 1983. The Hong Kong Monetary Authority was established in 1993, and the present band, with an undertaking on each side, dates from 2005.",
  },
  {
    code: "INR",
    name: "Indian rupee",
    symbol: "₹",
    nicknames: ["rupee"],
    area: "India",
    is: "The currency of India. It can be exchanged freely for trade, but movements of capital are regulated, and a good deal of trading by people outside India takes place in offshore contracts that are settled in US dollars.",
    issuer: "Reserve Bank of India",
    issuerNote: "The Reserve Bank of India issues the rupee and sets the policy repo rate through its Monetary Policy Committee. It buys and sells foreign currency to keep the market orderly.",
    kinds: ["Emerging market", "Managed or pegged"],
    kindsNote: "The rupee’s rate is set in the market, but the Reserve Bank steps in to limit sharp moves, an arrangement usually called a managed float.",
    drivers: [
      "The price of crude oil, most of which India imports",
      "Foreign investment flowing into and out of Indian shares and bonds",
      "Reserve Bank of India policy and its activity in the currency market",
      "The trade balance, including imports of gold",
      "The general direction of the US dollar",
    ],
    releases: [
      { name: "Monetary Policy Committee decision", by: "Reserve Bank of India", event: "interest-rate-decision" },
      { name: "Consumer Price Index", by: "National Statistics Office, Ministry of Statistics and Programme Implementation", event: "cpi" },
      { name: "Gross Domestic Product", by: "National Statistics Office, Ministry of Statistics and Programme Implementation", event: "gdp" },
      { name: "Index of Industrial Production", by: "National Statistics Office, Ministry of Statistics and Programme Implementation", event: "industrial-production" },
      { name: "Merchandise trade", by: "Ministry of Commerce and Industry", event: "trade-balance" },
    ],
    session: "Asia (Mumbai hours)",
    sessionNote: "The onshore market keeps Mumbai hours. Offshore contracts on the rupee trade in Singapore, Dubai, London and New York outside them.",
    history: "The name comes from the rupiya, a silver coin issued by Sher Shah Suri in the sixteenth century. The Reserve Bank of India was established in 1935. The rupee was decimalised in 1957. After a balance-of-payments crisis in 1991 India opened its economy, and the exchange rate has been set in the market since 1993. The ₹ symbol was adopted in 2010, and an inflation target with a Monetary Policy Committee in 2016.",
  },
  {
    code: "MXN",
    name: "Mexican peso",
    symbol: "Mex$",
    nicknames: ["peso"],
    area: "Mexico",
    is: "The currency of Mexico. It floats freely, trades around the clock and is one of the more liquid currencies of the developing economies, which is why it is often used to express a view on emerging markets as a whole.",
    issuer: "Banco de México",
    issuerNote: "Banco de México, known as Banxico, issues the peso and sets the target for the overnight interbank rate through its Governing Board. It has been autonomous of the government since 1994.",
    kinds: ["Emerging market", "Risk-sensitive"],
    kindsNote: "Mexican interest rates have usually been well above those of the United States, which draws in money looking for yield when markets are calm and sees it leave when they are not.",
    drivers: [
      "The US economy and the trade rules between Mexico, the United States and Canada",
      "Banco de México policy, and the gap between Mexican and US interest rates",
      "Risk appetite towards emerging markets",
      "Money sent home by Mexicans working abroad",
      "The price of oil",
    ],
    releases: [
      { name: "Monetary policy announcement", by: "Banco de México", event: "interest-rate-decision" },
      { name: "National Consumer Price Index, published twice a month", by: "INEGI", event: "cpi" },
      { name: "Gross Domestic Product", by: "INEGI", event: "gdp" },
      { name: "US employment and inflation releases, read for Mexico’s largest market", by: "Bureau of Labor Statistics", event: "non-farm-payrolls" },
    ],
    session: "New York",
    sessionNote: "Mexico shares the North American business day; the peso is busiest in New York hours.",
    history: "The peso descends from the Spanish silver dollar, the “piece of eight”, which was used in trade across the world for centuries. In 1993 a new peso replaced the old one, removing three zeros. The peso was floated in December 1994, during the crisis remembered as the Tequila crisis, and Banco de México became autonomous in the same year.",
  },
  {
    code: "NOK",
    name: "Norwegian krone",
    symbol: "kr",
    nicknames: ["krone", "nokkie"],
    area: "Norway",
    is: "The currency of Norway, a large exporter of oil and natural gas from the North Sea. It is a small market, and can move a long way when trading is thin.",
    issuer: "Norges Bank",
    issuerNote: "Norges Bank, founded in 1816, issues the krone and sets the policy rate. It also manages the country’s sovereign wealth fund, which invests petroleum revenue outside Norway.",
    kinds: ["Commodity-linked", "Risk-sensitive"],
    kindsNote: "Petroleum leads Norway’s exports, so the krone is often read beside oil and gas prices. As a smaller market it has tended to weaken when investors are cautious.",
    drivers: [
      "Prices of oil and natural gas",
      "Norges Bank policy, and how it compares with policy in the euro area",
      "Risk appetite, and how easy the krone is to trade at that moment",
      "The central bank’s currency transactions on behalf of the government, which it announces in advance",
    ],
    releases: [
      { name: "Policy rate decision and the Monetary Policy Report", by: "Norges Bank", event: "interest-rate-decision" },
      { name: "Consumer Price Index, including the measure adjusted for tax changes and energy", by: "Statistics Norway", event: "cpi" },
      { name: "Gross Domestic Product, including the mainland economy", by: "Statistics Norway", event: "gdp" },
      { name: "Regional Network survey of businesses", by: "Norges Bank" },
    ],
    session: "London",
    sessionNote: "The krone is traded mainly in European hours, most often against the euro.",
    history: "The krone was introduced in 1875, when Norway joined the Scandinavian Monetary Union with Denmark and Sweden. The fund that invests Norway’s petroleum revenue was established by law in 1990. The krone has floated since December 1992, and Norges Bank has had an inflation target since 2001.",
  },
  {
    code: "SEK",
    name: "Swedish krona",
    symbol: "kr",
    nicknames: ["krona", "stokkie"],
    area: "Sweden",
    is: "The currency of Sweden, an open economy that exports vehicles, machinery, telecommunications equipment, timber and paper. Sweden is in the European Union and has kept its own currency.",
    issuer: "Sveriges Riksbank",
    issuerNote: "Sveriges Riksbank issues the krona and sets the policy rate through its Executive Board. Founded in 1668, it is commonly described as the oldest central bank in the world.",
    kinds: ["Risk-sensitive"],
    kindsNote: "Sweden lives by exporting manufactured goods, so the krona is often read as a gauge of world trade and of confidence in general. It is a smaller market than the majors.",
    drivers: [
      "Riksbank policy, and how it compares with policy in the euro area",
      "Demand in the euro area, where much of what Sweden exports is sold",
      "The world manufacturing cycle",
      "Risk appetite in world markets",
      "The housing market: Swedish households borrow heavily, much of it at rates that change quickly",
    ],
    releases: [
      { name: "Monetary policy decision", by: "Sveriges Riksbank", event: "interest-rate-decision" },
      { name: "Consumer prices, including the fixed-interest-rate measure the Riksbank targets", by: "Statistics Sweden", event: "cpi" },
      { name: "Gross Domestic Product", by: "Statistics Sweden", event: "gdp" },
      { name: "Labour Force Survey", by: "Statistics Sweden", event: "unemployment-rate" },
      { name: "Economic Tendency Survey", by: "National Institute of Economic Research" },
    ],
    session: "London",
    sessionNote: "The krona is traded mainly in European hours, most often against the euro.",
    history: "The krona was introduced in 1873, when Sweden and Denmark formed the Scandinavian Monetary Union. In November 1992, in the European currency crisis of that year, Sweden gave up its fixed exchange rate and let the krona float. In a referendum in 2003 voters decided against adopting the euro.",
  },
  {
    code: "SGD",
    name: "Singapore dollar",
    symbol: "S$",
    nicknames: ["Sing dollar", "sing"],
    area: "Singapore",
    is: "The currency of Singapore, a trading and financial centre whose trade is far larger than its own economy. Its monetary policy works through the exchange rate, not through an interest rate.",
    issuer: "Monetary Authority of Singapore",
    issuerNote: "The Monetary Authority of Singapore is both central bank and financial regulator. It steers the Singapore dollar against a basket of the currencies of its main trading partners, inside a band whose position it does not publish.",
    kinds: ["Managed or pegged"],
    kindsNote: "Because so much of what Singapore consumes is imported, the authority judges that the exchange rate has more effect on prices than interest rates would. It sets the slope, width and centre of the band and lets interest rates follow from that.",
    drivers: [
      "The Monetary Authority’s policy statements on the slope, width and centre of the band",
      "World trade, and demand for electronics in particular",
      "The general direction of the US dollar and of other Asian currencies",
      "Inflation in Singapore, which the policy exists to contain",
    ],
    releases: [
      { name: "Monetary Policy Statement", by: "Monetary Authority of Singapore" },
      { name: "Consumer Price Index, with the Authority’s core measure", by: "Singapore Department of Statistics", event: "cpi" },
      { name: "Gross Domestic Product, beginning with the advance estimate", by: "Ministry of Trade and Industry", event: "gdp" },
      { name: "Non-oil domestic exports", by: "Enterprise Singapore" },
    ],
    session: "Asia (Singapore hours)",
    sessionNote: "Singapore is one of the principal centres of the Asian trading day and a major foreign-exchange centre in its own right.",
    history: "The Singapore dollar was first issued in 1967, after the shared currency arrangement with Malaysia and Brunei ended. Under an agreement of the same year it remains interchangeable with the Brunei dollar. The Monetary Authority of Singapore was established in 1971 and has centred its policy on the exchange rate since 1981.",
  },
  {
    code: "ZAR",
    name: "South African rand",
    symbol: "R",
    nicknames: ["rand"],
    area: "South Africa",
    is: "The currency of South Africa, a producer of gold, platinum-group metals and coal. It floats freely and is one of the more liquid currencies of the developing economies. It also circulates in Lesotho, Eswatini and Namibia, whose own currencies are tied to it.",
    issuer: "South African Reserve Bank",
    issuerNote: "The South African Reserve Bank, established in 1921, issues the rand and sets the repurchase rate through its Monetary Policy Committee.",
    kinds: ["Emerging market", "Commodity-linked", "Risk-sensitive"],
    kindsNote: "Metals and minerals lead South Africa’s exports, and investors abroad hold a large share of its bonds and shares. The rand is therefore often read beside metal prices and beside the mood towards emerging markets.",
    drivers: [
      "Risk appetite towards emerging markets",
      "Prices of gold, platinum-group metals and coal",
      "South African Reserve Bank policy",
      "Domestic conditions: the supply of electricity, the public finances and politics",
      "Buying and selling of South African bonds by investors abroad",
    ],
    releases: [
      { name: "Monetary Policy Committee decision", by: "South African Reserve Bank", event: "interest-rate-decision" },
      { name: "Consumer Price Index", by: "Statistics South Africa", event: "cpi" },
      { name: "Gross Domestic Product", by: "Statistics South Africa", event: "gdp" },
      { name: "Quarterly Labour Force Survey", by: "Statistics South Africa", event: "unemployment-rate" },
      { name: "Mining and manufacturing production", by: "Statistics South Africa" },
    ],
    session: "London",
    sessionNote: "Johannesburg keeps hours close to those of Europe, and the rand is busiest in the London day.",
    history: "The rand replaced the South African pound on 14 February 1961, the year the country became a republic. It takes its name from the Witwatersrand, the ridge on which Johannesburg stands and where gold was found. A separate “financial rand” for foreign investors was abolished in 1995, and the Reserve Bank has had an inflation target since 2000.",
  },
];

const byCode = new Map(CURRENCY_PROFILES.map((c) => [c.code.toLowerCase(), c]));
/** A profile by its address: the ISO code in lower case ("usd"). */
export const getCurrencyProfile = (slug: string) => byCode.get(slug);
export const currencyProfileHref = (c: Pick<CurrencyProfile, "code">) => `/markets/currencies/${c.code.toLowerCase()}`;

/** The currency pairs GIO4X lists that contain a currency: read from instruments.ts, so the two cannot disagree. */
export const currencyPairs = (c: Pick<CurrencyProfile, "code">): Instrument[] => instruments.filter((i) => i.class === "forex" && (i.base === c.code || i.quote === c.code));

/** Other GIO4X instruments whose own data names the currency (a metal priced in it, an index of its market). */
export const currencyOtherInstruments = (c: Pick<CurrencyProfile, "code">): Instrument[] => instruments.filter((i) => i.class !== "forex" && i.related.includes(`ccy:${c.code}`));

/** The currencies that are in at least one GIO4X pair, and those that are in none. */
export const PAIRED_CURRENCIES: readonly CurrencyProfile[] = CURRENCY_PROFILES.filter((c) => currencyPairs(c).length > 0);
export const UNPAIRED_CURRENCIES: readonly CurrencyProfile[] = CURRENCY_PROFILES.filter((c) => currencyPairs(c).length === 0);

/** The issuer's Central Bank Watch page, when the site has one. */
export const currencyBank = (c: Pick<CurrencyProfile, "code">): CentralBank | undefined => centralBanks.find((b) => b.currency === c.code);

/** The site's explainer for a release, when there is one. */
export const releaseEvent = (r: Release): EconEvent | undefined => (r.event ? getEvent(r.event) : undefined);

/** The first sentence of a profile: the line shown in lists, search results and page descriptions. */
export const currencyLine = (c: CurrencyProfile) => {
  const stop = c.is.indexOf(". ");
  return stop === -1 ? c.is : c.is.slice(0, stop + 1);
};
