# Computer Vision Rubik’s Cube Scanner and Solver

A full-stack Rubik's Cube scanner with camera-guided scanning, OpenCV-assisted sticker detection, browser-side solving, a React Three Fiber visualization, Supabase Auth, cloud scan history, and a global leaderboard. The original Express, Prisma, PostgreSQL, and JWT backend remains available for local development.

## Architecture

This repository is an npm-workspaces monorepo:

- `apps/web`: React 19, TypeScript, Vite, Tailwind CSS, React Three Fiber, OpenCV.js, a Web Worker solver, Supabase Auth/data access, manual correction, history, leaderboard, and responsive UI.
- `supabase`: PostgreSQL migrations, triggers, constraints, and Row Level Security policies for the hosted public app.
- `apps/api`: the retained local/optional Node.js, Express, Prisma, PostgreSQL, and JWT backend.
- `packages/shared`: cube domain model, color classification, facelet validation, solver notation helpers, and shared DTO types used by both frontend and backend.

The shared package keeps cube rules outside the UI and API framework code. The backend follows clean architecture boundaries: routes call services, services call repositories, and infrastructure details stay behind Prisma and middleware adapters.

## Requirements

- Node.js 20.18+
- npm 10+
- A Supabase project for Supabase Mode
- Docker Desktop only when using the legacy local Express/PostgreSQL mode

## Local setup — Supabase Mode

```bash
npm install
cp .env.example .env
```

Set these values in `.env`:

```bash
VITE_APP_MODE="supabase"
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-or-publishable-key>"
```

Apply [the Supabase migration](supabase/migrations/20260624000000_initial_schema.sql) through the Supabase SQL Editor, or with the CLI:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref <project-ref>
npx supabase@latest db push
npm run dev:web
```

Web: `http://localhost:5173`

## Local setup — retained Express/Prisma Mode

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Web: `http://localhost:5173`

API: `http://localhost:4000/api`

## Environment

Root `.env` values are consumed by the API and Vite:

```bash
DATABASE_URL="postgresql://rubiks:rubiks@localhost:5432/rubiks_scanner?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
PORT="4000"
VITE_API_URL="http://localhost:4000/api"
VITE_OPENCV_URL="https://docs.opencv.org/4.x/opencv.js"
VITE_APP_MODE="fullstack"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-or-publishable-key"
```

Only the Supabase URL and anon/publishable key belong in the frontend. Never expose the Supabase service-role key in a `VITE_` variable.

## Public deployment — Supabase + Vercel

The public build uses Supabase Auth and Supabase PostgreSQL directly from the browser. Row Level Security protects user-owned scans and solve history. Cube solving runs in a Web Worker, so no Render API is required.

### Supabase setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20260624000000_initial_schema.sql`.
3. In Authentication → URL Configuration, set the Site URL to the production Vercel URL and add `http://localhost:5173` as a redirect URL.
4. Copy the Project URL and anon/publishable key from the project API settings.

The migration creates four public tables:

- `profiles`: public display names linked to `auth.users`.
- `cube_scans`: each user's scanned cube JSON and optional solution.
- `solve_history`: each user's solutions and durations.
- `leaderboard_entries`: trigger-maintained best time and solve count.

### Vercel

Import the repository with its root selected. The included `vercel.json` uses:

- Build command: `npm run build:web`
- Output directory: `apps/web/dist`

Add these Production and Preview environment variables:

```bash
VITE_APP_MODE="supabase"
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-or-publishable-key>"
```

### Netlify

The included `netlify.toml` defines the build, publish directory, Supabase Mode, and SPA fallback. Add the same Supabase URL and key in Netlify's environment settings.

## Runtime modes

- `supabase`: hosted Auth/PostgreSQL plus the browser Worker solver; the production default.
- `fullstack`: retained Express/Prisma/JWT API for local or separately hosted environments.
- `demo`: frontend-only browser storage with no hosted data, retained as a fallback portfolio mode.

## Optional legacy Express production deployment

The repository includes `render.yaml` for the API and `vercel.json` for the frontend.

### 1. Neon PostgreSQL

Create a Neon project and copy both connection strings:

- `DATABASE_URL`: the pooled connection string used by the running API.
- `DIRECT_URL`: the direct connection string used by Prisma migrations.

Keep SSL enabled in both Neon connection strings. Do not run the development seed against production.

### 2. Render API

Create a Render Blueprint from this repository. Set these secret environment variables when prompted:

```bash
DATABASE_URL="<neon-pooled-connection-string>"
DIRECT_URL="<neon-direct-connection-string>"
CORS_ORIGIN="https://<your-vercel-domain>"
```

Render generates `JWT_SECRET` from the Blueprint. The build compiles the shared package and API, and the start command runs committed Prisma migrations before starting Express. The health check is `/api/health`.

### 3. Vercel frontend

Import the repository into Vercel with the repository root as the project root. Add this production environment variable:

```bash
VITE_API_URL="https://<your-render-service>.onrender.com/api"
VITE_APP_MODE="fullstack"
```

`vercel.json` runs the workspace build and publishes `apps/web/dist`. After Vercel assigns the final domain, update Render's `CORS_ORIGIN` to that exact HTTPS origin and redeploy the API. Multiple allowed origins can be supplied as a comma-separated list.

### Deployment checks

```bash
npm ci
npm run prisma:generate
npm run lint
npm run test
npm run build
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run prisma:migrate
npm run seed
```

## Scanner Flow

1. The browser requests the rear camera through `getUserMedia`; captured pixels are kept unmirrored.
2. A guided workflow identifies faces by center color in the order green, red, blue, orange, white, and yellow.
3. The user keeps white on top while rotating through the side faces. Every camera step shows the required top-edge color; the white face uses blue on top, and the yellow face uses green on top.
4. Captured center RGB values calibrate the remaining scans for the current camera and lighting. If the camera still disagrees with the expected center, the user can explicitly confirm the physical center color instead of being blocked.
5. OpenCV.js is loaded lazily and attempts contour detection for a 3x3 sticker grid.
6. If OpenCV is unavailable or the image is low quality, the detector falls back to a calibrated 3x3 center crop.
7. Sticker colors are classified in LAB-like RGB distance space against configurable cube color centroids.
8. The user can correct any sticker before validation and review the final cube net.
9. The shared validator checks six faces, nine stickers per face, center uniqueness, and exact color counts.
10. The solver rejects ambiguous face orientation instead of silently rotating scanned faces, then verifies that its generated moves solve the exact submitted state before returning them.
11. A guided solution player explains every move by center color, shows a head-on clockwise/counterclockwise face diagram, and supports play, pause, previous, next, replay, and slower playback speeds. Solution length varies with the scramble; it is not fixed at 21 moves.
12. The locked-view 3D cube starts from the exact scanned state, animates each physical layer turn, and preserves the resulting sticker state for the next instruction.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/scans`
- `GET /api/scans`
- `GET /api/scans/:id`
- `POST /api/solves`
- `GET /api/solves`
- `GET /api/leaderboard`
- `POST /api/leaderboard`

Authenticated endpoints require:

```http
Authorization: Bearer <token>
```

## Docker

```bash
docker compose up --build
```

The frontend is served on `http://localhost:8080`, API on `http://localhost:4000`, and PostgreSQL on `localhost:5432`.

## Testing

Critical domain logic is covered in `packages/shared`. Frontend tests cover cube correction behavior. API tests cover auth and route error handling with mocked services.

```bash
npm run test
```
