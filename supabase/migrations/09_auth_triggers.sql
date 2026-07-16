
create trigger profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();


create trigger preferences_updated_at
before update on public.preferences
for each row
execute procedure public.handle_updated_at();


create trigger homes_updated_at
before update on public.homes
for each row
execute procedure public.handle_updated_at();

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
