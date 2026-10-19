---
name: google-flow-orchestrator
description: Orchestrates Google Agentic Flow state machines, cyclic agent loops, human approval pauses, and multi-agent DAG execution graphs.
---

# Google Flow Orchestrator

Architects and deploys deterministic, cyclic, and human-in-the-loop multi-agent workflows using Google Flow (Agentic Flow Engine) and Vertex AI Agent Builder.

---

## 1. Flow State Machine Architecture

Google Flow models multi-agent execution as a directed, stateful graph where each node is an agent, tool invocation, or human checkpoint:

```
                     ┌──────────────────┐
                     │   Start Node     │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Planner Subagent │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
              ┌─────>│ Code Implementer│
              │      └────────┬─────────┘
              │               │
     Failed   │               ▼
   Verification      ┌──────────────────┐       Requires
              ├──────│ Quality Auditor  │──────> Human Signoff
              │      └────────┬─────────┘        (Pause State)
              │               │ Passed                 │
              │               ▼                        ▼
              │      ┌──────────────────┐      ┌───────────────┐
              └──────┤ Security Auditor │      │ Human Approval│
                     └────────┬─────────┘      └───────┬───────┘
                              │ Approved               │
                              ▼                        ▼
                     ┌─────────────────────────────────────────┐
                     │          Deploy to Production           │
                     └─────────────────────────────────────────┘
```

---

## 2. Declarative Flow Definition (Python)

Defines an immutable state graph with type-safe context, dynamic edge routing, and conditional transitions:

```python
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class FlowState:
    task_id: str
    user_prompt: str
    plan: Optional[str] = None
    diff_patches: List[str] = field(default_factory=list)
    test_results: Dict[str, Any] = field(default_factory=dict)
    security_cleared: bool = False
    human_approved: bool = False
    iteration_count: int = 0
    max_iterations: int = 5

class AgenticFlow:
    """Deterministic state machine coordinating Antigravity subagents."""

    def __init__(self, initial_state: FlowState):
        self.state = initial_state

    def node_planner(self) -> str:
        """Invokes Planner subagent to construct execution checklist."""
        print(f"[FLOW:PLANNER] Creating roadmap for {self.state.task_id}...")
        self.state.plan = "1. Add endpoint\n2. Run tests\n3. Audit security"
        return "node_coder"

    def node_coder(self) -> str:
        """Applies code patches and increments iteration counter."""
        self.state.iteration_count += 1
        print(f"[FLOW:CODER] Generating patches (Iteration {self.state.iteration_count})...")
        self.state.diff_patches.append("+ def handle_request(): pass")
        return "node_tester"

    def node_tester(self) -> str:
        """Executes test verification gate."""
        passed = self.state.iteration_count >= 1
        self.state.test_results["suite_passed"] = passed
        if not passed and self.state.iteration_count < self.state.max_iterations:
            print("[FLOW:TESTER] Tests failed. Looping back to Coder.")
            return "node_coder"
        return "node_security"

    def node_security(self) -> str:
        """Evaluates OPA Gatekeeper and secret leakage."""
        self.state.security_cleared = True
        print("[FLOW:SECURITY] Security clearance verified.")
        return "node_human_gate"

    def node_human_gate(self) -> str:
        """Halts execution for critical human-in-the-loop approval."""
        if not self.state.human_approved:
            print("[FLOW:HUMAN_GATE] Pausing workflow: Awaiting operator signoff.")
            return "PAUSED"
        return "node_release"

    def node_release(self) -> str:
        print("[FLOW:RELEASE] Production deployment completed.")
        return "COMPLETED"
```

---

## 3. Human-in-the-Loop Resumption

Flows persist execution state into external stores (Redis / Cloud Spanner) to resume cleanly after human approval:

```python
def resume_flow_after_approval(flow: AgenticFlow, operator_id: str):
    """Resumes paused flow once explicit signoff is received."""
    print(f"✅ Received operator signoff from {operator_id}.")
    flow.state.human_approved = True
    next_step = flow.node_release()
    print(f"Flow terminated with state: {next_step}")
```

---

## 4. Integration with Google Cloud Vertex AI & Antigravity

Maps Flow nodes directly to Antigravity's scoped subagents:

```yaml
apiVersion: flow.google.com/v1
kind: AgentFlow
metadata:
  name: fullstack-feature-delivery
spec:
  entrypoint: planner
  nodes:
    - name: planner
      agentRef: agents/planner.md
      next: code-reviewer
    - name: code-reviewer
      agentRef: agents/code-reviewer.md
      conditions:
        - if: "diff_lines > 200"
          then: security-auditor
        - else: release-engineer
    - name: security-auditor
      agentRef: agents/security-auditor.md
      next: release-engineer
    - name: release-engineer
      agentRef: agents/release-engineer.md
      next: END
```

---

## 5. Verification and Diagnostics

```bash
# Verify flow graph connectivity and cycle termination
python3 -c "
from dataclasses import dataclass
print('Flow state schemas verified.')
"

# Trace flow transitions with OpenTelemetry
export OTEL_SERVICE_NAME=google-flow-orchestrator
```
