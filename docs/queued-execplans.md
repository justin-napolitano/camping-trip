# Queued ExecPlans

## Objective

This document is the human-readable mirror of the local remaining-work graph in `artifacts/planner/research/remaining-work-graph.json`.

## Current Queue

1. `v7-work-graph-and-governance-bootstrap`
   - status: `review_gated`
   - goal: turn the new local work graph scaffold into a lightweight planning discipline for this repo without adding provider sync yet
   - execplan: `.agent/execplans/v7-work-graph-and-governance-bootstrap.md`

2. `v8-product-hardening-and-launch-readiness`
   - status: `review_gated`
   - goal: decide what “real enough to operate” means for this site and close the highest-value product hardening gaps
   - execplan: `.agent/execplans/v8-product-hardening-and-launch-readiness.md`

3. `v9-search-ranking-and-explorer-hardening`
   - status: `review_gated`
   - goal: tighten search quality, ranking trust, and explorer/detail UX only after baseline launch-readiness is reviewed
   - execplan: `.agent/execplans/v9-search-ranking-and-explorer-hardening.md`

4. `v10-content-ops-and-affiliate-freshness`
   - status: `review_gated`
   - goal: decide how source ingest, dataset freshness, affiliate coverage, and review operations should work after the current seeded prototype
   - execplan: `.agent/execplans/v10-content-ops-and-affiliate-freshness.md`

## Queue Discipline

- This queue is local-only.
- No GitHub Projects sync is configured from this repo yet.
- A queued ExecPlan is not active just because it is listed here.
- A slice should move from `review_gated` to execution only after human review, explicit branch choice, and current-state revalidation.

## Relationship To The Graph

If this file and `artifacts/planner/research/remaining-work-graph.json` diverge, the JSON graph is authoritative.
