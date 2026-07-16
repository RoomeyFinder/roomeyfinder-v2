-- ============================================================
-- SECURITY, PRIVACY, AND DATA-INTEGRITY HARDENING
-- ============================================================
-- This is deliberately a forward migration. Migrations 01–13 may already
-- have been applied locally, so do not rely on edits to earlier files being
-- replayed outside a development reset.

-- Backfill the private contact table when upgrading a database that applied
-- the original profile migration before it was split out.
create table if not exists public.profile_contacts (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,
  contact_phone text,
  contact_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'contact_phone'
  ) then
    execute $sql$
      insert into public.profile_contacts (profile_id, contact_phone, contact_email)
      select id, contact_phone, contact_email
      from public.profiles
      where contact_phone is not null or contact_email is not null
      on conflict (profile_id) do update
      set contact_phone = excluded.contact_phone,
          contact_email = excluded.contact_email
    $sql$;

    alter table public.profiles
      drop column if exists contact_phone,
      drop column if exists contact_email;
  end if;
end;
$$;

-- Values that must never be broadly discoverable live outside profiles.
create table if not exists public.profile_private (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,
  last_name text,
  date_of_birth date,
  location gis.geography(Point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_private_date_of_birth_check
    check (date_of_birth is null or date_of_birth <= current_date)
);

insert into public.profile_private (profile_id, last_name, date_of_birth, location)
select id, last_name, date_of_birth, location
from public.profiles
on conflict (profile_id) do update
set last_name = excluded.last_name,
    date_of_birth = excluded.date_of_birth,
    location = excluded.location;

alter table public.profiles
  drop column if exists last_name,
  drop column if exists date_of_birth,
  drop column if exists location;

-- A full street address is only available to the listing owner. City, state,
-- and country remain on homes for safe discovery and filtering.
create table if not exists public.home_addresses (
  home_id uuid primary key
    references public.homes(id)
    on delete cascade,
  location gis.geography(Point, 4326),
  street text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.home_addresses (home_id, location, street, postal_code)
select id, location, street, postal_code
from public.homes
on conflict (home_id) do update
set location = excluded.location,
    street = excluded.street,
    postal_code = excluded.postal_code;

alter table public.homes
  drop column if exists location,
  drop column if exists street,
  drop column if exists postal_code;

create index if not exists profile_private_location_idx
  on public.profile_private using gist(location);

create index if not exists home_addresses_location_idx
  on public.home_addresses using gist(location);

-- Keep the authenticated user's private profile and address data owner-only.
alter table public.profile_contacts enable row level security;
alter table public.profile_private enable row level security;
alter table public.home_addresses enable row level security;

drop policy if exists "Owners and accepted matches can view private contacts" on public.profile_contacts;
drop policy if exists "Users can create own private contacts" on public.profile_contacts;
drop policy if exists "Users can update own private contacts" on public.profile_contacts;
drop policy if exists "Users can delete own private contacts" on public.profile_contacts;

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
        (interest.from_profile_id = profile_contacts.profile_id
          and interest.to_profile_id = (select auth.uid()))
        or
        (interest.to_profile_id = profile_contacts.profile_id
          and interest.from_profile_id = (select auth.uid()))
      )
  )
);

create policy "Users can create own private contacts"
on public.profile_contacts
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

create policy "Users can update own private contacts"
on public.profile_contacts
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create policy "Users can delete own private contacts"
on public.profile_contacts
for delete
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Users can view own private profile data"
on public.profile_private
for select
to authenticated
using ((select auth.uid()) = profile_id);

create policy "Users can create own private profile data"
on public.profile_private
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

create policy "Users can update own private profile data"
on public.profile_private
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create policy "Users can view own home addresses"
on public.home_addresses
for select
to authenticated
using (
  exists (
    select 1 from public.homes
    where homes.id = home_addresses.home_id
      and homes.owner_id = (select auth.uid())
  )
);

create policy "Owners can create home addresses"
on public.home_addresses
for insert
to authenticated
with check (
  exists (
    select 1 from public.homes
    where homes.id = home_addresses.home_id
      and homes.owner_id = (select auth.uid())
  )
);

create policy "Owners can update home addresses"
on public.home_addresses
for update
to authenticated
using (
  exists (
    select 1 from public.homes
    where homes.id = home_addresses.home_id
      and homes.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.homes
    where homes.id = home_addresses.home_id
      and homes.owner_id = (select auth.uid())
  )
);

create policy "Owners can delete home addresses"
on public.home_addresses
for delete
to authenticated
using (
  exists (
    select 1 from public.homes
    where homes.id = home_addresses.home_id
      and homes.owner_id = (select auth.uid())
  )
);

