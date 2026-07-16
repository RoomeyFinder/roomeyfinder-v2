create index profiles_location_idx
on public.profiles
using gist(location);


create index homes_location_idx
on public.homes
using gist(location);


create index preferences_budget_idx
on public.preferences(
  budget_min,
  budget_max
);


create index homes_city_idx
on public.homes(city);


create index homes_rent_idx
on public.homes(rent);


create index profile_photos_user_id_idx
on public.profile_photos(user_id);


create index home_photos_home_id_idx
on public.home_photos(home_id);


create index home_amenities_amenity_id_idx
on public.home_amenities(amenity_id);


create index interests_to_profile_id_idx
on public.interests(to_profile_id);

-- ============================================================
-- ONLY ONE ACTIVE HOME PER USER
-- ============================================================

create unique index one_active_home_per_user
on public.homes(owner_id)
where status = 'active';
