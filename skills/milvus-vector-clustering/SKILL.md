---
name: milvus-vector-clustering
description: >-
  Architects, scales, and optimizes Milvus distributed vector databases, HNSW/IVF-PQ indexing, hybrid dense-sparse search, dynamic schema partition keys, and scalar metadata filtering.
---

# Milvus Vector Clustering & Distributed Similarity Search

This skill guides the design, indexing, and high-throughput querying of enterprise-scale vector collections using Milvus and Zilliz Cloud.

---

## ⚡ Indexing Selection Matrix

| Index Type | Search Latency | Recall Rate | Memory Footprint | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`HNSW`** | Ultra-low (<5ms) | High (>98%) | High (in-memory graph) | Mission-critical search where latency is top priority. |
| **`IVF_FLAT`** | Medium (10-30ms) | Tunable (nprobe) | Moderate | Standard baseline for medium datasets (<10M vectors). |
| **`IVF_PQ`** | Low (5-15ms) | Moderate (85-92%) | Very Low (quantized) | Massive scale (100M+ vectors) with tight RAM budgets. |
| **`SCANN`** | Very Low (<8ms) | High (>95%) | Moderate | High-dimensional CPU-accelerated similarity search. |
| **`SPARSE_INVERTED_INDEX`**| Ultra-low | Exact / BM25 | Low | Sparse lexical vectors (SPLADE, BM25 hybrid ranking). |

---

## 🏗️ Production Collection Schema with Partition Keys

Multi-tenant applications should leverage Milvus **Partition Keys** to isolate tenant data logically without exceeding physical partition limits:

```python
from pymilvus import (
    connections, FieldSchema, CollectionSchema, DataType,
    Collection, utility
)

# Connect to Milvus Cluster / Standalone
connections.connect(alias="default", host="localhost", port="19530")

fields = [
    # Primary Key
    FieldSchema(name="doc_id", dtype=DataType.VARCHAR, max_length=128, is_primary=True, auto_id=False),
    
    # Multi-tenant Partition Key (routes queries to physical partition clusters)
    FieldSchema(name="tenant_id", dtype=DataType.VARCHAR, max_length=64, is_partition_key=True),
    
    # Scalar Metadata for Pre-filtering
    FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=64),
    FieldSchema(name="created_at", dtype=DataType.INT64),
    FieldSchema(name="is_archived", dtype=DataType.BOOL),
    
    # Dense Vector Embedding (e.g., text-embedding-004, 768 dimensions)
    FieldSchema(name="dense_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    
    # Sparse Lexical Vector (e.g., SPLADE or BM25 tokens)
    FieldSchema(name="sparse_vector", dtype=DataType.SPARSE_FLOAT_VECTOR),
]

schema = CollectionSchema(fields=fields, description="Enterprise Knowledge Base Vectors", enable_dynamic_field=True)
collection = Collection(name="knowledge_embeddings", schema=schema)
```

---

## 🔍 Building Vector Indexes

Build indexes before loading the collection into memory:

```python
# 1. Dense Vector Index (HNSW for high recall & low latency)
dense_index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {
        "M": 16,               # Max outgoing links per node (16-64)
        "efConstruction": 200  # Exploration factor during index build
    }
}
collection.create_index(field_name="dense_vector", index_params=dense_index_params)

# 2. Sparse Vector Index
sparse_index_params = {
    "metric_type": "IP",       # Inner Product for sparse lexical weights
    "index_type": "SPARSE_INVERTED_INDEX",
    "params": {"drop_ratio_build": 0.2}
}
collection.create_index(field_name="sparse_vector", index_params=sparse_index_params)

# Load into query nodes
collection.load()
```

---

## 🚀 Hybrid Search with Reciprocal Rank Fusion (RRF)

Combine dense semantic search with sparse lexical matching for optimal recall:

```python
from pymilvus import AnnSearchRequest, RRFRanker

# Dense vector query request
dense_req = AnnSearchRequest(
    data=[query_dense_embedding],
    anns_field="dense_vector",
    param={"metric_type": "COSINE", "params": {"ef": 64}},
    limit=50,
    expr='tenant_id == "org_acme" and is_archived == false'
)

# Sparse vector query request
sparse_req = AnnSearchRequest(
    data=[query_sparse_dict],
    anns_field="sparse_vector",
    param={"metric_type": "IP", "params": {"drop_ratio_search": 0.1}},
    limit=50,
    expr='tenant_id == "org_acme" and is_archived == false'
)

# Execute hybrid search with RRF reranking
results = collection.hybrid_search(
    reqs=[dense_req, sparse_req],
    rerank=RRFRanker(k=60),
    limit=10,
    output_fields=["doc_id", "category", "created_at"]
)
```

---

## 📋 Architectural Rules & Best Practices

1. **Partition Key Limits**: Use `is_partition_key=True` for tenant routing; Milvus maps millions of logical tenants into ~64-256 physical partition clusters automatically.
2. **Pre-Filtering Optimization**: Place high-selectivity scalar filters (`expr='category == "tech"'`) directly in the ANN search request to prune candidate sets before graph traversal.
3. **Compaction Management**: Call `collection.compact()` after bulk insertions or deletions to merge small segment files and purge deleted entity tombstones.
4. **Memory Sizing**: For HNSW, allocate approximately `(dim * 4 + M * 8) * num_vectors` bytes of RAM on QueryNodes.
