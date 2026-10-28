# Everything Gemini (everything-gemini) v3.1.0 Launch Kit
## Enterprise Agent Substrates: Google AX & Google Cloud Plugin Federation (141 Production Components)

---

### 📦 Release Metadata
- **Release Version**: `v3.1.0`
- **Release Codename**: *Enterprise Substrate & Cloud Federation*
- **Git Commit / Tag**: `v3.1.0`
- **Total Production Components**: **141** (108 Progressive Skills, 20 Scoped Subagents, 13 Lifecycle Hooks, 5 Curated Plugins)
- **Primary Milestones**:
  1. **Google AX (Agent Executor) Orchestrator Integration (`google/ax`)**:
     - Full support for Google's declarative Agent Substrate (`ate-system`) and Kubernetes-native agent orchestration using `ax.io/v1alpha1` Custom Resource Definitions (CRDs).
     - Standardized lifecycle definitions for `Workspace`, `Gateway`, `Model`, and `Task` resources with automatic mounting of `/.agents/skills` and injection of `AGENTS.md` and `GEMINI.md`.
     - Progressive disclosure orchestrator skill in [`skills/google-ax/SKILL.md`](file:///Users/salmanshaikh/development/github/everything-gemini/skills/google-ax/SKILL.md).
     - Dedicated reference manifests in [`examples/ax/`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/).
  2. **Google Cloud & Agent Platform Plugin (`plugins/google-cloud/`)**:
     - Introduces the modular plugin architecture federating official enterprise playbooks from [`google/skills`](https://github.com/google/skills).
     - Includes 5 battle-tested production skills:
       - [`agent-platform-eval-flywheel`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/skills/agent-platform-eval-flywheel/SKILL.md): Continuous offline & online evaluation loops with Vertex AI GenAI Evaluation Service.
       - [`agent-platform-rag-engine`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/skills/agent-platform-rag-engine/SKILL.md): Hybrid vector and keyword retrieval with Spanner Graph and BigQuery Vector Search.
       - [`developing-genkit`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/skills/developing-genkit/SKILL.md): Full-stack Genkit flows, tool calling, telemetry, and structured outputs in Node.js and Go.
       - [`gke-ai-troubleshooting-tpu`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/skills/gke-ai-troubleshooting-tpu/SKILL.md): MXLA lockups, TPU slice health diagnostics, NCCL interconnect debugging, and preemptible recovery on GKE.
       - [`google-cloud-storage-fuse`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/skills/google-cloud-storage-fuse/SKILL.md): High-throughput POSIX GCS bucket streaming and local cache invalidation for large datasets.
     - Enforces cloud architecture standards via [`plugins/google-cloud/rules/cloud-architecture-standards.md`](file:///Users/salmanshaikh/development/github/everything-gemini/plugins/google-cloud/rules/cloud-architecture-standards.md).
  3. **New CLI Subcommands**:
     - `everything-gemini ax init`: Scaffolds production-grade declarative `ax.io/v1alpha1` Kubernetes manifests.
     - `everything-gemini skills sync google/skills`: Federates and syncs official Google skill catalogs into the active workspace or plugin directory.
  4. **Updated Subagent Capabilities**:
     - [`agents/platform-engineer.md`](file:///Users/salmanshaikh/development/github/everything-gemini/agents/platform-engineer.md) updated with native Google AX Substrate and CRD orchestration capabilities.

---

## 🚀 How to Publish to npm

```bash
# 1. Run local test suite (61 test suites passing)
npm test

# 2. Verify npm authentication
npm whoami

# 3. Publish to npm registry (public access)
npm publish --access public

# 4. Push git commit and release tags to GitHub
git push origin main --tags
```

---

## 📱 Social Media Copy & Launch Templates

### 1. LinkedIn Post

**Title**: 🪐 Announcing Everything Gemini v3.1.0: Declarative Google AX Agent Substrates & Google Cloud Skills Federation

```markdown
🚀 The AI agent infrastructure stack just took a massive leap forward.

We are excited to release Everything Gemini (everything-gemini) v3.1.0! 🪐

In v3.0.0, we introduced The Dual Standard: Google's Elephant-Goldfish Model (EGM) and Agentic Superpowers TDD. 
In v3.1.0, we scale from local pair programming to enterprise Kubernetes agent clusters and official Google Cloud ecosystem playbooks!

Here is what's new in v3.1.0:

☸️ 1. Google AX (Agent Executor) Cluster Orchestration
Google recently open-sourced `google/ax` — a Kubernetes-native Agent Substrate (`ate-system`) for running agent fleets at scale. 
With v3.1.0, Everything Gemini provides first-class support for AX:
• Progressive skill `google-ax` with end-to-end CRD definitions (`ax.io/v1alpha1` Workspace, Gateway, Model, Task)
• Declarative workspace templates mounting `/.agents/skills` directly to agent containers
• Instant scaffolding via `npx everything-gemini ax init`

☁️ 2. Google Cloud & Agent Platform Plugin (`plugins/google-cloud`)
Federating official playbooks from `google/skills` into Everything Gemini:
• Vertex AI Agent Platform Evaluation Flywheel
• Agent Platform RAG Engine with Spanner Graph & BigQuery Vector Search
• Production Firebase Genkit flows & structured schemas
• GKE AI TPU v5p & Cloud TPU MXLA troubleshooting
• Google Cloud Storage FUSE high-throughput dataset caching

⚡ 3. Unified Skills Federation CLI:
$ npx everything-gemini ax init --namespace ax-agents
$ npx everything-gemini skills sync google/skills
$ npx everything-gemini benchmark --json

📊 The v3.1.0 Ecosystem in Numbers:
• 141 Total Production Components
• 108 Progressive Disclosure Skills (>85% token reduction)
• 20 Scoped Autonomous Subagents (including `platform-engineer`, `elephant-architect`, `goldfish-reviewer`)
• 13 Lifecycle Safety Hooks
• 5 Curated Enterprise Plugins
• 100% Zero-Dependency Node.js CLI (61 test suites passing)

🔗 GitHub: https://github.com/salmandev/everything-gemini
📖 Catalog: https://salmandev.github.io/everything-gemini/

#GoogleGemini #Antigravity #GoogleAX #Kubernetes #GoogleCloud #AIAgents #Genkit #GKE #DevOps #OpenSource
```

---

### 2. X (Twitter) Thread

```markdown
1/8 🚨 Running AI agents in production requires more than prompts — it requires scalable infrastructure and battle-tested cloud runbooks.

Introducing Everything Gemini v3.1.0: Google AX Agent Substrates & Google Cloud Skills Federation! 🪐👇

2/8 ☸️ Native Google AX Orchestration (`google/ax`)
Google's new Agent Executor runs agent swarms on Kubernetes.
v3.1.0 adds full support for `ax.io/v1alpha1` CRDs:
• Workspaces with persistent `/workspace` & mounted `/.agents/skills`
• Secure Gateway routing & Model backends
• One-command scaffold:
$ npx everything-gemini ax init

3/8 ☁️ Google Cloud & Agent Platform Plugin (`plugins/google-cloud`)
We've integrated key enterprise playbooks from `google/skills`:
• Vertex AI Agent Eval Flywheel
• Hybrid RAG Engine (Spanner + BigQuery)
• Full-stack Genkit development
• GKE TPU slice & MXLA troubleshooting
• GCS FUSE POSIX storage caching

4/8 🔄 Dynamic Skills Federation:
Sync official Google skills directly into your local workspace or plugin system:
$ npx everything-gemini skills sync google/skills --dry-run

5/8 📊 Ecosystem Stats:
• 141 Total Production Components
• 108 Progressive Skills
• 20 Scoped Subagents
• 13 Safety Lifecycle Hooks
• 5 Modular Plugins
• 61 E2E Integration Test Suites (100% pass)

6/8 🛠️ Get started in seconds with zero install:
$ npx everything-gemini ax init
$ npx everything-gemini egm review --dry-run
$ npx everything-gemini superpowers init
$ npx everything-gemini benchmark --json

7/8 Star the repo & explore the interactive catalog:
🔗 GitHub: https://github.com/salmandev/everything-gemini
🌐 Live Catalog: https://salmandev.github.io/everything-gemini/

Built with 💙 for the Google Antigravity & Gemini 3.8 community. RTs appreciated! 🔁
```

---

### 3. Reddit Post (`r/kubernetes` & `r/LocalLLaMA`)

**Title**: Everything Gemini v3.1.0: Kubernetes Agent Substrates with Google AX (`google/ax`) & Google Cloud Agent Skills (141 Components)

```markdown
Hey everyone,

As AI coding agents move from single-turn terminal assistants to multi-agent swarms, running them in isolated, observable Kubernetes containers is becoming essential.

Google recently released **Google AX (Agent Executor)** (`google/ax`), an open-source Agent Substrate (`ate-system`) built on Kubernetes CRDs (`ax.io/v1alpha1`).

In **Everything Gemini v3.1.0**, we’ve added end-to-end integration for Google AX and federated official cloud playbooks from `google/skills`.

### What's New in v3.1.0:
1. **Google AX Orchestration**:
   - Manifest templates for `Workspace`, `Gateway`, `Model`, and `Task` CRDs.
   - Mounting `/.agents/skills` directly to agent containers.
   - CLI command `npx everything-gemini ax init` for instant manifest generation.
2. **Google Cloud Plugin (`plugins/google-cloud`)**:
   - `agent-platform-eval-flywheel`: Offline/online evaluation on Vertex AI.
   - `agent-platform-rag-engine`: Hybrid Spanner Graph + BigQuery Vector Search RAG.
   - `developing-genkit`: Production Firebase Genkit flows.
   - `gke-ai-troubleshooting-tpu`: Diagnosing Cloud TPU v5p MXLA lockups and NCCL collective communication errors on GKE.
   - `google-cloud-storage-fuse`: High-performance GCS streaming mounts.
3. **Dynamic Skills Federation**:
   - `npx everything-gemini skills sync google/skills` to sync and federate upstream Google skills.
4. **Platform Engineer Subagent**:
   - Updated `agents/platform-engineer.md` with native AX Substrate and Kubernetes CRD capabilities.

Total ecosystem components: **141** (108 skills, 20 subagents, 13 hooks, 5 plugins), verified by 61 E2E tests.

- GitHub: https://github.com/salmandev/everything-gemini
- Live Catalog: https://salmandev.github.io/everything-gemini/

Happy to answer questions about declarative agent orchestration on Kubernetes!
```
