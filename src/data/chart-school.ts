/**
 * CHART SCHOOL — the indicators, one page each at /chart-school/[slug].
 *
 * A page says what an indicator measures, exactly how it is calculated, how
 * people read it, what it cannot tell anyone and where people go wrong. It
 * does not say what to do. The rule every entry keeps: an indicator is
 * arithmetic on prices that have already happened; it describes, it does not
 * predict; and every chart on these pages is invented.
 *
 * The worked examples are small enough to check by hand, and the same cases
 * are what the arithmetic in components/chart-school/indicators.ts was
 * checked against. To add a page, add an entry here and a machine of the same
 * slug in components/chart-school/IndicatorMachine.tsx.
 */

export type LessonSlug =
  | "moving-averages"
  | "rsi"
  | "macd"
  | "bollinger-bands"
  | "atr"
  | "stochastic"
  | "support-and-resistance"
  | "trend-lines"
  | "adx"
  | "parabolic-sar"
  | "cci"
  | "williams-r"
  | "donchian-channels"
  | "keltner-channels";

export type Lesson = {
  slug: LessonSlug;
  name: string;
  family: "Trend" | "Momentum" | "Volatility" | "Levels";
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  also: readonly string[];
  /** the opening: what it is, in two or three sentences */
  is: string;
  /** one line for the index */
  card: string;
  facts: readonly { label: string; value: string }[];
  measures: readonly string[];
  steps: readonly { t: string; d: string }[];
  /** what differs between charting programs */
  stepsNote: string;
  worked: { intro: string; lines: readonly string[]; result: string };
  read: readonly string[];
  cannot: readonly string[];
  mistakes: readonly string[];
  machine: { title: string; lead: string };
  faq: readonly { q: string; a: string }[];
  /** glossary slugs; only those the glossary has are shown */
  terms: readonly string[];
};

