# Execute V4 Gear Explorer UI (T88)

Status: Active branch execution source-of-truth for `feature/gear-explorer-ui`.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This work adds a real browse/discovery UX on top of existing gear APIs so users can move beyond homepage kit cards. After completion, users can search/filter gear, open a gear detail page, inspect location performance, and navigate from homepage kits into those detail views.

## Progress

- [x] (2026-02-28T20:25:00Z) V4 ExecPlan created and AGENTS T88 registration synchronized.
- [x] (2026-02-28T20:40:00Z) Milestone 1 completed: added `/gear` explorer page and `/gear/[slug]` detail page scaffolding.
- [x] (2026-02-28T20:40:00Z) Milestone 2 completed: explorer UI now queries `/api/v1/gear` with filter/query controls and renders paged results.
- [x] (2026-02-28T20:40:00Z) Milestone 3 completed: detail UI now loads `/api/v1/gear/:slug` and `/api/v1/gear/:slug/locations` and renders aggregate/location views.
- [x] (2026-02-28T20:40:00Z) Milestone 4 completed: homepage kit items now include in-app links to gear detail routes and explorer entrypoint link.
- [x] (2026-02-28T20:40:00Z) Milestone 5 completed: validation gates passed (`test:homepage-kits`, `test:e2e -- --grep \"homepage kits\"`, `test:contract`, `test:unit`, `test:integration`, `lint`, `typecheck`).
- [x] (2026-02-28T21:25:00Z) Milestone 6 completed: expanded gear detail endpoint/UI to surface full payload sections (`specs`, `classification`, `review_summary`, `field_tests_recent`, `kit_presence`, `location_summary`) and reran T88 gate bundle.

## Surprises & Discoveries

- Observation: current frontend is homepage-first and does not include browse/detail routes for gear exploration.
  Evidence: `app/page.js` is the primary user-facing entry and only renders kits.

- Observation: target APIs already exist and can be consumed without changing contracts.
  Evidence: route handlers for `/api/v1/gear`, `/api/v1/gear/:slug`, and `/api/v1/gear/:slug/locations` are present.

- Observation: DB-backed homepage kit payloads used UUID-like `gear_item_id` values, which broke direct slug-based detail links.
  Evidence: updated DB repository mapping to return gear slug for `gear_item_id` in homepage kits payload to preserve current contract while enabling links.

- Observation: fallback gear detail handler returned a minimal payload that no longer matched the expanded detail schema.
  Evidence: `src/api/v1/gear/detail-handler.mjs` only returned `aggregated_scores` before Milestone 6.

## Decision Log

- Decision: keep V4 focused on UX wiring and route-level integration; avoid contract/schema changes unless strictly required.
  Rationale: minimizes regression risk and keeps T88 scope execution-friendly.
  Date/Author: 2026-02-28 / Codex

- Decision: preserve existing homepage visual language while adding navigation hooks and explorer surfaces.
  Rationale: maintain continuity and avoid unnecessary design churn.
  Date/Author: 2026-02-28 / Codex

- Decision: keep `gear_item_id` contract field as string but back it with slug in homepage DB payload mapping for navigability.
  Rationale: avoids contract expansion while supporting immediate in-app detail navigation.
  Date/Author: 2026-02-28 / Codex

- Decision: keep expanded detail surfacing under T88 instead of creating a new branch task.
  Rationale: change is a direct extension of the existing gear detail UX scope and uses the same validation gates.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

T88 completed: users can now explore gear via `/gear`, open detail pages under `/gear/[slug]`, inspect location performance, and navigate from homepage kit cards into detail routes. All locked validation gates passed.

Milestone 6 extended T88 to surface full gear-detail information for hostile review workflows. Detail responses and UI now expose structured specs, classification, review/evidence summaries, field tests, kit membership, and strongest/weakest location summaries while preserving prior explorer/location behavior.

Validation evidence:

- `npm run test:homepage-kits`: PASS
- `npm run test:e2e -- --grep "homepage kits"`: PASS
- `npm run test:contract`: PASS
- `npm run test:unit`: PASS
- `npm run test:integration`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run contract:validate`: PASS

## Context and Orientation

Relevant files and modules:

- `app/page.js`: homepage kit rendering.
- `app/styles.css`: global UI styling.
- `app/api/v1/gear/route.js`: gear list API route.
- `app/api/v1/gear/[slug]/route.js`: gear detail API route.
- `app/api/v1/gear/[slug]/locations/route.js`: location performance API route.
- `src/ui/homepage/kits-view.mjs`: helper for outbound purchase URL rendering.

Non-goals for this track:

- no recommendation engine redesign.
- no endpoint contract redesign.
- no broad theme overhaul.

## Plan of Work

Milestone 1 creates explorer/detail page routes and shared client utilities for API calls. Milestone 2 implements list/search/filter controls and result rendering from `/api/v1/gear`. Milestone 3 implements detail + location-performance presentation with clear states. Milestone 4 links homepage kit items into detail routes and ensures empty/error states are user-visible. Milestone 5 runs command gates and synchronizes AGENTS/ExecPlan closure evidence.

## Concrete Steps

Milestone 1 commands:

    npm run test:contract

Milestone 2 commands:

    npm run test:unit

Milestone 3 commands:

    npm run test:integration

Milestone 4 commands:

    npm run test:homepage-kits
    npm run test:e2e -- --grep "homepage kits"

Milestone 5 commands:

    npm run test:homepage-kits
    npm run test:e2e -- --grep "homepage kits"
    npm run test:contract
    npm run test:unit
    npm run test:integration
    npm run lint
    npm run typecheck

## Validation and Acceptance

T88 is accepted only when all are true:

- users can search/filter gear from UI and results are rendered from `/api/v1/gear`.
- users can open a gear detail route and view aggregated scores from `/api/v1/gear/:slug`.
- users can view location performance data from `/api/v1/gear/:slug/locations`.
- homepage kit items provide in-app navigation to gear detail routes.
- homepage kits behavior does not regress.
- command bundle in Milestone 5 passes.
- AGENTS T88 status and ExecPlan progress are synchronized in the same session.

## Idempotence and Recovery

All listed commands are rerunnable. If a milestone fails:

1. Re-run the failing command to verify reproducibility.
2. Record the issue in `Surprises & Discoveries`.
3. Apply smallest in-scope fix.
4. Re-run full milestone command set.

If UI route wiring causes broader breakage, rollback route-level additions while preserving existing homepage behavior, then reintroduce incrementally.

## Artifacts and Notes

Expected evidence snippets at closure:

- `test:homepage-kits: PASS`
- `test:e2e -- --grep "homepage kits": PASS`
- `test:contract: PASS`
- `test:unit: PASS`
- `test:integration: PASS`
- `lint/typecheck: PASS`

## Interfaces and Dependencies

Primary interfaces for this track:

- REST endpoints under `app/api/v1/gear/**`.
- homepage UI module `app/page.js`.
- UI helper `src/ui/homepage/kits-view.mjs`.

UI pages should consume existing response shapes directly and avoid introducing contract drift. Any required endpoint behavior change must be synchronized across `schemas/`, `docs/openapi/v1.yaml`, and `src/contracts/` in the same change set.

## Change Notes

- 2026-02-28: Created active V4 ExecPlan for gear explorer browse/detail UX and synced AGENTS task/command manifest.
- 2026-02-28: Completed T88 implementation and recorded full gate evidence for explorer/detail UI rollout.
- 2026-02-28: Extended T88 detail endpoint/UI coverage to expose full payload sections and updated fallback handler shape to match expanded schema.
