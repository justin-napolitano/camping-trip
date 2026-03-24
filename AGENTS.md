# AGENTS.md

## Purpose
Define how we collaboratively plan and execute a Phase 1 gear review/intel product.
This file is the operating contract for scope, architecture, data, and decision gates.

## Project Snapshot
- Project: `camping-trip` (gear intelligence)
- Phase: Post-v1 prototype with local planning/governance refresh in progress
- Last updated: 2026-03-24
- Owners: You + Codex

## AI/Codex Operating Role
- Codex role in this project:
  - maintain and enforce this planning contract
  - run hostile reviews to detect ambiguity, risk, and missing controls
  - convert decisions into explicit, auditable policy language
  - implement code only after planning gates are locked
- Codex does not autonomously change project scope without explicit user approval.
- Codex changes must be traceable in this repository and aligned with locked policies in this file.
- Runtime product behavior must not depend on live external AI calls unless explicitly added in a later phase decision.

### Autonomous Execution Mode (v1 Buildout)
- Goal: allow Codex to execute implementation tasks with minimal interruption until v1 completion.
- Codex may proceed autonomously across planned tasks when:
  - changes remain within locked scope/policies
  - tests and validation gates continue to pass
  - no high-risk destructive action is required
- Codex must stop and ask for user input only when:
  - policy conflict is detected
  - destructive migration/reset is required
  - credentials/secrets/external account access are needed
  - test failures indicate ambiguous product behavior requiring decision

### Hostile Review Protocol (Persistent)
- When the user requests a hostile review, Codex must execute this checklist by default without extra prompting:
  - identify subjective language, undefined terminology, and undefined algorithms
  - identify missing enum values, threshold values, formulas, and transition rules
  - identify contradictions between sections, milestones, and workboard tasks
  - identify missing security, reliability, and audit controls that block implementation safety
  - verify canonical runtime/contract paths have no dependency on legacy seed-package artifacts
- Required hostile-review output format:
  - findings first, ordered by severity (`Critical`, `High`, `Medium`)
  - each finding includes exact file reference(s)
  - each finding includes a concrete default policy proposal
- Closure rule:
  - after findings, Codex should offer to patch all unresolved items in one pass
  - if approved, Codex applies patches and re-runs hostile review until no undefined blockers remain

### Implementation Hostile Review Protocol (Persistent)
- When the user requests hostile review for implementation tasks, Codex must evaluate:
  - file-level deliverables per task
  - acceptance criteria and test gates per task
  - dependency order between contract/schema/data/UI work
  - rollback/mitigation paths for each migration-affecting step
  - CI/CD gating completeness before task closure
- Required output for implementation hostile review:
  - findings ranked by severity
  - explicit mapping: `risk -> affected task(s) -> blocking impact`
  - concrete patch proposal to remove ambiguity
- Implementation task closure rule:
  - task stays `Todo` unless all listed deliverables and acceptance criteria are satisfied.

### Autonomous Task Execution Protocol (Persistent)
- For each active task, Codex must perform this loop:
  1. implement smallest complete increment
  2. run required local validation/tests
  3. record evidence (command outputs summarized in work notes/PR body)
  4. only then mark task `Done`
- Long-run autonomy progress cadence:
  - if implementation runs continuously, update ExecPlan `Progress` at least every 45 minutes even without milestone completion
  - each cadence update must include: current milestone, completed evidence, remaining blocker/next command
- Required verification before task close:
  - schema/contract validation
  - lint/type checks
  - automated tests
  - task-specific acceptance checks defined in this file
- If any required check fails, task status remains `In Progress` or `Blocked`.

## Plan Completeness Status
- Phase 1 planning and implementation are complete through `T90`.
- The repo is no longer missing its core v1 product surface; the remaining gap is a lighter post-v1 planning/governance layer for future work.
- Any new scope or policy change must be added via decision log + workboard task before implementation.
- New multi-slice or post-v1 work should be reviewed against the local remaining-work graph and queued draft ExecPlans before execution begins.

## Local Planning Surfaces
- The local remaining-work graph lives at `artifacts/planner/research/remaining-work-graph.json`.
- The human-readable queue mirror lives at `docs/queued-execplans.md`.
- The current repo-state assessment lives at `docs/repo-state-assessment-2026-03-24.md`.
- These planning artifacts are local-only and do not imply any GitHub Projects sync.
- `review_gated` draft ExecPlans are planning artifacts, not active execution authority.
- An ExecPlan becomes execution authority only when a branch intentionally adopts it as the active plan in this file.

## ExecPlans
- For complex features, significant refactors, or any multi-hour implementation effort, Codex must use an ExecPlan maintained in `.agent/PLANS.md` format.
- Active implementation for v1 was driven by:
  - `.agent/execplans/v1-implementation.md`
- Active implementation for prior engine hardening branch was driven by:
  - `.agent/execplans/v2-engine-hardening.md`
- Active implementation for prior DB-seed/runtime-wiring branch was driven by:
  - `.agent/execplans/v3-db-seed-runtime-wiring.md`
- Active implementation for prior gear-explorer branch was driven by:
  - `.agent/execplans/v4-gear-explorer-ui.md`
- Active implementation for prior source-ingest-affiliate-seeding branch was driven by:
  - `.agent/execplans/v5-source-ingest-affiliate-seeding.md`
- Active implementation for current affiliate-linking-system branch must be driven by:
  - `.agent/execplans/v6-affiliate-linking-system.md`
- Historical-plan rule:
  - `.agent/execplans/v1-implementation.md` is retained as closed historical evidence and is not the active execution source-of-truth for new tasks.
  - `.agent/execplans/v2-engine-hardening.md` is retained as completed historical evidence and is not the active execution source-of-truth for new tasks.
  - `.agent/execplans/v3-db-seed-runtime-wiring.md` is retained as completed historical evidence and is not the active execution source-of-truth for new tasks.
  - `.agent/execplans/v4-gear-explorer-ui.md` is retained as completed historical evidence and is not the active execution source-of-truth for new tasks.
  - `.agent/execplans/v5-source-ingest-affiliate-seeding.md` is retained as completed historical evidence and is not the active execution source-of-truth for new tasks.
- ExecPlan usage rules:
  - the ExecPlan is the execution source-of-truth during implementation
  - the ExecPlan must be treated as a living document and updated at every stopping point
  - milestone progress, discoveries, decisions, and outcomes must be recorded in the ExecPlan
  - task completion in this AGENTS workboard requires corresponding ExecPlan evidence updates
  - synchronization rule: whenever an implementation task status changes in AGENTS, update the active ExecPlan `Progress` in the same working session
- Command manifest anti-drift rule:
  - command lists in AGENTS and the active ExecPlan must be identical for active tasks and global test gates
  - if command changes in either file, update the other file in the same session before proceeding
  - if mismatch is discovered during hostile review, task status must be set to `Blocked` until reconciled

### ExecPlan Standard (Anti-Drift, All Branches)
- Precedence rule (authoritative order):
  - `AGENTS.md` defines governance policy and task/workboard truth
  - `.agent/PLANS.md` defines ExecPlan structure/process mechanics
  - active branch ExecPlan file defines implementation execution steps
- Branch registration rule:
  - every feature branch using an ExecPlan must declare one active plan path in this `ExecPlans` section before implementation
  - if active plan changes, update this section in the same session
- Strict tracking gate (locked):
  - implementation code changes are blocked when the active ExecPlan file is untracked in git
  - no feature-branch implementation commit may proceed until the active ExecPlan file and governing plan docs are tracked/committed
  - when this gate is violated, affected implementation tasks must be set to `Blocked` until reconciled
- Plan lifecycle states:
  - `Draft`: plan exists but is not execution source-of-truth
  - `Active`: sole execution source-of-truth for branch/task
  - `Historical Closed`: completed evidence record, not active
  - `Superseded`: replaced by another active plan
- Closure ceremony (required before marking a task `Done`):
  - update plan `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective`
  - record final command evidence summary in the active plan
  - update AGENTS workboard status/notes in same session
  - mark prior active plan as `Historical Closed` or `Superseded` if a successor exists
- Format policy for this repository:
  - follow `.agent/PLANS.md` formatting rules as canonical for repo plans
  - for standalone `.md` ExecPlan files, do not wrap entire file in an outer triple-backtick fence

## Terminology Definitions (v1 Locked)
- `valid gear/class query`: a `GET /api/v1/gear` request that passes query schema validation and includes at least one of `q`, `gear_class`, `system`, or `location`.
- `canonical searchable text vector`: deterministic full-text input built from `gear.name`, `gear_class.name`, system names, normalized alias terms, and non-empty review `pros/cons/use_case`.
- `objective score`: a score computed only from structured numeric/system fields, without direct reviewer rating input.
- `metric_confidence reduced`: fixed downgrade to `0.5` for that metric when fallback-to-reviewer-only is used.
- `valid import file`: file that is within configured size/row limits, parseable, and whose rows fully satisfy schema/enum/constraint validation.

