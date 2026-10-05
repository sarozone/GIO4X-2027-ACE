import type { Primer } from "./primers";

/**
 * MARKET PRIMERS, continued — the three that are about the firm on the other
 * side of the account and about what a trader believes before opening one:
 * regulation, choosing a broker, and common myths. They are joined to PRIMERS
 * in src/data/primers.ts and keep every rule written at the top of that file.
 * Three rules of their own:
 *
 * - the regulation page names regulators and what each covers in general
 *   terms. It gives no licence number, no web address (they change) and no
 *   rule, limit or compensation figure for any country, and it ranks no
 *   regulator above another;
 * - what the first two say about GIO4X is what /trust/transparency and the
 *   company line say (docs/WAITING-FOR-ABE.md, A1 and A2) and nothing more:
 *   this site names no regulator, licence number or register entry for GIO4X,
 *   and a company number is a registration, not an authorisation;
 * - the myths page tests each belief with arithmetic on invented figures. It
 *   says what the sums show and never what a reader should do, and it accuses
 *   no firm of anything.
 */
export const GUIDE_PRIMERS: readonly Primer[] = [
  {
    slug: "regulation-explained",
    name: "Regulation explained",
    title: "Financial regulation explained: who the regulators are and how to check a firm",
    description:
      "What financial regulators do, the main ones by name and jurisdiction (FCA, CFTC and NFA, SEC, ASIC, CySEC and ESMA, MAS, Japan’s FSA, SEBI, FSCA, DFSA), how offshore registration differs, why a company number is not an authorisation, and how to check any firm on a regulator’s public register, step by step.",
    card: "What a regulator does, who the main ones are, and how to check any firm on a public register in six steps.",
    also: ["how to check if a broker is regulated", "FCA register check", "authorised vs registered company", "what does a financial regulator do", "offshore broker regulation"],
    is: "A financial regulator is a public body with legal power over the firms that hold or handle other people’s money. This page says what regulators do, names the main ones and where their authority runs, separates being authorised from merely being a registered company, and sets out how to check any firm, this one included, on a regulator’s own public register.",
    sections: [
      {
        id: "what",
        title: "What a financial regulator does",
        paragraphs: [
          "A regulator is given its powers by a country’s law. In broad terms it does four things. It decides who may offer financial services at all, by granting, refusing and withdrawing permission. It writes rules for how a permitted firm must behave: what it must tell a client, how it must hold a client’s money, how much capital of its own it must keep. It supervises, by requiring reports and by inspecting. And it enforces, with fines, restrictions and bans.",
          "A regulator does not vouch for a firm’s products, does not promise that a firm will not fail, and does not make trading safe. A person can lose money, quickly, with a firm that is authorised and behaving properly. What regulation changes is what the firm is obliged to do, and where a client can turn if it does not.",
          "A regulator’s authority also stops at a border. Its rules protect the clients its law says they protect, which usually depends on which legal entity the client has contracted with and where the client lives.",
        ],
      },
      {
        id: "who",
        title: "The main regulators, by jurisdiction",
        paragraphs: [
          "The names below are the ones a reader is most likely to meet. Each keeps a public register that can be searched without charge. The list is not complete, and it is not a ranking.",
        ],
        points: [
          "United Kingdom: the Financial Conduct Authority (FCA). Its register is the Financial Services Register.",
          "United States: the Commodity Futures Trading Commission (CFTC) oversees futures, swaps and retail foreign exchange dealing, with the National Futures Association (NFA), an industry body with delegated powers, registering firms and individuals. The Securities and Exchange Commission (SEC) oversees securities markets.",
          "Australia: the Australian Securities and Investments Commission (ASIC), which grants the Australian financial services licence.",
          "European Union: each member state has its own regulator, such as the Cyprus Securities and Exchange Commission (CySEC), and a firm authorised in one state may be permitted to serve clients in others. The European Securities and Markets Authority (ESMA) co-ordinates the national regulators and can set rules across the Union; it does not itself authorise brokers.",
          "Singapore: the Monetary Authority of Singapore (MAS), which is both the central bank and the financial regulator.",
          "Japan: the Financial Services Agency (FSA).",
          "India: the Securities and Exchange Board of India (SEBI) regulates the securities markets and their intermediaries; the Reserve Bank of India is responsible for the rules on foreign exchange.",
          "South Africa: the Financial Sector Conduct Authority (FSCA).",
          "Dubai International Financial Centre: the Dubai Financial Services Authority (DFSA), whose authority covers that financial centre and not the rest of the country.",
        ],
      },
      {
        id: "offshore",
        title: "Offshore registries",
        paragraphs: [
          "A number of smaller jurisdictions, many of them islands, register international companies and some also license financial firms. They are commonly called offshore. The word describes a place and is not an accusation: lawful firms are incorporated in such places for many reasons.",
          "What differs from one jurisdiction to another is what the law there requires of a licensed firm and what a client can do if something goes wrong: how much capital the firm must hold, whether client money must be kept apart, whether there is an ombudsman or a compensation scheme, and how readily a client abroad can bring a complaint. Those are facts to look up for the jurisdiction concerned, in its own published rules, and they vary widely.",
          "Two different things are also issued in such places, and they are easily confused: a certificate that a company exists, and a licence to carry on a financial business. The next section is about that difference, which applies everywhere.",
        ],
      },
      {
        id: "authorised",
        title: "Authorisation and company registration are different things",
        paragraphs: [
          "Every company has a registration: an entry in a companies registry, with a number. It records that the company exists, where its registered office is and, in many countries, who its directors are. It is obtained by filing forms and paying a fee, and it says nothing about what the company is allowed to do.",
          "Authorisation, also called a licence or permission, is granted by a financial regulator after an application that the regulator can refuse. It names the activities the firm may carry on, and it carries duties that continue for as long as it is held.",
          "So a company number, by itself, is not evidence of regulation. Nor is a statement that a firm is “registered”, “incorporated” or “compliant” without the name of a regulator and a reference that can be looked up. The words that matter are the regulator’s name, the firm’s reference number on that regulator’s register, and the exact legal name of the entity that holds it.",
        ],
      },
      {
        id: "check",
        title: "How to check any firm on a public register",
        paragraphs: [
          "The check takes a few minutes and uses only the regulator’s own website. It works the same way for any firm.",
        ],
        points: [
          "Find the legal name. Look in the footer of the firm’s website and in its terms for the full name of the company that would be your counterparty, the regulator it names and its reference number. If no regulator is named, there is nothing to check, and that is itself the answer.",
          "Go to the regulator’s website yourself. Type its address or find it through a search engine. Do not follow a link supplied by the firm, because a copied register page is a known trick.",
          "Search the register by the reference number, then by the name, and see that the two lead to the same entry.",
          "Read the entry. Is the status current, or has it lapsed or been withdrawn? Do the permissions cover what you are being offered? Is the firm allowed to hold client money?",
          "Compare the details. The web addresses, telephone numbers and e-mail addresses on the register should match the ones you have been using. A firm that copies a real firm’s name and number, with its own contact details, is called a clone.",
          "Confirm which entity you would contract with. A group may have one authorised company and several that are not. The protections belong to clients of the authorised entity, so the name on your agreement is the one that counts.",
        ],
      },
      {
        id: "after",
        title: "What a register entry does and does not settle",
        paragraphs: [
          "A current entry settles that the named firm holds the permissions listed, on the day you looked. Most regulators also publish warning lists of firms that are operating without permission or imitating an authorised one, and those are worth a search as well.",
          "It does not settle whether the firm’s prices are fair, whether its service is good, whether its products suit you or whether you will make money. Those are separate questions, and the checklist for choosing a broker takes them in turn.",
        ],
      },
    ],
    example: {
      title: "One check, start to finish",
      setup: "The names and numbers here are invented. A website trades as “Example Markets”. Its footer says: “Example Markets is a trading name of Example Markets International Ltd, registered company 0000000, authorised by Regulator X under reference 111111.”",
      steps: [
        "The reader goes to Regulator X’s website by typing its address, and searches the register for 111111.",
        "The entry found is for “Example Markets Ltd”: a similar name, but not the same company as “Example Markets International Ltd”.",
        "The entry lists one website and one telephone number. Neither is the one the reader has been using.",
        "The reader searches the register for “Example Markets International Ltd” and finds no entry. The company number 0000000, looked up in the companies registry, does exist: the company is registered, and nothing more.",
      ],
      reading: "The reference number was real and belonged to a different company. The entity the reader would have contracted with is a registered company with no entry on the register. Every statement in the footer was close to true, and the conclusion a hurried reader would draw from it was false. The check found that in four steps, using only the regulator’s own site.",
    },
    limits: [
      "The rules, limits, compensation arrangements or complaint procedures of any regulator. They differ, they change, and the regulator’s own website is the authority.",
      "Whether any particular firm is authorised. Only the register, read on the day, says that.",
      "Which regulator or jurisdiction is better. This page ranks none of them.",
      "Whether you, where you live, are entitled to a given protection. That depends on the entity you contract with and on your own country’s law.",
    ],
    here: "This website makes no regulatory claim about GIO4X. It names no regulator, no licence number and no register entry, and the page “What we disclose” lists regulatory status among the items not yet published. The company line on this site reads: “GIO4X, a subsidiary of 777 Capital Markets Limited (UK), Company No. 17049134.” As this page explains, a company number is a registration and not an authorisation. Anything not published can be asked for in writing through the contact page, and the check described above can be applied to GIO4X exactly as to any other firm.",
    terms: ["broker", "market-maker", "ecn", "non-dealing-desk", "liquidity-provider", "negative-balance", "cfd", "leverage"],
    tools: [],
    lessons: [],
    links: [
      { kind: "Trust", label: "What we disclose", href: "/trust/transparency", note: "What GIO4X publishes and what it has not, item by item, regulatory status included." },
      { kind: "Primer", label: "How to choose a broker", href: "/primers/how-to-choose-a-broker", note: "A checklist that begins with this check and goes on to money, costs and withdrawals." },
      { kind: "Scam school", label: "Clone firms", href: "/scam-school/clone-firm", note: "How a real firm’s name and number are borrowed." },
      { kind: "Scam school", label: "Fake brokers and trading platforms", href: "/scam-school/fake-broker-trading-platform", note: "What an invented broker looks like from the outside." },
      { kind: "Trust", label: "Client fund security", href: "/trust/client-funds", note: "Questions about client money to put to any broker." },
      { kind: "Trust", label: "Verify a GIO4X link", href: "/trust/verify", note: "Which addresses and software are official." },
      { kind: "Company", label: "What we are", href: "/about/what-we-are", note: "And what we are not." },
    ],
    faq: [
      { q: "How do I check whether a broker is regulated?", a: "Find the full legal name, the regulator and the reference number in the firm’s footer or terms. Go to that regulator’s website yourself, search its public register for the number and the name, and check that the entry is current, that its permissions cover what you are offered, and that its contact details match the ones you were given." },
      { q: "Is a company registration number the same as being regulated?", a: "No. A company number shows that a company exists in a companies registry. Authorisation is a separate permission granted by a financial regulator, with its own reference number on that regulator’s register. A firm can have the first without the second." },
      { q: "Does regulation mean my money is safe?", a: "No. Regulation sets duties for the firm and gives a client somewhere to turn. It does not prevent trading losses, and what happens if a firm fails depends on the rules of the jurisdiction and on which entity the client contracted with." },
      { q: "Is GIO4X regulated?", a: "This website names no regulator, licence number or register entry for GIO4X and makes no regulatory claim. Regulatory status is listed as not yet published on the page “What we disclose”. The published company line gives a UK company number, which is a registration and not an authorisation." },
    ],
  },
  {
    slug: "how-to-choose-a-broker",
    name: "How to choose a broker",
    title: "How to choose a broker: a neutral checklist for any firm",
    description:
      "How to choose a broker, as a checklist that can be held against any firm, GIO4X included: authorisation, how client money is held, the whole cost of a trade, how orders are executed, platforms, support, withdrawals, and the warning signs. With a worked comparison of two ways of charging.",
    card: "Eight questions to put to any broker, in order, with what a good answer looks like and the signs that should stop you.",
    also: ["broker checklist", "what to look for in a forex broker", "how to compare brokers", "broker red flags", "is my broker safe"],
    is: "A broker is the firm a trader’s orders, and money, pass through. Choosing one is mostly a matter of asking plain questions and insisting on answers that are written down and can be checked. This page sets the questions out in order. It is neutral: it names no firm as good or bad, and it can be held against GIO4X as readily as against anyone else.",
    sections: [
      {
        id: "how",
        title: "How to use the checklist",
        paragraphs: [
          "Take the questions in order, because the early ones decide whether the later ones matter. For each, look for the answer in the firm’s own published documents: its terms, its order execution policy, its fee schedule. If it is not published, ask in writing and keep the reply.",
          "Three kinds of answer are worth telling apart: a statement that can be checked against something outside the firm, a statement that is written down but rests on the firm’s word, and no answer. A missing answer is information too.",
        ],
      },
      {
        id: "authorisation",
        title: "1. Authorisation",
        paragraphs: [
          "Which legal entity would you contract with, which regulator has authorised it, and under what reference? Check the entry on the regulator’s own register and see that it is current and covers the service offered. The primer on regulation sets the steps out.",
          "If a firm names no regulator, that is a fact to weigh and not a gap to fill with assumption. Some firms are licensed in jurisdictions whose rules ask less of them; some are registered companies with no financial licence at all. Know which you are looking at before reading further.",
        ],
      },
      {
        id: "money",
        title: "2. Client money",
        paragraphs: [
          "Where is a client’s money held, and in whose name? The usual questions are whether it is kept in accounts separate from the firm’s own money, with which bank, whether the firm may use it for its own purposes, and what happens to it if the firm fails.",
          "Ask, too, whether an account can go below zero: whether a loss larger than the balance becomes a debt, or whether the firm’s terms limit a client’s loss to the money in the account. The answer should be in the terms, in words, and not only on a marketing page.",
        ],
      },
      {
        id: "costs",
        title: "3. Costs",
        paragraphs: [
          "The cost of a trade has several parts: the spread, any commission, the overnight financing on a position held past the end of the day, and sometimes a conversion charge when the account is in a different currency from the instrument. Beside them stand costs that are not per trade: fees for paying in or taking out, and charges on an account left unused.",
          "A low figure for one part says little about the total. Ask for typical spreads and not only the minimum, for the commission and whether it is charged per side or per round trip, and for the financing rates. Then work one realistic trade through from opening to closing, as in the example below.",
        ],
      },
      {
        id: "execution",
        title: "4. Execution",
        paragraphs: [
          "How is an order filled, and against whom? A firm may take the other side of a client’s trade itself, pass it on to other parties, or do both. Each arrangement is lawful and each has consequences; what matters is that the firm says which it uses. The document to read is the order execution policy.",
          "Ask what happens when the price moves between the click and the fill: whether an order can be filled at a worse price, whether it can also be filled at a better one, and whether it can be refused and requoted. Ask how a stop is treated when the market gaps over it. A firm that publishes figures for execution should also say how they were measured.",
        ],
      },
      {
        id: "platforms",
        title: "5. Platforms",
        paragraphs: [
          "Which platforms are offered, and on which devices? Try each on a demonstration account before paying anything in. Look for what you will actually use: the order types, the charting, how a stop is placed and amended, how statements and history are exported.",
          "Check where the software is downloaded from. A genuine platform comes from the firm’s own official address or from a recognised application store, and a firm should be able to say which addresses are its own.",
        ],
      },
      {
        id: "support",
        title: "6. Support",
        paragraphs: [
          "When is help available, through which channels and in which languages? Test it before opening an account by asking one of the questions on this page in writing. The speed of the reply matters less than whether it answers the question.",
          "Find the complaints procedure as well: who inside the firm handles a complaint, how long they may take, and who outside the firm it can be taken to if it is not resolved.",
        ],
      },
      {
        id: "withdrawals",
        title: "7. Withdrawals",
        paragraphs: [
          "Paying in is always easy. The test of a firm is taking money out. Ask which methods are available for withdrawal, what each costs, how long each takes, what the minimum is, and what documents are required before the first one.",
          "Proof of identity is a legal requirement in most places and is not, by itself, a warning sign. A condition invented at the moment of withdrawal is: a new fee, a tax to be paid to the firm first, a required further deposit or a minimum volume of trading that was never in the terms. A small early withdrawal is an ordinary way to see the process work.",
        ],
      },
      {
        id: "flags",
        title: "8. Warning signs",
        paragraphs: [
          "Some things are not weaknesses to be weighed against strengths. They are reasons to stop.",
        ],
        points: [
          "A promise of profit, a guaranteed return or a claim that losses are impossible.",
          "Pressure to decide today, or a caller who discourages you from checking or from asking anyone else.",
          "A regulator that is named but cannot be found, or a register entry whose details do not match.",
          "A bonus whose conditions prevent the money being withdrawn.",
          "A request to pay into a personal account, in crypto-assets to an individual, or to a company with a different name from the one in the terms.",
          "A request for remote access to your computer or telephone.",
          "Someone offering to trade the account for you informally, outside any written agreement.",
        ],
      },
    ],
    example: {
      title: "Two ways of charging, one trade",
      setup: "Two invented brokers quote the same instrument. On the size traded here, one pip is worth 10. Broker A charges no commission and its spread is 1.4 pips. Broker B charges a commission of 3.50 per side and its spread is 0.4 pips. Each is advertised by its most flattering figure: “no commission” and “spreads from 0.4”.",
      steps: [
        "Broker A, one trade opened and closed: the spread is crossed once. 1.4 pips × 10 = 14.00.",
        "Broker B, the same trade: the spread costs 0.4 × 10 = 4.00, and the commission is charged on opening and on closing, 3.50 × 2 = 7.00. Together 11.00.",
        "On this trade B is cheaper by 3.00, although A is the one that advertises no commission.",
        "Now suppose the position is held for three nights and the overnight financing is 2.00 a night at A and 4.00 a night at B. A comes to 14.00 + 6.00 = 20.00 and B to 11.00 + 12.00 = 23.00. Over three nights A is cheaper by 3.00.",
      ],
      reading: "Neither broker is cheaper in general. Which one costs less depends on the trade: how large, how long it is held, and at what time of day the spread is taken. The only comparison that means anything is the whole cost of the kind of trade a person actually makes, which is why a single advertised number settles nothing.",
    },
    limits: [
      "Which broker to choose. This page names none and recommends none.",
      "Whether any firm’s answers are true. A checklist tells you what to ask; the register, the documents and your own small tests tell you what to believe.",
      "The rules that apply where you live, including whether a given firm may serve you at all.",
      "Whether trading on margin suits you. No choice of broker changes the risk of the product.",
    ],
    here: "The same eight questions can be put to GIO4X, and this is where its answers stand on this website. Regulatory status is not published: the site names no regulator, licence number or register entry, and says so on the page “What we disclose”, which lists every item as published or not yet published. Account types and trading conditions are published as indicative figures on their own pages. The two platforms, 777 Raptor and MetaTrader 5, each have a page that says what is published about them. Funding methods, fees and processing times are not published on this site and are confirmed in the client area. Support hours and an order execution policy are not published. Anything not published can be asked for in writing, and a written answer kept.",
    terms: ["broker", "spread", "swap", "slippage", "requote", "market-maker", "ecn", "non-dealing-desk", "liquidity-provider", "negative-balance", "stop-out", "margin-call"],
    tools: ["cost-lab", "break-even", "swap", "spread-visualizer"],
    lessons: [],
    links: [
      { kind: "Primer", label: "Regulation explained", href: "/primers/regulation-explained", note: "Question 1 in full: the regulators, and the register check step by step." },
      { kind: "Trust", label: "What we disclose", href: "/trust/transparency", note: "GIO4X’s own answers, marked published or not yet published." },
      { kind: "Trust", label: "Client fund security", href: "/trust/client-funds", note: "Question 2: what to ask about client money." },
      { kind: "Comparison", label: "Ways to pay for trading", href: "/side-by-side/ways-to-pay-for-trading", note: "Question 3: spread, commission and financing, side by side." },
      { kind: "Primer", label: "Order types in depth", href: "/primers/order-types-in-depth", note: "Question 4: what each order does when the price moves." },
      { kind: "Platforms", label: "Compare platforms", href: "/platforms/compare", note: "Question 5: the two platforms at GIO4X, side by side." },
      { kind: "Trading", label: "Funding and withdrawals", href: "/trading/funding", note: "Question 7: what is published about paying in and taking out." },
      { kind: "Scam school", label: "Scam school", href: "/scam-school", note: "Question 8: how the commonest frauds work, and a checklist." },
    ],
    faq: [
      { q: "What is the first thing to check about a broker?", a: "Which legal entity you would contract with and whether a financial regulator has authorised it. Look the firm up on the regulator’s own public register, reached by yourself and not through the firm’s link. If no regulator is named, that is the finding." },
      { q: "Is the broker with the lowest spread the cheapest?", a: "Not necessarily. The cost of a trade is the spread, any commission, the overnight financing if it is held, and sometimes a conversion charge. A broker with a wider spread and no commission can cost more or less than one with a narrow spread and a commission, depending on the trade." },
      { q: "How can I test a broker before committing money?", a: "Use a demonstration account to try the platform, put a question to support in writing and see whether it is answered, read the terms on withdrawals, and ask for anything unpublished in writing. Many people also make a small withdrawal early, to see the process work." },
      { q: "Can this checklist be used on GIO4X?", a: "Yes. It was written to be. The section “At GIO4X” says where each answer stands on this website, including the ones that have not been published." },
    ],
  },
  {
    slug: "trading-myths",
    name: "Trading myths",
    title: "Trading myths: ten common beliefs, tested with arithmetic",
    description:
      "Ten common trading beliefs tested against arithmetic: more leverage means more profit, a high win rate means profit, you must be right most of the time, indicators predict, stops are always hunted, a 50% loss needs a 50% gain, doubling up must win, costs are too small to matter, a backtest is proof, and a losing streak means a broken method.",
    card: "Ten things traders are told, each put through a small sum. Most fail on the arithmetic, and one is half true.",
    also: ["forex myths", "does high win rate mean profit", "is stop hunting real", "do indicators predict price", "does martingale work"],
    is: "Much of what a new trader hears is neither true nor false until it is given numbers. This page takes ten common beliefs and puts each through a small sum, using invented round figures. Each section names the tool on this site where the same sum can be run on figures of your own.",
    sections: [
      {
        id: "leverage",
        title: "1. “More leverage, more profit”",
        paragraphs: [
          "Leverage changes the size of the position a given sum can open. It does not change which way the price goes. A stake of 1,000 used in full at 1:100 answers for a position of 100,000. A move of 1% in favour is a gain of 1,000, which doubles the stake. A move of 1% against is a loss of 1,000, which is all of it.",
          "The same 1% move at 1:10 is 100 either way: a tenth of the stake. Leverage multiplies the result in both directions by the same number, and it brings the point at which a position is closed by the provider nearer. More leverage is a larger outcome, with the sign undecided.",
        ],
      },
      {
        id: "win-rate",
        title: "2. “A high win rate means profit”",
        paragraphs: [
          "A win rate counts trades and ignores their size. Take a method that wins nine times in ten, gaining 10 each time, and loses once in ten, losing 100. Over ten trades it gains 90 and loses 100. It is right 90% of the time and loses money.",
          "The figure that joins the two is expectancy: the win rate times the average win, less the loss rate times the average loss. Here 0.9 × 10 − 0.1 × 100 = −1 a trade. The worked example below takes the same sum further.",
        ],
      },
      {
        id: "right",
        title: "3. “You need to be right most of the time”",
        paragraphs: [
          "The opposite case is as easy to build. A method that wins only four times in ten, with each win twice the size of each loss, makes 4 × 2 − 6 × 1 = 2 units over ten trades.",
          "For any ratio of win to loss there is a win rate at which a method only breaks even: one divided by one plus the ratio. At two to one it is one in three, about 33%. At one to one it is 50%. These are figures before costs, and they describe a sum, not a forecast: nothing says a method will achieve the win rate or the ratio written on paper.",
        ],
      },
      {
        id: "indicators",
        title: "4. “Indicators predict”",
        paragraphs: [
          "An indicator is arithmetic on prices that have already printed. A three-period moving average of closes at 10, 11 and 12 is 11. Every number that went into it was known before it was drawn, and it contains nothing else.",
          "An indicator can describe: that recent prices are above their average, or that the last move was fast. Whether what it describes tends to continue is a separate claim, which has to be tested and which a chart cannot prove by looking convincing in hindsight. Chart school gives the sum behind each indicator so that it can be seen for what it is.",
        ],
      },
      {
        id: "stops",
        title: "5. “Stops are hunted every time”",
        paragraphs: [
          "A stop is an instruction to trade when a price is reached. Much of what looks like a hunt is the spread. A chart usually draws the bid. A stop on a short position is a buy order, and is triggered by the ask. If the chart’s high is 1.1000 and the spread is 2 pips, the ask reached 1.1002, and a stop at 1.1002 was filled although the line on the chart never touched it.",
          "Spreads also widen when a market is thin or news is out, and a stop placed inside a market’s ordinary range will be reached by ordinary movement. Many traders place stops at the same obvious levels, so a price that gets there meets a cluster of orders.",
          "None of this says misconduct never happens. Where it does, it is a matter for evidence and for a regulator. The arithmetic says only that a stop being reached is not, by itself, evidence of it.",
        ],
      },
      {
        id: "recovery",
        title: "6. “A 50% loss is recovered by a 50% gain”",
        paragraphs: [
          "An account of 100 that loses 50% holds 50. A gain of 50% on 50 is 25, which makes 75. To return to 100 the account must gain 50 on 50, which is 100%.",
          "The gain needed is the loss divided by what is left. A 10% loss needs about 11%, a 20% loss needs 25%, and a 90% loss needs 900%. The further down an account goes, the steeper the climb back, which is why the size of a loss matters more than the count of losses.",
        ],
      },
      {
        id: "doubling",
        title: "7. “Doubling after a loss must win in the end”",
        paragraphs: [
          "The plan is to stake 1, and after each loss to double, so that the first win recovers everything and leaves a profit of 1. After ten losses in a row the stakes have been 1, 2, 4 and so on up to 512, and the total lost is 1,023. The eleventh stake is 1,024, placed in order to end 1 ahead.",
          "The plan needs an account with no bottom and a provider with no maximum size. Every real account has both limits. The method does not remove the chance of a long run of losses. It collects many small gains and gives them back, with more, in one.",
        ],
      },
      {
        id: "costs",
        title: "8. “Costs are too small to matter”",
        paragraphs: [
          "Take a method that aims for 10 pips and risks 10 pips, with a cost of 1 pip for each round trip. A win now brings 9 and a loss takes 11. To break even the method must win 11 times in 20, which is 55%, where without costs it needed 50%.",
          "The shorter the distance a trade aims for, the larger the share of it that costs take. One pip is a tenth of a 10-pip target and a hundredth of a 100-pip target. A cost that is negligible for one way of trading can be the whole edge of another.",
        ],
      },
      {
        id: "backtest",
        title: "9. “A good backtest proves the method”",
        paragraphs: [
          "Suppose a rule with no merit at all has a 5% chance of looking good on a given stretch of past prices by luck alone. Try twenty unrelated versions of it. The chance that at least one looks good is 1 − 0.95 multiplied by itself twenty times, which is about 64%.",
          "A search through many settings will usually find something that worked, whether or not anything real is there. What separates the two is how the rule was chosen, and how it does on prices it was never shown.",
        ],
      },
      {
        id: "streak",
        title: "10. “A losing streak means the method is broken”",
        paragraphs: [
          "With a win rate of 50%, the chance that five particular trades in a row all lose is 0.5 multiplied by itself five times: about 3%. That sounds rare. But in a series of 100 such trades there are many places for a run of five to begin, and at least one such run is more likely than not.",
          "What a streak does to an account depends on size. Five losses in a row at 1% of the balance each leave about 95% of it. At 10% each they leave about 59%. A streak is ordinary in any series of uncertain outcomes, and the question it raises is less whether the method has failed than whether the account was sized to live through it.",
        ],
      },
    ],
    example: {
      title: "Ninety per cent right, and losing",
      setup: "A method closes winning trades quickly and lets losing ones run. Over 100 trades it wins 90 and loses 10. The average win is 10 and the average loss is 100.",
      steps: [
        "Gains: 90 × 10 = 900. Losses: 10 × 100 = 1,000. The result over 100 trades is −100, or −1 a trade.",
        "Expectancy by the formula: 0.90 × 10 − 0.10 × 100 = 9 − 10 = −1. The two agree.",
        "The win rate at which these sizes only break even: the average loss divided by the sum of the average win and the average loss, 100 ÷ 110, which is about 91%. At 90% the method is just short.",
        "Now keep the 90% and halve the average loss to 50. Expectancy becomes 9 − 5 = +4 a trade. Nothing about how often the method is right has changed.",
      ],
      reading: "The win rate was the same in both cases and the result had the opposite sign. A win rate means nothing until it is set beside the sizes of the wins and the losses. The example leaves out costs, which would take a little more from every trade, winning or losing.",
    },
    limits: [
      "Whether any method makes money. The sums show what follows from a set of figures; they do not say that any real method has those figures.",
      "What your leverage, risk per trade or stop distance should be. Those depend on your circumstances and are yours to set.",
      "Anything about a particular firm’s conduct. The section on stops describes how orders and spreads work in general and accuses nobody.",
      "The future. Every figure here is invented and none is a statistic about markets or about traders.",
    ],
    here: "This site publishes no trading signals, and this page promotes no method. Every sum on it can be repeated here with figures of your own, in calculators that need no account. The Risk Room replays one run of trades at several sizes and shows how often a losing streak turns up. The Rule bench shows how easily one good backtest misleads, on invented prices. None of these tools is advice, and none of them says anything about what a market will do.",
    terms: ["leverage", "margin", "stop-out", "stop-loss", "spread", "drawdown", "risk-reward-ratio", "martingale-strategy", "indicator", "moving-average", "slippage", "money-management"],
    tools: ["leverage-visualizer", "expectancy", "risk-reward", "drawdown", "risk-of-ruin", "cost-lab", "break-even", "spread-visualizer", "position-size"],
    lessons: ["what-is-leverage-and-margin", "risk-reward-ratio-explained", "position-sizing-strategies", "backtesting-optimisation-and-overfitting", "managing-trading-psychology"],
    links: [
      { kind: "Risk", label: "Risk management", href: "/risk", note: "The same sums in order: risk per trade, per day, drawdown and ruin." },
      { kind: "Labs", label: "The Risk Room", href: "/labs/risk-room", note: "Myths 7 and 10: streaks, sizing and ruin, to try." },
      { kind: "Labs", label: "Rule bench", href: "/labs/rule-bench", note: "Myth 9: build a rule and see how a test misleads." },
      { kind: "Academy", label: "Chart school", href: "/chart-school", note: "Myth 4: every indicator with its sum." },
      { kind: "Strategy", label: "Martingale", href: "/strategies/martingale", note: "Myth 7: the doubling plan, described." },
      { kind: "Primer", label: "Order types in depth", href: "/primers/order-types-in-depth", note: "Myth 5: which price triggers which order." },
      { kind: "Academy", label: "Leverage, in six steps", href: "/academy/leverage-story", note: "Myth 1: one stake followed through a 1% move." },
    ],
    faq: [
      { q: "Does a high win rate mean a trading method is profitable?", a: "No. A method that wins nine times in ten loses money if its one loss is larger than its nine wins together. What matters is expectancy: the win rate times the average win, less the loss rate times the average loss, after costs." },
      { q: "Does more leverage mean more profit?", a: "It means a larger result in whichever direction the price goes. Leverage multiplies gains and losses by the same number, and it brings nearer the point at which a losing position is closed by the provider." },
      { q: "Are stop-loss orders deliberately hunted?", a: "A stop being reached is not evidence of that by itself. A stop on a short position is triggered by the ask price, which a chart of bid prices does not show; spreads widen in thin markets; and stops placed inside a market’s ordinary range are reached by ordinary movement. Where misconduct is suspected it is a matter for evidence and for a regulator." },
      { q: "Does doubling the stake after every loss work?", a: "Only with unlimited money and no maximum position size. After ten losses in a row the eleventh stake is 1,024 times the first, placed to end one unit ahead. Real accounts and real providers have limits, and the run that reaches them takes back all the small gains before it." },
    ],
  },
];
