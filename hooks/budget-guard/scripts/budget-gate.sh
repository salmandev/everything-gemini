#!/usr/bin/env bash
# Everything Gemini Budget Guard: Hard Spend & Token Cap Gate
# Intercepts tool execution to prevent runaway API spend in recursive Harness² loops.
# Reads protojson hook payload from stdin, evaluates spend against ceiling, outputs JSON on stdout.

set -eo pipefail

PAYLOAD=$(cat)

OUTPUT=$(node -e "
const fs = require('fs');
const path = require('path');

const maxUsdEnv = process.env.MAX_USD_BUDGET || process.env.BUDGET_CAP_USD;
const stateFile = process.env.BUDGET_STATE_FILE || path.join(process.cwd(), '.budget_state.json');

let state = { totalSpentUsd: 0.0, totalInvocations: 0, lastCheck: new Date().toISOString() };
if (fs.existsSync(stateFile)) {
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (_) {}
}

let costDelta = 0.005; // Base default estimation per tool step (~1500 tokens Gemini 1.5/2.0)
try {
  const p = JSON.parse(process.argv[1] || '{}');
  if (p.tokens) {
    const promptTokens = p.tokens.prompt || 0;
    const completionTokens = p.tokens.completion || 0;
    // Gemini Flash pricing: $0.075 / 1M prompt, $0.30 / 1M completion
    costDelta = (promptTokens * 0.000000075) + (completionTokens * 0.00000030);
  }
} catch (_) {}

state.totalSpentUsd = parseFloat((state.totalSpentUsd + costDelta).toFixed(5));
state.totalInvocations += 1;
state.lastCheck = new Date().toISOString();

try {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
} catch (_) {}

if (maxUsdEnv) {
  const maxCap = parseFloat(maxUsdEnv);
  if (!isNaN(maxCap) && state.totalSpentUsd >= maxCap) {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: \`[Budget Guard] Hard spend limit reached: $\${state.totalSpentUsd.toFixed(3)} >= $\${maxCap.toFixed(2)}. Halting recursive harness execution to prevent credit exhaustion.\`
    }));
    process.exit(0);
  }
}

console.log(JSON.stringify({ decision: 'allow' }));
" "$PAYLOAD")

echo "$OUTPUT"
