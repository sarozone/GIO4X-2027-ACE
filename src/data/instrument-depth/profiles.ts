/**
 * INSTRUMENT PROFILES: the short card of facts at the head of the research on
 * each of the six index pages and the five crypto-asset pages.
 *
 * The "In depth" sections (indices.ts, crypto.ts) explain; this file states.
 * A profile answers the questions a newcomer asks first, in a line or two
 * each, and leaves the reasoning to the sections that follow it on the page.
 * It adds two things those sections do not have: one worked illustration of
 * how an index is weighted, with two invented companies, and for a
 * crypto-asset its particular risks gathered in one list.
 *
 * Durable facts only: no level, price, market value, weight, ranking, yield
 * or forecast, nothing about GIO4X's own contract, and nothing that is advice.
 */
import type { DepthPoint } from "./types";

export type IndexProfile = {
  kind: "index";
  /** which of the two weighting methods the index uses: decides which half of the illustration is "this index" */
  method: "price" | "value";
  rows: readonly DepthPoint[];
};

export type CryptoProfile = {
  kind: "crypto";
  rows: readonly DepthPoint[];
  /** what a CFD on this asset leaves out that the coin itself has, beyond the coin */
  cfdLacks: string;
  /** the risks particular to this asset, most characteristic first */
  risks: readonly string[];
};

export type InstrumentProfile = IndexProfile | CryptoProfile;

/**
 * Two invented companies, weighted both ways. A has the dearer share and is
 * the smaller company; B has the cheaper share and is the larger. The figures
 * are chosen so that each method gives one of them three-quarters of the index.
 */
export const WEIGHTING_EXAMPLE = {
  companies: [
    { name: "Company A", price: "300", shares: "10 million", value: "3 billion", byPrice: "three-quarters", byValue: "one quarter" },
    { name: "Company B", price: "100", shares: "90 million", value: "9 billion", byPrice: "one quarter", byValue: "three-quarters" },
  ],
  price:
    "A price-weighted index adds the two share prices, 400, and divides by a fixed number. Company A supplies 300 of the 400, so it is three-quarters of the index, although it is the smaller company. If A’s shares rise by a tenth and B’s stand still, the index rises by 7.5%; if B’s rise by a tenth and A’s stand still, by 2.5%.",
  value:
    "An index weighted by market value adds the two market values, 12 billion. Company B supplies 9 of the 12, so it is three-quarters of the index, although its share is the cheaper. If B’s shares rise by a tenth and A’s stand still, the index rises by 7.5%; if A’s rise by a tenth and B’s stand still, by 2.5%.",
  moral: "The same two companies and the same day’s prices give two different indices. Neither is wrong; they answer different questions. In practice only the shares available to the public are counted in the market value, and a real index has many more members.",
} as const;

/** The two ways an index treats dividends, once, for all six. */
export const PRICE_OR_TOTAL_RETURN =
  "A price index follows share prices alone, so it falls when a member’s shares begin trading without their dividend. A total-return index treats each dividend as reinvested, so over time it rises by more than the price index of the same shares. The two are the same companies and the same weights; only the treatment of dividends differs.";

/** The two ways a network agrees on its record, in plain words, once, for all five. */
export const CONSENSUS_PLAIN = {
  work: "Proof of work: computers compete to solve a puzzle that takes real electricity to attempt. The winner adds the next block of transactions. Rewriting the record would mean redoing that work faster than everyone else together.",
  stake: "Proof of stake: holders lock up coins as a deposit and take turns proposing and approving blocks. A participant who breaks the rules can lose part of the deposit. The cost of cheating is the coins at risk, not electricity.",
} as const;

/** True of every coin here: where the coin is, and what a CFD on its price is. */
export const CUSTODY_AND_CFD = {
  custody: "A coin is controlled by whoever holds its private key. Held yourself, there is no intermediary to fail and no one to restore a lost key. Left with an exchange, it is a claim on that exchange.",
  cfdGives: "Exposure to the change in a quoted price, upwards or downwards, usually with leverage, through a contract with a provider.",
  cfdLacks: "Any coin. Nothing can be withdrawn, sent, spent or used on the network, and the provider is the counterparty.",
} as const;

