# Execute V3 DB Seed Import and Runtime DB Wiring

Status: Draft context plan for next session on `feature/db-seed-runtime-wiring-context`.

## Purpose / Big Picture

This branch is for moving from file-only seed artifacts and mostly static API responses to real Postgres-backed data flow. After this work, updating seed datasets and importing them should be reflected in frontend responses without hardcoded payloads.

## Current State Snapshot

The repository has expanded seed files under `data/seed/entities` and `data/seed/review_intel`, and seed report artifacts exist. However, the operational seed-import path is not wired to write records into Postgres.

Current limitations to remove in this branch:

- `scripts/seed_local.sh` is still placeholder-only and does not import data into DB.
- `npm run seed:import:test` validates FK relationships in files but does not persist rows.
- key API handlers still return static/mock payloads rather than DB reads.
- trip-evaluation route context currently reads persisted seed JSON files, not live DB rows.

## Scope for V3

Primary scope:

- implement real seed import commands that write entities/review-intel into local Postgres.
- make imports idempotent with deterministic upsert keys.
- wire selected runtime endpoints to DB reads so frontend reflects imported data.
- keep request/response contracts aligned (`schemas/`, `docs/openapi/v1.yaml`, `src/contracts/`).

Initial endpoint targets for DB reads:

- `GET /api/v1/homepage/kits`
- `GET /api/v1/gear`
- `GET /api/v1/gear/:slug`
- `GET /api/v1/gear/:slug/locations`
- `POST /api/v1/trips/evaluate` context-loading path (policy/field-test retrieval)

## Out of Scope (for first V3 increment)

- recommendation-model redesign
- auth scope redesign
- unrelated UI redesign

## First Milestones

1. Seed Import Runtime

Implement importer scripts to load JSON/CSV seed files into Postgres with FK safety and no partial commits.

2. DB Repository Layer

Add a minimal data-access layer for the target endpoints to keep handlers thin and testable.

3. Endpoint Wiring

Replace static response payloads for target endpoints with DB-backed queries while preserving contract shape.

4. Validation and Evidence

Run contract/capability/unit/integration gates and capture import evidence.

## Required Commands (Kickoff)

Run from repository root:

    npm run db:up
    npm run db:migrate:reset-test
    npm run seed:validate

Then implement and run a real local seed import command, followed by:

    npm run test:contract
    npm run test:unit
    npm run test:integration

## Acceptance Definition for V3 Kickoff Completion

- seed import command writes to Postgres and is rerunnable without duplicates.
- target frontend-facing endpoints return DB-backed data.
- contract and test gates pass without temporary bypasses.
- AGENTS and active ExecPlan progress remain synchronized.

## Notes for Next Session

T86 hardening is complete on the prior feature branch (`feature/engine-hostile-hardening`) and includes deterministic validation/error semantics for trip evaluation. Preserve those semantics when replacing seed-file context loading with live DB lookups.
