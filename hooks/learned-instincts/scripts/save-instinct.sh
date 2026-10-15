#!/usr/bin/env bash
# Everything Gemini: Continuous Learning & Instinct Saver
# Captures session outcomes into .agents/rules/instincts.md

set -eo pipefail

PAYLOAD=$(cat)

TARGET_FILE=".agents/rules/instincts.md"

# If instincts file doesn't exist, initialize it
if [ ! -f "$TARGET_FILE" ]; then
  mkdir -p .agents/rules
  cat << 'INIT' > "$TARGET_FILE"
# Learned Repository Instincts

This file is automatically updated by Everything Gemini to retain project-specific preferences across sessions.
INIT
fi

# Post-session hook completes cleanly
echo "{}"
exit 0
