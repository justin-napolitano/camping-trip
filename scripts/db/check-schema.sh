#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

schema="prisma/schema.prisma"
migration_dir="prisma/migrations"

for path in "$schema" "$migration_dir"; do
  if [ ! -e "$path" ]; then
    echo "[db:migrate:check] missing required path: $path" >&2
    exit 1
  fi
done

required_models=(
  "model GearItem"
  "model GearClass"
  "model Location"
  "model System"
  "model ReviewIntel"
  "model TripProfile"
  "model FieldTestLog"
  "model CapabilityPolicy"
  "model HomepageKitBundle"
)

for pattern in "${required_models[@]}"; do
  if ! rg -F -q "$pattern" "$schema"; then
    echo "[db:migrate:check] required model missing: $pattern" >&2
    exit 1
  fi
done

required_enums=(
  "enum SourceType"
  "enum TripType"
  "enum PrecipitationRisk"
  "enum Remoteness"
  "enum StaticExposure"
)

for pattern in "${required_enums[@]}"; do
  if ! rg -F -q "$pattern" "$schema"; then
    echo "[db:migrate:check] required enum missing: $pattern" >&2
    exit 1
  fi
done

if ! rg -F -q "@@unique([gearItemId, locationId, reviewDate, authorId, sourceType]" "$schema"; then
  echo "[db:migrate:check] idempotency unique index missing in ReviewIntel" >&2
  exit 1
fi

if ! rg -F -q "onDelete: Restrict" "$schema"; then
  echo "[db:migrate:check] expected onDelete: Restrict relations" >&2
  exit 1
fi

latest_migration="$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n1)"
if [ -z "$latest_migration" ] || [ ! -f "$latest_migration/migration.sql" ]; then
  echo "[db:migrate:check] no migration.sql found under prisma/migrations" >&2
  exit 1
fi

if ! rg -q "CREATE EXTENSION IF NOT EXISTS pg_trgm" "$latest_migration/migration.sql"; then
  echo "[db:migrate:check] migration missing pg_trgm extension setup" >&2
  exit 1
fi

if ! rg -q "gear_item_canonical_search_text_fts_idx" "$latest_migration/migration.sql"; then
  echo "[db:migrate:check] migration missing full-text GIN search index on canonical searchable text" >&2
  exit 1
fi

if ! rg -q "to_tsvector\\('english', COALESCE\\(canonical_search_text, ''\\)\\)" "$latest_migration/migration.sql"; then
  echo "[db:migrate:check] migration missing full-text to_tsvector expression for canonical searchable text" >&2
  exit 1
fi

if ! rg -q "gear_item_name_model_trgm_idx" "$latest_migration/migration.sql"; then
  echo "[db:migrate:check] migration missing trigram GIN index on gear name/model fields" >&2
  exit 1
fi

if ! rg -q "COALESCE\\(name, ''\\) \\|\\| ' ' \\|\\| COALESCE\\(model, ''\\)\\) gin_trgm_ops" "$latest_migration/migration.sql"; then
  echo "[db:migrate:check] migration missing name/model trigram expression index" >&2
  exit 1
fi

echo "[db:migrate:check] PASS"
