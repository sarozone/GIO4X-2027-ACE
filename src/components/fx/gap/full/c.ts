import { ALERT, AMBER, TAU, arrow, clamp, disc, lerp, mix, rgba, ring, rr, runner, scene, seg, smooth, tag, wander, type Box, type Colour, type FigureFrame, type Vary } from "./kit";

/**
 * Full scenes, third set: the wider market (currency pairs, central banks,
 * economic data, the trading day round the world) and the practical side
 * (accounts, funding, partners, platforms, steps, decisions). Five chapters
 * each, every one a drawing that answers the pointer; words only, no figure
 * anywhere.
 */

/** where the pointer is across and down a box, 0 to 1 */
const px = (f: FigureFrame, b: Box): number => clamp((f.mx - b.x) / Math.max(1, b.w));
const py = (f: FigureFrame, b: Box): number => clamp((f.my - b.y) / Math.max(1, b.h));

/** a slow swing between 0 and 1, at the scene's own pace and phase */
const wave = (f: FigureFrame, v: Vary, s: number, o = 0): number => 0.5 + 0.5 * Math.sin(f.t * s * v.speed + v.phase + o);

/** a phase that goes round from 0 to 1; rests half-way in a still frame */
const loop = (f: FigureFrame, phase: number): number => (((f.still ? 0.5 : phase) % 1) + 1) % 1;

/** a tag kept inside the box: pulled in from the edges, and left out where it cannot fit */
function lab(f: FigureFrame, b: Box, s: string, x: number, y: number, align: CanvasTextAlign = "center", c: Colour = f.pal.ink3, alpha = 1): void {
  if (alpha <= 0.02 || b.h < 20) return;
  f.ctx.font = `600 9.5px ${f.pal.font}`;
  const tw = f.ctx.measureText(s.toUpperCase()).width + s.length * 0.5 + 1;
  if (tw > b.w) return;
  const lo = align === "left" ? b.x : align === "right" ? b.x + tw : b.x + tw / 2;
  const hi = align === "left" ? b.r - tw : align === "right" ? b.r : b.r - tw / 2;
  tag(f, s, clamp(x, lo, hi), clamp(y, b.y + 8, b.b - 1), align, c, alpha);
}

/** a rounded plate, filled and outlined in one colour */
function plate(f: FigureFrame, x: number, y: number, w: number, h: number, c: Colour, fillA: number, lineA = 0.95, rad = 3): void {
  const { ctx } = f;
  rr(ctx, x, y, w, h, rad);
  if (fillA > 0) {
    ctx.fillStyle = rgba(c, fillA);
    ctx.fill();
  }
  if (lineA > 0) {
    ctx.strokeStyle = rgba(c, lineA);
    ctx.stroke();
  }
}

/** a coin: a tinted disc with a rim */
function coin(f: FigureFrame, x: number, y: number, r: number, c: Colour, fillA = 0.22): void {
  const { ctx } = f;
  ctx.fillStyle = rgba(c, fillA);
  disc(ctx, x, y, r);
  ctx.strokeStyle = rgba(c, 0.95);
  ring(ctx, x, y, r);
  if (r > 7) {
    ctx.strokeStyle = rgba(c, 0.35);
    ring(ctx, x, y, r - 3);
  }
}

/** a tick of half-width `s`, drawn as far as `u` (0 to 1) in the current stroke */
function tick(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, u = 1): void {
  const a = clamp(u * 2);
  const c = clamp(u * 2 - 1);
  if (a <= 0 || s <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x - s + s * 0.7 * a, y + s * 0.7 * a);
  if (c > 0) ctx.lineTo(x - s * 0.3 + s * 1.3 * c, y + s * 0.7 - s * 1.5 * c);
  ctx.stroke();
}

/** head and shoulders standing on `y`, about 2.2 × `s` tall, in the current fill */
function person(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const r = Math.max(0, s);
  disc(ctx, x, y - r * 1.7, r * 0.5);
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, TAU);
  ctx.closePath();
  ctx.fill();
}

/** the outline of a gear with `n` teeth (the caller fills or strokes it) */
function gear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number, rot: number): void {
  const R = Math.max(0, r);
  const m = n * 4;
  ctx.beginPath();
  for (let i = 0; i < m; i++) {
    const a = rot + ((i - 0.5) / m) * TAU;
    const rad = i % 4 < 2 ? R : R * 0.8;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    else ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}

/** a building with a pediment and columns; `lit` (0 to 1) is where along the columns the light stands */
function temple(f: FigureFrame, x: number, y: number, w: number, h: number, c: Colour, lit: number): void {
  const { ctx } = f;
  if (w < 6 || h < 6) return;
  const roof = h * 0.28;
  const base = Math.max(2, h * 0.1);
  ctx.fillStyle = rgba(c, 0.1);
  ctx.strokeStyle = rgba(c, 0.9);
  ctx.beginPath();
  ctx.moveTo(x, y + roof);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + roof);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(x, y + h - base, w, base);
  ctx.strokeRect(x, y + h - base, w, base);
  const n = w > 64 ? 5 : 3;
  for (let i = 0; i < n; i++) {
    const cx = x + (w * (i + 0.5)) / n;
    const on = clamp(1 - Math.abs(lit * (n - 1) - i));
    ctx.strokeStyle = rgba(mix(c, f.pal.gold, on), 0.9);
    ctx.lineWidth = clamp(w * 0.035, 1.4, 5) * (1 + 0.3 * on);
    seg(ctx, cx, y + roof + 4, cx, y + h - base - 3);
  }
  ctx.lineWidth = 1.4;
}

/** an upright scale with a marker at `level` (0 to 1) and the column below it filled */
function gauge(f: FigureFrame, x: number, top: number, bot: number, level: number, c: Colour): void {
  const { ctx } = f;
  const y = lerp(bot, top, clamp(level));
  plate(f, x - 3, top, 6, bot - top, f.pal.ink3, 0, 0.6, 3);
  ctx.fillStyle = rgba(c, 0.45);
  rr(ctx, x - 3, y, 6, bot - y, 3);
  ctx.fill();
  ctx.strokeStyle = rgba(c, 1);
  ctx.lineWidth = 2.4;
  seg(ctx, x - 6, y, x + 6, y);
  ctx.lineWidth = 1.4;
}

/** a wallet: a body with a clasp, filled to `level` (0 to 1); the clasp stands a little proud of the right edge */
function purse(f: FigureFrame, x: number, y: number, w: number, h: number, c: Colour, level: number): void {
  const { ctx } = f;
  const lv = clamp(level);
  plate(f, x, y, w, h, c, 0.05, 0.95, Math.min(6, h * 0.2));
  ctx.fillStyle = rgba(f.pal.accent, 0.3);
  rr(ctx, x + 2, y + 2 + (h - 4) * (1 - lv), w - 4, (h - 4) * lv, 3);
  ctx.fill();
  const cw = Math.min(w * 0.3, 16);
  const ch = Math.min(h * 0.34, 12);
  plate(f, x + w - cw * 0.75, y + h / 2 - ch / 2, cw, ch, c, 0.12, 0.95, ch / 2);
  ctx.fillStyle = rgba(c, 0.95);
  disc(ctx, x + w - cw * 0.3, y + h / 2, Math.min(1.8, ch * 0.25));
}

/** a wandering line from `x1` to `x2` about `y`, in the current stroke: the stand-in for a price. Returns the height it ends at. */
function trace(f: FigureFrame, x1: number, x2: number, y: number, amp: number, tt: number, phase: number, n = 36, upto = 1): number {
  const { ctx } = f;
  const m = Math.max(1, Math.round(n * clamp(upto)));
  let ly = y;
  ctx.beginPath();
  for (let i = 0; i <= m; i++) {
    ly = y - wander(tt - (n - i) * 0.14, phase) * amp;
    if (i === 0) ctx.moveTo(x1, ly);
    else ctx.lineTo(lerp(x1, x2, i / n), ly);
  }
  ctx.stroke();
  return ly;
}

/**
 * ACCOUNTS, told in five chapters: a ladder of tiers, the minimum deposit each
 * asks for, the two ways trading is charged (spread or commission), how the way
 * you trade decides which matters, and choosing one.
 */
export const accounts = scene((v) => ({
  caption: "Accounts",
  line: "Account types are tiers of one service: each asks for a different minimum deposit and charges for trading in a different way, so the right one depends on how you trade.",
  parts: [
    {
      label: "A ladder of tiers",
      note: "The same markets, offered on several levels of terms.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 4;
        const top = b.y + 12;
        const bot = b.b - 2;
        const sh = (bot - top) / n;
        const gap = Math.min(4, sh * 0.25);
        const left = v.dir > 0;
        const width = (i: number) => b.w * lerp(0.9, 0.4, i / (n - 1)) * p;
        // the pointer picks the tier it is level with; left alone, the marker climbs and comes down
        const sel = lerp(wave(f, v, 0.5), 1 - py(f, b), k) * (n - 1);
        for (let i = 0; i < n; i++) {
          const w = width(i);
          const x = left ? b.x : b.r - w;
          const y = bot - (i + 1) * sh + gap;
          const on = clamp(1 - Math.abs(sel - i));
          plate(f, x, y, w, sh - gap, mix(pal.ink3, pal.accent, on), 0.08 + 0.3 * on);
          // three marks on every tier: the three things that differ between them
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = rgba(j === 0 ? pal.gold : j === 1 ? pal.teal : pal.ink2, 0.45 + 0.5 * on);
            disc(ctx, left ? x + 7 + j * 8 : x + w - 7 - j * 8, y + (sh - gap) / 2, Math.min(2.4, sh * 0.2));
          }
        }
        const edge = (i: number) => clamp(left ? b.x + width(i) + 9 : b.r - width(i) - 9, b.x + 6, b.r - 6);
        const my = bot - (sel + 0.5) * sh + gap / 2;
        ctx.strokeStyle = rgba(pal.accent, 1);
        ring(ctx, edge(sel), my, Math.min(5, sh * 0.35) + k);
        ctx.fillStyle = rgba(pal.accent, 0.9);
        disc(ctx, edge(sel), my, 1.6);
        runner(f, edge(0), bot - sh / 2, edge(n - 1), top + sh / 2, t * 0.12 * v.speed + v.a, pal.gold);
        lab(f, b, "higher tier", left ? b.r : b.x, b.y + 8, left ? "right" : "left");
      },
    },
    {
      label: "The minimum deposit",
      note: "Each tier asks for a different amount to open it.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 3;
        const top = b.y + 12;
        const base = b.b - 13;
        const H = base - top;
        // the pointer chooses the tier whose bar is being filled
        const sel = lerp(wave(f, v, 0.4), px(f, b), k) * (n - 1);
        const cw = Math.min(54, b.w / (n * 1.7));
        const ch = Math.max(2.5, H / 10);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, base, b.r, base);
        for (let i = 0; i < n; i++) {
          const x = b.x + (b.w * (i + 0.5)) / n;
          const need = H * lerp(0.32, 0.92, i / (n - 1));
          const on = clamp(1 - Math.abs(sel - i));
          ctx.save();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = rgba(pal.gold, 0.4 + 0.55 * on);
          seg(ctx, x - cw / 2 - 4, base - need, x + cw / 2 + 4, base - need);
          ctx.restore();
          const coins = Math.min(10, Math.floor((need * (0.35 + 0.65 * on) * p) / ch));
          for (let j = 0; j < coins; j++) plate(f, x - cw / 2, base - (j + 1) * ch + 1, cw, ch - 1.5, pal.accent, 0.2 + 0.4 * on, 0.5 + 0.45 * on, ch / 2);
          if (on > 0.5) runner(f, x, top, x, base - coins * ch, t * 0.35 * v.speed + i * 0.3, pal.accent, 2.4);
        }
        lab(f, b, "minimum", b.r, b.y + 8, "right", pal.gold);
        lab(f, b, "less", b.x + b.w / 6, b.b - 2);
        lab(f, b, "more", b.r - b.w / 6, b.b - 2);
      },
    },
    {
      label: "Spread or commission",
      note: "Some tiers charge in the spread; others add a commission to a tighter one.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const mid = (top + bot) / 2;
        // the pointer slides between the two ways of charging: left, all in the spread; right, tight with a commission
        const m = lerp(wave(f, v, 0.45), px(f, b), k);
        const xr = b.x + b.w * 0.66;
        const gap = H * lerp(0.6, 0.14, m) * p;
        const N = 30;
        for (let s = -1; s <= 1; s += 2) {
          ctx.strokeStyle = rgba(s < 0 ? pal.ink : pal.ink2, 0.9);
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const y = mid - wander(t * 0.6 * v.speed - (N - i) * 0.14, v.phase) * H * 0.12 + (s * gap) / 2;
            if (i === 0) ctx.moveTo(b.x, y);
            else ctx.lineTo(lerp(b.x, xr, i / N), y);
          }
          ctx.stroke();
        }
        const end = mid - wander(t * 0.6 * v.speed, v.phase) * H * 0.12;
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        ctx.lineWidth = 2 + k;
        seg(ctx, xr + 6, end - gap / 2, xr + 6, end + gap / 2);
        ctx.lineWidth = 1.4;
        const bx = b.x + b.w * 0.8;
        const bw = Math.max(0, b.r - 2 - bx);
        const bh = H * 0.8 * m * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, bx - 4, bot, b.r, bot);
        plate(f, bx, bot - bh, bw, bh, pal.teal, 0.25 + 0.3 * k, 0.95, 2);
        if (m > 0.3) runner(f, xr + 6, end, bx + bw / 2, bot - bh, t * 0.3 * v.speed + v.a, pal.teal);
        lab(f, b, "spread", b.x, b.b - 2, "left", pal.gold);
        lab(f, b, "commission", b.r, b.b - 2, "right", pal.teal);
      },
    },
    {
      label: "How you trade",
      note: "How often and how large you trade decides which cost weighs most.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 3;
        const ch = clamp(b.h * 0.16, 8, 20);
        const trackY = b.b - 15;
        const y0 = b.y + ch + 6;
        const lineY = (y0 + trackY - 4) / 2;
        const amp = Math.max(0, (trackY - 4 - y0) * 0.4);
        // the pointer moves the knob from trading seldom to trading often
        const m = lerp(wave(f, v, 0.35), px(f, b), k);
        const kx = lerp(b.x + 6, b.r - 6, m);
        const cw = (b.w - 6 * (n - 1)) / n;
        for (let i = 0; i < n; i++) {
          const on = clamp(1 - Math.abs(m * (n - 1) - i));
          plate(f, b.x + i * (cw + 6), b.y + 1, cw, ch, mix(pal.ink3, pal.accent, on), 0.06 + 0.4 * on);
        }
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.accent, 0.5);
        seg(ctx, kx, trackY, lerp(b.x + cw / 2, b.r - cw / 2, m), b.y + ch + 2);
        ctx.restore();
        ctx.strokeStyle = rgba(pal.ink, 0.85);
        trace(f, b.x, b.r, lineY, amp * p, t * 0.5 * v.speed, v.phase, 40);
        // one mark for every trade: the more often, the more of them
        const count = Math.round(lerp(2, 11, m));
        ctx.fillStyle = rgba(pal.teal, 0.95);
        for (let i = 0; i < count; i++) {
          const u = (i + 0.5) / count;
          disc(ctx, b.x + u * b.w, lineY - wander(t * 0.5 * v.speed - (1 - u) * 40 * 0.14, v.phase) * amp * p, 2.4);
        }
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, b.x + 6, trackY, b.r - 6, trackY);
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, kx, trackY, 4 + k * 1.5);
        lab(f, b, "seldom", b.x, b.b - 2, "left");
        lab(f, b, "often", b.r, b.b - 2, "right");
      },
    },
    {
      label: "Choose one tier",
      note: "Read what each one costs, then take the one that fits.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const n = 3;
        const top = b.y + 13;
        const bot = b.b - 13;
        const cw = (b.w - 8 * (n - 1)) / n;
        const H = bot - top - 3;
        // the card under the pointer is the one chosen
        const sel = lerp(wave(f, v, 0.4), px(f, b), k) * (n - 1);
        let bestX = b.cx;
        let best = 0;
        for (let i = 0; i < n; i++) {
          const on = smooth(clamp(1 - Math.abs(sel - i)));
          const x = b.x + i * (cw + 8);
          const y = top + 3 - 3 * on;
          plate(f, x, y, cw, H, mix(pal.ink3, pal.accent, on), 0.05 + 0.2 * on, 0.6 + 0.4 * on, 4);
          // three bars a card: deposit, spread, commission, each long on one tier and short on another
          for (let j = 0; j < 3; j++) {
            const len = (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(i * 2.1 + j * 2.6 + v.a * 6))) * p;
            ctx.strokeStyle = rgba(j === 0 ? pal.gold : j === 1 ? pal.teal : pal.ink2, 0.5 + 0.45 * on);
            ctx.lineWidth = clamp(H * 0.07, 1.4, 4);
            seg(ctx, x + 5, y + H * (0.3 + j * 0.22), x + 5 + Math.max(0, cw - 10) * len, y + H * (0.3 + j * 0.22));
          }
          ctx.lineWidth = 1.4;
          if (on > best) {
            best = on;
            bestX = x + cw / 2;
          }
          if (on > 0.5 && H > 40) {
            ctx.strokeStyle = rgba(pal.emerald, 1);
            tick(ctx, x + cw - 9, y + 8, 4, (on - 0.5) * 2);
          }
        }
        lab(f, b, "compare", b.x, b.y + 8, "left");
        lab(f, b, "chosen", bestX, b.b - 2, "center", pal.accent, best);
      },
    },
  ],
}));

