/**
 * MetaTrader 5 trade server return codes.
 *
 * The number, the constant name and the short meaning of each are the ones
 * MetaQuotes publishes in its MQL5 Reference (the table "Trade Server Return
 * Codes"); a long meaning is shortened, never reworded into something else.
 * The cause and the things to check are this site's plain explanation of what
 * commonly lies behind a code on the platform in general.
 *
 * The rule this file keeps: a code is listed only if its number and meaning
 * are certain. Nothing here says what a GIO4X server returns or why: that
 * depends on settings GIO4X has not yet published. 777 Raptor is a different
 * platform and its messages are not in this file.
 */

/** Where an idea is explained on this site. The page resolves each against the data it names and drops any that is missing. */
export type CodeRef = { kind: "term"; slug: string } | { kind: "tool"; slug: string } | { kind: "lesson"; slug: string } | { kind: "page"; href: string; label: string };

export type Mt5Code = {
  code: number;
  /** the constant MetaQuotes gives the code in MQL5 */
  name: string;
  /** MetaQuotes' own short meaning */
  meaning: string;
  /** true for the codes that report an order placed or done: results, not refusals */
  result?: boolean;
  /** what usually lies behind it */
  cause: string;
  /** what a person can look at */
  check: string;
  see: CodeRef[];
};

const term = (slug: string): CodeRef => ({ kind: "term", slug });
const tool = (slug: string): CodeRef => ({ kind: "tool", slug });
const lesson = (slug: string): CodeRef => ({ kind: "lesson", slug });
const page = (href: string, label: string): CodeRef => ({ kind: "page", href, label });

const ORDER_ANATOMY = tool("order-anatomy");
const TRADE_ANATOMY = page("/labs/trade-anatomy", "Trade Anatomy");
const CLOCK = page("/markets/clock", "World Market Clock");
const CONTACT = page("/contact", "Contact support");

