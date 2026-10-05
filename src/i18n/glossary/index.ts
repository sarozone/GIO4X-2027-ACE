import type { Locale } from "../config";
import type { GlossaryWords } from "./types";

export type { GlossaryWords } from "./types";

/**
 * The glossary of each language, loaded on demand (docs/I18N.md, section 6.8).
 *
 * Each file is some 150 definitions, so none is imported here outright: a
 * language's words are fetched by `import()` when its page is rendered, and
 * one language never loads with another's. Typed by `Locale`, so a language
 * without a line here fails `tsc`.
 */
const LOADERS: Record<Locale, () => Promise<GlossaryWords>> = {
  hi: () => import("./hi").then((m) => m.hi),
  ta: () => import("./ta").then((m) => m.ta),
  ar: () => import("./ar").then((m) => m.ar),
  es: () => import("./es").then((m) => m.es),
  pt: () => import("./pt").then((m) => m.pt),
  fr: () => import("./fr").then((m) => m.fr),
  de: () => import("./de").then((m) => m.de),
  te: () => import("./te").then((m) => m.te),
  ml: () => import("./ml").then((m) => m.ml),
  kn: () => import("./kn").then((m) => m.kn),
  bn: () => import("./bn").then((m) => m.bn),
  mr: () => import("./mr").then((m) => m.mr),
  gu: () => import("./gu").then((m) => m.gu),
  ur: () => import("./ur").then((m) => m.ur),
  ja: () => import("./ja").then((m) => m.ja),
  ko: () => import("./ko").then((m) => m.ko),
  th: () => import("./th").then((m) => m.th),
  vi: () => import("./vi").then((m) => m.vi),
  fil: () => import("./fil").then((m) => m.fil),
  it: () => import("./it").then((m) => m.it),
  nl: () => import("./nl").then((m) => m.nl),
  pl: () => import("./pl").then((m) => m.pl),
  el: () => import("./el").then((m) => m.el),
  sw: () => import("./sw").then((m) => m.sw),
  af: () => import("./af").then((m) => m.af),
  am: () => import("./am").then((m) => m.am),
};

/**
 * The terms of one language, by slug. A slug that is missing is not an error:
 * the page shows that term in English and says so. Nor is a file that fails
 * to load: the page then shows the whole list in English.
 */
export async function getGlossaryWords(lang: Locale): Promise<GlossaryWords> {
  try {
    return (await LOADERS[lang]()) ?? {};
  } catch {
    return {};
  }
}
