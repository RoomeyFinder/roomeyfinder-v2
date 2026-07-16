-- ============================================================
-- HOME DRAFTS AND PUBLISH VALIDATION
-- ============================================================

update public.homes
set status = 'draft'::public.home_status
where status is null;

alter table public.homes
  alter column status set default 'draft'::public.home_status,
  add constraint homes_rent_positive check (rent is null or rent > 0),
  add constraint homes_deposit_nonnegative check (deposit is null or deposit >= 0),
  add constraint homes_bedrooms_positive check (bedrooms is null or bedrooms > 0),
  add constraint homes_bathrooms_positive check (bathrooms is null or bathrooms > 0);

-- A draft is deliberately allowed to be incomplete. Moving it to active is the
-- publish action and is only allowed once it is safe and useful to show.
create or replace function public.enforce_home_publish_requirements()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'active'::public.home_status
    and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if nullif(btrim(new.title), '') is null
      or nullif(btrim(new.description), '') is null
      or nullif(btrim(new.city), '') is null
      or nullif(btrim(new.state), '') is null
      or nullif(btrim(new.country), '') is null
      or new.rent is null
      or new.bedrooms is null
      or new.bathrooms is null
      or new.available_from is null
      or not exists (
        select 1
        from public.home_addresses
        where home_id = new.id
          and location is not null
          and nullif(btrim(street), '') is not null
      )
      or not exists (
        select 1
        from public.home_photos
        where home_id = new.id
          and is_primary is true
      ) then
      raise exception 'Complete the listing, address, and primary photo before publishing it';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_home_publish_requirements() from public;

drop trigger if exists homes_enforce_publish_requirements on public.homes;
create trigger homes_enforce_publish_requirements
before insert or update of status on public.homes
for each row
execute procedure public.enforce_home_publish_requirements();
