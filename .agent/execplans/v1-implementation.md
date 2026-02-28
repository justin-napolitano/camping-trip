# Execute V1 Core Build (T0.5 -> T12 -> T13/T83 -> T11 + T10 parallel -> T81 -> T84/T85 -> T82)

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This plan delivers the first working version of the project by making the API contract explicit and validated, implementing the schema and migration foundation, importing a validated Sand Rock seed dataset, adding disabled integration scaffolding for future providers, enforcing deterministic capability rules, and exposing homepage kit bundles with explainable outputs. After this work, a novice should be able to clone the repository, bootstrap the environment, run the validation commands, and observe a passing end-to-end implementation gate for v1.

## Progress

- [x] (2026-02-25T15:47:00Z) ExecPlan compliance rewrite completed (prose-first structure, explicit validation outputs, explicit rollback commands).
- [x] (2026-02-28T16:01:14Z) Milestone 0: Bootstrap and command scaffold verification completed (bootstrap/env + script help checks pass).
- [x] (2026-02-28T16:01:14Z) Milestone 0.5: Repo bootstrap readiness gate completed (required paths/scripts exist; path checks pass).
- [x] (2026-02-28T16:23:18Z) Milestone 1: T12 completed with locked endpoint schemas, OpenAPI route coverage, runtime handler/validator wiring, and passing `contract:validate` + `test:contract` (including endpoint-handler contract suite).
- [x] (2026-02-28T17:21:47Z) Milestone 2: T13 completed with real DB bring-up, clean reset/apply validation, preview-like apply validation, and rollback path verification evidence.
- [x] (2026-02-28T17:03:29Z) Preview-like DB environment bootstrapped via `npm run db:up`; both local dev and preview DBs are running and reachable.
- [x] (2026-02-28T16:17:08Z) Milestone 3: T11 seed dataset build and validation completed (`seed:validate`, `seed:import:test`, `seed:report`, `test:capability-rules`, `test:trip-evaluation` all pass with report artifacts).
- [x] (2026-02-28T16:12:41Z) Milestone 4: T10 integration scaffolding completed with Notion disabled guardrails; `integration:check` + `test:integration-adapters` passing and evidence artifact recorded.
- [x] (2026-02-28T17:23:20Z) Milestone 5: Global local test gate completed with real (non-noop) command implementations and passing results.
- [x] (2026-02-28T16:23:18Z) Milestone 6: T81 completed with deterministic capability engine, trip-evaluation handler wiring, and passing `test:capability-rules`, `test:trip-evaluation`, and endpoint handler tests.
- [x] (2026-02-28T17:26:44Z) Milestone 7: T82 completed with homepage kits endpoint payload enhancement, homepage UI rendering, optional purchase-link handling, and passing `test:homepage-kits` + `test:e2e -- --grep "homepage kits"`.
- [x] (2026-02-28T17:18:20Z) Milestone 8: T83 completed; DB command path hardened and verified with real operations (`db:migrate:reset-test`, `db:migrate:preview-check`, `db:backup:create`, `db:restore:dry-run` all pass).
- [x] (2026-02-28T17:19:56Z) Post-hardening verification rerun completed: `db:migrate:check`, `db:migrate:preview-check`, `db:backup:create`, and `db:restore:dry-run` all pass with real DB side effects and artifact outputs.
- [x] (2026-02-28T17:21:47Z) Milestone 9: T84 completed (search-index drift closure) with full-text and name/model trigram index enforcement + preview apply pass.
- [x] (2026-02-28T17:23:20Z) Milestone 10: T85 completed with real gate scripts for `lint`, `typecheck`, `test:unit`, and `test:integration`.

## Surprises & Discoveries

No implementation surprises have occurred yet because implementation has not started. One planning discovery is that command-level acceptance was specified in AGENTS, but expected output transcripts and explicit rollback command paths were not yet encoded in this ExecPlan. This rewrite resolves that gap.

Hostile review discovery on 2026-02-28: repository scaffolding paths required by T12/T13 were still absent, and seed-package contracts conflicted with AGENTS-locked contracts. Milestone 0.5 was added as a hard prerequisite and seed package usage was constrained to reference-only.

