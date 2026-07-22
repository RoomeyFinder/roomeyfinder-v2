# Interest email notifications

The `interest-notifications` Edge Function sends two transactional emails:

- when a pending interest is created, to the recipient;
- when a recipient accepts a pending interest, to the original sender.

The function uses the existing Resend configuration:

```text
RESEND_API_KEY=<Resend sending API key>
INACTIVITY_FROM_EMAIL=RoomeyFinder <notifications@mail.roomeyfinder.com>
APP_URL=https://your-production-domain.com
INTEREST_NOTIFICATION_WEBHOOK_SECRET=<long random value>
```

Set these as Supabase Edge Function secrets. Supabase automatically provides
the admin secret key to Edge Functions through `SUPABASE_SECRET_KEYS`; do not
try to create a custom secret whose name starts with `SUPABASE_`. Never add
secrets to a `NEXT_PUBLIC_` variable or commit them to the repository.

## Create the database webhooks

After deploying the function, create two Database Webhooks in the Supabase
Dashboard for `public.interests`:

1. `interest-created`: event `INSERT`
2. `interest-accepted`: event `UPDATE`

Both should call:

```text
https://<project-ref>.supabase.co/functions/v1/interest-notifications
```

Add these request headers to each webhook:

```text
Content-Type: application/json
x-interest-notification-secret: <same value as INTEREST_NOTIFICATION_WEBHOOK_SECRET>
```

The function only sends an INSERT notification for a pending interest and only
sends an UPDATE notification when the status changes from `pending` to
`accepted`. The `interest_notification_events` table prevents duplicate emails
when a webhook is retried.
