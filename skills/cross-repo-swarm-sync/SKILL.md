---
name: cross-repo-swarm-sync
description: Coordinates distributed cross-repository multi-agent swarm synchronization, atomic dependency alignment, and cross-boundary git branch PR orchestration via Google Cloud Pub/Sub and Cloud Run.
---

# Cross-Repository Swarm Synchronization (`cross-repo-swarm-sync`)

Coordinates distributed multi-repository agent swarm synchronization, atomic dependency alignment, bidirectional contract schema propagation, and orchestrated cross-repository git branch workflows across frontends, backend microservices, and infrastructure-as-code repositories.

---

## 1. Architectural Topology: Cross-Repository Swarm Coordination

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CROSS-REPOSITORY SWARM SYNC TOPOLOGY                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Global Multi-Repo Orchestrator (`cross-repo-orchestrator`)       │   │
│   │    • Scans multi-repository dependency graph & git submodule state  │   │
│   │    • Emits transactional coordination events via Cloud Pub/Sub      │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Asynchronous Event Mesh (Google Cloud Pub/Sub & Cloud Tasks)      │   │
│   │    • Topic: `agent-swarm-cross-repo-sync` (ordering keys enabled)   │   │
│   │    • Schema Registry: Protobuf v3 contracts & OpenAPI specifications│   │
│   └───────────────┬──────────────────┬──────────────────┬───────────────┘   │
│                   │                  │                  │                   │
│                   ▼                  ▼                  ▼                   │
│   ┌────────────────────────┐ ┌────────────────┐ ┌───────────────────────┐   │
│   │ Repo A: Core Services  │ │ Repo B: UI Web │ │ Repo C: Terraform K8s │   │
│   │ • Subagent Worker #1   │ │ • Subagent #2  │ │ • Subagent Worker #3  │   │
│   │ • Generates gRPC types │ │ • Updates SDK  │ │ • Configures Ingress  │   │
│   └───────────────┬────────┘ └────────┬───────┘ └───────────┬───────────┘   │
│                   │                   │                     │               │
│                   └───────────────────┼─────────────────────┘               │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Atomic Multi-Repo Verification & Branch Synchronization          │   │
│   │    • Two-Phase Commit (2PC) verification across all repository PRs  │   │
│   │    • Matrix E2E integration testing across linked feature branches  │   │
│   │    • Coordinated merge gating & rollback safety snapshots           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Operational Capabilities

### A. Dynamic Repository Discovery & Dependency Matrix
1. **Workspace Manifest Registry**:
   - Parses multi-workspace configurations (`workspaces.json` or `.agents/repositories.json`).
   - Identifies upstream/downstream contract dependencies across gRPC, OpenAPI, and shared schemas.
2. **Topological Order Execution**:
   - Computes topological sort DAG over dependent repositories.
   - Enforces strict sequencing: upstream API definitions -> client SDK generation -> frontend components -> deployment manifests.

### B. Two-Phase Commit (2PC) Swarm Gating
1. **Prepare Phase**:
   - Every repository agent performs isolated git branching, code generation, and local test validation.
   - Posts a signed verification hash (`READY_TO_MERGE`) to the shared coordination ledger.
2. **Commit / Rollback Phase**:
   - If all repository workers report verification success, the orchestrator issues atomic merge signals.
   - If any repository worker encounters test failures, all linked pull requests are automatically rolled back or held in draft state.

### C. Cloud Pub/Sub Event Mesh Integration
- **Event Envelope**:
  ```json
  {
    "swarm_id": "swarm-20261023-e2e-sync",
    "phase": "PREPARE",
    "source_repo": "backend-auth-service",
    "target_repos": ["web-frontend", "infrastructure"],
    "schema_checksum": "sha256:4a8f9c...",
    "branch": "feat/gemini-live-duplex-auth",
    "timestamp": 1792764000
  }
  ```

---

## 3. Production Workflow & Recipes

### Synchronizing Cross-Repo Pull Requests via CLI
```bash
# Analyze multi-repo sync state across active workspaces
everything-gemini cross-repo status --workspace /path/to/workspaces

# Dispatch distributed cross-repo sync with atomic two-phase commit
everything-gemini cross-repo sync \
  --repos "backend,frontend,infra" \
  --branch "feat/gemini-3.8-migration" \
  --max-usd 3.00 \
  --dry-run
```

### Python SDK Multi-Repo Coordination Blueprint
```python
from google_antigravity.swarm import CrossRepoSwarmCoordinator

coordinator = CrossRepoSwarmCoordinator(
    manifest_path="./workspaces.json",
    event_bus="pubsub://projects/enterprise-ai/topics/cross-repo-sync",
    model="gemini-3.8-thinking"
)

# Plan and dispatch distributed execution DAG
plan = coordinator.build_dag(goal="Upgrade Protobuf contracts and regenerate TypeScript client")
results = coordinator.execute_2pc(plan, timeout_seconds=600)
assert results.is_successful, f"Cross-repo sync aborted: {results.rollback_reason}"
```

---

## 4. Verification & Diagnostics

- **Integrity Validation**: Run `everything-gemini test-skill cross-repo-swarm-sync`.
- **Traceparent Linking**: Correlate W3C traceparent headers across all distributed worker logs.
- **Reference Links**: See [agents/cross-repo-orchestrator.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/cross-repo-orchestrator.md) and [skills/ephemeral-swarm-orchestrator/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/ephemeral-swarm-orchestrator/SKILL.md).