/**
 * CENTRAL BANKS, told in five chapters: the bank and the rate it sets, the rate
 * going up, the rate going down, money moving towards the higher yield, and the
 * currency answering.
 */
export const bank = scene((v) => ({
  caption: "Central banks",
  line: "A central bank sets the price of borrowing its currency; when that rate changes, money moves towards or away from the currency, and the exchange rate moves with it.",
  parts: [
    {
      label: "The bank's rate",
      note: "One institution sets the policy rate for a whole currency.",
      draw: (f, b, k, p) => {
        const { pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 3;
        const gx = b.r - Math.min(22, b.w * 0.14);
        const bw = Math.min(b.w * 0.62, (bot - top) * 1.5) * (0.7 + 0.3 * p);
        const bh = Math.min(bot - top, bw * 0.8);
        const bx = Math.max(b.x, b.x + (gx - 16 - b.x - bw) / 2);
        temple(f, bx, bot - bh, bw, bh, pal.ink, wave(f, v, 0.6));
        // the pointer raises and lowers the rate
        const level = lerp(0.5 + 0.25 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k) * p;
        gauge(f, gx, top, bot, level, pal.gold);
        runner(f, bx + bw, bot - bh * 0.5, gx - 8, lerp(bot, top, level), t * 0.3 * v.speed + v.a, pal.gold);
        lab(f, b, "policy rate", b.r, b.y + 8, "right", pal.gold);
        if (b.w > 190) lab(f, b, "central bank", bx + bw / 2, b.y + 8);
      },
    },
    {
      label: "The rate goes up",
      note: "Borrowing costs more, and saving in the currency pays more.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        // the pointer sets how far the rate is raised
        const m = lerp(0.6 + 0.25 * Math.sin(t * 0.5 * v.speed + v.phase), px(f, b), k) * p;
        const gx = b.x + 8;
        gauge(f, gx, top, bot, m, pal.gold);
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        arrow(ctx, gx + 14, bot - H * 0.12, gx + 14, bot - H * (0.12 + 0.7 * m), 5);
        const bw = Math.min(40, b.w * 0.18);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x + b.w * 0.32, bot, b.r, bot);
        ctx.save();
        ctx.setLineDash([2, 4]);
        seg(ctx, b.x + b.w * 0.32, bot - H * 0.28, b.r, bot - H * 0.28);
        ctx.restore();
        for (let i = 0; i < 2; i++) {
          const x = b.x + b.w * (i ? 0.82 : 0.52);
          const hgt = H * lerp(0.28, 0.95, m) * (i ? 0.9 : 1);
          plate(f, x - bw / 2, bot - hgt, bw, hgt, i ? pal.teal : pal.accent, 0.25 + 0.3 * k, 0.95, 2);
          runner(f, x, bot - 2, x, bot - hgt, t * 0.3 * v.speed + i * 0.4, i ? pal.teal : pal.accent, 2);
          lab(f, b, i ? "savings" : "loans", x, b.b - 2);
        }
        if (b.w > 200) lab(f, b, "before", b.r, bot - H * 0.28 - 4, "right");
      },
    },
    {
      label: "The rate goes down",
      note: "Borrowing gets cheaper, and holding the currency pays less.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        // the pointer lowers the rate: the lower it stands, the wider lending flows
        const lvl = lerp(0.3 + 0.2 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k);
        const ease = (1 - lvl) * p;
        const gx = b.x + 8;
        gauge(f, gx, top, bot, lvl, pal.gold);
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        arrow(ctx, gx + 14, top + H * 0.12, gx + 14, top + H * (0.12 + 0.7 * (1 - lvl)), 5);
        const x0 = b.x + 30;
        const x1 = b.r - 4;
        const hw = H * lerp(0.06, 0.34, ease);
        ctx.strokeStyle = rgba(pal.ink2, 0.85);
        for (let s = -1; s <= 1; s += 2) {
          ctx.beginPath();
          ctx.moveTo(x0, cy + s * H * 0.06);
          ctx.lineTo(lerp(x0, x1, 0.3), cy + s * hw);
          ctx.lineTo(x1, cy + s * hw);
          ctx.stroke();
        }
        const lanes = 2 + Math.round(ease * 4);
        for (let i = 0; i < lanes; i++) {
          const y = cy + hw * 0.75 * (lanes > 1 ? (i / (lanes - 1)) * 2 - 1 : 0);
          runner(f, lerp(x0, x1, 0.3), y, x1, y, t * 0.22 * v.speed + i * 0.37 + v.a, i % 2 ? pal.teal : pal.accent, 2.2);
        }
        lab(f, b, "rate", b.x, b.b - 2, "left", pal.gold);
        lab(f, b, "lending", b.r, b.b - 2, "right", pal.teal);
      },
    },
    {
      label: "Money follows yield",
      note: "Funds tend to move towards the currency that pays more.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        // the pointer decides which of the two currencies pays more
        const d = lerp(Math.sin(t * 0.4 * v.speed + v.phase), px(f, b) * 2 - 1, k) * p;
        const vw = Math.min(b.w * 0.28, 110);
        for (let s = -1; s <= 1; s += 2) {
          const x = s < 0 ? b.x + 2 : b.r - 2 - vw;
          const lvl = 0.5 + 0.32 * s * d;
          ctx.fillStyle = rgba(pal.accent, 0.18 + 0.25 * lvl);
          ctx.fillRect(x + 1, bot - H * 0.85 * lvl, vw - 2, H * 0.85 * lvl);
          ctx.strokeStyle = rgba(pal.ink2, 0.9);
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bot);
          ctx.lineTo(x + vw, bot);
          ctx.lineTo(x + vw, top);
          ctx.stroke();
          ctx.strokeStyle = rgba(pal.gold, 0.95);
          arrow(ctx, x + vw / 2, bot - 5, x + vw / 2, bot - 5 - H * 0.6 * (0.5 + 0.4 * s * d), 5);
          lab(f, b, s * d > 0 ? "higher rate" : "lower rate", x + vw / 2, b.b - 2, "center", pal.ink3, clamp(Math.abs(d) * 3));
        }
        if (Math.abs(d) > 0.08) {
          const xa = b.x + vw + 7;
          const xb = b.r - vw - 7;
          for (let i = 0; i < 3; i++) {
            const y = bot - H * (0.25 + 0.2 * i);
            runner(f, d > 0 ? xa : xb, y, d > 0 ? xb : xa, y, t * 0.25 * v.speed + i / 3, pal.accent, 1.6 + Math.abs(d));
          }
        }
        lab(f, b, "funds", b.cx, b.y + 8);
      },
    },
    {
      label: "The currency responds",
      note: "Demand shifts the exchange rate, often before the decision itself.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const xd = b.x + b.w * 0.6;
        // the pointer sets what the market expects: up the box for a rise, down it for a cut
        const bias = lerp(Math.sin(t * 0.3 * v.speed + v.phase), 1 - 2 * py(f, b), k);
        const N = 44;
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.7);
        seg(ctx, xd, top, xd, bot);
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, b.x, cy, b.r, cy);
        ctx.restore();
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        let ly = cy;
        for (let i = 0; i <= N * p; i++) {
          const u = i / N;
          ly = cy - bias * H * 0.3 * smooth(u / 0.6) - wander(t * 0.6 * v.speed - (N - i) * 0.14, v.phase) * H * 0.09;
          if (i === 0) ctx.moveTo(b.x, ly);
          else ctx.lineTo(b.x + u * b.w, ly);
        }
        ctx.stroke();
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, clamp(b.x + b.w * p, b.x + 5, b.r - 5), ly, 3 + k * 1.5);
        lab(f, b, "expected", b.x, b.y + 8, "left");
        lab(f, b, "decision", xd, b.b - 2, "center", pal.gold);
      },
    },
  ],
}));

/**
 * ECONOMIC DATA, told in five chapters: a release waiting on the calendar, the
 * forecast, the actual figure set beside it, the market's reaction to the
 * surprise, and the calm that follows.
 */
