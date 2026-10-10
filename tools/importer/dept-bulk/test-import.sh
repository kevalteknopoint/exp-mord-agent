#!/usr/bin/env bash
# Re-imports a few dept.global pages with the current parsers, using a private bundle per caller
# (so parallel work does not overwrite tools/importer/import-dept-site.bundle.js).
#   tools/importer/dept-bulk/test-import.sh <tag> <url> [url...]
# Output: content/dept/<live path>.plain.html (preview: http://localhost:3000/content/dept/<live path>)
# The private bundles (tools/importer/import-dept-site-test-<tag>.*) are gitignored.
set -euo pipefail
cd "$(dirname "$0")/../../.."
TAG="$1"; shift
SCRIPTS=/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts
SRC="tools/importer/import-dept-site-test-$TAG.js"
cp tools/importer/import-dept-site.js "$SRC"
"$SCRIPTS/aem-import-bundle.sh" --importjs "$SRC" > /dev/null
URLS="tools/importer/dept-bulk/chunks/test-$TAG.txt"
mkdir -p "$(dirname "$URLS")"
printf '%s\n' "$@" > "$URLS"
node "$SCRIPTS/run-bulk-import.js" --import-script "${SRC%.js}.bundle.js" --urls "$URLS" --force 2>&1 \
  | grep -vE 'Browser Console|^\s+at |^$' | grep -E '^\[[0-9]+/|✅|❌|⚠️|completeness|Error|handler' || true
