---
name: agent-platform-rag-engine
description: Designs, deploys, and tunes enterprise Retrieval-Augmented Generation (RAG) using Google Cloud Agent Platform RAG Engine, Vertex AI Vector Search, and hybrid grounding.
---

# Agent Platform RAG Engine & Hybrid Grounding

Designs, configures, and tunes enterprise-grade Retrieval-Augmented Generation (RAG) using the **Vertex AI Agent Platform RAG Engine**. Covers corpus creation, document chunking and ingestion from Cloud Storage, hybrid search (dense semantic embeddings + sparse BM25 keyword matching), and grounding Gemini agents with verified citations.

---

## 1. RAG Engine Architecture

```
                                  RAG Ingestion & Query Flow
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION                                                                    │
│    GCS Bucket (PDF, MD, HTML) ──> Semantic Chunker ──> Text Embeddings (Gecko) │
│                                                                │                │
│                                                                ▼                │
│ 2. CORPUS STORAGE                                        Vertex AI RagCorpus    │
│    • Hybrid Index: Dense Vector Embeddings + BM25 Lexical Index                 │
│    • Dynamic metadata filtering (tenant_id, document_type, date)                │
│                                                                │                │
│                                                                ▼                │
│ 3. AGENT GROUNDING & GENERATION                                                 │
│    User Query ──> Hybrid Retrieval (Top-K) ──> Context Compression ──> Gemini  │
│                                                                          │      │
│                                                                          ▼      │
│ 4. VERIFIED CITATIONS                                    Grounded Answer +      │
│                                                          Source URI Attribution │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Managing RAG Corpora via Vertex AI Python SDK

### 1. Create RagCorpus and Ingest Documents

```python
"""Provision Vertex AI RagCorpus and Ingest Enterprise Documentation."""

import os
from vertexai.preview import rag

def provision_rag_corpus():
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

    # 1. Define Embedding Model & Semantic Chunking Strategy
    embedding_model_config = rag.EmbeddingModelConfig(
        publisher_model="publishers/google/models/text-embedding-005"
    )

    # 2. Create the RagCorpus
    corpus = rag.create_corpus(
        display_name="enterprise-knowledge-base",
        description="Internal architecture runbooks and compliance policies",
        embedding_model_config=embedding_model_config,
    )
    print(f"Created RagCorpus: {corpus.name}")

    # 3. Import Documents from Cloud Storage with Chunking
    transformation_config = rag.TransformationConfig(
        chunking_config=rag.ChunkingConfig(
            chunk_size=512,
            chunk_overlap=100,
        )
    )

    import_task = rag.import_files(
        corpus_name=corpus.name,
        paths=["gs://my-docs-bucket/runbooks/*.md", "gs://my-docs-bucket/compliance/*.pdf"],
        transformation_config=transformation_config,
        max_embedding_requests_per_min=1000,
    )
    print(f"Import task started: {import_task}")
    return corpus.name

if __name__ == "__main__":
    provision_rag_corpus()
```

---

## 3. Grounding Gemini Models with RAG Engine

Connect a Gemini model to the created RagCorpus for grounded generation with verified source citations:

```python
"""Ground Gemini 3.8 / 2.5 with Vertex AI RAG Corpus."""

import os
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.preview import rag

def query_grounded_agent(corpus_name: str, user_prompt: str):
    # 1. Configure RAG Retrieval Tool
    rag_retrieval_tool = Tool.from_retrieval(
        retrieval=rag.Retrieval(
            source=rag.VertexRagStore(
                rag_resources=[
                    rag.RagResource(
                        rag_corpus=corpus_name,
                    )
                ],
                similarity_top_k=5,
                vector_distance_threshold=0.3,
            )
        )
    )

    # 2. Initialize Gemini Model with Grounding Tool
    model = GenerativeModel(
        model_name="gemini-3.8-flash",
        tools=[rag_retrieval_tool],
    )

    # 3. Generate Grounded Response
    response = model.generate_content(user_prompt)

    print("🤖 Agent Response:")
    print(response.text)

    # 4. Extract Grounding Metadata and Citations
    if response.candidates[0].grounding_metadata:
        metadata = response.candidates[0].grounding_metadata
        print("\n📚 Grounding Citations:")
        for chunk in metadata.grounding_chunks:
            print(f" - Source: {chunk.web.uri if chunk.web else chunk.retrieved_context.uri}")

if __name__ == "__main__":
    CORPUS_NAME = "projects/12345/locations/us-central1/ragCorpora/67890"
    query_grounded_agent(CORPUS_NAME, "What is our cluster failover RTO policy?")
```

---

## 4. Best Practices & Optimization

- **Chunk Size Tuning**: For code and API documentation, use smaller chunks (256-512 tokens) with 20% overlap. For narrative manuals, use 1024 tokens.
- **Hybrid Search**: Combine dense semantic embeddings with BM25 keyword matching to accurately match exact error codes and method signatures.
- **Vector Distance Threshold**: Set `vector_distance_threshold=0.35` to filter out weakly related noise before sending context to the LLM.
