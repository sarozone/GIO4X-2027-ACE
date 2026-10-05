/**
 * Economy profiles: the economies behind the currencies.
 *
 * GENERAL EDUCATION. The first eight are the economies whose currencies are in
 * the pairs GIO4X lists; China and India are added as context, because they are
 * widely followed, and their currencies are NOT in any GIO4X instrument.
 *
 * The rule this file keeps: no GDP figure, no ranking, no rate, no percentage
 * and no date of any data. Only what is durable and widely known: what the
 * economy is known for (qualitative), its central bank and mandate in plain
 * words, the releases that matter and the office or agency that publishes each,
 * and its best-known stock index. An index is linked only when GIO4X lists an
 * instrument on it: the slugs in `indices` resolve through `getInstrument`, so
 * the pages follow src/data/instruments.ts and cannot claim more than it does.
 * The currency, the central bank's page and the explainers for the releases are
 * resolved the same way (see src/data/currency-profiles.ts).
 */
import { CURRENCY_PROFILES, type CurrencyProfile, type Release } from "@/data/currency-profiles";
import { getInstrument, type Instrument } from "@/data/instruments";
import { centralBanks, type CentralBank } from "@/data/knowledge";

export const ECONOMY_REGIONS = ["Americas", "Europe", "Asia-Pacific"] as const;
export type EconomyRegion = (typeof ECONOMY_REGIONS)[number];

export type Economy = {
  slug: string;
  name: string;
  /** how the name reads in a sentence ("the United States") */
  phrase: string;
  region: EconomyRegion;
  /** ISO code of its currency */
  currency: string;
  /** what it is, in two or three plain sentences */
  is: string;
  /** what the economy is known for structurally: qualitative, no figures */
  known: string[];
  /** its central bank, by name */
  bank: string;
  /** the mandate, in plain words */
  mandate: string;
  /** the releases that matter, with who publishes each */
  releases: Release[];
  /** its best-known stock index or indices, by name */
  indexName: string;
  /** one sentence about the index */
  indexNote: string;
  /** slugs of the GIO4X index instruments on it, where the site lists any */
  indices: string[];
};