export const mt5Codes: Mt5Code[] = [
  {
    code: 10004,
    name: "TRADE_RETCODE_REQUOTE",
    meaning: "Requote",
    cause: "The price in the request was no longer available when the server came to deal on it, so the server answers with a new price instead of filling the order. It belongs to instant execution, where an order names the price it wants.",
    check: "Whether the market was moving quickly at that moment, for example around a scheduled release, and what deviation from the requested price the order allowed.",
    see: [term("requote"), term("slippage"), ORDER_ANATOMY],
  },
  {
    code: 10006,
    name: "TRADE_RETCODE_REJECT",
    meaning: "Request rejected",
    cause: "The server or the dealer refused the request without a more specific code. On its own it does not say why.",
    check: "The Journal tab of the terminal for the line written at that moment, then the broker’s support desk, which can read the reason on the server.",
    see: [TRADE_ANATOMY, CONTACT],
  },
  {
    code: 10007,
    name: "TRADE_RETCODE_CANCEL",
    meaning: "Request canceled by trader",
    cause: "The request was withdrawn from the client side before it was carried out, for example by declining a new price that was offered.",
    check: "Whether a requote or a confirmation window was closed or declined.",
    see: [term("requote"), ORDER_ANATOMY],
  },
  {
    code: 10008,
    name: "TRADE_RETCODE_PLACED",
    meaning: "Order placed",
    result: true,
    cause: "Not a refusal. The server has accepted the order and it is now waiting: a pending order resting until its price is reached, or an order on its way to execution.",
    check: "The Trade tab, where the order is listed until it is filled, cancelled or expires.",
    see: [term("pending-order"), term("order"), ORDER_ANATOMY],
  },
  {
    code: 10009,
    name: "TRADE_RETCODE_DONE",
    meaning: "Request completed",
    result: true,
    cause: "Not a refusal. The request was carried out.",
    check: "The price and volume of the deal in the History tab, which may differ from what was asked under market execution.",
    see: [term("fill"), term("slippage")],
  },
  {
    code: 10010,
    name: "TRADE_RETCODE_DONE_PARTIAL",
    meaning: "Only part of the request was completed",
    result: true,
    cause: "The order was filled for less than the volume requested, because that was all the volume available at the price and the filling policy allowed a partial fill.",
    check: "The volume of the deal against the volume of the order, and the order’s filling policy.",
    see: [term("fill"), term("liquidity"), term("lot")],
  },
  {
    code: 10011,
    name: "TRADE_RETCODE_ERROR",
    meaning: "Request processing error",
    cause: "Something went wrong while the request was being handled. The code is general and does not name the fault.",
    check: "The Journal tab for the surrounding lines, and whether the order exists before sending it again, so that it is not placed twice.",
    see: [TRADE_ANATOMY, CONTACT],
  },
  {
    code: 10012,
    name: "TRADE_RETCODE_TIMEOUT",
    meaning: "Request canceled by timeout",
    cause: "No answer came within the time allowed, so the request was dropped. A slow or interrupted connection is a common reason.",
    check: "The connection indicator in the terminal, and whether the order was in fact placed before trying again.",
    see: [TRADE_ANATOMY],
  },
  {
    code: 10013,
    name: "TRADE_RETCODE_INVALID",
    meaning: "Invalid request",
    cause: "The request is not put together correctly: a field is missing, the action does not match the order type, or the symbol or ticket named does not exist. It is met most often in automated trading.",
    check: "The fields of the order ticket, or, for a program, the fields of the request it builds: action, symbol, volume, type and price.",
    see: [ORDER_ANATOMY, term("order"), term("expert-advisor")],
  },
  {
    code: 10014,
    name: "TRADE_RETCODE_INVALID_VOLUME",
    meaning: "Invalid volume in the request",
    cause: "The size is below the symbol’s minimum, above its maximum, or not a whole multiple of its volume step. A symbol with a step of 0.01 lots accepts 0.13 and refuses 0.135.",
    check: "The minimum volume, maximum volume and volume step in the symbol’s specification (right-click the symbol in Market Watch), and the lot size being sent.",
    see: [term("lot"), term("contract-size"), tool("position-size")],
  },
  {
    code: 10015,
    name: "TRADE_RETCODE_INVALID_PRICE",
    meaning: "Invalid price in the request",
    cause: "The price is not one the symbol can trade at: it has more decimal places than the symbol quotes, it is not on the symbol’s tick size, or a pending order has been placed on the wrong side of the market for its type.",
    check: "The number of digits the symbol quotes, and which side of the current price each pending order type belongs on.",
    see: [term("pending-order"), term("limit-order"), term("stop-order"), ORDER_ANATOMY],
  },
  {
    code: 10016,
    name: "TRADE_RETCODE_INVALID_STOPS",
    meaning: "Invalid stops in the request",
    cause: "The stop loss or take profit is on the wrong side of the price for the direction of the trade, or it is closer to the market than the symbol’s stops level, the minimum distance the server allows.",
    check: "The stops level in the symbol’s specification, the direction of the trade, and whether the spread has been counted: a buy is closed at the bid and a sell at the ask.",
    see: [term("stop-loss"), term("take-profit"), term("spread"), ORDER_ANATOMY],
  },
  {
    code: 10017,
    name: "TRADE_RETCODE_TRADE_DISABLED",
    meaning: "Trade is disabled",
    cause: "Trading is switched off on the server for this symbol or for this account. A symbol can be set to be quoted without being tradable.",
    check: "The trade mode in the symbol’s specification, and with the broker whether trading is enabled on the account.",
    see: [TRADE_ANATOMY, CONTACT],
  },
  {
    code: 10018,
    name: "TRADE_RETCODE_MARKET_CLOSED",
    meaning: "Market is closed",
    cause: "The request arrived outside the symbol’s trading sessions: at a weekend, on a holiday, or during a daily break.",
    check: "The trading sessions listed in the symbol’s specification, which are given in the server’s time, not necessarily your own.",
    see: [CLOCK, term("gap"), TRADE_ANATOMY],
  },
  {
    code: 10019,
    name: "TRADE_RETCODE_NO_MONEY",
    meaning: "There is not enough money to complete the request",
    cause: "The free margin on the account is less than the margin the new order would need. Open positions, their running losses and the size of the order all bear on it.",
    check: "Free margin in the Trade tab against the margin the order needs, which depends on its size, the price and the account’s leverage.",
    see: [tool("margin"), term("margin"), term("free-margin"), lesson("what-is-leverage-and-margin")],
  },
  {
    code: 10020,
    name: "TRADE_RETCODE_PRICE_CHANGED",
    meaning: "Prices changed",
    cause: "The price moved between the request being sent and the server handling it, so the request was not carried out at the old price.",
    check: "Whether the market was moving quickly, and the current price before sending again.",
    see: [term("slippage"), term("requote"), term("volatility")],
  },
  {
    code: 10021,
    name: "TRADE_RETCODE_PRICE_OFF",
    meaning: "There are no quotes to process the request",
    cause: "The server has no current price for the symbol to deal on. This happens when a market is not being quoted, for example outside its hours or during a break in the price feed.",
    check: "Whether the symbol is ticking in Market Watch, and its trading sessions.",
    see: [CLOCK, term("liquidity"), term("tick")],
  },
  {
    code: 10022,
    name: "TRADE_RETCODE_INVALID_EXPIRATION",
    meaning: "Invalid order expiration date in the request",
    cause: "The expiry given for a pending order is in the past, is too soon, or is of a kind the symbol does not allow.",
    check: "The expiry modes the symbol allows in its specification, and the date and time set on the order, in server time.",
    see: [term("pending-order"), ORDER_ANATOMY],
  },
  {
    code: 10023,
    name: "TRADE_RETCODE_ORDER_CHANGED",
    meaning: "Order state changed",
    cause: "The order was no longer in the state the request assumed: it had already been filled, cancelled or changed by the time the request reached it.",
    check: "The order’s present state in the Trade and History tabs.",
    see: [term("order"), term("fill")],
  },
  {
    code: 10024,
    name: "TRADE_RETCODE_TOO_MANY_REQUESTS",
    meaning: "Too frequent requests",
    cause: "Requests were sent faster than the server accepts them. It is met mostly with programs that send or modify orders on every price change.",
    check: "How often a program is sending requests, and whether it repeats a request that has not changed.",
    see: [term("expert-advisor")],
  },
  {
    code: 10025,
    name: "TRADE_RETCODE_NO_CHANGES",
    meaning: "No changes in request",
    cause: "A modification was sent with the same values the order or position already has, so there was nothing to change.",
    check: "The new stop loss, take profit or price against the present ones.",
    see: [term("stop-loss"), term("take-profit"), term("trailing-stop")],
  },
  {
    code: 10026,
    name: "TRADE_RETCODE_SERVER_DISABLES_AT",
    meaning: "Autotrading disabled by server",
    cause: "The server does not allow trading by programs on this account. Orders placed by hand are a separate matter.",
    check: "With the broker, whether automated trading is allowed on the account.",
    see: [term("expert-advisor"), CONTACT],
  },
  {
    code: 10027,
    name: "TRADE_RETCODE_CLIENT_DISABLES_AT",
    meaning: "Autotrading disabled by client terminal",
    cause: "Automated trading is switched off in the terminal itself, so a program’s request was stopped before it left. The switch is the Algo Trading button, with a further permission in each program’s own settings.",
    check: "The Algo Trading button on the toolbar, the permission in the program’s properties, and the terminal’s options for Expert Advisors.",
    see: [term("expert-advisor"), page("/labs/rule-bench", "Rule bench")],
  },
  {
    code: 10028,
    name: "TRADE_RETCODE_LOCKED",
    meaning: "Request locked for processing",
    cause: "The order or position is already being worked on by an earlier request, and a second one cannot be taken until the first is finished.",
    check: "Whether an earlier request for the same order is still in progress.",
    see: [TRADE_ANATOMY],
  },
  {
    code: 10029,
    name: "TRADE_RETCODE_FROZEN",
    meaning: "Order or position frozen",
    cause: "The price is so close to the order’s level that the server no longer allows it to be changed or cancelled. The distance is the symbol’s freeze level.",
    check: "The freeze level in the symbol’s specification, and how far the current price is from the order, stop loss or take profit.",
    see: [term("pending-order"), term("stop-loss"), ORDER_ANATOMY],
  },
  {
    code: 10030,
    name: "TRADE_RETCODE_INVALID_FILL",
    meaning: "Invalid order filling type",
    cause: "The order asked to be filled in a way the symbol does not allow. MetaTrader 5 has three filling policies (fill or kill, immediate or cancel, and return) and each symbol permits only some of them. It is met most often with programs written for another broker’s symbols.",
    check: "The filling policies the symbol allows in its specification, and the one the order or the program is sending.",
    see: [term("fill"), term("expert-advisor"), ORDER_ANATOMY],
  },
  {
    code: 10031,
    name: "TRADE_RETCODE_CONNECTION",
    meaning: "No connection with the trade server",
    cause: "The terminal was not connected to the server when the request was made.",
    check: "The connection indicator in the corner of the terminal, the internet connection, and that the terminal is signed in to the right server.",
    see: [CONTACT],
  },
  {
    code: 10032,
    name: "TRADE_RETCODE_ONLY_REAL",
    meaning: "Operation is allowed only for live accounts",
    cause: "The action was tried on a demonstration account and is permitted only on a live one.",
    check: "Which account the terminal is signed in to.",
    see: [page("/labs/simulator", "Practice desk")],
  },
  {
    code: 10033,
    name: "TRADE_RETCODE_LIMIT_ORDERS",
    meaning: "The number of pending orders has reached the limit",
    cause: "The server limits how many pending orders an account may hold at once, and the account is at that number.",
    check: "How many pending orders are open in the Trade tab.",
    see: [term("pending-order")],
  },
  {
    code: 10034,
    name: "TRADE_RETCODE_LIMIT_VOLUME",
    meaning: "The volume of orders and positions for the symbol has reached the limit",
    cause: "A symbol can carry a limit on the total volume one account may hold in it, counting open positions and pending orders together. The new order would pass it.",
    check: "The volume limit in the symbol’s specification against the total already open and pending in that symbol.",
    see: [term("lot"), term("open-position"), tool("position-size")],
  },
  {
    code: 10035,
    name: "TRADE_RETCODE_INVALID_ORDER",
    meaning: "Incorrect or prohibited order type",
    cause: "The order type is not one the symbol accepts. A symbol can allow some order types and not others.",
    check: "The order types the symbol allows in its specification.",
    see: [term("market-order"), term("limit-order"), term("stop-order"), ORDER_ANATOMY],
  },
  {
    code: 10036,
    name: "TRADE_RETCODE_POSITION_CLOSED",
    meaning: "Position with the specified POSITION_IDENTIFIER has already been closed",
    cause: "The request named a position that no longer exists: it had already been closed, by hand, by its stop loss or take profit, or by the server.",
    check: "The History tab for the deal that closed it.",
    see: [term("open-position"), term("stop-loss"), term("stop-out")],
  },
  {
    code: 10038,
    name: "TRADE_RETCODE_INVALID_CLOSE_VOLUME",
    meaning: "A close volume exceeds the current position volume",
    cause: "The request tried to close more than the position holds, for example 0.50 lots of a position of 0.30.",
    check: "The position’s present volume, which may be smaller than it was if part has already been closed.",
    see: [term("lot"), term("open-position")],
  },
  {
    code: 10039,
    name: "TRADE_RETCODE_CLOSE_ORDER_EXIST",
    meaning: "A close order already exists for a specified position",
    cause: "An order to close the position is already waiting, and a second one would close more than the position holds. MetaQuotes notes that this arises on hedging accounts.",
    check: "The Trade tab for an order already attached to that position.",
    see: [term("hedging"), term("open-position")],
  },
  {
    code: 10040,
    name: "TRADE_RETCODE_LIMIT_POSITIONS",
    meaning: "The number of open positions simultaneously present on an account can be limited by the server settings",
    cause: "The account is at the server’s limit for the number of positions open at once, so an order that would open another is refused.",
    check: "How many positions are open in the Trade tab.",
    see: [term("open-position"), term("hedging")],
  },
  {
    code: 10041,
    name: "TRADE_RETCODE_REJECT_CANCEL",
    meaning: "The pending order activation request is rejected, the order is canceled",
    cause: "A pending order reached its price, the server could not turn it into a position, and the order was cancelled instead of being left to try again.",
    check: "The History tab for the cancelled order, and the state of the account at that moment, free margin above all.",
    see: [term("pending-order"), term("free-margin"), tool("margin")],
  },
  {
    code: 10042,
    name: "TRADE_RETCODE_LONG_ONLY",
    meaning: "The request is rejected, because the “Only long positions are allowed” rule is set for the symbol",
    cause: "The symbol is set so that it can only be bought. An order to sell that would open a short position is refused.",
    check: "The trade mode in the symbol’s specification.",
    see: [term("long-position"), term("going-short")],
  },
  {
    code: 10043,
    name: "TRADE_RETCODE_SHORT_ONLY",
    meaning: "The request is rejected, because the “Only short positions are allowed” rule is set for the symbol",
    cause: "The symbol is set so that it can only be sold. An order to buy that would open a long position is refused.",
    check: "The trade mode in the symbol’s specification.",
    see: [term("going-short"), term("long-position")],
  },
  {
    code: 10044,
    name: "TRADE_RETCODE_CLOSE_ONLY",
    meaning: "The request is rejected, because the “Only position closing is allowed” rule is set for the symbol",
    cause: "The symbol is set so that existing positions can be closed and no new ones opened.",
    check: "The trade mode in the symbol’s specification.",
    see: [term("open-position"), CONTACT],
  },
  {
    code: 10045,
    name: "TRADE_RETCODE_FIFO_CLOSE",
    meaning: "The request is rejected, because “Position closing is allowed only by FIFO rule” is set for the trading account",
    cause: "The account is set so that positions in a symbol must be closed in the order they were opened, oldest first. A request to close a later one first is refused.",
    check: "Which position in that symbol was opened first.",
    see: [term("open-position"), term("hedging")],
  },
  {
    code: 10046,
    name: "TRADE_RETCODE_HEDGE_PROHIBITED",
    meaning: "The request is rejected, because the “Opposite positions on a single symbol are disabled” rule is set for the trading account",
    cause: "The account is set so that it cannot hold a buy and a sell in the same symbol at once. An order that would open the opposite side is refused.",
    check: "The positions already open in that symbol, and their direction.",
    see: [term("hedging"), term("open-position")],
  },
];
