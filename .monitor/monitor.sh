#!/usr/bin/env bash
# Monitor remote repo + local state every 5 minutes for 1 hour (13 snapshots)
set -euo pipefail

REPO="/workspace"
MONITOR_DIR="/workspace/.monitor"
SNAPSHOT_DIR="$MONITOR_DIR/snapshots"
SCREENSHOT_DIR="/opt/cursor/artifacts/screenshots"
LOG_FILE="$MONITOR_DIR/monitor.log"
SUMMARY_FILE="$MONITOR_DIR/summary.jsonl"
PORT=8765
INTERVAL=300   # 5 minutes
DURATION=3600  # 1 hour
END_TIME=${END_TIME:-$(($(date +%s) + DURATION))}
SNAPSHOT=${SNAPSHOT:-0}

mkdir -p "$SNAPSHOT_DIR" "$SCREENSHOT_DIR"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

take_snapshot() {
  local ts label snap_dir
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
    echo "line_counts:"
    wc -l index.html css/styles.css js/app.js js/libraries.js js/scripts.min.js 2>/dev/null || true
  } > "$snap_dir/git-state.txt"

  git diff HEAD origin/master --stat > "$snap_dir/diff-vs-remote.txt" 2>&1 || true
  git log HEAD..origin/master --oneline > "$snap_dir/new-remote-commits.txt" 2>&1 || true
  git log origin/master..HEAD --oneline > "$snap_dir/local-only-commits.txt" 2>&1 || true

  # Screenshot via headless Chrome (with timeout so monitor never hangs)
  if curl -sf "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    timeout 20 google-chrome --headless=new --disable-gpu --no-sandbox \
      --user-data-dir="/tmp/chrome-headless-$SNAPSHOT" \
      --window-size=1280,800 --screenshot="$snap_dir/app-screenshot.png" \
      "http://127.0.0.1:$PORT/" 2>"$snap_dir/screenshot.log" || true
    cp "$snap_dir/app-screenshot.png" "$SCREENSHOT_DIR/${label}-${ts}.png" 2>/dev/null || true
    log "Screenshot saved: $snap_dir/app-screenshot.png"
  else
    log "WARN: HTTP server not reachable on port $PORT"
  fi

  # JSONL summary line
  python3 - <<PY >> "$SUMMARY_FILE"
import json, pathlib
snap = pathlib.Path("$snap_dir/git-state.txt").read_text()
lines = {k.strip(): v.strip() for k,v in (l.split(":",1) for l in snap.splitlines() if ":" in l)}
print(json.dumps({
  "snapshot": $SNAPSHOT,
  "label": "$label",
  "timestamp_utc": lines.get("timestamp_utc"),
  "local_head": lines.get("local_head"),
  "remote_head": lines.get("remote_head"),
  "ahead_behind": lines.get("ahead_behind"),
  "dirty_files": lines.get("working_tree"),
  "screenshot": "$snap_dir/app-screenshot.png" if pathlib.Path("$snap_dir/app-screenshot.png").exists() else None,
}))
PY

  SNAPSHOT=$((SNAPSHOT + 1))
}

# Start static server if not running
if ! curl -sf "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
  log "Starting HTTP server on port $PORT"
  cd "$REPO"
  python3 -m http.server "$PORT" --bind 127.0.0.1 > "$MONITOR_DIR/http-server.log" 2>&1 &
  sleep 2
fi

log "Monitoring started. Interval=${INTERVAL}s Duration=${DURATION}s"

while [ "$(date +%s)" -lt "$END_TIME" ]; do
  take_snapshot
  remaining=$((END_TIME - $(date +%s)))
  if [ "$remaining" -le 0 ]; then
    break
  fi
  sleep_for=$INTERVAL
  if [ "$remaining" -lt "$INTERVAL" ]; then
    sleep_for=$remaining
  fi
  log "Sleeping ${sleep_for}s (${remaining}s remaining)"
  sleep "$sleep_for"
done

log "Monitoring complete. $SNAPSHOT snapshots taken."
