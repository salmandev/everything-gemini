---
name: spanner-change-streams
description: Implements Google Cloud Spanner Change Streams for real-time transaction log Change Data Capture, Pub/Sub integration, and event-driven database synchronization.
---

# Google Cloud Spanner Change Streams (Real-Time CDC)

Designs, provisions, and processes transaction-level Change Data Capture (CDC) events using Google Cloud Spanner Change Streams. Enables event-driven microservices, real-time cache invalidation, and continuous replication to BigQuery and Pub/Sub.

---

## 1. Architecture: Spanner Change Streams & Data Mesh

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SPANNER CHANGE STREAM PIPELINE                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Google Cloud Spanner Database                                       │   │
│   │ (Transactions committing to primary tables)                         │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Spanner Change Stream (CREATE CHANGE STREAM)                        │   │
│   │ Captures INSERT, UPDATE, DELETE with externalized commit timestamps │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Dataflow CDC Consumer / Cloud Functions (Java / Python)             │   │
│   └──────────────────┬────────────────────────────┬─────────────────────┘   │
│                      │                            │                         │
│                      ▼ Real-time Invalidation     ▼ Continuous Analytics    │
│   ┌─────────────────────────────┐      ┌─────────────────────────────┐      │
│   │ Redis / Valkey Cache        │      │ BigQuery Real-Time Replica  │      │
│   │ (Sub-second Invalidation)   │      │ (Streaming Buffer Table)    │      │
│   └─────────────────────────────┘      └─────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Spanner DDL (`CREATE CHANGE STREAM`)

Provision a change stream watching specific tables and columns with retention policies:

```sql
-- 1. Create Change Stream tracking Accounts and Orders tables
CREATE CHANGE STREAM AgentAuditChangeStream
FOR Services, Dependencies
OPTIONS (
  retention_period = '36h',
  value_capture_type = 'OLD_AND_NEW_VALUES'
);
```

- **`retention_period`**: Retains change stream data for up to 7 days (default is 24 hours).
- **`value_capture_type`**: `OLD_AND_NEW_VALUES` captures before-and-after states, essential for audit logs and rollback verification.

---

## 3. Dataflow Pipeline Template Deployment (`gcloud`)

Stream Spanner mutations directly into Google Cloud Pub/Sub:

```bash
gcloud dataflow flex-template run spanner-to-pubsub-cdc \
  --template-file-gcs-location="gs://dataflow-templates/latest/flex/Spanner_Change_Streams_to_PubSub" \
  --region="us-central1" \
  --parameters \
    spannerInstanceId="production-instance",\
    spannerDatabase="architecture-db",\
    spannerMetadataInstanceId="production-instance",\
    spannerMetadataDatabase="cdc-metadata",\
    spannerChangeStreamName="AgentAuditChangeStream",\
    pubsubTopic="projects/my_project/topics/spanner-cdc-events"
```

---

## 4. Change Stream Processing Best Practices

| Strategy | Recommendation | Anti-Pattern |
| :--- | :--- | :--- |
| **Metadata Database** | Maintain a dedicated Spanner metadata database for Dataflow partition tracking | Storing metadata in the production database increasing transaction contention |
| **Retention Window** | Set retention to at least 36 hours (`36h`) to survive Dataflow upgrades | 1-hour retention risking permanent data loss during pipeline restarts |
| **Payload Optimization** | Only track critical tables instead of `FOR ALL` database objects | Capturing ephemeral log tables overwhelming streaming workers |
