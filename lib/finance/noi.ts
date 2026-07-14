/** Gross scheduled rent less vacancy loss. */
export function effectiveGrossIncome(grossScheduledRentAnnual: number, vacancyPct: number): number {
  return grossScheduledRentAnnual * (1 - vacancyPct);
}

/** Net operating income: effective gross income less operating expenses. Excludes debt service. */
export function noi(effectiveGrossIncomeAnnual: number, operatingExpensesAnnual: number): number {
  return effectiveGrossIncomeAnnual - operatingExpensesAnnual;
}
