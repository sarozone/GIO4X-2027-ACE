/**
 * ON THIS DAY IN MARKETS — dated events from market history, for /on-this-day
 * and the small card other pages may place (components/history/OnThisDay.tsx).
 *
 * The rule this file keeps: an event is here only if its exact date is
 * certain. A doubtful date is a reason to leave the event out, so the list is
 * shorter than it could be and some days of the year have nothing. A number
 * appears only where it is the famous, undisputed fact of the event (the size
 * of a one-day fall in a published index, a rate a central bank announced);
 * nothing here is a quotation beyond a phrase of two or three words, and
 * nothing is a lesson in what to do. Dates before a country adopted the
 * present calendar are given as the histories of that country give them.
 *
 * `link` goes to a page of this site that covers the event or its subject, and
 * is set only where such a page exists: each was checked against the route
 * tree and the data when written.
 */
export type DayEvent = {
  /** 1 to 12 */
  month: number;
  day: number;
  year: number;
  title: string;
  /** two or three sentences: what happened */
  text: string;
  link?: { href: string; label: string };
};

const history = (slug: string, label: string) => ({ href: `/history/${slug}`, label });
const bank = (slug: string, label: string) => ({ href: `/markets/central-banks/${slug}`, label });

const TULIPS = history("tulip-mania", "Tulip mania");
const Y1929 = history("wall-street-crash-1929", "The Wall Street Crash");
const Y1987 = history("black-monday-1987", "Black Monday");
const Y1992 = history("black-wednesday-1992", "Black Wednesday");
const ASIA = history("asian-financial-crisis-1997", "The Asian financial crisis");
const DOTCOM = history("dot-com-bubble", "The dot-com bubble");
const Y2008 = history("global-financial-crisis-2008", "The global financial crisis");
const FLASH = history("flash-crash-2010", "The flash crash");
const FRANC = history("swiss-franc-2015", "The Swiss franc move");
const Y2020 = history("pandemic-crash-2020", "The pandemic crash");
const FED = bank("fed", "The Federal Reserve");
const ECB = bank("ecb", "The European Central Bank");
const BOE = bank("boe", "The Bank of England");
const BOJ = bank("boj", "The Bank of Japan");
const SNB = bank("snb", "The Swiss National Bank");
const BONDS = { href: "/primers/bonds-and-interest-rates", label: "Primer: bonds and interest rates" };
const FUNDS = { href: "/primers/etfs-and-funds", label: "Primer: ETFs and funds" };
const REGULATION = { href: "/primers/regulation-explained", label: "Primer: regulation explained" };
const COMMODITIES = { href: "/primers/how-commodities-trade", label: "Primer: how commodities trade" };

