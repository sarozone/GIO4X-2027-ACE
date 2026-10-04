"use client";

import { useMemo, useState } from "react";
import { TAU, lerp, rgba, type FigureDraw } from "@/components/figures/Figure";
import { ALERT, AMBER, Note, Slider, Stage } from "@/components/labs/kit";
import { between, cap, dot, flow, fmt, line, node, roundRect, type Pt } from "./draw";
import { ADVANCE, RECOVERY, sumTo } from "./engine";

/**
 * SCAM SCHOOL — four explainers about the approach: the recovery room, the
 * phishing message and the fake support desk, the fee that must be paid
 * before the money comes, and the famous face that never said it.
 *
 * Every figure is invented and in invented units; no real firm, site or
 * person is pictured. Nothing is stored or sent. The sentence under each
 * canvas says what the canvas shows.
 */

const Say = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-13 min-h-[4.5rem] text-ink-2" aria-live="polite">
    {children}
  </p>
);

/* ---------------------------------------------------------------------------
 * 1. THE RECOVERY ROOM — the second fraud is built from the first.
 * ------------------------------------------------------------------------- */

export function RecoveryExplainer() {
  const [n, setN] = useState(2);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const fs = small ? 8 : 10;
        const r = small ? 11 : 14;
        const cx = w * 0.38;
        const cy = h * 0.5;
        const rx = w * 0.26;
        const ry = h * 0.3;
        const you: Pt = [cx - rx, cy];
        const first: Pt = [cx, cy - ry];
        const list: Pt = [cx + rx, cy];
        const agent: Pt = [cx, cy + ry];
        // money to the first fraud; the victim's details to a list; the list to the "recovery agent"
        flow(ctx, ...between(you, first, r + 3, r + 3), t, ALERT, 3, 0.3);
        flow(ctx, ...between(first, list, r + 3, r + 3), t, pal.ink2, 3, 0.3, 2);
        flow(ctx, ...between(list, agent, r + 3, r + 3), t, pal.ink2, 3, 0.3, 2);
        const [a, b] = between(you, agent, r + 3, r + 3);
        if (n > 0) flow(ctx, a, b, t, ALERT, Math.min(4, n + 1), 0.3);
        else line(ctx, a, b, rgba(pal.ink3, 0.5), 1, [3, 4]);
        node(ctx, pal, you, r, pal.accent, "You", false, fs);
        node(ctx, pal, first, r, ALERT, "First fraud", true, fs);
        node(ctx, pal, list, r, pal.ink2, "The list", false, fs);
        node(ctx, pal, agent, r, n > 0 ? ALERT : AMBER, "“Recovery agent”", false, fs);
        // the tally: the first loss, and each fee on top of it
        const bx = w * 0.84;
        const bw = Math.max(18, w * 0.08);
        const top = 26;
        const bot = h - 24;
        const total = RECOVERY.first + sumTo(RECOVERY.fees, RECOVERY.fees.length);
        const H = (v: number) => ((bot - top) * v) / total;
        ctx.fillStyle = rgba(ALERT, 0.45);
        ctx.fillRect(bx - bw / 2, bot - H(RECOVERY.first), bw, H(RECOVERY.first));
        let y = bot - H(RECOVERY.first);
        for (let i = 0; i < n; i++) {
          const hh = H(RECOVERY.fees[i]);
          y -= hh;
          ctx.fillStyle = rgba(ALERT, 1);
          ctx.fillRect(bx - bw / 2, y + 1, bw, Math.max(1.5, hh - 1));
        }
        cap(ctx, pal, "Lost", bx, 12, pal.ink2, "center", fs);
        cap(ctx, pal, "Returned: 0", bx, h - 10, pal.emerald, "center", fs);
      },
    [n],
  );
  const fees = sumTo(RECOVERY.fees, n);
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={n} />
      <Slider label="Fees paid to the “recovery agent”" value={n} min={0} max={RECOVERY.fees.length} onChange={setN} text={String(n)} />
      <Say>
        {n === 0
          ? `The first fraud took ${fmt(RECOVERY.first)} units. The victim’s name, telephone number and the amount lost are now on a list, and lists are sold. The next call will come from someone who already knows all three.`
          : `${n} ${n === 1 ? "fee" : "fees"} paid to the “recovery agent”: ${fmt(fees)} more has gone on top of the first ${fmt(RECOVERY.first)}, and nothing has come back. Each payment was followed by a reason for another.`}
      </Say>
      <Note>Invented units. The caller may be the people who ran the first fraud, or someone who bought their list. Either way they know what was lost because they were told, not because they have found it.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. PHISHING AND FAKE SUPPORT — a copy of the page sits in the middle.
 * ------------------------------------------------------------------------- */

