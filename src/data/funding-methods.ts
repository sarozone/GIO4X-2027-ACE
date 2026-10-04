/*
 * What the GIO4X client portal implements for moving money, read from the portal's own
 * code and schema (the separate application under `portal/`) on 4 October 2026.
 *
 * The rule this file keeps: each row states only what that code shows, and names the
 * portal file it came from so it can be rechecked. It carries no fee, limit or
 * processing time, and it is not a list of what is open to any one client or country.
 * A screen in the portal is not evidence that money can move: where a method has a
 * screen but no connection to a payment provider, the row says so.
 *
 * Recheck when `portal/` changes. Paths below are relative to the repository root.
 *
 * Findings that apply to every row:
 *   - No payment provider is connected. `portal/.env.example` has
 *     PAYMENT_FIAT_PROVIDER=stub and PAYMENT_CRYPTO_PROVIDER=stub and no code reads them;
 *     `portal/apps/portal/src/lib/wallet-actions.ts` (requestDeposit) says "Real gateway
 *     integrations land later; for now we record intent."
 *   - A client can only create a deposit or withdrawal with status "pending"
 *     (`portal/supabase/migrations/20261003120000_close_known_security_holes.sql`,
 *     process_wallet_transaction_client). The wallet balance changes only when staff
 *     approve it (`20260529150000_money_flow_automation.sql`, staff_settle_wallet_transaction;
 *     `20261003130000_control_actions.sql`, control_settle_wallet_transaction).
 *   - A withdrawal request needs identity verification approved and an active profile,
 *     and reserves the amount (same security migration, parts A1 and A2).
 */

export const PORTAL_READ_ON = "4 October 2026";

export type PortalDirection = "Deposit and withdrawal" | "Deposit" | "Withdrawal" | "Inside the portal";

export type PortalMethod = {
  method: string;
  direction: PortalDirection;
  /** How the portal processes it, in the portal's own terms. No fee, limit or time. */
  processing: string;
  currencies: string;
  /** true: a screen exists but nothing behind it is specific to this method. */
  notConnected?: boolean;
};

export const portalMethods: PortalMethod[] = [
  // Deposit: portal/apps/portal/src/app/deposits/deposits-client.tsx (BankPanel) shows the
  //   rows of table deposit_bank_accounts (portal/supabase/migrations/20260528000003_deposit_funding_sources.sql)
  //   with a reference built from the wallet number, and records a pending "bank" deposit.
  // Withdrawal: portal/apps/portal/src/app/withdrawals/withdraw-form.tsx, option "Bank Transfer";
  //   the form sends wallet, amount and method only (no payout account is collected).
  {
    method: "Bank transfer",
    direction: "Deposit and withdrawal",
    processing:
      "Deposit: the portal shows GIO4X’s bank details and a payment reference, and records the transfer you say you are sending; it is reviewed by staff before it is credited. Withdrawal: a request is recorded and reviewed by staff before the wallet is debited. The request form does not yet take the payout account.",
    currencies: "Amounts are entered in US dollars",
  },
  // Deposit: deposits-client.tsx (CryptoPanel) lists the active rows of table deposit_crypto_addresses
  //   (same migration). As seeded, one network is active (USDT on TRC20); five more are present but
  //   switched off with placeholder addresses. Nothing in the code watches a blockchain: the
  //   "confirmations" figure is display text and the deposit is settled by staff like any other.
  // Withdrawal: withdraw-form.tsx, option "USDT (TRC20)"; no wallet address is collected.
  {
    method: "Cryptocurrency",
    direction: "Deposit and withdrawal",
    processing:
      "Deposit: the portal shows a deposit address for each network GIO4X has switched on and records the payment you say you are sending; it is reviewed by staff before it is credited. As the portal is written, one network is switched on, USDT on TRC20; the list is held in a table that staff edit. Withdrawal: a request is recorded and reviewed by staff. The request form does not yet take a destination address.",
    currencies: "USDT; amounts are entered in US dollars",
  },
  // Deposit: deposits-client.tsx (CardPanel) has a card form, but no card processor is called:
  //   the action records a pending "card" deposit with the last four digits as its reference.
  // Withdrawal: withdraw-form.tsx, option "Original Card": a label on a pending request.
  {
    method: "Card",
    direction: "Deposit and withdrawal",
    processing: "In the portal, not yet connected. There is a card screen, but the portal’s code calls no card processor.",
    currencies: "Not applicable yet",
    notConnected: true,
  },
  // portal/apps/portal/src/lib/constants.ts (DEPOSIT_METHODS, id "upi") is a tile only;
  // deposits-client.tsx (METHOD_TAB) opens the bank-transfer tab for it.
  {
    method: "Local payment methods (the portal’s code refers to UPI)",
    direction: "Deposit",
    processing: "In the portal, not yet connected. A tile only: it opens the bank-transfer screen.",
    currencies: "Not applicable yet",
    notConnected: true,
  },
  // constants.ts (DEPOSIT_METHODS, id "skrill") is a tile only; METHOD_TAB opens the card tab for it.
  {
    method: "E-wallet (the portal’s code refers to Skrill and Neteller)",
    direction: "Deposit",
    processing: "In the portal, not yet connected. A tile only: it opens the card screen.",
    currencies: "Not applicable yet",
    notConnected: true,
  },
  // portal/apps/portal/src/app/transfers/transfer-form.tsx, portal/apps/portal/src/lib/transfers-actions.ts,
  // and function transfer_funds (20260615000004_internal_transfers.sql, replaced in
  // 20261003120000_close_known_security_holes.sql part B): atomic, own wallet and own active
  // trading accounts only, same currency or USD to USC at 1:100, demo accounts sealed off.
  {
    method: "Transfer between your wallet and your trading accounts",
    direction: "Inside the portal",
    processing:
      "Carried out by the portal at once, without staff review, between a wallet and trading accounts that belong to the same client. Both sides must be in the same currency, except US dollars and US cents, which convert at 1 to 100. A demo account cannot exchange funds with a wallet or a real account.",
    currencies: "The currency of the wallet and account",
  },
];

/**
 * The currencies a portal wallet can be held in: enum wallet_currency in
 * portal/supabase/migrations/20260528000001_giorapter_ecosystem_foundation.sql.
 * USC is the US-cent unit used by cent accounts. The wallet opened at sign-up is in USD
 * (handle_new_user, same migration).
 */
export const portalWalletCurrencies = ["USD", "EUR", "GBP", "INR", "AED", "USDT", "BTC", "ETH", "USC"];

/**
 * What a withdrawal request requires, as enforced in
 * portal/supabase/migrations/20261003120000_close_known_security_holes.sql (parts A1, A2),
 * portal/apps/portal/src/lib/wallet-actions.ts (requestWithdrawal) and
 * portal/supabase/migrations/20260529150000_money_flow_automation.sql (staff_settle_wallet_transaction).
 */
export const portalWithdrawalRules: string[] = [
  "Identity verification must be approved, and the client’s profile must be active, before the portal accepts a withdrawal request.",
  "A request is made from the wallet. Money in a trading account is transferred to the wallet first.",
  "The amount requested is set aside: it cannot be requested a second time or transferred out while the request is waiting.",
  "One member of staff approves or rejects each request, and the decision is recorded against it. The wallet is debited only on approval.",
];
