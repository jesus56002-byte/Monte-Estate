-- Top-up ("loose") credits now expire 12 months after purchase, so they
-- don't sit on the books as an open-ended liability. A single pooled
-- counter (not a per-purchase ledger) is enough for this product: every
-- purchase refreshes the expiration to 12 months out from that purchase,
-- and if the existing pool had already expired, it's forfeited (not
-- silently un-expired) before the new credits are added.

alter table public.profiles
  add column bonus_analyses_expires_at timestamptz;

-- Deliberately no grant to `authenticated` here, same as
-- bonus_analyses_remaining/plan_analyses_used (0008_lock_down_profile_columns.sql)
-- — this must only change via the functions below or the service role.

create or replace function public.credit_bonus_analyses(p_user_id uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
    set bonus_analyses_remaining = case
          when bonus_analyses_expires_at is not null and bonus_analyses_expires_at < now()
            then p_amount
          else bonus_analyses_remaining + p_amount
        end,
        bonus_analyses_expires_at = now() + interval '12 months'
    where id = p_user_id;
$$;

-- consume_analysis_credit: bonus credits are only spendable while unexpired.
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
  v_bonus_expires_at timestamptz;
  v_limit integer;
begin
  if p_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  select p.plan, p.plan_analyses_used, p.bonus_analyses_remaining, p.bonus_analyses_expires_at
    into v_plan, v_used, v_bonus, v_bonus_expires_at
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
  elsif v_bonus > 0 and v_bonus_expires_at is not null and v_bonus_expires_at > now() then
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
