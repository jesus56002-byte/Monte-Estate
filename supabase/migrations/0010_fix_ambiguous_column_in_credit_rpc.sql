-- Bug fix: consume_analysis_credit has had an ambiguous-column bug since it
-- was first written in 0003_plans_and_usage.sql — invisible until now because
-- the admin account (consumeQuotaOrError's isAdminEmail check) bypasses this
-- function entirely, so it was never exercised during manual testing.
--
-- `returns table(..., plan_analyses_used integer, bonus_analyses_remaining
-- integer)` implicitly declares PL/pgSQL variables with those exact names.
-- Those collide with the identically-named columns on public.profiles, so
-- `set plan_analyses_used = plan_analyses_used + 1` (and the equivalent for
-- bonus_analyses_remaining) fails with Postgres error 42702: "column
-- reference is ambiguous" — reproduced directly against the live database:
--
--   {"code":"42702","message":"column reference \"plan_analyses_used\" is
--   ambiguous"}
--
-- This means the "still has quota" branch of every non-admin user's every
-- analysis has been failing outright since launch; only the "quota exhausted"
-- branch (which never runs an UPDATE) happened to work, which is why this
-- surfaced now, on this user's very first, quota-consuming analysis.
--
-- Fix: qualify the right-hand side of each SET with the table name
-- (`public.profiles.plan_analyses_used`), the standard Postgres idiom for
-- referencing the pre-update row's column value instead of a same-named
-- PL/pgSQL variable — the RETURNING clause already did this correctly.

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
      set plan_analyses_used = public.profiles.plan_analyses_used + 1
      where id = p_user_id
      returning public.profiles.plan, public.profiles.plan_analyses_used, public.profiles.bonus_analyses_remaining
      into v_plan, v_used, v_bonus;
    return query select true, v_plan, v_used, v_bonus;
  elsif v_bonus > 0 then
    update public.profiles
      set bonus_analyses_remaining = public.profiles.bonus_analyses_remaining - 1
      where id = p_user_id
      returning public.profiles.plan, public.profiles.plan_analyses_used, public.profiles.bonus_analyses_remaining
      into v_plan, v_used, v_bonus;
    return query select true, v_plan, v_used, v_bonus;
  else
    return query select false, v_plan, v_used, v_bonus;
  end if;
end;
$$;
