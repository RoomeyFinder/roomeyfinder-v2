
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

create type public.interest_status as enum (
  'pending',
  'accepted',
  'declined'
);


create table public.interests (

  id uuid primary key default uuid_generate_v4(),

  from_profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  to_profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  status public.interest_status default 'pending',

  created_at timestamptz default now(),

  updated_at timestamptz default now(),

  constraint interests_from_to_unique
    unique(from_profile_id, to_profile_id),

  constraint cannot_interest_self
    check(from_profile_id <> to_profile_id)

);


create index interests_received_idx
on public.interests(to_profile_id);


create index interests_sent_idx
on public.interests(from_profile_id);
