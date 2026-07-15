"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeHistogram } from "@/components/montecarlo/OutcomeHistogram";
import { PercentileSummary } from "@/components/montecarlo/PercentileSummary";
import { buildDefaultSimulationConfig } from "@/lib/montecarlo/engine";
import { computeHistogram, computePercentileSummary, type PercentileSummary as PercentileSummaryData } from "@/lib/montecarlo/stats";
import { useMonteCarlo } from "@/lib/montecarlo/useMonteCarlo";
import type { InvestmentInputs } from "@/lib/finance/types";
import type { SimulationSummary } from "@/types/deal";

export function MonteCarloPanel({
  baseInputs,
  autoRun = false,
  initialSummary = null,
  onSummaryChange,
}: {
  baseInputs: InvestmentInputs;
  /** Kick off the first run automatically instead of waiting for a click — free/instant, so safe to do on every load. */
  autoRun?: boolean;
  /** Last-persisted summary for this deal, shown immediately while a fresh run (re)computes in the background. */
  initialSummary?: SimulationSummary | null;
  onSummaryChange?: (summary: { profit: PercentileSummaryData; irr: PercentileSummaryData } | null) => void;
}) {
  const { status, progress, results, error, run, reset } = useMonteCarlo();

  const profitSummary = useMemo(
    () => (results ? computePercentileSummary(results.totalProfit) : null),
    [results]
  );
  const irrSummary = useMemo(() => (results ? computePercentileSummary(results.irr) : null), [results]);
  const histogramBins = useMemo(
    () => (results ? computeHistogram(results.totalProfit, 44) : []),
    [results]
  );

  useEffect(() => {
    onSummaryChange?.(profitSummary && irrSummary ? { profit: profitSummary, irr: irrSummary } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profitSummary, irrSummary]);

  // Any completed (or in-flight) simulation was computed against the previous
  // baseInputs — once the user edits an assumption, that result no longer
  // describes this deal, so drop it rather than let it silently go stale.
  const baseInputsKey = JSON.stringify(baseInputs);
  const lastKeyRef = useRef(baseInputsKey);
  useEffect(() => {
    if (lastKeyRef.current !== baseInputsKey) {
      lastKeyRef.current = baseInputsKey;
      if (status !== "idle") reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseInputsKey]);

  // Cheap and client-only, so it's safe to run on every mount — this is what
  // makes the simulation feel "always there" instead of requiring a click
  // each time the deal is opened.
  const hasAutoRun = useRef(false);
  useEffect(() => {
    if (autoRun && !hasAutoRun.current) {
      hasAutoRun.current = true;
      run(baseInputs, buildDefaultSimulationConfig(baseInputs));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showingFreshResults = status === "done" && profitSummary && irrSummary;
  const showingPersistedSummary = (status === "idle" || status === "running") && initialSummary && !results;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Monte Carlo simulation</CardTitle>
        <Button
          size="sm"
          onClick={() => run(baseInputs, buildDefaultSimulationConfig(baseInputs))}
          disabled={status === "running"}
        >
          {status === "running" ? "Running…" : "Re-run 10,000 simulations"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {status === "idle" && !initialSummary && (
          <p className="text-sm text-muted-foreground">
            Randomizes appreciation, rent growth, and vacancy across 10,000 trials to show the
            range of outcomes, not just the single-point estimate above.
          </p>
        )}

        {showingPersistedSummary && (
          <>
            <PercentileSummary profit={initialSummary.profit} irr={initialSummary.irr} />
            <p className="text-center text-xs text-muted-foreground">
              {status === "running" ? "Recalculating a fresh simulation…" : "From your last run."}
            </p>
          </>
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

        {showingFreshResults && (
          <>
            <PercentileSummary profit={profitSummary} irr={irrSummary} />
            <OutcomeHistogram bins={histogramBins} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
