---
name: duckdb-local-olap
description: >-
  Architects, queries, and optimizes embedded in-process DuckDB analytical workflows, direct Parquet/S3 querying, zero-copy Apache Arrow dataframes, and MotherDuck hybrid cloud execution.
---

# DuckDB Local OLAP & Serverless Analytics

This skill guides building high-speed analytical engines using DuckDB—the "SQLite for analytics"—enabling columnar vectorized execution, direct querying of compressed Parquet files on cloud storage, and zero-copy transfers with Apache Arrow.

---

## ⚡ Core Patterns

### 1. Direct Parquet Querying Over S3 Without Ingestion

Query gigabytes of remote compressed files with projection and predicate pushdowns (only requested byte ranges are transferred over the network):

```sql
-- 1. Install and load HTTP and S3 extensions
INSTALL httpfs;
LOAD httpfs;

-- 2. Configure S3 authentication
SET s3_region = 'us-east-1';
SET s3_access_key_id = 'YOUR_ACCESS_KEY';
SET s3_secret_access_key = 'YOUR_SECRET_KEY';

-- 3. Query remote Parquet directory with globs
SELECT
    country,
    count(*) AS total_transactions,
    round(avg(amount_usd), 2) AS avg_amount,
    quantile_cont(amount_usd, 0.95) AS p95_amount
FROM read_parquet('s3://my-data-lake/transactions/year=2026/month=*/*.parquet')
WHERE status = 'settled'
GROUP BY country
ORDER BY total_transactions DESC
LIMIT 20;
```

---

### 2. Zero-Copy Python & Polars / Arrow Integration

Pass memory buffers directly between DuckDB's vectorized engine and Polars or PyArrow without JSON or IPC serialization:

```python
import duckdb
import polars as pl

# Connect to in-memory instance
con = duckdb.connect()

# Set aggressive memory limits and worker threads
con.execute("SET memory_limit = '8GB';")
con.execute("SET threads = 8;")

# Create a sample Polars DataFrame
df = pl.DataFrame({
    "user_id": [101, 102, 103],
    "scores": [98.5, 76.2, 89.0]
})

# Query Polars DataFrame directly as a virtual table (zero-copy)
arrow_table = con.execute("""
    SELECT 
        user_id,
        scores,
        CASE WHEN scores >= 90 THEN 'A' ELSE 'B' END AS grade
    FROM df
    WHERE scores > 80
""").arrow()

# Convert back to Polars instantaneously
result_df = pl.from_arrow(arrow_table)
print(result_df)
```

---

### 3. Node.js Embedded Analytics Engine

```typescript
import { Database } from 'duckdb-async';

export async function aggregateLocalParquet(parquetPath: string) {
  const db = await Database.create(':memory:');
  
  const rows = await db.all(`
    SELECT 
        category,
        count(*) AS item_count,
        sum(price) AS gross_revenue
    FROM read_parquet(?)
    GROUP BY category
    ORDER BY gross_revenue DESC
  `, [parquetPath]);

  await db.close();
  return rows;
}
```

---

### 4. MotherDuck Cloud Hybrid Execution

Scale seamlessly from a single laptop to collaborative cloud storage without modifying SQL queries:

```python
import duckdb

# Connect to MotherDuck (cloud database)
con = duckdb.connect("md:production_analytics")

# Join local disk Parquet files directly with MotherDuck cloud tables
con.execute("""
    SELECT 
        cloud_users.organization_id,
        count(local_events.event_id) AS event_volume
    FROM read_parquet('./local_cache/*.parquet') AS local_events
    JOIN cloud_users ON local_events.user_id = cloud_users.id
    GROUP BY cloud_users.organization_id
""")
```

---

## 🛠️ Performance Checklist

- **Use Parquet Over CSV**: Parquet is 10x-50x faster due to columnar compression, statistics dictionaries, and column skipping.
- **Configure Memory Limit**: Always set `SET memory_limit = 'XGB';` to ensure DuckDB uses external sorting/joining when data exceeds RAM instead of crashing the process.
- **Avoid Row-by-Row Inserts**: Use `Appender` or `COPY ... FROM ...` in bulk batches of 50,000+ rows.
