/**
 * Proves the schedule of the glossary flashcards
 * (src/components/glossary/flashcards/leitner.ts).
 *
 *   node scripts/test-flashcards.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the schedule has
 * no imports of its own). The checks: the intervals are 1, 2, 4, 8 and 16
 * days; "knew it" moves a card up one box and "did not" sends it to box one;
 * a card is due on its day and not before; a round puts the longest overdue
 * first and limits the new cards; and whatever is read back from storage is
 * reduced to well-formed cards.
 */
import * as L from "../src/components/glossary/flashcards/leitner.ts";

let passed = 0;
const failures = [];
function ok(name, cond, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
const same = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);

/** 5 October 2026, as a day number */
const D = 20731;

/* ---- the constants the page states ------------------------------------------- */

same("intervals", [...L.INTERVALS], [1, 2, 4, 8, 16]);
same("boxes", L.BOXES, 5);
same("interval of box 0 is box 1's", L.intervalOf(0), 1);
same("interval of box 9 is box 5's", L.intervalOf(9), 16);

/* ---- day numbers ----------------------------------------------------------------- */

same("day number, UTC", L.dayNumber(Date.UTC(2026, 9, 5, 12)), D);
same("day number, start of the day", L.dayNumber(Date.UTC(2026, 9, 5, 0, 0, 0)), D);
same("day number, last second", L.dayNumber(Date.UTC(2026, 9, 5, 23, 59, 59)), D);
// 23:30 UTC is already the 6th in a zone two hours ahead, and still the 5th five hours behind
same("day number, ahead of UTC", L.dayNumber(Date.UTC(2026, 9, 5, 23, 30), 120), D + 1);
same("day number, behind UTC", L.dayNumber(Date.UTC(2026, 9, 5, 2, 0), -300), D - 1);

/* ---- grading --------------------------------------------------------------------- */

{
  const empty = {};
  const known = L.grade(empty, "pip", true, D);
  same("a new card that was known goes to box 2, due in 2 days", known.pip, [2, D + 2]);
  same("the deck handed in is not changed", empty, {});
  const missed = L.grade(empty, "pip", false, D);
  same("a new card that was not known goes to box 1, due tomorrow", missed.pip, [1, D + 1]);

  // up the boxes, one at a time, each graded on the day it falls due
  let deck = missed;
  let day = D + 1;
  const seen = [];
  for (let i = 0; i < 6; i++) {
    deck = L.grade(deck, "pip", true, day);
    seen.push([deck.pip[0], deck.pip[1] - day]);
    day = deck.pip[1];
  }
  same("knew it: one box up each time, then it stays in box 5", seen, [[2, 2], [3, 4], [4, 8], [5, 16], [5, 16], [5, 16]]);

  const back = L.grade(deck, "pip", false, day);
  same("did not: from box 5 straight back to box 1, due tomorrow", back.pip, [1, day + 1]);
  same("grading one card leaves the others alone", L.grade({ spread: [3, D + 4] }, "pip", true, D).spread, [3, D + 4]);
  same("a slug that is not a slug is not stored", L.grade({}, "Not A Slug", true, D), {});
  same("a day that is not a day is not stored", L.grade({}, "pip", true, 1.5), {});
}

/* ---- due, new and counts -------------------------------------------------------------- */

{
  const deck = { a: [1, D - 3], b: [2, D], c: [3, D + 1], d: [1, D - 3], e: [4, D - 1] };
  const slugs = ["a", "b", "c", "d", "e", "f", "g"];
  ok("due on its day", L.isDue(deck.b, D));
  ok("not due the day before", !L.isDue(deck.c, D));
  ok("a card never seen is not due", !L.isDue(undefined, D));
  same("due: longest overdue first, then the lower box, then the order given", L.dueSlugs(deck, slugs, D), ["a", "d", "e", "b"]);
  same("due: only the slugs asked for", L.dueSlugs(deck, ["b", "c"], D), ["b"]);
  same("new: the cards never seen", L.newSlugs(deck, slugs), ["f", "g"]);
  same("count of due cards", L.countDue(deck, D), 4);
  same("next due day", L.nextDueDay(deck, D), D + 1);
  same("next due day, nothing waiting", L.nextDueDay({ a: [1, D] }, D), null);
  same("box counts: new, then boxes 1 to 5", L.boxCounts(deck, slugs), [2, 2, 1, 1, 1, 0]);
}

