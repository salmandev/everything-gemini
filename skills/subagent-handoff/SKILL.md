---
name: subagent-handoff
description: >-
  Guides the primary agent in delegating complex, multi-step subtasks to scoped subagents (Planner, Reviewer, Build-Repair, QA, Security) with minimal token contamination and deterministic handoffs.
---

# Subagent Handoff Protocol

This skill governs how the primary agent orchestrates and delegates work to scoped subagents.

## Core Directives

1. **When to Delegate vs. Execute Directly**:
   - **Delegate**: Visual browser testing (`browser_subagent`), deep dependency planning (`agents/planner.md`), adversarial code review (`agents/code-reviewer.md`), and build-break triage (`agents/build-repair.md`).
   - **Execute Directly**: Simple file edits, direct user questions, single test runs, and minor refactorings.

2. **The Clean Handoff Principle**:
   - Never dump the entire conversation history into the subagent prompt.
   - Provide a self-contained, bounded task prompt containing:
     1. Specific objective.
     2. Exact file paths to inspect.
     3. Clear constraints and tools allowed.
     4. Explicit stop condition and expected return report schema.

3. **Synthesis & Integration**:
   - When the subagent completes its task and returns its report, the primary agent evaluates the report, links findings to source files, and seamlessly continues the top-level plan.

For delegation prompt templates and examples, see [references/handoff-patterns.md](./references/handoff-patterns.md).
