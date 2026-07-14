"use client";

import { useMemo, useState } from "react";
import { PropertySummaryCard } from "@/components/property/PropertySummaryCard";
import { InvestmentInputsForm } from "@/components/inputs/InvestmentInputsForm";
import { ResultsSummary } from "@/components/results/ResultsSummary";
import { MonteCarloPanel } from "@/components/montecarlo/MonteCarloPanel";
import { AIRecommendationCard } from "@/components/ai/AIRecommendationCard";
import { DeleteDealButton } from "@/components/deals/DeleteDealButton";
import { toInvestmentInputs, type InvestmentInputsFormValues } from "@/lib/validation/investment";
import { runAnalysis } from "@/lib/finance/analysis";
import type { PercentileSummary } from "@/lib/montecarlo/stats";
import type { Deal } from "@/types/deal";

export function DealWorkspace({ deal }: { deal: Deal }) {
  const [formValues, setFormValues] = useState<InvestmentInputsFormValues>(deal.investmentInputs);
  const [simulationSummary, setSimulationSummary] = useState<
    { profit: PercentileSummary; irr: PercentileSummary } | null
  >(deal.simulationSummary);

  const investmentInputs = useMemo(() => toInvestmentInputs(formValues), [formValues]);
  const result = useMemo(() => runAnalysis(investmentInputs), [investmentInputs]);

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
        <InvestmentInputsForm defaultValues={formValues} onChange={setFormValues} />
        <div className="flex flex-col items-center gap-6 lg:sticky lg:top-8 lg:self-start">
          <ResultsSummary result={result} holdingPeriodYears={formValues.holdingPeriodYears} />
          <MonteCarloPanel baseInputs={investmentInputs} onSummaryChange={setSimulationSummary} />
          <AIRecommendationCard
            property={deal.propertySnapshot}
            investmentInputs={investmentInputs}
            analysisResult={result}
            simulationSummary={simulationSummary ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
