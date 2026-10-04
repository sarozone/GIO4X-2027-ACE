"use client";

import { exchangeRows, fxRows, SEASONS, spanCell, type Row } from "@/components/guides/hours";
import { hhmm, zoneId } from "@/components/markets/time";
import { DataNote } from "@/components/ui/Page";
import { useNow } from "@/hooks/useNow";
import { centres, fxSessions, SCHEDULE_NOTE } from "@/lib/sessions";

/**
 * The four FX session windows and the exchanges' regular hours, in UTC.
 *
 * Every hour is worked out from lib/sessions. The local window and the two UTC
 * columns (one fixed day in each half of the year, so both states of the
 * clocks are shown and nothing depends on the day the site was built) are in
 * the server's HTML. The last column, the visitor's own time today, is filled
 * in after mount from their clock. Regular weekday hours only.
 */

type Line = { key: string; name: string; sub: string; local: string; utc: string[] };

function lines(kind: "fx" | "exchange"): Line[] {
  const seasons = SEASONS.map((s) => (kind === "fx" ? fxRows("UTC", s.at) : exchangeRows("UTC", s.at)));
  if (kind === "fx") {
    return fxSessions.map((s, i) => ({
      key: s.key,
      name: s.name,
      sub: s.tz.replace(/_/g, " "),
      local: `${hhmm(s.open)}–${hhmm(s.close)}`,
      utc: seasons.map((rows) => spanCell(rows[i].span)),
    }));
  }
  return centres.map((c, i) => ({
    key: c.key,
    name: c.city,
    sub: c.venue,
    local: `${hhmm(c.open)}–${hhmm(c.close)}${c.lunch ? `, break ${hhmm(c.lunch[0])}–${hhmm(c.lunch[1])}` : ""}`,
    utc: seasons.map((rows) => spanCell(rows[i].span)),
  }));
}

export function SessionTable({ kind }: { kind: "fx" | "exchange" }) {
  const now = useNow(60_000);
  const tz = now ? zoneId("local") : null;
  const mine: Row[] | null = now && tz ? (kind === "fx" ? fxRows(tz, now) : exchangeRows(tz, now)) : null;
  const rows = lines(kind);
  const what = kind === "fx" ? "Session" : "Exchange";

  return (
    <div>
      <div className="scroll-x overflow-x-auto">
        <table className="table-gx min-w-[44rem]">
          <caption className="sr-only">
            {kind === "fx" ? "Conventional FX session windows" : "Regular exchange hours"} in local time, in UTC in mid-January and mid-July, and in your own time today
          </caption>
          <thead>
            <tr>
              <th scope="col">{what}</th>
              <th scope="col">Local time</th>
              {SEASONS.map((s) => (
                <th key={s.key} scope="col">
                  UTC, {s.inWords}
                </th>
              ))}
              <th scope="col" className="!pr-0">
                Your time, today
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key}>
                <th scope="row" className="!border-line !py-8 !text-[0.9375rem] !font-medium !normal-case !tracking-normal !text-ink">
                  {r.name}
                  <span className="block text-xs font-normal text-ink-3">{r.sub}</span>
                </th>
                <td className="num text-[0.9375rem]">{r.local}</td>
                {r.utc.map((u, k) => (
                  <td key={SEASONS[k].key} className="num whitespace-nowrap text-[0.9375rem]">
                    {u}
                  </td>
                ))}
                <td className="num whitespace-nowrap !pr-0 text-[0.9375rem] text-ink-2">{mine ? spanCell(mine[i].span) : <span aria-hidden>--:--</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-xs text-ink-3">
        “+1” means the window ends on the following day on that clock.{" "}
        <span aria-live="polite">{tz ? `Your time is read from this device: ${tz.replace(/_/g, " ")}.` : "Your own time is filled in once your clock has been read."}</span>
      </p>
      <DataNote className="mt-8" status="schedule">
        {SCHEDULE_NOTE}
      </DataNote>
    </div>
  );
}
