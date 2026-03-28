# INTENT_REPORT: NOMAD

**Date:** 2026-03-27
**Produced by:** Intent-Analyst Agent
**Based on:** PROJECT_MAP.md + FEATURE_REPORT.md + EVOLUTION_REPORT.md

---

## Explicit Intent Signals

### From Documentation

| Source | Signal | Implication |
|--------|--------|-------------|
| README.md tagline | "Navigation Organizer for Maps, Activities & Destinations" | NOMAD is a backronym; the name was carefully chosen to evoke travel/exploration identity |
| README.md subtitle | "A self-hosted, real-time collaborative travel planner with interactive maps, budgets, packing lists, and more" | Self-hosting and real-time collaboration are primary differentiators, not afterthoughts |
| README.md "Quick Start" | Single `docker run` one-liner is the first thing after features | Ultra-low friction deployment is a core goal; Docker is the canonical deployment method |
| README.md "Your data stays yours" | Login page tagline: `'login.selfHosted': 'Self-hosted · Open Source · Your data stays yours'` | Data sovereignty is a marketing pillar, not just a technical choice |
| README.md "Live Demo" | `https://demo-nomad.pakulat.org` with hourly resets | Developer wants adoption through try-before-install, a pattern from mature self-hosted projects (Nextcloud, Immich) |
| Login page tagline | `'login.tagline': 'Your Trips.\nYour Plan.'` | Emphasizes ownership and personalization; "your" repeated twice |
| Login page description | `'login.description': 'Plan trips collaboratively with interactive maps, budgets, and real-time sync.'` | Collaboration is the second word after "plan" -- explicitly positioned as core, not additive |
| SECURITY.md | "Only the latest version receives security updates... response within 48 hours" | Solo developer making professional-grade security commitments; aspires to community trust |
| LICENSE | AGPL-3.0 (switched from MIT on day 2) | Deliberate pivot to prevent closed-source forks; wants community contributions to flow back |
| FUNDING.yml | Ko-fi + Buy Me a Coffee (mauriceboe) | Pursuing hobby-level sustainable funding, not VC/commercial model |
| Dockerfile comments | German: "React Client bauen", "Produktions-Server", "Fonts fur PDF-Export kopieren" | Developer's native language is German; English-first is an intentional choice for wider reach |
| docker-compose.yml | `image: mauriceboe/nomad:2.5.5` (not `:latest` in compose) | Pinned version in compose suggests awareness of upgrade safety for users |
| docker-compose.yml | Health check on `/api/health` | Production readiness is a goal, not an afterthought |
| Issue templates | Standard bug_report.md and feature_request.md with device/browser fields | Expects external users and wants structured feedback; community-facing project |
| README addons section | "modular, admin-toggleable" | Extensibility architecture is explicit; admin controls feature surface area |
| .env.example | Only 3 vars: `PORT`, `JWT_SECRET`, `NODE_ENV` | Minimal configuration philosophy; "just works" out of the box |

### From Package Metadata

| Field | Value | Implication |
|-------|-------|-------------|
| `name` (client) | `nomad-client` | Clear client/server separation in naming |
| `name` (server) | `nomad-server` | Monorepo with distinct packages but no workspace tooling |
| `version` | `2.6.0` (both packages) | Versions kept in sync; treated as single product |
| `private: true` (client) | Not published to npm | Client is deployment artifact, not a library |
| `@react-pdf/renderer` | Listed as dependency | PDF export is an intended feature (known to be partially working) |
| `topojson-client` | Listed as dependency | Atlas world map visualization uses real geographic data |
| `react-window` | Listed as dependency | Performance-conscious; virtualizes long lists |
| `sharp` (devDependency) | Image processing for PWA icon generation | `prebuild` script generates icons -- native app experience is intentional |
| `helmet` | Server dependency | Security middleware applied; security is a non-functional requirement |
| `archiver` + `unzipper` | Server dependencies | Full backup/restore cycle is a first-class feature |
| `node-cron` | Server dependency | Scheduled operations (auto-backup, demo reset) are core infrastructure |
| `ws` (not socket.io) | Server dependency | Chose raw WebSocket over socket.io -- lighter, no fallback needed, modern-only |

## Implicit Intent Signals

### Naming Conventions

