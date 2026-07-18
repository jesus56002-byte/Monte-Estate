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
          plan: string;
          plan_analyses_used: number;
          bonus_analyses_remaining: number;
          terms_accepted_at: string | null;
          terms_version: string | null;
          phone: string | null;
          cancel_at_period_end: boolean;
          default_appreciation_pct: number;
          default_vacancy_pct: number;
          default_maintenance_pct: number;
          default_closing_cost_pct: number;
          default_insurance_pct: number;
          lifetime_analyses_count: number;
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
          plan?: string;
          plan_analyses_used?: number;
          bonus_analyses_remaining?: number;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          phone?: string | null;
          cancel_at_period_end?: boolean;
          default_appreciation_pct?: number;
          default_vacancy_pct?: number;
          default_maintenance_pct?: number;
          default_closing_cost_pct?: number;
          default_insurance_pct?: number;
          lifetime_analyses_count?: number;
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
          plan?: string;
          plan_analyses_used?: number;
          bonus_analyses_remaining?: number;
          terms_accepted_at?: string | null;
          terms_version?: string | null;
          phone?: string | null;
          cancel_at_period_end?: boolean;
          default_appreciation_pct?: number;
          default_vacancy_pct?: number;
          default_maintenance_pct?: number;
          default_closing_cost_pct?: number;
          default_insurance_pct?: number;
          lifetime_analyses_count?: number;
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
      feedback: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          message: string;
        };
        Update: {
          category?: string;
          message?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_analysis_credit: {
        Args: { p_user_id: string };
        Returns: {
          allowed: boolean;
          plan: string | null;
          plan_analyses_used: number;
          bonus_analyses_remaining: number;
        }[];
      };
      credit_bonus_analyses: {
        Args: { p_user_id: string; p_amount: number };
        Returns: undefined;
      };
      increment_lifetime_analyses_count: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
    };
  };
}
