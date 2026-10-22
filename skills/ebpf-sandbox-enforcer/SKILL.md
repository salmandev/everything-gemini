---
name: ebpf-sandbox-enforcer
description: Enforces zero-trust rootless micro-VM and eBPF kernel security boundaries for speculative agent tool executions and container sandboxes.
---

# eBPF Sandbox Enforcer & Zero-Trust Tool Isolation

Implements kernel-level zero-trust security isolation, rootless micro-VM sandboxing, Landlock filesystem restriction, and Cilium eBPF network filtering for speculative agent tool executions within Google Antigravity and Everything Gemini workflows.

---

## 1. Architecture: Kernel-Level Agent Sandboxing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   KERNEL-LEVEL AGENT SECURITY BOUNDARY                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Speculative Agent Tool Execution (`run_command`, `write_to_file`)   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. User-Space Policy Interceptor (`gemini-shield` & OPA Rego)       │   │
│   │    • Validates command AST, blocks `rm -rf`, detects token leakages │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Linux Landlock & Seccomp-BPF Syscall Filter                      │   │
│   │    • Traps unauthorized `execve`, `ptrace`, `setuid`, and `chroot`  │   │
│   │    • Restricts filesystem I/O strictly to isolated `./scratch/` dir │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Cilium eBPF Socket Filter (L3/L4/L7 Network Egress)             │   │
│   │    • Blocks outbound internet access to non-whitelisted IPs         │   │
│   │    • Allows Google Cloud APIs (`*.googleapis.com`) on TLS 443      │   │
│   │    • Drops all lateral movement probes to internal Kubernetes pods  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kernel Enforcement Mechanisms

### A. Landlock Filesystem Sandboxing
Speculative agent mutations are restricted to the local workspace directory or an ephemeral scratch area. System directories (`/etc`, `/usr`, `/root`, `~/.ssh`) are marked strictly `LANDLOCK_ACCESS_FS_READ` or completely denied:

```c
// Example Landlock ruleset structure for agent tool sandbox
#include <linux/landlock.h>
#include <sys/prctl.h>

int enforce_agent_landlock(const char *allowed_dir) {
    int ruleset_fd = landlock_create_ruleset(&ruleset_attr, sizeof(ruleset_attr), 0);
    // Add rule: allowed_dir gets read/write/truncate/execute
    // System directories remain read-only or inaccessible
    prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0);
    landlock_restrict_self(ruleset_fd, 0);
    return 0;
}
```

### B. Cilium eBPF Network Security Policy (CNP)
Prevents data exfiltration or reverse shells when the agent runs third-party build scripts or untrusted dependencies:

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "agent-tool-sandbox-egress"
spec:
  endpointSelector:
    matchLabels:
      role: "autonomous-agent-worker"
  egress:
    - toFQDNs:
        - matchPattern: "*.googleapis.com"
        - matchName: "github.com"
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
    - toEntities:
        - cluster
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
```

---

## 3. Best Practices & Isolation Checklist

1. **Rootless Execution**: Never execute autonomous agent commands as `root` (UID 0). Always run inside an unprivileged user namespace (`UID 10001`).
2. **Ephemeral Disks**: Speculative test runs must target tmpfs or overlayfs volumes that can be unmounted and discarded in $<100\text{ms}$.
3. **Audit Telemetry**: Feed eBPF syscall audit logs (`bpftool prog tracelog`) into the Mission Control UI to detect anomalous fork storms or socket scans.
