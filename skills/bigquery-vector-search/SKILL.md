---
name: bigquery-vector-search
description: Implements Google BigQuery native vector search, VECTOR_SEARCH SQL statements, ML.GENERATE_TEXT_EMBEDDING, IVF indexing, and BigLake hybrid semantic RAG.
---

# BigQuery Vector Search & Semantic Analytics

Architects, indexes, and queries large-scale vector embeddings directly inside Google BigQuery using native `VECTOR_SEARCH` syntax, Inverted File (IVF) vector indexes, and `ML.GENERATE_TEXT_EMBEDDING` with Gemini models.

---

## 1. Architecture: BigQuery In-Database Vector Analytics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Google Cloud BigQuery                            │
│                                                                             │
│   ┌────────────────────┐      ┌──────────────────┐      ┌─────────────────┐ │
│   │ Structured Records │      │ Unstructured     │      │ BigLake Object  │ │
│   │ (SQL Tables)       │      │ Text & Metadata  │      │ Tables (GCS)    │ │
│   └─────────┬──────────┘      └────────┬─────────┘      └────────┬────────┘ │
│             │                          │                         │          │
│             └──────────────────┬───────┴─────────────────────────┘          │
│                                │                                            │
│                                ▼                                            │
│            ┌───────────────────────────────────────────────┐                │
│            │ ML.GENERATE_TEXT_EMBEDDING (Vertex AI Gemini) │                │
│            │ 768-dim embeddings stored as ARRAY<FLOAT64>   │                │
│            └───────────────────────┬───────────────────────┘                │
│                                    │                                        │
│                                    ▼                                        │
│            ┌───────────────────────────────────────────────┐                │
│            │ IVF Vector Index (Inverted File Partitioning) │                │
│            │ Distance: COSINE / EUCLIDEAN / DOT_PRODUCT    │                │
│            └───────────────────────┬───────────────────────┘                │
│                                    │                                        │
│                                    ▼                                        │
│            ┌───────────────────────────────────────────────┐                │
│            │ VECTOR_SEARCH + Post-Filter SQL Join          │                │
│            │ Sub-second Top-K nearest neighbor retrieval   │                │
│            └───────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. IVF Vector Indexing

BigQuery supports Inverted File Flat (IVF) indexes to partition vector space into Voronoi cells, accelerating approximate nearest neighbor (ANN) retrieval across billions of rows.

```sql
-- 1. Create native vector index on embedding column
CREATE VECTOR INDEX IF NOT EXISTS knowledge_vector_idx
ON `my_project.agent_knowledge.document_chunks`(embedding)
STORING(chunk_id, doc_id, section_title)
OPTIONS(
  index_type = 'IVF',
  distance_type = 'COSINE',
  ivf_options = '{"num_lists": 1000}'
);
```

- **`num_lists`**: The number of Voronoi partitions (rule of thumb: $\sqrt{N}$ where $N$ is row count).
- **`distance_type`**: `COSINE` (recommended for normalized embeddings), `EUCLIDEAN`, or `DOT_PRODUCT`.
- **`STORING`**: Co-locates frequently queried payload attributes in the vector index leaf nodes, eliminating secondary table lookups.

---

## 3. In-Database Embeddings Generation with Gemini

Connect BigQuery directly to Vertex AI Gemini text-embedding models:

```sql
-- 1. Create connection to Vertex AI Remote Model
CREATE OR REPLACE MODEL `my_project.agent_knowledge.gemini_embedding_model`
REMOTE WITH CONNECTION `projects/my_project/locations/us-central1/connections/vertex-ai-conn`
OPTIONS(
  endpoint = 'text-embedding-004'
);

-- 2. Batch generate embeddings for newly inserted document chunks
INSERT INTO `my_project.agent_knowledge.document_chunks` (chunk_id, doc_id, content, embedding)
SELECT
  ml_generate_embedding_result.chunk_id,
  ml_generate_embedding_result.doc_id,
  ml_generate_embedding_result.content,
  ml_generate_embedding_result.text_embedding AS embedding
FROM ML.GENERATE_TEXT_EMBEDDING(
  MODEL `my_project.agent_knowledge.gemini_embedding_model`,
  (
    SELECT chunk_id, doc_id, content
    FROM `my_project.agent_knowledge.raw_chunks`
    WHERE processed_at IS NULL
  ),
  STRUCT(
    'RETRIEVAL_DOCUMENT' AS task_type,
    768 AS output_dimensionality
  )
) AS ml_generate_embedding_result;
```

