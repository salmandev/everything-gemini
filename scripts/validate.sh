#!/usr/bin/env bash
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

echo "🔍 Validating Everything Gemini (everything-gemini) repository..."

# 1. Validate SKILL.md Frontmatter
echo "  [1/4] Checking Skills & YAML frontmatter..."
SKILL_FILES=$(find "$REPO_ROOT/skills" "$REPO_ROOT/plugins" -name "SKILL.md" 2>/dev/null || true)

for skill_file in $SKILL_FILES; do
  rel_path="${skill_file#$REPO_ROOT/}"
  
  # Check for YAML frontmatter delimiters
  if ! head -n 1 "$skill_file" | grep -q "^---"; then
    echo "    ❌ ERROR: $rel_path is missing leading '---' frontmatter delimiter"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Check for name field
  if ! grep -q "^name:" "$skill_file"; then
    echo "    ❌ ERROR: $rel_path is missing 'name:' field in frontmatter"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for description field
  if ! grep -q "^description:" "$skill_file"; then
    echo "    ❌ ERROR: $rel_path is missing 'description:' field in frontmatter"
    ERRORS=$((ERRORS + 1))
  fi
  
  echo "    ✔ $rel_path"
done

# 2. Validate JSON Syntax
echo "  [2/4] Validating JSON files..."
JSON_FILES=$(find "$REPO_ROOT" -name "*.json" ! -path "*/node_modules/*" 2>/dev/null || true)

for json_file in $JSON_FILES; do
  rel_path="${json_file#$REPO_ROOT/}"
  if ! node -e "JSON.parse(fs.readFileSync('$json_file', 'utf8'))" 2>/dev/null; then
    echo "    ❌ ERROR: Invalid JSON in $rel_path"
    ERRORS=$((ERRORS + 1))
  else
    echo "    ✔ $rel_path"
  fi
done

# 3. Validate Shell Scripts Executability
echo "  [3/4] Verifying script permissions..."
SH_FILES=$(find "$REPO_ROOT/scripts" "$REPO_ROOT/hooks" "$REPO_ROOT/skills" -name "*.sh" 2>/dev/null || true)

for sh_file in $SH_FILES; do
  rel_path="${sh_file#$REPO_ROOT/}"
  if [ ! -x "$sh_file" ]; then
    echo "    ⚠️ Fixing executable bit on: $rel_path"
    chmod +x "$sh_file"
  fi
  echo "    ✔ $rel_path (executable)"
done

# 4. Summary
echo "  [4/4] Validation Summary"
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ Validation failed with $ERRORS error(s)."
  exit 1
else
  echo "✨ All validations passed successfully! everything-gemini is pristine."
  exit 0
fi
