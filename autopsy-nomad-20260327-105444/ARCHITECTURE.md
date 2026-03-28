# ARCHITECTURE: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD

---

## Tech Stack

| Layer | Technology | Version | Confidence |
|-------|-----------|---------|-----------|
| Language | JavaScript (ESM client, CommonJS server) | ES2022+ | High |
| Frontend Framework | React | ^18.2.0 | High |
| Build Tool | Vite | ^5.1.4 | High |
| CSS Framework | Tailwind CSS | ^3.4.1 | High |
| State Management | Zustand | ^4.5.2 | High |
| Routing (Client) | React Router | ^6.22.2 | High |
| Icons | Lucide React | ^0.344.0 | High |
| Maps | Leaflet + React Leaflet | ^1.9.4 / ^4.2.1 | High |
| PDF | @react-pdf/renderer | ^4.3.2 | High |
| Backend Framework | Express | ^4.18.3 | High |
| Database | SQLite via better-sqlite3 | ^12.8.0 | High |
| Authentication | JWT (jsonwebtoken) + bcryptjs | ^9.0.2 / ^2.4.3 | High |
| WebSocket | ws (raw) | ^8.19.0 | High |
| Security | Helmet | ^8.1.0 | High |
| File Upload | Multer | ^1.4.5-lts.1 | High |
| Scheduling | node-cron | ^4.2.1 | High |
| Containerization | Docker (Node 22 Alpine, multi-stage) | - | High |
| CI/CD | GitHub Actions | - | High |
| Deployment | Docker Hub (mauriceboe/nomad) | - | High |

## Architecture Pattern

NOMAD follows a **classic full-stack monolith** pattern with clear client-server separation within a single repository:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                       │
│                                                          │
│  ┌──────────────────┐    ┌───────────────────────────┐  │
│  │   React SPA      │    │     Express Server         │  │
│  │   (static build) │◄──►│                           │  │
│  │                  │REST│  ┌──────┐  ┌───────────┐  │  │
│  │  Zustand Stores  │    │  │Routes│  │WebSocket  │  │  │
│  │  React Router    │ WS │  │(22)  │  │Server     │  │  │
│  │  Leaflet Maps    │◄──►│  └──┬───┘  └─────┬─────┘  │  │
│  │  Tailwind CSS    │    │     │             │        │  │
│  └──────────────────┘    │  ┌──▼─────────────▼────┐  │  │
│                          │  │   SQLite (WAL mode)  │  │  │
│                          │  │   better-sqlite3     │  │  │
│                          │  └──────────────────────┘  │  │
│                          └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

In production, Express serves the built React SPA from `./public/` and handles all API requests. In development, Vite proxies `/api`, `/uploads`, and `/ws` to the Express server on port 3001.

## Directory Layout

```
NOMAD/
├── client/                     # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── main.jsx           # Entry: React DOM render
│   │   ├── App.jsx            # Root: routing, dark mode, auth guard
│   │   ├── api/               # HTTP (Axios) + WebSocket clients
│   │   ├── components/        # 57 components in 16 feature directories
│   │   ├── i18n/              # Translations (EN, DE)
│   │   ├── pages/             # 10 route-level page components
│   │   └── store/             # 4 Zustand state stores
│   ├── public/                # Static assets (fonts, icons, logos)
│   └── scripts/               # Build-time scripts (icon generation)
├── server/                     # Express backend (CommonJS)
│   ├── src/
│   │   ├── index.js           # Entry: Express app, route mounting, shutdown
│   │   ├── config.js          # Env vars, auto-generated JWT secret
│   │   ├── scheduler.js       # Cron jobs (backups, demo reset)
│   │   ├── websocket.js       # WS server (rooms, heartbeat, auth)
│   │   ├── db/database.js     # Schema, migrations, Proxy wrapper
│   │   ├── demo/              # Demo seed + reset logic
│   │   ├── middleware/auth.js # JWT verification middleware
│   │   └── routes/            # 22 REST route files
│   └── .env.example           # Environment template (3 vars)
├── Dockerfile                  # Multi-stage: build client → run server
├── docker-compose.yml          # Production deployment
└── .github/workflows/          # CI: Docker build + push to Hub
```

## Data Model

### Entities

| Entity | Source | Key Fields | Relationships |
|--------|--------|-----------|---------------|
| users | database.js | id, username, email, password_hash, role, avatar, oidc_sub | owns trips, settings, tags; member of trips |
| trips | database.js | id, user_id, title, start/end_date, currency, cover_image, is_archived | has days, places, members, files, budget, packing |
| days | database.js | id, trip_id, day_number, date, title | has assignments, notes, accommodations |
| places | database.js | id, trip_id, name, lat/lng, category_id, price, google_place_id | belongs to trip/category; has tags, assignments |
| day_assignments | database.js | id, day_id, place_id, order_index, times | links place to day; has participants |
| reservations | database.js | id, trip_id, title, times, status, type, confirmation | links to day/place/assignment |
| budget_items | database.js | id, trip_id, category, total_price, persons | has member tracking |
| packing_items | database.js | id, trip_id, name, checked, sort_order | belongs to trip |
| collab_messages | database.js | id, trip_id, user_id, text, reply_to | has reactions |
| collab_polls | database.js | id, trip_id, question, options (JSON) | has votes |
| collab_notes | database.js | id, trip_id, title, content, pinned | has file attachments |
| vacay_plans | database.js | id, owner_id, block_weekends | has years, members, entries |