export const data = scene((v) => ({
  caption: "Economic data",
  line: "A scheduled release is measured against what was forecast: it is the surprise, more than the number itself, that moves the market.",
  parts: [
    {
      label: "A scheduled release",
      note: "The moment is known in advance, and the market waits for it.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const xr = b.x + b.w * 0.72;
        const iw = clamp(b.u * 0.3, 14, Math.min(70, b.w * 0.5));
        const ih = Math.min(iw, Math.max(0, H - 8));
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, bot, b.r, bot);
        for (let i = 0; i <= 8; i++) seg(ctx, b.x + (b.w * i) / 8, bot, b.x + (b.w * i) / 8, bot - 3);
        // the calendar page: a band along the top and one marked day
        plate(f, xr - iw / 2, bot - 5 - ih, iw, ih, pal.ink2, 0.05, 0.9, 3);
        ctx.fillStyle = rgba(pal.ink2, 0.35);
        ctx.fillRect(xr - iw / 2 + 1, bot - 5 - ih + 1, iw - 2, ih * 0.22);
        ctx.fillStyle = rgba(pal.gold, 0.95);
        disc(ctx, xr, bot - 5 - ih * 0.36, Math.min(iw, ih) * (0.14 + 0.03 * Math.sin(t * 1.2 * v.speed)));
        // the pointer moves "now" along the line towards the release
        const nowX = lerp(lerp(b.x + b.w * 0.12, xr - iw / 2 - 4, wave(f, v, 0.4)), clamp(f.mx, b.x + 4, xr - iw / 2 - 4), k);
        const mid = top + H * 0.42;
        const N = 30;
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        let ly = mid;
        for (let i = 0; i <= N; i++) {
          const x = lerp(b.x, xr - iw / 2 - 4, i / N);
          if (x > nowX) break;
          // the nearer the release, the quieter the market
          ly = mid - wander(t * 0.6 * v.speed + i * 0.5, v.phase) * H * 0.3 * (1 - 0.75 * (i / N)) * p;
          if (i === 0) ctx.moveTo(x, ly);
          else ctx.lineTo(x, ly);
        }
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.accent, 0.9);
        seg(ctx, nowX, ly, nowX, bot);
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, nowX, ly, 2.6 + k);
        lab(f, b, "release", xr, b.b - 2, "center", pal.gold);
        lab(f, b, "now", nowX, b.b - 2, "center", pal.accent, clamp((xr - nowX - 46) / 20));
        lab(f, b, "waiting", b.x, b.y + 8, "left");
      },
    },
    {
      label: "The forecast",
      note: "Analysts publish what they expect, and prices settle around it.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const base = b.b - 13;
        const H = base - top;
        const n = 6;
        const sw = b.w / n;
        const bw = sw * 0.56;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, base, b.r, base);
        for (let i = 0; i < n - 1; i++) {
          const hgt = H * (0.38 + 0.3 * (0.5 + 0.5 * Math.sin(i * 1.9 + v.a * 6))) * p;
          plate(f, b.x + sw * (i + 0.5) - bw / 2, base - hgt, bw, hgt, pal.ink3, 0.18, 0.6, 2);
        }
        // the pointer moves the consensus up and down; the estimates gather round it
        const c = clamp(lerp(0.6 + 0.08 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k), 0.15, 0.92);
        const x = b.x + sw * (n - 0.5);
        const spread = lerp(0.22, 0.07, p * (0.4 + 0.6 * k));
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        rr(ctx, x - bw / 2, base - H * c, bw, H * c, 2);
        ctx.stroke();
        seg(ctx, b.x, base - H * c, x - bw / 2, base - H * c);
        ctx.restore();
        for (let j = 0; j < 7; j++) {
          const off = Math.sin(j * 2.4 + v.b * 6 + t * 0.4 * v.speed) * spread;
          ctx.fillStyle = rgba(j % 2 ? pal.teal : pal.accent, 0.85);
          disc(ctx, x + bw * 0.42 * Math.sin(j * 1.7 + v.c * 6), base - H * clamp(c + off, 0.04, 1), 2.2);
        }
        lab(f, b, "past", b.x, b.b - 2, "left");
        lab(f, b, "forecast", b.r, b.b - 2, "right", pal.gold);
      },
    },
    {
      label: "The actual figure",
      note: "The number is published and set beside what was expected.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const base = b.b - 13;
        const H = base - top;
        const bw = Math.min(46, b.w * 0.2);
        const xF = b.x + b.w * 0.34;
        const xA = b.x + b.w * 0.62;
        const fc = H * 0.55;
        // the pointer sets where the actual figure lands: above the forecast or below it
        const act = H * clamp(lerp(0.55 + 0.3 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k), 0.1, 1) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, base, b.r, base);
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.95);
        rr(ctx, xF - bw / 2, base - fc, bw, fc, 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.gold, 0.5);
        seg(ctx, xF + bw / 2, base - fc, b.r, base - fc);
        ctx.restore();
        plate(f, xA - bw / 2, base - act, bw, act, pal.teal, 0.3 + 0.3 * k, 0.95, 2);
        runner(f, xA, top, xA, base - act, t * 0.3 * v.speed + v.a, pal.teal, 2);
        // the surprise: the distance between the two
        const sx = xA + bw / 2 + 8;
        ctx.strokeStyle = rgba(pal.accent, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, sx, base - fc, sx, base - act);
        ctx.lineWidth = 1.4;
        seg(ctx, sx - 3, base - act, sx + 3, base - act);
        // a narrow box has no room beside the bars: the names move to the corners
        if (b.w >= 200) lab(f, b, "surprise", sx + 7, base - (fc + act) / 2 + 3, "left", pal.accent);
        else lab(f, b, "surprise", b.r, b.y + 8, "right", pal.accent);
        if (b.w >= 150) lab(f, b, "forecast", xF, b.b - 2, "center", pal.gold);
        lab(f, b, "actual", xA, b.b - 2, "center", pal.teal);
      },
    },
    {
      label: "The market reacts",
      note: "The larger the surprise, the sharper the first move tends to be.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const ur = 0.4;
        // the pointer sets the surprise: up the box for more than forecast, down it for less
        const s = lerp(Math.sin(t * 0.45 * v.speed + v.phase), 1 - 2 * py(f, b), k);
        const N = 48;
        const trend = (u: number) => cy - s * H * 0.22 * smooth((u - ur) / 0.1);
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.8);
        seg(ctx, b.x + ur * b.w, top, b.x + ur * b.w, bot);
        ctx.strokeStyle = rgba(AMBER, 0.6);
        for (let e = -1; e <= 1; e += 2) {
          ctx.beginPath();
          for (let i = 0; i <= N; i += 2) {
            const u = i / N;
            const y = trend(u) + e * H * (0.05 + 0.2 * Math.abs(s) * smooth((u - ur) / 0.1));
            if (i === 0) ctx.moveTo(b.x, y);
            else ctx.lineTo(b.x + u * b.w, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        for (let i = 0; i <= N * p; i++) {
          const u = i / N;
          const y = trend(u) - wander(t * 0.9 * v.speed - (N - i) * 0.2, v.phase) * H * (0.03 + 0.09 * Math.abs(s) * smooth((u - ur) / 0.1));
          if (i === 0) ctx.moveTo(b.x, y);
          else ctx.lineTo(b.x + u * b.w, y);
        }
        ctx.stroke();
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, b.x + ur * b.w, cy, 3 + k * 1.5);
        lab(f, b, "calm", b.x, b.y + 8, "left");
        lab(f, b, "reaction", b.r, b.y + 8, "right", AMBER);
        lab(f, b, "release", b.x + ur * b.w, b.b - 2, "center", pal.gold);
      },
    },
    {
      label: "The calm after",
      note: "Prices settle at a new level, and spreads narrow again.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const lvl = -v.dir * H * 0.14;
        const N = 48;
        const trend = (u: number) => cy + lvl * (2 * smooth(u * 4) - 1);
        const half = (u: number) => H * (0.06 + 0.24 * Math.exp(-u * 4));
        ctx.strokeStyle = rgba(pal.teal, 0.55);
        for (let e = -1; e <= 1; e += 2) {
          ctx.beginPath();
          for (let i = 0; i <= N; i += 2) {
            const u = i / N;
            if (i === 0) ctx.moveTo(b.x, trend(u) + e * half(u));
            else ctx.lineTo(b.x + u * b.w, trend(u) + e * half(u));
          }
          ctx.stroke();
        }
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        for (let i = 0; i <= N * p; i++) {
          const u = i / N;
          const y = trend(u) + H * 0.18 * Math.exp(-u * 4) * Math.sin(u * 30 - t * 1.2 * v.speed) + wander(t * 0.6 * v.speed + u * 5, v.phase) * H * 0.03;
          if (i === 0) ctx.moveTo(b.x, y);
          else ctx.lineTo(b.x + u * b.w, y);
        }
        ctx.stroke();
        // the pointer moves along the minutes after: the gap between the two prices is measured where it stands
        const cu = lerp(0.3 + 0.5 * wave(f, v, 0.35), px(f, b), k);
        const cx = b.x + cu * b.w;
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, cx, trend(cu) - half(cu), cx, trend(cu) + half(cu));
        ctx.lineWidth = 1.4;
        lab(f, b, "spread", cx, b.y + 8, "center", pal.gold);
        lab(f, b, "release", b.x, b.b - 2, "left");
        lab(f, b, "settled", b.r, b.b - 2, "right", pal.teal);
      },
    },
  ],
}));

/**
 * DECISIONS, told in five chapters: a path that divides, weighing the two
 * sides, writing the plan beforehand, the pull of the moment, and keeping to
 * the plan trade after trade.
 */
export const fork = scene((v) => ({
  caption: "Decisions",
  line: "A trading decision is a choice between paths, best made before the moment arrives; its worth lies in keeping to it when the moment comes.",
  parts: [
    {
      label: "A path divides",
      note: "Every trade begins as a choice: to act, or to wait.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 3;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const X = (u: number) => (v.dir > 0 ? b.x + u * b.w : b.r - u * b.w);
        const jx = X(0.4);
        const ex = X(0.82);
        const mx = X(0.62);
        const ya = top + H * 0.14;
        const yb = bot - H * 0.14;
        // the traveller takes the branch the pointer is nearer; left alone, first one and then the other
        const wgt = lerp(smooth(0.5 + Math.sin(t * 0.35 * v.speed + v.phase) * 1.6), f.my < cy ? 0 : 1, k);
        ctx.strokeStyle = rgba(pal.ink, 0.85);
        ctx.lineWidth = 2;
        seg(ctx, X(0.03), cy, jx, cy);
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 2; i++) {
          const on = i ? wgt : 1 - wgt;
          const ye = i ? yb : ya;
          ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, on), 0.5 + 0.5 * on);
          ctx.beginPath();
          ctx.moveTo(jx, cy);
          ctx.quadraticCurveTo(mx, cy, lerp(jx, ex, p), lerp(cy, ye, p));
          ctx.stroke();
          ring(ctx, ex, ye, 4 + 2 * on);
          if (b.w >= 130) lab(f, b, i ? "wait" : "act", ex + v.dir * 10, ye + 3, v.dir > 0 ? "left" : "right", mix(pal.ink3, pal.accent, on));
        }
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        seg(ctx, jx, cy, jx, cy - Math.min(12, H * 0.2));
        const q = loop(f, t * 0.16 * v.speed + v.a);
        const s = clamp((q - 0.4) / 0.6);
        const ye = lerp(ya, yb, wgt);
        const tx = q < 0.4 ? lerp(X(0.03), jx, q / 0.4) : (1 - s) * (1 - s) * jx + 2 * (1 - s) * s * mx + s * s * ex;
        const ty = q < 0.4 ? cy : (1 - s * s) * cy + s * s * ye;
        ctx.fillStyle = rgba(pal.gold, clamp(Math.sin(q * Math.PI) * 3));
        disc(ctx, tx, ty, 3.5);
        lab(f, b, "choice", jx, b.y + 8, "center", pal.gold);
      },
    },
    {
      label: "Weigh each side",
      note: "What could be gained is set against what could be lost.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const L = Math.min(b.w * 0.34, H * 0.5);
        const pivY = top + H * 0.2;
        // the pointer adds weight to the side it is on
        const lean = k * (px(f, b) - 0.5);
        const th = clamp(0.1 * Math.sin(t * 0.6 * v.speed + v.phase) + lean * 0.6, -0.4, 0.4) * p;
        const s0 = Math.min(H * 0.2, b.w * 0.1);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, b.cx, pivY, b.cx, bot);
        seg(ctx, b.cx - 14, bot, b.cx + 14, bot);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2.2;
        seg(ctx, b.cx - Math.cos(th) * L, pivY - Math.sin(th) * L, b.cx + Math.cos(th) * L, pivY + Math.sin(th) * L);
        ctx.lineWidth = 1.4;
        for (let side = -1; side <= 1; side += 2) {
          const x = b.cx + side * Math.cos(th) * L;
          const y = pivY + side * Math.sin(th) * L;
          const pan = y + H * 0.3;
          const col = side < 0 ? ALERT : pal.emerald;
          const sz = s0 * (1 + side * lean);
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          seg(ctx, x, y, x - s0 * 0.9, pan);
          seg(ctx, x, y, x + s0 * 0.9, pan);
          ctx.strokeStyle = rgba(pal.ink, 0.9);
          seg(ctx, x - s0 * 1.1, pan, x + s0 * 1.1, pan);
          plate(f, x - sz / 2, pan - sz - 1, sz, sz, col, 0.3 + 0.3 * k, 0.95, 2);
          lab(f, b, side < 0 ? "risk" : "reward", x, b.b - 2, "center", col);
        }
      },
    },
    {
      label: "Write the plan first",
      note: "Entry, exit and size are decided while the mind is calm.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 2;
        const H = bot - top;
        const x0 = b.x + b.w * 0.06;
        const x1 = b.r - b.w * 0.06;
        const rh = H / 3;
        plate(f, x0, top, x1 - x0, H, pal.ink3, 0.04, 0.7, 4);
        // the pen writes the line the pointer is level with
        const sel = lerp(wave(f, v, 0.4) * 2, clamp(py(f, b) * 3 - 0.5, 0, 2), k);
        for (let i = 0; i < 3; i++) {
          const y = top + rh * (i + 0.5);
          const on = clamp(1 - Math.abs(sel - i));
          const u = clamp(p * 1.6 - i * 0.3) * (0.7 + 0.3 * on);
          ctx.strokeStyle = rgba(pal.emerald, 0.95);
          tick(ctx, x0 + 9, y - 1, Math.min(4, rh * 0.3), u);
          lab(f, b, i === 0 ? "entry" : i === 1 ? "exit" : "size", x0 + 18, y + 3.5, "left", mix(pal.ink3, pal.ink, on));
          const lx = x0 + 62;
          const le = x1 - 8;
          if (le > lx + 8) {
            const end = lerp(lx, le, u * (0.6 + 0.4 * Math.sin(i * 2 + v.a * 5) ** 2));
            ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, on), 0.6 + 0.4 * on);
            ctx.lineWidth = 1.4 + on;
            seg(ctx, lx, y, end, y);
            ctx.lineWidth = 1.4;
            ctx.fillStyle = rgba(pal.gold, on);
            disc(ctx, end, y + Math.sin(t * 1.4 * v.speed) * 0.8, 2.6);
          }
        }
      },
    },
    {
      label: "The moment of pressure",
      note: "When price moves, the urge is to abandon the plan.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 3;
        const H = bot - top;
        const yS = v.dir > 0 ? bot - H * 0.25 : top + H * 0.25;
        const yE = v.dir > 0 ? top + H * 0.3 : bot - H * 0.3;
        ctx.save();
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        seg(ctx, b.x + 2, yS, b.r - 2, yE);
        ctx.restore();
        const N = 40;
        ctx.strokeStyle = rgba(pal.ink, 0.85);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const y = lerp(yS, yE, u) - wander(t * 0.8 * v.speed - (1 - u) * 7, v.phase) * H * 0.16 * p;
          if (i === 0) ctx.moveTo(b.x + 2, y);
          else ctx.lineTo(lerp(b.x + 2, b.r - 2, u), y);
        }
        ctx.stroke();
        const ax = lerp(b.x + 2, b.r - 2, 0.55);
        const ay = lerp(yS, yE, 0.55);
        // the pointer is the impulse: it pulls the trader off the plan, and the plan pulls back
        const qx = clamp(ax + k * (f.mx - ax) * 0.6 + (1 - k) * Math.sin(t * 0.9 * v.speed + v.phase) * b.w * 0.06, b.x + 6, b.r - 6);
        const qy = clamp(ay + k * (f.my - ay) * 0.6 + (1 - k) * Math.cos(t * 0.7 * v.speed + v.phase) * H * 0.22, b.y + 6, b.b - 6);
        ctx.save();
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = rgba(AMBER, 0.9);
        seg(ctx, ax, ay, qx, qy);
        ctx.restore();
        ctx.strokeStyle = rgba(pal.gold, 1);
        ring(ctx, ax, ay, 4.5);
        ctx.fillStyle = rgba(AMBER, 0.95);
        disc(ctx, qx, qy, 4);
        runner(f, qx, qy, ax, ay, t * 0.5 * v.speed, pal.gold, 1.8);
        lab(f, b, "plan", v.dir > 0 ? b.r : b.x, yE - 6, v.dir > 0 ? "right" : "left", pal.gold);
        lab(f, b, "impulse", qx, qy - 8, "center", AMBER);
      },
    },
    {
      label: "Keep to the plan",
      note: "One result matters less than following the same rule every time.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = top + H * 0.45;
        const n = clamp(Math.floor(b.w / 44), 3, 8);
        const cw = b.w / n;
        const hh = Math.min(H * 0.3, cw * 0.45);
        // the pointer counts the trades taken so far; each followed the rule, whatever came of it
        const m = lerp(0.55 + 0.4 * Math.sin(f.t * 0.3 * v.speed + v.phase), px(f, b), k) * n * p;
        for (let i = 0; i < n; i++) {
          const x0 = b.x + i * cw + 3;
          const xj = x0 + cw * 0.35;
          const xe = x0 + cw - 9;
          const done = clamp(m - i);
          const good = Math.sin(i * 2.3 + v.b * 9) > -0.2;
          ctx.strokeStyle = rgba(pal.ink3, 0.5);
          seg(ctx, xj, cy, xe, cy + hh);
          ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, done), 0.9);
          seg(ctx, x0, cy, xj, cy);
          seg(ctx, xj, cy, lerp(xj, xe, done), cy - hh * done);
          ctx.fillStyle = rgba(good ? pal.emerald : ALERT, 0.9 * done);
          disc(ctx, xe, cy - hh, 3 * done);
          ctx.strokeStyle = rgba(pal.gold, 0.95);
          tick(ctx, x0 + cw / 2 - 3, bot - 5, Math.min(4, cw * 0.14), done);
        }
        lab(f, b, "same rule", b.x, b.y + 8, "left", pal.accent);
        lab(f, b, "followed", b.x, b.b - 2, "left", pal.gold);
      },
    },
  ],
}));

