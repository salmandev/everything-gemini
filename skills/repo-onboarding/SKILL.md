---
name: repo-onboarding
description: >-
  Rapidly inspects an unfamiliar codebase, maps directory structures, identifies key patterns, and generates a structured Knowledge Item (KI) for permanent repository memory.
---

# Repository Onboarding & Knowledge Item (KI) Indexing

When an agent enters a new codebase, this skill provides a structured exploration sequence to index architecture, conventions, and operational runbooks without wasting excessive context.

## Onboarding Procedure

### 1. Root & Ecosystem Inspection
1. Read project manifest: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`.
2. Check `.gitignore` to identify ignored artifacts, environment configs, and build outputs.
3. Check `README.md` and docs for local setup and testing scripts.

### 2. Architectural Survey
1. Run `list_dir` on root and top-level directories to understand organizational patterns (e.g. Clean Architecture, Monorepo, MVC).
2. Identify entry points (e.g., `src/index.ts`, `app/main.py`, `cmd/server/main.go`).
3. Locate core data models and database schemas (e.g., Prisma schemas, SQLAlchemy models, migrations).

### 3. Build & Test Verification
Run the project's build and test commands to verify environment health:
```bash
# E.g.
npm run build && npm test
```

### 4. Create Repository Knowledge Item (KI)
Persist findings into the localized Knowledge Items store so subsequent sessions have instant architectural recall:
- Create `metadata.json` outlining core patterns, key paths, and test instructions.
- Create an architecture summary artifact in `<appDataDir>/knowledge`.

For the schema and structure of Knowledge Items, see [references/knowledge-item-schema.md](./references/knowledge-item-schema.md).
