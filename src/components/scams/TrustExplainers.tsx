"use client";

import { useMemo, useState } from "react";
import { clamp, lerp, rgba, smooth, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, Note, Slider, Stage } from "@/components/labs/kit";
import { cap, dot, fmt, line, roundRect } from "./draw";
import { FAKE_DEPOSITS, FAKE_TEASER, MANAGED, fakePlatform, managed, seededRng } from "./engine";

/**
 * SCAM SCHOOL — four explainers about borrowed trust: the clone firm, the
 * fake trading platform, the stranger who offers to trade your account, and
 * the friendship that turns into an "investment".
 *
 * Every figure is invented and in invented units; no real firm, platform or
 * person is pictured. Nothing is stored or sent. The sentence under each
 * canvas says what the canvas shows.
 */

const Say = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
    {children}
  </p>
);

/* ---------------------------------------------------------------------------
 * 1. THE CLONE FIRM — what is copied, and what cannot be.
 * ------------------------------------------------------------------------- */

const CLONE_ROWS: readonly { what: string; copied: boolean }[] = [
  { what: "Firm’s name", copied: true },
  { what: "Register number", copied: true },
  { what: "Registered address", copied: true },
  { what: "Telephone", copied: false },
  { what: "E-mail address", copied: false },
  { what: "Web address", copied: false },
];

export function CloneExplainer() {
  const [checked, setChecked] = useState(false);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const top = 30;
        const rh = (h - top - 8) / CLONE_ROWS.length;
        const xl = small ? 12 : 20;
        const pw = w * (small ? 0.2 : 0.22);
        const xr = w - xl - pw;
        cap(ctx, pal, "On the register", xl, 14, pal.ink2, "left", small ? 9 : 10);
        cap(ctx, pal, "In the message", w - xl, 14, pal.ink2, "right", small ? 9 : 10);
        // a reading line that travels down the rows
        const scan = still ? -1 : (t * 0.8) % (CLONE_ROWS.length + 1.5);
        CLONE_ROWS.forEach((row, i) => {
          const y = top + rh * (i + 0.5);
          const lit = Math.abs(scan - i - 0.5) < 0.5;
          const bad = checked && !row.copied;
          const tone = !checked ? pal.ink2 : row.copied ? pal.emerald : ALERT;
          const ph = Math.min(14, rh * 0.5);
          roundRect(ctx, xl, y - ph / 2, pw, ph, 3);
          ctx.fillStyle = rgba(pal.ink2, lit ? 0.5 : 0.3);
          ctx.fill();
          roundRect(ctx, xr, y - ph / 2, pw, ph, 3);
          ctx.fillStyle = rgba(tone, bad ? 0.2 : lit ? 0.5 : 0.3);
          ctx.fill();
          if (bad) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = rgba(ALERT, 1);
            ctx.stroke();
          }
          const x0 = xl + pw + 6;
          const x1 = xr - 6;
          const mid = (x0 + x1) / 2;
          if (bad) {
            line(ctx, [x0, y + 8], [mid - 9, y + 8], rgba(ALERT, 0.8), 1.5);
            line(ctx, [mid + 9, y + 8], [x1, y + 8], rgba(ALERT, 0.8), 1.5);
            line(ctx, [mid - 4, y + 4], [mid + 4, y + 12], rgba(ALERT, 1), 1.7);
            line(ctx, [mid + 4, y + 4], [mid - 4, y + 12], rgba(ALERT, 1), 1.7);
          } else line(ctx, [x0, y + 8], [x1, y + 8], rgba(tone, lit ? 1 : 0.6), 1.5);
          cap(ctx, pal, row.what, mid, y - 3, bad ? ALERT : pal.ink2, "center", small ? 8 : 10);
        });
      },
    [checked],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={checked ? 1 : 0} />
      <div className="mt-13 flex flex-wrap gap-8">
        <button type="button" className={`btn btn-sm ${checked ? "btn-ghost" : "btn-primary"} min-h-[2.75rem]`} aria-pressed={!checked} onClick={() => setChecked(false)}>
          At a glance
        </button>
        <button type="button" className={`btn btn-sm ${checked ? "btn-primary" : "btn-ghost"} min-h-[2.75rem]`} aria-pressed={checked} onClick={() => setChecked(true)}>
          Checked against the register
        </button>
      </div>
      <Say>
        {checked
          ? "Checked line by line against the regulator’s register, three details are the real firm’s, copied. The three that would actually reach somebody, the telephone number, the e-mail address and the web address, are not on the register entry at all. They belong to the fraudster."
          : "At a glance, all six details look right. The name, the register number and the registered address are a real, authorised firm’s, and they will check out if they are all that is checked."}
      </Say>
      <Note>A drawing of the method, with no real firm in it. A register entry gives the firm’s own contact details; the copy never can.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. THE FAKE PLATFORM — the balance on the screen is a number somebody types.
 * ------------------------------------------------------------------------- */

