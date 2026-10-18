---
name: langgraph-orchestrator
description: >-
  Designs and implements stateful multi-agent systems, cyclic graphs, persistent checkpoints, human-in-the-loop pauses, and streaming orchestration using LangGraph (Python/TypeScript).
---

# LangGraph Multi-Agent Orchestration & Stateful Graphs

This skill guides the design, construction, and deployment of complex multi-agent architectures using LangGraph. It provides deterministic patterns for cyclic routing, persistent graph checkpointing, and human-in-the-loop (HITL) approval gates.

---

## ⚡ Core Concepts

1. **State Graph (`StateGraph`)**: Typed dictionary or Pydantic state passed through graph nodes.
2. **Nodes**: Discrete execution functions that receive current state and return state updates.
3. **Edges & Conditional Edges**: Transition rules between nodes (deterministic or LLM-routed).
4. **Checkpointers (`BaseCheckpointSaver`)**: Persists graph state across turns and enables time-travel debugging.
5. **Human-in-the-Loop (`interrupt_before`)**: Pauses execution graph at critical checkpoints for human intervention.

---

## 🏗️ Production Implementation (Python)

### 1. State Definition & Reducers (`state.py`)

Define immutable state schemas with explicit reducer operators:

```python
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # add_messages reducer appends new messages rather than overwriting
    messages: Annotated[Sequence[BaseMessage], add_messages]
    sender: str
    iteration_count: int
    is_approved: bool
    context_data: dict
```

---

### 2. Multi-Agent Nodes & Graph Assembly (`graph.py`)

```python
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, HumanMessage

def researcher_node(state: AgentState) -> dict:
    """Researches user inquiry and extracts factual grounding."""
    # LLM invocation logic here
    result = "Research findings: latency reduced by 40% via caching."
    return {
        "messages": [AIMessage(content=result, name="researcher")],
        "sender": "researcher",
        "iteration_count": state.get("iteration_count", 0) + 1,
    }

def reviewer_node(state: AgentState) -> dict:
    """Validates research quality and enforces compliance."""
    last_msg = state["messages"][-1].content
    approved = "latency" in last_msg.lower()
    return {
        "messages": [AIMessage(content="Review complete.", name="reviewer")],
        "sender": "reviewer",
        "is_approved": approved,
    }

def human_approval_node(state: AgentState) -> dict:
    """Node executed after human approval gate."""
    return {"messages": [AIMessage(content="Action executed after sign-off.", name="human_gate")]}

def router_condition(state: AgentState) -> str:
    """Evaluate whether to loop or terminate."""
    if state.get("is_approved", False):
        return "human_approval"
    if state.get("iteration_count", 0) >= 3:
        return "abort"
    return "researcher"

# Build State Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("researcher", researcher_node)
workflow.add_node("reviewer", reviewer_node)
workflow.add_node("human_approval", human_approval_node)

# Add Edges
workflow.add_edge(START, "researcher")
workflow.add_edge("researcher", "reviewer")
workflow.add_conditional_edges(
    "reviewer",
    router_condition,
    {
        "human_approval": "human_approval",
        "researcher": "researcher",
        "abort": END,
    }
)
workflow.add_edge("human_approval", END)

# Compile with Persistent Checkpointer and Human-in-the-Loop Interruption
checkpointer = MemorySaver()
app = workflow.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_approval"]
)
```

---

### 3. Execution & Human-in-the-Loop Resumption

```python
thread_config = {"configurable": {"thread_id": "session-prod-1024"}}

# Run until human interrupt
inputs = {"messages": [HumanMessage(content="Optimize database latency.")], "iteration_count": 0}
for event in app.stream(inputs, config=thread_config):
    print(f"Step: {event}")

# Inspect current snapshot before approval
snapshot = app.get_state(thread_config)
print(f"Next Node Pending Approval: {snapshot.next}")

# Resume graph after human confirmation
for event in app.stream(None, config=thread_config):
    print(f"Post-approval Step: {event}")
```

---

## 🛡️ Best Practices & Anti-Patterns

| Category | ❌ Anti-Pattern | ✅ Production Best Practice |
| :--- | :--- | :--- |
| **State Mutation** | Modifying state objects in-place | Return clean partial state dictionaries with reducer keys |
| **Cycles** | Unbounded recursive loops | Enforce explicit `iteration_count` or recursion limit (`recursion_limit=25`) |
| **Checkpoints** | Storing giant binary blobs in state | Keep state lean; persist media in object stores (GCS/S3) and store URIs |
| **HITL** | Hardcoded polling loops | Use native `interrupt_before` / `interrupt_after` with thread configurations |
