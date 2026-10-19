#!/usr/bin/env bash
# HumanGate: Event-Driven Human-in-the-Loop Interceptor
# Intercepts speculative mutations to agent harness surfaces (.agents/, rules/, hooks/)
# and destructive administrative actions, ensuring human oversight before persistence.

set -eo pipefail

PAYLOAD=$(cat)

CHECK_RESULT=$(node -e "
try {
  const p = JSON.parse(process.argv[1]);
  const tool = p.toolCall?.name || '';
  const args = p.toolCall?.args || {};

  // 1. Inspect file writes and mutations to core agent governance files
  const targetFile = args.TargetFile || args.path || args.file || '';
  const sensitivePaths = [
    'rules/common/GEMINI.md',
    'rules/common/AGENTS.md',
    '.agents/rules',
    'hooks/',
    'harness.yaml',
    'harness.json'
  ];

  for (const s of sensitivePaths) {
    if (targetFile.includes(s)) {
      console.log(JSON.stringify({
        decision: 'ask',
        reason: '[HumanGate] Structural modification to agent harness surface (' + s + ') requires explicit engineer confirmation.'
      }));
      process.exit(0);
    }
  }

  // 2. Inspect command-line actions for high-risk operations
  const cmd = args.CommandLine || '';
  const highRiskCmds = [
    'gcloud projects delete',
    'bq rm',
    'terraform apply',
    'kubectl apply',
    'git push origin main',
    'git push --force'
  ];

  for (const r of highRiskCmds) {
    if (cmd.includes(r)) {
      console.log(JSON.stringify({
        decision: 'ask',
        reason: '[HumanGate] High-impact command execution (' + r + ') requires explicit interactive confirmation.'
      }));
      process.exit(0);
    }
  }

  // Safe to proceed
  console.log(JSON.stringify({ decision: 'allow' }));
} catch (err) {
  // Graceful fallback to allow if payload parsing fails
  console.log(JSON.stringify({ decision: 'allow' }));
}
" "$PAYLOAD")

echo "$CHECK_RESULT"
exit 0
