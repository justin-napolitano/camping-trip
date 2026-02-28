#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[test:integration] running integration and data-flow suites..."
npm run integration:check
npm run test:integration-adapters
npm run seed:validate
npm run seed:import:test
npm run seed:report

echo "[test:integration] PASS"
