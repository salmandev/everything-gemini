---
name: root-cause-debugger
description: >-
  Systematically diagnoses complex regressions, silent data corruptions, race conditions, and elusive bugs using binary search (git bisect), log analysis, and reproduction harnesses.
---

# Root Cause Debugger

This skill provides an evidence-based debugging procedure to eliminate guessing and find root causes rapidly.

## 5-Step Debugging Protocol

### 1. Build a Minimal Reproducer (MRE)
- Never start guessing fixes without an automated test or minimal script that reliably triggers the failure.
- Strip away unrelated modules until only the failing component remains.

### 2. Formulate & Test Hypotheses
- List the top 2-3 plausible hypotheses for why the failure occurs.
- Add targeted debug statements or breakpoints to confirm or falsify each hypothesis sequentially.

### 3. Binary Search History with `git bisect`
If the bug is a regression that didn't exist in an earlier commit:
```bash
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
git bisect run ./test-runner.sh
```
This isolates the exact offending commit in $O(\log n)$ steps.

### 4. Implement Minimal Surgical Fix
- Resolve the root cause directly at its source. Avoid superficial patches that merely silence error messages.

### 5. Add Regression Shield Test
- Commit an automated test that explicitly verifies the regression never recurs.
