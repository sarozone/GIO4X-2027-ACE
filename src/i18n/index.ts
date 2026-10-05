import { ar } from "./ar";
import type { Locale } from "./config";
import { de } from "./de";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { pt } from "./pt";
import { ta } from "./ta";
import { te } from "./te";
import { ml } from "./ml";
import { kn } from "./kn";
import { bn } from "./bn";
import { mr } from "./mr";
import { gu } from "./gu";
import { ur } from "./ur";
import { ja } from "./ja";
import { ko } from "./ko";
import { th } from "./th";
import { vi } from "./vi";
import { fil } from "./fil";
import { it } from "./it";
import { nl } from "./nl";
import { pl } from "./pl";
import { el } from "./el";
import { sw } from "./sw";
import { af } from "./af";
import { am } from "./am";

export type { Dictionary } from "./en";

const DICTIONARIES: Record<Locale, Dictionary> = { hi, ta, ar, es, pt, fr, de, te, ml, kn, bn, mr, gu, ur, ja, ko, th, vi, fil, it, nl, pl, el, sw, af, am };

/**
 * The dictionary of one language. Server only in practice: the dictionaries
 * carry functions (sentences built round a number), so a client component is
 * handed the finished strings it needs, never the dictionary.
 */
export const getDictionary = (lang: Locale): Dictionary => DICTIONARIES[lang];

type ValueWords = Dictionary["home"]["accounts"]["words"];

/**
 * A published account value ("Up to 1:500", "2.5 pips", "None") with its
 * English words exchanged for the language's own. The figure is never touched,
 * and a value whose wording changes in src/data/accounts.ts simply stays in
 * English until the dictionary learns the new word.
 */
export function localiseValue(value: string, words: ValueWords): string {
  const source = en.home.accounts.words;
  if (value === source.none) return words.none;
  return (["upTo", "perLotPerSide", "pips", "lots"] as const).reduce((out, key) => out.replace(source[key], words[key]), value);
}
