"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mortgagePayment } from "@/lib/finance/mortgage";
import { formatCurrency } from "@/lib/utils/format";
import { CalculatorField, CalculatorResult } from "@/components/calculators/shared";

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(300_000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(7);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState(3_000);
  const [insuranceAnnual, setInsuranceAnnual] = useState(1_200);
  const [hoaMonthly, setHoaMonthly] = useState(0);

  const loanAmount = homePrice * (1 - downPaymentPct / 100);
  const monthlyPI = mortgagePayment(loanAmount, interestRatePct / 100, loanTermYears);
  const numPayments = loanTermYears * 12;
  const totalOfPayments = monthlyPI * numPayments;
  const totalInterestPaid = totalOfPayments - loanAmount;
  const totalMonthlyPayment = monthlyPI + propertyTaxAnnual / 12 + insuranceAnnual / 12 + hoaMonthly;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Mortgage Payment Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <CalculatorField id="homePrice" label="Home price" suffix="$" value={homePrice} onChange={setHomePrice} />
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
          <CalculatorField
            id="propertyTaxAnnual"
            label="Property tax"
            suffix="$/yr"
            value={propertyTaxAnnual}
            onChange={setPropertyTaxAnnual}
          />
          <CalculatorField
            id="insuranceAnnual"
            label="Home insurance"
            suffix="$/yr"
            value={insuranceAnnual}
            onChange={setInsuranceAnnual}
          />
          <CalculatorField id="hoaMonthly" label="HOA dues" suffix="$/mo" value={hoaMonthly} onChange={setHoaMonthly} />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <CalculatorResult label="Total monthly payment (PITI)" value={formatCurrency(totalMonthlyPayment)} />
          <div className="grid grid-cols-2 gap-3">
            <CalculatorResult label="Principal & interest" value={formatCurrency(monthlyPI)} size="sm" />
            <CalculatorResult label="Loan amount" value={formatCurrency(loanAmount)} size="sm" />
            <CalculatorResult label="Total interest paid" value={formatCurrency(totalInterestPaid)} size="sm" />
            <CalculatorResult label={`Total of ${numPayments} payments`} value={formatCurrency(totalOfPayments)} size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
