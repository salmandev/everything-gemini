#!/usr/bin/env bash
# Quick Node.js CPU profiling helper

TARGET="${1:-index.js}"
DURATION="${2:-10}"

echo "Starting CPU profiling for $TARGET ($DURATION seconds)..."
NODE_V8_COVERAGE=coverage node --cpu-prof "$TARGET" &
PID=$!

sleep "$DURATION"
kill -SIGINT "$PID" 2>/dev/null || true
echo "CPU profile generated. Look for CPU.*.cpuprofile in the directory."