## Phase 1 Scope Lock
- Product type: gear review/intel tool linked to specific locations.
- Primary workflow: search gear item/class -> inspect review intel -> see where it performs best.
- Secondary workflow: query location -> see relevant gear.
- Homepage workflow (v1): show prebuilt "best-for-checklist" gear bundles for common weekend/backpacking contexts with outbound purchase links.
- Systems model is first-class: gear belongs to one or more systems (clothing, sleep, cooking, etc.).
- Out of scope for Phase 1: generalized condition-based recommendation engine detached from location.
- Scope guardrail: weekend/backpacking practical only; no expedition-grade overengineering requirements.

## Success Criteria
- Users can search by gear item and gear class.
- Users can evaluate location-specific performance for gear.
- Gear is organized into systems for practical kit assembly.
- Rankings are explainable and confidence-aware.
- Data quality is protected by strict ingest validation.
- Users can open a homepage list of curated best-fit kits and drill into why each item passed capability checks.

## Capability-Based Engine Standard (v1 Locked)
### Provenance Baseline
- Clothing doctrine reference: ECWCS Gen III layering model (functional levels 1-7).
- Medical threshold reference: WMS hypothermia bands (2019): mild `35-32C`, moderate `32-28C`, severe `<28C`.
- Sleep insulation policy: combined insulation model using pad + bag equivalent R value.
- Stove cold-weather policy: canister constraints at freezing and below.

### Core Principle
- Capability levels are deterministic and computed from evidence fields, never manually self-declared.
- Deterministic > heuristic, evidence-backed > marketing claims, explainable > opaque selection.

### Capability Level Taxonomy (v1)
- Clothing levels: `L1..L7` (ECWCS functional mapping)
- Shelter levels: `S1..S7`
- Sleep levels: `SL1..SL7`
- Cooking levels: `C1..C7`
- Water levels: `W1..W7`
- Navigation/Comms levels: `N1..N7`
- Medical levels: `M1..M7`

### Hard Block Rules (Non-Negotiable, v1)
- Trip recommendation/approval must be blocked when any condition fails:
  - sleep `combined_r` below threshold band
  - `fuel_available` < `fuel_required * 1.3`
  - `expected_low_c <= 0` and canister-only stove without backup or cold-start field test
  - precipitation risk present and no clothing Level 6-equivalent rain shell coverage
  - `expected_low_c < 5` with `static_exposure in {medium, high}` and no clothing Level 7-equivalent static insulation
  - remote trip without navigation redundancy (minimum N3-equivalent capability)
  - no medical policy record present for trip evaluation context

### Sleep Insulation Thresholds (v1)
- `combined_r = pad_rvalue + bag_r_equivalent`
- Band requirements:
  - `expected_low_c >= 10`: `combined_r >= 2.5`
  - `0 <= expected_low_c < 10`: `combined_r >= 3.5`
  - `-6 <= expected_low_c < 0`: `combined_r >= 4.5`
  - `expected_low_c < -6`: `combined_r >= 6.0`

### Trip Severity Index (TSI) Definition (v1)
- Purpose: derive minimum required capability levels by system.
- Deterministic formula:
  - `temp_component = clamp((10 - expected_low_c) / 20, 0, 1)`
  - `wind_component = clamp(wind_mph / 40, 0, 1)`
  - `precip_component = 1.0 if precipitation_risk in {high, wintry} else 0.6 if precipitation_risk = medium else 0.2`
  - `remote_component = 1.0 if remoteness = remote else 0.5 if remoteness = semi_remote else 0.2`
  - `static_component = 1.0 if static_exposure = high else 0.6 if static_exposure = medium else 0.2`
  - `tsi = 0.30*temp_component + 0.20*wind_component + 0.20*precip_component + 0.15*remote_component + 0.15*static_component`
- TSI bands:
  - `0.00-0.29`: low
  - `0.30-0.49`: moderate
  - `0.50-0.69`: high
  - `0.70-1.00`: severe weekend/alpine

### Minimum Capability Requirements by TSI Band (v1)
- low: `S2`, `SL2`, `C2`, `W2`, `N2`, `M1`
- moderate: `S3`, `SL3`, `C3`, `W3`, `N2`, `M2`
- high: `S4`, `SL4`, `C4`, `W3`, `N3`, `M2`
- severe weekend/alpine: `S5`, `SL5`, `C5`, `W4`, `N3`, `M3`

### Clothing ECWCS Evidence Mapping Rules (v1)
- Clothing items cannot manually declare ECWCS level.
- Required evidence fields for computable mapping:
  - `insulation_type`
  - `fill_weight_g`
  - `fill_power` (required when insulation type includes down)
  - `waterproof_mmv`
  - `seam_sealed` (boolean)
  - `breathability_gm2`
- Mapping outputs:
  - `computed_clothing_levels` (array of `L1..L7`)
  - `ecwcs_compliance_confidence` (`low|medium|high`) based on field completeness.

### Explainability Contract Extension (v1)
- For each selected item in trip or homepage recommendations, API must return:
  - `suitability_score`
  - top 3 contributing factors
  - hard-rule triggers (if any)
  - redundancy warnings (if any)

### Field Testing Requirement (v1)
- For trips with `expected_low_c < -6` or `remoteness = remote`, require at least one recent structured field test:
  - overnight sleep validation OR
  - stove cold-start validation
- Field test recency threshold: within previous 180 days.

### Success KPI Targets (v1 Launch Gates)
- Search success rate (non-empty results for valid gear/class queries): >= 90%.
- Ranked-result explainability coverage (responses with factor payload): 100% for ranking endpoints.
- Import success SLO (valid files without validation errors): >= 99%.
- API availability target (excluding planned maintenance): >= 99.5%.
- Data integrity target: 0 foreign-key violations and 0 partial import commits.

## Canonical Data Contract (Phase 1)
### Core Entities
- `GearItem`
- `GearClass`
- `Location`
- `System`
- `ReviewIntel`
- `TripProfile`
- `FieldTestLog`
- `CapabilityPolicy`
- `HomepageKitBundle`

### Required Fields: `GearItem` (v1)
- `id`
- `slug`
- `name`
- `gear_class_id`
- `price_usd`
- `purchase_url` (optional outbound link; no checkout in-app)
- `weight_g`
- `packed_volume_l` (nullable only for non-packable gear classes)
- `packability_mode` enum: `portable_volume_based | portable_weight_only | non_packable`
- `insulation_type` (nullable for non-insulation classes)
- `fill_weight_g` (nullable)
- `fill_power` (nullable; required when down insulation is present)
- `waterproof_mmv` (nullable)
- `seam_sealed` (nullable boolean)
- `breathability_gm2` (nullable)
- `features_present` (required canonical feature-key array; may be empty for classes with no required features)
- `created_at`
- `updated_at`

### Required Fields: `GearClass` (v1)
- `id`
- `slug`
- `name`
- `required_features` (required canonical feature-key array; may be empty)
- `created_at`
- `updated_at`

### Identity Rules
- Each core entity uses `id` (UUID) as primary key.
- Each core entity must have a unique `slug`.
- Human-readable names are not primary keys.

### `ReviewIntel` Required Fields
- `gear_item_id`
- `gear_class_id`
- `location_id`
- `system_ids`
- `author_id`
- `review_date`
- `source_type`
- `source_url` (optional when internally authored)
- `rating`
- `conditions_observed`
- `durability`
- `value`
- `packability`
- `usage_cycles_observed` (nullable)
- `usage_runtime_hours` (nullable)
- `failure_event_count` (nullable)
- `repair_event_count` (nullable)
- `pros`
- `cons`
- `use_case`
- `created_at`
- `updated_at`
- `version`

### Required Fields: `TripProfile` (v1)
- `id`
- `location_id`
- `trip_type` enum: `weekend_backpacking | day_climb_car_camp | alpine_weekend`
- `expected_low_c`
- `wind_mph`
- `precipitation_risk` enum: `low | medium | high | wintry`
- `remoteness` enum: `frontcountry | semi_remote | remote`
- `static_exposure` enum: `low | medium | high`
- `precipitation_expected` (boolean)
- `created_at`
- `updated_at`

### Required Fields: `FieldTestLog` (v1)
- `id`
- `gear_item_id`
- `test_type` enum: `sleep_overnight | stove_cold_start`
- `test_date`
- `expected_low_c`
- `passed` (boolean)
- `notes`
- `created_by`
- `created_at`

### Required Fields: `CapabilityPolicy` (v1)
- `id`
- `policy_version`
- `medical_mild_min_c` (=35)
- `medical_mild_max_c` (=32)
- `medical_moderate_min_c` (=32)
- `medical_moderate_max_c` (=28)
- `medical_severe_lt_c` (=28)
- `sleep_r_thresholds_json` (locked threshold map)
- `fuel_buffer_multiplier` (=1.3)
- `field_test_recency_days` (=180)
- `created_at`
- `updated_at`

### Data Rules
- Gear can belong to multiple systems.
- Ratings are location-contextual.
- No partial writes on invalid ingest records.
- Review provenance/version fields are mandatory for trusted ranking and auditability.
- Delete semantics (v1): soft delete only with `deleted_at` and `deleted_by`.
- Referential integrity policy (v1): enforce foreign keys with `RESTRICT` on hard dependencies.
- Relationship lifecycle policy: use app-layer soft-delete handling; do not cascade hard deletes.
- `source_type` enum (v1): `internal_admin`, `field_note`, `third_party_review`, `manufacturer_spec`.
- `source_url` is required when `source_type` is `third_party_review` or `manufacturer_spec`.
- `medical_policy` must exist and be versioned before trip approval/recommendation endpoints can return `approved=true`.
- ECWCS clothing level claims are computed from evidence fields; direct manual level assignment is rejected at validation.

