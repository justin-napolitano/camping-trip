# Execute V3 DB Seed Import and Runtime DB Wiring (T87)

Status: Active branch execution source-of-truth for `feature/db-seed-runtime-wiring-context`.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This work makes seed updates and frontend responses flow through real Postgres data instead of static payloads and file-only checks. After completion, seeded data is imported into DB with idempotent behavior, and core frontend-facing API paths read from DB while preserving existing contracts and T86 trip-evaluation safety semantics.

## Progress

- [x] (2026-02-28T20:05:00Z) Converted branch context note into full PLANS-compliant ExecPlan and aligned AGENTS active-plan registration to this file.
- [x] (2026-02-28T20:45:00Z) Milestone 1 completed: implemented `seed:import:db` transactional import runtime with deterministic ID mapping/upserts and updated `scripts/seed_local.sh` workflow.
- [x] (2026-02-28T20:45:00Z) Milestone 2 completed: added DB access layer under `src/db/` (`pg-shell` + runtime repositories) for seed import and endpoint read paths.
- [x] (2026-02-28T20:45:00Z) Milestone 3 completed: wired `homepage/kits`, `gear`, `gear/:slug`, and `gear/:slug/locations` routes to DB-first reads with contract-shape payload mapping.
- [x] (2026-02-28T20:45:00Z) Milestone 4 completed: trip-evaluation route now uses DB-derived policy/field-test/factor context via repository while preserving T86 deterministic handler semantics.
- [x] (2026-02-28T20:45:00Z) Milestone 5 completed: validation gates passed (`test:contract`, capability/endpoint tests, unit, integration, lint, typecheck, contract validate) and DB evidence collected.

## Surprises & Discoveries

- Observation: seed artifacts were expanded, but current runtime path still does not perform real DB seed imports.
  Evidence: `scripts/seed_local.sh` is placeholder-only and `seed:import:test` performs FK checks without writes.

- Observation: several frontend-facing endpoints still return static payloads.
  Evidence: handlers under `src/api/v1/*` currently return constant data for gear/homepage list paths.

- Observation: this environment does not expose `DATABASE_URL` by default and direct Docker socket access requires elevated execution in the tool sandbox.
  Evidence: `db:migrate:reset-test` and `seed:import:db` initially failed with missing `DATABASE_URL`; non-elevated DB route checks fell back due Docker permission errors.

## Decision Log

- Decision: keep V3 scope focused on seed-import/runtime data-path wiring, not recommendation-model redesign.
  Rationale: reduces delivery risk and unblocks visible frontend data correctness first.
  Date/Author: 2026-02-28 / Codex

- Decision: preserve T86 deterministic error and hard-rule semantics as non-negotiable while changing context source to DB.
  Rationale: safety and contract behavior from T86 must not regress during data-source migration.
  Date/Author: 2026-02-28 / Codex

- Decision: AGENTS task T87 and this ExecPlan use identical command manifests.
  Rationale: enforces anti-drift policy and auditable closure.
  Date/Author: 2026-02-28 / Codex

- Decision: route handlers use DB-first reads with static-handler fallback when DB access is unavailable.
  Rationale: preserves local/dev/test stability while enabling real DB-backed behavior in configured environments.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Completion target achieved for T87 scope: seed import runtime writes transactionally to Postgres with deterministic upserts, target frontend routes are DB-first, and trip-evaluation context is DB-derived while preserving T86 deterministic behavior.

Evidence summary:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/camping_trip_dev npm run db:migrate:reset-test`: PASS
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/camping_trip_dev npm run seed:import:db`: PASS (`systems=7 locations=3 gear_classes=10 gear_items=60 reviews=420`)
- DB evidence query: `gear_items=60`, `reviews=420`, `policies=1`, `kit_bundles=2`, `kit_items=3`
- Full gate bundle: PASS for `test:contract`, `test:capability-rules`, `test:trip-evaluation`, `test:trip-endpoint`, `test:unit`, `test:integration`, `lint`, `typecheck`, `contract:validate`

Residual risk:

- DB route reads rely on `psql` or Docker-backed `psql` execution in this implementation; production hardening should replace shell-based query execution with a direct DB client/runtime pool.

## Context and Orientation

Current relevant files and gaps:

- `scripts/seed_local.sh`: placeholder script; no DB writes yet.
- `scripts/seed/import-test.mjs`: validates FK consistency in files only.
- `src/api/v1/homepage/kits/handler.mjs`: static response payload.
- `src/api/v1/gear/list-handler.mjs`: static response payload.
- `src/api/v1/gear/detail-handler.mjs`: static response payload.
- `src/api/v1/gear/locations-handler.mjs`: static response payload.
- `app/api/v1/trips/evaluate/route.js`: currently loads seed files as runtime context instead of DB rows.
- `src/api/v1/trips/evaluate/handler.mjs` and `src/policy/capability/engine.mjs`: T86 deterministic behavior that must be preserved.