export const ECONOMIES: readonly Economy[] = [
  // ── the economies behind the currencies of the GIO4X pairs ───────────────
  {
    slug: "united-states",
    name: "United States",
    phrase: "the United States",
    region: "Americas",
    currency: "USD",
    is: "A very large and varied economy, led by services and by the spending of its own households. Its currency and its government bonds are used across the world, so its data and its central bank are followed well beyond its borders.",
    known: [
      "Services lead: finance, technology, healthcare and professional services",
      "Household spending makes up the greater part of activity, which is why consumer and employment data are read so closely",
      "A large producer of oil, natural gas and farm produce as well as of manufactured goods",
      "Deep markets for shares and government debt, in which the rest of the world invests",
    ],
    bank: "Federal Reserve",
    mandate: "Congress has given the Federal Reserve two goals, often called the dual mandate: as many people in work as the economy can sustain, and stable prices. Policy is set by the Federal Open Market Committee.",
    releases: [
      { name: "Employment Situation report (Non-Farm Payrolls and the unemployment rate)", by: "Bureau of Labor Statistics", event: "non-farm-payrolls" },
      { name: "Consumer Price Index", by: "Bureau of Labor Statistics", event: "cpi" },
      { name: "Personal Income and Outlays, with the price index the Federal Reserve’s inflation goal is stated in", by: "Bureau of Economic Analysis" },
      { name: "Gross Domestic Product", by: "Bureau of Economic Analysis", event: "gdp" },
      { name: "Retail sales", by: "US Census Bureau", event: "retail-sales" },
      { name: "ISM Report On Business (manufacturing and services PMI)", by: "Institute for Supply Management", event: "pmi" },
    ],
    indexName: "S&P 500, Dow Jones Industrial Average and Nasdaq-100",
    indexNote: "Three indices are commonly quoted: a broad one of large companies, an older one of thirty, and one weighted towards technology.",
    indices: ["us500", "us30", "us100"],
  },
  {
    slug: "euro-area",
    name: "Euro area",
    phrase: "the euro area",
    region: "Europe",
    currency: "EUR",
    is: "The member states of the European Union that share the euro. They have one central bank and one monetary policy, while each government keeps its own budget and its own debt, and that arrangement shapes much of how the area is read.",
    known: [
      "Varied by country: export-led manufacturing of vehicles, machinery and chemicals, centred on Germany, beside services and tourism elsewhere",
      "Very open to trade, so world demand matters to it",
      "An importer of most of its energy",
      "One monetary policy with many national budgets, so the bond yields of member governments are watched against one another",
    ],
    bank: "European Central Bank",
    mandate: "The European Central Bank’s primary objective is price stability across the euro area as a whole, not in any one country. Policy is set by its Governing Council, on which the national central banks sit.",
    releases: [
      { name: "Harmonised Index of Consumer Prices, including the flash estimate", by: "Eurostat", event: "cpi" },
      { name: "Gross Domestic Product", by: "Eurostat", event: "gdp" },
      { name: "Unemployment", by: "Eurostat", event: "unemployment-rate" },
      { name: "Purchasing managers’ surveys for the euro area and its members", by: "S&P Global", event: "pmi" },
      { name: "Ifo Business Climate Index for Germany", by: "ifo Institute" },
      { name: "National releases for the member states", by: "the national statistical offices, among them Destatis (Germany), INSEE (France) and Istat (Italy)" },
    ],
    indexName: "DAX (Germany) and EURO STOXX 50 (the euro area)",
    indexNote: "There is no single national market. The German DAX is the index GIO4X lists; the EURO STOXX 50, which covers large companies across the area, is not a GIO4X instrument.",
    indices: ["de40"],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    phrase: "the United Kingdom",
    region: "Europe",
    currency: "GBP",
    is: "A services-led economy with one of the world’s main financial centres in London. It buys more goods from abroad than it sells and sells more services than it buys.",
    known: [
      "Services lead: financial, legal and professional services, with London at the centre",
      "Pharmaceuticals, aerospace, and the creative industries are among its strengths in what it makes and exports",
      "It imports more goods than it exports, and relies on money from abroad to cover the difference",
      "Trade is bound closely to the European Union, which it left in 2020",
    ],
    bank: "Bank of England",
    mandate: "The Bank of England’s task is to keep inflation at the target the government sets, and to keep the financial system stable. Interest rates are set by its Monetary Policy Committee, independently of the government.",
    releases: [
      { name: "Consumer price inflation", by: "Office for National Statistics", event: "cpi" },
      { name: "Labour market overview (employment, unemployment and pay)", by: "Office for National Statistics", event: "unemployment-rate" },
      { name: "Gross Domestic Product, monthly and quarterly", by: "Office for National Statistics", event: "gdp" },
      { name: "Retail sales", by: "Office for National Statistics", event: "retail-sales" },
      { name: "UK purchasing managers’ surveys", by: "S&P Global", event: "pmi" },
      { name: "Monetary Policy Committee decision and the Monetary Policy Report", by: "Bank of England", event: "interest-rate-decision" },
    ],
    indexName: "FTSE 100",
    indexNote: "The hundred largest companies listed in London. Many of them earn most of their income abroad, so the index reflects the world economy as much as the British one.",
    indices: ["uk100"],
  },
  {
    slug: "japan",
    name: "Japan",
    phrase: "Japan",
    region: "Asia-Pacific",
    currency: "JPY",
    is: "An advanced manufacturing and exporting economy with an ageing population, few natural resources of its own and large investments abroad. It lived for decades with very low inflation and very low interest rates.",
    known: [
      "Manufacturing for export: vehicles, electronics, machinery and industrial robots",
      "It imports nearly all of its energy and much of its food and raw materials",
      "An ageing and shrinking population",
      "A large holder of assets abroad, whose income flows back to Japan",
    ],
    bank: "Bank of Japan",
    mandate: "The Bank of Japan’s task is price stability and the stability of the financial system. Policy is set by its Policy Board. Decisions about intervening in the currency market belong to the Ministry of Finance.",
    releases: [
      { name: "Tankan survey of business conditions", by: "Bank of Japan" },
      { name: "Consumer Price Index, national and for Tokyo", by: "Statistics Bureau of Japan", event: "cpi" },
      { name: "Gross Domestic Product", by: "Cabinet Office", event: "gdp" },
      { name: "Labour Force Survey", by: "Statistics Bureau of Japan", event: "unemployment-rate" },
      { name: "Trade statistics", by: "Ministry of Finance" },
      { name: "Industrial production", by: "Ministry of Economy, Trade and Industry" },
    ],
    indexName: "Nikkei 225",
    indexNote: "A price-weighted index of 225 companies listed in Tokyo. The broader TOPIX is also widely quoted and is not a GIO4X instrument.",
    indices: ["jp225"],
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    phrase: "Switzerland",
    region: "Europe",
    currency: "CHF",
    is: "A small, open and prosperous economy in the middle of Europe, outside the European Union and the euro. It has a long record of low inflation.",
    known: [
      "Pharmaceuticals and chemicals, precision instruments, watches and machinery lead its exports",
      "Banking, wealth management and insurance",
      "A centre for the trading of commodities",
      "Trade is bound closely to the European Union, of which it is not a member",
    ],
    bank: "Swiss National Bank",
    mandate: "The Swiss National Bank’s task is price stability, while taking account of how the economy is developing. Policy is set by its Governing Board, which uses the policy rate and, when it judges it necessary, buys or sells foreign currency.",
    releases: [
      { name: "Consumer Price Index", by: "Federal Statistical Office", event: "cpi" },
      { name: "Gross Domestic Product", by: "State Secretariat for Economic Affairs (SECO)", event: "gdp" },
      { name: "Unemployment", by: "State Secretariat for Economic Affairs (SECO)", event: "unemployment-rate" },
      { name: "KOF Economic Barometer", by: "KOF Swiss Economic Institute, ETH Zurich" },
      { name: "Monetary policy assessment", by: "Swiss National Bank", event: "interest-rate-decision" },
    ],
    indexName: "Swiss Market Index (SMI)",
    indexNote: "The index of the largest companies listed in Zurich. It is not a GIO4X instrument.",
    indices: [],
  },
  {
    slug: "australia",
    name: "Australia",
    phrase: "Australia",
    region: "Asia-Pacific",
    currency: "AUD",
    is: "A services economy at home and a resources exporter abroad. Most Australians work in services, while what the country sells to the world is led by minerals, energy and farm produce.",
    known: [
      "Exports led by iron ore, coal, natural gas and gold, with farm produce beside them",
      "Education and tourism are large service exports",
      "Close trade links with China and the rest of Asia",
      "Household borrowing for housing is large, so interest rates are felt quickly",
    ],
    bank: "Reserve Bank of Australia",
    mandate: "The Reserve Bank of Australia’s task is price stability and full employment. It sets the cash rate target.",
    releases: [
      { name: "Labour Force (employment and unemployment)", by: "Australian Bureau of Statistics", event: "unemployment-rate" },
      { name: "Consumer Price Index", by: "Australian Bureau of Statistics", event: "cpi" },
      { name: "National Accounts (Gross Domestic Product)", by: "Australian Bureau of Statistics", event: "gdp" },
      { name: "Monetary policy decision and the Statement on Monetary Policy", by: "Reserve Bank of Australia", event: "interest-rate-decision" },
      { name: "Monthly Business Survey", by: "National Australia Bank" },
    ],
    indexName: "S&P/ASX 200",
    indexNote: "The main index of companies listed in Sydney, in which banks and mining companies weigh heavily. It is not a GIO4X instrument.",
    indices: [],
  },
  {
    slug: "canada",
    name: "Canada",
    phrase: "Canada",
    region: "Americas",
    currency: "CAD",
    is: "A resource-rich economy whose trade is bound closely to the United States. Services employ most Canadians, while energy, minerals, timber and grain are prominent in what the country exports.",
    known: [
      "A large producer of oil and natural gas, much of it from Alberta, and of minerals, timber, wheat and canola",
      "Manufacturing, vehicles in particular, that is integrated with factories in the United States",
      "The United States buys most of what Canada sells abroad",
      "Household borrowing for housing is large, so interest rates are felt quickly",
    ],
    bank: "Bank of Canada",
    mandate: "The Bank of Canada’s task is to keep inflation low, stable and predictable. The target is agreed with the federal government and renewed periodically; the Bank sets the target for the overnight rate.",
    releases: [
      { name: "Labour Force Survey", by: "Statistics Canada", event: "unemployment-rate" },
      { name: "Consumer Price Index", by: "Statistics Canada", event: "cpi" },
      { name: "Gross Domestic Product, monthly and quarterly", by: "Statistics Canada", event: "gdp" },
      { name: "Retail trade", by: "Statistics Canada", event: "retail-sales" },
      { name: "Interest rate announcement and the Monetary Policy Report", by: "Bank of Canada", event: "interest-rate-decision" },
      { name: "Business Outlook Survey", by: "Bank of Canada" },
    ],
    indexName: "S&P/TSX Composite",
    indexNote: "The main index of companies listed in Toronto, in which banks, energy and mining companies weigh heavily. It is not a GIO4X instrument.",
    indices: [],
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    phrase: "New Zealand",
    region: "Asia-Pacific",
    currency: "NZD",
    is: "A small, open economy a long way from its markets, which earns its living abroad from farming and tourism.",
    known: [
      "Exports led by dairy products, with meat, fruit, timber and wine beside them",
      "Tourism is a large earner of foreign income",
      "China and Australia are among its main trading partners",
      "A small market, so world conditions are felt quickly",
    ],
    bank: "Reserve Bank of New Zealand",
    mandate: "The Reserve Bank of New Zealand’s task is to keep prices stable over the medium term. It was the first central bank to be given a formal inflation target. Policy is set by its Monetary Policy Committee, through the Official Cash Rate.",
    releases: [
      { name: "Consumers Price Index", by: "Stats NZ", event: "cpi" },
      { name: "Labour market statistics", by: "Stats NZ", event: "unemployment-rate" },
      { name: "Gross Domestic Product", by: "Stats NZ", event: "gdp" },
      { name: "Official Cash Rate decision and the Monetary Policy Statement", by: "Reserve Bank of New Zealand", event: "interest-rate-decision" },
      { name: "Global Dairy Trade auction results", by: "Global Dairy Trade" },
    ],
    indexName: "S&P/NZX 50",
    indexNote: "The main index of companies listed in New Zealand. It is not a GIO4X instrument.",
    indices: [],
  },

  // ── context: widely followed, and their currencies are not in any GIO4X instrument ──
  {
    slug: "china",
    name: "China",
    phrase: "China",
    region: "Asia-Pacific",
    currency: "CNY",
    is: "A very large manufacturing and exporting economy in which the state has a leading part. It is a major buyer of raw materials, which is why its data are read for the Australian and New Zealand dollars and for metals as well as for itself.",
    known: [
      "Manufacturing for export, across almost every kind of goods",
      "Large state-owned companies and banks beside a large private sector",
      "Growth that has leaned heavily on investment in property and infrastructure, with a stated aim of moving towards household spending",
      "A major importer of iron ore, copper, oil and farm produce",
    ],
    bank: "People’s Bank of China",
    mandate: "The People’s Bank of China’s stated aim is to keep the value of the currency stable and so support economic growth. It works under the direction of the State Council and is not independent of the government. It steers the exchange rate as well as interest rates.",
    releases: [
      { name: "Gross Domestic Product", by: "National Bureau of Statistics of China", event: "gdp" },
      { name: "Industrial production, retail sales and fixed-asset investment", by: "National Bureau of Statistics of China" },
      { name: "Official purchasing managers’ indices", by: "National Bureau of Statistics of China", event: "pmi" },
      { name: "Consumer and producer prices", by: "National Bureau of Statistics of China", event: "cpi" },
      { name: "Trade balance", by: "General Administration of Customs" },
      { name: "Loan Prime Rate announcements", by: "People’s Bank of China", event: "interest-rate-decision" },
    ],
    indexName: "Shanghai Composite and CSI 300",
    indexNote: "The best-known indices of shares listed on the mainland. Neither is a GIO4X instrument.",
    indices: [],
  },
  {
    slug: "india",
    name: "India",
    phrase: "India",
    region: "Asia-Pacific",
    currency: "INR",
    is: "A large, young and fast-changing economy, led by services and by the spending of its own people. Farming still employs a great many of them.",
    known: [
      "Services lead, with information technology and business services prominent among its exports",
      "A large workforce in farming, which depends on the monsoon",
      "A big home market, and a manufacturing sector the government is working to enlarge",
      "It imports most of its crude oil, so the oil price matters to its trade balance and its prices",
    ],
    bank: "Reserve Bank of India",
    mandate: "The Reserve Bank of India’s task is price stability, while keeping growth in mind. The inflation target is set by the government, and the policy repo rate by the Bank’s Monetary Policy Committee.",
    releases: [
      { name: "Consumer Price Index", by: "National Statistics Office, Ministry of Statistics and Programme Implementation", event: "cpi" },
      { name: "Gross Domestic Product", by: "National Statistics Office, Ministry of Statistics and Programme Implementation", event: "gdp" },
      { name: "Index of Industrial Production", by: "National Statistics Office, Ministry of Statistics and Programme Implementation" },
      { name: "Merchandise trade", by: "Ministry of Commerce and Industry" },
      { name: "Monetary Policy Committee decision", by: "Reserve Bank of India", event: "interest-rate-decision" },
      { name: "Monsoon forecasts and progress reports", by: "India Meteorological Department" },
    ],
    indexName: "Nifty 50 and BSE Sensex",
    indexNote: "The two best-known indices of Indian shares. Neither is a GIO4X instrument.",
    indices: [],
  },
];

