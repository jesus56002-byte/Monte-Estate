/** All rate/percentage fields are fractions (0.20, not 20). */
export interface InvestmentInputs {
  purchasePrice: number;
  downPaymentPct: number;
  interestRatePct: number;
  loanTermYears: number;
  closingCosts: number;
  monthlyRent: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  maintenancePct: number;
  vacancyPct: number;
  propertyManagementPct: number;
  appreciationPct: number;
  rentGrowthPct: number;
  holdingPeriodYears: number;
  sellingCostPct: number;
}

export interface AnalysisResult {
  loanAmount: number;
  downPayment: number;
  monthlyMortgagePayment: number;
  totalCashInvested: number;

  noiYear1: number;
  capRate: number;
  monthlyCashFlowYear1: number;
  annualCashFlowYear1: number;
  cashOnCash: number;

  /** Pre-tax cash flow for each year of the holding period, index 0 = year 1. */
  annualCashFlows: number[];

  remainingLoanBalanceAtExit: number;
  grossSalePrice: number;
  netSaleProceeds: number;

  totalProfit: number;
  irr: number;
}
