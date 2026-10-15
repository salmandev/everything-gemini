#!/usr/bin/env bash
# Fast git bisect helper script

TEST_CMD="${1:-npm test}"

echo "Running bisect test: $TEST_CMD"
if eval "$TEST_CMD" >/dev/null 2>&1; then
  echo "Commit is GOOD (tests passed)"
  exit 0
else
  echo "Commit is BAD (tests failed)"
  exit 1
fi
