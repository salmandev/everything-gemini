---
name: vllm-inference
description: >-
  High-throughput LLM serving and inference optimization using vLLM, PagedAttention memory management, continuous batching, tensor parallelism, and OpenAI-compatible API architecture. Use when deploying open-weights models, optimizing GPU KV caches, scaling Ray clusters, or tuning inference throughput.
---

# vLLM Inference & Serving Architecture

A comprehensive runbook for deploying, tuning, and operating enterprise LLM inference infrastructure using **vLLM**, PagedAttention, and distributed GPU clusters.

---

## 🎯 Architectural Principles

1. **PagedAttention**: Near-zero memory waste by allocating KV cache in non-contiguous physical blocks (virtual memory paging for LLMs).
2. **Continuous (Iteration-Level) Batching**: Requests join and exit the running batch dynamically at token generation boundaries rather than waiting for sequence completion.
3. **Tensor & Pipeline Parallelism**: Seamless multi-GPU sharding using Megatron-LM style tensor parallelism across NVLink or distributed Ray nodes.
4. **OpenAI Protocol Parity**: Fully compliant Drop-in replacement for Chat Completions, Completions, and Embedding endpoints.

---

## 🚀 Quickstart: Production Deployment

### 1. Standalone Docker Container Deployment

```bash
docker run --gpus all \
  --shm-size 10.24gb \
  -p 8000:8000 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  --ipc=host \
  vllm/vllm-openai:latest \
  --model Qwen/Qwen2.5-72B-Instruct-AWQ \
  --tensor-parallel-size 4 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.92 \
  --kv-cache-dtype auto \
  --enable-chunked-prefill \
  --max-num-seqs 256
```

### 2. High-Performance Configuration Matrix

| Parameter | Recommended Setting | Architectural Rationale |
| :--- | :--- | :--- |
| `--gpu-memory-utilization` | `0.90` - `0.95` | Leaves ~5-10% GPU VRAM for CUDA context and PyTorch allocator overhead. |
| `--tensor-parallel-size` | Matches socket count (2, 4, 8) | Shards attention heads evenly across NVLink interconnects. |
| `--enable-chunked-prefill` | `true` | Prevents long prompt prefill passes from blocking decode iterations of active requests. |
| `--max-num-batched-tokens` | `4096` - `8192` | Balances prefill compute intensity with KV cache allocation throughput. |
| `--kv-cache-dtype` | `fp8` / `auto` | Halves KV memory consumption on Ada/Hopper architectures (H100/L40S). |

---

## 🛠️ Python SDK Integration

Interact with vLLM via either offline batch processing or the OpenAI client.

### Pattern A: Offline High-Throughput Batch Processing

```python
from vllm import LLM, SamplingParams

# Configure model engine with tensor parallelism
llm = LLM(
    model="mistralai/Mistral-7B-Instruct-v0.3",
    tensor_parallel_size=2,
    gpu_memory_utilization=0.90,
    max_model_len=16384,
    trust_remote_code=True,
)

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=1024,
    presence_penalty=0.1,
)

prompts = [
    "Analyze the following architectural bottleneck: ...",
    "Generate a Terraform module for Cilium eBPF on GKE: ...",
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Generated {len(output.outputs[0].token_ids)} tokens.")
```

### Pattern B: Async OpenAI Client Integration

```python
from openai import AsyncOpenAI
import asyncio

client = AsyncOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="token-internal-vllm",
)

async def stream_generation(prompt: str):
    response = await client.chat.completions.create(
        model="Qwen/Qwen2.5-72B-Instruct-AWQ",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        stream=True,
    )
    async for chunk in response:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)

asyncio.run(stream_generation("Summarize the benefits of continuous batching."))
```

---

## 📈 Prometheus Observability & Metrics

vLLM exposes Prometheus metrics on `/metrics`:

```text
# Cache usage metrics
vllm:gpu_cache_usage_factor        # Active KV cache allocation (target: < 0.85)
vllm:num_requests_waiting          # Requests queued in prefill backlog (target: 0)
vllm:num_requests_running          # Concurrently decoding requests
vllm:time_to_first_token_seconds   # TTFT distribution histogram
vllm:time_per_output_token_seconds # Inter-token generation latency (target: < 25ms)
```

---

## 🛡️ Common Failure Modes & Mitigations

1. **CUDA Out of Memory (OOM) during Startup**:
   - *Cause*: Model weights + KV cache exceeds total VRAM.
   - *Fix*: Reduce `--gpu-memory-utilization` from 0.95 to 0.88, or enforce AWQ/GPTQ 4-bit quantization.
2. **Request Preemption Storms**:
   - *Cause*: KV cache saturates (`gpu_cache_usage_factor = 1.0`), forcing vLLM to swap sequences to CPU memory.
   - *Fix*: Reduce `--max-num-seqs` or enable `--kv-cache-dtype fp8` to double cache capacity.
3. **TTFT Spikes on Long Contexts**:
   - *Cause*: Large prompt prefills starving active decode steps.
   - *Fix*: Pass `--enable-chunked-prefill` and `--max-num-batched-tokens 2048`.
