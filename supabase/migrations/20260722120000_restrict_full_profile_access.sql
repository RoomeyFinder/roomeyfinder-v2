-- Keep profile discovery useful while making the complete profile a
-- connection-only surface. The matching RPC remains the controlled source
-- for compatibility data; direct table reads are for owners and accepted
-- connections only.

drop policy if exists "Authenticated users can view active visible profiles" on public.profiles;

create policy "Owners and accepted connections can view full profiles"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.interests as interest
    where interest.status = 'accepted'::public.interest_status
      and (
        (interest.from_profile_id = id and interest.to_profile_id = (select auth.uid()))
        or
        (interest.to_profile_id = id and interest.from_profile_id = (select auth.uid()))
      )
  )
);

-- These functions deliberately return only a small preview. They are the
-- safe replacement for exposing the profiles table to pending/unconnected
-- users through the Data API.
create or replace function public.get_profile_preview(requested_username text)
returns table (
  id uuid,
  username text,
  first_name text,
  is_verified boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id, profile.username, profile.first_name, profile.is_verified
  from public.profiles as profile
  where (select auth.uid()) is not null
    and lower(profile.username) = lower(requested_username)
    and (
      profile.id = (select auth.uid())
      or (profile.is_visible is true and profile.profile_status = 'active'::public.user_status)
    );
$$;

create or replace function public.get_profile_previews(requested_profile_ids uuid[])
returns table (
  id uuid,
  username text,
  first_name text,
  is_verified boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id, profile.username, profile.first_name, profile.is_verified
  from public.profiles as profile
  where (select auth.uid()) is not null
    and profile.id = any(requested_profile_ids)
    and (
      profile.id = (select auth.uid())
      or (profile.is_visible is true and profile.profile_status = 'active'::public.user_status)
    );
$$;

revoke execute on function public.get_profile_preview(text) from public, anon;
revoke execute on function public.get_profile_previews(uuid[]) from public, anon;
grant execute on function public.get_profile_preview(text) to authenticated;
grant execute on function public.get_profile_previews(uuid[]) to authenticated;

drop policy if exists "Users view own preferences" on public.preferences;

create policy "Users view own or connected preferences"
on public.preferences
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.interests as interest
    where interest.status = 'accepted'::public.interest_status
      and (
        (interest.from_profile_id = user_id and interest.to_profile_id = (select auth.uid()))
        or
        (interest.to_profile_id = user_id and interest.from_profile_id = (select auth.uid()))
      )
  )
);

drop policy if exists "Authenticated users can view active or own homes" on public.homes;

create policy "Owners and accepted connections can view homes"
on public.homes
for select
to authenticated
using (
  (select auth.uid()) = owner_id
  or exists (
    select 1
    from public.interests as interest
    where interest.status = 'accepted'::public.interest_status
      and (
        (interest.from_profile_id = owner_id and interest.to_profile_id = (select auth.uid()))
        or
        (interest.to_profile_id = owner_id and interest.from_profile_id = (select auth.uid()))
      )
  )
);

drop policy if exists "Profile photos are publicly viewable" on public.profile_photos;
drop policy if exists "Authenticated users can view safe profile and home photos" on public.profile_photos;

create policy "Owners and accepted connections can view profile photos"
on public.profile_photos
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.interests as interest
    where interest.status = 'accepted'::public.interest_status
      and (
        (interest.from_profile_id = user_id and interest.to_profile_id = (select auth.uid()))
        or
        (interest.to_profile_id = user_id and interest.from_profile_id = (select auth.uid()))
      )
  )
);

drop policy if exists "Home photos are publicly viewable" on public.home_photos;
drop policy if exists "Authenticated users can view safe profile and home photos" on public.home_photos;

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
        or exists (
          select 1
          from public.interests as interest
          where interest.status = 'accepted'::public.interest_status
            and (
              (interest.from_profile_id = home.owner_id and interest.to_profile_id = (select auth.uid()))
              or
              (interest.to_profile_id = home.owner_id and interest.from_profile_id = (select auth.uid()))
            )
        )
      )
  )
);

revoke select on public.profile_photos, public.home_photos from anon;
grant select on public.profile_photos, public.home_photos to authenticated;

-- Storage objects need the same boundary as their metadata rows. Signed URLs
-- are not a substitute for an authorization policy on the bucket.
drop policy if exists "Authenticated users can view safe profile and home photos" on storage.objects;

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
          or exists (
            select 1
            from public.interests as interest
            where interest.status = 'accepted'::public.interest_status
              and (
                (interest.from_profile_id = photo.user_id and interest.to_profile_id = (select auth.uid()))
                or
                (interest.to_profile_id = photo.user_id and interest.from_profile_id = (select auth.uid()))
              )
          )
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
          or exists (
            select 1
            from public.interests as interest
            where interest.status = 'accepted'::public.interest_status
              and (
                (interest.from_profile_id = home.owner_id and interest.to_profile_id = (select auth.uid()))
                or
                (interest.to_profile_id = home.owner_id and interest.from_profile_id = (select auth.uid()))
              )
          )
        )
    )
  )
);
