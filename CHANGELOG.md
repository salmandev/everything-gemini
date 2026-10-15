# 📜 Changelog

All notable changes to **Everything Gemini (`everything-gemini`)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
