-- Idempotency state for interest notification webhooks. This table is kept
-- private and is accessed only by the service-role Edge Function.
create table public.interest_notification_events (
  id uuid primary key default uuid_generate_v4(),
  interest_id uuid not null references public.interests(id) on delete cascade,
  event_type text not null check (event_type in ('new_request', 'accepted_request')),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  provider_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (interest_id, event_type)
);

create index interest_notification_events_pending_idx
  on public.interest_notification_events (status, created_at)
  where status in ('pending', 'failed');

alter table public.interest_notification_events enable row level security;
revoke all on public.interest_notification_events from public, anon, authenticated;
