/**
 * MARKET HISTORY — eleven episodes, one page each.
 *
 * A page says what led up to the episode, what happened in order, what
 * changed afterwards and what it helps a trader today to understand. It never
 * says what to do. The rule this file keeps: a number appears only if it is
 * famous and certain. Where the record is thin or historians disagree, the
 * page says so in words and gives no figure. Sources are named by kind, never
 * as an invented citation, and nothing here is a quotation.
 *
 * `level` is the picture, not the record: a hand-made height from 0 to 100
 * for each dated event, joined into a curve that shows the rise and the fall.
 * It is an illustrative shape, not market data, and is labelled so wherever
 * it is drawn. `start` is where the curve stands before the first event.
 *
 * `documents` names the public documents behind an account: title, author or
 * issuing body, date, and what it supports. One is listed only where its
 * title and date are certain; there are no web addresses, because they change.
 *
 * `junctures` is the "what was knowable then?" exercise: a few moments on the
 * timeline, each with this site's own summary of what had been made public by
 * then (written afterwards; not a contemporary document, and nothing in it is
 * later than the moment), a hypothetical question and three choices. No choice
 * is marked right. Each note says what the choice would have meant and how it
 * could have turned out otherwise. `seat` is the imagined position.
 */
export type SourceDocument = {
  title: string;
  /** the author or the body that issued it */
  by: string;
  date: string;
  /** one line: what in the account it supports */
  supports: string;
};

export type Choice = { label: string; note: string };

export type Juncture = {
  /** index into `events`: the last event that was public at this moment */
  at: number;
  /** what had been made public by then, in this site's words */
  known: string;
  ask: string;
  choices: readonly [Choice, Choice, Choice];
  /** what came next, where the next event's own text would give away more than the next step; `to` is the event the curve then runs to */
  next?: { when: string; text: string; to: number };
};

export type Moment = {
  /** the date as it is shown, short enough for a label */
  when: string;
  /** one or two sentences: what happened */
  text: string;
  /** 0 to 100: the height of the illustrative shape at this event */
  level: number;
};

export type Episode = {
  slug: string;
  /** the short name, as in a list */
  name: string;
  /** the page's heading: the phrase people search for */
  title: string;
  description: string;
  /** where it sits on the four-century line */
  year: number;
  /** the years the page covers, in words */
  span: string;
  place: string;
  /** one sentence for the index */
  line: string;
  /** the opening paragraph */
  is: string;
  /** what the illustrative curve sketches */
  shape: string;
  start: number;
  before: readonly string[];
  events: readonly Moment[];
  after: readonly string[];
  takeaways: readonly string[];
  /** what is disputed, uncertain or easily overstated */
  caution: string;
  /** the kinds of source the account rests on, in words */
  sources: string;
  /** the named public documents the account rests on */
  documents: readonly SourceDocument[];
  /** the imagined position in the exercise, one sentence */
  seat: string;
  /** the moments of the "what was knowable then?" exercise, in order */
  junctures: readonly Juncture[];
  terms: readonly string[];
  faq: readonly { q: string; a: string }[];
};

