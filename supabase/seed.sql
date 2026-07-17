-- Local development seed data.
--
-- This file is intentionally deterministic and self-contained. `supabase db
-- reset` runs it after all migrations, which makes the whole database
-- repeatable. The delete is scoped to this seed's email namespace so this
-- file can also be run against an existing development database without
-- touching real users.

delete from auth.users
where email like 'seed.%@example.test';

insert into public.amenities (name, icon, slug)
values
  ('WiFi', 'wifi', 'wifi'),
  ('Parking', 'car', 'car'),
  ('Laundry', 'washing-machine', 'washing-machine'),
  ('Gym', 'dumbbell', 'gym'),
  ('Balcony', 'building', 'balcony'),
  ('Air Conditioning', 'snowflake', 'air-conditioning'),
  ('Dishwasher', 'utensils', 'dishwasher'),
  ('Furnished', 'sofa', 'furniture')
on conflict (slug) do update
set name = excluded.name,
    icon = excluded.icon;

do $$
declare
  first_names text[] := array[
    'Ada', 'Ben', 'Chioma', 'David', 'Efe', 'Fatima', 'Grace', 'Hassan',
    'Ife', 'Joshua', 'Kemi', 'Liam', 'Maya', 'Nnamdi', 'Olivia', 'Peter',
    'Amina', 'Bola', 'Chidi', 'Dami', 'Eniola', 'Farouk', 'Gloria', 'Hauwa',
    'Ibrahim', 'Jade', 'Kelechi', 'Lola', 'Mariam', 'Nathan', 'Osas', 'Peace',
    'Amaka', 'Bayo', 'Clara', 'Daniel', 'Esther', 'Femi', 'Gift', 'Henry',
    'Irene', 'Jide', 'Khadija', 'Louis', 'Morenike', 'Noah', 'Oge', 'Paul'
  ];
  last_names text[] := array[
    'Adeyemi', 'Bello', 'Okafor', 'Mensah', 'Ibekwe', 'Abubakar', 'Okoro', 'Yusuf',
    'Eze', 'Williams', 'Adebayo', 'Obi', 'Nwosu', 'Garba', 'Johnson', 'Ibrahim',
    'Balogun', 'Cole', 'Ezeh', 'Olawale', 'Udo', 'Sani', 'Duru', 'Mohammed',
    'Usman', 'Akinyemi', 'Nwachukwu', 'Ojo', 'Sule', 'Brown', 'Okeke', 'Danladi',
    'Onyeka', 'Lawal', 'Adams', 'Ezeani', 'Afolabi', 'Ogunleye', 'James', 'Umar',
    'Oyekan', 'Adekunle', 'Bashir', 'Martin', 'Akinola', 'Smith', 'Nnamani', 'George'
  ];
  occupations text[] := array[
    'Product designer', 'Software engineer', 'Teacher', 'Nurse',
    'Photographer', 'Accountant', 'Marketing manager', 'Civil engineer'
  ];
  bios text[] := array[
    'Calm, tidy, and usually up for a shared meal or a good conversation.',
    'I work hard, keep shared spaces clean, and enjoy a peaceful home.',
    'Looking for a respectful home with people who communicate clearly.',
    'Friendly and independent. I value a clean kitchen and a relaxed atmosphere.'
  ];
  genders public.gender_type[] := array[
    'female', 'male', 'female', 'male', 'non_binary', 'female', 'male', 'female'
  ];
  city_names text[] := array['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt'];
  state_names text[] := array['Lagos', 'FCT', 'Oyo', 'Rivers'];
  city_lons numeric[] := array[3.3792, 7.4951, 3.9470, 7.0134];
  city_lats numeric[] := array[6.5244, 9.0579, 7.3775, 4.8156];
  lifestyle_labels text[] := array['quiet', 'social', 'early-bird', 'flexible'];
  v_user_id uuid;
  v_home_id uuid;
  email_address text;
  category text;
  city_index integer;
  lifestyle_index integer;
  budget_min_value integer;
  budget_max_value integer;
  home_rent_value integer;
  home_lat numeric;
  home_lon numeric;
  preferred_gender_value public.gender_type;
  smoking_value public.smoking_type;
  pets_value public.pets_type;