Execution discovery on 2026-02-28: command surface now exists, but several commands are intentionally bootstrap no-op placeholders pending real T12/T13/T11 implementations.
Execution discovery on 2026-02-28: contract validation and contract tests now run as real checks, not placeholders, and include legacy leakage blocking.
Execution discovery on 2026-02-28: T13 local verification commands pass using repository-level migration artifact checks; no live database apply has been executed yet in this workspace.
Execution discovery on 2026-02-28: T10 acceptance can be closed independently (parallel-safe) once disabled-provider tests and artifact evidence are present.
Execution discovery on 2026-02-28: seed quality thresholds are now measurable and passing via scripted reports; remaining T11 closure dependency is deterministic hard-rule fixture alignment with T81 implementation.
Execution discovery on 2026-02-28: T11 can be closed with deterministic fixtures once capability engine tests are green, even before endpoint runtime wiring is completed.
Execution discovery on 2026-02-28: endpoint-handler contract suite is effective for verifying request-validation/runtime wiring across the locked endpoint set without requiring a full Next.js runtime boot.
Execution discovery on 2026-02-28: preview-like live migration apply path exists via `npm run db:migrate:preview-check`; initial credential block was resolved by local Docker DB bring-up.
Execution discovery on 2026-02-28: preview-like DB credentials are now available via local Docker bring-up; after T83 patching, preview migration check now fails on apply conflicts and passes only after successful clean reset + apply verification.
Execution discovery on 2026-02-28: T84 search-index drift was resolved by adding a canonical-search full-text GIN index and a name/model trigram GIN index, with `db:migrate:check` asserting both.
Execution discovery on 2026-02-28: T85 gate hardening replaced all no-op global gate scripts with real lint/type/unit/integration validation command paths that now pass locally.
Execution discovery on 2026-02-28: T82 closure required adding explicit test scripts (`test:homepage-kits`, `test:e2e`) to make homepage endpoint/UI integration auditable in this repository.

Evidence:

    Prior draft had command lists but no expected output snippets and no concrete rollback command sequence.
    2026-02-28 bootstrap evidence: scripts/bootstrap.sh and scripts/validate_env.sh pass; npm help checks pass for lint/typecheck/test/unit/integration/contract/db/seed command names; required paths exist.

## Decision Log

- Decision: Add Milestone 0 before T12 to verify or create required npm scripts and bootstrap commands.
  Rationale: Validation commands cannot serve as acceptance gates unless they provably exist and run.
  Date/Author: 2026-02-25 / Codex

- Decision: Keep dependency order as T12 -> T13 -> T11, with T10 parallel-safe.
  Rationale: This matches AGENTS dependency policy and minimizes schema/contract drift risk.
  Date/Author: 2026-02-25 / Codex

- Decision: Require explicit expected output snippets for each milestone command bundle.
  Rationale: Novice-guiding requirement in `.agent/PLANS.md` and easier pass/fail verification.
  Date/Author: 2026-02-25 / Codex

- Decision: Extend v1 execution sequence with T81 and T82 to include capability-policy enforcement and homepage kit outputs.
  Rationale: AGENTS scope now includes deterministic trip evaluation and homepage best-fit bundles.
  Date/Author: 2026-02-25 / Codex

- Decision: Add explicit Milestone 0.5 path-existence checks and enforce T10 as parallel-safe non-blocking track.
  Rationale: Prevent false "implementation-ready" status and preserve AGENTS dependency order without serializing unrelated scaffolding.
  Date/Author: 2026-02-28 / Codex

- Decision: Add explicit hardening track (T83/T84/T85) before further milestone closure.
  Rationale: Current DB and global-gate commands include placeholder/false-pass behavior that violates acceptance intent.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Current outcome: execution governance is now stricter and more testable. The remaining outcome work is implementation itself. Final retrospective will compare delivered behavior against the purpose section and AGENTS success KPI gates.

## Context and Orientation

This repository has two coordination layers. `AGENTS.md` is the policy and governance contract, and this ExecPlan is the active implementation playbook for multi-hour work. The active tasks for this plan are T12 (contracts), T13 (schema and migration), T83 (DB command hardening), T84 (search-index drift closure), T85 (global gate hardening), T11 (seed dataset), T10 (integration scaffold), T81 (capability-policy implementation), and T82 (homepage kits). The policy already defines acceptance criteria, but this file must provide concrete execution steps and verification artifacts for a novice with no prior context.

Expected implementation paths after completion are:

