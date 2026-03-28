# GOALS: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD

---

## Goal Inventory

| # | Goal | Source | Status | Confidence | Evidence |
|---|------|--------|--------|-----------|----------|
| 1 | Comprehensive self-hosted travel planner | Explicit (README) | Achieved | 95% | 30 features, Docker deployment, "self-hosted" in tagline |
| 2 | Real-time collaborative editing | Explicit (README) | Achieved | 95% | WebSocket rooms, optimistic UI, sender exclusion |
| 3 | Native app experience (PWA) | Implicit (deps, config) | Achieved | 90% | PWA manifest, Workbox, icon generation, fullscreen mode |
| 4 | Zero-config deployment | Implicit (config patterns) | Achieved | 90% | Auto JWT, SQLite, free APIs, 3 env vars, single Docker run |
| 5 | Modular addon system | Explicit (README) | Achieved | 85% | 6 addons, admin toggles, addon table, clean route separation |
| 6 | Multi-user group collaboration | Explicit (README) | Achieved | 85% | Trip sharing, Collab (chat/notes/polls), budget splits, Vacay fusion |
| 7 | Data sovereignty / privacy | Explicit (README) | Achieved | 90% | "Your data stays yours", AGPL, self-hosted, no telemetry |
| 8 | German + English i18n | Implicit (translation files) | Achieved | 85% | ~1016 translation keys, EN/DE, bilingual weather |
| 9 | Full trip PDF export | Implicit (deps, components) | Partial | 75% | @react-pdf/renderer installed, TripPDF component, fonts in Docker, but 6 failed fix attempts |
| 10 | Open-source community adoption | Explicit (README, demo, funding) | Partial | 80% | Live demo, issue templates, FUNDING.yml, AGPL — but 0 external contributors |
| 11 | Travel statistics / gamification | Implicit (Atlas addon) | Achieved | 70% | Visited countries, streaks, continent breakdown, stats dashboard |
| 12 | Sustainable hobby funding | Explicit (FUNDING.yml) | Not Started | 65% | Ko-fi + Buy Me a Coffee links, but no visible patron count |
| 13 | Unsplash image search for places | Aspirational (code exists) | Abandoned | 60% | Backend code exists, DB field exists, no UI trigger |
| 14 | Photo gallery as standalone page | Aspirational (removed) | Abandoned | 70% | PhotosPage removed, replaced by budget ("Finanzplan") |

## Goal Details

### 1. Comprehensive self-hosted travel planner

- **Source:** Explicit (README tagline, feature list, login page)
- **Status:** Achieved
- **Confidence:** 95%
- **Evidence for goal existence:** README subtitle: "A self-hosted, real-time collaborative travel planner with interactive maps, budgets, packing lists, and more"
- **Evidence for status:** 30 features covering planning, budgets, packing, reservations, weather, maps, documents, photos, collaboration, admin, backup
- **Files involved:** Entire codebase

### 2. Real-time collaborative editing

- **Source:** Explicit (README, login page description)
- **Status:** Achieved
- **Confidence:** 95%
- **Evidence for goal existence:** "real-time collaborative" in tagline; "real-time sync" in login description
- **Evidence for status:** WebSocket room-based broadcast per trip, heartbeat, JWT auth, optimistic UI with rollback, sender exclusion via socket ID
- **Files involved:** `server/src/websocket.js`, `client/src/api/websocket.js`, all route files (broadcast calls)

### 3. Native app experience (PWA)

- **Source:** Implicit (dependencies, configuration)
- **Status:** Achieved
- **Confidence:** 90%
- **Evidence for goal existence:** `vite-plugin-pwa` dependency, `sharp` for icon generation, `prebuild` script
- **Evidence for status:** PWA manifest, service worker caching, theme-color sync with dark mode, standalone display mode
- **Files involved:** `client/vite.config.js`, `client/scripts/generate-icons.mjs`, `client/src/App.jsx`

### 4. Zero-config deployment

- **Source:** Implicit (configuration patterns)
- **Status:** Achieved
- **Confidence:** 90%
- **Evidence for goal existence:** Auto-generated JWT secret persisted to disk, free APIs as defaults, SQLite embedded DB
- **Evidence for status:** Only 3 env vars in .env.example (PORT, JWT_SECRET, NODE_ENV), single `docker run` command in README
- **Files involved:** `server/src/config.js`, `server/.env.example`, `docker-compose.yml`

### 5. Modular addon system

