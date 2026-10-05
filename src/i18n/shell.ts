import { parseLocalePath, type Locale } from "./config";

/**
 * The few words of the site header that are shown in the page's language
 * while a translated page is open: the six section names, the three actions
 * and the name of the language menu. Keyed by the English label exactly as
 * the header writes it, so the English label is always the fallback.
 *
 * Kept apart from the dictionaries because the header is a client component:
 * this is all of the translation that reaches the browser with it.
 */
export type ShellLabel = "Markets" | "Trading" | "Platforms" | "Intelligence" | "Academy" | "Company" | "Search" | "Sign in" | "Open account" | "Language";

const LABELS: Record<Locale, Record<ShellLabel, string>> = {
  hi: { Markets: "बाज़ार", Trading: "ट्रेडिंग", Platforms: "प्लेटफ़ॉर्म", Intelligence: "Intelligence", Academy: "Academy", Company: "कंपनी", Search: "खोजें", "Sign in": "साइन इन", "Open account": "खाता खोलें", Language: "भाषा" },
  ta: { Markets: "சந்தைகள்", Trading: "வர்த்தகம்", Platforms: "தளங்கள்", Intelligence: "Intelligence", Academy: "Academy", Company: "நிறுவனம்", Search: "தேடுக", "Sign in": "உள்நுழைக", "Open account": "கணக்கு திறக்க", Language: "மொழி" },
  ar: { Markets: "الأسواق", Trading: "التداول", Platforms: "المنصّات", Intelligence: "Intelligence", Academy: "Academy", Company: "الشركة", Search: "بحث", "Sign in": "تسجيل الدخول", "Open account": "فتح حساب", Language: "اللغة" },
  es: { Markets: "Mercados", Trading: "Trading", Platforms: "Plataformas", Intelligence: "Intelligence", Academy: "Academy", Company: "Empresa", Search: "Buscar", "Sign in": "Acceder", "Open account": "Abrir cuenta", Language: "Idioma" },
  pt: { Markets: "Mercados", Trading: "Negociação", Platforms: "Plataformas", Intelligence: "Intelligence", Academy: "Academy", Company: "Empresa", Search: "Buscar", "Sign in": "Entrar", "Open account": "Abrir conta", Language: "Idioma" },
  fr: { Markets: "Marchés", Trading: "Trading", Platforms: "Plateformes", Intelligence: "Intelligence", Academy: "Academy", Company: "Société", Search: "Rechercher", "Sign in": "Connexion", "Open account": "Ouvrir un compte", Language: "Langue" },
  de: { Markets: "Märkte", Trading: "Handel", Platforms: "Plattformen", Intelligence: "Intelligence", Academy: "Academy", Company: "Unternehmen", Search: "Suche", "Sign in": "Anmelden", "Open account": "Konto eröffnen", Language: "Sprache" },
};

const same = (label: string) => label;

/**
 * The label function for the page at `pathname`. On every English address,
 * and on any address that is not one of the translated pages, it returns its
 * argument unchanged, so the header there is exactly what it was.
 */
export function shellLabels(pathname: string | null | undefined): (label: string) => string {
  const at = parseLocalePath(pathname);
  if (!at) return same;
  const labels: Record<string, string | undefined> = LABELS[at.lang];
  return (label) => labels[label] ?? label;
}
