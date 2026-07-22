-- Account inactivity lifecycle support.
-- The scheduled Edge Function owns the six-month clock and privileged
-- operations. This table only stores idempotency state and whether a profile
-- was archived by the lifecycle process.

create type public.account_inactivity_stage as enum (
  'three_months',
  'one_month',
  'seven_days',
  'twenty_four_hours'
);

create table public.account_inactivity (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  cycle_started_at timestamptz not null,

  last_warning_stage public.account_inactivity_stage,

  pending_deletion boolean not null default false,

  deactivated_by_inactivity boolean not null default false,

  final_notice_sent_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index account_inactivity_pending_deletion_idx
  on public.account_inactivity (pending_deletion)
  where pending_deletion is true;

alter table public.account_inactivity enable row level security;

-- This is an internal lifecycle table. Users reset it through the guarded RPC
-- below; they must not be able to edit the warning/deletion fields directly.
revoke all on public.account_inactivity from public, anon, authenticated;

create trigger account_inactivity_updated_at
before update on public.account_inactivity
for each row
execute procedure public.handle_updated_at();

-- Called after a successful sign-in. The caller can only reset their own
-- record, and an inactivity archive is reversed immediately.
create or replace function public.reset_account_inactivity()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  should_restore_profile boolean := false;
  existing_cycle_started_at timestamptz;
  current_last_sign_in_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'An authenticated user is required';
  end if;

  select
    inactivity.deactivated_by_inactivity,
    inactivity.cycle_started_at
  into
    should_restore_profile,
    existing_cycle_started_at
  from public.account_inactivity
  where user_id = current_user_id;

  select last_sign_in_at
  into current_last_sign_in_at
  from auth.users
  where id = current_user_id;

  -- Calling the RPC with an old persistent session must not reset the clock;
  -- only a newer Auth sign-in timestamp can start a new cycle.
  if existing_cycle_started_at is not null
    and (current_last_sign_in_at is null
      or current_last_sign_in_at <= existing_cycle_started_at) then
    return;
  end if;

  insert into public.account_inactivity (
    user_id,
    cycle_started_at,
    last_warning_stage,
    pending_deletion,
    deactivated_by_inactivity,
    final_notice_sent_at
  )
  values (
    current_user_id,
    coalesce(current_last_sign_in_at, now()),
    null,
    false,
    false,
    null
  )
  on conflict (user_id) do update
  set cycle_started_at = excluded.cycle_started_at,
      last_warning_stage = null,
      pending_deletion = false,
      deactivated_by_inactivity = false,
      final_notice_sent_at = null;

  if should_restore_profile then
    update public.profiles
    set profile_status = 'active'::public.user_status
    where id = current_user_id
      and profile_status = 'archived'::public.user_status;
  end if;
end;
$$;

revoke execute on function public.reset_account_inactivity() from public, anon;
grant execute on function public.reset_account_inactivity() to authenticated;
