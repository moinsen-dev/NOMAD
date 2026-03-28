# FEATURES: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD

---

## Feature Inventory

| # | Feature | Status | Complexity | First Commit | Last Commit | Files | Tests |
|---|---------|--------|-----------|-------------|------------|-------|-------|
| 1 | Authentication & Users | Complete | Complex | Mar 18 (initial) | Mar 26 | 4 | 0 |
| 2 | Trip Management | Complete | Complex | Mar 18 (initial) | Mar 26 | 3 | 0 |
| 3 | Trip Sharing / Collaboration | Complete | Moderate | Mar 18 (initial) | Mar 26 | 2 | 0 |
| 4 | Place Management | Complete | Complex | Mar 18 (initial) | Mar 26 | 3 | 0 |
| 5 | Day Planner | Complete | Complex | Mar 18 (initial) | Mar 26 | 4 | 0 |
| 6 | Map Integration | Complete | Complex | Mar 18 (initial) | Mar 26 | 3 | 0 |
| 7 | Weather Forecasts | Complete | Moderate | Mar 18 (initial) | Mar 24 | 2 | 0 |
| 8 | Budget Planner | Complete | Moderate | Mar 18 (initial) | Mar 25 | 2 | 0 |
| 9 | Packing List | Complete | Simple | Mar 18 (initial) | Mar 24 | 2 | 0 |
| 10 | Document Management | Complete | Moderate | Mar 18 (initial) | Mar 25 | 2 | 0 |
| 11 | Photo Gallery | Complete | Moderate | Mar 18 (initial) | Mar 24 | 1 | 0 |
| 12 | Reservations | Complete | Moderate | Mar 18 (initial) | Mar 26 | 1 | 0 |
| 13 | Day Notes | Complete | Simple | Mar 18 (initial) | Mar 24 | 1 | 0 |
| 14 | Accommodations | Complete | Moderate | Mar 24 | Mar 24 | 1 | 0 |
| 15 | Categories & Tags | Complete | Simple | Mar 18 (initial) | Mar 24 | 2 | 0 |
| 16 | Collab: Notes | Complete | Moderate | Mar 25 (v2.6.0) | Mar 25 | 2 | 0 |
| 17 | Collab: Polls | Complete | Moderate | Mar 25 (v2.6.0) | Mar 25 | 2 | 0 |
| 18 | Collab: Chat | Complete | Complex | Mar 25 (v2.6.0) | Mar 25 | 2 | 0 |
| 19 | Vacay Addon | Complete | Complex | Mar 20 (v2.5.0) | Mar 24 | 3 | 0 |
| 20 | Atlas Addon | Complete | Moderate | Mar 20 (v2.5.0) | Mar 24 | 2 | 0 |
| 21 | Admin Panel | Complete | Complex | Mar 18 (initial) | Mar 24 | 2 | 0 |
| 22 | Backup & Restore | Complete | Complex | Mar 18 (initial) | Mar 21 | 2 | 0 |
| 23 | Real-time Sync (WebSocket) | Complete | Complex | Mar 19 (v2.1.0) | Mar 24 | 2 | 0 |
| 24 | Settings | Complete | Simple | Mar 18 (initial) | Mar 24 | 3 | 0 |
| 25 | Internationalization (i18n) | Complete | Moderate | Mar 18 (initial) | Mar 25 | 3 | 0 |
| 26 | Demo Mode | Complete | Moderate | Mar 19 | Mar 22 | 3 | 0 |
| 27 | PWA / Offline | Complete | Moderate | Mar 21 | Mar 22 | 2 | 0 |
| 28 | Dark Mode | Complete | Simple | Mar 18 (initial) | Mar 24 | 2 | 0 |
| 29 | PDF Export | Partial | Complex | Mar 18 (initial) | Mar 22 | 2 | 0 |
| 30 | Assignment Participants | Complete | Simple | Mar 24 | Mar 26 | 1 | 0 |

## Feature Details

### Authentication & Users
- **Status:** Complete
- **Description:** JWT auth (24h), bcrypt, registration (first user = admin), OIDC/SSO, avatars, API key management, rate limiting, account deletion
- **Key files:** `server/src/routes/auth.js`, `server/src/routes/oidc.js`, `server/src/middleware/auth.js`, `client/src/store/authStore.js`
- **Architecture:** JWT middleware, bcrypt hashing, rate limiter (10/15min)
- **Data entities:** users, settings
- **Test coverage:** None
- **Tech debt:** None significant

