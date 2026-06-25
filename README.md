# Computer Vision Rubik's Cube Scanner and Solver

A Supabase-powered Rubik's Cube scanner web app with camera-guided scanning, OpenCV-assisted sticker detection, color classification, cube-state validation, client-side cube solving, metallic React Three Fiber visualization, Supabase Auth, saved scan history, personal stats, and a global leaderboard.

## Architecture

This repository is an npm-workspaces monorepo:

- `apps/web`: React 19, TypeScript, Vite, Tailwind CSS, React Three Fiber, OpenCV.js loader, camera workflow, manual correction, client-side solver controls, Supabase Auth, scan history, leaderboard, and responsive UI.
- `packages/shared`: cube domain model, color classification, facelet validation, solver notation helpers, and shared DTO types.
- `supabase/migrations`: hosted Supabase PostgreSQL schema, indexes, triggers, and row-level security policies.
- `apps/api`: legacy Express/Prisma API kept in the repo, but the public Vercel deployment no longer depends on it.

The deployed app is a static Vite frontend on Vercel. Authentication and persistence go directly to Supabase through `@supabase/supabase-js`; solving runs in the browser through `cubejs`.

## Requirements

- Node.js 20.18+
- npm 10+
- A Supabase project
- Vercel project linked to this repository

## Supabase Setup

Apply the schema in `supabase/migrations/20260625000000_supabase_app_schema.sql` to your Supabase project.

You can apply it with the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Or paste the SQL file into the Supabase SQL Editor and run it.

The migration creates:

- `profiles`
- `cube_scans`
- `solve_history`
- `leaderboard_entries`

It also enables row-level security so users can only read/write their own scans and solve history, while the leaderboard is publicly readable.

## Environment

Create `.env` locally:

```bash
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_OPENCV_URL="https://docs.opencv.org/4.x/opencv.js"
```

Use the same values in Vercel Project Settings -> Environment Variables.

## Local Development

```bash
npm install
npm run dev:web
```

Web: `http://localhost:5173`

The deployed frontend does not require the local Express API. Supabase Auth and database calls go to your configured Supabase project.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENCV_URL`
4. Keep the included `vercel.json`.
5. Deploy.

Vercel uses:

```bash
npm run build:web
```

Output directory:

```bash
apps/web/dist
```

## Scanner Flow

1. The browser requests the rear camera through `getUserMedia`; captured pixels are kept unmirrored.
2. A guided workflow identifies faces by center color in the order green, red, blue, orange, white, and yellow.
3. The user keeps white on top while rotating through the side faces. Every camera step shows the required top-edge color; the white face uses blue on top, and the yellow face uses green on top.
4. Captured center RGB values calibrate the remaining scans for the current camera and lighting.
5. OpenCV.js is loaded lazily and attempts contour detection for a 3x3 sticker grid.
6. If OpenCV is unavailable or the image is low quality, the detector falls back to a calibrated 3x3 center crop.
7. Sticker colors are classified in LAB-like RGB distance space against configurable cube color centroids.
8. The user can correct any sticker before validation and review the final cube net.
9. The shared validator checks six faces, nine stickers per face, center uniqueness, and exact color counts.
10. The browser solver rejects ambiguous face orientation and verifies generated moves against the exact submitted state.
11. A guided solution player explains every move and supports play, pause, previous, next, replay, and slower playback speeds.
12. Signed-in users can save scans, solve history, and leaderboard entries to Supabase.

## Testing

```bash
npm run test:web
```
