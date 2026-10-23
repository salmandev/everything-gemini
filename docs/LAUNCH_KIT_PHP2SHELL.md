# 📢 PHP2Shell Security Advisory & Social Media Launch Kit

> **Campaign Theme**: Immediate, non-intrusive defensive auditing for PHP2Shell (CVE-2026-109618 & CVE-2026-109619).  
> **Target Audience**: Sysadmins, DevOps engineers, SecOps/InfoSec teams, CTOs, and PHP developers worldwide.  
> **Key Utility**: Zero-install 10-second inspection command via `npx everything-gemini phpcheck <url|--server>`.

---

## 🎯 Executive Summary for Posts

On October 21, 2026, the PHP core security team disclosed two critical security vulnerabilities dubbed **PHP2Shell**:
- **CVE-2026-109618**: Remote memory corruption and execution vulnerability in stream handling and buffer boundaries.
- **CVE-2026-109619**: Out-of-bounds read and memory disclosure enabling authorization bypass or remote execution.
- **Severity**: CVSS 9.2 (Critical Remote Code Execution / Memory Disclosure).
- **Fixed Upstream Releases**: `8.2.35`, `8.3.36`, `8.4.27`, `8.5.12`.
- **Inherently Vulnerable EOL Branches**: `5.4`–`5.6`, `7.0`–`7.4`, `8.0`, `8.1` (unless patched with Linux vendor enterprise backports).
- **The #1 Real-World Risk**: Admins run `apt upgrade` or `dnf update`, updating the binary on disk, but running `php-fpm` or Apache worker processes **continue executing unpatched vulnerable code from RAM** until explicitly restarted.

---

## 🐦 Platform 1: X (Twitter) Viral Thread

### Tweet 1 (The Hook)
🚨 **CRITICAL SECURITY ALERT: PHP2Shell (CVE-2026-109618 / CVE-2026-109619)** 🚨

If you run PHP in production, you might be exposed to an active CVSS 9.2 Remote Code Execution flaw.

Even worse: running `apt update && apt upgrade` might NOT have protected you.

Here is what you need to know and how to test in 10 seconds 🧵👇

---

### Tweet 2 (The Vulnerability & Affected Versions)
2/ Upstream PHP released urgent patches on Oct 21 for two critical memory corruption & boundary flaws.

Patched upstream versions:
✅ 8.2.35+
✅ 8.3.36+
✅ 8.4.27+
✅ 8.5.12+

⚠️ Everything below this—including EOL branches (5.x, 7.x, 8.0, 8.1)—is potentially vulnerable.

---

### Tweet 3 (The 10-Second Remote Check)
3/ You don't need to install anything or run invasive exploit payloads.

We built a 100% defensive banner & version checker into `@salmandev/everything-gemini`:

```bash
npx everything-gemini phpcheck https://your-site.com
```

Outputs human or `--json` status: `OK`, `POTENTIALLY VULNERABLE`, or `UNKNOWN`.

---

### Tweet 4 (The Hidden Trap: Un-Restarted Workers)
4/ ⚠️ THE BIGGEST TRAP: The "Ghost Memory" Worker.

Many teams upgraded their distro packages (`apt upgrade php8.3-fpm`), but long-running FPM or Apache workers were NEVER restarted.

The disk binary is updated, but your running web processes are still executing vulnerable memory in RAM!

---

### Tweet 5 (Server-Side & Container Fleet Audit)
5/ To audit your local Linux host, Kubernetes pod, or Docker container directly:

```bash
npx everything-gemini phpcheck --server
```

It inspects `/proc/*/exe` for deleted unlinked binaries, queries `dpkg`/`rpm` package vendor revisions, and warns you if workers need a restart.

---

### Tweet 6 (Remediation Runbook)
6/ Immediate Remediation Checklist:

1️⃣ Upgrade package:
`sudo apt update && sudo apt install --only-upgrade php*-fpm`
2️⃣ Mandatory Restart:
`sudo systemctl restart 'php*-fpm'`
3️⃣ Verify RAM:
`ls -l /proc/*/exe | grep deleted` (must be 0 lines!)
4️⃣ Turn off version leak:
`expose_php = Off` in `php.ini`

