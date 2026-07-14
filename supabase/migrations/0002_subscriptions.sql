-- Stripe subscription state, tracked per profile.

alter table public.profiles
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text unique,
  add column subscription_status text,
  add column subscription_current_period_end timestamptz;

-- Written only by the service-role client (Stripe webhook + checkout success
-- fallback), never by the user directly, so no additional RLS policy is
-- needed beyond the existing "profiles_update_own" — that policy still only
-- covers updates made through the user's own session, and the service role
-- bypasses RLS entirely.
