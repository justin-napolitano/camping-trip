#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "[db:backup:create] missing DATABASE_URL" >&2
  exit 1
fi

mkdir -p artifacts/db-backups
stamp="$(date -u +"%Y%m%dT%H%M%SZ")"
backup_file="artifacts/db-backups/${stamp}.backup.dump"
meta_file="artifacts/db-backups/${stamp}.backup.meta.json"

dockerize_url() {
  local raw_url="$1"
  echo "$raw_url" | sed -E 's#@localhost:#@host.docker.internal:#g; s#@127\.0\.0\.1:#@host.docker.internal:#g'
}

run_pg_dump() {
  local db_url="$1"
  local output_file="$2"

  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump "$db_url" -Fc -f "$output_file"
    return $?
  fi

  if command -v docker >/dev/null 2>&1; then
    local docker_url
    docker_url="$(dockerize_url "$db_url")"
    docker run --rm \
      -v "$ROOT_DIR:/repo" \
      postgres:16 \
      pg_dump "$docker_url" -Fc -f "/repo/${output_file}"
    return $?
  fi

  echo "[db:backup:create] neither pg_dump nor docker is available" >&2
  return 1
}

run_pg_dump "$DB_URL" "$backup_file"

if [ ! -s "$backup_file" ]; then
  echo "[db:backup:create] backup file was not created or is empty: $backup_file" >&2
  exit 1
fi

if command -v shasum >/dev/null 2>&1; then
  checksum="$(shasum -a 256 "$backup_file" | awk '{print $1}')"
elif command -v sha256sum >/dev/null 2>&1; then
  checksum="$(sha256sum "$backup_file" | awk '{print $1}')"
else
  checksum="unavailable"
fi

db_name="${DB_URL%%\?*}"
db_name="${db_name##*/}"
size_bytes="$(wc -c < "$backup_file" | tr -d ' ')"

cat > "$meta_file" <<JSON
{
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "pg_dump_custom",
  "database_name": "$db_name",
  "backup_file": "$backup_file",
  "size_bytes": $size_bytes,
  "sha256": "$checksum"
}
JSON

echo "[db:backup:create] PASS: $backup_file"
echo "[db:backup:create] metadata: $meta_file"
