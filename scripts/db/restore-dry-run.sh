#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

latest="$(ls -1 artifacts/db-backups/*.backup.meta.json 2>/dev/null | sort | tail -n1 || true)"
if [ -z "$latest" ]; then
  echo "[db:restore:dry-run] no backup metadata found; run npm run db:backup:create first" >&2
  exit 1
fi

echo "[db:restore:dry-run] PASS: validated backup artifact exists: $latest"
echo "[db:restore:dry-run] no destructive restore executed in bootstrap mode"
