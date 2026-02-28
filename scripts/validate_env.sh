#!/usr/bin/env bash
set -euo pipefail

required_cmds=(bash npm rg)

for cmd in "${required_cmds[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[validate_env] missing required command: $cmd" >&2
    exit 1
  fi
done

echo "[validate_env] environment check passed."
