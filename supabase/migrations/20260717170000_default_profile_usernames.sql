-- Give every profile a stable, unique username immediately on account creation.
-- The user can replace this default later from the profile settings flow.
update public.profiles
set username = 'user_' || replace(id::text, '-', '')
where username is null or nullif(btrim(username), '') is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, username)
  values (new.id, 'user_' || replace(new.id::text, '-', ''))
  on conflict (id) do nothing;

  insert into public.profile_private(profile_id) values (new.id)
  on conflict (profile_id) do nothing;

  insert into public.preferences(user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
