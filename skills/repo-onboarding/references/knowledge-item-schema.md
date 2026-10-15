# Knowledge Items (KI) Schema & Reference

Knowledge Items are Antigravity's persistent, curated memory units stored in `<appDataDir>/knowledge`.

## Structure
```text
<appDataDir>/knowledge/<ki-id>/
├── metadata.json
└── artifacts/
    ├── architecture.md
    └── common-patterns.md
```

## `metadata.json` Format
```json
{
  "title": "Repository Architecture & Patterns",
  "summary": "Fullstack Next.js app using PostgreSQL, Prisma, and Tailwind CSS. Tests run via Vitest.",
  "createdAt": "2026-10-15T10:00:00Z",
  "updatedAt": "2026-10-15T10:00:00Z",
  "references": [
    "package.json",
    "prisma/schema.prisma",
    "vitest.config.ts"
  ]
}
```

## When to Consult Knowledge Items
Always check Knowledge Items before performing deep-dive architectural investigations to avoid duplicating work and violating established team conventions.
