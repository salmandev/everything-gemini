---
name: supabase-architect
description: >-
  Use this skill when designing Supabase database schemas, writing Row Level Security (RLS) policies, setting up pgvector AI embeddings, or configuring Supabase Edge Functions.
---

# Supabase Architecture & Security Playbook

## Overview
Supabase provides a powerful managed backend powered by PostgreSQL. This skill guides the agent in crafting bulletproof Row Level Security (RLS) policies, configuring pgvector for semantic search and AI embeddings, and deploying performant Supabase Edge Functions.

## Procedural Workflow

### 1. Row Level Security (RLS) Defense-in-Depth
Never leave a table with RLS disabled in production:
```sql
-- 1. Always enable RLS on newly created tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 2. Enforce strict tenant isolation or user ownership
CREATE POLICY "Users can only read their own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2. Semantic Search & Vector Embeddings (`pgvector`)
When storing AI embeddings in PostgreSQL:
1. Enable extension: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Create vector column matching model dimensions (e.g., 768 or 1536):
   ```sql
   ALTER TABLE documents ADD COLUMN embedding vector(768);
   ```
3. Create an HNSW index for fast similarity lookups:
   ```sql
   CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
   ```
4. Define match RPC functions with inner product or cosine distance queries.

### 3. Realtime Channels & Subscriptions
- Filter broadcasts server-side using Postgres row-level filters (`eq`, `in`) to prevent client-side data leaks.
- Ensure sensitive columns are omitted or masked in realtime publication sets.

## Verification Checklist
- [ ] RLS explicitly enabled on every table
- [ ] RLS policies tested against unauthenticated and cross-tenant tokens
- [ ] Vector index created with appropriate similarity operator (`vector_cosine_ops`)
- [ ] Edge functions handle CORS headers and verify JWT signatures