/**
 * PLATFORMS, told in five chapters: the parts turning together, the chart, the
 * order ticket, positions with an alert, and the server every order goes to.
 */
export const gears = scene((v) => ({
  caption: "Platforms",
  line: "A trading platform is several parts working as one: the chart you read, the ticket you send, the positions you hold, the alerts that call you back, and the server behind them all.",
  parts: [
    {
      label: "Parts that turn together",
      note: "Each part of the platform drives the next one.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 13;
        const cy = (top + bot) / 2;
        const R = Math.max(2, Math.min(b.w / 5.4, (bot - top) / 2.1)) * (0.7 + 0.3 * p);
        const r2 = R * 0.68;
        const r3 = R * 0.84;
        const x1 = b.cx - 2.42 * R + R;
        const x2 = x1 + (R + r2) * 0.94;
        const x3 = x2 + (r2 + r3) * 0.94;
        // the pointer turns the train by hand
        const a = t * 0.5 * v.speed * v.dir + v.phase + k * (px(f, b) - 0.5) * TAU;
        const train: readonly (readonly [number, number, number, number, Colour, string])[] = [
          [x1, R, 12, a, pal.accent, "chart"],
          [x2, r2, 8, (-a * 12) / 8 + TAU / 16, pal.gold, "ticket"],
          [x3, r3, 10, (a * 12) / 10, pal.teal, "server"],
        ];
        for (const [x, r, n, rot, col, name] of train) {
          gear(ctx, x, cy, r, n, rot);
          ctx.fillStyle = rgba(col, 0.14 + 0.14 * k);
          ctx.fill();
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.stroke();
          ring(ctx, x, cy, r * 0.3);
          seg(ctx, x, cy, x + Math.cos(rot) * r * 0.3, cy + Math.sin(rot) * r * 0.3);
          if (b.w >= 190) lab(f, b, name, x, b.b - 2, "center", col);
        }
        if (b.w < 190) lab(f, b, "one machine", b.cx, b.b - 2);
      },
    },
    {
      label: "The chart",
      note: "Prices arrive and are drawn as they change.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 1;
        const bot = b.b - 1;
        const bar = Math.min(10, (bot - top) * 0.16);
        plate(f, b.x + 1, top, b.w - 2, bot - top, pal.ink3, 0.04, 0.8, 4);
        seg(ctx, b.x + 1, top + bar, b.r - 1, top + bar);
        ctx.fillStyle = rgba(pal.ink3, 0.8);
        for (let i = 0; i < 3; i++) disc(ctx, b.x + 7 + i * 6, top + bar / 2, Math.min(1.6, bar * 0.25));
        const y0 = top + bar + 3;
        const y1 = bot - 3;
        const mid = (y0 + y1) / 2;
        const A = (y1 - y0) * 0.3;
        const wk = (y1 - y0) * 0.07;
        const n = clamp(Math.floor((b.w - 16) / 14), 5, 18);
        const cw = (b.w - 16) / n;
        const at = (i: number) => wander(t * 0.22 * v.speed + i * 0.8, v.phase);
        const shown = Math.ceil(n * p);
        for (let i = 0; i < shown; i++) {
          const o = at(i);
          const c = at(i + 1);
          const x = b.x + 8 + cw * (i + 0.5);
          const hi = mid - Math.max(o, c) * A;
          ctx.strokeStyle = rgba(c >= o ? pal.emerald : ALERT, 0.85);
          ctx.fillStyle = rgba(c >= o ? pal.emerald : ALERT, 0.6);
          seg(ctx, x, hi - wk, x, mid - Math.min(o, c) * A + wk);
          ctx.fillRect(x - cw * 0.3, hi, cw * 0.6, Math.max(1.5, Math.abs(c - o) * A));
        }
        ctx.strokeStyle = rgba(pal.gold, 0.9);
        ctx.beginPath();
        for (let i = 0; i <= shown; i++) {
          const y = mid - at(i - 1.5) * A * 0.7;
          if (i === 0) ctx.moveTo(b.x + 8, y);
          else ctx.lineTo(b.x + 8 + cw * Math.min(i, n), y);
        }
        ctx.stroke();
        // the crosshair follows the pointer; left alone it rests on the last price
        const hx = clamp(lerp(b.r - 8 - cw / 2, f.mx, k), b.x + 4, b.r - 4);
        const hy = clamp(lerp(mid - at(n) * A, f.my, k), y0, y1);
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.accent, 0.45 + 0.5 * k);
        seg(ctx, b.x + 3, hy, b.r - 3, hy);
        seg(ctx, hx, y0, hx, y1);
        ctx.restore();
        ctx.strokeStyle = rgba(pal.accent, 1);
        ring(ctx, hx, hy, 3 + k);
        if (b.h > 80) lab(f, b, "price", b.r - 5, hy - 5, "right", pal.accent);
      },
    },
    {
      label: "The order ticket",
      note: "Direction and size are set, and then the order is sent.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 1;
        const bot = b.b - 1;
        const H = bot - top;
        const w = Math.min(b.w - 2, Math.max(88, H * 1.5));
        const x = b.cx - w / 2;
        plate(f, x, top, w, H, pal.ink3, 0.04, 0.8, 5);
        // the pointer chooses the side it is on and drags the size with it
        const side = lerp(Math.sin(t * 0.35 * v.speed + v.phase), px(f, b) * 2 - 1, k);
        const bh = H * 0.36;
        const by = top + H * 0.08;
        const bw = (w - 18) / 2;
        for (let s = -1; s <= 1; s += 2) {
          const bx = s < 0 ? x + 6 : x + 12 + bw;
          const on = clamp(0.5 + s * side * 2);
          plate(f, bx, by, bw, bh, s < 0 ? pal.gold : pal.teal, 0.08 + 0.45 * on, 0.5 + 0.45 * on);
          lab(f, b, s < 0 ? "sell" : "buy", bx + bw / 2, by + bh / 2 + 3.5, "center", mix(pal.ink3, pal.ink, on));
        }
        const wide = w > 130;
        const sx0 = x + (wide ? 42 : 8);
        const sx1 = x + w - 8;
        const sy = top + H * 0.62;
        const m = lerp(wave(f, v, 0.5, 1), clamp((f.mx - sx0) / Math.max(1, sx1 - sx0)), k) * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, sx0, sy, sx1, sy);
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        ctx.lineWidth = 2.4;
        seg(ctx, sx0, sy, lerp(sx0, sx1, m), sy);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, lerp(sx0, sx1, m), sy, 3.5 + k);
        const y3 = top + H * 0.86;
        arrow(ctx, sx0, y3, sx1, y3, 5);
        runner(f, sx0, y3, sx1, y3, t * 0.3 * v.speed + v.a, pal.accent, 2.2);
        if (wide) {
          lab(f, b, "size", x + 8, sy + 3.5, "left");
          lab(f, b, "send", x + 8, y3 + 3.5, "left", pal.accent);
        }
      },
    },
    {
      label: "Positions and alerts",
      note: "Open trades are tracked, and an alert calls when a level is reached.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 2;
        const H = bot - top;
        const xd = b.x + b.w * 0.58;
        const rh = H / 3;
        const x0 = b.x + b.w * 0.36;
        for (let i = 0; i < 3; i++) {
          const y = top + rh * (i + 0.5);
          const val = wander(t * 0.5 * v.speed + i * 2.1, v.phase + i) * p;
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          ctx.lineWidth = 3;
          seg(ctx, b.x + 2, y, b.x + b.w * 0.12, y);
          ctx.lineWidth = 1.4;
          seg(ctx, x0, y - rh * 0.35, x0, y + rh * 0.35);
          ctx.fillStyle = rgba(val >= 0 ? pal.emerald : ALERT, 0.65);
          ctx.fillRect(x0, y - rh * 0.22, val * b.w * 0.18, rh * 0.44);
        }
        const tx = xd + (b.r - xd) * 0.3;
        const s = clamp(Math.min(b.u * 0.09, b.w * 0.05), 3, 12);
        const price = lerp(bot - 4, top + 4, 0.5 + 0.45 * wander(t * 0.45 * v.speed, v.phase + 4));
        // the pointer sets the level the alert waits at; the bell swings while price is beyond it
        const yl = clamp(lerp(top + H * 0.35, f.my, k), top + s * 3 + 6, bot - 4);
        const rings = smooth((yl - price) / Math.max(1, H * 0.1));
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, tx, top, tx, bot);
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(AMBER, 0.9);
        seg(ctx, tx - 8, yl, b.r - 2, yl);
        ctx.restore();
        ctx.fillStyle = rgba(pal.ink, 0.95);
        disc(ctx, tx, price, 3);
        ctx.save();
        ctx.translate(xd + (b.r - xd) * 0.7, top + 1);
        ctx.rotate(Math.sin(t * 1.5 * v.speed) * 0.35 * rings);
        ctx.beginPath();
        ctx.arc(0, s, s, Math.PI, TAU);
        ctx.lineTo(s * 1.3, s * 2);
        ctx.lineTo(-s * 1.3, s * 2);
        ctx.closePath();
        ctx.fillStyle = rgba(AMBER, 0.12 + 0.5 * rings);
        ctx.fill();
        ctx.strokeStyle = rgba(AMBER, 0.95);
        ctx.stroke();
        ctx.fillStyle = rgba(AMBER, 0.95);
        disc(ctx, 0, s * 2.3, s * 0.25);
        ctx.restore();
        lab(f, b, "positions", b.x, b.y + 8, "left");
        lab(f, b, "alert", b.r, yl - 4, "right", AMBER);
      },
    },
    {
      label: "The server behind",
      note: "Every order travels to the server and is confirmed back.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const dw = clamp(b.w * 0.2, 16, 96);
        const dh = Math.min(H, dw * 0.75);
        plate(f, b.x + 1, cy - dh / 2, dw, dh, pal.ink2, 0.05, 0.9, 3);
        ctx.strokeStyle = rgba(pal.accent, 0.9);
        trace(f, b.x + 5, b.x + dw - 3, cy, dh * 0.22, t * 0.6 * v.speed, v.phase, 12);
        const rw = dw * 0.8;
        const rx = b.r - 1 - rw;
        plate(f, rx, top, rw, H * p, pal.ink2, 0.05, 0.9, 3);
        for (let i = 0; i < 3; i++) {
          const y = top + (H * p * (i + 0.5)) / 3;
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          seg(ctx, rx + 4, y, rx + rw - 9, y);
          ctx.fillStyle = rgba(pal.teal, 0.55 + 0.35 * Math.sin(t * 0.9 * v.speed + i * 2));
          disc(ctx, rx + rw - 5, y, 1.8);
        }
        const xa = b.x + dw + 7;
        const xb = rx - 7;
        const y1 = cy - H * 0.18;
        const y2 = cy + H * 0.18;
        // the pointer carries the order across; the confirmation comes back as far as it has gone
        const u = lerp(loop(f, t * 0.14 * v.speed + v.a), clamp((f.mx - xa) / Math.max(1, xb - xa)), k);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        arrow(ctx, xa, y1, xb, y1, 4);
        arrow(ctx, xb, y2, xa, y2, 4);
        plate(f, lerp(xa, xb - 10, u), y1 - 4, 10, 8, pal.accent, 0.5, 0.95, 2);
        const cx = lerp(xb - 5, xa + 5, u);
        ctx.fillStyle = rgba(pal.surface, 1);
        disc(ctx, cx, y2, 5);
        ctx.strokeStyle = rgba(pal.emerald, 1);
        ring(ctx, cx, y2, 5);
        tick(ctx, cx, y2 - 0.5, 2.6, clamp(u * 3));
        runner(f, xa, y1, xb, y1, t * 0.3 * v.speed + 0.3, pal.accent, 1.6);
        runner(f, xb, y2, xa, y2, t * 0.3 * v.speed, pal.emerald, 1.6);
        lab(f, b, "platform", b.x, b.b - 2, "left");
        lab(f, b, "server", b.r, b.b - 2, "right", pal.teal);
      },
    },
  ],
}));

