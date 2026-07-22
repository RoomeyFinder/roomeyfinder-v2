-- Avoid recursive RLS evaluation when policies cross-reference profiles and
-- interests. These helpers return only authorization booleans and execute
-- with the function owner's table privileges.

create or replace function public.has_accepted_connection(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.interests as interest
      where interest.status = 'accepted'::public.interest_status
        and (
          (interest.from_profile_id = target_profile_id and interest.to_profile_id = (select auth.uid()))
          or
          (interest.to_profile_id = target_profile_id and interest.from_profile_id = (select auth.uid()))
        )
    );
$$;

create or replace function public.is_active_visible_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = target_profile_id
      and profile.is_visible is true
      and profile.profile_status = 'active'::public.user_status
  );
$$;

revoke execute on function public.has_accepted_connection(uuid) from public, anon;
revoke execute on function public.is_active_visible_profile(uuid) from public, anon;
grant execute on function public.has_accepted_connection(uuid) to authenticated;
grant execute on function public.is_active_visible_profile(uuid) to authenticated;

drop policy if exists "Owners and accepted connections can view full profiles" on public.profiles;

create policy "Owners and accepted connections can view full profiles"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or public.has_accepted_connection(id)
);

drop policy if exists "Users view own or connected preferences" on public.preferences;

create policy "Users view own or connected preferences"
on public.preferences
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.has_accepted_connection(user_id)
);

drop policy if exists "Owners and accepted connections can view homes" on public.homes;

create policy "Owners and accepted connections can view homes"
on public.homes
for select
to authenticated
using (
  (select auth.uid()) = owner_id
  or public.has_accepted_connection(owner_id)
);

drop policy if exists "Owners and accepted connections can view profile photos" on public.profile_photos;

create policy "Owners and accepted connections can view profile photos"
on public.profile_photos
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.has_accepted_connection(user_id)
);

drop policy if exists "Owners and accepted connections can view home photos" on public.home_photos;

create policy "Owners and accepted connections can view home photos"
on public.home_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.homes as home
    where home.id = home_photos.home_id
      and (
        home.owner_id = (select auth.uid())
        or public.has_accepted_connection(home.owner_id)
      )
  )
);

drop policy if exists "Users can create pending interests" on public.interests;

create policy "Users can create pending interests"
on public.interests
for insert
to authenticated
with check (
  (select auth.uid()) = from_profile_id
  and status = 'pending'::public.interest_status
  and public.is_active_visible_profile(to_profile_id)
);

drop policy if exists "Owners and accepted connections can view profile and home photos" on storage.objects;

create policy "Owners and accepted connections can view profile and home photos"
on storage.objects
for select
to authenticated
using (
  (
    bucket_id = 'profile-photos'
    and exists (
      select 1
      from public.profile_photos as photo
      where photo.storage_path = storage.objects.name
        and (
          photo.user_id = (select auth.uid())
          or public.has_accepted_connection(photo.user_id)
        )
    )
  )
  or (
    bucket_id = 'home-photos'
    and exists (
      select 1
      from public.home_photos as photo
      join public.homes as home on home.id = photo.home_id
      where photo.storage_path = storage.objects.name
        and (
          home.owner_id = (select auth.uid())
          or public.has_accepted_connection(home.owner_id)
        )
    )
  )
);