### Trip Management
- **Status:** Complete
- **Description:** CRUD trips with date range, currency, cover image. Auto-generates days from date range (up to 90). Archiving. Trip member counts.
- **Key files:** `server/src/routes/trips.js`, `client/src/store/tripStore.js`, `client/src/pages/DashboardPage.jsx`
- **Architecture:** REST CRUD, Zustand store (tripStore.js — 863 lines, manages 10+ sub-domains)
- **Data entities:** trips, days
- **Test coverage:** None
- **Tech debt:** tripStore.js is a monolith at 863 lines

### Day Planner
- **Status:** Complete
- **Description:** Day-by-day itinerary, drag-drop reorder, move between days, per-assignment times, batch-loaded tags/participants
- **Key files:** `server/src/routes/days.js`, `server/src/routes/assignments.js`, `client/src/components/Planner/`
- **Architecture:** Nested Express routers (mergeParams), N+1 batch optimization
- **Data entities:** days, day_assignments, assignment_participants
- **Test coverage:** None

### Map Integration
- **Status:** Complete
- **Description:** Dual-provider search (Google Places v1 + Nominatim/OSM fallback), place details, photo proxy with 12h cache, API key cascading (user -> admin)
- **Key files:** `server/src/routes/maps.js`, `client/src/components/Map/`
- **Architecture:** Provider fallback pattern, in-memory caching
- **Data entities:** places (google_place_id, lat/lng)
- **Test coverage:** None

### Collab: Chat
- **Status:** Complete
- **Description:** Real-time messaging, reply-to threading, emoji reactions (toggle), soft-delete, link previews (OG meta), cursor-based pagination (100/page)
- **Key files:** `server/src/routes/collab.js`, `client/src/components/Collab/`
- **Architecture:** WebSocket broadcast, batch-loaded reactions, iMessage-style UI
- **Data entities:** collab_messages, collab_message_reactions
- **Test coverage:** None

### Vacay Addon
- **Status:** Complete
- **Description:** Multi-user vacation planner, calendar toggle, company holidays, public holidays (Nager.Date API), plan fusion (invite/accept/decline/dissolve), carry-over calculation
- **Key files:** `server/src/routes/vacay.js`, `client/src/store/vacayStore.js`, `client/src/pages/VacayPage.jsx`
- **Architecture:** Standalone addon (not trip-scoped), WebSocket sync, in-memory holiday cache (24h)
- **Data entities:** vacay_plans, vacay_plan_members, vacay_user_colors, vacay_years, vacay_user_years, vacay_entries, vacay_company_holidays
- **Test coverage:** None

### Backup & Restore
- **Status:** Complete
- **Description:** Manual + automated backups (zip: DB + uploads), download, restore from stored/uploaded zip, cron scheduling (hourly/daily/weekly/monthly), configurable retention
- **Key files:** `server/src/routes/backup.js`, `server/src/scheduler.js`
- **Architecture:** Cron scheduling, WAL checkpoint before backup, DB close/reopen cycle on restore, path traversal protection
- **Data entities:** app_settings (backup config)
- **Test coverage:** None

### PDF Export
- **Status:** Partial
- **Description:** Trip PDF export via @react-pdf/renderer. Component exists, fonts deployed in Docker, but 6 fix attempts for X-Frame-Options/blob URL issues never achieved stable cross-browser rendering
- **Key files:** `client/src/components/PDF/`
- **Architecture:** React PDF renderer
- **Test coverage:** None
- **Tech debt:** Partially functional, persistent rendering issues

## Feature Map

### Core (everything depends on these)
- Authentication & Users
- Trip Management
- Real-time Sync (WebSocket)

### Mid-Tier (depend on core, depended on by UI)
- Place Management
- Day Planner
- Categories & Tags
- Settings

### Peripheral (mostly standalone, independently removable)
- Budget Planner, Packing List, Document Management, Photo Gallery, Reservations, Day Notes, Accommodations
- Collab (Notes/Polls/Chat), Vacay Addon, Atlas Addon
- Weather, Map Integration, Admin Panel, Backup & Restore, Demo Mode
- i18n, PWA, Dark Mode, PDF Export, Assignment Participants

## Status Summary

| Status | Count | Percentage |
|--------|-------|-----------|
| Complete | 29 | 97% |
| Partial | 1 | 3% |
| Stubbed | 0 | 0% |
| Abandoned | 0 | 0% |
