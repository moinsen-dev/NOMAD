# GAPS: NOMAD

**Reconstructed by:** autopsy multi-agent analysis
**Date:** 2026-03-27
**Source repo:** /Users/udi/work/moinsen/opensource/NOMAD
**Critical gaps:** 3
**Major gaps:** 8
**Minor gaps:** 7

---

_This document compares reconstructed intent against actual implementation
across four dimensions: Features, Quality, Architecture, and Completion.
Each gap includes severity, evidence, and a recommendation._

## Executive Summary

NOMAD achieves its primary goal remarkably well — it is a comprehensive, self-hosted, real-time collaborative travel planner with 29 of 30 features complete. The biggest blind spot is **developer infrastructure**: zero tests, no TypeScript, no linting, and no CI quality gates on a production-deployed application with 31+ database tables and real user data at stake. The project is closest to its intent in feature breadth and deployment simplicity. The single highest-impact change would be adding automated tests for the 22 server route files, which follow consistent patterns and are highly testable.

## Feature Gaps

| # | Intent (reconstructed) | Reality (in code) | Gap | Severity | Evidence | Recommendation |
|---|----------------------|-------------------|-----|----------|----------|----------------|
| F1 | Full trip PDF export for offline use | Component exists, 6 fix attempts failed, cross-browser rendering broken | PDF export is partially functional at best | Major | `client/src/components/PDF/`, Dockerfile copies fonts, @react-pdf/renderer in deps, EVOLUTION_REPORT: 6 fix attempts v2.2.1-v2.2.5 | Switch to server-side PDF generation (puppeteer/playwright) or direct download instead of iframe rendering |
| F2 | Unsplash image search for places | Backend fully implemented, DB field exists, zero UI integration | Feature is invisible to users | Minor | `places.js:150-191` Unsplash search code, `unsplash_api_key` column in users table, no UI trigger in any component | Either add search button in place edit UI or remove vestigial code |
| F3 | Photo gallery as standalone page | PhotosPage removed, replaced by budget ("Finanzplan") | Photos only accessible as place/day attachments, no dedicated gallery view | Minor | `App.jsx:9`: "PhotosPage removed - replaced by Finanzplan", `photos.js` backend fully functional | Decide: re-add PhotosPage or integrate photo gallery into trip detail view |
| F4 | Pagination on all list endpoints | Only chat messages have cursor-based pagination | All other list endpoints return unbounded results | Major | `collab.js` has `before` cursor param; `places.js`, `budget.js`, `packing.js`, `photos.js`, `files.js` have no pagination | Add cursor or offset pagination to all list endpoints |
| F5 | Multi-language support beyond EN/DE | Only English and German translations exist | Two languages limits adoption in non-EN/DE markets | Minor | `client/src/i18n/translations/` contains only `en.js` and `de.js` | Add community contribution guide for translations, consider i18n platform (Weblate) |

## Quality Gaps

| # | Intent (reconstructed) | Reality (in code) | Gap | Severity | Evidence | Recommendation |
|---|----------------------|-------------------|-----|----------|----------|----------------|
| Q1 | Production-ready application (v2.6.0, Docker Hub, live demo) | Zero automated tests of any kind | No regression safety net on a 30-feature app with 31+ DB tables | Critical | 0 test files, no test framework in package.json, no test script, no CI test step | Add Jest (server) + Vitest (client); start with 22 route files that follow consistent testable patterns |
| Q2 | Maintainable codebase for community contributions | No TypeScript, no linter, no formatter | Contributors have no guardrails; bugs caught only by manual testing | Critical | No .eslintrc, .prettierrc, tsconfig.json in entire repo; no devDependencies for quality tooling | Add ESLint + Prettier immediately; plan TypeScript migration incrementally |
| Q3 | Secure production deployment | CI pipeline has no quality gates | Broken code can reach Docker Hub and production deployments via auto-pull | Critical | `.github/workflows/docker.yml` only does build+push; no lint, no test, no security scan | Add lint + test + audit steps before Docker build in CI |
| Q4 | Data integrity across migrations | Migration version "28" appears twice | Potential schema inconsistency between fresh installs and upgrades | Major | `database.js:587` and `database.js:610` both labeled as migration 28 | Fix numbering, add migration version uniqueness check, add migration tests |
| Q5 | Input validation for all endpoints | Only parameterized SQL prevents injection; no schema validation | Malformed input could cause unexpected behavior or data corruption | Major | No zod/joi/yup in dependencies; routes directly use `req.body` properties | Add request validation (zod recommended) at API boundaries |
| Q6 | Request rate limiting | Only login endpoint has rate limiting (10/15min) | Other sensitive endpoints (registration, file upload, search) unprotected | Major | `auth.js` has `rateLimit()` on login; no other route uses it | Add express-rate-limit to registration, upload, search, and admin endpoints |

