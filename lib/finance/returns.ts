export function capRate(noiAnnual: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  return noiAnnual / purchasePrice;
}

export function totalCashInvested(downPayment: number, closingCosts: number): number {
  return downPayment + closingCosts;
}

export function cashOnCash(annualPreTaxCashFlow: number, totalCashInvestedAmount: number): number {
  if (totalCashInvestedAmount <= 0) return 0;
  return annualPreTaxCashFlow / totalCashInvestedAmount;
}

export function terminalSaleValue(
  purchasePrice: number,
  appreciationPct: number,
  holdingYears: number,
  sellingCostPct: number,
  remainingLoanBalance: number
): { grossSalePrice: number; netSaleProceeds: number } {
  const grossSalePrice = purchasePrice * Math.pow(1 + appreciationPct, holdingYears);
  const sellingCosts = grossSalePrice * sellingCostPct;
  const netSaleProceeds = grossSalePrice - sellingCosts - remainingLoanBalance;
  return { grossSalePrice, netSaleProceeds };
}

export function totalProfit(
  cumulativeCashFlow: number,
  netSaleProceeds: number,
  totalCashInvestedAmount: number
): number {
  return cumulativeCashFlow + netSaleProceeds - totalCashInvestedAmount;
}
