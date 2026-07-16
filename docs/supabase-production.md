# Supabase production setup

This repository configures local Supabase. Create and link the hosted project before deploying, then apply the tracked migrations; never paste production keys into this repository.

## Auth: magic links only

The application already uses `signInWithOtp` through `/auth/magic-link`; it does not expose a password sign-up or sign-in flow. In the hosted Supabase dashboard:

1. Set **Site URL** to `https://roomeyfinder.com`.
2. Add these exact Redirect URLs:
   - `https://roomeyfinder.com/auth/verify`
   - `https://roomeyfinder.com/auth/callback`
   - `http://localhost:3000/**` (development only)
3. Keep Email auth enabled and turn on **Confirm email**. Magic-link verification is the email confirmation; passwords are not used by this app.
4. Keep anonymous sign-ins and manual identity linking disabled.
5. Configure a custom SMTP provider and set a sender such as `RoomeyFinder <hello@roomeyfinder.com>`. Supabase's built-in email service is only for testing.
6. Set the Magic Link template to [magic-link.html](../supabase/templates/magic-link.html). It must use `{{ .RedirectTo }}` so the controlled `/auth/verify` route is used.

Supabase does not provide a hosted toggle that enables magic links but prohibits every possible password-creation API call. The protection here is that RoomeyFinder never offers password endpoints; do not add `signUp`, `signInWithPassword`, password-reset, or password-update UI/routes.

## Storage

In Storage, update both `profile-photos` and `home-photos` buckets to:

- Private
- Maximum file size: 5 MiB per photo
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

These same restrictions are committed in `supabase/config.toml` for local development. Bucket settings are service configuration, not migration-managed Postgres schema, so make the hosted settings in the dashboard too.

## Migration release flow

1. Create the hosted project and run `supabase link --project-ref <project-ref>` locally.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only in your deployment provider's environment configuration.
3. Review the pending migration SQL, then run `supabase db push` from this repository.
4. Regenerate types with `supabase gen types typescript --linked > types/database.ts`, commit the result, and run `npm run lint`, `npx tsc --noEmit`, and `npm run test:db` before deployment.
5. Run `supabase db advisors --linked` after the deployment and resolve any new warnings.

Never edit an already-applied migration. Add a new forward migration instead; that keeps local, staging, and production schemas deterministic.
