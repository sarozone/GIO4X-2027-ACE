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
  te: { Markets: "మార్కెట్లు", Trading: "ట్రేడింగ్", Platforms: "ప్లాట్‌ఫారమ్‌లు", Intelligence: "Intelligence", Academy: "Academy", Company: "కంపెనీ", Search: "వెతకండి", "Sign in": "సైన్ ఇన్", "Open account": "ఖాతా తెరవండి", Language: "భాష" },
  ml: { Markets: "വിപണികൾ", Trading: "ട്രേഡിംഗ്", Platforms: "പ്ലാറ്റ്‌ഫോമുകൾ", Intelligence: "Intelligence", Academy: "Academy", Company: "കമ്പനി", Search: "തിരയുക", "Sign in": "സൈൻ ഇൻ", "Open account": "അക്കൗണ്ട് തുറക്കുക", Language: "ഭാഷ" },
  kn: { Markets: "ಮಾರುಕಟ್ಟೆಗಳು", Trading: "ಟ್ರೇಡಿಂಗ್", Platforms: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳು", Intelligence: "Intelligence", Academy: "Academy", Company: "ಕಂಪನಿ", Search: "ಹುಡುಕಿ", "Sign in": "ಸೈನ್ ಇನ್", "Open account": "ಖಾತೆ ತೆರೆಯಿರಿ", Language: "ಭಾಷೆ" },
  bn: { Markets: "বাজার", Trading: "ট্রেডিং", Platforms: "প্ল্যাটফর্ম", Intelligence: "Intelligence", Academy: "Academy", Company: "কোম্পানি", Search: "খুঁজুন", "Sign in": "সাইন ইন", "Open account": "অ্যাকাউন্ট খুলুন", Language: "ভাষা" },
  mr: { Markets: "बाजार", Trading: "ट्रेडिंग", Platforms: "प्लॅटफॉर्म", Intelligence: "Intelligence", Academy: "Academy", Company: "कंपनी", Search: "शोधा", "Sign in": "साइन इन", "Open account": "खाते उघडा", Language: "भाषा" },
  gu: { Markets: "બજારો", Trading: "ટ્રેડિંગ", Platforms: "પ્લેટફોર્મ", Intelligence: "Intelligence", Academy: "Academy", Company: "કંપની", Search: "શોધો", "Sign in": "સાઇન ઇન", "Open account": "ખાતું ખોલો", Language: "ભાષા" },
  ur: { Markets: "مارکیٹس", Trading: "ٹریڈنگ", Platforms: "پلیٹ فارمز", Intelligence: "Intelligence", Academy: "Academy", Company: "کمپنی", Search: "تلاش", "Sign in": "سائن اِن", "Open account": "اکاؤنٹ کھولیں", Language: "زبان" },
  ja: { Markets: "マーケット", Trading: "トレーディング", Platforms: "プラットフォーム", Intelligence: "Intelligence", Academy: "Academy", Company: "会社情報", Search: "検索", "Sign in": "ログイン", "Open account": "口座開設", Language: "言語" },
  ko: { Markets: "시장", Trading: "트레이딩", Platforms: "플랫폼", Intelligence: "Intelligence", Academy: "Academy", Company: "회사", Search: "검색", "Sign in": "로그인", "Open account": "계좌 개설", Language: "언어" },
  th: { Markets: "ตลาด", Trading: "การซื้อขาย", Platforms: "แพลตฟอร์ม", Intelligence: "Intelligence", Academy: "Academy", Company: "บริษัท", Search: "ค้นหา", "Sign in": "เข้าสู่ระบบ", "Open account": "เปิดบัญชี", Language: "ภาษา" },
  vi: { Markets: "Thị trường", Trading: "Giao dịch", Platforms: "Nền tảng", Intelligence: "Intelligence", Academy: "Academy", Company: "Công ty", Search: "Tìm kiếm", "Sign in": "Đăng nhập", "Open account": "Mở tài khoản", Language: "Ngôn ngữ" },
  fil: { Markets: "Mga Merkado", Trading: "Trading", Platforms: "Mga Platform", Intelligence: "Intelligence", Academy: "Academy", Company: "Kompanya", Search: "Maghanap", "Sign in": "Mag-sign in", "Open account": "Magbukas ng account", Language: "Wika" },
  it: { Markets: "Mercati", Trading: "Trading", Platforms: "Piattaforme", Intelligence: "Intelligence", Academy: "Academy", Company: "Società", Search: "Cerca", "Sign in": "Accedi", "Open account": "Apri un conto", Language: "Lingua" },
  nl: { Markets: "Markten", Trading: "Handel", Platforms: "Platformen", Intelligence: "Intelligence", Academy: "Academy", Company: "Bedrijf", Search: "Zoeken", "Sign in": "Inloggen", "Open account": "Rekening openen", Language: "Taal" },
  pl: { Markets: "Rynki", Trading: "Handel", Platforms: "Platformy", Intelligence: "Intelligence", Academy: "Academy", Company: "Firma", Search: "Szukaj", "Sign in": "Zaloguj się", "Open account": "Otwórz rachunek", Language: "Język" },
  el: { Markets: "Αγορές", Trading: "Συναλλαγές", Platforms: "Πλατφόρμες", Intelligence: "Intelligence", Academy: "Academy", Company: "Εταιρεία", Search: "Αναζήτηση", "Sign in": "Σύνδεση", "Open account": "Άνοιγμα λογαριασμού", Language: "Γλώσσα" },
  sw: { Markets: "Masoko", Trading: "Biashara", Platforms: "Majukwaa", Intelligence: "Intelligence", Academy: "Academy", Company: "Kampuni", Search: "Tafuta", "Sign in": "Ingia", "Open account": "Fungua akaunti", Language: "Lugha" },
  af: { Markets: "Markte", Trading: "Handel", Platforms: "Platforms", Intelligence: "Intelligence", Academy: "Academy", Company: "Maatskappy", Search: "Soek", "Sign in": "Meld aan", "Open account": "Open rekening", Language: "Taal" },
  am: { Markets: "ገበያዎች", Trading: "ግብይት", Platforms: "መድረኮች", Intelligence: "Intelligence", Academy: "Academy", Company: "ኩባንያ", Search: "ፍለጋ", "Sign in": "ይግቡ", "Open account": "ሒሳብ ይክፈቱ", Language: "ቋንቋ" },
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
