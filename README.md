# Computer Vision Rubik’s Cube Scanner and Solver

A full-stack Rubik's Cube scanner web app with camera-guided scanning, OpenCV-assisted sticker detection, color classification, cube-state validation, cubejs solving, metallic React Three Fiber visualization, JWT authentication, saved scan history, personal stats, and a global leaderboard.

## Architecture

This repository is an npm-workspaces monorepo:

- `apps/web`: React 19, TypeScript, Vite, Tailwind CSS, React Three Fiber, OpenCV.js loader, camera workflow, manual correction, solver controls, auth, history, leaderboard, and responsive UI.
- `apps/api`: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT auth, route validation, service/repository layers, and centralized error handling.
- `packages/shared`: cube domain model, color classification, facelet validation, solver notation helpers, and shared DTO types used by both frontend and backend.

The shared package keeps cube rules outside the UI and API framework code. The backend follows clean architecture boundaries: routes call services, services call repositories, and infrastructure details stay behind Prisma and middleware adapters.

## Requirements

- Node.js 20.18+
- npm 10+
- Docker Desktop for local PostgreSQL, or your own PostgreSQL instance

## Setup

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
```

For production, use a strong `JWT_SECRET`, HTTPS, managed PostgreSQL, a pinned OpenCV.js asset, and a restricted `CORS_ORIGIN`.

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
