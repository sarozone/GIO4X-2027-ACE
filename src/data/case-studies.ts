/**
 * CASE STUDIES — the words for /investing/case-studies and its five pages.
 *
 * Each study summarises ideas that a professional investor, or the trade as a
 * whole, has put on the public record: what the idea is, where it was
 * published, one documented example, one failure the record itself admits,
 * what can be studied on paper and what does not scale down to a private
 * account.
 *
 * The rules this file keeps:
 *  - This is the one place on the site where real people are named, because
 *    the subject is their published ideas. Nothing is said about a living
 *    person that is not public record: nothing personal, nothing speculative.
 *  - Every idea is a paraphrase, and the page says so. There are no
 *    quotations anywhere in this file.
 *  - Every source is named by title, author, year and publisher. No links.
 *  - A figure appears only where it is well known and comes from the named
 *    source; otherwise the event is described without one.
 *  - Nothing here is advice, and nothing here says a method will work. A
 *    study explains how someone reasoned. It does not reproduce a result.
 */

export type CaseSlug = "buffett-and-munger" | "bogle" | "dalio" | "soros" | "institutional-process";

export type Source = {
  title: string;
  /** author or issuing body */
  by: string;
  /** publisher or journal, and the year */
  where: string;
  /** what this page takes from it */
  gives: string;
};

