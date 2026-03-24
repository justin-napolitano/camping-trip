# Remaining Work Graph

## Purpose

This repo now has a local remaining-work graph so future work does not disappear into AGENTS history or chat memory.

## Scope

The graph is intentionally narrow for now:

- local-only planning
- no provider projection
- no GitHub Projects sync
- review-gated draft slices rather than implementation commitments

## Current Model

The canonical artifact is [artifacts/planner/research/remaining-work-graph.json](../artifacts/planner/research/remaining-work-graph.json).

For this repo, the graph currently tracks:

- queue order
- draft ExecPlan identity
- status and gating class
- dependency edges between post-v1 slices
- expected artifacts for each slice

## Next Review Questions

- whether the graph should stay lightweight and manual here
- whether AGENTS should eventually point to the queue/graph explicitly
- whether this repo needs a validator/CLI before more graph complexity is added
