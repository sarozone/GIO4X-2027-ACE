/**
 * The contract specification table: one row, how rows are ordered, and the
 * same rows as a CSV file.
 *
 * Pure, with no data of its own. A row is built on the server from
 * data/instruments (see rows.ts) and every value in it is the published
 * string, unchanged. Numbers are read out of those strings only to put rows in
 * order; nothing here calculates or rounds a figure that is shown.
 */

export type SpecRow = {
  key: string;
  /** the instrument's own page */
  href: string;
  symbol: string;
  code: string;
  name: string;
  /** asset class key and its place in the published order */
  cls: string;
  clsOrder: number;
  className: string;
  contract: string;
  minLot: string;
  spreadFrom: string;
  spreadUnit: string;
  leverage: string;
  /** published by asset class, not by instrument */
  hours: string;
  /** search aliases */
  aliases: string[];
};

export type SortKey = "symbol" | "name" | "class" | "contract" | "minLot" | "spread" | "leverage" | "hours";
export type Sort = { key: SortKey; dir: 1 | -1 } | null;

export const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Name" },
  { key: "class", label: "Asset class" },
  { key: "contract", label: "Contract" },
  { key: "minLot", label: "Minimum lot", numeric: true },
  { key: "spread", label: "Spread from", numeric: true },
  { key: "leverage", label: "Leverage up to", numeric: true },
  { key: "hours", label: "Trading hours" },
];

const number = (s: string) => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};
/** "1:500" reads as 500 */
const ratio = (s: string) => number(s.includes(":") ? s.slice(s.indexOf(":") + 1) : s);
const text = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true });

function compare(key: SortKey, a: SpecRow, b: SpecRow): number {
  switch (key) {
    case "symbol":
      return text(a.symbol, b.symbol);
    case "name":
      return text(a.name, b.name);
    case "class":
      return a.clsOrder - b.clsOrder;
    case "contract":
      return text(a.contract, b.contract);
    case "minLot":
      return number(a.minLot) - number(b.minLot);
    case "spread":
      return number(a.spreadFrom) - number(b.spreadFrom);
    case "leverage":
      return ratio(a.leverage) - ratio(b.leverage);
    case "hours":
      return text(a.hours, b.hours);
  }
}

/** Rows in the chosen order; rows that tie keep the order they were published in. */
export function sortRows(rows: SpecRow[], sort: Sort): SpecRow[] {
  if (!sort) return rows;
  return rows
    .map((r, i) => ({ r, i }))
    .sort((x, y) => compare(sort.key, x.r, y.r) * sort.dir || x.i - y.i)
    .map((x) => x.r);
}

export function filterRows(rows: SpecRow[], cls: string, query: string): SpecRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter((r) => {
    if (cls !== "all" && r.cls !== cls) return false;
    if (!needle) return true;
    return [r.symbol, r.code, r.name, r.className, ...r.aliases].some((s) => s.toLowerCase().includes(needle));
  });
}

const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** The rows as comma-separated values, every field quoted, one instrument a line. */
export function toCsv(rows: SpecRow[]): string {
  const head = ["Symbol", "Code", "Name", "Asset class", "Contract", "Minimum lot", "Spread from", "Spread unit", "Leverage up to", "Trading hours (asset class)", "Status"];
  const lines = rows.map((r) => [r.symbol, r.code, r.name, r.className, r.contract, r.minLot, r.spreadFrom, r.spreadUnit, r.leverage, r.hours, "Indicative"]);
  return [head, ...lines].map((l) => l.map(cell).join(",")).join("\r\n");
}
