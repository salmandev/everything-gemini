---
name: vertex-ai-feature-store
description: Provisions and queries Google Cloud Vertex AI Feature Store, point-in-time correct historical joins, low-latency online serving, and Gemini embedding feature tables.
---

# Vertex AI Feature Store & Embeddings Serving

Architects, provisions, and serves machine learning features and vector representations using Google Cloud Vertex AI Feature Store. Covers BigQuery-backed offline storage, point-in-time joins, low-latency online feature serving, and real-time agent memory retrieval.

---

## 1. Architecture: Vertex AI Feature Store

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERTEX AI FEATURE STORE                             │
│                                                                             │
│   ┌─────────────────────┐                   ┌───────────────────────────┐   │
│   │ BigQuery Lakehouse  │                   │ Streaming Ingestion       │   │
│   │ (Offline Gold Data) │                   │ (Pub/Sub + Dataflow)      │   │
│   └──────────┬──────────┘                   └─────────────┬─────────────┘   │
│              │                                            │                 │
│              ▼                                            ▼                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Feature Registry & View Definitions (BigQuery-backed Feature Store) │   │
│   │ • Entity: user_id, repo_id, session_id                              │   │
│   │ • Embeddings: text_embedding_004 (768-dim)                          │   │
│   └──────────────────┬────────────────────────────┬─────────────────────┘   │
│                      │                            │                         │
│                      ▼ Offline                    ▼ Online (<10ms)          │
│   ┌─────────────────────────────┐      ┌─────────────────────────────┐      │
│   │ Point-in-Time Correct       │      │ Optimized Online Serving    │      │
│   │ Historical Training Joins   │      │ (Bigtable / Cache Engine)   │      │
│   └─────────────────────────────┘      └─────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Provisioning (`gcloud`)

Set up a Feature Online Store optimized for sub-10ms feature retrieval:

```bash
# 1. Create Feature Online Store with optimized serving
gcloud vertex-ai feature-online-stores create agent-memory-store \
  --location=us-central1 \
  --dedicated-serving-nodes-min=1 \
  --dedicated-serving-nodes-max=5

# 2. Create Feature View backed by BigQuery table
gcloud vertex-ai feature-views create user-profile-features \
  --feature-online-store=agent-memory-store \
  --location=us-central1 \
  --bigquery-table=projects/my_project/datasets/features/tables/user_profiles \
  --entity-id-columns=user_id \
  --cron-schedule="0 */4 * * *"
```

---

## 3. Real-Time Online Feature Retrieval (Python SDK)

Query real-time feature vectors inside an agent execution turn:

```python
from google.cloud import aiplatform_v1beta1 as vertex_ai

client = vertex_ai.FeatureOnlineStoreServiceClient()

def fetch_agent_session_features(user_id: str) -> dict:
    """Fetches real-time developer context and historical preference vectors."""
    feature_view_path = client.feature_view_path(
        project="my_project",
        location="us-central1",
        feature_online_store="agent-memory-store",
        feature_view="user-profile-features"
    )
    
    response = client.fetch_feature_values(
        request=vertex_ai.FetchFeatureValuesRequest(
            feature_view=feature_view_path,
            data_key=vertex_ai.FeatureViewDataKey(key=user_id)
        )
    )
    
    return {
        field.name: field.value
        for field in response.key_values.features
    }
```

---

## 4. Point-in-Time Correct Offline Joins

Avoid data leakage in offline agent evaluation benchmarks:

```sql
SELECT
  observations.task_id,
  observations.timestamp,
  features.seniority_level,
  features.preferred_framework,
  features.embedding_vector
FROM `my_project.evals.agent_runs` AS observations
POINT_IN_TIME JOIN `my_project.features.user_profiles` AS features
  ON observations.user_id = features.user_id
  AND observations.timestamp >= features.feature_timestamp;
```
