#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p artifacts/db-backups
stamp="$(date -u +"%Y%m%dT%H%M%SZ")"
file="artifacts/db-backups/${stamp}.backup.meta.json"

cat > "$file" <<JSON
{
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "metadata-only-bootstrap",
  "note": "Placeholder backup artifact for preflight/rollback command path verification."
}
JSON

echo "[db:backup:create] PASS: $file"
