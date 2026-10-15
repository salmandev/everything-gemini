#!/usr/bin/env bash
# GeminiShield: Advanced PreToolUse Guardrail
# Inspects command line execution for catastrophic commands, secret leaks, and security violations.

set -eo pipefail

PAYLOAD=$(cat)

CMD=$(node -e "
try {
  const p = JSON.parse(process.argv[1]);
  const cmd = p.toolCall?.args?.CommandLine || '';
  console.log(cmd);
} catch (e) {
  console.log('');
}
" "$PAYLOAD")

# 1. Hard Blocked Catastrophic Patterns
BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf *"
  ":(){ :|:& };:"
  "mkfs"
  "dd if="
  "> /dev/sda"
  "chmod -R 777 /"
  "git push --force origin main"
  "git push -f origin main"
  "git push --force origin master"
  "git push -f origin master"
  "drop database"
  "drop schema"
  "truncate table"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$CMD" == *"$pattern"* ]]; then
    echo "{\"decision\": \"deny\", \"reason\": \"[GeminiShield] Execution blocked: detected catastrophic destructive command pattern '$pattern'.\"}"
    exit 0
  fi
done

# 2. Sensitive Patterns Requiring Explicit User Review
ASK_PATTERNS=(
  "git reset --hard"
  "git clean -fd"
  "npm publish"
  "pnpm publish"
  "docker system prune"
  "kubectl delete namespace"
  "terraform destroy"
)

for pattern in "${ASK_PATTERNS[@]}"; do
  if [[ "$CMD" == *"$pattern"* ]]; then
    echo "{\"decision\": \"ask\", \"reason\": \"[GeminiShield] Sensitive administrative command requires confirmation: '$pattern'.\"}"
    exit 0
  fi
done

# 3. Secret Leakage Heuristic
SECRET_MATCH=$(echo "$CMD" | grep -Ei "(export\s+[A-Z0-9_]*TOKEN=[a-zA-Z0-9_\-]{20,}|export\s+[A-Z0-9_]*KEY=[a-zA-Z0-9_\-]{20,})" || true)
if [ -n "$SECRET_MATCH" ]; then
  echo "{\"decision\": \"deny\", \"reason\": \"[GeminiShield] Hardcoded credential or API secret detected in command line arguments.\"}"
  exit 0
fi

# Default allow
echo "{\"decision\": \"allow\"}"
exit 0
