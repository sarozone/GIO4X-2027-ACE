/**
 * THE FLASHCARDS' SCHEDULE: five Leitner boxes, as pure functions.
 *
 * A card that has been looked at sits in one of five boxes. "Knew it" moves it
 * up one box; "did not" sends it back to box one. A card comes round again
 * after its box's interval: 1, 2, 4, 8 and 16 days. A card that has never been
 * looked at is "new" and is in no box.
 *
 * Nothing here reads a clock or touches storage: a day is a whole number
 * handed in by the caller (./store counts days in the visitor's own time
 * zone), so every function gives the same answer for the same arguments and
 * scripts/test-flashcards.mjs can prove the schedule. This file has no
 * imports for the same reason.
 */

/** days until a card in box 1, 2, 3, 4, 5 is due again */
export const INTERVALS = [1, 2, 4, 8, 16] as const;
export const BOXES = INTERVALS.length;

/** the most cards one round shows, and how many of them may be cards never seen before */
export const ROUND = 20;
export const NEW_PER_ROUND = 10;

/** [box, due]: the box, 1 to 5, and the day number on which the card is next due */
export type Card = readonly [box: number, due: number];
/** glossary slug → card. A slug that is absent has never been looked at. */
export type Deck = Readonly<Record<string, Card>>;

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
/** far more than the glossary holds: a stored deck can never grow without bound */
export const MAX_CARDS = 600;
/** a day number is a count of days since 1 January 1970: these bounds are the years 1997 and 2244 */
const MIN_DAY = 10_000;
const MAX_DAY = 100_000;

const isDay = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= MIN_DAY && n <= MAX_DAY;

/**
 * The day number of a moment, in a time zone `offsetMinutes` ahead of UTC
 * (the negative of Date.prototype.getTimezoneOffset()).
 */
export const dayNumber = (ms: number, offsetMinutes = 0): number => Math.floor((ms + offsetMinutes * 60_000) / 86_400_000);

/** the days a card waits in `box` */
export const intervalOf = (box: number): number => INTERVALS[Math.min(BOXES, Math.max(1, Math.trunc(box))) - 1];

/** The deck after one card is graded on `today`. The deck handed in is not changed. */
export function grade(deck: Deck, slug: string, knew: boolean, today: number): Deck {
  if (!SLUG.test(slug) || !isDay(today)) return deck;
  const was = deck[slug];
  // a new card that is known goes into box two: box one is where a card that was not known waits
  const box = knew ? Math.min(BOXES, (was ? was[0] : 1) + 1) : 1;
  return { ...deck, [slug]: [box, today + intervalOf(box)] };
}

export const isDue = (card: Card | undefined, today: number): boolean => !!card && card[1] <= today;

/** Of `slugs`, the cards whose day has come: the longest overdue first, then the lower box, then the order given. */
export function dueSlugs(deck: Deck, slugs: readonly string[], today: number): string[] {
  return slugs
    .filter((s) => isDue(deck[s], today))
    .map((s, i) => ({ s, i, c: deck[s] }))
    .sort((a, b) => a.c[1] - b.c[1] || a.c[0] - b.c[0] || a.i - b.i)
    .map((x) => x.s);
}

/** Of `slugs`, the cards never looked at, in the order given. */
export const newSlugs = (deck: Deck, slugs: readonly string[]): string[] => slugs.filter((s) => !deck[s]);

/** How many of the stored cards are due, whatever their topic. */
export const countDue = (deck: Deck, today: number): number => Object.values(deck).filter((c) => c[1] <= today).length;

/** The nearest day, after `today`, on which a stored card falls due; null when none is waiting. */
export function nextDueDay(deck: Deck, today: number): number | null {
  let next: number | null = null;
  for (const c of Object.values(deck)) if (c[1] > today && (next === null || c[1] < next)) next = c[1];
  return next;
}

/** How many of `slugs` sit in each box: index 0 is the cards never looked at, 1 to 5 the boxes. */
export function boxCounts(deck: Deck, slugs: readonly string[]): number[] {
  const out = new Array<number>(BOXES + 1).fill(0);
  for (const s of slugs) out[deck[s] ? deck[s][0] : 0]++;
  return out;
}

/** The same list in an order that depends only on `seed`: the new cards of a day are not always the letter A. */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let x = (Math.trunc(seed) ^ 0x9e3779b9) >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    // xorshift32: small, and the same on every machine
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * One round: the cards that are due, longest overdue first, then cards never
 * seen, in the day's order. At most `limit` cards, of which at most `fresh`
 * are new.
 */
export function round(deck: Deck, slugs: readonly string[], today: number, limit: number = ROUND, fresh: number = NEW_PER_ROUND): string[] {
  const due = dueSlugs(deck, slugs, today).slice(0, Math.max(0, limit));
  const room = Math.max(0, Math.min(fresh, limit - due.length));
  return [...due, ...shuffled(newSlugs(deck, slugs), today).slice(0, room)];
}

/** Only the cards of terms the glossary still has. The same deck is returned when nothing goes. */
export function prune(deck: Deck, slugs: readonly string[]): Deck {
  const known = new Set(slugs);
  const kept = Object.entries(deck).filter(([s]) => known.has(s));
  return kept.length === Object.keys(deck).length ? deck : Object.fromEntries(kept);
}

/**
 * What was read back from storage, made safe: well-formed slugs, a box from 1
 * to 5 and a whole day number, and nothing else. An entry of any other shape
 * is left out; a value that is not a deck at all is an empty deck.
 */
export function clean(v: unknown): Deck {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const cards = (v as { c?: unknown }).c;
  if ((v as { v?: unknown }).v !== 1 || !cards || typeof cards !== "object" || Array.isArray(cards)) return {};
  const out: Record<string, Card> = {};
  let n = 0;
  for (const [slug, card] of Object.entries(cards as Record<string, unknown>)) {
    if (n >= MAX_CARDS) break;
    if (!SLUG.test(slug) || !Array.isArray(card) || card.length !== 2) continue;
    const [box, due] = card as unknown[];
    if (typeof box !== "number" || !Number.isInteger(box) || box < 1 || box > BOXES || !isDay(due)) continue;
    out[slug] = [box, due];
    n++;
  }
  return out;
}

/** What is written to storage for a deck. */
export const toStored = (deck: Deck): { v: 1; c: Deck } => ({ v: 1, c: deck });
