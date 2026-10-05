"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { COLUMNS, filterRows, sortRows, toCsv, type Sort, type SortKey, type SpecRow } from "./spec";

/**
 * Contract specifications: every instrument in one table.
 *
 * The rows arrive from the server and are all in the HTML as published. This
 * component only chooses which are shown and in what order (asset class, a
 * search, a sort on any column) and writes the rows on screen to a CSV file in
 * the browser. Below 640px each instrument is a stacked card instead of a row.
 * Every figure is an indicative condition, never a price. Nothing is stored.
 */
export function SpecTable({ rows, classes }: { rows: SpecRow[]; classes: { key: string; name: string }[] }) {
  const [cls, setCls] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>(null);
  const id = useId();

  const view = useMemo(() => sortRows(filterRows(rows, cls, q), sort), [rows, cls, q, sort]);
  const options = [{ key: "all", name: "All" }, ...classes];
  const className = classes.find((c) => c.key === cls)?.name;
  const sortLabel = sort ? COLUMNS.find((c) => c.key === sort.key)?.label : null;

  const toggle = (key: SortKey) => setSort((s) => (s && s.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));

  const download = () => {
    const blob = new Blob([`﻿${toCsv(view)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gio4x-contract-specifications.csv";
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div>
      <div className="flex flex-col gap-21 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p id={`${id}-cls`} className="field-label">
            Asset class
          </p>
          <div className="seg mt-8 hidden lg:inline-flex" role="group" aria-labelledby={`${id}-cls`}>
            {options.map((o) => (
              <button key={o.key} type="button" aria-pressed={cls === o.key} onClick={() => setCls(o.key)}>
                {o.name}
              </button>
            ))}
          </div>
          <select className="select mt-8 lg:hidden" aria-labelledby={`${id}-cls`} value={cls} onChange={(e) => setCls(e.target.value)}>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field lg:w-[21rem]">
          <label htmlFor={`${id}-q`}>Search instruments</label>
          <input id={`${id}-q`} type="search" className="input" placeholder="Symbol or name, e.g. gold" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
      </div>

      {/* on a phone there are no column headings to press: the order is chosen here */}
      <div className="mt-13 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 sm:hidden">
        <div className="field">
          <label htmlFor={`${id}-sort`}>Sort by</label>
          <select
            id={`${id}-sort`}
            className="select"
            value={sort?.key ?? ""}
            onChange={(e) => setSort(e.target.value ? { key: e.target.value as SortKey, dir: sort?.dir ?? 1 } : null)}
          >
            <option value="">As published</option>
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-ghost !h-[2.75rem]" disabled={!sort} onClick={() => setSort((s) => (s ? { key: s.key, dir: s.dir === 1 ? -1 : 1 } : s))}>
          {sort?.dir === -1 ? "Descending" : "Ascending"}
        </button>
      </div>

      <div className="mt-21 flex flex-wrap items-center justify-between gap-x-21 gap-y-8">
        <p className="text-sm text-ink-2" aria-live="polite">
          <span className="num font-medium text-ink">{view.length}</span> {view.length === 1 ? "instrument" : "instruments"}
          {className ? ` in ${className}` : " across all classes"}
          {q.trim() ? ` matching “${q.trim()}”` : ""}
          {sort && sortLabel ? `, sorted by ${sortLabel.toLowerCase()}, ${sort.dir === 1 ? "ascending" : "descending"}` : ", in the order published"}.
        </p>
        <button type="button" className="btn btn-ghost btn-sm min-h-[2.75rem] sm:min-h-0" onClick={download} disabled={view.length === 0}>
          Download as CSV
        </button>
      </div>

      {view.length > 0 ? (
        <>
          {/* 640px and up: the table */}
          <div className="scroll-x mt-13 hidden overflow-x-auto sm:block">
            <table className="table-gx min-w-[72rem]">
              <caption className="sr-only">Indicative contract specifications for every instrument. Column headings sort the table.</caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => {
                    const on = sort?.key === c.key;
                    return (
                      <th key={c.key} scope="col" aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={c.numeric ? "!text-right" : ""}>
                        <button
                          type="button"
                          onClick={() => toggle(c.key)}
                          // a column of figures is read down its right edge: there the sort mark goes before the words,
                          // so the heading ends exactly where the figures end instead of a mark's width short of them
                          className={`inline-flex items-center gap-5 uppercase tracking-[0.1em] transition-colors duration-fast hover:text-ink ${c.numeric ? "flex-row-reverse" : ""} ${on ? "text-ink" : ""}`}
                          title={`Sort by ${c.label.toLowerCase()}`}
                        >
                          {c.label}
                          <span aria-hidden className={`num w-8 text-[0.625rem] ${on ? "" : "opacity-30"}`}>
                            {on ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.key}>
                    <th scope="row" className="!border-line !py-0 !font-normal !normal-case !tracking-normal">
                      <Link href={r.href} className="num flex min-h-[2.75rem] items-center text-[0.9375rem] font-semibold text-ink transition-colors duration-fast hover:text-accent">
                        {r.symbol}
                      </Link>
                    </th>
                    <td className="text-sm text-ink-2">
                      <Link href={r.href} className="link-quiet">
                        {r.name}
                      </Link>
                    </td>
                    <td className="text-sm text-ink-2">{r.className}</td>
                    <td className="text-sm text-ink-2">{r.contract}</td>
                    <td className="num text-right text-[0.9375rem] font-medium">{r.minLot}</td>
                    <td className="num whitespace-nowrap text-right text-[0.9375rem] font-medium">
                      {r.spreadFrom} <span className="text-xs font-normal text-ink-3">{r.spreadUnit}</span>
                    </td>
                    <td className="num text-right text-[0.9375rem] font-medium">{r.leverage}</td>
                    <td className="min-w-[17rem] py-8 text-xs text-ink-3">{r.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* below 640px: one card for each instrument */}
          <ul className="mt-13 grid gap-13 sm:hidden" aria-label="Contract specifications by instrument">
            {view.map((r) => (
              <li key={r.key} className="panel p-13">
                <Link href={r.href} className="flex min-h-[2.75rem] flex-wrap items-baseline gap-x-13 gap-y-3">
                  <span className="num text-md font-semibold text-ink">{r.symbol}</span>
                  <span className="text-sm text-ink-3">{r.name}</span>
                </Link>
                <dl className="mt-5 border-t border-line text-sm">
                  {[
                    ["Asset class", r.className, false],
                    ["Contract", r.contract, false],
                    ["Minimum lot", r.minLot, true],
                    ["Spread from", `${r.spreadFrom} ${r.spreadUnit}`, true],
                    ["Leverage up to", r.leverage, true],
                    ["Trading hours", r.hours, false],
                  ].map(([k, v, figure]) => (
                    <div key={String(k)} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-13 border-b border-line py-8 last:border-b-0">
                      <dt className="text-xs uppercase tracking-[0.06em] text-ink-3">{k}</dt>
                      <dd className={`text-right text-ink ${figure ? "num font-medium" : ""}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="panel-quiet mt-13 p-21">
          <p className="h4">No instrument matches that search.</p>
          <p className="mt-5 text-sm text-ink-2">
            Only instruments with published indicative conditions are listed. Try a symbol such as EUR/USD, or{" "}
            <button
              type="button"
              className="link"
              onClick={() => {
                setQ("");
                setCls("all");
              }}
            >
              show everything
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}
