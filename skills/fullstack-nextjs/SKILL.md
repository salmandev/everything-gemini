---
name: fullstack-nextjs
description: >-
  Specialized engineering workflow for Next.js App Router, React Server Components (RSC), Server Actions, and API routes. Use when building or debugging modern Next.js applications.
---

# Fullstack Next.js Engineering

This skill provides patterns for Next.js (App Router), React Server Components (RSC), and Server Actions.

## Core Directives

### 1. Server vs. Client Components
- **Default to Server Components**: Fetch data directly on the server without `useEffect` or client-side fetch.
- **`'use client'` Boundary**: Only mark components with `'use client'` when they require browser event listeners (`onClick`, `onChange`), React state (`useState`, `useReducer`), or browser APIs.
- **Push Client Boundaries Down**: Keep client components at the leaves of the component tree to maximize server-side rendering performance.

### 2. Server Actions & Mutations
- Use `'use server'` functions for mutations.
- Always validate input arguments using Zod schemas inside Server Actions before performing database queries.
- Revalidate cache paths using `revalidatePath()` or `revalidateTag()` after data mutations.

### 3. Hydration Bug Prevention
- Avoid accessing `window`, `localStorage`, or `navigator` during initial render.
- Ensure identical HTML output between SSR and hydration (e.g. avoid rendering random IDs or localized date strings on initial render without a client wrapper).

For architectural layouts and route handler patterns, see [references/app-router-patterns.md](./references/app-router-patterns.md).
