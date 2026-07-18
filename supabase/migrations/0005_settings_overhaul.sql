-- Default investment assumptions (Settings > Defaults), a lifetime analyses
-- counter for the Settings > About stats block, and a feedback inbox.
--
-- Note: default_down_payment_pct, default_interest_rate_pct, and
-- default_loan_term_years already exist on profiles from 0001_init.sql but
-- were never wired up — left alone here, only the missing five are added.

alter table public.profiles
  add column default_appreciation_pct numeric(5,2) not null default 3,
  add column default_vacancy_pct numeric(5,2) not null default 5,
  add column default_maintenance_pct numeric(5,2) not null default 5,
  add column default_closing_cost_pct numeric(5,2) not null default 2,
  add column default_insurance_pct numeric(5,3) not null default 0.35,
  add column lifetime_analyses_count integer not null default 0;

-- Backfill existing accounts so the stat isn't a misleading "0" for anyone
-- who already has saved deals.
update public.profiles p
  set lifetime_analyses_count = (
    select count(*) from public.deals d where d.user_id = p.id
  );

create or replace function public.increment_lifetime_analyses_count(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  update public.profiles
    set lifetime_analyses_count = lifetime_analyses_count + 1
    where id = p_user_id;
end;
$$;

grant execute on function public.increment_lifetime_analyses_count(uuid) to authenticated;

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bug', 'feature', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Insert-only from the client — no select policy, since this is a one-way
-- inbox reviewed directly in the Supabase dashboard (service role bypasses
-- RLS), not something users read back through the app.
create policy "feedback_insert_own" on public.feedback
  for insert with check (auth.uid() = user_id);
