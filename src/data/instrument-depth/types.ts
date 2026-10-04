/**
 * INSTRUMENT DEPTH: what is particular to each instrument, beyond the short
 * profile every instrument page shares.
 *
 * General education about the underlying market, written per instrument. It
 * says nothing about GIO4X's own contract (spreads, sizes, hours, financing,
 * rollover, dividend adjustments): those are trading conditions, published on
 * the conditions pages or marked "not yet published". Nothing here is a
 * current price, rate, level or forecast, and nothing is advice.
 *
 * One entry per instrument slug (src/data/instruments.ts). The instrument page
 * renders whatever fields an entry has, in this order.
 */
export type DepthPoint = { t: string; d: string };

export type Depth = {
  /** two or three sentences: what makes this instrument itself and not its neighbours */
  character: string;
  /** what moves it, most important first; each with how the link works, not what will happen */
  drivers: readonly DepthPoint[];
  /** how it is quoted, built or settled: the mechanics a newcomer gets wrong */
  mechanics: readonly DepthPoint[];
  /** "the thing itself" against "the contract traded on it": index against fund against future against CFD, coin against CFD, and so on */
  versus?: readonly DepthPoint[];
  /** events in the life of the contract or the issuer: rollover and expiry, dividends, splits, index reviews, halts, forks */
  lifecycle?: readonly DepthPoint[];
  /** scheduled, recurring things worth knowing the timetable of (named, never dated) */
  watch: readonly string[];
  /** public primary sources, by name of the publisher and the document or series (no links) */
  sources: readonly string[];
};

export type DepthSet = Readonly<Record<string, Depth>>;
