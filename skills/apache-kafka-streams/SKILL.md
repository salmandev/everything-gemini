---
name: apache-kafka-streams
description: >-
  Architects, deploys, and optimizes Apache Kafka event streaming architectures, stateful Kafka Streams / Faust topologies, exactly-once semantics (EOS), consumer group rebalancing, and Schema Registry serialization.
---

# Apache Kafka Event Streaming & Stream Processing

This skill guides engineering resilient, high-throughput distributed event streaming systems with Apache Kafka, covering partition key strategies, transactional exactly-once processing (EOS), stateful sliding/tumbling window joins, and Schema Registry Avro/Protobuf governance.

---

## ⚡ Core Patterns

### 1. Production Producer with Transactional Exactly-Once Semantics (EOS)

Configure idempotency, reliable acknowledgments, and transactional boundaries:

```typescript
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'order-dispatch-service',
  brokers: ['kafka-1.internal:9092', 'kafka-2.internal:9092', 'kafka-3.internal:9092'],
  ssl: true,
  logLevel: logLevel.WARN,
});

const producer = kafka.producer({
  // Idempotent producer guarantees partition deduplication and in-flight order preservation
  idempotent: true,
  maxInFlightRequests: 1,
  transactionalId: 'order-tx-producer-instance-01',
});

async function publishOrderEvent(order: { id: string; customerId: string; amount: number }) {
  await producer.connect();
  const transaction = await producer.transaction();

  try {
    await transaction.send({
      topic: 'enterprise.commerce.orders.v1',
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: order.customerId, // Ensures hash-partition ordering per customer
          value: JSON.stringify(order),
          headers: {
            'correlation-id': crypto.randomUUID(),
            'event-type': 'OrderPlaced',
            'schema-version': '1.0.0',
          },
        },
      ],
    });

    await transaction.commit();
  } catch (err) {
    await transaction.abort();
    throw err;
  }
}
```

---

### 2. High-Throughput Consumer Group with Cooperative Sticky Rebalancing

Prevent stop-the-world partition revocations during scale-up or rolling deployments:

```typescript
const consumer = kafka.consumer({
  groupId: 'order-fulfillment-workers',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  rebalanceTimeout: 60000,
  // CooperativeSticky assignor migrates only transferred partitions without halting healthy consumers
  partitionAssigners: [
    (config) => new (require('kafkajs').PartitionAssigners.cooperativeSticky)(config),
  ],
});

await consumer.connect();
await consumer.subscribe({ topic: 'enterprise.commerce.orders.v1', fromBeginning: false });

await consumer.run({
  autoCommit: false,
  eachBatchAutoResolve: false,
  eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
    for (const message of batch.messages) {
      if (!isRunning() || isStale()) break;

      try {
        const payload = JSON.parse(message.value.toString());
        await processOrderFulfillment(payload);

        // Mark individual offset for manual deterministic commit
        resolveOffset(message.offset);
        await heartbeat();
      } catch (err) {
        // Route unrecoverable poison pill to Dead-Letter Queue (DLQ)
        await publishToDLQ('enterprise.commerce.orders.dlq', message, err);
        resolveOffset(message.offset);
      }
    }
  },
});
```

---

### 3. Stateful Stream Processing (Kafka Streams / Java Topology)

Perform stateful 5-minute tumbling window aggregations with RocksDB state stores:

```java
StreamsBuilder builder = new StreamsBuilder();
KStream<String, OrderEvent> orderStream = builder.stream(
    "enterprise.commerce.orders.v1",
    Consumed.with(Serdes.String(), new JsonSerde<>(OrderEvent.class))
);

KTable<Windowed<String>, Long> orderCountsPerStore = orderStream
    .selectKey((key, order) -> order.getStoreId())
    .groupByKey(Grouped.with(Serdes.String(), new JsonSerde<>(OrderEvent.class)))
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5)))
    .count(
        Materialized.<String, Long, WindowStore<Bytes, byte[]>>as("store-order-counts-store")
            .withRetention(Duration.ofDays(1))
    );

orderCountsPerStore.toStream()
    .map((windowedKey, count) -> new KeyValue<>(windowedKey.key(), new StoreOrderSummary(windowedKey.window().start(), count)))
    .to("enterprise.commerce.store-aggregates.v1", Produced.with(Serdes.String(), new JsonSerde<>(StoreOrderSummary.class)));
```

---

## 🎯 Verification & Diagnostics

1. **Check Consumer Group Lag & Partition Distribution**:
   ```bash
   kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group order-fulfillment-workers
   ```
2. **Inspect Topic Partition Watermarks**:
   ```bash
   kafka-run-class.sh kafka.tools.GetOffsetShell --broker-list localhost:9092 --topic enterprise.commerce.orders.v1 --time -1
   ```
3. **Tail Stream Events with Header Decoding**:
   ```bash
   kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic enterprise.commerce.orders.v1 --from-beginning --property print.key=true --property print.headers=true
   ```
