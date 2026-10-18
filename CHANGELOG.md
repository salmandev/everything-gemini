# 📜 Changelog

All notable changes to **Everything Gemini (`everything-gemini`)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-10-18

### Added
- **48 Progressive Disclosure Skills & 65-Component Ecosystem Milestone**:
  - **`langgraph-orchestrator`**: Production multi-agent StateGraphs, cyclic branching, persistent checkpointers (`MemorySaver` / `AsyncPostgresSaver`), and human-in-the-loop validation (`interrupt_before`).
  - **`playwright-visual-regression`**: Automated pixelmatch screenshot diffing, cross-browser viewport matrices, dynamic element masking, and containerized Docker stability.
  - **`open-telemetry-tracing`**: End-to-end distributed tracing, OTLP HTTP/gRPC exporters, W3C `traceparent` propagation, custom span attributes, and metric correlations.
  - **`argo-workflows`**: Kubernetes-native DAG workflows, artifact passing (S3/GCS/MinIO), container steps, exponential retry strategies, and CronWorkflows.
- **10th Scoped Subagent Fleet Expansion**:
  - **`release-engineer`** ([`agents/release-engineer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/release-engineer.md)): Dedicated release gatekeeper enforcing Semantic Versioning (`semver`), automated changelog compilation, build artifact checksumming, git release tagging, and canary rollouts.
- **CLI Ecosystem Audit Command (`everything-gemini audit [path]`)**:
  - Comprehensive static quality inspection across skills (YAML frontmatter schema and token budgets), subagents (role, permissions, handoff contracts), lifecycle hooks (`chmod +x` executability), and secret hygiene. Supports both human-readable terminal output and `--json` format for automated CI integration.
  - Expanded shell completion scripts (`bin/everything-gemini completion`) for Bash and Zsh to autocomplete `audit`, all 48 skills, and 10 subagents.
- **Curated MCP Sentry Blueprint**:
  - Added `@modelcontextprotocol/server-sentry` to [`mcp/mcp_config.example.json`](file:///Users/salmanshaikh/development/github/everything-gemini/mcp/mcp_config.example.json), [`templates/full-power/mcp_config.json`](file:///Users/salmanshaikh/development/github/everything-gemini/templates/full-power/mcp_config.json), and [`mcp/README.md`](file:///Users/salmanshaikh/development/github/everything-gemini/mcp/README.md) for real-time error tracking and issue triage.
- **Automated Release Readiness Pipeline (`examples/python-sdk/release_readiness_audit.py`)**:
  - 4-stage multi-agent qualification loop orchestrating Planner -> Code Reviewer -> Security Auditor -> Release Engineer before release candidate tagging.
- **24-Assertion Automated E2E Test Suite & Benchmark**:
  - Expanded `tests/cli.test.js` validating the new `audit` command (terminal reports and `--json`), component inspections for new skills/subagents, and updated 65-component benchmark invariants.
- **Showcase Web App 65-Component Expansion**:
  - Catalog and live metrics on [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/) updated to 48 progressive skills, 10 subagents, 7 hooks, and `v1.7.0` release badge.

## [1.6.0] - 2026-10-18

### Added
- **44 Progressive Disclosure Skills & 60-Component Ecosystem Milestone**:
  - **`turborepo-monorepo`**: High-performance monorepo build orchestration, declarative task graphs (`turbo.json`), hash-based remote caching, micro-frontend package boundaries, and Docker deployment pruning (`turbo prune`).
  - **`dbt-transformation`**: Production data engineering with dbt Core, modular DAG modeling (`stg_`, `int_`, `fct_`), Jinja macros, incremental idempotency, and automated schema testing (`dbt test`).
  - **`apache-kafka-streams`**: Resilient event-driven streaming with KafkaJS, transactional exactly-once processing (EOS), cooperative sticky partition rebalancing, and stateful tumbling time-window aggregations.
  - **`grpc-connect-rpc`**: Modern, browser-native RPC services using Connect-ES and Connect-Go, type-safe streaming without Envoy proxy bottlenecks, Buf schema registry workflows, and compact binary Protobuf serialization.
- **9th Scoped Subagent Fleet Expansion**:
  - **`documentation-writer`** ([`agents/documentation-writer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/documentation-writer.md)): Dedicated technical documentation and architectural runbook specialist enforcing Antigravity progressive disclosure principles, strict frontmatter conventions, and clickable `file://` hyperlink integrity.
