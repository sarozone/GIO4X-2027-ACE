/**
 * Traders' files: the limits shared by the form (components/labs/bench/FileForm.tsx),
 * the endpoint (app/api/trader-file) and GIO4X Control. The database states the
 * same limits and has the final say (supabase/migrations/0030_trader_files.sql).
 */
export const FILE_KINDS = [
  { key: "ea", name: "Expert Advisor (trades by itself)" },
  { key: "indicator", name: "Indicator (draws on a chart)" },
  { key: "script", name: "Script (runs once)" },
  { key: "other", name: "Something else" },
] as const;

export const FILE_PLATFORMS = [
  { key: "mt5", name: "MetaTrader 5 (MQL5)" },
  { key: "mt4", name: "MetaTrader 4 (MQL4)" },
  { key: "pine", name: "TradingView (Pine Script)" },
  { key: "other", name: "Other, or a rule written in words" },
] as const;

export type FileKind = (typeof FILE_KINDS)[number]["key"];
export type FilePlatform = (typeof FILE_PLATFORMS)[number]["key"];

export const kindName = (k: string): string => FILE_KINDS.find((x) => x.key === k)?.name.split(" (")[0] ?? "Other";
export const platformName = (k: string): string => FILE_PLATFORMS.find((x) => x.key === k)?.name ?? "Other";

/** source only: a compiled .ex4 or .ex5 cannot be read by anyone and is not accepted */
export const FILE_EXTENSIONS = ["mq4", "mq5", "mqh", "pine", "txt"] as const;
export const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,79}\.(mq4|mq5|mqh|pine|txt)$/;
/** the file itself, as chosen in the browser */
export const FILE_MAX_BYTES = 150 * 1024;
/** its text, as stored */
export const CODE_MIN = 20;
export const CODE_MAX = 200_000;
export const TITLE_MIN = 3;
export const TITLE_MAX = 80;
export const NOTE_MAX = 1000;
export const BYLINE_MAX = 24;
/** the request that carries it: the text, escaped as JSON, and the few fields beside it */
export const FILE_BODY_BYTES = 480 * 1024;

/** characters a source file has no use for: every control character except tab, line feed and carriage return */
export const CODE_FORBIDDEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
