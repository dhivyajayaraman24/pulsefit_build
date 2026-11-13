#!/usr/bin/env bash
set -euo pipefail

if npm run | grep -qE '^  test$'; then
  npm test -- --runInBand
elif find . -maxdepth 3 -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) | grep -q .; then
  echo "Test files exist but no npm test script is configured." >&2
  exit 1
else
  echo "No JavaScript test files are scaffolded for $(pwd); build and type checks remain mandatory."
fi
