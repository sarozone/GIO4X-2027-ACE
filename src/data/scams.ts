/**
 * SCAM SCHOOL — how common investment frauds work, one page each, and the
 * questions of the "Check this offer" list.
 *
 * A page describes a TYPE of fraud: its steps, why it convinces, the signs,
 * and what people do once it has happened, in general terms. The rule it
 * keeps: no real firm, person, website or product is named, as fraudster or
 * as victim; no historical case is retold; nothing here is legal advice or a
 * promise that money can be got back. Regulators' own warning pages are not
 * linked from here: the site lists them once, at /nice-and-need#safe.
 *
 * To add a page, add an entry and give it an explainer in
 * src/components/scams/ScamExplainer.tsx.
 */
export type ScamKind = "ponzi" | "pyramid" | "pump" | "clone" | "fake-broker" | "signals" | "managed" | "romance" | "recovery" | "phishing" | "advance-fee" | "deepfake";

export type ScamGroup = "money" | "trust" | "approach";

export type Scam = {
  slug: string;
  kind: ScamKind;
  group: ScamGroup;
  /** the short name, for menus and cards */
  name: string;
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  also: readonly string[];
  /** one line for the index card */
  line: string;
  /** what it is, in two or three sentences */
  is: string;
  steps: readonly string[];
  convincing: readonly string[];
  signs: readonly string[];
  /** what applies to this type in particular, shown before the general list */
  after: readonly string[];
  /** the heading over the explainer */
  shows: string;
  faq: readonly { q: string; a: string }[];
};

export const SCAM_GROUPS: readonly { key: ScamGroup; id: string; eyebrow: string; title: string; lead: string }[] = [
  { key: "money", id: "money", eyebrow: "Where the money comes from", title: "Four schemes that pay out other people’s money.", lead: "Each looks like an investment. In each, the only money in the room is what the investors brought with them." },
  { key: "trust", id: "trust", eyebrow: "Borrowed trust", title: "Four ways of looking like someone you can rely on.", lead: "A real firm’s name, a convincing screen, a helpful expert, a friend. The trust is real. What it is attached to is not." },
  { key: "approach", id: "approach", eyebrow: "The approach", title: "Four ways the first message arrives.", lead: "A call about money already lost, a warning about your account, a sum waiting to be released, a famous face." },
];

/** What people do once it has happened, whatever the type. General, and not legal advice. */
export const IF_IT_HAPPENED: readonly { t: string; d: string }[] = [
  { t: "Stop paying.", d: "Send nothing more, whatever the reason given: a tax, a fee, a deposit to “unlock” the account, a charge to recover what was lost. A further payment is the usual next step of the fraud." },
  { t: "Stop the conversation.", d: "There is no need to explain, argue or warn. Do not delete it, either: it is a record." },
  { t: "Keep records.", d: "Messages, names and numbers used, the addresses of websites, payment receipts, account and wallet details, screenshots of anything that might disappear. Note the dates." },
  { t: "Tell your bank or payment provider at once.", d: "Use a number you find yourself, on a card or a statement, not one from a message. Say it is fraud. Time matters, and they will say what they can and cannot do." },
  { t: "Report it to the authority in your country.", d: "That is usually the police or a national fraud-reporting service, and the financial regulator. A report helps others even where it does not help you." },
  { t: "Secure what was shared.", d: "Change passwords that were given out or reused, remove any remote-access software that was installed, and tell the provider of any account or card whose details were passed on." },
  { t: "Expect a second approach.", d: "People who have lost money are contacted again, by “recovery agents”, “lawyers” and “officials” who ask for a fee first. See the page on recovery-room fraud." },
  { t: "Tell someone you trust.", d: "These frauds are built by people who do it for a living, and they work on careful, intelligent people. Silence helps only the fraudster." },
];

export const NO_PROMISE = "Nobody can promise that money lost to fraud will come back. Sometimes some of it does; often it does not. Anyone who guarantees a recovery, or asks to be paid first, is describing another fraud.";

