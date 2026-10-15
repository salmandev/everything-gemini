---
name: context-caching
description: >-
  Use this skill when managing large-context Gemini operations (1M-2M tokens), architecting prefix-cached repository indexes, optimizing prompt structures for cost and latency, or structuring session memory for long-running agent workflows.
---

# Gemini Context Caching & Large-Context Optimization

## Overview
Gemini's 1M-to-2M token context window combined with explicit and implicit Context Caching allows agents to ingest entire codebases, documentation sets, and transaction logs. This skill outlines architectural strategies to maximize caching efficiency, cut API token costs by up to 75%, and minimize time-to-first-token (TTFT).

## Context Architecture: Prefix Optimization

Gemini caching relies on **deterministic prefix matching**. To ensure cache hits across agent invocations:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. STATIC PREFIX (Cached - High Hit Rate)                    │
│    - System Instructions & Repository Rules (GEMINI.md)     │
│    - Architecture Specs & Database Schemas                  │
│    - Base Codebase Index / AST Dump                         │
├─────────────────────────────────────────────────────────────┤
│ 2. DYNAMIC SUFFIX (Uncached - Fast Processing)              │
│    - Current User Prompt / Incremental Task Diff            │
│    - Recent Terminal Command Output                         │
│    - Real-Time Conversation Turn                            │
└─────────────────────────────────────────────────────────────┘
```

### Golden Rules for Caching
1. **Never mutate the prefix**: Avoid injecting dynamic timestamps, random IDs, or changing session metadata at the beginning of the context.
2. **Cluster Static Assets**: Place unchanging documentation, API contracts, and core schemas at the very top of context assemblies.
3. **Chunking Thresholds**: Context caching provides optimal return on investment when static context exceeds 32k tokens.

## Progressive Ingestion Strategies

1. **Skeleton First**: Ingest file tree maps and interface definitions before pulling full function implementations.
2. **Selective Hydration**: Ingest full source files only for components identified during initial skeleton mapping.
3. **Session Compaction**: When conversation histories grow long, trigger the `Stop` or `PostInvocation` summarizer to compress intermediate thoughts into high-density Knowledge Items (KI).

## Cost & Latency Economics
- **Cached Input Cost**: ~75% cheaper than non-cached input tokens.
- **Cache Hit Latency**: Reduces initial TTFT from seconds to milliseconds on large contexts.

## Verification Checklist
- [ ] Static instructions positioned consistently at the head of context
- [ ] No variable timestamps or nonces in the static prefix block
- [ ] Cache hit rates monitored during multi-turn batch workflows
