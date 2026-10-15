---
name: ai-first-engineering
description: Decomposes ambiguous software requirements into deterministic milestones, executable acceptance criteria, and test-backed delivery pipelines for AI agent development.
---

# AI-First Engineering Principles & Delivery Playbook

This skill establishes best practices for orchestrating high-velocity software engineering tasks with AI agents. It bridges the gap between human product intent and deterministic, zero-hallucination agent execution.

---

## 1. Core Directives

1. **Deterministic Specification Before Code**:
   - Never write production code based on vague requirements.
   - Deconstruct high-level prompts into verifiable acceptance criteria (Given/When/Then).
2. **Blast Radius Minimization**:
   - Scope code modifications strictly to the files necessary to satisfy the feature.
   - Guard against accidental refactoring of unrelated subsystems or styles.
3. **Continuous Verification Loop**:
   - Every modification must be coupled with automated validation (unit tests, integration suites, linters, or visual browser assertions).
   - If tests fail, diagnose the root cause from the error log before modifying code.

---

## 2. Requirement Decomposition Matrix

When given an ambiguous task (e.g., *"Make user onboarding faster"* or *"Add subscription billing"*), follow this three-stage breakdown:

```
[Ambiguous Goal] ──► [Milestone Decomposition] ──► [Executable Criteria] ──► [Zero-Regression Delivery]
```

### Stage 1: Milestone Decomposition
Break large tasks into discrete, independently testable phases:
- **Phase 1: Contracts & Schema**: Types, interfaces, database schemas, and API contracts.
- **Phase 2: Failing Assertions (Red)**: Unit / integration tests validating expected behavior.
- **Phase 3: Implementation (Green)**: Minimal surgical code satisfying the tests.
- **Phase 4: Hardening & Docs (Refactor)**: Error handling, edge cases, logging, and documentation.

### Stage 2: Executable Acceptance Criteria
Formulate specifications using the standard Gherkin / BDD structure:
- **Given**: Initial system state and prerequisites.
- **When**: Specific user or API action occurs.
- **Then**: Measurable system response, database state, or error envelope.

---

## 3. Risk Radius & Boundary Containment

Before modifying core abstractions, evaluate the **Risk Radius**:

| Radius Tier | Scope | Required Precautions |
| :--- | :--- | :--- |
| **Tier 1: Leaf Node** | Isolated helper functions, standalone components | Standard unit test verification |
| **Tier 2: Service / Store** | State management, database queries, shared services | Integration tests + typechecking |
| **Tier 3: Core Abstraction**| DB migrations, auth middleware, global config | Migration rollback plan + full test suite run |

---

## 4. Autonomous Debugging Protocol

When encountering unexpected test failures or runtime regressions:

1. **Read Full Error Trace**: Never guess or apply speculative patches without inspecting the actual stack trace.
2. **Reproduce in Isolation**: Create a minimal reproduction test or script before touching implementation files.
3. **Binary Search (Bisect)**: If behavior unexpectedly changed, identify the breaking commit or input change systematically.
4. **Surgical Fix**: Apply the smallest possible fix that resolves the issue while preserving surrounding code formatting and comments.
