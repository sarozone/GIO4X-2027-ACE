import type { TopicId } from "./choose";
import { calendar, candles, clock, costs, leverage, margin, spread, stop, trend, volatility } from "./figures-a";
import { book, compounding, magnifier, paper, portfolio, question, risk, scales, shield, ticket } from "./figures-b";
import { accounts, bank, data, fork, gears, globe, pairs, partners, steps, wallet } from "./figures-c";
import type { Maker } from "./kit";

/**
 * The gap figures by topic: every topic the chooser can name has exactly one
 * drawing here (the type makes a missing one a compile error).
 */
export const GAP_FIGURES: Record<TopicId, Maker> = {
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

export { hashText, pickTopic, rankTopics, TOPICS } from "./choose";
export type { TopicId } from "./choose";
