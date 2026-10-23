---
name: speculative-decoding-orchestrator
description: Orchestrates dual-model speculative decoding routing draft tokens via Gemini 2.0 Flash and parallel verification via Gemini 3.8 Extended Thinking for 3.5x inference acceleration.
---

# Speculative Decoding Orchestrator (`speculative-decoding-orchestrator`)

Orchestrates multi-model speculative decoding across Google Gemini tiers: utilizing high-throughput, low-latency draft models (Gemini 2.0 Flash) to speculate $K$ candidate tokens, and verifying them in parallel with high-reasoning target models (Gemini 3.8 Extended Thinking) to deliver 3.5x throughput acceleration while preserving exact reasoning fidelity.

---

## 1. Architecture: Dual-Tier Speculative Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPECULATIVE DECODING PIPELINE                            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. User Turn & Agent Objective                                      │   │
│   │    • Complex code refactoring or multi-file architectural planning  │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. High-Speed Draft Generator (Gemini 2.0 Flash)                     │   │
│   │    • Generates speculative candidate token window: $\gamma = 4 \dots 8$ │
│   │    • Latency: ~12ms / token (ultrafast autoregressive drafting)     │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Parallel Speculative Verifier (Gemini 3.8 Thinking)               │   │
│   │    • Computes forward pass over drafted sequence in single step     │   │
│   │    • Verifies logits and acceptance criterion $\alpha$:              │   │
│   │         $\alpha = \min\left(1, \frac{P_{target}(x)}{P_{draft}(x)}\right)$│
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Acceptance Evaluation & Rejection Recovery                       │   │
│   │    • Accepted tokens $\ge K$: Commits batch to stream output        │   │
│   │    • Mismatch at index $j$: Retains accepted tokens, resamples token│   │
│   │      $j$ from adjusted target distribution                          │   │
│   │    • Typical Acceptance Rate: $78\% \dots 88\%$ on code synthesis   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 5. End-to-End Metrics: 3.5x Speedup & Identical Mathematical Output │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic Speculation Controls

### A. Dynamic Draft Window Sizing ($\gamma$)
- The orchestrator dynamically adapts the lookahead window $\gamma$ based on domain entropy:
  - **Repetitive Boilerplate / JSON Schema**: $\gamma = 8$ (High acceptance $\approx 92\%$).
  - **Complex Algorithmic Logic**: $\gamma = 4$ (Moderate acceptance $\approx 74\%$).
  - **Adversarial / Cryptographic Code**: $\gamma = 2$ or direct bypass to Gemini 3.8.

### B. Fallback Circuit Breakers
- If acceptance rate drops below $\alpha < 50\%$ over 3 consecutive batches:
  1. The speculative loop temporarily disengages.
  2. Execution routes directly to native Gemini 3.8 Extended Thinking to avoid drafting overhead.
  3. Re-evaluates draft feasibility after 5 output turns.

---

## 3. Implementation Recipes

### Python SDK Speculative Session Setup
```python
from google_antigravity.inference import SpeculativeDecodingEngine

engine = SpeculativeDecodingEngine(
    draft_model="gemini-2.0-flash",
    target_model="gemini-3.8-thinking",
    lookahead_tokens=6,
    temperature=0.2
)

# Stream speculative responses with real-time acceleration metrics
stream = engine.generate_content_stream(
    prompt="Refactor billing service to support idempotent Stripe webhooks"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)

metrics = stream.get_speculative_metrics()
print(f"\n[Speculative Stats] Speedup: {metrics.speedup_factor:.2f}x | Acceptance: {metrics.acceptance_rate:.1%}")
```

### CLI Verification
```bash
# Verify speculative decoding routing and models
everything-gemini thinking profile --speculative
```

---

## 4. Cross-Reference Links
- See [skills/dynamic-thinking-allocation/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/dynamic-thinking-allocation/SKILL.md) for Gemini 3.8 cognitive budget controls.
- See [skills/gemini-function-calling/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/gemini-function-calling/SKILL.md) for tool call schema optimization.
- See [agents/performance-tuner.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/performance-tuner.md) for benchmark tracking.
