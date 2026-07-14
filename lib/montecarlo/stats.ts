export interface PercentileSummary {
  p5: number;
  p50: number;
  p95: number;
  mean: number;
  stdDev: number;
  /** Fraction of trials with a negative outcome (only meaningful for profit, not IRR). */
  probabilityOfLoss: number;
}

function percentileOf(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const index = Math.ceil(p * (sorted.length - 1));
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

export function computePercentileSummary(values: ArrayLike<number>): PercentileSummary {
  const clean = Array.from(values).filter((v) => Number.isFinite(v));
  if (clean.length === 0) {
    return { p5: NaN, p50: NaN, p95: NaN, mean: NaN, stdDev: NaN, probabilityOfLoss: NaN };
  }

  const sorted = [...clean].sort((a, b) => a - b);
  const mean = clean.reduce((sum, v) => sum + v, 0) / clean.length;
  const variance = clean.reduce((sum, v) => sum + (v - mean) ** 2, 0) / clean.length;
  const lossCount = clean.filter((v) => v < 0).length;

  return {
    p5: percentileOf(sorted, 0.05),
    p50: percentileOf(sorted, 0.5),
    p95: percentileOf(sorted, 0.95),
    mean,
    stdDev: Math.sqrt(variance),
    probabilityOfLoss: lossCount / clean.length,
  };
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  midpoint: number;
  count: number;
  /** Fitted normal-distribution density at the bin midpoint, scaled to match bar heights. */
  normalFit: number;
}

/**
 * Bins values into `binCount` buckets spanning the 1st-99th percentile range,
 * so a handful of extreme outlier trials don't compress the visible
 * distribution. Overlays a fitted normal curve (scaled by n * binWidth) so it
 * lines up with the histogram bar heights.
 */
export function computeHistogram(values: ArrayLike<number>, binCount = 44): HistogramBin[] {
  const clean = Array.from(values).filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (clean.length === 0) return [];

  const lo = percentileOf(clean, 0.01);
  const hi = percentileOf(clean, 0.99);
  const span = hi - lo;
  const binWidth = span > 0 ? span / binCount : 1;

  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    binStart: lo + i * binWidth,
    binEnd: lo + (i + 1) * binWidth,
    midpoint: lo + (i + 0.5) * binWidth,
    count: 0,
    normalFit: 0,
  }));

  for (const v of clean) {
    if (v < lo || v > hi) continue;
    const index = Math.min(binCount - 1, Math.floor((v - lo) / binWidth));
    bins[index].count += 1;
  }

  const mean = clean.reduce((sum, v) => sum + v, 0) / clean.length;
  const stdDev = Math.sqrt(clean.reduce((sum, v) => sum + (v - mean) ** 2, 0) / clean.length);
  const n = clean.length;

  if (stdDev > 0) {
    for (const bin of bins) {
      const z = (bin.midpoint - mean) / stdDev;
      const density = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
      bin.normalFit = density * n * binWidth;
    }
  }

  return bins;
}
