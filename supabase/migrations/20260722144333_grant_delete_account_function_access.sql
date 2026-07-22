-- The delete-account Edge Function uses the admin key through the Data API
-- to collect storage paths before removing the auth user. The service_role
-- still needs table privileges when automatic exposure is disabled.
grant usage on schema public to service_role;

grant select
on public.profile_photos,
  public.homes,
  public.home_photos
to service_role;
