"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capRate } from "@/lib/finance/returns";
import { noi } from "@/lib/finance/noi";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { CalculatorField, CalculatorResult } from "@/components/calculators/shared";

export function CapRateCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(300_000);
  const [annualRent, setAnnualRent] = useState(30_000);
  const [annualExpenses, setAnnualExpenses] = useState(9_000);

  const netOperatingIncome = noi(annualRent, annualExpenses);
  const rate = capRate(netOperatingIncome, purchasePrice);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Cap Rate Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CalculatorField
          id="purchasePrice"
          label="Purchase price"
          suffix="$"
          value={purchasePrice}
          onChange={setPurchasePrice}
        />
        <CalculatorField
          id="annualRent"
          label="Annual rental income"
          suffix="$/yr"
          value={annualRent}
          onChange={setAnnualRent}
        />
        <CalculatorField
          id="annualExpenses"
          label="Annual operating expenses"
          suffix="$/yr"
          value={annualExpenses}
          onChange={setAnnualExpenses}
        />

        <div className="flex flex-col gap-3 pt-2">
          <CalculatorResult
            label="Cap rate"
            value={Number.isFinite(rate) ? formatPercent(rate) : "—"}
            tone={rate >= 0 ? "positive" : "negative"}
          />
          <CalculatorResult label="Net operating income" value={formatCurrency(netOperatingIncome)} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