| Name Pattern | Frequency | Implied Concept |
|--------------|-----------|-----------------|
| `trip` as central entity | 31+ tables, all route paths | Trip is the atomic unit of organization -- everything exists within a trip context |
| `addon` architecture | 6 addons, `addons` table, admin toggle | Plugin-like modularity; features can be enabled/disabled per deployment |
| `assignment` (not "schedule") | Dedicated route + table | A place is "assigned to" a day, not "scheduled on" -- emphasizes flexibility over rigidity |
| `broadcast` / `rooms` | WebSocket module | Chat-room metaphor for real-time sync; each trip is a room |
| `inspector` (place detail) | Translation keys `inspector.*` | Desktop-app vocabulary; implies a polished, app-like detail panel |
| `fusion` (Vacay sharing) | `vacay.fusedWith`, `vacay.dissolve` | Unique metaphor for merging vacation calendars; implies couples/families as users |
| `Collab` (not "social" or "team") | Module name | Collaboration is positioned as an addon, not a core feature -- modular by design |
| `Atlas` (not "stats" or "history") | Module name | Evocative naming; travel statistics presented as a world-exploration narrative |
| `Vacay` (not "leave" or "PTO") | Module name | Casual/fun naming; this is for personal vacation planning, not enterprise HR |
| `DemoBanner`, `demoUploadBlock` | Component/middleware names | Demo mode is a first-class concern with dedicated UX and security constraints |
| `canAccessTrip()` | Database helper | Access control is trip-scoped; sharing model is per-trip |

### Code Comments (WHY comments)

| File:Line | Comment | Implied Intent |
|-----------|---------|----------------|
| `App.jsx:9` | `// PhotosPage removed - replaced by Finanzplan` | Feature was deliberately replaced, not just deleted; "Finanzplan" (German for "finance plan") suggests budget feature absorbed photos |
| `App.jsx:98` | `// Support legacy boolean + new string values` | Backwards compatibility awareness for dark mode settings across upgrades |
| `TripPlannerPage.jsx:111` | `const [routeInfo, setRouteInfo] = useState(null) // unused legacy` | Developer leaves explicit notes about technical debt; aware but not cleaning |
| `config.js:8` | `// Try to read a persisted secret from disk` | Auto-generates and persists JWT secret; "zero-config" is a design goal |
| `config.js:23` | `'Sessions will reset on server restart. Set JWT_SECRET env var for persistent sessions.'` | Graceful degradation with helpful warnings; production-awareness |
| `websocket.js:24` | `// Heartbeat: ping every 30s, terminate if no pong` | Connection health monitoring; reliability-conscious |
| `database.js:614` | `// Future migrations go here (append only, never reorder)` | Developer has established migration discipline for data safety |
| `database.js:626` | `// First registered user becomes admin — no default admin seed needed` | Secure-by-default; no hardcoded admin credentials |
| `database.js:683-684` | `// Proxy so all route modules always use the current _db instance` | Sophisticated solution for hot-reloading DB after restore; production awareness |
| `scheduler.js:105` | `// Demo mode: hourly reset of demo user data` | Demo is a separate concern with its own lifecycle |
| `index.js:47-49` | `contentSecurityPolicy: false, // managed by frontend meta tag or reverse proxy` | Aware of security layers; defers to deployment environment |
| `index.js:48` | `crossOriginEmbedderPolicy: false, // allows loading external images (maps, etc.)` | Pragmatic security tradeoff; knows why relaxation is needed |

### Error Messages

| Context | Message | Implied Expectation |
|---------|---------|---------------------|
| WebSocket auth | `'Authentication required'`, `'Invalid or expired token'` | WebSocket connections are authenticated; no anonymous real-time access |
| Trip access | `'Access denied'` on WebSocket join | Trip isolation is enforced even at WebSocket level |
| Demo mode | `'Password change is disabled in demo mode.'`, `'Account deletion is disabled in demo mode.'` | Demo mode has fine-grained restrictions; developer thinks about abuse vectors |
| CORS | `'Not allowed by CORS'` | Cross-origin security is configurable but enforced |
| DB proxy | `'Database connection is not available (restore in progress?)'` | Graceful handling of transient DB unavailability during backup restore |
| Admin self-update | `process.exit(0)` after update | Relies on container orchestrator to restart; Docker-first mindset |
| Registration | `'Registration is disabled. Contact your administrator.'` | Admin controls who can join; multi-tenant awareness |

