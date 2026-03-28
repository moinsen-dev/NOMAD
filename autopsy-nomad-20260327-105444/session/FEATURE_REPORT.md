# FEATURE_REPORT: NOMAD

**Date:** 2026-03-27
**Produced by:** Code-Analyst Agent
**Based on:** PROJECT_MAP.md

---

## Feature Inventory

| # | Feature | Status | Files (key) | Tests | Description |
|---|---------|--------|-------------|-------|-------------|
| 1 | Authentication & Users | Complete | auth.js, oidc.js, auth middleware, authStore.js | None | JWT auth, registration, login, OIDC/SSO, avatars, role system |
| 2 | Trip Management | Complete | trips.js, tripStore.js, DashboardPage | None | CRUD trips, cover images, date-range day generation, archiving |
| 3 | Trip Sharing / Collaboration | Complete | trips.js (members), trip_members table | None | Invite by email/username, owner/member roles, shared access |
| 4 | Place Management | Complete | places.js, Places components | None | CRUD places with categories, tags, coordinates, time, transport mode |
| 5 | Day Planner | Complete | days.js, assignments.js, Planner components | None | Day-by-day itinerary, drag-drop reorder, move between days, per-assignment times |
| 6 | Map Integration | Complete | maps.js, Map components | None | Google Places search + OSM/Nominatim fallback, place details, photo proxy |
| 7 | Weather Forecasts | Complete | weather.js, Weather components | None | Open-Meteo forecast + climate archive, detailed hourly, bilingual (DE/EN) |
| 8 | Budget Planner | Complete | budget.js, Budget components | None | Categorized expenses, per-person splits, paid tracking, per-person summary |
| 9 | Packing List | Complete | packing.js, Packing components | None | Categorized checklist, check/uncheck, drag-drop reorder |
| 10 | Document Management | Complete | files.js, Files components | None | Upload/download files (50MB), link to places/reservations, configurable allowed types |
| 11 | Photo Gallery | Complete | photos.js, Photos components | None | Multi-upload (20 at once, 10MB each), link to day/place, captions |
| 12 | Reservations | Complete | reservations.js, Planner components | None | CRUD reservations with status, type, times, linked to day/place/assignment |
| 13 | Day Notes | Complete | dayNotes.js, Planner components | None | Timestamped notes with icons, sortable, per-day |
| 14 | Accommodations | Complete | days.js (accommodationsRouter) | None | Multi-day stays linked to places, check-in/out times, confirmation codes |
| 15 | Categories & Tags | Complete | categories.js, tags.js | None | Custom categories (icon+color), user tags, place-tag many-to-many |
| 16 | Collab: Notes | Complete | collab.js, Collab components | None | Shared notes with categories, colors, pinning, file attachments, website links |
| 17 | Collab: Polls | Complete | collab.js, Collab components | None | Multi-option polls, single/multi-choice, voting, close/reopen |
| 18 | Collab: Chat | Complete | collab.js, Collab components | None | Real-time messaging, reply-to, emoji reactions, soft-delete, link previews |
| 19 | Vacay Addon | Complete | vacay.js, vacayStore.js, VacayPage | None | Vacation day planner, calendar, multi-user fusion, public/company holidays, carry-over |
| 20 | Atlas Addon | Complete | atlas.js, AtlasPage | None | World map of visited countries, travel stats, continent breakdown, streaks |
| 21 | Admin Panel | Complete | admin.js, AdminPage | None | User CRUD, online status, stats, OIDC config, addon toggle, version check, self-update |
| 22 | Backup & Restore | Complete | backup.js, scheduler.js | None | Manual + auto (cron) backups, download, restore from file/upload, retention policy |
| 23 | Real-time Sync (WebSocket) | Complete | websocket.js (server+client) | None | Room-based broadcast per trip, heartbeat, auth, optimistic UI updates |
| 24 | Settings | Complete | settings.js, settingsStore.js, SettingsPage | None | Per-user key-value settings (dark mode, language, map tiles, etc.) |
| 25 | Internationalization | Complete | i18n/ (en, de) | None | English + German, TranslationProvider, language switcher |
| 26 | Demo Mode | Complete | demo-seed, demo-reset, scheduler | None | Demo user with hourly reset, upload blocking, baseline save/restore |
| 27 | PWA / Offline | Complete | manifest, service worker | None | Progressive Web App with installability |
| 28 | Dark Mode | Complete | App.jsx, settingsStore | None | Auto/light/dark with system preference detection, PWA theme-color sync |
| 29 | PDF Export | Partial | PDF components (directory exists) | None | PDF export components exist; PhotosPage removed in favor of it |
| 30 | Assignment Participants | Complete | assignments.js, assignment_participants table | None | Per-activity participant tracking for shared trips |

