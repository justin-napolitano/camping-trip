#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[guard] checking for legacy seed package leakage into canonical runtime/contract paths..."

LEGACY_REF_REGEX='capability-engine-seed-final|reference/legacy-capability-seed|legacy-capability-seed'
CANONICAL_PATHS=(src schemas docs/openapi prisma)
SCAN_TARGETS=()

for path in "${CANONICAL_PATHS[@]}"; do
  if [ -e "$path" ]; then
    SCAN_TARGETS+=("$path")
  fi
done

if [ "${#SCAN_TARGETS[@]}" -eq 0 ]; then
  echo "[guard] canonical paths not present yet; skipping import leak scan."
else
  if rg -n --hidden --glob '!**/node_modules/**' --glob '!**/.next/**' "$LEGACY_REF_REGEX" "${SCAN_TARGETS[@]}"; then
    echo "[guard] FAIL: found legacy package references in canonical paths."
    exit 1
  fi
fi

LEGACY_ENUM_OR_FIELD_REGEX='"near"|"style"|"precipitation"'
CONTRACT_TARGETS=()

for path in schemas src/contracts docs/openapi/v1.yaml; do
  if [ -e "$path" ]; then
    CONTRACT_TARGETS+=("$path")
  fi
done

if [ "${#CONTRACT_TARGETS[@]}" -eq 0 ]; then
  echo "[guard] canonical contract files not present yet; skipping enum leak scan."
else
  if rg -n --hidden --glob '!**/node_modules/**' "$LEGACY_ENUM_OR_FIELD_REGEX" "${CONTRACT_TARGETS[@]}"; then
    echo "[guard] FAIL: found legacy trip model fields/enums in canonical contracts."
    echo "[guard] blocked tokens: near, style, precipitation"
    exit 1
  fi
fi

echo "[guard] PASS: no legacy leakage detected."
