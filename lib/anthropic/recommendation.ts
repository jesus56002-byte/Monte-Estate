import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/anthropic/client";
import { env } from "@/lib/env";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { aiRecommendationSchema, type AIRecommendation, type AIRecommendationRequest } from "@/lib/validation/ai";

const SYSTEM_PROMPT = `You are a real-estate investment analyst. You're given a property, a buyer's
financing and operating assumptions, the resulting deterministic return metrics, and (when available)
a Monte Carlo simulation summary. Give a candid, specific verdict grounded in the actual numbers
provided — reference real figures rather than generic advice. Don't just validate the deal; call out
the single biggest risk if there is one. Respond with a verdict and one tight interpretation of at
most 280 characters (a couple of sentences, no bullet points, no filler) that a reader can absorb in
a few seconds. Staying comfortably under that limit matters more than using all of it.`;

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

async function requestRecommendation(input: AIRecommendationRequest): Promise<AIRecommendation> {
  const response = await anthropic.messages.parse({
    model: env.ANTHROPIC_MODEL,
    // 400 was too tight: the model occasionally used part of the budget on
    // adaptive thinking or ran slightly long, truncating the structured JSON
    // mid-string and throwing instead of returning a usable response.
    // Verified against live traffic: 400 failed ~50-60% of the time, 1024
    // failed 0/15.
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

export async function generateRecommendation(input: AIRecommendationRequest): Promise<AIRecommendation> {
  try {
    return await requestRecommendation(input);
  } catch (error) {
    // Character-count instructions are inherently approximate for an LLM —
    // even with headroom (see max_tokens/schema comments), an occasional
    // response still runs long or gets cut off mid-JSON. One retry clears
    // almost all of these without masking a real, persistent failure (a bad
    // API key, a genuine rate limit) from the caller.
    console.error("[generateRecommendation] first attempt failed, retrying once:", error);
    return await requestRecommendation(input);
  }
}
