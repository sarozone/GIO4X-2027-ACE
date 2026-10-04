# Phase 2: add only what is missing

The register for the brief of 4 October 2026 ("add only what is missing; do not rebuild or duplicate"). Each
row names the existing thing that was extended, the gap, what closed it, how it was checked, and what it
still depends on. Nothing in this phase states a GIO4X fee, licence, server, payment method, leverage option
or processing time that the owner has not supplied: those stay "not yet published" and are listed in the
last section and in `docs/WAITING-FOR-ABE.md`.

## Completion register

| Gap | Implementation | Evidence | Verification | Unresolved dependency |
|---|---|---|---|---|
| The link checker called this site's own portal address "not recognised" while the Verify page listed it as connected | One registry (`src/config/destinations.ts`): a `PREVIEW` verdict for the one exact host the site is served from while that host is not on gio4x.com. The Verify page labels such a portal "Connected on this preview" and says that connected means only that the link works | `verifyDestination`, `siteHost`, `isPreviewDestination`; `LinkChecker.tsx`; `/trust/verify` | Typecheck; no other host on the hosting provider is recognised | The production domain, and a security review of the portal, before anything is called official (`WAITING-FOR-ABE` B5, F1) |
| The Academy said it issues no certificates while two of its pages print one | Wording corrected on the Academy page, its metadata and the data file's header: a printable record that the questions were answered, not a qualification, licence or evidence of trading ability. Certificates, exams and milestones kept | `src/app/(site)/academy/page.tsx`, `src/data/academy.ts` | Counts on the page are computed from the data | None |
| Three Academy modules were outlines with no lessons | Five new lessons (two on crypto, two on automated trading, one on testing a set of rules) and a "Covered elsewhere on this site" list on each such module, linking the strategy library, comparisons, Rule bench, Risk Room, journal and glossary | `src/data/academy-added/`, `AcademyModule.elsewhere` | Exam pools rebuilt from the data (Intermediate 18 questions, Advanced 21); typecheck | None |
| The Playbook linked to a lesson address that does not exist | Link corrected (previous deploy); the obsolete address now redirects | `src/config/redirects.json`: `/academy/candlestick-patterns` to `/academy/candlestick-patterns-masterclass` | Link crawl | None |
| Articles and lessons made claims beyond the site's own standard (ECN "direct interbank access", universal 1 to 2% and 1:2 rules, a fixed correlation threshold, Fibonacci and pattern "reliability") | 76 passages in 8 articles and 10 lessons qualified, each dated; stored as data so a re-import reproduces them | `scripts/editorial-fixes.json`, `scripts/apply-editorial-fixes.mjs`, the dated section of `docs/CONTENT-AUDIT.md` | Restored the originals, re-imported, compared byte for byte | **The ECN commission basis (per side or round trip).** `costExamples()` in `src/data/trading.ts` still shows a total that counts it once, with a caption saying so. The owner must settle it |
| Instrument pages shared one short structure | Research written for all 34 instruments: what moves each, how it is quoted and built, the market against a contract on its price, events in the contract's life, what is scheduled, primary sources by name | `src/data/instrument-depth/`, `src/components/markets/InstrumentDepth.tsx` | Typecheck; 34 of 34 entries present | Dated, maintained data (policy settings, release outcomes) needs a licensed source (`WAITING-FOR-ABE` F2). GIO4X's own treatment of rollover, dividends and suspensions is not yet published |
| Corporate actions and contract lifecycle not explained | A `lifecycle` block on index, energy, share and crypto pages, as general education, with a line that GIO4X's own treatment is not yet published | same files | same | GIO4X's contract terms |
| No route from an instrument to what a trade in it costs | Each instrument page ends with a link to the Cost Lab and says which inputs are unpublished | `InstrumentDepth.tsx` | Typecheck | Commission basis and swap rates |
| Position Size left out costs with no way to add them | An optional, closed-by-default "Include trading costs" section with the working shown; the simple mode and its formula untouched | `src/components/tools/PositionSize.tsx` | `scripts/test-simulator.mjs`: 166 passed before and after | The Cost Lab hand-off carries the size only; carrying the cost figures needs a change to the shared store |
| On a phone a tool's illustration filled the first screen | "Jump to the calculator" in every tool's hero; "Result" and "Back to inputs" links below the desktop width | `src/app/(site)/tools/[slug]/page.tsx`, `src/components/tools/ui.tsx` | Typecheck | Not seen on a phone |
| The Risk Room's portfolio model was two to four equal holdings | A sixth machine, "Building a portfolio": weights, contributions and withdrawals, rebalancing with a cost, a currency holding, a stress stretch, and the same exposure with borrowed money | `src/components/labs/risk/Portfolio.tsx`, new functions in `math.ts` | Hand-worked cases for weights, contributions, leverage and costs | A historical-data mode needs data rights |
| History pages named sources only by kind, and had no exercise | Named documents (title, issuer, date) on all eleven episodes; a "What was knowable then?" exercise with no score | `src/data/history.ts`, `src/components/history/Decision.tsx` | Typecheck | The documents were named from memory and are marked where a title is descriptive; cited historical price series need a licensed source |
| No study of how professional investors work | Five case studies under Investing, each with primary sources by title, a worked example, a failure, what does not scale down, and an exercise on an existing tool; and a section on what public holdings disclosures do not show | `/investing/case-studies` | See the builder's report | A fact check by a person before promotion |
| No help for "why was this order rejected?" | A searchable page of MetaTrader 5's published trade return codes, in plain words, each linked to the tool or term that explains it | `/platforms/metatrader-5/order-errors`, `src/data/mt5-codes.ts` | 41 codes; the wording of 10039 to 10046 should be compared with MetaQuotes' reference | GIO4X's own server settings and 777 Raptor's messages are not published |
| The learning tools did not hand on to each other | "A path through it" on My desk: eight steps across existing pages, ticked from what the browser already holds; no new storage | `src/components/desk/Journey.tsx`, `src/data/journey.ts` | Typecheck | None |
| No compact starting points for different visitors | Five starting routes at the top of Explore, each linking existing pages | `src/app/(site)/explore/page.tsx` | Link crawl | None |
| What's New mixed everything | Entries carry a kind and a date and can be filtered; kinds with no entries say so and where such notices will come from | `src/app/(site)/whats-new/page.tsx` | Typecheck | Platform, document and service entries need real events to report |
| The phone menu was one long list | Each group of a section opens on its own; the first is open | `src/components/shell/SiteHeader.tsx` | Typecheck | Not seen on a phone |
| Two platforms, one wallet: no way to see how funds would be divided | A tested allocation engine and a labelled demonstration at `/trading/funding/allocation`: one platform, equal, percentage and exact-amount splits, a wallet remainder, minimum checks, pending funds, partial failure and repeat protection | `src/components/funding/`, `scripts/test-allocation.mjs` | See the builder's report | **Everything real.** The client portal (`portal/`) was not changed: see below |