- `docs/openapi/v1.yaml`
- `src/contracts/`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `data/seed/entities/`
- `data/seed/review_intel/`
- `artifacts/import-reports/`
- `src/integrations/adapter.ts`
- `src/integrations/notion/`
- `scripts/bootstrap.sh`
- `scripts/validate_env.sh`
- `scripts/seed_local.sh`

## Plan of Work

Milestone 0 verifies the environment and command surface that later milestones depend on. Milestone 0.5 then enforces repository bootstrap readiness so T12 starts from a valid base. Milestone 1 locks and validates API contracts and runtime schema validation behavior. Milestone 2 translates locked policy into Prisma schema and migration files and verifies migration behavior locally. Milestone 8 hardens DB command behavior so T13 closure signals are trustworthy. Milestone 3 builds and validates Sand Rock-first seed data against quality gates. Milestone 4 adds integration adapter scaffolding with Notion disabled by default and can run in parallel as long as it does not change T12/T13/T11 acceptance gates. Milestone 9 closes remaining hardening drift in search index coverage. Milestone 10 closes global local gate implementation hardening. Milestone 5 executes the global local quality gate and records closure evidence.

Each milestone must end with updated `Progress`, any discoveries, and explicit command evidence.

## Concrete Steps

All commands run from repository root: `/mnt/c/Users/jna31a/repos/camping-trip`.

Milestone 0 commands (bootstrap/command preflight):

    bash scripts/bootstrap.sh
    bash scripts/validate_env.sh
    npm run lint -- --help
    npm run typecheck -- --help
    npm run test:unit -- --help
    npm run test:integration -- --help
    npm run contract:validate -- --help
    npm run db:migrate:check -- --help
    npm run seed:validate -- --help

Expected outcomes for Milestone 0:

    Each command returns exit code 0.
    If a command is missing, implement it before proceeding.

Milestone 0.5 commands (repo readiness):

    test -f package.json
    test -d schemas
    test -f docs/openapi/v1.yaml
    test -d src/contracts
    test -d prisma
    test -f scripts/bootstrap.sh
    test -f scripts/validate_env.sh
    test -f scripts/seed_local.sh

Expected outcomes for Milestone 0.5:

    each path check exits 0.
    missing path means Milestone 0.5 fails and T12 cannot start.

Milestone 1 commands (T12):

    npm run contract:validate
    npm run test:contract

Expected outcomes for Milestone 1:

    contract:validate completes with no undocumented endpoint drift.
    test:contract passes with all contract validation tests green.

Milestone 2 commands (T13):

    npm run db:up
    npm run db:migrate:reset-test
    npm run db:migrate:check
    npm run db:migrate:preview-check
    npm run db:backup:create
    npm run db:restore:dry-run

Expected outcomes for Milestone 2:

    db:up starts/creates local dev + preview-like Postgres successfully.
    reset-test applies migrations on a clean database and exits 0.
    migrate:check exits 0 with no policy/index/FK drift.
    migrate:preview-check applies migration in preview-like DB and exits 0.
    backup:create completes and produces restorable backup artifact metadata.
    restore:dry-run exits 0 and validates rollback runbook path without destructive restore.

Milestone 8 commands (T83):

    npm run db:up
    npm run db:migrate:reset-test
    npm run db:migrate:preview-check
    npm run db:backup:create
    npm run db:restore:dry-run

Expected outcomes for Milestone 8:

    db command scripts report pass/fail based on real DB operations only.
    preview-check cannot emit PASS if migration apply command fails.
    backup/restore checks validate real artifact and restore path semantics.

Milestone 3 commands (T11):

    npm run seed:validate
    npm run seed:import:test
    npm run seed:report

Expected outcomes for Milestone 3:

    seed:validate reports zero schema/enum violations for accepted files.
    seed:import:test reports zero FK violations.
    seed:report confirms threshold coverage for gear/class/system/location/review counts.

Milestone 4 commands (T10):

    npm run integration:check
    npm run test:integration-adapters

Expected outcomes for Milestone 4:

    integration:check confirms adapter interface and disabled Notion scaffold wiring.
    test:integration-adapters confirms Notion cannot activate without explicit flag/config.

Milestone 5 commands (global closeout gate):

    npm run lint
    npm run typecheck
    npm run test:unit
    npm run test:integration

Expected outcomes for Milestone 5:

    all four commands exit 0 and are non-placeholder quality checks.

Milestone 6 commands (T81):

    npm run test:capability-rules
    npm run test:trip-evaluation

