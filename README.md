# RoomeyFinder

RoomeyFinder helps people in Nigeria find compatible roommates and shared homes. Users create a profile, describe their living preferences, discover compatible matches, and connect only after mutual interest.

The app is built with Next.js and Supabase, with privacy-conscious profile data, authenticated workflows, home listings, photo uploads, and database-backed matching.

## Features

- Magic-link authentication with Supabase Auth
- Guided profile, preference, and home setup flows
- Roommate and shared-home discovery
- Compatibility matching based on location, budget, lifestyle, and home preferences
- Home listings with amenities, availability, and photos
- Mutual-interest workflow before contact details are revealed
- Private Supabase Storage buckets with access policies
- Responsive UI, dark mode, custom illustrations, and reduced-motion-friendly animations
- Local seed data and database tests for development

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, and Row Level Security
- GSAP for interface animation
- Radix UI and Lucide React for accessible interface primitives
- Geoapify for server-side location geocoding

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project for hosted development, or Docker and the Supabase CLI for local development
- A Geoapify API key for the location search endpoint

## Getting started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Set the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
GEOAPIFY_API_KEY=your-geoapify-api-key
```

The Supabase publishable/anon key is safe to expose in the browser when database access is protected by correct Row Level Security policies. Never expose a Supabase service-role key or other secret key through a `NEXT_PUBLIC_` variable.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Supabase development

The repository includes migrations, deterministic seed data, storage configuration, and database tests.

Start the local Supabase stack and reset the database:

```bash
npm run db:start
npm run db:reset
```

The local Supabase email inbox is available at [http://localhost:54324](http://localhost:54324). Magic links generated during local development appear there instead of being sent externally.

The seed creates 48 test accounts across homeowner, roommate-pairing, and home-seeker scenarios. Example emails include:

```text
seed.homeowner.01@example.test
seed.pair.17@example.test
seed.home-seeker.33@example.test
```

Seed accounts use the local Supabase email flow. Use the inbox to open a magic link and complete the relevant user journey.

Run the database and RLS/matching tests with:

```bash
npm run test:db
```

## Available scripts

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the Next.js development server           |
| `npm run build`        | Create a production build                      |
| `npm run start`        | Serve the production build                     |
| `npm run typecheck`    | Run TypeScript without emitting files          |
| `npm run lint`         | Run ESLint                                     |
| `npm run lint:fix`     | Apply ESLint fixes where possible              |
| `npm run format`       | Format the repository with Prettier            |
| `npm run format:check` | Verify Prettier formatting                     |
| `npm run db:start`     | Start the local Supabase services              |
| `npm run db:reset`     | Apply migrations and reseed the local database |
| `npm run test:db`      | Run Supabase database tests                    |

Before opening a pull request or submitting a build, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:db
```

## Project structure

```text
app/                    Next.js routes, layouts, auth, and API handlers
components/             Reusable UI and roommate-flow components
hooks/                  Client-side workflow and data hooks
lib/                    Supabase clients, matching, validation, and utilities
assets/illustrations/   React/SVG illustrations used by the product UI
supabase/migrations/    Database schema, policies, functions, and storage rules
supabase/tests/         Database and Row Level Security tests
supabase/seed.sql       Deterministic local development data
public/                 Static assets
```

## Security and privacy

The application uses Supabase Row Level Security to limit access to user-owned and private records. Profile contact details are intended to become visible only after an interest is accepted. Profile and home photo buckets are private and are governed by Storage policies.

Before deploying publicly, review the production Supabase policies and verify the complete auth, matching, interest, contact-reveal, and photo-access flows with non-seed accounts. Do not commit `.env.local` or production credentials.

## Deployment

The app can be deployed to Vercel or another Next.js-compatible host.

Configure these production environment variables in the hosting provider:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
GEOAPIFY_API_KEY
```

Also configure the Supabase Auth site URL and redirect URLs for the deployed domain. Apply database migrations to the production project through the project’s normal Supabase migration workflow before enabling public traffic.

## License

This project is proprietary and all rights are reserved. You may not use, copy,
modify, distribute, sublicense, or commercially exploit this code without
prior written permission from RoomeyFinder.
