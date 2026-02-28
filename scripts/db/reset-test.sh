#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

bash scripts/db/check-schema.sh

DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "[db:migrate:reset-test] missing DATABASE_URL" >&2
  exit 1
fi

latest_migration="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n1)/migration.sql"
if [ ! -s "$latest_migration" ]; then
  echo "[db:migrate:reset-test] migration file is empty: $latest_migration" >&2
  exit 1
fi

dockerize_url() {
  local raw_url="$1"
  echo "$raw_url" | sed -E 's#@localhost:#@host.docker.internal:#g; s#@127\.0\.0\.1:#@host.docker.internal:#g'
}

run_psql_file() {
  local db_url="$1"
  local sql_file="$2"

  if command -v psql >/dev/null 2>&1; then
    psql "$db_url" -v ON_ERROR_STOP=1 -f "$sql_file"
    return $?
  fi

  if command -v docker >/dev/null 2>&1; then
    local docker_url
    local repo_sql_path
    docker_url="$(dockerize_url "$db_url")"
    if [[ "$sql_file" == "$ROOT_DIR/"* ]]; then
      repo_sql_path="/repo/${sql_file#"$ROOT_DIR/"}"
    elif [[ "$sql_file" != /* ]]; then
      repo_sql_path="/repo/$sql_file"
    else
      echo "[db:migrate:reset-test] sql file path must be inside repository for docker fallback: $sql_file" >&2
      return 1
    fi
    docker run --rm \
      -v "$ROOT_DIR:/repo" \
      postgres:16 \
      psql "$docker_url" -v ON_ERROR_STOP=1 -f "$repo_sql_path"
    return $?
  fi

  echo "[db:migrate:reset-test] neither psql nor docker is available" >&2
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

  echo "[db:migrate:reset-test] neither psql nor docker is available" >&2
  return 1
}

mkdir -p artifacts/migration-reports
reset_sql="$(mktemp "$ROOT_DIR/artifacts/migration-reports/reset-test.XXXXXX.sql")"
cat > "$reset_sql" <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT ALL ON SCHEMA public TO public;
SQL

trap 'rm -f "$reset_sql"' EXIT

run_psql_file "$DB_URL" "$reset_sql"
run_psql_file "$DB_URL" "$latest_migration"

table_count="$(run_psql_query "$DB_URL" "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")"
if [ -z "$table_count" ] || [ "$table_count" -le 0 ]; then
  echo "[db:migrate:reset-test] migration apply did not create public tables" >&2
  exit 1
fi

echo "[db:migrate:reset-test] PASS (clean reset + migration apply succeeded; public tables=$table_count)"
