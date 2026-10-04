/**
 * THE CHART PATTERN LIBRARY — the classic chart shapes, one page each.
 *
 * A sibling of the Playbook, for shapes that take many candles to form. A page
 * says what the shape is, how to recognise it, what it is taken to mean, how
 * textbooks measure it, what a careful trader looks at and where people go
 * wrong. It does not say what to do: no entry, no stop, no target. A pattern
 * is a description of what a price did, not a forecast; textbook shapes are
 * rare and real charts are ambiguous; and each page says so.
 *
 * `path` is the picture: an invented price line, 51 values on a scale of 0 to
 * 100, evenly spaced from x = 0 to x = 100, oldest first. It is built from a
 * few hand-placed turning points with a small fixed wobble between them, so it
 * is the same on every visit. `lines` are the outline (neckline, trend lines,
 * the flagpole, the conventional measure) and `tags` the labelled points, all
 * in the same 0 to 100 coordinates. Nothing here is market data.
 */
export type Pt = readonly [x: number, y: number];
export type OutlineKind = "neckline" | "trend" | "level" | "pole" | "measure" | "curve";
export type Outline = { kind: OutlineKind; pts: readonly Pt[] };
export type Tag = { at: Pt; text: string; side: "above" | "below" };
export type PatternGroup = "reversal" | "continuation" | "either";

export type ChartPattern = {
  slug: string;
  group: PatternGroup;
  name: string;
  /** the page's heading and title: the phrase people search for */
  title: string;
  description: string;
  also: readonly string[];
  path: readonly number[];
  lines: readonly Outline[];
  tags: readonly Tag[];
  /** the picture in words, as a clause: “three peaks after a rise, …” */
  shape: string;
  /** what the outline adds, as a clause: “a neckline under the two dips” */
  outlined: string;
  is: string;
  see: readonly string[];
  said: string;
  /** how textbooks measure it: a convention, described, never a prediction */
  measure: string;
  check: readonly string[];
  traps: readonly string[];
  terms: readonly string[];
  faq: readonly { q: string; a: string }[];
};

/* ------------------------------------------------------------------------- *
 * Making the invented price lines
 * ------------------------------------------------------------------------- */

/** how many values a path has; they sit at x = 0, 2, 4 … 100 */
export const PATH_POINTS = 51;