const PHISH: readonly string[] = [
  "A message arrives that looks like it is from a firm you use. It says there is a problem with the account and gives a link to follow, or a number to ring.",
  "The link opens a copy of the sign-in page. Its address is close to the real one and not the same. The password typed into it goes to the fraudster.",
  "The fraudster types that password into the real site, which sends a one-time code to the real customer. The copy page asks for the code, and it is typed in.",
  "The fraudster enters the code on the real site and is signed in as the customer. Nothing was broken into: everything needed was handed over.",
];

export function PhishingExplainer() {
  const [step, setStep] = useState(2);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const fs = small ? 8 : 10;
        const r = small ? 12 : 16;
        const y = h * 0.42;
        const you: Pt = [w * 0.14, y];
        const copy: Pt = [w * 0.5, y];
        const real: Pt = [w * 0.86, y];
        const off = small ? 12 : 16;
        const lane = (a: Pt, b: Pt, dy: number): [Pt, Pt] => {
          const [p, q] = between(a, b, r + 4, r + 4);
          return [
            [p[0], p[1] + dy],
            [q[0], q[1] + dy],
          ];
        };
        const live = (s: number) => (s === step ? 1 : 0.35);
        const send = (s: number, a: Pt, b: Pt, dy: number, tone: typeof pal.ink, label: string) => {
          if (step < s) return;
          const [p, q] = lane(a, b, dy);
          ctx.globalAlpha = live(s);
          if (s === step) flow(ctx, p, q, t, tone, 3, 0.4);
          else line(ctx, p, q, rgba(tone, 1), 1.2);
          cap(ctx, pal, label, (p[0] + q[0]) / 2, p[1] + (dy < 0 ? -8 : 9), tone, "center", fs);
          ctx.globalAlpha = 1;
        };
        send(1, copy, you, -off, AMBER, "Message");
        send(2, you, copy, 0, pal.gold, "Password");
        send(3, copy, real, 0, pal.gold, "Password");
        send(3, you, copy, off, pal.teal, "Code");
        send(4, copy, real, off, pal.teal, "Code");
        // the code itself travels the long way round, from the real site to the real customer
        if (step >= 3) {
          const top = y - r - (small ? 26 : 34);
          ctx.globalAlpha = live(3);
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = rgba(pal.teal, 1);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(real[0], real[1] - r - 3);
          ctx.lineTo(real[0], top);
          ctx.lineTo(you[0], top);
          ctx.lineTo(you[0], you[1] - r - 3);
          ctx.stroke();
          ctx.setLineDash([]);
          if (step === 3) {
            const q = still ? 0.5 : (t * 0.3) % 1;
            dot(ctx, lerp(real[0], you[0], q), top, 3, rgba(pal.teal, 1));
          }
          cap(ctx, pal, "One-time code", (you[0] + real[0]) / 2, top - 8, pal.teal, "center", fs);
          ctx.globalAlpha = 1;
        }
        node(ctx, pal, you, r, pal.accent, "You", false, fs);
        node(ctx, pal, copy, r, ALERT, small ? "Copy" : "Copy of the page", false, fs);
        node(ctx, pal, real, r, pal.emerald, small ? "Real" : "Real site", false, fs);
        if (step === 4) {
          const yb = h - 16;
          const pulse = still ? 1 : 0.6 + 0.4 * Math.sin(t * 4);
          flow(ctx, [real[0], real[1] + r + 22], [copy[0] + 30, yb], t, ALERT, 3, 0.4);
          cap(ctx, pal, "Signed in as you", copy[0], yb, ALERT, "center", fs);
          ctx.strokeStyle = rgba(ALERT, pulse);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(real[0], real[1], r + 5, 0, TAU);
          ctx.stroke();
        }
      },
    [step],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={step} />
      <Slider label="Step" value={step} min={1} max={4} onChange={setStep} text={`${step} of 4`} />
      <Say>{`Step ${step} of 4. ${PHISH[step - 1]}`}</Say>
      <Note>A drawing of the method, with no real site in it. A fake support desk works the same way with a voice in place of the page: the caller asks for the code, or for remote access to the screen, and is given it.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 3. ADVANCE-FEE FRAUD — the money is always one payment away.
 * ------------------------------------------------------------------------- */