export const SCAMS: readonly Scam[] = [
  /* ------------------------------------------------------------ the money */
  {
    slug: "ponzi-scheme",
    kind: "ponzi",
    group: "money",
    name: "The Ponzi scheme",
    title: "Ponzi scheme: how it works and how to spot one",
    description: "How a Ponzi scheme works, step by step: “returns” paid to earlier investors out of new investors’ money, why it looks so reliable, the warning signs, and why it always collapses. With an animated model.",
    also: ["what is a ponzi scheme", "ponzi scheme warning signs", "ponzi vs pyramid", "how does a ponzi collapse"],
    line: "Returns paid to earlier investors from the money of later ones.",
    is: "A Ponzi scheme is a fund that earns nothing. The “returns” it pays to its investors are taken from the money that newer investors put in. It can keep paying only while new money arrives faster than old promises fall due, and that cannot last.",
    steps: [
      "An operator offers an investment with a high, steady return and a story about how it is earned: a trading method, a property deal, a lending business.",
      "The first investors pay in. Little or none of the money is invested. Part goes to the operator.",
      "The first “returns” are paid on time, out of the investors’ own money or the next arrivals’.",
      "Paid investors tell others, and often add more themselves. Statements show balances growing month after month.",
      "The promises grow faster than the cash. To keep paying, the scheme needs more new money every month than the month before.",
      "New money slows, or many investors ask for their money at once. Withdrawals are delayed, then stopped. The statements were never backed by anything.",
    ],
    convincing: [
      "It pays. For months or years the returns arrive exactly as promised, which is the one thing an honest investment cannot do.",
      "The people recommending it are friends, relatives and colleagues who have themselves been paid, and who believe in it.",
      "Early withdrawals are honoured promptly, so anyone who tests it comes away reassured.",
      "The account statement looks like any other: a balance, a history, a growth figure.",
    ],
    signs: [
      "Returns that are high and also steady: the same gain month after month, with no losing period.",
      "An explanation of where the returns come from that is secret, vague or too complicated to check.",
      "No independent party holding the assets or auditing the accounts; everything is confirmed by the operator alone.",
      "Encouragement to “roll over” gains instead of withdrawing them, and friction, delay or new conditions when a large withdrawal is asked for.",
      "The firm or the product cannot be found on the regulator’s register in your country.",
    ],
    after: ["Being paid a “return” does not make an investor safe: payments from a scheme like this can, in some countries, be claimed back later for the benefit of everyone who lost. That is a question for the authorities handling the case."],
    shows: "New money in, “returns” out, and the month the pot is empty",
    faq: [
      { q: "What is the difference between a Ponzi scheme and a pyramid scheme?", a: "In a Ponzi scheme the investors hand money to one operator, who pays them “returns” out of newer investors’ money; they are not asked to recruit. In a pyramid scheme each member must bring in new members, and payments pass up the levels. Both depend on a supply of new money that has to keep growing, and both fail when it stops." },
      { q: "Why does a Ponzi scheme always collapse?", a: "Because nothing is earned. Every unit paid in creates a promise to pay more than a unit back, so the promises grow faster than the cash. The scheme survives only while new deposits keep rising, and no supply of new investors rises for ever." },
      { q: "If a scheme has paid me on time, is it genuine?", a: "Not for that reason. Paying the early investors on time is how a Ponzi scheme recruits the later ones. Prompt payment shows that money is arriving, not where it comes from." },
    ],
  },
  {
    slug: "pyramid-scheme",
    kind: "pyramid",
    group: "money",
    name: "The pyramid scheme",
    title: "Pyramid scheme: how it works and why it must collapse",
    description: "How a pyramid scheme works: members pay to join and are paid for recruiting others. The arithmetic of why it runs out of people within a few levels, the warning signs, and an animated counter.",
    also: ["what is a pyramid scheme", "pyramid scheme vs mlm", "why pyramid schemes fail", "gifting circle"],
    line: "Paid for recruiting, until there is nobody left to recruit.",
    is: "In a pyramid scheme people pay to join and are rewarded mainly for bringing in others, who pay in their turn. Money passes up from the newest members to the earliest. Each level has to be several times larger than the one above, so the scheme runs out of people within a few levels.",
    steps: [
      "A member invites you to join an “opportunity”: a club, a savings circle, a trading community, a product with a joining fee.",
      "You pay to join. Most of what you pay passes to the person who recruited you and the people above them.",
      "To earn it back you must recruit several new members of your own, each of whom pays to join.",
      "They must each do the same. Every level needs several times as many people as the last.",
      "Within a few levels the numbers required exceed the people available. Recruitment slows.",
      "The newest level, which is always the great majority of members, has paid in and received nothing. The scheme stops.",
    ],
    convincing: [
      "The invitation comes from someone you know, who has been told the same story and believes it.",
      "A few early members really have been paid, and are shown off as proof.",
      "It is presented as a community, a movement or a business of your own, with meetings, slogans and ranks.",
      "There may be a real product. What matters is whether the money comes from selling it to customers or from signing up members.",
    ],
    signs: [
      "The reward is for recruiting people, more than for selling anything to anyone outside the scheme.",
      "A fee to join, or a required purchase of stock, a course or a “package”.",
      "Talk of levels, lines, legs or a matrix, and of income that arrives “passively” once enough people sit beneath you.",
      "Urgency about getting in early, before a level “fills”.",
      "No clear answer to the question of who the customers are.",
    ],
    after: ["Recruiting others into a pyramid scheme can itself be an offence in many countries, including for people who were deceived into it. If you brought others in, say so when you report it; that is for the authority to weigh, not for this page."],
    shows: "How many people each level needs, and where they run out",
    faq: [
      { q: "Is multi-level marketing the same as a pyramid scheme?", a: "Not necessarily. The line that regulators generally draw is where the money comes from: mainly from selling real products to real customers, or mainly from payments by new recruits. The law differs from country to country, and a scheme can call itself one thing and be the other." },
      { q: "Can you make money if you join a pyramid scheme early?", a: "A few at the top are paid, with the money of everyone below. That does not make it an investment: the payment is other members’ losses, and taking part or recruiting can be against the law." },
      { q: "Why do pyramid schemes run out of people so fast?", a: "Because each level must be a multiple of the one before. If every member must recruit six, the thirteenth level alone needs more people than are alive. Long before that, a town or a community is used up." },
    ],
  },
  {
    slug: "pump-and-dump",
    kind: "pump",
    group: "money",
    name: "Pump and dump",
    title: "Pump and dump: how the scam works and the warning signs",
    description: "How a pump and dump works: promoters buy a thinly traded share or token quietly, push the price up with hype, then sell to the buyers they attracted. The stages, the signs and an animated example with an invented price.",
    also: ["pump and dump scheme explained", "share ramping", "crypto pump group", "what is a rug pull"],
    line: "A price pushed up with hype, and sold to the people who believed it.",
    is: "In a pump and dump, a group buys something that is cheap and thinly traded, promotes it loudly to push the price up, and sells its holding to the buyers the promotion brings in. When the selling is done the promotion stops and the price falls back. In regulated markets it is a form of market manipulation.",
    steps: [
      "Promoters choose something with few buyers and sellers: a very small company’s shares, a new token. A small amount of buying moves its price a long way.",
      "They buy quietly, over days or weeks, at a low price.",
      "The promotion begins: messages in groups, posts, videos, “tips” and invented news, all saying that the price is about to soar.",
      "New buyers arrive. The price does rise, which looks like proof that the tip was right, and brings more buyers.",
      "The promoters sell into that demand, a little at a time, at prices several times what they paid.",
      "The messages stop. With no new buyers the price collapses, usually in hours. Those who bought on the way up hold something few will buy.",
    ],
    convincing: [
      "The price really is rising, and a rising price is the most persuasive advertisement there is.",
      "The tip seems to come from many independent people at once. They are often the same few people, or accounts they control.",
      "There is a deadline: the announcement is tomorrow, the listing is on Friday, the window is closing.",
      "Some group members post screenshots of gains. Those who lost do not post.",
    ],
    signs: [
      "An unsolicited tip about a share or a token you had never heard of, with a promise of a large and quick rise.",
      "Something very cheap and little traded, with scant or unverifiable information about the business behind it.",
      "A sudden surge in price and trading with no news from an official source to explain it.",
      "A group with a countdown, a “signal time”, or instructions to buy at a set moment and “hold”.",
      "Promoters who do not say whether they hold the thing they are recommending.",
    ],
    after: ["A share or token bought in a pump and dump is still yours, at whatever it is now worth. Whether to keep or sell it is a decision this page cannot make for you. Reporting the promotion to the market regulator is separate from that decision."],
    shows: "An invented price through the four stages, and what a late buyer is left with",
    faq: [
      { q: "Is a pump and dump illegal?", a: "In regulated securities markets, deliberately pushing a price up with false or misleading statements in order to sell is market manipulation, and is against the law in most countries. For crypto-assets the rules vary by country and are still changing. Being legal or illegal does not change how it ends for a late buyer." },
      { q: "Can I profit by getting in early on a pump?", a: "The people who are early are the organisers, who bought before the first message was sent. By the time a tip reaches a stranger, the selling has usually begun. Knowingly taking part in a manipulation can also be an offence." },
      { q: "How is a “rug pull” different?", a: "A rug pull is the version where the promoters also created the token. Instead of only selling their holding, they withdraw the funds that allowed it to be traded at all, or use a feature of its code that prevents others from selling. The promotion is the same; the exit is more complete." },
    ],
  },
  {
    slug: "signal-seller-guaranteed-returns",
    kind: "signals",
    group: "money",
    name: "Signal sellers and “guaranteed returns”",
    title: "Signal seller and “guaranteed returns” scams",
    description: "How fraudulent signal sellers and “guaranteed return” offers work: the never-wrong track record made by telling half the list one thing and half the other, edited screenshots and paid groups. Warning signs and an animated explainer.",
    also: ["forex signal scam", "guaranteed profit trading", "trading robot scam", "fake track record"],
    line: "A perfect record, made by sending both predictions and keeping the half that worked.",
    is: "A signal seller offers to tell you what to buy and sell, for a subscription. Selling opinions is not in itself a fraud. The fraud is the promise: a guaranteed return, a record with no losses, a method that cannot fail. No such thing exists, and a record that shows one has been manufactured.",
    steps: [
      "Free “predictions” are sent to a large list of people. Half are told a price will rise, half that it will fall.",
      "Whichever happens, half the list has just seen a correct call. Only they are sent the next one, split in the same way.",
      "After several rounds a small group has seen a run of correct calls and no misses. To them the seller looks infallible.",
      "That group is offered the paid service: a subscription, a “VIP room”, a robot, an account to be opened through the seller’s link.",
      "Alongside it, a public record is displayed: screenshots of winning trades, chosen or edited; results from a demonstration account; losing calls deleted.",
      "Subscribers follow the signals with real money and get what chance gives. Complaints are answered with an upgrade to buy, or with silence.",
    ],
    convincing: [
      "The person who receives six correct calls in a row has no way to see the hundreds who received a wrong one.",
      "Screenshots, luxury settings and testimonials are cheap to produce and hard to check.",
      "The first calls were free, so the seller seems to have nothing to gain.",
      "A guaranteed figure sounds like confidence. In any real market it is the surest sign that the claim is untrue.",
    ],
    signs: [
      "The words guaranteed, risk-free, no losses, or a fixed return per day, week or month.",
      "A record shown only in screenshots, with no independent, complete history that includes the losing trades.",
      "Payment for the signals in crypto-assets or to a private account, and pressure to subscribe before a price rise or a closing date.",
      "A requirement to open an account with one particular firm through the seller’s link.",
      "A “robot” or “algorithm” whose rules are secret and whose results are only ever shown, never verified.",
    ],
    after: ["If an account was opened through the seller’s link, the firm holding it is a separate question from the seller: check that firm against the regulator’s register and tell it what has happened."],
    shows: "How a list of 512 people produces a seller who is “never wrong”",
    faq: [
      { q: "Are all trading signal services scams?", a: "No. Publishing trade ideas for a fee is an ordinary business, and in many countries a regulated one. What marks a fraud is the claim made for it: guaranteed profit, no losing trades, a record that cannot be independently checked. A genuine service shows its losses, because it has them." },
      { q: "Can any investment guarantee a return?", a: "A return that depends on a market cannot be guaranteed by anyone, because nobody controls the market. Where a product does carry a guarantee, it is given by a named, authorised institution, written in a contract, and the return is low. A guarantee from a stranger on a messaging app is only a sentence." },
      { q: "How can a fake track record look so real?", a: "By selection. Send both predictions and keep the audience that saw the right one; run many accounts and show the one that did well; post winning trades and delete the rest. Every item shown may be true. The record as a whole is false." },
    ],
  },

  /* ------------------------------------------------------- borrowed trust */
  {
    slug: "clone-firm",
    kind: "clone",
    group: "trust",
    name: "The clone firm",
    title: "Clone firm scam: when a fraudster copies a real firm",
    description: "How a clone firm scam works: fraudsters use the name, registration number and address of a real, authorised firm, with their own phone number, e-mail and website. Why it passes a quick check, the warning signs, and an animated explainer.",
    also: ["cloned investment firm", "fake authorised firm", "how to check a firm on the register", "impersonation of a regulated firm"],
    line: "A real firm’s name and register number, with the fraudster’s phone number.",
    is: "A clone firm is a fraud that borrows the identity of a genuine, authorised firm. The name, the registration number and the registered address are real and will be found on the regulator’s register. The telephone number, the e-mail address and the website belong to the fraudster.",
    steps: [
      "Fraudsters pick a real firm that is authorised and has a clean record, often one that does not deal with the public directly, so few people know its real contact details.",
      "They build a website, brochures and e-mail signatures using that firm’s name, register number and address.",
      "They make contact: an advertisement, a comparison-site form, a call following an enquiry you made somewhere.",
      "You are invited to check them on the register. The firm is there, authorised, exactly as described.",
      "Documents arrive that look professional. Payment is asked for, to an account whose name is not quite the firm’s, or with a reason given for the difference.",
      "The money goes to the fraudster. The real firm has never heard of you.",
    ],
    convincing: [
      "It survives the check that people are told to make: the firm is on the register.",
      "The product offered is often dull and plausible: a bond, a savings account, a fixed rate a little above the banks’.",
      "The paperwork is copied from genuine documents and the callers are patient, well spoken and unhurried.",
      "The real firm’s good name does the persuading.",
    ],
    signs: [
      "Contact details that differ, even slightly, from those on the firm’s register entry: another telephone number, a web address with an extra word or a different ending.",
      "A request to pay an account in another name, in another country, or belonging to a person.",
      "The firm contacted you, or reached you through an advertisement or a form, and you are using only the details it gave you.",
      "A warning on the regulator’s own site that the firm’s name has been cloned.",
      "Reluctance when you say you will ring back on the number shown on the register.",
    ],
    after: ["Tell the genuine firm, using the contact details on the register. It will want to know that its name is being used, and it can confirm that it never dealt with you."],
    shows: "What the clone copies, and the three details it cannot",
    faq: [
      { q: "How can I tell a clone firm from the real one?", a: "By where the contact details come from. The register entry for a firm lists the firm’s own telephone number, address and website. A clone can copy the name and the number of the registration; it cannot change what the register says. Details that reached you any other way are the ones in doubt." },
      { q: "The firm is on the regulator’s register. Is that not enough?", a: "It shows that a firm of that name is authorised. It does not show that the person who contacted you works for it. The clone depends on that gap." },
      { q: "Can a firm’s website be copied as well?", a: "Yes. A page can be copied in minutes, and an address can differ from the real one by a single character. This site keeps its own list of official addresses, and a checker that compares any address with it, on the page “Verify a GIO4X link”." },
    ],
  },
  {
    slug: "fake-broker-trading-platform",
    kind: "fake-broker",
    group: "trust",
    name: "The fake broker or platform",
    title: "Fake broker and fake trading platform scams",
    description: "How a fake broker or fake trading platform works: a convincing screen shows trades and profits that never happened, deposits grow, and withdrawals are blocked behind fees. The steps, the warning signs and an animated explainer.",
    also: ["fake trading app", "fake forex broker", "cannot withdraw from trading platform", "boiler room"],
    line: "A screen that shows profits, and a withdrawal button that asks for more.",
    is: "A fake broker is a website or an app made to look like a trading platform. Prices move, positions open and close, a balance grows. None of it is connected to a market. The balance is a number the operator sets, and the money deposited left on the day it arrived.",
    steps: [
      "An advertisement, a message or a new acquaintance leads you to a platform with a professional look, charts and an account area.",
      "You open an account with a small first deposit. An “account manager” telephones, friendly and attentive.",
      "The screen shows the deposit growing. A small withdrawal is allowed, and arrives.",
      "The manager urges larger deposits to reach a better account tier, to catch an opportunity, or to recover a sudden “loss”.",
      "You ask to withdraw. A reason appears why you cannot yet: a tax to be paid first, a minimum volume of trading, an identity check with a fee.",
      "Each fee paid is followed by another. Then the account is locked, the site goes dark, or the manager stops answering.",
    ],
    convincing: [
      "The platform looks and behaves like a real one. Building such a screen takes days, not expertise.",
      "The early withdrawal works, and people reasonably take that as the test.",
      "The account manager is in touch daily and seems to care about your success.",
      "The losses, when they come, are blamed on the market, and the remedy offered is a further deposit.",
    ],
    signs: [
      "The firm cannot be found on the register of the financial regulator in your country, or the details on the register differ from those you were given.",
      "Deposits by crypto-asset transfer, to a personal account, or through a payment service unrelated to the firm’s name.",
      "A bonus that ties your money up until a volume of trading has been done.",
      "Any payment required before a withdrawal: a tax, a commission, an insurance, a “liquidity” deposit.",
      "A manager who asks for remote access to your computer or telephone to “help” with a transfer.",
      "An app installed from a link or a file and not from the official store of your device.",
    ],
    after: ["If remote-access software was installed, or a copy of an identity document was sent, tell your bank and treat every account reached from that device as exposed."],
    shows: "The balance on the screen against the money sent and the money returned",
    faq: [
      { q: "Why does a fake platform let me withdraw at first?", a: "Because a small payment out is the cheapest way to earn a large payment in. It answers the doubt “can I get my money back?” at the moment it is asked, and it costs the operator a fraction of what follows." },
      { q: "Do I have to pay tax or a fee before I can withdraw from a broker?", a: "A genuine firm takes any charge it is owed out of the balance it holds. Tax on gains, where it is due, is a matter for the tax authority of the country you live in; where a firm does withhold tax, it takes it from the balance and does not ask for new money. A demand to send new money in order to release existing money is the mark of this fraud." },
      { q: "How do I check whether a broker is real?", a: "A firm that may deal with the public appears on the register of the financial regulator of the country it operates in, with its own contact details. The regulators’ registers and warning lists are free to search; this site lists several under “Nice & Need”. A name on a register is the start of a check, not the end: see the page on clone firms." },
    ],
  },
  {
    slug: "account-management-fraud",
    kind: "managed",
    group: "trust",
    name: "“Let me trade your account”",
    title: "Account management fraud: “let me trade your account”",
    description: "How account management fraud works: a stranger offers to trade your account for a share of the profit, takes control or takes reckless risk, and keeps the fees while you keep the losses. Warning signs and an animated explainer.",
    also: ["managed account scam", "someone offered to trade for me", "profit share trading scam", "copy trading scam"],
    line: "A stranger is paid on the wins and is somewhere else for the losses.",
    is: "In account management fraud, someone offers to trade your money for you, usually for a share of the profits. Some simply take the password and empty the account. Others do trade, with very high risk, because the arrangement pays them for every gain and costs them nothing for any loss.",
    steps: [
      "A “trader” with an impressive record, shown in screenshots, offers to manage your account. You keep the account in your name; they only need the password.",
      "The terms sound fair: they take a share of the profit, often 30% to 50%, and nothing if there is none.",
      "They trade with large positions. A good week arrives, their share is paid, and you are encouraged to add money.",
      "A bad week arrives, as it must. The loss is entirely yours. There is no refund of earlier fees.",
      "You are told that a further deposit is needed to “recover”. Or the manager disappears.",
      "In the plainest version there is no trading at all: the password is used to withdraw the balance or to change the account’s details.",
    ],
    convincing: [
      "“You keep control, the account stays in your name” sounds like safety. A password is control.",
      "“No profit, no fee” sounds like shared risk. It is the opposite: the manager shares in gains only.",
      "The record shown is a selection: one good account among many, or an image that has been edited.",
      "The first weeks may really be profitable. High risk produces spectacular gains about as often as spectacular losses.",
    ],
    signs: [
      "A stranger, or an online acquaintance, asking for the password to a trading account, or for remote access.",
      "A share of profits with no share of losses and no way to hold the manager to account.",
      "No authorisation: in most countries, managing other people’s money for pay requires a licence, and a licensed manager can be found on a register.",
      "A record that cannot be verified independently and in full.",
      "A request that the fee be paid separately, in crypto-assets or to a private account.",
    ],
    after: ["Change the account’s password at once and tell the firm that holds the account that someone else has had access to it. If the same password is used anywhere else, change it there too."],
    shows: "Two hundred invented accounts, traded on a coin flip, and what the manager collects",
    faq: [
      { q: "Is it safe to let someone trade my account if it stays in my name?", a: "The name on the account decides who bears the losses. The password decides who can act. Handing over the second while keeping the first leaves all of the risk with the account holder." },
      { q: "Is a profit-share arrangement fair if I pay nothing on a loss?", a: "It gives the manager a share in every gain and no part in any loss, so the manager is better off the more risk is taken with your money. Regulated managers also charge performance fees, but under rules, with a contract, and with a regulator to complain to." },
      { q: "Are managed accounts and copy trading always scams?", a: "No. Authorised firms offer both, under rules about who may manage money and what must be disclosed. The fraud is the unlicensed stranger, the handed-over password and the record that cannot be checked." },
    ],
  },
  {
    slug: "romance-investment-scam",
    kind: "romance",
    group: "trust",
    name: "Romance and “pig butchering” fraud",
    title: "Romance investment scam (“pig butchering”): how it works",
    description: "How romance investment fraud, also called pig butchering, works: weeks of friendship or courtship online, then an introduction to a fake trading platform. The stages, why it works on careful people, the signs, and an animated timeline.",
    also: ["pig butchering scam explained", "online friend wants me to invest", "wrong number text scam", "crypto romance scam"],
    line: "Weeks of friendship first. The investment comes later.",
    is: "In this fraud a stranger builds a friendship or a romance online over weeks, asking for nothing. Only then do they mention an investment that has done well for them, and offer to show how. The platform they recommend is a fake. “Pig butchering” is the fraudsters’ own phrase for it: the victim is fattened before the slaughter. Many people prefer not to use it.",
    steps: [
      "Contact begins by apparent accident or on a dating or social app: a message meant for someone else, a friendly profile.",
      "Daily conversation follows, for weeks: photographs, routines, sympathy, plans to meet that never quite happen. There are reasons why a video call is difficult.",
      "The friend mentions, lightly, that they do well from trading, thanks to a relative or a system. They do not ask you for anything.",
      "They offer to teach you. You open an account on the platform they use and put in a small sum. It grows. A small withdrawal works.",
      "Encouraged, and now encouraged by someone you care about, you put in more: savings, then loans. The screen shows a fortune.",
      "A withdrawal is refused until a tax or a fee is paid. After it is paid, the platform and the friend both disappear.",
    ],
    convincing: [
      "Nobody asks for money for weeks. The investment appears to be your own idea.",
      "The feelings are real on one side. People do not audit those they are fond of.",
      "The friend seems to invest alongside you and to share the gains and the worries.",
      "The fraud is run by teams working from scripts, with time and patience that no single person could spare.",
    ],
    signs: [
      "An online relationship in which meeting in person or speaking on live video keeps being put off.",
      "Talk of investment from someone you have never met, however gently it is raised.",
      "A particular platform or app that you are guided to, step by step, and have not found by yourself.",
      "A request to move the conversation to a private messaging app soon after first contact.",
      "Advice to keep the investment from family, or to tell the bank the transfer is for something else.",
      "Any fee to withdraw.",
    ],
    after: ["The person you were speaking to was a role, and often several people. Feeling grief as well as anger is common. Many countries have victim-support services that deal with exactly this, and the police or the fraud-reporting service can point to them."],
    shows: "Sixteen invented weeks: trust rising first, and money only afterwards",
    faq: [
      { q: "Why is it called “pig butchering”?", a: "The phrase is a translation of the fraudsters’ own slang for the method: the victim is “fattened” with attention and small gains before everything is taken. Because it describes the victim as the criminals do, many authorities and support groups say “romance investment fraud” or “relationship investment fraud” instead." },
      { q: "How is this different from an ordinary romance scam?", a: "In the older form the new partner asks for money directly: for an emergency, a ticket, a hospital bill. Here they ask for nothing. They recommend an investment and the victim sends the money to a platform, believing it is still theirs. Sums are often larger because each payment looks like saving, not giving." },
      { q: "Do these scams only catch lonely or careless people?", a: "No. They are run professionally and aimed at anyone who will answer a message. Those caught include people with financial training. What the method exploits is ordinary trust, built slowly." },
    ],
  },

  /* --------------------------------------------------------- the approach */
  {
    slug: "recovery-room-fraud",
    kind: "recovery",
    group: "approach",
    name: "Recovery-room fraud",
    title: "Recovery room fraud: the scam after the scam",
    description: "How recovery room fraud works: after a first scam, someone calls offering to get the money back for an upfront fee. Why they know so much about the loss, the warning signs, and an animated explainer.",
    also: ["fund recovery scam", "money recovery service scam", "chargeback company scam", "scammed twice"],
    line: "The second fraud: a fee to recover what the first one took.",
    is: "Recovery-room fraud targets people who have already lost money. A caller presents as a lawyer, an investigator, a regulator or a specialist “recovery” firm, says the lost money has been traced, and asks for a fee before it can be returned. There is no recovery. The caller is often connected with the first fraud, or has bought its list of victims.",
    steps: [
      "A first fraud ends. The victim’s name, contact details and the amount lost are kept, and such lists are sold.",
      "Weeks or months later a call or an e-mail arrives. The caller knows what was lost, when and to whom.",
      "They say the money has been found, frozen or seized, and can be released: by a court, an exchange, an agency.",
      "First, a payment is needed: a registration fee, a legal cost, a tax, an insurance bond.",
      "Once paid, another obstacle appears with another fee.",
      "When payments stop, so does the caller. Sometimes a third arrives, offering to recover both losses.",
    ],
    convincing: [
      "They know details that only the victim and the first fraudster knew. It feels like proof of an investigation. It is proof of the list.",
      "The victim badly wants it to be true, and may not have told anyone about the first loss.",
      "The caller uses the names of real authorities, official-looking letters and case numbers.",
      "The fee is small beside the sum to be recovered.",
    ],
    signs: [
      "You did not contact them; they contacted you, already knowing about your loss.",
      "A fee, tax or deposit to be paid before any money is returned.",
      "A claim to be from, or to work with, a regulator, a court or the police, with contact details that are not the authority’s own published ones.",
      "A guarantee of recovery, or a recovery expressed as a certain amount by a certain date.",
      "Payment asked for in crypto-assets, gift cards or to a personal account.",
    ],
    after: ["Authorities do not charge victims a fee to return money. If a caller claims to act for one, the authority can be asked directly, using the contact details it publishes itself."],
    shows: "How the first loss becomes a list, the list becomes a call, and the fees stack up",
    faq: [
      { q: "How did they know I had been scammed?", a: "Because they have the first fraudster’s records, or are the same people. Knowing the amount, the date and the name of the fake platform takes no investigation when you already hold the list." },
      { q: "Are there genuine ways to recover money lost to fraud?", a: "Sometimes, in part: through the bank or card provider that sent the payment, through the police or the courts, or through a compensation scheme where one applies. None of these begins with a stranger telephoning and asking for a fee. What applies in a particular case is a question for the bank, the authority or a regulated legal adviser in your country." },
      { q: "Do regulators or the police charge to return recovered money?", a: "No authority asks a victim for an upfront payment to release their own money. A demand of that kind made in an authority’s name is an impersonation." },
    ],
  },
  {
    slug: "phishing-and-fake-support",
    kind: "phishing",
    group: "approach",
    name: "Phishing and fake support",
    title: "Phishing and fake support scams: how they work",
    description: "How phishing and fake customer-support scams work: a message or a call that looks like your broker or bank, a copy of the sign-in page, and a one-time code passed on in real time. The warning signs and an animated explainer.",
    also: ["fake customer support scam", "one-time code scam", "smishing and vishing", "remote access scam"],
    line: "A copy of the page, or a voice on the phone, asking for the code.",
    is: "Phishing is a message that pretends to come from a firm you use, in order to collect your password and the code that protects it. Fake support is the same thing with a person: a caller, or a “help desk” found through a search or a social media reply, who asks for the code or for control of your screen.",
    steps: [
      "A message arrives by e-mail, text or app: a problem with the account, a payment to confirm, a security alert. It carries a link or a telephone number.",
      "The link opens a copy of the firm’s sign-in page at an address that resembles the real one.",
      "The password entered there goes to the fraudster, who types it into the real site straight away.",
      "The real site sends a one-time code to the real customer. The copy page, or the caller, asks for it.",
      "With password and code the fraudster is signed in. Details are changed, money is moved.",
      "In the support version, the “agent” asks you to install software so that they can “fix” the problem, and then works your device in front of you.",
    ],
    convincing: [
      "It uses the firm’s real logo, wording and layout, which are public and easy to copy.",
      "It arrives when a message from that firm would not be surprising, and sometimes in the same thread as genuine ones.",
      "It is urgent, and about security: the feeling it produces is that acting quickly is the careful thing to do.",
      "The fake help desk appears just when help was being sought: as an advertisement above the real result, or a reply to a public complaint.",
    ],
    signs: [
      "A link in a message that asks you to sign in. Read the address from right to left: the part just before the first single slash is the site you are on.",
      "Anyone at all asking for a password, a one-time code or a recovery phrase. Genuine staff have no use for them.",
      "A request to install remote-access or screen-sharing software.",
      "A deadline: the account will be closed, the payment will go, within the hour.",
      "A sender’s display name that is right above an address that is not.",
      "A support number found in a search advertisement or a social media reply and not on the firm’s own site.",
    ],
    after: ["Change the password from a device you trust, sign out all other sessions if the service allows it, and tell the firm through its own published contact details. If a code was given out or software installed, tell your bank as well."],
    shows: "The copy of the page in the middle, and how the code gets through",
    faq: [
      { q: "If I have two-step verification, can phishing still work?", a: "It can, when the code is typed into a copy of the page or read out to a caller: the fraudster uses it on the real site within seconds. Two-step verification stops a stolen password from being enough. It does not stop a code that the customer hands over." },
      { q: "How do I check that a web address is genuine?", a: "Read the host name from right to left. In an address such as signin.example.com.example.net the site is example.net, whatever comes before it. For this site’s own addresses there is a checker on the page “Verify a GIO4X link”." },
      { q: "Will a real firm ever ask for my password or a code?", a: "A firm’s systems check a password; its staff never need to be told it. A code sent to your telephone is for you to enter yourself, on the firm’s own site or app. A person asking for either is not acting for the firm." },
    ],
  },
  {
    slug: "advance-fee-fraud",
    kind: "advance-fee",
    group: "approach",
    name: "Advance-fee fraud",
    title: "Advance-fee fraud: paying to receive money",
    description: "How advance-fee fraud works: a loan, a prize, an inheritance or an investment payout is promised, and a small fee is needed first. Then another. The steps, the warning signs and an animated explainer.",
    also: ["upfront fee scam", "loan fee scam", "pay to withdraw scam", "inheritance scam"],
    line: "A large sum is waiting. It needs one small payment first.",
    is: "In advance-fee fraud you are told that money is due to you, or available to you, and that a payment is needed before it can be sent: a processing fee, a tax, an insurance. The promised money does not exist. Each fee paid is followed by a new reason for another, for as long as the payments continue.",
    steps: [
      "An offer or a notice arrives: a loan approved whatever your credit record, a prize, a legacy, a share of a transfer, a payout on an investment.",
      "It is detailed and official in tone, with names, reference numbers and documents.",
      "Before the money can be released there is a cost: small beside the sum promised.",
      "You pay. A complication follows: a new charge, a certificate, a tax in another country.",
      "Having paid once, there is a reason to pay again, so as not to lose what has gone already.",
      "It ends when the victim stops. The promised sum is never nearer than it was at the start.",
    ],
    convincing: [
      "The first fee is small and the reward is large, so the risk seems worth taking.",
      "Each later fee is presented as the last.",
      "Money already paid weighs heavily: stopping means accepting it is lost.",
      "It often arrives when money is needed, as an offer of a loan to someone who has been refused elsewhere.",
    ],
    signs: [
      "Any payment required in order to receive money.",
      "A prize in a draw you did not enter, a legacy from someone you did not know, a loan nobody assessed.",
      "Fees to be paid by transfer to a person, in crypto-assets, or with gift-card codes.",
      "Official-looking documents with errors, generic greetings and free e-mail addresses.",
      "Requests for secrecy, and pressure of time.",
    ],
    after: ["If copies of identity documents or bank details were sent as part of the “application”, tell your bank, and watch for accounts or credit opened in your name."],
    shows: "The promised sum, always one payment away, and the fees that are real",
    faq: [
      { q: "Do genuine lenders ever charge an upfront fee?", a: "Some genuine credit arrangements carry fees, set out in a written agreement from an authorised lender, and rules about them differ by country. What marks the fraud is a fee demanded before anything is provided, paid by an unusual method, to a lender who cannot be found on the regulator’s register." },
      { q: "Why do people keep paying after the first fee?", a: "Because each payment is small beside the sum expected and beside what has already been paid. Stopping means admitting the earlier payments are gone. The fraud is designed around that reluctance." },
      { q: "Is a fee to withdraw from a trading platform the same thing?", a: "It is the same mechanism at the end of a different fraud. A balance that can be withdrawn only by sending in more money is an advance-fee demand, whatever the fee is called." },
    ],
  },
  {
    slug: "deepfake-endorsement-scam",
    kind: "deepfake",
    group: "approach",
    name: "Deepfake and fake endorsements",
    title: "Deepfake and fake celebrity endorsement scams",
    description: "How deepfake and impersonation endorsement scams work: a well-known face and a cloned voice appear to recommend an investment in a fake news article or video. How the parts are assembled, the warning signs and an animated explainer.",
    also: ["fake celebrity investment ad", "ai voice clone scam", "fake news article investment", "impersonation scam"],
    line: "A famous face recommends a platform. The person never said it.",
    is: "In an endorsement fraud, a well-known person appears to recommend an investment: in a video, an interview, a news article or a post. The person never said it. The film is generated or edited from public footage, the voice is cloned, the article is on a copy of a news site, and the link leads to a fake platform or to a caller.",
    steps: [
      "Fraudsters gather public video and audio of a trusted figure: a presenter, a business leader, a sportsperson, an official.",
      "Software fits new words to the face and the voice, or a real interview is re-cut and re-captioned.",
      "The film is placed in a paid advertisement or a post, often linked to a page made to look like a known news outlet.",
      "The page tells a story: the person let slip a “secret” way of making money, and the authorities or the banks want it hidden.",
      "A form asks for a name and a telephone number. A caller follows, with a small first deposit to make.",
      "From there it is the fake-platform fraud, begun with a recommendation that seemed to come from someone the victim already trusted.",
    ],
    convincing: [
      "Trust in the person is real and was earned elsewhere. The fraud only has to borrow it.",
      "Faces and voices used to be evidence. They can now be produced to order.",
      "The surrounding page copies a trusted news brand, with comments from “readers” who say it worked.",
      "It appears as an advertisement on a platform people use daily, which seems to vouch for it.",
    ],
    signs: [
      "A public figure recommending a particular investment platform, with a link, in an advertisement.",
      "A story about a secret, a leak, a loophole, or something “they” do not want known.",
      "A web address that is not the news outlet’s own, however alike the page looks.",
      "No trace of the statement on the person’s own official channels or in any other report.",
      "A form that asks only for contact details, followed by a telephone call.",
      "Slight oddities of lip movement, blinking, lighting or rhythm of speech. These are becoming rarer, and their absence proves nothing.",
    ],
    after: ["Reporting the advertisement to the platform that showed it is separate from reporting the fraud to the authorities, and both are worth doing: the first may stop others seeing it."],
    shows: "The four parts an “endorsement” is assembled from",
    faq: [
      { q: "How can I tell whether a video is a deepfake?", a: "Often you cannot, by looking. Flaws in lips, eyes and voice are becoming harder to see. What stays checkable is the context: whether the statement appears on the person’s own official channels, whether any established outlet reports it, and what the offer itself is asking you to do." },
      { q: "Do celebrities really endorse trading platforms?", a: "Paid sponsorships exist, and are announced by both sides through their own official channels. A “leaked secret” in an advertisement, leading to a form and a telephone call, is not how any genuine endorsement is made." },
      { q: "Can a voice on the telephone be faked as well?", a: "Yes. A voice can be cloned from a short recording, so a call that sounds like a known person, a manager or a relative is no longer proof of who is speaking. Ringing back on a number already known is the old check, and it still works." },
    ],
  },
];

