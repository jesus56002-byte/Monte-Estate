"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { PropertySummaryCard } from "@/components/property/PropertySummaryCard";
import { InvestmentInputsForm } from "@/components/inputs/InvestmentInputsForm";
import { ResultsSummary } from "@/components/results/ResultsSummary";
import { MonteCarloPanel } from "@/components/montecarlo/MonteCarloPanel";
import { AIRecommendationCard } from "@/components/ai/AIRecommendationCard";
import { DeleteDealButton } from "@/components/deals/DeleteDealButton";
import { Button } from "@/components/ui/button";
import { updateDeal } from "@/app/(app)/deals/actions";
import { toInvestmentInputs, type InvestmentInputsFormValues } from "@/lib/validation/investment";
import { runAnalysis } from "@/lib/finance/analysis";
import type { PercentileSummary } from "@/lib/montecarlo/stats";
import type { AIRecommendation } from "@/lib/validation/ai";
import type { Deal } from "@/types/deal";

export function DealWorkspace({ deal }: { deal: Deal }) {
  const [formValues, setFormValues] = useState<InvestmentInputsFormValues>(deal.investmentInputs);
  const [simulationSummary, setSimulationSummary] = useState<
    { profit: PercentileSummary; irr: PercentileSummary } | null
  >(deal.simulationSummary);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(deal.aiRecommendation);

  const [isSaving, startSaveTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  // Snapshot of what was actually last written to the deal, so "changed
  // since last save" and "just saved" are both derived from a plain
  // comparison rather than needing an effect to reset a flag.
  const [lastSavedFormValues, setLastSavedFormValues] = useState(deal.investmentInputs);

  const investmentInputs = useMemo(() => toInvestmentInputs(formValues), [formValues]);
  const result = useMemo(() => runAnalysis(investmentInputs), [investmentInputs]);

  const inputsChanged = JSON.stringify(formValues) !== JSON.stringify(lastSavedFormValues);

  // Silently persist a fresh Monte Carlo summary the moment a run completes —
  // no button, no loading UI, so it's genuinely "always there" next time this
  // deal is opened. A null (reset because inputs changed) is deliberately
  // NOT persisted, so the last real run stays saved until a new one replaces it.
  const lastPersistedSummaryRef = useRef(deal.simulationSummary);
  function handleSummaryChange(summary: { profit: PercentileSummary; irr: PercentileSummary } | null) {
    setSimulationSummary(summary);
    if (summary && summary !== lastPersistedSummaryRef.current) {
      lastPersistedSummaryRef.current = summary;
      updateDeal(deal.id, { simulationSummary: summary }).then((state) => {
        if (state.error) console.error("[DealWorkspace] failed to persist Monte Carlo summary:", state.error);
      });
    }
  }

  function handleRecommendationChange(recommendation: AIRecommendation) {
    setAiRecommendation(recommendation);
    updateDeal(deal.id, { aiRecommendation: recommendation }).then((state) => {
      if (state.error) console.error("[DealWorkspace] failed to persist AI interpretation:", state.error);
    });
  }

  function handleSaveChanges() {
    startSaveTransition(async () => {
      const state = await updateDeal(deal.id, { investmentInputs: formValues, calculatedResults: result });
      if (state.error) {
        setSaveError(state.error);
        return;
      }
      setSaveError(null);
      setLastSavedFormValues(formValues);
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex w-full max-w-xl items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Saved {new Date(deal.createdAt).toLocaleDateString()}
        </p>
        <DeleteDealButton dealId={deal.id} />
      </div>

      <PropertySummaryCard property={deal.propertySnapshot} />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-3">
          <InvestmentInputsForm defaultValues={formValues} onChange={setFormValues} />
          <div className="flex flex-col items-center gap-1">
            <Button variant="outline" onClick={handleSaveChanges} disabled={isSaving || !inputsChanged}>
              {!inputsChanged && !isSaving ? <Check className="size-4" /> : null}
              {isSaving ? "Saving…" : !inputsChanged ? "Saved" : "Save changes"}
            </Button>
            {saveError && (
              <p role="alert" className="text-sm text-destructive">
                {saveError}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 lg:sticky lg:top-8 lg:self-start">
          <ResultsSummary result={result} holdingPeriodYears={formValues.holdingPeriodYears} />
          <MonteCarloPanel
            baseInputs={investmentInputs}
            autoRun
            initialSummary={deal.simulationSummary}
            onSummaryChange={handleSummaryChange}
          />
          <AIRecommendationCard
            dealId={deal.id}
            property={deal.propertySnapshot}
            investmentInputs={investmentInputs}
            analysisResult={result}
            simulationSummary={simulationSummary ?? undefined}
            initialRecommendation={aiRecommendation}
            onRecommendationChange={handleRecommendationChange}
          />
        </div>
      </div>
    </div>
  );
}