---

### Tweet 7 (Call to Action & Open Source Link)
7/ Both the CLI checker and autonomous AI agent skills (`$phpcheck-url`, `$phpcheck-server`, `$php2shell-version-auditor`) are available open-source in `everything-gemini`.

Star & audit your servers now:
🔗 https://github.com/salmandev/everything-gemini

Please RT to protect fellow DevOps & PHP developers! 🛡️

---

## 💼 Platform 2: LinkedIn (Executive & DevOps Advisory)

**Headline**: 🚨 Urgent Security Advisory: PHP2Shell (CVE-2026-109618 / CVE-2026-109619) & Remediation Guide

If your infrastructure runs PHP across web servers, microservices, or API gateways, your infrastructure may be exposed to two critical vulnerabilities disclosed on October 21: **CVE-2026-109618** and **CVE-2026-109619** (CVSS 9.2).

### What Happened?
The PHP core team announced fixes for remote memory corruption and boundary check bypasses in stream handling:
- **Patched Upstream Releases**: `8.2.35`, `8.3.36`, `8.4.27`, `8.5.12`.
- **EOL Branches**: PHP 5.x, 7.x, 8.0, and 8.1 are affected unless running paid vendor backports (Debian DLA/DSA, Ubuntu Pro USN-8948-1/2, Red Hat RHSA-2026:87080/87151).

### The Critical "Stale Worker" Gotcha
In production post-mortems, we consistently observe that automated unattended upgrades install newer packages to disk, but active `php-fpm` pools or Apache `mod_php` daemons remain running with open file descriptors pointing to **unlinked, vulnerable binaries in RAM**.

Until worker pools are cleanly restarted, your web application remains exposed!

### How to Audit in Seconds (Zero Installation)
To help teams quickly inventory public endpoints and private server fleets without sending intrusive exploit probes, we've integrated defensive inspection skills into **Everything Gemini**:

1. **Remote Endpoint Audit**:
```bash
npx everything-gemini phpcheck "https://your-domain.com"
```

2. **Server / Container Fleet Audit**:
```bash
npx everything-gemini phpcheck --server
```

3. **Autonomous Agent Skills**:
If you use Google Antigravity or AI coding harnesses, you can delegate fleet triage to the `$php2shell-version-auditor`, `$phpcheck-url`, and `$phpcheck-server` skills.

### Immediate Action Required:
1. Update distribution packages (`apt update` / `dnf update`).
2. Explicitly restart web daemons: `systemctl restart 'php*-fpm'`.
3. Check `/proc/*/exe` for unlinked deleted binaries.
4. Set `expose_php = Off` in `php.ini` to eliminate public banner reconnaissance.

Open-source project link: https://github.com/salmandev/everything-gemini

#Cybersecurity #DevOps #PHP #VulnerabilityAlert #InfoSec #SysAdmin #ApplicationSecurity #CloudSecurity

---

## 👾 Platform 3: Reddit (r/sysadmin, r/PHP, r/netsec)

**Title**: [PSA] PHP2Shell (CVE-2026-109618 & CVE-2026-109619): Upstream fixes, vendor backport matrix, and the "un-restarted FPM worker" trap

**Body**:

Hey everyone,

Following the October 21 disclosure of **PHP2Shell** (CVE-2026-109618 and CVE-2026-109619, CVSS 9.2 RCE / memory exposure), here is a no-nonsense technical summary, vendor package breakdown, and a free zero-install scanner we put together to help audit your infrastructure.

### 1. Affected Upstream Releases
If you build from source or use official Docker images (`php:8.3-fpm`, etc.), ensure you are running at least:
- **8.2**: `8.2.35+`
- **8.3**: `8.3.36+`
- **8.4**: `8.4.27+`
- **8.5**: `8.5.12+`
- **Older branches**: 5.4–5.6, 7.0–7.4, 8.0, and 8.1 are unmaintained upstream and vulnerable unless protected by vendor security backports.

### 2. Linux Distribution Backport Matrix

