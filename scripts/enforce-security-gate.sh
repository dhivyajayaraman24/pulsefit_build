#!/usr/bin/env bash
set -euo pipefail

declare -A results=(
  [SAST]="${SAST_RESULT:-missing}"
  [DEPENDENCY_CVE]="${DEPENDENCY_RESULT:-missing}"
  [SECRET_SCAN]="${SECRET_RESULT:-missing}"
  [SBOM]="${SBOM_RESULT:-missing}"
  [CONTAINER_SCAN]="${CONTAINER_RESULT:-missing}"
)

failed=0
for gate in "${!results[@]}"; do
  result="${results[$gate]}"
  echo "$gate: $result"
  if [ "$result" != "success" ]; then
    failed=1
  fi
done

if [ "$failed" -ne 0 ]; then
  echo "ARD release policy blocks release: critical/high security findings, failed scans, or missing SBOM must be remediated or formally risk-accepted." >&2
  exit 1
fi
