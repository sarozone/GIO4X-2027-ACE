import type { AddedLesson } from "./types";

/**
 * Automated trading: two lessons written by hand for the module that had only
 * an outline. General education. What is said about MetaTrader is what
 * MetaQuotes publishes about its own platform (the MQL4 and MQL5 languages,
 * the kinds of program, the event model, the Strategy Tester); nothing here
 * describes any broker's own platform, servers, fees or conditions.
 *
 * `body` keeps to the tags the carried lessons use: p, strong, h2 (with an
 * id), ul, li, table and its parts, and div.note.
 */
export const automationLessons: AddedLesson[] = [
  {
    slug: "expert-advisors-and-how-they-run",
    title: "Expert Advisors and how they run",
    description: "What an Expert Advisor is, how it runs inside MetaTrader, how automated trading fails in operation (connection loss, requotes, restarts, version changes) and what a VPS is for.",
    level: "Advanced",
    module: "automation",
    published: "2026-10-04",
    tags: ["Expert Advisor", "automated trading", "MetaTrader", "MQL5", "VPS", "requotes"],
    related: ["c:expert-advisor", "c:vps", "c:metatrader", "c:slippage", "c:pending-order", "c:stop-loss"],
    tools: [],
    body: [
      "<p>An Expert Advisor, or EA, is a program that trades by rule. It runs inside the MetaTrader platform, reads prices and sends orders without anyone clicking. This lesson explains what such a program is, how it runs, the ways it fails in operation and what a VPS is for. An EA carries out its instructions exactly, which is not the same as trading well.</p>",
      '<h2 id="what-an-expert-advisor-is">What an Expert Advisor is</h2>',
      "<p>MetaTrader is made by MetaQuotes, and its programs are written in the company’s own languages: MQL4 for MetaTrader 4 and MQL5 for MetaTrader 5. The two are not interchangeable, so a program compiled for one platform does not run on the other. The platform knows three main kinds of program.</p>",
      "<table><thead><tr><th>Program</th><th>What it does</th><th>Can it trade?</th></tr></thead><tbody><tr><td><strong>Expert Advisor</strong></td><td>Stays on a chart and reacts to each new price</td><td>Yes</td></tr><tr><td><strong>Indicator</strong></td><td>Calculates values from prices and draws them</td><td>No</td></tr><tr><td><strong>Script</strong></td><td>Runs once when started, then stops</td><td>Yes</td></tr></tbody></table>",
      '<h2 id="how-it-runs">How it runs</h2>',
      "<p>An EA is attached to one chart in the trading terminal on the trader’s computer. It does not run on the broker’s server. The terminal calls the program when something happens, and three events matter most.</p>",
      "<ul><li><strong>Start.</strong> When the EA is attached, it runs its set-up code once and reads its settings.</li><li><strong>Each tick.</strong> Every time a new price arrives for the chart’s instrument, the EA runs its main routine: it reads prices, checks its rules, and sends, changes or closes orders.</li><li><strong>Stop.</strong> When the EA is removed or the terminal closes, it runs its closing code.</li></ul>",
      "<p>Two consequences follow. The EA works only while the terminal is open, connected and allowed to trade automatically. And between ticks it does nothing: in a quiet market it may not run for seconds at a time. Orders already placed are different. A pending order, a stop-loss or a take-profit attached to a position is held on the broker’s server and remains there if the terminal goes offline.</p>",
      '<h2 id="how-it-fails-in-operation">How it fails in operation</h2>',
      "<p>Most failures of an automated system have nothing to do with its trading idea.</p>",
      "<ul><li><strong>Connection loss.</strong> With no connection the EA receives no prices and can send nothing. Anything it does in its own code, such as trailing a stop or closing at a set time, stops happening.</li><li><strong>Requotes and rejected orders.</strong> A request can be refused, requoted at a new price or filled at a price different from the one asked for. A program that assumes every order succeeds loses track of what it holds.</li><li><strong>Restarts.</strong> A computer update or a power cut restarts the terminal. Whatever the EA kept only in memory is gone, and it must work out its position again from the account.</li><li><strong>Version changes.</strong> The platform is updated in numbered builds, and the language has changed between them: a large revision of MQL4 in 2014 required many older programs to be corrected. A broker can also change an instrument’s name, its number of decimal places or its contract size, and code that assumed the old values misbehaves.</li></ul>",
      "<p>A well-written EA checks the result of every request and handles each of these cases. Many do not.</p>",
      '<h2 id="what-a-vps-is-for">What a VPS is for</h2>',
      "<p>A virtual private server (VPS) is a computer rented in a data centre that stays switched on and connected. The terminal and its EA are installed there and run around the clock, whatever happens to the trader’s own machine. A server near the broker’s also shortens the time an order takes to arrive.</p>",
      "<p>A VPS removes one class of failure: the home computer, its power and its internet line. It does not remove requotes, version changes or a broker’s server going down, and it adds a regular fee and one more system to watch. An unattended program still needs checking.</p>",
      '<h2 id="rules-not-judgement">Rules, not judgement</h2>',
      "<p>An EA does what its code says, including its mistakes, at any hour and at any size it was told to use. It removes hesitation. It does not remove risk, and it can lose money faster than a person would. Whether its rules have any merit is a separate question, and the usual evidence offered for them is a backtest: the subject of the next lesson.</p>",
    ].join("\n"),
  },
  {
    slug: "backtesting-optimisation-and-overfitting",
    title: "Backtesting, optimisation and overfitting",
    description: "How a backtest works, what optimisation does to it, how overfitting shows itself, and what out-of-sample and walk-forward testing are for. Why a good backtest is not a forecast.",
    level: "Advanced",
    module: "automation",
    published: "2026-10-04",
    tags: ["backtesting", "optimisation", "overfitting", "out-of-sample", "walk-forward", "Strategy Tester"],
    related: ["c:expert-advisor", "c:drawdown", "c:slippage", "c:spread", "c:metatrader"],
    tools: ["drawdown"],
    body: [
      "<p>A backtest runs a set of trading rules over past prices and records the trades they would have made. It is the usual evidence offered for an automated system, and it is easy to produce one that looks excellent and means nothing. This lesson explains how a backtest works, what optimisation does to it, and the two standard checks: out-of-sample testing and walk-forward testing.</p>",
      '<h2 id="what-a-backtest-is">What a backtest is</h2>',
      "<p>The test steps through historical prices one bar or one tick at a time. At each step the rules see only what had already happened, and any order they place is filled by the tester’s own assumptions. MetaTrader includes a Strategy Tester for this purpose. The result is a list of trades and the figures drawn from it: net result, drawdown, number of trades, the share that won.</p>",
      "<p>Every one of those figures depends on assumptions.</p>",
      "<ul><li><strong>The price history.</strong> Gaps or errors in the data produce trades that could never have happened.</li><li><strong>The detail.</strong> A test on bar opening prices is fast and coarse. A test on every tick is slower and closer to what an order would have met.</li><li><strong>The costs.</strong> A fixed spread and no slippage flatter any system that trades often or trades around news.</li><li><strong>The fills.</strong> A tester fills every order in full. A live market does not promise that.</li></ul>",
      '<h2 id="optimisation">Optimisation</h2>',
      "<p>Most rules have settings: the period of an average, the distance of a stop. Optimisation runs the backtest again and again with different settings and ranks the results. Suppose a system has two settings and each is tried at 50 values. That is 50 × 50 = 2,500 backtests, and the tester reports the best of them.</p>",
      "<p>The best of 2,500 attempts is partly the best by luck. The more combinations are tried, the more likely it is that the winner fitted accidents of that stretch of history.</p>",
      '<h2 id="overfitting">Overfitting</h2>',
      "<p>Overfitting is the name for rules that have been tuned to the noise in past prices instead of to anything that repeats. An overfitted system describes the past very well and says little about what comes next. Several signs point to it.</p>",
      "<ul><li>Many settings, each adjusted until the result improved.</li><li>A result that collapses when a setting is moved by one step.</li><li>Few trades, or a result that rests on a handful of them.</li><li>An equity curve that is almost a straight line.</li></ul>",
      '<h2 id="out-of-sample-testing">Out-of-sample testing</h2>',
      "<p>The first defence is to keep some history back. The settings are chosen on one part, called in-sample, and then tested once on a part they have never seen, called out-of-sample.</p>",
      "<table><thead><tr><th>Part of the history</th><th>Used for</th><th>What it shows</th></tr></thead><tbody><tr><td><strong>In-sample</strong></td><td>Choosing the settings</td><td>How well the rules can be fitted</td></tr><tr><td><strong>Out-of-sample</strong></td><td>One test, after the settings are fixed</td><td>How the fitted rules meet new prices</td></tr></tbody></table>",
      "<p>A large fall in performance from the first part to the second is the mark of overfitting. The check works only once. If the settings are changed after looking at the out-of-sample result, that data has become in-sample too.</p>",
      '<h2 id="walk-forward-testing">Walk-forward testing</h2>',
      "<p>Walk-forward testing repeats the same idea along the whole history. The settings are optimised on one window, tested on the stretch that follows, and then the window moves forward and the process starts again. The out-of-sample stretches are joined into one record.</p>",
      "<p>That record shows how the method of choosing settings would have fared, not how one lucky set did. It is a harder test to pass, and it is still a test on the past.</p>",
      '<h2 id="why-a-good-backtest-is-not-a-forecast">Why a good backtest is not a forecast</h2>',
      "<p>A backtest answers one question: what would these rules have done on these prices under these assumptions? It cannot say that the future will resemble that history, that live costs will match the modelled ones, or that orders will fill as the tester filled them. A backtest shown by someone selling a system is also the one they chose to show.</p>",
      '<div class="note"><p><strong>Risk note:</strong> Passing every check described here does not make a system profitable. It only removes some of the ways a result can be an illusion.</p></div>',
    ].join("\n"),
  },
];
