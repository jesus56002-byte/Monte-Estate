/** Fixed-rate monthly payment (principal + interest) via the standard amortization formula. */
export function mortgagePayment(
  principal: number,
  annualRatePct: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRatePct / 12;
  const numPayments = termYears * 12;
  if (monthlyRate === 0) return principal / numPayments;

  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Closed-form remaining balance after `monthsElapsed` payments — O(1), no
 * amortization table needed. This matters for Monte Carlo, which calls it
 * thousands of times per simulation.
 */
export function remainingBalance(
  principal: number,
  annualRatePct: number,
  termYears: number,
  monthsElapsed: number
): number {
  if (principal <= 0) return 0;
  const numPayments = termYears * 12;
  if (monthsElapsed >= numPayments) return 0;

  const monthlyRate = annualRatePct / 12;
  if (monthlyRate === 0) return principal * (1 - monthsElapsed / numPayments);

  const factorFull = Math.pow(1 + monthlyRate, numPayments);
  const factorElapsed = Math.pow(1 + monthlyRate, monthsElapsed);
  return (principal * (factorFull - factorElapsed)) / (factorFull - 1);
}
