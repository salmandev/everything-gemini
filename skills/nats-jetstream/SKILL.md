---
name: nats-jetstream
description: >-
  Architects, publishes, and consumes ultra-low latency event streams with NATS JetStream, configuring stream retention, message deduplication, durable consumer groups, and KV buckets.
---

# NATS JetStream Architecture & High-Speed Event Streaming

This skill guides building resilient, cloud-native event-driven architectures with NATS JetStream, delivering high throughput, sub-millisecond latencies, and at-least-once delivery semantics.

---

## ⚡ Core Concepts: Core NATS vs. JetStream

| Feature | Core NATS | NATS JetStream |
| :--- | :--- | :--- |
| **Delivery Model** | At-most-once (Fire & Forget) | At-least-once / Exactly-once (via deduplication) |
| **Persistence** | In-memory only (ephemeral) | File / Memory persistent disk storage |
| **Consumer State**| None (real-time listeners only)| Durable cursors with acknowledgments & replays |
| **Flow Control** | TCP backpressure only | Consumer ack wait, max deliver limits, backoffs |

---

## 🏗️ Stream Definition & Deduplication (TypeScript)

Configure streams with subject patterns and deduplication windows:

```typescript
import { connect, JSONCodec, RetentionPolicy, StorageType } from 'nats';

const nc = await connect({ servers: process.env.NATS_URL || 'localhost:4222' });
const jsm = await nc.jetstreamManager();
const jc = JSONCodec();

// Create or update stream
await jsm.streams.add({
  name: 'ORDERS',
  subjects: ['orders.>'],
  storage: StorageType.File,
  retention: RetentionPolicy.Limits,
  max_age: 7 * 24 * 60 * 60 * 1e9, // 7 days in nanoseconds
  duplicate_window: 120 * 1e9,      // 2 minutes deduplication window
});
```

---

## 📤 Publishing with Message Deduplication

Provide a unique `Nats-Msg-Id` header to guarantee idempotent delivery even during network retries:

```typescript
import { headers } from 'nats';

const js = nc.jetstream();

export async function publishOrderEvent(orderId: string, payload: Record<string, any>) {
  const h = headers();
  // Server drops duplicates published with the same ID within the duplicate_window
  h.append('Nats-Msg-Id', `order-${orderId}-${payload.status}`);

  const ack = await js.publish(`orders.${payload.region}.${orderId}`, jc.encode(payload), {
    headers: h,
  });

  return ack.seq;
}
```

---

## 📥 Durable Pull Consumers (High-Throughput Worker Pools)

Pull consumers give workers complete control over processing speed and batch sizes:

```typescript
import { AckPolicy } from 'nats';

export async function startOrderWorker() {
  const js = nc.jetstream();

  // Create or bind durable consumer
  const consumer = await js.consumers.get('ORDERS', 'order-fulfillment-workers');

  while (true) {
    // Pull up to 25 messages, waiting at most 2 seconds
    const batch = await consumer.fetch({ max_messages: 25, expires: 2000 });

    for await (const msg of batch) {
      try {
        const orderData = jc.decode(msg.data);
        console.log(`Processing Order seq ${msg.seq}:`, orderData);

        // Acknowledge successful processing
        msg.ack();
      } catch (err) {
        // Negative acknowledgment: triggers redelivery based on backoff
        msg.nak();
      }
    }
  }
}
```

---

## 🗄️ NATS Key-Value (KV) Buckets

Use JetStream KV buckets for distributed application configuration and state:

```typescript
const kv = await js.views.kv('app-configuration');

// Set configuration
await kv.put('features.dark_mode', jc.encode({ enabled: true }));

// Watch for real-time configuration changes across all pods
const watcher = await kv.watch({ key: 'features.*' });
for await (const entry of watcher) {
  console.log(`Config updated: ${entry.key} =`, jc.decode(entry.value));
}
```
