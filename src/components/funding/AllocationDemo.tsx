"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { clamp, rgba, type Colour, type FigureDraw, type Palette } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Slider, Stage } from "@/components/labs/kit";
import { platformOrder, platforms, type PlatformKey } from "@/data/platforms";
import { MODES, execute, formatBp, formatMinor, openLedger, parseBp, parseMinor, parseRateMicro, plainBp, plainMinor, plan as makePlan, shareBp, type Destination, type Execution, type Ledger, type Mode, type Parsed, type Plan, type Request } from "./allocation";

/**
 * TWO PLATFORMS, ONE WALLET — a demonstration of the journey from a profile to
 * funded trading accounts, with example figures.
 *
 * The rule it keeps: it is a demonstration and says so on every step. It opens
 * no account, moves no money, collects no personal details or documents, sends
 * nothing and stores nothing. GIO4X has not published its leverage options,
 * minimum funding amounts, fees or account currencies, so every such control
 * here holds an example value and is labelled as one; the minimum is a figure
 * the visitor sets. All the arithmetic is the engine's (./allocation.ts), in
 * whole cents: this file only reads what is typed and shows what comes back.
 */

/** Example choices only. They are not GIO4X's permitted leverage values. */
const EXAMPLE_LEVERAGE = [10, 20, 50, 100] as const;
/** The position used to show what leverage does to margin: 10,000.00, in cents. */
const EXAMPLE_POSITION = 1_000_000;

const STEPS = ["Profile", "Verification", "Trading accounts", "Funding", "Ready"] as const;
type Stage4 = "accounts" | "funding" | "review" | "ready";
const STEP_OF: Record<Stage4, number> = { accounts: 2, funding: 3, review: 3, ready: 4 };

type Choice = PlatformKey | "both";
type Setup = { nick: string; leverage: number; min: string };
type PerAccount<T> = Record<PlatformKey, T>;

const SHORT_MODE: Record<Mode, string> = { single: "One", equal: "Equal", percent: "%", exact: "Exact" };
const PRESETS: [number, number][] = [
  [50, 50],
  [75, 25],
  [25, 75],
];

const Example = ({ children }: { children?: ReactNode }) => <span className="text-xs font-medium text-prestige-ink">{children ?? "Example value, not a GIO4X condition"}</span>;

function TextField({ id, label, value, onChange, parsed, unit, hint, example = true, maxLength = 18, decimal = true }: { id: string; label: string; value: string; onChange: (v: string) => void; parsed?: Parsed; unit?: string; hint?: ReactNode; example?: boolean; maxLength?: number; decimal?: boolean }) {
  const error = parsed && !parsed.ok ? parsed.error : null;
  return (
    <div className="field min-w-0">
      <label htmlFor={id}>
        {label}
        {unit ? <span className="font-normal normal-case tracking-normal text-ink-3"> ({unit})</span> : null}
      </label>
      <input id={id} className={`input ${decimal ? "num" : ""}`} type="text" inputMode={decimal ? "decimal" : "text"} autoComplete="off" spellCheck={false} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={`${id}-note`} />
      <p id={`${id}-note`} className={error ? "field-error" : "field-hint"}>
        {error ?? hint ?? (example ? <Example /> : null)}
      </p>
    </div>
  );
}

const colourOf = (key: PlatformKey | "wallet", pal: Palette): Colour => (key === "mt5" ? pal.accent : key === "raptor" ? pal.gold : pal.ink3);

type Bar = { title: string; flag: "pending" | "over" | null; segs: { key: PlatformKey | "wallet"; name: string; frac: number; top: string; sub: string; shown: boolean }[] };

