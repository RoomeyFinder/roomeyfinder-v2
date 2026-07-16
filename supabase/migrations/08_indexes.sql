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

-- ============================================================
-- ONLY ONE ACTIVE HOME PER USER
-- ============================================================

create unique index one_active_home_per_user
on public.homes(owner_id)
where status = 'active';

