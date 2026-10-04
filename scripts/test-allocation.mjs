/**
 * Proves the arithmetic of the allocation engine (src/components/funding/allocation.ts).
 *
 *   node scripts/test-allocation.mjs
 *
 * Needs Node 22.18 or later (it imports TypeScript directly; the engine has no
 * imports of its own). Hand-worked cases with the working written beside each
 * expectation, then properties that must hold for every split: the allocations
 * plus the wallet equal the net amount to the cent, and nothing is moved twice.
 *
 * Every amount is in cents: 100000 is 1,000.00. Percentages are basis points:
 * 7500 is 75.00%.
 */
import * as A from "../src/components/funding/allocation.ts";

let passed = 0;
const failures = [];
function ok(name, cond, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
function eq(name, got, want) {
  ok(name, got === want, `got ${got}, expected ${want}`);
}
const sum = (p) => p.lines.reduce((s, l) => s + l.amountMinor, 0);
const issue = (p, code) => p.issues.find((i) => i.code === code);

const MT5 = { id: "mt5", label: "MetaTrader 5", minMinor: 0 };
const RAPTOR = { id: "raptor", label: "777 Raptor", minMinor: 0 };
const BOTH = [MT5, RAPTOR];
const deposit = (grossMinor, more = {}) => ({ grossMinor, feeMinor: 0, ...more });

/* ---- 1. the net amount ------------------------------------------------------ */
{
  // 1,000.00 with no fee and no conversion is 1,000.00
  eq("net: nothing taken", A.netOf(deposit(100000)).net.netMinor, 100000);
  // 1,000.00 − 12.50 = 987.50
  const f = A.netOf(deposit(100000, { feeMinor: 1250 })).net;
  eq("net: after the fee", f.afterFeeMinor, 98750);
  eq("net: the fee alone", f.netMinor, 98750);
  // (1,000.00 − 10.00) × 0.92 = 910.80; less a cost of 5.00 = 905.80
  const c = A.netOf(deposit(100000, { feeMinor: 1000, conversion: { rateMicro: 920000, costMinor: 500 } })).net;
  eq("net: converted", c.convertedMinor, 91080);
  eq("net: less the conversion cost", c.netMinor, 90580);
  ok("net: no fraction of a cent to drop", c.conversionRoundedDown === false);
  // 100.01 × 1.333333 = 133.346633…: the fraction of a cent is dropped, so 133.34, and it is reported
  const r = A.netOf(deposit(10001, { conversion: { rateMicro: 1333333, costMinor: 0 } })).net;
  eq("net: a conversion rounds down to the cent", r.convertedMinor, 13334);
  ok("net: and says that it did", r.conversionRoundedDown === true);
  // a large amount at a long rate stays exact: (10¹² − 1) cents × (10⁹ − 1) millionths ÷ 10⁶
  // = 10¹⁵ − 10⁶ − 10³ + 0.000001 cents, rounded down: 999,999,998,999,000 cents (9,999,999,989,990.00)
  eq("net: no floating point in a large conversion", A.netOf(deposit(999999999999, { conversion: { rateMicro: 999999999, costMinor: 0 } })).net.convertedMinor, 999999998999000);

  const neg = A.netOf(deposit(-100));
  ok("net: a negative deposit is reported, not thrown", neg.issues[0]?.code === "bad-amount" && neg.net.netMinor === 0);
  ok("net: half a cent is reported", A.netOf(deposit(100.5)).issues[0]?.code === "bad-amount");
  ok("net: a fee larger than the deposit is reported", A.netOf(deposit(1000, { feeMinor: 1001 })).issues[0]?.code === "fee-exceeds-deposit");
  ok("net: a rate of zero is reported", A.netOf(deposit(1000, { conversion: { rateMicro: 0, costMinor: 0 } })).issues[0]?.code === "bad-rate");
  ok("net: a conversion cost larger than the converted amount is reported", A.netOf(deposit(1000, { conversion: { rateMicro: 1000000, costMinor: 1001 } })).issues[0]?.code === "fee-exceeds-deposit");
}

/* ---- 2. the four modes, by hand --------------------------------------------- */
{
  // all to one: 1,000.00 to MetaTrader 5, nothing to Raptor, nothing left
  const one = A.plan(deposit(100000), BOTH, { mode: "single", to: "mt5" });
  ok("single: valid", one.ok);
  eq("single: all of it", one.lines[0].amountMinor, 100000);
  eq("single: none to the other", one.lines[1].amountMinor, 0);
  eq("single: nothing in the wallet", one.walletMinor, 0);
  eq("single: 100.00%", one.lines[0].shareBp, 10000);

  // 1,000.00 ÷ 2 = 500.00 and 500.00
  const even = A.plan(deposit(100000), BOTH, { mode: "equal" });
  ok("equal: valid", even.ok);
  eq("equal: first half", even.lines[0].amountMinor, 50000);
  eq("equal: second half", even.lines[1].amountMinor, 50000);
  eq("equal: nothing in the wallet", even.walletMinor, 0);
  ok("equal: no rounding to report", even.rounding === null);

  // 1,000.00 × 75% = 750.00; 1,000.00 × 25% = 250.00
  const q = A.plan(deposit(100000), BOTH, { mode: "percent", basisPoints: { mt5: 7500, raptor: 2500 } });
  ok("75/25: valid", q.ok);
  eq("75/25: three quarters", q.lines[0].amountMinor, 75000);
  eq("75/25: one quarter", q.lines[1].amountMinor, 25000);
  eq("75/25: nothing in the wallet", q.walletMinor, 0);
  ok("75/25: no rounding to report", q.rounding === null);
  ok("75/25: the share read back from the amount is the share asked for", q.lines[0].shareBp === 7500 && q.lines[1].shareBp === 2500);

  // 1,000.01 ÷ 2 = 500.005 each: 500.00 and 500.00 rounded down leaves one cent; the remainders tie, so the first takes it
  const odd = A.plan(deposit(100001), BOTH, { mode: "equal" });
  ok("odd cent: valid", odd.ok);
  eq("odd cent: the first takes it", odd.lines[0].amountMinor, 50001);
  eq("odd cent: the second does not", odd.lines[1].amountMinor, 50000);
  eq("odd cent: nothing in the wallet", odd.walletMinor, 0);
  ok("odd cent: reported", odd.rounding !== null && odd.rounding.cents === 1 && odd.rounding.to.length === 1 && odd.rounding.to[0].id === "mt5");
  ok("odd cent: the rule is stated", odd.rounding.rule === A.ROUNDING_RULE && A.ROUNDING_RULE.includes("largest remainder"));
  eq("odd cent: marked on the line", odd.lines[0].roundingCents, 1);
  // the same split asked for as 50% and 50% gives the same answer
  const oddPct = A.plan(deposit(100001), BOTH, { mode: "percent", basisPoints: { mt5: 5000, raptor: 5000 } });
  ok("odd cent, as 50/50: the same", oddPct.lines[0].amountMinor === 50001 && oddPct.lines[1].amountMinor === 50000 && oddPct.rounding.cents === 1);

  // 600.00 + 250.00 = 850.00 of 1,000.00; 150.00 stays in the wallet
  const exact = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 60000, raptor: 25000 } });
  ok("600 + 250: valid", exact.ok);
  eq("600 + 250: first", exact.lines[0].amountMinor, 60000);
  eq("600 + 250: second", exact.lines[1].amountMinor, 25000);
  eq("600 + 250: allocated", exact.allocatedMinor, 85000);
  eq("600 + 250: 150.00 kept", exact.walletMinor, 15000);
  // 600 ÷ 1,000 = 60.00%, 250 ÷ 1,000 = 25.00%, 150 ÷ 1,000 = 15.00%
  ok("600 + 250: percentages recomputed from the amounts", exact.lines[0].shareBp === 6000 && exact.lines[1].shareBp === 2500 && exact.walletBp === 1500);
  // and the other way round: 60% and 25% of 1,000.00 are the same amounts
  const back = A.plan(deposit(100000), BOTH, { mode: "percent", basisPoints: { mt5: exact.lines[0].shareBp, raptor: exact.lines[1].shareBp } });
  ok("600 + 250: and the amounts from those percentages agree", back.lines[0].amountMinor === 60000 && back.lines[1].amountMinor === 25000 && back.walletMinor === 15000);

  // 100.00 ÷ 3 = 33.33 each with one cent over: 33.34, 33.33, 33.33
  const THREE = [MT5, RAPTOR, { id: "third", label: "A third account", minMinor: 0 }];
  const thirds = A.plan(deposit(10000), THREE, { mode: "equal" });
  ok("thirds: 33.34, 33.33, 33.33", thirds.lines.map((l) => l.amountMinor).join() === "3334,3333,3333");
  eq("thirds: nothing in the wallet", thirds.walletMinor, 0);
  ok("thirds: one cent, to the first", thirds.rounding.cents === 1 && thirds.rounding.to[0].id === "mt5");
  // 33.33% each is 99.99% of 100.00: 33.33 each exactly, and the last cent stays in the wallet
  const pct3 = A.plan(deposit(10000), THREE, { mode: "percent", basisPoints: { mt5: 3333, raptor: 3333, third: 3333 } });
  ok("thirds as 33.33% each: 33.33 three times", pct3.lines.every((l) => l.amountMinor === 3333));
  eq("thirds as 33.33% each: one cent kept", pct3.walletMinor, 1);
  ok("thirds as 33.33% each: no rounding", pct3.rounding === null);
  // 200.00 ÷ 3 = 66.666…: two cents over, to the first two
  ok("two cents over go to the first two", A.plan(deposit(20000), THREE, { mode: "equal" }).lines.map((l) => l.amountMinor).join() === "6667,6667,6666");

  // largest remainder first: 0.10 at 25% / 26% / 49% is 0.025, 0.026, 0.049 → 2, 2, 4 cents and 2 over;
  // the remainders are 0.5, 0.6 and 0.9 of a cent, so the third takes one, then the second
  const lr = A.plan(deposit(10), THREE, { mode: "percent", basisPoints: { mt5: 2500, raptor: 2600, third: 4900 } });
  ok("largest remainder first", lr.lines.map((l) => l.amountMinor).join() === "2,3,5", lr.lines.map((l) => l.amountMinor).join());
  ok("largest remainder: reported for the two that gained", lr.rounding.cents === 2 && lr.rounding.to.map((t) => t.id).join() === "raptor,third");

  // percentages below 100: 30% and 20% of 1,000.00 are 300.00 and 200.00; 500.00 stays
  const part = A.plan(deposit(100000), BOTH, { mode: "percent", basisPoints: { mt5: 3000, raptor: 2000 } });
  ok("30/20: valid, 500.00 kept", part.ok && part.lines[0].amountMinor === 30000 && part.lines[1].amountMinor === 20000 && part.walletMinor === 50000);
  // 30% and 30% of 0.05 are 1.5 cents each; 60% of 0.05 is 3 cents; 1 + 1 leaves one, to the first; 2 cents stay
  const tiny = A.plan(deposit(5), BOTH, { mode: "percent", basisPoints: { mt5: 3000, raptor: 3000 } });
  ok("30/30 of 0.05: 2 and 1, 2 kept", tiny.lines[0].amountMinor === 2 && tiny.lines[1].amountMinor === 1 && tiny.walletMinor === 2);

  // the split is taken on the net amount: 1,000.00 − 20.00 = 980.00, halved is 490.00 each
  const netted = A.plan(deposit(100000, { feeMinor: 2000 }), BOTH, { mode: "equal" });
  ok("the split is on the net, not the gross", netted.lines[0].amountMinor === 49000 && netted.lines[1].amountMinor === 49000);
}

