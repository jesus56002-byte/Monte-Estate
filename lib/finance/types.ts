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
  /** Sum of every scheduled P&I payment over the full loan term (e.g. 360 payments on a 30-year loan) — not capped to the holding period. */
  totalOfPayments: number;
  /** totalOfPayments minus the original loan amount. */
  totalInterestPaid: number;
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
