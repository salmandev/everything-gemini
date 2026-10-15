#!/usr/bin/env bash
# ==============================================================================
# Everything Gemini CLI Workflow Automation Demo
# Demonstrates initializing an empty workspace, installing profiles,
# adding individual skills, and running automated skill validation.
# ==============================================================================

set -euo pipefail

DEMO_DIR="$(mktemp -d -t everything-gemini-demo-XXXXXX)"
echo "🚀 Initializing demo workspace at: $DEMO_DIR"

# 1. Initialize workspace with Everything Gemini
echo -e "\n📦 Step 1: Initializing developer profile in workspace..."
everything-gemini init --workspace "$DEMO_DIR"

# 2. Add specific on-demand skills
echo -e "\n⚡ Step 2: Adding frontier skills to the workspace..."
everything-gemini add skill agent-evals --workspace "$DEMO_DIR"
everything-gemini add skill docker-compose-orchestrator --workspace "$DEMO_DIR"

# 3. Add a scoped subagent
echo -e "\n🤖 Step 3: Adding architect subagent..."
everything-gemini add agent architect --workspace "$DEMO_DIR"

# 4. Validate skill configuration
echo -e "\n🔍 Step 4: Validating installed skills..."
everything-gemini test-skill agent-evals

echo -e "\n✨ Workflow demo completed successfully!"
echo "Inspect the workspace structure at: $DEMO_DIR"
