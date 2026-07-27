"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cashOnCash, totalCashInvested } from "@/lib/finance/returns";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { CalculatorField, CalculatorResult } from "@/components/calculators/shared";

export function CashOnCashCalculator() {
  const [annualCashFlow, setAnnualCashFlow] = useState(3_600);
  const [downPayment, setDownPayment] = useState(60_000);
  const [closingCosts, setClosingCosts] = useState(6_000);

  const cashInvested = totalCashInvested(downPayment, closingCosts);
  const rate = cashOnCash(annualCashFlow, cashInvested);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Cash-on-Cash Return Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CalculatorField
          id="annualCashFlow"
          label="Annual pre-tax cash flow"
          suffix="$/yr"
          value={annualCashFlow}
          onChange={setAnnualCashFlow}
        />
        <CalculatorField
          id="downPayment"
          label="Down payment"
          suffix="$"
          value={downPayment}
          onChange={setDownPayment}
        />
        <CalculatorField
          id="closingCosts"
          label="Closing costs"
          suffix="$"
          value={closingCosts}
          onChange={setClosingCosts}
        />

        <div className="flex flex-col gap-3 pt-2">
          <CalculatorResult
            label="Cash-on-cash return"
            value={Number.isFinite(rate) ? formatPercent(rate) : "—"}
            tone={rate >= 0 ? "positive" : "negative"}
          />
          <CalculatorResult label="Total cash invested" value={formatCurrency(cashInvested)} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
