#!/usr/bin/env bash
# Bulk import of dept.global pages with tools/importer/import-dept-site.bundle.js, in parallel.
#   tools/importer/dept-bulk/run-dept-bulk.sh <urls-file> [parallel runs, default 3]
# Splits the URL list into chunks (tools/importer/dept-bulk/chunks/<name>-NN.txt) and runs one
# run-bulk-import.js per chunk in the background. Without --force, pages already imported are
# reused, so the script can be re-run to resume; FORCE=1 re-imports them.
# Logs: tools/importer/dept-bulk/logs/<name>-NN.log
# Each run starts its own Chromium (~0.5 GB): keep the number of runs low, the workspace container
# has a 4 GB memory cap and is restarted when it goes over it.
set -euo pipefail
cd "$(dirname "$0")/../../.."
URLS="$1"
N="${2:-3}"
NAME="$(basename "$URLS" .txt)"
SCRIPTS=/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts
BULK=tools/importer/dept-bulk
FORCE_ARG=()
if [ "${FORCE:-}" = "1" ]; then FORCE_ARG=(--force); fi
mkdir -p "$BULK/chunks" "$BULK/logs"
rm -f "$BULK/chunks/$NAME"-*.txt
TOTAL=$(grep -c . "$URLS")
PER=$(( (TOTAL + N - 1) / N ))
split -l "$PER" -d -a 2 --additional-suffix=.txt "$URLS" "$BULK/chunks/$NAME-"
for chunk in "$BULK/chunks/$NAME"-*.txt; do
  log="$BULK/logs/$(basename "$chunk" .txt).log"
  setsid nohup node "$SCRIPTS/run-bulk-import.js" \
    --import-script tools/importer/import-dept-site.bundle.js \
    --urls "$chunk" "${FORCE_ARG[@]}" > "$log" 2>&1 &
  echo "started $(basename "$chunk") ($(grep -c . "$chunk") urls) pid $! -> $log"
done
