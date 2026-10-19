# Python SDK Multi-Agent Orchestration

This example demonstrates how to build programmatic agent pipelines using the official **Google Antigravity Python SDK (`google-antigravity`)** paired with **Everything Gemini (`everything-gemini`)** subagent specifications.

---

## 🚀 Quickstart

### 1. Install SDK
```bash
pip install google-antigravity
```

### 2. Available Pipelines
- **Basic Subagent Orchestration**:
  ```bash
  python3 orchestrate_subagents.py
  ```
- **4-Stage Feature Delivery Pipeline** (Planner -> Migrator -> Tuner -> Reviewer):
  ```bash
  python3 multi_agent_pipeline.py
  ```
- **3-Stage Documentation Audit Pipeline** (Architect -> Reviewer -> Doc Writer):
  ```bash
  python3 documentation_audit_pipeline.py
  ```
- **4-Stage Release Readiness Audit Pipeline** (Planner -> Reviewer -> Security Auditor -> Release Engineer):
  ```bash
  python3 release_readiness_audit.py
  ```
- **4-Stage Incident Triage & SRE Remediation Pipeline** (Incident Responder -> Performance Tuner -> Release Engineer -> Postmortem Generator):
  ```bash
  python3 incident_triage_pipeline.py
  ```
- **4-Stage Cloud Platform Provisioning Pipeline** (Architect -> Platform Engineer -> Security Auditor -> Release Engineer):
  ```bash
  python3 platform_provisioning_pipeline.py
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
└────────────┬────────────┘
             │ (Verified Implementation)
             ▼
┌─────────────────────────┐
│ 3. Documentation Writer │
│    (file:// Link Audit) │
└─────────────────────────┘
```

The pipelines leverage Antigravity's async context manager to guarantee clean sandbox lifecycle deallocation and streaming thought token deltas.
