# TODO

## Phase 0 - Planning Lock (Done)
- [x] Lock AGENTS governance, hostile review protocol, and ExecPlan workflow.
- [x] Lock capability-engine standards (ECWCS/WMS-inspired hard rules, TSI, explainability).
- [x] Lock contract layering model (`schemas` + OpenAPI + runtime contracts).

## Phase 1 - Import and Normalize Seed Package
- [ ] Move `capability-engine-seed-final/schemas/*` into repo-level `schemas/`.
- [ ] Move `capability-engine-seed-final/rules/*` into repo-level `src/rules/` or `rules/` (finalize location once).
- [ ] Move docs from seed package into `docs/policy/` and `docs/` with canonical names.
- [ ] Add schema and rule version metadata checks to CI.

## Phase 2 - Contract and API Foundation (T12)
- [ ] Build `docs/openapi/v1.yaml` for all locked endpoints.
- [ ] Implement runtime contracts in `src/contracts/` aligned to schema files.
- [ ] Add drift checks: schema drift, API drift, example drift.
- [ ] Add/verify `npm run contract:validate` and `npm run test:contract`.

## Phase 3 - Database Foundation (T13)
- [ ] Implement Prisma models for core entities + capability entities.
- [ ] Generate initial migration and verify clean apply/reset.
- [ ] Add rollback evidence flow (`db:backup:create`, `db:restore:dry-run`).
- [ ] Verify FK/index constraints match AGENTS policy.

## Phase 4 - Seed Data and Validation (T11)
- [ ] Load Sand Rock initial dataset and seed examples.
- [ ] Validate imports with zero schema/FK violations.
- [ ] Generate import reports under `artifacts/import-reports/`.
- [ ] Verify evidence-quality thresholds and minimum coverage gates.

## Phase 5 - Capability Engine (T81)
- [ ] Implement deterministic TSI calculation module.
- [ ] Implement hard-block rule evaluator.
- [ ] Implement ECWCS evidence-based mapping (computed levels only).
- [ ] Implement field-test recency enforcement.
- [ ] Add tests: `test:capability-rules`, `test:trip-evaluation`.

## Phase 6 - Homepage Kits (T82)
- [ ] Implement `GET /api/v1/homepage/kits`.
- [ ] Add explainability payloads to kit items.
- [ ] Wire homepage UI to kits endpoint.
- [ ] Add tests: `test:homepage-kits`, e2e homepage kits flow.

## Phase 7 - Hardening and Release
- [ ] Run global local gate: lint, typecheck, unit, integration.
- [ ] Validate preview environment migrations and contracts.
- [ ] Add bootstrap scripts and env validation if missing.
- [ ] Document restore drill and release checklist.

## Immediate Next Session
1. Standardize final file locations for imported `schemas/` and `rules/`.
2. Generate OpenAPI baseline from locked endpoints.
3. Implement contract validation scripts and failing drift checks first.
