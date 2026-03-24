# [Draft] Content Ops And Affiliate Freshness

Status: Draft review artifact only. This is not the active execution source-of-truth for any branch.

This ExecPlan is governed by `.agent/PLANS.md`, but remains intentionally incomplete until the repo owners decide how operator-driven the data pipeline should become.

## Purpose / Big Picture

Define how source ingest, review/content updates, affiliate coverage, and dataset freshness should work after the current seeded prototype so the repo does not stall on static fixtures.

## Progress

- [x] (2026-03-24T00:00:00Z) Draft ExecPlan created from the current source-ingest and affiliate-linking implementation state.
- [ ] decide whether the next priority is more coverage, fresher updates, or safer operator workflows
- [ ] decide how manual versus automated the ingest/update process should be
- [ ] define a bounded implementation slice only after those choices are reviewed

## Surprises & Discoveries

- the repo already has meaningful ingest/runtime pieces, so the next gap is operational policy more than raw feature absence
- affiliate capability exists, but freshness, provenance, and operator workflow expectations are still implied rather than explicit
- content operations may need to stay lightweight if this remains a terminal-first personal workflow

## Decision Log

- Decision: separate ongoing content/affiliate operations from the general product-hardening slice.
  Rationale: the operator model can evolve independently and may not need to block other product work.
  Date/Author: 2026-03-24 / Codex

## Outcomes & Retrospective

Expected outcome: one reviewed operator/data slice that makes freshness and source-handling choices explicit instead of ad hoc.

## Context and Orientation

Relevant current files include:

- `scripts/seed/source-policy-check.mjs`
- `scripts/seed/source-normalize.mjs`
- `scripts/seed/import-db.mjs`
- `data/seed/sources/raw/*`
- `data/seed/sources/normalized/*`
- `src/affiliate/link-builder.mjs`
- `app/api/v1/affiliate/resolve/route.js`

## Plan of Work

1. review the current source/affiliate ingest path end to end
2. decide what operator workflow should exist after fixture-driven growth
3. define freshness/provenance expectations
4. turn the result into one bounded next slice

## Concrete Steps

1. review current source feed fixtures and normalization outputs
2. inspect whether there is enough reporting for repeatable operator use
3. decide whether affiliate/source expansion should be batch-oriented, manual, or semi-automated
4. preserve explicit acceptance checks before implementation starts

## Validation and Acceptance

This draft should not be considered complete until it answers:

- how new source data enters the repo
- what freshness expectations apply to affiliate and review data
- what artifacts prove ingest/update success without relying on memory

## Idempotence and Recovery

This is planning-only. If the repo stays intentionally small, this draft may be reduced rather than expanded.

## Artifacts and Notes

This slice should remain independent from provider sync or external board projection for now.

## Interfaces and Dependencies

This slice likely follows baseline product hardening but can otherwise evolve independently from search/explorer work.