Term definitions used in this plan:

- idempotent import: rerunning the same import produces the same DB end state without duplicate logical records.
- transactional import: if any import step fails, no partial subset of rows is committed for that unit of work.
- DB-backed endpoint: route/handler response payload is assembled from persisted DB records rather than static constants.

## Plan of Work

Milestone 1 implements a real importer path from seed JSON/CSV files to Postgres and updates `scripts/seed_local.sh` to execute it. Milestone 2 introduces minimal repository modules for endpoint read paths and context retrieval. Milestone 3 rewires homepage/gear endpoints to use repository reads while preserving response contracts. Milestone 4 rewires trip-evaluation route context loading to DB and verifies that T86 deterministic validation/error semantics remain intact. Milestone 5 runs full locked command gates, updates AGENTS status, and records closure evidence.

## Concrete Steps

Milestone 1 commands:

    npm run db:up
    npm run db:migrate:reset-test
    npm run seed:validate

Milestone 2 commands:

    npm run test:contract
    npm run test:unit

Milestone 3 commands:

    npm run test:contract
    npm run test:integration

Milestone 4 commands:

    npm run test:capability-rules
    npm run test:trip-evaluation
    npm run test:trip-endpoint

Milestone 5 commands:

    npm run db:up
    npm run db:migrate:reset-test
    npm run seed:validate
    npm run test:contract
    npm run test:capability-rules
    npm run test:trip-evaluation
    npm run test:trip-endpoint
    npm run test:unit
    npm run test:integration
    npm run lint
    npm run typecheck

## Validation and Acceptance

T87 is accepted only when all are true:

- seed import runtime writes to Postgres and can be rerun without duplicate logical records.
- import behavior is transactional for each import unit (no partial commits on failure).
- target endpoints return DB-backed payloads matching contract shape:
  - `GET /api/v1/homepage/kits`
  - `GET /api/v1/gear`
  - `GET /api/v1/gear/:slug`
  - `GET /api/v1/gear/:slug/locations`
- `POST /api/v1/trips/evaluate` derives policy/field-test context from DB and preserves T86 deterministic behavior:
  - `422` `VALIDATION_ERROR`
  - `422` `EXPLAINABILITY_INCOMPLETE`
  - `409` `POLICY_CONTEXT_MISSING`
  - field-test requirement still uses `passed=true`, recency, and selected-gear scoping.
- no contract drift exists between `schemas/`, `docs/openapi/v1.yaml`, and `src/contracts/` for touched endpoints.
- full Milestone 5 command bundle passes.
- AGENTS workboard and ExecPlan sections are synchronized in the same session.

## Idempotence and Recovery

All listed validation commands are rerunnable. Import/runtime changes must be applied incrementally and verified per milestone. If a milestone fails:

1. Re-run the failing command to confirm reproducibility.
2. Record failure in `Surprises & Discoveries` with short evidence.
3. Apply the smallest in-scope fix.
4. Re-run full milestone command set before proceeding.

If DB import changes corrupt local state, rerun `npm run db:migrate:reset-test` before retrying imports.

## Artifacts and Notes

Expected evidence snippets at closure:

- seed runtime command shows persisted row counts and import completion.
- `test:contract: PASS`
- `test:capability-rules: PASS`
- `test:trip-evaluation: PASS`
- `test:trip-endpoint: PASS`
- `test:unit: PASS`
- `test:integration: PASS`
- `lint/typecheck: PASS`

## Interfaces and Dependencies

Primary interfaces and dependencies for this track:

- Postgres schema under `prisma/` (existing models and migrations).
- seed source files under `data/seed/entities` and `data/seed/review_intel`.
- endpoint handlers under `src/api/v1/**` and route wrapper in `app/api/v1/trips/evaluate/route.js`.
- contract layers under `schemas/`, `docs/openapi/v1.yaml`, `src/contracts/`.

New code in this milestone should prefer additive repository/service modules for DB reads/imports so handler logic remains thin and testable.

## Change Notes

- 2026-02-28: Upgraded branch context note into full PLANS-compliant active ExecPlan, aligned to AGENTS T87 task and command-manifest anti-drift rules.
- 2026-02-28: Completed T87 implementation milestones and recorded DB import/runtime evidence; added environment discovery and DB-first fallback decision notes.
