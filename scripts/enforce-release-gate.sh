#!/usr/bin/env bash
set -euo pipefail

declare -A results=(
  [BACKEND]="${BACKEND_RESULT:-missing}"
  [REACT]="${REACT_RESULT:-missing}"
  [FLUTTER]="${FLUTTER_RESULT:-missing}"
  [TERRAFORM]="${TERRAFORM_RESULT:-missing}"
  [DOCKER]="${DOCKER_RESULT:-missing}"
  [SECURITY]="${SECURITY_RESULT:-missing}"
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
  echo "Release is blocked until build, lint/type, test, infrastructure, container, and security gates pass." >&2
  exit 1
fi
