
create trigger profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();


create trigger preferences_updated_at
before update on public.preferences
for each row
execute procedure public.handle_updated_at();


create trigger profile_contacts_updated_at
before update on public.profile_contacts
for each row
execute procedure public.handle_updated_at();


create trigger homes_updated_at
before update on public.homes
for each row
execute procedure public.handle_updated_at();


create or replace function public.prevent_user_verification_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_verified is distinct from old.is_verified
    and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'Only the system can change profile verification status';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_user_verification_changes() from public;

create trigger profiles_prevent_user_verification_changes
before update of is_verified on public.profiles
for each row
execute procedure public.prevent_user_verification_changes();


-- A user with an active home is always eligible to match with home seekers.
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
    new.match_with_home_seekers = true;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_home_owner_match_preference() from public;

create trigger preferences_enforce_home_owner_match_preference
before insert or update on public.preferences
for each row
execute procedure public.enforce_home_owner_match_preference();


-- Creating or activating a home immediately opts its owner in.
create or replace function public.enable_home_owner_match_preference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active'::public.home_status then
    update public.preferences
    set match_with_home_seekers = true
    where user_id = new.owner_id
      and match_with_home_seekers is false;
  end if;

  return new;
end;
$$;

revoke execute on function public.enable_home_owner_match_preference() from public;

create trigger homes_enable_owner_match_preference
after insert or update on public.homes
for each row
execute procedure public.enable_home_owner_match_preference();


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

insert into public.profiles(id)
values(new.id);

insert into public.preferences(user_id)
values(new.id);

return new;

end;
$$;


revoke execute on function public.handle_new_user() from public;


create trigger on_auth_user_created

after insert on auth.users

for each row

execute procedure public.handle_new_user();