export type CaseStudy = {
  slug: CaseSlug;
  /** short name, for cards and breadcrumbs */
  name: string;
  /** the page's h1 and search title */
  title: string;
  description: string;
  /** one line for the index card */
  card: string;
  /** the opening paragraph under the title */
  is: string;
  /** who or what the study is about, in one factual line */
  who: string;
  /** whether the standing note speaks of people or of institutions */
  subject: "people" | "practice";
  also: readonly string[];
  machine: { eyebrow: string; title: string; lead: string };
  /** the ideas, each a paraphrase with the source it comes from */
  ideas: readonly { t: string; d: string }[];
  sources: readonly Source[];
  example: { title: string; paras: readonly string[]; link?: { href: string; label: string } };
  failure: { title: string; paras: readonly string[]; link?: { href: string; label: string } };
  exercise: { title: string; intro: string; steps: readonly string[]; tools: readonly { href: string; label: string; note: string }[]; caution: string };
  /** what does not scale down to a private account */
  notScale: readonly { t: string; d: string }[];
  faq: readonly { q: string; a: string }[];
  /** glossary slugs; only those that exist are shown */
  terms: readonly string[];
};

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "buffett-and-munger",
    name: "Buffett and Munger",
    title: "Buffett and Munger: analysing a business, valuing it and waiting",
    description:
      "A case study of the published ideas of Warren Buffett and Charlie Munger: a share as part of a business, intrinsic value, the margin of safety, the circle of competence and patience. Sources named by title and year, a documented example, the mistakes they recorded themselves, and what does not scale down to a private account.",
    card: "A share as part of a business, an estimate of its value, a margin under it, and a long wait.",
    is: "Warren Buffett’s yearly letters to the shareholders of Berkshire Hathaway, and Charlie Munger’s talks, set out one method in public over several decades: treat a share as part of a business, estimate what the business is worth, pay well under that, and otherwise do nothing. This page summarises what they published. It is not their portfolio and it is not a method to copy.",
    who: "Warren E. Buffett (born 1930) took control of Berkshire Hathaway in 1965. Charles T. Munger (1924–2023) was its vice-chairman from 1978 until his death.",
    subject: "people",
    also: ["value investing explained", "margin of safety", "intrinsic value", "circle of competence", "Berkshire Hathaway shareholder letters"],
    machine: {
      eyebrow: "The idea, to handle",
      title: "A margin under an estimate, and a wait.",
      lead: "An invented business with an estimated value of 100 and an invented price that wanders. Set how far under the estimate the price must be, then set how wrong the estimate might be, and see how much of the time there is nothing to do.",
    },
    ideas: [
      {
        t: "A share is part of a business.",
        d: "The starting point comes from Benjamin Graham, whose student Buffett was: a share is a part-ownership of a company, and its worth depends on what that company earns over time, not on what its price did last week. Graham also described the market as a partner who offers a different price every day, which the owner is free to take or to ignore. Buffett retells that picture in the 1987 letter.",
      },
      {
        t: "Value is an estimate of future cash, not a fact.",
        d: "The 1992 letter and the Owner’s Manual describe the worth of a business as the cash it can pay its owners over its remaining life, counted in today’s money, an idea Buffett credits to John Burr Williams. Both documents say plainly that this is an estimate: two people with the same facts will arrive at different figures, and the figure changes as the facts do.",
      },
      {
        t: "A margin of safety allows for being wrong.",
        d: "Because the value is only an estimate, the price paid should be well under it, so that a mistake in the estimate need not become a loss. The phrase is Graham’s: The Intelligent Investor gives the idea a chapter of its own. The 1992 letter calls the principle, in paraphrase, the cornerstone of investment success.",
      },
      {
        t: "Stay inside what can be understood.",
        d: "The 1996 letter describes a circle of competence: an investor needs to judge only the businesses he or she can understand, and what matters is knowing where the edge of that circle is, not how large it is. Much of what the letters describe is declining to have an opinion.",
      },
      {
        t: "A good business at a fair price.",
        d: "The 1989 letter says, in paraphrase, that it is better to buy an excellent business at a fair price than a mediocre one at a low price. Buffett credits Munger with moving him to that view; the 2014 letter describes it as Munger’s blueprint for the company.",
      },
      {
        t: "Few decisions, and patience between them.",
        d: "The 1997 letter compares investing to a batter who need not swing at every pitch and can wait for one in the right place. Munger’s talks, collected in Poor Charlie’s Almanack, add two habits: using ideas from several disciplines instead of one, and working backwards from the ways a decision could fail, with a list of the usual errors of judgement to check against.",
      },
    ],
    sources: [
      {
        title: "Chairman’s letters to the shareholders of Berkshire Hathaway Inc.",
        by: "Warren E. Buffett",
        where: "Published by Berkshire Hathaway Inc. each year with its annual report. The letters for 1977 onwards are published by the company. Cited here: 1985, 1987, 1988, 1989, 1992, 1994, 1996, 1997, 1999, 2004, 2007, 2008, 2014 and 2022.",
        gives: "The method in the authors’ own words, the purchases and their cost, and the mistakes.",
      },
      {
        title: "An Owner’s Manual",
        by: "Warren E. Buffett",
        where: "Berkshire Hathaway Inc., first issued in 1996 and reprinted in the company’s annual reports.",
        gives: "The definition of intrinsic value, and the statement that it is an estimate.",
      },
      {
        title: "The Intelligent Investor",
        by: "Benjamin Graham",
        where: "Harper & Brothers, 1949; later revised editions.",
        gives: "The share as part of a business, the market as a moody partner, and the margin of safety.",
      },
      {
        title: "The Theory of Investment Value",
        by: "John Burr Williams",
        where: "Harvard University Press, 1938.",
        gives: "Value as future cash counted in today’s money.",
      },
      {
        title: "Poor Charlie’s Almanack: The Wit and Wisdom of Charles T. Munger",
        by: "Edited by Peter D. Kaufman",
        where: "First published in 2005; reissued by Stripe Press in 2023.",
        gives: "Munger’s talks on using several disciplines, on working backwards and on the psychology of misjudgement.",
      },
    ],
    example: {
      title: "A documented example: a drinks company, 1988 to 1994",
      paras: [
        "The 1988 letter reports for the first time that Berkshire had bought shares in The Coca-Cola Company during that year, and says, in paraphrase, that the intended holding period for a business of this kind was indefinite. More shares were bought in 1989 and again in 1994. The letters give the total cost as about 1.3 billion dollars.",
        "The reasons given in the letters are the ones in the list above: a business Buffett said he understood, selling a product with a strong position in many countries, bought at a price he judged sensible for its prospects. The purchases began the year after the stock market crash of October 1987.",
        "The holding was not sold in the decades that followed. The 2022 letter returns to it: it records that the purchases were completed in 1994 at a cost of 1.3 billion dollars, and that the yearly cash dividend received had grown from 75 million dollars in 1994 to 704 million dollars in 2022.",
        "The example is not a clean one, and the letters say so. In the late 1990s the price of the shares rose far ahead of the business. In the 2004 letter Buffett writes, in paraphrase, that he was at fault for not selling some of the largest holdings when prices were that high. One purchase that turned out well also does not show that the method does: it is the example the authors chose to return to.",
      ],
    },
    failure: {
      title: "The mistakes the letters record",
      paras: [
        "The letters are unusual for listing errors. The 1989 letter has a section on the mistakes of the first twenty-five years. The first on the list is buying control of Berkshire Hathaway itself: a textile manufacturer, cheap on paper, in a business with poor economics. The 1985 letter reports the closing of the textile operation.",
        "The 2007 letter describes the purchase of Dexter Shoe in 1993 as the worst deal Buffett had made to that date. The business lost its competitive position within a few years. The letter adds that paying for it in Berkshire shares instead of cash made the mistake far more costly, because the shares given away went on to be worth many times more.",
        "The 2008 letter records a large purchase of an oil company’s shares made when oil and gas prices were near their peak. The 1999 letter reports the worst result, compared with the wider American stock market, of Buffett’s time in charge to that point: Berkshire had stayed out of technology shares during the boom, and for a time waiting looked like an error.",
        "Munger’s contribution here is a habit as much as an idea. A large part of Poor Charlie’s Almanack is about how capable people make bad decisions, himself included.",
      ],
    },
    exercise: {
      title: "What can be studied with a small paper portfolio",
      intro: "The part of the method that can be practised without money is the analysis and the record of it. The exercise below uses a hypothetical holding and a notebook. It trades nothing.",
      steps: [
        "Choose one listed business whose product you use and believe you understand. Write, in plain words, how it makes money and what could stop it doing so.",
        "Before looking at the share price, write a low and a high figure for what you think the whole business is worth, and how you reached them. Expect the two to be far apart. That gap is the point.",
        "Decide how far under your low figure the price would need to be, and write that down as well.",
        "Then look at the price. Record whether it is under your line. Most of the time it will not be, and the record for that day is one line: nothing to do.",
        "A year later, read the company’s results against what you wrote, not the share price against what you hoped. Note where the reasoning was wrong.",
      ],
      tools: [
        { href: "/journal", label: "The journal", note: "Built for trades, but its plan and what-happened notes hold a written reason and a later review. It stays in your browser." },
        { href: "/investing/stocks", label: "Stocks, explained", note: "What a share is a share of, with an invented company to divide." },
      ],
      caution: "A paper exercise has no cost, no tax and no fear in it. It can show whether the reasoning held. It cannot show what a real holding would have returned.",
    },
    notScale: [
      { t: "Financing terms", d: "Much of the money Berkshire invests is insurance float: premiums held between the day they are paid and the day claims are settled. The letters discuss it regularly. A private person has nothing like it. Borrowing against an account is the opposite kind of financing: it costs interest and can be called in during a fall." },
      { t: "Access to deals", d: "The letters describe buying whole companies by negotiation, and securities bought directly from an issuer on terms that were never offered to the public. Neither is available through a dealing account." },
      { t: "Information and staff", d: "The method rests on decades of full-time reading of company reports, and on being able to speak to the people who run the businesses. A private investor has the published reports and little else." },
      { t: "Tax treatment", d: "A company that holds shares for decades is taxed differently from a private person, and holding without selling puts off the tax on a gain. How a private holder is taxed depends on the country and the kind of account." },
      { t: "Time horizon", d: "Berkshire has no clients who can ask for their money back, so it is never forced to sell in a fall. A person who may need the money for a house, a job loss or retirement does not have a horizon of several decades for all of it." },
      { t: "Liquidity, in reverse", d: "Size works against a very large investor: the letters say repeatedly that large sums can only go into large companies. A small account can buy almost anything, but being able to buy a small company is not the same as being able to judge one." },
      { t: "A leveraged CFD is a different thing", d: "A contract for difference on a share gives no ownership, no vote and no place on the share register. It is usually leveraged, it usually carries a financing charge for every night it is open, and it can be closed out by a margin call. Waiting, which is the heart of this method, is exactly what such a contract charges for." },
    ],
    faq: [
      {
        q: "What is a margin of safety in investing?",
        a: "It is the gap between what an investor estimates a business is worth and the lower price actually paid. The idea, from Benjamin Graham’s The Intelligent Investor (1949), is that the estimate may be wrong, so the price should be far enough under it that an error need not become a loss. It lowers the chance of overpaying. It does not remove the risk of loss.",
      },
      {
        q: "Can I copy Warren Buffett’s portfolio from public filings?",
        a: "Not in any real sense. Public holdings reports are published weeks after the date they describe, cover only some kinds of holding, and give neither the price paid nor the reason. A copier buys later, at a different price, without knowing whether the position has since changed. A private account also lacks the financing, tax position and time horizon that the original holder has.",
      },
      {
        q: "Did Buffett and Munger make mistakes?",
        a: "Yes, and the shareholder letters record them. The 1989 letter lists the mistakes of the first twenty-five years, beginning with the purchase of Berkshire Hathaway’s own textile business. The 2007 letter describes the 1993 purchase of Dexter Shoe as the worst deal Buffett had made to that date. The 1999 letter reports a year far behind the wider market.",
      },
    ],
    terms: ["dividend", "index", "liquidity", "leverage", "cfd"],
  },

  {
    slug: "bogle",
    name: "John Bogle",
    title: "John Bogle: diversification, costs and how an index fund is built",
    description:
      "A case study of John C. Bogle’s published ideas: own the whole market, keep costs low, and leave it alone. Why the average investor must lag the market by the costs paid, how an index fund is put together, the 1976 launch that fell far short of its target, what an index fund does not protect against, and what does not scale down.",
    card: "Own the whole market, pay as little as possible for it, and leave it alone.",
    is: "John C. Bogle founded Vanguard in 1974 and, in 1976, launched the first index fund offered to ordinary investors in the United States. His books argue one thing at length: investors as a group cannot beat the market, because together they are the market, so what each keeps depends on what each pays. This page summarises what he published. It is not a recommendation of any fund.",
    who: "John C. Bogle (1929–2019) founded The Vanguard Group in 1974 and was its chief executive until 1996.",
    subject: "people",
    also: ["index fund explained", "passive investing", "cost matters hypothesis", "how an index fund works", "expense ratio"],
    machine: {
      eyebrow: "The idea, to handle",
      title: "Before costs and after them.",
      lead: "Sixty invented funds that together hold a whole invented market. Before costs they average the market exactly. Set what the funds charge and what an index fund charges, and count how many finish one year ahead of it.",
    },
    ideas: [
      {
        t: "Hold the whole market instead of choosing from it.",
        d: "An index fund holds every share in a published index, in proportion to each company’s size. It gives up the chance of choosing a winner and with it the risk of choosing a loser, or of choosing a manager who does. What remains is the risk of the market itself, in full. The Little Book of Common Sense Investing makes this case in its plainest form.",
      },
      {
        t: "Together, investors are the market.",
        d: "Before costs, the return of all investors added together is the return of the market, because between them they hold all of it. After costs, the group earns the market’s return less what it paid. So the average actively managed pound must lag the market by its costs. That is arithmetic, not a finding about skill. William Sharpe set it out in a short paper in 1991; Bogle called his version the cost matters hypothesis and returned to it in his 2005 paper.",
      },
      {
        t: "A yearly cost compounds, like a return.",
        d: "A charge taken every year is taken from the whole sum, including everything it has grown to. Over decades the money lost is the charges themselves and all that they would have earned. Common Sense on Mutual Funds works through this at length. The index investing page on this site has a working example.",
      },
      {
        t: "The investor’s own timing is a second cost.",
        d: "Bogle distinguishes the return a fund reports from the return its holders actually receive. The second is usually lower, because money tends to arrive after a rise and leave after a fall. His answer was to buy, add steadily and not respond to the market.",
      },
      {
        t: "An index of market weights nearly runs itself.",
        d: "When each share is held in proportion to the company’s market value, the weights move with prices and need no trading to stay in line. The fund deals only when the index changes its members, when money comes in or goes out, and when dividends are paid. Little dealing is a large part of why the cost can be low.",
      },
      {
        t: "Who owns the manager matters.",
        d: "Bogle arranged Vanguard so that the management company is owned by the funds it manages, and so by their investors, and runs at cost. He argued that an ordinary fund manager serves two masters: the fund’s investors and the manager’s own shareholders.",
      },
    ],
    sources: [
      {
        title: "Common Sense on Mutual Funds: New Imperatives for the Intelligent Investor",
        by: "John C. Bogle",
        where: "John Wiley & Sons, 1999; a revised tenth-anniversary edition followed.",
        gives: "The long argument on costs, compounding and the gap between fund returns and investor returns.",
      },
      {
        title: "The Little Book of Common Sense Investing: The Only Way to Guarantee Your Fair Share of Stock Market Returns",
        by: "John C. Bogle",
        where: "John Wiley & Sons, 2007.",
        gives: "The case for owning the whole market at low cost, in short form.",
      },
      {
        title: "The Relentless Rules of Humble Arithmetic",
        by: "John C. Bogle",
        where: "Financial Analysts Journal, 2005.",
        gives: "The cost arithmetic stated as a paper.",
      },
      {
        title: "The Arithmetic of Active Management",
        by: "William F. Sharpe",
        where: "Financial Analysts Journal, 1991.",
        gives: "The proof that the average actively managed holding must lag the market by its costs.",
      },
      {
        title: "Challenge to Judgment",
        by: "Paul A. Samuelson",
        where: "The Journal of Portfolio Management, 1974.",
        gives: "The call for a fund that simply tracks an index, which Bogle said encouraged him.",
      },
      {
        title: "Stay the Course: The Story of Vanguard and the Index Revolution",
        by: "John C. Bogle",
        where: "John Wiley & Sons, 2018.",
        gives: "His own account of the 1976 launch, of his earlier mistakes and of his later doubts.",
      },
    ],
    example: {
      title: "A documented example: the launch of 1976",
      paras: [
        "The fund was called First Index Investment Trust. It set out to track the Standard & Poor’s 500 index of large American companies. The banks that underwrote its launch in the summer of 1976 aimed to raise 150 million dollars. They raised about 11 million.",
        "That was too little to buy all five hundred shares in the right proportions at a sensible cost, so by Bogle’s account the fund began by holding a sample of the index. In the trade it was called Bogle’s folly. It was later renamed, and still exists as one of the largest funds in the world.",
        "What makes the episode worth studying is the time it took. The arithmetic in the argument was the same in 1976 as it is now. For years almost nobody acted on it, because a fund that promises to be average is hard to sell. An idea being right did not make it popular, and its later popularity is not what makes it right.",
      ],
    },
    failure: {
      title: "What went wrong, and what an index fund does not do",
      paras: [
        "Bogle’s account of his own career begins with a mistake. In 1966, as a senior executive of an old and cautious fund management company, he arranged its merger with a firm of fashionable growth-stock managers. The funds did badly in the falling market of 1973 and 1974, and in January 1974 he was dismissed. He later described the merger as his own serious error. Vanguard was what he built next.",
        "An index fund removes the risk of choosing badly. It does not remove the risk of the market. A fund tracking large American shares fell by more than half between October 2007 and March 2009, with the index it tracked. Over the ten years from the start of 2000 to the end of 2009 that index ended a little lower than it began, dividends included. A holder who needed the money in those years had no protection from the low cost.",
        "An index weighted by market value holds most of whatever has risen most. At the top of a boom it is heavily invested in the shares that are about to fall furthest, as it was in technology shares in early 2000.",
        "Bogle also recorded doubts about what he had started. He criticised the use of exchange-traded index funds for rapid trading, which he saw as the opposite of his purpose. In 2018 he warned, in paraphrase, that if index funds came to own most of every large company, a handful of fund managers would hold the votes over them, and that this would not serve the public interest.",
      ],
      link: { href: "/history/dot-com-bubble", label: "Market history: the dot-com bubble" },
    },
    exercise: {
      title: "What can be studied with a small paper portfolio",
      intro: "This is the study in which most of the idea can be examined with arithmetic alone. The exercise uses an invented sum and rates you choose yourself. No rate is a forecast.",
      steps: [
        "Open the index investing example and set a yearly fee of 0.1%, then of 1.5%, over thirty years at the same assumed rate of growth. Write down the two end figures and the difference.",
        "Change the assumed growth rate, including to a low one. Note that the money lost to the fee changes but never goes away.",
        "In the regular investing calculator, enter a monthly amount and your assumed rate less each fee in turn. Compare what was paid in with what the rate added.",
        "Write down, now, what you would do in a year in which the holding fell by a third. Keep the note. The arithmetic assumes the holder does nothing; the note is a record of whether that is realistic for you.",
      ],
      tools: [
        { href: "/investing/index-investing", label: "Index investing, explained", note: "An invented index held by weight, and one sum grown with and without a yearly fee." },
        { href: "/money/regular-investing", label: "Regular investing calculator", note: "A fixed amount every month at a rate you assume, with the working shown." },
      ],
      caution: "Both tools use one steady rate, which no market provides. They show what a cost does to compounding. They do not show what a fund will return.",
    },
    notScale: [
      { t: "Most of this one does scale down", d: "That was the design: a fund that a person with a small sum could hold on the same terms as everyone else. The points below are the exceptions, and they matter." },
      { t: "Costs on top of the fund’s own", d: "A private holder may pay a platform charge, a dealing charge and a currency conversion as well as the fund’s yearly fee. Large institutions often pay a lower fee for the same fund. The figures differ by country and provider and are in the documents of the product itself." },
      { t: "Tax treatment", d: "How dividends and gains are taxed depends on the country, the kind of account and where the fund is based. This page holds no country’s rules." },
      { t: "Time horizon", d: "The argument is about decades. Over a few years the cost saved is small beside what the market may do, in either direction." },
      { t: "Operational resources", d: "Tracking hundreds or thousands of shares closely and cheaply takes scale: dealing desks, systems and settlement. A private person cannot build an index by hand at a sensible cost, which is why the fund exists." },
      { t: "Ownership structure", d: "A management company owned by its own funds is unusual. Most index funds are run by companies with outside shareholders, and a low fee today is a commercial decision that can change." },
      { t: "A leveraged CFD on an index is not an index fund", d: "It holds no shares and pays no dividends as an owner receives them. It is usually leveraged, usually carries a financing charge each night, and can be closed out by a margin call. It is a short-term agreement on the level of an index, and a yearly-cost argument made over decades does not apply to it." },
    ],
    faq: [
      {
        q: "What is an index fund and how is it built?",
        a: "An index fund is a fund that holds the shares in a published index, usually in proportion to each company’s market value, so that its return follows the index less a small cost. It deals only when the index changes its members, when money enters or leaves the fund and when dividends are paid. A fund may hold every share in the index or a representative sample.",
      },
      {
        q: "Why do costs matter so much in investing?",
        a: "Because all investors together earn the market’s return before costs, so as a group they earn that return less what they pay. A yearly cost is also taken from the whole sum every year, so over decades the money lost is the charges and everything they would have earned. John Bogle and William Sharpe both set this arithmetic out in print.",
      },
      {
        q: "Does an index fund protect against a market fall?",
        a: "No. It removes the risk of choosing a poor share or a poor manager, and it leaves the risk of the market in full. When the index falls, the fund falls with it. An index of large American shares fell by more than half between October 2007 and March 2009, and funds tracking it did the same.",
      },
    ],
    terms: ["index", "dividend", "diversification", "etf", "cfd"],
  },

  {
    slug: "dalio",
    name: "Ray Dalio",
    title: "Ray Dalio: economic regimes and diversifying across them",
    description:
      "A case study of Ray Dalio’s published ideas: the economy as a machine driven by credit, four environments of growth and inflation, and a portfolio balanced so that it does not depend on one of them. Sources named, the surprise of August 1971, the wrong forecast of 1982 by his own account, and what does not scale down.",
    card: "Growth and inflation, each higher or lower than expected: four environments, and a portfolio that is not a bet on one.",
    is: "Ray Dalio founded Bridgewater Associates in 1975. In his books, and in papers the firm has published, he describes the economy as a machine driven by credit and by a few repeating cycles, and a way of spreading a portfolio so that it does not depend on any one economic environment. This page summarises those published ideas. It describes no fund’s holdings.",
    who: "Ray Dalio (born 1949) founded Bridgewater Associates in 1975.",
    subject: "people",
    also: ["all weather portfolio explained", "risk parity", "economic machine", "growth and inflation quadrants", "diversification across regimes"],
    machine: {
      eyebrow: "The idea, to handle",
      title: "Four environments, four holdings.",
      lead: "Growth comes in higher or lower than expected, and so does inflation. Choose the environment, set how much of an invented portfolio is in shares, and see which way each holding leans and what that does to the whole.",
    },
    ideas: [
      {
        t: "The economy as a machine.",
        d: "The paper How the Economic Machine Works describes an economy as the sum of its transactions, and credit as the part that makes it cycle. It separates three things: the slow growth of productivity, a short debt cycle of several years, and a long debt cycle of several decades.",
      },
      {
        t: "Prices already contain a forecast.",
        d: "An asset’s price reflects what people expect. What moves it is the difference between what happens and what was expected. A strong economy that was fully expected changes little; a surprise changes a great deal.",
      },
      {
        t: "Two surprises make four environments.",
        d: "The firm’s paper The All Weather Story reduces the surprises that matter most to two: growth and inflation, each of which can come in higher or lower than expected. That gives four environments.",
      },
      {
        t: "Each kind of asset leans towards an environment.",
        d: "In that account, shares tend to do well when growth is stronger than expected and inflation is lower. Ordinary bonds tend to do well when growth is weaker and inflation falls. Inflation-linked bonds and commodities tend to do well when inflation rises. These are tendencies seen in past data, not rules.",
      },
      {
        t: "Balance the risk, not the money.",
        d: "A portfolio split between shares and bonds by money gets most of its swings from the shares, because shares move more. To balance by risk a portfolio must hold much more of the steadier assets, and in practice it borrows to do so. The firm has said it began managing money this way in 1996.",
      },
      {
        t: "Many unrelated sources of return.",
        d: "In Principles Dalio writes, in paraphrase, that holding a number of good return streams that do not move together reduces risk a great deal without reducing the expected return, and that finding them is the most valuable thing in investing.",
      },
      {
        t: "Write the rules down and test them.",
        d: "Principles describes turning decisions into written rules, testing the rules on long histories and across countries, and recording mistakes so that they can be studied instead of hidden.",
      },
    ],
    sources: [
      {
        title: "Principles: Life and Work",
        by: "Ray Dalio",
        where: "Simon & Schuster, 2017.",
        gives: "His own account of 1971 and of 1982, the value of unrelated return streams, and written rules.",
      },
      {
        title: "How the Economic Machine Works: A Template for Understanding What Is Happening Now",
        by: "Ray Dalio",
        where: "Bridgewater Associates. The paper was circulated from about 2008 and revised afterwards; a short animated film of the same name followed in 2013.",
        gives: "Transactions, credit, productivity, and the short and long debt cycles.",
      },
      {
        title: "The All Weather Story",
        by: "Bridgewater Associates",
        where: "Bridgewater Associates, about 2012.",
        gives: "The four environments, the lean of each kind of asset, and the start of the approach in 1996.",
      },
      {
        title: "Principles for Navigating Big Debt Crises",
        by: "Ray Dalio",
        where: "Bridgewater Associates, 2018.",
        gives: "The long debt cycle worked through historical cases.",
      },
    ],
    example: {
      title: "A documented example: August 1971 and the decade after",
      paras: [
        "On the evening of Sunday 15 August 1971 President Nixon announced that the United States would no longer exchange dollars for gold at a fixed rate. Dalio writes in Principles that he was working on the floor of the New York Stock Exchange that summer and expected shares to fall on the Monday. They rose sharply. He writes that the surprise sent him to study earlier cases, and that he found the same pattern in 1933.",
        "The decade that followed is the usual illustration of why the environment matters. Inflation in the United States rose through the 1970s, with oil shocks in 1973 and 1979. A mix of shares and ordinary bonds lost purchasing power over much of that period, while gold and other commodities rose. From the early 1980s inflation fell for many years, and shares and bonds both did well.",
        "The same mix of holdings was a poor portfolio in one decade and a very good one in the next. Nothing about the holdings had changed. The environment had. A portfolio of shares and bonds looks diversified when they move apart, and in a period of rising inflation they have tended to fall together, as they did again in 2022.",
      ],
    },
    failure: {
      title: "1982: a forecast that was wrong, by his own account",
      paras: [
        "In August 1982 Mexico announced that it could not keep up the payments on its debts. Dalio had been warning of a debt crisis, and he writes in Principles that he became confident a depression would follow. He said so in public, including in evidence to the United States Congress and on television.",
        "He was wrong. The Federal Reserve eased, the American stock market began one of its longest rises that same month, and the economy recovered. He writes that the losses were large enough that he had to let everyone at the firm go, and that he borrowed 4,000 dollars from his father to pay his bills.",
        "He describes the episode as the origin of much of what came later: asking how he could know he was right instead of assuming it, looking for people who disagreed, and spreading bets so that no single view could do that much damage again.",
        "The approach has its own weak point, and the record shows it. Balancing by risk means holding a large amount of bonds, often with borrowed money. In 2022 inflation and interest rates rose together; shares and ordinary bonds both fell, and inflation-linked bonds fell as well, because the yields on them rose. A portfolio built to have no bad environment had one.",
      ],
    },
    exercise: {
      title: "What can be studied with a small paper portfolio",
      intro: "What can be examined on paper is the question the method asks: which environment does each holding depend on, and how much do the holdings move together? The exercise uses invented holdings.",
      steps: [
        "Write down a hypothetical portfolio of four holdings. Beside each, write which of the four environments you think it leans towards. If all four lean the same way, it is one holding in four parts.",
        "Open the correlation machine in the Risk Room. Set four holdings and move the slider from no relation to moving together. Record how the combined swing changes while the holdings themselves do not.",
        "In the inflation calculator, enter an invented sum and two different rates of inflation over ten years. Note what the difference does to what the sum will buy.",
        "Write one paragraph on what would have to happen for all four of your holdings to fall in the same year.",
      ],
      tools: [
        { href: "/labs/risk-room#correlation", label: "The Risk Room: correlation", note: "Two to four invented holdings, and how closely they move together." },
        { href: "/money/inflation", label: "Inflation calculator", note: "What a sum will buy later, at a rate you assume." },
      ],
      caution: "The correlation between real holdings is not fixed. It has often risen in a crisis, which is when the spread was wanted. A slider cannot show that.",
    },
    notScale: [
      { t: "Financing terms", d: "Balancing by risk needs borrowing against the steadier assets, at the rates large institutions pay in the futures and repurchase markets. A private person borrows at a higher rate, if at all, and the loan can be called." },
      { t: "Derivatives access", d: "The approach uses futures, swaps and inflation-linked bonds across many countries, under legal agreements negotiated with banks. Few of those are open to a private account, and fewer at a cost that leaves the arithmetic intact." },
      { t: "Liquidity", d: "Keeping dozens of markets in balance means dealing in all of them regularly. An institution does that at very low cost per trade. For a small account the dealing costs can outweigh the benefit of the balance." },
      { t: "Information and staff", d: "The rules are built and tested by a large research staff on long histories of data from many countries. A private investor cannot test an idea in that way, and a rule that has not been tested is only an opinion." },
      { t: "Tax treatment", d: "Frequent rebalancing and the use of derivatives are taxed differently from simply holding, and the rules depend on the country." },
      { t: "Time horizon", d: "The clients of such a firm are mostly institutions investing for decades. An environment can last ten years. A person who needs the money sooner can meet the wrong one and have no time to wait for another." },
      { t: "Several leveraged CFDs are not a balanced portfolio", d: "A contract for difference on an index, a bond or a commodity is not ownership of any of them. Each is usually leveraged, each usually carries its own financing charge, and each can be closed out separately by a margin call. Holding several does not reproduce a portfolio balanced by risk." },
    ],
    faq: [
      {
        q: "What are the four economic environments in Ray Dalio’s framework?",
        a: "They come from two things that can each surprise in two directions: economic growth higher or lower than expected, and inflation higher or lower than expected. In the published account, shares tend to do well when growth is stronger than expected and inflation is lower, ordinary bonds when growth is weaker and inflation falls, and inflation-linked bonds and commodities when inflation rises.",
      },
      {
        q: "What is risk parity?",
        a: "It is a way of building a portfolio so that each kind of holding contributes a similar share of the portfolio’s swings, instead of a similar share of its money. Because bonds usually move less than shares, that means holding far more bonds, often with borrowed money. It reduces dependence on shares. It adds a dependence on the cost of borrowing and on bonds not falling sharply.",
      },
      {
        q: "Did Ray Dalio ever get a big forecast wrong?",
        a: "Yes, by his own account in Principles (2017). In 1982, after Mexico said it could not pay its debts, he publicly forecast a depression. The economy recovered and the stock market began a long rise. He writes that he lost so much that he had to let his staff go, and that he borrowed 4,000 dollars from his father.",
      },
    ],
    terms: ["recession", "monetary-policy", "real-yields", "correlation", "diversification", "inflation"],
  },

  {
    slug: "soros",
    name: "George Soros",
    title: "George Soros: a macro hypothesis, reflexivity and changing a thesis",
    description:
      "A case study of George Soros’s published ideas: reflexivity, the two-way loop between prices and beliefs; investing as a hypothesis put to the test; and abandoning a thesis when the evidence turns. Sources named, the dollar in 1985 and sterling in 1992, the losses of 1998 and 2000, and what does not scale down to a private account.",
    card: "Prices and beliefs feed each other. A view is a hypothesis to be tested, and dropped when it fails.",
    is: "George Soros ran a hedge fund, later known as the Quantum Fund, from the early 1970s. In The Alchemy of Finance (1987) he set out a theory he calls reflexivity: prices do not only reflect what people believe, they change the facts those beliefs are about. He describes investing as forming a hypothesis, testing it with money, and giving it up when it fails. This page summarises what he published.",
    who: "George Soros (born 1930) founded Soros Fund Management, whose main fund was the Quantum Fund.",
    subject: "people",
    also: ["reflexivity explained", "boom and bust model", "global macro investing", "The Alchemy of Finance", "Black Wednesday trade"],
    machine: {
      eyebrow: "The idea, to handle",
      title: "A loop between price and belief.",
      lead: "An invented price, an invented fundamental and a belief that follows the price. Set how strongly belief chases the price and how far the price changes the fundamental itself, and see when a small nudge fades and when it feeds on itself and then turns.",
    },
    ideas: [
      {
        t: "Everyone’s view is partial.",
        d: "Soros starts from fallibility: the people who take part in a market understand it only in part, and their views are always biased in some way. He applies this to himself first.",
      },
      {
        t: "Reflexivity: the loop runs both ways.",
        d: "In the usual account, prices follow the facts. In The Alchemy of Finance prices also change the facts. A company whose share price rises can raise money cheaply, which improves its results, which seems to justify the price. Rising property prices make lenders more willing to lend, which raises prices further. The book works through the conglomerate boom of the 1960s and the property trusts of the early 1970s as cases.",
      },
      {
        t: "Boom and bust have a shape.",
        d: "His model starts with a real trend and a mistaken belief about it. The two strengthen each other. The belief is tested by events and survives, which strengthens it more. Eventually the gap between belief and reality becomes too wide to sustain; there is a moment of doubt, and then the same loop runs in reverse. He notes that the fall tends to be faster than the rise.",
      },
      {
        t: "A position is a hypothesis.",
        d: "He describes forming a thesis, investing in it, and then watching whether events confirm it. Part of The Alchemy of Finance is a diary, kept from August 1985 to November 1986, in which he records his reasoning and his decisions as they happened, changes of mind included.",
      },
      {
        t: "Finding the flaw is the useful part.",
        d: "In Soros on Soros he describes, in paraphrase, looking for the flaw in each of his own theses and being more at ease once he knows what it is. Being wrong is expected. Staying wrong is the error.",
      },
      {
        t: "It is not a science, and he says so.",
        d: "The word alchemy in the title is deliberate. He writes that reflexivity does not produce firm predictions of the kind natural science does: it is a way of looking at a situation, not a formula. In his 2013 paper he also records that economists for a long time did not take the theory seriously.",
      },
    ],
    sources: [
      {
        title: "The Alchemy of Finance: Reading the Mind of the Market",
        by: "George Soros",
        where: "Simon & Schuster, 1987; later editions from John Wiley & Sons.",
        gives: "Reflexivity, the boom and bust model, the historical cases and the diary of 1985 and 1986.",
      },
      {
        title: "Soros on Soros: Staying Ahead of the Curve",
        by: "George Soros, with Byron Wien and Krisztina Koenen",
        where: "John Wiley & Sons, 1995.",
        gives: "His own account of the sterling position of 1992 and of how he handles being wrong.",
      },
      {
        title: "The Crisis of Global Capitalism: Open Society Endangered",
        by: "George Soros",
        where: "PublicAffairs, 1998.",
        gives: "His account of the Russian crisis of August 1998, in which his funds lost heavily.",
      },
      {
        title: "The New Paradigm for Financial Markets: The Credit Crisis of 2008 and What It Means",
        by: "George Soros",
        where: "PublicAffairs, 2008.",
        gives: "Reflexivity restated and applied to the credit boom.",
      },
      {
        title: "Fallibility, Reflexivity, and the Human Uncertainty Principle",
        by: "George Soros",
        where: "Journal of Economic Methodology, 2013.",
        gives: "The theory in its most careful form, with its limits.",
      },
    ],
    example: {
      title: "Two documented examples: the dollar in 1985 and sterling in 1992",
      paras: [
        "The diary in The Alchemy of Finance opens in August 1985 with a thesis that the dollar, which had risen for years, was due to fall. On 22 September 1985 the finance ministers of five large economies met at the Plaza Hotel in New York and agreed to bring the dollar down. The diary records that he already held positions that would gain from a weaker dollar, and that he added to them after the announcement instead of taking the gain. The same diary records the later stretches in which his views were wrong.",
        "The second example is the one he is known for. The United Kingdom had joined the European Exchange Rate Mechanism in October 1990, which tied the pound to the German mark within a band. By 1992 Germany was holding interest rates high after reunification while the British economy was in recession and needed them lower. His thesis, as he later described it in Soros on Soros, was that the British government could not keep both the exchange rate and its economy, and would give up the exchange rate.",
        "What made the position unusual was its shape. If he was wrong, the pound would stay inside its band and the loss would be small. If he was right, the pound would fall a long way. On 16 September 1992 the government raised interest rates twice in a day and then suspended sterling’s membership. The position has been widely reported at around ten billion dollars and the gain at about one billion, figures he has confirmed in interviews.",
        "Two things are easy to miss. The thesis was about a fixed exchange rate defended by a government, which is a rare kind of situation: most markets offer no such one-sided bet. And the position was far larger than the fund’s own money, which is only possible with financing that a private account does not have.",
      ],
      link: { href: "/history/black-wednesday-1992", label: "Market history: Black Wednesday, hour by hour" },
    },
    failure: {
      title: "When the thesis failed: 1998 and 2000",
      paras: [
        "On 17 August 1998 Russia devalued the rouble and stopped payment on part of its government debt. Soros’s funds had large investments in Russia and lost heavily, which the firm acknowledged publicly at the time. He had written a letter to a newspaper a few days earlier arguing for a managed devaluation. He gives his own account of those weeks in The Crisis of Global Capitalism.",
        "In the spring of 2000 the Quantum Fund lost heavily in technology shares as that market fell. At the end of April 2000 he announced that the fund would be reorganised to take less risk, and its senior managers left.",
        "Both cases fit his own model, which is the uncomfortable part. Knowing that booms feed on themselves and then reverse does not tell anyone when. A theory that describes how a bubble works did not prevent its author’s fund from being caught in one.",
        "The theory has critics on its own terms too. Economists have argued that an account which explains both a rise and a fall cannot easily be tested. Soros concedes much of this: he presents reflexivity as a framework for thinking, not as a means of prediction.",
      ],
      link: { href: "/history/dot-com-bubble", label: "Market history: the dot-com bubble" },
    },
    exercise: {
      title: "What can be studied with a small paper portfolio",
      intro: "What can be practised is the discipline of the hypothesis: saying in advance what would show a view to be wrong, and keeping the record honest. The exercise is done on paper.",
      steps: [
        "Write one view as a single sentence about a hypothetical position. Under it, write what would have to be true for the view to be right.",
        "Write what you would expect to see if it were wrong, in terms that can be checked, and a date on which you will look.",
        "On that date, record two separate things: whether the reason you gave came about, and what the price did. A price that moved your way for a different reason is not a confirmed thesis.",
        "Keep the entries in which you changed your mind, and note how long it took. That figure is the one this method is about.",
        "On the Rule bench, test any simple rule on one invented market and then look at its forty other results. It shows how often a result on a single run is chance.",
      ],
      tools: [
        { href: "/journal", label: "The journal", note: "A plan before and what happened after, for each entry. It stays in your browser." },
        { href: "/labs/rule-bench", label: "The Rule bench", note: "A rule tested on invented prices, where no rule has an edge, and forty other runs beside it." },
      ],
      caution: "A hypothesis written on paper costs nothing to hold. With money and leverage, the same hypothesis can be right in the end and still lose the account before then.",
    },
    notScale: [
      { t: "Financing terms", d: "The positions described were several times the size of the fund’s own money, financed by many banks on terms negotiated one by one. A private account has a fixed margin rule set by its provider." },
      { t: "Derivatives access", d: "Selling a currency in that size is done through forward contracts and options arranged directly with banks. A private person cannot deal in that market." },
      { t: "Liquidity, and size as part of the method", d: "A fund of that size is itself part of the pressure on a price: in a reflexive market, the selling helps to bring about what the seller expects. A small account’s order changes nothing. It gains only if others, for their own reasons, do the moving." },
      { t: "Information and staff", d: "The theses were built with analysts, with long experience of how governments and central banks behave under strain, and with a wide circle of contacts. Reading the same newspapers is not the same position." },
      { t: "Time horizon and staying power", d: "A large fund can hold a position through weeks in which it moves the wrong way. A leveraged private account is closed out when its margin runs short, so the view can be correct and the money still lost." },
      { t: "Tax treatment and structure", d: "A fund and a private person are taxed differently, and the rules depend on the country." },
      { t: "A leveraged CFD is not this", d: "A contract for difference on a currency or an index is a leveraged agreement with a provider, usually with a financing charge each night and a close-out level. It gives no ownership of anything. A view about an economy held through such a contract has costs and limits that the positions described here did not." },
    ],
    faq: [
      {
        q: "What is reflexivity in financial markets?",
        a: "It is George Soros’s term for a two-way loop. People’s beliefs move prices, and prices in turn change the underlying facts the beliefs are about: for example, a rising share price lets a company raise money cheaply, which improves its results. The loop can strengthen a trend far beyond what the facts first justified, and then run in reverse. It is set out in The Alchemy of Finance (1987).",
      },
      {
        q: "What did George Soros do on Black Wednesday?",
        a: "His fund held a very large position that would gain if the pound fell out of the European Exchange Rate Mechanism. On 16 September 1992 the British government raised interest rates twice and then suspended sterling’s membership, and the pound fell. The gain has been widely reported at about one billion dollars. His reasoning is described in Soros on Soros (1995).",
      },
      {
        q: "Was George Soros always right?",
        a: "No, and his own books say so. His funds lost heavily in Russia in August 1998, and in technology shares in the spring of 2000, after which the Quantum Fund was reorganised. His writing treats being wrong as normal and stresses recognising an error quickly. He also writes that reflexivity does not give firm predictions.",
      },
    ],
    terms: ["monetary-policy", "leverage", "margin-call", "stop-out", "liquidity", "cfd"],
  },

  {
    slug: "institutional-process",
    name: "The institutional process",
    title: "How institutional execution and risk teams work",
    description:
      "How large investors organise the work around a decision: who decides, who deals, who sets the limits and who checks. Liquidity, implementation shortfall, slicing an order, exposure limits and review, with the papers named, the order of 6 May 2010 as described in the official report, the losses of August 2007, and what does not scale down.",
    card: "Who decides, who deals, who sets the limits and who checks afterwards. No firm named.",
    is: "Inside a large asset manager, pension fund or bank, the person who decides what to buy is rarely the person who buys it, and neither of them sets the limits. This page describes that division of work in general terms: liquidity, the cost of implementing a decision, exposure limits and review. No firm is named, and practice differs from one firm to another.",
    who: "A description of common practice at large investing institutions, drawn from published papers and official reports. It describes no particular firm.",
    subject: "practice",
    also: ["implementation shortfall", "transaction cost analysis", "order slicing", "risk limits explained", "best execution", "market impact"],
    machine: {
      eyebrow: "The idea, to handle",
      title: "A large order through a thin book.",
      lead: "An invented order book with the same number of units at each price level. Set the size of the order, how thin the book is and how many slices the order is cut into, and see what is paid for dealing quickly and what is risked by dealing slowly.",
    },
    ideas: [
      {
        t: "The work is divided on purpose.",
        d: "A portfolio manager decides what to hold. A dealing desk carries the decision out. A risk function, which reports to someone other than the manager, measures the exposure and enforces the limits. Compliance checks the rules; operations settle the trades. The point is that nobody checks their own work.",
      },
      {
        t: "Liquidity is asked about first.",
        d: "Before a large trade the desk asks how much of the thing changes hands in a day, what share of that the order would be, how deep the order book is, and how many days it would take to get out again. A position that takes weeks to sell is treated as a different risk from one that takes minutes.",
      },
      {
        t: "The cost of a decision is measured against the price when it was made.",
        d: "André Perold’s 1988 paper named the implementation shortfall: the gap between a paper portfolio that deals instantly at the decision price and the real one. It includes the spread, the movement of the price caused by the order itself, the drift while waiting, and the trades that were never completed.",
      },
      {
        t: "An order moves the price it deals at.",
        d: "Albert Kyle’s 1985 paper gave a model in which the price moves in proportion to the flow of orders, because other participants cannot tell whether the buyer knows something. A large order therefore pays more than the quoted price, and part of the movement stays after it is done.",
      },
      {
        t: "Fast is costly; slow is risky.",
        d: "Robert Almgren and Neil Chriss set out the trade-off in their paper of 2000. Dealing at once pays the most for moving the price. Dealing in small pieces over time pays less for that, and leaves the unfinished part exposed to whatever the market does meanwhile. A schedule is a chosen point between the two.",
      },
      {
        t: "Limits are written before the trade.",
        d: "Typical limits cap the size of one position, the exposure to one issuer, sector, country, currency or counterparty, the amount of borrowing, and the share of a portfolio that could not be sold quickly. Some are hard blocks in the dealing system. A breach is reported upwards; it is not left to the judgement of the person who caused it.",
      },
      {
        t: "Everything is reviewed afterwards.",
        d: "Dealing costs are compared with a benchmark after the event, results are broken down into their sources, and losses are examined for what the process missed. Regulators in many places require firms to have a policy on how they obtain the best result for clients when dealing, and to show that they follow it.",
      },
    ],
    sources: [
      {
        title: "The Implementation Shortfall: Paper versus Reality",
        by: "André F. Perold",
        where: "The Journal of Portfolio Management, 1988.",
        gives: "The measure of dealing cost against the price at the moment of decision.",
      },
      {
        title: "Continuous Auctions and Insider Trading",
        by: "Albert S. Kyle",
        where: "Econometrica, 1985.",
        gives: "The model in which price moves in proportion to order flow.",
      },
      {
        title: "Optimal Execution of Portfolio Transactions",
        by: "Robert Almgren and Neil Chriss",
        where: "Journal of Risk, 2000.",
        gives: "The trade-off between the cost of dealing quickly and the risk of dealing slowly.",
      },
      {
        title: "Findings Regarding the Market Events of May 6, 2010",
        by: "Staffs of the U.S. Commodity Futures Trading Commission and the U.S. Securities and Exchange Commission",
        where: "Report to the Joint Advisory Committee on Emerging Regulatory Issues, 30 September 2010.",
        gives: "The official account of one large sell order and how it was executed.",
      },
      {
        title: "What Happened to the Quants in August 2007?",
        by: "Amir E. Khandani and Andrew W. Lo",
        where: "Working paper, 2007; published in the Journal of Investment Management.",
        gives: "An analysis of several days in which many similar portfolios lost money at once.",
      },
      {
        title: "Minimum capital requirements for market risk",
        by: "Basel Committee on Banking Supervision",
        where: "Bank for International Settlements, January 2016.",
        gives: "The replacement of value at risk by expected shortfall in the rules for banks’ trading books.",
      },
    ],
    example: {
      title: "A documented example: one order on 6 May 2010",
      paras: [
        "The official report on the events of 6 May 2010 describes a single large order. It does not name the firm; it calls it a large fundamental trader, a mutual fund complex. On an afternoon when markets were already under strain, that trader began to sell 75,000 futures contracts on an American share index, worth about 4.1 billion dollars, to protect an existing holding of shares.",
        "The order was given to an automated program with one instruction, as the report describes it: to sell at a rate equal to 9% of the volume traded in the previous minute, with no regard to price or to time. The report notes that the same trader had sold a similar amount earlier that year using a mix of manual dealing and programs that took price, time and volume into account, and that the earlier sale had taken more than five hours.",
        "This one took about twenty minutes. As prices fell, fast-trading firms bought contracts and quickly sold them on to one another, which raised the traded volume without adding anyone willing to hold. The program read the higher volume as room to sell faster. The report’s point is that volume is not the same thing as liquidity.",
        "The report’s weighting of this order has been disputed since, and in 2015 the American authorities brought charges of market manipulation against an individual trader in connection with the same day. What is not disputed is the description of the instruction, and it is a clear case of a schedule that followed one measure and ignored the price.",
      ],
      link: { href: "/history/flash-crash-2010", label: "Market history: the flash crash, minute by minute" },
    },
    failure: {
      title: "Where the process itself failed: August 2007 and the limits of a number",
      paras: [
        "In the week of 6 August 2007 a number of funds that chose shares by statistical rules, holding some and selling others short, lost large amounts over a few days, out of proportion to anything in the wider market that week. The paper by Khandani and Lo, written shortly afterwards, suggests that many such funds held similar positions, that one or more of them was reducing its book quickly, and that the selling pushed prices against all the others at once.",
        "Each fund had risk limits. The limits were set from each fund’s own history, which contained no record of what would happen if its neighbours all sold together. The authors are careful to say that their account is an inference from a simulated strategy and from public data, not from the funds’ own books.",
        "The second failure is of a measure. For years the standard figure for market risk was value at risk: the loss that should not be exceeded on all but a small share of days. It says nothing about how bad the remaining days can be. After the crisis of 2008 the Basel Committee replaced it with expected shortfall in its rules for banks’ trading books, published in January 2016, for that reason.",
        "The general lesson institutions draw is modest. A limit is only as good as what happens when it is reached, and a risk figure built from the past describes the past.",
      ],
    },
    exercise: {
      title: "What can be studied with a small paper portfolio",
      intro: "A private account cannot have separate people for each job. What can be borrowed is the habit of writing the limits first and reviewing against them afterwards. The exercise uses a hypothetical account.",
      steps: [
        "Write three limits for a hypothetical account before anything else: the most that may be lost on one position, the most in positions that tend to move together, and the fall at which everything stops for review.",
        "In the Risk Room, replay one run of trades at five sizes on the sizing ladder, then use the correlation machine to see how several positions can behave as one.",
        "In the position size tool, work out the size that keeps one invented trade inside your first limit. Note how much smaller it is than the size the margin alone would allow.",
        "Record hypothetical trades in the journal for a month. At the end, play the part of the reviewer: count the entries that broke a limit, whatever their result. A breach that made money is still a breach.",
      ],
      tools: [
        { href: "/labs/risk-room", label: "The Risk Room", note: "Risk of ruin, the same trades at five sizes, and correlation, on invented figures." },
        { href: "/tools/position-size", label: "Position size tool", note: "The size that fits a chosen loss, from your own inputs." },
        { href: "/journal", label: "The journal", note: "A record to review against the limits. It stays in your browser." },
      ],
      caution: "A limit that one person sets, watches and may waive is weaker than one enforced by somebody else. Writing it down helps. It does not make it independent.",
    },
    notScale: [
      { t: "Liquidity", d: "The institution’s problem is being too large for the market. A private order is usually small enough to be filled at the quoted price, so slicing it serves no purpose. The private trader’s costs are different ones: a wider spread in proportion, and financing." },
      { t: "Derivatives and venue access", d: "An institution deals directly on exchanges and other venues, through several brokers, with programs built for the purpose and commission rates it has negotiated. A private account deals through one provider at that provider’s price." },
      { t: "Financing terms", d: "Institutions borrow and lend securities through prime brokers and the repurchase market on negotiated terms. A private account’s financing is whatever its provider charges." },
      { t: "Information and staff", d: "The process depends on separate people: one decides, another deals, a third can say no. A private trader is all three, and nobody can overrule a decision made at the wrong moment." },
      { t: "Operational resources", d: "Measuring dealing costs, running stress tests and monitoring limits through the day take data, systems and staff that cost more than most private accounts hold." },
      { t: "Tax treatment and time horizon", d: "A pension fund or an insurer invests against obligations decades away and is often taxed differently from a private person. Both facts shape what it can sensibly hold." },
      { t: "A leveraged CFD is dealt differently", d: "A contract for difference is an agreement with a provider at the provider’s quoted price. There is no order book to work an order through, and nothing is owned. The exposure is usually leveraged, usually carries a financing charge and can be closed out by a margin call." },
    ],
    faq: [
      {
        q: "What is implementation shortfall?",
        a: "It is the difference between what a portfolio would have earned if every decision had been carried out instantly at the price when it was made, and what it actually earned. It gathers the spread, the price movement caused by the order, the drift while the order was being worked and the cost of trades that were not completed. The term comes from André Perold’s 1988 paper.",
      },
      {
        q: "Why do institutions split large orders into smaller ones?",
        a: "Because a large order sent at once uses up the quantity available at the best prices and has to deal at worse ones. Splitting it gives the market time to refill between pieces, which lowers that cost. The price of doing so is time: the unfinished part is exposed to whatever the market does meanwhile, and others may notice the pattern.",
      },
      {
        q: "What does an independent risk team do?",
        a: "It measures the exposure of the portfolios, checks them against limits agreed in advance, runs tests of what would happen in a severe market, and reports to senior management separately from the people taking the decisions. Its independence is the point: it does not depend on the judgement or the pay of those whose positions it measures.",
      },
    ],
    terms: ["liquidity", "slippage", "spread", "market-order", "liquidity-provider", "leverage", "cfd"],
  },
];

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);