### Database Index Baseline (v1 Locked)
- Unique indexes:
  - `gear.slug`
  - `gear_class.slug`
  - `location.slug`
  - `system.slug`
- Foreign-key indexes:
  - all FK columns in `review_intel` and mapping tables
- Ranking/query indexes:
  - `(gear_item_id, updated_at DESC)`
  - `(location_id, updated_at DESC)`
  - `(composite_score DESC, confidence_score DESC)`
- Idempotency uniqueness index:
  - unique `(gear_item_id, location_id, review_date, author_id, source_type)`
- Search indexes:
  - full-text `GIN` index on canonical searchable text vector
  - trigram `GIN` index on gear name/model fields

## System Taxonomy Governance (v1)
- Only admins with `admin:curation` may create, merge, rename, or deprecate `System` records.
- `System` names must be unique (case-insensitive) and slug-backed.
- Deprecated systems are soft-deprecated (`deprecated_at`, `deprecated_by`) and remain resolvable for historical records.
- System alias mapping is allowed; aliases resolve to a canonical system id.
- Merge operations must preserve audit log trace with before/after mappings.

## Location Model Standard (v1)
- `Location` granularity is place-centric and canonicalized to a specific destination area (e.g., crag, park, campsite zone).
- Required location fields:
  - `name`
  - `slug`
  - `country_code`
  - `region_code` (required for countries with first-level subdivision data in source, else nullable)
  - `latitude`
  - `longitude`
- Optional hierarchy fields:
  - `parent_location_id`
  - `location_type` (`crag`, `park`, `campground`, `region`, `other`)
- Distance/proximity logic in Phase 1 uses canonical lat/long; no generalized geofencing engine in v1.

## Scoring, Ranking, and Confidence
### Field Scales
- `rating`, `durability`, `value`, `packability`: integer 1-5
- Anchors: `1` poor, `2` below average, `3` acceptable, `4` strong, `5` excellent

### Composite Score
- `composite_score = 0.40*rating + 0.25*durability_final + 0.20*value_final + 0.15*packability_final`

### Objective Metric Framework (v1 Locked)
- Principle: `durability`, `value`, and `packability` are hybrid scores:
  - objective score from structured gear data
  - reviewer-adjusted score from field observation
- Class normalization rule:
  - objective scores are normalized within `GearClass` (not across all gear)
  - normalized scale maps to 1.0-5.0 before blending
- Deterministic normalization algorithm (v1 locked):
  - compute ascending percentile rank inside each `GearClass` cohort:
    - `pct = (rank_index) / max(1, cohort_size - 1)` where `rank_index` is 0-based
  - map to score:
    - higher-is-better metric: `score_obj = 1.0 + 4.0*pct`
    - lower-is-better metric: `score_obj = 1.0 + 4.0*(1.0 - pct)`
  - ties are broken deterministically by `GearItem.id` ascending before rank assignment
- Objective score bounds:
  - all objective metric scores are clamped to `[1.0, 5.0]` after normalization

### Packability Scoring (v1)
- Objective inputs:
  - `weight_g`
  - `packed_volume_l` (required when `packability_mode = portable_volume_based`)
- Objective scoring basis:
  - lower weight and lower packed volume rank better within class
- Final score:
  - `packability_final = 0.70*packability_score_obj + 0.30*packability_reviewer`
- Non-packable class rule:
  - if `packability_mode = portable_weight_only`, objective uses weight-only normalization.
  - if `packability_mode = non_packable`, packability objective is fixed to class baseline score `3.0`.

### Value Scoring (v1)
- Objective inputs:
  - `price_usd`
  - `utility_score_obj` (derived from baseline objective metrics in class context)
- Objective scoring basis:
  - `value_index = utility_score_obj / price_usd` then class-normalized to 1.0-5.0
- Final score:
  - `value_final = 0.70*value_score_obj + 0.30*value_reviewer`
- Utility formula (v1):
  - `utility_score_obj = 0.50*durability_score_obj + 0.30*packability_score_obj + 0.20*feature_coverage_score_obj`
  - `feature_coverage_score_obj` definition:
    - let `required_features_total` come from `GearClass.required_features`
    - let `required_features_present` be count of required features present on `GearItem`
    - coverage ratio = `required_features_present / required_features_total`
    - mapped to score `1.0 + 4.0*coverage_ratio` (clamped to `[1.0, 5.0]`)

### Durability Scoring (v1)
- Objective inputs:
  - `usage_cycles_observed` (or runtime/hours when cycles are not applicable)
  - `failure_event_count`
  - `repair_event_count` (nullable; defaults to `0` when unknown in v1 objective fallback)
- Objective scoring basis:
  - higher cycles/runtime and lower failure/repair rates rank better within class
- Final score:
  - `durability_final = 0.60*durability_score_obj + 0.40*durability_reviewer`

### Fallback Rules for Missing Objective Data (v1)
- If required objective inputs are missing for a metric:
  - use reviewer score only for that metric
  - set `metric_confidence = 0.5` for that metric
  - include missing-input reason in explainability payload
- Objective field completeness is tracked and reported in admin QA views.
- Durability partial-data rule:
  - if `repair_event_count` is missing but other durability inputs exist, compute durability objective with `repair_event_count=0` and set `metric_confidence=0.8`.

### Objective Evidence Field Requirements (v1 Locked)
- `GearClass.required_features`: required array of canonical feature keys for that class (`string[]`, unique per class).
- `GearItem.features_present`: required array of canonical feature keys present on item (`string[]`, deduplicated).
- `ReviewIntel.usage_cycles_observed`: nullable numeric, required for durability objective when cycles are applicable.
- `ReviewIntel.usage_runtime_hours`: nullable numeric alternative when cycles are not applicable.
- `ReviewIntel.failure_event_count`: nullable integer, required for durability objective unless reviewer-only fallback is used.
- `ReviewIntel.repair_event_count`: nullable integer, defaults to `0` in partial-data fallback path.
- Validation rule: at least one of `usage_cycles_observed` or `usage_runtime_hours` must be present to compute durability objective.

### Ranking Order (v1)
- Order of precedence: admin curation/pinning -> composite score -> confidence.
- Do not use raw averages alone for ranking.
- Tie-breakers after confidence: higher `review_count`, then newer `updated_at`.

### Curation Governance (v1)
- Manual curation limit: max 3 pinned items per ranking context (query + filter set).
- Every curation action requires a human-readable rationale.
- Curation entries store `created_by`, `created_at`, and optional `expires_at`.
- Default curation expiry: 30 days unless renewed.
- Expired curation entries are automatically excluded from ranking.
- Curation context key (deterministic): `context_key = hash(normalized_query + normalized_filters + sort_mode + route_id)`.
- Normalization rules for context inputs:
  - trim whitespace and lowercase query text
  - collapse repeated whitespace
  - sort filter keys lexicographically
  - sort multi-value filter arrays lexicographically
  - exclude pagination params (`page`, `limit`)
  - include route id and normalized sort mode

### Confidence Model (v1)
- `confidence_score = 0.50*sample_size_score + 0.30*reviewer_trust_score + 0.20*evidence_quality_score`
- Confidence is displayed with ranking outputs.
- V1 reviewer trust baseline: `reviewer_trust_score = 1.0` for admin reviewers.
- Normalization rule rollout trigger (post-v1):
  - normalization changes are allowed only after both conditions are met:
    - at least 500 `ReviewIntel` rows in production
    - at least 3 distinct production `Location` records
  - each normalization change requires a versioned decision-log entry and migration-safe rollout plan.
- Extensibility requirement: store raw inputs and derived scores separately so normalization logic can change without destructive data migrations.
- Sample-size ramp policy (v1): balanced growth curve.
- Sample-size score function (v1 balanced): `sample_size_score = min(1.0, ln(1 + review_count) / ln(1 + 20))`.
- Evidence-quality rubric (v1): 3-level mapping
  - `low = 0.3`
  - `medium = 0.6`
  - `high = 1.0`
- Weak evidence policy (v1): review is allowed, but evidence quality is capped at `low` when supporting detail is thin.
- Thin-evidence threshold (v1): evidence is thin if fewer than 2 of these are present:
  - `conditions_observed` length >= 40 characters
  - at least one non-empty `pros` or `cons` entry
  - at least one media attachment or external evidence URL

## Auditability and Explainability Requirements
- Persist raw scoring inputs and derived fields separately.
- Persist ranking trace fields per record:
  - `curation_rank`
  - `composite_score`
  - `confidence_score`
  - `review_count`
  - `updated_at`
- Return explainability payloads in API responses for ranked results, including:
  - ranking factors used
  - factor values
  - final ordered tie-break path
  - objective vs reviewer contribution per hybrid metric
  - missing-objective-data fallback flags
- Maintain immutable change history for score-affecting edits (`who`, `when`, `what changed`).
- Require human-readable rationale in admin tooling for manual curation/pinning actions.
- Immutable history storage model (v1):
  - append-only audit log table
  - no in-place edits/deletes of audit events
  - each event stores actor, timestamp, entity type/id, and before/after diff summary

