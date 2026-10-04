/**
 * INSTRUMENT DEPTH, CRYPTO-ASSETS: what is particular to each of the five
 * networks, beyond the short profile every instrument page shares.
 *
 * General education about the network behind each price: what it is for, how
 * its participants reach agreement, the rules of its supply, and how holding
 * a coin differs from a CFD on its price. Nothing here is a current price,
 * market value, yield or forecast, and nothing is advice or a description of
 * GIO4X's own contract. No legal or regulatory conclusion is drawn about any
 * asset: where a matter has been before a court, the text says only that it
 * has been.
 */
import type { DepthSet } from "./types";

export const CRYPTO_DEPTH: DepthSet = {
  "btc-usd": {
    character:
      "Bitcoin is the first crypto-asset and the one the others are measured against. Its network does one job, keeping a shared record of who holds how much, and its supply follows a schedule fixed in its software, ending at a cap of twenty-one million coins. It is the only one of the five whose main argument is scarcity.",
    drivers: [
      {
        t: "Appetite for risk and the supply of money",
        d: "Over much of its history Bitcoin has risen when money was cheap and investors were willing to take risk, and fallen when interest rates rose. It has often moved with technology shares on such days. The description of it as a store of value independent of other markets has held in some periods and failed in others.",
      },
      {
        t: "Flows through funds and listed products",
        d: "Since exchange-traded products holding Bitcoin directly began trading in the United States in January 2024, money entering and leaving them is published daily. Purchases by such funds require coins to be bought, and redemptions require them to be sold. The figures are followed as a measure of demand from investors who do not hold coins themselves.",
      },
      {
        t: "The halving",
        d: "Roughly every four years the number of new coins paid to miners for each block is cut in half. The date is known far in advance, so the cut in new supply is no surprise. Earlier halvings were followed by large rises, but there have been only a few, each in different conditions, and that is too little to establish a rule.",
      },
      {
        t: "Leverage in the market",
        d: "A large part of trading takes place in derivatives on crypto exchanges, with borrowed money. When the price moves against many leveraged positions at once, the exchanges close them automatically, and those forced trades push the price further. Sudden moves of this kind are often larger at weekends, when fewer orders are resting in the market.",
      },
      {
        t: "Failures of intermediaries",
        d: "The network itself has run without interruption for many years, but the companies around it have not. The collapse of a large exchange in 2014 and of another in November 2022 each led to sharp falls and to coins being frozen in insolvency proceedings. The risk in such cases lay with the custodian, not with the protocol.",
      },
    ],
    mechanics: [
      {
        t: "Proof of work",
        d: "Transactions are gathered into blocks by miners, who compete to solve a computational puzzle; the winner adds the block and is paid in new coins and fees. The difficulty of the puzzle adjusts every 2,016 blocks, about two weeks, so that blocks arrive roughly every ten minutes however much computing power is at work. Rewriting the record would require redoing that work faster than everyone else combined.",
      },
      {
        t: "The supply schedule",
        d: "The reward began at fifty coins per block and halves every 210,000 blocks. Halvings took place in 2012, 2016, 2020 and 2024. The total can never exceed twenty-one million, and the last fraction will not be issued until well into the next century.",
      },
      {
        t: "Units and settlement",
        d: "One bitcoin divides into a hundred million units called satoshis, so a holding need not be a whole coin. A payment is treated as settled once several further blocks have been built on top of it, which is why transfers take from minutes to an hour to be relied on.",
      },
      {
        t: "No single price",
        d: "Bitcoin trades on many separate exchanges around the world, each with its own order book. Prices differ between them by small amounts that traders narrow by buying on one and selling on another, and by larger amounts when moving money between venues is slow or restricted. Any quoted price is one venue’s, or an average of several.",
      },
    ],
    versus: [
      {
        t: "Holding the coin yourself",
        d: "Control of a coin is control of a private key. Whoever holds the key can move the coin, at any hour, to anyone, and nobody can reverse the transfer; whoever loses the key loses the coin for good. Self-custody removes the risk of an intermediary and puts the whole risk of safekeeping on the holder.",
      },
      {
        t: "Holding it at an exchange",
        d: "A coin left with an exchange is a claim on that exchange. It can usually be withdrawn to the holder’s own key, but only while the exchange is solvent and operating.",
      },
      {
        t: "A CFD on the price",
        d: "A CFD involves no coin at all. Nothing can be withdrawn, sent or spent; the holder has a contract with a provider for the change in a quoted price. It allows a position on a fall as well as a rise and is usually leveraged, with a financing charge for holding.",
      },
      {
        t: "Hours and weekends",
        d: "The network and the crypto exchanges run every hour of every day. Whether a CFD on the price can be traded at weekends, and at what price it reopens if not, depends on the provider.",
      },
    ],
    lifecycle: [
      {
        t: "Halvings",
        d: "The halving happens at a block number, not on a calendar date, so the day can only be estimated until it is close. Miners’ income in coins falls by half at that block, and less efficient miners may switch off until the difficulty adjusts.",
      },
      {
        t: "Forks",
        d: "A change to the rules that not everyone adopts splits the record in two, and holders at that moment have coins on both. This happened in August 2017, when a group favouring larger blocks created a separate coin. A holder of the coin itself received the new coin; what a derivative holder receives is decided by the provider.",
      },
      {
        t: "Upgrades",
        d: "Changes to Bitcoin are rare and slow, and need broad agreement among those who run the software. The two most significant in recent years took effect in 2017 and in 2021. Proposals are published and debated openly as Bitcoin Improvement Proposals.",
      },
      {
        t: "Exchange outages",
        d: "Exchanges have gone offline or suspended withdrawals during the most violent moves, when traffic is heaviest. For that period the price on the affected venue is missing or unreliable, and prices elsewhere can diverge from it.",
      },
    ],
    watch: [
      "The next halving, by block height",
      "The difficulty adjustment every 2,016 blocks",
      "Daily flow figures published for the listed Bitcoin funds",
      "The Federal Open Market Committee’s scheduled rate decisions",
      "Monthly and quarterly expiry of Bitcoin futures and options",
      "Weekends and public holidays, when order books are thinner",
    ],
    sources: [
      "Satoshi Nakamoto: “Bitcoin: A Peer-to-Peer Electronic Cash System” (2008)",
      "Bitcoin Core project: release notes and documentation",
      "Bitcoin Improvement Proposals (BIPs) repository",
      "CME Group: contract specifications for Bitcoin futures and the methodology of the CME CF Bitcoin Reference Rate",
    ],
  },

  "eth-usd": {
    character:
      "Ethereum is a network for running programs, called smart contracts, and ether is the coin used to pay for running them. Where Bitcoin records balances, Ethereum hosts applications: lending, exchanges, tokens issued by others, and further networks built on top of it. It has no cap on supply, and since September 2022 it has been secured by staked coins instead of mining.",
    drivers: [
      {
        t: "Demand to use the network",
        d: "Every transaction pays a fee in ether, and the fee rises when more people want to transact than a block can hold. Activity in the applications built on the network therefore creates demand for the coin. When activity moves elsewhere or falls, that demand falls with it.",
      },
      {
        t: "Bitcoin and the wider market",
        d: "On most days ether moves in the same direction as Bitcoin, and usually by more. The ratio between the two is followed as a measure of whether investors currently favour the largest asset or the rest. News specific to Ethereum shows in that ratio more clearly than in the dollar price.",
      },
      {
        t: "Issuance and burning",
        d: "New ether is issued to those who secure the network, and part of every transaction fee is destroyed. When the network is busy, more is destroyed than issued and the supply shrinks; when it is quiet, the supply grows. The net figure is a result of activity, not a fixed schedule.",
      },
      {
        t: "Staking",
        d: "Holders can lock ether to help validate transactions and earn newly issued coins for it. Staked coins cannot be sold instantly, since leaving takes time, which affects how much is readily available to trade. The reward rate falls as more is staked.",
      },
      {
        t: "Networks built on top",
        d: "Much activity has moved to secondary networks that process transactions cheaply and record a summary on Ethereum. An upgrade in March 2024 made that record much cheaper to post. The effect on demand for ether is debated: more use of the system as a whole, and lower fees paid on the main network.",
      },
      {
        t: "Listed funds",
        d: "Exchange-traded products holding ether began trading in the United States in July 2024. Their daily inflows and outflows are published and are read as a measure of demand from conventional investors.",
      },
    ],
    mechanics: [
      {
        t: "Proof of stake",
        d: "Since the change known as the Merge in September 2022, blocks are proposed and approved by validators who have put up ether as a stake. A validator that breaks the rules can have part of its stake destroyed. The change ended mining on Ethereum and cut the network’s electricity use to a small fraction of what it had been.",
      },
      {
        t: "Gas",
        d: "The work a transaction asks of the network is measured in units of gas, and the fee is the gas used multiplied by a price that rises and falls with demand. A simple transfer needs little gas and a complex contract call needs much more. The fee is paid whether or not the transaction achieves what its sender intended.",
      },
      {
        t: "The base fee is burned",
        d: "Since an upgrade in August 2021, the main part of each fee, the base fee, is destroyed, and only a tip goes to the validator. This is the mechanism that can make the supply fall.",
      },
      {
        t: "Ether and tokens",
        d: "Thousands of other tokens exist on the Ethereum network, including most of the large dollar-linked stablecoins. They are not ether, and their prices are separate. Ether is the only asset that can pay the network’s fees.",
      },
    ],
    versus: [
      {
        t: "Holding ether yourself",
        d: "A holder with the private key can transfer ether, stake it, and use it in applications on the network. The holder also bears the risks of doing so: a lost key, a mistaken address, or a flawed contract that cannot be undone.",
      },
      {
        t: "Staking rewards",
        d: "Staked ether earns newly issued coins. A CFD on the price earns none: it follows the price alone, and a long position usually pays a financing charge where the staked coin would have received a reward.",
      },
      {
        t: "A CFD on the price",
        d: "A CFD cannot be sent to an address, used to pay gas or placed in a contract. It is a claim on a provider for the change in a quoted price, usually with leverage, and it carries the provider as counterparty.",
      },
    ],
    lifecycle: [
      {
        t: "Scheduled upgrades",
        d: "Ethereum changes more often than Bitcoin, through named upgrades agreed by its developers in public calls and activated at a set point. Besides those of 2021, 2022 and March 2024, an upgrade in April 2023 first allowed staked ether to be withdrawn. Dates are proposed, tested and sometimes postponed.",
      },
      {
        t: "The 2016 fork",
        d: "In 2016, after funds were drained from a large contract known as The DAO, most participants adopted a change that returned them. Those who refused carried on with the unaltered record, which continues as Ethereum Classic, a separate coin. It is the standard example of a network splitting over a matter of principle.",
      },
      {
        t: "Contract failures",
        d: "Applications on the network are written by independent developers, and flaws in them have led to large losses. The price of ether can fall on such news although the network itself has worked as designed.",
      },
      {
        t: "Congestion",
        d: "At moments of extreme demand, fees have risen to many times their usual level and transactions offering too little have waited. Moving ether to or from an exchange then becomes slow and costly, and prices between venues can separate.",
      },
    ],
    watch: [
      "Named network upgrades, as scheduled by the core developers",
      "The Ethereum core developers’ regular public calls",
      "Daily flow figures published for the listed ether funds",
      "The amount of ether staked and the queue to enter or leave staking",
      "Monthly and quarterly expiry of ether futures and options",
      "Weekends, when liquidity is thinner",
    ],
    sources: [
      "ethereum.org: developer documentation and upgrade history",
      "Ethereum Improvement Proposals (EIPs), including EIP-1559 on the fee market and EIP-4844",
      "Ethereum Foundation: blog announcements of network upgrades",
      "Ethereum consensus-layer and execution-layer specifications (public repositories)",
    ],
  },

  "ltc-usd": {
    character:
      "Litecoin is one of the oldest alternatives to Bitcoin, launched in 2011 from Bitcoin’s own code with a few numbers changed: blocks four times as frequent, four times as many coins, and a different mining algorithm. It is a payments coin with no smart-contract platform behind it. It has seldom led the market, and it trades with less depth than Bitcoin or ether.",
    drivers: [
      {
        t: "Bitcoin",
        d: "Litecoin has followed Bitcoin’s direction for most of its history, usually with larger percentage moves. There is little news specific to Litecoin on a typical day, so the wider market accounts for most of its movement.",
      },
      {
        t: "Its own halving",
        d: "Litecoin’s block reward halves on its own four-year schedule, which does not coincide with Bitcoin’s. Halvings took place in 2015, 2019 and 2023. The price has sometimes risen in the months before a halving and fallen back around the event itself, a pattern too short to rely on.",
      },
      {
        t: "Availability on exchanges and payment services",
        d: "Being listed, or removed, by exchanges and payment processors changes how easily the coin can be bought and used. After an optional confidentiality feature was added in 2022, some exchanges reviewed their support for it.",
      },
      {
        t: "Thin order books",
        d: "Fewer buyers and sellers are present at any moment than in the two largest assets. An order of a given size moves the price further, and spreads widen more at quiet times.",
      },
    ],
    mechanics: [
      {
        t: "Proof of work, with a different algorithm",
        d: "Litecoin is mined, like Bitcoin, but uses an algorithm called Scrypt in place of Bitcoin’s. The machines that mine one cannot mine the other. Since 2014 the same machines have been able to mine Litecoin and Dogecoin together, so miners’ income depends on both.",
      },
      {
        t: "Faster blocks, larger cap",
        d: "Blocks arrive about every two and a half minutes against Bitcoin’s ten, and the cap is eighty-four million coins against twenty-one million. The reward halves every 840,000 blocks. The proportions are Bitcoin’s multiplied by four.",
      },
      {
        t: "Confirmation time",
        d: "A transfer appears in a block sooner than on Bitcoin, but each block represents less work, so the number of confirmations required by an exchange before crediting a deposit is higher. The practical saving in time is smaller than the block interval suggests.",
      },
      {
        t: "A proving ground",
        d: "Because its code is so close to Bitcoin’s, changes proposed for Bitcoin have sometimes been activated on Litecoin first, as with the upgrade both adopted in 2017. This is part of its history more than a present-day driver.",
      },
    ],
    versus: [
      {
        t: "Holding the coin yourself",
        d: "A holder with the private key can send Litecoin to anyone at low cost and can use its optional confidentiality feature. Safekeeping of the key is the holder’s responsibility alone.",
      },
      {
        t: "A CFD on the price",
        d: "A CFD involves no coin and cannot be used to pay anyone. It gives exposure to the change in a quoted price, in either direction, through a contract with a provider.",
      },
      {
        t: "Liquidity and cost",
        d: "In a thinner market the gap between buying and selling prices is a larger share of the price than for Bitcoin, on an exchange and in any product derived from it. That cost is paid on entry and exit whatever the price then does.",
      },
    ],
    lifecycle: [
      {
        t: "Halvings",
        d: "As with Bitcoin, the halving occurs at a block number and its date is an estimate until near the time. Miners’ income in coins halves at that block.",
      },
      {
        t: "Upgrades",
        d: "The most significant recent change was the activation in 2022 of extension blocks that allow amounts to be hidden in optional transactions. Proposals are published as Litecoin Improvement Proposals.",
      },
      {
        t: "Delistings",
        d: "An exchange can stop offering a coin. Holders there are given a period to sell or withdraw, and trading volume concentrates on the venues that remain. The price on a venue in its last days of listing can differ from the price elsewhere.",
      },
      {
        t: "Exchange outages",
        d: "When a major exchange is offline, a coin with few alternative venues is affected more than one with many. Quoted prices in such periods rest on less trading than usual.",
      },
    ],
    watch: [
      "The next Litecoin halving, by block height",
      "Bitcoin’s direction and its own halving cycle",
      "Announcements by exchanges of listings and delistings",
      "Litecoin Core software releases",
      "Weekends, when an already thin market is thinner",
    ],
    sources: [
      "Litecoin Core project: documentation and release notes",
      "Litecoin Improvement Proposals (LIPs) repository",
      "Litecoin Foundation: announcements",
    ],
  },

  "xrp-usd": {
    character:
      "XRP is the coin of the XRP Ledger, a network built for fast, cheap payments and for exchanging one currency into another. It is not mined: the whole supply was created when the ledger began in 2012, and a large part was given to a company, Ripple, which has released it gradually since. Its history has been tied to that company and to a lawsuit, more than to changes in the network.",
    drivers: [
      {
        t: "Legal proceedings",
        d: "In December 2020 the United States Securities and Exchange Commission brought a civil action against Ripple and two of its executives concerning sales of XRP. Several exchanges suspended trading in the coin for a period afterwards. For years the coin moved more on filings and rulings in that case than on anything else; the court record is public.",
      },
      {
        t: "The company’s holdings and sales",
        d: "Ripple placed most of its XRP in escrow on the ledger in 2017, with a set amount released each month and the unused part returned to escrow. The company publishes reports on its holdings and sales. The amount reaching the market is therefore visible, and is watched.",
      },
      {
        t: "Adoption for payments",
        d: "Announcements that banks or payment firms will use the ledger, or the company’s software, have moved the price. Using the company’s software does not always mean using the coin, a distinction the announcements do not always make clear.",
      },
      {
        t: "The wider crypto market",
        d: "XRP generally rises and falls with Bitcoin, though it has had long periods of moving on its own news. It is widely held by individual investors and is among the most heavily traded coins on exchanges in parts of Asia.",
      },
      {
        t: "Exchange listings",
        d: "The suspensions that followed the 2020 lawsuit, and the later resumptions, showed how much the price depends on where the coin can be traded. A relisting on a large exchange widens the pool of buyers within a day.",
      },
    ],
    mechanics: [
      {
        t: "Agreement without mining or staking",
        d: "The ledger uses its own consensus protocol. A set of independent servers called validators vote on which transactions to include, and each server chooses a list of validators it trusts. A new version of the ledger is agreed every few seconds, and validators are not paid for the work.",
      },
      {
        t: "A fixed supply that slowly shrinks",
        d: "One hundred billion XRP were created at the start and no more can be made. Each transaction destroys a very small fee, so the total falls slightly over time. There are no block rewards and no halvings.",
      },
      {
        t: "Reserves and tags",
        d: "An address on the ledger must keep a small minimum balance, which cannot be spent while the address is in use. Deposits to exchanges usually need a destination tag as well as an address, and leaving it out is a common cause of lost or delayed funds.",
      },
      {
        t: "More than a coin ledger",
        d: "The ledger has a built-in exchange and can hold tokens issued by others, including tokens that stand for ordinary currencies. XRP is its native asset and the one in which fees are paid.",
      },
    ],
    versus: [
      {
        t: "Holding the coin yourself",
        d: "A holder with the key can send XRP in seconds for a negligible fee, and must keep the minimum reserve in the address. As with any coin, the key is the whole of the holder’s control.",
      },
      {
        t: "A CFD on the price",
        d: "A CFD gives no coin and no use of the ledger. It is a contract with a provider on the change in a quoted price, usually leveraged and usually with a financing charge.",
      },
      {
        t: "News risk",
        d: "Because court decisions and regulatory announcements have arrived at unscheduled times and produced very large moves in minutes, a leveraged position in this coin has been exposed to gaps more than most. An owner of coins outright sees the same move but cannot be closed out by it.",
      },
    ],
    lifecycle: [
      {
        t: "Amendments",
        d: "Changes to the ledger are proposed as amendments and take effect only after a large majority of trusted validators has supported them continuously for two weeks. The list of amendments and their status is public.",
      },
      {
        t: "Monthly escrow releases",
        d: "XRP is released from the company’s escrow on a monthly schedule, and what is not used is locked again. The release is visible on the ledger itself.",
      },
      {
        t: "Suspensions and relistings",
        d: "The period after December 2020 is the reference case: trading was suspended on a number of venues in one country while it continued elsewhere, and prices and volumes shifted between them.",
      },
      {
        t: "Court timetables",
        d: "Hearings and filing deadlines in public litigation are scheduled; rulings are not. Anyone following the coin in those years was following two calendars, the market’s and the court’s.",
      },
    ],
    watch: [
      "The monthly release of XRP from escrow",
      "Ripple’s periodic report on its XRP holdings and sales",
      "Amendments to the ledger that are open for validator voting",
      "Scheduled hearings and filing deadlines in any public proceedings concerning the coin or the company",
      "Announcements by exchanges of listings, suspensions and relistings",
    ],
    sources: [
      "XRP Ledger documentation (xrpl.org), including the consensus protocol and reserves",
      "XRP Ledger: the list of known amendments",
      "Ripple: XRP Markets Report",
      "United States District Court for the Southern District of New York: public docket in Securities and Exchange Commission v. Ripple Labs, Inc.",
    ],
  },

  "sol-usd": {
    character:
      "Solana is a smart-contract network built for speed: it produces a block in a fraction of a second and charges very small fees. That has made it a home for applications with heavy traffic, from token trading to payments. The cost of the design is demanding hardware for those who run it and a history of outages in which the whole network stopped.",
    drivers: [
      {
        t: "Activity on the network",
        d: "Fees, new tokens and trading on Solana’s own exchanges rise and fall in waves, some of them driven by speculation in short-lived tokens. Periods of heavy use have coincided with rises in the coin, and the reverse. The link is to enthusiasm as much as to lasting use.",
      },
      {
        t: "Ether and Bitcoin",
        d: "Solana competes with Ethereum for developers and users, and its price is often compared with ether’s as well as with the dollar. It moves with the wider crypto market on most days, and by more than either of the two largest assets.",
      },
      {
        t: "Reliability",
        d: "The network has halted several times, for hours on each occasion, including in September 2021 and in February 2024. During a halt no transaction can be made. News of an outage has weighed on the price, and long periods without one have been cited in its favour.",
      },
      {
        t: "Concentrated holders",
        d: "A large exchange that failed in November 2022, and the trading firm linked to it, were among the biggest holders and backers of Solana. The coin fell far more than the market at the time, and coins held by the insolvent estate were sold over the following years. It is an example of how the ownership of a coin can matter as much as its technology.",
      },
      {
        t: "Staking and issuance",
        d: "New coins are issued continuously to those who stake, on a schedule in which the rate of issue declines each year towards a long-run level. A large part of the supply is staked. Proposals to change the schedule are put to a vote of validators from time to time.",
      },
    ],
    mechanics: [
      {
        t: "Proof of stake with a built-in clock",
        d: "Validators are chosen to produce blocks in proportion to the coins staked with them. Solana adds a mechanism it calls proof of history, a cryptographic sequence that fixes the order of events so that validators need not exchange as many messages. It orders transactions; the staking is what secures them.",
      },
      {
        t: "No cap on supply",
        d: "There is no maximum number of coins. Issuance to stakers adds to the supply, and part of every transaction fee is destroyed, which offsets a little of it.",
      },
      {
        t: "Delegation",
        d: "A holder need not run a validator: coins can be delegated to one and still earn a share of the rewards. Withdrawing a stake takes effect at the end of a period called an epoch, which lasts about two days, so staked coins cannot be sold at once.",
      },
      {
        t: "Validator software",
        d: "For most of its history nearly every validator ran the same software, so a single fault could stop the whole network. Independent implementations have been developed to reduce that risk. The hardware needed to run a validator is considerably more powerful than for Bitcoin or Ethereum.",
      },
    ],
    versus: [
      {
        t: "Holding the coin yourself",
        d: "A holder with the key can transfer SOL, stake it for rewards and use applications on the network. During a network halt the holder can do none of these until it restarts.",
      },
      {
        t: "A CFD on the price",
        d: "A CFD involves no coin, earns no staking reward and cannot be used on the network. It is a claim on a provider for the change in a quoted price, usually with leverage and a financing charge.",
      },
      {
        t: "When the network stops",
        d: "In an outage the coins on exchanges can still be traded on the exchanges’ own books, though deposits and withdrawals are frozen. Prices then cannot be evened out between venues, and a price quoted in that period reflects one venue more than a market.",
      },
    ],
    lifecycle: [
      {
        t: "Outages and restarts",
        d: "After a halt, validators agree on the last valid state and restart the network together, which has taken hours. The network’s operators publish a report on the cause afterwards.",
      },
      {
        t: "Software upgrades",
        d: "New versions of the validator software are released frequently and adopted in stages. Changes to the rules are proposed as Solana Improvement Documents, and the larger ones are put to a validator vote.",
      },
      {
        t: "Token unlocks and estate sales",
        d: "Coins sold to early investors, or held by an insolvent estate, become transferable on set dates. The dates are generally known in advance, and the amounts involved have at times been large in relation to normal trading.",
      },
      {
        t: "Epoch boundaries",
        d: "Staking rewards are paid and changes of stake take effect at the end of each epoch. A holder who decides to unstake waits until then before the coins can move.",
      },
    ],
    watch: [
      "Releases of the validator software and the upgrade schedule",
      "Votes by validators on Solana Improvement Documents",
      "Scheduled unlocks of coins held by early investors or insolvent estates",
      "The network’s published status and incident reports",
      "Weekends, when liquidity is thinner and moves are larger",
    ],
    sources: [
      "Solana documentation (solana.com), including staking, inflation and transaction fees",
      "Anatoly Yakovenko: “Solana: A new architecture for a high performance blockchain” (white paper)",
      "Solana Improvement Documents (SIMDs) repository",
      "Solana Foundation: network outage and incident reports",
    ],
  },
};
