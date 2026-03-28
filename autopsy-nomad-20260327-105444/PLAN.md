# PLAN: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD

---

_This plan is reconstructed from aspiration signals (stubs, vestigial code,
evolution trajectory) and the gap between reconstructed intent and current
implementation. It represents what the project was likely heading toward
and what a maintainer should prioritize._

## Current State

NOMAD is a feature-rich, self-hosted travel planner at version 2.6.0 with 29 of 30 features complete. The application is deployed to Docker Hub and has a live demo instance. Development velocity was extraordinary (110 commits in 9 days) but has paused since March 26, 2026. The codebase is consistent and clean but carries zero automated tests, no TypeScript, no linting, and no CI quality gates.

**What's complete:** Core trip planning, collaborative editing, maps, weather, budgets, packing, reservations, files, photos, admin, backup/restore, WebSocket sync, i18n, PWA, dark mode, demo mode, addon system (Vacay, Atlas, Collab).

**What's partial:** PDF Export (component exists, cross-browser rendering issues unresolved).

**What's missing:** Tests, TypeScript, linting, API documentation, pagination on most endpoints, proper CI pipeline.

## Likely Next Steps (Reconstructed)

| # | Step | Evidence | Priority (inferred) | Complexity |
|---|------|---------|-------------------|-----------|
| 1 | Fix PDF Export cross-browser rendering | 6 failed attempts (v2.2.1-v2.2.5), @react-pdf/renderer still in deps, fonts in Dockerfile | High | Complex |
| 2 | Add pagination to list endpoints | Only chat has cursor pagination; places, budget, packing return all records | High | Moderate |
| 3 | Surface Unsplash image search in UI | Backend fully coded, DB field exists, no UI trigger | Medium | Simple |
| 4 | Expand i18n beyond EN/DE | Only 2 languages; i18n infrastructure supports more | Medium | Moderate |
| 5 | Add more dashboard widgets | Currency converter + timezone clock exist; pattern supports expansion | Low | Simple |
| 6 | Complete tag system utilization in UI | Tags CRUD exists but underutilized compared to categories | Medium | Simple |
| 7 | Re-add PhotosPage or integrate into trip view | Backend photo API still active, page was removed for budget | Low | Moderate |
| 8 | Community growth (contributors, adoption) | Issue templates, demo, FUNDING.yml exist but 0 external contributors | Medium | N/A |

## Recommended Priorities

### Critical (do first)

1. **Add automated tests** — Zero tests on a 30-feature app is the single biggest risk. Start with server route tests (22 routes, REST patterns are consistent and testable). A single data corruption bug in the SQLite layer could destroy all user data with no safety net.

2. **Add pagination to all list endpoints** — Places, budget items, packing items, photos, files, reservations, collab notes all return unbounded result sets. A trip with 500+ places or a chat with 10K messages will cause performance degradation.

3. **Fix migration numbering** — Migration version "28" appears twice in database.js. This could cause silent schema inconsistencies on fresh installs vs upgrades.

### Important (do soon)

4. **Add ESLint + Prettier** — No code quality tooling exists. As the codebase grows or contributors join, style drift and subtle bugs will accumulate.

5. **Split tripStore.js** — At 863 lines managing 10+ sub-domains, this store is a monolith. Extract domain-specific stores (budget, packing, collab, reservations) for maintainability.

6. **Extract database.js** — 755 lines with all schema + migrations + helpers inline. Split into separate migration files and a schema definition file.

7. **Fix PDF Export** — The developer clearly wants this feature (6 fix attempts, dependency kept, fonts deployed). Consider switching from iframe-based rendering to direct download approach.

8. **Add CI quality gates** — The GitHub Actions pipeline only builds Docker images. Add lint, type-check (JSDoc or TypeScript migration), and test steps.

### Nice to Have (when time permits)

9. **TypeScript migration** — Would catch entire classes of bugs at compile time. Start with server (simpler, CommonJS) then client.

10. **API documentation** — No OpenAPI spec or API docs exist. The REST API is well-structured and consistent, making auto-documentation feasible.

11. **Surface Unsplash integration** — Backend is complete, just needs UI trigger in place creation/editing.

12. **Add more languages** — i18n infrastructure is solid; community translations could be accepted via PR.

13. **Admin self-update for Docker** — Current self-update uses `git pull` which only works for non-Docker installs. Docker users need a different update mechanism (watchtower integration or version-aware pull).

## Technical Debt to Address

| # | Item | Severity | Files Affected | Recommendation |
|---|------|----------|---------------|---------------|
| 1 | Zero test coverage | Critical | All 110+ source files | Add Jest (server) + Vitest (client), start with route tests |
| 2 | No TypeScript | Major | All .js/.jsx files | Consider gradual migration starting with shared types |
| 3 | No linter/formatter | Major | All source files | Add ESLint + Prettier with auto-fix |
| 4 | tripStore.js monolith (863 lines) | Major | `client/src/store/tripStore.js` | Split into domain-specific stores |
| 5 | database.js monolith (755 lines) | Major | `server/src/db/database.js` | Extract migrations, split schema |
| 6 | Migration numbering error (v28 duplicated) | Major | `server/src/db/database.js:587,610` | Fix numbering, add migration tests |
| 7 | No pagination on most endpoints | Major | 15+ route files | Add cursor or offset pagination |
| 8 | Hardcoded German defaults | Minor | `packing.js:41` ("Allgemein") | Use i18n keys for server-generated defaults |
| 9 | Vestigial Unsplash code | Minor | `places.js`, `database.js` | Either surface in UI or remove dead code |
| 10 | Vestigial routeInfo state | Minor | `TripPlannerPage.jsx:111` | Remove unused state variable |
| 11 | Demo mode checks scattered | Minor | ~6 files | Centralize into middleware or config helper |
| 12 | Raw SQL without query builder | Minor | 22 route files | Consider knex.js or drizzle for type-safe queries |

## Missing Infrastructure

| # | Missing | Impact | Recommendation |
|---|---------|--------|---------------|
| 1 | Automated tests | Data corruption, regression bugs undetected | Jest (server) + Vitest (client), aim for route-level coverage first |
| 2 | CI quality gates | Broken code can reach production | Add lint + test steps to GitHub Actions workflow |
| 3 | API documentation | Contributors can't understand endpoints | Generate OpenAPI spec from routes or add JSDoc |
| 4 | Error monitoring | Production errors invisible | Add Sentry or similar (self-hosted compatible) |
| 5 | Database migrations tooling | Inline migrations are fragile | Extract to numbered files, add migration CLI |
| 6 | Rate limiting (beyond login) | API abuse possible | Add express-rate-limit to sensitive endpoints |
| 7 | Input validation library | Relies on parameterized SQL only | Add zod or joi for request validation |
| 8 | Changelog / release notes | Users don't know what changed | Auto-generate from conventional commits |
