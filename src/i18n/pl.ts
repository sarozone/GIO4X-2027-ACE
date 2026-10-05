import type { Dictionary } from "./en";

/**
 * The Polish noun form that follows a whole number: 1 lekcja, 2 to 4 lekcje
 * (but 12 to 14 lekcji), everything else lekcji. Sentences that carry a count
 * are worded without a verb or an adjective that would have to agree with it.
 */
const form = (n: number, one: string, few: string, many: string): string => {
  if (n === 1) return one;
  const units = Math.abs(n) % 10;
  const tens = Math.abs(n) % 100;
  return Number.isInteger(n) && units >= 2 && units <= 4 && !(tens >= 12 && tens <= 14) ? few : many;
};

/** Polski. Formal address (Państwo, impersonal forms). Awaiting review by a qualified translator: see docs/I18N.md. */
export const pl: Dictionary = {
  notice: {
    label: "Tłumaczenie",
    body: "Niniejsze tłumaczenie udostępniamy dla Państwa wygody; oczekuje ono na weryfikację przez wykwalifikowanego tłumacza. W razie rozbieżności z wersją angielską rozstrzygająca jest wersja angielska.",
    english: "Wersja angielska",
  },
  common: {
    home: "Strona główna",
    inEnglish: "po angielsku",
    namesInEnglish: "nazwy po angielsku",
    restrictedTitle: "Gdzie usługi nie są dostępne",
    restrictedBody: "Usługi GIO4X nie są dostępne dla rezydentów następujących jurysdykcji",
  },
  home: {
    metaTitle: "Rynki światowe, wyjaśnione przystępnie",
    metaDescription: "GIO4X to broker wielu klas aktywów, który zapewnia dostęp do rynków światowych za pośrednictwem MetaTrader 5 i 777 Raptor oraz udostępnia otwartą bibliotekę narzędzi rynkowych, analiz i materiałów edukacyjnych.",
    title: "Rynki światowe, wyjaśnione przystępnie.",
    lead: "GIO4X to broker wielu klas aktywów, który zapewnia dostęp do rynków światowych za pośrednictwem MetaTrader 5 i 777 Raptor oraz udostępnia otwartą bibliotekę narzędzi rynkowych, analiz i materiałów edukacyjnych.",
    ctaGuide: "Przewodnik po serwisie",
    ctaContact: "Kontakt",
    what: {
      eyebrow: "Czym jest GIO4X",
      title: "Dom maklerski oceniany po swoim postępowaniu.",
      body: "GIO4X zapewnia dostęp do kilku klas aktywów z jednego rachunku, na dwóch platformach transakcyjnych. Warunki handlu są publikowane takie, jakie są, a tam, gdzie odpowiedź nie została jeszcze zweryfikowana, serwis o tym informuje.",
      tagline: "Motto GIO4X brzmi „The Gentleman’s Brokerage House”: dom maklerski, który chce być rozpoznawany po swoim postępowaniu.",
      language: "Większość tego serwisu jest napisana po angielsku. Ta strona, przewodnik po serwisie, ostrzeżenie o ryzyku i strona kontaktowa są dostępne po polsku; odnośniki do wszystkich pozostałych stron prowadzą do wersji angielskiej i są odpowiednio oznaczone.",
      principles: {
        show: { t: "Mówić tylko to, co da się wykazać.", d: "Warunki handlu są publikowane takie, jakie są. Dane mają podane źródło i datę." },
        explain: { t: "Najpierw wyjaśnić, potem sprzedawać.", d: "Każdy rynek, koszt i typ zlecenia ma przystępne wyjaśnienie, a większość także narzędzie, które pozwala Państwu samodzielnie wykonać obliczenia." },
        respect: { t: "Szanować kapitał klienta.", d: "Bez odliczania czasu, bez bonusów przebranych za pilną okazję, bez presji. Ryzyko jest podane zwykłą czcionką." },
      },
    },
    markets: {
      eyebrow: "Rynki",
      title: (classes) => `${classes} ${form(classes, "klasa aktywów", "klasy aktywów", "klas aktywów")}. Jeden rachunek.`,
      lead: (instruments) => `Obecnie na liście: ${instruments} ${form(instruments, "instrument", "instrumenty", "instrumentów")}. Każdy rynek ma własną strukturę, godziny handlu i czynniki wpływające na ceny.`,
      classes: {
        forex: { name: "Forex", line: "Pary walutowe, kwotowane całą dobę od poniedziałku do piątku." },
        metals: { name: "Metale", line: "Złoto, srebro, platyna i pallad, kwotowane do dolara amerykańskiego." },
        indices: { name: "Indeksy", line: "Główne indeksy giełdowe ze Stanów Zjednoczonych, Europy i Azji." },
        energy: { name: "Energia", line: "Ropa naftowa Brent i WTI oraz gaz ziemny." },
        equities: { name: "Akcje", line: "Kontrakty CFD na akcje powszechnie obserwowanych spółek amerykańskich." },
        crypto: { name: "Kryptowaluty", line: "Główne aktywa cyfrowe, kwotowane do dolara amerykańskiego." },
      },
      count: (n) => `${n} ${form(n, "instrument", "instrumenty", "instrumentów")}`,
      link: "Rynki",
    },
    platforms: {
      eyebrow: "Platformy",
      title: "Dwie platformy. Te same rynki.",
      lead: "Proszę wybrać środowisko transakcyjne, które odpowiada Państwa sposobowi pracy. Żadna z platform nie jest lepsza; to różne narzędzia do tych samych rynków.",
      raptor: { role: "Flagowa platforma GIO4X", body: "Obszar roboczy do handlu wieloma klasami aktywów: w przeglądarce, na komputerze i na urządzeniach mobilnych. Technologię dostarcza 777 Raptor." },
      mt5: { role: "Platforma zewnętrznego dostawcy", body: "Opracowana przez MetaQuotes platforma dla wielu klas aktywów, którą wielu traderów już zna: jej wykresy, typy zleceń i handel automatyczny z użyciem Expert Advisors." },
      trademark: "MetaTrader 5 jest znakiem towarowym MetaQuotes Ltd. GIO4X nie jest właścicielem MetaTrader i jest niezależny od MetaQuotes.",
      compare: "Porównanie obu platform",
    },
    accounts: {
      eyebrow: "Rachunki",
      title: (n) => `${n} ${form(n, "rachunek", "rachunki", "rachunków")} w przystępnym porównaniu.`,
      lead: "Różnią się sposobem, w jaki płacą Państwo za handel: poprzez spread albo poprzez surowy spread powiększony o prowizję.",
      suits: { classic: "Dla początkujących", premium: "Dla doświadczonych traderów", ecn: "Dla profesjonalistów" },
      rows: { minDeposit: "Minimalny depozyt", spreadFrom: "Spread od", commission: "Prowizja", leverage: "Dźwignia", minTrade: "Minimalna transakcja", stopOut: "Poziom stop out" },
      // the published values are decimals (2.5 pips, 0.01 lots), which take the genitive singular in Polish
      words: { none: "Brak", upTo: "Do", perLotPerSide: "za lot, za każdą stronę transakcji", pips: "pipsa", lots: "lota" },
      note: "Warunki zgodne z opublikowanymi przez GIO4X. Spready są wartościami minimalnymi i rozszerzają się zależnie od warunków rynkowych; dostępna dla Państwa dźwignia zależy od instrumentu i od Państwa jurysdykcji.",
      link: "Typy rachunków",
    },
    tools: {
      eyebrow: "Narzędzia",
      title: "Proszę wykonać obliczenia, zanim zrobi to rynek.",
      lead: (n) => `Kalkulatory i wizualizacje (${n}), które pokazują swoje wzory i nigdy nie mówią Państwu, czym handlować.`,
      link: "Wszystkie narzędzia",
    },
    learning: {
      eyebrow: "Nauka",
      title: "Mechanizmy i pojęcia, przekazywane odpowiedzialnie.",
      lead: "Academy wyjaśnia, jak działają rynki i zlecenia, a słownik przystępnie definiuje pojęcia. Żadne z nich nie obiecuje sukcesu w handlu.",
      academy: { name: "Academy", body: (n) => `${n} ${form(n, "lekcja", "lekcje", "lekcji")}, poziom po poziomie.` },
      glossary: { name: "Słownik", body: (n) => `${n} ${form(n, "pojęcie", "pojęcia", "pojęć")} z przystępnymi definicjami.` },
    },
    trust: {
      eyebrow: "Trust Centre",
      title: "Zaufanie nie jest deklaracją. Jest architekturą.",
      lead: "Nie powinni Państwo musieć wierzyć brokerowi na słowo. Te strony istnieją po to, aby mogli Państwo to sprawdzić.",
      doors: {
        verify: { t: "Czy ten link naprawdę należy do GIO4X?", d: "Każdy adres można sprawdzić w oficjalnym rejestrze." },
        disclose: { t: "Co publikujemy, a czego jeszcze nie.", d: "Koszty, warunki, dane spółki i pytania, które pozostają otwarte." },
        source: { t: "Skąd pochodzi każda liczba.", d: "Co w tym serwisie oznaczają określenia „referencyjny”, „orientacyjny” i „harmonogram”." },
        risk: { t: "Ostrzeżenie o ryzyku.", d: "Handel z dźwignią może szybko doprowadzić do utraty pieniędzy. Proszę przeczytać to w pierwszej kolejności." },
      },
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Proszę napisać do GIO4X.",
      lead: "Zapytania przyjmujemy pocztą elektroniczną. Jak się z nami skontaktować i czego nigdy nie wysyłać, opisano na stronie kontaktowej.",
      link: "Jak się z nami skontaktować",
    },
  },
  guide: {
    metaTitle: "Przewodnik po serwisie",
    metaDescription: "Główne działy serwisu GIO4X, opisane jeden po drugim. Każdy odnośnik otwiera stronę w języku angielskim.",
    eyebrow: "Przewodnik po serwisie",
    title: "Serwis GIO4X, dział po dziale.",
    lead: "Serwis jest napisany po angielsku. Ten przewodnik opisuje każdy z głównych działów; każdy odnośnik poniżej otwiera stronę w języku angielskim.",
    sections: {
      markets: { name: "Rynki", body: "Klasy aktywów, co jest przedmiotem obrotu w każdej z nich i kiedy, oraz co porusza cenami: banki centralne, publikacje danych gospodarczych i historia rynków." },
      trading: { name: "Handel", body: "Typy rachunków, warunki handlu, specyfikacje kontraktów, wpłaty i wypłaty oraz kalkulatory z zestawu Trader Toolkit." },
      platforms: { name: "Platformy", body: "777 Raptor i MetaTrader 5: czym jest każda z nich, jak zacząć, oraz porównanie, które nie wskazuje zwycięzcy." },
      intelligence: { name: "Intelligence", body: "Analizy i materiały objaśniające, codzienny blog oraz GIO4X Labs: interaktywne eksperymenty i stanowisko ćwiczeniowe działające na zmyślonych cenach." },
      academy: { name: "Academy", body: "Lekcje poziom po poziomie, słownik, szkoła wykresów i strony informacyjne. To wyłącznie edukacja, która nie obiecuje sukcesu w handlu." },
      company: { name: "Firma", body: "Kim jest GIO4X, Trust Centre, dokumenty prawne, kariera, centrum prasowe i kontakt." },
    },
    open: "Przejście do działu",
    pages: "Strony w tym dziale",
    alsoTitle: "Przydatne również",
    also: {
      help: { name: "Pomoc i FAQ", body: "Odpowiedzi na najczęstsze pytania oraz zgłoszenia do działu wsparcia dla obecnych klientów." },
      legal: { name: "Dokumenty prawne", body: "Regulamin, Informacja o ryzyku, Polityka prywatności, Polityka AML i Informacja o plikach cookie. Są publikowane wyłącznie w języku angielskim." },
      directory: { name: "Pełny spis stron", body: "Wszystkie strony serwisu, wymienione na jednej stronie." },
    },
  },
  risk: {
    metaTitle: "Ostrzeżenie o ryzyku",
    metaDescription: "Ostrzeżenie o ryzyku GIO4X w tłumaczeniu, z angielskim oryginałem poniżej. Rozstrzygający jest tekst angielski.",
    eyebrow: "Ostrzeżenie o ryzyku",
    title: "Proszę przeczytać przed rozpoczęciem handlu.",
    lead: "Handel z wykorzystaniem depozytu zabezpieczającego może doprowadzić do utraty części lub całości zainwestowanych przez Państwa pieniędzy. Poniższe ostrzeżenie jest tłumaczeniem; po nim następuje angielski oryginał, który jest rozstrzygający.",
    warningTitle: "Ostrzeżenie o ryzyku",
    warning:
      "Handel walutami z wykorzystaniem depozytu zabezpieczającego wiąże się z wysokim poziomem ryzyka i może nie być odpowiedni dla wszystkich inwestorów. Wysoki poziom dźwigni finansowej może działać zarówno na Państwa niekorzyść, jak i na Państwa korzyść. Przed podjęciem decyzji o handlu walutami powinni Państwo starannie rozważyć swoje cele inwestycyjne, poziom doświadczenia i skłonność do ryzyka. Istnieje możliwość, że poniosą Państwo stratę części lub całości początkowej inwestycji, dlatego nie powinni Państwo inwestować pieniędzy, na których utratę nie mogą sobie Państwo pozwolić.",
    company: "GIO4X, spółka zależna 777 Capital Markets Limited (Wielka Brytania), Company No. 17049134.",
    notAdvice: "Treść tego serwisu ma charakter informacji edukacyjnej; nie stanowi porady inwestycyjnej ani rekomendacji zawierania transakcji.",
    originalTitle: "Oryginał angielski",
    prevails: "Tekst angielski jest oryginałem. Jeżeli niniejsze tłumaczenie w jakikolwiek sposób się od niego różni, rozstrzygający jest tekst angielski.",
    fullBody: "Pełna Informacja o ryzyku i pozostałe dokumenty prawne są publikowane wyłącznie w języku angielskim.",
    fullLink: "Pełna Informacja o ryzyku",
    legalLink: "Wszystkie dokumenty prawne",
  },
  contact: {
    metaTitle: "Kontakt",
    metaDescription: "Jak skontaktować się z GIO4X: pocztą elektroniczną, przez angielskojęzyczny formularz kontaktowy lub pocztą tradycyjną.",
    eyebrow: "Kontakt",
    title: "Proszę napisać do GIO4X.",
    lead: "Najpewniejszym sposobem kontaktu z nami jest poczta elektroniczna. Mogą Państwo pisać po polsku; nasza odpowiedź może być po angielsku.",
    emailTitle: "E-mailem",
    emailBody: "W każdej sprawie",
    formTitle: "Formularz kontaktowy",
    formBody: "Formularz kontaktowy kieruje Państwa wiadomość według tematu, a po jej otrzymaniu wyświetla numer referencyjny. Formularz jest w języku angielskim.",
    formLink: "Przejście do formularza kontaktowego",
    supportTitle: "Obecni klienci",
    supportBody: "Jeżeli mają już Państwo rachunek albo problem wymagający rozwiązania, zgłoszenie do działu wsparcia otrzymuje numer referencyjny i odpowiedź, którą mogą Państwo przeczytać w serwisie. Ta strona jest w języku angielskim.",
    supportLink: "Zgłoszenia do działu wsparcia",
    postTitle: "Pocztą tradycyjną",
    postBody: "Dwa adresy opublikowane przez GIO4X. W sprawach pilnych e-mail dotrze do nas szybciej niż list.",
    headOffice: "Siedziba główna",
    supportOffice: "Biuro wsparcia",
    noPhone: "Nie podajemy numeru telefonu ani godzin pracy działu wsparcia, ponieważ żadna z tych informacji nie została potwierdzona do publikacji.",
    safetyTitle: "Zanim Państwo napiszą",
    safety: {
      password: "GIO4X nigdy nie poprosi Państwa o hasło ani o jednorazowy kod bezpieczeństwa: ani e-mailem, ani w wiadomości, ani telefonicznie.",
      documents: "Proszę nie wysyłać e-mailem dokumentów tożsamości ani danych karty. Jeżeli dokumenty będą potrzebne, otrzymają Państwo informację, jak je przekazać.",
      verify: "Link, który podaje się za nasz, można sprawdzić w oficjalnym rejestrze.",
    },
    verifyLink: "Weryfikacja linku GIO4X",
  },
};