### Configuration Patterns

| Config | Setting | Implied Intent |
|--------|---------|----------------|
| `ALLOWED_ORIGINS` env var | Optional CORS whitelist | Deployment flexibility; works behind reverse proxies |
| `DEMO_MODE` env var | Enables demo user, hourly reset, upload blocks | Demo is a deployment mode, not a code path hack |
| `JWT_SECRET` auto-generation | Falls back to random secret persisted to disk | "Just works" philosophy; secure defaults without mandatory configuration |
| `express.json({ limit: '100kb' })` | Request body size limit | Defensive; prevents abuse without complex rate limiting |
| `PRAGMA busy_timeout = 5000` | SQLite concurrency | Aware of concurrent access patterns; 5s is generous |
| `PRAGMA foreign_keys = ON` | Referential integrity | Data integrity is a priority; cascading deletes are intentional |
| `PRAGMA journal_mode = WAL` | Write-Ahead Logging | Performance-conscious; enables concurrent reads during writes |
| Weather: Open-Meteo (no key) | Replaced OpenWeatherMap | Removed API key dependency; "no API key required" repeated in UI |
| Map tiles: configurable URL | `settings.mapTemplatePlaceholder` | Users can bring their own tile server; avoids vendor lock-in |
| Backup retention: configurable | `keep_days` setting with options from 1 day to forever | Data lifecycle management is user-controlled |
| Graceful shutdown | SIGTERM/SIGINT handlers with 10s forced exit | Container-orchestrator aware; production-grade process management |

## Aspiration Signals

### TODOs and FIXMEs

| # | File:Line | Content | Implied Goal |
|---|-----------|---------|--------------|
| -- | -- | **ZERO TODOs or FIXMEs found in entire codebase** | The developer either (a) resolves all TODOs before committing, or (b) tracks future work externally. Given the commit velocity (110 commits in 9 days), this suggests a "ship complete features" discipline. |

Confirmed: grep for `TODO|FIXME|HACK|WORKAROUND|XXX` across both `server/src/` and `client/src/` returned zero results.

### Unrealized Features

| Signal | Evidence | Implied Feature |
|--------|----------|-----------------|
| Unsplash API integration | `unsplash_api_key` column in users table, `/api/trips/:tripId/places/:id/image` endpoint, Unsplash search code in `places.js:150-191` | **Image search for places via Unsplash** -- fully coded but no UI trigger found; API key field exists in DB but not in admin settings UI. Vestigial feature from early development. |
| PhotosPage removed | `App.jsx:9`: "PhotosPage removed - replaced by Finanzplan" | **Trip photo gallery** was a standalone page, deprioritized in favor of budget/finance features. Photos still exist as place attachments and file uploads. |
| PDF Export (partial) | `@react-pdf/renderer` dependency, `TripPDF.jsx` component, translation keys for PDF, Dockerfile copies fonts for PDF | **Full trip PDF export** -- component exists, fonts are deployed, but FEATURE_REPORT says only partial. 6 fix attempts per EVOLUTION_REPORT suggest persistent rendering issues. |
| `routeInfo` state (unused) | `TripPlannerPage.jsx:111`: `// unused legacy` | **Route information display** was planned but the state variable was never connected to UI |
| `react-window` (minimal usage) | Only used in `PlannerSidebar.jsx` | **List virtualization** was adopted for performance but only applied to one component; suggests awareness of scaling needs |
| Dashboard widgets | Translation keys for currency converter and timezone clock | **Dashboard widgets system** -- currency and timezone tools are built, implying more widgets could follow |
| `tags` route + table | `server/src/routes/tags.js`, tags table in schema | **Tag system** -- full CRUD exists but tags appear underutilized in UI compared to categories |
| Admin self-update via git | `admin.js:195-235`: `git pull origin main`, `npm install`, `npm run build`, `process.exit(0)` | **Self-updating application** -- ambitious for a self-hosted app; pulls from GitHub and restarts. Only works for non-Docker installs (git-based deployments). |
| `photos` route still active | `server/src/routes/photos.js` with full upload/delete logic | **Photo management** backend is complete even though PhotosPage was removed from frontend routing |
| Accommodations endpoint | `server/src/routes/days.js` exports `accommodationsRouter` | **Per-day accommodation tracking** -- exists as a sub-resource of days |
| `WhatsNextWidget` | `client/src/components/Collab/WhatsNextWidget.jsx` | **"What's Next" activity preview** -- shows upcoming activities with times; implies desire for at-a-glance trip status |

