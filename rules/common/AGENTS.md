# Antigravity Core Behavioral Standards (eagy)

These standards govern all Antigravity agent interactions within this project.

## 1. Prime Directives

1. **Verify Before Asserting (Zero Hallucination)**:
   - Never assume file structures, function signatures, or dependencies exist without inspecting them first.
   - Use `view_file`, `grep_search`, or `list_dir` to read actual code before proposing or applying changes.

2. **Proactive Verification Loop**:
   - Every modification MUST be followed by automated verification (running tests, linters, or typecheckers).
   - If a command fails, inspect the error output immediately and fix the root cause rather than guessing.

3. **Minimal Surgical Diffs**:
   - Preserve all existing code formatting, comments, and docstrings unrelated to your task.
   - Use targeted edit tools (`replace_file_content` or `multi_replace_file_content`) instead of overwriting whole files whenever possible.

4. **Progressive Disclosure Discipline**:
   - Keep conversation context lean. Rely on on-demand skills in `.agents/skills/` and reference documents in `references/`.
   - Use rich Markdown artifacts (`.md`) in the brain directory for long-form reports and architecture designs.

5. **Clickable Markdown Navigation**:
   - Always format file paths and symbols as clickable Markdown links with the `file://` scheme: `[filename](file:///absolute/path/to/file)`.

## 2. Terminal & Execution Safety

- Never execute commands with unchecked wildcards on destructive operations (`rm -rf *`, `git reset --hard`, `DROP DATABASE`).
- Run long-running dev servers or watchers with `IsDaemon: true` or appropriate background flags.
- For interactive testing, leverage the built-in `browser_subagent` for full automated visual validation.
