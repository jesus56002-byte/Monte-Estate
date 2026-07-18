import type { PropertyData } from "@/types/property";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";

/** A user's saved Settings > Defaults overrides — all optional, since a signed-out or never-configured caller has none. */
export interface DefaultInputOverrides {
  appreciationPct?: number;
  vacancyPct?: number;
  maintenancePct?: number;
  closingCostPct?: number;
  insurancePct?: number;
}

/** Sensible starting assumptions, pre-filled from the fetched property data and any saved user defaults. */
export function deriveDefaultInputs(
  property: PropertyData,
  overrides: DefaultInputOverrides = {}
): InvestmentInputsFormValues {
  const purchasePrice = property.estimatedValue ?? 300_000;
  const monthlyRent = property.estimatedRent ?? Math.round((purchasePrice * 0.008) / 10) * 10;

  return {
    purchasePrice,
    downPaymentPercent: 20,
    interestRatePercent: 7,
    loanTermYears: 30,
    closingCosts: Math.round(purchasePrice * ((overrides.closingCostPct ?? 2) / 100)),
    monthlyRent,
    propertyTaxAnnual: Math.round(purchasePrice * 0.011),
    insuranceAnnual: Math.round(purchasePrice * ((overrides.insurancePct ?? 0.35) / 100)),
    hoaMonthly: property.hoaFeeMonthly ?? 0,
    maintenancePercent: overrides.maintenancePct ?? 5,
    vacancyPercent: overrides.vacancyPct ?? 5,
    propertyManagementPercent: 8,
    appreciationPercent: overrides.appreciationPct ?? 3,
    rentGrowthPercent: 3,
    holdingPeriodYears: 10,
    sellingCostPercent: 7,
  };
}
