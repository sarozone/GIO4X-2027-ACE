# Next steps: what can be added, and what each thing needs

Written on 5 October 2026 at the owner's request ("list out"). Nothing on this page is built unless it
says so. Each item says what it needs from the owner, so that supplying it is the only thing in the way.
Open decisions about facts (entity, regulator, documents, MT5 servers) stay in `docs/WAITING-FOR-ABE.md`.

## 1. Sign-in, sign-up and the contact form: state on 5 October 2026

| Thing | State | What is still needed |
|---|---|---|
| Contact form (`/contact`) and account-interest form (`/open-account`) | **Working.** Tested on 5 October: an enquiry is validated, stored and shown in GIO4X Control with its reference. | Nothing to store them. To also receive each one **by e-mail at info@gio4x.com**, see the next row. |
| A copy of every enquiry and support request to **info@gio4x.com** | **Built, switched off until e-mail is set up.** The site sends through Resend (`src/lib/server/mailer.ts`, `notifyInbox`); the sender is the reply-to, so answering the e-mail answers the person. | 1. A Resend account (resend.com). 2. Add the domain `gio4x.com` there and put the three DNS records it shows (SPF, DKIM, and a DMARC record) at the domain's DNS host. 3. In Netlify, site `gio4x-2027-ace`, Environment variables: `RESEND_API_KEY` (secret), `RESEND_FROM_EMAIL` (for example `website@gio4x.com`), optional `RESEND_FROM_NAME`. 4. Confirm the mailbox `info@gio4x.com` exists and is read. To send the copies somewhere else, set `CONTACT_INBOX`. |
| Client sign-in and sign-up (`/sign-in`, `/open-account` lead to `/portal/auth/login` and `/portal/auth/signup`) | **Pages load** on the live site. A real sign-up was not made: it creates a real client record and sends a confirmation e-mail. | 1. In the portal's Supabase project (Authentication, URL configuration) add `https://gio4x-2027-ace.netlify.app/portal/auth/callback`, and later the same on the real domain. 2. Custom SMTP in that Supabase project (the same Resend domain works), or confirmation e-mails come from Supabase's shared sender with a low hourly limit. 3. Decide when `AUTH_ENFORCE` is switched on in the portal's Netlify site: today the portal is open as a demonstration. 4. One test sign-up by the owner, start to finish. |
| GIO4X Control sign-in (`/control/sign-in`) | **Working.** `aby777333@gmail.com` is an administrator. | For `abe@gio4x.com` and `info@gio4x.com`: create each in Supabase (project `wcdhqykhvnlxozayeolt`, Authentication, Users, Add user, with a password of your own, e-mail confirmed), then say so and the one-line grant in `docs/CONTROL.md` is run for each. A password cannot be set for you. A shared mailbox as an administrator is weaker than a named person: consider `manager` for `info@`. |

## 2. Related pages and topics that could be added

Grouped by what stands in the way. "Ready" means it needs nothing from the owner but a yes.

### Ready to build (general education, no GIO4X fact needed)

| Page | What it would be |
|---|---|
| Commodities: how they trade | Futures, spot and CFDs on a raw material; contango and backwardation; rollover; seasons. Companion to the new A to Z. |
| Bonds and interest rates | Yields, prices, the yield curve, why currencies follow them. The site has central banks but no page on bonds. |
| ETFs and funds explained | What a fund is, costs, tracking, how it differs from a CFD on an index. |
| Trading psychology | Biases, tilt, routines, the journal as a tool. Links to the Mind Room and the journal. |
| Order types, in depth | Market, limit, stop, stop-limit, trailing, OCO, partial fills, slippage, gaps. Extends Order anatomy. |
| Tax and record keeping, by principle | What records to keep and what questions to ask an adviser. No country's rules stated. |
| Technical indicators library | One page per indicator (moving averages, RSI, MACD, Bollinger, ATR, Ichimoku): what it measures, how it is calculated, where it misleads. |
| Fundamental analysis for currencies | Balance of payments, rate differentials, terms of trade, purchasing power. |
| Market microstructure | Who is on the other side, liquidity providers, ECN and market-maker models, last look. |
| Algorithmic trading primer | What an Expert Adviser is, backtest pitfalls, overfitting, VPS. Links to the Rule bench. |
| Currency profiles | One page per major currency: who issues it, what moves it, its nicknames. |
| Country and economy profiles | The economies behind the major currencies: structure, main releases, central bank. |
| Trading plan builder | A form that produces a printable plan (rules, risk per trade, routine). Stored in the browser only. |
| More calculators | Risk of ruin, expectancy, correlation, lot-size converter, break-even, compounding with withdrawals. |
| Quiz of the day and a learning streak | Uses the existing exam pools; kept in the browser. |
| Glossary in the seven new languages | The structured part of the site, and the best value per translated word. Needs a reviewer per language. |
| Islamic finance primer | Riba, swap-free accounts and what they are not. Supports `/trading/swap-free`. |
| Women in markets, and a history of the trading floor | Editorial features for the Morning Room and the history section. |
| Sitemap for people | A plain page listing every address by section (the XML sitemaps exist; `/a-z` is by letter). |