/* ---- a round ------------------------------------------------------------------------------ */

{
  const slugs = Array.from({ length: 40 }, (_, i) => `t${i}`);
  const first = L.round({}, slugs, D);
  same("a first round is the new-card limit", first.length, L.NEW_PER_ROUND);
  ok("a first round has no card twice", new Set(first).size === first.length);
  ok("a first round is made of the glossary's cards", first.every((s) => slugs.includes(s)));
  same("the same day gives the same round", L.round({}, slugs, D), first);
  ok("another day gives another order", JSON.stringify(L.round({}, slugs, D + 1)) !== JSON.stringify(first));

  const deck = { t0: [1, D], t1: [2, D - 2], t2: [5, D + 9] };
  const r = L.round(deck, slugs, D);
  same("due cards lead the round, longest overdue first", r.slice(0, 2), ["t1", "t0"]);
  same("then new cards, up to their limit", r.length, 2 + L.NEW_PER_ROUND);
  ok("a card that is not due is not in the round", !r.includes("t2"));

  const many = Object.fromEntries(slugs.slice(0, 30).map((s) => [s, [1, D - 1]]));
  const full = L.round(many, slugs, D);
  same("a round is never longer than its limit", full.length, L.ROUND);
  ok("a full round of due cards takes no new card", full.every((s) => many[s]));
  same("a limit of nothing is an empty round", L.round(many, slugs, D, 0), []);

  const nearly = Object.fromEntries(slugs.slice(0, 15).map((s) => [s, [1, D - 1]]));
  same("new cards fill only the room that is left", L.round(nearly, slugs, D).length, L.ROUND);

  same("shuffled keeps every item", [...L.shuffled(slugs, 7)].sort(), [...slugs].sort());
  same("shuffled does not change the list handed in", slugs[0], "t0");
}

/* ---- pruning and reading back ------------------------------------------------------------ */

{
  const deck = { a: [1, D], gone: [2, D] };
  same("prune drops a term the glossary no longer has", L.prune(deck, ["a", "b"]), { a: [1, D] });
  ok("prune returns the same deck when nothing goes", L.prune(deck, ["a", "gone"]) === deck);

  same("clean: not an object", L.clean("x"), {});
  same("clean: null", L.clean(null), {});
  same("clean: an array", L.clean([]), {});
  same("clean: another version", L.clean({ v: 2, c: { a: [1, D] } }), {});
  same("clean: no cards", L.clean({ v: 1 }), {});
  same(
    "clean: keeps well-formed cards and nothing else",
    L.clean({ v: 1, c: { a: [1, D], b: [6, D], c: [0, D], d: [2, 1.5], e: [2], f: "x", "Bad Slug": [1, D], g: [5, D + 16], h: [1, 3], i: [1, D, 1], j: [1.5, D] } }),
    { a: [1, D], g: [5, D + 16] },
  );
  const big = Object.fromEntries(Array.from({ length: L.MAX_CARDS + 50 }, (_, i) => [`t${i}`, [1, D]]));
  same("clean: never more than the limit", Object.keys(L.clean({ v: 1, c: big })).length, L.MAX_CARDS);
  const stored = L.toStored({ a: [3, D + 4] });
  same("what is stored reads back as it was", L.clean(JSON.parse(JSON.stringify(stored))), { a: [3, D + 4] });
}

/* ---- a fortnight, end to end ------------------------------------------------------------------ */

{
  // one card, known every time it is shown: it is shown on days 0, 2, 6, 14 and 30
  let deck = {};
  const shown = [];
  for (let day = D; day <= D + 30; day++) {
    if (!deck.pip || L.isDue(deck.pip, day)) {
      shown.push(day - D);
      deck = L.grade(deck, "pip", true, day);
    }
  }
  same("a card known every time is shown on days 0, 2, 6, 14 and 30", shown, [0, 2, 6, 14, 30]);
}

if (failures.length) {
  console.error(`flashcards: ${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`flashcards: ${passed} checks passed`);