/**
 * What public disclosure does and does not show. General statements about
 * holdings reports as a kind of document: the detailed rules differ between
 * countries and are not stated here.
 */
export const DISCLOSURE = {
  shows: [
    { t: "Certain holdings, on one day", d: "A holdings report is a list of some of what a large manager held at the end of a period, often a quarter. It is a photograph of one date." },
    { t: "Names and amounts", d: "For each holding it usually gives the security and the quantity or value on that date." },
    { t: "Changes between two photographs", d: "Comparing one report with the last shows what was larger or smaller at the two dates. It does not show what happened between them." },
  ],
  hides: [
    { t: "It is late", d: "Reports are published some weeks after the date they describe. By the time one can be read, the holding may have been added to, reduced or sold. A reader learns of a sale only from the next report, a further period on." },
    { t: "It is incomplete", d: "Reports of this kind typically cover long positions in certain listed securities. They commonly leave out short positions, many derivatives, cash, and holdings outside the reporting rules, such as assets in other countries, bonds, currencies, commodities and private investments." },
    { t: "It gives no reason", d: "A holding may be a view on the company, half of a pair with something that is not shown, a hedge against something else, or the remains of an older position being sold down. The report does not say." },
    { t: "It gives no price", d: "The report does not show when the holding was bought or what was paid. A copier pays the price on the day he or she reads it, which may be very different." },
    { t: "It does not say whose decision it was", d: "A filing is made by a firm. It may combine the decisions of several managers and several portfolios with different aims." },
    { t: "It may be held back", d: "In some systems a manager can ask for a holding to be withheld from the public report for a time, for example while a position is still being built." },
    { t: "It shows none of the conditions", d: "The financing behind a position, its tax treatment, the size of the whole portfolio around it and the time the holder can wait are all invisible, and none of them transfers to a copier." },
  ],
} as const;

