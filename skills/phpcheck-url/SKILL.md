---
name: phpcheck-url
description: >-
  Inspects remote website HTTP headers (Server, X-Powered-By) to audit advertised PHP versions for PHP2Shell vulnerabilities (CVE-2026-109618 and CVE-2026-109619). Use when assessing external web endpoints or public URLs without server access.
---

# PHP2Shell URL Version Checker (`phpcheck-url`)

A non-intrusive, zero-exploit defensive auditing skill that verifies whether a remote HTTP/HTTPS target advertises a PHP runtime affected by the critical PHP2Shell vulnerabilities (**CVE-2026-109618** and **CVE-2026-109619**).

## When to Use
- When auditing public web assets, domains, or client applications for exposed, unpatched PHP versions.
- When performing pre-flight security reconnaissance prior to full credentialed server audits.
- When verifying if reverse proxy headers (`Server`, `X-Powered-By`) expose outdated PHP banners.

## How It Works
1. Issues a non-intrusive `HEAD` request (falling back to `GET` only on HTTP 405 Method Not Allowed or 501 Not Implemented).
2. Parses `Server` and `X-Powered-By` response headers for PHP version strings.
3. Compares the advertised version against upstream patch releases and known end-of-life branches:
   - **Fixed Upstream Releases**: `8.2.35`, `8.3.36`, `8.4.27`, `8.5.12`
   - **Vulnerable EOL Branches**: `5.4`, `5.5`, `5.6`, `7.0`, `7.1`, `7.2`, `7.3`, `7.4`, `8.0`, `8.1`
4. Returns standardized exit codes and diagnostic JSON reports.

> [!IMPORTANT]
> This skill is strictly defensive and does **not** send exploit payloads, memory-corrupting packets, or crash probes. An `OK` header status indicates an advertised patched version, but server-side verification using [phpcheck-server](file:///Users/salmanshaikh/development/github/everything-gemini/skills/phpcheck-server/SKILL.md) is necessary to confirm active worker binaries.

## Usage

### Run via Everything Gemini CLI
```bash
everything-gemini phpcheck "https://example.com"
everything-gemini phpcheck "https://example.com" --json
```

### Run Script Directly
```bash
node skills/phpcheck-url/scripts/phpcheck.js "https://example.com"
node skills/phpcheck-url/scripts/phpcheck.js "https://example.com" --json --timeout 15
```

## Exit Codes & Output Contract

| Exit Code | Result | Meaning |
| :--- | :--- | :--- |
| `0` | `OK` | Advertised version meets or exceeds an upstream fixed release (`8.2.35`, `8.3.36`, `8.4.27`, `8.5.12`). |
| `1` | `POTENTIALLY VULNERABLE` | Advertised version is lower than upstream fix or belongs to an EOL branch (5.x, 7.x, 8.0, 8.1). |
| `2` | `ERROR` | Invalid arguments, syntax error, or unsupported scheme. |
| `3` | `UNKNOWN` | Headers do not disclose a PHP version, headers are stripped/hidden, or request timed out. |

## JSON Output Structure
When executed with `--json`, the script returns structured telemetry:
```json
{
  "cves": ["CVE-2026-109618", "CVE-2026-109619"],
  "target": "https://example.com",
  "patch_status": "potentially_vulnerable",
  "php_version": "8.1.2",
  "reason": "PHP 8.1.2: Potentially vulnerable. HTTP headers cannot verify whether backported security patches exist. Check server package directly.",
  "fixed_upstream_releases": {
    "8.2": 35,
    "8.3": 36,
    "8.4": 27,
    "8.5": 12
  },
  "exit_code": 1
}
```

## Related Skills
- [phpcheck-server](file:///Users/salmanshaikh/development/github/everything-gemini/skills/phpcheck-server/SKILL.md) - Deep server-side package, worker, and container patch verification.
- [php2shell-version-auditor](file:///Users/salmanshaikh/development/github/everything-gemini/skills/php2shell-version-auditor/SKILL.md) - Master triage runbook for enterprise fleets.
- [security-audit](file:///Users/salmanshaikh/development/github/everything-gemini/skills/security-audit/SKILL.md) - General code, dependency, and vulnerability analysis.
