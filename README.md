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

---

## Testing

Make sure `npm run dev` is running on `http://localhost:3000` before executing any test suite.

### Cypress (E2E)
```bash
npm run cypress:open   # interactive mode
npx cypress run         # headless (CI)
```
7 specs under `testing/cypress/e2e/` covering sign-in, calendar, workouts, and routines.

### Selenium (Java + Maven + TestNG)
Browser: **Brave** (Chromium-based). Runs headfully via SafariDriver-compatible setup.

```bash
cd testing/selenium-tests
mvn clean test \
  -Dtest.email="thatikondprem072+clerk_test@gmail.com" \
  -Dtest.password="stqa_testing10" \
  -Dtest.otp="424242" \
  -Dbase.url="http://localhost:3000"
```
7 test classes mirroring the Cypress specs. HTML reports generated in `target/surefire-reports/`.

### JMeter (Performance / Load)
Test plan: `testing/fitness-tracker.jmx`

**Prerequisite** — copy a valid Clerk session cookie:
1. Sign in to `http://localhost:3000` in Brave
2. Open DevTools → Application → Cookies → `localhost` → copy `__clerk_db_jwt`
3. In JMeter, paste it under **HTTP Cookie Manager**

**Run in GUI:**
Open `testing/fitness-tracker.jmx` in JMeter, verify the cookie value, click the green play button.

**Run headless:**
```bash
jmeter -n -t testing/fitness-tracker.jmx -l testing/results.jtl -e -o testing/jmeter-report/
```

### Jenkins (CI Pipeline)
Prerequisites on the Jenkins node: Node.js, Maven, Brave Browser, JMeter.

1. Install plugins: **Pipeline**, **JUnit**
2. Set **Global Properties** in Manage Jenkins → System:
   - `TEST_EMAIL` = `thatikondprem072+clerk_test@gmail.com`
   - `TEST_PASSWORD` = `stqa_testing10`
   - `TEST_OTP` = `424242`
3. Create a **Pipeline** job pointing to the `Jenkinsfile` (Pipeline Script from SCM — or paste the script)

The pipeline: `npm ci` → `npm run build` → start dev server → run Selenium tests → publish reports → cleanup.
