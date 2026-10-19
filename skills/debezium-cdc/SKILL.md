---
name: debezium-cdc
description: >-
  Change Data Capture (CDC) streaming architectures using Debezium, PostgreSQL logical decoding (pgoutput), MySQL binlog replication, Kafka Connect, and transactional outbox patterns. Use when capturing real-time database mutations, synchronizing search indices, or avoiding dual-write race conditions.
---

# Debezium Change Data Capture (CDC) Architecture

A production runbook for implementing distributed **Change Data Capture (CDC)** pipelines using Debezium, PostgreSQL/MySQL WAL replication, Kafka Connect, and event-driven data streaming.

---

## 🎯 Core Architectural Principles

1. **Log-Based CDC Over Polling**: Reads write-ahead logs (WAL / binlog) directly at the storage engine level, incurring minimal CPU overhead and zero query locks on primary tables.
2. **Transactional Outbox Pattern**: Guarantees atomic database operations and event emission within a single ACID transaction without two-phase commit (2PC) or dual-write inconsistencies.
3. **Strict Ordering Guarantees**: Partitioning by primary key ensures sequential ordering per record entity across consumer groups.
4. **Idempotent Consumers**: Design downstream event processors with upsert semantics and revision monotonic version checks.

---

## 🏗️ Debezium PostgreSQL Connector Configuration

### 1. Database Prerequisite (`postgresql.conf`)

```ini
# Enable logical replication
wal_level = logical
max_wal_senders = 10
max_replication_slots = 10
```

### 2. Kafka Connect Connector Payload (`debezium-postgres.json`)

```json
{
  "name": "postgres-order-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres.internal",
    "database.port": "5432",
    "database.user": "debezium_cdc",
    "database.password": "${file:/secrets/db-credentials.properties:password}",
    "database.dbname": "production_app",
    "database.server.name": "prod_cdc",
    "table.include.list": "public.orders,public.outbox_events",
    "slot.name": "debezium_orders_slot",
    "publication.name": "dbz_orders_pub",
    "publication.autocreate.mode": "filtered",
    "decimal.handling.mode": "double",
    "tombstones.on.delete": "true",
    "heartbeat.interval.ms": "5000"
  }
}
```

Deploy to Kafka Connect cluster via REST API:

```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  http://kafka-connect.internal:8083/connectors/ \
  -d @debezium-postgres.json
```

---

## 📦 Transactional Outbox Pattern Implementation

### Step 1: Outbox Event Table Schema

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for optional periodic cleanup
CREATE INDEX idx_outbox_created_at ON outbox_events (created_at);
```

### Step 2: Atomic Business Transaction (TypeScript / Node.js)

```typescript
import { PoolClient } from 'pg';

interface OrderEvent {
  orderId: string;
  userId: string;
  totalCents: number;
}

export async function createOrderWithOutbox(client: PoolClient, event: OrderEvent): Promise<void> {
  try {
    await client.query('BEGIN');

    // 1. Mutate primary business state
    const orderSql = `
      INSERT INTO orders (id, user_id, total_cents, status)
      VALUES ($1, $2, $3, 'CREATED')
    `;
    await client.query(orderSql, [event.orderId, event.userId, event.totalCents]);

    // 2. Append event to outbox within same transaction
    const outboxSql = `
      INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
      VALUES ('Order', $1, 'OrderCreated', $2)
    `;
    await client.query(outboxSql, [event.orderId, JSON.stringify(event)]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
```

---

## 🔄 Debezium Event Payload Structure

```json
{
  "before": null,
  "after": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "user_id": "usr_98231",
    "total_cents": 12500,
    "status": "CREATED"
  },
  "source": {
    "version": "2.5.0.Final",
    "connector": "postgresql",
    "name": "prod_cdc",
    "ts_ms": 1718000000000,
    "snapshot": "false",
    "db": "production_app",
    "schema": "public",
    "table": "orders",
    "txId": 984120,
    "lsn": 104857600
  },
  "op": "c",
  "ts_ms": 1718000000100
}
```

* `op`: `"c"` (create), `"u"` (update), `"d"` (delete), `"r"` (snapshot read).

---

## 🛡️ Production Failure Modes & Operational Checklist

1. **Replication Slot Disk Exhaustion**:
   - *Risk*: If Kafka Connect crashes, Postgres retains WAL logs indefinitely, filling disk.
   - *Mitigation*: Set `max_slot_wal_keep_size = 50GB` in `postgresql.conf` to protect database uptime.
2. **Heartbeat Tuning**:
   - Always configure `heartbeat.interval.ms` (e.g. 5000ms) to ensure LSN progression even during low-traffic periods.
3. **Schema Evolution Handling**:
   - Use Schema Registry (Avro or Protobuf) with `BACKWARD` or `FULL` compatibility to avoid downstream deserialization failures.
