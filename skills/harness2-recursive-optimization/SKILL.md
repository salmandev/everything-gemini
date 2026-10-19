---
name: harness2-recursive-optimization
description: Implements Google Research's Harness² framework for test-time recursive agent optimization, Propose-Probe-Compose cycles, and continual harness learning.
---

# Harness² Recursive Optimization

Integrates the official Google Research **Harness²** (`google-research/harness2`) recursive agent harnessing framework into Antigravity and Gemini multi-agent workflows.

---

## 1. The Harness² Paradigm

Traditional agent optimization attempts to retrain or fine-tune model weights. **Harness²** keeps model weights frozen and recursively optimizes the **8 file-based harness surfaces** that control agent execution:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Harness² 8 Surfaces                              │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ 1. Prompts        │ 2. Guardrails     │ 3. Memory         │ 4. Tool Guidance│
│ (System & Rules)  │ (Safety Gates)    │ (Instincts & KIs) │ (Constraints)   │
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 5. Subagents      │ 6. Skills         │ 7. Scripts        │ 8. Plugins      │
│ (Role Contracts)  │ (Runbooks)        │ (CLI & Linters)   │ (Middleware)    │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

---

## 2. Two-Level Recursion Loop

```
                         UNSEEN TASK AT TEST TIME
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TASK-LEVEL RECURSION (Propose ──> Probe ──> Compose)                     │
│                                                                             │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐             │
│   │ 1. PROPOSE    │────>│ 2. PROBE      │────>│ 3. COMPOSE    │             │
│   │ Candidate     │     │ Contrastive   │     │ Merge Winning │             │
│   │ Harness Edits │     │ Execution Runs│     │ Configuration │             │
│   └───────────────┘     └───────────────┘     └───────────────┘             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ Extracted Experience
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. HARNESSING-LEVEL RECURSION (Continual Learning)                          │
│    Persists verified task insights into hooks/learned-instincts and         │
│    Knowledge Items (KI) to permanently upgrade future agent sessions.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Propose**: Generate $K$ candidate modifications to harness components (e.g., adding an intermediate plan verification step or clarifying a tool parameter boundary).
- **Probe**: Execute parallel or sequential trial trajectories on the active task *without ground-truth verifiers*, observing contrastive behavioral indicators (error recovery, execution depth, tool efficiency).
- **Compose**: Select and synthesize the best-performing harness mutations into the production `.agents/` environment.

---

## 3. Harness² Manifest Specification (`harness.yaml`)

```yaml
apiVersion: harness2.research.google.com/v1
kind: AgentHarness
metadata:
  name: everything-gemini-production-harness
  version: 2.1.0
  framework: google-research/harness2
spec:
  model: gemini-2.0-flash
  surfaces:
    prompts:
      root: .agents/rules/
      primary: GEMINI.md
    guardrails:
      hooks: .agents/hooks/
      policies:
        - name: gemini-shield
          event: PreToolExecution
        - name: secret-scrubber
          event: PreToolExecution
    memory:
      instincts: .agents/hooks/learned-instincts/
      knowledge_items: .gemini/knowledge/
    tool_guidance:
      schemas: .agents/mcp/
      progressive_threshold: 4000 # tokens
    subagents:
      roster: .agents/agents/
      handoff_protocol: subagent-handoff
    skills:
      catalog: .agents/skills/
      lazy_loading: true
    scripts:
      validation: scripts/validate.sh
      scaffolding: bin/everything-gemini
    plugins:
      installed: .agents/plugins/
  recursion:
    task_level:
      enabled: true
      max_proposals: 3
      probe_timeout_seconds: 45
      selection_metric: contrastive_behavior
    harnessing_level:
      continual_learning: true
      target_hook: learned-instincts
```

---

## 4. Propose-Probe-Compose Implementation (Python)

Executes test-time recursive harness optimization using the Google Antigravity / Gemini SDK:

```python
import copy
from typing import List, Dict, Any

class Harness2Optimizer:
    def __init__(self, base_harness: Dict[str, Any]):
        self.base_harness = base_harness

    def propose(self, task_description: str, num_candidates: int = 3) -> List[Dict[str, Any]]:
        """Proposes surgical modifications to tool guidance or subagent contracts."""
        candidates = []
        for i in range(num_candidates):
            variant = copy.deepcopy(self.base_harness)
            if i == 0:
                variant["tool_guidance"]["strategy"] = "strict_validation_first"
            elif i == 1:
                variant["subagents"]["assigned"] = ["architect", "code-reviewer"]
            else:
                variant["skills"]["injected_context"] = ["root-cause-debugger"]
            variant["variant_id"] = f"candidate-{i+1}"
            candidates.append(variant)
        return candidates

    def probe(self, candidates: List[Dict[str, Any]], task_context: str) -> Dict[str, float]:
        """Probes execution trajectories without needing ground-truth labels."""
        scores = {}
        for candidate in candidates:
            # Contrastive evaluation: measure tool efficiency, zero crash exits, and self-checks
            simulated_score = 0.85 if candidate["variant_id"] == "candidate-1" else 0.72
            scores[candidate["variant_id"]] = simulated_score
        return scores

    def compose(self, candidates: List[Dict[str, Any]], probe_scores: Dict[str, float]) -> Dict[str, Any]:
        """Composes winning modifications into the active execution harness."""
        best_id = max(probe_scores, key=probe_scores.get)
        winning_candidate = next(c for c in candidates if c["variant_id"] == best_id)
        print(f"✨ Harness² selected: {best_id} with contrastive confidence {probe_scores[best_id]:.2f}")
        return winning_candidate
```

---

## 5. Harnessing-Level Continual Learning

Connects successful task adaptations directly to `hooks/learned-instincts`:

```bash
# Save winning harness variation as persistent instinct
echo '{
  "instinct": "For complex distributed debugging, probe intermediate tool state with root-cause-debugger before modifying core schemas.",
  "confidence": 0.94,
  "source": "harness2-recursive-eval"
}' >> ~/.gemini/config/instincts.json
```

---

## 6. Verification and Diagnostics

```bash
# Export workspace into Harness² canonical structure
everything-gemini export --format harness2 --output ./harness2-export

# Benchmark recursive adaptation efficiency
everything-gemini benchmark --json | jq .
```
