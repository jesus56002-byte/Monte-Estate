import { z } from "zod";

export const aiRecommendationSchema = z.object({
  verdict: z.enum(["strong_buy", "buy", "neutral", "caution", "avoid"]),
  interpretation: z.string().max(300),
});

export type AIRecommendation = z.infer<typeof aiRecommendationSchema>;

const percentileSummarySchema = z.object({
  p5: z.number(),
  p50: z.number(),
  p95: z.number(),
  mean: z.number(),
  stdDev: z.number(),
  probabilityOfLoss: z.number(),
});

export const aiRecommendationRequestSchema = z.object({
  property: z.object({
    address: z.string(),
    bedrooms: z.number().nullable(),
    bathrooms: z.number().nullable(),
    squareFootage: z.number().nullable(),
    yearBuilt: z.number().nullable(),
  }),
  investmentInputs: z.object({
    purchasePrice: z.number(),
    downPaymentPct: z.number(),
    interestRatePct: z.number(),
    loanTermYears: z.number(),
    monthlyRent: z.number(),
    holdingPeriodYears: z.number(),
    appreciationPct: z.number(),
    rentGrowthPct: z.number(),
    vacancyPct: z.number(),
  }),
  analysisResult: z.object({
    monthlyCashFlowYear1: z.number(),
    capRate: z.number(),
    cashOnCash: z.number(),
    irr: z.number(),
    totalProfit: z.number(),
  }),
  simulationSummary: z
    .object({
      profit: percentileSummarySchema,
      irr: percentileSummarySchema,
    })
    .optional(),
});

export type AIRecommendationRequest = z.infer<typeof aiRecommendationRequestSchema>;