## Reviewer Trust and Moderation
### Reviewer Roles
- Active in v1: `admin` only.
- Scaffolded but hidden: `trusted`, `community`.

### Admin Authorization Scopes (v1)
- `admin:curation` for pin/unpin and curation expiry actions.
- `admin:import` for JSON/CSV import endpoints.
- `admin:review_write` for creating/updating `ReviewIntel`.
- `admin:media_write` for media upload URL issuance and finalize operations.
- `admin:moderation` for hide/quarantine/restore moderation actions.

### Moderation Rollout
- Active in v1: minimal moderation metadata (`moderation_status`, `moderation_notes`, `reviewed_by`, `reviewed_at`).
- Scaffolded for later: moderation queue, approve/reject flow, immutable audit trail.

### Moderation State Model (v1)
- Allowed statuses: `visible`, `flagged`, `hidden`, `quarantined`.
- Allowed transitions:
  - `visible -> flagged`
  - `flagged -> visible`
  - `flagged -> hidden`
  - `hidden -> visible`
  - `any -> quarantined` (security/integrity event)
  - `quarantined -> hidden` or `quarantined -> visible` (admin decision)
- Every transition requires `reviewed_by`, `reviewed_at`, and optional `moderation_notes`.

## Sponsorship Policy
- Phase 1: policy/schema support only; no active sponsored placements.
- Future sponsored entries must be explicitly labeled `Sponsored`.
- Sponsored and organic ranking paths must remain separable and auditable.

## Technical Architecture (Phase 1)
- App: `Next.js`
- API: `Next.js Route Handlers` (REST)
- API versioning: path-based from start (`/api/v1/...`)
- DB: `Postgres`
- ORM/migrations: `Prisma` + `Prisma Migrate`
- Auth: `NextAuth`
- Search: Postgres full-text search
- Hosting: `Vercel`
- Environments: `local`, `preview`, `production`

## Security and Session Baseline (v1)
- Admin authentication uses NextAuth with enforced secure session cookies.
- Session cookie requirements:
  - `HttpOnly=true`
  - `Secure=true`
  - `SameSite=Lax` (or stricter)
- Session TTL: 12 hours max age, rolling refresh allowed.
- Admin accounts require MFA before production write access is granted.
- Admin account recovery requires dual-admin verification.
- Production secrets rotation baseline: every 90 days or immediate rotation after suspected compromise.

## Search Quality Baseline (v1)
- Use Postgres full-text stemming for primary indexing/search.
- Add trigram similarity fallback for typo tolerance.
- Maintain alias/synonym mapping for gear model/name variants.
- Include match highlights/snippets for query-driven search responses (`q` present); optional when no `q` is provided.

## API Baseline (v1 Locked)
- Minimal endpoint set is locked before implementation so schema/UI can proceed in parallel.
- Endpoint details (request/response contracts) are an implementation task tracked in T12.
- Auth matrix default (locked): all `GET` endpoints are public read, all `POST` endpoints are admin-only.
- List query defaults (locked):
  - `page=1`
  - `limit=20` (max `100`)
  - default sort: `composite_score desc`, then `confidence desc`

### Concrete Endpoint List (v1 Locked)
- `GET /api/v1/gear` (search/list with filters and pagination)
- `GET /api/v1/gear/:slug` (gear detail + aggregated scores)
- `GET /api/v1/gear/:slug/locations` (location performance view)
- `GET /api/v1/homepage/kits` (best-fit weekend/backpacking bundles)
- `GET /api/v1/locations` (location list/search)
- `GET /api/v1/systems` (system list)
- `POST /api/v1/trips/evaluate` (deterministic capability + hard-rule evaluation)
- `POST /api/v1/review-intel` (admin create)
- `POST /api/v1/import/review-intel` (admin CSV import)
- `POST /api/v1/import/entities` (admin JSON import)
- `POST /api/v1/media/upload-url` (admin signed upload URL)
- `POST /api/v1/media/complete` (admin finalize media metadata)

### Endpoint Query Contract: `GET /api/v1/gear` (v1 Locked)
- `q` (string, optional, max 120 chars)
- `gear_class` (slug, optional)
- `system` (slug, optional, multi-value)
- `location` (slug, optional, multi-value)
- `sort` enum: `relevance | composite | confidence | updated_at`
- `order` enum: `asc | desc`
- `page` integer >= 1
- `limit` integer 1..100
- Unknown query params are rejected with `400`.

### Endpoint Contract: `POST /api/v1/trips/evaluate` (v1 Locked)
- Request includes:
  - `trip_profile` object with all required `TripProfile` fields
  - selected gear ids grouped by system
- Response includes:
  - `approved` boolean
  - `tsi` numeric score and `tsi_band`
  - `required_min_levels` per system
  - `hard_rule_failures` array (empty when approved)
  - `selected_items_explainability` with `suitability_score`, top 3 factors, triggered rules, redundancy warnings

### Endpoint Contract: `GET /api/v1/homepage/kits` (v1 Locked)
- Returns curated kits optimized for weekend practicality.
- Each kit item must include:
  - `gear_item_id`, `name`, `system`, `suitability_score`
  - top 3 contributing factors
  - pass/fail summary for hard rules
  - optional `purchase_url`

### API Error Contract (v1)
- Standard error response fields:
  - `error_code`
  - `message`
  - `details` (optional structured object/array)
  - `request_id`
- Status code policy:
  - `400` bad request
  - `401` unauthenticated
  - `403` unauthorized
  - `404` not found
  - `409` conflict (including optimistic concurrency mismatch)
  - `422` validation failure
  - `429` rate limited
  - `500` internal error

### API Contract Standard (v1)
- Contract layering model (locked):
  - `schemas/*.schema.json` is source-of-truth for payload/domain structure.
  - `docs/openapi/v1.yaml` is source-of-truth for HTTP behavior (routes, methods, params, auth, status codes, examples).
  - `src/contracts/` is runtime enforcement layer; validators are generated from or strictly aligned to `schemas/`.
- Legacy seed-package governance:
  - `capability-engine-seed-final/` is reference material only and must not be treated as canonical runtime contract source.
  - If any seed schema or mapping conflicts with this file, this file and root `schemas/`/OpenAPI/runtime contracts take precedence.
- OpenAPI must reference schema-backed request/response models for locked endpoints.
- Runtime request/response schema validation is required in handlers.
- Contract changes require versioned updates and review before merge.

### Contract Sync and Drift Policy (v1)
- Any contract change is complete only when all three layers are updated in the same change set:
  - `schemas/`
  - `docs/openapi/v1.yaml`
  - `src/contracts/`
- Drift classes:
  - schema drift: schema fields/types/enums mismatch runtime validators
  - API drift: endpoint behavior in handler differs from OpenAPI
  - example drift: OpenAPI examples violate schema
- PRs with contract drift must be blocked until reconciliation.

### API Contract Completion Definition (v1)
- Endpoint contract work is complete only when all locked endpoints have:
  - schema files in `schemas/` for every request/response model used by endpoint contracts
  - OpenAPI path + method entries
  - request schema (params/query/body)
  - response schemas for success and error paths
  - at least one concrete example payload per status path
  - auth scope annotation
- Contract CI must fail on undocumented endpoints, schema drift, API drift, or example drift.

### Rate Limiting Baseline (v1)
- Public read endpoints (`GET`):
  - default limit: 120 requests/min per IP
  - stricter search limit (`GET /api/v1/gear`): 60 requests/min per IP
- Admin write/import/media endpoints (`POST`):
  - default limit: 30 requests/min per authenticated admin
  - import endpoints: 5 requests/min per authenticated admin
- Rate-limit identity policy:
  - authenticated requests: by user id
  - unauthenticated requests: by IP

## Data Ingestion and Integrations
### Input Modes (v1)
- Admin web editing
- Structured imports

### Canonical Import Split
- `JSON`: entities (`GearItem`, `GearClass`, `Location`, `System`)
- `CSV`: bulk `ReviewIntel`

### Validation
- Strict schema gate: invalid records are rejected.
- Reject response format (locked): JSON error report with `row_number`, `field`, `error_code`, `message`.
- Import idempotency (locked):
  - entities upsert by unique `slug`
  - `ReviewIntel` upsert by canonical composite key (`gear_item_id`, `location_id`, `review_date`, `author_id`, `source_type`)
- Transaction policy (v1):
  - imports run as all-or-nothing transactions per import job
  - any validation/write failure rolls back the full job
  - partial commits are not allowed
- Import operational limits (v1):
  - max file size: 10MB
  - max rows per import: 5,000
  - job timeout: 120 seconds
  - automatic retries: disabled (operator-triggered retry only)

### Integration Extensibility
- Adapter fields reserved: `source_connector`, `source_record_id`, `sync_state`, `last_synced_at`
- Notion integration: planned, scaffolded, disabled in Phase 1.

## Seed Dataset Quality Gate (v1)
- Minimum entity coverage:
  - `Location >= 1` (Sand Rock acceptable for initial launch gate)
  - `GearItem >= 25`
  - `GearClass >= 6`
  - `System >= 3`
