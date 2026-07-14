#!/usr/bin/env bash
# One-shot snapshot — used by monitor and manual runs
set -euo pipefail
SNAPSHOT=${1:-0}
REPO="/workspace"
MONITOR_DIR="/workspace/.monitor"
SNAPSHOT_DIR="$MONITOR_DIR/snapshots"
SCREENSHOT_DIR="/opt/cursor/artifacts/screenshots"
PORT=8765
LOG_FILE="$MONITOR_DIR/monitor.log"

mkdir -p "$SNAPSHOT_DIR" "$SCREENSHOT_DIR"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

ts=$(date -u +%Y%m%dT%H%M%SZ)
label=$(printf "snap-%02d" "$SNAPSHOT")
snap_dir="$SNAPSHOT_DIR/$label-$ts"
mkdir -p "$snap_dir"

log "=== Snapshot $SNAPSHOT ($label) ==="

cd "$REPO"
git fetch origin --prune 2>&1 | tee "$snap_dir/fetch.log" || true

{
  echo "timestamp_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "snapshot_index: $SNAPSHOT"
  echo "local_branch: $(git branch --show-current)"
  echo "local_head: $(git rev-parse HEAD)"
  echo "remote_head: $(git rev-parse origin/master 2>/dev/null || echo unknown)"
  echo "ahead_behind: $(git rev-list --left-right --count HEAD...origin/master 2>/dev/null || echo '0\t0')"
  echo "working_tree: $(git status --porcelain | wc -l) dirty files"
  echo "recent_commits:"
  git log --oneline -5
  echo "remote_branches:"
  git branch -r
  echo "neo_chess_branch_head:"
  git rev-parse origin/cursor/neo-chess-app-9c2d 2>/dev/null || echo "missing"
  echo "neo_chess_latest_commit:"
  git log origin/cursor/neo-chess-app-9c2d -1 --oneline 2>/dev/null || echo "missing"
  echo "neo_chess_diff_stat:"
  git diff master..origin/cursor/neo-chess-app-9c2d --shortstat 2>/dev/null || echo "missing"
  echo "file_checksums:"
  sha256sum index.html css/styles.css js/app.js js/libraries.js js/scripts.min.js README.md 2>/dev/null || true
} > "$snap_dir/git-state.txt"

git diff HEAD origin/master --stat > "$snap_dir/diff-vs-remote.txt" 2>&1 || true
git log HEAD..origin/master --oneline > "$snap_dir/new-remote-commits.txt" 2>&1 || true
git log origin/cursor/neo-chess-app-9c2d -5 --oneline > "$snap_dir/neo-chess-commits.txt" 2>/dev/null || true

if ! curl -sf "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
  cd "$REPO" && python3 -m http.server "$PORT" --bind 127.0.0.1 > "$MONITOR_DIR/http-server.log" 2>&1 &
  sleep 2
fi

timeout 20 google-chrome --headless=new --disable-gpu --no-sandbox \
  --user-data-dir="/tmp/chrome-headless-$SNAPSHOT-$ts" \
  --window-size=1280,800 --screenshot="$snap_dir/app-screenshot.png" \
  "http://127.0.0.1:$PORT/" 2>"$snap_dir/screenshot.log" || true
cp "$snap_dir/app-screenshot.png" "$SCREENSHOT_DIR/${label}-${ts}.png" 2>/dev/null || true

log "Snapshot $SNAPSHOT complete -> $snap_dir"
echo "$snap_dir"