export const HISTORY: readonly Episode[] = [
  {
    slug: "tulip-mania",
    name: "Tulip mania",
    title: "Tulip mania: what happened in the Dutch tulip trade of the 1630s",
    description: "Tulip mania explained: how a trade in rare tulip bulbs in the Dutch Republic rose through the winter of 1636 to 1637 and stopped in February 1637. The order of events, what is disputed, and what it shows about promises to pay.",
    year: 1637,
    span: "1630s",
    place: "Dutch Republic",
    line: "A winter trade in promises to buy tulip bulbs rises fast and stops in a week.",
    is: "In the winter of 1636 to 1637, contracts for tulip bulbs in the Dutch Republic changed hands at prices that rose week by week. In the first days of February 1637 buyers stopped appearing and the trade halted. It is the most famous early story of a bubble, and also one of the most exaggerated.",
    shape: "the prices agreed in tulip contracts",
    start: 6,
    before: [
      "Tulips reached western Europe from the Ottoman Empire in the sixteenth century. In the Dutch Republic, then one of the richest trading societies in Europe, rare varieties became a luxury that merchants and collectors paid a great deal for. The most prized were “broken” tulips, whose petals carried flames of colour. It is now known that the pattern was caused by a virus, which also made those bulbs weak and slow to multiply, so the finest varieties stayed scarce.",
      "A tulip flowers for a short time in spring and the bulb is lifted in summer. For most of the year it is in the ground. Trade in winter was therefore a trade in promises: a buyer agreed a price now for a bulb to be delivered and paid for after flowering. By the mid-1630s such promises were being made in tavern meetings by people who were not collectors, and a promise could be sold on to someone else before any bulb or money moved.",
    ],
    events: [
      { when: "1593", level: 8, text: "The botanist Carolus Clusius takes up his post at Leiden and plants his tulip collection in the university’s new botanical garden. Dutch tulip growing is usually dated from here." },
      { when: "1620s", level: 18, text: "Rare “broken” varieties become a luxury among wealthy collectors. Semper Augustus, red flames on white, is the most celebrated and almost never for sale." },
      { when: "Mid-1630s", level: 34, text: "People outside the circle of collectors join the trade. Dealing moves into taverns, in contracts for bulbs still in the ground, with payment due the following summer." },
      { when: "Winter 1636–37", level: 78, text: "Contract prices rise steeply from late 1636, for common varieties sold by weight as well as for rare ones. Many contracts are sold on several times." },
      { when: "3 Feb 1637", level: 90, text: "In Haarlem a routine tavern sale finds no buyers at the expected prices. This is the date usually given for the turn; word spreads from town to town over the following days." },
      { when: "5 Feb 1637", level: 96, text: "At Alkmaar an auction of bulbs for the benefit of an orphaned family still fetches very high prices. It is remembered as the peak, held before the news from Haarlem had taken hold." },
      { when: "Late Feb 1637", level: 30, text: "Delegates of the growers meet in Amsterdam and propose a settlement under which the most recent contracts could be cancelled for a fraction of the agreed price." },
      { when: "April 1637", level: 16, text: "The provincial authorities in The Hague decline to rule on the contracts, suspend them, and send disputes back to the towns to settle." },
      { when: "1638", level: 10, text: "Haarlem and other towns settle the remaining disputes, in general by letting buyers out of their contracts for a small part of the price." },
    ],
    after: [
      "No new institution came out of it. The disputes were settled town by town, largely by compromise, and many contracts were simply never honoured or enforced.",
      "The courts’ reluctance to enforce the contracts mattered. A promise to pay later that a court will not enforce is close to a free option for the buyer, and people at the time understood that.",
      "The tulip trade itself went on. The Dutch Republic remained the centre of commercial bulb growing, and rare bulbs continued to sell for high prices to collectors.",
    ],
    takeaways: [
      "The trade was in contracts for later delivery, not in flowers. Much of what looked like a price was a promise that had not yet been tested by anyone paying.",
      "A price that is rising because each buyer expects to sell to the next one depends on the next buyer arriving. When one sale fails, the reason for all the others goes with it.",
      "Whether a contract can be enforced is part of what it is worth. That is as true of a modern derivative as of a tavern agreement.",
      "The story most people know is a later retelling. How an episode is remembered and what the records show are often different things.",
    ],
    caution:
      "The scale of tulip mania is disputed. The dramatic version, with ruined families and a wrecked economy, comes mainly from moralising pamphlets of the time and from Charles Mackay’s popular account of 1841. Historians who have gone through the notarial and court archives find that the trade involved a fairly small number of merchants and craftsmen, that few bankruptcies can be traced to it, and that the Dutch economy was not visibly harmed. Price records are patchy and come mostly from the very end of the boom, so no reliable price series exists and none is given here. Even the date of the first failed sale is traditional rather than certain.",
    sources: "Modern archival histories of the tulip trade, economic historians’ studies of the surviving contract prices, and the seventeenth-century pamphlets themselves, read with care.",
    documents: [
      { title: "Tulipmania: Money, Honor, and Knowledge in the Dutch Golden Age", by: "Anne Goldgar (University of Chicago Press)", date: "2007", supports: "The finding from town and notarial archives that the trade involved a fairly small circle of merchants and craftsmen, and that few bankruptcies can be traced to it." },
      { title: "Tulipmania", by: "Peter M. Garber, in the Journal of Political Economy", date: "1989", supports: "The study of the surviving contract prices, and how patchy and late those records are." },
      { title: "Memoirs of Extraordinary Popular Delusions", by: "Charles Mackay", date: "1841", supports: "The popular retelling from which the dramatic version mostly comes. It is listed as the source of the legend, not as evidence for it." },
    ],
    seat: "Suppose someone has agreed in a tavern to buy bulbs that are still in the ground, with payment due after flowering.",
    junctures: [
      {
        at: 3,
        known: "Contract prices have been rising steeply since late 1636, for common varieties sold by weight as well as for rare ones. The contracts are for bulbs still in the ground, with payment due the following summer, and many have been sold on several times. Neither the bulbs nor the agreed sums have yet changed hands.",
        ask: "The contract could be kept until summer or sold on to another buyer this week. Which?",
        choices: [
          { label: "Keep the contract", note: "Prices had risen week after week and nothing public said they would stop. Keeping the contract meant staying tied to a price that nobody had yet paid in money. Had the rise run on into spring, as it had run all winter, the holder would have been glad of it." },
          { label: "Sell it on", note: "Selling on passed the promise to the next buyer at a higher figure. Whether that difference was ever collected depended on a chain of promises being honoured in summer, which nobody could know in winter. Had prices kept rising, it also meant giving up the rest of the rise." },
          { label: "Not enough to go on", note: "The trade was in promises, with no public record of prices and no test yet of whether a court would enforce them. That was a fair description of what was known. It did not remove a contract already agreed." },
        ],
        next: { when: "3 Feb 1637", to: 4, text: "In Haarlem a routine tavern sale finds no buyers at the expected prices. Word spreads from town to town over the following days." },
      },
      {
        at: 4,
        known: "In Haarlem on 3 February a routine tavern sale has found no buyers at the expected prices. Word of it is passing from town to town. Elsewhere sales are still being arranged, and it is not clear whether one failed sale in one town means anything for the rest.",
        ask: "With that news from Haarlem and nothing else, what would the holder of a contract do?",
        choices: [
          { label: "Keep the contract", note: "One failed sale in one tavern was thin evidence. Two days later an auction at Alkmaar still fetched very high prices, so for a moment keeping looked sound. The news from Haarlem could have turned out to be a local pause." },
          { label: "Try to sell it on", note: "Selling meant finding a buyer who had not yet heard, or who did not believe it. At Alkmaar buyers were still paying; in Haarlem they were not. Whether a sale could be made, and whether the new buyer would later pay, was unknown." },
          { label: "Not enough to go on", note: "Nobody then could tell a pause from a turn. Even the date of the first failed sale is traditional and not certain, which shows how little was written down at the time." },
        ],
      },
      {
        at: 6,
        known: "Buyers have stopped appearing and the trade has halted. Delegates of the growers, meeting in Amsterdam, have proposed that the most recent contracts could be cancelled for a fraction of the agreed price. It is a proposal: no court or authority has ruled on whether the contracts must be honoured.",
        ask: "A buyer bound by a winter contract could offer the fraction now, or wait to see whether the contract is enforced. Which?",
        choices: [
          { label: "Offer the fraction now", note: "Paying the fraction ended the matter at a known cost, if the seller accepted it. Had the authorities later cancelled the contracts outright, that money would have been paid for nothing. Had they enforced them in full, it would have been a cheap way out." },
          { label: "Wait for a ruling", note: "Waiting kept the money in hand and the dispute open. The provincial authorities then declined to rule and sent disputes back to the towns, so the waiting lasted into 1638. They could equally have ordered the contracts honoured." },
          { label: "Not enough to go on", note: "The proposal bound nobody, and nothing public showed how the towns or the courts would treat the contracts. Saying so was accurate. The contract and the seller were still there." },
        ],
      },
    ],
    terms: ["futures", "derivative", "liquidity", "volatility"],
    faq: [
      { q: "Did tulip mania ruin the Dutch economy?", a: "The evidence says no. Historians working from town and court archives find few bankruptcies linked to tulips and no sign of a wider slump. The picture of national ruin comes from satirical pamphlets of the time and from much later popular retellings." },
      { q: "Did one tulip bulb really cost as much as a house?", a: "Some contract prices for the rarest bulbs were recorded at sums comparable to a good house in Amsterdam, and that comparison is often repeated. But many of those contracts were never paid, the records are thin, and historians disagree about how far the famous prices reflect real transactions. This page gives no figure for that reason." },
      { q: "Why did tulip prices stop rising in February 1637?", a: "No single cause is established. The usual account is that buyers failed to appear at a sale in Haarlem in the first days of February and that confidence went from town to town within days. Suggested reasons include prices having run beyond what anyone would pay to plant, the approach of spring when contracts would have to be settled, and plague in Dutch towns thinning the meetings. None is proven." },
    ],
  },
  {
    slug: "south-sea-bubble",
    name: "The South Sea Bubble",
    title: "The South Sea Bubble of 1720: what happened and what changed",
    description: "The South Sea Bubble explained: how a company that took over British government debt saw its shares rise roughly tenfold in 1720 and fall back by the end of the year. The timeline, the inquiry, and the Bubble Act.",
    year: 1720,
    span: "1711 to 1721",
    place: "London",
    line: "A company swaps government debt for its own shares, and the shares rise tenfold and fall back in one year.",
    is: "In 1720 the South Sea Company took over a large part of Britain’s national debt in exchange for its own shares. The share price rose roughly tenfold in half a year and was back near its starting point by December. A parliamentary inquiry followed, and ministers and directors were punished.",
    shape: "the South Sea Company’s share price",
    start: 10,
    before: [
      "Britain had borrowed heavily to fight long wars, and the government wanted to lower the cost of that debt. The South Sea Company was founded in 1711 for that purpose: holders of government debt exchanged it for company shares, and the company received interest from the government and a monopoly of British trade with Spanish South America.",
      "The trade never amounted to much. Its main part was the asiento, a contract granted after the Treaty of Utrecht to carry enslaved Africans to Spanish America, and that fact belongs in any honest account of the company. The company’s real business was financial: it was a holder of government debt whose shares could be traded.",
      "In Paris a similar scheme, the Mississippi Company, was drawing money from across Europe in 1719. London had its own fever for new joint-stock ventures. Both set the mood for 1720.",
    ],
    events: [
      { when: "1711", level: 12, text: "The South Sea Company is founded. Holders of government debt exchange it for company shares, and the company is granted a monopoly of British trade with Spanish South America." },
      { when: "1713", level: 14, text: "The Treaty of Utrecht gives Britain the asiento, the contract to carry enslaved Africans to Spanish America, which passes to the company. The trade proves far smaller than hoped." },
      { when: "January 1720", level: 22, text: "The company proposes to take over a large part of the national debt. The Bank of England makes a rival offer and the two bid against each other. Shares stand at under £130." },
      { when: "April 1720", level: 44, text: "Parliament passes the scheme. The company sells new shares in a series of subscriptions, payable by instalments, and lends money against its own shares so that buyers can buy more." },
      { when: "June 1720", level: 96, text: "The Bubble Act requires a royal charter or an act of Parliament for a joint-stock company. During the summer South Sea shares reach about £1,000." },
      { when: "September 1720", level: 36, text: "The price falls rapidly as instalments fall due and holders sell. The Sword Blade Company, the South Sea Company’s banker, fails." },
      { when: "December 1720", level: 16, text: "The shares are back near where they began the year. Parliament is recalled and an inquiry begins." },
      { when: "1721", level: 12, text: "A Commons committee reports bribery of ministers and members of Parliament. Directors’ estates are confiscated, and the Chancellor of the Exchequer, John Aislabie, is expelled from the Commons and sent to the Tower. Robert Walpole oversees the reconstruction of the company’s finances." },
    ],
    after: [
      "The Bubble Act of 1720 stayed on the statute book until 1825. It made it hard to form a joint-stock company in Britain without a charter or an act of Parliament. It was passed during the boom, with the company’s own support, and was aimed at rival ventures rather than at the company.",
      "Parliament confiscated much of the directors’ wealth to compensate investors, and the company’s debt holdings were restructured, with part passing to the Bank of England.",
      "Robert Walpole, who managed the settlement, became First Lord of the Treasury in April 1721 and held office for two decades. He is usually counted as the first British prime minister.",
      "The South Sea Company itself was not wound up. It continued for more than a century as a body that managed government debt.",
    ],
    takeaways: [
      "The company lent money against its own shares and sold them by instalment. Both let buyers hold more than they could pay for, which pushed the price up on the way and forced sales on the way down.",
      "The scheme worked better for the company the higher its share price went, so those running it had every reason to talk the price up. Who benefits from a rising price is worth knowing in any market.",
      "The price moved a very long way with no change in what the company earned. A price can say more about the buyers than about the thing bought.",
      "Rules written in the middle of a boom can serve the people already inside it. The Bubble Act is the classic case.",
    ],
    caution:
      "Dates here are in the Old Style calendar that Britain used in 1720, so they differ by eleven days from the same events dated on the Continent. The share prices given are the commonly cited round figures from contemporary price lists; sources differ by a few pounds and on the exact day of the peak, partly because the company’s transfer books were closed for part of the summer. The story that Isaac Newton lost a fortune is well attested in outline, but the sum is uncertain and the remark usually attributed to him has no reliable contemporary source.",
    sources: "The House of Commons committee reports of 1721, contemporary London price lists, and modern economic histories of the scheme.",
    documents: [
      { title: "The reports of the Committee of Secrecy on the South Sea Company", by: "House of Commons", date: "1721", supports: "The findings of bribery of ministers and members of Parliament, on which the punishments of 1721 rested." },
      { title: "The Course of the Exchange", by: "John Castaing, London (a twice-weekly printed price list)", date: "Issues of 1720", supports: "The contemporary record of South Sea share prices from which the commonly cited round figures come." },
      { title: "The South Sea Bubble", by: "John Carswell", date: "1960", supports: "The narrative of the scheme, the summer of 1720 and the parliamentary inquiry." },
      { title: "The First Crash: Lessons from the South Sea Bubble", by: "Richard Dale (Princeton University Press)", date: "2004", supports: "The modern economic account of the instalment subscriptions and the loans made against the company’s own shares." },
    ],
    seat: "Suppose someone holds South Sea shares bought before the scheme of 1720.",
    junctures: [
      {
        at: 2,
        known: "The company has proposed to take over a large part of the national debt, and the Bank of England has made a rival offer. The two are bidding against each other. South Sea shares stand at under £130. The company’s trade with Spanish America has proved far smaller than hoped; its business is holding government debt.",
        ask: "Parliament has not yet decided. What would a holder of the shares do?",
        choices: [
          { label: "Hold the shares", note: "Holding was a view that Parliament would choose the company and that the exchange of debt for shares would be worth something. Parliament did pass the scheme in April. It could have chosen the Bank of England’s offer, or neither." },
          { label: "Sell part", note: "Selling part took some money out of a contest whose result was unknown. With the scheme passed and the price rising through the spring, it meant holding less of that rise. With the scheme rejected, it would have meant holding less of the disappointment." },
          { label: "Not enough to go on", note: "The terms were still being bid and the company’s trade earned little. What the shares would be worth under either outcome was a guess, and saying so was fair." },
        ],
      },
      {
        at: 3,
        known: "Parliament has passed the scheme. The company is selling new shares in a series of subscriptions, payable by instalments, and is lending money against its own shares so that buyers can buy more. The price has risen a long way since January. Nothing has changed in what the company earns.",
        ask: "What would a holder do now?",
        choices: [
          { label: "Hold the shares", note: "The price was rising and the company had every reason to keep it rising. By the summer the shares reached about £1,000, so holding through these months was, on paper, richly rewarded. Nothing public guaranteed that: a subscription that failed to fill could have turned the price in the spring." },
          { label: "Sell part", note: "Selling part took a gain at a price already far above January’s. It also meant watching the shares go on to several times that price over the summer. A person who sold here was early by months, and could not have known by how many." },
          { label: "Not enough to go on", note: "A price that moves with no change in earnings gives nothing to measure it against. That was as true in April as it was in the summer." },
        ],
      },
      {
        at: 4,
        known: "The Bubble Act now requires a royal charter or an act of Parliament for a joint-stock company, which bears on the company’s rivals for investors’ money. South Sea shares have reached about £1,000. Many holders bought by instalments or with money lent against the shares, and further instalments fall due later in the year.",
        ask: "With the shares at about £1,000, what would a holder do?",
        choices: [
          { label: "Hold the shares", note: "Holding was a view that the price, having risen roughly tenfold, would stay up or rise further. By September it was falling rapidly as instalments fell due. At the time the Act could be read as sending money from rival ventures towards the company." },
          { label: "Sell part", note: "Selling here was close to the highest prices of the year, which nobody could know then. It needed a buyer, and for part of the summer the company’s transfer books were closed. Had the price gone on rising, it would have looked like timidity." },
          { label: "Not enough to go on", note: "There was still no measure of what the shares were worth, only what the last buyer had paid. The same could have been said at every stage of the rise." },
        ],
      },
      {
        at: 5,
        known: "The price is falling rapidly as instalments fall due and holders sell. The Sword Blade Company, the South Sea Company’s banker, has failed. Parliament is not sitting and no rescue has been announced.",
        ask: "In the middle of the fall, what would a holder do?",
        choices: [
          { label: "Hold the shares", note: "Holding was a view that the fall had gone too far, or that something would be arranged. By December the shares were back near where they began the year. A reconstruction of the company’s finances did follow in 1721; it did not bring the summer’s prices back." },
          { label: "Sell part", note: "Selling in September took a price far below the summer’s and still above December’s. Anyone who had borrowed against the shares may have had no choice. Had Parliament stepped in at once with support, the sale would have come just before a recovery." },
          { label: "Not enough to go on", note: "With the banker failed and no statement from Parliament, nobody could say what would be done. That uncertainty was a reason for the selling as much as a reason to wait." },
        ],
      },
    ],
    terms: ["leverage", "margin", "liquidity", "volatility"],
    faq: [
      { q: "What did the South Sea Company actually do?", a: "Its trade with South America was small. Its main business was financial: it held British government debt, which it had acquired by giving the holders its own shares, and received interest on it from the government. The 1720 scheme was a much larger version of the same exchange." },
      { q: "How high did South Sea shares go in 1720?", a: "From under £130 a share in January 1720 to about £1,000 in the summer, and back to near the starting level by December. These are the commonly cited round figures; contemporary price lists differ slightly." },
      { q: "What was the Bubble Act?", a: "An act of Parliament of June 1720 that required a royal charter or an act of Parliament before a joint-stock company could be formed. It was passed while prices were still rising and was aimed at the South Sea Company’s rivals for investors’ money. It was repealed in 1825." },
    ],
  },
  {
    slug: "wall-street-crash-1929",
    name: "The Wall Street Crash",
    title: "The Wall Street Crash of 1929: timeline, causes and what changed",
    description: "The Wall Street Crash of 1929 explained: the peak of 3 September, Black Thursday, Black Monday and Black Tuesday, the long fall to July 1932, and the laws that followed, including the Securities Exchange Act and the SEC.",
    year: 1929,
    span: "1929 to 1934",
    place: "New York",
    line: "A decade’s boom on borrowed money ends in a week of October, and the fall runs on until 1932.",
    is: "In late October 1929 share prices in New York fell on three days that still have names: Black Thursday, Black Monday and Black Tuesday. The fall then continued, with interruptions, for nearly three years. By July 1932 the Dow Jones Industrial Average had lost about 89% of its value from the 1929 peak.",
    shape: "a share index through the boom, the crash and the long recovery",
    start: 22,
    before: [
      "The 1920s were a period of rising output and rising share prices in the United States. New investors came into the market, investment trusts multiplied, and a great deal of buying was done on margin: the buyer put down part of the price and borrowed the rest from a broker, who borrowed in turn from the banks. Loans to brokers grew through the decade.",
      "A loan against shares is safe for the lender only while the shares are worth more than the loan. When prices fall, the broker asks for more money, and a borrower who cannot find it is sold out. That mechanism was in place across the market by 1929.",
      "The Federal Reserve was uneasy about lending for speculation, and in August 1929 the Federal Reserve Bank of New York raised its discount rate from 5% to 6%. Industrial output in the United States had already begun to slow that summer.",
    ],
    events: [
      { when: "1920s", level: 34, text: "Share prices rise through the decade. Buying on margin spreads, and loans to brokers grow year after year." },
      { when: "August 1929", level: 88, text: "The Federal Reserve Bank of New York raises its discount rate from 5% to 6%, with lending for speculation in mind." },
      { when: "3 Sept 1929", level: 96, text: "The Dow Jones Industrial Average closes at 381.17. It will not close higher for twenty-five years." },
      { when: "24 Oct 1929", level: 70, text: "Black Thursday. Heavy selling at the opening on record volume. Leading bankers meet opposite the Exchange and agree to buy; prices recover much of the day’s loss." },
      { when: "28 Oct 1929", level: 56, text: "Black Monday. No support appears and the Dow falls by nearly 13% in the day." },
      { when: "29 Oct 1929", level: 46, text: "Black Tuesday. The Dow falls by nearly 12% more, on about 16 million shares, a volume record that stands until 1968." },
      { when: "13 Nov 1929", level: 40, text: "The Dow reaches its low for the year, close to half its September level. A partial recovery follows into the spring of 1930." },
      { when: "8 July 1932", level: 5, text: "After two more years of falling prices and waves of bank failures, the Dow closes at 41.22, about 89% below the 1929 peak." },
      { when: "1933–34", level: 12, text: "Congress passes the Securities Act and the Banking Act in 1933, which creates federal deposit insurance, and the Securities Exchange Act in 1934, which creates the Securities and Exchange Commission." },
      { when: "23 Nov 1954", level: 96, text: "The Dow closes above its 1929 peak for the first time." },
    ],
    after: [
      "The Securities Act of 1933 required companies selling securities to the public to register them and disclose their finances.",
      "The Banking Act of 1933, known as Glass–Steagall, separated commercial banking from investment banking and created the Federal Deposit Insurance Corporation to insure bank deposits.",
      "The Securities Exchange Act of 1934 created the Securities and Exchange Commission to regulate exchanges and brokers, and gave the Federal Reserve the power to set margin requirements for buying shares.",
      "A Senate investigation of 1932 to 1934 into banking and stock exchange practices provided much of the evidence on which those laws were built.",
    ],
    takeaways: [
      "Margin works in both directions. Falling prices produced margin calls, margin calls produced forced selling, and forced selling produced lower prices. The loop is mechanical and does not depend on anyone’s opinion.",
      "The famous days were not the whole fall. Most of the loss came in the slow decline of 1930 to 1932, after a recovery that looked convincing at the time.",
      "A rescue by large buyers held for part of one day. Support that depends on a few people’s willingness lasts as long as their willingness does.",
      "Recovery in the index took twenty-five years. A long history of recovering says nothing about how long any one recovery takes.",
    ],
    caution:
      "The crash and the Great Depression are linked in memory, but economists do not agree that the first caused the second. Most accounts give more weight to the bank failures of 1930 to 1933, the contraction of money and credit, and the working of the international gold standard, with the crash as the opening shock. The stories of financiers jumping from windows in October 1929 are largely legend. The index figures given are closing levels of the Dow Jones Industrial Average as published by its compiler.",
    sources: "The Federal Reserve’s own history pages, the published record of the Dow Jones Industrial Average, the United States Senate’s banking inquiry of 1932 to 1934, and contemporary newspaper accounts.",
    documents: [
      { title: "Stock Exchange Practices: Report of the Committee on Banking and Currency", by: "United States Senate (Senate Report No. 1455, 73rd Congress)", date: "1934", supports: "The evidence on banking and stock exchange practices from the Senate inquiry of 1932 to 1934, on which the new laws were built." },
      { title: "Banking Act of 1933", by: "United States Congress", date: "16 June 1933", supports: "The separation of commercial from investment banking and the creation of federal deposit insurance." },
      { title: "Securities Exchange Act of 1934", by: "United States Congress", date: "6 June 1934", supports: "The creation of the Securities and Exchange Commission, and the Federal Reserve’s power to set margin requirements." },
      { title: "A Monetary History of the United States, 1867–1960", by: "Milton Friedman and Anna Jacobson Schwartz", date: "1963", supports: "The weight that most accounts give to the bank failures of 1930 to 1933 and the contraction of money and credit." },
      { title: "Stock Market Crash of 1929", by: "Federal Reserve History (an essay on the Federal Reserve’s history pages)", date: "2013", supports: "The discount rate rise of August 1929 and the order of the days in October." },
    ],
    seat: "Suppose someone holds shares, part of them bought on margin.",
    junctures: [
      {
        at: 1,
        known: "Share prices have risen through the decade. Buying on margin has spread, and loans to brokers have grown year after year. In August 1929 the Federal Reserve Bank of New York raises its discount rate from 5% to 6%, with lending for speculation in mind.",
        ask: "After the rate rise, what would such a holder do?",
        choices: [
          { label: "Hold the shares", note: "Holding was a view that a rise of a decade would not be ended by one percentage point on a lending rate. Prices did go on to a record close on 3 September. A higher rate could as well have bitten at once, since so much buying was on borrowed money." },
          { label: "Pay down the loan", note: "Selling enough to reduce the margin loan lowered the amount that a fall could take, and gave up part of any further rise. For some weeks after August it looked like money left on the table." },
          { label: "Not enough to go on", note: "A central bank had signalled its unease, and prices had gone on rising. Nothing public said which of the two would give way." },
        ],
        next: { when: "3 Sept 1929", to: 2, text: "The Dow Jones Industrial Average closes at 381.17, the highest close it has yet recorded." },
      },
      {
        at: 3,
        known: "The Dow closed at a record 381.17 on 3 September and has slipped since. On Thursday 24 October there is heavy selling at the opening on record volume. Leading bankers meet opposite the Exchange and agree to buy, and prices recover much of the day’s loss.",
        ask: "On Thursday evening, what would such a holder do?",
        choices: [
          { label: "Hold the shares", note: "The bankers’ buying had steadied the day, and holding trusted it to last. On Monday no support appeared and the Dow fell by nearly 13%. Had the bankers kept buying, Thursday might now be remembered as the low." },
          { label: "Pay down the loan", note: "Selling into Thursday’s recovery lowered the loan before the next margin call. It meant selling well below September’s prices, on a day when the most powerful buyers in the market had just said they were buying." },
          { label: "Not enough to go on", note: "Whether a few bankers’ willingness would outlast the weekend was not something anyone outside the room could know." },
        ],
      },
      {
        at: 5,
        known: "On Monday 28 October the Dow fell by nearly 13%, and on Tuesday 29 October by nearly 12% more, on about 16 million shares. Brokers are calling for more margin, and holders who cannot find it are being sold out.",
        ask: "For a holder who still has shares after the margin calls, what now?",
        choices: [
          { label: "Hold what is left", note: "Holding after a fall of that size was a view that the forced selling would burn itself out. The Dow reached its low for the year on 13 November and a partial recovery followed. The forced selling could as easily have fed on itself for weeks more." },
          { label: "Sell part", note: "Selling on those days meant selling to the few buyers there were, at prices set by forced sales. It would have looked poor during the recovery that followed. It would have looked prudent had the margin calls gone on." },
          { label: "Not enough to go on", note: "Two such days together gave little to reason from. What the banks, the brokers and the Federal Reserve would do next had not been said." },
        ],
      },
      {
        at: 6,
        known: "The Dow reached its low for the year on 13 November, close to half its September level. Since then prices have recovered part of the fall, into the spring of 1930.",
        ask: "After that partial recovery, what would a holder do?",
        choices: [
          { label: "Hold the shares", note: "The recovery looked convincing at the time. Holding from here meant sitting through two more years of falling prices and waves of bank failures, to a close of 41.22 on 8 July 1932. The bank failures could not be read from share prices in the spring of 1930." },
          { label: "Sell part", note: "Selling into the recovery meant accepting prices far below September 1929 just as things seemed to be mending. As it turned out, those prices were not seen again for many years. Had the recovery continued, the seller would have fixed the loss for nothing." },
          { label: "Not enough to go on", note: "Whether the crash was an event in the share market or the start of something wider was the open question. Economists still weigh it differently." },
        ],
      },
    ],
    terms: ["margin", "margin-call", "leverage", "index", "recession"],
    faq: [
      { q: "How much did the stock market fall in the 1929 crash?", a: "The Dow Jones Industrial Average fell by nearly 13% on Monday 28 October 1929 and by nearly 12% on Tuesday 29 October. From its peak close of 381.17 on 3 September 1929 to its low of 41.22 on 8 July 1932, it lost about 89%." },
      { q: "Did the 1929 crash cause the Great Depression?", a: "Not by itself, on most economists’ reading. The crash destroyed wealth and confidence, but the depth of the Depression is usually put down to the bank failures of 1930 to 1933, the fall in money and credit, and the gold standard. How much weight the crash deserves is still debated." },
      { q: "How long did the market take to recover after 1929?", a: "The Dow Jones Industrial Average did not close above its September 1929 peak until 23 November 1954, twenty-five years later. That is the index level alone and takes no account of dividends or of changes in prices generally over the period." },
    ],
  },
  {
    slug: "black-monday-1987",
    name: "Black Monday",
    title: "Black Monday 1987: the day the Dow fell 22.6%",
    description: "Black Monday explained: on 19 October 1987 the Dow Jones Industrial Average fell 22.6% in one day, its largest one-day percentage fall. What led up to it, the timeline, the Brady report and the circuit breakers that followed.",
    year: 1987,
    span: "1987 to 1988",
    place: "New York and world markets",
    line: "The largest one-day percentage fall in the Dow’s history, and the origin of circuit breakers.",
    is: "On Monday 19 October 1987 the Dow Jones Industrial Average fell 508 points, or 22.6%, in a single session. It remains the index’s largest one-day percentage fall. Markets around the world fell with it. No bank failed, no recession followed, and the official inquiry looked for the cause inside the market’s own machinery.",
    shape: "a share index before, during and after the day",
    start: 52,
    before: [
      "Share prices had risen strongly through the first eight months of 1987, and the Dow peaked in late August. Interest rates were rising, the dollar was under pressure, and the United States was running a large trade deficit.",
      "Two practices had grown up alongside the rise. Portfolio insurance was a method by which large institutions sold share-index futures automatically as prices fell, in order to limit their losses. Index arbitrage linked the futures market in Chicago to the share market in New York by trading one against the other. Each was reasonable for the firm using it. Together they meant that a fall would itself produce more selling.",
      "In the week before, prices fell on three successive days, from Wednesday 14 October to Friday 16 October, after disappointing trade figures and news of a proposed tax change affecting takeovers.",
    ],
    events: [
      { when: "August 1987", level: 94, text: "After a strong rise since the start of the year, the Dow Jones Industrial Average reaches its peak in late August." },
      { when: "14–16 Oct 1987", level: 76, text: "Three days of falls in New York, from Wednesday to Friday. Institutions using portfolio insurance are left with selling still to do." },
      { when: "19 Oct, morning", level: 64, text: "Markets in Asia and then Europe fall before New York opens. At the opening, sell orders are so heavy that many large shares do not begin trading for an hour or more." },
      { when: "19 Oct, close", level: 24, text: "The Dow closes down 508 points, a fall of 22.6% in one day. Share-index futures in Chicago fall further still, and order systems run far behind." },
      { when: "20 Oct 1987", level: 34, text: "Before the opening the Federal Reserve states that it stands ready to supply liquidity. Around midday trading in many shares and futures all but stops; then prices turn up, helped by companies announcing purchases of their own shares." },
      { when: "20–23 Oct 1987", level: 32, text: "The Hong Kong stock exchange stays closed from Tuesday to Friday. Other markets remain open and unsettled." },
      { when: "January 1988", level: 40, text: "The Presidential Task Force on Market Mechanisms, known as the Brady Commission, reports. It treats shares, futures and options as one market and recommends co-ordinated trading halts." },
      { when: "October 1988", level: 50, text: "Circuit breakers come into force in New York and Chicago: rules that pause trading when prices fall by a set amount in a day." },
    ],
    after: [
      "Circuit breakers were introduced in 1988. They pause trading across the market after a large fall, to give people time to find out what is happening and to let orders catch up. The thresholds have been revised several times since.",
      "The Brady report’s central finding was that the share, futures and options markets are a single market in practice, and that rules and margin arrangements needed to be co-ordinated across them.",
      "Clearing and settlement systems were strengthened after it became clear how close some clearing arrangements had come to failing on 20 October.",
      "The Federal Reserve’s statement on 20 October became the model for how a central bank responds to a market panic: by making clear that the banking system will have the cash it needs.",
    ],
    takeaways: [
      "A selling rule that is sensible for one firm can be destabilising when many firms follow it at once. Portfolio insurance assumed there would be buyers at each step down; on the day there were not.",
      "Liquidity is not a fixed property of a market. On 19 and 20 October it was scarce exactly when it was most wanted.",
      "The fall had no single piece of news behind it. A very large move does not need a very large reason.",
      "The Dow ended 1987 slightly higher than it began. The size of the worst day says little about the year around it, in either direction.",
    ],
    caution:
      "The cause is still argued over. The Brady report gave a large part to portfolio insurance and index arbitrage; other studies put more weight on the news of the preceding week, on overseas selling, or on the market simply having risen too far. The figures given for the day, 508 points and 22.6%, are not in dispute.",
    sources: "The report of the Presidential Task Force on Market Mechanisms of January 1988, the Federal Reserve’s history pages, and the published record of the Dow Jones Industrial Average.",
    documents: [
      { title: "Report of the Presidential Task Force on Market Mechanisms (the Brady report)", by: "Presidential Task Force on Market Mechanisms", date: "January 1988", supports: "The part played by portfolio insurance and index arbitrage, the finding that shares, futures and options are one market, and the recommendation of co-ordinated trading halts." },
      { title: "The October 1987 Market Break", by: "Division of Market Regulation, Securities and Exchange Commission", date: "February 1988", supports: "The regulator’s own account of the trading of 19 and 20 October and of the order systems that fell behind." },
      { title: "Statement by the Chairman of the Board of Governors of the Federal Reserve System", by: "Federal Reserve", date: "20 October 1987", supports: "The statement, made before the opening, that the Federal Reserve stood ready to supply liquidity." },
      { title: "A Brief History of the 1987 Stock Market Crash with a Discussion of the Federal Reserve Response", by: "Mark Carlson, Finance and Economics Discussion Series 2007-13, Board of Governors of the Federal Reserve System", date: "November 2006", supports: "The order of events on 19 and 20 October, the strain on clearing arrangements and the central bank’s response." },
    ],
    seat: "Suppose someone holds a broad spread of American shares.",
    junctures: [
      {
        at: 1,
        known: "The Dow peaked in late August after a strong rise since the start of the year. From Wednesday 14 to Friday 16 October prices in New York have fallen three days running, after disappointing trade figures and news of a proposed tax change affecting takeovers. Interest rates are rising and the dollar is under pressure.",
        ask: "On Friday evening, what would such a holder do?",
        choices: [
          { label: "Hold the shares", note: "Three falling days after a strong year were not unusual in themselves, and the news behind them was ordinary. Holding over the weekend was a view that Monday would be another day. It could have been: nothing public pointed to a fall of the size that came." },
          { label: "Sell part", note: "Selling on Friday took money out before the weekend, at prices already well below August’s. Had Monday opened calmly, it would have been a sale at the bottom of a three-day dip." },
          { label: "Not enough to go on", note: "How much automatic selling was still waiting was known to the institutions concerned and not to the public. On what was published, there was little to tell a dip from something worse." },
        ],
      },
      {
        at: 2,
        known: "It is Monday 19 October. Markets in Asia and then Europe have fallen before New York opens. At the opening in New York, sell orders are so heavy that many large shares do not begin trading for an hour or more.",
        ask: "During that morning, what would a holder do?",
        choices: [
          { label: "Hold the shares", note: "Holding meant not joining a queue of sell orders that could not yet be matched. By the close the Dow was down 22.6%. At midday a rally in the afternoon was as easy to imagine as a further fall." },
          { label: "Sell at the market", note: "A market order that morning was filled at whatever price existed when its turn came, with order systems running far behind. The price received could be far from the price last seen. As the day went, the index was lower still at the close." },
          { label: "Not enough to go on", note: "With many large shares not yet open, there was no reliable price to act on. For an hour or more that was literally so." },
        ],
      },
      {
        at: 3,
        known: "The Dow has closed down 508 points, a fall of 22.6% in one day. Share-index futures in Chicago have fallen further still, and order systems have run far behind. No statement has yet come from the Federal Reserve.",
        ask: "On Monday night, what would a holder plan for Tuesday?",
        choices: [
          { label: "Hold the shares", note: "Holding overnight was a view that the worst was done, or simply that there was no sensible price to sell at. On Tuesday the Federal Reserve said it stood ready to supply liquidity, and prices turned up after midday. Around midday trading in many shares all but stopped, and it could have gone the other way." },
          { label: "Sell part", note: "Selling on Tuesday morning meant selling into a market that nearly ceased to function before it turned. Had clearing arrangements failed, as some came close to doing, being out would have mattered a great deal." },
          { label: "Not enough to go on", note: "Nobody outside knew on Monday night how sound the brokers and clearing arrangements were. That was the real question, and it could not be answered from published prices." },
        ],
      },
    ],
    terms: ["liquidity", "volatility", "index", "futures", "hedging", "slippage"],
    faq: [
      { q: "How much did the market fall on Black Monday 1987?", a: "The Dow Jones Industrial Average fell 508 points on 19 October 1987, which was 22.6% of its value. It is the largest one-day percentage fall in the index’s history." },
      { q: "What caused Black Monday?", a: "There is no agreed single cause. The official inquiry, the Brady Commission, pointed to automatic selling by institutions using portfolio insurance and to the link between the futures and share markets. Others stress the bad news of the week before and selling from overseas. Most accounts treat it as several things together." },
      { q: "What is a circuit breaker and why was it introduced?", a: "A circuit breaker is an exchange rule that pauses trading when prices fall by a set percentage in a day. Circuit breakers were introduced in the United States in 1988, on the recommendation of the Brady Commission, so that a fast fall would be interrupted and orders and information could catch up." },
    ],
  },
  {
    slug: "black-wednesday-1992",
    name: "Black Wednesday",
    title: "Black Wednesday 1992: the day sterling left the ERM",
    description: "Black Wednesday explained: on 16 September 1992 the United Kingdom raised interest rates twice in a day and still had to suspend sterling’s membership of the European Exchange Rate Mechanism. The timeline and what changed afterwards.",
    year: 1992,
    span: "1990 to 1997",
    place: "London",
    line: "The pound is forced out of Europe’s Exchange Rate Mechanism in a single day.",
    is: "On Wednesday 16 September 1992 the British government tried to keep the pound inside the European Exchange Rate Mechanism by buying sterling and by raising interest rates twice in one day. By the evening it had given up and suspended membership. The episode is the standard example of a fixed exchange rate that could not be held.",
    shape: "the pound against the German mark",
    start: 70,
    before: [
      "The Exchange Rate Mechanism, or ERM, tied European currencies to one another within agreed bands. The United Kingdom joined on 8 October 1990 with a central rate of 2.95 German marks to the pound and permission to move 6% either side of it. The aim was to bring British inflation down by tying the pound to the mark.",
      "The timing was unlucky. German reunification in 1990 led to heavy public spending there, and the Bundesbank kept German interest rates high to contain inflation. Countries tied to the mark had to keep their own rates high to match. The United Kingdom was in recession and wanted the opposite.",
      "Confidence in the whole system weakened in 1992. Danish voters rejected the Maastricht Treaty in June, a French referendum on it was due on 20 September, and markets began to test which currencies would be devalued.",
    ],
    events: [
      { when: "8 Oct 1990", level: 72, text: "The United Kingdom joins the ERM at a central rate of 2.95 marks to the pound, with a band of 6% either side." },
      { when: "1990–92", level: 66, text: "After reunification the Bundesbank keeps German interest rates high. The United Kingdom, in recession, has to keep its own rates high to hold the pound in its band." },
      { when: "2 June 1992", level: 60, text: "Danish voters reject the Maastricht Treaty. Doubt spreads about monetary union and about the ERM’s existing rates." },
      { when: "8–14 Sept 1992", level: 50, text: "Finland abandons its currency’s link on 8 September. At the weekend of 12 and 13 September Italy devalues the lira within the ERM. Sterling falls to the bottom of its band." },
      { when: "16 Sept, morning", level: 46, text: "The Bank of England buys sterling heavily. Late in the morning the government announces a rise in interest rates from 10% to 12%. The pound does not move off its floor." },
      { when: "16 Sept, afternoon", level: 44, text: "A second rise, to 15%, is announced to take effect the following day. Selling continues." },
      { when: "16 Sept, evening", level: 20, text: "The Chancellor of the Exchequer announces that sterling’s membership of the ERM is suspended. The pound is left to float and falls." },
      { when: "17 Sept 1992", level: 14, text: "Interest rates go back to 10%; the rise to 15% never takes effect. Italy also takes the lira out of the mechanism." },
      { when: "October 1992", level: 18, text: "The government adopts a published inflation target as the new basis for monetary policy." },
      { when: "May 1997", level: 22, text: "The Bank of England is given operational independence to set interest rates." },
    ],
    after: [
      "In October 1992 the United Kingdom adopted an explicit inflation target in place of an exchange-rate target. Inflation targeting later became the usual framework for central banks in many countries.",
      "In May 1997 the Bank of England was given operational independence to set interest rates, through its Monetary Policy Committee.",
      "The ERM itself was loosened in August 1993, when most of its bands were widened to 15% either side after further pressure on the French franc.",
      "The pound never rejoined. The Treasury later estimated the cost of the defence in billions of pounds.",
    ],
    takeaways: [
      "A peg holds while the country is willing and able to pay for it. On the day, the market judged that a country in recession would not keep interest rates at 15%, and it was right.",
      "Defending a floor gives sellers a known price to sell at. A central bank buying its own currency at a fixed rate is on the other side of every such sale until its reserves or its resolve run out.",
      "A pegged rate can look calm for a long time and then move a long way at once. The absence of movement was a policy, not a property of the currency.",
      "Raising interest rates did not help once the peg was no longer believed. A defence that is not credible can speed the result it was meant to prevent.",
    ],
    caution:
      "The interest rates, dates and the ERM central rate are a matter of public record. The cost of the day’s intervention is an estimate and depends on how it is counted, so no figure is given here. Much is written about the profits of particular funds; those accounts are not needed to understand what happened and are left out. Whether leaving the ERM was a disaster or a release is a matter of opinion: the economy recovered in the years that followed, and the political cost to the government of the day was severe.",
    sources: "Bank of England and Treasury accounts of the episode, including Treasury papers released later, and contemporary newspaper reports.",
    documents: [
      { title: "Statement by the Chancellor of the Exchequer on the suspension of sterling’s membership of the Exchange Rate Mechanism", by: "HM Treasury", date: "16 September 1992", supports: "The suspension of sterling’s membership, announced that evening." },
      { title: "Letter from the Chancellor of the Exchequer to the Chairman of the Treasury and Civil Service Committee", by: "HM Treasury", date: "8 October 1992", supports: "The adoption of a published inflation target as the new basis for monetary policy." },
      { title: "Bank of England Act 1998", by: "United Kingdom Parliament", date: "1998", supports: "The legal basis for the operational independence announced in May 1997, and for the Monetary Policy Committee." },
      { title: "The cost of Black Wednesday reconsidered", by: "HM Treasury (an internal paper, released later under freedom of information)", date: "1997, released in 2005", supports: "The Treasury’s own later estimate of what the defence cost. This page gives no figure, because it depends on how the cost is counted." },
    ],
    seat: "Suppose a firm holds pounds that it must turn into German marks in a few weeks’ time.",
    junctures: [
      {
        at: 3,
        known: "Sterling joined the ERM in 1990 at 2.95 marks to the pound, with a band of 6% either side. Danish voters rejected the Maastricht Treaty in June, and a French referendum on it is due on 20 September. Finland abandoned its currency’s link on 8 September, and at the weekend of 12 and 13 September Italy devalued the lira within the ERM. Sterling has fallen to the bottom of its band.",
        ask: "With sterling on its floor, what would the firm do with its pounds?",
        choices: [
          { label: "Leave them in pounds", note: "The band was a commitment by a government with reserves and the power to set interest rates, and until that week it had held. Leaving the pounds alone was a view that it would hold again. The lira had just stayed in the mechanism only by being devalued." },
          { label: "Convert part now", note: "Converting at the floor meant accepting the worst rate the band allowed, in exchange for depending on the band less. Had the defence succeeded and the pound risen off its floor, this would have been the dearest moment to convert." },
          { label: "Not enough to go on", note: "Whether a government in recession would pay the price of a defence was a political question. The market was guessing at it too." },
        ],
      },
      {
        at: 4,
        known: "It is Wednesday 16 September. The Bank of England has been buying sterling heavily. Late in the morning the government announces a rise in interest rates from 10% to 12%. The pound has not moved off its floor.",
        ask: "After the first rate rise, what would the firm do?",
        choices: [
          { label: "Leave them in pounds", note: "A rise of two points in a morning was a strong signal of intent, and intent was what the market doubted. It could have turned the day. It did not: a second rise was announced that afternoon and the selling continued." },
          { label: "Convert part now", note: "The Bank was still buying pounds at the floor, so the floor rate was there for anyone selling. Converting used it while it lasted. Had the rise worked, the firm would have sold at the bottom of the band on the day the pound recovered." },
          { label: "Not enough to go on", note: "A rate rise that fails to move the price can mean that a defence is working slowly or not at all. From outside, at midday, the two looked the same." },
        ],
      },
      {
        at: 5,
        known: "A second rise in interest rates, to 15%, has been announced, to take effect the following day. Selling continues and the pound is still on its floor.",
        ask: "After the second rise, what would the firm do?",
        choices: [
          { label: "Leave them in pounds", note: "Holding the pounds now rested on the government keeping rates at 15% in a recession. That evening it suspended membership and the pound fell. A devaluation inside the mechanism, as Italy had made days before, was another outcome that could be imagined that afternoon." },
          { label: "Convert part now", note: "Converting that afternoon was at the floor rate, on the last day it was on offer. That is known now. At the time it meant selling at the bottom of the band hours after two rate rises meant to lift it." },
          { label: "Not enough to go on", note: "Two rises in one day were extraordinary, which made them evidence of resolve and of desperation at once. Both readings were open that afternoon." },
        ],
      },
    ],
    terms: ["central-bank", "monetary-policy", "interest-rate", "inflation", "volatility", "gap"],
    faq: [
      { q: "What happened on Black Wednesday?", a: "On 16 September 1992 sterling came under heavy selling and fell to the floor of its band in the European Exchange Rate Mechanism. The Bank of England bought pounds and the government announced interest rate rises from 10% to 12% and then to 15%. Neither worked, and that evening the government suspended sterling’s membership of the mechanism." },
      { q: "What was the ERM?", a: "The Exchange Rate Mechanism was an arrangement begun in 1979 under which European currencies were held within agreed bands against one another. Central banks were obliged to keep their currencies inside the bands by intervening in the market and by adjusting interest rates. It was a forerunner of the euro." },
      { q: "Why could the UK not stay in the ERM?", a: "Staying in required interest rates high enough to hold the pound against the German mark at a time when German rates were high and the British economy was in recession. Markets doubted that the government would sustain that, sold sterling in very large amounts, and the reserves and the rate rises used to resist them were not enough." },
    ],
  },
  {
    slug: "asian-financial-crisis-1997",
    name: "The Asian financial crisis",
    title: "The Asian financial crisis of 1997: timeline and causes",
    description: "The Asian financial crisis explained: from the floating of the Thai baht on 2 July 1997 to currency collapses in Indonesia, Malaysia, the Philippines and South Korea. What led up to it, the order of events and what changed.",
    year: 1997,
    span: "1997 to 2000",
    place: "East and South-East Asia",
    line: "Thailand floats the baht, and currency pegs across the region give way one after another.",
    is: "On 2 July 1997 Thailand stopped defending the baht’s link to the US dollar. Within six months the currencies of Indonesia, Malaysia, the Philippines and South Korea had fallen sharply, banks and companies with dollar debts had failed, and three countries had turned to the International Monetary Fund.",
    shape: "the region’s currencies against the dollar",
    start: 80,
    before: [
      "Through the early 1990s the economies of East and South-East Asia grew quickly and attracted a great deal of foreign money. Several kept their currencies fixed, or nearly fixed, against the US dollar. That made borrowing in dollars look safe, and banks and companies borrowed short-term in dollars to lend or invest long-term in local currency.",
      "The arrangement had two weaknesses. If the peg broke, dollar debts would grow in local-currency terms overnight. And short-term loans have to be renewed: if foreign lenders declined to renew, the borrowers would need dollars that the country’s reserves might not cover.",
      "From the middle of the decade the dollar rose against the yen, which made the pegged currencies less competitive. Thailand ran a large current-account deficit, its property market turned down and finance companies there began to fail. By the spring of 1997 the baht was under attack.",
    ],
    events: [
      { when: "Early 1990s", level: 84, text: "Foreign capital flows into the region. Currencies are held steady against the dollar, and banks and companies borrow short-term in dollars." },
      { when: "May 1997", level: 80, text: "The baht comes under heavy selling. The Bank of Thailand defends the rate, committing much of its reserves through forward contracts." },
      { when: "2 July 1997", level: 62, text: "Thailand floats the baht, which falls at once. This is the date usually given for the start of the crisis." },
      { when: "July 1997", level: 54, text: "The Philippines lets the peso float on 11 July, and on 14 July Malaysia stops defending the ringgit." },
      { when: "August 1997", level: 46, text: "Indonesia floats the rupiah on 14 August. Later in the month the International Monetary Fund approves a programme for Thailand." },
      { when: "Late Oct 1997", level: 36, text: "Hong Kong’s share market falls sharply as its dollar link is defended with very high overnight interest rates. On 27 October the Dow falls 554 points and circuit breakers halt trading in New York for the first time." },
      { when: "Nov–Dec 1997", level: 22, text: "South Korea asks the International Monetary Fund for help in late November and reaches agreement in early December. The won is floated on 16 December." },
      { when: "May 1998", level: 12, text: "In Indonesia, after a collapse in the rupiah, price rises and riots, the president resigns on 21 May after three decades in power." },
      { when: "September 1998", level: 16, text: "Malaysia imposes controls on capital movements and fixes the ringgit at 3.80 to the dollar." },
      { when: "May 2000", level: 34, text: "The countries of South-East Asia with China, Japan and South Korea agree the Chiang Mai Initiative, a network of currency swap arrangements between their central banks." },
    ],
    after: [
      "Most of the countries affected moved to more flexible exchange rates, and many built up far larger foreign currency reserves than before, as insurance against a repeat.",
      "The Chiang Mai Initiative of May 2000 set up currency swap lines between the region’s central banks, so that a country short of dollars could borrow from its neighbours.",
      "Bank supervision was tightened and limits were placed on borrowing in foreign currency in several countries.",
      "The International Monetary Fund’s programmes, which required high interest rates and cuts in public spending, were heavily criticised, and the Fund’s own later evaluations accepted some of that criticism.",
    ],
    takeaways: [
      "Borrowing in one currency to hold assets in another is a position in the exchange rate, whether or not it is thought of as one. A peg hides that risk without removing it.",
      "Short-term funding of long-term assets depends on lenders continuing to renew. When they stop, a firm that is sound on paper can still run out of cash.",
      "The crisis moved from country to country faster than their economic links alone would explain. Investors who lose in one place reassess similar places, and sell.",
      "Reserves that have been promised in forward contracts are not available. The published number and the usable number were different things.",
    ],
    caution:
      "The dates of the floats and the agreements are a matter of record. The causes are argued over: some accounts stress weak banks, poor supervision and bad lending inside the countries; others stress a panic among foreign lenders that would have damaged even sound economies. The effects of the International Monetary Fund’s conditions, and of Malaysia’s capital controls, are also still debated. Figures for the size of the rescue programmes and the depth of the currency falls vary with the dates chosen and are not given here.",
    sources: "International Monetary Fund histories and its independent evaluation of the programmes, central bank accounts from the region, and contemporary newspaper reports.",
    documents: [
      { title: "The IMF and Recent Capital Account Crises: Indonesia, Korea, Brazil", by: "Independent Evaluation Office of the International Monetary Fund", date: "2003", supports: "The Fund’s own evaluation of its programmes, which accepted part of the criticism made of them." },
      { title: "IMF-Supported Programs in Indonesia, Korea, and Thailand: A Preliminary Assessment", by: "Timothy Lane and others, International Monetary Fund Occasional Paper 178", date: "1999", supports: "The order of the programmes for the three countries and the conditions attached to them." },
      { title: "The East Asian Financial Crisis: Diagnosis, Remedies, Prospects", by: "Steven Radelet and Jeffrey Sachs, in the Brookings Papers on Economic Activity", date: "1998", supports: "The reading of the crisis that stresses a panic among foreign lenders, one side of the argument described above." },
      { title: "The Joint Ministerial Statement of the ASEAN + 3 Finance Ministers Meeting", by: "Finance ministers of the ASEAN countries, China, Japan and South Korea, at Chiang Mai", date: "6 May 2000", supports: "The Chiang Mai Initiative: the network of currency swap arrangements between the region’s central banks." },
    ],
    seat: "Suppose a company in the region has a short-term loan in US dollars and earns its income in a local currency that is held steady against the dollar.",
    junctures: [
      {
        at: 1,
        known: "For years the baht has been held steady against the dollar, and banks and companies have borrowed short-term in dollars. Thailand runs a large current-account deficit, its property market has turned down and finance companies have begun to fail. In May 1997 the baht comes under heavy selling, and the Bank of Thailand defends the rate.",
        ask: "For a Thai company with such a loan, what now?",
        choices: [
          { label: "Leave the loan as it is", note: "The link to the dollar had held for years and the central bank was defending it. Leaving the loan uncovered cost nothing while that lasted. On 2 July the baht was floated and fell at once. How much of the reserves had already been promised in forward contracts was not public in May." },
          { label: "Buy dollars forward", note: "Covering the loan fixed its cost in baht, at a price. Had the defence held, it would have been money spent on insurance that was not needed." },
          { label: "Not enough to go on", note: "The published reserves looked adequate. The usable reserves were another matter, and nobody outside the central bank could see the difference." },
        ],
        next: { when: "2 July 1997", to: 2, text: "Thailand floats the baht, which falls at once." },
      },
      {
        at: 2,
        known: "Thailand has floated the baht, which fell at once. The currencies of the Philippines, Malaysia and Indonesia are still being held.",
        ask: "For a company with the same kind of loan in one of those neighbouring countries, what now?",
        choices: [
          { label: "Leave the loan as it is", note: "Each country’s position differed from Thailand’s. Leaving the loan uncovered was a view that the trouble was Thai. The Philippines let the peso float on 11 July, Malaysia stopped defending the ringgit on 14 July and Indonesia floated the rupiah on 14 August." },
          { label: "Buy dollars forward", note: "Covering fixed the loan’s cost before the neighbouring currencies went, at whatever price cover could then be had. Had the trouble stayed in Thailand, it would have been an expense with nothing to show for it." },
          { label: "Not enough to go on", note: "Whether a crisis spreads depends on what lenders decide to believe about similar places. That could not be read from any one country’s figures." },
        ],
      },
      {
        at: 5,
        known: "Since July the baht, the peso, the ringgit and the rupiah have all been let go, and the International Monetary Fund has approved a programme for Thailand. In late October Hong Kong’s share market falls sharply as its dollar link is defended with very high overnight interest rates, and on 27 October the Dow falls 554 points. South Korea’s won has not been floated.",
        ask: "For a South Korean company with a short-term dollar loan, what now?",
        choices: [
          { label: "Leave the loan as it is", note: "South Korea was a far larger industrial economy than those that had floated, and could be seen as a different case. Leaving the loan uncovered rested on that. South Korea asked the Fund for help in late November, and the won was floated on 16 December." },
          { label: "Buy dollars forward", note: "Covering in late October fixed the loan’s cost before the won went, at a price. Hong Kong’s link, defended at the same moment, held. The won’s might have held too." },
          { label: "Not enough to go on", note: "The question was whether foreign lenders would renew their short-term loans. They did not publish their intentions." },
        ],
      },
    ],
    terms: ["central-bank", "liquidity", "leverage", "volatility", "interest-rate", "hedging"],
    faq: [
      { q: "What started the Asian financial crisis?", a: "The event usually named is Thailand’s decision on 2 July 1997 to stop defending the baht’s link to the US dollar, after its reserves had been largely committed to the defence. The underlying conditions were pegged currencies, heavy short-term borrowing in dollars and weak banks, in Thailand and in several neighbours." },
      { q: "Which countries were hit hardest in the Asian crisis?", a: "Thailand, Indonesia and South Korea, each of which turned to the International Monetary Fund, together with Malaysia and the Philippines. Hong Kong kept its link to the dollar but saw its share market fall sharply. Indonesia suffered the deepest fall in its currency and a change of government." },
      { q: "What changed after the Asian financial crisis?", a: "Most of the affected countries let their currencies move more freely, built much larger foreign currency reserves, and tightened the supervision of banks. In May 2000 the region’s governments agreed the Chiang Mai Initiative, a set of currency swap arrangements between central banks." },
    ],
  },
  {
    slug: "dot-com-bubble",
    name: "The dot-com bubble",
    title: "The dot-com bubble: the Nasdaq peak of March 2000 and the fall",
    description: "The dot-com bubble explained: how internet and technology shares rose through the late 1990s, the Nasdaq Composite’s peak close of 5,048.62 on 10 March 2000, the fall to October 2002, and the Sarbanes–Oxley Act that followed.",
    year: 2000,
    span: "1995 to 2002",
    place: "United States",
    line: "Internet shares peak on 10 March 2000; the Nasdaq then loses more than three quarters of its value.",
    is: "In the late 1990s the shares of internet and technology companies rose faster than anything those companies earned. The Nasdaq Composite index closed at a peak of 5,048.62 on 10 March 2000. By 9 October 2002 it had fallen about 78%. The internet turned out to matter as much as its believers said; most of the companies did not survive to see it.",
    shape: "an index of technology shares",
    start: 8,
    before: [
      "The internet became a commercial medium in the mid-1990s. It was clear that it would change business; it was not clear which companies would benefit, or when. That combination, a real change with an unknowable outcome, is the usual setting for a boom.",
      "Money was easy to raise. Venture capital funded new companies, and stock markets were willing to buy their shares at flotation before they had made a profit, sometimes before they had much revenue. New measures were used in place of earnings, such as the number of visitors to a website. Analysts at the banks that sold the shares also published research recommending them.",
      "A share that doubles on its first day of trading is an advertisement for the next flotation. Through 1998 and 1999 that happened often.",
    ],
    events: [
      { when: "August 1995", level: 12, text: "The flotation of an early web-browser company closes its first day far above the offer price. It is usually taken as the start of the internet share boom." },
      { when: "1998–1999", level: 62, text: "Flotations of internet companies multiply, many with no profits. The Nasdaq Composite rises by more than 85% in 1999 alone." },
      { when: "From June 1999", level: 78, text: "The Federal Reserve begins raising interest rates. Six increases by May 2000 take its target rate to 6.5%." },
      { when: "10 March 2000", level: 97, text: "The Nasdaq Composite closes at 5,048.62, its peak." },
      { when: "April 2000", level: 68, text: "Technology shares fall heavily, with the worst of it in the week ending 14 April. Companies that had relied on raising new money find they cannot." },
      { when: "2001", level: 38, text: "The United States economy is in recession from March to November. After the attacks of 11 September the New York markets are closed for four trading days." },
      { when: "July 2002", level: 22, text: "After accounting scandals at several large listed companies, Congress passes the Sarbanes–Oxley Act." },
      { when: "9 Oct 2002", level: 12, text: "The Nasdaq Composite closes at 1,114.11, its low, about 78% below the peak of March 2000." },
      { when: "April 2003", level: 18, text: "Regulators and a group of large investment banks conclude a settlement over conflicts of interest in the banks’ share research." },
      { when: "April 2015", level: 96, text: "The Nasdaq Composite closes above its March 2000 peak for the first time, fifteen years on." },
    ],
    after: [
      "The Sarbanes–Oxley Act of July 2002 made the chief executives and finance directors of listed companies personally certify their accounts, tightened the rules for auditors, and created a public body to oversee them.",
      "A settlement in 2003 between regulators and large investment banks required share research to be separated from the business of selling flotations.",
      "In 2000 the Securities and Exchange Commission adopted a rule requiring companies to release important information to all investors at once, not to favoured analysts first.",
      "Many companies disappeared. Some that survived the fall later became among the largest in the world, which is part of why the episode is hard to draw simple conclusions from.",
    ],
    takeaways: [
      "The story was true and the prices were still wrong. Being right that something will matter is different from knowing what a share in it is worth.",
      "When earnings cannot support a price, other measures tend to be found that can. A new yardstick introduced during a boom is worth a second look.",
      "Companies that needed new money every few months were solvent only while markets stayed open to them. The fall in share prices and the failure of the businesses were the same event.",
      "The index took fifteen years to regain its peak, and it did so with a different set of companies in it. An index recovering is not the same as its original members recovering.",
    ],
    caution:
      "The index levels are the Nasdaq Composite’s published closing values. The peak during the trading day on 10 March 2000 was higher than the closing figure given here. What ended the boom is not agreed: rising interest rates, a run of poor results, a court ruling against a large software company in early April 2000 and plain exhaustion of new buyers are all cited. No single trigger is established.",
    sources: "The published record of the Nasdaq Composite index, Federal Reserve and Securities and Exchange Commission records, and the business-cycle dates published by the National Bureau of Economic Research.",
    documents: [
      { title: "Sarbanes–Oxley Act of 2002 (Public Law 107-204)", by: "United States Congress", date: "30 July 2002", supports: "The personal certification of accounts by chief executives and finance directors, the tighter rules for auditors and the public body that oversees them." },
      { title: "Selective Disclosure and Insider Trading (the final rule adopting Regulation FD)", by: "Securities and Exchange Commission", date: "August 2000", supports: "The rule that important information must be released to all investors at once." },
      { title: "The global research analyst settlement", by: "Announced jointly by the Securities and Exchange Commission, the New York Attorney General, NASD, the New York Stock Exchange and state securities regulators", date: "28 April 2003", supports: "The settlement over conflicts of interest in the banks’ share research, and the separation of research from the business of selling flotations." },
      { title: "Announcements of the Business Cycle Dating Committee", by: "National Bureau of Economic Research", date: "26 November 2001 and 17 July 2003", supports: "The dating of the United States recession from March to November 2001." },
    ],
    seat: "Suppose someone holds a fund of technology shares.",
    junctures: [
      {
        at: 2,
        known: "It is the start of 2000. Flotations of internet companies have multiplied, many of them with no profits. The Nasdaq Composite rose by more than 85% in 1999 alone. The Federal Reserve has been raising interest rates since June 1999.",
        ask: "After a year like 1999, what would such a holder do?",
        choices: [
          { label: "Hold the fund", note: "The internet was changing business, as its believers said, and the index had rewarded holders for years. Holding was a view that this would continue. The Nasdaq went on to a record close of 5,048.62 on 10 March 2000. Rising interest rates could have ended the rise months earlier, or not at all." },
          { label: "Sell part", note: "Selling part after a year of 85% took a gain and gave up whatever came next. In the weeks that followed, that meant watching the index reach a new record." },
          { label: "Not enough to go on", note: "With no earnings to value, the new yardsticks could justify almost any price. There was no agreed way to say what was too high." },
        ],
        next: { when: "10 March 2000", to: 3, text: "The Nasdaq Composite closes at 5,048.62, a record." },
      },
      {
        at: 4,
        known: "The Nasdaq closed at a record 5,048.62 on 10 March. In April technology shares have fallen heavily, with the worst of it in the week ending 14 April. Companies that had relied on raising new money are finding that they cannot.",
        ask: "After April’s fall, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "Holding was a view that April was a sharp interruption in a rise that had further to go. The decline in fact continued, and the economy was in recession from March 2001. In April 2000 a rebound to new records was as easy to argue for." },
          { label: "Sell part", note: "Selling in April meant selling well below March’s prices after a month’s fall. It left less exposed to what followed. Had the index turned up in May, it would have been a sale near a low." },
          { label: "Not enough to go on", note: "No single cause for the turn was established then, and none has been since. A fall without an agreed reason is hard to judge." },
        ],
      },
      {
        at: 6,
        known: "The United States economy was in recession from March to November 2001. Accounting scandals have come to light at several large listed companies, and in July 2002 Congress passes the Sarbanes–Oxley Act. The Nasdaq stands far below its level of March 2000.",
        ask: "More than two years into the fall, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "After more than two years of falling prices, holding was a view that most of the damage was done. The index fell further, to 1,114.11 on 9 October 2002, and then stopped falling. More scandals, or a second recession, were live possibilities that summer." },
          { label: "Sell part", note: "Selling in July 2002 avoided the last part of the fall to October. It also meant being out when the index turned, unless the seller chose to come back, which is a second decision as hard as the first." },
          { label: "Not enough to go on", note: "How many more companies’ accounts could not be trusted was exactly what nobody knew. The Act was a response to that doubt, not an answer to it." },
        ],
      },
    ],
    terms: ["index", "volatility", "interest-rate", "recession", "liquidity"],
    faq: [
      { q: "When did the dot-com bubble burst?", a: "The Nasdaq Composite index reached its peak close of 5,048.62 on 10 March 2000 and fell heavily in April 2000. The decline continued for two and a half years, to a low of 1,114.11 on 9 October 2002." },
      { q: "How far did the Nasdaq fall after 2000?", a: "From its peak close on 10 March 2000 to its low on 9 October 2002 the Nasdaq Composite fell about 78%. It did not close above the 2000 peak again until April 2015." },
      { q: "What caused the dot-com bubble?", a: "A real technological change whose winners could not yet be known, plentiful money for new companies, flotations of firms without profits, share research written by the banks selling the shares, and the pull of prices that had already risen. There is no agreed single cause of the peak or of the turn." },
    ],
  },
  {
    slug: "global-financial-crisis-2008",
    name: "The global financial crisis",
    title: "The global financial crisis of 2008: timeline and what changed",
    description: "The 2008 financial crisis explained: from falling US house prices and the freeze of August 2007 to the bankruptcy of Lehman Brothers on 15 September 2008, the rescues that followed, and the rules written afterwards.",
    year: 2008,
    span: "2007 to 2009",
    place: "United States, then worldwide",
    line: "Losses on American mortgages freeze lending between banks; Lehman Brothers fails on 15 September 2008.",
    is: "Between the summer of 2007 and the spring of 2009, losses on American home loans spread through the world’s banks. Lending between banks froze, several of the largest financial firms failed or were rescued, and governments and central banks intervened on a scale not seen before. The bankruptcy of Lehman Brothers on 15 September 2008 was the turning point.",
    shape: "a share index across the two years",
    start: 84,
    before: [
      "In the early 2000s interest rates were low and house prices in the United States rose year after year. Lenders made more loans to borrowers with weak credit, known as subprime mortgages, often on terms that depended on the house continuing to rise in value.",
      "Those loans did not stay with the lenders. They were pooled and turned into securities, which were divided, repackaged and sold to banks and funds around the world, many with the highest credit ratings. Banks held large amounts of them, financed with short-term borrowing and with little capital behind them. Insurance against their default was sold in the form of credit derivatives.",
      "The system depended on house prices not falling across the whole country at once. From 2006 they did. Nobody could readily tell which institutions held the losses, and so lenders became unwilling to lend to any of them.",
    ],
    events: [
      { when: "2006–2007", level: 88, text: "House prices in the United States stop rising and begin to fall. Defaults on subprime mortgages climb, and specialist lenders start to fail." },
      { when: "9 Aug 2007", level: 84, text: "The French bank BNP Paribas suspends three funds, saying it cannot value their mortgage securities. Lending between banks seizes up and central banks supply emergency cash." },
      { when: "14 Sept 2007", level: 86, text: "The Bank of England gives emergency support to Northern Rock. Depositors queue to withdraw their money, the first run on a British bank in more than a century. The bank is nationalised in February 2008." },
      { when: "March 2008", level: 70, text: "The investment bank Bear Stearns runs out of funding and is sold to JPMorgan Chase, with financing from the Federal Reserve Bank of New York." },
      { when: "7 Sept 2008", level: 62, text: "The United States government takes control of Fannie Mae and Freddie Mac, the two companies that stand behind much of the American mortgage market." },
      { when: "15 Sept 2008", level: 52, text: "Lehman Brothers files for bankruptcy, the largest filing in United States history. On the same day Merrill Lynch agrees to be bought by Bank of America." },
      { when: "16 Sept 2008", level: 48, text: "The Federal Reserve lends $85 billion to the insurer AIG. A large money-market fund’s share value falls below one dollar, and investors begin to withdraw from such funds." },
      { when: "29 Sept–3 Oct", level: 38, text: "The House of Representatives rejects the rescue bill on 29 September and the Dow falls 777 points, then its largest one-day points fall. A revised bill creating a $700 billion programme becomes law on 3 October." },
      { when: "8 Oct 2008", level: 28, text: "Six central banks, including the Federal Reserve, the European Central Bank and the Bank of England, cut interest rates together by half a percentage point. The British government announces a plan to put public capital into its banks." },
      { when: "9 March 2009", level: 8, text: "The S&P 500 closes at 676.53, its low, about 57% below its peak of October 2007. By then central banks have cut rates close to zero and begun buying bonds." },
    ],
    after: [
      "Banks are required to hold more capital and more liquid assets. The international standards known as Basel III were agreed in 2010, and regular stress tests of large banks became routine.",
      "In the United States the Dodd–Frank Act became law in July 2010. Among much else it moved many derivatives on to central clearing and limited banks’ trading on their own account.",
      "The Financial Stability Board was set up in 2009 to co-ordinate financial regulation between countries.",
      "In the United Kingdom the Financial Services Authority was replaced in 2013 by the Financial Conduct Authority and the Prudential Regulation Authority, and the Bank of England was given responsibility for financial stability.",
      "Central banks cut interest rates close to zero and bought bonds in large quantities, a policy known as quantitative easing. The Bank of England’s rate reached 0.5% in March 2009.",
    ],
    takeaways: [
      "The losses on the mortgages were large; the damage was far larger, because nobody knew where the losses sat. Uncertainty about who is safe stops lending to everyone.",
      "A firm financed by overnight borrowing has to be trusted again every day. Bear Stearns and Lehman Brothers did not fail slowly: their funding left within days.",
      "A high credit rating was a statement about a model’s assumptions. When house prices fell everywhere at once, the assumption failed for all the securities together.",
      "Things that seemed unconnected fell together, because the same institutions held them and had to sell whatever they could. In a crisis, what is owned by whom matters more than what the assets are.",
    ],
    caution:
      "The dates and the official actions are a matter of public record. The causes are weighted differently by different inquiries: lending standards, securitisation, credit ratings, bank leverage, regulation, monetary policy and global flows of savings each have their advocates, and the official United States inquiry itself did not reach a unanimous view. Whether Lehman Brothers could or should have been rescued is still argued over. Estimates of the total cost vary widely with what is counted and are not given here.",
    sources: "Central bank histories, including the Federal Reserve’s and the Bank of England’s, the report of the United States Financial Crisis Inquiry Commission, and the public record of legislation.",
    documents: [
      { title: "The Financial Crisis Inquiry Report", by: "National Commission on the Causes of the Financial and Economic Crisis in the United States", date: "January 2011", supports: "The official United States account of the causes. It was published with dissenting statements, which is why this page says the inquiry was not unanimous." },
      { title: "Press release on the temporary suspension of three funds", by: "BNP Paribas Investment Partners", date: "9 August 2007", supports: "The suspension of three funds whose mortgage securities the bank said it could not value." },
      { title: "Press release on lending to American International Group", by: "Board of Governors of the Federal Reserve System", date: "16 September 2008", supports: "The authorisation for the Federal Reserve Bank of New York to lend up to $85 billion to AIG." },
      { title: "Emergency Economic Stabilization Act of 2008", by: "United States Congress", date: "3 October 2008", supports: "The $700 billion programme created by the revised rescue bill." },
      { title: "Basel III: A global regulatory framework for more resilient banks and banking systems", by: "Basel Committee on Banking Supervision", date: "December 2010", supports: "The higher capital and liquidity requirements for banks agreed after the crisis." },
    ],
    seat: "Suppose someone holds a broad fund of shares.",
    junctures: [
      {
        at: 1,
        known: "House prices in the United States have stopped rising and begun to fall, defaults on subprime mortgages are climbing and specialist lenders have started to fail. On 9 August 2007 the French bank BNP Paribas suspends three funds, saying it cannot value their mortgage securities. Lending between banks seizes up and central banks supply emergency cash.",
        ask: "In August 2007, what would such a holder do?",
        choices: [
          { label: "Hold the fund", note: "Central banks had acted at once, and the losses appeared to sit in one part of one country’s mortgage market. Holding was a view that they would stay there. Share prices went on to a peak in October 2007. Which institutions held the losses was not known." },
          { label: "Sell part", note: "Selling part in August 2007 was early by more than a year, and for some months it looked mistaken as shares rose. It left less exposed to 2008. Had the problem proved as contained as it first looked, it would simply have been an exit before a rise." },
          { label: "Not enough to go on", note: "A bank saying that it could not value its own funds was information of an unusual kind. What it implied for other banks was the open question." },
        ],
      },
      {
        at: 3,
        known: "Northern Rock has been supported by the Bank of England and then, in February 2008, nationalised. In March 2008 the investment bank Bear Stearns runs out of funding and is sold to JPMorgan Chase, with financing from the Federal Reserve Bank of New York.",
        ask: "After the sale of Bear Stearns, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "A large firm had run out of funding and the authorities had arranged its sale within days. Holding could rest on that: it suggested that failures would be managed. Six months later Lehman Brothers was not rescued, which could not be known in March." },
          { label: "Sell part", note: "Selling after Bear Stearns meant selling below the previous autumn’s prices. It left less exposed to September. Had the sale of Bear Stearns marked the turn, it would have been a sale near the low." },
          { label: "Not enough to go on", note: "The rescue showed what the authorities would do for one firm. It did not say whether they would, or could, do it for the next." },
        ],
      },
      {
        at: 5,
        known: "The United States government took control of Fannie Mae and Freddie Mac on 7 September. On 15 September Lehman Brothers files for bankruptcy, the largest filing in United States history. On the same day Merrill Lynch agrees to be bought by Bank of America.",
        ask: "On the day of the bankruptcy, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "A large firm had been allowed to fail, and it was not yet clear what that would do to the rest. Holding was a view that the system would absorb it, or that governments would now act. They did act: the next day the Federal Reserve lent $85 billion to AIG. Whether that would be enough was unknown." },
          { label: "Sell part", note: "Selling that week was into a falling market, with funding leaving firms within days. It left less exposed to what followed. A swift and general rescue was possible that week, and would have made it a sale at the worst moment." },
          { label: "Not enough to go on", note: "Nobody knew who was owed what by Lehman Brothers. That uncertainty, more than the losses themselves, is what stops lending." },
        ],
      },
      {
        at: 8,
        known: "The Federal Reserve has lent $85 billion to AIG. The House of Representatives rejected the rescue bill on 29 September, when the Dow fell 777 points, and a revised bill creating a $700 billion programme became law on 3 October. On 8 October six central banks cut interest rates together by half a percentage point, and the British government announces a plan to put public capital into its banks.",
        ask: "With governments and central banks now acting together, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "Governments and central banks were acting on a scale not seen before. Holding was a view that this would be enough. The S&P 500 went on falling to 676.53 on 9 March 2009, and then turned. The measures could have worked at once, or failed altogether." },
          { label: "Sell part", note: "Selling in October 2008 avoided the further fall to March 2009, at prices already far below 2007. It also left the seller out at the low unless they came back, which is a separate decision and no easier." },
          { label: "Not enough to go on", note: "Whether public money would restore trust between banks had not been tested on this scale. There was no close precedent to point to." },
        ],
      },
    ],
    terms: ["leverage", "liquidity", "central-bank", "monetary-policy", "recession", "derivative", "index"],
    faq: [
      { q: "What caused the 2008 financial crisis?", a: "The immediate cause was a fall in United States house prices, which produced losses on mortgage loans that had been packaged into securities and sold to banks worldwide. Banks held those securities with little capital and short-term funding, so the losses turned into a general loss of trust between banks. Inquiries differ on how to weigh lending standards, ratings, regulation and other factors." },
      { q: "When did Lehman Brothers collapse?", a: "Lehman Brothers filed for bankruptcy on 15 September 2008. It was the largest bankruptcy filing in United States history and marked the most acute phase of the crisis." },
      { q: "What rules changed after the 2008 crisis?", a: "Banks were required to hold more capital and liquid assets under the Basel III standards, large banks face regular stress tests, and many derivatives must now pass through central clearing. The United States passed the Dodd–Frank Act in July 2010, and the United Kingdom replaced its regulator with the Financial Conduct Authority and the Prudential Regulation Authority in 2013." },
    ],
  },
  {
    slug: "flash-crash-2010",
    name: "The flash crash",
    title: "The flash crash of 6 May 2010: what happened minute by minute",
    description: "The flash crash explained: on the afternoon of 6 May 2010 US share prices fell and recovered within about twenty minutes, with the Dow briefly nearly 1,000 points down. The timeline from the official report, and the rules that followed.",
    year: 2010,
    span: "6 May 2010",
    place: "Chicago and New York",
    line: "US share prices fall and recover within minutes, and some shares trade for a penny.",
    is: "On the afternoon of Thursday 6 May 2010, prices in United States share and futures markets fell steeply and recovered within about twenty minutes. At the worst point the Dow Jones Industrial Average was nearly 1,000 points below the previous day’s close. Some individual shares traded for a penny. The two market regulators published a joint account of the day that September.",
    shape: "a share index over one afternoon",
    start: 74,
    before: [
      "The day began badly. Markets were worried about the debts of the Greek government and the stability of the euro, and share prices had been falling since the morning. Volatility was high, and by early afternoon those who supply prices to the market were quoting in smaller sizes.",
      "By 2010 most trading in United States shares was done by computer programs, across many competing exchanges and trading venues. Firms using fast automated strategies supplied much of the buying and selling interest from moment to moment, but they were under no obligation to stay when conditions turned.",
      "The most heavily traded contract on the American share market was the E-mini, a futures contract on the S&P 500 index traded in Chicago. What happened to its price was passed to the shares themselves within moments.",
    ],
    events: [
      { when: "6 May, morning", level: 66, text: "Worries about Greek government debt weigh on markets. Share prices fall through the day and the supply of buy and sell orders thins." },
      { when: "2:32 pm", level: 60, text: "A large investment firm starts a computer program to sell 75,000 E-mini futures contracts. The program is set to follow the volume of trading, without regard to price or time." },
      { when: "2:41–2:44 pm", level: 38, text: "Fast-trading firms that had bought from the program sell in turn. Contracts pass rapidly between them with few outside buyers, and the E-mini price falls quickly." },
      { when: "2:45:28 pm", level: 22, text: "A safeguard on the Chicago exchange pauses E-mini trading for five seconds. When trading resumes the price steadies and begins to rise." },
      { when: "2:45–3:00 pm", level: 36, text: "In the share market many firms withdraw. Some shares and exchange-traded funds trade at a penny, and others at $100,000. The Dow is at one point nearly 1,000 points below the previous close." },
      { when: "About 3:00 pm", level: 58, text: "Most prices are back near their levels of half an hour earlier. The Dow ends the day about 3% lower." },
      { when: "6 May, evening", level: 60, text: "The exchanges agree to cancel trades made at prices more than 60% away from their level just before the fall: more than 20,000 trades." },
      { when: "June 2010", level: 62, text: "Trading pauses for individual shares are introduced as a pilot: a share that moves too far in a few minutes is halted briefly." },
      { when: "30 Sept 2010", level: 62, text: "The staffs of the two regulators, the Commodity Futures Trading Commission and the Securities and Exchange Commission, publish their joint report on the day." },
      { when: "April 2013", level: 62, text: "The “limit up, limit down” mechanism begins to replace the pilot, and revised market-wide circuit breakers take effect, set at falls of 7%, 13% and 20% in the S&P 500." },
    ],
    after: [
      "Trading pauses for single shares were introduced within weeks, and were replaced from April 2013 by the “limit up, limit down” mechanism, which prevents trades outside a moving band around a share’s recent price.",
      "“Stub quotes”, the placeholder quotations at absurd prices that had produced the penny trades, were banned.",
      "The market-wide circuit breakers were revised: they are now triggered by falls of 7%, 13% and 20% in the S&P 500 index.",
      "Clearer rules were written for cancelling trades made at clearly erroneous prices, and regulators began building a single record of all orders across American share markets.",
    ],
    takeaways: [
      "A great deal of trading is not the same as a deep market. Volume was very high during the fall, yet there were almost no real buyers; the same contracts were passing back and forth.",
      "A market order is filled at whatever price is available. During those minutes the available price for some shares was a penny, and orders were filled there.",
      "A stop order becomes a market order once its level is reached. In a market that is gapping, the price at which it is filled can be far from the level that was set.",
      "Those who supply prices in normal times can stop. Liquidity that is offered voluntarily is withdrawn when it is most needed.",
      "A pause of five seconds was enough to break the fall in the futures market. Much of the rule-making that followed is built on that observation.",
    ],
    caution:
      "The times, the size of the sell program and the count of cancelled trades come from the regulators’ joint report. All times are Eastern Time. The report’s emphasis on the one large sell order has been challenged by other studies, which give more weight to the fragile state of the market that afternoon and to the behaviour of fast-trading firms. In 2015 the American authorities also brought a case against an individual trader for placing and cancelling orders to mislead the market; how much that contributed on the day is disputed.",
    sources: "The joint report of the staffs of the Commodity Futures Trading Commission and the Securities and Exchange Commission, published on 30 September 2010, and the regulators’ later rule filings.",
    documents: [
      { title: "Findings Regarding the Market Events of May 6, 2010", by: "The staffs of the Commodity Futures Trading Commission and the Securities and Exchange Commission, reporting to the Joint Advisory Committee on Emerging Regulatory Issues", date: "30 September 2010", supports: "The times, the 75,000-contract sell program, the five-second pause and the count of cancelled trades." },
      { title: "Preliminary Findings Regarding the Market Events of May 6, 2010", by: "The same two staffs", date: "18 May 2010", supports: "The regulators’ first account of the day, published twelve days after it." },
      { title: "Recommendations Regarding Regulatory Responses to the Market Events of May 6, 2010", by: "Joint CFTC-SEC Advisory Committee on Emerging Regulatory Issues", date: "18 February 2011", supports: "The advisory committee’s proposals for changes to the rules after the event." },
      { title: "The Flash Crash: High-Frequency Trading in an Electronic Market", by: "Andrei Kirilenko, Albert S. Kyle, Mehrdad Samadi and Tugkan Tuzun, in the Journal of Finance", date: "2017", supports: "A later study of how fast-trading firms behaved during the fall, one of those that weigh the day differently from the joint report." },
    ],
    seat: "Suppose someone holds American shares, with a stop order resting some way below the market.",
    junctures: [
      {
        at: 0,
        known: "It is the early afternoon of 6 May. Markets are worried about the debts of the Greek government and the stability of the euro. Share prices have fallen through the day, volatility is high, and those who supply prices are quoting in smaller sizes.",
        ask: "On a nervous afternoon, what would such a holder do with the stop order?",
        choices: [
          { label: "Leave the stop in place", note: "A stop is placed for a day like this, and leaving it was consistent. Once its level is reached it becomes a market order, filled at whatever price exists. On an ordinary bad afternoon that price is near the level set." },
          { label: "Cancel the stop and hold", note: "Cancelling removed the chance of being sold in a thin market at a poor price. It also removed the protection on a day when the news was bad and could have got worse: a lasting fall would then have run with nothing to limit it." },
          { label: "Not enough to go on", note: "It was a nervous day of a familiar kind. Nothing visible set it apart from other nervous days." },
        ],
        next: { when: "2:32 to 2:44 pm", to: 2, text: "At 2:32 pm a large investment firm starts a computer program to sell 75,000 E-mini futures contracts. Nobody outside knew that at the time: it became public in the regulators’ report that September. What could be seen was the price, which fell quickly from about 2:41 pm." },
      },
      {
        at: 2,
        known: "It is about 2:44 pm. The price of the E-mini futures contract has fallen quickly in the last few minutes and share prices are following. No news has been published that explains it.",
        ask: "With prices falling fast and no explanation, what would the holder do?",
        choices: [
          { label: "Leave the stop in place", note: "A stop reached in those minutes did what it was set to do: it sold, at whatever price was there. For some shares that price was soon a penny. That evening trades more than 60% away from the earlier level were cancelled; trades inside that limit stood, however unfavourable." },
          { label: "Cancel the stop and hold", note: "Holding without a stop meant sitting through a fall with no known cause. Most prices were back near their earlier levels by about 3:00 pm. Had the fall been the first sign of news not yet published, nothing would have limited the loss." },
          { label: "Not enough to go on", note: "There was no public explanation. A fall without news can be a fault in the market, or news that has not yet arrived, and the two look alike while it is happening." },
        ],
      },
      {
        at: 4,
        known: "E-mini trading was paused for five seconds at 2:45 pm and the futures price has steadied. In the share market many firms have withdrawn. Some shares and exchange-traded funds are trading at a penny and others at $100,000, and the Dow has been nearly 1,000 points below the previous close.",
        ask: "For a holder who still has the shares, what now?",
        choices: [
          { label: "Hold and send no order", note: "Sending no order kept the holder out of prices that plainly made no sense. Most prices were back near their earlier levels by about 3:00 pm, and the Dow ended the day about 3% lower. Nobody watching at 2:50 pm could be sure they would come back." },
          { label: "Sell at the market", note: "A market order in those minutes was filled at whatever price was there, and for some shares that was a penny. Whether such a trade would later be cancelled was settled that evening, by a threshold nobody knew in advance. Had the fall been lasting, selling would have been the cautious act." },
          { label: "Not enough to go on", note: "Prices of a penny and of $100,000 said nothing about the companies. They said that the market had stopped working, and nobody could say for how long." },
        ],
      },
    ],
    terms: ["liquidity", "slippage", "stop-loss", "volatility", "futures", "index", "gap", "liquidity-provider"],
    faq: [
      { q: "What caused the flash crash of 2010?", a: "The regulators’ joint report traced it to a large automated order to sell 75,000 E-mini S&P 500 futures contracts, begun at 2:32 pm Eastern Time in an already nervous market, and to the reaction of fast-trading firms, which first bought and then sold on. Other studies give more weight to the thin state of the market that afternoon. The causes are still debated." },
      { q: "How long did the flash crash last?", a: "The steep fall and most of the recovery took about twenty minutes, from roughly 2:40 pm to 3:00 pm Eastern Time on 6 May 2010. The futures price turned after a five-second trading pause at 2:45 pm." },
      { q: "Were trades during the flash crash cancelled?", a: "Yes. That evening the exchanges agreed to cancel trades made at prices more than 60% away from their level just before the fall. More than 20,000 trades were cancelled. Trades at prices within that limit stood, however unfavourable." },
    ],
  },
  {
    slug: "swiss-franc-2015",
    name: "The Swiss franc move",
    title: "The Swiss franc shock of 15 January 2015: when the SNB removed the floor",
    description: "The Swiss franc move explained: on 15 January 2015 the Swiss National Bank removed its minimum exchange rate of 1.20 francs to the euro without warning. What led up to it, what happened in the minutes after, and what changed for retail traders.",
    year: 2015,
    span: "2011 to 2018",
    place: "Zurich",
    line: "The Swiss National Bank removes its 1.20 floor against the euro without warning.",
    is: "For more than three years the Swiss National Bank had promised not to let the euro fall below 1.20 Swiss francs. At 10:30 in the morning, Zurich time, on Thursday 15 January 2015, it withdrew that promise without warning. The franc rose against the euro within minutes by an amount that currencies of large economies seldom move in a year.",
    shape: "the euro against the Swiss franc",
    start: 62,
    before: [
      "The Swiss franc is a currency people buy when they are worried. During the euro area’s debt crisis of 2010 and 2011 money moved into francs, and by August 2011 the euro had fallen close to one franc. That made Swiss exports expensive and threatened to push prices in Switzerland down.",
      "On 6 September 2011 the Swiss National Bank set a minimum exchange rate of 1.20 francs to the euro and said it was prepared to buy foreign currency in unlimited quantities to enforce it. A central bank can always create its own currency to sell, so a floor of this kind is, in principle, one it can hold.",
      "Holding it had a cost. The bank accumulated very large foreign currency reserves. By late 2014 the European Central Bank was expected to begin buying government bonds, which would weaken the euro further and require still larger purchases. In December 2014 the Swiss National Bank announced a negative interest rate on bank deposits held with it. In the days before 15 January its officials were still publicly describing the floor as central to policy.",
    ],
    events: [
      { when: "August 2011", level: 30, text: "With the euro area’s debt crisis at its height, the euro falls close to one Swiss franc." },
      { when: "6 Sept 2011", level: 62, text: "The Swiss National Bank sets a minimum exchange rate of 1.20 francs to the euro and says it will buy foreign currency in unlimited quantities to hold it." },
      { when: "2012–2014", level: 62, text: "The floor holds. The rate sits a little above 1.20 for long periods, and the bank’s foreign currency reserves grow very large." },
      { when: "18 Dec 2014", level: 61, text: "The Swiss National Bank announces an interest rate of −0.25% on deposits that banks hold with it, to discourage holding francs." },
      { when: "Early Jan 2015", level: 61, text: "Markets expect the European Central Bank to announce bond purchases. Swiss National Bank officials publicly reaffirm the floor." },
      { when: "15 Jan, 10:30", level: 60, text: "The Swiss National Bank announces that it is discontinuing the minimum exchange rate, and lowers its deposit rate to −0.75%." },
      { when: "Minutes later", level: 8, text: "The euro falls far below 1.20 francs. For a time there are almost no prices at all. Orders to sell at set levels are filled far from those levels, or not filled." },
      { when: "The days after", level: 26, text: "The rate settles around one franc to the euro. Several retail currency brokers become insolvent or need rescue, and some clients are left owing more than they had deposited." },
      { when: "22 Jan 2015", level: 24, text: "The European Central Bank announces its programme of government bond purchases." },
      { when: "1 Aug 2018", level: 24, text: "European rules for retail contracts for difference take effect, including protection against negative balances and leverage limits of 30:1 on major currency pairs." },
    ],
    after: [
      "The losses at retail brokers, and the clients left with debts, strengthened the case for protection against negative balances. Measures from the European Securities and Markets Authority that took effect on 1 August 2018 required it for retail clients trading contracts for difference in the European Union, alongside leverage limits and a standard margin close-out rule.",
      "Brokers and banks raised margin requirements on the franc and on other currencies whose rates were managed by a central bank.",
      "Borrowers outside Switzerland who held mortgages in francs, common in parts of central and eastern Europe, saw their debts rise overnight. Some governments later passed measures to deal with those loans.",
      "The Swiss National Bank continued to intervene in the currency market at its own discretion and kept negative interest rates for several years.",
    ],
    takeaways: [
      "A managed rate is a policy, and a policy can be changed in one announcement. The long calm above 1.20 was evidence of the bank’s commitment at the time, not of the currency’s stability.",
      "A central bank that intends to end such a policy cannot say so in advance, because the announcement would bring on the move at once. Reassurance shortly beforehand is therefore not evidence either way.",
      "A stop order is an instruction, not a guarantee. When no one is quoting a price, it is filled at the next price that exists, which on that morning was far away.",
      "With leverage, a move of that size can exceed the whole deposit. That is the plain arithmetic behind negative balances, and the reason rules on them were written afterwards.",
      "Low recent volatility in a pegged or floored rate describes the peg. It says little about what the rate does without one.",
    ],
    caution:
      "The dates, the 1.20 minimum rate and the interest rates are from the Swiss National Bank’s own announcements. How far the euro fell at the extreme is uncertain: so few trades took place in the first minutes that different banks and platforms recorded different lows, and no figure is given here. Accounts of individual brokers’ losses are left out; the general outcome is a matter of record.",
    sources: "The Swiss National Bank’s press releases of 6 September 2011, 18 December 2014 and 15 January 2015, the European Securities and Markets Authority’s published measures of 2018, and contemporary newspaper reports.",
    documents: [
      { title: "Swiss National Bank sets minimum exchange rate at CHF 1.20 per euro", by: "Swiss National Bank (press release)", date: "6 September 2011", supports: "The minimum rate of 1.20 and the statement that the bank was prepared to buy foreign currency in unlimited quantities." },
      { title: "Swiss National Bank introduces negative interest rates", by: "Swiss National Bank (press release)", date: "18 December 2014", supports: "The interest rate of −0.25% on deposits that banks hold with it." },
      { title: "Swiss National Bank discontinues minimum exchange rate and lowers interest rate to –0.75%", by: "Swiss National Bank (press release)", date: "15 January 2015", supports: "The end of the minimum rate and the cut in the deposit rate, announced together." },
      { title: "ECB announces expanded asset purchase programme", by: "European Central Bank (press release)", date: "22 January 2015", supports: "The programme of government bond purchases announced a week later." },
      { title: "Decision (EU) 2018/796 of the European Securities and Markets Authority", by: "European Securities and Markets Authority", date: "22 May 2018", supports: "The restrictions on contracts for difference for retail clients that applied from 1 August 2018: leverage limits, a margin close-out rule and protection against negative balances." },
    ],
    seat: "Suppose someone holds euros against Swiss francs a little above 1.20, with leverage, and a stop order just below 1.20.",
    junctures: [
      {
        at: 2,
        known: "Since 6 September 2011 the Swiss National Bank has set a minimum exchange rate of 1.20 francs to the euro, and has said it will buy foreign currency in unlimited quantities to hold it. The floor has held. The rate sits a little above 1.20 for long periods, and the bank’s foreign currency reserves have grown very large.",
        ask: "With the floor holding year after year, what would such a holder do?",
        choices: [
          { label: "Hold the position", note: "A central bank can always create its own currency to sell, so this was a floor it could hold, and it had held it for years. Holding the position was a view that the policy would continue. The risk was not the market breaking the floor; it was the bank choosing to end it." },
          { label: "Reduce the leverage", note: "A smaller position, or less leverage, lowered what a change of policy could cost, and lowered what the position earned while the floor stood. For three years that was caution with no visible reward." },
          { label: "Not enough to go on", note: "The calm above 1.20 described the policy. What the rate would be without the policy could not be observed while the policy was in force." },
        ],
      },
      {
        at: 3,
        known: "The floor has held for more than three years. On 18 December 2014 the Swiss National Bank announces an interest rate of −0.25% on deposits that banks hold with it, to discourage holding francs. Markets expect the European Central Bank to begin buying government bonds, which would weaken the euro.",
        ask: "After the negative rate is announced, what would the holder do?",
        choices: [
          { label: "Hold the position", note: "A negative rate was a new measure taken in defence of the floor, and could be read as renewed commitment. Holding rested on that reading. The same step could be read as a sign that holding the floor was becoming harder." },
          { label: "Reduce the leverage", note: "Reducing after the December announcement lowered the exposure four weeks before the floor went. Nothing in the announcement said the floor would go. Had it stood for another year, this would have been caution with a cost." },
          { label: "Not enough to go on", note: "One announcement supported two opposite readings. The public record did not choose between them." },
        ],
      },
      {
        at: 4,
        known: "It is early January 2015. Markets expect the European Central Bank to announce bond purchases. Swiss National Bank officials publicly reaffirm the floor.",
        ask: "After that reassurance, what would the holder do?",
        choices: [
          { label: "Hold the position", note: "Officials had just restated the policy in public, and holding took them at their word, as there was every ordinary reason to do. A bank that intends to end such a floor cannot say so beforehand, so the reassurance was not evidence either way." },
          { label: "Reduce the leverage", note: "Reducing against a fresh official reassurance needed a reason that was not in the public record. With leverage, the move that came exceeded many deposits, and stop orders were filled far from their levels or not filled. Had the floor stood, the reduction would have changed nothing but the return." },
          { label: "Not enough to go on", note: "It could not be known. The decision was made without warning because any warning would itself have ended the floor." },
        ],
        next: { when: "15 Jan 2015, 10:30", to: 6, text: "The Swiss National Bank announces that it is discontinuing the minimum exchange rate, and lowers its deposit rate to −0.75%. Within minutes the euro falls far below 1.20 francs, and for a time there are almost no prices at all." },
      },
    ],
    terms: ["safe-haven", "central-bank", "negative-balance", "leverage", "stop-loss", "slippage", "gap", "stop-out", "liquidity"],
    faq: [
      { q: "What happened to the Swiss franc on 15 January 2015?", a: "At 10:30 am Zurich time the Swiss National Bank announced that it was ending its minimum exchange rate of 1.20 francs to the euro, in place since 6 September 2011, and cut its deposit rate to −0.75%. The franc rose very sharply against the euro and other currencies within minutes." },
      { q: "Why did the Swiss National Bank remove the 1.20 floor?", a: "The bank said the minimum rate had been an exceptional and temporary measure and was no longer justified. Holding it had required buying very large amounts of foreign currency, and expected bond purchases by the European Central Bank would have required more. The decision was made without warning because any warning would itself have ended the floor." },
      { q: "Why did some traders lose more than their deposit?", a: "Positions in the franc were often held with leverage, and for some minutes almost no prices were quoted. Orders meant to limit losses were filled at the first available price, far beyond the level set. Where the loss was larger than the money in the account, the account went negative. Rules requiring protection against that for retail clients in the European Union came in 2018." },
    ],
  },
  {
    slug: "pandemic-crash-2020",
    name: "The pandemic crash",
    title: "The pandemic crash of 2020: the timeline of February and March",
    description: "The 2020 stock market crash explained: from the S&P 500’s record close on 19 February 2020 to its low on 23 March, about 34% lower, with four circuit-breaker halts, emergency central bank action and a negative oil price in April.",
    year: 2020,
    span: "February to August 2020",
    place: "Worldwide",
    line: "Share markets fall by about a third in a month, circuit breakers trip four times, and oil trades below zero.",
    is: "In February and March 2020, as the Covid-19 pandemic spread and countries shut down, share markets around the world fell day after day. The S&P 500 fell about 34% in just over a month. Central banks and governments responded within weeks, and by August the index was at a new record.",
    shape: "a share index from February to August",
    start: 90,
    before: [
      "Share markets began 2020 near record levels after a long rise. A new coronavirus had been identified in China at the turn of the year, but until late February markets treated it mainly as a regional problem.",
      "That changed when large outbreaks appeared in Italy, Iran and South Korea. It became clear that the virus would spread widely and that governments would close large parts of their economies to slow it. Nobody had a model for that: the question was not how much profits would fall but how long whole industries would have no revenue at all.",
      "Many funds and companies responded by trying to raise cash at the same moment. In March that produced strain even in the market for United States government bonds, normally the easiest of all assets to sell.",
    ],
    events: [
      { when: "19 Feb 2020", level: 96, text: "The S&P 500 closes at a record high." },
      { when: "24–28 Feb 2020", level: 78, text: "Outbreaks in Italy and elsewhere show the virus spreading beyond Asia. United States shares have their worst week since 2008." },
      { when: "3 March 2020", level: 74, text: "The Federal Reserve cuts interest rates by half a percentage point at an unscheduled meeting." },
      { when: "9 March 2020", level: 58, text: "The oil price falls steeply after talks between oil-producing countries break down. In New York a market-wide circuit breaker halts trading, for the first time since 1997." },
      { when: "11–12 March 2020", level: 44, text: "The World Health Organization declares a pandemic on 11 March. On 12 March trading in New York is halted again." },
      { when: "15–16 March 2020", level: 30, text: "On Sunday the Federal Reserve cuts rates to a range of 0% to 0.25% and announces bond purchases. On Monday trading is halted a third time and the Dow falls 12.9%, its largest one-day percentage fall since 1987." },
      { when: "23 March 2020", level: 16, text: "The S&P 500 closes at its low, about 34% below the February peak. The Federal Reserve announces that its bond purchases will have no set limit, and new lending programmes." },
      { when: "27 March 2020", level: 32, text: "The United States enacts the CARES Act, a relief package of about $2.2 trillion." },
      { when: "20 April 2020", level: 46, text: "With storage almost full, the expiring futures contract for American crude oil settles at −$37.63 a barrel: sellers pay buyers to take delivery." },
      { when: "18 Aug 2020", level: 97, text: "The S&P 500 closes at a new record, six months after the last one." },
    ],
    after: [
      "The circuit breakers written after 1987 and revised after 2010 were used four times in eight trading days, on 9, 12, 16 and 18 March, and worked as designed.",
      "Central banks acted faster and on a larger scale than in 2008. The Federal Reserve cut rates to near zero, bought bonds without a set limit and reopened dollar swap lines with other central banks. The Bank of England cut its rate to 0.1% on 19 March.",
      "The strain in government bond markets and the withdrawals from money-market funds in March 2020 were examined by the Financial Stability Board and national regulators. The United States adopted further reforms of money-market funds in 2023.",
      "Exchanges and brokers revised their systems and rules to allow for negative prices in commodity futures.",
    ],
    takeaways: [
      "The speed was new. Falls that took months in 2008 took days in 2020, and the recovery in the index was as fast. Neither pace could have been known in advance.",
      "When everyone wants cash at once, even the safest assets are hard to sell. In March 2020 things that normally move in opposite directions fell together for a time.",
      "A futures contract is an obligation to deliver or take delivery. The negative oil price was the cost of having to accept oil with nowhere to put it, and it applied to one expiring contract on one day.",
      "A circuit breaker pauses trading; it does not set a floor. Prices went on falling after each of the first three halts.",
      "The index recovering in six months does not mean every share, sector or account did. An average hides the things that did not come back.",
    ],
    caution:
      "The dates, the central bank decisions and the circuit-breaker halts are a matter of public record, as is the oil settlement price of 20 April 2020. The index figures are the published closing levels of the S&P 500 and the Dow Jones Industrial Average. How much of the recovery was owed to central bank action, to government spending or to the outlook for the virus itself is a matter of judgement, and economists weigh them differently.",
    sources: "Federal Reserve and Bank of England announcements, the World Health Organization’s published timeline, the Financial Stability Board’s review of the March 2020 market turmoil, and exchange records.",
    documents: [
      { title: "Statements of the Federal Open Market Committee", by: "Federal Reserve", date: "3 March and 15 March 2020", supports: "The half-point cut at an unscheduled meeting, and the cut to a range of 0% to 0.25% with bond purchases." },
      { title: "Federal Reserve announces extensive new measures to support the economy", by: "Board of Governors of the Federal Reserve System (press release)", date: "23 March 2020", supports: "Bond purchases with no set limit, and the new lending programmes." },
      { title: "WHO Director-General’s opening remarks at the media briefing on COVID-19", by: "World Health Organization", date: "11 March 2020", supports: "The declaration that the outbreak was a pandemic." },
      { title: "Holistic Review of the March Market Turmoil", by: "Financial Stability Board", date: "17 November 2020", supports: "The strain in government bond markets and the withdrawals from money-market funds in March 2020." },
      { title: "Interim Staff Report: Trading in NYMEX WTI Crude Oil Futures Contract Leading up to, on, and around April 20, 2020", by: "Staff of the Commodity Futures Trading Commission", date: "23 November 2020", supports: "The trading of the expiring crude oil contract on the day it settled below zero." },
    ],
    seat: "Suppose someone holds a broad fund of shares.",
    junctures: [
      {
        at: 1,
        known: "The S&P 500 closed at a record high on 19 February. In the week of 24 to 28 February outbreaks in Italy and elsewhere show the virus spreading beyond Asia, and United States shares have their worst week since 2008.",
        ask: "At the end of that week, what would such a holder do?",
        choices: [
          { label: "Hold the fund", note: "Until that week markets had treated the virus mainly as a regional problem, and it might have remained one. Holding was a view that the week was a scare. Nobody had a model for governments closing large parts of their economies." },
          { label: "Sell part", note: "Selling after the worst week since 2008 meant selling well below the record of nine days before. It left less exposed to March. Had the outbreaks been contained, it would have been a sale into a brief scare." },
          { label: "Not enough to go on", note: "How far the virus would spread and what governments would do about it were questions for doctors and ministers, and neither had answered." },
        ],
      },
      {
        at: 3,
        known: "The Federal Reserve cut interest rates by half a percentage point at an unscheduled meeting on 3 March. On 9 March the oil price falls steeply after talks between oil-producing countries break down, and in New York a market-wide circuit breaker halts trading, for the first time since 1997.",
        ask: "On the day of the first halt, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "The central bank had already acted, and the halt had given the market time to steady. Holding was a view that policy would catch up with events. Prices went on falling after the halt: a circuit breaker pauses trading and does not set a floor." },
          { label: "Sell part", note: "Selling on 9 March was at prices far below February’s and above those of the following week. It also raised the question of when, if ever, to come back, which was no easier to answer." },
          { label: "Not enough to go on", note: "Two shocks had arrived together, one from the virus and one from oil. Nobody could say how long either would last." },
        ],
      },
      {
        at: 5,
        known: "The World Health Organization declared a pandemic on 11 March, and trading in New York was halted again on 12 March. On Sunday 15 March the Federal Reserve cuts rates to a range of 0% to 0.25% and announces bond purchases. On Monday 16 March trading is halted a third time and the Dow falls 12.9%, its largest one-day percentage fall since 1987.",
        ask: "After the largest one-day fall since 1987, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "The central bank had cut rates to near zero and shares had fallen anyway. Holding was a view that prices already allowed for a great deal. The index fell for another week. In 2008 the falls had run on for months after the first rescues, and that was the comparison people had." },
          { label: "Sell part", note: "Selling on 16 March meant selling on the worst day since 1987. It avoided the further fall of the following week. Whole industries had no revenue and no date for its return, so a much longer decline was plausible." },
          { label: "Not enough to go on", note: "Even the market for United States government bonds was under strain that month. When the easiest asset to sell is hard to sell, ordinary reasoning about prices has little to hold on to." },
        ],
        next: { when: "23 March 2020", to: 6, text: "The S&P 500 closes about 34% below its February peak. The Federal Reserve announces that its bond purchases will have no set limit, and new lending programmes." },
      },
      {
        at: 6,
        known: "On 23 March the S&P 500 closes about 34% below its February peak. The Federal Reserve announces that its bond purchases will have no set limit, and new lending programmes. Countries remain shut down.",
        ask: "On 23 March, what would a holder do?",
        choices: [
          { label: "Hold the fund", note: "Holding at this point was a view that policy on this scale would work, or that selling so far down made little sense. The index was at a new record by 18 August. In 2008 the low had come months after the largest rescues, and a second fall was a reasonable fear." },
          { label: "Sell part", note: "Selling on 23 March was, as it turned out, at the lowest close. Nobody could know that on the day: the shutdowns had no end date and the news was still worsening. Had the fall continued, the same sale would be remembered as prudent." },
          { label: "Not enough to go on", note: "The speed of the fall was new, and so was the scale of the response. Neither pace could have been known in advance." },
        ],
        next: { when: "27 March to 18 August 2020", to: 9, text: "The United States enacts the CARES Act on 27 March, a relief package of about $2.2 trillion. The S&P 500 closes at a new record on 18 August, six months after the last one." },
      },
    ],
    terms: ["volatility", "liquidity", "central-bank", "monetary-policy", "futures", "index", "safe-haven", "recession"],
    faq: [
      { q: "How much did the stock market fall in March 2020?", a: "The S&P 500 fell about 34% from its record close on 19 February 2020 to its low on 23 March 2020. On 16 March the Dow Jones Industrial Average fell 12.9%, its largest one-day percentage fall since 1987." },
      { q: "How many times were circuit breakers triggered in 2020?", a: "Four times, on 9, 12, 16 and 18 March 2020. Each was the first-level halt, triggered by a fall of 7% in the S&P 500, which pauses trading for fifteen minutes. Before 2020 a market-wide circuit breaker had been triggered only once, in October 1997." },
      { q: "Why did the oil price go negative in April 2020?", a: "The futures contract for American crude oil for delivery in May 2020 was about to expire, demand had collapsed and storage at the delivery point was nearly full. Holders who could not take delivery had to pay others to take the contracts off their hands. It settled at −$37.63 a barrel on 20 April 2020. Other oil contracts stayed above zero." },
    ],
  },
];

export const getEpisode = (slug: string) => HISTORY.find((e) => e.slug === slug);
