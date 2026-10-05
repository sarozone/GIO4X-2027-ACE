import type { TopicId } from "../choose";
import type { Maker } from "../kit";
import { calendar, candles, clock, costs, margin, spread, stop, trend, volatility } from "./a";
import { book, compounding, magnifier, paper, portfolio, question, risk, scales, shield, ticket } from "./b";
import { accounts, bank, data, fork, gears, globe, pairs, partners, steps, wallet } from "./c";
import { leverage } from "./leverage";

/**
 * The full gap scenes by topic: every topic the chooser can name has exactly
 * one scene here (the type makes a missing one a compile error). These took
 * the place of the small one-word figures in `../figures-*.ts` on 5 October
 * 2026; those files are kept, and are no longer drawn anywhere.
 */
export const FULL_SCENES: Record<TopicId, Maker> = {
  spread,
  leverage,
  margin,
  stop,
  costs,
  clock,
  calendar,
  candles,
  trend,
  volatility,
  risk,
  compounding,
  portfolio,
  scales,
  shield,
  document: paper,
  book,
  magnifier,
  question,
  ticket,
  pairs,
  bank,
  data,
  globe,
  accounts,
  wallet,
  partners,
  gears,
  process: steps,
  fork,
};
