#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

latest_backup="$(ls -1 artifacts/db-backups/*.backup.dump 2>/dev/null | sort | tail -n1 || true)"
if [ -z "$latest_backup" ]; then
  echo "[db:restore:dry-run] no backup dump found; run npm run db:backup:create first" >&2
  exit 1
fi

TARGET_DB_URL="${PREVIEW_DATABASE_URL:-${DATABASE_URL_PREVIEW:-${DATABASE_URL:-}}}"
if [ -z "$TARGET_DB_URL" ]; then
  echo "[db:restore:dry-run] missing target DB URL (set PREVIEW_DATABASE_URL or DATABASE_URL_PREVIEW or DATABASE_URL)" >&2
  exit 1
fi

dockerize_url() {
  local raw_url="$1"
  echo "$raw_url" | sed -E 's#@localhost:#@host.docker.internal:#g; s#@127\.0\.0\.1:#@host.docker.internal:#g'
}

run_psql_cmd() {
  local db_url="$1"
  local sql="$2"

  if command -v psql >/dev/null 2>&1; then
    psql "$db_url" -v ON_ERROR_STOP=1 -c "$sql"
    return $?
  fi

  if command -v docker >/dev/null 2>&1; then
    local docker_url
    docker_url="$(dockerize_url "$db_url")"
    docker run --rm postgres:16 psql "$docker_url" -v ON_ERROR_STOP=1 -c "$sql"
    return $?
  fi

  echo "[db:restore:dry-run] neither psql nor docker is available" >&2
  return 1
}

run_psql_query() {
  local db_url="$1"
  local sql="$2"

  if command -v psql >/dev/null 2>&1; then
    psql "$db_url" -v ON_ERROR_STOP=1 -t -A -c "$sql"
    return $?
  fi

  if command -v docker >/dev/null 2>&1; then
    local docker_url
    docker_url="$(dockerize_url "$db_url")"
    docker run --rm postgres:16 psql "$docker_url" -v ON_ERROR_STOP=1 -t -A -c "$sql"
    return $?
  fi

  echo "[db:restore:dry-run] neither psql nor docker is available" >&2
  return 1
}

run_pg_restore() {
  local db_url="$1"
  local backup_file="$2"

  if command -v pg_restore >/dev/null 2>&1; then
    pg_restore --schema-only --no-owner --no-privileges --exit-on-error -d "$db_url" "$backup_file"
    return $?
  fi

  if command -v docker >/dev/null 2>&1; then
    local docker_url
    docker_url="$(dockerize_url "$db_url")"
    docker run --rm \
      -v "$ROOT_DIR:/repo" \
      postgres:16 \
      pg_restore --schema-only --no-owner --no-privileges --exit-on-error -d "$docker_url" "/repo/${backup_file}"
    return $?
  fi

  echo "[db:restore:dry-run] neither pg_restore nor docker is available" >&2
  return 1
}

db_url_no_query="${TARGET_DB_URL%%\?*}"
query_part=""
if [[ "$TARGET_DB_URL" == *\?* ]]; then
  query_part="?${TARGET_DB_URL#*\?}"
fi

base_url="${db_url_no_query%/*}"
admin_url="${base_url}/postgres${query_part}"
stamp="$(date -u +"%Y%m%d%H%M%S")"
temp_db="restore_dry_run_${stamp}"
temp_db_url="${base_url}/${temp_db}${query_part}"

cleanup() {
  run_psql_cmd "$admin_url" "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${temp_db}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
  run_psql_cmd "$admin_url" "DROP DATABASE IF EXISTS \"${temp_db}\";" >/dev/null 2>&1 || true
}

trap cleanup EXIT

run_psql_cmd "$admin_url" "CREATE DATABASE \"${temp_db}\";"
run_pg_restore "$temp_db_url" "$latest_backup"

table_count="$(run_psql_query "$temp_db_url" "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")"
if [ -z "$table_count" ] || [ "$table_count" -le 0 ]; then
  echo "[db:restore:dry-run] restore dry run did not create public tables in temp database" >&2
  exit 1
fi

echo "[db:restore:dry-run] PASS: restore path verified with temporary database ${temp_db}"
echo "[db:restore:dry-run] backup validated: ${latest_backup}"
