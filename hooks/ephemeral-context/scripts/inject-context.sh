#!/usr/bin/env bash
# Everything Gemini Ephemeral Context Injector: PreInvocation Hook
# Sends a transient reminder to the agent prior to model invocation.

set -eo pipefail

echo '{"injectSteps": [{"ephemeralMessage": "[Everything Gemini Harness Active]: Verify code with tests, follow progressive disclosure, and ensure all file links use markdown file:// scheme."}]}'
exit 0
