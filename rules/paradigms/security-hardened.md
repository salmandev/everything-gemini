# Security & Hardening Protocol

Security rules and defensive engineering standards enforced for all agent code generation and execution across projects.

---

## 1. Zero Secret Leakage
- **Never Commit Secrets**:
  - Never print, log, or commit API keys, personal access tokens, private keys, or passwords.
  - Always ingest sensitive configuration via environment variables (`process.env`, `os.environ`).
- **Git & Artifact Sanitation**:
  - Ensure `.env`, `.env.local`, `.pem`, and certificate files are explicitly listed in `.gitignore`.
  - When creating demonstration snippets or documentation, use standardized redaction placeholders (e.g. `GEMINI_API_KEY="YOUR_GEMINI_API_KEY"`).

---

## 2. Command & Injection Defense
- **Safe Process Spawning**:
  - Never concatenate unvalidated user strings into shell commands.
  - Avoid `shell: true` in Node.js `child_process.spawn`. Pass binary names and arguments as separate arrays:
    ```javascript
    // INSECURE: exec(`curl ${userInput}`)
    // SECURE:
    const { execFile } = require('child_process');
    execFile('curl', ['--silent', sanitizedUrl]);
    ```
- **SQL & Query Injection**:
  - Always use parameterized queries or type-safe ORM query builders (Prisma, Drizzle, SQLAlchemy). Never interpolate raw string variables into SQL statements.
- **Path Traversal Guardrails**:
  - Sanitize all file paths with `path.resolve` and verify that the target path begins with the authorized root directory:
    ```javascript
    const resolvedPath = path.resolve(authorizedDir, userFilename);
    if (!resolvedPath.startsWith(path.resolve(authorizedDir))) {
      throw new Error('Access denied: Path traversal attempt detected.');
    }
    ```

---

## 3. Cryptographic Hygiene
- **Constant-Time Comparisons**:
  - When comparing webhook signatures, API tokens, or password hashes, always use constant-time comparison utilities (`crypto.timingSafeEqual`) to eliminate timing attack vectors.
- **Modern Cryptographic Primitives**:
  - Use cryptographically secure pseudorandom number generators (`crypto.randomBytes` or `secrets.token_hex`). Never use `Math.random()` for security-critical values.

---

## 4. Prototype Pollution & Input Validation
- **Deep Object Cloning**:
  - Prevent prototype pollution by sanitizing keys against `__proto__`, `constructor`, and `prototype`.
- **Strict Schema Parsing**:
  - Validate all JSON payloads at HTTP route boundaries using schema validators (Zod, Pydantic, or TypeBox). Strip unknown properties before processing.

---

## 5. Dependency Audit & Supply Chain Security
- **Automated CVE Scans**:
  - Run vulnerability audits (`npm audit`, `pip-audit`, `govulncheck`) on third-party dependencies before introducing new packages.
- **Lockfile Enforcement**:
  - Commit deterministic lockfiles (`package-lock.json`, `poetry.lock`) to ensure repeatable, tamper-evident builds.
