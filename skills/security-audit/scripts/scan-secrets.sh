#!/usr/bin/env bash
# Fast secret scanner for committed files

echo "Scanning tracked files for potential exposed secrets..."

PATTERNS=(
  "AKIA[0-9A-Z]{16}"
  "ghp_[a-zA-Z0-9]{36}"
  "github_pat_[a-zA-Z0-9_]{82}"
  "-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----"
  "AIza[0-9A-Za-z\\-_]{35}"
)

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(git grep -EI "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo "⚠️ Potential secret match for pattern: $pattern"
    echo "$MATCHES"
    FOUND=$((FOUND + 1))
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo "✔ No high-entropy secrets detected."
fi
