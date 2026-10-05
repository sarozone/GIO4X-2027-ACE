import type { AccountKey } from "@/data/accounts";
import type { AssetClassKey } from "@/data/instruments";

/**
 * The source dictionary for the translated pages (docs/I18N.md).
 *
 * Every other language file is typed `Dictionary` (`typeof en`), so a key
 * that is missing or misspelt there fails `tsc`. The English site itself does
 * not read this file: its copy still lives where it is used. What is here is
 * the English of the four pages that exist in the other languages, written to
 * make no claim the English site does not make.
 *
 * Figures are never written into a sentence. A sentence that carries a number
 * is a function, and the page passes the number from the data modules.
 * Brand and product names stay as they are in every language.
 */
export const en = {
  notice: {
    label: "Translation",
    body: "This translation is provided for convenience and is awaiting review by a qualified translator. If it differs from the English version, the English version prevails.",
    english: "Read in English",
  },
  common: {
    home: "Home",
    inEnglish: "in English",
    namesInEnglish: "names in English",
    restrictedTitle: "Where services are not available",
    restrictedBody: "The services of GIO4X are not available to residents of the following jurisdictions",
  },
  home: {
    metaTitle: "Global markets, explained plainly",
    metaDescription: "GIO4X is a multi-asset brokerage offering access to global markets through MetaTrader 5 and 777 Raptor, with an open library of market tools, research and education.",
    title: "Global markets, explained plainly.",
    lead: "GIO4X is a multi-asset brokerage offering access to global markets through MetaTrader 5 and 777 Raptor, with an open library of market tools, research and education.",
    ctaGuide: "Site guide",
    ctaContact: "Contact",
    what: {
      eyebrow: "What GIO4X is",
      title: "A brokerage house judged by its conduct.",
      body: "GIO4X gives access to several asset classes from one account, on two trading platforms. Trading conditions are published as they are, and where an answer has not yet been verified, the website says so.",
      tagline: "The motto of GIO4X is “The Gentleman’s Brokerage House”: a brokerage house that wishes to be known by its conduct.",
      language: "Most of this website is written in English. This page, the site guide, the risk warning and the contact page are available in this language; every other page is linked in English and marked as such.",
      principles: {
        show: { t: "Say only what can be shown.", d: "Trading conditions are published as they are. Data carries its source and its date." },
        explain: { t: "Explain before you sell.", d: "Every market, cost and order type has a plain explanation, and most have a tool that lets you work the numbers yourself." },
        respect: { t: "Respect the client’s capital.", d: "No countdowns, no bonuses dressed as urgency, no pressure. Risk is stated in ordinary type." },
      },
    },
    markets: {
      eyebrow: "Markets",
      title: (classes: number) => `${classes} asset classes. One account.`,
      lead: (instruments: number) => `${instruments} instruments are listed today. Each market has its own structure, hours and drivers.`,
      classes: {
        forex: { name: "Forex", line: "Currency pairs, quoted around the clock from Monday to Friday." },
        metals: { name: "Metals", line: "Gold, silver, platinum and palladium, quoted against the US dollar." },
        indices: { name: "Indices", line: "Benchmark equity indices from the United States, Europe and Asia." },
        energy: { name: "Energy", line: "Brent and WTI crude oil, and natural gas." },
        equities: { name: "Equities", line: "Share CFDs on widely followed US companies." },
        crypto: { name: "Crypto", line: "Major digital assets, quoted against the US dollar." },
      } satisfies Record<AssetClassKey, { name: string; line: string }>,
      count: (n: number) => `${n} instruments`,
      link: "Markets",
    },
    platforms: {
      eyebrow: "Platforms",
      title: "Two platforms. The same markets.",
      lead: "Choose the trading environment that matches how you work. Neither is the better one; they are different instruments for the same markets.",
      raptor: { role: "The GIO4X flagship", body: "A multi-asset trading workspace on web, desktop and mobile. The technology is provided by 777 Raptor." },
      mt5: { role: "Third-party platform", body: "The multi-asset platform developed by MetaQuotes, which many traders already know: its charts, its order types and automated trading through Expert Advisors." },
      trademark: "MetaTrader 5 is a trademark of MetaQuotes Ltd. GIO4X does not own MetaTrader and is independent of MetaQuotes.",
      compare: "Compare the two platforms",
    },
    accounts: {
      eyebrow: "Accounts",
      title: (n: number) => `${n} accounts, compared plainly.`,
      lead: "The difference between them is how you pay for trading: through the spread, or through a raw spread plus a commission.",
      suits: { classic: "For those starting out", premium: "For experienced traders", ecn: "For professionals" } satisfies Record<AccountKey, string>,
      rows: { minDeposit: "Minimum deposit", spreadFrom: "Spread from", commission: "Commission", leverage: "Leverage", minTrade: "Minimum trade", stopOut: "Stop out level" },
      /** the words inside the published values (src/data/accounts.ts); the figures themselves are never retyped */
      words: { none: "None", upTo: "Up to", perLotPerSide: "per lot, per side", pips: "pips", lots: "lots" },
      note: "Conditions as published by GIO4X. Spreads are minimums and widen with market conditions; the leverage available to you depends on the instrument and your jurisdiction.",
      link: "Account types",
    },
    tools: {
      eyebrow: "Tools",
      title: "Work the numbers before the market does.",
      lead: (n: number) => `${n} calculators and visualisers that show their formulae and never tell you what to trade.`,
      link: "All tools",
    },
    learning: {
      eyebrow: "Learning",
      title: "Mechanics and concepts, taught responsibly.",
      lead: "The Academy explains how markets and orders work, and the glossary defines the terms plainly. Neither promises success in trading.",
      academy: { name: "Academy", body: (n: number) => `${n} lessons, level by level.` },
      glossary: { name: "Glossary", body: (n: number) => `${n} terms, plainly defined.` },
    },
    trust: {
      eyebrow: "Trust Centre",
      title: "Trust is not a claim. It is an architecture.",
      lead: "You should not have to take a broker at its word. These pages exist so that you can check.",
      doors: {
        verify: { t: "Is this link really GIO4X?", d: "Check any address against the official registry." },
        disclose: { t: "What we publish, and what we do not yet.", d: "Costs, conditions, company details and the questions still open." },
        source: { t: "Where every number comes from.", d: "What “reference”, “indicative” and “schedule” mean on this website." },
        risk: { t: "The risk warning.", d: "Leveraged trading can lose money quickly. Read this first." },
      },
    },
    contact: {
      eyebrow: "Contact",
      title: "Write to GIO4X.",
      lead: "Enquiries are received by email. How to reach us, and what never to send, is set out on the contact page.",
      link: "How to reach us",
    },
  },
  guide: {
    metaTitle: "Site guide",
    metaDescription: "The main sections of the GIO4X website, described one by one. Each link opens the English page.",
    eyebrow: "Site guide",
    title: "The GIO4X website, section by section.",
    lead: "The website is written in English. This guide describes each main section; every link below opens an English page.",
    sections: {
      markets: { name: "Markets", body: "The asset classes, what trades in each of them and when, and what moves prices: central banks, economic releases and market history." },
      trading: { name: "Trading", body: "Account types, trading conditions, contract specifications, funding and withdrawals, and the calculators of the Trader Toolkit." },
      platforms: { name: "Platforms", body: "777 Raptor and MetaTrader 5: what each one is, how to get started, and a comparison that declares no winner." },
      intelligence: { name: "Intelligence", body: "Analysis and explainers, the daily blog, and GIO4X Labs: interactive experiments and a practice desk that runs on invented prices." },
      academy: { name: "Academy", body: "Lessons level by level, the glossary, the chart school and reference pages. It is education only and promises no success in trading." },
      company: { name: "Company", body: "Who GIO4X is, the Trust Centre, the legal documents, careers, the media centre and contact." },
    },
    open: "Open the section",
    pages: "Pages in this section",
    alsoTitle: "Also useful",
    also: {
      help: { name: "Help and FAQ", body: "Answers to the common questions, and support requests for existing clients." },
      legal: { name: "Legal documents", body: "Terms and Conditions, Risk Disclosure, Privacy Policy, AML Policy and Cookie Notice. They are published in English only." },
      directory: { name: "Full directory", body: "Every page of the website, listed on one page." },
    },
  },
  risk: {
    metaTitle: "Risk warning",
    metaDescription: "The GIO4X risk warning in translation, with the English original beneath it. The English text prevails.",
    eyebrow: "Risk warning",
    title: "Read this before you trade.",
    lead: "Trading on margin can result in the loss of some or all of the money you invest. The warning below is a translation; the English original follows it and prevails.",
    warningTitle: "Risk warning",
    warning:
      "Trading foreign exchange on margin carries a high level of risk, and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.",
    company: "GIO4X, a subsidiary of 777 Capital Markets Limited (UK), Company No. 17049134.",
    notAdvice: "The content of this website is educational information, not investment advice or a recommendation to trade.",
    originalTitle: "English original",
    prevails: "The English text is the original. If this translation differs from it in any way, the English text prevails.",
    fullBody: "The full Risk Disclosure and the other legal documents are published in English only.",
    fullLink: "Read the full Risk Disclosure",
    legalLink: "All legal documents",
  },
  contact: {
    metaTitle: "Contact",
    metaDescription: "How to reach GIO4X: by email, through the English contact form, or by post.",
    eyebrow: "Contact",
    title: "Write to GIO4X.",
    lead: "The surest way to reach us is by email. You may write in your own language; our reply may be in English.",
    emailTitle: "By email",
    emailBody: "For every kind of enquiry",
    formTitle: "The contact form",
    formBody: "The contact form routes your message by topic and shows you a reference once it is received. The form is in English.",
    formLink: "Open the contact form",
    supportTitle: "Existing clients",
    supportBody: "With an account already, or a problem that needs solving, a support request gets a reference and a reply you can read on the website. That page is in English.",
    supportLink: "Support requests",
    postTitle: "By post",
    postBody: "The two addresses GIO4X has published. For anything time-sensitive, email will reach us sooner than a letter.",
    headOffice: "Head office",
    supportOffice: "Support office",
    noPhone: "No telephone number or support hours are shown because neither has been confirmed for publication.",
    safetyTitle: "Before you write",
    safety: {
      password: "GIO4X will never ask for your password or a one-time security code, by email, by message or by telephone.",
      documents: "Do not send identity documents or card details by email. If documents are needed, you will be told how to provide them.",
      verify: "A link that claims to be ours can be checked against the official registry.",
    },
    verifyLink: "Verify a GIO4X link",
  },
};

export type Dictionary = typeof en;