## Feature Details

### 1. Authentication & Users

- **Status:** Complete
- **Files:** `server/src/routes/auth.js`, `server/src/routes/oidc.js`, `server/src/middleware/auth.js`, `client/src/store/authStore.js`
- **Entry point:** `/api/auth/*`, `/api/auth/oidc/*`
- **Description:** Full auth system with JWT tokens (24h expiry), bcrypt password hashing, rate limiting (10/15min), user registration (first user = admin), OIDC/SSO integration with auto-discovery, avatar uploads, API key management (Google Maps, OpenWeather), account deletion, travel stats aggregation.
- **Completeness evidence:** All CRUD operations work, OIDC flow with state CSRF protection, rate limiter, demo mode restrictions.
- **Dependencies:** None (foundational)
- **Tests:** None

### 2. Trip Management

- **Status:** Complete
- **Files:** `server/src/routes/trips.js`, `client/src/store/tripStore.js`, `client/src/pages/DashboardPage.jsx`
- **Entry point:** `/api/trips`, Dashboard page
- **Description:** Create/read/update/delete trips with title, description, date range, currency, cover image. Automatic day generation from date range (up to 90 days). Trip archiving. Cover image upload (20MB limit). Lists include day/place/member counts.
- **Completeness evidence:** Full CRUD with proper date math (UTC-based to avoid DST issues), day re-generation on date changes preserving assignments, owner-only operations for archive/delete/cover.
- **Dependencies:** Auth
- **Tests:** None

### 3. Trip Sharing / Collaboration

- **Status:** Complete
- **Files:** `server/src/routes/trips.js` (member routes), `trip_members` table
- **Entry point:** `/api/trips/:id/members`
- **Description:** Owner can invite users by email or username. Members get full read/write access to trip data. Owner-only operations: archive, delete, cover change. Members can self-remove.
- **Completeness evidence:** Complete invite/remove flow, access checks via `canAccessTrip()` used across all trip-scoped routes.
- **Dependencies:** Auth, Trips
- **Tests:** None

### 4. Place Management

- **Status:** Complete
- **Files:** `server/src/routes/places.js`, `client/src/components/Places/`
- **Entry point:** `/api/trips/:tripId/places`
- **Description:** Rich place entities with name, description, coordinates, address, category, price, currency, times (start/end), duration, notes, image, Google Place ID, website, phone, transport mode. Search/filter by text, category, tag. Unsplash image search. N+1 optimized tag loading.
- **Completeness evidence:** Full CRUD, search filtering, tag association, image search integration, batch tag loading.
- **Dependencies:** Trips, Categories, Tags
- **Tests:** None

### 5. Day Planner

- **Status:** Complete
- **Files:** `server/src/routes/days.js`, `server/src/routes/assignments.js`, `client/src/components/Planner/`
- **Entry point:** `/api/trips/:tripId/days`, `/api/trips/:tripId/days/:dayId/assignments`
- **Description:** Core itinerary builder. Days auto-generated from trip date range. Assignments link places to days with ordering. Drag-drop reorder within day, move between days. Per-assignment times (override place defaults). Batch-loaded with N+1 optimization for tags, participants. Day titles and notes.
- **Completeness evidence:** Full CRUD + reorder + move operations, optimistic UI updates in tripStore, WebSocket broadcast for all mutations, batch loading optimization.
- **Dependencies:** Trips, Places, Categories, Tags
- **Tests:** None

### 6. Map Integration

