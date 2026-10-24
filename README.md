# PaperCommons

A working community question-paper application built with React, TypeScript, Next.js-compatible Vinext, Tailwind and shadcn components. Deployed using Sites with Cloudflare D1 relational persistence and R2 document storage.

## Included

- Authenticated profiles, private email handling and server-side role checks.
- Search and filters, server-rendered initial catalogue and paper details, paginated results.
- Real PDF/image uploads with limits, extension/MIME/signature checks, SHA-256 duplicate checks, PDF active-content rejection and privacy confirmation.
- PDF.js canvas previews with page navigation, zoom and fullscreen; image previews; downloads.
- Saves, multi-collection membership, ratings, comments, replies, helpful likes, structured feedback and reports.
- Profiles, upload/view/download history, follows and in-app notifications.
- Owner-only admin moderation, soft removal/restoration, taxonomy management, account restrictions, audit reasons and activity analytics.
- Twelve labelled original sample papers with downloadable PDFs. Sample accounts and their contributions are demonstration data. Popularity statistics start at zero rather than fabricated engagement.
- A ₹299/month pre-launch Premium page, real interest registration, owner-only original Premium uploads, server-enforced file/discussion access, and audited test grants that expire after 1–90 days.
- Privacy-conscious 7/30/90-day traffic reports, popular pages and papers, and a daily CSV export. Counts begin with this release; browser sessions are estimates and download clicks do not assert completed transfers.
- AVK provider interface and an unavailable evaluation endpoint. Stripe checkout returns a clear setup response. No AVK grading or payments are active.

## Setup and deployment

`npm run install:ci`, `npm run db:generate`, `npm run build`.

Schema is in `db/schema.ts`; generated schema-only migrations are in `drizzle/`. The hosting platform applies them before publishing. Do not edit a migration after it has been deployed.

Server-only `ADMIN_EMAILS` configures administrator provisioning for newly created accounts. Use the verified owner account. There is no public role-promotion endpoint. `.env.example` documents local variables; use the hosting secret manager in production. `SITE_ORIGIN` is the trusted deployed origin used for the sitemap. Never obtain canonical hosts from arbitrary forwarded request headers.

Authentication currently uses the hosting platform's verified ChatGPT identity, not Google OAuth. The user identity boundary is `lib/server/auth.ts`. A future Google/Supabase adapter must verify its session server-side and map the provider's stable subject into the user ID. Never accept a user ID supplied in request JSON. The current platform consumes/provides its authenticated-user headers at the edge; do not expose this worker directly without a trusted identity gateway.

This build uses D1, not PostgreSQL. Core tables and service separation are relational, but a move to Vercel + Supabase requires PostgreSQL schema migrations, a verified session adapter, storage adapter, and replacement of Cloudflare runtime imports. It is not a drop-in Vercel deployment.

## Verification

`node node_modules/typescript/bin/tsc --noEmit`

After building: `node scripts/integration-test.mjs`. Tests use isolated ephemeral D1/R2 storage with synthetic identities, and cover authentication, search, saves, ratings, collections, comments, cross-user authorization, moderation, CSRF origin rejection, invalid file rejection and private pending uploads. The production identity gateway itself is not simulated by these tests.

## Launch boundaries

This is a private, functional first release, not a completed public security audit. Before a public student launch, connect the requested Google identity provider on a compatible host, add verified email/recovery flows if email-password auth is introduced, arrange malware scanning/quarantine, review privacy/retention and takedown policies, load-test, configure monitoring/backups, and complete browser/device accessibility testing.

Uploads are validated and rendered in canvas, but heuristic PDF checks are not an antivirus service. Automatic publication is configurable but manual review is the default. Uploaded originals are access-controlled; R2 object keys are never exposed. No external remote file URLs are accepted.

Recommendation ranking initially uses class and board. Behaviour-driven recommendations, notifications outside the app, cached raster thumbnails, and large-scale search infrastructure remain follow-up work. Profile pictures are uploaded JPG/PNG images or initials. Admin lists currently cap at 200 records and analytics are aggregate counts; scale these queries and pagination as usage grows.

Sample PDFs are generated with `scripts/generate-samples.py` using ReportLab and the open-source Noto Sans Devanagari font. They are short 25-mark practice sets, not official CBSE papers or full-length pre-boards. Sources must be reviewed against the exact board syllabus before presenting any uploaded paper as syllabus-verified.

## Premium and traffic release

Only original papers uploaded by the authenticated administrator can be made Premium-only. Community samples stay public and are served as public assets; they are intentionally never eligible for a paywall. Public metadata is discoverable, but file IDs, document bytes and discussions are omitted from locked details. Protected file responses use no-store. Membership is checked server-side on every document, rating and discussion operation, including expiry and suspension; profile forms cannot set roles or plans. Saving a locked metadata preview is allowed.

The live v7 build added premium_only through a guarded bootstrap. Migration 0001 therefore adds only the new expiry and traffic/interest structures; that bootstrap remains for fresh installs. Its snapshot includes the legacy premium column so later migrations will not attempt to add it twice. Existing manual memberships receive a 30-day expiry on migration. Never treat a manual test grant as payment verification.

Traffic events store hashed browser-session identifiers and normalized known page paths. Owner visits and Do Not Track/Global Privacy Control opt-outs are excluded. Personal contributor profile paths and raw IP addresses are not stored in analytics_events. An IP-derived, minute-bound hash is used only as an abuse-limit key. Events older than 90 days are removed on ingestion. Closed-tab session counts are not unique people; client events may be missed on privacy tools or poor networks. Payment integration, verified Stripe webhook subscriptions and the AVK model endpoint remain separate future work.
