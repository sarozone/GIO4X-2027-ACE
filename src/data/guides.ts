/**
 * The region guides: one page for a trader sitting in each part of the world.
 *
 * What is here is words only. No opening hour is written in this file: every
 * time a guide shows is worked out from lib/sessions for the reference time
 * zones named below (components/guides/hours.ts), so the guides and the clocks
 * cannot disagree.
 *
 * The rules these pages keep:
 *   - no tax rate, threshold, rule or legal statement for any country. The
 *     tax section is a list of questions to take to a qualified adviser or
 *     the tax authority, and nothing else;
 *   - nothing about which countries any broker accepts;
 *   - a closing day is named by its date only where it is fixed and well
 *     known. Everything else is described by its kind, and the page says that
 *     each exchange publishes its own calendar;
 *   - a page explains how the day is laid out. It never says when to trade.
 */

export type GuideZone = {
  /** IANA time zone, resolved by the runtime's own database */
  tz: string;
  /** the city the zone is named by on the page */
  city: string;
  /** who else keeps this clock, in a few words */
  covers: string;
};

export type Guide = {
  slug: string;
  /** the region, as it reads in a list */
  name: string;
  /** the page's h1 and search title */
  title: string;
  description: string;
  lead: string;
  zones: GuideZone[];
  /** how the day sits on a local clock, in words (the hours are in the tables) */
  day: string[];
  /** daylight-saving time as it touches this region */
  dst: string[];
  /** the kinds of day on which markets here close */
  closures: string[];
  /** one question written by hand; the page adds two whose answers it computes */
  faq: { q: string; a: string };
  /** other words people search by */
  also: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "asia-pacific",
    name: "Asia-Pacific",
    title: "Forex market hours in Asia-Pacific",
    description:
      "When the Sydney, Tokyo, London and New York forex sessions and the main stock exchanges are open in Singapore and Sydney time, which hours overlap, how daylight saving moves them and the kinds of day markets close. Explanation, not advice.",
    lead: "The trading day begins here. This page lays the four sessions and the main exchanges on a Singapore clock and a Sydney clock, and on yours.",
    zones: [
      { tz: "Asia/Singapore", city: "Singapore", covers: "the same clock as Hong Kong, Kuala Lumpur, Manila and Perth" },
      { tz: "Australia/Sydney", city: "Sydney", covers: "the same clock as Melbourne and Canberra" },
    ],
    day: [
      "By convention the FX week opens with the Sydney window on Monday morning, and Tokyo follows. For a trader in this region those two windows fall in the working day, London opens in the local afternoon or evening, and New York runs late at night and into the early morning.",
      "The region’s own exchanges (Sydney, Tokyo, Hong Kong, Singapore) all trade in local daytime, and three of them stop for a midday break, which the tables show.",
    ],
    dst: [
      "Singapore, Hong Kong, Tokyo and most of Asia do not change their clocks. On those clocks the Asian windows stay where they are all year, and it is London and New York that arrive an hour earlier in the northern summer and an hour later in the northern winter.",
      "Sydney does change, and in the opposite direction: New South Wales moves its clocks forward on the first Sunday of October and back on the first Sunday of April. Because Britain and Sydney change in opposite directions, the gap between them changes by two hours across the year.",
      "New Zealand, a little further east, also changes its clocks. Queensland, the Northern Territory and Western Australia do not.",
    ],
    closures: [
      "The Lunar New Year closes exchanges in Hong Kong, Singapore, mainland China and several other markets for one or more days. Its date moves each year, in January or February.",
      "Japan’s exchanges close over the New Year, from 31 December to 3 January, and again for the run of public holidays in late April and early May known as Golden Week.",
      "Australia’s exchange closes on national public holidays, among them 26 January.",
      "Religious and national holidays in each country, many of which move with a lunar calendar, close that country’s exchange and leave the others open.",
    ],
    faq: {
      q: "Is the “Asian session” one market?",
      a: "No. It is a name for the hours when the financial centres of Asia and Australasia are at work. Foreign exchange has no single exchange: banks and dealers quote prices to each other, and the Sydney and Tokyo windows are conventions for when those centres are busiest. Each stock exchange in the region is a separate venue with its own hours and its own holiday calendar.",
    },
    also: ["Asian session times", "Tokyo session in Singapore time", "forex hours AEST", "Sydney session"],
  },
  {
    slug: "india-and-south-asia",
    name: "India and South Asia",
    title: "Forex market hours in India and South Asia",
    description:
      "When the four forex sessions and the main stock exchanges are open in Indian Standard Time and Pakistan time, which hours overlap, why the London and New York times move twice a year though local clocks do not, and the kinds of day markets close.",
    lead: "No clock in the region changes for summer, yet the London and New York hours still move twice a year. This page shows where they fall on a Mumbai clock and a Karachi clock, and on yours.",
    zones: [
      { tz: "Asia/Kolkata", city: "Mumbai", covers: "Indian Standard Time, also kept by Sri Lanka" },
      { tz: "Asia/Karachi", city: "Karachi", covers: "Pakistan Standard Time" },
    ],
    day: [
      "South Asia sits between Tokyo and London. The Tokyo window is already open at the start of the local day, London opens around the middle of it, and New York opens in the evening and runs past midnight.",
      "The clocks of the region are not all a whole number of hours from UTC: India and Sri Lanka keep a half-hour offset and Nepal a three-quarter-hour one, so session times here often fall on the half hour.",
    ],
    dst: [
      "India, Pakistan, Bangladesh, Sri Lanka and Nepal do not change their clocks at present.",
      "London and New York do. When Britain and the United States move to summer time, their windows open an hour earlier on a South Asian clock; when they move back, an hour later. The two countries do not change on the same weekend, so for a few weeks each spring and about a week each autumn the gap between London and New York is an hour shorter than usual.",
    ],
    closures: [
      "India’s exchanges close on the fixed national days: 26 January (Republic Day), 15 August (Independence Day) and 2 October (Gandhi Jayanti), and on 25 December.",
      "Many closing days follow lunar or regional calendars and move each year: Holi, Diwali, Eid al-Fitr, Eid al-Adha, Muharram and others. On Diwali the Indian exchanges traditionally hold a short ceremonial session in the evening.",
      "Pakistan, Bangladesh and Sri Lanka each have their own national days and religious holidays, set by their own exchanges.",
    ],
    faq: {
      q: "Why do forex session times fall on the half hour in India?",
      a: "Because Indian Standard Time is five and a half hours ahead of UTC, not a whole number of hours. A window that opens on the hour in London or New York therefore opens on the half hour on an Indian clock. Nothing about the market is different; only the clock it is read on.",
    },
    also: ["forex market timings in India", "London session IST", "New York session IST", "forex session times Pakistan"],
  },
  {
    slug: "middle-east",
    name: "Middle East",
    title: "Forex market hours in the Middle East",
    description:
      "When the four forex sessions and the main stock exchanges are open in Dubai and Riyadh time, which hours overlap, how daylight saving elsewhere moves them, why the local working week matters and the kinds of day markets close.",
    lead: "London opens around the middle of the day here and New York in the late afternoon. This page lays the sessions on a Dubai clock and a Riyadh clock, and on yours.",
    zones: [
      { tz: "Asia/Dubai", city: "Dubai", covers: "Gulf Standard Time, also kept by Oman" },
      { tz: "Asia/Riyadh", city: "Riyadh", covers: "the same clock as Kuwait, Qatar and Bahrain" },
    ],
    day: [
      "The Gulf sits a few hours ahead of London. The Tokyo window is open through the local morning, London opens around midday, and New York opens in the late afternoon and closes after midnight.",
      "The working week is not the same everywhere in the region. The United Arab Emirates moved to a Monday-to-Friday week at the start of 2022, while some neighbouring countries keep a Sunday-to-Thursday week. A local exchange can therefore be open on a Sunday, when the foreign-exchange market is not, and closed on a Friday, when it is.",
    ],
    dst: [
      "The Gulf states do not change their clocks. A few countries elsewhere in the region do, and the rules there have changed more than once in recent years, so a local source is the thing to check.",
      "On a Gulf clock it is London and New York that move: an hour earlier while Britain and the United States are on summer time, an hour later for the rest of the year. Because those two change on different weekends, the gap between them is an hour shorter for a few weeks in spring and about a week in autumn.",
    ],
    closures: [
      "The main closing days follow the Islamic calendar and move about eleven days earlier each year: Eid al-Fitr, Eid al-Adha, the Islamic New Year and others. Their exact dates are confirmed close to the time.",
      "Each country has its own national day or days, on which its exchange closes.",
      "Hours are often shortened during Ramadan. Exchanges announce them each year.",
    ],
    faq: {
      q: "Is the forex market open on Friday and Sunday in the Gulf?",
      a: "The international foreign-exchange market follows the Monday-to-Friday week of the large financial centres, whatever the local working week. On this site’s timetable the week begins as Monday morning starts in Sydney, which is the small hours of Monday on a Gulf clock, and ends when New York closes on Friday, which is the small hours of Saturday there. Local stock exchanges keep the local week instead.",
    },
    also: ["forex market hours Dubai time", "forex hours UAE", "London session GST", "forex hours Saudi Arabia time"],
  },
  {
    slug: "europe",
    name: "Europe",
    title: "Forex market hours in Europe",
    description:
      "When the four forex sessions and the main stock exchanges are open in Central European and Eastern European time, which hours overlap, how the clock changes in March and October move things and the kinds of day markets close.",
    lead: "London and the continental exchanges fill the working day here, and New York opens in the afternoon. This page lays the sessions on a Frankfurt clock and an Athens clock, and on yours.",
    zones: [
      { tz: "Europe/Berlin", city: "Frankfurt", covers: "Central European Time: Paris, Madrid, Rome, Amsterdam, Warsaw, Zurich" },
      { tz: "Europe/Athens", city: "Athens", covers: "Eastern European Time: Helsinki, Bucharest, Sofia" },
    ],
    day: [
      "For most of the continent the London window covers the working day, shifted an hour or two later on the local clock. New York opens in the afternoon and closes late in the evening; Tokyo is open overnight and into the morning.",
      "The afternoon is when the London and New York windows are both open, which is the best-known overlap of the day.",
    ],
    dst: [
      "The European Union changes its clocks on the last Sunday of March and the last Sunday of October, and Britain does so on the same days. London and the continent therefore keep the same distance from each other all year.",
      "The United States changes on the second Sunday of March and the first Sunday of November. For the weeks in between (two or three in March, one at the end of October) New York is an hour closer to Europe than usual, and its window opens and closes an hour earlier on a European clock.",
      "Tokyo never changes, so its window moves by an hour on a European clock when Europe changes. Sydney changes in the opposite direction, so its window moves by two hours across the year.",
    ],
    closures: [
      "1 January and 25 December close exchanges across the continent, and 26 December closes most of them.",
      "Good Friday and Easter Monday close most European exchanges. Their dates move each year.",
      "1 May, Labour Day, is a closing day for many continental exchanges.",
      "Each country adds its own national days, on which its own exchange may close while the others trade.",
    ],
    faq: {
      q: "Do forex hours change when the clocks change in Europe?",
      a: "On a European clock, the London window does not move, because Britain and the European Union change on the same days. New York’s window moves for a few weeks in spring and about a week in autumn, when the United States has changed and Europe has not. Tokyo’s window moves by an hour, because Japan never changes its clocks.",
    },
    also: ["forex market hours CET", "London session in CET", "New York open in Central European Time", "forex hours EET"],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    title: "Forex market hours in UK time",
    description:
      "When the Sydney, Tokyo, London and New York forex sessions and the main stock exchanges are open in UK time, which hours overlap, what changes between GMT and British Summer Time and the kinds of day markets close.",
    lead: "The London window is the local working day. This page lays the other three sessions and the main exchanges around it on a London clock, and on yours.",
    zones: [{ tz: "Europe/London", city: "London", covers: "the United Kingdom; Ireland and Portugal keep the same clock" }],
    day: [
      "On a London clock the London window is, by definition, the working day. Tokyo is open overnight and overlaps the first part of the London morning; New York opens after midday and closes in the evening; Sydney opens late in the evening.",
      "The afternoon, when London and New York are both open, is the best-known overlap of the day.",
    ],
    dst: [
      "Britain keeps Greenwich Mean Time in winter and British Summer Time, one hour ahead, from the last Sunday of March to the last Sunday of October.",
      "The United States changes on the second Sunday of March and the first Sunday of November. In the weeks between the two changes New York’s window sits an hour earlier on a London clock than it does for the rest of the year.",
      "Tokyo does not change its clocks, so its window is an hour later on a London clock in summer. Sydney changes the other way, so its window moves by two hours across the year.",
    ],
    closures: [
      "The London exchange closes on 1 January, 25 December and 26 December, or on the weekday that stands in for one of them when it falls on a weekend.",
      "Good Friday and Easter Monday, whose dates move each year.",
      "The bank holidays: Mondays in early and late May and in late August.",
      "The day before Christmas and the last trading day of the year have traditionally been half days.",
    ],
    faq: {
      q: "Does the London session start at a different time in summer?",
      a: "Not on a London clock. The window is kept in local time, so it opens at the same hour on the clock all year. What changes is its time in UTC, which is an hour earlier during British Summer Time, and so its time on any clock that does not change with Britain’s.",
    },
    also: ["forex market hours GMT", "forex hours BST", "New York open UK time", "Tokyo session UK time"],
  },
  {
    slug: "africa",
    name: "Africa",
    title: "Forex market hours in Africa",
    description:
      "When the four forex sessions and the main stock exchanges are open in West Africa Time and South Africa Standard Time, which hours overlap, how clock changes in Europe and America move them and the kinds of day markets close.",
    lead: "Africa shares its hours of daylight with Europe, so London fills the working day. This page lays the sessions on a Lagos clock and a Johannesburg clock, and on yours.",
    zones: [
      { tz: "Africa/Lagos", city: "Lagos", covers: "West Africa Time: Kinshasa, Luanda, Algiers, Tunis" },
      { tz: "Africa/Johannesburg", city: "Johannesburg", covers: "the same clock as Cairo in winter, Harare, Lusaka and Maputo" },
    ],
    day: [
      "The continent spans several time zones, all within a few hours of London’s. On most African clocks the London window covers the working day, New York opens in the afternoon and closes late in the evening, and Tokyo is open from the night into the morning.",
      "East Africa is an hour ahead of Johannesburg and far-western Africa is on the same clock as London in winter, so the tables for the two reference cities bracket most of the continent. The dial can be set to your own clock.",
    ],
    dst: [
      "Most of Africa, including Nigeria, South Africa and Kenya, does not change its clocks. A small number of countries in the north of the continent do, under rules that have changed more than once, so a local source is the thing to check.",
      "On a clock that never changes, the London and New York windows arrive an hour earlier from late March to late October and an hour later for the rest of the year. Britain and the United States change on different weekends, so for a few weeks in spring and about a week in autumn the gap between London and New York is an hour shorter than usual.",
    ],
    closures: [
      "1 January and 25 December close exchanges across the continent.",
      "South Africa’s exchange closes on that country’s public holidays, several of which have fixed dates, among them 27 April (Freedom Day) and 16 December (Day of Reconciliation).",
      "In many countries the main closing days follow the Islamic calendar (Eid al-Fitr, Eid al-Adha) or the Christian one (Good Friday, Easter Monday), and move each year.",
      "Each country’s independence day or national day closes its own exchange.",
    ],
    faq: {
      q: "Do forex session times change in countries that have no daylight saving?",
      a: "Yes, on the local clock. The London and New York windows are kept in London and New York time, and those cities change their clocks twice a year. Seen from a clock that does not change, both windows move an hour earlier in the northern summer and an hour later in the northern winter.",
    },
    also: ["forex market hours South Africa time", "forex hours SAST", "forex session times Nigeria", "London session WAT"],
  },
  {
    slug: "north-america",
    name: "North America",
    title: "Forex market hours in North America",
    description:
      "When the Sydney, Tokyo, London and New York forex sessions and the main stock exchanges are open in Eastern and Pacific time, which hours overlap, what happens when the clocks change in March and November and the kinds of day markets close.",
    lead: "The trading day ends here, and the next one begins the same evening. This page lays the sessions on a New York clock and a Los Angeles clock, and on yours.",
    zones: [
      { tz: "America/New_York", city: "New York", covers: "Eastern Time: Toronto, Miami, Atlanta" },
      { tz: "America/Los_Angeles", city: "Los Angeles", covers: "Pacific Time: Vancouver, San Francisco, Seattle" },
    ],
    day: [
      "On an Eastern clock London has been open for hours by the time the day starts, and the morning is when the London and New York windows are both open. New York closes in the late afternoon; by this site’s timetable that close on a Friday is the end of the FX week.",
      "The same evening, Sydney opens the next trading day and Tokyo follows. On the Pacific coast everything is three hours earlier on the clock: London is closing by mid-morning.",
    ],
    dst: [
      "Most of the United States and Canada move their clocks forward on the second Sunday of March and back on the first Sunday of November. Arizona (for the most part) and Hawaii do not change.",
      "Britain and the European Union change on the last Sunday of March and the last Sunday of October. In the weeks between the two changes London is four hours ahead of New York, not five, and its window opens and closes an hour later on a North American clock.",
      "Tokyo does not change, so its window moves by an hour on a North American clock when North America changes. Sydney changes in the opposite direction, so its window moves by two hours across the year.",
    ],
    closures: [
      "The fixed-date holidays of the New York exchange are 1 January, 19 June (Juneteenth), 4 July (Independence Day) and 25 December. When one falls on a weekend, the exchange names the weekday that stands in for it.",
      "Others fall on a named weekday and so move in date: Martin Luther King Jr. Day, Presidents’ Day, Memorial Day, Labor Day and Thanksgiving, with Good Friday as well.",
      "The session is shortened on some days around Independence Day, Thanksgiving and Christmas.",
      "Canada’s exchanges keep Canada’s holidays, some of which differ, among them 1 July (Canada Day).",
    ],
    faq: {
      q: "When does the forex week open and close in the United States?",
      a: "By the convention used on this site, the week ends when the New York window closes on Friday afternoon and begins again late on Sunday afternoon, at the same hour on a New York clock, as Monday morning starts in Sydney. The hours on other clocks are in the tables on this page. Individual brokers set their own opening and closing times around this convention.",
    },
    also: ["forex market hours EST", "forex hours Eastern Time", "London session in New York time", "forex market hours Pacific time"],
  },
  {
    slug: "latin-america",
    name: "Latin America",
    title: "Forex market hours in Latin America",
    description:
      "When the four forex sessions and the main stock exchanges are open in São Paulo and Mexico City time, which hours overlap, how clock changes in the north move them and the kinds of day markets close.",
    lead: "Latin America shares its working day with New York. This page lays the sessions on a São Paulo clock and a Mexico City clock, and on yours.",
    zones: [
      { tz: "America/Sao_Paulo", city: "São Paulo", covers: "Brasília time, also the clock of Buenos Aires and Montevideo" },
      { tz: "America/Mexico_City", city: "Mexico City", covers: "central Mexico; Central America keeps the same clock" },
    ],
    day: [
      "The region lies within a few hours of New York’s clock, so the New York window covers most of the local working day. London has been open since the small hours and closes around the middle of the day; the hours when both are open fall in the local morning or around midday.",
      "Sydney and Tokyo open in the late afternoon or evening and trade through the local night.",
    ],
    dst: [
      "Brazil stopped changing its clocks in 2019 and most of Mexico in 2022. Argentina, Colombia and Peru do not change theirs. Chile still does, in the southern pattern: forward in the southern spring, back in the southern autumn.",
      "On a clock that does not change, the New York window arrives an hour earlier from March to November, and the London window an hour earlier from late March to late October. The two countries change on different weekends, so for a few weeks in spring and about a week in autumn the gap between London and New York is an hour shorter than usual.",
    ],
    closures: [
      "1 January and 25 December close exchanges across the region.",
      "Carnival, in February or March, closes Brazil’s exchange. Its dates move each year with Easter, as do Good Friday and Corpus Christi.",
      "Each country’s independence day closes its own exchange: 7 September in Brazil and 16 September in Mexico, for example.",
      "Other national and religious holidays differ from country to country, and several are moved to a Monday by law.",
    ],
    faq: {
      q: "Why did the New York session time change on my clock when my country has no daylight saving?",
      a: "Because New York changed. The window is kept in New York time, and the United States moves its clocks forward in March and back in November. On a clock that stays put, the whole New York window is an hour earlier for those months. The same happens with London, on slightly different dates.",
    },
    also: ["forex market hours Brazil time", "forex session times Latin America", "forex hours Mexico City time", "New York session Brasília time"],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);