/* ---- 3. refusals: reasons and options, nothing altered ----------------------- */
{
  // 90/10 of 1,000.00 is 900.00 and 100.00; Raptor's example minimum is 250.00, so it is 150.00 short
  const min = A.plan(deposit(100000), [MT5, { ...RAPTOR, minMinor: 25000 }], { mode: "percent", basisPoints: { mt5: 9000, raptor: 1000 } });
  ok("minimum: refused", min.ok === false);
  const below = issue(min, "below-minimum");
  ok("minimum: names the account", below?.destination === "raptor");
  eq("minimum: the shortfall", below?.shortfallMinor, 15000);
  ok("minimum: says so in words", below?.message.includes("150.00 short") && below?.message.includes("250.00"));
  ok("minimum: the three options", [A.OPTIONS.split, A.OPTIONS.one, A.OPTIONS.wallet].every((o) => below?.options.includes(o)));
  ok("minimum: the split asked for is shown unchanged", min.lines[0].amountMinor === 90000 && min.lines[1].amountMinor === 10000);
  ok("minimum: an account left at zero is not below its minimum", A.plan(deposit(100000), [MT5, { ...RAPTOR, minMinor: 25000 }], { mode: "single", to: "mt5" }).ok);
  ok("minimum: exactly the minimum is enough", A.plan(deposit(100000), [MT5, { ...RAPTOR, minMinor: 25000 }], { mode: "percent", basisPoints: { mt5: 7500, raptor: 2500 } }).ok);

  // 60% + 50% = 110%: ten points too many, 100.00 more than the 1,000.00 there is
  const over = A.plan(deposit(100000), BOTH, { mode: "percent", basisPoints: { mt5: 6000, raptor: 5000 } });
  ok("over 100%: refused", over.ok === false && issue(over, "over-allocation") !== undefined);
  eq("over 100%: by how much", issue(over, "over-allocation").overByMinor, 10000);
  ok("over 100%: not scaled back", over.lines[0].amountMinor === 60000 && over.lines[1].amountMinor === 50000);

  // 700.00 + 400.00 = 1,100.00 against 1,000.00: 100.00 over
  const overX = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 70000, raptor: 40000 } });
  ok("amounts over the net: refused", overX.ok === false);
  eq("amounts over the net: by how much", issue(overX, "over-allocation").overByMinor, 10000);
  ok("amounts over the net: not trimmed", overX.lines[0].amountMinor === 70000 && overX.lines[1].amountMinor === 40000);
  // the fee makes the difference: 500 + 500 fits 1,000.00 but not 1,000.00 − 0.01
  ok("amounts over the net by one cent after a fee", A.plan(deposit(100000, { feeMinor: 1 }), BOTH, { mode: "exact", amounts: { mt5: 50000, raptor: 50000 } }).ok === false);

  const negA = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: -100, raptor: 100 } });
  ok("a negative amount: refused with a reason", negA.ok === false && issue(negA, "bad-amount")?.destination === "mt5");
  const frac = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 100.5, raptor: 100 } });
  ok("a fraction of a cent: refused with a reason", frac.ok === false && issue(frac, "bad-amount") !== undefined);
  ok("a negative percentage: refused", A.plan(deposit(100000), BOTH, { mode: "percent", basisPoints: { mt5: -1, raptor: 100 } }).ok === false);
  ok("not a number: refused, not thrown", A.plan(deposit(Number.NaN), BOTH, { mode: "equal" }).ok === false);
  ok("no destination: refused", issue(A.plan(deposit(100000), [], { mode: "equal" }), "no-destination") !== undefined);
  ok("an unknown destination: refused", issue(A.plan(deposit(100000), BOTH, { mode: "single", to: "elsewhere" }), "unknown-destination") !== undefined);
  ok("nothing left after the fee: refused", issue(A.plan(deposit(1000, { feeMinor: 1000 }), BOTH, { mode: "equal" }), "nothing-to-allocate") !== undefined);

  // a pending deposit: the split is worked out so it can be seen, and none of it can be carried out
  const pend = A.plan(deposit(100000, { pending: true }), BOTH, { mode: "equal" });
  ok("pending: refused", pend.ok === false && issue(pend, "pending") !== undefined);
  ok("pending: the option is to wait", issue(pend, "pending").options.includes(A.OPTIONS.wait));
  const led = A.openLedger(pend);
  const tried = A.execute(led, pend, () => true);
  ok("pending: carrying it out is refused", tried.accepted === false && tried.refusal !== null && tried.transfers.length === 0);
  ok("pending: nothing moved", tried.ledger.walletMinor === 100000 && tried.ledger.balances.mt5 === 0 && tried.ledger.balances.raptor === 0 && tried.reconciles);
  ok("an over-allocated plan cannot be carried out either", A.execute(A.openLedger(overX), overX, () => true).accepted === false);
}

