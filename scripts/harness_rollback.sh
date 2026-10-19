#!/usr/bin/env bash
# Everything Gemini Harness² Rollback Tool
# Restores the workspace state from an ephemeral snapshot when a candidate probe fails.

set -eo pipefail

SNAPSHOT_DIR="${1:-.harness_snapshot}"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "{\"status\": \"error\", \"message\": \"No snapshot directory found at $SNAPSHOT_DIR\"}"
  exit 0
fi

# 1. If patch file exists, restore
if [ -f "$SNAPSHOT_DIR/worktree.patch" ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  # Revert changes made during probe
  git checkout . 2>/dev/null || true
  if [ -s "$SNAPSHOT_DIR/worktree.patch" ]; then
    git apply "$SNAPSHOT_DIR/worktree.patch" 2>/dev/null || true
  fi
fi

# Clean up snapshot directory
rm -rf "$SNAPSHOT_DIR"

echo "{\"status\": \"rollback_complete\", \"snapshotDir\": \"$SNAPSHOT_DIR\"}"
