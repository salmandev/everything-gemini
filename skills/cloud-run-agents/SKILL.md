---
name: cloud-run-agents
description: Packages, deploys, and scales autonomous Antigravity and Gemini agents on Google Cloud Run services and Cloud Run Jobs with Eventarc triggers and GPU scheduling.
---

# Cloud Run Autonomous Agents

Packages, containerizes, and deploys autonomous Google Antigravity & Gemini agents on Google Cloud Run. Covers HTTP agent services, batch-oriented Cloud Run Jobs for recursive Harness² probing, Eventarc event triggers, and NVIDIA L4 GPU acceleration.

---

## 1. Architecture: Cloud Run Agent Execution Models

```
                                Google Cloud Run
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CLOUD RUN SERVICE (Interactive / Webhook Agents)                         │
│    • Real-time Gemini Live WebSocket / HTTP streaming                        │
│    • Automatic scale-to-zero when idle                                      │
│    • Up to 60-minute request timeout with WebSockets enabled                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CLOUD RUN JOBS (Batch / Recursive Probing Agents)                         │
│    • Long-running Harness² Propose-Probe-Compose workflows (up to 24 hours) │
│    • Parallel array task execution for multi-candidate testing              │
│    • Zero HTTP gateway overhead; triggered via Cloud Scheduler / Workflows │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. CLOUD RUN WITH GPU (NVIDIA L4 / T4)                                      │
│    • Co-locates agent logic with local verification models (vLLM / Triton)   │
│    • Direct hardware acceleration for code analysis & AST parsing           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Agent Container Specification (Dockerfile)

Production multi-stage Dockerfile bundling the agent runtime, Node CLI, and Python SDK:

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8080

WORKDIR /app

# Install system dependencies & Node.js for CLI tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install everything-gemini CLI globally
RUN npm install -g everything-gemini

# Copy Python requirements & install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent definitions and source code
COPY . .

# Run as non-root user for enterprise container security
RUN useradd -m -u 10001 agentuser && chown -R agentuser:agentuser /app
USER 10001

EXPOSE 8080
ENTRYPOINT ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## 3. Cloud Run Service Deployment (`gcloud`)

Deploy an interactive agent service with Workload Identity and automated secret injection:

```bash
gcloud run deploy antigravity-agent-service \
  --image="gcr.io/my_project/antigravity-agent:v2.2.0" \
  --region="us-central1" \
  --platform="managed" \
  --service-account="agent-runner@my_project.iam.gserviceaccount.com" \
  --cpu=4 \
  --memory=8Gi \
  --concurrency=10 \
  --timeout=3600 \
  --min-instances=0 \
  --max-instances=20 \
  --set-env-vars="GEMINI_MODEL=gemini-2.0-flash,MAX_USD_BUDGET=15.00" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --vpc-egress=private-ranges-only \
  --ingress=internal-and-cloud-load-balancing
```

---

## 4. Cloud Run Jobs for Harness² Recursive Probing

When running test-time recursive optimization (Propose-Probe-Compose) that exceeds standard HTTP request limits, package the run into a Cloud Run Job:

```bash
# 1. Create Cloud Run Job with 3 parallel task instances
gcloud run jobs create harness2-probe-runner \
  --image="gcr.io/my_project/harness2-runner:v2.2.0" \
  --region="us-central1" \
  --tasks=3 \
  --max-retries=1 \
  --task-timeout=7200s \
  --cpu=8 \
  --memory=16Gi \
  --command="everything-gemini" \
  --args="harness2,run,--bench,local,--max-usd,25,--snapshot,--json"

# 2. Trigger asynchronous execution of the probe job
gcloud run jobs execute harness2-probe-runner --region="us-central1" --wait
```

---

## 5. Eventarc Trigger Binding (Event-Driven Agent Workflow)

Automatically invoke agents whenever new code repositories or error traces land in Cloud Storage:

```bash
gcloud eventarc triggers create trace-ingestion-trigger \
  --location="us-central1" \
  --destination-run-service="antigravity-agent-service" \
  --destination-run-region="us-central1" \
  --destination-run-path="/webhooks/trace-ingest" \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=production-failure-traces" \
  --service-account="eventarc-invoker@my_project.iam.gserviceaccount.com"
```

---

## 6. NVIDIA L4 GPU Configuration

Accelerate on-container verification models or local embedding calculations:

```bash
gcloud beta run deploy local-verifier-agent \
  --image="gcr.io/my_project/verifier-agent-l4:latest" \
  --region="us-central1" \
  --cpu=8 \
  --memory=32Gi \
  --gpu=1 \
  --gpu-type=nvidia-l4 \
  --no-cpu-throttling \
  --timeout=1800
```

---

## 7. Enterprise Production Checklist

| Category | Requirement | Verification Method |
| :--- | :--- | :--- |
| **IAM Security** | Dedicated service account with least-privilege Vertex AI roles | `roles/aiplatform.user` only; no Owner/Editor permissions |
| **Secret Management** | Mount API keys directly from Google Secret Manager | Use `--set-secrets`; never bake keys into Docker layers |
| **Budget Enforcement** | Enforce `--set-env-vars="MAX_USD_BUDGET=..."` bound to `budget-guard` | Verification in PreToolUse hook |
| **Graceful Shutdown** | Handle `SIGTERM` within 10s to flush ephemeral logs to Cloud Storage | Python `signal.signal(signal.SIGTERM, handler)` |