- **Status:** Complete
- **Files:** `server/src/routes/maps.js`, `client/src/components/Map/`
- **Entry point:** `/api/maps/search`, `/api/maps/details/:placeId`, `/api/maps/place-photo/:placeId`
- **Description:** Dual-provider search: Google Places API (new v1) when API key configured, otherwise Nominatim/OSM free fallback. Place details with reviews, opening hours, editorial summary. Photo proxy that caches results (12h TTL) and persists URLs to DB. API key cascading: user's own key -> admin's key.
- **Completeness evidence:** Two complete search providers, place detail fetch, photo proxy with caching and DB persistence.
- **Dependencies:** Auth (API keys)
- **Tests:** None

### 7. Weather Forecasts

- **Status:** Complete
- **Files:** `server/src/routes/weather.js`, `client/src/components/Weather/`
- **Entry point:** `/api/weather`, `/api/weather/detailed`
- **Description:** Free weather via Open-Meteo (no API key needed). Current weather, 16-day forecast, and historical climate averages for dates beyond forecast range. Detailed view with hourly data, sunrise/sunset, wind, humidity. WMO weather code mapping with German + English descriptions. In-memory cache with TTLs (15min current, 1h forecast, 24h climate).
- **Completeness evidence:** Three weather modes (current/forecast/climate), hourly breakdown, bilingual, caching strategy.
- **Dependencies:** None (free API)
- **Tests:** None

### 8. Budget Planner

- **Status:** Complete
- **Files:** `server/src/routes/budget.js`, `client/src/components/Budget/`
- **Entry point:** `/api/trips/:tripId/budget`
- **Description:** Budget items with category, name, total price, optional persons/days split, notes, sorting. Per-person expense tracking via `budget_item_members` with paid/unpaid status. Per-person summary endpoint calculates total assigned/paid per user. WebSocket sync for all operations.
- **Completeness evidence:** Full CRUD, member assignment with paid tracking, auto-persons-count update, per-person summary query.
- **Dependencies:** Trips, Auth (member tracking)
- **Tests:** None

### 9. Packing List

- **Status:** Complete
- **Files:** `server/src/routes/packing.js`, `client/src/components/Packing/`
- **Entry point:** `/api/trips/:tripId/packing`
- **Description:** Per-trip packing checklist with items, categories, check/uncheck toggle, drag-drop reorder via transaction-based batch update. Default category "Allgemein" (German).
- **Completeness evidence:** Full CRUD + reorder + toggle, WebSocket sync, transaction-based reorder.
- **Dependencies:** Trips
- **Tests:** None

### 10. Document Management

- **Status:** Complete
- **Files:** `server/src/routes/files.js`, `client/src/pages/FilesPage.jsx`
- **Entry point:** `/api/trips/:tripId/files`
- **Description:** File upload (50MB limit) with configurable allowed file types via admin settings. Files can be linked to places and reservations. SVG/HTML blocked for security. UUID-based filenames prevent collisions. Demo mode blocks uploads.
- **Completeness evidence:** Full CRUD with upload, security filtering, configurable extensions, reservation linking.
- **Dependencies:** Trips, Places, Reservations
- **Tests:** None

### 11. Photo Gallery

- **Status:** Complete
- **Files:** `server/src/routes/photos.js`
- **Entry point:** `/api/trips/:tripId/photos`
- **Description:** Multi-photo upload (up to 20 per request, 10MB each). Photos linked to trips with optional day/place association. Captions. Image-only filter (no SVG). Note: PhotosPage removed from client routing but API + data model fully functional.
- **Completeness evidence:** Full CRUD with multi-upload, file deletion on DB delete, security filtering.
- **Dependencies:** Trips
- **Tests:** None

### 12. Reservations

- **Status:** Complete
- **Files:** `server/src/routes/reservations.js`
- **Entry point:** `/api/trips/:tripId/reservations`
- **Description:** Standalone reservation tracker with title, time range (start + end), location, confirmation number, notes. Status: pending/confirmed. Types: restaurant, hotel, flight, activity, other. Can link to day, place, and assignment.
- **Completeness evidence:** Full CRUD with all field updates, WebSocket broadcast.
- **Dependencies:** Trips, Days, Places, Assignments
- **Tests:** None

### 13. Day Notes

- **Status:** Complete
- **Files:** `server/src/routes/dayNotes.js`
- **Entry point:** `/api/trips/:tripId/days/:dayId/notes`
- **Description:** Per-day timestamped notes with customizable emoji icons, sortable ordering. Supports drag-drop between days (delete + recreate in tripStore).
- **Completeness evidence:** Full CRUD, sort ordering, WebSocket sync.
- **Dependencies:** Trips, Days
- **Tests:** None