export const INSTRUMENT_PROFILES: Readonly<Record<string, InstrumentProfile>> = {
  /* ---- indices ------------------------------------------------------------- */
  us30: {
    kind: "index",
    method: "price",
    rows: [
      { t: "What it contains", d: "Thirty large United States companies, each listed on the New York Stock Exchange or on Nasdaq." },
      { t: "How members are chosen", d: "By a committee, with no numerical rule for entry. Transport and utility companies are left to averages of their own." },
      { t: "How it is weighted", d: "By share price. The size of a company plays no part." },
      { t: "Who maintains it", d: "S&P Dow Jones Indices." },
      { t: "Price or total return", d: "The figure quoted is a price index: dividends are left out. A total-return version is published separately." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated while the New York exchanges are open. The future is a quarterly contract traded in Chicago for most of the day and night. A CFD is a contract with a provider on a price taken from one or the other." },
    ],
  },
  us500: {
    kind: "index",
    method: "value",
    rows: [
      { t: "What it contains", d: "About five hundred large United States companies listed on the main American exchanges. A few have two classes of share in the index, so it has slightly more lines than companies." },
      { t: "How members are chosen", d: "By a committee, from companies that meet published conditions on size, shares in public hands, trading and earnings." },
      { t: "How it is weighted", d: "By the market value of the shares available to the public." },
      { t: "Who maintains it", d: "S&P Dow Jones Indices." },
      { t: "Price or total return", d: "The figure quoted is a price index: dividends are left out. Total-return versions are published separately." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated while the New York exchanges are open. The future is a quarterly contract traded in Chicago for most of the day and night, and is the price seen when the exchanges are shut. A CFD is a contract with a provider on a price taken from one or the other." },
    ],
  },
  us100: {
    kind: "index",
    method: "value",
    rows: [
      { t: "What it contains", d: "The hundred largest companies listed on the Nasdaq exchange, financial companies excluded. They need not be American." },
      { t: "How members are chosen", d: "By published rules, with little discretion: rank by market value among the eligible Nasdaq listings, reviewed once a year." },
      { t: "How it is weighted", d: "By market value, then adjusted by limits on how much the largest members may hold." },
      { t: "Who maintains it", d: "Nasdaq." },
      { t: "Price or total return", d: "The figure quoted is a price index: dividends are left out. A total-return version is published separately." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated during Nasdaq’s trading hours. The future is a quarterly contract traded in Chicago for most of the day and night. A CFD is a contract with a provider on a price taken from one or the other." },
    ],
  },
  uk100: {
    kind: "index",
    method: "value",
    rows: [
      { t: "What it contains", d: "The hundred largest companies listed on the London Stock Exchange." },
      { t: "How members are chosen", d: "By rule: rank by market value at a quarterly review, with a margin on either side of the hundredth place so that companies near it do not move in and out each time." },
      { t: "How it is weighted", d: "By the market value of the shares available to the public." },
      { t: "Who maintains it", d: "FTSE Russell, part of the London Stock Exchange Group." },
      { t: "Price or total return", d: "The figure quoted is a price index, in sterling: dividends are left out. For an index whose members pay as much as these, the gap to the total-return version is wide." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated during London trading hours. The future is a quarterly contract on a London derivatives exchange that trades for longer hours. A CFD is a contract with a provider on a price taken from one or the other." },
    ],
  },
  de40: {
    kind: "index",
    method: "value",
    rows: [
      { t: "What it contains", d: "Forty large companies listed on the Frankfurt Stock Exchange, priced on Xetra, its electronic market." },
      { t: "How members are chosen", d: "By rule: rank by the market value of shares in public hands, among companies that meet conditions on profitability and on publishing their accounts on time." },
      { t: "How it is weighted", d: "By the market value of the shares available to the public, with a cap on any one member." },
      { t: "Who maintains it", d: "STOXX, the index provider in the Deutsche Börse group." },
      { t: "Price or total return", d: "The exception among the six: the figure quoted is a total-return index, which its provider calls a performance index. A price version is published separately and rises by less." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated from Xetra prices during Frankfurt trading hours. The future is a quarterly contract on a Frankfurt derivatives exchange that trades for longer hours. A CFD is a contract with a provider on a price taken from one or the other." },
    ],
  },
  jp225: {
    kind: "index",
    method: "price",
    rows: [
      { t: "What it contains", d: "225 companies listed on the Prime Market of the Tokyo Stock Exchange." },
      { t: "How members are chosen", d: "By the index provider, for how readily the shares trade and for a balance across sectors." },
      { t: "How it is weighted", d: "By share price, each price first scaled by an adjustment factor. Market value is not used." },
      { t: "Who maintains it", d: "Nikkei Inc., the publisher of Japan’s main financial newspaper, not the exchange." },
      { t: "Price or total return", d: "The figure quoted is a price index, in yen: dividends are left out. A total-return version is published separately." },
      { t: "Cash index, future and CFD", d: "The cash index is calculated during Tokyo trading hours, with a pause at midday. Futures are listed in Osaka, Singapore and Chicago, so one of them is trading for most of the day. A CFD is a contract with a provider on a price usually taken from the futures." },
    ],
  },

  /* ---- crypto-assets ------------------------------------------------------- */
  "btc-usd": {
    kind: "crypto",
    rows: [
      { t: "What the network is for", d: "Keeping a shared record of who holds how much, so that value can be sent from one holder to another without a bank or any central operator. It does that one job." },
      { t: "How new units are issued", d: "As a reward to whoever adds each block of transactions. The reward is cut in half at fixed intervals, counted in blocks." },
      { t: "Is the supply capped?", d: "Yes. The software fixes a total of twenty-one million coins." },
      { t: "How transactions are confirmed", d: "By proof of work." },
    ],
    cfdLacks: "A fork of the network gives the holder of a coin the new coin as well; what a CFD holder receives is the provider’s decision.",
    risks: [
      "Its price has at times moved further in a day than the major currencies or share indices usually move in a month, and it trades at every hour, weekends included.",
      "Much trading is done with borrowed money. When many leveraged positions are closed by force at once, the move feeds on itself.",
      "The network has kept running; the companies around it have not always. Exchanges and custodians have failed with customers’ coins inside.",
      "For a holder of the coin, a transfer cannot be reversed and a lost key cannot be replaced.",
    ],
  },
  "eth-usd": {
    kind: "crypto",
    rows: [
      { t: "What the network is for", d: "Running programs, called smart contracts, that anyone can publish and use: lending, exchanges, tokens issued by others. Ether is the coin that pays for running them." },
      { t: "How new units are issued", d: "To the validators who secure the network. Against that, part of every transaction fee is destroyed." },
      { t: "Is the supply capped?", d: "No. The total rises when the network is quiet and can fall when it is busy." },
      { t: "How transactions are confirmed", d: "By proof of stake. It used proof of work until 2022." },
    ],
    cfdLacks: "Ether that is staked earns newly issued coins. A CFD earns none, and a position held overnight usually pays a financing charge instead.",
    risks: [
      "The applications on the network are written by independent developers. Flaws in them have caused large losses, and the price has fallen on such news though the network worked as designed.",
      "The rules of the network are changed by scheduled upgrades more often than Bitcoin’s. Each is a change to working software.",
      "At moments of heavy demand the fee for a transaction has risen to many times its usual level, and moving coins between venues has become slow.",
      "It usually moves with Bitcoin, and by more.",
    ],
  },
  "ltc-usd": {
    kind: "crypto",
    rows: [
      { t: "What the network is for", d: "Payments from one holder to another. It was made from Bitcoin’s code with a few numbers changed, and has no smart-contract platform." },
      { t: "How new units are issued", d: "As a reward to whoever adds each block, cut in half at fixed intervals, on a schedule of its own." },
      { t: "Is the supply capped?", d: "Yes. The software fixes a total of eighty-four million coins, four times Bitcoin’s." },
      { t: "How transactions are confirmed", d: "By proof of work, with a different algorithm from Bitcoin’s, so the two are mined on different machines." },
    ],
    cfdLacks: "A CFD cannot be used to pay anyone, which is the one thing the coin is for.",
    risks: [
      "Fewer buyers and sellers are present than in the two largest assets. An order of a given size moves the price further, and the gap between buying and selling prices is wider.",
      "On most days its direction is Bitcoin’s, with larger percentage moves; it has little news of its own.",
      "An exchange can stop offering it. Trading then concentrates on the venues that remain, and a coin with few venues is hit harder when one of them is offline.",
    ],
  },
  "xrp-usd": {
    kind: "crypto",
    rows: [
      { t: "What the network is for", d: "Fast, cheap payments and the exchange of one currency into another, on a ledger called the XRP Ledger." },
      { t: "How new units are issued", d: "None are. The whole supply was created when the ledger began, and a large part was given to one company, Ripple, which has released it gradually from escrow." },
      { t: "Is the supply capped?", d: "Yes: it was fixed at the start at one hundred billion and shrinks very slowly, because each transaction destroys a small fee." },
      { t: "How transactions are confirmed", d: "By neither proof of work nor proof of stake. A set of independent servers, called validators, vote on each new version of the ledger every few seconds, and are not paid for it." },
    ],
    cfdLacks: "A CFD gives no use of the ledger: nothing can be sent across it.",
    risks: [
      "Its history has been tied to one company and to proceedings in the United States courts. Rulings and announcements have arrived unscheduled and moved the price a long way in minutes, which is the kind of move that closes leveraged positions.",
      "A large part of the supply is held by that one company. How much it releases is public, and is a matter for the company.",
      "Exchanges have suspended trading in it in one country while it continued in others, and prices shifted between them.",
    ],
  },
  "sol-usd": {
    kind: "crypto",
    rows: [
      { t: "What the network is for", d: "Running smart contracts at high speed and very low fees, for applications with heavy traffic such as token trading and payments." },
      { t: "How new units are issued", d: "Continuously, to those who stake their coins, at a rate that is set to decline each year towards a long-run level. Part of every transaction fee is destroyed." },
      { t: "Is the supply capped?", d: "No. There is no maximum number of coins." },
      { t: "How transactions are confirmed", d: "By proof of stake, with an added mechanism, called proof of history, that fixes the order of transactions." },
    ],
    cfdLacks: "Coins that are staked earn rewards. A CFD earns none.",
    risks: [
      "The whole network has stopped several times, for hours at a time. During a halt no transaction can be made, and prices on different venues cannot be brought back into line.",
      "Large holdings have been concentrated in few hands, and coins held by early investors or by an insolvent estate have come onto the market on set dates.",
      "The software is younger and is changed more often than that of the two largest networks.",
      "It usually moves with the wider crypto market, and by more than either of the two largest assets.",
    ],
  },
};

export const profileFor = (slug: string): InstrumentProfile | undefined => INSTRUMENT_PROFILES[slug];
