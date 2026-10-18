---
name: argo-workflows
description: >-
  Architects, defines, and executes Kubernetes-native DAG workflows, artifact passing, container steps, retry strategies, and CronWorkflows using Argo Workflows.
---

# Argo Workflows & Kubernetes-Native DAG Orchestration

This skill provides operational patterns for designing, testing, and deploying Kubernetes-native workflow orchestration via Argo Workflows, powering parallel data pipelines, machine learning training graphs, and automated batch processing.

---

## ⚡ Core Architecture & CRDs

1. **`Workflow`**: Ephemeral, single-run execution specification.
2. **`WorkflowTemplate`**: Reusable workflow definitions stored inside the Kubernetes cluster.
3. **`CronWorkflow`**: Time-triggered recurring workflows (cron schedule).
4. **DAGs vs Steps**: DAGs declare declarative dependency graphs (`dependencies: [taskA, taskB]`), whereas Steps declare sequential matrix execution.
5. **Artifacts**: Input/output binary blobs, model weights, and logs backed by S3, GCS, or MinIO.

---

## 🏗️ Production DAG Workflow Specification (`workflow-dag.yaml`)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ml-pipeline-dag-
  namespace: argo
spec:
  entrypoint: ml-pipeline
  serviceAccountName: argo-workflow-executor
  shutdown: "Stop" # Graceful termination support
  onExit: pipeline-cleanup-handler

  templates:
    - name: ml-pipeline
      dag:
        tasks:
          - name: ingest-data
            template: data-ingestion-step
            arguments:
              parameters:
                - name: dataset-version
                  value: "v2026.10"

          - name: validate-schema
            dependencies: [ingest-data]
            template: schema-validator-step
            arguments:
              artifacts:
                - name: raw-dataset
                  from: "{{tasks.ingest-data.outputs.artifacts.dataset}}"

          - name: train-model
            dependencies: [validate-schema]
            template: model-training-step
            arguments:
              artifacts:
                - name: validated-data
                  from: "{{tasks.validate-schema.outputs.artifacts.clean-dataset}}"

    - name: data-ingestion-step
      inputs:
        parameters:
          - name: dataset-version
      container:
        image: python:3.11-slim
        command: [python, -c]
        args: ["import json; open('/tmp/dataset.csv', 'w').write('id,score\\n1,0.95\\n')"]
      outputs:
        artifacts:
          - name: dataset
            path: /tmp/dataset.csv

    - name: schema-validator-step
      inputs:
        artifacts:
          - name: raw-dataset
            path: /inputs/dataset.csv
      container:
        image: python:3.11-slim
        command: [python, -c]
        args: ["import shutil; shutil.copy('/inputs/dataset.csv', '/outputs/clean.csv')"]
      outputs:
        artifacts:
          - name: clean-dataset
            path: /outputs/clean.csv

    - name: model-training-step
      inputs:
        artifacts:
          - name: validated-data
            path: /data/clean.csv
      retryStrategy:
        limit: "3"
        retryPolicy: "Always"
        backoff:
          duration: "10s"
          factor: 2
      container:
        image: python:3.11-slim
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
        command: [python, -c]
        args: ["print('Model trained successfully')"]

    - name: pipeline-cleanup-handler
      container:
        image: alpine:latest
        command: [sh, -c]
        args: ["echo Pipeline finished with status: {{workflow.status}}"]
```

---

## 🛠️ CLI Operations & Debugging Runbook

```bash
# Submit a workflow and follow real-time execution
argo submit --watch workflow-dag.yaml -n argo

# List active and completed workflows
argo list -n argo

# Stream logs of a specific DAG task step
argo logs @latest -c main -n argo

# Resubmit a failed workflow with memoized step caching
argo resubmit --memoized @latest -n argo

# Terminate or suspend a runaway workflow
argo terminate @latest -n argo
```

---

## 🛡️ Best Practices & Anti-Patterns

| Category | ❌ Anti-Pattern | ✅ Production Best Practice |
| :--- | :--- | :--- |
| **Artifacts** | Storing giant datasets directly inside pod disk | Use external artifact repositories (S3 / GCS) with lifecycle policies |
| **Retries** | Unbounded retries without exponential backoff | Set explicit `retryStrategy.limit` and exponential `backoff.factor` |
| **Resources** | Omitting CPU/Memory resource constraints | Always specify `requests` and `limits` to prevent node OOM crashes |
| **Secrets** | Hardcoding API keys or database URLs in YAML | Reference Kubernetes Secrets via `env.valueFrom.secretKeyRef` |
