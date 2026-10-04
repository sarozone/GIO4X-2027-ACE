/**
 * ALLOCATION — how one funding wallet is divided between trading accounts.
 *
 * A pure module with no imports. It is the arithmetic behind the demonstration
 * at /trading/funding/allocation and is proved by scripts/test-allocation.mjs.
 * It moves no money and opens no account: it only says what a split would be.
 *
 * The rules it keeps:
 *   1. Every amount is a whole number of minor units (cents). Percentages are
 *      whole basis points (hundredths of one per cent) and a conversion rate is
 *      a whole number of millionths. Nothing is ever held as a fraction, and
 *      the two multiplications that could outgrow a safe integer are done in
 *      BigInt, so nothing is lost to floating point.
 *   2. The allocations plus what stays in the wallet always equal the net
 *      amount exactly. A leftover cent is given by a stated rule (largest
 *      remainder first, ties to the first destination) and is reported.
 *   3. It never changes what was asked for. A request that cannot be carried
 *      out comes back with the reasons and the options, not with a quietly
 *      adjusted split, and it never throws.
 *   4. Carrying out a plan is modelled transfer by transfer: one that fails
 *      leaves its money in the wallet, the totals still reconcile, and a
 *      transfer that is done is never done twice.
 */

/* ---- what goes in ----------------------------------------------------------- */

export type Mode = "single" | "equal" | "percent" | "exact";

export const MODES: { key: Mode; name: string; line: string }[] = [
  { key: "single", name: "All to one", line: "The whole net amount goes to one account." },
  { key: "equal", name: "Equal split", line: "The net amount is divided equally between the accounts." },
  { key: "percent", name: "Percentages", line: "Each account takes a percentage of the net amount. Less than 100% in total leaves the rest in the wallet." },
  { key: "exact", name: "Exact amounts", line: "Each account takes the amount typed. Less than the net amount in total leaves the rest in the wallet." },
];

/** A trading account that can receive funds. `minMinor` is the least it accepts in one funding. */
export type Destination = { id: string; label: string; minMinor: number };

/** A conversion into the account currency: `rateMicro` is the rate in millionths (1.25 is 1,250,000). */
export type Conversion = { rateMicro: number; costMinor: number };

export type Funding = {
  grossMinor: number;
  feeMinor: number;
  conversion?: Conversion | null;
  /** a deposit that has been sent but has not arrived: it cannot be allocated */
  pending?: boolean;
};

export type Request =
  | { mode: "single"; to: string }
  | { mode: "equal" }
  | { mode: "percent"; basisPoints: Record<string, number> }
  | { mode: "exact"; amounts: Record<string, number> };

/* ---- what comes out --------------------------------------------------------- */

export type IssueCode =
  | "bad-amount"
  | "bad-percentage"
  | "bad-rate"
  | "fee-exceeds-deposit"
  | "nothing-to-allocate"
  | "pending"
  | "no-destination"
  | "unknown-destination"
  | "over-allocation"
  | "below-minimum";

export type Issue = {
  code: IssueCode;
  message: string;
  /** the destination it concerns, where it concerns one */
  destination?: string;
  /** below-minimum: how much more the destination would need */
  shortfallMinor?: number;
  /** over-allocation: how much more was asked for than there is */
  overByMinor?: number;
  /** what the person can do about it: the engine never does it for them */
  options: string[];
};

export const OPTIONS = {
  split: "Change the split.",
  one: "Fund one platform first.",
  wallet: "Keep the amount in the wallet.",
  wait: "Wait until the deposit has arrived.",
  figures: "Correct the figure.",
} as const;

/** How the net amount was reached, step by step. */
export type Net = {
  grossMinor: number;
  feeMinor: number;
  afterFeeMinor: number;
  /** after conversion and before its cost; null when there is no conversion */
  convertedMinor: number | null;
  /** true when the conversion produced a fraction of a cent, which is dropped (always rounded down) */
  conversionRoundedDown: boolean;
  conversionCostMinor: number;
  netMinor: number;
  pending: boolean;
};

export type Line = {
  id: string;
  label: string;
  minMinor: number;
  amountMinor: number;
  /** the share of the net amount this line really is, recomputed from the amount, in basis points */
  shareBp: number;
  /** percentage mode: what was asked for, in basis points */
  askedBp: number | null;
  /** cents this line received under the rounding rule (0 or 1) */
  roundingCents: number;
};

export type Rounding = { cents: number; to: { id: string; label: string; cents: number }[]; rule: string };

export const ROUNDING_RULE = "Each share is rounded down to a whole cent. The cents left over go one at a time to the destination with the largest remainder; where remainders are equal, to the first destination listed.";

