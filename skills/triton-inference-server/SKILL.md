---
name: triton-inference-server
description: Deploys, configures, and tunes NVIDIA Triton Inference Server for high-throughput, low-latency multi-model serving with dynamic batching and GPU acceleration.
---

# Triton Inference Server

Provides production architecture and configuration patterns for serving deep learning and LLM models at enterprise scale with NVIDIA Triton Inference Server.

---

## 1. Architecture & Execution Model

```
 Client Application (gRPC / HTTP KServe v2)
                  │
                  ▼
┌──────────────────────────────────────────────┐
│       NVIDIA Triton Inference Server         │
│                                              │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Dynamic Batching │  │ Model Concurrency│  │
│  │ Scheduler        │  │ & GPU Instances  │  │
│  └─────────┬────────┘  └────────┬─────────┘  │
│            │                    │            │
│            ▼                    ▼            │
│  ┌────────────────────────────────────────┐  │
│  │  Backend Engines                       │  │
│  │  - TensorRT-LLM (High-speed generative)│  │
│  │  - vLLM Engine (PagedAttention serving)│  │
│  │  - ONNX Runtime (Embedding & classifier│  │
│  │  - Python Backend (Custom preprocessing│  │
│  └────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
          NVIDIA Tensor Core GPUs (H100/A100/L4)
```

---

## 2. Model Repository Layout

Triton requires a strict directory layout with versioned subdirectories and `config.pbtxt`:

```text
model_repository/
├── embedding_model/
│   ├── 1/
│   │   └── model.onnx
│   └── config.pbtxt
└── llm_generator/
    ├── 1/
    │   └── model.py
    └── config.pbtxt
```

---

## 3. High-Throughput `config.pbtxt` Configuration

Configures dynamic batching, GPU instance groups, and TensorRT acceleration:

```protobuf
name: "embedding_model"
platform: "onnxruntime_onnx"
max_batch_size: 128

input [
  {
    name: "input_ids"
    data_type: TYPE_INT64
    dims: [ -1 ]
  },
  {
    name: "attention_mask"
    data_type: TYPE_INT64
    dims: [ -1 ]
  }
]

output [
  {
    name: "sentence_embedding"
    data_type: TYPE_FP32
    dims: [ 768 ]
  }
]

# Maximize GPU utilization via dynamic queue batching
dynamic_batching {
  max_queue_delay_microseconds: 5000 # 5ms SLA window
  preferred_batch_size: [ 16, 32, 64, 128 ]
}

# Run 2 concurrent model instances on GPU 0
instance_group [
  {
    count: 2
    kind: KIND_GPU
    gpus: [ 0 ]
  }
]

optimization {
  execution_accelerators {
    gpu_execution_accelerator : [ {
      name : "tensorrt"
      parameters { key: "precision_mode" value: "FP16" }
      parameters { key: "max_workspace_size_bytes" value: "4294967296" }
    }]
  }
}
```

---

## 4. High-Performance gRPC Client (Python)

Uses binary gRPC streaming with zero-copy serialization:

```python
import numpy as np
import tritonclient.grpc as grpcclient
from tritonclient.grpc import InferInput, InferRequestedOutput

def query_triton_embeddings(
    texts_token_ids: np.ndarray,
    attention_masks: np.ndarray,
    server_url: str = "localhost:8001"
) -> np.ndarray:
    """Queries Triton via low-latency gRPC channel."""
    with grpcclient.InferenceServerClient(url=server_url) as client:
        # Check server readiness
        if not client.is_server_ready():
            raise RuntimeError("Triton server is not healthy.")

        inputs = [
            InferInput("input_ids", texts_token_ids.shape, "INT64"),
            InferInput("attention_mask", attention_masks.shape, "INT64")
        ]
        inputs[0].set_data_from_numpy(texts_token_ids)
        inputs[1].set_data_from_numpy(attention_masks)

        outputs = [InferRequestedOutput("sentence_embedding")]

        response = client.infer(
            model_name="embedding_model",
            inputs=inputs,
            outputs=outputs,
            timeout=10.0
        )

        return response.as_numpy("sentence_embedding")
```

---

## 5. Production Docker & Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: triton-inference-server
  namespace: mlops
spec:
  replicas: 2
  selector:
    matchLabels:
      app: triton
  template:
    metadata:
      labels:
        app: triton
    spec:
      containers:
        - name: triton
          image: nvcr.io/nvidia/tritonserver:24.08-py3
          args: ["tritonserver", "--model-repository=/models", "--strict-model-config=true"]
          resources:
            limits:
              nvidia.com/gpu: 1
              memory: 16Gi
              cpu: "8"
          ports:
            - containerPort: 8000 # HTTP
            - containerPort: 8001 # gRPC
            - containerPort: 8002 # Metrics (Prometheus)
          livenessProbe:
            httpGet:
              path: /v2/health/live
              port: 8000
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /v2/health/ready
              port: 8000
            initialDelaySeconds: 15
```

---

## 6. Performance Benchmarking & Profiling

```bash
# Verify health and loaded models via v2 API
curl -s http://localhost:8000/v2/health/ready
curl -s http://localhost:8000/v2/models/embedding_model/ready

# Profile throughput and P99 latency with Perf Analyzer
perf_analyzer -m embedding_model \
  -u localhost:8001 -i gRPC \
  --concurrency-range 1:16 \
  --shape input_ids:128 \
  --shape attention_mask:128 \
  --percentile 99

# Query Prometheus metrics
curl -s http://localhost:8002/metrics | grep nv_inference_
```
