"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";
import type { HistogramBin } from "@/lib/montecarlo/stats";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: HistogramBin }[];
}) {
  if (!active || !payload?.length) return null;
  const bin = payload[0].payload;

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-card-foreground">
        {formatCurrency(bin.binStart)} – {formatCurrency(bin.binEnd)}
      </p>
      <p className="text-muted-foreground">
        {bin.count.toLocaleString()} trial{bin.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function OutcomeHistogram({ bins }: { bins: HistogramBin[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: "var(--histogram-bar)" }}
            aria-hidden
          />
          Simulated outcomes
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-3"
            style={{ backgroundColor: "var(--histogram-fit-line)" }}
            aria-hidden
          />
          Normal fit
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={bins} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey="midpoint"
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={32}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" fill="var(--histogram-bar)" radius={[2, 2, 0, 0]} maxBarSize={18} />
          <Line
            type="monotone"
            dataKey="normalFit"
            stroke="var(--histogram-fit-line)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
