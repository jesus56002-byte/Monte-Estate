-- First-party pageview tracking (visitors/page views/bounce rate for the
-- admin dashboard, without depending on a paid analytics API) and a durable
-- RentCast request log (the in-memory counter in lib/rentcast/client.ts
-- resets on every deploy/cold start, so it can't answer "this month").

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  -- Cookie-persisted per-browser id, not tied to a logged-in user — most
  -- visitors (marketing pages, pre-signup) have no auth session at all.
  session_id uuid not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views(created_at);
create index page_views_session_id_idx on public.page_views(session_id);

alter table public.page_views enable row level security;

-- Insert-only from anyone (including anonymous visitors) — no select
-- policy, since only the admin dashboard (service-role client) reads this.
create policy "page_views_insert_anyone" on public.page_views
  for insert to anon, authenticated with check (true);

create table public.rentcast_request_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.rentcast_request_log enable row level security;
-- No policies at all: only the service-role client (used server-side in
-- lib/rentcast/client.ts and the admin dashboard) can read or write this.

-- Aggregates page_views into what the dashboard actually needs in one
-- round trip. "Sessions" here are cookie-based, not cross-visit identity,
-- so unique_visitors/total_sessions are the same number — that's a known
-- simplification of a first-party tracker without persistent visitor IDs.
create or replace function public.get_page_view_stats(p_start timestamptz, p_end timestamptz)
returns table(total_views bigint, unique_visitors bigint, total_sessions bigint, bounced_sessions bigint)
language sql
stable
as $$
  with sessions as (
    select session_id, count(*) as views
    from public.page_views
    where created_at >= p_start and created_at < p_end
    group by session_id
  )
  select
    coalesce(sum(views), 0) as total_views,
    count(*) as unique_visitors,
    count(*) as total_sessions,
    count(*) filter (where views = 1) as bounced_sessions
  from sessions;
$$;

grant execute on function public.get_page_view_stats(timestamptz, timestamptz) to service_role;
