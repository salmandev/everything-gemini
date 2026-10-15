#!/usr/bin/env bash
# Everything Gemini Goal Verifier: Stop Hook
# Checks if the workspace has uncommitted broken tests before allowing termination.

set -eo pipefail

PAYLOAD=$(cat)

# Inspect git status if in a git repository
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  # Check if there are modified files
  CHANGES=$(git status --porcelain)
  if [ -n "$CHANGES" ]; then
    # If package.json has a test script, verify tests pass
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
      if ! npm test >/dev/null 2>&1; then
        echo "{\"decision\": \"continue\", \"reason\": \"[Everything Gemini Goal Verifier] Uncommitted changes failed 'npm test'. Please resolve failing tests before stopping.\"}"
        exit 0
      fi
    fi
  fi
fi

# Allow stop
echo "{}"
exit 0
