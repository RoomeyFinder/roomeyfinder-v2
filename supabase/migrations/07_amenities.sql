create table public.amenities (

  id uuid primary key default uuid_generate_v4(),

  name text unique not null,

  slug text unique not null,

  icon text
);



create table public.home_amenities (

  home_id uuid
    references public.homes(id)
    on delete cascade,

  amenity_id uuid
    references public.amenities(id)
    on delete cascade,

  primary key(home_id, amenity_id)

);