"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeHistogram } from "@/components/montecarlo/OutcomeHistogram";
import { PercentileSummary } from "@/components/montecarlo/PercentileSummary";
import { buildDefaultSimulationConfig } from "@/lib/montecarlo/engine";
import { computeHistogram, computePercentileSummary } from "@/lib/montecarlo/stats";
import { useMonteCarlo } from "@/lib/montecarlo/useMonteCarlo";
import type { InvestmentInputs } from "@/lib/finance/types";

export function MonteCarloPanel({ baseInputs }: { baseInputs: InvestmentInputs }) {
  const { status, progress, results, error, run } = useMonteCarlo();

  const profitSummary = useMemo(
    () => (results ? computePercentileSummary(results.totalProfit) : null),
    [results]
  );
  const irrSummary = useMemo(() => (results ? computePercentileSummary(results.irr) : null), [results]);
  const histogramBins = useMemo(
    () => (results ? computeHistogram(results.totalProfit, 44) : []),
    [results]
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Monte Carlo simulation</CardTitle>
        <Button
          size="sm"
          onClick={() => run(baseInputs, buildDefaultSimulationConfig(baseInputs))}
          disabled={status === "running"}
        >
          {status === "running" ? "Running…" : "Run 10,000 simulations"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {status === "idle" && (
          <p className="text-sm text-muted-foreground">
            Randomizes appreciation, rent growth, and vacancy across 10,000 trials to show the
            range of outcomes, not just the single-point estimate above.
          </p>
        )}

        {status === "running" && (
          <div className="flex w-full flex-col gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{
                  width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {progress.completed.toLocaleString()} / {progress.total.toLocaleString()} trials
            </p>
          </div>
        )}

        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {status === "done" && profitSummary && irrSummary && (
          <>
            <PercentileSummary profit={profitSummary} irr={irrSummary} />
            <OutcomeHistogram bins={histogramBins} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
