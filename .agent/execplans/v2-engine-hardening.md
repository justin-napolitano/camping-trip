# Execute V2 Engine Hardening (T86)

Status: Active branch execution source-of-truth for `feature/engine-hostile-hardening`.

## Purpose / Big Picture

This plan hardens the trip-evaluation runtime path so hostile-review concerns are eliminated before further capability-engine expansion. The intent is to make `POST /api/v1/trips/evaluate` deterministic, data-backed, and contract-aligned by enforcing strict request shape rules, deriving policy/field-test context from persisted records, requiring passed recent tests for cold/remote safety checks, and enforcing strict per-selected-item explainability payload guarantees.

## Progress

- [x] (2026-02-28T18:05:00Z) V2 ExecPlan created for branch `feature/engine-hostile-hardening`.
- [x] (2026-02-28T18:05:00Z) Governance sync prepared in AGENTS: T86 added with matching command manifest and acceptance criteria.
- [x] (2026-02-28T19:20:00Z) Governance strict-tracking gate cleared via commit `d53a069`; T86 moved from `Blocked` to `In Progress` in AGENTS with same-session sync.
- [ ] (2026-02-28T18:05:00Z) Milestone 1 pending: contract/runtime validator parity for `TripsEvaluateRequest`.
- [ ] (2026-02-28T18:05:00Z) Milestone 2 pending: engine hard-rule semantics update (field-test `passed=true` gating).
- [ ] (2026-02-28T18:05:00Z) Milestone 3 pending: strict explainability enforcement for all selected items.
- [ ] (2026-02-28T18:05:00Z) Milestone 4 pending: route DB-derived context path + deterministic failure mode.
- [ ] (2026-02-28T18:05:00Z) Milestone 5 pending: test expansion and full local verification gates.
- [ ] (2026-02-28T18:05:00Z) Milestone 6 pending: evidence capture and task closure sync.

## Surprises & Discoveries

Hostile review identified that route defaults currently provide always-false policy context, creating policy-behavior ambiguity. It also identified a safety bug where failed field tests can satisfy recency checks. These are treated as first-order blockers for trustworthy trip approvals.

## Decision Log

- Decision: Keep this work as a dedicated v2 hardening track rather than extending the closed v1 execution file.
  Rationale: preserves clean historical evidence for v1 while giving T86 a single active source-of-truth.
  Date/Author: 2026-02-28 / Codex

- Decision: Enforce strict explainability behavior (selected item missing explainability -> deterministic request failure).
  Rationale: aligns with user direction and reduces silent response-quality degradation.
  Date/Author: 2026-02-28 / Codex

- Decision: Use DB-derived context as required behavior for trip evaluation route.
  Rationale: prevents false approval/failure outcomes caused by static defaults.
  Date/Author: 2026-02-28 / Codex

- Decision: Lock deterministic runtime failure mapping for T86 hardening paths.
  Rationale: removes ambiguity during implementation and test-writing, and keeps contract behavior auditable.
  Date/Author: 2026-02-28 / Codex

- Decision: Lock deterministic DB context selection precedence and tie-breakers.
  Rationale: prevents non-repeatable behavior when multiple policy/field-test rows qualify.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Success means T86 closes with passing command evidence and no unresolved hostile-review blockers in the trip-evaluation runtime path. Final retrospective will summarize which findings were fixed, any residual risks, and explicit deferred items (if any).

## Context and Orientation

Primary files expected to change:

- `src/contracts/index.mjs`
- `schemas/TripsEvaluateRequest.schema.json` (if needed for strict alignment)
- `schemas/TripsEvaluateResponse.schema.json` (if strict explainability failure payload linkage changes)
- `docs/openapi/v1.yaml` (if contract behavior changes)
- `src/policy/capability/engine.mjs`
- `src/api/v1/trips/evaluate/handler.mjs`
- `app/api/v1/trips/evaluate/route.js`
- `scripts/capability/test-rules.mjs`
- `scripts/capability/test-trip-evaluation.mjs`
- `scripts/capability/test-trip-endpoint.mjs`
- additional route/contract tests as required

Policy anchors:

- `AGENTS.md` T86 requirements and acceptance criteria
- hard block rules, field-testing requirement, explainability contract extension
- contract sync/drift policy and runtime validation requirement

## Plan of Work

Milestone 1 enforces strict request validation parity with schema and locks unknown-field rejection behavior. Milestone 2 updates engine hard-rule semantics so field-test safety requirements require recent passing evidence tied to selected gear. Milestone 3 enforces strict explainability completeness for every selected item, with deterministic structured request failure when completeness cannot be met. Milestone 4 replaces static route defaults with DB-derived context assembly, deterministic policy-selection precedence, and deterministic failure behavior when required context is unavailable. Milestone 5 expands and runs tests/gates, including required new test intents listed below. Milestone 6 records evidence and synchronizes AGENTS + ExecPlan status.

## Concrete Steps

