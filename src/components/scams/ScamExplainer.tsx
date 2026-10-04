"use client";

import type { ScamKind } from "@/data/scams";
import { AdvanceFeeExplainer, DeepfakeExplainer, PhishingExplainer, RecoveryExplainer } from "./ContactExplainers";
import { PonziExplainer, PumpExplainer, PyramidExplainer, SignalExplainer } from "./MoneyExplainers";
import { CloneExplainer, FakeBrokerExplainer, ManagedExplainer, RomanceExplainer } from "./TrustExplainers";

/**
 * The one animated explainer on a Scam school page, chosen by the entry's
 * kind. Each is a model of a type of fraud in invented units: it names no
 * real firm or person, and stores and sends nothing.
 */
const EXPLAINERS: Record<ScamKind, () => React.JSX.Element> = {
  ponzi: PonziExplainer,
  pyramid: PyramidExplainer,
  pump: PumpExplainer,
  signals: SignalExplainer,
  clone: CloneExplainer,
  "fake-broker": FakeBrokerExplainer,
  managed: ManagedExplainer,
  romance: RomanceExplainer,
  recovery: RecoveryExplainer,
  phishing: PhishingExplainer,
  "advance-fee": AdvanceFeeExplainer,
  deepfake: DeepfakeExplainer,
};

export function ScamExplainer({ kind }: { kind: ScamKind }) {
  const Explainer = EXPLAINERS[kind];
  return (
    <div data-machine>
      <Explainer />
    </div>
  );
}
