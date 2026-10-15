---
name: rag-architect
description: >-
  Designs retrieval-augmented generation (RAG) pipelines, semantic chunking strategies, hybrid keyword-vector search, re-ranking, and pgvector embeddings using Gemini models.
---

# RAG Architecture & Vector Retrieval with Gemini

## Overview
Retrieval-Augmented Generation (RAG) equips Gemini with localized repository context, enterprise documentation, and proprietary knowledge bases. This skill outlines production architectures for dense embeddings, semantic chunking, hybrid search (keyword + vector), and Gemini-powered re-ranking.

## Core RAG Pipeline

```
[Documents] ──► [Semantic Chunker] ──► [text-embedding-004] ──► [Vector DB / pgvector]
                                                                        │
[User Query] ──► [Hybrid Retrieval: BM25 + Dense Vector] ───────────────┤
                                                                        ▼
                                                         [Gemini Reranker & Filter]
                                                                        ▼
                                                         [Context Window (Cached)]
                                                                        ▼
                                                          [Grounded Synthesis]
```

## Architectural Guidelines

### 1. Embedding Model Selection
- Use **`text-embedding-004`** (768 dimensions) for semantic vector representations.
- Apply task types appropriately when generating embeddings:
  - `RETRIEVAL_DOCUMENT`: For indexing documents into the knowledge store.
  - `RETRIEVAL_QUERY`: For embedding the user's incoming query.
  - `SEMANTIC_SIMILARITY`: For clustering and duplicate detection.

### 2. Semantic Chunking Strategies
- **Code Repositories**: Chunk by syntax boundaries (AST classes, functions, modules) rather than fixed token lengths.
- **Documentation**: Chunk by markdown headers (`##`, `###`) preserving title hierarchy as chunk metadata.
- **Overlap**: Maintain a 10-15% token overlap across sliding windows to prevent boundary truncation of critical concepts.

### 3. Hybrid Retrieval (Sparse + Dense)
Never rely exclusively on vector distance. Combine:
- **Dense Vector Search**: Cosine or inner product similarity via `pgvector` or Qdrant for semantic meaning.
- **Sparse Keyword Search**: Full-text search (BM25 or PostgreSQL `tsvector`) for exact identifier matches, error codes, and function names.
- Combine scores using Reciprocal Rank Fusion (RRF):
  $$RRF(d) = \sum \frac{1}{60 + r_i(d)}$$

### 4. Gemini Two-Stage Reranking
1. Retrieve top 50 candidates from hybrid search.
2. Pass the top 50 candidate snippets to `gemini-1.5-flash` or `gemini-3.8` for high-speed relevance scoring and deduplication.
3. Inject the top 5-10 highest-scoring excerpts into the reasoning context window.

### 5. Context Injection & Static Prefix Caching
- Structure prompt templates with static instruction prefixes placed before retrieved dynamic context to maximize Gemini's automatic **Prefix Context Caching**.
- Tag all retrieved chunks with clickable source links: `[source.py:L10-L45](file:///path/to/source.py#L10-L45)`.

## Verification Checklist
- [ ] Appropriate embedding task types specified (`RETRIEVAL_DOCUMENT` vs `RETRIEVAL_QUERY`)
- [ ] Chunks respect syntax and AST boundaries
- [ ] Hybrid search active for exact symbol matching
- [ ] Clickable `file://` citations attached to synthesized outputs
