# PROJECT_MAP: NOMAD

**Repo path:** /Users/udi/work/moinsen/opensource/NOMAD
**Date:** 2026-03-27
**Produced by:** Scout Agent

---

## Project Identity

- **Name:** NOMAD (Navigation Organizer for Maps, Activities & Destinations)
- **Description:** A self-hosted, real-time collaborative travel planner with interactive maps, budgets, packing lists, and more.
- **Type:** Full-stack Web App (client + server in single repo)
- **Primary language:** JavaScript (CommonJS on server, ESM on client)
- **Framework:** React 18 (Vite) frontend + Express 4 backend
- **Package manager:** npm (separate package.json for client and server)
- **Version:** 2.6.0 (both client and server)
- **License:** AGPL-3.0

## Directory Structure

```
NOMAD/
├── client/                          # React frontend (Vite + Tailwind)
│   ├── index.html                   # SPA entry HTML
│   ├── package.json                 # Client dependencies
│   ├── vite.config.js               # Vite config with PWA + proxy
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   ├── scripts/
│   │   └── generate-icons.mjs       # PWA icon generation (prebuild)
│   ├── public/
│   │   ├── fonts/                   # Poppins font family (5 weights)
│   │   ├── icons/                   # App icons (SVG, dark/light)
│   │   └── *.svg                    # Logo assets
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root component with routing
│       ├── index.css                # Global styles
│       ├── api/
│       │   ├── client.js            # Axios HTTP client
│       │   └── websocket.js         # WebSocket client
│       ├── components/              # 57 component files in 16 dirs
│       │   ├── Admin/               # Admin panel components
│       │   ├── Budget/              # Budget tracking
│       │   ├── Collab/              # Collaboration features
│       │   ├── Dashboard/           # Dashboard widgets
│       │   ├── Files/               # Document management
│       │   ├── Layout/              # App layout/navigation
│       │   ├── Map/                 # Leaflet map components
│       │   ├── Packing/             # Packing list
│       │   ├── PDF/                 # PDF export
│       │   ├── Photos/              # Photo gallery
│       │   ├── Places/              # Place search/management
│       │   ├── Planner/             # Day planner (drag & drop)
│       │   ├── shared/              # Reusable shared components
│       │   ├── Trips/               # Trip management
│       │   ├── Vacay/               # Vacation planning addon
│       │   └── Weather/             # Weather forecasts
│       ├── i18n/                    # Internationalization
│       │   ├── index.js
│       │   ├── TranslationContext.jsx
│       │   └── translations/
│       │       ├── en.js            # English
│       │       └── de.js            # German
│       ├── pages/                   # 10 page components
│       │   ├── AdminPage.jsx
│       │   ├── AtlasPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── FilesPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── PhotosPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── SettingsPage.jsx
│       │   ├── TripPlannerPage.jsx
│       │   └── VacayPage.jsx
│       └── store/                   # Zustand state stores
│           ├── authStore.js
│           ├── settingsStore.js
│           ├── tripStore.js
│           └── vacayStore.js
├── server/                          # Express backend (CommonJS)
│   ├── package.json                 # Server dependencies
│   ├── .env.example                 # Environment template
│   ├── reset-admin.js               # Admin password reset utility
│   └── src/
│       ├── index.js                 # Express app entry + server startup
│       ├── config.js                # Configuration
│       ├── scheduler.js             # Cron job scheduler (backups, demo reset)
│       ├── websocket.js             # WebSocket server (real-time sync)
│       ├── db/
│       │   └── database.js          # SQLite (better-sqlite3) setup
│       ├── demo/
│       │   ├── demo-reset.js        # Demo mode reset
│       │   └── demo-seed.js         # Demo data seeding
│       ├── middleware/
│       │   └── auth.js              # JWT authentication middleware
│       └── routes/                  # 22 Express route files
│           ├── admin.js
│           ├── assignments.js
│           ├── atlas.js
│           ├── auth.js
│           ├── backup.js
│           ├── budget.js
│           ├── categories.js
│           ├── collab.js
│           ├── dayNotes.js
│           ├── days.js
│           ├── files.js
│           ├── maps.js
│           ├── oidc.js
│           ├── packing.js
│           ├── photos.js
│           ├── places.js
│           ├── reservations.js
│           ├── settings.js
│           ├── tags.js
│           ├── trips.js
│           ├── vacay.js
│           └── weather.js
├── docs/                            # Screenshots only (7 PNG files)
├── .github/
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── docker.yml               # Docker build + push to Docker Hub
├── Dockerfile                       # Multi-stage build (Node 22 Alpine)
├── docker-compose.yml               # Production deployment
├── README.md
├── SECURITY.md
└── LICENSE                          # AGPL-3.0
```

## Entry Points

| File | Type | Description |
|------|------|-------------|
| `server/src/index.js` | Server main | Express app init, route mounting, WebSocket setup, graceful shutdown |
| `client/src/main.jsx` | Client main | React DOM render entry point |
| `client/src/App.jsx` | Client root | Root React component with routing |
| `client/index.html` | SPA shell | HTML template for Vite |
| `server/reset-admin.js` | CLI utility | Admin password reset script |

