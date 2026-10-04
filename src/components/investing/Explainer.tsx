import type { Instrument } from "@/data/investing";
import { BondMachine, IndexMachine, OptionMachine, SharesMachine } from "./Arithmetic";
import { EtfMachine, FundDayMachine, FuturesMachine } from "./Flows";

/** The one interactive explainer that belongs to an instrument's page. Every instrument has exactly one. */
export function Explainer({ slug }: { slug: Instrument["slug"] }) {
  switch (slug) {
    case "stocks":
      return <SharesMachine />;
    case "bonds":
      return <BondMachine />;
    case "etfs":
      return <EtfMachine />;
    case "mutual-funds":
      return <FundDayMachine />;
    case "index-investing":
      return <IndexMachine />;
    case "options":
      return <OptionMachine />;
    case "futures":
      return <FuturesMachine />;
  }
}
