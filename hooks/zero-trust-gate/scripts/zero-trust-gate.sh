#!/usr/bin/env bash
# Everything Gemini Zero-Trust Gate Hook: Container Confinement & Runtime Security Guard
# Inspects tool call inputs to block dangerous container execution flags, insecure docker socket mounts, and unconfined seccomp profiles.
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

const forbiddenChecks = [
  { test: (str) => /--privileged/i.test(str), reason: 'Privileged container execution is strictly prohibited by zero-trust policy.' },
  { test: (str) => /--cap-add\s+(ALL|SYS_ADMIN)/i.test(str), reason: 'Granting CAP_SYS_ADMIN or ALL capabilities violates least-privilege confinement.' },
  { test: (str) => /seccomp=unconfined/i.test(str), reason: 'Disabling Seccomp profiles is prohibited.' },
  { test: (str) => /\/var\/run\/docker\.sock/i.test(str), reason: 'Mounting host Docker socket into containers introduces severe host escalation risks.' },
  { test: (str) => /randomize_va_space=0/i.test(str), reason: 'Disabling ASLR is strictly forbidden.' }
];

let violation = null;
for (const check of forbiddenChecks) {
  if (check.test(toolInput)) {
    violation = check.reason;
    break;
  }
}

if (violation) {
  console.log(JSON.stringify({
    decision: 'deny',
    reason: \`[Zero-Trust Gate] Tool '\${toolName}' invocation blocked: \${violation}\`
  }));
  process.exit(0);
}

console.log(JSON.stringify({ decision: 'allow' }));
" "$PAYLOAD")

echo "$OUTPUT"
