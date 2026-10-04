/**
 * The rows of the contract specification table, read from data/instruments.
 *
 * Nothing is typed here: each value is the string GIO4X published for that
 * instrument, and the hours are the line published for its asset class.
 */
import { assetClasses, instrumentHref, instruments } from "@/data/instruments";
import type { SpecRow } from "./spec";

export function specRows(): SpecRow[] {
  return instruments.map((i) => {
    const order = assetClasses.findIndex((a) => a.key === i.class);
    const cls = assetClasses[order];
    return {
      key: `${i.class}-${i.slug}`,
      href: instrumentHref(i),
      symbol: i.symbol,
      code: i.code,
      name: i.name,
      cls: i.class,
      clsOrder: order,
      className: cls?.name ?? i.class,
      contract: i.contract,
      minLot: i.conditions.minLot,
      spreadFrom: i.conditions.spreadFrom,
      spreadUnit: cls?.spreadUnit ?? "",
      leverage: i.conditions.leverage,
      hours: cls?.hours ?? "",
      aliases: i.aliases,
    };
  });
}

export const specClasses = () => assetClasses.map((a) => ({ key: a.key as string, name: a.name }));
