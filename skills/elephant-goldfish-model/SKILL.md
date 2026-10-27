---
name: elephant-goldfish-model
description: Implements Google's Elephant-Goldfish Model (EGM) for Spec-Driven Development. Use when designing non-trivial features or architecture to orchestrate a deep-context Elephant session for brainstorming and living design documents with strict no-code rules, paired with stateless Goldfish subagents for zero-bias adversarial review.
---

# Google Elephant-Goldfish Model (`elephant-goldfish-model`)

The **Elephant-Goldfish Model (EGM)** is an architectural framework and design-first methodology developed by Google Distinguished Engineer Dave Rensin (*"Elephants, Goldfish, and the New Golden Age of Software Engineering"*, open-sourced at [`google/elephant-goldfish-model`](https://github.com/google/elephant-goldfish-model)).

EGM directly eliminates the two greatest failure modes of autonomous coding agents: **Context Collapse** (conversational bloat and hallucination) and **Model Sycophancy** (agents agreeing with flawed developer prompts over time).

---

## 1. Architectural Model & Core Invariants

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 GOOGLE'S ELEPHANT-GOLDFISH MODEL (EGM)                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 🐘 THE ELEPHANT (Deep Context, Long-Horizon Memory)                 │   │
│   │    • Ingests codebase history, architecture blueprints, & contracts.│   │
│   │    • MANDATORY INVARIANT: STRICT "NO CODE" RULE.                     │   │
│   │    • Purpose: Brainstorming, architectural trade-offs, and drafting │   │
│   │      living technical design documents in `docs/designs/<feature>.md│   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Passes design doc ONLY               │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 🐟 THE GOLDFISH (Zero Context, Stateless Fresh Eyes)                │   │
│   │    • Brand-new isolated subagents with zero chat history or bias.   │   │
│   │    • Receives ONLY the generated design document + live code.       │   │
│   │    • Reviews design across 4 adversarial lenses:                    │   │
│   │      1. Design Critic: Holes in requirements & unhandled edge cases │   │
│   │      2. Naive Reader: Ambiguities, jargon, and missing definitions  │   │
│   │      3. Tech Lead: Feasibility, blast radius, and security risks    │   │
│   │      4. Codebase Auditor: Schema conflicts & contract violations    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Produces review findings             │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 👤 THE HUMAN ARCHITECT (Final Authority)                            │   │
│   │    • Adjudicates findings, resolves trade-offs, and signs off.      │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Passes approved spec                 │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ⚡ EXECUTION HANDOFF (Superpowers Red-Green TDD)                     │   │
│   │    • Takes hardened design spec and executes via atomic TDD cycles. │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 4-Stage EGM Protocol

### Stage 1: Hypothesis Exploration (`/egm-brainstorm`)
- Conducted exclusively inside the **Elephant** session.
- Discusses user problems, historical constraints, latency budgets, and security posture.
- **Rule**: No code may be written. Exploration produces a structured concept brief in `docs/designs/concept_brief.md`.

### Stage 2: Living Technical Design Document (`/egm-draft`)
- The Elephant translates the concept brief into a complete, self-contained technical specification:
  - `docs/designs/<feature>.md`
  - Sections:
    1. **Context & Motivation**: Why this change is necessary.
    2. **Non-Goals**: Explicit boundaries of what will *not* be implemented.
    3. **Architecture & Component Boundaries**: Sequence diagrams, data models, and API contracts.
    4. **Failure Modes & Fallbacks**: 429 backoff, network partition recovery, zero-trust constraints.
    5. **Verification & Acceptance Criteria**: Measurable success gates.

### Stage 3: Stateless Adversarial Review (`/egm-review`)
- Spawns fresh **Goldfish** subagents ([`agents/goldfish-reviewer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/goldfish-reviewer.md)) with clean context windows.
- The Goldfish have **zero memory** of the brainstorm. They evaluate the document strictly on its written merits:
  - *Does the document stand on its own without conversational context?*
  - *Are failure recovery paths concrete or hand-waving?*
  - *Are API contracts backwards-compatible with existing schema?*
- Results in a structured **Findings Matrix**: `BLOCKER`, `WARNING`, `SUGGESTION`.

### Stage 4: Resolution & Drift Reporting (`/egm-drift-report`)
- The human architect signs off on the resolved design.
- Post-implementation, the EGM drift detector scans the repository to ensure the code matches the approved design document without undocumented architectural drift.

---

## 3. Synergy with the Superpowers Skill

Google's EGM and Jesse Vincent's Superpowers form the complete end-to-end autonomous engineering pipeline:

$$\text{EGM (Phase 0: Design & Antagonistic Review)} \longrightarrow \text{Superpowers (Phase 1–5: Red-Green TDD Execution)}$$

1. **EGM** guarantees the architecture is sound, secure, and stress-tested *before* writing code.
2. **Superpowers** takes the approved specification and executes it with strict Red/Green TDD discipline.

---

## 4. CLI Automation

Manage the EGM workflow natively in `everything-gemini`:

```bash
# 1. Brainstorm with the Elephant (generates concept brief)
everything-gemini egm brainstorm "Distributed rate limiting with Redis"

# 2. Draft the living design document
everything-gemini egm draft --feature rate-limiter

# 3. Dispatch stateless Goldfish subagents for adversarial review
everything-gemini egm review --stateless --json

# 4. Check for post-implementation architectural drift
everything-gemini egm drift-report
```
