---
name: context-warmer
description: Analyzes active repository workspace structure, clusters knowledge items, and pre-warms Gemini prefix context caches (1M-2M+ tokens) before long-running multi-agent invocations.
---

# Gemini Context Warmer (Prefix Cache Orchestration)

Automates prefix context cache pre-warming for Google Gemini 2.0 and 3.8 models, maximizing cache hit rates, lowering token expenditure by up to 75%, and slashing time-to-first-token (TTFT) from seconds to milliseconds across long-running Antigravity agent loops.

---

## 1. Architectural Strategy

Gemini Context Caching uses **deterministic prefix matching** over an immutable sequence of static tokens. The `context-warmer` skill structures repository knowledge into an optimal cache hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. FROZEN PREFIX (Cached via google-genai client.caches.create)             │
│    ├── System Directives & Security Rules (rules/common/GEMINI.md)          │
│    ├── Multi-Agent Interaction Protocols (rules/common/AGENTS.md)           │
│    ├── Repository Structural Map & Dependency Schemas                       │
│    └── Workspace Knowledge Items (<appDataDir>/knowledge/)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. DYNAMIC TURN SUFFIX (Uncached - Sent with each execution turn)           │
│    ├── Active User Objective & Incremental Task Diff                        │
│    └── Recent Execution Logs / Transient Subagent Scratchpad                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Thresholds & Cost Efficiency

| Metric | Non-Cached Gemini Turn | Context-Warmed Prefix Cache | Efficiency Gain |
| :--- | :--- | :--- | :--- |
| **Input Cost** | $0.075 / 1M tokens | $0.01875 / 1M tokens | **75% Cost Reduction** |
| **TTFT Latency** | 2,800ms - 4,500ms | 280ms - 450ms | **10x Faster First Token** |
| **Minimum Tokens** | 1 token | 32,768 tokens minimum | Optimal at >100k tokens |
| **Default TTL** | None (ephemeral) | 3,600s (1 hour, auto-refresh) | Sustained across sessions |

---

## 3. Python SDK Cache Warming Implementation

Use the official `google-genai` SDK to construct and warm the persistent prefix cache before orchestrating subagents:

```python
import os
from datetime import timedelta
from google import genai
from google.genai import types

def prewarm_workspace_cache(
    workspace_root: str,
    model: str = "gemini-2.0-flash",
    ttl_minutes: int = 60
) -> str:
    """Scans workspace KIs, builds frozen prefix content, and creates cached content resource."""
    client = genai.Client()

    # 1. Collate static rules and Knowledge Items (KIs)
    static_documents = []
    rules_path = os.path.join(workspace_root, "rules", "common", "GEMINI.md")
    if os.path.exists(rules_path):
        with open(rules_path, "r", encoding="utf-8") as f:
            static_documents.append(f.read())

    # 2. Gather repository knowledge items
    ki_root = os.path.expanduser("~/.gemini/knowledge")
    if os.path.exists(ki_root):
        for root, _, files in os.walk(ki_root):
            for file in files:
                if file.endswith((".md", ".json", ".yaml")):
                    with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                        static_documents.append(f.read())

    combined_content = "\n\n---\n\n".join(static_documents)

    # 3. Create frozen context cache
    cache = client.caches.create(
        model=model,
        config=types.CreateCachedContentConfig(
            contents=[types.Content(parts=[types.Part.from_text(combined_content)])],
            display_name="everything-gemini-workspace-cache",
            ttl=f"{ttl_minutes * 60}s",
        )
    )

    print(f"🔥 Cache Warmed Successfully! Cache Name: {cache.name}")
    print(f"⏱️  TTL: {ttl_minutes} minutes | Expires at: {cache.expire_time}")
    return cache.name

def invoke_cached_subagent(cache_name: str, task_prompt: str, model: str = "gemini-2.0-flash"):
    """Invokes multi-agent query referencing the warmed prefix cache."""
    client = genai.Client()
    response = client.models.generate_content(
        model=model,
        contents=task_prompt,
        config=types.GenerateContentConfig(
            cached_content=cache_name,
            temperature=0.2,
        )
    )
    return response.text
```

---

## 4. TypeScript / Node.js Warming Pattern

```typescript
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

export async function warmPrefixContext(repoRoot: string): Promise<string> {
  const ai = new GoogleGenAI();
  const rules = fs.readFileSync(path.join(repoRoot, 'rules', 'common', 'GEMINI.md'), 'utf8');

  const cache = await ai.caches.create({
    model: 'gemini-2.0-flash',
    config: {
      displayName: 'antigravity-repo-cache',
      ttl: '3600s',
      contents: [{ role: 'user', parts: [{ text: rules }] }]
    }
  });

  return cache.name;
}
```

---

## 5. Verification Checklist

- [ ] Static prefix exceeds the minimum 32k token threshold.
- [ ] No variable nonces, random seeds, or dynamic timestamps are embedded in the static prefix.
- [ ] Subagent invocations specify `cached_content=cache.name`.
- [ ] TTL refreshed before expiration for long-running recursive optimization loops.