export const ON_THIS_DAY: readonly DayEvent[] = [
  // ---- January
  { month: 1, day: 1, year: 1995, title: "The World Trade Organization begins work", text: "The World Trade Organization comes into being, taking over from the General Agreement on Tariffs and Trade as the body that keeps the rules of international trade." },
  { month: 1, day: 1, year: 1999, title: "The euro is launched", text: "Eleven countries of the European Union adopt the euro as their common currency. For three years it exists for accounts and electronic payments only: national notes and coins stay in use as units of it.", link: ECB },
  { month: 1, day: 1, year: 2002, title: "Euro notes and coins enter circulation", text: "Euro notes and coins come into use in twelve countries. The national currencies are withdrawn over the following weeks.", link: ECB },
  { month: 1, day: 3, year: 2009, title: "The first Bitcoin block", text: "The first block of the Bitcoin blockchain, known as the genesis block, is created. Its data includes a newspaper headline of that day about a second rescue for banks.", link: { href: "/markets/crypto", label: "Crypto at GIO4X" } },
  { month: 1, day: 3, year: 2019, title: "The yen flash crash", text: "In the thin hours between the close in New York and the opening in Tokyo, during Japan’s New Year holiday, the yen jumps by several per cent against the dollar and other currencies within minutes. Much of the move is reversed soon afterwards." },
  { month: 1, day: 4, year: 2016, title: "China’s new circuit breaker halts trading on its first day", text: "On the first trading day under a new circuit-breaker rule, share trading in China is stopped for the day after the CSI 300 index falls 7%. The same happens three days later, and the rule is suspended." },
  { month: 1, day: 10, year: 1901, title: "Oil at Spindletop", text: "A well at Spindletop, near Beaumont in Texas, strikes oil and gushes for days before it is brought under control. It is usually taken as the start of the modern American oil industry.", link: { href: "/markets/energy", label: "Energy markets" } },
  { month: 1, day: 11, year: 2024, title: "Spot bitcoin funds begin trading in the United States", text: "Exchange-traded funds that hold bitcoin directly begin trading in the United States, a day after the Securities and Exchange Commission approved them.", link: FUNDS },
  { month: 1, day: 13, year: 1999, title: "Brazil devalues the real", text: "Brazil’s central bank widens the band in which the real is allowed to trade, in effect devaluing it. Two days later the currency is left to float." },
  { month: 1, day: 15, year: 2015, title: "The Swiss National Bank removes the franc’s floor", text: "Without warning, the Swiss National Bank ends the minimum exchange rate of 1.20 francs to the euro that it had defended for more than three years. The franc rises by far more than a normal day’s range within minutes, and for a time there are almost no prices at all.", link: FRANC },
  { month: 1, day: 21, year: 1980, title: "Gold reaches $850", text: "Gold is fixed at $850 an ounce in London after a steep rise amid high inflation and political tension. The price falls back sharply within days, and that level is not seen again for twenty-eight years.", link: { href: "/markets/metals", label: "Metals markets" } },
  { month: 1, day: 22, year: 2008, title: "An emergency cut by the Federal Reserve", text: "After share markets around the world fall heavily, the Federal Reserve lowers its target rate by three-quarters of a percentage point between scheduled meetings.", link: Y2008 },
  { month: 1, day: 22, year: 2015, title: "The European Central Bank announces bond purchases", text: "A week after the Swiss franc’s move, the European Central Bank announces a programme of government bond purchases.", link: FRANC },
  { month: 1, day: 24, year: 1848, title: "Gold at Sutter’s Mill", text: "James Marshall finds gold at Sutter’s Mill in California. The rush that follows is one of the largest movements of people in American history." },
  { month: 1, day: 28, year: 2021, title: "Brokers restrict buying of GameStop", text: "After a rapid rise in the shares of GameStop and a few other companies, driven by individual investors, several retail brokers restrict purchases of them. The episode leads to hearings in the United States Congress." },
  { month: 1, day: 29, year: 1993, title: "The first exchange-traded fund in the United States", text: "The first exchange-traded fund listed in the United States, which follows the S&P 500 index, begins trading on the American Stock Exchange.", link: FUNDS },
  { month: 1, day: 29, year: 2016, title: "The Bank of Japan adopts a negative rate", text: "The Bank of Japan announces that it will apply an interest rate of −0.1% to part of the balances that banks hold with it.", link: BOJ },
  { month: 1, day: 30, year: 1934, title: "The Gold Reserve Act", text: "The United States passes the Gold Reserve Act, transferring the gold held by the Federal Reserve to the Treasury. The next day the dollar’s value is fixed at $35 to an ounce of gold, where it stays until 1971." },

  // ---- February
  { month: 2, day: 3, year: 1637, title: "A tulip sale in Haarlem finds no buyers", text: "At a routine tavern sale in Haarlem, bulbs fail to find buyers at the expected prices. This is the date usually given for the turn of the tulip trade.", link: TULIPS },
  { month: 2, day: 5, year: 2018, title: "A record rise in the volatility index", text: "The VIX index of expected volatility in American shares more than doubles in a day, its largest one-day rise on record. Exchange-traded products built to gain from calm markets lose almost all their value, and one of the largest is closed.", link: { href: "/glossary/vix", label: "Glossary: VIX" } },
  { month: 2, day: 7, year: 1992, title: "The Maastricht Treaty is signed", text: "The treaty that creates the European Union and sets out the path to a single currency is signed at Maastricht in the Netherlands.", link: Y1992 },
  { month: 2, day: 8, year: 1971, title: "The Nasdaq begins trading", text: "The Nasdaq begins operating as the first electronic stock market: quotations for shares traded over the counter are shown on screens instead of being called on a floor." },
  { month: 2, day: 12, year: 1999, title: "Japan’s zero interest rate policy", text: "The Bank of Japan decides to guide the overnight interest rate as low as possible. It is the start of its zero interest rate policy.", link: BOJ },
  { month: 2, day: 15, year: 1971, title: "Decimal Day", text: "The United Kingdom and Ireland change to decimal currency. The pound, until then divided into twenty shillings of twelve pence each, becomes one hundred new pence." },
  { month: 2, day: 17, year: 2008, title: "Northern Rock is nationalised", text: "The British government announces that Northern Rock, which had suffered a run by its depositors five months earlier, is to be taken into public ownership.", link: Y2008 },
  { month: 2, day: 19, year: 2020, title: "A record close before the pandemic crash", text: "The S&P 500 closes at a record high. Within five weeks it is about a third lower.", link: Y2020 },
  { month: 2, day: 22, year: 1987, title: "The Louvre Accord", text: "Finance ministers of the leading industrial countries, meeting at the Louvre in Paris, agree to try to steady the dollar after the two-year fall that followed the Plaza Accord." },
  { month: 2, day: 25, year: 1791, title: "The first Bank of the United States is chartered", text: "President Washington signs the charter of the Bank of the United States, a national bank proposed by Alexander Hamilton, for a term of twenty years." },
  { month: 2, day: 25, year: 1862, title: "The greenback", text: "To pay for the Civil War, the United States authorises paper money that cannot be exchanged for gold or silver. The notes become known as greenbacks." },
  { month: 2, day: 26, year: 1995, title: "Barings collapses", text: "Barings, the oldest merchant bank in London, is placed in administration. One trader in Singapore, Nick Leeson, had run up losses on futures larger than the bank’s capital." },
  { month: 2, day: 27, year: 2007, title: "Shanghai falls, and other markets follow", text: "Shares in Shanghai fall by about 9% in a day, the largest fall there in a decade, and markets around the world fall after them." },
  { month: 2, day: 28, year: 2022, title: "Russia raises its key rate to 20%", text: "Four days after Russia’s invasion of Ukraine, and after the sanctions that followed, the Bank of Russia raises its key rate from 9.5% to 20%. Share trading in Moscow is suspended and stays closed for almost a month." },

  // ---- March
  { month: 3, day: 1, year: 1947, title: "The International Monetary Fund begins operations", text: "The International Monetary Fund, agreed at Bretton Woods in 1944, begins its financial operations." },
  { month: 3, day: 3, year: 2020, title: "An unscheduled cut by the Federal Reserve", text: "The Federal Reserve lowers interest rates by half a percentage point at an unscheduled meeting, as the spread of the coronavirus unsettles markets.", link: Y2020 },
  { month: 3, day: 5, year: 2009, title: "The Bank of England begins quantitative easing", text: "The Bank of England lowers Bank Rate to 0.5% and announces that it will buy assets with newly created money.", link: BOE },
  { month: 3, day: 6, year: 1933, title: "Roosevelt’s bank holiday", text: "Two days after taking office, President Roosevelt closes every bank in the United States by proclamation. The Emergency Banking Act is passed on 9 March, and banks judged sound begin to reopen on 13 March.", link: Y1929 },
  { month: 3, day: 8, year: 1817, title: "New York’s brokers adopt a constitution", text: "Brokers in New York adopt a constitution and a name, the New York Stock & Exchange Board, and rent rooms on Wall Street. It is renamed the New York Stock Exchange in 1863." },
  { month: 3, day: 8, year: 2022, title: "The London Metal Exchange suspends nickel", text: "After the price of nickel more than doubles within hours, briefly passing $100,000 a tonne, the London Metal Exchange suspends trading in the metal and cancels the day’s trades.", link: COMMODITIES },
  { month: 3, day: 9, year: 2009, title: "The low of the financial crisis", text: "The S&P 500 closes at 676.53, its low, about 57% below its peak of October 2007.", link: Y2008 },
  { month: 3, day: 10, year: 2000, title: "The Nasdaq’s peak", text: "The Nasdaq Composite closes at 5,048.62, the peak of the dot-com bubble. It does not close higher for fifteen years.", link: DOTCOM },
  { month: 3, day: 10, year: 2023, title: "Silicon Valley Bank is closed", text: "Regulators close Silicon Valley Bank after its depositors try to withdraw tens of billions of dollars in a day. It is the largest failure of a United States bank since 2008.", link: BONDS },
  { month: 3, day: 13, year: 1979, title: "The European Monetary System begins", text: "The European Monetary System comes into operation. Its exchange rate mechanism holds member currencies within bands around agreed central rates.", link: Y1992 },
  { month: 3, day: 14, year: 1900, title: "The Gold Standard Act", text: "The United States passes the Gold Standard Act, making gold the only standard for redeeming paper money and closing a long political argument over silver." },
  { month: 3, day: 15, year: 2020, title: "The Federal Reserve cuts to zero on a Sunday", text: "The Federal Reserve lowers its target rate to a range of 0% to 0.25% and announces bond purchases. Trading in New York is halted again when it opens the next day.", link: Y2020 },
  { month: 3, day: 16, year: 2008, title: "Bear Stearns is sold", text: "JPMorgan Chase agrees to buy the investment bank Bear Stearns, which had run out of funding within days, with financing from the Federal Reserve.", link: Y2008 },
  { month: 3, day: 16, year: 2013, title: "Cyprus announces a levy on deposits", text: "As a condition of an international rescue, Cyprus announces a one-off levy on bank deposits, insured ones included. Its banks stay shut for almost two weeks; the plan is changed to spare insured deposits, and controls on moving money are imposed." },
  { month: 3, day: 17, year: 1968, title: "The London Gold Pool ends", text: "Central bankers meeting in Washington end the Gold Pool, through which they had sold gold to hold the market price at $35 an ounce. Two prices follow: the official one between central banks, and a free one for everyone else." },
  { month: 3, day: 18, year: 2011, title: "The Group of Seven sells yen", text: "A week after the earthquake and tsunami in Japan, with the yen at a record high against the dollar, the Group of Seven countries sell yen together. It is their first jointly agreed intervention in currencies since 2000.", link: BOJ },
  { month: 3, day: 19, year: 2001, title: "Japan begins quantitative easing", text: "The Bank of Japan changes its target from an interest rate to the quantity of reserves that banks hold with it. The policy becomes known as quantitative easing.", link: { href: "/glossary/quantitative-easing", label: "Glossary: quantitative easing" } },
  { month: 3, day: 19, year: 2023, title: "UBS agrees to take over Credit Suisse", text: "After a weekend of talks arranged by the Swiss authorities, UBS agrees to take over its rival Credit Suisse.", link: SNB },
  { month: 3, day: 19, year: 2024, title: "Japan ends negative interest rates", text: "The Bank of Japan raises its policy rate for the first time since 2007, ending eight years of negative interest rates.", link: BOJ },
  { month: 3, day: 20, year: 1602, title: "The Dutch East India Company is chartered", text: "The Dutch East India Company receives its charter. Its shares, sold to the public and traded in Amsterdam, are the usual starting point for histories of the stock market." },
  { month: 3, day: 23, year: 2020, title: "The low of the pandemic crash", text: "The S&P 500 closes about 34% below its peak of five weeks earlier. On the same day the Federal Reserve announces that its bond purchases will have no set limit.", link: Y2020 },
  { month: 3, day: 25, year: 1957, title: "The Treaty of Rome", text: "Six countries sign the Treaty of Rome, creating the European Economic Community." },
  { month: 3, day: 27, year: 1980, title: "Silver Thursday", text: "The price of silver falls steeply when the Hunt brothers, who had built up a very large position in the metal with borrowed money, cannot meet a margin call.", link: { href: "/glossary/margin-call", label: "Glossary: margin call" } },
  { month: 3, day: 30, year: 1983, title: "Crude oil futures begin trading in New York", text: "The New York Mercantile Exchange begins trading futures on crude oil, the contract known as West Texas Intermediate.", link: COMMODITIES },

  // ---- April
  { month: 4, day: 1, year: 1998, title: "Japan frees currency dealing", text: "Japan’s revised Foreign Exchange Law takes effect, ending the rule that currency dealing had to pass through authorised banks. It is among the first steps of the reforms known as Japan’s Big Bang." },
  { month: 4, day: 2, year: 1792, title: "The Coinage Act", text: "The United States Congress passes the Coinage Act, which establishes a mint and makes the dollar the country’s unit of money." },
  { month: 4, day: 2, year: 2009, title: "The London summit", text: "Leaders of the Group of Twenty, meeting in London, agree measures against the financial crisis, among them a large increase in the resources of the International Monetary Fund.", link: Y2008 },
  { month: 4, day: 4, year: 2013, title: "The Bank of Japan sets out to double the monetary base", text: "Under a new governor, Haruhiko Kuroda, the Bank of Japan announces that it will double the monetary base within two years in pursuit of an inflation target of 2%.", link: BOJ },
  { month: 4, day: 5, year: 1933, title: "Americans are ordered to hand in their gold", text: "By executive order, people in the United States are required to deliver most gold coin, bullion and gold certificates to the Federal Reserve in exchange for other money." },
  { month: 4, day: 9, year: 2001, title: "American shares are priced in cents", text: "The Nasdaq completes its change to prices in dollars and cents. The New York Stock Exchange had changed in January, so American shares are no longer quoted in fractions of a dollar.", link: { href: "/primers/market-microstructure", label: "Primer: market microstructure" } },
  { month: 4, day: 15, year: 2013, title: "Gold’s largest fall in thirty years", text: "Gold falls by about 9% in a day, its largest one-day fall in three decades.", link: { href: "/markets/metals", label: "Metals markets" } },
  { month: 4, day: 19, year: 1995, title: "The dollar falls below 80 yen", text: "The dollar falls below 80 yen for the first time. The low of that day stands until 2011." },
  { month: 4, day: 20, year: 2020, title: "American crude oil settles below zero", text: "With storage at the delivery point almost full, the expiring futures contract for West Texas Intermediate settles at −$37.63 a barrel: holders who could not take delivery paid others to take the contracts from them.", link: COMMODITIES },
  { month: 4, day: 21, year: 1982, title: "Futures on the S&P 500", text: "The Chicago Mercantile Exchange begins trading futures on the S&P 500 index.", link: { href: "/markets/indices", label: "Index markets" } },
  { month: 4, day: 23, year: 2013, title: "A false message moves the market", text: "A message sent from a news agency’s hacked social media account falsely reports explosions at the White House. American share indices fall by about 1% within minutes and recover as soon as it is denied." },
  { month: 4, day: 26, year: 1973, title: "The first listed options exchange", text: "The Chicago Board Options Exchange opens, the first exchange for standardised, listed options on shares." },
  { month: 4, day: 27, year: 2010, title: "Greece’s debt is rated below investment grade", text: "Standard & Poor’s lowers its rating of Greek government debt to below investment grade.", link: BONDS },

  // ---- May
  { month: 5, day: 1, year: 1975, title: "May Day on Wall Street", text: "Fixed commissions on the New York Stock Exchange are abolished by order of the Securities and Exchange Commission. From this day brokers set their own charges, which opens the way to discount brokers." },
  { month: 5, day: 2, year: 2010, title: "The first rescue of Greece", text: "The countries of the euro area and the International Monetary Fund agree loans of €110 billion to Greece, on condition of spending cuts and tax rises." },
  { month: 5, day: 6, year: 1997, title: "The Bank of England is to set interest rates", text: "Days after a general election, the new Chancellor of the Exchequer announces that the Bank of England will be given operational independence to set interest rates.", link: BOE },
  { month: 5, day: 6, year: 2010, title: "The flash crash", text: "In the middle of the afternoon the Dow Jones Industrial Average falls by almost 1,000 points within minutes and recovers most of the fall within the half-hour. Some shares trade at a penny, and thousands of trades are later cancelled.", link: FLASH },
  { month: 5, day: 9, year: 1873, title: "The Vienna stock exchange crashes", text: "The Vienna stock exchange crashes. The panic spreads through Europe and, in September, to the United States, and years of depression follow." },
  { month: 5, day: 10, year: 1837, title: "The Panic of 1837", text: "Banks in New York stop redeeming their notes in gold and silver, and banks across the United States follow. A depression of several years begins." },
  { month: 5, day: 16, year: 1972, title: "The first currency futures", text: "The International Monetary Market opens at the Chicago Mercantile Exchange, trading futures on seven currencies. They are the first financial futures.", link: { href: "/markets/forex", label: "Forex markets" } },
  { month: 5, day: 17, year: 1792, title: "The Buttonwood Agreement", text: "Twenty-four brokers sign an agreement under a buttonwood tree on Wall Street, undertaking to deal with one another and to charge a fixed commission. The New York Stock Exchange traces its origin to it." },
  { month: 5, day: 18, year: 2012, title: "Facebook’s flotation", text: "Facebook’s shares begin trading on the Nasdaq after one of the largest flotations in history. A technical fault at the exchange delays the opening and leaves many orders unconfirmed for hours." },
  { month: 5, day: 21, year: 1998, title: "Indonesia’s president resigns", text: "After a collapse in the rupiah, steep rises in prices and riots, President Suharto of Indonesia resigns after more than thirty years in office.", link: ASIA },
  { month: 5, day: 22, year: 2010, title: "Two pizzas for 10,000 bitcoins", text: "A programmer in Florida pays 10,000 bitcoins for two pizzas, in what is usually described as the first purchase of goods with bitcoin." },
  { month: 5, day: 22, year: 2013, title: "The taper tantrum begins", text: "The chairman of the Federal Reserve, Ben Bernanke, tells Congress that the bank could begin to slow its bond purchases at one of its coming meetings. Bond yields rise sharply over the following weeks, and money leaves emerging markets.", link: BONDS },
  { month: 5, day: 26, year: 1896, title: "The first Dow Jones Industrial Average", text: "Charles Dow publishes the first Dow Jones Industrial Average: the share prices of twelve companies, added together and divided by twelve.", link: { href: "/markets/indices", label: "Index markets" } },
  { month: 5, day: 27, year: 1933, title: "The Securities Act", text: "The Securities Act becomes law in the United States. Securities offered to the public must be registered, with the facts an investor needs set out in a prospectus.", link: REGULATION },

  // ---- June
  { month: 6, day: 1, year: 1998, title: "The European Central Bank is established", text: "The European Central Bank is established in Frankfurt, seven months before the euro is launched.", link: ECB },
  { month: 6, day: 2, year: 1992, title: "Denmark votes against the Maastricht Treaty", text: "Danish voters reject the Maastricht Treaty in a referendum. Doubt spreads about monetary union and about the exchange rates of the European mechanism.", link: Y1992 },
  { month: 6, day: 5, year: 1933, title: "Gold clauses are cancelled", text: "The United States Congress declares void the clauses in contracts that require payment in gold." },
  { month: 6, day: 5, year: 2014, title: "The European Central Bank goes below zero", text: "The European Central Bank lowers its deposit rate to −0.10%. It is the first of the largest central banks to take a policy rate below zero.", link: ECB },
  { month: 6, day: 6, year: 1934, title: "The Securities and Exchange Commission is created", text: "The Securities Exchange Act becomes law in the United States, creating the Securities and Exchange Commission to oversee exchanges, brokers and trading.", link: REGULATION },
  { month: 6, day: 12, year: 2015, title: "The peak in Shanghai", text: "The Shanghai Composite index closes at its peak after more than doubling in a year, with much of the buying done on borrowed money. It falls by about a third over the next four weeks." },
  { month: 6, day: 16, year: 1933, title: "The Glass–Steagall Act", text: "The Banking Act of 1933 becomes law in the United States. It separates commercial banking from investment banking and creates federal insurance for bank deposits.", link: Y1929 },
  { month: 6, day: 17, year: 1930, title: "The Smoot–Hawley tariff", text: "President Hoover signs the Smoot–Hawley Tariff Act, raising duties on thousands of imported goods. Other countries answer with tariffs of their own." },
  { month: 6, day: 17, year: 1998, title: "The United States and Japan buy yen", text: "With the yen at its weakest in eight years, the United States and Japan buy yen together to stop its fall.", link: ASIA },
  { month: 6, day: 20, year: 1948, title: "The Deutsche Mark", text: "The Deutsche Mark replaces the Reichsmark in the western zones of occupied Germany." },
  { month: 6, day: 23, year: 1972, title: "The pound floats", text: "The United Kingdom lets the pound float, as a temporary measure. It has floated ever since, apart from two years inside the European exchange rate mechanism.", link: Y1992 },
  { month: 6, day: 24, year: 2016, title: "Sterling falls after the referendum", text: "The result of the United Kingdom’s referendum on membership of the European Union is announced in the early hours. Sterling falls by more than 10% against the dollar at one point, to its lowest since 1985." },
  { month: 6, day: 26, year: 1974, title: "Bankhaus Herstatt is closed", text: "German regulators close Bankhaus Herstatt at the end of the German business day. It had received Deutsche Marks from its counterparties in currency trades and had not yet paid the dollars due in New York. The risk that one side of a currency trade is paid and the other is not has been called Herstatt risk ever since." },
  { month: 6, day: 27, year: 1967, title: "The first cash machine", text: "The first cash machine comes into use, at a branch of Barclays in Enfield, north London." },
  { month: 6, day: 29, year: 2015, title: "Greek banks close", text: "Greek banks stay shut and limits are placed on withdrawals of cash, after talks with the country’s creditors break down and a referendum is called." },

  // ---- July
  { month: 7, day: 1, year: 1990, title: "German monetary union", text: "The Deutsche Mark becomes the currency of East Germany, three months before the two German states unite.", link: Y1992 },
  { month: 7, day: 2, year: 1997, title: "Thailand floats the baht", text: "After spending much of its reserves in defence of the exchange rate, Thailand lets the baht float, and it falls at once. This is the date usually given for the start of the Asian financial crisis.", link: ASIA },
  { month: 7, day: 3, year: 1884, title: "Charles Dow’s first average", text: "Charles Dow publishes his first average of share prices: eleven companies, nine of them railways." },
  { month: 7, day: 5, year: 2015, title: "Greece votes no", text: "Greek voters reject the terms offered by the country’s creditors. A new programme of loans, on terms no easier, is agreed eight days later." },
  { month: 7, day: 8, year: 1889, title: "The Wall Street Journal", text: "The first issue of The Wall Street Journal is published in New York." },
  { month: 7, day: 8, year: 1932, title: "The bottom, three years on", text: "After almost three years of falling prices and waves of bank failures, the Dow Jones Industrial Average closes at 41.22, about 89% below its peak of September 1929.", link: Y1929 },
  { month: 7, day: 10, year: 1832, title: "Jackson’s veto", text: "President Jackson vetoes the renewal of the charter of the Second Bank of the United States." },
  { month: 7, day: 11, year: 2008, title: "Oil’s record", text: "The price of crude oil reaches its record, above $147 a barrel. By December it is below $40.", link: { href: "/markets/energy", label: "Energy markets" } },
  { month: 7, day: 15, year: 2008, title: "The euro’s high", text: "The euro reaches its highest level against the dollar, a little above $1.60.", link: ECB },
  { month: 7, day: 21, year: 2002, title: "WorldCom files for bankruptcy", text: "WorldCom files for bankruptcy after disclosing that billions of dollars of expenses had been wrongly recorded. It is the largest filing in United States history until 2008.", link: DOTCOM },
  { month: 7, day: 21, year: 2010, title: "The Dodd–Frank Act", text: "The Dodd–Frank Act becomes law in the United States, the largest revision of its financial regulation since the 1930s.", link: REGULATION },
  { month: 7, day: 22, year: 1944, title: "The Bretton Woods agreement is signed", text: "Delegates of forty-four countries, meeting at Bretton Woods in New Hampshire, sign the agreement that founds the International Monetary Fund and the World Bank. Currencies are to be fixed against the dollar, and the dollar against gold." },
  { month: 7, day: 26, year: 2012, title: "“Whatever it takes”", text: "The president of the European Central Bank, Mario Draghi, says in London that within its mandate the bank is ready to do “whatever it takes” to preserve the euro. Yields on the bonds of Spain and Italy begin to fall.", link: ECB },
  { month: 7, day: 27, year: 1694, title: "The Bank of England is founded", text: "The Bank of England receives its royal charter. It is founded to lend to the government.", link: BOE },
  { month: 7, day: 30, year: 2002, title: "The Sarbanes–Oxley Act", text: "After accounting scandals at several large listed companies, the Sarbanes–Oxley Act becomes law in the United States, tightening the rules on company accounts and their auditors.", link: DOTCOM },
  { month: 7, day: 31, year: 1914, title: "The New York Stock Exchange does not open", text: "With war beginning in Europe, the New York Stock Exchange stays shut. It remains closed for more than four months, the longest closure in its history." },

  // ---- August
  { month: 8, day: 1, year: 2012, title: "Knight Capital’s forty-five minutes", text: "A fault in new software at the trading firm Knight Capital sends a flood of unintended orders into the New York market for about forty-five minutes. The firm loses about $440 million and is taken over within months.", link: { href: "/primers/algorithmic-trading", label: "Primer: algorithmic trading" } },
  { month: 8, day: 1, year: 2018, title: "European rules for retail CFDs", text: "European rules for contracts for difference sold to retail clients take effect: limits on leverage, the closing of positions when margin falls to half the amount required, protection against negative balances and a standard risk warning.", link: REGULATION },
  { month: 8, day: 2, year: 1990, title: "Iraq invades Kuwait", text: "Iraq invades Kuwait. The price of oil rises steeply over the following two months.", link: { href: "/markets/energy", label: "Energy markets" } },
  { month: 8, day: 5, year: 2011, title: "The United States loses a AAA rating", text: "Standard & Poor’s lowers its credit rating of the United States from AAA for the first time.", link: BONDS },
  { month: 8, day: 5, year: 2024, title: "Tokyo’s largest fall since 1987", text: "The Nikkei 225 falls by more than 12%, its largest one-day fall since 1987, as the yen rises quickly and positions financed in yen are closed. A large part of the fall is recovered the next day.", link: { href: "/strategies/carry-trade", label: "Strategy library: the carry trade" } },
  { month: 8, day: 6, year: 1979, title: "Paul Volcker takes office", text: "Paul Volcker becomes chairman of the Federal Reserve, with inflation in the United States in double figures.", link: FED },
  { month: 8, day: 9, year: 1995, title: "Netscape’s first day", text: "Shares in Netscape, the maker of an early web browser, end their first day of trading at more than twice the offer price. The day is usually taken as the start of the dot-com boom.", link: DOTCOM },
  { month: 8, day: 9, year: 2007, title: "BNP Paribas suspends three funds", text: "The French bank BNP Paribas suspends three funds, saying that it cannot value the mortgage securities they hold. Lending between banks tightens at once.", link: Y2008 },
  { month: 8, day: 11, year: 2015, title: "China lowers the yuan’s reference rate", text: "The People’s Bank of China lowers the daily reference rate for the yuan by almost 2%, the largest one-day change in two decades." },
  { month: 8, day: 12, year: 1982, title: "A low, and the start of a long rise", text: "The Dow Jones Industrial Average closes at its low for the period. A rise that lasts, with interruptions, until 2000 begins from here." },
  { month: 8, day: 14, year: 1997, title: "Indonesia floats the rupiah", text: "Six weeks after Thailand, Indonesia stops defending its currency and lets the rupiah float.", link: ASIA },
  { month: 8, day: 14, year: 1998, title: "Hong Kong buys its own share market", text: "Hong Kong’s monetary authority begins buying shares in the local market, to defeat speculators who were selling both the shares and the currency. It goes on buying for two weeks.", link: ASIA },
  { month: 8, day: 15, year: 1971, title: "Nixon ends the dollar’s link to gold", text: "In a Sunday evening broadcast, President Nixon announces that the United States will no longer exchange dollars held by foreign governments for gold. The system of fixed exchange rates agreed at Bretton Woods does not survive it.", link: { href: "/glossary/floating-exchange-rate", label: "Glossary: floating exchange rate" } },
  { month: 8, day: 17, year: 1998, title: "Russia defaults", text: "Russia devalues the rouble, stops payment on its domestic government debt and declares a moratorium on payments to foreign creditors." },
  { month: 8, day: 19, year: 2004, title: "Google’s flotation", text: "Google’s shares begin trading after a flotation run as an auction, an unusual method intended to open the sale to ordinary investors." },
  { month: 8, day: 24, year: 2015, title: "A disorderly opening in New York", text: "After further falls in China, the Dow Jones Industrial Average drops by more than 1,000 points within minutes of the opening. More than a thousand trading pauses are triggered in shares and exchange-traded funds, many of which trade far from the value of what they hold.", link: FUNDS },
  { month: 8, day: 25, year: 1987, title: "The peak before Black Monday", text: "The Dow Jones Industrial Average closes at its peak for 1987, after a strong rise since the start of the year. Eight weeks later it falls by 22.6% in a day.", link: Y1987 },

  // ---- September
  { month: 9, day: 1, year: 1998, title: "Malaysia imposes capital controls", text: "Malaysia announces controls on the movement of capital. The next day the ringgit is fixed at 3.80 to the dollar.", link: ASIA },
  { month: 9, day: 3, year: 1929, title: "The peak of 1929", text: "The Dow Jones Industrial Average closes at 381.17. It does not close higher for twenty-five years.", link: Y1929 },
  { month: 9, day: 6, year: 2011, title: "A floor under the euro in francs", text: "The Swiss National Bank sets a minimum exchange rate of 1.20 francs to the euro and says that it will buy foreign currency without limit to hold it.", link: FRANC },
  { month: 9, day: 7, year: 2008, title: "Fannie Mae and Freddie Mac are taken over", text: "The United States government takes control of Fannie Mae and Freddie Mac, the two companies that stand behind a large share of American mortgages.", link: Y2008 },
  { month: 9, day: 11, year: 2001, title: "New York’s markets stay shut", text: "After the attacks in New York and Washington, the New York Stock Exchange and the Nasdaq do not open. They reopen on 17 September, after the longest closure since 1933." },
  { month: 9, day: 12, year: 2010, title: "Basel III is agreed", text: "Banking supervisors from twenty-seven countries agree the outline of Basel III, which requires banks to hold more capital, and capital of better quality." },
  { month: 9, day: 14, year: 2007, title: "The run on Northern Rock", text: "The Bank of England gives emergency support to Northern Rock, and depositors queue outside its branches to withdraw their money.", link: Y2008 },
  { month: 9, day: 15, year: 2008, title: "Lehman Brothers files for bankruptcy", text: "Lehman Brothers files for bankruptcy, the largest filing in United States history. On the same day Merrill Lynch agrees to be bought by Bank of America.", link: Y2008 },
  { month: 9, day: 16, year: 1992, title: "Black Wednesday", text: "The United Kingdom raises interest rates twice in a day in defence of the pound, then announces in the evening that sterling’s membership of the European exchange rate mechanism is suspended.", link: Y1992 },
  { month: 9, day: 16, year: 2008, title: "The rescue of AIG", text: "The Federal Reserve lends $85 billion to the insurer AIG, a day after Lehman Brothers was allowed to fail.", link: Y2008 },
  { month: 9, day: 18, year: 1873, title: "Jay Cooke & Company fails", text: "The banking house of Jay Cooke & Company, heavily committed to railway bonds, fails. The New York Stock Exchange closes for ten days and a long depression follows." },
  { month: 9, day: 18, year: 1949, title: "The pound is devalued to $2.80", text: "The United Kingdom devalues the pound from $4.03 to $2.80. Many other countries devalue within days." },
  { month: 9, day: 19, year: 2008, title: "A ban on short selling", text: "The Securities and Exchange Commission temporarily bans the short selling of shares in several hundred financial companies. The regulator in the United Kingdom had done the same the day before.", link: { href: "/glossary/short-selling", label: "Glossary: short selling" } },
  { month: 9, day: 21, year: 1931, title: "Britain leaves the gold standard", text: "The United Kingdom suspends the gold standard. The pound, no longer exchangeable for gold at a fixed rate, falls sharply against the dollar." },
  { month: 9, day: 22, year: 1985, title: "The Plaza Accord", text: "Finance ministers and central bankers of five countries, meeting at the Plaza Hotel in New York, agree to bring the dollar down. It falls steeply against the yen and the mark over the next two years." },
  { month: 9, day: 22, year: 2000, title: "Central banks buy euros", text: "The European Central Bank, with the central banks of the United States, Japan, the United Kingdom and Canada, buys euros to support the currency, which had lost more than a quarter of its value against the dollar since its launch.", link: ECB },
  { month: 9, day: 22, year: 2022, title: "Japan buys yen for the first time since 1998", text: "After the dollar rises above 145 yen, Japan intervenes to support its currency for the first time since 1998.", link: BOJ },
  { month: 9, day: 23, year: 1998, title: "The rescue of Long-Term Capital Management", text: "Fourteen banks and brokers, brought together by the Federal Reserve Bank of New York, agree to put $3.6 billion into the hedge fund Long-Term Capital Management so that its positions can be wound down in an orderly way." },
  { month: 9, day: 24, year: 1869, title: "Black Friday in the gold room", text: "An attempt by Jay Gould and James Fisk to corner the gold market in New York collapses when the Treasury sells gold. The price falls within minutes and many speculators are ruined." },
  { month: 9, day: 25, year: 2008, title: "Washington Mutual is seized", text: "Regulators seize Washington Mutual, the largest failure of a bank in United States history, and sell its banking business to JPMorgan Chase.", link: Y2008 },
  { month: 9, day: 26, year: 1999, title: "The Washington Agreement on Gold", text: "Fifteen European central banks announce that they will limit their sales of gold for five years. The price of gold, which had been at a twenty-year low a few weeks earlier, rises sharply.", link: { href: "/markets/metals", label: "Metals markets" } },
  { month: 9, day: 28, year: 2022, title: "The Bank of England buys gilts", text: "Five days after a budget of unfunded tax cuts sent the yields on British government bonds sharply higher, the Bank of England announces temporary purchases of long-dated bonds. Pension funds that had used leverage were being forced to sell bonds to meet margin calls, which pushed prices down further.", link: BONDS },
  { month: 9, day: 29, year: 2008, title: "The House rejects the rescue bill", text: "The United States House of Representatives votes down the bank rescue bill, and the Dow Jones Industrial Average falls 777 points, then its largest fall in points. A revised bill is passed four days later.", link: Y2008 },

  // ---- October
  { month: 10, day: 6, year: 1979, title: "Volcker’s Saturday announcement", text: "After an unscheduled meeting on a Saturday, the Federal Reserve announces that it will target the quantity of bank reserves and let interest rates move as they may. Rates rise to levels not seen before.", link: FED },
  { month: 10, day: 7, year: 2016, title: "The sterling flash crash", text: "In early Asian trading the pound falls by several per cent against the dollar within about two minutes, then recovers most of the fall." },
  { month: 10, day: 8, year: 1990, title: "The pound joins the exchange rate mechanism", text: "The United Kingdom joins the European exchange rate mechanism at a central rate of 2.95 marks to the pound. It leaves less than two years later.", link: Y1992 },
  { month: 10, day: 8, year: 2008, title: "Six central banks cut together", text: "Six central banks, among them the Federal Reserve, the European Central Bank and the Bank of England, lower interest rates at the same moment.", link: Y2008 },
  { month: 10, day: 9, year: 2002, title: "The Nasdaq’s low", text: "The Nasdaq Composite closes at 1,114.11, about 78% below its peak of March 2000.", link: DOTCOM },
  { month: 10, day: 9, year: 2007, title: "The peak before the financial crisis", text: "The S&P 500 and the Dow Jones Industrial Average close at record highs. Seventeen months later the S&P 500 stands at less than half that level.", link: Y2008 },
  { month: 10, day: 13, year: 1989, title: "The Friday the 13th fall", text: "The Dow Jones Industrial Average falls by almost 7% in the last hour and a half of trading, after the financing for a buy-out of the parent company of United Airlines falls through." },
  { month: 10, day: 15, year: 2014, title: "The Treasury flash rally", text: "The yield on the ten-year United States Treasury note falls and recovers by an unusually large amount within about twelve minutes, with no news to explain it.", link: BONDS },
  { month: 10, day: 17, year: 1973, title: "The oil weapon", text: "Arab oil-producing countries, meeting in Kuwait during the war in the Middle East, announce cuts in production. An embargo on the United States follows within days, and the price of oil roughly quadruples by the new year.", link: { href: "/markets/energy", label: "Energy markets" } },
  { month: 10, day: 19, year: 1987, title: "Black Monday", text: "The Dow Jones Industrial Average closes down 508 points, a fall of 22.6% in one day, the largest one-day percentage fall in its history. Markets in Asia and Europe had fallen before New York opened.", link: Y1987 },
  { month: 10, day: 20, year: 1987, title: "The Federal Reserve’s one-sentence statement", text: "Before the opening on the day after Black Monday, the Federal Reserve states that it stands ready to supply liquidity to support the economic and financial system.", link: Y1987 },
  { month: 10, day: 22, year: 1907, title: "The run on the Knickerbocker Trust", text: "A run begins on the Knickerbocker Trust Company in New York, which suspends payments the same day. The panic is contained by a group of bankers led by J. P. Morgan, and leads six years later to the creation of the Federal Reserve.", link: FED },
  { month: 10, day: 23, year: 1997, title: "Hong Kong defends its dollar", text: "Hong Kong’s share market falls by more than 10% in a day as its link to the United States dollar is defended with very high overnight interest rates.", link: ASIA },
  { month: 10, day: 24, year: 1929, title: "Black Thursday", text: "Heavy selling at the opening in New York, on record volume. Leading bankers meet opposite the Exchange and agree to buy shares in support of the market, and prices recover part of the fall by the close.", link: Y1929 },
  { month: 10, day: 26, year: 2000, title: "The euro’s low", text: "The euro falls to its lowest level against the dollar, below 83 United States cents.", link: ECB },
  { month: 10, day: 27, year: 1986, title: "London’s Big Bang", text: "The London Stock Exchange abolishes fixed commissions and the separation of brokers from dealers, and trading begins to move from the floor to screens." },
  { month: 10, day: 27, year: 1997, title: "The circuit breakers are used for the first time", text: "The Dow Jones Industrial Average falls by 554 points, about 7%, as the Asian crisis reaches Wall Street. The trading halts introduced after 1987 are triggered for the first time.", link: Y1987 },
  { month: 10, day: 28, year: 1929, title: "Black Monday, 1929", text: "No support for the market appears, and the Dow Jones Industrial Average falls by nearly 13% in the day.", link: Y1929 },
  { month: 10, day: 29, year: 1929, title: "Black Tuesday", text: "The Dow Jones Industrial Average falls by nearly 12% more, on about 16 million shares, a record for volume that stands for almost forty years.", link: Y1929 },
  { month: 10, day: 30, year: 1947, title: "The General Agreement on Tariffs and Trade", text: "Twenty-three countries sign the General Agreement on Tariffs and Trade in Geneva. It governs international trade until the World Trade Organization replaces it in 1995." },
  { month: 10, day: 31, year: 2008, title: "The Bitcoin paper", text: "A paper describing a system of electronic cash that needs no bank or other trusted party is sent to a cryptography mailing list under the name Satoshi Nakamoto.", link: { href: "/markets/crypto", label: "Crypto at GIO4X" } },
  { month: 10, day: 31, year: 2011, title: "MF Global files for bankruptcy", text: "The futures broker MF Global files for bankruptcy after losses on European government bonds. More than a billion dollars of customers’ money is found to be missing from accounts that should have been kept separate; customers are repaid in full some years later.", link: { href: "/primers/how-to-choose-a-broker", label: "Primer: how to choose a broker" } },

  // ---- November
  { month: 11, day: 1, year: 1993, title: "The European Union comes into being", text: "The Maastricht Treaty comes into force, and the European Union comes into being." },
  { month: 11, day: 3, year: 2010, title: "A second round of bond purchases", text: "The Federal Reserve announces that it will buy a further $600 billion of Treasury securities, the programme that becomes known as QE2.", link: FED },
  { month: 11, day: 8, year: 2016, title: "India withdraws its largest banknotes", text: "India’s prime minister announces in an evening broadcast that the 500 and 1,000 rupee notes, most of the cash in circulation by value, will cease to be legal tender at midnight." },
  { month: 11, day: 11, year: 2022, title: "FTX files for bankruptcy", text: "The crypto-asset exchange FTX files for bankruptcy, days after its customers tried to withdraw their funds and found that they could not.", link: { href: "/markets/crypto", label: "Crypto at GIO4X" } },
  { month: 11, day: 12, year: 1999, title: "Glass–Steagall is repealed", text: "The Gramm–Leach–Bliley Act becomes law in the United States, repealing the separation of commercial banking from investment banking that was made in 1933." },
  { month: 11, day: 13, year: 1929, title: "The low of 1929", text: "The Dow Jones Industrial Average reaches its low for the year, close to half its level of early September. A partial recovery follows into the spring of 1930.", link: Y1929 },
  { month: 11, day: 15, year: 1867, title: "The stock ticker", text: "The first stock ticker, a telegraph printer invented by Edward Calahan, goes into service in New York. Prices from the exchange floor can now be read across the city within minutes." },
  { month: 11, day: 15, year: 1923, title: "The Rentenmark", text: "Germany introduces the Rentenmark, exchanged at one for a trillion of the old paper marks, and the hyperinflation ends." },
  { month: 11, day: 16, year: 1914, title: "The Federal Reserve Banks open", text: "The twelve Federal Reserve Banks open for business, eleven months after the Federal Reserve Act was signed.", link: FED },
  { month: 11, day: 17, year: 1869, title: "The Suez Canal opens", text: "The Suez Canal opens, shortening the sea route between Europe and Asia by thousands of miles." },
  { month: 11, day: 18, year: 1967, title: "The pound is devalued to $2.40", text: "The United Kingdom devalues the pound from $2.80 to $2.40, after three years spent defending the old rate. It is the last devaluation of the pound under fixed exchange rates." },
  { month: 11, day: 18, year: 2004, title: "A gold fund on the stock exchange", text: "The first exchange-traded fund in the United States backed by gold bullion begins trading in New York.", link: FUNDS },
  { month: 11, day: 21, year: 1997, title: "South Korea turns to the International Monetary Fund", text: "South Korea announces that it will ask the International Monetary Fund for help. Agreement on a programme is reached in early December.", link: ASIA },
  { month: 11, day: 23, year: 1954, title: "Back above 1929", text: "The Dow Jones Industrial Average closes above its peak of September 1929 for the first time, twenty-five years on.", link: Y1929 },
  { month: 11, day: 24, year: 1997, title: "Yamaichi Securities closes", text: "Yamaichi Securities, one of the four large Japanese brokerage houses, announces that it will close after hidden losses come to light." },
  { month: 11, day: 25, year: 2008, title: "Quantitative easing begins in the United States", text: "The Federal Reserve announces that it will buy up to $600 billion of mortgage-backed securities and the debt of the housing agencies, the start of what becomes known as quantitative easing.", link: { href: "/glossary/quantitative-easing", label: "Glossary: quantitative easing" } },

  // ---- December
  { month: 12, day: 1, year: 2001, title: "Argentina limits withdrawals", text: "Argentina limits withdrawals of cash from bank accounts, to stop a run on its banks. Within weeks the government falls, the country defaults on its debt and the peso’s one-to-one link to the dollar is abandoned." },
  { month: 12, day: 2, year: 2001, title: "Enron files for bankruptcy", text: "Enron files for bankruptcy, then the largest filing in United States history, after its accounts are shown to have hidden debts and overstated profits.", link: DOTCOM },
  { month: 12, day: 5, year: 1996, title: "“Irrational exuberance”", text: "In an evening speech the chairman of the Federal Reserve, Alan Greenspan, asks how one can know when “irrational exuberance” has unduly raised the value of assets. Share markets around the world fall the next morning.", link: DOTCOM },
  { month: 12, day: 10, year: 2017, title: "Bitcoin futures begin trading", text: "Futures on bitcoin begin trading on a regulated United States exchange for the first time, in Chicago. Bitcoin reaches its peak for that cycle a week later.", link: { href: "/markets/crypto", label: "Crypto at GIO4X" } },
  { month: 12, day: 11, year: 2001, title: "China joins the World Trade Organization", text: "China becomes a member of the World Trade Organization, after fifteen years of negotiation." },
  { month: 12, day: 11, year: 2008, title: "Bernard Madoff is arrested", text: "Bernard Madoff is arrested and charged with running what proves to be the largest Ponzi scheme on record.", link: { href: "/scam-school/ponzi-scheme", label: "Scam school: the Ponzi scheme" } },
  { month: 12, day: 12, year: 1914, title: "The New York Stock Exchange reopens", text: "The New York Stock Exchange reopens for trading in shares, with restrictions, after closing at the start of the war in Europe." },
  { month: 12, day: 16, year: 2008, title: "The Federal Reserve reaches zero", text: "The Federal Reserve lowers its target for the federal funds rate to a range of 0% to 0.25%. It stays there for seven years: the next change, a rise, comes on 16 December 2015.", link: FED },
  { month: 12, day: 16, year: 2014, title: "Russia raises its key rate to 17%", text: "In the middle of the night the Bank of Russia raises its key rate from 10.5% to 17% to stop the fall of the rouble, which loses more ground during the day all the same." },
  { month: 12, day: 18, year: 1971, title: "The Smithsonian Agreement", text: "The Group of Ten countries, meeting at the Smithsonian Institution in Washington, agree new fixed exchange rates and a devaluation of the dollar against gold. The arrangement lasts fifteen months." },
  { month: 12, day: 18, year: 2014, title: "A negative rate in Switzerland", text: "The Swiss National Bank announces an interest rate of −0.25% on deposits that banks hold with it, to discourage money from moving into francs. Four weeks later it gives up the franc’s floor.", link: FRANC },
  { month: 12, day: 20, year: 1994, title: "Mexico devalues the peso", text: "Mexico widens the band in which the peso trades, in effect devaluing it, and two days later lets it float. The peso loses about half its value and an international rescue follows." },
  { month: 12, day: 23, year: 1913, title: "The Federal Reserve Act", text: "President Wilson signs the Federal Reserve Act, creating the central bank of the United States.", link: FED },
  { month: 12, day: 27, year: 1945, title: "The International Monetary Fund and the World Bank come into existence", text: "The Articles of Agreement drawn up at Bretton Woods come into force, and the International Monetary Fund and the World Bank come into existence." },
  { month: 12, day: 29, year: 1989, title: "The Nikkei’s peak", text: "On the last trading day of the 1980s the Nikkei 225 closes at 38,915.87. It does not close higher for more than thirty-four years." },
  { month: 12, day: 31, year: 1600, title: "The East India Company is chartered", text: "Queen Elizabeth I grants a royal charter to the East India Company." },
  { month: 12, day: 31, year: 1974, title: "Americans may own gold again", text: "Americans are again allowed to own gold bullion, for the first time since 1933." },
];

