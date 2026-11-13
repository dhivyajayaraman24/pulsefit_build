#!/usr/bin/env bash
set -euo pipefail

if [ -d test ] && find test -type f -name "*_test.dart" | grep -q .; then
  flutter test
else
  echo "No Flutter tests are scaffolded yet; flutter analyze and release build remain mandatory."
fi