### Entity Diagram

```
users ──< trips ──< days ──< day_assignments >── places >── categories
                      │          │                  │
                      │          ├── day_notes       ├──< place_tags >── tags
                      │          ├── participants    │
                      │          │                   │
                      ├──< reservations              │
                      ├──< budget_items ──< members  │
                      ├──< packing_items             │
                      ├──< trip_files                │
                      ├──< trip_members >── users    │
                      ├──< day_accommodations >── places
                      ├──< collab_notes
                      ├──< collab_polls ──< votes
                      └──< collab_messages ──< reactions

users ──< vacay_plans ──< vacay_members
                       ├──< vacay_years
                       ├──< vacay_entries
                       └──< vacay_company_holidays
```

## API Design

22 Express route files organized by domain. All trip-scoped routes use `mergeParams: true` for nested routing. Key patterns:

| Method | Path Pattern | Purpose | Auth |
|--------|-------------|---------|------|
| POST | `/api/auth/register`, `/login` | User auth | No |
| GET/PUT/DELETE | `/api/trips/:tripId/*` | Trip-scoped CRUD | Yes (JWT + canAccessTrip) |
| GET/POST | `/api/addons/vacay/*` | Vacay addon | Yes (JWT) |
| GET | `/api/addons/atlas/*` | Atlas stats | Yes (JWT) |
| * | `/api/admin/*` | Admin operations | Yes (JWT + adminOnly) |
| * | `/api/backup/*` | Backup/restore | Yes (JWT + adminOnly) |
| GET | `/api/maps/search` | Place search | Yes |
| GET | `/api/weather` | Weather forecast | Yes |

## Component Structure

React components organized by feature domain (16 directories, 57 files):

```
components/
├── Admin/         # Admin panel (user mgmt, settings, addons)
├── Budget/        # Budget items, per-person splits
├── Collab/        # Chat, notes, polls, WhatsNextWidget
├── Dashboard/     # Trip list, widgets (currency, timezone)
├── Files/         # Document upload/download
├── Layout/        # Sidebar, topbar, navigation
├── Map/           # Leaflet map, markers, routing
├── Packing/       # Packing checklist
├── PDF/           # Trip PDF export (partial)
├── Photos/        # Photo upload/gallery
├── Places/        # Place search, detail inspector
├── Planner/       # Day view, assignment cards, drag-drop
├── shared/        # Reusable components (modals, inputs)
├── Trips/         # Trip cards, create/edit forms
├── Vacay/         # Vacation calendar, fusion
└── Weather/       # Forecast display
```

## State Management

4 Zustand stores with direct mutation via `set()`:

| Store | Lines | Purpose |
|-------|-------|---------|
| `tripStore.js` | 863 | Trip data, days, assignments, places, reservations, notes, accommodations, packing, budget, files, photos, collab — monolithic |
| `vacayStore.js` | ~200 | Vacay plans, entries, holidays, fusion |
| `authStore.js` | ~100 | User auth state, login/logout, token management |
| `settingsStore.js` | ~80 | User preferences (dark mode, language, map settings) |

Optimistic UI pattern: client applies changes immediately, rolls back on API error. Uses negative temp IDs for pending creates.

## Security Model

- **Authentication:** JWT tokens (24h expiry), bcrypt password hashing (10 rounds)
- **Authorization:** Role-based (admin/user), trip-scoped access via `canAccessTrip()`
- **Rate limiting:** Login endpoint (10 attempts / 15 minutes)
- **Headers:** Helmet middleware (security headers, CSP deferred to reverse proxy)
- **CORS:** Configurable via `ALLOWED_ORIGINS` env var
- **File security:** SVG/HTML upload blocked, UUID filenames prevent path traversal
- **OIDC/SSO:** OpenID Connect with state parameter CSRF protection
- **Demo mode:** Granular restrictions (no password change, no account deletion, no uploads)

## Infrastructure

- **Deployment:** Docker multi-stage build (Node 22 Alpine), published to Docker Hub
- **CI/CD:** GitHub Actions — build and push on main push, no test/lint steps
- **Database:** SQLite file at `./data/travel.db`, WAL mode, 31 inline migrations
- **Persistence:** Docker volumes for `./data/` (DB + backups) and `./uploads/` (files)
- **Scheduling:** node-cron for automated backups (configurable retention) and demo resets
- **Health:** `/api/health` endpoint for container health checks
- **Process:** Graceful shutdown on SIGTERM/SIGINT with 10s forced exit
- **Self-update:** Admin can trigger `git pull` + rebuild + restart (non-Docker only)