### 14. Accommodations

- **Status:** Complete
- **Files:** `server/src/routes/days.js` (accommodationsRouter)
- **Entry point:** `/api/trips/:tripId/accommodations`
- **Description:** Multi-day accommodation spans linked to a place, with start/end day references, check-in/check-out times, confirmation codes, notes. Joins place data for display.
- **Completeness evidence:** Full CRUD with place data joins, WebSocket broadcast.
- **Dependencies:** Trips, Places, Days
- **Tests:** None

### 15. Categories & Tags

- **Status:** Complete
- **Files:** `server/src/routes/categories.js`, `server/src/routes/tags.js`
- **Entry point:** `/api/categories`, `/api/tags`
- **Description:** Categories: name + color + icon (emoji), seeded with 10 defaults (Hotel, Restaurant, Attraction, etc.). User-owned. Tags: user-scoped labels with color, many-to-many with places via `place_tags`.
- **Completeness evidence:** Full CRUD, default seeding, association management.
- **Dependencies:** Auth
- **Tests:** None

### 16. Collab: Notes

- **Status:** Complete
- **Files:** `server/src/routes/collab.js` (notes section), `client/src/components/Collab/`
- **Entry point:** `/api/trips/:tripId/collab/notes`
- **Description:** Shared trip notes with title, content, category, color, pinning, website links. File attachments (upload/delete via dedicated endpoints). Author tracking with avatars.
- **Completeness evidence:** Full CRUD, file attachment management with physical file cleanup, WebSocket sync.
- **Dependencies:** Trips, Auth
- **Tests:** None

### 17. Collab: Polls

- **Status:** Complete
- **Files:** `server/src/routes/collab.js` (polls section)
- **Entry point:** `/api/trips/:tripId/collab/polls`
- **Description:** Group decision polls with question, multiple options, single or multi-choice voting. Toggle vote (click to vote, click again to unvote). Close poll to stop voting. Voters visible per option with avatars.
- **Completeness evidence:** Full CRUD + vote toggle + close, WebSocket sync for real-time vote updates.
- **Dependencies:** Trips, Auth
- **Tests:** None

### 18. Collab: Chat

- **Status:** Complete
- **Files:** `server/src/routes/collab.js` (messages section)
- **Entry point:** `/api/trips/:tripId/collab/messages`
- **Description:** Real-time trip chat with text messages, reply-to threading, emoji reactions (toggle), soft-delete (own messages only). Link preview endpoint fetches OG meta tags. Paginated loading (100 per page, cursor-based via `before` param). Batch-loaded reactions.
- **Completeness evidence:** Full CRUD, reaction toggle, reply threading, soft-delete, link preview parsing, pagination, WebSocket real-time delivery.
- **Dependencies:** Trips, Auth, WebSocket
- **Tests:** None

### 19. Vacay Addon

- **Status:** Complete
- **Files:** `server/src/routes/vacay.js`, `client/src/store/vacayStore.js`, `client/src/pages/VacayPage.jsx`
- **Entry point:** `/api/addons/vacay/*`
- **Description:** Multi-user vacation day planner. Features: per-user vacation day allowance, year management, calendar with toggle-on/off days, company holidays, public holiday integration (Nager.Date API with regional support), plan fusion (invite/accept/decline/dissolve), per-user colors, carry-over calculation between years, real-time WebSocket sync.
- **Completeness evidence:** Complete plan management, invite flow with data migration on accept, holiday API proxy with caching, carry-over logic, dissolve with data separation, comprehensive WebSocket notifications.
- **Dependencies:** Auth, WebSocket
- **Tests:** None

### 20. Atlas Addon

- **Status:** Complete
- **Files:** `server/src/routes/atlas.js`, `client/src/pages/AtlasPage.jsx`
- **Entry point:** `/api/addons/atlas/stats`, `/api/addons/atlas/country/:code`
- **Description:** Travel statistics dashboard. Derives visited countries from place coordinates (bounding box) and addresses (name-to-code lookup). Stats: total trips/places/countries/cities/days, continent breakdown, travel streak (consecutive years), most visited country, last/next trip, per-country detail view.
- **Completeness evidence:** Dual country detection (coords + address), 60+ country bounding boxes, multilingual name mapping (EN/DE/JP/KR/TH), comprehensive stats calculation.
- **Dependencies:** Trips, Places
- **Tests:** None

