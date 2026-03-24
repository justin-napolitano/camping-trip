# [Draft] Search Ranking And Explorer Hardening

Status: Draft review artifact only. This is not the active execution source-of-truth for any branch.

This ExecPlan is governed by `.agent/PLANS.md`, but remains intentionally incomplete until the repo owners decide how much search-quality work is worth doing now.

## Purpose / Big Picture

Review whether the current browse, search, ranking, and detail experience is trustworthy enough to keep growing, then turn the most important search/explorer gaps into a bounded follow-on slice.

## Progress

- [x] (2026-03-24T00:00:00Z) Draft ExecPlan created from the current explorer/detail implementation.
- [ ] decide whether the primary problem is relevance quality, ranking explainability, explorer UX, or data sparsity
- [ ] define the smallest useful hardening bundle
- [ ] preserve explicit acceptance checks before implementation starts

## Surprises & Discoveries

- the explorer/detail flow already exists, which changes this from greenfield UI work into quality-hardening work
- ranking trust may be limited as much by dataset breadth as by code behavior
- the right next step may be measurement and fixture expansion rather than UI changes alone

## Decision Log

- Decision: keep search hardening separate from general launch-readiness.
  Rationale: relevance, ranking trust, and browse UX can become a large problem family and deserve a bounded slice.
  Date/Author: 2026-03-24 / Codex

## Outcomes & Retrospective

Expected outcome: a narrower follow-on slice that improves user trust in search/explorer behavior without reopening the entire product surface.

## Context and Orientation

Relevant current files include:

- `app/gear/page.js`
- `app/gear/[slug]/page.js`
- `src/api/v1/gear/list-handler.mjs`
- `src/api/v1/gear/detail-handler.mjs`
- `src/db/runtime-repository.mjs`
- `scripts/e2e/run.mjs`

## Plan of Work

1. inspect current ranking inputs and explainability outputs
2. identify the highest-value search/explorer trust gaps
3. decide whether fixes belong in data, ranking logic, API payloads, or UI behavior
4. define acceptance checks tied to those fixes

## Concrete Steps

1. review current gear query defaults, result ordering, and empty-state behavior
2. inspect detail-page evidence density and what is missing for trust
3. review whether location performance and review-summary fields are enough to justify ranking confidence
4. shape one bounded implementation slice from those findings

## Validation and Acceptance

This draft should not be considered complete until it answers:

- what “better search” means in this repo
- whether data coverage or algorithm behavior is the main blocker
- which automated checks will demonstrate meaningful improvement

## Idempotence and Recovery

This is planning-only. If later data coverage changes the shape of the problem, revise this draft before implementation starts.

## Artifacts and Notes

This slice likely depends on stable baseline hardening and may also influence content-ops priorities.

## Interfaces and Dependencies

This slice should probably follow `v8-product-hardening-and-launch-readiness` so search improvements are not evaluated on top of a shaky baseline.
