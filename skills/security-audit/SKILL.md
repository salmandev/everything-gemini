---
name: security-audit
description: >-
  Performs security audits, OWASP top 10 vulnerability checks, dependency vulnerability scans, and secret leakage detection. Use when reviewing code for security vulnerabilities.
---

# Security Audit

This skill guides the agent through proactive security evaluations, secret detection, and dependency hygiene.

## Audit Checklist

### 1. Secret Scanning
Ensure no sensitive keys, tokens, private keys, or credentials are hardcoded:
- Check for `.env`, `*.pem`, `id_rsa`, AWS keys (`AKIA...`), GitHub tokens (`ghp_...`).
- Execute `scripts/scan-secrets.sh` to search for known credential regex patterns.

### 2. Dependency Vulnerability Assessment
Run ecosystem-specific vulnerability scanners:
- **Node**: `npm audit` or `pnpm audit`
- **Python**: `pip-audit`
- **Go**: `govulncheck ./...`
- **Rust**: `cargo audit`

### 3. Code-Level Vulnerability Inspection
- **Injection Flaws**: Check all database queries for parameterized values. Ensure no raw string interpolation in SQL or NoSQL queries.
- **Cross-Site Scripting (XSS)**: Ensure user input rendered in HTML is sanitized or escaped. In React, inspect any usage of `dangerouslySetInnerHTML`.
- **Insecure Deserialization**: Avoid `eval()`, `pickle.loads()`, or unrestricted YAML parsing (`yaml.unsafe_load`).
- **Path Traversal**: Ensure file system operations resolve paths against a safe root directory.