- **Curated MCP Sequential Thinking Blueprint**:
  - Added `@modelcontextprotocol/server-sequential-thinking` to [`mcp/mcp_config.example.json`](file:///Users/salmanshaikh/development/github/everything-gemini/mcp/mcp_config.example.json), [`templates/full-power/mcp_config.json`](file:///Users/salmanshaikh/development/github/everything-gemini/templates/full-power/mcp_config.json), and [`mcp/README.md`](file:///Users/salmanshaikh/development/github/everything-gemini/mcp/README.md) for dynamic step-by-step problem decomposition and hypothesis revision.
- **CLI Search & Discovery Command (`everything-gemini search <query>`)**:
  - Integrated full ecosystem search across skills, subagents, lifecycle hooks, and MCP blueprints with colored terminal cards and `--json` format output for scripting and IDE integration.
  - Expanded shell completion scripts (`bin/everything-gemini completion`) for Bash and Zsh to autocomplete `search`, `find`, all 44 skills, and 9 subagents.
- **Automated Documentation Audit Pipeline (`examples/python-sdk/documentation_audit_pipeline.py`)**:
  - Python SDK automation pipeline verifying documentation integrity, frontmatter schema adherence, broken link detection, and token budget enforcement.
- **22-Assertion Automated E2E Test Suite & Benchmark**:
  - Expanded `tests/cli.test.js` validating the new `search` command (terminal cards and `--json`), component inspection for new skills/subagents, and updated 60-component benchmark invariants.
- **Showcase Web App 60-Component Expansion**:
  - Catalog and live metrics on [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/) updated to 44 progressive skills, 9 subagents, 7 hooks, and `v1.6.0` release badge.

## [1.5.0] - 2026-10-17

### Added
- **40 Progressive Disclosure Skills & 55-Component Milestone**:
  - **`duckdb-local-olap`**: Embedded in-process analytical SQL (OLAP), direct zero-copy Apache Arrow querying, S3 Parquet integration, and MotherDuck hybrid cloud synchronization.
  - **`nats-jetstream`**: Production event-driven messaging, at-least-once & exactly-once semantics, consumer deduplication windows, KV distributed buckets, and ephemeral push/pull consumers.
  - **`axum-web-service`**: Ergonomic, high-performance Rust web service architecture with Tokio async runtime, Tower middleware chains, compile-time SQLx queries, and RFC 7807 error envelopes.
- **Agent Profile Import Command (`everything-gemini import`)**:
  - Full CLI roundtrip management: import exported agent profiles (`everything-gemini-profile.json`) into workspace (`.agents/`) or global (`~/.gemini/config/`) targets with `--dry-run` simulation safety.
- **Autonomous Multi-Agent Pipeline Harness (`examples/python-sdk/multi_agent_pipeline.py`)**:
  - End-to-end 4-stage pipeline orchestrating Planner -> Database Migrator -> Performance Tuner -> Code Reviewer using the official `google-antigravity` Python SDK with automated syntax verification.
- **19-Assertion Automated E2E Test Suite**:
  - Expanded `tests/cli.test.js` validating the new `import` command across dry-run simulations, file-path sources, and target locations, alongside updated 55-component benchmark checks.
- **Showcase Web App 55-Component Expansion**:
  - Catalog and metrics on [https://salmandev.github.io/everything-gemini/](https://salmandev.github.io/everything-gemini/) updated to 40 progressive skills and `v1.5.0` badge.

## [1.4.0] - 2026-10-17

### Added
- **37 Progressive Disclosure Skills & 52-Component Milestone**:
  - **`clickhouse-analytics`**: High-throughput OLAP schemas, MergeTree engines, Kafka streaming ingestion, and vector similarity search.
  - **`temporal-workflows`**: Fault-tolerant distributed workflow orchestration, retry policies, async activities, and saga compensations.
  - **`trpc-react-query`**: End-to-end type safety with tRPC v11 routers, TanStack React Query v5 cache management, and optimistic UI mutations.
  - **`wasm-rust-optimizer`**: High-performance WebAssembly compilation from Rust using `wasm-pack`, zero-copy memory buffers (`Uint8Array`), and SIMD.
- **8 Scoped Subagents Fleet**:
  - **`database-migrator`**: Dedicated database schema evolution specialist designing zero-downtime expand/contract SQL migrations and rollback safety.
  - **`performance-tuner`**: Systems performance specialist diagnosing flamegraphs, memory leaks, slow database query plans, and N+1 waterfalls.
- **7th Lifecycle Safety Gate (`secret-scrubber`)**:
  - PreToolUse security gate intercepting file write operations (`write_to_file`, `replace_file_content`, `multi_replace_file_content`) to block accidental raw credential leaks (AWS, OpenAI, Gemini, GitHub PAT, Stripe, and private keys).
- **New CLI Commands (`diff` and `export`)**:
  - `everything-gemini diff`: Compares installed workspace components against master catalog to inspect local modifications vs upstream updates.
  - `everything-gemini export`: Exports installed skills, subagents, and hook configurations into portable JSON bundles (`everything-gemini-profile.json`).
- **Expanded Curated MCP Blueprints**:
  - Added `@modelcontextprotocol/server-docker` (container inspection) and `@modelcontextprotocol/server-clickhouse` (real-time OLAP).
- **18-Assertion Automated E2E Test Suite**:
  - Expanded `tests/cli.test.js` validating `diff`, `export`, and new subagent/skill inspections across all platforms.

## [1.3.0] - 2026-10-16

### Added
- **33 Progressive Disclosure Skills Milestone**:
  - **`fastapi-production`**: Production async FastAPI architecture, Pydantic v2 schemas, lifespan context management, JWT auth, dependency injection, and Kubernetes health probes.
  - **`redis-cache-patterns`**: Enterprise Redis caching (cache-aside with jitter), safe distributed locks with atomic Lua token release (Redlock), sliding-window rate limiting, and streams.
  - **`svelte-kit-architect`**: Modern SvelteKit web applications using Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`), SSR/prerendering, and progressive form actions.
- **Viral Launch & Distribution Kit (`docs/launch-kit.md`)**:
  - Comprehensive copy-paste submissions for Hacker News (Show HN), X/Twitter 6-tweet launch thread, Reddit (r/LocalLLaMA & r/programming), and Product Hunt.
- **Showcase Web App 45-Component Expansion**:
  - Live index now hosts 33 progressive skills, 6 scoped subagents, and 6 lifecycle hooks with instant search and 1-click CLI copy buttons.
- **CLI Shell Completion Updates**:
  - Added new skills to Bash and Zsh autocomplete dictionary in `everything-gemini completion`.

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
- **Ecosystem Status Dashboard (`everything-gemini status` / `check`)**:
  - Live terminal dashboard reporting installed progressive skills, scoped subagents, lifecycle hooks, and active rules across local (`.agents/`) or global (`~/.gemini/config/`) targets.
- **Ecosystem Update Pipeline (`everything-gemini update`)**:
  - In-place synchronization updating installed skills, subagent definitions, and hook configurations from the master catalog without destructive overwrites.
- **Persistent Semantic Memory & Web Fetch MCP Blueprints**:
  - Curated `@modelcontextprotocol/server-memory` (knowledge graph semantic memory across agent sessions) and `@modelcontextprotocol/server-fetch` in `mcp/mcp_config.example.json` and `templates/full-power/mcp_config.json`.
- **Python SDK Test Suite & Compilation Validation**:
  - Added native Python syntax compilation verification (`python3 -m py_compile`) to `scripts/validate.sh` to ensure all Python SDK examples compile without syntax or import errors.
- **Dry Run Simulation (`--dry-run`)**:
  - Zero-risk previews for `everything-gemini install` and `everything-gemini update` that detail which files, rules, skills, and hooks would be created without disk mutations.
- **Machine-Readable JSON Output (`--json`)**:
  - Full structured JSON payloads for `everything-gemini status --json` and `everything-gemini benchmark --json`, ideal for CI/CD scripting and automated health checks.
- **Automated CLI E2E Test Suite (`tests/cli.test.js`)**:
  - 15-assertion integration test suite validating doctor, list, dry-run installations, workspace isolation, component addition/removal, completion installation, and JSON exports across all operating systems.
- **Automated Shell Completion Installer (`everything-gemini completion --install`)**:
  - Automatically and idempotently installs tab completions into user shell configuration files (`~/.zshrc`, `~/.bashrc`, or custom `--rc`) with `--dry-run` inspection.
- **Curated Redis Cache MCP Server Blueprint**:
  - Added `@modelcontextprotocol/server-redis` to `mcp/mcp_config.example.json`, `templates/full-power/mcp_config.json`, and documented in `mcp/README.md`.
- **Automated Relative Documentation Link Validator**:
  - Integrated recursive markdown relative link verification into Phase 3 of `scripts/validate.sh` to prevent broken links across all documentation and skill files.
- **Community Contributor Onboarding & Wishlist**:
  - Added GitHub issue templates for Subagent Proposals and Feature Requests, plus a curated wishlist of high-demand skills in `CONTRIBUTING.md`.
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