/* ---- 4. carrying a plan out -------------------------------------------------- */
{
  // 600.00 to MetaTrader 5, 250.00 to Raptor, 150.00 kept
  const p = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 60000, raptor: 25000 } }, "a");
  const start = A.openLedger(p);
  ok("ledger: the wallet opens with the net amount", start.walletMinor === 100000 && A.reconciles(start));

  // Raptor's transfer fails: 600.00 moves, 250.00 does not; the wallet holds 1,000.00 − 600.00 = 400.00
  const first = A.execute(start, p, (id) => id !== "raptor");
  ok("partial: accepted", first.accepted);
  ok("partial: one done, one failed", first.transfers[0].status === "done" && first.transfers[1].status === "failed");
  eq("partial: moved", first.movedMinor, 60000);
  eq("partial: failed", first.failedMinor, 25000);
  eq("partial: MetaTrader 5 has 600.00", first.ledger.balances.mt5, 60000);
  eq("partial: Raptor has nothing", first.ledger.balances.raptor, 0);
  eq("partial: the wallet still holds the failed 250.00 and the kept 150.00", first.ledger.walletMinor, 40000);
  // 400.00 + 600.00 + 0.00 = 1,000.00
  ok("partial: the totals reconcile", first.reconciles && first.ledger.walletMinor + first.ledger.balances.mt5 + first.ledger.balances.raptor === 100000);
  ok("partial: the ledger passed in was not altered", start.walletMinor === 100000 && start.balances.mt5 === 0 && start.done.length === 0);

  // the same plan again while Raptor still fails: MetaTrader 5 is not paid twice, and nothing changes
  const again = A.execute(first.ledger, p, (id) => id !== "raptor");
  ok("repeat while failing: the done transfer is not repeated", again.transfers[0].status === "already-done" && again.transfers[1].status === "failed");
  ok("repeat while failing: nothing changed", again.movedMinor === 0 && JSON.stringify(again.ledger) === JSON.stringify(first.ledger));

  // the retry goes through: only the 250.00 moves; the wallet holds the 150.00 that was kept
  const retry = A.execute(again.ledger, p, () => true);
  ok("retry: only the failed transfer is made", retry.transfers[0].status === "already-done" && retry.transfers[1].status === "done");
  eq("retry: moved", retry.movedMinor, 25000);
  ok("retry: 600.00, 250.00 and 150.00", retry.ledger.balances.mt5 === 60000 && retry.ledger.balances.raptor === 25000 && retry.ledger.walletMinor === 15000 && retry.reconciles);

  // the same plan, the same key, a third and fourth time: nothing changes
  const twice = A.execute(retry.ledger, p, () => true);
  ok("same key again: marked as a repeat", twice.repeat === true && twice.transfers.every((t) => t.status === "already-done"));
  ok("same key again: nothing moved", twice.movedMinor === 0 && JSON.stringify(twice.ledger) === JSON.stringify(retry.ledger) && twice.reconciles);
  const thrice = A.execute(twice.ledger, p, () => true);
  ok("and again: still nothing", JSON.stringify(thrice.ledger) === JSON.stringify(retry.ledger));

  // the key belongs to the plan: the same figures and request give the same key, anything else another
  const same = A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 60000, raptor: 25000 } }, "a");
  ok("key: the same plan has the same key", same.key === p.key);
  ok("key: another request has another", A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 60000, raptor: 25000 } }, "b").key !== p.key);
  ok("key: other amounts have another", A.plan(deposit(100000), BOTH, { mode: "exact", amounts: { mt5: 60000, raptor: 25001 } }, "a").key !== p.key);
  ok("key: each transfer has its own", first.transfers[0].key === `${p.key}:mt5` && first.transfers[1].key === `${p.key}:raptor`);

  // a second, different plan on a wallet that no longer holds enough fails that transfer and moves nothing
  const greedy = A.plan(deposit(100000), BOTH, { mode: "single", to: "raptor" }, "c");
  const short = A.execute(retry.ledger, greedy, () => true);
  ok("not enough in the wallet: failed, nothing moved", short.transfers[1].status === "failed" && short.movedMinor === 0 && short.reconciles && short.ledger.walletMinor === 15000);
  // a check that throws is a transfer that failed
  const thrown = A.execute(start, p, () => {
    throw new Error("no answer");
  });
  ok("no answer from a platform counts as failed", thrown.transfers.every((t) => t.status === "failed") && thrown.ledger.walletMinor === 100000 && thrown.reconciles);
  // an account allocated nothing is neither done nor failed
  const lone = A.plan(deposit(100000), BOTH, { mode: "single", to: "mt5" }, "d");
  ok("nothing allocated, nothing to move", A.execute(A.openLedger(lone), lone, () => true).transfers[1].status === "nothing-to-move");
}

