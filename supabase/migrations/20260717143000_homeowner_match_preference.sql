-- An active home makes a user a homeowner. Homeowners do not opt into
-- seeker-to-seeker team-ups; that preference is available only in seeker mode.
create or replace function public.enforce_home_owner_match_preference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.homes as home
    where home.owner_id = new.user_id
      and home.status = 'active'::public.home_status
  ) then
    new.match_with_home_seekers = false;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_home_owner_match_preference() from public;

create or replace function public.enable_home_owner_match_preference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active'::public.home_status then
    update public.preferences
    set match_with_home_seekers = false
    where user_id = new.owner_id
      and match_with_home_seekers is true;
  end if;

  return new;
end;
$$;

revoke execute on function public.enable_home_owner_match_preference() from public;