export function AllocationDemo() {
  const uid = useId();
  const [stage, setStage] = useState<Stage4>("accounts");
  const [choice, setChoice] = useState<Choice>("both");
  const [setup, setSetup] = useState<PerAccount<Setup>>({ mt5: { nick: "", leverage: 50, min: "100.00" }, raptor: { nick: "", leverage: 20, min: "100.00" } });
  const [gross, setGross] = useState("1000.00");
  const [fee, setFee] = useState("0.00");
  const [convert, setConvert] = useState(false);
  const [rate, setRate] = useState("0.92");
  const [cost, setCost] = useState("0.00");
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<Mode>("equal");
  const [to, setTo] = useState<PlatformKey>("mt5");
  const [pct, setPct] = useState<PerAccount<string>>({ mt5: "50.00", raptor: "50.00" });
  const [amt, setAmt] = useState<PerAccount<string>>({ mt5: "500.00", raptor: "500.00" });
  /** names the request: it changes when the visitor goes back to edit, so an edited plan has a new key */
  const [requestId, setRequestId] = useState(1);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [run, setRun] = useState<Execution | null>(null);
  const [presses, setPresses] = useState(0);
  const [failRaptor, setFailRaptor] = useState(false);

  const chosen: PlatformKey[] = platformOrder.filter((k) => choice === "both" || choice === k);
  const both = chosen.length === 2;
  const target: PlatformKey = chosen.includes(to) ? to : chosen[0]!;
  const nameOf = (k: PlatformKey) => (setup[k].nick.trim() ? `${setup[k].nick.trim()} (${platforms[k].name})` : platforms[k].name);

  /* ---- read what is typed: text to whole cents, basis points and millionths, with no float in between ---- */
  const pGross = parseMinor(gross, "The deposit");
  const pFee = parseMinor(fee, "The fee");
  const pRate = parseRateMicro(rate, "The rate");
  const pCost = parseMinor(cost, "The conversion cost");
  const pMin: PerAccount<Parsed> = { mt5: parseMinor(setup.mt5.min, "The minimum"), raptor: parseMinor(setup.raptor.min, "The minimum") };
  const pPct: PerAccount<Parsed> = { mt5: parseBp(pct.mt5, "The percentage"), raptor: parseBp(pct.raptor, "The percentage") };
  const pAmt: PerAccount<Parsed> = { mt5: parseMinor(amt.mt5, "The amount"), raptor: parseMinor(amt.raptor, "The amount") };

  const used: Parsed[] = [pGross, pFee, ...(convert ? [pRate, pCost] : []), ...chosen.map((k) => pMin[k]), ...(mode === "percent" ? chosen.map((k) => pPct[k]) : []), ...(mode === "exact" ? chosen.map((k) => pAmt[k]) : [])];
  const readable = used.every((x) => x.ok);
  const val = (x: Parsed) => (x.ok ? x.value : 0);

  let p: Plan | null = null;
  if (readable) {
    const dests: Destination[] = chosen.map((k) => ({ id: k, label: nameOf(k), minMinor: val(pMin[k]) }));
    const request: Request =
      mode === "single"
        ? { mode, to: target }
        : mode === "equal"
          ? { mode }
          : mode === "percent"
            ? { mode, basisPoints: Object.fromEntries(chosen.map((k) => [k, val(pPct[k])])) }
            : { mode, amounts: Object.fromEntries(chosen.map((k) => [k, val(pAmt[k])])) };
    p = makePlan({ grossMinor: val(pGross), feeMinor: val(pFee), conversion: convert ? { rateMicro: val(pRate), costMinor: val(pCost) } : null, pending }, dests, request, String(requestId));
  }
  const lineOf = (k: PlatformKey) => p?.lines.find((l) => l.id === k) ?? null;

  /* ---- what the drawing and its sentence show: the plan, or after Confirm what was really moved ---- */
  const net = ledger ? ledger.totalMinor : (p?.net.netMinor ?? 0);
  const held = (k: PlatformKey) => (ledger ? (ledger.balances[k] ?? 0) : (lineOf(k)?.amountMinor ?? 0));
  const inWallet = ledger ? ledger.walletMinor : Math.max(0, p?.walletMinor ?? 0);
  const over = !ledger && !!p && p.walletMinor < 0;
  const scale = Math.max(1, net, chosen.reduce((s, k) => s + held(k), 0) + inWallet);
  const share = (minor: number) => formatBp(shareBp(Math.max(0, minor), net));
  const bar: Bar = {
    title: !p ? "EXAMPLE FIGURES · CORRECT THE FIGURES ABOVE" : `EXAMPLE FIGURES · NET ${formatMinor(net)}${ledger ? " · AFTER THE TRANSFERS" : ""}`,
    flag: pending && !ledger ? "pending" : over ? "over" : null,
    segs: [
      ...platformOrder.map((k) => ({ key: k, name: platforms[k].name.toUpperCase(), frac: chosen.includes(k) && p ? held(k) / scale : 0, top: formatMinor(held(k)), sub: share(held(k)), shown: chosen.includes(k) })),
      { key: "wallet" as const, name: "WALLET", frac: p ? inWallet / scale : 0, top: formatMinor(inWallet), sub: share(inWallet), shown: true },
    ],
  };
  const barRef = useRef(bar);
  barRef.current = bar;
  const eased = useRef<number[]>([0, 0, 0]);

  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, dt, pal, still }) => {
        if (w < 100 || h < 60) return;
        const b = barRef.current;
        // each part of the bar slides towards its new share; a still frame is simply drawn at the shares
        const k = still ? 1 : 1 - Math.exp(-dt * 9);
        b.segs.forEach((s, i) => {
          const c = eased.current[i] ?? 0;
          eased.current[i] = Math.abs(s.frac - c) < 0.0005 ? s.frac : c + (s.frac - c) * k;
        });
        const padX = 12;
        const full = w - padX * 2;
        const top = Math.max(26, Math.round(h * 0.22));
        const barH = clamp(Math.round(h * 0.2), 16, 40);

        ctx.font = `600 10px ${pal.font}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = rgba(pal.ink3, 1);
        ctx.fillText(b.title, padX, 12, full);

        ctx.fillStyle = rgba(pal.line, 1);
        ctx.fillRect(padX, top, full, barH);
        let x = padX;
        b.segs.forEach((s, i) => {
          const wide = clamp(eased.current[i] ?? 0) * full;
          if (wide <= 0) return;
          ctx.fillStyle = rgba(colourOf(s.key, pal), s.key === "wallet" ? 0.38 : 0.95);
          ctx.fillRect(x, top, Math.min(wide, padX + full - x), barH);
          // a hairline between two parts
          ctx.fillStyle = rgba(pal.surface, 1);
          if (x > padX + 0.5) ctx.fillRect(x - 0.5, top, 1, barH);
          x += wide;
        });

        if (b.flag) {
          const tone = b.flag === "pending" ? AMBER : ALERT;
          if (b.flag === "pending") {
            // pending funds are there to see and not there to use: the whole bar is hatched
            ctx.save();
            ctx.beginPath();
            ctx.rect(padX, top, full, barH);
            ctx.clip();
            ctx.strokeStyle = rgba(pal.surface, 0.85);
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let hx = padX - barH; hx < padX + full; hx += 10) {
              ctx.moveTo(hx, top + barH);
              ctx.lineTo(hx + barH, top);
            }
            ctx.stroke();
            ctx.restore();
          }
          ctx.strokeStyle = rgba(tone, 1);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(padX + 0.75, top + 0.75, full - 1.5, barH - 1.5);
          ctx.fillStyle = rgba(tone, 1);
          ctx.fillText(b.flag === "pending" ? "PENDING · CANNOT BE ALLOCATED" : "MORE THAN THERE IS · REFUSED", padX, top + barH + 12, full);
        }

        // the legend: one column for each part, the same order as the bar
        const shown = b.segs.filter((s) => s.shown);
        const colW = full / shown.length;
        const ly = top + barH + (b.flag ? 30 : 18);
        if (ly + 34 > h) return;
        shown.forEach((s, i) => {
          const lx = padX + i * colW;
          ctx.fillStyle = rgba(colourOf(s.key, pal), s.key === "wallet" ? 0.5 : 1);
          ctx.fillRect(lx, ly - 4, 8, 8);
          ctx.font = `600 10px ${pal.font}`;
          ctx.fillStyle = rgba(pal.ink3, 1);
          ctx.fillText(s.name, lx + 13, ly, colW - 17);
          ctx.font = `600 13px ${pal.font}`;
          ctx.fillStyle = rgba(pal.ink, 1);
          ctx.fillText(s.top, lx, ly + 18, colW - 4);
          ctx.font = `600 10px ${pal.font}`;
          ctx.fillStyle = rgba(pal.ink2, 1);
          ctx.fillText(s.sub, lx, ly + 34, colW - 4);
        });
      },
    [],
  );
  const rev = (chosen.reduce((s, k, i) => s + held(k) * (i ? 31 : 10007), 0) + inWallet * 7 + net + (pending ? 1 : 0) + (over ? 2 : 0) + (ledger ? 4 : 0) + (p ? 8 : 0) + chosen.length * 16) % 2_000_000_011;

  const parts = chosen.map((k) => `${nameOf(k)} ${ledger ? "holds" : "takes"} ${formatMinor(held(k))} (${share(held(k))})`).join(", ");
  const sentence = !p
    ? "One of the figures above cannot be read, so there is no split to show yet."
    : ledger
      ? `After the transfers, of a net ${formatMinor(net)}: ${parts}, and the wallet holds ${formatMinor(inWallet)} (${share(inWallet)}).`
      : pending
        ? `The deposit is pending, so none of the ${formatMinor(net)} can be allocated yet. The split asked for: ${parts}.`
        : over
          ? `The split asks for ${formatMinor(-p.walletMinor)} more than the ${formatMinor(net)} available, so it is refused: ${parts}.`
          : `Of a net ${formatMinor(net)}: ${parts}, and ${formatMinor(inWallet)} (${share(inWallet)}) stays in the wallet.`;

  /* ---- actions ---- */
  const clearRun = () => {
    setLedger(null);
    setRun(null);
    setPresses(0);
  };
  const chooseMode = (m: Mode) => {
    if (m === mode) return;
    // the two views agree: the amounts are filled from the plan's percentages and the percentages from its amounts
    if (p && p.lines.length) {
      const lines = p.lines;
      if (m === "exact") setAmt((a) => ({ ...a, ...Object.fromEntries(lines.map((l) => [l.id, plainMinor(l.amountMinor)])) }));
      if (m === "percent") setPct((a) => ({ ...a, ...Object.fromEntries(lines.map((l) => [l.id, plainBp(l.shareBp)])) }));
    }
    setMode(m);
  };
  const confirm = () => {
    if (!p || !p.ok) return;
    const res = execute(ledger ?? openLedger(p), p, (id) => !(id === "raptor" && failRaptor));
    setLedger(res.ledger);
    setRun(res);
    setPresses((n) => n + 1);
  };
  const edit = () => {
    clearRun();
    setRequestId((n) => n + 1);
    setStage("funding");
  };
  const restart = () => {
    clearRun();
    setRequestId((n) => n + 1);
    setFailRaptor(false);
    setStage("accounts");
  };

  const failed = run?.transfers.filter((t) => t.status === "failed") ?? [];
  const sliderOf = both ? "mt5" : chosen[0]!;
  const sliderValue = clamp(Math.round(val(pPct[sliderOf]) / 100), 0, 100);
  const id = (s: string) => `${uid}-${s}`;
  const step = STEP_OF[stage];

  return (
    <div className="grid gap-21">
      {/* the banner stays in view on every step */}
      <p role="note" className="sticky top-[calc(var(--header-h,4rem)+0.5rem)] z-10 rounded border border-line-strong bg-surface px-13 py-8 text-sm text-ink" data-allocation-banner>
        <strong className="font-semibold">A demonstration with example figures.</strong> It opens no account and moves no money. The client portal is where accounts are opened and funded.
      </p>

      {/* progress */}
      <ol className="flat grid grid-cols-1 border-l border-t border-line sm:grid-cols-5" aria-label="The journey">
        {STEPS.map((s, i) => {
          const portal = i < 2;
          const state = portal ? "In the portal" : i < step ? "Done here" : i === step ? "This step" : "To come";
          return (
            <li key={s} aria-current={i === step ? "step" : undefined} className={`flat flex items-baseline gap-8 border-b border-r border-line px-13 py-8 sm:flex-col sm:gap-3 sm:py-13 ${i === step ? "bg-surface" : ""}`}>
              <span className="num text-xs font-semibold tracking-[0.1em] text-prestige-ink">{String(i + 1).padStart(2, "0")}</span>
              <span className={`text-sm font-medium ${i === step ? "text-ink" : "text-ink-2"}`}>{s}</span>
              <span className={`ml-auto text-xs sm:ml-0 ${i === step ? "font-semibold text-ink" : "text-ink-3"}`}>{state}</span>
            </li>
          );
        })}
      </ol>
      <p className="-mt-8 text-xs text-ink-3">Profile and verification happen in the client portal. This page does not ask for personal details or documents, and nothing typed here is sent or stored.</p>

      {/* ---- step 3: trading accounts ---- */}
      {stage === "accounts" && (
        <section aria-labelledby={id("acc")} className="grid gap-21">
          <div>
            <h3 id={id("acc")} className="h4">
              Which trading accounts?
            </h3>
            <p className="mt-5 max-w-measure text-sm text-ink-2">One profile and one wallet can stand behind an account on either platform, or on both. Each account is set up on its own.</p>
            <div className="seg mt-13 flex w-full sm:inline-flex sm:w-auto" role="group" aria-label="Trading accounts to open in this demonstration">
              {([...platformOrder, "both"] as Choice[]).map((c) => (
                <button key={c} type="button" aria-pressed={choice === c} onClick={() => setChoice(c)} className="!h-[2.75rem] flex-1 justify-center whitespace-nowrap !px-8 !normal-case sm:!px-13">
                  {c === "both" ? "Both" : `${platforms[c].short} only`}
                  {c !== "both" && <span className="sr-only"> ({platforms[c].name})</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-21 ${both ? "lg:grid-cols-2" : ""}`}>
            {chosen.map((k) => {
              const s = setup[k];
              const patch = (v: Partial<Setup>) => setSetup((all) => ({ ...all, [k]: { ...all[k], ...v } }));
              return (
                <fieldset key={k} className="panel min-w-0 p-21">
                  <legend className="label px-5">{platforms[k].name} account</legend>
                  <div className="grid gap-21">
                    <TextField id={id(`nick-${k}`)} label="Nickname" value={s.nick} onChange={(v) => patch({ nick: v })} decimal={false} maxLength={24} hint="A name for this account, used only on this page. Optional." />
                    <div>
                      <p id={id(`lev-${k}`)} className="field-label">
                        Leverage for this account
                      </p>
                      <div className="seg mt-8 flex w-full" role="group" aria-labelledby={id(`lev-${k}`)}>
                        {EXAMPLE_LEVERAGE.map((v) => (
                          <button key={v} type="button" aria-pressed={s.leverage === v} onClick={() => patch({ leverage: v })} className="num !h-[2.75rem] flex-1 justify-center !px-5">
                            1:{v}
                          </button>
                        ))}
                      </div>
                      <p className="mt-8">
                        <Example />
                      </p>
                      <p className="mt-5 text-sm text-ink-2">
                        At 1:{s.leverage}, a position worth {formatMinor(EXAMPLE_POSITION)} needs {formatMinor(EXAMPLE_POSITION / s.leverage)} of margin ({formatMinor(EXAMPLE_POSITION)} ÷ {s.leverage}).
                      </p>
                    </div>
                    <TextField id={id(`min-${k}`)} label="Minimum funding amount" value={s.min} onChange={(v) => patch({ min: v })} parsed={pMin[k]} hint={<Example>Example value you set, not a GIO4X condition</Example>} />
                  </div>
                </fieldset>
              );
            })}
          </div>

          <p className="max-w-measure text-sm text-ink-2">
            Leverage does not add funds to an account. It raises the exposure the same funds can carry: the margin a position needs falls as leverage rises, so a given move in price is then a larger share of the account. It is set separately for each account. The{" "}
            <Link href="/tools/margin" className="link">
              margin calculator
            </Link>{" "}
            works a position through with your own figures.
          </p>

          <div className="flex flex-wrap gap-13">
            <button type="button" className="btn btn-primary min-h-[2.75rem]" onClick={() => setStage("funding")} disabled={!chosen.every((k) => pMin[k].ok)}>
              Continue to funding
            </button>
          </div>
        </section>
      )}

      {/* ---- step 4: funding ---- */}
      {stage === "funding" && (
        <section aria-labelledby={id("fund")} className="grid gap-21">
          <div>
            <h3 id={id("fund")} className="h4">
              An example deposit into the wallet
            </h3>
            <p className="mt-5 max-w-measure text-sm text-ink-2">Amounts are in units of an example account currency, to two decimal places. No currency is named because GIO4X has not published the account currencies for each platform.</p>
          </div>
          <div className="grid gap-21 sm:grid-cols-2">
            <TextField id={id("gross")} label="Deposit" value={gross} onChange={setGross} parsed={pGross} />
            <TextField id={id("fee")} label="Fee" value={fee} onChange={setFee} parsed={pFee} />
          </div>
          <label className="check min-h-[2.75rem] items-center">
            <input type="checkbox" checked={convert} onChange={(e) => setConvert(e.target.checked)} />
            <span>The deposit is converted into the account currency</span>
          </label>
          {convert && (
            <div className="grid gap-21 sm:grid-cols-2">
              <TextField id={id("rate")} label="Conversion rate" value={rate} onChange={setRate} parsed={pRate} hint={<Example>Example rate, up to six decimal places. Not a quoted rate.</Example>} />
              <TextField id={id("cost")} label="Conversion cost" unit="after conversion" value={cost} onChange={setCost} parsed={pCost} />
            </div>
          )}
          <label className="check min-h-[2.75rem] items-center">
            <input type="checkbox" checked={pending} onChange={(e) => setPending(e.target.checked)} />
            <span>The deposit is still pending (sent, not yet arrived)</span>
          </label>

          {p && (
            <dl className="border-t border-line text-sm">
              {[
                { l: "Deposit", v: formatMinor(p.net.grossMinor) },
                { l: "Less the fee", v: `− ${formatMinor(p.net.feeMinor)}` },
                ...(p.net.convertedMinor !== null
                  ? [
                      { l: `Converted: ${formatMinor(p.net.afterFeeMinor)} × ${rate}${p.net.conversionRoundedDown ? ", rounded down to a cent" : ""}`, v: formatMinor(p.net.convertedMinor) },
                      { l: "Less the conversion cost", v: `− ${formatMinor(p.net.conversionCostMinor)}` },
                    ]
                  : []),
                { l: pending ? "Net amount, pending" : "Net amount available to allocate", v: formatMinor(p.net.netMinor) },
              ].map((r, i, all) => (
                <div key={r.l} className="flex items-baseline justify-between gap-21 border-b border-line py-8">
                  <dt className={i === all.length - 1 ? "font-semibold text-ink" : "text-ink-3"}>{r.l}</dt>
                  <dd className={`num text-right ${i === all.length - 1 ? "font-semibold text-ink" : "text-ink"}`}>{r.v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div>
            <h3 className="h4">How the net amount is divided</h3>
            <div className="seg mt-13 flex w-full" role="group" aria-label="Allocation mode">
              {MODES.map((m) => (
                <button key={m.key} type="button" aria-pressed={mode === m.key} aria-label={m.name} onClick={() => chooseMode(m.key)} className="!h-[2.75rem] flex-1 justify-center whitespace-nowrap !px-5 sm:!px-13">
                  <span className="sm:hidden">{SHORT_MODE[m.key]}</span>
                  <span className="hidden sm:inline">{m.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-8 text-sm text-ink-2">{MODES.find((m) => m.key === mode)!.line}</p>

            {mode === "single" &&
              (both ? (
                <div className="seg mt-13 flex w-full sm:inline-flex sm:w-auto" role="group" aria-label="The account that receives everything">
                  {chosen.map((k) => (
                    <button key={k} type="button" aria-pressed={target === k} onClick={() => setTo(k)} className="!h-[2.75rem] flex-1 justify-center whitespace-nowrap !px-13 !normal-case">
                      {platforms[k].name}
                    </button>
                  ))}
                </div>
              ) : (
                <Note>Only one account was chosen, so it receives the whole net amount.</Note>
              ))}

            {mode === "equal" && !both && <Note>With one account an equal split is the whole net amount.</Note>}

            {mode === "percent" && (
              <>
                <div className="mt-13 grid gap-21 sm:grid-cols-2">
                  {chosen.map((k) => (
                    <TextField key={k} id={id(`pct-${k}`)} label={platforms[k].name} unit="% of the net amount" value={pct[k]} onChange={(v) => setPct((a) => ({ ...a, [k]: v }))} parsed={pPct[k]} example={false} hint={lineOf(k) ? `= ${formatMinor(lineOf(k)!.amountMinor)}` : undefined} />
                  ))}
                </div>
                <Slider
                  label={both ? "A full split between the two" : `${platforms[sliderOf].name}’s share`}
                  value={sliderValue}
                  min={0}
                  max={100}
                  onChange={(v) => setPct((a) => (both ? { mt5: `${v}.00`, raptor: `${100 - v}.00` } : { ...a, [sliderOf]: `${v}.00` }))}
                  text={both ? `${sliderValue}% to ${platforms.mt5.name}, ${100 - sliderValue}% to ${platforms.raptor.name}` : `${sliderValue}% to ${platforms[sliderOf].name}, ${100 - sliderValue}% stays in the wallet`}
                />
                {both ? (
                  <div className="mt-8 flex flex-wrap items-center gap-8" role="group" aria-label="Preset splits, MetaTrader 5 then 777 Raptor">
                    {PRESETS.map(([a, b]) => (
                      <button key={`${a}/${b}`} type="button" className="btn btn-ghost btn-sm num min-h-[2.75rem]" aria-pressed={pct.mt5 === `${a}.00` && pct.raptor === `${b}.00`} onClick={() => setPct({ mt5: `${a}.00`, raptor: `${b}.00` })}>
                        {a}/{b}
                      </button>
                    ))}
                    <span className="text-xs text-ink-3">
                      {platforms.mt5.short} first, then {platforms.raptor.short}. The fields above take any figures, including a total below 100%.
                    </span>
                  </div>
                ) : (
                  <Note>The presets 50/50, 75/25 and 25/75 divide between two accounts. Choose both platforms to use them.</Note>
                )}
              </>
            )}

            {mode === "exact" && (
              <div className="mt-13 grid gap-21 sm:grid-cols-2">
                {chosen.map((k) => (
                  <TextField key={k} id={id(`amt-${k}`)} label={platforms[k].name} unit="amount" value={amt[k]} onChange={(v) => setAmt((a) => ({ ...a, [k]: v }))} parsed={pAmt[k]} example={false} hint={lineOf(k) ? `= ${formatBp(lineOf(k)!.shareBp)} of the net amount` : undefined} />
                ))}
              </div>
            )}
          </div>

          <Stage draw={draw} ratio={3} rev={rev} />
          <p aria-live="polite" className="text-sm text-ink-2">
            {sentence}
          </p>

          {/* what the engine says about the request: reasons and options, never a quiet correction */}
          <div aria-live="polite" className="grid gap-13" data-allocation-issues>
            {!p && <p className="field-error">A figure above cannot be read. Each field says what is wrong with it; the split is worked out once every figure is a number.</p>}
            {p?.issues.map((i) => (
              <div key={`${i.code}-${i.destination ?? ""}`} className="rounded border border-line-strong p-13">
                <p className="text-sm font-medium text-ink">
                  <span className="label mr-8 text-neg">Refused</span>
                  {i.message}
                </p>
                <p className="mt-5 text-sm text-ink-2">What can be done: {i.options.join(" ")}</p>
              </div>
            ))}
            {p?.ok && <p className="text-sm text-ink-2">This split can be carried out exactly as asked.</p>}
            {p?.rounding && (
              <p className="text-sm text-ink-2">
                Rounding: {p.rounding.cents === 1 ? "one cent was" : `${p.rounding.cents} cents were`} left over and went to {p.rounding.to.map((t) => t.label).join(" and ")}. {p.rounding.rule}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-13">
            <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={() => setStage("accounts")}>
              Back to accounts
            </button>
            <button type="button" className="btn btn-primary min-h-[2.75rem]" onClick={() => setStage("review")} disabled={!p?.ok}>
              Review
            </button>
            {!p?.ok && <span className="text-xs text-ink-3">Review opens when the split can be carried out as asked.</span>}
          </div>
        </section>
      )}

      {/* ---- review, confirm and what happened ---- */}
      {stage === "review" && p && (
        <section aria-labelledby={id("rev")} className="grid gap-21">
          <div>
            <h3 id={id("rev")} className="h4">
              Review before anything moves
            </h3>
            <p className="mt-5 max-w-measure text-sm text-ink-2">Everything the plan would do, in one place. In this demonstration Confirm runs a model of the transfers; no instruction is sent anywhere.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-gx min-w-[30rem]">
              <caption className="sr-only">The plan: each account, its example leverage, its amount and its share of the net amount</caption>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Example leverage</th>
                  <th scope="col" className="num-right">
                    Amount
                  </th>
                  <th scope="col" className="num-right">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {p.lines.map((l) => (
                  <tr key={l.id}>
                    <th scope="row" className="!normal-case !tracking-normal !text-ink">
                      {l.label}
                    </th>
                    <td className="num">1:{setup[l.id as PlatformKey].leverage}</td>
                    <td className="num num-right">
                      {formatMinor(l.amountMinor)}
                      {l.roundingCents > 0 && <span className="block text-xs text-ink-3">includes the odd cent</span>}
                    </td>
                    <td className="num num-right">{formatBp(l.shareBp)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="!normal-case !tracking-normal !text-ink">
                    Stays in the wallet
                  </th>
                  <td>—</td>
                  <td className="num num-right">{formatMinor(p.walletMinor)}</td>
                  <td className="num num-right">{formatBp(p.walletBp)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <dl className="border-t border-line text-sm">
            {[
              { l: "Deposit", v: formatMinor(p.net.grossMinor) },
              { l: "Fee", v: formatMinor(p.net.feeMinor) },
              { l: "Conversion", v: p.net.convertedMinor === null ? "None" : `× ${rate} = ${formatMinor(p.net.convertedMinor)}${p.net.conversionRoundedDown ? " (rounded down to a cent)" : ""}, cost ${formatMinor(p.net.conversionCostMinor)}` },
              { l: "Net amount", v: formatMinor(p.net.netMinor) },
              { l: "Allocated + wallet", v: `${formatMinor(p.allocatedMinor)} + ${formatMinor(p.walletMinor)} = ${formatMinor(p.allocatedMinor + p.walletMinor)}` },
              { l: "Plan key", v: p.key },
            ].map((r) => (
              <div key={r.l} className="flex items-baseline justify-between gap-21 border-b border-line py-8">
                <dt className="shrink-0 text-ink-3">{r.l}</dt>
                <dd className="num min-w-0 break-words text-right text-ink">{r.v}</dd>
              </div>
            ))}
          </dl>
          <p className="-mt-8 text-xs text-ink-3">
            <Example>Every figure here is an example, including the leverage. None is a GIO4X condition.</Example>
          </p>

          <label className="check min-h-[2.75rem] items-center">
            <input type="checkbox" checked={failRaptor} onChange={(e) => setFailRaptor(e.target.checked)} disabled={!chosen.includes("raptor")} />
            <span>
              Make the {platforms.raptor.short} transfer fail
              <span className="block text-xs text-ink-3">{chosen.includes("raptor") ? "A switch for the demonstration: it shows what a partial failure looks like." : "No 777 Raptor account was chosen, so there is no such transfer to fail."}</span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-13">
            <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={edit}>
              Edit
            </button>
            <button type="button" className="btn btn-primary min-h-[2.75rem]" onClick={confirm}>
              {presses === 0 ? "Confirm" : failed.length ? "Retry the failed transfer" : "Confirm again"}
            </button>
            {run && (
              <button type="button" className="btn btn-quiet min-h-[2.75rem]" onClick={() => setStage("ready")}>
                See the accounts
              </button>
            )}
          </div>

          <div aria-live="polite" className="grid gap-13" data-allocation-result>
            {run && ledger && (
              <>
                <p className="text-sm font-medium text-ink">
                  {run.repeat
                    ? `Confirm was pressed again (${presses} times in all) under the same key. Every transfer in this plan had already been made, so this press changed nothing.`
                    : failed.length
                      ? `Partly done. ${formatMinor(run.movedMinor)} was moved by this press; ${formatMinor(run.failedMinor)} was not, and is still in the wallet. Nothing has been lost and nothing was moved twice.`
                      : `Done. ${formatMinor(run.movedMinor)} was moved by this press.`}
                </p>
                <ul className="border-t border-line text-sm">
                  {run.transfers.map((t) => (
                    <li key={t.key} className="flat grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-13 border-b border-line py-8">
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">
                          {t.label}: <span className="num">{formatMinor(t.amountMinor)}</span>
                        </span>
                        <span className="block text-ink-3">{t.note}</span>
                      </span>
                      <span className={`label ${t.status === "failed" ? "text-neg" : t.status === "done" ? "text-pos" : ""}`}>{t.status === "done" ? "Done" : t.status === "failed" ? "Failed" : t.status === "already-done" ? "Already done" : "Nothing to move"}</span>
                    </li>
                  ))}
                </ul>
                <p className="num text-sm text-ink-2">
                  Wallet {formatMinor(ledger.walletMinor)}
                  {chosen.map((k) => ` + ${platforms[k].short} ${formatMinor(ledger.balances[k] ?? 0)}`).join("")} = {formatMinor(ledger.walletMinor + chosen.reduce((s, k) => s + (ledger.balances[k] ?? 0), 0))}
                  {run.reconciles ? `, the net amount of ${formatMinor(ledger.totalMinor)}.` : ". This does not match the net amount."}
                </p>
                {failed.length > 0 && <p className="text-sm text-ink-2">Retry sends only the transfer that failed. Turn the switch off first to see it go through, or leave it on to see it fail again with the money still in the wallet.</p>}
              </>
            )}
          </div>
        </section>
      )}

      {/* ---- step 5: ready ---- */}
      {stage === "ready" && ledger && (
        <section aria-labelledby={id("ready")} className="grid gap-21">
          <h3 id={id("ready")} className="h4">
            The wallet and the accounts, side by side
          </h3>
          <ul className={`grid gap-13 ${both ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            {chosen.map((k) => {
              const t = run?.transfers.find((x) => x.id === k);
              const balance = ledger.balances[k] ?? 0;
              return (
                <li key={k} className="panel flat p-21">
                  <p className="label">{platforms[k].name}</p>
                  {setup[k].nick.trim() && <p className="mt-5 break-words text-sm text-ink-2">{setup[k].nick.trim()}</p>}
                  <p className="num mt-13 font-display text-2xl font-light text-ink">{formatMinor(balance)}</p>
                  <p className="mt-5 text-sm text-ink-2">{t?.status === "failed" ? "Not funded: the transfer failed and the money is still in the wallet." : balance > 0 ? "Funded in this demonstration." : "Open, with nothing allocated to it."}</p>
                  <p className="mt-13 text-sm text-ink-3">
                    Leverage <span className="num text-ink">1:{setup[k].leverage}</span>
                  </p>
                  <Example />
                </li>
              );
            })}
            <li className="panel flat p-21">
              <p className="label">Wallet</p>
              <p className="num mt-13 font-display text-2xl font-light text-ink">{formatMinor(ledger.walletMinor)}</p>
              <p className="mt-5 text-sm text-ink-2">Not on either platform. It carries no position and is not margin for anything.</p>
            </li>
          </ul>

          <Stage draw={draw} ratio={3} rev={rev} />
          <p aria-live="polite" className="text-sm text-ink-2">
            {sentence}
          </p>

          <div className="max-w-measure border-l border-line-strong pl-13 text-sm text-ink-2">
            <p>
              <strong className="font-semibold text-ink">Separate balances, separate margin.</strong> Each trading account has its own balance and its own margin. Spare funds on one account do not protect the other from a margin call, and funds in the wallet protect neither.
            </p>
            <p className="mt-8">
              The total of {formatMinor(ledger.totalMinor)} across the wallet and the accounts is a sum for reading. It is not shared collateral: each platform looks only at the account that is on it.
            </p>
          </div>

          <div className="flex flex-wrap gap-13">
            <button type="button" className="btn btn-ghost min-h-[2.75rem]" onClick={() => setStage("review")}>
              Back to the review
            </button>
            <button type="button" className="btn btn-quiet min-h-[2.75rem]" onClick={restart}>
              Start again
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