/** the four centres: name, longitude and latitude in radians */
const CITY: readonly (readonly [string, number, number])[] = [
  ["Sydney", 2.635, -0.59],
  ["Tokyo", 2.44, 0.62],
  ["London", 0, 0.9],
  ["New York", -1.29, 0.71],
];

/** the four sessions as shares of one day, drawn in the order they open (an illustration of the order, not a timetable) */
const DAY: readonly (readonly [string, number, number])[] = [
  ["Sydney", 0, 0.375],
  ["Tokyo", 0.083, 0.458],
  ["London", 0.417, 0.79],
  ["New York", 0.625, 1],
];

const cityColour = (f: FigureFrame, i: number): Colour => (i === 0 ? f.pal.teal : i === 1 ? f.pal.accent : i === 2 ? f.pal.gold : f.pal.emerald);

/**
 * MARKETS, told in five chapters: the trading day going round the globe, the
 * east opening it, London joining, London and New York open together, and the
 * day coming round again.
 */
export const globe = scene((v) => ({
  caption: "Markets",
  line: "The trading day travels round the world with the sun: as one centre closes another is already open, and the market is busiest where two of them overlap.",
  parts: [
    {
      label: "The day goes round",
      note: "Markets open in the east and hand the day on westwards.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 13;
        const cy = (top + bot) / 2;
        const R = Math.max(0, Math.min(b.w / 2 - 2, (bot - top) / 2)) * (0.6 + 0.4 * p);
        // the pointer spins the globe under the band of open hours
        const rot = t * 0.25 * v.speed + v.phase + k * (px(f, b) - 0.5) * TAU * 0.8;
        ctx.fillStyle = rgba(pal.gold, 0.1 + 0.08 * k);
        ctx.beginPath();
        ctx.ellipse(b.cx, cy, R * 0.42, R, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink3, 0.45);
        ctx.lineWidth = 1;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.ellipse(b.cx, cy, R * Math.abs(Math.sin(rot + (j * Math.PI) / 3)), R, 0, 0, TAU);
          ctx.stroke();
        }
        for (let s = -0.5; s <= 0.5; s += 1) seg(ctx, b.cx - R * 0.866, cy + s * R, b.cx + R * 0.866, cy + s * R);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        ring(ctx, b.cx, cy, R);
        let best = 0;
        let bestX = b.cx;
        let name = "";
        for (const [nm, lon, lat] of CITY) {
          const a = lon + rot;
          const z = Math.cos(lat) * Math.cos(a);
          if (z <= 0) continue;
          const x = b.cx + R * Math.cos(lat) * Math.sin(a);
          const open = clamp(1.4 - Math.abs(Math.sin(a)) * 3.2);
          ctx.fillStyle = rgba(mix(pal.ink3, pal.gold, open), 0.5 + 0.5 * z);
          disc(ctx, x, cy - R * Math.sin(lat), 2 + 2 * open);
          if (z > best) {
            best = z;
            bestX = x;
            name = nm;
          }
        }
        if (name) lab(f, b, name, bestX, b.b - 2, "center", pal.gold, clamp(best * 2.5));
      },
    },
    {
      label: "The east opens",
      note: "Sydney and then Tokyo begin the trading day.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const top = b.y + 2;
        const bot = b.b - 2;
        const rh = (bot - top) / DAY.length;
        // the pointer is the hour: the centres open at that hour light up
        const c = lerp(0.06 + 0.36 * wave(f, v, 0.35), px(f, b), k);
        let i = 0;
        for (const [nm, a, z] of DAY) {
          const y = top + rh * i + 2;
          const x = b.x + a * b.w;
          const w = (z - a) * b.w * p;
          const on = clamp(Math.min(c - a, z - c) * 20 + 0.5);
          const col = cityColour(f, i);
          ctx.save();
          if (i > 1) ctx.setLineDash([3, 4]);
          plate(f, x, y, w, rh - 4, col, (i < 2 ? 0.14 : 0.03) + 0.35 * on, (i < 2 ? 0.7 : 0.4) + 0.3 * on, 3);
          ctx.restore();
          if (rh >= 12) lab(f, b, nm, i === 3 ? x + w - 5 : x + 5, y + (rh - 4) / 2 + 3.5, i === 3 ? "right" : "left", mix(pal.ink3, pal.ink, on));
          i++;
        }
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        const cx = clamp(b.x + c * b.w, b.x + 4, b.r - 4);
        seg(ctx, cx, top, cx, bot);
        ctx.fillStyle = rgba(pal.ink, 0.95);
        disc(ctx, cx, top + 2, 2.4 + k);
      },
    },
    {
      label: "London joins",
      note: "Europe opens as Asia winds down, and activity rises.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const top = b.y + 12;
        const base = b.b - 13;
        const A = (base - top) * 0.8;
        const N = 40;
        const hump = (u: number, c: number) => Math.exp(-(((u - c) / 0.16) ** 2));
        const asia = (u: number) => hump(u, 0.27) * 0.75;
        const europe = (u: number) => hump(u, 0.62) * 0.75 * p;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, base, b.r, base);
        for (let j = 0; j < 3; j++) {
          ctx.strokeStyle = rgba(j === 0 ? pal.accent : j === 1 ? pal.gold : pal.ink, j === 2 ? 0.9 : 0.7);
          ctx.lineWidth = j === 2 ? 2 : 1.4;
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const u = i / N;
            const y = base - A * (j === 0 ? asia(u) : j === 1 ? europe(u) : asia(u) + europe(u)) - (j === 2 ? 2 : 0);
            if (i === 0) ctx.moveTo(b.x, y);
            else ctx.lineTo(b.x + u * b.w, y);
          }
          ctx.stroke();
        }
        ctx.lineWidth = 1.4;
        // the pointer is the hour: it reads off how busy each centre is then
        const c = lerp(0.3 + 0.35 * wave(f, v, 0.35), px(f, b), k);
        const x = clamp(b.x + c * b.w, b.x + 4, b.r - 4);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, x, base, x, base - A * (asia(c) + europe(c)) - 2);
        ctx.fillStyle = rgba(pal.accent, 1);
        disc(ctx, x, base - A * asia(c), 2.6 + k);
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, x, base - A * europe(c), 2.6 + k);
        lab(f, b, "activity", b.r, b.y + 8, "right");
        lab(f, b, "Tokyo", b.x + 0.27 * b.w, b.b - 2, "center", pal.accent);
        lab(f, b, "London", b.x + 0.62 * b.w, b.b - 2, "center", pal.gold);
      },
    },
    {
      label: "London meets New York",
      note: "Two major centres are open at once: the busiest hours.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 1;
        const H = bot - top;
        const rh = clamp(H * 0.16, 8, 18);
        const l0 = 0.1;
        const l1 = 0.66;
        const n0 = 0.44;
        const n1 = 0.97;
        const X = (u: number) => b.x + u * b.w;
        ctx.fillStyle = rgba(pal.gold, 0.12 + 0.1 * k);
        ctx.fillRect(X(n0), top, (l1 - n0) * b.w, H);
        plate(f, X(l0), top, (l1 - l0) * b.w * p, rh, pal.gold, 0.2, 0.9, 3);
        plate(f, X(n1) - (n1 - n0) * b.w * p, top + rh + 3, (n1 - n0) * b.w * p, rh, pal.emerald, 0.2, 0.9, 3);
        if (rh >= 12) {
          lab(f, b, "London", X(l0) + 5, top + rh / 2 + 3.5, "left", pal.ink2);
          lab(f, b, "New York", X(n1) - 5, top + rh * 1.5 + 6.5, "right", pal.ink2);
        }
        // activity through the day: tallest where both are open; the pointer picks the hour
        const y0 = top + rh * 2 + 7;
        const hh = Math.max(0, bot - y0);
        const n = clamp(Math.floor(b.w / 12), 8, 28);
        const c = lerp(0.3 + 0.5 * wave(f, v, 0.3), px(f, b), k);
        for (let i = 0; i < n; i++) {
          const u = (i + 0.5) / n;
          const inL = u > l0 && u < l1 ? 1 : 0;
          const inN = u > n0 && u < n1 ? 1 : 0;
          const hgt = hh * (0.14 + 0.3 * inL + 0.3 * inN + 0.1 * Math.sin(i * 1.7 + t * 0.6 * v.speed + v.phase)) * p;
          const on = clamp(1 - Math.abs(c - u) * n);
          ctx.fillStyle = rgba(inL && inN ? pal.gold : pal.ink3, 0.35 + 0.6 * on);
          ctx.fillRect(X(u) - b.w / n / 2 + 1, bot - hgt, Math.max(1, b.w / n - 2), hgt);
        }
        lab(f, b, "overlap", X((n0 + l1) / 2), b.y + 8, "center", pal.gold);
      },
    },
    {
      label: "Then round again",
      note: "As New York closes, Sydney is opening once more.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 2;
        const cy = (top + bot) / 2;
        const R = Math.max(4, Math.min(b.w / 2 - 4, (bot - top) / 2 - 2));
        const beside = b.w > R * 2 + 84;
        const cx = beside ? b.x + R + 4 : b.cx;
        // the pointer turns the hand; left alone it goes round with the day
        const auto = t * 0.3 * v.speed + v.phase;
        const want = Math.atan2(f.my - cy, f.mx - cx) + Math.PI / 2;
        const hand = auto + k * ((((want - auto + Math.PI) % TAU) + TAU) % TAU) - k * Math.PI;
        const frac = (((hand / TAU) % 1) + 1) % 1;
        ctx.strokeStyle = rgba(pal.line, 1);
        ring(ctx, cx, cy, R);
        let i = 0;
        let row = 0;
        for (const [nm, a, z] of DAY) {
          const on = frac >= a && frac <= z ? 1 : 0;
          ctx.strokeStyle = rgba(cityColour(f, i), 0.55 + 0.45 * on);
          ctx.lineWidth = 2.4 + 2 * on;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, R - 3 - (i % 2) * 6), -Math.PI / 2 + a * TAU, -Math.PI / 2 + lerp(a, z, p) * TAU);
          ctx.stroke();
          ctx.lineWidth = 1.4;
          if (on && (beside || R >= 34)) {
            lab(f, b, nm, beside ? cx + R + 10 : cx, cy - 3 + row * 12 + (beside ? 0 : R * 0.3), beside ? "left" : "center", cityColour(f, i));
            row++;
          }
          i++;
        }
        const hl = Math.max(0, R - 14);
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        seg(ctx, cx, cy, cx + Math.sin(hand) * hl, cy - Math.cos(hand) * hl);
        ctx.fillStyle = rgba(pal.ink, 0.95);
        disc(ctx, cx, cy, 2.4 + k);
        if (beside) lab(f, b, "open", cx + R + 10, b.y + 8, "left");
      },
    },
  ],
}));

/**
 * CURRENCY PAIRS, told in five chapters: two currencies and one price, base
 * and quote, buying one as the other is sold, the rate as a see-saw, and what
 * tips it.
 */
