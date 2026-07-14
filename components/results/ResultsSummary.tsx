import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/finance/types";

function ResultTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums",
            tone === "positive" && "text-success",
            tone === "negative" && "text-destructive"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function ResultsSummary({
  result,
  holdingPeriodYears,
}: {
  result: AnalysisResult;
  holdingPeriodYears: number;
}) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
      <ResultTile
        label="Monthly cash flow"
        value={formatCurrency(result.monthlyCashFlowYear1)}
        tone={result.monthlyCashFlowYear1 >= 0 ? "positive" : "negative"}
      />
      <ResultTile label="Cap rate" value={formatPercent(result.capRate)} />
      <ResultTile label="Cash-on-cash return" value={formatPercent(result.cashOnCash)} />
      <ResultTile
        label="IRR"
        value={Number.isNaN(result.irr) ? "—" : formatPercent(result.irr)}
      />
      <ResultTile
        label={`Total profit after ${holdingPeriodYears} yr${holdingPeriodYears === 1 ? "" : "s"}`}
        value={formatCurrency(result.totalProfit)}
        tone={result.totalProfit >= 0 ? "positive" : "negative"}
      />
      <ResultTile label="Monthly mortgage (P&I)" value={formatCurrency(result.monthlyMortgagePayment)} />
    </div>
  );
}