- Minimum review coverage:
  - `ReviewIntel >= 100`
  - each `GearItem` has at least 2 `ReviewIntel` rows
  - at least 80% of `ReviewIntel` rows have evidence quality `medium` or `high`
- Data quality conditions:
  - zero import validation errors for accepted seed files
  - zero FK violations
- Expansion rule:
  - additional locations are Phase 1.1+ growth objective, not a v1 launch blocker.

## Media and Evidence Pipeline
- Full pipeline included in v1.
- Media is optional per review record.
- Storage provider: `Google Cloud Storage` with signed URLs.
- Keep a storage adapter abstraction for provider portability.
- V1 media security baseline:
  - allowed types: `image/jpeg`, `image/png`, `image/webp`
  - max size: 10MB per file
  - upload requires authenticated admin session
  - malware/virus scanning queued before final publish
  - media remains hidden until scan passes; failed scans are automatically quarantined

## Migration and Release Controls
- All schema changes versioned through Prisma migrations.
- Production migration policy:
  - forward-only migrations in production
  - destructive migration allowed only with explicit dual-admin approval and backup verification
- Required deployment gate: preview migration success before production deploy.
- Required deployment gate: API contract tests and integration tests must pass in preview before production deploy.
- Ansible may orchestrate deployment tasks; it is not schema source-of-truth.
- Backup policy (v1): daily Postgres snapshots.
- Restore policy (v1): run at least one pre-launch restore drill and document restore steps.
- Snapshot retention (v1): 30-day rolling window.
- Backup encryption (v1): encrypted at rest and in transit.
- Recovery targets (v1): RPO <= 24 hours, RTO <= 4 hours.
- Destructive migration approval requirements:
  - approvers: two admins with `admin:curation` scope
  - preconditions: successful snapshot within previous 2 hours + restore test evidence within previous 7 days
  - required record: approval rationale logged in decision log and deployment record

### CI Blocking Jobs (v1)
- `contract:validate` (OpenAPI + schema drift checks)
- `db:migration:check` (clean apply in ephemeral DB)
- `test:integration`
- `test:unit`
- `lint`
- `typecheck`
- Merge/deploy is blocked if any required job fails.

## Data Retention and Cleanup Policy (v1)
- Soft-deleted records are retained for 180 days, then eligible for archival/purge.
- Quarantined media retained for 30 days, then purged unless explicitly restored.
- Failed/aborted import artifacts retained for 30 days for audit/debug purposes.

## Concurrency and Versioning Policy (v1)
- Admin writes must use optimistic concurrency checks based on `version`.
- Update requests must include expected `version`.
- If expected version does not match current version, return `409`.
- Successful updates increment `version`.

## Observability and Reliability Baseline (v1)
- Required metrics:
  - API p95 latency
  - API error rate by endpoint/status
  - import job success/failure rate
  - media scan queue outcomes
- Initial service targets:
  - core read endpoint p95 latency < 500ms
  - non-4xx API error rate < 1%
- Alerting requirements:
  - alert on sustained 5xx spike, migration failure, or backup failure
  - include `request_id` in logs for end-to-end traceability
- Sustained 5xx spike definition (v1):
  - 5xx error rate > 2% for 5 consecutive minutes on any core endpoint.

## Milestones
1. Complete blueprint and lock all Phase 1 planning decisions.
2. Define concrete DB schema + migration plan.
3. Finalize OpenAPI contracts and runtime validation for locked endpoints.
4. Build first validated dataset slice (Sand Rock).
5. Implement v1 UI surface (search, gear detail, location performance, homepage kits).
6. Ship preview deploy and validate end-to-end flow.
7. Implement deterministic capability-policy runtime (T81) and pass hard-rule/TSI tests.
8. Implement homepage kits endpoint/UI integration (T82) with explainability and e2e validation.

## Implementation Execution Spec (T10-T13, T11)
### T0.5: Repo Bootstrap Readiness Gate (Required Before T12)
- Required deliverables:
  - `package.json` with all acceptance-gate scripts declared
  - root `schemas/` directory initialized for canonical contract files
  - `docs/openapi/v1.yaml` scaffold created
  - `src/contracts/` scaffold created
  - `prisma/` scaffold created
  - bootstrap scripts created: `scripts/bootstrap.sh`, `scripts/validate_env.sh`, `scripts/seed_local.sh`
- Acceptance criteria:
  - all required paths exist and are committed
  - command help checks run without missing-script errors for:
    - `npm run lint -- --help`
    - `npm run typecheck -- --help`
    - `npm run test:unit -- --help`
    - `npm run test:integration -- --help`
    - `npm run contract:validate -- --help`
    - `npm run db:migrate:check -- --help`
    - `npm run seed:validate -- --help`
  - local verification commands succeed:
    - `test -f package.json`
    - `test -d schemas`
    - `test -f docs/openapi/v1.yaml`
    - `test -d src/contracts`
    - `test -d prisma`
    - `test -f scripts/bootstrap.sh`
    - `test -f scripts/validate_env.sh`
    - `test -f scripts/seed_local.sh`

### T12: API Contracts and Runtime Validation
- Required deliverables:
  - schema source files committed under `schemas/`
  - OpenAPI spec file committed at `docs/openapi/v1.yaml`
  - endpoint schema sources committed under `src/contracts/`
  - handler-level request/response validation integrated for all locked endpoints
- Acceptance criteria:
  - every locked endpoint request/response model maps to a schema file in `schemas/`
  - all locked endpoints documented with examples and error schemas
  - `POST /api/v1/trips/evaluate` contract includes deterministic TSI/hard-rule outputs
  - `GET /api/v1/homepage/kits` contract includes explainability and optional purchase links
  - no schema/OpenAPI/runtime contract drift
  - CI fails on undocumented endpoint, schema drift, API drift, or example drift
  - contract validation test suite passes
  - local verification commands succeed:
    - `npm run contract:validate`
    - `npm run test:contract`

### T13: Prisma Schema and Initial Migration
- Required deliverables:
  - Prisma schema committed at `prisma/schema.prisma`
  - initial migration committed under `prisma/migrations/`
  - index and constraint definitions matching locked policy set
  - schema includes `TripProfile`, `FieldTestLog`, `CapabilityPolicy`, and `HomepageKitBundle` models
  - schema includes enums for capability levels and trip context fields
  - deterministic database bring-up script committed at `scripts/db/up.sh`
- Acceptance criteria:
  - migration applies successfully on clean database
  - migration applies successfully in preview environment
  - no FK/index policy drift from AGENTS.md
  - hard-rule prerequisite schema constraints present (including policy-presence and required evidence fields)
  - database command scripts execute real DB operations (no metadata-only placeholder pass paths)
  - `db:migrate:preview-check` returns failure when live apply fails and pass only after successful live apply
  - local verification commands succeed:
    - `npm run db:up`
    - `npm run db:migrate:reset-test`
    - `npm run db:migrate:check`
    - `npm run db:migrate:preview-check` (requires preview-like DB URL env)
  - rollback command availability verified:
    - `npm run db:backup:create`
    - `npm run db:restore:dry-run`
  - rollback runbook evidence recorded:
    - rollback/restore dry run executed in preview-like env
    - output summary captured in implementation notes

### T11: Seed Dataset Build and Validation
- Required deliverables:
  - seed entity JSON files under `data/seed/entities/`
  - seed review CSV files under `data/seed/review_intel/`
  - import report artifacts under `artifacts/import-reports/`
  - Sand Rock trip-profile seed and at least one valid capability-policy seed
  - at least one field test log row satisfying recency rule for cold/remote scenarios in test data
- Acceptance criteria:
  - seed dataset meets all quality gate thresholds
  - zero validation errors for accepted seed files
  - zero FK violations after import
  - evidence coverage threshold met
  - capability hard-rule evaluation test fixtures pass deterministically
  - local verification commands succeed:
    - `npm run seed:validate`
    - `npm run seed:import:test`
    - `npm run seed:report`

### T10: Integration Scaffolding (Notion Disabled)
- Required deliverables:
  - integration adapter interface under `src/integrations/adapter.ts`
  - disabled Notion adapter stub under `src/integrations/notion/`
  - feature flag wiring proving provider is scaffolded but inactive
- Acceptance criteria:
  - adapter compile/runtime checks pass
  - Notion adapter cannot activate without explicit flag + config
  - required proof artifact:
    - disabled-provider test/report saved under `artifacts/integration-reports/`
  - local verification commands succeed:
    - `npm run integration:check`
    - `npm run test:integration-adapters`

### T81: Capability Policy Implementation
- Required deliverables:
  - deterministic policy module for TSI and hard-rule evaluation under `src/policy/capability/`
  - runtime wiring for trip evaluation endpoint using locked policy fields
  - explainability payload builder for hard-rule and redundancy outputs
- Acceptance criteria:
  - all non-negotiable hard rules enforced with deterministic tests
  - TSI outputs and minimum-level mappings match locked formula/bands
  - field-test recency checks enforced for cold/remote rule cases
  - local verification commands succeed:
    - `npm run test:capability-rules`
    - `npm run test:trip-evaluation`

### T82: Homepage Kits Implementation
- Required deliverables:
  - homepage kits endpoint implementation and contract alignment
  - homepage UI section rendering explainable best-fit kits
  - outbound purchase link rendering (optional when `purchase_url` absent)
