---
name: dataproc-spark-analytics
description: Deploys and tunes Google Cloud Dataproc Serverless Spark, PySpark batch pipelines, BigLake vector indexing, and Data Agent Kit telemetry.
---

# Dataproc Spark Analytics

Orchestrates large-scale distributed data processing, feature engineering, and high-throughput vector embedding generation using Google Cloud Dataproc Serverless Spark and PySpark.

---

## 1. Architecture: Dataproc Serverless & Agentic Big Data

```
 Google Cloud Storage / BigLake         Dataproc Serverless               Gemini Vector Index
┌─────────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│ Raw Document Lakes          │────>│ Serverless PySpark     │────>│ BigQuery Vector Search │
│ (Parquet, JSON, Delta/Ice)  │     │ Batch Executors        │     │ / Milvus / ChromaDB    │
└─────────────────────────────┘     └───────────┬────────────┘     └────────────────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │ Gemini Embedding API   │
                                    │ (text-embedding-004)   │
                                    └────────────────────────┘
```

- **Zero Cluster Management**: Runs ad-hoc PySpark workloads without provisioning or maintaining dedicated VMs.
- **Dynamic Autoscaling**: Scales Spark executors elastically based on partition backlog and shuffle pressure.
- **Unified Governance**: Native IAM Workload Identity federation and BigLake fine-grained column/row security.

---

## 2. Distributed Vector Embedding Pipeline (PySpark)

Generates 768-dimensional embeddings over millions of technical documents using PySpark pandas UDFs:

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import ArrayType, FloatType
import pandas as pd
from typing import Iterator

spark = SparkSession.builder \
    .appName("Antigravity-Distributed-Embeddings") \
    .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
    .getOrCreate()

# Read partitioned documents from Cloud Storage
docs_df = spark.read.parquet("gs://antigravity-data-lake/documents/v2/*.parquet")

@pandas_udf(ArrayType(FloatType()))
def compute_gemini_embeddings_udf(text_series: pd.Series) -> pd.Series:
    """Computes embeddings in vectorized batches using official Google GenAI SDK."""
    from google import genai
    client = genai.Client()

    results = []
    # Batch requests in 100 items per API call
    batch_size = 100
    for i in range(0, len(text_series), batch_size):
        chunk = text_series.iloc[i:i + batch_size].tolist()
        resp = client.models.embed_content(
            model="text-embedding-004",
            contents=chunk
        )
        results.extend([e.values for e in resp.embeddings])
    return pd.Series(results)

# Transform and write to BigLake table
embedded_df = docs_df.withColumn("embedding", compute_gemini_embeddings_udf("content"))
embedded_df.write \
    .format("bigquery") \
    .mode("overwrite") \
    .option("table", "enterprise_rag.document_embeddings_v2") \
    .save()
```

---

## 3. Submitting Serverless PySpark Batches

Submits serverless batch jobs via Google Cloud CLI:

```bash
gcloud dataproc batches submit pyspark gs://antigravity-artifacts/scripts/generate_embeddings.py \
  --project=my-gcp-ai-project \
  --region=us-central1 \
  --batch=batch-emb-$(date +%s) \
  --deps-bucket=gs://antigravity-artifacts/staging \
  --properties=spark.dynamicAllocation.maxExecutors=30 \
  --version=2.2
```

---

## 4. PySpark Performance Tuning Rules

1. **Avoid `collect()`**: Never pull multi-gigabyte DataFrames onto the driver. Use `.write` directly to BigQuery or GCS.
2. **Optimize Partition Sizing**: Aim for 128 MB – 256 MB per Spark partition:
   ```python
   df = df.repartition(100, "category_id")
   ```
3. **Broadcast Small Reference Maps**:
   ```python
   from pyspark.sql.functions import broadcast
   joined_df = large_fact_df.join(broadcast(small_metadata_df), "tenant_id")
   ```

---

## 5. Verification and Monitoring

```bash
# Check status of submitted batch
gcloud dataproc batches describe <BATCH_ID> --region=us-central1 --format="value(state)"

# Stream driver logs
gcloud dataproc batches wait <BATCH_ID> --region=us-central1
```
