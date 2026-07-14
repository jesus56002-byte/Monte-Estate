import type { Database } from "@/types/supabase";
import type { Deal } from "@/types/deal";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];

export function mapDealRow(row: DealRow): Deal {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsonb columns are typed loosely at the DB layer; shape is owned by lib/deals/actions.ts
    propertySnapshot: row.property_snapshot as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    investmentInputs: row.investment_inputs as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calculatedResults: row.calculated_results as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    simulationSummary: row.simulation_summary as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aiRecommendation: row.ai_recommendation as any,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