-- Only a pending interest can be created. Participant IDs are immutable so an
-- interest cannot be repointed to manufacture an accepted match.
create or replace function public.enforce_interest_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'pending'::public.interest_status then
      raise exception 'New interests must start pending';
    end if;
    return new;
  end if;

  if new.from_profile_id is distinct from old.from_profile_id
    or new.to_profile_id is distinct from old.to_profile_id
    or new.created_at is distinct from old.created_at then
    raise exception 'Interest participants and creation time are immutable';
  end if;

  if new.status is not distinct from old.status then
    raise exception 'An interest update must change its status';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.enforce_interest_lifecycle() from public;

drop trigger if exists interests_enforce_lifecycle on public.interests;
create trigger interests_enforce_lifecycle
before insert or update on public.interests
for each row
execute procedure public.enforce_interest_lifecycle();

drop policy if exists "Users can create their interests" on public.interests;
create policy "Users can create pending interests"
on public.interests
for insert
to authenticated
with check (
  (select auth.uid()) = from_profile_id
  and status = 'pending'::public.interest_status
  and exists (
    select 1
    from public.profiles as profile
    where profile.id = interests.to_profile_id
      and profile.is_visible is true
      and profile.profile_status = 'active'::public.user_status
  )
);

-- A profile cannot be made discoverable until the fields needed for matching
-- are supplied. The UI should create these values before setting status active.
create or replace function public.enforce_profile_activation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.profile_status = 'active'::public.user_status
    and (tg_op = 'INSERT' or old.profile_status is distinct from new.profile_status) then
    if nullif(btrim(new.username), '') is null
      or nullif(btrim(new.first_name), '') is null
      or new.gender is null
      or not exists (
        select 1
        from public.profile_private
        where profile_id = new.id
          and date_of_birth is not null
          and location is not null
      ) then
      raise exception 'Complete your profile before activating it';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_profile_activation() from public;

drop trigger if exists profiles_enforce_activation on public.profiles;
create trigger profiles_enforce_activation
before insert or update of profile_status on public.profiles
for each row
execute procedure public.enforce_profile_activation();

-- Keep private-table timestamps and the existing contact timestamp current.
drop trigger if exists profile_contacts_updated_at on public.profile_contacts;
create trigger profile_contacts_updated_at
before update on public.profile_contacts
for each row
execute procedure public.handle_updated_at();

drop trigger if exists profile_private_updated_at on public.profile_private;
create trigger profile_private_updated_at
before update on public.profile_private
for each row
execute procedure public.handle_updated_at();

drop trigger if exists home_addresses_updated_at on public.home_addresses;
create trigger home_addresses_updated_at
before update on public.home_addresses
for each row
execute procedure public.handle_updated_at();

