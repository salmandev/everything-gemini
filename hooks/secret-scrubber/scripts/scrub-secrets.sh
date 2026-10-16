#!/usr/bin/env bash
# Everything Gemini Secret Scrubber: PreToolUse Security Gate
# Reads protojson hook payload from stdin, inspects write content for plaintext credentials,
# and outputs JSON decision on stdout.

set -eo pipefail

PAYLOAD=$(cat)

# Extract content being written using node
SECRET_FOUND=$(node -e "
try {
  const p = JSON.parse(process.argv[1]);
  const args = p.toolCall?.args || {};
  let content = '';

  if (args.CodeContent) content += args.CodeContent + '\n';
  if (args.ReplacementContent) content += args.ReplacementContent + '\n';
  if (Array.isArray(args.ReplacementChunks)) {
    content += args.ReplacementChunks.map(c => c.ReplacementContent || '').join('\n');
  }

  // Regex patterns for live production credentials
  const patterns = [
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{48}|sk-proj-[a-zA-Z0-9_-]{40,}/ },
    { name: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/ },
    { name: 'GitHub Personal Access Token', regex: /ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82}/ },
    { name: 'Slack Bot Token', regex: /xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}/ },
    { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
    { name: 'Private Key', regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----/ }
  ];

  for (const { name, regex } of patterns) {
    if (regex.test(content)) {
      console.log(name);
      process.exit(0);
    }
  }
  console.log('');
} catch (e) {
  console.log('');
}
" "$PAYLOAD")

if [ -n "$SECRET_FOUND" ]; then
  cat <<EOF
{
  "decision": "deny",
  "reason": "Security Alert: Secret Scrubber detected raw ${SECRET_FOUND} in file write payload. Do not commit or hardcode live credentials. Use environment variables (process.env / os.environ) instead."
}
EOF
  exit 0
fi

# Clean content
cat <<EOF
{
  "decision": "allow"
}
EOF
exit 0
