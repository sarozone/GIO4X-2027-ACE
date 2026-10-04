/**
 * THE MONEY CALCULATORS — the words for /money and /money/[slug].
 *
 * One entry per calculator: what it is called, what it works out, the formula
 * as the page states it, what each letter stands for, a plain explanation,
 * what the sum leaves out, and the questions people ask. The moving part of
 * each page is in src/components/money/Calculators.tsx and its arithmetic in
 * src/components/money/math.ts.
 *
 * The rule these words keep: they explain and never instruct. No rate of
 * growth, inflation or tax is given as fact or suggested: each is the
 * visitor's own assumption. No currency is assumed, no country's tax rules are
 * described, no product or firm is named, and nothing here says what anyone
 * should do with their money.
 */

export type MoneySlug = "regular-investing" | "retirement" | "loan-emi" | "inflation" | "goal-planner" | "tax-drag" | "rule-of-72";

export type MoneyCalc = {
  slug: MoneySlug;
  /** short name, for cards, crumbs and menus */
  name: string;
  /** the page's h1 and search title */
  title: string;
  description: string;
  /** the hero's lead: what the page works out */
  lead: string;
  /** one line for the index card */
  card: string;
  also: readonly string[];
  /** the formula lines, shown by the calculator above its working */
  formula: readonly string[];
  /** what each letter stands for */
  symbols: readonly string[];
  explain: readonly string[];
  /** what the sum leaves out, and where people go wrong */
  limits: readonly string[];
  faq: readonly { q: string; a: string }[];
  related: readonly [MoneySlug, MoneySlug];
};

/** Said on every page, in the page's own HTML. */
export const MONEY_ASSUMPTION =
  "Every growth, inflation or tax rate on this page is an assumption that you enter. The figure a box opens with is an example to be replaced, not a suggestion. An assumed rate is not a forecast: real returns vary from year to year and can be negative, prices do not rise at a steady pace, and tax rules differ between countries and change.";

