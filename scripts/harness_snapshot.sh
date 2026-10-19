#!/usr/bin/env bash
# Everything Gemini Harness² Snapshot Tool
# Takes an ephemeral state snapshot of the workspace before running candidate probes.

set -eo pipefail

SNAPSHOT_DIR="${1:-.harness_snapshot}"
mkdir -p "$SNAPSHOT_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 1. Git-based diff snapshot if in git worktree
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git diff HEAD > "$SNAPSHOT_DIR/worktree.patch" 2>/dev/null || true
  git status --porcelain > "$SNAPSHOT_DIR/status.txt" 2>/dev/null || true
  GIT_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
else
  GIT_HEAD="non-git"
fi

cat <<EOF > "$SNAPSHOT_DIR/snapshot_manifest.json"
{
  "timestamp": "$TIMESTAMP",
  "gitHead": "$GIT_HEAD",
  "snapshotDir": "$SNAPSHOT_DIR",
  "status": "active"
}
EOF

echo "{\"status\": \"snapshot_created\", \"timestamp\": \"$TIMESTAMP\", \"snapshotDir\": \"$SNAPSHOT_DIR\"}"
