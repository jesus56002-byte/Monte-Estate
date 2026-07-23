-- Security fix: profiles_update_own (0001_init.sql) only scopes which ROW a
-- user can update ("your own row"), not which COLUMNS — Postgres RLS row
-- policies never restrict columns. Combined with Supabase's default blanket
-- UPDATE grant to `authenticated`, any signed-in user could currently call
-- the client SDK directly (bypassing every server action) and write:
--
--   supabase.from('profiles').update({ plan: 'investor',
--     subscription_status: 'active', plan_analyses_used: 0,
--     bonus_analyses_remaining: 9999 }).eq('id', <their own id>)
--
-- ...and grant themselves a paid plan for free, since `auth.uid() = id`
-- alone is satisfied. Column-level GRANTs close this: they're enforced
-- *in addition to* RLS, restricting the columns a client UPDATE statement
-- may reference at all, regardless of which row it targets.
--
-- SECURITY DEFINER functions (consume_analysis_credit,
-- increment_lifetime_analyses_count, increment_custom_deal_counter) and the
-- service-role client (Stripe webhook sync, admin dashboard) are unaffected
-- — they run with the defining role's/service role's own privileges, not
-- the caller's grants.

revoke update on public.profiles from authenticated;

grant update (
  display_name,
  phone,
  terms_accepted_at,
  terms_version,
  default_down_payment_pct,
  default_interest_rate_pct,
  default_loan_term_years,
  default_appreciation_pct,
  default_vacancy_pct,
  default_maintenance_pct,
  default_closing_cost_pct,
  default_insurance_pct
) on public.profiles to authenticated;
