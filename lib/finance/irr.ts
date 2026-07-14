export function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

/**
 * Annual IRR via bisection on [-0.99, 10]. This app's cashflows always have
 * exactly one sign change (an initial outlay, then a run of positive annual
 * flows), so bisection converges reliably without Newton-Raphson's risk of
 * diverging on a bad initial guess — and it's small enough to run identically
 * inside a Web Worker for Monte Carlo.
 */
export function irr(cashflows: number[]): number {
  let low = -0.99;
  let high = 10;
  let npvLow = npv(low, cashflows);
  const npvHigh = npv(high, cashflows);

  if (Number.isNaN(npvLow) || Number.isNaN(npvHigh) || npvLow * npvHigh > 0) {
    return NaN;
  }

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid, cashflows);
    if (Math.abs(npvMid) < 1e-6) return mid;

    if (npvLow < 0 === npvMid < 0) {
      low = mid;
      npvLow = npvMid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}
