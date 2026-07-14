import { describe, expect, it } from "vitest";
import { capRate, cashOnCash, terminalSaleValue, totalCashInvested, totalProfit } from "./returns";

describe("capRate", () => {
  it("divides NOI by purchase price", () => {
    expect(capRate(12_000, 200_000)).toBeCloseTo(0.06, 6);
  });

  it("returns 0 for a non-positive purchase price instead of NaN/Infinity", () => {
    expect(capRate(12_000, 0)).toBe(0);
  });
});

describe("totalCashInvested", () => {
  it("sums down payment and closing costs", () => {
    expect(totalCashInvested(40_000, 5_000)).toBe(45_000);
  });
});

describe("cashOnCash", () => {
  it("divides annual cash flow by total cash invested", () => {
    expect(cashOnCash(6_000, 50_000)).toBeCloseTo(0.12, 6);
  });

  it("returns 0 for a non-positive cash investment instead of NaN/Infinity", () => {
    expect(cashOnCash(6_000, 0)).toBe(0);
  });
});

describe("terminalSaleValue", () => {
  it("compounds appreciation, then nets out selling costs and the loan balance", () => {
    // 200,000 * 1.03^10 = 268,783.28 (standard compounding reference value)
    const { grossSalePrice, netSaleProceeds } = terminalSaleValue(200_000, 0.03, 10, 0.06, 100_000);
    expect(grossSalePrice).toBeCloseTo(268_783.28, 1);
    // netSaleProceeds = grossSalePrice - 6% selling costs - remaining loan balance
    expect(netSaleProceeds).toBeCloseTo(268_783.28 - 268_783.28 * 0.06 - 100_000, 1);
  });
});

describe("totalProfit", () => {
  it("sums cumulative cash flow and net sale proceeds, minus cash invested", () => {
    expect(totalProfit(50_000, 150_000, 100_000)).toBe(100_000);
  });
});
