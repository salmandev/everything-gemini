---
name: superpowers
description: Enforces disciplined agentic software development methodology. Use when embarking on non-trivial coding tasks to conduct interactive specification gathering, create step-by-step red-green TDD implementation plans, orchestrate scoped subagents, and ensure zero-drift verification before committing changes.
---

# Agentic Superpowers Software Methodology (`superpowers`)

The **Superpowers** skill enforces a disciplined, high-fidelity software engineering methodology across autonomous coding agents. It prevents unstructured hallucinations, monolithic untested diffs, and prompt drift by turning the agent into a meticulous Staff Software Engineer.

Inspired by the workflow pioneered by Jesse Vincent in `obra/superpowers` and customized for Google Antigravity & Gemini 3.8, this skill organizes execution into a 5-phase deterministic cycle.

---

## 1. Architectural Workflow: The 5-Phase Superpowers Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE AGENTIC SUPERPOWERS METHODOLOGY                     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 1: Spec Gathering & Requirements Interview                     │   │
│   │    • Do NOT touch production code yet.                              │   │
│   │    • Ask clarifying questions; tease out edge cases & constraints.  │   │
│   │    • Draft concise specification in `.superpowers/spec.md`.         │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ (User Sign-off)                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 2: Step-by-Step TDD Implementation Plan                       │   │
│   │    • Deconstruct into bite-sized atomic steps (15-30 min each).     │   │
│   │    • Strict Red/Green TDD: specify failing tests before code.       │   │
│   │    • Enforce YAGNI (You Aren't Gonna Need It) & DRY principles.     │   │
│   │    • Store actionable checklist in `.superpowers/plan.md`.          │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 3: Subagent Orchestration & Role Specialization               │   │
│   │    • Dispatch everything-gemini's 18 scoped subagents:              │   │
│   │      - planner: breaks down dependency graph                        │   │
│   │      - cve-mitigator & security-auditor: supply-chain & secrets     │   │
│   │      - resilience-engineer: chaos boundaries & timeout failover     │   │
│   │      - code-reviewer: reviews incremental diffs before commit       │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 4: Atomic Execution & Red-Green-Refactor Loop                 │   │
│   │    • Red: Write failing unit/integration test.                      │   │
│   │    • Green: Write minimum necessary code to pass the test.          │   │
│   │    • Refactor: Clean up without breaking tests or adding unneeded features. │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Phase 5: Zero-Drift Closure & Lifecycle Hook Verification            │   │
│   │    • Run test suites (npm test / scripts/validate.sh).              │   │
│   │    • Gate with hooks (safety-shield, zero-trust-gate, budget-guard).│   │
│   │    • Produce atomic git commit and detailed verification artifact.  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Clarifying Specification & Requirements Interview

When a user requests a new feature, refactor, or complex fix:
1. **Never write code immediately.** Stop and review the existing architecture.
2. **Conduct the Clarification Interview**:
   - Ask clarifying questions via interactive prompts (`ask_question` or direct user inquiry) regarding ambiguities, performance budgets, and backward compatibility.
3. **Generate `.superpowers/spec.md`**:
   - Problem statement and user goals.
   - Explicit non-goals (what we will NOT build).
   - Core API contracts and data schemas.
   - Success metrics (e.g., latency, test coverage, zero regression).

---

## 3. Phase 2: Implementation Planning & Red/Green TDD

Once the spec is confirmed:
1. Break down the task into **10 to 20 numbered atomic steps**.
2. For each step, define:
   - **Test First (Red)**: The exact test file and test assertion that must fail initially.
   - **Implementation (Green)**: The exact file to edit and the minimal implementation.
   - **Verification**: The command to run to verify that the test now passes.
3. Apply the **YAGNI** rule: Remove speculative hooks, premature abstractions, and unused utility functions.

---

## 4. Phase 3: Subagent Delegation Matrix

Leverage `everything-gemini`'s 18 scoped subagents for specialist review:

| Phase / Concern | Delegated Subagent | Responsibilities |
| :--- | :--- | :--- |
| **Task Planning** | [`agents/planner.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/planner.md) | Maps dependency graph and orders atomic execution steps. |
| **Dependency & CVE Audit** | [`agents/cve-mitigator.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/cve-mitigator.md) | Audits libraries, lockfiles, and virtual environments for zero-day CVEs. |
| **Security & Secrets** | [`agents/security-auditor.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/security-auditor.md) | Audits code for hardcoded secrets, injection vectors, and privilege leaks. |
| **Chaos & Error Boundaries** | [`agents/resilience-engineer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/resilience-engineer.md) | Injects synthetic timeouts, 429 shocks, and verifies circuit breakers. |
| **Diff Review** | [`agents/code-reviewer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/code-reviewer.md) | Reviews incremental git diffs against style guides and DRY principles. |
| **Documentation & Release** | [`agents/release-engineer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/release-engineer.md) | Updates CHANGELOG, semver tagging, and release notes. |

---

## 5. Phase 4 & 5: TDD Execution & Zero-Drift Closure

During implementation:
- **Never skip Red**: Verify the test fails before writing the implementation to prevent false-positive tests.
- **Never commit unverified code**: Run the full validation suite (`npm test` or `bash scripts/validate.sh`).
- **Safety Shield Verification**: Ensure all shell operations adhere to [`hooks/safety-shield`](file:///Users/salmanshaikh/development/github/everything-gemini/hooks/safety-shield) and [`hooks/zero-trust-gate`](file:///Users/salmanshaikh/development/github/everything-gemini/hooks/zero-trust-gate).
- **Atomic Git Commit**: Commit the completed step with a semantic message (e.g. `feat(superpowers): add tdd verification harness`).

---

## 6. CLI Command & Automation

Use the native CLI command to manage the Superpowers workflow:

```bash
# Initialize a Superpowers workflow directory in active workspace
everything-gemini superpowers init

# Check adherence to spec, TDD status, and test coverage
everything-gemini superpowers check

# Run the complete automated TDD validation loop
everything-gemini superpowers run --dry-run
```
