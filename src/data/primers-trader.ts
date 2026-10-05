import type { Primer } from "./primers";

/**
 * MARKET PRIMERS, continued — the four that are about the person trading and
 * the world around the account, not about an instrument: the mind, what moves
 * a currency, Islamic finance, and records for tax. They are joined to
 * PRIMERS in src/data/primers.ts and keep every rule written at the top of
 * that file. Three rules of their own:
 *
 * - the psychology page names habits of mind that are well documented and
 *   gives no figure for how common or how strong any of them is;
 * - the Islamic finance page describes ideas and how accounts are built. It
 *   gives no ruling, names no scholar or body, and states differences of
 *   opinion as differences. What it says about GIO4X is what
 *   /trading/swap-free says (docs/WAITING-FOR-ABE.md, D4 and H6), no more;
 * - the tax page states no rule, rate, threshold or deadline for any country.
 *   It lists what to keep and what to ask.
 */
export const TRADER_PRIMERS: readonly Primer[] = [
  {
    slug: "trading-psychology",
    name: "Trading psychology",
    title: "Trading psychology: biases, tilt, routines and when to stop",
    description:
      "Trading psychology in plain words: loss aversion, recency, confirmation and overconfidence, what tilt and revenge trading are, how a routine and a journal help, and how to decide in advance when to stop for the day. With a worked example.",
    card: "The habits of mind that bend a decision, what tilt is, and the plain tools that help: a routine, a journal, a stopping rule.",
    also: ["trading biases explained", "what is revenge trading", "trading tilt", "loss aversion in trading", "trading routine and journal"],
    is: "A trading rule is carried out by a person, and people do not weigh gains and losses, or old and new information, evenly. This page names the best-documented habits of mind, describes what happens when a trader loses composure, and sets out the ordinary tools used to keep decisions close to the plan: a routine, a journal and a rule for stopping.",
    sections: [
      {
        id: "why",
        title: "Why the mind is part of the method",
        paragraphs: [
          "A plan on paper says when to open a trade, where it is wrong and how much is at risk. Between the plan and the result stands the person who has to carry it out, with money at stake and a price moving on the screen.",
          "Psychologists and economists have documented, over several decades, ways in which judgement departs from plain arithmetic when outcomes are uncertain. These are not faults of character and they are not confined to beginners. They are tendencies of ordinary thinking, and they show most when the stakes feel high and the feedback is quick, which describes a trading screen well.",
          "Knowing their names does not remove them. It makes them easier to recognise in one’s own record, which is where the tools further down this page come in.",
        ],
      },
      {
        id: "biases",
        title: "Four biases, in plain words",
        paragraphs: [
          "Loss aversion. A loss is felt more keenly than a gain of the same size. In trading it tends to show as closing a winning trade early, to make the gain safe, and holding a losing one, because closing it would make the loss real. The pattern of selling winners and keeping losers is well enough known to have a name, the disposition effect.",
          "Recency. What happened last is given more weight than what happened over a longer time. Three wins in a row feel like skill and three losses feel like a broken method, although a run of either length is ordinary in any series of uncertain outcomes.",
          "Confirmation. Once a view is formed, evidence that agrees with it is noticed and remembered, and evidence against it is explained away. A trader who is long finds the reasons to stay long.",
          "Overconfidence. People tend to rate their own judgement, and the precision of their own forecasts, higher than the results justify. It grows after a good stretch, and it tends to show as larger positions and more trades.",
        ],
        points: [
          "Each of these bends a decision in a direction that can be predicted, which is why they can be planned for.",
          "None of them is a signal. Recognising a bias says something about the decision, and nothing about what the price will do.",
        ],
      },
      {
        id: "tilt",
        title: "Tilt and revenge trading",
        paragraphs: [
          "Tilt is a word borrowed from card players. It describes a state in which emotion, usually after a loss or a run of losses, has taken over from the plan: decisions come faster, sizes grow, and the rules that were clear in the morning are set aside.",
          "Revenge trading is its commonest form. A loss is felt as something to be won back at once, from the same market, so the next trade is opened quickly and often larger. The trade is not taken because the plan calls for it. It is taken because of the previous trade.",
          "The arithmetic is unforgiving. A larger position after a loss puts more of a smaller balance at risk, and a loss needs a larger percentage gain to recover than the loss itself was. Tilt after a win exists too: a run of gains can lead to the same abandonment of size and rule, from the opposite mood.",
          "Common early signs are physical and behavioural: a quickened pulse, moving a stop that was fixed, opening a trade within moments of closing one, watching the balance instead of the chart. They are easier to act on when they have been written down in advance as reasons to pause.",
        ],
      },
      {
        id: "routines",
        title: "Routines: decide before the screen is moving",
        paragraphs: [
          "A routine moves decisions to a time when nothing is at stake. What may be traded, how much is at risk on each trade, where a trade is wrong and what ends the session are settled beforehand and written down. During the session the only question left is whether the conditions written down have been met.",
          "A routine usually has three parts. Before: a look at the calendar of scheduled releases, the plan for the day and an honest note of one’s own state, since tiredness and distraction are conditions too. During: the plan, followed. After: the record, filled in while the reasons are still remembered.",
          "A routine does not make a method profitable. It makes the results a fair test of the method, because the method is what was actually traded.",
        ],
      },
      {
        id: "journal",
        title: "The journal as a tool",
        paragraphs: [
          "Memory is a poor record of trading. It keeps the vivid trades and loses the dull ones, and it rewrites the reasons afterwards. A journal is the correction: for each trade, what the plan was, what was done, what happened and what state the trader was in.",
          "Its use is in the reading, not the writing. Read over some weeks, a journal can show whether losing trades were held longer than winning ones, whether size rose after losses, whether results differ by time of day or by mood, and how often the plan was not followed. Those are the biases above, found in one’s own figures.",
          "A journal records what happened. It cannot say what will happen, and a small number of trades shows very little: a pattern in twenty entries may be chance.",
        ],
      },
      {
        id: "stop",
        title: "When to stop for the day",
        paragraphs: [
          "The decision to stop is best made before the session, because the moment it is needed is the moment judgement is least reliable. A stopping rule is a line written in advance. Common forms are a limit on the day’s loss, a limit on the number of losing trades in a row, a limit on the number of trades, and a fixed time.",
          "A stopping rule also covers the good day. Some traders stop after a set gain or a set number of trades, not because gains are dangerous but because the plan described a number of decisions, and the decisions after that are unplanned.",
          "Stopping does not recover a loss and does not prevent the next one. What it limits is the damage done in the state least suited to deciding. The amounts are for each person to set: nothing here says what a limit should be.",
        ],
      },
    ],
    example: {
      title: "One morning, ended two ways",
      setup: "An account holds 10,000. The plan risks 100 on each trade and says to stop for the day after three losing trades in a row. The morning brings three losses.",
      steps: [
        "After three losses of 100 the balance is 9,700. The day’s loss is 300, which is 3% of the starting balance.",
        "First ending: the rule is kept and the session ends. To return to 10,000 the account needs a gain of 300 on 9,700, which is about 3.1%.",
        "Second ending: the rule is set aside. A fourth trade is opened at once with 200 at risk, to win back two losses in one. It loses: 9,500. A fifth is opened with 400 at risk. It loses: 9,100.",
        "The day’s loss is now 900. To return to 10,000 the account needs a gain of 900 on 9,100, which is about 9.9%.",
      ],
      reading: "The fourth and fifth trades might have won; nothing in the example says they had to lose. The point is what was put at risk and why: 600 more than the plan allowed, on two trades chosen because of the three before them. The plan’s own loss was 300. The other 600 belongs to the decision to continue.",
    },
    limits: [
      "How to make a profit. Composure makes results a fair test of a method; it does not give a method an edge.",
      "What your own limits should be: the risk per trade, the daily loss or the number of trades. Those depend on your circumstances and are yours to set.",
      "How strong or how common any bias is. The research is large and its figures depend on how each study was set up, so none is quoted here.",
      "Anything about health. Persistent distress, sleeplessness or trading that feels compulsive is a matter for a doctor or a qualified counsellor, not for a trading page.",
    ],
    here: "GIO4X offers no coaching and no assessment of any client’s temperament, and nothing on this site measures one. What the site does have is tools to try these ideas on: the Mind Room is four games about the person in front of the screen, played on generated charts; the journal keeps a private record of trades in your own browser and sends it nowhere; the Risk Room replays one run of trades at several position sizes; and the trading plan builder prints your rules in your own words. None of them is advice, and none of them says anything about future results.",
    terms: ["drawdown", "risk-management", "money-management", "stop-loss", "sentiment", "leverage", "volatility"],
    tools: ["drawdown", "position-size", "risk-reward", "expectancy", "risk-of-ruin"],
    lessons: ["managing-trading-psychology", "position-sizing-strategies", "risk-reward-ratio-explained", "testing-a-set-of-rules"],
    links: [
      { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "Four games about the person in front of the screen." },
      { kind: "Tool", label: "Trading journal", href: "/journal", note: "A private record of trades, plan and mood, kept in your browser." },
      { kind: "Labs", label: "The Risk Room", href: "/labs/risk-room", note: "Losing streaks, position size and the gain needed to recover a loss." },
      { kind: "Tool", label: "Trading plan builder", href: "/trading-plan", note: "Your rules in your own words, to print." },
      { kind: "Academy", label: "What kind of trader are you?", href: "/academy/trader-type", note: "Ten questions on how you work." },
    ],
    faq: [
      { q: "What is revenge trading?", a: "Opening a trade in order to win back a loss just taken, usually quickly and often at a larger size. The trade is prompted by the previous result and not by the plan. It puts more of a reduced balance at risk at the moment judgement is least steady." },
      { q: "Can trading biases be removed?", a: "Not by knowing about them. They are tendencies of ordinary thinking. What can be done is to make decisions in advance, in writing, and to keep a record that shows afterwards where the decisions and the plan parted." },
      { q: "Does a trading journal improve results?", a: "A journal shows what was done: whether the plan was followed, how long losing and winning trades were held, what size was used after a loss. That makes it possible to change behaviour. It does not make a method profitable, and it says nothing about future trades." },
    ],
  },
  {
    slug: "what-moves-a-currency",
    name: "What moves a currency",
    title: "Fundamental analysis for currencies: what moves an exchange rate",
    description:
      "Fundamental analysis for currencies explained: interest-rate differentials, inflation and purchasing power, the balance of payments and the current account, terms of trade, growth, risk sentiment and what central banks say, and how to read an economic release without predicting. With a worked example.",
    card: "Rates, inflation, trade, growth, mood and central banks: the forces behind an exchange rate, and how to read a release.",
    also: ["forex fundamental analysis", "interest rate differential explained", "current account and currency", "how to read economic data releases", "what moves exchange rates"],
    is: "An exchange rate is the price of one currency in terms of another, so it reflects two economies at once. Fundamental analysis is the study of the conditions behind that price: interest rates, inflation, trade, growth, the mood of investors and the words of central banks. It explains why a currency is valued as it is. It does not say where the price goes next.",
    sections: [
      {
        id: "two-sides",
        title: "A price with two sides",
        paragraphs: [
          "Every currency is quoted against another. A pair can rise because the first currency is wanted, because the second is not, or both. A fact about one country matters to a pair only in comparison with the same fact about the other.",
          "The forces below work together, over different lengths of time, and sometimes against one another. Interest rates and sentiment tend to show within days. Inflation and the balance of payments work over years. At any moment one of them usually has the market’s attention, and which one it is changes.",
          "One more thing sits over all of them: prices move on what is new. What is already expected is, as far as anyone can tell, already in the price.",
        ],
      },
      {
        id: "rates",
        title: "Interest-rate differentials",
        paragraphs: [
          "Money held in a currency earns that currency’s interest rate. Other things being equal, a higher rate makes a currency more attractive to hold, and the gap between the rates of two currencies, the differential, is the first thing many analysts look at.",
          "What matters is less the level today than the path expected. If a rise in rates is widely expected, the currency has usually moved before the decision, and the decision itself changes little. A rise smaller than expected can weaken a currency even though rates went up.",
          "The differential is also the source of the carry trade, which holds a higher-yielding currency funded in a lower-yielding one, and of the overnight financing applied to a leveraged currency position. The income from a differential is small beside the movement of an exchange rate, and a fall in the rate can remove a year of it in a day.",
          "A high interest rate is not a sign of strength by itself. Rates are often high because inflation is high, which is the next force.",
        ],
      },
      {
        id: "inflation",
        title: "Inflation and purchasing power",
        paragraphs: [
          "Inflation is the rate at which money loses its power to buy. A currency that loses purchasing power faster than another tends, over long periods, to fall against it. The idea that exchange rates move towards the level at which the same goods cost the same in both countries is called purchasing power parity.",
          "As a guide to the long run it is reasonable, and as a guide to the next months it is poor: exchange rates stay far from such levels for years.",
          "In the short run the link often runs the other way. A higher inflation figure can lift a currency, because it leads the market to expect the central bank to raise rates. For this reason analysts compare real interest rates, meaning the interest rate less inflation, and not the headline rate alone.",
        ],
      },
      {
        id: "payments",
        title: "The balance of payments and the current account",
        paragraphs: [
          "The balance of payments is a country’s account with the rest of the world. Its current account records trade in goods and services, income from investments abroad and transfers. Its financial account records investment flowing in and out.",
          "A country with a current account deficit is buying more from the world than it sells to it, and the difference is covered by money coming in from abroad: foreign purchases of its shares, bonds, companies and property. While that money comes willingly the deficit can last a very long time. If it stops, the usual adjustment is a lower currency.",
          "A surplus is the reverse: a steady source of demand for the currency. Neither is good or bad in itself. A deficit is a dependence, and how much it matters depends on how it is financed and on the mood of the moment.",
        ],
      },
      {
        id: "terms",
        title: "Terms of trade",
        paragraphs: [
          "The terms of trade are the prices of what a country exports compared with the prices of what it imports. When export prices rise against import prices the country earns more for the same goods, and demand for its currency tends to rise with them.",
          "This is why the currencies of countries that export raw materials are often watched alongside the prices of those materials, and why a country that imports its energy can see its currency weaken when energy becomes dear. The link is a tendency. It is strong in some periods and absent in others.",
        ],
      },
      {
        id: "growth",
        title: "Growth",
        paragraphs: [
          "A growing economy tends to attract investment and tends to bring higher interest rates, and both support a currency. Growth is measured by gross domestic product and is watched between its quarterly figures through employment, retail sales and surveys of business.",
          "Growth matters to a currency mostly through the other forces: what it implies for interest rates and what it draws in from abroad. Fast growth that pulls in imports and widens a deficit can sit beside a weaker currency.",
        ],
      },
      {
        id: "sentiment",
        title: "Risk sentiment",
        paragraphs: [
          "At times none of a country’s own figures explains its currency. When investors are fearful they sell what they regard as risky and move into what they regard as safe, and when they are confident they do the reverse. Some currencies have tended to be bought in fearful periods and some sold, largely regardless of that week’s data.",
          "These habits are observations about the past. Which currencies play which part has changed over the decades and is not guaranteed in any one episode.",
        ],
      },
      {
        id: "central-banks",
        title: "What central banks say",
        paragraphs: [
          "A central bank sets the short-term interest rate, and it also talks: statements, minutes of meetings, forecasts, speeches and press conferences. Because expected rates matter more than present ones, the words can move a currency as much as a decision.",
          "A tone that leans towards higher rates is called hawkish, and one that leans towards lower rates is called dovish. Readers compare each statement with the last and note what was added and what was taken out.",
          "Each bank has a mandate set in law, usually stable prices and sometimes employment as well, and a published calendar of meetings. Its own publications are the source. A summary of them, this one included, is not.",
        ],
      },
      {
        id: "release",
        title: "Reading a release without predicting",
        paragraphs: [
          "An economic release is a scheduled publication of a figure. Reading one is a matter of description, and it can be done the same way each time.",
        ],
        points: [
          "Know what it measures, who publishes it and how often. A monthly survey and a quarterly account are different kinds of evidence.",
          "Set the figure beside what was expected. The market’s reaction is to the difference, not to the figure.",
          "Look at the revision to the previous figure. A strong number with a large downward revision to the last one is a mixed report.",
          "Look inside it. A headline can point one way and its parts another.",
          "Ask what it changes for the central bank. A figure that does not alter the expected path of rates often moves little.",
          "Then watch what the price does, and say only that. The same surprise has been followed by different reactions on different days, and the first move in the minutes after a release is often not the one that lasts.",
        ],
      },
    ],
    example: {
      title: "One release, read in order",
      setup: "A country publishes its yearly rate of inflation each month. Last month’s figure was 3.0%. Before the release, forecasters expect 3.0% again. The central bank has said it will act if inflation does not fall.",
      steps: [
        "The figure is published: 3.4%. Last month’s 3.0% is unrevised.",
        "The surprise is the figure less the expectation: 3.4 − 3.0 = 0.4 of a percentage point above what was expected.",
        "Inside the release, the measure that leaves out food and energy rose as well, from 2.8% to 3.1%. The headline and its parts point the same way.",
        "What it changes: inflation is not falling, which is the condition the central bank named. A higher interest rate now looks more likely than it did an hour ago.",
        "What can be said: this was a higher figure than expected, of a kind that tends to raise expected interest rates. What cannot be said from the release: that the currency will rise, or by how much.",
      ],
      reading: "The currency may rise on higher expected rates. It may also fall, if the market decides that the inflation is damaging growth, or if the rise had been rumoured and positions were already in place. The reading describes the release. The price is a separate observation, made afterwards.",
    },
    limits: [
      "Where any exchange rate is going. Every force on this page is a tendency with well-known exceptions, and none of them gives a date.",
      "Any current interest rate, inflation figure or meeting date. Those change and belong to the body that publishes them.",
      "How the forces are weighed against each other at a given moment. That is judgement, and informed people differ.",
      "How quickly a release is reflected in a price, or what the spread and the fill will be in the minutes around it. Conditions at those times can differ sharply from the ordinary.",
    ],
    here: "GIO4X lists currency pairs among its instruments, and this site explains the calendar around them without printing dated figures: Economic Events describes what each scheduled release measures and links to the publisher’s own calendar, and Central Bank Watch gives each bank’s mandate, the body that sets policy and where it publishes its decisions. GIO4X publishes no forecasts, no analysts’ calls and no trade ideas, and nothing on this site should be read as one.",
    terms: ["fundamental-analysis", "interest-rate-differential", "carry-trade", "inflation", "balance-of-payments", "gdp", "monetary-policy", "hawkish", "dovish", "safe-haven", "sentiment", "swap"],
    tools: ["swap", "currency-converter", "correlation"],
    lessons: ["central-bank-policies-explained", "trading-the-news", "understanding-currency-pairs"],
    links: [
      { kind: "Markets", label: "Economic Events", href: "/markets/events", note: "What each scheduled release measures, and who publishes it." },
      { kind: "Markets", label: "Central Bank Watch", href: "/markets/central-banks", note: "Each bank’s mandate, its committee and where it publishes." },
      { kind: "Markets", label: "Currency strength", href: "/markets/currency-strength", note: "How the major currencies have moved against each other. Descriptive, not a signal." },
      { kind: "Primer", label: "Bonds and interest rates", href: "/primers/bonds-and-interest-rates", note: "Price, yield and the curve, and why currencies watch them." },
      { kind: "Labs", label: "The Mind Room", href: "/labs/mind", note: "One of its games asks which way a headline sends a price." },
    ],
    faq: [
      { q: "What is fundamental analysis in forex?", a: "The study of the economic conditions behind an exchange rate: interest rates, inflation, trade and the balance of payments, growth, investor sentiment and central bank policy. It is used to understand why a currency is valued as it is. It does not give a price or a date." },
      { q: "Why does a currency sometimes fall on good news?", a: "Because prices move on the difference between what was published and what was expected. A good figure that was smaller than expected is a disappointment, and a good figure that was fully expected may already be in the price. Positions built before the release are often closed after it, whatever it says." },
      { q: "Does a higher interest rate always strengthen a currency?", a: "No. A higher rate tends to support a currency when it is higher than expected and when it is not simply keeping pace with higher inflation. A rate rise that was expected, or that is taken as a sign of trouble, can be followed by a weaker currency." },
    ],
  },
  {
    slug: "islamic-finance-and-trading",
    name: "Islamic finance and trading",
    title: "Islamic finance and trading: riba, gharar and swap-free accounts",
    description:
      "An Islamic finance primer for traders: what riba and gharar mean, why overnight interest on a leveraged position matters, what a swap-free account is and is not, where scholars differ, and why suitability is a question for the reader and a qualified scholar. With a worked example.",
    card: "Riba, gharar, why overnight interest matters, and what a swap-free account does and does not change.",
    also: ["is forex trading halal", "what is riba", "what is gharar", "Islamic trading account explained", "swap-free account meaning"],
    is: "Islamic finance is a body of principles, drawn from Islamic law, about how money may be earned, lent and exchanged. Two of them bear directly on leveraged trading: the prohibition of riba, usually translated as interest or usury, and the avoidance of gharar, excessive uncertainty in a contract. This page explains the ideas and how a swap-free account relates to them. It gives no ruling.",
    sections: [
      {
        id: "scope",
        title: "What this page is, and is not",
        paragraphs: [
          "This is a description of ideas and of how accounts are built, written for readers of any background. It is not a religious ruling, it does not speak for any scholar or school, and it does not say that any product is permissible or impermissible.",
          "Islamic commercial law has been developed over many centuries by scholars working in several schools of thought, and qualified scholars reach different conclusions on modern financial products. Where they differ, this page says that they differ.",
        ],
      },
      {
        id: "riba",
        title: "Riba",
        paragraphs: [
          "Riba is commonly translated as usury or interest. In its central sense it is an increase stipulated on a loan: the lender receives back more than was lent, as a condition of lending, whatever becomes of the money in the borrower’s hands.",
          "The prohibition of riba is one of the foundations of Islamic finance. The reasoning usually given is that money is a means of exchange and not a thing that should earn by the passing of time alone, and that a return ought to come with a share in the risk of a real undertaking. The arrangements Islamic finance uses in place of interest-bearing loans follow from that: partnerships that share profit and loss, sales at a disclosed mark-up, and leasing.",
          "The classical texts also deal with riba in exchange. When money is exchanged for money, the exchange is expected to be completed at once, hand to hand, and not deferred. That rule is the starting point for most discussions of currency trading.",
        ],
      },
      {
        id: "gharar",
        title: "Gharar and maysir",
        paragraphs: [
          "Gharar is excessive uncertainty or ambiguity in a contract: about what is being sold, whether it exists, whether it can be delivered, or what the price is. Some uncertainty is part of all commerce and is accepted. What is avoided is uncertainty so great that one party cannot know what they have agreed to.",
          "Maysir is gambling: gain that comes from chance alone, where one party’s gain is simply the other’s loss. It is prohibited, and it is the idea raised most often when short-term speculation is discussed.",
          "Where trade ends and gambling begins, and how much uncertainty is too much, are matters of judgement. They are among the points on which scholars differ.",
        ],
      },
      {
        id: "overnight",
        title: "Why overnight interest matters",
        paragraphs: [
          "A leveraged currency position is, in effect, held with borrowed money. When it is carried from one trading day to the next, an ordinary account applies a financing adjustment called swap, worked out from the difference between the interest rates of the two currencies together with the provider’s own adjustment. It can be a charge or a credit.",
          "Because it is worked out from interest rates and applied for the passing of time, swap is widely regarded as riba, whichever way it runs. A credit is not exempt: receiving interest is treated in the same way as paying it.",
          "This is the one part of an ordinary trading account about which there is the least disagreement, and it is the part a swap-free account is designed to remove.",
        ],
      },
      {
        id: "swap-free",
        title: "What a swap-free account is, and is not",
        paragraphs: [
          "A swap-free account, often called an Islamic account, is one on which no swap is charged or credited when a position is held overnight. That is the whole of its definition.",
          "It does not change what is traded or how. The spread is still paid, any commission is still charged, and the position is still leveraged and needs margin. Providers commonly apply an administrative charge to positions held on such an account, often after a number of nights; the charge is described as a fee and is not worked out from an interest rate.",
          "A swap-free account is therefore an account with one feature removed. It is not a certificate. Calling an account Islamic describes whom it is intended for, and does not establish that everything done on it meets the requirements of Islamic law.",
        ],
        points: [
          "It removes: swap at rollover, charged or credited.",
          "It leaves: the spread, commission, leverage, margin and the risk of loss.",
          "It may add: an administrative charge under the provider’s own terms.",
        ],
      },
      {
        id: "differences",
        title: "Where scholars differ",
        paragraphs: [
          "Removing swap answers one question and leaves others open. On each of the following, qualified scholars have reached different conclusions, and this page does not choose between them.",
        ],
        points: [
          "Leverage. Some regard the provider’s funding of a position as a loan tied to a sale, from which the lender benefits through spreads and commissions, and object to it on that ground. Others regard it as permissible where no interest is charged.",
          "Settlement. The rule that currencies be exchanged at once is read by some as satisfied when an account is credited immediately, and by others as not satisfied where nothing is delivered and settlement is a matter of book entries.",
          "Contracts for difference. Because nothing is owned or delivered, some regard a contract that only follows a price as closer to a wager than to a sale. Others distinguish it by its use and its terms.",
          "Administrative charges. Some accept a fixed fee for a service. Others ask whether a charge that grows with the time a position is held is interest under another name.",
          "Speculation. Some hold that very short-term trading for price movement alone approaches maysir. Others hold that taking a considered view on a price, with one’s own money at risk, is ordinary trade.",
        ],
      },
      {
        id: "suitability",
        title: "Suitability is a personal question",
        paragraphs: [
          "Whether a particular account, used in a particular way, is acceptable is a question about a person’s own religious obligations. A provider cannot settle it by naming an account, and a general page cannot settle it at all.",
          "The person to ask is a scholar qualified in Islamic commercial law whom the reader trusts, with the provider’s actual terms in hand: what is charged in place of swap and when, which instruments are covered, how positions are funded and settled, and what happens if the option is withdrawn.",
          "It is also a financial question in the ordinary way. A swap-free account carries every risk of leveraged trading. Removing interest does not remove the possibility of losing the money placed in the account.",
        ],
      },
    ],
    example: {
      title: "Five nights, on two accounts",
      setup: "The same position is held for five nights, from Monday to the following Saturday morning, on an ordinary account and on a swap-free one. On the ordinary account swap is a charge of 2 a night, with three nights applied at once on Wednesday. On the swap-free account the provider’s terms, invented for this illustration, apply no charge for the first three nights and an administrative fee of 3 a night after that.",
      steps: [
        "Ordinary account: Monday 2, Tuesday 2, Wednesday 6, Thursday 2, Friday 2. Total swap: 14.",
        "Swap-free account: Monday, Tuesday and Wednesday nothing; Thursday 3; Friday 3. Total fees: 6.",
        "Hold the position for ten nights on the same terms and the swap-free account is charged 3 on each of seven nights: 21.",
        "On both accounts the spread was paid when the position was opened, and the position gained or lost with the price in exactly the same way.",
      ],
      reading: "The swap-free account was cheaper over five nights and need not be over a longer period: that depends entirely on the terms. The religious question is a different one from the cost. It is whether the fee is a charge for a service or interest by another name, and that is the question to put to a scholar with the provider’s real terms in hand.",
    },
    limits: [
      "Whether any account, product or way of trading is halal or haram. That is a ruling, and this page gives none.",
      "The view of any particular scholar, school or standard-setting body. None is cited, and they do not all agree.",
      "The terms of any provider’s swap-free account: its fees, the nights it allows or the instruments it covers. Those are in the provider’s own documents.",
      "Anything about zakat, inheritance or the rest of Islamic personal finance, which are separate subjects.",
    ],
    here: "GIO4X’s published position on overnight swap for each account, and the terms on which a swap-free option is offered for now, are on the swap-free accounts page and are stated there exactly. In short: the option is available on request and subject to approval, it is intended for clients who cannot pay or receive interest for reasons of religious belief, and it may be withdrawn where it is used to exploit the absence of swap. Those terms are provisional. No administrative charge, number of nights or list of instruments has been set, so none is stated. GIO4X gives no religious ruling and does not say that any of its accounts meets any religious requirement.",
    terms: ["swap", "rollover", "leverage", "margin", "spread", "cfd", "interest-rate-differential", "carry-trade"],
    tools: ["swap", "cost-lab"],
    lessons: ["what-is-leverage-and-margin"],
    links: [
      { kind: "Trading", label: "Swap-free accounts", href: "/trading/swap-free", note: "What GIO4X publishes, and its provisional terms." },
      { kind: "Trading", label: "Account types", href: "/trading/accounts", note: "Overnight swap as published for each account." },
      { kind: "Tools", label: "Swap calculator", href: "/tools/swap", note: "What holding a position overnight adds up to." },
      { kind: "Primer", label: "What moves a currency", href: "/primers/what-moves-a-currency", note: "Interest-rate differentials, where swap comes from." },
      { kind: "Company", label: "Contact", href: "/contact", note: "To ask about a swap-free option in writing." },
    ],
    faq: [
      { q: "What is riba?", a: "Riba is commonly translated as usury or interest. In its central sense it is an increase stipulated on a loan, received by the lender as a condition of lending. Its prohibition is one of the foundations of Islamic finance, and the interest-based swap applied to a leveraged position overnight is widely regarded as falling within it." },
      { q: "Does a swap-free account make trading halal?", a: "A swap-free account removes overnight swap, which is one concern. Scholars differ on others, among them leverage, settlement, contracts for difference and fees charged in place of swap. Whether trading on a given account is acceptable is a ruling for a qualified scholar, not something an account’s name or this page can establish." },
      { q: "Is a swap-free account free of charges?", a: "No. The spread and any commission still apply, and providers commonly apply an administrative charge to positions held over a number of nights. The charge is a fee and not interest, and it is a cost all the same. What applies is in each provider’s own terms." },
    ],
  },
  {
    slug: "tax-and-record-keeping",
    name: "Tax and record keeping",
    title: "Tax and record keeping for traders: what to keep, what to ask",
    description:
      "Record keeping for traders, by principle: the statements, dates, sizes, prices, costs and currency conversions worth keeping, the questions to ask a tax adviser, and why the rules differ from country to country. No country’s rules, rates or thresholds are stated. With a worked example.",
    card: "What records to keep, what to ask an adviser, and why no single answer fits every country.",
    also: ["trading records for tax", "what records should a trader keep", "questions to ask a tax adviser about trading", "forex tax record keeping", "trading statements and tax"],
    is: "How trading is taxed depends on where a person lives, what they trade and their own circumstances, and no general page can answer it. What can be said in general is what to keep. Good records make any tax question answerable, whatever the rules turn out to be, and this page sets out what those records are and what to ask someone qualified.",
    sections: [
      {
        id: "scope",
        title: "What this page can and cannot do",
        paragraphs: [
          "This page states no rule, rate, threshold, allowance or deadline for any country. It is not tax or legal advice. The answers belong to the tax authority where you are resident and to a qualified adviser who knows your situation.",
          "What it offers is the part that is the same everywhere: an account of the records a trader generates, why each matters, and the questions whose answers differ by country.",
        ],
      },
      {
        id: "why-differ",
        title: "Why the rules differ",
        paragraphs: [
          "Tax law is national, and each country has made its own choices. The differences are not details. They are differences of kind.",
        ],
        points: [
          "What a gain is. The same result may be treated as income, as a capital gain, as something else, or not taxed at all, and the treatment may depend on how often a person trades or whether it is their occupation.",
          "What the product is. A spot position, a contract for difference, a future, an option and a share may each fall under a different rule.",
          "When a gain counts. Some systems count a gain when a position is closed, some value open positions at the end of the year, and some look at other events.",
          "What happens to losses. Whether a loss can be set against gains, against other income, or carried to another year varies widely.",
          "Who the person is. Residence, employment, trading through a company and holding an account abroad can each change the answer.",
        ],
      },
      {
        id: "records",
        title: "The records worth keeping",
        paragraphs: [
          "Whatever the rule, it will be applied to facts. These are the facts, and all of them exist at the moment a trade is made. They are far easier to keep than to rebuild.",
        ],
        points: [
          "Account statements, for every period, as issued by the provider. They are the primary record, and everything else is checked against them.",
          "For each trade: the instrument, whether it was a buy or a sell, the size, the date and time it was opened and closed, and the price at each.",
          "The result of each trade in the currency of the account.",
          "Costs, separately: the spread where it is shown, commission, overnight financing charged or credited, and any other fee. Costs are often treated differently from gains and from one another.",
          "Deposits and withdrawals, with dates, amounts and the method used. Money moved in or out is not a gain or a loss, and the record is what shows it.",
          "Currency conversions: when the account, a deposit or a withdrawal is in a currency other than the one you report in, the date, the amounts on both sides and the rate applied.",
          "Corrections and adjustments made by the provider, such as a dividend adjustment on an index or a rollover adjustment, with the provider’s own description.",
          "Related expenses you might be asked about, such as data, software or equipment, with receipts.",
        ],
      },
      {
        id: "keeping",
        title: "Keeping them well",
        paragraphs: [
          "Download statements when they are issued, and keep them as issued. An account that is closed, or a provider that changes its systems, may no longer offer old periods. Keep a second copy somewhere other than the device you trade on.",
          "Keep your own running record beside them: a spreadsheet or a journal with one line to a trade. It is not a substitute for the statements. It is the index to them, and it is the place to note what a statement does not show, such as why a withdrawal was made.",
          "Reconcile the two from time to time: the opening balance, plus deposits, less withdrawals, plus or minus the results and costs, should arrive at the closing balance. A difference found within a month is quickly explained. One found years later may not be.",
          "How long records must be kept is itself a rule that differs by country, and is one of the questions below.",
        ],
      },
      {
        id: "conversion",
        title: "Currency conversion",
        paragraphs: [
          "A trader whose account is in one currency and whose tax return is in another has a second set of figures to produce. The result of a trade in the account’s currency has to be expressed in the reporting currency, and exchange rates move.",
          "Countries differ on which rate is to be used: the rate on the day of each trade, an average for the period, the rate on the day money was brought home, or a rate the authority itself publishes. The choice can change the reported figure, as the example below shows.",
          "The practical point is to record dates and amounts in the original currency for everything. With those, any method can be applied afterwards. Without them, none can.",
        ],
      },
      {
        id: "questions",
        title: "Questions to ask a tax adviser",
        paragraphs: [
          "These are the questions whose answers this page cannot give. Taking them, with your records, to a qualified adviser or to your tax authority is the purpose of keeping the records.",
        ],
        points: [
          "Where I live, how is a gain from the products I trade treated, and does it depend on how often I trade?",
          "When is a gain or a loss counted: at the close of a position, at the end of the year, or at some other point?",
          "Can a loss be set against gains or other income, or carried to another year, and must it be declared to be kept?",
          "How are costs treated: spreads, commission, overnight financing, data and software?",
          "Which exchange rate do I use to convert, and from which source?",
          "Are my provider’s statements enough as evidence, or is something more needed?",
          "Must I report an account held with a firm abroad, even in a year with no gain?",
          "Which records must I keep, in what form and for how long?",
          "When and how do I declare, and when is payment due?",
        ],
      },
    ],
    example: {
      title: "One trade, converted two ways",
      setup: "An account is kept in one currency, called the account currency here, and its holder reports in another, the home currency. One trade is closed with a gain of 200 in the account currency. Commission on it was 10 and overnight financing was 5.",
      steps: [
        "The net result in the account currency is 200 − 10 − 5 = 185.",
        "On the day the trade was closed, one unit of the account currency was worth 0.80 of the home currency. Converted at that rate: 185 × 0.80 = 148.00.",
        "The average rate for the year was 0.78. Converted at that rate: 185 × 0.78 = 144.30.",
        "The same trade is 148.00 by one method and 144.30 by the other: a difference of 3.70 that comes from the method and not from the trading.",
      ],
      reading: "Neither figure is right in general. Which method applies, and whether the costs are deducted in this way at all, are rules of the country concerned. What the example shows is the record that makes either possible: the result, each cost by itself, the date of the trade and the amounts in the original currency.",
    },
    limits: [
      "Any country’s rules: no rate, threshold, allowance, form or deadline is stated here, for any jurisdiction.",
      "Whether you owe tax on your trading, or how much. That depends on law and on your circumstances.",
      "Whether trading is treated as income, capital gain or something else where you live.",
      "Anything that replaces a qualified adviser or the guidance of your own tax authority.",
    ],
    here: "GIO4X does not give tax advice and publishes nothing about how trading is taxed in any country. What a GIO4X account statement contains, and how to obtain one, is not described on this website; it can be asked for in writing through the contact page. The journal on this site keeps a private list of trades in your own browser and can export it as a file: it is a personal record and not a statement of account, and it holds only what you enter. The region guides carry a similar list of tax questions and, like this page, state no rule for any country.",
    terms: ["swap", "spread", "commission", "leverage", "cfd", "equity", "balance"],
    tools: ["profit-loss", "cost-lab", "currency-converter"],
    lessons: [],
    links: [
      { kind: "Tool", label: "Trading journal", href: "/journal", note: "A private list of trades, kept in your browser, with export to a file." },
      { kind: "Guides", label: "Region guides", href: "/guides", note: "The trading day where you are, with the same questions about tax." },
      { kind: "Tools", label: "Cost Lab", href: "/tools/cost-lab", note: "Spread, commission and swap on one trade, each by itself." },
      { kind: "Primer", label: "Trading psychology", href: "/primers/trading-psychology", note: "The journal as a tool for decisions, not only for records." },
      { kind: "Company", label: "Contact", href: "/contact", note: "To ask what a statement contains." },
    ],
    faq: [
      { q: "What records should a trader keep for tax?", a: "The provider’s account statements for every period; for each trade the instrument, direction, size, dates, times and prices; the result of each trade; each cost separately; deposits and withdrawals; and the dates, amounts and rates of any currency conversion. With those, whatever rule applies can be applied." },
      { q: "Is trading taxed as income or as capital gains?", a: "It depends on the country, the product and the person. The same result can be income in one place, a capital gain in another and untaxed in a third, and the treatment can turn on how often a person trades. Only your tax authority or a qualified adviser can say which applies to you." },
      { q: "How long should trading records be kept?", a: "The period is set by each country’s law and differs between them. It is one of the questions to put to an adviser. Until you know the answer, the cautious course is to keep everything, as issued, in more than one place." },
    ],
  },
];
