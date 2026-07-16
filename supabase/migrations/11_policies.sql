-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Authenticated users can view active visible profiles"

on public.profiles

for select

to authenticated

using (
  (select auth.uid()) = id
  or (
    is_visible is true
    and profile_status = 'active'::public.user_status
  )
);


create policy "Users update own profile"

on public.profiles

for update

to authenticated

using (
  (select auth.uid()) = id
)

with check (
  (select auth.uid()) = id
);


create policy "Users delete own profile"

on public.profiles

for delete

to authenticated

using (
  (select auth.uid()) = id
);


-- ============================================================
-- PRIVATE CONTACT POLICIES
-- ============================================================

create policy "Owners and accepted matches can view private contacts"

on public.profile_contacts

for select

to authenticated

using (
  (select auth.uid()) = profile_id
  or exists (
    select 1
    from public.interests as interest
    where interest.status = 'accepted'::public.interest_status
      and (
        (
          interest.from_profile_id = profile_contacts.profile_id
          and interest.to_profile_id = (select auth.uid())
        )
        or (
          interest.to_profile_id = profile_contacts.profile_id
          and interest.from_profile_id = (select auth.uid())
        )
      )
  )
);


create policy "Users can create own private contacts"

on public.profile_contacts

for insert

to authenticated

with check (
  (select auth.uid()) = profile_id
);


create policy "Users can update own private contacts"

on public.profile_contacts

for update

to authenticated

using (
  (select auth.uid()) = profile_id
)

with check (
  (select auth.uid()) = profile_id
);


create policy "Users can delete own private contacts"

on public.profile_contacts

for delete

to authenticated

using (
  (select auth.uid()) = profile_id
);



-- ============================================================
-- PREFERENCES POLICIES
-- ============================================================

create policy "Users view own preferences"

on public.preferences

for select

to authenticated

using (
  (select auth.uid()) = user_id
);


create policy "Users update own preferences"

on public.preferences

for update

to authenticated

using (
  (select auth.uid()) = user_id
)

with check (
  (select auth.uid()) = user_id
);



-- ============================================================
-- INTEREST POLICIES
-- ============================================================

create policy "Users can view their interests"

on public.interests

for select

to authenticated

using (
  (select auth.uid()) = from_profile_id
  or (select auth.uid()) = to_profile_id
);


create policy "Users can create their interests"

on public.interests

for insert

to authenticated

with check (
  (select auth.uid()) = from_profile_id
);


create policy "Recipients can respond to pending interests"

on public.interests

for update

to authenticated

using (
  (select auth.uid()) = to_profile_id
  and status = 'pending'::public.interest_status
)

with check (
  (select auth.uid()) = to_profile_id
  and status in (
    'accepted'::public.interest_status,
    'declined'::public.interest_status
  )
);


create policy "Users can delete their interests"

on public.interests

for delete

to authenticated

using (
  (select auth.uid()) = from_profile_id
);



-- ============================================================
-- HOME POLICIES
-- ============================================================

create policy "Authenticated users can view active or own homes"

on public.homes

for select

to authenticated

using (
  status = 'active'::public.home_status
  or (select auth.uid()) = owner_id
);


create policy "Owners can create homes"

on public.homes

for insert

to authenticated

with check (
  (select auth.uid()) = owner_id
);


create policy "Owners can update homes"

on public.homes

for update

to authenticated

using (
  (select auth.uid()) = owner_id
)

with check (
  (select auth.uid()) = owner_id
);


create policy "Owners can delete homes"

on public.homes

for delete

to authenticated

using (
  (select auth.uid()) = owner_id
);



-- ============================================================
-- PHOTO POLICIES
-- ============================================================

create policy "Profile photos are publicly viewable"

on public.profile_photos

for select

to anon, authenticated

using (true);


create policy "Users can create own profile photos"

on public.profile_photos

for insert

to authenticated

with check (
  (select auth.uid()) = user_id
);


create policy "Users can update own profile photos"

on public.profile_photos

for update

to authenticated

using (
  (select auth.uid()) = user_id
)

with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete own profile photos"

on public.profile_photos

for delete

to authenticated

using (
  (select auth.uid()) = user_id
);


create policy "Home photos are publicly viewable"

on public.home_photos

for select

to anon, authenticated

using (true);


create policy "Owners can create home photos"

on public.home_photos

for insert

to authenticated

with check (
  exists (
    select 1
    from public.homes
    where homes.id = home_photos.home_id
      and homes.owner_id = (select auth.uid())
  )
);


create policy "Owners can update home photos"

on public.home_photos

for update

to authenticated

using (
  exists (
    select 1
    from public.homes
    where homes.id = home_photos.home_id
      and homes.owner_id = (select auth.uid())
  )
)

with check (
  exists (
    select 1
    from public.homes
    where homes.id = home_photos.home_id
      and homes.owner_id = (select auth.uid())
  )
);


create policy "Owners can delete home photos"

on public.home_photos

for delete

to authenticated

using (
  exists (
    select 1
    from public.homes
    where homes.id = home_photos.home_id
      and homes.owner_id = (select auth.uid())
  )
);



-- ============================================================
-- AMENITY POLICIES
-- ============================================================

create policy "Amenities are publicly viewable"

on public.amenities

for select

to anon, authenticated

using (true);


create policy "Home amenities are publicly viewable"

on public.home_amenities

for select

to anon, authenticated

using (true);


create policy "Owners can add home amenities"

on public.home_amenities

for insert

to authenticated

with check (
  exists (
    select 1
    from public.homes
    where homes.id = home_amenities.home_id
      and homes.owner_id = (select auth.uid())
  )
);


create policy "Owners can change home amenities"

on public.home_amenities

for update

to authenticated

using (
  exists (
    select 1
    from public.homes
    where homes.id = home_amenities.home_id
      and homes.owner_id = (select auth.uid())
  )
)

with check (
  exists (
    select 1
    from public.homes
    where homes.id = home_amenities.home_id
      and homes.owner_id = (select auth.uid())
  )
);


create policy "Owners can remove home amenities"

on public.home_amenities

for delete

to authenticated

using (
  exists (
    select 1
    from public.homes
    where homes.id = home_amenities.home_id
      and homes.owner_id = (select auth.uid())
  )
);


-- ============================================================
-- DATA API PRIVILEGES
-- ============================================================
-- RLS controls which rows are visible. These grants make the tables
-- reachable through the Data API in projects where new objects are not
-- auto-exposed.

grant usage on schema public to anon, authenticated;

grant select
on public.amenities,
  public.home_amenities,
  public.profile_photos,
  public.home_photos
to anon;

grant select, update, delete
on public.profiles
to authenticated;

grant select, update
on public.preferences
to authenticated;

grant select, insert, update, delete
on public.profile_contacts,
  public.interests,
  public.homes,
  public.profile_photos,
  public.home_photos,
  public.home_amenities
to authenticated;

grant select
on public.amenities
to authenticated;