/** The four statements every case-study page carries. */
export const STANDING = [
  { t: "No endorsement and no connection.", people: "GIO4X has no connection with any person or firm named on these pages. None of them has seen, approved or endorsed anything here.", practice: "GIO4X has no connection with any institution whose published work or reported conduct is described here. Nothing on this page is endorsed by any of them." },
  { t: "Nobody here sees their portfolios.", people: "These pages are written from books, letters and papers that anyone can read. Nobody at GIO4X has access to the holdings, the orders or the records of the people named.", practice: "This page is written from published papers and official reports. Nobody at GIO4X has access to the holdings, the orders or the internal rules of any institution described." },
  { t: "A method is not its results.", people: "Studying how someone reasoned does not reproduce what they earned. Their results came from particular decisions in particular years, made with resources a private account does not have.", practice: "Studying how an institution organises its work does not reproduce its results. The process depends on people, systems and terms of business that a private account does not have." },
  { t: "A leveraged CFD is not an investment held.", people: "A contract for difference gives no ownership of a share, a fund or a bond. It is a leveraged agreement on a change in price, and it does not behave like the holdings these studies describe.", practice: "A contract for difference gives no ownership of a share, a fund or a bond. It is a leveraged agreement on a change in price, and it does not behave like the holdings an institution owns." },
] as const;