Milestone 1 commands:

    npm run test:contract
    npm run test:trip-endpoint

Milestone 1 required test intents:

- unknown request fields are rejected with `422` and structured `error_code`
- `selected_gear_by_system` arrays reject non-string ids and non-array values

Milestone 2 commands:

    npm run test:capability-rules
    npm run test:trip-evaluation

Milestone 2 required test intents:

- recent failed field tests (`passed=false`) do not satisfy cold/remote requirement
- recent passed field tests (`passed=true`) do satisfy requirement when all other hard rules pass
- stale passed tests outside recency window do not satisfy requirement
- qualifying field tests must belong to selected gear ids

Milestone 3 commands:

    npm run test:trip-evaluation
    npm run test:trip-endpoint

Milestone 3 required test intents:

- each selected item returns explainability with exactly 3 factors
- missing explainability for any selected item fails deterministically with `422` + `error_code=EXPLAINABILITY_INCOMPLETE`

Milestone 4 commands:

    npm run test:trip-endpoint
    npm run test:contract

Milestone 4 required test intents:

- policy context is loaded from DB (not static defaults)
- policy selection precedence is deterministic: `updated_at DESC`, tie-break `id ASC`
- when no policy row exists, request fails with `409` + `error_code=POLICY_CONTEXT_MISSING`
- multiple qualifying policy rows produce repeatable selection under precedence rule

Milestone 5 commands:

    npm run test:contract
    npm run test:capability-rules
    npm run test:trip-evaluation
    npm run test:trip-endpoint
    npm run lint
    npm run typecheck
    npm run test:unit
    npm run test:integration

Milestone 6 commands:

    git status --short
    rg -n "T86|v2-engine-hardening|trip-evaluation|hostile" AGENTS.md .agent/execplans/v2-engine-hardening.md

## Validation and Acceptance

T86 is accepted only when all are true:

- request runtime validation is schema-equivalent for trip-evaluation payloads
- field-test recency hard rule accepts only recent passed tests
- explainability payload is complete for every selected item or request fails deterministically (`422`, `error_code=EXPLAINABILITY_INCOMPLETE`)
- route no longer uses always-false static policy defaults in runtime path
- missing policy context fails deterministically (`409`, `error_code=POLICY_CONTEXT_MISSING`)
- DB context selection is deterministic under locked precedence (`updated_at DESC`, tie-break `id ASC`)
- command bundle in Milestone 5 passes without manual exceptions
- AGENTS workboard + ExecPlan progress are synchronized in the same session

## Idempotence and Recovery

All listed commands are rerunnable and non-destructive. If a milestone fails:

1. Re-run only the failed command.
2. Record failure details in `Surprises & Discoveries`.
3. Apply smallest corrective patch in scope.
4. Re-run full milestone command set before proceeding.

If DB-derived context integration causes broad instability, revert only T86-scoped route/context changes and reintroduce in smaller increments with expanded tests.

## Artifacts and Notes

Expected evidence snippets:

- `test:contract: PASS`
- `test:capability-rules: PASS`
- `test:trip-evaluation: PASS`
- `test:trip-endpoint: PASS`
- `lint/typecheck/test:unit/test:integration: PASS`

Record any new tests and exact command outputs summarized in closure notes.

## Interfaces and Dependencies

This track depends on existing contract files, policy module, and route handlers. Because DB-derived context is required, route behavior must clearly define fallback/error behavior when policy or field-test records are unavailable. Any contract-affecting behavior change must be synchronized across `schemas/`, `docs/openapi/v1.yaml`, and `src/contracts/` in the same change set.

Deterministic runtime mapping for T86:

- request schema mismatch or unknown fields -> `422`, `error_code=VALIDATION_ERROR`
- explainability missing for any selected item -> `422`, `error_code=EXPLAINABILITY_INCOMPLETE`
- required policy context unavailable from DB -> `409`, `error_code=POLICY_CONTEXT_MISSING`
- field-test requirement unmet due to missing/failed/stale evidence -> `200` with `approved=false` and explicit hard-rule failure code in `hard_rule_failures`

Deterministic DB selection rules for T86:

- policy row precedence: latest `updated_at`; tie-break by `id` ascending
- qualifying field-test rows: `passed=true`, within recency window, and `gear_item_id` in selected gear ids
- field-test evidence precedence for traceability: latest `test_date`; tie-break by `id` ascending

## Change Notes

- 2026-02-28: Added explicit lifecycle state (`Status: Active`) to align with `.agent/PLANS.md` lifecycle-state requirement.
- 2026-02-28: Added dedicated `Change Notes` section to satisfy revision-trace requirement in `.agent/PLANS.md`.
- 2026-02-28: Recorded strict-gate clearance and AGENTS status transition (`Blocked` -> `In Progress`) after governance commit `d53a069`.
- 2026-02-28: Hardened kickoff semantics with explicit error/status mapping, deterministic DB-selection precedence, and required milestone test intents.
