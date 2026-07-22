# Account inactivity lifecycle

The account inactivity job gives users six months from their last completed
sign-in (or account creation, if they have never signed in) before deleting the
account. It sends reminders at three months, one month, seven days, and 24 hours
remaining. Once the first reminder is sent, the profile is archived so it no
longer appears in matching results. A successful sign-in resets the cycle and
restores a profile archived by this process.

The implementation is split into:

- `supabase/migrations/20260722100000_account_inactivity.sql` for lifecycle state
  and the authenticated reset function.
- `supabase/functions/process-account-inactivity/index.ts` for scheduled email,
  profile archival, storage cleanup, and Auth deletion.
- `app/auth/callback/route.ts` to reset the cycle immediately after magic-link
  verification.

## Production configuration

The function needs these Supabase secrets/environment variables:

```text
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service role key>
RESEND_API_KEY=<Resend API key>
INACTIVITY_FROM_EMAIL=RoomeyFinder <hello@your-domain.com>
APP_URL=https://your-production-domain.com
ACCOUNT_INACTIVITY_CRON_SECRET=<long random value>
ACCOUNT_INACTIVITY_ALLOW_DELETION=true
```

Keep `ACCOUNT_INACTIVITY_ALLOW_DELETION=false` while testing. Setting
`ACCOUNT_INACTIVITY_DRY_RUN=true` makes the job report what it would do without
sending emails or changing accounts.

Deploy the function, then create a Supabase Cron job that runs hourly and sends
a `POST` request to:

```text
https://<project-ref>.supabase.co/functions/v1/process-account-inactivity
```

The request must include:

```text
x-account-inactivity-secret: <same value as ACCOUNT_INACTIVITY_CRON_SECRET>
```

An hourly schedule is used because the 24-hour reminder should not depend on a
once-daily job running at exactly the right time. Configure the job in the
Supabase Dashboard under Cron, or use `pg_cron`/`pg_net` with the project URL
and secret stored in Vault. Do not put either secret in this repository.

Before enabling deletion in production, run the function in dry-run mode and
verify the summary and email content with test accounts.
