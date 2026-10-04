/**
 * INSTRUMENT DEPTH, FOREX: what is particular to each of the ten currency
 * pairs, beyond the profile every instrument page shares.
 *
 * General education about the underlying market. The rule it keeps: no current
 * or recent price, policy rate, level or forecast; nothing about GIO4X's own
 * contract; no advice. Each link is described as a mechanism, with the times
 * it has failed. History is limited to well-documented events with their
 * dates. Central banks and releases carry the names used in
 * src/data/knowledge.ts.
 */
import type { DepthSet } from "./types";

export const FOREX_DEPTH: DepthSet = {
  "eur-usd": {
    character:
      "EUR/USD joins the two largest currency areas in the world, and the Bank for International Settlements’ surveys have recorded it as the most traded pair for as long as the euro has existed. Because so much of the market’s business passes through it, it is usually the cheapest pair to deal in and the slowest to move in percentage terms. The euro is also by far the largest weight in the commonly quoted US dollar index, so a view on “the dollar” is, to a large extent, a view on this pair.",
    drivers: [
      {
        t: "The European Central Bank against the Federal Reserve",
        d: "The pair responds to the expected gap between euro-area and United States interest rates over the next year or two, more than to the gap today. When markets come to expect the Federal Reserve to keep rates higher for longer than the European Central Bank, holding dollars pays more and the pair tends to fall; the reverse lifts it. The link weakens when both banks move together, because the gap then barely changes however large the moves are.",
      },
      {
        t: "One currency, many governments",
        d: "The euro has a single central bank and many national treasuries. When investors doubt one member state’s debt, the yield gap between that country’s bonds and Germany’s widens and the euro can fall for reasons that have nothing to do with interest-rate policy. This was the story of the sovereign debt crisis of 2010 to 2012, which eased after the president of the European Central Bank said in London on 26 July 2012 that the bank would do whatever it took to preserve the euro.",
      },
      {
        t: "Imported energy",
        d: "The euro area buys most of its oil and gas from abroad and pays largely in dollars. A sharp rise in energy prices worsens its trade balance and has weighed on the euro, most visibly in 2022, when the pair fell below one dollar per euro for the first time in two decades. The United States, a large energy producer, is far less exposed, which is why the same shock can push the two sides in opposite directions.",
      },
      {
        t: "The dollar’s reserve role",
        d: "In a global scare, demand for dollars rises because so much debt and trade is denominated in them. That can push EUR/USD down even when the trouble began in the United States, as it did in the autumn of 2008. In this state the interest-rate gap explains little; the need for dollar funding explains most.",
      },
      {
        t: "Official intervention, rarely",
        d: "Neither central bank manages the exchange rate day to day. The exception on record is September 2000, when the European Central Bank, together with the Federal Reserve, the Bank of Japan and other central banks, bought euros in a coordinated operation after the young currency had fallen steeply. It is a reminder that intervention in this pair has been an event of decades, not of years.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The euro is the base currency and the dollar the quote currency: the price is the number of dollars one euro costs. A pip is 0.0001, the fourth decimal place, and most platforms show a fifth decimal, a tenth of a pip. On a position of 100,000 euros one pip is worth 10 US dollars, whatever the price.",
      },
      {
        t: "Why the euro comes first",
        d: "Market convention ranks currencies in a fixed order for quoting, and the euro sits at the top of it. That is why the pair is written EUR/USD and never USD/EUR, and why a rising chart means a stronger euro and a weaker dollar. Newcomers who think in dollars often read the chart upside down.",
      },
      {
        t: "A young currency",
        d: "The euro began on 1 January 1999 as an accounting currency; notes and coins followed on 1 January 2002. Charts that go back further are reconstructions built from the currencies it replaced. Any “all-time” statement about this pair therefore covers a shorter history than the same statement about sterling or the yen.",
      },
      {
        t: "The busiest hours",
        d: "Turnover is heaviest when London and New York are both open, from the New York morning to the London close. The United States releases most of its major data early in the New York morning, and the European Central Bank announces its decisions in the early Frankfurt afternoon, with a press conference shortly after. The Asian session is usually the quietest stretch for this pair.",
      },
    ],
    watch: [
      "The Federal Open Market Committee’s Interest Rate Decision, its statement and the chair’s press conference",
      "The European Central Bank Governing Council’s Interest Rate Decision and press conference",
      "The monthly United States employment report, with Non-Farm Payrolls",
      "The United States Consumer Price Index, monthly",
      "Eurostat’s flash estimate of euro-area inflation, monthly",
      "The weekly Commitments of Traders report from the Commodity Futures Trading Commission, for positioning in euro futures",
    ],
    sources: [
      "Federal Reserve: Federal Open Market Committee statements, minutes and the Summary of Economic Projections",
      "European Central Bank: monetary policy statements, the published accounts of Governing Council meetings and the Economic Bulletin",
      "Bank for International Settlements: Triennial Central Bank Survey of Foreign Exchange and Over-the-counter Derivatives Markets",
      "Eurostat: Harmonised Index of Consumer Prices; United States Bureau of Labor Statistics: Employment Situation and Consumer Price Index",
      "Commodity Futures Trading Commission: Commitments of Traders",
    ],
  },

  "gbp-usd": {
    character:
      "GBP/USD is the oldest of the major pairs and still carries its nineteenth-century nickname, “cable”, after the telegraph cable under the Atlantic that carried the rate between London and New York. Sterling belongs to a mid-sized, open economy that has run a deficit with the rest of the world for decades, so it depends on foreign money continuing to arrive. That makes the pair more sensitive than EUR/USD to British politics and to confidence in the public finances.",
    drivers: [
      {
        t: "The Bank of England against the Federal Reserve",
        d: "The pair follows the expected gap between Bank Rate and the federal funds rate. The Monetary Policy Committee publishes how each of its members voted, so a decision that leaves Bank Rate unchanged can still move sterling if the split of votes shifts. The link breaks when higher British yields are read as a sign of trouble, not of strength: see the next point.",
      },
      {
        t: "Confidence in the public finances",
        d: "Normally a rise in gilt yields supports sterling. On 23 September 2022 a government fiscal statement was followed by gilt yields rising and sterling falling together, to a record low against the dollar on 26 September; on 28 September the Bank of England began temporary purchases of long-dated gilts to restore order. It is the clearest recent case of an interest-rate link running backwards.",
      },
      {
        t: "The external deficit",
        d: "The United Kingdom imports more than it exports and funds the difference with capital from abroad. While that capital arrives willingly the deficit goes unnoticed. When it hesitates, sterling is the price that adjusts, which is why political shocks tend to show in this pair faster than in most.",
      },
      {
        t: "Black Wednesday, 16 September 1992",
        d: "The United Kingdom joined the European Exchange Rate Mechanism in October 1990, committing to hold sterling within a band against the Deutsche Mark. On 16 September 1992, after heavy selling that higher interest rates and intervention did not stop, the government suspended sterling’s membership. The site’s history pages tell the episode in full; its lasting effect was the move to an inflation target and, in May 1997, operational independence for the Bank of England.",
      },
      {
        t: "The European Union referendum",
        d: "The United Kingdom voted to leave the European Union on 23 June 2016. As the result became clear in the early hours of 24 June, sterling had one of the largest one-day falls of any major currency in the floating era. For years afterwards the pair traded on the state of the withdrawal negotiations as much as on economic data.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "Sterling is the base currency: the price is the number of dollars one pound costs. A pip is 0.0001, and on 100,000 pounds one pip is worth 10 US dollars. Because a pound has for a long time been worth more than a dollar, a position of 100,000 pounds is a larger sum in dollars than 100,000 euros or Australian dollars would be.",
      },
      {
        t: "Thin hours carry risk",
        d: "Sterling is traded mainly in London. In the early Asian hours of 7 October 2016 the pair fell by several per cent within minutes and recovered most of the fall soon after. The Bank for International Settlements’ Markets Committee studied the event and found no single cause, pointing to the time of day and to a market with few participants present.",
      },
      {
        t: "The busiest hours",
        d: "Activity starts early in the London morning, when the Office for National Statistics publishes most of its releases, and peaks while London and New York overlap. The Bank of England announces its decisions at midday in London, together with the minutes of the meeting. The late London afternoon, when benchmark rates are set for fund managers, often sees a brief burst of business.",
      },
    ],
    watch: [
      "The Bank of England Monetary Policy Committee’s Interest Rate Decision, with its minutes and vote split",
      "The Bank of England’s quarterly Monetary Policy Report",
      "The United Kingdom’s Consumer Price Index and labour market statistics, monthly",
      "The government’s Budget and other fiscal statements, with the Office for Budget Responsibility’s forecast",
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The monthly United States employment report, with Non-Farm Payrolls",
    ],
    sources: [
      "Bank of England: Monetary Policy Summary and minutes of the Monetary Policy Committee; Monetary Policy Report",
      "Office for National Statistics: consumer price inflation, labour market overview and balance of payments",
      "Office for Budget Responsibility: Economic and fiscal outlook",
      "Bank for International Settlements, Markets Committee: report on the sterling “flash event” of 7 October 2016",
      "Federal Reserve: Federal Open Market Committee statements and minutes",
    ],
  },

  "usd-jpy": {
    character:
      "USD/JPY is the pair in which the gap between two countries’ interest rates shows most plainly. Japan kept interest rates at or near zero for most of three decades, which made the yen the currency the world borrowed in order to hold higher-yielding assets elsewhere. It is also the major pair in which a government has most often stepped into the market itself.",
    drivers: [
      {
        t: "The Federal Reserve against the Bank of Japan",
        d: "For long stretches the pair has tracked the gap between United States and Japanese government bond yields. Since Japanese yields moved little for years, that gap was in practice set in the United States, and USD/JPY behaved like a chart of American yields. The link loosens when the Bank of Japan itself becomes the source of news, as it did when it ended its negative interest rate and its control of bond yields in March 2024.",
      },
      {
        t: "The carry trade",
        d: "Borrowing yen cheaply to hold assets that pay more is profitable for as long as the yen does not rise by more than the interest earned. The trade builds slowly in calm markets and is closed quickly in a scare, when many holders buy yen back at once. That is why the yen often rises on bad news, and why the pair’s falls have tended to be faster than its rises: early August 2024, days after a Bank of Japan rate increase, was a sharp example.",
      },
      {
        t: "Intervention by the Ministry of Finance",
        d: "In Japan the decision to intervene belongs to the Ministry of Finance; the Bank of Japan carries it out as its agent. The ministry sold yen for many years to restrain its rise, and in 2022 bought yen for the first time since 1998, doing so again in 2024. Intervention has changed the speed of a move more reliably than its direction when the interest-rate gap pointed the other way.",
      },
      {
        t: "The Plaza Accord, 22 September 1985",
        d: "At the Plaza Hotel in New York the finance ministers and central bank governors of France, West Germany, Japan, the United Kingdom and the United States agreed to bring the dollar down in an orderly way. The dollar, already off its peak, lost roughly half its value against the yen over the next two years. The Louvre Accord of February 1987 was the attempt to stop the fall.",
      },
      {
        t: "Japan’s own money coming home",
        d: "Japanese households, insurers and pension funds hold very large assets abroad. In a domestic shock, the expectation that some of that money will be brought home can lift the yen, which is the opposite of what a shock does to most currencies. After the earthquake of March 2011 the yen rose so fast that the Group of Seven intervened together to sell it.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and direction",
        d: "The dollar is the base currency: the price is the number of yen one dollar costs. A rising chart therefore means a weaker yen, and “the yen strengthened” means the pair fell. This inversion is the commonest mistake newcomers make with the pair.",
      },
      {
        t: "Two or three decimals",
        d: "Because one yen is a small unit, yen pairs are quoted to two decimal places, or three where a platform shows fractions of a pip. A pip is 0.01, not 0.0001. On 100,000 dollars one pip is worth 1,000 yen, so its value in any other currency changes as the exchange rate changes.",
      },
      {
        t: "The busiest hours",
        d: "USD/JPY is the one major pair with a genuinely active Asian session. Japanese importers and exporters deal around the Tokyo fixing in the Tokyo morning, and the Bank of Japan releases its decision when its meeting ends, around the middle of the Tokyo day, without a fixed minute. The largest moves still tend to follow United States data in the New York morning.",
      },
      {
        t: "The fiscal year",
        d: "Japan’s fiscal year ends on 31 March, and many companies and institutions settle their books then and at the half-year. Flows connected with those dates are a regular topic in this market. They are a feature of the calendar, not a reliable pattern in the price.",
      },
    ],
    watch: [
      "The Bank of Japan Policy Board’s Interest Rate Decision and the governor’s press conference",
      "The Bank of Japan’s quarterly Outlook for Economic Activity and Prices, and its Tankan business survey",
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The monthly United States employment report and the United States Consumer Price Index",
      "The Japanese Ministry of Finance’s monthly disclosure of foreign exchange intervention",
      "The weekly Commitments of Traders report, for positioning in yen futures",
    ],
    sources: [
      "Bank of Japan: Statement on Monetary Policy, Outlook for Economic Activity and Prices, Summary of Opinions and the Tankan survey",
      "Ministry of Finance, Japan: Foreign Exchange Intervention Operations; International Transactions in Securities",
      "Federal Reserve: Federal Open Market Committee statements and minutes; Federal Reserve History, on the Plaza Accord",
      "Bank for International Settlements: Triennial Central Bank Survey",
      "Commodity Futures Trading Commission: Commitments of Traders",
    ],
  },

  "aud-usd": {
    character:
      "AUD/USD is the major pair most closely tied to what a country digs out of the ground. Australia’s largest exports are iron ore, coal and natural gas, and its largest customer is China, so the pair often behaves like a reading of Asian industrial demand. It is also a currency that investors treat as a measure of confidence, rising with share markets and falling with them.",
    drivers: [
      {
        t: "Export prices",
        d: "When the prices of Australia’s bulk exports rise, more foreign currency has to be converted into Australian dollars to pay for them, and national income rises with them. The Reserve Bank of Australia publishes a monthly index of these prices. The link is with Australia’s own export basket, in which iron ore and coal weigh far more than oil or gold.",
      },
      {
        t: "China",
        d: "Chinese steel-making drives demand for iron ore and coking coal, so Chinese construction, credit and industrial data move this pair in a way they move no other major. Because onshore Chinese markets are hard for foreigners to reach, the Australian dollar is also used as a liquid stand-in for a view on China. That use can move the pair without any change in Australia itself.",
      },
      {
        t: "The Reserve Bank of Australia against the Federal Reserve",
        d: "For much of its floating history Australian interest rates stood above American ones, and the currency attracted money seeking the difference. When that gap narrows or reverses, the support goes. In 2022 commodity prices were high and the pair still fell, because the Federal Reserve was raising rates faster: the two main drivers pointed in opposite directions and interest rates won.",
      },
      {
        t: "Risk appetite",
        d: "The Australian dollar tends to rise when global share markets rise and to fall sharply in a scare, as it did in the autumn of 2008. This is the mirror image of the yen and the franc. The link comes from the currency’s dependence on world growth and on investors’ willingness to hold higher-yielding assets.",
      },
      {
        t: "The float of December 1983",
        d: "Until December 1983 the Australian dollar’s value was set by the authorities. Since then it has floated freely and has acted as a shock absorber: it falls when export prices fall, which cushions the mining sector’s income in local currency. The Reserve Bank of Australia has described this mechanism in its own publications.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The Australian dollar is the base currency: the price is the number of US dollars one Australian dollar costs. A pip is 0.0001, and on 100,000 Australian dollars one pip is worth 10 US dollars. A position of 100,000 Australian dollars is a smaller sum in US dollars than the same number of euros or pounds, a point that matters when comparing position sizes across pairs.",
      },
      {
        t: "The busiest hours",
        d: "Australian data is published in the Sydney morning and the Reserve Bank of Australia announces its decisions in the Sydney afternoon, both of which fall overnight for Europe and the Americas. Chinese data arrives in the same session. The pair then takes its lead from United States data and share markets during the New York day, so it has two distinct active periods.",
      },
      {
        t: "A cross built on it",
        d: "AUD/NZD, the Australian dollar against the New Zealand dollar, is derived from this pair and NZD/USD. Much of the time the two antipodean currencies move together against the US dollar, so a move in AUD/USD says less about Australia than a move in that cross does.",
      },
    ],
    watch: [
      "The Reserve Bank of Australia Monetary Policy Board’s Interest Rate Decision and its quarterly Statement on Monetary Policy",
      "The Australian Bureau of Statistics’ Consumer Price Index and Labour Force release",
      "China’s monthly industrial production, retail sales and Purchasing Managers’ Index releases",
      "The Reserve Bank of Australia’s monthly Index of Commodity Prices",
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The monthly United States employment report, with Non-Farm Payrolls",
    ],
    sources: [
      "Reserve Bank of Australia: monetary policy decisions and minutes, Statement on Monetary Policy, Index of Commodity Prices",
      "Australian Bureau of Statistics: Consumer Price Index; Labour Force, Australia; International Trade in Goods",
      "National Bureau of Statistics of China: monthly activity data",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "usd-chf": {
    character:
      "USD/CHF sets the world’s reserve currency against the currency of a small, wealthy country with low inflation and a long record of surplus with the rest of the world. Both are sought in a scare, which makes this pair harder to read in a crisis than a pair with only one defensive side. The franc’s closest relationship is with the euro, not the dollar, because the euro area surrounds Switzerland and is its main trading partner.",
    drivers: [
      {
        t: "The Swiss National Bank’s two tools",
        d: "The Swiss National Bank sets a policy rate and, unlike most of its peers, says openly that it is willing to buy or sell foreign currency as part of monetary policy. In a small open economy the exchange rate does much of the work that interest rates do elsewhere: a stronger franc lowers import prices and with them inflation. The bank’s words about the franc are therefore read as closely as its rate.",
      },
      {
        t: "The euro, at one remove",
        d: "The rate the Swiss economy cares about most is the franc against the euro. USD/CHF is in effect that rate combined with EUR/USD, and on many days it moves as the mirror image of EUR/USD. News about the euro area can move this pair more than news about Switzerland.",
      },
      {
        t: "Defensive demand, and its exception",
        d: "In periods of fear the franc tends to rise, helped by Switzerland’s external surplus and low inflation. Against the dollar the effect is less clear than against the euro, because the dollar is sought at the same moments. It also fails when the trouble is Swiss: during the emergency rescue of a large Swiss bank in March 2023 the franc did not behave as a refuge.",
      },
      {
        t: "The floor, and 15 January 2015",
        d: "On 6 September 2011, with the franc rising steeply during the euro-area debt crisis, the Swiss National Bank announced it would not tolerate a rate below 1.20 francs per euro and would buy foreign currency without limit to enforce it. It abandoned that minimum rate without warning on 15 January 2015, and the franc rose by an extraordinary amount against both the euro and the dollar within minutes. The site’s history pages cover the day; the lesson for this pair is that a level defended by a central bank can go in a single announcement, with no prices available in between.",
      },
      {
        t: "The Federal Reserve",
        d: "The dollar side responds to the Federal Reserve’s policy as it does in every dollar pair. Swiss interest rates have for decades been among the lowest in the world, and were below zero from early 2015 to 2022, so the franc has at times been borrowed to fund holdings elsewhere, as the yen is. A scare that closes those positions lifts the franc for a second reason.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The dollar is the base currency: the price is the number of francs one dollar costs, so a falling chart means a stronger franc. A pip is 0.0001, and on 100,000 dollars one pip is worth 10 francs. The pip’s value in dollars therefore shifts as the rate moves.",
      },
      {
        t: "Four meetings a year",
        d: "The Swiss National Bank holds its monetary policy assessment once a quarter, fewer scheduled meetings than the other major central banks. Each one carries more weight as a result, and the bank has acted between meetings when it judged it necessary, as it did in January 2015. Its Governing Board has three members, so there is no vote split to study.",
      },
      {
        t: "The busiest hours",
        d: "The franc is traded mostly in European hours. The Swiss National Bank announces in the Zurich morning, and Swiss data is published early in the European day. The dollar side brings a second active period when United States data is released in the New York morning.",
      },
      {
        t: "Reading intervention from the outside",
        d: "The Swiss National Bank does not announce each purchase or sale. Observers watch its weekly figures for the deposits commercial banks hold with it, which tend to rise when the bank has been buying foreign currency, and the totals it publishes later. These are inferences, with a delay, and can mislead.",
      },
    ],
    watch: [
      "The Swiss National Bank’s quarterly monetary policy assessment and Interest Rate Decision",
      "The Swiss Consumer Price Index from the Federal Statistical Office, monthly",
      "The Swiss National Bank’s weekly figures on sight deposits",
      "The KOF Economic Barometer, monthly",
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The European Central Bank Governing Council’s Interest Rate Decision, for its effect on the franc through the euro",
    ],
    sources: [
      "Swiss National Bank: monetary policy assessments, Quarterly Bulletin, Annual Report and its press releases of 6 September 2011 and 15 January 2015",
      "Swiss Federal Statistical Office: Swiss Consumer Price Index",
      "KOF Swiss Economic Institute, ETH Zurich: KOF Economic Barometer",
      "Federal Reserve: Federal Open Market Committee statements and minutes",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "usd-cad": {
    character:
      "USD/CAD is a pair between two neighbours whose economies are bound together more tightly than any other two in the major pairs: most of Canada’s exports go to the United States. What sets the Canadian dollar apart from its neighbour’s is energy, since Canada is a large exporter of crude oil. The pair is therefore partly a measure of the two economies’ differences and partly a measure of the oil price.",
    drivers: [
      {
        t: "Crude oil",
        d: "A higher oil price raises Canada’s export income and has tended to strengthen the Canadian dollar, which means a lower USD/CAD. The crude Canada sells is mostly heavy oil from the west, which trades at a discount to the West Texas Intermediate benchmark, and that discount widens when pipelines are full. The link has been looser at times, notably since the United States became a very large oil producer itself.",
      },
      {
        t: "The Bank of Canada against the Federal Reserve",
        d: "Because the two economies move so closely together, the two central banks often move in the same direction, and the pair responds to which of them moves first or further. Canadian households carry high mortgage debt that resets more quickly than American mortgages do, so the same rate rise bites sooner in Canada. That difference has more than once led the Bank of Canada to stop before the Federal Reserve.",
      },
      {
        t: "The United States economy, on both sides",
        d: "Strong American growth is good for the dollar and also good for Canadian exporters. The two effects pull USD/CAD in opposite directions, which is one reason the pair often moves less than other dollar pairs on United States data. Trade policy between the two countries, governed since 1 July 2020 by the agreement that replaced the North American Free Trade Agreement, acts on the Canadian side alone.",
      },
      {
        t: "Risk appetite",
        d: "The Canadian dollar behaves as a growth-sensitive currency, falling against the US dollar when share markets fall and commodity prices with them. It is usually a milder version of the Australian dollar in this respect, because its largest customer is the United States and not China.",
      },
      {
        t: "A long floating history",
        d: "Canada let its dollar float from 1950 to 1962, when most of the world’s currencies were fixed, and has floated it again since 1970. In late 2007, during a long rise in commodity prices, one Canadian dollar became worth one US dollar for the first time in about three decades. The Bank of Canada has described the floating rate as a shock absorber for an economy that exports raw materials.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and direction",
        d: "The US dollar is the base currency: the price is the number of Canadian dollars one US dollar costs. A rising chart means a weaker Canadian dollar, so a rising oil price usually shows as a falling USD/CAD. A pip is 0.0001, and on 100,000 US dollars one pip is worth 10 Canadian dollars.",
      },
      {
        t: "One-day settlement",
        d: "Spot transactions in most currency pairs settle two business days after the trade. USD/CAD settles after one, a convention that reflects the two countries sharing time zones and banking hours. It matters for how the overnight financing of a position is counted, not for the price on the screen.",
      },
      {
        t: "The busiest hours",
        d: "This is the most North American of the major pairs: business is concentrated in the New York and Toronto day and is thin in Asian hours. Canada’s Labour Force Survey is frequently released at the same moment as the United States employment report. When both arrive together the pair can jump in one direction and then the other within seconds.",
      },
      {
        t: "The “loonie”",
        d: "The nickname comes from the loon, the bird on the one-dollar coin introduced in 1987. Dealers use it for the currency and for the pair alike.",
      },
    ],
    watch: [
      "The Bank of Canada Governing Council’s Interest Rate Decision and its quarterly Monetary Policy Report",
      "Statistics Canada’s monthly Labour Force Survey and Consumer Price Index",
      "The monthly United States employment report, with Non-Farm Payrolls",
      "The United States Energy Information Administration’s Weekly Petroleum Status Report",
      "Ministerial meetings of the oil-exporting countries’ group on production levels",
      "The Bank of Canada’s quarterly Business Outlook Survey",
    ],
    sources: [
      "Bank of Canada: rate announcements, Monetary Policy Report, Summary of Governing Council deliberations and Business Outlook Survey",
      "Statistics Canada: Labour Force Survey; Consumer Price Index; Canadian international merchandise trade",
      "United States Energy Information Administration: Weekly Petroleum Status Report",
      "Federal Reserve: Federal Open Market Committee statements and minutes",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "nzd-usd": {
    character:
      "NZD/USD is the smallest of the major pairs by the size of the economy behind it. New Zealand sells the world food, above all dairy products, where Australia sells minerals, and that is the main thing that separates the “kiwi” from the Australian dollar it otherwise shadows. A small market also means fewer participants, and prices that can move further on a given piece of news.",
    drivers: [
      {
        t: "Dairy and farm exports",
        d: "Dairy products are New Zealand’s largest goods export, followed by meat and other farm produce. Prices are set at the Global Dairy Trade auction, held roughly every two weeks, and its results are followed as a direct reading of the country’s export income. Weather matters too: a drought cuts milk production and export volumes whatever the price.",
      },
      {
        t: "The Reserve Bank of New Zealand against the Federal Reserve",
        d: "The Reserve Bank of New Zealand sets the Official Cash Rate, and the pair responds to the expected gap between it and the federal funds rate. New Zealand has often had some of the higher interest rates among developed economies, which drew money in calm markets and saw it leave quickly in a scare. The bank has a record of moving early and in large steps compared with its peers, so its meetings carry surprise more often.",
      },
      {
        t: "Australia and China",
        d: "Australia and China are New Zealand’s largest trading partners, and the kiwi moves with the Australian dollar on most days. A move in NZD/USD that is matched in AUD/USD is usually about the US dollar or about world growth. The part that is truly about New Zealand shows in the AUD/NZD cross.",
      },
      {
        t: "Risk appetite",
        d: "Like the Australian dollar, the kiwi rises with global share markets and falls with them. Because the market is smaller, the falls can be steeper. The link is weakest when the news is local: a domestic data surprise can move the kiwi on a day when world markets are calm.",
      },
      {
        t: "The first inflation target",
        d: "New Zealand floated its dollar in March 1985. The Reserve Bank of New Zealand Act of 1989, in force from early 1990, made it the first central bank to be given a formal, published inflation target, a model later adopted by most others. The bank has intervened in the currency only rarely since the float.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The New Zealand dollar is the base currency: the price is the number of US dollars one New Zealand dollar costs. A pip is 0.0001, and on 100,000 New Zealand dollars one pip is worth 10 US dollars. Because one New Zealand dollar has long been worth well under one US dollar, a pip is a larger share of the price than it is in EUR/USD or GBP/USD.",
      },
      {
        t: "Where the week begins",
        d: "Wellington and Auckland are the first trading centres to open after the weekend. For the first hours of the week few banks are quoting, so prices can gap from Friday’s close and the cost of dealing is at its highest. New Zealand’s own data is released in the Wellington morning, which is the previous evening in London and the previous afternoon in New York.",
      },
      {
        t: "Quarterly, not monthly, data",
        d: "Stats NZ has long published the full Consumer Price Index and the main labour market figures once a quarter, where most countries publish them monthly. Each release therefore carries three months of news at once. Check the agency’s current release calendar, since statistical programmes change.",
      },
      {
        t: "A thinner market",
        d: "The Bank for International Settlements’ surveys place the New Zealand dollar well below the other majors in turnover. In practice that shows as a wider gap between buying and selling prices than in EUR/USD, and as larger jumps over scheduled releases. Liquidity, not opinion, explains much of the pair’s character.",
      },
    ],
    watch: [
      "The Reserve Bank of New Zealand Monetary Policy Committee’s Interest Rate Decision on the Official Cash Rate, and its Monetary Policy Statement",
      "The Global Dairy Trade auction results",
      "Stats NZ’s Consumer Price Index and labour market statistics",
      "The Reserve Bank of Australia’s Interest Rate Decision and China’s monthly activity data",
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The monthly United States employment report, with Non-Farm Payrolls",
    ],
    sources: [
      "Reserve Bank of New Zealand: Monetary Policy Statement, Monetary Policy Review and the record of each meeting",
      "Stats NZ: Consumers Price Index; Household Labour Force Survey; overseas merchandise trade",
      "Global Dairy Trade: published auction results",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "eur-gbp": {
    character:
      "EUR/GBP has no dollar in it. It measures the euro area against the United Kingdom directly, two neighbouring economies that trade heavily with each other and are hit by many of the same shocks, so it usually moves less in a day than either EUR/USD or GBP/USD. What does move it is whatever is different between the two: the two central banks’ timing, and British politics.",
    drivers: [
      {
        t: "The European Central Bank against the Bank of England",
        d: "The pair responds to the expected gap between euro-area and British interest rates. Because the two economies share energy prices, trade and the global cycle, the two banks often move in the same direction, and the pair turns on which is expected to move sooner. British inflation has at times proved more persistent than euro-area inflation, which is the kind of difference this cross isolates.",
      },
      {
        t: "The dollar, removed",
        d: "When the US dollar rises or falls against everything, EUR/USD and GBP/USD move together and this cross barely notices. That makes it the cleaner place to see news that is specifically British or specifically European. It is not immune: sterling usually falls further than the euro in a global scare, so the cross tends to rise when markets are frightened.",
      },
      {
        t: "The United Kingdom’s relationship with Europe",
        d: "Sterling left the European Exchange Rate Mechanism on 16 September 1992 and the United Kingdom never adopted the euro. The country voted to leave the European Union on 23 June 2016, left on 31 January 2020, and its transition period ended on 31 December 2020. Through those years this cross, more than cable, was where the state of the negotiations was priced.",
      },
      {
        t: "Trade between the two",
        d: "The euro area is the United Kingdom’s largest trading partner, so this exchange rate matters more to British import prices than the dollar rate does. A weaker pound against the euro raises the cost of imported goods and feeds British inflation, which the Bank of England then has to weigh. The effect runs from the currency to policy as well as from policy to the currency.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The euro is the base currency and sterling the quote currency: the price is the number of pounds one euro costs. A rising chart means a weaker pound. A pip is 0.0001, and on 100,000 euros one pip is worth 10 pounds, so profit and loss arise in sterling and must be converted for an account kept in another currency.",
      },
      {
        t: "A price below one",
        d: "One euro has never been worth as much as one pound, though it came close at the end of 2008. The pair therefore trades as a number below one, and a pip is a larger fraction of the price than it is in the dollar pairs. Percentage moves, not pip counts, are the fair way to compare it with them.",
      },
      {
        t: "How a cross is priced",
        d: "Arithmetically EUR/GBP equals EUR/USD divided by GBP/USD, and any gap between the two is closed by dealers at once. This is one of the few crosses with a deep market of its own, since European and British companies and funds exchange the two currencies directly. It is still less liquid than either dollar pair, and the cost of dealing is usually somewhat higher.",
      },
      {
        t: "The busiest hours",
        d: "This is a European-hours pair. British data is published early in the London morning and euro-area data through the continental morning; the Bank of England announces at midday in London and the European Central Bank in the early Frankfurt afternoon. Outside those hours, in the Asian session and the late New York afternoon, the pair is quiet and thin.",
      },
    ],
    watch: [
      "The Bank of England Monetary Policy Committee’s Interest Rate Decision, minutes and vote split",
      "The European Central Bank Governing Council’s Interest Rate Decision and press conference",
      "The United Kingdom’s Consumer Price Index and Eurostat’s flash estimate of euro-area inflation, monthly",
      "The monthly Purchasing Managers’ Index surveys for the United Kingdom and the euro area",
      "The United Kingdom’s Budget and other fiscal statements",
    ],
    sources: [
      "Bank of England: Monetary Policy Summary and minutes; Monetary Policy Report",
      "European Central Bank: monetary policy statements, accounts of Governing Council meetings and euro foreign exchange reference rates",
      "Office for National Statistics: consumer price inflation; UK trade",
      "Eurostat: Harmonised Index of Consumer Prices",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "eur-jpy": {
    character:
      "EUR/JPY is the cross between the world’s second and third most traded currencies. It combines the euro’s sensitivity to European growth and politics with the yen’s role as a funding currency, and so it is watched as a measure of risk appetite that leaves the dollar out. It is the most traded of the yen crosses, though still far less traded than USD/JPY.",
    drivers: [
      {
        t: "The European Central Bank against the Bank of Japan",
        d: "The pair responds to the gap between euro-area and Japanese interest rates. For eight years, from June 2014 to July 2022, the European Central Bank’s deposit rate was itself below zero, so that gap was small and the pair moved mostly on sentiment. When European rates rose and Japanese rates stayed near zero, the gap opened and the cross behaved much more like USD/JPY.",
      },
      {
        t: "The carry trade, European version",
        d: "When euro-area rates are well above Japanese ones, borrowing yen to hold euro assets earns the difference, and the position is closed in a hurry when markets take fright. The effect is the same as in USD/JPY but depends on the euro paying a worthwhile rate, which has not always been so. In the years of negative European rates the euro was itself used as a funding currency, and the cross lost much of this character.",
      },
      {
        t: "Japanese holdings of European bonds",
        d: "Japanese insurers, banks and pension funds are large holders of foreign bonds, including the government bonds of euro-area countries. Their buying and selling passes through this cross unless they hedge the currency. The Japanese Ministry of Finance publishes weekly figures on purchases and sales of foreign securities, which show the direction of the flow though not which currency it was in.",
      },
      {
        t: "Two crises, both visible here",
        d: "In the euro-area debt crisis of 2010 to 2012 the euro weakened while the yen was being bought as a refuge, and the cross fell on both sides at once. The turn came from both sides too: the European Central Bank’s commitment of 26 July 2012 to preserve the euro, and the Bank of Japan’s large-scale easing announced in April 2013. A cross can move further than either dollar pair when its two halves agree.",
      },
      {
        t: "Yen intervention",
        d: "When Japan’s Ministry of Finance intervenes it deals mainly in dollars, but the effect reaches every yen pair within moments. A sharp fall in USD/JPY caused by yen buying appears in EUR/JPY as well, with nothing European having happened. The cause of a sudden move in this cross is often found on the dollar–yen chart.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "The euro is the base currency and the yen the quote currency: the price is the number of yen one euro costs. As with every yen pair it is quoted to two decimal places, or three with fractional pips, and a pip is 0.01. On 100,000 euros one pip is worth 1,000 yen.",
      },
      {
        t: "Built from two dollar pairs",
        d: "EUR/JPY equals EUR/USD multiplied by USD/JPY. If the dollar strengthens against both currencies equally, the two legs cancel and the cross stands still; it moves when the euro and the yen diverge. Reading the cross therefore means asking which leg did the work.",
      },
      {
        t: "The cost of a cross",
        d: "Much of the dealing between euros and yen is carried out through the dollar, so the cost of the cross reflects the cost of both legs. The gap between buying and selling prices is usually wider than in EUR/USD or USD/JPY, and widens further in the hours when either Europe or Japan is closed. The number is larger too, so a move of a given number of pips is a smaller percentage than the same count would be in USD/JPY at a lower price.",
      },
      {
        t: "The busiest hours",
        d: "The pair is most active at the hand-over from Tokyo to Europe, in the early European morning, when both sides’ home markets are briefly open together. A second active period follows United States data, which moves both legs. The Bank of Japan’s announcements arrive around the middle of the Tokyo day, while Europe is asleep.",
      },
    ],
    watch: [
      "The Bank of Japan Policy Board’s Interest Rate Decision and its quarterly Outlook for Economic Activity and Prices",
      "The European Central Bank Governing Council’s Interest Rate Decision and press conference",
      "Eurostat’s flash estimate of euro-area inflation and Japan’s national Consumer Price Index, monthly",
      "The Japanese Ministry of Finance’s weekly International Transactions in Securities",
      "The monthly United States employment report, because it moves both dollar legs",
    ],
    sources: [
      "European Central Bank: monetary policy statements and accounts of Governing Council meetings",
      "Bank of Japan: Statement on Monetary Policy, Outlook for Economic Activity and Prices, Summary of Opinions",
      "Ministry of Finance, Japan: International Transactions in Securities; Foreign Exchange Intervention Operations",
      "Bank for International Settlements: Triennial Central Bank Survey",
    ],
  },

  "gbp-jpy": {
    character:
      "GBP/JPY joins the most politically sensitive of the major currencies to the one most sensitive to fear. Sterling tends to fall in a scare and the yen tends to rise, so the two halves of this cross often move in the same direction and add to each other. The result is a pair with a wide daily range, a higher dealing cost than the dollar pairs, and a history of very fast falls.",
    drivers: [
      {
        t: "The Bank of England against the Bank of Japan",
        d: "British interest rates have usually stood well above Japanese ones, and the pair responds to changes in that gap from either end. The Bank of England’s published vote split can move sterling without a change in Bank Rate. A shift in Bank of Japan policy, rare for many years, moves every yen pair at once and this one among the most.",
      },
      {
        t: "The carry trade, with a volatile partner",
        d: "Borrowing yen to hold sterling earns the interest gap between the two. Sterling’s own swings are large enough to wipe out a year of that interest in a few days, so the position is held nervously and abandoned quickly. In the autumn of 2008, as such positions were closed across the world, this cross fell further and faster than almost any other pair of major currencies.",
      },
      {
        t: "Two halves that agree",
        d: "On 24 June 2016, as the result of the United Kingdom’s referendum became known, sterling fell sharply and the yen rose as a refuge at the same time. The cross therefore moved more than either GBP/USD or USD/JPY did. The same compounding works in reverse in confident markets, when sterling rises and the yen is sold.",
      },
      {
        t: "British shocks, in yen",
        d: "Events that are purely British reach this cross through sterling. The flash fall of 7 October 2016, in the early Asian hours, and the sell-off after the fiscal statement of 23 September 2022 both appeared here as well as in cable. Because Tokyo is open when London is not, the first reaction to overnight British news is often seen in this pair.",
      },
      {
        t: "Yen intervention",
        d: "When Japan’s Ministry of Finance buys or sells yen against the dollar, GBP/JPY moves with USD/JPY within moments. Nothing about sterling need have changed. A sudden move in this cross with a quiet GBP/USD points to the yen side.",
      },
    ],
    mechanics: [
      {
        t: "Base, quote and pip",
        d: "Sterling is the base currency and the yen the quote currency: the price is the number of yen one pound costs. It is quoted to two decimal places, or three with fractional pips, and a pip is 0.01. On 100,000 pounds one pip is worth 1,000 yen.",
      },
      {
        t: "A large number, and what it does to pips",
        d: "Because a pound buys many yen, the price is the largest number among the currency pairs on this site, and a range of a hundred pips or more in a day is ordinary. Counted in pips it looks wilder than it is; counted in per cent it is still among the more volatile of the major crosses. Comparing its pip range with EUR/USD’s says little, since the pips are not the same size.",
      },
      {
        t: "Built from two dollar pairs",
        d: "GBP/JPY equals GBP/USD multiplied by USD/JPY. There is little direct dealing between pounds and yen, so most of the business passes through the dollar, and the cost of the cross carries the cost of both legs. That cost rises most in the hours when neither London nor Tokyo is fully open.",
      },
      {
        t: "The busiest hours",
        d: "The pair has two home sessions. Tokyo sets the tone in the Asian day, and the London morning, when British data is published and both centres briefly overlap, is usually the most active period. United States data later moves both dollar legs, sometimes in directions that cancel in the cross and sometimes in directions that add.",
      },
    ],
    watch: [
      "The Bank of England Monetary Policy Committee’s Interest Rate Decision, minutes and vote split",
      "The Bank of Japan Policy Board’s Interest Rate Decision and the governor’s press conference",
      "The United Kingdom’s Consumer Price Index and labour market statistics, monthly",
      "The United Kingdom’s Budget and other fiscal statements",
      "The Japanese Ministry of Finance’s monthly disclosure of foreign exchange intervention",
      "The monthly United States employment report, because it moves both dollar legs",
    ],
    sources: [
      "Bank of England: Monetary Policy Summary and minutes; Monetary Policy Report",
      "Bank of Japan: Statement on Monetary Policy, Outlook for Economic Activity and Prices, Summary of Opinions",
      "Ministry of Finance, Japan: Foreign Exchange Intervention Operations",
      "Bank for International Settlements: Triennial Central Bank Survey; Markets Committee report on the sterling “flash event” of 7 October 2016",
    ],
  },
};
