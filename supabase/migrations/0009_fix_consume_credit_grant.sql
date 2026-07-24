-- Bug fix: consume_analysis_credit (0003_plans_and_usage.sql) was never
-- security definer, unlike its siblings increment_lifetime_analyses_count
-- and increment_custom_deal_counter (both security definer since the day
-- they were written). It runs as the calling `authenticated` role, so its
-- internal `update public.profiles set plan_analyses_used = ...` depends on
-- column-level UPDATE privilege on plan_analyses_used /
-- bonus_analyses_remaining for that role.
--
-- 0008_lock_down_profile_columns.sql revoked blanket UPDATE on profiles from
-- authenticated and granted it back only for user-editable fields, correctly
-- excluding plan_analyses_used/bonus_analyses_remaining (those must only
-- change via this function or the service role) — but its own comment
-- incorrectly assumed consume_analysis_credit was already security definer.
-- It wasn't, so every call started failing with an insufficient-privilege
-- error, surfaced to users as "Couldn't verify your analysis quota."
--
-- Fix: make it security definer, matching the established pattern for these
-- self-service RPCs. It already checks `p_user_id <> auth.uid()` internally,
-- so this grants no broader capability than the function already enforces —
-- same shape as increment_lifetime_analyses_count / increment_custom_deal_counter.

create or replace function public.consume_analysis_credit(p_user_id uuid)
returns table(
  allowed boolean,
  plan text,
  plan_analyses_used integer,
  bonus_analyses_remaining integer
)
language plpgsql
security definer
set search_path = public
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
