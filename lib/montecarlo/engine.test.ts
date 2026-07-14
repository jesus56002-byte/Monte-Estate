import { describe, expect, it } from "vitest";
import { buildDefaultSimulationConfig, runSimulation } from "./engine";
import { computePercentileSummary } from "./stats";
import type { InvestmentInputs } from "@/lib/finance/types";

const baseInputs: InvestmentInputs = {
  purchasePrice: 200_000,
  downPaymentPct: 0.2,
  interestRatePct: 0.06,
  loanTermYears: 30,
  closingCosts: 5_000,
  monthlyRent: 2_000,
  propertyTaxAnnual: 2_400,
  insuranceAnnual: 1_200,
  hoaMonthly: 0,
  maintenancePct: 0.05,
  vacancyPct: 0.05,
  propertyManagementPct: 0.08,
  appreciationPct: 0.03,
  rentGrowthPct: 0.02,
  holdingPeriodYears: 10,
  sellingCostPct: 0.06,
};

describe("runSimulation", () => {
  it("produces the requested number of trials", () => {
    const config = buildDefaultSimulationConfig(baseInputs, 1);
    const results = runSimulation(baseInputs, { ...config, trials: 2_000 });
    expect(results.irr).toHaveLength(2_000);
    expect(results.totalProfit).toHaveLength(2_000);
  });

  it("is deterministic for a fixed seed", () => {
    const config = buildDefaultSimulationConfig(baseInputs, 123);
    const a = runSimulation(baseInputs, { ...config, trials: 500 });
    const b = runSimulation(baseInputs, { ...config, trials: 500 });
    expect(Array.from(a.totalProfit)).toEqual(Array.from(b.totalProfit));
  });

  it("produces a spread of outcomes with p5 < p50 < p95", () => {
    const config = buildDefaultSimulationConfig(baseInputs, 99);
    const results = runSimulation(baseInputs, { ...config, trials: 5_000 });
    const summary = computePercentileSummary(results.totalProfit);
    expect(summary.p5).toBeLessThan(summary.p50);
    expect(summary.p50).toBeLessThan(summary.p95);
  });

  it("widening a variable's stdDev widens the outcome distribution", () => {
    const narrow = buildDefaultSimulationConfig(baseInputs, 5);
    narrow.appreciation.stdDev = 0.005;
    const wide = buildDefaultSimulationConfig(baseInputs, 5);
    wide.appreciation.stdDev = 0.08;

    const narrowResults = runSimulation(baseInputs, { ...narrow, trials: 5_000 });
    const wideResults = runSimulation(baseInputs, { ...wide, trials: 5_000 });

    const narrowSummary = computePercentileSummary(narrowResults.totalProfit);
    const wideSummary = computePercentileSummary(wideResults.totalProfit);

    expect(wideSummary.stdDev).toBeGreaterThan(narrowSummary.stdDev);
  });

  it("runs 10,000 trials well under a second (closed-form mortgage math keeps trials cheap)", () => {
    const config = buildDefaultSimulationConfig(baseInputs, 42);
    const start = performance.now();
    runSimulation(baseInputs, config);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });
});