### 21. Admin Panel

- **Status:** Complete
- **Files:** `server/src/routes/admin.js`, `client/src/pages/AdminPage.jsx`
- **Entry point:** `/api/admin/*`
- **Description:** Full admin panel: user management (CRUD, password reset, role assignment), online status tracking via WebSocket, global stats (users/trips/places/files), OIDC SSO configuration, addon enable/disable, version check against GitHub releases, self-update mechanism (git pull + npm install + rebuild + restart), demo baseline management.
- **Completeness evidence:** Complete user CRUD, OIDC config, addon management, version comparison, self-update with git pull.
- **Dependencies:** Auth, WebSocket
- **Tests:** None

### 22. Backup & Restore

- **Status:** Complete
- **Files:** `server/src/routes/backup.js`, `server/src/scheduler.js`
- **Entry point:** `/api/backup/*`
- **Description:** Manual backup creation (zip: DB + uploads), download, restore from stored or uploaded zip. Automated backups via cron (hourly/daily/weekly/monthly) with configurable retention (delete after N days). Restore handles DB close/reopen cycle, WAL checkpoint before backup, path traversal protection.
- **Completeness evidence:** Full manual + auto backup, restore with DB reinit, scheduler with settings persistence, cleanup of old backups.
- **Dependencies:** Auth (admin only)
- **Tests:** None

### 23. Real-time Sync (WebSocket)

- **Status:** Complete
- **Files:** `server/src/websocket.js`, `client/src/api/websocket.js`
- **Entry point:** `ws://host/ws?token=...`
- **Description:** JWT-authenticated WebSocket with room-based broadcasting per trip. Join/leave rooms. Heartbeat (30s ping). Sender exclusion via socket ID. Supports: trip, place, assignment, day, dayNote, packing, budget, reservation, file, accommodation, collab events. Client tracks socket ID for header-based exclusion in REST calls.
- **Completeness evidence:** Complete room management, heartbeat, auth, broadcast with exclusion, all entity types covered.
- **Dependencies:** Auth
- **Tests:** None

### 24. Settings

- **Status:** Complete
- **Files:** `server/src/routes/settings.js`, `client/src/store/settingsStore.js`, `client/src/pages/SettingsPage.jsx`
- **Entry point:** `/api/settings`
- **Description:** Per-user key-value settings store. Supports JSON values. Bulk upsert endpoint. Client defaults: map tile URL, default coordinates (Paris), zoom, dark mode, currency, language, temperature unit, time format.
- **Completeness evidence:** Full CRUD + bulk, JSON serialization, client-side defaults.
- **Dependencies:** Auth
- **Tests:** None

### 25. Internationalization (i18n)

- **Status:** Complete
- **Files:** `client/src/i18n/`
- **Entry point:** `TranslationProvider` in App.jsx
- **Description:** Two languages: English and German. Language-aware components via `useTranslation()` hook. Language persisted in localStorage. Weather descriptions bilingual (server-side).
- **Completeness evidence:** Two full translation files, provider pattern, localStorage persistence.
- **Dependencies:** None
- **Tests:** None

### 26. Demo Mode

- **Status:** Complete
- **Files:** `server/src/demo/demo-seed.js`, `server/src/demo/demo-reset.js`, `server/src/scheduler.js`
- **Entry point:** `DEMO_MODE=true` env var
- **Description:** Demo mode with pre-seeded admin + demo user. Demo user login without password. Hourly reset via cron restores demo user to baseline state. Upload blocking for demo user. Admin can save new baseline. Demo banner shown in UI. Demo credentials shown on login page.
- **Completeness evidence:** Seed, reset scheduler, upload blocking, baseline save, UI indicators.
- **Dependencies:** Auth, Scheduler
- **Tests:** None

### 27. PWA / Offline

