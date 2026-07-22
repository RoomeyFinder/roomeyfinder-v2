# MVP TODO

## Before the hackathon demo

- [x] Fix redirect validation in `app/auth/confirm/route.ts` so `next` only accepts safe internal paths, or remove the unused route.
- [x] Run the project verification commands:
  - [x] `npm run typecheck`
  - [x] `npm run lint`
  - [x] `npm run build`
  - [x] `npm run test:db`
- [x] Remove or implement the footer links for `/about`, `/contact`, `/terms-and-conditions`, and `/privacy` so the demo has no avoidable 404s.
- [x] Test the complete happy path with two accounts:
  - [x] Sign in with a magic link.
  - [x] Complete profile setup.
  - [x] Complete preferences.
  - [x] Create and publish a home listing.
  - [x] Verify seeker and homeowner matching.
  - [x] Send an interest.
  - [x] Accept and decline interests.
  - [x] Verify contact details appear only after acceptance.

## Before public launch

- [x] Protect `/api/geocode` with authentication and/or rate limiting to prevent API-cost abuse.
- [x] Decide whether profile and home photos should be public. If not, make the storage buckets private and use signed URLs consistently.
- [x] Make multi-step profile and home saves resilient to partial failure. Prefer a server action/RPC or add cleanup and retry handling for failed later steps.
- [x] Refresh or update profile-page data after sending, accepting, or declining an interest so newly unlocked contact details appear immediately.
- [ ] Decide whether incomplete setup should be allowed to load matches. If retained, clearly label it as preview mode and prevent unsupported actions.
- [ ] Add a user-facing way to hide a profile by controlling `profiles.is_visible`.
- [ ] Add account deletion, including cleanup of profile data, homes, interests, contacts, and storage objects.
- [ ] Add privacy, terms, about, contact, and FAQ content if those footer links remain.

## Product and quality follow-ups

- [ ] Add automated end-to-end coverage for authentication, onboarding, matching, interests, and contact reveal.
- [ ] Test failed uploads and retries to ensure orphaned storage files and partial database records are cleaned up.
- [ ] Test duplicate interests, concurrent accept/decline actions, archived homes, and users changing from homeowner to seeker.
- [ ] Add monitoring/logging for failed magic links, geocoding failures, matching RPC failures, and photo uploads.
- [ ] Review photo file type, size, and quantity validation on both the client and server/storage layer.
- [ ] Review the public profile and matching data for unintended personal-information exposure before launch.

## Explicitly out of scope for this MVP

- [ ] Messaging/chat between matched users.
