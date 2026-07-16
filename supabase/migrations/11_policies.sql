
create policy "Public profiles are viewable"

on public.profiles

for select

using (
  auth.uid() is not null and
  is_visible is true
);



create policy "Users update own profile"

on public.profiles

for update

using (
  auth.uid() = id
);



-- ============================================================
-- PREFERENCES POLICIES
-- ============================================================

create policy "Authenticated users can view preferences"

on public.preferences

for select

to authenticated

using (
  true
);


create policy "Users update own preferences"

on public.preferences

for update

using (
  auth.uid() = user_id
);



-- ============================================================
-- HOME POLICIES
-- ============================================================


create policy "Active homes are public"

on public.homes

for select

using (
  status = 'active'
);



create policy "Users manage own homes"

on public.homes

for all

using (
  auth.uid() = owner_id
);



-- ============================================================
-- PHOTO POLICIES
-- ============================================================


create policy "Profile photos public"

on public.profile_photos

for select

using(true);



create policy "Users manage profile photos"

on public.profile_photos

for all

using (
  auth.uid() = user_id
);



create policy "Home photos public"

on public.home_photos

for select

using(true);



create policy "Owners manage home photos"

on public.home_photos

for all

using (
  auth.uid() = (
    select owner_id
    from public.homes
    where id = home_id
  )
);



-- ============================================================
-- AMENITIES
-- ============================================================


create policy "Amenities public"

on public.amenities

for select

using(true);



create policy "Home amenities public"

on public.home_amenities

for select

using(true);