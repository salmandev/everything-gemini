---
name: continuous-learning
description: >-
  Extracts architectural lessons, developer corrections, and project conventions from the current session and records them into permanent rules or Knowledge Items. Activate when the user runs /learn or after resolving a complex issue.
---

# Continuous Learning & Instinct Recording

This skill enables Antigravity to retain lessons and developer feedback so mistakes are never repeated.

## Learning Workflow

### 1. Identify the Core Insight
Determine what was learned:
- **Correction**: Did the user correct a style, framework version, or tool choice?
- **Bug Fix**: Was an obscure bug or configuration issue solved after debugging?
- **Workflow**: Was an optimal command sequence identified for building/testing?

### 2. Format the Instinct
Formulate a concise, imperative rule:
- *Bad*: "We had an issue with Docker not starting on port 8080."
- *Good*: "Always map Docker container port 8080 to host 8081 to avoid conflicting with local proxy."

### 3. Persist to `.agents/rules/instincts.md`
Append the new instinct under the appropriate section in `.agents/rules/instincts.md`:
```markdown
- **Topic Name**: Concrete rule statement.
```

### 4. For Major Architectural Changes: Create Knowledge Item
If the insight affects the broader repository architecture, write a dedicated Knowledge Item in `<appDataDir>/knowledge` with `metadata.json` and artifact details.
