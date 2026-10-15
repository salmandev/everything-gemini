# 📜 Changelog

All notable changes to **Everything Gemini (`everything-gemini`)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-15

### Added
- **30 Progressive Disclosure Skills Milestone**:
  - **`agent-evals`**: Automated evaluation pipelines, LLM-as-a-judge rubrics, golden test datasets, and regression testing.
  - **`docker-compose-orchestrator`**: Multi-container local environments (Postgres + pgvector, Redis), healthcheck dependency wiring, and persistent volumes.
  - **`graphql-architect`**: Schema-first GraphQL APIs, DataLoader N+1 query batching, and Relay cursor-based pagination.
- **Universal Terminal Playbook Inspector (`info` / `show`)**:
  - `everything-gemini info <name>` seamlessly inspects and previews runbooks for skills, subagent specifications, and lifecycle hook configurations directly in the terminal.
- **Granular Lifecycle Hook Management**:
  - Added `everything-gemini add hook <name>` and `everything-gemini remove hook <name>` with automatic execution permission enforcement (`chmod +x`) on hook scripts.
- **Interactive Web Showcase 42-Component Expansion**:
  - Complete index of all 30 progressive skills, 6 scoped subagents, and 6 lifecycle hooks on [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/).
  - Direct GitHub spec links (`View Spec ↗`) and 1-click CLI copy buttons (`Copy Add CLI`) on every catalog card.
  - Dedicated `Lifecycle Hooks` filter pill and amber badge styling (`.tag-hook`).
- **Multi-OS CI Matrix**:
  - Automated GitHub Actions testing across `ubuntu-latest` and `macos-latest` verifying validations, CLI diagnostics, and skill test runners.
- **Composite GitHub Action (`action.yml`)**:
  - Official GitHub composite action allowing any CI/CD workflow to run `- uses: salmandev/everything-gemini@v1` with configurable profile and scope inputs.
- **Ecosystem Benchmark Suite (`everything-gemini test-all`)**:
  - High-speed terminal diagnostic benchmark verifying all 42 ecosystem components, computing token metrics (~15,500 total tokens) and demonstrating >85% token reduction per turn.
- **Shell Autocompletion Generator (`everything-gemini completion`)**:
  - Native Bash and Zsh autocomplete generation for commands, profiles, and component types.
- **Enterprise Security Policy**: Added [`SECURITY.md`](SECURITY.md) establishing formal vulnerability disclosure workflows.
- **IDE Extensions**: Added [`.vscode/extensions.json`](.vscode/extensions.json) for developer workspace onboarding.

---

## [1.1.1] - 2026-10-15

### Added
- **Social Media Preview Engine**: Rich Open Graph (`og:*`) and Twitter Card (`twitter:*`) metadata embedded in `docs/index.html` for rich link unfurling on social platforms.
- **Turnkey Launch & Marketing Kit**: Added [`docs/LAUNCH_KIT.md`](docs/LAUNCH_KIT.md) featuring viral launch tweets, a 4-part thread, Reddit discussions, and Hacker News (Show HN) copy.
- **Enhanced CLI Catalog Discovery**: `everything-gemini list` now dynamically scans and highlights namespaced skills packaged within domain plugins.
- **Automated NPM Release CI**: Integrated automated npm publishing within `.github/workflows/release.yml` with provenance.

---

## [1.1.0] - 2026-10-15

### Added
- **27 Progressive Disclosure Skills Milestone**:
  - **`github-ops`**: End-to-end GitHub automation, PR generation, code review triage, and semantic releases via `gh` CLI and GitHub MCP.
  - **`ai-first-engineering`**: Requirement decomposition, executable acceptance criteria, and blast-radius containment.
  - **`rag-architect`**: RAG engineering with `text-embedding-004`, hybrid search (dense + BM25), and Gemini re-ranking.
  - **`gemini-function-calling`**: Production tool schemas, Pydantic output formatting, parallel execution, and error recovery envelopes.
- **Interactive Web Catalog Expansion**: Updated [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/) to feature all 27 progressive skills with instant search and category filtering.
- **Enhanced CLI Commands**: Added `everything-gemini init` for quickstart setup, `everything-gemini remove <type> <name>` for component uninstallation, and `everything-gemini test-skill <name>` for validation.

---

## [1.0.2] - 2026-10-15

### Added
- **Interactive Web Showcase**: Launched official documentation and interactive skill catalog at [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/).
- **Component Granular Management**: Added `everything-gemini add <type> <name>` to install individual skills, agents, or plugins into any workspace on demand.
- **Skill Quality Gate**: Added `everything-gemini test-skill <name>` validating frontmatter boundary syntax, descriptions, and script execution bits.
- **Python SDK Multi-Agent Orchestration**: Complete runnable pipeline example in `examples/python-sdk/` showcasing programmatic leasing of Planner and Reviewer subagents with token streaming.
- **Frontier Cloud & AI Skills**: Integrated `cloudflare-workers`, `supabase-architect`, `stripe-integration`, and `kubernetes-operator`.

### Changed
- CLI dynamically resolves package version from `package.json`.
- Updated comprehensive CLI documentation across README and repository references.

---

## [1.0.1] - 2026-10-15

### Added
- **`gemini-grounding` Skill**: Native Google Search Grounding and dynamic fact-verification playbook.
- **Automated Release Workflow**: `.github/workflows/release.yml` for automated GitHub releases and npm publishing.
- **NPM Package Verification**: Published to npm registry as `everything-gemini`.

### Changed
- Normalized all documentation, plugins, and lifecycle hook manifests to `everything-gemini`.
- Added instant `npx everything-gemini install` installation instructions to README.
- Credited Everything Claude Code (ECC) by Affan Mustafa in dedicated `Acknowledgements & Prior Art` section.

---

## [1.0.0] - 2026-10-15

### Initial Public Launch
- **18 Progressive Disclosure Skills**:
  - `gemini-multimodal`: Visual mockups, diagram extraction, and automated UI regression testing.
  - `context-caching`: 1M-2M token context optimization with static prefix caching.
  - `subagent-handoff`: Multi-agent scoped delegation and synthesis.
  - `api-craftsman`, `database-architect`, `devops-pipeline`, `root-cause-debugger`, `tdd-workflow`, `browser-qa-tester`, `architecture-designer`, `repo-onboarding`, `git-craftsman`, `performance-profiler`, `fullstack-nextjs`, `security-audit`, `continuous-learning`.
- **6 Scoped Subagents (`agents/`)**:
  - `planner.md`, `code-reviewer.md`, `build-repair.md`, `browser-qa.md`, `security-auditor.md`, `architect.md`.
- **GeminiShield Safety Gate & Lifecycle Hooks**:
  - `PreToolUse`: Catastrophic command blocker (`rm -rf`, `DROP TABLE`, `git push --force`).
  - `PostToolUse`: Auto-lint formatter.
  - `Stop`: Goal-verifier preventing premature agent completion on broken tests.
  - `PreInvocation`: Ephemeral context injector.
- **4 Modular Plugins**:
  - `plugins/core`, `plugins/web-fullstack`, `plugins/python-ai`, `plugins/security-shield`.
- **Zero-Dependency CLI (`bin/everything-gemini`)**:
  - `doctor`, `install`, `list`, `new-skill`, `new-agent`, `validate`.
- **Comprehensive Documentation**:
  - Architectural comparison breakdown against Everything Claude Code (ECC) (`docs/ecc-vs-everything-gemini.md`).
  - 4 Antigravity Surfaces guide (Desktop 2.0, IDE, CLI, Python SDK).
  - Progressive disclosure specifications and Cortex event loop diagrams.
