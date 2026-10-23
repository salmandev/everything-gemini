---
name: ebpf-microvm-sandbox
description: Enforces rootless ephemeral Micro-VM isolation, Linux Landlock filesystem jails, and Cilium eBPF network filtering for zero-trust speculative tool and code execution.
---

# eBPF Micro-VM Sandbox (`ebpf-microvm-sandbox`)

Provides kernel-enforced rootless ephemeral Micro-VM isolation (Firecracker and gVisor), Linux Landlock path jails, seccomp-bpf syscall filtering, and Cilium eBPF network security for untrusted, speculative tool execution in Google Antigravity and Gemini agent loops.

---

## 1. Architectural Model: Kernel-Enforced Isolation Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ZERO-TRUST AGENT SANDBOX RUNTIME                         │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Antigravity Agent Runtime (Host Process)                         │   │
│   │    • Speculative tool proposal (e.g. `run_command`, `eval_python`)  │   │
│   │    • Intercepted by PreToolUse Lifecycle Security Hook              │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. OPA Policy Gatekeeper & Sandbox Dispatcher                       │   │
│   │    • Validates command safety signature and environment constraints │   │
│   │    • Allocates ephemeral rootless micro-VM workspace                │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Ephemeral Micro-VM Jail (Firecracker / gVisor runsc)              │   │
│   │    ┌────────────────────────────────────────────────────────────┐   │   │
│   │    │ A. Filesystem: Linux Landlock V4 ephemeral copy-on-write   │   │   │
│   │    │    • Host files outside sandbox mounted READ-ONLY          │   │   │
│   │    │    • Temp workdir deleted on tool completion               │   │   │
│   │    ├────────────────────────────────────────────────────────────┤   │   │
│   │    │ B. Syscalls: Strict Seccomp-BPF whitelist filter           │   │   │
│   │    │    • Blocks ptrace, mount, bpf, reboot, setuid, unshare    │   │   │
│   │    ├────────────────────────────────────────────────────────────┤   │   │
│   │    │ C. Network: Cilium eBPF Socket Filtering & Egress Policy   │   │   │
│   │    │    • Strict CIDR whitelist (e.g. npmjs, pypi, googleapis)  │   │   │
│   │    │    • Blocks RFC 1918 internal subnets & cloud metadata IPs │   │   │
│   │    └────────────────────────────────────────────────────────────┘   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Execution Telemetry & Differential Sync                          │   │
│   │    • Captured stdout, stderr, exit code, and modified file diffs    │   │
│   │    • Automatic rollback on policy violation or timeout abort        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kernel Security Primitives

### A. Linux Landlock V4 Path Rules
- Speculative tools receive scoped path access:
  - `LANDLOCK_ACCESS_FS_READ`: Allowed on workspace root.
  - `LANDLOCK_ACCESS_FS_WRITE`: Confined strictly to `/tmp/agent-sandbox/<execution-id>`.
  - Sensitive paths (`~/.ssh`, `~/.aws`, `~/.config/gcloud`, `/etc/shadow`) are masked with empty dummy inodes.

### B. Seccomp-BPF Syscall Restriction
- The sandbox enforces an allow-list BPF program at `execve`:
  ```text
  ALLOWED: read, write, openat, close, fstat, lseek, mmap, mprotect, munmap, brk, exit_group
  DENIED (SIGKILL): ptrace, process_vm_readv, init_module, kexec_load, bpf, clone(NEWUSER)
  ```

### C. Cilium eBPF Network Quarantine
- Egress is strictly blocked to Cloud Metadata Endpoints:
  - `169.254.169.254/32` (AWS/GCP Instance Metadata Service)
  - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Internal LAN)
- Only TLS port 443 egress to explicit DNS-validated dependency endpoints is permitted.

---

## 3. Operational Recipes

### Launching an Isolated Speculative Command
```bash
# Verify sandbox status and host kernel security primitives
everything-gemini doctor --profile full

# Run speculative untrusted build in micro-VM jail
everything-gemini resilience inject --target "speculative-build" --sandbox microvm
```

### Landlock Python Runner Pattern
```python
from google_antigravity.security import EphemeralMicroVMSandbox

with EphemeralMicroVMSandbox(
    memory_mb=512,
    cpu_limit=1.0,
    allow_network=False,
    timeout_sec=30
) as sandbox:
    result = sandbox.exec(["python3", "-c", "import os; print(os.listdir('.'))"])
    print(f"Sandbox Exit Code: {result.exit_code}")
    print(f"Sandbox Output: {result.stdout}")
```

---

## 4. Cross-Reference & Links
- See [skills/ebpf-sandbox-enforcer/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/ebpf-sandbox-enforcer/SKILL.md) for Landlock baseline rules.
- See [skills/opa-gatekeeper-policy/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/opa-gatekeeper-policy/SKILL.md) for OPA policy syntax.
- See [agents/security-auditor.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/security-auditor.md) for automated vulnerability auditing.
