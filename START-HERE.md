# PaperCommons: open and edit locally

This is the complete tracked source of live version 9, including the visible Premium links and home shortcuts. No production database, private uploads, credentials, installed dependencies or generated build output is included. Your local work will not change the live site automatically.

## Quick start

1. Extract this ZIP. Open the **PaperCommons** folder (the folder containing package.json) in your editor, including Google Antigravity.
2. Install Node.js 22.13 or newer, with npm. Open a terminal in this folder.
3. Install the locked dependencies:

```sh
npm run install:ci
```

4. Copy `.dev.vars.example` to `.dev.vars` using your file manager. The example grants the built-in local test identity admin access; it contains no real account credentials. Use only for localhost development.
5. Initialize the local database using the supplied local-only configuration:

```sh
npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
```

6. Start the app:

```sh
npm run dev
```

Open http://localhost:5173 (or the address printed by the terminal). Click Sign in to use the built-in localhost-only mock account. Samples are inserted by bootstrap; no live accounts or documents are downloaded. For a student-only test, remove ADMIN_EMAILS from .dev.vars before first sign-in. If you already created an admin locally, removing the allowlist does not demote the stored account; use a separate disposable local database.

The local configuration points at emulated D1/R2 storage in .wrangler/state. It does not connect to production. Migration 0001 intentionally does not re-add premium_only; seed/bootstrap adds that legacy column on fresh databases. Do not regenerate or edit migrations just to start the app. R2 uploads are also local in development.

## What to edit

- `components/papers/site-header.tsx`: desktop/mobile menus and account dropdown.
- `components/papers/stitch-home.tsx`, `components/papers/stitch/`: homepage and imported Stitch design.
- `components/papers/premium.tsx`: ₹299/month pre-launch plan.
- `components/papers/admin*.tsx`: administration, membership controls and analytics.
- `app/*.css`: application styling.
- `app/api/[...path]/route.ts`: backend endpoint dispatch.
- `lib/server/`: authentication, upload validation, search, access, moderation and analytics services.
- `db/schema.ts`, `drizzle/`: relational schema and migrations.
- `scripts/integration-test.mjs`: isolated end-to-end API and SSR checks.

## Check your edits

```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/integration-test.mjs
```

The live source passed its build and 109 integration checks before export. The exported archive was checked for completeness and corruption. Fresh installation and device rendering on your own machine have not been tested here.

## Important hosting boundaries

This is Next.js-compatible **Vinext**, React, TypeScript, Tailwind and shadcn, running on Cloudflare Workers with D1 and R2. It is not a standard next dev/Vercel deployment. Use the included npm scripts.

Production authentication currently trusts identity verified by the Sites edge gateway. The local mock is for loopback development only. Do not publish a worker that trusts arbitrary incoming authenticated-user headers. To deploy elsewhere, replace `app/chatgpt-auth.ts` and `lib/server/auth.ts` with a verified session provider, connect database/storage adapters, and preserve role/access checks. For Vercel/Supabase, convert D1/SQLite migrations to PostgreSQL and replace Cloudflare runtime imports.

`.openai/hosting.json` records the original Site's non-secret project identity. It does not contain credentials or give publishing access. Do not reuse that identity to create another Site.

Stripe payments and AVK evaluation remain intentionally disconnected. Membership grants are expiring test access, not proof of payment. Keep community/sample papers free; only authenticated owner original uploads may be Premium. Preserve server-side gating, private file responses, consent and moderation.

Optional sample-PDF regeneration uses Python ReportLab and the included Noto font; already-generated sample PDFs are included, so Python is not required for normal development.

## Suggested initial editor instruction

> Read START-HERE.md and README.md first. This is the current PaperCommons full-stack source. Preserve the existing working flows, Stitch design, server-enforced Premium access and admin permissions. Explain a proposed change before implementing it, run the relevant checks, and do not replace integrations with fake production behaviour. Do not activate Stripe payments, AVK, ads or publishing unless I request it. Start by showing the project structure and helping me run it locally.

## Export identity

Source commit: 256b85aebe2f69d96634d7815aa307cdd44b9b36
Exported: 4 October 2026
Live version: 9
