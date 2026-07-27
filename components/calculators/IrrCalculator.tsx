"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { irr } from "@/lib/finance/irr";
import { formatPercent } from "@/lib/utils/format";
import { CalculatorField, CalculatorResult } from "@/components/calculators/shared";

export function IrrCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(66_000);
  const [annualCashFlow, setAnnualCashFlow] = useState(3_600);
  const [holdingPeriodYears, setHoldingPeriodYears] = useState(5);
  const [netSaleProceeds, setNetSaleProceeds] = useState(90_000);

  const cashflows = [
    -initialInvestment,
    ...Array(Math.max(0, holdingPeriodYears - 1)).fill(annualCashFlow),
    annualCashFlow + netSaleProceeds,
  ];
  const rate = irr(cashflows);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">IRR Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CalculatorField
          id="initialInvestment"
          label="Initial investment"
          suffix="$"
          value={initialInvestment}
          onChange={setInitialInvestment}
        />
        <CalculatorField
          id="annualCashFlow"
          label="Annual cash flow"
          suffix="$/yr"
          value={annualCashFlow}
          onChange={setAnnualCashFlow}
        />
        <CalculatorField
          id="holdingPeriodYears"
          label="Holding period"
          suffix="yrs"
          value={holdingPeriodYears}
          onChange={setHoldingPeriodYears}
        />
        <CalculatorField
          id="netSaleProceeds"
          label="Net proceeds at sale"
          suffix="$"
          value={netSaleProceeds}
          onChange={setNetSaleProceeds}
        />

        <div className="pt-2">
          <CalculatorResult
            label="IRR"
            value={Number.isNaN(rate) ? "—" : formatPercent(rate)}
            tone={rate >= 0 ? "positive" : "negative"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