export type Plan = {
  /** true when the plan can be carried out exactly as asked */
  ok: boolean;
  /** identifies this plan: carrying it out twice under the same key moves nothing the second time */
  key: string;
  mode: Mode;
  net: Net;
  lines: Line[];
  allocatedMinor: number;
  /** what stays in the wallet; negative only when more was asked for than there is (and `ok` is false) */
  walletMinor: number;
  walletBp: number;
  rounding: Rounding | null;
  issues: Issue[];
};

/* ---- integer arithmetic ----------------------------------------------------- */

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;

/** floor(a × b ÷ d) and the remainder, exactly. All three are non-negative safe integers; d > 0. */
export function mulDiv(a: number, b: number, d: number): { q: number; r: number } {
  const p = BigInt(a) * BigInt(b);
  const D = BigInt(d);
  return { q: Number(p / D), r: Number(p % D) };
}

/** A share in basis points, rounded half up: 500.01 of 1,000.01 is 5,000 (50.00%). */
export function shareBp(amountMinor: number, netMinor: number): number {
  if (!isCount(amountMinor) || !isCount(netMinor) || netMinor === 0) return 0;
  const { q, r } = mulDiv(amountMinor, 10000, netMinor);
  return r * 2 >= netMinor ? q + 1 : q;
}

/** The amount a percentage stands for, rounded down to a cent: the opposite view of `shareBp`. */
export function amountOfBp(bp: number, netMinor: number): number {
  if (!isCount(bp) || !isCount(netMinor)) return 0;
  return mulDiv(netMinor, bp, 10000).q;
}

/* ---- the net amount --------------------------------------------------------- */

const describe = (n: unknown) => (typeof n !== "number" || !Number.isFinite(n) ? "is not a number" : n < 0 ? "is negative" : "is not a whole number of cents");

export function netOf(funding: Funding): { net: Net; issues: Issue[] } {
  const issues: Issue[] = [];
  const bad = (what: string, v: unknown) => issues.push({ code: "bad-amount", message: `${what} ${describe(v)}. Amounts are whole cents and cannot be negative.`, options: [OPTIONS.figures] });
  const conv = funding.conversion ?? null;
  if (!isCount(funding.grossMinor)) bad("The deposit", funding.grossMinor);
  if (!isCount(funding.feeMinor)) bad("The fee", funding.feeMinor);
  if (conv) {
    if (!isCount(conv.rateMicro) || conv.rateMicro === 0) issues.push({ code: "bad-rate", message: "The conversion rate must be greater than zero, with no more than six decimal places.", options: [OPTIONS.figures] });
    if (!isCount(conv.costMinor)) bad("The conversion cost", conv.costMinor);
  }
  const pending = funding.pending === true;
  const empty: Net = { grossMinor: isCount(funding.grossMinor) ? funding.grossMinor : 0, feeMinor: isCount(funding.feeMinor) ? funding.feeMinor : 0, afterFeeMinor: 0, convertedMinor: null, conversionRoundedDown: false, conversionCostMinor: 0, netMinor: 0, pending };
  if (issues.length) return { net: empty, issues };

  const fee = { code: "fee-exceeds-deposit" as const, options: [OPTIONS.figures] };
  if (funding.feeMinor > funding.grossMinor) {
    return { net: empty, issues: [{ ...fee, message: `The fee (${formatMinor(funding.feeMinor)}) is more than the deposit (${formatMinor(funding.grossMinor)}).` }] };
  }
  const afterFeeMinor = funding.grossMinor - funding.feeMinor;
  let convertedMinor: number | null = null;
  let conversionRoundedDown = false;
  let conversionCostMinor = 0;
  let netMinor = afterFeeMinor;
  if (conv) {
    const { q, r } = mulDiv(afterFeeMinor, conv.rateMicro, 1_000_000);
    if (!Number.isSafeInteger(q)) {
      return { net: { ...empty, afterFeeMinor }, issues: [{ code: "bad-rate", message: "The converted amount is too large to work with.", options: [OPTIONS.figures] }] };
    }
    convertedMinor = q;
    conversionRoundedDown = r > 0;
    conversionCostMinor = conv.costMinor;
    if (conversionCostMinor > convertedMinor) {
      return { net: { ...empty, afterFeeMinor, convertedMinor, conversionRoundedDown, conversionCostMinor }, issues: [{ ...fee, message: `The conversion cost (${formatMinor(conversionCostMinor)}) is more than the converted amount (${formatMinor(convertedMinor)}).` }] };
    }
    netMinor = convertedMinor - conversionCostMinor;
  }
  return { net: { grossMinor: funding.grossMinor, feeMinor: funding.feeMinor, afterFeeMinor, convertedMinor, conversionRoundedDown, conversionCostMinor, netMinor, pending }, issues };
}

