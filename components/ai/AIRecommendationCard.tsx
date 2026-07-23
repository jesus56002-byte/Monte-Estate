"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InvestmentInputs, AnalysisResult } from "@/lib/finance/types";
import type { PropertyData } from "@/types/property";
import type { PercentileSummary } from "@/lib/montecarlo/stats";
import type { AIRecommendation } from "@/lib/validation/ai";

const VERDICT_LABEL: Record<AIRecommendation["verdict"], string> = {
  strong_buy: "Strong buy",
  buy: "Buy",
  neutral: "Neutral",
  caution: "Caution",
  avoid: "Avoid",
};

const VERDICT_TONE: Record<AIRecommendation["verdict"], string> = {
  strong_buy: "bg-success/15 text-success",
  buy: "bg-success/15 text-success",
  neutral: "bg-muted text-muted-foreground",
  caution: "bg-destructive/10 text-destructive",
  avoid: "bg-destructive/15 text-destructive",
};

type Status = "idle" | "loading" | "error" | "success";

export function AIRecommendationCard({
  dealId,
  property,
  investmentInputs,
  analysisResult,
  simulationSummary,
  initialRecommendation = null,
  onRecommendationChange,
}: {
  dealId: string;
  property: PropertyData;
  investmentInputs: InvestmentInputs;
  analysisResult: AnalysisResult;
  simulationSummary?: { profit: PercentileSummary; irr: PercentileSummary };
  /** Already generated for this deal (at creation time) — shown immediately, no fetch needed. */
  initialRecommendation?: AIRecommendation | null;
  /** Called after a successful "Regenerate", so the caller can persist it back onto the deal. */
  onRecommendationChange?: (recommendation: AIRecommendation) => void;
}) {
  const [status, setStatus] = useState<Status>(initialRecommendation ? "success" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(initialRecommendation);

  async function handleRequest() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          property: {
            address: property.address,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFootage: property.squareFootage,
            yearBuilt: property.yearBuilt,
          },
          investmentInputs: {
            purchasePrice: investmentInputs.purchasePrice,
            downPaymentPct: investmentInputs.downPaymentPct,
            interestRatePct: investmentInputs.interestRatePct,
            loanTermYears: investmentInputs.loanTermYears,
            monthlyRent: investmentInputs.monthlyRent,
            holdingPeriodYears: investmentInputs.holdingPeriodYears,
            appreciationPct: investmentInputs.appreciationPct,
            rentGrowthPct: investmentInputs.rentGrowthPct,
            vacancyPct: investmentInputs.vacancyPct,
          },
          analysisResult: {
            monthlyCashFlowYear1: analysisResult.monthlyCashFlowYear1,
            capRate: analysisResult.capRate,
            cashOnCash: analysisResult.cashOnCash,
            irr: analysisResult.irr,
            totalProfit: analysisResult.totalProfit,
          },
          simulationSummary,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorMessage(body.message ?? "Couldn't generate a recommendation.");
        setStatus("error");
        return;
      }

      setRecommendation(body.recommendation);
      setStatus("success");
      onRecommendationChange?.(body.recommendation);
    } catch {
      setErrorMessage("Couldn't reach the server. Try again.");
      setStatus("error");
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">AI interpretation</CardTitle>
        <Button size="sm" variant={recommendation ? "outline" : "default"} onClick={handleRequest} disabled={status === "loading"}>
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {status === "loading" ? "Thinking…" : recommendation ? "Regenerate" : "Get AI interpretation"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === "idle" && (
          <p className="text-sm text-muted-foreground">
            Ask Claude for a short, grounded read on this deal based on the numbers above.
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        {recommendation && (
          <>
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                VERDICT_TONE[recommendation.verdict]
              )}
            >
              {VERDICT_LABEL[recommendation.verdict]}
            </span>
            <p className="text-sm text-muted-foreground">{recommendation.interpretation}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
