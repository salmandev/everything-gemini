---
name: pubsub-event-mesh
description: Implements Google Cloud Pub/Sub asynchronous event mesh architectures, exactly-once delivery, dead-letter queues, and schema-validated multi-agent message routing.
---

# Google Cloud Pub/Sub Multi-Agent Event Mesh

Architects and deploys scalable, decoupled asynchronous messaging pipelines for autonomous multi-agent coordination using Google Cloud Pub/Sub. Covers dead-letter queues (DLQ), exactly-once delivery, schema validation (Protobuf / Avro), and resilient streaming subscribers.

---

## 1. Architecture: Multi-Agent Asynchronous Event Mesh

```
                     Google Cloud Pub/Sub Event Mesh
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AGENT WORKFLOW BUS                             │
│                                                                             │
│   ┌─────────────────────┐                   ┌───────────────────────────┐   │
│   │ Subagent Initiator  │                   │ Schema Validator          │   │
│   │ (e.g. Planner)      │                   │ (Protobuf / Avro Message) │   │
│   └──────────┬──────────┘                   └─────────────┬─────────────┘   │
│              │                                            │                 │
│              ▼                                            ▼                 │
│       [topic: agent-tasks] ───────────────────────► [topic: agent-tasks]    │
│              │                                                              │
│              ├─────────────────────────────┬────────────────────────────┐   │
│              ▼                             ▼                            ▼   │
│   ┌──────────────────────┐      ┌──────────────────────┐     ┌──────────┴─┐ │
│   │ Subscription:        │      │ Subscription:        │     │ DLQ Topic: │ │
│   │ Code Reviewer Agent  │      │ Security Audit Agent │     │ agent-dlq  │ │
│   │ (Exactly-Once Ack)   │      │ (Streaming Pull)     │     │ (Max Retries)│
│   └──────────────────────┘      └──────────────────────┘     └────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Setup (`gcloud`)

Provision an enterprise topic with Dead-Letter Queue (DLQ) isolation and exactly-once delivery:

```bash
# 1. Create Dead-Letter Queue (DLQ) topic and subscription for failed task events
gcloud pubsub topics create agent-task-dlq
gcloud pubsub subscriptions create agent-task-dlq-sub --topic=agent-task-dlq

# 2. Create primary agent task topic
gcloud pubsub topics create agent-task-bus \
  --message-retention-duration=7d

# 3. Create consumer subscription with exactly-once delivery and DLQ routing
gcloud pubsub subscriptions create code-reviewer-sub \
  --topic=agent-task-bus \
  --ack-deadline=120 \
  --enable-exactly-once-delivery \
  --dead-letter-topic=agent-task-dlq \
  --max-delivery-attempts=5 \
  --min-retry-delay=10s \
  --max-retry-delay=600s
```

---

## 3. Python Event Mesh Publisher

Publishes structured multi-agent execution events with idempotency ordering keys and tracing attributes:

```python
import json
import uuid
from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path("my_project", "agent-task-bus")

def publish_agent_task(
    task_id: str,
    target_agent: str,
    payload: dict,
    correlation_id: str = None
) -> str:
    """Publishes an agent task with ordering key and strict metadata tags."""
    correlation_id = correlation_id or str(uuid.uuid4())
    
    message_data = json.dumps({
        "taskId": task_id,
        "targetAgent": target_agent,
        "payload": payload,
        "timestamp": "2026-10-21T11:00:00Z"
    }).encode("utf-8")

    # Publish with attributes for server-side subscription filtering
    future = publisher.publish(
        topic_path,
        data=message_data,
        target_agent=target_agent,
        correlation_id=correlation_id,
        ordering_key=task_id  # Ensures sequential processing for the same task
    )
    
    message_id = future.result()
    print(f"🚀 Published task {task_id} to Pub/Sub (Msg ID: {message_id})")
    return message_id
```

---

## 4. Streaming Pull Subscriber with Backpressure

Consumes tasks asynchronously, processes execution via subagents, and deterministically acknowledges messages:

```python
from google.cloud import pubsub_v1
import time

subscriber = pubsub_v1.SubscriberClient()
sub_path = subscriber.subscription_path("my_project", "code-reviewer-sub")

def callback(message: pubsub_v1.subscriber.message.Message):
    print(f"📥 Received task event: {message.message_id}")
    task_payload = json.loads(message.data.decode("utf-8"))
    
    try:
        # Execute agent task logic
        print(f"🤖 Processing task for {task_payload.get('targetAgent')}...")
        # (Invoke subagent logic here)
        
        # Acknowledge receipt upon successful execution
        message.ack()
        print(f"✅ Successfully acknowledged message {message.message_id}")
    except Exception as exc:
        print(f"❌ Task processing failed: {exc}")
        # Negative acknowledgment triggers retry / DLQ forwarding
        message.nack()

# Configure flow control to prevent memory exhaustion during spikes
flow_control = pubsub_v1.types.FlowControl(
    max_messages=10,
    max_bytes=50 * 1024 * 1024  # 50MB
)

streaming_pull = subscriber.subscribe(
    sub_path,
    callback=callback,
    flow_control=flow_control
)

print(f"🎧 Listening for agent tasks on {sub_path}...")
try:
    streaming_pull.result()
except KeyboardInterrupt:
    streaming_pull.cancel()
```

---

## 5. Subscription-Level Filtering

Avoid spinning up unnecessary subagents by filtering messages at the Pub/Sub server level:

```bash
# Create subscription that ONLY receives tasks addressed to 'security-auditor'
gcloud pubsub subscriptions create security-auditor-sub \
  --topic=agent-task-bus \
  --message-filter='attributes.target_agent = "security-auditor"' \
  --enable-exactly-once-delivery
```

---

## 6. Resilience & Anti-Patterns Checklist

| Category | Recommended Pattern | Anti-Pattern |
| :--- | :--- | :--- |
| **Delivery Guarantee** | Enable `--enable-exactly-once-delivery` for state mutation events | Using default at-least-once for irreversible codebase commits |
| **Dead Lettering** | Always bind `--dead-letter-topic` with `--max-delivery-attempts=5` | Infinite retry loops crashing worker containers on poisoned tasks |
| **Flow Control** | Restrict concurrent in-flight messages with `FlowControl(max_messages=10)` | Unbounded pulling leading to OOM kills during burst invocations |
| **Ordering** | Use `ordering_key` when tasks depend on prerequisite steps | Random partition dispatch causing out-of-order build/deploy tasks |
