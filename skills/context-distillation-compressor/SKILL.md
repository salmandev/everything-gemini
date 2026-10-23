---
name: context-distillation-compressor
description: Performs AST-guided semantic context distillation, lossy-to-lossless prompt compaction, and memory pruning to prevent context bloat and token degradation in long agent trajectories.
---

# Context Distillation & Semantic Compaction (`context-distillation-compressor`)

Mitigates token pressure, context dilution, and attention degradation in long multi-turn Gemini 3.8 and Antigravity sessions through AST-guided semantic distillation, idempotent tool-call deduplication, lossless structured compression, and active context compaction.

---

## 1. Architectural Pipeline: Dual-Tier Context Compaction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CONTEXT DISTILLATION & COMPACTION PIPELINE                  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Active Turn Monitoring & Token Pressure Sensor                   │   │
│   │    • Trajectory token count: $T_{current} / T_{max}$                │   │
│   │    • Trigger Threshold: Alert at $70\%$, Auto-Compaction at $85\%$   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Semantic Distillation Engine                                     │   │
│   │    ┌───────────────────────────┐     ┌──────────────────────────┐   │   │
│   │    │ A. AST Outline Compaction │     │ B. Tool Output Truncation│   │   │
│   │    │    • Collapse class bodies│     │    • Retain header/footer│   │   │
│   │    │    • Retain type signatures│    │    • Store full blob in  │   │   │
│   │    │      and docstrings       │     │      disk artifacts/     │   │   │
│   │    └─────────────┬─────────────┘     └────────────┬─────────────┘   │   │
│   └──────────────────┼────────────────────────────────┼─────────────────┘   │
│                      └────────────────┬───────────────┘                     │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Lossless Checkpoint & Instinct Synthesis                         │   │
│   │    • Synthesize resolved decisions into a structured summary ledger │   │
│   │    • Persist learned instincts into `.agents/hooks/learned-instincts│   │
│   │    • Prune redundant intermediate tool calls from prompt history    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Reconstituted Compressed Prompt Assembly                         │   │
│   │    • Core Goal + Active Work State + Distilled Architectural Summary│   │
│   │    • Result: 60%–85% token volume reduction with 100% intent fidelity│  │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Compaction Strategies & Algorithms

### A. Tree-Sitter AST Skeletonization
When injecting full source files into context, large function implementations that are irrelevant to the target edit are skeletalized:
```typescript
// Original: 250 lines
class UserService {
  async processBilling(id: string, opts: BillingOpts): Promise<Receipt> {
    // 60 lines of validation and stripe orchestration
  }
}

// Distilled AST View: 5 lines (92% token reduction)
class UserService {
  /** Processes user billing and invoice creation */
  async processBilling(id: string, opts: BillingOpts): Promise<Receipt>;
}
```

### B. Tool Result Deduplication & Offloading
- If a tool produces $>4,000$ characters of build logs or table dumps:
  1. The complete output is written to `<workspace>/.system_generated/artifacts/<hash>.log`.
  2. The active prompt receives a 10-line excerpt plus a reference pointer:
     `[Artifact Stored: file://.../artifacts/build.log (12,400 bytes, 0 errors, 4 warnings)]`

### C. Checkpoint Compaction Protocol
- When compaction triggers, history turns $[1 \dots N-4]$ are distilled into three markdown sections:
  1. **Established Architecture Decisions**: Immutable design agreements.
  2. **Resolved Edge Cases & Pitfalls**: Invariants learned during past iterations.
  3. **Remaining Active Goal Queue**: Strict next actions.

---

## 3. Operational Recipes

### Analyzing Context Pressure via CLI
```bash
# Analyze prompt token volume and compaction opportunities
everything-gemini compact analyze --workspace .

# Execute dry-run semantic compaction
everything-gemini compact distill --threshold 75 --dry-run

# Run active AST pruning on workspace context files
everything-gemini compact prune --ast --json
```

### Hook Integration
The [hooks/context-compactor/hooks.json](file:///Users/salmanshaikh/development/github/everything-gemini/hooks/context-compactor/hooks.json) hook automatically monitors incoming turns and triggers compaction scripts before context overflow can occur.

---

## 4. Cross-Reference Links
- See [skills/context-caching/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/context-caching/SKILL.md) for Google Cloud Vertex context caching rules.
- See [skills/context-warmer/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/context-warmer/SKILL.md) for cache pre-warming strategies.
- See [agents/performance-tuner.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/performance-tuner.md) for trajectory latency optimization.
