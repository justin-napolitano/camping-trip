#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[seed_local] placeholder seed workflow."
echo "[seed_local] validating seed files..."
npm run seed:source:check
npm run seed:source:normalize
npm run seed:validate
echo "[seed_local] importing seed data into DATABASE_URL..."
npm run seed:import:db
echo "[seed_local] validating FK integrity and report artifacts..."
npm run seed:import:test
npm run seed:report
echo "[seed_local] PASS"
