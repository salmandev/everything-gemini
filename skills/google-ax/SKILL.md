---
name: google-ax
description: Authors, validates, and deploys declarative Agent Executor (AX) manifests (Task, Workspace, Gateway, Model) on Agent Substrate, wires MCP servers and skill packages, and operates the ax CLI.
---

# Google Agent Executor (AX) & Cluster Orchestration

Authors, validates, provisions, and operates autonomous agent workloads at scale using **Google AX (`google/ax`)** and **Agent Substrate**. Bridges local Antigravity harnesses (`everything-gemini`) and official Google skills (`google/skills`) into cluster-grade, sandboxed agent execution.

---

## 1. Architecture: Google AX & Agent Substrate

```
                              Kubernetes / GKE Cluster
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             AX Orchestrator (ax-server)                         │
│  • Reads ax.io/v1alpha1 manifests (Workspace, Task, Gateway, Model)             │
│  • Manages actor lifecycle, trajectory branching & evaluation sweeps            │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Schedules
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       Agent Substrate Runtime (ate-system)                      │
│                                                                                 │
│   ┌────────────────────────────────┐   ┌────────────────────────────────┐       │
│   │ TASK SANDBOX A (Active)        │   │ TASK SANDBOX B (Suspended)     │       │
│   │ • Container: ax-task-runner    │   │ • Sub-second snapshot state    │       │
│   │ • Workspace: Git + .agents/    │   │ • 0 CPU/RAM allocation         │       │
│   │ • Gateway: Strict Egress Allow │   │ • Instant ax resume wakeup     │       │
│   └────────────────────────────────┘   └────────────────────────────────┘       │
│                                                                                 │
│   Pre-Wired Workspace Filesystem:                                               │
│   ├── /workspace/ (Target Git Repository)                                       │
│   ├── /.agents/skills/ (google/skills & everything-gemini progressive skills)   │
│   ├── /etc/mcp/ (Model Context Protocol tool registries)                        │
│   └── /workspace/AGENTS.md & GEMINI.md (Behavioral harness rules)               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Primitives (`ax.io/v1alpha1`)

AX uses four declarative Kubernetes-style resources to define and isolate agent tasks:

| Primitive | Kind | Purpose in AX |
| :--- | :--- | :--- |
| **Workspace** | `Workspace` | Pre-wires the environment before an agent boots: clones Git repos, populates `AGENTS.md`, and materializes skill packages into `/.agents/skills`. |
| **Task** | `Task` | Defines the isolated execution sandbox for untrusted agent code, resource limits (CPU/RAM cgroups), environment variables, and debug flags. |
| **Gateway** | `Gateway` | Enforces zero-trust network boundaries, locking down inbound listeners and egress traffic to explicit domain/port allowlists. |
| **Model** | `Model` | Centralizes LLM provider configuration (e.g. Google Gemini 3.8 / 2.5), sampling temperature, and Kubernetes secret bindings. |

---

## 3. Production Manifest: Everything Gemini on Google AX

The following manifest demonstrates pre-wiring a target Git repository with `everything-gemini` behavioral rules, the official `google/skills` catalog, Gemini 3.8 Flash, and strict egress network fencing:

```yaml
# agent-cluster-task.yaml
apiVersion: ax.io/v1alpha1
kind: Workspace
metadata:
  name: everything-gemini-workspace
  atespace: default
spec:
  git:
    - name: repo
      repo: "https://github.com/my-org/production-service.git"
      branch: "main"
  files:
    - path: "AGENTS.md"
      content: |
        # Antigravity Autonomous Agent Rules
        - Adhere strictly to Test-Driven Development (Superpowers TDD).
        - Verify all code changes with local tests before task completion.
        - Load progressive skills dynamically from /.agents/skills/ only when required.
    - path: "GEMINI.md"
      content: |
        - Never modify public API contracts without architectural signoff.
        - Emit structured errors matching standard platform error schemas.
  skills:
    registries:
      - provider: google
        query: "skills.tags:cloud,skills.tags:ai"
        path: "/.agents/skills"
  mcp:
    registries:
      - provider: google
        query: "mcp.tags:standard"

---
apiVersion: ax.io/v1alpha1
kind: Gateway
metadata:
  name: secure-agent-gateway
  atespace: default
