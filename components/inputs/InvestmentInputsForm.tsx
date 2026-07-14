"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path, type UseFormRegister } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  investmentInputsFormSchema,
  type InvestmentInputsFormValues,
} from "@/lib/validation/investment";

function NumberField({
  id,
  label,
  suffix,
  step = "1",
  register,
}: {
  id: Path<InvestmentInputsFormValues>;
  label: string;
  suffix?: string;
  step?: string;
  register: UseFormRegister<InvestmentInputsFormValues>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step={step}
          className={suffix ? "pr-10" : undefined}
          {...register(id, { valueAsNumber: true })}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function InvestmentInputsForm({
  defaultValues,
  onChange,
}: {
  defaultValues: InvestmentInputsFormValues;
  onChange: (values: InvestmentInputsFormValues) => void;
}) {
  const { register, control } = useForm<InvestmentInputsFormValues>({
    resolver: zodResolver(investmentInputsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });

  useEffect(() => {
    const parsed = investmentInputsFormSchema.safeParse(values);
    if (parsed.success) onChange(parsed.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumberField id="purchasePrice" label="Purchase price" suffix="$" register={register} />
          <NumberField id="downPaymentPercent" label="Down payment" suffix="%" step="0.5" register={register} />
          <NumberField id="interestRatePercent" label="Interest rate" suffix="%" step="0.125" register={register} />
          <NumberField id="loanTermYears" label="Loan term" suffix="yrs" register={register} />
          <NumberField id="closingCosts" label="Closing costs" suffix="$" register={register} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumberField id="monthlyRent" label="Monthly rent" suffix="$" register={register} />
          <NumberField id="rentGrowthPercent" label="Rent growth" suffix="%/yr" step="0.1" register={register} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operating expenses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumberField id="propertyTaxAnnual" label="Property taxes" suffix="$/yr" register={register} />
          <NumberField id="insuranceAnnual" label="Insurance" suffix="$/yr" register={register} />
          <NumberField id="hoaMonthly" label="HOA" suffix="$/mo" register={register} />
          <NumberField id="maintenancePercent" label="Maintenance" suffix="%" step="0.5" register={register} />
          <NumberField id="vacancyPercent" label="Vacancy" suffix="%" step="0.5" register={register} />
          <NumberField
            id="propertyManagementPercent"
            label="Property management"
            suffix="%"
            step="0.5"
            register={register}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Growth &amp; exit</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumberField id="appreciationPercent" label="Appreciation" suffix="%/yr" step="0.1" register={register} />
          <NumberField id="holdingPeriodYears" label="Holding period" suffix="yrs" register={register} />
          <NumberField id="sellingCostPercent" label="Selling costs" suffix="%" step="0.5" register={register} />
        </CardContent>
      </Card>
    </div>
  );
}
