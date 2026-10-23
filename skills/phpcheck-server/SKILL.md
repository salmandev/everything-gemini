---
name: phpcheck-server
description: >-
  Audits local server, host OS, containers, and running PHP-FPM or Apache processes for PHP2Shell vulnerabilities (CVE-2026-109618 and CVE-2026-109619). Use when verifying host packages, distribution backports, and active web worker process restarts across Debian, Ubuntu, RHEL, or Alpine.
---

# PHP2Shell Server-Side Patch Auditor (`phpcheck-server`)

Provides comprehensive host-level and container-level auditing runbooks to verify remediation of the critical PHP2Shell vulnerabilities (**CVE-2026-109618** and **CVE-2026-109619**).

## When to Use
- When you have SSH, terminal, or container access to web servers running PHP.
- When verifying whether an `apt upgrade` or `dnf update` actually remediated the vulnerability or if running PHP-FPM / Apache workers are still executing vulnerable unlinked binaries in RAM.
- When validating vendor-specific security backports on LTS distributions (Debian, Ubuntu Pro, RHEL).

## Automated Server Audit Script
Execute the included server audit helper:
```bash
bash skills/phpcheck-server/scripts/audit-server.sh
bash skills/phpcheck-server/scripts/audit-server.sh --json
```

Or via Everything Gemini CLI:
```bash
everything-gemini phpcheck --server
everything-gemini phpcheck --server --json
```

---

## Step-by-Step Triage Runbook

### Step 1: Identify the Active Serving Runtime
Do not rely solely on the CLI binary (`php -v`), as the CLI binary often differs from the active worker pool (PHP-FPM, Apache `mod_php`, or Docker container).

```bash
# Check running FPM or web server processes
ps aux | grep -E 'php-fpm|apache2|httpd'

# Identify exact binary path for running worker
ls -l /proc/$(pgrep -f php-fpm | head -n1)/exe
```

### Step 2: Check for the "Unlinked Worker" RAM Trap
If packages were upgraded on disk while daemons remained running, worker processes continue executing vulnerable code from RAM:
```bash
# Detect processes holding deleted shared libraries or binaries
ls -l /proc/*/exe 2>/dev/null | grep -E '(php|apache|httpd).*\(deleted\)'
```
If output is returned, you **must immediately restart the worker pool**:
```bash
sudo systemctl restart 'php*-fpm' || sudo systemctl restart apache2
```

---

## Vendor Fixed Package Matrix

### 1. Debian
Use `dpkg-query -W -f='${Package} ${Version}\n' 'php*'` to inspect installed packages.

| Debian Release | PHP Package | Fixed Package Version | Advisory |
| :--- | :--- | :--- | :--- |
| Debian 12 (bookworm) | `php8.2-fpm` | `8.2.35-1~deb12u1` | [DLA-4848-1](https://security-tracker.debian.org/tracker/DLA-4848-1) |
| Debian 13 (trixie) | `php8.4-fpm` | `8.4.27-1~deb13u1` | [DSA-6574-1](https://security-tracker.debian.org/tracker/DSA-6574-1) |

### 2. Ubuntu
Use `dpkg-query` to verify package revisions against Canonical Security Notices:

| Ubuntu Release | PHP Package | Fixed Package Version | Advisory |
| :--- | :--- | :--- | :--- |
| Ubuntu 26.10 | `php8.5` | `8.5.9-0ubuntu2.1` | [USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1) |
| Ubuntu 26.04 LTS | `php8.5` | `8.5.4-0ubuntu1.5` | [USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1) |
| Ubuntu 24.04 LTS | `php8.3` | `8.3.6-0ubuntu0.24.04.13` | [USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1) |
| Ubuntu 22.04 LTS | `php8.1` | `8.1.2-1ubuntu2.28` | [USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1) |
| Ubuntu 20.04 LTS (Pro) | `php7.4` | `7.4.3-4ubuntu2.29+esm5` | [USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2) |
| Ubuntu 18.04 LTS (Pro) | `php7.2` | `7.2.24-0ubuntu0.18.04.17+esm14`| [USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2) |
| Ubuntu 16.04 LTS (Pro) | `php7.0` | `7.0.33-0ubuntu0.16.04.16+esm22`| [USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2) |
| Ubuntu 14.04 LTS (Pro) | `php5` | `5.5.9+dfsg-1ubuntu4.29+esm18` | [USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2) |

### 3. Red Hat Enterprise Linux (RHEL / CentOS / Rocky)
Use `rpm -q --queryformat '%{NAME} %{EPOCHNUM}:%{VERSION}-%{RELEASE}.%{ARCH} %{VENDOR}\n' <package>`:

| RHEL Release & Stream | Fixed Package Version | Advisory |
| :--- | :--- | :--- |
| RHEL 8.10 (PHP 7.4 stream) | `7.4.33-8.module+el8.10.0+25117+30337cca` | [RHSA-2026:87080](https://access.redhat.com/errata/RHSA-2026:87080) |
| RHEL 9.8 (PHP 8.0 stream) | `8.0.30-8.el9_8.1` | [RHSA-2026:87151](https://access.redhat.com/errata/RHSA-2026:87151) |

### 4. Upstream Source Builds & Docker Images
For custom builds or official Docker containers (`php:8.3-fpm`, `php:8.2-apache`), ensure the source release meets:
- **PHP 8.2**: `8.2.35+`
- **PHP 8.3**: `8.3.36+`
- **PHP 8.4**: `8.4.27+`
- **PHP 8.5**: `8.5.12+`

---

## Post-Remediation Verification Checklist
- [ ] Operating system packages updated to or above vendor advisory revision.
- [ ] Web worker service (`php-fpm`, `apache2`, `caddy`) cleanly restarted.
- [ ] No `(deleted)` references remain in `/proc/*/exe` or `lsof`.
- [ ] Remote banner verified using [phpcheck-url](file:///Users/salmanshaikh/development/github/everything-gemini/skills/phpcheck-url/SKILL.md) or sanitized to omit verbose version disclosures.
