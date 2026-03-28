# VISION: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Confidence:** High (95%)
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD

---

_This vision document was reconstructed from code analysis, git history,
and intent signals. It represents what the project appears to have been
trying to achieve, not a statement from the original developers._

## Purpose

NOMAD exists to replace the fragmented toolchain that travel groups cobble together from Google Sheets, WhatsApp groups, TripIt, shared documents, and budget spreadsheets. It consolidates trip planning, budgeting, reservations, packing, weather forecasting, maps, document management, photo sharing, and group collaboration into a single, self-hosted, privacy-respecting application that runs from a single Docker container.

## Core Thesis

Travel planning is inherently collaborative and multi-dimensional — it spans logistics, budgets, maps, weather, documents, and group decisions. Existing tools force users to scatter this information across many platforms with no real-time synchronization. NOMAD's thesis is that a single, integrated platform with real-time collaboration, zero-config deployment, and full data sovereignty can deliver a better experience than any combination of commercial tools — while keeping all data under the user's control.

## Target Audience

Small travel groups (2-8 people) — friends, couples, families — who plan trips together and value data ownership. The secondary audience is the self-hosting community (r/selfhosted) who look for Docker-deployable, open-source alternatives to commercial SaaS. The tertiary audience is solo travelers who want an organized, all-in-one planning tool without relying on cloud services.

## Key Capabilities

1. **Collaborative trip planning with real-time sync** — achieved. WebSocket rooms per trip, optimistic UI, multi-user editing.
2. **Zero-config self-hosted deployment** — achieved. Single Docker container, auto-generated JWT secret, SQLite (no DB server), free APIs (Open-Meteo, Nominatim).
3. **Comprehensive trip management** — achieved. 30 features covering planning, budgeting, packing, reservations, weather, maps, photos, documents, and collaboration.
4. **Modular addon architecture** — achieved. Admin-toggleable addons (Vacay, Atlas, Collab) with clean separation.
5. **Native app experience without app stores** — achieved. PWA with offline support, dark mode, touch-optimized layouts.

## Principles

1. **"Your data stays yours"** — Self-hosted by design, AGPL license prevents closed-source forks, no telemetry, no external dependencies for core functionality.
2. **Zero-config philosophy** — Auto-generated secrets, embedded SQLite, free API defaults. Three env vars to configure, single Docker command to run.
3. **Ship complete features** — Zero TODO/FIXME comments in the entire codebase. Features are built to completion before being committed.
4. **Pragmatic over perfect** — No tests, no TypeScript, no linter — but consistent patterns, clean module structure, and production-aware infrastructure (graceful shutdown, health checks, auto-backups).
5. **Docker-first deployment** — CI pushes to Docker Hub, docker-compose for production, health checks, volume mounts for persistence.

## Boundaries

- **Not an enterprise product** — No multi-tenant isolation, no audit logging, no SSO beyond basic OIDC, no paid tiers.
- **Not a mobile-native app** — PWA only; no iOS/Android app store presence.
- **Not API-first** — No documented public API, no versioned API contracts, no OpenAPI spec. The REST API exists to serve the React frontend.
- **Not a platform** — No plugin marketplace, no third-party integrations beyond maps/weather, no webhooks.

---

**Evidence basis:** PROJECT_MAP.md, FEATURE_REPORT.md, EVOLUTION_REPORT.md, INTENT_REPORT.md
