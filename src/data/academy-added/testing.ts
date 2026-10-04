import type { AddedLesson } from "./types";

/**
 * "Testing a set of rules": one lesson that walks through this site's own
 * tools in order (the strategy library, the Rule bench, the Risk Room, the
 * journal) and says what a test on invented prices can and cannot show.
 *
 * What it says about each tool is what that tool's own page says of itself.
 * It gives no counts of markets or machines, so it does not go stale when a
 * tool grows. It describes a process; it does not say that any rule works.
 *
 * `body` keeps to the tags the carried lessons use, which do not include
 * links: the pages named here are linked from the module on /academy.
 */
export const testingLessons: AddedLesson[] = [
  {
    slug: "testing-a-set-of-rules",
    title: "Testing a set of rules",
    description: "Four steps with this site’s own tools: describe a rule, test it on invented prices, see what position size does, and record real decisions. And what such a test cannot show.",
    level: "Advanced",
    module: "styles",
    published: "2026-10-04",
    tags: ["trading rules", "backtest", "rule bench", "position size", "trading journal", "strategy testing"],
    related: ["c:stop-loss", "c:take-profit", "c:spread", "c:drawdown", "c:risk-management", "c:money-management"],
    tools: ["position-size", "drawdown", "risk-reward"],
    body: [
      "<p>A trading idea is an opinion until it is written as rules that someone else could follow. This lesson walks through four steps, each with a tool on this site: describe the rule, test it on invented prices, see what position size does to it, and record real decisions. It also says plainly what a test on invented prices can and cannot show.</p>",
      '<h2 id="describe-the-rule">Step one: describe the rule</h2>',
      "<p>The strategy library sets out well-known approaches in one fixed form: the idea, the rule as it is usually stated, what the approach needs from a market, what it costs and when it fails. That form is a useful template for any rule. A rule is ready to test when it answers four questions.</p>",
      "<ul><li>What must happen for a trade to open?</li><li>Where is the stop-loss?</li><li>Where is the target, or what else closes the trade?</li><li>How much of the balance is at risk on each trade?</li></ul>",
      "<p>If two people reading the rule would take different trades, it is not yet a rule.</p>",
      '<h2 id="test-it-on-invented-prices">Step two: test it on invented prices</h2>',
      "<p>The Rule bench, in the Labs, builds a rule from those same parts: an entry, a stop, a target and a risk per trade. It runs the rule over invented prices and reports the result. The rule is read at the close of a bar and acted on at the open of the next, the spread is paid on the way in, and where one bar touches both the stop and the target the test counts the loss. The bench then runs the same rule on many other invented markets, so one result can be set beside the spread of results.</p>",
      '<h2 id="what-invented-prices-can-and-cannot-show">What invented prices can and cannot show</h2>',
      "<p>The bench’s prices are a random walk, which has no memory. No rule has an edge on such prices, so every gain there is luck and the only reliable effect is cost.</p>",
      "<table><thead><tr><th>A test on invented prices can show</th><th>It cannot show</th></tr></thead><tbody><tr><td>How a backtest decides entries, exits and fills</td><td>Whether the rule has an edge in a real market</td></tr><tr><td>How much the spread takes from a rule that trades often</td><td>How real orders are filled, or how a real spread widens</td></tr><tr><td>How far results differ when one rule meets many markets</td><td>The effect of margin, overnight financing or commission</td></tr><tr><td>How the stop and the target change the share of winning trades</td><td>What the rule will do next</td></tr></tbody></table>",
      "<p>The lesson of the bench is caution. A rule that looks good on one invented market and poor on most others shows how easily one good backtest misleads, on real prices as on invented ones.</p>",
      '<h2 id="see-what-size-does">Step three: see what size does</h2>',
      "<p>The same list of trades gives very different accounts at different sizes. The Risk Room replays one run of trades at several position sizes, works out the chance of a losing streak of a given length, and shows the gain needed to recover a loss: a fall of 50% needs a gain of 100% to return to the start. A rule that survives at a small fraction of the balance per trade can empty an account at a large one, with no change to the rule.</p>",
      '<h2 id="record-real-decisions">Step four: record real decisions</h2>',
      "<p>Simulations leave out the person. The journal on this site keeps a private list of trades in the browser: the plan, what happened and the mood at the time. From that list it works out the win rate, the expectancy and the running total. A journal tests what no simulation can, which is whether the rules were followed. It records what happened. It does not say what will.</p>",
      '<h2 id="what-the-four-steps-add-up-to">What the four steps add up to</h2>',
      "<p>Taken in order, the steps turn a vague idea into something that can be examined: stated, tested for its mechanics, sized, and checked against behaviour. None of them shows that a rule will be profitable. The loss figures that regulators require firms to publish show that most retail accounts trading CFDs lose money, and a careful process changes how a loss is understood, not whether it can happen.</p>",
    ].join("\n"),
  },
];
