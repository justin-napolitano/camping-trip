#!/usr/bin/env bash
set -euo pipefail

TASK_NAME="${1:-task}"
if [ "${2:-}" = "--help" ] || [ "${1:-}" = "--help" ]; then
  echo "Usage: $0 <task-name> [--help]"
  echo "Placeholder task runner for bootstrap stage."
  exit 0
fi

echo "[noop] ${TASK_NAME}: placeholder command (bootstrap stage)."
