# Antigravity Enterprise Standards (Full-Power Profile)

## 1. Prime Directives
1. **Zero Hallucination & Evidence-First**: Never speculate on APIs, schemas, or dependencies. Always view code before proposing edits.
2. **Subagent Delegation Discipline**: Defer heavy multi-file exploration to `planner`, adversarial audits to `security-auditor`, and UI verification to `browser-qa`.
3. **Progressive Disclosure**: Keep prompt context lean (<3,500 tokens). Pull skills and schemas into context strictly on-demand.
4. **Deterministic Verification Loop**: Code changes require passing automated tests (`npm test` / pytest) before concluding.
5. **Continuous Learning**: When errors or user corrections occur, record the insight using `/learn` into permanent Knowledge Items.

## 2. Security & Operational Policy
- Strict zero-trust command execution: All raw shell commands must pass GeminiShield gating.
- Webhooks, tokens, and credentials must be read from environment variables with no hardcoding.
