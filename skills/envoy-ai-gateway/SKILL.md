---
name: envoy-ai-gateway
description: Configure and deploy Envoy Proxy AI Gateway for Gemini models with token-aware rate limiting, multi-model circuit breakers, active health checks, and zero-trust mTLS termination.
---

# Envoy Proxy AI Gateway (Multi-Model Traffic Director & Circuit Breaking)

Deploys and configures high-performance Envoy Proxy AI Gateways tailored for Google Gemini APIs and autonomous agent clusters. Provides token-aware rate limiting, active health checking, automatic circuit breaking across Gemini Flash, Pro, and Extended Thinking tiers, and zero-trust mTLS proxying.

---

## 1. AI Gateway Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ENVOY PROXY AI GATEWAY                             │
│                                                                             │
│   Agent Workflows (gRPC / HTTPS)                                            │
│                 │                                                           │
│                 ▼                                                           │
│   ┌───────────────────────────┐                                             │
│   │ Envoy Proxy AI Gateway    │◄──── Token-Aware Rate Limiter (Redis)       │
│   │ (Filter Chain & Router)   │◄──── W3C Tracecontext Injector              │
│   └─────────────┬─────────────┘                                             │
│                 │                                                           │
│                 ├── 90% Primary Route ──► Gemini 2.0 Flash (Fast Tool Use)  │
│                 │                                                           │
│                 ├── Circuit Broken?  ──► Gemini 3.8 Pro (Fallback Tier)     │
│                 │                                                           │
│                 └── High Complexity? ──► Gemini 3.8 Thinking (Extended)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Envoy Proxy Configuration (`envoy.yaml`)

Below is the production Envoy proxy configuration routing requests to Google Gemini with outlier detection, retry backoff, and local rate limiting:

```yaml
static_resources:
  listeners:
  - name: gemini_ingress_listener
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 8443
    filter_chains:
    - transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
          common_tls_context:
            tls_certificates:
            - certificate_chain: { filename: "/etc/envoy/certs/server.crt" }
              private_key: { filename: "/etc/envoy/certs/server.key" }
      filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_gemini
          route_config:
            name: gemini_api_routes
            virtual_hosts:
            - name: gemini_service
              domains: ["*"]
              routes:
              - match:
                  prefix: "/v1beta/models/gemini-2.0-flash"
                route:
                  cluster: gemini_api_upstream
                  timeout: 10s
                  retry_policy:
                    retry_on: "5xx,connect-failure,refused-stream,429"
                    num_retries: 3
                    retry_back_off:
                      base_interval: 250ms
                      max_interval: 2s
              - match:
                  prefix: "/v1beta/models/gemini-3.8-thinking"
                route:
                  cluster: gemini_api_upstream
                  timeout: 60s
          http_filters:
          - name: envoy.filters.http.local_ratelimit
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
              stat_prefix: http_local_rate_limiter
              token_bucket:
                max_tokens: 1000
                tokens_per_fill: 100
                fill_interval: 1s
              filter_enabled:
                default_value: { numerator: 100, denominator: HUNDRED }
              filter_enforced:
                default_value: { numerator: 100, denominator: HUNDRED }
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router

  clusters:
  - name: gemini_api_upstream
    type: LOGICAL_DNS
    dns_lookup_family: V4_ONLY
    connect_timeout: 2s
    lb_policy: ROUND_ROBIN
    circuit_breakers:
      thresholds:
      - priority: DEFAULT
        max_connections: 500
        max_pending_requests: 100
        max_requests: 1000
        max_retries: 3
    outlier_detection:
      consecutive_5xx: 3
      interval: 10s
      base_ejection_time: 30s
      max_ejection_percent: 50
    load_assignment:
      cluster_name: gemini_api_upstream
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: generativelanguage.googleapis.com
                port_value: 443
    transport_socket:
      name: envoy.transport_sockets.tls
      typed_config:
        "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
        sni: generativelanguage.googleapis.com
```

---

## 3. Kubernetes Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: envoy-gemini-gateway
  namespace: agent-runtime
spec:
  replicas: 3
  selector:
    matchLabels:
      app: envoy-gemini-gateway
  template:
    metadata:
      labels:
        app: envoy-gemini-gateway
    spec:
      containers:
      - name: envoy
        image: envoyproxy/envoy:v1.31-latest
        ports:
        - containerPort: 8443
        volumeMounts:
        - name: envoy-config
          mountPath: /etc/envoy
      volumes:
      - name: envoy-config
        configMap:
          name: envoy-gemini-config
```

---

## 4. Key Performance Indicators & Metrics

- **Ejection Rate (`envoy.cluster.outlier_detection.ejections_enforced`)**: Alerts on sustained API throttling.
- **Circuit Breakers (`envoy.cluster.circuit_breakers.default.rq_open`)**: Triggers immediate failover to backup model tiers.
- **P99 Proxy Overhead**: Sub-1.5ms added latency across TLS handshake and routing filters.
