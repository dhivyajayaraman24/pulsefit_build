# PulseFit

PulseFit is scaffolded as a small monorepo with three client surfaces, one core NestJS service, and shared TypeScript packages.

## Local Development

Install each app's dependencies before running its development command.

| Area | Command | Purpose |
|---|---|---|
| Member mobile | `cd apps/member-mobile && flutter pub get && flutter run` | Starts the Flutter member app shell. |
| Front-Desk/Trainer PWA | `cd apps/frontdesk-trainer-pwa && npm install && npm run dev` | Starts the tablet-friendly React PWA shell. |
| Management Portal | `cd apps/management-portal && npm install && npm run dev` | Starts the React management portal shell. |
| Core service | `cd services/core && npm install && npm run start:dev` | Starts the NestJS API with home and health endpoints. |
| Shared UI package | `cd packages/ui && npm install && npm run build` | Type-checks and builds shared UI placeholders. |
| API client package | `cd packages/api-client && npm install && npm run build` | Type-checks and builds REST contract helpers. |

## Environment Variables

The scaffold uses safe local defaults where possible. Production values must be provided by deployment configuration.

| Variable | Used By | Default | Notes |
|---|---|---|---|
| `VITE_API_BASE_URL` | React apps | `http://localhost:3000/v1` | REST API base path. |
| `API_BASE_URL` | Flutter app | `http://localhost:3000/v1` | Pass with `--dart-define=API_BASE_URL=...` when needed. |
| `PORT` | Core service | `3000` | HTTP port for NestJS. |
| `DATABASE_URL` | Core service | unset | PostgreSQL 15+ connection string for later tasks. |
| `REDIS_URL` | Core service | unset | Redis connection string for cache/queue work in later tasks. |
| `CORS_ORIGINS` | Core service | `http://localhost:5173,http://localhost:5174` | Comma-separated allowed web origins. |

## Scaffolded Surfaces

- `apps/member-mobile`: Flutter route placeholders for profile, renewals, timetable, notifications, and QR check-in.
- `apps/frontdesk-trainer-pwa`: React TypeScript role-aware shell for front-desk and trainer workflows.
- `apps/management-portal`: React TypeScript persona-aware shell for owner, finance, marketing/admin, and branch manager views.
- `services/core`: NestJS modular monolith starting point with `/` and `/v1/health`.
- `packages/ui`: Shared web UI placeholder components.
- `packages/api-client`: Shared API contract and fetch client placeholder.
