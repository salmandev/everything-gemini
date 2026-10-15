---
name: docker-compose-orchestrator
description: Architects, configures, and troubleshoots multi-container Docker Compose environments, database services (Postgres, pgvector, Redis), healthchecks, and local dev networking.
---

# Docker Compose Multi-Service Orchestrator

This skill guides the design, hardening, and troubleshooting of multi-container local and staging environments using Docker Compose v2.

---

## 1. Core Principles

1. **Deterministic Healthchecks**:
   - Always define explicit `healthcheck` blocks for stateful services (databases, caches, message brokers).
   - Use `depends_on: { condition: service_healthy }` to prevent app containers from starting before databases are ready.
2. **Persistent Named Volumes**:
   - Store persistent data (e.g., PostgreSQL data, Redis dumps, uploaded media) in named volumes, never in ephemeral container layers.
3. **Environment Isolation**:
   - Use `.env.example` templates with sensible local defaults; never hardcode production secrets in compose files.

---

## 2. Production-Grade Compose Blueprint

Example architecture pairing an application server with PostgreSQL (pgvector enabled) and Redis caching:

```yaml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    container_name: app_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app_dev}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-net

  redis:
    image: redis:7-alpine
    container_name: app_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - app-net

volumes:
  pgdata:
  redisdata:

networks:
  app-net:
    driver: bridge
```

---

## 3. Common Operations & Diagnostics

| Command | Action |
| :--- | :--- |
| `docker compose up -d` | Start all services in the background |
| `docker compose ps` | Inspect service health and exposed ports |
| `docker compose logs -f <service>` | Stream logs for a specific container |
| `docker compose down -v` | Tear down containers and wipe persistent volumes |
| `docker compose exec <service> sh` | Open an interactive shell inside a container |