---

## 4. Native `VECTOR_SEARCH` Execution

Query embeddings directly with sub-second latency and zero external vector database infrastructure:

```sql
-- Top-10 semantic search with structured tenant/date pre-filtering
SELECT
  base.chunk_id,
  base.doc_id,
  base.content,
  distance
FROM VECTOR_SEARCH(
  TABLE `my_project.agent_knowledge.document_chunks`,
  'embedding',
  (
    -- Embed user query dynamically using Gemini
    SELECT text_embedding AS query_vector
    FROM ML.GENERATE_TEXT_EMBEDDING(
      MODEL `my_project.agent_knowledge.gemini_embedding_model`,
      (SELECT 'What are the spend limit policies for autonomous subagents?' AS content),
      STRUCT('RETRIEVAL_QUERY' AS task_type, 768 AS output_dimensionality)
    )
  ),
  top_k => 10,
  distance_type => 'COSINE',
  options => '{"fraction_lists_to_search": 0.05}'
);
```

- **`fraction_lists_to_search`**: Controls recall vs. latency tradeoff (0.01 to 0.20). Higher values increase recall at slightly higher compute cost.

---

## 5. Hybrid Search (Lexical BM25 + Semantic Vector)

Combine BigQuery native search indexes (`SEARCH`) with `VECTOR_SEARCH` using Reciprocal Rank Fusion (RRF):

```sql
WITH vector_matches AS (
  SELECT
    base.chunk_id,
    base.content,
    ROW_NUMBER() OVER (ORDER BY distance ASC) AS vector_rank
  FROM VECTOR_SEARCH(
    TABLE `my_project.agent_knowledge.document_chunks`,
    'embedding',
    (SELECT text_embedding FROM ML.GENERATE_TEXT_EMBEDDING(
      MODEL `my_project.agent_knowledge.gemini_embedding_model`,
      (SELECT 'subagent spend guardrails' AS content),
      STRUCT('RETRIEVAL_QUERY' AS task_type)
    )),
    top_k => 50,
    distance_type => 'COSINE'
  )
),
keyword_matches AS (
  SELECT
    chunk_id,
    content,
    ROW_NUMBER() OVER () AS keyword_rank
  FROM `my_project.agent_knowledge.document_chunks`
  WHERE SEARCH(content, 'guardrail spend budget ceiling')
  LIMIT 50
)
SELECT
  COALESCE(v.chunk_id, k.chunk_id) AS chunk_id,
  COALESCE(v.content, k.content) AS content,
  (
    COALESCE(1.0 / (60 + v.vector_rank), 0.0) +
    COALESCE(1.0 / (60 + k.keyword_rank), 0.0)
  ) AS rrf_score
FROM vector_matches v
FULL OUTER JOIN keyword_matches k ON v.chunk_id = k.chunk_id
ORDER BY rrf_score DESC
LIMIT 10;
```

---

## 6. Enterprise Best Practices & Anti-Patterns

| Category | Recommended Pattern | Anti-Pattern |
| :--- | :--- | :--- |
| **Index Choice** | Use IVF with `num_lists` scaled to $\sqrt{N}$ for $N > 100,000$ rows | Querying `ARRAY<FLOAT64>` with brute-force `COSINE_DISTANCE()` |
| **Payload Storage** | Store lightweight metadata with `STORING(...)` inside index | Joining 10 high-cardinality tables after vector search |
| **Embedding Types** | Specify `RETRIEVAL_DOCUMENT` during indexing, `RETRIEVAL_QUERY` during search | Using default task types causing asymmetric vector drift |
| **Partitioning** | Partition and cluster base table on tenant ID or ingestion date | Single unpartitioned table forcing full-table vector scans |

---

## 7. CLI Runbook (`bq` CLI)

```bash
# 1. Create BigQuery dataset for vector embeddings
bq mk --dataset --location=us-central1 my_project:agent_knowledge

# 2. Check vector index status and coverage
bq show --format=prettyjson my_project:agent_knowledge.document_chunks | jq '.vectorSearchStatistics'

# 3. Dry-run vector query to estimate bytes scanned
bq query --use_legacy_sql=false --dry_run < vector_query.sql
```
