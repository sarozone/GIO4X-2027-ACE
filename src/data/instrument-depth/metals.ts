/**
 * INSTRUMENT DEPTH, METALS: what is particular to gold, silver, platinum and
 * palladium, beyond the profile every instrument page shares.
 *
 * General education about the underlying market. The rule it keeps: no current
 * or recent price, level or forecast; no tonnage or percentage; nothing about
 * GIO4X's own contract; no advice. Supply and demand are described in words,
 * each link as a mechanism with the times it has failed, and history is
 * limited to well-documented events with their dates.
 */
import type { DepthSet } from "./types";

export const METALS_DEPTH: DepthSet = {
  "xau-usd": {
    character:
      "Gold is the one metal held mainly for what it is and not for what it does. Almost all the gold ever mined still exists, in vaults, jewellery and central bank reserves, so the price is set far more by the willingness of existing holders to keep it than by what mines produce in a year. That makes it behave like a currency with no central bank and no interest rate.",
    drivers: [
      {
        t: "Real interest rates",
        d: "Gold pays nothing, so its cost is the return given up by not holding something that does. When the yield on inflation-protected government bonds rises, that cost rises and gold has tended to fall; when real yields fall, it has tended to rise. The link failed plainly from 2022, when real yields rose steeply and gold did not fall as the relationship would have suggested, a gap widely attributed to buying by central banks.",
      },
      {
        t: "The US dollar",
        d: "Gold is priced in dollars, so a stronger dollar makes it dearer for buyers who earn other currencies, and demand from them eases. The two usually move in opposite directions. They rise together when the fear in the market is about the financial system as a whole, since both are then being bought as refuges.",
      },
      {
        t: "Central banks",
        d: "Central banks hold gold as a reserve asset that is no one else’s liability. As a group they were sellers for many years and have been net buyers since around 2010, with purchases stepping up markedly from 2022, as the World Gold Council’s figures record. These buyers are not sensitive to interest rates in the way investors are, which is one reason the older rules of thumb have worked less well.",
      },
      {
        t: "Investment flows",
        d: "Investors hold gold as bars and coins, through exchange-traded funds backed by metal in vaults, and through futures. Fund holdings and futures positions can change quickly and are the most volatile part of demand. They tend to follow the price as well as lead it, which amplifies moves in both directions.",
      },
      {
        t: "Jewellery, and the buyers who wait",
        d: "Jewellery is the largest physical use, with India and China the largest markets. These buyers are sensitive to price: they step back when gold rises quickly and return when it falls, and recycling of old jewellery rises with the price. Demand of this kind slows a move; it rarely starts one.",
      },
      {
        t: "Stress, and the exception",
        d: "Gold is bought in times of fear, but in the first days of a scramble for cash it has been sold along with everything else, because it is one of the few things that can be sold. That happened in the autumn of 2008 and again in March 2020. In both cases it recovered while other assets were still falling.",
      },
    ],
    mechanics: [
      {
        t: "XAU and the troy ounce",
        d: "XAU is the code for one troy ounce of gold in the same international standard that gives currencies their three-letter codes. A troy ounce is about 31.1 grams, roughly a tenth heavier than the ounce used for food. XAU/USD is therefore read like a currency pair: the number of US dollars one troy ounce costs.",
      },
      {
        t: "The London market",
        d: "The centre of the wholesale market is London, where gold is traded directly between banks, refiners and dealers, not on an exchange. The standard unit is the Good Delivery bar of roughly 400 troy ounces, held in a small number of vaults, and most trading is in “unallocated” gold: a claim on a bank for metal, not title to particular bars. The spot price a screen shows is the price for this metal, delivered in London.",
      },
      {
        t: "The benchmark auctions",
        d: "Twice each London business day, in the morning and the afternoon, an electronic auction sets the LBMA Gold Price, which is used to value contracts, funds and mine sales around the world. It has been administered by ICE Benchmark Administration since March 2015, when it replaced the London Gold Fix that had run since 1919. It is a reference price at two moments, not a continuous quote.",
      },
      {
        t: "The futures exchange",
        d: "The main futures market is COMEX in New York, part of CME Group, where the standard contract is for 100 troy ounces. Futures and London spot are tied together by dealers who exchange one for the other, so the two prices normally differ only by the cost of financing and storing metal until the contract’s delivery month. In March 2020, when refineries and flights were shut, moving metal between the two cities became difficult and the gap opened far beyond its usual size.",
      },
      {
        t: "The end of the fixed price",
        d: "Under the Bretton Woods system the dollar was convertible into gold at a fixed official price for foreign governments. The United States suspended that convertibility on 15 August 1971. A freely moving gold price, and therefore every modern chart of it, dates from the years that followed.",
      },
    ],
    versus: [
      {
        t: "Spot reference price",
        d: "“Spot gold” is the price for unallocated metal settled in London two business days later. It is a wholesale price between large institutions. What a retail screen shows is a provider’s own quote based on it, which is why two screens can differ slightly at the same moment.",
      },
      {
        t: "A futures contract",
        d: "A future is an agreement on an exchange to buy or sell a fixed quantity in a named month. It has an expiry, a holder who wants to stay in the market must move to a later month, and its price includes financing and storage to that date. Very few contracts end in delivery of metal.",
      },
      {
        t: "Physical metal",
        d: "A coin or small bar costs more than its gold content, because it must be made, insured, shipped and sold at a margin, and it sells back for less. It has to be stored and may be taxed differently from a financial contract. In return the holder depends on no counterparty, which is the reason people hold it.",
      },
      {
        t: "A contract on the price",
        d: "A contract for difference or a margined spot position gives exposure to the change in the price and nothing else. No metal is owned or can be delivered, the position depends on the provider, and holding it overnight normally carries a financing adjustment. It is a way of taking a view on the price, not a way of owning gold.",
      },
    ],
    watch: [
      "The Federal Open Market Committee’s Interest Rate Decision and the chair’s press conference",
      "The United States Consumer Price Index, monthly",
      "The monthly United States employment report, with Non-Farm Payrolls",
      "The weekly Commitments of Traders report, for positioning in COMEX gold futures",
      "The World Gold Council’s quarterly Gold Demand Trends, including central bank purchases",
      "The Indian festival and wedding seasons and the Chinese New Year, the regular peaks of jewellery buying",
    ],
    sources: [
      "World Gold Council: Gold Demand Trends; central bank reserve statistics",
      "London Bullion Market Association: LBMA Gold Price, Good Delivery rules, and London vault holdings and clearing statistics",
      "CME Group: COMEX gold futures contract specifications and warehouse stocks",
      "Commodity Futures Trading Commission: Commitments of Traders",
      "United States Department of the Treasury: daily real yield curve rates; International Monetary Fund: International Financial Statistics, for official gold reserves",
    ],
  },

  "xag-usd": {
    character:
      "Silver is two metals in one: a store of value that follows gold, and an industrial material used because it conducts electricity better than anything else. Its market is far smaller than gold’s, so the same flow of money moves it much further. It tends to exaggerate gold’s moves in both directions, and to part company with gold when industry is weak.",
    drivers: [
      {
        t: "Gold, amplified",
        d: "Silver responds to the same forces as gold: real interest rates, the dollar and investors’ appetite for a store of value. Because the market is thinner, it usually moves further in percentage terms. The ratio between the two prices is widely followed; it has ranged very widely over time and has no level to which it must return.",
      },
      {
        t: "Industrial demand",
        d: "Industry is the largest source of silver demand: electronics and electrical contacts, solar panels, and alloys used for joining metals. This ties silver to manufacturing and to investment in electrification in a way gold is not tied. In an industrial downturn silver can fall while gold rises, which is when the two diverge most.",
      },
      {
        t: "Supply that ignores the price",
        d: "Most silver is not mined for its own sake. It comes out of the ground as a by-product of lead, zinc, copper and gold mining, with Mexico, Peru and China among the largest producers. A higher silver price therefore does little to bring more supply, and a lower one does little to remove it: output follows the fortunes of other metals.",
      },
      {
        t: "Investment and speculation",
        d: "Coins, bars, exchange-traded funds and futures make up the investment side, and it is the most changeable. Silver’s low price per ounce draws small investors, and it has repeatedly been the object of buying campaigns. In early 2021 a wave of retail buying organised online lifted the price sharply over a few days and faded as quickly.",
      },
      {
        t: "Silver Thursday, 27 March 1980",
        d: "In 1979 and early 1980 a small group of investors accumulated a very large position in silver and silver futures, and the price multiplied. The exchange changed its rules to restrict new buying, the price collapsed, and on 27 March 1980 the group failed to meet a margin call. The episode is the standard example of what happens when one buyer becomes most of a market.",
      },
    ],
    mechanics: [
      {
        t: "XAG and the size of a move",
        d: "XAG is the code for one troy ounce of silver, and XAG/USD is the number of US dollars it costs. Because the price per ounce is a small number compared with gold’s, a move of a few cents is a meaningful percentage. Wholesale contracts are for thousands of ounces for the same reason.",
      },
      {
        t: "One auction a day",
        d: "The LBMA Silver Price is set in a single electronic auction at midday in London, where gold has two auctions a day. It replaced the London Silver Fix, which ended in August 2014 after more than a century, and has been administered by ICE Benchmark Administration since 2017. Between auctions the price is whatever dealers quote in the London wholesale market.",
      },
      {
        t: "The futures exchange",
        d: "The main futures contract trades on COMEX in New York, part of CME Group, and is for 5,000 troy ounces. As with gold, dealers exchange futures for London metal, which keeps the two prices together in normal conditions. Stocks of metal in exchange-approved warehouses, published daily, are watched as a sign of how tight the deliverable supply is.",
      },
      {
        t: "Bulk and storage",
        d: "A given sum of money buys a far greater weight and volume of silver than of gold. The London wholesale bar is roughly 1,000 troy ounces, heavy enough to need handling equipment. Storage and transport therefore cost more as a share of value, which widens the gap between wholesale and retail prices.",
      },
    ],
    versus: [
      {
        t: "Spot reference price",
        d: "Spot silver is the wholesale price for unallocated metal settled in London. It is quoted continuously by dealers and anchored once a day by the LBMA Silver Price auction. A retail screen shows a provider’s own quote derived from it.",
      },
      {
        t: "A futures contract",
        d: "A COMEX future is a commitment to 5,000 ounces in a named delivery month, with daily margin calls on the whole amount. The size of the contract means a small move in the price is a large sum of money. It expires, and its price differs from spot by the cost of carrying metal to that date.",
      },
      {
        t: "Physical metal",
        d: "Silver coins and bars carry higher premiums over the metal price than gold ones, because making and shipping cost more relative to the value. In the United Kingdom and the European Union investment gold is exempt from value added tax and silver is not, which widens the gap between buying and selling prices further. Tarnish does not reduce the silver content but can affect what a dealer will pay.",
      },
      {
        t: "A contract on the price",
        d: "A contract for difference or margined position follows the silver price without any metal changing hands. Because silver moves further than gold in percentage terms, the same margin supports less room for error. The position depends on the provider and normally carries a financing adjustment when held overnight.",
      },
    ],
    watch: [
      "The Federal Open Market Committee’s Interest Rate Decision",
      "The United States Consumer Price Index, monthly",
      "The monthly manufacturing Purchasing Managers’ Index surveys for the United States and China",
      "The weekly Commitments of Traders report, for positioning in COMEX silver futures",
      "The Silver Institute’s annual World Silver Survey",
      "Daily reports of silver stocks in COMEX-approved warehouses",
    ],
    sources: [
      "The Silver Institute: World Silver Survey",
      "London Bullion Market Association: LBMA Silver Price, Good Delivery rules and London vault holdings",
      "CME Group: COMEX silver futures contract specifications and warehouse stocks",
      "Commodity Futures Trading Commission: Commitments of Traders",
    ],
  },

  "xpt-usd": {
    character:
      "Platinum is an industrial metal with a jewellery market attached, and almost none of gold’s monetary role. Its supply is concentrated in one country to a degree found in few other commodities, and its largest use is in cleaning vehicle exhaust. The price therefore turns on South African mining and on the car industry far more than on interest rates.",
    drivers: [
      {
        t: "Vehicle exhaust catalysts",
        d: "The largest single use of platinum is in catalytic converters, historically above all for diesel engines. The disclosure in September 2015 that diesel emissions tests had been cheated was followed by a lasting fall in diesel’s share of European car sales, and with it this source of demand. Tighter emissions rules work the other way, since they require more metal in each vehicle.",
      },
      {
        t: "South African supply",
        d: "Most of the world’s mined platinum comes from South Africa, with Russia and Zimbabwe well behind. The mines are deep, labour-intensive and heavy users of electricity, so strikes and power shortages reach the price directly: a strike in the first half of 2014 stopped much of the industry for about five months. Because miners’ costs are in rand and their sales in dollars, a weak rand lets them keep producing at lower dollar prices.",
      },
      {
        t: "Substitution with palladium",
        d: "Platinum and palladium can replace one another in petrol-engine catalysts, within limits and with a delay of years while new designs are approved. When one becomes much dearer than the other, carmakers shift towards the cheaper metal. This ties the two prices together over the long run and is the main reason neither can stay far above the other indefinitely.",
      },
      {
        t: "Jewellery and industry",
        d: "Jewellery, especially in China and Japan, is the second large use, and like gold jewellery it is sensitive to price. Platinum is also used in glass-making, chemical and petroleum refining, and medical devices. Its use in hydrogen fuel cells and in the electrolysers that make hydrogen is a possible future source of demand, of uncertain size.",
      },
      {
        t: "Recycling",
        d: "A large share of supply comes from recovering metal from scrapped catalytic converters and old jewellery. This supply responds to the price and to how many old vehicles are being scrapped. It makes the market less dependent on mines than the concentration of mining alone would suggest.",
      },
      {
        t: "Gold and the dollar, weakly",
        d: "Platinum is priced in dollars and moves somewhat with gold and against the dollar. The link is loose: for long stretches platinum cost more than gold, and for long stretches less. In a recession it tends to behave as an industrial metal and fall, where gold may rise.",
      },
    ],
    mechanics: [
      {
        t: "XPT and how it is quoted",
        d: "XPT is the code for one troy ounce of platinum, and XPT/USD is its price in US dollars. The market is small compared with gold’s, so quotes carry a wider gap between buying and selling prices and can jump when a large order arrives.",
      },
      {
        t: "London and Zurich",
        d: "The wholesale market is organised by the London Platinum and Palladium Market, and metal is held and settled in London or Zurich. The standard is a plate or ingot of at least 99.95 per cent purity. Industrial users often need the metal as a powder called sponge, which can trade at a different price from ingot when one form is scarce.",
      },
      {
        t: "The benchmark",
        d: "The LBMA Platinum Price is set twice each London business day, in the morning and the afternoon. The auction has been run by the London Metal Exchange since December 2014. It is the reference used in supply contracts between miners, refiners and carmakers.",
      },
      {
        t: "The futures exchange",
        d: "Platinum futures trade on NYMEX in New York, part of CME Group, in a contract of 50 troy ounces, half the size of the gold contract. Turnover is a small fraction of gold’s. In a thin futures market the positions of speculative funds can be large relative to the whole, and their changes move the price.",
      },
    ],
    versus: [
      {
        t: "Spot reference price",
        d: "Spot platinum is the wholesale price for metal held in London or Zurich, quoted by a small number of dealers. Fewer dealers means the retail quotes built on it differ more from one provider to another than gold quotes do.",
      },
      {
        t: "A futures contract",
        d: "A NYMEX platinum future is for 50 ounces in a named month. The contract months are fewer and more widely spaced than gold’s, and most activity sits in the nearest one. Holders who stay in the market must move from one month to the next as each expires.",
      },
      {
        t: "Physical metal",
        d: "Platinum coins and bars exist but are made in small numbers, so premiums are high and resale markets narrow. In the United Kingdom and the European Union they do not share investment gold’s exemption from value added tax. Most physical platinum is held by industry and in vaults for funds, not by individuals.",
      },
      {
        t: "A contract on the price",
        d: "A contract for difference or margined position follows the platinum price with no metal owned. In a thin market the cost of dealing is higher and gaps over news are larger than in gold. The position depends on the provider and normally carries a financing adjustment overnight.",
      },
    ],
    watch: [
      "Monthly vehicle sales and production figures for Europe, China and the United States",
      "Statistics South Africa’s monthly mining production release",
      "The World Platinum Investment Council’s Platinum Quarterly",
      "Johnson Matthey’s annual PGM Market Report, published around the London Platinum Week",
      "The weekly Commitments of Traders report, for positioning in NYMEX platinum futures",
      "New stages of vehicle emissions standards in Europe, China and the United States",
    ],
    sources: [
      "World Platinum Investment Council: Platinum Quarterly",
      "Johnson Matthey: PGM Market Report",
      "London Platinum and Palladium Market and London Bullion Market Association: Good Delivery rules; London Metal Exchange: LBMA Platinum Price",
      "CME Group: NYMEX platinum futures contract specifications",
      "Statistics South Africa: Mining: Production and sales",
    ],
  },

  "xpd-usd": {
    character:
      "Palladium is the most specialised of the four metals: the great majority of it goes into catalytic converters for petrol engines, and very little is held as an investment. Supply comes mainly from two countries and mostly as a by-product of mining something else. A small market with one dominant use and inflexible supply has produced some of the most extreme price moves of any metal.",
    drivers: [
      {
        t: "Petrol-engine vehicles",
        d: "Demand rises and falls with the number of petrol and hybrid cars built and with how much metal emissions rules require in each one. Stricter standards in China, Europe and the United States through the 2010s raised the loading per vehicle and helped push the market into a long shortage. A vehicle powered only by a battery has no exhaust and uses none, which is the main long-term question over this metal.",
      },
      {
        t: "Russia and South Africa",
        d: "Russia and South Africa supply most of the world’s mined palladium, with smaller amounts from North America and Zimbabwe. In Russia it is a by-product of nickel mining and in South Africa of platinum mining, so output follows the economics of those metals and responds little to the palladium price. Any doubt about Russian deliveries reaches the price at once.",
      },
      {
        t: "Shocks to Russian supply",
        d: "In 2000 and early 2001 delays to Russian export shipments helped drive a sharp rise that reversed as fast. After the invasion of Ukraine began on 24 February 2022 the price rose steeply again, and in April 2022 the London market suspended the accreditation of Russia’s refiners for newly produced metal. In both cases the move was driven by fear about availability more than by any change in use.",
      },
      {
        t: "Substitution with platinum",
        d: "Carmakers can replace part of the palladium in a petrol catalyst with platinum, after a period of testing and approval. They began doing so when palladium became much the dearer of the two. Substitution is slow to start and slow to reverse, so it acts on the price over years.",
      },
      {
        t: "Recycling",
        d: "Metal recovered from scrapped catalytic converters is a large and growing source of supply. It depends on how many old vehicles are scrapped and on the price, which determines how keenly scrap is collected. As more cars built in the years of heavy loadings reach the end of their lives, this supply rises regardless of mining.",
      },
    ],
    mechanics: [
      {
        t: "XPD and how it is quoted",
        d: "XPD is the code for one troy ounce of palladium, and XPD/USD is its price in US dollars. It is the least traded of the four metals on this site. Quotes carry the widest gap between buying and selling prices of the four, and that gap grows quickly when the market is disturbed.",
      },
      {
        t: "A price history without an anchor",
        d: "For most of its history palladium was the cheaper of the two sister metals. From the late 2010s, for several years, it cost more than platinum and for a time more than gold, before falling back a long way. No relationship between these prices has proved permanent.",
      },
      {
        t: "The benchmark and the wholesale market",
        d: "The LBMA Palladium Price is set twice each London business day in an auction run by the London Metal Exchange since December 2014. Wholesale metal is held and settled in London or Zurich under the rules of the London Platinum and Palladium Market. The auction price is the reference in contracts between producers and carmakers.",
      },
      {
        t: "Borrowing costs as a signal",
        d: "Industrial users often borrow metal instead of buying it. When palladium is scarce the rate charged for lending it rises, and the price for immediate delivery moves above the price for later delivery. These signs of tightness have accompanied the metal’s sharpest rises and can vanish as quickly as they appear.",
      },
      {
        t: "The futures exchange",
        d: "Palladium futures trade on NYMEX in New York, part of CME Group, in a contract of 100 troy ounces. The number of contracts outstanding is small beside gold or silver. The exchange has raised margin requirements sharply during violent moves, which itself forces some holders to close positions.",
      },
    ],
    versus: [
      {
        t: "Spot reference price",
        d: "Spot palladium is the wholesale price for metal in London or Zurich, quoted by very few dealers. In a disturbed market those quotes can differ from one another and from the futures price by amounts unknown in gold.",
      },
      {
        t: "A futures contract",
        d: "A NYMEX palladium future is for 100 ounces in a named month, with few active months. When metal is scarce the nearest month can trade well above later ones. A holder who moves from one month to the next then does so at prices that reflect that scarcity.",
      },
      {
        t: "Physical metal",
        d: "Palladium coins and bars are produced in very small numbers, with high premiums and few buyers on resale. The origin of a bar can matter: metal from a refiner whose accreditation has been suspended may not be accepted in the wholesale market. Like silver and platinum, it does not share investment gold’s exemption from value added tax in the United Kingdom and the European Union.",
      },
      {
        t: "A contract on the price",
        d: "A contract for difference or margined position follows the palladium price with no metal owned. It does not distinguish where metal came from or whether any can be borrowed, though both drive the price it tracks. In so thin a market the cost of dealing and the size of gaps are the largest among the four metals, and the position normally carries a financing adjustment overnight.",
      },
    ],
    watch: [
      "Monthly vehicle sales and production figures for China, the United States and Europe, and the share of battery-electric vehicles within them",
      "Johnson Matthey’s annual PGM Market Report",
      "Production reports from the large Russian and South African mining companies, quarterly",
      "Changes to sanctions, tariffs or accreditation affecting Russian metal",
      "The weekly Commitments of Traders report, for positioning in NYMEX palladium futures",
    ],
    sources: [
      "Johnson Matthey: PGM Market Report",
      "London Platinum and Palladium Market: Good Delivery list and notices; London Metal Exchange: LBMA Palladium Price",
      "CME Group: NYMEX palladium futures contract specifications and margin notices",
      "Commodity Futures Trading Commission: Commitments of Traders",
    ],
  },
};
