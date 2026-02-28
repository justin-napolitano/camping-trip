#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

required=(
  "src/integrations/adapter.ts"
  "src/integrations/notion/index.ts"
  "src/integrations/adapter.mjs"
  "src/integrations/notion/index.mjs"
)

for path in "${required[@]}"; do
  if [ ! -f "$path" ]; then
    echo "[integration:check] missing required file: $path" >&2
    exit 1
  fi
done

if ! rg -q "NOTION_ENABLED" src/integrations/notion/index.ts src/integrations/notion/index.mjs; then
  echo "[integration:check] expected NOTION_ENABLED guard in notion adapter" >&2
  exit 1
fi

if ! rg -q "NOTION_TOKEN" src/integrations/notion/index.ts src/integrations/notion/index.mjs; then
  echo "[integration:check] expected NOTION_TOKEN guard in notion adapter" >&2
  exit 1
fi

echo "[integration:check] PASS"
