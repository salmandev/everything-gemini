# Everything Gemini (everything-gemini) v2.9.0 Launch Kit
## Agentic Superpowers Software Methodology & Red-Green TDD Orchestration (132 Production Components)

---

### 📦 Release Metadata
- **Release Version**: `v2.9.0`
- **Release Codename**: *Agentic Superpowers*
- **Git Commit / Tag**: `v2.9.0`
- **Total Production Components**: **132** (101 Progressive Skills, 18 Scoped Subagents, 13 Lifecycle Hooks, 14 Curated MCP Blueprints)
- **Primary Milestone**: Introducing the **`superpowers`** meta-methodology skill (inspired by Jesse Vincent's `obra/superpowers` and customized for Google Antigravity & Gemini 3.8), the `everything-gemini superpowers` CLI command, automated `.superpowers/` workspace scaffolding, and Red/Green TDD orchestration.

---

## 🚀 How to Publish to npm

```bash
# 1. Verify clean repository state & all tests passing
npm test

# 2. Check npm login
npm whoami

# 3. Publish to npm registry (public access)
npm publish --access public

# 4. Push git tags to GitHub
git push origin main --tags
```

---

## 📱 Social Media Copy & Launch Templates

### 1. LinkedIn Post

**Title**: ⚡ Introducing Agentic Superpowers: Everything Gemini (everything-gemini) v2.9.0 is LIVE!

```markdown
⚡ Stop letting AI agents write unverified, monolithic code. 

Today, we are thrilled to announce Everything Gemini (everything-gemini) v2.9.0: The Agentic Superpowers Release! 🚀

Inspired by Jesse Vincent’s brilliant open-source work on `obra/superpowers` and tailored specifically for Google Antigravity and Gemini 3.8, v2.9.0 introduces a disciplined, staff-engineer-level software methodology to autonomous coding agents.

Instead of letting an agent blindly jump into generating 500 lines of unverified code, Superpowers enforces a deterministic 5-phase execution cycle:

1️⃣ Clarifying Spec & Interactive Interview: Pauses execution, interviews the developer via interactive dialogue, and finalizes acceptance criteria in `.superpowers/spec.md`.
2️⃣ Step-by-Step TDD Implementation Plan: Deconstructs the task into atomic bite-sized increments, enforcing YAGNI, DRY, and strict Red-Green TDD in `.superpowers/plan.md`.
3️⃣ Subagent Delegation Matrix: Autonomously dispatches our 18 scoped subagents:
   • Strategic Planner (`planner`)
   • Zero-Day CVE Mitigator (`cve-mitigator`)
   • Chaos & Resilience Engineer (`resilience-engineer`)
   • Incremental Code Reviewer (`code-reviewer`)
4️⃣ Red-Green-Refactor Loop: Verifies that tests fail first (Red) before writing minimal implementation code (Green) and refactoring cleanly.
5️⃣ Zero-Drift Closure & Hook Gatekeeping: Runs validation suites gated by our 13 lifecycle safety hooks (`safety-shield`, `zero-trust-gate`, `budget-guard`).

📊 With v2.9.0, Everything Gemini now boasts:
• 101 Progressive Disclosure Skills
• 18 Scoped Autonomous Subagents
• 13 Lifecycle Safety Hooks
• 132 Total Enterprise Production Components across ~107,350 runbook tokens!

🛠️ Try it today in 1 command:
$ npx everything-gemini superpowers init
$ npx everything-gemini superpowers check
$ npx everything-gemini benchmark --json

🔗 GitHub Repository: https://github.com/salmandev/everything-gemini
📖 Documentation & Live Catalog: https://salmandev.github.io/everything-gemini/

#GoogleGemini #Antigravity #AIAgents #Superpowers #SoftwareEngineering #TDD #OpenSource #DevOps
```

---

### 2. X (Twitter) Thread

```markdown
1/8 ⚡ Stop letting AI coding assistants write monolithic, hallucinated code without a plan.

Today, we're releasing Everything Gemini (everything-gemini) v2.9.0: The Agentic Superpowers Release! 🪐

Inspired by @obra's superpowers methodology & built for Google Antigravity + Gemini 3.8. 🧵👇

2/8 🧠 The core problem with AI agents today?
When you give an agent a non-trivial feature, it immediately starts generating 10 files and 500 lines of code—often missing requirements, hallucinating APIs, and failing tests.

Superpowers fixes this by forcing the agent to act like a Staff Engineer.

3/8 🎯 The 5-Phase Superpowers Cycle:
Phase 1: Spec Interview & Clarification (drafts `.superpowers/spec.md`)
Phase 2: Red/Green TDD Implementation Plan (enforces YAGNI & DRY)
Phase 3: Subagent Delegation (dispatches our 18 specialized subagents)
Phase 4: Red-Green-Refactor Execution
Phase 5: Zero-Drift Closure

4/8 👥 Subagent Delegation in action:
Instead of a single model doing everything, Superpowers coordinates:
• `planner` -> dependency graph breakdown
• `cve-mitigator` -> ASLR & supply-chain audit
• `resilience-engineer` -> timeout & chaos injection
• `code-reviewer` -> git diff review

5/8 🛠️ New native CLI tooling:
$ npx everything-gemini superpowers init     # scaffolds .superpowers/ workspace
$ npx everything-gemini superpowers check    # verifies spec & TDD adherence
$ npx everything-gemini superpowers run      # runs automated TDD cycles

6/8 📈 The Milestone:
Everything Gemini now features:
• 101 Progressive Skills
• 18 Scoped Subagents
• 13 Lifecycle Safety Hooks
• 132 Production Components (>92.8% token savings per turn vs monolithic prompts)

7/8 🐍 Full Python SDK pipeline included:
`examples/python-sdk/superpowers_tdd_orchestration.py` lets you automate the complete 5-phase Superpowers loop programmatically in Python.

8/8 🚀 Ready to upgrade your agent's engineering discipline?
Star & clone the repo: https://github.com/salmandev/everything-gemini
Live web portal: https://salmandev.github.io/everything-gemini/

#Gemini #Antigravity #AIAgents #TDD #Superpowers
```

---

### 3. Hacker News (Show HN)

**Title**: Show HN: Everything Gemini v2.9.0 – Agentic Superpowers & Red-Green TDD for AI Agents

```markdown
Hi HN! We just released v2.9.0 of Everything Gemini (everything-gemini), an open-source agent harness and multi-agent orchestrator for Google Gemini & Google Antigravity.

In this release, we've implemented the "Superpowers" software development methodology (inspired by Jesse Vincent's open-source `obra/superpowers` project) natively for Gemini agents.

The core motivation: Most autonomous coding agents fail when building non-trivial features because they jump straight into writing code without clarification, tests, or boundaries. 

Superpowers forces a 5-phase engineering protocol:
1. Interactive Specification Interview: The agent halts code writing, interviews the user on edge cases, and writes a spec into `.superpowers/spec.md`.
2. Step-by-Step TDD Planning: Breaks work into atomic increments, mandating that failing tests be written *before* implementation code.
3. Subagent Orchestration: Automatically dispatches specialized subagents (such as our `cve-mitigator` for kernel/package boundaries and `resilience-engineer` for circuit breaker timeout failovers).
4. Red-Green-Refactor Loop: Verifies that tests fail first (Red) before writing minimal passing code (Green) and cleaning up (Refactor).
5. Zero-Drift Closure: Gates commits through our 13 lifecycle safety hooks (`safety-shield`, `zero-trust-gate`, `budget-guard`).

The repo now includes 101 progressive disclosure skills, 18 scoped subagents, and 13 lifecycle hooks (132 total components).

GitHub: https://github.com/salmandev/everything-gemini
Web Portal: https://salmandev.github.io/everything-gemini/

We'd love your feedback on agentic TDD workflows and orchestration!
```

---

### 4. Reddit (r/MachineLearning, r/LocalLLaMA, r/ClaudeAI, r/webdev)

**Title**: Everything Gemini v2.9.0: Bringing Disciplined Red-Green TDD & Spec Interviews to AI Coding Agents (Inspired by Jesse Vincent's Superpowers)

```markdown
Hey everyone!

One of the most persistent frustrations with AI coding assistants (whether Claude Code, Cursor, or Gemini) is **prompt drift and unstructured code generation**. You ask for a feature, and the agent immediately produces hundreds of lines of code with zero tests, premature abstractions, and missing edge cases.

In Everything Gemini v2.9.0, we've integrated the **Superpowers Software Methodology** (pioneered by Jesse Vincent in `obra/superpowers`) into our open-source agent harness.

### How It Works
When triggered, the agent executes in 5 deterministic phases:
1. **Spec Gathering**: It stops and conducts an interactive clarification interview with you. Non-goals, invariants, and API contracts are written to `.superpowers/spec.md`.
2. **Red/Green TDD Implementation Plan**: Deconstructs the spec into bite-sized steps in `.superpowers/plan.md`. Every step mandates a test first. Premature abstractions are aggressively cut via YAGNI/DRY rules.
3. **Subagent Delegation**: Tasks are delegated to specialized autonomous workers in the catalog (`planner`, `cve-mitigator`, `resilience-engineer`, `code-reviewer`).
4. **Red-Green-Refactor Loop**: Validates that tests fail initially, writes the minimal code to turn them green, and refactors cleanly.
5. **Zero-Drift Hook Gatekeeping**: Intercepts commands with 13 deterministic safety hooks (`safety-shield`, `zero-trust-gate`, `drift-detector`) before generating atomic git commits.

### Quick Start
You can test the Superpowers workflow directly via npx:
```bash
npx everything-gemini superpowers init
npx everything-gemini superpowers check
npx everything-gemini superpowers run --dry-run
```

- Repository: https://github.com/salmandev/everything-gemini
- Live Catalog & Benchmarks: https://salmandev.github.io/everything-gemini/

We'd love to hear your thoughts on how your teams enforce TDD discipline with autonomous agents!
```
