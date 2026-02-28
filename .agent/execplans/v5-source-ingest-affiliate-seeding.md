# Execute V5 Affiliate-Source Seed Expansion (T89)

Status: Active branch execution source-of-truth for `feature/source-ingest-affiliate-seeding`.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is governed by `.agent/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This work expands database seeding so the product has much deeper gear coverage for ranking, filtering, and hostile review. After completion, the repository will support an agentic ingest workflow that can pull affiliate-safe source records, normalize them into canonical seed files, and import them into Postgres with deterministic idempotent behavior and audit-friendly provenance.

## Progress

- [x] (2026-02-28T22:25:00Z) Created V5 ExecPlan and registered it as the active plan path in `AGENTS.md`.
- [x] (2026-02-28T22:25:00Z) Registered `T89` in AGENTS implementation tasks and workboard with locked acceptance commands.
- [ ] Milestone 1: add source-ingest policy module and allowlist guardrails (completed: none; remaining: implement domain/source trust gates and fail-closed behavior).
- [ ] Milestone 2: add adapter/normalization pipeline for affiliate-source records into canonical seed artifacts.
- [ ] Milestone 3: integrate generated artifacts with existing seed validation/import workflow and add provenance reports.
- [ ] Milestone 4: run full T89 command bundle, update AGENTS/ExecPlan closure evidence, and prepare PR.

## Surprises & Discoveries

- Observation: current seed ingestion is file-driven (`data/seed/entities/*.json` and `data/seed/review_intel/review_intel.csv`) with no source adapter layer.
  Evidence: `scripts/seed/import-db.mjs` reads only canonical local files and directly constructs upsert SQL.

- Observation: current seed validation enforces minimum counts and CSV headers but does not validate source provenance metadata.
  Evidence: `scripts/seed/validate.mjs` checks file existence, row count thresholds, and required CSV columns only.

- Observation: canonical contract guardrails already exist and must remain clean of source-staging leakage.
  Evidence: `npm run contract:validate` runs `scripts/contract/check-legacy-leak.sh` before schema/openapi checks.

## Decision Log

- Decision: implement source ingestion as a pre-canonicalization pipeline that writes canonical seed files, not as direct writes to runtime tables.
  Rationale: preserves existing deterministic import path and keeps runtime behavior isolated from source adapters.
  Date/Author: 2026-02-28 / Codex

- Decision: default to feed/API/affiliate-allowed ingestion interfaces and treat uncontrolled HTML scraping as blocked unless explicitly approved in policy.
  Rationale: reduces legal/compliance risk and keeps ingestion stable under source layout drift.
  Date/Author: 2026-02-28 / Codex

- Decision: every normalized record must carry provenance fields (`source`, `source_url`, `fetched_at`, `raw_hash`, `parser_version`) in staging artifacts.
  Rationale: enables auditability, replay debugging, and deterministic de-duplication behavior.
  Date/Author: 2026-02-28 / Codex

## Outcomes & Retrospective

Planning kickoff complete. The branch now has a locked active ExecPlan and AGENTS workboard registration for T89. Implementation and validation evidence are not complete yet.

## Context and Orientation

This repository already seeds Postgres through canonical local files and a deterministic importer:

- `scripts/seed/import-db.mjs` reads canonical seed files and performs transactional upserts.
- `scripts/seed/validate.mjs` enforces baseline seed integrity.
- `scripts/seed/import-test.mjs` and `scripts/seed/report.mjs` enforce FK/quality checks after import.
- `data/seed/entities/*.json` and `data/seed/review_intel/review_intel.csv` are the canonical seed inputs today.

For T89, an "agentic ingest workflow" means a deterministic multi-step pipeline where each step has explicit input/output contracts: discover source records, extract raw fields, normalize to canonical schema-compatible shape, validate constraints, and emit canonical seed artifacts for the existing DB importer.

This plan does not change Phase 1 product scope. It only expands and hardens seed-data acquisition and transformation paths.

## Plan of Work

Milestone 1 defines source policy and guardrails. Add a source policy module that explicitly allowlists approved source IDs/domains and blocks unknown sources. Add strict parsing contracts for adapters so malformed records cannot flow forward.

Milestone 2 adds source adapters and normalization. Implement source adapter modules under a dedicated ingest namespace (for example `src/seed/sources/`) that produce a stable intermediate record schema. Implement normalization logic that maps these records into canonical seed entity fields (gear class mapping, system mapping, numeric coercion, URL normalization, dedupe keys).

Milestone 3 connects generation and import workflows. Add or extend seed scripts so normalized outputs can be generated into canonical seed files in `data/seed/` and then validated/imported through existing commands. Add provenance snapshots and summary reports under `artifacts/import-reports/`.

Milestone 4 performs command-gated closure and governance sync. Run full T89 command bundle, record evidence in this plan, and update AGENTS workboard notes in the same session before marking T89 done.

## Concrete Steps

Run commands from repository root (`/Users/justin/repos/camping-trip`).

Milestone 1 (policy + scaffolding):

    npm run lint
    npm run typecheck

Milestone 2 (adapter + normalization implementation):

    npm run seed:validate
    npm run test:unit

Milestone 3 (pipeline integration + DB import flow):

    npm run seed:import:db
    npm run seed:import:test
    npm run seed:report
    npm run test:integration

Milestone 4 (full closure gates):

    npm run seed:validate
    npm run seed:import:db
    npm run seed:import:test
    npm run seed:report
    npm run test:contract
    npm run contract:validate
    npm run test:unit
    npm run test:integration
    npm run lint
    npm run typecheck

## Validation and Acceptance

T89 is accepted only when all are true:

- source adapter workflow is deterministic and idempotent for repeated ingest runs.
- unknown source/domain input fails closed before canonical artifact emission.
- canonical seed artifacts remain schema-compatible and pass `seed:validate`.
- DB import path succeeds with no FK violations and import reports pass threshold checks.
- runtime contracts remain intact (`test:contract` and `contract:validate` pass).
- AGENTS T89 status and this ExecPlan progress/evidence are synchronized in the same working session.

## Idempotence and Recovery

The ingest workflow must be rerunnable. If normalization output is invalid, delete/rewrite only generated seed artifacts and rerun generation; do not manually edit DB rows to recover. If DB import fails midway, rerun `npm run seed:import:db` after correcting data because importer is transaction-safe and should not leave partial commits.

If a source adapter starts producing malformed data due to upstream changes, disable that source in allowlist policy, keep other sources operational, and record the event in `Surprises & Discoveries` with evidence.

## Artifacts and Notes

Expected closure evidence snippets:

- source-ingest command output showing counts by source and records emitted.
- `seed:validate` PASS.
- `seed:import:test` PASS with no FK violations.
- `seed:report` PASS with report file path.
- `test:contract` and `contract:validate` PASS.

Implementation notes to capture during work:

- exact canonical mapping decisions for ambiguous source fields.
- source-specific data quality failure rates and reject reasons.
- dedupe key behavior when multiple sources provide the same product model.

## Interfaces and Dependencies

Prescriptive interfaces for T89:

- Source policy module (new): a single allowlist/trust map for source IDs/domains and adapter version metadata.
- Source adapters (new): one module per source under a shared interface such as:

    adapter.fetchRecords(input) -> Promise<RawSourceRecord[]>
    adapter.normalize(raw) -> NormalizedSourceRecord

- Normalization/emission layer (new or extended seed script): consumes `NormalizedSourceRecord[]` and emits canonical artifacts consumed by existing importer.
- Existing importer and validators:
  - `scripts/seed/import-db.mjs`
  - `scripts/seed/validate.mjs`
  - `scripts/seed/import-test.mjs`
  - `scripts/seed/report.mjs`

Dependencies and guardrails:

- maintain compatibility with current canonical seed file contracts under `data/seed/`.
- no runtime API handler may import source adapter modules directly.
- preserve contract guard behavior in `scripts/contract/check-legacy-leak.sh`.

## Change Notes

- 2026-02-28: Created active V5 ExecPlan for T89 affiliate-source seed expansion and synchronized AGENTS registration before implementation work.
