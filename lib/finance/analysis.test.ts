import { describe, expect, it } from "vitest";
import { runAnalysis } from "./analysis";
import type { InvestmentInputs } from "./types";

function baseInputs(overrides: Partial<InvestmentInputs> = {}): InvestmentInputs {
  return {
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
    holdingPeriodYears: 5,
    sellingCostPct: 0.06,
    ...overrides,
  };
}

describe("runAnalysis", () => {
  it("computes internally consistent year-1 figures", () => {
    const result = runAnalysis(baseInputs());

    expect(result.loanAmount).toBeCloseTo(160_000, 6);
    expect(result.downPayment).toBeCloseTo(40_000, 6);
    expect(result.totalCashInvested).toBeCloseTo(45_000, 6);
    expect(result.monthlyCashFlowYear1 * 12).toBeCloseTo(result.annualCashFlowYear1, 6);
    expect(result.capRate).toBeCloseTo(result.noiYear1 / 200_000, 6);
    expect(result.cashOnCash).toBeCloseTo(result.annualCashFlowYear1 / 45_000, 6);
    expect(result.annualCashFlows).toHaveLength(5);
  });

  it("produces a lower cap rate at a higher purchase price for the same NOI-driving inputs", () => {
    const cheap = runAnalysis(baseInputs({ purchasePrice: 200_000 }));
    const expensive = runAnalysis(baseInputs({ purchasePrice: 400_000 }));
    expect(expensive.capRate).toBeLessThan(cheap.capRate);
  });

  it("produces a higher cash-on-cash return with less cash invested (more leverage)", () => {
    const lowLeverage = runAnalysis(baseInputs({ downPaymentPct: 0.5 }));
    const highLeverage = runAnalysis(baseInputs({ downPaymentPct: 0.1 }));
    expect(highLeverage.cashOnCash).toBeGreaterThan(lowLeverage.cashOnCash);
  });

  it("returns a positive IRR for a profitable, appreciating deal", () => {
    const result = runAnalysis(baseInputs({ appreciationPct: 0.05, rentGrowthPct: 0.03 }));
    expect(result.irr).toBeGreaterThan(0);
  });

  it("returns a lower IRR when appreciation is removed", () => {
    const withAppreciation = runAnalysis(baseInputs({ appreciationPct: 0.05 }));
    const flat = runAnalysis(baseInputs({ appreciationPct: 0 }));
    expect(flat.irr).toBeLessThan(withAppreciation.irr);
  });

  it("nets the remaining loan balance out of the sale proceeds", () => {
    const result = runAnalysis(baseInputs({ holdingPeriodYears: 30 }));
    // A 30-year holding period exhausts a 30-year loan, so nothing is owed at exit.
    expect(result.remainingLoanBalanceAtExit).toBeCloseTo(0, 2);
  });
});
