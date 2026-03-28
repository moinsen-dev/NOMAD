# EVOLUTION_REPORT: NOMAD

**Date:** 2026-03-27
**Produced by:** History-Analyst Agent
**Based on:** PROJECT_MAP.md + FEATURE_REPORT.md

---

## Project Timeline

### Overview

- **First commit:** 2026-03-18 23:53 by Maurice (GitHub initial commit), followed by full codebase upload at 23:58
- **Last commit:** 2026-03-26 22:36 by Maurice
- **Total commits:** 110
- **Active development span:** 9 days (Mar 18 - Mar 26, 2026)
- **Contributors:** 1 (Maurice / mauriceboe) — 100 commits as "Maurice", 10 as "mauriceboe" (same person, different git configs)
- **Initial codebase size:** ~25,545 lines added in the first commit (arrived as a complete, working application)

### Timeline Phases

| Phase | Date Range | Commits | Focus | Key Events |
|-------|-----------|---------|-------|-------------|
| **Phase 0: Pre-history** | Before Mar 18 | 0 | Private development | App was developed locally before being published to GitHub. The initial commit contained a fully working app with 90+ files. |
| **Phase 1: Launch & Deployment** | Mar 18-19 (Day 1-2) | 42 | Docker, README, demo, license, WebSocket | Initial commit, Docker Hub setup, AGPL license switch, demo mode, v2.1.0 (WebSocket), CI workflow, PDF fixes, demo polish, v2.2.x-v2.3.x |
| **Phase 2: Auth & Stability** | Mar 19-20 (Day 2-3) | 6 | OIDC, OSM search, account mgmt | v2.4.0 (OIDC login), demo user protections, v2.5.0 (Addon System, Vacay, Atlas) |
| **Phase 3: Addon Expansion** | Mar 20-22 (Day 3-5) | 20 | Addon system, Vacay, Atlas, PWA, better-sqlite3 | v2.5.0-v2.5.2, PWA safe-area battles (7 commits), better-sqlite3 migration, demo overhaul |
| **Phase 4: Feature Deepening** | Mar 23-24 (Day 6-7) | 25 | Weather, reservations, day detail, i18n | Vacay drag-to-paint, v2.5.3-v2.5.7, Open-Meteo weather, reservation rebuild, DayDetailPanel, 200+ i18n strings |
| **Phase 5: Polish & Collab** | Mar 25-26 (Day 8-9) | 15 | Collab overhaul, budget, route times, bug fixes | v2.6.0 (Collab redesign), per-person budgets, route travel times, funding setup |

## Feature Evolution

| Feature | First Added | Last Modified | Commits | Status Trajectory |
|---------|------------|---------------|---------|-------------------|
| Core Trip CRUD | Mar 18 (initial) | Mar 26 | 15+ | Stable from day 1, incrementally refined |
| Place Management | Mar 18 (initial) | Mar 26 | 20+ | Major expansion: duplicate assignments, start/end times, inline editing |
| Day Planner / Drag-Drop | Mar 18 (initial) | Mar 26 | 15+ | Continuous fixes; DayDetailPanel added Mar 24 |
| Map (Google + OSM) | Mar 18 (initial) | Mar 26 | 9 | Added OSM fallback (v2.4.0), smart zoom (v2.5.4), route travel times (v2.6.0) |
| Weather | Mar 18 (initial) | Mar 24 | 3 | Pivoted from OpenWeatherMap to Open-Meteo (v2.5.6) |
| Budget Planner | Mar 18 (initial) | Mar 25 | 5 | Added per-person expense tracking (Mar 25) |
| Packing List | Mar 18 (initial) | Mar 24 | 3 | Mostly stable, translated to i18n |
| Documents/Files | Mar 18 (initial) | Mar 25 | 5 | Added paste support, collab note file badges |
| Photo Gallery | Mar 18 (initial) | Mar 24 | 3 | Minor i18n updates |
| Reservations | Mar 18 (initial) | Mar 26 | 8 | **Complete rebuild** in v2.5.7 (breaking change) |
| PDF Export | Mar 18 (initial) | Mar 22 | 7 | Struggled with X-Frame-Options, srcdoc, blob URLs. Never fully stable. **Partial.** |
| WebSocket / Real-time | Mar 19 (v2.1.0) | Mar 24 | 4 | Added in v2.1.0, socket-ID fix in v2.5.6 |
| Demo Mode | Mar 19 | Mar 22 | 4 | Rapid iteration: banner -> popup -> baseline reset -> content overhaul |
| OIDC / SSO | Mar 19 (v2.4.0) | Mar 21 | 2 | Added complete, minor security hardening |
| Addon System | Mar 20 (v2.5.0) | Mar 25 | 3 | Architecture added in v2.5.0, Collab enabled by default in v2.6.0 |
| Vacay (Calendar) | Mar 20 (v2.5.0) | Mar 24 | 3 | Drag-to-paint added Mar 23, WebSocket fix Mar 24 |
| Atlas (World Map) | Mar 20 (v2.5.0) | Mar 24 | 5 | Label fixes, PWA safe-area, mobile adjustments |
| Dashboard Widgets | Mar 20 (v2.5.0) | Mar 25 | 3 | Currency, timezone, What's Next widget added in v2.6.0 |
| PWA | Mar 21 | Mar 22 | 8 | Added then 7 safe-area fix commits in rapid succession |
| Admin Self-Update | Mar 23 (v2.5.3) | Mar 24 | 2 | GitHub release panel added in v2.5.6 |
| Collab (Chat/Notes/Polls) | Mar 25 (v2.6.0) | Mar 25 | 2 | Complete redesign in v2.6.0; iMessage-style chat, emoji reactions |
| Route Travel Times | Mar 25 (v2.6.0) | Mar 26 | 2 | New in v2.6.0 via OSRM |
| Dark Mode | Mar 18 (initial) | Mar 24 | 5+ | Auto dark mode added v2.5.7, ongoing fixes |
| i18n (EN/DE) | Mar 18 (initial) | Mar 25 | 10+ | Major expansion in v2.5.7 (200+ strings), ongoing |
| Day Notes | Mar 18 (initial) | Mar 24 | 4 | Char limit, textarea, i18n |
| Accommodations | Mar 24 (v2.5.7) | Mar 24 | 1 | Added as part of DayDetailPanel |
| Categories & Tags | Mar 18 (initial) | Mar 24 | 2 | Seeds changed to English, minor updates |
| Backup & Restore | Mar 18 (initial) | Mar 21 | 3 | Fix + restore warning modal |
| Assignment Participants | Mar 24 | Mar 26 | 5 | Times, avatars, budget member chips |