## The client portal was deliberately not changed

The dual-platform journey in the brief (platform choice at account opening, per-account leverage, a funding
wallet, allocation, transfers, withdrawals, a combined dashboard) belongs in the client portal, which is a
separate application in `portal/` with its own database of wallets, transfers and trading accounts and its
own rule to stop and ask before changing money logic. It was left untouched in this phase, because:

- GIO4X has not published the facts the journey must enforce: permitted leverage values, account types and
  base currencies on each platform, minimum funding, fees and conversion, processing times.
- Account provisioning on MetaTrader 5 and 777 Raptor, payment processing and platform balances are not
  connected or verified.
- A mistake there moves real money.

What exists instead is the allocation logic, proved by tests, and a demonstration on the public site that
says on every screen that it opens no account and moves no money. When the facts and integrations are
ready, the engine in `src/components/funding/allocation.ts` is written to be lifted into the portal as it is.

## Not built in this phase, and why

| From the brief | Why not | What unblocks it |
|---|---|---|
| Accounts, conditions, funding, copy trading, PAMM, partners: verified detail | Company records not supplied | `WAITING-FOR-ABE` sections A and D |
| Trust and legal: entity, authorisation, execution policy, client-money arrangements, approved documents | Not supplied; legal review outstanding | A1, A2, A8 |
| MetaTrader 5 and Raptor onboarding: servers, downloads, availability, screenshots from the right environment | Not supplied | A6, B6, G1 to G4 |
| "What can I actually trade?" finder by country, platform and account | Needs verified availability | A3, A6 |
| Central Bank Watch and Economic Events: dated, maintained figures; Market Clock holidays | Needs a reliable source and an update process | F2 |
| Rule bench and history on real historical data | Needs data rights | F2 |
| A maintained research desk with dated briefings | Needs people to write and review it | Owner's decision |
| A conversational assistant in Lens | Optional in the brief; needs a provider key and approved sources | F4 |
| Support hours, response times, complaint process; e-mail acknowledgements | Not supplied; no sending domain | C2, F5 |
| Measured service status and incident history | Needs real monitoring | Owner's decision |
| An evidence drawer in Lens for every claim | The history pages now carry named documents; a site-wide drawer needs each claim's source recorded first | Editorial work |

## Search engines

The production policy already existed and was checked, not changed: pages are indexable only when
`NEXT_PUBLIC_SITE_ENV` is `production` (`src/config/site.ts`, `src/app/robots.ts`, the `X-Robots-Tag` header in
`next.config.mjs`). On the preview host everything is `noindex` and `Disallow: /`.
