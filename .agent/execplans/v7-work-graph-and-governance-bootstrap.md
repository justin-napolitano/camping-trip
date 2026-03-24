# [Draft] Establish Local Work Graph And Governance Bootstrap

Status: Draft review artifact only. This is not the active execution source-of-truth for any branch.

This ExecPlan is governed by `.agent/PLANS.md`, but remains intentionally incomplete until the repo owners decide how much planning overhead they want here.

## Purpose / Big Picture

Turn the new local remaining-work graph scaffold into a lightweight planning discipline so future work in this repo is not tracked only through AGENTS history, chat context, or memory.

## Progress

- [x] (2026-03-24T00:00:00Z) Draft ExecPlan created and linked to the new local queue/graph scaffold.
- [ ] decide whether AGENTS should explicitly reference the queue and graph
- [ ] decide whether this repo needs a validator/check command for graph drift
- [ ] decide whether future feature branches should register draft ExecPlans in the graph before implementation begins

## Surprises & Discoveries

- the repo already has strong execution evidence in historical ExecPlans, but no single artifact summarizes what is next
- adding a local graph is useful even without provider sync because it forces explicit queue choices
- it is not yet clear whether this repo wants full platform-style governance or only a lighter local version

## Decision Log

- Decision: keep this slice draft-only for now.
  Rationale: the user wants planning continuity without prematurely importing every governance mechanism from the platform repos.
  Date/Author: 2026-03-24 / Codex

## Outcomes & Retrospective

Expected outcome: this repo gains a stable local planning layer that is easy to review and cheap to maintain.

## Context and Orientation

Relevant artifacts already added in this planning pass:

- `artifacts/planner/research/remaining-work-graph.json`
- `docs/queued-execplans.md`
- `docs/remaining-work-graph.md`
- `docs/repo-state-assessment-2026-03-24.md`

The open question is not whether planning artifacts are useful. The open question is how much enforcement is worth carrying in a repo of this size.

## Plan of Work

1. review the local graph shape and queue semantics
2. decide what should remain manual versus validated
3. decide whether AGENTS and future branches should integrate with this graph explicitly
4. keep the result lighter than the platform repo unless a real reason appears to deepen it

## Concrete Steps

1. review the current queue and graph documents for fit and overhead
2. decide whether to add a simple graph-check script later
3. if adopted, update AGENTS with a short pointer to the local queue/graph and draft-plan behavior
4. if rejected, preserve the current scaffold as a lightweight planning index only

## Validation and Acceptance

This draft should not be considered complete until:

- the local queue shape is accepted or simplified
- the repo owners decide whether graph drift checks are necessary
- the relationship between AGENTS, draft ExecPlans, and the graph is explicit

## Idempotence and Recovery

This slice is planning-only. Revisions should overwrite draft assumptions rather than imply that execution has started.

## Artifacts and Notes

Primary artifacts:

- `artifacts/planner/research/remaining-work-graph.json`
- `docs/queued-execplans.md`
- `docs/remaining-work-graph.md`
- `docs/repo-state-assessment-2026-03-24.md`

## Interfaces and Dependencies

This slice should remain local-only for now. It explicitly does not require GitHub Projects sync.
