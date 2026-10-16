#!/usr/bin/env bash
# ==============================================================================
# Everything Gemini CLI Workflow Automation Demo
# Demonstrates initializing an empty workspace, installing profiles,
# adding individual skills, and running automated skill validation.
# ==============================================================================

set -euo pipefail

CLI="everything-gemini"
if [ -f "./bin/everything-gemini" ]; then
  CLI="./bin/everything-gemini"
fi

DEMO_DIR="$(mktemp -d -t egemini-demo-XXXXXX)"
echo "🚀 Initializing demo workspace at: $DEMO_DIR"

# Ensure cleanup on script exit
trap 'echo "🧹 Cleaning up demo workspace..."; node -e "try { require(\"fs\").rmSync(process.argv[1], {recursive: true, force: true}); } catch(e){}" "$DEMO_DIR"' EXIT

# 1. Initialize workspace with Everything Gemini
echo -e "\n📦 Step 1: Initializing developer profile in workspace..."
$CLI init --workspace "$DEMO_DIR"

# 2. Add specific on-demand skills
echo -e "\n⚡ Step 2: Adding frontier skills to the workspace..."
$CLI add skill agent-evals --workspace "$DEMO_DIR"
$CLI add skill docker-compose-orchestrator --workspace "$DEMO_DIR"

# 3. Add a scoped subagent
echo -e "\n🤖 Step 3: Adding architect subagent..."
$CLI add agent architect --workspace "$DEMO_DIR"

# 4. Validate skill configuration
echo -e "\n🔍 Step 4: Validating installed skills..."
$CLI test-skill agent-evals

echo -e "\n✨ Workflow demo completed successfully!"
echo "Workspace verified at: $DEMO_DIR"