-- New Auth users receive all three owner-only setup rows. Existing users were
-- backfilled above.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id) values (new.id)
  on conflict (id) do nothing;

  insert into public.profile_private(profile_id) values (new.id)
  on conflict (profile_id) do nothing;

  insert into public.preferences(user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;

-- Direct profile/home reads are safe after the sensitive fields above have
-- moved out. The matching function still has controlled access to the private
-- fields but never returns them.
drop function if exists public.get_matches(uuid);

create function public.get_matches(requesting_profile_id uuid)
returns table (
  profile_id uuid,
  username text,
  first_name text,
  gender public.gender_type,
  home_id uuid,
  home_title text,
  home_city text,
  home_state text,
  home_rent integer,
  home_bedrooms integer,
  home_bathrooms numeric,
  home_available_from date,
  candidate_age integer,
  budget_overlap boolean,
  budget_overlap_min integer,
  budget_overlap_max integer,
  age_in_range boolean,
  preferred_gender_match boolean,
  smoking_preference_match boolean,
  pets_preference_match boolean,
  move_in_window_overlap boolean,
  move_in_overlap_from date,
  move_in_overlap_to date,
  distance_within_range boolean,
  distance_miles numeric,
  compatibility_percentage integer,
  is_fallback boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requester as (
    select
      profile.id,
      private_profile.location,
      profile.gender as requester_gender,
      extract(year from age(current_date, private_profile.date_of_birth))::integer as requester_age,
      preference.max_distance_miles,
      preference.budget_min,
      preference.budget_max,
      preference.move_in_from,
      preference.move_in_to,
      preference.preferred_gender,
      preference.min_age,
      preference.max_age,
      preference.smoking_preference,
      preference.pets_preference,
      preference.match_with_home_seekers,
      exists (
        select 1 from public.homes as home
        where home.owner_id = profile.id
          and home.status = 'active'::public.home_status
      ) as owns_active_home
    from public.profiles as profile
    join public.profile_private as private_profile on private_profile.profile_id = profile.id
    left join public.preferences as preference on preference.user_id = profile.id
    where profile.id = requesting_profile_id
      and profile.id = (select auth.uid())
  ),
  compatible_pool as (
    select
      candidate.id as profile_id,
      candidate.username,
      candidate.first_name,
      candidate.gender,
      candidate_home.id as home_id,
      candidate_home.title as home_title,
      candidate_home.city as home_city,
      candidate_home.state as home_state,
      candidate_home.rent as home_rent,
      candidate_home.bedrooms as home_bedrooms,
      candidate_home.bathrooms as home_bathrooms,
      candidate_home.available_from as home_available_from,
      extract(year from age(current_date, candidate_private.date_of_birth))::integer as candidate_age,
      candidate_private.location as candidate_location,
      requester.location as requester_location,
      requester.max_distance_miles,
      requester.budget_min as requester_budget_min,
      requester.budget_max as requester_budget_max,
      requester.move_in_from as requester_move_in_from,
      requester.move_in_to as requester_move_in_to,
      requester.preferred_gender,
      requester.requester_gender,
      requester.requester_age,
      requester.min_age,
      requester.max_age,
      requester.smoking_preference as requester_smoking_preference,
      requester.pets_preference as requester_pets_preference,
      preference.max_distance_miles as candidate_max_distance_miles,
      preference.preferred_gender as candidate_preferred_gender,
      preference.min_age as candidate_min_age,
      preference.max_age as candidate_max_age,
      preference.budget_min as candidate_budget_min,
      preference.budget_max as candidate_budget_max,
      preference.move_in_from as candidate_move_in_from,
      preference.move_in_to as candidate_move_in_to,
      preference.smoking_preference as candidate_smoking_preference,
      preference.pets_preference as candidate_pets_preference
    from requester
    join public.profiles as candidate on candidate.id <> requester.id
    join public.profile_private as candidate_private on candidate_private.profile_id = candidate.id
    left join public.preferences as preference on preference.user_id = candidate.id
    left join public.homes as candidate_home
      on candidate_home.owner_id = candidate.id
      and candidate_home.status = 'active'::public.home_status
    where candidate.is_visible is true
      and candidate.profile_status = 'active'::public.user_status
      and not exists (
        select 1 from public.interests as interest
        where (interest.from_profile_id = requester.id and interest.to_profile_id = candidate.id)
           or (interest.from_profile_id = candidate.id and interest.to_profile_id = requester.id)
      )
      and (
        (requester.owns_active_home and candidate_home.id is null)
        or (not requester.owns_active_home and candidate_home.id is not null)
        or (
          not requester.owns_active_home
          and requester.match_with_home_seekers is true
          and preference.match_with_home_seekers is true
          and candidate_home.id is null
        )
      )
  ),
  located as (
    select
      pool.*,
      case
        when pool.requester_location is not null and pool.candidate_location is not null
        then gis.st_distance(pool.requester_location, pool.candidate_location)
      end as distance_meters
    from compatible_pool as pool
  ),
  evaluated as (
    select
      pool.*,
      coalesce((
        pool.requester_budget_min is not null and pool.requester_budget_max is not null
        and pool.candidate_budget_min is not null and pool.candidate_budget_max is not null
        and int4range(pool.requester_budget_min, pool.requester_budget_max, '[]')
          && int4range(pool.candidate_budget_min, pool.candidate_budget_max, '[]')
      ), false) as budget_overlap,
      coalesce((
        pool.min_age is not null and pool.max_age is not null
        and pool.candidate_age is not null
        and pool.candidate_age between pool.min_age and pool.max_age
        and pool.candidate_min_age is not null and pool.candidate_max_age is not null
        and pool.requester_age is not null
        and pool.requester_age between pool.candidate_min_age and pool.candidate_max_age
      ), false) as age_in_range,
      coalesce((
        pool.preferred_gender is not null and pool.gender = pool.preferred_gender
        and pool.candidate_preferred_gender is not null
        and pool.requester_gender = pool.candidate_preferred_gender
      ), false) as preferred_gender_match,
      coalesce((
        pool.requester_smoking_preference is not null
        and pool.candidate_smoking_preference is not null
        and pool.requester_smoking_preference = pool.candidate_smoking_preference
      ), false) as smoking_preference_match,
      coalesce((
        pool.requester_pets_preference is not null
        and pool.candidate_pets_preference is not null
        and pool.requester_pets_preference = pool.candidate_pets_preference
      ), false) as pets_preference_match,
      coalesce((
        pool.requester_move_in_from is not null and pool.requester_move_in_to is not null
        and pool.candidate_move_in_from is not null and pool.candidate_move_in_to is not null
        and daterange(pool.requester_move_in_from, pool.requester_move_in_to, '[]')
          && daterange(pool.candidate_move_in_from, pool.candidate_move_in_to, '[]')
      ), false) as move_in_window_overlap,
      coalesce((
        pool.distance_meters is not null
        and pool.max_distance_miles is not null and pool.candidate_max_distance_miles is not null
        and pool.distance_meters <= pool.max_distance_miles::double precision * 1609.344
        and pool.distance_meters <= pool.candidate_max_distance_miles::double precision * 1609.344
      ), false) as distance_within_range,
      case when pool.distance_meters is not null
        then round((pool.distance_meters / 1609.344)::numeric, 2)
      end as distance_miles
    from located as pool
  ),
  scored as (
    select
      evaluated.*,
      (
        (budget_overlap::integer * 25) + (age_in_range::integer * 20)
        + (preferred_gender_match::integer * 15) + (smoking_preference_match::integer * 15)
        + (pets_preference_match::integer * 10) + (move_in_window_overlap::integer * 10)
        + (distance_within_range::integer * 5)
      )::integer as compatibility_percentage
    from evaluated
  ),
  results as (
    select
      profile_id, username, first_name, gender,
      home_id, home_title, home_city, home_state, home_rent, home_bedrooms,
      home_bathrooms, home_available_from, candidate_age, budget_overlap,
      case when budget_overlap then greatest(requester_budget_min, candidate_budget_min) end as budget_overlap_min,
      case when budget_overlap then least(requester_budget_max, candidate_budget_max) end as budget_overlap_max,
      age_in_range, preferred_gender_match, smoking_preference_match,
      pets_preference_match, move_in_window_overlap,
      case when move_in_window_overlap then greatest(requester_move_in_from, candidate_move_in_from) end as move_in_overlap_from,
      case when move_in_window_overlap then least(requester_move_in_to, candidate_move_in_to) end as move_in_overlap_to,
      distance_within_range, distance_miles, compatibility_percentage,
      false as is_fallback
    from scored
    where compatibility_percentage > 0

    union all

    select
      pool.profile_id, pool.username, pool.first_name, pool.gender,
      pool.home_id, pool.home_title, pool.home_city, pool.home_state, pool.home_rent,
      pool.home_bedrooms, pool.home_bathrooms, pool.home_available_from,
      pool.candidate_age, null::boolean, null::integer, null::integer,
      null::boolean, null::boolean, null::boolean, null::boolean,
      null::boolean, null::date, null::date, null::boolean, null::numeric,
      0, true
    from compatible_pool as pool
    where not exists (
      select 1 from scored where compatibility_percentage > 0
    )
  )
  select *
  from results
  order by is_fallback, compatibility_percentage desc, profile_id;
$$;

revoke execute on function public.get_matches(uuid) from public, anon;
grant execute on function public.get_matches(uuid) to authenticated;

-- Data API privileges for the owner-only tables. RLS remains the effective
-- authorization layer for these grants.
grant select, insert, update, delete
on public.profile_contacts, public.profile_private, public.home_addresses
to authenticated;

-- Database-level safeguards for common invalid values and photo state.
alter table public.preferences
  add constraint preferences_valid_age_range
    check (min_age is null or max_age is null or (min_age >= 18 and max_age <= 120 and min_age <= max_age)),
  add constraint preferences_valid_move_window
    check (move_in_from is null or move_in_to is null or move_in_from <= move_in_to),
  add constraint preferences_valid_distance
    check (max_distance_miles is null or max_distance_miles > 0);

update public.profile_photos set position = 0 where position is null;
update public.profile_photos set is_primary = false where is_primary is null;
alter table public.profile_photos
  alter column position set default 0,
  alter column position set not null,
  alter column is_primary set default false,
  alter column is_primary set not null,
  add constraint profile_photos_position_nonnegative check (position >= 0);

update public.home_photos set position = 0 where position is null;
update public.home_photos set is_primary = false where is_primary is null;
alter table public.home_photos
  alter column position set default 0,
  alter column position set not null,
  alter column is_primary set default false,
  alter column is_primary set not null,
  add constraint home_photos_position_nonnegative check (position >= 0);

create unique index if not exists profile_photos_one_primary_per_profile
  on public.profile_photos(user_id)
  where is_primary;

create unique index if not exists home_photos_one_primary_per_home
  on public.home_photos(home_id)
  where is_primary;

-- Private buckets enforce these SELECT policies. The bucket privacy and per
-- object restrictions are declared in config.toml for local development and
-- must be mirrored in the hosted project's Storage dashboard.
drop policy if exists "Public can view profile and home photos" on storage.objects;

create policy "Authenticated users can view safe profile and home photos"
on storage.objects
for select
to authenticated
using (
  (
    bucket_id = 'profile-photos'
    and exists (
      select 1
      from public.profile_photos as photo
      join public.profiles as profile on profile.id = photo.user_id
      where photo.storage_path = storage.objects.name
        and (
          profile.id = (select auth.uid())
          or (profile.is_visible is true and profile.profile_status = 'active'::public.user_status)
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
        and (home.owner_id = (select auth.uid()) or home.status = 'active'::public.home_status)
    )
  )
);
