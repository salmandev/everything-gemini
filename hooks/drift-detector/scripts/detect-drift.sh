#!/usr/bin/env bash
# Everything Gemini Drift Detector Hook: Semantic Drift & Prompt Injection Guard
# Inspects tool call inputs to detect prompt injection vectors, unexpected environment leakage, and schema drift.
# Reads protojson hook payload from stdin, evaluates tool arguments, outputs JSON on stdout.

set -eo pipefail

PAYLOAD=$(cat)

OUTPUT=$(node -e "
const payloadStr = process.argv[1] || '{}';
let payload = {};
try {
  payload = JSON.parse(payloadStr);
} catch (_) {}

const toolName = payload.tool_name || payload.tool || '';
const toolInput = JSON.stringify(payload.tool_input || payload.arguments || payload.input || '');

// High-confidence adversarial injection signatures
const injectionPatterns = [
  /\[SYSTEM\s+OVERRIDE\]/i,
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(the\s+)?above\s+prompt/i,
  /exfiltrate\s+secrets/i,
  /bypass\s+safety\s+filter/i,
  /cat\s+\/etc\/shadow/i,
  /rm\s+-rf\s+\/(?!\S)/i
];

let violation = null;
for (const pattern of injectionPatterns) {
  if (pattern.test(toolInput)) {
    violation = \`Adversarial prompt injection pattern detected matching \${pattern.toString()}\`;
    break;
  }
}

if (violation) {
  console.log(JSON.stringify({
    decision: 'deny',
    reason: \`[Drift Sentinel Gate] Tool '\${toolName}' invocation blocked: \${violation}.\`
  }));
  process.exit(0);
}

console.log(JSON.stringify({ decision: 'allow' }));
" "$PAYLOAD")

echo "$OUTPUT"
