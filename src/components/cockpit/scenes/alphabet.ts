/**
 * ALPHABET — the whole site, filed from A to Z.
 *
 * A rotary card index seen from a little above: a drum carrying twenty-six
 * index tabs round its rim, one for each letter. The drum turns one letter at
 * a time and rests. The tab that arrives at the front is drawn forward and up,
 * in champagne, and the cards filed under it rise behind it and open into a
 * fan, the front one headed with the letter. Then they close, and the drum
 * moves on to the next letter.
 *
 * The pointer thumbs the index: any tab on the near side of the drum rises and
 * lights under it, and over the cards the fan opens wider.
 */
import { clamp, lerp, type Scene, type V3 } from "../engine";
import { pool, ring } from "../kit";
import { smooth } from "./_stage";

const N = 26;
const LETTERS = Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i));
const wrap = (i: number) => ((i % N) + N) % N;
/** seconds on one letter: the drum moves for the first third and rests for the remainder */
const STEP = 3.4;
/** the drum: the height of its rim, its radius */
const [CY, R] = [-0.42, 1.3];
/** a tab: its width, its height */
const [TW, TH] = [0.25, 0.3];
/** a card: width, height, how far the fan stands above its pivot */
const [CW, CH, CR] = [0.6, 0.5, 0.75];
const STEP_A = (Math.PI * 2) / N;

const scene: Scene = {
  // the drum at rest on G, its cards open
  pose: 19.4,
  draw(f) {
    const { pal } = f;
    const m = f.mobile;
    const n0 = Math.floor(f.t / STEP);
    const frac = f.t / STEP - n0;
    const rot = n0 + smooth(frac / 0.35);
    const fi = Math.round(rot);
    const fan = smooth((frac - 0.32) / 0.2) * (1 - smooth((frac - 0.9) / 0.1));
    f.aim(f.still ? 0 : Math.sin(f.t * 0.06) * 0.03, -0.3, 6.4, m ? 1.08 : 1.2);

    const on = f.on(0, 0.4);
    pool(f, [0, CY - 0.12, 0], 2.1, pal.key, 0.2 * f.boot);
    // the drum: two rims, a hub and its spindle
    ring(f, [0, CY - 0.12, 0], R, { colour: pal.ink, alpha: 0.16 * on });
    ring(f, [0, CY, 0], R, { colour: pal.ink, alpha: 0.34 * on });
    ring(f, [0, CY, 0], R - 0.17, { colour: pal.ink, alpha: 0.14 * on, ticks: m ? 26 : 52, tickLen: 0.04 });
    ring(f, [0, CY, 0], 0.16, { colour: pal.key, alpha: 0.5 * on, seg: 28 });
    f.line([0, CY - 0.12, 0], [0, CY + 0.34, 0], pal.ink, 0.3 * on, 2);

    /** one index tab; `i` is not wrapped, so its distance from the front is simply |i - rot| */
    const tab = (i: number) => {
      const th = (i - rot) * STEP_A;
      const [c, s] = [Math.cos(th), Math.sin(th)];
      const fr = (c + 1) / 2;
      const pull = smooth(1 - Math.abs(i - rot));
      const hov = c > 0.2 ? f.near([s * R, CY + TH / 2, -c * R], 34) : 0;
      const lift = Math.max(pull, hov);
      const r = R + lift * 0.2;
      const y = CY + lift * 0.1;
      const hw = (TW / 2) * (1 + 0.25 * lift);
      const h = TH * (1 + 0.3 * lift);
      const [bx, bz] = [s * r, -c * r];
      const quad: V3[] = [
        [bx - c * hw, y, bz - s * hw],
        [bx + c * hw, y, bz + s * hw],
        [bx + c * hw, y + h, bz + s * hw],
        [bx - c * hw, y + h, bz - s * hw],
      ];
      const a = on * (0.16 + 0.74 * fr * fr);
      f.fill(quad, pal.bg, 0.9 * a);
      f.fill(quad, pal.key, 0.07 * a);
      f.fill(quad, pal.gold, 0.2 * lift * a);
      f.path(quad, pal.ink, 0.5 * a * (1 - lift), 1, true);
      f.path(quad, pal.gold, 0.95 * a * lift, 1.25, true);
      // the letter, on the tabs that face the visitor
      if (c > (m ? 0.6 : 0.35) || lift > 0.5) {
        f.label(LETTERS[wrap(i)], [bx, y + h / 2, bz], {
          align: "center",
          size: lerp(m ? 8 : 9, m ? 12 : 14, lift),
          colour: lift > 0.4 ? pal.gold : pal.ink2,
          alpha: clamp(0.35 + 0.6 * fr + lift) * a,
          weight: 700,
        });
      }
    };

    /** the cards filed under the letter at the front, fanned about a pivot on the rim */
    const cards = () => {
      const show = fan * f.on(0.6, 0.4);
      if (show <= 0.003) return;
      const zc = -(R - 0.22);
      const count = m ? 3 : 5;
      const mid = (count - 1) / 2;
      const spread = (0.2 + 0.07 * f.near([0, CY + CR, zc], 130)) * fan;
      const reach = CR - 0.3 * (1 - fan);
      const card = (j: number) => {
        const b = (j - mid) * spread;
        const [cb, sb] = [Math.cos(b), Math.sin(b)];
        const [cx, cy] = [sb * reach, CY + cb * reach];
        const at = (p: number, q: number): V3 => {
          const lx = (p - 0.5) * CW;
          const ly = (q - 0.5) * CH;
          return [cx + lx * cb + ly * sb, cy - lx * sb + ly * cb, zc];
        };
        const top = j === mid;
        const quad = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
        f.fill(quad, pal.bg, 0.95 * show);
        f.fill(quad, pal.ink, 0.05 * show);
        f.path(quad, top ? pal.gold : pal.ink, (top ? 0.85 : 0.45) * show, 1, true);
        if (top) {
          f.label(LETTERS[wrap(n0 + 1)], at(0.12, 0.76), { size: m ? 13 : 17, colour: pal.gold, alpha: 0.95 * show, weight: 700, display: true });
          f.line(at(0.34, 0.76), at(0.88, 0.76), pal.gold, 0.6 * show, 1.5);
        } else {
          f.line(at(0.1, 0.78), at(0.5, 0.78), pal.ink, 0.4 * show, 1.5);
        }
        for (let l = 0; l < 3; l++) {
          const q = 0.54 - l * 0.16;
          f.line(at(0.12, q), at(0.56 + 0.3 * f.rnd(j * 5 + l), q), pal.ink, (top ? 0.4 : 0.22) * show, 1);
        }
      };
      for (let d = Math.floor(mid); d >= 1; d--) {
        card(mid - d);
        card(mid + d);
      }
      card(mid);
    };

    // far side first; the cards stand just behind the few tabs at the very front
    for (let d = N / 2; d >= 0; d--) {
      if (d === 2) cards();
      tab(fi + d);
      if (d > 0 && d < N / 2) tab(fi - d);
    }
  },
};

export default scene;
