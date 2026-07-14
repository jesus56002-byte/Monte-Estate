/**
 * Hand-written to match supabase/migrations/0001_init.sql. Regenerate with
 * `supabase gen types typescript` once a real project exists, and keep this
 * file in sync with new migrations until then.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          default_down_payment_pct: number;
          default_interest_rate_pct: number;
          default_loan_term_years: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          default_down_payment_pct?: number;
          default_interest_rate_pct?: number;
          default_loan_term_years?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_current_period_end?: string | null;
        };
        Update: {
          display_name?: string | null;
          default_down_payment_pct?: number;
          default_interest_rate_pct?: number;
          default_loan_term_years?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_current_period_end?: string | null;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address: string;
          city: string | null;
          state: string | null;
          zip: string | null;
          latitude: number | null;
          longitude: number | null;
          property_snapshot: Json;
          investment_inputs: Json;
          calculated_results: Json | null;
          simulation_summary: Json | null;
          ai_recommendation: Json | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          address: string;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          property_snapshot: Json;
          investment_inputs: Json;
          calculated_results?: Json | null;
          simulation_summary?: Json | null;
          ai_recommendation?: Json | null;
          is_archived?: boolean;
        };
        Update: {
          label?: string;
          address?: string;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          property_snapshot?: Json;
          investment_inputs?: Json;
          calculated_results?: Json | null;
          simulation_summary?: Json | null;
          ai_recommendation?: Json | null;
          is_archived?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