export const getScam = (slug: string) => SCAMS.find((s) => s.slug === slug);

/* ---------------------------------------------------------------------------
 * CHECK THIS OFFER — yes/no questions. A "yes" is a warning sign.
 *
 * `weight` is how much one answer counts: 3 for a sign that appears on its
 * own in regulators' published fraud warnings, 2 for one that matters mostly
 * in company. The list is a prompt for thought. It is not a verdict, and an
 * offer that passes every question can still be a fraud.
 * ------------------------------------------------------------------------- */

export type Check = { id: string; q: string; short: string; weight: 2 | 3; see?: string };

export const CHECKS: readonly Check[] = [
  { id: "guaranteed", q: "Is a return guaranteed, or described as risk-free?", short: "a guaranteed or risk-free return", weight: 3, see: "signal-seller-guaranteed-returns" },
  { id: "pressure", q: "Are you being pressed to decide today, or told the offer is about to close?", short: "pressure to decide at once", weight: 2 },
  { id: "cold", q: "Did the contact come out of the blue: a call, a message, an advertisement, a new online friend?", short: "contact you did not ask for", weight: 2, see: "romance-investment-scam" },
  { id: "payment", q: "Are you asked to pay in crypto-assets, with gift cards, in cash, or to a private person’s account?", short: "payment in crypto-assets, gift cards or to a private account", weight: 3 },
  { id: "remote", q: "Have you been asked to install remote-access or screen-sharing software, or to read out a code sent to your telephone?", short: "a request for remote access or a one-time code", weight: 3, see: "phishing-and-fake-support" },
  { id: "withdraw", q: "Must you pay a fee, a tax or a deposit before you can withdraw your own money?", short: "a fee before you can withdraw", weight: 3, see: "advance-fee-fraud" },
  { id: "secret", q: "Have you been told to keep it secret, or to give your bank a different reason for the payment?", short: "being told to keep it from your bank or family", weight: 3 },
  { id: "register", q: "Have you been unable to find the firm on the financial regulator’s register in your country, with the same contact details you were given?", short: "a firm that is not on the register, or whose details differ from it", weight: 3, see: "clone-firm" },
  { id: "steady", q: "Are the returns shown far above what a bank pays, or steady month after month with no losing period?", short: "returns that are high and never dip", weight: 2, see: "ponzi-scheme" },
  { id: "unclear", q: "Is it unclear where the returns come from, or is the explanation a “secret method”?", short: "no checkable account of where the money comes from", weight: 2 },
  { id: "recruit", q: "Are you rewarded for bringing in other people?", short: "rewards for recruiting", weight: 2, see: "pyramid-scheme" },
  { id: "famous", q: "Does the offer rely on a famous name, a video of a well-known person, or a news story you cannot find anywhere else?", short: "an endorsement you cannot confirm", weight: 2, see: "deepfake-endorsement-scam" },
  { id: "password", q: "Does someone want the password to your account, or to trade on your behalf?", short: "someone else wanting to operate your account", weight: 2, see: "account-management-fraud" },
  { id: "recover", q: "Has someone offered, for a fee paid first, to recover money you lost before?", short: "an upfront fee to recover an earlier loss", weight: 3, see: "recovery-room-fraud" },
];

export const CHECK_MAX = CHECKS.reduce((s, c) => s + c.weight, 0);
