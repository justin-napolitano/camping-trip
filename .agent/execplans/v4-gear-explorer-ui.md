# Execute V4 Gear Explorer UI (T88)

Status: Active branch execution source-of-truth for `feature/gear-explorer-ui`.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This work adds a real browse/discovery UX on top of existing gear APIs so users can move beyond homepage kit cards. After completion, users can search/filter gear, open a gear detail page, inspect location performance, and navigate from homepage kits into those detail views.

## Progress

- [x] (2026-02-28T20:25:00Z) V4 ExecPlan created and AGENTS T88 registration synchronized.
- [ ] (2026-02-28T20:25:00Z) Milestone 1 pending: route/page scaffolding for explorer and gear detail views.
- [ ] (2026-02-28T20:25:00Z) Milestone 2 pending: gear explorer UI wiring to `/api/v1/gear` query/filters.
- [ ] (2026-02-28T20:25:00Z) Milestone 3 pending: gear detail + location performance UI wiring.
- [ ] (2026-02-28T20:25:00Z) Milestone 4 pending: homepage kit-to-gear detail navigation links.
- [ ] (2026-02-28T20:25:00Z) Milestone 5 pending: validation gates and closure evidence sync.

## Surprises & Discoveries

- Observation: current frontend is homepage-first and does not include browse/detail routes for gear exploration.
  Evidence: `app/page.js` is the primary user-facing entry and only renders kits.

- Observation: target APIs already exist and can be consumed without changing contracts.
  Evidence: route handlers for `/api/v1/gear`, `/api/v1/gear/:slug`, and `/api/v1/gear/:slug/locations` are present.

## Decision Log

- Decision: keep V4 focused on UX wiring and route-level integration; avoid contract/schema changes unless strictly required.
  Rationale: minimizes regression risk and keeps T88 scope execution-friendly.
  Date/Author: 2026-02-28 / Codex

- Decision: preserve existing homepage visual language while adding navigation hooks and explorer surfaces.
  Rationale: maintain continuity and avoid unnecessary design churn.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Success means users can discover and inspect gear in-app (list + detail + location performance) and navigate from homepage kit items into detail pages, with all locked test gates passing. Final retrospective will capture any UX gaps and deferred improvements.

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
