/**
 * SCAM SCHOOL — the arithmetic behind the explainers.
 *
 * A pure module: no imports, no clock, no chance that is not seeded. Each
 * function is the whole of one mechanism, small enough to check by hand, and
 * the page prints the formula it uses. Every number is in invented "units":
 * nothing here is a statistic about a real fraud, a real firm or a real market.
 */

/** the same small fixed-seed generator the Labs use (workshop/rng.ts), kept here so this file imports nothing */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
 * PONZI. Each month new money arrives; the operator keeps a cut; everyone who
 * is "invested" is paid a monthly "return" out of the same pot. Nothing is
 * ever earned. The pot runs dry when the returns owed exceed what comes in.
 * ------------------------------------------------------------------------- */

export const PONZI = { months: 36, first: 100, promised: 0.1, cut: 0.1 } as const;

export type PonziMonth = { inflow: number; paid: number; pot: number; owed: number };

/** `growth` is how much more new money arrives each month than the month before (0.05 = 5% more; negative = less) */
export function ponzi(growth: number): { rows: PonziMonth[]; collapse: number | null; needed: number } {
  const rows: PonziMonth[] = [];
  let pot = 0;
  let owed = 0;
  let collapse: number | null = null;
  for (let m = 0; m < PONZI.months; m++) {
    const inflow = PONZI.first * Math.pow(1 + growth, m);
    owed += inflow;
    const due = owed * PONZI.promised;
    pot += inflow * (1 - PONZI.cut);
    if (pot < due) {
      // the month the "returns" cannot be paid in full: what is left goes out and the scheme stops
      rows.push({ inflow, paid: pot, pot: 0, owed });
      collapse = m;
      break;
    }
    pot -= due;
    rows.push({ inflow, paid: due, pot, owed });
  }
  return { rows, collapse, needed: Math.pow(1 + growth, PONZI.months - 1) };
}

/* ---------------------------------------------------------------------------
 * PYRAMID. Every member must bring in `each` new members. Level n therefore
 * needs each^n people.
 * ------------------------------------------------------------------------- */

/** about eight billion people: the round figure the United Nations gives for the world's population in the 2020s */
export const WORLD = 8_000_000_000;
export const CITY = 1_000_000;

export function pyramid(each: number): { levels: number[]; cityAt: number; worldAt: number; bottomShare: number } {
  const levels: number[] = [1];
  let total = 1;
  let cityAt = -1;
  let worldAt = -1;
  while (worldAt < 0 && levels.length < 40) {
    const next = levels[levels.length - 1] * each;
    levels.push(next);
    total += next;
    if (cityAt < 0 && total > CITY) cityAt = levels.length - 1;
    if (total > WORLD) worldAt = levels.length - 1;
  }
  // wherever it stops, the newest level has recruited nobody: its share of all members tends to (each - 1) / each
  return { levels, cityAt, worldAt, bottomShare: (each - 1) / each };
}

/* ---------------------------------------------------------------------------
 * PUMP AND DUMP. One invented price, 100 days: quiet buying by the promoters,
 * a promoted rise, their selling into the buyers they attracted, and after.
 * ------------------------------------------------------------------------- */

export const PUMP = { days: 100, buyEnd: 30, pumpEnd: 62, sellEnd: 74 } as const;

export function pumpPath(): number[] {
  const r = seededRng(4242);
  const out: number[] = [];
  for (let d = 0; d < PUMP.days; d++) {
    let base: number;
    if (d < PUMP.buyEnd) base = 10 + d * 0.04;
    else if (d < PUMP.pumpEnd) {
      const q = (d - PUMP.buyEnd) / (PUMP.pumpEnd - PUMP.buyEnd);
      base = 11.2 + 38.8 * q * q;
    } else if (d < PUMP.sellEnd) {
      const q = (d - PUMP.pumpEnd) / (PUMP.sellEnd - PUMP.pumpEnd);
      base = 50 - 38 * Math.pow(q, 0.7);
    } else base = 12 - 5 * (1 - Math.exp(-(d - PUMP.sellEnd) / 8));
    out.push(Math.max(1, base * (1 + (r() - 0.5) * 0.06)));
  }
  return out;
}