## Direction Changes

| # | When | What Changed | Evidence |
|---|------|-------------|----------|
| 1 | Mar 19 (Day 2) | **License pivot: MIT -> AGPL-3.0** | `f8dcce8` — 661 lines added, 21 deleted. Likely motivated by launching the demo and wanting copyleft protection. |
| 2 | Mar 19 (Day 2) | **Docker Hub deployment becomes primary** | 10 commits on Mar 19 about Docker deployment, README, CORS, JWT_SECRET. Shifted from "run locally" to "Docker-first." |
| 3 | Mar 19 (Day 2) | **Demo mode introduced** | `e8acbbd` — 558 lines added. Created demo infrastructure (seed, reset, banner). Indicates intent to publicly showcase the app. |
| 4 | Mar 22 (Day 5) | **Database engine swap: node:sqlite -> better-sqlite3** | `d604ad1` — Replaced experimental Node.js built-in sqlite with stable better-sqlite3. Added versioned migrations replacing try/catch pattern. |
| 5 | Mar 24 (Day 7) | **Weather API pivot: OpenWeatherMap -> Open-Meteo** | `e4607e4` — Removed API key requirement for weather. Gained 16-day forecast (up from 5). Removed setup instructions entirely. |
| 6 | Mar 24 (Day 7) | **Reservation system complete rebuild** | `0497032` — Breaking change: reservations link to day assignments instead of places. Old data incompatible. |
| 7 | Mar 20 (Day 3) | **Addon architecture introduced** | `384d583` — v2.5.0 was "the biggest NOMAD update yet." Modular addon system for Vacay, Atlas, and trip features. |
| 8 | Mar 19 (Day 2) | **Demo deployment separated** | `f856956` — Removed demo/ folder, moved to separate nomad-demo repo. |

## Abandoned Features

| Feature | Last Active | Evidence of Abandonment |
|---------|------------|------------------------|
| PDF Export | Mar 22 (v2.5.2) | 6 fix attempts across v2.2.1-v2.2.5 for X-Frame-Options, blob URLs, srcdoc issues. Last touched Mar 22 in branding update. Still present in codebase but never achieved reliable cross-browser functionality. Code-Analyst confirms: partial status. |
| OpenWeatherMap Integration | Mar 24 (replaced) | Completely replaced by Open-Meteo in v2.5.6. API key input removed from admin panel. Not abandoned per se, but pivoted away. |
| Demo Deployment Folder | Mar 19 (deleted) | `demo/.env.example` and `demo/docker-compose.yml` deleted in `f856956`. Moved to external repo. |

## Velocity Trends

### Daily Commit Count