/* ---- 5. reading and writing figures ------------------------------------------ */
{
  eq("parse: 1,000.01", A.parseMinor("1,000.01").value, 100001);
  eq("parse: 0.1 is ten cents", A.parseMinor("0.1").value, 10);
  eq("parse: 250", A.parseMinor("250").value, 25000);
  // 0.29 × 100 in floating point is 28.999…: read as text it is 29 cents
  eq("parse: 0.29 is 29 cents, not 28", A.parseMinor("0.29").value, 29);
  eq("parse: 1.15", A.parseMinor("1.15").value, 115);
  ok("parse: three decimals are refused", A.parseMinor("1.005").ok === false);
  ok("parse: a negative is refused", A.parseMinor("-5").ok === false);
  ok("parse: words are refused", A.parseMinor("ten").ok === false && A.parseMinor("").ok === false && A.parseMinor(".").ok === false);
  eq("parse: 33.33%", A.parseBp("33.33").value, 3333);
  eq("parse: a rate of 1.25", A.parseRateMicro("1.25").value, 1250000);
  eq("parse: a rate of 0.000001", A.parseRateMicro("0.000001").value, 1);
  ok("parse: a rate of zero is refused", A.parseRateMicro("0").ok === false);
  ok("format: 1,000.01", A.formatMinor(100001) === "1,000.01");
  ok("format: 0.05", A.formatMinor(5) === "0.05");
  ok("format: 1,234,567.00", A.formatMinor(123456700) === "1,234,567.00");
  ok("format: 33.33%", A.formatBp(3333) === "33.33%");
  ok("format: back to a field", A.plainMinor(100001) === "1000.01" && A.plainBp(7500) === "75.00");
  // 500.01 of 1,000.01 is 50.0005% of it and 500.00 is 49.9995%: both are 50.00% to two places
  ok("share: recomputed and rounded half up", A.shareBp(50001, 100001) === 5000 && A.shareBp(50000, 100001) === 5000);
  eq("share: one third", A.shareBp(3333, 10000), 3333);
  eq("amount of 12.50% of 80.00", A.amountOfBp(1250, 8000), 1000);
}

