# TypeScript Engineering Standards

Apply these rules when reading, writing, or refactoring TypeScript code.

## 1. Type Safety & Rigor

- **Strict Mode Always**: Ensure `strict: true` in `tsconfig.json`.
- **Zero `any`**: Never use `any`. Use `unknown` with runtime type assertions, type predicates (`val is T`), or schema validators.
- **Explicit Function Signatures**: All exported functions, methods, and API handlers must have explicit return types.
- **Discriminated Unions**: Prefer discriminated unions over optional fields or loosely typed objects for state management.
- **Runtime Validation**: Use Zod, Valibot, or ArkType to parse and validate untrusted input (API responses, environment variables, user submissions).

## 2. Modern Syntax & Architecture

- **Pure ESM**: Use ES modules (`import`/`export`) with explicit `.js` extensions where required by Node ESM.
- **Immutable by Default**: Use `readonly` arrays, `as const`, and `Readonly<T>` for static configurations and state objects.
- **Async/Await**: Avoid raw `.then()` / `.catch()` chains. Use standard `async`/`await` with structured `try`/`catch` handling.
- **Path Aliases**: Maintain clean import trees using project path aliases (e.g. `@/components/`, `@/lib/`).
