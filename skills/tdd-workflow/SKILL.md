---
name: tdd-workflow
description: >-
  Enforces strict Test-Driven Development (Red-Green-Refactor). Use this skill when the user asks to implement a new feature, fix a bug, or refactor logic using TDD.
---

# Test-Driven Development (TDD) Workflow

This skill guides the agent through an uncompromising Red-Green-Refactor cycle.

## Procedure

### Step 1: Discover Existing Test Runner
Detect the test framework in use:
- **Node/TS**: Check `package.json` for `jest`, `vitest`, `mocha`, or `npm test`.
- **Python**: Check for `pytest` or `unittest`.
- **Go**: Look for `*_test.go` and run `go test ./...`.

Run the existing suite to ensure the baseline is green before touching anything:
```bash
# Example
npm test
```

### Step 2: Phase RED (Write Failing Test)
1. Write a minimal test file or test case specifying the expected outcome or reproducing the exact bug reported.
2. Run the specific test and verify that it **fails**.
3. Confirm failure reason: It must fail on the assertion, NOT because of an import error or syntax error.

### Step 3: Phase GREEN (Write Minimal Implementation)
1. Write the absolute minimum production code to satisfy the test assertion.
2. Do not prematurely optimize or handle un-tested edge cases yet.
3. Re-run the test to confirm it now passes (turns green).

### Step 4: Phase REFACTOR (Clean Code with Confidence)
1. Eliminate duplication, extract functions, refine variable names, and improve readability.
2. Re-run tests immediately after each edit.
3. Repeat for next edge case.

For detailed test patterns and mocking strategies, see [references/tdd-patterns.md](./references/tdd-patterns.md).
