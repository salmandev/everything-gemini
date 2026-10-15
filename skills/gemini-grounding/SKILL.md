---
name: gemini-grounding
description: >-
  Use this skill when verifying dynamic facts, researching live documentation, fact-checking technical claims, or integrating Google Search grounding into Gemini agent reasoning workflows.
---

# Gemini Search Grounding & Dynamic Fact Verification

## Overview
Gemini frontier models feature native **Google Search Grounding**, enabling agents to supplement static training weights with real-time web citations, current API documentation, and package release notes. This skill outlines best practices for search grounding, citation verification, and hallucination elimination.

## Procedural Workflow

### 1. Identify Grounding Triggers
Activate search grounding when:
- Querying rapidly evolving SDKs, library APIs, or breaking versions released after model cutoffs.
- Verifying deployment status, cloud service outages, or public CVE advisories.
- Researching latest framework releases (e.g., Next.js canary features, Tailwind v4, React 19).

### 2. Search Query Formulation
Formulate targeted search queries:
- **Exact Syntax Match**: Use quotes for exact error strings or function signatures.
- **Official Domain Prioritization**: Target authoritative documentation:
  - `site:github.com` for issue threads and release tags.
  - `site:npmjs.com` or `site:pypi.org` for version numbers and dependencies.
  - Official vendor docs (`docs.antigravity.google`, `developer.mozilla.org`).

### 3. Verification & Citation Attribution
When incorporating search findings into code:
1. **Cross-Check with Active Code**: Never assume an external snippet works as-is; inspect local types and configurations first.
2. **Clickable Links**: Link external references using markdown links in documentation and artifacts.
3. **Zero-Trust Validation**: Verify any third-party code against local linters (`npm test` or typecheckers).

## Verification Checklist
- [ ] Claims backed by verifiable, recent documentation
- [ ] No hallucinated imports or deprecated APIs
- [ ] External references properly attributed
