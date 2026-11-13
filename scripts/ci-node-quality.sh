#!/usr/bin/env bash
set -euo pipefail

if npm run | grep -qE '^  lint$'; then
  npm run lint
elif npm run | grep -qE '^  typecheck$'; then
  npm run typecheck
elif npm run | grep -qE '^  type-check$'; then
  npm run type-check
elif [ -f tsconfig.json ]; then
  npm exec tsc -- --noEmit -p tsconfig.json
else
  echo "No lint or type-check target found for $(pwd); scaffold has no checkable source."
fi
