# Python SDK Multi-Agent Orchestration

This example demonstrates how to build programmatic agent pipelines using the official **Google Antigravity Python SDK (`google-antigravity`)** paired with **Everything Gemini (`everything-gemini`)** subagent specifications.

---

## 🚀 Quickstart

### 1. Install SDK
```bash
pip install google-antigravity
```

### 2. Run the Multi-Agent Pipeline
```bash
python3 orchestrate_subagents.py
```

---

## 🧠 Architectural Flow

```text
┌─────────────────────────┐
│ 1. Strategic Planner    │
│    (Read-only, Roadmap) │
└────────────┬────────────┘
             │ (Structured Plan Handoff)
             ▼
┌─────────────────────────┐
│ 2. Code Reviewer        │
│    (Edge Cases & Risks) │
└─────────────────────────┘
```

The pipeline leverages Antigravity's async context manager to guarantee clean sandbox lifecycle deallocation and streaming thought token deltas.
