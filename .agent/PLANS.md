# Codex Execution Plans (ExecPlans)

This file defines the required format and execution behavior for all multi-hour implementation work in this repository.

## Trigger Rule

Use an ExecPlan whenever work is complex, spans multiple milestones, or could run for hours. An ExecPlan is required for major features, significant refactors, schema/migration changes, and multi-step integration work.

When implementing an ExecPlan, do not stop to ask for next steps between milestones unless a true blocker is encountered. Continue autonomously milestone by milestone while keeping all living-document sections current.

## How to Use ExecPlans and This File

When authoring an ExecPlan, follow this file exactly and keep the plan self-contained for a novice contributor with only the repository and that single plan file.

When implementing an ExecPlan, continuously update `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` as work proceeds. Do not defer these updates until the end of implementation.

When discussing or revising an ExecPlan, record every meaningful change decision and rationale in the plan `Decision Log`, and append a dated revision note in that plan's change-note section.

## Non-Negotiable Requirements

- Every ExecPlan must be self-contained for a novice contributor.
- Every ExecPlan must be a living document updated at every stopping point.
- Every ExecPlan must describe user-visible outcomes and how to verify them.
- Every term of art must be defined in plain language when first used.
- Every ExecPlan must include complete validation steps and expected outcomes.
- Every ExecPlan must include safe retry/rollback guidance for risky steps.
- Every ExecPlan must keep these sections present and current at all times: `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`.

## Required Sections

Every ExecPlan must include these sections in this order:

1. `# <Short, action-oriented description>`
2. `## Purpose / Big Picture`
3. `## Progress`
4. `## Surprises & Discoveries`
5. `## Decision Log`
6. `## Outcomes & Retrospective`
7. `## Context and Orientation`
8. `## Plan of Work`
9. `## Concrete Steps`
10. `## Validation and Acceptance`
11. `## Idempotence and Recovery`
12. `## Artifacts and Notes`
13. `## Interfaces and Dependencies`

## Progress Rules

- `Progress` must use checkboxes.
- Every entry must include a UTC timestamp.
- Every pause in work must update Progress with done/remaining split if partial.
- For long-running implementation sessions, update `Progress` at least every 45 minutes, even without milestone completion.

## Decision Rules

- Every meaningful design or implementation decision must be recorded in `Decision Log`.
- If course changes, document reason and impact.

## Validation Rules

- Include exact commands with working directory assumptions.
- Include expected outcomes that distinguish pass/fail.
- Prefer behavioral verification over implementation-only statements.

## Safety and Recovery Rules

- Steps must be idempotent where possible.
- For risky operations (migrations, destructive actions), include backup and rollback instructions.

## Formatting Rules

- Write in plain prose.
- Keep sections readable and explicit.
- Prefer prose-first sections; use lists only where they improve clarity.
- Do not use nested triple-backtick code blocks inside ExecPlan markdown files.
- In markdown files where the whole file is the ExecPlan, do not wrap the file in outer triple backticks.

## Repository Policy Integration

- AGENTS.md remains the governance source-of-truth.
- ExecPlans are execution source-of-truth for active multi-hour implementation.
- If AGENTS and ExecPlan conflict, resolve conflict in AGENTS first, then update ExecPlan.