export function FakeBrokerExplainer() {
  const [n, setN] = useState(3);
  const sim = useMemo(() => fakePlatform(n), [n]);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const r = seededRng(606);
        // the screen's story: after each deposit, a wobbling climb to the next figure
        const pts: number[] = [0];
        const sent: number[] = [0];
        const per = 14;
        let s = 0;
        for (let i = 1; i <= n; i++) {
          const from = fakePlatform(i - 1).screen + FAKE_DEPOSITS[i - 1];
          const to = fakePlatform(i).screen;
          s += FAKE_DEPOSITS[i - 1];
          for (let k = 0; k < per; k++) {
            const q = k / (per - 1);
            pts.push(lerp(from, to, q) * (1 + (k > 0 && k < per - 1 ? (r() - 0.45) * 0.05 : 0)));
            sent.push(s);
          }
        }
        const u = still ? 1 : clamp((t % 9) / 5.5);
        const upto = Math.max(2, Math.round(u * pts.length));
        const top = 34;
        const bot = h - 22;
        const hi = sim.screen * 1.08;
        const X = (i: number) => lerp(12, w - 12, i / (pts.length - 1));
        const Y = (v: number) => lerp(bot, top, v / hi);
        line(ctx, [12, bot], [w - 12, bot], rgba(pal.ink3, 0.5));
        const trace = (series: number[], stroke: string, width: number, dash: number[]) => {
          ctx.setLineDash(dash);
          ctx.beginPath();
          for (let i = 0; i < upto; i++) {
            if (i === 0) ctx.moveTo(X(i), Y(series[i]));
            else ctx.lineTo(X(i), Y(series[i]));
          }
          ctx.lineWidth = width;
          ctx.lineJoin = "round";
          ctx.strokeStyle = stroke;
          ctx.stroke();
          ctx.setLineDash([]);
        };
        trace(sent, rgba(pal.ink2, 1), 1.5, [5, 4]);
        trace(pts, rgba(pal.accent, 1), 1.9, []);
        // what has come back: one small payment, early, and then a flat line
        const backY = Y(FAKE_TEASER) - 1;
        line(ctx, [X(Math.min(per, pts.length - 1)), backY], [X(upto - 1), backY], rgba(pal.emerald, 1), 2);
        cap(ctx, pal, "On the screen", 14, 12, pal.accent, "left", small ? 9 : 10);
        cap(ctx, pal, "Money sent", 14, 25, pal.ink2, "left", small ? 9 : 10);
        cap(ctx, pal, "Money returned", w - 14, bot - 10, pal.emerald, "right", small ? 9 : 10);
        if (upto === pts.length) {
          const x = w - 14;
          const y = Y(pts[pts.length - 1]);
          const pulse = still ? 1 : 0.6 + 0.4 * Math.sin(t * 4);
          dot(ctx, x, y, 5, rgba(ALERT, pulse));
          cap(ctx, pal, "Withdrawal: “pay a fee first”", x - 10, y + (y < top + 16 ? 12 : -10), ALERT, "right", small ? 8 : 10);
        }
      },
    [n, sim],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={n} />
      <Slider label="Deposits made" value={n} min={1} max={FAKE_DEPOSITS.length} onChange={setN} text={String(n)} />
      <Say>
        {`After ${n} ${n === 1 ? "deposit" : "deposits"} the screen shows ${fmt(sim.screen)} units. ${fmt(sim.sent)} has been sent, and ${fmt(sim.back)} has come back: one small withdrawal, allowed early. The balance on the screen is a number the operator types. No trade was placed, and a request to withdraw now meets a “tax” or a “fee” to be paid first.`}
      </Say>
      <Note>
        Invented units. The deposits asked for here are {FAKE_DEPOSITS.map((d) => fmt(d)).join(", ")}; after each, the screen adds 40% “profit”. The pattern is the point: larger each time, and encouraged by the figure on the screen.
      </Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 3. "LET ME TRADE YOUR ACCOUNT" — paid on the wins, absent for the losses.
 * ------------------------------------------------------------------------- */

