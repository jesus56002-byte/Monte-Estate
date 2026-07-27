"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CalculatorField({
  id,
  label,
  suffix,
  step = "1",
  value,
  onChange,
}: {
  id: string;
  label: string;
  suffix?: string;
  step?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step={step}
          className={suffix ? "pr-12" : undefined}
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(e.target.valueAsNumber)}
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

export function CalculatorResult({
  label,
  value,
  tone,
  size = "lg",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  size?: "lg" | "sm";
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border bg-card px-6 py-5 text-center shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-bold tabular-nums",
          size === "lg" ? "text-4xl" : "text-2xl",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}