export const LESSONS: readonly Lesson[] = [
  {
    slug: "moving-averages",
    name: "Moving averages",
    family: "Trend",
    title: "Moving averages: simple and exponential, calculated step by step",
    description:
      "Moving averages explained: how a simple moving average (SMA) and an exponential moving average (EMA) are calculated, step by step with a worked example, how people read them, why they lag and what they cannot tell you. With an interactive chart of invented prices.",
    also: ["SMA vs EMA", "simple moving average formula", "exponential moving average formula", "golden cross", "200-day moving average"],
    is: "A moving average is the average of the last so many closing prices, worked out again at every bar. It smooths a jagged price into a line. A simple average weighs every close in its window equally; an exponential average gives the newest closes more weight.",
    card: "The average of the last so many closes, drawn as a line. Simple and exponential, side by side.",
    facts: [
      { label: "Family", value: "Trend" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Closing prices" },
      { label: "Common lengths", value: "20, 50, 100, 200" },
      { label: "Unit", value: "Price" },
    ],
    measures: [
      "A moving average measures where the price has been, on average, over a chosen number of bars. Nothing more. Because each new bar changes the average only a little, the line moves more slowly and more smoothly than the price it is made from.",
      "The length is the one decision. A short average (10 bars) stays close to the price and turns quickly. A long one (200 bars) is far smoother and turns long after the price has. Neither is more correct: they answer different questions about the same past.",
      "The two common kinds differ only in weighting. The simple moving average (SMA) treats the close from 20 bars ago exactly like the latest one, then drops it completely on the next bar. The exponential moving average (EMA) never drops anything: every past close keeps a share of the weight, and that share shrinks by the same proportion with each bar that passes.",
    ],
    steps: [
      { t: "Choose a length, N.", d: "The number of bars the average looks back over. On a daily chart, N = 20 is roughly a month of trading days." },
      { t: "Simple average: add the last N closes and divide by N.", d: "SMA = (C₁ + C₂ + … + C_N) ÷ N. There is no value until N bars exist." },
      { t: "Move one bar on and do it again.", d: "The oldest close leaves the window and the newest one enters. That is the only reason the line moves." },
      { t: "Exponential average: work out the multiplier.", d: "k = 2 ÷ (N + 1). For N = 20, k = 2 ÷ 21, about 0.095: the newest close gets about 9.5% of the weight." },
      { t: "Give the EMA somewhere to start.", d: "The usual choice, and the one on this page, is the simple average of the first N closes." },
      { t: "Then, for every bar after that:", d: "EMA = close × k + previous EMA × (1 − k). The new value is the old value moved a fraction k of the way towards the latest close." },
    ],
    stepsNote: "Charting programs do not all start an EMA the same way: some begin from the first close instead of a simple average. The difference fades as bars pass, but two programs can disagree on the early values.",
    worked: {
      intro: "Five closes: 10, 12, 11, 13, 16. Length 3.",
      lines: [
        "SMA at bar 3 = (10 + 12 + 11) ÷ 3 = 11",
        "SMA at bar 4 = (12 + 11 + 13) ÷ 3 = 12",
        "SMA at bar 5 = (11 + 13 + 16) ÷ 3 = 13.33",
        "EMA: k = 2 ÷ (3 + 1) = 0.5, and it starts at bar 3 from the simple average, 11",
        "EMA at bar 4 = 13 × 0.5 + 11 × 0.5 = 12",
        "EMA at bar 5 = 16 × 0.5 + 12 × 0.5 = 14",
      ],
      result: "The last close jumped to 16. The exponential average reached 14 while the simple one reached 13.33: the same data, weighted differently.",
    },
    read: [
      "Where the price is relative to the line. A close above a long average is described as an uptrend on that time frame, and below it as a downtrend. This is a description of the recent past, by definition.",
      "The slope. A rising average means recent closes have been higher than the ones leaving the window.",
      "Two averages together. When a shorter average crosses above a longer one, recent prices have risen faster than older ones. The crossing of the 50-bar and 200-bar averages is well known enough to have names: a golden cross upward, a death cross downward.",
      "As a moving reference. In a steady trend, pullbacks sometimes stop near a widely watched average. Sometimes they do not.",
    ],
    cannot: [
      "It cannot say what the next close will be. Every number in it is a close that has already happened.",
      "It cannot turn before the price does. An N-bar simple average is, in effect, (N − 1) ÷ 2 bars behind: a 200-bar average is describing the market of about 100 bars ago.",
      "It cannot tell a trend from a range in advance. In a sideways market the price crosses the average again and again, and each crossing looks, at the time, like the start of something.",
      "It cannot tell you which length is right. Any length that looks ideal was chosen by looking at prices that are already known.",
    ],
    mistakes: [
      "Treating a crossover as a signal with a known outcome. A crossover reports that the average of recent prices has passed the average of older ones. It has already happened when it appears.",
      "Tuning the length until the past looks perfect. A length fitted to one stretch of prices has learned that stretch, not the market.",
      "Comparing a 20-bar average on a five-minute chart with one on a daily chart as if they measured the same thing. One covers under two hours, the other about a month.",
      "Forgetting the cost. A rule that trades every crossing in a sideways market pays the spread on every one of them.",
    ],
    machine: { title: "Two averages, one invented price.", lead: "Set the length of each average and watch how closely it follows the price. Give both the same length to see what the weighting alone changes." },
    faq: [
      { q: "What is the difference between an SMA and an EMA?", a: "Both average past closing prices. A simple moving average gives each of the last N closes the same weight. An exponential moving average gives the newest close a weight of 2 ÷ (N + 1) and lets the weight of older closes shrink steadily, so it reacts sooner to a change. Neither looks ahead." },
      { q: "Which moving average length is best?", a: "None is best. The lengths in common use (20, 50, 100, 200) are conventions, and they are watched partly because they are conventions. A shorter average reacts quickly and crosses the price often; a longer one is smoother and later. A length that fitted past prices well says nothing certain about future ones." },
      { q: "Does a golden cross mean the price will rise?", a: "No. A golden cross is the 50-bar average moving above the 200-bar average. It reports that prices over the last 50 bars have, on average, been higher than over the last 200, which means a rise has already happened. What follows can be a further rise, a fall or nothing much." },
    ],
    terms: ["moving-average", "ema", "golden-cross", "trend", "whipsaw", "indicator"],
  },
  {
    slug: "rsi",
    name: "RSI",
    family: "Momentum",
    title: "RSI (relative strength index): the formula and how to read it",
    description:
      "The relative strength index (RSI) explained: what it measures, the formula with Wilder’s smoothing worked step by step, what overbought and oversold mean, what RSI cannot tell you and the common mistakes. With an interactive chart of invented prices.",
    also: ["relative strength index formula", "RSI 14", "overbought and oversold", "RSI divergence", "Wilder’s smoothing"],
    is: "The relative strength index compares the size of recent rises with the size of recent falls and puts the answer on a scale from 0 to 100. A high reading means the closes of the last few bars have mostly been rises; a low one means they have mostly been falls.",
    card: "Recent rises against recent falls, on a scale of 0 to 100. With Wilder’s smoothing, step by step.",
    facts: [
      { label: "Family", value: "Momentum" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "Changes between closes" },
      { label: "Usual length", value: "14" },
      { label: "Scale", value: "0 to 100" },
      { label: "First described", value: "J. Welles Wilder Jr., 1978" },
    ],
    measures: [
      "RSI measures the balance between up-moves and down-moves over a chosen number of bars. It takes each bar’s change from the previous close, averages the rises, averages the falls, and expresses the rises as a share of the two together.",
      "A reading of 50 means the average rise and the average fall are the same size. A reading of 70 means the average rise is a little over twice the average fall. A reading of 100 means there were no falls at all in the stretch it remembers.",
      "The index was set out by J. Welles Wilder Jr. in his 1978 book New Concepts in Technical Trading Systems, with a length of 14 and with his own way of averaging, which this page follows.",
    ],
    steps: [
      { t: "Take the change of each bar.", d: "Change = close − previous close." },
      { t: "Split it into a gain and a loss.", d: "If the change is positive, gain = change and loss = 0. If it is negative, loss = the size of the change (as a positive number) and gain = 0." },
      { t: "Start the two averages.", d: "First average gain = the sum of the first N gains ÷ N. First average loss = the sum of the first N losses ÷ N. N is usually 14." },
      { t: "Smooth them from then on (Wilder’s smoothing).", d: "Average gain = (previous average gain × (N − 1) + this bar’s gain) ÷ N, and the same for the loss. Each new bar counts for one part in N." },
      { t: "Divide one by the other.", d: "RS = average gain ÷ average loss." },
      { t: "Put it on a scale of 0 to 100.", d: "RSI = 100 − 100 ÷ (1 + RS). If the average loss is zero, RSI is 100." },
    ],
    stepsNote: "Because of the smoothing, an RSI value depends a little on every bar since the calculation began. Two programs with different amounts of history loaded can show slightly different readings for the same bar. A few programs use a plain average instead of Wilder’s smoothing, which gives a jumpier line.",
    worked: {
      intro: "Six closes: 10, 11, 10, 12, 13, 12. Length 3. The changes are +1, −1, +2, +1, −1.",
      lines: [
        "First averages, from the first three changes: gain = (1 + 0 + 2) ÷ 3 = 1; loss = (0 + 1 + 0) ÷ 3 = 0.333",
        "RS = 1 ÷ 0.333 = 3, so RSI = 100 − 100 ÷ (1 + 3) = 75",
        "Next change +1: gain = (1 × 2 + 1) ÷ 3 = 1; loss = (0.333 × 2 + 0) ÷ 3 = 0.222",
        "RS = 1 ÷ 0.222 = 4.5, so RSI = 100 − 100 ÷ 5.5 = 81.8",
        "Next change −1: gain = (1 × 2 + 0) ÷ 3 = 0.667; loss = (0.222 × 2 + 1) ÷ 3 = 0.481",
        "RS = 0.667 ÷ 0.481 = 1.385, so RSI = 100 − 100 ÷ 2.385 = 58.1",
      ],
      result: "One falling bar took the reading from 81.8 to 58.1. With a length of 3 each bar counts for a third; with 14 it counts for a fourteenth, and the line is calmer.",
    },
    read: [
      "The 70 and 30 lines. By convention a reading above 70 is called overbought and one below 30 oversold. The words mean only that recent closes have been mostly rises, or mostly falls.",
      "The 50 line. Above it, average gains have been larger than average losses; below it, the reverse.",
      "Divergence. The price makes a higher high while RSI makes a lower one, or the mirror image. It is read as a move losing pace, and it is far easier to see afterwards than at the time.",
      "The range it lives in. In a long rise RSI tends to spend its time in the upper part of the scale and seldom reaches 30; in a long fall it stays in the lower part and seldom reaches 70. The same number means different things in each.",
    ],
    cannot: [
      "It cannot say that a turn is due. A market that keeps rising keeps RSI above 70, sometimes for a very long time.",
      "It cannot tell you how far a price moved. It is a ratio: a quiet rise and a violent one can give the same reading.",
      "It cannot see anything but closes. Highs, lows, gaps inside a bar, volume and news are all outside it.",
      "It cannot be compared across lengths. A 5-bar RSI reaches 70 and 30 far more often than a 14-bar one on the same prices.",
    ],
    mistakes: [
      "Reading ‘overbought’ as ‘about to fall’. It is a label for what has happened, not a forecast.",
      "Shortening the length until the line touches 70 and 30 at every turn in the past. That is fitting, and it will not hold on prices not yet seen.",
      "Finding divergence in hindsight. On any long chart there are many divergences that were followed by nothing.",
      "Using it alone. One line made from closes is one observation about closes.",
    ],
    machine: { title: "RSI under an invented price.", lead: "Change the length and watch the line calm down or wake up. Move the upper and lower lines and see how often it reaches them." },
    faq: [
      { q: "What does an RSI above 70 mean?", a: "It means that over the bars RSI remembers, the average rise has been more than about 2.3 times the average fall. The convention is to call that overbought. It describes recent closes and does not mean a fall is due: in a persistent rise RSI can stay above 70 for a long time." },
      { q: "Why is RSI usually set to 14?", a: "Because that is the length its author used when he published it in 1978, and most charting programs kept it as the default. It is a convention, not a discovery. A shorter length gives a livelier line that reaches the extremes more often; a longer one gives a calmer line that seldom does." },
      { q: "Why does my RSI differ from the one on another chart?", a: "Usually for one of three reasons: a different length, a different way of averaging (Wilder’s smoothing or a plain average), or a different amount of price history behind the calculation. With Wilder’s smoothing every earlier bar has a small lasting effect, so the starting point matters a little." },
    ],
    terms: ["rsi", "overbought", "oversold", "momentum", "divergence", "indicator"],
  },
  {
    slug: "macd",
    name: "MACD",
    family: "Momentum",
    title: "MACD: the line, the signal and the histogram, calculated",
    description:
      "MACD (moving average convergence divergence) explained: how the MACD line, the signal line and the histogram are calculated from exponential moving averages, what 12, 26 and 9 mean, how people read it and what it cannot tell you. With an interactive chart of invented prices.",
    also: ["moving average convergence divergence", "MACD 12 26 9", "MACD histogram", "MACD signal line", "MACD crossover"],
    is: "MACD is the distance between two exponential moving averages of the price, a faster one and a slower one. A second line, the signal, is an average of that distance, and the histogram is the gap between the two.",
    card: "The distance between a fast and a slow average, its own average, and the gap between them.",
    facts: [
      { label: "Family", value: "Momentum" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "Two EMAs of the close" },
      { label: "Usual settings", value: "12, 26, 9" },
      { label: "Unit", value: "Price (no fixed scale)" },
      { label: "First described", value: "Gerald Appel, late 1970s" },
    ],
    measures: [
      "MACD stands for moving average convergence divergence, which is a description of what it watches: two averages drawing together and moving apart. When the fast average is above the slow one, the MACD line is above zero. When they cross, it is zero.",
      "It is a measure of pace, not of level. A price that climbs by the same amount every bar gives a flat MACD line, because the two averages stay the same distance apart. The line moves when the pace changes.",
      "The line is credited to Gerald Appel, in the late 1970s; the histogram was added later, and is usually credited to Thomas Aspray in 1986. The numbers 12, 26 and 9 are the settings they are published with, and most charts keep them.",
    ],
    steps: [
      { t: "Calculate a fast EMA of the closes.", d: "Usually 12 bars. EMA = close × k + previous EMA × (1 − k), with k = 2 ÷ (N + 1)." },
      { t: "Calculate a slow EMA of the closes.", d: "Usually 26 bars, the same way." },
      { t: "Subtract.", d: "MACD line = fast EMA − slow EMA. It is in the same unit as the price." },
      { t: "Average the MACD line.", d: "Signal line = EMA of the MACD line, usually over 9 bars." },
      { t: "Subtract again.", d: "Histogram = MACD line − signal line. It is the bars drawn around zero." },
    ],
    stepsNote: "The histogram is an average of a difference of averages: three layers of smoothing. Each layer adds delay. As with any EMA, programs differ in how they start the averages, so early values can disagree.",
    worked: {
      intro: "Six closes: 10, 12, 11, 13, 16, 14. Small settings so it fits on a page: fast 2, slow 3, signal 2.",
      lines: [
        "Fast EMA (k = 2 ÷ 3), starting at bar 2 from (10 + 12) ÷ 2 = 11: then 11, 12.33, 14.78, 14.26",
        "Slow EMA (k = 0.5), starting at bar 3 from (10 + 12 + 11) ÷ 3 = 11: then 12, 14, 14",
        "MACD line from bar 3: 11 − 11 = 0; 12.33 − 12 = 0.33; 14.78 − 14 = 0.78; 14.26 − 14 = 0.26",
        "Signal (k = 2 ÷ 3), starting at bar 4 from (0 + 0.33) ÷ 2 = 0.17: then 0.78 × 0.667 + 0.17 × 0.333 = 0.57; then 0.26 × 0.667 + 0.57 × 0.333 = 0.36",
        "Histogram, to three places: 0.333 − 0.167 = 0.167; 0.778 − 0.574 = 0.204; 0.259 − 0.364 = −0.105",
      ],
      result: "The last close fell from 16 to 14. The MACD line is still above zero (the fast average is still above the slow one), but the histogram has gone negative: the gap has started to close.",
    },
    read: [
      "Above or below zero. Above zero the fast average is above the slow one, which is the same information as a moving-average crossover, drawn differently.",
      "The line against its signal. The line crossing above the signal means the distance between the averages is growing faster than its own recent average; crossing below, the reverse.",
      "The histogram. Growing bars mean the gap between line and signal is widening; shrinking bars mean it is narrowing. It turns before the line crosses, because it is the distance to that crossing.",
      "Divergence. The price makes a new high and the MACD line does not. It is read as a rise losing pace.",
    ],
    cannot: [
      "It cannot lead the price. Every part of it is an average of closes that have already happened, and each layer of averaging adds delay.",
      "It cannot say that a market is ‘overbought’. It has no upper or lower limit, and its size depends on the price of the instrument.",
      "It cannot be compared between instruments, or between far-apart years of the same one, without adjusting for price. A MACD of 2 on a price of 2,000 is a much smaller thing than a MACD of 2 on a price of 20.",
      "It cannot tell a trend from a range. In a sideways market the line and the signal cross repeatedly, and every crossing looks alike.",
    ],
    mistakes: [
      "Calling a crossing of the signal line a buy or sell signal. It is a statement about two averages of past prices, and it arrives after the move that caused it.",
      "Reading the height of the histogram as strength without looking at the scale. The scale changes with the price and with the settings.",
      "Counting it as independent of a moving-average crossover. It is made from the same averages, so the two agree by construction.",
      "Changing 12, 26 and 9 until the past looks tidy.",
    ],
    machine: { title: "MACD under an invented price.", lead: "Change the fast and slow lengths to see the line grow and shrink, and the signal length to see how late its crossings come." },
    faq: [
      { q: "What do 12, 26 and 9 mean in MACD?", a: "They are three lengths, in bars. The MACD line is a 12-bar exponential moving average of the close minus a 26-bar one. The signal line is a 9-bar exponential moving average of the MACD line. The histogram is the MACD line minus the signal line. The numbers are the settings it was published with, kept by convention." },
      { q: "Is a MACD crossover a buy signal?", a: "It is a description, not an instruction. When the MACD line crosses above its signal line, the gap between the fast and slow averages has been growing. That has already happened by the time it shows, and what follows can go either way. In a sideways market such crossings are frequent and mean little." },
      { q: "What is the difference between MACD and RSI?", a: "Both describe the pace of recent price changes. RSI compares average rises with average falls and is confined to a scale of 0 to 100. MACD is the distance between two moving averages, has no limits and is in the unit of the price. They often agree, because they are made from the same closes." },
    ],
    terms: ["macd", "ema", "momentum", "divergence", "moving-average", "indicator"],
  },
  {
    slug: "bollinger-bands",
    name: "Bollinger Bands",
    family: "Volatility",
    title: "Bollinger Bands: the formula, the width and what they show",
    description:
      "Bollinger Bands explained: a moving average with a band two standard deviations above and below it. How the standard deviation is calculated step by step, what 20 and 2 mean, what a squeeze is, and what the bands cannot tell you. With an interactive chart of invented prices.",
    also: ["Bollinger Bands formula", "Bollinger Bands 20 2", "Bollinger squeeze", "standard deviation bands", "%B and bandwidth"],
    is: "Bollinger Bands are a moving average with a line above it and a line below it. The lines stand a set number of standard deviations from the average, so they move apart when the price has been jumping about and draw together when it has been quiet.",
    card: "An average with a band either side, set by the standard deviation. Wide when prices jump, narrow when they are quiet.",
    facts: [
      { label: "Family", value: "Volatility" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Closing prices" },
      { label: "Usual settings", value: "20 bars, 2 deviations" },
      { label: "Unit", value: "Price" },
      { label: "First described", value: "John Bollinger, 1980s" },
    ],
    measures: [
      "The bands measure two things at once: where the average close has been (the middle line) and how widely the closes have been scattered around it (the distance to the bands).",
      "The scatter is measured with the standard deviation, a figure from ordinary statistics: roughly, the typical distance of a value from the average of its group. Quiet prices give a small deviation and narrow bands. Jumpy prices give a large one and wide bands.",
      "So a close near the upper band is high compared with the last 20 closes, by a measure that adjusts itself to how lively those closes were. That is all it says. The bands are named after John Bollinger, who developed them in the 1980s.",
    ],
    steps: [
      { t: "Middle band: a simple moving average.", d: "The sum of the last N closes ÷ N. N is usually 20." },
      { t: "Find how far each of those N closes is from that average.", d: "Distance = close − average. Some are positive, some negative." },
      { t: "Square each distance, add them up, divide by N.", d: "Squaring makes every distance positive and counts the large ones more. The result is called the variance." },
      { t: "Take the square root.", d: "That is the standard deviation, back in the unit of the price." },
      { t: "Upper band = middle + K × standard deviation.", d: "K is usually 2." },
      { t: "Lower band = middle − K × standard deviation.", d: "The bands are always the same distance above and below the middle." },
    ],
    stepsNote: "This is the population standard deviation: the squared distances are divided by N. That is how the bands are defined. A program that divides by N − 1 instead (the sample standard deviation) draws slightly wider bands. Two figures are often derived from the bands: %B = (close − lower) ÷ (upper − lower), and bandwidth = (upper − lower) ÷ middle.",
    worked: {
      intro: "Eight closes: 2, 4, 4, 4, 5, 5, 7, 9. Length 8, width 2.",
      lines: [
        "Middle = (2 + 4 + 4 + 4 + 5 + 5 + 7 + 9) ÷ 8 = 40 ÷ 8 = 5",
        "Distances from 5: −3, −1, −1, −1, 0, 0, 2, 4",
        "Squared: 9, 1, 1, 1, 0, 0, 4, 16, which add up to 32",
        "Variance = 32 ÷ 8 = 4; standard deviation = √4 = 2",
        "Upper band = 5 + 2 × 2 = 9; lower band = 5 − 2 × 2 = 1",
        "%B of the last close = (9 − 1) ÷ (9 − 1) = 1: it sits exactly on the upper band",
      ],
      result: "The last close, 9, is two standard deviations above the average of the eight. It is on the band because it is the highest of the group, and for no other reason.",
    },
    read: [
      "The width. Wide bands mean the closes of the last N bars have been spread out; narrow bands mean they have been bunched together.",
      "The squeeze. A stretch of unusually narrow bands. Quiet spells do end, so a squeeze is read as the calm before a larger move. It does not say which way.",
      "A close at or beyond a band. It is high (or low) relative to the recent average, measured against recent scatter. In a strong trend closes can run along a band for many bars, which is called walking the band.",
      "The middle line. It is a 20-bar moving average and is read like one.",
    ],
    cannot: [
      "It cannot say that a price at the upper band will come back. The band is a measurement, not a wall.",
      "It cannot promise that 95% of closes stay inside. That figure belongs to a bell curve of independent values. Prices are neither: the share inside two-deviation bands is usually somewhat lower, and it varies. The chart on this page counts it for you.",
      "It cannot say which way a squeeze will break, or when.",
      "It cannot see the bar’s high and low. The bands are made from closes only, so a wick can pierce a band on a bar that closes well inside it.",
    ],
    mistakes: [
      "Selling because the price touched the upper band, or buying because it touched the lower. A touch says the close is far from its recent average. Trends are made of such closes.",
      "Treating the bands as fixed levels. They move with every bar, and a band that the price ‘bounced off’ may have moved there to meet it.",
      "Widening or narrowing the bands until every past turn touches one.",
      "Forgetting that a narrow band is narrow in price terms. Whether a move out of it would cover the cost of trading is a separate sum.",
    ],
    machine: { title: "Bands around an invented price.", lead: "Change the length and the width, and watch how many closes fall outside. The count is in the sentence under the chart." },
    faq: [
      { q: "What do 20 and 2 mean in Bollinger Bands?", a: "The middle band is a 20-bar simple moving average of the close. The upper and lower bands are 2 standard deviations of those same 20 closes above and below it. Both numbers are the conventional defaults; changing either changes how often the price reaches the bands." },
      { q: "Does the price reverse when it touches a Bollinger Band?", a: "Not reliably. A close at a band is far from its recent average, measured against how scattered recent closes were. Sometimes the price then returns towards the average; in a strong trend it can stay at the band for many bars. The band describes where the price is, not where it goes." },
      { q: "What is a Bollinger squeeze?", a: "A period in which the bands are unusually close together, because the last closes have been unusually near one another. It shows that the market has been quiet. Quiet periods end, but the bands do not say when, or in which direction the price will move when they do." },
    ],
    terms: ["bollinger-bands", "volatility", "moving-average", "breakout", "range", "indicator"],
  },
  {
    slug: "atr",
    name: "ATR",
    family: "Volatility",
    title: "ATR (average true range): the formula and what it measures",
    description:
      "Average true range (ATR) explained: what the true range is, why it includes gaps, how ATR is calculated with Wilder’s smoothing step by step, how it is used to describe distance and what it cannot tell you. With an interactive chart of invented prices.",
    also: ["average true range formula", "ATR 14", "true range", "ATR stop distance", "volatility indicator"],
    is: "The average true range is the average distance a price has travelled per bar, gaps included. It measures how much a market moves and is silent about which way.",
    card: "How far a price travels in a bar, on average, gaps included. A measure of size, not direction.",
    facts: [
      { label: "Family", value: "Volatility" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "High, low and previous close" },
      { label: "Usual length", value: "14" },
      { label: "Unit", value: "Price" },
      { label: "First described", value: "J. Welles Wilder Jr., 1978" },
    ],
    measures: [
      "A bar’s range is its high minus its low. That misses something when a market opens away from where it last closed: the jump happened, but it is not inside the bar. The true range repairs this by measuring from the previous close whenever that gives a larger figure.",
      "ATR is the average of the true range over a number of bars, usually 14. It was set out by J. Welles Wilder Jr. in 1978, in the same book as RSI, and uses the same smoothing.",
      "The result is a distance in the unit of the price: ‘this market has lately been covering about 1.20 a bar’. It rises when bars get longer or gaps appear and falls when the market goes quiet. A long run upward and a long run downward can have exactly the same ATR.",
    ],
    steps: [
      { t: "For each bar, work out three distances.", d: "High − low. The high to the previous close, as a positive number. The low to the previous close, as a positive number." },
      { t: "The true range is the largest of the three.", d: "TR = max(high − low, |high − previous close|, |low − previous close|). The very first bar has no previous close, so its true range is high − low." },
      { t: "Start the average.", d: "First ATR = the sum of the first N true ranges ÷ N. N is usually 14." },
      { t: "Smooth it from then on (Wilder’s smoothing).", d: "ATR = (previous ATR × (N − 1) + this bar’s true range) ÷ N." },
    ],
    stepsNote: "Some programs average the last N true ranges plainly instead of using Wilder’s smoothing; the Rule bench on this site does that, to keep its test simple. The two methods give slightly different numbers that move in the same way.",
    worked: {
      intro: "Five bars, written high / low / close: 10 / 8 / 9, then 11 / 9 / 10, then 13 / 10 / 12, then 12 / 11 / 11, then 15 / 14 / 14. Length 3.",
      lines: [
        "Bar 1: no previous close, so TR = 10 − 8 = 2",
        "Bar 2 (previous close 9): max(11 − 9, |11 − 9|, |9 − 9|) = max(2, 2, 0) = 2",
        "Bar 3 (previous close 10): max(13 − 10, |13 − 10|, |10 − 10|) = 3",
        "First ATR = (2 + 2 + 3) ÷ 3 = 2.33",
        "Bar 4 (previous close 12): max(12 − 11, |12 − 12|, |11 − 12|) = 1, so ATR = (2.33 × 2 + 1) ÷ 3 = 1.89",
        "Bar 5 (previous close 11): max(15 − 14, |15 − 11|, |14 − 11|) = 4, so ATR = (1.89 × 2 + 4) ÷ 3 = 2.59",
      ],
      result: "Bar 5 is only 1 from high to low, but it opened far above the last close. Its true range is 4, and that gap is what lifted the average.",
    },
    read: [
      "As a yardstick of recent movement. A stop or a target can be described as a number of ATRs away, which scales it to how much the market has been moving instead of a fixed number of points.",
      "As a way to compare. ATR divided by the price gives a percentage that can be set beside another instrument’s.",
      "Rising or falling. A rising ATR means bars are getting longer or gaps are appearing; a falling one means the market is settling.",
      "In position sizing. A wider stop on the same risk means a smaller position, so a larger ATR leads, by arithmetic, to a smaller size.",
    ],
    cannot: [
      "It cannot tell you direction. It is built from distances, and every distance is positive.",
      "It cannot tell you how far the next bar will go. It is the average of past bars; a single bar can be several times larger, especially around scheduled news.",
      "It cannot make a stop safe. A stop two ATRs away is hit by an ordinary bar less often than one that is half an ATR away. It is still an instruction, not a promised price, and a gap can pass straight through it.",
      "It cannot be compared in raw form between instruments with different prices.",
    ],
    mistakes: [
      "Reading a rising ATR as bullish. Markets often move fastest when they fall.",
      "Using yesterday’s quiet ATR to judge today’s risk before a scheduled announcement.",
      "Comparing the ATR of two instruments without dividing each by its price.",
      "Mixing time frames: a 14-bar ATR on an hourly chart and one on a daily chart are different quantities.",
    ],
    machine: { title: "The range, averaged, under an invented price.", lead: "Change the length to see how quickly the average responds, and the multiple to see how far that many ATRs reaches either side of each close." },
    faq: [
      { q: "What is a good ATR value?", a: "There is no good or bad value. ATR is a distance in the unit of the price, so it depends on the instrument, its price and the time frame of the chart. It is useful only in comparison: with the same instrument’s own past, or, as a percentage of price, with another instrument." },
      { q: "Why use the true range instead of high minus low?", a: "Because a market can jump between one bar’s close and the next bar’s open. High minus low measures only what happened inside the bar and would miss that jump. The true range measures from the previous close whenever that distance is larger, so a gap counts as movement." },
      { q: "Does a high ATR mean the price will keep moving?", a: "No. A high ATR says that recent bars have been large. Lively periods and quiet periods both tend to last for a while, but ATR does not say when one will give way to the other, and it says nothing at all about direction." },
    ],
    terms: ["atr", "volatility", "gap", "stop-loss", "range", "indicator"],
  },
  {
    slug: "stochastic",
    name: "Stochastic oscillator",
    family: "Momentum",
    title: "Stochastic oscillator: %K and %D, calculated step by step",
    description:
      "The stochastic oscillator explained: how %K and %D are calculated from the highest high and lowest low, the difference between fast and slow stochastics, what readings above 80 and below 20 mean and what the oscillator cannot tell you. With an interactive chart of invented prices.",
    also: ["stochastic oscillator formula", "%K and %D", "slow stochastic", "fast stochastic", "stochastic 14 3 3"],
    is: "The stochastic oscillator says where the latest close sits within the range of the last so many bars: 100 at the very top of that range, 0 at the very bottom. A second line, %D, is an average of the first.",
    card: "Where the close sits between the highest high and the lowest low of recent bars, from 0 to 100.",
    facts: [
      { label: "Family", value: "Momentum" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "High, low and close" },
      { label: "Usual settings", value: "14, 3, 3" },
      { label: "Scale", value: "0 to 100" },
      { label: "First described", value: "George Lane, 1950s" },
    ],
    measures: [
      "Take the highest high and the lowest low of the last 14 bars. That is the range the market has covered. The stochastic oscillator asks one question: how far up that range did the latest bar close?",
      "A reading of 90 means the close is nine tenths of the way from the lowest low to the highest high. A reading of 10 means it is near the bottom. The idea, usually credited to George Lane in the 1950s, is that closes gather near the top of the range while a rise is under way and near the bottom during a fall.",
      "Despite its name there is nothing random in it. And although it shares a 0 to 100 scale with RSI, it measures a different thing: RSI compares the sizes of rises and falls between closes, while the stochastic compares one close with a range of highs and lows.",
    ],
    steps: [
      { t: "Find the highest high and lowest low of the last N bars.", d: "N is usually 14, and the latest bar is included." },
      { t: "Place the close in that range.", d: "Raw %K = 100 × (close − lowest low) ÷ (highest high − lowest low)." },
      { t: "Smooth it.", d: "%K = a simple average of the raw figure over a few bars, usually 3. With a smoothing of 1 nothing is averaged, and the result is called the fast stochastic." },
      { t: "Average it again.", d: "%D = a simple average of %K, usually over 3 bars. It is the slower, later line." },
    ],
    stepsNote: "The names are easy to confuse. The fast stochastic is the raw figure and its 3-bar average. The slow stochastic takes that average as its %K and averages it again for %D. A ‘full’ stochastic lets all three numbers be set, which is what the chart on this page does. If the highest high equals the lowest low the formula divides by zero; this page shows 50 for such a bar.",
    worked: {
      intro: "Four bars, written high / low / close: 10 / 8 / 9, then 12 / 9 / 11, then 11 / 9 / 10, then 13 / 10 / 12. Length 3, no smoothing, %D over 2.",
      lines: [
        "Bar 3: highest high of bars 1 to 3 = 12; lowest low = 8",
        "%K = 100 × (10 − 8) ÷ (12 − 8) = 100 × 2 ÷ 4 = 50",
        "Bar 4: highest high of bars 2 to 4 = 13; lowest low = 9",
        "%K = 100 × (12 − 9) ÷ (13 − 9) = 100 × 3 ÷ 4 = 75",
        "%D at bar 4 = (50 + 75) ÷ 2 = 62.5",
      ],
      result: "The last bar closed three quarters of the way up the range of the last three bars. %D, being an average, is behind it.",
    },
    read: [
      "The 80 and 20 lines. By convention, above 80 is called overbought and below 20 oversold: the close is near the top, or the bottom, of its recent range.",
      "%K against %D. %K crossing its own average means the close has moved up or down within the range faster than it had been.",
      "Divergence. The price makes a higher high while the oscillator makes a lower one.",
      "Together with the trend. In a steady rise the oscillator spends most of its time high; readers then pay attention to its dips, not to its peaks.",
    ],
    cannot: [
      "It cannot say a turn is due. A market making new highs bar after bar closes near the top of its range every time, and the oscillator stays above 80 throughout.",
      "It cannot tell you how big the range is. A reading of 90 in a range of 0.50 and in a range of 50 look identical.",
      "It cannot hold still. The range itself moves: when an old high drops out of the window, the reading can jump although the price has barely changed.",
      "It cannot be compared with RSI number for number. They share a scale and nothing else.",
    ],
    mistakes: [
      "Reading above 80 as ‘sell’ and below 20 as ‘buy’. In a trend that reading repeats for a long time.",
      "Acting on every %K and %D crossing. With the usual settings they cross very often, and most crossings are followed by nothing in particular.",
      "Mixing up fast, slow and full versions when comparing two charts.",
      "Shortening the length to catch every wiggle. A short window makes the line swing from 0 to 100 on ordinary noise.",
    ],
    machine: { title: "%K and %D under an invented price.", lead: "Change the length of the range, then the two smoothings, and watch how often the lines reach 80 and 20." },
    faq: [
      { q: "What is the difference between the fast and the slow stochastic?", a: "The fast stochastic uses the raw figure, 100 × (close − lowest low) ÷ (highest high − lowest low), as %K and its 3-bar average as %D. The slow stochastic takes that 3-bar average as its %K and averages it once more for %D. The slow version is smoother and later." },
      { q: "What does a stochastic reading above 80 mean?", a: "That the latest closes are in the top fifth of the range between the lowest low and the highest high of the bars it looks back over. The convention is to call that overbought. It describes position in a recent range and does not mean a fall is due: in a steady rise the reading stays high." },
      { q: "Is the stochastic oscillator the same as RSI?", a: "No. Both run from 0 to 100 and both are called momentum oscillators, but they measure different things. RSI compares the average size of rises between closes with the average size of falls. The stochastic places the latest close within the range of recent highs and lows. They can disagree." },
    ],
    terms: ["stochastic-oscillator", "overbought", "oversold", "momentum", "divergence", "indicator"],
  },
  {
    slug: "support-and-resistance",
    name: "Support and resistance",
    family: "Levels",
    title: "Support and resistance: what the levels are and how they are found",
    description:
      "Support and resistance explained: what the levels are, how swing highs and swing lows are found and grouped into zones, why a level is an area and not a line, what a breakout is and what a level cannot tell you. With an interactive chart of invented prices.",
    also: ["support and resistance levels", "how to draw support and resistance", "swing high and swing low", "breakout", "role reversal"],
    is: "Support is a price area where falls have stopped before. Resistance is an area where rises have stopped before. Both are observations about where a price turned in the past, marked on the chart so that they can be watched.",
    card: "Price areas where falls and rises have stopped before, found here by one stated rule.",
    facts: [
      { label: "Family", value: "Levels" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Past highs and lows" },
      { label: "Settings", value: "None agreed: a matter of judgement" },
      { label: "Unit", value: "Price" },
    ],
    measures: [
      "Unlike the other pages in this school, there is no single formula here. Support and resistance are marked by eye, and two people looking at the same chart will mark different levels. That is the first thing to know about them.",
      "What they have in common is the raw material: the places where the price turned. A turn at the top is a swing high and a turn at the bottom is a swing low. Where several turns happened at about the same price, a reader draws a level. Below the current price it is called support; above it, resistance.",
      "Other levels are calculated or simply noticed: round numbers, the previous day’s high and low, and pivot points, which are sums on the previous period’s prices (the classic pivot is (high + low + close) ÷ 3). To show how much the result depends on the rule, the chart on this page uses one stated rule and lets you change its three settings.",
    ],
    steps: [
      { t: "Find the swing highs and swing lows.", d: "A swing high is a bar whose high is higher than the highs of the S bars on each side of it. A swing low is the mirror image. S is the swing size." },
      { t: "Collect the prices of those turns.", d: "The high of each swing high and the low of each swing low." },
      { t: "Group the prices that lie close together.", d: "Sorted from the lowest, a price joins the group below it if it is within the zone width of that group’s lowest price. On this page the zone width is a multiple of the 14-bar ATR, so that it scales with how much the price has been moving." },
      { t: "Keep the groups with enough turns.", d: "A group with at least M turns is a level. It is drawn at the average of its prices, as a zone one width deep." },
      { t: "Name them by where the price is now.", d: "A level below the last close is support; a level above it is resistance. The same level changes its name when the price passes through it." },
    ],
    stepsNote: "A swing cannot be recognised until S bars have passed after it. The most recent turn on any chart is therefore missing from the levels, and every level is, to that extent, late. This rule is one of many that could be written; it is here to be taken apart, not to be relied on.",
    worked: {
      intro: "Six turns found on a chart, at 100.00, 100.40, 105.00, 100.20, 110.00 and 105.30. Zone width 0.50, at least 2 turns.",
      lines: [
        "Sorted: 100.00, 100.20, 100.40, 105.00, 105.30, 110.00",
        "100.20 and 100.40 are within 0.50 of 100.00: one group of three",
        "105.00 is more than 0.50 above 100.00: a new group; 105.30 joins it",
        "110.00 is alone: one turn is not enough, so it is not a level",
        "Level 1 = (100.00 + 100.20 + 100.40) ÷ 3 = 100.20, with 3 turns",
        "Level 2 = (105.00 + 105.30) ÷ 2 = 105.15, with 2 turns",
      ],
      result: "With the last close at 103, the level at 100.20 is support and the one at 105.15 is resistance. Widen the zone to 5.50 and the first five turns merge into a single level: the rule decides what is seen.",
    },
    read: [
      "As areas, not lines. A price rarely turns at exactly the same figure twice; readers mark a zone and expect the price to wander inside it.",
      "By the number of turns. A level where the price has turned several times gets more attention than one where it turned once.",
      "Role reversal. When a price rises through resistance, the same area is afterwards watched as support, and the reverse.",
      "Breakouts. A close beyond a level is called a breakout. When the price soon returns inside, it is called a false breakout, and these are common.",
    ],
    cannot: [
      "It cannot say whether a level will hold. A level is a record of past turns. Every level that ever broke had held until then.",
      "It cannot be exact. Different swing sizes, different zone widths and different amounts of history give different levels, and none is the true one.",
      "It cannot include the latest turn, which is not yet confirmed.",
      "It cannot say why the price turned. The usual explanations (remembered prices, orders resting near obvious levels, round numbers) are plausible, and none can be read off the chart.",
    ],
    mistakes: [
      "Drawing a level as a hairline and treating a move a few points beyond it as decisive.",
      "Marking levels after the fact. With the whole chart in view it is easy to find lines the price ‘respected’; they were less obvious on the day.",
      "Drawing so many lines that the price is always near one. A chart covered in levels explains everything and so tells nothing.",
      "Assuming others see the same levels. Orders do gather near obvious prices, which is also why a level is often overshot before the price turns.",
    ],
    machine: { title: "Levels on an invented price, by one stated rule.", lead: "Change the swing size, the zone width and the number of turns a level needs. Watch levels appear, merge and vanish while the prices stay the same." },
    faq: [
      { q: "How are support and resistance levels found?", a: "Most often by eye: a reader marks the prices where a market has turned more than once. They can also be found by rule, for example by listing swing highs and lows and grouping those that lie close together, or calculated, as pivot points are from the previous period’s high, low and close. Different methods give different levels." },
      { q: "Why would a past price matter to a market?", a: "Several explanations are offered: traders remember prices where they bought or sold, orders are often left at obvious levels and round numbers, and a level that many people watch attracts activity for that reason alone. These are reasonable, but none guarantees that a level will hold, and many do not." },
      { q: "What happens when support or resistance is broken?", a: "A close beyond a level is called a breakout. Sometimes the price carries on; often it returns inside the old range, which is called a false breakout. By convention a broken resistance is afterwards watched as support, and a broken support as resistance. Nothing about the break says which outcome will follow." },
    ],
    terms: ["support", "resistance", "breakout", "range", "pivot-point", "technical-analysis"],
  },
  {
    slug: "trend-lines",
    name: "Trend lines",
    family: "Levels",
    title: "Trend lines: how they are drawn, and what a break means",
    description:
      "Trend lines explained: a straight line through two swing lows or two swing highs. How the slope is calculated, how the line is extended, why any two points make a line, what a break of a trend line does and does not mean. With an interactive chart of invented prices.",
    also: ["how to draw a trend line", "trend line break", "uptrend and downtrend", "trend channel", "higher lows"],
    is: "A trend line is a straight line drawn through two or more turning points of a price: through rising lows in an uptrend, or through falling highs in a downtrend. It is a ruler laid on the past and extended to the right.",
    card: "A straight line through two turning points, extended to the right. Any two points make one.",
    facts: [
      { label: "Family", value: "Levels" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Two or more swing points" },
      { label: "Settings", value: "None agreed: a matter of judgement" },
      { label: "Unit", value: "Price per bar (the slope)" },
    ],
    measures: [
      "An uptrend is usually described as a series of higher lows and higher highs, and a downtrend as lower highs and lower lows. A trend line makes that description visible: join two of the lows of a rise and the line shows how steeply the lows have been climbing.",
      "The slope is the one number in it: how much the line rises or falls with each bar. Once two points are chosen the rest is arithmetic, and the line can be carried on to the right, past the last bar, into space where there are no prices yet.",
      "That last step is where the trouble starts. The line is exact, and it looks like a forecast. It is not one: it is the path the lows would follow if they kept doing what they did between two points chosen by the person holding the ruler.",
    ],
    steps: [
      { t: "Find the swing points.", d: "A swing low is a bar whose low is lower than the lows of the S bars on each side of it; a swing high is the mirror image." },
      { t: "Choose two of them.", d: "For a line under a rise, two swing lows; for a line over a fall, two swing highs. Call them (x₁, y₁) and (x₂, y₂), where x is the bar number and y the price. The chart on this page takes the last two inside its look-back." },
      { t: "Work out the slope.", d: "Slope = (y₂ − y₁) ÷ (x₂ − x₁): the change in price for each bar." },
      { t: "Extend it.", d: "Line at bar x = y₁ + slope × (x − x₁)." },
      { t: "Compare the price with it.", d: "Distance = close − line. A close on the far side of the line is called a break." },
    ],
    stepsNote: "The scale of the chart matters. On an ordinary (arithmetic) scale a straight line means the same number of points per bar. On a logarithmic scale it means the same percentage per bar. The same two points give different lines on each, and over a long chart they part company.",
    worked: {
      intro: "Two swing lows: bar 10 at 100.00 and bar 30 at 104.00.",
      lines: [
        "Slope = (104.00 − 100.00) ÷ (30 − 10) = 4 ÷ 20 = 0.20 a bar",
        "Line at bar 40 = 100.00 + 0.20 × (40 − 10) = 106.00",
        "If bar 40 closes at 107.50, the distance is 107.50 − 106.00 = 1.50 above the line",
        "If bar 41 closes at 105.90, the line there is 106.20, and the close is 0.30 below it: a break",
      ],
      result: "The break says that the lows are no longer rising by 0.20 a bar. It does not say they are falling. The price could now rise more slowly, go sideways or turn.",
    },
    read: [
      "As a picture of pace. A steep line under the lows means a fast rise; a shallow one, a slow rise.",
      "By its touches. Two points make a line; a third turn at the line is taken as some evidence that others see it too.",
      "A break. A close beyond the line means the pace it described has not been kept. Readers then look at what the price does next, not at the break alone.",
      "Channels. A second line, parallel to the first and drawn through the opposite turns, encloses the price in a channel.",
    ],
    cannot: [
      "It cannot exist without a choice. Any two points on a chart can be joined, and a different pair gives a different line. Move the settings on this page’s chart and the line moves while the prices stay the same.",
      "It cannot say that a break is a reversal. Steep lines are broken constantly by trends that then continue at a gentler pace.",
      "It cannot say where the price will be. The part of the line to the right of the last bar is an extension, not information.",
      "It cannot be confirmed quickly. A swing point needs bars after it before it counts, so the line through the newest turn is always drawn late.",
    ],
    mistakes: [
      "Choosing the two points that make the line fit, and then being impressed by the fit.",
      "Mixing wicks and closes: drawing through the low of one bar and the close of another. Either convention is used; the same one should be used throughout.",
      "Redrawing the line after each break so that the trend is never over.",
      "Trusting very steep lines. The steeper the line, the sooner an ordinary pause crosses it.",
    ],
    machine: { title: "Two lines through an invented price.", lead: "One line joins the last two swing lows and the other the last two swing highs. Change the swing size or the look-back and the same prices give different lines." },
    faq: [
      { q: "How do you draw a trend line?", a: "Find two turning points of the same kind: two lows in a rise, or two highs in a fall. Join them with a straight line and extend it to the right. The slope is the difference in price divided by the number of bars between the two points. A third turn near the line is taken as some support for it." },
      { q: "How many touches make a trend line valid?", a: "By convention, two points are needed to draw a line and a third touch is treated as a test of it. ‘Valid’ is a strong word for a line someone chose: more touches mean the line has described more of the past, and still say nothing certain about the next bar." },
      { q: "Should a trend line go through the wicks or the closes?", a: "Both are used. Lines through the wicks use each bar’s extreme; lines through the closes ignore brief spikes. What matters is using one convention consistently, because a line drawn through whichever point happens to fit can be made to show anything." },
    ],
    terms: ["trend", "support", "resistance", "breakout", "pullback", "technical-analysis"],
  },
  {
    slug: "adx",
    name: "ADX",
    family: "Trend",
    title: "ADX (average directional index): +DI, −DI and the formula",
    description:
      "The average directional index (ADX) explained: what directional movement is, how +DI, −DI, DX and ADX are calculated with Wilder’s smoothing step by step, what readings above 25 are taken to mean and what ADX cannot tell you. With an interactive chart of invented prices.",
    also: ["average directional index formula", "ADX 14", "+DI and −DI", "directional movement index", "DMI indicator"],
    is: "The average directional index measures how one-sided recent movement has been, on a scale from 0 to 100. It says how much direction a market has had and is silent about which direction. Two companion lines, +DI and −DI, carry the direction.",
    card: "How one-sided recent movement has been, from 0 to 100. Strength of direction, not the direction.",
    facts: [
      { label: "Family", value: "Trend" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "High, low and previous close" },
      { label: "Usual length", value: "14" },
      { label: "Scale", value: "0 to 100" },
      { label: "First described", value: "J. Welles Wilder Jr., 1978" },
    ],
    measures: [
      "Each bar is compared with the one before. If its high went further above the previous high than its low went below the previous low, the bar has upward directional movement of that amount. In the mirror case it has downward movement. A bar that stayed inside the previous bar has neither.",
      "Those movements are averaged and set against the average true range, which gives two lines: +DI, the share of recent range that was upward movement, and −DI, the share that was downward. When one is much larger than the other, movement has been one-sided.",
      "ADX is an average of how far apart the two lines are, as a proportion of their sum. A long rise and a long fall of the same steadiness give the same ADX. It was set out by J. Welles Wilder Jr. in 1978, in the same book as RSI and ATR, and uses the same smoothing.",
    ],
    steps: [
      { t: "Find each bar’s directional movement.", d: "Up-move = high − previous high. Down-move = previous low − low. If the up-move is the larger and above zero, +DM = up-move; otherwise +DM = 0. If the down-move is the larger and above zero, −DM = down-move; otherwise −DM = 0." },
      { t: "Find each bar’s true range.", d: "TR = max(high − low, |high − previous close|, |low − previous close|), as for ATR." },
      { t: "Smooth all three (Wilder’s smoothing).", d: "Each starts as the plain average of its first N values, then: average = (previous average × (N − 1) + this bar’s value) ÷ N. N is usually 14." },
      { t: "Turn the movements into the two DI lines.", d: "+DI = 100 × smoothed +DM ÷ smoothed TR. −DI = 100 × smoothed −DM ÷ smoothed TR." },
      { t: "Measure how far apart they are.", d: "DX = 100 × |+DI − −DI| ÷ (+DI + −DI). If both are zero, this page shows 0." },
      { t: "Average that.", d: "ADX starts as the plain average of the first N values of DX, then ADX = (previous ADX × (N − 1) + DX) ÷ N." },
    ],
    stepsNote: "ADX is a smoothing of a ratio of smoothings, so it needs about twice its length in bars before its first value and it is late by construction. Wilder’s own worksheets kept running totals instead of averages; the ratios, and so the lines, are the same. Programs with different amounts of history loaded can differ slightly, as with RSI.",
    worked: {
      intro: "Five bars, written high / low / close: 10 / 8 / 9, then 12 / 9 / 11, then 13 / 11 / 12, then 12 / 9 / 10, then 11 / 8 / 9. Length 2.",
      lines: [
        "Bar 2: up-move 12 − 10 = 2, down-move 8 − 9 = −1, so +DM = 2 and −DM = 0; TR = 3",
        "Bar 3: up-move 1, down-move −2, so +DM = 1 and −DM = 0; TR = 2",
        "At bar 3: smoothed +DM = (2 + 1) ÷ 2 = 1.5; smoothed −DM = 0; smoothed TR = (3 + 2) ÷ 2 = 2.5. +DI = 100 × 1.5 ÷ 2.5 = 60; −DI = 0; DX = 100 × 60 ÷ 60 = 100",
        "Bar 4: up-move −1, down-move 11 − 9 = 2, so +DM = 0 and −DM = 2; TR = 3. Smoothed +DM = (1.5 + 0) ÷ 2 = 0.75; smoothed −DM = (0 + 2) ÷ 2 = 1; smoothed TR = (2.5 + 3) ÷ 2 = 2.75",
        "At bar 4: +DI = 100 × 0.75 ÷ 2.75 = 27.27; −DI = 100 × 1 ÷ 2.75 = 36.36; DX = 100 × 9.09 ÷ 63.64 = 14.29. First ADX = (100 + 14.29) ÷ 2 = 57.14",
        "Bar 5: −DM = 1, TR = 3. +DI = 100 × 0.375 ÷ 2.875 = 13.04; −DI = 100 × 1 ÷ 2.875 = 34.78; DX = 100 × 21.74 ÷ 47.83 = 45.45. ADX = (57.14 + 45.45) ÷ 2 = 51.30",
      ],
      result: "The price rose for two bars and fell for two. −DI has passed +DI, which records the change of direction, while ADX is still high because it averages one-sidedness and both stretches were one-sided.",
    },
    read: [
      "The level of ADX. By convention a reading above about 25 is described as a trending market and one below about 20 as a market without much direction. The figures are conventions, not thresholds with a known effect.",
      "Rising or falling. A rising ADX means movement has been getting more one-sided; a falling one means the two directions have been drawing level.",
      "+DI against −DI. Whichever is higher shows which direction has had the larger movement. Their crossings are watched as changes of direction.",
      "Together. Readers use ADX to decide how much weight to give to the DI lines: a crossing while ADX is low is treated as noise more readily than one while it is high.",
    ],
    cannot: [
      "It cannot tell you direction. A steady fall gives as high an ADX as a steady rise.",
      "It cannot say that a trend will continue. A high reading says that recent movement was one-sided, and it stays high for some time after that has stopped being true.",
      "It cannot be early. It is built from three layers of averaging, and at the usual length of 14 its first value needs 28 bars.",
      "It cannot tell a quiet market from a violent one. Movement is divided by the true range, so a small, steady drift and a large, steady run can read the same.",
    ],
    mistakes: [
      "Reading a rising ADX as a rising price. It rises in a falling market too.",
      "Reading a falling ADX as a reversal. It falls when a trend pauses, and when a market that was falling starts to rise.",
      "Treating 25 as a switch between two kinds of market. The line is a convention, and a market does not change character as the reading passes it.",
      "Trading every crossing of +DI and −DI. In a sideways market they cross repeatedly.",
    ],
    machine: { title: "ADX and the two DI lines, under an invented price.", lead: "Change the length and watch how late the line becomes. Move the line drawn across the panel and count how often ADX is above it." },
    faq: [
      { q: "What does an ADX above 25 mean?", a: "That over the bars ADX remembers, movement in one direction has been clearly larger than movement in the other. By convention that is called a trending market. It does not say which way the trend runs, and it does not say that the trend will last: the reading describes bars that have already closed." },
      { q: "What is the difference between ADX and the DI lines?", a: "+DI and −DI measure upward and downward movement separately, each as a share of the average true range. ADX measures how far apart those two lines have been, whichever is on top. The DI lines carry the direction; ADX carries only how one-sided the movement was." },
      { q: "Can ADX be used alone?", a: "It answers one question, how one-sided recent movement has been, and nothing else. It is usually read beside the DI lines or the price itself, because by construction it cannot say which way a market has moved." },
    ],
    terms: ["trend", "atr", "momentum", "range", "whipsaw", "indicator"],
  },
  {
    slug: "parabolic-sar",
    name: "Parabolic SAR",
    family: "Trend",
    title: "Parabolic SAR: the stop-and-reverse formula, step by step",
    description:
      "Parabolic SAR explained: what stop and reverse means, how the SAR is calculated from the extreme point and the acceleration factor step by step, what 0.02 and 0.2 are, how people read the dots and what they cannot tell you. With an interactive chart of invented prices.",
    also: ["parabolic SAR formula", "stop and reverse", "acceleration factor", "PSAR 0.02 0.2", "parabolic SAR trailing stop"],
    is: "The parabolic SAR is a row of dots that trails the price: under the bars while the price is rising, over them while it is falling. Each dot moves a fraction of the way towards the furthest price the move has reached, and the fraction grows as the move goes on. When a bar crosses the dot, the dots change sides.",
    card: "Dots that trail the price and change sides when a bar crosses them. Stop and reverse.",
    facts: [
      { label: "Family", value: "Trend" },
      { label: "Drawn", value: "On the price, as dots" },
      { label: "Made from", value: "Highs and lows" },
      { label: "Usual settings", value: "Step 0.02, maximum 0.2" },
      { label: "Unit", value: "Price" },
      { label: "First described", value: "J. Welles Wilder Jr., 1978" },
    ],
    measures: [
      "SAR stands for stop and reverse. J. Welles Wilder Jr. published it in 1978 as a complete rule: hold a position in the direction of the dots, and when the price touches the dot, close it and open the opposite one. Most people who use it now use only the dots, as a trailing level.",
      "The dot follows the price at a growing pace. It moves each bar by a fraction of the distance to the extreme point, which is the highest high of a rising run or the lowest low of a falling one. The fraction, called the acceleration factor, starts small and steps up each time a new extreme is made. Drawn out, the path curves like a parabola, which is where the name comes from.",
      "Nothing in it measures why the price moved, or how far it may go. It is a level that tightens with time and with progress, and it is always on one side of the price or the other: it has no neutral state.",
    ],
    steps: [
      { t: "Know the three numbers it carries.", d: "The SAR itself; the extreme point (EP), the highest high of a rising run or the lowest low of a falling one; and the acceleration factor (AF), which starts at the step, usually 0.02." },
      { t: "Move the SAR towards the extreme point.", d: "SAR = previous SAR + AF × (EP − previous SAR)." },
      { t: "Keep it out of recent bars.", d: "In a rising run the SAR may not be above the lows of the two bars before; if it would be, it is held at the lower of them. In a falling run it may not be below the highs of the two bars before." },
      { t: "See whether the bar crossed it.", d: "In a rising run, a bar whose low is below the SAR reverses it. In a falling run, a bar whose high is above the SAR does." },
      { t: "If it did not, update.", d: "If the bar made a new extreme, EP becomes that price and AF grows by one step, up to the maximum, usually 0.2. Otherwise both stay as they are." },
      { t: "If it did, reverse.", d: "The SAR jumps to the extreme point of the run that has just ended. The new EP is the reversing bar’s low (or high), and AF goes back to the step." },
    ],
    stepsNote: "Programs differ in how they start: there is no SAR for the first bar and no agreed rule for the first direction. This page begins at the second bar, rising if it closed at or above the first, with the SAR at the lower of the first two lows (or the higher of the two highs). On a reversal it uses the extreme of the ended run with the reversing bar included. The differences fade after the first reversal.",
    worked: {
      intro: "Six bars, written high / low: 10 / 9, then 11 / 10, then 12 / 11, then 13 / 11.5, then 13.5 / 12, then 12.5 / 11. The second bar closed above the first. Larger settings so it fits on a page: step 0.1, maximum 0.3.",
      lines: [
        "Bar 2: rising. SAR = the lowest low so far = 9; EP = the highest high so far = 11; AF = 0.1",
        "Bar 3: SAR = 9 + 0.1 × (11 − 9) = 9.2, but it may not be above the low of bar 1, so it is held at 9. The low, 11, is above it. New high 12: EP = 12, AF = 0.2",
        "Bar 4: SAR = 9 + 0.2 × (12 − 9) = 9.6. The low, 11.5, is above it. New high 13: EP = 13, AF = 0.3",
        "Bar 5: SAR = 9.6 + 0.3 × (13 − 9.6) = 10.62. The low, 12, is above it. New high 13.5: EP = 13.5; AF is already at its maximum, 0.3",
        "Bar 6: SAR = 10.62 + 0.3 × (13.5 − 10.62) = 11.484. The low, 11, is below it: a reversal",
        "The SAR jumps to the old extreme point, 13.5, and is now over the bars. EP = 11, the bar’s low; AF = 0.1 again",
      ],
      result: "The dot gained 0.6, then 1.02, then 0.86 while the price climbed, and a single bar that dipped to 11 was enough to cross it. The reversal says the dot was touched. It does not say the rise is over.",
    },
    read: [
      "The side the dots are on. Under the bars, the recent run has been upward; over them, downward. This is a description of the run so far.",
      "As a trailing level. The dot is used as a place for a stop that follows the price and never moves back. A stop is an instruction, not a promised price, and a gap can pass through it.",
      "The gap between dot and price. A wide gap early in a run narrows as the factor grows; a dot close to the price is crossed by an ordinary bar.",
      "The number of reversals. Many reversals in a short stretch show a market going sideways, where the method was not designed to work.",
    ],
    cannot: [
      "It cannot stand aside. It is always under or over the price, so in a sideways market it reverses again and again, and every reversal looks like the others.",
      "It cannot say how far a run will go or when it will end. The dot follows; it does not anticipate.",
      "It cannot adapt to how lively a market is. The step and the maximum are fixed numbers, whatever the size of the bars.",
      "It cannot make a reversal mean a new trend. A reversal records one bar reaching one level.",
    ],
    mistakes: [
      "Treating each change of side as a signal to trade. Wilder’s own rule did, and he noted that it suits markets that trend. In a range it trades at every turn and pays the spread each time.",
      "Raising the step to make the dots hug the price. A tighter dot is crossed by smaller bars, so there are more reversals, not better ones.",
      "Reading a dot far from the price as safety. Its distance is a product of the formula, not of anything about the market.",
      "Forgetting that the dot for a bar is fixed before the bar begins. It is known in advance, which is useful, and it knows nothing of the bar, which is the limit.",
    ],
    machine: { title: "Dots that follow an invented price.", lead: "Raise the step and the dots close in sooner; raise the maximum and they close in further. Count how often they change sides." },
    faq: [
      { q: "What do 0.02 and 0.2 mean in parabolic SAR?", a: "They are the step and the maximum of the acceleration factor. The factor starts at 0.02, so the dot first moves 2% of the way towards the extreme point each bar. Each new extreme adds another 0.02, up to 0.2, when the dot moves a fifth of the remaining distance each bar. They are the published defaults, kept by convention." },
      { q: "Does a parabolic SAR reversal mean the trend has changed?", a: "It means one bar reached the dot. Sometimes a new run in the other direction follows; often the price carries on as before and the dots reverse again a few bars later. In a sideways market reversals are frequent and say little." },
      { q: "Why does the parabolic SAR speed up?", a: "Because the acceleration factor grows by one step every time the run makes a new extreme. The idea in the design is that a level which trails a move should tighten as the move matures. The effect is that the longer and further a run goes, the closer the dot comes to the price." },
    ],
    terms: ["trend", "trailing-stop", "stop-loss", "whipsaw", "range", "indicator"],
  },
  {
    slug: "cci",
    name: "CCI",
    family: "Momentum",
    title: "CCI (commodity channel index): the formula and the 0.015",
    description:
      "The commodity channel index (CCI) explained: the typical price, the mean deviation, where the constant 0.015 comes from, how CCI is calculated step by step, what +100 and −100 are taken to mean and what CCI cannot tell you. With an interactive chart of invented prices.",
    also: ["commodity channel index formula", "CCI 20", "typical price", "mean deviation", "CCI +100 and −100"],
    is: "The commodity channel index says how far a bar’s typical price is from its recent average, measured in units of how far typical prices have usually been from that average. Zero is the average itself. It has no upper or lower limit.",
    card: "How far the price is from its own average, measured against its usual distance. No limits.",
    facts: [
      { label: "Family", value: "Momentum" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "High, low and close" },
      { label: "Usual length", value: "20 (14 is also common)" },
      { label: "Scale", value: "Around zero, with no limits" },
      { label: "First described", value: "Donald Lambert, 1980" },
    ],
    measures: [
      "CCI starts from the typical price of a bar: its high, low and close added together and divided by three. It then asks how far the latest typical price is from the average of the last N of them.",
      "A distance means little without something to compare it with, so it is divided by the mean deviation: the average distance of those N typical prices from their own average. A reading of zero means the bar is at its average. A positive reading means it is above, and a larger one means it is further above than these bars usually are.",
      "Donald Lambert published the index in 1980 for commodity markets, hence the name; it is applied to any instrument now. He multiplied the mean deviation by a constant, 0.015, chosen so that readings would mostly lie between −100 and +100. How many actually do depends on the prices and on the length.",
    ],
    steps: [
      { t: "Work out each bar’s typical price.", d: "TP = (high + low + close) ÷ 3." },
      { t: "Average the last N typical prices.", d: "A simple moving average of TP. N is usually 20." },
      { t: "Find how far each of those N is from that average.", d: "Distance = |TP − average|, always as a positive number." },
      { t: "Average the distances.", d: "The result is the mean deviation. It is not the standard deviation: nothing is squared." },
      { t: "Divide.", d: "CCI = (latest TP − average) ÷ (0.015 × mean deviation). If the mean deviation is zero, this page shows 0." },
    ],
    stepsNote: "The mean deviation is measured from the latest bar’s average for all N bars, not from the average each bar had at the time. Some programs build CCI from closes instead of typical prices, which gives a slightly different line.",
    worked: {
      intro: "Four bars, written high / low / close: 11 / 9 / 10, then 13 / 10 / 13, then 16 / 12 / 14, then 15 / 11 / 13. Length 3.",
      lines: [
        "Typical prices: (11 + 9 + 10) ÷ 3 = 10; (13 + 10 + 13) ÷ 3 = 12; (16 + 12 + 14) ÷ 3 = 14; (15 + 11 + 13) ÷ 3 = 13",
        "Bar 3: average of 10, 12, 14 = 12. Distances from 12: 2, 0, 2. Mean deviation = 4 ÷ 3 = 1.333",
        "CCI = (14 − 12) ÷ (0.015 × 1.333) = 2 ÷ 0.02 = +100",
        "Bar 4: average of 12, 14, 13 = 13. Distances from 13: 1, 1, 0. Mean deviation = 2 ÷ 3 = 0.667",
        "CCI = (13 − 13) ÷ (0.015 × 0.667) = 0",
      ],
      result: "One bar took the reading from +100 to 0. The price fell by 1; the average rose by 1 because a low bar left the window. Both moved the reading.",
    },
    read: [
      "The +100 and −100 lines. A reading beyond them means the typical price is further from its average than usual. Lambert read a move above +100 as the start of unusual strength; many readers now treat it the opposite way, as overbought. The same number carries both readings.",
      "The zero line. Above it, the typical price is above its average; below it, under.",
      "Divergence. The price makes a higher high while CCI makes a lower one. It is read as a move losing pace, and is clearer afterwards than at the time.",
      "Extremes. Because there are no limits, readings of ±200 or beyond occur. They show a bar far outside its recent habit, and nothing about the next one.",
    ],
    cannot: [
      "It cannot say that a reading beyond ±100 will be followed by a return. In a steady trend CCI stays beyond the line for many bars.",
      "It cannot promise how many readings fall between the lines. The constant was chosen with that in mind; the share on any chart is whatever it turns out to be, and the chart on this page counts it.",
      "It cannot be compared across lengths. A short CCI swings beyond ±100 far more often than a long one on the same prices.",
      "It cannot hold still. When an unusual bar leaves the window, the average and the mean deviation both change, and the reading can jump while the price barely moves.",
    ],
    mistakes: [
      "Treating +100 as a ceiling. There is none.",
      "Using it as both a breakout signal and an overbought signal on the same chart, and remembering whichever was right.",
      "Shortening the length until every past turn shows an extreme reading.",
      "Reading a large number as a large price move. After a quiet stretch the mean deviation is small, and a modest move gives a large reading.",
    ],
    machine: { title: "CCI under an invented price.", lead: "Change the length and watch the line calm down or swing. Move the two lines and see how many bars stay between them." },
    faq: [
      { q: "What is the 0.015 in the CCI formula?", a: "A scaling constant. Donald Lambert, who published the index in 1980, chose it so that most readings would fall between −100 and +100, which makes readings beyond those lines stand out. It changes the size of the numbers and nothing else: the shape of the line is the same with any constant." },
      { q: "Is a CCI above +100 a buy signal or a sell signal?", a: "Neither, by itself. It says the typical price is unusually far above its recent average. One tradition reads that as strength and another as overbought, and both have cases where what followed fitted and cases where it did not. The reading describes where the price is, not where it is going." },
      { q: "Is CCI only for commodities?", a: "No. The name records where it was first published. The arithmetic uses only highs, lows and closes, and it is applied to currencies, indices and shares in the same way." },
    ],
    terms: ["momentum", "overbought", "oversold", "divergence", "moving-average", "indicator"],
  },
  {
    slug: "williams-r",
    name: "Williams %R",
    family: "Momentum",
    title: "Williams %R: the formula, and how it relates to the stochastic",
    description:
      "Williams %R explained: where the close sits in the range of recent highs and lows, measured down from the top on a scale of 0 to −100. The formula step by step, what −20 and −80 mean, why it is the stochastic oscillator turned over, and what it cannot tell you. With an interactive chart of invented prices.",
    also: ["Williams percent range formula", "Williams %R 14", "%R −20 and −80", "Williams %R vs stochastic", "percent R indicator"],
    is: "Williams %R says how far the latest close is below the highest high of the last so many bars, as a share of the range between that high and the lowest low. It runs from 0, at the very top of the range, to −100, at the very bottom.",
    card: "How far the close is below the top of its recent range, from 0 down to −100.",
    facts: [
      { label: "Family", value: "Momentum" },
      { label: "Drawn", value: "Under the price" },
      { label: "Made from", value: "High, low and close" },
      { label: "Usual length", value: "14" },
      { label: "Scale", value: "0 to −100" },
      { label: "First described", value: "Larry Williams, 1970s" },
    ],
    measures: [
      "Take the highest high and the lowest low of the last 14 bars: the range the market has covered. %R measures the distance from the top of that range down to the latest close, as a percentage of the whole range, and writes it as a negative number.",
      "A reading of −10 means the close is a tenth of the way down from the highest high. A reading of −90 means it is nine tenths of the way down, near the lowest low. The scale looks upside down at first: the numbers nearest zero are the highest closes.",
      "It is the stochastic oscillator’s raw %K measured from the other end. %K counts up from the lowest low; %R counts down from the highest high, so %R is always %K minus 100. The two lines have exactly the same shape. Williams %R, credited to the trader Larry Williams, is usually shown without the smoothing that the stochastic adds.",
    ],
    steps: [
      { t: "Find the highest high and lowest low of the last N bars.", d: "N is usually 14, and the latest bar is included." },
      { t: "Measure down from the top.", d: "Distance = highest high − close." },
      { t: "Express it as a share of the range, with a minus sign.", d: "%R = −100 × (highest high − close) ÷ (highest high − lowest low)." },
    ],
    stepsNote: "Some programs show the scale as 0 to 100 without the minus sign, or plot it reversed; the line is the same. If the highest high equals the lowest low the formula divides by zero; this page shows −50 for such a bar, as it shows 50 for the stochastic.",
    worked: {
      intro: "Four bars, written high / low / close: 10 / 8 / 9, then 12 / 9 / 11, then 11 / 9 / 10, then 13 / 10 / 12. Length 3. They are the bars of the stochastic page.",
      lines: [
        "Bar 3: highest high of bars 1 to 3 = 12; lowest low = 8",
        "%R = −100 × (12 − 10) ÷ (12 − 8) = −100 × 2 ÷ 4 = −50",
        "Bar 4: highest high of bars 2 to 4 = 13; lowest low = 9",
        "%R = −100 × (13 − 12) ÷ (13 − 9) = −100 × 1 ÷ 4 = −25",
        "The stochastic page found %K = 50 and 75 for the same bars: 50 − 100 = −50, and 75 − 100 = −25",
      ],
      result: "The last bar closed a quarter of the way down from the top of its three-bar range, which is the same fact as three quarters of the way up.",
    },
    read: [
      "The −20 and −80 lines. By convention a reading above −20 is called overbought and one below −80 oversold: the close is near the top, or the bottom, of its recent range.",
      "The −50 line. Above it the close is in the upper half of the range; below it, the lower half.",
      "Failure to reach an extreme. Readers note when the price makes a new high but %R stops short of its earlier peak, a form of divergence.",
      "Together with the trend. In a steady rise the line spends most of its time near zero; its dips then get the attention, not its peaks.",
    ],
    cannot: [
      "It cannot say a turn is due. A market that closes near its high bar after bar keeps %R above −20 throughout.",
      "It cannot add anything to a stochastic oscillator on the same chart. It is the same sum, and two copies of one fact are not two pieces of evidence.",
      "It cannot tell you how big the range is. A reading of −10 in a range of 0.50 and in a range of 50 look identical.",
      "It cannot hold still. When an old high or low leaves the window the reading can jump although the price has barely changed, and without smoothing it jumps more than the stochastic does.",
    ],
    mistakes: [
      "Reading the scale the wrong way up: −90 is a low close, not a high one.",
      "Reading above −20 as ‘sell’ and below −80 as ‘buy’. In a trend that reading repeats for a long time.",
      "Counting agreement between %R and the stochastic as confirmation.",
      "Shortening the length to catch every wiggle. A short window makes the line swing from 0 to −100 on ordinary noise.",
    ],
    machine: { title: "%R under an invented price.", lead: "Change the length of the range and watch the line swing. Move the two lines and count the bars beyond them." },
    faq: [
      { q: "Why is Williams %R negative?", a: "Because it measures down from the top of the range: the distance from the highest high to the close, written with a minus sign. A close on the highest high reads 0, and a close on the lowest low reads −100. Some charting programs drop the sign, which changes the labels and not the line." },
      { q: "What is the difference between Williams %R and the stochastic oscillator?", a: "Only the end they measure from, and the smoothing. The stochastic’s raw %K is the close’s height above the lowest low as a share of the range; %R is its depth below the highest high. %R equals raw %K minus 100. The stochastic is usually smoothed and given a second line, %D; %R is usually shown raw." },
      { q: "What does a Williams %R above −20 mean?", a: "That the latest close is in the top fifth of the range between the lowest low and the highest high of the bars it looks back over. The convention is to call that overbought. It describes position in a recent range and does not mean a fall is due." },
    ],
    terms: ["stochastic-oscillator", "overbought", "oversold", "momentum", "range", "indicator"],
  },
  {
    slug: "donchian-channels",
    name: "Donchian channels",
    family: "Levels",
    title: "Donchian channels: the highest high and the lowest low",
    description:
      "Donchian channels explained: a line at the highest high of the last so many bars, a line at the lowest low and a line halfway between. How they are calculated, what the width shows, how breakouts are read from them and what they cannot tell you. With an interactive chart of invented prices.",
    also: ["Donchian channel formula", "Donchian 20", "price channel", "highest high lowest low", "channel breakout"],
    is: "A Donchian channel is two lines: one at the highest high of the last so many bars and one at the lowest low. A third line runs halfway between them. Nothing is averaged or smoothed, so each line is a price that actually traded.",
    card: "A line at the highest high of recent bars and a line at the lowest low. Nothing averaged.",
    facts: [
      { label: "Family", value: "Levels" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Highs and lows" },
      { label: "Usual length", value: "20" },
      { label: "Unit", value: "Price" },
      { label: "Named after", value: "Richard Donchian" },
    ],
    measures: [
      "The channel records the extremes of a window of bars: how high the price went and how low. Its width is the whole range the market covered in that time.",
      "The lines move in steps. The upper line rises when a bar makes a new high for the window, and it falls only when the bar that set it leaves the window. Between those events it is flat, which gives the channel its staircase look.",
      "It is named after Richard Donchian, a twentieth-century futures trader associated with rule-based trend following. A rule built on it, buying a new 20-bar high and selling a new 20-bar low, is among the oldest written trading rules, and was part of the method taught to the group of traders known as the Turtles in the 1980s.",
    ],
    steps: [
      { t: "Choose a length, N.", d: "The number of bars the channel looks back over. N is usually 20." },
      { t: "Upper line: the highest high of the last N bars.", d: "On this page the latest bar is included, so a bar can never be above the line: at most it sets it." },
      { t: "Lower line: the lowest low of the last N bars.", d: "The same window, the other extreme." },
      { t: "Middle line: halfway between.", d: "Middle = (upper + lower) ÷ 2. It is not an average of prices; it is the midpoint of two of them." },
    ],
    stepsNote: "Programs differ on whether the latest bar is in the window. A breakout rule needs yesterday’s channel, made from the N bars before the latest one, so that today’s price can be compared with it. With the latest bar included, as here, a new extreme shows as the bar setting the line.",
    worked: {
      intro: "Four bars, written high / low: 10 / 8, then 12 / 9, then 11 / 9, then 13 / 10. Length 3.",
      lines: [
        "Bar 3: the highs of bars 1 to 3 are 10, 12, 11, so upper = 12",
        "The lows are 8, 9, 9, so lower = 8; middle = (12 + 8) ÷ 2 = 10; width = 4",
        "Bar 4: the highs of bars 2 to 4 are 12, 11, 13, so upper = 13: bar 4 set it",
        "The lows are 9, 9, 10, so lower = 9; middle = (13 + 9) ÷ 2 = 11; width = 4",
      ],
      result: "The lower line rose from 8 to 9 although no bar did anything at 9 on bar 4. The bar with the low of 8 left the window. Half of what moves a Donchian line is old bars dropping out.",
    },
    read: [
      "A bar that sets a line. A new high for the window is called a breakout upward; a new low, a breakout downward. It reports that the price is at its highest, or lowest, for N bars.",
      "The width. A wide channel means the price has covered a lot of ground; a narrow one, that it has been confined.",
      "The middle line. The price above it is in the upper half of its recent range.",
      "As trailing levels. The lower line is used under a rising price as a level that only rises while new lows are not made, and the upper line the other way.",
    ],
    cannot: [
      "It cannot say that a breakout will continue. Every sideways market ends with a new high or a new low, and so does every false start.",
      "It cannot react smoothly. One extreme bar sets a line for the next N bars, and the line jumps on the day that bar leaves, whatever the price is doing.",
      "It cannot see closes. It is made from highs and lows, so one brief spike defines the channel as much as a bar that closed there.",
      "It cannot tell you which length is right. Twenty bars is a convention.",
    ],
    mistakes: [
      "Treating a new high as proof of a trend. It is the definition of a new high and nothing more.",
      "Comparing a bar with a channel that already contains it, and wondering why the price never breaks out.",
      "Reading the flat stretches as support or resistance that the market is respecting. A line is flat because nothing has exceeded it yet.",
      "Ignoring the cost of a rule that buys every new high. In a range such a rule buys near the top and sells near the bottom, repeatedly.",
    ],
    machine: { title: "A channel around an invented price.", lead: "Change the length and watch the staircase widen and narrow. The sentence under the chart counts how many bars set a line." },
    faq: [
      { q: "How is a Donchian channel different from Bollinger Bands?", a: "Bollinger Bands are a moving average with lines a set number of standard deviations either side: every part is a calculation on closes. A Donchian channel is simply the highest high and the lowest low of the window: two prices that traded. The Donchian lines move in steps; the Bollinger lines move smoothly." },
      { q: "Does a break of the Donchian channel mean a trend has started?", a: "It means the price has made its highest high, or lowest low, for the length of the window. Trends begin that way, and so do many moves that fail within a few bars. The channel cannot tell the two apart at the time." },
      { q: "What length should a Donchian channel have?", a: "There is no right length. Twenty bars is the usual default, and longer windows such as 55 are also well known. A short channel is set by small swings and is broken often; a long one is broken rarely and late." },
    ],
    terms: ["breakout", "range", "support", "resistance", "trend", "trailing-stop"],
  },
  {
    slug: "keltner-channels",
    name: "Keltner channels",
    family: "Volatility",
    title: "Keltner channels: an average with ATR either side",
    description:
      "Keltner channels explained: an exponential moving average with a line a multiple of the average true range above and below it. How they are calculated step by step, what 20, 10 and 2 mean, how they differ from Bollinger Bands and what they cannot tell you. With an interactive chart of invented prices.",
    also: ["Keltner channel formula", "Keltner 20 2", "ATR bands", "Keltner vs Bollinger", "EMA and ATR channel"],
    is: "A Keltner channel is an exponential moving average of the close with a line above it and a line below it. The lines stand a set multiple of the average true range from the average, so the channel is wide when bars have been long and narrow when they have been short.",
    card: "An exponential average with a band either side, set by the average true range.",
    facts: [
      { label: "Family", value: "Volatility" },
      { label: "Drawn", value: "On the price" },
      { label: "Made from", value: "Close, high and low" },
      { label: "Usual settings", value: "EMA 20, ATR 10, 2 × ATR" },
      { label: "Unit", value: "Price" },
      { label: "First described", value: "Chester Keltner, 1960" },
    ],
    measures: [
      "The channel puts two measurements on one chart: where the average close has been (the middle line) and how far the price has been travelling per bar (the distance to the outer lines).",
      "That distance is the average true range, which counts each bar’s full extent and any gap from the previous close. A Keltner channel therefore widens when bars get longer, whether or not the closes have scattered, and it widens and narrows more gradually than a band built on the standard deviation.",
      "Chester Keltner described the first version in 1960, with a simple average of the typical price and a band set by the average high-to-low range. The version in common use now, with an exponential average of the close and the average true range, is credited to Linda Bradford Raschke in the 1980s. This page follows the modern one.",
    ],
    steps: [
      { t: "Middle line: an exponential moving average of the close.", d: "EMA = close × k + previous EMA × (1 − k), with k = 2 ÷ (N + 1). N is usually 20." },
      { t: "Work out the average true range.", d: "The true range of each bar, smoothed as on the ATR page. Its length is often 10, sometimes the same as the average’s." },
      { t: "Upper line = middle + M × ATR.", d: "M is usually 2." },
      { t: "Lower line = middle − M × ATR.", d: "The lines are always the same distance above and below the middle." },
    ],
    stepsNote: "There is less agreement about the settings than for most indicators: programs differ in the length of the ATR, the multiple (1.5 and 2 are both common) and whether the ATR is smoothed Wilder’s way or with a plain or exponential average. Two charts both labelled Keltner can show different channels.",
    worked: {
      intro: "The five bars of the ATR page, written high / low / close: 10 / 8 / 9, then 11 / 9 / 10, then 13 / 10 / 12, then 12 / 11 / 11, then 15 / 14 / 14. Average 3, ATR 3, width 2.",
      lines: [
        "EMA (k = 2 ÷ 4 = 0.5) starts at bar 3 from (9 + 10 + 12) ÷ 3 = 10.33",
        "EMA at bar 4 = 11 × 0.5 + 10.33 × 0.5 = 10.67; at bar 5 = 14 × 0.5 + 10.67 × 0.5 = 12.33",
        "ATR, from the ATR page: 2.33 at bar 3, 1.89 at bar 4, 2.59 at bar 5",
        "Upper line at bar 5 = 12.33 + 2 × 2.59 = 17.52",
        "Lower line at bar 5 = 12.33 − 2 × 2.59 = 7.15",
      ],
      result: "The last bar is only 1 from high to low, but it opened far above the previous close. The gap lifted the ATR, and so the channel is wider at bar 5 than at bar 4 although the bar itself is small.",
    },
    read: [
      "The width. A widening channel means bars have been getting longer or gaps have appeared; a narrowing one means the market is settling.",
      "A close beyond a line. It is far from its recent average, measured against how far the price usually travels in a bar. In a strong trend closes can stay beyond a line for many bars.",
      "The slope of the middle line. It is an exponential average and is read like one.",
      "Beside Bollinger Bands. Some readers watch for the Bollinger Bands to move inside the Keltner channel as a mark of an unusually quiet market. It says the market has been quiet, not what comes next.",
    ],
    cannot: [
      "It cannot say that a price at the upper line will come back. The line is a measurement, not a wall.",
      "It cannot say what share of closes will stay inside. That depends on the multiple, the lengths and the prices; the chart on this page counts it for you.",
      "It cannot tell you direction from its width. ATR is built from distances, and a market often moves fastest when it falls.",
      "It cannot be compared with another chart’s Keltner channel unless the settings and the kind of ATR are the same.",
    ],
    mistakes: [
      "Selling because the price touched the upper line, or buying because it touched the lower. Trends are made of such closes.",
      "Treating the lines as fixed levels. They move with every bar.",
      "Assuming it agrees with Bollinger Bands. One is set by how scattered the closes are, the other by how long the bars are, and they can disagree.",
      "Adjusting the multiple until every past turn touches a line.",
    ],
    machine: { title: "A channel of ATR around an invented price.", lead: "Change the average, the length of the ATR and the width, and watch how many closes fall outside. The count is in the sentence under the chart." },
    faq: [
      { q: "What is the difference between Keltner channels and Bollinger Bands?", a: "The middle line and the measure of width. Bollinger Bands use a simple average and the standard deviation of the closes, so they react sharply when closes scatter. Keltner channels use an exponential average and the average true range, which follows the length of the bars and changes more gradually. The two often look alike and sometimes do not." },
      { q: "What settings do Keltner channels use?", a: "Commonly a 20-bar exponential moving average, a 10-bar or 20-bar average true range, and lines 2 ATRs either side. These are conventions, and charting programs differ more here than for most indicators, so it is worth checking what a given chart is using." },
      { q: "Does a close outside a Keltner channel mean a reversal?", a: "Not reliably. It means the close is unusually far from its recent average compared with the usual size of a bar. Sometimes the price returns towards the average; in a strong trend it can stay outside for many bars." },
    ],
    terms: ["atr", "ema", "volatility", "bollinger-bands", "breakout", "indicator"],
  },
];

export const getLesson = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug);

/** What every page in the school says, in one place. */
export const PLAIN_TRUTH = "An indicator is arithmetic on prices that have already happened. It describes what a price did; it does not predict what a price will do. The chart on this page is invented: a seeded random walk, not a market.";