const bySlug = new Map(ECONOMIES.map((e) => [e.slug, e]));
export const getEconomy = (slug: string) => bySlug.get(slug);
export const economyHref = (e: Pick<Economy, "slug">) => `/markets/economies/${e.slug}`;

/** The profile of an economy's currency. */
export const economyCurrency = (e: Pick<Economy, "currency">): CurrencyProfile | undefined => CURRENCY_PROFILES.find((c) => c.code === e.currency);

/** The economy behind a currency, where it has a profile. */
export const economyOfCurrency = (code: string): Economy | undefined => ECONOMIES.find((e) => e.currency === code);

/** The central bank's Central Bank Watch page, when the site has one. */
export const economyBank = (e: Pick<Economy, "currency">): CentralBank | undefined => centralBanks.find((b) => b.currency === e.currency);

/** The GIO4X index instruments on an economy's stock market: read from instruments.ts, so the two cannot disagree. */
export const economyIndices = (e: Pick<Economy, "indices">): Instrument[] => e.indices.map((s) => getInstrument("indices", s)).filter((i): i is Instrument => !!i);

/** The first sentence of a profile: the line shown in lists, search results and page descriptions. */
export const economyLine = (e: Economy) => {
  const stop = e.is.indexOf(". ");
  return stop === -1 ? e.is : e.is.slice(0, stop + 1);
};
