/**
 * Languages (see docs/I18N.md).
 *
 * English is the site: it stays at the addresses it has always had and is not
 * in this list. Each language below has its own addresses under `/<code>`,
 * and only the pages named in LOCALE_PAGES exist there. A page that is not
 * translated does not exist in that language; it is linked in English and
 * said to be in English.
 *
 * This module holds no copy and is safe to import from client components.
 */
export const LOCALES = [
  { code: "hi", native: "हिन्दी", english: "Hindi", dir: "ltr", tag: "hi", og: "hi_IN" },
  { code: "ta", native: "தமிழ்", english: "Tamil", dir: "ltr", tag: "ta", og: "ta_IN" },
  { code: "ar", native: "العربية", english: "Arabic", dir: "rtl", tag: "ar", og: "ar_AR" },
  { code: "es", native: "Español", english: "Spanish", dir: "ltr", tag: "es", og: "es_ES" },
  { code: "pt", native: "Português", english: "Portuguese", dir: "ltr", tag: "pt", og: "pt_BR" },
  { code: "fr", native: "Français", english: "French", dir: "ltr", tag: "fr", og: "fr_FR" },
  { code: "de", native: "Deutsch", english: "German", dir: "ltr", tag: "de", og: "de_DE" },
  { code: "te", native: "తెలుగు", english: "Telugu", dir: "ltr", tag: "te", og: "te_IN" },
  { code: "ml", native: "മലയാളം", english: "Malayalam", dir: "ltr", tag: "ml", og: "ml_IN" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", dir: "ltr", tag: "kn", og: "kn_IN" },
  { code: "bn", native: "বাংলা", english: "Bengali", dir: "ltr", tag: "bn", og: "bn_IN" },
  { code: "mr", native: "मराठी", english: "Marathi", dir: "ltr", tag: "mr", og: "mr_IN" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati", dir: "ltr", tag: "gu", og: "gu_IN" },
  { code: "ur", native: "اردو", english: "Urdu", dir: "rtl", tag: "ur", og: "ur_PK" },
  { code: "ja", native: "日本語", english: "Japanese", dir: "ltr", tag: "ja", og: "ja_JP" },
  { code: "ko", native: "한국어", english: "Korean", dir: "ltr", tag: "ko", og: "ko_KR" },
  { code: "th", native: "ไทย", english: "Thai", dir: "ltr", tag: "th", og: "th_TH" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese", dir: "ltr", tag: "vi", og: "vi_VN" },
  { code: "fil", native: "Filipino", english: "Filipino", dir: "ltr", tag: "fil", og: "fil_PH" },
  { code: "it", native: "Italiano", english: "Italian", dir: "ltr", tag: "it", og: "it_IT" },
  { code: "nl", native: "Nederlands", english: "Dutch", dir: "ltr", tag: "nl", og: "nl_NL" },
  { code: "pl", native: "Polski", english: "Polish", dir: "ltr", tag: "pl", og: "pl_PL" },
  { code: "el", native: "Ελληνικά", english: "Greek", dir: "ltr", tag: "el", og: "el_GR" },
  { code: "sw", native: "Kiswahili", english: "Swahili", dir: "ltr", tag: "sw", og: "sw_KE" },
  { code: "af", native: "Afrikaans", english: "Afrikaans", dir: "ltr", tag: "af", og: "af_ZA" },
  { code: "am", native: "አማርኛ", english: "Amharic", dir: "ltr", tag: "am", og: "am_ET" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export type LocaleInfo = (typeof LOCALES)[number];

/** The source language: not a route segment, named here for the switcher and for `hreflang`. */
export const ENGLISH = { code: "en", native: "English", english: "English", dir: "ltr", tag: "en", og: "en_GB" } as const;

export const isLocale = (value: string): value is Locale => LOCALES.some((l) => l.code === value);
export const localeInfo = (lang: Locale): LocaleInfo => LOCALES.find((l) => l.code === lang)!;

/** The pages that exist in every language. "" is the home page of that language. */
export const LOCALE_PAGES = ["", "guide", "risk-warning", "contact"] as const;
export type LocalePage = (typeof LOCALE_PAGES)[number];

/** Where "English" leads from a translated page: the nearest English page, never a translation of it. */
export const ENGLISH_EQUIVALENT: Record<LocalePage, string> = {
  "": "/",
  guide: "/explore",
  "risk-warning": "/legal/risk",
  contact: "/contact",
};

export const localePath = (lang: Locale, page: LocalePage = ""): string => (page ? `/${lang}/${page}` : `/${lang}`);

/** `/de/guide` → { lang: "de", page: "guide" }. Null for every English address and for anything that is not a translated page. */
export function parseLocalePath(pathname: string | null | undefined): { lang: Locale; page: LocalePage } | null {
  const [lang, page = "", ...rest] = (pathname ?? "").split("/").filter(Boolean);
  if (!lang || rest.length || !isLocale(lang)) return null;
  return (LOCALE_PAGES as readonly string[]).includes(page) ? { lang, page: page as LocalePage } : null;
}

/**
 * `hreflang` for one translated page. Only the home page has an English
 * counterpart with the same content, so only there is "en" listed; the other
 * pages name the nearest English page as `x-default` and nothing more.
 */
export function languageAlternates(page: LocalePage): Record<string, string> {
  const out: Record<string, string> = {};
  if (page === "") out[ENGLISH.tag] = "/";
  for (const l of LOCALES) out[l.tag] = localePath(l.code, page);
  out["x-default"] = ENGLISH_EQUIVALENT[page];
  return out;
}

/** Every translated address, for the sitemap. */
export const localeSitemapPaths = (): string[] => LOCALES.flatMap((l) => LOCALE_PAGES.map((p) => localePath(l.code, p)));
