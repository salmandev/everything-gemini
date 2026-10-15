#!/usr/bin/env bash
# Everything Gemini Auto-Lint Formatter: PostToolUse Hook
# Silently runs language-appropriate formatters on modified files.

set -eo pipefail

PAYLOAD=$(cat)

TARGET_FILE=$(node -e "
try {
  const p = JSON.parse(process.argv[1]);
  const file = p.toolCall?.args?.TargetFile || '';
  console.log(file);
} catch (e) {
  console.log('');
}
" "$PAYLOAD")

if [ -z "$TARGET_FILE" ] || [ ! -f "$TARGET_FILE" ]; then
  echo "{}"
  exit 0
fi

EXT="${TARGET_FILE##*.}"

case "$EXT" in
  js|jsx|ts|tsx|json|md)
    if command -v prettier >/dev/null 2>&1; then
      prettier --write "$TARGET_FILE" >/dev/null 2>&1 || true
    fi
    ;;
  py)
    if command -v ruff >/dev/null 2>&1; then
      ruff format "$TARGET_FILE" >/dev/null 2>&1 || true
    elif command -v black >/dev/null 2>&1; then
      black -q "$TARGET_FILE" >/dev/null 2>&1 || true
    fi
    ;;
  go)
    if command -v gofmt >/dev/null 2>&1; then
      gofmt -w "$TARGET_FILE" >/dev/null 2>&1 || true
    fi
    ;;
esac

# PostToolUse expects an empty JSON object
echo "{}"
exit 0
