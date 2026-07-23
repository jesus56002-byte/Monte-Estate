-- Per-user counter for auto-naming unnamed custom scenarios ("Custom Deal
-- 1", "Custom Deal 2", ...). A SECURITY DEFINER RPC keeps the increment
-- atomic under concurrent creates, matching increment_lifetime_analyses_count.

alter table public.profiles
  add column custom_deal_counter integer not null default 0;

create or replace function public.increment_custom_deal_counter(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if p_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  update public.profiles
    set custom_deal_counter = custom_deal_counter + 1
    where id = p_user_id
    returning custom_deal_counter into v_next;

  return v_next;
end;
$$;

grant execute on function public.increment_custom_deal_counter(uuid) to authenticated;
