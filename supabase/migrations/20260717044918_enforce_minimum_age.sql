-- Keep the minimum age requirement enforced for direct database/API writes as
-- well as through the onboarding form.
alter table public.profile_private
  drop constraint if exists profile_private_date_of_birth_check;

alter table public.profile_private
  add constraint profile_private_date_of_birth_check
  check (
    date_of_birth is null
    or date_of_birth <= (current_date - interval '18 years')::date
  );
