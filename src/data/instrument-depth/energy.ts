/**
 * INSTRUMENT DEPTH, ENERGY: what is particular to Brent crude, West Texas
 * Intermediate and United States natural gas, beyond the short profile every
 * instrument page shares.
 *
 * General education about the underlying markets: what each benchmark
 * measures, where it is delivered, which reports move it, and what the shape
 * of the futures curve means for a position that is rolled along it. Nothing
 * here is a current price, stock level, production figure or forecast, and
 * nothing is advice or a description of GIO4X's own contract. The one price
 * quoted is a historical settlement, given because the event is the lesson.
 * What a futures contract is, is explained once on the investing pages
 * (src/data/investing.ts).
 */
import type { DepthSet } from "./types";

export const ENERGY_DEPTH: DepthSet = {
  brent: {
    character:
      "Brent is the price of crude oil loaded onto ships in the North Sea, and by extension the reference for most oil traded between countries. Because it is seaborne it can go wherever the price is best, which makes it a measure of the world market where WTI is a measure of an inland American one. Its futures settle in cash, not in barrels.",
    drivers: [
      {
        t: "Decisions by the producer group",
        d: "The Organization of the Petroleum Exporting Countries and the producers allied with it agree production targets for their members. An agreed cut removes supply the market had expected and an increase adds it, and the price responds to the difference between what was expected and what was announced. Members do not always produce what they agreed, so compliance is followed as closely as the targets.",
      },
      {
        t: "Shipping routes and conflict",
        d: "Much of the world’s traded crude passes through a few narrow sea lanes, the Strait of Hormuz above all. A threat to tankers there, or sanctions that take a producer’s exports off the market, raises the price of oil that can still be delivered. The move often fades if supply is not in fact interrupted.",
      },
      {
        t: "World demand",
        d: "Demand follows economic activity: freight, flying, driving and petrochemicals. Growth figures and factory surveys from the largest importing countries, China and India among them, change expectations of demand. Demand falls far less often than supply changes, but when it does, as in the spring of 2020, the effect is large.",
      },
      {
        t: "The United States dollar",
        d: "Oil is priced in dollars. When the dollar rises, oil becomes dearer for buyers who earn other currencies, which tends to weigh on demand and on the dollar price. The link is a tendency and has run the other way when both rose together on a supply shock.",
      },
      {
        t: "Refining margins",
        d: "Crude is worth what refiners can earn by turning it into petrol, diesel and jet fuel. When the margin between product prices and crude is wide, refiners buy more crude; when it is thin, or when refineries shut for maintenance, they buy less.",
      },
    ],
    mechanics: [
      {
        t: "A benchmark made of several crudes",
        d: "Output from the original Brent field has dwindled, so the benchmark has been widened over the years. The physical price, known as Dated Brent and assessed by a price-reporting agency, now draws on several North Sea grades and, since 2023, on a grade of American crude delivered to Rotterdam. The name has outlived the field.",
      },
      {
        t: "Three linked prices",
        d: "There is the price of physical cargoes loading in the coming weeks, a forward market in cargoes for later months, and the futures contract. The futures price most people see is tied to the physical market through the other two. In a tight market the physical price can stand well above the futures.",
      },
      {
        t: "Cash settlement",
        d: "The Brent futures contract, traded on a London exchange, is settled in cash against an index of the physical forward market, with physical delivery possible only by a separate arrangement between the parties. Nobody is obliged to receive oil at expiry. This is the main structural difference from WTI.",
      },
      {
        t: "Quoted in dollars per barrel",
        d: "The price is for one barrel, in United States dollars, and each futures contract covers a thousand barrels. Brent is a light, low-sulphur crude; heavier and more sulphurous crudes sell at a discount to it, and that discount varies.",
      },
    ],
    versus: [
      {
        t: "Physical oil",
        d: "A barrel of crude has to be stored, insured and shipped, and is of use only to a refinery. Almost nobody outside the oil industry owns it. Every financial exposure to oil is therefore to a contract, and the contract’s terms matter as much as the price of oil.",
      },
      {
        t: "A futures contract",
        d: "A future fixes a price for a named month. There is a different price for each month, and the contract nearest expiry is the one usually quoted. Holding an oil exposure over time means selling each contract before it expires and buying a later one.",
      },
      {
        t: "A CFD",
        d: "A CFD on Brent exchanges the change in a price that a provider derives from the futures. Some are based on a named futures month and expire with it; others are quoted as a continuous price with an adjustment or a financing charge that reflects the curve. Either way the holder’s result includes the shape of the curve, and the provider is the counterparty.",
      },
    ],
    lifecycle: [
      {
        t: "Expiry",
        d: "Each monthly Brent contract stops trading well before the month it is named for, earlier than the WTI contract for the same month. A “front month” price in the news therefore refers to oil for delivery some way ahead. Volume moves to the next contract in the weeks before expiry.",
      },
      {
        t: "Contango and backwardation",
        d: "When later months are priced above nearer ones the curve is in contango, which usually reflects ample supply and the cost of storing oil. When nearer months are priced above later ones it is in backwardation, which usually reflects a shortage of oil available now. The curve can change from one to the other within weeks.",
      },
      {
        t: "What rolling does",
        d: "A position rolled in contango sells the cheaper expiring contract and buys a dearer one, and if the spot price then stays where it was, the new contract loses value as it approaches expiry. In backwardation the opposite holds. The headline price can be unchanged over a period in which a rolled position has gained or lost a meaningful amount.",
      },
      {
        t: "Changes to the benchmark",
        d: "The grades that make up the benchmark are changed from time to time by the price-reporting agency and the exchange, after consultation, as North Sea output declines. Such changes are announced far ahead and alter what the price represents without any break in the quoted series.",
      },
    ],
    watch: [
      "Ministerial meetings of the Organization of the Petroleum Exporting Countries and its allied producers",
      "The International Energy Agency’s monthly Oil Market Report",
      "OPEC’s Monthly Oil Market Report",
      "The Energy Information Administration’s Weekly Petroleum Status Report",
      "The monthly expiry of the front Brent futures contract",
      "Spring and autumn refinery maintenance seasons",
    ],
    sources: [
      "ICE Futures Europe: Brent Crude Futures contract specification",
      "S&P Global Commodity Insights (Platts): methodology and specifications guide for crude oil, including Dated Brent",
      "International Energy Agency: Oil Market Report",
      "Organization of the Petroleum Exporting Countries: Monthly Oil Market Report",
      "U.S. Energy Information Administration: Short-Term Energy Outlook",
    ],
  },

  wti: {
    character:
      "West Texas Intermediate is the American benchmark, and its futures contract ends in real barrels delivered into pipelines and tanks at Cushing, a small town in Oklahoma. That one inland delivery point is what makes WTI itself: its price depends on how full the tanks at Cushing are and on whether oil can get out. It is the market with the most frequent and most detailed official data.",
    drivers: [
      {
        t: "The weekly inventory report",
        d: "The Energy Information Administration publishes the Weekly Petroleum Status Report, normally on Wednesday morning in Washington and a day later after a public holiday. It gives stocks of crude and products, refinery activity, imports, exports and an estimate of production. The price reacts to the difference between the reported change in stocks and what had been expected, and stocks at Cushing are read separately because that is where the contract delivers.",
      },
      {
        t: "The industry survey the evening before",
        d: "The American Petroleum Institute, an industry association, circulates its own weekly stock figures on the evening before the official report. The two often agree in direction and sometimes do not, and the official figures are the ones the market finally settles on.",
      },
      {
        t: "United States production",
        d: "Output from shale fields can be raised or cut faster than conventional production, in months and not years. The weekly count of active drilling rigs, published by an oilfield services company, is used as an early sign of where production is heading. The link has loosened as wells have become more productive.",
      },
      {
        t: "The relationship with Brent",
        d: "WTI and Brent are similar grades and usually move together, with the gap between them reflecting the cost of moving American oil to the coast and abroad. In the early 2010s, when shale output outran the pipelines leaving Cushing, WTI traded far below Brent. The gap narrowed after new pipelines were built and after the United States lifted its restrictions on exporting crude at the end of 2015.",
      },
      {
        t: "Seasons and storms",
        d: "American petrol demand is highest in the summer driving season, and refineries schedule maintenance in spring and autumn, when they buy less crude. Hurricanes in the Gulf of Mexico can shut both offshore production and coastal refineries, so their effect on the crude price depends on which is hit harder.",
      },
      {
        t: "Government stocks",
        d: "The United States holds an emergency stock of crude, the Strategic Petroleum Reserve. Releases from it add supply to the market and purchases to refill it add demand, and both are announced publicly.",
      },
    ],
    mechanics: [
      {
        t: "Physical delivery at Cushing",
        d: "The futures contract, traded on the New York Mercantile Exchange, is for a thousand barrels of light, low-sulphur crude delivered at Cushing during the contract month. Anyone still holding a contract after trading ends must make or take delivery through a pipeline or storage facility there. Most participants have no means of doing so and must close their positions first.",
      },
      {
        t: "A landlocked price",
        d: "Cushing has a fixed amount of tank space and a fixed set of pipelines in and out. When the tanks are nearly full, a seller with oil arriving and nowhere to put it will accept a very low price. A seaborne benchmark does not have this constraint to the same degree, because a ship can go elsewhere or wait.",
      },
      {
        t: "Dollars per barrel, month by month",
        d: "There is a separate contract and a separate price for every month for years ahead. The price quoted in the news is the nearest month, which changes identity once a month. A chart that joins successive front months together shows jumps at each change that no holder experienced as profit or loss.",
      },
      {
        t: "Two reports, two days",
        d: "The industry association’s figures arrive after the futures have settled for the day and the official figures the next morning. Prices can move on the first and reverse on the second.",
      },
    ],
    versus: [
      {
        t: "Physical oil",
        d: "Owning crude means owning something that must sit in a tank or move through a pipe, at a cost. That cost of storage is what links one month’s price to the next, and it is why the curve matters to anyone holding an oil exposure for more than a few weeks.",
      },
      {
        t: "A futures contract",
        d: "A WTI future is a commitment to deliver or receive oil at Cushing in a named month, though nearly all contracts are closed before that. Its price converges on the price of physical oil at Cushing as expiry nears. A holder who wants to stay exposed sells it and buys a later month.",
      },
      {
        t: "A fund that holds futures",
        d: "Funds offering exposure to oil hold futures, not oil, and roll them on a schedule. Their returns have differed widely from the change in the headline price over the same period, because of the curve. In the spring of 2020 several such funds changed which months they held at short notice.",
      },
      {
        t: "A CFD",
        d: "A CFD on WTI exchanges the change in a provider’s price, which is derived from the futures. It involves no delivery. It still inherits expiry and the curve, either through a contract that expires and is replaced or through an adjustment when the reference month changes, and it adds the provider as counterparty.",
      },
    ],
    lifecycle: [
      {
        t: "Expiry",
        d: "Each monthly contract stops trading a few business days before the twenty-fifth of the month before delivery. In the final days the number of open contracts shrinks quickly, trading thins, and the price is set by the few participants who can handle physical oil.",
      },
      {
        t: "The day the price went below zero",
        d: "On 20 April 2020, the day before the May contract expired, that contract settled at minus 37.63 dollars a barrel. Demand had collapsed in the pandemic, storage at Cushing was close to full, and holders who could not take delivery had to pay others to take the contracts from them. The exchange had confirmed some days earlier that its systems would accept negative prices; later months stayed positive throughout.",
      },
      {
        t: "Contango, backwardation and the roll",
        d: "In contango, later months cost more than nearer ones, and a position rolled forward buys dearer than it sells. In backwardation the reverse is true. Over a year of steep contango a rolled position can lose substantially while the front-month price ends where it began, and the weeks around April 2020 were the extreme case.",
      },
      {
        t: "Exchange limits and margin changes",
        d: "The exchange applies price-fluctuation limits that pause trading briefly after a large move, and it raises the margin required on futures when volatility rises. Both have knock-on effects for products priced from the futures.",
      },
    ],
    watch: [
      "The Energy Information Administration’s Weekly Petroleum Status Report",
      "The American Petroleum Institute’s Weekly Statistical Bulletin, the evening before",
      "The weekly North American rig count",
      "The monthly expiry of the front WTI futures contract",
      "The Energy Information Administration’s monthly Short-Term Energy Outlook",
      "The Atlantic hurricane season and the summer driving season",
    ],
    sources: [
      "U.S. Energy Information Administration: Weekly Petroleum Status Report",
      "CME Group (New York Mercantile Exchange): Light Sweet Crude Oil futures contract specifications and rulebook chapter",
      "Commodity Futures Trading Commission: interim staff report on trading in the WTI crude oil futures contract on and around 20 April 2020",
      "American Petroleum Institute: Weekly Statistical Bulletin",
      "Commodity Futures Trading Commission: Commitments of Traders report",
    ],
  },

  "natural-gas": {
    character:
      "This is the price of gas delivered by pipeline at Henry Hub in Louisiana, the reference point for the United States. Gas is costly to store and to move, and a large part of demand depends on the weather, so the price moves further and faster than oil and follows the calendar closely. It is a North American price: gas in Europe and Asia trades on separate benchmarks.",
    drivers: [
      {
        t: "Weather",
        d: "Cold winters raise demand for heating and hot summers raise demand for electricity to run air conditioning, much of which is generated from gas. Forecasts are measured in heating and cooling degree days, and a change in the outlook for the next two weeks can move the price before any gas is burned. A mild winter leaves stocks high and has weighed on prices for months afterwards.",
      },
      {
        t: "The weekly storage report",
        d: "The Energy Information Administration publishes the Weekly Natural Gas Storage Report, normally on Thursday morning in Washington. It gives the volume of gas in underground storage and the change over the week, set against the same week a year earlier and a five-year average. The market reacts to the gap between the reported change and what was expected.",
      },
      {
        t: "Production, including gas that comes with oil",
        d: "A large part of American gas is produced alongside oil, from wells drilled for the oil. That gas arrives whether or not the gas price justifies it, so supply does not always fall when the price does. In oil-producing regions with too few pipelines, local gas prices have at times been negative.",
      },
      {
        t: "Exports of liquefied gas",
        d: "Since 2016 the United States has exported gas by ship from the mainland as liquefied natural gas. Export terminals are now a large and steady source of demand and connect the American price loosely to prices in Europe and Asia. An outage at a terminal leaves gas in the domestic market and has lowered the American price while raising prices overseas.",
      },
      {
        t: "Power generation",
        d: "Electricity generators can switch between gas and coal to some extent. Cheap gas takes demand from coal, which supports the gas price; dear gas hands it back. Output from wind and solar also changes how much gas is burned on a given day.",
      },
    ],
    mechanics: [
      {
        t: "Henry Hub",
        d: "The futures contract, traded on the New York Mercantile Exchange, is for delivery at Henry Hub, a junction of pipelines in Louisiana. Gas at other points in the country trades at a difference to the hub price, known as the basis, which reflects pipeline capacity. The hub price is therefore a reference, not the price everywhere.",
      },
      {
        t: "Priced by energy content",
        d: "The price is in dollars per million British thermal units, a measure of heat, not of volume. Storage and production are reported in cubic feet. The two are related by the heat content of the gas.",
      },
      {
        t: "Two seasons of storage",
        d: "Gas is injected into underground storage from spring to autumn and withdrawn in winter. The injection season runs roughly from April to October and the withdrawal season from November to March. The level of storage at the end of each season, compared with normal, is the market’s main measure of whether supply is comfortable.",
      },
      {
        t: "Not the European or Asian price",
        d: "Europe’s main benchmark is a Dutch trading hub and Asia’s is an assessed price for cargoes delivered to the north-east of the region. They are linked to Henry Hub only by the limited capacity to liquefy and ship gas, and the three have diverged very widely, as they did in 2022.",
      },
    ],
    versus: [
      {
        t: "Physical gas",
        d: "Gas cannot be held without a pipeline connection or a storage cavern. There is no equivalent of a coin or a bar. Every exposure outside the industry is to a contract.",
      },
      {
        t: "A futures contract",
        d: "Each month has its own contract and its own price, and neighbouring months can differ by far more than in oil, because gas for January is a different thing from gas for April. The front-month price changes identity every month, and at some changes the quoted price jumps although nothing has happened in the market.",
      },
      {
        t: "A fund that holds futures",
        d: "Funds that track gas hold futures and roll them monthly. Because the gas curve is so often in contango, the long-run return of such funds has been far below the change in the front-month price. The effect is larger in gas than in almost any other commodity.",
      },
      {
        t: "A CFD",
        d: "A CFD on natural gas exchanges the change in a provider’s price derived from the futures. It carries the same seasonal curve, through expiry of the contract or through an adjustment when the reference month changes. A price gap at such a change is the difference between two contracts, and how it is treated is a matter of the provider’s terms.",
      },
    ],
    lifecycle: [
      {
        t: "Monthly expiry",
        d: "Each contract stops trading a few business days before the start of its delivery month, and holders who remain must deliver or receive gas at the hub. Trading thins in the last days and price moves can be abrupt.",
      },
      {
        t: "A curve with a seasonal shape",
        d: "Winter months are normally priced above the summer months around them, so the curve rises and falls in a yearly wave. Contango from autumn into winter and backwardation from winter into spring are built in. The spread between the March and April contracts, the end of winter, is known among traders for its violence.",
      },
      {
        t: "What rolling does",
        d: "Rolling from a cheaper month into a dearer one costs the difference if the nearer price does not rise to meet it. In gas this happens for much of the year. A holder can be right about the direction of the front-month price and still lose on a position held and rolled across several months.",
      },
      {
        t: "Freezes and storms",
        d: "Severe cold can freeze equipment at the wellhead and cut production at the moment demand is highest, as happened in the south-central United States in February 2021. Hurricanes can shut offshore production, but they can also shut export terminals and cut electricity demand, so their net effect on the price is not fixed.",
      },
    ],
    watch: [
      "The Energy Information Administration’s Weekly Natural Gas Storage Report",
      "The National Oceanic and Atmospheric Administration’s six-to-ten-day and eight-to-fourteen-day temperature outlooks",
      "The monthly expiry of the front Henry Hub futures contract",
      "The start of the withdrawal season in November and of the injection season in April",
      "The Energy Information Administration’s monthly Short-Term Energy Outlook",
      "The Atlantic hurricane season",
    ],
    sources: [
      "U.S. Energy Information Administration: Weekly Natural Gas Storage Report",
      "U.S. Energy Information Administration: Natural Gas Monthly",
      "CME Group (New York Mercantile Exchange): Henry Hub Natural Gas futures contract specifications",
      "National Oceanic and Atmospheric Administration, Climate Prediction Center: temperature outlooks and degree-day data",
      "U.S. Energy Information Administration: Short-Term Energy Outlook",
    ],
  },
};
