
-- ============================================================
-- HOMES
-- ============================================================

create table public.homes (

  id uuid primary key default uuid_generate_v4(),


  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,


  title text,

  description text,


  location gis.geography(Point,4326),


  street text,

  city text,

  state text,

  country text,

  postal_code text,


  rent integer,

  deposit integer,


  bedrooms integer,

  bathrooms numeric,


  available_from date,


  status public.home_status default 'active',


  created_at timestamptz default now(),

  updated_at timestamptz default now()

);


-- ============================================================
-- HOME PHOTOS
-- ============================================================

create table public.home_photos (

  id uuid primary key default uuid_generate_v4(),


  home_id uuid not null
    references public.homes(id)
    on delete cascade,


  storage_path text not null,


  position integer default 0,

  is_primary boolean,
  
  created_at timestamptz default now()

);
