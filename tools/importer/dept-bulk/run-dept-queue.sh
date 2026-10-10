#!/usr/bin/env bash
# Long DEPT bulk imports as a queue: the URL list is split into small chunks that <lanes> background
# lanes import one after the other, each chunk in a fresh run-bulk-import.js (fresh Chromium, so
# browser memory does not grow over thousands of pages).
#   tools/importer/dept-bulk/run-dept-queue.sh <urls-file> [lanes, default 3] [chunk size, default 200]
# Re-running resumes: pages already imported are reused (no --force), so finished chunks pass quickly.
# Logs: tools/importer/dept-bulk/logs/<name>-NNN.log (progress: progress.py <name>)
# Keep lanes low: the workspace container has a 4 GB memory cap (each lane runs one Chromium).
set -euo pipefail
cd "$(dirname "$0")/../../.."
URLS="$1"
LANES="${2:-3}"
SIZE="${3:-200}"
NAME="$(basename "$URLS" .txt)"
SCRIPTS=/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts
BULK=tools/importer/dept-bulk
mkdir -p "$BULK/chunks" "$BULK/logs"
rm -f "$BULK/chunks/$NAME"-*.txt
split -l "$SIZE" -d -a 3 --additional-suffix=.txt "$URLS" "$BULK/chunks/$NAME-"
CHUNKS=("$BULK/chunks/$NAME"-*.txt)
for lane in $(seq 0 $((LANES - 1))); do
  mine=()
  for i in "${!CHUNKS[@]}"; do
    if [ $((i % LANES)) -eq "$lane" ]; then mine+=("${CHUNKS[$i]}"); fi
  done
  setsid nohup bash -c '
    scripts="$1"; shift
    for chunk in "$@"; do
      log="tools/importer/dept-bulk/logs/$(basename "$chunk" .txt).log"
      node "$scripts/run-bulk-import.js" --import-script tools/importer/import-dept-site.bundle.js \
        --urls "$chunk" > "$log" 2>&1 || true
    done' lane "$SCRIPTS" "${mine[@]}" > /dev/null 2>&1 &
  echo "lane $lane: ${#mine[@]} chunks, pid $!"
done
