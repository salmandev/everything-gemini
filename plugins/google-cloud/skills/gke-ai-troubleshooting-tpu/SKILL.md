---
name: gke-ai-troubleshooting-tpu
description: Diagnoses and resolves TPU multi-slice hangs, network degradations, MXLA deadlocks, and pod scheduling bottlenecks on Google Kubernetes Engine (GKE).
---

# GKE AI/ML TPU Multi-Slice Troubleshooting

Diagnoses, isolates, and resolves training job hangs, interconnect deadlocks, and pod scheduling failures on Google Kubernetes Engine (GKE) clusters using Cloud TPU v4, v5e, and v5p multi-slice topology. Covers the MXLA Hang Analyzer, NCCL/ICI packet loss diagnostics, and automated remediation.

---

## 1. Diagnostic Architecture: GKE TPU Multi-Slice Jobs

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     GKE TPU Multi-Slice Cluster Topology                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Slice 0 (NodePool tpu-v5e-slice-0)            Slice 1 (NodePool tpu-v5e-slice-1)│
│   ┌────────────────────────────────┐            ┌────────────────────────────────┐│
│   │ Host 0: TPU VM (ICI Torus Mesh)│            │ Host 0: TPU VM (ICI Torus Mesh)││
│   │ Pod: worker-0                  │            │ Pod: worker-0                  ││
│   └────────────────────────────────┘            └────────────────────────────────┘│
│                  ▲                                             ▲                  │
│                  │                                             │                  │
│                  └─────────── DCN (Data Center Network) ───────┘                  │
│                                       │                                           │
│                                       ▼                                           │
│   Diagnostic Signals:                                                             │
│   • ICI Link Health & Uncorrectable CRC Errors                                    │
│   • MXLA Barrier Timeouts (Collective Rendezvous Deadlocks)                       │
│   • Straggler Nodes & Thermal Throttling                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fast-Triage Diagnostic Checklist

When a multi-slice TPU training job stalls or stops emitting step progress:

```bash
# 1. Inspect Pod Statuses across all slices
kubectl get pods -l job-name=tpu-training-job -o wide

# 2. Check for MXLA or Megascale barrier timeouts in driver logs
kubectl logs -l job-name=tpu-training-job -c trainer --tail=200 | grep -iE "barrier|timeout|rendezvous|deadlock"

# 3. Inspect Node Events for TPU hardware faults or preemptions
kubectl get events --field-selector reason=FailedScheduling --sort-by='.lastTimestamp'
```

---

## 3. MXLA Hang Analyzer Integration

Configure the MXLA Hang Analyzer sidecar to detect collective communication deadlocks in real-time:

```yaml
# tpu-job-manifest.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: tpu-multislice-training
spec:
  template:
    spec:
      containers:
        - name: trainer
          image: "gcr.io/my-org/jax-trainer:latest"
          resources:
            limits:
              google.com/tpu: 8
          env:
            - name: TPU_CHIPS_PER_HOST_BOUNDS
              value: "2,2,1"
            - name: TPU_HOST_BOUNDS
              value: "1,1,1"
            - name: JAX_COORDINATOR_ADDRESS
              value: "tpu-coordinator.default.svc.cluster.local:1234"
        
        # MXLA Diagnostics Sidecar
        - name: mxla-hang-analyzer
          image: "gcr.io/google-samples/mxla-analyzer:v1.2"
          env:
            - name: LOG_DIR
              value: "/tmp/mxla_logs"
            - name: HANG_TIMEOUT_SECONDS
              value: "300"
```

---

## 4. Common TPU Multi-Slice Failure Modes & Remediation

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Step 0 Hang during initialization** | JAX/PyTorch coordinator network unreachable across slices. | Verify Headless Service DNS resolves across slices; open port 1234 in Kubernetes NetworkPolicy. |
| **Sudden stall at Step N (No crash)** | ICI Torus link drop or uncorrectable hardware error on a single chip. | Inspect `kubectl describe node <node-name> \| grep tpu` for hardware error status. Cordon node and recreate slice. |
| **AllReduce collective timeout** | Straggler host delayed by slow Cloud Storage I/O or checkpointing write. | Decouple checkpoint writes using asynchronous background threads; verify Cloud Storage FUSE read cache. |
| **`RESOURCE_EXHAUSTED: TPU not available`** | Fragmented TPU topology unable to satisfy rectangular mesh request. | Provision GKE TPU Queued Resources (`kubectl apply -f queuedresource.yaml`) to ensure atomic slice scheduling. |
