---
name: litellm-proxy-gateway
description: >-
  Enterprise LLM proxy gateway architecture using LiteLLM, multi-provider routing (Gemini, Claude, OpenAI, vLLM), virtual keys, budget tracking, fallback cascading, and rate-limiting. Use when centralizing LLM API access, managing cost quotas, or implementing resilient failover strategies.
---

# LiteLLM Proxy Gateway Architecture

A production runbook for centralizing, securing, and load-balancing LLM inference across multi-provider deployments (Google Gemini, Anthropic, OpenAI, local vLLM) using **LiteLLM Proxy**.

---

## 🎯 Architectural Principles

1. **Unified API Gateway**: Exposes a standard OpenAI-compatible API (`/v1/chat/completions`, `/v1/embeddings`) for 100+ LLM providers.
2. **Resilient Fallback Cascades**: Automatically catches rate limits (`429`) or provider outages (`5xx`) and retries the prompt on configured fallback models.
3. **Budget Controls & Virtual Keys**: Issues team-specific API keys with enforce-able spending caps, RPM/TPM rate limits, and model access whitelists.
4. **Token Usage & Cost Attribution**: Centralizes Prometheus metrics, OTEL telemetry, and audit logs per team, project, or key.

---

## 🚀 Gateway Configuration (`config.yaml`)

```yaml
model_list:
  # Primary: Gemini 2.5 Flash
  - model_name: production-fast
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: "os.environ/GEMINI_API_KEY"
      rpm: 1000
      tpm: 1000000

  # Fallback: OpenAI GPT-4o-mini
  - model_name: production-fast-fallback
    litellm_params:
      model: gpt-4o-mini
      api_key: "os.environ/OPENAI_API_KEY"
      rpm: 500

  # High-Reasoning: Gemini 2.5 Pro with Claude 3.5 Sonnet Fallback
  - model_name: high-reasoning
    litellm_params:
      model: gemini/gemini-2.5-pro
      api_key: "os.environ/GEMINI_API_KEY"

  - model_name: high-reasoning-fallback
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: "os.environ/ANTHROPIC_API_KEY"

router_settings:
  routing_strategy: "latency-based-routing" # options: simple-shuffle, least-busy, latency-based-routing
  redis_host: "redis.internal"
  redis_port: 6379
  redis_password: "os.environ/REDIS_PASSWORD"
  num_retries: 3
  timeout: 45
  fallbacks:
    - production-fast: ["production-fast-fallback"]
    - high-reasoning: ["high-reasoning-fallback"]

general_settings:
  master_key: "os.environ/LITELLM_MASTER_KEY"
  database_url: "os.environ/DATABASE_URL" # PostgreSQL for virtual keys & spend logs
```

---

## 🐳 Docker Production Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    volumes:
      - ./config.yaml:/app/config.yaml
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - DATABASE_URL=postgresql://litellm:${DB_PASS}@postgres:5432/litellm_db
    command: ["--config", "/app/config.yaml", "--port", "4000", "--workers", "4"]
```

---

## 🔑 Virtual Key Management (cURL / REST API)

Generate isolated, budget-constrained virtual keys for distinct microservices or teams:

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-master-key-xyz' \
  -H 'Content-Type: application/json' \
  -d '{
    "models": ["production-fast", "high-reasoning"],
    "max_budget": 500.0,
    "budget_duration": "30d",
    "rpm_limit": 120,
    "metadata": {
      "team": "analytics-agents",
      "environment": "production"
    }
  }'
```

---

## 💻 Client Invocation (Python / OpenAI SDK)

Applications interact with LiteLLM identically to native OpenAI endpoints:

```python
from openai import OpenAI

# Connect to internal LiteLLM Proxy Gateway
client = OpenAI(
    base_url="http://localhost:4000/v1",
    api_key="sk-team-analytics-virtual-key",
)

response = client.chat.completions.create(
    model="production-fast", # Automatically routes to Gemini 2.5 Flash, falls back to GPT-4o-mini
    messages=[
        {"role": "system", "content": "You are a cloud infrastructure specialist."},
        {"role": "user", "content": "Explain eBPF socket redirection performance."}
    ],
    temperature=0.3,
)

print(response.choices[0].message.content)
```

---

## 🛡️ Production Health & Monitoring

1. **Check Gateway Health**:
   ```bash
   curl http://localhost:4000/health
   ```
2. **Prometheus Metrics**:
   - `litellm_deployment_latency_per_output_token`: Model latency breakdowns.
   - `litellm_deployment_spend`: Real-time cumulative spend per model and key.
   - `litellm_proxy_failed_requests`: Rate of fallback activations.
3. **Automatic Circuit Breaking**:
   - If a provider triggers 5 consecutive `500` or `503` errors, the router pauses traffic to that upstream for 60 seconds.