begin
  for i in 1..48 loop
    v_user_id := format(
      '00000000-0000-0000-0000-%s',
      lpad(i::text, 12, '0')
    )::uuid;

    if i <= 16 then
      category := 'homeowner';
    elsif i <= 32 then
      category := 'pair';
    else
      category := 'home-seeker';
    end if;

    email_address := format('seed.%s.%s@example.test', category, lpad(i::text, 2, '0'));

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      email_address,
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('seed_role', category),
      now(),
      now()
    );

    city_index := ((i - 1) % 4) + 1;
    lifestyle_index := ((i - 1) % 4) + 1;
    budget_min_value := case ((i - 1) % 4)
      when 0 then 150000
      when 1 then 220000
      when 2 then 300000
      else 400000
    end;
    budget_max_value := case ((i - 1) % 4)
      when 0 then 280000
      when 1 then 360000
      when 2 then 470000
      else 650000
    end;

    preferred_gender_value := genders[((i - 1) % array_length(genders, 1)) + 1];
    smoking_value := case lifestyle_index
      when 1 then 'no'::public.smoking_type
      when 2 then 'outside_only'::public.smoking_type
      when 3 then 'no'::public.smoking_type
      else 'outside_only'::public.smoking_type
    end;
    pets_value := case lifestyle_index
      when 1 then 'no'::public.pets_type
      when 2 then 'yes'::public.pets_type
      when 3 then 'depends'::public.pets_type
      else 'no'::public.pets_type
    end;

    -- Populate the discoverable profile fields first. Sensitive fields live
    -- in profile_private and are filled before the profile is activated.
    update public.profiles
    set username = format('seed_%s_%s', category, lpad(i::text, 2, '0')),
        first_name = first_names[i],
        gender = genders[((i - 1) % array_length(genders, 1)) + 1],
        occupation = occupations[((i - 1) % array_length(occupations, 1)) + 1],
        bio = format('%s I am %s about sharing a home.', bios[((i - 1) % array_length(bios, 1)) + 1], lifestyle_labels[lifestyle_index]),
        is_visible = true,
        is_verified = false,
        profile_status = null
    where id = v_user_id;

    update public.profile_private
    set last_name = last_names[i],
        date_of_birth = date '1988-01-15' + ((i - 1) % 14) * 120,
        location = gis.st_setsrid(
          gis.st_makepoint(
            city_lons[city_index] + (((i - 1) / 4) % 4) * 0.008,
            city_lats[city_index] + (((i - 1) % 4) - 1.5) * 0.008
          ),
          4326
        )::gis.geography
    where profile_id = v_user_id;

    update public.preferences
    set max_distance_miles = case when i % 5 = 0 then 8 else 35 end,
        budget_min = budget_min_value,
        budget_max = budget_max_value,
        move_in_from = current_date + 21 + ((i - 1) % 4) * 14,
        move_in_to = current_date + 75 + ((i - 1) % 4) * 14,
        preferred_gender = preferred_gender_value,
        min_age = 24,
        max_age = 42,
        smoking_preference = smoking_value,
        pets_preference = pets_value,
        match_with_home_seekers = (category = 'pair')
    where preferences.user_id = v_user_id;

    update public.profiles
    set profile_status = 'active'::public.user_status
    where id = v_user_id;

    if category = 'homeowner' then
      v_home_id := format(
        '00000000-0000-0000-0000-%s',
        lpad((200 + i)::text, 12, '0')
      )::uuid;
      home_lon := city_lons[city_index] + (((i - 1) % 4) - 1.5) * 0.012;
      home_lat := city_lats[city_index] + (((i - 1) / 4) % 4) * 0.01;
      home_rent_value := budget_min_value + 25000;

      -- Homes are inserted as drafts, then published after their address and
      -- primary photo exist, exactly like the onboarding flow does.
      insert into public.homes (
        id,
        owner_id,
        title,
        description,
        city,
        state,
        country,
        rent,
        deposit,
        bedrooms,
        bathrooms,
        available_from
      )
      values (
        v_home_id,
        v_user_id,
        format('%s room in a %s home', case when i % 3 = 0 then 'Bright' when i % 3 = 1 then 'Quiet' else 'Furnished' end, city_names[city_index]),
        format('A comfortable %s home with a respectful household and room to settle in. Close to everyday essentials in %s.', lifestyle_labels[lifestyle_index], city_names[city_index]),
        city_names[city_index],
        state_names[city_index],
        'Nigeria',
        home_rent_value,
        home_rent_value,
        case when i % 3 = 0 then 3 when i % 3 = 1 then 2 else 4 end,
        case when i % 3 = 0 then 2.0 else 1.5 end,
        current_date + 14 + ((i - 1) % 4) * 14
      );

      insert into public.home_addresses (home_id, location, street, postal_code)
      values (
        v_home_id,
        gis.st_setsrid(gis.st_makepoint(home_lon, home_lat), 4326)::gis.geography,
        format('%s %s Street', 10 + i, case when i % 2 = 0 then 'Palm' else 'Garden' end),
        format('10%s%s', city_index, lpad(i::text, 2, '0'))
      );

      -- The object is intentionally represented by a deterministic path. The
      -- browser will show its existing "Preview unavailable" state until a
      -- real image is uploaded, while the row satisfies publish validation.
      insert into public.home_photos (home_id, storage_path, position, is_primary)
      values (v_home_id, format('seed/home-%s/cover.jpg', lpad(i::text, 2, '0')), 0, true);

      insert into public.home_amenities (home_id, amenity_id)
      select v_home_id, amenity.id
      from public.amenities as amenity
      where amenity.slug = any(case
        when i % 3 = 0 then array['wifi', 'parking', 'gym', 'balcony']
        when i % 3 = 1 then array['wifi', 'laundry', 'furniture', 'air-conditioning']
        else array['wifi', 'parking', 'laundry', 'dishwasher']
      end);

      update public.homes
      set status = 'active'::public.home_status
      where id = v_home_id;
    end if;
  end loop;
