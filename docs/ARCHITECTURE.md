# Architecture

## Overview

A monorepo web app that tracks global AI adoption over time and exposes it as an
interactive globe, a dashboard, and a downloadable historical dataset.

```
┌─────────────┐     HTTPS/JSON      ┌──────────────┐     TypeORM      ┌──────────┐
│  Frontend   │  ───────────────▶   │   Backend    │  ───────────────▶ │  Oracle  │
│ React + TS  │  ◀───────────────   │ Node/Express │  ◀─────────────── │    XE    │
│  Three.js   │                     │     JWT      │                   │          │
└─────────────┘                     └──────────────┘                   └──────────┘
       │                                   │  ▲
       │  static topo JSON                 │  │ Redis (planned: cache/session)
       ▼                                   ▼  │
   Globe engine                       Seed scripts (AEI, stocks, hardware)
```

## Monorepo layout

```
frontend/   React 18 + TypeScript + SCSS + Vite (globe, dashboard, download)
backend/    Node 20 + Express + TypeORM + Oracle (REST API, auth, CSV export)
shared/     TypeScript types imported by both sides (the API contract)
docs/        this documentation
database-migrations/  raw SQL reference schema
docker-compose.yml    Oracle XE + Redis + backend + frontend for local dev
```

`shared/types` is the single source of truth for the API contract. The backend
`tsconfig` uses `rootDir: ".."` so it can compile those types alongside its own.

## Backend layering

```
routes/         →  thin Express route → controller wiring
controllers/    →  parse/validate request, shape the response envelope
services/       →  business logic + data access (TypeORM repositories)
database/       →  entities, data-source, seed scripts
middleware/     →  auth (JWT), request logging, error handling
validation/     →  Zod schemas
```

Rules: controllers never touch repositories directly; services never touch
`req`/`res`. Errors are thrown as `ApiError(message, status, code)` and rendered
centrally by `errorHandler` (which also understands `ZodError`).

## Data model (TypeORM entities)

| Entity | Purpose |
|---|---|
| `Country` | ISO3, name, region, lat/lon, GDP, population |
| `CountryStatsSnapshot` | point-in-time adoption metrics (FK → Country) |
| `User` | email, bcrypt hash, GitHub/LinkedIn, download counters |
| `DownloadRequest` | audit row per dataset download (FK → User) |
| `CompanyStock` / `StockPriceHistory` | AI/cloud company valuations over time |
| `HardwareSalesIndex` | GPU/CPU/RAM shipped per period (local-AI proxy) |

In development `synchronize: true` derives the schema from entities. Production
must use explicit migrations (never `synchronize`).

## Data pipeline

Snapshots are **time-series**: the seed generates yearly backcast points for
2023–2025 (using growth curves) plus the actual 2026-05 period, so `history/*`
endpoints and the dataset download return real multi-year series. Stocks and
hardware are seeded similarly. Seeds are idempotent (compare by ISO-date string).

```bash
npm run db:seed:all -w backend   # countries history + stocks + hardware
```

## Frontend structure

```
lib/globe/     GlobeEngine (framework-agnostic Three.js), themes, topo decode,
               the derived-stats view model (compute.ts)
components/     Globe wrapper + MVP UI panels (header, stats, charts, card, slider)
pages/         GlobePage (the MVP experience), DashboardPage (Recharts)
services/      axios client (JWT interceptor) + typed API services
stores/        Zustand app state (year, theme, viz, selection)
```

The Three.js logic is isolated in `GlobeEngine` so React only drives it through
setters (`setData`, `setYear`, `setTheme`, `setViz`) — no React re-render churn
per animation frame.

## Design system

The globe's visual design is preserved verbatim from the original MVP: dark
"Mission Control" theme (plus Light and Neon), orange accent, glassmorphic
panels. Theme palettes live in `frontend/src/lib/globe/themes.ts` and are applied
as CSS variables on `:root`.

## Security

- Passwords hashed with bcrypt; auth via JWT (`Authorization: Bearer`).
- Helmet, CORS allowlist, per-IP rate limiting.
- Dataset download requires auth, is rate-limited per user, and is audited.
- All secrets via environment variables; nothing hardcoded.

## Local development

`docker compose up` starts Oracle XE, Redis, backend and frontend. See
[DEVELOPMENT.md](../DEVELOPMENT.md) for the full workflow and gotchas.
