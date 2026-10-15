# Subagent Handoff Patterns & Prompt Templates

## Pattern 1: Code Review Delegation Template
```text
Task Name: Security & Quality Code Review
Task:
You are acting as the 'code-reviewer' subagent.
Inspect the recent changes in git branch 'feature/payment-v2' (or git diff HEAD~1).
Focus on:
1. Null/undefined safety and edge cases in checkout logic.
2. Parameterized queries in src/services/payment.ts.
3. Verification that tests pass via 'npm test'.
Stop condition: All diff files reviewed and tests executed.
Return a markdown report with Verdict, Critical Blockers, and Suggestions.
```

## Pattern 2: Build-Repair Delegation Template
```text
Task Name: TypeScript Compiler & Test Fix
Task:
You are acting as the 'build-repair' subagent.
Command 'npm run build' is failing with:
"TS2322: Type 'string' is not assignable to type 'number' in src/api/user.ts:54"
1. Read src/api/user.ts around line 54.
2. Trace the type definition in src/types/user.ts.
3. Apply a surgical fix using replace_file_content.
4. Verify by running 'npm run build'.
Stop condition: 'npm run build' exits with code 0.
Return a report summarizing the root cause and applied fix.
```