end;
$$;

-- Quick sanity checks make a failed/incomplete seed fail during `db reset`
-- instead of leaving a confusing half-populated browser environment.
do $$
begin
  if (select count(*) from public.profiles where username like 'seed_%') <> 48 then
    raise exception 'Expected 48 seeded profiles';
  end if;

  if (select count(*) from public.homes where owner_id in (select id from public.profiles where username like 'seed_homeowner_%') and status = 'active') <> 16 then
    raise exception 'Expected 16 active seeded homes';
  end if;

  if (select count(*) from public.home_photos where home_id in (select id from public.homes where owner_id in (select id from public.profiles where username like 'seed_homeowner_%'))) <> 16 then
    raise exception 'Expected one primary photo row per seeded home';
  end if;

  if (select count(*) from public.preferences where user_id in (select id from public.profiles where username like 'seed_pair_%') and match_with_home_seekers is true) <> 16 then
    raise exception 'Expected 16 seeker-to-seeker opt-in profiles';
  end if;

  if (select count(*) from public.preferences where user_id in (select id from public.profiles where username like 'seed_home-seeker_%') and match_with_home_seekers is false) <> 16 then
    raise exception 'Expected 16 homeowner-only seeker profiles';
  end if;

  if (select count(*) from public.preferences where user_id in (select id from public.profiles where username like 'seed_homeowner_%') and match_with_home_seekers is true) <> 0 then
    raise exception 'Homeowners must not opt into seeker-to-seeker matching';
  end if;
end;
$$;