## Dependencies

### Core (Client)

| Dependency | Version | Category |
|-----------|---------|----------|
| react | ^18.2.0 | UI Framework |
| react-dom | ^18.2.0 | UI Framework |
| react-router-dom | ^6.22.2 | Routing |
| zustand | ^4.5.2 | State Management |
| axios | ^1.6.7 | HTTP Client |
| leaflet | ^1.9.4 | Maps |
| react-leaflet | ^4.2.1 | Maps (React bindings) |
| react-leaflet-cluster | ^2.1.0 | Map marker clustering |
| lucide-react | ^0.344.0 | Icons |
| @react-pdf/renderer | ^4.3.2 | PDF Export |
| react-dropzone | ^14.4.1 | File uploads |
| react-window | ^2.2.7 | Virtualized lists |
| topojson-client | ^3.1.0 | Geo data (Atlas addon) |

### Core (Server)

| Dependency | Version | Category |
|-----------|---------|----------|
| express | ^4.18.3 | Web Framework |
| better-sqlite3 | ^12.8.0 | Database |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | Authentication (JWT) |
| ws | ^8.19.0 | WebSocket |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^8.1.0 | Security headers |
| multer | ^1.4.5-lts.1 | File uploads |
| dotenv | ^16.4.1 | Environment vars |
| node-cron | ^4.2.1 | Scheduled tasks |
| archiver | ^6.0.1 | Backup zip creation |
| unzipper | ^0.12.3 | Backup restoration |
| uuid | ^9.0.0 | ID generation |
| node-fetch | ^2.7.0 | HTTP client (server-side) |

### Dev (Client)

| Dependency | Version | Category |
|-----------|---------|----------|
| vite | ^5.1.4 | Build tool |
| @vitejs/plugin-react | ^4.2.1 | Vite React plugin |
| tailwindcss | ^3.4.1 | CSS framework |
| postcss | ^8.4.35 | CSS processing |
| autoprefixer | ^10.4.18 | CSS vendor prefixes |
| vite-plugin-pwa | ^0.21.0 | PWA/Service Worker |
| sharp | ^0.33.0 | Image processing (icon gen) |

### Dev (Server)

| Dependency | Version | Category |
|-----------|---------|----------|
| nodemon | ^3.1.0 | Dev server auto-reload |

### Notable / Unusual

- **No TypeScript** -- entire codebase is plain JavaScript (.js/.jsx)
- **No test framework** -- zero test files detected across client and server
- **No linter/formatter config** -- no .eslintrc, .prettierrc, or similar
- **SQLite via better-sqlite3** -- synchronous, embedded database (no separate DB server)
- **Mixed module systems** -- client uses ESM (`"type": "module"`), server uses CommonJS
- **PWA with offline support** -- Workbox service worker caches map tiles, API data, uploads

## Test Infrastructure

- **Framework:** None detected
- **Test count:** 0
- **Source-to-test ratio:** 110 source files : 0 test files
- **Test configuration:** None
- **CI test command:** None (CI only builds Docker image)

## CI/CD

| Pipeline | File | Triggers | Steps |
|----------|------|----------|-------|
| Build & Push Docker Image | `.github/workflows/docker.yml` | Push to `main`, manual dispatch | Checkout, Docker Buildx setup, Docker Hub login, Build & push `mauriceboe/nomad:latest` |

**Deployment target:** Docker Hub (`mauriceboe/nomad`)
**No test step in CI** -- pipeline goes straight from checkout to build+push.

## Environment and Configuration

- **Environment variables:** `PORT`, `JWT_SECRET`, `NODE_ENV`, `ALLOWED_ORIGINS`, `DEMO_MODE` (from `.env.example`)
- **Database:** SQLite file at `./data/travel.db`
- **Uploads:** Stored at `./uploads/` (photos, files, covers subdirs)
- **Backups:** Stored at `./data/backups/`
- **Dev proxy:** Vite proxies `/api`, `/uploads`, `/ws` to `localhost:3001`
- **Production:** Express serves built client from `./public/`, runs on port 3000

## Git Overview

- **Has git history:** Yes
- **Total commits:** 110
- **Contributors:** 1 (Maurice / mauriceboe — 110 commits)
- **First commit:** 2026-03-18
- **Last commit:** 2026-03-26
- **Branches:** `main` (single branch)
- **Age:** 9 days

## Project Classification

- **Maturity:** Alpha/Beta (110 commits in 9 days, single developer, no tests, version 2.6.0 suggests rapid iteration)
- **Scale:** Medium (151 files: 80 client source, 30 server source, supporting configs)
- **Documentation level:** Moderate (comprehensive README with setup/usage, but no inline API docs, JSDoc, or architecture docs)
- **Code quality tooling:** None (no linter, formatter, or type checker configured)