/* ---- the plan --------------------------------------------------------------- */

/** FNV-1a over the plan's own figures: the same plan always has the same key. */
function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Work out a plan. `requestId` names the request the person made (one press of
 * "review"): the same request and the same figures always give the same key.
 */
export function plan(funding: Funding, destinations: Destination[], request: Request, requestId = "1"): Plan {
  const { net, issues } = netOf(funding);
  const N = net.netMinor;
  const seen = new Set<string>();
  const dests: Destination[] = [];
  for (const d of Array.isArray(destinations) ? destinations : []) {
    if (!d || typeof d.id !== "string" || seen.has(d.id)) continue;
    seen.add(d.id);
    dests.push(d);
    if (!isCount(d.minMinor)) issues.push({ code: "bad-amount", destination: d.id, message: `The minimum for ${d.label} ${describe(d.minMinor)}. Amounts are whole cents and cannot be negative.`, options: [OPTIONS.figures] });
  }
  const mode: Mode = request.mode;
  const amounts = dests.map(() => 0);
  const asked: (number | null)[] = dests.map(() => null);
  const extra = dests.map(() => 0);
  const inputsOk = issues.length === 0;

  if (inputsOk && dests.length === 0) issues.push({ code: "no-destination", message: "No trading account has been chosen to receive funds.", options: [OPTIONS.wallet] });
  if (inputsOk && dests.length > 0 && N === 0) issues.push({ code: "nothing-to-allocate", message: "Nothing is left to allocate after the fee and the conversion.", options: [OPTIONS.figures] });

  if (inputsOk && dests.length > 0) {
    if (request.mode === "single") {
      const i = dests.findIndex((d) => d.id === request.to);
      if (i < 0) issues.push({ code: "unknown-destination", message: "The account chosen to receive everything is not one of the accounts listed.", options: [OPTIONS.split] });
      else amounts[i] = N;
    } else if (request.mode === "equal") {
      // N ÷ n rounded down, then the N mod n cents left over. Every remainder is equal, so they go to the first destinations.
      const q = Math.floor(N / dests.length);
      const r = N - q * dests.length;
      dests.forEach((_, i) => {
        amounts[i] = q + (i < r ? 1 : 0);
        extra[i] = i < r ? 1 : 0;
      });
    } else if (request.mode === "percent") {
      const bps = dests.map((d) => request.basisPoints?.[d.id] ?? 0);
      let fine = true;
      bps.forEach((bp, i) => {
        if (!isCount(bp)) {
          fine = false;
          issues.push({ code: "bad-percentage", destination: dests[i]!.id, message: `The percentage for ${dests[i]!.label} must be zero or more, with no more than two decimal places.`, options: [OPTIONS.figures] });
        }
      });
      if (fine) {
        const total = bps.reduce((s, b) => s + b, 0);
        const parts = bps.map((bp) => mulDiv(N, bp, 10000));
        bps.forEach((bp, i) => {
          asked[i] = bp;
          amounts[i] = parts[i]!.q;
        });
        if (total > 10000) {
          const want = amounts.reduce((s, a) => s + a, 0);
          issues.push({
            code: "over-allocation",
            overByMinor: want - N,
            message: `The percentages total ${formatBp(total)}, which is ${formatBp(total - 10000)} more than the whole. That would be ${formatMinor(want - N)} more than the ${formatMinor(N)} available.`,
            options: [OPTIONS.split, OPTIONS.one, OPTIONS.wallet],
          });
        } else {
          // the whole of what the percentages stand for, rounded down once; then each share rounded down; then the cents between the two
          const target = mulDiv(N, total, 10000).q;
          let left = target - amounts.reduce((s, a) => s + a, 0);
          const order = dests.map((_, i) => i).sort((a, b) => parts[b]!.r - parts[a]!.r || a - b);
          for (const i of order) {
            if (left <= 0) break;
            amounts[i]! += 1;
            extra[i] = 1;
            left -= 1;
          }
        }
      }
    } else {
      let fine = true;
      dests.forEach((d, i) => {
        const a = request.amounts?.[d.id] ?? 0;
        if (!isCount(a)) {
          fine = false;
          issues.push({ code: "bad-amount", destination: d.id, message: `The amount for ${d.label} ${describe(a)}. Amounts are whole cents and cannot be negative.`, options: [OPTIONS.figures] });
        } else amounts[i] = a;
      });
      if (!fine) amounts.fill(0);
      else {
        const want = amounts.reduce((s, a) => s + a, 0);
        if (want > N) {
          issues.push({
            code: "over-allocation",
            overByMinor: want - N,
            message: `The amounts total ${formatMinor(want)}, which is ${formatMinor(want - N)} more than the ${formatMinor(N)} available.`,
            options: [OPTIONS.split, OPTIONS.one, OPTIONS.wallet],
          });
        }
      }
    }
  }

  // a destination that is funded at all must reach its minimum; one left at zero is simply not funded yet
  dests.forEach((d, i) => {
    const a = amounts[i]!;
    if (isCount(d.minMinor) && a > 0 && a < d.minMinor) {
      issues.push({
        code: "below-minimum",
        destination: d.id,
        shortfallMinor: d.minMinor - a,
        message: `${d.label} would receive ${formatMinor(a)}, which is ${formatMinor(d.minMinor - a)} short of its minimum of ${formatMinor(d.minMinor)}.`,
        options: [OPTIONS.split, OPTIONS.one, OPTIONS.wallet],
      });
    }
  });

  if (net.pending) issues.push({ code: "pending", message: "This deposit is pending: it has been sent but has not arrived. Pending funds cannot be allocated. The split below is what was asked for, and none of it can be carried out yet.", options: [OPTIONS.wait] });

  const allocatedMinor = amounts.reduce((s, a) => s + a, 0);
  const walletMinor = N - allocatedMinor;
  const lines: Line[] = dests.map((d, i) => ({ id: d.id, label: d.label, minMinor: isCount(d.minMinor) ? d.minMinor : 0, amountMinor: amounts[i]!, shareBp: shareBp(amounts[i]!, N), askedBp: asked[i] ?? null, roundingCents: extra[i]! }));
  const given = lines.filter((l) => l.roundingCents > 0);
  const rounding: Rounding | null = given.length ? { cents: given.reduce((s, l) => s + l.roundingCents, 0), to: given.map((l) => ({ id: l.id, label: l.label, cents: l.roundingCents })), rule: ROUNDING_RULE } : null;
  const key = `gx-${String(requestId)}-${fingerprint(`${N}|${mode}|${lines.map((l) => `${l.id}:${l.amountMinor}`).join(",")}`)}`;

  return { ok: issues.length === 0, key, mode, net, lines, allocatedMinor, walletMinor, walletBp: walletMinor > 0 ? shareBp(walletMinor, N) : 0, rounding, issues };
}

