import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCurrencyCompact, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/finance/types";

function ResultTile({
  label,
  value,
  title,
  tone,
}: {
  label: string;
  value: string;
  /** Full-precision value shown on hover — used when `value` is compact-formatted. */
  title?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card className="items-center text-center">
      <CardHeader className="w-full items-center justify-items-center pb-0">
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <p
          title={title}
          className={cn(
            "text-xl font-semibold tabular-nums sm:text-2xl",
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
  loanTermYears,
}: {
  result: AnalysisResult;
  holdingPeriodYears: number;
  loanTermYears: number;
}) {
  const numPayments = loanTermYears * 12;

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
        value={formatCurrencyCompact(result.totalProfit)}
        title={formatCurrency(result.totalProfit)}
        tone={result.totalProfit >= 0 ? "positive" : "negative"}
      />
      <ResultTile label="Monthly mortgage (P&I)" value={formatCurrency(result.monthlyMortgagePayment)} />
      <ResultTile
        label="Total interest paid"
        value={formatCurrencyCompact(result.totalInterestPaid)}
        title={formatCurrency(result.totalInterestPaid)}
      />
      <ResultTile
        label={`Total of ${numPayments} payments`}
        value={formatCurrencyCompact(result.totalOfPayments)}
        title={formatCurrency(result.totalOfPayments)}
      />
      <ResultTile
        label={`Total tax paid after ${holdingPeriodYears} yr${holdingPeriodYears === 1 ? "" : "s"}`}
        value={formatCurrencyCompact(result.totalPropertyTaxPaid)}
        title={formatCurrency(result.totalPropertyTaxPaid)}
      />
    </div>
  );
}
