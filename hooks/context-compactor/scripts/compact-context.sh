#!/usr/bin/env bash
# Everything Gemini Context Compactor Hook: Active Context Pressure Monitor & Compaction Trigger
# Evaluates tool input payload sizes and trajectory context pressure to recommend AST pruning or compacting oversized buffers.
# Reads protojson hook payload from stdin, outputs valid JSON on stdout.

set -eo pipefail

PAYLOAD=$(cat)

OUTPUT=$(node -e "
const payloadStr = process.argv[1] || '{}';
let payload = {};
try {
  payload = JSON.parse(payloadStr);
} catch (_) {}

const toolName = payload.tool_name || payload.tool || '';
const rawInput = JSON.stringify(payload.tool_input || payload.arguments || payload.input || '');
const charCount = rawInput.length;
const estimatedTokens = Math.round(charCount / 4);

// If a single tool call payload exceeds 25,000 characters (~6,250 tokens), inject compaction guidance
if (charCount > 25000 && !toolName.includes('write_to_file')) {
  console.log(JSON.stringify({
    decision: 'allow',
    warning: \`[Context Pressure Alert] Tool '\${toolName}' input is large (\${estimatedTokens} tokens). Consider using context distillation or writing payload to an artifact file.\`,
    compaction_recommended: true,
    estimated_tokens: estimatedTokens
  }));
  process.exit(0);
}

console.log(JSON.stringify({
  decision: 'allow',
  context_status: 'healthy',
  payload_tokens: estimatedTokens
}));
" "$PAYLOAD")

echo "$OUTPUT"