### Needs a fact or a decision from the owner

| Page | Needs |
|---|---|
| "What can I trade?" finder by country, platform and account | A3 (done: no UK or US), A6 (MT5 availability) |
| MetaTrader 5 and 777 Raptor download and set-up guides | A6, B6: servers and download links |
| Deposit and withdrawal methods, fees and times | D5 |
| Complaints procedure, execution policy, client-money page | A1, A2, A8 and legal review |
| Leadership, offices, careers with real openings | C4, C5, C6 |
| Promotions and loyalty | A decision that there are any, and their terms, reviewed |
| IB and affiliate programme detail, with a commission calculator | D8 |
| Copy trading and PAMM: provider directory | D7, and real providers |
| Press kit and brand assets | Approved logo files and a boilerplate paragraph |
| Regional landing pages (India, Gulf, Latin America, Africa) | A decision on where GIO4X may market, per country |

### Needs a paid service

| Page | Needs |
|---|---|
| Live quotes, economic calendar with actual figures, holiday calendar, central-bank rate table | F2: a licensed market-data provider |
| Daily and weekly market briefing | A named writer and reviewer, and F2 |
| Webinars and events | A webinar platform and a presenter |
| Video lessons | Recorded material, and hosting (YouTube or a paid host) |

## 3. Community: comments, forum, trader stories

Three sizes, smallest first. None is built.

| Option | What it is | Needs |
|---|---|---|
| A. Published trader stories | Visitors send a story through a form; staff approve, edit and publish it in Control. The pattern already exists for reader riddles and trader files. | A named moderator; a one-page submission policy (no advice, no results claims, right to edit); consent wording; a decision on whether first names are shown. About a day to build. |
| B. Comments on articles and lessons | Signed-in readers comment; everything is held for approval before it shows. | Everything in A, plus: reader accounts (e-mail link sign-in through Supabase, so Supabase SMTP from section 1), house rules, a report button and who answers reports, how long comments are kept, and an answer to "may clients discuss trades in public?" from whoever advises on compliance. Two to three days. |
| C. A forum | Boards, threads, profiles, reputation. | Everything in B, plus daily moderation by a person, a spam service, and a legal view on financial-promotion rules for user posts. A hosted forum (Discourse) on `community.gio4x.com` is usually cheaper and safer than building one. |

Recommendation: A now, B when there is a moderator, C only with a community manager.

## 4. GIO4X AI assistant

Designed for and deliberately not live (`/trust/ai`). To switch it on:

| Need | Detail |
|---|---|
| A provider key | An Anthropic API key in Netlify as `ANTHROPIC_API_KEY` (secret). `GIO4X_AI_MODEL` chooses the model. A monthly spending limit set at the provider. |
| Approved sources | Confirmation that the assistant may answer **only** from this site's own pages (glossary, Academy, tools, FAQs, legal documents), which is how it would be built. Anything else it may use must be listed. |
| Rules of the house, approved | No advice, no signals, no price forecasts, no account actions; every answer cites the pages it used; it says when it does not know. The draft is on `/trust/ai`: approve or amend it. |
| A decision on records | Whether questions are stored (to improve answers) or not stored at all; if stored, for how long, and a line in the Privacy Policy. |
| A named owner | Someone who reads a weekly sample of answers and can switch it off (a flag in Control). |
| Limits | Questions per visitor per day, and the languages it answers in. |
| A wrong-answer route | A "this is wrong" button that opens a ticket. |

With those, about two days: the Lens panel already has the place for it.

## 5. Newsletter and e-mail courses

The sign-up form and the subscriber list exist (stored with consent and its version; visible in Control).
Nothing is sent, because there is no sending domain.

| Need | Detail |
|---|---|
| The sending domain | The same Resend set-up as section 1 (SPF, DKIM, DMARC on `gio4x.com`). Ideally a sub-domain such as `news.gio4x.com`, so that newsletters cannot hurt the delivery of account e-mails. |
| Double opt-in | A confirmation e-mail before anyone is on the list. Needs the domain; half a day to build. |
| Unsubscribe | A one-click link in every message and the `List-Unsubscribe` header. Half a day. |
| A postal address in the footer of each message | Required by anti-spam law in several countries. Which address: Ruislip or Chennai? |
| A sender name and reply address | For example "GIO4X Morning Room" and `info@gio4x.com`. |
| An editor and a rhythm | Who writes, who approves, how often. A newsletter with no editor should not be offered. |
| For e-mail courses | Which course first (suggestion: "Your first trade", seven short lessons drawn from the Academy), and approval of each message. A day to build the scheduler once the domain works. |
| Compliance wording | The risk warning and the "not advice" line on every message, approved. |

## 6. Languages

Hindi, Tamil, Arabic, Spanish, Portuguese, French and German were added on 5 October 2026: see
`docs/I18N.md` for exactly what is translated and what is not. Still needed: a named reviewer per
language, a decision on translated legal pages, and someone who can answer enquiries in each language.
