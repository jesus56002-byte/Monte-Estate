-- Phone number collected at signup, and a locally-cached mirror of Stripe's
-- cancel_at_period_end so the Settings page can show "cancels on <date>"
-- without an extra live Stripe API call on every page load.

alter table public.profiles
  add column phone text,
  add column cancel_at_period_end boolean not null default false;
