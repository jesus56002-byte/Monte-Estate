"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { InvestmentInputsForm } from "@/components/inputs/InvestmentInputsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCustomAnalysis } from "@/app/(app)/deals/actions";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";

export function CustomAnalysisForm({ defaultValues }: { defaultValues: InvestmentInputsFormValues }) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<InvestmentInputsFormValues>(defaultValues);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  function handleSubmit() {
    setErrorMessage(null);
    setErrorCode(null);
    startTransition(async () => {
      const result = await createCustomAnalysis(formValues, name.trim() || undefined);
      if ("error" in result) {
        setErrorMessage(result.error);
        setErrorCode(result.code ?? null);
        return;
      }
      router.push(`/deals/${result.dealId}`);
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-2xl flex-col gap-1.5">
        <Label htmlFor="dealName">Deal name</Label>
        <Input
          id="dealName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Duplex refi scenario"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank and we&apos;ll name it &ldquo;Custom Deal 1&rdquo;, &ldquo;Custom Deal 2&rdquo;, and so on.
        </p>
      </div>

      <InvestmentInputsForm defaultValues={defaultValues} onChange={setFormValues} />

      {errorMessage && (
        <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p role="alert" className="text-sm font-medium">
              {errorMessage}
            </p>
          </div>
          {errorCode === "QUOTA_EXCEEDED" && (
            <Button asChild size="sm">
              <Link href="/settings">View plans</Link>
            </Button>
          )}
        </div>
      )}

      <Button size="lg" onClick={handleSubmit} disabled={isPending} className="w-full max-w-2xl">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {isPending ? "Analyzing…" : "Analyze this scenario"}
      </Button>
    </div>
  );
}
