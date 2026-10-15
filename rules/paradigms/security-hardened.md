# Security & Hardening Protocol

Security rules enforced for all agent code generation and execution.

## 1. Zero Secret Leakage
- Never print, log, or commit API keys, tokens, certificates, or credentials.
- Always load secrets via environment variables (`process.env`, `os.environ`).
- Ensure `.env` files and secret patterns are listed in `.gitignore`.

## 2. Command & Injection Defense
- Never execute shell commands by concatenating unsanitized user strings.
- Always use parameterized queries for SQL/NoSQL databases to prevent SQL injection.
- Validate paths with `path.resolve` and verify they remain within the authorized workspace directory to prevent directory traversal.

## 3. Dependency Security
- Review new packages before adding them to `package.json` or `pyproject.toml`.
- Run automated vulnerability audits (`npm audit`, `pip-audit`, `govulncheck`) on dependencies.