export function ManagedExplainer() {
  const [swing, setSwing] = useState(20);
  const sim = useMemo(() => managed(swing / 100), [swing]);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const u = still ? 1 : clamp((t % 9) / 5.5);
        const upto = Math.max(1, Math.round(u * MANAGED.months));
        const top = 22;
        const bot = h - 40;
        // a log scale: an account that halves and one that doubles sit the same distance from the start
        const lo = Math.log(20);
        const hi = Math.log(20000);
        const X = (m: number) => lerp(12, w - 12, m / MANAGED.months);
        const Y = (v: number) => lerp(bot, top, clamp((Math.log(Math.max(v, 20)) - lo) / (hi - lo)));
        line(ctx, [12, Y(MANAGED.start)], [w - 12, Y(MANAGED.start)], rgba(pal.ink2, 0.9), 1, [5, 4]);
        cap(ctx, pal, "Paid in", 14, Y(MANAGED.start) - 8, pal.ink2, "left", small ? 9 : 10);
        sim.paths.forEach((p) => {
          const down = p[MANAGED.months] < MANAGED.start;
          ctx.beginPath();
          for (let m = 0; m <= upto; m++) {
            if (m === 0) ctx.moveTo(X(m), Y(p[m]));
            else ctx.lineTo(X(m), Y(p[m]));
          }
          ctx.lineWidth = 1.1;
          ctx.lineJoin = "round";
          ctx.strokeStyle = rgba(down ? ALERT : pal.emerald, 0.55);
          ctx.stroke();
        });
        // the manager's takings, per account, against what was paid in
        const by = h - 16;
        const full = w - 24;
        ctx.fillStyle = rgba(pal.ink3, 0.18);
        ctx.fillRect(12, by - 5, full, 10);
        ctx.fillStyle = rgba(pal.gold, 1);
        ctx.fillRect(12, by - 5, full * clamp(sim.meanFee / MANAGED.start) * (upto / MANAGED.months), 10);
        cap(ctx, pal, "Manager’s fees per account", 12, by - 14, pal.ink2, "left", small ? 9 : 10);
      },
    [sim],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={swing} />
      <Slider label="Size of each month’s win or loss" value={swing} min={5} max={50} step={5} onChange={setSwing} text={`${swing}% of the account`} />
      <Say>
        {`With each month a ${swing}% win or a ${swing}% loss on the toss of a coin, ${sim.below} of ${MANAGED.accounts} invented accounts finish two years below the ${fmt(MANAGED.start)} units paid in, and ${sim.halved} lose more than half. The middle account ends at ${fmt(sim.median)}. The manager, who takes ${MANAGED.fee * 100}% of every winning month and returns nothing in a losing one, collects ${fmt(sim.meanFee)} per account on average.`}
      </Say>
      <Note>
        {MANAGED.accounts} invented accounts over {MANAGED.months} months; {sim.paths.length} of them are drawn. The “trading” is a coin flip with no skill in it, which is the honest assumption about a stranger with no record that can be checked. The arrangement pays the manager for taking risk with somebody else’s money: the bigger the swings, the bigger the fees.
      </Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 4. THE FRIENDSHIP THAT BECOMES AN INVESTMENT — weeks of trust, then money.
 * ------------------------------------------------------------------------- */

