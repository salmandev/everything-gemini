---
name: clickhouse-analytics
description: >-
  Architects, models, and optimizes high-throughput ClickHouse OLAP analytical schemas, MergeTree table engines, real-time materialized views, and vector similarity search.
---

# ClickHouse Analytics & Real-Time OLAP

This skill guides high-throughput schema modeling, query optimization, and real-time streaming ingestion on ClickHouse for analytics and vector retrieval.

---

## ⚡ Core Engine & Table Design

### 1. Engine Selection Matrix

| Engine | Best For | Behavior |
| :--- | :--- | :--- |
| **`MergeTree`** | Default append-only timeseries | Base engine for fast parallel range scans and primary indexing. |
| **`ReplacingMergeTree`** | Deduplication & upserts | Replaces rows with matching sorting keys during background compaction. |
| **`SummingMergeTree`** | Real-time counter rollups | Automatically aggregates numeric columns with identical sorting keys. |
| **`AggregatingMergeTree`**| Pre-aggregated state metrics | Stores intermediate aggregate states (e.g. `uniqExactState`, `quantilesState`). |

---

### 2. Primary Key & Partitioning Strategy

In ClickHouse, the `ORDER BY` defines the sparse primary index (1 index mark every 8,192 rows). Order columns by ascending cardinality:

```sql
CREATE TABLE analytics.events (
    tenant_id UUID,
    event_type LowCardinality(String),
    user_id String,
    properties JSON,
    timestamp DateTime64(3, 'UTC')
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, event_type, timestamp, user_id)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

> **Rules:**
> 1. Never partition by high-cardinality fields (like `user_id` or `toDate(timestamp)`); keep partition counts under 1,000 to prevent metadata explosion.
> 2. Use `LowCardinality(String)` for strings with < 10,000 distinct values (e.g., country codes, event names) for dictionary encoding.

---

## 🔄 Real-Time Ingestion with Kafka & Materialized Views

Stream data continuously from Apache Kafka directly into optimized storage tables using pipe tables and materialized views:

```sql
-- 1. Kafka Queue Engine
CREATE TABLE analytics.kafka_events_queue (
    raw_payload String
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'kafka:9092',
         kafka_topic_list = 'app-events',
         kafka_group_name = 'clickhouse-consumer',
         kafka_format = 'JSONAsString';

-- 2. Destination Storage Table
CREATE TABLE analytics.events_store (
    event_id UUID,
    event_name LowCardinality(String),
    payload JSON,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (event_name, created_at);

-- 3. Materialized View Pipe
CREATE MATERIALIZED VIEW analytics.mv_kafka_to_events TO analytics.events_store AS
SELECT
    JSONExtract(raw_payload, 'id', 'UUID') AS event_id,
    JSONExtract(raw_payload, 'type', 'LowCardinality(String)') AS event_name,
    raw_payload AS payload,
    now() AS created_at
FROM analytics.kafka_events_queue;
```

---

## 🚀 High-Performance Query Optimization

### 1. Leverage `PREWHERE` for Selective Filters
`PREWHERE` reads filtered columns first and only fetches remaining requested columns for matching rows:

```sql
SELECT
    user_id,
    count() AS total_events,
    quantile(0.95)(JSONExtractFloat(properties, 'latency_ms')) AS p95_latency
FROM analytics.events
PREWHERE tenant_id = 'a3bb189e-8bf9-4888-9912-abcdef012345'
  AND timestamp >= now() - INTERVAL 24 HOUR
WHERE event_type = 'api_request'
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 50;
```

### 2. Approximate Aggregations for Massive Scale
- Use `uniqCombined64(user_id)` or `uniqHLL12(user_id)` instead of `uniqExact()` when calculating HyperLogLog DAU/MAU across hundreds of millions of events (~10x faster, <1% error).

---

## 🧠 Vector Similarity Search in ClickHouse

ClickHouse natively computes high-dimensional vector distances:

```sql
CREATE TABLE analytics.article_embeddings (
    id UUID,
    title String,
    embedding Array(Float32),
    INDEX idx_emb embedding TYPE vector_similarity('hnsw', 'cosineDistance') GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY id;

-- Retrieve Top-K Nearest Neighbors
SELECT
    title,
    cosineDistance(embedding, [0.021, -0.145, 0.891, ...]) AS score
FROM analytics.article_embeddings
ORDER BY score ASC
LIMIT 10;
```
