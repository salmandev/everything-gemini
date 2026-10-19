---
name: keda-event-autoscaling
description: Architects and configures Kubernetes Event-driven Autoscaling (KEDA) ScaledObjects, ScaledJobs, and event triggers for automated scale-to-zero and burst workloads.
---

# KEDA Event-Driven Autoscaling

Configures Kubernetes Event-driven Autoscaling (KEDA) to dynamically scale workloads from 0 to N replicas based on external event queues, metrics streams, and consumer lag.

---

## 1. Core Architecture

```
 External Event Source          KEDA Operator              Kubernetes Runtime
┌──────────────────────┐     ┌───────────────────┐     ┌──────────────────────┐
│ Kafka / Redis / SQS  │────>│ keda-metrics-apiserver ──────>│ HorizontalPodAutoscaler │
│ Prometheus / PubSub  │     │ (Metrics Provider)│     │ (Target Replicas)    │
└──────────────────────┘     └─────────┬─────────┘     └──────────┬───────────┘
                                       │                          │
                             ┌─────────▼─────────┐     ┌──────────▼───────────┐
                             │ ScaledObject CRD  │────>│ Scaled Deployment    │
                             │ (0 <-> 1 Replica) │     │ (Min: 0, Max: 50)    │
                             └───────────────────┘     └──────────────────────┘
```

- **Metrics Server**: Translates external trigger metrics into standard Kubernetes custom metrics for the native HPA.
- **Scale to Zero (0 -> 1)**: Handled directly by KEDA controller activating idle deployments when events arrive.
- **Scale Beyond One (1 -> N)**: Handled by native Kubernetes HPA driven by KEDA external metrics.

---

## 2. Kafka Consumer Lag ScaledObject

Scales pod replicas based on consumer group topic lag with secure secret authentication:

```yaml
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: kafka-trigger-auth
  namespace: production
spec:
  secretTargetRef:
    - parameter: sasl
      name: kafka-credentials
      key: sasl-mechanism
    - parameter: username
      name: kafka-credentials
      key: sasl-username
    - parameter: password
      name: kafka-credentials
      key: sasl-password
---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-processor-scaler
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-processor
  pollingInterval: 15
  cooldownPeriod: 120
  idleReplicaCount: 0
  minReplicaCount: 1
  maxReplicaCount: 40
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          stabilizationWindowSeconds: 300
          policies:
            - type: Percent
              value: 20
              periodSeconds: 60
        scaleUp:
          stabilizationWindowSeconds: 0
          policies:
            - type: Percent
              value: 100
              periodSeconds: 15
  triggers:
    - type: kafka
      metadata:
        bootstrapServers: kafka-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092
        consumerGroup: order-processor-group
        topic: orders.v1
        lagThreshold: "100"
        activationLagThreshold: "1"
      authenticationRef:
        name: kafka-trigger-auth
```

---

## 3. Redis Queue & Stream ScaledObject

Scales Celery or BullMQ worker queues dynamically based on pending queue length:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: celery-worker-scaler
  namespace: production
spec:
  scaleTargetRef:
    name: celery-worker
  minReplicaCount: 0
  maxReplicaCount: 20
  pollingInterval: 10
  cooldownPeriod: 60
  triggers:
    - type: redis
      metadata:
        address: redis-cluster.cache.svc.cluster.local:6379
        listName: celery
        listLength: "50"
        activationListLength: "1"
        enableTLS: "true"
      authenticationRef:
        name: redis-trigger-auth
```

---

## 4. ScaledJob for Finite Batch Workloads

Spawns isolated Kubernetes Jobs for batch or run-to-completion work (1 job per event):

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledJob
metadata:
  name: heavy-video-transcoder
  namespace: batch
spec:
  jobTargetRef:
    parallelism: 1
    completions: 1
    activeDeadlineSeconds: 1800
    backoffLimit: 2
    template:
      spec:
        restartPolicy: OnFailure
        containers:
          - name: transcoder
            image: registry.example.com/video-transcoder:v2.0.0
            resources:
              requests:
                cpu: "2"
                memory: 4Gi
  pollingInterval: 30
  successfulJobsHistoryLimit: 5
  failedJobsHistoryLimit: 10
  maxReplicaCount: 25
  scalingStrategy:
    strategy: "custom"
    customScalingQueueLengthDeduction: 1
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123456789012/transcode-jobs
        queueLength: "1"
        awsRegion: us-east-1
      authenticationRef:
        name: keda-aws-auth
```

---

## 5. Prometheus Custom Metric Scaler

Scales HTTP microservices on rate of requests (RPS) or error ratios:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: api-service-scaler
  namespace: production
spec:
  scaleTargetRef:
    name: api-gateway
  minReplicaCount: 3
  maxReplicaCount: 50
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://prometheus-k8s.monitoring.svc:9090
        metricName: http_requests_total_rate
        query: sum(rate(http_requests_total{job="api-gateway", status=~"2.."}[2m]))
        threshold: "500"
```

---

## 6. Verification and Troubleshooting

```bash
# Check status and current active state of ScaledObjects
kubectl get scaledobject -n production
kubectl describe scaledobject order-processor-scaler -n production

# Inspect generated HPA and custom metrics
kubectl get hpa -n production
kubectl describe hpa keda-hpa-order-processor-scaler -n production

# View KEDA Operator and Metrics Server logs
kubectl logs -n keda -l app=keda-operator -f
kubectl logs -n keda -l app=keda-operator-metrics-apiserver -f

# Verify custom metrics registered in K8s APIServer
kubectl get --raw "/apis/external.metrics.k8s.io/v1beta1" | jq .
```