/* ---- carrying a plan out ---------------------------------------------------- */

/** The wallet and the accounts, as whole cents. `done` lists the transfers already made, by key. */
export type Ledger = { totalMinor: number; walletMinor: number; balances: Record<string, number>; done: string[] };

export type TransferStatus = "done" | "failed" | "already-done" | "nothing-to-move";
export type Transfer = { id: string; label: string; amountMinor: number; key: string; status: TransferStatus; note: string };

export type Execution = {
  /** false when the plan was refused outright: nothing was attempted and the ledger is unchanged */
  accepted: boolean;
  refusal: string | null;
  planKey: string;
  transfers: Transfer[];
  /** moved by this run alone */
  movedMinor: number;
  /** attempted by this run and still in the wallet */
  failedMinor: number;
  /** true when this run moved nothing because every transfer had already been made */
  repeat: boolean;
  ledger: Ledger;
  reconciles: boolean;
};

/** A wallet holding the plan's net amount, and each account at zero. */
export function openLedger(p: Plan): Ledger {
  const balances: Record<string, number> = {};
  for (const l of p.lines) balances[l.id] = 0;
  return { totalMinor: p.net.netMinor, walletMinor: p.net.netMinor, balances, done: [] };
}

/** The wallet plus every account equals the total, to the cent. */
export function reconciles(l: Ledger): boolean {
  return l.walletMinor >= 0 && l.walletMinor + Object.values(l.balances).reduce((s, b) => s + b, 0) === l.totalMinor;
}

/**
 * Carry a plan out, one transfer per funded destination. `succeeds` says, for
 * each destination, whether its transfer goes through. A failed transfer moves
 * nothing. A transfer already made under this plan's key is not made again, so
 * a second run of the same plan retries only what failed. The ledger passed in
 * is not altered: a new one is returned.
 */