spec:
  egress:
    allowlist:
      hosts:
        # LLM Provider Inference
        - host: "generativelanguage.googleapis.com"
          port: 443
        - host: "*.googleapis.com"
          port: 443
        # Code & Package Repositories
        - host: "github.com"
          port: 443
        - host: "registry.npmjs.org"
          port: 443
        - host: "pypi.org"
          port: 443
        - host: "files.pythonhosted.org"
          port: 443

---
apiVersion: ax.io/v1alpha1
kind: Model
metadata:
  name: gemini-frontier-model
  atespace: default
spec:
  provider: google
  model: gemini-3.8-flash
  secretKey:
    name: gemini-api-credentials
    key: GEMINI_API_KEY
  parameters:
    temperature: 0.7

---
apiVersion: ax.io/v1alpha1
kind: Task
metadata:
  name: automated-refactor-task
  atespace: default
spec:
  image: "gcr.io/ax-substrate/ate-images/ax-task-runner:latest"
  config:
    goal: "Diagnose failing integration tests, execute Superpowers TDD refactor, and verify zero regressions."
  workspaces:
    - name: everything-gemini-workspace
      path: "/workspace"
  gateway:
    name: secure-agent-gateway
  model:
    name: gemini-frontier-model
  resources:
    requests:
      cpu: "1000m"
      memory: "2Gi"
    limits:
      cpu: "4000m"
      memory: "8Gi"
  debug: true # Enables live ax ssh inspection
```

---

## 4. Operational CLI Playbook

Install and use the `ax` CLI to manage workloads across your cluster:

### 1. Verification & Pre-flight
Verify that Agent Substrate is running in the `ate-system` namespace:
```bash
# Verify Agent Substrate API endpoint
kubectl get svc api -n ate-system

# Verify ax CLI installation
ax version
```

### 2. Apply & Inspect
```bash
# Apply the declarative manifest
ax apply -f agent-cluster-task.yaml

# Check the task status and phases (Pending -> Preparing -> Running -> Succeeded)
ax describe task automated-refactor-task

# Stream live agent execution logs
ax logs -f automated-refactor-task
```

### 3. Live Debugging with `ax ssh`
If `debug: true` is enabled in `Task.spec`, engineers can look directly over the agent's shoulder:
```bash
# Shell into the isolated agent sandbox
ax ssh automated-refactor-task

# Execute ad-hoc commands within the active sandbox
ax ssh automated-refactor-task -- ls -la /workspace
ax ssh automated-refactor-task -- cat /workspace/AGENTS.md
```

### 4. Sub-Second Suspension & Resumption
When an agent is awaiting human review or model inference, suspend it to release cluster CPU/RAM without losing disk state:
```bash
# Checkpoint and suspend the task
ax suspend automated-refactor-task

# Resume instantly from the checkpointed state
ax resume automated-refactor-task
```

### 5. Trajectory Forking & Exploration
Fork an agent's execution from a saved checkpoint to evaluate alternative prompts or speculative branches:
```bash
# Fork task execution from checkpoint step-14
ax fork automated-refactor-task --checkpoint step-14 --name refactor-branch-b
```

---

## 5. Integrating Everything Gemini with AX

To export an existing local `everything-gemini` workspace into AX:

```bash
# Initialize and synthesize AX manifests from local workspace
everything-gemini ax init --output ax-deploy/

# Review generated manifests
ls -la ax-deploy/
# task.yaml  workspace.yaml  gateway.yaml  model.yaml

# Deploy to active cluster
ax apply -f ax-deploy/
```

---

## 6. Troubleshooting & Gotchas

| Symptom | Root Cause | Fix |
| :--- | :--- | :--- |
| **`EgressBlocked: 403` to Gemini API** | `Gateway.spec.egress.allowlist` missing `generativelanguage.googleapis.com:443`. | Add Google Generative Language host and port 443 to the Gateway manifest. |
| **`WorkspacePrepareFailed: 401 Unauthorized`** | Git repository requires private credentials. | Add `secretRef` in `Workspace.spec.git` referencing a Kubernetes deploy key or GitHub token secret. |
| **`SkillsNotFound: /.agents/skills`** | The skills registry query did not return any matches. | Check the query tags (`skills.tags:cloud`) or provide inline skill definitions in `Workspace.spec.files`. |
| **`ax ssh: connection refused`** | Task manifest has `debug: false` or task is suspended. | Set `spec.debug: true` and ensure task is in `Running` state (`ax resume <name>`). |
