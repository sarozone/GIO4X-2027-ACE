"use client";

import type { CaseSlug } from "@/data/case-studies";
import { LoopMachine, SliceMachine } from "./Flows";
import { CostMachine, MarginMachine, QuadrantMachine } from "./Ideas";

/** The one working example of a case study: an idea to handle, never a record of anyone's results. */
export function Explainer({ slug }: { slug: CaseSlug }) {
  switch (slug) {
    case "buffett-and-munger":
      return <MarginMachine />;
    case "bogle":
      return <CostMachine />;
    case "dalio":
      return <QuadrantMachine />;
    case "soros":
      return <LoopMachine />;
    case "institutional-process":
      return <SliceMachine />;
  }
}
