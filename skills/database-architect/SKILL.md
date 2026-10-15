---
name: database-architect
description: >-
  Designs relational and document database schemas, crafts zero-downtime database migrations, optimizes complex queries, and configures ORMs (Prisma, Drizzle, SQLAlchemy).
---

# Database Architect

This skill guides data modeling, schema evolution, index tuning, and zero-downtime migration workflows.

## Core Directives

### 1. Schema Design Standards
- **Primary Keys**: Use UUIDv7 or ULIDs for distributed systems, or identity integers for internal lookups.
- **Foreign Keys**: Always define explicit foreign key constraints with appropriate `ON DELETE` behavior (`CASCADE`, `RESTRICT`, or `SET NULL`).
- **Timestamps**: Every table must have `created_at TIMESTAMPTZ DEFAULT now()` and `updated_at TIMESTAMPTZ DEFAULT now()`.

### 2. Zero-Downtime Migrations (Expand/Contract Pattern)
- **Never rename or delete a column in a single migration**:
  1. *Phase 1 (Expand)*: Add the new column as nullable or with a default. Deploy code that writes to both columns.
  2. *Phase 2 (Backfill)*: Backfill existing records asynchronously.
  3. *Phase 3 (Switch)*: Deploy code that reads from the new column only.
  4. *Phase 4 (Contract)*: Remove the old column.
- **Safe Index Creation**: In PostgreSQL, always use `CREATE INDEX CONCURRENTLY` to avoid blocking read/write queries.

For the zero-downtime migration checklist, see [references/migration-checklist.md](./references/migration-checklist.md).
