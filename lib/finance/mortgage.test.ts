import { describe, expect, it } from "vitest";
import { mortgagePayment, remainingBalance } from "./mortgage";

describe("mortgagePayment", () => {
  it("divides principal evenly at 0% interest", () => {
    // $120,000 over 10 years at 0% = $1,000/mo, exactly.
    expect(mortgagePayment(120_000, 0, 10)).toBeCloseTo(1000, 6);
  });

  it("matches the standard amortization formula for a textbook example", () => {
    // $200,000 at 6% APR over 30 years is a commonly-cited reference value.
    expect(mortgagePayment(200_000, 0.06, 30)).toBeCloseTo(1199.1, 0);
  });

  it("scales linearly with principal", () => {
    const base = mortgagePayment(100_000, 0.05, 30);
    const doubled = mortgagePayment(200_000, 0.05, 30);
    expect(doubled).toBeCloseTo(base * 2, 6);
  });

  it("returns 0 for a fully cash purchase", () => {
    expect(mortgagePayment(0, 0.06, 30)).toBe(0);
  });
});

describe("remainingBalance", () => {
  it("equals principal at month 0", () => {
    expect(remainingBalance(200_000, 0.06, 30, 0)).toBeCloseTo(200_000, 6);
  });

  it("reaches 0 at the final payment", () => {
    expect(remainingBalance(200_000, 0.06, 30, 360)).toBeCloseTo(0, 6);
  });

  it("declines linearly at 0% interest", () => {
    // $120,000 over 10 years (120 months) at 0%: halfway through, half is paid off.
    expect(remainingBalance(120_000, 0, 10, 60)).toBeCloseTo(60_000, 6);
  });
});