export function execute(ledger: Ledger, p: Plan, succeeds: (id: string) => boolean): Execution {
  const next: Ledger = { totalMinor: ledger.totalMinor, walletMinor: ledger.walletMinor, balances: { ...ledger.balances }, done: [...ledger.done] };
  if (!p.ok) {
    const refusal = p.issues[0]?.message ?? "The plan cannot be carried out.";
    return { accepted: false, refusal, planKey: p.key, transfers: [], movedMinor: 0, failedMinor: 0, repeat: false, ledger: next, reconciles: reconciles(next) };
  }
  let movedMinor = 0;
  let failedMinor = 0;
  let attempted = 0;
  let already = 0;
  const transfers: Transfer[] = p.lines.map((l) => {
    const key = `${p.key}:${l.id}`;
    const base = { id: l.id, label: l.label, amountMinor: l.amountMinor, key };
    if (l.amountMinor === 0) return { ...base, status: "nothing-to-move" as const, note: "Nothing was allocated to this account." };
    if (next.done.includes(key)) {
      already += 1;
      return { ...base, status: "already-done" as const, note: "Already made under this plan. Not made again." };
    }
    attempted += 1;
    if (next.walletMinor < l.amountMinor) {
      failedMinor += l.amountMinor;
      return { ...base, status: "failed" as const, note: "The wallet does not hold enough. Nothing was moved." };
    }
    let fine = false;
    try {
      fine = succeeds(l.id) === true;
    } catch {
      fine = false;
    }
    if (!fine) {
      failedMinor += l.amountMinor;
      return { ...base, status: "failed" as const, note: "The transfer did not go through. The money is still in the wallet." };
    }
    next.walletMinor -= l.amountMinor;
    next.balances[l.id] = (next.balances[l.id] ?? 0) + l.amountMinor;
    next.done.push(key);
    movedMinor += l.amountMinor;
    return { ...base, status: "done" as const, note: "Moved from the wallet to the account." };
  });
  return { accepted: true, refusal: null, planKey: p.key, transfers, movedMinor, failedMinor, repeat: attempted === 0 && already > 0, ledger: next, reconciles: reconciles(next) };
}

/* ---- reading and writing figures -------------------------------------------- */

export type Parsed = { ok: true; value: number } | { ok: false; error: string };

/** Read a decimal typed by a person as a whole number scaled by 10^places, without passing through a float. */
function parseScaled(text: string, places: number, what: string, maxDigits: number): Parsed {
  const t = String(text ?? "").replace(/[\s,]/g, "");
  if (t === "") return { ok: false, error: `${what} is empty.` };
  if (/^[-−]/.test(t)) return { ok: false, error: `${what} cannot be negative.` };
  const m = /^(\d*)(?:\.(\d*))?$/.exec(t);
  if (!m || (m[1] === "" && (m[2] ?? "") === "")) return { ok: false, error: `${what} is not a number.` };
  const whole = m[1] === "" ? "0" : m[1]!;
  const frac = m[2] ?? "";
  if (frac.length > places) return { ok: false, error: `${what} has more than ${places === 2 ? "two" : "six"} decimal places.` };
  if (whole.replace(/^0+/, "").length > maxDigits) return { ok: false, error: `${what} is too large.` };
  return { ok: true, value: Number(whole) * 10 ** places + Number(frac.padEnd(places, "0") || "0") };
}

/** "1,000.01" → 100001 cents. */
export const parseMinor = (text: string, what = "The amount"): Parsed => parseScaled(text, 2, what, 11);
/** "33.33" → 3333 basis points. */
export const parseBp = (text: string, what = "The percentage"): Parsed => parseScaled(text, 2, what, 5);
/** "1.25" → 1,250,000 millionths. */
export const parseRateMicro = (text: string, what = "The rate"): Parsed => {
  const p = parseScaled(text, 6, what, 6);
  return p.ok && p.value === 0 ? { ok: false, error: `${what} must be greater than zero.` } : p;
};

/** 100001 → "1,000.01". A negative amount is written with a minus sign. */
export function formatMinor(minor: number): string {
  if (typeof minor !== "number" || !Number.isFinite(minor)) return "—";
  const n = Math.abs(Math.trunc(minor));
  const whole = Math.floor(n / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${minor < 0 ? "−" : ""}${whole}.${String(n % 100).padStart(2, "0")}`;
}

/** 3333 → "33.33%". */
export function formatBp(bp: number): string {
  if (typeof bp !== "number" || !Number.isFinite(bp)) return "—";
  const n = Math.abs(Math.trunc(bp));
  return `${bp < 0 ? "−" : ""}${Math.floor(n / 100)}.${String(n % 100).padStart(2, "0")}%`;
}

/** The plain figure for a field: 100001 → "1000.01", 3333 → "33.33". */
export const plainMinor = (minor: number): string => formatMinor(minor).replace(/,/g, "");
export const plainBp = (bp: number): string => formatBp(bp).replace("%", "");
