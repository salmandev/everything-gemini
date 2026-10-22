---
name: ephemeral-swarm-orchestrator
description: Dynamically synthesizes, deploys, and reclaims ephemeral multi-agent swarms for cross-repository parallel refactoring and consensus aggregation.
---

# Ephemeral Swarm Orchestrator (Swarm Intelligence)

Implements dynamic on-demand synthesis, parallel task decomposition, distributed cross-repository execution, consensus aggregation, and lifecycle reclamation of ephemeral micro-agent swarms for Google Gemini and Antigravity.

---

## 1. Architecture: Dynamic Ephemeral Micro-Agent Swarm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   EPHEMERAL SWARM ORCHESTRATION PIPELINE                    │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Swarm Coordinator & Planner Decomposition                        │   │
│   │    • Complex multi-repo goal or massive refactor prompt              │   │
│   │    • Decomposed into DAG of atomic micro-tasks with input contracts  │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Dynamic Ephemeral Specialist Synthesis                           │   │
│   │    • Synthesizes targeted micro-agent definitions in memory          │   │
│   │    • E.g. `spanner-deadlock-tuner`, `grpc-schema-validator`          │   │
│   │    • Mounts minimal progressive skills & scoped tool permissions    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Parallel Worker Swarm Execution (Pub/Sub & Cloud Run Jobs)       │   │
│   │    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │   │
│   │    │ Worker #1 (RepoA)│  │ Worker #2 (RepoB)│  │ Worker #3 (Infra)│ │   │
│   │    └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │   │
│   └─────────────┼─────────────────────┼─────────────────────┼───────────┘   │
│                 └─────────────────────┼─────────────────────┘               │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Majority Consensus & Multi-Agent Voting                          │   │
│   │    • Aggregates diff proposals across parallel micro-agents         │   │
│   │    • Conflict resolution via Byzantine/majority agreement matrix   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Ephemeral Harness Teardown & Lifecycle Reclamation               │   │
│   │    • Verifies property-based unit & integration tests               │   │
│   │    • Distills learned instincts into persistent memory              │   │
│   │    • Decommissions worker contexts and purges memory state          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Operational Pillars

### A. Dynamic Specialist Synthesis
Traditional multi-agent frameworks rely on rigid, static subagent registries. The Ephemeral Swarm Orchestrator dynamically constructs targeted agent personalities and tool contracts based on task requirements:

```json
{
  "swarm_id": "swarm-20261022-spanner-sync",
  "coordinator": "swarm-coordinator",
  "topology": "hierarchical",
  "workers": [
    {
      "id": "worker-schema-evaluator",
      "specialization": "spanner-ddl-auditor",
      "scoped_skills": ["spanner-change-streams", "security-audit"],
      "permitted_tools": ["view_file", "grep_search", "run_command"],
      "token_budget": 8000
    },
    {
      "id": "worker-migration-author",
      "specialization": "liquibase-migration-writer",
      "scoped_skills": ["database-migrator", "tdd-workflow"],
      "permitted_tools": ["write_to_file", "replace_file_content", "run_command"],
      "token_budget": 12000
    }
  ]
}
```

### B. Consensus & Voting Protocol
When multiple micro-agents generate speculative patches or architectural proposals, the swarm coordinator invokes a multi-agent voting round:
1. **P2P Cross-Verification**: Worker 1 reviews Worker 2's AST patch.
2. **Deterministic Test Execution**: Candidate diffs are executed against property-based tests in isolated ephemeral directories.
3. **Quorum Verification**: A change requires $\ge 67\%$ consensus agreement before promotion into the primary branch.

### C. Resource Reclamation & Zero Leaks
Upon completion or failure, the swarm executor executes cleanup routines:
* Terminates background worker processes and subprocess handles.
* Deletes scratch directories and temporary SQLite / DuckDB scratchpads.
* Commits learned operational invariants into `.agents/hooks/learned-instincts/`.

---

## 3. CLI Commands

```bash
# 1. Spawn an ephemeral swarm with 3 parallel workers
everything-gemini swarm spawn "refactor auth middleware to zero-trust mTLS" --workers 3

# 2. Inspect active swarm topology and worker state
everything-gemini swarm status --json

# 3. Force teardown and reclaim all active worker resources
everything-gemini swarm reclaim --dry-run
```

---

## 4. Anti-Patterns & Safety Guardrails

| Anti-Pattern | Operational Risk | Swarm Enforced Fix |
| :--- | :--- | :--- |
| **Unbounded Worker Spawning** | Exponential token burn and process fork bomb | Hard worker ceiling (`--max-workers 8`) enforced by `budget-guard`. |
| **Shared State Collisions** | Merge conflicts and dirty git tree states | Each worker operates in an isolated temporary worktree with git rollback snapshots. |
| **Zombie Subagents** | Orphaned background processes leaking memory | Mandatory timeout watchdog (`--timeout-sec 300`) with auto-reclamation. |
| **Single-Agent Bias** | Hallucinated code passes without review | Two-agent peer verification required on all synthesized diffs. |
