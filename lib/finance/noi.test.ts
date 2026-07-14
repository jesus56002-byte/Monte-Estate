import { describe, expect, it } from "vitest";
import { effectiveGrossIncome, noi } from "./noi";

describe("effectiveGrossIncome", () => {
  it("subtracts vacancy loss from gross scheduled rent", () => {
    expect(effectiveGrossIncome(24_000, 0.05)).toBeCloseTo(22_800, 6);
  });

  it("returns full rent at 0% vacancy", () => {
    expect(effectiveGrossIncome(24_000, 0)).toBe(24_000);
  });
});

describe("noi", () => {
  it("subtracts operating expenses from effective gross income", () => {
    expect(noi(22_800, 10_000)).toBe(12_800);
  });

  it("can be negative when expenses exceed income", () => {
    expect(noi(10_000, 15_000)).toBe(-5_000);
  });
});
