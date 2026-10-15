---
name: everything-gemini-maintainer
description: >-
  Maintains, audits, and expands the Everything Gemini (everything-gemini) repository itself. Use when adding new skills, plugins, hooks, or running test suites in eagy.
---

# Everything Gemini Maintainer Skill

Use this workflow to contribute to and maintain the `eagy` repository.

## Maintenance Steps

1. **Add or Modify Component**:
   - Skills: Ensure YAML frontmatter has `name` and `description`.
   - Rules: Ensure markdown is concise and actionable.
   - Hooks: Ensure hook scripts handle protojson input/output contracts.
2. **Execute Validation Suite**:
   ```bash
   npm test
   ```
3. **Commit Clean Changes**:
   Use `git-craftsman` conventions (`feat: ...`, `fix: ...`).