- **Status:** Complete
- **Files:** `client/public/manifest.json`, `client/public/sw.js` (or Vite PWA plugin)
- **Entry point:** Automatic via browser
- **Description:** Progressive Web App with install support. Theme-color updates with dark mode.
- **Completeness evidence:** Manifest present, theme-color meta tag management in App.jsx.
- **Dependencies:** None
- **Tests:** None

### 28. Dark Mode

- **Status:** Complete
- **Files:** `client/src/App.jsx` (dark mode effect)
- **Entry point:** Settings page toggle
- **Description:** Three modes: auto (system preference), light, dark. Uses Tailwind `dark:` class on `<html>`. Syncs PWA theme-color meta tag. Supports legacy boolean values.
- **Completeness evidence:** Auto/light/dark toggle, system preference listener, theme-color sync.
- **Dependencies:** Settings
- **Tests:** None

### 29. PDF Export

- **Status:** Partial
- **Files:** `client/src/components/PDF/` (directory exists)
- **Entry point:** Unknown (PhotosPage removed, comment says "replaced by Finanzplan")
- **Description:** PDF export components exist in the component directory. The original PhotosPage was removed in favor of this. Exact scope unclear from routing (no dedicated route).
- **Completeness evidence:** Directory exists but no route in App.jsx; referenced by comment in import section.
- **Dependencies:** Trips
- **Tests:** None

### 30. Assignment Participants

- **Status:** Complete
- **Files:** `server/src/routes/assignments.js`, `assignment_participants` table
- **Entry point:** `/api/trips/:tripId/assignments/:id/participants`
- **Description:** Track which trip members are participating in each activity/assignment. Replace-all semantics (PUT with user_ids array). Empty array = everyone. Batch-loaded in day queries.
- **Completeness evidence:** Full CRUD, batch loading in day/assignment queries, WebSocket broadcast.
- **Dependencies:** Trips, Days, Assignments, Auth
- **Tests:** None

## Architecture Patterns

| Pattern | Where Used | Description |
|---------|-----------|-------------|
| REST API | All 22 route files | Standard RESTful endpoints with Express routers. Consistent CRUD patterns. |
| JWT Authentication | auth.js middleware | Bearer token auth, 24h expiry, middleware pattern for route protection |
| Role-Based Access | adminOnly middleware | Admin/user roles, first-registered-user becomes admin |
| Trip-Scoped Access | canAccessTrip() helper | Owner + member access check used across all trip-scoped routes |
| WebSocket Rooms | websocket.js | Trip-based rooms for real-time broadcast, sender exclusion via socket ID |
| Optimistic UI Updates | tripStore.js | Client applies changes immediately, rolls back on error. Temp IDs (negative) for pending creates. |
| Zustand State Management | 4 stores | Flat stores with async actions, no middleware. Direct state mutation via `set()`. |
| Proxy Pattern (DB) | database.js | JavaScript Proxy wraps SQLite connection for hot-swappable reinitialize (after restore). |
| Migration System | database.js | Sequential numbered migrations, schema_version table, ALTER TABLE additions. |
| Addon System | addons table, admin routes | Enable/disable features via DB flag, seeded defaults, admin UI toggle. |
| API Key Cascading | maps.js | User key -> admin key fallback for shared API keys. |
| Provider Fallback | maps.js | Google Places -> Nominatim/OSM fallback when no API key configured. |
| In-Memory Caching | weather.js, maps.js, vacay.js | Request-level caching with TTLs for external API calls (weather, photos, holidays). |
| Batch Loading | days.js, assignments.js | N+1 query optimization: batch-load tags, participants, notes for all entities in one query. |
| Cron Scheduling | scheduler.js | node-cron for auto-backups and demo resets with configurable intervals. |
| Component-Based UI | 57 components in 16 dirs | React functional components organized by feature domain. |

## Data Model

### Entities

