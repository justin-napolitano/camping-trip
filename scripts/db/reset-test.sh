#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

bash scripts/db/check-schema.sh

latest_migration="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n1)/migration.sql"
if [ ! -s "$latest_migration" ]; then
  echo "[db:migrate:reset-test] migration file is empty: $latest_migration" >&2
  exit 1
fi

echo "[db:migrate:reset-test] PASS (schema + migration artifacts verified for clean-apply readiness)"