- Acceptance criteria:
  - homepage kits include suitability and top-factor explainability fields
  - only capability-compliant items are included in "approved" kits
  - local verification commands succeed:
    - `npm run test:homepage-kits`
    - `npm run test:e2e -- --grep "homepage kits"`

### T83: DB Command Hardening (Post-Bringup)
- Required deliverables:
  - `scripts/db/preview-check.sh` fails hard on migration apply failure and does not emit false PASS
  - `scripts/db/reset-test.sh` performs real clean-reset + migration-apply verification
  - `scripts/db/backup-create.sh` writes real backup artifact suitable for restore validation
  - `scripts/db/restore-dry-run.sh` validates restore path against backup artifact with non-destructive checks
- Acceptance criteria:
  - command behavior is deterministic and reflects true DB state
  - failure paths are tested and documented in implementation notes
  - local verification commands succeed:
    - `npm run db:up`
    - `npm run db:migrate:reset-test`
    - `npm run db:migrate:preview-check`
    - `npm run db:backup:create`
    - `npm run db:restore:dry-run`

### T84: Search Index Policy Drift Closure
- Required deliverables:
  - migration updates add full-text `GIN` index for canonical searchable text vector
  - migration updates add trigram `GIN` index on gear name/model fields
  - schema/migration checks assert both required search index classes are present
- Acceptance criteria:
  - migration includes both locked search index requirements from AGENTS policy
  - preview-like migration apply succeeds after index changes
  - local verification commands succeed:
    - `npm run db:migrate:check`
    - `npm run db:migrate:preview-check`

### T85: Global Gate Command Hardening
- Required deliverables:
  - replace placeholder `lint`, `typecheck`, `test:unit`, `test:integration` no-op runners with real implementations
  - ensure command failures correctly fail CI/local gates
- Acceptance criteria:
  - no production gate command uses `scripts/tasks/noop.sh`
  - global local test gate represents real validation signal
  - local verification commands succeed:
    - `npm run lint`
    - `npm run typecheck`
    - `npm run test:unit`
    - `npm run test:integration`

### T86: Engine Hostile Hardening (DB-Derived Context + Strict Explainability)
- Required deliverables:
  - runtime request validator parity with `TripsEvaluateRequest` schema (including unknown-field rejection and typed selected-system arrays)
  - trip-evaluation route derives policy and field-test context from persisted records instead of always-false defaults
  - field-test hard-rule logic requires recent passed test (`passed=true`) for qualifying scenarios
  - qualifying field tests are limited to selected gear ids and recency-window constrained
  - strict explainability enforcement for all selected items with exactly top-3 factors
  - deterministic failure response when required policy/evidence context cannot be derived, with explicit status/error mapping
  - deterministic policy/evidence context selection precedence with explicit tie-breakers
