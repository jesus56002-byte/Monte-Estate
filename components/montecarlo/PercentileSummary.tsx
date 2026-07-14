import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { PercentileSummary as PercentileSummaryData } from "@/lib/montecarlo/stats";

function CaseCard({
  label,
  profit,
  irr,
  tone,
}: {
  label: string;
  profit: number;
  irr: number;
  tone: "negative" | "neutral" | "positive";
}) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p
          className={cn(
            "text-xl font-semibold tabular-nums",
            tone === "positive" && "text-success",
            tone === "negative" && "text-destructive"
          )}
        >
          {formatCurrency(profit)}
        </p>
        <p className="text-xs text-muted-foreground">
          IRR {Number.isNaN(irr) ? "—" : formatPercent(irr)}
        </p>
      </CardContent>
    </Card>
  );
}

export function PercentileSummary({
  profit,
  irr,
}: {
  profit: PercentileSummaryData;
  irr: PercentileSummaryData;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <CaseCard label="Worst case (5th pct.)" profit={profit.p5} irr={irr.p5} tone="negative" />
        <CaseCard label="Median" profit={profit.p50} irr={irr.p50} tone="neutral" />
        <CaseCard label="Best case (95th pct.)" profit={profit.p95} irr={irr.p95} tone="positive" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {formatPercent(profit.probabilityOfLoss)} of simulated outcomes lost money over the holding period.
      </p>
    </div>
  );
}