/** What is true of every region: why the hours move, and what a closing day is. */
export const DST_GENERAL = [
  "Each session window is kept in the local time of its own city. When that city moves its clocks forward for summer, its window starts an hour earlier in UTC, and so an hour earlier on every clock that did not move with it.",
  "The dates differ. The United States and Canada change on the second Sunday of March and the first Sunday of November; Britain and the European Union on the last Sunday of March and the last Sunday of October; Sydney, in the southern hemisphere, goes the other way, forward in October and back in April. Tokyo does not change at all.",
  "So the timetable has two long settled stretches each year and a few short in-between weeks. The tables on this page show the two settled stretches. The dial shows today, whichever it is.",
];

export const CLOSURES_GENERAL = [
  "Foreign exchange has no single exchange and no single holiday calendar. On 25 December and 1 January almost every financial centre is shut and little or nothing trades. On other holidays one centre is away and the rest carry on, usually with fewer participants; brokers publish their own hours for those days.",
  "Stock, futures and commodity exchanges are different: each one closes on its own country’s public holidays and publishes its calendar, with any shortened days, well ahead. That calendar is the only reliable list. The clocks and tables on this site show regular weekday hours and know nothing of holidays.",
];

/**
 * Questions only. This list states no rule, rate or threshold for any country,
 * because the answers differ from place to place and from person to person.
 */
export const TAX_QUESTIONS = [
  "Where I live, is a gain from trading treated as income, as a capital gain or as something else? Does the answer depend on how often I trade?",
  "Does the kind of product change the answer: a spot position, a contract for difference, a future, an option, a share?",
  "Can a loss be set against gains? Against other income? Carried forward to a later year?",
  "When is a gain or a loss counted: when a position is closed, at the end of the tax year, or when money is withdrawn?",
  "Which records must I keep, in what form and for how long?",
  "Will the statements my broker provides be enough, or is something more needed?",
  "How are costs treated: spreads, commission, overnight financing, data, software?",
  "In which currency do I report, and which exchange rate do I use to convert?",
  "Do I have to report an account held with a firm abroad, even in a year with no gain?",
  "When and how do I declare, and when is payment due?",
  "Does my situation change any of this: resident or not, employed or self-employed, trading in my own name or through a company?",
];
