import { mortgagePayment, remainingBalance } from "@/lib/finance/mortgage";
import { effectiveGrossIncome, noi } from "@/lib/finance/noi";
import { capRate, cashOnCash, terminalSaleValue, totalCashInvested, totalProfit } from "@/lib/finance/returns";
import { irr } from "@/lib/finance/irr";
import type { AnalysisResult, InvestmentInputs } from "@/lib/finance/types";

/** Annual growth applied to property taxes and insurance; not user-editable. */
const EXPENSE_GROWTH_RATE = 0.02;

export function runAnalysis(inputs: InvestmentInputs): AnalysisResult {
  const downPayment = inputs.purchasePrice * inputs.downPaymentPct;
  const loanAmount = inputs.purchasePrice - downPayment;
  const monthlyMortgagePayment = mortgagePayment(loanAmount, inputs.interestRatePct, inputs.loanTermYears);
  const annualDebtService = monthlyMortgagePayment * 12;
  const totalCashInvestedAmount = totalCashInvested(downPayment, inputs.closingCosts);

  // Full-term figures (like a standalone mortgage calculator would show) —
  // deliberately independent of holdingPeriodYears, which only bounds the
  // investment-analysis cash flows below.
  const totalOfPayments = monthlyMortgagePayment * inputs.loanTermYears * 12;
  const totalInterestPaid = totalOfPayments - loanAmount;
  const totalMonthlyPayment =
    monthlyMortgagePayment + inputs.propertyTaxAnnual / 12 + inputs.insuranceAnnual / 12 + inputs.hoaMonthly;

  const annualCashFlows: number[] = [];
  let noiYear1 = 0;
  let totalPropertyTaxPaid = 0;

  for (let year = 1; year <= inputs.holdingPeriodYears; year++) {
    const grossScheduledRent = inputs.monthlyRent * 12 * Math.pow(1 + inputs.rentGrowthPct, year - 1);
    const egi = effectiveGrossIncome(grossScheduledRent, inputs.vacancyPct);

    const expenseGrowthFactor = Math.pow(1 + EXPENSE_GROWTH_RATE, year - 1);
    const propertyTax = inputs.propertyTaxAnnual * expenseGrowthFactor;
    const insurance = inputs.insuranceAnnual * expenseGrowthFactor;
    const hoa = inputs.hoaMonthly * 12;
    const maintenance = grossScheduledRent * inputs.maintenancePct;
    const propertyManagement = egi * inputs.propertyManagementPct;

    const operatingExpenses = propertyTax + insurance + hoa + maintenance + propertyManagement;
    const noiThisYear = noi(egi, operatingExpenses);
    if (year === 1) noiYear1 = noiThisYear;
    totalPropertyTaxPaid += propertyTax;

    annualCashFlows.push(noiThisYear - annualDebtService);
  }

  const remainingLoanBalanceAtExit = remainingBalance(
    loanAmount,
    inputs.interestRatePct,
    inputs.loanTermYears,
    inputs.holdingPeriodYears * 12
  );

  const { grossSalePrice, netSaleProceeds } = terminalSaleValue(
    inputs.purchasePrice,
    inputs.appreciationPct,
    inputs.holdingPeriodYears,
    inputs.sellingCostPct,
    remainingLoanBalanceAtExit
  );

  const cumulativeCashFlow = annualCashFlows.reduce((sum, cf) => sum + cf, 0);
  const totalProfitAmount = totalProfit(cumulativeCashFlow, netSaleProceeds, totalCashInvestedAmount);

  const irrCashflows = [
    -totalCashInvestedAmount,
    ...annualCashFlows.slice(0, -1),
    annualCashFlows[annualCashFlows.length - 1] + netSaleProceeds,
  ];

  return {
    loanAmount,
    downPayment,
    monthlyMortgagePayment,
    totalMonthlyPayment,
    totalOfPayments,
    totalInterestPaid,
    totalCashInvested: totalCashInvestedAmount,

    noiYear1,
    capRate: capRate(noiYear1, inputs.purchasePrice),
    monthlyCashFlowYear1: annualCashFlows[0] / 12,
    annualCashFlowYear1: annualCashFlows[0],
    cashOnCash: cashOnCash(annualCashFlows[0], totalCashInvestedAmount),

    annualCashFlows,
    totalPropertyTaxPaid,

    remainingLoanBalanceAtExit,
    grossSalePrice,
    netSaleProceeds,

    totalProfit: totalProfitAmount,
    irr: irr(irrCashflows),
  };
}