export function pumpPhase(day: number): "quiet" | "promotion" | "selling" | "after" {
  return day < PUMP.buyEnd ? "quiet" : day < PUMP.pumpEnd ? "promotion" : day < PUMP.sellEnd ? "selling" : "after";
}

/* ---------------------------------------------------------------------------
 * FAKE PLATFORM. The balance on the screen is a number the operator types.
 * ------------------------------------------------------------------------- */

export const FAKE_DEPOSITS = [250, 1000, 2500, 5000, 10000, 20000] as const;
/** the one small withdrawal that is allowed early, to earn trust */
export const FAKE_TEASER = 50;

export function fakePlatform(deposits: number): { sent: number; screen: number; back: number } {
  let sent = 0;
  let screen = 0;
  for (let i = 0; i < deposits; i++) {
    sent += FAKE_DEPOSITS[i];
    // each deposit is followed by a run of invented "profit": 40% on whatever the screen showed
    screen = (screen + FAKE_DEPOSITS[i]) * 1.4;
  }
  const back = deposits >= 1 ? FAKE_TEASER : 0;
  return { sent, screen: Math.round(screen - back), back };
}

/* ---------------------------------------------------------------------------
 * "GUARANTEED" SIGNALS. Tell half the list the price will rise and half that
 * it will fall. Keep writing to the half that was told right. Repeat.
 * ------------------------------------------------------------------------- */

export const SIGNAL_START = 512;
export const signalLeft = (rounds: number) => SIGNAL_START / Math.pow(2, rounds);

/* ---------------------------------------------------------------------------
 * "LET ME TRADE YOUR ACCOUNT". Each month the account wins or loses the same
 * percentage on a coin flip: no skill, no edge. The manager takes a share of
 * every winning month and gives nothing back in a losing one.
 * ------------------------------------------------------------------------- */

export const MANAGED = { accounts: 200, months: 24, start: 1000, fee: 0.3 } as const;

export type Managed = { paths: number[][]; meanFee: number; below: number; halved: number; median: number };

/** `swing` is the size of each month's win or loss, as a share of the account (0.2 = 20%) */
export function managed(swing: number): Managed {
  const paths: number[][] = [];
  const ends: number[] = [];
  let fees = 0;
  for (let a = 0; a < MANAGED.accounts; a++) {
    const r = seededRng(9000 + a * 77);
    let v: number = MANAGED.start;
    const path = [v];
    for (let m = 0; m < MANAGED.months; m++) {
      if (r() < 0.5) {
        const gain = v * swing;
        fees += gain * MANAGED.fee;
        v += gain * (1 - MANAGED.fee);
      } else v -= v * swing;
      path.push(v);
    }
    ends.push(v);
    if (a < 24) paths.push(path);
  }
  const sorted = [...ends].sort((x, y) => x - y);
  return {
    paths,
    meanFee: fees / MANAGED.accounts,
    below: ends.filter((e) => e < MANAGED.start).length,
    halved: ends.filter((e) => e < MANAGED.start / 2).length,
    median: (sorted[MANAGED.accounts / 2 - 1] + sorted[MANAGED.accounts / 2]) / 2,
  };
}

/* ---------------------------------------------------------------------------
 * FEES BEFORE THE MONEY. Advance-fee fraud and the recovery room share one
 * piece of arithmetic: each payment is followed by a reason for another.
 * ------------------------------------------------------------------------- */

export const ADVANCE = { prize: 250000, fees: [150, 400, 900, 1800, 3500, 6000] } as const;
export const RECOVERY = { first: 10000, fees: [300, 600, 1000, 1500] } as const;

export const sumTo = (list: readonly number[], n: number) => list.slice(0, n).reduce((s, x) => s + x, 0);
