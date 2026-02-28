#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

bash scripts/contract/check-legacy-leak.sh

required_paths=(
  "schemas"
  "docs/openapi/v1.yaml"
  "src/contracts/index.mjs"
)

for path in "${required_paths[@]}"; do
  if [ ! -e "$path" ]; then
    echo "[contract:validate] missing required path: $path" >&2
    exit 1
  fi
done

required_endpoints=(
  "/api/v1/gear"
  "/api/v1/gear/{slug}"
  "/api/v1/gear/{slug}/locations"
  "/api/v1/homepage/kits"
  "/api/v1/locations"
  "/api/v1/systems"
  "/api/v1/trips/evaluate"
  "/api/v1/review-intel"
  "/api/v1/import/review-intel"
  "/api/v1/import/entities"
  "/api/v1/media/upload-url"
  "/api/v1/media/complete"
)

for endpoint in "${required_endpoints[@]}"; do
  if ! rg -F -q "${endpoint}" docs/openapi/v1.yaml; then
    echo "[contract:validate] endpoint missing from openapi: ${endpoint}" >&2
    exit 1
  fi
done

required_schema_refs=(
  "TripsEvaluateRequest.schema.json"
  "TripsEvaluateResponse.schema.json"
  "HomepageKitsResponse.schema.json"
  "ErrorResponse.schema.json"
)

for schema_ref in "${required_schema_refs[@]}"; do
  if ! rg -q "${schema_ref}" docs/openapi/v1.yaml; then
    echo "[contract:validate] required schema ref missing in openapi: ${schema_ref}" >&2
    exit 1
  fi
  if [ ! -f "schemas/${schema_ref}" ]; then
    echo "[contract:validate] missing schema file: schemas/${schema_ref}" >&2
    exit 1
  fi
done

if rg -n "TODO|TBD" docs/openapi/v1.yaml schemas src/contracts/index.mjs; then
  echo "[contract:validate] remove TODO/TBD placeholders from contract files." >&2
  exit 1
fi

echo "[contract:validate] PASS"
