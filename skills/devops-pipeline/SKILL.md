---
name: devops-pipeline
description: >-
  Architects and configures Docker containers, multi-stage Dockerfiles, GitHub Actions CI/CD workflows, and infrastructure automation. Use when building or tuning deployment pipelines.
---

# DevOps Pipeline Engineering

This skill structures Docker containerization, caching, security scanning, and CI/CD automation.

## Core Directives

### 1. Minimal Multi-Stage Dockerfiles
- Use multi-stage builds (`AS builder` and `AS runner`) to keep final image sizes minimal (< 100MB).
- Run applications as a non-root user (`USER node` or `USER appuser`) for defense-in-depth.
- Order commands to maximize Docker layer cache hits (copy `package.json` / `requirements.txt` before copying source code).

### 2. GitHub Actions CI/CD Best Practices
- Cache dependencies (`actions/cache` or `actions/setup-node` with `cache: 'npm'`).
- Run linting, typechecking, and unit tests concurrently using GitHub Actions job matrix.
- Enforce status checks before permitting branch merges into `main`.

For complete production CI/CD workflow templates, see [templates/github-ci.yml](./templates/github-ci.yml).