| Date | Commits | Notable |
|------|---------|---------|
| Mar 18 (Tue) | 3 | Project birth. Initial commit + .gitignore merge. |
| Mar 19 (Wed) | 39 | **Peak day.** Docker setup, v2.1.0 (WebSocket), demo mode, AGPL license, CI, PDF fixes, OIDC (v2.4.0). Extraordinary output. |
| Mar 20 (Thu) | 6 | v2.5.0 (Addon System, Vacay, Atlas). Largest single commit (3,841 lines). |
| Mar 21 (Fri) | 14 | PWA (8 safe-area fix commits), security hardening, drag/drop fixes. |
| Mar 22 (Sat) | 8 | better-sqlite3 migration, demo content overhaul, branding, PWA fixes. |
| Mar 23 (Sun) | 8 | v2.5.3-v2.5.5, Vacay drag-to-paint, live exchange rates, Docker README. |
| Mar 24 (Mon) | 17 | v2.5.6-v2.5.7 (Open-Meteo, reservation rebuild, DayDetailPanel). 13 bug fixes. |
| Mar 25 (Tue) | 6 | v2.6.0 (Collab overhaul), per-person budgets, participant avatars. |
| Mar 26 (Wed) | 9 | Bug fixes, README updates, funding setup. Last day of activity. |

### Velocity Assessment

- **Average:** 12.2 commits/day over 9 days
- **Peak:** 39 commits on Day 2 (Mar 19) — an unsustainable sprint
- **Pattern:** Massive burst on Day 2, then settling into 6-17 commits/day
- **Total lines:** ~52,891 added (including lock files)
- **Working hours:** Predominantly evening/night (56 of 110 commits between 20:00-03:00). Afternoon sessions (13:00-17:00) account for 28 commits. This is a side-project/hobby-hours pattern.

## Contributor Patterns

| Contributor | Commits | Active Period | Focus Areas |
|-------------|---------|--------------|-------------|
| Maurice | 100 | Mar 18 - Mar 26 | All development — full-stack, UI, infrastructure, docs |
| mauriceboe | 10 | Mar 19 - Mar 26 | Same person, different git config (README, issue templates, funding) |

**Total:** 1 developer, 110 commits, 9 days. All work by a single individual.

## Branch Analysis

| Branch | Status | Last Commit | Purpose (inferred) |
|--------|--------|------------|-------------------|
| main | Active | Mar 26 | Only branch. All development happens directly on main. No feature branches, no PRs, no code review. |

**No other branches exist**, local or remote. The developer commits directly to main with no branching strategy. This is consistent with a solo developer shipping rapidly.

## Evolution Summary

NOMAD's public git history tells the story of a **mature private project that went public and evolved rapidly over 9 days**. The initial commit on March 18, 2026 was not a blank slate — it delivered a complete, working travel planner with 25,545 lines of code across 90+ files, including authentication, trip management, a day planner with drag-and-drop, map integration, budget tracking, packing lists, photo gallery, file management, and PDF export. This was not an MVP; it was a feature-complete application that had clearly been developed privately before its GitHub debut.

**Day 2 (March 19) was pivotal** — 39 commits in a single day established the project's public identity. Maurice added Docker Hub deployment, switched from MIT to AGPL-3.0 licensing, implemented WebSocket-based real-time collaboration (v2.1.0), created a demo mode with hourly reset, set up GitHub Actions CI, and shipped OIDC/SSO support (v2.4.0). The license change and demo mode together signal a clear intent: this was being positioned as an open-source product for self-hosters, not just a personal tool.

**Days 3-5 saw architectural expansion.** The addon system (v2.5.0) was the biggest single commit — 3,841 lines adding modular architecture plus two global addons (Vacay calendar and Atlas world map). The database engine was swapped from experimental node:sqlite to battle-tested better-sqlite3, showing a maturation of infrastructure choices. PWA support was added but triggered a frustrating cycle of 7 safe-area fix commits, revealing the challenges of iOS PWA development.

**Days 6-9 focused on deepening and polishing.** The weather system pivoted from OpenWeatherMap (API key required) to Open-Meteo (free, no key), the reservation system was completely rebuilt with a breaking schema change, and the Collab feature got a full redesign with iMessage-style chat, emoji reactions, and rich note cards. The final commits added per-person budget tracking, route travel times via OSRM, and Buy Me a Coffee sponsorship links.

Throughout its evolution, NOMAD shows a developer who ships features at extraordinary velocity but carries significant technical debt: no tests, no TypeScript, no feature branches, no code review, no linter. The commit pattern (56% between 8pm-3am) confirms this is passion-driven side-project work. The project advanced from v2.1.0 to v2.6.0 in 8 days — a version cadence that reflects "ship it when it's done" rather than scheduled releases. The one genuinely abandoned feature is PDF export, which received 6 fix attempts across versions v2.2.1-v2.2.5 without achieving stable cross-browser functionality.