/* ---- 6. properties: every split reconciles ----------------------------------- */
{
  // a small seeded generator, so the same cases run every time
  let s = 20270777;
  const rnd = (n) => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s % n;
  };
  for (let k = 0; k < 400; k++) {
    const n = 1 + rnd(4);
    const dests = Array.from({ length: n }, (_, i) => ({ id: `d${i}`, label: `Account ${i + 1}`, minMinor: 0 }));
    const gross = 1 + rnd(5000000);
    const fee = rnd(Math.min(gross, 5000));
    const conversion = k % 3 === 0 ? { rateMicro: 1 + rnd(3000000), costMinor: 0 } : null;
    const f = { grossMinor: gross, feeMinor: fee, conversion };
    const net = A.netOf(f).net.netMinor;
    if (net === 0) continue;

    const e = A.plan(f, dests, { mode: "equal" });
    ok(`#${k} equal: reconciles`, e.ok && sum(e) + e.walletMinor === net && e.walletMinor === 0);
    const amounts = e.lines.map((l) => l.amountMinor);
    ok(`#${k} equal: no two differ by more than a cent`, Math.max(...amounts) - Math.min(...amounts) <= 1);
    ok(`#${k} equal: an odd cent is always reported`, (net % n === 0) === (e.rounding === null) && (e.rounding?.cents ?? 0) === net % n);

    // percentages that total 100% or less
    const bps = {};
    let room = 10000;
    for (const d of dests) {
      const bp = rnd(room + 1);
      bps[d.id] = bp;
      room -= bp;
    }
    const total = 10000 - room;
    const p = A.plan(f, dests, { mode: "percent", basisPoints: bps });
    ok(`#${k} percent: reconciles`, p.ok && sum(p) + p.walletMinor === net && p.walletMinor >= 0);
    ok(`#${k} percent: the whole of what was asked for, rounded down once`, sum(p) === A.amountOfBp(total, net));
    ok(`#${k} percent: no share is more than a cent from its exact value`, p.lines.every((l) => Math.abs(l.amountMinor - (net * bps[l.id]) / 10000) < 1));
    ok(`#${k} percent: 100% leaves nothing`, total !== 10000 || p.walletMinor === 0);

    // exact amounts taken from that plan give the same plan back
    const x = A.plan(f, dests, { mode: "exact", amounts: Object.fromEntries(p.lines.map((l) => [l.id, l.amountMinor])) });
    ok(`#${k} exact: agrees with the percentage view`, x.ok && x.walletMinor === p.walletMinor && x.lines.every((l, i) => l.amountMinor === p.lines[i].amountMinor && l.shareBp === p.lines[i].shareBp));

    // carried out with some transfers failing, then retried: reconciles at every stage and ends as planned
    const fail = new Set(dests.filter(() => rnd(2) === 0).map((d) => d.id));
    const a = A.execute(A.openLedger(p), p, (id) => !fail.has(id));
    const kept = p.lines.filter((l) => fail.has(l.id)).reduce((t, l) => t + l.amountMinor, 0);
    ok(`#${k} execute: a failure leaves its money in the wallet`, a.reconciles && a.ledger.walletMinor === p.walletMinor + kept && a.failedMinor === kept);
    const b = A.execute(a.ledger, p, () => true);
    const c = A.execute(b.ledger, p, () => true);
    ok(`#${k} execute: the retry completes it`, b.reconciles && b.ledger.walletMinor === p.walletMinor && p.lines.every((l) => b.ledger.balances[l.id] === l.amountMinor));
    ok(`#${k} execute: a repeat changes nothing`, c.movedMinor === 0 && JSON.stringify(c.ledger) === JSON.stringify(b.ledger));
  }
}

if (failures.length) {
  console.error(`${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`allocation: ${passed} checks passed`);