/** a small fixed generator, so the wobble is the same on the server, in the browser and tomorrow */
function fixed(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turning points (x even, 0 to 100) joined by straight runs, with a small wobble between them. The turning points themselves are kept exact. */
function trace(pivots: readonly Pt[], seed: number, wobble = 1.3): number[] {
  const r = fixed(seed);
  const out: number[] = [];
  let k = 0;
  for (let i = 0; i < PATH_POINTS; i++) {
    const x = i * 2;
    while (k < pivots.length - 2 && pivots[k + 1][0] <= x) k++;
    const [xa, ya] = pivots[k];
    const [xb, yb] = pivots[k + 1];
    const exact = x === xa || x === xb;
    const y = ya + ((yb - ya) * (x - xa)) / (xb - xa) + (exact ? 0 : (r() - 0.5) * 2 * wobble);
    out.push(Math.round(y * 10) / 10);
  }
  return out;
}

/** points along a bowl: `top` at both ends, `bottom` in the middle */
function bowl(x0: number, x1: number, top: number, bottom: number, step = 4): Pt[] {
  const mid = (x0 + x1) / 2;
  const half = (x1 - x0) / 2;
  const out: Pt[] = [];
  for (let x = x0; x <= x1; x += step) out.push([x, Math.round((bottom + (top - bottom) * ((x - mid) / half) ** 2) * 10) / 10]);
  return out;
}

/** the same shape turned upside down */
const turn = (pts: readonly Pt[]): Pt[] => pts.map(([x, y]) => [x, 100 - y]);
const turnLines = (lines: readonly Outline[]): Outline[] => lines.map((l) => ({ kind: l.kind, pts: turn(l.pts) }));

/* the turning points of each shape, written once so that a shape and its mirror share them */

const HS: Pt[] = [[0, 18], [14, 40], [18, 36], [28, 62], [36, 46], [48, 80], [60, 48], [70, 64], [78, 46], [84, 40], [88, 48], [100, 22]];
const HS_LINES: Outline[] = [
  { kind: "neckline", pts: [[24, 45], [94, 50.8]] },
  { kind: "measure", pts: [[48, 47], [48, 80]] },
];

const DT: Pt[] = [[0, 20], [12, 38], [16, 34], [30, 74], [42, 52], [56, 75], [68, 53], [72, 46], [78, 51], [100, 26]];
const DT_LINES: Outline[] = [
  { kind: "level", pts: [[24, 76], [62, 76]] },
  { kind: "neckline", pts: [[34, 52], [86, 52]] },
];

const AT: Pt[] = [[0, 20], [16, 70], [26, 42], [36, 70], [46, 51], [56, 70], [64, 59], [72, 70], [78, 65.4], [84, 76], [90, 71], [100, 88]];
const AT_LINES: Outline[] = [
  { kind: "level", pts: [[12, 70], [88, 70]] },
  { kind: "trend", pts: [[22, 40.2], [86, 69]] },
];

const BF: Pt[] = [[0, 14], [8, 18], [24, 62], [30, 52], [36, 58], [42, 48], [48, 54], [54, 44], [62, 60], [66, 57], [100, 90]];
const BF_LINES: Outline[] = [
  { kind: "pole", pts: [[8, 18], [24, 62]] },
  { kind: "trend", pts: [[22, 62.7], [60, 50]] },
  { kind: "trend", pts: [[26, 53.3], [60, 42]] },
];

const RW: Pt[] = [[0, 14], [10, 24], [22, 62], [30, 48], [42, 69], [50, 60], [62, 76], [70, 72], [78, 81.6], [84, 73], [88, 77], [100, 52]];
const RW_LINES: Outline[] = [
  { kind: "trend", pts: [[18, 60.6], [86, 84.4]] },
  { kind: "trend", pts: [[26, 45.6], [86, 81.6]] },
];

const NOT_A_FORECAST =
  "No. It describes what a price did while the shape formed. Published studies of chart patterns disagree about whether they tell anything about the next move, and the tidy examples in textbooks were chosen afterwards, when the outcome was known. It is one observation to weigh with others.";
const HOW_OFTEN =
  "A clean one is rare. Most real charts offer something that might be the shape if a line is tilted or a point is ignored, and two people looking at the same chart often draw it differently.";

export const CHART_PATTERNS: readonly ChartPattern[] = [
  {
    slug: "head-and-shoulders-pattern",
    group: "reversal",
    name: "Head and shoulders",
    title: "Head and shoulders pattern: what it is and how to read it",
    description: "The head and shoulders chart pattern explained: three peaks after a rise, the middle one the highest, and a neckline beneath them. How to recognise it, what it is taken to mean, how textbooks measure it and where people go wrong.",
    also: ["head and shoulders top", "head and shoulders chart pattern", "neckline", "H&S pattern"],
    path: trace(HS, 101),
    lines: HS_LINES,
    tags: [
      { at: [28, 62], text: "left shoulder", side: "above" },
      { at: [48, 80], text: "head", side: "above" },
      { at: [70, 64], text: "right shoulder", side: "above" },
      { at: [90, 51], text: "neckline", side: "above" },
    ],
    shape: "three peaks after a rise, the middle one the highest, and then a fall",
    outlined: "a neckline under the two dips between the peaks and the height of the head above it",
    is: "A head and shoulders is three peaks in a row after a rise. The middle peak, the head, is the highest. The peaks either side of it, the shoulders, are lower and roughly level with each other. A line drawn under the two dips between them is called the neckline.",
    see: [
      "A rise comes first. Without one there is nothing for the shape to reverse.",
      "Three peaks: a lower one, a higher one, a lower one again.",
      "Two dips between them, at roughly the same height. The line through them is the neckline, and it is often tilted.",
      "The shape is only complete, in the textbook sense, when the price closes below the neckline.",
    ],
    said: "It is read as a rise running out of buyers. The head makes a new high, but the right shoulder fails to reach it, so the sequence of higher highs has stopped. A close below the neckline then breaks the sequence of higher lows as well. Traders treat that as a possible change from an up-trend to a down-trend, not as proof of one.",
    measure: "The textbook measure is the height of the head above the neckline, taken straight down from the point where the neckline broke. It is a convention for describing the size of the shape. It is not a prediction, and prices fall short of it and pass it without regard for the drawing.",
    check: [
      "Whether there was a real rise before it. Three bumps in a sideways market are not this pattern.",
      "Whether the price has closed below the neckline, or only touched it.",
      "The time frame. A shape that took months to form on a daily chart carries more history than one drawn across an afternoon.",
      "What happens if the price returns to the neckline from below, which it often does.",
    ],
    traps: [
      "Naming it before the right shoulder has finished. Until the neckline breaks it is three peaks and nothing more.",
      "Tilting or moving the neckline until the shape fits.",
      "Treating the textbook measure as a destination.",
      "Forgetting that a failed head and shoulders, where the price climbs back above the right shoulder, is common.",
    ],
    terms: ["trend", "support", "resistance", "breakout", "trend-line", "pullback"],
    faq: [
      { q: "Is a head and shoulders pattern bearish?", a: "It is classed as a bearish reversal shape, because it is drawn at the end of a rise and is completed by a fall through the neckline. The class describes the drawing. It does not say what the price will do next." },
      { q: "Does the neckline have to be horizontal?", a: "No. It is the line through the two dips, so it slopes whichever way they do. Many textbook examples have a tilted neckline." },
      { q: "Does a head and shoulders predict a fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "inverse-head-and-shoulders-pattern",
    group: "reversal",
    name: "Inverse head and shoulders",
    title: "Inverse head and shoulders pattern: meaning and how to recognise it",
    description: "The inverse head and shoulders chart pattern explained: three troughs after a fall, the middle one the deepest, and a neckline above them. How to recognise it, what it is taken to mean and the common mistakes.",
    also: ["head and shoulders bottom", "reverse head and shoulders", "inverted head and shoulders", "neckline"],
    path: trace(turn(HS), 102),
    lines: turnLines(HS_LINES),
    tags: [
      { at: [28, 38], text: "left shoulder", side: "below" },
      { at: [48, 20], text: "head", side: "below" },
      { at: [70, 36], text: "right shoulder", side: "below" },
      { at: [90, 49], text: "neckline", side: "below" },
    ],
    shape: "three troughs after a fall, the middle one the deepest, and then a rise",
    outlined: "a neckline over the two bounces between the troughs and the depth of the head below it",
    is: "An inverse head and shoulders is the head and shoulders turned upside down. After a fall the price makes three troughs. The middle one, the head, is the lowest. The two either side, the shoulders, are shallower and roughly level. The neckline is drawn over the two bounces between them.",
    see: [
      "A fall comes first.",
      "Three troughs: a shallower one, a deeper one, a shallower one again.",
      "Two bounces between them that stop at about the same height. The line through their tops is the neckline.",
      "In the textbook sense it is complete only when the price closes above the neckline.",
    ],
    said: "It is read as a fall running out of sellers. The head makes a new low, but the right shoulder does not reach it, so the lower lows have stopped. A close above the neckline then ends the run of lower highs. Traders take that as a possible change from a down-trend to an up-trend.",
    measure: "The textbook measure is the depth of the head below the neckline, taken straight up from the point where the neckline broke. It is a way of describing how large the shape is. It is a convention and not a prediction.",
    check: [
      "Whether a real fall came before it.",
      "Whether the price has closed above the neckline or merely reached it.",
      "How long the shape took to form compared with the fall before it.",
      "What the price does if it comes back down to the neckline.",
    ],
    traps: [
      "Calling the bottom while the right shoulder is still forming.",
      "Seeing the shape in every three dips of a quiet range.",
      "Treating the textbook measure as a promise.",
      "Ignoring a larger down-trend on a longer time frame.",
    ],
    terms: ["trend", "support", "resistance", "breakout", "trend-line"],
    faq: [
      { q: "Is an inverse head and shoulders bullish?", a: "It is classed as a bullish reversal shape: it is drawn at the end of a fall and completed by a rise through the neckline. That is a description of the drawing, not a statement about the future." },
      { q: "How is it different from a head and shoulders?", a: "Only in direction. The ordinary shape has three peaks after a rise; the inverse has three troughs after a fall. Everything else is the mirror image." },
      { q: "Does it predict a rise?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "double-top-pattern",
    group: "reversal",
    name: "Double top",
    title: "Double top pattern: what it is, how to spot it and what to check",
    description: "The double top chart pattern explained: two peaks at about the same price after a rise, with a dip between them. How to recognise a double top, what it is taken to mean, how textbooks measure it and where people go wrong.",
    also: ["double top chart pattern", "M pattern", "double top reversal", "twin peaks"],
    path: trace(DT, 103),
    lines: DT_LINES,
    tags: [
      { at: [30, 76], text: "first top", side: "above" },
      { at: [56, 76], text: "second top", side: "above" },
      { at: [82, 52], text: "neckline", side: "above" },
    ],
    shape: "two peaks at about the same height after a rise, a dip between them, and then a fall",
    outlined: "a level across the two tops and a neckline at the low of the dip",
    is: "A double top is two peaks at about the same price, with a dip between them, after a rise. On the chart it looks like the letter M. The low of the dip is the neckline, and the shape is complete in the textbook sense when the price closes below it.",
    see: [
      "A rise comes first.",
      "Two peaks at roughly the same price. They need not match exactly.",
      "A clear dip between them, not a small pause.",
      "A close below the low of that dip. Before it, the price is simply in a range.",
    ],
    said: "It is read as a price that twice failed to get past the same level. Buyers who were willing at the first top were not willing to pay more at the second. A fall through the dip between them is taken as a sign that the rise may have ended.",
    measure: "The textbook measure is the height from the neckline to the tops, taken down from the neckline. It describes the size of the shape. It is a convention and not a prediction.",
    check: [
      "How far apart the two tops are. Tops a few candles apart are a pause; the textbook shape has a real dip and some time between them.",
      "Whether the neckline has broken on a close.",
      "Whether the larger trend, on a longer time frame, is still up.",
    ],
    traps: [
      "Calling a double top at the second peak, before the neckline has broken. Many such charts go on to a third touch or straight through.",
      "Insisting the two tops be exactly equal, or accepting two that are plainly not.",
      "Forgetting that in a strong up-trend a second touch of a high is ordinary.",
    ],
    terms: ["resistance", "support", "trend", "breakout", "range"],
    faq: [
      { q: "Is a double top bullish or bearish?", a: "It is classed as a bearish reversal shape, because it is drawn after a rise and completed by a fall through the neckline. The class describes the drawing." },
      { q: "How common is a clean double top?", a: HOW_OFTEN },
      { q: "Does a double top mean the price will fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "double-bottom-pattern",
    group: "reversal",
    name: "Double bottom",
    title: "Double bottom pattern: meaning, shape and what to check",
    description: "The double bottom chart pattern explained: two troughs at about the same price after a fall, with a bounce between them. How to recognise a double bottom, what it is taken to mean and the common mistakes.",
    also: ["double bottom chart pattern", "W pattern", "double bottom reversal"],
    path: trace(turn(DT), 104),
    lines: turnLines(DT_LINES),
    tags: [
      { at: [30, 24], text: "first bottom", side: "below" },
      { at: [56, 24], text: "second bottom", side: "below" },
      { at: [82, 48], text: "neckline", side: "below" },
    ],
    shape: "two troughs at about the same depth after a fall, a bounce between them, and then a rise",
    outlined: "a level across the two bottoms and a neckline at the high of the bounce",
    is: "A double bottom is two troughs at about the same price, with a bounce between them, after a fall. It looks like the letter W. The high of the bounce is the neckline, and the shape is complete in the textbook sense when the price closes above it.",
    see: [
      "A fall comes first.",
      "Two troughs at roughly the same price.",
      "A clear bounce between them.",
      "A close above the high of that bounce.",
    ],
    said: "It is read as a price that twice failed to fall through the same level. Sellers who pushed it there the first time could not push it lower the second. A rise through the bounce between the two is taken as a sign that the fall may have ended.",
    measure: "The textbook measure is the height from the bottoms to the neckline, taken up from the neckline. It is a convention for describing the size of the shape, not a prediction.",
    check: [
      "The time between the two bottoms, and the size of the bounce.",
      "Whether the neckline has broken on a close.",
      "Whether the larger trend on a longer time frame is still down.",
    ],
    traps: [
      "Calling the bottom at the second trough. A level that held twice can give way the third time.",
      "Counting a small wobble in a falling market as a W.",
      "Treating the textbook measure as a target.",
    ],
    terms: ["support", "resistance", "trend", "breakout", "range"],
    faq: [
      { q: "Is a double bottom bullish?", a: "It is classed as a bullish reversal shape: drawn after a fall, completed by a rise through the neckline. That describes the drawing and nothing more." },
      { q: "Do the two bottoms have to be at the same price?", a: "Roughly. Textbooks allow the second to be a little above or below the first. How much is “a little” is a judgement, which is one reason two people read the same chart differently." },
      { q: "Does a double bottom predict a rise?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "triple-top-pattern",
    group: "reversal",
    name: "Triple top",
    title: "Triple top pattern: what it is and how to read it",
    description: "The triple top chart pattern explained: three peaks at about the same price after a rise. How to recognise a triple top, how it differs from a double top and a head and shoulders, and where people go wrong.",
    also: ["triple top chart pattern", "triple top reversal", "three peaks", "triple bottom"],
    path: trace([[0, 22], [10, 40], [20, 72], [30, 52], [40, 73], [50, 51], [60, 72], [70, 52], [74, 46], [80, 51], [100, 26]], 105),
    lines: [
      { kind: "level", pts: [[14, 74], [66, 74]] },
      { kind: "neckline", pts: [[24, 51.5], [88, 51.5]] },
    ],
    tags: [
      { at: [20, 74], text: "first", side: "above" },
      { at: [40, 74], text: "second", side: "above" },
      { at: [60, 74], text: "third", side: "above" },
      { at: [84, 51.5], text: "support", side: "above" },
    ],
    shape: "three peaks at about the same height after a rise, two dips between them, and then a fall",
    outlined: "a level across the three tops and a support line under the two dips",
    is: "A triple top is three peaks at about the same price after a rise, separated by two dips. The lows of the dips form a support line, and the shape is complete in the textbook sense when the price closes below it. Its mirror image, three troughs after a fall, is the triple bottom.",
    see: [
      "A rise comes first.",
      "Three peaks at roughly the same price, none clearly higher than the others.",
      "Two dips between them that stop at about the same level.",
      "A close below that level.",
    ],
    said: "It is read as three failed attempts at the same level. Each time the price reached it, sellers were there. When the support under the dips then gives way, traders take it as a sign that the rise may have ended.",
    measure: "The textbook measure is the height from the support line to the tops, taken down from the support line. It is a convention for the size of the shape and not a prediction.",
    check: [
      "Whether the three peaks are level. If the middle one stands clearly higher, textbooks call the shape a head and shoulders instead.",
      "Whether support has broken on a close.",
      "Whether the same picture is simply a trading range, which may break either way.",
    ],
    traps: [
      "Deciding it is a triple top before support has broken. Until then it is a rectangle.",
      "Assuming a level is stronger for having held three times. It has also been tested three times.",
      "Treating the textbook measure as a destination.",
    ],
    terms: ["resistance", "support", "range", "breakout", "trend"],
    faq: [
      { q: "What is the difference between a triple top and a head and shoulders?", a: "In a triple top the three peaks are about level. In a head and shoulders the middle peak is clearly the highest. On a real chart the difference is often a matter of opinion." },
      { q: "Is a triple top more reliable than a double top?", a: "Some textbooks say so. The claim is hard to test, because clean examples are few and are picked out afterwards. It is safer to treat both as descriptions of where a price turned." },
      { q: "Does a triple top predict a fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "rounding-bottom-pattern",
    group: "reversal",
    name: "Rounding bottom",
    title: "Rounding bottom pattern: the saucer, and how it is read",
    description: "The rounding bottom chart pattern explained: a slow, bowl-shaped turn from a fall to a rise. How to recognise a rounding bottom or saucer, what it is taken to mean and why it is hard to see while it forms.",
    also: ["saucer bottom", "rounded bottom", "bowl pattern", "rounding bottom chart pattern"],
    path: trace([[0, 78], [8, 70], ...bowl(12, 84, 68, 28).slice(0, -1), [84, 68], [88, 72], [92, 70], [100, 84]], 106, 1.6),
    lines: [
      { kind: "curve", pts: bowl(12, 84, 62, 22) },
      { kind: "level", pts: [[6, 70], [94, 70]] },
    ],
    tags: [
      { at: [48, 22], text: "the bowl", side: "below" },
      { at: [80, 70], text: "rim", side: "above" },
    ],
    shape: "a slow fall that flattens, turns and becomes a slow rise, like a bowl",
    outlined: "a curve under the bowl and a level across its rim",
    is: "A rounding bottom is a slow turn. A fall loses speed, the price moves sideways for a while, and then it begins to rise at about the pace it fell. There is no sharp low: the bottom is a curve, like a saucer or a bowl. The level where the fall began is the rim.",
    see: [
      "A fall that slows instead of ending in a spike.",
      "A flat stretch at the bottom, with small candles.",
      "A rise on the other side that roughly mirrors the fall.",
      "It takes a long time. Textbook examples are drawn on daily or weekly charts and run for months.",
    ],
    said: "It is read as a gradual change of mood. Sellers tire slowly, nobody is in a hurry at the bottom, and buyers return by degrees. A close above the rim is taken as the completion of the turn.",
    measure: "The textbook measure is the depth of the bowl, from its lowest point to the rim, taken up from the rim. It describes the size of the shape. It is a convention, not a prediction.",
    check: [
      "The time frame. A curve across twenty one-minute candles is not what the textbooks describe.",
      "Whether the right side has actually reached the rim.",
      "Whether the curve is in the price or only in the line someone drew under it.",
    ],
    traps: [
      "Seeing the bowl when only its left half exists. A fall that slows may simply resume.",
      "Drawing a smooth curve under a jagged chart and believing the curve.",
      "Expecting the right side to mirror the left exactly.",
    ],
    terms: ["trend", "support", "resistance", "breakout", "time-frame"],
    faq: [
      { q: "Is a rounding bottom the same as a cup and handle?", a: "The cup is a rounding bottom. A cup and handle adds a small pullback, the handle, before the price passes the rim, and is usually described as forming within a larger rise." },
      { q: "How long does a rounding bottom take?", a: "There is no rule. Textbooks describe it as one of the slowest shapes, lasting weeks to months on daily charts." },
      { q: "Does a rounding bottom predict a rise?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "bull-flag-pattern",
    group: "continuation",
    name: "Bull flag",
    title: "Bull flag pattern: what it is and how to recognise it",
    description: "The bull flag chart pattern explained: a sharp rise, the flagpole, followed by a short, shallow drift down between two parallel lines. How to recognise a bull flag, what it is taken to mean and where people go wrong.",
    also: ["bullish flag", "flag and pole", "flag chart pattern", "high tight flag"],
    path: trace(BF, 107),
    lines: BF_LINES,
    tags: [
      { at: [23, 34], text: "flagpole", side: "below" },
      { at: [44, 60], text: "flag", side: "above" },
    ],
    shape: "a sharp rise, then a short drift down in a narrow channel, then a further rise",
    outlined: "the flagpole along the first rise and two parallel lines round the drift",
    is: "A bull flag is a sharp rise followed by a short, shallow drift downward. The rise is the flagpole. The drift, held between two roughly parallel lines that slope gently against the rise, is the flag. The shape is complete in the textbook sense when the price closes above the upper line.",
    see: [
      "A steep rise first: the pole. Without it there is no flag.",
      "A small, orderly drift down or sideways, between two parallel lines.",
      "The flag is short compared with the pole, in both time and height.",
      "A close above the upper line of the flag.",
    ],
    said: "It is read as a pause, not a turn. After a fast rise some holders take profit and the price eases, but nobody is selling hard. If the price then leaves the flag upward, traders take it as the earlier rise carrying on.",
    measure: "The textbook measure is the length of the flagpole, set off from the point where the price left the flag. It is a convention for describing the shape, and it is not a prediction: plenty of flags are followed by much less, or by a fall.",
    check: [
      "How deep the flag is. A drift that gives back most of the pole is no longer a pause.",
      "How long it lasts. A flag that goes on and on has become a range.",
      "Whether the price has closed outside the flag, and on which side.",
    ],
    traps: [
      "Drawing a flag on any pullback, whether or not a sharp move came first.",
      "Assuming the direction. A flag can break downward, and then it was not a continuation at all.",
      "Treating the flagpole measure as a target.",
    ],
    terms: ["trend", "pullback", "breakout", "consolidation", "retracement", "trend-line"],
    faq: [
      { q: "What is the difference between a flag and a pennant?", a: "Both follow a sharp move. A flag is bounded by two parallel lines, so it looks like a small sloping rectangle. A pennant is bounded by two converging lines, so it looks like a small triangle." },
      { q: "How long does a bull flag last?", a: "Textbooks describe it as brief: a handful of candles to a few weeks on a daily chart. There is no fixed number." },
      { q: "Is a bull flag a buy signal?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "bear-flag-pattern",
    group: "continuation",
    name: "Bear flag",
    title: "Bear flag pattern: meaning, shape and what to check",
    description: "The bear flag chart pattern explained: a sharp fall, the flagpole, followed by a short, shallow drift up between two parallel lines. How to recognise a bear flag, what it is taken to mean and the common mistakes.",
    also: ["bearish flag", "flag and pole", "bear flag chart pattern"],
    path: trace(turn(BF), 108),
    lines: turnLines(BF_LINES),
    tags: [
      { at: [23, 66], text: "flagpole", side: "above" },
      { at: [44, 40], text: "flag", side: "below" },
    ],
    shape: "a sharp fall, then a short drift up in a narrow channel, then a further fall",
    outlined: "the flagpole along the first fall and two parallel lines round the drift",
    is: "A bear flag is the bull flag turned over: a sharp fall, the flagpole, followed by a short, shallow drift upward between two roughly parallel lines. The shape is complete in the textbook sense when the price closes below the lower line.",
    see: [
      "A steep fall first: the pole.",
      "A small, orderly drift up or sideways between two parallel lines.",
      "The flag is short compared with the pole.",
      "A close below the lower line of the flag.",
    ],
    said: "It is read as a pause in a fall. After a fast drop some sellers close and the price lifts a little, without much buying behind it. If it then leaves the flag downward, traders take it as the earlier fall carrying on.",
    measure: "The textbook measure is the length of the flagpole, set off downward from the point where the price left the flag. It is a convention and not a prediction.",
    check: [
      "How much of the pole the flag has given back.",
      "Whether the drift is orderly or has turned into a sharp recovery.",
      "Which side of the flag the price has closed outside.",
    ],
    traps: [
      "Calling every bounce in a falling market a bear flag.",
      "Assuming it must break downward. Some bounces are the start of a recovery.",
      "Treating the flagpole measure as a target.",
    ],
    terms: ["trend", "pullback", "breakout", "consolidation", "retracement", "trend-line"],
    faq: [
      { q: "Is a bear flag the opposite of a bull flag?", a: "Yes, it is the mirror image. A bull flag is a sharp rise and a small drift down; a bear flag is a sharp fall and a small drift up." },
      { q: "Why does the flag slope against the move?", a: "Because it is a partial retracement: some of the people who profited from the sharp move close their positions, and the price gives a little back." },
      { q: "Does a bear flag predict a further fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "pennant-pattern",
    group: "continuation",
    name: "Pennant",
    title: "Pennant pattern: what it is and how it differs from a flag",
    description: "The pennant chart pattern explained: a sharp move followed by a small triangle of narrowing swings. How to recognise a bullish or bearish pennant, how it differs from a flag and a triangle, and where people go wrong.",
    also: ["bullish pennant", "bearish pennant", "pennant chart pattern", "flag and pennant"],
    path: trace([[0, 12], [10, 16], [30, 66], [36, 48], [42, 61.2], [46, 52], [52, 57], [58, 67], [62, 64], [100, 92]], 109),
    lines: [
      { kind: "pole", pts: [[10, 16], [30, 66]] },
      { kind: "trend", pts: [[28, 66.8], [56, 55.6]] },
      { kind: "trend", pts: [[34, 47.2], [56, 56]] },
    ],
    tags: [
      { at: [28, 36], text: "flagpole", side: "below" },
      { at: [44, 68], text: "pennant", side: "above" },
    ],
    shape: "a sharp rise, then a small triangle of narrowing swings, then a further rise",
    outlined: "the flagpole along the first rise and two converging lines round the small triangle",
    is: "A pennant is a sharp move followed by a brief stretch in which the swings get smaller and smaller, so that lines drawn across the highs and under the lows converge to a point. The sharp move is the flagpole; the small triangle is the pennant. The picture here shows one after a rise. After a fall the same shape is called a bearish pennant.",
    see: [
      "A steep move first.",
      "Then lower highs and higher lows: each swing smaller than the last.",
      "Two lines that converge, forming a small triangle.",
      "It is short. A pennant that lasts as long as the move before it is a triangle.",
    ],
    said: "It is read as a pause in which buyers and sellers briefly agree on a price, after a move in which they did not. Traders take a close outside the pennant, in the direction of the pole, as the earlier move carrying on.",
    measure: "As with a flag, the textbook measure is the length of the flagpole, set off from the point where the price left the pennant. It is a convention for describing the shape and not a prediction.",
    check: [
      "Whether a sharp move really came first.",
      "How small and how brief the triangle is, compared with the pole.",
      "Which way the price leaves it, on a close.",
    ],
    traps: [
      "Assuming the direction of the break before it has happened.",
      "Drawing converging lines through two touches each and calling it a pennant. Any two pairs of points make a pair of lines.",
      "Confusing it with a symmetrical triangle, which is larger, slower and has no pole.",
    ],
    terms: ["trend", "consolidation", "breakout", "volatility", "trend-line"],
    faq: [
      { q: "What is the difference between a pennant and a symmetrical triangle?", a: "Size and what came before. A pennant is small and brief and follows a sharp move, the pole. A symmetrical triangle is larger, takes longer and need not follow a sharp move." },
      { q: "Can a pennant be bearish?", a: "Yes. After a sharp fall the same small triangle is called a bearish pennant." },
      { q: "Does a pennant predict the next move?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "cup-and-handle-pattern",
    group: "continuation",
    name: "Cup and handle",
    title: "Cup and handle pattern: what it is and how to read it",
    description: "The cup and handle chart pattern explained: a rounded dip, the cup, followed by a smaller drift down, the handle, beneath the same level. How to recognise it, what it is taken to mean and where people go wrong.",
    also: ["cup with handle", "cup and handle chart pattern", "cup and saucer", "inverted cup and handle"],
    path: trace([[0, 30], [14, 70], ...bowl(18, 58, 62, 40).slice(0, -1), [58, 62], [62, 70], [66, 63], [70, 66], [74, 60], [80, 73], [84, 71], [100, 90]], 110, 1.1),
    lines: [
      { kind: "curve", pts: bowl(14, 62, 64, 34) },
      { kind: "level", pts: [[10, 70], [88, 70]] },
      { kind: "trend", pts: [[60, 71], [78, 62]] },
      { kind: "trend", pts: [[64, 63.75], [78, 58.5]] },
    ],
    tags: [
      { at: [38, 34], text: "cup", side: "below" },
      { at: [72, 58], text: "handle", side: "below" },
      { at: [30, 70], text: "rim", side: "above" },
    ],
    shape: "a rise, a rounded dip back to the same height, a smaller drift down, and then a further rise",
    outlined: "a curve under the cup, a level across its rim and two short lines round the handle",
    is: "A cup and handle is two parts. The cup is a rounded dip: the price eases down from a high, flattens and climbs back to about the same level. The handle is a smaller, shorter drift down from that level. The line across the two highs is the rim, and the shape is complete in the textbook sense when the price closes above it.",
    see: [
      "A rise comes before the cup.",
      "The cup is rounded, a U and not a V.",
      "Both sides of the cup reach about the same height.",
      "The handle is shallow: it stays in the upper part of the cup.",
    ],
    said: "It is read as a rise that paused, shook out the holders who wanted to sell at the old high, and then resumed. The handle is taken as the last of that selling. A close above the rim is treated as the earlier rise carrying on.",
    measure: "The textbook measure is the depth of the cup, from its lowest point to the rim, taken up from the rim. It is a convention for describing the size of the shape. It is not a prediction.",
    check: [
      "The shape of the cup. A sharp V is a different thing from a slow turn.",
      "How deep the handle is, against the depth of the cup.",
      "Whether the price has closed above the rim, or only approached it.",
      "The time frame. Textbook examples are drawn on daily and weekly charts.",
    ],
    traps: [
      "Seeing a cup before its right side has reached the rim.",
      "Calling any dip after a recovery a handle, however deep.",
      "Treating the depth of the cup as a target.",
    ],
    terms: ["trend", "resistance", "breakout", "pullback", "consolidation"],
    faq: [
      { q: "Is a cup and handle bullish?", a: "It is classed as a bullish continuation shape: a pause within a rise, completed by a close above the rim. Its mirror image, the inverted cup and handle, is classed as bearish. Both classes describe drawings." },
      { q: "How long does a cup and handle take to form?", a: "Textbooks describe cups that last from several weeks to many months on daily charts, with a much shorter handle. There is no fixed length." },
      { q: "Does a cup and handle predict a rise?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "ascending-triangle-pattern",
    group: "continuation",
    name: "Ascending triangle",
    title: "Ascending triangle pattern: what it is and how to recognise it",
    description: "The ascending triangle chart pattern explained: a flat line of highs above a rising line of lows. How to recognise an ascending triangle, what it is taken to mean, how textbooks measure it and where people go wrong.",
    also: ["ascending triangle chart pattern", "rising triangle", "flat top triangle", "bullish triangle"],
    path: trace(AT, 111),
    lines: [...AT_LINES, { kind: "measure", pts: [[26, 42], [26, 70]] }],
    tags: [
      { at: [44, 70], text: "resistance", side: "above" },
      { at: [56, 54], text: "rising lows", side: "below" },
    ],
    shape: "highs that stop at the same level while the lows between them climb, and then a rise through that level",
    outlined: "a flat line across the highs, a rising line under the lows and the height of the triangle at its widest",
    is: "An ascending triangle is a flat top and a rising floor. The price reaches the same level several times and turns back, but each dip ends higher than the one before. A horizontal line across the highs and a rising line under the lows meet at a point on the right.",
    see: [
      "At least two highs at about the same price.",
      "At least two lows, each higher than the last.",
      "The swings get smaller as the two lines approach each other.",
      "Textbooks place it most often within a rise, but it is drawn in other places too.",
    ],
    said: "It is read as buyers becoming more willing while sellers stay at one price. Each dip is bought sooner. Traders take a close above the flat line as the sellers at that level having been used up. A close below the rising line is taken the other way.",
    measure: "The textbook measure is the height of the triangle at its widest, taken up from the flat line. It is a convention for describing the shape and not a prediction.",
    check: [
      "How many times each line has been touched. Two touches make a line; they do not make it meaningful.",
      "Which line the price has closed beyond.",
      "How far along the triangle the price is. Textbooks say little about a price that drifts out of the point.",
    ],
    traps: [
      "Assuming it must break upward. It is classed as bullish, and it breaks downward often enough.",
      "Reacting to a wick through the line instead of a close.",
      "Redrawing the rising line after each new low so that the triangle survives.",
    ],
    terms: ["resistance", "support", "trend-line", "breakout", "consolidation", "false-breakout"],
    faq: [
      { q: "Is an ascending triangle bullish?", a: "It is classed as bullish, because the lows are rising against a fixed ceiling. The class describes the drawing. The price can leave the triangle on either side." },
      { q: "What is the difference between ascending and descending triangles?", a: "An ascending triangle has a flat top and rising lows. A descending triangle has a flat bottom and falling highs. One is the other turned over." },
      { q: "Does an ascending triangle predict a breakout upward?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "descending-triangle-pattern",
    group: "continuation",
    name: "Descending triangle",
    title: "Descending triangle pattern: meaning and how to read it",
    description: "The descending triangle chart pattern explained: a flat line of lows beneath a falling line of highs. How to recognise a descending triangle, what it is taken to mean and the common mistakes.",
    also: ["descending triangle chart pattern", "falling triangle", "flat bottom triangle", "bearish triangle"],
    path: trace(turn(AT), 112),
    lines: [...turnLines(AT_LINES), { kind: "measure", pts: [[26, 58], [26, 30]] }],
    tags: [
      { at: [44, 30], text: "support", side: "below" },
      { at: [62, 47], text: "falling highs", side: "above" },
    ],
    shape: "lows that stop at the same level while the highs between them fall, and then a drop through that level",
    outlined: "a flat line under the lows, a falling line across the highs and the height of the triangle at its widest",
    is: "A descending triangle is a flat floor and a falling ceiling. The price reaches the same low several times and bounces, but each bounce ends lower than the one before. A horizontal line under the lows and a falling line across the highs meet at a point on the right.",
    see: [
      "At least two lows at about the same price.",
      "At least two highs, each lower than the last.",
      "The swings get smaller as the lines approach each other.",
      "Textbooks place it most often within a fall.",
    ],
    said: "It is read as sellers becoming more willing while buyers stay at one price. Each bounce is sold sooner. Traders take a close below the flat line as the buyers at that level having been used up, and a close above the falling line the other way.",
    measure: "The textbook measure is the height of the triangle at its widest, taken down from the flat line. It is a convention, not a prediction.",
    check: [
      "How many times each line has been touched.",
      "Which line the price has closed beyond.",
      "Whether the flat line is also a level that mattered on a longer time frame.",
    ],
    traps: [
      "Assuming it must break downward.",
      "Reacting to a wick through support instead of a close.",
      "Fitting the falling line to whichever highs make the neatest triangle.",
    ],
    terms: ["support", "resistance", "trend-line", "breakout", "consolidation", "false-breakout"],
    faq: [
      { q: "Is a descending triangle bearish?", a: "It is classed as bearish, because the highs are falling against a fixed floor. That describes the drawing. The price can leave on either side." },
      { q: "Can a descending triangle break upward?", a: "Yes. A close above the falling line of highs happens often enough that no careful description of the shape leaves it out." },
      { q: "Does a descending triangle predict a fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "symmetrical-triangle-pattern",
    group: "either",
    name: "Symmetrical triangle",
    title: "Symmetrical triangle pattern: what it is and what it does not say",
    description: "The symmetrical triangle chart pattern explained: falling highs and rising lows that converge to a point. How to recognise a symmetrical triangle, why it has no direction of its own and where people go wrong.",
    also: ["symmetrical triangle chart pattern", "coil", "contracting triangle", "triangle breakout"],
    path: trace([[0, 22], [14, 78], [24, 36], [34, 70], [44, 44], [54, 62], [62, 51.2], [68, 56], [76, 67], [82, 63], [100, 84]], 113),
    lines: [
      { kind: "trend", pts: [[10, 79.6], [74, 54]] },
      { kind: "trend", pts: [[20, 34.4], [74, 56]] },
      { kind: "measure", pts: [[24, 36], [24, 74]] },
    ],
    tags: [
      { at: [42, 70], text: "lower highs", side: "above" },
      { at: [48, 43], text: "higher lows", side: "below" },
    ],
    shape: "swings that get smaller, with each high lower and each low higher, and then a rise out of the point",
    outlined: "a falling line across the highs, a rising line under the lows and the height of the triangle at its widest",
    is: "A symmetrical triangle is a price whose swings shrink. Each high is lower than the last and each low is higher, so a line across the highs and a line under the lows slope toward each other at about the same angle. In the invented picture the price leaves upward. It could as well have left downward.",
    see: [
      "At least two lower highs and two higher lows.",
      "Two lines that converge, neither of them flat.",
      "Movement that gets quieter toward the point.",
    ],
    said: "It is read as agreement: buyers and sellers settling on a narrower and narrower range of prices. The shape has no direction of its own. Textbooks often call it a continuation of whatever move came before, but traders wait to see which line is broken on a close.",
    measure: "The textbook measure is the height of the triangle at its widest, set off from the point where the price left it, in whichever direction that was. It is a convention and not a prediction.",
    check: [
      "Which line the price has closed beyond.",
      "How near the point the price is. A drift out of the very tip is given little weight.",
      "The direction of the move before the triangle, and of the larger trend.",
    ],
    traps: [
      "Guessing the direction in advance.",
      "Taking the first poke through a line as the break. In a narrowing range, false breaks are common.",
      "Drawing the lines through wicks on one side and closes on the other.",
    ],
    terms: ["trend-line", "consolidation", "breakout", "false-breakout", "volatility", "range"],
    faq: [
      { q: "Is a symmetrical triangle bullish or bearish?", a: "Neither. It is the one triangle with no lean of its own. It is given a direction only by the side on which the price leaves it." },
      { q: "Why does volatility fall inside a triangle?", a: "Because the range between the highs and the lows is narrowing. That is what the two converging lines record." },
      { q: "Does a symmetrical triangle predict a big move?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "rectangle-pattern",
    group: "either",
    name: "Rectangle",
    title: "Rectangle pattern: the trading range, and how it is read",
    description: "The rectangle chart pattern explained: a price that moves back and forth between a flat line of highs and a flat line of lows. How to recognise a trading range, what it is taken to mean and where people go wrong.",
    also: ["trading range", "rectangle chart pattern", "consolidation range", "box pattern", "sideways market"],
    path: trace([[0, 18], [14, 66], [22, 46], [32, 66], [42, 46], [52, 66], [62, 46], [72, 66], [78, 58], [86, 73], [90, 69], [100, 86]], 114),
    lines: [
      { kind: "level", pts: [[10, 66], [84, 66]] },
      { kind: "level", pts: [[18, 46], [84, 46]] },
      { kind: "measure", pts: [[22, 46], [22, 66]] },
    ],
    tags: [
      { at: [42, 66], text: "resistance", side: "above" },
      { at: [52, 46], text: "support", side: "below" },
    ],
    shape: "a price moving back and forth between the same high and the same low, and then a rise out of the top",
    outlined: "a flat line across the highs, a flat line under the lows and the height between them",
    is: "A rectangle is a trading range. The price rises to about the same level several times and falls to about the same level several times, so that a horizontal line can be drawn across the highs and another under the lows. In the invented picture the price leaves through the top. It could as well have left through the bottom.",
    see: [
      "At least two highs at about one price and two lows at about another.",
      "The two lines are roughly horizontal and roughly parallel.",
      "The price crosses the middle of the range repeatedly, without settling.",
    ],
    said: "It is read as balance. Buyers appear at the lower line, sellers at the upper one, and neither side is winning. Textbooks class it as a continuation when the price leaves in the direction it arrived, and a reversal when it leaves the other way. Which one it is can be said only afterwards.",
    measure: "The textbook measure is the height of the rectangle, set off from whichever line the price closed beyond. It is a convention for describing the shape, not a prediction.",
    check: [
      "How many times each line has been reached.",
      "Whether the price has closed outside the range or only pushed a wick through it.",
      "How wide the range is against the cost of trading inside it.",
    ],
    traps: [
      "Deciding in advance which way it will break.",
      "Treating the lines as exact. A range has fuzzy edges, and prices overshoot them.",
      "Mistaking the first move outside the range for the break. False breaks from ranges are common.",
    ],
    terms: ["range", "support", "resistance", "consolidation", "breakout", "false-breakout"],
    faq: [
      { q: "Is a rectangle a continuation or a reversal pattern?", a: "Either. It depends on which side the price leaves, and that is known only once it has happened." },
      { q: "What is the difference between a rectangle and a flag?", a: "A flag is short and follows a sharp move, and its lines usually slope against that move. A rectangle is longer, its lines are flat, and it need not follow anything sharp." },
      { q: "Does a rectangle predict a breakout?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "rising-wedge-pattern",
    group: "either",
    name: "Rising wedge",
    title: "Rising wedge pattern: what it is and how to read it",
    description: "The rising wedge chart pattern explained: higher highs and higher lows between two rising lines that converge. How to recognise a rising wedge, why it is classed as bearish and where people go wrong.",
    also: ["ascending wedge", "rising wedge chart pattern", "bearish wedge", "wedge pattern"],
    path: trace(RW, 115),
    lines: RW_LINES,
    tags: [
      { at: [44, 71], text: "rising highs", side: "above" },
      { at: [70, 60], text: "lows rising faster", side: "below" },
    ],
    shape: "a rise in which each new high gains less than the last while the lows keep climbing, and then a fall",
    outlined: "two rising lines that converge, one across the highs and a steeper one under the lows",
    is: "A rising wedge is a rise that narrows. The highs and the lows both climb, but the lows climb faster, so a line across the highs and a line under the lows both slope upward and converge. The shape is complete in the textbook sense when the price closes below the lower line.",
    see: [
      "Higher highs and higher lows.",
      "Both lines slope upward. That is what separates a wedge from a triangle.",
      "The lower line is the steeper one, so the two converge.",
      "Each push to a new high adds less than the one before.",
    ],
    said: "It is read as a rise that is losing force: the price is still going up, but with less and less to show for each attempt. Textbooks class it as bearish. At the end of a rise it is called a reversal; as an upward drift within a fall it is called a continuation.",
    measure: "The textbook measure is the height of the wedge at its widest, taken down from the point where the lower line broke. Some authors use the start of the wedge instead. Both are conventions and neither is a prediction.",
    check: [
      "Whether both lines really rise and really converge. Parallel lines make a channel, which is a different shape.",
      "How many times each line has been touched.",
      "Whether the price has closed below the lower line.",
    ],
    traps: [
      "Calling the top while the price is still inside the wedge. A rising wedge is, until it breaks, a price that is rising.",
      "Confusing it with an ascending triangle, whose upper line is flat.",
      "Treating the textbook measure as a destination.",
    ],
    terms: ["trend", "trend-line", "breakout", "support", "resistance"],
    faq: [
      { q: "Is a rising wedge bullish or bearish?", a: "It is classed as bearish, although the price inside it is rising. The class comes from the narrowing: each new high gains less. It describes the drawing and does not say what happens next." },
      { q: "What is the difference between a rising wedge and a channel?", a: "In a channel the two lines are parallel. In a wedge they converge." },
      { q: "Does a rising wedge predict a fall?", a: NOT_A_FORECAST },
    ],
  },
  {
    slug: "falling-wedge-pattern",
    group: "either",
    name: "Falling wedge",
    title: "Falling wedge pattern: meaning and how to recognise it",
    description: "The falling wedge chart pattern explained: lower highs and lower lows between two falling lines that converge. How to recognise a falling wedge, why it is classed as bullish and the common mistakes.",
    also: ["descending wedge", "falling wedge chart pattern", "bullish wedge", "wedge pattern"],
    path: trace(turn(RW), 116),
    lines: turnLines(RW_LINES),
    tags: [
      { at: [44, 29], text: "falling lows", side: "below" },
      { at: [70, 40], text: "highs falling faster", side: "above" },
    ],
    shape: "a fall in which each new low gains less than the last while the highs keep dropping, and then a rise",
    outlined: "two falling lines that converge, one under the lows and a steeper one across the highs",
    is: "A falling wedge is a fall that narrows. The highs and the lows both drop, but the highs drop faster, so a line across the highs and a line under the lows both slope downward and converge. The shape is complete in the textbook sense when the price closes above the upper line.",
    see: [
      "Lower highs and lower lows.",
      "Both lines slope downward.",
      "The upper line is the steeper one, so the two converge.",
      "Each push to a new low adds less than the one before.",
    ],
    said: "It is read as a fall that is losing force. Textbooks class it as bullish. At the end of a fall it is called a reversal; as a downward drift within a rise it is called a continuation.",
    measure: "The textbook measure is the height of the wedge at its widest, taken up from the point where the upper line broke. It is a convention and not a prediction.",
    check: [
      "Whether both lines fall and converge, or are in fact parallel.",
      "How many times each line has been touched.",
      "Whether the price has closed above the upper line.",
    ],
    traps: [
      "Calling the bottom while the price is still inside the wedge. Until it breaks, it is a price that is falling.",
      "Confusing it with a descending triangle, whose lower line is flat.",
      "Treating the textbook measure as a target.",
    ],
    terms: ["trend", "trend-line", "breakout", "support", "resistance"],
    faq: [
      { q: "Is a falling wedge bullish?", a: "It is classed as bullish, although the price inside it is falling, because each new low gains less than the last. The class describes the drawing." },
      { q: "How is a falling wedge different from a bull flag?", a: "A flag is short, follows a sharp rise and has parallel lines. A falling wedge is usually longer and its lines converge." },
      { q: "Does a falling wedge predict a rise?", a: NOT_A_FORECAST },
    ],
  },
];

export const PATTERN_GROUPS: readonly { group: PatternGroup; id: string; eyebrow: string; title: string; lead: string }[] = [
  {
    group: "reversal",
    id: "reversal",
    eyebrow: "Reversal shapes",
    title: "Shapes drawn where a move ended.",
    lead: "Each is named for a turn: a rise that became a fall, or a fall that became a rise. The name is given afterwards. While the shape is forming, nobody knows that it is one.",
  },
  {
    group: "continuation",
    id: "continuation",
    eyebrow: "Continuation shapes",
    title: "Shapes drawn where a move paused.",
    lead: "Each is a rest within a larger move, by its textbook description. A pause can also be the start of a turn, and the pages say so.",
  },
  {
    group: "either",
    id: "either-way",
    eyebrow: "Either way",
    title: "Shapes with no direction of their own.",
    lead: "A triangle, a range and the two wedges are read by the side on which the price leaves them, or by where they appear. Until then they say only that the swings have changed.",
  },
];

export const getPattern = (slug: string) => CHART_PATTERNS.find((p) => p.slug === slug);
