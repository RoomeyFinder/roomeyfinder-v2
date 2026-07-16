-- ============================================================
-- ENUMS
-- ============================================================

create type public.gender_type as enum (
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
);


create type public.smoking_type as enum (
  'yes',
  'no',
  'outside_only'
);


create type public.pets_type as enum (
  'yes',
  'no',
  'depends'
);


create type public.home_status as enum (
  'active',
  'archived'
);

create type public.user_status as enum (
  'active',
  'archived'
);
