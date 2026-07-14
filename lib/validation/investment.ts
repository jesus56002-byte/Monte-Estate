import { z } from "zod";
import type { InvestmentInputs } from "@/lib/finance/types";

/**
 * The form works in whole-number percents (20 for 20%) since that's what
 * people naturally type; the calculation engine works in fractions (0.20).
 */
export const investmentInputsFormSchema = z.object({
  purchasePrice: z.number().positive("Purchase price must be greater than 0."),
  downPaymentPercent: z.number().min(0).max(100),
  interestRatePercent: z.number().min(0).max(25),
  loanTermYears: z.number().int().min(1).max(40),
  closingCosts: z.number().min(0),
  monthlyRent: z.number().min(0),
  propertyTaxAnnual: z.number().min(0),
  insuranceAnnual: z.number().min(0),
  hoaMonthly: z.number().min(0),
  maintenancePercent: z.number().min(0).max(100),
  vacancyPercent: z.number().min(0).max(100),
  propertyManagementPercent: z.number().min(0).max(100),
  appreciationPercent: z.number().min(-20).max(30),
  rentGrowthPercent: z.number().min(-20).max(30),
  holdingPeriodYears: z.number().int().min(1).max(40),
  sellingCostPercent: z.number().min(0).max(20),
});

export type InvestmentInputsFormValues = z.infer<typeof investmentInputsFormSchema>;

export function toInvestmentInputs(form: InvestmentInputsFormValues): InvestmentInputs {
  return {
    purchasePrice: form.purchasePrice,
    downPaymentPct: form.downPaymentPercent / 100,
    interestRatePct: form.interestRatePercent / 100,
    loanTermYears: form.loanTermYears,
    closingCosts: form.closingCosts,
    monthlyRent: form.monthlyRent,
    propertyTaxAnnual: form.propertyTaxAnnual,
    insuranceAnnual: form.insuranceAnnual,
    hoaMonthly: form.hoaMonthly,
    maintenancePct: form.maintenancePercent / 100,
    vacancyPct: form.vacancyPercent / 100,
    propertyManagementPct: form.propertyManagementPercent / 100,
    appreciationPct: form.appreciationPercent / 100,
    rentGrowthPct: form.rentGrowthPercent / 100,
    holdingPeriodYears: form.holdingPeriodYears,
    sellingCostPct: form.sellingCostPercent / 100,
  };
}
