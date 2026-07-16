
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