- **Source:** Explicit (README "modular, admin-toggleable")
- **Status:** Achieved
- **Confidence:** 85%
- **Evidence for goal existence:** README addons section, addon table in DB
- **Evidence for status:** 6 addons (packing, budget, documents, vacay, atlas, collab), admin panel toggles, clean route separation
- **Files involved:** `server/src/db/database.js` (addons table), `server/src/routes/admin.js`

### 6. Multi-user group collaboration

- **Source:** Explicit (README, login page)
- **Status:** Achieved
- **Confidence:** 85%
- **Evidence for goal existence:** "collaboratively" in login description, trip sharing, Collab addon
- **Evidence for status:** Trip member invites, Collab chat/notes/polls, budget per-person splitting, Vacay fusion, assignment participants
- **Files involved:** `server/src/routes/trips.js`, `server/src/routes/collab.js`, `client/src/components/Collab/`

### 7. Data sovereignty / privacy

- **Source:** Explicit (README, login page)
- **Status:** Achieved
- **Confidence:** 90%
- **Evidence for goal existence:** "Your data stays yours" on login, "Self-hosted" as lead descriptor
- **Evidence for status:** AGPL license, no telemetry, no external service dependencies for core features, self-hosted deployment
- **Files involved:** `LICENSE`, `README.md`, `client/src/i18n/translations/en.js`

### 8. German + English i18n

- **Source:** Implicit (translation files, bilingual weather)
- **Status:** Achieved
- **Confidence:** 85%
- **Evidence for goal existence:** Two translation files, TranslationProvider, language switcher
- **Evidence for status:** ~1016 translation keys in EN and DE, bilingual weather descriptions
- **Files involved:** `client/src/i18n/`

### 9. Full trip PDF export

- **Source:** Implicit (dependency, components, Dockerfile font copy)
- **Status:** Partial
- **Confidence:** 75%
- **Evidence for goal existence:** `@react-pdf/renderer` dependency, `TripPDF.jsx` component, Dockerfile copies fonts for PDF
- **Evidence for status:** 6 fix attempts (v2.2.1-v2.2.5) for X-Frame-Options/blob URL issues, never stable cross-browser
- **Files involved:** `client/src/components/PDF/`, `Dockerfile`

### 10. Open-source community adoption

- **Source:** Explicit (README, demo, issue templates, FUNDING.yml)
- **Status:** Partial
- **Confidence:** 80%
- **Evidence for goal existence:** Live demo instance, issue templates, SECURITY.md, AGPL license, FUNDING.yml
- **Evidence for status:** Professional community infrastructure in place, but 0 external contributors, 110 commits by single developer
- **Files involved:** `.github/`, `README.md`, `SECURITY.md`

### 11. Travel statistics / gamification

- **Source:** Implicit (Atlas addon)
- **Status:** Achieved
- **Confidence:** 70%
- **Evidence for goal existence:** Atlas addon with world map, stats dashboard
- **Evidence for status:** Visited countries detection, streak tracking, continent breakdown, per-country detail view
- **Files involved:** `server/src/routes/atlas.js`, `client/src/pages/AtlasPage.jsx`

### 12. Sustainable hobby funding

- **Source:** Explicit (FUNDING.yml)
- **Status:** Not Started
- **Confidence:** 65%
- **Evidence for goal existence:** Ko-fi and Buy Me a Coffee links in FUNDING.yml
- **Evidence for status:** Funding infrastructure exists but no evidence of patrons
- **Files involved:** `.github/FUNDING.yml`

### 13. Unsplash image search

- **Source:** Aspirational (backend code)
- **Status:** Abandoned
- **Confidence:** 60%
- **Evidence for goal existence:** `unsplash_api_key` DB column, search endpoint in places.js
- **Evidence for status:** No UI trigger, not in admin settings, likely superseded by Google Places photos
- **Files involved:** `server/src/routes/places.js`, `server/src/db/database.js`

### 14. Photo gallery standalone page

- **Source:** Aspirational (removed)
- **Status:** Abandoned
- **Confidence:** 70%
- **Evidence for goal existence:** `App.jsx` comment: "PhotosPage removed - replaced by Finanzplan"
- **Evidence for status:** Page component removed from routing, backend photo API still functional
- **Files involved:** `client/src/App.jsx`, `server/src/routes/photos.js`

## Achievement Summary

| Status | Count |
|--------|-------|
| Achieved | 9 |
| Partial | 2 |
| Not Started | 1 |
| Abandoned | 2 |
