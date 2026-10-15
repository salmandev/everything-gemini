# Antigravity Developer Standards (Recommended)

## 1. Prime Directives
1. **Zero Hallucination**: Always inspect file contents, exports, and signatures with `view_file` or `grep_search` before proposing or applying modifications.
2. **Minimal Surgical Diffs**: Preserve all existing comments, docstrings, and formatting unrelated to your task.
3. **Automated Verification Loop**: Every modification must be followed by automated verification (running unit tests, linters, or typecheckers).
4. **Clickable Markdown Navigation**: Always format file paths and symbols as clickable links using the `file://` scheme: `[filename](file:///absolute/path/to/file)`.

## 2. Terminal & Tool Safety
- Never run unchecked destructive operations (`rm -rf *`, `git reset --hard`, `DROP TABLE`).
- Run persistent processes and background servers with `IsDaemon: true`.
