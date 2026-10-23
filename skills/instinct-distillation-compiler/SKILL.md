---
name: instinct-distillation-compiler
description: Compiles resolved edge cases, runtime exceptions, and developer corrections into enduring behavioral instinct rules without manual intervention.
---

# Learned Instinct Distillation & Rule Compiler (`instinct-distillation-compiler`)

Continuously extracts, deduplicates, and compiles resolved edge cases, runtime stack traces, and developer feedback into persistent behavioral instinct rules within `.agents/hooks/learned-instincts/` to guarantee that errors resolved once are never repeated in future sessions.

---

## 1. Architectural Pipeline: Automated Instinct Distillation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INSTINCT DISTILLATION & COMPILER PIPELINE                   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Trajectory Exception & Correction Harvester                      │   │
│   │    • Listens to PostToolUse failures and subsequent recovery turns  │   │
│   │    • Captures developer corrections: "do not use X; use Y instead"  │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Semantic Distillation & Invariant Synthesis                      │   │
│   │    • Strips ephemeral data (timestamps, temporary file paths)       │   │
│   │    • Generalizes root cause: "When invoking tool T, ensure schema S"│   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Deduplication & Conflict Resolution Engine                       │   │
│   │    • Compares candidate rule against existing `.agents/rules/`      │   │
│   │    • Semantic vector embedding match: if cosine similarity > 0.88,  │   │
│   │      refines existing rule instead of appending duplicate          │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Deterministic Rule Compiler & Commit                             │   │
│   │    • Formats valid markdown rule with clear triggers & constraints  │   │
│   │    • Appends to `.agents/hooks/learned-instincts/rules/<topic>.md`  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rule Structure & Compilation Grammar

Compiled instinct rules strictly adhere to a standardized 3-part layout:
```markdown
# Instinct: [Descriptive Title]
**Trigger Context**: [When the agent performs X on Y]
**Observed Failure**: [Stack trace / root cause description]
**Mandatory Invariant**:
- DO: Always verify condition C before execution.
- NEVER: Never invoke tool T with unvalidated parameter P.
```

### Example Compiled Rule:
```markdown
# Instinct: Safe BigQuery Partition Filtering
**Trigger Context**: Running SQL queries against analytics tables with `run_command` (bq query).
**Observed Failure**: Query failed due to missing partition filter scanning entire 10TB table.
**Mandatory Invariant**:
- DO: Always include `WHERE DATE(_PARTITIONTIME) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)`.
- NEVER: Never run unrestricted `SELECT *` without explicit `LIMIT` and partition bounds.
```

---

## 3. Operational Recipes

### Triggering Instinct Compilation via CLI
```bash
# Review active learned instincts
everything-gemini status --json | jq .instincts

# Audit instinct repository and compile pending lessons
everything-gemini audit --workspace .
```

### Python SDK Instinct Ingestion
```python
from google_antigravity.learning import InstinctDistiller

distiller = InstinctDistiller(workspace_root=".")
distiller.distill_correction(
    trigger="npm test failed with missing module 'uuid'",
    fix="Run npm install uuid --save-dev before running test suites",
    category="dependency_hygiene"
)
distiller.commit_rules()
```

---

## 4. Cross-Reference Links
- See [skills/continuous-learning/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/continuous-learning/SKILL.md) for session learning protocols.
- See [hooks/learned-instincts/hooks.json](file:///Users/salmanshaikh/development/github/everything-gemini/hooks/learned-instincts/hooks.json) for the active instinct lifecycle hook.
- See [agents/documentation-writer.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/documentation-writer.md) for rule curation standards.
