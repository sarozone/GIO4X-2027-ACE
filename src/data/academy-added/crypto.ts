import type { AddedLesson } from "./types";

/**
 * Cryptocurrency markets: two lessons written by hand for the module that had
 * only an outline. General education: how the technology and the market work.
 * Nothing here is a price, a forecast or a statement about any provider's own
 * products, and no firm or product is named beyond Bitcoin and Ethereum, the
 * two public networks the module's outline lists.
 *
 * `body` keeps to the tags the carried lessons use: p, strong, h2 (with an
 * id), ul, li, table and its parts, and div.note.
 */
export const cryptoLessons: AddedLesson[] = [
  {
    slug: "how-a-blockchain-works",
    title: "How a blockchain settles a payment",
    description: "What a blockchain is, how a payment on it becomes final, and how Bitcoin, Ethereum and stablecoins differ. The technology, explained without a view on price.",
    level: "Intermediate",
    module: "crypto",
    published: "2026-10-04",
    tags: ["blockchain", "bitcoin", "ethereum", "stablecoins", "cryptocurrency", "settlement"],
    related: ["ac:crypto", "i:btc-usd", "i:eth-usd", "c:volatility", "c:cfd"],
    tools: [],
    body: [
      "<p>A cryptocurrency is not a coin in any physical sense. It is an entry in a shared record, called a blockchain, that says which address holds how much. This lesson explains how that record is kept, how a payment on it becomes final, and how Bitcoin, Ethereum and stablecoins differ. It describes the technology; it says nothing about what any of them is worth.</p>",
      '<h2 id="a-ledger-with-no-keeper">A ledger with no keeper</h2>',
      "<p>A bank keeps a ledger of its customers’ balances, and the bank alone can change it. A blockchain is a ledger that thousands of computers, called nodes, each hold a full copy of. No single one of them is in charge. New transactions are gathered into a block, and each block carries a short digital fingerprint of the block before it. Altering an old entry would change that fingerprint and every one after it, so the other copies would reject the altered chain.</p>",
      "<p>The rules for who may add the next block are called the consensus mechanism. They are what replaces the bank’s authority.</p>",
      '<h2 id="how-a-payment-settles">How a payment settles</h2>',
      "<p>A holder controls coins through a private key: a long secret number. A payment passes through four stages.</p>",
      "<ul><li><strong>Signed.</strong> The sender’s software signs the transaction with the private key. The signature proves the holder approved it without revealing the key.</li><li><strong>Broadcast.</strong> The transaction is sent to the network, where it waits with others that have not yet been included.</li><li><strong>Included in a block.</strong> Whoever adds the next block chooses waiting transactions, usually those offering the higher fee, and the block joins the chain.</li><li><strong>Confirmed.</strong> Each later block built on top is one more confirmation. The deeper a transaction lies, the harder it is to undo.</li></ul>",
      "<p>Settlement here is a matter of degree, not a single moment. Recipients commonly wait for several confirmations before treating a payment as final. Once it is final there is no bank to reverse it: a payment sent to the wrong address stays sent. The fee goes to whoever adds the block, and it rises when the network is busy.</p>",
      '<h2 id="bitcoin">Bitcoin</h2>',
      "<p>Bitcoin was described in a paper published in 2008 under the name Satoshi Nakamoto, and its network began running in January 2009. It uses proof of work: computers called miners compete to solve a costly puzzle, and the winner adds the next block. The rules aim for a new block about every ten minutes on average, and they cap the supply at 21 million coins. Bitcoin’s ledger does one thing, which is to record transfers of bitcoin.</p>",
      '<h2 id="ethereum">Ethereum</h2>',
      "<p>Ethereum launched in 2015. Its ledger records balances of its own coin, ether, and it also runs programs called smart contracts: code stored on the chain that moves coins when its conditions are met. Since September 2022 Ethereum has used proof of stake: validators lock up ether as a stake, are chosen to propose blocks, and can lose part of the stake for breaking the rules. A block is added about every twelve seconds, and ether has no fixed cap on supply.</p>",
      "<table><thead><tr><th></th><th>Bitcoin</th><th>Ethereum</th></tr></thead><tbody><tr><td><strong>Network began</strong></td><td>January 2009</td><td>2015</td></tr><tr><td><strong>Blocks are added by</strong></td><td>Proof of work</td><td>Proof of stake, since September 2022</td></tr><tr><td><strong>A new block</strong></td><td>About every ten minutes</td><td>About every twelve seconds</td></tr><tr><td><strong>Supply</strong></td><td>Capped at 21 million coins</td><td>No fixed cap</td></tr><tr><td><strong>The ledger records</strong></td><td>Transfers of bitcoin</td><td>Transfers of ether, and smart contracts</td></tr></tbody></table>",
      '<h2 id="stablecoins">Stablecoins</h2>',
      "<p>A stablecoin is a token on a blockchain that is designed to hold a fixed value, usually one US dollar. Most are issued by a company that says it holds reserves, such as cash and short-term government debt, equal to the tokens in circulation. Others are backed by crypto assets, or by a rule that expands and shrinks the supply.</p>",
      "<p>The fixed value is a promise, not a property of the technology. It depends on the reserves being there and on holders being able to redeem. Stablecoins have traded below their intended value in times of stress, and in May 2022 a large stablecoin that relied on a supply rule instead of reserves lost its peg and collapsed within days.</p>",
      '<h2 id="what-the-chain-does-not-do">What the chain does not do</h2>',
      "<p>A blockchain settles transfers of its own coin. It does not set the coin’s price, which is made wherever buyers and sellers meet, and it does not protect a holder who loses a private key or sends coins to a fraudster.</p>",
      '<div class="note"><p><strong>Risk note:</strong> Final settlement cuts both ways. The feature that stops a payment being reversed by a third party also stops it being reversed after a mistake or a theft.</p></div>',
    ].join("\n"),
  },
  {
    slug: "crypto-custody-weekends-and-venues",
    title: "Crypto markets: custody, weekends and venues",
    description: "Holding a coin against holding a contract on its price, why a market that never closes is thinner at weekends, and why one coin has different prices on different venues.",
    level: "Intermediate",
    module: "crypto",
    published: "2026-10-04",
    tags: ["crypto CFD", "custody", "private key", "weekend liquidity", "crypto exchanges", "arbitrage"],
    related: ["ac:crypto", "c:cfd", "c:liquidity", "c:arbitrage", "c:spread", "c:leverage", "c:volatility"],
    tools: ["leverage-visualizer"],
    body: [
      "<p>There are two quite different ways to have a stake in the price of a cryptocurrency: holding the coin, or holding a contract on its price. They carry different risks. This lesson sets them side by side, then explains two features of the market itself: it never closes, and it has no single price.</p>",
      '<h2 id="holding-the-coin">Holding the coin</h2>',
      "<p>Whoever knows the private key controls the coins. A wallet is software or a device that stores keys; the coins themselves stay on the blockchain. Holding your own key is called self-custody. Nobody else can move the coins, and nobody can restore a key that is lost: there is no reset.</p>",
      "<p>The alternative is to leave the coins with an exchange or another custodian, which holds the keys. The account then shows a claim on that firm, not coins under the holder’s control. If the firm fails, is hacked or freezes withdrawals, the claim is what is at risk.</p>",
      '<h2 id="holding-a-contract-on-the-price">Holding a contract on the price</h2>',
      "<p>A contract for difference (CFD) on a cryptocurrency is an agreement with a provider to exchange the difference in price between the time the contract is opened and the time it is closed. No coin is bought. There is no wallet and no key, and nothing can be sent on a blockchain or spent.</p>",
      "<p>What is held is a claim on the provider, usually opened with leverage. A CFD can be opened to profit from a fall as easily as from a rise, and a position held overnight normally carries a financing charge. Leverage multiplies losses as well as gains, on a price that moves more than most.</p>",
      "<table><thead><tr><th></th><th>Coin, own key</th><th>Coin at an exchange</th><th>CFD</th></tr></thead><tbody><tr><td><strong>What is held</strong></td><td>The coin</td><td>A claim on the exchange</td><td>A contract with the provider</td></tr><tr><td><strong>Who holds the key</strong></td><td>The holder</td><td>The exchange</td><td>Nobody: there is no coin</td></tr><tr><td><strong>Can it be sent on the blockchain?</strong></td><td>Yes</td><td>Only after a withdrawal</td><td>No</td></tr><tr><td><strong>Main risk besides the price</strong></td><td>Losing the key</td><td>The exchange failing</td><td>Leverage, and the provider failing</td></tr></tbody></table>",
      '<h2 id="a-market-that-never-closes">A market that never closes</h2>',
      "<p>A blockchain adds blocks every day of the year, and crypto exchanges trade through nights, weekends and holidays. There is no closing bell and no official closing price.</p>",
      "<p>Open is not the same as busy. At weekends banks are shut, so ordinary money moves to and from exchanges more slowly, and many large trading firms are less active. Fewer orders rest in the order book. Liquidity is thinner, spreads are wider, and an order of the same size moves the price further than it would on a weekday.</p>",
      "<ul><li>A sharp move can happen on a Sunday, when other markets cannot react until they reopen.</li><li>A leveraged position can reach its stop-out level at any hour, including while its holder is asleep.</li><li>A product on the price may keep its own hours and breaks. The provider’s terms say what they are.</li></ul>",
      '<h2 id="why-prices-differ-between-venues">Why prices differ between venues</h2>',
      "<p>A share has a home exchange. A cryptocurrency does not. Each exchange has its own order book, its own buyers and sellers, and so its own last price. At any moment the same coin shows slightly different prices in different places.</p>",
      "<p>Arbitrage keeps the differences small: traders buy where the coin is cheaper and sell where it is dearer. But arbitrage has costs. Moving coins takes time while blocks confirm, fees are paid at each step, and money left on an exchange is exposed to that exchange. In calm conditions the gap is small. Under stress it can widen sharply, and it can persist where money cannot move freely.</p>",
      "<p>Two more things add to the difference. Some venues quote a coin in US dollars and others in a stablecoin, which may itself be trading slightly away from a dollar. And a CFD is priced by its provider from one or more venues, so its quote need not match the screen of any single exchange.</p>",
      '<h2 id="what-follows">What follows</h2>',
      "<p>None of this says whether a cryptocurrency will rise or fall. It says what is held, who is owed, and why the number on one screen is not the number on another.</p>",
      '<div class="note"><p><strong>Risk note:</strong> Cryptocurrency prices are among the most volatile of any market. With leverage, a move that is ordinary for this market can remove the whole margin on a position.</p></div>',
    ].join("\n"),
  },
];
