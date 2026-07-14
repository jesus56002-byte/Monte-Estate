import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/anthropic/client";
import { env } from "@/lib/env";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { aiRecommendationSchema, type AIRecommendation, type AIRecommendationRequest } from "@/lib/validation/ai";

const SYSTEM_PROMPT = `You are a real-estate investment analyst. You're given a property, a buyer's
financing and operating assumptions, the resulting deterministic return metrics, and (when available)
a Monte Carlo simulation summary. Give a candid, specific verdict grounded in the actual numbers
provided — reference real figures rather than generic advice. Flag genuine risks; don't just validate
the deal. Keep reasoning and risk factors terse (one sentence each).`;

function buildUserPrompt(input: AIRecommendationRequest): string {
  const { property, investmentInputs: inputs, analysisResult: result, simulationSummary } = input;

  const lines = [
    `Property: ${property.address}`,
    `${property.bedrooms ?? "?"} bed / ${property.bathrooms ?? "?"} bath, ${property.squareFootage ?? "?"} sqft, built ${property.yearBuilt ?? "?"}`,
    "",
    "Deal assumptions:",
    `- Purchase price: ${formatCurrency(inputs.purchasePrice)}`,
    `- Down payment: ${formatPercent(inputs.downPaymentPct)}, interest rate: ${formatPercent(inputs.interestRatePct)}, ${inputs.loanTermYears}yr term`,
    `- Monthly rent: ${formatCurrency(inputs.monthlyRent)}, vacancy: ${formatPercent(inputs.vacancyPct)}`,
    `- Appreciation: ${formatPercent(inputs.appreciationPct)}/yr, rent growth: ${formatPercent(inputs.rentGrowthPct)}/yr`,
    `- Holding period: ${inputs.holdingPeriodYears} years`,
    "",
    "Deterministic results:",
    `- Monthly cash flow (year 1): ${formatCurrency(result.monthlyCashFlowYear1)}`,
    `- Cap rate: ${formatPercent(result.capRate)}`,
    `- Cash-on-cash return: ${formatPercent(result.cashOnCash)}`,
    `- IRR: ${Number.isNaN(result.irr) ? "undefined" : formatPercent(result.irr)}`,
    `- Total profit after ${inputs.holdingPeriodYears} years: ${formatCurrency(result.totalProfit)}`,
  ];

  if (simulationSummary) {
    lines.push(
      "",
      "10,000-trial Monte Carlo simulation (randomizing appreciation, rent growth, vacancy):",
      `- Total profit — worst case (p5): ${formatCurrency(simulationSummary.profit.p5)}, median: ${formatCurrency(simulationSummary.profit.p50)}, best case (p95): ${formatCurrency(simulationSummary.profit.p95)}`,
      `- Probability of losing money: ${formatPercent(simulationSummary.profit.probabilityOfLoss)}`,
      `- IRR — worst case: ${formatPercent(simulationSummary.irr.p5)}, median: ${formatPercent(simulationSummary.irr.p50)}, best case: ${formatPercent(simulationSummary.irr.p95)}`
    );
  }

  return lines.join("\n");
}

export async function generateRecommendation(input: AIRecommendationRequest): Promise<AIRecommendation> {
  const response = await anthropic.messages.parse({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: {
      format: zodOutputFormat(aiRecommendationSchema),
      effort: "medium",
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude returned a response that didn't match the expected schema.");
  }

  return response.parsed_output;
}
