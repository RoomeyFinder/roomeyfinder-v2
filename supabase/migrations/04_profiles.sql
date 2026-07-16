

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (

  id uuid primary key
    references auth.users(id)
    on delete cascade,


  username text unique,

  first_name text,
  last_name text,


  date_of_birth date,

  gender public.gender_type,


  occupation text,

  bio text,

  -- geographic location
  location geography(Point,4326),


  -- discovery controls
  is_visible boolean default true,

  is_verified boolean default false,

  created_at timestamptz default now(),

  updated_at timestamptz default now(),
  
  profile_status public.user_status
);


-- Contact details are private and are only visible to the owner and an
-- accepted match. They must not live on the publicly discoverable profile.
create table public.profile_contacts (

  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  contact_phone text,

  contact_email text,

  created_at timestamptz default now(),

  updated_at timestamptz default now()

);


-- ============================================================
-- PROFILE PHOTOS
-- ============================================================

create table public.profile_photos (

  id uuid primary key default uuid_generate_v4(),


  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  
  storage_path text not null,


  position integer default 0,
  
  is_primary boolean,

  created_at timestamptz default now()

);
