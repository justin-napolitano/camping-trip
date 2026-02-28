#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[lint] checking JavaScript syntax..."
while IFS= read -r -d '' file; do
  node --check "$file" >/dev/null
done < <(find app scripts src -type f \( -name '*.js' -o -name '*.mjs' \) -print0)

echo "[lint] checking shell script syntax..."
while IFS= read -r -d '' file; do
  bash -n "$file"
done < <(find scripts -type f -name '*.sh' -print0)

echo "[lint] validating JSON files..."
while IFS= read -r -d '' file; do
  node -e 'const fs=require("node:fs"); JSON.parse(fs.readFileSync(process.argv[1],"utf8"));' "$file"
done < <(find . \
  -type d \( -name .git -o -name node_modules \) -prune -o \
  -type f -name '*.json' -print0)

echo "[lint] PASS"
