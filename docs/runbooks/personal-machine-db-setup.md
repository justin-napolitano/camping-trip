# Personal Machine DB Setup + T13 Closeout

This runbook is for running on your personal machine (separate Codex session) to finish `T13` by executing a preview-like live migration apply.

## Goal

Get these commands passing with real DB connectivity:

- `npm run db:migrate:check`
- `npm run db:migrate:reset-test`
- `npm run db:migrate:preview-check`
- `npm run db:backup:create`
- `npm run db:restore:dry-run`

Then update statuses:

- `AGENTS.md`: `T13` from `Blocked` -> `Done`
- `.agent/execplans/v1-implementation.md`: Milestone 2 as complete with evidence

## 1) Clone + Branch

```bash
git clone <your-repo-url> camping-trip
cd camping-trip
git checkout main
git pull
```

## 2) Configure Environment

Copy env template:

```bash
cp .env.example .env
```

Required vars:

- `DATABASE_URL`
- `PREVIEW_DATABASE_URL`

Example values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/camping_trip_dev
PREVIEW_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/camping_trip_preview
```

Export for current shell:

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/camping_trip_dev'
export PREVIEW_DATABASE_URL='postgresql://postgres:postgres@localhost:5433/camping_trip_preview'
```

## 3) Bring Up Databases

Use any Postgres method you prefer on personal machine.

Option A: Docker (if available)

```bash
npm run db:up
```

This script is idempotent: it creates missing containers or starts existing ones, waits for readiness, and prints the expected DB URLs.

Manual Docker fallback:

```bash
docker run -d --name camping-dev-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=camping_trip_dev -p 5432:5432 postgres:16
docker run -d --name camping-preview-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=camping_trip_preview -p 5433:5432 postgres:16
```

Option B: local/service Postgres

- Create DB `camping_trip_dev`
- Create DB `camping_trip_preview`
- Ensure both are reachable with the URLs above.

## 4) Run Required Commands

```bash
npm run db:migrate:check
npm run db:migrate:reset-test
npm run db:migrate:preview-check
npm run db:backup:create
npm run db:restore:dry-run
```

Expected:

- `db:migrate:preview-check` writes a pass artifact under `artifacts/migration-reports/`.

## 5) Record Evidence

Capture command outputs and artifact paths in:

- `.agent/execplans/v1-implementation.md` (`Progress`, `Surprises & Discoveries`)

## 6) Close T13

Update:

- `AGENTS.md`: set `T13` status to `Done`
- `.agent/execplans/v1-implementation.md`: mark Milestone 2 complete

Run sanity checks:

```bash
npm run contract:validate
npm run test:contract
```

Commit:

```bash
git add -A
git commit -m "Run preview migration apply evidence and close T13"
```

## Copy/Paste Prompt For New Codex Session

```text
Use AGENTS.md and .agent/execplans/v1-implementation.md as source-of-truth.
Goal: close T13 only.
Steps:
1) Ensure DATABASE_URL and PREVIEW_DATABASE_URL are set from .env.
2) Run:
   npm run db:migrate:check
   npm run db:migrate:reset-test
   npm run db:migrate:preview-check
   npm run db:backup:create
   npm run db:restore:dry-run
3) Record evidence in .agent/execplans/v1-implementation.md.
4) Update AGENTS.md workboard T13 -> Done.
5) Run npm run contract:validate && npm run test:contract.
6) Commit with a focused message.
Do not change scope outside T13 unless required to pass these commands.
```
