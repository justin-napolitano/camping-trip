#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

bash scripts/db/check-schema.sh

PREVIEW_DB_URL="${PREVIEW_DATABASE_URL:-${DATABASE_URL_PREVIEW:-}}"
if [ -z "$PREVIEW_DB_URL" ]; then
  echo "[db:migrate:preview-check] missing PREVIEW_DATABASE_URL (or DATABASE_URL_PREVIEW)" >&2
  echo "[db:migrate:preview-check] set a preview-like Postgres URL to run live migration apply check" >&2
  exit 1
fi

if [[ "$PREVIEW_DB_URL" != *"postgres"* ]]; then
  echo "[db:migrate:preview-check] preview URL does not look like postgres" >&2
  exit 1
fi

latest_migration="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n1)/migration.sql"
if [ ! -f "$latest_migration" ]; then
  echo "[db:migrate:preview-check] migration file not found" >&2
  exit 1
fi

mkdir -p artifacts/migration-reports
stamp="$(date -u +"%Y%m%dT%H%M%SZ")"
report="artifacts/migration-reports/preview-migrate-${stamp}.json"

run_psql() {
  local sql_file="$1"
  if command -v psql >/dev/null 2>&1; then
    PGPASSWORD="${PGPASSWORD:-}" psql "$PREVIEW_DB_URL" -v ON_ERROR_STOP=1 -f "$sql_file"
    return 0
  fi

  if command -v docker >/dev/null 2>&1; then
    docker run --rm \
      -v "$ROOT_DIR:/repo" \
      postgres:16 \
      psql "$PREVIEW_DB_URL" -v ON_ERROR_STOP=1 -f "/repo/${sql_file}"
    return 0
  fi

  echo "[db:migrate:preview-check] neither psql nor docker is available" >&2
  return 1
}

if run_psql "$latest_migration"; then
  cat > "$report" <<JSON
{
  "executed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "pass",
  "migration": "$latest_migration",
  "note": "Migration applied against preview-like database URL"
}
JSON
  echo "[db:migrate:preview-check] PASS: $report"
else
  cat > "$report" <<JSON
{
  "executed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "fail",
  "migration": "$latest_migration",
  "note": "Migration apply failed against preview-like database URL"
}
JSON
  echo "[db:migrate:preview-check] FAIL: $report" >&2
  exit 1
fi
