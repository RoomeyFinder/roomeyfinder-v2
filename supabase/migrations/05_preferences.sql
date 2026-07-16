
-- ============================================================
-- USER MATCHING PREFERENCES
-- ============================================================

create table public.preferences (

  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,


  max_distance_miles integer default 25,


  budget_min integer,

  budget_max integer,


  move_in_from date,

  move_in_to date,


  preferred_gender public.gender_type,


  min_age integer,

  max_age integer,


  smoking_preference public.smoking_type,

  pets_preference public.pets_type,


  created_at timestamptz default now(),

  updated_at timestamptz default now(),


  constraint valid_budget
    check (
      budget_min is null
      or
      budget_max is null
      or
      budget_min <= budget_max
    )

);


-- ============================================================
-- PROFILE INTERESTS
-- ============================================================

create table public.interests (

  id uuid primary key default uuid_generate_v4(),


  from_profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  to_profile_id uuid not null
    references public.profiles(id)
    on delete cascade,


  created_at timestamptz default now(),


  constraint interests_from_profile_id_to_profile_id_key
    unique (from_profile_id, to_profile_id)

);