/* ---- reading the list ----------------------------------------------------- */

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** Days in each month of the list's own year, which counts 29 February. */
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** "22 July": the day as it is shown. */
export const dayLabel = (month: number, day: number) => `${day} ${MONTHS[month - 1]}`;

/** The anchor of a day in the full list on /on-this-day. */
export const dayAnchor = (month: number, day: number) => `d-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** The events of one day of the year, oldest first. */
export function eventsOn(month: number, day: number): DayEvent[] {
  return ON_THIS_DAY.filter((e) => e.month === month && e.day === day).sort((a, b) => a.year - b.year);
}

/** The events of one month, by day and then by year. */
export function eventsIn(month: number): DayEvent[] {
  return ON_THIS_DAY.filter((e) => e.month === month).sort((a, b) => a.day - b.day || a.year - b.year);
}

/** The day `by` days after (or, negative, before) a day of the year, going round at the ends. */
export function stepDay(month: number, day: number, by: number): { month: number; day: number } {
  let m = month;
  let d = day + by;
  while (d < 1) {
    m = m === 1 ? 12 : m - 1;
    d += MONTH_DAYS[m - 1];
  }
  while (d > MONTH_DAYS[m - 1]) {
    d -= MONTH_DAYS[m - 1];
    m = m === 12 ? 1 : m + 1;
  }
  return { month: m, day: d };
}

/**
 * The nearest day that has an entry, looking forwards (`dir` 1) or backwards
 * (`dir` -1) from a day and not counting the day itself. The list has entries
 * in every month, so the search always ends.
 */
export function nearestDay(month: number, day: number, dir: 1 | -1): { month: number; day: number } {
  let at = { month, day };
  for (let i = 0; i < 366; i++) {
    at = stepDay(at.month, at.day, dir);
    if (ON_THIS_DAY.some((e) => e.month === at.month && e.day === at.day)) return at;
  }
  return { month, day };
}
