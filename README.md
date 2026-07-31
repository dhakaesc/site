# AMOURA — Production App (Phase 1)

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, with real authentication
backed by Postgres.

## What's working right now

- Real account creation (`/register`) — password hashed with bcrypt, stored in Postgres
- Real login (`/login`) — verified against the hash, session issued as a signed JWT
  in an httpOnly cookie
- Protected `/dashboard` — redirects to `/login` if not authenticated
  (enforced in `src/middleware.ts`, not just in the UI)
- `/admin/*` routes are reserved and will redirect non-admins once admin pages
  are added in the next phase

## Not built yet (upcoming phases)

- Profile browsing / matching
- Real-time messaging (Cloudflare Durable Objects)
- Payments / subscription upgrade
- Image upload (Cloudflare R2) and video (Cloudflare Stream)
- Admin panel pages

## Local setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string (Supabase or Neon both work)
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
2. Install dependencies: `npm install`
3. Push the schema to your database: `npm run db:migrate`
4. Run the dev server: `npm run dev`

## Deploying on Cloudflare Pages

In the Cloudflare Pages project settings:

- **Framework preset:** Next.js
- **Build command:** `npx @cloudflare/next-on-pages@latest`
- **Build output directory:** `.vercel/output/static`
- **Environment variables:** add `DATABASE_URL` and `AUTH_SECRET` under
  Settings → Environment variables (do this for both Production and Preview)

Every push to `main` will trigger a new build and deploy automatically.
