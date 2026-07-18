"use client";

import { useActionState, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateDefaults, type SettingsActionState } from "@/app/(app)/settings/actions";
import type { SettingsData } from "@/components/settings/types";

const initialState: SettingsActionState = { error: null, success: null };

function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- next-themes' documented pattern for avoiding hydration mismatch
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
      <div>
        <p className="text-sm font-medium">Dark mode</p>
        <p className="text-xs text-muted-foreground">Applies across the whole app, saved to this browser.</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        disabled={!mounted}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          isDark ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-soft transition-transform duration-200",
            isDark && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

function PercentField({
  id,
  label,
  defaultValue,
  min,
  max,
}: {
  id: string;
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} name={id} type="number" step="0.05" min={min} max={max} defaultValue={defaultValue} className="pr-9" />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}

export function DefaultsSection({ data }: { data: SettingsData }) {
  const [state, formAction, pending] = useActionState(updateDefaults, initialState);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved preferences</CardTitle>
          <CardDescription>
            Applied automatically the next time you search a property — no more re-entering the same
            assumptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <DarkModeToggle />

          <form action={formAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <PercentField id="appreciationPct" label="Default appreciation rate" defaultValue={data.defaults.appreciationPct} min={-20} max={30} />
              <PercentField id="vacancyPct" label="Default vacancy" defaultValue={data.defaults.vacancyPct} min={0} max={100} />
              <PercentField id="maintenancePct" label="Default maintenance" defaultValue={data.defaults.maintenancePct} min={0} max={100} />
              <PercentField id="closingCostPct" label="Default closing costs" defaultValue={data.defaults.closingCostPct} min={0} max={20} />
              <PercentField id="insurancePct" label="Default insurance estimate" defaultValue={data.defaults.insurancePct} min={0} max={10} />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            {state.success && <p className="text-sm text-success">{state.success}</p>}

            <Button type="submit" className="w-fit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
