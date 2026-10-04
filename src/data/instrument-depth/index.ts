import { CRYPTO_DEPTH } from "./crypto";
import { ENERGY_DEPTH } from "./energy";
import { EQUITIES_DEPTH } from "./equities";
import { FOREX_DEPTH } from "./forex";
import { INDICES_DEPTH } from "./indices";
import { METALS_DEPTH } from "./metals";
import type { Depth, DepthSet } from "./types";

/**
 * The research written for each instrument, by asset class and slug. An
 * instrument with no entry simply has no "In depth" sections on its page.
 */
const BY_CLASS: Readonly<Record<string, DepthSet>> = {
  forex: FOREX_DEPTH,
  metals: METALS_DEPTH,
  indices: INDICES_DEPTH,
  energy: ENERGY_DEPTH,
  equities: EQUITIES_DEPTH,
  crypto: CRYPTO_DEPTH,
};

export const depthFor = (cls: string, slug: string): Depth | undefined => BY_CLASS[cls]?.[slug];

export type { Depth } from "./types";
