#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[test:unit] running contract and capability unit suites..."
npm run test:contract
npm run test:capability-rules
npm run test:trip-evaluation
npm run test:trip-endpoint

echo "[test:unit] PASS"
