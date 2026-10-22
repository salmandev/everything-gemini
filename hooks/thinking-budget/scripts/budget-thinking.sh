#!/usr/bin/env bash
# Everything Gemini Thinking Budget Hook: Dynamic Reasoning Token Cap Gate
# Intercepts tool calls and model requests to prevent runaway thinking token expenditure.
# Reads protojson hook payload from stdin, evaluates thinking tokens against ceiling, outputs JSON on stdout.

set -eo pipefail

PAYLOAD=$(cat)

OUTPUT=$(node -e "
const fs = require('fs');
const path = require('path');

const maxThinkingEnv = process.env.MAX_THINKING_BUDGET || process.env.THINKING_TOKEN_CAP;
const stateFile = process.env.THINKING_STATE_FILE || path.join(process.cwd(), '.thinking_state.json');

let state = { totalThinkingTokens: 0, totalCalls: 0, lastCheck: new Date().toISOString() };
if (fs.existsSync(stateFile)) {
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (_) {}
}

let thinkingDelta = 512; // Base default estimation per complex tool/reasoning turn
try {
  const p = JSON.parse(process.argv[1] || '{}');
  if (p.thinking_tokens) {
    thinkingDelta = parseInt(p.thinking_tokens, 10) || thinkingDelta;
  } else if (p.tokens && p.tokens.thinking) {
    thinkingDelta = parseInt(p.tokens.thinking, 10) || thinkingDelta;
  }
} catch (_) {}

state.totalThinkingTokens += thinkingDelta;
state.totalCalls += 1;
state.lastCheck = new Date().toISOString();

try {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
} catch (_) {}

if (maxThinkingEnv) {
  const maxCap = parseInt(maxThinkingEnv, 10);
  if (!isNaN(maxCap) && state.totalThinkingTokens >= maxCap) {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: \`[Thinking Budget Guard] Thinking token cap reached: \${state.totalThinkingTokens} >= \${maxCap}. Throttling extended reasoning to prevent token exhaustion.\`
    }));
    process.exit(0);
  }
}

console.log(JSON.stringify({ decision: 'allow' }));
" "$PAYLOAD")

echo "$OUTPUT"