| Entity | Source | Key Fields | Relationships |
|--------|--------|-----------|---------------|
| users | database.js | id, username, email, password_hash, role, avatar, oidc_sub/issuer, API keys | owns trips, settings, tags; member of trips |
| settings | database.js | user_id, key, value | belongs to user |
| app_settings | database.js | key, value | global singleton |
| trips | database.js | id, user_id, title, description, start/end_date, currency, cover_image, is_archived | has many days, places, members, files, reservations, budget_items, packing_items |
| days | database.js | id, trip_id, day_number, date, title, notes | has many assignments, notes, accommodations |
| places | database.js | id, trip_id, name, lat/lng, address, category_id, price, times, duration, image_url, google_place_id | belongs to trip, category; has many tags, assignments |
| categories | database.js | id, name, color, icon, user_id | has many places |
| tags | database.js | id, user_id, name, color | many-to-many with places via place_tags |
| place_tags | database.js | place_id, tag_id | junction table |
| day_assignments | database.js | id, day_id, place_id, order_index, notes, assignment_time/end_time, reservation fields | links place to day; has participants |
| assignment_participants | database.js | assignment_id, user_id | junction: who joins activity |
| packing_items | database.js | id, trip_id, name, checked, category, sort_order | belongs to trip |
| photos | database.js | id, trip_id, day_id, place_id, filename, caption | belongs to trip, optionally day/place |
| trip_files | database.js | id, trip_id, place_id, reservation_id, note_id, filename | belongs to trip, optionally place/reservation/note |
| reservations | database.js | id, trip_id, day_id, place_id, assignment_id, title, times, status, type, confirmation | belongs to trip, optionally day/place/assignment |
| day_notes | database.js | id, day_id, trip_id, text, time, icon, sort_order | belongs to day |
| day_accommodations | database.js | id, trip_id, place_id, start/end_day_id, check_in/out, confirmation | spans days, linked to place |
| budget_items | database.js | id, trip_id, category, name, total_price, persons, days, note, sort_order | has many members |
| budget_item_members | database.js | budget_item_id, user_id, paid | junction: per-person expense tracking |
| trip_members | database.js | trip_id, user_id, invited_by | junction: shared trip access |
| addons | database.js | id, name, description, type (trip/global), icon, enabled, config | global singleton set |
| collab_notes | database.js | id, trip_id, user_id, title, content, category, color, pinned, website | belongs to trip |
| collab_polls | database.js | id, trip_id, user_id, question, options (JSON), multiple, closed, deadline | has many votes |
| collab_poll_votes | database.js | poll_id, user_id, option_index | junction: poll voting |
| collab_messages | database.js | id, trip_id, user_id, text, reply_to, deleted | belongs to trip; has reactions |
| collab_message_reactions | database.js | message_id, user_id, emoji | junction: emoji reactions |
| vacay_plans | database.js | id, owner_id, block_weekends, holidays config, carry_over | has years, members, entries |
| vacay_plan_members | database.js | plan_id, user_id, status | junction: plan fusion |
| vacay_user_colors | database.js | user_id, plan_id, color | per-user calendar color |
| vacay_years | database.js | plan_id, year | available years |
| vacay_user_years | database.js | user_id, plan_id, year, vacation_days, carried_over | per-user-year config |
| vacay_entries | database.js | plan_id, user_id, date, note | individual vacation days |
| vacay_company_holidays | database.js | plan_id, date, note | company-wide holidays |

### Schema Location

All schemas defined in `server/src/db/database.js` as inline SQL in `initDb()`. 31 migrations in the migrations array (versions 1-31).

### Entity Relationships (Key)

```
users --< trips --< days --< day_assignments >-- places >-- categories
                       |         |                  |
                       |         +-- day_notes      +--< place_tags >-- tags
                       |         +-- assignment_participants >-- users
                       |
                       +--< places --< photos
                       +--< reservations
                       +--< packing_items
                       +--< budget_items --< budget_item_members >-- users
                       +--< trip_files
                       +--< trip_members >-- users
                       +--< day_accommodations
                       +--< collab_notes
                       +--< collab_polls --< collab_poll_votes
                       +--< collab_messages --< collab_message_reactions

users --< vacay_plans --< vacay_plan_members
                      +--< vacay_years
                      +--< vacay_user_years
                      +--< vacay_entries
                      +--< vacay_company_holidays
                      +--< vacay_user_colors
```

## Dependency Graph

### Core Features (used by many others)
1. **Authentication & Users** - Foundation for everything
2. **Trip Management** - Container for all trip-scoped features
3. **WebSocket Real-time Sync** - Used by 15+ features for live updates

