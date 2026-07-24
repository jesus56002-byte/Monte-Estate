import { describe, expect, it } from "vitest";
import { analysesRemaining, effectiveBonusAnalyses, isPlanId } from "./plans";

describe("isPlanId", () => {
  it.each(["free", "starter", "investor"])("accepts %s", (value) => {
    expect(isPlanId(value)).toBe(true);
  });

  it("rejects an unknown value", () => {
    expect(isPlanId("enterprise")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(isPlanId(null)).toBe(false);
    expect(isPlanId(undefined)).toBe(false);
  });
});

describe("analysesRemaining", () => {
  it("counts down from the free plan's lifetime cap of 3", () => {
    expect(analysesRemaining("free", 0, 0)).toBe(3);
    expect(analysesRemaining("free", 2, 0)).toBe(1);
    expect(analysesRemaining("free", 3, 0)).toBe(0);
  });

  it("never goes negative when usage exceeds the limit", () => {
    expect(analysesRemaining("free", 5, 0)).toBe(0);
  });

  it("adds bonus (top-up) analyses on top of the plan limit", () => {
    expect(analysesRemaining("starter", 20, 10)).toBe(10);
    expect(analysesRemaining("starter", 15, 10)).toBe(15);
  });

  it("uses the investor plan's higher limit", () => {
    expect(analysesRemaining("investor", 0, 0)).toBe(60);
  });
});

describe("effectiveBonusAnalyses", () => {
  it("returns 0 when no bonus credits have ever been purchased", () => {
    expect(effectiveBonusAnalyses(0, null)).toBe(0);
  });

  it("returns the stored count when the expiration is in the future", () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(effectiveBonusAnalyses(7, future)).toBe(7);
  });

  it("returns 0 once the expiration has passed, even if the raw count is still positive", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(effectiveBonusAnalyses(7, past)).toBe(0);
  });

  it("never goes negative", () => {
    const future = new Date(Date.now() + 1000).toISOString();
    expect(effectiveBonusAnalyses(-3, future)).toBe(0);
  });
});
