# [Superseded] Harden Trip Evaluation Engine and Runtime Contract Path

Status: Superseded by `.agent/execplans/v2-engine-hardening.md` as the active branch execution plan.

## Purpose / Big Picture

This plan closes the hostile-review blockers in the trip evaluation engine and its API runtime path before additional feature work. The goal is to make `POST /api/v1/trips/evaluate` trustworthy, deterministic, and policy-compliant by tightening request validation, enforcing correct field-test semantics, guaranteeing explainability payload coverage for selected items, and removing route-level default-context behavior that can produce misleading approvals/failures. After completion, a reviewer should be able to run a fixed command bundle and confirm policy behavior from request through response.

## Progress

- [x] (2026-02-28T17:50:00Z) Created feature branch `feature/engine-hostile-hardening`.
- [x] (2026-02-28T17:50:00Z) Authored ExecPlan scaffold for hostile-review-driven hardening before code patching.
- [ ] (2026-02-28T17:50:00Z) Milestone 1 pending: tighten request/runtime contract alignment for `TripsEvaluateRequest`.
- [ ] (2026-02-28T17:50:00Z) Milestone 2 pending: harden engine hard-rule semantics (field-test pass gating + deterministic failure mapping).
- [ ] (2026-02-28T17:50:00Z) Milestone 3 pending: enforce explainability completeness per selected item.
- [ ] (2026-02-28T17:50:00Z) Milestone 4 pending: replace route default context with explicit evaluation-input derivation/failure path.
- [ ] (2026-02-28T17:50:00Z) Milestone 5 pending: expand tests and run full acceptance command bundle.
- [ ] (2026-02-28T17:50:00Z) Milestone 6 pending: synchronize AGENTS workboard/notes and final evidence capture.

## Surprises & Discoveries

Initial hostile review found a critical mismatch: route-level `buildEvaluationContext()` currently hardcodes empty/false policy inputs, which can force failures unrelated to selected gear and violates the intended data-backed evaluation path. A second critical gap is that field-test recency currently ignores `passed` state, allowing failed tests to satisfy safety requirements.

## Decision Log

- Decision: Execute hardening in contract -> engine semantics -> route wiring order.
  Rationale: prevents introducing new runtime assumptions before request shape and policy semantics are locked.
  Date/Author: 2026-02-28 / Codex

- Decision: Keep changes scoped to trip-evaluation engine and runtime path only.
  Rationale: user requested hostile-review patch track; avoid cross-cutting refactors unrelated to blockers.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Target outcome is a trip evaluation path that can be hostile-reviewed without ambiguous defaults or contract drift. Retrospective will document which findings were fixed and any deferred items with explicit policy rationale.

## Context and Orientation

Primary files likely affected:

- `src/policy/capability/engine.mjs`
- `src/api/v1/trips/evaluate/handler.mjs`
- `app/api/v1/trips/evaluate/route.js`
- `src/contracts/index.mjs`
- `schemas/TripsEvaluateRequest.schema.json`
- `schemas/TripsEvaluateResponse.schema.json` (if explainability shape changes)
- `scripts/capability/test-rules.mjs`
- `scripts/capability/test-trip-evaluation.mjs`
- `scripts/capability/test-trip-endpoint.mjs`
- (new tests as needed under `scripts/capability/` or `scripts/contract/`)

Policy anchors in `AGENTS.md`:

- Hard block rules and field-testing requirement
- Explainability contract extension
- Contract sync/drift policy
- Runtime request/response validation requirement

## Plan of Work

Milestone 1 locks runtime validator behavior to request schema and rejects malformed/unknown input deterministically. Milestone 2 fixes engine hard-rule semantics, especially field-test pass handling and safety-rule determinism. Milestone 3 ensures explainability is returned for each selected item with exactly top-3 factors. Milestone 4 removes brittle default route context and establishes explicit derived-input behavior (or explicit failure if unavailable). Milestone 5 updates tests to cover route and engine regression surfaces, then runs full command gates. Milestone 6 records evidence and synchronizes AGENTS/ExecPlan status.

## Concrete Steps

Milestone 1 commands:

    npm run test:contract
    npm run test:trip-endpoint

Milestone 2 commands:

    npm run test:capability-rules
    npm run test:trip-evaluation

Milestone 3 commands:

    npm run test:trip-evaluation
    npm run test:trip-endpoint

Milestone 4 commands:

    npm run test:trip-endpoint
    npm run test:contract

Milestone 5 commands (full gate for this track):

    npm run test:capability-rules
    npm run test:trip-evaluation
    npm run test:trip-endpoint
    npm run test:contract
    npm run lint
    npm run typecheck
    npm run test:unit
    npm run test:integration

Milestone 6 commands:

    git status --short
    rg -n "T81|T82|T83|T84|T85|trip evaluation|hostile" AGENTS.md .agent/execplans/engine-hostile-hardening.md

## Validation and Acceptance

Acceptance requires:

- Runtime request validator enforces schema-equivalent shape restrictions (including unknown-field handling and selected-system array type checks).
- Field-test hard rule requires at least one recent passed test (`sleep_overnight` or `stove_cold_start`) for required scenarios.
- Explainability includes all selected items with deterministic top-3 factors and rule trigger arrays.
- Route no longer depends on always-false default policy inputs for production behavior.
- All command bundles above pass.

## Idempotence and Recovery

All test commands are rerunnable and non-destructive. If a milestone fails:

1. Re-run the failed command in isolation.
2. Capture failing output in this plan `Surprises & Discoveries`.
3. Apply smallest corrective patch.
4. Re-run milestone command bundle before moving forward.

If route wiring changes cause broad regressions, roll back only trip-evaluation-specific edits in the branch and reapply in smaller increments.

## Artifacts and Notes

Expected evidence snippets:

- `test:capability-rules: PASS`
- `test:trip-evaluation: PASS`
- `test:trip-endpoint: PASS`
- `test:contract: PASS`
- `lint/typecheck/test:unit/test:integration: PASS`

Track any new/updated test files and exact commands used in final closure notes.

## Interfaces and Dependencies

This work depends on current contract and policy files already in repo. No external services are required for initial hardening. If future route context derivation requires database reads, that dependency must remain explicit and testable, and behavior must degrade safely when required policy records are absent.