export const pairs = scene((v) => ({
  caption: "Currency pairs",
  line: "A currency is always priced in another: to buy the first of a pair is to sell the second, and the rate is the balance between the two.",
  parts: [
    {
      label: "Two currencies, one price",
      note: "A pair names two currencies; its rate is one counted in the other.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 2;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const r = Math.min(H * 0.28, b.w * 0.14);
        const ry = H * 0.12;
        const rx = Math.max(0, Math.min(b.w * 0.5 - r * 1.15 - 1, H * 1.2)) * p;
        // the pointer turns the two round each other by hand
        const a = t * 0.4 * v.speed * v.dir + v.phase + k * (px(f, b) - 0.5) * TAU;
        ctx.save();
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = rgba(pal.ink3, 0.6);
        ctx.beginPath();
        ctx.ellipse(b.cx, cy, rx, ry, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        seg(ctx, b.cx - r * 0.25, cy + r * 0.6, b.cx + r * 0.25, cy - r * 0.6);
        // the one further away is drawn first
        const front = Math.sin(a) >= 0 ? 0 : 1;
        for (let n = 0; n < 2; n++) {
          const i = n === 0 ? 1 - front : front;
          const ang = a + i * Math.PI;
          const x = b.cx + Math.cos(ang) * rx;
          const y = cy + Math.sin(ang) * ry;
          const rad = r * (1 + 0.15 * Math.sin(ang));
          const col = i ? pal.gold : pal.accent;
          coin(f, x, y, rad, col, 0.22 + 0.15 * k);
          if (rad >= 14) lab(f, b, i ? "USD" : "EUR", x, y + 3.5, "center", col);
          lab(f, b, i ? "quote" : "base", x, y - rad - 4, "center", col);
        }
      },
    },
    {
      label: "Base and quote",
      note: "The first is what you trade; the second is what it is priced in.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const r = Math.min(H * 0.36, b.w * 0.15) * (0.7 + 0.3 * p);
        const x1 = b.x + b.w * 0.2;
        coin(f, x1, cy, r, pal.accent, 0.25);
        if (r >= 14) lab(f, b, "EUR", x1, cy + 3.5, "center", pal.accent);
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        seg(ctx, b.x + b.w * 0.42, cy - 3, b.x + b.w * 0.5, cy - 3);
        seg(ctx, b.x + b.w * 0.42, cy + 3, b.x + b.w * 0.5, cy + 3);
        // the pointer moves the rate: how much of the quote one of the base is worth
        const m = lerp(0.55 + 0.3 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k) * p;
        const cw = Math.min(b.w * 0.26, 70);
        const ch = (H * 0.9) / 9;
        const x2 = b.x + b.w * 0.72;
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, x2 - cw / 2 - 4, bot, x2 + cw / 2 + 4, bot);
        for (let j = 0; j < 9; j++) {
          const a = clamp(m * 9 - j);
          if (a <= 0) break;
          plate(f, x2 - cw / 2, bot - (j + 1) * ch + 1, cw, Math.max(1, ch - 1.5), pal.gold, 0.3 * a, 0.9 * a, ch / 2);
        }
        const bx = Math.min(b.r - 3, x2 + cw / 2 + 9);
        ctx.strokeStyle = rgba(pal.gold, 1);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, bx, bot, bx, bot - H * 0.9 * m);
        ctx.lineWidth = 1.4;
        lab(f, b, "rate", b.r, b.y + 8, "right", pal.gold);
        lab(f, b, "base", x1, b.b - 2, "center", pal.accent);
        lab(f, b, "quote", x2, b.b - 2, "center", pal.gold);
      },
    },
    {
      label: "Buy one, sell the other",
      note: "Every trade is two at once: one currency in, the other out.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const r = Math.min(H * 0.19, b.w * 0.09);
        const L = (b.w * 0.5 - r - 3) * p;
        // the pointer chooses the side: right buys the pair, left sells it, and the two always go opposite ways
        const s = lerp(Math.sin(t * 0.4 * v.speed + v.phase), px(f, b) * 2 - 1, k);
        const u = loop(f, t * 0.2 * v.speed + v.a);
        for (let i = 0; i < 2; i++) {
          const y = top + H * (i ? 0.72 : 0.28);
          const d = (i ? -1 : 1) * s;
          const col = i ? pal.gold : pal.accent;
          ctx.strokeStyle = rgba(col, 0.35 + 0.6 * Math.abs(s));
          arrow(ctx, b.cx - d * L, y, b.cx + d * L, y, 5);
          ctx.save();
          ctx.globalAlpha *= 0.25 + 0.75 * Math.sin(u * Math.PI);
          const x = b.cx + (d >= 0 ? 1 : -1) * L * (u * 2 - 1) * Math.min(1, Math.abs(s) * 3);
          coin(f, x, y, r, col, 0.3);
          ctx.restore();
          // what travels towards you (the right) is bought; what travels away is sold
          lab(f, b, `${i ? "USD" : "EUR"} ${d >= 0 ? "bought" : "sold"}`, b.cx, i ? b.b - 2 : b.y + 8, "center", col, clamp(Math.abs(s) * 3));
        }
        if (b.w >= 260) {
          lab(f, b, "market", b.x, b.b - 2, "left");
          lab(f, b, "you", b.r, b.b - 2, "right");
        }
      },
    },
    {
      label: "The rate is a see-saw",
      note: "As the base strengthens the rate rises; as the quote does, it falls.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cx = b.cx - 8;
        const L = Math.min(b.w * 0.3, H * 0.7);
        const r = Math.min(b.u * 0.13, H * 0.15, b.w * 0.08);
        const pivY = top + H * 0.6;
        // the pointer strengthens the side it is on: that end rises, and the rate goes with the base
        const th = clamp(0.15 * Math.sin(t * 0.6 * v.speed + v.phase) + k * (0.5 - px(f, b)) * 0.8, -0.4, 0.4) * p;
        ctx.fillStyle = rgba(pal.ink2, 0.85);
        ctx.beginPath();
        ctx.moveTo(cx, pivY + 2);
        ctx.lineTo(cx - 10, bot);
        ctx.lineTo(cx + 10, bot);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.lineWidth = 2.4;
        seg(ctx, cx - Math.cos(th) * L, pivY - Math.sin(th) * L, cx + Math.cos(th) * L, pivY + Math.sin(th) * L);
        ctx.lineWidth = 1.4;
        for (let side = -1; side <= 1; side += 2) {
          const x = cx + side * Math.cos(th) * L;
          const y = pivY + side * Math.sin(th) * L;
          const col = side < 0 ? pal.accent : pal.gold;
          coin(f, x, y - r - 2, r, col, 0.25 + 0.3 * clamp(-side * th * 3 + 0.3));
          lab(f, b, side < 0 ? "base" : "quote", x, b.b - 2, "center", col);
        }
        const gx = b.r - 7;
        gauge(f, gx, top, bot, 0.5 + th * 1.1, pal.emerald);
        lab(f, b, "rate", b.r, b.y + 8, "right", pal.emerald);
      },
    },
    {
      label: "What tips the balance",
      note: "Interest rates, data and mood lean on one side or the other.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const railH = (H * 0.5) / 3;
        const L = b.w * 0.5 - 8;
        const named = railH >= 16 && b.w >= 160;
        ctx.strokeStyle = rgba(pal.line, 1);
        seg(ctx, b.cx, top, b.cx, top + H * 0.5);
        let net = 0;
        for (let i = 0; i < 3; i++) {
          const y = top + railH * (i + 0.7);
          // the pointer drags all three weights towards the side it is on
          const off = clamp(0.6 * Math.sin(t * (0.3 + i * 0.13) * v.speed + v.phase + i * 2.1) * (1 - 0.7 * k) + k * (px(f, b) * 2 - 1) * 0.9, -1, 1) * p;
          const col = i === 0 ? pal.gold : i === 1 ? pal.teal : pal.accent;
          net += off / 3;
          ctx.strokeStyle = rgba(pal.ink3, 0.6);
          seg(ctx, b.cx - L, y, b.cx + L, y);
          ctx.fillStyle = rgba(col, 0.95);
          disc(ctx, b.cx + off * L, y, Math.min(5, railH * 0.4) + k);
          if (named) lab(f, b, i === 0 ? "rates" : i === 1 ? "data" : "mood", b.cx - L, y - 5, "left", col);
        }
        // the rate that results: weight on the base side lifts it, weight on the quote side lowers it
        const yl = top + H * 0.78;
        const N = 30;
        ctx.strokeStyle = rgba(pal.ink, 0.9);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const y = yl + net * H * 0.3 * (u - 0.5) - wander(t * 0.6 * v.speed - (N - i) * 0.14, v.phase) * H * 0.05;
          if (i === 0) ctx.moveTo(b.x, y);
          else ctx.lineTo(b.x + u * b.w, y);
        }
        ctx.stroke();
        lab(f, b, "base", b.x, b.y + 8, "left", pal.accent);
        lab(f, b, "quote", b.r, b.y + 8, "right", pal.gold);
        lab(f, b, "rate", b.r, b.b - 2, "right");
      },
    },
  ],
}));

/**
 * PARTNERS, told in five chapters: an introduction, the network that grows from
 * it, a follower copying a leader, the copy sized in proportion, and the risk
 * the follower carries with it.
 */
export const partners = scene((v) => ({
  caption: "Partners",
  line: "Partners bring others to the market, by introducing them or by letting them copy trades; whoever copies carries the same risk as the one they follow.",
  parts: [
    {
      label: "An introduction",
      note: "A partner brings a new client to the broker.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const ground = b.b - 13;
        const H = ground - top;
        const s = Math.min(H * 0.3, b.w * 0.07);
        const xP = b.x + b.w * 0.14;
        const xB = b.x + b.w * 0.86;
        // the pointer walks the client from the partner to the broker
        const m = lerp(0.5 + 0.35 * Math.sin(t * 0.5 * v.speed + v.phase), clamp((f.mx - xP) / Math.max(1, xB - xP)), k);
        const xC = lerp(xP + s * 2.4, xB - s * 2.6, m);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, ground, b.r, ground);
        const bw = s * 2.2;
        plate(f, xB - bw / 2, ground - s * 2.6 * p, bw, s * 2.6 * p, pal.ink2, 0.08, 0.9, 2);
        seg(ctx, xB, ground, xB, ground - s * 1.1 * p);
        ctx.fillStyle = rgba(pal.gold, 0.9);
        person(ctx, xP, ground, s);
        ctx.fillStyle = rgba(pal.accent, 0.9);
        person(ctx, xC, ground, s * 0.9);
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.gold, 0.8);
        ctx.beginPath();
        ctx.moveTo(xP, ground - s * 2.3);
        ctx.quadraticCurveTo((xP + xC) / 2, ground - s * 3.1, xC, ground - s * 2.1);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = rgba(pal.accent, 0.4 + 0.5 * m);
        arrow(ctx, xC + s * 1.2, ground - s, Math.max(xC + s * 1.2, xB - bw / 2 - 4), ground - s, 4);
        runner(f, xP, ground - s * 2.3, xC, ground - s * 2.1, t * 0.3 * v.speed + v.a, pal.gold, 2);
        lab(f, b, "partner", xP, b.b - 2, "center", pal.gold);
        lab(f, b, "broker", xB, b.b - 2);
        if (b.w >= 200) lab(f, b, "client", xC, b.b - 2, "center", pal.accent);
      },
    },
    {
      label: "A network grows",
      note: "Those who were introduced may introduce others in their turn.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 3;
        const bot = b.b - 13;
        const H = bot - top;
        const r = clamp(b.u * 0.04, 2.5, 7);
        const x0 = b.x + b.w * 0.08;
        const x1 = b.x + b.w * 0.5;
        const x2 = b.x + b.w * 0.92;
        // the pointer grows the network outwards, a generation at a time
        const grow = lerp(0.55 + 0.45 * Math.sin(t * 0.35 * v.speed + v.phase), px(f, b), k) * p;
        const a1 = clamp(grow * 3);
        const a2 = clamp(grow * 3 - 1.2);
        const cy = top + H / 2;
        for (let i = 0; i < 3; i++) {
          const y1 = top + (H * (i + 0.5)) / 3;
          ctx.strokeStyle = rgba(pal.ink3, 0.75 * a1);
          seg(ctx, x0, cy, lerp(x0, x1, a1), lerp(cy, y1, a1));
          for (let j = 0; j < 2; j++) {
            const y2 = top + (H * (i * 2 + j + 0.5)) / 6 + Math.sin(t * 0.8 * v.speed + i * 2 + j) * 1.2;
            ctx.strokeStyle = rgba(pal.ink3, 0.6 * a2);
            seg(ctx, x1, y1, lerp(x1, x2, a2), lerp(y1, y2, a2));
            ctx.fillStyle = rgba(pal.teal, 0.9 * a2);
            disc(ctx, x2, y2, r * 0.8 * a2);
          }
          ctx.fillStyle = rgba(pal.accent, 0.95 * a1);
          disc(ctx, x1, y1, r * a1);
          if (a1 > 0.9) runner(f, x0, cy, x1, y1, t * 0.25 * v.speed + i / 3, pal.gold, 1.8);
        }
        ctx.fillStyle = rgba(pal.gold, 1);
        disc(ctx, x0, cy, r * 1.3 + k);
        lab(f, b, "partner", b.x, b.b - 2, "left", pal.gold);
        lab(f, b, "introduced", x1, b.b - 2, "center", pal.accent, a1);
        if (b.w >= 240) lab(f, b, "and theirs", b.r, b.b - 2, "right", pal.teal, a2);
      },
    },
    {
      label: "Leader and follower",
      note: "In copy trading a follower's account repeats a leader's trades.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const y1 = top + H * 0.26;
        const y2 = top + H * 0.74;
        const amp = H * 0.18;
        // the pointer sets how far behind the copy runs
        const lag = lerp(0.07, 0.03 + 0.2 * px(f, b), k);
        const val = (u: number) => wander(t * 0.5 * v.speed + u * 5, v.phase);
        const N = 36;
        for (let j = 0; j < 2; j++) {
          ctx.strokeStyle = rgba(j ? pal.accent : pal.gold, 0.9);
          ctx.beginPath();
          for (let i = 0; i <= N * p; i++) {
            const u = i / N;
            const y = (j ? y2 : y1) - val(u - (j ? lag : 0)) * amp;
            if (i === 0) ctx.moveTo(b.x, y);
            else ctx.lineTo(b.x + u * b.w, y);
          }
          ctx.stroke();
        }
        // each trade of the leader's, and the same trade a moment later below
        for (let j = 0; j < 4; j++) {
          const u = (j + 0.5) / 4;
          const xa = b.x + u * b.w;
          const xb = xa + lag * b.w;
          if (xb > b.r - 2) continue;
          const ya = y1 - val(u) * amp;
          const yb = y2 - val(u) * amp;
          ctx.save();
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = rgba(pal.ink3, 0.7);
          seg(ctx, xa, ya, xb, yb);
          ctx.restore();
          ctx.fillStyle = rgba(pal.gold, 1);
          disc(ctx, xa, ya, 2.8);
          ctx.fillStyle = rgba(pal.accent, 1);
          disc(ctx, xb, yb, 2.8 + k);
          runner(f, xa, ya, xb, yb, t * 0.4 * v.speed + j * 0.25, pal.accent, 1.6);
        }
        lab(f, b, "leader", b.x, b.y + 8, "left", pal.gold);
        lab(f, b, "follower", b.x, b.b - 2, "left", pal.accent);
      },
    },
    {
      label: "Copied in proportion",
      note: "A copy is usually sized to the follower's own funds.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        // the pointer sets the follower's size: the same trades, larger or smaller
        const s = clamp(lerp(0.5 + 0.2 * Math.sin(t * 0.5 * v.speed + v.phase), 1 - py(f, b), k), 0.15, 1);
        const gw = b.w / 2 - 10;
        const bw = Math.min(26, gw / 5.5);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, cy, b.r, cy);
        for (let g = 0; g < 2; g++) {
          const gx = g ? b.cx + 10 : b.x;
          for (let i = 0; i < 4; i++) {
            const x = gx + (gw * (i + 0.5)) / 4;
            const val = Math.sin(i * 2.2 + v.a * 6 + 0.6) * (0.75 + 0.2 * Math.sin(t * 0.6 * v.speed + i)) * p;
            const hgt = val * H * 0.46 * (g ? s : 1);
            ctx.fillStyle = rgba(val >= 0 ? pal.emerald : ALERT, 0.3 + 0.3 * (g ? k : 0));
            ctx.fillRect(x - bw / 2, cy, bw, -hgt);
            ctx.strokeStyle = rgba(val >= 0 ? pal.emerald : ALERT, 0.95);
            ctx.strokeRect(x - bw / 2, cy, bw, -hgt);
            if (g === 0 && i === 0) {
              ctx.save();
              ctx.setLineDash([2, 4]);
              ctx.strokeStyle = rgba(pal.ink3, 0.6);
              seg(ctx, x + bw / 2, cy - hgt, b.cx + 10 + gw / 8 - bw / 2, cy - hgt * s);
              ctx.restore();
            }
          }
        }
        lab(f, b, "leader", b.x + gw / 2, b.b - 2, "center", pal.gold);
        lab(f, b, "follower", b.cx + 10 + gw / 2, b.b - 2, "center", pal.accent);
        lab(f, b, "scaled", b.r, b.y + 8, "right", pal.accent);
      },
    },
    {
      label: "The same risk",
      note: "When the leader loses, the follower loses too; the past promises nothing.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const y0 = top + H * 0.18;
        const off = Math.min(7, H * 0.09);
        const at = (u: number, lag: number) => y0 + H * 0.58 * smooth((u - lag - 0.25) / 0.6) * p + wander(t * 0.4 * v.speed + u * 4, v.phase) * H * 0.05;
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, y0, b.r, y0);
        ctx.restore();
        const N = 32;
        for (let j = 0; j < 2; j++) {
          ctx.strokeStyle = rgba(j ? pal.accent : pal.gold, 0.9);
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const u = i / N;
            const y = at(u, j ? 0.06 : 0) + (j ? off : 0);
            if (i === 0) ctx.moveTo(b.x, y);
            else ctx.lineTo(b.x + u * b.w, y);
          }
          ctx.stroke();
        }
        // the pointer picks a moment: the two losses are measured side by side
        const cu = lerp(0.55 + 0.3 * Math.sin(t * 0.35 * v.speed + v.phase), px(f, b), k);
        const cx = clamp(b.x + cu * b.w, b.x + 5, b.r - 5);
        const la = at(cu, 0);
        const lb = at(cu, 0.06) + off;
        ctx.lineWidth = 2 + k * 1.5;
        ctx.strokeStyle = rgba(la > y0 ? ALERT : pal.ink3, 0.95);
        seg(ctx, cx - 3, y0, cx - 3, la);
        ctx.strokeStyle = rgba(lb > y0 ? ALERT : pal.ink3, 0.95);
        seg(ctx, cx + 3, y0, cx + 3, lb);
        ctx.lineWidth = 1.4;
        lab(f, b, "leader", b.x, b.y + 8, "left", pal.gold);
        lab(f, b, "follower", b.r, b.y + 8, "right", pal.accent);
        lab(f, b, "both lose", cx, b.b - 2, "center", ALERT, clamp((la - y0) / Math.max(1, H * 0.1)));
      },
    },
  ],
}));

