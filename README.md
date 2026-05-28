# ArgueBetter Frontend

Practice difficult conversations with AI before having them in real life.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase Auth + PostgreSQL (read)
- FastAPI backend (write + AI) — see [`../arguebetter-api`](../arguebetter-api)

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + API URL.
2. Run Supabase migrations from `supabase/migrations/001_initial_schema.sql`.
3. Start the API: `cd ../arguebetter-api && uvicorn app.main:app --reload`
4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` — routes (landing, auth, dashboard, practice flow)
- `src/components/` — UI and feature components
- `src/lib/` — Supabase client, API client, types
- `supabase/migrations/` — database schema

## Deploy

- **Beta testers:** step-by-step guide → [`docs/DEPLOY_BETA.md`](docs/DEPLOY_BETA.md)
- **Frontend:** Vercel — set env vars from `.env.example`
- **API:** Railway / Render / Fly.io
- **Database:** Supabase (separate prod project)
