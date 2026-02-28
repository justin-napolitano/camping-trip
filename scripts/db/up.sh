#!/usr/bin/env bash
set -euo pipefail

DEV_CONTAINER="${DB_DEV_CONTAINER:-camping-dev-db}"
PREVIEW_CONTAINER="${DB_PREVIEW_CONTAINER:-camping-preview-db}"
DEV_DB="${DB_DEV_NAME:-camping_trip_dev}"
PREVIEW_DB="${DB_PREVIEW_NAME:-camping_trip_preview}"
DEV_PORT="${DB_DEV_PORT:-5432}"
PREVIEW_PORT="${DB_PREVIEW_PORT:-5433}"
POSTGRES_USER="${DB_POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${DB_POSTGRES_PASSWORD:-postgres}"
POSTGRES_IMAGE="${DB_POSTGRES_IMAGE:-postgres:16}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[db:up] docker is required but not found" >&2
  exit 1
fi

ensure_running_container() {
  local name="$1"
  local db_name="$2"
  local host_port="$3"

  if docker ps -a --format '{{.Names}}' | rg -x -q "$name"; then
    if ! docker ps --format '{{.Names}}' | rg -x -q "$name"; then
      docker start "$name" >/dev/null
      echo "[db:up] started existing container: $name"
    else
      echo "[db:up] container already running: $name"
    fi
    return 0
  fi

  docker run -d \
    --name "$name" \
    -e "POSTGRES_USER=$POSTGRES_USER" \
    -e "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
    -e "POSTGRES_DB=$db_name" \
    -p "$host_port:5432" \
    "$POSTGRES_IMAGE" >/dev/null
  echo "[db:up] created and started container: $name"
}

wait_ready() {
  local name="$1"
  local max_attempts=30
  local attempt=1

  while [ "$attempt" -le "$max_attempts" ]; do
    if docker exec "$name" pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1; then
      echo "[db:up] ready: $name"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  echo "[db:up] container did not become ready in time: $name" >&2
  exit 1
}

ensure_running_container "$DEV_CONTAINER" "$DEV_DB" "$DEV_PORT"
ensure_running_container "$PREVIEW_CONTAINER" "$PREVIEW_DB" "$PREVIEW_PORT"

wait_ready "$DEV_CONTAINER"
wait_ready "$PREVIEW_CONTAINER"

echo "[db:up] complete"
echo "DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${DEV_PORT}/${DEV_DB}"
echo "PREVIEW_DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PREVIEW_PORT}/${PREVIEW_DB}"
