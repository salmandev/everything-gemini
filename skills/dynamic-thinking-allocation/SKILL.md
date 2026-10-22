---
name: dynamic-thinking-allocation
description: Profiles cognitive task complexity and dynamically routes between low-latency Gemini Flash and Gemini 3.8 Extended Thinking reasoning budgets.
---

# Dynamic Thinking Allocation & Extended Reasoning Engine

Configures, profiles, and orchestrates dynamic "thinking token" budgets for Google Gemini 3.8 models, automatically determining the optimal cognitive depth between high-speed tool plumbing and deep architectural reasoning.

---

## 1. Architecture: Cognitive Complexity Router

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DYNAMIC THINKING ALLOCATION ROUTING MATRIX                  │
│                                                                             │
│   ┌────────────────────────┐                                                │
│   │ Incoming Agent Turn /  │                                                │
│   │ Architectural Task     │                                                │
│   └───────────┬────────────┘                                                │
│               │                                                             │
│               ▼                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Cognitive Profiler (Entropy, Dependency Depth, AST Complexity)     │   │
│   └───────────┬─────────────────────────┬───────────────────────────────┘   │
│               │                         │                                   │
│    Score < 30 │            30-70        │ Score > 70                        │
│               ▼                         ▼                                   ▼
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐ │
│   │ Level 1: FLASH       │  │ Level 2: BALANCED    │  │ Level 3: DEEP     │ │
│   │ (Thinking: 0 tokens) │  │ (Thinking: 2k-4k)    │  │ (Thinking: 8k-24k)│ │
│   │ • Tool plumbing      │  │ • Bug diagnosis      │  │ • Distributed ref │ │
│   │ • CLI invocations    │  │ • Schema validation  │  │ • Concurrency fix │ │
│   │ • Log grepping       │  │ • Test authoring     │  │ • Cryptography    │ │
│   └──────────────────────┘  └──────────────────────┘  └───────────────────┘ │
│               │                         │                         │         │
│               └─────────────────────────┼─────────────────────────┘         │
│                                         ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Model API Execution (Google GenAI SDK / Antigravity Engine)         │   │
│   │ • `config.thinking_config = {"thinking_budget": targetTokens}`      │   │
│   │ • Pre-allocated spend caps monitored via `budget-guard`             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic Thinking Budget Allocation Rules

| Cognitive Tier | Target Complexity | Thinking Token Budget | Model Target | Primary Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| **Flash / None** | AST depth $\le 2$, single file edit | `0` (Off) | Gemini 2.0 Flash | Mechanical formatting, directory listing, shell command dispatch, docstring typo fixes. |
| **Balanced** | Moderate AST refactor, multi-file unit tests | `2,048` - `4,096` | Gemini 2.5 Pro / Flash | Function signature refactor, API endpoint mocking, data model migration, SQL query optimization. |
| **Deep Reasoning** | Distributed race conditions, consensus protocols | `8,192` - `16,384` | Gemini 3.8 Thinking | Concurrency bug root-cause analysis, consensus algorithms, eBPF filter generation, memory leak tracing. |
| **Exhaustive Frontier** | Novel cryptographic implementations, OS kernels | `24,576` (Max) | Gemini 3.8 Thinking (Max) | Post-quantum cryptographic migration, compiler backend optimization, distributed deadlock resolution. |

---

## 3. Implementation with Google GenAI SDK

```python
from google import genai
from google.genai import types

def configure_thinking_session(task_complexity_score: float, client: genai.Client) -> genai.Chat:
    """Configures dynamic thinking token budget based on task entropy."""
    if task_complexity_score > 0.8:
        # Deep architectural reasoning
        model_name = "gemini-3.8-thinking"
        thinking_budget = 16384
    elif task_complexity_score > 0.4:
        # Balanced analytical tasks
        model_name = "gemini-2.5-pro"
        thinking_budget = 4096
    else:
        # Low-latency tool plumbing
        model_name = "gemini-2.0-flash"
        thinking_budget = 0

    config = types.GenerateContentConfig(
        temperature=0.2 if thinking_budget > 0 else 0.7,
        thinking_config=types.ThinkingConfig(
            thinking_budget=thinking_budget
        ) if thinking_budget > 0 else None,
    )

    return client.chats.create(model=model_name, config=config)
```

---

## 4. CLI Inspection & Profiling

```bash
# 1. Profile a task's cognitive complexity and recommend thinking budget
everything-gemini thinking profile "Resolve distributed Spanner deadlock across 3 microservices"

# 2. Benchmark thinking token expenditure in dry-run mode
everything-gemini thinking budget --level deep --dry-run

# 3. Output structured thinking allocation matrix
everything-gemini thinking --json
```
