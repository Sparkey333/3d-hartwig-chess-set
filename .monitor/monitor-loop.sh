#!/usr/bin/env bash
set -euo pipefail
MONITOR_DIR="/workspace/.monitor"
LOG_FILE="$MONITOR_DIR/monitor.log"
INTERVAL=300
DURATION=3300  # 55 min remaining from snap-01
END_TIME=$(($(date +%s) + DURATION))
SNAPSHOT=2

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

log "Hourly loop restarted from snapshot $SNAPSHOT"

while [ "$(date +%s)" -lt "$END_TIME" ]; do
  /workspace/.monitor/take-snapshot.sh "$SNAPSHOT" || true
  SNAPSHOT=$((SNAPSHOT + 1))
  remaining=$((END_TIME - $(date +%s)))
  [ "$remaining" -le 0 ] && break
  sleep_for=$INTERVAL
  [ "$remaining" -lt "$INTERVAL" ] && sleep_for=$remaining
  log "Sleeping ${sleep_for}s (${remaining}s remaining)"
  sleep "$sleep_for"
done

log "Hourly monitoring complete."
