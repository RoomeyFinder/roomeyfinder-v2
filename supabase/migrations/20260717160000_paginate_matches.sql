-- Keep matching work on the database while allowing the UI to request results
-- in stable, appendable batches.
create or replace function public.get_matches(
  requesting_profile_id uuid,
  result_limit integer default 12,
  result_offset integer default 0
)
returns table (
  profile_id uuid, username text, first_name text, gender public.gender_type,
  home_id uuid, home_title text, home_city text, home_state text, home_rent integer,
  home_bedrooms integer, home_bathrooms numeric, home_available_from date,
  candidate_age integer, budget_overlap boolean, budget_overlap_min integer,
  budget_overlap_max integer, age_in_range boolean, preferred_gender_match boolean,
  smoking_preference_match boolean, pets_preference_match boolean,
  move_in_window_overlap boolean, move_in_overlap_from date, move_in_overlap_to date,
  distance_within_range boolean, distance_miles numeric, compatibility_percentage integer,
  is_fallback boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.get_matches(requesting_profile_id)
  order by is_fallback, compatibility_percentage desc, profile_id
  limit greatest(result_limit, 1)
  offset greatest(result_offset, 0);
$$;

revoke execute on function public.get_matches(uuid, integer, integer) from public, anon;
grant execute on function public.get_matches(uuid, integer, integer) to authenticated;
