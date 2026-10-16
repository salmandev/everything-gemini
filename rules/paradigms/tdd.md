# Test-Driven Development (TDD) Protocol

Enforce this workflow whenever developing features, fixing bugs, or refactoring existing logic across the repository.

---

## The TDD Iron Law

> **Never write production code unless an existing test is currently failing because that code does not exist or does not yet behave as expected.**

---

## 1. The Three Disciplined Phases

### Phase 1: RED (Reproduce & Specify)
1. **Write the Failing Test First**:
   - Write a minimal, focused unit or integration test describing the desired behavior or reproducing the reported bug.
2. **Execute to Confirm Failure**:
   - Run the test suite and verify that the test fails for the expected reason (e.g. `AssertionError: expected false to be true` or `Function not defined`, not due to unrelated compilation or import syntax errors).

### Phase 2: GREEN (Minimal Implementation)
1. **Surgical Implementation**:
   - Write the absolute minimum production code required to make the failing test pass.
2. **Resist Premature Generalization**:
   - Do not write speculative helper functions, premature optimizations, or unrelated features during the Green phase. Get to green as quickly and simply as possible.
3. **Verify All Tests Pass**:
   - Confirm that the new test passes AND all existing regression tests remain green.

### Phase 3: REFACTOR (Clean & Harden)
1. **Eliminate Duplication**:
   - Clean up repeated logic, extract reusable helpers, and clarify variable naming.
2. **Enforce Type Safety**:
   - Tighten type annotations, interfaces, and parameter docstrings.
3. **Zero Regression Guarantee**:
   - Re-run the automated test suite after every refactoring edit. Never finalize a refactor while any test is failing.

---

## 2. Standardized Test Structure: AAA Pattern

Every test case must follow the **Arrange-Act-Assert (AAA)** pattern:
```typescript
describe('TokenCompactor', () => {
  it('should truncate oldest turns when token budget is exceeded', () => {
    // Arrange: Set up initial state and test inputs
    const budget = 1000;
    const history = createTranscriptFixture({ totalTokens: 1500 });

    // Act: Invoke the unit under test
    const compacted = compactHistory(history, budget);

    // Assert: Verify expected output and invariants
    expect(compacted.totalTokens).toBeLessThanOrEqual(budget);
    expect(compacted.turns[0].isSummary).toBe(true);
  });
});
```

---

## 3. Mandatory Edge-Case Checklist

Every feature or bugfix test suite must assert against these boundary conditions:
- [ ] **Empty / Nil Inputs**: Null, undefined, empty strings `""`, empty arrays `[]`, empty objects `{}`.
- [ ] **Boundary Extremes**: Zero, negative integers, max integer bounds (`Number.MAX_SAFE_INTEGER`), very large strings (>1MB).
- [ ] **Malformed Payloads**: Invalid JSON, broken YAML frontmatter, truncated streams.
- [ ] **Network & Error Boundaries**: Simulated HTTP 429 (rate limits), 503 timeouts, socket hangups.
- [ ] **Idempotent Retries**: Running the same operation twice returns identical deterministic results without side effects.

---

## 4. Test Isolation & Determinism
- **No Shared Mutable State**:
  - Each test must run independently. Clean up databases, mocks, and temporary directories in `afterEach` hooks.
- **Deterministic Clocks**:
  - Avoid `setTimeout` loops in tests. Use mock timers (`vi.useFakeTimers()` or `jest.useFakeTimers()`) to eliminate flaky tests and speed up test execution.
