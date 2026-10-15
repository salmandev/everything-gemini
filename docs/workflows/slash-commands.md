# Antigravity Slash Commands Playbook

Slash commands in Antigravity chat trigger specialized cognitive modes, prompt routines, and subagent orchestrations.

---

## 1. Core Slash Commands

### `/goal <prompt>`
- **Behavior**: Enters autonomous goal-seeking mode. The agent continues executing multi-step actions until the objective is fully verified.
- **everything-gemini Synergy**: Combines with `hooks/goal-verifier/` to prevent premature stops if test suites or linters fail.

### `/plan <prompt>`
- **Behavior**: Generates a comprehensive architectural plan and step-by-step implementation blueprint before touching any code.
- **everything-gemini Synergy**: Activates the `architecture-designer` skill, automatically producing C4 Mermaid diagrams and risk analyses.

### `/grill-me`
- **Behavior**: The agent acts as an architectural interviewer, grilling the developer on edge cases, non-functional constraints, and trade-offs before generating solutions.
- **When to Use**: Ideal when starting ambiguous features or refactoring legacy modules.

### `/learn`
- **Behavior**: Persists lessons learned from mistakes, corrections, or complex configurations into a permanent Knowledge Item (`<appDataDir>/knowledge`).
- **everything-gemini Synergy**: Connects with `repo-onboarding` and Knowledge Items schemas to build an enduring project memory.

### `/schedule`
- **Behavior**: Schedules delayed one-shot timers or recurring cron jobs with reactive wakeup.
- **When to Use**: Long-running builds, server polling, health checks, or automated periodic tests.
