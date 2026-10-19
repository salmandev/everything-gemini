---
name: cilium-ebpf-networking
description: >-
  Cloud-native eBPF networking, Kubernetes CNI replacement, transparent mutual TLS (mTLS), L7 CiliumNetworkPolicies, and Hubble network observability. Use when securing cluster traffic, eliminating kube-proxy iptables bottlenecks, or debugging service mesh latency.
---

# Cilium eBPF Networking & Security Architecture

A production runbook for deploying, configuring, and troubleshooting **Cilium eBPF**, high-performance Kubernetes networking, and deep packet observability with **Hubble**.

---

## 🎯 Architectural Advantages of eBPF

1. **Bypasses iptables / IPVS Overhead**: Programs run directly in the Linux kernel network stack (`tc` / `xdp`), providing O(1) connection routing regardless of service count.
2. **Kernel-Level Identity**: Enforces security policies based on cryptographically verified Kubernetes metadata and SPIFFE identities rather than volatile IP addresses.
3. **Transparent Encryption**: Mutual TLS (mTLS) or WireGuard encryption negotiated dynamically at the kernel layer with zero application sidecars.
4. **Hubble Observability**: Zero-overhead flow logging, DNS resolution tracking, and L7 HTTP/gRPC metrics without code instrumentation.

---

## 🚀 Helm Deployment (kube-proxy Replacement)

```bash
helm repo add cilium https://helm.cilium.io/
helm repo update

helm install cilium cilium/cilium --version 1.16.0 \
  --namespace kube-system \
  --set kubeProxyReplacement=true \
  --set k8sServiceHost=10.0.0.1 \
  --set k8sServicePort=6443 \
  --set routingMode=native \
  --set autoDirectNodeRoutes=true \
  --set bpf.masquerade=true \
  --set encryption.enabled=true \
  --set encryption.type=wireguard \
  --set hubble.enabled=true \
  --set hubble.relay.enabled=true \
  --set hubble.ui.enabled=true \
  --set hubble.metrics.enabled="{dns,drop,tcp,flow,port-distribution,icmp,httpV2:exemplars=true;labelsContext=source_ip\,source_namespace\,source_workload\,destination_ip\,destination_namespace\,destination_workload\,traffic_direction}"
```

---

## 🛡️ L7 CiliumNetworkPolicy Specification

Enforce strict Zero-Trust boundaries allowing only authorized HTTP/gRPC methods between microservices:

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: order-service-l7-policy
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: order-service
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: api-gateway
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "POST"
                path: "/v1/orders"
              - method: "GET"
                path: "/v1/orders/.*"
  egress:
    - toEndpoints:
        - matchLabels:
            app: payment-service
      toPorts:
        - ports:
            - port: "8443"
              protocol: TCP
          rules:
            http:
              - method: "POST"
                path: "/v1/charges"
    - toFQDNs:
        - matchName: "api.stripe.com"
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
```

---

## 🔍 Hubble CLI Diagnostic Workflows

The Hubble CLI provides real-time kernel packet inspection:

### 1. Tail Dropped Packets in Namespace

```bash
hubble observe --namespace production --verdict DROP -f
```

### 2. Trace HTTP Latency & 5xx Status Errors

```bash
hubble observe \
  --namespace production \
  --protocol http \
  --http-status 5.. \
  --output jsonpb | jq '{source: .flow.source.pod_name, dest: .flow.destination.pod_name, status: .flow.l7.http.code}'
```

### 3. Inspect DNS Queries and Lookup Failures

```bash
hubble observe --namespace production --protocol dns
```

---

## 📈 Prometheus Service Metrics Integration

Cilium exposes Prometheus metrics on port `9962` (agent) and `9965` (operator):

```text
cilium_forward_count_total       # Total packets forwarded through eBPF datapath
cilium_drop_count_total          # Total packets dropped by policy or checksum failure
cilium_bpf_map_pressure          # Map utilization (target: < 0.70 to avoid overflow)
hubble_flows_processed_total     # Flow event processing rate
```

---

## ⚠️ Troubleshooting & Production Checklist

1. **BPF Map Pressure Alert**:
   - Inspect active map sizing: `cilium-dbg bpf map list`.
   - If `cilium_lb4_services_v2` exceeds 80%, increase `--set bpf.lbMapMax=65536`.
2. **WireGuard Encryption Verification**:
   - Run `cilium status --verbose` and confirm `Encryption: WireGuard [Node: OK, Pod: OK]`.
3. **Kernel Version Compatibility**:
   - Requires Linux Kernel >= 5.10 for full kube-proxy replacement, and >= 5.15 for transparent mTLS encryption.