### Mid-Tier Features (several dependencies)
4. **Place Management** - Required by Day Planner, Accommodations, Reservations
5. **Day Planner** - Required by Day Notes, Reservations, Accommodations
6. **Categories & Tags** - Used by Places
7. **Settings** - Used by UI preferences

### Peripheral Features (mostly standalone)
8. Budget Planner (depends on: Trips, Auth)
9. Packing List (depends on: Trips)
10. Document Management (depends on: Trips, Places, Reservations)
11. Photo Gallery (depends on: Trips)
12. Reservations (depends on: Trips, Days, Places)
13. Day Notes (depends on: Trips, Days)
14. Accommodations (depends on: Trips, Places, Days)
15. Collab: Notes/Polls/Chat (depends on: Trips, Auth, WebSocket)
16. Vacay Addon (depends on: Auth, WebSocket) - **standalone, not trip-scoped**
17. Atlas Addon (depends on: Trips, Places) - **read-only aggregation**
18. Weather (depends on: nothing, free API)
19. Map Integration (depends on: Auth for API keys)
20. Admin Panel (depends on: Auth)
21. Backup & Restore (depends on: Auth, Scheduler)
22. Demo Mode (depends on: Auth, Scheduler)

### Shared Database Tables
- `places` is shared between: Place Management, Day Planner, Accommodations, Reservations, Map Integration, Photo Gallery, Files, Atlas
- `users` is shared between: Auth, Trip Sharing, Assignment Participants, Budget Members, Collab, Vacay
- `trips` is shared between: nearly all features

## Tech Debt Indicators

### TODO/FIXME/HACK Comments

| # | Type | File:Line | Content |
|---|------|-----------|---------|
| - | - | - | **None found.** Zero TODO/FIXME/HACK comments in the entire codebase. |

### Other Indicators

| Indicator | Count | Examples |
|-----------|-------|---------|
| No tests | 0 test files | No test directory, no test runner configured in either package.json |
| No TypeScript | 0 .ts files | Both client (React/Vite) and server (Express) use plain JavaScript |
| No linter/formatter | 0 config files | No .eslintrc, .prettierrc, or similar |
| Inconsistent pattern: hardcoded German | 2 occurrences | Packing list default category "Allgemein" in `packing.js:41`; Weather descriptions have DE hardcoded |
| Migration numbering inconsistency | 1 | Migration comments show "28" used twice (lines 587 and 610 in database.js) |
| Commented-out code | 1 | `App.jsx:9` - "// PhotosPage removed - replaced by Finanzplan" |
| Large inline SQL schema | 1 | `database.js` has 600+ lines of inline schema + migrations in one function |
| Missing foreign key validation | ~5 routes | Some routes don't validate FK existence before INSERT (e.g., tag IDs in place creation) |
| No input sanitization library | global | Relies on parameterized SQL only; no explicit XSS sanitization for text content |
| Raw SQL (no ORM) | 22 route files | All database access via raw SQL strings with better-sqlite3 |
| Hardcoded country data | 2 files | atlas.js bounding boxes (60+ countries), auth.js KNOWN_COUNTRIES set (~130 names) |
| No pagination | Most list endpoints | Places, budget items, packing items, etc. return all records (only chat has cursor pagination) |
| Path traversal partial | 1 | backup.js validates filename format but files.js relies on UUID filenames |
| Demo mode checks scattered | ~6 files | `DEMO_MODE === 'true'` checks scattered across auth.js, scheduler.js, admin.js, middleware |

## Complexity Assessment

- **Total features:** 30
- **Complete features:** 29 (97%)
- **Partial features:** 1 (PDF Export - components exist but not routed)
- **Architecture consistency:** High - consistent patterns across all routes (verify ownership, CRUD, broadcast), consistent Zustand store pattern
- **Test coverage quality:** None - zero automated tests of any kind
- **Tech debt severity:** Low-Medium
  - Low: Clean code, consistent patterns, no TODO/FIXME comments, good error handling
  - Medium: No tests, no TypeScript, no linting, large monolithic schema file, no pagination on most endpoints
  - The codebase is remarkably clean for 110 commits in 9 days by a solo developer
- **External API dependencies:** Google Places API (optional), Open-Meteo (free), Nager.Date holidays (free), Nominatim/OSM (free), Unsplash (optional)
- **Deployment:** Docker multi-stage build, self-updating via git pull
