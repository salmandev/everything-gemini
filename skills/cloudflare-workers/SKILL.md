---
name: cloudflare-workers
description: >-
  Use this skill when developing Cloudflare Workers, configuring Wrangler v3, integrating Cloudflare D1 SQL or KV storage, or deploying global edge APIs.
---

# Cloudflare Workers & Edge Infrastructure

## Overview
Cloudflare Workers execute on V8 isolates across 300+ edge locations worldwide. This skill provides architectural patterns for ultra-low latency serverless APIs, D1 relational databases, KV storage, and Wrangler configuration.

## Procedural Workflow

### 1. Project Scaffolding & Wrangler Config
Structure `wrangler.jsonc` or `wrangler.toml` with strict environment bindings:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "edge-api",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "prod-db",
      "database_id": "xxxx-xxxx"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "yyyy-yyyy"
    }
  ]
}
```

### 2. Edge Request Handling
Use typed `Env` interfaces and native `fetch` handlers:
```typescript
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  API_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }
    // Execution context for background tasks that shouldn't block response
    ctx.waitUntil(logAnalytics(request, env));
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
```

### 3. Edge Storage Patterns
- **Cloudflare KV**: High-read, low-write caching (eventually consistent). Ideal for session tokens, feature flags, and redirect maps.
- **Cloudflare D1**: Serverless SQLite at the edge. Always use parameterized queries (`env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first()`).
- **Cloudflare R2**: Zero-egress S3-compatible object storage.

## Verification Checklist
- [ ] `compatibility_date` pinned to a modern version
- [ ] Secrets managed via `wrangler secret put`, never hardcoded
- [ ] Background telemetry wrapped in `ctx.waitUntil`
- [ ] D1 queries use parameterized bindings to prevent SQL injection
