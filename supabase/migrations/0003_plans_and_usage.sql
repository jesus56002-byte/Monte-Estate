-- Subscription tiers, usage metering, and Terms & Conditions acceptance.

alter table public.profiles
  add column plan text not null default 'free' check (plan in ('free', 'starter', 'investor')),
  -- Resets to 0 on subscription renewal (paid tiers) or never (free tier's
  -- lifetime cap of 3 — there's no renewal event to reset it on).
  add column plan_analyses_used integer not null default 0,
  -- Purchased via the $4.99/10-pack top-up. Rolls over across renewals —
  -- only plan_analyses_used resets, since these were paid for separately.
  add column bonus_analyses_remaining integer not null default 0,
  add column terms_accepted_at timestamptz,
  add column terms_version text;

-- Atomically checks and consumes one analysis credit for the calling user,
-- so concurrent requests can't double-spend a quota that's otherwise read
-- and written as two separate round-trips from application code. Plan limits
-- are duplicated here from lib/plans.ts (PLAN_ANALYSIS_LIMITS) — keep both in
-- sync if the limits ever change.
create or replace function public.consume_analysis_credit(p_user_id uuid)
returns table(
  allowed boolean,
  plan text,
  plan_analyses_used integer,
  bonus_analyses_remaining integer
)
language plpgsql
as $$
declare
  v_plan text;
  v_used integer;
  v_bonus integer;
  v_limit integer;
begin
  if p_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  select p.plan, p.plan_analyses_used, p.bonus_analyses_remaining
    into v_plan, v_used, v_bonus
  from public.profiles p
  where p.id = p_user_id
  for update;

  if not found then
    return query select false, null::text, 0, 0;
    return;
  end if;

  v_limit := case v_plan
    when 'free' then 3
    when 'starter' then 20
    when 'investor' then 60
    else 0
  end;

  if v_used < v_limit then
    update public.profiles
      set plan_analyses_used = plan_analyses_used + 1
      where id = p_user_id
      returning public.profiles.plan, public.profiles.plan_analyses_used, public.profiles.bonus_analyses_remaining
      into v_plan, v_used, v_bonus;
    return query select true, v_plan, v_used, v_bonus;
  elsif v_bonus > 0 then
    update public.profiles
      set bonus_analyses_remaining = bonus_analyses_remaining - 1
      where id = p_user_id
      returning public.profiles.plan, public.profiles.plan_analyses_used, public.profiles.bonus_analyses_remaining
      into v_plan, v_used, v_bonus;
    return query select true, v_plan, v_used, v_bonus;
  else
    return query select false, v_plan, v_used, v_bonus;
  end if;
end;
$$;

grant execute on function public.consume_analysis_credit(uuid) to authenticated;

-- Atomic increment for crediting a top-up purchase, called from the Stripe
-- webhook (service-role client, so it runs with elevated privileges — this
-- one IS security definer, since the webhook has no user JWT/session to run
-- as). Kept as its own tiny function rather than a plain .update() so a
-- concurrent request can't read-modify-write and lose an increment.
create or replace function public.credit_bonus_analyses(p_user_id uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
    set bonus_analyses_remaining = bonus_analyses_remaining + p_amount
    where id = p_user_id;
$$;

grant execute on function public.credit_bonus_analyses(uuid, integer) to service_role;