- Acceptance criteria:
  - no contract drift between `schemas/`, `docs/openapi/v1.yaml`, and `src/contracts/` for trip evaluation path
  - cold/remote field-test requirement cannot be satisfied by failed test records
  - every selected gear item in request has explainability payload or request fails deterministically with `422` + `error_code=EXPLAINABILITY_INCOMPLETE`
  - missing policy context fails deterministically with `409` + `error_code=POLICY_CONTEXT_MISSING`
  - DB-derived context selection is deterministic via precedence (`updated_at DESC`, tie-break `id ASC`)
  - required new tests exist and pass for: unknown-field rejection, typed selected-system arrays, failed/stale field-test rejection, selected-gear field-test scoping, explainability-missing deterministic failure, and policy-context-missing deterministic failure
  - local verification commands succeed:
    - `npm run test:contract`
    - `npm run test:capability-rules`
    - `npm run test:trip-evaluation`
    - `npm run test:trip-endpoint`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run test:unit`
    - `npm run test:integration`

### T87: DB Seed Import Runtime + Frontend-Facing DB Wiring
- Required deliverables:
  - implement real seed-import runtime that writes `data/seed/entities/*.json` and `data/seed/review_intel/review_intel.csv` into Postgres
  - importer is idempotent and uses deterministic upsert keys with transaction-safe failure behavior (no partial commits)
  - replace static/mock runtime payloads with DB-backed reads for:
    - `GET /api/v1/homepage/kits`
    - `GET /api/v1/gear`
    - `GET /api/v1/gear/:slug`
    - `GET /api/v1/gear/:slug/locations`
    - `POST /api/v1/trips/evaluate` policy/field-test context loading path
  - preserve T86 deterministic trip-evaluation semantics while moving context source from seed files to DB reads
  - keep contract layers synchronized in one change set (`schemas/`, `docs/openapi/v1.yaml`, `src/contracts/`)
- Acceptance criteria:
  - local seed import command persists rows to Postgres and is rerunnable without duplicate side effects
  - target frontend-facing endpoints return DB-backed data aligned to response contracts
  - trip-evaluation continues returning deterministic error/approval behavior from DB-derived context:
    - `422` `VALIDATION_ERROR`
    - `422` `EXPLAINABILITY_INCOMPLETE`
    - `409` `POLICY_CONTEXT_MISSING`
  - no contract drift between schema docs and runtime behavior for touched endpoints
  - local verification commands succeed:
    - `npm run db:up`
    - `npm run db:migrate:reset-test`
    - `npm run seed:validate`
    - `npm run test:contract`
    - `npm run test:capability-rules`
    - `npm run test:trip-evaluation`
    - `npm run test:trip-endpoint`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run lint`
    - `npm run typecheck`

### T88: Gear Explorer UI (Search, Detail, Location Performance)
- Required deliverables:
  - add frontend browse/discovery routes for gear list and detail experiences
  - implement gear explorer page that consumes `GET /api/v1/gear` with query/filter controls and pagination
  - implement gear detail page consuming `GET /api/v1/gear/:slug` and location-performance view from `GET /api/v1/gear/:slug/locations`
  - surface full gear-detail payload sections in UI (`specs`, `classification`, `review_summary`, `field_tests_recent`, `kit_presence`, `location_summary`)
  - add navigation from homepage kits to gear detail routes
  - preserve existing API contracts and maintain DB-backed endpoint behavior introduced in T87
- Acceptance criteria:
  - users can navigate from homepage kit item to gear detail page
  - users can search/filter gear from UI and see non-empty results for valid queries
  - gear detail page shows aggregated scores plus full detail payload sections and location performance without contract drift
  - no regression in homepage kits rendering behavior
  - local verification commands succeed:
    - `npm run test:homepage-kits`
    - `npm run test:e2e -- --grep "homepage kits"`
    - `npm run test:contract`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run lint`
    - `npm run typecheck`

### T89: Affiliate-Source Seed Expansion (Agentic Ingest Workflow)
- Required deliverables:
  - define and implement an agentic source-ingest workflow for affiliate-safe gear catalog expansion
  - lock explicit approved source ids for v1 ingest: `rei_affiliate_feed`, `backcountry_affiliate_feed`, `manual_admin_fixture`
  - lock explicit trusted domain allowlist for adapter URLs:
    - REI: `rei.com`, `www.rei.com`
    - Backcountry: `backcountry.com`, `www.backcountry.com`, `steepandcheap.com`, `www.steepandcheap.com`
  - add source adapter layer for affiliate/product-feed ingestion with strict source allowlist controls
  - extend seed normalization so incoming source records map deterministically into canonical `GearItem`, `GearClass`, and optional `ReviewIntel` seed structures
  - enforce deterministic source dedupe key algorithm:
    - `source_dedupe_key = sha256(source_id + \"|\" + source_product_id + \"|\" + normalized_brand + \"|\" + normalized_model)`
  - define adapter contract fields and required normalized output fields before adapter-specific parsing:
    - required raw fields: `source_id`, `source_product_id`, `source_url`, `name`, `brand`, `price_usd`, `currency`, `fetched_at`
    - required normalized fields: `slug`, `name`, `gear_class_slug`, `system_slugs`, `price_usd`, `purchase_url`, `source_id`, `source_product_id`, `source_dedupe_key`, `raw_hash`, `parser_version`
  - preserve canonical runtime/contract paths and keep legacy/source-staging artifacts out of API runtime handlers
  - add ingest audit/provenance metadata in staging artifacts (`source`, `fetched_at`, `raw_hash`, `parser_version`, `affiliate_url_present`)
  - add reproducible ingest commands and documentation so expansion can be rerun without manual DB row edits
- Acceptance criteria:
  - source-ingest pipeline is idempotent and rerunnable without duplicate canonical entity creation
  - generated seed artifacts pass existing validation gates and import into DB with no FK violations
  - affiliate link fields are captured as outbound purchase URLs only (no in-app checkout semantics)
  - source adapters fail closed for unknown/untrusted domains or malformed records
  - local verification commands succeed:
    - `npm run seed:source:check`
    - `npm run seed:source:normalize`
    - `npm run seed:validate`
    - `npm run seed:import:db`
    - `npm run seed:import:test`
    - `npm run seed:report`
    - `npm run test:contract`
    - `npm run contract:validate`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run lint`
    - `npm run typecheck`

### T90: Affiliate Linking System (Outbound Link Governance + Tracking)
- Required deliverables:
  - define canonical affiliate-link resolution policy for outbound gear links (raw source URL -> tracked outbound URL)
  - implement affiliate link builder utility with deterministic provider rules and explicit fallback behavior
  - implement server route for outbound redirect/tracking with request id and link metadata logging
  - enforce allowed outbound domains and block malformed/untrusted redirect targets
  - add contract/docs updates for any new affiliate-link endpoint and response/error shapes
  - wire homepage/gear detail UI links to affiliate-link resolver path without breaking current navigation
- Acceptance criteria:
  - affiliate link builder produces deterministic outbound URLs for approved providers
  - redirect route blocks invalid/untrusted URLs and returns standard API error contract fields
  - homepage kit and gear detail purchase actions use affiliate-link resolver path
  - no regression in existing browse/detail/homepage routes
  - local verification commands succeed:
    - `npm run test:homepage-kits`
    - `npm run test:e2e -- --grep "homepage kits"`
    - `npm run test:contract`
    - `npm run contract:validate`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run lint`
    - `npm run typecheck`

### Implementation Dependency Order (Locked)
1. T12 (contracts) must be completed before T13 (schema migration finalization).
2. T13 must be completed before T11 (seed import validation).
3. T10 can proceed in parallel but cannot block T12/T13 closure.
4. T83 must be completed before T13 can be marked `Done`.
5. T81 must begin only after T12 + T13 + T11 acceptance criteria pass.
6. T82 must begin after T81 contract/schema wiring is complete.
7. T84 and T85 must be completed before release hardening closeout.
8. T86 must be completed before trip-evaluation hostile-review closure.
9. UI implementation begins only after T12 + T13 + T11 acceptance criteria pass.

### Bootstrap and Portability Requirements (v1)
- Required bootstrap artifacts:
  - `scripts/bootstrap.sh` for local environment setup
  - `.env.example` with all required variables (no secrets)
  - `scripts/validate_env.sh` for preflight checks
  - `scripts/seed_local.sh` for deterministic local seed import
  - `scripts/db/up.sh` for deterministic local DB bring-up
- Portability criteria:
  - fresh-clone setup on a new machine succeeds using bootstrap scripts
  - all required local tests run without manual undocumented steps
  - local DB startup succeeds via `npm run db:up`
  - setup instructions documented in `README.md`

### Global Local Test Gate (v1)
- Before marking any implementation task `Done`, run:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:integration`
- If a command is not yet available, Codex must create/standardize it as part of implementation setup.

## Workboard
| ID | Task | Owner | Priority | Status | Due Date | Notes |
|---|---|---|---|---|---|---|
| T1 | Scope/workflow lock | You + Codex | High | Done | 2026-02-25 | Gear-first primary flow |
| T2 | Data contract lock | You + Codex | High | Done | 2026-02-25 | Entities + required fields |
| T3 | Scoring/ranking/confidence lock | You + Codex | High | Done | 2026-02-25 | 1-5 + weighted + confidence |
| T4 | Reviewer/moderation rollout lock | You + Codex | High | Done | 2026-02-25 | Admin-only now |
| T5 | Stack/auth/api/search lock | You + Codex | High | Done | 2026-02-25 | Next.js/Postgres/Prisma/REST |
| T6 | Ingestion and validation lock | You + Codex | High | Done | 2026-02-25 | JSON+CSV strict gate |
| T7 | Media/storage lock | You + Codex | High | Done | 2026-02-25 | GCS + signed URLs |
| T8 | Sponsorship policy lock | You + Codex | Medium | Done | 2026-02-25 | Schema only in v1 |
| T9 | DB migration + CI gate lock | You + Codex | High | Done | 2026-02-25 | Preview migration required |
| T10 | Integration scaffolding | You + Codex | Medium | Done | 2026-02-27 | Notion adapter disabled; evidence report added under `artifacts/integration-reports/`; tracked in `.agent/execplans/v1-implementation.md` |
| T11 | Build first validated data slice | You + Codex | Medium | Done | 2026-03-01 | Sand Rock entity/review seed files + import report scripts implemented; threshold/FK/fixture commands passing; tracked in `.agent/execplans/v1-implementation.md` |
| T12 | Define API request/response contracts for locked endpoints | You + Codex | High | Done | 2026-02-27 | Locked endpoint schemas + OpenAPI + runtime handlers/validators implemented; `contract:validate` and `test:contract` passing; tracked in `.agent/execplans/v1-implementation.md` |
| T13 | Create Prisma schema + initial migration | You + Codex | High | Done | 2026-02-28 | Real DB bring-up + truthful migration/rollback command path verified; `db:migrate:check`, `db:migrate:reset-test`, `db:migrate:preview-check`, `db:backup:create`, and `db:restore:dry-run` passing with evidence in `.agent/execplans/v1-implementation.md` |
| T14 | Lock entity identity + provenance requirements | You + Codex | High | Done | 2026-02-25 | UUID PK + unique slug + required ReviewIntel provenance/version fields |
| T15 | Lock ranking tie-breaker policy | You + Codex | High | Done | 2026-02-25 | `review_count` then `updated_at` |
| T16 | Lock media security baseline | You + Codex | High | Done | 2026-02-25 | Images only, 10MB max, auth upload, queued scanning |
| T17 | Lock API versioning policy | You + Codex | High | Done | 2026-02-25 | Path-based `/api/v1/...` |
| T18 | Lock ingest reject error format | You + Codex | High | Done | 2026-02-25 | JSON with row/field/code/message |
| T19 | Lock minimal v1 endpoint set policy | You + Codex | High | Done | 2026-02-25 | Endpoint baseline locked before build |
| T20 | Lock API auth matrix default | You + Codex | High | Done | 2026-02-25 | All GET public, all POST admin-only |
| T21 | Lock import idempotency policy | You + Codex | High | Done | 2026-02-25 | Upsert by canonical entity/review keys |
| T22 | Lock list pagination/sort defaults | You + Codex | High | Done | 2026-02-25 | page/limit defaults + default ranking sort |
| T23 | Lock delete semantics | You + Codex | High | Done | 2026-02-25 | Soft delete only (`deleted_at`, `deleted_by`) |
| T24 | Lock media publish gate behavior | You + Codex | High | Done | 2026-02-25 | Hidden until scan pass; failed scans quarantined |
| T25 | Lock concrete endpoint list | You + Codex | High | Done | 2026-02-25 | v1 routes fixed for schema/UI alignment |
| T26 | Lock FK/referential integrity policy | You + Codex | High | Done | 2026-02-25 | FK `RESTRICT`; soft-delete lifecycle in app layer |
| T27 | Lock backup and restore policy | You + Codex | High | Done | 2026-02-25 | Daily snapshots + pre-launch restore drill |
| T28 | Lock v1 reviewer trust score baseline | You + Codex | High | Done | 2026-02-25 | Admin trust fixed at 1.0 in Phase 1 |
| T29 | Add normalization-rule extensibility requirement | You + Codex | High | Done | 2026-02-25 | Raw vs derived score fields for migration-safe evolution |
| T30 | Lock confidence normalization baseline | You + Codex | High | Done | 2026-02-25 | Balanced sample-size ramp + 3-level evidence rubric |
| T31 | Lock auditability/explainability requirements | You + Codex | High | Done | 2026-02-25 | Ranking trace fields + explainability payload + change history |
| T32 | Lock curation governance constraints | You + Codex | High | Done | 2026-02-25 | Pin limits, expiry, and rationale requirements |
| T33 | Lock import transaction semantics | You + Codex | High | Done | 2026-02-25 | All-or-nothing import jobs |
| T34 | Lock optimistic concurrency policy | You + Codex | High | Done | 2026-02-25 | Version checks + 409 on mismatch |
| T35 | Lock search quality baseline | You + Codex | High | Done | 2026-02-25 | Stemming + trigram + alias mapping |
| T36 | Lock standard API error taxonomy | You + Codex | High | Done | 2026-02-25 | Unified error envelope + status policy |
| T37 | Lock observability/reliability baseline | You + Codex | High | Done | 2026-02-25 | Metrics, targets, alerting requirements |
| T38 | Lock admin authorization scopes | You + Codex | High | Done | 2026-02-25 | Scoped admin permissions by action class |
| T39 | Lock API rate-limiting policy | You + Codex | High | Done | 2026-02-25 | Public/admin endpoint request caps |
| T40 | Lock pre-production test gates | You + Codex | High | Done | 2026-02-25 | Contract + integration tests required |
| T41 | Lock data/media retention policy | You + Codex | High | Done | 2026-02-25 | Timed retention windows + purge rules |
| T42 | Lock deterministic curation context key | You + Codex | High | Done | 2026-02-25 | Hash of normalized query/filter context |
| T43 | Lock explicit sample-size scoring function | You + Codex | High | Done | 2026-02-25 | Balanced log-based normalization formula |
| T44 | Lock source typing enum and URL dependency rules | You + Codex | High | Done | 2026-02-25 | `source_type` enum + required URL conditions |
| T45 | Lock objective thin-evidence threshold | You + Codex | High | Done | 2026-02-25 | Evidence cap based on explicit criteria |
| T46 | Lock context-key normalization algorithm | You + Codex | High | Done | 2026-02-25 | Deterministic query/filter normalization rules |
| T47 | Lock API contract standard | You + Codex | High | Done | 2026-02-25 | OpenAPI + runtime schema validation |
| T48 | Lock import operational limits | You + Codex | High | Done | 2026-02-25 | Size/row/timeout/retry constraints |
| T49 | Lock backup retention and recovery targets | You + Codex | High | Done | 2026-02-25 | 30-day retention + encryption + RPO/RTO |
| T50 | Lock rate-limit identity policy | You + Codex | High | Done | 2026-02-25 | Auth by user id, anon by IP |
| T51 | Lock append-only audit storage model | You + Codex | High | Done | 2026-02-25 | Immutable event log requirements |
| T52 | Lock measurable success KPI targets | You + Codex | High | Done | 2026-02-25 | Launch gates with explicit thresholds |
| T53 | Lock system taxonomy governance policy | You + Codex | High | Done | 2026-02-25 | Create/merge/alias/deprecate controls |
| T54 | Lock location model standard | You + Codex | High | Done | 2026-02-25 | Granularity + required geo fields |
| T55 | Lock moderation status model and transitions | You + Codex | High | Done | 2026-02-25 | Explicit state machine for v1 |
| T56 | Lock security and session baseline | You + Codex | High | Done | 2026-02-25 | TTL/MFA/recovery/secrets rotation |
| T57 | Lock API contract completion definition | You + Codex | High | Done | 2026-02-25 | Definition-of-done for endpoint contracts |
| T58 | Set concrete due dates for active implementation tasks | You + Codex | High | Done | 2026-02-25 | T10-T13 scheduled |
| T59 | Lock `GET /api/v1/gear` query contract | You + Codex | High | Done | 2026-02-25 | Strict params + enums + unknown-param reject |
| T60 | Lock database index baseline | You + Codex | High | Done | 2026-02-25 | Unique/FK/ranking/search/idempotency index set |
| T61 | Lock objective-hybrid scoring framework | You + Codex | High | Done | 2026-02-25 | Objective + reviewer blend for durability/value/packability |
| T62 | Lock seed dataset quality gate | You + Codex | High | Done | 2026-02-25 | Sand Rock-first (1 location) with strict coverage thresholds |
| T63 | Lock terminology and algorithm definitions | You + Codex | High | Done | 2026-02-25 | Removed subjective/undefined planning language |
| T64 | Lock persistent hostile-review protocol | You + Codex | High | Done | 2026-02-25 | Codex behavior standardized for future hostile reviews |
| T65 | Lock packability taxonomy and scoring modes | You + Codex | High | Done | 2026-02-25 | Explicit `packability_mode` enum rules |
| T66 | Lock feature-coverage objective formula | You + Codex | High | Done | 2026-02-25 | Deterministic `feature_coverage_score_obj` mapping |
| T67 | Lock durability partial-data fallback behavior | You + Codex | High | Done | 2026-02-25 | Repair-event default + confidence downgrade rule |
| T68 | Lock valid import file definition | You + Codex | High | Done | 2026-02-25 | Operational + schema validity criteria |
| T69 | Lock normalization-change trigger and governance | You + Codex | High | Done | 2026-02-25 | Post-v1 criteria + decision-log requirement |
| T70 | Lock destructive migration approval policy | You + Codex | High | Done | 2026-02-25 | Dual-admin + backup/restore preconditions |
| T71 | Lock implementation hostile-review protocol | You + Codex | High | Done | 2026-02-25 | Persistent review behavior for execution phase |
| T72 | Lock implementation execution spec for T10-T13/T11 | You + Codex | High | Done | 2026-02-25 | File deliverables + acceptance criteria + dependency order |
| T73 | Lock autonomous execution protocol for v1 | You + Codex | High | Done | 2026-02-25 | Codex long-run autonomy with stop conditions |
| T74 | Lock command-level acceptance checks for T10-T13/T11 | You + Codex | High | Done | 2026-02-25 | Explicit local verification commands |
| T75 | Lock CI blocking job list | You + Codex | High | Done | 2026-02-25 | Required pass/fail gates for merge/deploy |
| T76 | Lock bootstrap and portability requirements | You + Codex | High | Done | 2026-02-25 | Scripts + env validation + fresh-clone criteria |
| T77 | Lock global local test gate | You + Codex | High | Done | 2026-02-25 | Lint/type/unit/integration before task close |
| T78 | Lock capability-framework authoritative standards | You + Codex | High | Done | 2026-02-25 | ECWCS/WMS/sleep/fuel doctrine and hard blocks codified |
| T79 | Lock deterministic TSI + minimum-level mapping | You + Codex | High | Done | 2026-02-25 | Explicit formula, bands, and system minimums |
| T80 | Add homepage kit objective and contracts | You + Codex | High | Done | 2026-02-25 | `/homepage/kits` + explainable bundle outputs |
| T81 | Implement capability policy in API/schema/seed tasks | You + Codex | High | Done | 2026-03-03 | Deterministic capability engine + trip endpoint runtime wiring + rule/TSI/recency tests passing |
| T82 | Implement homepage kits UI + endpoint integration | You + Codex | Medium | Done | 2026-03-04 | Homepage UI now fetches `/api/v1/homepage/kits`, renders explainable kit cards, handles optional purchase links, and passes `test:homepage-kits` + `test:e2e -- --grep "homepage kits"` |
| T83 | Harden DB command scripts for truthful migration/rollback validation | You + Codex | High | Done | 2026-03-02 | `db:migrate:reset-test`, `db:migrate:preview-check`, `db:backup:create`, and `db:restore:dry-run` now perform real DB operations and fail on real apply/restore errors |
| T84 | Close search index policy drift in migration/schema checks | You + Codex | High | Done | 2026-03-02 | Added full-text canonical-search GIN index + name/model trigram GIN index; `db:migrate:check` enforcement added and preview apply verified |
| T85 | Replace global no-op quality gates with real lint/type/test commands | You + Codex | High | Done | 2026-03-03 | `lint`, `typecheck`, `test:unit`, `test:integration` now run real validation suites; no `noop` usage in production gate scripts |
| T86 | Harden trip evaluation runtime via hostile-review findings | You + Codex | High | Done | 2026-03-06 | Completed: validator parity + unknown-field rejection, selected-gear explainability enforcement (`422 EXPLAINABILITY_INCOMPLETE`), deterministic policy-context failure (`409 POLICY_CONTEXT_MISSING`), field-test `passed=true`/recency/selected-gear scoping, deterministic policy selection precedence, and passing local gate bundle tracked in `.agent/execplans/v2-engine-hardening.md` |
| T87 | Implement DB seed import runtime and DB-backed endpoint wiring | You + Codex | High | Done | 2026-03-10 | Completed: `seed:import:db` transactional upsert runtime + `seed_local.sh` workflow update, DB-first route wiring for homepage/gear endpoints and trip-context loading, and passing command gates (`db:migrate:reset-test`, `seed:validate`, `test:contract`, capability tests, unit/integration, lint, typecheck, `contract:validate`) tracked in `.agent/execplans/v3-db-seed-runtime-wiring.md` |
| T88 | Implement gear explorer browse/detail UI flow | You + Codex | High | Done | 2026-03-12 | Completed: `/gear` explorer + `/gear/[slug]` detail pages, location-performance rendering, homepage kit -> detail navigation wiring, expanded gear detail payload/UI surfacing (`specs`, `classification`, `review_summary`, `field_tests_recent`, `kit_presence`, `location_summary`), and passing T88 command gates (`test:homepage-kits`, `test:e2e`, `test:contract`, `test:unit`, `test:integration`, `lint`, `typecheck`) tracked in `.agent/execplans/v4-gear-explorer-ui.md` |
| T89 | Implement affiliate-source seed expansion workflow | You + Codex | High | Done | 2026-03-16 | Completed under `.agent/execplans/v5-source-ingest-affiliate-seeding.md`: fail-closed source policy gates, deterministic normalization pipeline + fixture affiliate feeds, additive source artifact import wiring (`gear_items.source.json`), provenance-aware seed reporting, and passing gate bundle (`seed:source:check`, `seed:source:normalize`, `seed:validate`, `seed:import:db`, `seed:import:test`, `seed:report`, `test:contract`, `contract:validate`, `test:unit`, `test:integration`, `lint`, `typecheck`) |
| T90 | Implement affiliate linking system for outbound gear links | You + Codex | High | Done | 2026-03-20 | Completed under `.agent/execplans/v6-affiliate-linking-system.md`: deterministic affiliate link builder (`src/affiliate/link-builder.mjs`), resolver endpoint (`/api/v1/affiliate/resolve`) with fail-closed domain validation + contract-compliant error responses, homepage/detail UI purchase-link routing through resolver helper, OpenAPI/contract sync, and passing gate bundle (`test:homepage-kits`, `test:e2e`, `test:contract`, `contract:validate`, `test:unit`, `test:integration`, `lint`, `typecheck`) |

Status options: `Todo`, `In Progress`, `Blocked`, `Done`.

## Next Actions
1. Run release hardening closeout and final evidence capture.
2. Keep AGENTS workboard and ExecPlan progress log synchronized.
3. Start next feature/task only after creating/updating the active branch ExecPlan path.
