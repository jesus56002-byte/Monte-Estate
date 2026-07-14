-- Monte Estate initial schema: profiles + saved deals, both RLS-protected.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  default_down_payment_pct numeric(5,2) not null default 20.00,
  default_interest_rate_pct numeric(5,3) not null default 7.000,
  default_loan_term_years integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  city text,
  state text,
  zip text,
  latitude double precision,
  longitude double precision,

  -- RentCast snapshot at time of save: beds, baths, sqft, yearBuilt,
  -- propertyType, estimatedValue, estimatedRent, source, fetchedAt, raw
  property_snapshot jsonb not null,

  -- full editable investment assumptions (purchase price, down payment,
  -- interest rate, loan term, closing costs, taxes, insurance, HOA,
  -- maintenance/vacancy/mgmt %, appreciation, rent growth, holding period,
  -- selling cost %, simulation settings)
  investment_inputs jsonb not null,

  -- cached deterministic results: monthlyCashFlow, noi, capRate,
  -- cashOnCash, irr, totalProfit, totalCashInvested
  calculated_results jsonb,

  -- cached Monte Carlo summary only (percentiles/stats, not the raw trials)
  simulation_summary jsonb,

  -- cached AI interpretation: verdict, interpretation (<=300 chars)
  ai_recommendation jsonb,

  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_user_id_idx on public.deals(user_id);
create index deals_user_id_created_at_idx on public.deals(user_id, created_at desc);

alter table public.deals enable row level security;

create policy "deals_select_own" on public.deals
  for select using (auth.uid() = user_id);

create policy "deals_insert_own" on public.deals
  for insert with check (auth.uid() = user_id);

create policy "deals_update_own" on public.deals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deals_delete_own" on public.deals
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
