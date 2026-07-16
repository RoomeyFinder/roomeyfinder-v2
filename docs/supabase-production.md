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

## Automatic migration releases from GitHub

The repository includes [the migration workflow](../.github/workflows/supabase-migrations.yml). It applies pending SQL migrations to the production project when a commit reaches `main` and changes `supabase/migrations/**`. It can also be run manually from the **Actions** tab.

### One-time GitHub configuration

1. In Supabase Dashboard, open **Account → Access Tokens** and create a personal access token for the GitHub Actions runner.
2. In Supabase Dashboard, open the project **Connect** dialog and copy the project reference. Record the database password from project creation (reset it from **Settings → Database** if it has been lost).
3. In GitHub, open this repository's **Settings → Secrets and variables → Actions** and create these repository secrets:
   - `SUPABASE_ACCESS_TOKEN` — the token from step 1.
   - `SUPABASE_PROJECT_ID` — the project reference, not the project URL.
   - `SUPABASE_DB_PASSWORD` — the project's database password.
4. In GitHub, open **Settings → Environments → production** and configure required reviewers if someone should approve each database deployment. The workflow uses this environment automatically.
5. Push this workflow to `main`, then open **Actions → Deploy Supabase migrations → Run workflow** once to confirm the connection. An already up-to-date project is a successful result.

### Day-to-day release flow

1. Create a new migration with `npx supabase migration new <description>`; never edit a migration that may have been applied.
2. Test locally, review the SQL, and commit the new file in `supabase/migrations/`.
3. Merge or push the change to `main`. GitHub Actions runs `supabase db push --linked`, which applies only migrations absent from the remote migration history.
4. Check the workflow run in GitHub Actions. If it fails, do not rerun blindly: correct the migration with a new forward migration and push again.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only in your application deployment provider's environment configuration. This workflow deliberately does not run `supabase config push`, so it cannot replace your hosted Auth, SMTP, redirect URL, or Storage dashboard configuration with local values.

Never edit an already-applied migration. Add a new forward migration instead; that keeps local, staging, and production schemas deterministic.
