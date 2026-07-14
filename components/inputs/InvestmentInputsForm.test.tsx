import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InvestmentInputsForm } from "./InvestmentInputsForm";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";

const defaultValues: InvestmentInputsFormValues = {
  purchasePrice: 200_000,
  downPaymentPercent: 20,
  interestRatePercent: 7,
  loanTermYears: 30,
  closingCosts: 4_000,
  monthlyRent: 2_000,
  propertyTaxAnnual: 2_200,
  insuranceAnnual: 1_200,
  hoaMonthly: 0,
  maintenancePercent: 5,
  vacancyPercent: 5,
  propertyManagementPercent: 8,
  appreciationPercent: 3,
  rentGrowthPercent: 3,
  holdingPeriodYears: 10,
  sellingCostPercent: 7,
};

describe("InvestmentInputsForm", () => {
  it("calls onChange with the initial values on mount", async () => {
    const onChange = vi.fn();
    render(<InvestmentInputsForm defaultValues={defaultValues} onChange={onChange} />);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 200_000 }));
    });
  });

  it("propagates edits to onChange with the new value", async () => {
    const onChange = vi.fn();
    render(<InvestmentInputsForm defaultValues={defaultValues} onChange={onChange} />);

    const purchasePriceInput = screen.getByLabelText("Purchase price");
    fireEvent.change(purchasePriceInput, { target: { value: "250000" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ purchasePrice: 250_000 }));
    });
  });
});
