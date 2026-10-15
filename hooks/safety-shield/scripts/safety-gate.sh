#!/usr/bin/env bash
# eagy Safety Shield: PreToolUse Security Gate
# Reads protojson hook payload from stdin, evaluates safety, outputs JSON on stdout.

set -eo pipefail

PAYLOAD=$(cat)

# Extract CommandLine using node or python
CMD=$(node -e "
try {
  const p = JSON.parse(process.argv[1]);
  const cmd = p.toolCall?.args?.CommandLine || '';
  console.log(cmd);
} catch (e) {
  console.log('');
}
" "$PAYLOAD")

# Dangerous patterns list
BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf *"
  ":(){ :|:& };:"
  "mkfs"
  "dd if="
  "chmod -R 777 /"
  "git push --force origin main"
  "git push -f origin main"
  "git push --force origin master"
  "git push -f origin master"
  "drop database"
  "truncate table"
)

# Sensitive patterns that should ask user confirmation
ASK_PATTERNS=(
  "git reset --hard"
  "git clean -fd"
  "npm publish"
  "docker system prune -a"
  "kubectl delete namespace"
)

# Check blocked patterns
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$CMD" == *"$pattern"* ]]; then
    echo "{\"decision\": \"deny\", \"reason\": \"[eagy Safety Shield] Catastrophic command pattern detected and blocked: '$pattern'\"}"
    exit 0
  fi
done

# Check ask patterns
for pattern in "${ASK_PATTERNS[@]}"; do
  if [[ "$CMD" == *"$pattern"* ]]; then
    echo "{\"decision\": \"ask\", \"reason\": \"[eagy Safety Shield] Potentially destructive command requires user confirmation: '$pattern'\"}"
    exit 0
  fi
done

# Default allow
echo "{\"decision\": \"allow\"}"
exit 0
