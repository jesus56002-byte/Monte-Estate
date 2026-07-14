"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PropertySummaryCard } from "@/components/property/PropertySummaryCard";
import { InvestmentInputsForm } from "@/components/inputs/InvestmentInputsForm";
import { ResultsSummary } from "@/components/results/ResultsSummary";
import { MonteCarloPanel } from "@/components/montecarlo/MonteCarloPanel";
import { AIRecommendationCard } from "@/components/ai/AIRecommendationCard";
import { SaveDealButton } from "@/components/deals/SaveDealButton";
import { deriveDefaultInputs } from "@/lib/utils/defaults";
import { toInvestmentInputs, type InvestmentInputsFormValues } from "@/lib/validation/investment";
import { runAnalysis } from "@/lib/finance/analysis";
import type { PercentileSummary } from "@/lib/montecarlo/stats";
import type { PropertyData } from "@/types/property";

type LookupStatus = "idle" | "loading" | "error" | "success";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const [status, setStatus] = useState<LookupStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [formValues, setFormValues] = useState<InvestmentInputsFormValues | null>(null);
  const [simulationSummary, setSimulationSummary] = useState<
    { profit: PercentileSummary; irr: PercentileSummary } | null
  >(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a fetch triggered by address changing
    setStatus("loading");
    setErrorMessage(null);

    fetch("/api/property-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErrorMessage(body.message ?? "Couldn't look up that address.");
          setStatus("error");
          return;
        }
        setProperty(body.property);
        setFormValues(deriveDefaultInputs(body.property));
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("Couldn't reach the server. Try again.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  const investmentInputs = useMemo(() => {
    if (!formValues) return null;
    return toInvestmentInputs(formValues);
  }, [formValues]);

  const result = useMemo(() => {
    if (!investmentInputs) return null;
    return runAnalysis(investmentInputs);
  }, [investmentInputs]);

  if (!address) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground">
          Start from{" "}
          <a href="/search" className="underline underline-offset-4">
            property search
          </a>{" "}
          to analyze a deal.
        </p>
      </div>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground">Loading property data…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p role="alert" className="text-destructive">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (!property || !formValues) return null;

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <PropertySummaryCard property={property} />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <InvestmentInputsForm defaultValues={formValues} onChange={setFormValues} />
        {result && investmentInputs && (
          <div className="flex flex-col items-center gap-6 lg:sticky lg:top-8 lg:self-start">
            <ResultsSummary result={result} holdingPeriodYears={formValues.holdingPeriodYears} />
            <SaveDealButton
              input={{
                property,
                investmentInputs: formValues,
                calculatedResults: result,
                simulationSummary,
              }}
            />
            <MonteCarloPanel baseInputs={investmentInputs} onSummaryChange={setSimulationSummary} />
            <AIRecommendationCard
              property={property}
              investmentInputs={investmentInputs}
              analysisResult={result}
              simulationSummary={simulationSummary ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
