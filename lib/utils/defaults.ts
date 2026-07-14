import type { PropertyData } from "@/types/property";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";

/** Sensible starting assumptions, pre-filled from the fetched property data. */
export function deriveDefaultInputs(property: PropertyData): InvestmentInputsFormValues {
  const purchasePrice = property.estimatedValue ?? 300_000;
  const monthlyRent = property.estimatedRent ?? Math.round((purchasePrice * 0.008) / 10) * 10;

  return {
    purchasePrice,
    downPaymentPercent: 20,
    interestRatePercent: 7,
    loanTermYears: 30,
    closingCosts: Math.round(purchasePrice * 0.02),
    monthlyRent,
    propertyTaxAnnual: Math.round(purchasePrice * 0.011),
    insuranceAnnual: Math.round(purchasePrice * 0.0035),
    hoaMonthly: property.hoaFeeMonthly ?? 0,
    maintenancePercent: 5,
    vacancyPercent: 5,
    propertyManagementPercent: 8,
    appreciationPercent: 3,
    rentGrowthPercent: 3,
    holdingPeriodYears: 10,
    sellingCostPercent: 7,
  };
}
