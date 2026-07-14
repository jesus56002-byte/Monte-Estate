import { describe, expect, it } from "vitest";
import { irr, npv } from "./irr";

describe("npv", () => {
  it("discounts a single future cashflow correctly", () => {
    // -100 now, +110 in one year, discounted at 10% -> NPV = 0
    expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 6);
  });
});

describe("irr", () => {
  it("solves the single-period case exactly", () => {
    // -100 now, +110 in one year is a textbook 10% return.
    expect(irr([-100, 110])).toBeCloseTo(0.1, 5);
  });

  it("solves a clean multi-year compounding case", () => {
    // 100 * 1.1^3 = 133.1, so a single payout of 133.1 after 3 years is exactly 10% IRR.
    expect(irr([-100, 0, 0, 133.1])).toBeCloseTo(0.1, 4);
  });

  it("returns a negative rate for a money-losing investment", () => {
    expect(irr([-100, 50])).toBeLessThan(0);
  });

  it("returns NaN when there is no sign change in the cashflows", () => {
    expect(irr([100, 100, 100])).toBeNaN();
  });
});
