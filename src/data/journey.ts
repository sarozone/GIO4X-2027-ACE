/**
 * "A PATH THROUGH IT": one optional exercise on My desk that strings pages
 * the site already has into eight steps, from understanding leverage to
 * reviewing a journal. It is an order to read and practise in, not advice on
 * what to trade or how much.
 *
 * The rule this file keeps: a step is shown as done only from a record this
 * browser already holds for another purpose (a lesson completed, a glossary
 * question answered, a passport stamp, a saved page, the list of recent pages,
 * a journal with a trade in it). Nothing is stored for the path itself, so a
 * step that leaves no such record is a plain link and says so.
 */

/** One way an existing record can show a step was done. Any one of a step's signs is enough. */
export type JourneySign =
  /** an Academy lesson completed: "lesson:<slug>" in gx:learn */
  | { by: "lesson"; slug: string }
  /** a glossary term's question answered correctly: "<slug>" in gx:learn */
  | { by: "term"; slug: string }
  /** a passport stamp collected: an id in gx:play (only once the passport has been started) */
  | { by: "stamp"; id: string }
  /** a page kept with Save: its path in gx:saved */
  | { by: "saved"; href: string }
  /** a page among the recent pages: its path in gx:recent (only while that list is switched on) */
  | { by: "recent"; href: string }
  /** at least this many trades written in the journal: gx:journal */
  | { by: "journal"; trades: number };

export type JourneyStep = {
  id: string;
  /** what the step is for, as a verb */
  title: string;
  /** one sentence on what the page does */
  line: string;
  /** the page the step opens */
  href: string;
  label: string;
  /** a second page that serves the same step */
  also?: { href: string; label: string };
  /** empty when nothing this browser holds can show the step was done */
  signs: JourneySign[];
  /** the signs, in words, shown under the step */
  shownBy: string;
};

export const journey: JourneyStep[] = [
  {
    id: "leverage",
    title: "Understand leverage",
    line: "Six steps that follow one stake, the position it answers for and what a 1% move does to each.",
    href: "/academy/leverage-story",
    label: "The leverage story",
    also: { href: "/academy/what-is-leverage-and-margin", label: "Lesson: Leverage and margin" },
    signs: [
      { by: "lesson", slug: "what-is-leverage-and-margin" },
      { by: "term", slug: "leverage" },
    ],
    shownBy: "The story leaves no record. Ticked when the lesson “Leverage and margin” is completed or the glossary’s question on leverage is answered.",
  },
  {
    id: "margin",
    title: "Calculate margin",
    line: "What a position ties up at a given leverage, on figures you type, with the formula shown.",
    href: "/tools/margin",
    label: "Margin tool",
    signs: [
      { by: "saved", href: "/tools/margin" },
      { by: "recent", href: "/tools/margin" },
      { by: "term", slug: "margin" },
    ],
    shownBy: "Ticked when the tool is saved or among your recent pages, or the glossary’s question on margin is answered.",
  },
  {
    id: "size",
    title: "Size a position",
    line: "From a balance, a risk per trade and a stop distance to a size in lots. The arithmetic, not a recommendation.",
    href: "/tools/position-size",
    label: "Position Size tool",
    signs: [
      { by: "saved", href: "/tools/position-size" },
      { by: "recent", href: "/tools/position-size" },
      { by: "lesson", slug: "position-sizing-strategies" },
    ],
    shownBy: "Ticked when the tool is saved or among your recent pages, or the lesson “Position sizing” is completed.",
  },
  {
    id: "practise",
    title: "Practise an order",
    line: "Build an order by dragging its entry, stop and target, and find what is wrong with a ticket, on invented figures. Nothing is at stake.",
    href: "/academy/practice",
    label: "Practice room",
    also: { href: "/labs/simulator", label: "Practice desk" },
    signs: [
      { by: "stamp", id: "practice" },
      { by: "stamp", id: "desk" },
      { by: "recent", href: "/academy/practice" },
      { by: "recent", href: "/labs/simulator" },
    ],
    shownBy: "Ticked by the passport stamp for the Practice room or the Practice desk, or when either is among your recent pages.",
  },
  {
    id: "rule",
    title: "Test a rule",
    line: "Build a simple rule and run it over invented prices, to see how a test is made and how easily one result misleads.",
    href: "/labs/rule-bench",
    label: "Rule bench",
    signs: [
      { by: "stamp", id: "bench" },
      { by: "recent", href: "/labs/rule-bench" },
    ],
    shownBy: "Ticked by the passport stamp for the Rule bench, or when it is among your recent pages.",
  },
  {
    id: "risk",
    title: "See what size does",
    line: "The same run of trades replayed at different sizes, the chance of a losing streak and the gain needed to recover a loss.",
    href: "/labs/risk-room",
    label: "The Risk Room",
    signs: [
      { by: "stamp", id: "riskroom" },
      { by: "recent", href: "/labs/risk-room" },
    ],
    shownBy: "Ticked by the passport stamp for the Risk Room, or when it is among your recent pages.",
  },
  {
    id: "record",
    title: "Record the reasoning",
    line: "Write a trade down with why it was taken, in a journal kept in this browser.",
    href: "/journal",
    label: "Trading journal",
    signs: [{ by: "journal", trades: 1 }],
    shownBy: "Ticked when the journal holds at least one trade.",
  },
  {
    id: "review",
    title: "Review",
    line: "Read the journal’s own statistics once it holds enough trades, and sit a level exam on what the lessons taught.",
    href: "/journal#journal",
    label: "Journal statistics",
    also: { href: "/academy/exams", label: "Level exams" },
    signs: [],
    shownBy: "No tick: reading the statistics leaves no record, and an exam’s result is not stored.",
  },
];
