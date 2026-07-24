import type { PlanId } from "@/lib/plans";

export interface SettingsData {
  isAdmin: boolean;
  email: string;
  displayName: string;
  phone: string;
  memberSince: string;
  currentPlan: PlanId;
  planAnalysesUsed: number;
  bonusAnalysesRemaining: number;
  bonusAnalysesExpiresAt: string | null;
  isSubscribed: boolean;
  periodEndLabel: string | null;
  cancelAtPeriodEnd: boolean;
  billingUnavailable: boolean;
  defaults: {
    appreciationPct: number;
    vacancyPct: number;
    maintenancePct: number;
    closingCostPct: number;
    insurancePct: number;
  };
  stats: {
    propertiesAnalyzed: number;
    savedDeals: number;
    totalSimulations: number;
  };
}

export type SettingsTab = "general" | "subscription" | "profile" | "defaults" | "help" | "about";
