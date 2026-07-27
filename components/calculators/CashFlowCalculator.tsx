"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mortgagePayment } from "@/lib/finance/mortgage";
import { formatCurrency } from "@/lib/utils/format";
import { CalculatorField, CalculatorResult } from "@/components/calculators/shared";

export function CashFlowCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(300_000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(7);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [monthlyRent, setMonthlyRent] = useState(2_500);
  const [monthlyExpenses, setMonthlyExpenses] = useState(600);

  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const monthlyMortgage = mortgagePayment(loanAmount, interestRatePct / 100, loanTermYears);
  const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgage;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Cash Flow Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <CalculatorField
            id="purchasePrice"
            label="Purchase price"
            suffix="$"
            value={purchasePrice}
            onChange={setPurchasePrice}
          />
          <CalculatorField
            id="downPaymentPct"
            label="Down payment"
            suffix="%"
            step="0.5"
            value={downPaymentPct}
            onChange={setDownPaymentPct}
          />
          <CalculatorField
            id="interestRatePct"
            label="Interest rate"
            suffix="%"
            step="0.125"
            value={interestRatePct}
            onChange={setInterestRatePct}
          />
          <CalculatorField
            id="loanTermYears"
            label="Loan term"
            suffix="yrs"
            value={loanTermYears}
            onChange={setLoanTermYears}
          />
        </div>
        <CalculatorField
          id="monthlyRent"
          label="Monthly rent"
          suffix="$"
          value={monthlyRent}
          onChange={setMonthlyRent}
        />
        <CalculatorField
          id="monthlyExpenses"
          label="Monthly operating expenses"
          suffix="$"
          value={monthlyExpenses}
          onChange={setMonthlyExpenses}
        />

        <div className="flex flex-col gap-3 pt-2">
          <CalculatorResult
            label="Monthly cash flow"
            value={formatCurrency(monthlyCashFlow)}
            tone={monthlyCashFlow >= 0 ? "positive" : "negative"}
          />
          <CalculatorResult label="Monthly mortgage (P&I)" value={formatCurrency(monthlyMortgage)} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
