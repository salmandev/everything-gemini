# Zero-Trust Security Policies (Antigravity & Gemini)

These mandatory policies establish defense-in-depth safety boundaries for automated AI agents, shell execution environments, and tool integrations.

---

## 1. Principle of Least Privilege (PoLP)
- **Read-Only Defaults**:
  - Subagents and background tasks default to read-only tool permissions (`view_file`, `grep_search`, `list_dir`) unless explicit write permissions are necessary.
- **Granular Tool Grants**:
  - Do not grant shell execution privileges to subagents that only require file inspection or documentation synthesis.
- **Explicit Confirmation Gates**:
  - High-risk operations (production deployments, database schema migrations, repository configuration updates) require explicit confirmation gates.

---

## 2. Credential & Secret Leakage Prevention
- **Proactive Secret Scanning**:
  - Outbound payloads, diffs, and generated files must be scanned for credential patterns:
    - Google Cloud / Gemini API Keys (`AIza[0-9A-Za-z\\-_]{35}`)
    - GitHub Personal Access Tokens (`ghp_[0-9A-Za-z]{36}`)
    - Stripe Secret Keys (`sk_live_[0-9a-zA-Z]{24}`)
    - Private SSH / TLS keys (`-----BEGIN.*PRIVATE KEY-----`)
- **Zero-Logging Policy**:
  - Never print, echo, or log environment variables containing API keys, tokens, or credentials to terminal stdout/stderr.
- **Git Hygiene**:
  - Never commit `.env`, `.env.local`, or secret credentials to version control. Always maintain sanitized `.env.example` templates.

---

## 3. Command Injection & Execution Guardrails
- **Lifecycle Interception (PreToolUse)**:
  - All shell commands executed by agents are intercepted by deterministic safety gates (`gemini-shield` / `safety-shield`).
- **Blocked Catastrophic Commands**:
  - The following commands are blocked unconditionally:
    - Destructive filesystem deletion: `rm -rf /`, `rm -rf *`, `rm -rf ~`
    - Production branch forced overwrites: `git push --force origin main`, `git push -f origin master`
    - Destructive database operations: `DROP DATABASE`, `DROP TABLE`, `TRUNCATE`
    - Unaudited remote execution: `curl ... | sh`, `wget ... | bash`
- **Argument Parameterization**:
  - Never concatenate raw unvalidated strings into shell command strings. Prefer direct array-based argument passing (`child_process.execFile` or `subprocess.run(["cmd", arg])`).

---

## 4. Path Traversal & Filesystem Containment
- **Workspace Boundary Enforcement**:
  - All file operations must resolve to paths strictly within the active workspace root (`process.cwd()`) or designated global config root (`~/.gemini/config/`).
- **Path Normalization**:
  - Normalize all incoming file paths (`path.resolve()`) to eliminate directory traversal vectors (`../`, `..\`).
- **Forbidden Root Modifications**:
  - Direct writes to `/tmp`, `/etc`, `/usr`, or system binaries outside the designated workspace are strictly prohibited.

---

## 5. Network Boundaries & Safe Integrations
- **Approved Outbound Endpoints**:
  - Network requests made by MCP servers or tools must connect to approved domains or local loopback interfaces (`localhost`, `127.0.0.1`).
- **TLS Certificate Validation**:
  - Outbound HTTPS calls must enforce valid TLS certificates. Disabling certificate verification (`rejectUnauthorized: false` or `verify=False`) is disallowed.
- **Deterministic Sandboxes**:
  - When running untrusted code or third-party dependencies, execute inside isolated Docker containers or sandboxed virtual environments.
