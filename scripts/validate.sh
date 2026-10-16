#!/usr/bin/env bash
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

echo "🔍 Validating Everything Gemini (everything-gemini) repository..."

# 1. Validate SKILL.md Frontmatter
echo "  [1/5] Checking Skills & YAML frontmatter..."
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

# 2. Validate Scoped Subagents
echo "  [2/5] Checking Subagents specifications..."
REQUIRED_AGENTS=("planner.md" "code-reviewer.md" "browser-qa.md" "build-repair.md" "security-auditor.md" "architect.md")
for ag in "${REQUIRED_AGENTS[@]}"; do
  if [ ! -f "$REPO_ROOT/agents/$ag" ]; then
    echo "    ❌ ERROR: Required subagent specification 'agents/$ag' is missing!"
    ERRORS=$((ERRORS + 1))
  fi
done

AGENT_FILES=$(find "$REPO_ROOT/agents" -name "*.md" 2>/dev/null || true)
for agent_file in $AGENT_FILES; do
  rel_path="${agent_file#$REPO_ROOT/}"
  if ! grep -q "^# " "$agent_file"; then
    echo "    ❌ ERROR: $rel_path is missing top-level '# ' title"
    ERRORS=$((ERRORS + 1))
  else
    echo "    ✔ $rel_path"
  fi
done

# 3. Validate JSON & YAML Files
echo "  [3/5] Validating JSON files & Action manifest..."
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

if [ -f "$REPO_ROOT/action.yml" ]; then
  if grep -q "name:" "$REPO_ROOT/action.yml" && grep -q "runs:" "$REPO_ROOT/action.yml"; then
    echo "    ✔ action.yml (composite GitHub action valid)"
  else
    echo "    ❌ ERROR: action.yml is missing required composite action fields"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 4. Validate Shell Scripts & CLI Executability
echo "  [4/5] Verifying script permissions..."
EXEC_FILES=$(find "$REPO_ROOT/scripts" "$REPO_ROOT/hooks" "$REPO_ROOT/skills" "$REPO_ROOT/examples" "$REPO_ROOT/bin" -type f \( -name "*.sh" -o -name "everything-gemini" \) 2>/dev/null || true)

for exec_file in $EXEC_FILES; do
  rel_path="${exec_file#$REPO_ROOT/}"
  if [ ! -x "$exec_file" ]; then
    echo "    ⚠️ Fixing executable bit on: $rel_path"
    chmod +x "$exec_file"
  fi
  echo "    ✔ $rel_path (executable)"
done

# 5. Summary
echo "  [5/5] Validation Summary"
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ Validation failed with $ERRORS error(s)."
  exit 1
else
  echo "✨ All validations passed successfully! everything-gemini is pristine."
  exit 0
fi