Expected outcomes for Milestone 6:

    capability hard rules evaluate deterministically and block on every configured non-negotiable failure case.
    trip evaluation tests return expected TSI band and minimum system-level requirements for fixture trip profiles.

Milestone 7 commands (T82):

    npm run test:homepage-kits
    npm run test:e2e -- --grep "homepage kits"

Expected outcomes for Milestone 7:

    homepage kits endpoint returns explainable, capability-compliant bundles.
    e2e homepage flow passes for gear discovery from homepage to gear detail.

Milestone 9 commands (T84):

    npm run db:migrate:check
    npm run db:migrate:preview-check

Expected outcomes for Milestone 9:

    migration/search-index policy checks pass with required full-text + trigram index coverage.

Milestone 10 commands (T85):

    npm run lint
    npm run typecheck
    npm run test:unit
    npm run test:integration

Expected outcomes for Milestone 10:

    global gate commands run real tooling and fail correctly on validation errors.

## Validation and Acceptance

A milestone is accepted only if every command in its section exits successfully and the expected outcomes match observed behavior. A task from AGENTS may be marked `Done` only after milestone evidence is recorded in this ExecPlan and task acceptance conditions in AGENTS are satisfied.

Human-verifiable acceptance for full plan completion:

- Contract validation is passing and aligned to locked endpoint set.
- Migration checks are passing and schema artifacts exist.
- Seed data import passes quality thresholds with report artifacts.
- Integration scaffold exists and remains disabled without explicit activation.
- Capability rules and trip evaluation are deterministic and passing.
- Homepage kits endpoint/UI contract is passing with explainability payloads.
- Global local test gate passes.

## Idempotence and Recovery

Most validation commands are idempotent and can be rerun without drift. Seed validation/report/import-test commands are designed for repeat runs while data files are corrected.

If migration validation fails, use this recovery sequence:

    npm run db:backup:create
    npm run db:migrate:check
    npm run db:restore:dry-run

Then capture failure evidence in `Surprises & Discoveries`, record decision/update path in `Decision Log`, and retry only after corrective changes.

If seed import validation fails, use this retry sequence:

    npm run seed:validate
    npm run seed:import:test
    npm run seed:report

Do not mark progress complete until seed validation and FK checks both pass.

## Artifacts and Notes

Record concise evidence snippets per milestone. Example expected snippets:

    contract:validate: PASS (0 undocumented routes, 0 schema drift)
    test:contract: PASS (N passed, 0 failed)

    db:migrate:reset-test: PASS
    db:migrate:check: PASS

    seed:validate: PASS (0 validation errors)
    seed:import:test: PASS (0 FK violations)
    seed:report: PASS (all thresholds met)

    integration:check: PASS (notion adapter disabled)
    test:integration-adapters: PASS

    lint/typecheck/test:unit/test:integration: PASS

## Interfaces and Dependencies

Contracts are authored in `docs/openapi/v1.yaml` and runtime schema handling in `src/contracts/` plus route handlers. Database structure is defined in `prisma/schema.prisma` with migration files under `prisma/migrations/`. Seed inputs live in `data/seed/` and generated validation artifacts in `artifacts/import-reports/`.

Integration interfaces are defined under `src/integrations/`, with Notion adapter scaffolding in `src/integrations/notion/` guarded by feature flags. Environment bootstrap and portability scripts are `scripts/bootstrap.sh`, `scripts/validate_env.sh`, and `scripts/seed_local.sh`.

Change Note

- 2026-02-25: Initial ExecPlan created to execute T12, T13, T11, and T10 under `.agent/PLANS.md` requirements and AGENTS governance.
- 2026-02-25: Rewritten for strict PLANS compliance with prose-first narrative, explicit expected outputs, concrete recovery commands, and milestone 0 bootstrap preflight.
- 2026-02-25: Synced Milestone 2 command manifest with AGENTS T13 rollback command availability requirements to remove acceptance drift risk.
- 2026-02-25: Expanded ExecPlan scope to include T81 capability-policy implementation and T82 homepage kits integration.
- 2026-02-28: Added T83/T84/T85 hardening milestones and synchronized command manifests with AGENTS (including `npm run db:up` for T13/T83).
- 2026-02-28: Completed T13/T83/T84/T85 command hardening and validation evidence; global local test gate now runs real non-noop checks.
