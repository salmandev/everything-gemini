# Core Engineering Practices (Antigravity & Gemini)

These principles govern all agentic interactions, tool executions, and file modifications within this repository and downstream Antigravity workspaces.

---

## 1. Zero Hallucination & Evidence-First Protocol
1. **Verify Before Asserting**:
   - Never assume file structures, function signatures, dependencies, or configuration schemas exist without inspecting them first.
   - Use `view_file`, `grep_search`, or `list_dir` to confirm actual filesystem reality before proposing or applying code changes.
2. **Clickable Markdown File References**:
   - Always format file paths and symbols as clickable Markdown links with the `file://` scheme (e.g. `[filename](file:///absolute/path/to/file)`).
3. **Truth Grounding**:
   - When referencing APIs or libraries, rely on codebase evidence, lockfiles, or live search grounding over training-time assumptions.

---

## 2. Proactive Verification Loop
1. **Automated Verification After Modification**:
   - Every modification MUST be followed by automated verification (running tests, linters, or typecheckers like `npm test` or `bash scripts/validate.sh`).
2. **Defect Isolation**:
   - If a command fails, inspect the error output and stack trace immediately. Fix the root cause rather than guessing or applying speculative patches.
3. **Never Repeat Blind Failures**:
   - Never execute the identical failing command in a loop without modifying code or resolving the underlying dependency failure.

---

## 3. Minimal Surgical Diffs
1. **Preserve Code Formatting & Comments**:
   - Preserve all existing code formatting, comments, licenses, and docstrings unrelated to your immediate task.
2. **Targeted Replacement**:
   - Use targeted edit tools (`replace_file_content` or `multi_replace_file_content`) instead of overwriting whole files whenever possible.
3. **Zero Accidental Refactoring**:
   - Do not reformat untouched functions or change style conventions outside the scope of the requested change.

---

## 4. Self-Healing & Traceback Analysis
1. **Traceback Parsing**:
   - Extract exact file paths, line numbers, and error codes from compiler tracebacks.
2. **Targeted Reproduction**:
   - Craft minimal reproduction test cases before applying large structural alterations.
3. **Clean Teardown**:
   - When running scratch test scripts or temporary directories, ensure exit traps cleanly remove test artifacts.

---

## 5. Progressive Disclosure Discipline
1. **Context Efficiency**:
   - Keep conversation context lean. Rely on on-demand skills in `skills/` and reference documents in `references/`.
2. **Cache-Friendly Structures**:
   - Structure prompt headers and system guidelines deterministically to maximize Gemini 3.8 prefix caching (~75% cost savings).
3. **Modular Plugin Separation**:
   - Keep domain rules, skills, and hooks encapsulated in their respective namespaces.

---

## 6. Defensive Boundary Validation & Idempotency
1. **Input Sanitization**:
   - Validate and normalize all paths, CLI flags, and JSON payloads at system boundaries.
2. **Idempotent Operations**:
   - Ensure setup, install, and update commands can run repeatedly without duplicating configuration entries or corrupting files.
3. **Safe Execution**:
   - Never execute destructive shell operations (`rm -rf *`, `git reset --hard`) with unvalidated wildcard expansions.