export const MONEY: readonly MoneyCalc[] = [
  {
    slug: "regular-investing",
    name: "Regular investing",
    title: "Regular investing calculator: a fixed amount every month",
    description:
      "A regular investing (SIP) calculator. Enter a monthly amount, a number of years and your own assumed rate, and see what was paid in and what the rate added, year by year, with the formula and the working shown. An assumed rate is not a forecast.",
    lead: "A fixed amount paid in every month, often called a SIP. Enter the amount, the years and a rate of your own choosing, and see how much of the result is money paid in and how much is the rate.",
    card: "A fixed amount every month: what is paid in, and what an assumed rate adds.",
    also: ["SIP calculator", "systematic investment plan", "monthly savings plan", "future value of regular payments"],
    formula: ["FV = P × ((1 + i)^n − 1) ÷ i", "Paid at the start of each month: × (1 + i)", "A sum already held adds L × (1 + i)^n"],
    symbols: ["FV is the value at the end.", "P is the amount paid in each month.", "i is the monthly rate: the yearly rate you assume, divided by 12.", "n is the number of monthly payments.", "L is any sum already held at the start."],
    explain: [
      "Paying a fixed amount into an investment every month is called regular investing. In India and some other countries it is known as a systematic investment plan, or SIP; elsewhere it is a monthly savings plan.",
      "The arithmetic treats each payment as a separate sum that compounds from the day it is paid until the end. The first payment compounds for the longest and the last for the shortest, which is why the growth in the chart is thin in the early years and thicker in the later ones.",
      "The formula needs one rate, and the same rate every month. No investment behaves like that. Real values rise and fall, sometimes sharply, and the order in which good and bad years arrive changes the result even when the average is the same. The calculator shows what a steady rate would do, so that the effect of time and of the amount can be seen. It does not show what will happen.",
    ],
    limits: [
      "Charges are left out. A yearly charge works much like a lower rate: entering the rate less the charge shows its effect.",
      "Tax is left out. The tax drag calculator shows what a tax on growth does over time.",
      "Rising prices are left out. A sum twenty years from now buys less than the same sum today; the inflation calculator shows how much less.",
      "A single rate hides the swings. A plan that averages a given rate can still be worth less than was paid in, for years at a time.",
      "Buying at regular intervals spreads purchases over time. It does not remove the risk of loss.",
    ],
    faq: [
      { q: "What is a SIP?", a: "A systematic investment plan: an instruction to pay a fixed amount into an investment at regular intervals, usually monthly. The term is common in India. The arithmetic is the same as for any regular payment that compounds." },
      { q: "Which rate do I enter in a regular investing calculator?", a: "That is your own assumption, and the calculator cannot supply it. No rate is known in advance. Entering several, including zero and a negative one, shows how much of the result depends on the assumption." },
      { q: "Why does a real statement differ from the calculator?", a: "A real investment does not grow at one steady rate, payments fall on different days, and charges and taxes are taken. The calculator uses one rate, twelve equal months and no deductions." },
    ],
    related: ["goal-planner", "tax-drag"],
  },
  {
    slug: "retirement",
    name: "Retirement",
    title: "Retirement calculator: the sum needed and the monthly saving",
    description:
      "A retirement calculator that works backwards from spending: the monthly cost in today’s money, raised by your assumed inflation, the sum that would pay it for the years you choose, and the monthly saving that would build it. Every step and formula is shown.",
    lead: "Work backwards from what a month is to cost. The calculator raises it by the rise in prices you assume, finds the sum that would pay it for the years you choose, and then the monthly saving that would build that sum.",
    card: "From monthly spending to the sum needed, and the saving that would build it.",
    also: ["pension calculator", "retirement savings calculator", "how much do I need to retire", "retirement corpus"],
    formula: ["Spending then = S × (1 + π)^n", "Sum needed = W × (1 − q^m) ÷ (1 − q), where q = (1 + π) ÷ (1 + g₂)", "Saving = (Sum − L × (1 + g₁)^n) × g₁ ÷ ((1 + g₁)^n − 1)"],
    symbols: [
      "S is the monthly spending wanted, in today’s money.",
      "π is the monthly rise in prices: the yearly rise you assume, divided by 12.",
      "n is the number of months until retirement, and m the number of months in it.",
      "W is the first month’s spending in retirement: the result of the first line.",
      "g₁ and g₂ are the monthly growth you assume before and during retirement: each yearly rate divided by 12.",
      "L is the sum already saved.",
    ],
    explain: [
      "A retirement sum can be worked out backwards. Start with what a month is to cost. Raise it by the rise in prices assumed between now and retirement. Find the sum that would pay that amount, still rising, for the chosen number of years. Then find the monthly saving that would build that sum.",
      "The calculator does those steps in that order and shows each. The chart is the whole plan on one line: the sum building up to the day of retirement, and then being spent until, in the last month, nothing is left.",
      "Every step rests on a number nobody knows: how fast prices will rise, how investments will do before and after retirement, and how long retirement will last. Small changes to any of them move the answer a long way. Lowering a growth rate by one point, or adding five years of retirement, shows how far.",
    ],
    limits: [
      "The plan ends with nothing. A retirement that lasts longer than the years entered runs out of money.",
      "A state pension, an employer’s pension and any other income are left out. Where there is one, the spending to enter is the part it does not cover.",
      "Tax and charges are left out, on the way in and on the way out.",
      "One steady rate hides the order of returns. A fall early in retirement, when the sum is at its largest and is being drawn on, does more harm than the same fall later.",
      "The saving is level. Saving less early and more later gives a different figure.",
    ],
    faq: [
      { q: "How much money is needed to retire?", a: "There is no single figure. It depends on what will be spent, how long retirement lasts, how prices rise and how the money grows, and none of those is known in advance. The calculator turns your own assumptions about each into a sum, and shows how the sum moves when an assumption changes." },
      { q: "Why does inflation matter so much in a retirement sum?", a: "Because retirement is far away and long. At a steady 3% a year, compounded yearly, prices double in about 23 and a half years, and they go on rising through retirement. Spending is entered in today’s money so that the calculator can raise it." },
      { q: "Is a retirement calculator financial advice?", a: "No. It is arithmetic on figures you supply. It knows nothing about your circumstances, your tax position or the pension rules where you live." },
    ],
    related: ["inflation", "regular-investing"],
  },
  {
    slug: "loan-emi",
    name: "Loan EMI",
    title: "Loan EMI calculator with an amortisation table",
    description:
      "A loan EMI calculator: the level monthly payment for an amount, a rate and a term, the total repaid, the total interest, and the full amortisation table showing how each payment divides into interest and principal. The formula and the working are shown.",
    lead: "The level monthly payment that clears a loan, and what each payment is made of. Enter the amount, the yearly rate and the term; the table lists every payment, split into interest and the part that comes off the loan.",
    card: "The monthly payment on a loan, and how each one divides into interest and principal.",
    also: ["EMI calculator", "loan repayment calculator", "amortisation schedule", "equated monthly instalment"],
    formula: ["M = L × i × (1 + i)^n ÷ ((1 + i)^n − 1)", "Each month: interest = balance × i, and M − interest comes off the loan"],
    symbols: ["M is the monthly payment (the EMI).", "L is the amount borrowed.", "i is the monthly rate: the yearly rate divided by 12.", "n is the number of monthly payments."],
    explain: [
      "An EMI is an equated monthly instalment: the level payment that clears a loan, with its interest, in a set number of months. The term is used widely in South Asia; elsewhere the same thing is simply the monthly repayment.",
      "The payment stays the same but what it is made of changes. Each month interest is charged on what is still owed, and the rest of the payment reduces the loan. Early on most of a payment is interest, because the balance is large. As the balance falls the interest falls with it, and more of each payment comes off the loan. The list of every payment divided this way is the amortisation table.",
      "This is why, at the same rate, a longer term lowers the monthly payment and raises the total cost: the balance stays higher for longer, so more interest is charged on it.",
    ],
    limits: [
      "A fixed rate is assumed for the whole term. With a variable rate the payment or the term changes when the rate does.",
      "Fees, insurance and any charge for repaying early are left out. A loan offer states its own costs.",
      "Interest is taken monthly at one twelfth of the yearly rate. Some lenders work it out daily or by another convention, and their figures differ a little.",
      "Nothing is rounded. A lender rounds each payment to the smallest unit of the currency and adjusts the last one.",
    ],
    faq: [
      { q: "What does EMI stand for?", a: "Equated monthly instalment: a fixed payment made every month that covers the month’s interest and repays part of the loan, so that the loan is cleared by the last payment." },
      { q: "Why is so much of an early loan payment interest?", a: "Interest is charged on the balance still owed, and at the start that is the whole loan. On 100,000 at 12% a year over twelve months the payment is 8,884.88 and the first month’s interest is 1,000. By the last month the interest is under 88." },
      { q: "Does a longer loan term cost more in total?", a: "At the same rate, yes. The monthly payment is lower, but there are more payments and the balance falls more slowly, so the total interest is higher. The calculator shows both figures side by side." },
    ],
    related: ["rule-of-72", "inflation"],
  },
  {
    slug: "inflation",
    name: "Inflation",
    title: "Inflation calculator: what money will buy in future",
    description:
      "An inflation calculator for the years ahead. Enter a sum, a number of years and the rise in prices you assume, and see what the same things would cost and what the sum would buy, year by year, with the formula shown. The rate is your assumption, not a forecast.",
    lead: "What rising prices do to a sum of money. Enter a sum, a number of years and the yearly rise in prices you assume, and see what the same things would cost then and what the sum would still buy.",
    card: "What a sum of money buys after years of rising prices.",
    also: ["purchasing power calculator", "future cost calculator", "value of money over time", "real value"],
    formula: ["Cost then = A × (1 + π)^t", "Buying power = A ÷ (1 + π)^t"],
    symbols: ["A is a sum of money today.", "π is the yearly rise in prices you assume, as a decimal (3% is 0.03).", "t is the number of years."],
    explain: [
      "Inflation is a general rise in prices. When prices rise, a fixed sum of money buys less than it did. The two formulas are the two sides of that: what today’s things will cost later, and what today’s sum will be able to buy later.",
      "Because the rise compounds, its effect grows with time faster than intuition suggests. At a steady 3% a year a sum loses about a quarter of what it buys in ten years and about 45% in twenty.",
      "Official inflation figures are averages over a fixed basket of goods and services, published by national statistics offices. One household’s prices can rise faster or slower than the average, and past figures say nothing certain about future ones. The rate here is yours to choose.",
    ],
    limits: [
      "One rate is used for every year. Real inflation changes from year to year, and prices have at times fallen.",
      "Wages and interest are left out. They may rise too, or may not.",
      "It cannot look up past inflation. That needs a published price index, and this page holds no data.",
    ],
    faq: [
      { q: "What is purchasing power?", a: "What a sum of money can buy. If prices rise and the sum stays the same, its purchasing power falls, even though the number printed on it has not changed." },
      { q: "How is inflation worked out by hand?", a: "Multiply by one plus the rate for each year. At 3%, something costing 100 costs 103 after one year and 100 × 1.03 × 1.03 = 106.09 after two. For many years, raise 1.03 to the power of the number of years." },
      { q: "What is a real return?", a: "Growth after inflation. If a sum grows 5% in a year in which prices rise 3%, it buys about 1.94% more, not 5% more: 1.05 ÷ 1.03 − 1." },
    ],
    related: ["rule-of-72", "retirement"],
  },
  {
    slug: "goal-planner",
    name: "Goal planner",
    title: "Savings goal calculator: how much to put aside each month",
    description:
      "A savings goal calculator. Enter a target, a number of years, anything already held and your own assumed rate, and see the monthly amount that would reach it, how much of the target is money paid in, and the figure with no growth at all. Formula and working shown.",
    lead: "The monthly amount that reaches a chosen figure by a chosen date. Enter the target, the years, anything already held and a rate of your own choosing; the figure with no growth at all is shown beside it.",
    card: "A target and a date: the monthly amount that would reach it.",
    also: ["savings goal calculator", "target savings calculator", "how much to save each month", "sinking fund"],
    formula: ["P = (T − L × (1 + i)^n) × i ÷ ((1 + i)^n − 1)", "With no growth: P = (T − L) ÷ n", "A target raised by prices: T = today’s target × (1 + π)^years"],
    symbols: ["P is the amount to put aside each month.", "T is the target.", "L is any sum already held.", "i is the monthly rate: the yearly rate you assume, divided by 12.", "n is the number of months.", "π is the yearly rise in prices you assume, if any."],
    explain: [
      "A goal planner turns the regular investing sum around. Instead of asking what a monthly amount grows to, it asks what monthly amount reaches a chosen figure by a chosen date.",
      "Two things do the work: the money paid in, and any growth on it. The shorter the time, the more of the target has to come from the money paid in, because growth has had little time to compound. The calculator also gives the figure with no growth at all: the target less what is held, divided by the number of months. That figure rests on no assumption.",
      "If the goal is something whose price is expected to rise, the target can be raised by an assumed rise in prices, so that the plan aims at what the thing may cost then and not what it costs now.",
    ],
    limits: [
      "Growth is not certain and can be negative. A plan that depends on growth can arrive short, and money needed on a fixed date is exposed to a fall just before that date.",
      "The monthly amount is level and paid at the end of each month.",
      "Tax and charges are left out.",
      "The answer is only as good as the target. A cost that is guessed is still a guess after the arithmetic.",
    ],
    faq: [
      { q: "How much has to be saved each month to reach a goal?", a: "With no growth: the target, less what is already held, divided by the number of months. With growth, less than that, by an amount that depends on the rate and the time. The calculator shows both." },
      { q: "Does growth make much difference over a short time?", a: "Not much. Over two or three years most of a target comes from the money paid in, and a fall in value near the end can outweigh the growth that was hoped for. Over twenty years the assumed rate dominates, which is also why a long plan is so sensitive to it." },
      { q: "What if the assumed rate turns out wrong?", a: "Then the plan arrives above or below the target. Entering a lower rate, zero or a negative one shows how far below, and what monthly amount that rate would have needed." },
    ],
    related: ["regular-investing", "inflation"],
  },
  {
    slug: "tax-drag",
    name: "Tax drag",
    title: "Tax drag calculator: what a yearly tax on growth costs over time",
    description:
      "A tax drag calculator. Enter a sum, your own assumed growth, your own tax rate and a number of years, and compare three cases: no tax, tax on each year’s growth, and tax once at the end. No country’s tax rates are used. Formula and working shown.",
    lead: "The growth lost because tax is taken along the way. Enter a sum, a rate of growth you assume and your own tax rate, and compare no tax, tax each year and tax once at the end.",
    card: "The same sum with no tax, tax each year and tax at the end, at your own rate.",
    also: ["tax drag", "after-tax return calculator", "tax deferral", "effect of tax on compounding"],
    formula: ["No tax: FV = A × (1 + r)^t", "Taxed every year: A × (1 + r × (1 − τ))^t", "Taxed once at the end: FV − τ × (FV − A)"],
    symbols: ["A is the sum at the start.", "r is the yearly growth you assume, as a decimal.", "τ is your tax rate on growth, as a decimal.", "t is the number of years.", "FV is the value with no tax."],
    explain: [
      "Tax drag is the growth lost because tax is taken along the way. When part of each year’s growth is paid in tax, that part is no longer there to grow in the years that follow. The loss is the tax itself and everything the tax would have earned.",
      "The calculator compares three cases for the same sum, the same rate and the same years: no tax at all; tax taken from each year’s growth; and tax taken once, at the end, on the whole gain. At the same tax rate the third never leaves less than the second, because the money stays invested until the end. The gap between them is the effect of timing alone.",
      "It uses one tax rate, which you enter. It holds no country’s rates, bands or allowances, and it cannot say what anyone owes.",
    ],
    limits: [
      "Real systems tax interest, dividends and gains differently, give allowances, and may offer accounts on which tax is not charged or is charged later. None of that is modelled.",
      "A loss is not relieved. When growth is zero or negative, no tax is taken and none is given back.",
      "One steady rate of growth is used. Real growth varies and can be negative.",
      "A charge taken every year drags in the same way as a yearly tax: it is money that stops compounding.",
    ],
    faq: [
      { q: "What is tax drag?", a: "The reduction in growth caused by tax being taken as the growth arises, instead of at the end or not at all. It is larger the higher the tax rate, the higher the growth and the longer the time." },
      { q: "Why is tax at the end different from tax each year, at the same rate?", a: "Because of compounding. Money paid in tax early cannot grow afterwards. When the tax is taken only at the end, the whole sum compounds for the whole time; the tax is then a share of a larger gain, and what is left is still more." },
      { q: "Which tax rate goes into a tax drag calculator?", a: "Your own: the rate that applies to growth of the kind you have in mind, under the rules where you live. Those rules are published by your tax authority. This page does not hold them." },
    ],
    related: ["regular-investing", "rule-of-72"],
  },
  {
    slug: "rule-of-72",
    name: "Rule of 72",
    title: "Rule of 72 calculator: how long money takes to double",
    description:
      "A rule of 72 calculator. Enter a yearly rate and see the years to double by the rule and exactly, side by side, or enter the years and see the rate. At 6% the rule says 12 years and the exact figure is 11.90. With the formula, the working and a table of both.",
    lead: "A piece of mental arithmetic: divide 72 by a yearly rate and the answer is roughly the years a sum takes to double. Enter a rate and see the rule beside the exact figure.",
    card: "Years to double at a steady rate: the rule beside the exact figure.",
    also: ["doubling time calculator", "rule of 70", "rule of 69", "how long to double money"],
    formula: ["Rule of 72: years ≈ 72 ÷ r, with r as a percentage", "Exact: years = ln 2 ÷ ln(1 + r), with r as a decimal", "Rate that doubles in t years: 2^(1 ÷ t) − 1"],
    symbols: ["r is the yearly rate you assume.", "t is a number of years.", "ln is the natural logarithm; ln 2 is about 0.6931."],
    explain: [
      "The rule of 72 is a piece of mental arithmetic. Divide 72 by a yearly rate of growth, as a percentage, and the answer is roughly the number of years a sum takes to double at that rate. At 6% it gives 12 years; the exact figure is 11.90.",
      "It works because the exact answer, ln 2 ÷ ln(1 + r), is close to 69.3 divided by the percentage when the rate is small, and a little more than that as the rate rises. 72 is near the right number for everyday rates and divides evenly by 2, 3, 4, 6, 8, 9 and 12, which makes it easy to use in the head. The rule is closest at about 8%. Below that it gives a slightly long time and above it a slightly short one.",
      "The rule is old: it appears in Luca Pacioli’s Summa de arithmetica of 1494, stated without a proof.",
      "It describes anything that compounds. A debt on which interest is left unpaid, and prices under steady inflation, double on the same timetable.",
    ],
    limits: [
      "The same rate is assumed every year, compounded once a year. No investment grows like that.",
      "At high rates the rule drifts. At 36% it says 2 years and the exact figure is 2.25.",
      "A doubling time describes a rate. It is not a promise that anything will double.",
    ],
    faq: [
      { q: "Why 72 and not 69 or 70?", a: "For continuous compounding the exact number is about 69.3, and 70 is sometimes used. With compounding once a year the best number rises with the rate, and 72 fits rates near 8%. It also has many divisors, which is the practical reason it is the one remembered." },
      { q: "How accurate is the rule of 72?", a: "Within about a tenth of a year for rates between 6% and 11%. Outside that it drifts: at 2% it says 36 years against an exact 35.00, and at 20% it says 3.6 against 3.80." },
      { q: "Does the rule of 72 work for inflation?", a: "Yes, for a steady rise in prices. At 3% a year prices double, and a fixed sum loses half of what it buys, in roughly 72 ÷ 3 = 24 years. The exact figure is 23.45." },
    ],
    related: ["inflation", "loan-emi"],
  },
];

export const getMoney = (slug: string) => MONEY.find((m) => m.slug === slug);