## Reconstructed Goals

### Primary Goal

- **Goal:** Build a comprehensive, self-hosted travel planning application that replaces the need for scattered tools (Google Sheets, TripIt, WhatsApp groups, shared docs) with a single, privacy-respecting, real-time collaborative platform.
- **Confidence:** 95% (Very High)
- **Evidence:**
  - The feature breadth (30 features covering planning, budgeting, packing, reservations, documents, weather, maps, collaboration) directly mirrors what travel groups typically cobble together from 5-8 different tools
  - "Self-hosted" and "Your data stays yours" are lead marketing claims
  - Real-time collaboration via WebSocket is deeply integrated (trip rooms, broadcast to all members)
  - The tagline "Your Trips. Your Plan." emphasizes ownership
  - Docker-first deployment with single-command setup removes friction
  - AGPL license ensures community contributions flow back (protection against commercial forks)
  - Demo instance with hourly reset demonstrates confidence in the product
- **Counter-evidence:**
  - None significant. Every architectural decision aligns with this goal.

### Secondary Goals

| # | Goal | Confidence | Key Evidence |
|---|------|------------|-------------|
| 1 | **Native app experience without app stores** | 90% | PWA with offline support, Workbox caching, `prebuild` icon generation via Sharp, fullscreen standalone mode, touch-optimized layouts, themed status bar |
| 2 | **Zero-config deployment** | 90% | Auto-generated JWT secret, Open-Meteo weather (no API key), OSM as default map (no Google key needed), SQLite (no DB server), single Docker image |
| 3 | **Multi-user family/friend group collaboration** | 85% | Trip sharing with members, Collab addon (chat, notes, polls), Vacay "fusion" for couples, participant tracking on activities, per-person budget splitting |
| 4 | **Modular feature architecture** | 85% | Addon system with admin toggles, 6 addons (3 trip-scoped, 2 global, 1 hybrid), addon seeding in database, clear separation of addon routes |
| 5 | **German-market-first with global reach** | 80% | Native German speaker (Dockerfile comments in German, "Finanzplan" in code comment), EN/DE translations, but English-first README and UI defaults |
| 6 | **Compete with commercial travel planners** | 75% | Feature parity with TripIt/Wanderlog (reservations, weather, maps, budget), but self-hosted positioning differentiates rather than directly competing |
| 7 | **Personal travel statistics/gamification** | 70% | Atlas addon with visited countries, streak tracking, continent breakdown, "liquid glass UI effects" (per FEATURE_REPORT) -- travel as achievement |
| 8 | **Admin-controlled multi-tenant deployment** | 65% | Admin panel, user management, registration toggle, global categories, API key management shared across users, addon toggles |

### Quality Goals

| Quality Dimension | Intended Level | Evidence |
|-------------------|---------------|----------|
| **Functionality** | High -- feature-complete MVP for travel planning | 29/30 features complete; only PDF Export partially working |
| **Usability** | High -- app-like experience | PWA, dark mode, responsive design, drag-and-drop, inline editing, toast notifications, loading states |
| **Reliability** | Medium-High -- production-aware but not battle-tested | Graceful shutdown, heartbeat WebSocket, health endpoint, auto-backups, WAL mode, but zero tests |
| **Security** | Medium -- security-conscious but informal | Helmet, JWT auth, bcrypt passwords, OIDC SSO, demo mode restrictions, CORS config, but no CSP, no rate limiting, no audit log |
| **Performance** | Medium -- aware but not optimized | `react-window` for list virtualization, WAL mode, busy_timeout, but raw SQL with potential N+1 queries |
| **Maintainability** | Low-Medium -- functional but accumulating debt | No tests, no TypeScript, no linter, inline migrations, some dead code (`routeInfo`, Unsplash), but clean module structure and consistent patterns |
| **Portability** | High -- runs anywhere Docker runs | Single Docker image, SQLite file-based DB, volume mounts for persistence, optional API keys |
| **Internationalization** | Medium -- bilingual | EN + DE with ~1016 translation keys, but only 2 languages |

