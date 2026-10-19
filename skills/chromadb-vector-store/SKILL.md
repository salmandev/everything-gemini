---
name: chromadb-vector-store
description: Implements ChromaDB persistent vector storage, multi-modal embeddings, collection partitioning, metadata filtering, and semantic similarity search.
---

# ChromaDB Vector Store

Provides production patterns for embedding generation, persistent collection management, metadata-filtered semantic retrieval, and hybrid search using ChromaDB.

---

## 1. Client Architecture

ChromaDB operates in three deployment modes depending on scale and latency requirements:

```
  In-Process Ephemeral            Local Persistent                Client / Server
┌──────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│ chromadb.Client()    │     │ PersistentClient(path)│     │ HttpClient(host, port) │
│ (Unit Tests & CI)    │     │ (Embedded SQLite/HNSW)│     │ (Kubernetes / Docker)  │
└──────────────────────┘     └───────────────────────┘     └────────────────────────┘
```

```python
import chromadb
from chromadb.config import Settings

# Production persistent client with DuckDB + HNSW backend
client = chromadb.PersistentClient(
    path="./data/chroma",
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=False,
    )
)
```

---

## 2. Gemini Embeddings & Collection Creation

Integrates native Gemini embeddings (`text-embedding-004`) with custom collection metrics:

```python
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from google import genai

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, model_name: str = "text-embedding-004"):
        self.client = genai.Client()
        self.model_name = model_name

    def __call__(self, input: Documents) -> Embeddings:
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=input,
        )
        return [e.values for e in response.embeddings]

gemini_ef = GeminiEmbeddingFunction()

# Create or get collection with Cosine distance metric
collection = client.get_or_create_collection(
    name="technical_runbooks_v2",
    embedding_function=gemini_ef,
    metadata={"hnsw:space": "cosine", "description": "Antigravity skills catalog"}
)
```

---

## 3. High-Throughput Batch Upsert

Batch insertion ensures zero duplicate embeddings and enforces metadata schemas:

```python
from typing import List, Dict, Any

def upsert_knowledge_batch(
    collection,
    doc_ids: List[str],
    texts: List[str],
    metadatas: List[Dict[str, Any]]
):
    """Upserts documents in batches of 500 to stay within gRPC frame limits."""
    batch_size = 500
    for i in range(0, len(doc_ids), batch_size):
        chunk_ids = doc_ids[i:i + batch_size]
        chunk_texts = texts[i:i + batch_size]
        chunk_metas = metadatas[i:i + batch_size]

        collection.upsert(
            ids=chunk_ids,
            documents=chunk_texts,
            metadatas=chunk_metas
        )
```

---

## 4. Metadata Filtering & Semantic Search

Queries can filter across Boolean operators (`$and`, `$or`), numerical ranges, and substring matching:

```python
results = collection.query(
    query_texts=["How do I configure KEDA ScaledObjects for Kafka?"],
    n_results=5,
    where={
        "$and": [
            {"category": {"$eq": "devops"}},
            {"security_tier": {"$lte": 2}},
            {"status": {"$ne": "deprecated"}}
        ]
    },
    where_document={"$contains": "ScaledObject"},
    include=["documents", "metadatas", "distances"]
)

# Parse matched documents
for idx, (doc, meta, dist) in enumerate(zip(
    results["documents"][0],
    results["metadatas"][0],
    results["distances"][0]
)):
    similarity_score = 1.0 - dist
    print(f"[{idx+1}] Score: {similarity_score:.4f} | ID: {results['ids'][0][idx]}")
    print(f"     Title: {meta.get('title')} (v{meta.get('version')})")
```

---

## 5. Dockerized Server Deployment

For multi-tenant or distributed Antigravity agents:

```yaml
# compose.chroma.yml
version: "3.9"
services:
  chromadb:
    image: chromadb/chroma:0.5.23
    ports:
      - "8000:8000"
    environment:
      - IS_PERSISTENT=TRUE
      - PERSISTENCE_DIRECTORY=/chroma/chroma
      - ANONYMIZED_TELEMETRY=FALSE
    volumes:
      - chroma_data:/chroma/chroma
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  chroma_data:
```

```python
# Connect via HTTP
remote_client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    headers={"X-Chroma-Token": "secret-auth-token"}
)
```

---

## 6. Verification and Maintenance

```bash
# Verify Chroma API heartbeat
curl -s http://localhost:8000/api/v1/heartbeat | jq .

# Check active collections count and schema
curl -s http://localhost:8000/api/v1/collections | jq '.[].name'

# Reset collection or clean expired embeddings safely
python -c "
import chromadb
client = chromadb.PersistentClient('./data/chroma')
print(f'Collections: {len(client.list_collections())}')
"
```
