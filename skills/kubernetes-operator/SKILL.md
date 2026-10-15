---
name: kubernetes-operator
description: >-
  Use this skill when authoring Kubernetes manifests, configuring Helm charts, setting up Horizontal Pod Autoscalers (HPA), or troubleshooting container cluster deployments.
---

# Kubernetes Cluster & Workload Operations

## Overview
This skill guides the agent in writing declarative, production-ready Kubernetes manifests, configuring health probes, resource constraints, ingress controllers, and rolling update strategies.

## Procedural Workflow

### 1. Hardened Deployment Manifest Pattern
Always configure resource limits, security contexts, and liveness/readiness probes:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  labels:
    app.kubernetes.io/name: api-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
      containers:
        - name: app
          image: myregistry.azurecr.io/api-service:v1.0.0
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
```

### 2. Auto-scaling & Ingress
- **HorizontalPodAutoscaler (HPA)**: Target CPU (e.g. 70%) and Memory utilization before traffic spikes.
- **Ingress with TLS**: Annotate with cert-manager (`cert-manager.io/cluster-issuer: letsencrypt-prod`) for automated SSL lifecycle.

### 3. Triage & Debugging Commands
- Inspect crash loops: `kubectl logs -l app=api-service --tail=100 -p` (previous container logs).
- Inspect pod events: `kubectl describe pod <pod-name>`.

## Verification Checklist
- [ ] Non-root security context configured (`runAsNonRoot: true`)
- [ ] Both readiness and liveness probes defined
- [ ] Memory limits defined to prevent cluster OOM killer cascades
- [ ] Rolling update configured with zero downtime (`maxUnavailable: 0`)
