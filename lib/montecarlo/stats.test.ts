import { describe, expect, it } from "vitest";
import { computeHistogram, computePercentileSummary } from "./stats";

describe("computePercentileSummary", () => {
  it("computes p5 < p50 < p95 for a spread-out sample", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i);
    const summary = computePercentileSummary(values);
    expect(summary.p5).toBeLessThan(summary.p50);
    expect(summary.p50).toBeLessThan(summary.p95);
  });

  it("computes mean and stdDev exactly for a known small sample", () => {
    // mean of [2,4,4,4,5,5,7,9] = 5, population stdDev = 2
    const summary = computePercentileSummary([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(summary.mean).toBeCloseTo(5, 6);
    expect(summary.stdDev).toBeCloseTo(2, 6);
  });

  it("computes probabilityOfLoss as the fraction of negative values", () => {
    const summary = computePercentileSummary([-10, -5, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(summary.probabilityOfLoss).toBeCloseTo(0.2, 6);
  });

  it("ignores non-finite values", () => {
    const summary = computePercentileSummary([1, 2, NaN, 3, Infinity]);
    expect(summary.mean).toBeCloseTo(2, 6);
  });
});

describe("computeHistogram", () => {
  it("returns bins that sum to at most the input length", () => {
    const values = Array.from({ length: 5000 }, (_, i) => Math.sin(i) * 100);
    const bins = computeHistogram(values, 40);
    expect(bins).toHaveLength(40);
    const total = bins.reduce((sum, b) => sum + b.count, 0);
    expect(total).toBeLessThanOrEqual(5000);
    expect(total).toBeGreaterThan(4000); // only the outer 1% tails on each side are clipped
  });

  it("produces contiguous, increasing bin ranges", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i);
    const bins = computeHistogram(values, 10);
    for (let i = 1; i < bins.length; i++) {
      expect(bins[i].binStart).toBeCloseTo(bins[i - 1].binEnd, 6);
    }
  });

  it("returns an empty array for no data", () => {
    expect(computeHistogram([])).toEqual([]);
  });
});
