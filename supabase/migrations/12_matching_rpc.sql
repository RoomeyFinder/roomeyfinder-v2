-- ============================================================
-- MATCHING RPC
-- ============================================================
-- This function deliberately runs as the definer because preferences are
-- private under RLS. Its auth.uid() guard ensures a caller can only request
-- matches for their own profile.

create or replace function public.get_matches(requesting_profile_id uuid)
returns table (
  profile_id uuid,
  username text,
  first_name text,
  last_name text,
  date_of_birth date,
  gender public.gender_type,
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
  match_score integer,
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
      profile.location,
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
        select 1
        from public.homes as home
        where home.owner_id = profile.id
          and home.status = 'active'::public.home_status
      ) as owns_active_home
    from public.profiles as profile
    left join public.preferences as preference
      on preference.user_id = profile.id
    where profile.id = requesting_profile_id
      and profile.id = (select auth.uid())
  ),
  compatible_pool as (
    select
      candidate.id as profile_id,
      candidate.username,
      candidate.first_name,
      candidate.last_name,
      candidate.date_of_birth,
      candidate.gender,
      extract(year from age(current_date, candidate.date_of_birth))::integer as candidate_age,
      candidate.location as candidate_location,
      requester.location as requester_location,
      requester.max_distance_miles,
      requester.budget_min as requester_budget_min,
      requester.budget_max as requester_budget_max,
      requester.move_in_from as requester_move_in_from,
      requester.move_in_to as requester_move_in_to,
      requester.preferred_gender,
      requester.min_age,
      requester.max_age,
      requester.smoking_preference as requester_smoking_preference,
      requester.pets_preference as requester_pets_preference,
      preference.budget_min as candidate_budget_min,
      preference.budget_max as candidate_budget_max,
      preference.move_in_from as candidate_move_in_from,
      preference.move_in_to as candidate_move_in_to,
      preference.smoking_preference as candidate_smoking_preference,
      preference.pets_preference as candidate_pets_preference
    from requester
    join public.profiles as candidate
      on candidate.id <> requester.id
    left join public.preferences as preference
      on preference.user_id = candidate.id
    where candidate.is_visible is true
      and candidate.profile_status = 'active'::public.user_status
      and (
        (
          requester.owns_active_home
          and not exists (
            select 1
            from public.homes as candidate_home
            where candidate_home.owner_id = candidate.id
              and candidate_home.status = 'active'::public.home_status
          )
        )
        or (
          not requester.owns_active_home
          and exists (
            select 1
            from public.homes as candidate_home
            where candidate_home.owner_id = candidate.id
              and candidate_home.status = 'active'::public.home_status
          )
        )
        or (
          not requester.owns_active_home
          and requester.match_with_home_seekers is true
          and preference.match_with_home_seekers is true
          and not exists (
            select 1
            from public.homes as candidate_home
            where candidate_home.owner_id = candidate.id
              and candidate_home.status = 'active'::public.home_status
          )
        )
      )
  ),
  evaluated as (
    select
      pool.*,
      coalesce((
        pool.requester_budget_min is not null
        and pool.requester_budget_max is not null
        and pool.candidate_budget_min is not null
        and pool.candidate_budget_max is not null
        and int4range(pool.requester_budget_min, pool.requester_budget_max, '[]')
          && int4range(pool.candidate_budget_min, pool.candidate_budget_max, '[]')
      ), false) as budget_overlap,
      coalesce((
        pool.min_age is not null
        and pool.max_age is not null
        and pool.candidate_age is not null
        and pool.candidate_age between pool.min_age and pool.max_age
      ), false) as age_in_range,
      coalesce((
        pool.preferred_gender is not null
        and pool.gender = pool.preferred_gender
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
        pool.requester_move_in_from is not null
        and pool.requester_move_in_to is not null
        and pool.candidate_move_in_from is not null
        and pool.candidate_move_in_to is not null
        and daterange(pool.requester_move_in_from, pool.requester_move_in_to, '[]')
          && daterange(pool.candidate_move_in_from, pool.candidate_move_in_to, '[]')
      ), false) as move_in_window_overlap,
      coalesce((
        pool.requester_location is not null
        and pool.candidate_location is not null
        and pool.max_distance_miles is not null
        and public.st_dwithin(
          pool.requester_location,
          pool.candidate_location,
          pool.max_distance_miles::double precision * 1609.344
        )
      ), false) as distance_within_range,
      case
        when pool.requester_location is not null
          and pool.candidate_location is not null
        then round((public.st_distance(pool.requester_location, pool.candidate_location) / 1609.344)::numeric, 2)
      end as distance_miles
    from compatible_pool as pool
  ),
  scored as (
    select
      evaluated.*,
      (
        (budget_overlap::integer * 25)
        + (age_in_range::integer * 20)
        + (preferred_gender_match::integer * 15)
        + (smoking_preference_match::integer * 15)
        + (pets_preference_match::integer * 10)
        + (move_in_window_overlap::integer * 10)
        + (distance_within_range::integer * 5)
      )::integer as match_score
    from evaluated
  ),
  results as (
    select
      profile_id,
      username,
      first_name,
      last_name,
      date_of_birth,
      gender,
      candidate_age,
      budget_overlap,
      case when budget_overlap then greatest(requester_budget_min, candidate_budget_min) end as budget_overlap_min,
      case when budget_overlap then least(requester_budget_max, candidate_budget_max) end as budget_overlap_max,
      age_in_range,
      preferred_gender_match,
      smoking_preference_match,
      pets_preference_match,
      move_in_window_overlap,
      case when move_in_window_overlap then greatest(requester_move_in_from, candidate_move_in_from) end as move_in_overlap_from,
      case when move_in_window_overlap then least(requester_move_in_to, candidate_move_in_to) end as move_in_overlap_to,
      distance_within_range,
      distance_miles,
      match_score,
      false as is_fallback
    from scored
    where match_score > 0

    union all

    select
      pool.profile_id,
      pool.username,
      pool.first_name,
      pool.last_name,
      pool.date_of_birth,
      pool.gender,
      pool.candidate_age,
      null::boolean,
      null::integer,
      null::integer,
      null::boolean,
      null::boolean,
      null::boolean,
      null::boolean,
      null::boolean,
      null::date,
      null::date,
      null::boolean,
      null::numeric,
      null::integer,
      true
    from compatible_pool as pool
    where not exists (
      select 1
      from scored
      where match_score > 0
    )
  )
  select *
  from results
  order by is_fallback, match_score desc nulls last, profile_id;
$$;

revoke execute on function public.get_matches(uuid) from public, anon;
grant execute on function public.get_matches(uuid) to authenticated;
