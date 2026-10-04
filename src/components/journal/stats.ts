/**
 * TRADING JOURNAL: the statistics of the journal on /journal.
 *
 * A pure module: no imports, no clock, no storage, no Math.random(). The same
 * list of trades always gives the same figures, and the arithmetic is checked
 * against hand-worked cases in node.
 *
 * Every figure is arithmetic on what the visitor wrote down. A result is the
 * amount the visitor typed, in their own account currency: this module never
 * works a result out from prices, because it cannot know a contract size, a
 * commission or a swap. Where a figure cannot be worked out (no losing trade
 * yet, no trade at all) it is null and never zero, so that the page can say
 * "not enough trades yet" instead of showing a number that means nothing.
 *
 * Sums are kept in hundredths, as whole numbers, so that adding 0.10 five
 * hundred times gives exactly 50.00.
 *
 * A journal records what happened. Nothing here says what will happen next.
 */

export const MOODS = ["calm", "rushed", "bored", "fearful", "confident"] as const;
export type Mood = (typeof MOODS)[number];
export type Side = "long" | "short";

export type Trade = {
  /** made in the browser when the trade is added; means nothing outside it */
  id: string;
  /** the day of the trade, YYYY-MM-DD, as the visitor gave it */
  date: string;
  instrument: string;
  side: Side;
  size: number;
  entry: number;
  exit: number;
  /** null when no stop was written down */
  stop: number | null;
  /** what the trade came to, in the visitor's account currency, to two decimal places; negative for a loss */
  result: number;
  plan: string;
  happened: string;
  mood: Mood;
  /** the visitor's own answer to "did I follow my plan?" */
  followed: boolean;
};

/** Monday first, as a trading week runs */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

/** below this many trades the page shows no figure for the journal as a whole */
export const MIN_TRADES = 5;
/** below this many trades in a group (a mood, a weekday) the page shows no figure for the group */
export const MIN_GROUP = 3;

/** A set of trades taken together: how many, how many gained, what they came to, and the mean of that. */
export type Group = {
  n: number;
  gained: number;
  lost: number;
  net: number;
  /** net ÷ n; null when the group is empty */
  mean: number | null;
};

export type Stats = {
  n: number;
  gained: number;
  lost: number;
  /** trades whose result was exactly zero */
  flat: number;
  /** the sum of every result */
  net: number;
  /** gained ÷ n */
  gainShare: number | null;
  /** the sum of the gains ÷ the number of gaining trades */
  avgGain: number | null;
  /** the sum of the losses ÷ the number of losing trades; a negative number */
  avgLoss: number | null;
  /** net ÷ n */
  expectancy: number | null;
  /** the sum of the gains ÷ the sum of the losses taken as a positive number; null while there is no loss to divide by */
  profitFactor: number | null;
  largestGain: number | null;
  /** a negative number */
  largestLoss: number | null;
  /** the most losing trades one after another, in the order of the journal; a trade at exactly zero ends a run */
  losingRun: number;
  followed: Group;
  notFollowed: Group;
  byMood: Record<Mood, Group>;
  /** seven groups, Monday first */
  byDay: Group[];
  /** the running total after each trade, in the order given; one entry for each trade */
  equity: number[];
};

const cents = (x: number) => Math.round(x * 100);

/** 0 for Monday to 6 for Sunday, from a YYYY-MM-DD date; -1 if it is not one. No time zone is involved: the date is the visitor's own. */
export function weekday(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return -1;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (!Number.isFinite(t)) return -1;
  return (new Date(t).getUTCDay() + 6) % 7;
}

type Tally = { n: number; gained: number; lost: number; net: number };
const tally = (): Tally => ({ n: 0, gained: 0, lost: 0, net: 0 });
const count = (g: Tally, c: number) => {
  g.n++;
  g.net += c;
  if (c > 0) g.gained++;
  else if (c < 0) g.lost++;
};
const group = (g: Tally): Group => ({ n: g.n, gained: g.gained, lost: g.lost, net: g.net / 100, mean: g.n ? g.net / g.n / 100 : null });

/** The trades are taken in the order given: the journal keeps them by date, and within a day in the order they were written. */
export function journalStats(trades: readonly Trade[]): Stats {
  const all = tally();
  const yes = tally();
  const no = tally();
  const moods = MOODS.map(() => tally());
  const days = DAYS.map(() => tally());
  let gains = 0;
  let losses = 0;
  let best = 0;
  let worst = 0;
  let run = 0;
  let longest = 0;
  const equity: number[] = [];

  for (const t of trades) {
    const c = cents(t.result);
    count(all, c);
    count(t.followed ? yes : no, c);
    const mi = MOODS.indexOf(t.mood);
    if (mi >= 0) count(moods[mi]!, c);
    const di = weekday(t.date);
    if (di >= 0) count(days[di]!, c);
    if (c > 0) {
      gains += c;
      if (c > best) best = c;
    }
    if (c < 0) {
      losses += c;
      if (c < worst) worst = c;
      run++;
      if (run > longest) longest = run;
    } else run = 0;
    equity.push(all.net / 100);
  }

  const byMood = {} as Record<Mood, Group>;
  MOODS.forEach((m, i) => {
    byMood[m] = group(moods[i]!);
  });

  return {
    n: all.n,
    gained: all.gained,
    lost: all.lost,
    flat: all.n - all.gained - all.lost,
    net: all.net / 100,
    gainShare: all.n ? all.gained / all.n : null,
    avgGain: all.gained ? gains / all.gained / 100 : null,
    avgLoss: all.lost ? losses / all.lost / 100 : null,
    expectancy: all.n ? all.net / all.n / 100 : null,
    profitFactor: losses < 0 ? gains / -losses : null,
    largestGain: all.gained ? best / 100 : null,
    largestLoss: all.lost ? worst / 100 : null,
    losingRun: longest,
    followed: group(yes),
    notFollowed: group(no),
    byMood,
    byDay: days.map(group),
    equity,
  };
}
