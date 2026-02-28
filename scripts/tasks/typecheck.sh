#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[typecheck] checking TypeScript syntax via Node strip-types..."
count=0
while IFS= read -r -d '' file; do
  node --experimental-strip-types --check "$file" >/dev/null
  count=$((count + 1))
done < <(find src scripts app -type f -name '*.ts' -print0)

echo "[typecheck] PASS (${count} TypeScript files checked)"
