# Workout Tracker

A mobile-first PWA to log workouts, track which body parts you train, and review your week.

- Pick body part(s) → select exercises → log sets/reps/weight
- Add your own body parts and exercises on the fly
- Save reusable **routines** (presets: Push/Pull/Leg, Upper/Lower) and pick one to pre-fill a session
- **Calendar** marks every logged day — tap a day to see that workout
- **Weekly report** of how many times each body part was trained

## Stack
Next.js 16 (App Router) · Drizzle ORM + Neon Postgres · Clerk (email auth) · Tailwind + shadcn/ui · PWA

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL + Clerk keys
npm run db:push              # create tables in Neon
npm run dev
```

Open http://localhost:3000, sign up, and your default body parts, exercises, and preset
routines are seeded automatically on first login.

### Get the credentials
- **Database:** create a Neon project (Vercel Marketplace → Neon, or neon.tech) and copy the connection string into `DATABASE_URL`.
- **Auth:** create a Clerk app at dashboard.clerk.com, enable Email, and copy the publishable + secret keys.

## Deploy
Push to GitHub, import on Vercel, add the same env vars, and run `npm run db:push` against
the production database (or add it as a build step).