const WEEKS = 16;
/** units sent by the end of each week, invented */
const SENT = [0, 0, 0, 0, 0, 0, 0, 0, 200, 200, 2000, 5000, 12000, 20000, 23000, 23000] as const;
const STAGES: readonly { to: number; name: string; says: string }[] = [
  { to: 2, name: "Contact", says: "a message arrives from a stranger: a “wrong number”, or a friendly profile. Money is not mentioned." },
  { to: 6, name: "Friendship", says: "there are messages every day, with photographs, sympathy and plans. Still nothing about money." },
  { to: 8, name: "The idea", says: "the new friend mentions, in passing, how well their own investing is going, and offers to show how it is done." },
  { to: 10, name: "Small win", says: "a small sum goes on to a platform the friend recommends. The screen shows a gain, and a small withdrawal works." },
  { to: 14, name: "Bigger sums", says: "the friend urges more, and then more: savings, then borrowed money. The screen shows a fortune." },
  { to: 16, name: "The wall", says: "a withdrawal is refused until a “tax” is paid. It is paid. Then the platform, and the friend, stop answering." },
];
const stageOf = (week: number) => STAGES.find((s) => week <= s.to) ?? STAGES[STAGES.length - 1];

export function RomanceExplainer() {
  const [week, setWeek] = useState(9);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const top = 30;
        const bot = h - 22;
        const X = (wk: number) => lerp(12, w - 12, wk / WEEKS);
        const now = stageOf(week);
        let from = 0;
        STAGES.forEach((s, i) => {
          if (s === now) {
            ctx.fillStyle = rgba(pal.accent, 0.1);
            ctx.fillRect(X(from), top - 16, X(s.to) - X(from), bot - top + 16);
          }
          if (i) line(ctx, [X(from), top - 16], [X(from), bot], rgba(pal.ink3, 0.35));
          if (!small || s === now) cap(ctx, pal, s.name, (X(from) + X(s.to)) / 2, top - 8, s === now ? pal.ink : pal.ink3, "center", 9);
          from = s.to;
        });
        line(ctx, [12, bot], [w - 12, bot], rgba(pal.ink3, 0.5));
        // trust: built slowly, long before any money is asked for
        const trust = (wk: number) => smooth(wk / 10) * 0.9 + 0.05;
        ctx.beginPath();
        for (let i = 0; i <= 64; i++) {
          const wk = (i / 64) * WEEKS;
          const y = lerp(bot, top + 4, trust(wk));
          if (i === 0) ctx.moveTo(X(wk), y);
          else ctx.lineTo(X(wk), y);
        }
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = rgba(pal.teal, 1);
        ctx.stroke();
        // money: nothing for eight weeks, then steps
        const max = SENT[WEEKS - 1];
        ctx.beginPath();
        ctx.moveTo(X(0), bot);
        SENT.forEach((v, i) => {
          const y = lerp(bot, top + 4, v / max);
          ctx.lineTo(X(i), y);
          ctx.lineTo(X(i + 1), y);
        });
        ctx.lineTo(X(WEEKS), bot);
        ctx.fillStyle = rgba(ALERT, 0.18);
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = rgba(ALERT, 1);
        ctx.stroke();
        cap(ctx, pal, "Trust", X(4.2), lerp(bot, top + 4, trust(4.2)) - 10, pal.teal, "center", small ? 9 : 10);
        cap(ctx, pal, "Money sent", X(12.5), bot - 9, ALERT, "center", small ? 9 : 10);
        // this week
        const x = X(week - 0.5);
        line(ctx, [x, top - 16], [x, bot], rgba(pal.ink, 0.9), 1.3);
        dot(ctx, x, lerp(bot, top + 4, trust(week - 0.5)), 4 + (still ? 0 : Math.sin(t * 4)), rgba(pal.teal, 1));
        cap(ctx, pal, "Week 1", 12, h - 9, pal.ink3, "left", 9);
        cap(ctx, pal, `Week ${WEEKS}`, w - 12, h - 9, pal.ink3, "right", 9);
      },
    [week],
  );
  const s = stageOf(week);
  const sent = SENT[week - 1];
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={week} />
      <Slider label="Week" value={week} min={1} max={WEEKS} onChange={setWeek} text={`week ${week}: ${s.name.toLowerCase()}`} />
      <Say>{`Week ${week}: ${s.says} Money sent so far: ${sent === 0 ? "none" : `${fmt(sent)} units`}.`}</Say>
      <Note>An invented timetable in invented units, to show the order of events: trust first, for weeks, and money only afterwards. Real cases run from days to many months.</Note>
    </div>
  );
}
