# Google AX (Agent Executor) Cluster Deployment Blueprint

This directory demonstrates how to deploy an autonomous agent into a Kubernetes cluster using **[Google AX (`google/ax`)](https://github.com/google/ax)** and **Agent Substrate**, pre-wiring **`everything-gemini`** behavioral rules alongside the official **`google/skills`** catalog.

---

## 1. Prerequisites

1. Kubernetes cluster with **Agent Substrate** deployed (`ate-system` namespace):
   ```bash
   kubectl get svc api -n ate-system
   ```
2. The `ax` CLI installed:
   ```bash
   go install github.com/google/ax/cmd/ax@latest
   ```
3. A Kubernetes secret containing your Gemini API key:
   ```bash
   kubectl create secret generic gemini-api-credentials \
     --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY"
   ```

---

## 2. Manifest Architecture

- [`workspace.yaml`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/workspace.yaml): Clones target repo, injects `AGENTS.md` and `GEMINI.md`, and mounts the `google/skills` registry.
- [`gateway.yaml`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/gateway.yaml): Restricts outbound network traffic strictly to Gemini API endpoints, GitHub, and package registries.
- [`model.yaml`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/model.yaml): Configures `gemini-3.8-flash` provider settings referencing the cluster secret.
- [`task.yaml`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/task.yaml): Defines CPU/memory limits, binds the Workspace/Gateway/Model, and enables `debug: true`.
- [`bundle.yaml`](file:///Users/salmanshaikh/development/github/everything-gemini/examples/ax/bundle.yaml): All-in-one multi-document manifest.

---

## 3. Deployment & Operational Commands

```bash
# Apply all manifests to the cluster
ax apply -f .

# Inspect the task phase and execution state
ax describe task cloud-triage-agent

# Stream live agent logs
ax logs -f cloud-triage-agent

# Live shell into the agent sandbox
ax ssh cloud-triage-agent -- ls -la /workspace

# Suspend task when waiting for human input (frees CPU/RAM)
ax suspend cloud-triage-agent

# Resume task instantly from snapshot
ax resume cloud-triage-agent
```

---

## 4. Synthesizing Custom Manifests with CLI

You can generate custom AX manifests for any project using the `everything-gemini` CLI:

```bash
everything-gemini ax init \
  --output ax-deploy/ \
  --name my-feature-agent \
  --repo https://github.com/my-org/my-app.git \
  --branch main \
  --model gemini-3.8-flash
```