/**
 * STEPS, told in five chapters: four steps in their order, then each in turn:
 * applying, verifying, funding, and trading.
 */
export const steps = scene((v) => ({
  caption: "Steps",
  line: "A process is a short sequence in which each step is finished before the next begins: apply, verify, fund, trade.",
  parts: [
    {
      label: "Four steps in order",
      note: "Each one is completed before the next one opens.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const n = 4;
        const top = b.y + 2;
        const bot = b.b - 13;
        const cy = (top + bot) / 2;
        const sw = b.w / n;
        const r = Math.max(2, Math.min(sw * 0.3, (bot - top) * 0.42, 22));
        // the pointer chooses how far the work has come
        const prog = lerp(0.5 + 0.45 * Math.sin(t * 0.3 * v.speed + v.phase), px(f, b), k) * n * p;
        const cur = clamp(Math.floor(prog), 0, n - 1);
        for (let i = 0; i < n; i++) {
          const x = b.x + sw * (i + 0.5);
          const done = clamp(prog - i);
          if (i < n - 1) {
            ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, done), 0.9);
            arrow(ctx, x + r + 3, cy, x + sw - r - 4, cy, 4);
          }
          ctx.fillStyle = rgba(pal.accent, 0.08 + 0.4 * done);
          disc(ctx, x, cy, r);
          ctx.strokeStyle = rgba(mix(pal.ink3, pal.accent, done), 0.95);
          ring(ctx, x, cy, r + (i === cur ? 1 + Math.sin(t * 1.2 * v.speed) : 0));
          ctx.strokeStyle = rgba(pal.ink, 0.95);
          tick(ctx, x, cy - r * 0.05, r * 0.42, done);
          const name = i === 0 ? "apply" : i === 1 ? "verify" : i === 2 ? "fund" : "trade";
          if (sw >= 50 || i === cur) lab(f, b, name, x, b.b - 2, "center", i === cur ? pal.accent : pal.ink3);
        }
        const xc = b.x + sw * (cur + 0.5);
        if (cur < n - 1) runner(f, xc + r + 3, cy, xc + sw - r - 4, cy, t * 0.35 * v.speed + v.a, pal.gold, 2);
      },
    },
    {
      label: "First, apply",
      note: "A form asks who you are and what you intend to do.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 2;
        const bot = b.b - 2;
        const H = bot - top;
        const x0 = b.x + 1;
        const x1 = b.x + b.w * 0.72;
        const rh = H / 3;
        plate(f, x0, top, x1 - x0, H, pal.ink3, 0.04, 0.7, 4);
        // the pointer fills the form in, field by field, as it moves down
        const sel = lerp(wave(f, v, 0.4) * 3, py(f, b) * 3.4, k);
        const fx = x0 + Math.min(40, (x1 - x0) * 0.3);
        for (let i = 0; i < 3; i++) {
          const y = top + rh * (i + 0.5);
          const fill = clamp(sel + 0.5 - i) * p;
          const bh = Math.min(16, rh * 0.62);
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          ctx.lineWidth = 2.4;
          seg(ctx, x0 + 6, y, fx - 8, y);
          ctx.lineWidth = 1.4;
          plate(f, fx, y - bh / 2, x1 - 6 - fx, bh, mix(pal.ink3, pal.accent, fill), 0.04 + 0.1 * fill, 0.7, 2);
          ctx.strokeStyle = rgba(pal.ink, 0.85);
          const end = lerp(fx + 4, x1 - 10, fill * (0.55 + 0.4 * Math.sin(i * 1.9 + v.b * 6) ** 2));
          seg(ctx, fx + 4, y, Math.max(fx + 4, end), y);
          if (fill > 0.02 && fill < 0.98) {
            ctx.strokeStyle = rgba(pal.accent, 0.6 + 0.4 * Math.sin(t * 1.5 * v.speed));
            seg(ctx, end + 3, y - bh * 0.3, end + 3, y + bh * 0.3);
          }
        }
        const all = clamp(sel - 2.3);
        const cx = (x1 + b.r) / 2;
        const cy = (top + bot) / 2;
        const r = Math.max(2, Math.min((b.r - x1) * 0.3, H * 0.3, 16));
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        if (cx - r - 3 > x1 + 8) arrow(ctx, x1 + 3, cy, cx - r - 3, cy, 4);
        ctx.fillStyle = rgba(pal.emerald, 0.1 + 0.4 * all);
        disc(ctx, cx, cy, r);
        ctx.strokeStyle = rgba(mix(pal.ink3, pal.emerald, all), 0.95);
        ring(ctx, cx, cy, r);
        ctx.strokeStyle = rgba(pal.ink, 0.95);
        tick(ctx, cx, cy, r * 0.42, all);
        lab(f, b, "sent", cx, cy + r + 12, "center", pal.emerald, all);
      },
    },
    {
      label: "Then verify",
      note: "Identity documents are checked before anything else happens.",
      draw: (f, b, k, p) => {
        const { ctx, pal } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cw = Math.min(b.w - 4, H * 1.6);
        const ch = Math.min(H, cw * 0.62);
        const x = b.cx - cw / 2;
        const y = (top + bot) / 2 - ch / 2;
        plate(f, x, y, cw, ch, pal.ink2, 0.04, 0.9, 4);
        // the pointer draws the check across the document: what it has passed is confirmed
        const s = lerp(wave(f, v, 0.45), clamp((f.mx - x) / Math.max(1, cw)), k) * p;
        const sx = x + s * cw;
        const pw = Math.min(cw * 0.3, ch * 0.7);
        const seen = sx > x + 5 + pw / 2;
        plate(f, x + 5, y + (ch - pw) / 2, pw, pw, seen ? pal.teal : pal.ink3, 0.08, 0.8, 2);
        ctx.fillStyle = rgba(seen ? pal.teal : pal.ink3, 0.8);
        person(ctx, x + 5 + pw / 2, y + (ch + pw) / 2 - 1, pw * 0.36);
        const lx0 = x + pw + 11;
        for (let i = 0; i < 3; i++) {
          const ly = y + ch * (0.3 + 0.2 * i);
          const lx1 = lerp(lx0, x + cw - 6, i === 0 ? 1 : i === 1 ? 0.65 : 0.85);
          if (lx1 <= lx0) continue;
          const cut = clamp(sx, lx0, lx1);
          ctx.strokeStyle = rgba(pal.teal, 0.95);
          seg(ctx, lx0, ly, cut, ly);
          ctx.strokeStyle = rgba(pal.ink3, 0.8);
          seg(ctx, cut, ly, lx1, ly);
        }
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        ctx.lineWidth = 2;
        seg(ctx, sx, y - 3, sx, y + ch + 3);
        ctx.lineWidth = 1.4;
        const done = smooth((s - 0.8) / 0.2);
        if (done > 0) {
          ctx.strokeStyle = rgba(pal.emerald, done);
          tick(ctx, x + cw - 10, y + 9, 4, done);
        }
        lab(f, b, "document", x, b.y + 8, "left");
        lab(f, b, "checked", x + cw, b.b - 2, "right", pal.emerald, done);
      },
    },
    {
      label: "Fund the account",
      note: "Money is moved in, and the account shows it.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const vw = Math.min(b.w * 0.5, H * 1.5);
        const vx = b.r - vw - 3;
        // the pointer sets how much has been moved in
        const m = lerp(0.35 + 0.3 * wave(f, v, 0.4), 1 - py(f, b), k) * p;
        const sy = bot - H * 0.8 * m;
        ctx.fillStyle = rgba(pal.teal, 0.25 + 0.2 * k);
        ctx.fillRect(vx + 1.5, sy, vw - 3, Math.max(0, bot - sy - 1));
        ctx.strokeStyle = rgba(pal.teal, 0.95);
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) {
          const y = sy + Math.sin(i * 0.9 + t * 1.2 * v.speed) * 1.2;
          if (i === 0) ctx.moveTo(vx + 1.5, y);
          else ctx.lineTo(vx + 1.5 + ((vw - 3) * i) / 12, y);
        }
        ctx.stroke();
        ctx.strokeStyle = rgba(pal.ink2, 0.9);
        ctx.beginPath();
        ctx.moveTo(vx, top + H * 0.15);
        ctx.lineTo(vx, bot);
        ctx.lineTo(vx + vw, bot);
        ctx.lineTo(vx + vw, top + H * 0.15);
        ctx.stroke();
        const sw = Math.min(b.w * 0.2, 40);
        const ch = clamp(H / 6, 3, 7);
        for (let j = 0; j < 3; j++) plate(f, b.x + 2, bot - (j + 1) * ch + 1, sw, ch - 1.5, pal.gold, 0.3, 0.9, ch / 2);
        // coins on their way over
        const ax = b.x + 2 + sw / 2;
        const ay = bot - 3 * ch - 4;
        const bx = vx + vw / 2;
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + bx) / 2, top - 4, bx, sy);
        ctx.stroke();
        ctx.restore();
        for (let j = 0; j < 3; j++) {
          const u = loop(f, t * 0.2 * v.speed + j / 3 + v.a);
          const q = 1 - u;
          ctx.fillStyle = rgba(pal.gold, Math.sin(u * Math.PI));
          disc(ctx, q * q * ax + 2 * q * u * ((ax + bx) / 2) + u * u * bx, Math.max(top, q * q * ay + 2 * q * u * (top - 4) + u * u * sy), 2.6);
          if (f.still) break;
        }
        lab(f, b, "funds", b.x, b.y + 8, "left", pal.gold);
        lab(f, b, "account", vx + vw / 2, b.b - 2, "center", pal.teal);
      },
    },
    {
      label: "Ready to trade",
      note: "With every step done, the first order can be placed.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const amp = H * 0.3;
        const N = 40;
        // the pointer chooses the moment of the first order; from there the trade is live
        const m = lerp(0.42 + 0.2 * wave(f, v, 0.3), clamp(px(f, b), 0.05, 0.9), k);
        const val = (u: number) => wander(t * 0.5 * v.speed - (1 - u) * 5.5, v.phase);
        const X = (u: number) => b.x + u * (b.w - 8);
        const ex = X(m);
        const ey = cy - val(m) * amp;
        // before the order, a market being watched
        ctx.strokeStyle = rgba(pal.ink3, 0.9);
        ctx.beginPath();
        ctx.moveTo(b.x, cy - val(0) * amp);
        for (let i = 1; i / N < m; i++) ctx.lineTo(X(i / N), cy - val(i / N) * amp);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        // after it, a position that moves with the price
        let ly = ey;
        ctx.strokeStyle = rgba(pal.accent, 0.95);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        for (let i = 1; i <= N * p; i++) {
          if (i / N <= m) continue;
          ly = cy - val(i / N) * amp;
          ctx.lineTo(X(i / N), ly);
        }
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = rgba(pal.accent, 0.6);
        seg(ctx, ex, ey, b.r, ey);
        ctx.restore();
        ctx.strokeStyle = rgba(ly < ey ? pal.emerald : ALERT, 0.95);
        ctx.lineWidth = 2 + k * 1.5;
        seg(ctx, b.r - 3, ey, b.r - 3, ly);
        ctx.lineWidth = 1.4;
        ctx.fillStyle = rgba(pal.surface, 1);
        disc(ctx, ex, ey, 4 + k * 1.5);
        ctx.strokeStyle = rgba(pal.accent, 1);
        ring(ctx, ex, ey, 4 + k * 1.5);
        ctx.strokeStyle = rgba(pal.emerald, 1);
        tick(ctx, b.x + 5, b.b - 7, 3.5);
        lab(f, b, "ready", b.x + 13, b.b - 2, "left", pal.emerald);
        lab(f, b, "first order", ex, b.y + 8, "center", pal.accent);
      },
    },
  ],
}));