## Architecture Gaps

| # | Intent (reconstructed) | Reality (in code) | Gap | Severity | Evidence | Recommendation |
|---|----------------------|-------------------|-----|----------|----------|----------------|
| A1 | Clean modular architecture | tripStore.js is 863-line monolith managing 10+ sub-domains | Single point of complexity; hard to maintain or extend individual features | Major | `client/src/store/tripStore.js` at 863 lines with trips, days, places, assignments, reservations, notes, accommodations, packing, budget, files, photos, collab actions | Split into domain-specific stores (budgetStore, packingStore, collabStore, etc.) |
| A2 | Maintainable database layer | database.js is 755-line monolith with all schema + 31 migrations inline | Migrations are fragile (no tooling, no reversibility, numbering error) | Major | `server/src/db/database.js` at 755 lines; all CREATE TABLE + ALTER TABLE in single function | Extract to numbered migration files; add migration CLI with up/down support |
| A3 | Docker-first deployment | Admin self-update uses `git pull` + `npm install` + `process.exit(0)` | Self-update mechanism only works for non-Docker installs; contradicts Docker-first positioning | Minor | `admin.js:195-235` — git-based update; Docker containers don't have git | Document Docker update path (watchtower or manual pull); disable git-update in Docker mode |
| A4 | Consistent addon architecture | Some addons are trip-scoped, some are global, some are hybrid | Addon system has inconsistent scoping which could confuse contributors | Minor | Packing/budget/docs are trip addons; Vacay/Atlas are global; Collab bridges both | Document addon types and scoping rules for contributors |

## Completion Gaps

| # | Intent (reconstructed) | Reality (in code) | Gap | Severity | Evidence | Recommendation |
|---|----------------------|-------------------|-----|----------|----------|----------------|
| C1 | Community-driven open-source project | 110 commits by 1 developer, 0 external contributors | No community yet despite professional infrastructure | Major | Issue templates, FUNDING.yml, demo instance, SECURITY.md — all in place but unused | Promote on r/selfhosted, add CONTRIBUTING.md, add "good first issue" labels |
| C2 | Sustainable hobby funding | Ko-fi + Buy Me a Coffee links exist | No evidence of patrons or funding | Minor | `.github/FUNDING.yml` configured; no sponsor count visible | Build user base first; funding follows adoption |
| C3 | Error monitoring in production | Graceful shutdown + health checks exist | No error reporting or monitoring system | Minor | `index.js` has SIGTERM/SIGINT handlers, `/api/health` endpoint; no Sentry/logging service | Add structured logging (pino) and optional Sentry integration |
| C4 | API documentation for contributors | REST API is well-structured with consistent patterns | No OpenAPI spec, no API docs, no JSDoc | Minor | 22 route files with consistent CRUD patterns but zero documentation | Generate OpenAPI from routes or add swagger-jsdoc |

## Gap Summary

### By Severity

| Severity | Count | Key Themes |
|----------|-------|-----------|
| Critical | 3 | Zero tests, no code quality tooling, no CI quality gates |
| Major | 8 | PDF export, pagination, migration error, tripStore monolith, database.js monolith, input validation, rate limiting, community adoption |
| Minor | 7 | Unsplash vestigial code, photo gallery removed, i18n limited, self-update Docker mismatch, addon scoping, funding, error monitoring, API docs |

### By Dimension

| Dimension | Gaps | Most Severe |
|-----------|------|------------|
| Features | 5 | PDF export non-functional (Major), no pagination (Major) |
| Quality | 6 | Zero automated tests (Critical), no CI quality gates (Critical) |
| Architecture | 4 | tripStore.js monolith (Major), database.js monolith (Major) |
| Completion | 4 | Zero community contributors (Major) |

## Severity Definitions

- **Critical:** Blocks core functionality or represents a fundamental misalignment between intent and reality. Must be addressed before the project can sustain growth or safely serve users. The three critical gaps (no tests, no quality tooling, no CI gates) collectively mean that bugs and regressions can reach production undetected.
- **Major:** Significant gap that reduces the project's value, quality, or sustainability. Should be addressed in the near term to prevent accumulation of risk.
- **Minor:** Gap that is noticeable but does not significantly impact the project's ability to achieve its goals. Can be addressed when convenient or as part of broader improvements.

---

**Evidence basis:** PROJECT_MAP.md, FEATURE_REPORT.md, EVOLUTION_REPORT.md, INTENT_REPORT.md
