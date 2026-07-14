import type { PropertyData } from "@/types/property";
import type { AnalysisResult } from "@/lib/finance/types";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";
import type { PercentileSummary } from "@/lib/montecarlo/stats";
import type { AIRecommendation } from "@/lib/validation/ai";

export interface SimulationSummary {
  profit: PercentileSummary;
  irr: PercentileSummary;
}

export interface Deal {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  propertySnapshot: PropertyData;
  investmentInputs: InvestmentInputsFormValues;
  calculatedResults: AnalysisResult | null;
  simulationSummary: SimulationSummary | null;
  aiRecommendation: AIRecommendation | null;
  createdAt: string;
  updatedAt: string;
}
