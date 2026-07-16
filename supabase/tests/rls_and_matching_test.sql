BEGIN;
SELECT plan(12);

-- These users exercise the Auth trigger as well as the RLS policies. The test
-- transaction is rolled back, so no users or listings are retained locally.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'casey@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dana@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

update public.profiles
set username = case id
  when '00000000-0000-0000-0000-000000000101'::uuid then 'alice'
  when '00000000-0000-0000-0000-000000000102'::uuid then 'bob'
  when '00000000-0000-0000-0000-000000000103'::uuid then 'casey'
  when '00000000-0000-0000-0000-000000000104'::uuid then 'dana'
end,
first_name = case id
  when '00000000-0000-0000-0000-000000000101'::uuid then 'Alice'
  when '00000000-0000-0000-0000-000000000102'::uuid then 'Bob'
  when '00000000-0000-0000-0000-000000000103'::uuid then 'Casey'
  when '00000000-0000-0000-0000-000000000104'::uuid then 'Dana'
end,
gender = 'female'::public.gender_type;

update public.profile_private
set date_of_birth = date '1995-06-15',
    location = gis.st_setsrid(gis.st_makepoint(-0.1276, 51.5072), 4326)::gis.geography;

update public.profiles
set profile_status = 'active'::public.user_status;

insert into public.profile_contacts (profile_id, contact_email)
values ('00000000-0000-0000-0000-000000000101', 'alice-private@example.test');

select hasnt_column('public', 'profiles', 'date_of_birth', 'Birth dates are not in discoverable profiles');
select hasnt_column('public', 'profiles', 'location', 'Exact profile locations are not in discoverable profiles');
select hasnt_column('public', 'homes', 'street', 'Street addresses are not in discoverable homes');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
set local role authenticated;

select throws_ok(
  $$insert into public.interests (from_profile_id, to_profile_id, status)
    values ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', 'accepted')$$,
  'P0001',
  'New interests must start pending',
  'A sender cannot create an accepted interest'
);

select lives_ok(
  $$insert into public.interests (from_profile_id, to_profile_id)
    values ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102')$$,
  'A sender can create a pending interest'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);

select throws_ok(
  $$update public.interests
    set from_profile_id = '00000000-0000-0000-0000-000000000103', status = 'accepted'
    where from_profile_id = '00000000-0000-0000-0000-000000000101'
      and to_profile_id = '00000000-0000-0000-0000-000000000102'$$,
  'P0001',
  'Interest participants and creation time are immutable',
  'A recipient cannot repoint an interest'
);

select lives_ok(
  $$update public.interests
    set status = 'accepted'
    where from_profile_id = '00000000-0000-0000-0000-000000000101'
      and to_profile_id = '00000000-0000-0000-0000-000000000102'$$,
  'A recipient can accept a pending interest'
);

select is(
  (select contact_email from public.profile_contacts where profile_id = '00000000-0000-0000-0000-000000000101'),
  'alice-private@example.test',
  'An accepted match can read the sender contact'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
select is_empty(
  $$select 1 from public.profile_contacts where profile_id = '00000000-0000-0000-0000-000000000101'$$,
  'An unrelated user cannot read a private contact'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

insert into public.homes (
  id, owner_id, title, description, city, state, country, rent, bedrooms, bathrooms, available_from
)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Sunny room', 'A quiet furnished room', 'London', 'London', 'United Kingdom', 1200, 1, 1, current_date + 30
);

select is(
  (select status::text from public.homes where id = '00000000-0000-0000-0000-000000000201'),
  'draft',
  'New homes start as drafts'
);

select throws_ok(
  $$update public.homes set status = 'active'
    where id = '00000000-0000-0000-0000-000000000201'$$,
  'P0001',
  'Complete the listing, address, and primary photo before publishing it',
  'An incomplete draft cannot be published'
);

insert into public.home_addresses (home_id, location, street, postal_code)
values (
  '00000000-0000-0000-0000-000000000201',
  gis.st_setsrid(gis.st_makepoint(-0.1276, 51.5072), 4326)::gis.geography,
  '1 Example Street', 'SW1A 1AA'
);

insert into public.home_photos (home_id, storage_path, is_primary)
values ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101/home.jpg', true);

update public.homes
set status = 'active'
where id = '00000000-0000-0000-0000-000000000201';

select results_eq(
  $$select profile_id from public.get_matches('00000000-0000-0000-0000-000000000101')$$,
  $$values
    ('00000000-0000-0000-0000-000000000103'::uuid),
    ('00000000-0000-0000-0000-000000000104'::uuid)$$,
  'The matching RPC returns compatible users and excludes an existing interest'
);

SELECT * FROM finish();
ROLLBACK;
