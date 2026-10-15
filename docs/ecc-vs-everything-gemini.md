# Everything Claude Code (ECC) vs. Everything Gemini (`everything-gemini`)

An objective architectural comparison between **Everything Claude Code (ECC)** by Affan Mustafa and **Everything Gemini (`everything-gemini`)** native-built for Google Antigravity & Gemini.

---

## 🎯 Executive Summary

While ECC provided an outstanding template for structuring agent instructions in Claude Code, **`everything-gemini`** represents an architectural evolution designed specifically for Google Antigravity's multi-surface platform and Gemini's state-of-the-art frontier capabilities:

1. **Massive Context Economics**: Gemini’s 1M-2M token context window paired with native Prefix Context Caching offers an order of magnitude higher repository capacity at a fraction of the cost.
2. **Native Multimodality**: Direct visual reasoning over UI mockups, architecture whiteboard diagrams, and automated WebP browser recordings.
3. **Four Unified Surfaces**: Works seamlessly across Desktop 2.0, Antigravity IDE (VS Code-based), `agy` CLI, and the Antigravity Python SDK.
4. **Deterministic Lifecycle Safety**: Built-in `PreToolUse` security gates (GeminiShield) that prevent catastrophic filesystem and database accidents before execution.

---

## 📊 Feature Comparison Matrix

| Architectural Dimension | Everything Claude Code (ECC) | Everything Gemini (`everything-gemini`) | Architectural Advantage |
| :--- | :--- | :--- | :--- |
| **Foundational Model** | Claude 3.5 Sonnet / Opus | **Gemini 3.8 / 1.5 Flash & Pro** | Native multimodal reasoning, faster TTFT, massive context |
| **Context Window** | 200,000 tokens | **1,000,000 – 2,000,000+ tokens** | Ingest complete enterprise monorepos without lossy truncation |
| **Context Caching** | Ephemeral prompt caching | **Native Explicit & Implicit Prefix Caching** | ~75% cost reduction on repeated repository index lookups |
| **Visual Reasoning** | Terminal-only / text output | **Autonomous Browser Subagent + WebP Video** | Interactive E2E QA testing, DOM inspection, visual regressions |
| **Multi-Surface Runtime** | CLI only | **4 Surfaces (Desktop 2.0, IDE, CLI, Python SDK)** | Seamless workflow whether in visual IDE or headless pipelines |
| **Memory System** | Static text instructions | **Adaptive Learned Instincts + Knowledge Items (KI)** | Dynamic cross-session memory that records corrections |
| **Subagent Delegation** | Manual sub-prompts | **Scoped Subagent Fleet (`agents/`) + Handoff Protocol** | Formal boundaries for Architect, Reviewer, QA, Repair agents |
| **Safety Guardrails** | Advisory prompt rules | **Deterministic Shell & Command Hook Gates** | Hard blocks on `rm -rf`, raw DROP statements, and API leaks |
| **Packaging & Distribution** | Git clone / copy paste | **Zero-Dependency CLI (`everything-gemini install`)** | Presets for `core`, `developer`, and `full` workspaces |

---

## 🧠 Architectural Deep Dive

### 1. Progressive Disclosure vs. Context Bloat
In standard agent setups, loading hundreds of lines of instructions into every conversational turn consumes up to 30% of the active reasoning window. 

`everything-gemini` strictly implements **Progressive Disclosure**:
- The agent only sees lightweight skill metadata (name + description) in its initial prompt.
- High-depth procedural playbooks (`SKILL.md`) and technical manuals (`references/`) are pulled into context **only when triggered by the user's intent**.

### 2. Multi-Agent Scoped Orchestration
Rather than relying on a single monolithic agent persona, `everything-gemini` provides specialized subagent specifications:
- **`agents/planner.md`**: Strategic exploration and phased execution roadmaps.
- **`agents/code-reviewer.md`**: Strict non-destructive code review and type auditing.
- **`agents/build-repair.md`**: Automated test and build failure triage.
- **`agents/browser-qa.md`**: Autonomous browser subagent driving visual assertions.
- **`agents/security-auditor.md`**: Adversarial credential scanning and injection prevention.
- **`agents/architect.md`**: C4 architecture diagrams and ADR formulation.

### 3. Continuous Learning Engine
With the **Learned Instincts** hook suite (`hooks/learned-instincts/`), the system listens to user feedback and session outcomes. Lessons learned are codified into `.agents/rules/instincts.md`, ensuring that mistakes are never repeated in future sessions.

---

## 🚀 Conclusion

`everything-gemini` takes the inspirational vision of agent harness engineering and elevates it to production-grade enterprise readiness, championing **Gemini** as the premier coding intelligence engine.
