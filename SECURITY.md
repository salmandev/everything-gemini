# Security Policy

## Supported Versions

We actively provide security patches and dependency updates for the following versions:

| Version | Supported          |
| :---    | :---               |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The Everything Gemini team takes the security of agent systems, lifecycle hooks, and model interactions seriously.

If you discover a security vulnerability, prompt injection bypass in safety gates, or credential exposure vector:

1. **Do NOT open a public GitHub issue.**
2. Report the vulnerability privately via **GitHub Security Advisories** on the repository:
   - Go to [https://github.com/salmandev/everything-gemini/security/advisories](https://github.com/salmandev/everything-gemini/security/advisories)
   - Click **"Report a vulnerability"**
3. Alternatively, email the maintainer directly at `salman@salmandev.com` with the subject:
   `[SECURITY] Everything Gemini Vulnerability Report`.

Please include:
- A clear description of the vulnerability and attack vector.
- Minimal reproduction steps, sample prompts, or script commands.
- Potential impact on agent runtimes or host filesystem integrity.

---

## Response Timeline

- **Initial Acknowledgment**: Within 48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Patch**: Published as an expedited patch release (`v1.x.y`).