## Audience Reconstruction

- **Target users:** Small travel groups (2-8 people) planning trips together -- friends, couples, families. The "fusion" feature in Vacay specifically targets couples. The Collab addon (chat, polls, notes) targets friend groups making group decisions. The budget per-person splitting targets cost-sharing among friends.
- **Secondary audience:** Self-hosting enthusiasts who value data sovereignty. The "Your data stays yours" messaging, AGPL license, and Docker-first deployment speak directly to the r/selfhosted community.
- **Tertiary audience:** Solo travelers who want an organized, all-in-one planning tool. The feature set works for single users (packing lists, reservations, weather, maps) even without collaboration.
- **Evidence:** Login page features highlight collaboration prominently. Vacay "fusion" implies couples. Budget "per person" splitting implies groups. Demo instance and community templates (issue templates, funding) imply self-hosting enthusiasts. Admin panel with registration controls implies small-team deployments.
- **Confidence:** 85%

## Scope Assessment

- **Intended scope:** Full product -- not an MVP, not a POC, not a library. This is a complete, deployable, production-intended application with admin controls, backup/restore, auto-updates, i18n, PWA support, and a demo mode. It is closer in ambition to Nextcloud or Immich than to a weekend project.
- **Evidence:**
  - 30 features across 6 major domains (planning, management, collaboration, visualization, administration, infrastructure)
  - Admin panel with user management, addon toggles, API key management, backup scheduling
  - Self-update mechanism (git pull + rebuild + restart)
  - Demo deployment with hourly reset
  - Security policy with 48-hour response commitment
  - Docker Hub publishing with version tags
  - GitHub release history shown in admin panel
  - Version 2.6.0 (not 0.x) -- the developer considers this production-ready
- **Confidence:** 90%

## Intent Summary

NOMAD is a passion project by a solo German developer (Maurice) who set out to build the self-hosted travel planner he wished existed. The project's intent is crystal clear: replace the fragmented toolchain of Google Sheets, WhatsApp groups, TripIt, and shared documents with a single, privacy-respecting, real-time collaborative platform that "just works" out of a Docker container.

The developer's ambition is remarkably well-matched to execution. In 9 days and 110 commits (56% between 8pm-3am), Maurice shipped a 30-feature application that covers trip planning, budget tracking, reservations, packing lists, file management, weather integration, interactive maps, real-time collaboration (chat, notes, polls), vacation day planning, and travel statistics visualization. The zero TODO/FIXME count across the entire codebase is the strongest signal of intent: this developer ships complete features and does not leave loose ends in the code. Future work is tracked externally or simply built when needed.

The AGPL license choice (pivoted from MIT on day 2) reveals a nuanced understanding of open-source economics. Maurice wants community contributions to flow back while preventing commercial forks -- a strategy borrowed from mature projects like Nextcloud. Combined with Ko-fi/Buy Me a Coffee funding links and a polished demo instance, the intent is sustainable hobby-level open source: serious enough to attract users, but not positioned for venture funding.

The most telling implicit signal is what was NOT built: there are no tests, no TypeScript, no linter, and no CI/CD pipeline (beyond Docker Hub publishing). This is not negligence -- it is prioritization. Every hour went into user-facing features rather than developer-facing infrastructure. The developer's intent was to build something people can USE, not something that impresses engineering peers. The admin self-update mechanism (which pulls from GitHub and restarts the process) exemplifies this: it solves a real user problem (keeping self-hosted software updated) with a pragmatic, if unconventional, approach.

The unrealized features tell a story of scope management rather than abandoned ambition. The Unsplash integration exists in the backend but was never surfaced in the UI -- likely deprioritized when Google Places provided photos. The PDF export persists despite 6 fix attempts because the developer sees it as high-value (exporting trip plans for offline use). The PhotosPage was consciously replaced by the budget feature ("Finanzplan"), suggesting active feature triage. These are the marks of a developer who builds fast, ships what works, and moves on -- not one who over-plans and under-delivers.
