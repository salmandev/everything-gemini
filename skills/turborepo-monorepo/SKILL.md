---
name: turborepo-monorepo
description: >-
  Architects, configures, and optimizes high-performance monorepo build systems using Turborepo, fine-grained task pipelines (turbo.json), remote caching, package boundary isolation, and Docker pruning.
---

# Turborepo Monorepo Architecture & Task Pipelines

This skill guides structuring, optimizing, and maintaining multi-package JavaScript/TypeScript monorepos with Turborepo, leveraging incremental computation, hash-based task caching, remote cache synchronization, and isolated Docker container pruning.

---

## ⚡ Core Patterns

### 1. Production `turbo.json` Pipeline Specification

Define task dependencies, input hashes, cache retention, and environment variable tracking in root `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "topo": {
      "dependsOn": ["^topo"]
    },
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*", "!**/*.test.*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "API_BASE_URL"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^topo"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  },
  "globalEnv": ["CI", "PORT"],
  "globalDependencies": [
    "tsconfig.base.json",
    ".eslintrc.js",
    "pnpm-lock.yaml"
  ]
}
```

---

### 2. Monorepo Workspace Directory Structure

Maintain strict package boundaries between deployable applications (`apps/*`) and shared internal libraries (`packages/*`):

```text
my-monorepo/
├── apps/
│   ├── web/                     # Next.js / SvelteKit / React SPA
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                     # Node.js / Express / Nest / Fastify
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── ui/                      # Shared React design system
│   ├── database/                # Drizzle / Prisma / SQL migrations
│   ├── config-eslint/           # Internal shared ESLint rules
│   └── config-typescript/       # tsconfig.base.json definitions
├── turbo.json                   # Pipeline DAG orchestration
├── pnpm-workspace.yaml          # Package manager workspaces
└── package.json                 # Root scripts and dev dependencies
```

---

### 3. Internal Package Definition with `package.json` Exports

Configure shared internal libraries using modern TypeScript `exports` without premature bundler compilation:

```json
{
  "name": "@workspace/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./button": {
      "types": "./src/button.tsx",
      "default": "./src/button.tsx"
    },
    "./theme": {
      "types": "./src/theme.ts",
      "default": "./src/theme.ts"
    }
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@workspace/config-typescript": "workspace:*",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

---

### 4. Remote Caching & CI/CD Acceleration

Enable zero-redundancy CI builds with Vercel or self-hosted Remote Cache (e.g. AWS S3 or MinIO):

```bash
# 1. Authenticate with remote cache provider
npx turbo login

# 2. Link repository to team space
npx turbo link

# 3. In CI environments, provide token and team identifier via environment
export TURBO_TOKEN="your-cache-secret-token"
export TURBO_TEAM="your-team-slug"

# 4. Run targeted pipeline with cache hit verification
turbo run build test lint --filter=...[origin/main]
```

---

### 5. Multi-Stage Docker Build Optimization via `turbo prune`

Generate a minimal build context containing only the target application and its direct internal dependencies:

```dockerfile
# Stage 1: Prune monorepo for target app
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies from pruned lockfile
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 3: Build application
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=web...

# Stage 4: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

---

## 🎯 Verification & Diagnostics

1. **Inspect Task Graph**:
   ```bash
   turbo run build --graph=build-graph.html
   ```
2. **Dry Run Pipeline**:
   ```bash
   turbo run test --dry-run
   ```
3. **Targeted Subtree Execution**:
   ```bash
   turbo run build --filter=web...   # web and all its internal dependencies
   turbo run test --filter=...api    # api and all packages that depend on it
   ```