| OS / Release | Package Stream | Fixed Package Revision | Advisory |
| :--- | :--- | :--- | :--- |
| **Debian 12 (bookworm)** | `php8.2-fpm` | `8.2.35-1~deb12u1` | DLA-4848-1 |
| **Debian 13 (trixie)** | `php8.4-fpm` | `8.4.27-1~deb13u1` | DSA-6574-1 |
| **Ubuntu 24.04 LTS** | `php8.3` | `8.3.6-0ubuntu0.24.04.13` | USN-8948-1 |
| **Ubuntu 22.04 LTS** | `php8.1` | `8.1.2-1ubuntu2.28` | USN-8948-1 |
| **Ubuntu 20.04 (Pro)** | `php7.4` | `7.4.3-4ubuntu2.29+esm5` | USN-8948-2 |
| **RHEL 8.10** | PHP 7.4 stream | `7.4.33-8.module+el8.10.0+25117+30337cca` | RHSA-2026:87080 |
| **RHEL 9.8** | PHP 8.0 stream | `8.0.30-8.el9_8.1` | RHSA-2026:87151 |

### 3. The "Un-restarted FPM Worker" Trap
Many sysadmins ran `apt-get upgrade` and assumed they were protected. But if your system didn't restart the `php-fpm` service, the running master and child processes keep mapped in RAM the old unlinked `.so` and executable.

To check if you are suffering from this:
```bash
ls -l /proc/*/exe 2>/dev/null | grep -E '(php|apache|httpd).*\(deleted\)'
```
If you see `(deleted)`, your workers are still running the vulnerable binary. Run:
```bash
sudo systemctl restart 'php*-fpm'
```

### 4. Zero-Install Scanning Tools
We ported and expanded the OpenAI defensive version-checking logic into `everything-gemini` so you can scan external URLs and local servers without sending exploit payloads:

**External URL Banner Check**:
```bash
npx everything-gemini phpcheck https://yourdomain.com
npx everything-gemini phpcheck https://yourdomain.com --json
```

**Local Host / Container Worker Audit**:
```bash
npx everything-gemini phpcheck --server
```

Repository: https://github.com/salmandev/everything-gemini

Stay safe and check your daemons!

---

## 🟧 Platform 4: Hacker News (Show HN)

**Title**: Show HN: everything-gemini phpcheck – Non-intrusive PHP2Shell (CVE-2026-109618/19) patch auditor

**Submission Text / First Comment**:

Hi HN,

Following the October 21 disclosure of PHP2Shell (CVE-2026-109618 and CVE-2026-109619), we observed that many teams were struggling with two main triage challenges:

1. **Reconnaissance without exploit probes**: How to verify whether public-facing endpoints or staging environments advertise an affected PHP runtime without firing active exploit payloads or risking service degradation.
2. **The "Ghost Worker" problem**: Many sysadmins applied `apt upgrade`, which replaces packages on disk, but forgot to restart long-running PHP-FPM worker pools or Apache daemons. Because the kernel preserves open inodes in memory, the active workers continue running the unpatched code in RAM indefinitely.

We've integrated a defensive checker and agent skill suite into `everything-gemini`:

```bash
# Check any remote website/API (reads Server / X-Powered-By via HEAD fallback)
npx everything-gemini phpcheck https://example.com

# Audit local server, container, OS package revisions, and /proc/*/exe deleted handles
npx everything-gemini phpcheck --server
```

### Design Notes:
- **Non-intrusive**: Uses HTTP `HEAD` by default, falling back to `GET` only on 405/501 status codes. Never inspects response bodies or issues crash probes.
- **Vendor-aware**: Cross-references Debian (12/13), Ubuntu (14.04-26.10 ESM/Pro), RHEL (8.10/9.8), and upstream source builds (8.2.35+, 8.3.36+, 8.4.27+, 8.5.12+).
- **AI Agent Native**: Includes progressive disclosure skills (`$phpcheck-url`, `$phpcheck-server`, and `$php2shell-version-auditor`) for Google Antigravity & AI coding assistants to automate fleet triage and write pull requests.

GitHub: https://github.com/salmandev/everything-gemini

Feedback and PRs welcome!
