# 🚀 Everything Gemini — Viral Launch & Distribution Kit

This launch kit contains battle-tested, copy-paste ready submissions crafted to propel **Everything Gemini (`everything-gemini`)** to the top of GitHub Trending, Hacker News, X (Twitter), Reddit, and Product Hunt.

---

## 1. 🟧 Hacker News (Show HN)

### Submission Details
* **Title**: `Show HN: Everything Gemini – Open-source agent harness and 33 skills for Antigravity`
* **URL**: `https://github.com/salmandev/everything-gemini` (or `https://salmandev.github.io/everything-gemini/`)

### First Comment (Post immediately after submitting)
```text
Hey HN,

Over the past few months, the Claude Code community rallied around Everything Claude Code (ECC). But when Google released Antigravity (AGY) and the Gemini 3.8 / 1.5 Flash & Pro models with native 1M-2M context windows, we realized the ecosystem needed a completely reimagined harness built natively for Antigravity’s architecture.

Today we're releasing Everything Gemini (everything-gemini) v1.3.0:
https://github.com/salmandev/everything-gemini

Why build a new harness?
1. Progressive Disclosure vs Prompt Bloat:
Instead of dumping megabytes of instructions into every reasoning step, Antigravity introduces Progressive Disclosure. Only skill YAML headers (name + description) sit in the prompt. The model autonomously lazy-loads the full playbook only when required. Our benchmarks show an 85%+ token reduction per turn (~13,000 tokens saved each turn).

2. Native Subagent Fleet:
6 specialized subagents (Planner, Code Reviewer, Build Repair, Visual QA, Security Auditor, Systems Architect) designed for autonomous delegation via Antigravity's native `invoke_subagent` and Python SDK.

3. Deterministic Safety Gates (GeminiShield):
Hooks that intercept `PreToolUse` and enforce strict security invariants on `run_command`—blocking catastrophic commands like `rm -rf /` or forced branch resets before the shell is ever invoked.

4. Zero-Dependency CLI:
Run `npx everything-gemini install` anywhere. It includes diagnostics (`doctor`), in-place non-destructive updates (`update`), ecosystem benchmarks (`test-all`), and shell completion (`completion --install`).

The repository is open source under Apache-2.0. We'd love your feedback, critiques, and contributions!
```

---

## 2. 🐦 X (Twitter) Launch Thread

### Tweet 1 (The Hook)
```text
Claude Code has ECC.
Now Google Antigravity & Gemini have Everything Gemini.

Introducing Everything Gemini 🪐 — the premier open-source multi-agent harness, progressive disclosure skills catalog, and lifecycle safety suite for Gemini 3.8 & Antigravity.

33 skills. 6 subagents. 85% token savings.

🧵👇
```

### Tweet 2 (The Token Problem & Progressive Disclosure)
```text
Why does this matter?

Dumping dozens of engineering rules into every agent turn wastes context and causes instruction drift.

Everything Gemini implements Progressive Disclosure:
• Only metadata in prompt
• Lazy-loads runbooks on demand
• Saves >13,000 tokens every single turn! 📉
```

### Tweet 3 (Visual QA & Subagents)
```text
Native Visual QA + Subagent Fleet 🤖

We built 6 autonomous scoped subagents:
• Planner: Phased dependency mapping
• Browser QA: Drives Antigravity's native browser subagent with automated WebP screen recording into artifacts
• Build Repair: Surgical triage for failing tests
• Security Auditor: Zero-trust gatekeeper
```

### Tweet 4 (Deterministic Safety Hooks)
```text
Deterministic Safety Gates 🛡️

GeminiShield hooks into Antigravity's lifecycle (`PreToolUse`, `PostToolUse`, `Stop`):
• Blocks destructive operations (`rm -rf /`, `git push --force`)
• Formats modified code automatically with Prettier/Ruff
• Prevents agent from exiting if unit tests are still failing
```

### Tweet 5 (Zero-Setup CLI)
```text
Get started in 5 seconds with zero dependencies:

$ npx everything-gemini install --profile developer

Or install shell completions:
$ npx everything-gemini completion --install

Explore the interactive catalog:
👉 https://salmandev.github.io/everything-gemini/
```

### Tweet 6 (CTA & Star History)
```text
Everything Gemini is 100% open source under Apache-2.0.

Check out the code, star the repo, and build custom skills with us:
⭐ https://github.com/salmandev/everything-gemini

Tagging @GoogleDeepMind @GoogleAI @fchollet #Gemini #Antigravity #AIAgents #OpenSource
```

---

## 3. 🔴 Reddit Submissions

### Subreddit: `r/LocalLLaMA`
* **Title**: `Everything Gemini: Open-source multi-agent harness & 33 progressive skills for Google Antigravity & Gemini (85% token reduction)`
* **Content**:
```text
Hey r/LocalLLaMA,

We just open-sourced Everything Gemini (`everything-gemini`), a developer harness and multi-agent orchestration catalog designed specifically for Google Antigravity (AGY) and the Gemini ecosystem.

Repository: https://github.com/salmandev/everything-gemini
Interactive Showcase: https://salmandev.github.io/everything-gemini/

Key Technical Highlights:
1. Progressive Disclosure Architecture: Instead of brute-forcing massive system prompts, skills are indexed via lightweight YAML frontmatter. Antigravity dynamically discovers and reads full runbooks on-demand.
2. 6 Scoped Subagents: Formally defined personas (Planner, Reviewer, Browser QA, Build Repair, Security, Architect) ready for multi-agent handoffs.
3. Lifecycle Safety Gates: Protojson lifecycle hooks running pre/post-tool execution checks to intercept destructive shell commands.
4. Curated MCP Blueprints: Redis caching, persistent memory, semantic fetch, Postgres, and GitHub MCP servers.

Try it via `npx everything-gemini install` or clone and inspect with `./bin/everything-gemini test-all`.

All feedback, benchmarks, and PRs welcome!
```

---

## 4. 😸 Product Hunt Launch

* **Product Name**: `Everything Gemini`
* **Tagline**: `The open-source agent harness & multi-agent suite for Google Antigravity`
* **Topics**: `Developer Tools`, `Artificial Intelligence`, `Open Source`, `GitHub`
* **Pricing**: `Free / Open Source (Apache 2.0)`

### Maker Comment:
```text
Hi Product Hunt! 👋

I'm Salman, creator of Everything Gemini.

As AI coding agents evolved from single-prompt chatbots into multi-turn autonomous engines, we saw a critical issue: context exhaustion and token bloat.

We built Everything Gemini to bring progressive disclosure, scoped subagent fleets, and deterministic safety firewalls to Google Antigravity and Gemini 3.8.

Features:
• 33 Lazy-loaded progressive disclosure skills
• 6 Scoped subagents with formal handoff protocols
• GeminiShield safety gates preventing destructive operations
• Zero-dependency CLI with doctor, benchmark, and update commands
• Interactive web app with 1-click CLI installer copy

Check it out at https://salmandev.github.io/everything-gemini/ and let us know what skills you'd like to see next!
```
