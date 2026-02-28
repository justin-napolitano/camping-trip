# Execute V6 Affiliate Linking System (T90)

Status: Active branch execution source-of-truth for `feature/affiliate-linking-system`.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This work adds a governed affiliate-linking layer so outbound gear purchase clicks are deterministic, auditable, and safe. After completion, homepage and gear detail purchase links will route through a server-side resolver/redirect path that applies provider rules, validates destination domains, and emits consistent tracking metadata.

## Progress

- [x] (2026-02-28T23:50:00Z) Created V6 ExecPlan and registered it as active in `AGENTS.md` with `T90` workboard entry.
- [x] (2026-03-01T00:12:00Z) Milestone 1 completed: added deterministic affiliate link builder with provider domain rules and fail-closed URL validation in `src/affiliate/link-builder.mjs`.
- [x] (2026-03-01T00:16:00Z) Milestone 2 completed: added `/api/v1/affiliate/resolve` route + handler with redirect success path and contract-compliant error responses for invalid queries/urls.
- [x] (2026-03-01T00:20:00Z) Milestone 3 completed: wired homepage and gear detail purchase links through resolver path using shared UI helper function.
- [x] (2026-03-01T00:30:00Z) Milestone 4 completed: full validation bundle passed and AGENTS/ExecPlan closure synchronization completed.

## Surprises & Discoveries

- Observation: current purchase links are rendered directly from `purchase_url` fields with no centralized affiliate-link policy.
  Evidence: homepage and gear detail UI currently render purchase links directly from endpoint payloads.

- Observation: T89 now provides richer source provenance and source IDs that can be used to drive provider-specific affiliate link rules.
  Evidence: source normalization artifacts include `source_id` and `source_url` metadata.

- Observation: existing Node test harness can validate redirect-path intent without browser automation by asserting generated href prefix and endpoint handler statuses.
  Evidence: updated `scripts/e2e/run.mjs` + `scripts/contract/test-endpoint-handlers.mjs` cover resolver usage and allow/block behavior.

## Decision Log

- Decision: keep affiliate linking as a server-owned resolver/redirect concern rather than client-side URL manipulation.
  Rationale: centralizes safety controls, reduces client drift, and improves auditability.
  Date/Author: 2026-02-28 / Codex

- Decision: enforce approved-domain checks in resolver route and fail closed for any invalid destination.
  Rationale: prevents open redirect behavior and keeps outbound behavior policy-compliant.
  Date/Author: 2026-02-28 / Codex

- Decision: keep successful affiliate resolve responses as HTTP `302` redirect with headers, and reserve JSON bodies for error responses only.
  Rationale: preserves outbound-link user behavior while keeping API error contract strict and machine-readable.
  Date/Author: 2026-03-01 / Codex

## Outcomes & Retrospective

T90 completed. Affiliate linking now runs through a deterministic resolver layer with domain allowlist checks, contract-valid error handling, and UI wiring for homepage + gear detail purchase actions.

Validation evidence:

- `npm run test:homepage-kits`: PASS
- `npm run test:e2e -- --grep "homepage kits"`: PASS
- `npm run test:contract`: PASS
- `npm run contract:validate`: PASS
- `npm run test:unit`: PASS
- `npm run test:integration`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## Context and Orientation

Relevant current components:

- `src/ui/homepage/kits-view.mjs` controls purchase-link visibility behavior in homepage rendering.
- `app/page.js` and `app/gear/[slug]/page.js` display purchase actions.
- `app/api/v1/homepage/kits/route.js` and `app/api/v1/gear/[slug]/route.js` return purchase link fields.
- `src/api/http.mjs` and contract handlers define canonical API error shape behavior.

For T90, "affiliate linking system" means: a deterministic function that takes a canonical product URL and provider context, returns a policy-compliant affiliate URL, and a redirect endpoint that validates/records before redirecting.

## Plan of Work

Milestone 1 introduces an affiliate policy module and URL builder with deterministic provider mapping (for example REI and Backcountry families). The builder must reject unknown providers/domains and malformed URLs.

Milestone 2 introduces a redirect endpoint under `/api/v1/affiliate/resolve` (or equivalent route) that validates inputs, resolves affiliate URL, and returns either a redirect response or contract-compliant error body.

Milestone 3 updates UI link generation for homepage kits and gear detail to use resolver path while preserving existing purchase CTA behavior and no-link fallback rendering.

Milestone 4 runs all locked checks, synchronizes AGENTS and ExecPlan closure sections, and prepares PR evidence.

## Concrete Steps

Run commands from repository root (`/Users/justin/repos/camping-trip`).

Milestone 1:

    npm run test:contract
    npm run lint
    npm run typecheck

Milestone 2:

    npm run test:contract
    npm run contract:validate

Milestone 3:

    npm run test:homepage-kits
    npm run test:e2e -- --grep "homepage kits"
    npm run test:integration

Milestone 4:

    npm run test:homepage-kits
    npm run test:e2e -- --grep "homepage kits"
    npm run test:contract
    npm run contract:validate
    npm run test:unit
    npm run test:integration
    npm run lint
    npm run typecheck

## Validation and Acceptance

T90 is accepted only when all are true:

- affiliate resolver produces deterministic outbound URLs for approved providers.
- untrusted/malformed destination links are rejected with standard error contract shape.
- homepage and gear detail purchase links route through affiliate resolver path.
- no regressions in homepage kits rendering, gear explorer, or detail page data loading.
- AGENTS T90 status and this ExecPlan evidence are synchronized in the same working session.

## Idempotence and Recovery

Affiliate resolver logic must be deterministic and safe to rerun in tests. If resolver wiring causes navigation regressions, rollback UI routing to direct links while preserving policy module code, then reintroduce endpoint wiring incrementally with contract tests.

If provider rules need correction, update provider map in one module and rerun full command bundle before marking progress.

## Artifacts and Notes

Expected closure evidence:

- resolver unit/contract tests showing allow + block cases.
- homepage/e2e evidence showing purchase link path remains functional.
- `contract:validate`, `test:unit`, `test:integration`, `lint`, `typecheck` PASS.

## Interfaces and Dependencies

Planned interfaces:

- `src/affiliate/link-builder.mjs` (new): deterministic resolver and policy checks.
- `app/api/v1/affiliate/resolve/route.js` (new): redirect/resolve endpoint.
- UI consumers:
  - `app/page.js`
  - `app/gear/[slug]/page.js`
  - `src/ui/homepage/kits-view.mjs`

Dependencies:

- must preserve existing API contract guard behavior in `scripts/contract/validate-contracts.sh`.
- any new API endpoint must update `docs/openapi/v1.yaml`, `schemas/`, and contract tests in one change set.

## Change Notes

- 2026-02-28: Created active V6 ExecPlan for T90 affiliate linking system and synchronized AGENTS registration before implementation.
- 2026-03-01: Implemented link builder, resolver endpoint, contract/docs updates, and homepage/detail UI resolver wiring with full gate pass evidence.
