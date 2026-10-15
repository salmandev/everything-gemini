# Test-Driven Development (TDD) Protocol

Enforce this workflow when developing features, fixing bugs, or refactoring code.

## The TDD Iron Law

> **Never write production code unless an existing test is currently failing because that code does not exist.**

### Phase 1: RED (Reproduce & Specify)
1. Write a minimal, focused unit or integration test describing the desired behavior or reproducing the reported bug.
2. Run the test suite and verify that the test fails for the expected reason (not due to syntax or import errors).

### Phase 2: GREEN (Minimal Implementation)
1. Write the absolute minimum production code required to make the failing test pass.
2. Run the test suite and ensure all tests pass. Do not write premature optimizations or unrelated code.

### Phase 3: REFACTOR (Clean & Harden)
1. Clean up duplicated logic, improve naming, extract helper functions, and enforce type safety.
2. Re-run tests after every micro-refactor to ensure zero regressions.