/**
 * FUNDING, told in five chapters: the wallet with money coming in and going
 * out, a deposit arriving, the checks on the way, money allocated to a trading
 * account, and a withdrawal.
 */
export const wallet = scene((v) => ({
  caption: "Funding",
  line: "Money comes in to a wallet, is allocated from there to a trading account, and goes back out by withdrawal, with checks made at each step.",
  parts: [
    {
      label: "Money in, money out",
      note: "The wallet holds your money between the two.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const ww = Math.min(b.w * 0.34, H * 1.3);
        const wh = Math.min(H * 0.8, ww * 0.72);
        const wx = b.cx - ww / 2;
        // the side the pointer is on is the side that flows
        const side = lerp(Math.sin(t * 0.4 * v.speed + v.phase), px(f, b) * 2 - 1, k);
        const aIn = clamp(0.5 - side);
        const aOut = clamp(0.5 + side);
        purse(f, wx, cy - wh / 2, ww, wh, pal.ink, (0.5 + 0.3 * (aIn - aOut)) * p);
        ctx.strokeStyle = rgba(pal.teal, 0.35 + 0.6 * aIn);
        ctx.lineWidth = 1.4 + aIn;
        arrow(ctx, b.x + 2, cy, wx - 7, cy, 6);
        ctx.strokeStyle = rgba(pal.gold, 0.35 + 0.6 * aOut);
        ctx.lineWidth = 1.4 + aOut;
        arrow(ctx, wx + ww + 9, cy, b.r - 3, cy, 6);
        ctx.lineWidth = 1.4;
        if (aIn > 0.3) runner(f, b.x + 2, cy, wx - 7, cy, t * 0.4 * v.speed + v.a, pal.teal, 1.5 + 1.5 * aIn);
        if (aOut > 0.3) runner(f, wx + ww + 9, cy, b.r - 3, cy, t * 0.4 * v.speed + v.b, pal.gold, 1.5 + 1.5 * aOut);
        lab(f, b, "in", b.x, b.y + 8, "left", pal.teal);
        lab(f, b, "out", b.r, b.y + 8, "right", pal.gold);
        lab(f, b, "wallet", b.cx, b.b - 2);
      },
    },
    {
      label: "A deposit arrives",
      note: "Funds are sent, and credited once they have been received.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const ww = Math.min(b.w * 0.3, H * 1.3);
        const wh = Math.min(H * 0.8, ww * 0.72);
        const wx = b.r - ww - 6;
        const sw = Math.min(b.w * 0.16, 44);
        const sh = Math.min(H * 0.5, sw * 0.7);
        plate(f, b.x + 1, cy - sh / 2, sw, sh, pal.ink2, 0.06, 0.9, 3);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, b.x + 5, cy - sh * 0.15, b.x + sw - 3, cy - sh * 0.15);
        seg(ctx, b.x + 5, cy + sh * 0.2, b.x + sw * 0.6, cy + sh * 0.2);
        const xa = b.x + sw + 7;
        const xb = wx - 7;
        // the pointer carries the payment across; it is credited only when it has arrived
        const u = lerp(loop(f, t * 0.16 * v.speed + v.a), clamp((f.mx - xa) / Math.max(1, xb - xa)), k);
        const got = smooth((u - 0.75) / 0.25);
        ctx.save();
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, xa, cy, xb, cy);
        ctx.restore();
        const r = Math.min(6, H * 0.14);
        for (let j = 3; j >= 1; j--) {
          ctx.fillStyle = rgba(pal.gold, 0.3 / j);
          disc(ctx, lerp(xa, xb, Math.max(0, u - j * 0.07)), cy, r * 0.7);
        }
        coin(f, lerp(xa, xb, u), cy, r, pal.gold, 0.5);
        purse(f, wx, cy - wh / 2, ww, wh, pal.ink, (0.25 + 0.5 * got) * p);
        lab(f, b, "sent", b.x, b.b - 2, "left");
        lab(f, b, "credited", b.r, b.b - 2, "right", pal.emerald, 0.25 + 0.75 * got);
        if (b.w >= 200) lab(f, b, "on its way", lerp(xa, xb, u), b.y + 8, "center", pal.gold, 1 - got);
      },
    },
    {
      label: "Checked on the way",
      note: "A payment passes identity and security checks before it moves on.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 3;
        const bot = b.b - 13;
        const H = bot - top;
        const r = Math.max(2, Math.min(5.5, (H - 16) / 8));
        const gw = r * 2 + 8;
        const gx = b.w >= 230 ? b.x + b.w * 0.42 : b.cx;
        const lane = bot - Math.min(6, H * 0.14);
        // the pointer works through the checks; only when all three are done does the payment pass
        const c = lerp(1.2 * wave(f, v, 0.35), px(f, b) * 1.25, k) * p;
        const pass = clamp((c - 1) * 5);
        plate(f, gx - gw / 2, top, gw, Math.max(0, lane - 9 - top), pal.ink3, 0.05, 0.8, 4);
        for (let i = 0; i < 3; i++) {
          const y = top + ((lane - 9 - top) * (i + 0.5)) / 3;
          const done = clamp(c * 3 - i);
          ctx.fillStyle = rgba(pal.emerald, 0.1 + 0.4 * done);
          disc(ctx, gx, y, r);
          ctx.strokeStyle = rgba(mix(AMBER, pal.emerald, done), 0.95);
          ring(ctx, gx, y, r + (done > 0 && done < 1 ? Math.sin(t * 1.3 * v.speed) * 0.6 : 0));
          ctx.strokeStyle = rgba(pal.ink, 0.95);
          tick(ctx, gx, y, r * 0.5, done);
          if (b.w >= 230) lab(f, b, i === 0 ? "identity" : i === 1 ? "source" : "security", gx + gw / 2 + 7, y + 3.5, "left", mix(pal.ink3, pal.emerald, done));
        }
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, b.x, lane, gx - gw / 2 - 2, lane);
        ctx.strokeStyle = rgba(mix(pal.ink3, pal.emerald, pass), 0.9);
        arrow(ctx, gx + gw / 2 + 2, lane, b.r - 2, lane, 4);
        // a bar across the lane that lifts once the checks are done
        ctx.strokeStyle = rgba(mix(AMBER, pal.emerald, pass), 0.95);
        ctx.lineWidth = 2.4;
        seg(ctx, gx, lane - 7, gx, lane - 7 + 12 * (1 - pass));
        ctx.lineWidth = 1.4;
        const cr = Math.min(5, H * 0.12);
        const x = pass > 0 ? lerp(gx - gw / 2 - cr - 3, b.r - cr - 8, pass) : lerp(b.x + cr + 1, gx - gw / 2 - cr - 3, clamp(c * 3));
        coin(f, x, lane, cr, pal.gold, 0.5);
        lab(f, b, pass > 0.5 ? "passed" : "waiting", pass > 0.5 ? b.r : b.x, b.b - 2, pass > 0.5 ? "right" : "left", pass > 0.5 ? pal.emerald : AMBER);
      },
    },
    {
      label: "Allocated to trading",
      note: "From the wallet, money is moved to the account you trade on.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const vw = Math.min(b.w * 0.3, 120);
        // the pointer sets the share that is allocated: further right, more of it on the trading account
        const auto = 0.5 + 0.3 * Math.sin(t * 0.4 * v.speed + v.phase);
        const s = lerp(auto, px(f, b), k) * p;
        const going = lerp(Math.cos(t * 0.4 * v.speed + v.phase), px(f, b) * 2 - 1, k) >= 0;
        for (let i = 0; i < 2; i++) {
          const x = i ? b.r - 2 - vw : b.x + 2;
          const lvl = (i ? s : 1 - s) * 0.85;
          const col = i ? pal.accent : pal.gold;
          ctx.fillStyle = rgba(col, 0.25 + 0.15 * k);
          ctx.fillRect(x + 1, bot - H * lvl, vw - 2, H * lvl);
          ctx.strokeStyle = rgba(col, 0.95);
          seg(ctx, x + 1, bot - H * lvl, x + vw - 1, bot - H * lvl);
          ctx.strokeStyle = rgba(pal.ink2, 0.9);
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bot);
          ctx.lineTo(x + vw, bot);
          ctx.lineTo(x + vw, top);
          ctx.stroke();
          lab(f, b, i ? (b.w >= 240 ? "trading account" : "account") : "wallet", x + vw / 2, b.b - 2, "center", col);
        }
        const xa = b.x + vw + 6;
        const xb = b.r - vw - 6;
        const y = bot - Math.min(8, H * 0.2);
        ctx.strokeStyle = rgba(pal.ink3, 0.8);
        seg(ctx, xa - 4, y - 3, xb + 4, y - 3);
        seg(ctx, xa - 4, y + 3, xb + 4, y + 3);
        for (let j = 0; j < 2; j++) runner(f, going ? xa : xb, y, going ? xb : xa, y, t * 0.3 * v.speed + j * 0.5, going ? pal.accent : pal.gold, 2);
        ctx.strokeStyle = rgba(pal.accent, 0.9);
        arrow(ctx, going ? xa : xb, top + H * 0.3, going ? xb : xa, top + H * 0.3, 5);
        lab(f, b, going ? "allocate" : "return", (xa + xb) / 2, b.y + 8, "center", pal.accent);
      },
    },
    {
      label: "Withdrawn again",
      note: "A withdrawal request sends money back out, after the same checks.",
      draw: (f, b, k, p) => {
        const { ctx, pal, t } = f;
        const top = b.y + 12;
        const bot = b.b - 13;
        const H = bot - top;
        const cy = (top + bot) / 2;
        const ww = Math.min(b.w * 0.28, H * 1.2);
        const wh = Math.min(H * 0.8, ww * 0.72);
        const wx = b.x + 2;
        const gx = b.x + b.w * 0.6;
        const r = Math.max(2, Math.min(H * 0.22, b.w * 0.06, 14));
        // the pointer takes the withdrawal through its stages: requested, checked, paid out
        const u = lerp(wave(f, v, 0.3), px(f, b), k);
        const req = clamp(u * 3);
        const chk = clamp(u * 3 - 1);
        const paid = clamp(u * 3 - 2);
        purse(f, wx, cy - wh / 2, ww, wh, pal.ink, (0.75 - 0.5 * paid) * p);
        ctx.save();
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = rgba(pal.ink3, 0.7);
        seg(ctx, wx + ww + 8, cy, gx - r - 3, cy);
        ctx.restore();
        const sx = lerp(wx + ww + 8, Math.max(wx + ww + 8, gx - r - 12), req);
        plate(f, sx, cy - 6, 9, 12, pal.ink2, 0.12, 0.9, 1.5);
        seg(ctx, sx + 2, cy - 2, sx + 7, cy - 2);
        seg(ctx, sx + 2, cy + 2, sx + 5, cy + 2);
        ctx.fillStyle = rgba(pal.emerald, 0.1 + 0.4 * chk);
        disc(ctx, gx, cy, r);
        ctx.strokeStyle = rgba(mix(AMBER, pal.emerald, chk), 0.95);
        ring(ctx, gx, cy, r);
        ctx.strokeStyle = rgba(pal.ink, 0.95);
        tick(ctx, gx, cy, r * 0.45, chk);
        ctx.strokeStyle = rgba(pal.gold, 0.25 + 0.7 * paid);
        ctx.lineWidth = 1.4 + paid;
        arrow(ctx, gx + r + 5, cy, b.r - 3, cy, 5);
        ctx.lineWidth = 1.4;
        if (paid > 0.1) runner(f, gx + r + 5, cy, b.r - 3, cy, t * 0.4 * v.speed + v.a, pal.gold, 1.5 + 1.5 * paid);
        if (b.w >= 220) {
          lab(f, b, "request", b.x, b.b - 2, "left", mix(pal.ink3, pal.ink, req));
          lab(f, b, "checked", gx, b.b - 2, "center", mix(pal.ink3, pal.emerald, chk));
          lab(f, b, "paid out", b.r, b.b - 2, "right", mix(pal.ink3, pal.gold, paid));
        } else {
          lab(f, b, paid > 0 ? "paid out" : chk > 0 ? "checked" : "request", b.cx, b.b - 2, "center", paid > 0 ? pal.gold : chk > 0 ? pal.emerald : pal.ink3);
        }
      },
    },
  ],
}));