export function AdvanceFeeExplainer() {
  const [n, setN] = useState(3);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const fs = small ? 8 : 10;
        const steps = ADVANCE.fees.length + 1;
        const X = (i: number) => lerp(24, w - 34, i / steps);
        const y = h * 0.3;
        line(ctx, [X(0), y], [X(steps), y], rgba(pal.ink3, 0.5), 1, [2, 4]);
        line(ctx, [X(0), y], [X(n), y], rgba(pal.accent, 1), 2);
        // where the prize used to be
        for (let i = 1; i <= n; i++) {
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = rgba(pal.gold, 0.35);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(X(i), y, small ? 7 : 9, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          dot(ctx, X(i), y, 3, rgba(pal.accent, 1));
        }
        dot(ctx, X(0), y, 3, rgba(pal.accent, 1));
        // the prize: a dashed ring, because there is nothing in it, always one step ahead
        const px = X(n + 1) + (still ? 0 : Math.sin(t * 2) * 2);
        const pr = (small ? 10 : 14) + (still ? 0 : Math.sin(t * 3) * 1.2);
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px, y, pr, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        cap(ctx, pal, "The promised sum", Math.min(px, w - 54), y - pr - 10, pal.gold, "center", fs);
        cap(ctx, pal, "You", X(n), y + 16, pal.ink2, "center", fs);
        // what has actually moved: the fees, each larger than the last
        const bot = h - 22;
        const top = h * 0.52;
        const max = ADVANCE.fees[ADVANCE.fees.length - 1];
        line(ctx, [X(0), bot], [X(steps), bot], rgba(pal.ink3, 0.5));
        ADVANCE.fees.forEach((f, i) => {
          const bw = Math.min(26, (X(1) - X(0)) * 0.56);
          const bh = Math.max(2, ((bot - top) * f) / max);
          const paid = i < n;
          ctx.fillStyle = rgba(paid ? ALERT : pal.ink3, paid ? 1 : 0.22);
          ctx.fillRect(X(i + 1) - bw / 2, bot - bh, bw, bh);
        });
        cap(ctx, pal, "Fees paid", X(0), h - 9, ALERT, "left", fs);
        cap(ctx, pal, "Fees still to be invented", X(steps), h - 9, pal.ink3, "right", fs);
      },
    [n],
  );
  const paid = sumTo(ADVANCE.fees, n);
  const next = ADVANCE.fees[n];
  return (
    <div>
      <Stage draw={draw} ratio={1.6} rev={n} />
      <Slider label="Fees paid" value={n} min={0} max={ADVANCE.fees.length} onChange={setN} text={String(n)} />
      <Say>
        {n === 0
          ? `A message promises ${fmt(ADVANCE.prize)} units: a loan, a prize, a legacy, a job. All that stands in the way is one small fee of ${fmt(ADVANCE.fees[0])}.`
          : `${n} ${n === 1 ? "fee" : "fees"} paid, ${fmt(paid)} units in all. The promised ${fmt(ADVANCE.prize)} is still one payment away, exactly as it was at the start. ${next ? `The next fee asked for is ${fmt(next)}.` : "There will be another."}`}
      </Say>
      <Note>Invented units. The promised sum is drawn as an empty ring because it does not exist: the fees are the whole of the business.</Note>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 4. THE FAMOUS FACE THAT NEVER SAID IT — an endorsement assembled from parts.
 * ------------------------------------------------------------------------- */

const PARTS: readonly { name: string; from: string }[] = [
  { name: "Face", from: "The face comes from video the person has already published or appeared in." },
  { name: "Voice", from: "The voice is cloned from recordings of the person speaking in public." },
  { name: "Script", from: "The words are written by the fraudster: a “secret” platform, a guaranteed return, a link." },
  { name: "Setting", from: "The frame is copied too: the look of a news page or a verified account, with invented comments beneath." },
];

export function DeepfakeExplainer() {
  const [n, setN] = useState(4);
  const draw = useMemo<FigureDraw>(
    () =>
      ({ ctx, w, h, t, pal, still }) => {
        if (w < 100 || h < 60) return;
        const small = w < 360;
        const fs = small ? 8 : 10;
        const tones = [pal.accent, pal.teal, pal.gold, AMBER];
        // the frame the viewer sees
        const fx = w * 0.42;
        const fw = w * 0.54;
        const fy = 16;
        const fh = h - 44;
        const head: Pt = [fx + fw * 0.3, fy + fh * 0.5];
        // the four sources, and a thread from each to its part of the frame
        const targets: Pt[] = [head, [fx + fw * 0.66, fy + fh * 0.42], [fx + fw * 0.66, fy + fh * 0.68], [fx + fw * 0.5, fy + 5]];
        PARTS.forEach((p, i) => {
          const y = lerp(fy + 10, fy + fh - 10, i / (PARTS.length - 1));
          const on = i < n;
          const bw = small ? 58 : 76;
          roundRect(ctx, 10, y - 10, bw, 20, 3);
          ctx.fillStyle = rgba(tones[i], on ? 0.18 : 0.05);
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = rgba(on ? tones[i] : pal.ink3, on ? 1 : 0.4);
          ctx.stroke();
          cap(ctx, pal, p.name, 10 + bw / 2, y, on ? pal.ink : pal.ink3, "center", fs);
          if (on) flow(ctx, [10 + bw + 4, y], [fx - 2, lerp(y, targets[i][1], 0.5)], t, tones[i], 2, 0.4, 2);
        });
        roundRect(ctx, fx, fy, fw, fh, 5);
        ctx.fillStyle = rgba(pal.surface, 0.6);
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(n >= 4 ? AMBER : pal.ink3, n >= 4 ? 1 : 0.6);
        ctx.stroke();
        if (n >= 4) {
          // the borrowed setting: a masthead bar, a badge
          ctx.fillStyle = rgba(AMBER, 0.3);
          ctx.fillRect(fx + 1, fy + 1, fw - 2, 10);
          dot(ctx, fx + fw - 9, fy + 6, 3, rgba(AMBER, 1));
        }
        if (n >= 1) {
          // a head and shoulders: nobody's
          const hr = Math.min(fw * 0.11, fh * 0.16);
          ctx.strokeStyle = rgba(pal.accent, 1);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(head[0], head[1] - hr * 0.7, hr, 0, TAU);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(head[0], head[1] + hr * 2.2, hr * 1.9, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        }
        if (n >= 2) {
          // the voice: a waveform
          const x0 = fx + fw * 0.5;
          const bars = 9;
          for (let i = 0; i < bars; i++) {
            const a = still ? 0.4 + 0.5 * Math.abs(Math.sin(i * 1.7)) : 0.25 + 0.75 * Math.abs(Math.sin(t * 5 + i * 1.3));
            const bh = fh * 0.2 * a;
            ctx.fillStyle = rgba(pal.teal, 1);
            ctx.fillRect(x0 + (i * fw * 0.38) / bars, fy + fh * 0.42 - bh / 2, Math.max(2, (fw * 0.38) / bars - 3), bh);
          }
        }
        if (n >= 3) {
          // the script: lines of text
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = rgba(pal.gold, 0.9);
            ctx.fillRect(fx + fw * 0.5, fy + fh * (0.62 + i * 0.08), fw * (i === 2 ? 0.22 : 0.38), 3);
          }
        }
        cap(ctx, pal, n >= 4 ? "Looks like an endorsement" : "Being assembled", fx + fw / 2, fy + fh + 11, n >= 4 ? AMBER : pal.ink3, "center", fs);
        cap(ctx, pal, "Said by the real person: nothing", fx + fw / 2, h - 8, pal.ink2, "center", fs);
      },
    [n],
  );
  return (
    <div>
      <Stage draw={draw} ratio={1.5} rev={n} />
      <Slider label="Parts put together" value={n} min={1} max={PARTS.length} onChange={setN} text={`${n} of ${PARTS.length}`} />
      <Say>
        {`${n} of ${PARTS.length} parts in place. ${PARTS[n - 1].from} ${n === PARTS.length ? "Together they look like a well-known person recommending an investment. The person said none of it and usually does not know the film exists." : "Not one of the parts needed the person’s agreement."}`}
      </Say>
      <Note>A drawing of the method, with no real person in it. How convincing such a film is changes quickly: the page beside this drawing says what does not change.</Note>
    </div>
  );
}
