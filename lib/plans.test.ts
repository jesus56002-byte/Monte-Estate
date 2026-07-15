import { describe, expect, it } from "vitest";
import { analysesRemaining, isPlanId } from "./plans";

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
